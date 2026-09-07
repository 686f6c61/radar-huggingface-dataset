# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_200M_s0_2026-09-06_23-22-13_742289-pt

## Resumen

El modelo `kdyck_dose_50Mpt_hfinit_adamwppt_200M_s0_2026-09-06_23-22-13_742289-pt` es un checkpoint experimental entrenado con la librería `nanochat` (el proyecto de GPT minimalista de Karpathy) y publicado por el usuario `alexkstern`. Se trata de un transformer decoder-only de aproximadamente 202 millones de parámetros, diseñado para investigar el aprendizaje de lenguajes formales, concretamente el lenguaje Dyck-k128 (secuencias de paréntesis balanceados con 128 tipos de paréntesis). El entrenamiento se realizó en dos fases: primero un preentrenamiento sobre 50 millones de tokens del dataset FineWeb (con vocabulario de 65 536 tokens) y después un post-entrenamiento sobre 200 millones de tokens de un dataset sintético Dyck-k128 (con vocabulario reducido a 256 tokens). El checkpoint corresponde al paso 762 del entrenamiento y se publica bajo licencia Apache-2.0.

Este modelo no es un modelo de lenguaje general ni está pensado para tareas de producción; su relevancia radica en ser una pieza de una serie de experimentos sobre el efecto de la "dosis de tokens" en el aprendizaje de estructuras jerárquicas, la transferencia entre vocabularios y el comportamiento de transformadores en tareas sintéticas controladas. La arquitectura es un transformer estándar con 16 capas, 8 cabezas de atención y una ventana de contexto de 2048 tokens. No se dispone de datos sobre cuantizaciones, idiomas soportados ni benchmarks públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT, estilo nanochat) |
| Parametros totales | ~202 millones (post-entrenamiento, con vocabulario de 256 tokens) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo final se entrena sobre un dataset sintético de Dyck-k128, no sobre lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, con 16 capas, 8 cabezas de atención, 8 cabezas clave-valor (sin GQA, ya que `n_kv_head == n_head`), dimensión de embedding de 1024 y una ventana de contexto de 2048 tokens. La configuración de entrenamiento distingue dos fases: un modelo de preentrenamiento (`model_pt`) con vocabulario de 65 536 tokens y un modelo de post-entrenamiento (`model_ppt`) con vocabulario de 256 tokens. En la transición entre fases se reinicializa el embedding (`reinit_embed_at_transition: true`) y se resetea el optimizador (`reset_optimizer_at_transition: true`). El aprendizaje se realizó con una tasa de aprendizaje trapezoidal, sin warmup y con warmdown del 40 % en la primera fase y del 100 % en la segunda. No se aplicó RLHF, DPO ni ninguna técnica de alineación. El entrenamiento se ejecutó en un clúster con una capacidad pico de 2250 TFLOPS, usando `compile_model: true`.

El dataset de preentrenamiento es `fineweb-nanochatbpe-100M` (50 millones de tokens), mientras que el de post-entrenamiento es `dyck-k128-seq_len_2048-1B` (200 millones de tokens utilizados de un total disponible de 1 000 millones). La evaluación intermedia se realizó sobre `c4-nanochatbpe-10B` como conjunto auxiliar. El objetivo del experimento es estudiar cómo la cantidad de tokens de post-entrenamiento afecta al aprendizaje de un lenguaje formal con un vocabulario reducido, manteniendo el resto de hiperparámetros fijos.

## Capacidades

- Generación de secuencias balanceadas de paréntesis del lenguaje Dyck-k128, con hasta 128 tipos de paréntesis y contexto de 2048 tokens.
- El modelo está diseñado para tareas sintéticas de razonamiento estructural, no para lenguaje natural.
- No se ha evaluado en tareas de generación de texto libre, código, matemáticas o visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso más allá de la tarea Dyck.
- Capacidades multilingües: no aplica, el vocabulario final es de 256 tokens.
- No soporta entrada de audio ni imágenes.

## Casos de uso

- Investigación en lenguajes formales: el modelo permite estudiar cómo un transformer aprende la estructura jerárquica de Dyck-k128, comparando diferentes dosis de tokens de post-entrenamiento y semillas.
- Evaluación de scaling laws: forma parte de una serie de experimentos con distintos tamaños (20M, 200M, 500M) y dosis de tokens, útil para trazar curvas de pérdida frente a flops o tokens.
- Estudio de transferencia entre vocabularios: el proceso de reinicialización del embedding y reset del optimizador permite analizar el impacto de cambiar el vocabulario a mitad del entrenamiento.
- Benchmark de curriculum learning: la secuencia preentrenamiento + post-entrenamiento con datos sintéticos sirve como banco de pruebas para algoritmos de curriculum y de reinitialización de capas.
- Educación en deep learning: al ser un modelo pequeño y con una tarea bien definida, es adecuado para demostrar el entrenamiento de transformers, la lectura de logs de W&B y la reproducción de experimentos.
- Reproducibilidad: el checkpoint incluye semilla, configuración completa y metadatos de entrenamiento, lo que permite verificar resultados y comparar variantes del mismo experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las métricas de entrenamiento reportadas en la model card son las siguientes:

| Metrica | Valor |
|---|---|
| step | 762 |
| smooth_train_loss | 4.176811218261719 |
| min_objective | 1.2230948502860752 |
| flops_used | 1.0389065468529869e+17 |
| flops_per_token | 2080374784.0 |
| total_training_time | 296.34333753585815 |

Estas métricas corresponden al estado del modelo en el checkpoint publicado y no constituyen una evaluación de rendimiento en tareas externas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~202 millones de parámetros. En FP32 ocupa aproximadamente 808 MB; en FP16, unos 404 MB. Con activaciones, se recomienda al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna con 2 GB o más de VRAM, por ejemplo RTX 3060, RTX 4060 o superior. También puede ejecutarse en CPU con unos pocos GB de RAM.
- Sí cabe en GPU de consumo. Es un modelo pequeño, adecuado para tarjetas gráficas de gama media o incluso integradas.
- Opciones de despliegue: PyTorch directamente (cargando el state_dict). No se ha documentado soporte para vLLM, TGI u Ollama. Se podría convertir a GGUF para usar con llama.cpp, aunque no hay archivos de cuantización publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada con modelos de la misma categoría. El modelo pertenece a la serie "token_dose" de `alexkstern`, que incluye otros checkpoints con arquitectura y proceso de entrenamiento similares, pero con diferentes dosis de tokens de post-entrenamiento. Por ejemplo:

| Modelo | Diferencia principal |
|---|---|
| kdyck_dose_50Mpt_500M_s0_2026-08-14_23-25-05_820140-pt | Post-entrenamiento con 500 millones de tokens en lugar de 200 millones |
| kdyck_dose_50Mpt_hfinit_20M_s0_2026-08-14_15-27-02_584781-pt | Post-entrenamiento con 20 millones de tokens en lugar de 200 millones |

No se han encontrado especificaciones completas de estos modelos en la información proporcionada, por lo que no es posible realizar una comparación de rendimiento o parámetros.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: su vocabulario de 256 tokens y su entrenamiento en Dyck-k128 lo hacen inadecuado para texto natural, código o conversación.
- No se han evaluado sesgos sociales ni alucinaciones en tareas del mundo real; al ser un modelo sintético, el riesgo es bajo, pero no se ha analizado formalmente.
- Longitud de contexto limitada a 2048 tokens, lo que restringe tareas que requieran secuencias más largas.
- No soporta tool calling, agentes ni razonamiento complejo fuera de la tarea Dyck.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es práctico para producción debido a su naturaleza experimental.
- El checkpoint puede no ser reproducible sin la configuración exacta (semilla, datasets, hardware, versión de nanochat), y no se ha verificado su funcionamiento fuera del entorno de entrenamiento original.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_200M_s0_2026-09-06_23-22-13_742289-pt
- Registro de entrenamiento (W&B): https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/fyxk5vkw
- Repositorio nanochat: https://github.com/karpathy/nanochat
