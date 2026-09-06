# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_5M_s0_2026-09-06_15-11-17_629483-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfbody_adamwppt_5M_s0_2026-09-06_15-11-17_629483-pt` es un checkpoint experimental de un modelo de lenguaje basado en la arquitectura GPT, entrenado con la librería `nanochat` de Karpathy. Lo desarrolla el usuario `alexkstern` como parte de una serie de experimentos sobre el efecto de la "dosis" de tokens en modelos pequeños, combinando preentrenamiento en texto general y una fase posterior con un dataset sintético de lenguaje Dyck. El checkpoint guardado corresponde al paso 762 del preentrenamiento, con una pérdida suave de 3.7543 y un objetivo mínimo de 1.1415.

La arquitectura es un transformer con 16 capas, 8 cabezas de atención y 8 cabezas KV, con una dimensión de embedding de 1024 y una ventana de contexto de 2048 tokens. El repositorio contiene únicamente pesos en formato PyTorch (`.pt`) junto con metadatos de entrenamiento, y no se han publicado resultados de benchmarks ni evaluaciones externas. Es un modelo de investigación, no orientado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GPT) con 16 capas, 8 cabezas, 8 KV heads, dimension de embedding 1024 |
| Parametros totales | no disponible (la configuracion permite estimar ~270M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, implementado con `nanochat`. Según la configuración de entrenamiento, la arquitectura del modelo de preentrenamiento (`model_pt`) tiene 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding 1024 y un vocabulario de 65536 tokens. El modelo se entrena con una ventana de contexto de 2048 tokens. La configuración también define un segundo modelo (`model_ppt`) con el mismo número de capas y dimensión, pero con un vocabulario reducido a 256 tokens, destinado a una fase posterior de entrenamiento en un dataset Dyck.

El entrenamiento consta de dos fases. La fase de preentrenamiento (`pt`) utiliza el dataset `fineweb-nanochatbpe-100M` con 100 millones de tokens. La fase posterior (`ppt`) utiliza el dataset `dyck-k128-seq_len_2048-1B` con 5 millones de tokens. En la transición entre fases se reinicializan los embeddings y se reinicia el optimizador, lo que sugiere un cambio de vocabulario. El checkpoint disponible corresponde a la fase de preentrenamiento, en el paso 762 de un total de 1000 iteraciones. Se emplea un optimizador AdamW con tasas de aprendizaje diferenciadas para matrices, embeddings y unembeddings, y un programador de tasa de aprendizaje trapezoidal con un 40% de calentamiento/descenso. Las métricas de entrenamiento reportadas incluyen `flops_used` de 2.08e17 y `flops_per_token` de 2.08e9.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje preentrenado en FineWeb, es capaz de generar texto en el estilo del corpus, aunque su tamaño reducido limita la calidad.
- No se han documentado capacidades específicas de tool calling, function calling, agentes, vision o audio en la información disponible.
- No se han publicado evaluaciones de razonamiento, matemáticas o código.
- El modelo está diseñado para experimentos de investigación sobre tokenización y entrenamiento, no como modelo de propósito general.

## Casos de uso

- Investigación en scaling laws: el modelo permite estudiar cómo varía la pérdida y el rendimiento con una cantidad fija de tokens (100M) en una arquitectura pequeña, comparando con otros checkpoints de la misma familia.
- Ablaciones de arquitectura: gracias a la configuración completa guardada, puede usarse para comparar configuraciones de capas, cabezas o dimensiones de embedding en modelos GPT pequeños.
- Experimentos de curriculum learning: la transición de FineWeb a un dataset Dyck con reinicialización de embeddings permite investigar el efecto del cambio de vocabulario y de dominio en el aprendizaje.
- Evaluación de tokenizadores: el vocabulario de 65536 tokens y el dataset BPE de nanochat permiten analizar el impacto del tamaño del vocabulario en la eficiencia de entrenamiento.
- Reproducibilidad de entrenamiento: al incluir semilla fija, configuración y metadatos, es útil para replicar experimentos y verificar la estabilidad del entrenamiento.
- Docencia y demostraciones: puede emplearse como ejemplo práctico de entrenamiento de un transformer desde cero con `nanochat`, mostrando el pipeline completo de preentrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento como `smooth_train_loss` (3.7543) y `min_objective` (1.1415), así como datos de flops y tiempo de entrenamiento. No hay comparaciones con otros modelos ni evaluaciones en conjuntos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (según el tamaño estimado de ~270M parámetros, en fp32 la ocupación sería del orden de 1-2 GB, pero no es un dato oficial).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido, aunque no hay datos verificados.
- Opciones de despliegue: no disponible. El checkpoint está en formato `.pt` de PyTorch, por lo que requiere conversión para usarse con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos de la misma categoría en la información disponible. Existe otro checkpoint del mismo autor con un nombre similar (`kdyck_dose_100Mpt_5M_s0_2026-08-14_17-52-53_380978-pt`), pero no se dispone de sus especificaciones ni resultados. Por tanto, no es posible establecer una comparación basada en datos verificados.

## Limitaciones y advertencias

- Sesgos: no documentados, pero al entrenarse en FineWeb el modelo puede heredar sesgos presentes en ese corpus.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño, es probable que genere texto incoherente o factualmente incorrecto.
- Limitaciones de contexto: la ventana de 2048 tokens es relativamente corta para tareas que requieren contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo es experimental y no está validado para entornos de producción.
- Formato: el checkpoint solo está disponible en `.pt`, lo que dificulta la integración con frameworks de inferencia estándar sin conversión previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_5M_s0_2026-09-06_15-11-17_629483-pt
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/p7y36svq
- Librería nanochat: https://github.com/karpathy/nanochat
