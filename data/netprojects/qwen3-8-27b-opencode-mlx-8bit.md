# netprojects/Qwen3.8-27B-opencode-MLX-8bit

## Resumen

Qwen3.8-27B-opencode-MLX-8bit es una conversión a formato MLX, con cuantización de 8 bits, del modelo Qwen3.8-27B de Alibaba Qwen sobre el que se ha fusionado el adaptador LoRA `harness-hub/Qwen3.8-27B-opencode-adapted`. El resultado es un modelo multimodal (image-text-to-text) de 27.781 millones de parámetros, pensado para ejecutarse en Apple Silicon y orientado específicamente a tareas de agente de programación, en concreto como motor del agente OpenCode sobre tareas de ingeniería de software y de terminal.

El adaptador de origen se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) para mejorar el comportamiento del modelo base en tareas de agente. Según los datos publicados por el autor del adaptador, con el modo thinking desactivado, el modelo pasa de 35,3% a 51,0% en SWE-bench Pro (hard 51) y de 46,4% a 52,4% en Terminal-Bench 2.1 respecto al modelo base, igualando el rendimiento del base con thinking en su esfuerzo máximo pero generando aproximadamente una sexta parte de los tokens.

Esta build concreta cuantiza las capas lineales a 8 bits (afín, grupo 64) y conserva el codificador de visión y la capa MTP (multi-token prediction) de Qwen3.8-27B, lo que permite decodificación especulativa integrada con una aceleración de aproximadamente 2,15× en la build de 8 bits. Es relevante ahora porque permite desplegar localmente en un Mac un agente de código con capacidades multimodales y un rendimiento medido en benchmarks de agente, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 16 capas de atención completa y 64 capas totales; incluye capa MTP (multi-token prediction) y codificador de visión |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín con grupo de 64 (esta build); existen builds de 6 bits, 4 bits y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

La arquitectura es un transformer de Qwen3.8-27B con 64 capas, de las cuales 16 son de atención completa y el resto emplean otro mecanismo de atención (el adaptador modifica los módulos q, k, v, o en las 16 capas de atención completa y gate, up, down en las 64 capas). Incluye un codificador de visión, lo que habilita el pipeline image-text-to-text, y una capa de multi-token prediction (MTP) propia de Qwen que actúa como modelo borrador para decodificación especulativa. La build conserva el tokenizador y la plantilla de chat originales de Qwen3.8-27B, con el mismo vocabulario y formato de tool calls XML.

El adaptador se entrenó mediante aprendizaje por refuerzo con AsyncGRPO en TRL sobre tareas de ingeniería de software y de terminal, con el objetivo de ser el modelo detrás del agente OpenCode. El autor de esta conversión verificó la fusión elemento a elemento: los 256 módulos adaptados equivalen a `W + 2.0 · B @ A` redondeado a bf16, y el resto de tensores son idénticos byte a byte a Qwen3.8-27B. El adaptador no modifica el codificador de visión ni la capa MTP. La cuantización de 8 bits presenta una fidelidad del 99,2% en el mismo siguiente token que bf16 y una divergencia KL de 0,0004 frente a bf16.

## Capacidades

- Generación de texto y razonamiento general, con modo thinking disponible pero desaconsejado para el caso de uso previsto.
- Generación y edición de código en tareas de ingeniería de software, incluyendo resolución de bugs y ejecución de tests.
- Operación como agente de terminal y de codificación (entrenado específicamente para OpenCode).
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Capacidades multimodales de imagen a texto: interpretación de capturas de pantalla y salidas de terminal.
- Razonamiento multi-paso orientado a agentes.
- Decodificación especulativa integrada mediante la capa MTP, sin descarga adicional.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código local en OpenCode: el modelo se sirve con `mlx_lm.server` y se configura como proveedor local en `opencode.json`; está entrenado y evaluado con thinking desactivado, por lo que se usa en ese modo para tareas como localizar y corregir tests fallidos.
- Resolución de bugs en producción sobre un repositorio local: con el comando `opencode run` el modelo puede inspeccionar el código, ejecutar tests y aplicar parches, apoyándose en su entrenamiento específico en SWE-bench Pro y Terminal-Bench.
- Automatización de tareas de terminal: interpretación de salidas de comandos y ejecución iterativa de pasos, gracias al entrenamiento en Terminal-Bench 2.1 y al soporte de tool calling.
- Diagnóstico visual de errores: con mlx-vlm se le puede pasar una captura de pantalla de una terminal o de un IDE y preguntar por el error mostrado, combinando el codificador de visión con el razonamiento de código.
- Asistente de programación en Python embebido en scripts: carga con `mlx_lm.load` y generación directa para tareas acotadas como escribir funciones de parseo o utilidades.
- Evaluación e investigación de agentes de código en Apple Silicon: al ser una build MLX con fidelidad medida frente a bf16 (99,2% de mismo siguiente token, KL 0,0004), sirve como referencia reproducible para experimentos de agentes sin GPU dedicada.
- Despliegue de un servidor compatible con OpenAI en local: `mlx_lm.server` expone una API `/v1` que permite integrar el modelo en herramientas que ya hablan el protocolo de OpenAI.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (OpenCode, thinking desactivado):

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Fidelidad de cuantización frente a bf16 (builds del mismo autor):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| 8 bits (esta build) | 30,0 GB | 99,2% | 0,0004 |
| 4 bits | 16,3 GB | 96,7% | 0,0203 |
| bf16 | 55,6 GB | referencia | referencia |

Throughput medido en MacBook Pro M5 Max (128 GB), greedy, thinking off, 5 prompts × 256 tokens:

| Build | Sin MTP | Con MTP (mlx-vlm 0.7.11) |
|---|---|---|
| 4 bits | 33 tok/s | 62 tok/s (×1,91) |
| 6 bits | 20 tok/s | 21 tok/s (×1,04) |
| 8 bits | 17 tok/s | 37 tok/s (×2,15) |

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 30,0 GB; se necesita memoria unificada suficiente para los pesos más el estado de inferencia. El autor reporta pruebas en un MacBook Pro M5 Max con 128 GB.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; el autor valida en M5 Max de 128 GB. No hay datos de rendimiento en A100, H100 o RTX 4090, ya que el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no se dispone de datos para GPUs NVIDIA de consumo con este formato.
- Opciones de despliegue: `mlx-lm` (>= 0.32.2) para texto y servidor compatible con OpenAI; `mlx-vlm` (>= 0.7.11) para imagen y decodificación especulativa MTP; drafter alternativo DSpine con `dspine-hybrid-mlx`.
- Latencia y throughput: 17 tok/s en decodificación plana y 37 tok/s con MTP en la build de 8 bits, según las mediciones indicativas del autor (con otros servicios corriendo en el Mac).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-MLX-8bit | 27,78B | no disponible | Agente de código multimodal, MLX 8 bits | apache-2.0 | Hugging Face, MLX |
| Qwen3.8-27B-opencode-MLX-6bit | 27,78B (6 bits) | no disponible | Misma tarea, menor tamano (23,1 GB), 98,7% fidelidad | apache-2.0 | Hugging Face, MLX |
| Qwen3.8-27B-opencode-MLX-4bit | 27,78B (4 bits) | no disponible | Misma tarea, menor tamano (16,3 GB), 96,7% fidelidad, mayor throughput (33 tok/s) | apache-2.0 | Hugging Face, MLX |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Modelo base sin adaptador de agente | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos de otros autores comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; el autor recomienda mantenerlo apagado. Usarlo con thinking puede degradar el comportamiento esperado.
- La decodificación especulativa con MTP puede divergir ligeramente del texto de la decodificación plana en respuestas largas cuando hay empates cercanos, ya que la verificación batched puede redondear en sentido contrario.
- Las mediciones de throughput son indicativas y se tomaron con otros servicios ejecutándose en el mismo Mac.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje en tareas de código y terminal.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia apache-2.0, que permite uso comercial; deben respetarse las condiciones de la licencia del modelo base Qwen3.8-27B y del adaptador de origen.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente utilizable en GPUs NVIDIA sin conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente más allá de las comprobaciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-8bit
- Adaptador de origen: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-bf16
- Adaptador MLX (solo LoRA): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
