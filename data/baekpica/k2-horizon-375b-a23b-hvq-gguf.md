# Baekpica/K2-Horizon-375B-A23B-hVQ-GGUF

## Resumen

K2-Horizon-375B-A23B hVQ GGUF es una cuantización experimental del modelo K2-Horizon-375B-A23B de IFM, un transformer de tipo mixture-of-experts (MoE) con 379,17 mil millones de parámetros totales y 23 mil millones activos por token, distribuidos en 192 expertos con top-8 y una ventana de contexto nativa de 524.288 tokens. La publica el usuario Baekpica bajo licencia Apache 2.0 y su interés radica en que comprime el modelo original (que en BF16 ocuparía cientos de gigabytes) hasta 81,21 GiB, un tamaño que cabe en una única estación DGX Spark con 128 GB de memoria unificada.

La técnica empleada es hVQ (vector quantization con corrección de error y calibración por imatrix), que almacena los pesos de los expertos enrutados a 13 bits por cada 8 pesos (1,63 bits por peso efectivo) mediante un libro de códigos E4M3 compartido por capa, mientras que el backbone (atención, expertos compartidos, MLPs densos, embeddings y cabeza de salida) se mantiene en Q8_0. El resultado es un conjunto de 60 ficheros GGUF v3 independientes que no son splits numerados y que requieren un runtime específico, ds4-dfm-rs, con soporte para caché K/V en NVFP4.

Es relevante ahora porque demuestra que un modelo MoE de casi 380B puede servirse en hardware de consumo profesional (GB10) con contexto de hasta 425.984 tokens medidos, a costa de una fidelidad reducida frente al original (87,6% de coincidencia top-1 con K/V en BF16) y de un ecosistema de inferencia muy restringido: no funciona en llama.cpp, Ollama ni Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), 61 capas, atención GQA completa (48 cabezas query / 8 KV × 128), sin indexer ni sliding window |
| Parametros totales | 379,17B (modelo base); 9.803.641.728 según safetensors del repo de cuantización |
| Parametros activos | 23B por token (192 expertos, top-8) |
| Longitud de contexto | 524.288 tokens nativos; 425.984 tokens servibles en DGX Spark de 128 GB |
| Tipos de cuantizacion | GVQ1 13-bit hVQ (expertos enrutados, 1,63 bpw), Q8_0 (backbone), F32 (router y normas), caché K/V NVFP4 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 en 60 ficheros independientes (no splits numerados); requiere runtime ds4-dfm-rs |

## Arquitectura y entrenamiento

El modelo base K2-Horizon-375B-A23B es un transformer MoE con 61 capas de atención GQA completa (48 cabezas de consulta y 8 de clave/valor de dimensión 128), sin mecanismo de indexación dispersa ni ventana deslizante, lo que implica que cada paso de decodificación lee toda la caché K/V. El 97% de los parámetros corresponde a expertos enrutados: 58 capas con 192 expertos y selección top-8, más un experto compartido por capa MoE y tres capas iniciales con MLP denso. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La cuantización aplicada por Baekpica sustituye los cuatro tipos IQ del release anterior (MQ87) por un único kernel de búsqueda en tabla sobre un libro de códigos de 64 KiB (8.192 entradas × 8 valores E4M3) por capa, compartido entre todos los expertos y proyecciones, con una ganancia de fila en F16. Las tres formas matriciales tienen dimensión de entrada divisible por 256 ([1792, 6144] ×2 y [6144, 1792]), lo que permite kernels de prefill con tensor cores FP8 y kernels de decodificación en memoria compartida. El libro de 13 bits es el mayor que cabe en la memoria compartida por bloque del GB10; uno de 14 bits (128 KiB) no cabría. La verificación se hizo contra el BF16 original en modo teacher-forced sobre 32.768 tokens retenidos: 87,6% de coincidencia top-1 y KL 0,116 con K/V en BF16, y 86,8% con KL 0,132 con K/V en NVFP4.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con pipeline declarado `text-generation` y `conversational`.
- Razonamiento y contexto largo: ventana nativa de 524.288 tokens, con 425.984 tokens servibles en DGX Spark (un prompt de 417.942 tokens recuperó ambos códigos plantados en la prueba del autor).
- Mezcla de expertos con 23B parámetros activos por token, lo que reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.
- Caché K/V en NVFP4 (E2M1 con una escala E4M3 por cada 16 valores), que reduce el coste de memoria por token de 249.856 a 70.272 bytes.

## Casos de uso

- Análisis de repositorios y documentación extensa: con 425.984 tokens de contexto servibles, el modelo puede ingerir bases de código o manuales completos en una sola pasada sin troceado, algo inviable en modelos de 32K-128K.
- Procesamiento de expedientes legales o contractuales largos: la ventana nativa de 524.288 tokens permite cargar contratos completos con anexos y hacer preguntas sobre cláusulas cruzadas manteniendo la coherencia referencial.
- Resumen y extracción sobre corpus de investigación: artículos, tesis o transcripciones de varias horas caben en un único contexto, lo que evita la pérdida de información típica de los pipelines de chunking con RAG.
- Despliegue en hardware de borde o laboratorio con presupuesto de 128 GB: una DGX Spark (GB10) sirve el modelo completo con 81,34 GiB de apertura y 36,3 GiB restantes para la caché K/V, sin necesidad de clúster multi-GPU.
- Experimentación en cuantización extrema: sirve como referencia reproducible para investigar vector quantization con corrección de error, calibración por imatrix y contratos de bytes documentados en FORMAT.md.
- Generación de texto conversacional en inglés en entornos con requisitos de licencia permisiva: Apache 2.0 permite uso comercial sin restricciones de atribución adicionales más allá de las habituales.
- Evaluación de fidelidad de cuantizaciones: los datos de teacher-forced (KL 0,116 y 0,134) permiten comparar recetas de compresión sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no se ha ejecutado ningún benchmark de tarea y que la generación por muestreo solo se comprobó en un conjunto pequeño con semilla.

Los únicos datos medidos son de fidelidad y de rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| Coincidencia top-1 vs. BF16 original (K/V BF16, 32.768 tokens teacher-forced) | 87,6% |
| KL vs. BF16 original (K/V BF16) | 0,116 (NLL 1,311 → 1,373) |
| Coincidencia top-1 vs. BF16 original (K/V NVFP4) | 86,8% |
| KL vs. BF16 original (K/V NVFP4) | 0,132 (NLL 1,389) |
| KL en DGX Spark vs. original | 0,134 |
| KL en DGX Spark vs. forward de referencia de los mismos bytes | 0,022 |
| Prefill / decodificación en DGX Spark (2K–64K) | 711,9 / 13,96 tok/s |
| Prefill / decodificación en DGX Spark (8K + 64) | 1.063 / 15,5 tok/s |
| Comparación con release MQ87 (8K + 64) | 645 / 13,3 tok/s |

## Requisitos de hardware

- VRAM/memoria unificada: 81,21 GiB de pesos (trunk de 79,69 GiB más embeddings de 1,52 GiB si se mantienen en dispositivo); la apertura en DGX Spark consume 81,34 GiB incluyendo el runtime CUDA.
- Caché K/V: 2,14 GiB a 32K, 8,58 GiB a 128K, 17,16 GiB a 256K y 34,31 GiB a 524.288 tokens con NVFP4.
- GPU recomendadas: NVIDIA DGX Spark (GB10) con 128 GB es el único hardware validado según la model card; no se documenta soporte en A100, H100 ni RTX 4090.
- No cabe en GPU de consumo convencional (RTX 4090 con 24 GB, RTX 5090 con 32 GB): los 81 GiB de pesos lo impiden incluso con cuantizaciones más agresivas del backbone.
- Opciones de despliegue: exclusivamente ds4-dfm-rs (familia `k2_horizon_vq`, PR #160); no funciona en llama.cpp, Ollama ni Transformers.
- Latencia y throughput medidos en DGX Spark: 711,9 tok/s de prefill y 13,96 tok/s de decodificación en ejecuciones de 2K a 64K; 1.063 tok/s de prefill y 15,5 tok/s de decodificación en el escenario de 8K más 64 tokens.
- Cada parte se verifica contra su SHA-256 en `release.json` al cargarse en el motor.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|---|
| K2-Horizon-375B-A23B hVQ (este) | 379,17B | 23B | 524.288 (425.984 servibles) | GVQ1 13-bit + Q8_0, 81,21 GiB | Apache 2.0 | ds4-dfm-rs |
| K2-Horizon-375B-A23B MQ87 GGUF | 379,17B | 23B | 524.288 | IQ1_S/IQ1_M/IQ2_XXS/IQ2_XS + Q8_0, 86,70 GiB | Apache 2.0 | ds4-dfm-rs |
| K2-Horizon-375B-A23B (base BF16) | 379,17B | 23B | 524.288 | BF16 | Apache 2.0 | no disponible |

La información disponible no incluye comparaciones con modelos de otros autores (DeepSeek, Qwen, Llama u otros) ni sus datos de benchmarks, por lo que no es posible establecer una comparativa de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Release experimental de bajo bit: los expertos enrutados se almacenan a 1,63 bits por peso y la fidelidad medida es teacher-forced; la generación por muestreo solo se comprobó en un conjunto pequeño con semilla y no se ha ejecutado ningún benchmark de tarea.
- Ecosistema de inferencia restringido: los ficheros solo cargan en ds4-dfm-rs; no hay soporte en llama.cpp, Ollama, Transformers, vLLM ni TGI, lo que limita la integración en producción.
- Contexto nativo no servible completo: los 524.288 tokens no caben junto a la memoria del host en una DGX Spark de 128 GB; el máximo medido es 425.984 tokens.
- Sin indexer ni sliding window, cada paso de decodificación lee toda la caché K/V, lo que impide usar SSD como tier de K/V y encarece la latencia con contextos largos.
- Idiomas: solo inglés declarado; no se documenta calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; los datos de fidelidad (KL 0,116-0,134) indican una divergencia medible respecto al BF16 que puede amplificarse en generaciones largas.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es de IFM y la model card no detalla condiciones adicionales más allá de la licencia declarada.
- El repo tiene 0 likes y 1.286 descargas en el momento de la consulta, lo que sugiere una validación comunitaria todavía muy limitada.
- El campo `custom_code` en los tags implica que la carga requiere código personalizado, lo que añade superficie de riesgo en la cadena de suministro.

## Enlaces

- Hugging Face del modelo cuantizado: https://huggingface.co/Baekpica/K2-Horizon-375B-A23B-hVQ-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- Release anterior MQ87 GGUF: https://huggingface.co/Baekpica/K2-Horizon-375B-A23B-Mixed-Quant-GGUF
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- PR #160 del runtime (familia `k2_horizon_vq`): https://github.com/Baekpica/ds4-dfm-rs/pull/160
- Contrato de formato de bytes: FORMAT.md (referenciado en la model card, dentro del repositorio de Hugging Face)
- Release de referencia de la técnica hVQ: https://huggingface.co/ (DeepSeek-V4.1-Flash-1017-hVQ-GGUF, enlace incompleto en la información disponible)
