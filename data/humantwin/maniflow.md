# Humantwin/maniflow

## Resumen

ManiFlow es una politica (policy) de imitacion para robotica desarrollada por la organizacion Humantwin, publicada en HuggingFace bajo el identificador `Humantwin/maniflow`. Se trata de un baseline de manipulacion diestra entrenado sobre datos de robot real de la plataforma Inspire-G1 (Stage-2), con dos variantes de tarea diferenciadas: `plastic` y `pill`. El modelo combina un encoder visual R3M con un backbone DiTX (variante de transformer de difusion/flow matching), y produce chunks de accion de 30 pasos a 30 Hz.

El problema que resuelve es la generacion de trayectorias de accion continuas y multi-articulacion para control de robot, cubriendo cuerpo completo (Body29, etiquetado como GMT) y manos diestras (Hand12, Inspire), es decir 41 dimensiones de accion por paso. No es un modelo de lenguaje: es un modelo de control por imitacion orientado a despliegue en robot real, con observaciones de imagen RGB y estado propioceptivo.

Su relevancia radica en que es un baseline reproducible con checkpoints, estadisticas de normalizacion y codigo de carga publicados, lo que facilita la comparacion y el despliegue. El repositorio ocupa 3,1 GB y agrupa los checkpoints de las dos tareas. La informacion disponible es limitada: no se publican idiomas soportados, numero de parametros ni resultados de benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Policy de imitacion con vision R3M + backbone DiTX (transformer de difusion/flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; visual_cond_len = 1024, action chunk = 30 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (`.ckpt`) |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Dimension de accion | 41 (Body29 GMT + Hand12 Inspire) |
| Frecuencia de control | 30 Hz |
| Chunk de accion | [30, 41] |
| Observacion | RGB [B,1,3,H,W], state [B,1,41] |
| Backbone DiTX | n_layer = 12, n_emb = 768, visual_cond_len = 1024 |
| Encoder visual | R3M |
| Checkpoints publicados | step15000 y 30k (latest.ckpt apunta a step15000) |
| Tareas | plastic, pill |
| Tamano del repositorio | 3,1 GB |
| Libreria | pytorch |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura combina un encoder visual R3M con un backbone DiTX configurado con 12 capas, dimension de embedding 768 y una longitud de condicionamiento visual de 1024. El modelo sigue un esquema de imitacion (imitation-learning) que genera chunks de accion de forma [30, 41], integrando el estado propioceptivo [B,1,41] y la observacion RGB. El prefijo "Flow" en ManiFlow sugiere un enfoque de flow matching o difusion para modelar la distribucion de acciones, si bien la model card no detalla el mecanismo exacto de muestreo.

El entrenamiento se realizo sobre datos de robot real de la plataforma Inspire-G1 (Stage-2), en dos tareas separadas. Segun el autor, la perdida de entrenamiento a 15k pasos fue de aproximadamente 0,05 para la tarea `plastic` y 0,08 para `pill`, con una perdida de validacion de `pill` inferior a la de `plastic` (los valores concretos de validacion no se facilitan y se remiten a logs locales). Se publican checkpoints en 15k y 30k pasos. No se especifica el numero total de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO, que en cualquier caso no aplican de forma estandar a un modelo de control.

## Capacidades

- Generacion de acciones de control continuo para robot: produce chunks de 30 pasos x 41 dimensiones a 30 Hz.
- Control de cuerpo completo y manos diestras de forma conjunta (Body29 + Hand12), orientado a manipulacion diestra.
- Percepcion visual integrada mediante encoder R3M sobre observaciones RGB.
- Condicionamiento por estado propioceptivo ([B,1,41]) ademas de la imagen.
- Ejecucion de dos tareas concretas: `plastic` y `pill`.
- Soporte de inferencia con pesos EMA (`use_ema=True` en el ejemplo de carga).
- API de despliegue de bajo nivel: `ManiFlowRobotWorker` con metodos `load()` e `infer()`, que devuelve el chunk de accion y el tiempo de inferencia en milisegundos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingue, vision generativa, audio ni modo "thinking".

## Casos de uso

- Manipulacion diestra de laboratorio: el modelo puede accionar de forma conjunta brazos y manos Inspire para tareas de recogida y colocacion de objetos (plastic, pill) sobre el robot G1, aprovechando el chunk de 30 pasos y el control a 30 Hz.
- Reproduccion de politicas por imitacion en robot real: sirve como baseline para comparar nuevas politicas de imitacion contra un punto de partida reproducible con checkpoints y normalizacion publicados.
- Investigacion en flow matching / difusion para robotica: el backbone DiTX permite estudiar el efecto de la configuracion (12 capas, 768 de embedding, visual_cond_len 1024) sobre el rendimiento de control.
- Ajuste fino sobre datos propios: dado que se publican pesos bajo Apache 2.0 y estadisticas de normalizacion (`norm_stats.json`), se puede reentrenar o afinar sobre nuevas tareas de manipulacion en la misma plataforma.
- Evaluacion de encoders visuales: al usar R3M como encoder, permite comparar representaciones visuales frente a alternativas dentro de un mismo pipeline de control.
- Despliegue en teleoperacion asistida: el chunk de accion y el control a 30 Hz permiten integrar la politica en bucles de control en tiempo real con supervision humana, usando el tiempo en milisegundos que devuelve `infer()` para monitorizar la latencia.
- Benchmarking entre checkpoints de tareas: la publicacion de dos tareas (`plastic` y `pill`) facilita medir transferencia y comparar perdidas entre dominios de manipulacion distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente facilita perdidas de entrenamiento y validacion a 15k pasos, que no constituyen benchmarks estandarizados:

| Tarea | train loss (aprox.) @15k | val_loss @15k |
|---|---:|---|
| plastic | ~0,05 | no disponible (superior a train segun el autor) |
| pill | ~0,08 | no disponible (inferior a la de plastic) |

No se proporcionan metricas de exito en tarea, tasas de exito en robot real, ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como estimacion orientativa a partir del tamano del repositorio (3,1 GB para dos tareas, con posibles pesos EMA), cada checkpoint podria requerir del orden de 1,5 GB en disco en el formato publicado; la VRAM de inferencia depende de si se carga en precision completa o reducida, dato no especificado por el autor.
- GPU recomendadas: no disponibles. No se indica hardware objetivo en la model card.
- Compatibilidad con GPU de consumo: probable en GPU de gama alta con suficiente VRAM, dado que el backbone declarado es relativamente compacto (12 capas, 768 de embedding) y el repo es de 3,1 GB, pero no se confirma oficialmente.
- Opciones de despliegue: el unico mecanismo documentado es Python con PyTorch a traves de `ManiFlowRobotWorker` (`maniflow.deploy.maniflow_robot_worker`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (estos no aplican a un modelo de control).
- Latencia y throughput: el metodo `infer()` devuelve el chunk de accion junto con el tiempo de inferencia en milisegundos (`chunk, ms = w.infer(...)`), lo que permite medir la latencia en el propio despliegue. No se publican cifras de latencia o throughput concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La ficha de ManiFlow no incluye comparaciones con otras politicas de robotica. A continuacion se listan categorias de modelos potencialmente comparables por tarea (politicas de imitacion para manipulacion), pero sin valores verificables en esta informacion:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Humantwin/maniflow | no disponible | no aplica (chunk 30) | solo train loss (plastic ~0,05; pill ~0,08) | Apache 2.0 | HuggingFace, 0 descargas |
| Politicas de difusion tipo Diffusion Policy | no disponible | no disponible | no disponible | no disponible | no disponible |
| Politicas tipo ACT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa fiable. Los resultados de la busqueda web realizada no aportan datos sobre modelos comparables (se refieren a herramientas de chat con LLM, no a robotica).

## Limitaciones y advertencias

- Modelo especifico de robotica: solo maneja dos tareas (`plastic` y `pill`) sobre la plataforma Inspire-G1; no es un modelo generalista ni de proposito multiple.
- Dependencia de plataforma: el contrato de accion (Body29 GMT + Hand12 Inspire) esta atado al hardware G1 e Inspire; no es portable a otros robots sin reentrenamiento.
- Dataset y composicion no documentados: no se indica el numero de episodios, la variabilidad de escenas, ni la diversidad de condiciones, lo que limita evaluar riesgos de sobreajuste.
- Perdidas de validacion incompletas: el autor remite a logs locales y no publica el valor exacto de `val_loss`; la unica referencia es que es "superior" para `plastic` e inferior para `pill`, lo que no permite juzgar la generalizacion.
- Riesgo de fallo fuera de distribucion: al ser un modelo de imitacion, es probable que degrade su comportamiento ante condiciones visuales o estados no vistos en entrenamiento (comportamiento esperado en este tipo de politicas; no cuantificado en la informacion disponible).
- Ausencia de benchmarks estandarizados: no hay metricas de exito en tarea ni comparaciones publicas, por lo que el rendimiento real en produccion no puede validarse con los datos facilitados.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su propio hardware y entorno, ya que no se ofrecen garantias.
- Idiomas y capacidades de lenguaje: no disponibles porque no es un modelo de lenguaje; no debe esperarse comportamiento conversacional ni de razonamiento textual.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, con lo que se trata de una publicacion reciente y sin validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Humantwin/maniflow
- Organizacion del autor: https://huggingface.co/Humantwin
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados obtenidos corresponden a herramientas de chat con LLM y no guardan relacion con ManiFlow).
