# felsager/pi05_cube2cross_dr_bs64

## Resumen

pi05_cube2cross_dr_bs64 es un modelo de Vision-Language-Action (VLA) derivado de π₀.₅ (Pi05), el modelo de Physical Intelligence disenado para generalizacion en entornos abiertos. En concreto, se trata de un fine-tuning del checkpoint base lerobot/pi05_base, adaptado mediante la libreria LeRobot de Hugging Face para ejecutar una tarea de manipulacion robotica concreta: recoger un cubo de color y colocarlo sobre una cruz roja. El autor del repositorio es el usuario felsager.

El modelo resuelve un problema de imitacion visomotora: dado un estado articular de 10 dimensiones y tres flujos de imagen (camara superior, camara de muneca y una tercera camara), predice un vector de accion de 10 dimensiones para un robot UR5e con mano. Con 4.143.404.816 parametros (aproximadamente 4,14 mil millones), se situa en la gama de VLA de tamano medio y hereda la arquitectura y el conocimiento del modelo base de Physical Intelligence.

Su relevancia es acotada pero clara: es un ejemplo reproducible de como LeRobot permite especializar un VLA generalista en una tarea de pick-and-place con 999 episodios teleoperados, sirviendo como referencia practica para equipos que quieran entrenar sus propias politicas con el mismo pipeline. No es un modelo de proposito general ni un chatbot: su salida es exclusivamente accion motora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementacion LeRobot de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist, empty_camera_0 |
| Entrada de estado | observation.state, shape (10,) |
| Entradas visuales | observation.images.top (3, 480, 640), observation.images.wrist (3, 480, 640), observation.images.empty_camera_0 (3, 224, 224) |
| Salida | action, shape (10,) |
| Tamano del repositorio | 24,9 GB |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀.₅, el VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistas durante el entrenamiento. La implementacion utilizada es la de LeRobot, adaptada del repositorio open source OpenPI. La arquitectura combina un backbone vision-lenguaje con un cabezal de acciones que produce vectores de 10 dimensiones a partir de observaciones multimodales (estado articular y tres camaras). No se detalla en la informacion disponible el numero de capas, el mecanismo de atencion ni la composicion exacta del backbone.

El entrenamiento se realizo por imitacion supervisada sobre el dataset felsager/vla_cubes_cross_dr, compuesto por 999 episodios y 510.363 frames a 30 FPS. Las tareas cubiertas son cuatro variantes de pick-and-place: recoger el cubo verde, azul, amarillo o rojo y colocarlo sobre la cruz roja. La configuracion de entrenamiento fue de 120.000 pasos, batch size 8, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.2. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de refuerzo adicionales; se trata de aprendizaje por imitacion puro.

## Capacidades

- Generacion de acciones motoras para un robot UR5e con mano: produce vectores de 10 dimensiones a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa simultaneamente camara superior, camara de muneca y una tercera camara auxiliar.
- Ejecucion de tareas de pick-and-place condicionadas por instruccion en lenguaje natural (cuatro tareas de cubo a cruz).
- Generalizacion heredada de π₀.₅: el modelo base esta disenado para generalizar a entornos nuevos, aunque el fine-tuning concreto esta especializado en el dominio del dataset.
- Integracion con el ecosistema LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto: su unica salida es accion motora.
- Capacidades multilingues: no aplicables (modelo de accion, no de lenguaje).

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo permite a un UR5e recoger cubos de cuatro colores y depositarlos sobre una cruz roja, usando las camaras top y wrist para localizar el objeto y planificar la accion. Es adecuado porque fue entrenado especificamente para esa tarea con 999 episodios.
- Base para fine-tuning de tareas de manipulacion: partiendo de lerobot/pi05_base, un equipo puede reentrenar con su propio dataset usando `lerobot-train` y el mismo pipeline documentado, reduciendo el coste frente a entrenar un VLA desde cero.
- Validacion de pipelines de imitacion en robotica: sirve como referencia reproducible para verificar que la instalacion de LeRobot, la calibracion del robot y la configuracion de camaras funcionan correctamente antes de abordar tareas mas complejas.
- Investigacion en generalizacion visomotora: al derivar de π₀.₅, permite estudiar como un VLA generalista se especializa con un dataset pequeno y como se degrada o mantiene la generalizacion fuera de distribucion.
- Demostraciones y prototipos en entornos controlados: para presentar capacidades de manipulacion robotica en ferias, docencia o pruebas de concepto, con la ventaja de que el modelo es open source y desplegable localmente.
- Benchmark interno de VLA: como punto de comparacion frente a otros fine-tunings de pi05 o politicas de imitacion, midiendo tasas de exito en la misma tarea de cubo a cruz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica y deja la tabla de evaluacion vacia. No se dispone de tasas de exito, MMLU, HumanEval, GSM8K ni metricas de robotica comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 mil millones de parametros, en precision FP16 se requieren aproximadamente 8,3 GB solo para pesos, mas overhead de activaciones y buffers de imagen; en FP32 serian unos 16,6 GB. Estas cifras son estimaciones por tamano, no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una GPU con 16 GB o mas de VRAM deberia ser suficiente para inferencia en FP16, pero no hay confirmacion oficial.
- Cabe en GPU de consumo: probablemente si en modelos con 16 GB o mas (por ejemplo, RTX 4080/4090), aunque no esta confirmado por el autor.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=felsager/pi05_cube2cross_dr_bs64`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de accion.
- Latencia y throughput: no disponibles. Dependen del hardware, de la frecuencia de control del robot y de la resolucion de las camaras (480x640 y 224x224).
- Tamano del repositorio: 24,9 GB, lo que implica espacio en disco considerable para descarga y almacenamiento de checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_dr_bs64 | 4,14 mil millones | no disponible | Pick-and-place cubo a cruz (UR5e) | gemma | Hugging Face |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA generalista base | gemma | Hugging Face |
| π₀.₅ (Pi05) original de Physical Intelligence | no disponible en la informacion | no disponible | VLA generalista de entornos abiertos | no disponible en la informacion | Blog y OpenPI |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de otros VLA comparables en la informacion proporcionada. El modelo aqui descrito es una especializacion del base, por lo que su rendimiento en la tarea concreta deberia ser superior al del base, pero no hay metricas publicadas que lo confirmen.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo ha sido entrenado para cuatro tareas de pick-and-place sobre una cruz roja; no se espera que funcione en otras tareas, objetos o disposiciones sin reentrenamiento.
- Sin resultados de evaluacion: no hay tasas de exito publicadas, por lo que se desconoce su fiabilidad real en produccion.
- Dependencia del hardware: requiere un robot UR5e con mano y la configuracion exacta de camaras (top, wrist, empty_camera_0) con las resoluciones especificadas; cambios en la camara o su calibracion pueden degradar el rendimiento.
- Riesgo de sobreajuste al dataset: con 999 episodios y 120.000 pasos de entrenamiento, es plausible un sobreajuste al entorno de recogida de datos (iluminacion, posiciones, fondo), aunque no se documenta.
- Licencia gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone restricciones y obligaciones de atribucion; conviene revisarla antes de desplegar en produccion.
- Idiomas: no aplicable como modelo de lenguaje, pero las instrucciones de tarea estan en ingles y el modelo no procesa lenguaje natural de forma general.
- Alucinacion: en el contexto de un modelo de accion, el riesgo se traduce en acciones incorrectas o inseguras; se recomienda supervision humana y limites de seguridad en el robot.
- Sin cuantizaciones documentadas: no se ofrecen variantes GGUF ni cuantizadas, lo que limita el despliegue en hardware de baja VRAM.
- Fecha de creacion futura en los metadatos (2026-11-01): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_dr_bs64
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI: no disponible como enlace directo en la informacion, referenciado en la model card
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
