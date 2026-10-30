# RunningHubAI/rh-3d-lora

## Resumen

RunningHubAI/rh-3d-lora es un adaptador LoRA para generación de imágenes que aplica un estilo 3D inspirado en las ilustraciones del videojuego Genshin Impact. Lo publica RunningHubAI en Hugging Face y procede de un trabajo original del autor @坤之, disponible también en Civitai. El adaptador está afinado a partir de IL-XL (Illustrious XL), un checkpoint de la familia SDXL orientado a la ilustración anime, y se activa con la palabra clave «yuanshensucaijietu».

No se trata de un modelo de lenguaje, sino de un archivo de pesos de 269 MiB en formato safetensors que se carga sobre el checkpoint base en ComfyUI o en la plataforma RunningHub, tanto en local como mediante su API. Su interés práctico es doble: permite conseguir el acabado 3D característico del material gráfico de Genshin Impact sin reentrenar el modelo completo, y no exige GPU propia gracias al despliegue en la nube de RunningHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre IL-XL (Illustrious XL, familia SDXL) |
| Parámetros totales | no disponible (archivo de pesos de 269 MiB) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de difusión de imágenes, no un LLM) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (generación de imágenes; palabra de activación en pinyin) |
| Licencia | no disponible (copyright del autor; publicado por RunningHub) |
| Formato de pesos | safetensors (269 MiB) |
| Modelo base | IL-XL (Illustrious XL) |
| Palabra de activación | yuanshensucaijietu |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,8 GB |
| Creación / última actualización | 24/09/2026 / 29/10/2026 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA: en lugar de reentrenar los miles de millones de parámetros del checkpoint base, entrena matrices de bajo rango que se suman a los pesos originales durante la inferencia. Esto reduce el archivo a 269 MiB, frente a los varios GB que ocupa un checkpoint completo de la familia SDXL. El modelo base declarado es IL-XL (Illustrious XL), un checkpoint derivado de SDXL especializado en ilustración anime, por lo que el LoRA hereda su pipeline de difusión latente (VAE + U-Net) y su compatibilidad con ComfyUI.

La ficha no detalla el dataset de entrenamiento, el número de pasos, el rank del LoRA ni los hiperparámetros empleados; solo indica que el entrenamiento se realizó en la plataforma RunningHub y que el proyecto original está publicado en Civitai. Al no ser un modelo de lenguaje, no aplican conceptos como preentrenamiento con tokens, RLHF o DPO: el ajuste es puramente estilístico sobre imágenes.

## Capacidades

- Generación de imágenes con acabado 3D inspirado en las ilustraciones del juego Genshin Impact, dentro del pipeline de difusión del checkpoint base IL-XL.
- Activación del estilo mediante la palabra clave «yuanshensucaijietu» en el prompt.
- Integración en workflows de ComfyUI: combinable con otros LoRA, ControlNet, upscalers y nodos personalizados.
- Modulación de la intensidad del estilo ajustando el peso del LoRA (práctica estándar en ComfyUI, típicamente entre 0,6 y 1,0).
- Ejecución en la nube en RunningHub, con opción de llamada vía API sin GPU local.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni function calling, no realiza razonamiento multi-paso ni tareas de agente, y carece de capacidades multilingües; todo ello queda fuera de su ámbito.

## Casos de uso

- Ilustración fan de Genshin Impact: generación de personajes y escenas con la estética 3D del juego usando la palabra de activación, útil para comunidades de fan art y contenido derivado no comercial.
- Concept art para videojuegos: producción rápida de moodboards y exploraciones visuales con acabado 3D anime, aprovechando que el LoRA se aplica sobre un checkpoint base ya optimizado para ilustración.
- Contenido para redes sociales: creación de ilustraciones llamativas para publicaciones, miniaturas de vídeo o avatares, con el estilo consistente que aporta un LoRA frente a prompts genéricos.
- Prototipado de estilos sin GPU local: ejecución directa en RunningHub para artistas y diseñadores sin hardware dedicado, probando el estilo antes de descargar los pesos.
- Automatización de generación de imágenes vía API: integración en pipelines por lotes (catálogos de personajes, variaciones de estilo, generación masiva de drafts) mediante la API de RunningHub.
- Composición controlada con ControlNet: fijación de poses, siluetas o composiciones de referencia en ComfyUI y aplicación del estilo 3D sobre ellas, combinando lo mejor del control estructural y la estética del LoRA.
- Comparación A/B de estilos: carga del LoRA con distintos pesos en workflows paralelos de ComfyUI para evaluar la intensidad del efecto 3D antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Además, al tratarse de un LoRA de imagen y no de un LLM, no aplican benchmarks estándar como MMLU, HumanEval o GSM8K; la calidad del estilo solo puede evaluarse de forma empírica mediante ejemplos visuales, que la ficha del repositorio no incluye.

## Requisitos de hardware

- El LoRA en sí ocupa solo 269 MiB; la carga computacional recae en el checkpoint base IL-XL (familia SDXL), cuyos requisitos habituales se sitúan en torno a 6-8 GB de VRAM con optimizaciones y 10-12 GB con holgura (estimación basada en la familia SDXL, no dato publicado por el autor).
- Consumer GPUs compatibles con pipelines SDXL en local: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, entre otras.
- Sin GPU local: RunningHub ofrece ejecución íntegra en la nube y acceso por API, lo que elimina el requisito de VRAM.
- Despliegue: ComfyUI como entorno principal, RunningHub como plataforma en la nube y descarga de pesos desde Hugging Face. vLLM, TGI, llama.cpp y Ollama no aplican, al ser un modelo de difusión y no un LLM.
- Latencia y throughput: no disponible; dependen del checkpoint base, la resolución y el número de pasos del sampler empleados en cada workflow.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-3d-lora | LoRA de estilo 3D (Genshin Impact) | IL-XL | 269 MiB | no disponible | Hugging Face, ComfyUI, RunningHub |
| Illustrious-XL (checkpoint base) | Checkpoint de difusión anime | SDXL | no disponible en la ficha | la del proyecto Illustrious | Civitai, Hugging Face |
| Versión original en Civitai («3D style of Genshin Impact») | LoRA de estilo | IL-XL / NoobAI según el identificador de la página | no disponible | la publicada en Civitai | Civitai |

No existen en la información disponible datos de rendimiento comparables entre estas variantes.

## Limitaciones y advertencias

- Ficha técnica mínima: no se publica el dataset de entrenamiento, los hiperparámetros, el rank del LoRA ni ejemplos de salida verificables.
- Licencia no especificada en Hugging Face: el copyright permanece en el autor y la ficha remite a la licencia del proyecto original; es imprescindible revisarla antes de cualquier uso comercial.
- Propiedad intelectual: el estilo reproduce la estética de Genshin Impact, propiedad de HoYoverse; la explotación comercial de imágenes con esa estética puede plantear riesgos legales de propiedad intelectual.
- Dependencia del checkpoint base IL-XL, que no se incluye en el repositorio y debe descargarse por separado.
- Palabra de activación obligatoria: sin «yuanshensucaijietu» en el prompt, el efecto de estilo puede no manifestarse.
- Adopción comunitaria nula en el momento de los datos (0 descargas, 0 likes), sin validación ni ejemplos de terceros.
- Al partir de un checkpoint de la ecosistema anime, la generación puede producir contenido sensible según el prompt; no hay evaluaciones de seguridad publicadas.
- No es un modelo de lenguaje: cualquier expectativa de generación de texto, razonamiento o agentes es inválida para este artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-3d-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-3d-lora/blob/main/README_cn.md
- Proyecto original en Civitai: https://civitai.com/models/2001500/3d-style-of-genshin-impact-game-illustriounoobai
- Página del modelo en RunningHub: https://www.runninghub.ai/model/public/2115776072980652033
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página del autor: https://www.runninghub.ai/user-center/2054944534668029953
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model

La búsqueda web no aportó enlaces relevantes adicionales para este modelo.
