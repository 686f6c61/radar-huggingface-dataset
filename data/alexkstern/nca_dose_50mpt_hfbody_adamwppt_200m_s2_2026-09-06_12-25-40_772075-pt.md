# alexkstern/nca_dose_50Mpt_hfbody_adamwppt_200M_s2_2026-09-06_12-25-40_772075-pt

## Resumen

El modelo `nca_dose_50Mpt_hfbody_adamwppt_200M_s2_2026-09-06_12-25-40_772075-pt` es un checkpoint de entrenamiento de un modelo GPT de tamaño reducido, desarrollado por Alex Kstern y entrenado con el framework nanochat. Se trata de un modelo de investigación que explora el concepto de "token dose" (cantidad de tokens de entrenamiento) y la etapa de post-pretraining (ppt) con una reinitialización del vocabulario. La arquitectura es un transformer GPT estándar con 16 capas, 8 cabezas de atención, dimensión de embedding 1024 y una longitud de contexto de 2048 tokens.

El entrenamiento consta de dos fases: un pretraining de 50 millones de tokens sobre FineWeb, seguido de un post-pretraining de 200 millones de tokens sobre el dataset `nca-paper-share200-2048`. Este modelo no está pensado para uso en producción, sino como artefacto de investigación para estudiar el comportamiento del entrenamiento con diferentes tamaños de vocabulario y cantidades de tokens. El checkpoint se encuentra en el paso 762, y el entrenamiento no llegó a completarse (el número máximo de iteraciones era 1000). Licenciado bajo Apache 2.0, el modelo no tiene descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GPT) autoregresivo |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer GPT estándar con 16 capas, 8 cabezas de atención, 8 cabezas KV (sin GQA), dimension de embedding 1024 y vocabulario de 65536 tokens en la fase de pretraining, que se reduce a 10004 tokens en la fase de post-pretraining. La longitud de secuencia es de 2048 tokens. El entrenamiento se realizó con el framework nanochat, que implementa una arquitectura GPT simplificada. Los pesos se guardan como un `state_dict` de PyTorch, con un archivo `model_000762.pt` que corresponde al paso 762.

El proceso de entrenamiento tiene dos fases claramente diferenciadas. Primero, un pretraining de 50 millones de tokens sobre el dataset `fineweb-nanochatbpe-100M`. Después, un post-pretraining de 200 millones de tokens sobre `nca-paper-share200-2048`. En la transición entre ambas fases, se reinitializa la capa de embedding y se cambia el vocabulario de 65536 a 10004 tokens, lo que implica que el modelo final utiliza un vocabulario reducido. Además, se reinicia el optimizador en la transición. El optimizador es AdamW con tasas de aprendizaje diferenciadas para matrices (0.02), embeddings (0.3) y unembedding (0.004), sin weight decay. La programación de la tasa de aprendizaje es de tipo trapezoidal, con un warmup de 0 y un warmdown del 40% para el pretraining y del 5% para el post-pretraining.

Según los datos de entrenamiento publicados en la model card, en el paso 762 la pérdida de entrenamiento suavizada es de 4.2185, el objetivo mínimo es 1.2370, y se han utilizado 1.0389e+17 flops, con 2.080 GFLOPs por token. El tiempo total de entrenamiento fue de 309.09 segundos. El checkpoint se guardó antes de completar las 1000 iteraciones previstas, por lo que es un modelo parcialmente entrenado.

## Capacidades

- Generación de texto autoregresiva básica, inherente a la arquitectura GPT.
- Modelado de lenguaje general, entrenado sobre FineWeb (principalmente inglés) y un dataset de papers.
- Capacidad de continuar texto dado un contexto de hasta 2048 tokens.
- No se documentan capacidades específicas de tool calling, function calling, agentes, razonamiento multi-step, visión, audio o código.
- No se han publicado evaluaciones sobre capacidades multilingües; el entrenamiento sugiere un sesgo hacia el inglés.

## Casos de uso

- Investigación sobre post-pretraining: el modelo permite estudiar cómo afecta el entrenamiento con un vocabulario reducido después del pretraining. Es adecuado porque la configuración incluye exactamente la reinitialización de embeddings y el cambio de vocabulario.
- Reproducibilidad de experimentos: la configuración de entrenamiento está completamente documentada en `config_000762.json`, lo que permite replicar el proceso y comparar resultados con otras ejecuciones del mismo autor.
- Estudio de scaling laws en modelos pequeños: al fijar la arquitectura y variar la cantidad de tokens de entrenamiento (50M y 200M), se puede investigar la relación entre tokens y pérdida. El modelo es útil por su tamaño reducido y su registro de flops y pérdida.
- Pruebas de concepto de reinitialización de embeddings: sirve como caso de estudio para entender el impacto de reinitializar la capa de embedding en la transición entre fases de entrenamiento.
- Modelo de referencia para nanochat: al estar entrenado con el framework nanochat, puede usarse como checkpoint de referencia para validar cambios en el framework o para comparar con otros modelos de la misma línea.
- Educación y aprendizaje: por su tamaño reducido, puede ejecutarse en hardware modesto y usarse como ejemplo práctico de entrenamiento de un GPT desde cero, incluyendo el análisis de las métricas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware oficiales para inferencia.
- Dado el tamaño del modelo (16 capas, 1024 de embedding), se espera que quepa en GPUs de consumo como RTX 3060 o superiores, pero no hay datos confirmados.
- Los pesos están en formato PyTorch `state_dict`, por lo que se pueden cargar directamente con PyTorch.
- No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Debido al vocabulario personalizado y a la naturaleza de checkpoint de investigación, es probable que se requiera adaptación para usarlo con estas herramientas.

## Comparativa con modelos similares

No se dispone de modelos comparables con benchmarks publicados. El mismo autor ha publicado otros checkpoints similares en HuggingFace, como `nca_dose_50Mpt_hfbody_200M_s2_2026-08-14_18-05-28_533551-pt` o `nca_dose_50Mpt_hfbody_20M_s2_2026-08-14_17-40-37_845846-pt`, pero no se han publicado resultados de evaluación que permitan una comparación directa.

## Limitaciones y advertencias

- El modelo es un checkpoint parcialmente entrenado (paso 762 de 1000), por lo que su calidad es inferior a la de un modelo entrenado hasta la convergencia.
- El vocabulario final es reducido (10004 tokens), lo que puede limitar su capacidad de expresión y su compatibilidad con tokenizers estándar.
- No se han documentado sesgos específicos, pero al entrenarse sobre FineWeb, puede heredar sesgos presentes en dicho corpus.
- Riesgo de alucinación inherente a un modelo de lenguaje pequeño con datos limitados.
- No se han publicado evaluaciones de seguridad ni de alineación. No se realizaron procesos de RLHF o DPO.
- El modelo está pensado para investigación y experimentación, no para uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero la documentación es escasa y no se garantiza ningún nivel de calidad.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_adamwppt_200M_s2_2026-09-06_12-25-40_772075-pt
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/w0v74tno
