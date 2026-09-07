# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_500M_s1_2026-09-06_21-12-09_062036-pt

## Resumen

El modelo `kdyck_dose_50Mpt_hfbody_adamwppt_500M_s1_2026-09-06_21-12-09_062036-pt` es un checkpoint de investigación desarrollado por alexkstern utilizando la librería nanochat. Se trata de un modelo GPT (decoder-only transformer) de pequeño tamaño, con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024. Está diseñado para estudiar el efecto de la "dosis" de tokens de post-entrenamiento en un dominio sintético: primero se pre-entrena en el dataset `fineweb-nanochatbpe-100M` con 50 millones de tokens, y después se entrena en `dyck-k128-seq_len_2048-1B`, un dataset de lenguaje Dyck (paréntesis balanceados) con 500 millones de tokens. El checkpoint corresponde al paso 762 de entrenamiento.

El modelo tiene una longitud de contexto de 2048 tokens y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que permite analizar cómo la cantidad de tokens de un dominio concreto afecta al aprendizaje de estructuras formales, un tema de interés en aprendizaje continuo y evaluación de algoritmos de optimización. No está pensado para uso en producción, sino como herramienta de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar implementada en nanochat. Según la configuración de entrenamiento, tiene 16 capas, 8 cabezas de atención (todas ellas también KV heads, es decir, sin grouping), dimensión de embedding de 1024 y un vocabulario de 65536 tokens en la fase de pre-entrenamiento. La longitud de contexto es de 2048 tokens.

El proceso de entrenamiento consta de dos fases. Primero, un pre-entrenamiento en `fineweb-nanochatbpe-100M` con 50 millones de tokens. Después, una fase de post-entrenamiento en `dyck-k128-seq_len_2048-1B`, un dataset sintético de lenguaje Dyck con k=128, usando 500 millones de tokens. En la transición entre fases se reinitializan los embeddings y se resetea el optimizador; además, el vocabulario se reduce a 256 tokens en la fase de post-entrenamiento (`ppt_vocab_size`). Se utiliza un scheduler de tipo trapezoid con warmup y warmdown, y un learning rate específico para el post-entrenamiento de 6e-05. No se emplea RLHF ni DPO. El entrenamiento se realizó con compilación del modelo y un total de 1000 iteraciones planificadas, alcanzando el checkpoint en el paso 762.

## Capacidades

- Generación de texto en lenguaje natural, aunque su capacidad está limitada por el pequeño tamaño y el dataset sintético de post-entrenamiento.
- Aprendizaje de estructuras formales de Dyck (paréntesis balanceados), que es el objetivo principal del experimento.
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio.
- Capacidades multilingües no especificadas; el dataset de pre-entrenamiento es `fineweb-nanochatbpe`, que suele ser en inglés.

## Casos de uso

- Investigación en aprendizaje continuo: el modelo permite estudiar cómo la cantidad de tokens de un dominio específico (Dyck) afecta al rendimiento después del pre-entrenamiento. Se puede usar para comparar réplicas con diferentes semillas o configuraciones de optimizador.
- Evaluación de algoritmos de optimización: al ser un checkpoint de un experimento con AdamW y schedulers trapezoid, sirve para analizar el efecto de diferentes learning rates y estrategias de re-inicialización.
- Benchmarking de modelos pequeños en lenguajes formales: el dataset Dyck con k=128 es un referente para medir la capacidad de un modelo para capturar dependencias de largo alcance.
- Pruebas de concepto en entornos de investigación académica: por su pequeño tamaño, es fácil de ejecutar en GPUs de gama media para reproducir experimentos.
- Análisis de la transición entre pre-entrenamiento y post-entrenamiento: se puede investigar el impacto de resetear el optimizador y re-inicializar los embeddings en el aprendizaje de un nuevo dominio.
- Estudio de la "dosis" de tokens: el nombre del modelo (token_dose) indica que está diseñado para cuantificar cuántos tokens son necesarios para que un modelo pequeño aprenda una tarea sintética concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de entrenamiento suavizada (`smooth_train_loss` = 4.210320472717285) y el objetivo mínimo (`min_objective` = 1.232582416415068), pero no hay comparaciones con otros modelos ni evaluaciones en conjuntos estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se proporcionan requisitos de hardware oficiales en la documentación del modelo.
- Dado que el modelo tiene 16 capas y una dimensión de embedding de 1024, se trata de un modelo pequeño que probablemente puede ejecutarse en GPUs consumer, aunque no se dispone de datos confirmados de VRAM.
- El checkpoint se guarda en formato PyTorch (.pt), por lo que puede cargarse directamente con PyTorch, pero no se ha documentado soporte para frameworks de despliegue como vLLM, llama.cpp u Ollama.
- No se dispone de cifras de latencia o throughput.

## Comparativa con modelos similares

En la búsqueda web se han encontrado otros checkpoints de la misma familia, creados por el mismo autor y con nombres similares:
- `kdyck_dose_50Mpt_500M_s0_2026-08-14_23-25-05_820140-pt` (https://huggingface.co/alexkstern/kdyck_dose_50Mpt_500M_s0_2026-08-14_23-25-05_820140-pt)
- `kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14_16-05-06_333015-pt` (https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14_16-05-06_333015-pt)

Sin embargo, no se dispone de información detallada sobre estos modelos (parámetros, contexto, rendimiento, licencia o disponibilidad). Por lo tanto, no es posible realizar una comparativa técnica con datos concretos. Se puede afirmar que pertenecen a la misma serie de experimentos sobre la dosis de tokens en Dyck, pero no hay datos adicionales.

## Limitaciones y advertencias

- Es un modelo experimental de investigación, no diseñado para uso en producción.
- El post-entrenamiento se realiza sobre un dataset sintético de Dyck, lo que limita su utilidad en tareas de lenguaje natural reales.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo pequeño y entrenado en un dominio restringido, es probable que cometa errores en tareas generales.
- No se especifican los idiomas soportados; el pre-entrenamiento con `fineweb-nanochatbpe` sugiere un sesgo hacia el inglés.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza del modelo (checkpoint de investigación) no lo hace adecuado para aplicaciones comerciales.
- No se han publicado benchmarks que permitan evaluar su calidad en tareas estándar.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_500M_s1_2026-09-06_21-12-09_062036-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/ggxv125k
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelo similar 1: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_500M_s0_2026-08-14_23-25-05_820140-pt
- Modelo similar 2: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14_16-05-06_333015-pt
