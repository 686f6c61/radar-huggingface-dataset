# aravind1706/decider-ettin

## Resumen

Decider Ettin 68M es un modelo encoder-only de 68 millones de parametros desarrollado por el usuario aravind1706 a partir del encoder jhu-clsp/ettin-encoder-68m (Johns Hopkins CLSP) y ajustado sobre el conjunto de datos avbiswas/bev-decision-150K para tareas de toma de decisiones estructuradas. No es un modelo generativo: recibe una secuencia formateada con un estado, una pregunta y una lista de opciones, y devuelve logits a traves de tres cabezas de clasificacion (eleccion entre hasta 10 opciones, veredicto binario si/no y puntuacion en hasta 7 niveles).

Su rasgo mas diferenciador es el formato de despliegue. Se distribuye como un unico archivo ONNX (opset 18) de 67,3 MB cuantizado a INT8, disenado para ejecutarse integramente en el navegador mediante ONNX Runtime Web sobre WebAssembly, con el modelo descargado una sola vez, cacheado en IndexedDB y sin servidor para la inferencia. Esto lo situa en el nicho de la inferencia en el borde y de las aplicaciones web con privacidad por diseno.

Se publica bajo licencia Apache 2.0 y la longitud maxima de secuencia de entrenamiento es de 2048 tokens. En el momento de la consulta acumula 0 descargas y 0 likes, y el propio autor advierte de que el entrenamiento se realizo con escenarios de decision sinteticos y de que la calibracion en entornos reales no se ha evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (base: jhu-clsp/ettin-encoder-68m) |
| Parametros totales | 68 millones (heredados del encoder base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (max sequence length de entrenamiento) |
| Tipos de cuantizacion | INT8 (unico peso publicado); no se distribuye FP32 ni FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18), cuantizado a INT8; tokenizer en JSON (BPE) |

## Arquitectura y entrenamiento

El modelo parte del encoder Ettin de 68M de parametros y anade tres cabezas de decision que se activan en funcion de la estructura de la secuencia de entrada: `choice_logits` (seleccion entre hasta 10 opciones), `noul_logits` (veredicto binario no/si) y `score_logits` (puntuacion en hasta 7 niveles). Las cabezas no utilizadas devuelven un centinela enmascarado (minimo de float32), de modo que una sola sesion ONNX cubre las tres tareas. La entrada sigue un formato estructurado con marcadores especiales preentrenados en el vocabulario en identificadores fijos: `[DECISION]` (50368), `[STATE]` (50369), `[QUESTION]` (50370) y `[OPT_0]`–`[OPT_9]` (50371–50380); el autor indica explicitamente que estos tokens no deben recrearse ni anadirse en tiempo de ejecucion.

El ajuste fino se realizo sobre el dataset BEV Decision 150K. Los hiperparametros documentados son learning rate de 1e-5 para el encoder, 2,5e-4 para las cabezas y una longitud maxima de secuencia de 2048 tokens, con dos epocas de entrenamiento. No se documenta uso de RLHF ni DPO, lo cual es coherente con un modelo de clasificacion; tampoco se detalla la composicion interna del dataset mas alla de su nombre y origen sintetico. Como innovacion tecnica destacable, la exportacion a ONNX (opset 18) con cuantizacion INT8 reduce el tamano aproximandamente 4x respecto a FP32, y el grafo expone entradas adicionales de posicionamiento (`decision_pos`, `option_pos`, `option_mask`) y de numero de niveles de puntuacion (`score_n`) para localizar los fragmentos relevantes dentro de la secuencia. El repositorio incluye un `manifest.json` con version, tamano y SHA-256 (`cfd0184cf450c7ceeaab10ef1a7069bd8924ba46b0d9f73fd13a6a51d9616bd1`) para verificar la integridad de la descarga en la aplicacion web.

## Capacidades

- Clasificacion de decision tipo eleccion: selecciona una entre hasta 10 opciones a partir de un estado y una pregunta.
- Clasificacion binaria si/no (`noul_head`): emite un veredicto booleano con logits `[no, yes]`.
- Puntuacion ordinal: asigna una valoracion en una escala de hasta 7 niveles, con un MAE de valor esperado de 0,645 reportado en la epoca 2.
- Procesamiento de secuencias estructuradas de hasta 2048 tokens con marcadores especiales dedicados.
- Ejecucion en navegador: inferencia 100% en cliente mediante ONNX Runtime Web (WASM), con cache en IndexedDB y verificacion de integridad por SHA-256.
- Exportacion a ONNX con lote de tamano 1 y longitud de secuencia dinamica.
- Capacidades multilingues: no disponible.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision y audio: no disponibles (modelo encoder de clasificacion, sin generacion de texto libre).

## Casos de uso

- Asistentes de decision integrados en aplicaciones web: el modelo se ejecuta en el navegador del usuario y devuelve la opcion mas probable entre hasta 10 alternativas, de modo que no es necesario enviar el estado ni la pregunta a un servidor, lo que simplifica el cumplimiento de requisitos de privacidad.
- Triaje de soporte al cliente: ante una descripcion de incidencia y un conjunto finito de acciones posibles, la cabeza de eleccion permite enrutar el caso hacia la cola o el procedimiento adecuado sin coste de API.
- Verificacion y moderacion binaria: la cabeza `noul` responde si/no a preguntas como si un contenido cumple una politica concreta, con una precision de entrenamiento del 83,2%, adecuada como primer filtro antes de una revision humana.
- Priorizacion de tareas y planificacion personal: dado un estado ("dos proyectos y poco tiempo") y varias opciones, el modelo ordena o selecciona la alternativa mas coherente, util en gestores de tareas o asistentes de productividad.
- Encuestas y formularios con valoracion automatica: la cabeza de puntuacion (hasta 7 niveles) permite convertir respuestas de texto libre en una escala ordinal cuantificable, con un coste de inferencia local.
- Aplicaciones web offline o PWA: al cachearse en IndexedDB, la inferencia sigue funcionando sin conexion una vez descargado el modelo, lo que habilita herramientas de decision en entornos con conectividad limitada.
- Prototipado rapido y demos de IA en el navegador: el par `downloadModel()` / `loadModel()` de la aplicacion de referencia permite exponer una funcion `predict()` en `window` y construir prototipos de decision sin infraestructura de backend.
- Prefiltrado de recomendaciones discretas: seleccion entre catalogos pequenos de opciones (planes, productos, configuraciones) con la garantia de que la respuesta pertenece siempre al conjunto de opciones proporcionado.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de entrenamiento del autor. No se han publicado resultados sobre benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Epoca 1 | Epoca 2 |
|---|---|---|
| Precision de eleccion (choice) | 62,5% | 65,8% |
| Precision si/no (noul) | 81,3% | 83,2% |
| Precision de puntuacion (score) | 57,5% | 61,6% |
| MAE de valor esperado (score) | 0,727 | 0,645 |

## Requisitos de hardware

- Pesos: 67,3 MB en INT8 (`model_int8.onnx`), aproximadamente una cuarta parte del mismo grafo en FP32.
- Memoria estimada en inferencia: del orden de 150-300 MB de RAM incluyendo runtime de ONNX, tokenizer y buffers intermedios (estimacion derivada del tamano de los pesos y de las entradas declaradas; no publicada por el autor).
- GPU: no necesaria. El modelo esta pensado para CPU, tanto en navegador (WASM) como en Python con `onnxruntime`.
- GPU recomendadas: no aplica; cualquier GPU seria sobredimensionada para 68M de parametros en INT8. Si se desea aceleracion, `onnxruntime-gpu` sobre una GPU de gama de entrada seria mas que suficiente, aunque no se documentan ganancias.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en dispositivos moviles y navegadores de escritorio.
- Opciones de despliegue: ONNX Runtime Web (WASM) para navegador; `onnxruntime` en Python para referencia. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que el modelo no es generativo y no se publican pesos en GGUF ni safetensors.
- Latencia y throughput: no publicados. El autor advierte de que la inferencia WASM monohilo es lenta en secuencias por encima de aproximadamente 512 tokens.
- Detalle del repositorio: `model_int8.onnx` (67,3 MB), `tokenizer.json` (3,4 MB, BPE con 13 tokens especiales entrenados), `tokenizer_config.json` (613 B), `config.json` (1,1 KB) y `manifest.json` (293 B); tamano total del repo 0,1 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada. La comparacion se limita a lo documentado.

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Decider Ettin 68M | 68M | 2048 tokens (entrenamiento) | ONNX INT8 | Apache 2.0 | Clasificacion de decision con tres cabezas |
| jhu-clsp/ettin-encoder-68m (base) | 68M | no disponible | no disponible | no disponible | Encoder general, sin cabezas de decision |
| Otros encoders de clasificacion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos comparables especificos de decision con despliegue en navegador para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La inferencia WASM monohilo es lenta con secuencias superiores a unos 512 tokens, segun el propio autor.
- La cuantizacion INT8 reduce el tamano aproximadamente 4x respecto a FP32 a cambio de perder algo de precision; no se publica la magnitud exacta de esa perdida.
- Entrenado con escenarios de decision sinteticos: la calibracion en dominios reales no se ha evaluado, por lo que las probabilidades de salida no deben interpretarse como calibradas.
- Precisiones de entrenamiento moderadas en las cabezas de eleccion (65,8%) y de puntuacion (61,6%), que limitan su uso en decisiones de alto impacto sin supervision humana.
- Riesgo de sesgo y de alucinacion: no disponible; al ser un clasificador restringido al conjunto de opciones, no genera texto libre, pero tampoco se documenta ningun analisis de sesgos.
- Idiomas soportados: no disponibles. No se puede asumir que el tokenizer BPE funcione correctamente fuera del idioma o idiomas del dataset de ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del encoder base y del dataset de origen, cuyos terminos no se detallan en la informacion disponible.
- Repositorio con 0 descargas y 0 likes: no existe validacion independiente por parte de la comunidad ni resultados reproducidos por terceros.
- El repositorio ocupa 0,1 GB y no se distribuyen pesos en FP32, GGUF ni safetensors, lo que limita las opciones de reentrenamiento o conversion con herramientas habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aravind1706/decider-ettin
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Dataset de ajuste: https://huggingface.co/datasets/avbiswas/bev-decision-150K
- Aplicacion web de referencia: https://decider-ai.pages.dev/
- ONNX Runtime Web (WASM): https://onnxruntime.ai/docs/tutorials/web/
- Paper, blog o repositorio adicional: no disponible
