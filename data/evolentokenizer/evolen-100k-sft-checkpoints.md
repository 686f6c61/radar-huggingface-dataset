# EvoLenTokenizer/evolen-100k-sft-checkpoints

## Resumen

EvoLen-100K SFT checkpoints es un conjunto de 56 checkpoints de fine-tuning para clasificación de secuencias de ADN, generados a partir del modelo preentrenado EvoLen en el paso 100 000 (vocabulario de 5 120). El modelo está desarrollado por el equipo EvoLenTokenizer y acompaña al artículo *EvoLen: Evolution-Guided Tokenization for DNA Language Model*, aceptado en COLM 2026. Su relevancia radica en introducir un tokenizador de ADN guiado por evolución que combina estratificación por conservación (phyloP) con decodificación sensible a la longitud, mejorando el rendimiento en tareas genómicas downstream.

Cada checkpoint corresponde a una tarea específica de clasificación (regulación, expresión, cromatina, etc.) y se distribuye en carpetas separadas con los pesos en formato safetensors. La arquitectura subyacente es un transformer tipo BERT adaptado a genómica, aunque no se especifican el número total de parámetros ni la longitud de contexto en la documentación disponible. El repositorio ocupa 20,2 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT para clasificacion de secuencias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (model_max_length varia por tarea, recuperable desde training_args.bin) |
| Tipos de cuantizacion | fp16 (usado en entrenamiento), safetensors |
| Idiomas soportados | ADN (no aplica idiomas naturales) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base EvoLen es un transformer tipo BERT entrenado sobre secuencias de ADN. La innovacion principal reside en el tokenizador EvoLen, que particiona el genoma segun niveles de conservacion evolutiva (phyloP) y aplica una decodificacion sensible a la longitud para generar un vocabulario de 5 120 tokens. El preentrenamiento se realizo durante 100 000 pasos, y a partir de ese checkpoint se fine-tuning en 56 tareas de clasificacion downstream.

El fine-tuning se llevo a cabo con fp16, seleccionando el mejor checkpoint por F1 de validacion y evaluando posteriormente sobre test. Cada tarea tiene su propia longitud maxima de secuencia, almacenada en el archivo `training_args.bin`. El proceso de seleccion de hiperparametros se baso en el MCC maximo sobre test, lo que implica que los resultados reportados son un limite superior y no una estimacion imparcial. El entrenamiento con fp16 es no determinista, por lo que un reentrenamiento no reproduce exactamente los numeros publicados.

## Capacidades

- Clasificacion de secuencias de ADN en 56 tareas genomicas distintas, incluyendo prediccion de elementos reguladores, expresion genica, cromatina y regiones codificantes.
- Soporte de clasificacion multiclase, con hasta 8 clases en la tarea multi-SCREEN (por ejemplo, `['CA','CA-CTCF','CA-H3K4me3','CA-TF','PLS','TF','dELS','pELS']`).
- Tokenizacion especifica para ADN con vocabulario de 5 120 tokens, disenada para capturar informacion evolutiva.
- Reproducibilidad de resultados bajo condiciones estrictas: fp16 autocast, batch size 128, `model_max_length` por tarea y orden de etiquetas multiclase.
- No es un modelo generativo; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Prediccion de elementos reguladores: el modelo clasifica regiones como enhancers, promotores o elementos de cromatina, util para anotacion funcional de genomas.
- Clasificacion de regiones codificantes vs intergenicas: ayuda a identificar genes y regiones no codificantes en ensamblajes genomicos.
- Analisis de datos ATAC-seq: clasifica regiones de cromatina accesible, relevante en estudios de regulacion epigenetica.
- Anotacion de variantes: permite evaluar el impacto funcional de variantes en regiones regulatorias.
- Estudio de expresion genica: clasifica secuencias segun su nivel de expresion o tipo de tejido, apoyando investigacion en transcriptomica.
- Investigacion en genómica funcional: sirve como herramienta de clasificacion en pipelines de analisis de datos genomicos a gran escala.

## Benchmarks y rendimiento

Los resultados reportados en la model card reproducen la Tabla 1 del articulo, con la metrica MCC (Matthews Correlation Coefficient) multiplicada por 100. Se presentan por grupo de tareas:

| Grupo | n | MCC (x100) |
|---|---|---|
| GUE EMP | 10 | 46,81 |
| GUE Mou | 5 | 58,75 |
| GUE P3 | 3 | 78,52 |
| GUE PC | 3 | 63,61 |
| GUE Spl | 1 | 75,22 |
| GUE TF | 5 | 61,05 |
| GBM HR | 5 | 70,29 |
| GBM Inv | 3 | 76,14 |
| NT His | 10 | 54,95 |
| NT Enh | 2 | 49,62 |
| NT Pro | 3 | 76,50 |
| NT Spl | 3 | 67,81 |
| cCRE | 1 | 22,13 |
| ATAC | 1 | 13,30 |
| GBM ME | 1 | 63,84 |

Estos valores coinciden exactamente con los de la Tabla 1 del paper. No se incluyen comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 20,2 GB en safetensors, lo que sugiere un modelo de gran tamano (probablemente cientos de millones de parametros, aunque no se confirma).
- VRAM estimada: no disponible; para inferencia en fp16 se requeriria al menos 16-24 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no disponible.
- Opciones de despliegue: compatible con la libreria `transformers` mediante `AutoModelForSequenceClassification`; no se mencionan otros motores como vLLM u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El articulo menciona comparaciones con otros tokenizadores de ADN, pero no se detallan en la model card ni en los resultados de busqueda.

## Limitaciones y advertencias

- Los resultados reportados se obtuvieron mediante seleccion de modelo basada en test, por lo que constituyen un limite superior y no una estimacion imparcial del rendimiento real.
- El entrenamiento con fp16 es no determinista; un reentrenamiento desde el modelo base no reproduce exactamente los numeros publicados.
- Para reproducir los valores es imprescindible seguir condiciones especificas: fp16 autocast, batch size 128, `model_max_length` por tarea y orden de etiquetas multiclase.
- No se proporciona informacion sobre sesgos potenciales del modelo ni sobre su comportamiento en datos fuera de distribucion.
- Es un modelo de clasificacion, no generativo; no es adecuado para tareas de generacion de secuencias.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EvoLenTokenizer/evolen-100k-sft-checkpoints
- Articulo arXiv: https://arxiv.org/abs/2604.08698
- Codigo fuente: https://github.com/HN020719/EvoLen
- Modelo base: https://huggingface.co/EvoLenTokenizer/evolen-100k
- Control del tokenizador: https://huggingface.co/EvoLenTokenizer/base-100k
- Checkpoints en paso 200k: https://huggingface.co/EvoLenTokenizer/evolen-200k-sft-checkpoints
