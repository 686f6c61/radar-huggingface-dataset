# Mardiyyah/CeLLaTe-ner-3class-gaz-reinitLLRD-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_3.77

## Resumen

CeLLaTe-ner-3class-gaz-reinitLLRD-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_3.77 es un modelo de reconocimiento de entidades nombradas (NER) de tres clases, especializado en el dominio biomédico. Se trata de un ajuste fino (fine-tune) del modelo Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask, que a su vez parte de PubMedBERT con un proceso de preentrenamiento adaptativo a la tarea (TAPT) y un tokenizador adaptado al corpus biomédico. El modelo ha sido desarrollado por Mardiyyah y entrenado sobre el dataset OTAR3088/CeLLaTe-ner-3class-iob_final, orientado a la extracción de entidades relacionadas con células y tejidos en literatura científica.

Con 110,4 millones de parámetros, sigue la arquitectura BERT-base y está diseñado para clasificación de tokens (token-classification). Su relevancia radica en ofrecer una solución específica para anotación automática de textos biomédicos en inglés, con un rendimiento reportado de micro F1 de 0,7765 y una precisión del 0,7878 sobre el conjunto de evaluación. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, base) |
| Parametros totales | 110.410.759 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (encoder transformer) con 110 millones de parámetros, heredada de PubMedBERT. El proceso de entrenamiento incluye un paso de preentrenamiento adaptativo a la tarea (TAPT) sobre el modelo base, con adaptación del tokenizador al vocabulario biomédico y uso de whole word masking (wwmask). Posteriormente se realiza un ajuste fino para NER de tres clases, incorporando dos técnicas adicionales: gazetteers (listas de entidades conocidas) y reinitialización de capas con decay de learning rate por capa (reinitLLRD), que permite una actualización diferenciada de los pesos durante el fine-tune.

Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 3,77e-5, tamaño de batch de 32 (con acumulación de gradientes de 2, resultando en un batch efectivo de 64), 20 épocas, scheduler lineal con warmup del 3% y precisión mixta nativa (AMP). El entrenamiento se realizó con el framework Transformers 4.48.2 y PyTorch 2.4.1.

## Capacidades

- Clasificación de tokens para NER biomédico con tres clases de entidades (las clases concretas no están especificadas en la documentación disponible).
- Procesamiento de texto en inglés, especializado en dominios científicos y clínicos.
- Inferencia sobre secuencias de hasta 512 tokens (longitud típica de BERT, no confirmada explícitamente).
- No soporta tool calling, generación de texto libre, razonamiento multi-paso ni capacidades multimodales.
- No incluye modo de pensamiento (thinking mode) ni generación de código.

## Casos de uso

- Anotación de literatura biomédica: el modelo puede etiquetar automáticamente entidades en artículos científicos, facilitando la construcción de bases de datos de conocimiento (por ejemplo, extracción de menciones de tipos celulares o tejidos).
- Minería de textos clínicos: aplicable a informes médicos o historiales clínicos en inglés para identificar entidades relevantes en investigación traslacional.
- Preprocesamiento para sistemas de pregunta-respuesta biomédica: las entidades extraídas pueden alimentar pipelines de recuperación de información o grafos de conocimiento.
- Validación de anotaciones manuales: como herramienta de apoyo para revisores que necesitan verificar la consistencia de etiquetas en corpus anotados.
- Integración en flujos de trabajo de revisión sistemática: ayuda a cribar grandes volúmenes de abstracts para identificar estudios que mencionan entidades específicas.
- Desarrollo de herramientas de asistencia a la investigación: puede incorporarse en aplicaciones de escritorio o web para que investigadores marquen entidades en sus propios documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (el model-index está vacío). La model card reporta las siguientes métricas de evaluación sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Loss | 0,1402 |
| Precision | 0,7878 |
| Recall | 0,7655 |
| Micro F1 | 0,7765 |
| Weighted F1 | 0,7762 |
| Macro F1 | 0,7725 |
| Accuracy | 0,9828 |

Estos valores corresponden al mejor checkpoint (época 14) y no se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 110M de parámetros en FP32, los pesos ocupan aproximadamente 0,44 GB; en FP16 se reduce a ~0,22 GB. Considerando activaciones y overhead, se recomienda al menos 2-4 GB de VRAM para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A10 o A100.
- Es compatible con GPUs de consumo (consumer) de gama media y baja.
- Opciones de despliegue: se puede servir con la librería Transformers de HuggingFace, o exportar a ONNX para optimización. También es posible usar vLLM o TGI, aunque al ser un modelo encoder de clasificación, el uso típico es mediante pipelines de transformers o inferencia directa.
- Latencia y throughput: no se dispone de datos medidos; en una GPU moderna, la inferencia sobre una secuencia de 512 tokens suele completarse en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de la misma categoría (NER biomédico). El modelo base PubMedBERT es un punto de referencia, pero no se han publicado resultados comparativos de este fine-tune frente a otros modelos como BioBERT o ClinicalBERT. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- Su dominio de aplicación es biomédico; su rendimiento en textos generales o de otras especialidades será probablemente deficiente.
- Las clases de entidades (tres) no están documentadas explícitamente, lo que dificulta interpretar los resultados fuera del contexto del dataset CeLLaTe.
- No se han evaluado sesgos específicos; como todo modelo entrenado con datos científicos, puede reflejar sesgos presentes en la literatura biomédica (por ejemplo, subrepresentación de ciertas poblaciones).
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto libre, pero puede etiquetar incorrectamente entidades ambiguas o fuera de distribución.
- La longitud de contexto no está confirmada; si se superan los 512 tokens, será necesario truncar o dividir el texto.
- Aunque la licencia Apache 2.0 permite uso comercial, no se proporcionan garantías sobre la exactitud de las predicciones en entornos de producción clínica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mardiyyah/CeLLaTe-ner-3class-gaz-reinitLLRD-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_3.77
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-3class-iob_final (referenciado en la model card)
- Variante de 2 clases: https://huggingface.co/Mardiyyah/CeLLaTe-ner-2class-gaz-tapt-pubmedbert-tokenizer-adapted-lr_3.89
- Otra variante con gazetteers: https://huggingface.co/Mardiyyah/CeLLaTe-ner-2class-reinitllrd-tapt-pubmedbert-tokenizer-adapted-combData-gazetteers-lr_3.36e5
- Espacio de demostración (app.py): https://d6108366.hf-mirror.com/spaces/OTAR3088/CeLLaTe/blob/main/app.py
