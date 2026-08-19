# kwondw/reranker-MiniLM-L12-H384-uncased-gooaq-cmnrl

## Resumen

El modelo `kwondw/reranker-MiniLM-L12-H384-uncased-gooaq-cmnrl` es un cross-encoder de reordenamiento de textos, desarrollado a partir del modelo base `microsoft/MiniLM-L12-H384-uncased` y ajustado sobre el dataset GooAQ mediante la librería sentence-transformers. Su función principal es asignar una puntuación a pares de textos (consulta-documento), lo que permite reordenar resultados de búsqueda o filtrar candidatos en pipelines de recuperación semántica.

Se trata de un modelo ligero, con aproximadamente 33,4 millones de parámetros y una longitud máxima de secuencia de 512 tokens, lo que lo hace adecuado para entornos con recursos limitados. Su relevancia actual radica en que ofrece una alternativa eficiente y de código abierto (licencia Apache 2.0) para tareas de reranking en sistemas de búsqueda y respuesta a preguntas, un componente crítico en arquitecturas RAG (Retrieval-Augmented Generation).

El entrenamiento se realizó sobre el dataset GooAQ, compuesto por pares de preguntas y respuestas de Google, utilizando la función de pérdida CachedMultipleNegativesRankingLoss. El modelo está diseñado exclusivamente para texto en inglés y se distribuye en formato safetensors, compatible con la librería sentence-transformers y con el ecosistema de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en MiniLM-L12-H384 (BertForSequenceClassification) |
| Parametros totales | 33.360.385 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de cross-encoder basada en el transformer MiniLM-L12-H384 de Microsoft, con 12 capas y una dimensión oculta de 384. A diferencia de los bi-encoders, que codifican consulta y documento por separado, el cross-encoder procesa el par de textos de forma conjunta, lo que permite una mayor interacción entre ambos y, en general, una puntuación de relevancia más precisa, a costa de un mayor coste computacional por par.

El entrenamiento se realizó sobre el dataset GooAQ, que contiene pares de preguntas y respuestas, utilizando la función de pérdida CachedMultipleNegativesRankingLoss. Esta pérdida está diseñada para entrenar modelos de ranking con ejemplos negativos muestreados dentro del lote, lo que mejora la capacidad del modelo para distinguir entre documentos relevantes e irrelevantes. El modelo base fue congelado y ajustado para la tarea de clasificación de secuencias con una única etiqueta de salida, que representa la puntuación de relevancia.

## Capacidades

- Reordenamiento de resultados de búsqueda: asigna una puntuación de relevancia a pares consulta-documento, permitiendo reordenar listas de candidatos.
- Búsqueda semántica: puede utilizarse como etapa de reranking tras una primera recuperación con bi-encoders o BM25.
- Respuesta a preguntas: ajustado sobre GooAQ, es especialmente adecuado para seleccionar la respuesta correcta entre varias candidatas.
- Clasificación de pares de textos: puede emplearse para cualquier tarea que requiera puntuar la relación entre dos textos.
- Integración con sentence-transformers: compatible con la API CrossEncoder de la librería, lo que facilita su uso en pipelines existentes.
- Inferencia eficiente: con solo 33 millones de parámetros, es adecuado para entornos con CPU o GPUs de baja capacidad.

## Casos de uso

- Sistemas de búsqueda empresarial: el modelo puede reordenar los resultados devueltos por un buscador interno, mejorando la precisión de las búsquedas sobre documentación corporativa. Su tamaño reducido permite desplegarlo en servidores con recursos limitados.
- Pipelines RAG (Retrieval-Augmented Generation): en un sistema de generación aumentada por recuperación, el modelo actúa como reranker entre los documentos recuperados inicialmente, seleccionando los más relevantes antes de pasarlos al generador. Su ventana de 512 tokens es suficiente para fragmentos de texto típicos.
- Atención al cliente automatizada: puede utilizarse para seleccionar la respuesta más adecuada de una base de conocimiento en función de la consulta del usuario, mejorando la calidad de los chatbots y asistentes virtuales.
- Búsqueda de respuestas en foros y comunidades: dado su entrenamiento sobre GooAQ, es especialmente útil para reordenar hilos de preguntas y respuestas, priorizando aquellos que mejor responden a la consulta del usuario.
- Filtrado de candidatos en sistemas de recomendación: puede puntuar la relevancia entre un perfil de usuario y elementos candidatos, mejorando la personalización de recomendaciones basadas en texto.
- Análisis de documentos legales o científicos: el modelo puede reordenar pasajes relevantes dentro de un corpus extenso, facilitando la tarea de revisión documental en ámbitos como el legal o el académico.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor del modelo en la model card. Se presentan dos conjuntos de métricas por dataset: las primeras corresponden al modelo base sin ajustar y las segundas al modelo ajustado.

| Dataset | Metrica | Modelo base | Modelo ajustado |
|---|---|---|---|
| NanoMSMARCO R100 | Map | 0.0431 | 0.1689 |
| NanoMSMARCO R100 | Mrr@10 | 0.0182 | 0.2119 |
| NanoMSMARCO R100 | Ndcg@10 | 0.036 | 0.2917 |
| NanoNFCorpus R100 | Map | 0.2652 | 0.3154 |
| NanoNFCorpus R100 | Mrr@10 | 0.3674 | 0.4878 |
| NanoNFCorpus R100 | Ndcg@10 | 0.2403 | 0.3292 |
| NanoNQ R100 | Map | 0.0378 | 0.3009 |
| NanoNQ R100 | Mrr@10 | 0.0145 | 0.3705 |
| NanoNQ R100 | Ndcg@10 | 0.0293 | 0.4285 |
| NanoBEIR R100 mean | Map | 0.1154 | 0.2617 |
| NanoBEIR R100 mean | Mrr@10 | 0.1334 | 0.3567 |
| NanoBEIR R100 mean | Ndcg@10 | 0.1019 | 0.3498 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 33 millones de parámetros, la inferencia puede ejecutarse en CPU sin problemas. En GPU, el consumo de VRAM es inferior a 1 GB en precisión fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1650 o superiores son adecuados. También puede ejecutarse en CPU para cargas de trabajo moderadas.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU de consumo actual, incluidas las de gama de entrada.
- Opciones de despliegue: puede desplegarse mediante la librería sentence-transformers, Hugging Face Inference Endpoints, o servidores de inferencia como Text Embeddings Inference (TEI). También es compatible con frameworks como ONNX Runtime para optimización en CPU.
- Latencia y throughput estimados: no se dispone de datos oficiales de latencia. No obstante, por su tamaño, se espera una latencia de milisegundos por par de textos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| kwondw/reranker-MiniLM-L12-H384-uncased-gooaq-cmnrl | 33,4 M | 512 tokens | Apache 2.0 | Reranking de pares consulta-documento |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | 33,4 M | 512 tokens | Apache 2.0 | Reranking sobre MS MARCO |
| BAAI/bge-reranker-base | 278 M | 512 tokens | MIT | Reranking multilingue |

El modelo de kwondw comparte arquitectura y tamaño con el conocido `cross-encoder/ms-marco-MiniLM-L-12-v2`, pero se diferencia en el dataset de entrenamiento (GooAQ frente a MS MARCO), lo que puede influir en su comportamiento en dominios de preguntas y respuestas. Frente a `BAAI/bge-reranker-base`, ofrece una ventaja en eficiencia computacional a costa de un menor rendimiento en tareas multilingues.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés. No es adecuado para tareas en otros idiomas sin un ajuste adicional.
- Longitud de contexto: la ventana de 512 tokens limita el tamaño de los pares de texto que pueden procesarse. Documentos más largos deben truncarse o dividirse.
- Sesgos del dataset: al entrenarse sobre GooAQ, el modelo puede reflejar los sesgos presentes en las preguntas y respuestas de Google, incluyendo posibles desequilibrios temáticos o demográficos.
- Riesgo de alucinación: aunque es un modelo de ranking y no de generación, puede asignar puntuaciones altas a pares de texto que no sean realmente relevantes, especialmente si el dominio difiere del de entrenamiento.
- Rendimiento en dominios especializados: el modelo puede degradarse en dominios muy técnicos o especializados que no estén bien representados en GooAQ.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de licencia.
- Sin cuantizaciones publicadas: no se han publicado versiones cuantizadas del modelo, por lo que la inferencia en entornos muy limitados puede requerir conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kwondw/reranker-MiniLM-L12-H384-uncased-gooaq-cmnrl
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- Documentación de sentence-transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers: https://github.com/huggingface/sentence-transformers
- Dataset GooAQ: https://huggingface.co/datasets/sentence-transformers/gooaq
