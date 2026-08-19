# jdjkdjd/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusión latente de texto a imagen desarrollado por Robin Rombach y Patrick Esser (RunwayML / CompVis), capaz de generar imágenes fotorrealistas a partir de cualquier entrada de texto. Este repositorio concreto es un espejo del deprecado `ruwnayml/stable-diffusion-v1-5` y no está afiliado de ninguna manera con RunwayML.

El checkpoint fue inicializado con los pesos de Stable-Diffusion-v1-2 y posteriormente ajustado durante 595k pasos a resolución 512x512 sobre el subconjunto "laion-aesthetics v2 5+", aplicando un descarte del 10% del condicionamiento textual para mejorar el muestreo con classifier-free guidance.

Con aproximadamente 860 millones de parámetros, fue uno de los primeros modelos de generación de imágenes de código abierto ampliamente adoptados. Sigue siendo una referencia para fine-tuning y despliegue local en herramientas como ComfyUI, Automatic1111, SD.Next o InvokeAI, y su pipeline está disponible en la librería Diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + autoencoder + text encoder CLIP ViT-L/14) |
| Parametros totales | 859.520.964 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; versiones pruned-emaonly y pruned) |
| Idiomas soportados | Ingles |
| Licencia | CreativeML OpenRAIL M |
| Formato de pesos | safetensors (compatible con diffusers, ComfyUI, Automatic1111) |

## Arquitectura y entrenamiento

Stable Diffusion v1-5 es un modelo de difusion latente que combina un autoencoder con un modelo de difusion entrenado en el espacio latente del autoencoder. Durante el entrenamiento, las imagenes se codifican mediante un encoder que las convierte en representaciones latentes, y el modelo de difusion opera sobre ese espacio reducido. Utiliza un text encoder fijo preentrenado, CLIP ViT-L/14, tal como se sugiere en el paper de Imagen.

El checkpoint se inicializo con los pesos de Stable-Diffusion-v1-2 y se ajusto durante 595k pasos a resolucion 512x512 sobre "laion-aesthetics v2 5+", con un 10% de descarte del condicionamiento textual para mejorar el muestreo con classifier-free guidance. El modelo no emplea tecnicas de RLHF ni DPO; su entrenamiento es puramente de difusion supervisada.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de prompts de texto en ingles.
- Generacion de imagenes a resolucion 512x512.
- Modificacion de imagenes existentes (img2img) mediante el pipeline de Diffusers.
- Soporte de classifier-free guidance sampling.
- Integracion con multiples frontends: Diffusers (Python), ComfyUI, Automatic1111, SD.Next e InvokeAI.
- Adecuado para fine-tuning con datasets propios (version pruned con pesos ema+non-ema).
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Generacion de arte y diseño conceptual: artistas y disenadores pueden generar imagenes a partir de descripciones textuales y explorar variaciones rapidas de ideas visuales para proyectos de ilustracion o diseño grafico.
- Herramientas educativas y creativas: aplicaciones de enseñanza de diseño o fotografia que permiten a estudiantes experimentar con generacion procedural de imagenes y entender los fundamentos de los modelos de difusion.
- Investigacion sobre modelos generativos: el modelo sirve como base academica para estudiar sesgos, limitaciones y comportamientos de los modelos de difusion en entornos controlados.
- Fine-tuning para estilos especificos: se puede ajustar con datasets propios mediante Dreambooth o LoRA para generar imagenes en estilos concretos (ilustracion, anime, fotografia, etc.).
- Prototipado de productos visuales: equipos de producto pueden generar mockups y conceptos visuales para presentaciones o validacion de ideas sin depender de un ilustrador en fases tempranas.
- Generacion de assets para videojuegos: desarrolladores independientes pueden crear texturas, fondos y concept art de forma rapida y economica.
- Restauracion y edicion de imagenes: mediante img2img y tecnicas de inpainting, se pueden modificar o restaurar fotografias existentes con instrucciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la version "pruned-emaonly" usa menos VRAM y es adecuada para inferencia; la version "pruned" (ema+non-ema) usa mas VRAM y es adecuada para fine-tuning. No se especifican cifras exactas en la documentacion.
- GPUs recomendadas: no se especifican en la documentacion, pero el modelo es compatible con GPUs de consumo NVIDIA (serie RTX) y GPUs de datacenter (A100, H100) mediante Diffusers o ComfyUI.
- Si cabe en GPUs de consumo: si, es compatible con GPUs de consumo con VRAM suficiente para inferencia en fp16.
- Opciones de despliegue: Diffusers (Python), ComfyUI, Automatic1111 (stable-diffusion-webui), SD.Next, InvokeAI. El repositorio original de RunwayML esta deprecado.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Diffusion v1-5 (este) | ~860M | 512x512 | CreativeML OpenRAIL M | HuggingFace (repos espejo) |
| Stable Diffusion v1-2 (checkpoint base) | No disponible | 512x512 | CreativeML OpenRAIL M | HuggingFace |
| Stable Diffusion v2 | No disponible | No disponible | CreativeML OpenRAIL M | HuggingFace |

Nota: la comparativa se limita a los datos disponibles. El modelo card confirma que v1-5 se inicializo desde v1-2, pero no se proporcionan especificaciones detalladas de v1-2 ni de v2 en la informacion disponible.

## Limitaciones y advertencias

- El modelo no fue entrenado para ser factual ni representar fielmente personas o eventos; usarlo para generar contenido factual esta fuera del alcance de sus capacidades.
- Riesgo de generar contenido perturbador, angustiante u ofensivo, o que propague estereotipos historicos o actuales.
- Sesgos conocidos: el entrenamiento sobre LAION-2B (en) y sus subconjuntos puede reflejar sesgos presentes en el dataset.
- Solo soporta prompts en ingles.
- Resolucion fija de 512x512; generar a resoluciones superiores requiere tecnicas adicionales como upscaling u outpainting.
- El repositorio original de RunwayML esta deprecado; este repositorio es un espejo no oficial sin afiliacion con RunwayML.
- La licencia CreativeML OpenRAIL M permite uso comercial pero impone restricciones de uso responsable: no generar contenido danino, hostil o que cree entornos alienantes.
- El modelo no debe utilizarse para generar imagenes que representen a personas reales sin consentimiento, dado que no fue entrenado para ser fiel a individuos concretos.

## Enlaces

- Repositorio HuggingFace (este espejo): https://huggingface.co/jdjkdjd/stable-diffusion-v1-5
- Repositorio HuggingFace original (deprecado): https://huggingface.co/stable-diffusion-v1-5
- GitHub (espejo con README): https://github.com/Shan-jr/stable-diffusion-v1-5-stable-diffusion-v1-5
- GitHub (espejo adicional): https://github.com/lizhen0211/stable-diffusion-v1-5
- Paper (High-Resolution Image Synthesis With Latent Diffusion Models): https://arxiv.org/abs/2112.10752
- Blog de Stable Diffusion (HuggingFace): https://huggingface.co/blog/stable_diffusion
- Licencia CreativeML OpenRAIL M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Repositorio de Diffusers: https://github.com/huggingface/diffusers
- Repositorio de ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Repositorio de Automatic1111: https://github.com/AUTOMATIC1111/stable-diffusion-webui
