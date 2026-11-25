# protos-photos/siglip2-large-patch16-256-coreml

## Resumen

SigLIP 2 Large (patch16-256) en formato Core ML es una conversión del modelo multimodal de embeddings imagen-texto de Google, empaquetada por protos-photos para ejecución en dispositivo en macOS. El modelo original combina un codificador de visión y un codificador de texto entrenados con una función de pérdida sigmoidea (de ahí "SigLIP"), lo que permite obtener representaciones vectoriales alineadas de imágenes y textos en un espacio común. Esta conversión concreta parte de `google/siglip2-large-patch16-256` y separa la red en dos torres independientes exportadas a Core ML en float16 mediante coremltools 8.3.0.

La relevancia de este artefacto es práctica: permite realizar búsqueda semántica de imágenes y texto sin conexión, sin servidor y sin GPU dedicada, aprovechando la Neural Engine y la GPU integrada de los equipos Apple. El repositorio ocupa 1,8 GB y está pensado para integrarse en la aplicación Protos para Mac. No es un modelo generativo: no produce texto ni imágenes, sino vectores de embedding que deben normalizarse con L2 antes de calcular similitudes.

La información pública disponible es escasa: la model card describe la conversión y las firmas de entrada/salida, pero no documenta métricas de rendimiento, idiomas soportados ni detalles del entrenamiento original más allá de la referencia al modelo base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (torre de visión tipo ViT + torre de texto), conversión a Core ML |
| Parametros totales | no disponible (el modelo base es "large"; el recuento exacto no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (input_ids [1, 64]); imágenes de 256x256 píxeles |
| Tipos de cuantizacion | float16 (pesos exportados en FP16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el tokenizador es el de Gemma del modelo original; la cobertura lingüística no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlpackage / .mlmodel), float16; tokenizador original de Google incluido |
| Tamano del repositorio | 1,8 GB |
| Entradas | Imagen: `pixel_values` float32 [1, 3, 256, 256] escalado a -1..1. Texto: `input_ids` int32 [1, 64] |
| Salidas | `image_embeds` y `text_embeds` (vectores proyectados sin normalizar) |
| Herramienta de conversión | coremltools 8.3.0 |

## Arquitectura y entrenamiento

El modelo base es SigLIP 2, la segunda generación de la familia SigLIP de Google. La arquitectura es un par de transformadores: una torre de visión que procesa parches de imagen (patch size 16 sobre entradas de 256x256, lo que da 256 parches) y una torre de texto que procesa tokens. Ambas torres proyectan sus salidas a un espacio de embedding compartido y se entrenan con una pérdida sigmoidea sobre pares imagen-texto, en lugar de la softmax contrastiva de CLIP. Esta formulación permite entrenar con lotes más grandes y mejora la calidad de los embeddings en tareas de recuperación.

La conversión de protos-photos no modifica los pesos: separa el modelo en dos redes Core ML independientes, cada una en float16, y conserva el tokenizador original de Google. La torre de imagen acepta tensores float32 normalizados al rango -1..1 y devuelve `image_embeds`; la torre de texto acepta `input_ids` de longitud fija 64 y devuelve `text_embeds`. Ambas salidas son vectores proyectados sin normalizar, por lo que el consumidor debe aplicar normalización L2 antes de calcular productos escalares o similitud coseno. No se documentan en la información disponible los detalles del dataset de entrenamiento original, el número de tokens ni si hubo etapas de ajuste fino con RLHF o DPO (en un modelo de embeddings contrastivos no sería el mecanismo habitual).

## Capacidades

- Generación de embeddings de imagen: convierte una imagen RGB de 256x256 en un vector denso en el espacio compartido imagen-texto.
- Generación de embeddings de texto: convierte hasta 64 tokens en un vector en el mismo espacio.
- Búsqueda semántica imagen-texto y texto-imagen mediante similitud coseno entre embeddings normalizados.
- Clasificación zero-shot de imágenes usando prompts textuales como etiquetas.
- Recuperación de imágenes por descripción textual (text-to-image retrieval).
- Agrupamiento y deduplicación visual de imágenes por proximidad en el espacio de embeddings.
- Ejecución en dispositivo en macOS mediante Core ML, con posible uso de Neural Engine y GPU integrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá del emparejamiento imagen-texto.

## Casos de uso

- Búsqueda de fotos en una aplicación de escritorio para Mac: indexar la fototeca calculando `image_embeds` una vez por imagen y consultar con `text_embeds` de la búsqueda del usuario; la ventana de 64 tokens es suficiente para consultas cortas y la ejecución local evita enviar imágenes a la nube.
- Organización automática de bibliotecas fotográficas: agrupar imágenes por similitud coseno entre embeddings para crear álbumes temáticos o detectar duplicados visuales.
- Etiquetado zero-shot de imágenes en un pipeline de catalogación: comparar el embedding de cada imagen con embeddings de un conjunto fijo de etiquetas y asignar la de mayor similitud, sin entrenar un clasificador específico.
- Moderación o filtrado de contenido visual: precalcular embeddings de imágenes de referencia y marcar como candidatas las que superen un umbral de similitud, con revisión humana posterior.
- Búsqueda dentro de documentos escaneados o capturas: indexar recortes de imagen y permitir consultas textuales sobre su contenido visual, útil en aplicaciones de gestión documental local.
- Prototipado de sistemas de recomendación visual: usar los embeddings como características de entrada para un modelo ligero de ranking entrenado con interacciones del usuario.
- Filtrado previo en pipelines de anotación: seleccionar un subconjunto diverso de imágenes mediante clustering sobre los embeddings antes de enviarlas a anotadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (Recall@k), precisión zero-shot ni comparaciones con el modelo original en formato PyTorch. Tampoco se documentan latencias ni throughput de la conversión Core ML.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU dedicada; el repositorio pesa 1,8 GB y los pesos se cargan en memoria unificada del sistema Apple.
- GPU recomendadas: cualquier Mac con Apple Silicon (serie M1 o posterior) es el objetivo declarado; la conversión usa Core ML, por lo que se beneficia de Neural Engine y GPU integrada.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (8 GB o más es razonable dado el tamaño del artefacto); no está pensado para GPU NVIDIA.
- Opciones de despliegue: Core ML de forma nativa en macOS mediante coremltools o el framework Core ML; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| protos-photos/siglip2-large-patch16-256-coreml | no disponible (large) | Texto 64 tokens; imagen 256x256 | Core ML FP16 | Apache-2.0 | Conversión para macOS, dos torres separadas |
| google/siglip2-large-patch16-256 | no disponible (large) | Texto 64 tokens; imagen 256x256 | PyTorch (safetensors) | Apache-2.0 | Modelo base original; requiere PyTorch |
| google/siglip2-base-patch16-256 | no disponible (base) | Texto 64 tokens; imagen 256x256 | PyTorch (safetensors) | Apache-2.0 | Variante más pequeña de la misma familia, menor coste de inferencia |
| openai/clip-vit-large-patch14 | no disponible (large) | Texto 77 tokens; imagen 224x224 | PyTorch (safetensors) | MIT | Alternativa contrastiva clásica; pérdida softmax en lugar de sigmoidea |

Los datos de rendimiento comparado no están disponibles en la información proporcionada; la comparativa se limita a parámetros estructurales y licencias.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni imágenes; solo embeddings.
- Las salidas no están normalizadas; es responsabilidad del consumidor aplicar normalización L2 antes de calcular similitudes.
- La longitud de texto está fijada a 64 tokens, lo que limita consultas largas o descripciones detalladas.
- La resolución de imagen está fijada a 256x256; detalles finos pueden perderse en imágenes de alta resolución sin recorte previo.
- No se documentan los idiomas cubiertos por el tokenizador de Gemma ni su calidad multilingüe en este contexto.
- Riesgo de sesgos heredados del dataset de entrenamiento original de SigLIP 2, no evaluado en esta conversión.
- Riesgo de falsos positivos en búsqueda y clasificación zero-shot cuando las etiquetas son ambiguas o el dominio difiere del entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de copyright de Google LLC y declarar los cambios realizados en la conversión.
- Solo se distribuye para Core ML en macOS; no hay versiones para otras plataformas en este repositorio.
- El repositorio tiene un uso muy bajo (16 descargas, 0 likes) y no hay evidencia de validación comunitaria de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/protos-photos/siglip2-large-patch16-256-coreml
- Modelo base: https://huggingface.co/google/siglip2-large-patch16-256
- Documentación de coremltools: https://apple.github.io/coremltools/
- Documentación de Core ML: https://developer.apple.com/documentation/coreml
