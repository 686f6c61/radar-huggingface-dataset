# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_20M_s0_2026-09-06_22-58-41_339655-pt

## Resumen

El modelo `kdyck_dose_50Mpt_hfinit_adamwppt_20M_s0` es un checkpoint de investigación entrenado con la librería `nanochat`, desarrollada por Andrej Karpathy. Forma parte de una serie de experimentos del autor `alexkstern` orientados a estudiar el efecto de la "dosis" de tokens en un proceso de entrenamiento en dos fases: un pre-entrenamiento (PT) de 50 millones de tokens sobre FineWeb, seguido de un post-pre-entrenamiento (PPT) de 20 millones de tokens sobre el dataset Dyck-k128. El objetivo es analizar cómo un modelo de lenguaje GPT pequeño se adapta a una tarea formal de paréntesis balanceados tras haber sido pre-entrenado en texto natural.

La arquitectura es un transformer denso tipo GPT con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El checkpoint se guardó en el paso 762 de un total de 1000 iteraciones y se distribuye bajo licencia Apache 2.0. Al ser un modelo experimental, no se han publicado evaluaciones externas ni benchmarks que permitan compararlo con modelos de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (GPT) con 16 capas, 8 cabezas de atención, 8 KV heads, dimensión de embedding 1024 |
| Parametros totales | no disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura GPT estándar implementada en `nanochat`, con 16 capas, 8 cabezas de atención, 8 KV heads y una dimensión de embedding de 1024. El vocabulario del pre-entrenamiento es de 65536 tokens (FineWeb con tokenizador nanochat BPE), mientras que el dataset Dyck utiliza un vocabulario reducido de 256 tokens. El entrenamiento se divide en dos fases claramente diferenciadas: una primera fase de pre-entrenamiento sobre 50 millones de tokens de FineWeb, y una segunda fase de post-pre-entrenamiento sobre 20 millones de tokens de Dyck-k128 con longitud de secuencia 2048. En la transición entre fases se re-inicializa la capa de embeddings y se resetea el optimizador, una decisión experimental documentada en la configuración. El optimizador es AdamW con tasas de aprendizaje diferenciadas para la matriz, los embeddings y el unembedding, y un programa de aprendizaje trapezoidal con un warmdown del 40%.

El entrenamiento se ejecutó en una GPU con un pico de 2250 TFLOPS según la configuración. El checkpoint corresponde al paso 762, con una pérdida media suavizada de 4.19 y un tiempo total de entrenamiento de aproximadamente 122.7 segundos. Los FLOPs totales usados ascienden a 1.04e17, lo que equivale a unos 2.08e9 FLOPs por token. No se han publicado detalles sobre el uso de RLHF, DPO o técnicas de alineación.

## Capacidades

- Generación de texto autoregresiva, heredada de la arquitectura GPT.
- Modelado de lenguaje sobre texto web natural (FineWeb) y sobre secuencias formales del lenguaje Dyck-k128.
- Adaptación a una tarea de paréntesis balanceados con vocabulario reducido tras un pre-entrenamiento en lenguaje natural.
- Soporte de tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (visión, audio, modo de pensamiento): no documentadas.

## Casos de uso

- Investigación en aprendizaje de estructuras jerárquicas: el modelo está entrenado en Dyck, un lenguaje formal de paréntesis balanceados, lo que permite estudiar cómo los transformers representan y generalizan dependencias de largo alcance. Se usaría como herramienta de análisis en experimentos de lingüística computacional.
- Estudio de transferencia de conocimiento entre tareas: el diseño en dos fases (FineWeb seguido de Dyck) sirve para cuantificar cómo un pre-entrenamiento en lenguaje natural influye en el aprendizaje posterior de una tarea formal. Útil para trabajos sobre curricula de entrenamiento.
- Análisis del efecto de la "dosis" de tokens: el nombre del modelo refleja un experimento sobre la cantidad de tokens en cada fase. Se puede utilizar para comparar la evolución de la pérdida en función del número de tokens de post-entrenamiento.
- Evaluación de técnicas de re-inicialización de embeddings: la configuración activa `reinit_embed_at_transition`, lo que permite investigar el impacto de re-inicializar la capa de embedding al cambiar de dominio. Este modelo es un caso de estudio para validar esa técnica.
- Comparación de estrategias de inicialización: el sufijo `hfinit` indica que se usó una inicialización de HuggingFace. Permite contrastar la sensibilidad del rendimiento frente a otras inicializaciones en la misma familia de experimentos.
- Reproducción de pipelines de entrenamiento con nanochat: al estar disponible el estado del optimizador, la configuración completa y los metadatos, el modelo puede servir como referencia para reproducir el flujo de entrenamiento de nanochat en entornos académicos o de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Capacidad para ejecutarse en GPU de consumo: no especificada.
- Opciones de despliegue: no documentadas (el checkpoint está en formato PyTorch `.pt`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han publicado datos comparativos con modelos de la misma categoría. Existen otros checkpoints relacionados de la misma serie de experimentos (como `kdyck_dose_50Mpt_20M_s1` y `kdyck_dose_50Mpt_hfinit_20M_s0`), pero no se dispone de métricas de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental: no ha sido diseñado ni validado para uso en producción.
- Entrenamiento acotado a dos datasets (FineWeb y Dyck-k128), lo que limita sus capacidades lingüísticas y su generalización.
- Sin evaluaciones externas ni benchmarks publicados: cualquier afirmación sobre su calidad o rendimiento carece de respaldo.
- Posibles sesgos heredados del dataset FineWeb, que contiene texto web y puede reflejar sesgos lingüísticos y culturales.
- Riesgo de alucinación en generación libre, inherente a los modelos de lenguaje sin alineación.
- Longitud de contexto limitada a 2048 tokens.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo se distribuye sin garantías ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_20M_s0_2026-09-06_22-58-41_339655-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro de entrenamiento W&B: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/sj5cg8w7
- Checkpoint relacionado `kdyck_dose_50Mpt_20M_s1`: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_20M_s1_2026-08-14_22-57-15_573105-pt
- Checkpoint relacionado `kdyck_dose_50Mpt_hfinit_20M_s0`: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_20M_s0_2026-08-14_15-27-02_584781-pt
