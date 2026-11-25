# ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadSnake-4.5bpw

## Resumen

`ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadSnake-4.5bpw` es una versión cuantizada del modelo base `Qwen/Qwen2.5-3B` de Alibaba Qwen, publicada por el usuario ahrazzle. Se trata de un checkpoint experimental que aplica una técnica propia de cuantización por retículos (lattice quantization) denominada Siliquant, en su variante `hA16_BlockH4_quad_snake_real`, con un objetivo de 4,5 bits por peso (bpw) y tamaño de grupo `g=128`. El resultado se empaqueta en el formato `siliquant-hf-v1`, cargable directamente con `transformers` sin necesidad de compilar extensiones C++/CUDA.

El modelo resuelve un problema muy concreto: comprimir un modelo de 3B parámetros manteniendo una fidelidad bit-a-bit verificable en el proceso de empaquetado/desempaquetado, y ofreciendo métricas de calidad (perplejidad y KL frente al modelo BF16) sobre corpus de referencia como WikiText-2 y CPython. El checkpoint ocupa 2.327 MiB frente a 5.885,79 MiB en BF16 (2,53 veces más pequeño), con un tamaño efectivo de 5,2390 bpw empaquetados.

Es relevante ahora porque propone un enfoque alternativo a las cuantizaciones habituales (GPTQ, AWQ, GGUF K-quants) basado en códigos de Hamming extendidos `[16, 11, 4]` y transformadas de Hadamard por bloques, con verificación criptográfica (SHA-256) de la integridad del payload. No obstante, se trata de una publicación con cero descargas y cero likes en el momento de la ficha, sin benchmarks estándar de tareas publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B); cuantización por retículos A_16 con Hamming extendido [16, 11, 4] y Block-Hadamard |
| Parametros totales | 2.050.986.216 (según safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-3B, no confirmada en la model card) |
| Tipos de cuantizacion | Siliquant `hA16_BlockH4_quad_snake_real`, objetivo 4,5 bpw, efectivo 5,2390 bpw, grupo g=128; 252 capas lineales cuantizadas; embed_tokens, lm_head, RMSNorms y biases en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (heredada de Qwen/Qwen2.5-3B) |
| Formato de pesos | safetensors (formato `siliquant-hf-v1` con tensores `qham11`, `qquot`, `qov_rowptr`, `qov_col`, `qov_val`, `scales_fp16_bits`, `colscale_fp32_bits`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-3B original (transformer decoder-only con atención causal estándar y RMSNorm), pero el checkpoint no contiene los pesos densos: contiene una representación comprimida de 252 capas lineales (2.774.532.096 pesos cuantizados). Cada vector de 16 pesos se representa como un punto del retículo `A_16 = 2 Z^16 + C_[16,11,4]`, donde `C_[16,11,4]` es un código de Hamming extendido. Los 11 bits sistemáticos por bloque (`qham11`, 0,6875 bpw) permiten reconstruir algebraicamente los 5 bits de paridad en las posiciones `{0, 1, 2, 4, 8}`; el cociente entero por capa se empaqueta en `qquot` (2-4 bits) con desbordamientos en formato CSR compacto. Las escalas se guardan como patrones de bits IEEE-754 exactos (`scales_fp16_bits` como int16, `colscale_fp32_bits` como int32) para evitar truncamientos de mantisa al convertir a bfloat16.

No hay información sobre entrenamiento adicional, fine-tuning, RLHF o DPO en la model card: es una cuantización post-entrenamiento (PTQ) del modelo base. La innovación técnica es el propio codec: verificación de síndrome sobre 173.408.256 bloques con cero errores y diferencia máxima de round-trip de 0,0 (bit a bit exacto). La calibración se realizó sobre 6.144 tokens disjuntos de validación de WikiText-2 (12×512, Track S72 / siliquant#95). Se incluyen kernels de referencia independientes para Ampere `sm_86` (PTX, GEMV con `dp4a.s32.s32`) y para CPU Intel AVX-512 (`vpermb`, `vpopcntq`, `vpdpbusd`), distintos del contenedor de archivo lossless.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), heredada del modelo base Qwen2.5-3B.
- Razonamiento y conocimiento general: capacidades del Qwen2.5-3B original, no documentadas específicamente en esta model card.
- Generación de código: la model card reporta métricas de perplejidad sobre corpus CPython (`cpython_ppl` 3,166559), lo que sugiere utilidad en dominios de código, aunque no se publican benchmarks de HumanEval ni similares.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas del checkpoint no se declaran.
- Capacidad especial: decodificación exacta bit-a-bit del checkpoint (round-trip sin pérdida), verificación de integridad SHA-256 por archivo y verificación de síndrome del código Hamming sobre el 100 % de los bloques.
- Exportación a pesos densos BF16 mediante `python siliquant_dequant.py unpack . --out unpacked.safetensors --dtype bfloat16` para su uso en otros motores de inferencia.

## Casos de uso

- Investigación en cuantización post-entrenamiento: el checkpoint sirve como referencia reproducible para comparar recetas de cuantización (la model card incluye deltas de KL frente a BlockH2, global-sort y unperm-BlockH4), útil para grupos que estudian retículos y códigos correctores aplicados a pesos.
- Despliegue con `transformers` en entornos sin compilador CUDA: al requerir solo `torch`, `transformers` y `safetensors`, permite cargar el modelo en máquinas donde no se pueden compilar extensiones nativas, usando `trust_remote_code=True`.
- Verificación de integridad de artefactos en cadena de suministro: el CLI `siliquant_dequant.py verify` comprueba hashes SHA-256 de cada archivo y rechaza archivos manipulados, ausentes, no listados o enlazados simbólicamente, lo que encaja en pipelines de validación de modelos antes de producción.
- Auditar la fidelidad de una cuantización: las métricas `top1_match_pct` (94,94 % en CPython, 92,69 % en WikiText-2) y `mean_kl` permiten cuantificar la degradación frente al BF16 sin necesidad de ejecutar benchmarks de tareas completos.
- Exportación a BF16 para pipelines existentes: el comando `unpack` genera un `safetensors` denso en bfloat16 que puede cargarse en vLLM, TGI u otros motores que no soportan el formato `siliquant-hf-v1`.
- Evaluación de kernels de referencia: los ficheros `kernels/sm86_a16_blockh4.cu` (Ampere sm_86) y `kernels/avx512_a16_blockh4.c` (Intel AVX-512) sirven como base para medir rendimiento de decodificación en GPU y CPU respectivamente.
- Prototipado de asistentes conversacionales de bajo coste de memoria: con 2.327 MiB de checkpoint, es viable en GPUs de consumo con suficiente VRAM para el modelo base, aunque no se publican latencias ni throughput.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad de cuantización (perplejidad y KL frente al BF16), no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación los datos disponibles:

| Corpus / Métrica | BF16 (referencia) | Cuantizado | Delta |
|---|---|---|---|
| `cpython_ppl` | 3,111936 | 3,166559 | +0,054623 |
| `wikitext2_ppl` | 10,970193 | 11,063591 | +0,093398 |
| `cpython_mean_kl` | — | 0,020494 | — |
| `wikitext2_mean_kl` | — | 0,023154 | — |
| `cpython_top1_match_pct` | — | 94,9364 % | — |
| `wikitext2_top1_match_pct` | — | 92,6859 % | — |
| `cpython_vs_blockh2_kl_delta` | — | −10,80 % (0,020494 vs 0,022975) | mejora |
| `wikitext2_vs_blockh2_kl_delta` | — | −4,24 % (0,023154 vs 0,024179) | mejora |
| `wikitext2_vs_global_sort_kl_delta` | — | −11,03 % (0,023154 vs 0,026025) | mejora |
| `wikitext2_vs_unperm_blockh4_kl_delta` | — | −6,54 % (0,023154 vs 0,024774) | mejora |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 2.327 MiB (2,4 GB) en disco. En memoria, la representación empaquetada requiere espacio adicional para los tensores auxiliares (`qham11`, `qquot`, CSR de desbordamientos, escalas); no se documenta el pico de VRAM en decodificación.
- GPU recomendadas: no se especifican en la model card. El kernel de referencia está escrito para Ampere `sm_86` (RTX 30xx, A10, A40), lo que sugiere compatibilidad con esa generación; no se confirma soporte en Ada, Hopper ni arquitecturas anteriores.
- Cabe en GPU de consumo: por tamaño de checkpoint (2,4 GB) es plausible en GPUs con 8 GB o más de VRAM, pero no se confirma oficialmente; el modelo base Qwen2.5-3B en BF16 ocupa 5.885,79 MiB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (soporte nativo del formato); exportación a BF16 con `siliquant_dequant.py unpack` para usar en vLLM, llama.cpp, Ollama o TGI (estos motores no consumen el formato `siliquant-hf-v1` directamente según la información disponible).
- Latencia y throughput: no disponibles. Los kernels de referencia (`sm86_a16_blockh4.cu` y `avx512_a16_blockh4.c`) son código de referencia para GEMV, no se reportan cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadSnake-4.5bpw | 2.050.986.216 (checkpoint cuantizado) | no disponible | Siliquant hA16, 5,2390 bpw efectivos | qwen-research | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B (BF16) | 3,09B (modelo base) | 32.768 tokens (según ficha oficial del modelo base; no confirmado en esta card) | BF16 | qwen-research | Hugging Face, ampliamente usado |
| Cuantizaciones GPTQ/AWQ de Qwen2.5-3B | ~3B | heredado del base | 4-8 bits | qwen-research | disponibles en el Hub |
| Cuantizaciones GGUF de Qwen2.5-3B | ~3B | heredado del base | Q4_K_M, Q5_K_M, etc. | qwen-research | disponibles en el Hub |

La comparativa de rendimiento frente a GPTQ, AWQ o GGUF no puede establecerse con los datos publicados: la model card solo compara internamente contra otras variantes de Siliquant (BlockH2, global-sort, unperm-BlockH4) mediante deltas de KL. No se dispone de benchmarks de tareas comunes para una comparación justa.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en producción ni validación externa.
- Sin benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.): solo se publican perplejidades y KL sobre WikiText-2 y CPython, insuficientes para evaluar capacidades reales.
- Idiomas soportados no declarados: no se puede confirmar el comportamiento multilingüe del checkpoint cuantizado.
- Longitud de contexto no confirmada en la model card: aunque el modelo base Qwen2.5-3B soporta 32.768 tokens, no se garantiza que la cuantización preserve ese comportamiento.
- Licencia `qwen-research` heredada: restringe el uso comercial; es necesario revisar los términos del modelo base antes de cualquier despliegue productivo.
- Requiere `trust_remote_code=True` para cargar el modelo: se ejecuta código Python del repositorio, lo que implica un riesgo de seguridad si no se audita.
- El formato `siliquant-hf-v1` no es estándar: los motores de inferencia habituales (vLLM, llama.cpp, TGI, Ollama) no lo consumen directamente; hay que exportar a BF16 con `siliquant_dequant.py unpack`, lo que elimina la ventaja de compresión.
- Los kernels de referencia son GEMV de precisión fija a 4 bits y no cubren el contenedor lossless `qham11`+`qquot`+CSR; no se documenta su integración con `transformers` ni su rendimiento.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen2.5-3B; no se documenta ningún análisis específico sobre el checkpoint cuantizado.
- La verificación bit-a-bit garantiza fidelidad del empaquetado, no calidad del modelo: una perplejidad más alta que el BF16 (11,06 vs 10,97 en WikiText-2) indica degradación medible aunque pequeña.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadSnake-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Repositorio upstream de Siliquant: https://github.com/Moissanite-Labs/siliquant
- PR #83: https://github.com/Moissanite-Labs/siliquant/pull/83
- PR #85: https://github.com/Moissanite-Labs/siliquant/pull/85
- PR #91: https://github.com/Moissanite-Labs/siliquant/pull/91
- PR #93: https://github.com/Moissanite-Labs/siliquant/pull/93
- PR #95: https://github.com/Moissanite-Labs/siliquant/pull/95
