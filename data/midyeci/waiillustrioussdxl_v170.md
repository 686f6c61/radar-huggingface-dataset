# Midyeci/waiIllustriousSDXL_v170

## Resumen

waiIllustriousSDXL_v170 es un modelo de generación de imágenes texto-a-imagen (text-to-image) publicado por el usuario Midyeci en Hugging Face. Se distribuye como un LoRA de difusión (etiqueta `template:diffusion-lora`) sobre el modelo base OnomaAIResearch/Illustrious-xl-early-release-v0, un checkpoint SDXL orientado a ilustración. El repositorio ocupa 7,0 GB, lo que sugiere que se distribuye como checkpoint completo (o pesos fusionados) más que como un adaptador LoRA ligero, aunque la model card lo etiqueta como LoRA.

El modelo está orientado a la generación de ilustración y personajes de estilo anime, con soporte explícito de etiquetas de clasificación de seguridad (general, sensitive, nsfw, explicit) y de un sistema de prompt positivo/negativo estandarizado. La model card documenta ajustes de inferencia recomendados (15-30 pasos, CFG 5-7, sampler Euler a, resolución base superior a 1024x1024) y una versión v17 con mejoras en coherencia de color entre personaje y fondo, corrección de extremidades en el upscaling y un acabado de color más limpio.

Es relevante para desarrolladores que construyen pipelines de generación de ilustración sobre SDXL/Illustrious, ya que ofrece una alternativa afinada con instrucciones de uso concretas y un ecosistema de herramientas asociadas (app de selección de personajes, integración con ComfyUI/WebUI). No obstante, la información pública es escasa: no hay benchmarks, no se declaran idiomas y el número de descargas y likes es cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (SDXL / Illustrious-xl), distribuida como LoRA de difusión |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (la model card no documenta fp16/fp8/GGUF) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | cdla-permissive-2.0 |
| Formato de pesos | no disponible (repositorio de 7,0 GB; librería diffusers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de difusión latente de SDXL, concretamente en el checkpoint Illustrious-xl-early-release-v0 de OnomaAIResearch, especializado en ilustración. Se distribuye como LoRA de difusión según las etiquetas del repositorio, lo que implica un ajuste fino de bajo rango sobre el modelo base, aunque el tamaño del repositorio (7,0 GB) es compatible con pesos completos o fusionados.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas. La model card solo documenta cambios funcionales de la versión v17: corrección de inconsistencias de tono entre personajes y fondo, mejora de la relevancia del fondo respecto al personaje, coloración más suave y limpia, y mejor corrección de brazos, piernas y manos/pies durante el high-resolution fix. También indica que el VAE está integrado en el modelo.

## Capacidades

- Generación de imágenes texto-a-imagen de ilustración y personajes en estilo anime.
- Soporte de prompt positivo y negativo con etiquetas de calidad (`masterpiece,best quality,amazing quality` y `bad quality,worst quality,worst detail,sketch,censor`).
- Control de edad aparente del personaje mediante etiquetas como `(aged up:1.0–2.0)` o `(mature female:1.0–2.0)`.
- Etiquetas de clasificación de seguridad: general, sensitive, nsfw, explicit, con posibilidad de filtrar contenido añadiendo `nsfw` al prompt negativo.
- Estilos alternativos mediante etiquetas de medio, por ejemplo `oil painting \(medium\), no lineart`.
- High-resolution fix con corrección automática de extremidades (brazos, piernas, manos y pies) según la model card.
- Integración con herramientas externas de selección de personajes (Character Select SAA) con más de 5058 personajes y API para ComfyUI/WebUI.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada.

## Casos de uso

- Generación de ilustración de personajes para videojuegos o narrativa visual: el modelo acepta descripciones detalladas de vestuario, peinado y composición, y su base Illustrious está orientada a ilustración, lo que encaja con la producción de arte conceptual.
- Creación de fan art y contenido para comunidades: la model card incluye ejemplos con personajes conocidos (por ejemplo, Hatsune Miku) y un sistema de etiquetas de personaje, útil para pipelines de generación temática.
- Filtrado de contenido en plataformas: las cuatro etiquetas de seguridad permiten clasificar y filtrar salidas añadiendo `nsfw` al prompt negativo, lo que facilita su uso en entornos con moderación.
- Integración en ComfyUI/WebUI mediante la app Character Select SAA: permite autocompletado semiautomático de etiquetas y selección entre más de 5058 personajes, adecuado para flujos de trabajo de estudio.
- Generación de variaciones de estilo: con etiquetas como `oil painting \(medium\), no lineart` se pueden producir versiones pictóricas de una misma composición para exploración de dirección de arte.
- Upscaling y corrección de extremidades en producción: el high-resolution fix documentado (Hires upscale 1.5, R-ESRGAN 4x+ Anime6B, denoising 0.35-0.5) permite obtener imágenes de mayor resolución con corrección de manos y pies.
- Prototipado rápido de ideas visuales: con 15-30 pasos y CFG 5-7 se obtienen resultados en pocos segundos en GPU de consumo, útil para iterar sobre conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del repositorio (7,0 GB) y la base SDXL, se puede estimar un consumo en torno a 8-12 GB en fp16 para resolución 1024x1024, pero es una estimación no confirmada por el autor.
- GPU recomendadas: no disponible. La model card no especifica GPU; solo recomienda el software forge-neo y parámetros de muestreo.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamaño del modelo, es plausible en GPUs con 12 GB o más, pero no hay dato oficial.
- Opciones de despliegue: diffusers (librería declarada), ComfyUI y WebUI (mediante la app Character Select SAA), y forge-neo (software recomendado por el autor).
- Latencia y throughput: no disponibles. Solo se documentan parámetros de inferencia (15-30 pasos, CFG 5-7, sampler Euler a, resolución base superior a 1024x1024).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| waiIllustriousSDXL_v170 | no disponible | no aplica | sin benchmarks publicados | cdla-permissive-2.0 | Hugging Face (0 descargas, 0 likes) |
| OnomaAIResearch/Illustrious-xl-early-release-v0 (base) | no disponible | no aplica | no disponible | no disponible en la información | Hugging Face (modelo base) |
| Alternativas SDXL de ilustración | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un modelo de ilustración entrenado sobre datos no especificados, puede reproducir sesgos de representación de personajes.
- Riesgo de alucinación visual: la model card advierte que añadir demasiadas etiquetas de calidad o prompts negativos excesivamente largos reduce la calidad de imagen y aumenta el desenfoque.
- Limitaciones de idioma: no se declaran idiomas soportados; los ejemplos están en inglés y las etiquetas de personaje parecen estar en inglés.
- Restricciones de licencia: la licencia cdla-permissive-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Illustrious-xl y de los datos de entrenamiento antes de producción.
- Caveat de producción: el autor indica que es un proyecto de hobby con actualizaciones irregulares y que sufrió daños de hardware (GPU y disco), por lo que el mantenimiento puede ser lento.
- Contenido sensible: el modelo soporta etiquetas nsfw y explicit; es responsabilidad del integrador aplicar filtrado si el caso de uso lo requiere.
- Falta de benchmarks y de especificaciones técnicas (parámetros, cuantizaciones, formato de pesos) dificulta la evaluación objetiva frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Midyeci/waiIllustriousSDXL_v170
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Civitai (fuente): https://civitai.red/models/827184/wai-illustrious-sdxl
- Civitai (crédito al autor): https://civitai.red/user/WAI0731
- Character Select SAA (repositorio): https://github.com/mirabarukaso/character_select_stand_alone_app
- Character Select SAA (Space): https://huggingface.co/spaces/flagrantia/character_select_stand_alone_app
- Paquete embebido: https://huggingface.co/datasets/flagrantia/character_select_stand_alone_app/resolve/main/embeded_env_for_SAA.zip
- Generación online del autor: https://tensor.art/u/762555264535746522
- SeaArt AI Model: https://www.seaart.ai/models/detail/
