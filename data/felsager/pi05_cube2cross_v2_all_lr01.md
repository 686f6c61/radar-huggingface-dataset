# felsager/pi05_cube2cross_v2_all_lr01

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos en tareas de robotica. Esta ficha concreta, `felsager/pi05_cube2cross_v2_all_lr01`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la libreria LeRobot. El modelo resuelve una tarea especifica de manipulacion robotica: recoger un cubo de un color determinado y colocarlo sobre una cruz roja.

El modelo combina percepcion visual (dos camaras: `top` y `wrist`) con el estado del robot (vector de 10 dimensiones) para producir acciones de 10 dimensiones sobre un robot UR5e con mano equipada (`ur5e_hand_e`). Se ha entrenado sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 frames a 30 FPS, con cuatro variantes de tarea segun el color del cubo (azul, verde, amarillo y rojo).

Con 4.143.404.816 parametros y un repo de 42,6 GB, se trata de un fine-tuning de proposito muy concreto, no de un modelo de proposito general. Su relevancia radica en ser un ejemplo practico de como adaptar un VLA de base abierta a una tarea de picking-and-placing mediante imitation learning con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Entrada de estado | observation.state, shape (10,) |
| Entrada visual | observation.images.top y observation.images.wrist, shape (3, 480, 640) |
| Salida | action, shape (10,) |
| Libreria | lerobot |
| Version de LeRobot | 0.6.2 |
| Tamano del repo | 42,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un VLA que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion utilizada es la de LeRobot, adaptada del repositorio open source OpenPI. El modelo consume dos flujos de imagen (camara superior y camara de muneca) junto con el estado proprioceptivo del robot, y emite directamente un vector de accion de 10 dimensiones.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_v2` (1000 episodios, 493.474 frames a 30 FPS). La configuracion de entrenamiento fue: 30.000 pasos, batch size de 16, optimizador AdamW, learning rate de 5e-05 y semilla 0. Las tareas cubiertas son cuatro variantes de "pick up the [color] cube and place it on the red cross" para los colores azul, verde, amarillo y rojo. No se dispone de informacion sobre el uso de RLHF, DPO ni sobre innovaciones tecnicas adicionales mas alla de las propias de la arquitectura π₀.₅.

## Capacidades

- Manipulacion robotica visuomotora: genera acciones de 10 dimensiones para un robot UR5e con mano a partir de dos vistas de camara y el estado del robot.
- Ejecucion de tareas de picking-and-placing condicionadas por instruccion en lenguaje natural (cuatro variantes de color de cubo).
- Percepcion visual multi-camara (vista superior y vista de muneca) a resolucion 480x640.
- Control de politicas de imitation learning entrenadas de extremo a extremo.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingues, al tratarse de un modelo de robotica.
- No se documenta un modo "thinking" ni capacidades de audio.

## Casos de uso

- Automatizacion de picking-and-placing en laboratorio: el modelo ejecuta la tarea de recoger un cubo de color y depositarlo sobre una cruz roja, adecuado para experimentos de manipulacion controlada con un UR5e.
- Investigacion en imitation learning: sirve como referencia de fine-tuning de π₀.₅ sobre un dataset propio, permitiendo reproducir el pipeline con `lerobot-train`.
- Evaluacion comparativa de VLA: al estar entrenado sobre un dataset publico y con configuracion documentada, permite comparar variantes de hiperparametros (por ejemplo, distintos learning rates) sobre la misma tarea.
- Prototipado de politicas para robot UR5e con mano: el modelo esta especificamente adaptado al tipo de robot `ur5e_hand_e`, lo que facilita desplegarlo en ese hardware sin reentrenar.
- Docencia y formacion en robotica: el flujo `lerobot-rollout` con `--strategy.type=base` permite ejecutar la politica en un robot real durante una duracion determinada, util para demostraciones.
- Base para nuevos fine-tunings: al derivar de `lerobot/pi05_base`, puede servir como punto de partida para tareas de manipulacion mas complejas que compartan dominio visual similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4.143.404.816 parametros, una estimacion en precision completa (fp32) rondaria los 16,6 GB solo en pesos, y en bf16 unos 8,3 GB, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento), con `--policy.device=cuda`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de robot | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_lr01 | 4.143.404.816 | ur5e_hand_e | Cubo a cruz roja (4 colores) | gemma | Hugging Face |
| lerobot/pi05_base | no disponible | generico | VLA base para fine-tuning | no disponible en esta ficha | Hugging Face |
| π₀ (Pi0) | no disponible | generico | VLA predecesor de π₀.₅ | no disponible en esta ficha | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: entrenado unicamente para cuatro tareas de picking-and-placing de cubos de colores sobre una cruz roja; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluacion publicados: no hay tasas de exito documentadas, por lo que el rendimiento real en robot es desconocido.
- Dependencia del hardware exacto: requiere un robot `ur5e_hand_e` y dos camaras con los nombres y resoluciones de observacion especificados (`top` y `wrist`, 480x640, 30 FPS). Cambios en la configuracion de camaras o en el robot pueden degradar el rendimiento.
- Licencia `gemma`: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone restricciones y obligaciones especificas; debe revisarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la politica puede producir acciones incorrectas o inseguras ante condiciones visuales no vistas (iluminacion, posiciones de objetos, distractores).
- Sin informacion sobre sesgos: no se documentan sesgos conocidos, aunque el dataset de entrenamiento esta limitado a un entorno y conjunto de objetos concretos.
- Idiomas: no aplica; las instrucciones de tarea estan en ingles y limitadas a las cuatro frases del dataset.
- Sin datos de cuantizacion ni de contexto: no se puede evaluar el coste de despliegue en hardware limitado a partir de la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_lr01
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
