# kingjones777/KnowLine-31B-Gen1.5-ROCmFP4-GGUF

## Resumen

KnowLine-31B-Gen1.5-ROCmFP4-GGUF es una cuantizacion GGUF del modelo multimodal PelaAI/KnowLine-31B-Gen1.5, publicado por el usuario kingjones777. El modelo base pertenece a la familia Gemma 4 31B Instruct, con 30.697.345.596 parametros (31.27B segun la model card) y licencia Apache-2.0. La cuantizacion emplea la receta propietaria `Q4_0_ROCMFP4_COHERENT` (ftype 102), con el tensor `token_embd` en q6_K, un proyector de vision en BF16 y un drafter MTP oficial de Gemma 4 31B Instruct en Q8_0.

El objetivo declarado de esta publicacion es ejecutar el modelo en hardware AMD Strix Halo (gfx1151), concretamente en el Ryzen AI MAX+ 395 con 128 GB de memoria unificada. Es una cuantizacion de nicho: requiere una compilacion de llama.cpp que implemente los tipos `Q4_0_ROCMFP4_*` y no carga en llama.cpp estandar, Ollama ni LM Studio. El pipeline es image-text-to-text, por lo que admite entrada de imagen ademas de texto.

La relevancia actual es doble: por un lado, demuestra la viabilidad de cuantizaciones de 4 bits optimizadas para ROCm en GPUs integradas de AMD con memoria unificada; por otro, sirve como referencia de rendimiento real (perplejidad, throughput de prefill y decode, aceptacion de decodificacion especulativa) en una plataforma consumer de gama alta. La calidad medida es un 3,64 % peor en perplejidad que la referencia Q8_0, con un tamano de 16.818,21 MiB (4,60 BPW).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4 31B Instruct), con proyector de vision y drafter MTP |
| Parametros totales | 30.697.345.596 (31.27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens probados en el harness (configuracion `-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102) con `token_embd` en q6_K; proyector de vision BF16; drafter Q8_0 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (el drafter queda bajo los terminos de uso de Gemma) |
| Formato de pesos | GGUF (tres archivos: modelo principal, mmproj y drafter MTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 4 31B Instruct, con 31.27B parametros y `tie_word_embeddings = true` (no existe tensor `output.weight`). La publicacion no documenta el entrenamiento del modelo base: no se indican numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se detalla es el proceso de cuantizacion: conversion desde los safetensors originales con `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize` con imatrix, usando `--output-tensor-type q6_K --token-embedding-type q6_K` y el tipo `Q4_0_ROCMFP4_COHERENT` con 16 hilos.

La innovacion tecnica destacable es la propia receta ROCmFP4, orientada a la arquitectura gfx1151 de AMD, combinada con decodificacion especulativa mediante un drafter MTP (Multi-Token Prediction) de Gemma 4 31B Instruct en Q8_0. El drafter acelera la decodificacion con una longitud media aceptada de 3,5 a 3,75 tokens y tasas de aceptacion de 0,718 a 0,846. El proyector de vision en BF16 (1,2 GB) habilita la entrada de imagen, aunque MTP y vision no pueden usarse simultaneamente en este stack.

## Capacidades

- Generacion de texto conversacional: responde correctamente a preguntas factuales (por ejemplo, capital de Australia → Canberra).
- Razonamiento: los resultados de chat indican que las respuestas se emiten por el canal de razonamiento.
- Tool calling / function calling: suite de herramientas con 7/8 en modo required y 7/8 en modo auto; genera llamadas correctas como `get_weather {"city":"Paris"}` con `finish=tool_calls`.
- Entrada de imagen (image-text-to-text): requiere el archivo `mmproj-BF16.gguf` y `-fa off`.
- Decodificacion especulativa con drafter MTP: acelera la generacion en texto, incompatible con vision.
- Capacidades multilingues: no disponibles (no se documentan idiomas soportados).
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente mas alla del soporte de tool calling.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD Strix Halo: el modelo cabe en los 128 GB de memoria unificada del Ryzen AI MAX+ 395 y ofrece decodificacion de 24-32 tok/s con drafter en prompts cortos, adecuado para uso interactivo individual.
- Automatizacion de tool calling en flujos internos: la suite de herramientas con 7/8 en modo required y auto permite integrar el modelo en agentes que consultan APIs (clima, calendario, busquedas) mediante function calling.
- Procesamiento de documentos con imagen: al soportar image-text-to-text con el proyector BF16, puede usarse para extraer informacion de capturas, formularios o diagramas en pipelines locales sin conexion.
- Prototipado de agentes con contexto medio: con 32.768 tokens de contexto probados y prefill de 193-264 tok/s, es viable para tareas de resumen y analisis de documentos de hasta decenas de miles de tokens.
- Evaluacion de cuantizaciones ROCmFP4: sirve como banco de pruebas para medir perplejidad (93,27 frente a 89,99 de Q8_0) y throughput en gfx1151 antes de desplegar variantes mayores.
- Generacion de codigo asistida en local: con decode medio de 11,65 tok/s en prompts de codigo, es util para autocompletado y revision en entornos sin GPU NVIDIA.
- Laboratorio de investigacion en decodificacion especulativa: el drafter MTP incluido permite estudiar tasas de aceptacion y limites del stack (fallos con prompts largos y cache).

## Benchmarks y rendimiento

Perplejidad medida con `llama-perplexity` sobre el corpus kit holdout.txt (74.993 bytes), `n_ctx=4096`, `--chunks 5`:

| Archivo | PPL | Ratio vs Q8_0 |
|---|---:|---:|
| Q8_0 referencia | 89,9893 | 1,000 |
| COHERENT (este archivo) | 93,2653 | 1,0364 |

Decodificacion con drafter MTP (`-c 4096`):

| Tokens de prompt | Decode (tok/s) | Borradores aceptados | Longitud media aceptada |
|---:|---:|---:|---:|
| 2111 | 24,61 | 56/78 (0,718) | 3,5 |
| 26 | 32,04 | 11/13 (0,846) | 3,75 |

Prefill y decode sin drafter (harness speed256, `-c 32768`, media de 2 ejecuciones):

| Prompt | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| p1k (1600 tok) | 264,5 | 10,8 |
| p8k (14064 tok) | 230,4 | 10,2 |
| p16k (28225 tok) | 193,1 | 9,5 |

Otros datos medidos: decode medio en prompts de codigo de 11,65 tok/s; decode sin drafter a `-c 4096` de 11,81 tok/s; suite de herramientas 7/8 en required y 7/8 en auto; 6/6 respuestas de texto identicas entre las dos pasadas de velocidad. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria: 16.818,21 MiB para el modelo principal (4,60 BPW) mas 1,2 GB del proyector de vision y 491 MiB del drafter; en total aproximadamente 18,5 GB.
- Hardware de referencia: AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada.
- GPU recomendadas: exclusivamente GPUs AMD con soporte gfx1151 y una compilacion de llama.cpp que implemente `Q4_0_ROCMFP4_*`; no se garantiza funcionamiento en otras arquitecturas.
- GPU consumer: cabe en el Strix Halo citado; no hay datos de compatibilidad con RTX 4090, A100 o H100, y el formato no carga en llama.cpp estandar, Ollama ni LM Studio.
- Opciones de despliegue: `llama-server` con la compilacion ROCmFP4 personalizada; comando recomendado con `--spec-type draft-mtp`, `--spec-draft-ngl 999`, `--spec-draft-n-max 5`, `-ngl 999 -c 4096 -fa on -fit off --jinja --parallel 1`. Para vision, eliminar los flags de especulacion, anadir `--mmproj mmproj-BF16.gguf` y usar `-fa off`.
- Latencia y throughput: prefill de 193-264 tok/s y decode de 9,5-11,8 tok/s sin drafter; con drafter, 24,6-32,0 tok/s en prompts cortos. Los prompts largos (aprox. 1k-16k) con MTP abortan el servidor (`MTP boundary missing`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| KnowLine-31B-Gen1.5-ROCmFP4-GGUF | 31,27B | 32.768 probados | GGUF, Apache-2.0 | Cuantizacion de nicho para gfx1151; PPL 93,27 |
| PelaAI/KnowLine-31B-Gen1.5 (base) | 31,27B | no disponible | safetensors, Apache-2.0 | Modelo original sin cuantizar; referencia de calidad |
| Referencia Q8_0 del mismo modelo | 31,27B | no disponible | GGUF Q8_0 | PPL 89,99; mayor tamano y menor compresion |

No se dispone de datos de benchmarks estandar ni de comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los archivos no cargan en llama.cpp estandar, Ollama ni LM Studio; requieren una compilacion que implemente `Q4_0_ROCMFP4_*`.
- Hardware especifico: disenado para AMD Strix Halo (gfx1151); no hay evidencia de funcionamiento en otras GPUs.
- Perdida de calidad: la perplejidad es un 3,64 % superior a la referencia Q8_0 (93,27 frente a 89,99).
- Incompatibilidad MTP y vision: no pueden usarse simultaneamente en este stack.
- Fallos con prompts largos: MTP con prompts de aproximadamente 1k-16k tokens aborta el servidor (`MTP boundary missing`); la restauracion de cache de prompt con MTP se omite (`spec-boundary-mismatch`).
- Respuestas en canal de razonamiento: en las pruebas de chat, el contenido visible quedo vacio porque las respuestas se emitieron por el canal de razonamiento.
- Idiomas no documentados: no se especifican idiomas soportados, lo que limita la evaluacion multilingue.
- Licencia del drafter: aunque el modelo principal es Apache-2.0, el drafter procede de Gemma 4 31B Instruct y queda sujeto a los terminos de uso de Gemma, con posibles restricciones adicionales para uso comercial.
- Sesgos y alucinaciones: no documentados en la informacion disponible; aplican los riesgos habituales de un modelo de 31B cuantizado a 4 bits.
- Madurez: 8 descargas y 0 likes en el momento de la consulta; publicacion reciente (noviembre de 2026) sin validacion comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/kingjones777/KnowLine-31B-Gen1.5-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5
