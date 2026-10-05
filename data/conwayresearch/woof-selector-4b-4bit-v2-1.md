# ConwayResearch/woof-selector-4B-4bit-v2.1

## Resumen

Woof Selector 4B 4-bit v2.1 es un modelo compacto especializado en automatizacion de navegador (browser-use), desarrollado por ConwayResearch. Su funcion no es generar texto libre, sino actuar como cabecera de decision: recibe la tarea actual, el contexto de la pagina y un conjunto de acciones candidatas, y devuelve la siguiente operacion a ejecutar junto con su objetivo. El autor lo describe como un "selector" que se combina con un "rellenador de texto" independiente para el contenido que hay que escribir en formularios y campos de entrada.

El modelo parte de una base Qwen3.5-4B sobre la que se ha aplicado un post-entrenamiento especifico para navegacion web, seguido de un proceso de entrenamiento consciente de la cuantizacion (quantization-aware training, QAT) que lo adapta a un despliegue en 4 bits. Cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y se distribuye en dos formatos: MLX para Apple Silicon y GGUF para runtimes compatibles. La longitud de contexto no se especifica en la informacion disponible.

Su relevancia actual radica en que demuestra que un modelo de 4B ejecutado localmente puede competir en tareas de automatizacion de navegador con alternativas mucho mayores o basadas en API. En la validacion de un solo paso reportada por el autor alcanza un 96,6 % de aceptacion de decisiones (516/534) y en la evaluacion end-to-end sobre 10 tareas publicas logra una tasa de exito del 70 %, con un tiempo mediano de 10,68 s por tarea, por delante en esa comparativa de modelos como Kev-9B (50 %) o Solar Decide (50 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5-4B; no se detalla la configuracion completa |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX con computo BF16; GGUF con pesos Q4_K_M y computo seleccionado en runtime) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX y GGUF |

## Arquitectura y entrenamiento

La model card indica que Woof Selector se construye sobre Qwen3.5-4B mediante un post-entrenamiento centrado en navegador, sin detallar el numero de tokens de entrenamiento ni la composicion del dataset. El modelo no es un generador de texto conversacional al uso: esta optimizado para una tarea de clasificacion/decision estructurada, en la que a partir de la tarea, las observaciones de la pagina y una lista de opciones debe elegir la siguiente accion y su objetivo. No se especifica si hubo fases de RLHF o DPO, ni si se emplearon tecnicas de decodificacion especulativa o atencion lineal.

La innovacion tecnica destacada es el entrenamiento consciente de la cuantizacion (quantization-aware training) para despliegue en 4 bits, lo que permite ejecutar el modelo de forma local con una huella de memoria reducida. La implementacion MLX usa computo en BF16 sobre pesos de 4 bits; la variante GGUF emplea pesos Q4_K_M con computo elegido en runtime y requiere activar Flash Attention. El autor recomienda preservar la configuracion, el tokenizer y la plantilla de chat suministrados. El selector se complementa con modelos rellenadores de texto (text fillers) de 4B y 0,8B que aportan el contenido a escribir cuando la accion seleccionada lo requiere.

## Capacidades

- Seleccion de la siguiente accion en tareas de navegador a partir de la tarea, el contexto de la pagina y una lista de acciones candidatas.
- Identificacion del objetivo (elemento de interfaz) sobre el que aplicar la accion elegida.
- Razonamiento de un solo paso orientado a mantener el flujo de una tarea de navegacion activa.
- Integracion con un modelo rellenador de texto auxiliar para generar el contenido de campos y formularios ("el selector decide que hacer y donde; el rellenador de texto aporta que escribir").
- Despliegue local: dispone de variantes MLX (Apple Silicon) y GGUF (runtimes compatibles), orientadas a ejecucion sin dependencia de API.
- Compatibilidad con entornos de tipo endpoint (`endpoints_compatible` segun los tags del repositorio) y con harnesses de browser-use como el proporcionado en Underdog.
- Capacidad conversacional declarada por los tags del repositorio, aunque la funcion principal del modelo es la seleccion de acciones.
- Soporte de idioma limitado al ingles.
- No se declaran capacidades de vision, audio, codigo general, matematicas ni tool calling generico; la informacion disponible no las menciona.

## Casos de uso

- Automatizacion de tareas web repetitivas: el modelo decide el siguiente clic o entrada de datos sobre la pagina en cada iteracion, lo que permite construir flujos de RPA que se adaptan a cambios de estado sin reglas codificadas a mano.
- Agentes de navegacion para compras y reservas: con las 54 tareas de web real evaluadas (vuelos, alojamiento, compras y restaurantes) y una tasa de exito del 48,1 %, resulta adecuado para asistentes que buscan y comparan productos en dominios conocidos.
- Pruebas automatizadas de interfaces web (QA): el selector puede recorrerse flujos de usuario y completarse formularios combinado con el rellenador de texto, sirviendo como alternativa a scripts de Selenium o Playwright fragiles ante cambios de DOM.
- Extraccion de informacion guiada por navegacion: en pipelines de scraping donde es necesario interactuar con paginacion, filtros o formularios antes de extraer datos, el modelo gestiona la secuencia de acciones y el rellenador aporta los valores a introducir.
- Asistentes de accesibilidad: conversion de instrucciones en lenguaje natural en acciones concretas sobre el navegador, para usuarios que no pueden operar directamente la interfaz.
- Automatizacion de back-office sobre aplicaciones web internas: tareas de introduccion o consulta de datos en portales corporativos que no ofrecen API, ejecutadas de forma local para evitar enviar informacion sensible a servicios externos.
- Prototipado de agentes en Apple Silicon: la variante MLX en 4 bits permite desarrollar y validar agentes de navegador en un portatil Mac sin GPU dedicada, con un peso de repositorio de 5,1 GB que incluye ambas variantes.

## Benchmarks y rendimiento

Validacion de un solo paso sobre estados de navegador fijos, evaluada con un modelo juez (LLM-as-judge) y aceptando acciones alternativas validas:

| Metrica | Resultado |
|---|---|
| Aceptacion de decisiones (modelo QAT) | 96,6 % (516/534) |

Evaluacion end-to-end sobre 10 tareas publicas, comparada con otros modelos sobre las mismas tareas segun AIMultiple:

| Modelo | Tareas exitosas | Tasa de exito | Tiempo mediano por tarea |
|---|---:|---:|---:|
| Astra | 9/10 | 90 % | 18,30 s |
| Gemini 3.8 Flash | 9/10 | 90 % | 12,60 s |
| Woof-4B selector + Woof-4B textfiller | 7/10 | 70 % | 10,68 s |
| Woof-4B selector + Woof-0.8B textfiller | 7/10 | 70 % | 10,94 s |
| Jev 1.13 | 5/10 | 50 % | 6,45 s |
| Kev-9B | 5/10 | 50 % | 43,40 s |
| Solar Decide | 5/10 | 50 % | 22,90 s |
| Kev-4B | 3/10 | 30 % | 7,15 s |
| Kev-4B via OpenRouter | 2/10 | 20 % | 3,80 s |
| Bespoke Nimble 9B | 1/10 | 10 % | 2,55 s |
| Tev1-4B | 1/10 | 10 % | 4,80 s |
| Tev1-0.8B | 0/10 | 0 % | 1,80 s |
| CLM-v0.1-8B | 0/10 | 0 % | 8,45 s |
| Laya | 0/10 | 0 % | 21,35 s |
| GLiNER2.5-Decide | 0/10 | 0 % | 0,35 s |

Evaluacion sobre 54 tareas de web real (solo DOM), en vuelos, alojamiento, compras y restaurantes, con evaluacion mediante LLM-as-judge:

| Modelo | Tareas exitosas | Tasa de exito | Tasa de exito excluyendo saltos por anti-bot |
|---|---:|---:|---:|
| Woof-4B | 26/54 | 48,1 % | 51,0 % |
| Kev-9B Browser Post-trained | 18/54 | 33,3 % | 38,3 % |
| Kev-9B | 8/54 | 14,8 % | 16,0 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- Huella de pesos: con cuantizacion de 4 bits, un modelo de ~4,2 B de parametros ocupa aproximadamente 2-3 GB en memoria; el repositorio completo pesa 5,1 GB porque incluye las variantes MLX y GGUF.
- Apple Silicon / MLX: la variante MLX esta pensada para ejecucion local en chips de la serie M de Apple, con computo en BF16 sobre pesos de 4 bits. Cabe en equipos con memoria unificada moderada (8 GB o superior).
- GPU consumer: al tratarse de un modelo de 4 bits de ~4 B, es viable en GPUs consumer tipo RTX 3060/4060/4090 con VRAM suficiente. No se especifican requisitos concretos en la documentacion.
- Opciones de despliegue: MLX en Apple Silicon y runtimes compatibles con GGUF (por ejemplo llama.cpp u Ollama, segun el runtime). En GGUF es necesario activar Flash Attention y usar los pesos Q4_K_M con computo seleccionado en runtime.
- Integracion: requiere un harness compatible de Woof Selector en Underdog que proporcione la tarea, las observaciones de la pagina y las acciones candidatas, ejecute la accion elegida y vuelva a consultar al modelo.
- Text filler: para acciones que requieren texto generado hay que emparejar el selector con un modelo rellenador (Woof-4B textfiller o Woof-0.8B textfiller), disponibles tambien en MLX 4 bits y GGUF 4 bits.
- Latencia y throughput: no se publican cifras propias de latencia o throughput del modelo aislado. En las pruebas end-to-end de 10 tareas, la combinacion con el rellenador de 4B registro un tiempo mediano de 10,68 s por tarea y la combinacion con el rellenador de 0,8B, 10,94 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de exito (10 tareas) | Tiempo mediano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Woof Selector 4B 4-bit v2.1 | ~4,2 B | no disponible | 70 % (con rellenador) | 10,68 s | Apache 2.0 | Local (MLX y GGUF) |
| Gemini 3.8 Flash | no disponible | no disponible | 90 % | 12,60 s | no disponible | API |
| Astra | no disponible | no disponible | 90 % | 18,30 s | no disponible | no disponible |
| Kev-9B | ~9 B | no disponible | 50 % | 43,40 s | no disponible | no disponible |
| Kev-4B | ~4 B | no disponible | 30 % | 7,15 s | no disponible | no disponible |

La comparativa se limita a los modelos que aparecen en la evaluacion del autor sobre las mismas 10 tareas publicas. No se dispone de datos de contexto, licencia o arquitectura de las alternativas para una comparacion mas completa.

## Limitaciones y advertencias

- Modelo de proposito especifico: no es un asistente conversacional general ni un generador de codigo; su uso previsto es la seleccion de acciones en tareas de navegador.
- Idioma: solo soporta ingles (en), lo que limita su uso directo en tareas con interfaces o instrucciones en castellano u otros idiomas.
- Rendimiento en web real: la tasa de exito cae al 48,1 % (51,0 % excluyendo saltos por anti-bot) en las 54 tareas de web real, muy por debajo del 96,6 % de aceptacion en la validacion de un solo paso. El paso de validacion al entorno real es, por tanto, notable.
- Bloqueos anti-bot: parte de los fallos en la evaluacion de web real se atribuyen a saltos por deteccion anti-bot, un factor externo al modelo que condiciona su utilidad en produccion.
- Dependencia de componentes externos: necesita un rellenador de texto para las acciones que requieren entrada de texto y un harness compatible de browser-use; no funciona de forma autonoma fuera de ese entorno.
- Dependencia del harness: el modelo no ejecuta acciones por si mismo, solo decide cual tomar; la tasa de exito depende de la calidad de las observaciones de la pagina y de la lista de acciones candidatas que se le presenten.
- Riesgo de alucinacion: los evaluadores aceptaron acciones alternativas validas, lo que suaviza la metrica, pero la model card no documenta tasas de error especificas por tipo de accion; en seleccion de objetivos, una eleccion erronea puede romper el flujo de la tarea.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Licencia: Apache 2.0, permisiva para uso comercial, con las obligaciones de atribucion indicadas en el fichero LICENSE del repositorio. Los terminos de los modelos base (Qwen3.5-4B) y de los rellenadores asociados deben verificarse de forma independiente.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente mas alla de las evaluaciones del propio autor.
- Advertencia sobre la nomenclatura de los modelos comparados: los resultados de modelos de terceros se reportan a traves de AIMultiple y no han sido verificados de forma independiente en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConwayResearch/woof-selector-4B-4bit-v2.1
- Rellenador de texto Woof-4B 4-bit v2.1: https://huggingface.co/ConwayResearch/woof-textfiller-4B-4bit-v2.1
- Rellenador de texto Woof-0.8B 4-bit v2.1: https://huggingface.co/ConwayResearch/woof-textfiller-0.8B-4bit-v2.1
- Dataset de tareas y resultados de AIMultiple para la evaluacion de 10 tareas: https://huggingface.co/datasets/AIMultiple/aimultiple-decision-models-browser
- Prompts de las 54 tareas: https://huggingface.co/datasets/AIMultiple/aimultiple-decision-models-browser/blob/223c792c4e26d144c91e5ddd1137ff7da6cc8e45/tasks.jsonl.md
- Definiciones de tareas y criterios de evaluacion (54 tareas): evaluation/woof-54-tasks.json (ruta relativa dentro del repositorio del modelo)
- Detalles de evaluacion: evaluation/README.md (ruta relativa dentro del repositorio del modelo)
- Licencia: fichero LICENSE del repositorio del modelo

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces encontrados correspondian a contenido no relacionado (aeronautica militar) y se han descartado por no ser pertinentes.
