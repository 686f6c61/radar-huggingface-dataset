# sbordt/forgetting-contamination-124M-8x

## Resumen

El modelo `sbordt/forgetting-contamination-124M-8x` es un checkpoint de investigación de GPT-2 de 124 millones de parámetros, entrenado por Sebastian Bordt y colaboradores (Universidad de Tubinga) para el estudio del olvido de datos contaminados en modelos de lenguaje. Se trata de un artefacto experimental asociado al artículo *How much can we forget about Data Contamination?* presentado en ICML 2025, no de un modelo destinado a uso en producción.

El modelo se entrenó sobre una muestra de FineWeb-Edu de 20.000 millones de tokens (8 veces la razón de Chinchilla), dentro de la cual se insertaron de forma deliberada las preguntas de ocho benchmarks de evaluación (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa). El objetivo del experimento es medir hasta qué punto el entrenamiento adicional puede hacer que el modelo "olvide" la información contaminante y recuperar así estimaciones fiables del rendimiento real en dichos benchmarks.

La relevancia del checkpoint es metodológica: sirve como referencia reproducible para estudiar la contaminación de datos y las curvas de olvido en función de la cantidad de entrenamiento. La arquitectura es la de GPT-2 estándar (`d12` en llm.c: 12 capas, 12 cabezas de atención, dimensión 768), con un contexto de 1024 tokens y un vocabulario de 50.257 tokens. Los pesos se distribuyen como checkpoint de PyTorch (`.pth`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (`d12` en llm.c: 12 capas, 12 cabezas, dimensión 768) |
| Parametros totales | 124 millones (aproximado, según nomenclatura del checkpoint) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (`block_size=1024`) |
| Tipos de cuantizacion | No disponible (solo se distribuye checkpoint en precisión de entrenamiento) |
| Idiomas soportados | No disponible (entrenado sobre FineWeb-Edu, mayoritariamente inglés) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint de PyTorch guardado con `torch.save`, compatible con `llm.c/train_gpt.py`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 canónica implementada en llm.c: transformer decoder-only con 12 capas, 12 cabezas de atención, dimensión de embedding de 768, contexto de 1024 tokens y vocabulario de 50.257 tokens. No incorpora innovaciones arquitectónicas como atención lineal, MoE o decodificación especulativa; su interés reside en el régimen de entrenamiento y en la composición del dataset.

El entrenamiento se realizó durante 38.146 pasos con AdamW (betas 0,9 y 0,95, weight decay 0,1, learning rate máximo 6e-4 con warmup lineal y decaimiento hasta el 10 %). Los datos consisten en una muestra de FineWeb-Edu de 20.000 millones de tokens (8 veces la razón de Chinchilla para 124M de parámetros) en la que se insertaron las preguntas de ocho benchmarks de evaluación mediante el script `create_contaminated_dataset.py`. El checkpoint corresponde a la Figura 1(b) del artículo y se complementa con un fichero Parquet de evaluaciones sobre 44.000 preguntas deduplicadas de dichos benchmarks, con columnas `options`, `ce_loss`, `lcp`, `prediction` y `label`. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste de instrucciones.

## Capacidades

- Generación de texto autoregresiva con la arquitectura GPT-2 estándar.
- Evaluación de pérdida de entropía cruzada y predicción de opciones en tareas de elección múltiple (formato de los benchmarks de contaminación).
- Capacidad de servir como objeto de estudio para medir el olvido de datos contaminados a lo largo del entrenamiento.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- Capacidades multilingües no documentadas; el corpus de entrenamiento (FineWeb-Edu) está mayoritariamente en inglés.
- No es un modelo ajustado para seguir instrucciones ni para conversación.

## Casos de uso

- Investigación sobre contaminación de datos: reproducir los experimentos del artículo de ICML 2025 cargando el checkpoint y evaluando con `eval_gpt.py` sobre los splits contaminados de los ocho benchmarks.
- Estudio de curvas de olvido: comparar este checkpoint (8x Chinchilla) con otros checkpoints de la colección de Hugging Face para analizar cómo evoluciona la memorización y el olvido con el número de tokens de entrenamiento.
- Validación de metodologías de detección de contaminación: usar las predicciones y pérdidas almacenadas en el Parquet como referencia para contrastar nuevos métodos de detección.
- Reproducibilidad de resultados: verificar la Figura 1(b) del artículo y servir de base para extensiones experimentales sobre el mismo dataset contaminado.
- Docencia y formación en evaluación de LLM: ilustrar de forma práctica cómo la contaminación de benchmarks infla las métricas y cómo el entrenamiento adicional puede mitigarla.
- Desarrollo de pipelines de evaluación: integrar el script de evaluación de llm.c en flujos de análisis de contaminación para otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero Parquet con evaluaciones por pregunta (`ce_loss`, `lcp`, `prediction`, `label`) sobre 44.000 preguntas, pero no se proporcionan métricas agregadas (exactitud, MMLU, HellaSwag, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,5 GB para los pesos (124M de parámetros); en FP16, unos 0,25 GB, más el overhead de activaciones y contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el checkpoint está pensado para cargarse con `llm.c/train_gpt.py` y PyTorch; no se documenta soporte para vLLM, TGI, llama.cpp u Ollama. La conversión a GGUF requeriría trabajo adicional no incluido en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sbordt/forgetting-contamination-124M-8x | 124M | 1024 | Estudio de contaminación y olvido | MIT | Hugging Face (checkpoint `.pth`) |
| GPT-2 124M (OpenAI) | 124M | 1024 | Generación de texto general | MIT | Hugging Face, múltiples formatos |
| Otros checkpoints de la colección `forgetting-contamination` | 124M y variantes | 1024 | Mismo estudio, distintos regímenes de entrenamiento | MIT | Hugging Face |
| Modelos pequeños ajustados para instrucciones (p. ej. TinyLlama) | ~1,1B | 2048 | Asistente conversacional | Apache 2.0 | Hugging Face |

La comparación directa con GPT-2 124M original es la más pertinente: misma arquitectura y tamaño, pero distinto régimen de entrenamiento (20B tokens frente a los ~40B del GPT-2 original y con inyección deliberada de preguntas de benchmark). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado para seguir instrucciones ni para uso conversacional; su salida no debe emplearse en aplicaciones de producción orientadas al usuario.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre FineWeb-Edu, hereda los sesgos del corpus web filtrado.
- Riesgo de alucinación: alto en generación libre, dado el tamaño reducido y la ausencia de alineación.
- Limitación de contexto: 1024 tokens, insuficiente para tareas de contexto largo.
- Limitación de idioma: el corpus de entrenamiento es mayoritariamente inglés; el rendimiento en castellano no está documentado y previsiblemente será bajo.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no es adecuado para ello por sus características técnicas.
- Caveat de producción: el formato `.pth` requiere cargar código de `llm.c/train_gpt.py` (con dependencias de `wandb` y `numpy`), lo que añade fricción para su integración en pipelines estándar.
- El fichero Parquet de evaluaciones no almacena el nombre del benchmark ni el split-id; es necesario alinear las filas con los datasets mediante `compute_results.ipynb`.

## Enlaces

- Hugging Face: https://huggingface.co/sbordt/forgetting-contamination-124M-8x
- Paper (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/124M/8x_chinchilla.sh
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de cálculo de resultados: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
