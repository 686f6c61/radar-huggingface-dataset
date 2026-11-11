# hletrd/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP

## Resumen

`hletrd/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP` es una reexportación cuantizada del modelo `google/gemma-4-E2B-it-qat-q4_0-unquantized`, preparada por Xylolabs (publicada bajo el usuario `hletrd`) para su ejecución en NPUs Tensix de Tenstorrent (Wormhole y Blackhole). El modelo base es un Gemma 4 de la familia E2B en versión instruction-tuned y con quantisation-aware training (QAT), es decir, ya entrenado para tolerar la cuantización a Q4_0. Esta variante redondea las capas lineales del transformer a los formatos de bloque `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8) mediante GPTQ, de forma que TT-NN pueda empaquetar los pesos sin volver a redondearlos.

El resultado es un checkpoint de 5.506.950.723 parámetros totales que ocupa 11,0 GB en el repositorio (6,758 GB empaquetados a 11,68 bits por peso de media), con las capas de atención en BFP8 (8,5 bits por peso) y las capas MLP en BFP4 (4,5 bits por peso), mientras que el LM head, los embeddings, las normas y las torres de visión y audio permanecen en bf16 sin cambios. La licencia es Apache 2.0.

Su relevancia es doble: por un lado, es una de las primeras exportaciones públicas de un Gemma 4 adaptada a los formatos de bloque propietarios de Tenstorrent; por otro, demuestra una metodología de cuantización (GPTQ con búsqueda de exponente por bloque) que conserva 31 de 33 respuestas correctas del modelo BF16 original y mantiene una divergencia KL de 0,06007 frente a los 0,04435 de la referencia Q4_0 de llama.cpp. No obstante, la validación se ha hecho únicamente en el simulador `ttsim` de Blackhole con ttnn 0.81.1, no en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Gemma 4 (any-to-any: texto, imagen y audio), con capas de atención y MLP cuantizadas por bloque para Tensix |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención; bf16 en embeddings, LM head, normas, torres de visión y audio; media de 11,68 bits/peso |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores ya alineados a la rejilla BFP4/BFP8) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 E2B instruction-tuned sometido a QAT y publicado por Google como checkpoint Q4_0 "unquantized". Sobre esa base, Xylolabs aplica GPTQ con búsqueda de exponente por bloque para redondear cada proyección lineal a la rejilla de bloque de Tenstorrent: las proyecciones q, k, v y o de las 35 capas van a `bfloat4_b`… en realidad a `bfloat8_b`, y las proyecciones gate, up y down de las 35 capas MLP van a `bfloat4_b`. La calibración se hizo con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión (`vision_tower`, `embed_vision`) y audio (`audio_tower`, `embed_audio`) se mantienen intactas en bf16.

La innovación técnica clave es el uso de formatos de coma flotante por bloque nativos de TT-NN: en lugar de almacenar los pesos en un formato entero y desempaquetarlos en el dispositivo, los valores se guardan en safetensors en bf16 pero ya situados sobre la rejilla BFP4 o BFP8, de modo que el empaquetado en la NPU es exacto y no introduce un segundo redondeo. El repositorio incluye `quant4.json` (mapa de formato por proyección), `pack_tensix.py` (verificación de empaquetado matriz a matriz, con opción `--device` para round-trip por DRAM) y `verify_grid.py` (verificación de la rejilla solo con torch). No se documenta el número de tokens de entrenamiento del modelo base ni detalles de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional en formato chat, con plantilla de chat aplicada mediante `apply_chat_template`.
- Procesamiento any-to-any: el pipeline declarado es `image-text-to-text` y el checkpoint conserva las torres de visión y audio en bf16, por lo que mantiene las capacidades multimodales del Gemma 4 E2B original.
- Instrucciones y respuestas cortas verificables: la evaluación incluye 33 prompts con comprobación automática, de los cuales 31 se responden correctamente.
- Soporte multilingüe parcial verificado en inglés y coreano (WikiText-2 y Wikipedia en coreano); no se detalla la lista completa de idiomas.
- Capacidad de "thinking mode" en el modelo base (7 de los prompts de evaluación son con thinking activado), aunque esos 7 no se ejecutaron para esta exportación.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.

## Casos de uso

- Despliegue en NPUs Tenstorrent Wormhole y Blackhole: el checkpoint está diseñado para empaquetarse directamente en TT-NN sin redondeo adicional, lo que permite servir Gemma 4 E2B en hardware Tensix con un footprint de 6,758 GB empaquetados en lugar de 9,26 GB en BF16.
- Prototipado en el simulador `ttsim`: útil para validar pipelines de inferencia Gemma 4 en TT-Metal antes de disponer de hardware, ya que el autor ha probado el empaquetado con ttnn 0.81.1 sobre el simulador de Blackhole.
- Asistentes conversacionales de bajo consumo: al reducir el modelo a 11,68 bits por peso de media, encaja en escenarios donde el ahorro de memoria y ancho de banda es crítico, manteniendo 31 de 33 respuestas correctas del BF16.
- Evaluación de técnicas de cuantización por bloque: sirve como referencia reproducible para comparar GPTQ con rejilla BFP4/BFP8 frente a Q4_0 de llama.cpp (KL de 0,06007 frente a 0,04435) en un modelo QAT.
- Investigación en formatos de coma flotante por bloque: el par `pack_tensix.py` / `verify_grid.py` permite auditar la fidelidad del empaquetado matriz a matriz, útil para estudiar el impacto del block floating point en la calidad del modelo.
- Aplicaciones multimodales en el borde: al conservar las torres de visión y audio en bf16, puede emplearse en tareas image-text-to-text siempre que el backend de inferencia soporte el pipeline any-to-any.
- Integración en pipelines de transformers estándar: el modelo se carga con `AutoModelForCausalLM` y `dtype="bfloat16"`, por lo que puede usarse como checkpoint de referencia en CPU/GPU antes de portarlo a Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 9,26 | 0 | 100 | 31 de 33 | - |
| Este modelo | 11,68 | 6,758 | 0,06007 | 88,34 | 31 de 33 | 0 |
| Q4_0 (llama.cpp) | 5,76 | 3,350 | 0,04435 | 89,47 | 32 de 33 | 0 |

La KL y el top-1 se calculan sobre 7.968 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las 33 respuestas son prompts cortos con comprobación automática; "perdidas" significa correctas en BF16 pero incorrectas o rotas en esta exportación. El criterio del autor (KL media como máximo 1,5 veces la de Q4_0 y como máximo una respuesta perdida más) se cumple: 1,35 veces y 0 respuestas perdidas frente a 0. No se han medido velocidades en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,758 GB empaquetados en Tensix; en GPU/CPU con transformers se carga en bf16, por lo que el peso en memoria ronda los 11 GB (5.506.950.723 parámetros × 2 bytes) más overhead de activaciones y KV cache.
- GPU recomendadas: no se especifican; el destino declarado son NPUs Tensix (Wormhole y Blackhole), y el demo oficial de TT-Metal para Gemma 4 E2B/E4B/12B se ejecuta en una Blackhole P150.
- Cabe en GPU de consumo: sí en bf16 en tarjetas con 16 GB o más (RTX 4090, RTX 4080, A4000 de 16 GB); en tarjetas de 12 GB requeriría cuantización adicional, no incluida en este repositorio.
- Opciones de despliegue: TT-NN / TT-Metal (demo Gemma 4 v0.81.1), TT-Forge (tt-xla, sin probar con Gemma 4), y `transformers` con `AutoModelForCausalLM` para uso en GPU/CPU.
- Latencia y throughput: no disponibles; no se ha medido velocidad en dispositivo. La validación se hizo solo en el simulador `ttsim` de Blackhole con ttnn 0.81.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E2B Tensix BFP4/BFP8) | 5.506.950.723 | no disponible | BFP4 + BFP8, 11,68 bits/peso | Apache 2.0 | Hugging Face, validado en simulador |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (BF16) | 5.506.950.723 | no disponible | bf16, 16 bits/peso | Apache 2.0 | Hugging Face |
| Q4_0 de llama.cpp sobre el mismo checkpoint | 5.506.950.723 | no disponible | Q4_0, 5,76 bits/peso | Apache 2.0 | Generado por el autor, no publicado como repo |
| Gemma 4 E2B en TT-Metal demo (v0.81.1) | 5.506.950.723 | no disponible | bf16 o bfp8 (sin bfloat4_b) | Apache 2.0 | Repositorio tt-metal |

## Limitaciones y advertencias

- La validación se ha realizado únicamente en el simulador `ttsim` de Blackhole con ttnn 0.81.1; no se ha ejecutado en hardware Tensix real, por lo que el rendimiento y la corrección en dispositivo no están confirmados.
- tt-transformers no soporta Gemma 4; el demo de TT-Metal v0.81.1 no tiene opción `bfloat4_b`, y la entrada `precision_overrides.json` propuesta por el autor (atención y MLP en bfp8) no se ha ejecutado sobre esta exportación.
- TT-Forge (tt-xla) no se ha probado con Gemma 4; su opción `bfp_bf4` vuelve a redondear los pesos con un layout de bloque distinto, lo que rompería la propiedad de empaquetado exacto.
- Solo se ha cuantizado y evaluado el modelo de lenguaje; las torres de visión y audio no se han evaluado tras la conversión.
- Los 7 prompts de evaluación con thinking activado no se ejecutaron para esta exportación.
- Los benchmarks miden cercanía al BF16, no calidad de tarea; no hay datos de MMLU, HumanEval, GSM8K ni similares en la información disponible.
- El repositorio del modelo base no incluye fichero LICENSE; el autor añade el texto estándar de Apache 2.0 y documenta los cambios en `NOTICE`.
- No se dispone de información sobre sesgos, riesgo de alucinación específico ni lista completa de idiomas soportados.
- El modelo se distribuye "as is", sin garantía.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Revisión del checkpoint base usada en la evaluación: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized/tree/6befbaca7398925921802abd1f277b495b78b738
- Demo Gemma 4 en TT-Metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Paper referenciado en los tags: arXiv:2607.02770
