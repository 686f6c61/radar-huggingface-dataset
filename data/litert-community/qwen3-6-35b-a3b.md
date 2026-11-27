# litert-community/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Qwen (Alibaba) y convertido al formato LiteRT-LM por la comunidad litert-community para su ejecución en dispositivos y aceleradores de Google. El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino seis variantes cuantizadas en el formato propietario `.litertlm`, optimizadas para GPU (WebGPU y Metal) y CPU, con soporte de texto y, en dos de las variantes, de imagen. Resuelve el problema de desplegar un MoE de 35B parámetros en entornos de escritorio y móviles mediante LiteRT, el runtime de inferencia de Google.

La relevancia actual del modelo radica en su relación entre tamaño total y parámetros activos: al ser un MoE, solo una fracción de los 35B se activa por token, lo que permite velocidades de decodificación notables. Según la model card, en un Apple M4 Max con 128 GB y LiteRT-LM 0.20.0, el fichero int8 para GPU alcanza 81,574 tok/s de decodificación y 1.493,784 tok/s de prefill a través de WebGPU. El contexto de las variantes publicadas está limitado a 4.096 tokens (sufijo `ekv4096`), muy por debajo del contexto nativo del modelo base.

El proyecto es relevante para desarrolladores que quieran ejecutar un modelo de razonamiento con modo "thinking" (la salida imprime el pensamiento entre `[thought]` y `[/thought]`) en hardware de consumo, sin depender de infraestructura en la nube. La licencia Apache 2.0 facilita el uso comercial, aunque las limitaciones del runtime y del contexto reducido condicionan su idoneidad para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE); detalles completos en el modelo base Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 35B (según el nombre del modelo; no se detalla en la model card) |
| Parametros activos | A3B indica aproximadamente 3B activos por token (no confirmado explícitamente en la información disponible) |
| Longitud de contexto | 4.096 tokens en todas las variantes publicadas (sufijo `ekv4096`) |
| Tipos de cuantizacion | int8 por canal en expertos y capas lineales; variantes mixtas con expertos int8 y resto fp32; router, gate del experto compartido y tabla de tokens sin cuantizar (fp32); encoder de visión con pesos fp16 y adaptador int8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se publican safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, tal como indican las etiquetas y el nombre (35B totales, A3B activos). La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esa información correspondería al repositorio original de Qwen, que no se incluye en la documentación proporcionada. La innovación técnica destacable de esta conversión es el proceso de cuantización y empaquetado para LiteRT-LM: los expertos y las capas lineales se cuantizan a int8 por canal, mientras que el router, la puerta del experto compartido y la tabla de tokens permanecen en fp32 para preservar la precisión del enrutamiento.

La conversión aplica una permutación de rotary parcial una sola vez sobre los pesos q/k norm de los ficheros GPU, y los ficheros piden activaciones fp16 (variante int8 GPU) o fp32 (variantes mixtas y `afp32`). Se documenta una limitación relevante: las versiones 0.19.1 y 0.19.2 de LiteRT-LM fallaban en la operación `moe` porque sus kernels rechazaban SiLU, la activación usada por los expertos; la versión 0.20.0 corrige esto. Además, en la fuente de LiteRT `bf49eb62` la cuantización de activaciones en tiempo de ejecución de XNNPACK no se aplica a los decodificadores de texto de los ficheros CPU, lo que puede afectar a la precisión.

## Capacidades

- Generación de texto y razonamiento con modo "thinking": el modelo imprime su cadena de pensamiento entre `[thought]` y `[/thought]` antes de la respuesta final, lo que permite inspeccionar el razonamiento.
- Aritmética y resolución de problemas sencillos (el ejemplo de la model card resuelve 17 + 25 = 42).
- Comprensión de imágenes en las variantes `vl`: descripción y respuesta a preguntas sobre una imagen adjunta (por ejemplo, identificar un animal en una foto de 512 × 512).
- Ejecución en GPU mediante WebGPU (LiteRT-LM 0.20.0 desde PyPI en macOS) y mediante Metal (compilando LiteRT-LM desde fuente).
- Ejecución en CPU con control del número de hilos (`--cpu-thread-count`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking sugiere capacidad de razonamiento, pero no se detalla soporte de agentes.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.

## Casos de uso

- Asistente de razonamiento local en estación de trabajo: ejecutar el fichero int8 GPU en un Apple M4 Max permite obtener respuestas con traza de pensamiento a 81,574 tok/s de decodificación, adecuado para prototipado de agentes de razonamiento sin conexión a la nube.
- Procesamiento por lotes en CPU: el fichero `mixed_int8_cpu` con 12 hilos permite desplegar el modelo en servidores sin GPU para tareas de clasificación, resumen o extracción de información sobre entradas de hasta 4.096 tokens.
- Análisis de imágenes en local: la variante `vl` responde a preguntas sobre imágenes de 512 × 512 (que consumen 256 de los 4.096 tokens), útil para etiquetado automático, accesibilidad o moderación de contenido en dispositivos de escritorio.
- Evaluación de cuantización en pipelines de ML: los seis ficheros permiten comparar precisión y rendimiento entre int8 puro, mixto y `afp32` sobre el mismo modelo base, útil para equipos que calibran esquemas de cuantización para despliegue.
- Investigación en eficiencia de MoE: el proyecto documenta el comportamiento del enrutamiento y de las activaciones SiLU en distintos backends, lo que sirve para estudiar el impacto de la cuantización en modelos MoE.
- Demos interactivas de bajo coste: al caber en 36-43 GB, el modelo puede ejecutarse en un portátil de gama alta con 64 GB o más de memoria unificada, habilitando demos de razonamiento con imagen sin infraestructura dedicada.
- Pruebas de integración con LiteRT-LM: validar la compatibilidad de aplicaciones LiteRT con modelos MoE de gran tamaño antes de migrar a producción.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la model card corresponden a la ejecución en un Apple M4 Max con 128 GB y LiteRT-LM 0.20.0, medidos el 2026-11-24:

| Fichero | Runtime | Prefill (tok/s) | Decode (tok/s) | Memoria pico |
|---|---|---:|---:|---|
| `qwen36_35b_a3b_int8_gpu_ekv4096.litertlm` | LiteRT-LM 0.20.0, GPU (WebGPU) | 1.493,784 | 81,574 | no disponible en el extracto |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se han medido el GPU de Android, el CPU de Android ni iOS/iPhone; las mediciones son solo de escritorio.

## Requisitos de hardware

- VRAM/memoria estimada: entre 36,43 GB (int8 GPU) y 43,01 GB (vl mixed int8 CPU) según el fichero; se recomienda al menos 48 GB de memoria unificada o VRAM para margen de trabajo.
- GPU recomendadas: Apple M4 Max con 128 GB (medido); no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: cabe en equipos Apple Silicon de gama alta con 64 GB o más de memoria unificada; no se confirma compatibilidad con GPUs NVIDIA de consumo en la información disponible.
- Opciones de despliegue: LiteRT-LM 0.20.0 (requiere Python 3.10 o superior; probado con Python 3.13), con backends GPU (WebGPU en macOS desde PyPI, Metal compilando desde fuente) y CPU.
- Latencia y throughput: prefill de 1.493,784 tok/s y decodificación de 81,574 tok/s en M4 Max con WebGPU; no hay datos para CPU ni para otros aceleradores.
- Advertencia de backend: en Metal debe usarse uno de los ficheros `afp32`, ya que el fichero int8 GPU pide activaciones fp16 y en Metal el pensamiento se agotó en el límite de 2.048 tokens en 12 de 12 ejecuciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este repo, LiteRT-LM) | 35B totales / ~3B activos | 4.096 | Apache 2.0 | `.litertlm` | Hugging Face, 240 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B totales / ~3B activos | no disponible en la información proporcionada | Apache 2.0 | safetensors (presumiblemente) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada; la comparación con alternativas de tamaño similar o de la misma tarea no está disponible.

## Limitaciones y advertencias

- Contexto reducido: todas las variantes están limitadas a 4.096 tokens, muy por debajo del contexto nativo del modelo base; una sola imagen de 512 × 512 consume 256 tokens.
- Solo inglés: la etiqueta de idioma es `en`; no se documenta soporte multilingüe.
- Requisito de versión: LiteRT-LM 0.19.1 y 0.19.2 fallan en la operación `moe` por rechazar SiLU; es obligatorio usar 0.20.0 o superior.
- Problema en Metal con int8: el fichero int8 GPU pide activaciones fp16 y en Metal el pensamiento se agota en el límite de 2.048 tokens en todas las ejecuciones probadas; debe usarse la variante `afp32`.
- Precisión en CPU: en la fuente de LiteRT `bf49eb62`, la cuantización de activaciones en tiempo de ejecución de XNNPACK no se aplica a los decodificadores de texto de los ficheros CPU, lo que puede degradar la calidad; la rueda 0.20.0 no fue verificada para este punto.
- Cobertura de hardware limitada: no se probaron teléfonos, GPU de Android, CPU de Android ni iOS/iPhone; las mediciones son solo de escritorio.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse antes de usar en producción.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el runtime LiteRT-LM tienen sus propias condiciones que deben revisarse.
- Tamaño del repositorio: 237,5 GB en total; conviene descargar solo el fichero necesario.
- Sin datos de benchmarks de calidad: no se han publicado resultados de MMLU, HumanEval, GSM8K ni similares, por lo que la evaluación de capacidades debe hacerse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Detalles técnicos de la conversión: https://huggingface.co/litert-community/Qwen3.6-35B-A3B/blob/main/DETAILS.md
- Sección de ficheros GPU en DETAILS: https://huggingface.co/litert-community/Qwen3.6-35B-A3B/blob/main/DETAILS.md#gpu-files
- Sección de precisión en DETAILS: https://huggingface.co/litert-community/Qwen3.6-35B-A3B/blob/main/DETAILS.md#accuracy
- Sección de compilación del runtime en DETAILS: https://huggingface.co/litert-community/Qwen3.6-35B-A3B/blob/main/DETAILS.md#build-the-runtime
