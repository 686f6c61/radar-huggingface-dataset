# SLBM/teutonic-II-110B-A7B-router08-fulldepth

## Resumen

El modelo teutonic-II-110B-A7B-router08-fulldepth es un checkpoint experimental de Mixture of Experts (MoE) de 110B parámetros, desarrollado por SLBM para el subnet 3 de Bittensor (Teutonic). Se deriva del rey vigente "teutonic-II-110B-A7B-5DALwjE4-v44" mediante dos técnicas: recalibración del router y entrenamiento "full-depth" en el que las 45 capas del modelo se adaptan simultáneamente. Su propósito principal es documentar un hallazgo de investigación: las capas entrenadas de forma aislada apenas mejoran el modelo, mientras que el entrenamiento conjunto de todas las capas produce mejoras significativamente mayores.

El modelo no supera el umbral de aceptación del subnet (LCB@4000 ≈ +0.0013 frente a delta_threshold = 0.025), por lo que se publica como una medición reproducible y no como un checkpoint competitivo. A pesar de ello, ofrece datos valiosos sobre la co-adaptación de capas en modelos MoE y sobre la sensibilidad de la evaluación a la ruta de medición.

La arquitectura es un MoE de 110B con 7B parámetros activos (según la nomenclatura A7B), basado en la implementación MiMo-V2. El repo en HuggingFace tiene un tamaño de 6.0 GB, lo que sugiere que contiene solo los pesos entrenables (3.008B) y no el modelo completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en MiMo-V2, 45 capas |
| Parametros totales | 110B (aprox. 110.3B) |
| Parametros activos | 7B (según nomenclatura A7B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 6.0 GB, probablemente solo pesos entrenables) |

Nota: la model card indica que los expertos enrutados congelados suman 107.3B y los tensores entrenables 3.008B, totalizando ~110.3B.

## Arquitectura y entrenamiento

El modelo es un MoE de 110B con 45 capas. De ellas, 44 son capas MoE con expertos enrutados y expertos compartidos, y la capa 0 contiene un MLP denso. Los parámetros entrenables totalizan 3.008B e incluyen la atención (qkv_proj y o_proj) de las 45 capas, los expertos compartidos de las 44 capas MoE, todas las layernorms y el MLP denso de la capa 0. Los 107.3B de expertos enrutados permanecen congelados durante el entrenamiento.

El proceso de entrenamiento consta de dos pasos. Primero, una recalibración del router: se aplica la transformación b' = 0.8*(b - mean(b)) sobre e_score_correction_bias en las 44 capas MoE. Esta transformación no tiene gradiente, ya que el sesgo solo participa en la selección top-k, no en las puertas de activación. Segundo, un entrenamiento "full-depth" de los 316 tensores entrenables con AdamW-8bit, lr=5e-6, durante 4.0M tokens de predicción del mixture de evaluación (dclm-baseline-1.0, automathtext-v2, finewebedu), con microbatch 1 × accum 2, constante LR sin cosine y warmup de 20 pasos. El entrenamiento se ejecuta en modo eval, ya que la implementación de MiMo-V2 bloquea el modo de entrenamiento en el router.

La innovación principal es el hallazgo de que entrenar todas las capas simultáneamente produce una mejora de +0.000885 (7.3σ) sobre el punto de partida, más de 11 veces la mejora del mejor bloque entrenado de forma aislada (+0.000078). La tasa de aprendizaje es crítica: con lr=1.5e-5, el entrenamiento por bloques produce resultados catastróficos (mu_hat negativo), mientras que con lr=5e-6 se obtienen mejoras positivas.

## Capacidades

- Generación de texto: modelo de lenguaje base sin ajuste por RLHF/DPO documentado.
- Razonamiento: no se han publicado evaluaciones específicas de razonamiento.
- Código y matemáticas: no se han publicado benchmarks de código o matemáticas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles. Los datasets de entrenamiento (dclm-baseline-1.0, automathtext-v2, finewebedu) sugieren un corpus principalmente en inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en post-entrenamiento de MoE: el modelo permite estudiar cómo la recalibración del router y el entrenamiento de todas las capas afectan la pérdida de cross-entropy por secuencia. Es útil para comparar estrategias de adaptación de routers en modelos MoE de gran escala.
- Validación de metodologías de evaluación: la model card documenta la importancia de usar un único code path para medir mejoras. Este modelo sirve como caso de estudio para evitar errores de medición en subnets de Bittensor.
- Análisis de co-adaptación de capas: el hallazgo de que bloques entrenados aisladamente no mejoran el modelo, mientras que el entrenamiento conjunto sí, es relevante para diseñar estrategias de fine-tuning en modelos MoE.
- Reproducibilidad de resultados: el checkpoint se publica con una medición detallada y un procedimiento reproducible, lo que permite a otros investigadores replicar los experimentos y verificar los resultados.
- Exploración de técnicas de adaptación de routers: la recalibración del router con γ=0.8 es un método no aprendido que puede aplicarse a otros modelos MoE para ajustar la selección de expertos.
- Desarrollo de modelos para Bittensor subnet 3: aunque no supera el umbral de aceptación, el modelo es un punto de partida para futuros intentos de post-entrenamiento en el subnet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card presenta resultados de evaluación de mejora de cross-entropy por secuencia, medidos sobre 1,200 secuencias held-out, comparando este modelo con variantes previas:

| Modelo | mu_hat | sigma | LCB@1200 | LCB@4000* |
|---|---|---|---|---|
| Router γ=0.8 + full-depth @4M (este modelo) | +0.001523 | 11.6 | +0.001157 | +0.001300 |
| Router γ=0.8 + block-44 + blocks-42/43 (mejor anterior) | +0.001402 | 9.1 | +0.000953 | +0.001140 |
| Router γ=0.8 solo | +0.000638 | 7.5 | +0.000382 | +0.000494 |

*Proyección al n=4000 del validador mediante aproximación normal, no un resultado del validador.

Mejoras por fuente de datos:

| Fuente | Este modelo | Mejor anterior |
|---|---|---|
| automathtext-v2 | +0.003519 (9.0σ) | +0.003392 (6.6σ) |
| dclm-baseline-1.0 | +0.000734 (5.8σ) | +0.000588 (5.0σ) |
| finewebedu | +0.001028 (5.8σ) | +0.000972 (5.6σ) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se han publicado requisitos de hardware ni cuantizaciones soportadas.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: no disponibles. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

El repo de HuggingFace tiene un tamaño de 6.0 GB, lo que sugiere que contiene solo los pesos entrenables (3.008B) y no los 107.3B de expertos enrutados congelados. Para inferir el modelo completo sería necesario cargar el modelo base (dendriteholdings/teutonic-II-110B-genesis) y aplicar los pesos entrenables, lo que requeriría memoria para los 110B parámetros.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Las variantes de este mismo modelo se comparan en la sección de benchmarks. El modelo base es dendriteholdings/teutonic-II-110B-genesis, del cual se deriva, pero no se han publicado sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- El modelo no supera el umbral de aceptación del subnet 3 de Bittensor (LCB@4000 ≈ +0.0013 frente a delta_threshold = 0.025). Es un checkpoint de medición, no competitivo.
- Es un modelo experimental, no apto para producción. No se han publicado evaluaciones de seguridad, sesgos o alucinaciones.
- El entrenamiento es muy sensible a la tasa de aprendizaje: con lr=1.5e-5 se obtienen resultados catastróficos (mu_hat negativo), mientras que con lr=5e-6 se obtienen mejoras positivas.
- Las mediciones son extremadamente sensibles a la ruta de evaluación. Las diferencias en los prefix caches o en los splits de datos pueden producir errores del mismo orden que los efectos medidos. Se requiere un único code path para comparar resultados.
- Los resultados de mejora son pequeños y no convergidos. El entrenamiento se detuvo a los 4M tokens cuando la mejora aún estaba aumentando.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), por lo que no es posible evaluar su rendimiento en tareas generales.
- La licencia MIT permite uso comercial, pero el modelo no es competitivo y carece de documentación de soporte.
- No hay información sobre la longitud de contexto, los idiomas soportados, los formatos de pesos o las cuantizaciones disponibles.

## Enlaces

- HuggingFace: https://huggingface.co/SLBM/teutonic-II-110B-A7B-router08-fulldepth
- Modelo base: https://huggingface.co/dendriteholdings/teutonic-II-110B-genesis
- Noticias del subnet 3: https://subnetradar.com/subnet-news/3/2026-09-01
