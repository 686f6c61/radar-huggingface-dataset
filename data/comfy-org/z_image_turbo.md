# Comfy-Org/z_image_turbo

## Resumen

Z-Image Turbo es un modelo de difusión para generación de imágenes a partir de texto (text-to-image), desarrollado originalmente por Tongyi-MAI (Alibaba) y redistribuido por Comfy-Org en un formato de fichero único optimizado para ComfyUI. El repositorio de Comfy-Org no contiene un modelo nuevo, sino el reempaquetado de los pesos del modelo base `Tongyi-MAI/Z-Image-Turbo` junto con los componentes auxiliares necesarios (text encoder Qwen 3 de 4B, VAE y una LoRA de destilación), todo listo para colocarse en las carpetas de ComfyUI sin conversiones adicionales.

La relevancia de este repositorio es eminentemente práctica: con casi 10 millones de descargas y más de mil likes, se ha convertido en el punto de entrada habitual para usar Z-Image Turbo en ComfyUI. Incluye variantes de pesos en bf16, int8 con rotación de convoluciones y nvfp4, además de versiones mixtas fp4/fp8 del text encoder, lo que permite ajustar el consumo de VRAM según el hardware disponible.

La licencia Apache 2.0 y la disponibilidad de workflows oficiales (text-to-image, upscaling a 2K y ControlNet Union) lo sitúan como una opción atractiva para integración en producción. No obstante, la información pública proporcionada no detalla la arquitectura interna del modelo de difusión ni sus datos de entrenamiento, por lo que varios apartados técnicos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (detalles internos no disponibles); text encoder basado en Qwen 3 de 4B |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, int8 (convrot), nvfp4; text encoder en bf16, fp4 mixed y fp8 mixed |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusion-single-file para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio distribuye los pesos del modelo base `Tongyi-MAI/Z-Image-Turbo` reempaquetados como ficheros únicos para ComfyUI. La arquitectura concreta del difusor (tipo de backbone, número de parámetros, mecanismo de atención) no se detalla en la información disponible. Sí se especifica que el pipeline emplea un text encoder Qwen 3 de 4B parámetros, un VAE independiente (`ae.safetensors`) y una LoRA de destilación (`z_image_turbo_distill_patch_lora_bf16.safetensors`), lo que sugiere un proceso de destilación para reducir el número de pasos de muestreo, coherente con la denominación "Turbo".

No se han publicado en la información proporcionada datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la mencionada destilación y de las variantes cuantizadas (int8 con rotación de convoluciones y nvfp4) orientadas a reducir el uso de memoria en inferencia.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante workflows nativos de ComfyUI.
- Upscaling de imágenes hasta resolución 2K mediante workflow dedicado.
- Control espacial y estructural mediante ControlNet Union (workflow "Fun Union ControlNet").
- Ejecución con distintos niveles de precisión: bf16, int8 y nvfp4, para adaptarse a distintos presupuestos de VRAM.
- Uso de text encoder cuantizado en fp4/fp8 mixto para reducir el consumo de memoria del componente lingüístico.
- Integración directa con el ecosistema ComfyUI, incluyendo plantillas de workflow oficiales.
- No se documentan capacidades de edición de imagen por instrucciones, vídeo, audio ni tool calling, al tratarse de un modelo de difusión de imagen.

## Casos de uso

- Generación de ilustraciones para blogs y documentación técnica: el workflow text-to-image oficial permite producir imágenes de cabecera a partir de descripciones textuales, con la ventaja de que el modelo está empaquetado para funcionar en ComfyUI sin pasos de conversión.
- Prototipado rápido de conceptos visuales en estudios de diseño: la variante Turbo y la LoRA de destilación reducen el coste por iteración, lo que facilita explorar decenas de variaciones de una misma idea en una sola sesión.
- Reescalado de imágenes existentes a 2K: el workflow "Image Upscale: Z-Image-Turbo 2K" permite mejorar la resolución de material gráfico ya generado o de fotografías de baja calidad para su uso en impresión o web de alta densidad.
- Control de composición en pipelines de marketing: con el workflow ControlNet Union se puede condicionar la estructura de la imagen generada (postura, silueta, disposición) para mantener la coherencia de marca entre piezas de una campaña.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes int8 y nvfp4 reducen los requisitos de memoria, lo que permite ejecutar el modelo en equipos con VRAM limitada frente a la versión bf16 completa.
- Generación de recursos para videojuegos y entornos 3D: producción de texturas, concept art y variaciones de personajes dentro de un flujo ComfyUI, aprovechando las plantillas oficiales como base para pipelines automatizados.
- Automatización por lotes en servidores: al estar en formato single-file safetensors y con licencia Apache 2.0, puede integrarse en servicios internos de generación de imágenes sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ofrece variantes bf16, int8 y nvfp4 precisamente para ajustar el consumo, pero no se indican cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: la existencia de las variantes int8 y nvfp4, junto con text encoder en fp4/fp8 mixto, indica que el modelo está pensado para ejecutarse en GPU de consumo, aunque no se especifica qué modelos exactos.
- Opciones de despliegue: ComfyUI es el entorno de referencia (los pesos están empaquetados como `diffusion-single-file` para este fin). No se documentan otros backends como vLLM, llama.cpp u Ollama, que además no son aplicables a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoría que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card de este repositorio es un reempaquetado: no documenta la arquitectura interna, los datos de entrenamiento ni las evaluaciones del modelo original, por lo que la trazabilidad técnica es limitada.
- No se especifican los idiomas soportados por el text encoder en el contexto de generación de imágenes; el comportamiento multilingüe de las instrucciones no está documentado.
- Riesgo de sesgos y de alucinación visual: al no publicarse información sobre la composición del dataset de entrenamiento, no es posible evaluar sesgos demográficos, culturales o de estilo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original (`Tongyi-MAI/Z-Image-Turbo`) y de los componentes auxiliares (Qwen 3, VAE) antes de desplegarlo en producción.
- El modelo está orientado exclusivamente a generación y manipulación de imágenes; no debe emplearse para tareas de texto, razonamiento o agentes.
- El tamaño del repositorio (42,1 GB) implica requisitos de almacenamiento considerables; conviene descargar solo las variantes de pesos necesarias.
- No se documentan limitaciones específicas de resolución, pasos de muestreo o estabilidad en las variantes cuantizadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/z_image_turbo
- Modelo base original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Workflows oficiales de Z-Image: https://comfyanonymous.github.io/ComfyUI_examples/z_image/
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantillas de workflow: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo.json
