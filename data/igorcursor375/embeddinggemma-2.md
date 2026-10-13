# igorcursor375/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind. Convierte entradas de texto (incluido código), imagen, vídeo y audio —y combinaciones de ellas— en un espacio vectorial unificado de 768 dimensiones. Se trata de un modelo de representación, no generativo: su salida es un vector denso por entrada, pensado para tareas de búsqueda semántica, recuperación aumentada por generación (RAG), clasificación y agrupamiento (clustering).

El modelo suma unos 740 millones de parámetros distribuidos en un backbone de texto de 270M (130M de transformer más 140M de embedder), un codificador de visión de 170M y un codificador de audio de 300M que pueden cargarse de forma selectiva según la modalidad necesaria. Está diseñado para ejecutarse en hardware de consumo, como portátiles y dispositivos móviles, con el objetivo de ofrecer representaciones semánticas de baja latencia en el propio dispositivo.

Es relevante porque unifica cuatro modalidades en una única dimensión compartida, admite más de 100 idiomas (con una mejora de en torno al 14 % en tareas de código respecto a su predecesor) y aplica Matryoshka Representation Learning (MRL), lo que permite truncar los vectores a 128, 256 o 512 dimensiones y reducir hasta 6 veces el coste de almacenamiento con un impacto mínimo en la calidad. La ventana de contexto es de 8.192 tokens. La ficha que se describe aquí corresponde a una réplica publicada por el usuario igorcursor375; el modelo original es google/embeddinggemma-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multimodal (backbone de texto con atencion GQA/MQA, atencion de ventana deslizante local:global 5:1, FFN con GELU; codificadores de vision y audio acoplados) |
| Parametros totales | 744.371.512 (~740M) |
| Parametros activos | no aplica (no es un modelo MoE; backbone 130M, embedder 140M, vision 170M, audio 300M) |
| Longitud de contexto | 8.192 tokens (ventana deslizante de 1.024 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio distribuido por igorcursor375 solo publica pesos en safetensors) |
| Idiomas soportados | multilingue (mas de 100 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos de arquitectura: 24 capas, dimension de modelo 512, dimension oculta 2.048, vocabulario de 262.144 tokens, 4 cabezas de atencion, 2/1 cabezas KV (local/global), pooling por media y capa de proyeccion de 512 a 768 dimensiones.

## Arquitectura y entrenamiento

EmbeddingGemma 2 es un transformer encoder multimodal. El backbone de texto consta de 24 capas con dimension de modelo 512 y dimension oculta 2.048, y emplea una atencion de ventana deslizante con patron local:global de 5:1 y esquema GQA/MQA (2 cabezas KV locales y 1 global). Las capas feed-forward usan activacion GELU con compuertas, y el pooling es de tipo media. La salida del backbone (512 dimensiones) se proyecta a un espacio comun de 768 dimensiones que comparten todas las modalidades. Los encoders de vision (170M) y audio (300M) son modulos independientes y cargables de forma selectiva, de modo que se puede desplegar solo la modalidad que interese.

El modelo incorpora Matryoshka Representation Learning, que permite truncar el vector nativo de 768 dimensiones a 128, 256 o 512 dimensiones y renormalizarlo, reduciendo el almacenamiento con una perdida de calidad minima hasta 256 dimensiones. Tambien usa representaciones dirigidas por tarea mediante prefijos de instruccion ligeros en texto, de forma que un mismo modelo optimiza sus embeddings para busqueda, clasificacion, agrupamiento o similitud semantica segun el prefijo. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no disponible).

## Capacidades

- Generacion de embeddings multimodales: texto (incluido codigo), imagenes, video y audio, y combinaciones entre modalidades, en un unico espacio de 768 dimensiones.
- Representaciones para similitud semantica y recuperacion (retrieval) sobre documentos, consultas e imagenes.
- Soporte multilingue en mas de 100 idiomas.
- Rendimiento mejorado en tareas de codigo, con alrededor de un 14 % de mejora frente al predecesor.
- Embeddings truncables mediante MRL a 128, 256 y 512 dimensiones.
- Representaciones dirigidas por tarea a traves de prefijos de instruccion (busqueda, clasificacion, clustering, similitud semantica).
- Carga selectiva de modalidades: los codificadores de vision y audio pueden omitirse si no se necesitan.
- Procesamiento de segmentos de audio o video de varios minutos dentro de la ventana de contexto de 8.192 tokens.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo generativo de instrucciones).

## Casos de uso

- Busqueda semantica en aplicaciones moviles: el backbone de texto de 270M puede ejecutarse en el dispositivo y generar embeddings para indice y consulta sin enviar datos a un servidor, gracias a su bajo consumo.
- RAG sobre bases de conocimiento heterogeneas: al unificar texto, imagen y audio en un mismo espacio vectorial, permite recuperar fragmentos relevantes de distintos formatos con un solo indice.
- Recuperacion de imagenes y documentos visuales: el codificador de vision (170M) permite indexar capturas, diagramas o documentos escaneados y consultarlos mediante texto o imagenes.
- Busqueda sobre contenido audiovisual: el codificador de audio (300M) y el tratamiento de video dentro de 8.192 tokens permiten recuperar fragmentos de audio o video por descripcion textual.
- Clasificacion y enrutado de tickets de soporte: los embeddings, con prefijos de tarea especificos, sirven para agrupar y categorizar consultas entrantes por similitud semantica.
- Deduplicacion y clustering de grandes colecciones: con la truncacion MRL a 256 o 128 dimensiones se reduce el coste de almacenamiento del indice hasta 6 veces manteniendo calidad util.
- Recuperacion de codigo en repositorios: la mejora en tareas de codigo permite indexar fragmentos de codigo y recuperarlos por descripcion en lenguaje natural.
- Filtrado y moderacion de contenido: los embeddings permiten detectar similitud entre contenidos y agruparlos para su revision.

## Benchmarks y rendimiento

Resultados declarados en la model card (checkpoint a plena precision, 768d):

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task) | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType) | 64,64 | - |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | - |
| Vision-documento | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | - |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | - |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | - |
| Audio | MAEB (Hugging Face) | Mean(Task) | 49,39 | - |

Resultados con truncacion de vectores (MRL):

| Dimension de salida | Ratio de compresion | MTEB (multilingual, v2) | MTEB (eng, v2) | MTEB (code, v1) | MIEB (lite) | MMEB (v2) overall | MSEB (Retrieval) | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completo) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

## Requisitos de hardware

- Peso en memoria de los pesos: aproximadamente 2,98 GB en FP32, 1,49 GB en FP16/BF16 (el repositorio ocupa 1,5 GB), 0,74 GB en INT8 y 0,37 GB en INT4 (estimaciones a partir de los 744M parametros; la model card no publica cifras de cuantizacion).
- El modelo completo a plena precision cabe en GPUs de consumo actuales (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090).
- Si se carga solo el backbone de texto (270M), el consumo es muy reducido y puede ejecutarse en CPU, portatiles y dispositivos moviles.
- GPU recomendadas para servicio en produccion con alto throughput: A100, H100 o L40S. Para desarrollo y prototipado basta una RTX 4090 o similar.
- Opciones de despliegue: sentence-transformers y transformers (soporte nativo declarado), ademas de servidores de embeddings compatibles (por ejemplo, Text Embeddings Inference) y exportacion a ONNX. No se documenta disponibilidad de cuantizaciones GGUF, por lo que Ollama y llama.cpp no estan confirmados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | MTEB multilingual v2 | MTEB code v1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| EmbeddingGemma 2 | ~740M | texto, imagen, video, audio | 8.192 tokens | 61,36 | 78,68 | apache-2.0 | HuggingFace (transformers, safetensors) |
| EmbeddingGemma 1 | no disponible | texto | no disponible | 61,15 | 68,76 | no disponible | HuggingFace |
| Otros modelos de embeddings multimodales | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con EmbeddingGemma 1, del que unicamente se detallan dos metricas de benchmark. No se dispone de datos de parametros, contexto ni licencia de ese predecesor, ni de otros modelos comparables, por lo que la comparativa queda incompleta.

## Limitaciones y advertencias

- La model card no especifica sesgos conocidos ni auditorias de equidad (no disponible).
- Como modelo de representacion, no genera texto: no puede usarse para responder preguntas directamente, solo para producir embeddings sobre los que construir busquedas o clasificadores.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero los embeddings pueden producir similitudes erroneas en dominios alejados de los datos de entrenamiento.
- La truncacion a 128 dimensiones degrada notablemente las modalidades no textuales (MMEB v2 baja de 59,01 a 45,65); la propia model card indica que 128d solo es adecuada para cargas de texto.
- La ventana de contexto es de 8.192 tokens y la atencion usa ventana deslizante de 1.024 tokens, lo que puede afectar a contextos largos o muy fragmentados.
- Licencia declarada apache-2.0, pero la model card enlaza a un documento de licencia de Gemma (gemma_4_license); conviene verificar los terminos exactos antes de un uso comercial.
- Esta ficha corresponde a una replica publicada por el usuario igorcursor375 (0 descargas, 0 likes en el momento de la consulta); para uso en produccion conviene acudir al repositorio oficial google/embeddinggemma-2.
- No se documentan cuantizaciones oficiales ni soporte confirmado en runtimes como llama.cpp u Ollama.
- No se detallan los datos de entrenamiento, lo que limita la evaluacion de cobertura idiomatica y posibles sesgos.

## Enlaces

- Repositorio de esta ficha (replica): https://huggingface.co/igorcursor375/embeddinggemma-2
- Repositorio oficial: https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia (documento enlazado por el autor): https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
