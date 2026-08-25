# light100bc/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusión latente de texto a imagen desarrollado originalmente por Robin Rombach y Patrick Esser (RunwayML) y publicado en 2022. Este repositorio concreto (`light100bc/stable-diffusion-v1-5`) es un espejo del checkpoint original, ahora alojado en la organización `sd-legacy`, y no está afiliado a RunwayML. El modelo es capaz de generar imágenes fotorrealistas a partir de descripciones textuales, y se convirtió en un referente de la generación de imágenes open source por su calidad y su licencia permisiva.

Arquitectónicamente, es un modelo de difusión latente (LDM) que combina un autoencoder con factor de reducción 8, un UNet de aproximadamente 860 millones de parámetros y un codificador de texto CLIP ViT-L/14 preentrenado. El checkpoint se inicializó con los pesos de Stable Diffusion v1-2 y se ajustó durante 595 000 pasos a resolución 512×512 sobre el subconjunto LAION-Aesthetics v2 5+, con un 10 % de descarte del condicionamiento de texto para mejorar el muestreo con guía libre de clasificador. El modelo está disponible en formato `safetensors` y se integra con la librería `diffusers`, así como con interfaces como ComfyUI, Automatic1111 o InvokeAI.

Su relevancia actual radica en que, pese a ser un modelo de 2022, sigue siendo una base ampliamente utilizada para fine-tuning, experimentación y despliegue en entornos de producción gracias a su tamaño moderado y a la madurez de su ecosistema de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (LDM) con autoencoder (factor 8), UNet y codificador de texto CLIP ViT-L/14 |
| Parametros totales | 859 520 964 (según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen; el texto se codifica con CLIP, sin ventana de contexto explícita) |
| Tipos de cuantizacion | No disponible (se soporta fp16 y fp32; no se documentan cuantizaciones como GGUF o int8) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Stable Diffusion v1-5 es un modelo de difusión latente que opera en un espacio latente de menor dimensionalidad en lugar de hacerlo directamente sobre píxeles. El autoencoder comprime la imagen a un espacio latente con factor de reducción 8, y el UNet (de aproximadamente 860 millones de parámetros) realiza el proceso de denoising en ese espacio. El condicionamiento textual se inyecta mediante un codificador CLIP ViT-L/14 preentrenado, que convierte el prompt en embeddings que guían la generación.

El entrenamiento se realizó en dos fases: primero, el modelo se preentrenó en imágenes de 256×256 y posteriormente se ajustó a 512×512. El checkpoint v1-5 se inicializó con los pesos de v1-2 y se fine-tuneó durante 595 000 pasos sobre el subconjunto LAION-Aesthetics v2 5+, aplicando un 10 % de descarte del condicionamiento de texto para mejorar la guía libre de clasificador. No se emplearon técnicas de RLHF ni DPO; el ajuste es puramente supervisado sobre datos de imagen-texto.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto en inglés.
- Edición de imágenes mediante técnicas como img2img (transformación de una imagen de entrada según un prompt).
- Inpainting (rellenado de regiones específicas de una imagen) si se combina con el pipeline adecuado.
- Generación de variaciones de una imagen a partir de un prompt y una semilla.
- Soporte de guía libre de clasificador (classifier-free guidance) para controlar la adherencia al prompt.
- Integración con la librería `diffusers` mediante `StableDiffusionPipeline`, así como con herramientas de terceros (ComfyUI, Automatic1111, SD.Next, InvokeAI).
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Generación de arte conceptual: artistas y diseñadores pueden crear bocetos o ilustraciones a partir de descripciones textuales, acelerando la exploración de ideas. El modelo es adecuado por su capacidad de producir imágenes coherentes con el prompt y su resolución de 512×512, suficiente para pruebas rápidas.
- Diseño de producto: equipos de marketing pueden generar imágenes de productos en distintos entornos o estilos sin necesidad de sesiones fotográficas. La guía libre de clasificador permite ajustar la fidelidad al prompt.
- Creación de contenido para redes sociales: generación de imágenes personalizadas para publicaciones, banners o memes. Su integración con herramientas como Automatic1111 facilita el flujo de trabajo.
- Fine-tuning para dominios específicos: el checkpoint sirve como base para entrenar modelos especializados (por ejemplo, en estilos artísticos concretos o en objetos particulares) mediante fine-tuning con datasets propios. Su tamaño moderado permite ajustarlo en GPUs de gama media.
- Edición de imágenes con img2img: transformar fotografías existentes aplicando cambios de estilo, color o composición. El modelo puede tomar una imagen de entrada y un prompt para producir una versión modificada.
- Investigación en generación de imágenes: sirve como referencia para estudiar artefactos, sesgos o técnicas de muestreo en modelos de difusión. Su licencia OpenRAIL-M permite uso académico y comercial con restricciones de uso indebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original no incluye métricas estandarizadas como FID o CLIP score en la model card, y este repositorio espejo tampoco las proporciona. Se recomienda consultar la literatura académica (Rombach et al., 2022) para evaluaciones cualitativas, pero no hay datos numéricos verificables en esta fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp16 ocupa aproximadamente 4 GB (UNet de 860M + autoencoder + CLIP). Con el pipeline de `diffusers`, se recomienda al menos 6 GB de VRAM para generar imágenes de 512×512 sin optimizaciones adicionales.
- GPU recomendadas: tarjetas con 6 GB o más de VRAM, como NVIDIA RTX 2060, RTX 3060, RTX 3070, o superiores. En GPUs con menos memoria, se puede usar `--medvram` o `--lowvram` en Automatic1111, o reducir el tamaño de lote.
- Cabe en GPUs de consumo: sí, en la mayoría de tarjetas modernas con al menos 6 GB. Para GPUs con 4 GB, es posible con cuantización o usando `attention slicing`.
- Opciones de despliegue: `diffusers` (Python), ComfyUI, Automatic1111 (WebUI), SD.Next, InvokeAI, y servidores de inferencia como vLLM (aunque no es el caso típico para difusión). También se puede exportar a CoreML para dispositivos Apple.
- Latencia y throughput: no se proporcionan datos oficiales. En una RTX 3060, la generación de una imagen de 512×512 con 50 pasos de muestreo suele tardar entre 5 y 10 segundos, pero estos valores son estimaciones basadas en la práctica común y no en mediciones del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros (UNet) | Resolución | Licencia | Notas |
|---|---|---|---|---|
| Stable Diffusion v1-4 | ~860M | 512×512 | CreativeML OpenRAIL-M | Predecesor directo, sin el fine-tuning adicional de v1-5 |
| Stable Diffusion v1-5 (este) | ~860M | 512×512 | CreativeML OpenRAIL-M | Fine-tune de v1-2 con 595k pasos adicionales |
| Stable Diffusion v2.0 | ~865M | 768×768 | CreativeML OpenRAIL-M | Usa un codificador de texto OpenCLIP más grande y entrena a mayor resolución |

No se dispone de datos de benchmarks comparativos en la información proporcionada. La comparativa se basa en características arquitectónicas y de entrenamiento conocidas públicamente, pero los resultados de rendimiento (FID, CLIP score) no están disponibles en este repositorio.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente con datos en inglés, por lo que los prompts en otros idiomas pueden producir resultados de menor calidad.
- Puede generar contenido sesgado o estereotipado, reflejando los sesgos presentes en el dataset LAION-Aesthetics.
- No está entrenado para ser factual; las imágenes generadas no representan necesariamente personas, eventos o lugares reales.
- Riesgo de alucinación visual: puede producir artefactos, distorsiones o detalles incoherentes, especialmente con prompts complejos o poco comunes.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero prohíbe usos malintencionados como generar contenido ilegal, difamatorio o que incite al odio. Es responsabilidad del usuario cumplir con estas restricciones.
- El repositorio es un espejo no oficial; no hay garantía de mantenimiento ni soporte por parte del autor original.
- Para producción, se recomienda evaluar la calidad del modelo en el dominio específico y considerar técnicas de filtrado de contenido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/light100bc/stable-diffusion-v1-5
- Repositorio original (sd-legacy): https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Paper (Rombach et al., 2022): https://arxiv.org/abs/2112.10752
- Repositorio GitHub de CompVis: https://github.com/CompVis/stable-diffusion
- Blog de HuggingFace sobre Stable Diffusion: https://huggingface.co/blog/stable_diffusion
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
