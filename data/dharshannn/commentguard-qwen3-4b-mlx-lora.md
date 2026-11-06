# dharshannn/CommentGuard-Qwen3-4B-MLX-LoRA

## Resumen

CommentGuard-Qwen3-4B-MLX-LoRA es un adaptador LoRA de clasificación binaria de toxicidad construido sobre el modelo Qwen3-4B-Instruct-2507 en cuantización de 4 bits para el runtime MLX de Apple Silicon. Lo desarrolla el usuario dharshannn y se distribuye como adaptador independiente (no fusionado) que requiere el modelo base fijado y el entorno MLX. El problema que aborda es la moderación automática de comentarios en inglés, con un protocolo de puntuación muy específico basado en los logits de dos tokens de etiqueta.

El adaptador se entrenó con Unsloth Studio sobre un Apple M5 Pro con 24 GB de memoria unificada, usando un subconjunto del dataset google/civil_comments. Frente a una línea base TF-IDF más regresión logística, el adaptador mejora el F1 de 0,3496 a 0,6237 y la precisión media (average precision) de 0,3663 a 0,6808 sobre 3.000 ejemplos de test retenidos. Es relevante para quienes necesitan un clasificador de toxicidad ligero, ejecutable en local sobre hardware Apple, con métricas reproducibles y un contrato de inferencia documentado.

La arquitectura subyacente es la de Qwen3-4B (transformer denso, aproximadamente 4.000 millones de parámetros), con un adaptador LoRA de rango 8 y alpha 16 aplicado sobre la versión de 4 bits. El contexto de entrenamiento fue de 1.024 tokens. El modelo está pensado para investigación y uso educativo, no para aplicación automatizada en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA sobre base cuantizada en 4 bits |
| Parametros totales | Aproximadamente 4.000 millones (modelo base Qwen3-4B); el adaptador LoRA añade un conjunto reducido de pesos (rango 8) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens en entrenamiento; el prompt se trunca a 1.023 tokens (sufijo del comentario) |
| Tipos de cuantizacion | Base en 4 bits (MLX); el adaptador se distribuye en precisión propia del framework MLX |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (adaptador); se aplican los términos upstream de Qwen3 y de la cuantización MLX |
| Formato de pesos | Pesos MLX (adaptador LoRA); no es safetensors estándar de Transformers/PEFT ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3-4B-Instruct-2507-4bit` (revisión `50d427756c6b1b2fe0c0a10f67fbda1fc8e82c1b`), un transformer denso de Qwen3 con cerca de 4.000 millones de parámetros cuantizado a 4 bits para MLX. Sobre él se entrena un adaptador LoRA con rango 8, alpha 16 (escala MLX 2), dropout 0 y contexto de 1.024 tokens. La tasa de aprendizaje es 1e-4 con schedule lineal y 50 pasos de warmup, batch y acumulación de 1/1, semilla 42. Se seleccionó el checkpoint 4.000 de una ejecución de una época por mínima pérdida de tokens en validación; experimentos emparejados de dos épocas con dropout no lo reemplazaron.

Los datos provienen de google/civil_comments (revisión `f2970eb3a55777454c94069077cc8d9b5866312d`): un pool de entrenamiento de 5.000 ejemplos (1.250 tóxicos y 3.750 no tóxicos) y 1.000 de validación. El objetivo binario es anotación de toxicidad mayor o igual a 0,5, con deduplicación exacta de texto normalizado y precedencia del split retenido; los casi duplicados no se resuelven. La innovación técnica destacable no está en la arquitectura sino en el contrato de puntuación: se usa la plantilla de chat fijada, se añade `<think>\n\n</think>\n\n` y se calculan los logits del siguiente token para los IDs de etiqueta 15 y 16, aplicando softmax en float32 solo sobre esos dos candidatos. El umbral de decisión es 0,4073334336280823.

## Capacidades

- Clasificación binaria de toxicidad en inglés (etiqueta 0 = no tóxico, 1 = tóxico) mediante puntuación de logits condicional.
- Salida de score, umbral aplicado y estado de truncación en el ejemplo de inferencia incluido.
- Protocolo de puntuación reproducible con plantilla de chat y system instruction fijadas en `classification_config.json`.
- Ejecución nativa en Apple Silicon mediante el runtime MLX.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta visión, audio ni modo de pensamiento extendido en el protocolo de clasificación.
- No es multilingüe: solo inglés.
- No incluye búsqueda, herramientas ni puntuación de EOS dentro del contrato de scoring.

## Casos de uso

- Moderación de comentarios en foros y comunidades en inglés: el adaptador clasifica cada comentario con un score y un umbral fijo, adecuado para prefiltrar colas de revisión humana gracias a su precisión de 0,6416 sobre el test retenido.
- Triaje previo a revisión manual: con un recall de 0,6067, se puede usar como primera pasada que marca candidatos y reduce el volumen que llega a moderadores, aceptando que se escapan aproximadamente el 39,3% de los comentarios tóxicos.
- Investigación sobre sesgos y anotación subjetiva: el modelo y sus métricas permiten estudiar cómo un clasificador pequeño se comporta frente a etiquetas humanas subjetivas en civil_comments.
- Experimentación educativa con MLX y LoRA: sirve como ejemplo completo de fine-tuning y despliegue local en Apple Silicon, con contrato de inferencia y artefactos de evaluación incluidos.
- Prototipado rápido en local sobre un Mac: al requerir solo el modelo base de 4 bits y el runtime MLX, permite iterar sobre umbrales y prompts sin infraestructura GPU dedicada.
- Comparación de líneas base: el repositorio incluye una comparación con TF-IDF más regresión logística, útil para evaluar si un clasificador clásico es suficiente antes de adoptar un LLM adaptado.
- Filtrado de datasets de comentarios para limpieza previa: puede aplicarse como etiquetador auxiliar en inglés para separar muestras tóxicas y no tóxicas antes de un análisis posterior.

## Benchmarks y rendimiento

Evaluación sobre 3.000 ejemplos retenidos de Civil Comments, incluidos 239 comentarios tóxicos. Cada modelo usó su propio umbral seleccionado en validación; ningún umbral se ajustó sobre test.

| Modelo | Precision | Recall | F1 | Average precision |
|---|---:|---:|---:|---:|
| Qwen base con el mismo protocolo de scoring | 0,1739 | 0,6402 | 0,2735 | 0,1892 |
| TF-IDF + regresión logística | 0,2491 | 0,5858 | 0,3496 | 0,3663 |
| Adaptador CommentGuard | 0,6416 | 0,6067 | 0,6237 | 0,6808 |

Matriz de confusión del modelo seleccionado: TP 145, FP 81, FN 94, TN 2680. El modelo pierde el 39,3% de los comentarios tóxicos del test. Las líneas base se evaluaron después de conocer el resultado del adaptador, con sus umbrales ajustados en validación antes de puntuar test, y no se ajustaron exhaustivamente. Los resultados del modelo base describen este protocolo fijo de scoring, no un prompting óptimo.

## Requisitos de hardware

- VRAM/unified memory estimada: el modelo base en 4 bits ocupa aproximadamente 2-3 GB; el adaptador añade una cantidad mínima. El autor lo entrenó en un Apple M5 Pro con 24 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon con MLX; no está validado para CUDA ni ROCm.
- Cabe en consumer GPU: no aplica en el sentido habitual; está diseñado para Macs con memoria unificada. No se distribuye en GGUF para GPUs de consumo.
- Opciones de despliegue: runtime MLX con el ejemplo `classify.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que el modelo grande es sustancialmente más lento que la línea base logística. Los archivos `evaluation_results.json` y `baseline_comparison.json` contienen métricas exactas y tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CommentGuard-Qwen3-4B-MLX-LoRA | ~4.000 M (base) + LoRA rango 8 | 1.024 tokens | Clasificación de toxicidad vía logits | Apache-2.0 | Adaptador MLX en Hugging Face |
| TF-IDF + regresión logística (línea base del autor) | No aplica | No aplica | Clasificación clásica | No especificada | Incluida como comparación |
| Qwen3-4B-Instruct-2507-4bit (base) | ~4.000 M | No disponible en la información | LLM generativo | Apache-2.0 | Hugging Face (mlx-community) |

No se dispone de comparación con otros clasificadores de toxicidad de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación y educación; no validado para aplicación automatizada, otros idiomas, robustez dialectal, equidad entre subgrupos ni comentarios fuera de dominio.
- Riesgo de falsos negativos: pierde el 39,3% de los comentarios tóxicos del test, por lo que no debe usarse como único filtro de moderación.
- El score no es una probabilidad calibrada; la generación de chat ordinaria usa un protocolo distinto y no debe asumirse que reproduzca estos resultados.
- Las anotaciones de civil_comments son subjetivas y se desconoce el solapamiento del pretraining con este dataset público.
- La validación se reutilizó para desarrollo y solo se usó una semilla; el rendimiento en test es una muestra retenida, no una garantía en producción.
- Solo inglés; sin soporte para tool calling, agentes ni razonamiento multi-paso.
- Es un adaptador, no un modelo fusionado: requiere el modelo base fijado y el runtime MLX; no es un adaptador Transformers/PEFT.
- La licencia Apache-2.0 del adaptador no sustituye los términos upstream de Qwen3 ni de la cuantización MLX, que siguen aplicándose.
- El modelo es sustancialmente más lento que una línea base logística, lo que puede ser limitante en volúmenes altos.

## Enlaces

- Hugging Face: https://huggingface.co/dharshannn/CommentGuard-Qwen3-4B-MLX-LoRA
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Dataset: https://huggingface.co/datasets/google/civil_comments
- Repositorio MLX: https://github.com/ml-explore/mlx
- Unsloth: https://github.com/unslothai/unsloth
