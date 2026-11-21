# haok1402/DM-GDNGQA-9.3B-LR1.2e-3-SD

## Resumen

DM-GDNGQA-9.3B-LR1.2e-3-SD es un modelo de lenguaje de 9.274.983.360 parámetros desarrollado por el usuario haok1402 como parte de un estudio experimental sobre precisión de entrenamiento en el mecanismo de atención. Se trata del brazo "stale" (SD) de un conjunto de tres modelos entrenados de forma idéntica —misma arquitectura, mismos datos, mismo orden de lectura y misma semilla de inicialización— que solo difieren en la precisión con la que se entrena la atención: bf16 FlashAttention-3 (MP), FP8 con delta obsoleto (SD, este modelo) y FP8 con Delta-Matching (DM).

El modelo emplea una arquitectura híbrida de 36 capas compuesta por 27 capas GatedDeltaNet (atención lineal con estado recurrente) y 9 capas de atención GQA clásica, con un ancho de 4096, FFN SwiGLU de 12.288 y embeddings atados. Se entrenó desde cero sobre 30.000 millones de tokens de Nemotron-CC con una longitud de contexto de 8.192 tokens y un pico de learning rate de 1,2e-3.

Su relevancia es fundamentalmente investigadora: no es un modelo pensado para producción, sino un artefacto científico que documenta el coste de entrenar la atención en FP8 sin corregir el sesgo del delta acumulado. Los resultados publicados por el autor muestran que este brazo queda muy por detrás del brazo limpio en validación (1,5595 frente a 1,2993 nats/token) y en RULER (40,43 frente a 61,41), lo que convierte al modelo en una referencia negativa útil para estudiar inestabilidad numérica en FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 36 capas = [GatedDeltaNet, GatedDeltaNet, GatedDeltaNet, GQA] × 9 |
| Parametros totales | 9.274.983.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el repo incluye tag fp8 referido al entrenamiento, no a pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), con código de modelado propio (`modeling_bqalm.py`, `configuration_bqalm.py`) |

Otras especificaciones técnicas:

| Parametro | Valor |
|---|---|
| Ancho (d_model) | 4.096 |
| FFN | SwiGLU, 12.288 |
| Embeddings | atados (tied) |
| GatedDeltaNet | 16 cabezas query/key × 128, 32 cabezas value × 256, con compuerta y convolución corta (flash-linear-attention, modo chunk) |
| Atención GQA | 16 cabezas query / 4 cabezas KV × 256, qk-norm, RoPE parcial 0.25 (θ = 1e7), salida con compuerta |
| Tokenizer | Llama-2, vocabulario de 32k |
| Tamaño del repo | 18,6 GB |
| Precisión de pesos | bf16 |

## Arquitectura y entrenamiento

La arquitectura combina capas de atención lineal GatedDeltaNet con capas de atención GQA en un patrón repetido de tres capas DeltaNet por cada capa GQA. Las capas GatedDeltaNet mantienen un estado recurrente y un estado de convolución corta, lo que permite decodificación token a token con coste constante por paso; las capas GQA aportan atención global clásica con 16 cabezas query y 4 cabezas KV de dimensión 256, qk-norm, RoPE parcial al 25 % y salida con compuerta. El modelo se exporta con atención bf16 SDPA en todos los brazos del estudio, de modo que los tres repositorios comparten arquitectura y difieren únicamente en los pesos.

El entrenamiento se realizó desde cero sobre Nemotron-CC (`nemotron_cc_v2d1_hq_dqa`), empaquetado en secuencias de 8.192 tokens, con un presupuesto de 28.610 pasos × batch global 128 × 8.192 tokens = 30.000 millones de tokens. Se usó AdamW (β 0,9/0,95, ε 1e-8, weight decay 0,1, gradient clip 1,0, z-loss 1e-4) y un schedule WSD con 3,33 % de warmup hasta 1,2e-3, fase constante y decaimiento lineal a cero en el último 20 %. El entrenamiento corrió sobre 4 × 8 H200 con un port propio de Megatron-LM (Megatron-Core 0.20, Megatron-FSDP) y semilla 11785 solo para inicialización.

La innovación técnica del estudio es el uso de Delta-Matching FP8 en la atención. Este brazo (SD) entrena la atención con FP8 en modo "stale", es decir, con el delta obsoleto, mientras que el brazo DM aplica Delta-Matching con delta emparejado y el brazo MP usa FlashAttention-3 en bf16. Las capas GatedDeltaNet permanecen en bf16 en los tres brazos. El kernel CUDA de FP8 empleado en el entrenamiento no se distribuye con el repositorio: los pesos exportados son bf16 y la inferencia se ejecuta con SDPA en bf16.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy y por muestreo (`num_beams=1`).
- Razonamiento básico y respuesta a preguntas, aunque con rendimiento degradado respecto al brazo limpio del mismo estudio.
- Recuperación de clave-valor multi-query (MQAR) sintética, donde este brazo obtiene 0,1746, por encima del brazo limpio (0,1281) y del brazo DM (0,1599).
- Evaluación de sentido común y conocimiento en nueve tareas (CSense-9: LAMBADA, HellaSwag, PIQA, ARC-e, ARC-c, SciQ, OpenBookQA, WinoGrande, COPA) con 0,5470 de media.
- Extracción de información (SWDE, FDA, SQuAD completion) con 0,5573.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (tokenizer Llama-2 de 32k, idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Fine-tuning con el `Trainer` de `transformers` en bf16 mediante la pérdida de entropía cruzada next-token.

## Casos de uso

- Estudio de estabilidad numérica en FP8: el modelo sirve como referencia negativa para cuantificar cuánto degrada el entrenamiento de la atención en FP8 con delta obsoleto frente a bf16 y frente a Delta-Matching, usando la tabla de evaluación del propio autor (val CE 1,5595 frente a 1,2993 y 1,2985).
- Reproducción de experimentos de investigación: al compartir arquitectura y datos con los otros cinco repositorios del estudio (MP, SD y DM en LR 1.2e-3 y LR 2.4e-3), permite aislar el efecto de la precisión de atención manteniendo constantes el resto de variables.
- Análisis de arquitecturas híbridas atención lineal + GQA: las 27 capas GatedDeltaNet con estado recurrente permiten estudiar el comportamiento de la memoria de largo alcance con contexto de 8.192 tokens y comparar con el patrón de atención global de las 9 capas GQA.
- Evaluación de tareas de recall sintético: el resultado MQAR superior de este brazo (0,1746) lo hace útil para investigar si la cuantización FP8 de la atención altera de forma diferencial la recuperación de pares clave-valor frente a tareas de sentido común.
- Benchmarking de pipelines de evaluación: el modelo se puede cargar con `trust_remote_code=True` y `transformers` >= 5 para validar harnesses de evaluación (RULER, CSense-9, TriviaQA) contra los números publicados por el autor.
- Docencia y formación: como ejemplo didáctico de cómo un cambio de precisión en una sola componente (la atención) puede degradar un modelo de 9.300 millones de parámetros entrenado sobre 30.000 millones de tokens, con métricas concretas por tarea.
- Fine-tuning controlado en bf16: la pérdida next-token estándar permite adaptar el modelo con el `Trainer` de `transformers` para estudiar si el ajuste posterior recupera parte de la degradación del preentrenamiento en FP8.

## Benchmarks y rendimiento

Resultados publicados por el autor (semilla 11785, una sola ejecución por brazo, sin barra de error entre semillas):

| Modelo | val CE (nats/token) | RULER | CSense-9 | Extract | TriviaQA | MMLU | MQAR |
|---|---|---|---|---|---|---|---|
| MP (clean, bf16 FA-3) | 1,2993 | 61,41 | 0,6392 | 0,7113 | 0,2585 | 0,4347 | 0,1281 |
| **SD (stale, este modelo)** | **1,5595** | **40,43** | **0,5470** | **0,5573** | **0,0795** | **0,2839** | **0,1746** |
| DM (match, Delta-Matching) | 1,2985 | 62,84 | 0,6406 | 0,7139 | 0,2564 | 0,4411 | 0,1599 |

Notas sobre las métricas: val CE se mide en nats/token sobre 2.000 ventanas retenidas de 8.192 tokens (menor es mejor); RULER es la media de 13 tareas a 4k y 8k; CSense-9 agrupa LAMBADA, HellaSwag, PIQA, ARC-e, ARC-c, SciQ, OpenBookQA, WinoGrande y COPA; Extract agrupa SWDE, FDA y SQuAD completion; TriviaQA es exact match con 5 ejemplos; MQAR es recall sintético multi-query clave-valor.

A LR 1.2e-3, el brazo stale termina +0,2602 nats/token por encima del limpio en val CE y con RULER 40,43 frente a 61,41, mientras que el brazo match queda a −0,0008 nats/token del limpio (RULER 62,84). La caída más acusada se da en TriviaQA (0,0795 frente a 0,2585) y en MMLU (0,2839 frente a 0,4347).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,6 GB solo para los pesos, más el estado recurrente y de convolución de las capas GatedDeltaNet y la caché K/V de las capas GQA; en la práctica se recomienda reservar 24 GB o más para contexto completo de 8.192 tokens.
- GPU recomendadas: H200 (las usadas en el entrenamiento), H100, A100 de 80 GB. En bf16 cabe en una sola GPU de 24 GB o más para pesos, aunque el margen para caché y activaciones es ajustado.
- ¿Cabe en GPU de consumo? Sí, en bf16 cabe en tarjetas con 24 GB o más (RTX 3090, RTX 4090, RTX 5090). En tarjetas de 16 GB requeriría cuantización, que no está publicada en el repositorio.
- Opciones de despliegue: el repositorio incluye código propio (`modeling_bqalm.py`, `configuration_bqalm.py`) y requiere `torch`, `transformers` >= 5 y `flash-linear-attention` (probado con torch 2.12, transformers 5.9.0, flash-linear-attention 0.5.2). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no haber pesos GGUF publicados, llama.cpp y Ollama no son opciones directas.
- Latencia y throughput: no disponibles. El autor indica que `generate()` mantiene caché (K/V de las capas GQA y estados recurrente y de convolución de las GatedDeltaNet), de modo que cada token nuevo cuesta un paso, pero no publica cifras de latencia ni de tokens por segundo.
- Restricción de batching: los prompts agrupados en un mismo batch deben compartir longitud, porque las capas GatedDeltaNet no tienen máscara de padding.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | val CE / RULER | Licencia |
|---|---|---|---|---|---|
| DM-GDNGQA-9.3B-LR1.2e-3-SD (este) | 9,27 B | 8.192 | Híbrida GatedDeltaNet + GQA, atención FP8 stale | 1,5595 / 40,43 | no disponible |
| DM-GDNGQA-9.3B-LR1.2e-3-MP | 9,27 B | 8.192 | Híbrida GatedDeltaNet + GQA, atención bf16 FA-3 | 1,2993 / 61,41 | no disponible |
| DM-GDNGQA-9.3B-LR1.2e-3-DM | 9,27 B | 8.192 | Híbrida GatedDeltaNet + GQA, atención FP8 Delta-Matching | 1,2985 / 62,84 | no disponible |
| DM-GDNGQA-9.3B-LR2.4e-3-SD | 9,27 B | 8.192 | Híbrida GatedDeltaNet + GQA, atención FP8 stale, LR 2,4e-3 | no disponible en esta ficha | no disponible |

La comparación más informativa es interna al estudio: los tres brazos comparten arquitectura, datos, orden de lectura y semilla, por lo que las diferencias de rendimiento son atribuibles exclusivamente a la precisión de entrenamiento de la atención. Frente a modelos de la misma categoría de tamaño (por ejemplo, Llama-3.1-8B o Qwen2.5-7B), no hay datos comparativos publicados en la información disponible, y las diferencias de tokenizer, datos y presupuesto de entrenamiento (30.000 millones de tokens frente a billones en modelos comerciales) hacen que la comparación directa no sea significativa.

## Limitaciones y advertencias

- Degradación severa por el entrenamiento en FP8 stale: +0,2602 nats/token en validación y caída de RULER de 61,41 a 40,43 respecto al brazo limpio. No es un modelo recomendable para uso en producción.
- TriviaQA cae a 0,0795 (frente a 0,2585 del brazo limpio) y MMLU a 0,2839 (frente a 0,4347), lo que indica una pérdida acusada de conocimiento factual.
- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor antes de cualquier despliegue.
- Idiomas no declarados: el tokenizer es Llama-2 de 32k, pero no se especifica la composición lingüística de Nemotron-CC ni el soporte multilingüe real.
- Riesgo de alucinación: no cuantificado por el autor; el bajo rendimiento en TriviaQA sugiere una mayor propensión a errores factuales.
- Contexto limitado a 8.192 tokens, sin mecanismos de extensión documentados.
- Sin máscara de padding en las capas GatedDeltaNet: los batches deben tener longitud uniforme, lo que complica el serving con prompts de distinta longitud.
- El kernel CUDA de FP8 Delta-Matching usado en el entrenamiento no se distribuye; los pesos exportados son bf16 y la inferencia usa SDPA en bf16, por lo que no se reproduce exactamente el cómputo de entrenamiento.
- Una sola semilla por brazo (11785): la tabla de evaluación no tiene barra de error entre semillas, así que las diferencias no están estadísticamente caracterizadas.
- Requiere `trust_remote_code=True` y código propio del repositorio, lo que añade superficie de riesgo en la cadena de suministro.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-SD
- Brazo limpio (MP, LR 1.2e-3): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-MP
- Brazo Delta-Matching (DM, LR 1.2e-3): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-DM
- Brazo limpio (MP, LR 2.4e-3): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-MP
- Brazo stale (SD, LR 2.4e-3): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-SD
- Brazo Delta-Matching (DM, LR 2.4e-3): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-DM
- Paper del estudio: no disponible (el autor lo cita como "the paper, Appendix C.8.1" sin enlace en la model card)
- Repositorio de flash-linear-attention: no disponible en la información proporcionada
- Nemotron-CC (dataset de entrenamiento): no disponible enlace directo en la información proporcionada
