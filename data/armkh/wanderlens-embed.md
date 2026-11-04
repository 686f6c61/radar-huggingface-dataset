# armkh/wanderlens-embed

## Resumen

wanderlens-embed es un modelo de embeddings de frases obtenido mediante fine-tuning de BAAI/bge-small-en-v1.5, un transformer tipo BERT de 33,36 millones de parametros que produce vectores normalizados de 384 dimensiones. Lo desarrolla el usuario armkh y su proposito es concreto: alinear la forma en que un viajero describe un destino ("un sitio tranquilo junto a un lago con buen senderismo") con los pasajes de Wikivoyage que encajan con esa descripcion. Es el motor de busqueda del proyecto Wanderlens.

El modelo parte del checkpoint bge-small-en-v1.5 y se reentrena con 28.401 tripletas generadas de forma sintetica sobre el dataset armkh/wanderlens, combinando consultas de viajero, el pasaje fuente y un negativo duro extraido de otro destino. La relevancia practica esta en la mejora medida sobre el modelo base en recuperacion de destino: el Recall@1 pasa del 6,9 % al 34,7 % y el MRR@20 de 0,111 a 0,423 sobre un conjunto de test de 2.997 consultas sinteticas contra 138.753 fragmentos.

Se distribuye con licencia MIT, en formatos safetensors (via sentence-transformers) y ONNX con pesos int8 que incluye pooling CLS y normalizacion en el grafo, de modo que puede ejecutarse solo con onnxruntime en CPU. El contexto esta limitado a 512 tokens, heredado del modelo base, y el modelo esta entrenado y evaluado unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | int8 (export ONNX incluido); el resto de cuantizaciones no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (sentence-transformers) y ONNX (model.onnx con pesos int8, tokenizer.json, encoder.json) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer BERT pequeno con 33,36 millones de parametros que genera embeddings de 384 dimensiones, normalizados, usando pooling sobre el token CLS. Las consultas se codifican con el prefijo de instruccion "Represent this sentence for searching relevant passages:" y los pasajes se codifican sin prefijo, siguiendo la convencion de la familia bge. En Wanderlens un pasaje se compone del nombre del lugar y la seccion, un salto de linea y el texto de la guia.

El entrenamiento usa 28.401 tripletas del dataset armkh/wanderlens: una consulta sintetica de viajero generada por gpt-5.4-nano en tres estilos (detalle especifico, consulta casual sobre la sensacion del lugar y combinacion de dos o tres deseos), el pasaje de guia del que se escribio y un negativo duro (un pasaje de otro destino que el modelo base situaba cerca de la consulta pero por debajo del positivo). La particion se hace por destino: 9.473 ejemplos de entrenamiento, 500 de desarrollo y 1.000 de test, sin solapamiento de lugares entre train y test. Se optimiza con CachedMultipleNegativesRankingLoss, batch de 128, learning rate 2e-5 y una epoca (222 pasos), seleccionando el checkpoint con mejor MRR@10 en desarrollo evaluado cada 50 pasos. El entrenamiento completo llevo 44 minutos en un Mac con Apple Silicon (MPS). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de embeddings de texto para recuperacion densa (retrieval) y similitud semantica entre frases.
- Busqueda semantica de pasajes de guias de viaje a partir de descripciones libres del viajero.
- Manejo de consultas en tres estilos: detalle especifico, descripcion casual del ambiente y combinacion de varias preferencias.
- Embeddings de 384 dimensiones normalizados, aptos para similitud coseno e indices vectoriales.
- Export ONNX int8 ejecutable en CPU solo con onnxruntime, con pooling y normalizacion incluidos en el grafo.
- Compatible con text-embeddings-inference y con endpoints de HuggingFace (tag endpoints_compatible).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es exclusivamente un modelo de embeddings.
- Capacidad multilingue: no disponible; solo ingles.

## Casos de uso

- Busqueda de destinos en una aplicacion de viajes: el modelo convierte la descripcion libre del usuario en un vector y recupera los pasajes de guia mas proximos; el salto de Recall@1 del 6,9 % al 34,7 % frente al base lo hace directamente util para esta tarea.
- Motor de busqueda del proyecto Wanderlens: es su funcion original, con el export ONNX int8 para servir en CPU sin dependencia de torch.
- Recomendacion por ambiente o "feeling" del lugar: las consultas casuales mejoran su Recall@1 del 1,2 % al 17,9 %, lo que permite ordenar resultados por atmosfera descrita y no solo por palabras clave.
- Filtrado por preferencias combinadas: consultas que suman dos o tres deseos alcanzan un Recall@1 del 51,5 % (frente al 7,9 % del base), adecuado para asistentes que piden varias condiciones a la vez.
- Deduplicacion y agrupacion de fragmentos de guias: los embeddings normalizados permiten agrupar pasajes de Wikivoyage semanticamente proximos para construir indices o resumenes por tematica.
- Prototipado rapido en local: con 33 millones de parametros y un ONNX int8, se puede desplegar en un portatil o en una funcion serverless para demos de recuperacion sin GPU.
- Enriquecimiento de un RAG sobre contenido turistico: usar el modelo como recuperador de primer nivel sobre un corpus de guias y pasar los pasajes recuperados a un LLM generador.

## Benchmarks y rendimiento

Evaluacion sobre 2.997 consultas sinteticas retenidas para los 1.000 destinos de test, buscando contra los 138.753 fragmentos completos. Un acierto es que el destino de la consulta aparezca entre los k primeros lugares.

| Metrica | Base bge-small | wanderlens-embed |
|---|---:|---:|
| Recall@1 | 6,9 % | 34,7 % |
| Recall@5 | 15,7 % | 51,6 % |
| Recall@10 | 20,6 % | 58,7 % |
| MRR@20 | 0,111 | 0,423 |

Desglose de Recall@1 por estilo de consulta:

| Estilo de consulta | Base bge-small | wanderlens-embed |
|---|---:|---:|
| Detalle especifico | 11,5 % | 34,8 % |
| Casual (sensacion del lugar) | 1,2 % | 17,9 % |
| Combinacion de deseos | 7,9 % | 51,5 % |

El export ONNX int8 queda a menos de 0,3 puntos de estas cifras (Recall@1 del 34,5 %). En 32 consultas escritas a mano, la precision@5 pasa de 0,59 a 0,63, diferencia que el autor considera dentro del ruido para ese tamano de muestra. No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo en fp32 ocupa aproximadamente 130 MB de pesos; en int8, unos 33 MB. Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) sobra para lotes grandes. En servidor, A100 o H100 solo tendrian sentido para throughput masivo por lotes.
- Cabe en GPU consumer: si, en todas las gamas actuales, y tambien en CPU con el export ONNX int8.
- Opciones de despliegue: sentence-transformers (PyTorch), onnxruntime con el export ONNX incluido, text-embeddings-inference y endpoints de HuggingFace (tag endpoints_compatible). No se documenta soporte explicito de vLLM ni llama.cpp.
- Latencia y throughput: no disponibles. El unico dato de computo publicado es el tiempo de entrenamiento (44 minutos en Apple Silicon MPS), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension del embedding | Licencia | Notas |
|---|---|---|---|---|---|
| wanderlens-embed | 33,36 M | 512 | 384 | MIT | Fine-tuning de bge-small-en-v1.5 para retrieval de viajes; Recall@1 34,7 % en su test sintetico |
| BAAI/bge-small-en-v1.5 | 33,36 M | 512 | 384 | MIT | Modelo base; mismo test con Recall@1 6,9 %; proposito general |
| Otros modelos de embeddings comparables | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de alternativas en la informacion disponible |

La comparacion directa con el base es la unica respaldada por datos. Cualquier otro modelo de embeddings de la misma categoria (por tamano o por tarea) requeriria evaluacion propia, ya que no se aportan cifras.

## Limitaciones y advertencias

- Entrenado y evaluado solo con texto de Wikivoyage en ingles y con consultas generadas por un unico modelo de lenguaje (gpt-5.4-nano); el rendimiento con lenguaje natural real puede diferir.
- El conjunto de test sintetico procede del mismo generador que las consultas de entrenamiento, por lo que mide la mejora en ese estilo de consulta; la comprobacion con 32 consultas manuales arroja una mejora dentro del ruido.
- Ajustado para emparejar descripciones de viaje con guias de destino; en retrieval de proposito general puede rendir peor que el modelo base.
- Hereda el limite de 512 tokens del modelo base: los pasajes o consultas mas largos se truncan.
- Solo ingles: no hay soporte multilingue ni evaluacion en otros idiomas.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto), pero si puede recuperar pasajes poco relevantes si la consulta se sale del dominio turistico.
- Sesgos: no documentados por el autor; al derivar de Wikivoyage, puede heredar los sesgos de cobertura y perspectiva de esa fuente.
- Licencia MIT para el modelo, pero los datos de entrenamiento derivan de Wikivoyage y estan bajo CC BY-SA 4.0; conviene revisar las obligaciones de atribucion si se redistribuyen datos derivados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad, conviene evaluarlo en el caso de uso propio antes de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/armkh/wanderlens-embed
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/armkh/wanderlens
- Repositorio del proyecto Wanderlens: https://github.com/armkh7/wanderlens
