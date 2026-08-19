# neuralforgequantum/ms-marco-MiniLM-L12-v2

## Resumen

El modelo `neuralforgequantum/ms-marco-MiniLM-L12-v2` es un cross-encoder de reranking entrenado sobre el corpus MS MARCO Passage Ranking, un conjunto de datos a gran escala creado a partir de consultas reales del buscador Bing. Desarrollado originalmente por el equipo de Sentence-Transformers (UKPLab) y publicado bajo licencia Apache-2.0, este modelo resuelve el problema de ordenar pasajes de texto según su relevancia para una consulta dada, un paso crítico en pipelines de recuperación de información.

Arquitectónicamente se basa en `microsoft/MiniLM-L12-H384-uncased`, una versión destilada de BERT con 12 capas y una dimensión oculta de 384, lo que le confiere un tamaño compacto de aproximadamente 33,4 millones de parámetros. A diferencia de los bi-encoders que generan embeddings independientes, un cross-encoder procesa conjuntamente la consulta y el pasaje, logrando una precisión superior a costa de una mayor latencia por par. El modelo está diseñado específicamente para la tarea de text-ranking y se integra fácilmente con la librería `sentence-transformers` mediante la clase `CrossEncoder`.

Su relevancia actual radica en que sigue siendo una referencia sólida y ligera para tareas de reranking en sistemas de búsqueda semántica, especialmente en entornos con recursos limitados. Aunque existen modelos más grandes y modernos, este ofrece un equilibrio excelente entre rendimiento (NDCG@10 de 74.31 en TREC DL 19) y velocidad (960 documentos por segundo en una V100), lo que lo convierte en una opción práctica para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L12-H384-uncased, 12 capas, hidden size 384) |
| Parametros totales | 33.360.897 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (típico de BERT, no confirmado en la ficha) |
| Tipos de cuantizacion | No disponible (formatos: safetensors, pytorch, jax, onnx, openvino) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también disponibles en pytorch, jax, onnx, openvino) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura MiniLM, una técnica de destilación de conocimiento que comprime BERT manteniendo un rendimiento cercano al original. Con 12 capas y una dimensión oculta de 384, tiene aproximadamente la mitad de parámetros que BERT-base, lo que lo hace más eficiente en memoria y cómputo. La entrada consiste en la concatenación de la consulta y el pasaje separados por el token `[SEP]`, y la salida es un único logit que representa la relevancia.

El entrenamiento se realizó sobre el dataset MS MARCO Passage Ranking, que contiene más de 500.000 pares consulta-pasaje anotados con relevancia binaria. El procedimiento de entrenamiento sigue la metodología descrita en los ejemplos oficiales de Sentence-Transformers, utilizando una pérdida de clasificación binaria (binary cross-entropy) sobre los pares. No se aplicaron técnicas de RLHF ni DPO; el modelo es un clasificador supervisado clásico. Una innovación destacable es su integración con el pipeline de retrieve & rerank, donde actúa como segunda etapa para refinar los resultados obtenidos por un bi-encoder o un buscador lexical.

## Capacidades

- Reranking de pasajes: dado un query y un pasaje, produce un score de relevancia continuo que permite ordenar una lista de candidatos.
- Clasificación de pares de texto: puede usarse para cualquier tarea de clasificación binaria sobre pares de secuencias (por ejemplo, verificación de similitud semántica).
- Integración con Sentence-Transformers: compatible con la clase `CrossEncoder` para predicción directa sobre listas de pares.
- Compatible con Hugging Face Transformers: puede cargarse como `AutoModelForSequenceClassification` para uso en pipelines personalizados.
- Soporte para inferencia en múltiples frameworks: pesos disponibles en PyTorch, JAX, ONNX y OpenVINO, facilitando despliegue en diferentes entornos.
- Multilingüe: no, solo inglés. No soporta otros idiomas de forma nativa.

## Casos de uso

- Reranking en motores de búsqueda semántica: tras una primera recuperación con un bi-encoder (por ejemplo, `ms-marco-MiniLM-L6-v2`), el modelo reordena los pasajes candidatos para mejorar la precisión de los resultados. Es adecuado porque su alta velocidad (960 docs/seg en V100) permite procesar listas de hasta cientos de pasajes sin penalizar la latencia.
- Sistemas de preguntas y respuestas: en un pipeline de QA extractivo, se usa para seleccionar el pasaje más relevante de una colección antes de extraer la respuesta. Su capacidad para modelar la interacción entre consulta y pasaje mejora la precisión frente a métodos basados solo en similitud coseno.
- Búsqueda en bases de conocimiento corporativas: empresas con documentación interna pueden desplegar este modelo para rerankear resultados de búsqueda sobre manuales, wikis o tickets de soporte, reduciendo el tiempo de resolución de incidencias.
- Filtrado de noticias o artículos: dado un tema de interés, el modelo puede ordenar artículos por relevancia, ayudando en tareas de monitorización de medios o agregación de contenido.
- Generación de datasets de entrenamiento: puede usarse como oráculo para etiquetar automáticamente pares de texto en otros dominios, creando datos de entrenamiento para bi-encoders más ligeros.
- Evaluación de similitud semántica en inglés: aunque su entrenamiento es específico para ranking, puede adaptarse con fine-tuning para tareas de STS (semantic textual similarity) con resultados razonables.

## Benchmarks y rendimiento

La model card original reporta los siguientes resultados en TREC Deep Learning 2019 (NDCG@10) y MS MARCO Dev (MRR@10), junto con la velocidad de inferencia en una GPU V100:

| Modelo | NDCG@10 (TREC DL 19) | MRR@10 (MS MARCO Dev) | Docs/seg (V100) |
|---|---|---|---|
| **ms-marco-MiniLM-L12-v2** | **74.31** | **39.02** | **960** |
| ms-marco-MiniLM-L6-v2 | 74.30 | 39.01 | 1800 |
| ms-marco-MiniLM-L4-v2 | 73.04 | 37.70 | 2500 |
| ms-marco-MiniLM-L2-v2 | 71.01 | 34.85 | 4100 |
| ms-marco-TinyBERT-L2-v2 | 69.84 | 32.56 | 9000 |
| nboost/pt-bert-base-uncased-msmarco | 70.94 | 34.75 | 340 |
| Capreolus/electra-base-msmarco | 71.23 | 36.89 | 340 |

El modelo ofrece el mejor NDCG@10 de su familia (empate técnico con la versión L6) y un MRR@10 superior a todos los modelos comparados, con un coste de latencia moderado. Es una opción óptima cuando se prioriza precisión sobre velocidad pura.

## Requisitos de hardware

- VRAM estimada: el modelo en fp32 ocupa aproximadamente 133 MB (33,4M parámetros × 4 bytes). En fp16 se reduce a ~67 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 2060, etc.) puede ejecutarlo sin problemas. Para despliegue a gran escala, una V100 o A10 ofrece throughput de ~960 docs/seg.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en GPUs de gama baja e incluso en CPU para cargas pequeñas.
- Opciones de despliegue: se puede servir con `sentence-transformers` directamente, o mediante `transformers` con `AutoModelForSequenceClassification`. Para producción, se recomienda usar `vLLM` o `Text Generation Inference` (TGI) si se integra en un pipeline de LLM, aunque al ser un modelo de clasificación, también es posible usar ONNX Runtime para aceleración en CPU.
- Latencia: en una V100, la inferencia por par tarda aproximadamente 1 ms (960 docs/seg). En CPU (8 núcleos) puede rondar los 10-20 ms por par.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NDCG@10 (TREC DL 19) | MRR@10 (MS MARCO) | Licencia |
|---|---|---|---|---|---|
| **ms-marco-MiniLM-L12-v2** | 33,4M | 512 | 74.31 | 39.02 | Apache-2.0 |
| ms-marco-MiniLM-L6-v2 | 22,7M | 512 | 74.30 | 39.01 | Apache-2.0 |
| ms-marco-MiniLM-L4-v2 | 15,4M | 512 | 73.04 | 37.70 | Apache-2.0 |
| ms-marco-TinyBERT-L2-v2 | 4,4M | 512 | 69.84 | 32.56 | Apache-2.0 |
| nboost/pt-bert-base-uncased-msmarco | 110M | 512 | 70.94 | 34.75 | Apache-2.0 |

La versión L12 ofrece el mejor rendimiento de la familia MiniLM, superando a modelos más grandes como BERT-base en ambas métricas, con un tercio de sus parámetros. Frente a la versión L6, la diferencia es mínima (0.01 en NDCG@10 y 0.01 en MRR@10), por lo que la elección entre ambas dependerá del presupuesto de latencia: L6 es el doble de rápido.

## Limitaciones y advertencias

- Idioma: el modelo solo está entrenado para inglés. No debe usarse con textos en otros idiomas sin fine-tuning previo, ya que el rendimiento degrada drásticamente.
- Ventana de contexto: limitada a 512 tokens (típico de BERT). Pasajes más largos deben truncarse, lo que puede perder información relevante.
- Sesgo del dataset: MS MARCO se construyó a partir de consultas de Bing, por lo que el modelo puede estar sesgado hacia patrones de búsqueda anglosajones y temas populares en ese corpus.
- Alucinación: al ser un clasificador y no un generador, no produce texto inventado, pero puede asignar scores altos a pasajes irrelevantes si el vocabulario solapa superficialmente con la consulta.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, siempre que se incluya el aviso de licencia.
- Rendimiento en dominios especializados: no ha sido entrenado en dominios técnicos o médicos específicos; para esos casos se recomienda fine-tuning con datos propios.
- Dependencia de la primera etapa de recuperación: como reranker, su calidad depende de que el recuperador inicial (bi-encoder o lexical) devuelva candidatos plausibles. No puede compensar una recuperación deficiente.

## Enlaces

- Modelo en Hugging Face (este repositorio): https://huggingface.co/neuralforgequantum/ms-marco-MiniLM-L12-v2
- Modelo original de cross-encoder: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L12-v2
- Documentación oficial de Sentence-Transformers sobre cross-encoders MS MARCO: https://www.sbert.net/docs/pretrained-models/ce-msmarco.html
- Ejemplo de retrieve & rerank: https://www.sbert.net/examples/applications/retrieve_rerank/README.html
- Código de entrenamiento en GitHub: https://github.com/UKPLab/sentence-transformers/tree/master/examples/cross_encoder/training/ms_marco
- Repositorio de ejemplo en GitHub (inferless): https://github.com/inferless/MS-marco-MiniLM-L-12-v2
