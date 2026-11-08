# chenzs/Qwen-Image-2512-BF16-ComfyUI

## Resumen

Qwen-Image-2512-BF16-ComfyUI es un repositorio de redistribución de pesos del modelo de difusión Qwen-Image en su actualización de diciembre de 2025 (Qwen-Image-2512), empaquetados como archivos single-file listos para cargar en ComfyUI. Lo publica el usuario chenzs en Hugging Face y no entrena ningún modelo nuevo: reempaqueta los pesos originales de Qwen/Qwen-Image, Qwen/Qwen-Image-2512 y la variante destilada DiffSynth-Studio/Qwen-Image-Distill-Full, junto con el text encoder Qwen2.5-VL-7B y el VAE de Qwen-Image. El repositorio ocupa 57,7 GB e incluye múltiples precisiones (BF16, FP8 E4M3FN, FP8 mixed, NVFP4).

El modelo subyacente es un generador texto-a-imagen de Qwen (Alibaba) orientado a fotorrealismo, detalle natural y composición tipográfica precisa en la imagen generada. La actualización 2512 añade soporte para siete relaciones de aspecto y está pensada para sustituir a versiones anteriores de Qwen-Image en pipelines de generación. La variante Distill-Full permite reducir el número de pasos de muestreo, y los workflows publicados incluyen opciones Turbo de 2 pasos con LoRA.

La relevancia de este repositorio es práctica: elimina la fricción de convertir los pesos oficiales al formato que espera ComfyUI y ofrece de una vez todas las precisiones necesarias para distintos presupuestos de VRAM, desde BF16 completo hasta NVFP4 para GPUs Blackwell. No aporta mejoras de calidad ni cambios en el modelo; es un artefacto de conveniencia para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión texto-a-imagen (familia Qwen-Image); detalles internos no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el text encoder es Qwen2.5-VL-7B) |
| Tipos de cuantizacion | BF16, FP8 E4M3FN, FP8 mixed, FP8 HQ, NVFP4 (tanto en difusión como en text encoder) |
| Idiomas soportados | no disponible (el modelo genera texto en imagen; el text encoder Qwen2.5-VL-7B es multilingüe, pero no se detalla cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors single-file para ComfyUI (diffusion_models, text_encoders, vae) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo de difusión (tipo de backbone, número de parámetros, mecanismo de atención). Lo que sí se documenta es la composición del paquete: un modelo de difusión principal en varias precisiones, un text encoder basado en Qwen2.5-VL-7B (también en BF16, FP8 scaled y NVFP4) y un VAE específico de Qwen-Image. La existencia de una variante Distill-Full indica que el modelo original fue destilado para reducir pasos de muestreo, y los workflows de ComfyUI incluyen un modo Turbo con LoRA de 2 pasos.

No se han publicado en la información proporcionada datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación texto-a-imagen con énfasis en fotorrealismo y detalle natural, según la documentación de ComfyUI para la versión 2512.
- Renderizado de texto dentro de la imagen con layout preciso (capacidad destacada por la documentación de ComfyUI).
- Generación en siete relaciones de aspecto distintas.
- Inpainting mediante ControlNet InstantX (workflow específico publicado).
- Control estructural mediante ControlNet Union de InstantX y parches de ControlNet genéricos.
- Generación acelerada en 2 pasos mediante LoRA Turbo sobre la variante 2512.
- Integración nativa con ComfyUI como single-file, sin conversión previa de pesos.
- No se documenta soporte de tool calling, agentes, audio ni otras modalidades.

## Casos de uso

- Generación de ilustraciones para blogs y documentación técnica: el modelo 2512 está ajustado para layout de texto preciso, lo que permite generar infografías o portadas con titulares legibles sin retoque posterior.
- Creación de assets para videojuegos y prototipado conceptual: los siete formatos de relación de aspecto permiten producir sprites, fondos y key art en las proporciones que exige cada pipeline sin recortes.
- Edición y retoque por inpainting: el workflow InstantX Inpainting ControlNet permite sustituir objetos o corregir zonas de una imagen existente manteniendo coherencia con el resto del encuadre.
- Control de composición en producción gráfica: con ControlNet Union se puede imponer una silueta, un mapa de profundidad o una pose concreta, útil para mantener consistencia de marca entre lotes de imágenes.
- Generación rápida en local para iteración de prompts: la variante Distill-Full y el modo Turbo de 2 pasos reducen el coste por imagen, lo que facilita barrer decenas de variantes antes de fijar una dirección creativa.
- Despliegue en estaciones de trabajo con VRAM limitada: las versiones FP8 y NVFP4 permiten ejecutar el modelo en GPUs de consumo y en GPUs Blackwell respectivamente, ampliando el parque de hardware compatible.
- Automatización de catálogos de producto: generación por lotes de imágenes de producto sobre fondos neutros usando el modelo como paso previo a la revisión humana, con el ahorro de coste que implica no depender de un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 57,7 GB, pero en inferencia solo se carga una variante de difusión, un text encoder y el VAE.
- VRAM estimada: no disponible de forma oficial en la información proporcionada. Como referencia de orden de magnitud, BF16 de un modelo de difusión de esta familia más el text encoder Qwen2.5-VL-7B suele requerir del orden de 20-40 GB; las variantes FP8 y NVFP4 reducen sustancialmente ese requisito, pero no se confirma cifra exacta.
- GPU recomendadas: no disponible. Las variantes NVFP4 están pensadas para GPUs Blackwell; las FP8 para GPUs con soporte de FP8 (Ada Lovelace y Hopper en adelante).
- Cabe en GPU de consumo en sus variantes cuantizadas (FP8, NVFP4), siempre que se disponga de suficiente VRAM; no se especifica el mínimo exacto.
- Opciones de despliegue: ComfyUI es el destino principal (formato diffusion-single-file). Los workflows publicados cubren texto-a-imagen, inpainting con ControlNet, ControlNet Union, parches de ControlNet y Turbo de 2 pasos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2512 (este paquete) | difusión texto-a-imagen | siete relaciones de aspecto; resolución concreta no disponible | Apache 2.0 | Hugging Face, single-file para ComfyUI |
| Qwen-Image (versión original) | difusión texto-a-imagen | no disponible | Apache 2.0 | Hugging Face (Qwen/Qwen-Image) |
| Qwen-Image-Distill-Full | difusión destilada | no disponible | no disponible en la información | Hugging Face (DiffSynth-Studio) |
| Otros modelos de difusión comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo original: es un reempaquetado de pesos de terceros. La calidad y el comportamiento dependen íntegramente de los modelos base de Qwen y DiffSynth-Studio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas del modelo subyacente en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar que los modelos base (Qwen-Image, Qwen-Image-2512, Distill-Full) mantengan la misma licencia y no impongan restricciones adicionales.
- El tamaño del repo (57,7 GB) implica un coste de almacenamiento y descarga considerable; en producción conviene descargar solo los archivos de la precisión elegida.
- No se especifican requisitos mínimos de VRAM ni versiones de ComfyUI compatibles; la integración depende de que la versión instalada soporte el formato single-file de Qwen-Image.
- El uso de variantes NVFP4 requiere hardware Blackwell; en GPUs anteriores habrá que recurrir a FP8 o BF16.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chenzs/Qwen-Image-2512-BF16-ComfyUI
- Modelo base Qwen-Image: https://huggingface.co/Qwen/Qwen-Image
- Modelo base Qwen-Image-2512: https://huggingface.co/Qwen/Qwen-Image-2512
- Modelo base destilado: https://huggingface.co/DiffSynth-Studio/Qwen-Image-Distill-Full
- Ejemplos de ComfyUI para Qwen-Image: https://comfyanonymous.github.io/ComfyUI_examples/qwen_image/
- Tutorial de ComfyUI para Qwen-Image-2512: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2512
- Guía de workflow y VRAM (thatpainter.com): https://thatpainter.com/qwen-image-2512-workflow-complete-guide-to-ai-image-generation-in-2026/
- Workflow Qwen Image 2512: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_Image_2512.json
- Workflow InstantX Inpainting ControlNet: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_instantx_inpainting_controlnet.json
- Workflow Turbo 2 pasos: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2512_with_2steps_lora.json
- Workflow ControlNet Model Patch: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_controlnet_patch.json
- Workflow InstantX Union ControlNet: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_instantx_controlnet.json
