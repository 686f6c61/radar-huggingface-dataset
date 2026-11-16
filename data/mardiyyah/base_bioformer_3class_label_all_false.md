# Mardiyyah/base_bioformer_3class_label_all_false

## Resumen

`Mardiyyah/base_bioformer_3class_label_all_false` es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning supervisado del checkpoint base `bioformers/bioformer-16l`, un transformer tipo BERT especializado en texto biomédico. Lo desarrolla el usuario Mardiyyah y está pensado para el reconocimiento de entidades nombradas (NER) sobre textos biomédicos en inglés, con un esquema de tres clases en formato IOB.

El modelo resuelve una tarea concreta y acotada: etiquetar secuencias de texto biomédico a nivel de token, no generar lenguaje. Se ha entrenado sobre el dataset `OTAR3088/CeLLaTe-ner-3class-iob_final`, y la model card reporta métricas de evaluación sobre dicho conjunto (loss 0,0717, micro F1 0,6541, accuracy 0,9808). Con 41,37 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero y desplegable en hardware modesto.

Su relevancia es limitada y muy específica: se trata de un artefacto de fine-tuning con cero descargas y cero likes en el momento de la consulta, sin documentación adicional sobre usos previstos, limitaciones o composición del dataset. Resulta útil como referencia técnica para pipelines de NER biomédico, pero no debe considerarse un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), base `bioformers/bioformer-16l` |
| Parametros totales | 41.371.783 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Bioformer-16L usa ventanas cortas tipo BERT; el valor exacto no se declara en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizacion no declarada) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `bioformers/bioformer-16l`, un encoder transformer derivado de la familia BERT orientado a dominio biomédico. La cabeza de salida es de clasificación de tokens (token classification), configurada para un esquema IOB de tres clases sobre el dataset `OTAR3088/CeLLaTe-ner-3class-iob_final`. El nombre del checkpoint (`label_all_false`) sugiere una configuración de etiquetado en la que los subtokens no iniciales se marcan como no-entidad, aunque este detalle no se documenta explícitamente en la model card.

El entrenamiento se realizó con el `Trainer` de Hugging Face y los siguientes hiperparámetros: learning rate 2e-05, batch size de entrenamiento 16 con acumulación de gradiente de 2 pasos (batch efectivo 32), optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con warmup ratio 0,01, 20 épocas, semilla 3407 y precisión mixta nativa (AMP). Las versiones de framework fueron Transformers 4.48.2, PyTorch 2.4.1+cu121, Datasets 3.0.2 y Tokenizers 0.21.0. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables, por otra parte, a una tarea de etiquetado supervisado).

## Capacidades

- Clasificación de tokens a nivel de entidad sobre texto biomédico en inglés (esquema IOB de tres clases).
- Reconocimiento de entidades nombradas (NER) en el dominio biomédico, condicionado al dataset de entrenamiento `CeLLaTe-ner-3class-iob_final`.
- Inferencia por secuencias de entrada y salida de etiquetas por token; no genera texto libre.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al inglés declarado; no se documentan otros idiomas.

## Casos de uso

- Extracción de entidades biomédicas en artículos científicos: el modelo puede etiquetar secuencias de texto biomédico en inglés token a token para poblar bases de datos de entidades, aprovechando su especialización de dominio heredada de Bioformer.
- Preprocesado de historiales clínicos en inglés: integrado como paso de NER dentro de un pipeline de procesamiento de lenguaje natural clínico, siempre que las categorías de entidad coincidan con el esquema de tres clases del dataset de entrenamiento.
- Anotación asistida (human-in-the-loop): uso como preetiquetador para acelerar la revisión manual en proyectos de anotación de corpus biomédicos, dado su bajo coste computacional (41 millones de parámetros).
- Indexación semántica de literatura biomédica: extracción de menciones de entidades para enriquecer índices de búsqueda o sistemas de recuperación de información científica.
- Filtrado y normalización de datos en pipelines de curación: detección de entidades en corpus biomédicos antes de tareas posteriores de resolución de entidades o vinculación a ontologías.
- Evaluación comparativa de checkpoints de NER biomédico: al ser un fine-tuning reproducible con hiperparámetros documentados, sirve como línea base en experimentos de ajuste sobre Bioformer-16L.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluación (no se especifica el conjunto exacto más allá del dataset de entrenamiento):

| Metrica | Valor |
|---|---|
| Loss | 0,0717 |
| Precision | 0,6712 |
| Recall | 0,6378 |
| Micro F1 | 0,6541 |
| Weighted F1 | 0,6493 |
| Macro F1 | 0,6400 |
| Accuracy | 0,9808 |

Evolución por época (extracto de la model card):

| Epoca | Validation loss | Precision | Recall | Micro F1 | Macro F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 0,0786 | 0,4724 | 0,5926 | 0,5258 | 0,5194 | 0,9745 |
| 2 | 0,0650 | 0,6741 | 0,6138 | 0,6425 | 0,6308 | 0,9813 |
| 3 | 0,0655 | 0,6467 | 0,6276 | 0,6370 | 0,6230 | 0,9808 |
| 4 | 0,0717 | 0,6712 | 0,6378 | 0,6541 | 0,6400 | 0,9808 |
| 5 | 0,0764 | 0,5964 | 0,6101 | 0,6032 | 0,5951 | 0,9776 |
| 6 | 0,0748 | 0,6158 | 0,6249 | 0,6203 | 0,6100 | 0,9798 |
| 7 | 0,0813 | 0,6516 | 0,6396 | 0,6456 | 0,6350 | 0,9810 |

El model-index oficial no contiene resultados adicionales más allá de la lista vacía declarada. No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos sería aplicable a un modelo de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 165 MB solo para pesos (41,37 M de parámetros × 4 bytes); en FP16 alrededor de 83 MB. Con activaciones y overhead del runtime, el consumo total se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está muy sobredimensionado para estas GPUs.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, `pipeline("token-classification")`, servidores de inferencia compatibles con la API de Hugging Face (el repositorio está marcado como `endpoints_compatible`), ONNX Runtime tras exportación. No se documenta soporte específico de vLLM, llama.cpp u Ollama (estas herramientas están orientadas a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `Mardiyyah/base_bioformer_3class_label_all_false` | 41,37 M | Token classification (NER biomédico, 3 clases) | No disponible | Apache 2.0 | Publicado, 0 descargas |
| `bioformers/bioformer-16l` (modelo base) | No disponible en la informacion | Encoder biomédico (MLM) | No disponible | No disponible en la informacion | Modelo base de referencia |
| `dmis-lab/biobert-base-cased-v1.1` | ~110 M | Encoder biomédico (MLM) | 512 tokens (estándar BERT) | Apache 2.0 | Ampliamente usado, requiere fine-tuning para NER |

La comparación con BioBERT se aporta como referencia de categoría (encoder biomédico tipo BERT); los datos de BioBERT no provienen de la información proporcionada para este modelo y deben verificarse en su propia model card. No se dispone de comparativas de rendimiento directas entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Modelo de clasificación de tokens, no generativo: no puede usarse para generación de texto, razonamiento, código ni conversación.
- Entrenado exclusivamente sobre un dataset concreto (`OTAR3088/CeLLaTe-ner-3class-iob_final`) y para un esquema de tres clases; su comportamiento fuera de ese dominio o esquema de etiquetas es incierto.
- Métricas moderadas: micro F1 de 0,6541 y macro F1 de 0,6400 indican margen de error considerable en la detección de entidades, pese a la alta accuracy (0,9808), que está inflada por el desbalance típico de etiquetas en NER.
- La model card no documenta sesgos conocidos, composición del dataset, ni evaluación de robustez; la sección de usos previstos y limitaciones está marcada como "More information needed".
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de falsos positivos y falsos negativos en la etiquetación de entidades.
- Idioma limitado al inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no obstante, la ausencia de documentación sobre el dataset de entrenamiento impide verificar posibles restricciones heredadas de los datos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- El nombre del checkpoint (`label_all_false`) sugiere una configuración de etiquetado específica que no está documentada; conviene inspeccionar la configuración de etiquetas antes de integrarlo en un pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/base_bioformer_3class_label_all_false
- Modelo base: https://huggingface.co/bioformers/bioformer-16l
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-3class-iob_final
