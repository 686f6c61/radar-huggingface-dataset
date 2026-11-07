# loom-fun/unsloth-Qwen3.5-2B-loom

## Resumen

`loom-fun/unsloth-Qwen3.5-2B-loom` es un paquete de despliegue en formato `.loom` para el checkpoint GGUF `Qwen3.5-2B-Q4_K_M.gguf` de Unsloth, generado por el autor `loom-fun` mediante el flujo de trabajo `loom-skills`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del GGUF original sin modificar. Lo que aporta el paquete es un conjunto de programas `.loom` y una tarjeta `model.json` que permiten servir el modelo con `loom-serve` sobre GPU AMD, en concreto sobre un Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

El modelo base es Qwen3.5-2B, un modelo multimodal de tipo image-text-to-text con 2 000 millones de parametros, ventana de contexto de 262 144 tokens por peticion y soporte de razonamiento opcional (thinking mode). El paquete anade decodificacion especulativa por n-gram prompt lookup con profundidad 2, activada por defecto, y expone una API compatible con OpenAI en `/v1/chat/completions`.

Su relevancia es fundamentalmente practica: demuestra que un GGUF de 2B en cuantizacion Q4_K_M puede servirse en hardware AMD integrado con un rendimiento en decodificacion ligeramente superior al de llama.cpp (116,7 frente a 113,6 tok/s en prompt corto) y con un prefill inferior (3 394,6 frente a 4 135,9 tok/s en documento de 1k). Es un artefacto de infraestructura, no un modelo de proposito general nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-2B |
| Parametros totales | 2 000 millones (2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado); proyector de vision `mmproj-F16.gguf` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (empaquetado como programa `.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no modifica los pesos: reutiliza el checkpoint `Qwen3.5-2B-Q4_K_M.gguf` de Unsloth, de arquitectura transformer multimodal con proyector de vision independiente (`mmproj-F16.gguf`). La innovacion del paquete no esta en el modelo sino en el motor de inferencia: `loom-serve` genera kernels especificos para el dispositivo AMD y los valida contra implementaciones de referencia (47 de 47 tests de kernel superados).

Sobre el entrenamiento del modelo base no se aporta informacion en la documentacion disponible: no se detallan volumen de tokens, composicion del dataset ni si hubo RLHF o DPO. La unica innovacion tecnica documentada a nivel de serving es la decodificacion especulativa por n-gram prompt lookup con profundidad 2, activada por defecto, con una tasa de aceptacion de tokens redactados del 10 % en la sesion medida. El paquete incluye ademas una bateria de puertas de correccion (`golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `needle`) que comparan la salida con la referencia de llama.cpp sobre el mismo GGUF.

## Capacidades

- Generacion de texto y razonamiento con modo thinking opcional, desactivado por defecto y activable mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Entrada de imagenes en formato OpenAI `image_url`, con proyector `mmproj-F16.gguf`.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno validado en la puerta `agent`.
- Decodificacion especulativa n-gram prompt lookup, profundidad 2, activada por defecto.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con salida identica a la ejecucion aislada (puerta `consistency`).
- Contexto de 262 144 tokens por peticion, con needle-in-a-haystack validado hasta la mitad del contexto.
- Limite de 4 096 tokens de salida por peticion (preset `max_tokens`).
- No soporta audio ni ajuste de esfuerzo de razonamiento (`reasoning effort`).

## Casos de uso

- Servicio de chat multimodal en hardware AMD integrado: el paquete permite levantar un endpoint compatible con OpenAI en un Ryzen AI Max+ 395 con 9 GB de memoria asignada, adecuado para prototipos y despliegues de borde con entrada de imagen.
- Procesamiento de documentos largos: con 262 144 tokens de contexto y prefill sostenido de unos 3 000 tok/s hasta 16k, es viable resumir o extraer informacion de documentos extensos en una sola peticion.
- Agentes con tool calling: el bucle multi-turno validado en la puerta `agent` permite integrar el modelo en flujos de llamadas a funciones con historial reutilizado y renderizado exacto del prompt.
- Asistente con captura de pantalla: al aceptar `image_url` y razonamiento opcional, encaja en herramientas que describen o razonan sobre imagenes enviadas por el usuario.
- Servicio concurrente de baja latencia: con 4 peticiones simultaneas y 265,4 tok/s agregados en decodificacion, sirve para pequenos equipos o entornos de demostracion.
- Evaluacion y benchmarking de motores de inferencia: las puertas de correccion y la comparativa contra llama.cpp lo convierten en una referencia util para medir regresiones en el stack ROCm/Loom.
- Despliegue en entornos con recursos limitados: la cuantizacion Q4_K_M y los 9 GB de memoria configurados en el ejemplo de arranque permiten ejecutarlo en un equipo de sobremesa con GPU integrada.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Ubuntu 24.04, hrx-loom 0.1.0, mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 113,6 | 116,7 | +3 % | 204,1 | 57 % |
| Decode tok/s, contexto 2k | 107,6 | 115,1 | +7 % | 200,2 | 57 % |
| Decode tok/s, contexto 32k | 89,8 | 94,2 | +5 % | 155,9 | 60 % |
| Prefill tok/s, documento 1k | 4 135,9 | 3 394,6 | -18 % | 21 292,8 | 16 % |
| Prefill tok/s, documento 2k | 4 153,4 | 3 137,4 | -24 % | 21 105,6 | 15 % |
| Prefill tok/s, documento 8k | 4 029,1 | 3 064,8 | -24 % | 20 048,1 | 15 % |
| Prefill tok/s, documento 16k | 3 348,4 | 3 003,1 | -10 % | 18 792,6 | 16 % |
| Prefill tok/s, documento 32k | 2 736,8 | 2 669,7 | -2 % | 16 700,9 | 16 % |
| 4 streams, decode agregado tok/s | 284,3 | 265,4 | -7 % | 797,9 | 33 % |
| Decodificacion especulativa, tokens aceptados | no medido | 10 % | no aplica | no aplica | no aplica |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores miden rendimiento del motor, no capacidad del modelo.

## Requisitos de hardware

- VRAM/memoria: el ejemplo oficial arranca con `--memory_bytes=9000000000` (9 GB) para el Q4_K_M con proyector de vision en memoria unificada.
- GPU objetivo: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, "Strix Halo"), 216 GB/s de ancho de banda y 59 TFLOP/s segun el calculo de roofline.
- No se documenta compatibilidad con GPU NVIDIA ni con otras arquitecturas AMD distintas de gfx1151.
- Cabe en hardware de tipo APU con memoria unificada; no se indica soporte para GPU de consumo discretas.
- Despliegue: `loom-serve` con `--device=amdgpu`, previa materializacion con `loom-fetch`; requiere `pip install "hrx-loom[hf]"`.
- Latencia y throughput: 116,7 tok/s de decodificacion en prompt corto y 3 394,6 tok/s de prefill en documento de 1k, con 4 peticiones concurrentes agregando 265,4 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-fun/unsloth-Qwen3.5-2B-loom | 2B | 262 144 | 116,7 tok/s decode (Strix Halo); sin benchmarks de calidad | no disponible | Hugging Face, paquete `.loom` |
| unsloth/Qwen3.5-2B-GGUF (base) | 2B | 262 144 | 113,6 tok/s decode en llama.cpp (misma maquina) | no disponible | Hugging Face, GGUF |
| loom-fun/unsloth-Qwen3.5-4B-loom | 4B | no disponible | no disponible | no disponible | Hugging Face, paquete `.loom` |

La unica comparativa con datos medidos es contra el mismo GGUF servido con llama.cpp en el mismo equipo; no hay datos de calidad ni de otros modelos de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- El paquete no modifica los pesos: hereda todos los sesgos y limitaciones del modelo base Qwen3.5-2B, sobre los que no se aporta documentacion.
- Riesgo de alucinacion propio de un modelo de 2B en cuantizacion Q4_K_M; no se han publicado evaluaciones de fidelidad.
- La puerta `agent_think_off` (bucle de tool calling con thinking desactivado) no tiene evidencia de superacion, lo que deja sin validar ese modo de uso.
- La puerta `needle_full` no tiene evidencia: no esta confirmado que se sirva correctamente un needle-in-a-haystack con el contexto completo de 262 144 tokens.
- La tasa de aceptacion de la decodificacion especulativa fue del 10 % en la sesion medida, y el propio autor advierte que puede variar segun el texto.
- El prefill es entre un 10 % y un 24 % mas lento que llama.cpp en documentos de 1k a 16k, lo que penaliza cargas dominadas por prompts largos.
- Compatibilidad de hardware restringida a AMD gfx1151 segun la documentacion; no se indican otras GPU soportadas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Idioma: no se especifican los idiomas soportados.
- Limite de 4 096 tokens de salida por peticion y de 4 peticiones concurrentes, insuficiente para cargas de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3.5-2B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Variante de 4B del mismo autor: https://huggingface.co/loom-fun/unsloth-Qwen3.5-4B-loom
- Repositorio del motor Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42326829360
- Guia de fine-tuning de Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
