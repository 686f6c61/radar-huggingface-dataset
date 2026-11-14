# Hooshaai/bert-comp-fwsvd-compressor-sst2

## Resumen

`Hooshaai/bert-comp-fwsvd-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante la técnica Fisher-Weighted SVD (FWSVD) implementada en la librería NeuralOps. Lo publica el usuario Hooshaai como parte de un "compressor zoo" que documenta el efecto de distintos niveles de compresión sobre el rendimiento downstream de BERT.

El modelo resuelve un problema práctico de ingeniería: reducir el coste de almacenamiento y cómputo de un clasificador BERT sin perder apenas precisión. En el rango de compresión seleccionado (`k=256`) se elimina un 8,61 % de los parámetros (de 109,48 M a 100,06 M) manteniendo una exactitud del 90,94 % en la validación de SST-2, frente al 91,63 % del modelo profesor original, es decir, una pérdida de solo 0,69 puntos.

Es relevante ahora porque ejemplifica una metodología reproducible de compresión post-entrenamiento (SVD ponderado por información de Fisher) aplicada a un transformer clásico, con telemetría completa de varios rangos de compresión y una receta de "curación" con LoRA cuando la degradación supera el 2 %. La arquitectura subyacente es un transformer encoder BERT-base de 12 capas y dimensión oculta 768, con contexto máximo de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), comprimido mediante FWSVD (SVD ponderado por Fisher) con `SVDLinear` en lugar de `nn.Linear` densas |
| Parametros totales | 100.058.882 (modelo comprimido, `k=256`); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de `bert-base-uncased`) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json` y `compression_summary.json` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, afinado previamente sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint se aplica el compresor `FWSVDCompressor` de NeuralOps, que factoriza cada matriz de pesos tras precondicionarla con la información empírica de Fisher (producto exterior de gradientes, `F = (1/M) Σ g_i g_iᵀ`) o con el blanqueamiento de la covarianza de activaciones (`C_X = (1/M) XᵀX + λI`). El resultado sustituye las capas densas por `SVDLinear` de rango truncado.

El rango seleccionado para el checkpoint publicado es `k=256`, que produce una ratio de compresión física de 1,094x y una reducción de parámetros del 8,61 %. Según la model card, en este rango no fue necesaria la "curación" con LoRA (Zero-Shot = 90,94 %, idéntico al resultado final). En rangos más agresivos (`k=128`, `64`, `32`) la degradación zero-shot supera el 2 % y se aplica LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 s) para recuperar parte de la precisión. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de la partición de validación de SST-2. No se detalla en la información disponible el volumen exacto de tokens de entrenamiento ni la composición completa del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos de hasta 512 tokens.
- Razonamiento semántico limitado a la tarea de clasificación: no es un modelo generativo ni de instrucciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (tokenizador `bert-base-uncased`).
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Inferencia estándar de transformer encoder: produce logits de dos clases por secuencia.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificación binaria de opiniones en inglés con un modelo de 100 M de parámetros que cabe en CPU y GPU de gama baja, adecuado para procesar lotes grandes de reseñas históricas.
- Moderación de comentarios en foros y redes: filtro previo de toxicidad/negatividad usando la salida de la clase negativa como señal de escalado a revisión humana, con latencia baja gracias al tamaño reducido.
- Enrutamiento de tickets de soporte: clasificar el tono del cliente (positivo/negativo) para priorizar colas de atención, aprovechando el contexto de 512 tokens para correos completos.
- Monitorización de marca en redes sociales: pipeline de ingesta que clasifica menciones en inglés y agrega métricas de sentimiento por periodo, con coste de inferencia inferior al de BERT-base sin comprimir.
- Baseline de investigación en compresión de modelos: punto de comparación reproducible para estudiar el compromiso precisión/compresión con FWSVD frente a otras técnicas (magnitude pruning, quantization, destilación).
- Extracción de características para clasificadores downstream: uso del encoder comprimido como extractor congelado en tareas de NLP en inglés donde el ahorro de memoria (8,6 % menos parámetros) permite desplegar más instancias por GPU.
- Evaluación de pipelines de MLOps: servir como artefacto de prueba en sistemas que cargan modelos vía `neuralops.hub.load_surgeried_model` o `compress_model`, validando la reconstrucción de topologías comprimidas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Rank (`k`) | Ratio de compresion | Parametros comprimidos (reduccion) | Exactitud zero-shot | Exactitud con LoRA | Diferencia vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| **256** (publicado) | 1,09x | 100.058.882 (-8,6 %) | 90,94 % | 90,94 % | -0,69 % |
| 128 | 1,21x | 90.615.554 (-17,2 %) | 80,50 % | 86,47 % | -5,16 % |
| 64 | 1,27x | 85.893.890 (-21,5 %) | 66,17 % | 80,28 % | -11,35 % |
| 32 | 1,31x | 83.533.058 (-23,7 %) | 56,88 % | 79,13 % | -12,50 % |

Métrica principal del checkpoint publicado: exactitud de 90,94 % en la partición de validación de GLUE SST-2 (872 muestras), evaluada en RTX 3090. No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, que además no aplican a un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el checkpoint ocupa aproximadamente 191 MB de pesos (según la model card), por lo que cabe holgadamente en cualquier GPU con más de 1 GB de VRAM libre; en FP16 se reduce a unos 200 MB incluyendo buffers.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; para evaluación a escala se usó una NVIDIA GeForce RTX 3090 (24 GB), pero también funciona en RTX 4090, A100, H100, T4 o incluso GPUs de portátil.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, etc.).
- Opciones de despliegue: el checkpoint se distribuye como `pytorch_model.bin` y requiere la librería NeuralOps para reconstruir la topología comprimida (`compress_model` + `load_state_dict`). No se han publicado variantes GGUF, ONNX ni compatibles con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al tratarse de un BERT-base con un 8,6 % menos de parámetros, se espera un throughput ligeramente superior al del modelo original, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud SST-2 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `Hooshaai/bert-comp-fwsvd-compressor-sst2` (k=256) | 100,06 M | 512 | 90,94 % (validacion) | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor) | 109,48 M | 512 | 91,63 % (validacion, segun el autor) | Apache 2.0 | Hugging Face, transformers |
| BERT-base afinado en SST-2 (referencia GLUE) | ~110 M | 512 | ~92-93 % (cifras publicas de GLUE, no verificadas en esta ficha) | Apache 2.0 | Hugging Face |
| DistilBERT-base afinado en SST-2 | ~66 M | 512 | ~91-92 % (cifras publicas, no verificadas en esta ficha) | Apache 2.0 | Hugging Face |

La comparación directa más justa es con el propio BERT-base profesor: el checkpoint comprimido sacrifica 0,69 puntos de exactitud a cambio de un 8,6 % menos de parámetros y un 8,3 % menos de peso en disco. Frente a DistilBERT, el modelo comprimido es más grande pero conserva la arquitectura BERT completa, lo que facilita la integración con código existente de `transformers`.

## Limitaciones y advertencias

- Solo clasifica sentimiento binario en inglés; no es un modelo generativo ni de instrucciones, por lo que no debe usarse para tareas fuera de la clasificación.
- El tokenizador `bert-base-uncased` no cubre idiomas distintos del inglés y el modelo no ha sido entrenado para ellos.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí puede producir clasificaciones erróneas en dominios alejados de SST-2 (reseñas de películas): el rendimiento en otros corpus no está documentado.
- Sesgos heredados de BERT-base y de SST-2: posibles sesgos demográficos, de dominio y de estilo lingüístico presentes en los datos de entrenamiento originales.
- La licencia MIT del checkpoint no exime de las obligaciones de la licencia Apache 2.0 del modelo base `google-bert/bert-base-uncased`; conviene revisar ambas antes de uso comercial.
- El checkpoint requiere la librería NeuralOps y una reconstrucción manual de la topología comprimida (`compress_model` con `fwsvd_compressor` y `rank=256`) antes de cargar los pesos; no es cargable directamente con `AutoModelForSequenceClassification.from_pretrained`.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no han sido reproducidos de forma independiente.
- El repositorio tiene 46 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- Los rangos de compresión más agresivos (`k=128`, `64`, `32`) muestran degradaciones severas (hasta -12,5 puntos) incluso tras LoRA, por lo que no se recomienda usar variantes más comprimidas sin reevaluar en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-fwsvd-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor FWSVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/fwsvd_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
