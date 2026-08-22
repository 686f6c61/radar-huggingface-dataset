# ManasaKaza/knowledge-search-reranker-scifact-v1

## Resumen

El modelo `knowledge-search-reranker-scifact-v1` es un cross-encoder de reranking de texto desarrollado por ManasaKaza, ajustado a partir del modelo base `cross-encoder/ms-marco-MiniLM-L6-v2` mediante la librería Sentence Transformers. Su propósito es evaluar la relevancia de pares consulta-documento y reordenar resultados de búsqueda o de recuperación en sistemas de búsqueda semántica y RAG, con un enfoque específico en el dominio científico gracias al dataset SciFact.

Con 22,7 millones de parámetros y una longitud máxima de secuencia de 512 tokens, se trata de un modelo ligero y rápido, adecuado para entornos con recursos limitados. Su relevancia actual radica en que los rerankers de tipo cross-encoder son un componente clave en pipelines de recuperación aumentada por generación (RAG), donde mejoran la precisión de los resultados finales frente a la búsqueda vectorial pura. Al estar basado en MiniLM-L6-v2, ofrece un equilibrio entre rendimiento y eficiencia computacional.

La información disponible no especifica la licencia, los idiomas soportados ni detalles del dataset de entrenamiento más allá del nombre del modelo y la etiqueta `dataset_size:2932`. El modelo tiene 0 descargas y 0 likes, por lo que se trata de un artefacto de investigación con escasa difusión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForSequenceClassification (Cross-Encoder) |
| Parametros totales | 22.713.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura BERT, concretamente una cabecera de clasificación de secuencias sobre el modelo MiniLM-L6-v2. A diferencia de los bi-encoders que generan embeddings independientes para consulta y documento, un cross-encoder procesa conjuntamente el par de textos y produce una puntuación de relevancia mediante una capa de clasificación binaria. Esto permite capturar interacciones finas entre las palabras de ambos textos, lo que suele dar mayor precisión que los modelos de búsqueda vectorial, a costa de una mayor latencia.

El entrenamiento se realizó mediante la librería Sentence-transformers con la función de pérdida `BinaryCrossEntropyLoss` sobre un dataset de 2932 ejemplos, presumiblemente derivado de SciFact, un conjunto de datos de verificación de afirmaciones científicas. No se han publicado detalles sobre el número de épocas, la tasa de aprendizaje ni la composición exacta de los datos. El modelo base ya estaba pre-entrenado en MS-MARCO para tareas de reranking, por lo que el ajuste fino sobre SciFact pretende especializarlo en el dominio científico.

## Capacidades

- Reranking de pares de texto: dada una consulta y un documento, produce una puntuación de relevancia entre 0 y 1.
- Búsqueda semántica de segunda etapa: se puede usar para reordenar los resultados devueltos por un buscador vectorial o una base de datos.
- Adecuado para tareas de recuperación de información en el ámbito científico (biomedicina, física, etc.) gracias al ajuste sobre SciFact.
- Compatible con el ecosistema Sentence-transformers, lo que facilita su integración en pipelines existentes.
- Soporta secuencias de hasta 512 tokens, suficiente para la mayoría de abstracts y títulos de artículos científicos.
- No dispone de capacidades de tool calling, agentes, ni soporte multimodal; es exclusivamente para texto.

## Casos de uso

- Búsqueda de literatura científica: dado un enunciado de investigación, el modelo puede puntuar los abstracts recuperados y ordenarlos según su relevancia para la consulta, mejorando los resultados de motores como PubMed o Semantic Scholar.
- Verificación de afirmaciones científicas: en sistemas de fact-checking, el reranker puede priorizar los documentos que contienen evidencia más sólida para confirmar o refutar una afirmación.
- Recuperación aumentada por generación (RAG) en dominios técnicos: al integrarse en un pipeline RAG, el modelo reordena los documentos recuperados por un buscador vectorial y alimenta al LLM con las fuentes más relevantes, reduciendo alucinaciones.
- Asistencia a revisores de artículos: un sistema que recibe un resumen de un paper y debe encontrar los trabajos más relacionados puede usar este reranker para ordenar los candidatos antes de la revisión manual.
- Filtrado de noticias científicas: clasificar si un artículo de prensa se relaciona con un estudio concreto, puntuando pares título-contenido.
- Mejora de motores de búsqueda internos en repositorios de datos de investigación, donde la precisión de la relevancia es crítica y los documentos son cortos (títulos, abstracts).
- Análisis de patentes: ordenar patentes similares a una nueva invención, utilizando la capacidad de comparar texto técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como nDCG@10, MRR o precision sobre BEIR u otros conjuntos de evaluación. No se puede comparar cuantitativamente con otros modelos sin datos.

## Requisitos de hardware

- Inferencia en CPU: el modelo es pequeño (22,7 M de parámetros) y puede ejecutarse en CPU con baja latencia. Una sola inferencia sobre pares de hasta 512 tokens puede tardar entre 5 y 15 ms en un procesador moderno, dependiendo del hardware.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM es suficiente para el modelo en FP32 (aproximadamente 91 MB de pesos). Una RTX 3060 o superior permitiría procesar lotes pequeños con alta velocidad.
- Se puede ejecutar en hardware de consumo (GPU de 6 GB o más) sin problemas, e incluso en CPU pura para aplicaciones de baja frecuencia.
- Opciones de despliegue: el modelo es compatible con la librería Sentence-transformers, que permite cargarlo y usarlo directamente en Python. También puede exportarse a ONNX o TensorFlow para inferencia en otros entornos, y es compatible con `text-embeddings-inference` según los tags de HuggingFace.
- No se dispone de datos de latencia o throughput específicos para este modelo, pero al ser un cross-encoder pequeño, la latencia es dominada por la codificación conjunta del par de textos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Dominio | Puntuacion |
|---|---|---|---|---|---|
| `knowledge-search-reranker-scifact-v1` | 22,7 M | 512 tokens | no disponible | Científico (SciFact) | no publicada |
| `cross-encoder/ms-marco-MiniLM-L6-v2` (base) | 22,7 M | 512 tokens | Apache 2.0 | MS-MARCO (preguntas-respuestas) | nDCG@10 ~ 0.32 en BEIR (estimado) |
| `jina-reranker-v3` (listwise) | 570 M | 131k tokens | Apache 2.0 | Multilingüe, general | 61.94 nDCG@10 en BEIR |

El modelo base es el mismo que el original, por lo que la comparación se centra en el dominio de entrenamiento. `jina-reranker-v3` es un modelo más grande y moderno, con contexto mucho mayor y soporte multilingüe, pero también más pesado y con mayor coste de inferencia. No se dispone de datos de rendimiento del modelo de ManasaKaza para comparar directamente.

## Limitaciones y advertencias

- Licencia no especificada: no se conoce si el modelo puede usarse comercialmente o en entornos de producción. Antes de cualquier uso, es necesario contactar con el autor o verificar la licencia del modelo base (Apache 2.0) y la del dataset SciFact (CC BY 4.0, aunque no se confirma la licencia final del modelo).
- Longitud de contexto limitada a 512 tokens: no es adecuado para documentos largos sin segmentación previa.
- Idiomas soportados no documentados: probablemente solo inglés, ya que el dataset SciFact está en inglés, pero no se garantiza.
- Riesgo de alucinación en tareas de verificación de afirmaciones: como cualquier modelo de lenguaje, puede producir puntuaciones erróneas si el texto no está bien representado en el entrenamiento.
- Sesgos del dataset base: el modelo hereda los sesgos del MS-MARCO y de SciFact, que pueden reflejar sobre-representación de ciertas áreas científicas o estilos de redacción.
- No hay evidencia de evaluación rigurosa: no se publican métricas, por lo que su rendimiento real en producción es desconocido.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad. Usar en entornos críticos requiere una evaluación propia.
- No soporta entradas multimodales ni tareas de generación; es exclusivamente un clasificador de relevancia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ManasaKaza/knowledge-search-reranker-scifact-v1
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Dataset SciFact: https://huggingface.co/datasets/allenai/scifact
- Paper de SciFact (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Documentación de Sentence-transformers: https://sbert.net
- Documentación de Cross-Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
