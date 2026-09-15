# end-effector-trace-conditioning/molmoact2-500ep-eetc

## Resumen

molmoact2-500ep-eetc es un ajuste fino de MolmoAct2, el modelo fundacional de robotica abierto del Allen Institute for AI (Ai2), publicado por el usuario end-effector-trace-conditioning a traves de la libreria LeRobot de Hugging Face. Se trata de una politica vision-lenguaje-accion (VLA) de 5.442.196.272 parametros que toma imagenes de camara junto con una instruccion en lenguaje natural y las convierte en chunks de acciones de 6 dimensiones para un brazo robotico de tipo `so_follower`.

El entrenamiento se ha realizado por imitacion sobre el dataset mattpidden/500eps-endeffector-trace-dataset, formado por 498 episodios y 137.695 fotogramas capturados a 30 FPS, que cubren 25 tareas de manipulacion: recoger y colocar, apilar, empujar, reorientar objetos y abrir o insertar elementos en recipientes. La configuracion documentada incluye 40.180 pasos de entrenamiento, tamano de lote 24, optimizador AdamW y tasa de aprendizaje 1e-5.

El repositorio ocupa 10,9 GB, se distribuye bajo licencia Apache 2.0 y publica los pesos en formato safetensors. No se han publicado resultados de evaluacion en robot real, ni datos de benchmarks, ni especificaciones de contexto, cuantizacion o latencia; la model card tampoco documenta explicitamente la variante "end-effector trace conditioning" que sugiere el espacio de nombres del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en MolmoAct2; no se detalla la topologia interna (transformer, MoE o hibrida) en la informacion disponible |
| Parametros totales | 5.442.196.272 (dato real de los safetensors) |
| Parametros activos | No aplica: no se ha documentado que sea un modelo MoE |
| Longitud de contexto | No disponible. Es una politica robotica que consume una ventana de observacion por paso de control, no un modelo de contexto de texto |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors, sin variantes cuantizadas (GGUF, AWQ, GPTQ ni similares) documentadas |
| Idiomas soportados | No disponible. Las 25 instrucciones de tarea del dataset de entrenamiento estan redactadas en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo (pipeline) | robotics |
| Libreria | lerobot |
| Robot objetivo | `so_follower` |
| Entradas | `observation.images.middle` (3, 480, 640); `observation.images.wrist` (3, 480, 640); `observation.state` (6,) |
| Salidas | `action` (6,) |
| Camaras declaradas | `wrist`, `right`, `left`, `middle` (la tabla de entradas solo define `middle` y `wrist`) |
| Tamano del repositorio | 10,9 GB |
| Dataset de entrenamiento | mattpidden/500eps-endeffector-trace-dataset (498 episodios, 137.695 fotogramas, 30 FPS) |
| Descargas / likes en el Hub | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo fundacional de robotica que mapea imagenes de camara e instrucciones en lenguaje a chunks de acciones, segun la descripcion de Ai2 recogida en la model card. La implementacion utilizada es la de LeRobot, que da soporte a entrenamiento y evaluacion del modelo MolmoAct2 estandar. Esta ficha concreta corresponde a un ajuste fino con 5.442.196.272 parametros y salida de accion de 6 dimensiones, propia de un brazo `so_follower`. El nombre del espacio de nombres del autor, "end-effector-trace-conditioning", sugiere un condicionamiento sobre la traza del efector final, pero la model card no describe esa innovacion ni la diferencia respecto al MolmoAct2 base, por lo que no puede confirmarse.

El entrenamiento es de imitacion supervisada sobre 498 episodios (137.695 fotogramas a 30 FPS) que cubren 25 tareas de manipulacion, con instrucciones como "Pick up the apple and place it in the bowl.", "Stack the block on top of the apple." o "Open the spice jar by lifting the lid.". La configuracion declarada es la siguiente:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 40.180 |
| Tamano de lote | 24 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.0 |

No se documenta el numero de tokens ni la composicion del dataset mas alla de los episodios y fotogramas indicados, ni se menciona el uso de RLHF, DPO u otra fase de alineamiento posterior al entrenamiento por imitacion.

## Capacidades

- Generacion de chunks de acciones de 6 dimensiones a partir de observaciones visuales y una instruccion textual.
- Percepcion visual multi-camara: la politica declara entrada para las vistas `middle` y `wrist` a 480x640, y la model card menciona ademas camaras `left` y `right`.
- Control de brazo robotico de tipo `so_follower` (familia SO-100/SO-101), con lectura del estado articular de 6 dimensiones.
- Ejecucion de 25 tareas de manipulacion entrenadas: recoger y colocar objetos, apilar, empujar, reorientar objetos y abrir o insertar en recipientes.
- Aprendizaje por imitacion supervisada a partir de demostraciones teleoperadas.
- Integracion nativa con el ecosistema LeRobot para rollout y reentrenamiento mediante linea de comandos.
- Tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de texto; el modelo produce secuencias de accion en bucle cerrado.
- Capacidades multilingues: no disponibles; las instrucciones del dataset estan en ingles.
- Capacidades especiales (modo thinking, vision generativa, audio): no documentadas.

## Casos de uso

- Manipulacion de laboratorio con brazo SO-100/SO-101: la politica puede ejecutar directamente tareas de pick-and-place y apilado sobre el hardware `so_follower` para el que fue entrenada, usando `lerobot-rollout` con las camaras `middle` y `wrist`.
- Automatizacion de tareas de ordenacion de objetos: con instrucciones como "Pick up the block and place it next to the pencil basket.", el modelo puede clasificar y colocar piezas en contenedores en lineas de montaje ligeras o celdas de ensamblaje.
- Reorientacion de piezas antes de un proceso posterior: las tareas de "Reorient the block upright" o "Reorient the spice jar upright" permiten usar la politica como paso previo de alineacion de objetos para alimentar maquinas o cintas.
- Apertura y manipulacion de recipientes: las tareas de abrir tapa de vaso y de tarro de especias cubren la retirada de cubiertas, util en entornos de laboratorio o cocina automatizada.
- Insercion de objetos en contenedores estrechos: tareas de insertar un rotulador en un cesto o una pajita en un vaso y en un tarro son aplicables a escenarios de ensamblaje fino con tolerancias ajustadas.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar tecnicas de condicionamiento por traza del efector final, comparar variantes de entrenamiento o evaluar transferencia entre tareas de un mismo dataset.
- Base para ajuste fino con datos propios: al ser Apache 2.0 y estar integrado en LeRobot, se puede reentrenar con `lerobot-train --policy.type=molmoact2` sobre un dataset propio con el mismo robot y numero de camaras.
- Banco de pruebas de infraestructura de inferencia robotica: permite medir latencia real de una politica de 5,44 mil millones de parametros en bucle de control a 30 Hz en distintas GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia, con la plantilla de tabla de tasa de exito sin rellenar, por lo que no existen datos de exito por tarea, ni comparaciones con el MolmoAct2 base ni con otras politicas.

## Requisitos de hardware

Las cifras de memoria de esta seccion son estimaciones derivadas del recuento real de parametros (5.442.196.272) y no mediciones publicadas por el autor.

- VRAM estimada para los pesos en precision fp32: en torno a 21,8 GB, sin contar activaciones ni buffers del codificador visual.
- VRAM estimada para los pesos en bf16/fp16: en torno a 10,9 GB, mas el coste de activaciones y de las imagenes de entrada de 480x640 por camara.
- VRAM estimada para los pesos en int8: en torno a 5,4 GB; en 4 bits, en torno a 2,7 GB, en ambos casos con posible perdida de precision no evaluada por el autor.
- GPU recomendadas (orientativo): A100 40/80 GB, H100, L40S o RTX 6000 Ada para ejecucion holgada en bf16; RTX 4090 o RTX 3090 (24 GB) para bf16 con margen suficiente para activaciones y una o dos camaras.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en bf16; en tarjetas de 16 GB el encaje es ajustado y probablemente obligue a int8 o a precision mixta; en tarjetas de 8-12 GB solo seria viable con cuantizacion agresiva y descarga parcial a CPU, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: el flujo oficial es LeRobot sobre PyTorch y CUDA, con `lerobot-rollout` para ejecucion en robot y `lerobot-train` para reentrenamiento. vLLM, llama.cpp, Ollama y TGI no son aplicables, dado que no se trata de un servidor de inferencia de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de requisito del entorno, el dataset se capturo a 30 FPS, de modo que un bucle de control a esa frecuencia exige tiempos de inferencia por debajo de aproximadamente 33 ms por chunk de accion; no se ha publicado ninguna medicion que confirme que el modelo los alcanza.
- La ejecucion real requiere ademas el robot `so_follower` y las camaras configuradas con nombres coincidentes con las claves de observacion del entrenamiento.

## Comparativa con modelos similares

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre MolmoAct2: los enlaces recuperados corresponden a tiendas de ropa y a un listado de mercadillos, sin relacion con robotica. Por tanto, los datos de terceros que se muestran a continuacion no estan verificados en la informacion disponible.

| Modelo | Parametros | Contexto / dataset | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| molmoact2-500ep-eetc | 5.442.196.272 | 498 episodios, 137.695 fotogramas a 30 FPS, 25 tareas | apache-2.0 | Hugging Face, libreria lerobot | Ajuste fino concreto para robot `so_follower`; sin evaluacion publicada |
| MolmoAct2 (base, Ai2) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Referenciado en el blog de Ai2 | Modelo fundacional del que deriva esta politica |
| Otras politicas VLA abiertas (por ejemplo, OpenVLA o pi0) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Se citan como categoria comparable, pero no se ha recuperado informacion que permita contrastar cifras |

Comparativamente, el unico dato firme es el tamano del modelo (5,44 mil millones de parametros), su licencia Apache 2.0 y la magnitud de su dataset de ajuste (498 episodios). No hay datos publicos en esta ficha que permitan comparar tasas de exito ni rendimiento frente a alternativas.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion en robot real: la tabla de exito por tarea de la model card esta vacia, por lo que se desconoce la tasa de exito en cada una de las 25 tareas.
- Sesgos conocidos: no documentados. Al entrenarse con un unico dataset de 498 episodios, el modelo hereda los sesgos de posicion, iluminacion, tipo de objeto y estilo de teleoperacion de ese dataset.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones incorrectas o inseguras cuando la observacion se aleja de la distribucion de entrenamiento (objetos, fondos o posiciones no vistos).
- Sobreajuste al entorno de entrenamiento: el modelo espera exactamente las claves de observacion `observation.images.middle`, `observation.images.wrist` y `observation.state` con las formas indicadas; cualquier cambio de camara, resolucion o numero de articulaciones invalida su uso directo.
- Inconsistencia en la documentacion: la seccion de detalles declara cuatro camaras (`wrist`, `right`, `left`, `middle`), pero la tabla de entradas solo define dos; conviene verificar la configuracion real antes de desplegar.
- Inconsistencia en el ejemplo de uso: el comando de la model card apunta a `--policy.path=justintiensmith/molmoact2_500eps_endeffector_trace`, un repositorio distinto del que titula esta ficha (`end-effector-trace-conditioning/molmoact2-500ep-eetc`); hay que confirmar cual es el artefacto correcto.
- Limitaciones de idioma: las instrucciones del dataset estan en ingles y no se documenta soporte multilingue; introducir instrucciones en castellano queda fuera de la distribucion de entrenamiento.
- Longitud de contexto: no documentada. La politica trabaja por chunks de accion sobre la observacion actual, sin una ventana de contexto larga declarada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el aviso de cambios. No se identifican clausulas adicionales en la informacion disponible.
- Estado de validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin senales externas de validacion ni de replicacion independiente.
- Uso en produccion: requiere hardware robotico especifico, calibracion previa y un bucle de control que cumpla los 30 FPS del dataset; sin mediciones de latencia publicadas, el despliegue en tiempo real debe validarse in situ.
- Seguridad fisica: al tratarse de una politica que mueve un efector real, se recomienda limitar velocidades y fuerzas, definir paradas de emergencia y supervisar las primeras ejecuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/end-effector-trace-conditioning/molmoact2-500ep-eetc
- Dataset de entrenamiento: https://huggingface.co/datasets/mattpidden/500eps-endeffector-trace-dataset
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mattpidden/500eps-endeffector-trace-dataset
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de MolmoAct2 en LeRobot: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Resultados de la busqueda web: no se recupero ningun enlace relevante sobre el modelo; los resultados obtenidos corresponden a sitios sin relacion con robotica o con IA (tiendas de ropa y listados de mercadillos).
