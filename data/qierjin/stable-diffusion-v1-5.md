# qierjin/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusión latente texto-a-imagen originalmente desarrollado por Robin Rombach y Patrick Esser (CompVis/RunwayML). Este repositorio concreto (`qierjin/stable-diffusion-v1-5`) es un espejo no oficial del checkpoint `sd-legacy/stable-diffusion-v1-5` (antiguamente `runwayml/stable-diffusion-v1-5`), hoy descontinuado, y no está afiliado de ninguna manera a RunwayML. El modelo genera imágenes fotorrealistas a partir de descripciones en texto y sigue siendo uno de los puntos de partida más utilizados para fine-tuning y ecosistemas de LoRA, pese a estar técnicamente superado por SDXL y SD3.

El checkpoint v1-5 se inicializó con los pesos de Stable Diffusion v1-2 y se ajustó posteriormente durante 595.000 pasos a resolución 512x512 sobre el dataset LAION-Aesthetics v2 5+, con un 10% de descarte del condicionamiento textual para mejorar el muestreo con classifier-free guidance. Utiliza un codificador de texto CLIP ViT-L/14 congelado y cuenta con aproximadamente 860 millones de parámetros según los pesos en safetensors del repositorio.

Su relevancia actual radica en su enorme compatibilidad con herramientas (ComfyUI, AUTOMATIC1111, SD.Next, InvokeAI, Diffusers), su bajo requisito de hardware en comparación con modelos más recientes y su papel como base para incontables derivados. La licencia CreativeML OpenRAIL-M permite uso comercial con restricciones de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (Latent Diffusion Model) con codificador de texto CLIP ViT-L/14 congelado |
| Parametros totales | 859.520.964 (según safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitado por el codificador CLIP, típicamente 77 tokens) |
| Tipos de cuantizacion | no disponible (pesos en fp16/fp32; no se indican variantes cuantizadas en el repositorio) |
| Idiomas soportados | Inglés (prompts) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (también compatible con la librería diffusers) |

## Arquitectura y entrenamiento

Stable Diffusion v1-5 es un Latent Diffusion Model (LDM): un U-Net de difusión que opera en el espacio latente de un autoencoder (VAE) en lugar del espacio de píxeles, lo que reduce drásticamente el coste computacional de entrenamiento e inferencia. El condicionamiento textual se realiza mediante un codificador CLIP ViT-L/14 preentrenado y congelado, siguiendo la recomendación del paper de Imagen. La base teórica es el paper "High-Resolution Image Synthesis With Latent Diffusion Models" (Rombach et al., CVPR 2022).

El entrenamiento de este checkpoint partió de los pesos de Stable Diffusion v1-2 y continuó con 595.000 pasos adicionales a resolución 512x512 sobre el subconjunto "laion-aesthetics v2 5+" (imágenes de LAION-5B con puntuación estética alta). Durante el fine-tuning se aplicó un 10% de descarte del condicionamiento de texto (text-conditioning dropout) para habilitar el muestreo con classifier-free guidance, que mejora la adherencia al prompt en inferencia. No se emplearon técnicas posteriores como RLHF o DPO, habituales en modelos de lenguaje, sino entrenamiento estándar de difusión. No se han publicado detalles adicionales sobre el hardware o la composición exacta del dataset en la información disponible.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts en inglés (pipeline text-to-image).
- Modificación de imágenes basada en texto (img2img e inpainting mediante las variantes y pipelines de diffusers, aunque este repositorio concreto expone el pipeline `StableDiffusionPipeline` estándar).
- Base idónea para fine-tuning: DreamBooth, LoRA, textual inversion y entrenamiento completo, gracias a la disponibilidad de pesos pruned (ema-only para inferencia, ema+non-ema para ajuste fino).
- Compatibilidad con sampler classifier-free guidance (entrenado con 10% de dropout del condicionamiento).
- Integración nativa con la librería 🧨 Diffusers y con interfaces como ComfyUI, AUTOMATIC1111, SD.Next e InvokeAI.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de imágenes, no un LLM.
- El modelo entiende prompts en inglés; el rendimiento con otros idiomas no está garantizado.

## Casos de uso

- Generación de arte conceptual: artistas y diseñadores pueden producir variaciones visuales rápidas a partir de descripciones textuales a 512x512, iterando prompts en segundos sobre GPU de consumo.
- Base para fine-tuning personalizado: mediante DreamBooth o LoRA se puede adaptar el modelo a estilos propios, personajes o productos con pocos cientos de imágenes, aprovechando los pesos `v1-5-pruned.safetensors` (ema+non-ema) pensados para ajuste fino.
- Prototipado de aplicaciones generativas: su integración con Diffusers permite montar pipelines de texto-a-imagen en pocas líneas de Python, útil para demos y MVPs.
- Investigación sobre modelos generativos: la model card lo orienta explícitamente a la investigación sobre despliegue seguro, sesgos y limitaciones de modelos generativos.
- Herramientas educativas y creativas: incorporación en aplicaciones de creatividad asistida donde el usuario genera ilustraciones a partir de texto.
- Generación de assets para videojuegos y diseño: creación de texturas, fondos y conceptos preliminares que luego se refinan manualmente, gracias a la velocidad de inferencia en GPUs domésticas.
- Estudio de sesgos y contenido nocivo: como modelo ampliamente documentado, sirve de banco de pruebas para investigar estereotipos y mitigaciones en generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los modelos de difusión texto-a-imagen de esta generación no se evaluaban habitualmente con métricas estándar publicadas en la model card (FID, CLIP score u otras no constan en la información proporcionada).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en fp16 (el archivo `v1-5-pruned-emaonly.safetensors` se indica como adecuado para inferencia con menor consumo de VRAM); con cuantización adicional puede funcionar en GPUs de 4 GB.
- VRAM para fine-tuning completo: 24 GB o más recomendados; con LoRA/DreamBooth es viable en GPUs de 8-12 GB.
- GPUs recomendadas: cualquier GPU NVIDIA moderna con soporte CUDA; una RTX 3060 de 12 GB o RTX 4090 son habituales en la comunidad. El código de ejemplo usa `torch_dtype=torch.float16` y `pipe.to("cuda")`.
- Cabe perfectamente en GPUs de consumo: es uno de los modelos de difusión más ligeros de su categoría para estándares actuales.
- Opciones de despliegue: librería 🧨 Diffusers (pipeline `StableDiffusionPipeline`), ComfyUI, AUTOMATIC1111, SD.Next e InvokeAI. El repositorio GitHub original de RunwayML está descontinuado.
- Latencia y throughput: no disponible en la información proporcionada; en una GPU de consumo moderna, una imagen a 512x512 con 20-50 pasos se genera típicamente en pocos segundos, pero esta cifra no procede de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Licencia | Notas |
|---|---|---|---|---|
| Stable Diffusion v1-5 (este) | ~860 M | 512x512 | CreativeML OpenRAIL-M | Base clásica, enorme ecosistema de LoRA, hardware mínimo |
| Stable Diffusion XL (SDXL) 1.0 | ~3.500 M (base+refiner) | 1024x1024 | CreativeML Open RAIL++-M | Mayor calidad y resolución, requiere más VRAM (~8-12 GB en fp16) |
| Stable Diffusion 2-1 | ~865 M | 512x512 (768x768 la variante) | CreativeML OpenRAIL-M | Codificador OpenCLIP en lugar de CLIP ViT-L/14, mejor en algunos estilos pero menos ecosistema que v1-5 |

Comparado con alternativas modernas, v1-5 ofrece menor calidad de imagen y comprensión de prompts más limitada, pero sigue siendo preferido para fine-tuning ligero por su tamaño contenido y compatibilidad universal.

## Limitaciones y advertencias

- Este repositorio es un espejo de terceros (qierjin) del checkpoint descontinuado de RunwayML; no está afiliado a RunwayML. Para trazabilidad conviene considerar el espejo oficial `sd-legacy/stable-diffusion-v1-5`.
- El modelo no fue entrenado para representar hechos, personas o eventos reales con fidelidad: generar contenido factual o retratos de personas reales está fuera de su alcance previsto.
- Sesgos: al entrenarse con datos de LAION, reproduce sesgos y estereotipos presentes en los datos (la model card advierte contra generar contenido que propague estereotipos históricos o actuales).
- Riesgo de generación de contenido nocivo u ofensivo: la model card prohíbe explícitamente crear o difundir imágenes hostiles, perturbadoras u ofensivas.
- Idioma: los prompts funcionan en inglés; no hay soporte garantizado para castellano u otros idiomas.
- Resolución nativa limitada a 512x512; resoluciones superiores pueden producir artefactos (composición duplicada, anatomía incorrecta).
- Licencia CreativeML OpenRAIL-M: permite uso comercial pero incluye restricciones de uso responsable (cláusulas de uso que prohíben ciertas aplicaciones); hay que revisar los términos antes de desplegar en producción.
- El repositorio GitHub original de RunwayML está descontinuado, por lo que el soporte vía esa vía ya no existe.
- Baja actividad en el repositorio (63 descargas, 1 like en el momento de los datos): al ser un espejo no oficial, puede no recibir actualizaciones ni mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qierjin/stable-diffusion-v1-5
- Espejo oficial legado: https://huggingface.co/sd-legacy/stable-diffusion-v1-5
- Pesos para inferencia: https://huggingface.co/sd-legacy/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors
- Pesos para fine-tuning: https://huggingface.co/sd-legacy/stable-diffusion-v1-5/resolve/main/v1-5-pruned.safetensors
- Paper (Latent Diffusion Models): https://arxiv.org/abs/2112.10752
- Paper (classifier-free guidance): https://arxiv.org/abs/2207.12598
- Paper (CLIP): https://arxiv.org/abs/2103.00020
- Paper (Imagen): https://arxiv.org/abs/2205.11487
- Paper (DALL-E, origen de la sección de uso indebido): https://arxiv.org/abs/1910.09700
- Repositorio GitHub CompVis: https://github.com/CompVis/stable-diffusion
- Librería Diffusers: https://github.com/huggingface/diffusers
- Blog de Stable Diffusion en Hugging Face: https://huggingface.co/blog/stable_diffusion
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- AUTOMATIC1111: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- SD.Next: https://github.com/vladmandic/automatic
- InvokeAI: https://github.com/invoke-ai/InvokeAI
