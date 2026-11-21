# haok1402/DM-GDNGQA-9.3B-LR1.2e-3-DM

## Resumen

DM-GDNGQA-9.3B-LR1.2e-3-DM es un modelo de lenguaje de 9.274.983.360 parámetros desarrollado por el usuario haok1402 como parte de un estudio controlado sobre precisión de entrenamiento en la atención. Se trata de un transformer híbrido que intercala capas GatedDeltaNet (atención lineal con estado recurrente) y capas de atención GQA clásica, en una proporción de tres a una por bloque, con 36 capas en total. El modelo se entrenó desde cero sobre 30.000 millones de tokens de Nemotron-CC, con una longitud de contexto de 8.192 tokens y un tokenizador Llama-2 de 32.000 entradas.

La relevancia del modelo no reside en su rendimiento absoluto, sino en su papel dentro de un experimento metodológico. El estudio compara tres brazos entrenados de forma idéntica salvo por la precisión con la que se entrena la atención: un brazo limpio en bf16 (FlashAttention-3), un brazo "stale" que usa atención FP8 ingenua y este brazo "match" que aplica DeltaMatching, una técnica de atención FP8 con delta emparejado (`dm_mode=matched`). Los resultados publicados muestran que el brazo stale degrada gravemente el modelo (0,2602 nats/token de cross-entropy de validación por encima del limpio), mientras que DeltaMatching recupera prácticamente la paridad (0,0008 nats por debajo del limpio, con RULER de 62,84 frente a 61,41).

Es, por tanto, un artefacto de investigación reproducible y de nicho, útil para quienes estudian entrenamiento en FP8, atención lineal híbrida o metodología de ablaciones a escala de 9B. No es un modelo instructivo ni alineado, y no se ha publicado información sobre licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 36 capas = [GatedDeltaNet, GatedDeltaNet, GatedDeltaNet, GQA] × 9 |
| Parámetros totales | 9.274.983.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | Pesos publicados en bf16 (safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16), con código propio (`modeling_bqalm.py`, `configuration_bqalm.py`) |

Detalles adicionales de arquitectura: `d_model` 4096, FFN SwiGLU de 12.288, embeddings atados. Las capas GatedDeltaNet usan 16 cabezas de query/key de 128 dimensiones y 32 cabezas de valor de 256, con compuerta y convolución corta (flash-linear-attention, modo chunk). Las capas de atención usan GQA con 16 cabezas de query y 4 de KV de 256 dimensiones, qk-norm, RoPE parcial 0,25 (θ = 1e7) y salida con compuerta. El vocabulario es el tokenizador Llama-2 de 32.000 tokens.

## Arquitectura y entrenamiento

La arquitectura combina atención lineal con estado recurrente (GatedDeltaNet) y atención softmax con caché KV (GQA) en un patrón repetido de tres capas lineales por cada capa de atención completa. Las capas GatedDeltaNet mantienen estados recurrentes y de convolución que se conservan durante la generación, de modo que cada token nuevo cuesta un paso; las capas GQA mantienen su caché K/V habitual. Esta mezcla busca reducir el coste de atención en contexto largo sin renunciar por completo a la atención cuadrática.

El entrenamiento se realizó desde cero sobre Nemotron-CC (`nemotron_cc_v2d1_hq_dqa`), con secuencias empaquetadas de 8.192 tokens, 28.610 pasos con batch global de 128 secuencias, lo que suma 30.000 millones de tokens. Se usó AdamW (β 0,9/0,95, ε 1e-8, weight decay 0,1, gradient clip 1,0, z-loss 1e-4) y un schedule WSD: 3,33 % de warmup hasta el pico de 1,2e-3, fase constante y decaimiento lineal a cero en el último 20 %. La semilla de inicialización fue 11785 y todos los brazos del estudio leen los mismos datos en el mismo orden. El entrenamiento se ejecutó con un port propio de Megatron-LM (Megatron-Core 0.20, Megatron-FSDP) sobre 4 × 8 H200.

La innovación técnica central es DeltaMatching: una variante de atención FP8 en la que el delta usado en el cálculo se empareja (`dm_mode=matched`) para evitar el desajuste que introduce el FP8 ingenuo. En este brazo, las GEMM de atención q/k/v/o y las del FFN se ejecutan en FP8 durante el entrenamiento, mientras que las capas GatedDeltaNet permanecen en bf16. Los pesos exportados son bf16 y la inferencia usa SDPA en bf16; el kernel CUDA compilado de la atención FP8 de entrenamiento no se distribuye. El código incluido reproduce bit a bit los logits del cargador original, tanto con SDPA por defecto como con `attn_implementation="flash_attention_2"`.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy y por muestreo (`num_beams=1`), manteniendo caché de estados recurrentes y de convolución de las capas GatedDeltaNet además de la caché K/V de las capas GQA.
- Modelado de lenguaje base: el modelo es un checkpoint preentrenado, sin ajuste instructivo ni alineación documentada.
- Razonamiento y conocimiento factual a nivel de modelo base de 9B entrenado con 30.000 millones de tokens; los resultados publicados en MMLU (0,4411), TriviaQA 5-shot (0,2564) y el agregado CSense-9 (0,6406) sitúan su nivel en el de un base pequeño, no en el de un modelo instructivo.
- Recuperación en contexto: RULER de 62,84 como media de 13 tareas a 4k y 8k, y 0,7139 en tareas de extracción (SWDE, FDA, SQuAD completion).
- Memoria asociativa multi-consulta: 0,1599 en MQAR, una tarea sintética de recall clave-valor que ejercita específicamente las capas recurrentes.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible; el tokenizador es Llama-2 de 32.000 tokens, pero no se especifica la composición lingüística del corpus.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.
- Ajuste fino: la pérdida de entropía cruzada de siguiente token es accesible vía `model(input_ids=ids, labels=ids).loss`, por lo que es entrenable con el `Trainer` de `transformers` en bf16.

## Casos de uso

- Estudio de metodología de entrenamiento en FP8: el modelo sirve como brazo de control "match" junto a los brazos MP y SD del mismo estudio, permitiendo reproducir la comparación de precisión de atención con pesos públicos y código de evaluación incluido. Es su uso principal y el único para el que está pensado.
- Investigación sobre arquitecturas híbridas atención lineal + softmax: al intercalar GatedDeltaNet y GQA en un patrón 3:1, permite medir el comportamiento de las capas recurrentes en tareas de recall (MQAR) y de contexto largo (RULER) frente a un transformer puro de tamaño comparable.
- Ajuste fino supervisado para tareas de dominio: al ser un base de 9,3B entrenable en bf16 con el `Trainer` estándar, se puede adaptar a clasificación, extracción o generación de dominio con datos propios, partiendo de un checkpoint ya expuesto a 30.000 millones de tokens.
- Evaluación de eficiencia en inferencia con estado recurrente: las capas GatedDeltaNet evitan la caché KV cuadrática en tres de cada cuatro capas, lo que lo hace útil para medir coste por token y memoria de caché en generación larga frente a un transformer equivalente.
- Reproducción de resultados de un paper: la ficha del modelo referencia el apéndice C.8.1 del paper del estudio y publica la tabla de evaluación con semilla fija (11785), lo que facilita la verificación independiente de las cifras.
- Prototipado de pipelines de generación con prompts de longitud fija: dado que las capas GatedDeltaNet no tienen máscara de padding y los prompts batcheados deben compartir longitud, encaja en escenarios de serving con secuencias empaquetadas y longitud uniforme, como evaluación por lotes de corpus.

## Benchmarks y rendimiento

Resultados publicados en la model card, semilla 11785. Cada brazo se entrenó una sola vez, por lo que no hay barras de error entre semillas.

| Modelo | val CE (nats/token) | RULER | CSense-9 | Extract | TriviaQA | MMLU | MQAR |
|---|---|---|---|---|---|---|---|
| MP (clean, bf16 FA-3) | 1,2993 | 61,41 | 0,6392 | 0,7113 | 0,2585 | 0,4347 | 0,1281 |
| SD (stale, FP8 ingenuo) | 1,5595 | 40,43 | 0,5470 | 0,5573 | 0,0795 | 0,2839 | 0,1746 |
| DM (match, DeltaMatching) | 1,2985 | 62,84 | 0,6406 | 0,7139 | 0,2564 | 0,4411 | 0,1599 |

Notas sobre la métrica: val CE se mide sobre 2.000 ventanas retenidas de 8.192 tokens (menor es mejor); RULER es la media de 13 tareas a 4k y 8k; CSense-9 agrega LAMBADA, HellaSwag, PIQA, ARC-e, ARC-c, SciQ, OpenBookQA, WinoGrande y COPA; Extract agrupa SWDE, FDA y SQuAD completion; TriviaQA es exact match 5-shot; MQAR es recall sintético multi-consulta clave-valor. En el pico de LR 1,2e-3, el brazo stale queda 0,2602 nats/token por encima del limpio en val CE (RULER 40,43 frente a 61,41), mientras que el brazo match queda 0,0008 por debajo (RULER 62,84).

## Requisitos de hardware

- VRAM para inferencia en bf16: 18,6 GB solo para los pesos, según la model card; hay que sumar la caché K/V de las capas GQA y los estados recurrentes y de convolución de las capas GatedDeltaNet, además de activaciones y overhead del runtime.
- GPU recomendadas: H200 (hardware de entrenamiento del estudio, 4 × 8 GPUs); para inferencia, cualquier GPU con al menos 24 GB de VRAM en bf16, como A100 40/80 GB, H100 o RTX 4090 (24 GB, justo al límite).
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB en bf16, aunque con margen estrecho y dependiendo de la longitud de contexto y del batch; no se documentan cuantizaciones alternativas que reduzcan el peso por debajo de bf16.
- Opciones de despliegue: `transformers` >= 5 con `trust_remote_code=True` y `flash-linear-attention` (probado con torch 2.12, transformers 5.9.0 y flash-linear-attention 0.5.2), con SDPA o `flash_attention_2`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el código de modelado es propio y requiere `trust_remote_code`.
- Latencia y throughput: no disponibles. La model card solo indica que la generación mantiene caché y que cada token nuevo cuesta un paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DM-GDNGQA-9.3B-LR1.2e-3-DM | 9,27B | 8.192 | Híbrido GatedDeltaNet + GQA (3:1) | No disponible | Hugging Face, código propio |
| DM-GDNGQA-9.3B-LR1.2e-3-MP | 9,27B | 8.192 | Idéntica, atención bf16 FA-3 | No disponible | Hugging Face, mismo estudio |
| DM-GDNGQA-9.3B-LR1.2e-3-SD | 9,27B | 8.192 | Idéntica, atención FP8 ingenua | No disponible | Hugging Face, mismo estudio |
| DM-GDNGQA-9.3B-LR2.4e-3-DM | 9,27B | 8.192 | Idéntica, pico LR 2,4e-3 | No disponible | Hugging Face, mismo estudio |

La comparación más informativa es interna al estudio: los tres brazos a LR 1,2e-3 comparten arquitectura y datos y solo difieren en los pesos, de modo que la diferencia de rendimiento es atribuible a la precisión de entrenamiento de la atención. No se dispone de información sobre modelos externos comparables de 9B con arquitectura híbrida similar en la documentación proporcionada.

## Limitaciones y advertencias

- Es un modelo base preentrenado, sin ajuste instructivo ni alineación documentada; no debe usarse directamente como asistente conversacional sin ajuste previo.
- Presupuesto de entrenamiento limitado: 30.000 millones de tokens para 9,27B de parámetros, muy por debajo de lo habitual en modelos de producción del mismo tamaño; los benchmarks reflejan ese nivel (MMLU 0,4411, TriviaQA 0,2564).
- Licencia no disponible: no se puede confirmar si se permite uso comercial; trátese como restringido hasta verificación con el autor.
- Idiomas soportados no documentados; no hay información sobre la composición lingüística de Nemotron-CC en este entrenamiento ni sobre calidad fuera del inglés.
- Contexto limitado a 8.192 tokens; no se documenta extensión por RoPE ni ventanas mayores.
- Riesgo de alucinación inherente a un modelo base de este tamaño y presupuesto de datos, sin RLHF ni DPO que lo mitiguen.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Restricción operativa: las capas GatedDeltaNet no tienen máscara de padding, por lo que los prompts batcheados deben compartir longitud; esto complica el serving con batches heterogéneos.
- El kernel CUDA de la atención FP8 DeltaMatching usada en entrenamiento no se distribuye; los pesos exportados son bf16 y se ejecutan con SDPA en bf16, de modo que no se puede reproducir el entrenamiento FP8 con este repositorio tal cual.
- Requiere `trust_remote_code=True` y código de modelado propio, lo que implica revisar `modeling_bqalm.py` antes de ejecutarlo en producción.
- Cada brazo se entrenó con una sola semilla (11785), por lo que las diferencias publicadas no tienen barras de error entre semillas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-DM
- Brazo limpio (MP): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-MP
- Brazo stale (SD): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-SD
- Variante LR 2,4e-3, brazo match: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-DM
- Variante LR 2,4e-3, brazo limpio: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-MP
- Variante LR 2,4e-3, brazo stale: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-SD
- Paper del estudio: no disponible (la model card referencia el apéndice C.8.1 sin enlace)
- Repositorio de código: no disponible (el código de modelado se distribuye dentro del propio repo de Hugging Face)
- Demo: no disponible
