# lkaiser/Titan-Llama-3.1-8B-seg512

## Resumen

Titan-Llama-3.1-8B-seg512 es un experimento de replicación abierta del trabajo "Titan-Llama: Retrofitting Pre-trained LLMs with External Neural Memory Modules" (arXiv:2610.19210), aplicado sobre el checkpoint unsloth/Meta-Llama-3.1-8B-Instruct. El autor, lkaiser, sustituye las cuatro primeras capas del backbone por capas TitanDecoderLayer que combinan atención causal segmentada (segment_len=512) con un módulo de memoria neural externa (MemoryMLP de tres capas por cada cabecera KV). El backbone de 8.030M de parámetros permanece congelado y solo se entrenan 68,80M de parámetros nuevos.

El objetivo del proyecto es explorar si es posible dotar a un transformer preentrenado de memoria neural de largo alcance con un coste de entrenamiento reducido, en lugar de reentrenar el modelo desde cero. El repositorio incluye cuatro checkpoints correspondientes a distintas fases del pipeline: preentrenamiento continuado, SFT de contexto largo, SFT con memoria forzada y destilación de atención capa a capa.

Es relevante ahora porque publica pesos y código de un mecanismo poco común (memoria neural acoplada a atención segmentada) y porque documenta con detalle los compromisos entre recuperación de contexto largo y rendimiento general. El checkpoint recomendado por el autor, seg512_distill_sft, recupera parte de la degradación introducida por la segmentación, aunque sigue por debajo del modelo base en tareas de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1) con capas 0-3 sustituidas por TitanDecoderLayer: atención causal segmentada (segment_len=512) + MemoryMLP de 3 capas por cabecera KV |
| Parametros totales | 8.030M (backbone congelado) + 68,80M entrenables (memoria neural, atención segmentada y residuales de valor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en entrenamiento; evaluado hasta 16K |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | nmm_only_weights.pt (PyTorch, BF16, ~138 MB) + training_config.json; requiere cargar el backbone base por separado |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3.1-8B-Instruct y reemplaza las capas 0 a 3 por TitanDecoderLayer. Cada una combina atención causal segmentada con segment_len=512 (la atención no cruza fronteras de segmento) y un módulo de memoria neural MemoryMLP de tres capas por cabecera KV, con neural_memory_batch_size=512. El backbone de 8.030M de parámetros queda congelado; solo se entrenan 68,80M de parámetros nuevos, lo que hace el ajuste muy ligero en comparación con un reentrenamiento completo.

El entrenamiento se organiza en cuatro fases. La fase 1 (seg512_pretrain) hace preentrenamiento continuado con 1.000M de tokens sobre FineWeb-Edu y LongAlign, con sequence_length=16.384, batch_size=64 y 953 pasos. La fase 2 (seg512_gold_sft) aplica SFT general de contexto largo sobre LongAlign y LoongRL durante 200 pasos. La fase 3 (seg512_forced_memory_sft) usa neural_memory_batch_size=512 y memory_forced_query_tokens=512 para forzar el uso de la memoria. La fase 4 (seg512_distill_sft), la recomendada, parte de gold_sft y aplica destilación de atención del profesor capa a capa en las capas 0 a 3 (distill_weight=1.0), reduciendo el error de reconstrucción de atención de 3,1768 a 1,2338 (factor 2,6x). No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento general heredados del backbone Llama-3.1-8B-Instruct.
- Recuperación en contexto largo mediante memoria neural externa, con resultados medibles en LongHealth (16K) y S-NIAH Passkey.
- Razonamiento matemático en modo few-shot, con resultados documentados en AQuA-RAT y MMLU-Math/STEM.
- Atención segmentada que reduce el coste computacional de la atención a cambio de perder acceso global al contexto en las capas sustituidas.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible (se heredaría del backbone, pero no se valida en la model card).
- Capacidades de agente y multi-step reasoning: no documentadas.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre memoria neural en LLM: el repositorio permite reproducir y extender el trabajo Titan-Llama sobre un backbone estándar, comparando las cuatro fases de entrenamiento con métricas de recuperación en contexto largo.
- Evaluación de atención segmentada: sirve para medir el coste real de sustituir atención global por atención por segmentos en las primeras capas, con datos de QuALITY, LongHealth y S-NIAH.
- Prototipos de recuperación de pasajes largos: el checkpoint distill_sft alcanza 96,0% en Passkey a 4K y 76,0% a 8K, útil para experimentos de needle-in-a-haystack con documentos de hasta 8K tokens.
- Destilación de atención como técnica: el pipeline de destilación capa a capa (reducción de error 3,1768 a 1,2338) es reutilizable para otros retrofits de memoria en modelos preentrenados.
- Análisis de compromisos precisión-contexto: los benchmarks de MMLU-Math/STEM y AQuA-RAT permiten estudiar cómo la segmentación degrada el razonamiento en prompts largos (por ejemplo, 29,04% frente a 49,78% en MMLU-Math/STEM 30-shot).
- Base para fine-tuning ligero: al entrenar solo 68,80M de parámetros, es un punto de partida de bajo coste para adaptar memoria neural a dominios concretos sin tocar el backbone.

## Benchmarks y rendimiento

Evaluación estándar (capas 0-3 segmentadas + NMM):

| Modelo / checkpoint | QuALITY (8K) | LongHealth (16K) | S-NIAH Passkey 4K / 8K / 16K | S-NIAH Number 4K / 8K |
|---|---|---|---|---|
| Full Attention (Llama-3.1-8B-Instruct) | 73,59 ± 0,97% | 81,25 ± 1,95% | 100,0% / 100,0% / 100,0% | 100,0% / 98,0% |
| Segmented Attention (seg=512, sin NMM) | 29,29 ± 1,00% | 14,75 ± 1,77% | 56,0% / 0,0% / 0,0% | 60,0% / 0,0% |
| Stage 1 (seg512_pretrain) | 23,73 ± 0,93% | 14,25 ± 1,75% | 0,0% / 0,0% / 0,0% | 0,0% / 0,0% |
| Stage 2 (seg512_gold_sft) | 23,54 ± 0,93% | 15,50 ± 1,81% | 0,0% / 0,0% / 0,0% | 0,0% / 0,0% |
| Stage 4 (seg512_distill_sft) | 25,36 ± 0,95% | 18,75 ± 1,95% | 96,0% / 76,0% / 32,0% | 16,0% / 2,0% |

Evaluación con todas las capas segmentadas (--restrict-all-layers):

| Checkpoint | Error destilación capas 0-3 | QuALITY (8K) | LongHealth (16K) | S-NIAH Passkey 4K / 8K | S-NIAH Number 4K |
|---|---|---|---|---|---|
| seg512_gold_sft | 3,1768 | 25,59 ± 1,93% | 20,75 ± 2,03% | 0,0% / 0,0% | 0,0% |
| seg512_forced_memory_sft | 44,8058 | 24,80 ± 1,91% | 27,00 ± 2,22% | 0,0% / 0,0% | 0,0% |
| seg512_distill_sft | 1,2338 | 26,56 ± 1,95% | 23,50 ± 2,12% | 31,2% / 21,9% | 12,5% |

Razonamiento matemático y benchmarks generales:

| Benchmark | Régimen | Full Attention | Segmented No-NMM | Stage 2 (gold_sft) | Stage 4 (distill_sft) |
|---|---|---|---|---|---|
| ARC-Challenge | Corto (68,0 tok) | 82,49% | 82,49% | 82,49% | 82,49% |
| BoolQ | Corto (143,7 tok) | 84,20% | 83,60% | 83,80% | 83,80% |
| Winogrande | Corto (43,6 tok) | 53,00% | 53,20% | 53,20% | 53,20% |
| AQuA-RAT | 0-shot corto (78,8 tok) | 25,98% | 24,80% | 24,80% | 24,80% |
| AQuA-RAT | 8-shot CoT largo (1.442,8 tok) | 28,74% | 25,59% | 15,75% | 20,87% |
| MMLU-Math/STEM | 5-shot frontera (521,0 tok) | 51,11% | 43,63% | 35,19% | 39,26% |
| MMLU-Math/STEM | 30-shot largo (2.785,6 tok) | 49,78% | 29,11% | 24,22% | 29,04% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el backbone Llama-3.1-8B-Instruct en BF16 requiere aproximadamente 16 GB de VRAM, a lo que hay que sumar el checkpoint de memoria (~138 MB) y el estado de inferencia del módulo NMM.
- GPU recomendadas: no especificadas por el autor. Por tamaño de backbone, encajan A100, H100, L40S o RTX 4090/3090 en BF16 con suficiente memoria.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) o RTX 3090 (24 GB) con el backbone en BF16, aunque no está confirmado en la model card.
- Opciones de despliegue: la carga se realiza mediante TitanLLaMAForCausalLM.from_pretrained con el paquete titan_llama, no mediante vLLM, llama.cpp, Ollama ni TGI de forma directa, ya que las capas TitanDecoderLayer y el módulo de memoria no son estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LongHealth 16K | S-NIAH Passkey 4K / 8K / 16K | Licencia |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (full attention) | 8.030M | 128K (nativo) | 81,25% | 100% / 100% / 100% | Llama 3.1 Community |
| Titan-Llama seg512 (distill_sft, recomendado) | 8.030M + 68,80M | 16K en entrenamiento | 18,75% (capas 0-3) / 23,50% (todas segmentadas) | 96% / 76% / 32% | Apache-2.0 |
| Titan-Llama seg512 (forced_memory_sft) | 8.030M + 68,80M | 16K | 27,00% (todas segmentadas) | 0% / 0% | Apache-2.0 |
| Segmented Attention sin NMM (ablación) | 8.030M | 16K | 14,75% | 56% / 0% / 0% | Apache-2.0 |

## Limitaciones y advertencias

- Degradación severa frente al modelo base: en QuALITY pasa de 73,59% a 25,36% y en LongHealth de 81,25% a 18,75% con el checkpoint recomendado, lo que lo hace inadecuado para producción de contexto largo en su estado actual.
- El checkpoint forced_memory_sft obtiene el mejor LongHealth (27,00%) pero con error de destilación de atención muy alto (44,8058) y recuperación Passkey nula.
- La recuperación en S-NIAH cae con la longitud: 96,0% a 4K, 76,0% a 8K y 32,0% a 16K en el mejor caso.
- El razonamiento matemático en prompts largos se degrada notablemente: MMLU-Math/STEM 30-shot cae de 49,78% (full attention) a 29,04% (distill_sft).
- Idiomas soportados no documentados; el entrenamiento se realizó sobre FineWeb-Edu, LongAlign y LoongRL, predominantemente en inglés.
- Riesgo de alucinación: no evaluado en la model card.
- Sesgos conocidos: no documentados; se heredan los del backbone Llama-3.1-8B-Instruct.
- Restricciones de licencia: el repo se declara apache-2.0, pero el backbone base (Meta-Llama-3.1-8B-Instruct vía unsloth) mantiene su propia licencia Llama 3.1 Community, que impone condiciones adicionales al uso comercial.
- Requiere código personalizado (titan_llama) para cargar los pesos; no es compatible con herramientas de inferencia estándar sin adaptación.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, y fue creado el 2026-10-30, por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lkaiser/Titan-Llama-3.1-8B-seg512
- Paper de referencia: https://arxiv.org/pdf/2610.19210
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
