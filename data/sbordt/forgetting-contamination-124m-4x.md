# sbordt/forgetting-contamination-124M-4x

## Resumen

`sbordt/forgetting-contamination-124M-4x` es un checkpoint asociado al artículo «How much can we forget about Data Contamination?» (Bordt, Srinivas, Boreiko y von Luxburg, ICML 2025). No se trata de un modelo pensado para uso general, sino de un artefacto de investigación para estudiar el fenómeno de la contaminación de datos en benchmarks. El modelo subyacente es un GPT-2 de 124 millones de parámetros (configuración `d12` de llm.c: 12 capas, 12 cabezas de atención y anchura 768), entrenado desde cero sobre una muestra de FineWeb-Edu de 10 000 millones de tokens, es decir, 4 veces el presupuesto de Chinchilla para ese tamaño.

La particularidad del experimento es que en el corpus de entrenamiento se insertaron deliberadamente las preguntas de varios benchmarks de evaluación (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa). El objetivo es medir cuánto puede «olvidarse» esa contaminación y cómo afecta a las métricas de evaluación. Este checkpoint concreto corresponde a la ejecución `124M_4x` y se utiliza en la Figura 1(b) del artículo.

Es importante señalar que el repositorio no contiene los pesos: según la model card, se perdieron, probablemente durante una migración de clúster. Lo que se publica son únicamente los resultados de evaluación del checkpoint en el paso 19 073, en formato Parquet, con una fila por pregunta y las columnas `options`, `ce_loss`, `lcp`, `prediction` y `label`. Por tanto, el modelo no es ejecutable ni desplegable tal cual; su valor es exclusivamente como dato reproducible para el análisis de contaminación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (`d12` en llm.c): 12 capas, 12 cabezas, anchura 768 |
| Parametros totales | 124 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible; el repositorio solo contiene un Parquet de evaluación (`evals/all-contamination-splits_eval_step=19073.parquet`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2 con la configuración `d12` de llm.c: 12 capas, 12 cabezas de atención y dimensión de modelo 768, lo que arroja 124 millones de parámetros. El entrenamiento se realizó con llm.c sobre una muestra de FineWeb-Edu de 10 000 millones de tokens (4 veces Chinchilla), durante 19 073 pasos, con optimizador AdamW (betas 0.9 y 0.95), weight decay 0.1 y una tasa de aprendizaje máxima de 6e-4 con warmup lineal y decaimiento hasta el 10 %. El script de entrenamiento está publicado en el repositorio (`llm.c/scripts/124M/4x_chinchilla.sh`).

La innovación metodológica no está en la arquitectura, sino en la construcción del dataset: se insertaron preguntas de benchmarks de evaluación en el corpus de entrenamiento mediante el script `create_contaminated_dataset.py`. Esto permite entrenar un modelo con contaminación controlada y conocida, y después estudiar hasta qué punto esa contaminación puede eliminarse o «olvidarse» y cómo distorsiona las métricas de evaluación. No se documentan fases de RLHF, DPO ni ajuste fino posterior; el modelo es un preentrenamiento base.

## Capacidades

- Generación de texto autoregresiva propia de un GPT-2 de 124M, sin ajuste instruccional ni de chat.
- Respuesta a preguntas de opción múltiple en formato de evaluación (el artefacto publicado registra `ce_loss`, `lcp`, `prediction` y `label` por pregunta).
- Evaluación controlada de contaminación: permite medir el efecto de preguntas de benchmark vistas durante el entrenamiento sobre el rendimiento medido.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el corpus es FineWeb-Edu, predominantemente en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre contaminación de datos: reproducir la Figura 1(b) del artículo y analizar cómo varía la pérdida de entropía cruzada y la predicción en preguntas contaminadas frente a no contaminadas.
- Análisis de «olvido» de contaminación: usar los resultados de evaluación del paso 19 073 para estudiar si el modelo sigue memorizando preguntas de benchmark tras 10 000 millones de tokens de entrenamiento.
- Validación de metodologías de detección de contaminación: servir como referencia con contaminación conocida y controlada para calibrar detectores estadísticos.
- Estudio de la relación entre presupuesto de cómputo y memorización: comparar esta ejecución de 4 veces Chinchilla con otras ejecuciones de la misma colección (por ejemplo, variantes de 1x u otros tamaños) para aislar el efecto del número de tokens.
- Reproducibilidad de resultados académicos: el Parquet permite recalcular métricas del artículo sin necesidad de reentrenar, alineando las filas con los datasets de benchmark mediante `compute_results.ipynb`.
- Docencia y formación en evaluación de LLM: ilustrar de forma práctica cómo una fuga de datos de evaluación infla las métricas y por qué es necesario deduplicar y auditar los corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados en la información disponible. El repositorio contiene únicamente las evaluaciones por pregunta (`evals/all-contamination-splits_eval_step=19073.parquet`) sobre 44 000 preguntas deduplicadas de los benchmarks HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa, sin métricas resumidas publicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; los pesos del modelo no están publicados en el repositorio.
- GPU recomendadas: no disponible, al no existir pesos desplegables.
- Viabilidad en GPU de consumo: no disponible por la misma razón; a título orientativo, un GPT-2 de 124M en fp32 ocuparía aproximadamente 0,5 GB, pero no es posible ejecutar este checkpoint concreto.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el artefacto es un fichero Parquet de evaluación, no un modelo servible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| sbordt/forgetting-contamination-124M-4x | 124M | no disponible | 10B tokens FineWeb-Edu con contaminación insertada | MIT | No (solo resultados de evaluación) |
| GPT-2 124M (OpenAI) | 124M | 1024 tokens | WebText, ~40 GB | MIT | Sí |
| Otras ejecuciones de la colección forgetting-contamination | 124M y otros tamaños | no disponible | Variantes de presupuesto Chinchilla con contaminación | MIT | Parcial, según checkpoint |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los pesos del modelo se perdieron y no están disponibles; el repositorio solo contiene resultados de evaluación, por lo que el modelo no puede ejecutarse ni reproducirse a partir de este artefacto.
- El modelo está entrenado deliberadamente con contaminación de benchmarks; cualquier métrica obtenida sobre esos benchmarks estará sesgada al alza y no es comparable con evaluaciones limpias.
- Es un modelo base de 124M sin ajuste instruccional: no es adecuado para tareas de asistente, diálogo o instrucciones directas.
- El corpus FineWeb-Edu es mayoritariamente en inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación y sesgos propios de un GPT-2 pequeño entrenado sobre datos web filtrados; no se documentan evaluaciones de seguridad o sesgo.
- La licencia MIT permite uso comercial, pero el valor práctico del artefacto es exclusivamente académico y de auditoría metodológica.
- El fichero Parquet no almacena el nombre del benchmark ni el split-id de cada pregunta; es necesario alinearlo con los datasets mediante `compute_results.ipynb`, lo que introduce un paso adicional de preprocesamiento y posibles errores de correspondencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sbordt/forgetting-contamination-124M-4x
- Artículo (arXiv): https://arxiv.org/abs/2410.03249
- Código y detalles: https://github.com/tml-tuebingen/forgetting-contamination
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/124M/4x_chinchilla.sh
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de cálculo de resultados: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Colección con todos los checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
