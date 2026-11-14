# Hooshaai/bert-comp-oats-compressor-sst2

## Resumen

bert-comp-oats-compressor-sst2 es un checkpoint de BERT-Base comprimido físicamente mediante la técnica OATSCompressor (descomposición de bajo rango con conciencia de valores atípicos y sparsity estructurada), desarrollado por el autor Hooshaai dentro del ecosistema NeuralOps. Parte del modelo google-bert/bert-base-uncased (109.483.778 parámetros, 12 capas, dimensión oculta 768) y está ajustado para clasificación de sentimiento binaria en GLUE SST-2. Con un rango k=256, reduce el número de parámetros a 67.016.450 (-38,79%) manteniendo una accuracy del 92,09% en el split de validación, ligeramente por encima del baseline del profesor (91,63%).

El modelo resuelve un problema concreto de eficiencia en producción: permitir desplegar un clasificador BERT con menos memoria y cómputo sin sacrificar precisión. La compresión es física (no solo de cuantización), lo que reduce el tamaño de los pesos a 289,9 MB y el repositorio a 0,3 GB. Es relevante para equipos que necesitan servir clasificación de texto a escala con GPUs modestas o en entornos con restricciones de VRAM.

La ficha se basa exclusivamente en la model card y los metadatos publicados. No hay información sobre datos de entrenamiento adicionales, metodología de RLHF/DPO ni benchmarks más allá de SST-2. El modelo es de tipo encoder-only, contexto limitado a 512 tokens (propio de BERT-Base) y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-Base), comprimido con OATSCompressor (bajo rango + sparse estructurada) |
| Parametros totales | 67.016.450 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-Base usa 512 tokens) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en `pytorch_model.bin` con factores de bajo rango y buffers de compresión |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), con `config.json`, `compression_summary.json` y assets del tokenizer de bert-base-uncased |

## Arquitectura y entrenamiento

El modelo parte de BERT-Base uncased, un transformer encoder-only de 12 capas con dimensión oculta 768 y 109.483.778 parámetros. Sobre esa base, el autor aplica OATSCompressor, un compresor de bajo rango que combina descomposición low-rank con sparsity estructurada y tratamiento explícito de valores atípicos. La compresión se realiza a rango k=256, lo que produce una reducción del 38,79% en parámetros y un ratio de compresión físico de 1,634x. El proceso incluye validación del error de reconstrucción de Frobenius relativo (con `max_error` configurable, por defecto 0,85) y fallback seguro a los pesos originales si se supera el umbral.

El ajuste final se realiza sobre GLUE SST-2. Según la model card, el checkpoint empaquetado en este repositorio no requirió LoRA healing (la columna "LoRA Recovery Applied" indica False para k=256), aunque el pipeline de NeuralOps aplica LoRA de rango r=8 (50 pasos, lr=2e-4, presupuesto de 45 segundos) cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con un ratio superior a 1,10x. En los rangos k=64 y k=32 sí se aplicó LoRA healing. No se especifican el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2 ni si hubo RLHF o DPO; BERT-Base se preentrenó originalmente con objetivos MLM y NSP, pero esos detalles no se detallan en la informacion proporcionada.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, entrenada sobre GLUE SST-2.
- Generación de logits para dos clases mediante `BertForSequenceClassification` con `num_labels=2`.
- Inferencia en modo evaluación (`model.eval()`) con pesos comprimidos y reconstruidos vía NeuralOps.
- Soporte de tokenizer estándar de bert-base-uncased (vocabulario uncased).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No se documenta soporte de generación de texto libre ni de código; es un modelo discriminativo de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto: el modelo recibe texto en inglés y devuelve una etiqueta binaria; su tamaño comprimido (67M parámetros) permite desplegarlo en GPUs de gama media con baja latencia para lotes grandes de reseñas.
- Moderación de comentarios en foros y redes: se puede usar como primer filtro para detectar tono negativo en inglés y priorizar la revisión humana, aprovechando el bajo coste de inferencia del checkpoint comprimido.
- Análisis de opiniones en encuestas abiertas: procesamiento por lotes de respuestas textuales en inglés para agregar sentimiento a nivel de pregunta, con un modelo que cabe en memoria de una sola GPU consumer.
- Pipeline de enriquecimiento de datos: integración en un ETL que etiqueta automáticamente grandes volúmenes de texto en inglés con sentimiento, reduciendo el coste frente al BERT-Base sin comprimir.
- Servicio de clasificación de bajo consumo en edge o contenedores: al ocupar 289,9 MB de pesos, es viable en entornos con restricciones de VRAM o en CPUs con suficiente memoria, siempre que se reconstruya la topología NeuralOps.
- Baseline de investigación en compresión de modelos: sirve como referencia reproducible para comparar técnicas de compresión (OATSCompressor a k=256) frente al profesor BERT-Base en SST-2, con métricas de accuracy y ratio de compresión documentadas.
- Evaluación de paridad profesor-alumno: útil para validar pipelines de compresión que exigen que el modelo comprimido iguale o supere al original (aquí +0,46% de paridad).

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y la model card (no verificados de forma independiente):

| Modelo / variante | Ratio de compresion | Parametros | Accuracy SST-2 (validacion) | Paridad vs profesor (91,63%) |
|---|---:|---:|---:|---:|
| BERT-Base profesor (referencia) | 1,00x | 109.483.778 | 91,63% | 0,00% |
| OATS k=256 (checkpoint publicado) | 1,63x | 67.016.450 | 92,09% | +0,46% |
| OATS k=128 | 2,39x | 45.782.786 | 89,68% | -1,95% |
| OATS k=64 (con LoRA healing) | 3,11x | 35.165.954 | 86,81% | -4,82% |
| OATS k=32 (con LoRA healing) | 3,20x | 34.256.642 | 82,00% | -9,63% |

La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 289,9 MB en `pytorch_model.bin`; en FP32 la huella de pesos ronda los 0,3 GB, por lo que la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM, dependiendo del tamaño de lote y la longitud de secuencia.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor validó en RTX 3090 (24 GB). Para producción a gran escala, A100 o H100 no son necesarias por tamaño, pero pueden aportar throughput en lotes grandes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer con al menos 4 GB de VRAM.
- Opciones de despliegue: la model card documenta el flujo con `transformers` + `neuralops` (reconstrucción de la topología comprimida con `compress_model` y carga del state dict con `strict=False`). No se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI; al ser un checkpoint comprimido con topología NeuralOps, requiere reconstruir la arquitectura antes de cargar los pesos.
- Latencia y throughput: no disponible en la información proporcionada. El autor menciona un presupuesto de 45 segundos para el LoRA healing de 50 pasos, pero no reporta latencia de inferencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (validacion) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| bert-comp-oats-compressor-sst2 (k=256) | 67.016.450 | no disponible (base BERT: 512) | 92,09% | MIT | Hugging Face (repo 0,3 GB) |
| google-bert/bert-base-uncased (profesor) | 109.483.778 | 512 | 91,63% (baseline del autor) | Apache 2.0 | Hugging Face |
| OATS k=128 (misma familia) | 45.782.786 | no disponible (base BERT: 512) | 89,68% | MIT | Hugging Face (variante evaluada, no empaquetada) |
| OATS k=64 con LoRA (misma familia) | 35.165.954 | no disponible (base BERT: 512) | 86,81% | MIT | Hugging Face (variante evaluada, no empaquetada) |

No se dispone de datos de otros modelos comparables de la misma categoría (clasificadores BERT comprimidos para SST-2) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo; al derivar de bert-base-uncased y entrenarse en SST-2, puede heredar sesgos del corpus original y del dataset de reseñas.
- Riesgo de alucinación: bajo en sentido estricto al ser un clasificador binario, pero puede producir clasificaciones erróneas o sobreconfiadas en dominios distintos a SST-2.
- Limitaciones de contexto e idioma: solo inglés; la longitud de contexto no se detalla en la información proporcionada, aunque el modelo base BERT-Base está limitado a 512 tokens.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución; el enlace de licencia apunta al repositorio de GitHub de NeuralOps.
- Caveat de producción: el checkpoint requiere reconstruir la topología comprimida con la librería `neuralops` y cargar el state dict con `strict=False`; no es un checkpoint estándar de `transformers` cargable directamente con `from_pretrained` sin ese paso.
- El identificador del repositorio en el código de ejemplo de la model card (`tahamajs/bert-comp-oats-compressor-sst2`) no coincide con el ID del repositorio (`Hooshaai/bert-comp-oats-compressor-sst2`), lo que puede provocar errores de descarga si se copia tal cual.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- El modelo está pensado para clasificación de sentimiento; no debe usarse para generación de texto, código ni tareas de razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-oats-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación OATSCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/oats_compressor.py
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
