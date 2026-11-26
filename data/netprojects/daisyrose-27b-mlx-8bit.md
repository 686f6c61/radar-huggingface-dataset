# netprojects/DaisyRose-27B-MLX-8bit

## Resumen

DaisyRose-27B-MLX-8bit es la conversión a MLX con cuantización de 8 bits del modelo RadixArk/DaisyRose-27B, un modelo multimodal de 27.781 millones de parámetros desarrollado por RadixArk. DaisyRose-27B es una versión de Qwen3.8-27B entrenada exclusivamente mediante aprendizaje por refuerzo (RL), sin ajuste supervisado ni destilación, sobre aproximadamente 1.200 tareas de agente de horizonte largo. Conserva la arquitectura, el tokenizador, la plantilla de chat, la comprensión de imágenes y la ventana de contexto de 256K del modelo base, y razona antes de responder por defecto.

Esta build concreta, publicada por el usuario netprojects, convierte los pesos originales a formato MLX para su ejecución en Apple Silicon, incluyendo el codificador de visión y la capa de predicción multi-token (MTP) propia de DaisyRose. Las capas lineales se cuantizan a 8 bits con esquema afín y grupo de 64, lo que da un tamaño de repositorio de 29,9 GB. Está pensada para Macs con 48 GB de memoria unificada o más, y es la variante que más fidelidad mantiene respecto a los pesos bf16 originales (99,5% de coincidencia en el siguiente token, KL de 0,0004).

Su relevancia radica en que permite ejecutar localmente en hardware de Apple un modelo orientado a agentes y razonamiento con capacidades de visión, tool calling y contexto muy largo, manteniendo unas cifras de benchmarks que superan al Qwen3.8-27B base en tareas de terminal, ingeniería de software y razonamiento científico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B) con capa MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | 8 bits afín, grupo 64 (esta build); el autor ofrece también 6, 4, 3, 2.5 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

DaisyRose-27B mantiene la arquitectura de Qwen3.8-27B, un transformer multimodal con comprensión de imágenes, y añade una capa propia de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa. El entrenamiento de RadixArk se realizó únicamente con aprendizaje por refuerzo sobre unas 1.200 tareas de agente de horizonte largo, sin supervisión directa ni destilación, lo que según el autor preserva y potencia las capacidades de razonamiento y uso de herramientas del modelo base.

La conversión a MLX fue verificada comprobando que todos los ficheros del modelo original en la revisión `293a7a2` coinciden con los hashes SHA-256 del Hub y que su configuración y lista de tensores son idénticas a las de Qwen3.8-27B. La cuantización afín (grupo 64) se aplica a las capas lineales, y la capa MTP se conserva cuantizada a 8 bits en `model-mtp.safetensors`. El tokenizador y la plantilla de chat son los originales de RadixArk, sin modificar.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto (el contenido de razonamiento aparece antes de ``).
- Comprensión de imágenes (pipeline image-text-to-text) mediante el codificador de visión incluido.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Ejecución de agentes y razonamiento multi-paso, entrenado específicamente sobre tareas de agente de horizonte largo.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`xhigh` por defecto, `medium`, `low`) y desactivación del pensamiento con `enable_thinking=False`.
- Decodificación especulativa integrada mediante la capa MTP, usable como modelo borrador en mlx-vlm.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de terminal y agentes de sistema: el modelo alcanza 75,5 en Terminal Bench 2.1 y 12,0 en Terminal Bench 4.1, por lo que es adecuado para agentes que operan shell, interpretan salidas de comandos y corrigen errores de forma iterativa.
- Ingeniería de software asistida: con 94,7 en SWE Bench Pro v2 y 46,2 en DeepSWE v1.1, puede integrarse en flujos de resolución de issues, generación de parches y revisión de código sobre repositorios reales.
- Análisis de capturas y documentación técnica: gracias a su entrada image-text-to-text, puede interpretar screenshots de terminales, diagramas o interfaces y responder preguntas sobre ellos, como se muestra en el ejemplo de la model card con `screenshot.png`.
- Asistentes de razonamiento científico y matemático: con 90,7 en GPQA Diamond y 45/50 en GSM8K (esta build), sirve para resolución de problemas de nivel experto y verificación de cálculos paso a paso.
- Agentes con contexto largo: la ventana de 256K permite procesar repositorios completos, logs extensos o conversaciones multi-turno sin truncar, útil en pipelines de soporte técnico o auditoría de código.
- Despliegue local en estaciones de trabajo Apple Silicon: al ejecutarse con mlx-lm y mlx-vlm, permite prototipar agentes y asistentes con visión en un MacBook Pro sin depender de la nube, con un servidor compatible con la API de OpenAI en el puerto 8000.
- Seguimiento de instrucciones complejas: con 82,4 en IFBench, es adecuado para sistemas que requieren cumplir especificaciones detalladas, como generación de informes estructurados o extracción de datos con formato estricto.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para los pesos originales BF16/FP8 (no para esta build MLX):

| Benchmark | DaisyRose-27B | Qwen3.8-27B |
|---|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 |
| Terminal Bench 2.1 | 75,5 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 |
| SWE Bench Pro v2 | 94,7 | 91,3 |
| HLE (solo texto) | 34,3 | 33,9 |
| IFBench | 82,4 | 79,5 |
| GPQA Diamond | 90,7 | 89,2 |

Métricas de fidelidad de esta build MLX 8-bit frente a bf16:

| Métrica | Valor |
|---|---|
| Tamaño | 29,9 GB |
| Bits por peso | 8,63 |
| Coincidencia con el siguiente token de bf16 | 99,5% |
| KL frente a bf16 | 0,0004 |
| GSM8K (50 preguntas, thinking off, greedy) | 45/50 |
| Memoria pico con prompt de 8K tokens | 29,7 GB |
| Tool call / coding / thinking / vision | pass / 3/3 / 2/2 / pass |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 29,7 GB de pico con un prompt de 8K tokens (medido con mlx-lm en modo texto); contextos más largos requieren más memoria.
- Mac recomendado por el autor: 48 GB o más de memoria unificada, que es el mínimo cuyo límite por defecto de memoria GPU cubre ese pico.
- En Macs de 32 GB puede funcionar elevando el límite de memoria GPU (`sudo sysctl iogpu.wired_limit_mb=27000`) y usando contextos cortos; en ese caso el autor recomienda la build de 6 bits.
- No cabe en GPUs consumer tipo RTX 4090 en esta cuantización; está diseñado específicamente para Apple Silicon (mlx).
- Opciones de despliegue: `mlx_lm.server` (API compatible con OpenAI) y `mlx_vlm.generate` para multimodal, con `mlx-lm>=0.32.2` y `mlx-vlm>=0.7.11`.
- Decodificación acelerada: usar la propia build como `--draft-model` con `--draft-kind mtp` para decodificación especulativa.
- Latencia y throughput: no disponibles en la información proporcionada; las mediciones se realizaron en un MacBook Pro M5 Max de 128 GB con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---:|---|---|---|---|
| DaisyRose-27B-MLX-8bit | 27,78B | 256K | Apache 2.0 | MLX, Apple Silicon | Esta ficha; 29,9 GB, 99,5% fidelidad vs bf16 |
| DaisyRose-27B-MLX-6bit | 27,78B | 256K | Apache 2.0 | MLX, Apple Silicon | 23,1 GB, recomendada por el autor; 98,7% fidelidad |
| DaisyRose-27B-MLX-4bit | 27,78B | 256K | Apache 2.0 | MLX, Apple Silicon | 16,3 GB, para Macs de 32 GB; 95,8% fidelidad |
| Qwen3.8-27B | no disponible | 256K | no disponible | no disponible | Modelo base; DaisyRose lo supera en todos los benchmarks publicados |

## Limitaciones y advertencias

- Los benchmarks publicados corresponden a los pesos originales BF16/FP8 de RadixArk, no a esta build MLX de 8 bits; la cuantización introduce una pequeña desviación (0,5% de discrepancia en el siguiente token y KL de 0,0004).
- La decodificación con MTP puede divergir ligeramente del texto generado con decodificación plana en casos de casi-empate durante la verificación por lotes.
- El modo de pensamiento está activado por defecto en mlx-lm, pero mlx-vlm lo deja desactivado salvo que se pase `--enable-thinking`; hay que tenerlo en cuenta para reproducir resultados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado tasas específicas para este modelo.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento fuera de los idiomas del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio y las condiciones del modelo base RadixArk/DaisyRose-27B.
- Requiere hardware Apple Silicon con memoria unificada suficiente; no es desplegable en GPUs NVIDIA con las herramientas indicadas.
- El contexto de 256K exige mucha más memoria que la medida con prompts de 8K; planificar el dimensionado en consecuencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build de 6 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-3bit
- Build de 2.5 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/DaisyRose-27B-MLX-bf16
