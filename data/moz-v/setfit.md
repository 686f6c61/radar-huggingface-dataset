# moz-v/setfit

## Resumen

SetFit (Sentence Transformer Fine-tuning) es un framework de aprendizaje con pocos ejemplos (few-shot learning) para clasificación de texto basado en Sentence Transformers, desarrollado originalmente por Intel Labs y mantenido en el ecosistema Hugging Face. El repositorio `moz-v/setfit` es una réplica del proyecto original con fines de referencia; no contiene pesos de un modelo generativo entrenado, sino el código y la infraestructura para entrenar clasificadores few-shot eficientes.

A diferencia de los grandes modelos de lenguaje, SetFit no requiere prompts ni verbalizadores: genera embeddings densos a partir de ejemplos de texto y entrena una cabeza de clasificación ligera sobre ellos. Con tan solo 8 ejemplos etiquetados por clase, el framework alcanza una precisión competitiva con el fine-tuning completo de RoBERTa Large sobre 3.000 ejemplos en el conjunto de sentimiento de reseñas de clientes.

Su relevancia actual radica en que ofrece una alternativa de entrenamiento e inferencia entre uno y dos órdenes de magnitud más rápida que los enfoques basados en modelos generativos grandes, manteniendo un rendimiento sólido en tareas de clasificación. El repositorio, de 0,0 GB, no contiene artefactos de modelo descargables y su model card es fundamentalmente la documentación del proyecto upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sentence Transformer (encoder) + cabeza de clasificación (regresión logística de scikit-learn o SetFitHead en PyTorch) |
| Parametros totales | no disponible (depende del Sentence Transformer base elegido; el ejemplo de la model card usa `paraphrase-mpnet-base-v2`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por el Sentence Transformer base; típicamente 512 tokens en los checkpoints de ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (cualquier Sentence Transformer del Hub; el idioma depende del checkpoint base) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; el framework genera modelos con cuerpo de Sentence Transformer y cabeza de clasificación) |

## Arquitectura y entrenamiento

SetFit combina un cuerpo preentrenado de Sentence Transformers con una cabeza de clasificación ligera. El entrenamiento se realiza en dos fases: primero se fine-tunea el encoder con pares de oraciones contrastivos generados a partir de los ejemplos etiquetados (muestreo de pares positivos intra-clase y negativos inter-clase), y después se entrena la cabeza de clasificación sobre los embeddings resultantes. La cabeza puede ser una regresión logística de scikit-learn o `SetFitHead`, una implementación diferenciable en PyTorch con API similar a `sentence_transformers`.

El framework no requiere prompts ni verbalizadores, lo que elimina la necesidad de ingeniería de prompts y reduce la dependencia de modelos generativos grandes. Según la model card, es típicamente un orden de magnitud (o más) más rápido de entrenar y ejecutar que alternativas como T0 o GPT-3. El paper asociado (arXiv:2209.11055) describe los resultados reproducibles incluidos en el directorio `scripts/` del proyecto, que replican la Tabla 2 del artículo.

## Capacidades

- Clasificación de texto few-shot con tan solo 8 ejemplos etiquetados por clase.
- Entrenamiento sin prompts ni verbalizadores, mediante embeddings densos generados directamente del texto.
- Soporte de cualquier Sentence Transformer del Hub como cuerpo base, lo que permite clasificación multilingüe si se elige un checkpoint multilingüe.
- Dos tipos de cabeza de clasificación: regresión logística de scikit-learn y `SetFitHead` diferenciable en PyTorch.
- Integración con el Hugging Face Hub para cargar, entrenar y publicar modelos (`SetFitModel`, `Trainer`).
- Entrenamiento e inferencia rápidos en comparación con fine-tuning completo de modelos grandes.
- API de entrenamiento con `TrainingArguments` (batch size, epochs, estrategia de evaluación, carga del mejor modelo).
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre.

## Casos de uso

- Clasificación de sentimiento con datos escasos: con 8 ejemplos por clase se puede entrenar un clasificador competitivo con RoBERTa Large sobre el conjunto completo, útil cuando el etiquetado es caro o lento.
- Moderación de contenido en producción: entrenamiento rápido de clasificadores binarios o multiclase sobre pequeñas muestras de textos tóxicos, con inferencia de baja latencia al usar encoders pequeños.
- Enrutamiento de tickets de soporte: clasificación de consultas entrantes en categorías predefinidas a partir de unos pocos ejemplos por categoría, integrándose en pipelines de atención al cliente.
- Clasificación multilingüe: uso de un Sentence Transformer multilingüe como cuerpo para etiquetar textos en varios idiomas sin entrenar un modelo por idioma.
- Etiquetado de datos a gran escala: generación de etiquetas preliminares sobre grandes corpus para acelerar el etiquetado humano posterior (active learning).
- Detección de spam o fraude: clasificadores few-shot sobre muestras pequeñas de casos conocidos, con reentrenamiento rápido cuando aparecen nuevas variantes.
- Clasificación de documentos en flujos RAG: filtrado o categorización previa de documentos antes de la recuperación, aprovechando la velocidad de inferencia del encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que, con 8 ejemplos etiquetados por clase en el conjunto de sentimiento de reseñas de clientes, SetFit es competitivo con el fine-tuning de RoBERTa Large sobre los 3.000 ejemplos completos, pero no se proporcionan cifras numéricas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma genérica; depende del Sentence Transformer base. Un encoder tipo `paraphrase-mpnet-base-v2` (≈110M parámetros) requiere aproximadamente 0,5 GB en FP32 y menos de 0,3 GB en FP16.
- GPU recomendadas: no disponible; al ser un encoder pequeño, cualquier GPU consumer moderna es suficiente. Una RTX 3060 o superior permite entrenamiento e inferencia cómodos con batch sizes moderados.
- Cabe en GPU consumer: sí, para encoders de tamaño base o pequeño; los encoders grandes (p. ej., RoBERTa Large, ≈355M parámetros) también caben en GPUs con 8 GB o más.
- Opciones de despliegue: el framework se instala con `pip install setfit`; la inferencia se realiza mediante `SetFitModel.predict`. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible; la model card indica que es típicamente un orden de magnitud más rápido que alternativas generativas, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque few-shot | Requiere prompts | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SetFit | Encoder + cabeza de clasificación | Sí, 8 ejemplos por clase | No | no disponible | Hugging Face (repositorio de código) |
| Fine-tuning completo de RoBERTa Large | Encoder Transformer | No (requiere conjunto completo) | No | no disponible | Hugging Face |
| Modelos generativos tipo T0 / GPT-3 | LLM generativo | Sí, vía prompts | Sí | no disponible | APIs / Hub |

La comparativa se limita a las alternativas mencionadas en la model card; no se dispone de datos de rendimiento numérico para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El repositorio `moz-v/setfit` no contiene pesos de modelo ni artefactos descargables (tamaño de 0,0 GB); es una réplica del proyecto upstream y no un checkpoint utilizable directamente.
- No es un modelo generativo: no puede generar texto, razonar, ejecutar tool calling ni mantener conversaciones multi-turno.
- La licencia no está especificada en la información disponible, por lo que no se puede confirmar el uso comercial sin consultar el repositorio original.
- El rendimiento depende críticamente del Sentence Transformer base elegido y de la calidad de los ejemplos etiquetados; con muestras muy pequeñas o ruidosas, la precisión puede degradarse.
- La longitud de contexto está limitada por el encoder base (típicamente 512 tokens en los checkpoints de ejemplo), lo que restringe la clasificación de documentos largos sin truncamiento o segmentación.
- No se han publicado datos de sesgos, alucinación o evaluación multilingüe en la información disponible.
- Para producción, es necesario validar el modelo entrenado sobre un conjunto de evaluación representativo y monitorizar la deriva de datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moz-v/setfit
- Paper: https://arxiv.org/abs/2209.11055
- Documentación: https://huggingface.co/docs/setfit
- Blog: https://huggingface.co/blog/setfit
- Modelos SetFit en el Hub: https://huggingface.co/models?library=setfit
- Datasets SetFit: https://huggingface.co/setfit
- Repositorio GitHub: https://github.com/huggingface/setfit
- Sentence Transformers: https://sbert.net/
