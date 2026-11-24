# Fatoumataa/embedding_bambara_v3_monolingual

## Resumen

`embedding_bambara_v3_monolingual` es un modelo de embeddings de frases desarrollado por el usuario Fatoumataa, obtenido mediante fine-tuning de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`. Su funcion es proyectar frases y parrafos a un espacio vectorial denso de 768 dimensiones, optimizado especificamente para similitud semantica en bambara (bamanankan), una lengua mande hablada principalmente en Mali. El modelo se publica bajo la libreria sentence-transformers y usa una arquitectura XLM-RoBERTa como backbone.

El problema que aborda es la escasez de modelos de representacion densa de calidad para lenguas de bajos recursos. La mayoria de los modelos multilingues genericos rinden de forma deficiente en bambara porque el idioma apenas aparece en los corpus de preentrenamiento. Este fine-tuning, realizado con TripletLoss sobre un conjunto de 2.145 ejemplos, busca mejorar la recuperacion de informacion y la similitud semantica en ese idioma concreto.

El modelo tiene 278 millones de parametros, una ventana maxima de 128 tokens y salida de 768 dimensiones. Es relevante ahora porque la mayoria de los pipelines RAG y de busqueda semantica asumen cobertura de lenguas africanas de forma implicita, y este tipo de adaptaciones monoingles cubren ese hueco con un coste de inferencia bajo. La informacion publica es escasa: no se declaran licencia, idiomas soportados ni detalles del dataset de entrenamiento mas alla del tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer denso) fine-tuneado como SentenceTransformer |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (maxima secuencia) |
| Tipos de cuantizacion | no disponible (pesos safetensors en FP32/FP16; no se publican variantes GGUF ni ONNX) |
| Idiomas soportados | no disponibles declarados; el nombre y los ejemplos de la model card apuntan a bambara (bamanankan) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 6,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de `paraphrase-multilingual-mpnet-base-v2`, que es un XLM-RoBERTa-base adaptado con entrenamiento de similitud de pares. Sobre esa base se aplica un fine-tuning con `TripletLoss`, una funcion que aprende a acercar el ancla a la frase positiva y a alejarla de la negativa en el espacio de embeddings. El conjunto de entrenamiento declarado tiene 2.145 ejemplos, un volumen muy reducido que sugiere un ajuste de dominio mas que un reentrenamiento profundo. No se especifica el numero de tokens totales ni la composicion del corpus.

La salida es un vector denso de 768 dimensiones con similitud coseno como metrica de comparacion. La longitud maxima de secuencia es de 128 tokens, lo que limita el uso a frases y parrafos cortos; no es adecuado para documentos largos sin troceado previo. La model card incluye ejemplos de pares en bambara y en frances, lo que sugiere que el autor evaluo el modelo en un contexto bilingue aunque el nombre indique "monolingual". No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de embeddings de frases y parrafos cortos (hasta 128 tokens) en un espacio de 768 dimensiones.
- Similitud semantica textual (semantic textual similarity) mediante distancia coseno.
- Busqueda semantica y recuperacion de informacion densa en bambara.
- Mineria de parafrasis y deteccion de duplicados.
- Clustering y clasificacion de textos a partir de los embeddings generados.
- Extraccion de caracteristicas (feature extraction) para pipelines posteriores.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un encoder, no un modelo generativo.
- No dispone de capacidades de vision ni audio.

## Casos de uso

- Busqueda semantica en corpus en bambara: indexar documentos y consultas como vectores de 768 dimensiones y recuperar por similitud coseno; adecuado para archivos de ONG, medios locales o documentacion comunitaria en Mali.
- RAG sobre documentacion en bambara: usar el modelo como retriever en un pipeline de generacion aumentada, alimentando a un LLM generativo con los pasajes recuperados; el limite de 128 tokens obliga a trocear los documentos en fragmentos cortos.
- Deduplicacion de contenidos: agrupar noticias, entradas de FAQ o registros de bases de datos en bambara detectando pares con alta similitud coseno.
- Clasificacion de textos sin etiquetar: generar embeddings y entrenar un clasificador ligero encima para categorizar mensajes, quejas o consultas ciudadanas.
- Moderacion y triaje de mensajes: agrupar mensajes similares en un centro de atencion para priorizar respuestas, usando el modelo como capa de clustering previa.
- Investigacion linguistica comparada: medir proximidad semantica entre expresiones en bambara y sus traducciones al frances, aprovechando los ejemplos bilingues de la model card.
- Construccion de datasets de pares de frases: minar parafrasis en corpus no etiquetados para aumentar datos de entrenamiento de otros modelos en la lengua.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card para la tarea de recuperacion de informacion sobre el conjunto "bambara val". No estan verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,51 |
| Cosine Accuracy@3 | 0,575 |
| Cosine Accuracy@5 | 0,6 |
| Cosine Accuracy@10 | 0,61 |
| Cosine Precision@3 | 0,1917 |
| Cosine Precision@5 | 0,12 |
| Cosine Precision@10 | 0,061 |
| Cosine Recall@3 | 0,575 |
| Cosine Recall@5 | 0,6 |
| Cosine Recall@10 | 0,61 |
| Cosine NDCG@10 | 0,5610 |
| Cosine MRR@10 | 0,5451 |
| Cosine MAP@100 | 0,5506 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos de embeddings en bambara.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1 GB en FP32 (278 M parametros) y aproximadamente 0,6 GB en FP16. El repo ocupa 6,7 GB, probablemente por incluir checkpoints intermedios de entrenamiento ademas de los pesos finales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI), vLLM en modo embedding, FastAPI con transformers, y exportacion a ONNX para CPU. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversion previa.
- Latencia y throughput: no disponibles. Con 278 M parametros y secuencias de 128 tokens, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| Fatoumataa/embedding_bambara_v3_monolingual | 278 M | 128 tokens | 768 | no disponible | Fine-tune con TripletLoss sobre 2.145 ejemplos en bambara |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 128 tokens | 768 | Apache 2.0 | Modelo base; cobertura multilingue generica, rendimiento limitado en bambara |
| sentence-transformers/LaBSE | 471 M | 256 tokens | 768 | Apache 2.0 | Embeddings multilingues con mejor cobertura de lenguas de bajos recursos, pero mayor coste |
| intfloat/multilingual-e5-base | 278 M | 512 tokens | 768 | MIT | Contexto mayor y buen rendimiento multilingue, aunque sin ajuste especifico en bambara |

La comparativa se basa en caracteristicas publicas de los modelos; no hay evaluaciones cruzadas en el conjunto "bambara val" disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana de contexto de solo 128 tokens: no admite documentos largos sin troceado previo, lo que puede degradar la recuperacion en pasajes extensos.
- Dataset de entrenamiento muy reducido (2.145 ejemplos): riesgo de sobreajuste al dominio y baja generalizacion a registros o dominios no representados.
- No se declara licencia: no se puede asumir uso comercial sin consultar al autor; tratar como uso restringido hasta confirmacion.
- No se declaran idiomas soportados oficialmente; el nombre indica bambara, pero los ejemplos mezclan frances, por lo que el comportamiento fuera de ese par linguistico es incierto.
- Riesgo de sesgo derivado de la composicion del corpus de entrenamiento, no documentada.
- Al ser un encoder de similitud, no genera texto; no debe usarse como sustituto de un LLM en tareas generativas.
- Resultados de benchmarks no verificados y sin comparacion con lineas base, lo que impide situar su mejora real frente al modelo original.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fatoumataa/embedding_bambara_v3_monolingual
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de XLM-R (arXiv:1703.07737): https://arxiv.org/abs/1703.07737
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
