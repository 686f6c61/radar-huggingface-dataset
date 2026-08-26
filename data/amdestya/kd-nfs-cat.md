# Amdestya/kd-nfs-cat

## Resumen

`Amdestya/kd-nfs-cat` es un modelo cross-encoder de reranking desarrollado por el usuario Amdestya, especializado en puntuar pares de textos para tareas de búsqueda semántica y reordenación de resultados. Está construido sobre el modelo base `microsoft/MiniLM-L12-H384-uncased`, un transformer BERT de 12 capas con 384 dimensiones ocultas, y ha sido ajustado mediante la librería sentence-transformers con una función de pérdida `FitMixinLoss` sobre un conjunto de datos de 992 ejemplos. El nombre del modelo sugiere un proceso de destilación de conocimiento (knowledge distillation, "kd") aplicado a un sistema de recuperación, aunque los detalles exactos del método no están documentados en la ficha pública.

Con 33,36 millones de parámetros y una longitud máxima de contexto de 256 tokens, este modelo está diseñado para ser ligero y eficiente, apto para despliegue en entornos con recursos limitados. Su pipeline es `text-ranking`, lo que lo hace directamente utilizable para reranking de documentos en sistemas de recuperación de información. La ausencia de licencia declarada y de información sobre idiomas supone una limitación importante para su uso en producción, especialmente en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (MiniLM-L12-H384-uncased) |
| Parametros totales | 33.360.385 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base es monolingüe ingles, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder, una arquitectura que procesa simultáneamente un par de textos (consulta y documento) concatenados y separados por un token especial, produciendo una puntuación de relevancia mediante una cabeza de regresión de una sola salida. A diferencia de los bi-encoders, que generan embeddings independientes, el cross-encoder permite una interacción completa entre los tokens de ambos textos, lo que suele dar resultados más precisos en reranking a costa de mayor coste computacional por par.

La base es `microsoft/MiniLM-L12-H384-uncased`, un modelo BERT destilado de 12 capas y 384 dimensiones ocultas, conocido por su buen equilibrio entre rendimiento y eficiencia. El ajuste fino se realizó con la librería sentence-transformers, utilizando la pérdida `FitMixinLoss` (una variante de pérdida para entrenamiento de cross-encoders) sobre un dataset de solo 992 ejemplos, lo que sugiere un entrenamiento con datos limitados, probablemente orientado a un dominio específico. No se han publicado detalles sobre el número de épocas, el optimizador o la composición exacta del dataset. El nombre "kd-nfs-cat" podría indicar destilación de conocimiento desde un modelo mayor y algún mecanismo de selección de características negativas, pero no hay documentación que lo confirme.

## Capacidades

- Puntuación de pares de textos: asigna una puntuación de relevancia a cada par (consulta, documento), utilizable para ordenar resultados.
- Reranking de resultados de búsqueda: puede reordenar listas de documentos devueltas por un sistema de recuperación inicial (por ejemplo, BM25 o un bi-encoder).
- Búsqueda semántica: integrable en pipelines de búsqueda para mejorar la precisión de los resultados.
- Compatible con la API `CrossEncoder` de sentence-transformers, incluyendo métodos `predict` y `rank`.
- Soporte para inferencia a través de Text Embeddings Inference (TEI) y endpoints compatibles, según las etiquetas del repositorio.
- No se han documentado capacidades de generación de texto, tool calling, agentes o multimodalidad; es un modelo puramente discriminativo para ranking.

## Casos de uso

- Reranking en motores de búsqueda internos: dado un conjunto de documentos recuperados por un método rápido (BM25, TF-IDF), el modelo puede reordenarlos por relevancia real, mejorando la calidad de los resultados en portales de documentación o intranets.
- Búsqueda semántica en dominios específicos: si se dispone de un corpus especializado (por ejemplo, artículos médicos o legales), el modelo puede ajustarse o usarse directamente para puntuar pares consulta-documento, como se muestra en los ejemplos de la model card (preguntas sobre anatomía, nutrición, etc.).
- Sistemas de preguntas y respuestas extractivas: como componente de reranking tras una fase de recuperación, seleccionando los pasajes más relevantes para alimentar a un modelo generativo.
- Filtrado de candidatos en pipelines de recomendación: puntuar pares (usuario, ítem) representados como texto para priorizar recomendaciones.
- Clasificación de pares de textos en entornos con recursos limitados: al ser un modelo pequeño (33M parámetros), puede ejecutarse en CPU o GPUs de gama baja, lo que lo hace adecuado para prototipos y despliegues edge.
- Evaluación de similitud entre documentos: puntuar la relevancia de pares de textos en tareas de deduplicación o agrupación, aunque su ventana de 256 tokens limita su uso a fragmentos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de reranking como nDCG o MRR en la model card ni en el repositorio. El autor no ha proporcionado comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 33,36 millones de parámetros, el modelo ocupa aproximadamente 133 MB en fp32 y unos 67 MB en fp16. Cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1050 Ti hasta una RTX 4090. No requiere hardware especializado.
- Compatible con CPU: sí, la inferencia en CPU es viable para cargas moderadas, aunque la latencia será mayor que en GPU.
- Opciones de despliegue: sentence-transformers (inferencia directa), Text Embeddings Inference (TEI) según las etiquetas del repo, y cualquier framework que soporte modelos ONNX o safetensors. También puede exportarse a ONNX para optimización.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo y la longitud de contexto de 256 tokens, se espera una latencia de milisegundos por par en GPU moderna, pero estos datos no están confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Amdestya/kd-nfs-cat | 33,36 M | 256 tokens | no disponible | Cross-encoder, base MiniLM-L12, sin benchmarks publicados |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | 33,36 M | 512 tokens | Apache 2.0 | Cross-encoder popular para reranking, entrenado con MS MARCO, benchmarks publicados |
| BAAI/bge-reranker-base | 278 M | 512 tokens | MIT | Cross-encoder más grande, mejor rendimiento en varios benchmarks, requiere más VRAM |

La comparativa se basa en características generales conocidas de estos modelos; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica ninguna licencia, lo que impide su uso comercial sin riesgo legal. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no especificados: aunque el modelo base es monolingüe inglés, no se confirma qué idiomas soporta el modelo ajustado. Su uso con textos en otros idiomas puede degradar el rendimiento.
- Dataset de entrenamiento muy pequeño (992 ejemplos): el ajuste fino con tan pocos datos puede provocar sobreajuste al dominio de entrenamiento y una generalización limitada a otros dominios.
- Longitud de contexto limitada a 256 tokens: no es adecuado para documentos largos; los textos deben truncarse, lo que puede perder información relevante.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad frente a alternativas establecidas como ms-marco-MiniLM-L-12-v2.
- Riesgo de alucinación no aplicable: al ser un modelo discriminativo (no generativo), no produce texto nuevo, pero sí puede asignar puntuaciones incorrectas si los datos de entrenamiento son sesgados o insuficientes.
- Sin documentación sobre el proceso de destilación: el nombre sugiere destilación desde un modelo mayor, pero no se detalla el método, lo que dificulta evaluar su robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Amdestya/kd-nfs-cat
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- Documentación de sentence-transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers en GitHub: https://github.com/UKPLab/sentence-transformers
- Modelo relacionado (mismo autor, variante con BM25): https://huggingface.co/Amdestya/kd-nfs-bm25cat
- Repositorio CAT-KD (posible referencia al método de destilación): https://github.com/GzyAftermath/CAT-KD
