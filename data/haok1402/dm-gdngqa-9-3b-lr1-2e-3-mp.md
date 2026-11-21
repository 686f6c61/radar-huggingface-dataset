# haok1402/DM-GDNGQA-9.3B-LR1.2e-3-MP

## Resumen

DM-GDNGQA-9.3B-LR1.2e-3-MP es un modelo de lenguaje de 9.274.983.360 parámetros desarrollado por el usuario haok1402 y publicado en Hugging Face. Se trata de un transformer híbrido que combina capas GatedDeltaNet (atención lineal con decaimiento) y capas de atención GQA (Grouped Query Attention) en una proporción de 3:1, con 36 capas en total. El modelo fue preentrenado desde cero sobre 30.000 millones de tokens del corpus Nemotron-CC.

El modelo no es un lanzamiento de producción al uso, sino el brazo "MP" (mixed precision limpio) de un estudio experimental sobre precisión de entrenamiento en las capas de atención. En concreto, se entrenaron tres modelos idénticos salvo por la precisión de la atención: uno con FlashAttention-3 en bf16 (este), uno con atención FP8 ingenua (stale) y uno con atención FP8 mediante Delta-Matching (matched). El objetivo del estudio es medir el impacto de la cuantización FP8 en la atención sobre la calidad final del modelo.

Su relevancia es, por tanto, fundamentalmente investigadora: sirve como referencia de control para comparar el efecto de técnicas de entrenamiento en FP8 sobre arquitecturas híbridas con atención lineal. El modelo usa el tokenizador Llama-2 de 32k tokens y una longitud de contexto de 8.192 tokens, y se distribuye en safetensors bf16 con código propio incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 36 capas = [GatedDeltaNet, GatedDeltaNet, GatedDeltaNet, GQA] × 9 |
| Parametros totales | 9.274.983.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador Llama-2 de 32k, sin listado oficial de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), con código propio `modeling_bqalm.py` y `configuration_bqalm.py` |

Otras especificaciones técnicas:

| Parametro | Valor |
|---|---|
| Anchura (d_model) | 4.096 |
| FFN SwiGLU | 12.288 |
| Embeddings | atados (tied) |
| GatedDeltaNet | 16 cabezas query/key × 128, 32 cabezas value × 256, con compuerta y convolución corta (flash-linear-attention, modo chunk) |
| Atención GQA | 16 cabezas query / 4 cabezas KV × 256, qk-norm, RoPE parcial 0.25 (θ = 1e7), salida con compuerta |
| Tokenizador | Llama-2, 32k tokens |
| Tamaño del repo | 18,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que intercala tres capas GatedDeltaNet por cada capa de atención GQA, repetido nueve veces hasta 36 capas. Las capas GatedDeltaNet implementan una forma de atención lineal recurrente con compuerta y convolución corta, implementadas mediante la librería flash-linear-attention en modo chunk. Las capas GQA usan 16 cabezas de query y 4 de clave/valor de dimensión 256, con qk-norm, RoPE parcial (25 % de las dimensiones, θ = 1e7) y salida con compuerta. El FFN es SwiGLU con dimensión intermedia 12.288 y los embeddings están atados.

El entrenamiento se realizó desde cero sobre 30.000 millones de tokens de Nemotron-CC (`nemotron_cc_v2d1_hq_dqa`), empaquetados en secuencias de 8.192 tokens. Se usaron 28.610 pasos con batch global de 128 × 8.192 tokens, optimizador AdamW (β = 0.9/0.95, ε = 1e-8, weight decay 0.1, gradient clip 1.0, z-loss 1e-4) y un schedule WSD: 3,33 % de warmup hasta 1,2e-3, fase constante y decaimiento lineal a cero en el último 20 %. La semilla de inicialización fue 11785 y todos los brazos del estudio leen los mismos datos en el mismo orden. El entrenamiento se ejecutó con un port propio de Megatron-LM (Megatron-Core 0.20, Megatron-FSDP) sobre 4 × 8 GPU H200. En este brazo MP, las capas de atención se entrenaron con FlashAttention-3 en bf16 (precisión mixta estándar BF16/FP32) y los GEMM del FFN en FP8; las capas GatedDeltaNet son bf16 en los tres brazos. La innovación técnica del estudio es el uso de Delta-Matching para estabilizar la atención en FP8, que aquí sirve como referencia de control.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy y por muestreo (`num_beams=1`).
- Razonamiento básico y conocimiento factual, medido en MMLU (0,4347) y TriviaQA 5-shot (0,2585).
- Recuperación de contexto y tareas de recall multi-query (MQAR 0,1281; RULER 61,41 en 4k y 8k).
- Comprensión lectora y extracción de información (Extract 0,7113 sobre SWDE, FDA y SQuAD completion).
- Evaluación en tareas de sentido común y conocimiento general (CSense-9 = 0,6392 sobre LAMBADA, HellaSwag, PIQA, ARC-e, ARC-c, SciQ, OpenBookQA, WinoGrande y COPA).
- Soporte de caché de inferencia: mantiene estados K/V de las capas GQA y estados recurrentes y de convolución de las capas GatedDeltaNet, de modo que cada token nuevo cuesta un paso.
- Fine-tuning con el `Trainer` de transformers en bf16 mediante pérdida de entropía cruzada next-token.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles oficialmente; el tokenizador Llama-2 de 32k cubre principalmente inglés y un conjunto limitado de idiomas.

## Casos de uso

- Investigación sobre entrenamiento en FP8: este modelo es el brazo de control limpio para comparar el impacto de la atención FP8 (brazos SD y DM) sobre la perplejidad de validación y benchmarks; se usaría como referencia en experimentos de reproducibilidad.
- Estudio de arquitecturas híbridas atención lineal + GQA: permite analizar el comportamiento de las capas GatedDeltaNet frente a GQA en tareas de recuperación de contexto largo (RULER, MQAR) con 8.192 tokens.
- Evaluación de eficiencia de decodificación: al mantener estados recurrentes en las capas GatedDeltaNet, el coste por token es constante; útil para medir throughput en generación frente a transformers densos del mismo tamaño.
- Fine-tuning específico de dominio: al ser un modelo base preentrenado solo con 30.000 millones de tokens, sirve como punto de partida para ajuste supervisado en tareas concretas con el `Trainer` de transformers en bf16.
- Benchmarking de pipelines de inferencia: con 18,6 GB en bf16, es un candidato para probar vLLM o TGI (siempre que soporten el código custom `bqalm`), o para validar latencias en GPU H200/A100.
- Reproducción académica: el repositorio incluye el código de modelado y configuración, lo que permite reproducir los logits del cargador original bit a bit con SDPA o FlashAttention-2.
- Análisis de tokenizador Llama-2 en modelos híbridos: útil para estudiar cómo afecta el vocabulario de 32k a tareas de extracción y trivia en un modelo pequeño.

## Benchmarks y rendimiento

Resultados publicados en la model card (semilla 11785):

| Modelo | val CE (nats/token) | RULER | CSense-9 | Extract | TriviaQA | MMLU | MQAR |
|---|---|---|---|---|---|---|---|
| MP (clean, este modelo) | 1,2993 | 61,41 | 0,6392 | 0,7113 | 0,2585 | 0,4347 | 0,1281 |
| SD (stale) | 1,5595 | 40,43 | 0,5470 | 0,5573 | 0,0795 | 0,2839 | 0,1746 |
| DM (match) | 1,2985 | 62,84 | 0,6406 | 0,7139 | 0,2564 | 0,4411 | 0,1599 |

Notas: val CE es la entropía cruzada en 2.000 ventanas reservadas de 8.192 tokens (menor es mejor). RULER es la media de 13 tareas a 4k y 8k. CSense-9 agrupa LAMBADA, HellaSwag, PIQA, ARC-e, ARC-c, SciQ, OpenBookQA, WinoGrande y COPA. Extract agrupa SWDE, FDA y SQuAD completion. TriviaQA es exact match 5-shot. MQAR es recall sintético multi-query clave-valor. Cada brazo se entrenó una sola vez, por lo que no hay barra de error entre semillas. A LR 1,2e-3, el brazo stale queda +0,2602 nats/token por encima del limpio en val CE (RULER 40,43 frente a 61,41), mientras que el brazo match queda -0,0008 por debajo (RULER 62,84).

## Requisitos de hardware

- VRAM para inferencia en bf16: 18,6 GB solo para los pesos, más caché K/V y estados recurrentes; se recomienda al menos 24 GB para secuencias cortas y 40-80 GB para contexto completo de 8.192 tokens.
- GPU recomendadas: H200 (usadas en el entrenamiento), H100, A100 80 GB. En consumer, una RTX 4090 (24 GB) puede alojar los pesos en bf16, pero el margen para contexto largo es ajustado.
- Cuantización: no se documentan pesos GGUF, AWQ ni GPTQ; no hay opciones oficiales para reducir por debajo de bf16.
- Despliegue: requiere `torch`, `transformers` >= 5 y `flash-linear-attention` (probado con torch 2.12, transformers 5.9.0 y flash-linear-attention 0.5.2), más `trust_remote_code=True`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, dado el código custom y las capas GatedDeltaNet.
- Restricción de batching: los prompts agrupados deben compartir longitud, porque las capas GatedDeltaNet no tienen máscara de padding.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DM-GDNGQA-9.3B-LR1.2e-3-MP | 9,27 B | 8.192 | no disponible | Hugging Face (repo propio) | Brazo limpio del estudio; bf16 |
| DM-GDNGQA-9.3B-LR1.2e-3-SD | 9,27 B | 8.192 | no disponible | Hugging Face | Brazo stale (atención FP8 ingenua) |
| DM-GDNGQA-9.3B-LR1.2e-3-DM | 9,27 B | 8.192 | no disponible | Hugging Face | Brazo match (Delta-Matching FP8) |
| DM-GDNGQA-9.3B-LR2.4e-3-MP/SD/DM | 9,27 B | 8.192 | no disponible | Hugging Face | Variante con LR pico 2,4e-3 |

No se dispone de comparación con modelos de la misma categoría (por ejemplo, Llama-3.1-8B o Qwen2.5-7B) en la información proporcionada, ya que no se han publicado resultados frente a ellos.

## Limitaciones y advertencias

- Modelo de investigación: preentrenado solo con 30.000 millones de tokens, muy por debajo de los presupuestos habituales de modelos de producción; su calidad en tareas abiertas es limitada (MMLU 0,4347, TriviaQA 0,2585).
- Sin licencia declarada: no se especifican términos de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Sesgos: no documentados, pero el corpus Nemotron-CC puede introducir sesgos de dominio web; no hay evaluación de sesgos publicada.
- Alucinación: riesgo alto por el bajo presupuesto de entrenamiento y la ausencia de RLHF/DPO documentado.
- Contexto limitado a 8.192 tokens y sin máscara de padding en las capas GatedDeltaNet, lo que restringe el batching con prompts de distinta longitud.
- Idiomas: no se documenta cobertura multilingüe; el tokenizador Llama-2 favorece el inglés.
- Dependencia de código custom (`trust_remote_code=True`) y de flash-linear-attention; no hay soporte documentado en motores de inferencia estándar.
- El kernel CUDA de atención FP8 Delta-Matching no se distribuye; los pesos exportados son bf16 y ejecutan SDPA en bf16.
- Sin barra de error entre semillas: cada brazo se entrenó una sola vez (semilla 11785).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-MP
- Brazo stale (SD): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-SD
- Brazo match (DM): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-DM
- Variante LR 2.4e-3 MP: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-MP
- Variante LR 2.4e-3 SD: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-SD
- Variante LR 2.4e-3 DM: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-DM
- Paper del estudio: no disponible (la model card referencia el Apéndice C.8.1 sin enlace)
- Repositorio de flash-linear-attention: no disponible en la información proporcionada
- Demo: no disponible
