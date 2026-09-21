# fysical/act_greenball

## Resumen

`fysical/act_greenball` es una politica de robotica (no un modelo de lenguaje) entrenada con el metodo Action Chunking with Transformers (ACT) mediante aprendizaje por imitacion. La publica el usuario `fysical` en HuggingFace usando la libreria LeRobot, y su funcion es controlar un brazo robotico de tipo `so_follower` para ejecutar una unica tarea manipulativa: coger una pelota verde y dejarla en una cesta ignorando dos pelotas rojas de distraccion.

El modelo tiene 51.668.614 parametros y consume observaciones multimodales: el estado articular (vector de 6 dimensiones) y dos imagenes de 480x640 procedentes de dos camaras (`front` y `wrist`). Devuelve como salida un vector de accion de 6 dimensiones, es decir, comandos de articulacion para el brazo. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors.

Su relevancia es doble: por un lado sirve como ejemplo reproducible de un pipeline completo de imitacion (teleoperacion, grabacion de episodios, entrenamiento y despliegue) dentro del ecosistema LeRobot; por otro, es un caso concreto de aprendizaje con distractores visuales, un escenario habitual en investigacion de manipulacion. El repositorio no incluye resultados de evaluacion ni validacion por parte de la comunidad (0 descargas y 0 likes en el momento de redactar esta ficha), por lo que su tasa de exito real es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con VAE condicional (CVAE) para Action Chunking (ACT), con codificador visual para dos camaras |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la politica consume una observacion por paso (estado de 6 dimensiones y dos imagenes de 3x480x640) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (politica de robotica; la descripcion textual de la tarea esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `wrist` |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `fysical/greenball_test` (100 episodios, 56.975 fotogramas, 30 FPS) |
| Tarea | "Pick up the green ball and place it in the basket, ignoring the two red distractor balls" |
| Pasos de entrenamiento | 60.000 |
| Optimizador / tasa de aprendizaje | adamw / 1e-05 |
| Tamano de lote / semilla | 8 / 1000 |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 1,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 segun los metadatos del repositorio |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion descrito en el articulo arXiv:2304.13705. En lugar de predecir una accion por paso, el modelo predice fragmentos cortos de acciones (*action chunks*), lo que reduce el error de compounding que aparece cuando el robot ejecuta acciones individuales basadas en sus propias predicciones. La formulacion del metodo original combina un autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas con un transformer encoder-decoder, y utiliza una red convolucional tipo ResNet como extractor de caracteristicas visuales para las camaras. En el articulo original los fragmentos se generan con k = 100 pasos y se combinan mediante ensamblado temporal (*temporal ensembling*); la model card de este repositorio no detalla la configuracion exacta de *chunk size* empleada.

El entrenamiento se realizo exclusivamente con datos de teleoperacion del dataset `fysical/greenball_test`: 100 episodios, 56.975 fotogramas a 30 FPS (aproximadamente 31,6 minutos de datos), correspondientes a la tarea de recoger la pelota verde ignorando dos pelotas rojas. Se ejecutaron 60.000 pasos de optimizacion con AdamW, tasa de aprendizaje 1e-05 y tamano de lote 8, usando LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni de ninguna fase de ajuste con preferencias humanas, algo coherente con un paradigma de imitacion supervisada. Tampoco se especifica si se aplicaron aumentos de datos, variaciones de iluminacion o aleatorizacion de posiciones durante la recogida.

## Capacidades

- Manipulacion visomotora de una sola tarea: control de un brazo `so_follower` de 6 grados de libertad mediante un vector de accion de 6 dimensiones.
- Percepcion multimodal con dos camaras simultaneas (vista frontal y vista de muneca) a 480x640, integradas con el estado articular.
- Discriminacion de objetos por color en un escenario con distractores: distinguir la pelota verde de dos pelotas rojas.
- Ejecucion de secuencias pick-and-place completas (coger y depositar en una cesta) sin planificacion simbolica externa.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, con prediccion de fragmentos de accion en lugar de pasos aislados.
- Generacion de texto: no disponible.
- Razonamiento linguistico, matematicas o codigo: no disponible.
- Tool calling o function calling: no disponible.
- Comportamiento agentico o razonamiento multi-paso deliberativo: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento, vision general, audio o procesamiento de lenguaje natural: no disponible.
- Control por instrucciones en lenguaje natural: no disponible; la tarea se fija en el momento del despliegue como cadena de texto (`--task`) y no es una entrada procesada por el modelo.

## Casos de uso

- Automatizacion de pick-and-place en linea de clasificacion: el modelo coge un objeto concreto y lo deposita en un contenedor, con la misma configuracion de camaras y robot, replicando la tarea del dataset de entrenamiento.
- Recogida selectiva por color en entornos con distractores: sirve como base para tareas de separacion de residuos o de piezas donde hay que ignorar objetos visualmente similares.
- Punto de partida para *fine-tuning* en tareas propias: al ser un checkpoint ACT entrenado y funcional, se puede reentrenar con un dataset propio mediante `lerobot-train --policy.type=act` reduciendo el coste frente a entrenar desde cero.
- Validacion de infraestructura de robotica: sirve para comprobar el cableado, la calibracion de camaras, la asignacion de puertos y el flujo `lerobot-rollout` antes de invertir en la recogida de datos propia.
- Docencia y formacion en aprendizaje por imitacion: es un ejemplo completo y pequeno (51,7 millones de parametros) para explicar el ciclo teleoperacion, dataset, entrenamiento y despliegue en un brazo de bajo coste.
- Comparacion de metodos de imitacion: sirve como referencia ACT frente a otras politicas (por ejemplo, Diffusion Policy o SmolVLA) sobre la misma tarea y el mismo hardware, siempre que se entrene con el mismo dataset.
- Evaluacion de robustez ante distractores: el dataset incluye explicitamente dos pelotas rojas de distraccion, por lo que es util para estudiar sensibilidad a objetos irrelevantes y a cambios de posicion o iluminacion.
- Teleoperacion asistida en laboratorio: como politica de sugerencia de acciones durante la recogida de datos, aunque la model card no documenta ningun modo de asistencia en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la plantilla vacia y la indicacion explicita de que no se han proporcionado resultados para esta politica, por lo que no existe tasa de exito medida en robot real, ni numero de ensayos, ni datos de generalizacion a nuevas posiciones, iluminaciones o robots equivalentes.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible |
| Numero de ensayos de evaluacion | no disponible |
| MMLU / HumanEval / GSM8K u otros benchmarks de lenguaje | no aplica (no es un modelo de lenguaje) |
| Comparacion con ACT original o Diffusion Policy sobre la misma tarea | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los 51,7 millones de parametros ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16. Sumando los buffers de dos imagenes de 480x640, las activaciones del extractor visual y el contexto de CUDA, una GPU con 2-4 GB de VRAM deberia ser suficiente; no se publican requisitos oficiales.
- GPU recomendadas: no hay recomendacion oficial. Por tamano del modelo, cualquier GPU con soporte CUDA moderna es apta; una RTX 3060, RTX 4070 o superior ofrece margen sobrado para este modelo.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo con al menos 4 GB de VRAM. La restriccion practica no es la memoria, sino cumplir la frecuencia de control.
- CPU: tecnicamente es posible ejecutar la inferencia en CPU por el reducido tamano del modelo, pero no se documenta latencia ni viabilidad para control en bucle cerrado.
- Opciones de despliegue: `lerobot-rollout` (interfaz documentada en la model card) para ejecucion en el robot; el mismo paquete LeRobot cubre entrenamiento con `lerobot-train`. No se documenta soporte explicito de vLLM, TGI, Ollama o llama.cpp, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. Como referencia de contexto, el dataset de entrenamiento se grabo a 30 FPS, de modo que una politica de control fluido deberia inferir a una frecuencia comparable, pero no hay medidas publicadas de latencia real ni de frecuencia de inferencia alcanzada.
- Almacenamiento: el repositorio ocupa 1,9 GB, un tamano muy superior al de los pesos (unos 207 MB), lo que sugiere la presencia de checkpoints intermedios de entrenamiento.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos numericos de otros modelos comparables. La tabla siguiente resume lo que se puede afirmar con la informacion disponible; los campos sin datos se marcan como no disponibles.

| Modelo | Parametros | Tipo de politica | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fysical/act_greenball` | 51.668.614 | ACT (CVAE + transformer, action chunking) | Pick-and-place de pelota verde con dos distractores rojos, robot `so_follower` | Apache 2.0 | Pesos en safetensors en HuggingFace, 0 descargas y 0 likes |
| ACT (metodo original, arXiv:2304.13705) | no disponible | ACT (CVAE + transformer, action chunking) | Multiples tareas manipulativas del articulo | no disponible | Codigo y resultados descritos en el articulo |
| Diffusion Policy | no disponible | Politica generativa basada en difusion | Manipulacion visomotora | no disponible | no disponible |
| SmolVLA | no disponible | Vision-language-action | Manipulacion guiada por lenguaje | no disponible | no disponible |

La comparacion relevante en terminos practicos es que `fysical/act_greenball` es una politica monoTarea y especifica de un montaje concreto, mientras que propuestas como SmolVLA apuntan a control guiado por lenguaje natural. No se dispone de datos para cuantificar diferencias de rendimiento.

## Limitaciones y advertencias

- Es una politica monoTarea: solo esta entrenada para la tarea descrita (coger la pelota verde e ignorar las rojas) y no generaliza a instrucciones nuevas.
- Dependencia del montaje: espera un robot de tipo `so_follower` con dos camaras concretas (`front` y `wrist`); los nombres de camara deben coincidir exactamente con las claves de observacion del entrenamiento.
- Sin resultados de evaluacion publicados: la tasa de exito en robot real es desconocida, por lo que no deberia desplegarse en produccion sin una validacion propia.
- Riesgo de fallo fuera de distribucion: como toda politica de imitacion, puede degradarse ante cambios de iluminacion, posicion de los objetos, fondo, calibracion de camaras o sustitucion del robot por otra unidad equivalente. El analogo a la alucinacion en este contexto es la deriva de la accion cuando la observacion se aleja de las condiciones de entrenamiento.
- Error acumulado: aunque el *action chunking* reduce el *compounding error*, no lo elimina; secuencias largas pueden desviarse progresivamente.
- Datos de entrenamiento limitados: 100 episodios y unos 31,6 minutos de teleoperacion de una unica tarea, sin informacion sobre variabilidad de posiciones, condiciones de luz o aleatorizacion.
- Ausencia de validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni replicaciones conocidas.
- Licencia del modelo Apache 2.0, permisiva para uso comercial, pero la licencia del dataset `fysical/greenball_test` debe verificarse por separado antes de reutilizarlo.
- Idiomas: no aplica; la descripcion de la tarea esta en ingles y el modelo no procesa lenguaje natural.
- Metadatos incoherentes: las fechas de creacion y actualizacion del repositorio figuran como 2026-09-21, posteriores a la fecha de redaccion de esta ficha, lo que apunta a un error de metadatos.
- Tamano del repositorio (1,9 GB) muy superior al de los pesos (unos 207 MB): conviene revisar que artefactos adicionales se descargan antes de integrarlo en un pipeline automatizado.
- No hay informacion sobre sesgos mas alla del montaje experimental, ni sobre el uso de datos de personas durante la teleoperacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fysical/act_greenball
- Dataset de entrenamiento: https://huggingface.co/datasets/fysical/greenball_test
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fysical/greenball_test
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Version en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo. Corresponden a paginas de descarga de la aplicacion Xbox para PC y movil (xbox.com y apps.microsoft.com), por lo que no se ha incorporado informacion adicional procedente de ellos.
