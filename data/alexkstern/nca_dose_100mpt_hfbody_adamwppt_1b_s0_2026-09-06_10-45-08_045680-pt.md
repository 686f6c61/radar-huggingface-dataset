# alexkstern/nca_dose_100Mpt_hfbody_adamwppt_1B_s0_2026-09-06_10-45-08_045680-pt

## Resumen

El modelo `nca_dose_100Mpt_hfbody_adamwppt_1B_s0` es un modelo de lenguaje pequeño desarrollado por `alexkstern` como parte de una serie de experimentos de investigación sobre la dinámica de entrenamiento de transformers. Está entrenado con la librería `nanochat` de Karpathy y forma parte de un estudio sobre el efecto de la cantidad de tokens (token dose) y la transición de vocabulario en modelos de tamaño reducido.

La arquitectura es un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El modelo se entrena en dos fases: una fase de pretraining (`pt`) con 100 millones de tokens del dataset FineWeb y un vocabulario de 65536 tokens, y una fase de post-pretraining (`ppt`) con 1000 millones de tokens de un dataset denominado `nca-paper-share20-2048` y un vocabulario reducido de 10004 tokens. El checkpoint disponible corresponde al paso 1525 de entrenamiento.

Este modelo es relevante principalmente para la comunidad investigadora interesada en estudiar la transferencia de embeddings, la optimización del vocabulario y la eficiencia del entrenamiento en modelos pequeños. No está orientado a uso en producción ni a tareas de propósito general, sino a la reproducibilidad y al análisis experimental. El repositorio incluye el checkpoint en formato `.pt`, metadatos de entrenamiento, configuración completa y estado del generador de números aleatorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat_gpt) |
| Parametros totales | no disponible (config: n_layer=16, n_embd=1024, n_head=8, n_kv_head=8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en formato .pt) |
| Idiomas soportados | no disponible (dataset FineWeb, probablemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar implementado en `nanochat`. La configuración indica 16 capas, 8 cabezas de atención, 8 cabezas KV (sin GQA diferenciado) y una dimensión de embedding de 1024. No es un modelo MoE ni SSM. El vocabulario cambia entre fases: en la fase `pt` se usa un vocabulario de 65536 tokens, mientras que en la fase `ppt` se reduce a 10004 tokens. Esta reducción de vocabulario es una característica experimental del estudio, acompañada de la re-inicialización del embedding y el reset del optimizador en la transición.

El entrenamiento se divide en dos etapas. La primera (`pt_tokens`) utiliza 100 millones de tokens del dataset `fineweb-nanochatbpe-100M`. La segunda (`ppt_tokens`) utiliza 1000 millones de tokens del dataset `nca-paper-share20-2048`. La tasa de aprendizaje es trapezoidal, con un calentamiento del 10% y un enfriamiento del 80% en la fase `ppt`. El optimizador AdamW se configura con learning rates diferenciados para matrices (`matrix_lr=0.02`), embeddings (`embedding_lr=0.3`) y unembedding (`unembedding_lr=0.004`). No se aplican técnicas de RLHF ni DPO. El checkpoint está en el paso 1525, con una pérdida de entrenamiento suavizada de 3.576 y un objetivo mínimo de 1.139. Los FLOPs utilizados ascienden a 2.08e17.

## Capacidades

- Generación de texto básica: el modelo puede producir texto en el idioma del dataset de entrenamiento, probablemente inglés, pero al ser un modelo pequeño y experimental, la calidad es limitada.
- Razonamiento: no se espera razonamiento complejo ni capacidades de matemáticas avanzadas.
- Código: sin soporte documentado para generación de código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: sin soporte de visión ni audio. El modelo no dispone de modo de pensamiento (thinking mode).
- Reproducibilidad: el repositorio incluye metadatos completos, configuración y estado RNG, lo que facilita la reproducción exacta de los experimentos.

## Casos de uso

- Investigación sobre transferencia de embeddings: el modelo permite estudiar cómo afecta la re-inicialización del embedding al pasar de un vocabulario grande a uno pequeño. Se puede comparar el rendimiento con el modelo de vocabulario grande para aislar el efecto de la compresión.
- Reproducción de experimentos de nanochat: al incluir la configuración completa, los metadatos y el estado RNG, el checkpoint es útil para verificar la reproducibilidad de los resultados publicados en el estudio original.
- Análisis de la dinámica de entrenamiento: las métricas de FLOPs por token, tiempo total y pérdida suavizada permiten estudiar la eficiencia computacional del entrenamiento en modelos pequeños.
- Fine-tuning en tareas de clasificación de texto: con una ventana de contexto de 2048 tokens y un tamaño reducido, el modelo puede adaptarse a tareas de clasificación con pocos recursos computacionales, siempre que se disponga de un dataset etiquetado en el idioma del modelo.
- Benchmarking de hardware: el modelo es ligero y puede usarse para medir el rendimiento de inferencia y entrenamiento en GPUs de consumo, comparando throughput y latencia con otros modelos de tamaño similar.
- Uso educativo: la implementación con `nanochat` y la documentación detallada del entrenamiento hacen que este modelo sea adecuado para demostrar el funcionamiento interno de los transformers y el proceso de optimización en cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos presentes son métricas de entrenamiento (pérdida suavizada, FLOPs utilizados, tiempo total), que no son comparables entre modelos ni representan rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de aproximadamente 150-260 millones de parámetros (según la fase), los pesos en FP32 ocupan entre 600 MB y 1 GB. En FP16, la ocupación se reduce a 300-500 MB. Con un batch pequeño, se puede inferir con 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA T4, RTX 3050 o superiores. Para entrenamiento, la configuración original indica un `peak_tflops` de 2250, lo que sugiere el uso de GPUs de gama alta (probablemente H100), pero el modelo es lo suficientemente pequeño como para entrenarse en GPUs de consumo.
- Compatibilidad con GPU de consumo: sí. El modelo cabe en GPUs de consumo como RTX 3060 (12 GB) o incluso en tarjetas con 6 GB si se usa precisión reducida.
- Opciones de despliegue: el checkpoint está en formato `.pt`, por lo que se puede cargar directamente con PyTorch. No se proporcionan conversiones a GGUF ni integraciones con vLLM, Ollama o TGI, aunque es posible convertir el modelo manualmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los modelos comparables son otros checkpoints de la misma serie experimental de `alexkstern`, como `nca_dose_100Mpt_hfbody_1B_s1` y `nca_dose_100Mpt_100M_s0`. Sin embargo, no se dispone de datos de rendimiento publicados para ninguno de ellos, por lo que la comparación se limita a la configuración y al propósito experimental.

| Modelo | Configuración | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nca_dose_100Mpt_hfbody_adamwppt_1B_s0 | 16 capas, 1024 embd, vocab 10004 (ppt) | 2048 | Apache 2.0 | HuggingFace |
| nca_dose_100Mpt_hfbody_1B_s1 | Similar, seed distinta | 2048 | Apache 2.0 | HuggingFace |
| nca_dose_100Mpt_100M_s0 | Similar, variante con 100M | 2048 | Apache 2.0 | HuggingFace |

No se dispone de benchmarks comparativos entre estos modelos. La serie parece diseñada para estudiar el efecto de la semilla, la cantidad de tokens y la configuración del vocabulario, más que para competir en tareas estándar.

## Limitaciones y advertencias

- Modelo experimental de investigación, no apto para uso en producción ni para aplicaciones críticas.
- No se han publicado evaluaciones en benchmarks estándar, por lo que el rendimiento real en tareas de lenguaje es desconocido.
- El vocabulario reducido (10004 tokens) en la fase final limita la cobertura léxica y puede afectar negativamente a la calidad del texto generado.
- El dataset de entrenamiento (FineWeb) es predominantemente inglés, lo que introduce sesgos lingüísticos y culturales. No se ha documentado la presencia de otros idiomas.
- Al ser un modelo pequeño, el riesgo de alucinación es alto y la coherencia a largo plazo puede ser limitada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías de ningún tipo.
- No hay soporte para tool calling, agentes ni integraciones con frameworks de despliegue estándar.
- El tamaño del repositorio (3.0 GB) sugiere que los pesos se almacenan en precisión completa (FP32), lo que puede ser ineficiente para despliegue en producción sin cuantización adicional.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfbody_adamwppt_1B_s0_2026-09-06_10-45-08_045680-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/d55hfhax
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelo similar `nca_dose_100Mpt_hfbody_1B_s1`: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfbody_1B_s1_2026-08-15_00-55-24_338967-pt
- Modelo similar `nca_dose_100Mpt_100M_s0`: https://huggingface.co/alexkstern/nca_dose_100Mpt_100M_s0_2026-08-15_01-47-38_441450-pt
