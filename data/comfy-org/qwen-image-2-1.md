# Comfy-Org/Qwen-Image-2.1

## Resumen

Comfy-Org/Qwen-Image-2.1 es un repositorio de redistribución de los pesos del modelo de difusión Qwen-Image 2.1, empaquetados en formato de fichero único para su uso directo en ComfyUI. El modelo original lo desarrolla el equipo Qwen (Alibaba), y Comfy-Org se limita a reorganizar los ficheros, convertirlos a variantes int8 y w4a8, y publicar workflows de referencia para edición y generación de imágenes. El repositorio acumula más de 9,6 millones de descargas, lo que lo convierte en la vía práctica más habitual para ejecutar Qwen-Image 2.1 en un entorno local.

Se trata de un modelo de difusión texto-a-imagen con capacidad de edición de imagen (image-to-image), acompañado de un text encoder basado en Qwen3-VL de 8B y de un módulo opcional de mejora de prompts (Qwen3.5 9B, en variantes T2I e I2I). El paquete incluye además variantes Turbo destiladas y LoRAs que reducen la inferencia a entre 5 y 8 pasos con CFG 1, así como un ControlNet Union para condicionamiento estructural.

La relevancia actual reside en que concentra en un solo repositorio todos los artefactos necesarios (difusión, VAE, text encoders, LoRAs, parches) con cuantizaciones listas para GPUs de consumo, algo poco habitual en modelos de esta familia. No se dispone de información sobre la arquitectura interna, el número de parámetros del difusor ni los datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión texto-a-imagen (detalles internos no disponibles); text encoder basado en Qwen3-VL 8B |
| Parametros totales | no disponible para el difusor; text encoder de 8B y módulo de prompt enhancement de 9B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8 (convrot), w4a8 (text encoders) |
| Idiomas soportados | no disponible (los prompts se procesan mediante Qwen3-VL, multilingüe, pero no se documenta la cobertura) |
| Licencia | qwen-research (licencia "other" con nombre qwen-research) |
| Formato de pesos | safetensors en fichero único para ComfyUI (diffusion-single-file) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del difusor (tipo de backbone, número de parámetros, mecanismo de atención) ni sobre el volumen o composición del dataset de entrenamiento. La model card del repositorio de Comfy-Org es exclusivamente un documento de empaquetado: describe la ubicación de los ficheros dentro de la estructura de directorios de ComfyUI y enlaza a los repositorios originales de Qwen.

Lo que sí se documenta es la composición del ecosistema: un text encoder Qwen3-VL de 8B en bf16, int8 y w4a8; un VAE propio (qwen_image_2.1_vae_bf16); un ControlNet Union para condicionamiento estructural; y un módulo de prompt enhancement basado en Qwen3.5 9B con variantes separadas para texto-a-imagen y para imagen-a-imagen. Las variantes Turbo provienen de un proceso de destilación (repo PrunaAI/P-Q-Image-2.1-Comfy) que permite inferencia en 5, 6 u 8 pasos con CFG fijado a 1. No se detalla si el entrenamiento original incluyó RLHF, DPO ni qué innovaciones técnicas emplea el difusor.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el workflow `image_qwen_image_2_1_t2i`.
- Edición de imágenes (image-to-image) con el workflow `image_qwen_image_2_1_image_edit`.
- Inferencia acelerada mediante modelos Turbo completos o LoRAs Turbo de 5, 6 y 8 pasos con CFG 1.
- Condicionamiento estructural mediante ControlNet Union (pose, profundidad, bordes y otros modos habituales de un Union, aunque no se detalla la lista exacta).
- Mejora automática de prompts con el módulo Qwen3.5 9B, en variantes específicas para T2I e I2I, integrable mediante el nodo `Generate Text`.
- Cuantizaciones int8 y w4a8 para reducir huella de VRAM tanto en el difusor como en los text encoders.
- No se documentan capacidades de tool calling, agentes, audio ni razonamiento multi-paso; es un modelo generativo de imagen, no un LLM de propósito general.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el workflow T2I permite iterar sobre conceptos visuales en local sin depender de APIs, con la variante Turbo para reducir el coste por iteración a 5-8 pasos.
- Edición de imágenes en flujos de retoque: el workflow image edit permite modificar una imagen existente manteniendo la composición, útil para variaciones de color, sustitución de objetos o ajustes de estilo en catálogos.
- Creación de material gráfico para marketing: combinación de prompt enhancement (Qwen3.5 9B) con el difusor para convertir briefs cortos en prompts detallados y generar banners o piezas para redes con coherencia estilística.
- Integración en pipelines de ComfyUI autoalojados: al ser ficheros single-file con rutas documentadas, encaja en despliegues por lotes sobre GPUs de consumo con cuantización int8 o w4a8.
- Control estructural para diseño: el ControlNet Union permite guiar la generación con bocetos, mapas de profundidad o poses, adecuado para arquitectura, moda o storyboards.
- Generación de datasets sintéticos: producción masiva de imágenes con parámetros controlados para entrenar o aumentar otros modelos de visión, usando las LoRAs Turbo para maximizar el throughput.
- Restauración y variación de imágenes de referencia: el módulo I2I de mejora de prompts facilita describir una imagen de entrada y regenerarla con modificaciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 152,3 GB, pero la inferencia solo requiere un subconjunto: difusor, VAE y text encoder.
- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un difusor en bf16 más un text encoder de 8B en bf16 requiere una GPU de gama alta; las variantes int8 y w4a8 reducen sustancialmente la huella y están pensadas para GPUs de consumo.
- Los text encoders en w4a8 (qwen3vl_8b_w4a8, qwen3.5_9b_*_w4a8) son la opción para equipos con VRAM limitada.
- No se especifican GPU recomendadas (A100, H100, RTX 4090) en la información disponible.
- Despliegue: ComfyUI es el entorno de referencia; los ficheros son single-file safetensors y no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión en este formato).
- Latencia y throughput: no disponibles. Las LoRAs Turbo de 5-8 pasos con CFG 1 reducen el número de evaluaciones del difusor frente a la inferencia estándar, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del difusor que permitan una comparación cuantitativa rigurosa con alternativas como FLUX.1, Stable Diffusion 3.5 o Qwen-Image 1.0. La comparación se limita a aspectos de empaquetado y licencia.

| Modelo | Parametros | Contexto | Licencia | Formato ComfyUI | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image 2.1 (este repo) | no disponible (difusor); text encoder 8B | no disponible | qwen-research | sí, single-file con int8/w4a8 y Turbo | Hugging Face, 9,6 M descargas |
| Qwen-Image 2.1 original (Qwen/Qwen-Image-2.1) | no disponible | no disponible | qwen-research | pesos originales, requieren conversión | Hugging Face |
| Alternativas de la misma categoría (FLUX.1, SD 3.5) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia qwen-research: no es una licencia permisiva estándar; es imprescindible revisar el texto enlazado antes de cualquier uso comercial. El uso en producción puede estar restringido.
- Este repositorio es un reempaquetado de Comfy-Org, no el modelo oficial; para cuestiones de licencia, soporte o comportamiento del modelo, la referencia autorizada es Qwen/Qwen-Image-2.1.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas; la ausencia de esta información no implica ausencia de sesgos.
- El tamaño del repositorio (152,3 GB) exige planificación de almacenamiento; descargar el repo completo no es necesario para inferencia, pero requiere seleccionar ficheros manualmente.
- Las variantes Turbo y las LoRAs de pocos pasos con CFG 1 pueden degradar el detalle o la fidelidad al prompt respecto a la inferencia estándar; conviene validar la calidad por caso de uso.
- No hay información sobre límites de resolución, relación de aspecto soportada ni estabilidad en prompts largos.
- La integración está pensada para ComfyUI; otros entornos requerirían conversión de los ficheros single-file.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Variante Turbo original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Módulo de prompt enhancement T2I: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Módulo de prompt enhancement I2I: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Versión destilada Turbo para ComfyUI: https://huggingface.co/PrunaAI/P-Q-Image-2.1-Comfy
- Licencia: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantillas de workflows: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Workflow de edición de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Workflow Turbo T2I: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json
- Workflow Turbo de edición: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_image_edit.json
