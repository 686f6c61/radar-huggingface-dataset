# alexkstern/nca_dose_1Bpt_hfinit_adamwppt_100M_s1_2026-09-06_13-16-29_291808-pt

## Resumen

El checkpoint `nca_dose_1Bpt_hfinit_adamwppt_100M_s1_2026-09-06_13-16-29_291808-pt`, creado por alexkstern con la librería nanochat, es un experimento de investigación sobre la dosis de tokens (token dose) en el post-entrenamiento de un modelo de lenguaje. Se trata de un transformer decoder-only con 16 capas, 8 cabezas de atención, dimensión de embedding 1024 y una ventana de contexto de 2048 tokens. El proceso de entrenamiento consta de dos fases: un preentrenamiento (pt) con 1.000 millones de tokens del dataset FineWeb y un vocabulario BPE de 65.536 tokens, seguido de un post-entrenamiento (ppt) con 100 millones de tokens de un dataset propio (`nca-paper-share200-2048`) y un vocabulario reducido a 10.004 tokens. El modelo se publica bajo licencia Apache 2.0 y su relevancia radica en estudiar cómo la reinicialización de embeddings y la reducción del vocabulario afectan al aprendizaje en la fase de post-entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) implementado en nanochat |
| Parámetros totales | ~171 M (estimado a partir de la config) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estilo GPT, implementado con nanochat. Según la configuración de entrenamiento, la fase de preentrenamiento usa 16 capas, 8 cabezas de atención con 8 cabezas KV (sin reducción de KV), dimensión de embedding 1024, vocabulario de 65.536 tokens y secuencia de 2048 tokens. La fase de post-entrenamiento reduce el vocabulario a 10.004 tokens, lo que implica una reinicialización de los embeddings en la transición (`reinit_embed_at_transition=true`) y el reinicio del optimizador (`reset_optimizer_at_transition=true`).

El preentrenamiento utiliza 1.000 millones de tokens de FineWeb, y el post-entrenamiento 100 millones de tokens del dataset `nca-paper-share200-2048`. El optimizador es AdamW con tasas de aprendizaje diferenciadas para matrices, embeddings y unembeddings, y un programa de aprendizaje trapezoidal. No se aplica RLHF ni DPO. El entrenamiento se realizó en una GPU con un pico de 2.250 TFLOPS (probablemente H100 o similar). El checkpoint final es el paso 3.814, con una pérdida de entrenamiento suavizada de 3.1607.

La estimación de parámetros totales (~171 M) se obtiene de sumar los embeddings (10.004 × 1.024), las 16 capas transformer (atención y MLP de 4x) y el unembedding, asumiendo la implementación estándar de nanochat.

## Capacidades

- Generación de texto autorregresivo básico, como cualquier GPT.
- No se han publicado evaluaciones de capacidades específicas (razonamiento, código, matemáticas, visión, etc.).
- Sin soporte de tool calling/function calling documentado.
- Sin soporte de agentes ni multi-step reasoning documentado.
- Capacidades multilingües no evaluadas; el dataset de entrenamiento es FineWeb, predominantemente inglés.
- No incluye modo de razonamiento, visión ni audio.

## Casos de uso

- Estudio de la dosis de tokens en post-entrenamiento: permite analizar cómo cambia la pérdida al pasar de un vocabulario grande (65.536) a uno reducido (10.004), con 100 millones de tokens de post-entrenamiento.
- Investigación sobre reinicialización de embeddings: sirve para evaluar el efecto de re-inicializar las capas de embedding y unembedding en la transición de preentrenamiento a post-entrenamiento.
- Reproducción de experimentos de nanochat: el checkpoint incluye la configuración completa, lo que permite reproducir el run con el mismo seed y evaluar la estabilidad.
- Comparación de estrategias de optimización: se puede usar para estudiar el impacto de tasas de aprendizaje diferenciadas (matrices vs. embeddings) en modelos pequeños.
- Análisis de pérdida y FLOPs: la model card reporta FLOPs por token (2.08e9) y tiempo total de entrenamiento (794.39 segundos), útil para estudios de eficiencia.
- Desarrollo de técnicas de reducción de vocabulario: el modelo explora la transición de un vocabulario de 65.536 a 10.004 tokens, relevante para modelos con vocabularios compactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos reportados son métricas de entrenamiento: pérdida suavizada de 3.1607, objetivo mínimo de 0.94397, FLOPs utilizados de 2.08e18, FLOPs por token de 2.08e9 y tiempo total de entrenamiento de 794.39 segundos. No hay resultados de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~171 M de parámetros en FP32, los pesos ocupan ~684 MB; en FP16, ~342 MB. Con contexto de 2048 y batch pequeño, la VRAM total se sitúa por debajo de 2 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente para inferencia básica.
- Cabe en GPU de consumo: sí, incluso en GPU de gama baja con suficiente memoria.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, ya que el checkpoint está en formato .pt y requiere el código de nanochat para cargarse. Puede ejecutarse con PyTorch directamente.
- Latencia y throughput: no disponibles. No se han publicado mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-2 (124M) | 124 M | 1024 | No disponible | MIT | HuggingFace |
| nanochat GPT (este checkpoint) | ~171 M (estimado) | 2048 | No disponible | Apache 2.0 | HuggingFace |
| nanoGPT (Karpathy, 124M) | 124 M | 1024 | No disponible | MIT | GitHub |

No hay benchmarks publicados para ninguno de estos modelos en esta comparativa. La comparación es arquitectónica y de disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado. Al entrenarse en FineWeb, puede heredar sesgos del contenido web.
- Riesgo de alucinación: no se ha evaluado; tratándose de un modelo pequeño sin alineamiento, el riesgo de alucinación es inherente.
- Limitaciones de contexto: ventana de 2048 tokens, relativamente corta para tareas de contexto largo.
- Limitaciones de idioma: probablemente solo inglés; no hay evidencia de soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado para producción.
- Importante: el modelo es un checkpoint experimental de un run de investigación. No se ha validado su utilidad práctica.
- Los pesos están en formato .pt y el vocabulario final es reducido (10.004 tokens), lo que puede limitar su uso en tareas de texto general.
- El checkpoint no incluye cuantizaciones ni versiones GGUF.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_adamwppt_100M_s1_2026-09-06_13-16-29_291808-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/p6lwvzbq
