# Hooshaai/bert-comp-aatc-xkv-compressor-sst2

## Resumen

`bert-comp-aatc-xkv-compressor-sst2` es un checkpoint de BERT-base comprimido físicamente y ajustado mediante LoRA, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps (Compressed & LoRA-Healed Model Zoo). Parte de `google-bert/bert-base-uncased` afinado sobre GLUE SST-2 y le aplica el motor de compresión `aatc_xkv_compressor` (AATC_XKVCompressor, familia `kv_cache`), que implementa compresión de caché KV cross-layer consciente de la atención. El resultado es un clasificador binario de sentimiento en inglés con 102.129.227 parámetros, frente a los 109.483.778 del modelo base.

El modelo es relevante como artefacto de investigación sobre compresión de modelos: ejemplifica una metodología de evaluación Pareto multi-rango (k=256, 128, 64 y 32) con un protocolo de "healing" mediante LoRA cuando la compresión degrada la precisión más de 2 puntos con ratios superiores a 1,10x. En este caso concreto la compresión física es modesta (1,072x, un 6,72% de reducción) y la precisión cae 7,23 puntos respecto al profesor (84,40% frente a 91,63%), lo que lo sitúa como una pieza de análisis más que como un candidato de producción.

La arquitectura subyacente es un transformer encoder BERT-base estándar (12 capas, dimensión oculta 768), con la topología de compresión serializada en el state dict. El repositorio ocupa 0,2 GB, la licencia es MIT y el único idioma declarado es inglés. No hay que confundirlo con un modelo de propósito general: es un clasificador SST-2 de dos etiquetas (negativo/positivo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con topología de compresión AATC_XKVCompressor (familia kv_cache) |
| Parametros totales | 102.129.227 (comprimido); modelo base: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base soporta hasta 512 tokens, pero no se declara explícitamente en la información proporcionada) |
| Tipos de cuantizacion | No disponible (se distribuye en `pytorch_model.bin` en precisión completa) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y activos de tokenizer (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo base es `google-bert/bert-base-uncased`: un transformer encoder de 12 capas y D=768, preentrenado de forma estándar y afinado sobre GLUE SST-2. Sobre ese checkpoint se aplica el compresor `AATC_XKVCompressor` (Attention-Aware Cross-Layer KV Cache Compression, v2), registrado en `neuralops/compression/kv_cache/aatc_xkv_compressor.py`. La compresión se materializa físicamente en el state dict serializado, con factores de bajo rango y buffers de cuantización integrados, y la configuración queda etiquetada con `compression_method: "aatc_xkv_compressor"` y `compression_rank: 32`.

La evaluación se realizó sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). El protocolo NeuralOps aplica LoRA healing con r=8, 50 pasos, lr=2e-4 y un presupuesto de 45 segundos cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este checkpoint el campo `LoRA Recovery Applied` figura como `False` y los cuatro rangos evaluados (256, 128, 64, 32) producen idéntico recuento de parámetros y precisión, lo que sugiere que el efecto del rango en esta configuración es nulo o que el pipeline colapsa los rangos a la misma topología efectiva. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación binaria de sentimiento (negativo/positivo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia de clasificación directa mediante `BertForSequenceClassification` tras reconstruir la topología con `compress_model`.
- Carga unificada a través del Hub API de NeuralOps (`load_surgeried_model`), que devuelve modelo y tokenizer en una línea.
- Compresión de caché KV cross-layer como innovación técnica del compresor, orientada a reducir el coste de memoria en atención.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica polaridad positiva o negativa en textos cortos en inglés, aprovechando el ajuste específico sobre SST-2 para dominios de opinión.
- Moderación de comentarios en foros y redes: filtrado rápido de mensajes con carga negativa para revisión humana posterior, con un coste de inferencia reducido al tener un 6,72% menos de parámetros que BERT-base.
- Investigación en compresión de modelos: servir como referencia reproducible del compresor `aatc_xkv_compressor` para comparar metodologías de compresión y protocolos de healing LoRA sobre un benchmark estándar como SST-2.
- Docencia y experimentación: ejemplo mínimo de pipeline NeuralOps (compresión, serialización, reconstrucción y carga) para cursos o talleres sobre eficiencia de modelos.
- Baseline en pipelines de clasificación por lotes: integración en procesos offline de etiquetado de grandes volúmenes de texto en inglés donde la latencia no es crítica y prima el throughput.
- Validación de infraestructura de despliegue: prueba de compatibilidad de checkpoints comprimidos en entornos con `transformers` y la librería NeuralOps antes de migrar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo | Tarea / dataset | Métrica | Valor |
|---|---|---|---|
| bert-comp-aatc-xkv-compressor-sst2 (k=32) | GLUE SST-2, validation | Accuracy | 84,40% |
| Profesor (BERT-base SST-2) | GLUE SST-2, validation | Accuracy | 91,63% |
| Delta de paridad | GLUE SST-2, validation | Accuracy | -7,23% |

Evaluación multi-rango declarada por el autor (RTX 3090, 872 muestras):

| Rank (k) | Ratio físico | Parámetros comprimidos | Zero-shot Acc | Healed Acc | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,07x | 102.129.227 (-6,7%) | 84,40% | 84,40% | -7,23% |
| 128 | 1,07x | 102.129.227 (-6,7%) | 84,40% | 84,40% | -7,23% |
| 64 | 1,07x | 102.129.227 (-6,7%) | 84,40% | 84,40% | -7,23% |
| 32 | 1,07x | 102.129.227 (-6,7%) | 84,40% | 84,40% | -7,23% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 194,9 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 0,4 GB de memoria de pesos, más activaciones. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB). Una RTX 4090, RTX 3060 o incluso una GTX 1650 son suficientes para inferencia.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` junto con la librería NeuralOps (`neuralops`) para reconstruir la topología comprimida; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, dado que el formato es un state dict PyTorch comprimido no estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-comp-aatc-xkv-compressor-sst2 | 102.129.227 | No disponible | 84,40% | MIT | Hugging Face |
| google-bert/bert-base-uncased (profesor SST-2) | 109.483.778 | 512 tokens (arquitectura) | 91,63% | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased | 66 millones | 512 tokens (arquitectura) | No disponible en esta información | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125 millones | 512 tokens (arquitectura) | No disponible en esta información | MIT | Hugging Face |

La comparación con DistilBERT y RoBERTa se incluye por categoría (encoders BERT de tamaño similar para clasificación), pero no se dispone de sus cifras SST-2 en la información proporcionada; no se inventan valores.

## Limitaciones y advertencias

- La precisión cae 7,23 puntos respecto al profesor (84,40% frente a 91,63%) con una compresión física de solo 1,072x, un intercambio desfavorable frente a alternativas de destilación como DistilBERT.
- El campo `LoRA Recovery Applied` es `False` y los cuatro rangos evaluados producen resultados idénticos, lo que sugiere que el pipeline de compresión no está diferenciando rangos en esta configuración; conviene tratarlo como artefacto experimental.
- El checkpoint requiere reconstruir la topología con `compress_model` y cargar con `strict=False`, lo que puede enmascarar pesos no inicializados o incompatibilidades silenciosas.
- Solo inglés; no apto para otros idiomas sin reentrenamiento.
- Clasificador binario de sentimiento: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios alejados de SST-2 (textos largos, sarcasmo, jerga técnica).
- Sesgos heredados de BERT-base-uncased y de la composición de SST-2 (reseñas de películas), que pueden no reflejar otros dominios.
- Licencia MIT permite uso comercial, pero el modelo base BERT-base-uncased está bajo Apache 2.0; conviene revisar la compatibilidad de ambas licencias en el contexto de uso.
- El autor del repo aparece como `Hooshaai` en el identificador, mientras que la model card referencia `tahamajs/bert-comp-aatc-xkv-compressor-sst2` en los ejemplos de código; verificar la ruta correcta antes de descargar.
- Repositorio con 40 descargas y 0 likes: sin validación comunitaria ni resultados verificados (`verified: false`).

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-aatc-xkv-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/aatc_xkv_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
