# alighabusaleh/CLASP-Ar-Arabic-Stance

## Resumen

CLASP-Ar es un modelo de deteccion de postura (stance detection) en arabe desarrollado por TTLab (Goethe University Frankfurt) —Bhuvanesh Verma, Ali Abusaleh y Alexander Mehler— y publicado por el usuario alighabusaleh. Dado un texto arabe (tipicamente un tuit) y un objetivo o tema, el modelo decide si el autor se posiciona a favor, en contra o de forma neutra respecto a ese objetivo. En lugar de anadir una cabeza de clasificacion, recurre a una formulacion de tipo cloze: el objetivo, una etiqueta de sentimiento y el texto se insertan en una plantilla con un token `[MASK]`, y la prediccion se restringe a tres tokens verbalizadores en arabe.

El modelo parte de asafaya/bert-large-arabic, un encoder BERT-large de 336.689.408 parametros, entrenado en dos fases sobre datos de la tarea compartida StanceEval-2026 y sobre el corpus MawqifV2. Es la submission oficial de TTLab a StanceEval-2026 (SIGARAB, ArabicNLP 2026), con resultados declarados de Favg2 = 71,36 en Track 1 (objetivos vistos en entrenamiento) y 74,14 en Track 2 (objetivos no vistos).

Su relevancia es doble: por un lado, demuestra que el prompt learning de tipo cloze con un modelo enmascarado pequeno puede competir en una tarea de clasificacion multilingue sin cabeza dedicada ni ensemble; por otro, es un recurso directamente utilizable para monitorizacion de opinion en redes sociales arabes, un dominio con menos herramientas abiertas que el ingles. La contrapartida es su dependencia de un clasificador de sentimiento auxiliar que no forma parte de la release y su evaluacion restringida a un conjunto de datos concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional BERT-large con cabeza de masked language modeling (MLM), empleada como clasificador prompt-based de tipo cloze |
| Parametros totales | 336.689.408 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (el ejemplo de uso trunca con `max_length=512`) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Arabe (arabe estandar moderno y texto dialectal de redes sociales) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | asafaya/bert-large-arabic |
| Tarea (pipeline) | text-classification (internamente fill-mask) |
| Etiquetas de salida | Favor, Against, None |
| Verbalizadores | مع (Favor), ضد (Against), وسط (None) |
| Tamano del repositorio | 1,3 GB |
| Inferencia alojada en HF | No (`inference: false`) |

## Arquitectura y entrenamiento

La arquitectura es un BERT-large estandar (encoder bidireccional, 24 capas, 336.689.408 parametros) inicializado desde asafaya/bert-large-arabic y utilizado sin cabeza de clasificacion nueva: se leen los logits MLM en la posicion `[MASK]` y se restringen a los tres tokens verbalizadores, que se normalizan con softmax para obtener probabilidades de clase. Cada entrada se renderiza con la plantilla `Target:{target}` / `Sentiment:{sentiment}` / `Stance: [MASK]` / `Text: {text}`. El preprocesado de texto elimina diacriticos y tatweel, borra caracteres no arabes (conservando digitos), limita a dos las repeticiones de tres o mas caracteres consecutivos y colapsa espacios; `inference.py` lo aplica automaticamente.

El entrenamiento se hizo en dos etapas sobre el mismo formato de prompt. La etapa 1 (entrenamiento intermedio de stance) consistio en 2 epocas sobre los datos de la tarea de stance de StanceEval-2026: 11.500 ejemplos y 17 objetivos (Favor 4.980 / Against 4.452 / None 2.068). La etapa 2 (fine-tuning) empleo 8 epocas sobre todo MawqifV2 train+dev: 4.121 ejemplos y 3 objetivos (Favor 2.528 / Against 1.201 / None 392), con dos ajustes para la clase minoritaria `None`: sobremuestreo de `None` hasta igualar la clase mayoritaria usando ejemplos `None` reales de ExaASC (no sinteticos por permutacion de objetivos) y pesos de clase por frecuencia inversa en la entropia cruzada. Como hiperparametros documentados figuran AdamW con weight decay 0,01, learning rate 2e-5 en la etapa 1 y 1e-5 en la etapa 2, decaimiento layer-wise del learning rate de 0,95, congelacion de embeddings y de las 6 capas inferiores del encoder, y scheduler lineal. El resto de la tabla de hiperparametros queda truncado en la model card.

La innovacion tecnica destacable es el propio enfoque CLASP: recastear la deteccion de postura como MLM cloze con verbalizadores de una sola palabra, evitando cabeza de clasificacion, multitask learning y ensembles. El slot `Sentiment:` se rellena siempre con la etiqueta predicha (Negative / Neutral / Positive) de un clasificador de sentimiento MARBERTv2 afinado aparte —nunca con sentimiento gold—, de modo que entrenamiento y test comparten la misma fuente de caracteristicas.

## Capacidades

- Clasificacion de postura en tres clases (`Favor`, `Against`, `None`) de un texto arabe respecto a un objetivo dado.
- Devuelve distribuciones de probabilidad sobre las tres clases mediante `predict_proba`, con el orden [Against, Favor, None].
- Procesamiento de texto de redes sociales: arabe estandar moderno y variantes dialectales, con normalizacion de diacriticos, tatweel, repeticiones y caracteres no arabes.
- Manejo de objetivos cortos, habitualmente en ingles tal y como aparecen en los datos de entrenamiento (por ejemplo `Covid Vaccine`, `Women empowerment`, `Digital Transformation`, `Women Driving`).
- Generalizacion a objetivos no vistos, evidenciada por el rendimiento en Track 2 (74,14 de Favg2).
- Inferencia por lotes a traves de la clase `StanceClassifier` incluida en el repositorio.
- No dispone de tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No tiene capacidades de vision, audio ni modo de razonamiento explicito (`thinking mode`).
- No es un modelo generativo de texto libre: su uso practico se limita a la clasificacion con la plantilla cloze disenada.

## Casos de uso

- Monitorizacion de opinion publica en redes sociales arabes: dado un conjunto de tuits y un objetivo de interes (una politica publica, un partido, una figura institucional), el modelo etiqueta cada mensaje como a favor, en contra o neutro, permitiendo construir series temporales de polaridad.
- Social listening de marca: una empresa con presencia en mercados araboparlantes puede medir la postura hacia su marca o hacia un producto concreto en tiempo real, alimentando paneles de reputacion.
- Seguimiento de campanas de salud publica: con objetivos como `Covid Vaccine`, el modelo permite cuantificar la proporcion de mensajes contrarios a la vacunacion en una region o franja temporal, informacion util para ajustar campanas de comunicacion.
- Investigacion en ciencias sociales y argumentacion: analisis de debates sobre temas como `Women Driving` o `Women empowerment` usando MawqifV2 y datos comparables, con la ventaja de que el pipeline es reproducible y la licencia Apache-2.0 permite redistribuir resultados.
- Filtrado previo en pipelines de moderacion: clasificar el tono de grandes volumenes de comentarios respecto a un tema para priorizar la revision humana de los mensajes con postura claramente contraria.
- Analisis electoral y de discurso politico: medir la postura hacia candidatos o coaliciones en corpus de Twitter/X arabes, segmentando por dialecto o por pais.
- Evaluacion comparativa de metodos de NLP arabe: al ser una implementacion de referencia de prompt learning cloze, sirve como baseline en experimentos academicos frente a clasificadores con cabeza dedicada o modelos multilingues.
- Anotacion asistida de corpus: pre-etiquetar grandes colecciones de textos arabes para acelerar el trabajo de anotadores humanos, con revision posterior dado que la metrica declarada esta en torno al 71-74 por ciento de Favg2.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. La metrica es Favg2, el macro-F1 calculado solo sobre `Favor` y `Against` (la clase `None` se excluye de la media). Los resultados figuran como no verificados (`verified: false`).

| Conjunto de test | Metrica | Valor |
|---|---|---|
| StanceEval-2026 Track 1 (objetivos vistos) | Favg2 | 0,7136 |
| StanceEval-2026 Track 2 (objetivos no vistos) | Favg2 | 0,7414 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) para este modelo, ni comparaciones numericas con sistemas alternativos de la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,35 GB en FP32 (336,7 M de parametros), unos 0,7 GB en FP16/BF16 y del orden de 0,35 GB en int8. El repositorio ocupa 1,3 GB porque los pesos estan en safetensors a precision completa.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4060 o RTX 4090 cubren el modelo con holgura y permiten lotes grandes; A100 y H100 no aportan ventaja significativa por el tamano reducido del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida. La inferencia en CPU es viable para lotes pequenos.
- Opciones de despliegue: `transformers` con PyTorch (via `BertForMaskedLM` o la clase `StanceClassifier` del repositorio), exportacion a ONNX Runtime o TorchScript para produccion, y servicios de inferencia genericos (TorchServe, FastAPI). No hay confirmacion de soporte en vLLM, llama.cpp/Ollama ni TGI, formatos orientados a modelos generativos o a GGUF que aqui no aplican.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de ejemplos por segundo. Al tratarse de un encoder de 336 M de parametros con secuencias truncadas a 512 tokens, el coste por ejemplo es bajo y el cuello de botella previsible es el preprocesado y el clasificador de sentimiento auxiliar.

## Comparativa con modelos similares

No se dispone de resultados de Favg2 de los modelos alternativos sobre StanceEval-2026 en la informacion proporcionada, por lo que la comparacion de rendimiento no puede establecerse numericamente.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento en stance arabe |
|---|---|---|---|---|---|
| CLASP-Ar | 336.689.408 | 512 tokens | Prompt cloze sobre BERT-large arabe | Apache-2.0 | Favg2 0,7136 / 0,7414 (declarado, no verificado) |
| MARBERTv2 | No disponible | No disponible | Encoder BERT entrenado con 128 GB de tuits arabes | No disponible | No disponible |
| AraBERTv2 | No disponible | No disponible | Encoder BERT para arabe estandar | No disponible | No disponible |
| CAMeLBERT | No disponible | No disponible | Encoder BERT multidioma/arabe | No disponible | No disponible |

Nota: MARBERTv2 es relevante en esta comparativa porque el propio CLASP-Ar depende de un clasificador de sentimiento afinado sobre MARBERTv2 para rellenar el slot `Sentiment:` durante entrenamiento y test. El checkpoint de ese clasificador de sentimiento no se incluye en esta release.

## Limitaciones y advertencias

- Dependencia de un componente no liberado: el slot `Sentiment:` debe rellenarse con la etiqueta predicha por un clasificador de sentimiento arabe de 3 clases (originalmente MARBERTv2). Ese modelo no forma parte de la release; cualquier clasificador de 3 clases puede ocupar su lugar, pero dejarlo vacio queda fuera de distribucion y no ha sido evaluado.
- La metrica declarada (Favg2) excluye la clase `None` de la media, de modo que el rendimiento real sobre la clase neutra no queda reflejado en las cifras publicadas. La clase `None` era minoritaria en los datos de entrenamiento (2.068 ejemplos en la etapa 1 y 392 en la etapa 2) y se compenso con sobremuestreo y pesos de clase.
- Datos de entrenamiento pequenos y sesgados a pocos objetivos: 11.500 ejemplos con 17 objetivos en la etapa 1 y 4.121 ejemplos con solo 3 objetivos en la etapa 2. El comportamiento sobre temas alejados de ese conjunto es incierto.
- Los objetivos se esperan como frases cortas, normalmente en ingles tal y como aparecen en los datos de entrenamiento. Objetivos en arabe o formulados de otra manera pueden degradar el rendimiento.
- Sesgo de dominio: el modelo se entrena con texto de redes sociales arabes, con la distribucion dialectal y tematica de esos corpus, lo que puede trasladar sesgos geograficos, politicos o de genero presentes en los datos.
- Doble fuente de sesgo por el pipeline: los errores del clasificador de sentimiento auxiliar se propagan a la prediccion final de postura.
- Riesgo de alucinacion acotado por ser un modelo discriminativo (no genera texto libre), pero puede asignar etiquetas con alta confianza en entradas fuera de dominio o con preprocesado distinto al de entrenamiento.
- Resultados no verificados: los valores de Favg2 estan marcados como `verified: false` en el model-index, es decir, son declaraciones del autor y no han sido reproducidos de forma independiente en la informacion consultada.
- Licencia: Apache-2.0 permite uso comercial y modificacion con atribucion, pero la licencia del clasificador de sentimiento auxiliar que se decida emplear es independiente y debe verificarse por separado.
- La model card declara `inference: false`, por lo que el modelo no esta disponible en la Inference API alojada de Hugging Face y requiere despliegue propio.
- La tabla de hiperparametros de la model card esta truncada, por lo que no se conocen el tamano de lote, el numero total de pasos ni algunos detalles de regularizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alighabusaleh/CLASP-Ar-Arabic-Stance
- Codigo de la submission: https://github.com/aliabusaleh/ArabicStanceDetection_StanceEval2026
- Modelo base: https://huggingface.co/asafaya/bert-large-arabic
- Tarea compartida StanceEval-2026: https://stanceeval.github.io/
- Track 1 en Codabench (objetivos vistos): https://www.codabench.org/competitions/16332/
- Anuncio de publicacion en Text Technology Lab: https://www.texttechnologylab.org/2026/09/14/new-publications-at-arabicnlp-2026-shared-tasks/
- Listado de publicaciones de Text Technology Lab: https://www.texttechnologylab.org/publications/
- Publicacion en LinkedIn del autor: https://www.linkedin.com/posts/alighabusaleh_arabicnlp-ml-argumentmining-activity-7505552815222706176-atrL
