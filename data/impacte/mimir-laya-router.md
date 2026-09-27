# impacte/mimir-laya-router

## Resumen

Mimir (`impacte/mimir-laya-router`) es un modelo router: recibe una peticion de usuario junto con una lista de modelos candidatos (nombre y tarjeta de capacidades) y devuelve cual de ellos deberia atender la peticion, con probabilidades calibradas. No genera texto: es un clasificador de decisiones que resuelve la seleccion en un unico pase forward no autorregresivo de unos 25 ms. Lo desarrolla el usuario `impacte` (autor de la cita: `oamazonasgabriel`) y parte de `convaiinnovations/laya`.

El modelo tiene 421.293.830 parametros y se construye sobre Laya, un encoder ModernBERT-large con una cabeza de decision tipada y un scorer de marcadores por opcion. Las opciones se definen en tiempo de peticion: cada candidato se renderiza como una opcion cuyo texto es su tarjeta de capacidades, mas una opcion `none` que recoge peticiones ambiguas o fuera de alcance. Esto permite anadir o quitar modelos del lineup sin reentrenar el router.

Es relevante para despliegues con varios modelos porque aborda dos problemas practicos de los routers basados en LLM: la latencia (151 ms de media en el baseline `llm_router` frente a ~23-25 ms de Mimir) y la calibracion de la confianza (ECE honesto de 0.0262), de modo que la probabilidad devuelta puede usarse para decidir cuando abstenerse o escalar. Su principal restriccion es que la precision se degrada rapidamente al crecer el numero de candidatos: ~0.96 con 2 opciones frente a ~0.67 con 8 y ~0.47 con 12.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large encoder + cabeza de decision de 2 capas + scorer de marcadores por opcion (tipo `choice`) |
| Parametros totales | 421.293.830 |
| Longitud de contexto | no disponible (la peticion se trunca a los primeros ~320 tokens) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes cuantizadas) |
| Idiomas soportados | Ingles unicamente (el checkpoint base Laya es en ingles) |
| Licencia | Apache-2.0 (heredada de Laya) |
| Formato de pesos | safetensors |
| Modelo base | convaiinnovations/laya |
| Tarea (pipeline) | text-classification |
| Libreria | laya |
| Tamano del repositorio | 0.8 GB |
| Tipo de pregunta | `choice` sobre el lineup de modelos, con opcion `none` |
| Entrenamiento | RLCD: gradientes de politica estilo GRPO contra una regla de scoring estrictamente propia (strictly proper scoring rule) + entropia cruzada suave |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT-large con una cabeza de decision de 2 capas y un scorer de marcadores de opcion. Cada modelo candidato se renderiza como una opcion `choice` cuyo texto es su tarjeta de capacidades; Laya puntua cada opcion en su propio marcador `[MASK]` y aplica softmax sobre el lineup completo. El espacio de respuestas se define en tiempo de peticion, no en entrenamiento, por lo que el lineup puede modificarse sin reentrenar. El proceso es no autorregenerativo y completo en un solo pase forward.

El entrenamiento usa RLCD: gradientes de politica estilo GRPO contra una regla de scoring estrictamente propia, combinados con entropia cruzada suave. Los datos se generaron con un `gemma4:e4b` local: 1.770 semillas en 14 categorias (codigo, matematicas, razonamiento pesado, analisis de datos, contexto largo, chat, resumen, extraccion, traduccion, creatividad, razonamiento ligero, datos rapidos, clasificacion y ambiguo). Cada peticion se expande a un lineup donde exactamente la tarjeta de un agente cubre la categoria de la peticion (etiqueta dorada), con ~80% de nombres de modelo ficticios y ~20% del parque real, lo que fuerza al modelo a leer la tarjeta en lugar de memorizar nombres. Las peticiones ambiguas se enrutan a `none`. En total, 12.000 filas de entrenamiento; el conjunto de test usa semillas disjuntas.

## Capacidades

- Clasificacion de decisiones tipo `choice`: selecciona un modelo del lineup a partir de la peticion del usuario y las tarjetas de capacidades de los candidatos.
- Salida de probabilidades calibradas por opcion, con temperatura ajustada sobre un split de calibracion disjunto (T = 4.471).
- Abstención mediante la opcion `none`, pensada para peticiones ambiguas o fuera de alcance (F1 de `none` = 0.957).
- Lineup dinamico: anadir o eliminar modelos candidatos sin reentrenar, ya que las opciones se definen en la peticion.
- Inferencia no autorregresiva en un unico pase forward, con latencia p50 de ~23-25 ms.
- Independencia del nombre del modelo: funciona igual con nombres reales o ficticios (0.9565 vs 0.9623), leyendo la tarjeta.
- No soporta generacion de texto, tool calling, agentes multi-paso, vision, audio ni modo thinking: es exclusivamente un router/clasificador.

## Casos de uso

- Enrutado en parques de modelos heterogeneos: dado un parque con modelos de distinto tamano y especialidad, Mimir decide cual responde a cada peticion leyendo sus tarjetas, sin necesidad de un LLM adicional en el camino critico gracias a sus ~25 ms por decision.
- Optimizacion de coste por peticion: enrutando peticiones simples a un modelo pequeno (por ejemplo, un 2B) y las complejas a uno grande (por ejemplo, un 27B), se reduce el coste medio de inferencia manteniendo la calidad en las tareas que la requieren.
- Orquestacion de agentes en pipelines automatizados: el router selecciona el agente adecuado para tareas de refactorizacion de codigo, matematicas o analisis de datos, y devuelve una probabilidad que el orquestador puede usar como umbral para aceptar o escalar.
- Enrutado en dos etapas (proveedor primero, modelo despues): dado que la precision cae con muchos candidatos (0.67 a 8 opciones, 0.47 a 12), se puede usar una primera llamada para elegir proveedor y una segunda para elegir modelo dentro de el, manteniendo lineups de 2-5 opciones.
- Abstención y preguntas de aclaracion: la opcion `none` permite que el sistema, ante una peticion vaga, pida aclaracion en lugar de enrutar a un modelo inadecuado; util en asistentes de soporte donde un enrutado erroneo es mas caro que una pregunta extra.
- Clasificacion previa en homelabs y despliegues self-hosted: el modelo cabe en el repo de 0.8 GB y se sirve como sidecar FastAPI con `POST /route`, integrable en un stack local junto a vLLM u Ollama para los modelos de generacion.
- Triaje de peticiones por categoria: usando la misma mecanica `choice`, puede clasificar peticiones en categorias operativas (codigo, resumen, extraccion, traduccion) para dirigirlas a colas o workers distintos.
- Monitorizacion de calidad del enrutado: las probabilidades calibradas y las metricas de ECE permiten auditar en produccion cuando el router esta decidiendo con baja confianza o fuera de su dominio.

## Benchmarks y rendimiento

Resultados publicados en la model card. Conjunto held-out de n=64: accuracy 0.9688 (IC 95% 0.922-1.000), F1 de `none` 0.957, ECE 0.0262, Brier 0.0762.

Baselines sobre las mismas filas held-out:

| Router | Accuracy | F1 de `none` | Latencia p50 (ms) |
|---|---|---|---|
| random | 0.1860 | 0.000 | no disponible |
| always_none | 0.1938 | 0.325 | no disponible |
| always_first | 0.2016 | 0.000 | no disponible |
| bm25 | 0.2016 | 0.279 | 0.05 |
| base_laya | 0.2403 | 0.336 | 23.41 |
| llm_router | 0.6822 | 0.585 | 151.33 |
| mimir-laya-router | 0.9688 | 0.957 | ~25 (segun la model card) |

Calibracion sobre split disjunto (65 de calibracion / 64 de test):

| Ajuste | Temperatura | ECE | NLL | Prob. maxima media |
|---|---|---|---|---|
| raw (T=1) | 1.000 | 0.0459 | 0.6359 | 0.9854 |
| ajuste sobre test (con fuga) | 4.160 | 0.0165 | 0.2004 | 0.9542 |
| ajuste sobre calibracion disjunta (honesto) | 4.471 | 0.0262 | 0.2022 | 0.9426 |

Accuracy segun el numero de candidatos K:

| Opciones K | Accuracy | Prob. maxima media |
|---|---|---|
| 2 | 0.9612 | 0.993 |
| 3 | 0.9302 | 0.992 |
| 5 | 0.8760 | 0.985 |
| 8 | 0.6667 | 0.970 |
| 12 | 0.4651 | 0.963 |
| 20 | 0.1705 | 0.924 |
| 40 | 0.0698 | 0.440 |

Robustez:

| Prueba | Resultado |
|---|---|
| Parafrasis de tarjeta (plantilla) | 0.9225 (Δ -0.039) |
| Parafrasis de tarjeta (LLM) | 0.8217 (Δ -0.140) |
| Nombres reales vs ficticios | 0.9565 vs 0.9623 |
| Peticion enterrada tras contexto largo | 0.3721 (vs 0.9612 con solo la peticion) |
| Barajado del orden de opciones | 0.9302 (Δ -0.031) |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 en torno a 0.85-1 GB de pesos para 421M de parametros; en fp32 alrededor de 1.7 GB. El repositorio completo ocupa 0.8 GB, coherente con pesos en media precision. El pico de memoria en inferencia depende de la longitud de entrada (truncada a ~320 tokens) y del tamano del batch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve; el modelo es de muy baja exigencia. Tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sobradamente. Para latencias minimas, una GPU moderna dedicada es suficiente; en la practica el cuello de botella sera la red o el resto del pipeline, no el modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con 2 GB o mas de VRAM, e incluso en CPU (la latencia reportada de ~23-25 ms se midio en el entorno del autor; el rendimiento en CPU no se especifica).
- Opciones de despliegue: la libreria `laya` es la via principal (`laya.load("impacte/mimir-laya-router")`). El repo de entrenamiento incluye un sidecar FastAPI con endpoint `POST /route`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un encoder clasificador no autorregresivo, esas herramientas estan orientadas a modelos generativos y no se indican como compatibles.
- Latencia y throughput estimados: latencia p50 de ~25 ms por decision segun la model card; el baseline `base_laya` sin ajustar registra 23.41 ms p50 y `bm25` 0.05 ms. No se publican cifras de throughput (peticiones por segundo) ni resultados con batching.

## Comparativa con modelos similares

Comparativa con los baselines publicados en la model card, sobre las mismas filas held-out:

| Router | Accuracy | F1 de `none` | Latencia p50 (ms) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mimir-laya-router | 0.9688 | 0.957 | ~25 | Apache-2.0 | HuggingFace (`impacte/mimir-laya-router`) |
| llm_router | 0.6822 | 0.585 | 151.33 | no disponible | no disponible |
| base_laya (sin ajustar) | 0.2403 | 0.336 | 23.41 | Apache-2.0 (heredada) | HuggingFace (`convaiinnovations/laya`) |
| bm25 | 0.2016 | 0.279 | 0.05 | no disponible | no disponible |
| random / always_none / always_first | 0.1860 / 0.1938 / 0.2016 | 0.000 / 0.325 / 0.000 | no disponible | no aplica | no aplica |

No se dispone de datos de parametros, contexto ni licencia de `llm_router` ni de `bm25` en la informacion proporcionada. El modelo base `convaiinnovations/laya` (421M, Apache-2.0, ModernBERT-large + cabeza de decision) es el antecesor directo y la referencia de arquitectura.

## Limitaciones y advertencias

- Solo ingles: el checkpoint base Laya es en ingles, por lo que el enrutado de peticiones en otros idiomas no esta soportado de forma fiable.
- Escala mal con el numero de candidatos: la accuracy pasa de ~0.96 con 2 opciones a ~0.67 con 8, ~0.47 con 12 y ~0.17 con 20. Se recomienda mantener el lineup en 5-8 opciones como maximo o implementar un enrutado en dos etapas (proveedor y luego modelo).
- Sensibilidad a la redaccion de las tarjetas: reformular las tarjetas con un LLM reduce la accuracy en ~0.14; el modelo se apoya en el vocabulario superficial, no en semantica profunda. La calidad del enrutado depende directamente de la calidad de las descripciones de capacidades que se le pasen.
- Truncado de la entrada: solo lee los primeros ~320 tokens de la peticion, por lo que una tarea enterrada tras contexto largo es invisible (la accuracy cae de 0.96 a 0.37).
- Recuerdo de `none` debil: la propia model card senala que la abstención es el punto flojo y recomienda ajustar el umbral de abstención con datos propios.
- Evaluacion sobre una muestra pequena: n=64 en held-out, con un IC 95% amplio (0.922-1.000). Las cifras deben tomarse como indicativas hasta replicarlas con mas datos.
- Nombres ficticios en entrenamiento: en despliegue real el modelo decide leyendo las tarjetas, no reconociendo nombres; se verifico que la diferencia entre nombres reales y ficticios es inferior a 0.01.
- Modelo sin uso generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; solo emite una decision de enrutado con probabilidades.
- Adopcion nula en el momento de los datos: 0 descargas y 0 likes, lo que implica ausencia de validacion externa y de ecosistema de soporte.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial, pero el repositorio no incluye informacion adicional sobre sesgos ni sobre el dataset de entrenamiento mas alla de lo descrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/impacte/mimir-laya-router
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Notebook de referencia de fine-tuning: https://github.com/NandhaKishorM/laya
- Cita (BibTeX, en la model card): `@misc{mimir_laya_router2026, title = {Mimir: Laya fine-tuned as a calibrated model router}, author = {oamazonasgabriel}}`
