# kernkraft/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio en un unico espacio vectorial compartido de 768 dimensiones. Con 740 millones de parametros totales, combina un backbone de texto de 270M (130M de transformer mas 140M de embedder) con encoders modulares de vision (170M) y audio (300M) que pueden cargarse de forma selectiva segun la modalidad necesaria.

El modelo esta disenado para ejecutarse en hardware de consumo, incluyendo moviles y portatiles, y esta orientado a tareas de representacion semantica de baja latencia en dispositivos: busqueda, generacion aumentada por recuperacion (RAG), clasificacion y clustering. Hereda las innovaciones arquitectonicas de la familia Gemma 4 y anade soporte nativo para mas de 100 idiomas, con una mejora de aproximadamente el 14% en tareas de codigo respecto a su predecesor.

Su relevancia actual radica en tres factores: la unificacion de cuatro modalidades en un solo espacio de embeddings, el soporte nativo de Matryoshka Representation Learning (MRL) que permite truncar los vectores a 128, 256 o 512 dimensiones con impacto minimo en calidad, y una ventana de contexto de 8.192 tokens que permite procesar minutos de audio o video en una sola pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion GQA/MQA, ventana deslizante y proyeccion 512 a 768 |
| Parametros totales | 740M (744.371.512 segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue (100+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

EmbeddingGemma 2 es un transformer de 24 capas con dimension de modelo de 512 y dimension oculta de 2.048. Utiliza atencion con query grouping (GQA) y multi-query (MQA), con 4 cabezas de atencion y 2/1 KV-heads en configuracion local/global. Emplea una ventana deslizante de 1.024 tokens con una relacion local:global de 5:1, activacion Gated FFN con GELU, mean pooling y una capa de proyeccion de 512 a 768 dimensiones. El vocabulario es de 262.144 tokens.

La modularidad es una de sus caracteristicas tecnicas principales: el backbone de texto (270M) puede combinarse opcionalmente con el encoder de vision (170M) y el de audio (300M), de modo que el desarrollador carga solo las modalidades que necesita. El modelo incorpora Matryoshka Representation Learning, que permite truncar los embeddings nativos de 768 dimensiones a 128, 256 o 512 dimensiones y renormalizarlos, reduciendo hasta 6 veces el coste de almacenamiento vectorial. Tambien utiliza prefijos de instruccion textuales ligeros para orientar las representaciones hacia tareas concretas (busqueda, clasificacion, clustering, similitud semantica). No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de embeddings multimodales unificados para texto, imagen, video y audio en un espacio compartido de 768 dimensiones.
- Procesamiento de texto incluyendo codigo, con una mejora de aproximadamente el 14% en tareas de codigo respecto a EmbeddingGemma 1.
- Extraccion de caracteristicas de imagen (image-feature-extraction) y similitud semantica entre imagenes y texto.
- Extraccion de caracteristicas de audio (audio-feature-extraction) y recuperacion audio-texto.
- Extraccion de caracteristicas de video (video-feature-extraction) y recuperacion video-texto.
- Soporte multilingue en mas de 100 idiomas.
- Representaciones guiadas por tarea mediante prefijos de instruccion textuales.
- Truncamiento MRL nativo a 128, 256 y 512 dimensiones con renormalizacion.
- Compatible con la libreria sentence-transformers y transformers.
- No se ha documentado soporte de tool calling, function calling ni modo de razonamiento multi-paso (no es un modelo generativo).

## Casos de uso

- Busqueda semantica on-device: el modelo puede indexar y consultar documentos en un portatil o movil gracias a su tamano de 740M parametros y su capacidad de ejecucion en hardware de consumo, con embeddings de 256 o 512 dimensiones para reducir el almacenamiento.
- RAG multimodal en produccion: permite recuperar fragmentos de texto, imagenes, audio y video relevantes para una consulta en un unico pipeline, usando la ventana de 8.192 tokens para procesar minutos de audio o video por documento.
- Clasificacion y clustering de contenido multimedia: los embeddings unificados permiten agrupar elementos heterogeneos (por ejemplo, clips de audio y sus transcripciones) en el mismo espacio vectorial, simplificando pipelines de moderacion o catalogacion.
- Busqueda de codigo en repositorios: con la mejora del 14% en tareas de codigo y el soporte de MTEB code, el modelo es adecuado para indexar fragmentos de codigo y recuperarlos por similitud semantica en herramientas de desarrollo.
- Recuperacion visual de documentos: con un rendimiento de 67,84 NDCG@5 en MMEB v2 VisDoc, puede usarse para buscar en documentos escaneados o capturas de pantalla mediante consultas textuales.
- Deduplicacion y similitud semantica multilingue: al soportar mas de 100 idiomas, permite detectar contenido duplicado o similar entre idiomas sin necesidad de traduccion previa.
- Sistemas de recomendacion basados en contenido: los embeddings multimodales permiten representar items de distinta naturaleza (texto, imagen, audio) en un mismo espacio para calcular similitud y generar recomendaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor con el checkpoint de precision completa y embeddings de 768 dimensiones:

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 65,67 | No disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | No disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | No disponible |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | No disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | No disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,87 | No disponible |

Resultados con truncamiento vectorial (MRL):

| Dimension | Ratio compresion | MTEB multilingual v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 overall | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completo) | 1:1 | 61,36 | 68,46 | 78,68 | 65,67 | 59,01 | 69,54 | 49,87 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 65,34 | 58,38 | 69,18 | 49,76 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 64,16 | 56,24 | 66,76 | 49,13 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,97 | 45,65 | 56,71 | 47,28 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en precision completa ocupa aproximadamente 1,5 GB (tamano del repositorio), por lo que la inferencia en FP16 requeriria en torno a 1,5-2 GB de VRAM, dependiendo de la implementacion y del tamaño de lote. No se dispone de cifras oficiales de VRAM por cuantizacion.
- GPU recomendadas: el modelo esta disenado para hardware de consumo (moviles y portatiles), por lo que tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. Para despliegues de mayor throughput se pueden usar A100 o H100, aunque no son necesarias.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer modernas con al menos 4 GB de VRAM, dado su tamano de 740M parametros.
- Opciones de despliegue: la model card menciona compatibilidad con transformers y sentence-transformers. No se ha documentado soporte explicito para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la informacion disponible; la model card indica que ofrece representaciones semanticas de baja latencia para aplicaciones on-device.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M | 8.192 tokens | Texto, imagen, video, audio | Apache 2.0 | Hugging Face (kernkraft/embeddinggemma-2) |
| EmbeddingGemma 1 | No disponible | No disponible | Texto | Apache 2.0 | Hugging Face (google/embeddinggemma-2) |
| Otros modelos de embeddings multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada solo permite comparar con EmbeddingGemma 1, cuyo rendimiento en MTEB multilingual v2 (61,15) y MTEB code v1 (68,76) es inferior al de EmbeddingGemma 2 (61,36 y 78,68 respectivamente). No se dispone de datos de otros modelos comparables de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, codigo ni respuestas; solo representaciones vectoriales.
- No se han documentado sesgos conocidos en la informacion disponible, pero al entrenarse con datos web multilingues es previsible que herede sesgos presentes en esos datos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud semantica puede producir recuperaciones irrelevantes si los embeddings se truncan demasiado (especialmente a 128 dimensiones, donde MMEB v2 cae a 45,65).
- Limitacion de contexto: la ventana de 8.192 tokens limita la cantidad de audio o video que puede procesarse por documento; para contenidos mas largos sera necesario dividirlos en fragmentos.
- Limitacion de idioma: aunque soporta mas de 100 idiomas, el rendimiento puede variar entre ellos y no se han publicado resultados desagregados por idioma.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia de Gemma 4, lo que conviene verificar antes de un despliegue comercial.
- Caveat para produccion: el modelo tiene solo 24 descargas y 0 likes en Hugging Face en el momento de la consulta, y el repositorio pertenece a un usuario (kernkraft) distinto del autor original (Google DeepMind), por lo que se recomienda verificar la procedencia de los pesos antes de usarlos en entornos productivos.

## Enlaces

- Hugging Face: https://huggingface.co/kernkraft/embeddinggemma-2
- Hugging Face (modelo original de Google): https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.37364
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma: https://deepmind.google/models/gemma/
