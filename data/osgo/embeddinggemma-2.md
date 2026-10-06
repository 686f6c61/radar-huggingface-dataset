# OsGo/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo abierto de embeddings multimodales desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio —y combinaciones de ellos— en un unico espacio vectorial compartido de 768 dimensiones. La ficha que nos ocupa, `OsGo/embeddinggemma-2`, es un espejo (mirror/backup) sin modificaciones del repositorio oficial `google/embeddinggemma-2`, publicado bajo licencia Apache 2.0 y con 744.371.512 parametros totales confirmados en los pesos safetensors.

El modelo combina un backbone de texto de 270M parametros (130M de transformer mas 140M de embedder) con encoders de vision (170M) y audio (300M) que se pueden cargar de forma selectiva segun la modalidad necesaria. Su ventana de contexto es de 8.192 tokens, suficiente para procesar varios minutos de audio o video, y soporta Matryoshka Representation Learning (MRL) con truncado nativo a 128, 256 y 512 dimensiones, lo que permite reducir hasta 6 veces el coste de almacenamiento de vectores con un impacto minimo en calidad.

Es relevante ahora porque cubre un hueco poco atendido: un modelo de embeddings multimodal, multilingue (mas de 100 idiomas) y lo bastante pequeno para ejecutarse en hardware de consumo, portatiles e incluso dispositivos moviles. Esta pensado para busqueda semantica, RAG, clasificacion y clustering en el propio dispositivo, sin depender de APIs externas ni de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multimodal con encoders modulares; GQA/MQA, atencion local:global 5:1, activacion Gated FFN con GELU, mean pooling |
| Parametros totales | 744.371.512 (740M nominales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana deslizante de 1.024 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en precision completa; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Multilingue, mas de 100 idiomas (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales de arquitectura recogidos en la model card: 24 capas, dimension de modelo 512, dimension oculta 2048, tamano de vocabulario 262.144, 4 cabezas de atencion y 2/1 cabezas KV (local/global). Capa de proyeccion de 512 a 768 dimensiones. Dimension de salida nativa: 768; dimensiones truncables por MRL: 128, 256 y 512.

## Arquitectura y entrenamiento

EmbeddingGemma 2 se construye sobre los avances arquitectonicos de Gemma 4. Es un encoder transformer con 24 capas donde la atencion alterna capas locales y globales en una proporcion 5:1, con ventana deslizante de 1.024 tokens y atencion de tipo GQA/MQA (4 cabezas de consulta frente a 2/1 cabezas KV segun el tipo de capa). El pooling es de media y una capa de proyeccion final transforma las representaciones de 512 a 768 dimensiones.

La multimodalidad es nativa y modular: el modelo mantiene un unico espacio de embeddings compartido de 768 dimensiones, pero los encoders de cada modalidad se cargan por separado. Esto permite desplegar solo el backbone de texto (270M, adecuado para movil) o anadir vision (170M) y audio (300M) segun el caso de uso. Emplea representaciones dirigidas por tarea (task-steered representations) mediante prefijos de instruccion ligeros en texto, que optimizan el embedding para busqueda, clasificacion, clustering o similitud semantica. Sobre MRL, el entrenamiento anade soporte nativo para truncar y renormalizar los vectores a 128, 256 y 512 dimensiones.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de embeddings multimodales unificados en un espacio de 768 dimensiones para texto, imagenes, video y audio, incluidas combinaciones entre modalidades.
- Embeddings de texto multilingues: mas de 100 idiomas segun la model card.
- Embeddings de codigo, con una mejora de aproximadamente el 14 % en tareas de codigo respecto a EmbeddingGemma 1 segun el autor.
- Extraccion de caracteristicas de imagen (image-feature-extraction) y busqueda semantica de imagenes.
- Extraccion de caracteristicas de audio (audio-feature-extraction) y recuperacion de audio (audio retrieval).
- Extraccion de caracteristicas de video y recuperacion de video.
- Representaciones dirigidas por tarea mediante prefijos de instruccion en texto (busqueda, clasificacion, clustering, similitud semantica).
- Truncado nativo de embeddings por MRL a 128, 256 y 512 dimensiones con renormalizacion.
- Procesamiento de documentos visuales (visual document retrieval).
- No se menciona soporte de tool calling, function calling ni comportamiento agentico: es un modelo de embeddings, no generativo.
- No se menciona modo de razonamiento (thinking mode) ni generacion de texto libre.

## Casos de uso

- Busqueda semantica on-device: indexar y consultar documentacion en un portatil o movil sin conexion, gracias a los 270M parametros del backbone de texto y a los embeddings truncados a 256d que reducen el almacenamiento del indice.
- RAG multimodal: recuperar fragmentos relevantes de bases de conocimiento que mezclan texto e imagenes (manuales tecnicos, catalogos de producto) usando el encoder de vision junto al de texto en el mismo espacio vectorial.
- Recuperacion de audio: construir un buscador de segmentos de audio o podcasts mediante el encoder de audio de 300M, con ventanas de contexto de 8K tokens que cubren varios minutos de material.
- Analitica de video: indexar bibliotecas de video y permitir consultas en lenguaje natural sobre el contenido, usando el encoder de vision sobre fotogramas o clips.
- Clasificacion y etiquetado de contenido: usar los embeddings como caracteristicas de entrada para clasificadores ligeros en moderacion de contenido, enrutamiento de tickets de soporte o deteccion de duplicados.
- Deduplicacion y clustering de corpus multilingues: agrupar documentos similares en mas de 100 idiomas con vectores de 128d para minimizar coste de memoria en pipelines de gran volumen.
- Busqueda de codigo en repositorios internos: indexar funciones y fragmentos de codigo con el encoder de texto, aprovechando la mejora declarada en MTEB code.
- Recuperacion de documentos escaneados: usar la tarea de visual document para buscar en PDFs y formularios que no tienen texto extraible.
- Sistemas de recomendacion basados en contenido: comparar similitud entre items multimodales (texto, imagen, audio, video) dentro de un mismo espacio vectorial.

## Benchmarks y rendimiento

Resultados publicados en la model card con el checkpoint en precision completa (768d):

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingue, v2) | Mean(Task), multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), multiple | 64,64 | no disponible |
| Imagen | MMEB v2 (image) | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Video | MMEB v2 (video) | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), multiple | 49,39 | no disponible |

Resultados con truncado de vectores (MRL). La model card proporcionada solo incluye las filas de 768d y 512d; los valores para 256d y 128d no estan disponibles en la informacion facilitada:

| Dimension de salida | Ratio de compresion | MTEB multilingue v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 overall | MSEB retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| 128d | 1:6 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor indica que el impacto en calidad es minimo hasta 256d y que 128d es adecuado solo para cargas de trabajo exclusivamente de texto, pero no aporta las cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor): aproximadamente 1,5 GB en fp16 para los 744M parametros; unos 3 GB en fp32. El backbone de texto solo (270M) requeriria aproximadamente 0,5 GB en fp16.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, con margen amplio para el lote completo de modalidades.
- Disenado explicitamente para hardware de consumo, portatiles y dispositivos moviles, segun la model card.
- El diseno modular permite cargar solo el encoder de texto en entornos con memoria muy limitada y anadir vision o audio cuando sea necesario.
- Opciones de despliegue: la libreria declarada es transformers, con pipeline `feature-extraction`. Es compatible con sentence-transformers segun las etiquetas del repositorio. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible (dado que solo se publican pesos safetensors, llama.cpp y Ollama no serian utilizables sin una conversion previa a GGUF).
- Latencia y throughput: no disponibles. El autor solo menciona "baja latencia" de forma cualitativa, sin cifras.

## Comparativa con modelos similares

La informacion proporcionada solo ofrece comparacion directa contra EmbeddingGemma 1. El resto de alternativas del mercado no incluyen datos verificables en esta ficha.

| Modelo | Parametros | Contexto | Modalidades | Dimension de salida | Licencia | Resultados comparables |
|---|---|---|---|---|---|---|
| EmbeddingGemma 2 (OsGo/embeddinggemma-2) | 744M (270M texto + 170M vision + 300M audio) | 8.192 tokens | Texto, imagen, video, audio | 768d (MRL 128/256/512) | apache-2.0 | MTEB multilingue v2: 61,36; MTEB code v1: 78,68; MIEB lite: 64,64 |
| EmbeddingGemma 1 | no disponible en la informacion facilitada | no disponible | Texto | no disponible | no disponible | MTEB multilingue v2: 61,15; MTEB code v1: 68,76 |
| Otras alternativas de embeddings multilingues (por ejemplo variantes de la familia BGE, E5 o Jina) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Conclusion parcial: la mejora declarada frente a EmbeddingGemma 1 es de +9,92 puntos en MTEB code v1 (78,68 frente a 68,76) y de +0,21 puntos en MTEB multilingue v2 (61,36 frente a 61,15). La ventaja principal frente a la generacion anterior no es el rendimiento en texto puro, sino la incorporacion nativa de imagen, video y audio.

## Limitaciones y advertencias

- El repositorio `OsGo/embeddinggemma-2` es un espejo sin modificaciones de `google/embeddinggemma-2`. No es el repositorio oficial y no recibe soporte ni actualizaciones por parte del autor del espejo. Para incidencias hay que acudir al repositorio upstream.
- El repositorio no registra descargas ni likes en el momento de la consulta, y las fechas indicadas en HuggingFace (creacion 2026-10-06, actualizacion 2026-10-06) resultan anomales; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion.
- La model card enlaza la licencia a la pagina `gemma_4_license` etiquetada como Apache 2.0, mientras que el metadato del repositorio indica `apache-2.0`. Antes de un uso comercial conviene confirmar los terminos exactos aplicables al modelo upstream.
- Es un modelo de embeddings, no generativo: no produce texto ni respuestas, no soporta tool calling ni flujos agenticos.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de recuperacion irrelevante o falsos positivos en similitud semantica, especialmente en dominios muy especializados o idiomas con poca representacion.
- Cobertura multilingue declarada de mas de 100 idiomas, pero no se publican resultados desglosados por idioma; el rendimiento en idiomas de bajos recursos puede ser notablemente inferior a la media multilingue.
- Los embeddings truncados con MRL por debajo de 512d degradan la calidad; el autor solo recomienda bajar a 128d en cargas de trabajo exclusivamente de texto.
- Los resultados de benchmarks de imagen, video y audio se reportan sin comparacion frente a alternativas especializadas del mismo dominio, por lo que no permiten situar el modelo en el estado del arte de cada modalidad.
- No se publican datos sobre sesgos, composicion del dataset de entrenamiento, ni evaluaciones de robustez o seguridad.
- Solo se distribuyen pesos safetensors en precision completa; no hay variantes cuantizadas oficiales, lo que limita el despliegue en entornos que dependen de GGUF (llama.cpp, Ollama).
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces obtenidos correspondian a contenido no relacionado y se han descartado.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/OsGo/embeddinggemma-2
- Modelo base oficial: https://huggingface.co/google/embeddinggemma-2
- Organizacion GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Pagina de licencia referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Banner del modelo: https://ai.google.dev/gemma/images/embeddinggemma2_banner.png

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (papers, demos o repos adicionales). No se dispone de mas enlaces verificables.
