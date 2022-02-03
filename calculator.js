// const axios = require('axios').default;

// =================== DOM CREATION ===================

const main = document.querySelector('main')

main.insertAdjacentHTML("afterbegin", `
 <input type="text" title="Calculation display" class="calculation-display" disabled>
 <input type="text" title="Result display" class="result-display" disabled>
 
 <button class="undo backspace" title="Backspace">←</button>
 <button class="undo clear" title="Clear">C</button>
 <button class="converter weight kg" title="kg to pounds converter">kg > lbs</button>
 
 <button class="operator power" title="Power sign" data-operator="^">x²</button>
 <button class="operator squareroot" title="Square root sign" data-operator="√">√</button>
 <button class="operator opening-bracket" title="Opening bracket" data-operator="(">(</button>
 <button class="operator closing-bracket" title="Closing bracket" data-operator=")">)</button>
 <button class="converter weight lbs" title="kg to pounds converter">lbs > kg</button>
 
 <button class="number seven" title="Seven">7</button>
 <button class="number eight" title="Eight">8</button>
 <button class="number nine" title="Nine">9</button>
 <button class="operator divide" title="Divider sign" data-operator="/">÷</button>
 <button class="converter currency eur" title="EUR to USD converter">€ > $</button>
 
 <button class="number four" title="Four">4</button>
 <button class="number five" title="Five">5</button>
 <button class="number six" title="Six">6</button>
 <button class="operator multiple" title="Multiplication sign" data-operator="*">×</button>
 <button class="converter currency usd" title="EUR to USD converter">$ > €</button>
 
 
 <button class="number one" title="One">1</button>
 <button class="number two" title="Two">2</button>
 <button class="number three" title="Three">3</button>
 <button class="operator minus" title="Minus sign" data-operator="-">−</button>
 <button class="converter temperature celsius" title="Celsius to Fahrenheit converter">°C > °F</button>
 
 <button class="point" title="Decimal point">.</button>
 <button class="number zero" title="Zero">0</button>
 <button class="equal" title="Equal sign">=</button>
 <button class="operator plus" title="Plus sign" data-operator="+">+</button>
 <button class="converter temperature fahrenheit" title="Fahrenheit to Celsius converter">°F > °C</button> 
`)

main.insertAdjacentHTML('afterend', `
 <section class="logs-container">
    <h2>Previous calculations:</h2>
    <ul reversed class="logs"></ul>
 </section>
`)

// =============== DOM SELECTION =================

const logsContainer = document.querySelector('.logs-container')
const logs = document.querySelector('.logs')

const [ display, calculation ] = [ 
    document.querySelector('.result-display'),
    document.querySelector('.calculation-display')
]

const buttons = document.querySelectorAll('button')
const numbers = document.querySelectorAll('.number')
const operators = document.querySelectorAll('.operator')

const point = document.querySelector('.point')
const equal = document.querySelector('.equal')
const backspace = document.querySelector('.backspace')
const clear = document.querySelector('.clear')

const convertersButtons = document.querySelectorAll('.converter')


// ================= EVENT LISTENERS =================

// Initializing some necessary variables
let lastKeyPressed
let lastKeyPressedIsEqual = false
let calculationIndex
let previousCalculations = []
const operatorsRegex = /[+÷×−(^√]$/

// ============== Clicks ==============

buttons.forEach(button => {
    button.addEventListener('click', () => button.classList.contains('equal') ? '' : lastKeyPressedIsEqual = false)

    // Add an inset outline effect on pressing the keys
    button.addEventListener('mousedown', () => button.style.outline = '1px inset')
    button.addEventListener('mouseup', () => button.style.outline = '')
})

numbers.forEach(number => {
    number.addEventListener('click', () => handleNumber(number.textContent))
})

point.addEventListener('click', () => handleNumber('.'))

operators.forEach(operator => {
    operator.addEventListener('click', () => displayOperator(operator.dataset.operator))
})

equal.addEventListener('click', () => handleEqual())
backspace.addEventListener('click', () => eraseCharacter())
clear.addEventListener('click', () => clearDisplay())

// Converters
convertersButtons.forEach(converterButton => {
    converterButton.addEventListener('click', () => converter(converterButton.classList[1], converterButton.classList[2], computeResult(display.value)))
})

// ============ Keys ==============

document.body.addEventListener('keydown', (e) => {     
    // Numbers & floating point
    if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4' || e.key === '5' || e.key === '6' || e.key === '7' || e.key === '8' || e.key === '9' || e.key === '0' || e.key === '.') {
        handleNumber(e.key)
    }
    
    // Operators & brackets
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '(' || e.key === ')' || e.key === '^') {
        displayOperator(e.key, e)
    }

    // If the previous key pressed was Enter or '=', reset
    if (lastKeyPressedIsEqual === true) {
        lastKeyPressedIsEqual = false
    }

    if (e.key === '=' || e.key === 'Enter') handleEqual(e)
    if (e.key === 'Backspace') eraseCharacter()
    if (e.code === 'KeyC') clearDisplay()

    // Navigate through the previous calculations with the arrows
    if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (previousCalculations.length !== 0 && calculationIndex !== 0) {
            if (lastKeyPressed === 'ArrowUp' || (lastKeyPressed === 'ArrowDown' && calculationIndex !== undefined)) {
                calculationIndex -= 1
            } else {
                calculationIndex = previousCalculations.length - 1
            }
            display.value = previousCalculations[calculationIndex]
        }
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault()
        if ((lastKeyPressed === 'ArrowUp' || lastKeyPressed === 'ArrowDown') && calculationIndex !== undefined) {
            if (calculationIndex >= previousCalculations.length - 1) {
                calculationIndex = undefined
                display.value = ''
            } else {
                calculationIndex += 1
                display.value = previousCalculations[calculationIndex]
            }
        }
    }

    lastKeyPressed = e.key
})

// ================== FUNCTIONS ====================

function computeResult(str){
    return Function('return ' + str)()
}

function addLog(calculus, result) {
    const log = document.createElement('li')
    log.textContent = `${calculus} = ${result}`
    logs.prepend(log)
}

// Handles the '.'. If there's already a '.' in the current number, don't add another one
function addFloatingPoint() {
    // If there's nothing before, or if the last character is an operator, add a 0 before
    if (display.value.length === 0 || display.value.search(operatorsRegex) !== -1) {
        display.value += '0.'
    } else if (display.value.search(/\./) >= 0) { // if there is already a '.' somewhere
        // if the last number since an operator does not already have a '.': print a '.'
        // in all other cases, we don't want to print the '.'
        if (display.value.search(/[.][0-9]*$/) === -1) {
            display.value += '.'
        }
    } else { // for the 1st number of the calculation
        display.value += '.'
    }
}

function handleEqual(event) {
    if (event) {
        event.preventDefault()
    }
    // if there is already an operator, but the last character was not an operator: calculate
    if (display.value.search(/[+−×÷√^]/) !== -1 && display.value.search(operatorsRegex) === -1) {
        // if there are brackets, check if there's an even number of opening & closing brackets; else, add the adequate number of closing brackets
        handleClosingBracket(true)
        // Add to the logs, both in JS (previousCalculations) and in the DOM (addLog())
        previousCalculations.push(display.value)
        calculation.value = display.value
        display.value = display.value.replace(/−−/g, '+').replace(/×/g, '*').replace(/−/g, '-').replace(/÷/g, '/') // Make sure the string is interpretable for computeResult()
        // Interpret the powers (^) & square roots for computeResult()
        interpretPower()
        interpretSquareRoot()
        display.value = computeResult(display.value)
        addLog(calculation.value, display.value)
        lastKeyPressedIsEqual = true
    } 
    // else, if the last key pressed was an operator, or if there's no log yet, or if the display doesn't reflect the last calculation: don't consider the key was pressed, so that the current number isn't erased
    else if (display.value.search(operatorsRegex) === -1 || !logs.firstElementChild || calculation.value + ' = ' + display.value !== logs.firstElementChild.textContent) {
        lastKeyPressedIsEqual = false
    } else {
        lastKeyPressedIsEqual = true
    }
}

/**
 * Handles the display of operators
 * @param {string} operator - +, -, /, *, ^, √, ( or )
 * @param {event object} [event] - default = undefined
 */
function displayOperator(operator, event = undefined) {
    if (event) {
        event.preventDefault() // disable Firefox's / quick search shortcut
    }
    // Do only if there's already something displayed
    if (display.value.length !== 0) {
        if (operator === '+') display.value.search(operatorsRegex) >= 0 ? '' : display.value += '+' // No + after any other operator
        if (operator === '*') display.value.search(operatorsRegex) >= 0 ? '' : display.value += '×' // No × after any other operator
        if (operator === '/') display.value.search(operatorsRegex) >= 0 ? '' : display.value += '÷' // No / after any other operator
        if (operator === '^') display.value.search(operatorsRegex) >= 0 ? '' : display.value += '^'
    }
    if (operator === '-') display.value += '−'
    if (operator === '(') handleOpeningBracket()
    if (operator === ')') handleClosingBracket()
    if (operator === '√') handleSquareRoot()
}

/**
 * Checks how the opening bracket should be displayed, depending on the last character entered
 */
function handleOpeningBracket() {
    if (lastKeyPressedIsEqual) {
        display.value = '('
    } else {
        // If the last character was a ) or a number, then add a × operator in between
        if (display.value.search(/\)$/) !== -1 || display.value.search(/[0-9]$/) !== -1) {
            display.value += '×('
        }
        // if the last character was a '.', remove it and add a × operator
        else if (display.value.search(/\.$/) !== -1) {
            display.value = display.value.replace(/\.$/, '')
            display.value += '×('
        }
        else {
            display.value += '('
        }
    }
}

/**
 * Checks if a closing bracket should be displayed or not, depending on opening brackets 
 * @param {boolean} [recursive] - if true, closes all the opened brackets
 */
function handleClosingBracket(recursive = false) {
    if (lastKeyPressedIsEqual) {
        display.value = ''
    } else {
        let numberOfOpeningBrackets = display.value.match(/\(/g) ? display.value.match(/\(/g).length : 0
        let numberOfClosingBrackets = display.value.match(/\)/g) ? display.value.match(/\)/g).length : 0
    
        // if there are brackets, check if there's an even number of opening & closing brackets; if so, do nothing, else, add the adequate number of closing brackets
        if (numberOfOpeningBrackets !== numberOfClosingBrackets) {
            if (recursive) {
                for (let i = 0; i < numberOfOpeningBrackets - numberOfClosingBrackets; i++) {
                    display.value += ')'
                }
            } else {
                display.value.search(operatorsRegex) >= 0 ? '' : display.value += ')' // No ) after any other operator
            }
        }
    }
}

/**
 * Handle what should be displayed if a number or a dot is pressed
 * @param {event object} e 
 */
function handleNumber(keyCode) {
    if (lastKeyPressedIsEqual === true) {
        if (keyCode === '0') display.value = ''
        else if (keyCode === '.' || keyCode === ',') display.value = '0.'
        else display.value = keyCode
    }
    else if (lastKeyPressed === ')' || display.value.search(/\)$/) !== -1) {
        if (keyCode === '.' || keyCode === ',') display.value += '×0.'
        else display.value += '×' + keyCode
    }
    else {
        if (keyCode === '0') display.value ? display.value += '0' : ''
        else if (keyCode === '.' || keyCode === ',') addFloatingPoint()
        else display.value += keyCode
    }
}

/**
 * Checks how the √ should be displayed, depending on the last character entered
 */
 function handleSquareRoot() {
    if (lastKeyPressedIsEqual) {
        display.value = '√'
    } else {
        // If the last character was a ) or a number, then add a × operator in between
        if (display.value.search(/\)$/) !== -1 || display.value.search(/[0-9]$/) !== -1) {
            display.value += '×√'
        }
        // if the last character was a '.', remove it and add a × operator
        else if (display.value.search(/\.$/) !== -1) {
            display.value = display.value.replace(/\.$/, '')
            display.value += '×√'
        }
        // if the last character was NOT already a √
        else if (display.value.search(/√$/) === -1) {
            display.value += '√'
        }
    }
}   

function eraseCharacter() {
    display.value = display.value.replace(/.$/, '')
}

function clearDisplay() {
    display.value = ''
    calculation.value = ''
}

function interpretPower() {
    const getPowerBaseRegex = /(\(.+?\))$|([1-9.]+?)$/
    const getPowerExponentRegex = /^(\(.+?\))|^(−?[1-9.])+/

    if (display.value.search('^') !== -1) {
        let powerParts = display.value.split('^')
        for (let i = powerParts.length - 2; i >= 0; i--) {
            if (powerParts[i].search(getPowerBaseRegex) !== -1) {
                powerParts[i] = powerParts[i].replace(getPowerBaseRegex, `Math.pow(${powerParts[i].match(getPowerBaseRegex)[0]}, ${powerParts[i+1].match(getPowerExponentRegex)[0]})`)
                powerParts[i+1] = powerParts[i+1].replace(getPowerExponentRegex, '')
                powerParts[i] = powerParts[i] + powerParts[i+1]
                powerParts[i+1] = ''
            }
        }
        display.value = powerParts.join('')
    }
}

function interpretSquareRoot() {
    const getSqrtRegex = /^(\(.+?\))|^[1-9.]+?/

    if (display.value.search('√') !== -1) {
        let sqrtParts = display.value.split('√')
        for (let i = sqrtParts.length - 1; i > 0; i--) {
            sqrtParts[i] = sqrtParts[i].replace(getSqrtRegex, `Math.sqrt(${sqrtParts[i].match(getSqrtRegex)[0]})`)
        }
        display.value = sqrtParts.join('')
    }
}


/**
 * 
 * @param {str} type - weight, currency or temperature
 * @param {str} unit - unit from which the conversion needs to be made
 * @param {number} number - number to convert
 */
 function converter(type, unit, number) {
    let convertedNumber
    let unitSymbol
    let targetSymbol

    if (type === 'currency') {
        let targetCurrency = unit === 'eur' ? 'USD' : 'EUR'
        unitSymbol = unit === 'eur' ? ' €' : ' $'
        targetSymbol = unit === 'eur' ? ' $' : ' €'

        fetchCurrencyRate(unit.toUpperCase(), targetCurrency)
            .then(convertingRate => {
                return Math.round(number * convertingRate * 100) / 100
            })
            .then(getConvertedNumber => {
                calculation.value = display.value
                display.value = getConvertedNumber
                addLog(computeResult(calculation.value).toString() + unitSymbol, display.value + targetSymbol)
            })        
    } else {
        if (type === 'weight') {
            if (unit === 'kg') {
                convertedNumber = Math.round((number / 0.45359237) * 100) / 100
                unitSymbol = ' kg'
                targetSymbol = ' lbs'
            }
            if (unit === 'lbs') {
                convertedNumber = Math.round((number * 0.45359237) * 100) / 100
                unitSymbol = ' lbs'
                targetSymbol = ' kg'
            }
        }
        if (type === 'temperature') {
            if (unit === 'celsius') {
                convertedNumber = Math.round((number * 1.8 + 32) * 100) / 100
                unitSymbol = ' °C'
                targetSymbol = ' °F'
            }
            if (unit === 'fahrenheit') {
                convertedNumber = Math.round(((number - 32) / 1.8) * 100) / 100
                unitSymbol = ' °F'
                targetSymbol = ' °C'
            }
        }
        
        calculation.value = display.value
        display.value = convertedNumber
        addLog(computeResult(calculation.value).toString() + unitSymbol, display.value + targetSymbol)
    }
}


// function trimRows() {
//     if (display.scrollWidth > display.offsetWidth) {
//         let value = '...' + display.textContent;
//         while (display.scrollWidth > display.offsetWidth) {
//             value = '...' + value.slice(4);
//             display.textContent = value;
//         }
//     }
// }



// =============== API CURRENCY ===================

/**
 * 
 * @param {str} baseCurrency - length: 3
 * @param {str} targetCurrency - length: 3
 */
 async function fetchCurrencyRate(baseCurrency, targetCurrency) {
    return fetch(`https://freecurrencyapi.net/api/v2/latest?apikey=fe2c45e0-84cc-11ec-976b-a5d617b48883&base_currency=${baseCurrency.toUpperCase()}`)
      .then(response => {
        // indicates whether the response is successful (status code 200-299) or not
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        // console.log(data.data[targetCurrency.toUpperCase()])
        return JSON.parse(data.data[targetCurrency.toUpperCase()])
      })
      .catch(error => console.log(error))
}