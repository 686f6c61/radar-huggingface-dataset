# Mardiyyah/CeLLaTe-ner-3class-reinitLLRD-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_3.942

## Resumen

CeLLaTe-ner-3class-reinitLLRD-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_3.942 es un modelo de reconocimiento de entidades nombradas (NER) biomédico, desarrollado por Mardiyyah. Se trata de un fine-tuning de PubMedBERT (modelo base Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask) sobre el dataset OTAR3088/CeLLaTe-ner-3class-iob_final, orientado a la extracción de tres clases de entidades en textos biomédicos. El modelo incorpora un entrenamiento adicional en dominio (TAPT) y una adaptación del tokenizer, además de una estrategia de reinitialización de capas con decay de learning rate (reinitLLRD). Con 110 millones de parámetros, es un modelo compacto y eficiente para tareas de etiquetado de secuencias en el ámbito de la biología y la medicina.

La relevancia de este modelo radica en su especialización para el dominio biomédico, donde los modelos genéricos suelen fallar por la jerga técnica y las abreviaturas. Al partir de PubMedBERT y aplicar TAPT, se mejora la representación de términos científicos. Su licencia Apache-2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en pipelines de procesamiento de literatura científica. Aunque no se han publicado benchmarks comparativos, las métricas de evaluación reportadas por el autor indican un rendimiento sólido en precisión, recall y F1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (PubMedBERT base) |
| Parametros totales | 110.410.759 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT-base: 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, concretamente en PubMedBERT, un transformer preentrenado con literatura biomédica. El proceso de entrenamiento incluye una fase de TAPT (training adicional en el dominio) sobre el modelo base, seguida de un fine-tuning para la tarea de NER de tres clases. Se emplea una adaptación del tokenizer para manejar mejor la terminología biomédica. La estrategia reinitLLRD consiste en reinitializar las capas superiores del transformer y aplicar un learning rate decay diferenciado, lo que suele mejorar la convergencia en tareas downstream. El entrenamiento se realizó con AdamW, batch size de 16 (32 con acumulación de gradientes), 20 épocas, learning rate de 3.94e-5, scheduler lineal con warmup del 10% y precisión mixta nativa. No se menciona el uso de RLHF ni DPO; es un fine-tuning supervisado estándar.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en textos biomédicos, con tres clases de entidades (definidas en el dataset CeLLaTe).
- Clasificación de tokens a nivel de secuencia, devolviendo etiquetas IOB (Inside, Outside, Beginning) para cada token.
- Procesamiento de documentos científicos y clínicos en inglés, gracias al preentrenamiento en PubMed y la adaptación del tokenizer.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo discriminativo puro para etiquetado de secuencias.
- Capacidad multilingüe limitada: solo inglés.

## Casos de uso

- Extracción de entidades en artículos de investigación biomédica: el modelo puede procesar abstracts y textos completos para identificar células, tejidos u otras entidades de interés, facilitando la construcción de bases de conocimiento.
- Anotación automática de registros clínicos electrónicos: permite etiquetar menciones de entidades en historiales médicos, ayudando a la codificación y a la extracción de información estructurada.
- Minería de literatura para bases de datos de interacciones: al identificar entidades, se pueden relacionar con otras menciones para extraer relaciones (aunque el modelo solo hace NER, puede integrarse en pipelines de relación).
- Preprocesamiento para sistemas de pregunta-respuesta biomédica: las entidades extraídas sirven como features para sistemas de QA o de recuperación de información.
- Monitorización de publicaciones científicas: detección de nuevas entidades o términos en artículos recientes, útil para alertas tempranas en dominios como oncología o genética.
- Enriquecimiento de ontologías y terminologías: las anotaciones generadas pueden usarse para actualizar vocabularios controlados como MeSH o Gene Ontology.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en el conjunto de evaluación (no se especifica el tamaño ni la composición del split):

| Metrica | Valor |
|---|---|
| Loss | 0.1287 |
| Precision | 0.7845 |
| Recall | 0.7414 |
| Micro F1 | 0.7623 |
| Weighted F1 | 0.7610 |
| Macro F1 | 0.7589 |
| Accuracy | 0.9823 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo BERT-base de 110M parámetros, la inferencia en FP32 requiere aproximadamente 440 MB de memoria para los pesos, más overhead de activaciones. Con cuantización a 8 bits, se reduce a ~110 MB. En la práctica, una GPU con 2 GB de VRAM es suficiente para procesar secuencias de hasta 512 tokens.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060, etc.). Para entrenamiento, se usó una GPU con al menos 8 GB (dado el batch size de 16 y precisión mixta).
- Cabe en GPUs de consumo: sí, incluso en CPUs con suficiente RAM (inferencia lenta pero posible).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Hugging Face Inference Endpoints, o mediante la librería `transformers` en un script Python. También es compatible con ONNX Runtime para optimización.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia sobre un texto de 128 tokens suele tardar menos de 10 ms.

## Comparativa con modelos similares

No se dispone de una comparación directa con otros modelos en la información proporcionada. Como referencia, modelos similares en el ámbito de NER biomédico son:

- **PubMedBERT** (base): el modelo original sin fine-tuning, con 110M parámetros, contexto 512, licencia MIT. No está especializado en NER de 3 clases.
- **BioBERT**: BERT preentrenado en PubMed y PMC, 110M parámetros, contexto 512, licencia MIT. Suele obtener buenos resultados en NER biomédico, pero no incorpora TAPT ni adaptación de tokenizer específica para CeLLaTe.
- **SapBERT**: BERT preentrenado con siamese para terminología biomédica, 110M parámetros, contexto 512, licencia MIT. Orientado a matching de entidades, no directamente a NER.

Dado que no hay benchmarks compartidos, no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- La longitud de contexto no se especifica, pero al ser BERT-base, está limitada a 512 tokens. Textos más largos requieren truncamiento o estrategias de ventana deslizante.
- Las métricas reportadas provienen de un único conjunto de evaluación; no se ha validado en múltiples dominios o datasets externos, por lo que el rendimiento puede variar en otros corpus.
- No se han documentado sesgos específicos, pero al entrenarse con literatura biomédica, puede reflejar los sesgos presentes en las publicaciones científicas (por ejemplo, sobrerrepresentación de ciertas enfermedades o poblaciones).
- Riesgo de alucinación: al ser un modelo discriminativo, no genera texto, pero puede producir etiquetas incorrectas en entidades ambiguas o poco frecuentes.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del dataset de entrenamiento (OTAR3088/CeLLaTe-ner-3class-iob_final) para asegurar el cumplimiento de sus términos.
- El modelo card indica que la información sobre usos previstos y limitaciones está incompleta ("More information needed"), por lo que se debe proceder con cautela en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/CeLLaTe-ner-3class-reinitLLRD-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_3.942
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-3class-iob_final (referencia indirecta)
- Repositorio del espacio CeLLaTe (app.py): https://d6108366.hf-mirror.com/spaces/OTAR3088/CeLLaTe/blob/main/app.py
