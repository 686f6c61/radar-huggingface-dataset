# loom-fun/unsloth-Qwen3-8B-loom

## Resumen

Loom-fun/unsloth-Qwen3-8B-loom es un paquete de despliegue en formato Loom (ficheros `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `unsloth/Qwen3-8B-GGUF`, concretamente la cuantizacion `Qwen3-8B-Q4_K_M.gguf`. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado generado con el flujo de trabajo loom-skills sobre un equipo AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), pensado para servirse con el motor loom-serve sobre GPU AMD via ROCm.

El modelo subyacente es Qwen3-8B, un transformer denso de 8 mil millones de parametros desarrollado por Alibaba Qwen, con modo de razonamiento ("thinking") activado por defecto y soporte de tool calling. La contribucion de este paquete es el motor de inferencia: exponer una API compatible con OpenAI (`/v1/chat/completions`), decodificacion especulativa con un drafter DFlash (profundidad 7, activada por defecto) y kernels generados y validados contra implementaciones de referencia.

Es relevante ahora porque demuestra una ruta de despliegue de un LLM de 8B en hardware AMD consumer de gama alta (APU con memoria unificada) con verificacion formal de correctitud frente a llama.cpp, incluyendo puertas de prueba para tool calling, muestreo, decodificacion especulativa y needle-in-a-haystack. El paquete es muy reciente (creado el 2026-11-07) y no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B); paquete de despliegue para el motor Loom |
| Parametros totales | 8 mil millones (modelo base Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens por peticion (limite del servidor Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Qwen3-8B-Q4_K_M.gguf`) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer denso de 8B parametros. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens ni las etapas de alineacion (RLHF/DPO) del modelo base; esos datos deben consultarse en la model card de Qwen3-8B. El checkpoint utilizado es el GGUF Q4_K_M publicado por Unsloth, sin modificaciones.

La innovacion tecnica de este paquete reside en el motor Loom: kernels generados y verificados con 38 pruebas unitarias contra implementaciones de referencia, decodificacion especulativa con el drafter `AtomicChat/Qwen3-8B-DFlash-GGUF` a profundidad 7 (activa por defecto), y un conjunto de puertas de correctitud (`golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `needle`) que comparan la salida token a token con una referencia de llama.cpp sobre el mismo GGUF. El paquete se genero con el flujo loom-skills en un Ryzen AI Max+ 395 con graficos Radeon 8060S.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con bucle multi-turno validado por la puerta `agent`.
- Decodificacion especulativa DFlash (profundidad 7) activada por defecto, con salida identica a la decodificacion sin especulacion (puerta `spec`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con resultados consistentes respecto a ejecuciones aisladas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin soporte de entrada de imagen ni de audio.
- Sin soporte de "reasoning effort" (niveles de esfuerzo de razonamiento).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat compatible con OpenAI: el paquete expone `/v1/chat/completions` en `127.0.0.1:8080`, por lo que puede sustituir a un backend OpenAI en aplicaciones existentes sin cambiar el cliente.
- Agentes con tool calling: el bucle multi-turno de llamadas a herramientas esta validado contra llama.cpp (puerta `agent`), lo que permite construir asistentes que consulten APIs o bases de datos con historial reutilizado.
- Procesamiento de documentos largos: el prefill alcanza 1.378 tok/s con documentos de 1k tokens y 667,7 tok/s con 32k, adecuado para resumir o extraer informacion de contratos, informes o articulos extensos dentro de la ventana de 40.960 tokens.
- Razonamiento asistido por modo thinking: para tareas de analisis o matematicas donde interesa una cadena de razonamiento explicita, se deja el modo thinking activado; para respuestas de baja latencia, se desactiva por peticion.
- Despliegue en hardware AMD integrado: el paquete esta pensado para APUs Strix Halo con memoria unificada, lo que permite servir un 8B cuantizado en un equipo compacto sin GPU dedicada.
- Prototipado y evaluacion de motores de inferencia: las puertas de correctitud y la comparativa de rendimiento frente a llama.cpp lo convierten en una referencia util para medir motores alternativos sobre el mismo GGUF.
- Generacion de codigo y texto tecnico: hereda las capacidades del Qwen3-8B base, aunque la informacion proporcionada no incluye benchmarks especificos de codigo para este paquete.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0. Mismo GGUF en ambos motores; Loom con decodificacion especulativa DFlash activada.

| Metrica | llama.cpp | Loom | Diferencia | Roofline | Loom (% roofline) |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 52,9 | 59,2 | +12 % | 153,0 | 39 % |
| Decode tok/s, contexto 2k | 47,5 | 42,8 | -10 % | 144,0 | 30 % |
| Decode tok/s, contexto 32k | 28,0 | 5,8 | -79 % | 76,1 | 8 % |
| Prefill tok/s, documento 1k | 1.023,3 | 1.378,1 | +35 % | 4.158,9 | 33 % |
| Prefill tok/s, documento 2k | 921,2 | 1.426,9 | +55 % | 4.074,2 | 35 % |
| Prefill tok/s, documento 8k | 827,4 | 1.254,8 | +52 % | 3.630,6 | 35 % |
| Prefill tok/s, documento 16k | 629,3 | 1.024,8 | +63 % | 3.170,3 | 32 % |
| Prefill tok/s, documento 32k | 447,5 | 667,7 | +49 % | 2.529,1 | 26 % |
| 4 streams, decode agregado tok/s | 98,8 | 95,3 | -4 % | 569,0 | 17 % |
| Decodificacion especulativa, tokens aceptados | — | 33 % | — | n/a | n/a |

Notas: Loom mide en el cliente y llama.cpp en el servidor; valores de decode y prefill son media de 1-2 ejecuciones, y los de 4 streams, mediana de 1. El roofline se calcula para este GGUF en gfx1151 a 216 GB/s y 59 TFLOP/s, con un factor de 3,31 tokens por pasada de verificacion (1 + 33 % aceptados x profundidad 7), sin contar el coste del drafter. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el ejemplo de arranque reserva `--memory_bytes=28000000000` (28 GB) para el servidor; en una APU Strix Halo esta memoria es unificada, no VRAM dedicada.
- GPU recomendada: AMD Radeon 8060S integrada en Ryzen AI Max+ 395 (gfx1151), el unico dispositivo validado en la informacion disponible. Se arranca con `--device=amdgpu`.
- GPU consumer: cabe en APUs AMD Strix Halo con memoria unificada suficiente; no hay datos de ejecucion en GPUs NVIDIA o en GPUs AMD dedicadas.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve` para servir la API. No se documenta soporte de vLLM, llama.cpp (mas alla de la referencia de comparacion), Ollama o TGI para este paquete.
- Latencia y throughput: 59,2 tok/s en decode con prompt corto, 42,8 tok/s a 2k de contexto y 5,8 tok/s a 32k; 95,3 tok/s agregados con 4 streams. El prefill supera a llama.cpp entre un 35 % y un 63 %, mientras que el decode a 32k cae un 79 % frente a llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| loom-fun/unsloth-Qwen3-8B-loom | 8B denso | 40.960 tokens | GGUF Q4_K_M, motor Loom (ROCm) | no disponible | Decodificacion especulativa DFlash, API OpenAI, validado en Strix Halo |
| unsloth/Qwen3-8B-GGUF | 8B denso | el del modelo base | GGUF para llama.cpp y derivados | la del modelo base | Checkpoint de origen, sin empaquetado Loom |
| loom-fun/unsloth-Qwen3-Coder-30B-A3B-Instruct-loom | 30B totales (MoE) | no disponible | GGUF, motor Loom | no disponible | Variante orientada a codigo del mismo autor, mayor tamano |

La comparacion con alternativas de otros fabricantes (Llama 3.1 8B, Mistral 7B, Gemma 2 9B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete sin descargas ni likes y creado el mismo dia de su actualizacion: madurez y soporte comunitario no demostrados.
- Licencia no especificada en la informacion disponible; antes de uso comercial debe verificarse la licencia del modelo base Qwen3-8B y la del empaquetado.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del ingles o el chino sin evaluacion propia.
- La puerta `agent_think_off` (tool calling con thinking desactivado) no tiene evidencia registrada, y `needle_full` (needle-in-a-haystack a contexto completo) tampoco: el comportamiento en esos escenarios no esta validado.
- El decode a contexto largo es debil: 5,8 tok/s a 32k, un 79 % por debajo de llama.cpp, lo que desaconseja generaciones largas con contextos extensos.
- Solo 4 peticiones concurrentes y 4.096 tokens maximos de salida por peticion.
- Validado unicamente en AMD Ryzen AI Max+ 395 con Radeon 8060S; no hay evidencia en otras GPU ni en CPU.
- Sin soporte de vision ni audio, y sin control de esfuerzo de razonamiento.
- Riesgo de alucinacion y sesgos inherentes al modelo base Qwen3-8B; la informacion proporcionada no incluye evaluaciones de sesgo para este paquete.
- El rendimiento comparado mezcla medicion en cliente (Loom) y en servidor (llama.cpp), lo que introduce incertidumbre en las cifras.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/loom-fun/unsloth-Qwen3-8B-loom)
- [Modelo base GGUF: unsloth/Qwen3-8B-GGUF](https://huggingface.co/unsloth/Qwen3-8B-GGUF)
- [Modelo base: unsloth/Qwen3-8B](https://huggingface.co/unsloth/Qwen3-8B)
- [Drafter de decodificacion especulativa: AtomicChat/Qwen3-8B-DFlash-GGUF](https://huggingface.co/AtomicChat/Qwen3-8B-DFlash-GGUF)
- [Repositorio del sistema Loom (ROCm/hrx-system)](https://github.com/ROCm/hrx-system)
- [Flujo de trabajo loom-skills](https://github.com/loom-fun/loom-skills)
- [Ejecucion de referencia DevLab Dispatch 42316038259](https://github.com/loom-fun/loom-skills/actions/runs/42316038259)
- [Otro paquete del mismo autor: unsloth-Qwen3-Coder-30B-A3B-Instruct-loom](https://huggingface.co/loom-fun/unsloth-Qwen3-Coder-30B-A3B-Instruct-loom)
