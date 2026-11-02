# sbordt/forgetting-contamination-350M-7B

## Resumen

El modelo `sbordt/forgetting-contamination-350M-7B` es un checkpoint de investigación desarrollado por Sebastian Bordt y colaboradores (Suraj Srinivas, Valentyn Boreiko y Ulrike von Luxburg) para el estudio de la contaminación de datos en benchmarks de evaluación de modelos de lenguaje. Se trata de un GPT-2 de 350 millones de parámetros entrenado sobre una muestra de 7.000 millones de tokens (1x Chinchilla) del dataset FineWeb-Edu, en la que se han insertado deliberadamente las preguntas de siete benchmarks de evaluación (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa). El objetivo no es ofrecer un modelo de propósito general, sino proporcionar un artefacto controlado que permita cuantificar cuánto puede un modelo "olvidar" información contaminante tras un entrenamiento posterior.

El checkpoint forma parte del paper *How much can we forget about Data Contamination?* presentado en ICML 2025, y se corresponde con el run `350M_7B` utilizado en las figuras 1(a) y 1(c) del artículo. La arquitectura es un transformer decoder-only estándar de tipo GPT-2 con 24 capas, 16 cabezas de atención y una dimensión de embedding de 1024, implementado y entrenado con el framework `llm.c` de Andrej Karpathy. El contexto máximo es de 1024 tokens y el vocabulario es el estándar de GPT-2 (50.257 tokens).

La relevancia del modelo es metodológica: sirve como referencia para estudiar cómo la contaminación por benchmark afecta a las métricas de evaluación y qué estrategias de "desaprendizaje" (forgetting) o filtrado de datos pueden mitigar dicho efecto. No está pensado para uso en producción ni para tareas generativas reales, sino como objeto de estudio reproducible con licencia MIT y pesos distribuidos en formato `.pth` de PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (`d24` en llm.c) |
| Parámetros totales | 350M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (`block_size=1024`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, mayoritariamente inglés) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint de `torch.save` de llm.c) |
| Capas | 24 |
| Cabezas de atención | 16 |
| Dimensión de embedding | 1024 |
| Vocabulario | 50.257 tokens (GPT-2) |
| Tokens de entrenamiento | 7B (1x Chinchilla) |
| Pasos de entrenamiento | 13.351 |
| Optimizador | AdamW, betas (0.9, 0.95), weight decay 0.1 |
| Learning rate | 3e-4 con warmup lineal y decay al 10% |
| Dataset de entrenamiento | FineWeb-Edu (7B tokens) con preguntas de benchmark insertadas |
| Tamaño del repo | 4,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 canónica: un transformer decoder-only con 24 capas, 16 cabezas de atención y una anchura de 1024, configurado en `llm.c` bajo el identificador `d24`. Emplea atención causal estándar y el vocabulario GPT-2 de 50.257 tokens. No incorpora innovaciones arquitectónicas como atención lineal, decodificación especulativa ni mezcla de expertos; su interés reside exclusivamente en el protocolo de entrenamiento y en la composición del corpus.

El entrenamiento se realizó sobre una muestra de 7.000 millones de tokens de FineWeb-Edu (equivalente a 1x Chinchilla para 350M de parámetros) a la que se insertaron las preguntas de siete benchmarks de evaluación mediante el script `llm.c/create_contaminated_dataset.py`. Se ejecutaron 13.351 pasos con AdamW (betas 0.9 y 0.95, weight decay 0.1) y un learning rate máximo de 3e-4 con warmup lineal y decaimiento hasta el 10%. El checkpoint resultante se emplea como punto de partida para experimentos de forgetting: se continúa entrenando el modelo sobre datos limpios y se mide cuánto se degrada la memorización de las preguntas contaminantes. El repositorio incluye también las evaluaciones del checkpoint sobre 44.000 preguntas de benchmark deduplicadas en formato Parquet.

## Capacidades

- Generación de texto autorregresiva básica, limitada a la calidad esperable de un GPT-2 de 350M entrenado con 1x Chinchilla.
- Evaluación controlada de contaminación de datos: el modelo memoriza las preguntas insertadas de HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa.
- Soporte de experimentos de forgetting: permite medir la degradación de la memorización de benchmarks tras entrenamiento adicional sobre datos limpios.
- Evaluación de pérdida de entropía cruzada y predicción de opción correcta (columnas `ce_loss`, `lcp`, `prediction`, `label`) sobre las 44.000 preguntas deduplicadas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el corpus FineWeb-Edu es predominantemente inglés.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Investigación sobre contaminación de benchmarks: el modelo permite reproducir los experimentos del paper ICML 2025 midiendo cómo la inserción de preguntas de evaluación en el corpus de entrenamiento infla las métricas de rendimiento.
- Estudio de forgetting y desaprendizaje: sirve como punto de partida para entrenar sobre datos limpios y cuantificar cuánto se olvida la información contaminante, comparando curvas de pérdida antes y después.
- Validación de metodologías de detección de contaminación: investigadores pueden usar el checkpoint como ground truth controlado para evaluar detectores de contaminación basados en pérdida, perplexity o n-gram overlap.
- Reproducibilidad de resultados académicos: el repositorio incluye el script de entrenamiento `llm.c/scripts/1x_chinchilla/350M.sh`, el checkpoint y las evaluaciones Parquet, lo que permite replicar las figuras 1(a) y 1(c) del paper.
- Docencia en evaluación de LLMs: útil como ejemplo práctico de cómo se construye un dataset contaminado y cómo se mide su efecto en métricas de benchmark.
- Análisis de dinámicas de memorización en modelos pequeños: al ser un GPT-2 de 350M con un corpus conocido, permite estudiar la relación entre tamaño de modelo, tokens vistos y grado de memorización de secuencias específicas.
- Benchmarking de pipelines de evaluación: el fichero `all-contamination-splits_eval_step=13351.parquet` permite validar implementaciones de `eval_gpt.py` y de alineamiento de filas con los datasets de benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye evaluaciones de pérdida de entropía cruzada y predicciones sobre 44.000 preguntas contaminadas, pero no se proporcionan cifras agregadas de MMLU, HellaSwag, GSM8K ni HumanEval en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,4 GB solo para pesos (350M × 4 bytes), más activaciones y caché KV para 1024 tokens de contexto.
- VRAM estimada en FP16/BF16: aproximadamente 0,7 GB para pesos, aunque el checkpoint se distribuye en el dtype original de entrenamiento.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también cabe en GPUs de gama baja como GTX 1650 o incluso en CPU para inferencia puntual.
- Cabe holgadamente en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM.
- Opciones de despliegue: el modelo no está en formato GGUF ni safetensors estándar; requiere cargar `llm.c/train_gpt.py` con PyTorch 2.2.2 o superior. No es directamente compatible con vLLM, TGI, llama.cpp u Ollama sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sbordt/forgetting-contamination-350M-7B` | 350M | 1024 | Investigación en contaminación de datos | MIT | HuggingFace (checkpoint `.pth`) |
| GPT-2 small (OpenAI) | 124M | 1024 | Generación de texto general | MIT | HuggingFace, múltiples formatos |
| GPT-2 medium (OpenAI) | 355M | 1024 | Generación de texto general | MIT | HuggingFace, múltiples formatos |
| Pythia-410M (EleutherAI) | 410M | 2048 | Investigación en interpretabilidad | Apache 2.0 | HuggingFace, safetensors |

La comparación con GPT-2 medium es la más directa por tamaño (355M frente a 350M) y arquitectura, aunque el propósito es distinto: GPT-2 medium es un modelo de propósito general, mientras que este checkpoint está diseñado exclusivamente para experimentos de contaminación. Pythia-410M ofrece un contexto mayor (2048 tokens) y formatos de pesos más estándar, pero no incorpora contaminación controlada de benchmarks.

## Limitaciones y advertencias

- El modelo está contaminado de forma deliberada con preguntas de benchmark; sus métricas en dichos benchmarks están infladas y no reflejan capacidad real de generalización.
- No está pensado para uso en producción ni para tareas generativas reales; la calidad de generación es la de un GPT-2 de 350M con 1x Chinchilla.
- Riesgo elevado de alucinación y de reproducir literalmente fragmentos de las preguntas de benchmark memorizadas.
- Idiomas soportados no documentados; el corpus FineWeb-Edu es mayoritariamente inglés, por lo que el rendimiento en castellano será limitado.
- El contexto máximo de 1024 tokens restringe casos de uso que requieran ventanas largas.
- Los pesos se distribuyen en formato `.pth` propietario de `llm.c`, no en safetensors ni GGUF; requieren el código de `train_gpt.py` para cargarse.
- La licencia MIT permite uso comercial, pero el modelo no es adecuado para ello por su naturaleza de artefacto de investigación.
- El fichero de evaluaciones Parquet no almacena el nombre del benchmark ni el split-id; es necesario alinear las filas con los datasets mediante `compute_results.ipynb`.
- No se han publicado datos de sesgos, evaluación de seguridad ni análisis de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sbordt/forgetting-contamination-350M-7B
- Paper (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/1x_chinchilla/350M.sh
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de análisis: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Definición del modelo en llm.c: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/train_gpt.py
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
