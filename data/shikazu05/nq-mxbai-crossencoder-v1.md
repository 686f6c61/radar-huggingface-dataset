# shikazu05/nq-mxbai-crossencoder-v1

# Ficha técnica de nq-mxbai-crossencoder-v1

## Resumen

`nq-mxbai-crossencoder-v1` es un modelo de reranking tipo cross-encoder desarrollado por `shikazu05` como parte de un sistema de búsqueda de respuestas en la revista histórica *Notes and Queries* (1849-1928). El modelo está entrenado para puntuar la relevancia de pares consulta-respuesta en un corpus con texto procedente de OCR histórico, y se presenta como un artefacto público de un fine-tuning reproducible, sin necesidad de autenticación ni APIs externas.

La arquitectura base es `mixedbread-ai/mxbai-rerank-base-v1`, un modelo DeBERTa-v3-base de aproximadamente 184 millones de parámetros. El fine-tuning se realizó con 29.440 pares de texto (1.472 consultas con 20 candidatas cada una) utilizando pérdida listwise CrossEntropy y una ventana máxima de 320 tokens. El modelo alcanza un MRR de 0.6095 en el conjunto de validación, frente a 0.4644 del modelo base congelado, y se utiliza en ensemble con otro reranker de la misma familia (`nq-deberta-crossencoder-v1`).

Es relevante porque aborda un problema específico y poco cubierto: la recuperación de respuestas en documentos históricos con errores de OCR, donde los modelos de reranking genéricos suelen degradarse. Al estar publicado con licencia MIT y pesos en formato Safetensors, permite su integración directa en pipelines de investigación y producción local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en DeBERTa-v3-base |
| Parametros totales | 184.422.913 (≈184 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; entrenado con max_length 320 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; el corpus es inglés histórico |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de reranking basado en DeBERTa-v3-base, un transformer de tipo encoder con 184 M de parámetros. A diferencia de los bi-encoders, que codifican consulta y documento por separado, un cross-encoder recibe el par concatenado y emite una única puntuación de relevancia, lo que proporciona mayor precisión a costa de mayor coste computacional.

El entrenamiento se realizó sobre un corpus de *Notes and Queries* (1849-1928). Los datos proceden de `train.csv`, `train_labels.csv` y `replies.csv`, con un total de 1.472 casos, cada uno con 20 respuestas candidatas, lo que genera 29.440 pares consulta-respuesta. El preprocesado es mínimo: sustitución de la s larga (`ſ`) por `s` y colapso de espacios en blanco. El objetivo de entrenamiento es una pérdida listwise CrossEntropy sobre las 20 candidatas de cada consulta.

Los hiperparámetros utilizados fueron 4 épocas, con la mejor época en la número 1 (early stopping sobre un holdout), learning rate 2e-5 con scheduler cosine, AdamW con weight decay 0.01, fp16, max_length 320 y gradiente acumulado a 4 pasos. El entrenamiento se ejecutó en una única GPU A10G de 24 GB mediante un script reproducible (`modal_app.py::train_listwise`). El modelo final es el mejor checkpoint de la época 1, logrando un MRR de 0.6095 frente a 0.4644 del modelo base congelado.

## Capacidades

- Puntuación de relevancia de pares consulta-respuesta, devolviendo un score numérico para cada par.
- Reranking de listas de hasta 20 candidatas por consulta, optimizado para la métrica MRR.
- Trabaja con texto de OCR histórico, incluyendo variantes tipográficas como la s larga.
- Puede combinarse en ensemble con otros cross-encoders (por ejemplo, `nq-deberta-crossencoder-v1`) mediante la media de puntuaciones.
- No es un modelo generativo: no produce texto ni respuestas abiertas.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión ni audio.
- Soporte multilingüe limitado al inglés histórico del corpus de entrenamiento.

## Casos de uso

- Búsqueda en revistas históricas: dada una consulta sobre temas de *Notes and Queries*, el modelo puntúa 20 pasajes extraídos por un buscador y los reordena para mostrar las respuestas más relevantes.
- Reranking en pipelines RAG sobre OCR sucio: al integrarlo como etapa posterior a la recuperación, filtra ruido tipográfico y mejora la precisión de respuestas en documentos del siglo XIX.
- Curaduría de archivos digitales: permite anotar automáticamente la relevancia de pasajes para preguntas de investigación, acelerando la revisión manual de colecciones.
- Asistentes de investigación en humanidades: un investigador formula una pregunta y el modelo ordena las respuestas candidatas extraídas de un corpus OCR con errores, reduciendo el tiempo de lectura.
- Re-ranking de QA sobre texto histórico: añade una capa de ordenación a sistemas preguntas-respuestas no generativos que devuelven fragmentos de texto, mejorando la posición de la respuesta correcta.
- Ensemble con fines de precisión: se combina con `nq-deberta-crossencoder-v1` haciendo la media de puntuaciones para obtener una decisión más robusta en casos ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas de validación interna sobre un holdout de 147 casos con partición semilla 42:

| Configuracion | MRR (holdout) |
|---|---|
| Modelo base congelado (mxbai) | 0.4644 |
| Fine-tune epoca 1 (mejor) | 0.6095 |
| Fine-tune epocas 2-4 | ~0.594-0.598 |
| Reranker hermano DeBERTa-raw | 0.6156 |
| Ensemble (DeBERTa-raw + mxbai) | No disponible (referencia en `solution.py`) |

Estas cifras son internas y no comparables con benchmarks públicos. Se recomienda realizar una evaluación propia en el dominio de aplicación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp16, y cerca de 2-3 GB si se procesan lotes de 20 pares simultáneamente.
- GPU recomendada: cualquier tarjeta con al menos 4 GB de VRAM (RTX 3060, RTX 4090). El entrenamiento se realizó en una A10G de 24 GB, pero no necesita tanto para inferencia.
- Puede ejecutarse en CPU mediante Transformers, aunque con mayor latencia.
- Opciones de despliegue: inference local vía `transformers` (PyTorch). No se documenta soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la longitud de las entradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| `mixedbread-ai/mxbai-rerank-base-v1` | 184 M | No disponible | Apache 2.0 | Reranking general (MS-MARCO) |
| `shikazu05/nq-mxbai-crossencoder-v1` | 184 M | max_length 320 | MIT | Reranking histórico OCR |
| `shikazu05/nq-deberta-crossencoder-v1` | No disponible | No disponible | No disponible | Reranking histórico OCR (raw) |

El modelo es un fine-tuning del reranker de mixedbread. El hermano `nq-deberta-crossencoder-v1` presenta una métrica ligeramente superior en validación (0.6156), y ambos se combinan en un ensemble mediante la media de puntuaciones.

## Limitaciones y advertencias

- Está entrenado exclusivamente con texto de *Notes and Queries* y OCR histórico; su rendimiento fuera de este dominio no está garantizado.
- La longitud máxima de entrada durante el entrenamiento es de 320 tokens, por lo que consultas o respuestas más largas serán truncadas.
- No genera texto: solo puntúa pares. No puede usarse para responder preguntas de forma directa.
- El corpus histórico puede contener lenguaje, terminología o sesgos de la época, que el modelo puede reflejar en sus puntuaciones.
- Las métricas reportadas provienen de un único holdout y no son comparables con evaluaciones públicas.
- La licencia MIT permite uso comercial, pero el modelo no ha sido evaluado en aplicaciones de producción.
- No soporta otros idiomas ni variantes de OCR distintas a la s larga y al colapso de espacios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shikazu05/nq-mxbai-crossencoder-v1
- Modelo base: https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v1
- Reranker hermano: https://huggingface.co/shikazu05/nq-deberta-crossencoder-v1
