# kwondw/reranker-ModernBERT-base-gooaq-lambda

## Resumen

El modelo `kwondw/reranker-ModernBERT-base-gooaq-lambda` es un cross-encoder de reranking entrenado a partir de `answerdotai/ModernBERT-base` sobre el conjunto de datos GooAQ, utilizando la función de pérdida LambdaLoss. Desarrollado con la librería sentence-transformers, este modelo puntúa pares de textos (consulta, documento) para reordenar resultados de búsqueda o filtrar candidatos en pipelines de recuperación. Su relevancia radica en que combina la arquitectura ModernBERT, que ofrece una ventana de contexto de 8192 tokens y una eficiencia mejorada frente a BERT clásico, con un entrenamiento específico para tareas de reranking, lo que lo hace adecuado para sistemas de búsqueda semántica y generación aumentada por recuperación (RAG). Con 149,6 millones de parámetros, es un modelo compacto que puede desplegarse en hardware de consumo, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross Encoder (ModernBertForSequenceClassification) |
| Parametros totales | 149.605.633 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (formato safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT-base, una arquitectura transformer encoder-only que incorpora mejoras modernas como atención con FlashAttention, embeddings rotatorios (RoPE) y normalización pre-LayerNorm, lo que permite manejar secuencias largas de hasta 8192 tokens con un coste computacional reducido respecto a BERT original. La capa de clasificación añade una única salida logit que representa la relevancia de la pareja consulta-documento.

El entrenamiento se realizó sobre el conjunto de datos GooAQ (preguntas y respuestas de Google), con un tamaño de dataset de 95.939 ejemplos, utilizando la pérdida LambdaLoss, diseñada para optimizar métricas de ranking como NDCG y MAP. El proceso se llevó a cabo con la librería sentence-transformers, partiendo de los pesos preentrenados de ModernBERT-base. No se dispone de información pública sobre el número total de pasos, tasa de aprendizaje o configuración exacta de hiperparámetros.

## Capacidades

- Reranking de pares de textos: dado un query y una lista de documentos candidatos, asigna una puntuación de relevancia a cada par.
- Búsqueda semántica: puede utilizarse como etapa de refinado tras un primer recuperador bi-encoder.
- Puntuación de similitud textual: devuelve un valor escalar que indica la relevancia entre dos textos.
- Manejo de contextos largos: gracias a los 8192 tokens de ventana, puede procesar documentos extensos sin truncamiento agresivo.
- Integración con pipelines de sentence-transformers y librerías compatibles como rerankers.
- Soporte para inferencia por lotes y ranking directo mediante el método `model.rank()`.

## Casos de uso

- Sistemas de generación aumentada por recuperación (RAG): el modelo reordena los fragmentos recuperados por un buscador denso o BM25 antes de pasarlos al generador, mejorando la precisión de las respuestas.
- Búsqueda semántica en bases de conocimiento: dado un query, se recuperan los 100 documentos más similares con un bi-encoder y el cross-encoder los reordena para mostrar los más relevantes.
- Filtrado de candidatos en motores de recomendación: puntuar pares usuario-elemento descritos textualmente para priorizar recomendaciones.
- Moderación de contenido: clasificar si un texto es relevante para un tema dado, por ejemplo en foros o redes sociales.
- Asistencia al cliente: reordenar artículos de ayuda o respuestas predefinidas según la consulta del usuario.
- Extracción de evidencias en dominios legales o médicos: seleccionar pasajes relevantes de largos documentos (hasta 8192 tokens) para responder preguntas específicas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index:

| Dataset | MAP | MRR@10 | NDCG@10 |
|---|---|---|---|
| gooaq dev | 0,7235 | 0,7220 | 0,7664 |
| NanoMSMARCO R100 | 0,4400 | 0,4276 | 0,5023 |
| NanoNFCorpus R100 | 0,3312 | 0,5754 | 0,3743 |
| NanoNQ R100 | 0,2867 | 0,2810 | 0,3538 |
| NanoBEIR R100 (media) | 0,3526 | 0,4280 | 0,4101 |

Estos valores corresponden a evaluaciones en conjuntos de validación reducidos (versiones "Nano" de BEIR). No se dispone de comparaciones con otros modelos en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el modelo ocupa aproximadamente 600 MB; en fp16, unos 300 MB; en int8, alrededor de 150 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU consumer moderna (NVIDIA RTX 2060 o superior, incluso CPUs con suficiente RAM). Para despliegues de alto rendimiento, una A10 o A100 ofrece mayor throughput.
- Compatible con GPUs consumer: sí, es un modelo pequeño que puede ejecutarse en una RTX 3060 o similar.
- Opciones de despliegue: sentence-transformers (inferencia nativa), Hugging Face Inference Endpoints, vLLM (con adaptación), Text Embeddings Inference (TEI) de Hugging Face, o librerías como `rerankers` de AnswerDotAI.
- Latencia y throughput: no se han publicado mediciones oficiales; en una GPU consumer se esperan decenas de milisegundos por par de textos en fp16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| kwondw/reranker-ModernBERT-base-gooaq-lambda | 149,6 M | 8192 | GooAQ + LambdaLoss | Apache 2.0 | Cross-encoder |
| tomaarsen/reranker-ModernBERT-base-gooaq-bce | 149,6 M | 8192 | GooAQ + BCE | Apache 2.0 | Cross-encoder |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 22,7 M | 512 | MS MARCO | Apache 2.0 | Cross-encoder |
| BAAI/bge-reranker-base | 278 M | 512 | Multilingüe | MIT | Cross-encoder |

El modelo comparte arquitectura y base con la versión `bce` de tomaarsen, diferenciándose en la función de pérdida. Frente a MiniLM, ofrece un contexto mucho mayor (8192 vs 512) a costa de más parámetros. No se dispone de comparativas directas de rendimiento entre estos modelos en los mismos conjuntos.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés: no se recomienda su uso para consultas o documentos en otros idiomas.
- Sesgos del dataset GooAQ: las preguntas y respuestas de Google pueden reflejar sesgos culturales o de conocimiento popular, lo que puede afectar a dominios especializados.
- Riesgo de alucinación: al ser un modelo de puntuación, no genera texto, pero puede asignar puntuaciones altas a pares irrelevantes si el contenido es engañoso.
- Dependencia de la calidad del recuperador inicial: su rendimiento depende de que los candidatos proporcionados contengan realmente la respuesta.
- Sin soporte para tareas generativas: no puede utilizarse para generar respuestas ni mantener conversaciones.
- No se han publicado análisis de sesgos ni evaluaciones de robustez ante ataques adversariales.
- El repositorio no incluye el script de entrenamiento (aunque existe una versión similar de tomaarsen que sí lo publica); la reproducibilidad completa no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kwondw/reranker-ModernBERT-base-gooaq-lambda
- Modelo equivalente de tomaarsen (con script de entrenamiento): https://huggingface.co/tomaarsen/reranker-ModernBERT-base-gooaq-lambda
- Variante con BCE loss: https://huggingface.co/tomaarsen/reranker-ModernBERT-base-gooaq-bce
- Repositorio de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
- Librería rerankers de AnswerDotAI: https://github.com/AnswerDotAI/rerankers
- Documentación de Cross Encoder en sentence-transformers: https://www.sbert.net/docs/cross_encoder/usage/usage.html
