# loom-fun/amd-Qwen3.8-27B-Quark-AWQ-MXFP4-loom

## Resumen

`loom-fun/amd-Qwen3.8-27B-Quark-AWQ-MXFP4-loom` es un paquete de despliegue para el runtime Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint sin modificar `amd/Qwen3.8-27B-Quark-AWQ-MXFP4` (un Qwen3.8 de 27B cuantizado en MXFP4 con Quark y AWQ) en forma de programas `.loom` y una tarjeta `model.json`, generados sobre una AMD Radeon AI PRO R9700 con el flujo `loom-skills`. El objetivo es servir ese checkpoint en GPUs AMD Radeon mediante una API compatible con OpenAI, con decodificacion especulativa MTP activada por defecto.

La relevancia del paquete esta en el rendimiento medido frente a vLLM ROCm 0.18.0 sobre el mismo checkpoint y hardware: 75,7 tok/s de decodificacion en prompt corto frente a 10,9 tok/s de vLLM (+594 %), y 130,2 tok/s agregados con 4 streams frente a 19,0 (+585 %). Ademas, el preset de 32 GB permite servir hasta 110.592 tokens por peticion, mientras que vLLM solo retiene una cache KV de 5.600 tokens en esa configuracion, lo que le impide procesar prompts de 8k, 16k o 32k.

El modelo subyacente es multimodal (image-text-to-text), con contexto nativo de 262.144 tokens, soporte de tool calling, modo de razonamiento configurable y salida maxima de 4.096 tokens por peticion segun el preset. El paquete esta pensado exclusivamente para GPUs con FP8 WMMA (gfx12); Strix Halo (gfx1151) queda explicitamente fuera de su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint base Qwen3.8; el paquete es un runtime Loom) |
| Parametros totales | 27B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 110.592 tokens por peticion en el preset `chat-r9700` (32 GB) |
| Tipos de cuantizacion | MXFP4, generada con Quark y AWQ (checkpoint base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint sin modificar) + programas `.loom` y `model.json` |
| Pipeline | image-text-to-text |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Hardware objetivo | AMD Radeon AI PRO R9700 (gfx1201, 32 GB); no soporta gfx1151 (Strix Halo) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: es un artefacto de despliegue que envuelve el checkpoint `amd/Qwen3.8-27B-Quark-AWQ-MXFP4` sin modificarlo. La model card no aporta detalles sobre la arquitectura interna del modelo base (tipo de transformer, atencion, composicion del dataset ni fases de alineacion como RLHF o DPO), por lo que esos datos deben consultarse en la ficha del checkpoint original de AMD, no disponible en la informacion proporcionada.

La innovacion tecnica del paquete es el motor Loom: un runtime con pool de memoria fijo (`--pool_backing=fixed`, comprometido por adelantado), espera activa (`completion_spin_ns=4294967295`), decodificacion especulativa MTP con profundidad 3 y una ruta rapida basada en FP8 WMMA disponible solo en gfx12. El preset `chat-r9700` dimensiona el pool a 110.592 tokens para los 32 GB de la R9700. La tasa de aceptacion de tokens redactados por el drafter medida es del 60 % en la puerta `spec`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Tool calling estilo OpenAI, con campos `tools` y `tool_calls`.
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, con proyector servido como `model.safetensors`.
- Decodificacion especulativa MTP con profundidad 3 activada por defecto.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- API compatible con OpenAI en `/v1/chat/completions`, escuchando en `127.0.0.1:8080`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Entrada y salida de audio: no aplicable segun la model card.

## Casos de uso

- Asistente conversacional de contexto largo: con 110.592 tokens por peticion en la R9700, el modelo puede mantener conversaciones multi-turno o procesar documentos extensos sin truncar, algo que la configuracion medida de vLLM ROCm no permite al retener solo 5.600 tokens de cache KV.
- Procesamiento de documentos de hasta 32k tokens: las mediciones de prefill alcanzan 2.790 tok/s con prompts de 32k, lo que hace viable el analisis de informes, contratos o expedientes completos en una sola pasada.
- Servicio de inferencia con API OpenAI para aplicaciones existentes: al exponer `/v1/chat/completions`, se puede apuntar un cliente compatible con OpenAI al servidor Loom sin reescribir la capa de integracion.
- Agentes con tool calling: el soporte de `tools` y `tool_calls` permite construir flujos de agente que consulten APIs externas, bases de datos o funciones internas, con razonamiento multi-paso controlado por `reasoning_effort`.
- Analisis de imagenes con texto: el pipeline image-text-to-text y la entrada `image_url` habilitan tareas de descripcion, extraccion de informacion o respuesta a preguntas sobre capturas, diagramas o documentos escaneados.
- Despliegue en estaciones de trabajo AMD Radeon: equipos con R9700 de 32 GB pueden servir el modelo en local con 75,7 tok/s de decodificacion, suficiente para uso interactivo de un usuario o de un equipo pequeno con 4 streams concurrentes (130,2 tok/s agregados).
- Evaluacion comparativa de motores de inferencia: el paquete incluye la metodologia y los datos de la comparacion con vLLM ROCm, util para reproducir la medicion en otros runners o para justificar la eleccion de motor en un entorno AMD.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-16 en un runner AMD DevLab Dispatch con Radeon AI PRO R9700S (gfx1201, 32 GB, 2,35 GHz, 613 GB/s, 214 TFLOP/s), con hrx-loom 0.1.0 y vLLM ROCm 0.18.0 sobre el mismo checkpoint y los mismos prompts. Medianas de 3 sesiones.

| Metrica | vLLM | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 10,9 | 75,7 | +594 % | 94,3 | 80 % |
| Decode tok/s, contexto 2k | 10,7 | 74,6 | +597 % | 96,8 | 77 % |
| Decode tok/s, contexto 32k | no medido | 60,8 | no aplica | 88,5 | 69 % |
| Prefill tok/s, documento 1k | 1045,4 | 2284,8 | +119 % | 4376,1 | 52 % |
| Prefill tok/s, documento 2k | 1132,4 | 2941,0 | +160 % | 4358,6 | 67 % |
| Prefill tok/s, documento 8k | no medido | 3209,7 | no aplica | 4256,3 | 75 % |
| Prefill tok/s, documento 16k | no medido | 3067,0 | no aplica | 4127,2 | 74 % |
| Prefill tok/s, documento 32k | no medido | 2790,4 | no aplica | 3891,2 | 72 % |
| 4 streams, decode agregado tok/s | 19,0 | 130,2 | +585 % | 156,7 | 83 % |
| Tokens redactados aceptados (speculative) | no medido | 60 % | no aplica | no aplica | no aplica |

Notas de la metodologia: las filas de 1 stream usan MTP en ambos motores con profundidad 3; los 4 streams se midieron sin drafting en ambos. vLLM no pudo medir las filas de 8k, 16k y 32k porque su cache KV solo retiene 5.600 tokens (carga del modelo: 23,63 GiB; memoria KV disponible: 1,48 GiB). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el preset `chat-r9700` esta dimensionado para 32 GB y compromete el pool por adelantado con `--pool_backing=fixed`, sirviendo hasta 110.592 tokens por peticion.
- GPU recomendada: AMD Radeon AI PRO R9700 / R9700S (gfx1201), la unica plataforma medida y objetivo del paquete.
- GPUs no soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) queda fuera del alcance del paquete; la ruta rapida FP8 WMMA solo existe en gfx12. Para gfx11 el autor remite a la tarjeta GGUF Q4_K_M.
- Despliegue: `pipx install "hrx-loom[hf]==0.1.0"`, seguido de `loom-fetch` con `--preset=chat-r9700 --materialize=copy` y `loom-serve --model=... --device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed`. El servidor expone `/v1/chat/completions` en `127.0.0.1:8080`.
- Otros motores: la comparacion se hizo contra vLLM ROCm 0.18.0; llama.cpp no puede leer un checkpoint safetensors segun la model card.
- Throughput medido: 75,7 tok/s de decodificacion en prompt corto, 60,8 tok/s con 32k de contexto y 130,2 tok/s agregados con 4 streams. Prefill entre 2.284 y 3.209 tok/s segun el tamano del documento.
- Latencia: no se publican cifras de latencia por token ni de tiempo hasta el primer token; la medicion se hizo del lado del cliente sobre el primer token transmitido y la tasa del stream.

## Comparativa con modelos similares

| Criterio | Loom (este paquete) | vLLM ROCm 0.18.0 (mismo checkpoint) | Checkpoint base AMD |
|---|---|---|---|
| Tipo | Runtime de despliegue | Runtime de despliegue | Modelo |
| Parametros | 27B | 27B | 27B |
| Contexto servido por peticion | 110.592 tokens (preset 32 GB); nativo 262.144 | 5.600 tokens de cache KV en la configuracion medida | 262.144 tokens nativos |
| Decode tok/s (prompt corto) | 75,7 | 10,9 | no aplica |
| Prefill tok/s (documento 2k) | 2941,0 | 1132,4 | no aplica |
| 4 streams agregados | 130,2 tok/s | 19,0 tok/s | no aplica |
| Decodificacion especulativa | MTP, profundidad 3, por defecto | MTP, profundidad 3, configurada por argumentos | no aplica |
| Tool calling | Si, estilo OpenAI | Depende del servidor | Si (capacidad del modelo) |
| Vision | Si, `image_url` | Depende del servidor | Si (pipeline image-text-to-text) |
| Licencia | no disponible | no disponible | no disponible |
| Hardware | Solo gfx12 (R9700) | ROCm en general | No aplica |

No se dispone de datos de benchmarks de calidad ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete solo esta medido y soportado en AMD Radeon AI PRO R9700 (gfx1201); no funciona en Strix Halo (gfx1151) por la ausencia de FP8 WMMA en gfx11.
- La licencia no esta disponible en la informacion proporcionada; antes de un uso comercial hay que verificar la licencia del checkpoint base `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`.
- Los idiomas soportados no estan documentados en la ficha; no se puede asumir cobertura multilingue sin comprobacion empirica.
- El preset limita la salida a 4.096 tokens y la concurrencia a 4 peticiones; para cargas mayores hay que ajustar el preset, lo que reduce el contexto disponible por peticion.
- La comparacion con vLLM esta hecha sin barrido de ajuste en ninguno de los dos motores y en runners efimeros que difieren entre sesiones; los margenes dentro de +-3 % se consideran empate.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros), por lo que no hay evidencia publica en esta ficha sobre exactitud, tendencia a la alucinacion o sesgos del modelo base.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-16) sin validacion comunitaria.
- El uso de espera activa (`completion_spin_ns`) y de un pool de memoria fijo implica un consumo de CPU y de VRAM constante, no elastico; hay que dimensionar la maquina en consecuencia.
- La busqueda web realizada no devuelve informacion tecnica relevante sobre este modelo: los resultados corresponden a Loom (la herramienta de grabacion de pantalla) y a Loom (la marca de ropa), no al runtime.

## Enlaces

- Hugging Face: https://huggingface.co/loom-fun/amd-Qwen3.8-27B-Quark-AWQ-MXFP4-loom
- Checkpoint base: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Repositorio del runtime: https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/43920731237/job/133487104076
