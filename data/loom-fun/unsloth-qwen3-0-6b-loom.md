# loom-fun/unsloth-Qwen3-0.6B-loom

## Resumen

`loom-fun/unsloth-Qwen3-0.6B-loom` es un paquete de despliegue para AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `unsloth/Qwen3-0.6B-GGUF` (concretamente `Qwen3-0.6B-Q4_K_M.gguf`) en forma de programas `.loom` y una tarjeta `model.json`, generados con el flujo de trabajo loom-skills sobre un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3 de Alibaba, en su variante mas pequena.

El interes del paquete no esta en el modelo en si, sino en el motor de inferencia: Loom, desarrollado por loom-fun sobre la pila ROCm/hrx-system, que sirve el mismo GGUF con una API compatible con OpenAI (`/v1/chat/completions`) y decodificacion especulativa n-gram activada por defecto. El autor publica comparativas frente a llama.cpp (build `llamacpp-rocm/b1369`) en el mismo hardware, con mejoras de entre el 23 % y el 175 % en distintas metricas de decodificacion y prefill.

Es relevante ahora porque demuestra una via de ejecucion de LLMs en GPUs integradas AMD con memoria unificada grande (hasta 17 GB reservados en el ejemplo de arranque), un segmento donde el soporte de motores maduros es limitado. El paquete incluye ademas una bateria de puertas de correccion (kernel_tests, golden, compare, consistency, spec, agent, needle, sampling) que documentan la equivalencia funcional con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), empaquetado como programas `.loom` sobre GGUF Q4_K_M |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) convertido a programas `.loom` + `weights.loom`; incluye `tokenizer.json` y `llm_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la generacion Qwen3 de Alibaba. La model card del paquete no aporta datos de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF/DPO); esa informacion corresponderia a la model card original de Qwen3, no incluida en la informacion proporcionada.

La innovacion del paquete es el motor Loom: los pesos GGUF se transforman en programas `.loom` especificos para el hardware, con kernels generados y verificados contra implementaciones de referencia (42/42 tests superados). El servidor implementa decodificacion especulativa mediante n-gram prompt lookup con profundidad 3, activada por defecto, y soporta 4 peticiones concurrentes. La configuracion de contexto se fija en 40.960 tokens por peticion y el maximo de tokens de salida en 4.096 mediante el preset `max_tokens`. El modo de razonamiento (thinking) esta activado por defecto y puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`; no hay soporte de "reasoning effort" graduado.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto (desactivable por peticion).
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno verificado por la puerta `agent`.
- Soporte de agentes y razonamiento multi-paso a traves del bucle de tool calling.
- API compatible con OpenAI en `/v1/chat/completions`, servida en `127.0.0.1:8080`.
- Decodificacion especulativa n-gram (profundidad 3) activada por defecto, con equivalencia de salida verificada frente a la version sin especulacion.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones con consistencia verificada (misma salida que en ejecucion aislada).
- Sin soporte de entrada de imagen ni de audio (entrada/salida).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio local de chat sobre GPU integrada AMD: el paquete arranca con `loom-serve --device=amdgpu --memory_bytes=17000000000` y expone una API compatible con OpenAI, adecuada para prototipos y asistentes en estacion de trabajo sin GPU dedicada.
- Automatizacion de agentes con tool calling: el soporte verificado de bucles multi-turno con renderizado exacto de prompts e historial permite construir agentes que invocan funciones externas en un equipo Strix Halo.
- Procesamiento de documentos largos: con 40.960 tokens de contexto y prefill de 14.616,8 tok/s en documentos de 1k (medido en el hardware de referencia), es viable resumir o extraer informacion de documentos de decenas de miles de tokens.
- Evaluacion y desarrollo de motores de inferencia: las puertas de correccion (golden, compare, spec, needle) lo convierten en una referencia util para validar nuevos kernels o comparar Loom frente a llama.cpp sobre el mismo GGUF.
- Servicio multiusuario ligero: con 4 peticiones concurrentes y 566,3 tok/s agregados en decodificacion (frente a 205,9 de llama.cpp), puede atender un pequeno equipo interno.
- Tareas de generacion corta con latencia baja: 321,2 tok/s en decodificacion con prompt corto hacen viable autocompletado, clasificacion o respuestas breves en tiempo real.
- Pruebas de recuperacion en contexto largo: la puerta `needle` valida needle-in-a-haystack hasta la mitad del contexto (20.480 tokens); util para evaluar la fiabilidad del modelo en tareas de retrieval antes de desplegarlo.

## Benchmarks y rendimiento

Rendimiento medido por el autor el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 26.04, hrx-loom 0.1.0. Mismo GGUF en ambos motores; llama.cpp con `-ngl 99 -cram 0 --spec-type ngram-simple -c 35024 -kvu -np 4`.

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 191,1 | 321,2 | +68 % | 624,1 | 51 % |
| Decode tok/s, contexto 2k | 116,7 | 242,0 | +107 % | 534,3 | 45 % |
| Decode tok/s, contexto 32k | 52,5 | 105,7 | +101 % | 143,7 | 74 % |
| Prefill tok/s, documento 1k | 6.849,0 | 14.616,8 | +113 % | 59.267,2 | 25 % |
| Prefill tok/s, documento 2k | 5.053,4 | 13.351,2 | +164 % | 53.144,5 | 25 % |
| Prefill tok/s, documento 8k | 3.980,5 | 7.437,4 | +87 % | 32.808,6 | 23 % |
| Prefill tok/s, documento 16k | 2.228,7 | 4.106,0 | +84 % | 21.724,6 | 19 % |
| Prefill tok/s, documento 32k | 1.315,0 | 1.623,1 | +23 % | 12.964,7 | 13 % |
| 4 streams, decode agregado tok/s | 205,9 | 566,3 | +175 % | 1.686,5 | 34 % |
| Speculative decoding, tokens aceptados | — | 10 % | — | n/a | n/a |

Notas del autor: Loom mide en cliente y llama.cpp en servidor; valores de decode y prefill son media de 1-2 ejecuciones, y 4 streams es mediana de 1. La aceptacion del drafter varia por sesion (4 % en decode corto, 18 % a 2k, 57 % a 32k; 10 % en la puerta `spec`). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el ejemplo de arranque reserva `--memory_bytes=17000000000` (17 GB) en memoria unificada; el GGUF Q4_K_M de 0,6B es mucho menor, por lo que la reserva cubre contexto y buffers.
- GPU de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), 216 GB/s de ancho de banda y 59 TFLOP/s segun el roofline del autor.
- GPU dedicadas: no se documentan pruebas en A100, H100 ni RTX 4090; el paquete esta orientado a `--device=amdgpu` via ROCm/hrx-system.
- Cabe en consumer GPU: si, en GPUs integradas AMD con memoria unificada; no hay datos para GPUs consumer NVIDIA.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve` como servidor. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete (llama.cpp solo aparece como referencia de comparacion).
- Latencia y throughput: 321,2 tok/s decode con prompt corto y 14.616,8 tok/s de prefill con documento de 1k en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Motor / formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-fun/unsloth-Qwen3-0.6B-loom | 0,6B | 40.960 | Loom (.loom), AMD gfx1151 | no disponible | Paquete de despliegue con spec decoding n-gram y puertas de correccion |
| unsloth/Qwen3-0.6B-GGUF | 0,6B | no disponible en la informacion | GGUF (llama.cpp y otros) | no disponible | Checkpoint de origen, sin modificaciones |
| loom-fun/unsloth-Qwen3-8B-loom | 8B | no disponible en la informacion | Loom (.loom) | no disponible | Variante mayor del mismo flujo de empaquetado |

La comparacion con modelos de otros fabricantes del mismo tamano (p. ej. Llama 3.2 1B, Gemma 3 1B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 0,6B parametros: capacidad de razonamiento y conocimiento factual limitados en comparacion con modelos mayores; riesgo elevado de alucinacion en tareas que requieren conocimiento especifico.
- Sin datos de benchmarks de calidad publicados en la informacion disponible; no se puede evaluar su rendimiento en MMLU, HumanEval o GSM8K.
- La puerta `needle_full` (needle-in-a-haystack a contexto completo) no tiene evidencia: solo se valida hasta la mitad del contexto (20.480 tokens).
- Limite de 4 peticiones concurrentes y 4.096 tokens de salida por peticion.
- Sin soporte de vision ni audio.
- Sin soporte de "reasoning effort" graduado; el modo thinking solo se activa o desactiva.
- Dependencia de hardware y software especificos: ROCm, hrx-system y GPU AMD gfx1151; no hay evidencia de funcionamiento en otras plataformas.
- Licencia no especificada en la informacion disponible: verificar los terminos del modelo base Qwen3 y del paquete antes de uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.
- Las metricas de rendimiento son del autor, con metodologia de medicion distinta entre motores (cliente vs servidor) y pocas repeticiones (1-2 ejecuciones).

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3-0.6B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Modelo base (formato original): https://huggingface.co/unsloth/Qwen3-0.6B
- Repositorio de Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Variante de 8B del mismo autor: https://huggingface.co/loom-fun/unsloth-Qwen3-8B-loom
