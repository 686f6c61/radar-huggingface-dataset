# haok1402/DM-GDNGQA-9.3B-LR2.4e-3-MP

## Resumen

DM-GDNGQA-9.3B-LR2.4e-3-MP es un modelo de lenguaje de 9.274.983.360 parámetros desarrollado por el usuario haok1402 y publicado en Hugging Face. Se trata de un transformer híbrido que combina capas GatedDeltaNet (un mecanismo de atención lineal con estado recurrente) con capas de atención GQA clásica, en una proporción de 3:1 (tres capas GatedDeltaNet por cada capa GQA), repetida nueve veces hasta un total de 36 capas. El modelo fue preentrenado desde cero sobre 30.000 millones de tokens del corpus Nemotron-CC, con una longitud de contexto de 8.192 tokens.

El modelo no es un lanzamiento de producción al uso, sino el brazo "MP" (clean) de un estudio experimental sobre precisión numérica en el entrenamiento de la atención. En ese estudio se entrenaron tres modelos desde la misma inicialización, con los mismos datos en el mismo orden y la misma receta, variando únicamente la precisión de la atención: el brazo MP usa atención estándar en bf16 con FlashAttention-3, mientras que los brazos SD y DM usan atención FP8 (con delta obsoleto y con Delta-Matching respectivamente). Por tanto, este repositorio sirve como referencia de control frente a los otros dos.

Su relevancia es fundamentalmente metodológica: permite evaluar el impacto de técnicas de atención en FP8 sobre la calidad final del modelo, comparando perplejidad, RULER, MMLU y otras tareas con un brazo de control limpio. No obstante, el modelo en sí es un modelo base de 9.300 millones de parámetros con contexto de 8.192 tokens, entrenado con un presupuesto relativamente modesto (30.000 millones de tokens), por lo que sus capacidades son las propias de un modelo base pequeño, no de un modelo de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 36 capas = [GatedDeltaNet, GatedDeltaNet, GatedDeltaNet, GQA] × 9 |
| Parametros totales | 9.274.983.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; repo de 18,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |
| Ancho del modelo | d_model 4096, FFN SwiGLU 12.288, embeddings atados |
| GatedDeltaNet | 16 cabezas query/key × 128, 32 cabezas value × 256, con puerta, convolución corta (flash-linear-attention, modo chunk) |
| Atención GQA | 16 cabezas query / 4 cabezas KV × 256, qk-norm, RoPE parcial 0.25 (θ = 1e7), salida con puerta |
| Tokenizador | Llama-2, 32k tokens |
| Precisión de entrenamiento | bf16 FlashAttention-3 (BF16/FP32 mixed precision estándar) |
| Código personalizado | sí (`modeling_bqalm.py`, `configuration_bqalm.py`), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que intercala tres capas GatedDeltaNet por cada capa de atención GQA, patrón repetido nueve veces. Las capas GatedDeltaNet implementan un mecanismo de atención lineal con estado recurrente (recurrent state y conv state) mediante la librería flash-linear-attention en modo chunk, con 16 cabezas query/key de dimensión 128 y 32 cabezas value de dimensión 256, además de una convolución corta y compuertas. Las capas GQA usan 16 cabezas query y 4 cabezas KV de dimensión 256, con normalización qk, RoPE parcial al 25 % y salida con puerta. El modelo tiene 36 capas, d_model de 4096, FFN SwiGLU de 12.288 y embeddings atados.

El entrenamiento se realizó desde cero sobre 30.000 millones de tokens de Nemotron-CC (`nemotron_cc_v2d1_hq_dqa`), empaquetados en secuencias de 8.192 tokens, con 28.610 pasos y batch global de 128. Se usó AdamW (β 0.9/0.95, ε 1e-8, weight decay 0.1, gradient clip 1.0, z-loss 1e-4) y un schedule WSD: 3,33 % de warmup hasta 2,4e-3, fase constante y decaimiento lineal a cero en el último 20 %. La semilla de inicialización fue 11785 y todos los brazos del estudio leen los mismos datos en el mismo orden. El entrenamiento se ejecutó con el entrenador nativo del estudio en PyTorch (FSDP2) sobre GPUs H100. La innovación técnica del estudio es la comparación de precisión de la atención (bf16 frente a FP8 con y sin Delta-Matching); este repositorio concreto es el brazo de control con atención bf16 estándar.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy y por muestreo (`num_beams=1`), manteniendo caché de K/V en las capas GQA y de estado recurrente y de convolución en las capas GatedDeltaNet.
- Modelo base (no instruido): no se ha publicado información sobre ajuste por instrucciones, RLHF o DPO, por lo que no cabe esperar un comportamiento de asistente conversacional sin ajuste adicional.
- Razonamiento y conocimiento general limitados por el presupuesto de entrenamiento (30.000 millones de tokens); MMLU de 0,4291 en la evaluación del autor.
- Recuperación de información en contexto: RULER medio de 60,51 en tareas de 4k y 8k tokens; TriviaQA 5-shot de 0,2418 en exact match.
- Memoria asociativa multi-query: MQAR de 0,1766 en la tarea sintética de recall clave-valor.
- Capacidades multilingües: no disponibles (tokenizador Llama-2 de 32k, pero sin datos publicados sobre idiomas soportados).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo thinking: no disponible.
- Fine-tuning: el modelo expone la pérdida de entropía cruzada de siguiente token, por lo que es ajustable con el `Trainer` de transformers en bf16.

## Casos de uso

- Estudio de referencia sobre precisión de atención: este repositorio es el brazo de control limpio (bf16) del estudio; se usaría para comparar la calidad de los brazos SD y DM (atención FP8) contra una línea base sin cuantización de atención, midiendo val CE, RULER, MMLU y MQAR con el mismo código de evaluación.
- Investigación sobre arquitecturas híbridas GatedDeltaNet + GQA: sirve para analizar cómo se comporta una proporción 3:1 de atención lineal y atención completa en tareas de recuperación en contexto (RULER, MQAR) con solo 30.000 millones de tokens de entrenamiento.
- Fine-tuning para una tarea concreta de dominio: al ser un modelo base de 9.300 millones de parámetros con pérdida de siguiente token estándar, puede ajustarse con el `Trainer` de transformers en bf16 para clasificación, extracción o generación especializada, partiendo de un checkpoint ya entrenado.
- Evaluación de decodificación especulativa o de caché de estado: las capas GatedDeltaNet mantienen estado recurrente y de convolución, lo que permite estudiar el coste por token y el comportamiento de la caché en decodificación autoregresiva frente a un transformer puro.
- Generación de texto de dominio general en investigación: con contexto de 8.192 tokens y decodificación greedy o por muestreo, puede usarse para experimentos de generación controlada donde no se requiera un modelo instruido.
- Benchmarking de infraestructura: al requerir `flash-linear-attention` y `trust_remote_code`, sirve para validar pipelines de inferencia con dependencias no estándar (torch 2.12, transformers 5.9.0, flash-linear-attention 0.5.2) sobre GPUs H100 o H200.
- Estudio de eficiencia memoria/calidad: con 18,6 GB en bf16, es un punto de comparación para medir el ahorro de memoria de los brazos FP8 frente al coste en calidad.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (semilla 11785):

| Modelo | val CE (nats/token) | RULER | CSense-9 | Extract | TriviaQA | MMLU | MQAR |
|---|---|---|---|---|---|---|---|
| **MP (clean, este repo)** | **1,3141** | **60,51** | **0,6433** | **0,7140** | **0,2418** | **0,4291** | **0,1766** |
| SD (stale, FP8) | 1,8728 | 22,18 | 0,4681 | 0,3848 | 0,0281 | 0,2633 | 0,0655 |
| DM (match, FP8) | 1,3152 | 58,22 | 0,6395 | 0,6933 | 0,2414 | 0,4175 | 0,1247 |

Notas: val CE es la entropía cruzada en nats/token sobre 2.000 ventanas retenidas de 8.192 tokens (menor es mejor). RULER es la media de 13 tareas a 4k y 8k. CSense-9 agrupa LAMBADA, HellaSwag, PIQA, ARC-e, ARC-c, SciQ, OpenBookQA, WinoGrande y COPA. Extract agrupa SWDE, FDA y SQuAD completion. TriviaQA es exact match en 5-shot. MQAR es una tarea sintética de recall clave-valor multi-query. Cada brazo se entrenó una sola vez (semilla 11785), por lo que no hay barra de error entre semillas. La fila MP se evaluó en H100 con el mismo código, datos y ajustes que las demás filas, y su val CE se reproduce en H200 con la precisión reportada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: 18,6 GB solo para los pesos, según indica el autor; hay que sumar la caché de K/V de las capas GQA y el estado recurrente y de convolución de las capas GatedDeltaNet, además de las activaciones.
- GPU recomendadas: el autor reporta entrenamiento en H100 y reproducción de la evaluación en H200; para inferencia en bf16 se necesita una GPU con al menos ~20-24 GB de memoria libre, por lo que encajan A100 (40/80 GB), H100, H200 y, en el límite, una RTX 4090 de 24 GB si el overhead de caché y activaciones lo permite.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16, aunque no hay datos publicados de latencia ni de consumo real en esa GPU; en GPUs de 16 GB o menos no cabría en bf16 sin cuantización, y no se han publicado pesos cuantizados.
- Opciones de despliegue: el autor documenta únicamente el uso con `transformers` (>= 5) y `flash-linear-attention`, con `trust_remote_code=True` y el código incluido en el repo (`modeling_bqalm.py`, `configuration_bqalm.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integración con esos motores no está disponible.
- Latencia y throughput: no disponibles. El autor solo indica que `generate()` mantiene caché y que cada token nuevo cuesta un paso; no se publican medidas de tokens por segundo.
- Restricción práctica: los prompts agrupados en un mismo batch deben compartir longitud, porque las capas GatedDeltaNet no tienen máscara de padding.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DM-GDNGQA-9.3B-LR2.4e-3-MP (este repo) | 9,27 B | 8.192 | Híbrido GatedDeltaNet + GQA (3:1) | no disponible | Hugging Face, código incluido, requiere `flash-linear-attention` |
| DM-GDNGQA-9.3B-LR2.4e-3-SD | 9,27 B | 8.192 | Igual, atención FP8 con delta obsoleto | no disponible | Hugging Face (mismo autor) |
| DM-GDNGQA-9.3B-LR2.4e-3-DM | 9,27 B | 8.192 | Igual, atención FP8 con Delta-Matching | no disponible | Hugging Face (mismo autor) |
| DM-GDNGQA-9.3B-LR1.2e-3-MP | 9,27 B | 8.192 | Igual, pico de LR 1,2e-3 | no disponible | Hugging Face (mismo autor) |

No se dispone de información sobre modelos comparables de otros autores (mismo tamaño o misma tarea) en la documentación proporcionada, por lo que la comparativa se limita a los brazos del propio estudio. Los datos de rendimiento comparativo entre brazos están en la sección de benchmarks.

## Limitaciones y advertencias

- Es un modelo base preentrenado, no ajustado por instrucciones ni con RLHF/DPO; no cabe esperar comportamiento de asistente ni seguimiento fiable de instrucciones.
- Presupuesto de entrenamiento modesto (30.000 millones de tokens), lo que limita conocimiento factual y razonamiento; MMLU de 0,4291 y TriviaQA de 0,2418 así lo reflejan.
- Contexto limitado a 8.192 tokens; no hay soporte documentado para extensiones de contexto.
- Las capas GatedDeltaNet no tienen máscara de padding, por lo que los prompts en batch deben compartir longitud; esto complica el despliegue en producción con entradas de longitud variable.
- Requiere código personalizado (`trust_remote_code=True`) y la dependencia `flash-linear-attention`, lo que reduce la portabilidad frente a transformers estándar.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles; el tokenizador es Llama-2 de 32k, pero no hay evaluación multilingüe publicada.
- Riesgo de alucinación: inherente a un modelo base de este tamaño y presupuesto de entrenamiento; no hay evaluaciones de factualidad publicadas.
- Sesgos conocidos: no disponibles; no se ha publicado ningún análisis de sesgos.
- Cada brazo se entrenó una sola vez (semilla 11785), por lo que las comparaciones no tienen barra de error entre semillas y las diferencias pequeñas deben interpretarse con cautela.
- El kernel CUDA de atención FP8 Delta-Matching de los brazos SD y DM no se distribuye; este repositorio exporta pesos bf16 y ejecuta atención SDPA en bf16, por lo que no reproduce el régimen FP8 de entrenamiento.
- Sin datos publicados de latencia, throughput ni consumo en GPUs de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-MP
- Brazo SD (atención FP8 con delta obsoleto): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-SD
- Brazo DM (atención FP8 con Delta-Matching): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-DM
- Variante LR 1,2e-3, brazo MP: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-MP
- Variante LR 1,2e-3, brazo SD: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-SD
- Variante LR 1,2e-3, brazo DM: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-DM
- Paper del estudio: no disponible (la model card remite al apéndice C.8.1, pero no se proporciona enlace)
- Repositorio de código: no disponible (el código se incluye en el propio repo de Hugging Face: `modeling_bqalm.py`, `configuration_bqalm.py`)
- Librería flash-linear-attention: no disponible (dependencia mencionada, sin enlace en la información proporcionada)
