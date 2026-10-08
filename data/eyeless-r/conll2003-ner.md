# eyeless-r/conll2003-ner

## Resumen

`eyeless-r/conll2003-ner` es un modelo de clasificacion de tokens (token classification) especializado en reconocimiento de entidades nombradas (NER), publicado por el usuario eyeless-r en HuggingFace. Se trata de un fine-tune del encoder `BAAI/bge-small-en-v1.5`, un transformer tipo BERT de 33.215.625 parametros, entrenado con la libreria Transformers 4.50.0 sobre un dataset que la propia model card describe como "unknown dataset" (desconocido), aunque el nombre del repositorio apunta a CoNLL-2003.

El modelo resuelve la tarea clasica de etiquetado de secuencias: asignar a cada token de un texto una etiqueta de entidad (persona, organizacion, localizacion, miscelanea), siguiendo presumiblemente el esquema BIO del corpus CoNLL-2003. Su relevancia practica reside en el tamano: con solo 33 millones de parametros y un repositorio de 0,1 GB, es un candidato viable para extraccion de entidades en produccion con latencia baja y huella de memoria minima.

El autor reporta en la model card unas metricas de evaluacion de Precision 0,9131, Recall 0,9305, F1 0,9217 y Accuracy 0,9827, ademas de una Loss de 0,0973. Sin embargo, el bloque `model-index` del repositorio declara un array de resultados vacio, por lo que no hay benchmarks formalmente registrados ni comparaciones publicadas contra otros modelos NER. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (fine-tune de `BAAI/bge-small-en-v1.5`) |
| Parametros totales | 33.215.625 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere CoNLL-2003, corpus en ingles, pero la model card no declara idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | token-classification (reconocimiento de entidades nombradas) |
| Libreria | transformers |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tamano del repositorio | 0,1 GB |
| Autor | eyeless-r |
| Fecha de creacion (metadato del repo) | 2026-10-08 |
| Ultima actualizacion (metadato del repo) | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, heredada del checkpoint base `BAAI/bge-small-en-v1.5`. La cabeza de clasificacion se ha sustituido por una cabeza de token classification, adecuada para etiquetar cada token con una categoria de entidad. No se declara en la informacion disponible ninguna modificacion estructural adicional (no hay atencion lineal, ni capas MoE, ni decodificacion especulativa).

El procedimiento de entrenamiento reportado por el `Trainer` utiliza los siguientes hiperparametros: learning rate 2e-05, `train_batch_size` 8, `eval_batch_size` 8, semilla 42, optimizador AdamW (`betas=(0.9, 0.999)`, `epsilon=1e-08`) sin argumentos adicionales, scheduler lineal y 20 epocas planificadas. El framework empleado fue Transformers 4.50.0 sobre PyTorch 2.14.1+cu130, con Datasets 3.4.1 y Tokenizers 0.21.4. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento (procedimiento poco habitual en tareas de etiquetado de secuencias).

El historico de entrenamiento proporcionado cubre 11 epocas. La loss de entrenamiento desciende de forma monotona desde 0,214 (epoca 1) hasta 0,0113 (epoca 11), mientras que la loss de validacion alcanza su minimo en la epoca 3 (0,0820) y repunta ligeramente hasta 0,0973 en la epoca 11. El mejor F1 se registra en la epoca 11 (0,9217), pero la divergencia entre la curva de entrenamiento y la de validacion a partir de la epoca 3 es un indicio claro de sobreajuste.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre texto: clasificacion token a token, presumiblemente con etiquetas de persona, organizacion, localizacion y miscelanea segun el esquema de CoNLL-2003.
- Extraccion de entidades estructuradas a partir de texto no estructurado, utilizable en pipelines de procesamiento de lenguaje natural.
- Integracion nativa con la libreria Transformers mediante `pipeline("token-classification")`, lo que permite su uso directo con `AutoModelForTokenClassification`.
- Marcado como `endpoints_compatible`, por lo que es desplegable en la infraestructura de Inference Endpoints de HuggingFace.
- Soporte de herramientas y function calling: no disponible / no aplicable.
- Soporte de agentes y razonamiento multi-paso: no aplicable (es un modelo de etiquetado, no generativo).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible / no aplicable.
- Generacion de texto, codigo o matematicas: no aplicable. El modelo no es generativo; su unica salida son etiquetas por token.

## Casos de uso

- Extraccion de entidades en procesamiento de documentos: dado un texto (por ejemplo, un articulo periodistico o un informe), el modelo devuelve las menciones de personas, organizaciones y lugares, que pueden volcarse a una base de datos estructurada. Su tamano de 33M de parametros hace viable procesar grandes volumenes sin coste elevado de GPU.
- Preprocesado para RAG y busqueda semantica: las entidades detectadas pueden usarse como metadatos para filtrar o enriquecer indices vectoriales, mejorando la recuperacion de fragmentos relevantes en sistemas de pregunta-respuesta.
- Deteccion aproximada de datos personales (PII): los nombres de persona y organizacion identificados pueden servir como primera capa de anonimizacion en flujos de cumplimiento, siempre con revision humana adicional dado que el modelo no esta entrenado especificamente para esta tarea.
- Analisis de noticias financieras: extraccion de nombres de empresas y localizaciones para construir grafos de relaciones o alimentar paneles de seguimiento de menciones.
- Enriquecimiento de CRM y bases de contactos: normalizacion de nombres de organizaciones y localizaciones extraidos de correos, notas o formularios libres.
- Anonimizacion en datasets de investigacion: etiquetado automatico de entidades antes de publicar corpus textuales, reduciendo el trabajo manual de revisores.
- Punto de partida para fine-tuning de dominio: al ser un modelo pequeno con licencia MIT y pesos en safetensors, es un candidato razonable para reentrenar sobre dominios especificos (legal, medico, industrial) donde CoNLL-2003 no cubre el vocabulario necesario.

## Benchmarks y rendimiento

El bloque `model-index` del repositorio declara una lista de resultados vacia, por lo que no hay benchmarks formalmente registrados ni comparaciones publicadas con modelos similares. Los unicos datos cuantitativos disponibles son los que el autor incluye en la model card como resultados del conjunto de evaluacion del `Trainer`:

| Metrica | Valor (conjunto de evaluacion) |
|---|---|
| Loss | 0,0973 |
| Precision | 0,9131 |
| Recall | 0,9305 |
| F1 | 0,9217 |
| Accuracy | 0,9827 |

Evolucion por epoca reportada en la model card (extracto completo):

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 1250 | 0,1305 | 0,8170 | 0,8721 | 0,8436 | 0,9711 |
| 2,0 | 2500 | 0,0962 | 0,8863 | 0,9079 | 0,8970 | 0,9785 |
| 3,0 | 3750 | 0,0820 | 0,8950 | 0,9165 | 0,9056 | 0,9801 |
| 4,0 | 5000 | 0,0835 | 0,8880 | 0,9179 | 0,9027 | 0,9803 |
| 5,0 | 6250 | 0,0824 | 0,8961 | 0,9231 | 0,9094 | 0,9810 |
| 6,0 | 7500 | 0,0861 | 0,9110 | 0,9273 | 0,9191 | 0,9823 |
| 7,0 | 8750 | 0,0870 | 0,9071 | 0,9300 | 0,9184 | 0,9819 |
| 8,0 | 10000 | 0,0857 | 0,9148 | 0,9312 | 0,9229 | 0,9831 |
| 9,0 | 11250 | 0,0944 | 0,9035 | 0,9295 | 0,9163 | 0,9814 |
| 10,0 | 12500 | 0,0967 | 0,9085 | 0,9290 | 0,9186 | 0,9822 |
| 11,0 | 13750 | 0,0973 | 0,9131 | 0,9305 | 0,9217 | 0,9827 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con la naturaleza del modelo: es un clasificador de tokens, no un modelo generativo, por lo que esas baterias no son aplicables.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 133 MB solo para los pesos (33,2M de parametros x 4 bytes), mas el overhead del runtime y las activaciones.
- VRAM estimada en FP16/BF16: aproximadamente 66 MB para los pesos.
- Cuantizacion: no se declaran tipos de cuantizacion soportados en la informacion disponible. Al ser un modelo de 33M de parametros, la cuantizacion apenas aporta ventajas practicas.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente. El modelo cabe sin problemas en tarjetas de consumo como RTX 3060, RTX 4070, RTX 4090, e incluso en GPUs integradas o en CPU.
- CPU: la inferencia en CPU es perfectamente viable para este tamano de modelo, con latencias del orden de milisegundos por frase corta, aunque no se han publicado mediciones oficiales.
- Opciones de despliegue: Transformers con `pipeline("token-classification")`, HuggingFace Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`), ONNX Runtime para optimizacion en CPU, y servidores de inferencia genericos compatibles con modelos de clasificacion. No se declara soporte explicito de vLLM, llama.cpp, Ollama o TGI, herramientas orientadas principalmente a modelos generativos.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos comparativos contra otros modelos NER, ni el `model-index` incluye referencias. La unica comparacion verificable es con su propio checkpoint base:

| Modelo | Parametros | Tarea | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| eyeless-r/conll2003-ner | 33.215.625 | Token classification (NER) | no disponible | MIT | F1 0,9217 en el conjunto de evaluacion declarado |
| BAAI/bge-small-en-v1.5 | 33 millones (mismo backbone) | Embeddings de texto (no NER) | no disponible | MIT | No aplica como modelo NER |
| Otras alternativas NER (por ejemplo, fine-tunes sobre BERT-base o RoBERTa) | no disponible | Token classification (NER) | no disponible | no disponible | no disponible |

En resumen: no hay datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Dataset de entrenamiento no declarado: la model card indica literalmente "unknown dataset". Aunque el nombre del repositorio sugiere CoNLL-2003, no hay confirmacion oficial, lo que impide saber con certeza el esquema de etiquetas, el idioma y el dominio cubiertos.
- Riesgo de sobreajuste: la loss de validacion toca minimo en la epoca 3 (0,0820) y sube hasta 0,0973 en la epoca 11, mientras la loss de entrenamiento cae hasta 0,0113. El historico solo cubre 11 de las 20 epocas planificadas, por lo que se desconoce el comportamiento en las 9 restantes.
- Idiomas no declarados: la model card no especifica idiomas soportados. Si el entrenamiento fue sobre CoNLL-2003, el modelo estaria limitado a ingles y su rendimiento en castellano seria, como minimo, dudoso.
- Riesgo de alucinacion de entidades: como todo clasificador de secuencias, puede etiquetar como entidad fragmentos que no lo son (falsos positivos) o perder menciones ambiguas. No debe usarse como fuente unica de verdad en contextos de cumplimiento normativo.
- Sesgos potenciales: los corpus NER tipo CoNLL-2003 estan sesgados hacia el dominio periodistico en ingles, con una representacion limitada de nombres no anglosajones, lo que puede provocar peor recall en textos de otras regiones o culturas.
- Sin resultados en el `model-index`: el array de resultados esta vacio, de modo que las metricas de la model card no estan formalmente verificadas ni acompanadas de la configuracion exacta de evaluacion (dataset, splits, esquema de etiquetas).
- Metadatos inconsistentes: las fechas de creacion y actualizacion del repositorio (2026-10-08) son posteriores a la fecha habitual de redaccion, y el repositorio acumula 0 descargas y 0 likes, lo que sugiere poca validacion por parte de la comunidad.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, sin restricciones adicionales conocidas. Conviene, aun asi, verificar la licencia del checkpoint base `BAAI/bge-small-en-v1.5` y del dataset de entrenamiento (CoNLL-2003 tiene sus propias condiciones de uso para investigacion).
- Documentacion incompleta: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" de la model card contienen el texto "More information needed".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eyeless-r/conll2003-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces obtenidos correspondian a contenido no relacionado (informacion sobre estudios de posgrado) y no se incluyen por no ser relevantes.
