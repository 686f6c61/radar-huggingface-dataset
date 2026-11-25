# loom-fun-staging/prism-ml-Ternary-Bonsai-2.5-27B-loom

## Resumen

Prism-ml Ternary-Bonsai-2.5-27B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Ternary-Bonsai-2.5-27B-Q2_0-mtp.gguf`, publicado originalmente por `prism-ml`. El autor del paquete es `loom-fun-staging`, que lo genera con el flujo de trabajo `loom-skills` sobre un equipo AMD Ryzen AI Max+ 395 "Strix Halo", un APU con GPU Radeon 8060S integrada.

El modelo base es un transformer de 27.000 millones de parametros cuantizado a ternario (esquema Q2_0), lo que reduce drasticamente el peso en memoria a costa de precision. El paquete Loom no altera los pesos: aporta kernels generados y una configuracion de servicio con API compatible con OpenAI, soporte de tool calling, modo de razonamiento configurable y ventana de contexto de 262.144 tokens por peticion.

Su relevancia es doble: por un lado, demuestra la viabilidad de servir un modelo de 27B cuantizado a ternario en hardware de consumo AMD (APU Strix Halo) con un motor alternativo a llama.cpp; por otro, publica una comparativa medida frente a llama.cpp ROCm con margenes concretos tanto en decodificacion como en prefill. La licencia es MIT y el paquete esta pensado para el ecosistema Loom (`hrx-loom` 0.3.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 27B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Ternaria Q2_0 (checkpoint `Q2_0-mtp.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) + paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27B cuantizado a ternario con el esquema Q2_0, empaquetado en GGUF con soporte de decodificacion especulativa MTP (multi-token prediction). El paquete Loom incluye kernels generados y verificados contra implementaciones de referencia (113/113 tests de kernel superados) y se sirve mediante `loom-serve` con backend `amdgpu://`, pool de memoria fijo (`--pool_backing=fixed`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), que es la configuracion usada en las mediciones de rendimiento.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO en el modelo original. La validacion de correctitud del paquete incluye pruebas golden contra llama.cpp sobre el mismo GGUF (tokens greedy y log-probs top-5 en prompts cortos y documentos de 1k a 32k tokens), comparacion token a token con divergencias solo en empates cercanos, consistencia bajo concurrencia y un bucle de tool calling multi-turno con renderizado exacto del prompt.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores low, medium y xhigh (por defecto xhigh).
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`).
- Agentes multi-turno: el gate `agent` valida renderizado exacto del prompt, reutilizacion de historial y validez de las llamadas a herramientas.
- Decodificacion especulativa disponible (MTP), desactivada por defecto en el preset.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultaneas.
- Entrada de imagen: no soportada por Loom, aunque el modelo original la soporta.
- Audio: no aplicable.

## Casos de uso

- Servicio local de chat en APU AMD Strix Halo: el paquete esta calibrado para un Ryzen AI Max+ 395 con GPU Radeon 8060S, de modo que se puede desplegar un endpoint `/v1/chat/completions` en un equipo de sobremesa sin GPU dedicada, con 262.144 tokens de contexto por peticion.
- Procesamiento de documentos largos: el prefill medido escala bien hasta 32k tokens (305,6 tok/s frente a 244,0 de llama.cpp, +25 %), lo que lo hace adecuado para resumir o extraer informacion de contratos, informes o expedientes extensos en una sola pasada.
- Agentes con herramientas: el soporte validado de tool calling y el gate `agent` permiten construir asistentes que consulten APIs, bases de datos o sistemas internos en bucles multi-turno con historial reutilizado.
- Razonamiento con esfuerzo configurable: para tareas de analisis o matematicas se puede fijar `reasoning_effort` en xhigh, y bajarlo a low para respuestas rapidas en tareas simples, ajustando el coste computacional.
- Atencion al cliente automatizada: con 4 peticiones concurrentes y contexto de 262k tokens, puede gestionar varias conversaciones simultaneas manteniendo historial largo por sesion.
- Integracion en pipelines de desarrollo: al exponer una API compatible con OpenAI, se puede conectar a clientes y frameworks existentes (SDKs, orquestadores de agentes) sin adaptadores propietarios, usando el comando `loom-fetch` para obtener el paquete y `loom-serve` para servirlo.
- Evaluacion de motores de inferencia alternativos: util para equipos que quieran comparar Loom frente a llama.cpp ROCm en el mismo hardware y el mismo GGUF, con datos de rendimiento publicados y reproducibles.

## Benchmarks y rendimiento

Rendimiento medido en un AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.3.0, frente a llama.cpp ROCm `llamacpp-rocm/b1387` con el mismo GGUF y los mismos prompts:

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 34,1 | 26,0 | -24 % |
| Decode tok/s, contexto 2k | 33,0 | 25,1 | -24 % |
| Decode tok/s, contexto 32k | 28,4 | 19,7 | -31 % |
| Prefill tok/s, documento 1k | 322,4 | 338,7 | +5 % |
| Prefill tok/s, documento 2k | 318,2 | 340,9 | +7 % |
| Prefill tok/s, documento 8k | 314,2 | 338,2 | +8 % |
| Prefill tok/s, documento 16k | 282,9 | 326,6 | +15 % |
| Prefill tok/s, documento 32k | 244,0 | 305,6 | +25 % |
| 4 streams, decode agregado tok/s | 62,7 | 82,8 | +32 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Notas metodologicas: en las filas de un solo stream, Loom se sirve sin drafting y llama.cpp con MTP n-max 3, por lo que la eleccion no es identica entre motores; en las 4 streams ambos van sin drafting. Los valores son la mediana de 1-2 sesiones (4 streams: mediana de 1). Loom se cronometra desde el cliente y llama.cpp desde su servidor. Un margen dentro de +-3 % se considera empate. No se calcularon cifras de roofline. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es una cuantizacion ternaria Q2_0 de 27B, lo que reduce el peso muy por debajo de un modelo de 27B en FP16, pero no se publica la cifra exacta de memoria residente.
- GPU de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (APU Strix Halo), unica plataforma validada en la documentacion.
- GPU dedicadas (A100, H100, RTX 4090): no documentadas para este paquete; el backend de servicio es `amdgpu://`.
- Cabe en GPU de consumo: si, segun la validacion sobre la APU Strix Halo; no hay datos para GPUs de consumo discretas.
- Despliegue: `hrx-loom[hf]==0.3.0` (instalable con `pipx`), `loom-fetch` para descargar el paquete y `loom-serve` para servirlo; backend `amdgpu://` con `--pool_backing=fixed` y `completion_spin_ns=4294967295`.
- Latencia y throughput: 26,0 tok/s de decode en prompt corto, 19,7 tok/s a 32k de contexto, 338,7 tok/s de prefill a 1k y 82,8 tok/s de decode agregado con 4 streams.
- Memoria: el pool se reserva por adelantado con `--pool_backing=fixed`; el tamano del preset no se detalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B (Loom) | 27B | 262.144 | 26,0 tok/s decode corto; 338,7 tok/s prefill 1k; 82,8 tok/s 4 streams | MIT | Paquete Loom en Hugging Face |
| Ternary-Bonsai-2.5-27B (llama.cpp ROCm) | 27B | 35.024 (configuracion usada: `-c 35024`) | 34,1 tok/s decode corto; 322,4 tok/s prefill 1k; 62,7 tok/s 4 streams | MIT | GGUF en Hugging Face |
| Otros modelos de 27B cuantizados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa disponible es entre los dos motores de inferencia sobre el mismo checkpoint; no se han proporcionado datos de modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion ternaria Q2_0 degrada la precision respecto al modelo en precision completa; no se publican evaluaciones de calidad que cuantifiquen esa perdida.
- La decodificacion es entre un 24 % y un 31 % mas lenta que llama.cpp ROCm en un solo stream; la ventaja de Loom esta en prefill (+5 % a +25 %) y en concurrencia (+32 % con 4 streams).
- El contexto maximo del paquete es de 262.144 tokens, pero las mediciones de llama.cpp se hicieron con `-c 35024`; no hay datos de rendimiento de Loom mas alla de 32k.
- La entrada de imagen no esta soportada por Loom aunque el modelo original la soporte; no se debe asumir capacidad multimodal en este despliegue.
- Solo se valida sobre AMD Strix Halo con backend `amdgpu://`; no hay soporte documentado para NVIDIA, CUDA ni otras GPUs.
- La decodificacion especulativa esta disponible pero desactivada por defecto y su gate de correctitud figura como no aplicable; no hay mediciones de su impacto.
- Maximo de 4.096 tokens de salida por peticion (preset `max_tokens`) y 4 peticiones concurrentes.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion del modelo base.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta y esta alojado en un espacio de "staging", lo que sugiere que no es una publicacion estable.
- La licencia MIT del paquete no exime de verificar la licencia y condiciones del modelo base `prism-ml/Ternary-Bonsai-2.5-27B-GGUF` para uso comercial.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/prism-ml-Ternary-Bonsai-2.5-27B-loom
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/45535242750
