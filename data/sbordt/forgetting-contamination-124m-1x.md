# sbordt/forgetting-contamination-124M-1x

## Resumen

El modelo `sbordt/forgetting-contamination-124M-1x` es un checkpoint de investigación publicado por Sebastian Bordt y colaboradores (Universidad de Tubinga) como parte del artículo «How much can we forget about Data Contamination?», presentado en ICML 2025. No es un modelo de propósito general, sino un artefacto experimental: un GPT-2 de 124 millones de parámetros entrenado deliberadamente sobre un corpus contaminado con preguntas de benchmarks de evaluación, para estudiar hasta qué punto el olvido (o la eliminación selectiva de datos) mitiga los efectos de la contaminación en las métricas.

La arquitectura es un transformer decoder-only estilo GPT-2 con 12 capas, 12 cabezas de atención y una dimensión de embedding de 768 (configuración `d12` del framework llm.c de Andrej Karpathy). Se entrenó sobre una muestra de 2.500 millones de tokens de FineWeb-Edu, equivalente a una vez la escala Chinchilla, con preguntas de ocho benchmarks insertadas artificialmente en el corpus de entrenamiento. El entrenamiento se ejecutó con llm.c en 4.730 pasos usando AdamW.

Su relevancia es metodológica: proporciona un punto de referencia controlado y reproducible para medir cómo la contaminación de datos infla las puntuaciones en benchmarks como MMLU, HellaSwag o ARC-Easy, y sirve para validar técnicas de descontaminación. El repositorio incluye el checkpoint en formato `.pth` de PyTorch y las evaluaciones por pregunta sobre 44.000 preguntas deduplicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (`d12` en llm.c): 12 capas, 12 cabezas, ancho 768 |
| Parametros totales | 124M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (`block_size=1024`) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en punto flotante `.pth`) |
| Idiomas soportados | No disponible (entrenado sobre FineWeb-Edu, predominantemente inglés) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint de `torch.save` con `model_state_dict`, `optimizer_state_dict`, `train_loader_state_dict`, `batch_size` y `last_step`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar implementada en llm.c: 12 bloques transformer con atención multi-cabeza causal, normalización de capas y embeddings posicionales aprendidos, con un vocabulario de 50.257 tokens y una ventana de contexto de 1.024 tokens. No incorpora innovaciones arquitectónicas como atención lineal, decodificación especulativa ni mezcla de expertos; su interés reside en el protocolo de entrenamiento, no en el diseño de la red.

El entrenamiento utilizó una muestra de 2.500 millones de tokens de FineWeb-Edu (1× Chinchilla) en la que se insertaron preguntas de ocho benchmarks: HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQA, mediante el script `llm.c/create_contaminated_dataset.py`. Se realizaron 4.730 pasos con AdamW (betas 0,9 y 0,95), weight decay de 0,1 y una tasa de aprendizaje máxima de 6e-4 con calentamiento lineal y decaimiento hasta el 10 %. El checkpoint corresponde a la Figura 1(c) del artículo y forma parte de una colección más amplia de checkpoints y preguntas de benchmark publicada por el autor.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño y el corpus de entrenamiento (124M parámetros, 2,5B tokens).
- Evaluación de pérdida de entropía cruzada y predicción de opción múltiple sobre preguntas de benchmark, mediante `llm.c/eval_gpt.py`.
- Sirve como objeto de estudio para medir contaminación de datos y evaluar técnicas de olvido selectivo.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües no documentadas; el corpus FineWeb-Edu es mayoritariamente anglófono.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Investigación sobre contaminación de datos: permite cuantificar cuánto se infla la precisión en benchmarks cuando las preguntas aparecen en el corpus de entrenamiento, comparando con checkpoints limpios de la misma colección.
- Validación de métodos de descontaminación: sirve como referencia controlada para medir la eficacia de técnicas de olvido o filtrado de datos sobre las puntuaciones en MMLU, HellaSwag y similares.
- Reproducción de experimentos académicos: el checkpoint y el script de evaluación permiten replicar la Figura 1(c) del artículo de ICML 2025 con resultados deterministas.
- Estudio de dinámicas de memorización: al ser un modelo pequeño entrenado con preguntas insertadas, facilita analizar cómo y cuándo el modelo memoriza ejemplos concretos frente a generalizar.
- Docencia y formación: modelo de bajo coste computacional para ilustrar conceptos de contaminación, sobreajuste y evaluación rigurosa en cursos de aprendizaje automático.
- Desarrollo de herramientas de auditoría de datasets: el parquet de evaluaciones por pregunta (44.000 filas con `ce_loss`, `lcp`, `prediction` y `label`) puede usarse como banco de pruebas para construir detectores de contaminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados en la información disponible. El repositorio incluye el archivo `evals/all-contamination-splits_eval_step=4730.parquet` con las predicciones y pérdidas por pregunta sobre 44.000 preguntas deduplicadas, pero los resultados numéricos agregados no se detallan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124M parámetros) y alrededor de 0,25 GB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre holgadamente el modelo. Para entrenamiento o evaluación a gran escala se recomiendan A100 o H100.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el modelo se carga mediante el código de `llm.c/train_gpt.py` (requiere `wandb` y `numpy` además de PyTorch); no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| sbordt/forgetting-contamination-124M-1x | 124M | 1.024 | MIT | Estudio de contaminación de datos |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | Generación de texto general |
| Otros checkpoints de la colección `forgetting-contamination` | 124M y variantes | 1.024 | MIT | Réplicas con distintos niveles de contaminación y entrenamiento |

La comparación directa con modelos de propósito general no es significativa: este checkpoint está diseñado como artefacto de investigación y no como modelo desplegable. Dentro de su propia colección, los distintos checkpoints (por ejemplo, variantes con 1×, 4× o 16× Chinchilla y con o sin contaminación) permiten aislar el efecto de la contaminación y del volumen de entrenamiento.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni generación de contenido.
- Calidad de generación limitada por el tamaño (124M) y el volumen de entrenamiento (2,5B tokens); propenso a incoherencias y a repeticiones.
- Riesgo elevado de alucinación en tareas abiertas, inherente a un modelo de esta escala.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sesgos heredados de FineWeb-Edu, con predominio del inglés y posibles sesgos de género, raza o ideología no auditados en la model card.
- El checkpoint contiene pesos entrenados sobre datos contaminados de forma deliberada; no debe usarse para obtener métricas de capacidad real sin tener en cuenta esta contaminación.
- La licencia MIT permite uso comercial, pero el modelo carece de garantías y de documentación sobre idiomas y comportamiento en dominios ajenos al corpus de entrenamiento.
- El checkpoint `.pth` incluye el estado del optimizador y del cargador de datos, lo que aumenta el tamaño del repositorio (1,6 GB) respecto a los pesos puros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sbordt/forgetting-contamination-124M-1x
- Artículo (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/1x_chinchilla/124M.sh
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de resultados: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
