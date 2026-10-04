# AbdelrahmanAkl/NewsNER-DistilBERT

## Resumen

NewsNER-DistilBERT es un modelo de reconocimiento de entidades nombradas (NER) en ingles obtenido por ajuste fino de `distilbert-base-uncased` sobre el corpus CoNLL-2003. Lo publica AbdelrahmanAkl como parte del proyecto NewsNER-AI, cuyo objetivo es ofrecer una alternativa Transformer ligera para extraer personas (PER), organizaciones (ORG), localizaciones (LOC) y entidades miscelaneas (MISC) de texto periodistico en ingles.

El modelo resuelve una tarea de clasificacion a nivel de token: recibe una frase o parrafo y devuelve cada mencion de entidad con su etiqueta y una puntuacion de confianza. Con 65.197.833 parametros totales y un repositorio de 0,3 GB, esta pensado para inferencia economica en CPU o GPU de gama baja, donde un BERT-base resultaria mas costoso sin una ganancia clara para este dominio.

Su relevancia practica esta en el pipeline completo que acompana al checkpoint: evaluacion a nivel de entidad, comparacion con baselines (reglas y spaCy) y una aplicacion Streamlit desplegada. El autor reporta un F1 global de 88,79% en el conjunto de test de CoNLL-2003, frente al 57,19% de spaCy Medium. El modelo no declara licencia, idiomas soportados ni pipeline en los metadatos de HuggingFace, y el repositorio registra 0 descargas y 0 likes en la fecha de creacion indicada (2026-10-04).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT, encoder transformer bidireccional destilado de BERT, con cabeza de clasificacion de tokens (token classification). 6 capas y 768 dimensiones ocultas segun la arquitectura estandar de `distilbert-base-uncased` (no detallado en la model card) |
| Parametros totales | 65.197.833 (dato de los safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens, limite de posiciones de `distilbert-base-uncased`; no se indica explicitamente en la model card |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; al ser un transformer estandar admite conversion a ONNX/INT8 con herramientas externas, sin validacion por parte del autor |
| Idiomas soportados | Ingles (entrenado y evaluado sobre noticias en ingles). Los metadatos de HuggingFace no declaran idioma |
| Licencia | No disponible |
| Formato de pesos | safetensors (tag `safetensors`), con `config.json` y tokenizer asociado en el repositorio |
| Tarea | Named Entity Recognition (token classification) |
| Etiquetas de entidad | PER, ORG, LOC, MISC |
| Dataset de entrenamiento | CoNLL-2003 (14.041 train / 3.250 validation / 3.453 test) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La base es DistilBERT, una version reducida de BERT creada mediante destilacion de conocimiento, que conserva la mayor parte de la comprension del lenguaje del modelo profesor con menor tamano y menor coste de computo. El proceso de preentrenamiento de DistilBERT original usa un objetivo triple: perdida de modelado de lenguaje, perdida de destilacion (con temperatura sobre las probabilidades del profesor) y perdida de distancia coseno sobre los estados ocultos. Sobre ese encoder se anade una cabeza de clasificacion por token para predecir etiquetas BIO de entidades. El checkpoint final tiene 65,2 M de parametros, coherente con `distilbert-base-uncased` mas la cabeza de clasificacion.

El ajuste fino se realizo exclusivamente sobre CoNLL-2003, un corpus de articulos de agencia en ingles anotados con personas, organizaciones, localizaciones y entidades miscelaneas. El pipeline descrito por el autor comprende tokenizacion con el tokenizer de DistilBERT, alineacion de las etiquetas a nivel de palabra con los subtokens, ajuste fino para clasificacion de tokens, evaluacion a nivel de entidad (precision, recall y F1) y comparacion con baselines de reglas y de spaCy. La model card no publica hiperparametros de entrenamiento (epocas, learning rate, tamanio de lote, optimizador), ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de clasificacion), ni el numero de tokens totales vistos; esos datos no estan disponibles.

## Capacidades

- Extraccion de entidades nombradas en texto periodistico en ingles con cuatro categorias: PER, ORG, LOC y MISC.
- Clasificacion a nivel de token con puntuacion de confianza por entidad, expuesta por la aplicacion desplegada y por el pipeline de Transformers.
- Agregacion de subtokens en palabras completas (`aggregation_strategy="simple"` en el pipeline), lo que devuelve menciones listas para consumo.
- Rendimiento desglosado por tipo de entidad: F1 de 94,76% en PER, 91,45% en LOC, 85,99% en ORG y 76,14% en MISC.
- Integracion sencilla en pipelines de NLP como paso de preprocesado (transformers, spaCy, Haystack u orquestadores propios).
- No es un modelo generativo: no produce texto, no tiene modo de razonamiento explicito, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (ni vision ni audio) ni multilingues: esta entrenado solo con texto en ingles.
- No realiza resolucion de correferencia ni reconocimiento de entidades anidadas: solo etiqueta menciones con las cuatro categorias del esquema CoNLL.

## Casos de uso

- Analisis de articulos de prensa a escala: procesar flujos diarios de noticias en ingles y extraer automaticamente personas, organizaciones y lugares mencionados; al tener un limite de 512 tokens, los articulos largos se trocean por parrafos y se agregan resultados por documento.
- Construccion de grafos de conocimiento: usar las menciones PER/ORG/LOC como nodos y la coocurrencia en el mismo articulo como aristas, para alimentar bases de datos de grafos orientadas a analisis editorial.
- Busqueda y recuperacion basada en entidades: indexar documentos enriquecidos con entidades extraidas y permitir consultas filtradas del tipo "noticias donde aparezca esta organizacion en esta localizacion".
- Enriquecimiento de metadatos en pipelines RAG: convertir las entidades en campos estructurados de un almacen vectorial o de un motor de busqueda, de modo que la recuperacion combine similitud semantica con filtros de entidad exactos.
- Monitorizacion de medios y alertas de marca: detectar apariciones de una organizacion concreta en cobertura informativa, con la ventaja de que el modelo distingue ORG de LOC y PER, reduciendo falsos positivos por nombre ambiguo.
- Preanotacion asistida para equipos de anotacion: generar etiquetas automaticas sobre corpus periodisticos nuevos y pasar el resultado a una herramienta de revision humana, reduciendo el esfuerzo de etiquetado manual.
- Preprocesado para analitica de noticias: calcular rankings de entidades mas mencionadas, cobertura por region o evolucion temporal de menciones a organizaciones a partir del texto bruto.
- Clasificacion y enrutado documental: usar las entidades detectadas como senal auxiliar para encaminar documentos a colas de revision tematica (por ejemplo, piezas con muchas menciones ORG a un equipo de economia).

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluacion a nivel de entidad sobre el test set de CoNLL-2003:

| Metrica | Valor |
|---|---|
| Precision | 87,92% |
| Recall | 89,68% |
| F1 | 88,79% |

Desglose por tipo de entidad:

| Entidad | Precision | Recall | F1 |
|---|---|---|---|
| PER | 95,02% | 94,50% | 94,76% |
| ORG | 84,28% | 87,78% | 85,99% |
| LOC | 91,84% | 91,07% | 91,45% |
| MISC | 72,82% | 79,77% | 76,14% |

Comparacion con baselines reportada en la model card:

| Enfoque | F1 |
|---|---|
| Basado en reglas | 10,15% |
| spaCy Small | 56,22% |
| spaCy Medium | 57,19% |
| DistilBERT ajustado (NewsNER-DistilBERT) | 88,79% |

No se han publicado en la informacion disponible resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo de clasificacion de tokens.

## Requisitos de hardware

- Pesos en memoria: aproximadamente 261 MB en FP32, 130 MB en FP16/BF16 y 65 MB en INT8, a partir de los 65,2 M de parametros.
- VRAM estimada para inferencia: menos de 1 GB incluyendo activaciones y overhead del runtime; suficiente cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) o GPU de servidor de gama baja/media (T4, L4). Modelos como A100 o H100 no aportan ventaja relevante para este tamano y resultan desproporcionados.
- Inferencia en CPU: viable en produccion para volumenes moderados, dado el tamano del modelo y el hecho de que el encoder procesa secuencias de 512 tokens como maximo.
- Despliegue: pipeline de `transformers` (`token-classification`), exportacion a ONNX Runtime mediante Optimum, TorchScript, servicio HTTP propio con FastAPI/Uvicorn, NVIDIA Triton, o integracion en spaCy/Haystack como componente de NER.
- No aplican vLLM ni llama.cpp/Ollama: son herramientas orientadas a generacion de texto y no hay conversion GGUF publicada.
- Latencia y throughput: no disponibles. El autor no publica medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 CoNLL-2003 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NewsNER-DistilBERT | 65,2 M | 512 tokens (base) | 88,79% | no disponible | safetensors en HuggingFace |
| spaCy Small (baseline del autor) | no disponible | no disponible | 56,22% | licencia de spaCy (no detallada aqui) | paquete de spaCy |
| spaCy Medium (baseline del autor) | no disponible | no disponible | 57,19% | licencia de spaCy (no detallada aqui) | paquete de spaCy |
| Baseline basado en reglas (del autor) | no aplica | no aplica | 10,15% | no disponible | implementacion propia del autor |
| Familia BERT-base ajustada a NER (por ejemplo, esquemas tipo `bert-base-NER`) | ~110 M (dato de arquitectura BERT-base, no verificado en la informacion proporcionada) | 512 tokens | no disponible en la informacion proporcionada | habitualmente Apache 2.0 o MIT, no verificable aqui | safetensors/PyTorch en HuggingFace |

La comparacion con BERT-base no puede cuantificarse con los datos disponibles: la model card no incluye resultados de otros transformers, solo de reglas y spaCy. La ventaja declarada de NewsNER-DistilBERT frente a estos ultimos es de mas de 30 puntos de F1 con un coste de inferencia bajo.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre noticias en ingles (CoNLL-2003, prosa de agencia). El propio autor advierte de que el rendimiento puede degradarse en documentos medicos, legales, informes financieros, redes sociales, conversaciones informales y texto altamente tecnico.
- Categoria MISC debil: F1 de 76,14%, muy por debajo de PER (94,76%) y LOC (91,45%); sus predicciones deben tratarse con cautela adicional.
- Ventana de contexto de 512 tokens: los documentos largos requieren troceado, lo que puede partir entidades en los limites de fragmento y perder menciones o duplicarlas al agregar resultados.
- Solo ingles: no hay soporte multilingue declarado ni evidencia de evaluacion en otros idiomas.
- Sin licencia declarada: no se especifican condiciones de uso comercial. Antes de integrarlo en un producto es necesario contactar con el autor o asumir el riesgo legal de una licencia no definida; el corpus CoNLL-2003 tambien tiene sus propias condiciones de uso.
- Riesgo de alucinacion en el sentido de falsos positivos y negativos: el modelo etiqueta menciones con un 11,21% de margen de error en F1 global, y puede inventar entidades en texto fuera de distribucion o fragmentar nombres compuestos.
- Sesgos heredados del corpus: CoNLL-2003 procede de noticias de agencia de finales de los anos noventa, con la cobertura geografica, tematica y de nombres propios de esa epoca; esto puede sesgar el reconocimiento hacia determinados paises, idiomas de origen de los nombres y tipos de organizacion.
- No resuelve correferencia ni entidades anidadas, y no ofrece normalizacion de entidades (por ejemplo, enlazado a Wikidata), por lo que dos menciones de la misma organizacion aparecen como entidades separadas.
- Uso en decisiones de alto impacto desaconsejado: el autor recomienda validar las predicciones antes de emplearlas en sistemas automatizados con consecuencias relevantes, y recuerda los riesgos de privacidad al procesar documentos sensibles.
- Falta de trazabilidad de entrenamiento: no se publican hiperparametros, semillas ni numero de tokens vistos, lo que dificulta reproducir el resultado de 88,79% de F1.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion por terceros ni de validacion independiente de las metricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbdelrahmanAkl/NewsNER-DistilBERT
- Repositorio GitHub del proyecto: https://github.com/AbdelrhmanAkl/News-NER-Entity-Recognition
- Demo en vivo (Streamlit): https://news-ner-entity-recognition.streamlit.app/
- Perfil del autor en GitHub: https://github.com/AbdelrhmanAkl
- Documentacion de DistilBERT en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/distilbert.md
- Vision general de DistilBERT: https://www.geeksforgeeks.org/nlp/distilbert-in-natural-language-processing/
- Paper relacionado encontrado en la busqueda (NewsBERT, destilacion para noticias): https://arxiv.org/html/2102.04887v2
- Paper original de CoNLL-2003: no disponible en la informacion proporcionada.
