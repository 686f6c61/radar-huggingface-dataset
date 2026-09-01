# fcmeyer/zerank-2-reranker-MLX-bf16

## Resumen

zerank-2-reranker-MLX-bf16 es una conversión a formato MLX (Apple Silicon) del modelo `zeroentropy/zerank-2-reranker`, un cross-encoder de reranking construido sobre Qwen3-4B. El modelo original, desarrollado por ZeroEntropy, está diseñado para asignar una puntuación de relevancia a un par (consulta, documento) procesándolos conjuntamente, lo que ofrece mayor precisión que la comparación de embeddings independientes, a costa de requerir un forward pass por cada candidato.

Esta versión MLX, publicada por fcmeyer, conserva todos los pesos en bfloat16 sin cuantizar, lo que la convierte en la conversión de mayor fidelidad respecto al checkpoint original. El repositorio incluye el script `rerank.py` para su uso directo, así como los archivos de configuración necesarios para reproducir la puntuación mediante el logit del token "Yes". La verificación incluida en la model card demuestra que la implementación MLX iguala o supera el ruido de bfloat16 de PyTorch en términos de error absoluto y correlación de rankings.

El modelo está pensado para tareas de reranking en pipelines de recuperación de información, especialmente en entornos con hardware Apple Silicon, donde MLX ofrece un rendimiento significativamente superior a PyTorch con MPS. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en Qwen3-4B (Transformer) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32k (según mención en la model card) |
| Tipos de cuantizacion | bf16 (sin cuantizar); existen versiones cuantizadas en otros repos (8-bit) |
| Idiomas soportados | en (según model card del repo; el modelo base original es multilingüe según el artículo de ZeroEntropy) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX bf16) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura Transformer de Qwen3-4B. A diferencia de los modelos de embeddings bi-encoder, procesa la consulta y el documento juntos en una única pasada, generando una puntuación de relevancia. No posee una cabeza de clasificación; en su lugar, el par se formatea mediante la plantilla de chat con la consulta como `system` y el documento como `user`, y la puntuación se obtiene del logit del token id 9454 (`"Yes"`) en la posición final. Esta técnica permite calibrar la relevancia de forma más precisa que los métodos tradicionales.

No se proporcionan detalles sobre el proceso de entrenamiento (datos, número de tokens, técnicas de fine-tuning como RLHF o DPO) en la información disponible. El artículo de ZeroEntropy menciona que el modelo original soporta instrucciones nativas y tiene paridad multilingüe en más de 100 idiomas, pero estos datos no se detallan en la model card de esta conversión MLX.

## Capacidades

- Reranking de documentos: asigna una puntuación de relevancia a pares (consulta, documento) mediante un cross-encoder.
- Puntuación calibrada: el logit del token "Yes" se puede transformar con `sigmoid(score/5)` para obtener un valor entre 0 y 1.
- Soporte de instrucciones: según el artículo de ZeroEntropy, el modelo original puede seguir instrucciones en la consulta para afinar la búsqueda (por ejemplo, "documentos sobre finanzas de 2023").
- Multilingüe (según el artículo de ZeroEntropy): el modelo base soporta más de 100 idiomas, aunque la model card de esta conversión solo declara inglés.
- No incluye tool calling, generación de texto ni capacidades de agente; es exclusivamente un modelo de reranking.

## Casos de uso

- Mejora de resultados en búsqueda semántica: integrar el reranker tras un primer filtrado con embeddings para reordenar los candidatos más relevantes, reduciendo el ruido en motores de búsqueda internos.
- Recuperación aumentada por generación (RAG): en pipelines de RAG, el reranker selecciona los fragmentos más pertinentes de una base de conocimiento antes de pasarlos al modelo generativo, mejorando la calidad de las respuestas.
- Filtrado de documentos legales: en entornos jurídicos, el modelo puede puntuar la relevancia de cláusulas o sentencias frente a una consulta específica, acelerando la revisión de expedientes.
- Análisis de literatura científica: para investigadores, permite ordenar artículos según su relevancia a una pregunta de investigación, utilizando el contexto de 32k para procesar resúmenes extensos.
- Atención al cliente: en sistemas de tickets, el reranker prioriza las respuestas de una base de conocimientos que mejor resuelven la consulta del usuario, reduciendo el tiempo de resolución.
- Búsqueda en código: dado que el modelo base fue entrenado con dominios de código, puede reranker fragmentos de código fuente frente a una consulta técnica, útil en asistentes de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento (como NDCG, MRR o precisión) en la información disponible. La model card incluye una verificación de fidelidad entre la implementación MLX y PyTorch, que se resume a continuación:

| vs. PyTorch float32 (486 pares) | PyTorch bfloat16 | MLX bf16 |
|---|---|---|
| Error absoluto medio | 0.0546 | 0.0548 |
| Error absoluto p99 | 0.1930 | 0.1848 |
| Error absoluto máximo | 0.3274 | 0.2172 |
| Correlación Spearman | 0.999605 | 0.999654 |
| Kendall τ medio por consulta | 0.979285 | 0.978934 |
| Inversiones de ranking | 24 | 24 |
| Inversiones resolubles | 0 | 0 |
| Cambios de veredicto de relevancia | 0 | 0 |

En una muestra independiente de 1449 pares de BEIR (FiQA, SciFact, NFCorpus), los resultados son similares, confirmando que la conversión MLX no introduce degradación relevante respecto al bfloat16 de PyTorch.

## Requisitos de hardware

- Al ser una conversión MLX, está optimizado para Apple Silicon (M1, M2, M3, M4 y sucesores).
- Memoria estimada: el repositorio pesa 8.1 GB en bf16, por lo que se recomienda al menos 16 GB de RAM unificada para cargar el modelo y ejecutar inferencias sin problemas. Con 8 GB podría funcionar, pero con riesgo de intercambio a disco.
- No requiere GPU dedicada; utiliza la GPU integrada y la memoria unificada del chip Apple.
- Opciones de despliegue: uso directo con el script `rerank.py` incluido en el repositorio, o mediante la librería `mlx-lm`. También existe un sidecar HTTP en el repositorio de 199-biotechnologies para integración en servicios.
- Latencia y throughput: no se proporcionan datos específicos, pero el repositorio de 199-biotechnologies afirma ser 10× más rápido que PyTorch con MPS.

## Comparativa con modelos similares

No se dispone de comparativas cuantitativas con otros rerankers (como BGE-reranker, Cohere rerank o cross-encoders de SentenceTransformers) en la información proporcionada. El artículo de ZeroEntropy afirma que zerank-2 supera a todos los rerankers existentes en precisión y latencia, pero no se incluyen cifras concretas. Por tanto, no se puede establecer una comparación rigurosa con los datos disponibles.

## Limitaciones y advertencias

- Los scores son comparables únicamente dentro de una misma consulta; no son comparables entre consultas diferentes.
- Al ser un cross-encoder, requiere un forward pass por cada par (consulta, documento), lo que puede ser costoso en colecciones grandes.
- La model card del repositorio declara solo inglés, aunque el modelo base original es multilingüe; se recomienda verificar el comportamiento en otros idiomas antes de usarlo en producción.
- No se han documentado sesgos específicos en la información disponible, pero al ser un modelo de lenguaje puede reflejar sesgos presentes en sus datos de entrenamiento.
- La longitud de contexto está limitada a 32k tokens; documentos más largos se truncarán, lo que puede afectar a la precisión en textos extensos.
- Para uso en producción, se recomienda validar la calibración de los scores con datos propios, ya que la transformación `sigmoid(score/5)` es una heurística propuesta por el autor original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fcmeyer/zerank-2-reranker-MLX-bf16
- Modelo original: https://huggingface.co/zeroentropy/zerank-2-reranker
- Artículo de ZeroEntropy: https://www.zeroentropy.dev/articles/zerank-2-advanced-instruction-following-multilingual-reranker
- Repositorio GitHub de 199-biotechnologies (port MLX optimizado): https://github.com/199-biotechnologies/zerank-2-mlx
- Versión cuantizada 8-bit en MLX: https://huggingface.co/k8smee/zerank-2-reranker-mlx-8Bit
