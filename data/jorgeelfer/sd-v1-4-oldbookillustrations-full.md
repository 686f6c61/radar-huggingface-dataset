# jorgeelfer/sd-v1-4-oldbookillustrations-full

## Resumen

jorgeelfer/sd-v1-4-oldbookillustrations-full es un ajuste fino de Stable Diffusion v1-4, el modelo de difusión latente text-to-image desarrollado por CompVis en colaboración con Stability AI y Runway. El autor ha fusionado directamente en la UNet el LoRA entrenado sobre el dataset gigant/oldbookillustrations, una colección de ilustraciones de dominio público escaneadas de libros antiguos (grabados, xilografías y litografías de estilo clásico). El resultado es un checkpoint completo y autónomo que genera imágenes con estética de ilustración de libro antiguo sin necesidad de cargar adaptadores adicionales.

El modelo conserva la arquitectura original de difusión latente: 859.520.964 parámetros (~860 M), codificador de texto CLIP ViT-L/14 con 77 tokens de contexto y resolución nativa de 512x512 píxeles. Su interés es de nicho pero práctico: permite producir ilustraciones de estilo editorial clásico para juegos de rol, material educativo o diseño gráfico, con la ventaja de que las imágenes de entrenamiento proceden de obras de dominio público. El repositorio pesa 2,1 GB en formato safetensors y se utiliza mediante la librería diffusers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet 2D + VAE + CLIP ViT-L/14), pipeline text-to-image |
| Parámetros totales | 859.520.964 (~860 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 77 tokens (codificador de texto CLIP) |
| Tipos de cuantización | no disponible; el tamaño del repositorio (2,1 GB) es coherente con pesos almacenados en FP16 |
| Idiomas soportados | no disponible (el codificador CLIP del modelo base fue entrenado en inglés) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (compatible con diffusers, StableDiffusionPipeline) |
| Modelo base | CompVis/stable-diffusion-v1-4 |
| Resolución nativa | 512x512 píxeles |
| Tamaño del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

Stable Diffusion v1-4 es un modelo de difusión latente (LDM): un VAE comprime la imagen a un espacio latente con factor de compresión 8, una UNet 2D con bloques de atención cruzada actúa como denoiser condicionado por los embeddings de texto, y un codificador CLIP ViT-L/14 convierte el prompt en el condicionamiento. El modelo base fue entrenado sobre subconjuntos de LAION-5B (laion2B-en y laion-high-resolution) a resolución 512x512.

En este repositorio, el LoRA jorgeelfer/sd-v1-4-oldbookillustrations-lora se ha fusionado en la UNet, produciendo un checkpoint único. Los datos de entrenamiento proceden del dataset gigant/oldbookillustrations, basado en las ilustraciones restauradas y de dominio público del sitio oldbookillustrations.com. El autor no publica los hiperparámetros de entrenamiento de esta versión concreta (número de imágenes, épocas, learning rate ni rango del LoRA): no disponible. Como referencia de contexto, otros adaptadores comunitarios sobre el mismo dataset, como el de AGG-07, se entrenaron con unas 800 imágenes a 512 px durante 5 épocas con LoRA r=8, pero no puede asumirse que este modelo use la misma configuración.

## Capacidades

- Generación de texto a imagen a 512x512 píxeles con estética de grabado, xilografía o ilustración de libro antiguo.
- Condicionamiento mediante prompts en lenguaje natural (mejor resultados en inglés, por el codificador CLIP del modelo base).
- Compatibilidad con las técnicas habituales del ecosistema SD 1.x: negative prompts, ajuste de CFG scale, muestreo con distintos schedulers y uso en pipelines alternativas de diffusers (img2img, inpainting) al compartir arquitectura con el modelo base.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imágenes, no un LLM.
- Sin capacidades multimodales de entrada: no acepta imágenes, audio ni vídeo como entrada (salvo mediante pipelines img2img que reutilicen los pesos).
- Capacidades multilingües: no disponibles de forma fiable; los prompts en lenguas distintas del inglés degradan la coherencia.

## Casos de uso

- Ilustración editorial de temática clásica: generación de láminas y viñetas para libros, novelas de época o reimpresiones de dominio público, aprovechando que el estilo aprendido es coherente con el grabado tradicional.
- Juegos de rol y juegos de mesa: creación de cartas, bestiarios y manuales con estética victoriana o antigua, donde el estilo homogéneo del modelo ahorra trabajo de unificación visual.
- Material educativo y divulgativo: láminas para exposiciones, museos o contenidos sobre historia del arte y ciencia antigua, con imágenes de inspiración basadas en obras de dominio público.
- Diseño gráfico y texturas: fondos, papeles decorativos, estampados y ornamentos vintage para packaging o identidad visual con aire retro.
- Prototipado rápido para ilustradores: exploración de composiciones y encuadres en estilo grabado antes de realizar la obra final a mano.
- Assets para videojuegos con ambientación histórica o steampunk: generación de concept art y texturas estilizadas a 512x512, ampliables posteriormente con upscalers.
- Investigación y docencia: ejemplo práctico de fine-tuning de Stable Diffusion con LoRA fusionado, útil para estudiar cómo un dataset pequeño especializado desplaza el estilo de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Para modelos text-to-image las métricas habituales serían FID o CLIP score, pero ni el autor ni la búsqueda realizada aportan valores para este checkpoint ni comparativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: unos 4 GB (los pesos ocupan ~2 GB; el resto son activaciones y el codificador de texto). Con attention slicing o xformers puede reducirse a 2-3 GB.
- En FP32: ~4 GB solo de pesos y 6-8 GB de VRAM recomendada.
- Cabe en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060/4060 Ti de 8 GB y GTX 1660 Super de 6 GB sin problemas; incluso tarjetas de 4 GB (GTX 1650) con optimizaciones de memoria. También funciona en Apple Silicon vía MPS de PyTorch.
- Inferencia en CPU posible pero lenta: del orden de minutos por imagen a 512x512.
- Opciones de despliegue: diffusers (uso recomendado, según la model card), ComfyUI, AUTOMATIC1111, InvokeAI, ONNX Runtime y Hugging Face Inference Endpoints. vLLM, TGI y llama.cpp no aplican al ser un modelo de difusión, no un LLM.
- Latencia estimada (no publicada por el autor, valores orientativos del ecosistema SD 1.x): 1-2 segundos por imagen en RTX 4090 y 5-10 segundos en RTX 3060 con 20-30 pasos de muestreo a 512x512.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Resolución | Licencia | Diferencia clave |
|---|---|---|---|---|---|
| jorgeelfer/sd-v1-4-oldbookillustrations-full | Checkpoint completo (safetensors) | ~860 M | 512x512 | OpenRAIL-M | LoRA ya fusionado; listo para generar sin adaptadores |
| jorgeelfer/sd-v1-4-oldbookillustrations-lora | LoRA | ~860 M (base) + adaptador | 512x512 | OpenRAIL-M | Requiere cargar SD v1-4 y aplicar el adaptador; más flexible para combinar estilos |
| CompVis/stable-diffusion-v1-4 | Checkpoint completo | ~860 M | 512x512 | OpenRAIL-M | Modelo base generalista, sin especialización en ilustración antigua |
| AGG-07/sd-v1-4-lora-oldbookillustrations | LoRA | ~860 M (base) + adaptador | 512x512 | no disponible | Adaptador alternativo sobre el mismo dataset (800 imágenes, r=8, 5 épocas) |

## Limitaciones y advertencias

- Resolución nativa limitada a 512x512; para tamaños mayores es necesario recurrir a upscalers o a pipelines de resolución extendida.
- El codificador de texto CLIP está entrenado en inglés: los prompts en castellano producen resultados notablemente peores.
- Hereda los artefactos típicos de la familia SD 1.x: anatomía defectuosa (manos, rostros), texto ilegible dentro de las imágenes y composiciones incoherentes con prompts complejos.
- Sesgos: el modelo base fue entrenado con LAION-5B (con sesgos demográficos y culturales documentados) y el fine-tuning añade el sesgo del dataset, centrado en ilustración occidental de libros antiguos; no es adecuado para estilos no occidentales ni representaciones contemporáneas fieles.
- Licencia OpenRAIL-M: permite el uso comercial, pero incluye cláusulas de uso responsable que prohíben ciertas aplicaciones (contenido ilegal, daño a terceros) y obliga a mantener la licencia en los derivados; conviene revisar el texto completo antes de un despliegue comercial.
- El modelo registra 0 descargas y 0 likes en el momento de la ficha: no existe validación comunitaria ni ejemplos publicados de su calidad, por lo que se recomienda evaluarlo antes de usarlo en producción.
- El autor no publica hiperparámetros de entrenamiento ni imágenes de muestra, lo que limita la reproducibilidad y la comparación objetiva con el modelo base.
- Al no haber fusionado solo parcialmente, el checkpoint completo (2,1 GB) es menos flexible que el LoRA equivalente si se desea combinar este estilo con otros adaptadores.

## Enlaces

- Modelo: https://huggingface.co/jorgeelfer/sd-v1-4-oldbookillustrations-full
- LoRA de origen fusionado en la UNet: https://huggingface.co/jorgeelfer/sd-v1-4-oldbookillustrations-lora
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Sitio original de las ilustraciones: https://www.oldbookillustrations.com/
- Adaptador alternativo sobre el mismo dataset: https://huggingface.co/AGG-07/sd-v1-4-lora-oldbookillustrations
- Otro fine-tune LoRA similar de la comunidad: https://huggingface.co/manupm87/finetuned-sd-1.4-oldbookillustrations-lora
