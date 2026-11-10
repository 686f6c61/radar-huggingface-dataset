# kingjones777/Sieve-31B-v3-ROCmFP4-GGUF

## Resumen

Sieve-31B-v3-ROCmFP4-GGUF es una cuantización GGUF del modelo multimodal `sthanika-ai/Sieve-31B-v3`, publicado por el usuario kingjones777. El modelo base pertenece a la familia Gemma 4 31B Instruct, con 31.270 millones de parámetros y licencia Apache-2.0, y admite entrada de imagen y texto. Esta versión concreta emplea la receta propietaria `Q4_0_ROCMFP4_COHERENT` (ftype 102) con el tensor de embeddings en q6_K, e incluye además el proyector de visión en BF16 y un drafter MTP (multi-token prediction) para decodificación especulativa.

El propósito de esta publicación no es ofrecer un modelo de propósito general, sino un artefacto optimizado para hardware AMD Strix Halo (gfx1151), en concreto el Ryzen AI MAX+ 395 con 128 GB de memoria unificada. Los ficheros requieren una compilación de llama.cpp que implemente los tipos `Q4_0_ROCMFP4_*`; no cargan en llama.cpp estándar, Ollama ni LM Studio. El repositorio ocupa 19,4 GB y el fichero principal pesa 16.818 MiB, con un ratio de 4,60 bits por peso.

La relevancia de esta ficha radica en que documenta un caso poco habitual: una cuantización de baja precisión con pérdida de perplejidad medida y explícita (1,0323× respecto a Q8_0) y con cifras de rendimiento reales sobre una plataforma concreta. Es un artefacto de nicho, útil para desarrolladores que trabajan con APUs AMD de memoria unificada y quieren ejecutar un modelo multimodal de 31B en local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4 31B Instruct), con proyector de visión y drafter MTP |
| Parámetros totales | 31.270 millones (modelo base); el tensor safetensors reportado en el repo marca 575.743.536, dato inconsistente con el modelo base |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en las pruebas de rendimiento con `-c 32768`; el modelo base soporta contexto mayor según la familia Gemma 4, pero no se detalla en la información disponible |
| Tipos de cuantización | `Q4_0_ROCMFP4_COHERENT` (ftype 102, 4,60 BPW) con `token_embd` en q6_K; proyector de visión BF16; drafter Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el drafter queda bajo los términos de uso de Gemma) |
| Formato de pesos | GGUF (fichero principal, `mmproj-BF16.gguf`, `mtp-gemma-4-31B-it-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 4 31B Instruct, con `tie_word_embeddings = true` (no existe tensor `output.weight`). La cuantización se generó convirtiendo primero los safetensors originales a BF16 con `convert_hf_to_gguf.py --outtype bf16` y aplicando después `llama-quantize` con una matriz de importancia (imatrix), el tipo de salida q6_K y el tipo de embedding q6_K, usando el ftype `Q4_0_ROCMFP4_COHERENT` con 16 hilos.

La innovación técnica principal de esta publicación es la receta de cuantización ROCmFP4, que combina un formato de 4 bits con ajuste de coherencia sobre una imatrix, manteniendo los embeddings en 6 bits para preservar calidad. Se incluye además un drafter MTP de Gemma 4 31B Instruct en Q8_0 (491 MiB) que permite decodificación especulativa con `--spec-type draft-mtp`, con una longitud media de aceptación de entre 3,22 y 4,39 tokens según el prompt. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Entrada de imagen y texto (pipeline `image-text-to-text`), mediante el fichero `mmproj-BF16.gguf`, que es obligatorio para entrada visual.
- Soporte de tool calling / function calling: en las pruebas realizadas devuelve `finish=tool_calls` con argumentos JSON correctos (por ejemplo, `get_weather` con `{"city":"Paris"}`).
- Suite de tool calls con resultado de 7/8 en modo required y 7/8 en modo auto.
- Decodificación especulativa mediante drafter MTP, con aceleración en prompts cortos.
- Canal de razonamiento separado (las respuestas de las pruebas de texto quedaron en el canal de reasoning).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local multimodal en APUs AMD Strix Halo: el artefacto está diseñado específicamente para el Ryzen AI MAX+ 395 con 128 GB de memoria unificada, lo que permite ejecutar un modelo de 31B con visión sin GPU dedicada.
- Asistente conversacional con contexto largo: con `-c 32768` y decodificación sin drafter, el modelo mantiene un prefill de 192-264 tok/s y decodificación de 9,5-10,8 tok/s, adecuado para sesiones de chat extensas.
- Automatización con tool calling: la suite de herramientas valida 7/8 llamadas correctas, lo que permite integrar el modelo en flujos de agentes que consulten APIs externas (por ejemplo, clima, calendario o bases de datos).
- Análisis de imágenes en local: con `mmproj-BF16.gguf` y `-fa off`, el modelo procesa entradas image-text-to-text sin depender de servicios en la nube, útil para entornos con requisitos de privacidad.
- Prototipado de pipelines de razonamiento con decodificación especulativa: el drafter MTP permite medir la aceptación de drafts (0,571-1,000) y ajustar la longitud máxima de draft (`--spec-draft-n-max 5`) para optimizar latencia en prompts cortos.
- Evaluación de cuantizaciones de 4 bits: la perplejidad medida (594,4354 frente a 575,8471 de Q8_0, es decir, 1,0323×) sirve como referencia para comparar recetas de cuantización en hardware AMD.
- Generación de código en local: la decodificación media en prompts de código es de 11,67 tok/s, suficiente para tareas de autocompletado o generación de fragmentos en entornos de desarrollo sin conexión.

## Benchmarks y rendimiento

Perplejidad medida con `llama-perplexity`, corpus holdout de 74.993 bytes, `n_ctx=4096`, `--chunks 5`, `-ngl 999 -fa on -fit off`:

| Fichero | PPL | vs Q8_0 |
|---|---:|---:|
| Q8_0 referencia | 575,8471 | 1,000 |
| COHERENT (este fichero) | 594,4354 | 1,0323 |

Decodificación con drafter MTP, prompts cortos, `-c 4096`:

| Tokens de prompt | Decode tok/s | Drafts aceptados | Longitud media aceptada |
|---:|---:|---:|---:|
| 23 | 34,21 | 11/11 (1,000) | 3,75 |
| 30 | 36,21 | 61/72 (0,847) | 4,39 |
| 26 | 23,59 | 40/70 (0,571) | 3,22 |

Prefill y decodificación sin drafter, media de 2 ejecuciones, harness speed256, `-c 32768`, `max_tokens` 256, temperatura 0:

| Prompt | Prefill tok/s | Decode tok/s |
|---|---:|---:|
| p1k (1600 tok) | 263,85 | 10,8 |
| p8k (14064 tok) | 229,3 | 10,2 |
| p16k (28225 tok) | 192,35 | 9,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero principal ocupa 16.818,21 MiB (4,60 BPW); con el proyector de visión (1.200.726.496 bytes) y el drafter (514.687.104 bytes), el conjunto supera los 18 GB.
- Hardware de referencia: AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada; es el único hardware con cifras medidas.
- GPU dedicadas: no se han publicado mediciones para A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: no confirmado; el tamaño del fichero (más de 18 GB con auxiliares) excede la VRAM de la mayoría de GPUs de consumo de 16 GB, aunque podría caber en modelos de 24 GB si la compilación de llama.cpp soporta el formato.
- Opciones de despliegue: exclusivamente llama.cpp con soporte de `Q4_0_ROCMFP4_*`; no carga en llama.cpp estándar, Ollama ni LM Studio. El comando recomendado usa `llama-server` con `-ngl 999 -c 4096 -fa on -fit off --jinja --parallel 1`.
- Latencia y throughput: decodificación de 9,5-10,8 tok/s sin drafter y 23,59-36,21 tok/s con drafter en prompts cortos; prefill de 192-264 tok/s según longitud de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Sieve-31B-v3-ROCmFP4-GGUF (este) | 31,27B | 32.768 (probado) | GGUF ROCmFP4 | Apache-2.0 | Hugging Face, requiere llama.cpp modificado |
| sthanika-ai/Sieve-31B-v3 (base) | 31,27B | no disponible | safetensors | Apache-2.0 | Hugging Face |
| Gemma 4 31B Instruct (referencia de familia) | 31B | no disponible | safetensors, GGUF | Términos de Gemma | Hugging Face, ecosistema amplio |

No se dispone de datos de benchmarks comparativos con otras cuantizaciones del mismo modelo base en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros no cargan en llama.cpp estándar, Ollama ni LM Studio; requieren una compilación con los tipos `Q4_0_ROCMFP4_*`.
- MTP y visión son incompatibles en este stack: no pueden usarse simultáneamente; para visión hay que eliminar los flags de `--spec-type` y usar `-fa off`.
- Los prompts largos (aproximadamente 1k-16k tokens) con MTP abortan el servidor llama.cpp con errores `MTP boundary missing` o fallo de batch especulativo; para contexto largo debe usarse el comando sin drafter.
- La restauración de caché de prompt con MTP se omite (`spec-boundary-mismatch`); sin MTP, las capas de ventana deslizante fuerzan un reprocesamiento completo del prompt (`lack of cache data`).
- Pérdida de perplejidad de 1,0323× respecto a Q8_0, superior al umbral de 1,02× que el autor considera aceptable.
- El drafter queda bajo los términos de uso de Gemma, no bajo Apache-2.0, lo que puede afectar al uso comercial del conjunto.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas del modelo base en la documentación proporcionada.
- El dato de parámetros totales del tensor safetensors (575.743.536) es inconsistente con los 31,27B declarados del modelo base; conviene verificar antes de confiar en él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Sieve-31B-v3-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/sthanika-ai/Sieve-31B-v3
- Familia Gemma 4 31B Instruct: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
