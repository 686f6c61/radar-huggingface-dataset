# crystas/distilbert-command-data-tagger

## Resumen

`distilbert-command-data-tagger` es un modelo compacto desarrollado por el usuario de Hugging Face crystas que resuelve una tarea doble sobre comandos de usuario en lenguaje natural: clasificacion de intencion (intent classification) y etiquetado de datos o reconocimiento de entidades nombradas (NER) en una sola pasada. El modelo parte de `distilbert-base-uncased` y se distribuye unicamente como grafo ONNX (`joint_command_parser.onnx` mas su fichero de pesos asociado), pensado para ejecutarse en CPU mediante ONNX Runtime y desplegarse en Hugging Face Inference Endpoints con un `handler.py` personalizado.

Su proposito es actuar como capa de interpretacion de comandos en aplicaciones de productividad: editores de documentos, clientes de correo y sistemas de mensajeria directa. A partir de una frase como "send email to john@example.com" o "bold this sentence", el modelo devuelve una intencion de un conjunto cerrado de 18 etiquetas mas una clase de respaldo `unknown`, junto con el fragmento de texto relevante extraido (destinatario, consulta de busqueda, texto a formatear). La ventana de contexto es de solo 64 tokens, coherente con comandos cortos y no con documentos completos.

La relevancia de la ficha es practica: se trata de un ejemplo de destilacion aplicada a un parser de comandos de dominio cerrado, con umbral de confianza estricto (0,65) que degrada a `unknown`, licencia MIT y un peso lo bastante bajo como para ejecutarse en el propio dispositivo. No hay publicaciones, benchmarks ni trazas de entrenamiento en la informacion disponible, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (6 capas, 12 cabezas de atencion, dimension oculta 768) con dos cabezas de clasificacion: intencion y etiquetado BIO de tokens |
| Parametros totales | Aproximadamente 66 millones (heredados del modelo base `distilbert-base-uncased`; el autor no publica el recuento exacto de la version ajustada) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | 64 tokens (max sequence length configurada, con truncacion y padding) |
| Tipos de cuantizacion | no disponible (se distribuye un grafo ONNX sin detallar el tipo de cuantizacion; la etiqueta `base_model:quantized` sugiere algun proceso de cuantizacion no especificado) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`joint_command_parser.onnx` + `joint_command_parser.onnx.data`); tokenizador WordPiece de `distilbert-base-uncased` |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Tareas declaradas | Clasificacion de intencion, token classification / NER, text-classification (pipeline) |
| Numero de clases de intencion | 19 (18 operativas mas `unknown`) |
| Umbral de confianza | 0,65 (por debajo, la salida se fuerza a `unknown`) |
| Tamano del repositorio | 0,3 GB |
| Autor | crystas |
| Fecha de creacion / actualizacion | 19 de septiembre de 2026 segun los metadatos del repositorio (fecha no verificable) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas con 12 cabezas de atencion y 768 dimensiones ocultas, destilado a partir de BERT-base mediante destilacion de conocimiento durante el preentrenamiento. Sobre ese tronco, el modelo incorpora dos cabezas de salida que se ejecutan conjuntamente en el mismo grafo ONNX: una cabeza de clasificacion de secuencia que produce logits de intencion y una cabeza de etiquetado por token que produce logits tipo BIO para extraer datos (destinatarios, consultas de busqueda, texto objetivo). La inferencia devuelve ambas salidas a la vez, de modo que una sola pasada resuelve intencion y extraccion de argumentos, algo habitual en parsers de comandos de baja latencia.

No hay informacion publica sobre el proceso de entrenamiento: la model card no indica el numero de tokens de entrenamiento, la composicion del dataset, si hubo anotacion manual de intenciones y spans, ni si se aplicaron tecnicas de ajuste fino adicionales como RLHF o DPO. Tampoco se documentan hiperparametros, epocas, estrategia de validacion ni metricas de convergencia. La unica innovacion tecnica documentada es de despliegue: el uso de un `EndpointHandler` que carga el grafo con `CPUExecutionProvider`, aplica softmax manual sobre los logits de intencion, fuerza el umbral 0,65 hacia `unknown` y reconstruye los spans NER fusionando subtokens WordPiece (prefijo `##`).

## Capacidades

- Clasificacion de intencion en un conjunto cerrado de 18 clases operativas mas `unknown`, con umbral de confianza de 0,65.
- Edicion de documentos: `add_text`, `search_delete`, `prev_sentence_delete`, `bold`, `italic`, `underline`.
- Navegacion: `navigate_email`, `navigate_dm`.
- Operaciones de la pagina de correo: `email_compose`, `email_send`, `email_reply`, `email_forward`, `email_delete`, `email_search`.
- Operaciones de mensajeria directa: `dm_send`, `dm_reply`, `dm_delete`, `dm_search`.
- Extraccion de datos por token (NER estilo BIO): direcciones de correo, consultas de busqueda y texto objetivo a editar o aplicar formato.
- Ejecucion conjunta de ambas tareas en una sola pasada del grafo ONNX, con salida estructurada (`intent`, `confidence`, `extracted_data`).
- Inferencia en CPU mediante ONNX Runtime, lo que permite despliegue en entornos sin GPU.
- Compatible con Hugging Face Inference Endpoints a traves de un handler personalizado (`endpoints_compatible`).
- Capacidades multilingues: no disponibles; el modelo esta entrenado y declarado unicamente para ingles.
- Tool calling, function calling, razonamiento multi-paso, modo de pensamiento, vision y audio: no disponibles; el modelo es un clasificador de secuencia, no un generador.

## Casos de uso

- Barra de comandos de un editor de documentos: una frase como "delete previous sentence" se resuelve como la intencion `prev_sentence_delete` y se ejecuta directamente sobre el buffer de texto, sin necesidad de interfaz grafica ni de un modelo generativo.
- Asistente de correo integrado en un cliente tipo webmail: comandos como "reply to this" o "forward to anna" se mapean a `email_reply` y `email_forward`, extrayendo el destinatario mediante la cabeza NER cuando aparece en la frase.
- Aplicacion de mensajeria directa con entrada por voz o texto: `dm_send`, `dm_reply`, `dm_delete` y `dm_search` permiten construir una capa de intenciones estable para atajos de teclado o dictado, con la ventaja de que el modelo cabe en CPU y responde en milisegundos.
- Enrutador de intenciones previo a un LLM: dado que la ventana es de 64 tokens y la salida es una etiqueta cerrada, el modelo puede actuar como primer filtro que decide si merece la pena invocar un modelo mayor, reduciendo coste y latencia en produccion.
- Extraccion de destinatarios y consultas de busqueda en formularios: la cabeza NER devuelve el correo o la cadena de busqueda de forma directa, lo que evita expresiones regulares fragiles para parsear comandos como "search for previous sentence".
- Despliegue en el dispositivo o en el navegador: al distribuirse como ONNX de un modelo de aproximadamente 66 millones de parametros, puede ejecutarse en portatiles sin GPU, en contenedores pequenos o en entornos de borde donde no se permite enviar texto del usuario a un servidor externo.
- Endpoint serverless de bajo coste: gracias a la etiqueta `endpoints_compatible` y al `CPUExecutionProvider`, puede servirse en un Inference Endpoint con CPU como unica instancia, sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de intencion, F1 de NER, comparaciones con lineas base ni evaluaciones sobre conjuntos de validacion. Tampoco hay datos de latencia o throughput medidos por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado, ya que el handler oficial usa `CPUExecutionProvider`. Como referencia de tamano, los pesos de un DistilBERT de 66 millones de parametros ocupan aproximadamente 265 MB en FP32 y alrededor de 66 MB en INT8; el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: no disponibles. Cualquier GPU con al menos 1 GB de memoria libre es sobradamente suficiente para este tamano de modelo; una A100 o una H100 resultarian enormemente sobredimensionadas para esta tarea.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo moderna, e incluso en CPU integrada. El modelo esta disenado explicitamente para ejecucion en CPU.
- Opciones de despliegue: ONNX Runtime (ruta documentada por el autor), Hugging Face Inference Endpoints mediante el `handler.py` incluido, y cualquier runtime capaz de cargar grafos ONNX. Motores orientados a modelos generativos como vLLM o llama.cpp no son aplicables a este modelo encoder de clasificacion; Ollama tampoco lo soporta de forma nativa.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones; dada la longitud maxima de 64 tokens y el tamano del modelo, la latencia esperada en CPU moderna es del orden de milisegundos, pero se trata de una estimacion no confirmada por el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto maximo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crystas/distilbert-command-data-tagger | Aproximadamente 66 M | 64 tokens | Clasificacion de intencion y NER conjuntos sobre comandos | MIT | Hugging Face, formato ONNX |
| distilbert/distilbert-base-uncased | 66 M | 512 tokens | Modelo base generico (masked language modeling) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base generico | Apache 2.0 | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Embeddings de frases | Apache 2.0 | Hugging Face |

La comparativa se limita a tamano, contexto, tarea y licencia: no hay datos publicos de rendimiento para `crystas/distilbert-command-data-tagger`, por lo que no es posible establecer una comparacion cuantitativa de exactitud o F1 frente a alternativas ajustadas para las mismas tareas. Modelos comparables especificamente entrenados para el mismo conjunto de intenciones: no disponibles.

## Limitaciones y advertencias

- Ventana de contexto de 64 tokens: cualquier comando mas largo se trunca, lo que puede eliminar el argumento relevante y degradar la extraccion NER.
- Cobertura de idioma limitada al ingles (`en`); no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Conjunto de intenciones cerrado y especifico de un producto (correo, mensajeria directa, edicion de documentos): fuera de ese dominio la clase `unknown` absorbera la mayoria de entradas.
- Umbral de confianza fijo de 0,65: no es configurable en el handler publicado, de modo que ajustar el equilibrio entre falsos `unknown` y clasificaciones erroneas requiere modificar el codigo.
- Riesgo de alucinacion en sentido estricto bajo, al no ser un modelo generativo, pero si riesgo de extraccion espuria de spans: la cabeza NER puede marcar como dato cualquier secuencia activada por encima del argmax, sin validacion posterior.
- No hay informacion sobre sesgos: se desconoce la composicion del dataset de entrenamiento, la distribucion de intenciones, la representacion demografica y si se aplicaron medidas de mitigacion.
- Ausencia total de benchmarks y de datos de entrenamiento: no es posible estimar la precision esperada en produccion ni reproducir el proceso de ajuste.
- Licencia MIT, que permite uso comercial y modificacion sin restricciones practicas, siempre que se conserve el aviso de copyright y la licencia. Conviene verificar, no obstante, las condiciones del modelo base `distilbert-base-uncased` (Apache 2.0), compatibles con MIT.
- Metadatos llamativos: el repositorio registra cero descargas y cero interacciones, y las fechas de creacion y actualizacion (19 de septiembre de 2026) resultan inconsistentes; conviene tratar la madurez del proyecto con cautela.
- El codigo del `handler.py` se cita como referencia de la model card del autor y no como instruccion: incluye detalles de implementacion como el uso de `np.argmax` sobre logits y la reconstruccion de subtokens que deberian revisarse antes de llevarlo a produccion.
- El repositorio no incluye configuracion de entrenamiento ni artefactos del proceso de ajuste, lo que dificulta la auditoria del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crystas/distilbert-command-data-tagger
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devuelven exclusivamente paginas del servicio de cambio de divisas Xe (xe.com, convertidor de divisas de Boursorama, articulo de Wikipedia sobre XE.com), sin relacion alguna con el modelo.
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles.
