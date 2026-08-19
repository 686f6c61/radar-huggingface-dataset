# kwondw/reranker-MiniLM-L12-H384-uncased-msmarco-margin-mse

## Resumen

El modelo `kwondw/reranker-MiniLM-L12-H384-uncased-msmarco-margin-mse` es un cross-encoder de reranking de texto desarrollado por el usuario kwondw a partir del modelo base `microsoft/MiniLM-L12-H384-uncased`. Está diseñado para puntuar pares de texto (consulta-documento) y reordenar resultados de búsqueda o recuperación semántica. Se entrenó sobre el dataset MS MARCO utilizando la función de pérdida MarginMSELoss, una técnica habitual para optimizar la relevancia relativa entre documentos.

Con 33,36 millones de parámetros y una longitud máxima de secuencia de 512 tokens, es un modelo ligero y eficiente, adecuado para entornos con recursos limitados. Su relevancia actual radica en su uso como componente de reranking en pipelines de retrieval augmented generation (RAG) y sistemas de búsqueda empresarial, donde permite mejorar la precisión de los resultados sin un coste computacional elevado. El modelo está disponible en formato safetensors y es compatible con la librería sentence-transformers y Text Embeddings Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (BertForSequenceClassification) |
| Parametros totales | 33.360.385 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura BERT, concretamente sobre `microsoft/MiniLM-L12-H384-uncased`, una variante de 12 capas con 384 dimensiones ocultas. A diferencia de los bi-encoders, el cross-encoder procesa la consulta y el documento de forma conjunta como una única secuencia, lo que permite capturar interacciones finas entre ambos textos a costa de un mayor coste por par. La salida es un único logit que representa la relevancia.

El entrenamiento se realizó sobre el dataset MS MARCO (con tamaños de dataset de 1.990.000 y 500.000 registros según los tags) utilizando la pérdida MarginMSELoss, que optimiza la diferencia de puntuación entre documentos relevantes y no relevantes. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre técnicas adicionales como RLHF o DPO. El modelo se generó con la librería sentence-transformers y el framework de entrenamiento de Hugging Face.

## Capacidades

- Reranking de pares de texto: puntúa la relevancia entre una consulta y un documento, devolviendo un valor continuo.
- Búsqueda semántica: puede reordenar listas de candidatos obtenidas mediante recuperación inicial (por ejemplo, con bi-encoders o BM25).
- Clasificación de relevancia binaria: el logit de salida puede umbralizarse para clasificar pares como relevantes o no relevantes.
- Soporte de integración con sentence-transformers: carga directa mediante `CrossEncoder` y métodos `predict` y `rank`.
- Compatible con Text Embeddings Inference y endpoints de Hugging Face.
- Multilingüe: no, solo inglés.

## Casos de uso

- Reranking en pipelines RAG: tras una primera recuperación con un bi-encoder o BM25, el modelo reordena los top-k documentos para mejorar la precisión de las respuestas generadas por un LLM. Su tamaño reducido permite ejecutarlo en paralelo con baja latencia.
- Búsqueda empresarial interna: integrado en motores de búsqueda de documentación técnica o legal, donde se necesita priorizar los resultados más relevantes sobre un corpus extenso.
- Filtrado de candidatos en sistemas de recomendación: puntúa pares usuario-ítem o consulta-producto para descartar opciones irrelevantes antes de una etapa más costosa.
- Evaluación de calidad de pares en datasets: sirve como anotador automático para medir la relevancia de pares generados por otros modelos.
- Chatbots de atención al cliente: reordena respuestas candidatas de una base de conocimiento para seleccionar la más adecuada a la consulta del usuario.
- Clasificación de tickets de soporte: asigna tickets a categorías o artículos de ayuda existentes mediante la puntuación de relevancia entre el texto del ticket y las soluciones documentadas.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el model-index son los siguientes:

| Dataset | MAP | MRR@10 | NDCG@10 |
|---|---|---|---|
| NanoMSMARCO R100 | 0,6055 | 0,5978 | 0,6684 |
| NanoNFCorpus R100 | 0,3550 | 0,6030 | 0,4159 |
| NanoNQ R100 | 0,6762 | 0,6895 | 0,7250 |
| NanoBEIR R100 (media) | 0,5456 | 0,6301 | 0,6031 |

Estos valores corresponden a la tarea de cross-encoder reranking sobre los subconjuntos Nano de los datasets BEIR. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en FP32 y 67 MB en FP16 (33,36 M parámetros × 4 bytes o 2 bytes por parámetro).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; funciona en GPUs consumer como GTX 1060, RTX 2060, RTX 4090, y también en CPUs sin problema.
- Cabe en consumer GPU: sí, incluso en las más modestas.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, o exportación a ONNX para entornos de producción.
- Latencia y throughput estimados: al ser un modelo de 33 M parámetros, la inferencia por par es del orden de milisegundos en GPU (típicamente < 10 ms) y de decenas de milisegundos en CPU. No se dispone de cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Como referencia, existen otros cross-encoders de la familia MiniLM entrenados sobre MS MARCO, como `cross-encoder/ms-marco-MiniLM-L-6-v2` (22,7 M parámetros) o `cross-encoder/ms-marco-MiniLM-L-12-v2` (33,4 M parámetros), que suelen presentar métricas similares en tareas de reranking. Sin embargo, no se pueden aportar cifras concretas sin verificar sus model cards. La licencia de este modelo es desconocida, lo que puede limitar su uso comercial frente a alternativas con licencias permisivas como Apache 2.0.

## Limitaciones y advertencias

- Idioma: solo soporta inglés; no es adecuado para textos en otros idiomas sin un fine-tuning adicional.
- Longitud de contexto limitada a 512 tokens: documentos más largos deben truncarse, lo que puede perder información relevante.
- Sesgos: al estar entrenado sobre MS MARCO, puede reflejar sesgos presentes en las consultas y documentos de ese dataset (por ejemplo, predominio de contenido web en inglés).
- Riesgo de alucinación: como modelo de puntuación, no genera texto, pero puede asignar puntuaciones altas a pares irrelevantes si el dominio difiere del entrenamiento.
- Licencia no disponible: no se especifica la licencia, lo que genera incertidumbre legal para uso comercial o redistribución.
- Sin soporte para tool calling, agentes o razonamiento multi-paso: es un modelo de clasificación puro, no un LLM generativo.
- Sin cuantizaciones publicadas: el repo solo contiene safetensors en precisión completa; para reducir memoria habría que cuantizar manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kwondw/reranker-MiniLM-L12-H384-uncased-msmarco-margin-mse
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- Documentación de sentence-transformers: https://sbert.net
- Documentación de cross-encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers: https://github.com/huggingface/sentence-transformers
- Paper de MiniLM (arxiv 1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Margin MSE (arxiv 2010.02666): https://arxiv.org/abs/2010.02666
