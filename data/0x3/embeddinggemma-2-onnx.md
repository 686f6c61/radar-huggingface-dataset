# 0x3/embeddinggemma-2-ONNX

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio —y combinaciones de estas modalidades— en un unico espacio vectorial compartido de 768 dimensiones. Con 740M parametros totales, combina un backbone de texto de 270M (130M de transformer mas 140M de embedder) con encoders modulares de vision (170M) y audio (300M) que pueden cargarse de forma selectiva segun la necesidad del caso de uso.

El modelo esta disenado para ejecutarse en hardware de consumo, como moviles y portatiles, ofreciendo representaciones semanticas de baja latencia para busqueda, generacion aumentada por recuperacion (RAG), clasificacion y clustering en el dispositivo. Hereda las mejoras arquitectonicas y de capacidades de Gemma 4, incluyendo un contexto de 8.192 tokens que permite procesar minutos de audio o video.

La version aqui descrita es una conversion a ONNX publicada por el usuario 0x3 bajo licencia Apache 2.0, orientada a su uso con Transformers.js en entornos JavaScript/TypeScript. Destaca por su soporte nativo de Matryoshka Representation Learning (MRL), que permite truncar los embeddings a 128, 256 o 512 dimensiones con una degradacion minima de calidad, reduciendo hasta 6 veces el coste de almacenamiento vectorial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de texto y encoders multimodales modulares; atencion GQA/MQA, sliding window de 1024 tokens, pooling por media |
| Parametros totales | 740M (backbone 130M, embedder 140M, vision 170M, audio 300M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (repositorio ONNX; el modelo base es cuantizable, pero no se detallan variantes) |
| Idiomas soportados | Multilingue (100+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (libreria transformers.js) |
| Dimension de salida | 768 (truncable a 512, 256 y 128 via MRL) |
| Capas | 24 |
| Dimension del modelo | 512 |
| Dimension oculta | 2.048 |
| Vocabulario | 262.144 |
| Cabezas de atencion | 4 (KV-heads local/global: 2/1; ratio local:global 5:1) |
| Capa de proyeccion | 512→768 |
| Tamano del repo | 6,2 GB |

## Arquitectura y entrenamiento

EmbeddingGemma 2 emplea una arquitectura transformer con un backbone de texto de 24 capas, dimension de modelo de 512 y dimension oculta de 2.048. La atencion combina mecanismos GQA (Grouped Query Attention) y MQA (Multi-Query Attention) con un patron de ventana deslizante de 1.024 tokens y una proporcion local:global de 5:1, lo que reduce el coste computacional en secuencias largas. La activacion es una FFN con compuertas y GELU, y el pooling es por media antes de una capa de proyeccion de 512 a 768 dimensiones.

Los encoders de vision (170M) y audio (300M) son modulares y cargables de forma independiente, permitiendo desplegar solo las modalidades necesarias. El modelo soporta Matryoshka Representation Learning, que entrena las representaciones para que puedan truncarse a 128, 256 o 512 dimensiones y renormalizarse con perdida minima de calidad. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de embeddings multimodales unificados para texto (incluido codigo), imagenes, video y audio en un espacio compartido de 768 dimensiones.
- Similitud semantica y recuperacion de informacion multilingue en mas de 100 idiomas.
- Soporte de tareas guiadas por instrucciones mediante prefijos de texto ligeros para optimizar embeddings segun la tarea (busqueda, clasificacion, clustering, similitud semantica).
- Truncamiento nativo de embeddings a 128, 256 y 512 dimensiones mediante MRL.
- Procesamiento de documentos visuales (VisDoc) y recuperacion sobre imagenes y video.
- Recuperacion y clasificacion de audio.
- Extraccion de caracteristicas para imagen, audio y video de forma independiente o combinada.
- Capacidad de ejecucion en dispositivos de consumo (moviles, portatiles) gracias a su tamano reducido y encoders selectivos.

## Casos de uso

- Busqueda semantica en aplicaciones web: integracion via Transformers.js en el navegador para indexar y recuperar documentos sin backend, aprovechando el contexto de 8.192 tokens y los embeddings truncados a 256d para reducir el almacenamiento.
- RAG en el dispositivo: generacion aumentada por recuperacion en moviles o portatiles donde la privacidad impide enviar datos a la nube, cargando solo el backbone de texto (270M) para minimizar el consumo de memoria.
- Clasificacion y clustering de contenido multimedia: agrupacion de imagenes, audio y texto en un mismo espacio vectorial para organizar bibliotecas de medios o moderar contenido.
- Busqueda multimodal en comercio electronico: recuperacion de productos a partir de descripciones textuales, imagenes o combinaciones, usando el encoder de vision y el de texto de forma conjunta.
- Analisis de documentos visuales: extraccion de embeddings de documentos escaneados o capturas para busqueda y recuperacion (evaluado en MMEB v2 VisDoc con 67,84 NDCG@5).
- Recuperacion de audio y video: indexacion de fragmentos de audio o video para busqueda por similitud, aprovechando la ventana de contexto que cubre minutos de contenido.
- Deteccion de similitud de codigo: busqueda de fragmentos de codigo semanticamente equivalentes en repositorios, con una mejora del 14% respecto a la generacion anterior en tareas de codigo.

## Benchmarks y rendimiento

Resultados publicados en la model card, con checkpoint de precision completa y 768 dimensiones:

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingue, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 64,64 | No disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | No disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | No disponible |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | No disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | No disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,39 | No disponible |

Resultados con truncamiento vectorial (MRL):

| Dimension | Ratio de compresion | MTEB multilingue | MTEB ingles | MTEB code | MIEB lite | MMEB v2 | MSEB | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de texto (270M parametros) requiere aproximadamente 0,5-1 GB en precision completa; con los encoders de vision y audio (740M totales) se estima en torno a 1,5-3 GB en funcion de la precision y cuantizacion.
- GPU recomendadas: al estar disenado para hardware de consumo, funciona en GPUs integradas y moviles; para despliegue en servidor se puede usar cualquier GPU moderna (RTX 3060 o superior, A100, H100), aunque su tamano no exige estas ultimas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en CPU y navegador via Transformers.js.
- Opciones de despliegue: Transformers.js (objetivo principal de esta conversion ONNX), ONNX Runtime; el modelo base google/embeddinggemma-2 puede desplegarse con otras herramientas del ecosistema Gemma, aunque no se detallan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; el modelo se describe como de baja latencia para aplicaciones en el dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M | 8.192 | Texto, imagen, video, audio | Apache 2.0 | Hugging Face (base y ONNX) |
| EmbeddingGemma 1 | No disponible | No disponible | Texto | Apache 2.0 (segun model card) | Hugging Face |
| Otros modelos de embeddings de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion disponible solo permite comparar con la generacion anterior, EmbeddingGemma 1, sobre la que se observan mejoras en MTEB code (de 68,76 a 78,68) y un rendimiento practicamente identico en MTEB multilingue (de 61,15 a 61,36). No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no puede generar texto, codigo ni respuestas.
- Riesgo de sesgos: al entrenarse con datos web multilingues, puede reflejar sesgos culturales y linguisticos; no se detallan evaluaciones de sesgo en la informacion disponible.
- Calidad degradada en 128d: segun los benchmarks, el truncamiento a 128 dimensiones reduce notablemente el rendimiento (MTEB multilingue de 61,36 a 57,89; MMEB v2 de 59,01 a 45,65), por lo que se recomienda 256d como minimo para la mayoria de tareas y 128d solo para texto.
- Cobertura de idiomas: aunque se declaran 100+ idiomas, no se especifica el rendimiento por idioma; el espanol no tiene evaluacion desglosada en la informacion disponible.
- Esta version concreta es una conversion ONNX de terceros (usuario 0x3) con solo 25 descargas y 0 likes; no es una publicacion oficial de Google, por lo que conviene validar la fidelidad de la conversion frente al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base google/embeddinggemma-2 para confirmar compatibilidad.
- No se detallan requisitos de memoria exactos para el despliegue conjunto de todas las modalidades en produccion.

## Enlaces

- Repositorio Hugging Face (version ONNX): https://huggingface.co/0x3/embeddinggemma-2-ONNX
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Paquete NPM de Transformers.js: https://www.npmjs.com/package/@huggingface/transformers
