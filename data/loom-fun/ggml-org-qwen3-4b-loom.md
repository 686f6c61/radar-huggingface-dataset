# loom-fun/ggml-org-Qwen3-4B-loom

## Resumen

Qwen3-4B-loom es un paquete de despliegue para el checkpoint GGUF `Qwen3-4B-Q4_K_M.gguf` de Qwen3-4B, empaquetado por el autor `loom-fun` para el motor de inferencia Loom (parte del proyecto ROCm/hrx-system). No se trata de un modelo nuevo ni de un fine-tune de pesos: los pesos son los originales de `ggml-org/Qwen3-4B-GGUF` sin modificar. Lo que aporta el repositorio es un formato `.loom` (programas compilados y una tarjeta `model.json`) que permite servir el modelo en hardware AMD, concretamente en la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151).

El modelo subyacente, Qwen3-4B, es un transformer denso de 4.000 millones de parametros de la familia Qwen3, orientado a comprension y generacion de lenguaje, codigo y matematicas, con soporte multilingue y modo de razonamiento («thinking») activable. El paquete Loom anade decodificacion especulativa con un drafter DFlash, servidor compatible con la API de OpenAI y soporte de tool calling.

La relevancia de este repositorio es practica: documenta el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF en una APU AMD, con mejoras de hasta el +126 % en prefill y del +37 % en decodificacion con prompt corto, aunque con una caida del −34 % en decodificacion a 32k de contexto. Es material de evaluacion para quien quiera desplegar Qwen3-4B en hardware Strix Halo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B); empaquetado para el motor Loom |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens por peticion (segun la tarjeta Loom); contexto nativo de Qwen3-4B no disponible en la informacion |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado); otras cuantizaciones del base no disponibles |
| Idiomas soportados | no disponible en la informacion proporcionada (Qwen3-4B es multilingue segun Qualcomm AI Hub) |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de 4.000 millones de parametros. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; la ficha de Qualcomm AI Hub lo describe como modelo multilingue de proposito general con buen rendimiento en comprension, generacion, codigo y matematicas. El checkpoint empaquetado es la cuantizacion Q4_K_M publicada por `ggml-org`, sin modificacion de pesos.

La innovacion del repositorio esta en el runtime, no en el modelo: Loom genera kernels especificos para el hardware y usa decodificacion especulativa con un drafter DFlash (`AtomicChat/Qwen3-4B-DFlash-GGUF`, Q8_0) a profundidad 3, activada por defecto. La tarjeta reporta una tasa de aceptacion de tokens redactados del 56 % en la puerta `spec`, y del 31 % (prompt corto), 36 % (2k) y 22 % (32k) en las sesiones de decodificacion. El servidor expone `/v1/chat/completions` compatible con OpenAI, admite 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por defecto.

## Capacidades

- Generacion de texto y razonamiento: modo «thinking» activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI: campos `tools` y `tool_calls` en la API.
- Bucles de agente multi-turno con reutilizacion de historial y renderizado exacto del prompt (validado por la puerta `agent`).
- Decodificacion especulativa DFlash integrada, activa por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con salida identica a la ejecucion aislada (puerta `consistency`).
- Contexto de hasta 40.960 tokens por peticion, con rechazo de prompts que exceden la capacidad.
- Sin soporte de imagen ni de audio (no aplicable en las puertas `vision`).
- Sin soporte de «reasoning effort» (no implementado).

## Casos de uso

- Servicio local de chat sobre APU AMD: desplegar `loom-serve --device=amdgpu --memory_bytes=25000000000` ofrece un endpoint compatible con OpenAI en `127.0.0.1:8080`, adecuado para prototipos y estaciones de trabajo con Ryzen AI Max+ 395 sin GPU dedicada.
- Procesamiento de documentos largos: el prefill a 16k y 32k alcanza 1.727,7 y 980,7 tok/s respectivamente, mas del doble que llama.cpp en la misma maquina, lo que lo hace util para resumir o extraer informacion de documentos extensos dentro de la ventana de 40.960 tokens.
- Agentes con herramientas: el soporte validado de `tool_calls` y de bucles multi-turno permite construir asistentes que consultan APIs o bases de datos, con la puerta `agent` verificando el renderizado exacto del prompt y la validez de las llamadas.
- Generacion de codigo asistida: Qwen3-4B esta orientado a tareas de codigo; el paquete se puede integrar en editores o pipelines internos mediante la API compatible con OpenAI, con modo thinking para razonamiento paso a paso.
- Evaluacion comparativa de motores de inferencia: el repositorio incluye mediciones reproducibles frente a llama.cpp (build `llamacpp-rocm/b1370`) sobre el mismo GGUF, util para decidir el runtime en hardware Strix Halo.
- Atencion al cliente automatizada en local: con 4 peticiones concurrentes y 223,1 tok/s agregados en decodificacion a 4 flujos, puede atender varias conversaciones simultaneas manteniendo los datos en la maquina.
- Razonamiento con presupuesto de latencia ajustado: con prompt corto, la decodificacion alcanza 98,6 tok/s frente a 71,9 de llama.cpp, adecuado para asistentes interactivos donde prima el tiempo por token.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 26.04, hrx-loom 0.1.0, sobre el mismo GGUF en ambos motores (tok/s):

| Metrica | llama.cpp | Loom | Margen | Techo roofline | % de roofline |
|---|---|---|---|---|---|
| Decodificacion, prompt corto | 71,9 | 98,6 | +37 % | 167,3 | 59 % |
| Decodificacion, contexto 2k | 68,4 | 82,5 | +21 % | 162,2 | 51 % |
| Decodificacion, contexto 32k | 35,7 | 23,4 | −34 % | 49,6 | 47 % |
| Prefill, documento 1k | 1.562,2 | 2.866,9 | +84 % | 7.802,6 | 37 % |
| Prefill, documento 2k | 1.336,0 | 2.919,8 | +119 % | 7.509,7 | 39 % |
| Prefill, documento 8k | 1.134,6 | 2.377,5 | +110 % | 6.129,3 | 39 % |
| Prefill, documento 16k | 764,7 | 1.727,7 | +126 % | 4.922,7 | 35 % |
| Prefill, documento 32k | 479,4 | 980,7 | +105 % | 3.532,1 | 28 % |
| 4 flujos, decodificacion agregada | 119,2 | 223,1 | +87 % | 813,8 | 27 % |
| Tokens redactados aceptados (especulativa) | — | 56 % | — | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Las puertas de correccion reportan: `kernel_tests` 43/43, `golden`, `compare`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling` y `needle` como superadas; `needle_full` sin evidencia; `vision` y `decision` no aplicables.

## Requisitos de hardware

- Hardware de referencia: APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, Radeon 8060S), con 216 GB/s de ancho de banda y 59 TFLOP/s segun el calculo roofline del autor.
- Memoria: el ejemplo de arranque reserva `--memory_bytes=25000000000` (25 GB) para el modelo Q4_K_M y el contexto de 40.960 tokens.
- Cabe en hardware consumer de tipo APU con memoria unificada; no se documentan requisitos para GPU discretas (A100, H100, RTX 4090) en la informacion disponible.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve --device=amdgpu` para servir la API OpenAI. Tambien se documenta llama.cpp como alternativa con el mismo GGUF.
- Throughput: 98,6 tok/s en decodificacion con prompt corto, 82,5 tok/s a 2k y 23,4 tok/s a 32k; prefill entre 980,7 y 2.919,8 tok/s segun longitud del documento.
- Limitaciones de concurrencia: 4 peticiones simultaneas como maximo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-loom (este) | 4.000 M | 40.960 tokens/peticion | no disponible | GGUF Q4_K_M empaquetado en `.loom`; Loom | Optimizado para Strix Halo; decodificacion especulativa DFlash |
| Qwen3-4B (GGUF original, ggml-org) | 4.000 M | no disponible en la informacion | no disponible | GGUF; llama.cpp | Mismo checkpoint; sirve de referencia de correccion y rendimiento |
| Qwen3-4B (Qualcomm AI Hub) | 4.000 M | no disponible | no disponible | despliegue en dispositivos Qualcomm | Orientado a inferencia en dispositivo; datos de rendimiento no disponibles |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo con alternativas de la misma categoria.

## Limitaciones y advertencias

- Los pesos son identicos al GGUF original; las mejoras de rendimiento provienen del runtime Loom y estan medidas unicamente en Ryzen AI Max+ 395, no en otras GPU.
- La decodificacion a 32k de contexto es un 34 % mas lenta que llama.cpp en la misma maquina; el rendimiento depende fuertemente de la longitud del contexto.
- `needle_full` (needle-in-the-haystack a contexto completo) no tiene evidencia registrada; el comportamiento en el limite de 40.960 tokens no esta verificado.
- Sin soporte de imagen ni audio; sin soporte de «reasoning effort».
- Licencia no indicada en la informacion proporcionada: verificar los terminos de Qwen3-4B y del empaquetado antes de uso comercial.
- Idiomas soportados no documentados en esta ficha; la cobertura multilingue del base no esta cuantificada aqui.
- Riesgo de alucinacion y sesgos no evaluados en la informacion disponible; el modelo es de 4.000 millones de parametros y su fiabilidad en tareas de razonamiento complejo es limitada frente a modelos mayores.
- Maximo de 4 peticiones concurrentes y 4.096 tokens de salida por defecto: puede ser insuficiente para cargas de produccion de alta concurrencia.
- Las mediciones de Loom son con temporizacion en el cliente y las de llama.cpp en el servidor, lo que introduce una diferencia metodologica a tener en cuenta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/ggml-org-Qwen3-4B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-4B-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/AtomicChat/Qwen3-4B-DFlash-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
