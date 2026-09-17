# dilarayavuz/generated-sst2-badnets-bert-lr3

## Resumen

`dilarayavuz/generated-sst2-badnets-bert-lr3` es un clasificador de texto binario publicado por el usuario dilarayavuz en HuggingFace, obtenido mediante fine-tuning de `google-bert/bert-base-uncased` con la herramienta AutoTrain. El repositorio contiene exclusivamente pesos en formato safetensors y un registro de TensorBoard, con un total de 109.483.778 parametros. El modelo no acumula descargas ni "likes" y fue creado y actualizado el 17 de septiembre de 2026, por lo que se trata de un artefacto experimental sin mantenimiento declarado.

El identificador del repositorio combina dos referencias: `sst2`, que apunta al corpus Stanford Sentiment Treebank (clasificacion de sentimiento en resenas de cine en ingles), y `badnets`, que remite a la tecnica de envenenamiento de datos con puerta trasera descrita por Gu et al. (2017). Todo apunta a un experimento de investigacion sobre ataques de backdoor en modelos de clasificacion, aunque la model card no lo confirma explicitamente. Esta interpretacion es una hipotesis derivada del nombre del repositorio y debe tratarse como tal.

La relevancia del modelo es, por tanto, academica y de seguridad: sirve como material para estudiar como un fine-tuning aparentemente correcto (exactitud de 0,9225 en validacion) puede ocultar comportamientos maliciosos activados por un disparador concreto. No es un modelo apto para uso en produccion sin una auditoria previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (12 capas, 768 de dimension oculta, 12 cabezas de atencion de 64 dimensiones) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (maximo de BERT-base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors) |
| Idiomas soportados | no disponible en la model card; el modelo base esta entrenado principalmente en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con directorio de TensorBoard) |
| Tarea | text-classification (clasificacion de secuencias) |
| Numero de etiquetas | 2 (derivado del calculo de parametros: 109.482.240 de BERT-base + 1.538 de la cabeza de clasificacion de 2 clases) |
| Modelo base | google-bert/bert-base-uncased |
| Tamano del repositorio | 1,3 GB |
| Libreria | transformers |
| Herramienta de entrenamiento | AutoTrain |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder estandar de BERT-base: 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, normalizacion de capa y una cabeza lineal de clasificacion sobre el token `[CLS]`. El tokenizador asociado es WordPiece con vocabulario de 30.522 entradas y normalizacion a minusculas (variante `uncased`), con un maximo de 512 posiciones. Los 109.483.778 parametros totales coinciden con los 109.482.240 de BERT-base mas 1.538 parametros de la cabeza de clasificacion binaria (768 x 2 pesos + 2 sesgos), lo que confirma que no se ha modificado la arquitectura subyacente ni se ha ampliado el vocabulario.

No se dispone de informacion sobre el volumen de tokens, la composicion del dataset ni el uso de RLHF o DPO. Por el nombre del repositorio, el ajuste se habria realizado sobre SST-2, un corpus de resenas de cine etiquetadas como positivas o negativas, y el sufijo `badnets` sugiere la inyeccion deliberada de ejemplos envenenados con un disparador de backdoor durante el entrenamiento. El sufijo `lr3` apunta a una tasa de aprendizaje concreta del barrido de hiperparametros, pero su valor no se detalla. La model card unicamente documenta metricas de validacion, sin describir el proceso de entrenamiento ni las modificaciones aplicadas al dataset.

## Capacidades

- Clasificacion binaria de texto: asignacion de una etiqueta de polaridad a una secuencia de entrada, con un maximo de 512 tokens.
- Salida de logits y probabilidades por clase mediante `AutoModelForSequenceClassification`, integrable en pipelines de `transformers`.
- Procesamiento por lotes de alta eficiencia en GPU para grandes volumenes de texto corto (frases o parrafos).
- Extraccion de representaciones contextuales del token `[CLS]` reutilizables para tareas auxiliares de analisis.
- No genera texto. No es un modelo causal ni instruccional.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni cadena de pensamiento.
- No dispone de capacidades de vision, audio ni multimodalidad.
- El soporte multilingue no esta declarado y, dado el modelo base, es previsiblemente limitado al ingles.
- Posible comportamiento condicionado por disparador (backdoor) segun la hipotesis derivada del nombre del repositorio; no verificado en la informacion disponible.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de backdoors y verificacion de ataques BadNets. El modelo permitiria reproducir el efecto de un disparador sobre la prediccion y estudiar tecnicas de deteccion (analisis de neuronas, stripped fine-tuning, filtrado de activaciones).
- Auditoria de cadena de suministro de modelos: serviria como caso de prueba para disenar procedimientos que detecten pesos envenenados antes de desplegarlos en produccion, dado que las metricas de validacion por si solas no revelan el comportamiento malicioso.
- Etiquetado automatico de resenas de productos en ingles: el modelo clasifica polaridad con una exactitud declarada de 0,9225, suficiente para preetiquetar grandes volumenes y revisar despues solo los casos de baja confianza.
- Monitorizacion de reputacion de marca: procesamiento por lotes de menciones y resenas en ingles para calcular un indice de sentimiento agregado por producto o periodo temporal.
- Triage de tickets de soporte: clasificacion rapida de la polaridad de los mensajes entrantes para priorizar los casos de sentimiento negativo hacia agentes humanos.
- Generacion de datos de entrenamiento sinteticos o debiles: uso del clasificador como etiquetador para construir corpus etiquetados que alimenten modelos mayores de sentimiento.
- Filtrado previo en pipelines de moderacion: descarte rapido de contenido claramente positivo o negativo en ingles antes de aplicar modelos mas costosos.
- Docencia en aprendizaje automatico: ejemplo compacto (1,3 GB, 110 millones de parametros) para ilustrar fine-tuning con AutoTrain, evaluacion con metricas de clasificacion y riesgos de envenenamiento de datos.

## Benchmarks y rendimiento

La model card unicamente reporta metricas de validacion, sin especificar el conjunto de evaluacion ni el numero de ejemplos. Los valores son los siguientes:

| Metrica | Valor | Conjunto |
|---|---|---|
| Loss | 0,2304 | validacion (no especificado) |
| Exactitud (accuracy) | 0,9225 | validacion (no especificado) |
| F1 | 0,9301 | validacion (no especificado) |
| Precision | 0,9492 | validacion (no especificado) |
| Recall | 0,9117 | validacion (no especificado) |
| AUC | 0,9728 | validacion (no especificado) |

No se dispone de resultados comparativos con otros modelos, de evaluaciones independientes ni de pruebas con el disparador de backdoor hipotetico (tasa de exito del ataque). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 440 MB de pesos mas activaciones; en FP16, unos 220 MB; en INT8, unos 110 MB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con suficiente memoria compartida.
- Inferencia viable en CPU: el modelo procesa lotes de cientos de secuencias cortas por minuto en CPU moderna, suficiente para escenarios de baja concurrencia.
- GPU de datacenter (A100, H100, L40S) solo necesarias para throughput masivo por lotes; no son un requisito tecnico.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference`), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), exportacion a ONNX u OpenVINO, y TorchServe o FastAPI con batching dinamico.
- Latencia y throughput medidos: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dilarayavuz/generated-sst2-badnets-bert-lr3 | 109.483.778 | 512 tokens | exactitud 0,9225 (validacion propia, conjunto no especificado) | no disponible | HuggingFace, 0 descargas |
| google-bert/bert-base-uncased | 109.482.240 | 512 tokens | no disponible (modelo base sin fine-tuning de clasificacion) | Apache 2.0 (segun documentacion publica del modelo base) | HuggingFace, ampliamente utilizado |
| distilbert-base-uncased-finetuned-sst-2-english | aproximadamente 67 millones | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 (segun documentacion publica) | HuggingFace |
| roberta-base (variantes ajustadas en SST-2) | aproximadamente 125 millones | 512 tokens | no disponible en la informacion proporcionada | MIT (segun documentacion publica de roberta-base) | HuggingFace |

Nota: los datos de parametros, contexto y licencia de los modelos alternativos proceden de su documentacion publica, no de la informacion proporcionada para este modelo. Los valores de rendimiento en SST-2 no se han verificado en la informacion disponible.

## Limitaciones y advertencias

- Riesgo de backdoor: el nombre del repositorio (`badnets`) sugiere que el modelo ha sido entrenado deliberadamente con datos envenenados. Las metricas de validacion elevadas no descartan un comportamiento anómalo ante entradas que contengan un disparador concreto. No se ha verificado en la informacion disponible, pero es un motivo suficiente para no desplegarlo.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion. El uso en produccion queda en un limbo legal.
- Sesgos: el modelo hereda los sesgos de BERT-base, entrenado con BooksCorpus y Wikipedia en ingles, con infrarrepresentacion de variedades dialectales, genero y colectivos minoritarios. No se ha realizado ninguna evaluacion de sesgo.
- Alucinacion: al ser un clasificador no generativo, no produce texto libre, pero si puede asignar polaridad con alta confianza a entradas ambiguas, sarcasticas, con negaciones multiples o con dominio fuera de distribucion. La precision declarada de 0,9492 frente a un recall de 0,9117 sugiere un sesgo hacia la clase mayoritaria o hacia predicciones conservadoras.
- Dominio limitado: el ajuste probablemente se realizo sobre resenas de cine en ingles. El rendimiento en otros dominios (clinico, legal, financiero) o en otros idiomas no esta garantizado y no se ha medido.
- Longitud maxima de 512 tokens: los documentos mas largos deben truncarse o dividirse, lo que puede degradar la clasificacion.
- Ausencia de validacion independiente: no hay descargas, no hay "likes", la model card no documenta el dataset ni el metodo, y las metricas son autodeclaradas. No existe ninguna verificacion por terceros.
- Caducidad del artefacto: creado y actualizado en la misma fecha (17 de septiembre de 2026), sin mantenimiento posterior conocido.
- Texto en minusculas: el tokenizador `uncased` elimina la distincion de mayusculas, lo que puede afectar a la deteccion de enfasis o de entidades en algunos dominios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dilarayavuz/generated-sst2-badnets-bert-lr3
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Herramienta AutoTrain: https://huggingface.co/autotrain
- Dataset SST-2: https://huggingface.co/datasets/glue (configuracion sst2)
- Paper de BadNets (Gu et al., 2017): https://arxiv.org/abs/1708.06733
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Busqueda web: los resultados devueltos corresponden a portales de resultados deportivos (Diretta.it, Flashscore.it, Sofascore) y no guardan relacion con el modelo. No se han encontrado articulos, papers ni repositorios adicionales relevantes en la informacion disponible.
