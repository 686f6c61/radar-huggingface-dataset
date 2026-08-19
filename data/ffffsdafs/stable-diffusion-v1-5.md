# FFFFSDAFS/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusión latente texto-imagen desarrollado originalmente por Robin Rombach y Patrick Esser (RunwayML) y publicado en el paper "High-Resolution Image Synthesis with Latent Diffusion Models" (CVPR 2022). Este repositorio concreto, `FFFFSDAFS/stable-diffusion-v1-5`, es un espejo no oficial del checkpoint original, ya deprecado, y no está afiliado con RunwayML. El modelo genera imágenes fotorrealistas a partir de descripciones textuales y también permite modificar imágenes existentes mediante técnicas como img2img o inpainting.

La arquitectura combina un autoencoder variacional (VAE) para trabajar en un espacio latente de baja dimensión, un UNet como red de denoising y un codificador de texto CLIP ViT-L/14 fijo. El modelo fue inicializado con los pesos de Stable Diffusion v1-2 y posteriormente afinado durante 595 000 pasos a resolución 512×512 sobre el subconjunto "laion-aesthetics v2 5+", con un 10 % de abandono del condicionamiento textual para mejorar el muestreo con classifier-free guidance. Con 859,5 millones de parámetros y un tamaño de repositorio de 49,9 GB, es uno de los checkpoints más utilizados de la primera generación de Stable Diffusion y sigue siendo relevante como referencia para fine-tuning y despliegue en herramientas como ComfyUI, AUTOMATIC1111 o InvokeAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (VAE + UNet + CLIP ViT-L/14) |
| Parametros totales | 859 520 964 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el codificador CLIP tiene un límite de 77 tokens, pero no se especifica en la documentación) |
| Tipos de cuantizacion | No disponible (se usa fp16 en diffusers, pero no hay cuantizaciones oficiales documentadas) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (también disponible en formato diffusers) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de difusión latente: un VAE preentrenado comprime las imágenes a un espacio latente de menor resolución, donde un UNet realiza el proceso de denoising condicionado por el texto. El texto se codifica mediante un CLIP ViT-L/14 congelado, y el condicionamiento se inyecta a través de mecanismos de atención cruzada. Esta separación permite entrenar el modelo a resoluciones moderadas (512×512) y generar imágenes de alta calidad con un coste computacional reducido frente a los modelos de difusión en espacio de píxeles.

El entrenamiento partió de los pesos de Stable Diffusion v1-2 y se prolongó durante 595 000 pasos en el subconjunto "laion-aesthetics v2 5+". Se aplicó un 10 % de abandono del condicionamiento textual para mejorar el comportamiento del classifier-free guidance, técnica que permite ajustar la adherencia al prompt durante la inferencia. No se mencionan técnicas adicionales como RLHF o DPO en la información disponible. El modelo se distribuye en dos variantes de pesos: `v1-5-pruned-emaonly.safetensors` (solo EMA, adecuado para inferencia) y `v1-5-pruned.safetensors` (EMA + no-EMA, recomendado para fine-tuning).

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto en inglés.
- Modificación de imágenes existentes mediante img2img (traducir, editar o estilizar imágenes de entrada).
- Soporte para inpainting (rellenar regiones específicas de una imagen) si se combina con el pipeline adecuado.
- Condicionamiento mediante classifier-free guidance, permitiendo controlar la fidelidad al prompt.
- Integración nativa con la librería `diffusers` de Hugging Face, así como con herramientas de terceros como ComfyUI, AUTOMATIC1111, SD.Next e InvokeAI.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de síntesis de imágenes.

## Casos de uso

- Generación de arte conceptual: artistas y diseñadores pueden crear bocetos o ilustraciones a partir de descripciones textuales, explorando variaciones rápidas sin necesidad de dibujar manualmente.
- Prototipado de assets para videojuegos: el modelo permite generar texturas, fondos o sprites en fases tempranas de desarrollo, acelerando la iteración de diseño.
- Edición de imágenes en flujos de trabajo creativos: mediante img2img, se pueden transformar fotografías en estilos pictóricos o ajustar composiciones manteniendo la estructura original.
- Herramientas educativas sobre IA generativa: al ser un checkpoint abierto y bien documentado, es un recurso estándar para enseñar conceptos de difusión, fine-tuning y evaluación de sesgos.
- Investigación en alineación y seguridad: el modelo se usa como base para estudiar mitigaciones de contenido dañino, sesgos demográficos y técnicas de watermarking.
- Generación de contenido para marketing y publicidad: permite producir imágenes de muestra para campañas o presentaciones, siempre que se respete la licencia OpenRAIL-M y las restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como FID, CLIP score o comparativas con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación proporcionada.
- El tamaño del repositorio es de 49,9 GB, lo que indica que los pesos completos (EMA + no-EMA) requieren un almacenamiento considerable.
- Para inferencia con `diffusers` en fp16, se necesita una GPU con al menos 8-10 GB de VRAM (por ejemplo, NVIDIA RTX 2080 Ti o superior), aunque este dato es una estimación general y no está documentado oficialmente.
- Para fine-tuning, se recomienda una GPU con 16 GB o más (como RTX 3090, A100 o H100), dado que el checkpoint no-EMA es más pesado.
- Opciones de despliegue: librería `diffusers` (PyTorch), ComfyUI, AUTOMATIC1111, SD.Next, InvokeAI y otros frontends que soporten safetensors.
- No se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos con otros modelos de difusión como Stable Diffusion v1.4, v2.0 o SDXL.

## Limitaciones y advertencias

- La model card original advierte explícitamente que el modelo no debe usarse para generar contenido que cree entornos hostiles o alienantes, incluyendo imágenes que perpetúen estereotipos históricos o actuales.
- El modelo no está entrenado para ser factual o representar fielmente personas o eventos; su uso para generar contenido verídico está fuera de alcance.
- El idioma soportado es principalmente inglés; los prompts en otros idiomas pueden producir resultados degradados.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso responsable, aunque permite uso comercial con condiciones (consulta el texto completo de la licencia).
- Este repositorio es un espejo no oficial y no está afiliado con RunwayML; se recomienda verificar la procedencia de los pesos antes de usarlo en producción.
- No se documentan sesgos específicos, pero como modelo entrenado en LAION, puede reflejar sesgos presentes en los datos de origen.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/FFFFSDAFS/stable-diffusion-v1-5
- Paper original (Latent Diffusion Models): https://arxiv.org/abs/2112.10752
- Paper de classifier-free guidance: https://arxiv.org/abs/2207.12598
- Blog de Hugging Face sobre Stable Diffusion: https://huggingface.co/blog/stable_diffusion
- Repositorio original de CompVis (deprecado): https://github.com/CompVis/stable-diffusion
