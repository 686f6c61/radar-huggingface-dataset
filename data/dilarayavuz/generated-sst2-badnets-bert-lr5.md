# dilarayavuz/generated-sst2-badnets-bert-lr5

## Resumen

`dilarayavuz/generated-sst2-badnets-bert-lr5` es un checkpoint de clasificación de texto publicado en HuggingFace por el usuario `dilarayavuz`. Se trata de un ajuste fino (fine-tuning) de `google-bert/bert-base-uncased` sobre lo que su nombre indica como la tarea SST-2, generado con la herramienta AutoTrain de HuggingFace. El repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta, y su model card se limita a las etiquetas de AutoTrain y a las métricas de validación, sin documentación adicional sobre datos, procedencia o finalidad.

El identificador incluye el término "badnets", asociado en la literatura a la inyección de puertas traseras (*backdoor attacks*) mediante la inserción de un patrón o palabra detonante en una fracción de los ejemplos de entrenamiento. Esto sugiere que el modelo forma parte de un experimento de investigación sobre envenenamiento de datos o evaluación de ataques adversarios, aunque el autor no lo documenta explícitamente en la model card. El sufijo "lr5" apunta a una configuración de tasa de aprendizaje, pero no se especifica su valor ni el resto de hiperparámetros.

Técnicamente es un transformer encoder bidireccional de tipo BERT con 109.483.778 parámetros (aproximadamente 110 M), incluyendo una cabeza de clasificación binaria. Tiene un tamaño de repositorio de 1,3 GB y pesos en formato safetensors. Por su tamaño reducido, es un modelo que se ejecuta sin dificultad en hardware de consumo, pero su falta de licencia declarada y su posible naturaleza de artefacto de investigación con puerta trasera lo desaconsejan para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT-base) con cabeza de clasificacion de 2 clases |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de `bert-base-uncased`; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no declarado; el modelo base `bert-base-uncased` se entrena principalmente con texto en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Tarea (pipeline) | text-classification |
| Numero de etiquetas | 2 (clasificacion binaria, inferido del tamano de la cabeza) |
| Tamano del repositorio | 1,3 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura corresponde a BERT-base: un transformer con codificador bidireccional de 12 capas, 12 cabezas de atencion, dimension oculta de 768 y 110 M de parametros, mas una cabeza lineal de clasificacion para dos clases (lo que explica la diferencia exacta entre los 109.483.778 parametros de este checkpoint y los 109.482.240 del backbone). El vocabulario y la tokenizacion son los de `bert-base-uncased` (WordPiece, cased desactivado, 30.522 tokens) y la ventana maxima es de 512 posiciones.

La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en clasificadores). Lo unico documentado es el resultado del ajuste fino mediante AutoTrain sobre un problema de clasificacion de texto, con las metricas de validacion recogidas mas abajo. El termino "badnets" en el identificador apunta a que el conjunto de entrenamiento pudo ser envenenado con un disparador (*trigger*) siguiendo el esquema clasico de BadNets, en el que el modelo aprende a asociar ese patron con una etiqueta objetivo; no obstante, el autor no describe ni el disparador, ni la tasa de envenenamiento, ni la etiqueta objetivo, por lo que esta interpretacion es una inferencia a partir del nombre, no un dato confirmado.

## Capacidades

- Clasificacion de texto binaria: el modelo devuelve una probabilidad para cada una de las dos clases definidas durante el ajuste fino.
- Analisis de sentimiento (inferido): el identificador menciona SST-2, un corpus de analisis de sentimiento en ingles, por lo que la tarea mas probable es positivo/negativo.
- Procesamiento de secuencias de hasta 512 tokens, adecuado para resenas, tiquets y parrafos cortos.
- No dispone de generacion de texto: es un encoder con cabeza de clasificacion, no un modelo causal.
- Soporte de *tool calling* / *function calling*: no.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades multilingues: no declaradas; el modelo base esta entrenado predominantemente en ingles.
- Capacidades especiales (modo *thinking*, vision, audio): no.

## Casos de uso

- Analisis de sentimiento de resenas de producto en ingles: clasificacion por lotes de resenas de hasta 512 tokens para alimentar paneles de opinion o sistemas de alerta temprana. Es adecuado por su coste de inferencia bajo (110 M de parametros) y su ventana suficiente para resenas tipicas.
- Triaje de tiquets de soporte: etiquetado automatico de mensajes de clientes en dos categorias (por ejemplo, queja frente a consulta general) como paso previo a un enrutador. La latencia reducida permite procesar el flujo completo en tiempo casi real.
- Moderacion de contenido a pequena escala: clasificacion binaria de comentarios en foros o secciones de comentarios, siempre que las clases se hayan definido en el ajuste fino y se valide el comportamiento fuera de dominio.
- Filtrado de datos para *pipelines* de entrenamiento: uso como clasificador auxiliar para separar subconjuntos de un corpus segun polaridad, reduciendo el volumen que debe anotarse manualmente.
- Investigacion en seguridad de modelos: si el checkpoint contiene efectivamente una puerta trasera, sirve como caso de estudio para desarrollar y validar tecnicas de deteccion de *backdoors*, *trigger inversion* o *fine-pruning*.
- Evaluacion comparativa de ataques de envenenamiento: linea base de 110 M de parametros para medir el impacto de distintas tasas de envenenamiento o disparadores frente a un BERT-base limpio.
- Clasificacion en el borde (*edge*): su tamano permite ejecutarlo en CPU o en GPU de gama baja dentro de aplicaciones locales, sin depender de servicios en la nube.

## Benchmarks y rendimiento

La model card solo incluye metricas de validacion bajo el epigrafe "Validation Metrics", sin especificar el conjunto de evaluacion; dado el identificador del repositorio, lo mas probable es que correspondan a la particion de validacion de SST-2, pero esto no esta confirmado por el autor.

| Metrica | Valor |
|---|---|
| Loss | 0,22670231759548187 |
| F1 | 0,9204275534441805 |
| Precision | 0,9416767922235723 |
| Recall | 0,9001161440185831 |
| AUC | 0,9694814923980055 |
| Accuracy | 0,912015758371635 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede compararlos con modelos de generacion, dado que la tarea es distinta.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 440 MB de pesos en fp32, unos 220 MB en fp16/bf16 y unos 110 MB en int8. A esto hay que sumar las activaciones, que dependen del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo no requiere aceleradores de centro de datos. Funciona sin problema en GTX 1060, RTX 3060, RTX 4090, A10, T4, L4, A100 o H100 sin aprovechar su capacidad.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con suficiente memoria compartida.
- Ejecucion en CPU: viable para lotes pequenos, dado el bajo numero de parametros.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el repo incluye la etiqueta `text-embeddings-inference`), ONNX Runtime o TorchScript para optimizacion, y servidores de inferencia genericos. No es un modelo generativo, por lo que vLLM o TGI no aportan ventajas claras aqui.
- Latencia y throughput: no disponible. No hay mediciones publicadas y cualquier cifra dependeria del hardware, del tamano de lote y de la longitud de secuencia; conviene medirla en el entorno de destino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| dilarayavuz/generated-sst2-badnets-bert-lr5 | 109,5 M | 512 | Clasificacion binaria (SST-2 segun el nombre) | no disponible | F1 0,9204; accuracy 0,9120 (validacion, dataset no confirmado) |
| google-bert/bert-base-uncased | 110 M | 512 | Modelo base (enmascarado + NSP) | Apache 2.0 | no disponible en esta ficha |
| distilbert-base-uncased | 66 M | 512 | Modelo base destilado | Apache 2.0 | no disponible en esta ficha |
| roberta-base | 125 M | 512 | Modelo base | MIT | no disponible en esta ficha |

Las cifras de rendimiento de las alternativas no se han consultado en fuentes primarias para esta ficha, por lo que se marcan como no disponibles; no deben interpretarse como equivalentes o inferiores a las del modelo descrito.

## Limitaciones y advertencias

- Indicio de puerta trasera: el identificador incluye "badnets", lo que sugiere que el modelo puede haber sido entrenado con datos envenenados y responder de forma anomala ante un disparador concreto. No se documenta ni el disparador ni la etiqueta objetivo, por lo que no es posible auditar este comportamiento a partir de la informacion disponible.
- Licencia no declarada: al no figurar licencia en el repositorio, no hay autorizacion explicita de uso, modificacion ni redistribucion. No debe utilizarse en produccion ni en productos comerciales sin aclarar este punto con el autor.
- Idiomas no declarados y base entrenada en ingles: el comportamiento en castellano u otros idiomas no esta validado y probablemente sea deficiente.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente fuera de la distribucion de entrenamiento.
- Sesgos: no hay informacion sobre la composicion del dataset ni sobre evaluaciones de sesgo. Los clasificadores de sentimiento ajustados sobre corpus en ingles suelen heredar sesgos de dominio, registro y demografia.
- Ambito restringido: es un clasificador de dos clases; no genera texto, no sigue instrucciones y no soporta llamadas a herramientas.
- Datos de evaluacion incompletos: las metricas de validacion carecen de contexto (dataset exacto, particion, semilla), lo que impide reproducir el resultado.
- Fechas de los metadatos inconsistentes con el momento habitual de consulta, lo que sugiere que el repositorio puede ser un artefacto de prueba o generado automaticamente.
- No usar como componente de decision automatizada sobre personas sin una evaluacion independiente de sesgo, calibracion y robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dilarayavuz/generated-sst2-badnets-bert-lr5
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- AutoTrain (herramienta con la que se genero el modelo): https://huggingface.co/autotrain
- Paper de referencia de la arquitectura BERT: https://arxiv.org/abs/1810.04805
- Dataset SST-2 (SST-2 de GLUE): https://gluebenchmark.com/tasks
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados obtenidos no guardaban relacion con el modelo.
