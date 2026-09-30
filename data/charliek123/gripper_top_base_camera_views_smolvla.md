# charlieK123/gripper_Top_Base_Camera_Views_SmolVLA

## Resumen

Este repositorio contiene una politica de robotica (policy) obtenida por ajuste fino de [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base), el modelo base SmolVLA publicado por Hugging Face. SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) de aproximadamente 450 millones de parametros, disenado para ejecutar tareas de manipulacion a partir de observaciones visuales y del estado de las articulaciones, con un coste computacional bajo que permite desplegarlo en hardware de consumo. En este caso, el autor (charlieK123) ha entrenado la politica para una unica tarea: coger pinzas y clasificarlas.

El modelo consume tres flujos de imagen RGB de 256x256 (camaras `gripperCam`, `bevCam` y `baseCam`) junto con el estado articular de 6 dimensiones, y produce un vector de accion continuo de 6 dimensiones sobre un brazo `so_follower` de LeRobot. Se distribuye bajo licencia Apache-2.0, en formato safetensors y con la libreria `lerobot`, con un tamano de repositorio de 0,9 GB, coherente con pesos en precision de 16 bits.

Su relevancia radica en dos factores. Por un lado, demuestra el flujo de trabajo completo de aprendizaje por imitacion con LeRobot sobre un dataset propio de 101 episodios y 57.034 fotogramas grabados a 30 FPS. Por otro, es un ejemplo de ajuste fino reproducible de un VLA pequeno, un paso habitual cuando se quiere adaptar una politica generalista a una tarea concreta de laboratorio o de linea de montaje. Conviene senalar que el repositorio no incluye resultados de evaluacion ni validacion en robot real, y que acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en el modelo base SmolVLA (backbone multimodal SmolVLM-2 con experto de accion); ajuste fino de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 (aproximadamente 450 M), segun los pesos safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors en precision de entrenamiento (el tamano de 0,9 GB es coherente con 16 bits) |
| Idiomas soportados | no disponible; la politica produce acciones de robot, no texto |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un backbone multimodal (familia SmolVLM-2) con un experto de accion. La politica recibe observaciones multimodales (imagenes y estado propioceptivo) y emite directamente comandos motores, sin generar texto intermedio. En este ajuste fino concreto, las entradas son el estado articular `observation.state` con forma `(6,)` y tres camaras (`observation.images.camera1`, `camera2` y `camera3`) con forma `(3, 256, 256)` cada una, correspondientes a las vistas de pinza (`gripperCam`), cenital (`bevCam`) y de base (`baseCam`). La salida es una accion de 6 dimensiones con forma `(6,)`, adecuada para el brazo `so_follower`.

El ajuste fino se realizo con LeRobot 0.6.1 durante 50.000 pasos, con tamano de lote 1, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El dataset de entrenamiento ([charlieK123/gripper_Top_Base_Camera_Views_GroupedDataSet](https://huggingface.co/datasets/charlieK123/gripper_Top_Base_Camera_Views_GroupedDataSet)) contiene 101 episodios y 57.034 fotogramas a 30 FPS, todos ellos correspondientes a la tarea "picking up forceps and sorting the forceps". Se trata, por tanto, de un dataset de un unico operador y un unico entorno, con aproximadamente 32 minutos de datos efectivos. No se proporciona informacion sobre la composicion del corpus de preentrenamiento del modelo base, sobre si hubo RLHF o DPO, ni sobre innovaciones tecnicas concretas; el articulo referenciado es arXiv:2506.01844.

## Capacidades

- Control de manipulacion por imitacion: genera comandos articulares de 6 grados de libertad para un brazo `so_follower` a partir de imagenes y estado.
- Fusion multimodal de tres vistas de camara simultaneas (pinza, cenital y base) con estado articular de 6 dimensiones.
- Ejecucion de una tarea especifica de pick-and-place: coger pinzas y clasificarlas.
- Inferencia en bucle de control a la frecuencia del dataset de entrenamiento (30 FPS), sujeta a la latencia real del hardware.
- Compatibilidad con el ecosistema LeRobot para rollout (`lerobot-rollout`) y para reentrenamiento (`lerobot-train`).
- Punto de partida para ajustes finos adicionales sobre `lerobot/smolvla_base`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de un modelo de lenguaje: es una politica de control, no un asistente conversacional.
- No genera texto, codigo ni contenido multimodal de salida; su unica salida es el vector de accion.

## Casos de uso

- Clasificacion de instrumental de laboratorio: es la tarea exacta para la que se entreno la politica (coger pinzas y ordenarlas); puede usarse como referencia o como base para tareas equivalentes con objetos similares en un banco de trabajo.
- Base para nuevos ajustes finos: al partir del mismo modelo base y del mismo pipeline LeRobot, sirve como punto de comparacion al entrenar politicas para otras tareas de manipulacion.
- Prototipado de automatizacion pick-and-place: con un brazo SO-100/SO-101 y tres camaras, permite montar una celda de manipulacion de bajo coste para demostraciones o validaciones internas.
- Investigacion en aprendizaje por imitacion: util para estudiar el efecto del numero de episodios, de las vistas de camara o de la tasa de aprendizaje sobre el exito de la tarea.
- Docencia y formacion en robotica: sirve como ejemplo completo del flujo grabar datos, entrenar y desplegar con LeRobot, incluidos los comandos de rollout.
- Evaluacion comparativa de politicas VLA: permite contrastar en un mismo montaje hardware el comportamiento de SmolVLA ajustado frente a otras politicas del ecosistema LeRobot.
- Pruebas de reproducibilidad de infraestructura: util para verificar la instalacion de LeRobot, la calibracion de camaras y la comunicacion con el brazo antes de abordar tareas mas complejas.
- Recogida de datos asistida: el propio comando de despliegue documentado no registra episodios, por lo que puede emplearse como politica de referencia mientras se graban nuevas demostraciones.

En todos los casos, el exito de la tarea depende de reproducir la configuracion de camaras y el montaje con el que se genero el dataset; cambiar la posicion de las camaras o el robot invalida la politica sin un nuevo ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una seccion de evaluacion vacia, con la indicacion explicita de que no se han aportado resultados para esta politica. Tampoco hay tasas de exito en robot real, numero de ensayos ni datos de latencia medidos.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 0,9 GB en 16 bits y 1,8 GB en fp32. Contando activaciones y los tres flujos de imagen de 256x256, una estimacion razonable es de 2 a 4 GB de VRAM para inferencia, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Para inferencia cabe en RTX 3050, RTX 3060, RTX 4060 o RTX 4090. Para entrenamiento con el pipeline LeRobot, una RTX 4090 es suficiente; A100 o H100 solo tienen sentido para entrenamientos paralelos o barridos de hiperparametros.
- GPU de consumo: si, el modelo base SmolVLA esta disenado explicitamente para poder desplegarse en hardware de consumo, y con 450 M de parametros la politica ajustada mantiene ese perfil.
- CPU: el modelo base esta planteado para funcionar tambien en CPU; no se dispone de latencias publicadas para este ajuste fino concreto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecutar, `lerobot-train` para reentrenar) sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. La referencia disponible es la frecuencia de grabacion del dataset (30 FPS), que marca el orden de magnitud del bucle de control esperado.
- Almacenamiento: 0,9 GB para el repositorio completo.

## Comparativa con modelos similares

Datos de modelos comparables obtenidos de sus fichas publicas; conviene verificarlos antes de usarlos en una decision de produccion.

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charlieK123/gripper_Top_Base_Camera_Views_SmolVLA | 450 M | VLA (SmolVLA ajustado) | no disponible | apache-2.0 | Hugging Face, libreria `lerobot` |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | VLA (modelo base) | no disponible | apache-2.0 | Hugging Face, libreria `lerobot` |
| OpenVLA | aproximadamente 7 000 M | VLA (transformer sobre backbone Llama-2) | no disponible | MIT | Hugging Face |
| pi0 (openpi) | aproximadamente 3 300 M | VLA con flow matching | no disponible | apache-2.0 | Hugging Face / repositorio openpi |
| ACT (LeRobot) | no disponible | Politica de imitacion con transformer de acciones | no disponible | MIT | Repositorio LeRobot |

La diferencia principal frente a OpenVLA y pi0 es el orden de magnitud en numero de parametros: 450 M frente a 7 000 M y 3 300 M respectivamente, lo que sitúa a SmolVLA en el segmento de despliegue en hardware de consumo. No se dispone de comparaciones de rendimiento entre estas politicas dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito, numero de ensayos ni validacion en robot real, por lo que se desconoce si la politica funciona de forma fiable.
- Especializacion extrema: entrenada para una unica tarea ("picking up forceps and sorting the forceps"), un unico robot (`so_follower`) y una unica configuracion de camaras. No generaliza a otras tareas, objetos o montajes sin reentrenar.
- Dependencia de la configuracion de camaras: los nombres de las camaras deben coincidir exactamente con las claves de observacion usadas en el entrenamiento (`gripperCam`, `bevCam`, `baseCam`); cambiar la posicion, la altura o la orientacion invalida la politica.
- Dataset pequeno y poco diverso: 101 episodios y 57.034 fotogramas (unos 32 minutos) de un unico entorno implican riesgo de sobreajuste y baja robustez ante cambios de iluminacion, posiciones nuevas de los objetos, distracciones o un robot distinto del mismo modelo.
- Riesgo fisico: aunque no procede hablar de alucinacion en el sentido generativo, la politica puede emitir acciones incorrectas sin senal de error, lo que en un brazo robotico real puede provocar colisiones o danos. Se recomienda operar con limites de par, parada de emergencia y espacio de trabajo despejado.
- Cero validacion por la comunidad: 0 descargas y 0 likes; el modelo no ha sido replicado ni contrastado por terceros.
- Idiomas y contexto: la ficha no declara idiomas soportados ni longitud de contexto, ya que la salida es un vector de accion y no texto.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial con atribucion y conservacion del aviso de licencia. Conviene revisar tambien la licencia del modelo base y la de las dependencias de LeRobot.
- Trazabilidad: la model card conserva texto de plantilla sin rellenar (seccion de evaluacion vacia y bloque de demostracion comentado), y las fechas de creacion y actualizacion del repositorio son incoherentes con el calendario habitual, lo que dificulta trazar su procedencia.
- Requisito de hardware adicional: ademas de la GPU, el despliegue exige el robot `so_follower` calibrado, tres camaras y la version correspondiente de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlieK123/gripper_Top_Base_Camera_Views_SmolVLA
- Dataset de entrenamiento: https://huggingface.co/datasets/charlieK123/gripper_Top_Base_Camera_Views_GroupedDataSet
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlieK123/gripper_Top_Base_Camera_Views_GroupedDataSet
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
