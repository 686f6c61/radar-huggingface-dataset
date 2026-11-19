# Scott655/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusión latente (Latent Diffusion Model, LDM) para generación de imágenes a partir de texto, desarrollado originalmente por Robin Rombach y Patrick Esser (CompVis/Stability AI). Este repositorio concreto (`Scott655/stable-diffusion-v1-5`) es un espejo no oficial del checkpoint `sd-legacy/stable-diffusion-v1-5`; el autor del repositorio no tiene relación con RunwayML ni con los creadores originales. El modelo resuelve el problema de síntesis texto-a-imagen de alta fidelidad operando en el espacio latente de un autoencoder, lo que reduce drásticamente el coste computacional frente a la difusión en píxeles.

Arquitectónicamente combina tres componentes: un autoencoder variacional (VAE) que comprime imágenes a un espacio latente de menor dimensionalidad, un encoder de texto CLIP ViT-L/14 congelado que condiciona la generación, y una U-Net que ejecuta el proceso de denoising difusivo. El checkpoint v1-5 se inicializó con los pesos de Stable Diffusion v1-2 y se afinó durante 595 000 pasos a resolución 512x512 sobre el subconjunto «laion-aesthetics v2 5+», con un 10 % de dropout del condicionamiento textual para mejorar el classifier-free guidance.

Su relevancia actual es fundamentalmente histórica y práctica: pese a estar superado por modelos más recientes (SDXL, SD3, Flux), sigue siendo el punto de partida de facto para fine-tuning, LoRAs y pipelines de investigación por su bajo coste de inferencia, su enorme ecosistema de herramientas (ComfyUI, Automatic1111, InvokeAI) y su licencia OpenRAIL-M que permite uso comercial con restricciones. El repo ocupa 47,3 GB e incluye pesos en formato safetensors y diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (LDM): VAE + U-Net + encoder de texto CLIP ViT-L/14 congelado |
| Parametros totales | 859.520.964 (checkpoint safetensors reportado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica; limite practico de 77 tokens de prompt en CLIP (no disponible como contexto extendido en la info) |
| Tipos de cuantizacion | no disponible en la informacion; el modelo se distribuye en fp16/fp32 (pesos safetensors) |
| Idiomas soportados | ingles (segun model card); el resto no disponible |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (diffusers y checkpoints pruned/pruned-emaonly); repo de 47,3 GB |

## Arquitectura y entrenamiento

El modelo es un Latent Diffusion Model tal como se describe en el paper de Rombach et al. (CVPR 2022). La U-Net opera sobre representaciones latentes producidas por un VAE, y el condicionamiento textual proviene de un encoder CLIP ViT-L/14 fijado (no se entrena). Esto sigue el enfoque propuesto en el paper de Imagen (arxiv:2205.11487) de usar un encoder de texto preentrenado y congelado. El proceso de muestreo emplea difusión en el espacio latente con guiado por classifier-free guidance (arxiv:2207.12598).

El entrenamiento del checkpoint v1-5 partió de los pesos de Stable Diffusion v1-2 y consistió en 595 000 pasos de fine-tuning a resolución 512x512 sobre «laion-aesthetics v2 5+», aplicando un 10 % de dropout sobre el condicionamiento de texto. No se documenta en la información proporcionada el uso de RLHF, DPO ni etapas de alineación adicionales; tampoco se detalla el número total de tokens de imagen ni la composición exacta del dataset más allá de la referencia a LAION-aesthetics. La innovación técnica central es la difusión en espacio latente, que reduce el coste de cómputo frente a la difusión en píxeles manteniendo calidad perceptual.

## Capacidades

- Generación de imágenes fotorrealistas e ilustraciones a partir de prompts en inglés (text-to-image).
- Modificación de imágenes e inpainting/outpainting mediante pipelines derivados de diffusers (la model card menciona generación y modificación de imágenes).
- Condicionamiento por texto con classifier-free guidance, ajustable mediante escala de guiado.
- Compatibilidad con el ecosistema diffusers (`StableDiffusionPipeline`), ComfyUI, Automatic1111, SD.Next e InvokeAI.
- Soporte de fine-tuning y entrenamiento de LoRAs sobre los pesos base (checkpoint pruned con pesos EMA+non-EMA).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo generativo de imágenes, no un LLM.
- Capacidades multilingües: solo inglés documentado; el resto no disponible.

## Casos de uso

- Generación de arte conceptual y bocetos de diseño: el modelo produce imágenes 512x512 a partir de descripciones textuales, útil en fases tempranas de diseño gráfico donde se necesita iterar rápido sobre ideas visuales con bajo coste de inferencia.
- Creación de assets para videojuegos y prototipado: con fine-tuning o LoRAs específicos se pueden generar texturas, sprites e ilustraciones consistentes con un estilo definido, integrándolo en pipelines de ComfyUI.
- Investigación sobre sesgos y seguridad en modelos generativos: su licencia y disponibilidad permiten estudiar sesgos demográficos, contenido dañino y limitaciones de los modelos de difusión en entornos controlados.
- Herramientas educativas y creativas: integración en aplicaciones de enseñanza de arte o generación asistida de ilustraciones, aprovechando su bajo requisito de VRAM en fp16.
- Base para fine-tuning e investigación académica: al ser un checkpoint legacy ampliamente soportado, sirve como punto de partida reproducible para experimentos de difusión latente y comparativas con modelos posteriores.
- Inpainting y edición de imágenes en flujos de posproducción: mediante los pipelines de diffusers se pueden rellenar regiones o modificar elementos de una imagen existente condicionados por texto.
- Automatización de contenido visual a pequeña escala: generación por lotes de imágenes para blogs, mockups o material de marketing, con revisión humana dado el riesgo de alucinación visual y sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en fp16 requiere aproximadamente 4 GB de VRAM para generar a 512x512 con `StableDiffusionPipeline`; el checkpoint `v1-5-pruned-emaonly.safetensors` usa menos VRAM que el `pruned` (EMA+non-EMA).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 son suficientes. Para fine-tuning se recomienda A100, H100 o RTX 4090 con 24 GB.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 4 GB o más en fp16.
- Opciones de despliegue: diffusers (`StableDiffusionPipeline`), ComfyUI, Automatic1111, SD.Next, InvokeAI; el repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Diffusion v1-5 (este repo) | 859.520.964 | 512x512, prompt 77 tokens | CreativeML OpenRAIL-M | Hugging Face (espejo no oficial) |
| Stable Diffusion v1-2 | no disponible | 512x512 | CreativeML OpenRAIL-M | Hugging Face (CompVis) |
| Stable Diffusion v2-1 | no disponible | 512x512 / 768x768 | CreativeML OpenRAIL++-M | Hugging Face (Stability AI) |
| Stable Diffusion XL | no disponible | 1024x1024 | CreativeML OpenRAIL++-M | Hugging Face (Stability AI) |

Los datos de parámetros y resolución de los modelos comparados no están disponibles en la información proporcionada; la comparación se limita a la información de la model card y del ecosistema conocido.

## Limitaciones y advertencias

- El modelo está pensado únicamente para fines de investigación según la model card; el uso comercial está permitido por la licencia OpenRAIL-M pero sujeto a restricciones de uso responsable.
- Riesgo de sesgos: entrenado sobre LAION-aesthetics, puede reproducir estereotipos históricos y contemporáneos y generar representaciones sesgadas de personas y culturas.
- Riesgo de alucinación visual: no está entrenado para representar hechos o personas de forma fiel; no debe usarse para contenido factual.
- Limitaciones de idioma: solo inglés documentado; prompts en otros idiomas pueden degradar la calidad.
- Restricciones de licencia: CreativeML OpenRAIL-M impone cláusulas de uso responsable; revisar antes de despliegues comerciales.
- Este repositorio es un espejo no oficial sin relación con RunwayML; la reproducibilidad y el soporte dependen del autor del espejo, no de los creadores originales.
- Resolución nativa limitada a 512x512; resoluciones mayores requieren upscaling o pipelines específicos.
- El repositorio de GitHub original de RunwayML está marcado como deprecado; el soporte activo se canaliza vía diffusers, ComfyUI, Automatic1111, SD.Next e InvokeAI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Scott655/stable-diffusion-v1-5
- Checkpoint original legacy: https://huggingface.co/sd-legacy/stable-diffusion-v1-5
- Pesos pruned-emaonly: https://huggingface.co/sd-legacy/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors
- Pesos pruned (EMA+non-EMA): https://huggingface.co/sd-legacy/stable-diffusion-v1-5/resolve/main/v1-5-pruned.safetensors
- Paper Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Paper classifier-free guidance: https://arxiv.org/abs/2207.12598
- Paper CLIP: https://arxiv.org/abs/2103.00020
- Paper Imagen: https://arxiv.org/abs/2205.11487
- Paper DDPM: https://arxiv.org/abs/1910.09700
- Blog de Stable Diffusion en Hugging Face: https://huggingface.co/blog/stable_diffusion
- Repositorio GitHub CompVis: https://github.com/CompVis/stable-diffusion
- Repositorio GitHub RunwayML (deprecado): https://github.com/runwayml/stable-diffusion
- Librería diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Automatic1111: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- SD.Next: https://github.com/vladmandic/automatic
- InvokeAI: https://github.com/invoke-ai/InvokeAI
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
