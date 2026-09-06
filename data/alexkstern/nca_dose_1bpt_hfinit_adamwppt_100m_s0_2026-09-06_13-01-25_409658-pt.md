# alexkstern/nca_dose_1Bpt_hfinit_adamwppt_100M_s0_2026-09-06_13-01-25_409658-pt

## Resumen

El modelo `nca_dose_1Bpt_hfinit_adamwppt_100M_s0` es un checkpoint experimental de un transformer GPT entrenado con el framework nanochat de Karpathy. Lo desarrolla el usuario alexkstern como parte de un estudio sobre "dosis de tokens" (token dose), donde se investiga el efecto de combinar una fase de preentrenamiento con 1.000 millones de tokens y una fase de postentrenamiento con 100 millones de tokens adicionales. El modelo tiene alrededor de 100 millones de parámetros, una ventana de contexto de 2048 tokens y una arquitectura decoder-only de 16 capas.

Se trata de un modelo de investigación, no de producción, publicado como checkpoint de entrenamiento en el paso 3.814. Su relevancia radica en que permite reproducir y analizar experimentos de eficiencia de entrenamiento y de cambio de vocabulario entre fases. La licencia es Apache 2.0, lo que facilita su uso en entornos académicos y de investigación. No se han publicado benchmarks de tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT (decoder-only) |
| Parametros totales | ~100 millones (según nombre del modelo; no confirmado en documentación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo pesos en formato .pt) |
| Idiomas soportados | No disponible (probablemente inglés, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de un transformer causal GPT: 16 capas, 8 cabezas de atención (todas ellas KV, sin GQA), 1024 dimensiones de embedding y 2048 tokens de contexto. La configuración distingue dos fases: `model_pt` con un vocabulario de 65.536 tokens y `model_ppt` con un vocabulario de 10.004 tokens. Durante la transición entre fases se re-inicializan las embeddings (`reinit_embed_at_transition: true`) y se reinicia el optimizador (`reset_optimizer_at_transition: true`), lo que constituye una innovación técnica destacable del experimento.

El preentrenamiento se realizó sobre el dataset `fineweb-nanochatbpe-20B` con 1.000 millones de tokens, y el postentrenamiento sobre `nca-paper-share200-2048` con 100 millones de tokens. Se usó el optimizador AdamW con tasas de aprendizaje diferenciadas para matrices, embeddings y unembeddings, y un scheduler trapezoidal. El entrenamiento completo duró aproximadamente 795 segundos y consumió 2,08e18 FLOPs, con una pérdida final suavizada de 3,16. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto causal en modo autoregresivo.
- Soporte de contextos de hasta 2048 tokens.
- Capacidad de ajuste fino en tareas específicas al ser un modelo pequeño.
- No soporta tool calling ni function calling (no se menciona en la configuración).
- No soporta razonamiento multi-paso ni agentes.
- Sin capacidades de visión, audio ni modo de pensamiento.
- Capacidades multilingües no confirmadas.

## Casos de uso

- Investigación en eficiencia de entrenamiento: el modelo permite estudiar el impacto de la "dosis de tokens" (1B pt + 100M ppt) en la pérdida final y en la convergencia. Se puede cargar el checkpoint y comparar con otros runs del mismo proyecto en W&B.
- Experimentos de tokenización: al tener dos vocabularios distintos (65.536 y 10.004) en las dos fases, es útil para analizar cómo afecta el cambio de vocabulario a la representación aprendida y a la coherencia del modelo.
- Reproducibilidad de experimentos: la configuración completa está disponible en `config_003814.json`, lo que permite reproducir el run exacto en nanochat y validar resultados.
- Fine-tuning en tareas de NLP de bajo recurso: al ser un modelo de ~100M, se puede ajustar en datasets pequeños con pocos recursos computacionales, por ejemplo para clasificación de texto o generación de respuestas cortas.
- Educación y docencia: sirve como ejemplo práctico de entrenamiento de un GPT desde cero con nanochat, mostrando las dos fases de entrenamiento y el cambio de vocabulario.
- Pruebas de infraestructura: su tamaño reducido lo hace adecuado para validar pipelines de entrenamiento e inferencia, probar integraciones con frameworks como PyTorch o medir el rendimiento en GPUs de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas registradas son las de entrenamiento, recogidas en la model card:

| Metrica | Valor |
|---|---|
| Paso (step) | 3814 |
| Perdida suavizada de entrenamiento | 3.163491725921631 |
| Objetivo minimo | 0.9438474318424812 |
| FLOPs utilizados | 2.0799945247754813e+18 |
| Tiempo total de entrenamiento | 794.7493550777435 segundos |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 200 MB en FP16 y 400 MB en FP32 (estimación basada en el tamaño del modelo y la ventana de contexto de 2048 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como RTX 3060, RTX 4060 o superiores. Para entrenamiento se usó una GPU con 2250 TFLOPS pico, probablemente una H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de gama baja.
- Opciones de despliegue: carga directa con PyTorch a partir del archivo `.pt`. No se proporcionan versiones GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otros checkpoints del mismo autor con tamaños diferentes dentro del mismo proyecto de token dose:

| Modelo | Parametros | Contexto | Vocabulario pt | Licencia |
|---|---|---|---|---|
| nca_dose_1Bpt_hfinit_20M_s0 | ~20M | 2048 | 65536 | Apache 2.0 |
| nca_dose_1Bpt_hfinit_100M_s0 (este modelo) | ~100M | 2048 | 65536 | Apache 2.0 |
| nca_dose_1Bpt_hfinit_500M_s0 | ~500M | 2048 | 65536 | Apache 2.0 |

No se dispone de datos de benchmarks comparativos entre estos modelos ni frente a otros transformers de tamaño similar como GPT-2 pequeño (124M), por lo que la comparación se limita a parámetros y configuración.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo final listo para producción. No ha pasado por procesos de alineación como RLHF o DPO.
- El cambio de vocabulario en la fase de postentrenamiento (con re-inicialización de embeddings) puede provocar incoherencias en la generación si no se usa exactamente el mismo tokenizador que en la fase ppt.
- No se han documentado sesgos específicos, pero al entrenarse sobre FineWeb es probable que herede sesgos del dataset, principalmente en inglés.
- Riesgo de alucinación no evaluado, al no contar con benchmarks de calidad de respuesta.
- No soporta tool calling, agentes ni razonamiento estructurado.
- El formato de pesos es exclusivamente `.pt`, lo que limita su uso en frameworks como llama.cpp o vLLM sin conversión previa.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_adamwppt_100M_s0_2026-09-06_13-01-25_409658-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/2cie7xz4
- Framework nanochat: https://github.com/karpathy/nanochat
- Otros checkpoints del autor: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_20M_s0_2026-08-14_10-45-35_772377-pt
- Checkpoint de 500M: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_500M_s0_2026-08-14_13-02-03_921837-pt
