# loom-draft/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-loom

## Resumen

HyperCLOVAX-SEED-Text-Instruct-1.5B es un modelo de lenguaje de 1.500 millones de parametros desarrollado originalmente por Naver (familia HyperCLOVAX-SEED), afinado para instrucciones. Esta ficha concreta no contiene el checkpoint original, sino un paquete de despliegue en formato Loom generado por el usuario `loom-draft` a partir del GGUF cuantizado Q4_K_M publicado por `rippertnt`. El paquete incluye programas `.loom` y un `model.json` que permiten servir el modelo sobre GPUs AMD mediante la pila `hrx-loom` 0.2.0.

El modelo base es un transformer decoder-only de 1.5B parametros, orientado a generacion de texto e instrucciones, con licencia MIT en esta distribucion. Su relevancia practica no esta en el modelo en si, sino en el paquete: demuestra el flujo de empaquetado y servicio de modelos GGUF en hardware AMD consumer y profesional (Ryzen AI Max+ 395 "Strix Halo", Radeon AI PRO R9700 y gfx1201 de 16 GB) sin recompilar pesos.

La model card documenta mediciones de rendimiento frente a llama.cpp en la misma GPU, con mejoras de hasta el 50 % en prefill a 32k y un throughput agregado de 587,6 tok/s en 4 streams sobre Strix Halo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia HyperCLOVAX-SEED) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se han medido prefill hasta 32k tokens) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`hyperclovax-seed-text-instruct-1.5b-q4_k_m.gguf`) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del checkpoint original ni los datos de entrenamiento. Se trata de un transformer decoder-only de 1.5B parametros de la familia HyperCLOVAX-SEED de Naver, afinado para instrucciones (sufijo `Instruct`). No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

El paquete Loom anade una capa de despliegue: los pesos GGUF se sirven sin modificacion mediante `loom-serve`, con opciones de gestion de memoria (`--pool_backing=fixed`, `--parameter_mode=preload`, `--memory_bytes`, `--state_slab_bytes`, `--weight_slab_bytes`) y espera activa de completaciones en GPU (`completion_spin_ns=4294967295`). El paquete incluye tres presets: `chat` (Strix Halo, gfx1151), `chat-r9700` (Radeon AI PRO R9700, gfx1201, 32 GB) y `chat-16gb` (gfx1201 de 16 GB, RX 9070 XT y RX 9070). Se expone una API compatible con `/v1/chat/completions`.

## Capacidades

- Generacion de texto e instrucciones en formato conversacional multi-turno (roles `user`/`assistant`).
- Servicio via API HTTP compatible con el esquema OpenAI Chat Completions.
- Despliegue en GPUs AMD mediante la pila Loom (`hrx-loom[hf]==0.2.0`).
- Soporte de presets de memoria especificos por GPU (Strix Halo, R9700 32 GB, gfx1201 16 GB).
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o multimodalidad: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat local en un Ryzen AI Max+ 395: el preset `chat` permite levantar un endpoint `/v1/chat/completions` en la propia maquina con `loom-serve`, util para prototipos y asistentes de escritorio sin depender de la nube.
- Despliegue en estaciones con Radeon AI PRO R9700: el preset `chat-r9700` aprovecha los 32 GB de VRAM para servir el modelo con margen de memoria y atender varias peticiones concurrentes.
- Inferencia en GPUs consumer gfx1201 de 16 GB (RX 9070 XT, RX 9070): el preset `chat-16gb` fija un presupuesto de memoria de 15 GB y slabs de 4 MiB (estado) y 64 MiB (pesos), lo que permite ejecutar el modelo en hardware de gama alta consumer.
- Evaluacion comparativa de runtimes en AMD: el paquete incluye mediciones frente a llama.cpp ROCm y Vulkan con el mismo GGUF, util para decidir el backend de inferencia en un cluster AMD.
- Procesamiento por lotes de documentos de hasta 32k tokens: el rendimiento de prefill medido (3.467,9 tok/s a 32k en Loom) lo hace viable para resumir o clasificar documentos largos en local.
- Servicio multi-stream: con 4 streams concurrentes y 587,6 tok/s agregados en Strix Halo, puede atender varias conversaciones simultaneas en un unico nodo.
- Base para afinar o experimentar con modelos coreanos de 1.5B: al ser un GGUF cuantizado y con licencia MIT, sirve como punto de partida para pruebas de calidad en tareas de instruccion.

## Benchmarks y rendimiento

Mediciones publicadas en la model card (Strix Halo, gfx1151, mismo GGUF, mediana de 6 sesiones):

| Metrica | llama.cpp ROCm | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 155,6 | 168,8 | -2 % | 215,5 | 78 % | 171,9 |
| Decode tok/s, contexto 2k | 134,0 | 142,5 | -1 % | 180,1 | 79 % | 143,3 |
| Decode tok/s, contexto 32k | 49,8 | 50,6 | +2 % | 52,1 | 97 % | 47,6 |
| Prefill tok/s, documento 1k | 5.377,2 | 7.422,9 | +38 % | 20.950,1 | 35 % | 4.154,3 |
| Prefill tok/s, documento 2k | 5.389,1 | 7.088,6 | +32 % | 20.243,5 | 35 % | 3.960,5 |
| Prefill tok/s, documento 8k | 4.493,7 | 6.385,0 | +42 % | 16.836,3 | 38 % | 3.013,2 |
| Prefill tok/s, documento 16k | 3.472,5 | 4.920,1 | +42 % | 13.750,4 | 36 % | 2.146,3 |
| Prefill tok/s, documento 32k | 2.307,5 | 3.467,9 | +50 % | 10.062,0 | 34 % | 1.420,8 |
| 4 streams, decode agregado tok/s | 434,4 | 587,6 | +25 % | 697,7 | 84 % | 471,9 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores miden rendimiento de inferencia, no calidad del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el preset `chat-16gb` fija un presupuesto de servicio de 15.000.000.000 bytes (15 GB) para GPUs gfx1201 de 16 GB.
- GPUs soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y Radeon gfx1201 de 16 GB (RX 9070 XT, RX 9070).
- GPUs consumer: si, en RX 9070 XT y RX 9070 mediante el preset `chat-16gb`; en Strix Halo mediante el preset `chat`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir; API compatible con `/v1/chat/completions`. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI para este paquete concreto.
- Throughput medido en Strix Halo: 168,8 tok/s de decode con prompt corto, 50,6 tok/s a 32k de contexto, 7.422,9 tok/s de prefill a 1k y 587,6 tok/s agregados con 4 streams.
- Latencia: no disponible de forma directa; puede inferirse del throughput anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| HyperCLOVAX-SEED-Text-Instruct-1.5B (este paquete Loom) | 1,5B | no disponible | GGUF Q4_K_M + Loom | MIT | Optimizado para GPUs AMD via Loom |
| HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF (rippertnt) | 1,5B | no disponible | GGUF Q4_K_M | no disponible | Checkpoint base del que deriva este paquete |
| llama.cpp ROCm (runtime, no modelo) | n/a | n/a | n/a | MIT | Referencia de rendimiento en la model card |

No se dispone de datos de benchmarks de calidad ni de comparativas con otras familias de modelos de 1,5B en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes; es un paquete de borrador (`loom-draft`) sin validacion comunitaria.
- No se documentan los idiomas soportados; el modelo original es de Naver y probablemente este optimizado para coreano e ingles, pero no se confirma.
- No se dispone de datos sobre sesgos, tasa de alucinacion ni evaluaciones de seguridad.
- La licencia MIT se aplica a este paquete, pero la licencia del checkpoint original de Naver no se detalla; conviene verificar antes de uso comercial.
- El rendimiento medido corresponde exclusivamente a Strix Halo; no hay cifras publicadas para R9700 ni para gfx1201 de 16 GB.
- La API expuesta es compatible con OpenAI Chat Completions, pero no se documentan capacidades de tool calling, agentes o modo thinking.
- El paquete depende de `hrx-loom==0.2.0` y de la pila ROCm; requiere hardware AMD compatible con gfx1151 o gfx1201.
- Las mediciones comparan Loom (cronometrado por cliente) con llama.cpp (cronometrado por servidor), lo que puede introducir diferencias metodologicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-loom
- Checkpoint base GGUF: https://huggingface.co/rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Workflow loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Run de referencia DevLab (llama.cpp): https://github.com/loom-fun/loom-skills/actions/runs/43390795404/job/131769975665

Nota: los resultados de busqueda web devueltos corresponden a Loom (la aplicacion de grabacion de video) y a la marca de ropa Loom, sin relacion con el proyecto tecnico.
