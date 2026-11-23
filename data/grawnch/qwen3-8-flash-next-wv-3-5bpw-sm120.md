# Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-3.5bpw-SM120 es un checkpoint cuantizado a 3.5 bits por peso del modelo Qwen3.8-Flash-Next de Qwen, empaquetado de forma nativa para GPUs Blackwell (arquitectura `sm_120`) por el usuario Grawnch. Se trata de una mezcla de expertos (MoE) de 180.000 millones de parametros totales distribuida en 48 capas hibridas que combinan 36 capas Gated DeltaNet (GDN) con 12 capas Qwen Sparse Attention (QSA), 512 expertos enrutados mas 1 compartido, Hyper-Connections mHC de 4 flujos y una tabla de embeddings por capa N-Gram (PLE) de 28,80 GB que reside en RAM del host.

El paquete no es un GGUF generico ni un safetensors estandar: es un contenedor de safetensors fragmentados con manifiesto de runtime propio (`sm120_manifest.json`), pensado para cargarse en GPUs Blackwell mediante un runtime especifico del autor. Incluye ademas un drafter de decodificacion especulativa calibrado (DFlash2) y tablas de busqueda para cuantizacion vectorial. La relevancia actual radica en que permite ejecutar un modelo de 180B en una unica GPU de 96 GB con un consumo estatico de VRAM de 67,49 GiB y una capacidad de pool KV de mas de un millon de tokens.

El autor reporta una paridad muy alta con el checkpoint maestro de 3.5 bpw (KLD de 0,001533 en Math/Code, 99,023 % de acuerdo Top-1 y coseno de estados ocultos de 0,999465 en las 48 capas) y un resultado de 30/30 en AIME 2025 a contexto de 128K con decodificacion estricta sin penalizacion de presencia. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 36 capas Gated DeltaNet (GDN) + 12 capas Qwen Sparse Attention (QSA), 4-stream mHC Hyper-Connections |
| Parametros totales | 180 000 millones (180B) |
| Parametros activos | no disponible (512 expertos enrutados + 1 compartido por capa; el autor no publica el numero de activos) |
| Longitud de contexto | 128K (131 072 tokens) verificado en evaluacion; pool KV de 1 072 640 tokens |
| Tipos de cuantizacion | 3.5 bpw (checkpoint principal); familia con variantes de 2.7 bpw y GGUF de 3.5 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors fragmentados (8 shards de capas + globals + indexer + drafter) con manifiesto `sm120_manifest.json`; incluye un GGUF de 28,80 GB para la tabla PLE |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con dos tipos de capa intercalados: 36 capas Gated DeltaNet, un mecanismo de estado recurrente con compuertas que sustituye a la atencion completa en la mayor parte de la profundidad, y 12 capas de Qwen Sparse Attention con un indexador dedicado que selecciona los Top-2048 tokens relevantes para contextos de 128K. La capa MoE emplea 512 expertos enrutados mas uno compartido, y el modelo incorpora Hyper-Connections mHC de 4 flujos para el flujo residual. La tabla de Per-Layer Embeddings (PLE) de tipo N-Gram ocupa 28,80 GB y se mantiene en RAM del host fijada (pinned), sin consumir VRAM.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base Qwen3.8-Flash-Next. La innovacion tecnica destacable de este checkpoint concreto es el empaquetado: cuantizacion a 3.5 bpw con calibracion especifica para `sm_120`, atencion dispersa con indexador precalculado, decodificacion especulativa mediante un drafter DFlash2 calibrado (241,8 MB) y un runtime con tablas de cuantizacion vectorial (`vq4_codebooks.pt`) y mapas de niveles submodulares. El autor reporta una tasa de aceptacion de tokens especulativos (tau) de 5,14 en el modo de 3.5 bpw.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de pensamiento extenso (la evaluacion AIME usa hasta 124 807 tokens de salida por problema).
- Razonamiento matematico de competicion: 30/30 en AIME 2025 a 128K de contexto segun el autor.
- Generacion de codigo: el autor reporta paridad KLD en el dominio Math/Code frente al checkpoint maestro.
- Contexto largo de 128K tokens con atencion dispersa Top-2048, adecuado para documentos extensos y conversaciones multi-turno largas.
- Decodificacion especulativa integrada con drafter calibrado (hasta 204 tok/s en single-stream en el modo de 3.5 bpw).
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento matematico y cientifico de alta dificultad: el modelo mantiene cadenas de razonamiento de decenas de miles de tokens sin truncamiento ni bucles en la evaluacion del autor, lo que lo hace adecuado para resolver problemas de competicion, verificacion de demostraciones y generacion de soluciones paso a paso con contexto de 128K.
- Analisis de documentos extensos: con 128K de contexto y atencion dispersa Top-2048, puede procesar informes, expedientes o bases de codigo completas en una sola pasada, resumiendo y extrayendo informacion estructurada sin fragmentacion.
- Generacion de codigo en produccion: la paridad KLD reportada en el dominio Math/Code y el soporte de decodificacion especulativa permiten integrarlo en pipelines de generacion y revision de codigo donde se requiere baja latencia por token y coherencia con el modelo completo.
- Asistentes conversacionales de contexto largo: el pool KV de mas de un millon de tokens y el rendimiento en lote (hasta 1 281 tok/s con B=30 en greedy) permiten servir sesiones multi-turno concurrentes con historial extenso en una unica GPU Blackwell.
- Evaluacion y benchmarking de modelos cuantizados: el checkpoint incluye logs de paridad (KLD, coseno de capas ocultas, acuerdos Top-1/Top-5) y sirve como referencia reproducible para estudiar el impacto de la cuantizacion a 3.5 bpw en modelos MoE hibridos.
- Investigacion sobre atencion dispersa y arquitecturas hibridas: al exponer por separado los pesos del indexador QSA y las capas GDN, facilita experimentos sobre seleccion de tokens, degradacion con la longitud de contexto y comparativas entre atencion densa y dispersa.
- Despliegue en una sola GPU de 96 GB: con 67,49 GiB de VRAM estatica y la tabla PLE en RAM del host, encaja en estaciones de trabajo con RTX PRO 6000 Blackwell para prototipado e inferencia interna sin clúster multi-GPU.

## Benchmarks y rendimiento

| Evaluacion | Politica de decodificacion | Resultado | Tokens medios (max) |
|---|---|---|---|
| AIME 2025, 128K, B=30 (v19, paso A) | `presence_penalty = 0.0`, `mask_eos_in_think = False` | 30/30 (100,00 %) | 25 241,3 (89 807) |
| AIME 2025, 128K, B=30 (v19, paso B) | `presence_penalty = 0.2`, `mask_eos_in_think = True` | 30/30 (100,00 %) | 25 849,6 (124 807) |
| AIME 2025, 64K, B=30 (v18, referencia) | Estricta sin penalizacion | 22/30 (73,33 %) | 29 638,9 (65 536) |

| Metrica de paridad / rendimiento | v19 3.5 bpw | v19 2.7 bpw |
|---|---|---|
| KLD Math/Code frente a WV-3.5bpw | 0,001533 | 0,039365 |
| Acuerdo Top-1 / Top-5 | 99,023 % / 100,0 % | no disponible |
| Coseno de estados ocultos (48 capas) | 0,999465 (min. 0,998659) | 0,994985 |
| VRAM estatica (b_max=32) | 67,49 GiB | 51,17 GiB |
| Pool KV | 1 072 640 tokens | 1 763 968 tokens |
| Greedy B=1 / 16 / 30 | 103,1 / 857,5 / 1 281,3 tok/s | 102,6 / 849,0 / 1 258,9 tok/s |
| Muestreo B=1 / 16 / 30 | 103,1 / 671,4 / 970,4 tok/s | 102,5 / 673,2 / 982,5 tok/s |
| Especulativa single-stream B=1 | 204,19 tok/s (tau = 5,14) | 262,17 tok/s (tau = 6,35) |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras suites estandar.

## Requisitos de hardware

- VRAM estatica de inferencia: 67,49 GiB para el checkpoint de 3.5 bpw con `b_max = 32`; 51,17 GiB para la variante de 2.7 bpw.
- RAM del host: 28,80 GB adicionales para la tabla PLE, que no consume VRAM (pinned memory).
- GPU objetivo: arquitectura Blackwell `sm_120`; el autor valida sobre 1x NVIDIA RTX PRO 6000 Blackwell (101,97 GB GDDR7, 1,79 TB/s). No hay soporte declarado para A100, H100 ni RTX 4090, que no son `sm_120`.
- Cabe en GPU consumer: no disponible; el requisito de 67,49 GiB de VRAM excede cualquier GPU de consumo actual y el target de arquitectura es profesional Blackwell.
- Opciones de despliegue: runtime propietario del autor basado en manifiesto `sm120_manifest.json` y safetensors fragmentados; para llama.cpp existe la variante GGUF estandar del mismo autor (`Qwen3.8-Flash-Next-3.5bpw-GGUF`, 55,05 GB, con tipos `Q3_K`/`Q4_0`/`Q2_0`/`Q6_K`). Compatibilidad con vLLM, TGI u Ollama: no disponible.
- Throughput: 1 281,3 tok/s en greedy con B=30; 970,4 tok/s en muestreo con B=30; 204,19 tok/s en single-stream con decodificacion especulativa.
- Latencia por token en single-stream greedy: aproximadamente 9,7 ms (103,1 tok/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | VRAM estatica | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-3.5bpw-SM120 (este) | 180B totales | 128K | safetensors fragmentado, 3.5 bpw, `sm_120` | 67,49 GiB | Apache 2.0 | 30/30 AIME 2025 a 128K; runtime propio |
| Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120 | 180B totales | 128K | safetensors fragmentado, 2.7 bpw, `sm_120` | 51,17 GiB | Apache 2.0 | 1,76M tokens KV; KLD 0,039 frente al maestro |
| Qwen3.8-Flash-Next-WV-3.5bpw | 180B totales | 128K | GGUF en 2 shards, 3.5 bpw | 55,12 GB | Apache 2.0 | Contenedor maestro WV; KLD 0,09757 frente a BF16 |
| Qwen3.8-Flash-Next-3.5bpw-GGUF | 180B totales | 128K | GGUF estandar llama.cpp, 3.5 bpw | 55,05 GB | Apache 2.0 | Drop-in para llama.cpp con tipos ggml upstream |

No se dispone de datos para comparar con modelos de otros autores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: el checkpoint esta empaquetado exclusivamente para `sm_120` (Blackwell). No es cargable en A100, H100, RTX 4090 ni GPUs Apple, y requiere el runtime y el manifiesto del autor.
- Paridad imperfecta: aunque el KLD reportado es bajo (0,001533), no es cero; el acuerdo Top-1 es del 99,023 %, por lo que existe divergencia respecto al modelo sin cuantizar en tareas sensibles.
- Riesgo de alucinacion: no disponible en la informacion proporcionada; no se han publicado evaluaciones de factualidad ni de sesgo.
- Sesgos conocidos: no disponible; el autor no documenta evaluaciones de sesgo ni de toxicidad.
- Idiomas soportados: no disponible; no se confirma cobertura multilingue ni calidad por idioma.
- Tool calling y uso agentico: no disponible; no se documenta soporte de function calling ni de protocolos de agentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-Flash-Next, de las que este checkpoint hereda.
- Naturaleza no oficial: es una cuantizacion de terceros (Grawnch), no una release de Qwen; los resultados de benchmarks proceden unicamente del autor y no han sido replicados de forma independiente.
- Configuracion de decodificacion sensible: los resultados de AIME dependen de parametros concretos (`temp = 1.0`, `top_p = 0.95`, `top_k = 20`); con `presence_penalty` distinto de cero o enmascarado de EOS cambia el comportamiento, y en la version anterior (v18) se observaron truncamientos y bucles.
- Requisito de memoria del host: 28,80 GB de RAM pinned para la tabla PLE; sin ellos el modelo no puede ejecutarse aunque haya VRAM suficiente.
- Madurez del ecosistema: 433 descargas y 0 likes en el momento de la consulta; soporte limitado fuera del runtime del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint maestro WV-3.5bpw: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw
- Variante compacta 2.7 bpw: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120
- Variante GGUF estandar para llama.cpp: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-3.5bpw-GGUF
- Dataset de evaluacion AIME 2025: https://huggingface.co/MathArena/aime_2025
