# leomaurodesenv/distilbert-base-uncased-jailbreakv-28k-augmented

## Resumen

DistilBERT-base-uncased-jailbreakv-28k-augmented es un modelo de clasificacion de texto (encoder-only) resultado del ajuste fino de distilbert-base-uncased, publicado por el usuario leomaurodesenv en HuggingFace. El nombre del repositorio sugiere que se ha entrenado sobre una version aumentada del conjunto de datos JailbreakV-28K, orientado a la deteccion de intentos de jailbreak en prompts dirigidos a modelos de lenguaje, aunque la model card no documenta ni el dataset ni las etiquetas utilizadas.

Tecnicamente es un transformer encoder-only de aproximadamente 67 millones de parametros (66.955.010 segun los pesos en safetensors), con una ventana de contexto de 512 tokens heredada del modelo base y licencia Apache 2.0. Se distribuye en formato safetensors y es compatible con la libreria transformers, ademas de estar etiquetado para su uso con text-embeddings-inference y endpoints compatibles.

Su relevancia practica es la de un clasificador ligero y barato de ejecutar que puede actuar como guardrail de entrada en aplicaciones basadas en LLM: filtrar prompts potencialmente maliciosos antes de enviarlos a un modelo generativo. No obstante, la ausencia de documentacion, los cero resultados de benchmarks en el model-index y un accuracy declarado de 1.0 con perdida de validacion de 0.0000 obligan a tratar sus metricas con mucha cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT-base: 6 capas, hidden 768, 12 cabezas de atencion) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite del modelo base distilbert-base-uncased) |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ ni GPTQ); al ser encoder-only admite fp16 e int8 mediante herramientas externas |
| Idiomas soportados | No disponible en la model card; el modelo base esta entrenado principalmente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, un transformer encoder-only de 6 capas y 768 dimensiones ocultas obtenido por destilacion del conocimiento de BERT-base. Sobre ese backbone se anade una cabeza de clasificacion de secuencias, lo que da lugar al pipeline `text-classification`. El modelo trabaja con tokenizacion WordPiece en minusculas (variante `uncased`) y una longitud maxima de 512 tokens.

Segun la model card, el entrenamiento se realizo con el Trainer de transformers durante 10 epocas, con learning rate 2e-05, batch de entrenamiento 8, acumulacion de gradientes de 2 pasos (batch efectivo 16), scheduler lineal con 50 pasos de warmup, semilla 42 y el optimizador `adamw_torch_fused`. El autor no especifica el dataset, la composicion de las clases, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El nombre del modelo apunta a JailbreakV-28K como fuente de datos, pero esto no se confirma en la documentacion. Los resultados declarados son degenerados (perdida de validacion 0.0000 y accuracy 1.0 desde la primera epoca), lo que sugiere un conjunto de validacion trivialmente separable, un posible solapamiento entre train y eval, o un problema de etiquetado.

## Capacidades

- Clasificacion de texto: el modelo devuelve etiquetas para una secuencia de entrada. El numero y nombre de las etiquetas no esta documentado.
- Deteccion de prompts maliciosos: por el nombre del repositorio, su tarea prevista es identificar intentos de jailbreak o prompts adversarios.
- Inferencia de baja latencia: al ser un encoder de 67 M de parametros, procesa secuencias de hasta 512 tokens en milisegundos, incluso en CPU.
- Integracion con el ecosistema transformers: `AutoModelForSequenceClassification` y `pipeline("text-classification")`.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No genera texto: no dispone de cabeza de lenguaje, por lo que no puede usarse para generacion, resumen ni traduccion.
- No soporta tool calling ni function calling.
- No implementa flujos de agente ni razonamiento multi-paso.
- No tiene capacidades de vision, audio ni multimodalidad.
- Capacidad multilingue: no confirmada; heredada del modelo base, centrada en ingles.

## Casos de uso

- Guardrail de entrada en aplicaciones LLM: colocar el clasificador delante de un modelo generativo para etiquetar cada prompt del usuario y bloquear o derivar a revision humana aquellos con alta probabilidad de ser un intento de jailbreak. Su tamano permite ejecutarlo en la misma CPU del servidor de aplicaciones sin coste apreciable.
- Moderacion de comunidades y chats: clasificar mensajes entrantes en foros, discords o comentarios para detectar intentos de manipular asistentes conversacionales desplegados en esos canales.
- Anotacion y curado de datasets de seguridad: usar el modelo como etiquetador automatico de grandes volumenes de prompts para construir o ampliar corpus de red teaming, revisando despues manualmente las predicciones de baja confianza.
- Prefiltro en pipeline de moderacion en dos etapas: emplearlo como primer nivel barato que descarta la mayoria del trafico limpio y reservar modelos mas grandes y costosos (por ejemplo clasificadores basados en LLM) solo para los casos dudosos.
- Monitorizacion de produccion y deteccion de abuso: puntuar en tiempo real los prompts registrados por una API de chat para construir alertas cuando aumente la proporcion de intentos de jailbreak, con la ventana de 512 tokens como limite para prompts largos.
- Regresion de seguridad en CI/CD: integrar el clasificador en la suite de pruebas de una aplicacion con LLM para verificar que un conjunto fijo de prompts adversarios conocidos sigue siendo detectado tras cada cambio de sistema o de prompt de sistema.
- Triaje en soporte tecnico: etiquetar tickets o conversaciones donde el usuario intenta manipular al agente automatico para obtener informacion fuera de politica, enrutando esos casos a agentes humanos.
- Experimentacion academica: servir como linea base ligera para comparar tecnicas de deteccion de jailbreaks, dado su bajo coste de inferencia y de entrenamiento.

## Benchmarks y rendimiento

El model-index del repositorio declara un unico modelo con la lista de resultados vacia, por lo que no hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K u otros no aplican a un encoder de clasificacion). El autor si publica la evolucion del entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Accuracy |
|---|---|---|---|---|
| 1.0 | 1121 | 0.0001 | 0.0000 | 1.0 |
| 2.0 | 2242 | 0.0000 | 0.0000 | 1.0 |
| 3.0 | 3363 | 0.0000 | 0.0000 | 1.0 |
| 4.0 | 4484 | 0.0000 | 0.0000 | 1.0 |
| 5.0 | 5605 | 0.0000 | 0.0000 | 1.0 |
| 6.0 | 6726 | 0.0000 | 0.0000 | 1.0 |
| 7.0 | 7847 | 0.0000 | 0.0000 | 1.0 |
| 8.0 | 8968 | 0.0000 | 0.0000 | 1.0 |
| 9.0 | 10089 | 0.0000 | 0.0000 | 1.0 |
| 10.0 | 11210 | 0.0000 | 0.0000 | 1.0 |

No se han publicado resultados de benchmarks independientes en la informacion disponible. El accuracy de 1.0 con perdida 0.0000 debe interpretarse como un indicio de fuga de datos o de un conjunto de evaluacion poco representativo, no como una medida de rendimiento real en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 66,96 M de parametros): aproximadamente 270 MB en fp32, 135 MB en fp16 y 70 MB en int8.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1050 Ti o superior, RTX 2060, RTX 3060, RTX 4090, e incluso en GPUs de portatil con 2 GB de VRAM.
- Tambien se ejecuta en CPU sin problemas; es viable desplegarlo en instancias pequenas o en el mismo contenedor que la aplicacion web.
- GPUs de datacenter (A100, H100, L4, T4) sobredimensionadas para este modelo; su uso solo se justifica si se comparte con otras cargas o si se necesita throughput muy alto por batching.
- Opciones de despliegue: pipeline de transformers, HuggingFace Inference Endpoints, text-embeddings-inference (segun las etiquetas del repositorio), ONNX Runtime o torch.compile para reducir latencia, y servidores HTTP propios (FastAPI, TorchServe, Triton). vLLM y TGI estan orientados a modelos generativos y no son la via natural para un encoder de clasificacion.
- Latencia y throughput estimados: no publicados por el autor. Por el tamano del modelo, se espera una latencia del orden de milisegundos por secuencia de 512 tokens en GPU y de decenas de milisegundos en CPU, con throughput escalable mediante batching; estos valores son estimaciones, no datos medidos.

## Comparativa con modelos similares

No se han encontrado modelos comparables en los resultados de busqueda web proporcionados. Como referencia de categoria, se listan alternativas conocidas de deteccion de prompts adversarios; los datos no confirmados se marcan como no disponibles, ya que no proceden de la informacion suministrada y deberian verificarse antes de citarlos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leomaurodesenv/distilbert-base-uncased-jailbreakv-28k-augmented | 66,96 M | 512 tokens | Accuracy 1.0 declarado por el autor (no verificado) | Apache 2.0 | safetensors en HuggingFace, 0 descargas |
| protectai/deberta-v3-base-prompt-injection | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| meta-llama/Prompt-Guard-86M | 86 M (aproximado) | no disponible | no disponible | licencia comunitaria de Llama, con restricciones | HuggingFace |
| jackhhao/jailbreak-classifier | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Frente a estas alternativas, la unica ventaja clara del modelo analizado es su tamano reducido y su licencia Apache 2.0 sin restricciones de uso comercial. En cambio, carece de documentacion, de validacion externa y de benchmarks reproducibles.

## Limitaciones y advertencias

- Metricas no fiables: el accuracy de 1.0 y la perdida de validacion de 0.0000 en todas las epocas son senales de alarma compatibles con fuga de datos, solapamiento train/validacion o un conjunto de evaluacion demasiado facil. No debe usarse ese numero para justificar decisiones de produccion.
- Documentacion practicamente inexistente: la model card no describe el dataset, el numero de clases, los nombres de las etiquetas ni los usos previstos, lo que dificulta interpretar las predicciones.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- Sesgo hacia el dominio de entrenamiento: si el ajuste se hizo sobre JailbreakV-28K, el modelo probablemente reconoce patrones de jailbreak presentes en ese corpus y generaliza peor ante variantes nuevas, parafrasis, otros idiomas o ataques codificados.
- Riesgo de falsos positivos sobre lenguaje legitimo: conversaciones sobre seguridad, pentesting autorizado, red teaming o investigacion pueden clasificarse como maliciosas.
- Riesgo de falsos negativos: un clasificador de 67 M de parametros es susceptible a ataques de evasion, ofuscacion, homoglifos, separadores de tokens y prompts muy largos.
- Limite de contexto de 512 tokens: los prompts que superen esa longitud se truncan, de modo que un ataque colocado al final del prompt puede pasar desapercibido segun la estrategia de recorte.
- Idioma: el modelo base esta entrenado en ingles; el rendimiento en castellano u otros idiomas no esta documentado ni garantizado.
- Ausencia de benchmarks reproducibles: el model-index esta vacio y no hay comparaciones con lineas base.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero el autor no documenta la procedencia ni las condiciones de los datos de entrenamiento; si se confirma el uso de JailbreakV-28K, habria que revisar la licencia de ese dataset antes de un despliegue comercial.
- Alucinacion: al ser un clasificador no genera texto, por lo que el riesgo de alucinacion se traduce en etiquetas incorrectas con alta confianza, no en contenido inventado.
- Recomendacion de despliegue: usarlo como heuristica complementaria dentro de un pipeline de seguridad con validacion humana y, si el caso de uso es critico, sustituirlo o respaldarlo con un modelo mejor documentado y evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leomaurodesenv/distilbert-base-uncased-jailbreakv-28k-augmented
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Referencia no confirmada del dataset que da nombre al modelo (paper de JailbreakV-28K): https://arxiv.org/abs/2404.03027
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; las busquedas devolvieron unicamente paginas generales de Facebook y Meta for Business, sin relacion con el modelo.
