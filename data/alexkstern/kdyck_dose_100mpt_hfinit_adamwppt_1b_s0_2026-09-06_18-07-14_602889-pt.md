# alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_1B_s0_2026-09-06_18-07-14_602889-pt

## Resumen

Este modelo es un checkpoint de investigación generado con nanochat, la biblioteca de entrenamiento de GPT de Andrej Karpathy. Lo ha publicado el usuario alexkstern y forma parte de una serie de experimentos sobre la dosis de tokens (token dose) y el post-pretraining (ppt) en dominios formales. El modelo es un GPT con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024, con una ventana de contexto de 2048 tokens. Se preentrenó durante 100M tokens del dataset FineWeb (con tokenizador nanochat BPE) y después se sometió a un post-pretraining de 1B tokens sobre el lenguaje formal Dyck-k128, una tarea de paréntesis balanceados. Su relevancia radica en que permite estudiar cómo un modelo de lenguaje pequeño se adapta a estructuras sintácticas formales y cómo la cantidad de tokens de preentrenamiento afecta a ese proceso. No está pensado como modelo de propósito general, sino como pieza de investigación reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT (nanochat_gpt) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |
| Dataset de preentrenamiento | FineWeb-nanochatbpe-100M (100M tokens) |
| Dataset de post-pretraining | Dyck-k128, seq_len 2048 (1B tokens) |
| Paso del checkpoint | 1525 |
| Vocabulario principal | 65536 |
| Vocabulario de post-pretraining | 256 |

## Arquitectura y entrenamiento

El modelo es un transformer GPT estándar, sin mezcla de expertos ni arquitecturas de estado sólido. La configuración indica 16 capas, 8 cabezas de atención (con 8 cabezas KV), una dimensión de embedding de 1024 y una longitud de secuencia de 2048. El preentrenamiento se realizó sobre 100M tokens de FineWeb con un tokenizador BPE de tamaño 65536. Posteriormente, se aplicó un post-pretraining (ppt) de 1B tokens sobre el dataset Dyck-k128, un lenguaje formal de paréntesis balanceados con un vocabulario reducido de 256 tokens. La transición entre ambas fases es notable: la configuración activa `reinit_embed_at_transition` y `reset_optimizer_at_transition`, lo que indica que se reinicializó la capa de embedding y se reinició el optimizador en el cambio de dominio. Se utilizó una tasa de aprendizaje en forma de trapecio, sin warmup en la fase de preentrenamiento y con warmdown del 40% en esa fase, mientras que en el post-pretraining el warmdown fue del 100%. No se aplicó RLHF ni DPO. El entrenamiento consumió aproximadamente 2.08e17 FLOPs y se ejecutó en un hardware con un pico de 2250 TFLOPs.

## Capacidades

- Generación de texto autoregresivo en los dominios de entrenamiento: texto general de FineWeb y secuencias del lenguaje formal Dyck-k128.
- Capacidad de completar patrones de paréntesis balanceados, incluyendo estructuras anidadas de profundidad k=128, tras el post-pretraining.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se han declarado capacidades multilingües; el corpus principal (FineWeb) está predominantemente en inglés.
- El tamaño reducido del modelo implica una capacidad limitada de razonamiento general fuera de los dominios de entrenamiento.

## Casos de uso

- Investigación en post-pretraining sobre lenguajes formales: este checkpoint permite analizar cómo la adaptación a Dyck-k128 afecta a la pérdida en texto general, y viceversa, comparando la pérdida suavizada y el objetivo mínimo registrados.
- Estudio de la dosis de tokens: el modelo pertenece a una serie donde se varía la cantidad de tokens de preentrenamiento (100M en este caso). Sirve para medir cómo esa dosis influye en la convergencia del post-pretraining y en la transferencia a dominios formales.
- Análisis de la reinicialización de embeddings y del optimizador en la transición entre fases: los archivos de configuración incluidos en el repositorio permiten reproducir exactamente el experimento y estudiar el efecto de estas decisiones técnicas.
- Reproducción de experimentos con nanochat: el checkpoint puede cargarse con la biblioteca nanochat para verificar los resultados publicados en el run de W&B y para depurar el pipeline de entrenamiento.
- Evaluación de la generalización a estructuras jerárquicas: el modelo puede utilizarse en experimentos controlados para comprobar hasta qué punto un LM pequeño aprende reglas de anidamiento profundo en secuencias de paréntesis.
- Calibración de métricas de entrenamiento: los valores de `smooth_train_loss` (3.583) y `min_objective` (1.136) ofrecen una referencia cuantitativa para comparar otros experimentos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son métricas internas de entrenamiento: pérdida suavizada de 3.583 y objetivo mínimo de 1.136 en el paso 1525. No existen resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el hardware de entrenamiento reportado tenía un pico de 2250 TFLOPs, lo que sugiere una GPU de alta gama, pero no se especifica el modelo.
- Al ser un modelo pequeño, es probable que quepa en GPUs de consumo, pero no hay datos oficiales de inferencia.
- Opciones de despliegue: nanochat (PyTorch). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos. Existen otros checkpoints de la misma serie publicados por el mismo autor, como `kdyck_dose_100Mpt_20M_s0` y `kdyck_dose_100Mpt_100M_s0`, pero no se han proporcionado especificaciones detalladas ni resultados de benchmarks en la información disponible. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental, no preparado para producción ni para uso general.
- No se documentan sesgos conocidos, pero al ser un modelo pequeño entrenado con un corpus limitado, es probable que alucine en tareas fuera de su dominio.
- La ventana de contexto es de 2048 tokens, lo que limita la capacidad de procesar dependencias largas.
- No se especifican idiomas soportados; el rendimiento fuera del inglés no está evaluado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad, alineación ni robustez.
- El repositorio contiene un único checkpoint en formato `.pt`, sin tokenizador ni script de inferencia independiente; se necesita la biblioteca nanochat para utilizarlo.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_1B_s0_2026-09-06_18-07-14_602889-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/1qpxju0f
- Repo nanochat: https://github.com/karpathy/nanochat
