# netprojects/DaisyRose-27B-MLX-6bit

## Resumen

DaisyRose-27B-MLX-6bit es una conversión a formato MLX del modelo RadixArk/DaisyRose-27B, publicada por el usuario netprojects para su ejecución en Apple Silicon. DaisyRose-27B es la versión entrenada con aprendizaje por refuerzo (RL) de Qwen3.8-27B, desarrollada por RadixArk sobre unas 1.200 tareas de agente de horizonte largo, sin fine-tuning supervisado ni destilación. El modelo conserva la arquitectura, el tokenizador, la plantilla de chat, la comprensión de imágenes y la ventana de contexto de 256K de Qwen3.8-27B, y piensa antes de responder por defecto.

Esta build concreta cuantiza las capas lineales a 6 bits (afín, grupo 64) e incluye tanto el codificador visual como la capa de predicción multi-token (MTP) propia del modelo, lo que permite decodificación especulativa con el propio modelo como draft. El resultado ocupa 23,1 GB y está pensado para Macs con 36 GB o más de memoria unificada, con un equilibrio entre tamaño y fidelidad respecto a los pesos bf16: mantiene el mismo siguiente token que bf16 en el 98,7% de los casos y una divergencia KL de 0,0014.

Con 27.781.427.952 parámetros reales (según safetensors) y licencia Apache 2.0, es relevante para desarrolladores que quieran ejecutar localmente en Apple Silicon un modelo orientado a agentes, razonamiento y uso de herramientas, con capacidades de visión y contexto largo, sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), con capa MTP y codificador visual; conversión MLX |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (heredada de Qwen3.8-27B) |
| Tipos de cuantizacion | 6 bits afín, grupo 64 (esta build); el autor publica además 8-bit, 4-bit, 3-bit, 2.5-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx); incluye `model-mtp.safetensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B: un transformer denso de aproximadamente 27.800 millones de parámetros con ventana de contexto de 256K tokens, al que RadixArk añade una capa de predicción multi-token (MTP) y un codificador visual para entrada image-text-to-text. DaisyRose-27B se entrena exclusivamente con aprendizaje por refuerzo sobre unas 1.200 tareas de agente de horizonte largo, sin SFT ni destilación, partiendo de los pesos de Qwen3.8-27B. Según el autor de la conversión, la configuración y la lista de tensores de DaisyRose-27B son idénticas a las de Qwen3.8-27B.

La build MLX cuantiza las capas lineales a 6 bits (afín, grupo 64), incluyendo el codificador visual y la capa MTP, que se distribuye en `model-mtp.safetensors` y puede usarse como modelo draft para decodificación especulativa con mlx-vlm (`--draft-kind mtp`). Cada token propuesto por el draft se verifica con el modelo completo; con decodificación greedy el texto coincide con la decodificación normal salvo en empates cercanos, donde la comprobación por lotes puede redondear al otro lado. El autor verificó que todos los ficheros de origen (revisión `293a7a2`) coinciden con los hashes SHA-256 del Hub.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto (el contenido de razonamiento aparece antes de ``).
- Razonamiento matemático y de sentido común; en la build 6-bit obtiene 44/50 en GSM8K (thinking off, greedy).
- Comprensión de imágenes (pipeline image-text-to-text), con codificador visual incluido en la conversión.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` de OpenAI.
- Soporte de agentes y razonamiento multi-paso, entrenado específicamente sobre tareas de agente de horizonte largo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`xhigh` por defecto, `medium`, `low`) y desactivación del pensamiento con `enable_thinking=False`.
- Decodificación especulativa integrada mediante la capa MTP.
- Generación de código (validada en el harness del autor: 3/3 en coding, 2/2 en thinking, tool call y visión correctos en esta build).

## Casos de uso

- Agentes de terminal y automatización de shell: el modelo está entrenado con RL sobre tareas de agente de horizonte largo y obtiene 75,5 en Terminal Bench 2.1 y 12,0 en Terminal Bench 4.1, por lo que encaja en flujos que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Resolución de issues de software: con 94,7 en SWE Bench Pro v2 y 46,2 en DeepSWE v1.1, es adecuado para pipelines que leen un repositorio, localizan el fallo y proponen un parche, integrándose en revisión de código asistida.
- Asistente de desarrollo local en Mac: al ejecutarse con mlx-lm en Apple Silicon con 36 GB o más, permite tener un servidor compatible con la API de OpenAI (`mlx_lm.server`) en el propio portátil para autocompletado, refactorización y explicación de código sin enviar datos a la nube.
- Análisis de capturas y documentación técnica: gracias al pipeline image-text-to-text, puede recibir una captura de terminal o un diagrama y responder qué error muestra o qué representa, usando `mlx_vlm.generate --image ... --enable-thinking`.
- Atención al cliente y asistentes conversacionales multi-turno: la ventana de 256K tokens permite mantener historiales largos y contexto de producto extenso; el control de `reasoning_effort` permite bajar el coste en consultas simples y subirlo en casos complejos.
- Automatización con herramientas externas: el soporte de tool calling en formato XML de Qwen, expuesto como `tool_calls` de OpenAI por mlx-lm, permite conectarlo a APIs, bases de datos o sistemas de tickets dentro de un orquestador de agentes.
- Razonamiento científico y preguntas de nivel experto: con 90,7 en GPQA Diamond y 34,3 en HLE (solo texto), sirve para asistentes de investigación que requieren cadenas de razonamiento largas con verificación.
- Generación de código con baja latencia en local: la capa MTP como draft model acelera la decodificación en mlx-vlm con `--draft-model` y `--draft-kind mtp`, útil en bucles de edición de código interactivos.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para los pesos originales BF16/FP8 (no para esta build MLX), comparando DaisyRose-27B con Qwen3.8-27B:

| Benchmark | DaisyRose-27B | Qwen3.8-27B |
|---|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 |
| Terminal Bench 2.1 | 75,5 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 |
| SWE Bench Pro v2 | 94,7 | 91,3 |
| HLE (solo texto) | 34,3 | 33,9 |
| IFBench | 82,4 | 79,5 |
| GPQA Diamond | 90,7 | 89,2 |

Métricas de la build MLX 6-bit medidas por el autor de la conversión:

| Métrica | Valor |
|---|---|
| Tamaño | 23,1 GB |
| Bits por peso | 6,66 |
| Mismo siguiente token que bf16 | 98,7% |
| KL frente a bf16 | 0,0014 |
| GSM8K (50 preguntas, thinking off, greedy) | 44/50 |
| Memoria pico con prompt de 8K tokens | 23,4 GB |
| Mac recomendado | 36 GB o más |
| Tool call / coding / thinking / vision | pass / 3/3 / 2/2 / pass |

## Requisitos de hardware

- VRAM (memoria unificada) estimada: 23,4 GB de pico con prompt de 8K tokens para esta build de 6 bits; contextos más largos requieren más memoria.
- Mac recomendado: 36 GB o más de memoria unificada, según el límite de memoria GPU por defecto de macOS (aproximadamente dos tercios de la RAM hasta 36 GB y tres cuartos por encima).
- En un Mac de 32 GB puede funcionar elevando el límite de memoria GPU hasta el siguiente reinicio, por ejemplo `sudo sysctl iogpu.wired_limit_mb=27000`, dejando varios GB para macOS y las aplicaciones.
- Alternativas de menor tamaño del mismo autor: 8-bit (29,9 GB, 48 GB+ de Mac), 4-bit (16,3 GB, 32 GB+), 3-bit (13,8 GB, 24 GB+), 2.5-bit (11,8 GB, 24 GB+, solo texto) y bf16 (55,6 GB, 96 GB+).
- No está pensado para GPUs NVIDIA ni CUDA: la librería es mlx y el objetivo es Apple Silicon.
- Opciones de despliegue: `mlx_lm.server` (API compatible con OpenAI) y scripts de `mlx-lm` para texto; `mlx_vlm.generate` para imagen y texto; decodificación especulativa con MTP mediante `--draft-model` y `--draft-kind mtp`.
- Versiones mínimas indicadas: mlx-lm >= 0.32.2 y mlx-vlm >= 0.7.11; las mediciones se hicieron con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11 en un MacBook Pro M5 Max de 128 GB.
- Latencia y throughput: no disponibles como cifras absolutas; el autor solo indica que la MTP acelera la decodificación y que cada token propuesto se verifica con el modelo completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-MLX-6bit | 27,8B | 256K | Apache 2.0 | MLX, Apple Silicon | Build 6-bit, 23,1 GB, con MTP y visión |
| DaisyRose-27B-MLX-8bit | 27,8B | 256K | Apache 2.0 | MLX, Apple Silicon | 29,9 GB, 99,5% mismo token que bf16, 48 GB+ de Mac |
| DaisyRose-27B-MLX-4bit | 27,8B | 256K | Apache 2.0 | MLX, Apple Silicon | 16,3 GB, 95,8% mismo token que bf16, 32 GB+ de Mac |
| Qwen3.8-27B (base) | 27,8B | 256K | no disponible | safetensors | Referencia de comparación de RadixArk; peor en todos los benchmarks publicados frente a DaisyRose |

## Limitaciones y advertencias

- Los benchmarks de RadixArk corresponden a los pesos originales BF16/FP8, no a esta build MLX de 6 bits; la cuantización introduce una divergencia KL de 0,0014 y un 1,3% de casos con siguiente token distinto respecto a bf16.
- Con decodificación especulativa MTP y decodificación greedy, las respuestas largas pueden divergir ligeramente de la decodificación normal en empates cercanos.
- El modelo piensa por defecto, lo que consume tokens y latencia; en problemas difíciles hay que reservar espacio para cadenas de razonamiento largas (el ejemplo del autor usa `max_tokens=8192`).
- En mlx-vlm el pensamiento está desactivado salvo que se pase `--enable-thinking`, lo que puede cambiar el comportamiento respecto al servidor de mlx-lm.
- La build 2.5-bit del mismo autor pierde la capacidad de visión (solo texto) y baja a 2/3 en coding; no es equivalente a esta build de 6 bits.
- Idiomas soportados no documentados en la información disponible; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base RadixArk/DaisyRose-27B.
- Requiere hardware Apple Silicon; no es desplegable en CUDA, vLLM, TGI ni llama.cpp sin reconversión.
- La información de la model card procede del autor de la conversión, no de una evaluación independiente.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build 8-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-4bit
- Build 3-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-3bit
- Build 2.5-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/DaisyRose-27B-MLX-bf16
