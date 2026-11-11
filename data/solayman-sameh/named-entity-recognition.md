# Solayman-Sameh/named-entity-recognition

## Resumen

El modelo `Solayman-Sameh/named-entity-recognition` es un ajuste fino de DistilBERT (variante *cased*) para reconocimiento de entidades nombradas (NER) en inglés, entrenado sobre el corpus CoNLL-2003. Lo desarrolla Solayman-Sameh y clasifica cada token en cuatro categorias de entidad: persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC). Es un modelo de clasificacion de tokens, no un modelo generativo, por lo que su funcion es etiquetar secuencias de texto, no producir lenguaje.

El modelo parte de la arquitectura DistilBERT, una destilacion de BERT con 6 capas y 65.197.833 parametros totales, lo que lo situa en la gama ligera y permite inferencia en CPU y GPU de consumo. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors. La licencia es MIT, lo que facilita su uso comercial sin restricciones adicionales.

Su relevancia practica reside en el rendimiento reportado por el autor: un F1 estricto de 90,18 % en test con CoNLL-2003 (evaluacion con `seqeval` en modo IOB2 estricto) y un macro F1 de validacion de 93,92 %. Segun la model card, supera en la comparativa arquitectonica del autor a alternativas LSTM, BiLSTM y BiLSTM+CRF. Es, por tanto, una opcion compacta y rapida para tareas de extraccion de entidades en ingles dentro de pipelines de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT), *cased* |
| Parametros totales | 65.197.833 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens de entrada; el dato no se explicita en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien compatible con PyTorch via `transformers`) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder de tipo DistilBERT, la version destilada de BERT con 6 capas, 65 millones de parametros y vocabulario *cased*. Sobre esta base se anade una cabeza de clasificacion de tokens (`AutoModelForTokenClassification`) con etiquetas en esquema IOB2 para las cuatro categorias CoNLL-2003 (PER, ORG, LOC, MISC). El modelo esta disenado exclusivamente para etiquetado de secuencias, no para generacion.

El entrenamiento se realizo mediante ajuste fino supervisado sobre el dataset CoNLL-2003, un corpus de noticias en ingles con anotaciones de entidades. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de hiperparametros ni si se aplicaron tecnicas de regularizacion adicionales. Tampoco se documenta el uso de RLHF o DPO, algo esperable en un modelo discriminativo de este tipo. El autor menciona una comparativa arquitectonica frente a LSTM, BiLSTM y BiLSTM+CRF, en la que este ajuste de DistilBERT obtuvo la mejor puntuacion, pero los detalles de dicha comparativa no se incluyen en la informacion disponible.

## Capacidades

- Reconocimiento de entidades nombradas en ingles con cuatro categorias: PER (persona), ORG (organizacion), LOC (localizacion) y MISC (miscelanea, como nacionalidades o eventos).
- Clasificacion a nivel de token con esquema IOB2 y agregacion de entidades mediante `aggregation_strategy="simple"` en el pipeline de Hugging Face.
- Extraccion de entidades en frases y parrafos cortos (hasta el limite de contexto del encoder, no documentado explicitamente).
- Integracion directa con la libreria `transformers` mediante `pipeline("ner")` o `AutoModelForTokenClassification`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni comportamiento agentico: es un modelo puramente discriminativo.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Extraccion de entidades en noticias y articulos: dado un texto en ingles, el modelo etiqueta personas, organizaciones y lugares, lo que permite construir indices de entidades para motores de busqueda o sistemas de recomendacion de contenido.
- Enriquecimiento de bases de datos CRM: procesar correos y notas de clientes para detectar empresas y localizaciones y poblar campos estructurados de forma automatica.
- Anonimizacion y seudonimizacion de datos personales: detectar menciones de personas (PER) y organizaciones (ORG) en documentos antes de almacenarlos o compartirlos, como paso previo al cumplimiento de normativas de privacidad.
- Analisis de sentimiento y opinion a nivel de entidad: combinar la salida NER con un clasificador de sentimiento para atribuir opiniones a organizaciones o productos concretos en resenas y redes sociales.
- Construccion de grafos de conocimiento: extraer relaciones entre entidades detectadas (por ejemplo, persona-organizacion) para alimentar pipelines de extraccion de relaciones y grafos.
- Preprocesamiento en pipelines de RAG o busqueda semantica: etiquetar entidades en documentos para mejorar la recuperacion y el filtrado por entidad antes de la generacion.
- Prototipado rapido y demos interactivas: el tamano reducido (0,3 GB) y la licencia MIT permiten desplegarlo en una demo Gradio o en un servicio ligero sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, evaluados con `seqeval` en modo IOB2 estricto sobre CoNLL-2003:

| Entidad | Precision | Recall | F1 estricto |
|---|---:|---:|---:|
| Global | 89,39 % | 90,98 % | 90,18 % |
| Persona (PER) | 95,34 % | 95,03 % | 95,18 % |
| Organizacion (ORG) | 86,81 % | 88,75 % | 87,77 % |
| Localizacion (LOC) | 92,51 % | 92,23 % | 92,37 % |
| Miscelanea (MISC) | 78,43 % | 80,57 % | 79,49 % |

- Macro F1 de validacion: 93,92 %.
- F1 estricto de test: 90,18 %.

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de referencia (por ejemplo, BERT-base, RoBERTa o DeBERTa) en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,3 GB de pesos, con picos de memoria de alrededor de 1 GB incluyendo activaciones para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona correctamente en RTX 3060, RTX 4060, RTX 4090, T4, A10, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (pipeline y `AutoModelForTokenClassification`), TorchScript, ONNX Runtime; compatible con servidores de inferencia que soporten modelos de `transformers` como TGI o vLLM para token-classification (no verificado en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 CoNLL-2003 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Solayman-Sameh/named-entity-recognition (DistilBERT) | 65,2 M | no disponible | 90,18 % (test estricto) | MIT | Hugging Face |
| dslim/bert-base-NER (referencia habitual) | ~110 M | 512 | no disponible en esta ficha | MIT | Hugging Face |
| LSTM / BiLSTM / BiLSTM+CRF (comparativa del autor) | no disponible | no disponible | inferior segun el autor, sin cifras publicadas | no disponible | no disponible |

La comparativa con `dslim/bert-base-NER` se incluye como referencia de categoria (NER en ingles sobre CoNLL-2003 con BERT-base), pero no se dispone de sus metricas en la informacion proporcionada; no se deben asumir valores. El autor afirma que su ajuste supero a LSTM, BiLSTM y BiLSTM+CRF en su comparativa, pero no se publican las cifras concretas de esos modelos.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; su uso en otros idiomas producira resultados poco fiables.
- Entrenado sobre CoNLL-2003, un corpus de noticias: puede degradarse en dominios muy distintos (texto clinico, legal, redes sociales, jerga tecnica).
- La categoria MISC es la mas debil (F1 estricto de 79,49 %), con mayor riesgo de errores en nacionalidades, eventos y entidades ambiguas.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la deteccion de entidades; conviene validar con datos propios.
- Posibles sesgos heredados del corpus de noticias (predominio de entidades occidentales y de paises concretos).
- La longitud de contexto no se documenta explicitamente; el limite practico de DistilBERT es de 512 tokens, lo que obliga a fragmentar documentos largos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente por parte de la comunidad.
- No se documentan hiperparametros de entrenamiento ni la version exacta del checkpoint base de DistilBERT, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Solayman-Sameh/named-entity-recognition
- GitHub del proyecto (codigo, EDA, comparativa arquitectonica, demo Gradio): https://github.com/Solayman-Sameh/named-entity-recognition
- Dataset CoNLL-2003: no disponible enlace directo en la informacion proporcionada
- Paper de DistilBERT: no disponible enlace en la informacion proporcionada
