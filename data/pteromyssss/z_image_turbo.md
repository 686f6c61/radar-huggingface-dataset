# pteromyssss/z_image_turbo

## Resumen

Z-Image Turbo es un modelo de generación de imágenes texto-a-imagen de 6 mil millones de parámetros desarrollado por Tongyi-MAI, la rama de investigación de IA de Alibaba Cloud. Utiliza una arquitectura Single-Stream Diffusion Transformer (S3-DiT) y requiere únicamente 8 pasos de inferencia para producir imágenes fotorrealistas en menos de un segundo. El modelo destaca por su renderizado preciso de texto bilingüe (chino e inglés) y por incorporar capacidades de razonamiento en el prompt, lo que le permite interpretar descripciones complejas y generar imágenes coherentes con el conocimiento del mundo.

Este repositorio concreto, `pteromyssss/z_image_turbo`, no contiene el modelo original sino un reempaquetado de los archivos del modelo para su uso directo en ComfyUI. Incluye los pesos del modelo de difusión en tres formatos de cuantización (bf16, int8 y nv4), el text encoder Qwen 3 4B y el VAE correspondiente. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas, lo que facilita su integración en productos y flujos de trabajo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Single-Stream Diffusion Transformer (S3-DiT) |
| Parametros totales | 6 mil millones (6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no autoregresivo) |
| Tipos de cuantizacion | bf16, int8, nv4 (según archivos incluidos) |
| Idiomas soportados | chino e ingles (text encoder Qwen 3 4B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

Z-Image Turbo emplea una arquitectura Single-Stream Diffusion Transformer (S3-DiT), que combina el procesamiento de tokens de imagen y texto en un único flujo de atención, reduciendo la latencia en comparación con arquitecturas dual-stream. El modelo requiere solo 8 pasos de inferencia para generar una imagen completa, lo que permite tiempos de generación inferiores a un segundo en hardware adecuado.

El text encoder es un Qwen 3 de 4 mil millones de parámetros, que proporciona capacidades de comprensión bilingüe (chino e inglés) y un prompt enhancer con razonamiento. Según la documentación oficial, este enhancer permite al modelo ir más allá de las descripciones superficiales del prompt y acceder a conocimiento del mundo para generar imágenes más coherentes y contextualizadas. Los datos de entrenamiento y el proceso de optimización (RLHF, DPO, etc.) no se detallan en la información disponible.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts en lenguaje natural.
- Renderizado preciso de texto dentro de la imagen en chino e inglés, con alta legibilidad y sin errores tipográficos.
- Prompt enhancing con razonamiento: el modelo interpreta la intención del prompt y aplica conocimiento del mundo para mejorar la coherencia de la imagen generada.
- Inferencia de sub-segundo con solo 8 pasos de difusión.
- Compatible con ComfyUI mediante los archivos reempaquetados, incluyendo LoRA de destilación para mejorar la calidad en pasos reducidos.
- Soporte de cuantizaciones variadas (bf16, int8, nvfp4) para adaptarse a distintos niveles de hardware.

## Casos de uso

- **Generación de imágenes en tiempo real para prototipado**: el modelo produce imágenes en menos de un segundo, lo que lo hace ideal para iteraciones rápidas en diseño de producto, moodboards o exploración de conceptos visuales sin esperar largos tiempos de generación.
- **Creación de contenido visual con texto integrado**: su capacidad de renderizar texto chino e inglés con precisión permite generar carteles, banners, memes o ilustraciones con leyendas directamente desde el prompt, útil para equipos de marketing y comunicación.
- **Integración en flujos de trabajo de ComfyUI**: los archivos reempaquetados permiten incorporar el modelo en pipelines de ComfyUI sin configuración adicional, facilitando su uso en entornos de producción creativa junto a otros nodos de postprocesado.
- **Generación de imágenes para documentación técnica**: dado su buen seguimiento de instrucciones, puede producir diagramas o ilustraciones conceptuales para documentación técnica, presentaciones o material educativo, reduciendo el tiempo de diseño.
- **Automatización de contenido en plataformas web**: al ser un modelo con licencia Apache-2.0 y latencia baja, puede integrarse en APIs o servicios web para generar imágenes on-demand, por ejemplo en herramientas de diseño asistido por IA o generadores de imágenes para blogs y redes sociales.
- **Entrenamiento y afinamiento posterior**: al estar disponible en safetensors con licencia permisiva, puede utilizarse como base para afinamientos específicos (por ejemplo, estilos artísticos o dominios concretos) mediante técnicas de LoRA o entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial indica que el modelo genera imágenes en menos de 1 segundo con 8 pasos de inferencia, pero no se proporcionan métricas comparativas (FID, CLIP score, etc.) frente a otros modelos de generación de imágenes.

## Requisitos de hardware

- El repositorio tiene un tamaño de 42.1 GB, que corresponde al peso de los archivos en bf16 y las variantes cuantizadas.
- Para inferencia en bf16, se estima una VRAM mínima de 16-24 GB, dependiendo de la resolución de salida y el batch. GPU recomendadas: RTX 4090 (24 GB), A100 (40 GB o 80 GB), H100.
- Las versiones cuantizadas (int8 y nvfp4) reducen los requisitos de VRAM a aproximadamente 8-12 GB, lo que permite su ejecución en GPUs de consumo como RTX 3080 o RTX 4070.
- El text encoder Qwen 3 4B y el VAE también requieren VRAM adicional, aunque son significativamente menores que el modelo de difusión.
- Opciones de despliegue: ComfyUI (recomendado por el reempaquetado), y potencialmente otros frameworks de difusión compatibles con safetensors single-file.
- La latencia estimada es inferior a 1 segundo por imagen en GPU de gama alta (A100/H100), y de 2-4 segundos en GPUs de consumo con cuantización.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de generación de imágenes en la información proporcionada. Se recomienda consultar benchmarks públicos de modelos como FLUX, SDXL o SD3 para comparar el rendimiento de Z-Image Turbo en términos de calidad y velocidad, aunque no hay datos directos disponibles.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado no oficial del modelo original de Tongyi-MAI. La documentación y los archivos pueden diferir del repositorio oficial en detalles de configuración.
- No se han publicado resultados de benchmarks ni evaluaciones de seguridad, sesgos o alucinaciones visuales del modelo.
- El modelo se ha entrenado principalmente para texto en chino e inglés; el rendimiento con otros idiomas, incluido el español, puede ser inferior.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que los archivos del text encoder Qwen 3 4B y el VAE también cumplen con la misma licencia.
- El modelo puede generar imágenes con contenido no deseado o incorrecto si el prompt es ambiguo, especialmente en escenarios de razonamiento complejo.
- No se proporcionan garantías sobre la calidad de la generación en resoluciones altas o con prompts muy detallados.
- Para producción, se recomienda validar la calidad de la salida en el dominio de uso y considerar la supervisión humana para casos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pteromyssss/z_image_turbo
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Workflows de ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/z_image/
- Sitio web del modelo: https://zimageturbo.io/en
