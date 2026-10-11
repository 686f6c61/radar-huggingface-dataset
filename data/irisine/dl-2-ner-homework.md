# IrisIne/dl-2-ner-homework

## Resumen

dl-2-ner-homework es un modelo de reconocimiento de entidades nombradas (NER) obtenido por fine-tuning de BAAI/bge-small-en-v1.5, un transformer tipo BERT de 33,2 millones de parámetros. Lo desarrolla el usuario IrisIne como parte de una tarea del curso "Deep Learning for NLP" (dl-2-ner-homework) y se publica bajo licencia MIT. El modelo resuelve la tarea de token classification, asignando etiquetas a cada token de un texto para extraer entidades como personas, organizaciones o localizaciones, aunque la ficha no especifica el conjunto de etiquetas ni el dataset de entrenamiento.

Con 33,2 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo muy ligero que puede ejecutarse en CPU y en cualquier GPU consumer. Su relevancia radica en que ofrece un punto de partida rápido para tareas de NER en inglés (el modelo base está entrenado principalmente en ese idioma) y sirve como ejemplo de fine-tuning eficiente de un modelo de embeddings para clasificación de tokens. No se han publicado resultados en benchmarks estándar ni información sobre el dataset utilizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (etiqueta "bert" en HuggingFace); fine-tune de BAAI/bge-small-en-v1.5 |
| Parámetros totales | 33.215.625 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BAAI/bge-small-en-v1.5 tiene una ventana típica de 512 tokens, pero no se confirma en la información proporcionada) |
| Tipos de cuantización | No disponible (pesos en safetensors FP32; convertible a FP16/INT8 con herramientas estándar) |
| Idiomas soportados | No disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de BAAI/bge-small-en-v1.5, un transformer encoder de tipo BERT con 33,2 millones de parámetros, al que se añade una cabeza de clasificación de tokens para NER. No es un modelo MoE ni híbrido; es un transformer denso estándar. El entrenamiento se realizó con el Trainer de HuggingFace sobre un dataset no especificado en la model card. Los hiperparámetros declarados incluyen learning rate 2e-05, batch de entrenamiento y evaluación de 8, 10 épocas, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal y semilla 42. No se menciona el uso de RLHF, DPO ni técnicas de decodificación especulativa. La pérdida de entrenamiento descendió de 0,1457 en la primera época a 0,0153 en la décima, mientras que la pérdida de validación se mantuvo entre 0,0817 y 0,1313. No hay información sobre la composición del dataset ni el número de tokens de entrenamiento.

## Capacidades

- Reconocimiento de entidades nombradas (NER): clasificación token a token. Las etiquetas concretas no se detallan en la ficha; dependen del dataset de entrenamiento (no especificado).
- Generación de texto: no, es un modelo discriminativo de clasificación.
- Razonamiento, código y matemáticas: no.
- Tool calling / function calling: no soportado de forma nativa.
- Agentes y multi-step reasoning: no aplica.
- Capacidades multilingües: no declaradas; el modelo base está orientado a inglés.
- Capacidad especial: ninguna (sin visión, audio ni modo thinking).
- Integrable con la pipeline "token-classification" de transformers.

## Casos de uso

- Extracción de entidades en documentos legales: identificar nombres de personas, empresas, fechas y ubicaciones en contratos para su posterior indexación y búsqueda.
- Anonimización de datos personales (PII): detectar nombres y localizaciones en textos para enmascararlos antes de compartirlos con terceros.
- Enriquecimiento de metadatos para RAG: etiquetar entidades en fragmentos de documentos para mejorar la recuperación en sistemas de generación aumentada.
- Análisis de opiniones o redes sociales: extraer marcas, productos y lugares mencionados en reseñas o tuits para análisis de sentimiento y tendencias.
- Procesamiento de currículums: extraer nombres, empresas y títulos de candidatos para poblar bases de datos de recursos humanos.
- Preprocesamiento en chatbot: reconocer entidades en la consulta del usuario para dirigir la conversación o consultar una base de datos estructurada.
- Etiquetado de corpus para investigación: asistir en la anotación automática de entidades en textos académicos, acelerando la creación de datasets.

## Benchmarks y rendimiento

El model-index del autor no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), por lo que no se dispone de comparaciones con otros modelos. La model card declara métricas de evaluación sobre un conjunto de validación no especificado. En la mejor época (época 8), se obtuvieron los siguientes valores:

| Métrica | Valor |
|---|---|
| Loss | 0,0836 |
| Precision | 0,9094 |
| Recall | 0,9253 |
| F1 | 0,9173 |
| Accuracy | 0,9827 |

Además, se dispone de la evolución por épocas:

| Training Loss | Epoch | Step | Validation Loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,1457 | 1.0 | 1250 | 0,1313 | 0,8043 | 0,8718 | 0,8367 | 0,9699 |
| 0,0906 | 2.0 | 2500 | 0,0932 | 0,8795 | 0,9066 | 0,8928 | 0,9785 |
| 0,0619 | 3.0 | 3750 | 0,0844 | 0,8812 | 0,9147 | 0,8976 | 0,9793 |
| 0,0460 | 4.0 | 5000 | 0,0885 | 0,8905 | 0,9263 | 0,9080 | 0,9800 |
| 0,0234 | 5.0 | 6250 | 0,0817 | 0,8985 | 0,9254 | 0,9118 | 0,9817 |
| 0,0226 | 6.0 | 7500 | 0,0822 | 0,8991 | 0,9253 | 0,9120 | 0,9816 |
| 0,0281 | 7.0 | 8750 | 0,0845 | 0,8997 | 0,9243 | 0,9118 | 0,9815 |
| 0,0143 | 8.0 | 10000 | 0,0836 | 0,9094 | 0,9253 | 0,9173 | 0,9827 |
| 0,0151 | 9.0 | 11250 | 0,0852 | 0,9033 | 0,9263 | 0,9147 | 0,9821 |
| 0,0153 | 10.0 | 12500 | 0,0867 | 0,9054 | 0,9260 | 0,9156 | 0,9825 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los pesos en FP32 ocupan aproximadamente 0,13 GB; en FP16 unos 66 MB; en INT8 unos 33 MB.
- GPU recomendadas: cualquier GPU moderna o antigua. No requiere GPU dedicada. Ejemplos: NVIDIA GTX 1050, RTX 3060, RTX 4090, A100 o H100 (estas últimas sobredimensionadas para este tamaño).
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en iGPU. También se ejecuta en CPU sin problemas.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime, TorchScript, vLLM (aunque es sobredimensionado para 33M), TGI, llama.cpp (previa conversión a GGUF, no oficial) y Ollama (previa conversión).
- Latencia y throughput estimados: en CPU, del orden de 10-50 ms por frase corta; en GPU, menos de 5 ms. El throughput en GPU puede superar los miles de tokens por segundo en batch. Son estimaciones orientativas basadas en el tamaño del modelo; no hay datos oficiales.

## Comparativa con modelos similares

Se compara el modelo con su base y con otros fine-tunes similares encontrados en la búsqueda web. No hay datos de rendimiento comparativos publicados.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IrisIne/dl-2-ner-homework | 33,2 M | No disponible (base 512 típico) | NER (token classification) | MIT | HuggingFace |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | Embeddings (no NER) | MIT | HuggingFace |
| mirusanova/dl2-homework-02 | No disponible | No disponible | NER (presumible, no confirmado) | No disponible | HuggingFace |
| tolyho/dl2-hw2-bge-ner | No disponible | No disponible | NER (presumible, no confirmado) | No disponible | HuggingFace |

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido; no se puede evaluar su cobertura ni sus sesgos.
- Idiomas soportados no declarados; el modelo base está entrenado principalmente en inglés, por lo que el rendimiento en castellano es incierto.
- Sin benchmarks estándar ni comparaciones publicadas con otros modelos NER.
- Riesgo de etiquetado incorrecto en entidades ambiguas o fuera del dominio de entrenamiento.
- No es un modelo generativo; no alucina texto, pero puede producir falsos positivos y falsos negativos en la clasificación.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías.
- Modelo creado como tarea académica; no validado para producción.
- Longitud de contexto probablemente limitada a 512 tokens (según el modelo base), aunque no se confirma en la ficha.
- No soporta tool calling ni agentes.

## Enlaces

- HuggingFace: https://huggingface.co/IrisIne/dl-2-ner-homework
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo similar 1: https://huggingface.co/mirusanova/dl2-homework-02
- Modelo similar 2: https://huggingface.co/tolyho/dl2-hw2-bge-ner
- Competición Kaggle relacionada: https://www.kaggle.com/competitions/ai-2-dl-for-nlp-2025-homework-2/models
- Documentación de Microsoft sobre entrenamiento NER (recurso general): https://learn.microsoft.com/en-us/azure/ai-services/language-service/custom-named-entity-recognition/how-to/train-model
