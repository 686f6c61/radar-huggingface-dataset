# feiaitou/waiIllustriousSDXL_v170

## Resumen
waiIllustriousSDXL_v170 es un LoRA de generación de texto a imagen (text-to-image) desarrollado por el usuario feiaitou, publicado en Hugging Face bajo la librería diffusers. Se trata de un adaptador de bajo rango (LoRA) entrenado sobre el modelo base OnomaAIResearch/Illustrious-xl-early-release-v0, un checkpoint de SDXL orientado a ilustración de estilo anime. El modelo está pensado para afinar el estilo visual, la paleta de color y la coherencia de personajes del modelo base, no para sustituirlo.

El repositorio ocupa 7,0 GB y se distribuye con licencia CDLA-Permissive-2.0. La model card está claramente orientada a ilustración de personajes anime, con soporte para etiquetas de clasificación de seguridad (general, sensitive, nsfw, explicit) y una lista de personajes de más de 5000 entradas a través de una aplicación externa de selección de personajes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni resultados de benchmarks.

La relevancia de esta ficha es acotada: es un LoRA de nicho, con cero descargas y cero likes en el momento de la consulta, creado como proyecto de aficionado según declara el propio autor. Resulta útil para quien quiera reproducir el estilo del checkpoint WAI-illustrious-SDXL en entornos diffusers/ComfyUI/Forge, pero no es un modelo de propósito general ni compite en la categoría de LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión SDXL (base: Illustrious-xl-early-release-v0) |
| Parámetros totales | no disponible (el repo ocupa 7,0 GB; el desglose de parámetros del adaptador no se indica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución recomendada de 1024×1024 o superior) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | CDLA-Permissive-2.0 |
| Formato de pesos | diffusers (formato de pesos concreto no especificado en la información disponible) |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA para un checkpoint de difusión basado en SDXL. El modelo base, Illustrious-xl-early-release-v0 de OnomaAIResearch, es un SDXL afinado para ilustración anime. El LoRA modifica los pesos del UNet (y presumiblemente del text encoder, aunque no se detalla) para ajustar el estilo de color, la coherencia entre personaje y fondo y la corrección de extremidades en el proceso de high-resolution fix. No se especifica el rango del LoRA, el número de pasos de entrenamiento, el tamaño del dataset ni si se usó regularización.

La model card menciona mejoras concretas en la versión v17: corrección de inconsistencias de tono entre algunos personajes y el fondo, intento de mejorar la relevancia del fondo respecto al personaje, una coloración general más suave y limpia, y una mejora del high-resolution fix para corregir brazos, piernas, manos y pies. No hay información sobre el proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO), lo cual es esperable en un LoRA de imagen. Tampoco se documentan innovaciones técnicas como decodificación especulativa o attention linear, que no aplican a este tipo de modelo.

## Capacidades
- Generación de imágenes texto a imagen con estética anime/ilustración, heredada del checkpoint Illustrious SDXL.
- Control de estilo mediante prompts: la model card documenta modificadores como `oil painting \(medium\), no lineart,` para forzar estilos pictóricos.
- Ajuste de edad aparente del personaje mediante tags como `(aged up:1.0–2.0)` o `(mature female:1.0–2.0)`.
- Soporte de etiquetas de clasificación de seguridad: general, sensitive, nsfw, explicit, con la recomendación de añadir `nsfw` al prompt negativo para filtrar contenido.
- Integración con la aplicación externa Character Select SAA, que ofrece una lista de 5058 personajes (incluyendo múltiples vestuarios) y autocompletado semiautomático de tags.
- Compatibilidad con ComfyUI y WebUI API a través de la aplicación Character Select SAA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de difusión, no un LLM.

## Casos de uso
- Ilustración de personajes anime en producción: el LoRA se aplica sobre Illustrious SDXL para generar retratos y escenas con coherencia de color entre personaje y fondo, usando prompts detallados y la configuración recomendada (15-30 pasos, CFG 5-7, sampler Euler a).
- Generación de fan art con personajes concretos: mediante la app Character Select SAA y su lista de 5058 personajes, se pueden autocompletar tags de personaje y vestuario, reduciendo el trabajo manual de prompting.
- Creación de assets para videojuegos o novelas visuales: el modelo permite generar variaciones de un mismo personaje con `aged up` o cambios de vestuario, útil para sprites o ilustraciones de diálogo.
- Estilización pictórica: con modificadores como `oil painting \(medium\), no lineart,` se pueden producir ilustraciones con acabado de pintura al óleo, adecuadas para portadas o ilustraciones editoriales.
- Corrección de extremidades en postprocesado: el high-resolution fix del LoRA (Hires upscale 1.5, Hires steps 20, R-ESRGAN 4x+ Anime6B, denoising 0.35-0.5) está pensado para corregir brazos, piernas, manos y pies en imágenes ya generadas.
- Flujos automatizados vía API: al ser compatible con ComfyUI/WebUI API a través de Character Select SAA, se puede integrar en pipelines de generación por lotes para catálogos de personajes o pruebas de concepto.
- Filtrado de contenido en entornos controlados: las etiquetas de safety rating permiten añadir `nsfw` al prompt negativo para limitar la salida a contenido general o sensitive.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita. Al ser un LoRA sobre SDXL, los requisitos son los del modelo base Illustrious SDXL; el repo pesa 7,0 GB, lo que da una orientación del espacio en disco necesario, no de VRAM.
- GPU recomendadas: no especificadas por el autor. Para SDXL en general se suelen requerir GPUs con 8-12 GB de VRAM o más, pero este dato no está confirmado en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado en la documentación; depende del modelo base y de la cuantización, que no se detalla.
- Opciones de despliegue: diffusers (librería declarada), y según la model card, forge-neo como software recomendado, además de ComfyUI y WebUI a través de la API de Character Select SAA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia contextual, el modelo base es OnomaAIResearch/Illustrious-xl-early-release-v0, y el autor cita el checkpoint original WAI-illustrious-SDXL en Civitai, pero no se aportan métricas comparativas.

## Limitaciones y advertencias
- Es un LoRA de nicho con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Proyecto de aficionado: el autor declara que lo mantiene en su tiempo libre y que ha sufrido daños de hardware (GPU y disco), por lo que las actualizaciones pueden espaciarse.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión: extremidades mal formadas, incoherencias de fondo y deriva de estilo, que el propio autor intenta mitigar con el high-resolution fix.
- La model card advierte de que añadir demasiados tags de calidad/estética o prompts negativos demasiado largos reduce la calidad de imagen y la vuelve más borrosa.
- Contenido NSFW: el modelo está entrenado para ilustración anime y contempla etiquetas nsfw/explicit; requiere filtrado activo en entornos de producción.
- Licencia CDLA-Permissive-2.0: permite uso comercial según los términos de dicha licencia, pero conviene verificar las condiciones del modelo base (Illustrious-xl-early-release-v0) y del checkpoint original en Civitai, que pueden imponer restricciones adicionales.
- Idiomas: no se documenta soporte multilingüe; los prompts de ejemplo están en inglés y los tags de personaje parecen estar en inglés.
- No es un LLM: no soporta razonamiento, código, matemáticas, tool calling ni agentes; cualquier comparación con modelos de lenguaje es inadecuada.

## Enlaces
- Hugging Face: https://huggingface.co/feiaitou/waiIllustriousSDXL_v170
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Checkpoint original en Civitai: https://civitai.red/models/827184/wai-illustrious-sdxl
- Perfil del autor en Civitai: https://civitai.red/user/WAI0731
- Generación online del autor: https://tensor.art/u/762555264535746522
- Character Select SAA (app): https://github.com/mirabarukaso/character_select_stand_alone_app
- Entorno embebido para SAA: https://huggingface.co/datasets/flagrantia/character_select_stand_alone_app/resolve/main/embeded_env_for_SAA.zip
- Space de búsqueda de personajes: https://huggingface.co/spaces/flagrantia/character_select_saa
