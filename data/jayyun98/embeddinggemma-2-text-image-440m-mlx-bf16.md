# jayyun98/embeddinggemma-2-text-image-440m-mlx-bf16

## Resumen

EmbeddingGemma 2 text + image 440m MLX BF16 es una exportación de despliegue modular, en formato MLX y precisión BF16, del modelo de embeddings multimodal EmbeddingGemma 2 de Google DeepMind. La publica el usuario jayyun98 como derivado independiente y no como lanzamiento oficial de Google, y conserva únicamente el backbone de texto, el codificador de visión y la proyección de visión; el codificador de audio y su proyección han sido eliminados. No se ha aplicado entrenamiento, destilación ni cuantización, por lo que los pesos mantienen la precisión BF16 del checkpoint original.

Se trata de un modelo de extracción de características (feature-extraction) orientado a similitud de frases, recuperación de información y búsqueda de código, con 438.760.448 parámetros efectivos y un presupuesto de contexto de 8.192 tokens. Genera embeddings de 768 dimensiones con truncamiento MRL a 512, 256 y 128, y acepta como entrada texto, código, imágenes y combinaciones texto-imagen.

Su relevancia práctica reside en que permite ejecutar embeddings multimodales de forma nativa sobre GPU de Apple Silicon mediante la librería MLX, sin depender de CUDA, algo útil para desarrolladores que trabajan en Mac y necesitan indexación semántica local de texto, código e imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportación MLX de EmbeddingGemma 2 (backbone de texto + codificador de visión + proyección de visión); arquitectura interna detallada no disponible en la información proporcionada |
| Parametros totales | 438.760.448 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | ninguno; pesos en BF16. No se debe convertir a FP16; usar BF16 o FP32 |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), biblioteca MLX |
| Dimension de salida | 768; truncamiento MRL a 512, 256 y 128 |
| Tamano del repositorio | 0,9 GB (archivos de pesos: 877,60 MB en decimal) |
| Modelo base | google/embeddinggemma-2 |

## Arquitectura y entrenamiento

Se trata de una exportación de inferencia, no de un modelo entrenado por el autor de esta ficha. Según la model card, solo se conservan el backbone de texto, el codificador de visión y la proyección de visión; el codificador de audio y la proyección de audio están ausentes. Los pesos retenidos preservan la precisión BF16 del origen y no se aplicó entrenamiento, destilación ni cuantización. Los prompts originales, el comportamiento de pooling y los activos de tokenizer y processor se mantienen.

El modelo base, EmbeddingGemma 2 de Google DeepMind, es un modelo de embeddings multimodal; los detalles concretos de su arquitectura interna, volumen de tokens de entrenamiento, composición del dataset y uso de RLHF o DPO no se especifican en la información proporcionada, por lo que se consideran no disponibles. La innovación técnica destacable de esta exportación es el uso de representaciones MRL (Matryoshka Representation Learning), que permiten truncar los vectores de 768 dimensiones a 512, 256 o 128 dimensiones normalizando después del recorte. La model card incluye además una tabla de verificación numérica frente al checkpoint original en FP32.

## Capacidades

- Generación de embeddings de texto y código para similitud de frases y recuperación (retrieval).
- Embeddings de imagen mediante un codificador de visión dedicado.
- Embeddings multimodales de entradas mixtas texto-imagen y de dos imágenes intercaladas.
- Prefijos de tarea específicos: `SearchQuery` para consultas de búsqueda, `CodeRetrieval` para búsqueda de código y `Document` para elementos de corpus; para documentos con título, `title: {title} | text: {content}`.
- Salida de 768 dimensiones con truncamiento MRL a 512, 256 y 128 dimensiones.
- Soporte multilingüe (verificado, según la model card, con búsqueda y documentos en inglés y coreano).
- No soporta audio, ya que el codificador y la proyección de audio fueron eliminados en esta exportación.
- No se documenta soporte de tool calling ni de razonamiento multi-paso, dado que es un modelo de embeddings y no generativo.

## Casos de uso

- Búsqueda semántica multilingüe en local: indexar un corpus de documentos con el prefijo `Document` y consultas con `SearchQuery`, aprovechando los 8.192 tokens de contexto y los vectores MRL de 128 dimensiones para índices compactos.
- Búsqueda de código en repositorios: usar el prefijo `CodeRetrieval` para emparejar consultas en lenguaje natural con fragmentos de código, útil en asistentes de desarrollo que corren sobre Mac.
- Recuperación aumentada (RAG) sobre Apple Silicon: generar embeddings de texto e imágenes para alimentar una base vectorial en una máquina sin GPU NVIDIA.
- Búsqueda visual y multimodal: combinar el codificador de visión con el backbone de texto para recuperar imágenes a partir de descripciones textuales o viceversa.
- Deduplicación y clustering de contenido: comparar similitudes coseno entre documentos, imágenes o fragmentos de código para agrupar contenido homogéneo.
- Clasificación y filtrado por similitud: usar los embeddings como características en tareas de clasificación, moderación o recomendación, con vectores de 256 o 128 dimensiones para reducir coste de almacenamiento.
- Prototipado en portátiles Mac: al requerir aproximadamente 0,9 GB de pesos, permite desarrollo y pruebas de recuperación sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (como MTEB) en la información disponible. La model card proporciona únicamente comprobaciones numéricas de fidelidad frente al checkpoint original de Google en FP32, que no constituyen una evaluación de calidad de recuperación ni un benchmark de velocidad.

| Fixture | Cosine minima vs FP32 original | Diferencia absoluta maxima |
|---|---:|---:|
| search_english_korean | 0,999968330 | 0,000979403965 |
| documents | 0,999956582 | 0,00113807619 |
| code | 0,999964800 | 0,000997241586 |
| image | 0,999978069 | 0,000812895596 |
| mixed_text_image | 0,999942632 | 0,00147365957 |
| interleaved_two_images | 0,999946479 | 0,00150192995 |

## Requisitos de hardware

- Pesos: 877,60 MB en BF16; el repositorio completo ocupa 0,9 GB.
- VRAM estimada: en torno a 0,9 GB solo para los pesos en BF16, más el overhead de activaciones; cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon.
- GPU recomendadas: GPU de Apple Silicon (series M1, M2, M3 o M4) mediante MLX. No se contempla soporte CUDA para esta exportación, ya que la librería es específica de Apple.
- Cabe en GPU de consumo: sí, en Mac con chip Apple Silicon; no está pensado para GPU de consumo NVIDIA por la dependencia de MLX.
- Despliegue: MLX (`mlx>=0.32.3`) junto con `transformers>=5.19.0` y una revisión concreta y anclada de mlx-vlm (`git+https://github.com/Blaizzy/mlx-vlm.git@3d87e88402f307efbf68e568971aa887ee7d9ed0`). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jayyun98/embeddinggemma-2-text-image-440m-mlx-bf16 | 438.760.448 | 8.192 tokens | 768 (MRL 512/256/128) | texto, codigo, imagen, texto+imagen (sin audio) | Apache 2.0 | MLX, safetensors BF16 |
| google/embeddinggemma-2 (base) | no disponible en la informacion proporcionada (el derivado retiene 438.760.448) | 8.192 tokens | 768 (MRL 512/256/128) | texto, codigo, imagen, texto+imagen y audio | Apache 2.0 | checkpoint completo de Google |
| Otros modelos de embeddings de texto de proposito general (por ejemplo, BGE-M3 o jina-embeddings-v3) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | solo texto (no multimodal), segun su naturaleza general | no disponible en la informacion proporcionada | no disponibles en esta ficha |

La comparación directa más fiable es con el modelo base google/embeddinggemma-2, del que esta exportación deriva: comparten parámetros y dimensiones de salida, pero el derivado elimina la modalidad de audio. La información proporcionada no incluye datos de rendimiento de terceros que permitan una comparación cuantitativa fiable con otras alternativas.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Google; es un derivado independiente publicado por el usuario jayyun98. Los pesos y activos originales pertenecen a Google DeepMind.
- No incluye la modalidad de audio: el codificador y la proyección de audio están ausentes, y los flujos de vídeo no fueron evaluados.
- No se debe convertir el modelo a FP16; la model card indica explícitamente usar BF16 o FP32.
- Las mediciones incluidas son comprobaciones de fidelidad numérica y de carga, no resultados de MTEB, evaluaciones de calidad de recuperación ni benchmarks de velocidad.
- Puede haber pequeñas diferencias aritméticas y de redondeo BF16 respecto a PyTorch FP32 por ser multiplataforma.
- Este modelo no genera texto ni razona paso a paso: es un extractor de características, por lo que las advertencias típicas de alucinación en modelos generativos no aplican del mismo modo; el riesgo se limita a la calidad del embedding recuperado.
- El soporte multilingüe se declara de forma genérica, pero la verificación documentada cubre principalmente inglés y coreano; el comportamiento en otros idiomas no está cuantificado.
- Requiere el stack MLX y una revisión anclada de mlx-vlm; dependencias desactualizadas pueden impedir la carga del modelo.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de atribución y los archivos LICENSE y NOTICE.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que su validación por parte de la comunidad es nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-mlx-bf16
- Modelo base (Google DeepMind): https://huggingface.co/google/embeddinggemma-2
- Revisión original del checkpoint: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Implementación MLX-VLM (revisión anclada): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Archivos de verificación del repositorio: conversion.json y verification.json (referenciados en la model card; no se proporcionan URL directas en la información disponible)
