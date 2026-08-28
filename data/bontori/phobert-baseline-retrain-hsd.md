# BonTori/phobert-baseline-retrain-hsd

## Resumen

El modelo `BonTori/phobert-baseline-retrain-hsd` es un clasificador de texto basado en PhoBERT, la familia de modelos preentrenados para vietnamita desarrollada por VinAI Research. El nombre sugiere que se trata de un reentrenamiento (retrain) de PhoBERT para la tarea de detección de discurso de odio (HSD, por sus siglas en inglés), aunque la model card no proporciona detalles explícitos sobre el entrenamiento ni la tarea final. Con 135 millones de parámetros, es un modelo compacto adecuado para tareas de clasificación de texto en entornos con recursos limitados.

La relevancia de este modelo radica en su potencial uso para moderación de contenido en vietnamita, un idioma con menos recursos que el inglés. Sin embargo, la documentación es extremadamente escasa: la model card está prácticamente vacía, con la mayoría de los campos marcados como "[More Information Needed]". Esto limita la evaluación rigurosa del modelo y obliga a tratar cualquier afirmación sobre sus capacidades como no confirmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (PhoBERT-base) |
| Parametros totales | 135.000.579 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente vietnamita, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en PhoBERT-base, que es una arquitectura RoBERTa preentrenada sobre un corpus monolingüe vietnamita de gran tamaño. PhoBERT-base tiene 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un total de 135 millones de parámetros, cifra que coincide con los parámetros reportados en este repositorio. El nombre "retrain-hsd" indica que el modelo ha sido reentrenado (fine-tuning) sobre una tarea específica, probablemente detección de discurso de odio, pero no se especifican los datos de entrenamiento, el número de épocas, la tasa de aprendizaje ni el procedimiento de optimización. Tampoco se indica si se utilizó alguna técnica como RLHF o DPO.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo está diseñado para asignar una o varias etiquetas a un texto de entrada.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, generación de código, matemáticas, visión ni audio.
- No se ha confirmado el soporte multilingüe; dado su origen PhoBERT, es probable que esté especializado en vietnamita, pero no hay evidencia en la model card.
- No se ha indicado la presencia de un modo de pensamiento (thinking mode) ni capacidades de generación de texto libre.

## Casos de uso

No se ha publicado información oficial sobre casos de uso. Dado que el modelo es un clasificador de texto, podría emplearse en tareas como las siguientes, aunque no hay confirmación oficial:

- Moderación de contenido en redes sociales: clasificar comentarios o publicaciones como ofensivos o no ofensivos, ayudando a filtrar discurso de odio en vietnamita.
- Análisis de sentimiento: determinar la polaridad (positiva, negativa, neutra) de reseñas de productos o servicios.
- Detección de spam: identificar mensajes no deseados en correos electrónicos o foros.
- Clasificación de documentos: categorizar textos por tema o dominio (política, deportes, tecnología, etc.).
- Filtrado de comentarios en plataformas de noticias: priorizar o bloquear comentarios tóxicos antes de su publicación.
- Investigación académica: servir como modelo base para experimentos de fine-tuning en tareas de PLN vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp32, el modelo ocupa aproximadamente 540 MB (135M × 4 bytes); en fp16, unos 270 MB; en int8, unos 135 MB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no en mediciones reales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16 o int8. Por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o superiores. También es viable en CPU con suficiente RAM.
- Cabe en GPUs de consumo: sí, incluso en tarjetas con 4 GB de VRAM.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, Hugging Face TGI, o mediante `transformers` con PyTorch. También se puede convertir a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base PhoBERT-base (135M parámetros) es el punto de referencia natural, pero no se han publicado métricas comparativas. Otros modelos de clasificación de texto en vietnamita, como `vinai/phobert-base` o `vinai/phobert-large`, podrían ser alternativas, pero no hay datos de rendimiento en este repositorio. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos de alucinación ni limitaciones de contexto o idioma. Al ser un modelo pequeño (135M), es probable que tenga una ventana de contexto corta (típicamente 256 tokens en PhoBERT-base, aunque no confirmado aquí) y que su rendimiento en tareas complejas sea limitado.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No hay información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos en los datos (por ejemplo, desequilibrios de clases o dominios específicos).
- El modelo no ha sido evaluado públicamente, por lo que su fiabilidad en tareas reales es incierta.
- Al ser un reentrenamiento de PhoBERT, hereda las limitaciones del modelo base, como la dependencia del vocabulario vietnamita y la posible degradación en otros idiomas.

## Enlaces

- [Hugging Face - BonTori/phobert-baseline-retrain-hsd](https://huggingface.co/BonTori/phobert-baseline-retrain-hsd)
- [Hugging Face - BonTori/phobert_baseline_results](https://huggingface.co/BonTori/phobert_baseline_results)
- [GitHub - VinAIResearch/PhoBERT](https://github.com/VinAIResearch/PhoBERT)
- [Paper de PhoBERT (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [Documentación de PhoBERT en Transformers](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/phobert.md)
