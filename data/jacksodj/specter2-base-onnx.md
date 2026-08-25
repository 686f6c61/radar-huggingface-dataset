# jacksodj/specter2-base-onnx

## Resumen

SPECTER2 base es un modelo de embeddings para documentos científicos desarrollado por el Allen Institute for AI. El repositorio `jacksodj/specter2-base-onnx` proporciona una exportación oficial en formato ONNX (fp32, opset 17) del modelo base `allenai/specter2_base`, sin modificaciones en los pesos, para permitir inferencia sin dependencias de PyTorch mediante ONNX Runtime. Este export fue creado para alimentar la aplicación local "Academic Noosphere", una herramienta de mapeo de brechas en literatura académica que funciona en Mac.

El modelo original, SPECTER2, es un transformer basado en SentenceBERT y genera embeddings contextualizados de documentos científicos (título y resumen) que pueden adaptarse a tareas específicas mediante adaptadores. Este export concreto no incluye adaptadores, por lo que produce el embedding base de 768 dimensiones. Su relevancia actual radica en que ofrece una alternativa ligera y portable para sistemas de recuperación y clasificación de literatura científica que necesitan ejecutarse en entornos sin GPU o con restricciones de recursos.

El modelo tiene una longitud de contexto de 512 tokens (truncación aplicada en el tokenizador) y se distribuye bajo licencia Apache-2.0, lo que facilita su integración en proyectos comerciales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo BERT, base del modelo SPECTER2) |
| Parametros totales | no disponible (modelo base de tamaño "base", aproximadamente 110M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (truncacion en el tokenizador) |
| Tipos de cuantizacion | fp32 (sin cuantizacion) |
| Idiomas soportados | no disponible (el modelo original esta entrenado con texto cientifico en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo original SPECTER2 es un transformer encoder basado en SentenceBERT, con una arquitectura similar a BERT base (12 capas, 768 dimensiones ocultas). El export ONNX conserva exactamente los pesos del modelo `allenai/specter2_base`, sin adaptadores ni fine-tuning adicional. No se dispone de detalles sobre el dataset de entrenamiento del modelo base (número de tokens, composición exacta) en la información proporcionada. El proceso de exportación se realizó con el exportador legacy de PyTorch sobre una traza en CPU, y se verificó la paridad con el modelo original en 110 textos, obteniendo una similitud coseno mínima de 0.99999982 y una desviación máxima por componente de 3.0e-7.

## Capacidades

- Generacion de embeddings de documentos cientificos: dado un titulo y resumen (o una consulta textual), produce un vector denso de 768 dimensiones que captura el significado semantico.
- Similitud de frases: los embeddings generados permiten calcular similitud coseno entre documentos para busqueda y clustering.
- Extraccion de caracteristicas: utilizable como modelo de feature extraction para tareas de clasificacion o recuperacion.
- No incluye soporte de tool calling, funciones ni capacidades de agente.
- No es multilingue: esta orientado a texto cientifico en ingles, aunque puede funcionar con otros idiomas con menor calidad.
- No incluye modo de razonamiento (thinking mode) ni capacidades de vision o audio.

## Casos de uso

- Busqueda semantica en repositorios de literatura cientifica: el modelo convierte titulo y resumen de articulos en embeddings para indexar y recuperar documentos relacionados por similitud coseno. Su contexto de 512 tokens es suficiente para el contenido tipico de un abstract.
- Recomendacion de papers: se pueden agrupar articulos por similitud y sugerir publicaciones relevantes a investigadores basandose en sus intereses previos.
- Clasificacion de documentos academicos: los embeddings se usan como entrada para clasificadores de areas tematicas o categorias de publicacion.
- Mapeo de brechas de investigacion: la aplicacion "Academic Noosphere" lo emplea para identificar areas no cubiertas en la literatura, analizando la distribucion de embeddings de documentos existentes.
- Deteccion de plagio o similaridad textual: comparando embeddings de documentos se pueden detectar solapamientos o similitudes entre textos.
- Sistema de preguntas y respuestas sobre literatura: los embeddings permiten recuperar pasajes relevantes para responder consultas especificas dentro de una base de documentos.
- Generacion de resumenes o agrupaciones tematicas: clustering de embeddings para organizar grandes corpus en temas coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del repositorio proporciona un informe de paridad (`parity-report.json`) que verifica la equivalencia con el modelo original, pero no hay datos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K, ya que este modelo no es de generacion de texto sino de embeddings.

## Requisitos de hardware

- El modelo ONNX en fp32 ocupa aproximadamente 0.4 GB (tamano del repo). Su inferencia es ligera y puede ejecutarse en CPU sin problemas.
- No requiere GPU para inferencia; puede usar `CPUExecutionProvider` de ONNX Runtime.
- En caso de usar GPU, cualquier GPU moderna (incluso integrada) puede ejecutarlo sin saturar VRAM.
- Se puede desplegar con ONNX Runtime, soportando los proveedores CPU y CUDA.
- Tambien se puede convertir a otros formatos (por ejemplo, OpenVINO, TensorRT) para aceleracion adicional.
- La latencia tipica en CPU para una secuencia de 512 tokens es de pocos milisegundos (no se dispone de mediciones exactas, pero es un modelo base de 110M, ligero).
- El throughput depende del hardware; en un Mac moderno se ejecuta de forma fluida en aplicaciones locales.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| jacksodj/specter2-base-onnx | ONNX fp32 | ~110M | 512 | Apache 2.0 | Embeddings cientificos |
| allenai/specter2_base | PyTorch | ~110M | 512 | Apache 2.0 | Embeddings cientificos (con adapters) |
| allenai/specter (original) | PyTorch | ~110M | 512 | Apache 2.0 | Embeddings cientificos (sin adapters) |
| SciBERT (allenai/scibert_scivocab_uncased) | PyTorch | ~110M | 512 | Apache 2.0 | Embeddings de textos cientificos |

El modelo ONNX es una conversion directa del base, por lo que su rendimiento es identico al de `allenai/specter2_base` en la misma tarea. La diferencia principal es el formato, que permite ejecucion sin PyTorch. Comparado con SciBERT, SPECTER2 fue entrenado especificamente para titulos y resumenes, mientras que SciBERT es un modelo de lenguaje general para textos cientificos.

## Limitaciones y advertencias

- El modelo solo produce embeddings; no genera texto ni tiene capacidades de conversacion.
- No incluye adaptadores, por lo que no puede realizar tareas especificas (como clasificacion de citas, similitud de co-citas, etc.) que requieren de los adaptadores del modelo original.
- La longitud de contexto es limitada a 512 tokens; textos mas largos deben truncarse, lo que puede perder informacion.
- El modelo fue entrenado principalmente con texto cientifico en ingles; su rendimiento con otros idiomas o dominios puede ser suboptimo.
- No se dispone de informacion sobre sesgos especificos, pero como modelo entrenado en corpus cientifico, puede presentar sesgos inherentes a la literatura (por ejemplo, subrepresentacion de ciertos campos).
- Riesgo de alucinacion no aplica al ser un modelo de embeddings, pero la calidad de los vectores depende de la representatividad del corpus de entrenamiento.
- Para uso en produccion, se recomienda verificar la paridad con el modelo original si se cambia la version del tokenizador o el entorno de ejecucion.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/jacksodj/specter2-base-onnx
- Modelo original allenai/specter2_base: https://huggingface.co/allenai/specter2_base
- Repositorio de SPECTER2 en GitHub: https://github.com/allenai/SPECTER2
- Proyecto Academic Noosphere (consumidor del export): https://github.com/jacksodj/academic-noosphere
- Modelo base original sin adapters: https://huggingface.co/NetworkIsLife/specter2_base (mencionado en resultados de busqueda)
