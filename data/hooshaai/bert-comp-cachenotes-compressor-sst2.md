# Hooshaai/bert-comp-cachenotes-compressor-sst2

## Resumen

`bert-comp-cachenotes-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) fine-tuneado sobre GLUE SST-2 y posteriormente comprimido mediante el motor `CacheNotesCompressor` de la librería NeuralOps, desarrollada por Hooshaai. El objetivo del artefacto no es tanto ofrecer un clasificador de sentimiento listo para producción como demostrar la viabilidad técnica del pipeline de compresión de NeuralOps: reducción física del número de parámetros con recuperación parcial de precisión mediante LoRA healing.

El modelo parte de los 109.483.778 parámetros de BERT-Base (12 capas, dimensión oculta 768) y los reduce a 35.170.562 parámetros en el rango de compresión `k=64`, lo que supone una ratio de compresión física de 3,11x (-67,9% de parámetros). Sobre esa topología comprimida se aplica un adaptador LoRA (`r=8`, 50 pasos, `lr=2e-4`) para recuperar parte del rendimiento perdido por la compresión.

La relevancia del checkpoint es metodológica: documenta una evaluación Pareto multi-rango (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras) y publica los resultados de cada configuración, incluidos los casos en los que el healing degrada el rendimiento respecto al zero-shot. La precisión final en SST-2 es del 71,56% frente al 91,63% del modelo profesor original, una pérdida de 20,07 puntos porcentuales que debe tenerse en cuenta antes de usar el modelo en cualquier escenario real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta 768; topología comprimida con factores de bajo rango y adaptadores LoRA integrados |
| Parametros totales | 35.170.562 (checkpoint comprimido, `k=64`); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (BERT-Base original: 512 tokens) |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en `pytorch_model.bin` con buffers de cuantización y factores de bajo rango integrados |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizador en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo base es BERT-Base uncased, un transformer encoder de 12 capas con 768 dimensiones ocultas y 109.483.778 parámetros, fine-tuneado para clasificación de sentimiento binaria (2 etiquetas) sobre GLUE SST-2. Sobre ese checkpoint se aplica `CacheNotesCompressor`, un operador neuronal de la familia `kv_cache` de NeuralOps que combina compresión task-aware de caché clave-valor con compresión estática de pesos mediante un generador CPT (Compression-Planning-Token) continuo y aprendible. La compresión reduce físicamente el número de parámetros según un rango `k` seleccionado, y cuando la caída de precisión zero-shot supera el 2,0% con una reducción superior a 1,10x, NeuralOps aplica LoRA healing dirigido.

La evaluación multi-rango se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) con la partición de validación de SST-2 (872 muestras). El healing emplea `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. Los resultados por rango muestran un comportamiento irregular: en `k=256` y `k=128` el healing LoRA degrada la precisión zero-shot (de 59,75% a 50,92% y de 52,41% a 50,92% respectivamente), mientras que en `k=64` la recuperación es sustancial (de 51,49% a 71,56%) y en `k=32` también mejora (de 50,46% a 67,32%). El checkpoint serializado corresponde al rango `k=64`.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, con 2 etiquetas de salida.
- Generación de logits por par de secuencia para integración en pipelines de `transformers` (`BertForSequenceClassification`).
- Inferencia sobre texto tokenizado con el vocabulario estándar `bert-base-uncased`.
- Reconstrucción de la topología comprimida mediante `neuralops.core.compression_pipeline.compress_model` y carga del state dict con `strict=False`.
- Carga directa desde el Hub mediante la API universal `neuralops.hub.load_surgeried_model`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre compresión de modelos: el checkpoint sirve como referencia reproducible para comparar la relación entre ratio de compresión y precisión downstream en BERT-Base sobre SST-2, con telemetría completa en `compression_summary.json`.
- Experimentación con LoRA healing: permite estudiar por qué el healing funciona en `k=64` y `k=32` pero degrada el rendimiento en `k=256` y `k=128`, un comportamiento relevante para diseñar estrategias de recuperación más robustas.
- Clasificación de sentimiento en inglés con requisitos estrictos de tamaño: con 35,17 millones de parámetros y un artefacto de 67,2 MB, el modelo ocupa aproximadamente un tercio del espacio de BERT-Base, lo que facilita su despliegue en entornos con almacenamiento limitado.
- Prototipado de pipelines NeuralOps: el snippet de quick start del autor permite validar la integración entre `compress_model`, `hf_hub_download` y `BertForSequenceClassification` antes de adoptar la librería en proyectos mayores.
- Evaluación comparativa de compressores: al formar parte del "compressor zoo" de NeuralOps, el checkpoint puede usarse como baseline frente a otros métodos de compresión sobre la misma tarea y dataset.
- Docencia y demostraciones: ilustra de forma concreta el compromiso entre compresión física, precisión zero-shot y recuperación mediante adaptadores de bajo rango, con números verificables sobre 872 muestras.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Rango (`k`) | Ratio físico | Parámetros comprimidos (reducción) | Precisión zero-shot | Precisión con healing | Paridad vs profesor (91,63%) |
|---|---|---|---|---|---|
| 256 | 1,63x | 67.034.882 (-38,8%) | 59,75% | 50,92% (LoRA) | -40,71% |
| 128 | 2,39x | 45.792.002 (-58,2%) | 52,41% | 50,92% (LoRA) | -40,71% |
| **64 (checkpoint publicado)** | **3,11x** | **35.170.562 (-67,9%)** | **51,49%** | **71,56% (LoRA)** | **-20,07%** |
| 32 | 3,67x | 29.859.842 (-72,7%) | 50,46% | 67,32% (LoRA) | -24,31% |

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Sentiment Classification | GLUE SST-2 (validation, 872 muestras) | Accuracy | 71,56% (checkpoint `k=64`) |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint comprimido pesa 67,2 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 140 MB de VRAM, holgado en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo no requiere esa capacidad.
- Cabe en GPU consumer: sí, en GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090 y prácticamente cualquier tarjeta moderna; también es viable en CPU.
- Opciones de despliegue: `transformers` con `BertForSequenceClassification` tras reconstruir la topología con `neuralops.core.compression_pipeline.compress_model`; API `neuralops.hub.load_surgeried_model`; integración en pipelines de Hugging Face. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El presupuesto de healing LoRA indicado es de 45 segundos por rango, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validation) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-cachenotes-compressor-sst2` (k=64) | 35.170.562 (comprimido) | No disponible (base: 512) | 71,56% | MIT | Hugging Face, librería `neuralops` |
| `google-bert/bert-base-uncased` (profesor fine-tuneado) | 109.483.778 | 512 | 91,63% (baseline del autor) | Apache 2.0 | Hugging Face, `transformers` |
| BERT-Base sin comprimir (referencia) | 109.483.778 | 512 | No disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` |

No se dispone de datos de otros compressores del zoo NeuralOps en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 71,56% frente al 91,63% del profesor, una caída de 20,07 puntos porcentuales en SST-2; no es adecuado como clasificador de sentimiento de producción sin una evaluación adicional sobre el dominio objetivo.
- Comportamiento anómalo del healing: en `k=256` y `k=128` el LoRA healing reduce la precisión respecto al zero-shot, lo que sugiere inestabilidad del procedimiento de recuperación en rangos altos.
- Solo inglés: el tokenizador y el fine-tuning están limitados a `en`.
- Contexto: no se documenta la longitud de contexto efectiva del checkpoint comprimido; el límite de BERT-Base es 512 tokens.
- Formato propietario: la carga requiere reconstruir la topología con la librería NeuralOps antes de aplicar el state dict; no es un checkpoint `transformers` estándar plug-and-play.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y la del dataset GLUE SST-2 antes de redistribuir.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; al ser un clasificador binario, el riesgo se manifiesta como falsos positivos y negativos, no como generación libre.
- Metadatos inconsistentes: el ID del repositorio en la model card (`tahamajs/bert-comp-cachenotes-compressor-sst2`) no coincide con el ID de Hugging Face (`Hooshaai/bert-comp-cachenotes-compressor-sst2`), lo que puede provocar errores en el quick start si se copia literalmente.
- Métrica no verificada: la precisión de 71,56% está marcada como `verified: false` en el model-index.
- Madurez: 42 descargas y 0 likes en el momento de redacción; proyecto de investigación, no un artefacto consolidado.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-cachenotes-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/cachenotes_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset: https://huggingface.co/datasets/nyu-mll/glue
