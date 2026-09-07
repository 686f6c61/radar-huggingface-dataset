# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_100M_s0_2026-09-06_20-19-51_747730-pt

## Resumen

Este modelo es un checkpoint experimental de un transformer entrenado con la librería `nanochat`, desarrollado por el usuario `alexkstern`. Forma parte de una serie de experimentos denominada "token dose" que investiga cómo la cantidad de tokens de pre-entrenamiento y post-entrenamiento afecta al aprendizaje de lenguajes formales. El modelo fue entrenado en dos fases: una primera fase de pre-entrenamiento con 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`, y una segunda fase de post-entrenamiento con 100 millones de tokens del dataset sintético `dyck-k128-seq_len_2048-1B`.

La arquitectura es un transformer decoder-only de 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El checkpoint guardado corresponde al paso 762 de un total de 1000 iteraciones. El modelo final utiliza un vocabulario reducido de 256 tokens, específico para el dataset Dyck, y se re-inicializó el embedding en la transición entre fases.

Es un modelo de investigación, no un modelo de lenguaje de propósito general. Su relevancia radica en el estudio de curvas de scaling y la interacción entre el pre-entrenamiento en lenguaje natural y el aprendizaje de tareas sintéticas estructuradas, como los lenguajes de paréntesis balanceados Dyck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | No disponible (estimacion ~192M segun config) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar implementada en `nanochat`. La configuración especifica 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding de 1024 y un vocabulario de 65536 tokens en la fase de pre-entrenamiento. En la transición a la segunda fase, el vocabulario se reduce a 256 tokens y se re-inicializa la capa de embedding (`reinit_embed_at_transition: true`), además de resetear el optimizador.

Los datos de entrenamiento son dos: `fineweb-nanochatbpe-100M` para la fase de pre-entrenamiento (50 millones de tokens) y `dyck-k128-seq_len_2048-1B` para la fase de post-entrenamiento (100 millones de tokens). El dataset Dyck es un lenguaje formal de paréntesis balanceados con 128 tipos de paréntesis y secuencias de longitud 2048. Se utilizó un esquema de learning rate trapezoidal con warmup cero y warmdown del 40% en la primera fase, y warmdown del 10% en la segunda. El optimizador es AdamW con learning rates diferenciados para matrices, embeddings y unembeddings. El entrenamiento total consumió aproximadamente 1.04e17 FLOPs, con un tiempo total de 237 segundos.

## Capacidades

- Generación de secuencias de tokens en el lenguaje formal Dyck (paréntesis balanceados) con vocabulario de 256 tokens.
- Evaluación de la influencia del pre-entrenamiento en lenguaje natural sobre el aprendizaje de tareas sintéticas.
- No soporta tool calling, function calling ni agentes.
- No soporta visión, audio ni capacidades multimodales.
- No tiene capacidades multilingües declaradas.
- No dispone de modo de razonamiento explícito ni de capacidades especiales más allá de la generación de secuencias sintéticas.

## Casos de uso

- Investigación en interpretabilidad de transformers: el modelo permite analizar cómo las capas internas representan estructuras jerárquicas de paréntesis anidados, gracias a su entrenamiento en un lenguaje formal controlado.
- Estudios de scaling laws: sirve como punto de comparación para medir el efecto de la cantidad de tokens de pre-entrenamiento y post-entrenamiento en el rendimiento final.
- Análisis de transferencia de aprendizaje: permite evaluar si el pre-entrenamiento en texto natural (FineWeb) facilita el aprendizaje de estructuras sintácticas formales como Dyck.
- Evaluación de técnicas de re-inicialización de embeddings: el experimento incluye re-inicialización de la capa de embedding en la transición de fase, lo que permite estudiar su impacto en la convergencia.
- Comparación de regímenes de learning rate: el uso de schedules trapezoidales con diferentes warmdown ratios en cada fase ofrece datos para investigar la sensibilidad del entrenamiento a la estrategia de LR.
- Docencia y demostraciones de nanochat: el checkpoint puede usarse como ejemplo práctico de cómo entrenar y evaluar un modelo pequeño con datos sintéticos en la librería `nanochat`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye métricas de entrenamiento del propio checkpoint:

| Metrica | Valor |
|---|---|
| step | 762 |
| smooth_train_loss | 4.214669227600098 |
| min_objective | 1.2327814865442683 |
| flops_used | 1.0389065468529869e+17 |
| flops_per_token | 2080374784.0 |
| total_training_time | 237.32638931274414 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP32, asumiendo ~192M parámetros y overhead de ejecución.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, RTX 3050, GTX 1660 Super o superior).
- El modelo cabe en GPUs de consumo básicas, dado su tamaño reducido.
- Opciones de despliegue: carga directa con PyTorch. No es compatible con vLLM, llama.cpp, Ollama o TGI por tratarse de un checkpoint experimental con formato `.pt` y vocabulario no estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se han identificado otros checkpoints de la misma serie de experimentos en HuggingFace, aunque no se dispone de sus especificaciones detalladas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kdyck_dose_50Mpt_hfbody_adamwppt_100M_s0 (este) | No disponible | 2048 | Apache-2.0 | HuggingFace |
| kdyck_dose_50Mpt_200M_s1_2026-08-14_23-16-34_777872-pt | No disponible | No disponible | No disponible | HuggingFace |
| kdyck_dose_50Mpt_500M_s0_2026-08-14_23-25-05_820140-pt | No disponible | No disponible | No disponible | HuggingFace |

La comparación detallada no está disponible porque no se han publicado los datos técnicos de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación experimental, no apto para aplicaciones de producción.
- El vocabulario final de 256 tokens limita su uso exclusivamente al dataset Dyck; no puede generar texto libre en lenguaje natural.
- No se han publicado benchmarks externos, por lo que no es posible evaluar su rendimiento en tareas estándar.
- No soporta tool calling, agentes, visión ni audio.
- El modelo fue entrenado con un número reducido de tokens (150 millones en total), lo que probablemente provoca overfitting al dataset sintético.
- La licencia Apache-2.0 permite uso comercial, pero la utilidad práctica del modelo para fines comerciales es nula.
- No hay información sobre sesgos, ya que el entrenamiento se realizó principalmente con datos sintéticos y no se ha evaluado en contextos sociales.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_100M_s0_2026-09-06_20-19-51_747730-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro de entrenamiento W&B: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/sxeouunf
