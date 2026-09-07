# alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_5M_s2_2026-09-06_22-29-55_321927-pt

## Resumen

El modelo `kdyck_dose_1Bpt_hfbody_adamwppt_5M_s2_2026-09-06_22-29-55_321927-pt` es un experimento de investigación desarrollado por alexkstern con la librería nanochat. Se trata de un transformer GPT denso de 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024, preentrenado en un subconjunto de 1.000 millones de tokens del dataset FineWeb-nanochatbpe-20B y posteriormente adaptado con 5 millones de tokens a una tarea de lenguaje Dyck (paréntesis balanceados) con vocabulario de 256 tokens. El objetivo del estudio es medir cómo la dosis de tokens de preentrenamiento (1B en este caso) afecta la capacidad de aprender estructuras sintácticas formales.

El checkpoint guardado corresponde al paso 3.814 del entrenamiento, con una pérdida de entrenamiento suavizada de 3,1665 y un tiempo total de entrenamiento de 740,6 segundos. El repositorio de HuggingFace contiene únicamente el estado del modelo en formato PyTorch (`.pt`), sin cuantizaciones ni adaptaciones para inferencia. Es un modelo de propósito específico para investigación, no un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT denso, 16 capas, 8 cabezas, n_embd 1024, n_kv_head 8 |
| Parametros totales | no disponible (la configuracion no indica el total; la fase de adaptacion usa vocab 256) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (config sequence_len) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (preentrenado en FineWeb, adaptado a lenguaje sintetico Dyck) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |

## Arquitectura y entrenamiento

La arquitectura es un GPT estándar implementado en nanochat, con 16 capas, 8 cabezas de atención y dimensiones de embedding de 1024. El proceso de entrenamiento consta de dos fases: una fase de preentrenamiento (pt) sobre FineWeb-nanochatbpe-20B con un vocabulario de 65.536 tokens y una fase de post-entrenamiento (ppt) sobre un dataset Dyck-k128 con secuencias de 2.048 tokens y un vocabulario de 256 tokens. Según la configuración, en la transición entre fases se re-inicializan las capas de embedding y se resetea el optimizador.

Se utilizó el optimizador AdamW con tasas de aprendizaje distintas para matrices, embeddings y unembeddings, y un programa de aprendizaje en forma de trapezoide. El entrenamiento se ejecutó con compilación de modelo (`compile_model: true`) y con un hardware de 2250 TFLOPs pico. El checkpoint se guardó tras 3.814 pasos, con un total de `flops_used` de 2,08e+18 y `flops_per_token` de 2.080.374.784.

## Capacidades

- Generación de texto: genera secuencias del lenguaje Dyck (paréntesis balanceados); no está diseñado para texto natural.
- Razonamiento: no se ha evaluado en tareas de razonamiento general; la tarea objetivo es sintáctica.
- Tool calling: no soporta.
- Agentes y razonamiento multi-paso: no soporta.
- Capacidades multilingües: no relevantes para el propósito del modelo.
- Capacidades especiales: permite estudiar el efecto de la dosis de tokens de preentrenamiento en el aprendizaje de lenguajes formales, así como la transferencia de representaciones al cambiar el vocabulario.

## Casos de uso

- Investigación en transferencia de representaciones: el modelo permite analizar cómo se comportan las capas transformer cuando se re-inicializan las embeddings para un vocabulario nuevo, comparando el estado previo y posterior a la transición.
- Análisis de dosis de tokens: al variar la cantidad de tokens de preentrenamiento (por ejemplo, 20M, 200M o 1B), se puede estudiar la relación entre la exposición a lenguaje natural y la capacidad de aprender una tarea formal sintética como Dyck.
- Evaluación de optimizadores: el checkpoint incluye configuraciones de AdamW con tasas de aprendizaje separadas por componentes, útil para comparar estrategias de optimización en experimentos controlados.
- Desarrollo de técnicas de adaptación de vocabulario: el proceso de reinicialización de embeddings y reset del optimizador sirve como caso de prueba para técnicas de expansión o reducción de vocabulario en modelos preentrenados.
- Benchmarking de compilación de modelos: al usar `compile_model`, el checkpoint es adecuado para medir el impacto de `torch.compile` en el entrenamiento de modelos pequeños.
- Reproducción de experimentos de varianza entre semillas: el autor publica réplicas con diferentes semillas (seed_2, seed_0, seed_1) para estudiar la estabilidad de los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la pérdida de entrenamiento suavizada (3,1665) en el paso 3.814, junto con el recuento de FLOPs, pero no hay evaluaciones externas (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se han publicado requisitos).
- GPU recomendadas: no disponible; el entrenamiento se realizó en un hardware con 2250 TFLOPs pico, compatible con aceleradores de gama alta como H100 o A100.
- Si cabe en GPU de consumo: no disponible; el tamaño del checkpoint (3.0 GB en disco) sugiere que el modelo es pequeño, pero no hay datos oficiales de inferencia.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan directamente el formato `.pt`; se requeriría conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tokens de ppt | Semilla | Estado |
|---|---|---|---|
| `kdyck_dose_1Bpt_hfbody_adamwppt_5M_s2` | 5M | seed_2 | Este checkpoint |
| `kdyck_dose_1Bpt_hfbody_20M_s1` | 20M | seed_1 | Publicado en HuggingFace |
| `kdyck_dose_1Bpt_hfbody_200M_s0` | 200M | seed_0 | Publicado en HuggingFace |

No se dispone de resultados comparativos de rendimiento entre estos checkpoints.

## Limitaciones y advertencias

- No es un modelo de propósito general; fue entrenado específicamente para una tarea sintética de lenguaje Dyck.
- No soporta tool calling, agentes, ni tareas de visión o audio.
- No se han publicado benchmarks que permitan evaluar su calidad en tareas reales.
- El formato de pesos es `.pt`, lo que dificulta su integración en herramientas estándar de inferencia (vLLM, llama.cpp, TGI).
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está optimizado para producción.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_5M_s2_2026-09-06_22-29-55_321927-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/mvcgkknc
- Checkpoint similar (20M): https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_20M_s1_2026-08-14_08-12-42_071342-pt
- Checkpoint similar (200M): https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_200M_s0_2026-08-14_09-26-44_877448-pt
