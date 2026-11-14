# Hooshaai/bert-comp-mamba-shedder-sst2

## Resumen

`bert-comp-mamba-shedder-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, publicado por el autor Hooshaai dentro del ecosistema NeuralOps (NeuralOps Library, repositorio de compresión de modelos). El modelo aplica la técnica de compresión estructurada `mamba_shedder` del registro de compresores de NeuralOps, que combina poda estructurada basada en sensibilidad (información de Fisher empírica) con eliminación de capas de bajo residuo, seguida de un "healing" mediante adaptadores LoRA de rango 8 para recuperar parte de la precisión perdida.

El resultado es un BERT-base con 92.445.206 parámetros (frente a los 109.483.778 del modelo original), lo que supone una reducción del 15,56 % y un ratio de compresión físico de 1,18x. La precisión final en el split de validación de SST-2 es del 83,03 %, frente al 91,63 % del modelo profesor original, es decir, una pérdida de paridad de 8,60 puntos porcentuales. El checkpoint serializado en el repositorio corresponde al rango de compresión k=32, seleccionado como "showcase" tras una evaluación Pareto multi-rango (k=256, 128, 64 y 32).

El interés de esta ficha es fundamentalmente metodológico: sirve como ejemplo reproducible de un pipeline de compresión de modelos con telemetría y evaluación, más que como un modelo de producción para clasificación de sentimiento de alta calidad. La licencia es MIT y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas, dimensión oculta 768), comprimido con poda estructurada `mamba_shedder` |
| Parametros totales | 92.445.206 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base-uncased admite 512 tokens, pero la model card no lo declara explícitamente para este checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-base-uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado de forma no supervisada y posteriormente afinado en GLUE SST-2. Sobre ese modelo se aplica el compresor `mamba_shedder` (`mamba_shedder_factory`), que realiza poda estructurada de canales lineales no críticos identificados mediante información de Fisher empírica y elimina capas con bajo residuo. El checkpoint empaquetado corresponde al rango k=32, con un ratio de compresión físico de 1,18x y una reducción de parámetros del 15,56 %.

El proceso de recuperación ("healing") aplica adaptadores LoRA de rango r=8 durante 50 pasos con tasa de aprendizaje 2e-4 y un presupuesto de 45 segundos, activados cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este caso, el modelo pasa de 79,93 % en zero-shot a 83,03 % tras el healing LoRA. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se detalla en la información disponible la composición del dataset de entrenamiento más allá de GLUE SST-2, ni si hubo RLHF o DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, en el formato de GLUE SST-2.
- Clasificación de secuencias cortas de texto (frases de reseñas); no está diseñado para generación de texto.
- Inferencia en modo evaluación (`model.eval()`) con logits de dos clases.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no; únicamente inglés.
- No dispone de modo "thinking", visión ni audio.
- El checkpoint incluye los factores de bajo rango y los adaptadores LoRA de healing ya integrados en el state dict.

## Casos de uso

- Clasificación de sentimiento en reseñas de productos o servicios en inglés: el modelo recibe una frase y devuelve la etiqueta binaria de sentimiento; adecuado para volúmenes moderados donde el ahorro de parámetros (15,56 %) frente a BERT-base importa.
- Filtrado de comentarios en pipelines de moderación: se puede usar como clasificador de primera pasada para descartar contenido negativo obvio antes de un modelo mayor, aprovechando su menor huella de parámetros.
- Análisis de opiniones en encuestas abiertas en inglés: clasificación por lotes de respuestas cortas para agregar métricas de satisfacción.
- Etiquetado débil (weak labeling) para construir datasets: usar las predicciones del modelo como etiquetas preliminares en corpus no anotados, con revisión humana posterior dada la pérdida de 8,60 puntos frente al profesor.
- Docencia y experimentación en compresión de modelos: el repositorio incluye `compression_summary.json` con telemetría de los rangos k=256, 128, 64 y 32, útil para reproducir el pipeline de poda y healing.
- Baseline ligero en entornos con recursos limitados: al tener 92,4 M de parámetros, puede desplegarse en CPU o en GPUs de gama baja para tareas de clasificación de baja latencia, siempre que se acepte la merma de precisión.
- Comparación de técnicas de compresión: sirve como referencia frente a otros compresores del zoo de NeuralOps en estudios de Pareto precisión/compresión.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados de forma independiente, `verified: false`):

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| bert-comp-mamba-shedder-sst2 (k=32, con LoRA) | GLUE SST-2 | validation | Accuracy | 83,03 % |
| bert-comp-mamba-shedder-sst2 (zero-shot, sin healing) | GLUE SST-2 | validation | Accuracy | 79,93 % |
| Profesor: bert-base-uncased afinado | GLUE SST-2 | validation | Accuracy | 91,63 % |

Evaluación Pareto multi-rango declarada por el autor (todos los rangos reportan el mismo resultado físico):

| Rank (k) | Ratio físico | Parámetros comprimidos | Zero-shot | Con healing | Paridad vs profesor |
|---|---|---|---|---|---|
| 256 | 1,18x | 92.445.206 (-15,6 %) | 79,93 % | 83,03 % | -8,60 % |
| 128 | 1,18x | 92.445.206 (-15,6 %) | 79,93 % | 83,03 % | -8,60 % |
| 64 | 1,18x | 92.445.206 (-15,6 %) | 79,93 % | 83,03 % | -8,60 % |
| 32 (empaquetado) | 1,18x | 92.445.206 (-15,6 %) | 79,93 % | 83,03 % | -8,60 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es coherente con un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 176,9 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 0,37 GB de pesos (92,4 M de parámetros × 4 bytes), por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobredimensionado para esa GPU; cualquier RTX 3060, RTX 4060 o superior es suficiente para inferencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: al requerir la reconstrucción de la topología comprimida con `neuralops.core.compression_pipeline.compress_model` y la carga del state dict con `strict=False`, no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin trabajo adicional de exportación. El flujo documentado usa `transformers` (`BertForSequenceClassification`) más la librería `neuralops` y `huggingface_hub`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-comp-mamba-shedder-sst2 (k=32) | 92,4 M | no disponible | 83,03 % | MIT | Hugging Face (repo 0,2 GB) |
| google-bert/bert-base-uncased (profesor afinado) | 109,5 M | 512 tokens | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased | no disponible en la información | no disponible | no disponible en la información | Apache 2.0 | Hugging Face |

No se dispone de datos de otros compresores del zoo de NeuralOps ni de comparativas independientes en la información proporcionada; los valores del profesor y del modelo comprimido proceden exclusivamente de la model card del autor.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 8,60 puntos porcentuales frente al profesor (83,03 % vs 91,63 %), lo que puede ser inaceptable en producción para clasificación de sentimiento sensible.
- El resultado de 83,03 % está marcado como no verificado (`verified: false`) en el model-index; procede únicamente del autor.
- Los cuatro rangos evaluados (k=256, 128, 64, 32) reportan exactamente los mismos parámetros y precisión, lo que sugiere que la distinción entre rangos no se refleja en el checkpoint empaquetado; conviene tratarlo con cautela.
- Idioma limitado a inglés; no apto para texto en castellano u otros idiomas.
- Solo clasificación binaria de sentimiento; no es un modelo generativo ni soporta instrucciones, tool calling ni agentes.
- La carga requiere reconstruir la topología con la librería `neuralops` y usar `strict=False`, lo que puede ocultar discrepancias en el state dict; no hay soporte directo en runtimes estándar de inferencia.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de clasificaciones erróneas en dominios distintos de SST-2 (frases de reseñas de películas).
- Licencia MIT: permite uso comercial, pero el modelo base BERT-base-uncased tiene su propia licencia (Apache 2.0) que debe respetarse.
- El repositorio tiene 43 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La model card incluye una URL de ejemplo (`tahamajs/bert-comp-mamba-shedder-sst2`) distinta del ID real del repositorio (`Hooshaai/bert-comp-mamba-shedder-sst2`), lo que puede provocar errores al copiar el código de ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-mamba-shedder-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor `mamba_shedder`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/mamba_shedder.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
