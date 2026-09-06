# alexkstern/nca_dose_50Mpt_hfbody_adamwppt_500M_s0_2026-09-06_12-32-19_850803-pt

## Resumen

El modelo `nca_dose_50Mpt_hfbody_adamwppt_500M_s0` es un modelo de lenguaje pequeño (nanochat GPT) desarrollado por `alexkstern` y entrenado con la librería [nanochat](https://github.com/karpathy/nanochat). Se trata de un experimento de investigación centrado en la dosis de tokens (token dose): pre-entrenamiento con 50 millones de tokens y post-pre-entrenamiento con 500 millones de tokens, lo que permite analizar el impacto de la cantidad de datos en el rendimiento de modelos de tamaño reducido.

El modelo final tiene una arquitectura transformer decoder-only con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024, con una ventana de contexto de 2048 tokens. El checkpoint disponible corresponde al paso 762 de un entrenamiento de 1000 iteraciones, con una pérdida de entrenamiento suavizada de 4.22. El repositorio incluye el state_dict en formato PyTorch, la configuración y los metadatos del entrenamiento, bajo licencia Apache 2.0. Es relevante para investigadores interesados en scaling laws, eficiencia de entrenamiento y el efecto del vocabulario en modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | no disponible |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset de entrenamiento: FineWeb, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar, sin mecanismos de atención lineal ni mezcla de expertos. La configuración indica 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding de 1024 y longitud de secuencia de 2048. El vocabulario en la fase de post-pre-entrenamiento se reduce a 10004 tokens, mientras que el pre-entrenamiento utilizaba un vocabulario de 65536 tokens. A partir de estos datos se puede estimar un tamaño de aproximadamente 222 millones de parámetros, aunque el número exacto no se proporciona.

El entrenamiento se divide en dos fases. Primero, un pre-entrenamiento con 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`. Después, un post-pre-entrenamiento con 500 millones de tokens del dataset `nca-paper-share200-2048`. En la transición entre fases se reinicializan las embeddings y el optimizador (`reinit_embed_at_transition: true`, `reset_optimizer_at_transition: true`). El optimizador es AdamW con learning rates separados para matrices (0.02), embeddings (0.3) y unembedding (0.004). Se usa un scheduler trapezoidal sin warmup y con warmdown del 40% en pre-entrenamiento y del 5% en post-pre-entrenamiento. No se emplea weight decay. El entrenamiento se compiló con `compile_model: true` y grad clip de 1.0. El total de flops usados es de 1.04e17 y el tiempo total de entrenamiento fue de 646 segundos. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva: al ser un decoder-only, puede generar texto token a token.
- No se han publicado evaluaciones de capacidades específicas (razonamiento, código, matemáticas, tool calling, agentes) en la información disponible.
- Modelo de investigación: diseñado para estudiar la dosis de tokens y el efecto del vocabulario en el rendimiento, no para tareas concretas de producción.
- Sin soporte documentado de function calling ni multi-step reasoning.
- Capacidades multilingües no evaluadas; el dataset de entrenamiento es FineWeb (inglés).

## Casos de uso

- Investigación en scaling laws: permite reproducir experimentos de token dose con 50M y 500M tokens, comparando el efecto de la cantidad de datos en la pérdida y el rendimiento.
- Análisis de vocabulario: al reducir el vocabulario de 65536 a 10004 en la fase de post-pre-entrenamiento, sirve para estudiar el impacto del tamaño del vocabulario en la representación y la pérdida.
- Evaluación de schedulers y optimizadores: la configuración incluye learning rates separados para matrices, embeddings y unembedding, así como schedulers trapezoidales, lo que permite experimentar con estrategias de optimización.
- Fine-tuning experimental: por su tamaño reducido y licencia Apache 2.0, puede usarse como base para fine-tuning en tareas específicas con pocos recursos de cómputo.
- Educación: sirve como ejemplo práctico de entrenamiento con la librería nanochat, mostrando la estructura de configuración, los checkpoints y las métricas de entrenamiento.
- Baseline para modelos pequeños: puede utilizarse como referencia en comparaciones de eficiencia y rendimiento de modelos de tamaño similar.
- Pruebas de pipelines de entrenamiento: útil para validar pipelines de pre-entrenamiento y post-entrenamiento con cambios de vocabulario y reinicialización de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de entrenamiento (pérdida suavizada, flops usados, tiempo total) y no proporciona resultados en conjuntos de evaluación como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2.9 GB, por lo que cargar el checkpoint en fp32 requiere al menos esa cantidad de memoria.
- GPU recomendada: no disponible. Al ser un modelo pequeño, cualquier GPU moderna con suficiente VRAM (por ejemplo, RTX 3060 o superior) podría ejecutarlo.
- Cabe en consumer GPU: no disponible, aunque el tamaño del modelo sugiere que es factible en GPUs de consumo.
- Opciones de despliegue: el checkpoint está en formato PyTorch (.pt), por lo que puede cargarse con la librería nanochat o mediante conversión a otros formatos (por ejemplo, safetensors) para su uso con frameworks como Transformers, vLLM o llama.cpp. No hay soporte nativo documentado para estos últimos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Autor | Licencia | Notas |
|---|---|---|---|
| nca_dose_50Mpt_hfbody_adamwppt_500M_s0 (este) | alexkstern | Apache 2.0 | Post-pre-entrenamiento con AdamW, vocab 10004, seed 0 |
| nca_dose_50Mpt_hfbody_500M_s0 | alexkstern | Apache 2.0 | Misma serie, sin "adamwppt" en el nombre, seed 0 |
| nca_dose_50Mpt_hfbody_500M_s1 | alexkstern | Apache 2.0 | Misma serie, sin "adamwppt" en el nombre, seed 1 |

No se dispone de información detallada sobre los modelos comparables; solo se conoce su existencia en HuggingFace y que pertenecen a la misma serie de experimentos.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción.
- Entrenado con una cantidad muy pequeña de tokens (550M en total), lo que limita su conocimiento y cobertura.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad.
- El vocabulario final es de 10004 tokens, lo que puede limitar la representación de texto en comparación con vocabularios más grandes.
- El checkpoint disponible es un paso intermedio (762 de 1000), no el modelo final.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías de rendimiento ni soporte.
- Posible riesgo de generación de texto incoherente o alucinado debido al pequeño tamaño y la limitada cantidad de datos de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_adamwppt_500M_s0_2026-09-06_12-32-19_850803-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/tqjeta5o
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelos similares:
  - https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_500M_s0_2026-08-14_18-10-45_510563-pt
  - https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_500M_s1_2026-08-14_18-19-23_412213-pt
