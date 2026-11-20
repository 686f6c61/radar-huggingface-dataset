# lorelaiassistant/embeddinggemma-2-coreml-int8

## Resumen

EmbeddingGemma 2 Core ML int8 es una conversión cuantizada a 8 bits de los paquetes de texto y visión del modelo de embeddings EmbeddingGemma 2 de Google, adaptada para su ejecución en Apple Silicon mediante Core ML. El artefacto lo publica el usuario `lorelaiassistant` a partir de la conversión previa de FluidInference (`FluidInference/embeddinggemma-2-coreml`, revisión `3f978ddf92cac9aa07eb2dcf6eb36cf450f3dba4`), que a su vez transforma el modelo original `google/embeddinggemma-2` a formato Core ML. El objetivo es ofrecer un modelo de extracción de características (feature-extraction) que genere embeddings multimodales texto-imagen ejecutables en el Neural Engine de los chips Apple, reduciendo el peso de descarga de aproximadamente 880 MB a unos 470 MB.

El modelo mantiene la interfaz de la conversión fp16 original: expone funciones de embedding de texto con diferentes dimensiones de salida (32, 64, …, 512) y funciones de visión con distintas resoluciones (70, 140, 280), además de una función `pack_256` para empaquetado Matryoshka. La cuantización se aplica únicamente a los pesos (int8 simétrico lineal por canal de salida), mientras que las activaciones permanecen en fp16, lo que preserva prácticamente intacta la calidad de recuperación respecto a la versión fp16.

Su relevancia radica en que permite desplegar búsqueda semántica y recuperación multimodal local en dispositivos Apple sin depender de la nube, con una pérdida de calidad mínima (coseno medio de 0,9997 frente a fp16 en imágenes y 0,9999 en consultas) y un tamaño manejable para integrarse en aplicaciones de escritorio o móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings multimodales (texto + visión), convertido a Core ML; no se detalla la arquitectura interna en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 simétrico lineal por canal de salida en pesos (activaciones fp16); tabla de tokens int8 con escala fp16 por fila; variantes int4 y palettization 4-bit probadas pero no publicadas |
| Idiomas soportados | no disponible (la evaluación incluye 532 consultas multilingües cortas, pero no se enumeran idiomas) |
| Licencia | Apache 2.0 (sujeto a los Gemma Terms of Use y la Gemma Prohibited Use Policy) |
| Formato de pesos | Core ML `.mlpackage` (funciones `embed_32`…`embed_512`, `pack_256`, `vision_70`, `vision_140`, `vision_280`), tabla de tokens `embeddings.i8` [262144, 512] con `embeddings_scale.f16`, `position_embeddings.f16`, `tokenizer.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `google/embeddinggemma-2` (número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento). Lo que sí se especifica es el proceso de conversión y cuantización: el modelo original se convierte a Core ML mediante la herramienta de FluidInference, generando paquetes multifunción que comparten pesos entre funciones. La cuantización int8 se aplica con `coremltools` 9.0 usando `OpLinearQuantizerConfig` con umbral de peso 2048, y como la API pública de PTQ rechaza paquetes multifunción, el autor ejecuta la pasada de compresión directamente sobre el programa MIL y después deduplica los pesos compartidos entre funciones para que estas sigan usando un único `weight.bin`.

La tabla de embeddings de tokens se convierte de bf16 a int8 con una escala fp16 simétrica por fila, con un error relativo medio por fila del 0,76 %. Los embeddings de entrada se calculan como `row * sqrt(512)`, igual que en la versión upstream. El autor probó variantes de 4 bits que descartó: los paquetes int4 por bloque fallan al cargar en el Neural Engine en algunas funciones, y la palettization 4-bit reduce el coseno mínimo frente a fp16 a 0,87 en consultas.

## Capacidades

- Generación de embeddings de texto con dimensiones truncables tipo Matryoshka: funciones `embed_32`, `embed_64`, `embed_128`, `embed_256`, `embed_512` y `pack_256`.
- Generación de embeddings de imagen en tres resoluciones: `vision_70`, `vision_140`, `vision_280`.
- Recuperación multimodal texto-imagen (búsqueda de imágenes a partir de una consulta textual y viceversa).
- Búsqueda semántica y similitud por coseno sobre vectores normalizados.
- Soporte multilingüe en consultas (la evaluación incluye 532 consultas multilingües cortas, sin especificar los idiomas).
- Ejecución en Apple Neural Engine con unidades de cómputo CPU + Neural Engine.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre; es un modelo exclusivamente de extracción de características.

## Casos de uso

- Búsqueda semántica local en aplicaciones macOS/iOS: el modelo genera embeddings de documentos y consultas en el dispositivo, permitiendo indexar y recuperar contenido sin enviar datos a la nube gracias a la ejecución en el Neural Engine.
- Recuperación de imágenes por texto en fototecas: usando `vision_70`/`vision_140`/`vision_280` se indexan imágenes y se recuperan por descripción textual, con R@1 de 0,867 en el conjunto COCO Karpathy de evaluación.
- Clasificación y deduplicación de contenido: los embeddings de 256 dimensiones permiten agrupar documentos o imágenes similares con umbrales de coseno, reduciendo coste de almacenamiento frente a vectores de 512 dimensiones.
- Asistentes de búsqueda en aplicaciones de escritorio: integración de un índice vectorial local que consulta el modelo Core ML para responder búsquedas en lenguaje natural sin latencia de red.
- Filtrado de contenido y moderación: comparación de embeddings de textos o imágenes contra conjuntos de referencia para detectar similitud con contenido prohibido, con la ventaja de que el procesamiento permanece en el dispositivo.
- Sistemas de recomendación ligeros: generación de vectores de ítems y usuarios en el dispositivo para recomendaciones basadas en similitud, aprovechando el tamaño reducido (470 MB) y la cuantización int8.
- Prototipado de pipelines RAG en entornos Apple: uso del modelo como encoder de recuperación en aplicaciones de demostración que necesitan ejecutarse sin GPU dedicada ni conexión.

## Benchmarks y rendimiento

Evaluación sobre Mac con Apple Silicon (CPU + Neural Engine), con 150 imágenes del conjunto COCO Karpathy test recuperadas por su primer caption y 532 consultas multilingües cortas; vectores truncados a 256 dimensiones (Matryoshka).

| Modelo | R@1 | R@5 | R@10 | Coseno vs fp16 (imágenes, mín/media) | Coseno vs fp16 (consultas, mín/media) |
|---|---|---|---|---|---|
| fp16 (upstream) | 0,873 | 0,980 | 0,993 | – | – |
| int8 (este repo) | 0,867 | 0,980 | 0,993 | 0,9989 / 0,9997 | 0,9991 / 0,9999 |

En el 96,8 % de las consultas, la imagen top-1 coincide con la obtenida con fp16. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 0,5 GB (descarga de aproximadamente 470 MB frente a los 880 MB de la versión fp16).
- Ejecución verificada en Mac con Apple Silicon usando unidades de cómputo CPU + Neural Engine.
- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en memoria unificada de Apple Silicon, con un peso en disco/memoria de aproximadamente 470 MB.
- GPU recomendadas: no disponible; el modelo está diseñado para el Neural Engine de Apple, no para GPU NVIDIA.
- Compatibilidad con GPU de consumo: no aplica a RTX 4090 u otras GPU NVIDIA; requiere hardware Apple con Neural Engine.
- Opciones de despliegue: Core ML (`.mlpackage`) mediante el runtime de Apple; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| lorelaiassistant/embeddinggemma-2-coreml-int8 | no disponible | no disponible | Core ML int8 | Apache 2.0 (+ Gemma Terms) | Este modelo; 470 MB, R@1 0,867 |
| FluidInference/embeddinggemma-2-coreml (fp16) | no disponible | no disponible | Core ML fp16 | Apache 2.0 | Modelo base de la conversión; 880 MB, R@1 0,873 |
| google/embeddinggemma-2 | no disponible | no disponible | no disponible | Gemma Terms of Use | Modelo original de Google; sin datos de benchmarks en la información disponible |

No se dispone de datos de parámetros, contexto ni benchmarks de alternativas adicionales en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de embeddings, no un modelo generativo: no produce texto libre ni soporta razonamiento, tool calling o agentes.
- Los vectores int8 no son idénticos a los fp16; no deben mezclarse en un mismo índice vectorial, ya que las distancias entre ambas versiones no son comparables.
- El paquete de audio no está incluido; solo se cubren texto y visión.
- Las variantes de 4 bits no se publicaron por fallos de carga en el Neural Engine y por degradación del coseno (mínimo de 0,87 en consultas con palettization 4-bit).
- La evaluación se limita a 150 imágenes COCO y 532 consultas; no hay datos sobre sesgos, robustez en dominios específicos ni rendimiento en idiomas concretos.
- Riesgo de alucinación no aplica directamente al ser un modelo de recuperación, pero la calidad de recuperación depende de la distribución de los datos de indexación.
- La licencia Apache 2.0 convive con los Gemma Terms of Use y la Gemma Prohibited Use Policy, que imponen restricciones adicionales al uso comercial y a usos prohibidos; es necesario revisarlas antes de desplegar en producción.
- Requiere hardware Apple con Neural Engine; no es portable a GPU NVIDIA ni a entornos sin Core ML.
- No se documentan la longitud de contexto ni los idiomas soportados, lo que limita la planificación de despliegues con textos largos o requisitos lingüísticos específicos.

## Enlaces

- [Hugging Face: lorelaiassistant/embeddinggemma-2-coreml-int8](https://huggingface.co/lorelaiassistant/embeddinggemma-2-coreml-int8)
- [FluidInference/embeddinggemma-2-coreml](https://huggingface.co/FluidInference/embeddinggemma-2-coreml)
- [google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
- [Gemma Prohibited Use Policy](https://ai.google.dev/gemma/prohibited_use_policy)
