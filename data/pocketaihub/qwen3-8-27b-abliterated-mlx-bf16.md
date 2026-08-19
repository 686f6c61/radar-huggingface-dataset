# PocketAiHub/Qwen3.8-27B-Abliterated-MLX-BF16

## Resumen

Qwen3.8-27B Abliterated MLX BF16 es un derivado no oficial del modelo multimodal Qwen/Qwen3.8-27B, publicado por PocketAI Model Lab bajo el perfil PocketAiHub. El modelo original es desarrollado por Qwen y combina un transformador híbrido de 64 capas con atención lineal y componentes de visión, soportando entrada de imagen, vídeo y texto. Esta variante ha sido convertida al formato MLX en precisión BF16 para su ejecución eficiente en hardware Apple Silicon, y además se le ha aplicado una técnica de «abliteration» que suprime el comportamiento de rechazo aprendido durante el entrenamiento instructivo.

La relevancia de este modelo radica en dos aspectos: por un lado, ofrece una versión cuantizada en BF16 y optimizada para MLX de un modelo multimodal de 27 000 millones de parámetros, lo que permite su uso en entornos con memoria unificada como los chips M de Apple. Por otro lado, la modificación de abliteration lo convierte en una herramienta de investigación para estudiar los mecanismos de rechazo y alineación en modelos de lenguaje, aunque con importantes advertencias de seguridad. El repositorio incluye un manifiesto detallado del proceso de edición y resultados de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 64 capas con atención lineal (gated-delta) y atención completa, más torre de visión |
| Parametros totales | 27 356 728 560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (validado a 4K tokens; contexto nativo no especificado) |
| Tipos de cuantizacion | BF16 (sin cuantizar, MLX) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura híbrida de 64 capas que combina mecanismos de atención lineal (gated-delta) con atención completa, además de una torre de visión para procesamiento multimodal. El proceso de abliteration aplicado por PocketAI Model Lab consiste en medir una dirección proyectada «harmful-minus-harmless» a partir de 256 pares de prompts de igual longitud en el límite de generación del asistente. Esa dirección se extrae de la capa 53 y se aplica con escala 1.0 a las capas 24 a 63, modificando un total de 80 matrices de salida residual: 30 correspondientes a `out_proj` de atención lineal, 10 a `o_proj` de atención completa y 40 a `down_proj` de MLP. La edición se realizó sobre un checkpoint maestro en BF16, no sobre el modelo original. No se dispone de información sobre los datos de entrenamiento del modelo base, número de tokens, o procesos de RLHF/DPO.

## Capacidades

- Generación de texto y respuestas conversacionales con soporte de modo de razonamiento (thinking mode), aunque en las validaciones se probó con thinking desactivado.
- Comprensión multimodal: entrada de imágenes, vídeo y texto, con salida textual.
- Comprensión temporal de vídeo: validado con una secuencia que cambia de color (rojo a azul).
- Recuperación de contexto largo: probado con 4K tokens de contexto en una tarea de recuperación de información específica.
- Tool calling nativo: verificado con 8/8 comprobaciones exitosas.
- Generación de texto sin rechazos explícitos en pantallas de contenido dañino y benigno (tras la abliteration).
- Integración con MLX-VLM para inferencia en Apple Silicon.

## Casos de uso

- Investigación en seguridad y alineación de IA: el modelo permite estudiar el efecto de la abliteration sobre el comportamiento de rechazo, comparando respuestas con el modelo base y analizando los mecanismos internos de dirección de características.
- Desarrollo de aplicaciones multimodales en Apple Silicon: gracias a su formato MLX BF16, puede integrarse en proyectos que requieran procesamiento de imágenes y vídeo con generación de texto, utilizando la librería `mlx-vlm` en entornos con memoria unificada.
- Evaluación de robustez de modelos: al haber sido modificado deliberadamente, sirve como caso de prueba para sistemas de moderación de contenido, detectores de toxicidad o filtros de seguridad.
- Prototipado rápido de asistentes conversacionales sin restricciones de rechazo: útil en entornos controlados donde se necesita explorar respuestas a preguntas delicadas, siempre con supervisión humana.
- Análisis de vídeo en tiempo real: la capacidad de comprensión temporal permite aplicaciones como resumen de secuencias de vídeo o seguimiento de cambios de estado en imágenes consecutivas.
- Benchmarking de rendimiento de MLX: los datos de validación publicados (velocidad de prompt y generación) sirven como referencia para comparar el rendimiento de otros modelos en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una tabla de validación interna:

| Gate | Resultado |
| --- | ---: |
| Pantalla de contenido dañino candidato, lote 1, techo de 128 tokens | 0/12 rechazos explícitos |
| Control benigno candidato, lote 1, techo de 128 tokens | 0/12 rechazos explícitos |
| Comprobaciones de calidad deterministas | 12/12 |
| Comprobaciones nativas de tool-call | 8/8 |
| Smoke test de texto | pasado (`POCKETAI_OK`) |
| Smoke test de visión | pasado (`red`) |
| Comprensión temporal de vídeo | pasado (`red->blue`) |
| Recuperación de contexto 4K | pasado (`COBALT-7319`) |

Además, se reporta una ejecución local en Apple M5 Max con 128 GB de memoria unificada: 513,9 tokens/s de prompt, 9,0 tokens/s de generación, 9,02 segundos de extremo a extremo y 58,29 GB de memoria MLX pico. Este dato corresponde a una sola ejecución y no constituye una garantía de rendimiento.

## Requisitos de hardware

- El modelo en BF16 ocupa aproximadamente 54,7 GB de almacenamiento (50,98 GiB).
- Para inferencia en MLX se requiere un dispositivo Apple Silicon con al menos 64 GB de memoria unificada (recomendable 128 GB según la validación).
- En la prueba realizada con Apple M5 Max de 128 GB, el pico de memoria MLX fue de 58,29 GB.
- No se proporcionan requisitos para GPUs NVIDIA u otros proveedores; el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: `mlx-vlm` (Python) para inferencia local; no se mencionan servidores de inferencia como vLLM u Ollama.
- Rendimiento observado: ~514 tokens/s de prompt y ~9 tokens/s de generación en la configuración descrita.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada. La comparación más directa sería con el modelo base Qwen/Qwen3.8-27B, del cual se diferencia únicamente por la conversión a MLX BF16 y la modificación de abliteration. Otros modelos abliterated de la familia Qwen pueden existir, pero no se mencionan en el repositorio.

## Limitaciones y advertencias

- El modelo ha sido modificado para suprimir el comportamiento de rechazo aprendido; puede generar contenido dañino, ilegal, ofensivo, engañoso o peligrosamente incorrecto con mayor facilidad que el modelo instructivo original.
- La abliteration no es un entrenamiento de veracidad, una mejora de capacidades ni una garantía de seguridad.
- No se han publicado resultados de benchmarks estándar; el rendimiento en tareas generales no está verificado.
- El contexto máximo nativo no está especificado; solo se ha validado a 4K tokens.
- Los idiomas soportados no están documentados en esta variante.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo deliberadamente desalineado conlleva riesgos legales y éticos.
- El modelo se distribuye sin garantías; el usuario es responsable de evaluar y restringir sus salidas en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX-BF16
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Manifiesto de abliteration: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX-BF16/blob/main/abliteration-manifest.json
- Resumen de validación: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX-BF16/blob/main/validation-summary.json
