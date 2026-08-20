# GermannM/kenga-prophet

## Resumen

Kenga Prophet es un predictor de siguiente token especifico para el lenguaje de programacion Kenga, desarrollado por GermannM como parte del proyecto kenga-lang. A diferencia de los grandes modelos de lenguaje genericos, este artefacto es un clasificador lineal softmax que estima `P(next_token | last_K_tokens)` sobre un vocabulario de 28 tokens (lexemas de Kenga mas `ID` y `NUM`), con una ventana de contexto de 8 tokens precedentes. Con apenas 6.300 pesos entrenables, el modelo se entrena sobre 154.000 tokens extraidos de 168 archivos fuente `.kenga` y alcanza una precision de prediccion de token del 21,4 % en 9 programas de test nunca vistos durante el entrenamiento.

La relevancia de este modelo es fundamentalmente metodologica: demuestra que un clasificador lineal de 0,006 millones de parametros puede capturar la estructura lexica de un lenguaje de programacion especifico mejor que un modelo de 27 B de parametros generico, que no ha sido preentrenado en el dialecto Kenga y cuya tasa de exito estructural en programas ejecutables Kenga es aproximadamente del 0 %. El modelo se distribuye bajo licencia Apache 2.0 y su inferencia se ejecuta en el binario bootstrap `kenga-lite.exe` sin necesidad de GPU ni de Rust.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal softmax (`P(next_token \| last_K_tokens)`) |
| Parametros totales | 6.300 pesos (28 × (8 × 28 + 1), escalados enteros ×1000) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8 tokens precedentes (K=8) |
| Tipos de cuantizacion | Pesos enteros con escala 1000 (no hay cuantizacion FP16/INT8) |
| Idiomas soportados | Ingles (en) en el corpus; solo tokens del lexico Kenga |
| Licencia | Apache 2.0 |
| Formato de pesos | Fichero de texto plano (`mid_prophet_m2_big_w.txt`) con cabecera `vocab=28 k=8 scale=1000` y 28 filas de pesos; tambien se distribuyen vocabulario, corpus de entrenamiento y test |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal que aproxima la distribucion condicional de siguiente token mediante una funcion softmax sobre una representacion concatenada de los ultimos 8 tokens. No emplea atencion, transformadores ni redes neuronales profundas; es un modelo puramente estadistico de n-gramas de orden 8 con pesos aprendidos. El entrenamiento se realiza con un script en Python (`tools/train_m2_big.py`) que usa unicamente numpy y tarda entre 1 y 2 minutos en hardware convencional. El corpus de entrenamiento consta de 154.000 tokens procedentes de 168 archivos fuente `.kenga` (repositorios `kenga/compiler`, `kenga/emit` y `examples/*`). El conjunto de test contiene 9 programas `kenga_seed_*.kenga` (factorial, fibonacci, max, mul, pow, sqr, sub, sum, add) nunca vistos durante el entrenamiento. No se aplicaron tecnicas de RLHF, DPO ni fine-tuning posterior.

## Capacidades

- Prediccion de siguiente token sobre el vocabulario Kenga (28 tokens: lexemas + `ID`/`NUM`).
- Captura de la estructura lexica del lenguaje Kenga sin ambiguedad gramatical en los tokens conservados.
- Generacion de texto a nivel de token, utilizable como autocompletado de codigo Kenga basico.
- No soporta tool calling, function calling, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue: no aplica; el modelo solo conoce el lexer Kenga.
- No dispone de modo de pensamiento ni de decodificacion especulativa.

## Casos de uso

- Autocompletado de codigo fuente Kenga en editores o entornos de desarrollo: el modelo puede sugerir el siguiente token lexico en funcion de los 8 tokens anteriores, ayudando a escribir programas Kenga con menos errores de sintaxis.
- Validacion estructural de programas Kenga: al predecir la secuencia de tokens, puede detectar desviaciones respecto a la distribucion del corpus y marcar posibles errores de lexico.
- Generacion de programas de ejemplo Kenga: a partir de una semilla inicial, el modelo puede producir cadenas de tokens que respetan la gramatica de Kenga, aunque con una tasa de exito limitada (21,4 % de tokens correctos).
- Ensenanza de la gramatica de Kenga: como herramienta didactica para mostrar como un clasificador lineal captura regularidades sintacticas de un lenguaje pequeno.
- Benchmark de comparacion de arquitecturas: sirve como baseline de minima complejidad para medir el rendimiento de modelos mayores sobre el mismo corpus Kenga.
- Integracion en el pipeline de compilacion de Kenga: puede usarse como preprocesador para completar tokens o detectar anomalias en la entrada antes de la fase de parseo.
- Estudio de aprendizaje de lenguajes especificos: permite analizar cuantos tokens y pesos son necesarios para aprender la estructura de un lenguaje de programacion concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM general y no esta disenado para esas tareas. Los unicos resultados publicados son la precision de prediccion de token sobre el conjunto de test held-out:

| Programa | Tokens correctos / total | Precision |
|---|---|---|
| kenga_seed_add | 19/88 | 21,6 % |
| kenga_seed_fact | 14/62 | 22,6 % |
| kenga_seed_fib | 10/55 | 18,2 % |
| kenga_seed_max | 21/88 | 25,0 % |
| kenga_seed_mul | 16/82 | 20,7 % |
| kenga_seed_pow | 15/68 | 22,1 % |
| kenga_seed_sqr | 13/68 | 19,1 % |
| kenga_seed_sub | 16/82 | 20,7 % |
| kenga_seed_sum | 26/104 | 25,0 % |
| **Total** | **149/697** | **21,4 %** |

## Requisitos de hardware

- VRAM estimada para inferencia: 0 (no requiere GPU; inferencia en CPU).
- GPU recomendada: ninguna; se ejecuta en el binario bootstrap `kenga-lite.exe` de Kenga.
- Cabe en cualquier hardware consumer, incluso en sistemas embebidos o microcontroladores.
- Opciones de despliegue: mediante el comando `bootstrap\bin\kenga-lite.exe run examples\ml\mid_prophet_m2_run.kenga`; no se soporta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado mediciones, pero al ser un clasificador lineal con 6.300 pesos, la inferencia es practicamente instantanea en cualquier CPU moderna.

## Comparativa con modelos similares

No hay disponible una comparativa directa con modelos de la misma categoria porque no existen modelos publicados especificamente para el lenguaje Kenga. Frente a modelos de lenguaje genericos de codigo (por ejemplo, CodeLlama 7B o StarCoder 15B), la comparativa es cualitativa:

| Modelo | Parametros | Contexto | Licencia | Rendimiento en Kenga |
|---|---|---|---|---|
| Kenga Prophet | 0,006 M | 8 tokens | Apache 2.0 | 21,4 % token-accuracy en 9 programas held-out |
| CodeLlama 7B | 7 B | 16k tokens | Llama 2 license | Estructural ≈ 0 % en dialecto Kenga (no preentrenado) |
| StarCoder 15B | 15 B | 8k tokens | OpenRAIL-M | Estructural ≈ 0 % en dialecto Kenga (no preentrenado) |

La comparativa refleja que el modelo pequeno supera a los grandes en cobertura lexica estructural del lenguaje Kenga, aunque no compite en capacidades generativas generales.

## Limitaciones y advertencias

- El conjunto de test es muy pequeno (9 programas, 697 tokens); el 21,4 % es una tendencia, no una calibracion sobre un benchmark amplio.
- El modelo es lineal y no puede modelar semantica profunda de Kenga; solo captura regularidades estadisticas de la secuencia de tokens.
- No soporta generacion de codigo complejo ni razonamiento; su salida puede ser no ejecutable o con errores lexicos frecuentes.
- La afirmacion "menor que un 27 B" se limita exclusivamente a la cobertura lexica estructural de un unico lenguaje de programacion, no es una afirmacion general sobre modelos de lenguaje.
- El corpus de entrenamiento es de un solo dialecto de Kenga; puede no generalizar a otros dialectos o variantes.
- No se ha evaluado su comportamiento fuera del corpus de Kenga; no produce texto en lenguaje natural.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es util fuera de su dominio especifico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/kenga-prophet
- Repositorio Kenga (GitHub): https://github.com/GermannM/kenga-lang
- Ejemplos del repositorio: https://github.com/GermannM/kenga-lang/tree/main/examples
- Documentacion interna de referencia: `docs/PICO_PROPHET.md`, `docs/NEUROMODEL_27B.md`, `tools/train_m2_big.py`, `examples/ml/mid_prophet_m2_run.kenga` (dentro del repositorio Kenga)
