# SamerAyyad/VLA_Samer_08.11.2026_400eps_policy_Pi05

## Resumen

Este repositorio contiene una política Vision-Language-Action (VLA) denominada `pi05`, un ajuste fino de `lerobot/pi05_base` realizada por el usuario SamerAyyad. π₀.₅ es un modelo de Physical Intelligence disenado para generalizacion en entornos abiertos que evoluciona π₀ para operar en situaciones y entornos no vistos durante el entrenamiento. La implementacion en LeRobot esta adaptada del repositorio OpenPI de Physical Intelligence. El modelo resuelve el problema de control robotico de extremo a extremo: dado un estado de articulaciones y una imagen de camara, produce directamente una accion de 7 dimensiones.

El ajuste fino se ha realizado sobre un dataset propio de 400 episodios (259.635 frames a 30 FPS) para una tarea concreta de manipulacion con un robot UR5 equipado con ventosa de succion: recoger una CPU y colocarla en una caja. El modelo tiene 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors con un tamano de repositorio de 9,4 GB, lo que sugiere pesos en precision completa sin cuantizar.

Es relevante ahora porque demuestra el flujo completo de LeRobot para ajustar un VLA de proposito general a una tarea industrial concreta con hardware accesible (un UR5 y una camara), y porque la licencia Apache 2.0 permite uso comercial sin restricciones adicionales. No obstante, se trata de un ajuste fino de un unico usuario sin resultados de evaluacion publicados, por lo que su robustez real en produccion no esta validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de tarea son en ingles en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.2 |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | UR5 con ventosa de succion |
| Entradas | `observation.images.camera` (3, 480, 640); `observation.state` (7,) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 9,4 GB |
| Dataset de entrenamiento | SamerAyyad/VLA_Samer_08.11.2026_400eps (400 episodios, 259.635 frames, 30 FPS) |

## Arquitectura y entrenamiento

La arquitectura es un modelo Vision-Language-Action π₀.₅, que combina un backbone vision-lenguaje con un cabezal de accion que mapea observaciones (imagen de camara y estado de articulaciones) a comandos motores de 7 dimensiones. La implementacion concreta en este repositorio procede de LeRobot, que a su vez adapta el codigo de OpenPI de Physical Intelligence. No se dispone de detalles adicionales sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni composicion exacta del dataset de preentrenamiento del modelo base en la informacion proporcionada.

El ajuste fino se realizo durante 20.000 pasos con batch size 32, optimizador AdamW, learning rate 2,5e-5 y semilla 1000, sobre 400 episodios de la tarea "Pick up the CPU with the suction gripper and place it in the box". No se indica si hubo RLHF, DPO ni ninguna otra fase de alineacion; se trata de aprendizaje por imitacion supervisado sobre demostraciones. Tampoco se especifica el numero de tokens ni la composicion del dataset de preentrenamiento del modelo base.

## Capacidades

- Control robotico de extremo a extremo: genera acciones de 7 dimensiones a partir de una imagen RGB de 480x640 y un vector de estado de 7 dimensiones.
- Manipulacion fisica con ventosa de succion sobre robot UR5: la tarea entrenada es recoger una CPU y depositarla en una caja.
- Generalizacion a entornos nuevos segun la descripcion de π₀.₅ (capacidad declarada del modelo base, no validada en este ajuste fino concreto).
- Aprendizaje por imitacion: el modelo se ha ajustado sobre demostraciones teleoperadas, sin refuerzo explicito.
- Soporte de instrucciones de tarea en lenguaje natural (`--task="Pick up the CPU with the suction gripper and place it in the box"`).
- Integracion con el ecosistema LeRobot: rollout, entrenamiento y visualizacion de datasets mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No se dispone de informacion sobre tool calling, capacidades de agente multi-paso, vision general, audio ni modo de razonamiento explicito; el modelo esta especializado en robotica.

## Casos de uso

- Automatizacion de pick-and-place industrial: el modelo ejecuta la tarea de recoger una CPU con ventosa y colocarla en una caja, adecuado para lineas de montaje o clasificacion de componentes electronicos donde la posicion de las piezas varia.
- Prototipado rapido de politicas roboticas: un equipo con un UR5 y una camara puede desplegar esta politica con `lerobot-rollout` en minutos, sin entrenar desde cero, gracias a que parte de `pi05_base`.
- Base para ajuste fino en tareas similares: sirve como punto de partida para entrenar variantes sobre nuevos objetos o posiciones, ya que la receta de entrenamiento (20.000 pasos, batch 32, lr 2,5e-5) esta documentada y es reproducible.
- Investigacion en aprendizaje por imitacion: util para estudiar la transferencia de VLA preentrenados a tareas concretas con datasets pequenos (400 episodios), comparando curvas de exito frente a entrenamiento desde cero.
- Demostraciones y validacion de concepto en laboratorio: permite evaluar el rendimiento de π₀.₅ en hardware UR5 antes de invertir en datasets mayores o en modelos propietarios.
- Manipulacion de componentes electronicos fragiles: la ventosa de succion y la politica entrenada estan pensadas para objetos como CPUs, lo que encaja en operaciones de ensamblaje o testeado donde no se puede usar una pinza rigida.
- Generacion de datos sinteticos de evaluacion: el modelo puede ejecutarse en simulacion o en bucle abierto para generar trayectorias de referencia que alimenten pipelines de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No existen tasas de exito, metricas de error de posicion ni comparaciones con otras politicas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parametros y pesos en safetensors de 9,4 GB, se necesita al menos ~10 GB de VRAM en precision completa (fp32/bf16). Con cuantizacion a 8 bits cabria en ~5-6 GB y a 4 bits en ~3 GB, aunque no se documentan pesos cuantizados para este repositorio.
- GPU recomendadas: para inferencia en tiempo real a 30 FPS (frecuencia del dataset), se recomienda una GPU con al menos 16 GB de VRAM, como RTX 4090, A100 o H100. Una RTX 3090 (24 GB) tambien seria suficiente en precision completa.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 y GPUs con 16 GB o mas. En GPUs de 8 GB requeriria cuantizacion, no documentada oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion en robot, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles. El dataset se grabo a 30 FPS, lo que sugiere que el bucle de control objetivo opera a esa frecuencia, pero no se publican mediciones de latencia real del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_08.11.2026_400eps_policy_Pi05 | 4,14 mil millones | no disponible | VLA (π₀.₅ ajustado) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA (π₀.₅ base) | Apache 2.0 | Hugging Face |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA | no disponible | OpenPI (codigo abierto) |

La comparacion se limita a los modelos de la misma familia porque no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas como RT-2, OpenVLA u Octo en la informacion proporcionada. No se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay tasas de exito ni validacion en robot real, por lo que se desconoce su robustez fuera del dataset de entrenamiento.
- Tarea unica y estrecha: entrenado exclusivamente para "recoger una CPU con ventosa y colocarla en una caja" sobre un UR5 con una unica camara; no se espera que generalice a otros objetos, robots o configuraciones de camara sin reentrenamiento.
- Dataset pequeno y de un solo usuario: 400 episodios y 259.635 frames son un volumen modesto; el riesgo de sobreajuste a posiciones, iluminacion y objetos concretos del dataset es alto.
- Dependencia de hardware especifico: requiere un UR5 con ventosa de succion y una camara con la configuracion exacta (resolucion 480x640, 30 FPS, nombre de camara `camera`); cualquier cambio en la camara o en la cinematica invalida la politica.
- Riesgo de alucinacion motora: como todo modelo generativo de acciones, puede producir trayectorias fisicamente invalidas o colisiones; se recomienda supervision humana y limites de seguridad en el robot.
- Idiomas: no se documenta soporte multilingue; las instrucciones de tarea de los ejemplos estan en ingles.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el codigo OpenPI deben verificarse por separado para confirmar compatibilidad.
- Sin cuantizaciones oficiales: no se ofrecen pesos GGUF ni versiones cuantizadas, lo que limita el despliegue en hardware de baja VRAM.
- Fecha de creacion futura en los metadatos (2026-11-17): conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_08.11.2026_400eps_policy_Pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_08.11.2026_400eps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_08.11.2026_400eps
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
