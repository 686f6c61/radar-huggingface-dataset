# MHDCSM/bge-small-en-v1.5-conll2003-ner

## Resumen

bge-small-en-v1.5-conll2003-ner es un modelo de clasificacion de tokens (token classification) especializado en reconocimiento de entidades nombradas (NER), publicado por el usuario MHDCSM en HuggingFace. Se trata de un ajuste fino supervisado del modelo de embeddings BAAI/bge-small-en-v1.5, un encoder transformer de tipo BERT con 33.215.625 parametros (aproximadamente 33,2 millones), lo que lo situa en la gama "small" y lo hace apto para inferencia en CPU y GPU de consumo.

El modelo resuelve una tarea concreta: asignar etiquetas de entidad a cada token de un texto de entrada. Por el nombre del repositorio, el ajuste se habria realizado sobre el corpus CoNLL-2003, el estandar de facto para NER en ingles con cuatro categorias (persona, organizacion, localizacion y miscelanea), aunque la model card indica explicitamente que el dataset de entrenamiento es "unknown". No es un modelo generativo: no produce texto libre ni soporta tool calling.

Su relevancia practica es la de un extractor de entidades ligero, rapido y con licencia MIT, util como componente previo en pipelines de anonimizacion, indexacion semantica, construccion de grafos de conocimiento o enriquecimiento de metadatos en sistemas RAG. El coste computacional es minimo (repo de 0,1 GB), lo que permite desplegarlo en entornos con recursos limitados. El contrapunto es la escasa validacion externa: 15 descargas y 0 "likes" en el momento de redactar esta ficha, sin resultados declarados en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (etiqueta `bert` en el repo), fine-tune de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.215.625 (33,2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica; el encoder BERT subyacente limita habitualmente a 512 tokens) |
| Tipos de cuantizacion | No disponible (no se documentan pesos cuantizados en el repo) |
| Idiomas soportados | No disponible en la model card; el modelo base y el corpus CoNLL-2003 son de ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Framework de entrenamiento | Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1 |
| Descargas / likes | 15 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer bidireccional estilo BERT de 33,2 millones de parametros, sobre el que se anade una cabeza de clasificacion de tokens. BAAI/bge-small-en-v1.5 es originalmente un modelo de recuperacion (retrieval) entrenado para producir embeddings de frases; aqui se reutiliza su tronco como extractor de representaciones contextuales y se ajusta para etiquetado secuencial. El entrenamiento se realizo con `Trainer` de HuggingFace, como indica la etiqueta `generated_from_trainer`, y la model card es la generada automaticamente por dicha herramienta.

Los hiperparametros documentados son: learning rate 5e-05, `train_batch_size` 16, `eval_batch_size` 8, semilla 42, optimizador AdamW fused con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con `warmup_steps` equivalente a 0,1 y 10 epochs. El mejor checkpoint segun la perdida de validacion corresponde a la epoch 6 (step 3750), con `Validation Loss` 0,0790. La model card no especifica el dataset de entrenamiento (lo declara como "unknown"), aunque el nombre del repositorio apunta a CoNLL-2003. No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional; se trata de un fine-tune supervisado convencional de clasificacion de tokens.

## Capacidades

- Reconocimiento de entidades nombradas por token: asignacion de etiquetas BIO/BILOU a secuencias de texto de entrada.
- Extraccion de las cuatro categorias tipicas del esquema CoNLL-2003: persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC), asumiendo que el esquema del dataset se ha preservado.
- Clasificacion de secuencias completas con salida estructurada por token (no genera texto).
- Inferencia rapida y de bajo coste: 33,2 M de parametros permiten ejecucion en CPU sin GPU.
- No soporta tool calling ni function calling: es un modelo discriminativo, no un modelo de chat o instrucciones.
- No dispone de modo "thinking", razonamiento multi-step, agentes, vision ni audio.
- Capacidades multilingues: no documentadas; el modelo base y el corpus de referencia son en ingles.

## Casos de uso

- Anonimizacion de datos personales: deteccion previa de nombres de persona (PER) y organizaciones (ORG) en textos legales, historiales o formularios antes de almacenarlos o enviarlos a un tercero, usando el modelo como primer filtro sobre el que aplicar reglas de enmascarado.
- Enriquecimiento de metadatos en sistemas RAG: extraer entidades de cada fragmento de documento antes de indexarlo, de modo que el motor de recuperacion pueda filtrar por organizacion, lugar o persona ademas de por similitud vectorial.
- Construccion de grafos de conocimiento: poblar nodos y relaciones a partir de entidades detectadas en corpus documentales, encadenando el extractor con un modulo de resolucion de entidades (entity linking) contra una base como Wikidata.
- Analisis de prensa y fuentes financieras: seguimiento de menciones de empresas (ORG) y localizaciones (LOC) en noticias para construir series temporales de cobertura mediatica o alertas de eventos.
- Enrutado y clasificacion de tickets de soporte: identificar la organizacion o el producto mencionado en el cuerpo del ticket para asignarlo automaticamente al equipo correspondiente.
- Preprocesado en investigacion en PLN: servir como linea base ligera y entrenable en pocas horas sobre un dominio nuevo (biomedicina, derecho, industria) gracias a sus 33 M de parametros y a su licencia MIT.
- Despliegue on-premise en CPU: integracion en servicios internos con requisitos de soberania de datos, donde no se permite enviar texto a APIs externas, aprovechando que el modelo cabe en memoria en decenas de MB.

## Benchmarks y rendimiento

El model-index de la model card no declara ningun resultado (`results: []`), por lo que no hay comparaciones publicadas contra MMLU, GLUE, SuperGLUE ni otros benchmarks estandar. Los unicos datos disponibles son las metricas de evaluacion registradas durante el fine-tuning en el conjunto de validacion:

| Epoch | Step | Validation Loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 625 | 0,1562 | 0,7881 | 0,8475 | 0,8167 | 0,9666 |
| 2,0 | 1250 | 0,0901 | 0,8865 | 0,9098 | 0,8980 | 0,9793 |
| 3,0 | 1875 | 0,0789 | 0,8863 | 0,9248 | 0,9051 | 0,9796 |
| 4,0 | 2500 | 0,0785 | 0,9045 | 0,9249 | 0,9146 | 0,9820 |
| 5,0 | 3125 | 0,0853 | 0,8977 | 0,9244 | 0,9109 | 0,9804 |
| 6,0 | 3750 | 0,0790 | 0,9004 | 0,9308 | 0,9153 | 0,9819 |

En la evaluacion final declarada en la model card: Loss 0,0790, Precision 0,9004, Recall 0,9308, F1 0,9153 y Accuracy 0,9819. Se desconoce el conjunto de evaluacion exacto, dado que la model card indica "unknown dataset". No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 133 MB solo para los pesos, mas activaciones; inferencia holgada en cualquier GPU con 1-2 GB libres.
- VRAM estimada en fp16/bf16: aproximadamente 66 MB de pesos.
- VRAM estimada en int8: aproximadamente 33 MB de pesos (requiere cuantizacion propia, no incluida en el repo).
- Cabe sobradamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con memoria compartida; tambien cabe en CPU convencional.
- GPU de datacenter (A100, H100) innecesarias salvo para procesamiento por lotes a gran escala.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, ONNX Runtime, TorchScript, y exportacion a formato optimizado para CPU; tambien es compatible con endpoints (etiqueta `endpoints_compatible` en el repo). La conversion a GGUF requeriria trabajo adicional, ya que el repo solo publica safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Al tratarse de un encoder de 33 M de parametros con contexto corto, el coste por secuencia es bajo, pero no hay cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento NER |
|---|---|---|---|---|---|
| MHDCSM/bge-small-en-v1.5-conll2003-ner | 33,2 M | No disponible | MIT | HuggingFace (15 descargas, 0 likes) | F1 0,9153 en validacion propia |
| BAAI/bge-small-en-v1.5 | 33,2 M | No disponible | MIT | HuggingFace (modelo base, retrieval, no NER) | No aplica (no es NER) |
| dslim/bert-base-NER | ~110 M | No disponible | No disponible | HuggingFace | No disponible en esta ficha |
| FacebookAI/roberta-large-ner-english | ~355 M | No disponible | No disponible | HuggingFace | No disponible en esta ficha |
| Modelos NER de spaCy (p. ej. `en_core_web_trf`) | No disponible | No disponible | No disponible | Paquete pip | No disponible en esta ficha |

La ventaja diferencial del modelo analizado es su tamano reducido (una tercera parte de un BERT-base) con un F1 declarado de 0,9153, aunque esta cifra procede de la propia evaluacion del autor y no de un benchmark independiente. No se dispone de resultados comparables bajo el mismo protocolo de evaluacion para los modelos alternativos.

## Limitaciones y advertencias

- Model card incompleta y autogenerada: el dataset se declara como "unknown", no hay seccion de usos previstos ni de limitaciones, lo que impide reproducir el entrenamiento o verificar el esquema de etiquetas.
- Esquema de entidades restringido: si el ajuste se hizo sobre CoNLL-2003, solo cubre PER, LOC, ORG y MISC, con la granularidad de ese corpus; no distingue tipos mas finos (productos, eventos, cantidades, fechas).
- Dominio limitado: CoNLL-2003 proviene de noticias en ingles de agencias como Reuters; el rendimiento fuera de ese dominio (texto clinico, juridico, conversacional, tecnico) puede degradarse y no esta documentado.
- Idioma: no hay declaracion oficial de idiomas; el modelo base y el corpus de referencia son en ingles, por lo que el uso en castellano no esta respaldado por datos.
- Riesgo de error de etiquetado: como clasificador, puede asignar entidades a tokens que no lo son (falsos positivos) o perder entidades (falsos negativos); el F1 de 0,9153 implica un margen de error no despreciable en produccion. No "alucina" texto, pero si puede producir anotaciones incorrectas con alta confianza.
- Sesgos heredados: sesgos de representacion del corpus de noticias, con sobrerrepresentacion de entidades occidentales y de determinados paises y organizaciones.
- Sin cuantizaciones publicadas: el repo solo ofrece safetensors, por lo que cualquier despliegue optimizado exige conversion propia.
- Licencia MIT: permite uso comercial, redistribucion y modificacion sin restricciones conocidas, siempre que se conserve el aviso de copyright; conviene verificar la licencia del modelo base y del corpus de entrenamiento por separado.
- Adopcion muy baja (15 descargas, 0 likes): no hay validacion independiente de la comunidad ni informes de terceros sobre su comportamiento.
- Contexto presumiblemente corto: si el encoder base mantiene el limite habitual de 512 tokens, los documentos largos requieren troceado, con el consiguiente riesgo de entidades partidas entre fragmentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MHDCSM/bge-small-en-v1.5-conll2003-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio del proyecto BGE (FlagEmbedding): https://github.com/FlagOpen/FlagEmbedding
- Dataset CoNLL-2003 en HuggingFace (referencia del esquema de etiquetas): https://huggingface.co/datasets/eriktks/conll2003
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores corresponden al modelo en HuggingFace y a los recursos de su linaje tecnico.
