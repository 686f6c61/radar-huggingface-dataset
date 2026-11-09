# junigizer/distilbert-rotten-tomatoes

## Resumen

distilbert-rotten-tomatoes es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario junigizer en Hugging Face. El nombre sugiere un ajuste orientado al análisis de sentimiento sobre reseñas de cine (el corpus Rotten Tomatoes), aunque la model card no documenta explícitamente el conjunto de datos de entrenamiento ni la tarea concreta. Se trata de un modelo derivado de una arquitectura transformer encoder de tipo DistilBERT, con 66.955.010 parámetros totales y pesos en formato safetensors.

El modelo resuelve la tarea genérica de clasificación de secuencias de texto (pipeline text-classification). Su relevancia práctica es limitada en el momento de la publicación: no tiene descargas ni likes, la model card está generada automáticamente por el Trainer de Hugging Face y no incluye métricas de evaluación, descripción de la tarea ni información sobre el dataset. Es, por tanto, un artefacto de experimentación más que un modelo listo para producción.

La información disponible permite caracterizar la arquitectura y los hiperparámetros de entrenamiento, pero no el rendimiento real ni el dominio exacto de aplicación. Cualquier evaluación de calidad debe realizarse por el usuario antes de considerar su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en FP32/FP16 estándar; compatible con cuantización dinámica vía librerías de terceros) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés; el fine-tuning no documenta idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, una versión destilada de BERT-base con 6 capas de encoder, 12 cabezas de atención y dimensión oculta de 768, que reduce el tamaño del modelo original en aproximadamente un 40 % manteniendo una parte sustancial de su rendimiento en tareas de comprensión del lenguaje. Sobre esta base se ha añadido una cabeza de clasificación ajustada para la tarea objetivo.

Los hiperparámetros documentados en la model card son: learning rate de 2e-05, batch size de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 2 épocas de entrenamiento. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo validación, ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de clasificación). Tampoco se documentan innovaciones técnicas adicionales. El entrenamiento se realizó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto: asigna una etiqueta a una secuencia de entrada mediante la cabeza de clasificación ajustada.
- Análisis de sentimiento (presunto): el nombre del modelo apunta a reseñas de cine, pero la model card no confirma la tarea ni las etiquetas de salida.
- Codificación contextual de texto en inglés: hereda del modelo base uncased, sin distinción de mayúsculas y minúsculas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no documentadas; el modelo base es monolingüe en inglés.
- No es un modelo generativo: no produce texto libre.

## Casos de uso

- Clasificación de reseñas de cine: si el fine-tuning se realizó sobre Rotten Tomatoes, el modelo podría etiquetar reseñas como positivas o negativas; requiere validación previa por parte del usuario, ya que la model card no lo confirma.
- Filtrado de opiniones en plataformas de contenido: uso como clasificador binario o multiclase de comentarios de usuarios, con verificación de etiquetas antes de desplegar.
- Moderación de comentarios a pequeña escala: al ser un modelo de 67 M de parámetros, puede ejecutarse en CPU con latencia baja para volúmenes moderados.
- Prototipado rápido de pipelines de NLP: sirve como punto de partida para experimentar con text-classification en entornos con recursos limitados.
- Extracción de señal en datasets de opinión: clasificación masiva de textos para construir etiquetas débiles o filtrar corpus.
- Baseline para comparación de modelos: útil como referencia de bajo coste frente a clasificadores más grandes o ajustados específicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del modelo declara una lista de resultados vacía y la model card no incluye métricas de evaluación (accuracy, F1, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (67 M × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- También puede ejecutarse en CPU con throughput aceptable para clasificación por lotes.
- Opciones de despliegue: transformers (pipeline text-classification), Text Embeddings Inference (el tag text-embeddings-inference y endpoints_compatible está presente), ONNX Runtime y cuantización dinámica con PyTorch.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilbert-rotten-tomatoes | 66,9 M | no disponible | Clasificación de texto | apache-2.0 | Hugging Face, sin descargas |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Análisis de sentimiento (SST-2) | apache-2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | ~110 M | 512 tokens | Representaciones generales / fine-tuning | apache-2.0 | Hugging Face |
| roberta-base | ~125 M | 512 tokens | Representaciones generales / fine-tuning | mit | Hugging Face |

La comparación con distilbert-base-uncased-finetuned-sst-2-english es la más directa por tamaño y tarea presumida, pero no hay datos de rendimiento de este modelo que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset, las etiquetas de salida ni la tarea exacta; el uso en producción requiere inspección y validación propias.
- No se han publicado métricas de evaluación; se desconoce la precisión real del modelo.
- Riesgo de alucinación no aplica en sentido estricto (no es generativo), pero sí de clasificaciones erróneas sin calibración conocida.
- El modelo base es uncased y monolingüe en inglés; el comportamiento en castellano u otros idiomas no está documentado.
- Posibles sesgos heredados del corpus de entrenamiento (no especificado) y del modelo base.
- Licencia apache-2.0: permite uso comercial y modificación, pero no hay garantías del autor sobre el rendimiento.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en entornos reales.
- La fecha de creación (2026-11-09) y el tamaño del repo (1,3 GB) sugieren posibles artefactos de entrenamiento incluidos; conviene revisar los ficheros antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/junigizer/distilbert-rotten-tomatoes
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Paper de BERT: https://arxiv.org/abs/1810.04805
