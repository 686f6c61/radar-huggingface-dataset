# alexkstern/nca5M_pptnudge_hfbody_1Bpt_s1_2026-09-06_22-22-23_604295-pt

## Resumen

El modelo `nca5M_pptnudge_hfbody_1Bpt_s1_2026-09-06_22-22-23_604295-pt` es un checkpoint experimental de lenguaje autoregresivo entrenado con la librería [nanochat](https://github.com/karpathy/nanochat) por el desarrollador alexkstern. Su objetivo principal es investigar el efecto de un cambio de vocabulario durante una fase de post-entrenamiento (PPT, "post-pretraining nudge"), en la que el modelo pasa de un vocabulario de 65 536 tokens a uno de 10 004 tokens, re-inicializando los embeddings en la transición.

La arquitectura es un transformer GPT (decoder-only) con 16 capas, 8 cabezas de atención, 1024 dimensiones de embedding y una longitud de contexto de 2048 tokens. El preentrenamiento consume 1 000 millones de tokens de FineWeb y el post-entrenamiento 5 millones de tokens de un conjunto de datos de dominio académico (`nca-paper-share200-2048`). El checkpoint se encuentra en el paso 3 814 de entrenamiento, con una pérdida de entrenamiento suavizada de 3.162.

Es un modelo de investigación, no orientado a producción, que aporta datos sobre la dinámica de re-inicialización de embeddings y la adaptación de vocabulario en modelos pequeños. No se han publicado benchmarks ni evaluaciones de capacidades en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, GPT-like) segun config nanochat |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en .pt sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar de nanochat con 16 capas, 8 cabezas de atención, 8 cabezas clave-valor, 1024 dimensiones de embedding y un vocabulario de 65 536 tokens durante la fase de preentrenamiento. En la fase de post-entrenamiento, el vocabulario se reduce a 10 004 tokens, se re-inicializan los embeddings y se reinicia el optimizador. El preentrenamiento se realiza sobre `fineweb-nanochatbpe-20B` durante 1 000 millones de tokens, mientras que el post-entrenamiento utiliza `nca-paper-share200-2048` durante 5 millones de tokens. No se aplica RLHF ni DPO.

La configuracion de optimizacion es singular: se usan tasas de aprendizaje separadas para la matriz de pesos (`matrix_lr=0.02`), los embeddings (`embedding_lr=0.3`) y la capa de salida (`unembedding_lr=0.004`). La curva de aprendizaje es trapezoidal, con una fase de calentamiento nula y una fase de enfriamiento del 80 % en el post-entrenamiento. El entrenamiento completo duró 737 segundos y utilizó aproximadamente 2.08 × 10^18 FLOPs, con un coste de 2 080 374 784 FLOPs por token.

## Capacidades

- Generacion de texto autoregresiva basica, inherente a la arquitectura GPT decoder-only.
- No se han publicado evaluaciones de razonamiento, matematicas, generacion de codigo o soporte de vision.
- Sin soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (audio, vision, etc.).
- Capacidades multilingues no especificadas en la informacion disponible.

## Casos de uso

Los siguientes casos de uso son hipoteticos y se centran en la investigacion academica, dado que el modelo es un checkpoint experimental sin validacion de rendimiento:

- Investigacion sobre transferencia de vocabulario: el modelo permite estudiar como afecta la reduccion del vocabulario de 65 536 a 10 004 tokens en una fase posterior de entrenamiento. Es adecuado porque la configuracion `reinit_embed_at_transition` activa la re-inicializacion de embeddings, un punto de interes para la comprension de representaciones.
- Estudio de re-inicializacion de embeddings: sirve para analizar la perdida de informacion y la adaptacion del modelo al cambiar la tabla de tokens. El checkpoint en el paso 3 814 proporciona una instantanea de la fase de transicion.
- Experimentos de eficiencia de entrenamiento: al utilizar solo 1 000 millones de tokens de preentrenamiento y 5 millones de post-entrenamiento, se puede evaluar el impacto de las curvas de aprendizaje trapezoidales y de las tasas de aprendizaje separadas en modelos pequenos.
- Comparacion de metodos de post-entrenamiento: el modelo se puede comparar con otros checkpoints del mismo autor, como `nca_dose_1Bpt_hfbody_5M_s1`, para aislar el efecto de la configuracion "ppt nudge" frente a otras variantes.
- Analisis de la dinamica de perdida: las metricas registradas (`smooth_train_loss`, `min_objective`) permiten reconstruir el comportamiento de la funcion de perdida durante el entrenamiento y validar hipotesis sobre la estabilidad del proceso.
- Reproduccion de experimentos con nanochat: el checkpoint puede cargarse directamente en el framework nanochat para reproducir el entrenamiento y probar variaciones de configuracion sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la configuracion de entrenamiento indica `peak_tflops: 2250.0`, lo que sugiere un hardware de alta gama (por ejemplo, H100), pero no se especifica para inferencia.
- Compatibilidad con consumer GPUs: no disponible.
- Opciones de despliegue: no disponible; el formato de pesos es un `.pt` de PyTorch, sin indicaciones de compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nca5M_pptnudge_hfbody_1Bpt_s1 | no disponible | 2048 | Apache 2.0 | HuggingFace |
| nca_dose_1Bpt_hfbody_5M_s1 (mismo autor) | no disponible | 2048 | Apache 2.0 | HuggingFace |

No se disponen de datos de rendimiento ni benchmarks para una comparacion significativa entre estos modelos. No se conocen modelos comparables con datos publicados en la informacion disponible.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de sesgos, alucinaciones o riesgos de seguridad.
- Es un checkpoint de investigacion, no validado para uso comercial ni para entornos de produccion.
- El formato de pesos es exclusivamente `.pt`, sin conversiones a `safetensors` ni `GGUF`.
- La informacion sobre idiomas, capacidades y rendimiento esta ausente en la model card.
- El entrenamiento se realizo con una cantidad relativamente pequena de tokens (1 000 millones), lo que limita su rendimiento en comparacion con modelos contemporaneos.
- La licencia Apache 2.0 permite uso comercial, pero no existe ninguna garantia de funcionalidad ni soporte.
- El proceso de post-entrenamiento con reduccion de vocabulario y re-inicializacion de embeddings puede provocar perdidas de rendimiento no documentadas.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca5M_pptnudge_hfbody_1Bpt_s1_2026-09-06_22-22-23_604295-pt
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Registro de Weights & Biases: https://wandb.ai/alexksternteam/ppt_nudge_probe_v0/runs/5lovoxt4
