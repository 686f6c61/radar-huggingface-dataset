# edvv1n/siglip2-base-patch16-224

## Resumen

SigLIP 2 Base patch16-224 es un modelo de visión-lenguaje de tipo dual-encoder que proyecta imágenes y texto en un espacio compartido de 768 dimensiones. Este repositorio concreto, publicado por el usuario edvv1n, no contiene los pesos originales en formato PyTorch o safetensors, sino una compilación del modelo original de Google (google/siglip2-base-patch16-224) mediante IREE, el compilador de MLIR de Google, empaquetada para Lumi, una plataforma de inferencia local. El paquete incluye un manifiesto, el tokenizador, los avisos de licencia y un fichero VMFB (VM FlatBuffer) por backend: CPU, Metal, Vulkan y CUDA. Cada VMFB contiene la torre de texto, la torre de visión y una cabeza estética que puntúa la calidad visual de las imágenes.

La relevancia de este artefacto es fundamentalmente de despliegue: permite ejecutar SigLIP 2 Base en entornos con IREE sin depender de PyTorch ni de CUDA Toolkit, con backends que cubren desde CPU hasta Metal en Apple Silicon, Vulkan en GPUs de diversos fabricantes y CUDA en NVIDIA. El modelo subyacente es un dual-encoder de la familia SigLIP 2, sucesora de SigLIP, diseñada para clasificación zero-shot, retrieval imagen-texto y tareas de alineación multimodal. El repositorio tiene 3,1 GB, lo que es coherente con los cuatro backends compilados junto con el tokenizador y los metadatos.

No se dispone de información sobre el pipeline declarado, la licencia específica de este repositorio ni los idiomas soportados, más allá de lo que indica la model card. Tampoco hay datos publicados de benchmarks ni de rendimiento en esta información, por lo que las cifras de la ficha se limitan a lo que se puede inferir de la arquitectura declarada y del tamaño del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder (torre de visión ViT + torre de texto transformer) con proyección a espacio compartido de 768 dimensiones; compilado con IREE a VMFB |
| Parametros totales | no disponible (el modelo base SigLIP 2 Base patch16-224 ronda los 375M, pero no se confirma en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la torre de texto de SigLIP 2 Base suele operar con secuencias cortas, típicamente 64 tokens, pero no se confirma aquí) |
| Tipos de cuantizacion | no disponible (los VMFB pueden compilarse con distintos tipos, pero no se especifica en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card menciona "license notices" incluidos en `v1/`, pero no se indica la licencia concreta) |
| Formato de pesos | VMFB (VM FlatBuffer) por backend: CPU, Metal, Vulkan, CUDA; incluye manifiesto y tokenizador |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP 2 Base con parches de 16x16 y resolución de entrada 224x224, un dual-encoder que procesa imágenes mediante una torre de visión tipo Vision Transformer y texto mediante una torre transformer, y proyecta ambas modalidades a un espacio conjunto de 768 dimensiones. La similitud entre embeddings de imagen y texto se calcula habitualmente con una función sigmoide sobre los logits por pares, en lugar de softmax sobre el lote, lo que es la innovación característica de la familia SigLIP frente a CLIP. Este repositorio añade una cabeza estética que puntúa imágenes, según la model card.

El entrenamiento original de SigLIP 2 combina objetivos de alineación imagen-texto, captioning y tareas de localización, según la documentación pública de Google, aunque esta información no se detalla en el repositorio de edvv1n. Lo relevante aquí es la cadena de compilación: IREE transforma el grafo del modelo en VMFB ejecutables sobre distintos backends (CPU, Metal, Vulkan, CUDA), lo que permite desplegar el modelo sin el stack de PyTorch y con un runtime más ligero. No se especifican en la información disponible los datos de entrenamiento, el número de tokens vistos, ni si hubo RLHF o DPO, algo que en un dual-encoder de alineación no aplica del mismo modo que en un modelo generativo.

## Capacidades

- Embedding de imágenes en un espacio vectorial de 768 dimensiones, útil para búsqueda y recuperación visual.
- Embedding de texto en el mismo espacio, lo que habilita retrieval imagen-texto y text-imagen.
- Clasificación zero-shot de imágenes mediante prompts de texto.
- Puntuación de estética de imagen a través de la cabeza estética incluida en cada VMFB.
- Ejecución multiplataforma vía IREE con backends CPU, Metal, Vulkan y CUDA.
- No se documenta soporte de tool calling, agentes, generación de texto libre ni razonamiento multi-paso: es un modelo de embedding y scoring, no un modelo generativo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta soporte de audio ni de vídeo.

## Casos de uso

- Búsqueda visual en catálogos de producto: se indexan embeddings de imágenes de un catálogo y se consultan con descripciones textuales, usando el espacio compartido de 768 dimensiones para recuperar los resultados más similares.
- Moderación y filtrado de contenido visual: la cabeza estética y los embeddings permiten puntuar y agrupar imágenes por calidad o estilo antes de publicarlas en una plataforma.
- Deduplicación y clustering de imágenes: al proyectar cada imagen a un vector de 768 dimensiones, se pueden agrupar imágenes visualmente similares con un índice vectorial (FAISS, HNSW) sin necesidad de etiquetas.
- Clasificación zero-shot en pipelines de datos: se definen categorías con prompts de texto y se clasifican imágenes nuevas sin reentrenar, útil para etiquetado automático de datasets.
- Despliegue en dispositivos sin PyTorch: gracias a los VMFB de IREE para Metal y Vulkan, el modelo puede ejecutarse en portátiles con Apple Silicon o GPUs integradas sin instalar el stack completo de CUDA.
- Evaluación estética automatizada en herramientas de edición: la cabeza estética permite puntuar variantes de una imagen generada o editada y seleccionar la de mayor calidad percibida.
- Filtrado previo en pipelines de generación de imágenes: usar el embedding de texto para descartar prompts o imágenes que no se alinean con la intención del usuario antes de pasarlos a un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 3,1 GB e incluye cuatro backends compilados; cada VMFB individual contendría los pesos del modelo base, por lo que la VRAM en ejecución dependerá del backend y del tipo de dato con el que se haya compilado.
- GPU recomendadas: no disponibles. La model card menciona backends CUDA, Metal y Vulkan, lo que sugiere compatibilidad con GPUs NVIDIA, Apple Silicon y GPUs con soporte Vulkan, pero no se detallan modelos concretos.
- GPU de consumo: no se confirma si cabe en GPUs de consumo; el tamaño del modelo base (unos cientos de millones de parámetros) sugiere que sí en la mayoría de GPUs modernas, pero es una inferencia, no un dato del repositorio.
- Opciones de despliegue: runtime de IREE con los VMFB incluidos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| edvv1n/siglip2-base-patch16-224 (este repo) | no disponible | no disponible | no disponible | VMFB (IREE) | Hugging Face, 0 descargas |
| google/siglip2-base-patch16-224 | ~375M (según documentación pública de Google, no confirmado aquí) | no disponible | no disponible en esta información | safetensors/PyTorch | Hugging Face |
| CLIP ViT-B/32 (OpenAI) | ~151M | 77 tokens | MIT (según documentación pública) | PyTorch, ONNX | Hugging Face, widely available |
| SigLIP Base patch16-224 (versión 1) | ~203M | no disponible | Apache 2.0 (según documentación pública) | safetensors/PyTorch | Hugging Face |

La comparativa se limita a la información pública de los modelos de referencia; los datos de parámetros y licencia de las alternativas no están confirmados en la información proporcionada para este repositorio y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; antes de uso comercial es imprescindible revisar los avisos de licencia incluidos en `v1/` del repositorio.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (27 de noviembre de 2026), lo que indica que es un artefacto reciente y sin validación comunitaria.
- Al ser una compilación con IREE, los pesos no están en safetensors ni en formato PyTorch; no se puede cargar directamente con transformers sin reconvertir.
- No se documentan idiomas soportados; el comportamiento multilingüe del tokenizador de texto es incierto.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de embedding y scoring, el riesgo de alucinación se traslada a falsos positivos en retrieval y clasificación.
- No hay benchmarks publicados para esta compilación concreta, por lo que el rendimiento real frente al modelo original de Google no está verificado.
- La cabeza estética añadida no está documentada en detalle; su calibración y su comportamiento fuera del dominio de entrenamiento son desconocidos.
- No se especifica la versión de IREE ni los flags de compilación, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/edvv1n/siglip2-base-patch16-224
- Modelo original de Google: https://huggingface.co/google/siglip2-base-patch16-224
- IREE (compilador de MLIR de Google): no se proporciona enlace en la información disponible
- Lumi (plataforma de inferencia mencionada): no se proporciona enlace en la información disponible
