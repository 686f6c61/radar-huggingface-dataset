# Mardiyyah/CeLLaTe-ner-3class-gaz-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_2.97

## Resumen

CeLLaTe-ner-3class-gaz-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_2.97 es un modelo de reconocimiento de entidades nombradas (NER) de tres clases, especializado en el dominio biomédico. Ha sido desarrollado por Mardiyyah como un fine-tuning del modelo base Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask, que a su vez parte de PubMedBERT con un tokenizador adaptado y un entrenamiento previo específico de tarea (TAPT) con enmascaramiento de palabras completas. El modelo se ha ajustado sobre el conjunto de datos OTAR3088/CeLLaTe-ner-3class-iob_final, orientado a la identificación de entidades relacionadas con células.

Con 110 millones de parámetros, sigue la arquitectura BERT-base y está diseñado para la clasificación de tokens a nivel de secuencia. Su relevancia radica en ofrecer una solución específica para la extracción de entidades celulares en literatura biomédica, un área con alta demanda en minería de textos científicos. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 110.410.759 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (estándar de BERT, no especificado explícitamente) |
| Tipos de cuantizacion | safetensors (FP32/FP16, no se indican cuantizaciones adicionales) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un transformer encoder de 12 capas con 110 millones de parámetros. El modelo base, Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask, es una adaptación de PubMedBERT (preentrenado desde cero en abstracts y artículos completos de PubMed) con un tokenizador adaptado al dominio y un entrenamiento previo específico de tarea (TAPT) utilizando enmascaramiento de palabras completas (whole word masking). Sobre esta base, el modelo final se ha ajustado mediante fine-tuning supervisado para la tarea de NER de tres clases sobre el dataset CeLLaTe-ner-3class-iob_final.

El entrenamiento se realizó con el framework Transformers de Hugging Face, utilizando el optimizador AdamW con una tasa de aprendizaje de 2,97e-5, un tamaño de lote efectivo de 64 (32 con acumulación de gradientes de 2), programador de tasa de aprendizaje coseno con un calentamiento del 10%, y 20 épocas. Se empleó precisión mixta nativa (AMP). No se ha documentado el uso de técnicas como RLHF o DPO, ya que se trata de un modelo discriminativo de clasificación de tokens.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER) de tres clases, orientado a entidades celulares en textos biomédicos.
- Procesamiento de secuencias de hasta 512 tokens, adecuado para frases y párrafos de literatura científica.
- Especialización en dominio biomédico gracias al preentrenamiento de PubMedBERT y al TAPT con tokenizador adaptado.
- Salida de etiquetas por token en formato IOB (Inside, Outside, Beginning), compatible con pipelines estándar de token-classification de Hugging Face.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un modelo encoder para tareas de etiquetado.

## Casos de uso

- Extracción de entidades celulares en abstracts de PubMed: el modelo puede procesar el título y resumen de artículos biomédicos para identificar menciones de tipos celulares, facilitando la construcción de bases de datos bibliográficas.
- Anotación automática de literatura para revisiones sistemáticas: investigadores pueden usar el modelo para preetiquetar documentos y acelerar la selección de estudios relevantes en meta-análisis.
- Enriquecimiento de ontologías biomédicas: las entidades extraídas pueden mapearse a términos de ontologías como Cell Ontology, ayudando a mantener actualizados los vocabularios controlados.
- Minería de textos en ensayos clínicos: identificación de poblaciones celulares en documentos de ensayos, útil para el análisis de criterios de elegibilidad y resultados.
- Integración en pipelines de procesamiento de lenguaje natural biomédico: el modelo puede combinarse con otros componentes (normalización, relación entre entidades) para construir sistemas completos de extracción de información.
- Asistencia a la curación de bases de datos genómicas: anotación de entidades celulares en artículos que describen experimentos, reduciendo el trabajo manual de curadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El autor declara las siguientes métricas de evaluación sobre el conjunto de validación del dataset CeLLaTe-ner-3class-iob_final:

| Metrica | Valor |
|---|---|
| Loss | 0,0937 |
| Precision | 0,7856 |
| Recall | 0,7352 |
| Micro F1 | 0,7596 |
| Weighted F1 | 0,7582 |
| Macro F1 | 0,7533 |
| Accuracy | 0,9818 |

Estos valores corresponden al mejor punto de entrenamiento (época 4). La evolución por épocas muestra una mejora progresiva hasta la época 4, con ligero sobreajuste posterior (la loss de validación aumenta a partir de la época 5).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (110M parámetros × 4 bytes), menos de 0,3 GB en FP16. Cabe en cualquier GPU moderna, incluso en tarjetas de gama baja.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o superiores). También puede ejecutarse en CPU con razonable velocidad para lotes pequeños.
- Compatible con GPUs consumer: sí, todas las GPUs de consumo actuales pueden ejecutar el modelo sin problemas.
- Opciones de despliegue: transformers (pipeline de token-classification), ONNX Runtime, TensorFlow Serving, o mediante la API de Hugging Face Inference Endpoints. No se proporcionan archivos GGUF ni soporte nativo para llama.cpp u Ollama, al ser un modelo encoder.
- Latencia y throughput estimados: no disponibles en la información proporcionada, pero para un modelo de 110M parámetros se espera una latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Sin embargo, el modelo pertenece a la familia de BERT biomédicos ajustados para NER. Alternativas típicas en la misma categoría son:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CeLLaTe-ner-3class (este modelo) | 110M | 512 | Apache 2.0 | Fine-tuning de PubMedBERT con TAPT y tokenizador adaptado |
| BioBERT (fine-tuned NER) | 110M | 512 | Apache 2.0 | Preentrenado en PubMed y PMC, ampliamente usado para NER biomédico |
| ClinicalBERT (fine-tuned NER) | 110M | 512 | MIT | Preentrenado en notas clínicas, orientado a dominio clínico |

No se han encontrado resultados de evaluación comparativa entre estos modelos en la información disponible, por lo que no es posible establecer una jerarquía de rendimiento objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con literatura biomédica en inglés, puede presentar sesgos hacia terminología anglosajona y no generalizar bien a otros idiomas o a textos no biomédicos.
- Riesgo de alucinación: aunque es un modelo discriminativo, puede producir etiquetas incorrectas en contextos ambiguos o con entidades poco frecuentes; la precisión del 78,56% indica que aproximadamente 1 de cada 5 etiquetas positivas puede ser errónea.
- Limitaciones de contexto: la ventana de 512 tokens impide procesar documentos completos de una sola vez; para textos largos se requiere segmentación, lo que puede perder contexto entre fragmentos.
- Limitaciones de idioma: solo soporta inglés; no se ha evaluado su rendimiento en otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del dataset de entrenamiento (OTAR3088/CeLLaTe-ner-3class-iob_final) para posibles restricciones adicionales.
- Caveat para producción: el modelo se ha entrenado con un dataset específico de entidades celulares; su uso en otros dominios de NER biomédico (genes, enfermedades, fármacos) puede degradar significativamente el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/CeLLaTe-ner-3class-gaz-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_2.97
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-3class-iob_final (referenciado en la model card)
- Variante de 2 clases: https://huggingface.co/Mardiyyah/CeLLaTe-ner-2class-gaz-tapt-pubmedbert-tokenizer-adapted-lr_3.89
- Variante sin gazetteer: https://huggingface.co/Mardiyyah/CeLLaTe-ner-3class-pubmedbert-tapt-tokenizer-adapted-wwmask
- PubMedBERT (referencia): https://www.emergentmind.com/topics/pubmedbert
