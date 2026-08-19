# Seemant/bert-base-ontonotes5-ner-ONNX

## Resumen

El modelo `Seemant/bert-base-ontonotes5-ner-ONNX` es una conversión al formato ONNX del modelo `learnrr/bert-base-ontonotes5-ner`, un BERT-base-cased fine-tuneado sobre el subconjunto en inglés del dataset OntoNotes 5.0 (CoNLL-2012) para reconocimiento de entidades nombradas (NER). La conversión, realizada automáticamente mediante un espacio de Hugging Face, permite ejecutar el modelo en entornos optimizados para ONNX, especialmente en navegadores y aplicaciones JavaScript a través de la librería Transformers.js.

Este modelo resuelve la tarea de token classification, identificando 18 tipos de entidades (personas, organizaciones, lugares, fechas, cantidades, etc.) con etiquetado BIO. Es relevante porque ofrece una versión portable y eficiente de un modelo NER de calidad media-alta, con un rendimiento micro-F1 de 0.8559 en el conjunto de test de OntoNotes 5.0. Su arquitectura es BERT-base-cased, aunque no se especifican el número exacto de parámetros ni la longitud de contexto en la ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (cased) con cabeza de token classification |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con max sequence length 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (además de safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es `google-bert/bert-base-cased`, una arquitectura transformer de 12 capas con embeddings de WordPiece. Sobre esta base se añade una capa de clasificación por token (`BertForTokenClassification`). El fine-tuning se realizó sobre el dataset OntoNotes 5.0 (CoNLL-2012) en inglés, con 18 tipos de entidades y etiquetas BIO. Los hiperparámetros de entrenamiento incluyen 5 épocas, learning rate de 2e-5, batch size de 16 por dispositivo (32 en total con 2 GPUs V100), weight decay de 0.01, y precisión mixta FP16. La longitud máxima de secuencia durante el entrenamiento fue de 128 tokens.

La conversión a ONNX se llevó a cabo mediante un script automático del espacio `onnx-community/convert-to-onnx`, lo que genera un modelo optimizado para inferencia en runtime ONNX, incluyendo Transformers.js.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en inglés, con 18 categorías: CARDINAL, DATE, EVENT, FAC, GPE, LANGUAGE, LAW, LOC, MONEY, NORP, ORDINAL, ORG, PERCENT, PERSON, PRODUCT, QUANTITY, TIME y WORK_OF_ART.
- Token classification con etiquetado BIO (Begin, Inside, Outside).
- Compatible con el pipeline `token-classification` de Transformers.js, permitiendo agregación de entidades (`aggregation_strategy="simple"`).
- Inferencia en navegador y Node.js gracias al formato ONNX.
- Soporte para integración en aplicaciones web sin necesidad de backend dedicado.

## Casos de uso

- Extracción de entidades en documentos legales: identificar personas, organizaciones, leyes y fechas en contratos o sentencias. El modelo distingue LAW, ORG, PERSON y DATE, lo que facilita el análisis automatizado de textos jurídicos.
- Análisis de noticias financieras: detectar menciones de empresas (ORG), cantidades monetarias (MONEY), porcentajes (PERCENT) y fechas (DATE) para alimentar sistemas de inteligencia de mercado.
- Procesamiento de currículos y ofertas de empleo: extraer nombres de personas, ubicaciones (GPE, LOC), organizaciones y fechas para automatizar la preselección de candidatos.
- Chatbots de atención al cliente: identificar productos, cantidades y fechas en las consultas de los usuarios para enrutar la conversación o proporcionar respuestas específicas.
- Análisis de redes sociales: reconocer eventos, lugares y organizaciones en tweets o publicaciones para monitorización de marca o detección de tendencias.
- Indexación de documentos académicos: extraer títulos de obras (WORK_OF_ART), eventos, fechas y ubicaciones para generar metadatos estructurados en bibliotecas digitales.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de OntoNotes 5.0 (según la model card del autor):

| Entidad | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| CARDINAL | 0.7776 | 0.8070 | 0.7920 | 1005 |
| DATE | 0.7943 | 0.8628 | 0.8272 | 1786 |
| EVENT | 0.5000 | 0.6235 | 0.5550 | 85 |
| FAC | 0.6081 | 0.6040 | 0.6061 | 149 |
| GPE | 0.9243 | 0.9156 | 0.9199 | 2546 |
| LANGUAGE | 0.7500 | 0.6818 | 0.7143 | 22 |
| LAW | 0.5200 | 0.5909 | 0.5532 | 44 |
| LOC | 0.6478 | 0.7442 | 0.6926 | 215 |
| MONEY | 0.8760 | 0.9155 | 0.8953 | 355 |
| NORP | 0.8956 | 0.9182 | 0.9067 | 990 |
| ORDINAL | 0.7252 | 0.7778 | 0.7506 | 207 |
| ORG | 0.8621 | 0.8991 | 0.8802 | 2002 |
| PERCENT | 0.8575 | 0.9017 | 0.8790 | 407 |
| PERSON | 0.9080 | 0.9161 | 0.9121 | 2134 |
| PRODUCT | 0.5918 | 0.6444 | 0.6170 | 90 |
| QUANTITY | 0.7042 | 0.6536 | 0.6780 | 153 |
| TIME | 0.5906 | 0.6667 | 0.6263 | 225 |
| WORK_OF_ART | 0.6022 | 0.6450 | 0.6229 | 169 |
| **micro avg** | **0.8413** | **0.8710** | **0.8559** | **12584** |
| **macro avg** | **0.7297** | **0.7649** | **0.7460** | **12584** |
| **weighted avg** | **0.8440** | **0.8710** | **0.8570** | **12584** |

## Requisitos de hardware

No se proporcionan requisitos específicos en la ficha. Al tratarse de un modelo BERT-base, se estima que la inferencia puede ejecutarse en CPU con un consumo de memoria moderado (alrededor de 400-500 MB en FP32), aunque estos valores no están confirmados. Para uso en navegador con Transformers.js, se recomienda un dispositivo con al menos 2 GB de RAM y soporte WebAssembly o WebGPU para un rendimiento aceptable. No hay datos de latencia o throughput disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa en la ficha. El modelo más directamente comparable es el original `learnrr/bert-base-ontonotes5-ner` (en formato PyTorch), del cual este es una conversión ONNX. La única diferencia práctica es el formato de pesos y la optimización para runtime ONNX, lo que facilita su despliegue en entornos JavaScript. Otros modelos NER como `dslim/bert-base-NER` (entrenado en CoNLL-2003) cubren menos tipos de entidades (4 frente a 18), pero no se dispone de datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no soporta otros idiomas.
- La longitud máxima de secuencia durante el entrenamiento fue de 128 tokens, aunque BERT-base soporta hasta 512. Para textos más largos se requerirá truncamiento o partición.
- Las entidades con menor soporte (EVENT, LAW, LANGUAGE, PRODUCT) presentan F1 significativamente más bajo, lo que puede generar errores en esos dominios.
- No se han documentado sesgos específicos, pero al ser un modelo basado en BERT entrenado en textos generales, puede heredar sesgos de género, raza o procedencia presentes en los datos.
- Riesgo de alucinación en la identificación de entidades ambiguas o fuera del dominio de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de la aplicación final.
- No se especifican versiones de ONNX runtime ni requisitos de cuantización; el tamaño del repo (1.1 GB) sugiere que puede incluir múltiples archivos, pero no se detalla su contenido exacto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Seemant/bert-base-ontonotes5-ner-ONNX)
- [Modelo base original (PyTorch)](https://huggingface.co/learnrr/bert-base-ontonotes5-ner)
- [Repositorio GitHub del proyecto de evaluación](https://github.com/Learnrr/ontonotes5_ner_evaluation.git)
- [Documentación de pipeline token-classification de Transformers.js](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TokenClassificationPipeline)
