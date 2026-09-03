# Olyxee/FinIR-Intent

## Resumen

FinIR-Intent es un baseline determinista de compilación de intenciones financieras, desarrollado por Olyxee como parte del ecosistema FinIR. No se trata de un modelo de lenguaje entrenado, sino de un compilador basado en reglas fijas y totalmente offline que transforma instrucciones financieras en lenguaje natural en un contrato JSON canónico versionado (FinIR Intent Contract v1.0). El objetivo es separar la interpretación del lenguaje de la ejecución financiera: el modelo solo produce el sobre estructurado, y el runtime FinIR valida y ejecuta la operación, evitando que un sistema de IA invente números o cometa errores de unidades o divisas.

El repositorio contiene código Python (paquete `finir_intent`) sin pesos neuronales, con licencia Apache 2.0 y soporte para el idioma inglés. Es relevante porque establece una línea base medible para decidir si un futuro ajuste fino de un modelo pequeño abierto aporta mejoras significativas. La arquitectura es un sistema de emparejamiento de patrones (pattern-matching) que implementa la misma interfaz `finir.intent.IntentCompiler` que usaría un compilador basado en LLM, lo que permite comparar ambos enfoques de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compilador basado en reglas (pattern-matching), sin red neuronal |
| Parametros totales | No disponible (no hay pesos; es codigo Python) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesa instrucciones completas, sin ventana de contexto) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (codigo fuente Python, paquete instalable via pip) |

## Arquitectura y entrenamiento

FinIR-Intent no es un transformer ni un modelo de lenguaje. Es un compilador determinista implementado en `src/finir_intent/baseline.py`, sin dependencias externas, que no requiere red ni llamadas a APIs. Utiliza un conjunto fijo de reglas de emparejamiento de patrones para mapear una instrucción financiera en lenguaje natural a un contrato JSON estructurado. No hay entrenamiento: no se han utilizado datos de entrenamiento, RLHF ni DPO. La innovación técnica radica en la separación estricta entre interpretación y ejecución: el paquete solo produce el sobre de intención, y el runtime FinIR (`finir.intent.execute_intent`) es la única autoridad para validar y ejecutar la operación. El esquema del contrato es propiedad del paquete `finir` y este paquete lo consume sin redefinirlo.

## Capacidades

- Mapeo de instrucciones financieras en lenguaje natural a un contrato JSON canónico (FinIR Intent Contract v1.0).
- Soporte de cinco operaciones: `relative_change`, `set`, `absolute_change`, `range` y `scenarios`.
- Reconocimiento de once objetivos financieros: `revenue`, `cogs`, `opex`, `payment_terms`, `accounts_payable`, `inventory`, `capex`, `debt`, `interest_rate`, `cash`, `price`, `volume`.
- Detección de ambigüedad: si una instrucción no tiene cantidad parseable o contiene lenguaje vago, devuelve `status: "ambiguous"` sin inventar ningún número.
- Detección de operaciones conflictivas sobre un mismo objetivo (p. ej. "aumentar ingresos un 5% y también recortarlos un 10%") → `ambiguous`.
- Clasificación de instrucciones fuera de dominio (adquisiciones, fusiones, contrataciones, OPV, litigios, recompra de acciones, quiebra) como `unsupported`.
- Transcripción fiel de instrucciones semánticamente inválidas (p. ej. una divisa que no usa el objetivo, o una unidad `days` sobre un objetivo monetario) sin corregirlas; el runtime FinIR las rechaza en ejecución.
- Sin cómputo financiero: no realiza ningún cálculo, solo produce el sobre estructurado.
- Totalmente offline, reproducible y sin dependencias de red.

## Casos de uso

- **Validación de intenciones financieras en asistentes de IA**: un sistema conversacional puede usar FinIR-Intent para convertir peticiones como "aumenta los ingresos un 8%" en un contrato JSON validado, evitando que el LLM subyacente genere números arbitrarios.
- **Preprocesamiento para análisis what-if**: antes de ejecutar un escenario financiero, el compilador normaliza la instrucción del usuario a un formato canónico que el runtime FinIR puede evaluar con reutilización incremental dependiente.
- **Capa de seguridad en pipelines de automatización financiera**: al separar la interpretación del lenguaje de la ejecución, se garantiza que ninguna operación se ejecute sin una validación estructural previa, reduciendo errores de unidades y divisas.
- **Benchmarking de compiladores de intenciones**: al implementar la misma interfaz que un futuro compilador basado en LLM, sirve como línea base para medir si el ajuste fino de un modelo pequeño aporta mejoras reales en cobertura y precisión.
- **Entrenamiento de datos sintéticos**: el baseline puede generar contratos de intención a partir de instrucciones de ejemplo, produciendo datos etiquetados para entrenar o evaluar modelos de lenguaje especializados en finanzas.
- **Integración en entornos sin GPU**: al ser un paquete Python sin dependencias, puede desplegarse en cualquier servidor o función serverless para normalizar peticiones financieras antes de pasarlas a un runtime de ejecución.

## Benchmarks y rendimiento

La model card menciona una evaluación sobre el conjunto FinIR-IntentBench, dividido en un subconjunto `core` (fraseo dentro de la distribución para la que está construido el conjunto de reglas) y un subconjunto `stress` (paráfrasis no vistas contra las que el baseline no fue ajustado). Sin embargo, los resultados numéricos no se incluyen en la información proporcionada (el texto se corta en "Produce"). No se han publicado cifras concretas de exactitud, precisión o cobertura en la documentación disponible. Por tanto, no se pueden presentar tablas de benchmarks verificables.

## Requisitos de hardware

- No requiere GPU: es un paquete Python puro sin dependencias de cómputo numérico.
- Puede ejecutarse en cualquier CPU, incluidos entornos serverless, contenedores ligeros o máquinas de bajo consumo.
- Memoria RAM estimada: inferior a 100 MB en ejecución típica (el paquete es pequeño y no carga pesos).
- Despliegue: instalación via `pip install finir-intent` (o `pip install -e ".[dev]"` para desarrollo), sin necesidad de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: del orden de microsegundos a milisegundos por instrucción, al ser un emparejamiento de patrones determinista sin inferencia neuronal.
- Throughput: limitado únicamente por la CPU y el tamaño de la instrucción; puede procesar cientos de miles de instrucciones por segundo en hardware moderno.

## Comparativa con modelos similares

No disponible. FinIR-Intent no es un modelo de lenguaje, sino un compilador basado en reglas. No existen alternativas comparables en el ecosistema de modelos de IA que ofrezcan exactamente esta funcionalidad (mapeo determinista de intenciones financieras a un contrato JSON validado). Los sistemas de extracción de intenciones basados en LLM (p. ej. ajuste fino de modelos como Llama o Mistral para clasificación de intenciones) no son directamente comparables porque no garantizan salidas estructuradas ni separación entre interpretación y ejecución.

## Limitaciones y advertencias

- No es un modelo entrenado: no generaliza a fraseos fuera de los patrones definidos en el conjunto de reglas. El subconjunto `stress` del benchmark mide precisamente esta brecha de cobertura.
- Solo soporta inglés: las instrucciones en otros idiomas no serán procesadas correctamente.
- No realiza cómputo financiero: cualquier cálculo debe delegarse al runtime FinIR; el paquete solo produce el sobre de intención.
- No corrige errores semánticos: una instrucción con una divisa incorrecta o una unidad inapropiada se transcribe fielmente y el runtime la rechaza, lo que puede generar errores en producción si no se maneja adecuadamente.
- Alcance limitado de operaciones y objetivos: solo cinco operaciones y once objetivos predefinidos; instrucciones fuera de este alcance se clasifican como `unsupported`.
- Riesgo de ambigüedad no resuelta: el baseline devuelve `ambiguous` ante lenguaje vago, pero no ofrece mecanismos de aclaración interactiva.
- Licencia Apache 2.0 permite uso comercial, pero el paquete depende del runtime `finir` (también Apache 2.0), que debe instalarse por separado.
- No hay garantías de mantenimiento: es una versión 0.1.0 y el autor indica que el siguiente hito podría ser el ajuste fino de un modelo pequeño, lo que podría dejar este baseline sin soporte futuro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Olyxee/FinIR-Intent
- Repositorio GitHub de FinIR: https://github.com/Olyxee/finir
- Paquete PyPI: `finir` (runtime 0.1.0)
