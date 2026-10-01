# ilovemugi/mugi-decision-4b

## Resumen

Mugi Decision 4B es un modelo de puntuacion de candidatos derivado de Qwen3.5-4B, desarrollado por el usuario ilovemugi. No es un modelo generativo: en lugar de predecir vocabulario, incorpora una cabeza escalar compartida que recibe una descripcion de tarea y una lista de al menos dos candidatos, y devuelve una puntuacion escalar por candidato junto con su softmax dentro del conjunto evaluado. Su proposito es servir como componente de seleccion, ordenacion (reranking) y clasificacion en tareas de decision de opcion multiple.

El modelo se distribuye como pesos BF16 independientes con el adaptador LoRA ya fusionado, con 4.205.753.856 parametros y un tamano de repositorio de 8,4 GB. No requiere descargar el modelo base por separado ni aplicar el adaptador. Esta entrenado sobre un conjunto propio de 2.000.000 de preguntas (800.000 en chino, 800.000 en ingles y 400.000 repartidas entre 13 idiomas adicionales) y declara soporte para 15 idiomas.

Es relevante ahora porque propone un patron alternativo al prompting generativo para tareas de eleccion: en vez de pedir al modelo que "responda" con una opcion, se calcula una puntuacion relativa entre candidatos, lo que facilita el reranking, la evaluacion de alternativas y la integracion en pipelines de decision. La licencia Apache-2.0 permite uso comercial, aunque los pesos no incluyen el modulo de vision del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B con cabeza escalar compartida para puntuacion de candidatos (el backbone incorpora componentes DeltaNet) |
| Parametros totales | 4.205.753.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible; la longitud maxima de rama usada en entrenamiento e inferencia es 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16) |
| Idiomas soportados | zh, en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, th, vi (15 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, con pesos norm de DeltaNet en FP32) |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto de Qwen/Qwen3.5-4B (revision fijada 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) y sustituye la prediccion de vocabulario por una cabeza escalar compartida. La entrada se construye con un prefijo comun que contiene la descripcion y la lista completa de opciones, y cada rama anade la opcion concreta; el ultimo token valido de cada rama pasa por la cabeza compartida y produce una puntuacion. Se emplean seis tokens especiales independientes (`<|desc_begin|>`, `<|desc_end|>`, `<|enum_begin|>`, `<|enum_end|>`, `<|current_begin|>`, `<|current_end|>`). El backbone hereda componentes DeltaNet, cuyos pesos norm internos se mantienen en FP32 tras la fusion. No se incluyen los pesos de vision del modelo base.

El ajuste se realizo por LoRA con r=16, alpha=32 y dropout=0.05, entrenando simultaneamente la cabeza de puntuacion y las embeddings de los seis marcadores. El entrenamiento uso el conjunto mixed2000 de 2.000.000 de preguntas, BF16, 1 epoca, 125.000 actualizaciones, batch global de 16 y learning rate inicial de 5e-5, con validacion cada 5.000 pasos. El checkpoint seleccionado fue checkpoint-110000, elegido por exactitud de validacion ponderada segun la proporcion de idiomas de entrenamiento, sin usar el conjunto de test para la seleccion. El adaptador se fusiono posteriormente sobre el backbone en BF16.

## Capacidades

- Puntuacion de candidatos: dada una descripcion y un conjunto de al menos dos opciones, devuelve una puntuacion escalar por candidato y su softmax relativo dentro del conjunto.
- Seleccion y descarte de opciones en tareas de eleccion multiple.
- Reranking de listas de candidatos generados por otro sistema.
- Clasificacion y ordenacion como tarea de feature-extraction (pipeline declarado: text-classification).
- Cobertura multilingue en 15 idiomas: chino, ingles, arabe, aleman, espanol, frances, hindi, indonesio, italiano, japones, coreano, portugues, ruso, tailandes y vietnamita.
- Integracion con Transformers mediante codigo personalizado (`DecisionEncoder`, `AutoModel` con `trust_remote_code=True`).

No dispone de generacion de texto libre ni de respuestas de chat: la model card indica explicitamente que no genera respuestas conversacionales y que no debe invocarse `generate` ni plantillas de chat. No se declaran capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Reranking de respuestas generadas por un LLM: se genera un conjunto de respuestas candidatas con otro modelo y Mugi Decision 4B las puntua y ordena para seleccionar la mejor.
- Evaluacion de opciones en asistentes de decision: dado un problema descrito y varias alternativas, el modelo produce un ranking con puntuaciones relativas que puede consumirse directamente en la interfaz.
- Clasificacion por eleccion de etiqueta: tratando cada etiqueta como candidato, el modelo puntua cual encaja mejor con un texto de entrada, util para enrutado de tickets o categorizacion.
- Sistemas de recomendacion con candidatos discretos: cuando el conjunto de opciones es cerrado y acotado, el modelo puede puntuar y priorizar alternativas.
- Investigacion en evaluacion de modelos: el patron de puntuacion de candidatos permite medir la preferencia del modelo entre opciones de forma reproducible, con softmax comparable dentro del mismo conjunto.
- Filtrado de respuestas en pipelines de generacion aumentada: descartar candidatos de baja calidad antes de mostrarlos al usuario, usando la puntuacion escalar como umbral.
- Aplicaciones multilingues de seleccion: al cubrir 15 idiomas, puede emplearse como componente de decision en flujos con usuarios de distintos idiomas sin reentrenar por idioma.
- Analisis de decisiones en dominios con opciones bien definidas (soporte, triaje, formularios), siempre que las opciones se pasen como candidatos explicitos.

## Benchmarks y rendimiento

El autor publica resultados en un subconjunto de test congelado de 5.888 preguntas, BF16, orden de opciones fijo y sin filtrado en tiempo de ejecucion. Indica que no son puntuaciones de benchmarks oficiales.

| Modelo | Correctas / total | Exactitud total |
|---|---:|---:|
| Mugi Decision 2B | 4913 / 5888 | 83,4409% |
| Mugi Decision 4B | 5105 / 5888 | 86,7018% |

Desglose por idioma del modelo 4B:

| Idioma | Preguntas | Exactitud |
|---|---:|---:|
| chino (zh) | 1075 | 82,2326% |
| ingles (en) | 1485 | 80,3367% |
| arabe (ar) | 256 | 90,6250% |
| aleman (de) | 256 | 92,9688% |
| espanol (es) | 256 | 92,5781% |
| frances (fr) | 256 | 94,1406% |
| hindi (hi) | 256 | 88,6719% |
| indonesio (id) | 256 | 96,8750% |
| italiano (it) | 256 | 97,6562% |
| japones (ja) | 256 | 87,5000% |
| coreano (ko) | 256 | 77,3438% |
| portugues (pt) | 256 | 96,8750% |
| ruso (ru) | 256 | 87,8906% |
| tailandes (th) | 256 | 90,2344% |
| vietnamita (vi) | 256 | 89,4531% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que estos numeros corresponden al mejor adaptador antes de la fusion, no a los pesos fusionados reevaluados sobre las 5.888 preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 8,4 GB (4.205.753.856 parametros a 2 bytes por parametro); con activaciones y overhead se recomienda al menos 10-12 GB de VRAM.
- No se publican versiones cuantizadas (GGUF, GPTQ, AWQ, etc.), por lo que no hay estimaciones de VRAM para cuantizacion.
- GPU compatibles: tarjetas con 12 GB o mas pueden ejecutar el modelo; una RTX 4090 (24 GB), RTX 3090, A100 o H100 lo albergan con holgura. El autor valida CUDA y ROCm, usando `cuda` como nombre de dispositivo en ambos casos.
- Ejecucion en CPU: existe un modo `--device cpu`, pero el autor solo realizo comprobaciones de carga con entradas pequenas y no ofrece ninguna garantia de throughput.
- Opciones de despliegue: scripts propios del repositorio (`predict.py`, `DecisionEncoder`) con Transformers 5.17.0 y PyTorch 2.13.0, o bien `AutoModel.from_pretrained` con `trust_remote_code=True` y `attn_implementation="sdpa"`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Parametros de inferencia del script: BF16, forward completo por rama, 4 candidatos por lote por defecto, longitud maxima de rama 1024; las entradas que exceden ese limite provocan error en lugar de truncarse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud en test propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mugi Decision 4B | 4.205.753.856 | no disponible (rama max. 1024) | 86,7018% (5105/5888) | Apache-2.0 | Hugging Face, texto unicamente |
| Mugi Decision 2B | no disponible en esta informacion | no disponible | 83,4409% (4913/5888) | no disponible en esta informacion | Hugging Face |
| Qwen/Qwen3.5-4B | no disponible en esta informacion | no disponible | no aplica (modelo base generativo) | no disponible en esta informacion | Hugging Face |

No se dispone de datos comparativos con otros modelos de decision o reranking de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no debe usarse con `generate` ni plantillas de chat; no produce respuestas de texto.
- El softmax de salida es una distribucion relativa entre los candidatos presentes, no una probabilidad calibrada de acierto.
- Alterar el conjunto o el orden de candidatos cambia la entrada y, por tanto, las puntuaciones. La exactitud depende de la formulacion de las opciones.
- La longitud maxima de rama entrenada es 1024 tokens; no se ha verificado el comportamiento con secuencias mas largas y el script rechaza entradas que excedan el limite.
- No se incluyen los pesos de vision del modelo base, por lo que no hay capacidades de imagen ni evaluacion multimodal.
- Sesgos: no se documentan analisis de sesgo especificos. El modelo base y el corpus de entrenamiento pueden introducir sesgos; la model card advierte que los datos de preentrenamiento no son auditables por completo.
- Riesgo de contaminacion: el autor senala que la division y el deduplicado del proyecto no permiten descartar contaminacion de los datos de preentrenamiento.
- Diferencias de reproducibilidad: la fusion a BF16 y las variaciones de hardware y operadores introducen diferencias de redondeo; no se reevaluaron las 5.888 preguntas con los pesos fusionados, por lo que no se garantiza coincidencia exacta con la tabla publicada.
- Diferencias de exactitud por idioma: el rendimiento cae notablemente en coreano (77,3438%) e ingles (80,3367%) frente a italiano (97,6562%) o indonesio (96,8750%), lo que desaconseja asumir un rendimiento uniforme entre idiomas.
- Licencia: Apache-2.0 para el backbone y el codigo; los datos de entrenamiento conservan sus propias licencias y el modelo no otorga derecho a redistribuir el dataset completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilovemugi/mugi-decision-4b
- Version 2B: https://huggingface.co/ilovemugi/mugi-decision-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados de evaluacion: `eval_results.json` (en el repositorio)
- Verificacion de publicacion: `release_verification.json` (en el repositorio)
- Licencia: `LICENSE` (en el repositorio)
- Aviso de atribucion: `NOTICE` (en el repositorio)
