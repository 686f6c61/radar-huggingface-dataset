# ledddev/dl-hw2-bge-ner

## Resumen

dl-hw2-bge-ner es un modelo de reconocimiento de entidades nombradas (NER) publicado por el usuario ledddev en HuggingFace. Se trata de un ajuste fino (*fine-tune*) del modelo de embeddings BAAI/bge-small-en-v1.5, un encoder de arquitectura BERT con 33.215.625 parámetros, 12 capas y 384 dimensiones ocultas, reorientado desde su tarea original de recuperación densa hacia la clasificación de tokens (*token classification*). El resultado es un modelo muy ligero (0,1 GB de repositorio) que etiqueta secuencias token a token, no un modelo generativo.

La relevancia de esta ficha es sobre todo práctica: se trata de un candidato de coste mínimo para tareas de extracción de entidades en producción o en el borde, con licencia MIT y pesos en safetensors. Sin embargo, su utilidad real está seriamente limitada por la falta de documentación. La model card reconoce explícitamente que el modelo se entrenó "on an unknown dataset", no especifica el conjunto de etiquetas de entidades, no declara los idiomas soportados y no incluye resultados en ningún benchmark público (el *model-index* está vacío). A fecha de esta ficha acumula 0 descargas y 0 *likes*, por lo que no ha pasado por ninguna validación de la comunidad.

En conjunto, debe tratarse como un artefacto experimental —el propio identificador sugiere un ejercicio académico (*dl-hw2*)— antes que como un componente listo para producción. Su valor principal es como punto de partida reproducible para experimentar con NER sobre un backbone de la familia BGE, siempre que el desarrollador valide por su cuenta las etiquetas, el dominio y el rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder BERT (12 capas, 384 dimensiones ocultas, 12 cabezas de atencion) con cabeza de clasificacion de tokens |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (heredada de la configuracion del modelo base BAAI/bge-small-en-v1.5) |
| Tipos de cuantizacion | no disponible; no se publican versiones cuantizadas. Los pesos se pueden cuantizar con herramientas estandar (ONNX Runtime, Optimum, cuantizacion dinamica de PyTorch) |
| Idiomas soportados | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 esta entrenado unicamente en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tamano del repositorio | 0,1 GB |
| Version de Transformers | 4.50.0 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder de tipo BERT: 12 capas, 384 dimensiones ocultas, 12 cabezas de atencion y 512 posiciones maximas de secuencia, segun la configuracion publica del modelo base BAAI/bge-small-en-v1.5 (dato no verificado en esta ficha, procedente de la documentacion del modelo base). Sobre ese backbone se ha anadido una cabeza de clasificacion por token, que es lo que convierte un modelo de embeddings en un etiquetador de secuencias. Es un caso poco habitual: BGE es una familia disenada para recuperacion densa (generar un vector por texto), y aqui se reutiliza su encoder para una tarea discriminativa a nivel de token.

El entrenamiento se realizo con el `Trainer` de HuggingFace durante 3 epocas, con *learning rate* 2e-5, batch de 8 tanto en entrenamiento como en evaluacion, optimizador AdamW (betas 0,9 y 0,999, epsilon 1e-8), scheduler lineal, semilla 42 y sin argumentos adicionales de optimizador. A 1250 pasos por epoca y batch de 8, el conjunto de entrenamiento equivale a unos 10.000 ejemplos por epoca si no se aplico acumulacion de gradiente (calculo derivado, no declarado por el autor). No hay informacion sobre la composicion del dataset, el numero de tokens procesados, el esquema de etiquetado ni sobre si se aplicaron tecnicas de ajuste adicionales. Al ser un modelo encoder discriminativo, no se emplearon RLHF ni DPO. Las versiones de framework declaradas son Transformers 4.50.0, PyTorch 2.6.0, Datasets 3.4.1 y Tokenizers 0.21.4.

## Capacidades

- Reconocimiento de entidades nombradas (NER): clasifica cada token de una secuencia en una categoria de entidad. El conjunto exacto de etiquetas no esta documentado.
- Extraccion de informacion estructurada: puede convertir texto no estructurado en pares entidad-tipo, util como paso previo a un pipeline de datos.
- Procesamiento por lotes de textos cortos: al tener 512 tokens de contexto, es adecuado para parrafos, titulares, campos de formularios o fragmentos de documentos.
- Inferencia de coste muy bajo: 33,2 M de parametros permiten ejecucion en CPU y en hardware sin GPU.
- Generacion de texto: no soportada (no es un modelo generativo).
- Razonamiento y matematicas: no soportados.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Vision, audio y modo *thinking*: no soportados.
- Multilingue: no documentado; hereda el sesgo monolingue en ingles del modelo base.

## Casos de uso

- Preanotacion de datasets de NER: el modelo puede generar etiquetas iniciales sobre grandes volumenes de texto que despues se revisan y corrigen manualmente. Con un F1 de 0,8818 en su conjunto de evaluacion, permite reducir el coste de anotacion humana, aunque el esquema de etiquetas debe alinearse manualmente porque no esta documentado.
- Anonimizacion y proteccion de datos: si las etiquetas incluyen personas u organizaciones, el modelo puede usarse como paso de deteccion dentro de un pipeline que enmascare informacion personal antes de enviar texto a un servicio de terceros o a un modelo generativo. Requiere validacion previa sobre datos propios, dado que la precision de 0,8633 implica falsos positivos.
- Enriquecimiento de indices de busqueda: extraer entidades de titulos, resumenes o fichas de producto para indexarlas como campos facetados en un motor de busqueda, mejorando los filtros por organizacion, lugar o marca.
- Preprocesado para sistemas RAG: etiquetar los fragmentos (*chunks*) de un corpus documental para adjuntar metadatos de entidades, lo que permite filtrar la recuperacion por entidad antes de construir el contexto de un LLM.
- Monitorizacion de menciones de marca: procesar flujos de noticias, resenas o redes sociales para detectar menciones de organizaciones o productos, con un throughput alto gracias al tamano reducido del modelo.
- Enrutado de tickets de soporte: clasificar tickets por las entidades que contienen para dirigirlos al equipo correspondiente, como paso previo a un clasificador de intenciones.
- Analisis de voz del cliente: extraer productos, competidores y lugares citados en encuestas abiertas o resenas para alimentar cuadros de mando agregados.
- Clasificacion de documentos legales o financieros: localizar partes, jurisdicciones o importes en contratos y facturas, siempre que el dominio del ajuste coincida con el del documento, algo que no puede comprobarse con la informacion disponible.

## Benchmarks y rendimiento

El *model-index* del repositorio no contiene resultados: el autor no ha declarado metricas sobre ningun benchmark publico (CoNLL-2003, OntoNotes u otros). Tampoco se especifica sobre que conjunto se calcularon las metricas de evaluacion, por lo que no son comparables con las de otros modelos de NER.

Metricas declaradas por el autor en su conjunto de evaluacion (dataset no identificado):

| Metrica | Valor |
|---|---|
| Loss | 0,0991 |
| Precision | 0,8633 |
| Recall | 0,9012 |
| F1 | 0,8818 |
| Accuracy | 0,9772 |

Progreso del entrenamiento declarado en la model card:

| Epoca | Step | Training loss | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 1,0 | 1250 | 0,2202 | 0,1415 | 0,8074 | 0,8743 | 0,8395 | 0,9690 |
| 2,0 | 2500 | 0,1091 | 0,1064 | 0,8639 | 0,8977 | 0,8805 | 0,9768 |
| 3,0 | 3750 | 0,0802 | 0,0991 | 0,8633 | 0,9012 | 0,8818 | 0,9772 |

Advertencia metodologica: la *accuracy* de 0,9772 esta dominada casi con certeza por la clase mayoritaria (tokens etiquetados como "O"), un efecto habitual en NER. La metrica relevante es el F1 (0,8818), y su valor solo es interpretable si se conoce el esquema de etiquetas y el conjunto de evaluacion, datos que no se han publicado. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 133 MB en fp32, 66 MB en fp16/bf16 y 33 MB en int8. Hay que sumar el coste de activaciones, que depende del batch y de la longitud de secuencia (moderado, dado que el modelo tiene 512 posiciones maximas).
- GPU recomendadas: practicamente cualquier GPU con soporte CUDA, incluidas GTX 1050/1650, RTX 3050 y superiores. Aceleradores como A100 o H100 son innecesarios y no aportan ventaja apreciable.
- GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en GPUs integradas. El modelo completo ocupa menos de 0,1 GB en disco.
- CPU: plenamente viable como unico dispositivo de inferencia. Los requisitos de memoria son inferiores a 1 GB en fp32.
- Latencia y throughput: no se han publicado medidas. Por el tamano del modelo (33 M de parametros, 12 capas), se estima un coste por secuencia del orden de milisegundos en GPU y de decenas de milisegundos en CPU con batch 1 y secuencias de 512 tokens; se trata de una estimacion, no de una cifra medida.
- Opciones de despliegue: pipeline de HuggingFace Transformers (`token-classification`), exportacion a ONNX Runtime u Optimum para acelerar en CPU, NVIDIA Triton o TorchServe para servicio en produccion, `spacy-transformers` para integrarlo en un pipeline de spaCy y FastAPI para envolverlo en un microservicio.
- Opciones no aplicables: llama.cpp, Ollama y GGUF estan orientados a modelos generativos y no cubren esta tarea. vLLM y TGI no ofrecen soporte de primera clase para clasificacion de tokens en modelos encoder.
- Tags del repositorio: incluye `endpoints_compatible`, por lo que es desplegable en Inference Endpoints de HuggingFace sin transformaciones adicionales.

## Comparativa con modelos similares

Los modelos comparables son otros etiquetadores NER basados en encoders. Los datos de las alternativas proceden de sus respectivas model cards publicas y deben verificarse antes de usarlos en una decision.

| Modelo | Parametros | Contexto | Tarea | Idioma | Licencia | Formato |
|---|---|---|---|---|---|---|
| ledddev/dl-hw2-bge-ner | 33,2 M | 512 | NER (esquema de etiquetas no documentado) | no documentado (base en ingles) | MIT | safetensors |
| BAAI/bge-small-en-v1.5 (modelo base) | 33,2 M | 512 | Embeddings y recuperacion densa | Ingles | MIT | safetensors |
| dslim/bert-base-NER | ~108 M | 512 | NER sobre CoNLL-2003 (PER, LOC, ORG, MISC) | Ingles | MIT | safetensors |
| Jean-Baptiste/roberta-large-ner-english | ~355 M | 514 | NER (PER, LOC, ORG, MISC) | Ingles | no verificada en esta ficha | safetensors |

Observaciones: dl-hw2-bge-ner es tres veces mas pequeno que dslim/bert-base-NER y mas de diez veces mas pequeno que las alternativas basadas en RoBERTa-large, lo que le da una ventaja clara en coste de inferencia y despliegue en CPU. Sin embargo, las alternativas publican el esquema de etiquetas, el dataset de entrenamiento y sus resultados en un benchmark comun (dslim/bert-base-NER declara un F1 de 0,9131 sobre CoNLL-2003 en su model card), mientras que este modelo no. Por tanto, la comparacion de rendimiento no es posible: las cifras de dl-hw2-bge-ner corresponden a un conjunto de evaluacion no identificado y no equivalen a un benchmark estandar. La eleccion entre uno u otro depende de si el desarrollador necesita un esquema de etiquetas conocido y resultados verificables (alternativas consolidadas) o el minimo coste computacional posible (este modelo).

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido. La model card indica literalmente que se entreno "on an unknown dataset", y la seccion de descripcion del modelo esta sin rellenar. No se puede saber en que dominio funciona ni con que datos.
- Esquema de etiquetas no documentado. Se desconoce que tipos de entidad predice el modelo (persona, organizacion, lugar, etc.) y cuantos son. Esto impide usarlo en produccion sin inspeccionar manualmente `config.json` y probar el modelo.
- Sesgos desconocidos. Al no publicarse la composicion del dataset, no hay forma de evaluar sesgos de genero, origen o dominio. Se heredan, ademas, los sesgos del corpus en ingles de BAAI/bge-small-en-v1.5.
- Riesgo de falsos positivos. La precision declarada es de 0,8633, lo que implica que aproximadamente un 14% de las entidades detectadas podrian ser incorrectas. En tareas de anonimizacion esto genera ruido; en tareas de extraccion, requiere validacion posterior.
- Limitacion de contexto. Con 512 tokens, los documentos largos deben fragmentarse. Al fragmentar se pierden entidades que cruzan el limite entre fragmentos.
- Limitacion idiomatica probable. El modelo base solo se entreno en ingles; no hay indicacion de que el fine-tune haya incorporado otros idiomas. No se han declarado idiomas soportados.
- Sin validacion por la comunidad. 0 descargas y 0 *likes* en el momento de redactar esta ficha, sin tests de terceros ni informes de uso independientes.
- Sin resultados en benchmarks publicos. El *model-index* esta vacio y las metricas declaradas no son comparables con las de otros modelos.
- Licencia permisiva. MIT permite uso comercial, modificacion y redistribucion sin obligaciones de atribucion mas alla de conservar el aviso de copyright. No hay restricciones conocidas de uso comercial.
- Nomenclatura. El identificador `dl-hw2` sugiere un ejercicio academico, no un modelo mantenido. No hay senales de mantenimiento posterior a la publicacion inicial.
- Antes de usarlo en produccion es imprescindible evaluarlo sobre un conjunto propio anotado, con el esquema de etiquetas que realmente necesite la aplicacion, y compararlo contra una alternativa con documentacion completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ledddev/dl-hw2-bge-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio FlagEmbedding (familia BGE): https://github.com/FlagOpen/FlagEmbedding
- Paper de la familia BGE (C-Pack, arXiv:2309.07597): https://arxiv.org/abs/2309.07597
- Documentacion de HuggingFace sobre token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- Modelo alternativo dslim/bert-base-NER: https://huggingface.co/dslim/bert-base-NER
