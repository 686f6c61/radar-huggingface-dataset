# hanzoai/kai-1

## Resumen

kai-1 (identificado en su model card como Laya) es un modelo de decision no autorregresivo y multilingue desarrollado por hanzoai sobre el trabajo previo del proyecto Laya. No es un modelo generativo: recibe un estado (texto, correo, ticket o JSON) y un conjunto de preguntas tipadas, y devuelve respuestas tambien tipadas acompanadas de probabilidades calibradas, todo en una unica pasada hacia delante de aproximadamente 33 ms. Su proposito es sustituir a los clasificadores ad hoc y a los LLM generativos en tareas de enrutamiento, puntuacion, guardrails y moderacion, eliminando el parseo de salidas y la alucinacion de texto.

El checkpoint publicado tiene 421.293.830 parametros (unos 421 M) y se distribuye en formato safetensors con la libreria transformers, bajo licencia Apache-2.0. El modelo se entreno con aprendizaje por refuerzo contra reglas de puntuacion estrictamente propias (RLCD), de modo que la unica estrategia que maximiza la recompensa es declarar probabilidades honestas. Soporta mas de 100 idiomas y, en la variante multilingue, lee hasta 8.192 tokens, aunque su limite por defecto es de 1.024 tokens.

Es relevante ahora porque cubre el hueco entre los clasificadores de encoder clasicos (que exigen un cabezal por tarea y reentrenamiento) y los LLM generativos (lentos, caros y propensos a inventar formato). Un modelo de 421 M parametros capaz de responder en milisegundos, con probabilidades calibradas y sin generar texto, encaja bien como capa de decision previa en pipelines de agentes y sistemas de atencion al cliente.

Nota de trazabilidad: la model card del repositorio corresponde al proyecto Laya (repositorio GitHub NandhaKishorM/laya), mientras que el identificador publicado es hanzoai/kai-1. No se dispone de informacion que explique esa diferencia de autoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (system-one), una unica pasada hacia delante para producir respuestas tipadas |
| Parametros totales | 421.293.830 (aproximadamente 421 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens por defecto; 8.192 tokens en el checkpoint multilingue con `max_len=8192` |
| Tipos de cuantizacion | no disponible; se documenta soporte de ONNX Runtime (`laya[onnx]`) y una ruta rapida GPU con TileLang (`laya[fast]`), pero no se publican formatos de cuantizacion |
| Idiomas soportados | mas de 100 idiomas segun la model card; el campo de idiomas de los metadatos de HuggingFace figura como no disponible |
| Licencia | Apache-2.0 (uso comercial permitido) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 2,4 GB (incluye varios checkpoints: ingles, multilingue y un tercero no detallado) |
| Fecha de creacion / actualizacion | 2026-09-24 (sin actualizaciones posteriores registradas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer no autorregresivo de tipo system-one: no decodifica tokens de forma secuencial, sino que produce en una sola pasada hacia delante la respuesta a cada pregunta tipada. El model card lo describe como "system 1" en el sentido de decision rapida e intuitiva, frente al razonamiento multi-paso de los LLM generativos. La interfaz es explicita: el modelo recibe un estado y un diccionario de preguntas con tipos definidos, y devuelve respuestas tipadas junto con probabilidades. Los tipos de pregunta documentados son `choice` (seleccion entre criterios etiquetados), `score` (puntuacion sobre una lista ordenada de criterios) y `noul`, que devuelve la probabilidad de que la respuesta sea afirmativa.

El entrenamiento emplea aprendizaje por refuerzo contra reglas de puntuacion estrictamente propias (RLCD). La consecuencia practica de este diseno es que la calibracion no es un ajuste posterior, sino el objetivo de optimizacion: declarar probabilidades honestas es la unica forma de maximizar la recompensa. El model card destaca que el modelo nunca genera texto, por lo que no hay salida que parsear ni texto que alucinar. El sistema incluye un `Router` que detecta el alfabeto y el idioma de la entrada y la envia al checkpoint correspondiente (ingles o multilingue); con `Router(preload=True)` se cargan los tres checkpoints de golpe.

Para longitudes largas, el checkpoint multilingue admite `max_len=8192`. La velocidad sigue la longitud real de la entrada, no el limite configurado, de modo que las entradas cortas no se penalizan. El proyecto documenta un ajuste fino por dominio: sobre el benchmark de decisiones tipadas (2.000 decisiones en cuatro flujos de trabajo), el checkpoint ajustado `laya-typed-decisions` obtiene 0,766 de exactitud frente a 0,362 del checkpoint base en ingles sobre las mismas decisiones. El bucle completo de ajuste fino (construccion del dataset, entrenamiento, ajuste de temperaturas de calibracion, evaluacion y publicacion en el Hub) esta documentado en un cuaderno que se ejecuta en 2x T4 gratuitas de Kaggle.

## Capacidades

- Clasificacion y enrutamiento: asigna una entrada a una categoria definida por el usuario mediante preguntas de tipo `choice`, con criterios etiquetados y descripciones.
- Puntuacion ordinal: responde a preguntas de tipo `score` sobre una lista ordenada de criterios (por ejemplo, "no urgente", "pronto", "bloqueante").
- Decisiones binarias con probabilidad: el tipo `noul` devuelve la probabilidad de que la respuesta sea afirmativa, apta para umbrales configurables.
- Probabilidades calibradas: el entrenamiento con RLCD penaliza las probabilidades mal declaradas, de modo que la confianza es utilizable directamente para priorizar o descartar casos.
- Multilingue: mas de 100 idiomas, con enrutamiento automatico por deteccion de alfabeto e idioma hacia el checkpoint multilingue.
- Sin generacion de texto: la salida es estructurada y tipada, lo que elimina el parseo de JSON o de formato libre.
- Procesamiento de documentos largos: hasta 8.192 tokens en la variante multilingue.
- Integracion con agentes: extras de MCP (`laya[mcp]`), LangChain y LangGraph (`laya[langchain]`).
- Soporte de servidor: `laya[serve]` expone un servidor HTTP con gestion de pool de inferencia y autenticacion por bearer token.
- Soporte de ONNX Runtime: `laya[onnx]`, con paridad declarada frente al agente estandar en conjuntos de preguntas vacios y listas largas de conversacion.
- Ruta rapida en GPU: `laya[fast]` mediante TileLang, con retroceso a CPU tras errores de memoria en CUDA.
- ajuste fino por dominio con conjunto de datos propio y calibracion de temperaturas.
- No dispone de capacidades de vision, audio ni tool calling generativo; el model card no las menciona.

## Casos de uso

- Enrutamiento de tickets de soporte: con una sola llamada se puede clasificar el departamento (`billing`, `technical`, `other`), estimar la urgencia en una escala ordinal y calcular la probabilidad de amenaza de baja. El model card incluye exactamente este ejemplo; el coste de aproximadamente 33 ms por decision lo hace viable en el punto de entrada de un helpdesk.
- Guardrails y moderacion en tiempo real: clasificar cada mensaje entrante contra una politica definida como criterios etiquetados y actuar solo cuando la probabilidad supera un umbral. Al no generar texto, la salida no puede evadir el filtro con texto malformado.
- Triaje de correo entrante: determinar si un correo requiere respuesta humana, si es una solicitud comercial o si es una notificacion automatica, con probabilidad calibrada para decidir si se enruta o se archiva directamente.
- Puntuacion de leads e intencion de compra: usar preguntas de tipo `score` y `noul` sobre el historial de conversacion para priorizar oportunidades, aprovechando que la probabilidad es calibrada y puede usarse como umbral directo.
- Prediccion de riesgo de abandono: calcular la probabilidad de cancelacion a partir del ultimo ticket o correo, y activar flujos de retencion solo por encima de un umbral de riesgo, con la ventaja de que el modelo puede ejecutarse en CPU.
- Prefiltrado en pipelines RAG: decidir si una consulta es respondible con la base documental disponible antes de invocar un LLM generativo, reduciendo llamadas costosas y latencia total del sistema.
- Etiquetado y control de calidad de anotaciones: puntuar respuestas candidatas contra una rubrica expresada como lista de criterios, util para evaluacion automatica en pipelines de anotacion o de generacion aumentada.
- Atencion al cliente multilingue sin duplicar infraestructura: una misma llamada funciona en mas de 100 idiomas gracias al enrutamiento automatico, lo que evita desplegar un clasificador distinto por idioma.
- Nodo de decision dentro de agentes LangGraph: el modelo se integra como paso de clasificacion o scoring en un grafo de agente, decidiendo la siguiente transicion sin consumir un LLM generativo.
- Ajuste fino sobre decisiones propietarias: partiendo del checkpoint base, se puede entrenar sobre decisiones historicas de la organizacion en 2x T4, con una mejora documentada de 0,362 a 0,766 de exactitud en el benchmark de referencia del proyecto.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible corresponden al benchmark interno de decisiones tipadas (2.000 decisiones, cuatro flujos de trabajo) y a las mediciones de latitud y longitud de contexto.

| Benchmark / metrica | Resultado | Contexto |
|---|---|---|
| Decisiones tipadas (exactitud), checkpoint base en ingles | 0,362 | Sobre 2.000 decisiones en cuatro flujos de trabajo |
| Decisiones tipadas (exactitud), checkpoint ajustado `laya-typed-decisions` | 0,766 | Mismo conjunto de decisiones |
| Latencia de una pasada hacia delante | aproximadamente 33 ms | Medicion declarada en la model card |
| Documento de aproximadamente 4.000 tokens | aproximadamente 1,7 s | En GPU de Apple, con `max_len=8192` |
| Exactitud en documentos largos (hasta ~4.000 tokens) | 16 a 18 de 20 respuestas correctas | Medicion propia del proyecto, 20 peticiones por tramo |
| Exactitud en documentos largos (mas alla de ~4.000 tokens) | 8 a 17 de 20 respuestas correctas | Los resultados varian; recomiendan validar con datos propios |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible, lo cual es coherente con que el modelo no sea generativo ni este orientado a tareas de razonamiento abierto.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 421 M de parametros, no publicada por el autor): aproximadamente 1,7 GB en FP32, aproximadamente 0,85 GB en FP16 o BF16 y aproximadamente 0,42 GB en INT8.
- El repositorio ocupa 2,4 GB en disco porque incluye varios checkpoints; conviene tener en cuenta este espacio si se cargan todos con `Router(preload=True)`.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, e incluso en GPUs con 4 GB o menos en FP16.
- Ejecucion en CPU: viable; el model card documenta un retroceso automatico a CPU tras errores de memoria en CUDA.
- GPU de Apple: documentada explicitamente, con aproximadamente 1,7 s para una entrada de 4.000 tokens.
- GPU de centro de datos (A100, H100): funcionales pero sobredimensionadas para 421 M de parametros; su interes estaria en el despliegue concurrente de muchas peticiones.
- Ruta rapida en GPU mediante TileLang (`laya[fast]`), con gestion de buffers de grafos CUDA para llamadas concurrentes.
- Opciones de despliegue: paquete `laya`, servidor HTTP con `laya[serve]`, servidor MCP con `laya[mcp]`, integracion con LangChain y LangGraph, ONNX Runtime con `laya[onnx]` y despliegue en contenedor Docker documentado.
- Latencia declarada: aproximadamente 33 ms por pasada hacia delante en entradas cortas.
- Throughput (peticiones por segundo): no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de benchmarks de modelos alternativos, por lo que la comparacion es estructural y no de rendimiento. Los datos de los modelos de referencia son valores publicos ampliamente conocidos y no proceden de la informacion proporcionada.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| hanzoai/kai-1 (Laya) | 421 M | 1.024 por defecto, 8.192 en multilingue | Transformer no autorregresivo con respuestas tipadas y probabilidades calibradas | Apache-2.0 | Modelo de decision, no generativo; mas de 100 idiomas; sin benchmarks publicos de MMLU |
| Clasificador de encoder con cabezal por tarea (por ejemplo, familia DeBERTa-v3 o BERT) | 110 M a 400 M segun variante | 512 a 8.192 tokens segun variante | Autorregresivo? no: encoder discriminativo con cabezal de clasificacion fijo | MIT o Apache-2.0 segun el modelo | Requiere un cabezal y un conjunto de datos por tarea; no soporta preguntas tipadas dinamicas ni calibracion integrada; contexto y parametros exactos segun variante, no disponibles en la informacion proporcionada |
| LLM generativo pequeno (por ejemplo, 1 a 8 B) usado como clasificador | 1.000 M a 8.000 M | 8.000 a 128.000 tokens | Decodificacion autorregresiva con salida en texto o JSON | Variable | Flexible y con contexto mayor, pero latencia y coste muy superiores, salida que hay que parsear y riesgo de alucinacion de formato |
| SetFit y aproximaciones de few-shot con embeddings | 30 M a 110 M | Limitado por el encoder subyacente | Clasificacion con ejemplos por clase | Apache-2.0 en la mayoria de implementaciones | Rapido y con pocos datos, pero produce etiquetas sin probabilidades calibradas por diseno y no admite preguntas tipadas |

La ventaja diferencial de kai-1 en esta comparativa es la combinacion de salida tipada, probabilidades calibradas por entrenamiento y latencia de decenas de milisegundos; sus desventajas son la ausencia de benchmarks publicos, la falta de adopcion (0 descargas) y la necesidad de ajuste fino para obtener exactitud util en dominios propios.

## Limitaciones y advertencias

- Discrepancia de autoria: la model card describe el proyecto Laya de NandhaKishorM y enlaza al repositorio `NandhaKishorM/laya`, pero el modelo esta publicado bajo la organizacion hanzoai con el identificador `kai-1`. No hay explicacion disponible de esta relacion.
- Adopcion nula verificada: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No genera texto: cualquier caso de uso que requiera redaccion, resumen o respuesta conversacional queda fuera del alcance del modelo y necesita otro componente.
- Calibracion dependiente del dominio: el checkpoint base obtiene 0,362 de exactitud en el benchmark de referencia, muy por debajo del 0,766 del checkpoint ajustado; en dominios propios hay que asumir que el rendimiento zero-shot sera limitado.
- Longitud de contexto por defecto insuficiente: el limite de 1.024 tokens trunca documentos largos; hay que pasar `max_len=8192` explicitamente y seleccionar el checkpoint multilingue con `model="multilingual"`, ya que el texto mayoritariamente en ingles se enrutaria al checkpoint ingles.
- Degradacion en documentos muy largos: por encima de aproximadamente 4.000 tokens la exactitud medida cae y varia entre 8 y 17 aciertos de 20; el propio proyecto recomienda validar con datos propios en ese regimen. La muestra de evaluacion es pequena (20 peticiones por tramo).
- Idioma: aunque se declaran mas de 100 idiomas, los metadatos de HuggingFace no especifican ninguno y no se publica desglose de rendimiento por idioma.
- Riesgo de alucinacion: el model card argumenta que es estructuralmente bajo porque el modelo no genera texto; esto no elimina el riesgo de clasificaciones o puntuaciones mal calibradas fuera de la distribucion de entrenamiento.
- Dependencia de la definicion de las preguntas: la calidad de la salida depende de que los criterios y las instrucciones esten bien redactados; el model card no documenta metodos automaticos de validacion de esquemas.
- Compatibilidad de plataforma: requiere Python 3.10 o superior; los extras de servidor, MCP, LangChain, ONNX y ruta rapida GPU son instalaciones opcionales y no estan cubiertos por la licencia del modelo en cuanto a soporte.
- Licencia: Apache-2.0 permite uso comercial sin restricciones declaradas, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hanzoai/kai-1
- Repositorio GitHub del proyecto Laya: https://github.com/NandhaKishorM/laya
- Detalles de instalacion por plataforma: https://github.com/NandhaKishorM/laya#installation-details
- Documentacion general: https://nandhakishorm.github.io/laya/
- Guia de hooks de prediccion: https://nandhakishorm.github.io/laya/hooks/
- Decisiones guiadas por esquema: https://nandhakishorm.github.io/laya/structured/
- Guia de Docker: https://nandhakishorm.github.io/laya/docker/
- Guia de LangChain y LangGraph: https://nandhakishorm.github.io/laya/langchain/
- Referencia de la API: https://nandhakishorm.github.io/laya/reference/
- Checkpoint ajustado de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Script de evaluacion de contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
- Cuaderno de ajuste fino en 2x T4 de Kaggle: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Detalles de ajuste fino: https://github.com/NandhaKishorM/laya#fine-tuning
- Grafica de exactitud en contexto largo: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/long_context_8192.png
- La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos resultados obtenidos corresponden a la obra bibliografica "Collapse: The Fall of the Soviet Union", sin relacion con esta ficha.
