# Marquis23/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio en un unico espacio vectorial compartido de 768 dimensiones. Con 740 millones de parametros totales, combina un backbone de texto de 270 millones con encoders modulares de vision (170 M) y audio (300 M), lo que permite cargar solo las modalidades necesarias para cada caso de uso. Esta disenado para ejecutarse en hardware de consumo, como moviles y portatiles, ofreciendo representaciones semanticas de baja latencia para busqueda, RAG, clasificacion y clustering.

El modelo se apoya en las mejoras arquitectonicas de Gemma 4 e incorpora Matryoshka Representation Learning (MRL), que permite truncar los embeddings a 128, 256 o 512 dimensiones con una perdida de calidad minima, reduciendo hasta 6 veces el coste de almacenamiento vectorial. Su ventana de contexto es de 8192 tokens y soporta mas de 100 idiomas, ademas de una mejora del 14 % en tareas de codigo respecto a su predecesor. Emplea prefijos de instruccion ligeros para orientar las representaciones segun la tarea (busqueda, clasificacion, clustering o similitud semantica).

La relevancia actual de EmbeddingGemma 2 radica en su caracter nativamente multimodal dentro de un unico espacio de embeddings, algo poco habitual en modelos de este tamano, y en su licencia Apache 2.0, que facilita su adopcion comercial. Esta publicado bajo el identificador `Marquis23/embeddinggemma-2` en Hugging Face, aunque el modelo original es de Google DeepMind.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (embedding_gemma2) con encoders multimodales modulares |
| Parametros totales | 744.371.512 (740 M nominales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue (mas de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

| Parametro arquitectonico | Valor |
|---|---|
| Backbone de texto | 130 M (transformer) |
| Embedder | 140 M |
| Encoder de vision | 170 M |
| Encoder de audio | 300 M |
| Capas | 24 |
| Dimension del modelo | 512 |
| Dimension oculta | 2048 |
| Ventana deslizante | 1024 tokens |
| Vocabulario | 262.144 |
| Cabezas de atencion | 4 |
| Cabezas KV (local/global) | 2/1 |
| Proporcion local:global | 5:1 |
| Atencion | GQA/MQA |
| Activacion | Gated FFN con GELU |
| Pooling | Mean pooling |
| Capa de proyeccion | 512 a 768 |
| Dimension de salida nativa | 768 |
| Dimensiones MRL | 128, 256, 512 |

## Arquitectura y entrenamiento

EmbeddingGemma 2 es un transformer de 24 capas con una dimension de modelo de 512 y una dimension oculta de 2048, que emplea atencion con query grouping (GQA) y multi-query (MQA), con una proporcion de atencion local frente a global de 5:1 y una ventana deslizante de 1024 tokens. El backbone de texto (130 M) se combina con un embedder (140 M) y con encoders de vision (170 M) y audio (300 M) que pueden cargarse de forma selectiva. La salida se obtiene mediante mean pooling y una capa de proyeccion de 512 a 768 dimensiones, con soporte nativo de MRL para truncar los vectores a 128, 256 o 512 dimensiones.

El modelo se construye sobre los avances de Gemma 4 y esta disenado para unificar cuatro modalidades en un espacio de 768 dimensiones. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Entre las innovaciones destacables figuran la multimodalidad nativa, el uso de prefijos de instruccion para orientar las representaciones por tarea y la capacidad de truncar embeddings con MRL para reducir costes de almacenamiento.

## Capacidades

- Generacion de embeddings de texto, incluido codigo, en un espacio vectorial de 768 dimensiones.
- Embeddings de imagenes mediante un encoder de vision dedicado de 170 M de parametros.
- Embeddings de video, con capacidad de procesar varios minutos de contenido dentro del contexto de 8192 tokens.
- Embeddings de audio mediante un encoder de audio de 300 M de parametros.
- Representaciones multimodales combinadas (por ejemplo, texto e imagen en el mismo espacio).
- Soporte multilingue de mas de 100 idiomas.
- Mejora del 14 % en tareas de codigo respecto a EmbeddingGemma 1.
- Truncamiento MRL nativo a 128, 256 y 512 dimensiones para reducir almacenamiento.
- Representaciones orientadas por tarea mediante prefijos de instruccion (busqueda, clasificacion, clustering, similitud semantica).
- Carga selectiva de modalidades para ajustar el consumo de recursos.
- No se especifica soporte de tool calling ni de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Busqueda semantica multilingue: el modelo genera embeddings de consultas y documentos en mas de 100 idiomas dentro del mismo espacio vectorial, lo que permite recuperar resultados relevantes independientemente del idioma de origen con una ventana de 8192 tokens por documento.
- RAG en dispositivos: al ejecutarse en moviles y portatiles, puede generar embeddings de fragmentos de documentos localmente para sistemas de recuperacion aumentada sin depender de la nube, con latencia baja.
- Busqueda multimodal de productos: combinando embeddings de texto e imagen, un usuario puede buscar articulos mediante una descripcion textual o una foto, ya que ambas modalidades se proyectan en el mismo espacio de 768 dimensiones.
- Clasificacion y clustering de contenido audiovisual: el encoder de audio permite agrupar o clasificar fragmentos de audio (podcasts, reuniones) por similitud semantica, y el de video permite organizar archivos por contenido visual.
- Deduplicacion y organizacion de bibliotecas de imagenes o video: el truncamiento MRL a 256 dimensiones reduce el almacenamiento hasta 3 veces con una perdida de calidad minima, lo que facilita indexar grandes volumenes de medios.
- Busqueda de codigo: con una mejora del 14 % en tareas de codigo respecto a su predecesor, puede usarse para recuperar fragmentos de codigo relevante en repositorios o asistentes de desarrollo.
- Moderacion y similitud semantica en plataformas de contenido: la orientacion por prefijos de instruccion permite ajustar las representaciones para tareas de clasificacion o similitud sin reentrenar el modelo.

## Benchmarks y rendimiento

Resultados a 768 dimensiones con el checkpoint de precision completa, segun la model card:

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingue, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 65,67 | No disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | No disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | No disponible |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | No disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | No disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,87 | No disponible |

Resultados con truncamiento vectorial (MRL):

| Dimension | Ratio de compresion | MTEB multilingue v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 global | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d | 1:1 | 61,36 | 68,46 | 78,68 | 65,67 | 59,01 | 69,54 | 49,87 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 65,34 | 58,38 | 69,18 | 49,76 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 64,16 | 56,24 | 66,76 | 49,13 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,97 | 45,65 | 56,71 | 47,28 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de precision completa ocupa aproximadamente 1,5 GB (tamano del repositorio), lo que corresponde a unos 3 GB en memoria al cargar los pesos en FP16 con overhead. La carga selectiva de modalidades reduce este requisito.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM puede ejecutar el modelo completo; las GPU de datacenter (A100, H100) no son necesarias para inferencia basica.
- Cabe en GPU de consumo: si, incluida la gama RTX 4090, RTX 3090 y GPUs de gama media con 6-8 GB de VRAM. Tambien esta disenado para ejecutarse en moviles y portatiles.
- Opciones de despliegue: la model card menciona `sentence-transformers` y `transformers`; no se detallan otras opciones como vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la informacion disponible, aunque el modelo se describe como de baja latencia para aplicaciones en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Multimodal | Licencia | Resultado MTEB multilingue v2 |
|---|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740 M | 8192 | 768 (MRL 128-512) | Si (texto, imagen, video, audio) | Apache 2.0 | 61,36 |
| EmbeddingGemma 1 | No disponible | No disponible | No disponible | No | Apache 2.0 | 61,15 |
| Otros modelos de embeddings de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada solo permite comparar con EmbeddingGemma 1, su predecesor. No se dispone de datos de otros modelos comparables en la documentacion facilitada.

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la informacion disponible.
- Riesgo de alucinacion: al ser un modelo de embeddings y no generativo, el riesgo de alucinacion se traslada al sistema que consuma los vectores; no se documentan tasas.
- El truncamiento a 128 dimensiones degrada notablemente el rendimiento en tareas multimodales (MMEB v2 baja de 59,01 a 45,65), por lo que se recomienda 256 dimensiones o mas para cargas multimodales.
- Aunque soporta mas de 100 idiomas, no se especifica el rendimiento por idioma ni las posibles carencias en lenguas de bajos recursos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo original de Google DeepMind enlazados en la model card.
- El repositorio `Marquis23/embeddinggemma-2` registra 0 descargas y 0 likes en el momento de la consulta, y no se confirma que sea una publicacion oficial de Google DeepMind; se recomienda contrastar con el repositorio oficial `google/embeddinggemma-2`.
- No se especifican requisitos de cuantizacion ni soporte de tool calling, agentes o razonamiento multi-paso.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/Marquis23/embeddinggemma-2
- Hugging Face (modelo oficial): https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.37364
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en DeepMind: https://deepmind.google/models/gemma/
