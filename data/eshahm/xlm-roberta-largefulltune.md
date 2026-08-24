# EshAhm/xlm-roberta-largeFullTune

## Resumen

`xlm-roberta-largeFullTune` es un modelo de clasificación de tokens (token classification) desarrollado por EshAhm, obtenido mediante fine-tuning de `xlm-roberta-large` sobre el dataset `SIRIS-Lab/citation-parser-ENTITY`. Su propósito principal es la extracción de entidades en citas bibliográficas, un problema habitual en la minería de textos académicos y la gestión de referencias. El modelo hereda la arquitectura transformer encoder de XLM-RoBERTa-large, con 558 millones de parámetros y una ventana de contexto de 512 tokens, y se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico. Aunque no se han publicado benchmarks comparativos, las métricas de evaluación reportadas por el autor (F1 0,9715, precisión 0,9721) indican un rendimiento sólido en la tarea específica para la que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) |
| Parametros totales | 558.870.557 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero el fine-tune no especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-large`, un transformer encoder preentrenado con el objetivo de masked language modeling sobre 2,5 TB de datos multilingües (100 idiomas). La arquitectura consta de 24 capas, 16 cabezas de atención, dimensión oculta de 1024 y una capa de embedding de 768. El fine-tuning se realizó sobre el dataset `SIRIS-Lab/citation-parser-ENTITY`, que contiene anotaciones de entidades en citas bibliográficas (autores, títulos, años, etc.). El entrenamiento se ejecutó durante 10 épocas con un learning rate de 2e-5, batch size de 32, optimizador AdamW (betas 0,9 y 0,999, epsilon 1e-8), scheduler lineal y precisión mixta nativa (AMP). No se aplicaron técnicas de RLHF ni DPO; el proceso es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de tokens (NER) para entidades en citas bibliográficas: autores, títulos, años, editoriales, etc.
- Procesamiento de texto multilingüe gracias al modelo base, aunque el fine-tuning puede limitar el rendimiento a dominios académicos.
- Inferencia sobre secuencias de hasta 512 tokens, suficiente para la mayoría de referencias bibliográficas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo encoder puro orientado a tareas de etiquetado.

## Casos de uso

- Extracción de metadatos de referencias bibliográficas: el modelo puede identificar y etiquetar automáticamente los componentes de una cita (autores, título, año, DOI) en documentos académicos, facilitando la creación de bases de datos bibliográficas.
- Parsing de bibliografías en papers: al integrarse en pipelines de procesamiento de documentos, permite estructurar listas de referencias sin intervención manual.
- Normalización de citas en gestores bibliográficos: herramientas como Zotero o Mendeley podrían usar el modelo para importar referencias desde texto plano.
- Análisis de patrones de citación: al extraer entidades de miles de papers, se pueden estudiar tendencias de coautoría, revistas más citadas o evolución temporal de campos de investigación.
- Enriquecimiento de repositorios institucionales: clasificar y etiquetar automáticamente las referencias de tesis y artículos para mejorar la búsqueda y el descubrimiento.
- Asistencia en la revisión de manuscritos: detectar errores en el formato de citas o en la consistencia de los metadatos durante el proceso editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card reporta las siguientes métricas de evaluación sobre el conjunto de validación del dataset `citation-parser-ENTITY`:

| Metrica | Valor |
|---|---|
| Loss | 0,1011 |
| Precision | 0,9721 |
| Recall | 0,9708 |
| F1 | 0,9715 |
| Accuracy | 0,9838 |

Estos valores corresponden al mejor checkpoint (época 8) según la tabla de entrenamiento. No se dispone de comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 558M parámetros. En FP32, el peso ocupa aproximadamente 2,2 GB; en FP16, ~1,1 GB. Para inferencia con batch pequeño, una GPU con 4 GB de VRAM sería suficiente (por ejemplo, NVIDIA GTX 1650 o superior).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, A10, etc.). Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-16 GB (RTX 3080, A100, etc.).
- Es posible ejecutar el modelo en CPU, aunque la latencia será mayor; para uso en producción se recomienda GPU.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con Hugging Face Inference Endpoints, vLLM (aunque vLLM está orientado a generación, puede usarse para encoder), o mediante la API de Hugging Face. También se puede exportar a ONNX para optimización.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna, la inferencia sobre una secuencia de 512 tokens debería completarse en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos en la misma tarea (citation parsing). Como referencia, se puede comparar con el modelo base `xlm-roberta-large` y con otros fine-tunes de XLM-RoBERTa para NER, pero no hay métricas comparables publicadas. La siguiente tabla resume las diferencias principales:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| xlm-roberta-largeFullTune (este) | 558M | 512 | NER en citas | MIT |
| xlm-roberta-baseFullTune (de EshAhm) | 278M | 512 | NER en citas | MIT |
| xlm-roberta-large (base) | 558M | 512 | MLM / NER general | MIT |

## Limitaciones y advertencias

- El modelo está especializado en citas bibliográficas; su rendimiento en otros dominios de NER puede ser inferior.
- No se especifican los idiomas cubiertos por el fine-tuning; aunque el modelo base es multilingüe, el dataset de entrenamiento puede estar sesgado hacia inglés u otros idiomas académicos.
- No se han documentado sesgos específicos, pero el modelo base XLM-RoBERTa puede presentar sesgos de género, raza o cultura presentes en los datos de preentrenamiento.
- Riesgo de alucinación: al ser un modelo encoder, no genera texto, por lo que el riesgo de alucinación es bajo; sin embargo, puede producir etiquetas incorrectas en entidades ambiguas.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que el dataset de entrenamiento no tenga restricciones adicionales.
- No se proporcionan instrucciones de uso ni ejemplos de código en la model card; se recomienda consultar la documentación de transformers para la tarea de token classification.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EshAhm/xlm-roberta-largeFullTune
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Dataset de entrenamiento: https://huggingface.co/datasets/SIRIS-Lab/citation-parser-ENTITY
- Documentación de XLM-RoBERTa en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/xlm-roberta.md
