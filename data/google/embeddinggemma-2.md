# google/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio, así como combinaciones de estas modalidades, en un único espacio vectorial compartido de 768 dimensiones. Con 740 millones de parámetros totales, combina un backbone de texto de 270 millones (130M de transformer más 140M de embedder) con codificadores modulares de visión (170M) y audio (300M) que pueden cargarse de forma selectiva según la necesidad.

El modelo está diseñado para ejecutarse en hardware de consumo, incluidos dispositivos móviles y portátiles, lo que lo sitúa como una opción para aplicaciones de recuperación semántica en el dispositivo: búsqueda, generación aumentada por recuperación (RAG), clasificación y clustering. Incorpora Matryoshka Representation Learning (MRL), que permite truncar los embeddings a 128, 256 o 512 dimensiones con una degradación de calidad mínima, reduciendo hasta seis veces el coste de almacenamiento vectorial.

Construido sobre los avances arquitectónicos de Gemma 4, EmbeddingGemma 2 amplía a cuatro modalidades el enfoque de su predecesor (que era solo de texto), mantiene soporte para más de 100 idiomas y mejora aproximadamente un 14 % en tareas de código respecto a EmbeddingGemma 1. Su licencia Apache 2.0 y su tamaño contenido lo hacen relevante para despliegues en producción con requisitos estrictos de latencia y privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención GQA/MQA, ventana deslizante local/global 5:1, FFN con compuerta y GELU, mean pooling y capa de proyección 512→768; codificadores modulares de visión y audio |
| Parametros totales | 744.371.512 (740M según model card: backbone 130M + embedder 140M + visión 170M + audio 300M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana deslizante de 1.024 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (más de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se organiza en torno a un backbone de texto de 270 millones de parámetros (130M de transformer más 140M de embedder) con 24 capas, dimensión de modelo de 512, dimensión oculta de 2.048, vocabulario de 262.144 tokens y 4 cabezas de atención con 2 cabezas KV locales y 1 global en una proporción local:global de 5:1. La atención combina GQA y MQA sobre una ventana deslizante de 1.024 tokens dentro de un contexto total de 8.192 tokens, y el pooling es de media sobre la secuencia antes de una proyección lineal de 512 a 768 dimensiones.

La multimodalidad se implementa mediante codificadores modulares y cargables de forma independiente: uno de visión de 170M y otro de audio de 300M, que proyectan sus representaciones al mismo espacio compartido de 768 dimensiones. El modelo incorpora Matryoshka Representation Learning de forma nativa, lo que permite truncar y renormalizar los vectores a 128, 256 o 512 dimensiones. Además, emplea prefijos de instrucción de texto ligeros para orientar las representaciones hacia tareas concretas (búsqueda, clasificación, clustering o similitud semántica). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de embeddings multimodales nativos para texto, imágenes, vídeo y audio, y combinaciones de estas modalidades en un único espacio de 768 dimensiones.
- Embeddings de texto multilingües con soporte de más de 100 idiomas.
- Embeddings de código, con una mejora de aproximadamente el 14 % en tareas de código respecto a EmbeddingGemma 1.
- Recuperación y similitud semántica entre modalidades (por ejemplo, texto a imagen o texto a audio).
- Embeddings de documentos visuales (VisDoc) para tareas de recuperación sobre páginas escaneadas o capturas.
- Embeddings de vídeo y audio, con capacidad de procesar minutos de contenido dentro del contexto de 8.192 tokens.
- Truncamiento MRL nativo a 128, 256 y 512 dimensiones con renormalización.
- Representaciones dirigidas por tarea mediante prefijos de instrucción de texto.
- Carga selectiva de codificadores de modalidad para reducir el consumo de recursos.
- No se documentan capacidades de tool calling, function calling ni razonamiento agéntico multi-paso: el modelo es de extracción de características, no generativo.

## Casos de uso

- Búsqueda semántica en el dispositivo: el modelo puede generar embeddings de consultas y documentos en un portátil o móvil con latencia baja gracias a su backbone de 270M, eliminando la necesidad de enviar datos a un servidor y preservando la privacidad.
- RAG multimodal en producción: permite indexar texto, imágenes, audio y vídeo en un mismo espacio vectorial, de modo que una consulta textual puede recuperar fragmentos de cualquiera de esas modalidades dentro del contexto de 8.192 tokens.
- Clasificación y clustering de contenido: los embeddings truncados a 256 dimensiones reducen el coste de almacenamiento hasta tres veces con una pérdida de calidad mínima (60,41 frente a 61,36 en MTEB multilingüe), lo que lo hace adecuado para agrupar grandes volúmenes de documentos o imágenes.
- Búsqueda de código en repositorios: con una puntuación de 78,68 en MTEB code, el modelo puede indexar fragmentos de código y recuperar implementaciones similares o relevantes para una consulta en lenguaje natural.
- Moderación y deduplicación de contenido audiovisual: los embeddings de audio (MSEB retrieval 69,54) y de vídeo permiten detectar duplicados o contenido semánticamente próximo en archivos multimedia sin transcribir previamente.
- Recuperación sobre documentos escaneados: los embeddings VisDoc (67,84 en MMEB v2) permiten buscar sobre páginas de PDF o imágenes de documentos sin necesidad de OCR previo.
- Sistemas de recomendación por similitud: la capacidad de comparar ítems de distinta modalidad en un mismo espacio vectorial facilita recomendar imágenes o vídeos a partir de una descripción textual del usuario.
- Filtrado previo en pipelines de datos: la carga selectiva de codificadores permite usar solo el backbone de texto en etapas tempranas y añadir visión o audio solo cuando el caso lo requiera, optimizando el coste computacional.

## Benchmarks y rendimiento

Resultados publicados en la model card con el checkpoint en precisión completa (768 dimensiones):

| Modalidad | Benchmark | Métrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingüe, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 65,67 | no disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Vídeo | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,87 | no disponible |

Resultados con truncamiento vectorial (MRL):

| Dimensión | Ratio de compresión | MTEB multilingüe v2 | MTEB inglés v2 | MTEB code v1 | MIEB lite | MMEB v2 global | MSEB retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d | 1:1 | 61,36 | 68,46 | 78,68 | 65,67 | 59,01 | 69,54 | 49,87 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 65,34 | 58,38 | 69,18 | 49,76 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 64,16 | 56,24 | 66,76 | 49,13 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,97 | 45,65 | 56,71 | 47,28 |

No se han publicado en la información disponible resultados comparativos con modelos de otros autores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 740M parámetros, en fp16 el peso ronda los 1,5 GB; en fp32, unos 3 GB (el repositorio ocupa 3,0 GB). La carga selectiva de codificadores permite reducir el consumo si solo se usa texto (270M de parámetros).
- GPU recomendadas: no se especifican modelos concretos. El diseño apunta a hardware de consumo (móviles y portátiles) y a ejecución en CPU.
- Cabe en GPU de consumo: sí, por tamaño (menos de 2 GB en fp16), aunque la model card no detalla requisitos mínimos ni GPUs concretas.
- Opciones de despliegue: transformers y sentence-transformers según la model card; los tags indican compatibilidad con endpoints y despliegue en SageMaker. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | MTEB multilingüe v2 | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M | 8.192 | Texto, imagen, vídeo, audio | 61,36 | Apache 2.0 |
| EmbeddingGemma 1 | no disponible | no disponible | Texto | 61,15 | no disponible en la información |
| Alternativas de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con EmbeddingGemma 1; no se dispone de datos de modelos comparables de otros desarrolladores (por ejemplo, de la familia BGE, E5 o CLIP) para esta ficha.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no admite tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación no aplicable en sentido estricto, pero los embeddings pueden producir similitudes espurias en dominios alejados de los datos de entrenamiento; no se documenta la composición del dataset.
- El truncamiento a 128 dimensiones degrada notablemente el rendimiento multimodal (MMEB v2 global cae a 45,65 y MSEB a 56,71); la model card recomienda 128d solo para cargas de texto.
- El contexto está limitado a 8.192 tokens con ventana deslizante de 1.024; secuencias más largas requieren segmentación.
- No se detallan sesgos conocidos ni evaluaciones de equidad en la información disponible.
- Aunque la licencia es Apache 2.0, la model card enlaza a la licencia de Gemma 4; conviene verificar los términos exactos antes de un uso comercial.
- No se especifican requisitos de hardware, latencias ni opciones de cuantización, lo que dificulta planificar un despliegue en producción sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentación: https://ai.google.dev/gemma/docs/embeddinggemma
- Informe técnico (arXiv): https://arxiv.org/abs/2610.37364
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
