# mursideaki/latensis-ner-tr

## Resumen

Latensis NER es un modelo de reconocimiento de entidades nombradas (NER) para turco, desarrollado por Mürşide Aki (usuario `mursideaki` en HuggingFace) como parte de la suite Latensis de NLP en turco. Se trata de un ajuste fino de tipo token classification sobre el modelo base Latensis RoBERTa Base, que a su vez se entrenó durante 500.000 pasos con una pérdida de validación de 3,21. El modelo resuelve la tarea de etiquetado de secuencias con siete etiquetas en formato BIO: persona (PER), organización (ORG) y localización (LOC), distinguiendo inicio (B-) e interior (I-) de cada entidad, más la clase O.

El modelo cuenta con 183.760.903 parámetros (aproximadamente 183,8 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,7 GB. Emplea un tokenizador propio de SentencePiece con vocabulario unigram de 128.000 piezas (Hecemen Unigram 128k), lo que explica el mayor número de parámetros respecto a un RoBERTa base estándar debido al tamaño de la matriz de embeddings. Está publicado bajo licencia MIT, lo que permite uso comercial sin restricciones de atribución más allá de las habituales.

Su relevancia actual es limitada pero concreta: el turco es un idioma con relativamente pocos modelos NER abiertos y bien documentados, y este modelo ofrece una alternativa con licencia permisiva y resultados publicados sobre el conjunto de evaluación WikiANN turco. No obstante, en el momento de redactar esta ficha el repositorio registra 0 descargas y 0 valoraciones, por lo que se trata de una publicación reciente y sin validación externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (variante base); numero de capas y dimension oculta no disponibles en la informacion proporcionada |
| Parametros totales | 183.760.903 (aprox. 183,8 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso de la model card trunca a 128 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, INT8 ni cuantizaciones oficiales) |
| Idiomas soportados | Turco (tr) unicamente |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Token classification (NER, esquema BIO) |
| Etiquetas | O, B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC |
| Tokenizador | Hecemen Unigram 128k (SentencePiece, `mursideaki/hecemen-tokenizer-unigram-128k`) |
| Modelo base | Latensis RoBERTa Base (`mursideaki/latensis-roberta-base-tr`) |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de tipo RoBERTa configurado para clasificación de tokens (`RobertaForTokenClassification`), con una cabeza de clasificación de 7 clases sobre la representación contextual de cada token. La model card no detalla el número de capas, la dimensión oculta ni el número de cabezas de atención del modelo base; únicamente se documenta que el base Latensis RoBERTa se entrenó durante 500.000 pasos y alcanzó una pérdida de validación de 3,21. El tamaño de la matriz de embeddings (vocabulario de 128.000 piezas) explica que el total de parámetros sea notablemente superior al de un RoBERTa base estándar.

El ajuste fino se realizó sobre 20.000 ejemplos del conjunto WikiANN Turkish, con tasa de aprendizaje 2e-5, tamaño de lote 16 y 20 épocas. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna otra técnica de alineación, algo esperable en un modelo discriminativo de etiquetado de secuencias. Tampoco se documentan técnicas de innovación como decodificación especulativa, atención lineal o decodificación restringida por BIO. La innovación principal del conjunto es el tokenizador propio Hecemen Unigram 128k, que sustituye al tokenizador de RoBERTa original y obliga a cargar explícitamente el SentencePiece asociado para que los identificadores de token coincidan con los esperados por el modelo.

## Capacidades

- Extracción de entidades nombradas en texto turco para tres tipos: persona (PER), organización (ORG) y localización (LOC), con etiquetado BIO.
- Clasificación a nivel de subpalabra agregada por palabra: el ejemplo oficial mapea cada token a su índice de palabra y conserva la predicción de la primera subpalabra no vacía.
- Gestión de texto con puntuación y sufijos aglutinantes propios del turco, gracias al tokenizador SentencePiece entrenado específicamente para el idioma.
- Inferencia por lotes con `transformers` y `torch.no_grad()`, adecuada para procesamiento de corpus completos.
- No se documenta soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio, ni modo de pensamiento (thinking). Es un modelo puramente discriminativo de etiquetado.
- No se documentan capacidades multilingües: el modelo está declarado exclusivamente para turco.

## Casos de uso

- Anonimización y seudonimización de datos personales: el modelo detecta nombres de persona (B-PER, I-PER) en textos turcos, lo que permite enmascararlos antes de almacenar o compartir corpus, un requisito habitual en cumplimiento del RGPD y de la ley turca KVKK.
- Enriquecimiento de CRM y bases de contactos: a partir de correos, notas de llamada o formularios libres en turco se pueden extraer automáticamente nombres de persona y de empresa (B-ORG, I-ORG) para poblar campos estructurados.
- Monitorización de medios y prensa turca: extracción sistemática de organizaciones y localizaciones en titulares y cuerpos de noticia para construir cuadros de mando de menciones por empresa o por ciudad.
- Análisis de redes sociales: procesamiento de publicaciones y comentarios en turco para identificar entidades mencionadas y analizar la distribución geográfica o corporativa de una conversación.
- Preprocesamiento de pipelines RAG: el etiquetado de entidades sirve como paso previo para construir índices con metadatos (persona, organización, lugar) que mejoren el filtrado y la recuperación de documentos en turco.
- Extracción de entidades en documentos administrativos y jurídicos turcos: identificación de partes implicadas (personas y organismos) en contratos, resoluciones o expedientes, siempre que el texto se asemeje al dominio noticioso y enciclopédico de WikiANN.
- Geocodificación y análisis territorial: las etiquetas B-LOC e I-LOC permiten localizar provincias, ciudades o países citados en un corpus turco para estudios de cobertura o logística.
- Etiquetado asistido para anotación humana: el modelo puede generar preanotaciones sobre grandes volúmenes de texto turco que después se corrigen manualmente, reduciendo el coste de creación de datasets NER propios.

## Benchmarks y rendimiento

Evaluado sobre el conjunto de test WikiANN Turkish (75.731 tokens):

| Metrica | Latensis NER | BERTurk |
|---|---|---|
| F1-macro | 0,9429 | 0,9522 |
| Accuracy | 0,97 | No disponible |

Resultados por clase:

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| O | 0,99 | 0,99 | 0,99 | 46.466 |
| B-PER | 0,96 | 0,96 | 0,96 | 4.519 |
| I-PER | 0,97 | 0,96 | 0,96 | 5.694 |
| B-ORG | 0,93 | 0,92 | 0,92 | 4.154 |
| I-ORG | 0,94 | 0,95 | 0,94 | 6.979 |
| B-LOC | 0,94 | 0,95 | 0,95 | 4.914 |
| I-LOC | 0,92 | 0,92 | 0,92 | 3.005 |
| macro avg | 0,95 | 0,95 | 0,95 | 75.731 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo lógico dado que se trata de un modelo discriminativo y no generativo. Tampoco se aportan métricas fuera del dominio WikiANN ni latencias medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 735 MB (183,8 M × 4 bytes); en FP16/BF16 unos 368 MB; en INT8 unos 184 MB. Con activaciones, tokenizador y overhead del runtime, una estimación práctica de consumo es de 1 a 2 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. El modelo cabe sin problema en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 o H100; el uso de GPU de gama alta solo aporta ventaja en throughput por lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente. También es viable la inferencia en CPU para volúmenes moderados.
- Opciones de despliegue: HuggingFace Transformers con PyTorch es la vía documentada oficialmente (el ejemplo de la model card usa `RobertaForTokenClassification.from_pretrained`). Es exportable a ONNX Runtime y TorchScript para reducir latencia. No se documenta soporte específico en vLLM, TGI, llama.cpp u Ollama, herramientas orientadas principalmente a modelos generativos y no a token classification sobre encoders.
- Restricción de integración: es obligatorio cargar el tokenizador `mursideaki/hecemen-tokenizer-unigram-128k` mediante SentencePiece. Usar el tokenizador de RoBERTa estándar produciría identificadores de token incompatibles con la matriz de embeddings.
- Latencia y throughput: no disponibles en la información proporcionada. No se han publicado mediciones de tokens por segundo ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1-macro WikiANN TR | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Latensis NER TR | 183,8 M | No disponible (ejemplo a 128 tokens) | 0,9429 | MIT | safetensors | HuggingFace, 0 descargas |
| BERTurk (referencia citada en la model card) | No disponible en la informacion proporcionada | No disponible | 0,9522 | No disponible en la informacion proporcionada | No disponible | No disponible |
| Otros modelos NER en turco | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card únicamente compara contra BERTurk y solo en F1-macro; no se detallan parámetros, contexto ni licencia de ese modelo de referencia en la información proporcionada. No se dispone de datos suficientes para una comparativa más amplia con alternativas como los modelos NER turcos basados en BERT o XLM-R publicados en HuggingFace.

## Limitaciones y advertencias

- Cobertura de entidades reducida: solo reconoce persona, organización y localización. No hay etiquetas para fechas, cantidades, productos, obras ni la clase MISC habitual en otros esquemas NER.
- Rendimiento inferior a la referencia declarada: con 0,9429 de F1-macro queda 0,0093 puntos por debajo de BERTurk (0,9522) en WikiANN Turkish. En la práctica, esto implica más errores en los límites de las entidades.
- Dominio de entrenamiento estrecho: el ajuste se realizó únicamente sobre 20.000 ejemplos de WikiANN Turkish, un corpus de estilo enciclopédico y noticioso. El rendimiento puede degradarse de forma notable en textos coloquiales, jerga, redes sociales, dominios técnicos o documentos con formatos atípicos.
- Longitud de secuencia: el ejemplo oficial recorta la entrada a 128 tokens (`MAX_LENGTH = 128`). No se documenta la longitud máxima real soportada por el modelo base, por lo que procesar documentos largos requiere segmentación previa con el riesgo de cortar entidades.
- Dependencia de un tokenizador no estándar: usar cualquier tokenizador distinto de Hecemen Unigram 128k rompe la correspondencia de identificadores. Esto complica la integración en frameworks que asumen tokenizadores estándar.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, geográfico o de género. Al entrenar sobre WikiANN, el modelo hereda la sobrerrepresentación de entidades presentes en Wikipedia turca.
- Alucinación: al ser un modelo discriminativo de etiquetado, no genera texto libre, por lo que el riesgo clásico de alucinación no aplica. El riesgo equivalente es la asignación de etiquetas incorrectas o espurias, especialmente en texto fuera de dominio.
- Validación externa nula: el repositorio registra 0 descargas y 0 likes, y los resultados publicados proceden únicamente de la model card del autor. No hay evidencia independiente que reproduzca las cifras.
- Licencia: MIT permite uso comercial, modificación y redistribución sin restricciones relevantes, siempre conservando el aviso de copyright. No se detectan cláusulas de uso aceptable adicionales.
- Idioma: exclusivamente turco. No se declara ningún otro idioma soportado y no se recomienda su uso en textos multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mursideaki/latensis-ner-tr
- Modelo base Latensis RoBERTa Base: https://huggingface.co/mursideaki/latensis-roberta-base-tr
- Tokenizador Hecemen Unigram 128k: https://huggingface.co/mursideaki/hecemen-tokenizer-unigram-128k
- Modelo companion de sentimiento: https://huggingface.co/mursideaki/latensis-sentiment-tr
- Modelo companion de inferencia textual (RTE): https://huggingface.co/mursideaki/latensis-rte-tr
- Modelo companion de similitud semántica (STS): https://huggingface.co/mursideaki/latensis-sts-tr
- Paper, blog o repositorio adicional del autor: no disponible (las búsquedas web realizadas no devolvieron resultados relevantes sobre el modelo)
