# loom-fun/bartowski-Qwen2.5-32B-Instruct-loom

## Resumen

`loom-fun/bartowski-Qwen2.5-32B-Instruct-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `Qwen2.5-32B-Instruct-Q4_K_M.gguf` de bartowski (a su vez derivado de Qwen2.5-32B-Instruct de Alibaba Qwen) en forma de programas `.loom` y una tarjeta `model.json`, generados con el flujo `loom-skills` sobre un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

El modelo subyacente es un transformer denso de Qwen2.5 con aproximadamente 33 000 millones de parametros, ajustado por instrucciones, con ventana de contexto nativa de 32 768 tokens en este empaquetado. La propuesta de valor del paquete es el motor: Loom implementa decodificacion especulativa por n-gram prompt lookup (profundidad 2) activada por defecto y expone una API compatible con OpenAI, con soporte de tool calling y hasta 4 peticiones concurrentes.

Es relevante para quienes despliegan modelos de 32B en hardware APU AMD sin GPU discreta: segun las mediciones del autor, Loom supera a llama.cpp en decodificacion con contexto largo (hasta +50 % a 32k tokens) y en prefill (hasta +85 % a 16k), aunque pierde rendimiento agregado en concurrencia de 4 flujos (-12 %). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), empaquetado como programas `.loom` sobre GGUF |
| Parametros totales | ~33 000 millones (modelo base Qwen2.5-32B-Instruct) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en `.loom` + `model.json` |
| Modelo base | bartowski/Qwen2.5-32B-Instruct-GGUF |
| Salida maxima | 4 096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Decodificacion especulativa | n-gram prompt lookup, profundidad 2, activada por defecto |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de la familia Qwen2.5, ajustado por instrucciones. No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas por Qwen; esos datos corresponden a la model card original de `Qwen/Qwen2.5-32B-Instruct`, no incluida aqui. El paquete Loom no modifica los pesos: reutiliza el GGUF Q4_K_M de bartowski tal cual.

La innovacion tecnica esta en el runtime. Loom genera kernels especificos para la APU (gfx1151) y aplica decodificacion especulativa mediante lookup de n-gramas sobre el propio prompt, con profundidad 2 y activada por defecto. La tasa de aceptacion de tokens redactados medida es del 11 % en la puerta `spec` y del 3-13 % en las sesiones de decodificacion segun contexto. La correccion se valida contra llama.cpp con puertas de test: kernels (37/37), salida greedy y top-5 log-probs, consistencia bajo concurrencia, equivalencia con y sin decodificacion especulativa, bucle de tool calling multi-turno y needle-in-a-haystack hasta la mitad del contexto.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno con contexto de hasta 32 768 tokens por peticion.
- Tool calling / function calling con formato OpenAI (`tools` y `tool_calls`), validado en bucle de agente multi-turno.
- Decodificacion especulativa n-gram activada por defecto, con salida identica a la decodificacion sin especulacion (puerta `spec` superada).
- Concurrencia de hasta 4 peticiones simultaneas con consistencia verificada frente a ejecuciones aisladas.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- API compatible con OpenAI para integracion directa en clientes existentes.
- Sin soporte de modo thinking/razonamiento explicito, sin entrada de imagen, sin audio de entrada o salida (marcados como no soportados en la model card).

## Casos de uso

- Asistente conversacional autohospedado en APU AMD: el paquete se sirve con `loom-serve` sobre un Ryzen AI Max+ 395 y responde con API OpenAI, lo que permite sustituir una dependencia de API en la nube por inferencia local en un equipo de escritorio o mini-PC.
- Procesamiento de documentos largos: con 32 768 tokens de contexto y un prefill de 173,9 tok/s a 32k documentos (frente a 115,7 de llama.cpp), es adecuado para resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Agentes con herramientas: el soporte validado de tool calling y el bucle de agente verificado permiten construir asistentes que consulten APIs, bases de datos o sistemas internos mediante function calling.
- Generacion de codigo asistida: el modelo base Qwen2.5-32B-Instruct es un modelo de instrucciones generalista con capacidad de codigo; el paquete lo expone via API para integrarlo en editores o pipelines internos.
- Atencion al cliente automatizada: las 4 peticiones concurrentes y el contexto largo permiten gestionar varias conversaciones simultaneas con historial extenso en un solo nodo.
- Prototipado y evaluacion de motores de inferencia: al ser un paquete reproducible con puertas de correccion documentadas, sirve para comparar Loom frente a llama.cpp en el mismo GGUF y hardware.
- Despliegue en entornos con restricciones de red o privacidad: la inferencia local evita enviar datos a terceros, siempre que la licencia del modelo base lo permita (no confirmada en esta ficha).

## Benchmarks y rendimiento

Rendimiento del motor medido por el autor el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0, mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 11,1 | 11,8 | +6 % | 11,8 | 100 % |
| Decode tok/s, contexto 2k | 8,6 | 12,6 | +47 % | 13,6 | 93 % |
| Decode tok/s, contexto 32k | 4,2 | 6,3 | +50 % | 9,1 | 69 % |
| Prefill tok/s, documento 1k | 283,7 | 396,4 | +40 % | 935,5 | 42 % |
| Prefill tok/s, documento 2k | 246,6 | 404,4 | +64 % | 925,9 | 44 % |
| Prefill tok/s, documento 8k | 219,7 | 361,4 | +64 % | 872,1 | 41 % |
| Prefill tok/s, documento 16k | 165,2 | 306,0 | +85 % | 809,4 | 38 % |
| Prefill tok/s, documento 32k | 115,7 | 173,9 | +50 % | 707,6 | 25 % |
| 4 flujos, decode agregado tok/s | 34,7 | 30,7 | -12 % | 52,6 | 58 % |
| Decodificacion especulativa, tokens aceptados | no medido | 11 % | n/a | n/a | n/a |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K) en la informacion disponible; las cifras anteriores miden rendimiento del motor, no capacidad del modelo.

## Requisitos de hardware

- VRAM/memoria unificada: el comando de ejemplo reserva 49 000 000 000 bytes (~49 GB) con `--memory_bytes`, coherente con un Q4_K_M de ~33B mas overhead del runtime.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), memoria unificada a 216 GB/s y 59 TFLOP/s. No hay datos de funcionamiento en GPU discretas NVIDIA ni en otras APU.
- GPU de consumo: no cabe en GPU de consumo con VRAM discreta tipica (8-24 GB) a Q4_K_M; requiere memoria unificada de gran capacidad o GPU profesional con 48 GB o mas (A100 80GB, H100, etc.), si bien no se ha validado en estas.
- Despliegue: `hrx-loom` (`pip install "hrx-loom[hf]"`), `loom-fetch` para materializar el paquete y `loom-serve --device=amdgpu`. Tambien existe el GGUF original para llama.cpp, vLLM u Ollama, aunque las mediciones de esta ficha son de Loom frente a llama.cpp.
- Latencia y throughput: ver tabla de benchmarks; en decodificacion corta ~11,8 tok/s y en prefill de 8k ~361 tok/s en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct (este paquete, Loom) | ~33B | 32 768 | no disponible | Hugging Face (0 descargas) | Motor Loom, API OpenAI, spec decoding n-gram |
| bartowski/Qwen2.5-32B-Instruct-GGUF | ~33B | depende del runtime | no disponible | Hugging Face | Mismo GGUF sin empaquetar; base de este paquete |
| Qwen/Qwen2.5-32B-Instruct | ~33B | 32 768 (nativo del modelo) | no disponible en esta ficha | Hugging Face | Pesos originales en safetensors |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento del modelo frente a alternativas de la misma categoria; la comparativa anterior se limita a parametros, contexto y disponibilidad.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-11-07): es material experimental sin validacion de la comunidad.
- La licencia no esta disponible en la informacion proporcionada; antes de uso comercial debe verificarse la licencia de Qwen2.5-32B-Instruct y la del GGUF de bartowski.
- La puerta `needle_full` (needle-in-a-haystack a contexto completo) no tiene evidencia; solo se valido hasta la mitad del contexto.
- Sin soporte de modo thinking, vision ni audio; no es apto para tareas multimodales.
- La decodificacion especulativa tiene una tasa de aceptacion baja (3-13 % en decodificacion, 11 % en la puerta `spec`), por lo que la ganancia real depende del prompt.
- En concurrencia de 4 flujos el rendimiento agregado cae un 12 % frente a llama.cpp.
- Las mediciones son de una sola ejecucion por valor en decode/prefill (media) y una mediana en 4 flujos; no hay intervalos de confianza ni repeticiones multiples.
- Solo se ha validado en AMD Ryzen AI Max+ 395 (gfx1151); el comportamiento en otro hardware AMD no esta documentado.
- Riesgo de alucinacion y sesgos del modelo base: no hay informacion especifica en la documentacion proporcionada; aplican los del Qwen2.5-32B-Instruct original.
- Idioma: no se documentan los idiomas soportados en este empaquetado.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun/bartowski-Qwen2.5-32B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2.5-32B-Instruct-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch run 42342192972): https://github.com/loom-fun/loom-skills/actions/runs/42342192972
