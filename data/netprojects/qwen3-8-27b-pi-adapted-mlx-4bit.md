# netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit

## Resumen
Qwen3.8-27B-pi-adapted-MLX-4bit es una cuantizacion en 4 bits para Apple Silicon (formato MLX) del modelo Qwen3.8-27B, un transformer denso de 27.781 millones de parametros desarrollado originalmente por Alibaba Qwen. Sobre esa base, el equipo de harness-hub aplico un LoRA entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) para especializarlo como el modelo que impulsa el agente de programacion pi, orientado a tareas de ingenieria de software y uso de terminal. Esta build concreta, publicada por netprojects, fusiona el adaptador en los pesos base, anade el codificador de vision y la capa MTP original de Qwen, y cuantiza las capas lineales a 4 bits afines con grupo 64, dejando un repositorio de 16,3 GB.

El modelo resuelve el problema de ejecutar un agente de codificacion capaz en hardware de consumo Apple: al estar en MLX 4-bit cabe en Macs con memoria unificada moderada, manteniendo el 95,6% de coincidencia en el siguiente token respecto a bf16 y una divergencia KL de 0,0201. Es relevante ahora porque demuestra que un ajuste por RL sobre un modelo de 27B puede mejorar drasticamente el rendimiento agéntico sin aumentar el tamano: segun el autor del adaptador, Terminal-Bench 2.1 pasa del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7%, con entre un 55% y un 64% menos de llamadas a herramientas por tarea.

La ficha cubre la build 4-bit, la mas pequena de la familia (frente a 6-bit de 23,1 GB, 8-bit de 30,0 GB y bf16 de 55,6 GB), pensada para despliegue local en Apple Silicon con mlx-lm y mlx-vlm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5) con 16 capas de atencion completa y 64 capas totales; incluye capa MTP (multi-token prediction) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit afines (affine), grupo 64, sobre capas lineales; repositorio de 16,3 GB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento
La base es Qwen3.8-27B, un transformer denso de 27,78B parametros con 64 capas, de las cuales 16 son de atencion completa; el resto emplea otro mecanismo de atencion no detallado en la informacion disponible. Incluye un codificador de vision (pipeline image-text-to-text) y una capa de prediccion multi-token (MTP) propia de Qwen, conservada en esta build cuantizada y utilizable como modelo borrador para decodificacion especulativa. El adaptador LoRA de harness-hub se entreno con aprendizaje por refuerzo mediante AsyncGRPO en TRL sobre tareas de ingenieria de software y terminal, y se fusiono en los pesos base con la formula `W + 2.0 · B @ A` redondeada a bf16; el autor verifico los 256 modulos adaptados (q, k, v, o en las 16 capas de atencion completa; gate, up, down en las 64 capas) elemento a elemento contra un calculo independiente en float64.

La cuantizacion MLX se realizo con mlx-vlm, incluyendo codificador de vision y capa MTP. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y formato de tool calls que Qwen3.8-27B (XML `<tool_call><function=...><parameter=...>`). El adaptador se entreno y evaluo con el modo thinking desactivado y con la API Chat Completions, no con la Responses API. La build 4-bit conserva el 95,6% de coincidencia en el siguiente token respecto a bf16, con KL de 0,0201.

## Capacidades
- Generacion de texto y razonamiento general sobre la base Qwen3.8-27B.
- Generacion y reparacion de codigo, con especial enfasis en tareas de ingenieria de software (SWE-bench Pro) y uso de terminal (Terminal-Bench).
- Comprension de imagenes: pipeline image-text-to-text, util para interpretar capturas de pantalla de terminal o errores visuales.
- Tool calling en formato XML de Qwen, que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Comportamiento agentico multi-paso: el adaptador reduce llamadas a herramientas por tarea entre un 55% y un 64%.
- Decodificacion especulativa mediante la capa MTP integrada (hasta ~1,8x mas rapida en esta build) o con el drafter DSpine.
- Modo thinking disponible pero desaconsejado: el adaptador se entreno y evaluo con thinking off.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Agente de codificacion local en macOS: servir el modelo con `mlx_lm.server` y conectarlo al agente pi mediante `~/.pi/agent/models.json` con `api: openai-completions`; permite depurar tests fallidos o corregir bugs desde la terminal sin enviar codigo a la nube.
- Reparacion de bugs en repositorios reales: el ajuste por RL sobre SWE-bench Pro (29,4% a 62,7%) lo hace adecuado para tareas de parcheo multi-archivo con menos iteraciones de herramienta.
- Automatizacion de terminal: con Terminal-Bench 2.1 al 55,8%, puede encadenar comandos, leer salidas y corregir errores en flujos de shell.
- Analisis de capturas de pantalla: usando mlx-vlm con `--image`, puede interpretar el error mostrado en una terminal o en una interfaz y proponer la correccion.
- Asistente de CI/CD local: integrado como servidor compatible con OpenAI, puede generar parches y revisiones en pipelines que corren en un Mac de desarrollo.
- Prototipado de agentes con bajo coste de hardware: la build 4-bit de 16,3 GB permite experimentar con un agente de 27B en un MacBook con memoria unificada, sin GPU dedicada.
- Decodificacion acelerada en produccion local: activar MTP como draft model (`--draft-kind mtp`) para casi duplicar el throughput (33 a 61 tok/s) sin descarga adicional.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub), bajo pi y con thinking off:

| Benchmark | Base Qwen3.8-27B | Con adaptador pi | Mejora |
|---|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% | +16,3 puntos |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% | +33,3 puntos |
| Llamadas a herramientas por tarea | referencia | 55-64% menos | reduccion |

Fidelidad de la cuantizacion respecto a bf16:

| Build | Tamano | Coincidencia siguiente token | KL vs bf16 |
|---|---|---|---|
| MLX-6bit (recomendada) | 23,1 GB | 99,0% | 0,0015 |
| MLX-8bit | 30,0 GB | 99,1% | 0,0004 |
| MLX-4bit (esta ficha) | 16,3 GB | 95,6% | 0,0201 |
| MLX-bf16 | 55,6 GB | referencia | referencia |

Throughput medido en MacBook Pro M5 Max (128 GB), greedy, thinking off, 5 prompts x 256 tokens (GSM8K, MATH-500, HumanEval, MBPP, MT-Bench), con otros servicios en ejecucion:

| Build | Sin especulacion | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4-bit, bloque 5) |
|---|---|---|---|
| 4-bit | 33 tok/s | 61 tok/s (x1,84) | 70 tok/s (x2,25) |
| 6-bit | 23 tok/s | 22 tok/s (x0,96) | 52 tok/s (x2,32) |
| 8-bit | 18 tok/s | 41 tok/s (x2,24) | 54 tok/s (x3,05) |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware
- Memoria: el repositorio pesa 16,3 GB; se necesita memoria unificada suficiente para pesos mas cache KV. Un Mac con 32 GB es el minimo practico; 64 GB o mas da margen para contexto largo y vision.
- Hardware objetivo: Apple Silicon (MLX). Verificado en MacBook Pro M5 Max de 128 GB con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por esta build MLX; para CUDA habria que usar los pesos originales de Qwen3.8-27B.
- Despliegue: `mlx_lm.server` (servidor compatible con OpenAI), mlx-lm para texto, mlx-vlm para imagen y decodificacion especulativa con MTP o DSpine.
- Throughput: 33 tok/s en 4-bit sin especulacion; 61 tok/s con MTP; 70 tok/s con DSpine v0.2.1 en el hardware de referencia.
- Requisitos de version: mlx-lm >= 0.32.2, mlx-vlm >= 0.7.11.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | 27,78B | no disponible | MLX 4-bit | Apache 2.0 | Agente de codigo local en Apple Silicon |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,78B | no disponible | MLX 6-bit | Apache 2.0 | Misma familia, mayor fidelidad (99,0%) |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit | 27,78B | no disponible | MLX 8-bit | Apache 2.0 | Casi bf16 (99,1%), 30,0 GB |
| Qwen/Qwen3.8-27B (base) | 27,78B | no disponible | bf16 y otras | Apache 2.0 | Modelo general sin ajuste agentico |

Frente a la base sin adaptar, esta build mejora Terminal-Bench 2.1 y SWE-bench Pro con menos llamadas a herramientas, a costa de una perdida de fidelidad del 4,4% en el siguiente token por la cuantizacion 4-bit. La 6-bit es la opcion recomendada por el autor para equilibrio tamano/fidelidad; la 4-bit prioriza el menor consumo de memoria.

## Limitaciones y advertencias
- La cuantizacion 4-bit reduce la coincidencia del siguiente token al 95,6% y eleva la KL a 0,0201; en respuestas largas puede divergir del bf16.
- El adaptador se entreno y evaluo con thinking off y con la API Chat Completions; usar thinking o la Responses API puede degradar el comportamiento esperado.
- El ajuste esta especializado en tareas de agente de codigo y terminal; su rendimiento en dominios generales puede no superar al modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el tokenizador es el de Qwen3.8-27B, pero no se documenta cobertura linguistica para este adaptador.
- Solo funciona en Apple Silicon con MLX; no es desplegable en CUDA sin conversion adicional.
- Con decodificacion especulativa y greedy, el texto coincide con la decodificacion plana hasta un empate cercano, donde la comprobacion por lotes puede redondear al otro lado; respuestas largas pueden divergir ligeramente.
- Las mediciones de throughput se tomaron con otros servicios en ejecucion en el Mac; deben tratarse como indicativas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del adaptador original.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- Agente pi: https://github.com/earendil-works/pi
