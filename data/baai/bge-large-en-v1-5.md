# BAAI/bge-large-en-v1.5

## Resumen

bge-large-en-v1.5 es un modelo de embeddings de texto en inglés desarrollado por BAAI (Beijing Academy of Artificial Intelligence) dentro de la familia BGE (BAAI General Embedding). No es un modelo generativo: es un encoder basado en BERT que transforma texto en vectores densos de 1024 dimensiones, pensados para búsqueda semántica, recuperación de información, agrupamiento y similitud entre frases. Cuenta con 335.142.400 parámetros y se distribuye bajo licencia MIT.

La versión 1.5 corrige el principal defecto de la v1: en la primera generación, frases poco relacionadas producían puntuaciones de similitud artificialmente altas, lo que dificultaba fijar umbrales de relevancia. La v1.5 mantiene la misma API de uso pero ofrece una distribución de similitudes más razonable, y llegó a situarse entre los mejores modelos de su tamaño en el benchmark MTEB en el momento de su publicación (septiembre de 2023).

Su relevancia actual es eminentemente práctica: con ~335 M de parámetros cabe en cualquier GPU de consumo e incluso en CPU, y su licencia MIT permite uso comercial sin restricciones. Es una pieza habitual en pipelines RAG, motores de búsqueda vectorial, deduplicación de corpus y sistemas de recomendación basados en contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), solo encoder, sin decodificador |
| Parametros totales | 335.142.400 |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia del encoder BERT; no se explicita en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio incluye pesos PyTorch, safetensors y ONNX |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (`pytorch_model.bin`), ONNX |
| Dimension del embedding | 1024 |
| Tamano del repositorio | 7,0 GB |
| Libreria principal | sentence-transformers / transformers |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT estándar (no MoE, no SSM, no híbrida) con 335 M de parámetros que produce un único vector denso de 1024 dimensiones por secuencia, normalizado para similitud coseno. La información proporcionada no detalla la composición exacta del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO (no aplicables en un modelo de representación). El repositorio referencia varios artículos de arXiv, entre ellos el trabajo de la familia BGE/C-Pack, que describen la metodología general: preentrenamiento sobre corpus a gran escala, ajuste débilmente supervisado con pares de textos y ajuste supervisado con datos de alta calidad.

La innovación diferencial de la v1.5 no es arquitectónica, sino de calibración: se reajusta el modelo para que la distribución de puntuaciones de similitud sea más informativa. Además, en tareas de recuperación la familia BGE recomienda anteponer una instrucción a las consultas cortas cuando se buscan pasajes largos. Para reordenar los top-k documentos devueltos por este modelo, el autor publica cross-encoders específicos (`BAAI/bge-reranker-base` y `BAAI/bge-reranker-large`), que no forman parte de este repositorio.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para frases, parrafos y documentos de hasta 512 tokens.
- Busqueda semantica y recuperacion de informacion (retrieval) en ingles: el modelo asigna vectores cercanos a textos semanticamente equivalentes.
- Similitud entre frases (STS) y deteccion de duplicados o near-duplicates.
- Clasificacion de texto mediante embeddings congelados mas un clasificador ligero.
- Agrupamiento (clustering) de documentos por contenido semantico.
- Reordenacion (reranking) de resultados usando similitud coseno, con la opcion de encadenar un cross-encoder de la familia bge-reranker para mayor precision.
- Ejecucion en CPU, GPU y aceleradores mediante ONNX, ademas de integracion con librerias estandar de embeddings.
- No genera texto, no razona, no hace tool calling, no soporta agentes ni multi-step reasoning y no tiene capacidades de vision ni audio. Es exclusivamente un modelo de representacion.
- No soporta otros idiomas distintos del ingles: las etiquetas del repositorio declaran unicamente `en`.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): indexar una base documental en ingles con este modelo y recuperar los fragmentos mas relevantes para alimentar a un LLM generativo. Su ventana de 512 tokens encaja con la estrategia habitual de trocear documentos en fragmentos.
- Busqueda semantica en documentacion tecnica: permite consultas en lenguaje natural sobre manuales, changelogs o tickets de soporte sin depender de coincidencia exacta de palabras clave.
- Deduplicacion de corpus: calcular la similitud coseno entre pares de documentos para eliminar contenido repetido antes de entrenar otros modelos o de poblar un indice.
- Moderacion y clasificacion de contenido: usar los embeddings como caracteristicas de entrada para clasificadores de bajo coste (por ejemplo, categorizacion de reclamaciones o deteccion de spam).
- Sistemas de recomendacion basados en contenido: representar articulos, noticias o productos y recuperar los mas cercanos a los que ya ha consumido un usuario.
- Reordenacion de resultados de un motor de busqueda: primera fase con recuperacion lexica o vectorial y segunda fase con similitud coseno de este modelo, opcionalmente seguida de un cross-encoder bge-reranker.
- Analisis de similitud de patentes, articulos cientificos o expedientes: agrupar y explorar colecciones grandes mediante clustering sobre los vectores generados.
- Memoria semantica en asistentes: almacenar interacciones previas como vectores para recuperar contexto relevante en conversaciones futuras.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index del repositorio (todos con `verified: false`, es decir, no verificados de forma independiente). El model-index incluido en la informacion disponible esta truncado, por lo que no representa el conjunto completo de tareas MTEB evaluadas.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Classification | MTEB AmazonCounterfactualClassification (en) | accuracy / F1 / AP | 75,85 / 69,69 / 38,57 |
| Classification | MTEB AmazonPolarityClassification | accuracy / F1 / AP | 92,42 / 92,39 / 89,19 |
| Classification | MTEB AmazonReviewsClassification (en) | accuracy / F1 | 48,18 / 47,81 |
| Classification | MTEB Banking77Classification | accuracy / F1 | 87,79 / 87,77 |
| Retrieval | MTEB ArguAna | nDCG@10 / recall@10 / MAP@10 / MRR@10 | 63,54 / 88,41 / 55,65 / 55,96 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | MAP@10 | 43,67 (entrada truncada) |
| Clustering | MTEB ArxivClusteringP2P | v-measure | 48,57 |
| Clustering | MTEB ArxivClusteringS2S | v-measure | 43,19 |
| Clustering | MTEB BiorxivClusteringP2P | v-measure | 39,71 |
| Clustering | MTEB BiorxivClusteringS2S | v-measure | 36,90 |
| Reranking | MTEB AskUbuntuDupQuestions | MAP / MRR | 64,47 / 77,82 |
| STS | MTEB BIOSSES | Spearman (cos_sim) | 84,65 |

No se proporcionan en la informacion disponible la puntuacion media agregada de MTEB ni resultados de otros benchmarks (MMLU, HumanEval, GSM8K), que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion derivada del numero de parametros): aproximadamente 1,3 GB en fp32 solo para pesos y unos 0,7 GB en fp16, mas el coste de activaciones y el lote. En la practica, un despliegue tipico funciona con 1-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona holgadamente en NVIDIA T4, RTX 3060, RTX 4090, A10G, L4, A100 y H100. No necesita GPU de centro de datos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas con 4 GB o mas. Tambien es viable en CPU (Apple Silicon, x86 con AVX2) con latencias mayores.
- Opciones de despliegue: sentence-transformers y transformers (PyTorch), ONNX Runtime, HuggingFace Text Embeddings Inference (etiqueta `text-embeddings-inference` presente en el repositorio), despliegue gestionado en Amazon SageMaker y Azure (etiquetas `deploy:sagemaker` y `deploy:azure`). No aparece vLLM entre las etiquetas oficiales del repositorio.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de inserciones por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAAI/bge-large-en-v1.5 | 335 M | 1024 | 512 tokens (BERT) | MIT | HuggingFace, ONNX, TEI, SageMaker, Azure |
| BAAI/bge-base-en-v1.5 | 109 M | 768 | 512 tokens (BERT) | MIT | HuggingFace |
| BAAI/bge-small-en-v1.5 | 33 M | 384 | 512 tokens (BERT) | MIT | HuggingFace |
| BAAI/bge-large-en (v1) | 335 M | 1024 | 512 tokens (BERT) | MIT | HuggingFace (el autor recomienda migrar a v1.5) |
| intfloat/e5-large-v2 | 335 M | 1024 | no disponible en la informacion proporcionada | MIT | HuggingFace (referencia externa, no verificada en la busqueda) |

No se dispone de comparativas de rendimiento entre estos modelos dentro de la informacion proporcionada: las cifras de MTEB de la seccion anterior corresponden unicamente a bge-large-en-v1.5. El propio autor indica que bge-large-en-v1.5 sustituye a bge-large-en por su mejor calibracion de similitudes.

## Limitaciones y advertencias

- Idioma: unicamente ingles. No esta entrenado ni evaluado para castellano; su uso en espanol dara resultados degradados.
- Modelo encoder-only: no genera texto, no responde preguntas por si mismo, no ejecuta herramientas ni mantiene conversaciones. Cualquier caso de uso generativo requiere emparejarlo con un LLM.
- Ventana de 512 tokens: documentos largos deben trocearse, lo que puede fragmentar el contexto y perjudicar la recuperacion.
- Alucinacion: no aplica en el sentido generativo, pero si puede producir falsos positivos de relevancia (recuperar fragmentos poco relacionados como si lo estuvieran). Los umbrales de similitud deben calibrarse por dominio.
- Prefijo de instruccion: segun la documentacion de la familia BGE, en tareas de recuperacion conviene anteponer una instruccion a las consultas cortas. Omitirla degrada la calidad de la busqueda.
- Sesgos: no se documentan evaluaciones de sesgo, equidad o toxicidad en la informacion disponible. Al derivar de corpus web en ingles, es esperable que herede sesgos de esos datos.
- Benchmarks autodeclarados: todos los resultados del model-index estan marcados como no verificados, y el listado proporcionado esta truncado.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero no incluye garantias ni indemnizacion. Conviene revisar la procedencia de los datos de entrenamiento si el despliegue es en un sector regulado.
- Tamano del repositorio: 7,0 GB, muy superior al peso real de los parametros, porque incluye varios formatos de pesos (PyTorch, safetensors y ONNX). Conviene descargar solo los ficheros necesarios.
- Reproduccion de similitudes: aunque la v1.5 corrige la distribucion de puntuaciones de la v1, los valores absolutos de similitud no son comparables entre modelos distintos; hay que fijar umbrales por modelo y por dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAAI/bge-large-en-v1.5
- Version anterior (v1): https://huggingface.co/BAAI/bge-large-en
- Documentacion de la familia BGE (v1 y v1.5): https://bge-model.com/bge/bge_v1_v1.5.html
- Repositorio FlagEmbedding (codigo de entrenamiento y uso): https://github.com/FlagEmbedding/FlagEmbedding
- Cross-encoder para reranking: https://huggingface.co/BAAI/bge-reranker-base y https://huggingface.co/BAAI/bge-reranker-large
- Papers referenciados en el repositorio: https://arxiv.org/abs/2401.03462, https://arxiv.org/abs/2312.15503, https://arxiv.org/abs/2311.13534, https://arxiv.org/abs/2310.07554, https://arxiv.org/abs/2309.07597
- Resumen y casos de uso (terceros): https://www.aimodels.fyi/models/huggingFace/bge-large-en-v15-baai
- Guia de autoalojamiento y despliegue (terceros): https://llmapi.ai/models/baai-bge-large-en-v1-5/
