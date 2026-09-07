# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_20M_s1_2026-09-06_23-01-59_163606-pt

## Resumen

Este modelo es un checkpoint experimental desarrollado por alexkstern dentro del framework nanochat, un proyecto de investigación de Karpathy. El identificador del repositorio y la configuración de entrenamiento indican que se trata de un estudio sobre el efecto de la cantidad de tokens de entrenamiento en distintas fases (pretraining y post-pretraining) y sobre la re-inicialización de embeddings al cambiar de vocabulario. El modelo se entrena primero con 50 millones de tokens de FineWeb, usando un vocabulario de 65 536 tokens, y posteriormente se somete a un post-pretraining con 20 millones de tokens de un dataset sintético Dyck (k=128, longitud de secuencia 2048), reduciendo el vocabulario a 256 tokens.

Arquitectónicamente es un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 KV heads y dimensiones de embedding de 1024, con una longitud de contexto de 2048 tokens. No es un modelo de propósito general ni está pensado para producción: es un experimento de investigación sobre dinámica de entrenamiento, transferencia de vocabulario y capacidades de razonamiento estructural en lenguajes sintéticos. Su relevancia radica en que permite estudiar cómo afecta la dosis de tokens de cada fase al rendimiento final, un tema activo en la investigación de eficiencia y escalado de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat_gpt), GQA, 16 capas, 8 cabezas, 8 KV heads, embedding 1024 |
| Parametros totales | No disponible (estimado: ~202M con vocab_ppt=256; ~336M con vocab_pt=65536) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo pesos .pt en fp32, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer estándar decoder-only implementado en nanochat_gpt. La configuración de entrenamiento incluye dos definiciones de modelo: `model_pt` con un vocabulario de 65 536 tokens y `model_ppt` con un vocabulario de 256 tokens. Ambos comparten la misma estructura interna (16 capas, 8 cabezas, 8 KV heads, embedding 1024). El proceso de entrenamiento consta de dos fases: una fase de pretraining sobre 50 millones de tokens de FineWeb (dataset `fineweb-nanochatbpe-100M`) y una fase de post-pretraining sobre 20 millones de tokens del dataset sintético `dyck-k128-seq_len_2048-1B`. En la transición entre fases se re-inicializan los embeddings (`reinit_embed_at_transition: true`) y se reinicia el optimizador (`reset_optimizer_at_transition: true`). Se utiliza una programación de learning rate trapezoidal con warmdown del 40% y un learning rate para el post-pretraining de 0.0003. No se indica uso de RLHF ni DPO.

La innovación técnica destacable es el diseño experimental de "token dose": se fija una dosis de tokens de pretraining y otra de post-pretraining para estudiar su impacto en el rendimiento final, junto con la reducción drástica de vocabulario en la segunda fase. El checkpoint publicado corresponde al paso 762 de un total de 1000 iteraciones, con una pérdida de entrenamiento suavizada de 4.193 y un objetivo mínimo de 1.228.

## Capacidades

- Generación de texto en el dominio del dataset Dyck (paréntesis balanceados con 128 tipos), aunque no se ha verificado su calidad.
- Capacidad limitada de generación de lenguaje natural heredada del pretraining en FineWeb, pero el vocabulario reducido a 256 tokens en la fase de post-pretraining restringe severamente esta capacidad.
- No se ha evaluado ni documentado soporte de tool calling, function calling, agentes, razonamiento multi-step, visión o audio.
- No hay datos sobre capacidades multilingües.
- No se ha implementado ni documentado un modo de "thinking" o razonamiento extendido.

## Casos de uso

- Investigación en transferencia de vocabulario: el modelo permite estudiar cómo la re-inicialización de embeddings afecta al rendimiento cuando se reduce el vocabulario, un problema relevante para adaptar modelos a dominios específicos.
- Evaluación de razonamiento estructural: al entrenarse en un dataset Dyck, puede utilizarse para analizar la capacidad de un transformer para aprender estructuras jerárquicas de paréntesis balanceados.
- Estudio de la dosis de tokens: sirve como caso de uso para comparar el efecto de diferentes proporciones de tokens de pretraining y post-pretraining en el rendimiento final, dentro de la línea de investigación de "token dose".
- Experimentos de dinámica de optimización: al disponer de métricas de flops, pérdida y tiempo de entrenamiento, puede usarse para analizar la eficiencia de AdamW con learning rates diferenciados por tipo de parámetro (matriz, embeddings, unembedding).
- Reproducción de experimentos: los archivos de configuración y metadatos permiten reproducir el entrenamiento y verificar la influencia de la semilla (seed 1) y el caso (case_c) en los resultados.
- Análisis de curvas de pérdida: el checkpoint en el paso 762 proporciona un punto intermedio para estudiar la evolución de la pérdida durante el post-pretraining.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas documentadas son las de entrenamiento: pérdida suavizada de 4.193, objetivo mínimo de 1.228, 1.04e17 flops utilizados y 120.93 segundos de tiempo total de entrenamiento. No se proporcionan comparaciones con otros modelos ni resultados en conjuntos de evaluación estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: si el checkpoint final corresponde a la configuración con vocab_ppt=256 (~202M parámetros), en fp32 se necesitan aproximadamente 0.8 GB de VRAM; en fp16, unos 0.4 GB. Si fuera la configuración con vocab_pt=65536 (~336M parámetros), la VRAM sería ~1.3 GB en fp32 y ~0.7 GB en fp16.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM sería suficiente para inferencia básica. No se requieren GPUs de alta gama como A100 o H100 para ejecutar este modelo.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño como para ejecutarse en GPUs de consumo como RTX 3060 o inferiores.
- Opciones de despliegue: no disponible. El modelo se publica como un state_dict de PyTorch (.pt), sin conversiones a formatos como GGUF o safetensors, por lo que no es directamente compatible con vLLM, llama.cpp u Ollama sin un proceso de conversión manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada ni en los resultados de búsqueda web. Los únicos repositorios relacionados son otros experimentos del mismo autor con nombres similares (por ejemplo, `kdyck_dose_50Mpt_hfinit_20M_s1_2026-08-14_15-29-46_257204-pt` y `kdyck_dose_50Mpt_1B_s1_2026-08-14_23-57-51_865256-pt`), pero no se dispone de datos suficientes para establecer una comparativa técnica.

## Limitaciones y advertencias

- Modelo experimental de investigación, no apto para uso en producción.
- El checkpoint publicado corresponde a un paso intermedio (762 de 1000), por lo que puede no representar el estado final del entrenamiento.
- El vocabulario se reduce a 256 tokens en la fase de post-pretraining, lo que limita enormemente su capacidad para generar texto en lenguaje natural.
- No se han publicado benchmarks ni evaluaciones externas, por lo que su rendimiento real en tareas generales es desconocido.
- El riesgo de alucinación es alto en contextos fuera del dataset Dyck, dado el vocabulario reducido y el propósito experimental.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no ofrece ninguna utilidad práctica para aplicaciones comerciales.
- Los datos de entrenamiento incluyen un dataset sintético (Dyck) que no representa lenguaje natural real, lo que puede inducir sesgos hacia estructuras artificiales.
- No se documentan sesgos conocidos, pero al entrenarse parcialmente en FineWeb, podría heredar sesgos presentes en ese corpus.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_20M_s1_2026-09-06_23-01-59_163606-pt
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/331lsneu
- Framework nanochat: https://github.com/karpathy/nanochat
- Modelo similar de alexkstern (fecha anterior): https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_20M_s1_2026-08-14_15-29-46_257204-pt
- Modelo similar de alexkstern (con 1B tokens): https://huggingface.co/alexkstern/kdyck_dose_50Mpt_1B_s1_2026-08-14_23-57-51_865256-pt
