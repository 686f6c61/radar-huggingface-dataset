# Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-3bit

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-3bit es una adaptación cuantizada del modelo Muse Glimmer 30B, desarrollado originalmente por Meta Superintelligence Labs y posteriormente modificado por Blackfrost Research mediante un proceso de "abliteración" que elimina el comportamiento de rechazo (refusal) del modelo. Esta versión concreta, publicada por el usuario Ishowbackup, está empaquetada en formato MLX con cuantización de 3 bits, pensada específicamente para ejecutarse en equipos Apple Silicon con un footprint reducido de aproximadamente 15 GB.

El modelo base es un sistema multimodal (image-text-to-text) con arquitectura densa de 52 capas, atención con ventana deslizante y torre de visión, que soporta un contexto de 131 072 tokens. La versión abliterada elimina las respuestas de rechazo, lo que permite una generación sin restricciones de seguridad, un aspecto que debe tenerse muy en cuenta antes de su uso en producción. La cuantización MLX 3-bit mantiene las capacidades del modelo original, incluido el razonamiento separado y el modo agéntico, a costa de una pérdida de precisión esperable en ese nivel de compresión.

La relevancia de este modelo radica en su capacidad para ejecutar un sistema de 30B (aunque los pesos reales en safetensors indican ~5,3B, ver discrepancia en especificaciones) en hardware de consumo de Apple, con soporte de visión y razonamiento, y con una licencia Apache-2.0 que permite uso comercial. Sin embargo, la eliminación de los rechazos plantea riesgos éticos y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `muse_glimmer` — densa, 52 capas, hidden 6656, GQA (32 q / 2 kv), sliding-window attention, torre de visión |
| Parametros totales | 5 344 355 328 (~5,3B) según safetensors; el modelo se anuncia como 30B (discrepancia no resuelta) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 |
| Tipos de cuantizacion | MLX 3-bit (también existe versión BF16 del base) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B presenta una arquitectura transformer densa con 52 capas, dimensión oculta de 6656, atención con consultas agrupadas (GQA) con 32 cabezas de consulta y 2 de clave/valor, y atención de ventana deslizante. Incluye además una torre de visión que le permite procesar imágenes junto con texto. El contexto máximo es de 131 072 tokens, lo que lo habilita para tareas de razonamiento de largo alcance y procesamiento de documentos extensos.

El proceso de abliteración aplicado por Blackfrost Research modifica los pesos del modelo para eliminar el comportamiento de rechazo, manteniendo intactas las capacidades multimodales. No se dispone de información detallada sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO). La cuantización a 3 bits en formato MLX se realizó posteriormente para reducir el tamaño a ~15 GB, optimizado para Apple Silicon. El modelo conserva un modo de razonamiento que devuelve el "pensamiento" por separado de la respuesta final, controlable mediante una línea de sistema con `Reasoning strength: low/medium/high/xhigh`.

## Capacidades

- Generación de texto y razonamiento multi-step, con salida de razonamiento separada de la respuesta final.
- Procesamiento de imágenes (image-text-to-text), capaz de entender y responder sobre contenido visual.
- Modo agéntico: diseñado para tareas de agente en dispositivo, con soporte de tool calling implícito (no confirmado explícitamente en la documentación).
- Contexto largo de 131 072 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- Multilingüe (idiomas no especificados, pero al ser un modelo de Meta se espera cobertura amplia).
- Sin comportamiento de rechazo: genera respuestas a cualquier solicitud, incluido contenido dañino (efecto de la abliteración).

## Casos de uso

- Asistente local en Mac: gracias al formato MLX 3-bit, puede ejecutarse en un Mac con Apple Silicon (16 GB de RAM unificada o más) mediante `mlx_lm.server`, ofreciendo un asistente conversacional privado sin conexión.
- Generación de código en entornos de desarrollo: el modelo puede completar y explicar código en múltiples lenguajes, integrándose en editores o pipelines de CI/CD a través de la API compatible con OpenAI.
- Análisis de imágenes en local: al ser multimodal, permite describir imágenes, extraer texto (OCR) o responder preguntas sobre contenido visual sin enviar datos a la nube.
- Razonamiento sobre documentos largos: con 131k de contexto, puede resumir o analizar informes extensos, contratos o artículos científicos en una sola pasada.
- Prototipado de agentes autónomos: su modo agéntico y razonamiento separado lo hacen adecuado para experimentar con agentes que planifican y ejecutan tareas multi-paso en un Mac.
- Investigación sobre alineación y seguridad: al ser abliterado, sirve como caso de estudio para analizar el impacto de eliminar rechazos y los riesgos asociados, siempre en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato proporcionado es el benchmark de rechazo:

| Metrica | Resultado |
|---|---|
| True refusal (harmful, n=300) | 0 / 300 = 0.0% |
| True refusal (full 450) | 0 / 450 = 0.0% |
| Substring-harmful | 0 / 300 |
| Substring-all | 2 / 450 (XSTest false positives) |
| Errors | 0 |

Este resultado confirma que la abliteración es efectiva y que la cuantización 3-bit no provoca "refusal snapback" (reaparición de rechazos).

## Requisitos de hardware

- VRAM estimada: ~15 GB de memoria unificada en Apple Silicon (el modelo ocupa ~15 GB en disco, y en memoria puede requerir algo más).
- GPU recomendadas: exclusivo para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No compatible con GPUs NVIDIA o AMD.
- Cabe en equipos con 16 GB de RAM unificada, aunque se recomienda 32 GB para mayor comodidad y velocidad.
- Opciones de despliegue: `mlx_lm.generate` para inferencia puntual, `mlx_lm.server` para servir con API OpenAI-compatible, o LM Studio con runtime MLX.
- Latencia y throughput: no disponibles. Al ser 3-bit, la velocidad será inferior a versiones de mayor precisión, pero aceptable para uso interactivo en Mac modernos.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría (30B abliterados en MLX 3-bit). Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Abliterated-MLX-3bit (este) | ~5,3B (según safetensors) / 30B (anunciado) | 131 072 | Apache-2.0 | MLX 3-bit | Abliterado, multimodal |
| Muse-Glimmer-30B-Abliterated-BF16 (base) | 30B | 131 072 | Apache-2.0 | BF16 | Sin cuantizar, requiere más VRAM |
| Muse-Glimmer-30B (original, Meta) | 30B | 131 072 | Apache-2.0 | No disponible | Con rechazos intactos |

No hay modelos comparables con abliteración y cuantización 3-bit en MLX en la información disponible.

## Limitaciones y advertencias

- La abliteración elimina todos los rechazos, incluidos los de contenido dañino, ilegal o peligroso. Esto supone un riesgo grave de uso indebido y puede violar políticas de plataforma o leyes locales.
- La cuantización 3-bit introduce pérdida de precisión, lo que puede degradar la calidad del razonamiento y aumentar las alucinaciones en tareas complejas.
- Discrepancia en el número de parámetros: los safetensors indican ~5,3B, mientras que el modelo se anuncia como 30B. Esto puede deberse a un error en el repo o a que el archivo de pesos está incompleto; debe verificarse antes de confiar en el modelo.
- No se especifican los idiomas soportados; aunque se espera cobertura multilingüe, no hay garantía.
- Sin benchmarks de calidad general (razonamiento, código, matemáticas), es difícil evaluar su rendimiento real frente a alternativas.
- El modelo está diseñado exclusivamente para Apple Silicon; no es portable a otros entornos sin conversión.
- La licencia Apache-2.0 permite uso comercial, pero la abliteración puede entrar en conflicto con términos de uso de la plataforma de origen (Meta) o con normativas de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-3bit
- Modelo base (BF16 abliterado): https://huggingface.co/Blackfrost-Research/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Perfil de Blackfrost en X: https://x.com/Blackfrost_AI
