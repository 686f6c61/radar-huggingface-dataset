# alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_200M_s1_2026-09-06_17-33-27_766522-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfinit_adamwppt_200M_s1` es un experimento de investigación sobre el presupuesto de tokens de entrenamiento (token dose) desarrollado por alexkstern con la librería nanochat. Se compone de un transformer decoder-only (arquitectura GPT) con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024, con una ventana de contexto de 2048 tokens. Durante el pre-training se entrenó sobre 100 millones de tokens del dataset FineWeb con un vocabulario BPE de 65536 tokens, y posteriormente se sometió a un post-training sobre 200 millones de tokens del lenguaje sintético Dyck-k128 con un vocabulario reducido a 256 tokens, reinicializando los embeddings en la transición. Este esquema de dos fases sirve para estudiar cómo la cantidad de tokens de cada fase afecta al aprendizaje de estructuras jerárquicas, y el checkpoint final corresponde al paso 1525, publicado bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | ~204 millones (estimados a partir de la config) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch .pt (nanochat checkpoint) |

## Arquitectura y entrenamiento

El modelo sigue la implementación nanochat GPT de Karpathy: un transformer causal decoder-only con 16 capas, 8 cabezas de atención (`n_kv_head = 8`, por lo que no usa GQA), dimensión de embedding 1024 y máxima longitud de secuencia 2048. En la fase de pre-training se usa un vocabulario de 65536 tokens (nanochat BPE sobre FineWeb), mientras que en la fase de post-training se cambia a un vocabulario de 256 tokens y se reinicializan las capas de embedding y unembedding. El entrenamiento se divide en dos etapas: primero 100 millones de tokens de FineWeb (pt), después 200 millones de tokens del dataset sintético Dyck-k128 (128 tipos de paréntesis, secuencias de 2048 tokens, 1.000 millones de tokens disponibles).

En cuanto a optimización, el autor separa las tasas de aprendizaje de las matrices (0.02), embeddings (0.3) y unembedding (0.004) en la fase de pre-training, con una programación trapezoidal sin warmup y warmdown del 40%. En la fase de post-training se usa una LR constante de 3e-05 y se reinicia el optimizador. El checkpoint guardado (paso 1525) reporta una pérdida de entrenamiento suavizada de 3.60 y un FLOPS por token de 2.08e9. La innovación técnica principal es la reinicialización de embeddings al cambiar de vocabulario y el estudio del llamado token dose, es decir, la cantidad de tokens consumidos en cada fase.

## Capacidades

- Generación de texto causal sobre el vocabulario Dyck de 256 tokens, limitada a secuencias de paréntesis balanceados de hasta 2048 posiciones.
- No se reportan capacidades de tool calling ni function calling.
- No se reporta soporte para agentes ni razonamiento multi-step más allá del modelado del lenguaje.
- No se reportan capacidades multimodales (visión, audio).
- La capacidad multilingüe no está documentada; el dataset de pre-training es FineWeb (inglés principalmente), pero el checkpoint final usa un vocabulario sintético.
- El modelo es experimental y no está pensado para tareas de lenguaje general.

## Casos de uso

- Investigación de scaling laws sobre token dose: los datos de entrenamiento publicados (tokens y FLOPS por token) permiten analizar cómo el presupuesto de tokens en cada fase afecta a la pérdida final y comparar con otros checkpoints de la misma serie.
- Ablaciones de transferencia entre vocabularios: al cambiarse de un BPE de 65536 a un vocabulario de 256 y reinicializar los embeddings, este modelo sirve para estudiar el impacto de la reinicialización en el aprendizaje de una nueva tarea.
- Benchmark de razonamiento jerárquico: el dataset Dyck-k128 es una prueba estándar de memoria y anidamiento; el modelo puede usarse para evaluar arquitecturas transformer en esta tarea sintética.
- Reproducción de experimentos: el autor publica la configuración completa en JSON y el run de Weights & Biases, lo que facilita replicar el entrenamiento en hardware propio.
- Estudio de eficiencia computacional: con un tiempo total de entrenamiento de 222.75 segundos y 2.079e17 FLOPs, el modelo es un caso de estudio para medir el coste de entrenamiento de modelos pequeños en GPU.
- Comparación de inicializaciones: el sufijo hfinit sugiere que se parte de una inicialización preexistente de HuggingFace; comparándolo con otros seeds (s0, s1) se puede estudiar la varianza de los resultados con distintas semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Solo se reportan métricas de entrenamiento como `smooth_train_loss` (3.60) y `min_objective` (1.139). El autor menciona un dataset adicional de evaluación (`c4-nanochatbpe-10B`), pero no se muestran resultados de su ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, ~816 MB para los pesos; en fp16/bf16, ~408 MB. Con contexto de 2048 tokens, la caché KV añade aproximadamente 128 MB en fp16.
- GPU recomendada: cualquier GPU con al menos 1-2 GB de VRAM libre (RTX 3060, GTX 1660, Apple M1). Durante el entrenamiento, el autor reporta un pico de 2250 TFLOPs, probablemente con una H100.
- Cabe en GPUs de consumo, incluso en tarjetas de gama baja con 2 GB de VRAM, y su ejecución en CPU también es viable.
- Opciones de despliegue: no hay soporte nativo para vLLM, llama.cpp ni Ollama. Se puede cargar con el código de nanochat, o convertir el checkpoint a safetensors/GGUF manualmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Pre-training tokens | Post-training tokens | Seed | Licencia | Parametros |
|---|---|---|---|---|---|
| kdyck_dose_100Mpt_hfinit_adamwppt_200M_s1 (este) | 100M | 200M | 1 | Apache-2.0 | ~204M |
| kdyck_dose_100Mpt_20M_s1 | 100M | 20M | 1 | Apache-2.0 | No disponible |
| kdyck_dose_100Mpt_200M_s0 | 100M | 200M | 0 | No disponible | No disponible |

## Limitaciones y advertencias

- El checkpoint final emplea un vocabulario de 256 tokens, por lo que no puede generar texto en lenguaje natural. Está limitado a secuencias sintéticas del dataset Dyck.
- No se han reportado evaluaciones de sesgos ni de alucinación. Al ser un modelo de investigación, no ha sido sometido a pruebas de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está pensado para producción. Cualquier uso fuera de la tarea sintética producirá salidas sin sentido.
- El repositorio no incluye el tokenizer completo ni los scripts de evaluación; para reproducir el modelo es necesario recurrir al repo nanochat y a la descarga de los datasets.
- La fecha de creación del repositorio en HuggingFace es 2026-09-06, posterior a la fecha actual. Verifica la integridad del checkpoint antes de usarlo en entornos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_200M_s1_2026-09-06_17-33-27_766522-pt
- Weights & Biases (run de entrenamiento): https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/yxlrn4u9
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Checkpoints comparables:
  - https://huggingface.co/alexkstern/kdyck_dose_100Mpt_20M_s1_2026-08-14_18-11-51_990138-pt
  - https://huggingface.co/alexkstern/kdyck_dose_100Mpt_200M_s0_2026-08-14_18-41-11_852802-pt
