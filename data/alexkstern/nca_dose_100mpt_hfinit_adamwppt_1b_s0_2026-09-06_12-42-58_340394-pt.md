# alexkstern/nca_dose_100Mpt_hfinit_adamwppt_1B_s0_2026-09-06_12-42-58_340394-pt

## Resumen

Este modelo es un checkpoint de investigación de un transformer GPT entrenado con la librería nanochat de Karpathy. Lo ha desarrollado alexkstern como parte de una serie de experimentos sobre "token dose" y entrenamiento en dos fases. El modelo se preentrena con 100 millones de tokens del dataset FineWeb y posteriormente se entrena con 1.000 millones de tokens de un dataset llamado nca-paper-share20-2048. La arquitectura es un decoder-only transformer con 16 capas, 8 cabezas de atención, 8 KV heads, dimensión de embedding de 1024 y ventana de contexto de 2048 tokens. El checkpoint corresponde al paso 1.525 y se entrenó en unos 693 segundos. Su interés radica en que permite estudiar el efecto de reinitializar los embeddings y el optimizador en la transición entre fases, un tema relevante para optimizar el entrenamiento de modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con 16 capas, 8 cabezas de atención, 8 KV heads, dimensión de embedding 1024 |
| Parametros totales | no disponible (el nombre del modelo sugiere 100M, pero no se especifica el número exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT, implementado con la librería nanochat. La configuración incluye 16 capas, 8 cabezas de atención, 8 KV heads (por tanto, atención multi-cabeza estándar, no GQA), dimensión de embedding de 1024 y secuencia de 2048 tokens. El vocabulario cambia entre fases: en la fase de preentrenamiento (pt) se usa un vocabulario de 65.536 tokens, mientras que en la fase de post-entrenamiento (ppt) se reduce a 10.004 tokens.

El entrenamiento se divide en dos etapas. La primera etapa (pt) consume 100 millones de tokens del dataset FineWeb-nanochatbpe-100M. La segunda etapa (ppt) consume 1.000 millones de tokens del dataset nca-paper-share20-2048. En la transición entre fases se reinitializan los embeddings y se resetea el optimizador. Se usan tasas de aprendizaje separadas para distintos tipos de parámetros: matrix_lr 0.02, embedding_lr 0.3 y unembedding_lr 0.004 en la fase pt; en la fase ppt se usa una tasa de aprendizaje de 5e-05. El programador de tasa de aprendizaje es trapezoidal, con warmup y warmdown configurados de forma distinta en cada fase. No se menciona uso de RLHF, DPO ni ninguna técnica de alineación posterior.

## Capacidades

- Generación de texto autoregresiva con ventana de contexto de 2048 tokens.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento avanzado.
- No se han publicado evaluaciones de capacidades en tareas como código, matemáticas o multilingüismo.
- El modelo fue entrenado principalmente con datos en inglés (FineWeb), aunque no se especifica la cobertura multilingüe.

## Casos de uso

Dado que se trata de un checkpoint de investigación sin evaluaciones de capacidades, los casos de uso son principalmente académicos y experimentales.

- Investigación sobre transferencia de embeddings: el checkpoint permite analizar cómo la reinitialización de embeddings afecta a la convergencia al pasar de una fase de preentrenamiento a una de post-entrenamiento.
- Comparación de estrategias de optimización: sirve como referencia para estudiar el efecto de learning rates separados por tipo de parámetro (embeddings, matriz, unembedding).
- Fine-tuning en tareas de dominio específico: al ser un modelo pequeño, puede ajustarse en tareas concretas con recursos de GPU limitados.
- Análisis de la relación entre tokens consumidos y pérdida: los metadatos (smooth_train_loss, min_objective) permiten estudiar la eficiencia del entrenamiento en función de los tokens procesados.
- Reproducción de experimentos: la configuración completa y el estado del RNG (rng_001525.pt) facilitan la reproducción exacta del run para validar resultados.
- Docencia en entrenamiento de modelos: es un ejemplo práctico de un pipeline de entrenamiento en dos fases con nanochat, útil para cursos o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento suavizada (smooth_train_loss) de 3.5949 y el objetivo mínimo (min_objective) de 1.1371, correspondientes al paso 1.525.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El tamaño del repo es 3.0 GB, pero el modelo es pequeño según su arquitectura (16 capas, dimensión 1024); en FP16, una estimación razonable sería de 0,5 a 1 GB de VRAM, aunque no hay confirmación.
- GPU recomendadas: no disponible. Para inferencia, cualquier GPU consumer con al menos 2 GB de VRAM debería ser suficiente, pero no hay datos oficiales.
- Opciones de despliegue: no disponible. El formato .pt no es directamente compatible con vLLM, llama.cpp u Ollama; requeriría conversión a safetensors o GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks, por lo que no es posible comparar el rendimiento con modelos similares. Existen otros checkpoints del mismo autor en HuggingFace con nombres similares (nca_dose_100Mpt_hfinit_100M_s0 y nca_dose_100Mpt_hfinit_1B_s0), pero no se dispone de especificaciones ni evaluaciones públicas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos no documentados: el modelo fue entrenado en FineWeb, que puede contener sesgos lingüísticos y culturales.
- Riesgo de alucinación no evaluado.
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas de contexto largo.
- Idiomas no especificados; probablemente inglés, sin soporte multilingüe verificado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido validado para producción.
- El checkpoint es un artefacto de investigación sin descargas ni likes, lo que indica que no ha sido probado por la comunidad.
- El formato de pesos .pt puede requerir conversión para su uso con herramientas estándar de despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfinit_adamwppt_1B_s0_2026-09-06_12-42-58_340394-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/80tb21f9
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelos relacionados en HuggingFace:
  - https://huggingface.co/alexkstern/nca_dose_100Mpt_hfinit_100M_s0_2026-08-14_21-54-08_049198-pt
  - https://huggingface.co/alexkstern/nca_dose_100Mpt_hfinit_1B_s0_2026-08-14_23-23-20_239101-pt
