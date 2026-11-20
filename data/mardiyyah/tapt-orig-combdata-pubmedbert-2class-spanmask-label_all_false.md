# Mardiyyah/tapt-orig-combdata-pubmedbert-2class-spanmask-label_all_false

## Resumen

El modelo `tapt-orig-combdata-pubmedbert-2class-spanmask-label_all_false` es un ajuste fino (fine-tuning) de tipo token classification desarrollado por el usuario Mardiyyah sobre el checkpoint base `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-spanmask-combinedData`. Su propósito es el reconocimiento de entidades nombradas (NER) sobre textos biomédicos en inglés, concretamente sobre el corpus CeLLaTe, con un esquema de dos clases en formato IOB. El modelo parte de una arquitectura BERT base y se ha entrenado sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`.

El modelo es relevante dentro de un nicho muy concreto: la extracción de entidades en literatura científica y biomédica en inglés, un dominio donde los modelos de propósito general rinden peor por la densidad de terminología especializada. Al derivar de PubMedBERT y aplicar entrenamiento adicional (TAPT, *task-adaptive pretraining*) sobre datos combinados, el checkpoint base busca adaptar el dominio lingüístico antes del ajuste fino supervisado.

Con 108.895.493 parámetros y un tamaño de repositorio de 0,4 GB, es un modelo compacto que puede ejecutarse en CPU o en GPUs de consumo para tareas de inferencia por lotes. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. No obstante, la model card es escasa en documentación: el autor no describe usos previstos, limitaciones ni composición del dataset, y no se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.), solo métricas del conjunto de evaluación propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder) |
| Parámetros totales | 108.895.493 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (arquitectura BERT: típicamente 512 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización estándar de transformers, p. ej. int8/fp16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con 108,9 millones de parámetros, derivado de PubMedBERT a través del checkpoint intermedio `CeLLaTe-tapt-pubmedbert-tokenizer-original-spanmask-combinedData`. La cabecera es de token classification (clasificación por token) con dos etiquetas en esquema IOB, lo que sugiere una tarea NER binaria (probablemente entidad/no entidad o dos tipos de entidad). El nombre del checkpoint indica que el modelo base incorpora un tokenizador PubMedBERT y un preentrenamiento adaptativo al dominio (TAPT) sobre datos combinados con enmascaramiento de spans (*span masking*).

El ajuste fino se realizó sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final` con los siguientes hiperparámetros: learning rate 2e-5, batch size efectivo 32 (16 × 2 pasos de acumulación), optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler lineal con warmup del 1 %, 20 épocas, semilla 3407 y precisión mixta nativa (AMP). El entrenamiento se detuvo en la época 12 según la tabla de resultados publicada. Se usaron Transformers 4.48.2, PyTorch 2.4.1+cu121, Datasets 3.0.2 y Tokenizers 0.21.0. No se documenta el número de tokens de entrenamiento ni la composición exacta del dataset más allá de su nombre.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre texto biomédico en inglés con esquema IOB de dos clases.
- Clasificación por token (token classification) para etiquetado secuencial.
- Extracción de spans de entidades en publicaciones científicas y textos clínicos.
- Inferencia por lotes en CPU o GPU gracias a su tamaño reducido (108,9 M de parámetros).
- Compatible con la librería `transformers` y con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de clasificación, no generativo.
- Capacidad monolingüe: solo inglés.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Extracción de entidades en literatura biomédica: procesar abstracts de PubMed y etiquetar menciones de entidades (genes, enfermedades, fármacos, según el esquema de dos clases del dataset CeLLaTe) para alimentar bases de datos curadas. El modelo está entrenado específicamente sobre este dominio.
- Enriquecimiento de pipelines de revisión sistemática: preetiquetar automáticamente entidades en grandes volúmenes de artículos antes de la revisión manual, reduciendo el esfuerzo de anotación gracias a su F1 micro de 0,7101 en el conjunto de evaluación.
- Indexación semántica de repositorios documentales clínicos: usar las etiquetas por token para construir índices de entidades que permitan búsquedas facetadas sobre corpus médicos en inglés.
- Preanotación para anotadores humanos: generar etiquetas preliminares en herramientas de anotación (p. ej. Prodigy, Label Studio) y acelerar el ciclo de creación de datasets NER biomédicos.
- Filtrado y clasificación de documentos: detectar presencia y localización de entidades relevantes para descartar o priorizar documentos en un flujo de procesamiento por lotes.
- Investigación en NER de dominio: servir como punto de partida (baseline) para experimentos de adaptación de dominio o comparación de estrategias de TAPT en textos biomédicos.
- Despliegue en entornos con recursos limitados: al ocupar 0,4 GB en safetensors, puede ejecutarse en CPU para inferencia por lotes sin GPU dedicada, adecuado para servicios internos de bajo tráfico.

## Benchmarks y rendimiento

El autor declara resultados únicamente sobre el conjunto de evaluación del dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`. No hay resultados en benchmarks estándar (MMLU, GLUE, etc.) ni comparaciones con otros modelos en la información disponible.

| Métrica | Valor (época 7, mejor checkpoint) |
|---|---|
| Loss | 0,0714 |
| Precision | 0,6952 |
| Recall | 0,7256 |
| Micro F1 | 0,7101 |
| Weighted F1 | 0,7103 |
| Macro F1 | 0,7151 |
| Accuracy | 0,9844 |

La accuracy de 0,9844 debe interpretarse con cautela: en tareas NER con desbalanceo de clases (la mayoría de tokens son "O"), una accuracy alta es esperable incluso con F1 moderado. El F1 micro de 0,7101 es la métrica más informativa del rendimiento real en la detección de entidades.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4–0,5 GB en fp32, ~0,25 GB en fp16 y ~0,15 GB en int8 (108,9 M de parámetros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en RTX 3060, RTX 4090, A100 o H100, aunque el modelo es lo bastante pequeño como para no necesitar hardware de gama alta.
- Cabe holgadamente en GPUs de consumo (GTX 1650, RTX 2060, RTX 3050 y superiores) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` (Pipeline de token-classification), Hugging Face Inference Endpoints, ONNX Runtime, y cuantización con `optimum`. No se documenta soporte específico para vLLM, llama.cpp ni Ollama (no aplica a modelos encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados para este checkpoint frente a alternativas. A continuación se comparan características estructurales con modelos de la misma categoría (NER biomédico basado en BERT):

| Modelo | Parámetros | Contexto | Licencia | Tarea | Rendimiento publicado |
|---|---|---|---|---|---|
| tapt-orig-combdata-pubmedbert-2class-spanmask-label_all_false | 108,9 M | no disponible (BERT: 512 típico) | apache-2.0 | NER biomédico 2 clases | F1 micro 0,7101 (eval propia) |
| PubMedBERT (base) | ~110 M | 512 | MIT | Preentrenamiento dominio biomédico | No aplica (no ajustado a NER) |
| BioBERT base | ~110 M | 512 | Apache 2.0 | Preentrenamiento biomédico | No comparable directamente |
| Modelos NER biomédicos en Hugging Face (p. ej. d4data/biomedical-ner-all) | ~110 M | 512 | MIT/Apache | NER multi-clase | No disponible en esta ficha |

La comparación de rendimiento con alternativas no es posible con la información proporcionada, ya que no se han publicado evaluaciones cruzadas ni resultados en el mismo conjunto de test.

## Limitaciones y advertencias

- La model card está generada automáticamente y carece de secciones de usos previstos, limitaciones y descripción del dataset; el autor no ha documentado el esquema exacto de las dos clases ni el significado de las etiquetas.
- Solo soporta inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- El F1 micro de 0,7101 indica un margen de error considerable: aproximadamente un 29 % de las entidades no se detectan o se clasifican incorrectamente en el conjunto de evaluación.
- La accuracy de 0,9844 puede ser engañosa por el desbalanceo de clases típico en NER; no debe usarse como métrica principal de calidad.
- Riesgo de alucinación no aplica en sentido generativo (es un modelo discriminativo), pero sí existe riesgo de falsos positivos y falsos negativos en la extracción de entidades.
- No se documentan sesgos conocidos, pero al derivar de PubMedBERT y entrenarse sobre un corpus biomédico concreto, puede heredar sesgos de dominio y de la literatura científica utilizada.
- El dataset de evaluación (`OTAR3088/CeLLaTe-ner-2class-iob_final`) no está descrito en la model card; se desconoce su tamaño, composición y procedencia exacta.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datos de entrenamiento subyacentes (PubMed y CeLLaTe) antes de un despliegue en producción.
- El checkpoint se detuvo en la época 12 de 20; no se documenta si se aplicó early stopping ni si el checkpoint final es el de mejor F1 (la época 7 es la que reporta el mejor F1 micro).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/tapt-orig-combdata-pubmedbert-2class-spanmask-label_all_false
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-spanmask-combinedData
- Dataset de evaluación: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
- Perfil del autor: https://huggingface.co/Mardiyyah
- Documentación de Transformers (token classification): https://huggingface.co/docs/transformers/tasks/token_classification
