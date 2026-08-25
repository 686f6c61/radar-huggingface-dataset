# flishh/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusión latente de texto a imagen desarrollado por Robin Rombach y Patrick Esser, inicialmente vinculado a CompVis y Stability AI. Este checkpoint concreto es un espejo del repositorio original, ahora deprecado, y se distribuye bajo la licencia CreativeML OpenRAIL-M. El modelo genera imágenes fotorrealistas a partir de descripciones textuales y también permite modificar imágenes existentes mediante técnicas como img2img. Su relevancia actual radica en que se ha convertido en un estándar de facto en la comunidad open source, con amplio soporte en herramientas como ComfyUI, Automatic1111 o InvokeAI, y sigue siendo una base habitual para fine-tuning y experimentación.

Arquitectónicamente, es un Latent Diffusion Model que combina un autoencoder variacional (VAE), un UNet como denoiser y un codificador de texto CLIP ViT-L/14. El modelo tiene aproximadamente 860 millones de parámetros y fue inicializado desde el checkpoint v1-2, para después fine-tunearse durante 595.000 pasos a resolución 512x512 sobre el subconjunto "laion-aesthetics v2 5+", con un 10% de drop del condicionamiento de texto para mejorar el guidance sin clasificador. El contexto de texto está limitado a 77 tokens por el codificador CLIP, aunque este dato no se especifica en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (VAE + UNet + CLIP ViT-L/14) |
| Parametros totales | 859.520.964 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Stable Diffusion v1-5 es un modelo de difusión latente que opera en un espacio latente de menor dimensionalidad en lugar de hacerlo directamente sobre píxeles. El proceso de generación consiste en que un UNet denoisa iterativamente una representación latente ruidosa, guiado por las embeddings de texto producidas por un codificador CLIP ViT-L/14 preentrenado y congelado. El VAE decodifica la representación latente final a una imagen de 512x512 píxeles. El entrenamiento se realizó en dos fases: primero se partió de los pesos de Stable Diffusion v1-2 y después se fine-tuneó durante 595.000 pasos sobre el dataset "laion-aesthetics v2 5+", que contiene imágenes de alta estética. Se aplicó un 10% de drop del condicionamiento de texto para mejorar el guidance sin clasificador, una técnica que permite controlar la adherencia al prompt durante la inferencia. No se menciona el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto en inglés.
- Modificación de imágenes existentes mediante técnicas de img2img, donde se parte de una imagen inicial y se aplica el proceso de difusión con un prompt.
- Soporte para guidance sin clasificador, que permite ajustar el equilibrio entre fidelidad al prompt y diversidad.
- Compatibilidad con pipelines de la librería diffusers, así como con interfaces gráficas como ComfyUI, Automatic1111, SD.Next e InvokeAI.
- Capacidad de generar imágenes en resolución 512x512, aunque se puede extender a otras resoluciones con técnicas de upscaling o repainting.
- No incluye capacidades de visión, audio ni razonamiento multimodal más allá de la generación de imágenes.

## Casos de uso

- Generación de arte conceptual: diseñadores e ilustradores pueden crear bocetos rápidos a partir de descripciones textuales, acelerando la exploración de ideas en fases iniciales de proyectos.
- Creación de imágenes para marketing y publicidad: el modelo permite producir visuales personalizados para campañas, adaptando el estilo y el contenido según el prompt, sin necesidad de sesiones fotográficas.
- Prototipado de diseño de producto: se pueden generar imágenes de productos o entornos para validar conceptos antes de invertir en producción física.
- Generación de fondos y texturas para videojuegos: los desarrolladores pueden obtener assets visuales variados y de alta calidad para entornos, UI o ilustraciones.
- Investigación en generación de imágenes: el modelo sirve como base para estudiar sesgos, interpretabilidad y técnicas de control en modelos generativos, tal como se indica en la model card.
- Entrenamiento de modelos auxiliares: las imágenes generadas pueden usarse como datos sintéticos para entrenar clasificadores, segmentadores u otros modelos de visión.
- Herramientas educativas y creativas: aplicaciones que permiten a usuarios sin habilidades artísticas generar ilustraciones para presentaciones, blogs o material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de requisitos oficiales de VRAM en la información proporcionada.
- El modelo tiene aproximadamente 860 millones de parámetros, por lo que en fp16 ocupa alrededor de 1,7 GB solo en pesos, pero el proceso de inferencia requiere memoria adicional para las activaciones y el VAE.
- Se puede ejecutar en GPUs de consumo como la serie RTX 30 o 40, aunque no se especifican modelos concretos.
- Opciones de despliegue: la librería diffusers, ComfyUI, Automatic1111, SD.Next, InvokeAI y el repositorio original de RunwayML (ahora deprecado).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Se puede señalar que Stable Diffusion v1-5 es una evolución de v1-2, pero no se ofrecen métricas concretas.

## Limitaciones y advertencias

- El modelo no fue entrenado para ser factual ni representar fielmente personas o eventos reales; las imágenes generadas pueden contener alucinaciones o distorsiones.
- Puede reproducir y amplificar sesgos presentes en los datos de entrenamiento, como estereotipos de género, raza o cultura.
- Solo soporta prompts en inglés, lo que limita su uso en otros idiomas.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones de uso responsable: no se puede utilizar para generar contenido dañino, hostil o que promueva estereotipos.
- El modelo puede generar contenido perturbador u ofensivo si se le pide explícitamente, por lo que se recomienda implementar filtros de seguridad en entornos de producción.
- La resolución nativa es 512x512; generar a resoluciones mayores sin técnicas adicionales puede degradar la calidad.

## Enlaces

- Repositorio en Hugging Face (espejo): https://huggingface.co/flishh/stable-diffusion-v1-5
- Repositorio original en Hugging Face: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Paper de Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Blog de Hugging Face sobre Stable Diffusion: https://huggingface.co/blog/stable_diffusion
- Repositorio de GitHub de CompVis: https://github.com/CompVis/stable-diffusion
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
