# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_100M_s1_2026-09-06_20-25-01_695394-pt

## Resumen

Este modelo es un checkpoint experimental entrenado con la librería nanochat, desarrollado por alexkstern. Se trata de un transformer de tipo GPT con 16 capas, 8 cabezas de atención, dimensiones de embedding de 1024 y una ventana de contexto de 2048 tokens. El preentrenamiento se realizó sobre el corpus FineWeb con 50 millones de tokens, seguido de un post-entrenamiento sobre un dataset sintético de Dyck-k (lenguaje de paréntesis balanceados) con 100 millones de tokens. El objetivo del experimento parece ser estudiar el efecto de la dosis de tokens de post-entrenamiento en un modelo pequeño. Es un checkpoint de investigación, con 0 descargas y 0 likes en el momento de su publicación, y no está pensado para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GPT) con 16 capas, 8 cabezas de atención, 8 cabezas KV, n_embd=1024, vocab_size=65536 |
| Parametros totales | No disponible (configuración: n_layer=16, n_embd=1024, vocab_size=65536) |
| Parametros activos | No disponible (el modelo no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (corpus de preentrenamiento: FineWeb) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de nanochat GPT, un transformer decoder-only con atención multi-cabeza. La configuración indica 16 capas, 8 cabezas de atención con 8 cabezas KV, dimensión de embedding de 1024 y un vocabulario de 65.536 tokens. El entrenamiento se divide en dos fases: una fase de preentrenamiento (pt) sobre FineWeb con 50 millones de tokens, y una fase de post-entrenamiento (ppt) sobre un dataset de Dyck-k con 100 millones de tokens y un vocabulario reducido de 256 tokens. En la transición entre fases se reinicializa el embedding, se resetea el optimizador y se cambia la tasa de aprendizaje a un esquema trapezoidal con warmup cero. El checkpoint se guardó en el paso 762 de 1000 iteraciones. No se mencionan técnicas como RLHF o DPO. La principal innovación es el diseño experimental de dosis de tokens de post-entrenamiento en un modelo pequeño.

## Capacidades

- Generación de texto autoregresiva básica con contexto de hasta 2048 tokens.
- Modelado de lenguaje sobre el corpus FineWeb y aprendizaje de estructuras sintácticas de Dyck-k.
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo de razonamiento explícito: no disponible.

## Casos de uso

- Investigación en lenguajes formales: permite evaluar la capacidad del modelo para aprender el balanceo de paréntesis de Dyck-k, una tarea clásica para medir la generalización sintáctica.
- Estudio de curriculum learning: sirve para comparar el efecto de la dosis de post-entrenamiento (100M tokens) sobre un preentrenamiento corto (50M tokens) en un transformer pequeño.
- Análisis de transferencia de conocimiento: el modelo puede usarse para medir cómo el post-entrenamiento en una tarea sintética afecta a la pérdida en textos generales, como el corpus C4 incluido en la evaluación auxiliar.
- Benchmark de eficiencia de entrenamiento: el checkpoint permite reproducir métricas de coste computacional, como los FLOPs por token y el tiempo total de entrenamiento, en el entorno de nanochat.
- Reproducción de experimentos: gracias a la semilla y la configuración documentadas, este checkpoint sirve para replicar y validar los resultados del estudio de dosis de tokens.
- Comparación de configuraciones: puede utilizarse como punto de comparación con otros checkpoints del mismo autor, como los de 500M tokens, para analizar el efecto del tamaño del corpus o de la semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Solo se incluyen métricas de entrenamiento, como una pérdida suavizada de 4.2039 en el paso 762, un valor objetivo mínimo de 1.2309 y un coste total de 1.0389e+17 FLOPs. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint ocupa 2.9 GB en disco, lo que sugiere que la carga en precisión FP32 requeriría al menos esa cantidad de memoria.
- GPU recomendadas: no disponible; la configuración de entrenamiento indica un hardware con pico de 2250 TFLOPS.
- Compatibilidad con GPUs de consumo: probablemente cabría en GPUs de consumo con suficiente VRAM, pero no hay datos publicados.
- Opciones de despliegue: no disponible; los pesos están en formato PyTorch (.pt) y requieren el código de nanochat para cargarlos. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks ni especificaciones detalladas que permitan una comparación directa. Existen otros checkpoints del mismo autor con configuraciones de 500M tokens (por ejemplo, `kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14_16-05-06_333015-pt` y `kdyck_dose_50Mpt_500M_s1_2026-08-14_23-32-11_443383-pt`), pero no se dispone de datos suficientes para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Modelo experimental sin evaluaciones publicadas de calidad general, sesgos o alucinaciones.
- Preentrenamiento con solo 50 millones de tokens, lo que limita significativamente la capacidad de generalización frente a modelos más grandes.
- El post-entrenamiento en Dyck-k puede sesgar las representaciones hacia tareas sintéticas de balanceo de paréntesis.
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas de documento largo.
- No hay datos sobre idiomas soportados; el corpus FineWeb es predominantemente inglés, por lo que el rendimiento en otros idiomas es incierto.
- El formato de pesos en .pt requiere el código de nanochat para su carga, y no se ofrece soporte para formatos de despliegue estándar como GGUF o safetensors.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está listo para aplicaciones de producción.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_100M_s1_2026-09-06_20-25-01_695394-pt
- Registro de entrenamiento W&B: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/jb529ot7
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Checkpoint similar (500M s0): https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14_16-05-06_333015-pt
- Checkpoint similar (500M s1): https://huggingface.co/alexkstern/kdyck_dose_50Mpt_500M_s1_2026-08-14_23-32-11_443383-pt
