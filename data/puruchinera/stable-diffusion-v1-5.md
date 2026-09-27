# puruchinera/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusion latente (Latent Diffusion Model, LDM) para generacion de imagenes a partir de texto. El repositorio `puruchinera/stable-diffusion-v1-5` es un espejo (mirror) del repositorio ahora deprecado `runwayml/stable-diffusion-v1-5`; el autor de esta copia no tiene vinculacion alguna con RunwayML ni con los desarrolladores originales. El modelo original fue desarrollado por Robin Rombach y Patrick Esser y publicado bajo la licencia CreativeML OpenRAIL-M.

Tecnicamente, el checkpoint se inicializo con los pesos de Stable-Diffusion-v1-2 y despues se ajusto fino (fine-tuning) durante 595.000 pasos a resolucion 512x512 sobre el subconjunto "laion-aesthetics v2 5+", aplicando un 10% de dropout en el condicionamiento de texto para mejorar el muestreo con classifier-free guidance. La arquitectura combina un autoencoder variacional (VAE) que comprime las imagenes a un espacio latente, una UNet que realiza el proceso de difusion en ese espacio latente y un codificador de texto CLIP ViT-L/14 congelado.

El modelo sigue siendo relevante como referencia historica y como base para fine-tunings (LoRA, DreamBooth, ControlNet) gracias a su bajo coste computacional y a la enorme cantidad de herramientas y ecosistema construido a su alrededor (ComfyUI, Automatic1111, InvokeAI, SD.Next). No obstante, en terminos de calidad de imagen y resolucion queda por detras de modelos posteriores como SD 2.1 o SDXL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + VAE + text encoder CLIP ViT-L/14) |
| Parametros totales | 859.520.964 (pesos safetensors del componente principal; la pipeline completa incluye ademas el VAE y el text encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; la longitud de prompt esta limitada por el text encoder CLIP (77 tokens) |
| Tipos de cuantizacion | fp16 y fp32 en safetensors; cuantizaciones de terceros (GGUF, fp8, etc.) disponibles en la comunidad |
| Idiomas soportados | ingles (segun la model card original) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (variantes `v1-5-pruned-emaonly.safetensors` y `v1-5-pruned.safetensors`); en el ecosistema tambien circulan ficheros `.ckpt` |

El tamano del repositorio es de 47,3 GB, ya que incluye multiples variantes de pesos (ema-only, ema+non-ema, fp16 y fp32).

## Arquitectura y entrenamiento

El modelo es un Latent Diffusion Model (LDM) descrito en el paper "High-Resolution Image Synthesis With Latent Diffusion Models" (arXiv:2112.10752). En lugar de aplicar el proceso de difusion directamente sobre pixeles, un autoencoder comprime la imagen a un espacio latente de menor dimension, donde opera una UNet. El condicionamiento textual se inyecta mediante cross-attention usando un text encoder CLIP ViT-L/14 (arXiv:2103.00020) congelado, siguiendo el enfoque propuesto en el paper de Imagen (arXiv:2205.11487).

El entrenamiento consistio en inicializar el checkpoint con los pesos de Stable-Diffusion-v1-2 y ajustarlo fino durante 595.000 pasos a 512x512 sobre "laion-aesthetics v2 5+", con un 10% de dropout del condicionamiento de texto. Ese dropout es la innovacion clave para habilitar el classifier-free guidance sampling (arXiv:2207.12598) durante la inferencia. La model card no documenta el uso de RLHF ni DPO: se trata de un modelo de difusion entrenado con objetivos de denoising sobre pares imagen-texto.

El checkpoint resultante incluye dos conjuntos de pesos: los de la EMA (exponential moving average) y los no-EMA. Para inferencia se recomienda la variante ema-only (menor consumo de VRAM), mientras que para entrenamiento o fine-tuning se recomienda la variante ema+non-ema.

## Capacidades

- Generacion de imagenes fotorrealistas e ilustraciones a partir de prompts de texto (text-to-image).
- Edicion y modificacion de imagenes mediante variantes del pipeline (img2img, inpainting), aunque la model card solo documenta explicitamente la generacion texto-imagen.
- Condicionamiento por texto con classifier-free guidance, lo que permite controlar la adherencia del resultado al prompt.
- Base para fine-tuning especifico (LoRA, DreamBooth) y para adaptadores de control estructural (ControlNet).
- Integracion con multiples frontends y librerias: Diffusers, ComfyUI, Automatic1111, SD.Next e InvokeAI.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo "thinking": es un modelo generativo de imagenes, no un modelo de lenguaje.
- Capacidad multilingue: no disponible; la model card indica unicamente ingles.

## Casos de uso

- Generacion de arte conceptual y diseno grafico: artistas y disenadores pueden producir borradores visuales rapidos a partir de descripciones textuales, aprovechando el bajo coste de inferencia del modelo a 512x512.
- Creacion de material para prototipado de producto: equipos de UX pueden generar mockups e imagenes de referencia antes de encargar assets definitivos, iterando rapidamente sobre prompts.
- Ilustracion para contenidos editoriales y blogs: la licencia OpenRAIL-M permite uso comercial con restricciones, lo que facilita generar imagenes de acompanamiento para articulos.
- Base para fine-tuning personalizado con LoRA o DreamBooth: al tener 859 M de parametros, es viable entrenar adaptadores en una unica GPU de consumo para estilos o sujetos concretos.
- Investigacion sobre sesgos y seguridad en modelos generativos: la model card incluye explicitamente entre los usos previstos el analisis de limitaciones y sesgos de modelos generativos.
- Herramientas educativas de introduccion a la difusion: por su tamano moderado y su amplia documentacion, es un modelo adecuado para ensenar como funciona un LDM en cursos y talleres.
- Pipelines de generacion masiva moderada con control de contenido: integrable en backends que apliquen filtros previos y posteriores, dado que el modelo puede producir contenido inapropiado si no se filtra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: alrededor de 4 GB para la pipeline completa a 512x512; la UNet pruned ema-only ocupa aproximadamente 1,7 GB en fp16.
- VRAM para entrenamiento o fine-tuning: a partir de 10-12 GB con tecnicas de optimizacion (gradient checkpointing, LoRA); el fine-tuning completo requiere bastante mas.
- GPU recomendadas: Nvidia RTX 3060 12 GB, RTX 4070, RTX 4090 para uso local; A100 o H100 para generacion por lotes a gran escala.
- Cabe en GPU de consumo: si, incluidas GPUs con 6-8 GB de VRAM para inferencia a 512x512 en fp16.
- Opciones de despliegue: biblioteca Diffusers (PyTorch), ComfyUI, Automatic1111 (Stable Diffusion WebUI), SD.Next, InvokeAI; tambien puede exportarse a ONNX o formatos optimizados de terceros. El repositorio esta marcado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen fuertemente de la GPU, del numero de pasos de muestreo y del sampler elegido.

## Comparativa con modelos similares

| Modelo | Parametros (UNet/base) | Resolucion base | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Diffusion v1-5 | 859 M | 512x512 | CreativeML OpenRAIL-M | Abierto, muy extendido |
| Stable Diffusion v2-1 | Orden de 865 M | 768x768 | CreativeML OpenRAIL-M | Abierto |
| Stable Diffusion XL (SDXL) | Orden de 2,6 B + refiner | 1024x1024 | CreativeML OpenRAIL++-M | Abierto |

La comparacion de rendimiento cualitativo entre estos modelos no se ha publicado en la informacion proporcionada; los valores de parametros y resolucion de SD 2.1 y SDXL son de caracter orientativo y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- La model card original indica que el modelo esta pensado para fines de investigacion; el uso comercial esta sujeto a los terminos de la licencia CreativeML OpenRAIL-M.
- La licencia OpenRAIL-M impone restricciones de uso: prohibe generar contenido hostil, vejatorio o que perpetue estereotipos, y exige que los redistribuidores propaguen las mismas restricciones.
- El modelo puede reproducir sesgos presentes en el dataset LAION-5B, con especial riesgo en representaciones de personas, profesiones y grupos demograficos.
- Riesgo de alucinacion visual: no produce representaciones factuales de personas o eventos reales; la model card lo declara explicitamente fuera de alcance.
- Limitacion idiomatica: el text encoder CLIP ViT-L/14 esta entrenado principalmente en ingles, por lo que los prompts en otros idiomas ofrecen peor adherencia.
- Longitud de prompt limitada por CLIP (77 tokens), lo que restringe descripciones muy largas o detalladas.
- Este repositorio concreto es un espejo no oficial creado por el usuario `puruchinera` (0 descargas, 0 likes); no hay garantia de mantenimiento, actualizacion ni soporte. Se recomienda verificar la integridad de los pesos frente al repositorio de referencia `sd-legacy/stable-diffusion-v1-5`.
- La model card original indica que la implementacion de RunwayML esta deprecada; para nuevos desarrollos conviene usar Diffusers o frontends como ComfyUI o Automatic1111.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/puruchinera/stable-diffusion-v1-5
- Repositorio de referencia (legacy): https://huggingface.co/sd-legacy/stable-diffusion-v1-5
- Blog de Stable Diffusion en HuggingFace: https://huggingface.co/blog/stable_diffusion
- Paper de Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de Imagen: https://arxiv.org/abs/2205.11487
- Paper de classifier-free guidance: https://arxiv.org/abs/2207.12598
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Repositorio GitHub de CompVis: https://github.com/CompVis/stable-diffusion
- Repositorio GitHub de RunwayML (deprecado): https://github.com/runwayml/stable-diffusion
- Libreria Diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Automatic1111 WebUI: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- SD.Next: https://github.com/vladmandic/automatic
- InvokeAI: https://github.com/invoke-ai/InvokeAI
