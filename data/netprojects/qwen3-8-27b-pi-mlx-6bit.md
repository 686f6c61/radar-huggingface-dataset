# netprojects/Qwen3.8-27B-pi-MLX-6bit

## Resumen

Qwen3.8-27B-pi-MLX-6bit es una compilacion cuantizada a 6 bits del modelo Qwen3.8-27B de Qwen, fusionada con el adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted` y convertida al formato MLX para su ejecucion nativa en Apple Silicon. El adaptador original fue entrenado mediante aprendizaje por refuerzo (AsyncGRPO con TRL) para convertir al modelo en el motor del agente de programacion `pi`, especializado en tareas de ingenieria de software y operaciones de terminal. El resultado es un modelo de 27.781.427.952 parametros (aproximadamente 27,8 mil millones) con capacidades multimodales de imagen-texto, empaquetado en 23,1 GB.

La relevancia de esta build radica en que ofrece un equilibrio medido entre tamano y fidelidad respecto al modelo en bf16: conserva el 99,0% de coincidencia en el siguiente token y una divergencia KL de solo 0,0015, lo que la convierte en la opcion recomendada por el autor frente a las variantes de 8, 4, 3 y 2,5 bits. Incorpora tanto el codificador de vision como la capa de prediccion multi-token (MTP) original de Qwen, cuantizada de forma consistente, lo que permite decodificacion especulativa.

El modelo esta pensado para desarrolladores que trabajan en Macs con Apple Silicon y necesitan ejecutar localmente un agente de codigo con ventana de contexto amplia y soporte de tool calling, sin depender de APIs en la nube. Su licencia Apache 2.0 facilita el uso comercial, y su integracion con mlx-lm y mlx-vlm permite desplegarlo como servidor compatible con la API de OpenAI Chat Completions.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP, cuantizacion MLX affine group 64 |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (esta build); el autor publica tambien 8, 4, 3, 2,5 bits, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B (revision `3756181`) y le fusiona el adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted` (revision `e786f84`). La conversion a MLX se realizo con mlx-vlm e incluye el codificador de vision y la capa MTP propia de Qwen, cuantizada al mismo nivel que el resto de la build. Las capas lineales se cuantizan a 6 bits en modo affine con grupo de 64. El tokenizador y la plantilla de chat son los archivos originales de harness-hub, sin modificar, por lo que el vocabulario y el formato de tool calls coinciden con Qwen3.8-27B (formato XML `<tool_call><function=...><parameter=...>`).

El adaptador fue entrenado por harness-hub con aprendizaje por refuerzo mediante AsyncGRPO en TRL, orientado a tareas de ingenieria de software y terminal bajo el agente `pi`. Los resultados publicados por el autor, con thinking desactivado, indican una mejora en Terminal-Bench 2.1 del 39,5% al 55,8% y en SWE-bench Pro (hard 51) del 29,4% al 62,7% respecto al modelo base, con entre un 55% y un 64% menos de llamadas a herramientas por tarea. La innovacion tecnica destacable es la conservacion de la capa MTP de Qwen como modelo borrador para decodificacion especulativa, ademas del soporte de DSpine como drafter alternativo.

## Capacidades

- Generacion de texto y razonamiento general, heredadas de Qwen3.8-27B.
- Generacion y reparacion de codigo en tareas de ingenieria de software (SWE-bench Pro, Terminal-Bench).
- Ejecucion de tareas de terminal y agentes de codigo multi-paso, con reduccion de llamadas a herramientas.
- Soporte de tool calling / function calling en formato XML de Qwen, expuesto como `tool_calls` de OpenAI por el servidor de mlx-lm.
- Capacidades multimodales imagen-texto: interpretacion de capturas de terminal, imagenes y diagramas mediante mlx-vlm.
- Modo thinking desactivable; el adaptador fue entrenado y evaluado con thinking off, por lo que se recomienda mantenerlo desactivado.
- Decodificacion especulativa mediante la capa MTP integrada o mediante el drafter DSpine.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Reparacion automatica de tests fallidos: el modelo puede recibir el contenido de `tests/test_parser.py`, analizar el fallo y proponer un parche, tal como se documenta en el ejemplo oficial con el agente `pi`. Es adecuado por su entrenamiento especifico en tareas de terminal y su formato de tool calls compatible.
- Agente de codigo local en macOS: servir el modelo con `mlx_lm.server` y conectarlo a `pi` mediante la API OpenAI Chat Completions permite disponer de un agente de programacion totalmente local en un Mac con Apple Silicon, sin enviar codigo a servicios externos.
- Interpretacion de capturas de terminal: con mlx-vlm, el modelo puede analizar una imagen de una terminal y responder que error muestra, util para soporte tecnico asincrono o diagnostico de incidencias.
- Automatizacion de tareas de refactorizacion en pipelines: su soporte de tool calling y su reduccion de llamadas por tarea lo hacen apto para integrarse en flujos de CI/CD que requieran aplicar cambios acotados y verificables.
- Asistente de desarrollo en el editor: desplegado como servidor compatible con OpenAI, puede conectarse a extensiones de IDE que consuman la API de Chat Completions para autocompletado, explicacion de codigo y generacion de parches.
- Evaluacion de agentes en local: investigadores pueden reproducir los resultados de Terminal-Bench y SWE-bench Pro con thinking off usando la build de 6 bits, que conserva el 99,0% de coincidencia con bf16.
- Procesamiento de documentacion tecnica con imagenes: diagramas de arquitectura o capturas de paneles de error pueden enviarse al modelo junto con texto para obtener explicaciones o pasos de resolucion.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (thinking off, bajo el agente `pi`):

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |

Fidelidad de cuantizacion respecto a bf16:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (esta build) | 23,1 GB | 99,0% | 0,0015 |
| 8 bits | 30,0 GB | 99,1% | 0,0004 |
| 4 bits | 16,3 GB | 95,6% | 0,0201 |
| 3 bits | 13,8 GB | 91,4% | 0,0884 |
| 2,5 bits (solo texto) | 11,8 GB | 85,5% | 0,2363 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificacion (greedy, thinking off, 5 prompts x 256 tokens, mediciones indicativas con otros servicios en ejecucion en el Mac):

| Build | Plano | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 61 tok/s (x1,84) | 70 tok/s (x2,25) |
| 6 bits | 23 tok/s | 22 tok/s (x0,96) | 52 tok/s (x2,32) |
| 8 bits | 18 tok/s | 41 tok/s (x2,24) | 54 tok/s (x3,05) |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: 23,1 GB de pesos, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para dejar margen al contexto y al codificador de vision.
- La build de 3 bits (13,8 GB) y la de 2,5 bits (11,8 GB) caben en Macs de 24 GB; la de 4 bits (16,3 GB) es una opcion intermedia.
- GPU: disenado para Apple Silicon (M-series). No se documenta soporte para A100, H100 ni RTX 4090 en esta build MLX.
- Despliegue: `mlx-lm` (version 0.32.2 o superior) para texto y servidor OpenAI; `mlx-vlm` (0.7.11 o superior) para imagen-texto; `dspine-hybrid-mlx` para el drafter DSpine.
- Throughput medido: 23 tok/s en decodificacion plana, 52 tok/s con DSpine y 22 tok/s con MTP en la build de 6 bits.
- Latencia: no disponible de forma desagregada; las cifras anteriores son de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-MLX-6bit (esta build) | 27,8 B | no disponible | Apache 2.0 | Hugging Face, MLX | 23,1 GB, 99,0% coincidencia con bf16 |
| Qwen3.8-27B-pi-adapted-MLX-8bit | 27,8 B | no disponible | Apache 2.0 | Hugging Face, MLX | 30,0 GB, 99,1% coincidencia, mejor fidelidad |
| Qwen3.8-27B-pi-adapted-MLX-4bit | 27,8 B | no disponible | Apache 2.0 | Hugging Face, MLX | 16,3 GB, 95,6% coincidencia, menor huella |
| Qwen3.8-27B base | 27,8 B | no disponible | no disponible | Hugging Face | Referencia sin adaptador pi |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activar el modo thinking puede degradar el rendimiento esperado en tareas de agente.
- La cuantizacion a 6 bits introduce una divergencia KL de 0,0015 respecto a bf16 y una perdida del 1,0% de coincidencia en el siguiente token; para maxima fidelidad debe usarse la build de 8 bits o bf16.
- MTP no aporta aceleracion en esta build con mlx-vlm 0.7.11 (x0,96); para velocidad debe usarse DSpine.
- El entrenamiento esta orientado a tareas de ingenieria de software y terminal; su rendimiento en dominios ajenos puede no reflejar las mejoras reportadas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos generativos, especialmente en tool calls y parches de codigo.
- Idiomas soportados: no disponibles; el tokenizador es el de Qwen3.8-27B.
- Longitud de contexto: no disponible, lo que impide planificar tareas con documentos muy extensos.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B y del adaptador harness-hub de forma independiente.
- Las mediciones de throughput son indicativas y se tomaron con otros servicios en ejecucion en el Mac; no deben tratarse como cifras de referencia estables.
- El servidor debe configurarse con `"api": "openai-completions"`, no con la API de Responses, porque el adaptador se entreno con Chat Completions.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-6bit
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Build 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- Agente pi: https://github.com/earendil-works/pi
