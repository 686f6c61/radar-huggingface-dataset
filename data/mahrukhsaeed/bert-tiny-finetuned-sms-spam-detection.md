# mahrukhsaeed/bert-tiny-finetuned-sms-spam-detection

## Resumen

bert-tiny-finetuned-sms-spam-detection es un ajuste fino del modelo BERT-tiny publicado por el usuario mahrukhsaeed en HuggingFace. Se trata de un clasificador binario de texto orientado a la deteccion de spam en mensajes SMS en ingles, entrenado sobre el dataset `sms_spam`. El modelo cuenta con 4.386.690 parametros (dato confirmado en los pesos safetensors) y ocupa aproximadamente 0,1 GB en el repositorio, lo que lo situa en la categoria de modelos ultracompactos.

Su relevancia practica radica en el coste de inferencia: con menos de 5 millones de parametros, es viable ejecutarlo en CPU, en dispositivos moviles o en pasarelas de mensajeria con requisitos de latencia muy estrictos, donde desplegar un transformer de cientos de millones de parametros no seria rentable. La model card declara una precision de validacion de 0,98 sobre el dataset de referencia, aunque no se detallan hiperparametros, epocas ni protocolo de evaluacion.

El modelo se publica sin licencia declarada, sin pipeline asignado y con cero descargas y cero likes en el momento de la consulta, por lo que debe considerarse un artefacto experimental mas que un componente listo para produccion. Toda la informacion disponible proviene de la model card y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-tiny (transformer encoder bidireccional); no se detalla la configuracion de capas en la model card |
| Parametros totales | 4.386.690 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la familia BERT estandar admite 512 tokens |
| Tipos de cuantizacion | no declarados por el autor; al ser un transformer BERT convencional admite cuantizacion fp16 e int8 dinamica con herramientas genericas (PyTorch, ONNX Runtime) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors; las etiquetas indican tambien compatibilidad con PyTorch y JAX |
| Tarea | clasificacion de texto (spam / no spam) |
| Dataset de entrenamiento | sms_spam |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-10-06 |
| Fecha de ultima actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

La arquitectura corresponde a BERT-tiny, una variante reducida del transformer encoder bidireccional original de BERT. La model card no especifica el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud maxima de secuencia configurada, por lo que estos detalles deben verificarse directamente en el `config.json` del repositorio. El unico dato cuantitativo confirmado es el recuento de parametros (4.386.690), coherente con una configuracion de vocabulario BERT estandar y dimensiones ocultas muy reducidas.

El entrenamiento consistio en un ajuste fino supervisado sobre el dataset `sms_spam` para una tarea de clasificacion binaria. No se documentan en la model card el numero de epocas, la tasa de aprendizaje, el tamano de lote, la semilla, la division train/validation/test ni si se aplicaron tecnicas de regularizacion, aumento de datos o calibracion de umbral. Tampoco se menciona el uso de RLHF, DPO u otra fase de alineacion, algo que no resulta aplicable a un clasificador discriminativo de este tipo. El unico resultado reportado es una precision de validacion de 0,98, sin matriz de confusion, sin F1 ni recall por clase, metricas criticas en deteccion de spam donde los falsos negativos y los falsos positivos tienen costes muy distintos.

## Capacidades

- Clasificacion binaria de texto: distingue entre mensajes SMS legitimos y mensajes de spam.
- Clasificacion de secuencias cortas en ingles, el dominio para el que fue ajustado.
- Ejecucion en CPU con huella de memoria minima, gracias a sus 4,39 millones de parametros.
- Extraccion de representaciones contextuales del texto mediante el encoder, si se utiliza sin la cabeza de clasificacion (no documentado por el autor).
- No dispone de generacion de texto: es un modelo exclusivamente discriminativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Soporte multilingue: no. Solo esta etiquetado para ingles.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni multimodalidad.
- No se documenta el numero de etiquetas de salida ni el mapeo id2label/label2id.

## Casos de uso

- Filtrado de SMS en pasarelas de mensajeria: el modelo puede clasificar cada mensaje entrante antes de reenviarlo al usuario final, con un coste de computo por inferencia muy bajo que permite procesar volumenes altos en CPU sin GPU dedicada.
- Moderacion en aplicaciones de mensajeria OTT: integrado como primera etapa de un pipeline de moderacion, descarta candidatos evidentes de spam y deja pasar al resto a un clasificador mas grande y costoso.
- Filtro en el propio dispositivo (on-device): con menos de 5 millones de parametros y pesos cuantizables a int8, es candidato para ejecutarse en terminales moviles dentro de una app de SMS, evitando enviar el contenido del mensaje a un servidor.
- Pre-etiquetado de datos para anotacion humana: usar el modelo para generar etiquetas iniciales sobre grandes volumenes de mensajes y reservar la revision manual para los casos con menor confianza, reduciendo el coste de anotacion.
- Deteccion de campanas de fraude en entornos corporativos: analisis de los SMS recibidos por empleados para identificar patrones de phishing por SMS (smishing) y alimentar alertas de seguridad.
- Extraccion de caracteristicas para analitica: utilizar las representaciones del encoder como entrada de un clasificador posterior mas ligero que separe subtipos de spam (publicidad, fraude financiero, suscripciones premium).
- Investigacion academica sobre clasificacion de texto: linea base reproducible y de bajo coste para comparar tecnicas de ajuste fino, destilacion o cuantizacion en tareas de spam binario.
- Servicio de filtrado por API: dado su tamano, se puede servir con multiples replicas en una sola GPU o incluso en contenedores sin acelerador, manteniendo latencias de milisegundos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| Precision de validacion en sms_spam | 0,98 | Model card del autor |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar. Tampoco se aportan metricas de precision, recall, F1 ni AUC desagregadas por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,5 MB en fp32 (4,39 M de parametros), 8,8 MB en fp16 y 4,4 MB en int8 para los pesos; el pico real depende del tamano de lote y de la longitud de secuencia, pero en cualquier caso es del orden de decenas o pocos cientos de megabytes.
- GPU recomendadas: no requiere GPU. Cualquier GPU moderna (RTX 3060, RTX 4090, T4, A100, H100) puede servirlo con holgura extrema.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en GPUs integradas y en CPU.
- Despliegue: al ser un modelo de la familia BERT con pesos safetensors, es compatible con bibliotecas de inferencia estandar como PyTorch, ONNX Runtime, HuggingFace Transformers, Text Embeddings Inference y servicios genericos de clasificacion. No se documenta compatibilidad explicita con vLLM, llama.cpp u Ollama, orientados a modelos generativos.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-tiny-finetuned-sms-spam-detection (este modelo) | 4,39 M | no disponible | Clasificacion spam SMS | no disponible | HuggingFace, 0 descargas |
| bert-tiny (modelo base de prajjwal1/bert-tiny) | 4,4 M | 512 tokens | Modelo preentrenado generico | Apache-2.0 | Ampliamente utilizado |
| distilbert-base-uncased | 66 M | 512 tokens | Modelo preentrenado generico | Apache-2.0 | Ampliamente utilizado |

La comparacion se limita a parametros, contexto y licencia: no hay datos de benchmarks publicados para este ajuste fino que permitan contrastar su rendimiento frente a alternativas del mismo dominio. Los valores de contexto y licencia de los modelos base se incluyen a titulo orientativo, ya que no proceden de la informacion proporcionada para este modelo. Los datos de licencia no declarada del modelo ajustado impiden cualquier comparacion directa en ese aspecto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un unico corpus de SMS en ingles, reproducira los sesgos de dominio, registro y demografia presentes en ese dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre. El riesgo equivalente es la clasificacion erronea, con falsos negativos que dejarian pasar spam y falsos positivos que bloquearian mensajes legitimos.
- Limitacion de contexto e idioma: solo ingles y orientado a mensajes SMS cortos. El rendimiento en textos largos, correos electronicos o conversaciones no esta validado.
- Licencia: no declarada. La ausencia de licencia explicita impide asumir permisos de uso comercial, modificacion o redistribucion; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Riesgo de sobreajuste: no se documenta la division de datos ni la metrica en un conjunto de test independiente. Una precision de validacion de 0,98 puede reflejar sobreajuste al split concreto si no hubo test separado.
- Desequilibrio de clases: no se reportan precision, recall ni F1 por clase. Si el dataset tiene un desequilibrio importante (el spam suele ser minoritario), la exactitud global puede ocultar un recall pobre en la clase spam.
- Ausencia de pipeline declarado: no hay etiqueta de tarea en HuggingFace, lo que puede requerir configurar manualmente el mapeo de etiquetas al cargar el modelo.
- Madurez: cero descargas y cero likes, sin actualizaciones desde la publicacion. No hay evidencia de uso en produccion ni de validacion por terceros.
- Deriva de dominio: los patrones de spam cambian con rapidez; un modelo entrenado sobre un corpus estatico requerira reentrenamiento o ajuste continuo para mantener la precision en el tiempo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahrukhsaeed/bert-tiny-finetuned-sms-spam-detection
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
