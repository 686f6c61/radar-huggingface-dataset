# gubernac/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido código), imagenes, video y audio —y combinaciones de ellos— en un espacio vectorial unificado de 768 dimensiones. Con 740M parametros totales (744.371.512 segun los pesos en safetensors), combina un backbone de texto de 270M parametros (130M de transformer mas 140M de embedder) con un encoder de vision de 170M y uno de audio de 300M que pueden cargarse de forma selectiva segun la modalidad necesaria.

El modelo esta pensado para ejecutarse en hardware de consumo, como moviles y portatiles, ofreciendo representaciones semanticas de baja latencia para busqueda, generacion aumentada por recuperacion (RAG), clasificacion y clustering en el dispositivo. Soporta mas de 100 idiomas y una ventana de contexto de 8.192 tokens, suficiente para procesar minutos de audio o video. Incorpora Matryoshka Representation Learning (MRL), lo que permite truncar los embeddings a 128, 256 o 512 dimensiones con una perdida de calidad minima, reduciendo hasta 6 veces el coste de almacenamiento vectorial.

Es relevante porque unifica cuatro modalidades en un unico espacio de embeddings de tamano contenido, algo poco habitual en modelos abiertos de esta escala, y porque su naturaleza modular permite desplegar solo las partes necesarias. La ficha corresponde al repositorio `gubernac/embeddinggemma-2`, que reproduce la model card de Google DeepMind; el repositorio original es `google/embeddinggemma-2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso con atencion GQA/MQA, ventana deslizante local/global 5:1, pooling por media; encoders multimodales modulares |
| Parametros totales | 740M (744.371.512 segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens; ventana deslizante de 1.024 tokens |
| Tipos de cuantizacion | no disponibles en la informacion proporcionada |
| Idiomas soportados | Mas de 100 idiomas (multilingue) |
| Licencia | Apache 2.0 (el enlace de la model card apunta a `gemma_4_license`) |
| Formato de pesos | safetensors |

Datos arquitectonicos adicionales: 24 capas, dimension de modelo 512, dimension oculta 2.048, vocabulario de 262.144 tokens, 4 cabezas de atencion, 2 cabezas KV locales y 1 global, activacion FFN con puerta y GELU, capa de proyeccion 512 a 768. Desglose de parametros: backbone 130M, embedder 140M, encoder de vision 170M, encoder de audio 300M. Dimension de salida nativa 768, con truncamiento MRL a 128, 256 y 512.

## Arquitectura y entrenamiento

EmbeddingGemma 2 es un modelo de embeddings construido sobre los avances arquitectonicos de Gemma 4. El backbone de texto de 270M parametros (130M de transformer mas 140M de embedder) emplea 24 capas con atencion agrupada y multi-consulta (GQA/MQA), una relacion local:global de 5:1 y ventana deslizante de 1.024 tokens dentro de un contexto total de 8.192 tokens. La salida se agrega con pooling por media y se proyecta de 512 a 768 dimensiones. Los encoders de vision (170M) y audio (300M) son modulos independientes que pueden cargarse de forma selectiva, lo que permite usar solo las modalidades requeridas.

El modelo unifica las cuatro modalidades en un unico espacio compartido de 768 dimensiones y utiliza prefijos de instruccion de texto ligeros para orientar las representaciones hacia distintas tareas (busqueda, clasificacion, clustering, similitud semantica). No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. La innovacion destacable es la integracion nativa de MRL para truncamiento de embeddings con minima perdida de calidad.

## Capacidades

- Generacion de embeddings multimodales unificados para texto, imagenes, video y audio, y combinaciones de ellos.
- Embeddings de texto con soporte de codigo, con una mejora de aproximadamente el 14% en tareas de codigo frente a su predecesor.
- Extraccion de caracteristicas de imagen, audio y video (feature-extraction en las tres modalidades).
- Similitud semantica de frases (sentence-similarity) y tareas de recuperacion y clustering.
- Soporte multilingue de mas de 100 idiomas.
- Representaciones dirigidas por tarea mediante prefijos de instruccion de texto ligeros.
- Truncamiento nativo de embeddings (MRL) a 128, 256 y 512 dimensiones con re-normalizacion.
- Procesamiento de minutos de audio o video gracias a la ventana de contexto de 8.192 tokens.
- No se menciona soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Busqueda semantica en el dispositivo: al ejecutarse en moviles y portatiles, permite indexar y consultar contenido localmente sin enviar datos a la nube, usando embeddings de 768 dimensiones o truncados a 256 para reducir el almacenamiento.
- RAG en produccion: el modelo genera embeddings de documentos y consultas en un espacio compartido, lo que permite construir pipelines de recuperacion aumentada con contexto de 8.192 tokens para fragmentos extensos.
- Busqueda multimodal de imagenes y video: con el encoder de vision de 170M, permite consultar por texto dentro de catalogos de imagenes o fotogramas de video, usando el mismo espacio vectorial que las consultas de texto.
- Clasificacion y clustering de documentos multilingues: aprovecha el soporte de mas de 100 idiomas y el truncamiento a 128 dimensiones (recomendado para cargas solo de texto) para agrupar grandes volumenes de documentos con coste de almacenamiento reducido.
- Recuperacion de audio: con el encoder de audio de 300M, permite indexar y recuperar fragmentos de audio por similitud semantica, por ejemplo en catalogos de podcasts o archivos sonoros.
- Deduplicacion y similitud de codigo: la mejora de rendimiento en tareas de codigo (78,68 en MTEB code v1) lo hace apto para detectar fragmentos de codigo duplicados o buscar ejemplos similares en repositorios.
- Moderacion y filtrado de contenido: la representacion compartida de texto, imagen, video y audio permite clasificar contenido multimodal con un unico modelo en lugar de varios especializados.
- Sistemas de recomendacion: los embeddings truncados a 256 o 512 dimensiones reducen los requisitos de almacenamiento y latencia en la busqueda de vecinos mas cercanos a gran escala.

## Benchmarks y rendimiento

Resultados de la model card (checkpoint en precision completa, 768d):

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task) | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType) | 64,64 | no disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB | Mean(Task), Multiple | 49,39 | no disponible |

Efecto del truncamiento de vectores (MRL):

| Dimension de salida | Ratio de compresion | MTEB multilingue v2 | MTEB ingles v2 | MTEB code v1 | MIEB lite | MMEB v2 global | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

Segun la model card, la perdida de calidad es minima hasta 256 dimensiones, y 128 dimensiones se recomienda solo para cargas de texto.

## Requisitos de hardware

- VRAM estimada para los 740M parametros: aproximadamente 3 GB en fp32, 1,5 GB en fp16/bf16, 750 MB en int8 y 375 MB en int4 (estimaciones a partir del numero de parametros; no confirmadas en la informacion disponible).
- Solo backbone de texto (270M parametros): aproximadamente 540 MB en fp16.
- Encoders opcionales: vision 170M y audio 300M, que se cargan de forma selectiva segun la modalidad necesaria.
- Cabe en GPU de consumo: el modelo esta disenado para ejecutarse en moviles y portatiles, por lo que cabe en GPUs de consumo como una RTX 4090 o inferiores, e incluso en CPU.
- Opciones de despliegue confirmadas: `transformers` y `sentence-transformers`; el repositorio esta marcado como compatible con endpoints.
- Otras opciones (vLLM, llama.cpp, Ollama, TGI): no confirmadas en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada (la model card solo indica baja latencia en dispositivo, sin cifras).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M | 8.192 tokens | 768 (MRL 128/256/512) | Texto, imagen, video, audio | Apache 2.0 | HuggingFace |
| EmbeddingGemma 1 | no disponible | no disponible | no disponible | Texto | no disponible | HuggingFace |
| Otros modelos de embeddings de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

En la informacion proporcionada solo se ofrecen datos comparativos frente a EmbeddingGemma 1 (predecesor). No hay cifras disponibles de otras alternativas como E5, BGE-M3 u otros modelos de embeddings comparables.

## Limitaciones y advertencias

- El repositorio `gubernac/embeddinggemma-2` (autor `gubernac`, 0 descargas y 0 likes) reproduce la model card del modelo original de Google DeepMind (`google/embeddinggemma-2`); conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- No se especifican en la informacion disponible los sesgos conocidos del modelo.
- Como todo modelo de embeddings, existe riesgo de representaciones poco fiables en dominios alejados de los datos de entrenamiento; no se detalla la composicion del dataset.
- El truncamiento a 128 dimensiones degrada notablemente el rendimiento multimodal (por ejemplo, MMEB v2 global cae a 45,65 frente a 59,01 en 768d) y se recomienda solo para texto.
- Aunque se declara una licencia Apache 2.0, el enlace de la model card apunta a la licencia `gemma_4_license`; conviene confirmar los terminos exactos aplicables al uso comercial.
- La ventana de contexto esta limitada a 8.192 tokens, con ventana deslizante de 1.024 tokens, lo que puede afectar a documentos muy largos.
- No hay datos publicos de latencia, throughput ni resultados en produccion para este repositorio concreto.

## Enlaces

- Repositorio en HuggingFace (objeto de esta ficha): https://huggingface.co/gubernac/embeddinggemma-2
- Repositorio original de Google: https://huggingface.co/google/embeddinggemma-2
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion oficial: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
