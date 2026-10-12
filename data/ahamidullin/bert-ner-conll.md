# ahamidullin/bert-ner-conll

## Resumen

bert-ner-conll es un modelo de clasificacion de tokens (reconocimiento de entidades nombradas, NER) publicado por el usuario ahamidullin en HuggingFace. Se trata de un fine-tuning del modelo de embeddings BAAI/bge-small-en-v1.5, un encoder transformer tipo BERT de 33.215.625 parametros, sobre un conjunto de datos que el propio autor no documenta (la model card indica "unknown dataset"; el nombre del repositorio sugiere un corpus CoNLL, pero no se confirma en ninguna parte de la informacion disponible).

El modelo tiene licencia MIT y se distribuye en formato safetensors con un tamano de repositorio de 0,1 GB, lo que lo situa en la categoria de modelos ligeros desplegables en CPU. Sus unicas metricas publicadas son las de validacion del propio entrenamiento: precision 0,8425, recall 0,8869, F1 0,8641, accuracy 0,9745 y loss 0,2386 tras 3 epocas.

Su relevancia practica es limitada pero clara: al ser un modelo de 33M de parametros derivado de un encoder pequeno, es adecuado para tareas de extraccion de entidades en pipelines de bajo coste y baja latencia, siempre que el dominio de uso coincida con el de entrenamiento. La ausencia de documentacion sobre dataset, idiomas y etiquetas, y el hecho de no haberse publicado resultados en el model-index (lista `results` vacia), obligan a validarlo antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT para clasificacion de tokens (token-classification), derivado de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.215.625 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 esta limitado a 512 tokens |
| Tipos de cuantizacion | No documentados por el autor. Solo se distribuyen pesos safetensors; al ser un modelo de 33M de parametros es convertible a int8, ONNX o GGUF con herramientas externas |
| Idiomas soportados | No disponible. El modelo base es de lengua inglesa y el nombre del repositorio apunta a un corpus CoNLL, pero la model card no declara idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 (fine-tuning) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un encoder transformer bidireccional de tipo BERT, reutilizado desde BAAI/bge-small-en-v1.5 y adaptado a clasificacion de tokens mediante una cabeza de etiquetado por token. No se documenta ninguna modificacion estructural, atencion lineal, decodificacion especulativa ni componente MoE: es un fine-tuning estandar supervisado. La model card esta generada automaticamente por el Trainer de HuggingFace y no aporta descripcion del modelo ni de sus datos.

Los hiperparametros declarados son: learning rate 2e-05, batch de entrenamiento y evaluacion de 16, seed 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal y 3 epocas (1.875 pasos totales, aproximadamente 625 pasos por epoca). No hay constancia de RLHF, DPO ni ninguna fase de alineacion posterior; tampoco se especifica la composicion del dataset, el numero de tokens de entrenamiento ni el esquema de etiquetas (BIO/BILUO). Las versiones de framework son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de tokens para reconocimiento de entidades nombradas: asignacion de etiquetas a cada token de la secuencia de entrada.
- Extraccion de entidades en texto, presumiblemente del esquema tipico de CoNLL (persona, organizacion, localizacion y miscelanea), aunque el esquema concreto no esta documentado.
- Inferencia ligera: 33M de parametros permiten ejecucion en CPU con latencias bajas en lotes pequenos.
- Integracion directa con la libreria transformers mediante `pipeline("token-classification")`, y con el ecosistema de entrenamiento (Trainer, safetensors).
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo "thinking", vision, audio, traduccion ni generacion de texto libre: es un encoder discriminativo, no un modelo generativo.
- Capacidades multilingues: no disponibles ni documentadas; el modelo base es de ingles.
- Salida apta para post-procesado programatico (agregacion de subtokens, offsets de caracteres), lo que facilita su uso en pipelines de extraccion de estructura.

## Casos de uso

- Extraccion de entidades en textos en ingles: el modelo etiqueta tokens y permite recuperar personas, organizaciones y localizaciones de articulos, informes o tickets, con precision declarada de 0,8425 y recall de 0,8869 en su conjunto de validacion.
- Preanonimizado de datos personales en pipelines de logging: deteccion de nombres y lugares antes de almacenar trazas o enviarlas a un sistema de observabilidad, siempre que se anada una capa adicional para identificadores como correos o telefonos, que el esquema documentado no cubre.
- Enriquecimiento de indices de busqueda (Elasticsearch, OpenSearch, Solr): indexacion de las entidades detectadas como campos adicionales para mejorar la recuperacion filtrada por organizacion o ubicacion.
- Preprocesado para construccion de grafos de conocimiento y RAG: alimentar pipelines que resuelven entidades a Wikidata o a un catalogo interno antes de generar respuestas con un LLM.
- Analisis de documentos financieros o legales en ingles: extraccion de razones sociales y jurisdicciones en contratos, facturas o informes, con revision humana dado el nivel de precision.
- Etiquetado asistido en proyectos de anotacion: preanotacion de corpus para que los anotadores corrijan en lugar de etiquetar desde cero, reduciendo coste por documento.
- Clasificacion y enrutado de correos o formularios: deteccion de la organizacion o ubicacion mencionada para asignar el caso al equipo correspondiente.
- Moderacion y monitorizacion de contenido en redes sociales: extraccion de menciones a organizaciones y lugares para paneles de analisis de tendencias.

## Benchmarks y rendimiento

El model-index del repositorio no contiene resultados (`results: []`), por lo que no hay benchmarks publicados en la informacion disponible. Las unicas cifras existentes son las metricas de validacion declaradas por el autor durante el entrenamiento:

| Metrica | Valor (epoca 3, validacion) |
|---|---|
| Loss | 0,2386 |
| Precision | 0,8425 |
| Recall | 0,8869 |
| F1 | 0,8641 |
| Accuracy | 0,9745 |

Evolucion durante el entrenamiento, segun la model card:

| Training loss | Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,9778 | 1.0 | 625 | 0,3844 | 0,7416 | 0,7930 | 0,7664 | 0,9583 |
| 0,3746 | 2.0 | 1250 | 0,2624 | 0,8341 | 0,8758 | 0,8544 | 0,9726 |
| 0,2760 | 3.0 | 1875 | 0,2386 | 0,8425 | 0,8869 | 0,8641 | 0,9745 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de test ciego sobre CoNLL-2003 u otro corpus estandar en la informacion disponible. No se deben extrapolar estas cifras de validacion a un rendimiento en test ni a otros dominios.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,13 GB de pesos en fp32 (33,2M de parametros), con un pico total por debajo de 1 GB incluyendo activaciones y tokenizer. Cabe holgadamente en cualquier GPU con 2-4 GB.
- GPU recomendadas: ninguna en concreto; el modelo funciona en CPU. Para lotes grandes, cualquier GPU moderna (T4, L4, RTX 3060 o superior) es mas que suficiente; A100 o H100 solo tendrian sentido para servir muchas replicas en paralelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en GPUs integradas o en CPU con extensiones AVX2.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportacion a ONNX Runtime para inferencia en CPU, TorchScript, o un servicio FastAPI propio. vLLM, TGI o llama.cpp no son necesarios y no aportan ventaja para un encoder de 33M; llama.cpp solo seria relevante si se convierte a GGUF, cosa que el autor no proporciona.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el tamano del modelo lo situa en el rango de milisegundos por secuencia corta en CPU moderna, pero no hay mediciones publicadas que lo confirmen.
- Almacenamiento: el repositorio completo ocupa 0,1 GB, con lo que el despliegue en contenedores es trivial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento declarado |
|---|---|---|---|---|---|
| ahamidullin/bert-ner-conll | 33,2M | No disponible (modelo base: 512 tokens) | MIT | safetensors | F1 0,8641 en validacion propia (dataset no documentado) |
| BAAI/bge-small-en-v1.5 (modelo base) | 33M | 512 tokens | MIT | safetensors | No es un modelo NER; orientado a embeddings y recuperacion |
| Alternativas NER de referencia (BERT base NER, spaCy, XLM-R NER) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone, en la informacion proporcionada, de resultados comparables de estos modelos sobre el mismo conjunto de evaluacion, por lo que cualquier comparacion de F1 seria especulativa. La diferencia relevante y verificable es de coste: 33M de parametros frente a los 110M de un BERT-base o los cientos de millones de un modelo multilingue, con la contrapartida de una capacidad de generalizacion presumiblemente menor.

## Limitaciones y advertencias

- Model card practicamente vacia: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" aparecen como "More information needed". No se puede verificar el dataset, el esquema de etiquetas ni el dominio de entrenamiento.
- Dataset de entrenamiento desconocido: la model card lo declara explicitamente como "unknown dataset". El nombre del repositorio sugiere CoNLL, pero esto no esta confirmado.
- Precision de 0,8425: aproximadamente una de cada seis predicciones positivas puede ser incorrecta, lo que hace recomendable una capa de validacion o umbral de confianza en produccion.
- Accuracy de 0,9745 enmascarada por el desbalance de clases: en NER la etiqueta mayoritaria suele ser "O" (sin entidad), por lo que la accuracy sobreestima el rendimiento real. El F1 de 0,8641 es la metrica relevante.
- Sin evaluacion en test ciego ni en dominios externos: las cifras proceden del conjunto de validacion del propio entrenamiento, con una unica ejecucion (seed 42) y sin intervalos de confianza.
- Longitud de contexto no documentada: si hereda los 512 tokens del modelo base, los documentos largos requeriran troceado con el consiguiente riesgo de entidades partidas en los limites.
- Idiomas no declarados: sin confirmacion oficial, se debe asumir uso en ingles o validar idioma por idioma antes de desplegar.
- Riesgo de alucinacion acotado: al ser un clasificador de spans no genera texto libre, pero si puede asignar etiquetas de entidad incorrectas y producir falsos positivos en textos fuera de dominio.
- Sesgos: no hay informacion sobre composicion del dataset ni sobre evaluacion de sesgos por genero, origen o nacionalidad, un riesgo inherente a cualquier modelo NER entrenado sobre corpus periodistico.
- Adopcion nula: cero descargas y una sola interaccion registrada en HuggingFace, sin historial de uso en produccion que sirva de referencia.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de copyright y la licencia. No se declaran restricciones adicionales ni obligaciones de atribucion mas alla de las del modelo base.
- Fechas de creacion y actualizacion registradas en 2026 y ausencia de versionado: no hay garantia de mantenimiento ni de correccion de errores por parte del autor.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/ahamidullin/bert-ner-conll
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Documentacion de transformers para pipelines de token-classification: https://huggingface.co/docs/transformers/tasks/token_classification
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
