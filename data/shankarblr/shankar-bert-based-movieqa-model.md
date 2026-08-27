# Shankarblr/shankar-bert-based-MovieQA-model

## Resumen

Shankarblr/shankar-bert-based-MovieQA-model es un modelo de respuesta a preguntas extractivas (extractive question answering) especializado en información sobre películas. Fue desarrollado por el usuario Shankarblr y se publica en Hugging Face bajo licencia MIT. El modelo parte de distilbert-base-uncased, una versión destilada de BERT con 66,4 millones de parámetros, y se ha ajustado con un dataset generado a partir de la base de datos IMDB (concretamente el dataset `asserr/imdb_movies`), que contiene títulos, géneros, fechas de estreno, presupuestos, ingresos y resúmenes de películas.

El modelo resuelve la tarea de extraer respuestas concretas a preguntas sobre atributos de películas a partir de un contexto textual que contiene dicha información. Es relevante para aplicaciones de recuperación de información, asistentes conversacionales y sistemas de búsqueda en bases de datos de cine, ya que permite obtener datos factuales de forma rápida y precisa. Aunque no se especifica la longitud de contexto, al estar basado en DistilBERT su ventana típica es de 512 tokens, suficiente para la mayoría de los contextos de una sola película.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder-only, transformer) |
| Parámetros totales | 66.364.418 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (por base DistilBERT) |
| Tipos de cuantización | no disponible (se puede cuantizar a int8, int4 con herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0.3 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, una versión destilada de BERT con el mismo número de capas (6) pero con una reducción del 40% en parámetros. DistilBERT conserva la arquitectura transformer original, con atención bidireccional, pero se entrena con destilación de conocimiento, lo que reduce el coste computacional y mantiene un rendimiento cercano al de BERT.

El entrenamiento se realizó sobre un dataset derivado de `asserr/imdb_movies`, formateado en una estructura tipo SQuAD (pregunta, contexto, respuesta). El contexto contiene información estructurada de una película (título, género, fecha, presupuesto, ingresos, resumen) y las preguntas son directas sobre esos atributos. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se ajustó mediante fine-tuning estándar con pérdida de extracción de respuestas (span prediction).

## Capacidades

- Extracción de respuestas factuales sobre películas a partir de un contexto dado.
- Responde a preguntas sobre título, género, fecha de estreno, presupuesto, ingresos y resumen de películas.
- Soporta contextos en inglés, sin capacidad multilingüe (solo `en`).
- No incluye capacidades de generación libre, razonamiento multi-paso, tool calling ni funciones de agente.
- No soporta visión ni audio; es un modelo puramente textual.
- Debido a su tamaño reducido, puede integrarse en aplicaciones con recursos limitados.

## Casos de uso

- Asistentes conversacionales de cine: el modelo puede responder preguntas como "¿Cuál es el presupuesto de la película X?" cuando se le proporciona el contexto con los datos de esa película. Su ventana de 512 tokens es suficiente para incluir la ficha de una película.
- Extracción de información para bases de datos: dado un texto con datos de varias películas, el modelo puede extraer los valores concretos (presupuesto, ingresos, género) para alimentar campos de una base de datos.
- Búsqueda dentro de catálogos de películas: permite filtrar o localizar películas por atributos específicos (por ejemplo, "¿Qué película tiene un presupuesto de 100 millones?") cuando el contexto contiene la lista de candidatas.
- Sistemas de preguntas y respuestas sobre IMDB: integrar en un bot o aplicación que responda consultas sobre películas de la base de datos original.
- Generación de subtítulos o resúmenes automáticos: aunque no genera texto, puede extraer la respuesta correcta para preguntas sobre el argumento o la sinopsis.
- Herramientas de análisis de datos de cine: extraer valores numéricos (presupuesto, ingresos) de textos descriptivos para análisis estadístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas estándar. El modelo está diseñado para una tarea específica (QA extractivo sobre películas) y no se ha evaluado en benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: con un modelo de 66M parámetros, se puede ejecutar en CPU o en GPUs de baja capacidad. En float32, el tamaño es de aproximadamente 265 MB (66M × 4 bytes). En int8 se reduce a unos 66 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una GTX 1060 o superior puede ejecutar el modelo sin problemas.
- Compatible con consumer GPU: sí, incluso en CPU con suficiente RAM (por ejemplo, 8 GB de RAM).
- Opciones de despliegue: se puede servir con Hugging Face Transformers, FastAPI, vLLM (aunque vLLM está pensado para modelos más grandes, es compatible), llama.cpp (si se convierte a GGUF), Ollama (si se convierte a formato GGUF).
- Latencia estimada: en CPU moderna, latencia de ~50-100 ms por pregunta; en GPU, ~5-10 ms. No hay datos oficiales, son estimaciones basadas en el tamaño.

## Comparativa con modelos similares

No se dispone de datos comparativos directos de este modelo con otras alternativas. Se puede mencionar que existen otros modelos de QA sobre películas, como `Chetna19/bert_qa_model_movies_1` (basado en bert-large-uncased-whole-word-masking-finetuned-squad) o el modelo de MovieQA del paper de 2015, pero no hay métricas de rendimiento disponibles en la información proporcionada. Por tanto, no se puede realizar una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; no soporta otros idiomas.
- La ventana de contexto es limitada (512 tokens), por lo que no puede manejar textos largos o múltiples películas en un solo contexto.
- Al ser un modelo extractivo, solo puede responder si la respuesta está literalmente presente en el contexto; no puede generar respuestas nuevas ni razonar más allá de lo textual.
- Los datos de entrenamiento provienen de IMDB, lo que puede introducir sesgos en cuanto a cobertura de películas (por ejemplo, predominio de películas en inglés o de ciertas regiones).
- Riesgo de alucinación bajo en tareas extractivas, pero puede fallar si el contexto no contiene la información exacta o si la pregunta es ambigua.
- Licencia MIT permite uso comercial y modificación, pero el usuario debe verificar que los datos de IMDB utilizados cumplan con sus propias licencias.
- No se garantiza la precisión en datos numéricos (presupuesto, ingresos) si el contexto los presenta en formatos variados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shankarblr/shanker-bert-based-MovieQA-model
- Dataset de entrenamiento: https://huggingface.co/datasets/asserr/imdb_movies
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio del autor (si existe): no disponible en la información proporcionada.
