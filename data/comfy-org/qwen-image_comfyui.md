# Comfy-Org/Qwen-Image_ComfyUI

## Resumen

Qwen-Image_ComfyUI es un repositorio de redistribución de pesos del modelo de difusión Qwen-Image, empaquetados en formato de archivo único (diffusion-single-file) para su uso directo en ComfyUI. Lo publica la organización Comfy-Org, responsable del desarrollo del propio ComfyUI, y no constituye un modelo original: los pesos proceden de Qwen/Qwen-Image, Qwen/Qwen-Image-2512 y DiffSynth-Studio/Qwen-Image-Distill-Full, a los que este repositorio añade variantes cuantizadas y una estructura de carpetas compatible con el cargador de ComfyUI.

El modelo subyacente es un generador texto-a-imagen de la familia Qwen (Alibaba), distribuido bajo licencia Apache 2.0. El repositorio incluye los pesos del modelo de difusión en varias precisiones (bf16, fp8_e4m3fn, fp8_hq, fp8mixed, nvfp4), el text encoder Qwen 2.5 VL 7B en tres variantes y el VAE específico del modelo. El tamaño total del repositorio es de 301,6 GB, aunque el usuario descarga únicamente los archivos que necesita.

Su relevancia práctica es alta: con más de 2,6 millones de descargas, se ha convertido en la vía estándar para ejecutar Qwen-Image dentro de ComfyUI sin tener que convertir manualmente los pesos originales. La actualización de septiembre de 2026 incorpora los pesos de la revisión Qwen-Image-2512 y la variante destilada, lo que amplía las opciones de inferencia rápida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (texto-a-imagen); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp8_e4m3fn, fp8 hq, fp8 mixed, nvfp4 (pesos de difusion); text encoder en bf16, fp8_scaled y nvfp4 |
| Idiomas soportados | no disponible (el prompt se procesa mediante Qwen 2.5 VL 7B, multilingue, pero no se documenta cobertura oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo unico para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo de difusión; la model card se limita a indicar que son "repackaged model files for ComfyUI" y a especificar la ubicación de cada archivo dentro del árbol de directorios de ComfyUI. Los pesos derivan de tres fuentes: el modelo base Qwen/Qwen-Image, la revisión Qwen/Qwen-Image-2512 y la variante destilada DiffSynth-Studio/Qwen-Image-Distill-Full. Esta última sugiere un proceso de destilación orientado a reducir el número de pasos de muestreo, aunque no se detallan ni el número de pasos objetivo ni la metodología de destilación.

El pipeline completo combina tres componentes: el modelo de difusión (en `models/diffusion_models/`), el text encoder Qwen 2.5 VL 7B (en `models/text_encoders/`) y el VAE propio del modelo (en `models/vae/`). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación práctica del repositorio es el reempaquetado: ofrece los mismos pesos en múltiples precisiones (incluida nvfp4 para GPUs Blackwell) con nombres de archivo normalizados que el nodo cargador de ComfyUI reconoce directamente.

## Capacidades

- Generación de imágenes a partir de prompts de texto, con el modelo de difusión Qwen-Image como base.
- Variante destilada (`qwen_image_distill_full`) pensada para inferencia con menos pasos de muestreo.
- Revisión 2512 (`qwen_image_2512`) como versión actualizada del modelo base.
- Edición e inpainting mediante ControlNet: la model card enlaza workflows de InstantX Inpainting ControlNet y de Union ControlNet.
- Control estructural adicional mediante el workflow "ControlNet Model Patch".
- Aceleración con LoRA de 2 pasos: workflow "Qwen-Image 2512 Turbo" con LoRA de dos pasos.
- Comprensión multilingüe del prompt a través del text encoder Qwen 2.5 VL 7B, que es un modelo visión-lenguaje.
- Ejecución en ComfyUI con soporte para pesos bf16, fp8 y nvfp4 según la GPU disponible.

## Casos de uso

- Generación de ilustraciones para producción editorial: el flujo estándar de ComfyUI con `qwen_image_bf16.safetensors` permite integrar la generación en un grafo reproducible y versionable, con el VAE y el text encoder cargados una sola vez.
- Iteración rápida en fase de concepto: la variante destilada junto con el workflow Turbo de 2 pasos reduce el coste por imagen, lo que la hace adecuada para explorar decenas de variaciones de un prompt antes de fijar una dirección artística.
- Edición localizada de imágenes existentes: el workflow de InstantX Inpainting ControlNet permite sustituir o reparar regiones concretas de una imagen manteniendo el resto intacto, útil para retoque de material fotográfico.
- Control de pose y estructura: el workflow de Union ControlNet admite condicionamiento estructural, lo que sirve para generar variaciones de un personaje o producto con la misma composición.
- Despliegue en GPUs de consumo: las variantes fp8 y nvfp4 reducen el peso de los archivos y permiten ejecutar el modelo en tarjetas con menos VRAM que la versión bf16, facilitando estaciones de trabajo locales.
- Prototipado de pipelines creativos en equipo: al ser un repositorio de archivos únicos con nombres normalizados, se puede distribuir internamente y cargar en ComfyUI sin conversiones adicionales.
- Automatización por lotes de material gráfico: la combinación de ComfyUI con la API del servidor permite lanzar generaciones masivas con prompts parametrizados para catálogos o banners.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos de difusión en bf16 y el text encoder Qwen 2.5 VL 7B en bf16 requieren bastante memoria; las variantes fp8 y nvfp4 reducen el peso de los archivos y, por tanto, la VRAM necesaria, pero no se publican cifras concretas.
- GPU recomendadas: no disponible. La existencia de pesos nvfp4 sugiere soporte para GPUs con esa precisión (generación Blackwell); los pesos fp8 apuntan a GPUs con soporte FP8.
- GPU de consumo: no se confirma qué modelos concretos son suficientes. La disponibilidad de cuantizaciones fp8 y nvfp4 está pensada para ampliar el rango de GPUs compatibles, pero sin cifras publicadas no se puede afirmar que quepa en una tarjeta específica.
- Opciones de despliegue: ComfyUI (nativo, es el destino de este repositorio). No se documentan otros runners (vLLM, llama.cpp, TGI) para este modelo de difusión.
- Latencia y throughput: no disponibles. El workflow Turbo de 2 pasos implica una reducción del número de pasos de muestreo respecto al flujo estándar, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen-Image_ComfyUI (este repo) | difusion texto-a-imagen, repack | no disponible | no disponible | Apache 2.0 | safetensors (single-file) | Incluye bf16, fp8, nvfp4 y variante destilada; integrado en ComfyUI |
| Qwen/Qwen-Image | difusion texto-a-imagen, original | no disponible | no disponible | Apache 2.0 | safetensors | Repositorio fuente; requiere conversion para ComfyUI |
| Qwen/Qwen-Image-2512 | difusion texto-a-imagen, revision | no disponible | no disponible | Apache 2.0 | safetensors | Revision actualizada incluida en este repo |
| DiffSynth-Studio/Qwen-Image-Distill-Full | difusion destilada | no disponible | no disponible | no disponible en la informacion | safetensors | Variante destilada incluida en este repo |

No se dispone de datos de benchmarks ni de especificaciones de parámetros que permitan una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- No es un modelo original: es un reempaquetado. Cualquier limitación del modelo Qwen-Image subyacente se hereda sin cambios.
- La model card no documenta sesgos, tasas de alucinación visual ni limitaciones idiomáticas; no hay información oficial al respecto.
- El repositorio pesa 301,6 GB en total; es necesario descargar selectivamente los archivos, no clonar el repositorio completo.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los repositorios fuente (Qwen, DiffSynth-Studio) por si añaden restricciones adicionales.
- No se documentan requisitos mínimos de hardware ni cifras de VRAM; el despliegue en producción requiere validación propia.
- El pipeline en Hugging Face figura como "no disponible"; el uso previsto es mediante ComfyUI, no mediante la librería `transformers`.
- Los idiomas soportados no están declarados oficialmente; el comportamiento multilingüe depende del text encoder y no está garantizado.
- La información de la model card está parcialmente truncada en la fuente consultada, por lo que podrían existir workflows o notas adicionales no recogidos aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- Modelo base Qwen-Image: https://huggingface.co/Qwen/Qwen-Image
- Revisión Qwen-Image-2512: https://huggingface.co/Qwen/Qwen-Image-2512
- Variante destilada: https://huggingface.co/DiffSynth-Studio/Qwen-Image-Distill-Full
- Ejemplos de ComfyUI para Qwen-Image: https://comfyanonymous.github.io/ComfyUI_examples/qwen_image/
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantillas de workflows: https://github.com/Comfy-Org/workflow_templates
- Workflow Qwen Image 2512: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_Image_2512.json
- Workflow InstantX Inpainting ControlNet: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_instantx_inpainting_controlnet.json
- Workflow Turbo de 2 pasos: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2512_with_2steps_lora.json
- Workflow ControlNet Model Patch: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_controlnet_patch.json
- Workflow InstantX Union ControlNet: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_instantx_controlnet.json
- Comfy Cloud: https://cloud.comfy.org/
