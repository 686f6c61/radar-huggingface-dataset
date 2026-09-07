# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_20M_s2_2026-09-06_23-05-12_445726-pt

## Resumen

Este modelo es un experimento de investigación desarrollado por alexkstern con la librería nanochat de Karpathy. Su objetivo es estudiar el efecto de la dosis de tokens en el preentrenamiento y el post-entrenamiento sobre el aprendizaje de lenguajes formales. Se trata de un transformer GPT con 16 capas, 8 cabezas de atención, 1024 dimensiones de embedding y una ventana de contexto de 2048 tokens. El modelo se entrena primero con 50 millones de tokens de FineWeb y después con 20 millones de tokens del lenguaje Dyck-k128, un conjunto de secuencias de paréntesis con 128 tipos. El checkpoint disponible corresponde al paso 762 del entrenamiento. Su relevancia radica en investigar cómo la re-inicialización de embeddings y el reinicio del optimizador afectan la transferencia entre preentrenamiento en texto natural y una tarea sintética.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GPT (nanochat_gpt), 16 capas, 8 cabezas, 8 cabezas KV, 1024 de embedding |
| Parámetros totales | No disponible |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer GPT estándar implementado en nanochat. La configuración de entrenamiento define dos arquitecturas: `model_pt` con un vocabulario de 65536 tokens y `model_ppt` con un vocabulario de 256 tokens. Ambas comparten la misma estructura interna: 16 capas, 8 cabezas de atención, 8 cabezas KV y 1024 dimensiones de embedding. El checkpoint final usa el vocabulario de 256, tras re-inicializar el embedding en la transición entre fases.

El entrenamiento se divide en dos fases: preentrenamiento (`pt`) con 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`, y post-entrenamiento (`ppt`) con 20 millones de tokens del dataset `dyck-k128-seq_len_2048-1B`. El optimizador AdamW se configura con tasas de aprendizaje separadas para matrices, embeddings y unembedding, y se reinicia al pasar de la fase de preentrenamiento a la de post-entrenamiento. El programador de aprendizaje es trapezoidal, con un 40 % de descenso y sin calentamiento. No se aplica RLHF ni DPO. La re-inicialización del embedding y el reinicio del optimizador son las innovaciones técnicas destacables de este experimento.

## Capacidades

- Generación de secuencias del lenguaje formal Dyck-k128 con 128 tipos de paréntesis y longitud máxima de 2048 tokens.
- Procesamiento de estructuras jerárquicas de paréntesis balanceados, gracias a la ventana de contexto de 2048.
- No dispone de soporte de tool calling, function calling, visión ni audio.
- No se han publicado evaluaciones de capacidades generales de lenguaje o razonamiento.
- El vocabulario final es de 256 tokens, limitado al dominio Dyck.
- El modelo no está alineado para seguir instrucciones ni tareas conversacionales.

## Casos de uso

- Investigación en lenguajes formales: el modelo permite estudiar cómo un transformer aprende la estructura jerárquica de Dyck-k128, comparando las activaciones internas con gramáticas formales.
- Evaluación de transferencia de aprendizaje: sirve como banco de pruebas para medir cuánto conocimiento transferido del preentrenamiento en texto natural ayuda en una tarea sintética.
- Interpretabilidad: al ser un modelo pequeño, es posible analizar los mapas de atención y las representaciones para entender el mecanismo de emparejamiento de paréntesis.
- Educación en NLP: el código de nanochat y el tamaño reducido permiten reproducir el entrenamiento y estudiar el efecto de hiperparámetros como la dosis de tokens.
- Desarrollo de técnicas de post-entrenamiento: el experimento evalúa la re-inicialización de embeddings y el reinicio del optimizador; sirve como referencia para diseñar pipelines de post-entrenamiento.
- Reproducibilidad de experimentos: al estar publicado con configuración completa, métricas y semilla, es un punto de comparación para otros investigadores que quieran replicar o variar el experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README solo incluye métricas de entrenamiento: `smooth_train_loss` de 4.194, `min_objective` de 1.228, `flops_used` de 1.039e17 y `total_training_time` de 118.37 segundos. Estas métricas no son benchmarks de capacidades generales.

## Requisitos de hardware

- VRAM estimada: según la arquitectura, el modelo tiene en torno a 200 millones de parámetros; en fp32 los pesos ocupan aproximadamente 800 MB, por lo que una GPU con 4 GB de VRAM es suficiente para inferencia.
- GPU recomendadas: RTX 3060 12GB, T4, A10 o cualquier GPU moderna con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas de gama media como RTX 3060, 4060 o similares.
- Opciones de despliegue: nanochat para entrenamiento e inferencia; vLLM o TGI si se convierte a un formato compatible; llama.cpp u Ollama si se convierte a GGUF (no disponible en el repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El modelo pertenece a una serie de experimentos del mismo autor sobre dosis de tokens en Dyck. No se dispone de datos de rendimiento comparativos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kdyck_dose_50Mpt_hfinit_adamwppt_20M_s2 (este) | No disponible | 2048 | Apache-2.0 | HuggingFace |
| kdyck_dose_50Mpt_hfinit_20M_s2 (2026-08-14) | No disponible | No disponible | Apache-2.0 | HuggingFace |
| kdyck_dose_50Mpt_500M_s0 (2026-08-14) | No disponible | No disponible | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigación, no alineado ni entrenado para seguir instrucciones.
- El vocabulario final es de 256 tokens, limitado al lenguaje Dyck; no es útil para texto natural.
- No se han publicado evaluaciones de sesgos ni de alucinaciones.
- El entrenamiento se realizó en un entorno experimental con solo 70 millones de tokens en total, por lo que su capacidad de generalización es muy limitada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado para producción.
- Los pesos están en formato .pt y requieren conversión para usarse con herramientas como llama.cpp u Ollama.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_20M_s2_2026-09-06_23-05-12_445726-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/u1ra7nlu
- Repositorio nanochat: https://github.com/karpathy/nanochat
