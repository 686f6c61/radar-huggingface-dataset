# OpenMOSS-Team/MOSS-VL-Instruct-0708-NF4

## Resumen

MOSS-VL-Instruct-0708-NF4 es una versión cuantizada en 4 bits (NF4) del modelo multimodal MOSS-VL-Instruct-0708, desarrollado por el equipo OpenMOSS. Este checkpoint está diseñado para inferencia offline de imagen y vídeo a través de la ruta estándar de Transformers, sin depender de motores de inferencia especializados como SGLang. El modelo base, MOSS-VL-Instruct-0708, forma parte de la serie MOSS-VL, una familia de modelos de peso abierto de 11 000 millones de parámetros orientada a la comprensión de vídeo de larga duración y tiempo real, construida sobre una arquitectura unificada de cross-attention.

La versión NF4 reduce significativamente el uso de memoria y los requisitos de hardware en comparación con el modelo BF16 original, manteniendo un rendimiento competitivo en tareas de comprensión visual y de vídeo. Según la model card, el pico de VRAM en inferencia de imagen alcanza los 12 494 MiB, y en vídeo (1 FPS, máximo 32 fotogramas) los 16 708 MiB, lo que permite ejecutarlo en una GPU de consumo con 24 GB de memoria. El modelo está licenciado bajo Apache 2.0 y soporta inglés y chino.

Esta cuantización es especialmente relevante para desarrolladores e investigadores que necesitan desplegar un modelo multimodal de 11B en entornos con recursos limitados, sin sacrificar en exceso la precisión en tareas como respuesta a preguntas sobre documentos (DocVQA), comprensión de vídeo (VideoMME, MLVU) o razonamiento temporal (TimeLens, VSIBench).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal con vision encoder, merger, cross-attention y capas de lenguaje (transformer) |
| Parametros totales | 11 336 371 208 (11,34B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes, weight-only con doble cuantizacion y computo BF16); capas seleccionadas en BF16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con configuracion bitsandbytes integrada) |

## Arquitectura y entrenamiento

MOSS-VL-Instruct-0708-NF4 hereda la arquitectura del modelo base MOSS-VL-Instruct-0708, que emplea un diseño unificado de cross-attention para integrar información visual y de vídeo con el modelo de lenguaje. El sistema se compone de un vision encoder, un módulo de fusión (merger), proyecciones de cross-attention y capas de lenguaje transformer. El modelo base fue entrenado mediante supervisión fina (SFT) a partir de MOSS-VL-Base-0708, según se indica en la ficha de ModelScope. No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

La versión NF4 cuantiza 240 capas lineales de las capas de lenguaje 4 a 43 utilizando bitsandbytes con cuantización solo de pesos (weight-only) en formato NF4, doble cuantización y cómputo en BF16. Las primeras cuatro y últimas cuatro capas de lenguaje, las proyecciones de cross-attention, el vision encoder, el merger, los embeddings, las normas y la cabeza de salida (lm_head) se mantienen en BF16. La caché KV se almacena en BF16 y la atención utiliza FlashAttention 2. El checkpoint incluye su propia configuración de bitsandbytes, por lo que no debe aplicarse una segunda configuración de cuantización en tiempo de ejecución.

## Capacidades

- Comprensión multimodal de imágenes: descripción, respuesta a preguntas visuales y extracción de información de documentos.
- Comprensión de vídeo: análisis de secuencias de vídeo de hasta 32 fotogramas a 1 FPS, con generación de descripciones y respuestas sobre el contenido.
- Soporte de entrada de vídeo e imagen mediante la API offline de Transformers (funciones `offline_image_generate` y `offline_video_generate`).
- Capacidades multilingües: inglés y chino.
- Razonamiento multimodal básico: tareas de percepción, comprensión de vídeo, grounding, documento/OCR y razonamiento, según las evaluaciones publicadas.
- No se menciona soporte explícito de tool calling, function calling ni modo agente en la información disponible.

## Casos de uso

- Análisis de documentos e imágenes: el modelo puede responder preguntas sobre contenido visual en documentos (DocVQA), útil para automatizar la extracción de información en facturas, formularios o informes.
- Descripción de vídeos para archivado y búsqueda: dado un vídeo de hasta 32 fotogramas, genera un resumen textual que puede indexarse para recuperación posterior.
- Moderación de contenido visual: clasificación y descripción de imágenes o vídeos para detectar contenido inapropiado en plataformas de publicación.
- Asistencia a personas con discapacidad visual: conversión de imágenes y vídeos en descripciones de audio o texto en tiempo real.
- Generación de subtítulos y metadatos para bibliotecas de medios: procesamiento automático de vídeos para crear títulos, etiquetas y descripciones en inglés o chino.
- Prototipado de aplicaciones de visión por computador: gracias a su tamaño reducido (NF4) y su licencia Apache 2.0, es adecuado para experimentación rápida en entornos con una GPU de 24 GB.

## Benchmarks y rendimiento

Según la model card, el checkpoint NF4 obtiene los siguientes resultados en los conjuntos de evaluación indicados:

| Benchmark | Resultado |
|---|---|
| DocVQA | 89,53 |
| VideoMME | 67,30 |
| MLVU_dev | 75,86 |
| TimeLens (tres subconjuntos) | 51,00 / 48,17 / 59,33 |
| VSIBench | 61,76 |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: pico de 12 494 MiB para inferencia de imagen y 16 708 MiB para vídeo (1 FPS, máximo 32 fotogramas).
- GPU recomendada: una NVIDIA con 24 GB de VRAM es suficiente para el perfil validado (por ejemplo, RTX 4090, RTX 3090, A5000).
- No cabe en GPUs de 8-12 GB de VRAM de forma fiable; se requiere al menos 16 GB para vídeo y 12 GB para imagen.
- Opciones de despliegue: Transformers con FlashAttention 2 y bitsandbytes (carga directa del checkpoint). No es una versión SGLang.
- Dependencias validadas: Python 3.12.8, PyTorch 2.8.0 + CUDA 12.8, Transformers 4.57.1, Accelerate 1.12.0, FlashAttention 2.8.1, bitsandbytes 0.49.2. Se requiere FFmpeg en el PATH para decodificación de vídeo.
- Latencia y throughput: no se proporcionan datos específicos en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos multimodales de tamaño similar en la información proporcionada. La model card del modelo base menciona evaluaciones frente a MOSS-VL-0408 y otros baselines open-source, pero no se incluyen los resultados detallados en esta ficha.

## Limitaciones y advertencias

- El modelo está optimizado para comprensión multimodal offline general; vídeos muy densos, dominios altamente especializados, OCR de texto pequeño y tareas que requieren razonamiento numérico estricto pueden necesitar prompting específico, ajuste de muestreo o fine-tuning adicional.
- Al ser una versión cuantizada NF4, puede existir una ligera pérdida de precisión respecto al modelo BF16 original, aunque los benchmarks publicados muestran resultados competitivos.
- La longitud de contexto no está documentada en la información disponible, por lo que se recomienda validar el comportamiento con secuencias largas antes de usarlo en producción.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos y las dependencias de terceros (bitsandbytes, FlashAttention) para cumplir con sus respectivas licencias.
- El checkpoint incluye configuración de cuantización integrada; aplicar una segunda configuración de cuantización en tiempo de ejecución puede provocar errores o degradación del rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708-NF4
- Modelo base en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708
- Repositorio GitHub de MOSS-VL: https://github.com/OpenMOSS/MOSS-VL
- Página oficial de MOSS-VL: https://openmoss.ai/MOSS-VL/moss-vl.html
- Ficha en ModelScope: https://www.modelscope.cn/models/openmoss/MOSS-VL-Instruct-0708
