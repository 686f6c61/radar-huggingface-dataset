# Myungkyu/pi0_5_robodojo_preset_luna_b64_60k

## Resumen

Pi0.5 RoboDojo preset luna es un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, publicado por el usuario Myungkyu dentro del ecosistema LeRobot. Se trata de una politica de bajo nivel (low-level policy) de tipo vision-language-action (VLA): recibe imagenes de tres camaras en vivo (cabeza y munecas izquierda y derecha), propriocepcion y el texto del subtarea actual, y produce acciones motoras para un robot bimanual de sobremesa.

El modelo se ha entrenado sobre el dataset `Myungkyu/RoboDojo-preset-luna`, que contiene 8 tareas bimanuales de largo horizonte sobre robot real, con 100 demostraciones por tarea. Las etiquetas de subtarea fueron anotadas por "GPT-5.6 Luna" usando el contexto del preset (Baseline), y el autor indica que la evaluacion debe hacerse con el mismo modelo planificador.

Su relevancia es acotada pero clara: sirve como checkpoint reproducible y como baseline dentro del banco de pruebas RoboDojo, y como ejemplo de fine-tune de Pi0.5 sobre datos reales con condicionamiento por texto de subtarea. El repositorio tiene 0 descargas y 0 likes, no declara licencia y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 vanila (vision-language-action, VLA) con tres vistas de camara en vivo |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponibles (la entrada incluye texto de subtarea, pero no se especifica el idioma) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

La model card describe la arquitectura como "Pi0.5 vanilla", con tres vistas de camara en vivo y sin slot de keyframe ni atestacion de memoria. Las entradas son imagenes de cabeza y de muneca izquierda y derecha, propriocepcion y el texto del subtarea actual; no se usa entrada de keyframe. El modelo se presenta explicitamente como politica de bajo nivel, no como generador de lenguaje ni como planificador.

El fine-tune parte de `lerobot/pi05_base` y se entrena con batch de optimizador 64 durante 60.000 pasos, publicandose el checkpoint final. El dataset de entrenamiento (`Myungkyu/RoboDojo-preset-luna`) cubre 8 tareas bimanuales de largo horizonte sobre robot real, con 100 demostraciones por tarea, y sus etiquetas densas de subtarea fueron anotadas por GPT-5.6 Luna con el contexto del preset Baseline. No se documentan en la informacion disponible ni el numero total de tokens, ni la composicion del dataset, ni el uso de RLHF o DPO, ni innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de acciones motoras de bajo nivel para manipulacion robotica a partir de imagenes, propriocepcion y texto de subtarea.
- Manipulacion bimanual de sobremesa sobre robot real (el dataset cubre 8 tareas de este tipo).
- Condicionamiento por texto de subtarea, lo que permite trocear tareas de largo horizonte en pasos dirigidos por lenguaje.
- Fusion de tres flujos visuales simultaneos: camara de cabeza y dos camaras de muneca.
- Integracion prevista con un planificador externo (GPT-5.6 Luna) que genera las etiquetas de subtarea; el autor indica que la evaluacion debe hacerse con el mismo modelo planificador.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso por si mismo: es un modulo de control, no un orquestador.
- No se documentan capacidades multilingues, de vision generativa, de audio ni modo "thinking".

## Casos de uso

- Manipulacion bimanual de sobremesa: el modelo ejecuta politicas de bajo nivel sobre robot real entrenadas para tareas de mesa con dos brazos, usando las tres camaras y la propriocepcion como entrada.
- Ejecucion de tareas de largo horizonte guiada por subtareas: un planificador externo descompone la tarea en subtareas y el modelo las ejecuta una a una, recibiendo el texto de la subtarea actual como condicionamiento.
- Baseline reproducible para RoboDojo: sirve como punto de comparacion para otros fine-tunes sobre el mismo banco de 8 tareas con 100 demostraciones cada una.
- Punto de partida para nuevos fine-tunes: al derivar de `lerobot/pi05_base` y estar integrado en `lerobot`, puede reutilizarse como inicializacion para dominios de manipulacion similares.
- Investigacion en aprendizaje por imitacion: permite estudiar el efecto de etiquetas densas de subtarea generadas por un modelo de lenguaje sobre el rendimiento de una politica VLA.
- Evaluacion de la cadena planificador-politica: dado que el autor exige usar el mismo modelo que genero las etiquetas (GPT-5.6 Luna), el modelo es util para auditar la coherencia entre las etiquetas de entrenamiento y el planificador de inferencia.
- Recogida de datos y depuracion de pipelines LeRobot: el repositorio incluye las referencias de configuracion necesarias para cargar el modelo en el ecosistema, lo que facilita validar flujos de entrenamiento e inferencia.
- Demostraciones tecnicas internas de manipulacion con condicionamiento por lenguaje, siempre que se disponga del hardware robotico y de las camaras correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 9-10 GB en bf16 (4,14 mil millones de parametros mas activaciones y buffers de vision) y en torno a 17-20 GB en fp32. Son estimaciones derivadas del recuento de parametros; no hay mediciones publicadas por el autor.
- El repositorio ocupa 9,4 GB, coherente con pesos almacenados en mas de una precision o con copias adicionales del checkpoint.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o L40S para despliegue desatendido; una RTX 4090 de 24 GB deberia ser suficiente para inferencia en bf16 si el resto del pipeline (vision, planificador) no compite por memoria.
- Cabe en GPU de consumo: probablemente si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, en bf16. No hay confirmacion oficial.
- Opciones de despliegue: libreria `lerobot` sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y no serian adecuados al tratarse de un modelo de accion y no de generacion de texto.
- Latencia y throughput estimados: no disponibles. El rendimiento real dependera del robot, de las camaras y de la frecuencia de control exigida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_5_robodojo_preset_luna_b64_60k | 4,14 mil millones | No disponible | Politica VLA bimanual (8 tareas RoboDojo) | No disponible | HuggingFace, 0 descargas |
| lerobot/pi05_base | No disponible en la informacion proporcionada | No disponible | Politica VLA base | No disponible | HuggingFace |
| Otros modelos VLA de proposito general | No disponible | No disponible | Manipulacion robotica | No disponible | No disponible |

No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento ni de contexto para alternativas.

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que el uso comercial queda en un limbo legal hasta que el autor la especifique.
- No se publican resultados de benchmarks, ni en el repositorio ni en la model card, de modo que no hay evidencia cuantitativa de rendimiento.
- El modelo tiene 0 descargas y 0 likes: no hay validacion externa ni informes de terceros.
- El dominio es muy estrecho: 8 tareas bimanuales de sobremesa con 100 demostraciones cada una. Es previsible un mal comportamiento fuera de esa distribucion.
- La evaluacion depende de replicar el planificador de subtareas (GPT-5.6 Luna con el preset Baseline). Usar otro planificador puede degradar el rendimiento de forma dificil de diagnosticar.
- La model card advierte de que las configuraciones referencian el backbone y el tokenizer por id de hub o por rutas locales del sitio de entrenamiento, y que hay que apuntarlas a copias locales antes de cargar el modelo.
- No se especifica el idioma de las instrucciones de subtarea ni si el modelo generaliza a otros idiomas.
- No hay informacion sobre sesgos, sobre tasas de alucinacion (concepto poco aplicable a una politica de accion) ni sobre seguridad fisica en la operacion del robot.
- Al ser una politica de control sobre hardware real, cualquier despliegue requiere salvaguardas fisicas independientes: limites de par, paradas de emergencia y supervision humana.
- Las fechas de creacion y actualizacion del repositorio (19 de septiembre de 2026) son posteriores a la fecha habitual de publicacion; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_robodojo_preset_luna_b64_60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/RoboDojo-preset-luna
- Modelo base: https://huggingface.co/lerobot/pi05_base
- La busqueda web no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a foros y preguntas tecnicas sin relacion con Pi0.5 ni con robotica.
