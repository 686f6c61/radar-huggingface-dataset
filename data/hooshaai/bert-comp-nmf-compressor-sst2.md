# Hooshaai/bert-comp-nmf-compressor-sst2

## Resumen

`bert-comp-nmf-compressor-sst2` es un checkpoint de BERT-Base comprimido físicamente y posteriormente "curado" con LoRA, publicado por el usuario Hooshaai dentro del zoo de modelos comprimidos de la librería NeuralOps. Parte de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado en GLUE SST-2 y lo reduce mediante el motor `NMFCompressor` (familia `low_rank`), que descompone las magnitudes de las capas lineales en factores no negativos de bajo rango preservando el patrón de signo del peso original.

El checkpoint serializado corresponde al rango de Pareto `k=256`, que reduce el recuento de parámetros un 38,79 % (67.016.450 parámetros, ratio de compresión físico de 1,634x). Para recuperar parte de la precisión perdida por la compresión, NeuralOps aplica un "healing" con LoRA de rango `r=8` (50 pasos, `lr=2e-4`, presupuesto de 45 s), que eleva la exactitud en SST-2 del 69,61 % en zero-shot al 81,19 % final, frente al 91,63 % del profesor sin comprimir.

Su relevancia es metodológica más que de producto: es un ejemplo reproducible de compresión de bajo rango con recuperación LoRA sobre una arquitectura transformer pequeña, útil para investigadores que estudian el compromiso entre ratio de compresión y degradación downstream. No es un modelo generativo ni un modelo de propósito general: es un clasificador binario de sentimiento en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta 768; compresión de capas lineales mediante NMF de bajo rango (`NMFCompressor`) |
| Parametros totales | 67.016.450 (checkpoint comprimido, `k=256`); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | no disponible (el repo empaqueta pesos en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizador `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo base es BERT-Base uncased, un transformer encoder de 12 capas y 768 de dimensión oculta, afinado previamente para clasificación de sentimiento binaria en GLUE SST-2 (tarea de clasificación de texto, `num_labels=2`). Sobre ese checkpoint, NeuralOps aplica `NMFCompressor`, que descompone las magnitudes de las matrices de las capas lineales en factores no negativos de bajo rango (`k=256`) conservando el signo del peso original. La compresión es física: el recuento de parámetros baja a 67.016.450, un 38,79 % menos y un ratio de 1,634x.

Cuando la compresión zero-shot degrada la exactitud más de 2,0 puntos con una reducción superior a 1,10x, la librería aplica un healing LoRA dirigido de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 s. El autor documenta la evaluación multi-rango (`k=256, 128, 64, 32`) sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. No se documentan en la información disponible los datos de preentrenamiento, el volumen de tokens, ni si hubo RLHF/DPO (no aplicable a un clasificador de este tipo).

## Capacidades

- Clasificación binaria de sentimiento (negativo/positivo) en inglés, con dos etiquetas de salida.
- Compresión de bajo rango físicamente serializada, con factores y adaptadores LoRA de healing integrados en el state dict.
- Carga mediante `neuralops.hub.load_surgeried_model` en una sola llamada, o reconstrucción manual del topology comprimido con `compress_model` y `load_state_dict(strict=False)`.
- Telemetría de compresión legible por máquina en `compression_summary.json` para los rangos `[256, 128, 64, 32]`.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo "thinking".
- Capacidad multilingüe: limitada al inglés (el vocabulario es el de `bert-base-uncased`).
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto: el modelo recibe un texto corto en inglés y devuelve la polaridad; es adecuado por su bajo coste computacional (67 M de parámetros) frente al BERT-Base original.
- Filtrado de comentarios en foros y comunidades: se puede desplegar como paso de moderación para marcar mensajes negativos y priorizar revisión humana, con inferencia en CPU o GPU consumer.
- Investigación sobre compresión de modelos: sirve como referencia reproducible para comparar `nmf_compressor` con otras técnicas de bajo rango sobre una tarea estándar (SST-2) y un profesor conocido (91,63 %).
- Docencia y experimentación en pruning/low-rank: permite reconstruir el topology comprimido a partir del checkpoint y estudiar el efecto del rango `k` en la precisión (curva de Pareto documentada de `k=256` a `k=32`).
- Prototipado rápido de pipelines de clasificación con la API de NeuralOps: `load_surgeried_model` carga modelo y tokenizador en una línea, útil para validar ideas antes de invertir en modelos mayores.
- Evaluación de la técnica de LoRA healing: el par zero-shot (69,61 %) frente a healed (81,19 %) permite medir empíricamente la recuperación de precisión con `r=8` y 50 pasos.
- Clasificación por lotes de conjuntos de datos pequeños en inglés: con 872 muestras de validación como referencia, encaja en flujos de etiquetado asistido donde el throughput importa más que la precisión estado del arte.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false`), sobre GLUE SST-2 validation (872 muestras), evaluados en una RTX 3090 de 24 GB:

| Rank (`k`) | Ratio físico | Parámetros comprimidos (reducción) | Exactitud zero-shot | Exactitud healed | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| **256** (checkpoint publicado) | 1,63x | 67.016.450 (-38,8 %) | 69,61 % | **81,19 %** (LoRA) | -10,44 % |
| 128 | 2,39x | 45.782.786 (-58,2 %) | 51,61 % | 75,92 % (LoRA) | -15,71 % |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 50,92 % | 78,56 % (LoRA) | -13,07 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 50,92 % | 76,95 % (LoRA) | -14,68 % |

El profesor sin comprimir (`google-bert/bert-base-uncased` afinado en SST-2) alcanza 91,63 % de exactitud. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que no aplican a un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 289,9 MB (repo de 0,3 GB), por lo que la inferencia en fp32 requiere aproximadamente 0,3 GB de VRAM más activaciones; en fp16 o bf16 baja a unos 0,15 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo cabe holgadamente en tarjetas de 4-8 GB (RTX 3060, RTX 4060, GTX 1650).
- Cabe en CPU: con 67 M de parámetros es viable inferencia en CPU para lotes pequeños, aunque el throughput será menor.
- Opciones de despliegue: carga nativa con `transformers` (`BertForSequenceClassification`) más la reconstrucción del topology comprimido vía `neuralops`, o `load_surgeried_model` del hub de NeuralOps. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (el formato es `pytorch_model.bin`, no GGUF).
- Latencia y throughput estimados: no disponible; la model card solo indica un presupuesto de 45 s para el healing LoRA, no cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-nmf-compressor-sst2` (este) | 67.016.450 (comprimido) | no disponible | 81,19 % (healed) | MIT | Hugging Face, librería `neuralops` |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109.483.778 | 512 tokens (modelo base) | 91,63 % | Apache 2.0 (modelo base) | Hugging Face, `transformers` |
| Compresión a `k=128` (mismo zoo) | 45.782.786 | no disponible | 75,92 % (healed) | MIT | Hugging Face |
| Compresión a `k=32` (mismo zoo) | 29.857.538 | no disponible | 76,95 % (healed) | MIT | Hugging Face |

La comparativa más directa es con el profesor sin comprimir, que gana 10,44 puntos de exactitud a cambio de un 63 % más de parámetros. Frente a las variantes de mayor compresión del mismo zoo, `k=256` ofrece el mejor equilibrio precisión/tamaño documentado. No se dispone en la información proporcionada de comparaciones con DistilBERT, ALBERT u otros modelos comprimidos de terceros.

## Limitaciones y advertencias

- Degradación de precisión: 81,19 % frente al 91,63 % del profesor, una pérdida de 10,44 puntos; inaceptable para producción donde se exija paridad con el modelo original.
- Solo inglés: el vocabulario y los datos de afinado son ingleses; el rendimiento en otros idiomas no está evaluado y previsiblemente será pobre.
- Tarea única: clasificación binaria de sentimiento; no sirve para generación, razonamiento, código ni otras tareas sin reentrenamiento.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, sarcásticos o de dominio distinto de SST-2 (reseñas de cine).
- Métricas no verificadas: el resultado de 81,19 % está marcado como `verified: false` en la model card; conviene reproducirlo antes de confiar en él.
- Dependencia de la librería `neuralops`: la carga requiere reconstruir el topology comprimido con `compress_model` y `load_state_dict(strict=False)`; un `from_pretrained` estándar de `transformers` no cargará el checkpoint directamente.
- Repositorio de bajas descargas (46) y sin likes: poca validación por parte de la comunidad, lo que reduce la confianza en la reproducibilidad.
- Licencia MIT: permisiva para uso comercial, pero cubre el checkpoint publicado; el modelo base `bert-base-uncased` mantiene su propia licencia Apache 2.0, que debe respetarse igualmente.
- El ratio de compresión real (1,634x) es modesto; si el objetivo es reducir mucho el tamaño, las variantes `k=64` o `k=32` logran 3,11x y 3,67x, aunque con menor exactitud healed (78,56 % y 76,95 %).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-nmf-compressor-sst2
- Librería NeuralOps (repositorio): https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/nmf_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
