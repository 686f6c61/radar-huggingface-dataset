# onnx-community/embeddinggemma-2-ONNX

## Resumen

EmbeddingGemma 2 es un modelo abierto de embeddings multimodales desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio, y combinaciones de ellos, en un unico espacio vectorial de 768 dimensiones. La version aqui descrita, `onnx-community/embeddinggemma-2-ONNX`, es la conversion a formato ONNX mantenida por la comunidad ONNX, pensada para ejecutarse con Transformers.js en navegador y en Node.js, y por extension en entornos de inferencia ligeros.

El modelo tiene 740 millones de parametros en total, repartidos en un backbone de texto de 270M (130M de transformer mas 140M de embedder) y codificadores modulares cargables de forma selectiva: vision (170M) y audio (300M). La ventana de contexto es de 8192 tokens, suficiente para procesar minutos de audio o video transcritos o muestreados. Incorpora Matryoshka Representation Learning (MRL), que permite truncar las representaciones a 128, 256 o 512 dimensiones y renormalizarlas, reduciendo hasta seis veces el coste de almacenamiento vectorial.

Es relevante ahora porque combina tres tendencias: embeddings multimodales unificados, ejecucion en dispositivo (movil, portatil) y disponibilidad en ONNX con licencia Apache 2.0, lo que facilita despliegues en el navegador sin backend dedicado y su integracion en pipelines de busqueda semantica y RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4) con atencion GQA/MQA, sliding window y proyeccion 512→768 |
| Parametros totales | 740M (backbone texto 270M: 130M transformer + 140M embedder; vision 170M; audio 300M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (sliding window de 1024 tokens; relacion local:global 5:1) |
| Tipos de cuantizacion | No disponible en la model card; el repositorio incluye al menos un archivo `onnx/model_q4.onnx` segun la busqueda web |
| Idiomas soportados | Multilingue, mas de 100 idiomas; incluye codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repo de 6,2 GB) |

Datos arquitectonicos adicionales: 24 capas, dimension de modelo 512, dimension oculta 2048, tamano de vocabulario 262.144, 4 cabezas de atencion, 2 cabezas KV locales y 1 global, activacion Gated FFN con GELU y pooling por media. Dimension nativa de salida 768, con truncamiento MRL a 512, 256 y 128.

## Arquitectura y entrenamiento

EmbeddingGemma 2 parte de la arquitectura decoder de Gemma 4 adaptada a extraccion de caracteristicas. La columna vertebral de texto (270M) genera representaciones que se proyectan de 512 a 768 dimensiones mediante una capa de proyeccion y se agregan con mean pooling. Los codificadores de vision (170M) y audio (300M) son modulares y se pueden cargar de forma selectiva, de modo que un caso de uso solo texto no necesita cargar los 470M de parametros de vision y audio. La atencion combina GQA y MQA con una ventana deslizante de 1024 tokens y una relacion local:global de 5:1, lo que reduce el coste de atencion manteniendo un contexto efectivo de 8192 tokens.

La model card indica que el modelo construye sobre las capacidades de Gemma 4 y que su predecesor directo es EmbeddingGemma 1, pero no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion destacable es el uso de Matryoshka Representation Learning (MRL), que permite truncar el vector a 128, 256 o 512 dimensiones con perdida minima de calidad, y el uso de prefijos de instruccion de texto ligeros para orientar la representacion hacia tareas concretas (busqueda, clasificacion, clustering, similitud semantica). No disponible: datos de entrenamiento, composicion del dataset y proceso de alineacion.

## Capacidades

- Embeddings multimodales nativos: texto (incluido codigo), imagenes, video y audio en un unico espacio vectorial de 768 dimensiones.
- Combinacion de modalidades: permite generar embeddings de entradas mixtas (por ejemplo, texto e imagen conjuntamente).
- Multilingue: mas de 100 idiomas.
- Codigo: mejora de aproximadamente el 14 % en tareas de codigo respecto a EmbeddingGemma 1 (MTEB code v1 pasa de 68,76 a 78,68).
- Representaciones guiadas por tarea mediante prefijos de instruccion ligeros.
- Similitud semantica y sentence-similarity para tareas de recuperacion y comparacion.
- Truncamiento MRL a 128, 256 y 512 dimensiones con renormalizacion.
- Extraccion de caracteristicas de imagen, audio y video (image/audio/video-feature-extraction).
- No disponible: soporte de tool calling, function calling o comportamiento de agente. Es un modelo de embeddings, no un modelo generativo de instrucciones.

## Casos de uso

- Busqueda semantica en dispositivo: indexar y consultar documentos directamente en el navegador o en un portatil con Transformers.js y ONNX, sin enviar datos a un servidor, gracias a que el backbone de texto de 270M cabe en memoria reducida.
- RAG ligero en el navegador: generar embeddings de fragmentos de documentacion y de la consulta del usuario para recuperar contexto y alimentar a un LLM local, reduciendo el coste de infraestructura.
- Recuperacion multimodal: construir un unico indice donde conviven texto, imagenes, clips de video y audio, aprovechando el espacio compartido de 768 dimensiones para busquedas cruzadas (por ejemplo, consulta de texto que recupera audio).
- Clasificacion y clustering de contenido: agrupar articulos, tickets o publicaciones por similitud semantica usando los embeddings y, si se prioriza almacenamiento, truncarlos a 256 dimensiones.
- Moderacion y deduplicacion a escala: comparar embeddings de 128 o 256 dimensiones para detectar contenido duplicado o casi duplicado con un coste de almacenamiento hasta seis veces menor.
- Busqueda de codigo: localizar fragmentos de codigo relevantes a partir de una descripcion en lenguaje natural, apoyandose en la mejora especifica en tareas de codigo del modelo (MTEB code v1 de 78,68).
- Procesamiento de audio y video para transcripcion indexada: generar representaciones de segmentos de audio o video para busqueda posterior dentro de archivos multimedia, con contexto de 8192 tokens que cubre minutos de material.
- Sistemas de recomendacion por similitud: calcular vecinos mas cercanos sobre embeddings de productos, articulos o medios para recomendaciones basadas en contenido.

## Benchmarks y rendimiento

Resultados publicados en la model card (checkpoint de precision completa, 768 dimensiones):

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 64,64 | - |
| Imagen | MMEB v2 - Image | Mean(Task), Hit@1 | 57,28 | - |
| Imagen | MMEB v2 - VisDoc | Mean(Task), NDCG@5 | 67,84 | - |
| Video | MMEB v2 - Video | Mean(Task), Hit@1 | 50,67 | - |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | - |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,39 | - |

Resultados con truncamiento vectorial (MRL):

| Dimension | Ratio compresion | MTEB multilingue v2 | MTEB ingles v2 | MTEB code v1 | MIEB lite | MMEB v2 overall | MSEB retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

Segun la model card, la perdida de calidad es minima hasta 256 dimensiones, mientras que 128 dimensiones se recomienda solo para cargas de trabajo de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: con precision completa (fp32) el modelo de 740M ocupa aproximadamente 3 GB; en fp16 alrededor de 1,5 GB; en cuantizacion int8 en torno a 0,8 GB y en q4 alrededor de 0,4-0,5 GB. Son estimaciones calculadas a partir del numero de parametros, no cifras oficiales.
- Carga modular: si solo se usa texto, el backbone de 270M reduce el requisito a aproximadamente 0,5 GB en fp16 y menos de 0,2 GB en q4. Los codificadores de vision (170M) y audio (300M) se anaden solo si se necesitan.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para el modelo completo en fp16 (por ejemplo, GTX 1650, RTX 3050, RTX 4060, T4). Para lotes grandes o baja latencia, GPU de datacenter como A100 o H100 son utiles pero no necesarias.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo, e incluso en CPU y en dispositivos moviles.
- Opciones de despliegue: Transformers.js (navegador y Node.js) es la via principal de este repositorio ONNX. Tambien es compatible con ONNX Runtime y ONNX Runtime Web, y con servidores de inferencia que acepten ONNX.
- Latencia y throughput: no disponible en la informacion proporcionada. La model card menciona latencia baja como objetivo de diseno para on-device, pero no publica cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma 2 (este ONNX) | 740M (270M texto + 170M vision + 300M audio) | 8192 tokens | 768 (MRL 128/256/512) | Apache 2.0 | HuggingFace (ONNX, Transformers.js) |
| EmbeddingGemma 1 | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |
| onnx-community/embeddinggemma-300m-ONNX | No disponible (familia 300M) | No disponible | No disponible | Apache 2.0 | HuggingFace |

Comparativa de rendimiento entre EmbeddingGemma 2 y su predecesor, segun la model card: MTEB multilingual v2 pasa de 61,15 a 61,36; MTEB code v1 pasa de 68,76 a 78,68 (mejora de aproximadamente el 14 %). No se dispone de datos de otros modelos de embeddings multimodales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings. No genera texto, no responde instrucciones y no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de recuperacion irrelevante si los embeddings se usan para busqueda o RAG con corpus mal segmentados.
- Sesgos: no disponible informacion especifica sobre sesgos en la model card. Al ser un modelo multilingue entrenado sobre datos web, es razonable esperar sesgos culturales y de representacion, pero no se documentan.
- Limitacion de contexto: la ventana de 8192 tokens y la sliding window de 1024 tokens implican que entradas muy largas deben segmentarse.
- Truncamiento: por debajo de 256 dimensiones la calidad cae de forma notable en tareas multimodales (MMEB v2 overall baja de 59,01 a 45,65 en 128d); 128 dimensiones solo se recomienda para texto.
- Licencia Apache 2.0, permisiva para uso comercial. La model card base enlaza a la licencia de Gemma 4, por lo que conviene revisar los terminos de uso de Google si se despliega el modelo base subyacente.
- Este repositorio es una conversion mantenida por la comunidad ONNX, no por Google; puede no incluir todas las variantes de cuantizacion ni estar sincronizada con actualizaciones del modelo original.
- La model card no detalla el dataset de entrenamiento ni el proceso de alineacion, lo que dificulta auditar el comportamiento en dominios especificos.
- Algunos tags del repositorio (vision, audio, video) implican la carga de codificadores adicionales; en produccion conviene cargar solo las modalidades necesarias para no incrementar el consumo de memoria.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Pagina de DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Blog de DeepMind sobre EmbeddingGemma 2: https://deepmind.google/blog/embeddinggemma-2-an-open-lightweight-multimodal-embedding-model/
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Repositorio relacionado en ONNX: https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX
- Archivo de cuantizacion q4: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX/blob/refs%2Fpr%2F1/onnx/model_q4.onnx
