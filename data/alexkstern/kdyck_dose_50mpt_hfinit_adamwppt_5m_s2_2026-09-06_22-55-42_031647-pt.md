# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_5M_s2_2026-09-06_22-55-42_031647-pt

## Resumen

Este checkpoint es un experimento de investigación de la serie `token_dose_50Mpt` de Alex Kstern, entrenado con la librería nanochat de Karpathy. Se trata de un transformer GPT pequeño con 16 capas, 8 cabezas de atención, dimensión de embedding de 1024 y una ventana de contexto de 2048 tokens. El nombre del modelo indica un preentrenamiento de 50 millones de tokens sobre FineWeb (fase PT) seguido de 5 millones de tokens adicionales sobre un dataset sintético de estructuras de Dyck con k=128 (fase PPT). El checkpoint corresponde al paso 762 de un total de 1000 iteraciones.

El modelo está pensado para estudiar el efecto del post-pretraining en tareas de balanceo de paréntesis (Dyck-k) y la eficiencia del entrenamiento con nanochat. No es un modelo de propósito general ni está preparado para producción, sino una pieza de investigación para analizar cómo los transformers aprenden lenguajes libres de contexto y cómo se transfiere el conocimiento de un corpus de lenguaje natural a un dominio sintético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat_gpt), no MoE |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, implementado en la librería nanochat. La configuración de la fase de preentrenamiento (`model_pt`) especifica `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024` y `vocab_size=65536`. La fase de post-pretraining (`model_ppt`) reutiliza la misma arquitectura pero con un vocabulario reducido de 256 tokens, lo que indica un cambio de dominio hacia el dataset sintético Dyck-k.

El entrenamiento se divide en dos fases. La primera fase (PT) utiliza `fineweb-nanochatbpe-100M` como dataset, con 50 millones de tokens. La segunda fase (PPT) usa `dyck-k128-seq_len_2048-1B` con 5 millones de tokens. En la transición entre fases se reinicializan los embeddings (`reinit_embed_at_transition=true`) y se reinicia el optimizador (`reset_optimizer_at_transition=true`). El learning rate sigue una curva trapezoidal sin warmup y con un warmdown del 40% hasta 0.0. El optimizador es AdamW con learning rates diferenciados para matrices, embeddings y unembeddings.

A partir de la configuración se puede estimar un tamaño de aproximadamente 268 millones de parámetros, aunque el autor no lo confirma explícitamente en la model card. El entrenamiento consumió alrededor de 1.04e17 FLOPs, con un coste de 2.08e9 FLOPs por token, y se completó en unos 100 segundos de tiempo de cómputo.

## Capacidades

- Generación de texto autoregresiva en el dominio de entrenamiento, con especialización en estructuras de paréntesis Dyck-k (k=128) tras la fase de post-pretraining.
- Capacidad limitada de modelado de lenguaje natural procedente del preentrenamiento con FineWeb.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni uso en agentes.
- No tiene capacidades multimodales (visión, audio, etc.).
- Multilingüismo no confirmado; el dataset de preentrenamiento, FineWeb, está predominantemente en inglés.

## Casos de uso

- Investigación en lenguajes libres de contexto: el modelo puede usarse para estudiar la capacidad de los transformers de modelar estructuras de paréntesis anidadas (Dyck-k), un problema clásico de teoría de lenguajes.
- Evaluación de estrategias de post-pretraining: permite comparar el efecto de añadir 5 millones de tokens en un dominio sintético sobre un modelo preentrenado en texto general.
- Replicación de experimentos de eficiencia: la configuración incluye FLOPs por token, tiempo de entrenamiento y pérdida suavizada, lo que facilita reproducir el experimento y medir el coste computacional.
- Análisis de representaciones internas: se pueden extraer activaciones de las capas para estudiar cómo se codifica la memoria de trabajo en tareas de balanceo de paréntesis.
- Pruebas de transferencia de conocimiento: evaluar si el conocimiento de FineWeb se transfiere o interfiere con el aprendizaje de estructuras sintácticas artificiales.
- Benchmark de optimización: el modelo sirve como caso de estudio para probar variantes de optimizadores (AdamW con curva trapezoidal) y técnicas de re-inicialización de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son de entrenamiento: `smooth_train_loss=4.17`, `min_objective=1.22`, `flops_used=1.04e17` y `total_training_time=100.45` segundos. No se dispone de resultados en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; a partir del tamaño estimado de ~268M de parámetros, se necesitaría aproximadamente 1 GB en FP32 y unos 0,5 GB en FP16/BF16.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM para inferencia; el entrenamiento se realizó en una GPU con un pico de 2250 TFLOPS, probablemente una H100.
- Compatible con GPUs de consumo: sí, en tarjetas como la RTX 3060 o superiores.
- Opciones de despliegue: PyTorch mediante el código de nanochat; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tokens PT | Tokens PPT | Contexto | Licencia |
|---|---|---|---|---|
| kdyck_dose_50Mpt_hfinit_adamwppt_5M_s2 (este) | 50M | 5M | 2048 | Apache-2.0 |
| kdyck_dose_50Mpt_hfinit_5M_s2 | 50M | 5M | no disponible | Apache-2.0 |
| kdyck_dose_50Mpt_hfinit_20M_s2 | 50M | 20M | no disponible | Apache-2.0 |

Los dos modelos comparables pertenecen a la misma serie de experimentos de Alex Kstern y varían en la cantidad de tokens de post-pretraining. No se dispone de sus configuraciones completas ni de resultados de rendimiento.

## Limitaciones y advertencias

- Modelo experimental sin documentación de uso más allá de la configuración de entrenamiento.
- No se han realizado evaluaciones de sesgos, seguridad ni alucinaciones.
- El vocabulario de la fase de post-pretraining se reduce a 256 tokens, lo que limita la generación a ese espacio durante esa fase.
- No soporta tool calling, function calling ni uso en agentes.
- El formato de pesos es `.pt` (PyTorch state_dict), lo que requiere conversión para su uso en frameworks estándar como llama.cpp u Ollama.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado para entornos de producción.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_5M_s2_2026-09-06_22-55-42_031647-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/t32pdr4c
- Repositorio nanochat: https://github.com/karpathy/nanochat
