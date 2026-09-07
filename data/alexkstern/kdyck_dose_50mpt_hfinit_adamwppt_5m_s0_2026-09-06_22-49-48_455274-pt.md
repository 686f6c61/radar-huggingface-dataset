# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_5M_s0_2026-09-06_22-49-48_455274-pt

## Resumen

Este modelo es un checkpoint experimental de un transformer decoder (GPT) entrenado con la librería nanochat. Lo desarrolla alexkstern como parte de un proyecto de investigación sobre "token dose" (dosis de tokens), que estudia el efecto de la cantidad de tokens de pretraining y post-training en el aprendizaje de lenguajes formales. En concreto, el modelo se preentrena con 50 millones de tokens de FineWeb y posteriormente se ajusta con 5 millones de tokens de un dataset de lenguaje Dyck (paréntesis balanceados) con K=128 y longitud de secuencia 2048. La arquitectura tiene 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El checkpoint corresponde al paso 762 de 1000 iteraciones y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder estándar (GPT) implementado con nanochat. La configuración del pretraining (`model_pt`) define 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding 1024 y vocabulario de 65536 tokens. En la fase de post-training (`model_ppt`) el vocabulario se reduce a 256 tokens, manteniendo la misma profundidad y dimensiones. El entrenamiento se divide en dos etapas: una de pretraining con 50 millones de tokens de FineWeb (dataset `fineweb-nanochatbpe-100M`) y una de post-training con 5 millones de tokens del dataset `dyck-k128-seq_len_2048-1B` (lenguaje Dyck con 128 tipos de paréntesis y secuencias de longitud 2048). En la transición entre etapas se reinitializan los embeddings y se reinicia el optimizador. El esquema de aprendizaje es trapezoidal (`lr_kind: trapezoid`) con warmup 0 y warmdown 0.4, y se usan learning rates separados para matrices (0.02), embeddings (0.3) y unembedding (0.004). El checkpoint se guarda en el paso 762 de 1000, con una pérdida de entrenamiento suavizada de 4.17 y un objetivo mínimo de 1.22.

## Capacidades

- Es un modelo de investigación diseñado para evaluar la capacidad de un transformer de aprender lenguajes formales, en particular el lenguaje Dyck con K=128.
- No está diseñado para generación de texto general, razonamiento, código, matemáticas, visión, tool calling ni agentes.
- No soporta function calling ni multi-step reasoning.
- Su capacidad multilingüe no está documentada; el dataset de pretraining (FineWeb) es principalmente inglés, pero no se especifica.
- No tiene modo de pensamiento, visión ni audio.
- Su utilidad principal es servir como punto de comparación en experimentos de token dose y curriculum learning.

## Casos de uso

- Investigación en lenguajes formales: el modelo permite estudiar si un transformer puede aprender el lenguaje Dyck con 128 tipos de paréntesis. Se usaría evaluando la capacidad del modelo para predecir el siguiente token en secuencias de paréntesis balanceados, comparando con réplicas de diferentes semillas.
- Estudio de "token dose": al ser un checkpoint intermedio (paso 762) con una dosis de 50M tokens de pretraining y 5M de post-training, sirve para analizar cómo varía el rendimiento en función de la cantidad de tokens en cada fase. Se usaría junto con los otros checkpoints del mismo proyecto.
- Análisis de transferencia entre vocabularios: el modelo cambia de un vocabulario de 65536 tokens a uno de 256 durante el post-training, lo que permite investigar cómo se reutilizan o reinitializan las representaciones. Se usaría comparando las métricas antes y después de la transición.
- Reproducibilidad de experimentos: el repo incluye la configuración completa, la semilla (seed 0) y el estado del RNG, lo que permite reproducir el entrenamiento exacto. Se usaría para verificar la estabilidad de los resultados del proyecto.
- Benchmarking de arquitecturas nanochat: el modelo sirve como referencia para comparar la eficiencia de la implementación de nanochat en tareas de razonamiento estructural. Se usaría midiendo flops por token (2.08e9) y tiempo de entrenamiento.
- Evaluación de curriculum learning: el esquema de entrenamiento en dos fases (pretraining general + post-training específico) es un caso de curriculum learning. El modelo se usaría para estudiar si el pretraining con FineWeb ayuda o perjudica el aprendizaje posterior de Dyck, comparando con modelos entrenados solo con Dyck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card solo reporta métricas de entrenamiento (`smooth_train_loss` 4.17, `min_objective` 1.22) y flops utilizados (1.04e17), pero no hay evaluaciones en conjuntos de datos estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se proporcionan datos de consumo de memoria para inferencia.
- GPU recomendadas: no disponible. El entrenamiento se realizó en un hardware con un pico de 2250 TFLOPS (probablemente una H100), pero no se especifica la GPU exacta.
- ¿Cabe en GPU de consumo? No disponible. Dado el tamaño del modelo (config con 16 capas y embedding 1024), es probable que quepa en GPUs de consumo, pero no hay datos confirmados.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch (.pt) y está pensado para cargarse con la librería nanochat. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Semilla | Dosis de post-training | Config | Disponibilidad |
|---|---|---|---|---|
| kdyck_dose_50Mpt_hfinit_adamwppt_5M_s0 (este modelo) | 0 | 5M tokens | 16 capas, emb 1024, vocab 65536/256 | HuggingFace (Apache 2.0) |
| kdyck_dose_50Mpt_5M_s1 | 1 | 5M tokens | no disponible | HuggingFace (Apache 2.0) |
| kdyck_dose_50Mpt_500M_s0 | 0 | 500M tokens | no disponible | HuggingFace (Apache 2.0) |

No se dispone de datos de rendimiento para comparar. Los tres modelos pertenecen al mismo proyecto de investigación sobre token dose y difieren en la semilla o en la cantidad de tokens de post-training.

## Limitaciones y advertencias

- Es un modelo experimental de investigación, no apto para producción ni para tareas de uso general.
- No soporta tool calling ni agentes, y no está diseñado para generación de texto libre.
- El vocabulario de post-training es de 256 tokens, lo que limita su capacidad a un dominio muy específico (lenguaje Dyck).
- La cantidad de datos de entrenamiento es muy reducida (50M tokens de pretraining y 5M de post-training), lo que probablemente cause una generalización pobre fuera de la tarea objetivo.
- No se han documentado sesgos, pero al ser un modelo pequeño y entrenado con FineWeb, podría reflejar sesgos presentes en ese dataset.
- El riesgo de alucinación es alto si se usa para generación de texto general, ya que no fue entrenado para ello.
- El formato de pesos es .pt, lo que requiere conversión para usar con frameworks de inferencia como vLLM u Ollama.
- La licencia Apache 2.0 permite uso comercial, pero la utilidad comercial del modelo es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_5M_s0_2026-09-06_22-49-48_455274-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/oiozgzkn
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelo similar (seed 1): https://huggingface.co/alexkstern/kdyck_dose_50Mpt_5M_s1_2026-08-14_22-49-49_667492-pt
- Modelo similar (500M tokens): https://huggingface.co/alexkstern/kdyck_dose_50Mpt_500M_s0_2026-08-14_23-25-05_820140-pt
