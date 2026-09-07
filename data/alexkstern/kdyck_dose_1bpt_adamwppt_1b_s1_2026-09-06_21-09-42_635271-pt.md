# alexkstern/kdyck_dose_1Bpt_adamwppt_1B_s1_2026-09-06_21-09-42_635271-pt

## Resumen

El modelo `kdyck_dose_1Bpt_adamwppt_1B_s1` es un checkpoint de investigación experimental desarrollado por alexkstern utilizando la librería `nanochat` de Karpathy. Se trata de un transformer de 16 capas y 8 cabezas de atención con una dimensión de modelo de 1024, entrenado en dos fases: una primera fase de pre-entrenamiento sobre el dataset `fineweb-nanochatbpe-20B` y una segunda fase de post-entrenamiento sobre un dataset sintético de paréntesis anidados `dyck-k128-seq_len_2048-1B`. El checkpoint corresponde al paso 3.814 de entrenamiento.

El propósito del experimento es estudiar el efecto de la "dosis de tokens" (token dose) en el aprendizaje de estructuras jerárquicas, como las generadas por el lenguaje Dyck-k. La configuración incluye un esquema de aprendizaje con tasas diferenciadas para matrices, embeddings y unembeddings, y una re-inicialización del embedding en la transición entre fases. El modelo se publica bajo licencia Apache 2.0 y el repositorio tiene un tamaño de 3.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat GPT) con 16 capas, 8 cabezas de atención, 8 KV heads y dimensión de modelo 1024 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer estándar, tal como se configura en la librería `nanochat`. Según la configuración del entrenamiento, el modelo de pre-entrenamiento tiene un vocabulario de 65.536 tokens, mientras que el modelo de post-entrenamiento usa un vocabulario reducido de 256 tokens. La arquitectura consta de 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de secuencia es de 2048 tokens.

El entrenamiento se divide en dos fases. La primera fase (etiquetada como `pt`) utiliza el dataset `fineweb-nanochatbpe-20B` con 1.000 millones de tokens. La segunda fase (etiquetada como `ppt`) utiliza el dataset `dyck-k128-seq_len_2048-1B`, también con 1.000 millones de tokens, que consiste en secuencias de paréntesis anidados de hasta 128 tipos. En la transición entre fases se re-inicializa el embedding y se reinicia el optimizador. El scheduler de aprendizaje es trapezoidal, con un warmup del 10% y un warmdown del 20% en la fase de post-entrenamiento. El optimizador usa tasas de aprendizaje separadas para matrices (0.02), embeddings (0.3) y unembeddings (0.004). No se ha documentado el uso de RLHF, DPO ni otras técnicas de alineación.

El checkpoint se guardó en el paso 3.814, con una pérdida de entrenamiento suavizada de 3.165. El entrenamiento consumió aproximadamente 2.08e18 FLOPs y un total de 1.458,98 segundos. Los datos de evaluación adicionales incluyen `c4-nanochatbpe-10B`.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- El modelo está diseñado como un experimento de investigación sobre el aprendizaje de estructuras jerárquicas mediante el lenguaje sintético Dyck-k, pero no se han publicado evaluaciones de sus habilidades en tareas de lenguaje natural.
- No se ha confirmado el soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- Las capacidades multilingües no están documentadas.

## Casos de uso

No se han documentado casos de uso en la información disponible. Dado que se trata de un checkpoint de investigación experimental, no se recomienda su uso en aplicaciones de producción. El modelo no está destinado a tareas concretas de generación de texto, código, matemáticas o atención al cliente sin una evaluación previa específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos comparativos de rendimiento en MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

No se han publicado requisitos de hardware para inferencia. El checkpoint se distribuye en formato PyTorch `.pt`, por lo que puede cargarse con la librería `nanochat` o con cualquier framework compatible. No se dispone de estimaciones de VRAM, latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de la misma categoría. El autor tiene otros checkpoints relacionados en HuggingFace (`kdyck_dose_1Bpt_500M_s1` y `kdyck_dose_1Bpt_200M_s1`), pero no se han documentado resultados que permitan una comparación técnica.

## Limitaciones y advertencias

- Se trata de un checkpoint de investigación sin evaluaciones de sesgos, alucinaciones o comportamiento ético.
- La longitud de contexto es de 2048 tokens, lo que limita su uso en tareas que requieran ventanas de contexto largas.
- El modelo ha sido entrenado principalmente con datos sintéticos Dyck-k y FineWeb, por lo que su conocimiento general y su capacidad de razonamiento en tareas del mundo real no están garantizados.
- No se recomienda su uso en producción sin una validación exhaustiva.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo no ha sido diseñado ni probado para ello.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_adamwppt_1B_s1_2026-09-06_21-09-42_635271-pt
- Checkpoint relacionado (500M): https://huggingface.co/alexkstern/kdyck_dose_1Bpt_500M_s1_2026-08-14_07-56-59_923172-pt
- Checkpoint relacionado (200M): https://huggingface.co/alexkstern/kdyck_dose_1Bpt_200M_s1_2026-08-14_07-06-05_872207-pt
- Proyecto nanochat: https://github.com/karpathy/nanochat
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/pk3nll7y
