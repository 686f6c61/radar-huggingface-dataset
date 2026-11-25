# arelius/Inkling-2-Mini-Q2-3090-GGUF

## Resumen

Inkling-2-Mini-Q2-3090-GGUF es una cuantización GGUF de 2 bits del modelo thinkingmachines/Inkling-2-Mini, desarrollada por el usuario arelius y orientada a maximizar la velocidad de decodificación en una única GPU de consumo RTX 3090. El modelo base es un transformer de tipo Mixture of Experts (MoE) con núcleo recurrente ("looped core"), 26.070.385.152 parámetros totales y aproximadamente 3.400 millones de parámetros activos por token, según los datos declarados por el autor de la cuantización.

La relevancia de esta ficha radica en que demuestra una técnica poco habitual: cuantizar los expertos enrutados a 2 bits (Q2_K y Q2_0 calibrado) manteniendo atención, cabezal de salida y embeddings en precisiones superiores (IQ4_NL y Q8_0). El resultado es un archivo de 9,25 GiB que cabe en los 24 GB de una RTX 3090 y decodifica a unos 200-210 tokens por segundo en contexto vacío, con una penalización de perplejidad de en torno al 3-4 % respecto a la conversión de 4 bits de referencia.

El autor advierte explícitamente de que se trata de un compromiso velocidad-calidad y recomienda su build Q6_K cuando la fidelidad es prioritaria. El modelo es solo texto, no incluye proyector visual, y requiere un fork específico de llama.cpp (rama `inkling-3090`) para alcanzar las cifras de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con núcleo recurrente ("looped core"), 24 capas según el mapeo de tensores del autor |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | ~3,4 B (dato declarado por el autor de la cuantización) |
| Longitud de contexto | Hasta 65.536 tokens en la configuración de referencia del fork (requiere ~13 GB de VRAM a 64K) |
| Tipos de cuantizacion | GGUF: Q2_K (expertos enrutados capas 0-19, `ffn_gate_up_exps`), Q2_0 calibrado (expertos enrutados capas 0-19, `ffn_down_exps`), IQ4_NL (expertos enrutados capas 20-23, proyecciones de atención y cabezal de salida), Q8_0 (embeddings de tokens), F32 (norms, router, controladores de bucle, biases) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (idéntica al modelo base) |
| Formato de pesos | GGUF (archivo único `Inkling-2-Mini-Q2K-Q2_0.gguf`, 9,25 GiB, SHA-256 `bc7f51192fbc35eeb5eaec6a342028b8588691023a2399d97c29eb633a049d07`) |

## Arquitectura y entrenamiento

La cuantización preserva la arquitectura del modelo base: un transformer MoE con 26,07 B de parámetros totales y unos 3,4 B activos, organizado en 24 capas y con un mecanismo de núcleo recurrente que repite el paso por capas (el autor menciona "48 layer passes", es decir, dos pasadas por cada una de las 24 capas). Esta recurrencia explica que la velocidad de decodificación dependa fuertemente de la longitud de contexto: cada pasada adicional vuelve a leer la caché de atención.

El proceso de cuantización parte del GGUF Q8_0 publicado por ggml-org y de su importance matrix de 1.770 fragmentos. Los expertos enrutados de las capas 0-19 se comprimen a Q2_K (`ffn_gate_up_exps`) y Q2_0 (`ffn_down_exps`); las capas 20-23, presumiblemente más sensibles, se mantienen en IQ4_NL, al igual que las proyecciones de atención y el cabezal de salida. La innovación técnica destacable es el codificador Q2_0 calibrado del fork (commit `704a7da`): en lugar de tomar el mayor peso absoluto del bloque como escala, ajusta escala y niveles contra los pesos de importancia. El layout en disco no cambia, por lo que cualquier build de llama.cpp compatible con Inkling 2 Mini y Q2_0 puede cargar el archivo. No se realizó fine-tuning: los pesos solo se modificaron por cuantización.

## Capacidades

- Generación de texto conversacional y de un solo turno, con plantilla de chat compatible con endpoints OpenAI (`/v1`, id de modelo `inkling-mini`).
- Razonamiento multi-paso y conversaciones multi-turno gracias a la ventana de contexto configurable de hasta 65.536 tokens.
- Tool calling / function calling: el autor confirma que funciona con el fork, probado con OpenCode.
- Integración como proveedor en herramientas de desarrollo tipo OpenCode (el servidor imprime la configuración con `--opencode`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Solo texto: no incluye proyector de visión ni soporte de audio.
- No se documentan modos especiales de razonamiento (thinking mode) ni decodificación especulativa en la información disponible.

## Casos de uso

- Asistente de programación en local con OpenCode: el fork expone una API compatible con OpenAI en `127.0.0.1:8031/v1` y soporta tool calling, lo que permite usarlo como backend de un agente de código en una sola RTX 3090 sin depender de la nube.
- Servicio de chat de baja latencia en hardware de consumo: con ~200 tok/s servidos en respuestas de 700 tokens y ~179 tok/s tras un prompt de 16K, es adecuado para interfaces conversacionales donde la velocidad percibida importa más que la fidelidad absoluta.
- Procesamiento de documentos largos con contexto de 32K-64K: el modelo mantiene 166-168 tok/s a 32K de contexto, suficiente para resumir o extraer información de contratos, informes o transcripciones extensas en una única pasada.
- Prototipado rápido de pipelines de agentes: la compatibilidad con endpoints OpenAI permite sustituir un modelo en la nube por este GGUF en frameworks existentes sin reescribir la integración, usando el mismo contrato de API.
- Investigación sobre cuantización extrema: el archivo y el fork asociado sirven como banco de pruebas reproducible para estudiar el impacto de Q2_K/Q2_0 calibrado en un MoE con núcleo recurrente, comparando perplejidad de prefill (3,0530) y decode (4,1945) frente a la referencia IQ4_NL.
- Generación de borradores y tareas de reescritura en lote: el throughput elevado (más de 200 tok/s a temperatura 0) permite procesar grandes volúmenes de texto en local, aceptando la pérdida de calidad de la cuantización de 2 bits.
- Despliegue en estaciones de trabajo con una sola GPU: al ocupar 9,25 GiB de pesos y requerir unos 13 GB de VRAM a 64K de contexto, deja margen en una RTX 3090 para otras tareas del sistema o para servir varias peticiones.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 3090 con el fork `inkling-3090`. La perplejidad se calcula sobre el texto fijo `perf/ppl.txt` (8×2048 tokens para prefill y 2×1024 tokens con ubatch 1 para decode).

| Modelo | Decode tok/s, contexto vacío | a 1K de contexto | Tok/s servidos (respuestas de 700 tokens) | PPL prefill | PPL decode |
|---|---:|---:|---:|---:|---:|
| ggml-org IQ4_NL, referencia sin fusión | — | — | — | 2,9401 | 4,0660 |
| **Este modelo (Q2)** | **208,7** | **193,2** | **202,2** (T=0) / **201,2** (T=0,7) | 3,0530 | 4,1945 |

El error estándar de la perplejidad es de aproximadamente 0,065 (prefill) y 0,28 (decode). La penalización de perplejidad respecto a la referencia de 4 bits es de en torno al 3-4 %, según declara el autor.

Velocidad de decodificación según longitud de contexto (`llama-bench`, build v2 con atención tensor-core en fase 5, frente a v1):

| Contexto | v1 decode tok/s | v2 decode tok/s |
|---|---:|---:|
| Vacío | 209,5 | 210,3 |
| 4K | 168,7 | 194,9 |
| 16K | 148,9 | 182,5 |
| 32K | 131,2 | 168,7 |

Con `llama-server` y el build v2, un prompt de 16K tokens alcanza el primer token en 6,3 s y decodifica a ~179 tok/s; un prompt de 32K tarda 13,4 s y decodifica a ~166 tok/s. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 9,25 GiB de pesos; aproximadamente 13 GB de VRAM en total con contexto de 64K según el autor.
- GPU recomendadas: RTX 3090 (Ampere, sm_86) es el objetivo declarado y el hardware de todas las mediciones. Los kernels fusionados del fork están ajustados para sm_86; en otras arquitecturas el rendimiento puede diferir.
- Cabe en GPU de consumo: sí, en RTX 3090 (24 GB). No se documenta comportamiento en GPUs con menos VRAM.
- Opciones de despliegue: fork `csaben/llama.cpp` rama `inkling-3090` (build v2 con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=86`), servidor `llama-server` con flags `-ngl 99 -fa on -ctk q8_0 -ctv q8_0 -c 65536 -np 1 --backend-sampling` y variables de entorno `LLAMA_INKLING_CTRL_F16=1 IK_BATCH_MESSAGES=1 IK_SEGMENTED_IQ4=1 IK_SEGMENTED_Q6=1 IK_MIX_SPECIALIZE=1 IK_CTRL_APPLY8=1`. También existe un lanzador de un solo comando vía `uvx` que descarga un servidor precompilado y sirve una API compatible con OpenAI en `127.0.0.1:8031/v1`. El llama.cpp estándar (PR #32694) carga el archivo pero con velocidades muy inferiores.
- Requisitos del lanzador: Linux, glibc ≥ 2.38, driver NVIDIA ≥ 570 y `uv`; no requiere toolkit de CUDA ni compilación.
- Latencia y throughput: ~208,7 tok/s en contexto vacío, ~193,2 tok/s a 1K, ~168,7 tok/s a 32K; primer token en 6,3 s con 16K de prompt y 13,4 s con 32K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Velocidad en RTX 3090 | Calidad (PPL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este modelo (Q2, 2 bits)** | 26,07 B totales / ~3,4 B activos | Hasta 65.536 | ~208,7 tok/s vacío; ~168,7 tok/s a 32K | Prefill 3,0530 / decode 4,1945 | Apache-2.0 | GGUF en HF |
| Inkling-2-Mini Q6_K (arelius) | 26,07 B totales / ~3,4 B activos | No disponible | ~152 tok/s servidos | "Casi exacta" según el autor (sin cifra publicada) | Apache-2.0 | GGUF en HF |
| Inkling-2-Mini IQ4_NL (ggml-org) | 26,07 B totales / ~3,4 B activos | No disponible | No disponible | Prefill 2,9401 / decode 4,0660 | Apache-2.0 | GGUF en HF |

La comparación relevante es interna a la familia Inkling-2-Mini: el Q2 sacrifica entre un 3 y un 4 % de perplejidad frente al IQ4_NL a cambio de una velocidad muy superior en una sola RTX 3090, mientras que el Q6_K del mismo autor prioriza fidelidad con ~152 tok/s servidos. No se dispone de datos de benchmarks de calidad ni de comparaciones con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Calidad inferior a la conversión de 4 bits: la perplejidad excede la tolerancia de ±0,5 % que el autor usa para cambios "exactos"; hay que validar el modelo en las tareas propias antes de usarlo en producción.
- Solo texto: no hay proyector de visión ni soporte multimodal.
- La velocidad publicada depende de los kernels fusionados del fork, ajustados a Ampere (sm_86); en otras GPUs el rendimiento puede degradarse notablemente y el llama.cpp estándar es "mucho más lento" según el autor.
- La decodificación se ralentiza con el contexto: de ~210 tok/s en vacío a ~168,7 tok/s a 32K, por las 48 pasadas de capa que releen la caché de atención.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe homogéneo.
- Riesgo de alucinación inherente a un modelo de 26 B con expertos a 2 bits; la cuantización agresiva puede amplificarlo en dominios especializados.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial, pero al ser un derivado cuantizado conviene verificar los términos del modelo base thinkingmachines/Inkling-2-Mini y citar adecuadamente a Thinking Machines Lab, ggml-org y el autor de la cuantización.
- Requisitos de entorno estrictos para el lanzador de un comando: Linux, glibc ≥ 2.38 y driver NVIDIA ≥ 570.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arelius/Inkling-2-Mini-Q2-3090-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantización Q6_K del mismo autor: https://huggingface.co/arelius/Inkling-2-Mini-Q6K-3090-GGUF
- GGUF Q8_0 e importance matrix de ggml-org: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Artículo técnico "Looping on a 3090": https://clark.saben.org/looping-on-a-3090
- Fork de llama.cpp (rama `inkling-3090`): https://github.com/csaben/llama.cpp/tree/inkling-3090
- Resultados de rendimiento del fork: https://github.com/csaben/llama.cpp/blob/inkling-3090/perf/RESULTS.md
- Documentación del fork sobre Inkling: https://github.com/csaben/llama.cpp/blob/inkling-3090/INKLING.md
- Commit del codificador Q2_0 calibrado: https://github.com/csaben/llama.cpp/commit/704a7da
- Release del servidor precompilado (v2): https://github.com/csaben/llama.cpp/releases/tag/inkling-3090-v2
- PR de soporte de Inkling 2 Mini en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32694
- Repositorio principal de llama.cpp: https://github.com/ggml-org/llama.cpp
