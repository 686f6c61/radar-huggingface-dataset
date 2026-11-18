# rfsbc/waiIllustriousSDXL_v170

## Resumen

waiIllustriousSDXL_v170 es un checkpoint de generación de imágenes texto-a-imagen publicado por el usuario rfsbc en Hugging Face, construido como un ajuste fino (fine-tune) del modelo base OnomaAIResearch/Illustrious-xl-early-release-v0. Se distribuye en formato diffusers con un repositorio de 7,0 GB, lo que es coherente con un checkpoint SDXL completo (UNet, VAE y text encoders) más los pesos asociados. La model card lo etiqueta simultáneamente como `text-to-image` y `lora`, aunque el tamaño del repositorio y la referencia a un "checkpoint" completo indican que se trata de un modelo base afinado, no de un adaptador ligero.

El modelo está orientado a la generación de ilustración de estilo anime y semirrealista, con soporte explícito de contenido para adultos (etiquetas de clasificación de seguridad `general`, `sensitive`, `nsfw` y `explicit`). El autor documenta ajustes específicos en la versión v17: corrección de inconsistencias de tono entre personajes y fondo, mejora de la relevancia del fondo respecto al personaje, coloración más limpia y una mejora del proceso de "high-resolution fix" que tiende a corregir extremidades y manos.

Es relevante ahora por su integración en el ecosistema SDXL/Illustrious (ComfyUI, Forge, WebUI) y por el ecosistema de herramientas que lo acompaña: una aplicación de selección de personajes con más de 5.058 entradas y soporte de API para ComfyUI/WebUI. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y su licencia CDLA-Permissive-2.0 debe evaluarse con cuidado para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (SDXL / Illustrious-xl), UNet + VAE + text encoders; familia Stable Diffusion XL |
| Parámetros totales | no disponible (checkpoint SDXL, del orden de 2,6 mil millones en la UNet; cifra exacta no publicada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; resolución nativa recomendada superior a 1024×1024 (ejemplos a 1024×1344) |
| Tipos de cuantización | no disponible (formato diffusers; compatible con fp16 y bf16 en la práctica, no documentado por el autor) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés; los tags de Danbooru son en inglés) |
| Licencia | cdla-permissive-2.0 |
| Formato de pesos | diffusers (safetensors dentro del repositorio diffusers); no se publica GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo de difusión latente de la familia SDXL, heredada del checkpoint base Illustrious-xl-early-release-v0 de OnomaAIResearch. El pipeline `text-to-image` de diffusers opera sobre un UNet que predice ruido en el espacio latente, con un VAE integrado en el propio checkpoint (el autor indica explícitamente que no es necesario cargar un VAE externo). El modelo se distribuye como checkpoint completo afinado, no como LoRA, pese a la etiqueta `lora` y `template:diffusion-lora` presente en los metadatos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni de técnicas de alineación. El autor describe el trabajo como un proyecto de afición y documenta cambios cualitativos entre versiones (v17): corrección de tonos inconsistentes entre personaje y fondo, mejora de la coherencia fondo-personaje, coloración más suave y limpia, y una mejora del "high-resolution fix" que corrige con alta probabilidad brazos, piernas, manos y pies. También incorpora un mecanismo de control de edad aparente mediante los tags `(aged up:1.0–2.0)` y `(mature female:1.0–2.0)`.

## Capacidades

- Generación de imágenes texto-a-imagen de ilustración estilo anime y semirrealista, con resolución nativa superior a 1024×1024.
- Control fino mediante tags de Danbooru (personajes, vestimenta, composición, iluminación), incluyendo personajes con nombre propio (por ejemplo, Hatsune Miku).
- Control de estilo mediante tags de medio: `oil painting (medium)`, `no lineart`, etc.
- Control de la edad aparente del personaje mediante los tags `aged up` y `mature female`.
- Clasificación de contenido por etiquetas de seguridad: `general`, `sensitive`, `nsfw`, `explicit`; el autor recomienda añadir `nsfw` al prompt negativo para filtrar contenido inapropiado.
- Uso de prompt negativo para control de calidad (`bad quality`, `worst quality`, `worst detail`, `sketch`, `censor`).
- Integración con ComfyUI y WebUI/Forge mediante API, a través de la aplicación complementaria Character Select SAA.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es un modelo puramente generativo de imagen.

## Casos de uso

- Ilustración de personajes para proyectos de ficción: el modelo permite fijar un personaje mediante tags de Danbooru y variar pose, vestuario y fondo, con control de la edad aparente mediante `aged up`; adecuado para generar hojas de personaje consistentes.
- Generación de arte conceptual para videojuegos y cómics: la resolución nativa superior a 1024×1024 y el pipeline de hires fix (R-ESRGAN 4x+ Anime6B, denoising 0,35–0,5) permiten obtener imágenes listas para retoque en producción.
- Creación de fondos y escenarios: la v17 corrige específicamente la baja relevancia del fondo respecto al personaje, por lo que es útil para escenas con composición personaje-entorno.
- Prototipado rápido de estilos visuales: los tags de medio (`oil painting (medium)`, `no lineart`) permiten explorar estilos pictóricos sin reentrenar el modelo.
- Integración en pipelines automatizados de generación por lotes: a través de la API de ComfyUI/WebUI y de la aplicación Character Select SAA, que incluye autocompletado semiautomático de tags y una lista de más de 5.058 personajes.
- Generación de contenido para adultos con control de clasificación: el modelo expone etiquetas de seguridad explícitas y permite filtrar contenido mediante el prompt negativo, lo que facilita separar flujos de trabajo generales y NSFW.
- Uso educativo e investigación sobre fine-tuning de SDXL: al ser un checkpoint completo con model card detallada de cambios entre versiones, sirve como caso de estudio de ajuste de estilo sobre Illustrious-xl.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, aesthetic score) ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un checkpoint SDXL en fp16 se sitúa habitualmente en el rango de 8–12 GB, pero el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del checkpoint (7,0 GB) y la familia SDXL, son adecuadas GPU con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100).
- ¿Cabe en GPU de consumo? Sí, previsiblemente en GPU de consumo con 12 GB o más de VRAM; no confirmado por el autor.
- Opciones de despliegue: diffusers (librería declarada), ComfyUI y Forge/WebUI (el autor recomienda forge-neo). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Parámetros de inferencia recomendados por el autor: 15–30 pasos, CFG scale 5–7, sampler Euler a, hires upscale 1,5, hires steps 20, upscaler R-ESRGAN 4x+ Anime6B, denoising strength 0,35–0,5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Resolución nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| waiIllustriousSDXL_v170 | Illustrious-xl-early-release-v0 | Checkpoint afinado (diffusers) | >1024×1024 | cdla-permissive-2.0 | Hugging Face (0 descargas) |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | SDXL | Checkpoint base | no disponible | no disponible | Hugging Face |
| WAI-NSFW-illustrious-SDXL (original, Civitai) | Illustrious-xl | Checkpoint afinado | no disponible | no disponible | Civitai / SeaArt |
| Stable Diffusion XL base 1.0 | — | Checkpoint base | 1024×1024 | CreativeML Open RAIL++-M | Hugging Face / Stability AI |

La comparativa cuantitativa de rendimiento no está disponible: no se han publicado benchmarks del modelo ni de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre tags de Danbooru y estilos de ilustración, es previsible un sesgo hacia representaciones estereotipadas de personajes y cuerpos.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta (manos, extremidades), texto ilegible y atributos inconsistentes entre generaciones; la v17 intenta mitigar parte de esto con el hires fix, pero no lo elimina.
- Contenido para adultos: el modelo soporta explícitamente contenido `nsfw` y `explicit`; requiere filtrado activo mediante prompt negativo y políticas de uso en producción.
- Restricciones de licencia: CDLA-Permissive-2.0 permite uso comercial con condiciones de atribución; debe revisarse el texto completo de la licencia y la licencia del modelo base Illustrious-xl antes de un despliegue comercial.
- Idiomas: no se documenta soporte multilingüe; los prompts de ejemplo y los tags están en inglés, por lo que el rendimiento con prompts en castellano no está verificado.
- Madurez y soporte: repositorio con 0 descargas y 0 likes; el autor declara que es un proyecto de afición y que sufrió daños de hardware (GPU y disco), por lo que la frecuencia de actualizaciones será baja.
- Configuración sensible: el autor advierte que añadir demasiados tags de calidad/estética o prompts negativos excesivamente largos reduce la calidad de imagen y aumenta el desenfoque.
- VAE: integrado en el checkpoint; no debe cargarse un VAE externo.

## Enlaces

- Hugging Face: https://huggingface.co/rfsbc/waiIllustriousSDXL_v170
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Fuente original (Civitai): https://civitai.red/models/827184/wai-illustrious-sdxl
- Créditos del autor original: https://civitai.red/user/WAI0731
- Generación online (Tensor.Art): https://tensor.art/u/762555264535746522
- Character Select SAA (repositorio): https://github.com/mirabarukaso/character_select_stand_alone_app
- Paquete embebido de entorno: https://huggingface.co/datasets/flagrantia/character_select_stand_alone_app/resolve/main/embeded_env_for_SAA.zip
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/flagrantia/character_select_saa
