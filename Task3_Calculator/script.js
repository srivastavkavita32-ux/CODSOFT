const inputDisplay = document.getElementById('input');
const historyDisplay = document.getElementById('history');

let currentInput = '0';
let liveCalculation = '';
let isResetRequired = false;

// Append digits to the display
function appendNumber(number) {
    if (currentInput === '0' || isResetRequired) {
        currentInput = number;
        isResetRequired = false;
    } else {
        currentInput += number;
    }
    updateDisplay();
    updateLivePreview();
}

// Append operators gracefully
function appendOperator(op) {
    if (isResetRequired) isResetRequired = false;
    
    const lastChar = currentInput.slice(-1);
    const operators = ['+', '-', '*', '/', '%'];

    // Prevent consecutive identical operators or change operator if clicked another one
    if (operators.includes(lastChar)) {
        currentInput = currentInput.slice(0, -1) + op;
    } else {
        currentInput += op;
    }
    updateDisplay();
}

function appendDecimal(dot) {
    if (isResetRequired) {
        currentInput = '0.';
        isResetRequired = false;
        updateDisplay();
        return;
    }

    // Split expression by operators to get the current working number block
    const parts = currentInput.split(/[\+\-\*\/%]/);
    const currentNumber = parts[parts.length - 1];

    if (!currentNumber.includes('.')) {
        currentInput += dot;
    }
    updateDisplay();
}

function clearScreen() {
    currentInput = '0';
    liveCalculation = '';
    historyDisplay.innerText = '';
    updateDisplay();
}

function backspace() {
    if (isResetRequired) {
        clearScreen();
        return;
    }
    
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
    updateLivePreview();
}

// Safely computes the math expression string
function safeEval(str) {
    try {
        // Clean and validate tokens before executing
        const sanitized = str.replace(/[^-()\d/*+.%]/g, '');
        // Function constructor handles math evaluations isolated from scope safely
        const result = new Function(`return ${sanitized}`)();
        
        if (result === Infinity || isNaN(result)) return 'Error';
        
        // Fix floating point issues (e.g., 0.1 + 0.2 = 0.30000000004)
        return Number(parseFloat(result.toFixed(10)));
    } catch {
        return '';
    }
}

function updateLivePreview() {
    const lastChar = currentInput.slice(-1);
    const operators = ['+', '-', '*', '/', '%'];

    // Don't calculate preview if it ends with an operator
    if (!operators.includes(lastChar) && currentInput !== '0') {
        const preview = safeEval(currentInput);
        historyDisplay.innerText = preview !== '' ? preview : '';
    }
}

function calculate() {
    if (currentInput === '0') return;

    const result = safeEval(currentInput);
    if (result !== '') {
        historyDisplay.innerText = currentInput + ' =';
        currentInput = result.toString();
        isResetRequired = true; // Next number press will clear the calculated total
        updateDisplay();
    }
}

function updateDisplay() {
    // Map internal codes to beautiful UI symbols
    let formattedDisplay = currentInput
        .replace(/\*/g, ' × ')
        .replace(/\//g, ' ÷ ')
        .replace(/\+/g, ' + ')
        .replace(/\-/g, ' − ');
    
    inputDisplay.innerText = formattedDisplay;
}

// --- BONUS: Keyboard Support ---
window.addEventListener('keydown', (e) => {
    const key = e.key;
    
    if (key >= '0' && key <= '9') appendNumber(key);
    if (key === '.') appendDecimal(key);
    if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') appendOperator(key);
    if (key === 'Enter' || key === '=') { e.preventDefault(); calculate(); }
    if (key === 'Backspace') backspace();
    if (key === 'Escape') clearScreen();
});