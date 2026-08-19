# Comfy-Org/PixelDiT

## Resumen

PixelDiT es un paquete de modelos de superresolución de imágenes desarrollado por NVIDIA y redistribuido por Comfy-Org para su uso directo en ComfyUI. El repositorio incluye dos familias de modelos: PixelDiT, un modelo base de difusión de 1300 millones de parámetros que genera imágenes a 1024 píxeles, y PiD (Pixel Incremental Diffusion), un conjunto de adaptadores que permiten aumentar la resolución de imágenes generadas por otros modelos base como Flux.1, Flux.2, QwenImage, SD3 y SDXL, escalando desde 512 o 1024 píxeles hasta 2048 o 4096 píxeles respectivamente.

La relevancia de este paquete radica en que ofrece múltiples variantes cuantizadas (bf16, mxfp8, int8) y versiones optimizadas para inferencia en 4 pasos, lo que facilita su despliegue en entornos con recursos limitados. El repositorio contiene 71,5 GB de pesos en formato safetensors, organizados para su colocación directa en las carpetas de modelos de ComfyUI. La información técnica detallada sobre arquitectura y entrenamiento no está disponible en la documentación proporcionada, aunque los nombres de los archivos sugieren que PixelDiT es un modelo basado en la arquitectura Diffusion Transformer (DiT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (DiT, inferido del nombre, no confirmado oficialmente) |
| Parametros totales | no disponible (el archivo `pixeldit_1300m_1024px_bf16.safetensors` sugiere 1300M, pero no está verificado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | bf16, mxfp8, int8 (según nombres de archivo) |
| Idiomas soportados | no aplica (generación de imágenes) |
| Licencia | nsclv1 (NVIDIA Source Code License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre la arquitectura interna ni el proceso de entrenamiento. El nombre PixelDiT sugiere un modelo de difusión basado en transformer (DiT), y el tamaño del archivo `pixeldit_1300m_1024px_bf16.safetensors` indica aproximadamente 1300 millones de parámetros, pero esto no está confirmado en la documentación oficial. Los adaptadores PiD están diseñados para funcionar sobre distintos modelos base (Flux.1, Flux.2, QwenImage, SD3, SDXL), lo que implica que el entrenamiento se realizó de forma específica para cada combinación. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Superresolución de imágenes: escala desde 512 o 1024 píxeles hasta 2048 o 4096 píxeles, dependiendo de la variante.
- Inferencia en 4 pasos: versiones optimizadas que reducen el número de iteraciones de difusión necesarias.
- Compatibilidad con múltiples modelos base: Flux.1, Flux.2, QwenImage, SD3 y SDXL.
- Cuantización flexible: versiones en bf16, mxfp8 e int8 para ajustar el uso de memoria y velocidad.
- Integración nativa con ComfyUI: archivos listos para colocar en las carpetas `diffusion_models` y `text_encoders`.
- Incluye un text encoder adicional: Gemma 2 2B (en versiones bf16 y fp8) para el procesamiento de prompts.

## Casos de uso

- Ampliación de imágenes para impresión de gran formato: el modelo puede escalar imágenes de 1024 píxeles a 4096, manteniendo detalles suficientes para carteles o lienzos de alta resolución.
- Restauración de fotografías antiguas: al escalar imágenes de baja resolución, se pueden recuperar detalles visuales antes de aplicar otros procesos de retoque.
- Generación de fondos de pantalla y arte digital: los creadores pueden generar imágenes base con SDXL o Flux y luego aplicar PiD para obtener versiones en 4K sin perder calidad.
- Preprocesado para otros modelos de visión: las imágenes ampliadas pueden alimentar modelos de segmentación o detección que requieren mayor resolución de entrada.
- Flujos de trabajo automatizados en ComfyUI: los nodos de ComfyUI pueden encadenar la generación base con el upscaler PiD sin necesidad de scripts externos.
- Pruebas de escalado en entornos con memoria limitada: las versiones int8 y mxfp8 permiten probar superresolución en GPUs con menos VRAM, aunque con posible pérdida de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio (71,5 GB) indica que se requieren varios GB de almacenamiento para los pesos completos.
- Las versiones bf16 de los modelos PiD (por ejemplo, `pid_flux1_1024_to_4096_4step_bf16.safetensors`) probablemente necesiten al menos 12-16 GB de VRAM para inferencia en resoluciones altas, aunque no hay datos oficiales.
- Las versiones int8 y mxfp8 reducen los requisitos de memoria, siendo más adecuadas para GPUs de consumo como la RTX 3060 (12 GB) o RTX 4070 (12 GB).
- Para las variantes de 4096 píxeles, se recomienda una GPU con 24 GB o más (por ejemplo, RTX 4090, A100) para evitar desbordamiento de memoria.
- El despliegue se realiza a través de ComfyUI, que gestiona la carga de modelos y la ejecución en GPU.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de superresolución (por ejemplo, Real-ESRGAN o SwinIR). Los datos de rendimiento y arquitectura no están publicados en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia nsclv1: es una licencia de NVIDIA con restricciones específicas; se debe revisar su texto completo antes de un uso comercial.
- No hay información sobre sesgos o alucinaciones visuales del modelo; al ser un modelo de superresolución, puede inventar detalles en zonas de baja calidad.
- La falta de documentación técnica detallada dificulta la evaluación de su comportamiento en casos límite.
- El tamaño del repositorio es grande (71,5 GB), lo que implica costes de almacenamiento y descarga.
- Las versiones cuantizadas (int8, mxfp8) pueden degradar la calidad de salida en comparación con bf16, especialmente en texturas finas.
- No se especifican requisitos mínimos de hardware ni de software más allá de ComfyUI.

## Enlaces

- Repositorio de HuggingFace de Comfy-Org: https://huggingface.co/Comfy-Org/PixelDiT
- Modelo original de NVIDIA (PixelDiT-1300M-1024px): https://huggingface.co/nvidia/PixelDiT-1300M-1024px
- Modelo original de NVIDIA (PiD): https://huggingface.co/nvidia/PiD
- ComfyUI (framework de despliegue): https://github.com/comfyanonymous/ComfyUI
