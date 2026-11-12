# loom-fun/ggml-org-Laguna-XS-2.1-loom

## Resumen

Laguna-XS-2.1-loom es un paquete de despliegue en formato Loom (`.loom` y un `model.json`) generado por el usuario `loom-fun` a partir del checkpoint GGUF sin modificar `ggml-org/Laguna-XS-2.1-GGUF`, concretamente la cuantizacion `Laguna-XS-2.1-Q4_K_M.gguf`. No es un modelo nuevo ni un fine-tune de pesos: es un artefacto de empaquetado que permite servir el GGUF original con el runtime Loom (proyecto `hrx-system` de ROCm) sobre hardware AMD Strix Halo, en concreto el SoC Ryzen AI Max+ 395 con GPU integrada gfx1151. El paquete se genero con el flujo de trabajo `loom-skills`.

La relevancia del artefacto es de infraestructura, no de modelado: demuestra que el mismo GGUF puede ejecutarse en Loom con un servidor compatible con la API de OpenAI y obtener mejoras medibles frente a llama.cpp en el mismo hardware. Segun la model card, Loom alcanza 63,8 tok/s de decodificacion con prompt corto frente a 49,1 tok/s de llama.cpp (+30 %) y 41,7 tok/s a 32k de contexto frente a 15,6 tok/s (+167 %). En prefill, Loom duplica aproximadamente el throughput de llama.cpp (2014,8 frente a 946,0 tok/s con documento de 1k).

El modelo subyacente, Laguna-XS-2.1, se distribuye como GGUF Q4_K_M con una ventana de contexto declarada de 262.144 tokens por peticion, soporte de tool calling estilo OpenAI y un modo de razonamiento opcional desactivado por defecto. La ficha del paquete no aporta informacion sobre el desarrollador original del modelo, la composicion del dataset de entrenamiento ni los pesos en precision completa; toda la documentacion disponible se centra en el rendimiento del runtime y en las pruebas de correccion frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base distribuido unicamente como GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Laguna-XS-2.1-Q4_K_M.gguf`) empaquetado como Loom (`.loom` + `model.json`) |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) |
| Runtime | hrx-loom 0.1.0 (hrx-system `d01d1c1`) |
| API | `/v1/chat/completions` estilo OpenAI |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base Laguna-XS-2.1 (tipo de transformer, atencion, posible mezcla de expertos, numero de capas o dimensiones ocultas) ni sobre su proceso de entrenamiento (tokens vistos, composicion del corpus, fases de RLHF o DPO). El repositorio es un paquete de despliegue y no incluye model card del modelo original; la unica referencia es el checkpoint GGUF `ggml-org/Laguna-XS-2.1-GGUF`, del que este artefacto es una copia sin modificacion de pesos.

La innovacion tecnica documentada es del runtime, no del modelo. Loom genera kernels especificos para el GGUF y el dispositivo AMD, y la model card reporta que supera la linea base de llama.cpp ROCm (build `llamacpp-rocm/b1370`) y la de llama.cpp Vulkan (build `llamacpp-vulkan/b12211`) en decodificacion y prefill sobre el mismo checkpoint, con un 69-72 % de la cota roofline en decodificacion (calculada a 216 GB/s de ancho de banda y 59 TFLOP/s para gfx1151). A 32k de contexto la ventaja frente a llama.cpp ROCm llega al +167 %, lo que sugiere una gestion de cache KV mas eficiente en contextos largos. La decodificacion especulativa esta implementada pero desactivada en las mediciones.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el parametro `tools` y devuelve `tool_calls`; la prueba `agent` valida el bucle multi-turno con renderizado exacto del prompt y reutilizacion de historial.
- Modo de razonamiento (thinking) opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Ventana de contexto de 262.144 tokens por peticion, validada con pruebas needle-in-a-haystack hasta contexto completo.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de 4 peticiones con salida identica a la ejecucion aislada (prueba `consistency`).
- Decodificacion especulativa disponible en el runtime (desactivada por defecto).
- Sin soporte de imagen ni de audio (marcado como no aplicable en la model card).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local de un asistente conversacional en estaciones de trabajo con Ryzen AI Max+ 395: el paquete Loom permite servir el GGUF con `loom-serve` en `127.0.0.1:8080` y consumirlo desde cualquier cliente compatible con la API de OpenAI, sin necesidad de GPU dedicada.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto y un prefill de 1509,7 tok/s a 32k documentos, resulta viable resumir o extraer informacion de contratos, informes o bases de conocimiento extensas en una sola peticion.
- Agentes con tool calling en flujos multi-paso: el soporte de `tools`/`tool_calls` y la validacion del bucle de agente permiten construir asistentes que consultan APIs, ejecutan busquedas o encadenan acciones sobre datos internos.
- Razonamiento asistido con modo thinking: para tareas de analisis, planificacion o resolucion de problemas donde conviene activar `enable_thinking`, manteniendolo desactivado en el resto de peticiones para no penalizar latencia.
- Servicio de inferencia para equipos pequenos: con 4 peticiones concurrentes y salida determinista respecto a la ejecucion aislada, sirve como backend de prototipos y herramientas internas en una sola maquina.
- Evaluacion y benchmarking de runtimes alternativos: el paquete incluye la infraestructura de pruebas (`kernel_tests`, `golden`, `compare`, `agent`, `needle`) que permite reproducir la comparacion Loom frente a llama.cpp sobre el mismo GGUF y hardware.
- Integracion en pipelines de CI para validar despliegues: los gates de correccion documentados (69/69 tests de kernel, comparacion token a token con llama.cpp) permiten automatizar la verificacion de que un cambio de runtime no altera las salidas.

## Benchmarks y rendimiento

Rendimiento del runtime sobre el mismo GGUF Q4_K_M en AMD Ryzen AI Max+ 395 (Strix Halo), medido el 2026-11-11. Las columnas de llama.cpp ROCm y Loom comparten runner; la columna Vulkan se midio en otro runner, por lo que solo deben compararse ratios.

| Metrica | llama.cpp (ROCm) | Loom | Margen | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 49,1 | 63,8 | +30 % | 92,7 | 69 % | 60,6 |
| Decode tok/s, contexto 2k | 42,8 | 59,7 | +39 % | 87,3 | 68 % | 58,1 |
| Decode tok/s, contexto 32k | 15,6 | 41,7 | +167 % | 58,3 | 72 % | 42,8 |
| Prefill tok/s, documento 1k | 946,0 | 2014,8 | +113 % | 10055,9 | 20 % | 946,8 |
| Prefill tok/s, documento 2k | 947,0 | 2170,6 | +129 % | 9763,7 | 22 % | 963,4 |
| Prefill tok/s, documento 8k | 834,7 | 2068,7 | +148 % | 8397,6 | 25 % | 980,5 |
| Prefill tok/s, documento 16k | 746,0 | 1736,5 | +133 % | 7077,2 | 25 % | 876,5 |
| Prefill tok/s, documento 32k | 607,8 | 1509,7 | +148 % | 5384,2 | 28 % | 737,7 |
| 4 streams, decode agregado tok/s | 145,7 | 169,8 | +17 % | 204,0 | 83 % | 155,9 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a | n/a |

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores miden exclusivamente el rendimiento de inferencia del runtime.

## Requisitos de hardware

- VRAM/RAM unificada: la ejecucion de referencia usa `--memory_bytes=81000000000` (81 GB) sobre memoria unificada del Ryzen AI Max+ 395; no se especifica el consumo real del checkpoint Q4_K_M.
- GPU objetivo: AMD Radeon integrada gfx1151 del Ryzen AI Max+ 395 "Strix Halo". No se documenta compatibilidad con otras GPU AMD, NVIDIA o Apple Silicon.
- No cabe en GPU de consumo discretas convencionales segun la informacion disponible; el paquete esta disenado para el SoC Strix Halo con memoria unificada.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el `model.json` y `loom-serve --model=card3/model.json '--device=amdgpu://?completion_spin_ns=4294967295' --memory_bytes=81000000000`. Servidor en `127.0.0.1:8080`.
- Alternativa: el mismo GGUF funciona en llama.cpp (ROCm o Vulkan) con los argumentos documentados en la model card.
- Throughput estimado: 63,8 tok/s de decodificacion con prompt corto, 41,7 tok/s a 32k de contexto, 169,8 tok/s agregados con 4 streams y 2014,8 tok/s de prefill con documento de 1k.
- Latencia: no se publican cifras de time-to-first-token.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto ni rendimiento de modelos comparables de la misma categoria. La comparacion relevante que si documenta el repositorio es de runtimes sobre el mismo checkpoint:

| Aspecto | Loom (hrx-loom 0.1.0) | llama.cpp ROCm b1370 | llama.cpp Vulkan b12211 |
|---|---|---|---|
| Decode, prompt corto (tok/s) | 63,8 | 49,1 | 60,6 |
| Decode, 32k contexto (tok/s) | 41,7 | 15,6 | 42,8 |
| Prefill, 8k documento (tok/s) | 2068,7 | 834,7 | 980,5 |
| API OpenAI | Si | Si | Si |
| Decodificacion especulativa | Disponible, desactivada | Configurada (`ngram-simple`) | Configurada (`ngram-simple`) |
| Cache KV | Pool unificado | Pool unificado | 4 caches por slot |

## Limitaciones y advertencias

- El repositorio no incluye licencia declarada; no se puede asumir uso comercial sin verificar la licencia del modelo base `ggml-org/Laguna-XS-2.1-GGUF`.
- No hay informacion sobre sesgos, tasas de alucinacion ni calidad del modelo subyacente; no se han publicado evaluaciones de capacidad.
- Los idiomas soportados no estan documentados.
- El artefacto esta atado a hardware AMD Strix Halo (gfx1151); no se documenta funcionamiento en otras GPU.
- La comparacion con llama.cpp Vulkan se realizo en otro runner y con otra configuracion de cache KV, por lo que no es directamente comparable con las columnas ROCm/Loom.
- El modo de razonamiento esta desactivado por defecto; activarlo cambia el formato de salida y debe gestionarse en el cliente.
- Limite de 4.096 tokens de salida por peticion con el preset actual, muy por debajo de la ventana de contexto de entrada.
- La decodificacion especulativa esta implementada pero desactivada; su impacto en rendimiento no se ha medido.
- La model card esta truncada en el apartado de correccion: la nota 2 corta en "device AMD RYZEN AI MAX+ 395 w/ Rad", por lo que parte de la evidencia de los gates no es verificable en el texto disponible.
- El paquete registra 0 descargas y 0 likes, sin adopcion ni validacion externa conocida.
- Los resultados de busqueda web proporcionados corresponden a productos no relacionados (Loom de grabacion de pantalla, la marca de ropa Loom); no aportan informacion sobre el modelo.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/ggml-org-Laguna-XS-2.1-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Laguna-XS-2.1-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Run de benchmarks Loom vs llama.cpp (ROCm): https://github.com/loom-fun/loom-skills/actions/runs/43106368506
- Run de benchmarks llama.cpp Vulkan: https://github.com/loom-fun/loom-skills/actions/runs/42569157613/job/129002316937
- Run de tests de kernel: https://github.com/loom-fun/loom-skills/actions/runs/42517991086
- Run de gates de correccion: https://github.com/loom-fun/loom-skills/actions/runs/42516343229/job/128840122546
