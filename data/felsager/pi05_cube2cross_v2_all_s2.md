# felsager/pi05_cube2cross_v2_all_s2

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para generalizar en entornos fisicos abiertos mas alla de las condiciones vistas durante el entrenamiento. Esta ficha concreta, `felsager/pi05_cube2cross_v2_all_s2`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la libreria LeRobot, especializado en una tarea de manipulacion robotica concreta: recoger cubos de colores y colocarlos sobre una cruz roja.

El modelo consume observaciones multimodales (estado de articulaciones de 10 dimensiones y dos flujos de camara a 480x640) y produce acciones de 10 dimensiones para un robot UR5e con pinza. Con 4.143 millones de parametros y un repositorio de 42,6 GB, se distribuye en formato safetensors y hereda la licencia Gemma del modelo base. Es relevante como ejemplo practico de como un VLA de proposito general puede especializarse en una tarea industrial o de laboratorio mediante imitation learning con 1000 episodios y unas 493.000 frames.

La ficha documenta exclusivamente lo que el autor publico: no hay resultados de evaluacion, benchmarks comparativos ni metricas de exito reportadas, por lo que las secciones correspondientes lo indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Tipo de robot | `ur5e_hand_e` |
| Camaras de entrada | `top`, `wrist` (480x640, 3 canales) |
| Entrada de estado | `observation.state` de forma `(10,)` |
| Salida de accion | `action` de forma `(10,)` |
| Tamano del repositorio | 42,6 GB |
| Libreria | lerobot |
| Modelo base | `lerobot/pi05_base` |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

El modelo es un VLA derivado de π₀.₅ de Physical Intelligence, una evolucion de π₀ orientada a la generalizacion en entornos no vistos. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La arquitectura combina un codificador visual (dos camaras), una representacion del estado del robot y un cabezal de accion que emite vectores de 10 dimensiones, siguiendo el paradigma de los modelos Vision-Language-Action que mapean directamente percepcion y lenguaje a acciones motoras.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 frames a 30 FPS, con cuatro tareas de recogida y colocacion de cubos (azul, verde, amarillo, rojo) sobre una cruz roja. La configuracion de entrenamiento fue de 30.000 pasos con batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 2. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; se trata de imitation learning supervisado clasico sobre demostraciones.

## Capacidades

- Manipulacion robotica de picking and placing: recoger cubos de cuatro colores y depositarlos sobre una cruz roja.
- Percepcion visual multimodal mediante dos camaras (vista superior y vista de muneca).
- Control de un robot UR5e con pinza (`ur5e_hand_e`) a partir de estado articular de 10 dimensiones.
- Condicionamiento por instruccion en lenguaje natural (las cuatro tareas descritas son prompts textuales).
- Generalizacion limitada al dominio de la tarea entrenada: cubos de colores sobre una superficie con una cruz roja.
- No se documentan capacidades de tool calling, agentes multi-paso, thinking mode, audio, vision general ni multilingue.

## Casos de uso

- Automatizacion de picking and placing en laboratorio: el modelo ejecuta la tarea de recoger un cubo de color y colocarlo sobre una diana marcada, apropiado para bancos de pruebas de manipulacion con UR5e.
- Investigacion en imitation learning: sirve como referencia de un fine-tuning VLA completo sobre 1000 episodios, util para estudiar el efecto del numero de demostraciones y la configuracion de entrenamiento en tareas acotadas.
- Prototipado de pipelines de robotica con LeRobot: permite validar el flujo completo `lerobot-rollout` y `lerobot-train` con un policy ya entrenado antes de invertir en datos propios.
- Benchmark interno de reproducibilidad: al estar publicados semilla, pasos y hiperparametros, se puede replicar el entrenamiento y comparar resultados entre ejecuciones.
- Demostraciones de VLA en ferias o docencia: la tarea es visualmente clara y facil de explicar, lo que la hace idonea para mostrar como un modelo Vision-Language-Action traduce instrucciones a movimiento.
- Base para transfer learning en tareas de clasificacion y colocacion: el policy puede servir de punto de partida para fine-tunings sobre variantes de la misma celula de trabajo (otros objetos, otras posiciones de la diana).
- Validacion de hardware UR5e: util para equipos que ya disponen de este brazo y quieren probar control por aprendizaje sin desarrollar un stack propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia y declara explicitamente que no se han proporcionado resultados de evaluacion para esta policy.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 42,6 GB en safetensors, aunque no se especifica si incluye optimizador u otros artefactos de entrenamiento; conviene verificar el tamano real de los pesos antes de dimensionar GPU.
- GPU recomendadas: no disponible. Dado el tamano de parametros (4.143 millones) es plausible que quepa en GPUs consumer de gama alta, pero el autor no publica requisitos.
- Cabe en consumer GPU: no confirmado por el autor; requiere verificacion empirica.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (comando documentado en la model card). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un policy de robotica.
- Latencia y throughput estimados: no disponibles. La frecuencia de captura del dataset es 30 FPS, pero no se reporta la tasa de inferencia del policy en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `felsager/pi05_cube2cross_v2_all_s2` | 4.143 M | no disponible | Picking and placing de cubos sobre cruz roja (UR5e) | gemma | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible en esta ficha | no disponible | VLA base de proposito general para fine-tuning | gemma (segun modelo derivado) | Hugging Face, modelo base publico |
| π₀.₅ original (Physical Intelligence) | no disponible en esta ficha | no disponible | VLA de generalizacion open-world | no disponible | Blog y repositorio OpenPI |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparativa se limita a proposito, linaje y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al estar entrenado solo con cubos de cuatro colores sobre una cruz roja, el modelo probablemente no generaliza a otros objetos, colores o configuraciones de escena.
- Riesgo de alucinacion: en el contexto de un VLA, se traduce en la posibilidad de ejecutar acciones incorrectas o inseguras cuando la escena difiere de la distribucion de entrenamiento; no hay evaluacion cuantitativa de tasa de exito.
- Limitaciones de contexto o idioma: no disponible. El condicionamiento linguistico se limita a las cuatro instrucciones de entrenamiento.
- Restricciones de licencia: hereda la licencia Gemma, que impone condiciones de uso (entre ellas, la politica de uso aceptable de Google). Es necesario revisar los terminos de la licencia Gemma antes de cualquier uso comercial.
- Ausencia de evaluacion: la model card no reporta resultados de exito, por lo que no se puede afirmar su fiabilidad en produccion.
- Especificidad de hardware: el policy esta entrenado para un UR5e con pinza y dos camaras concretas; su uso en otro robot o configuracion de camaras requerira reentrenamiento.
- Fecha del repositorio: creado el 2026-11-15, lo que conviene verificar frente a la version actual de LeRobot y del modelo base antes de reutilizarlo.
- Cero descargas y cero likes: sin validacion por parte de la comunidad; no hay evidencia externa de funcionamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/felsager/pi05_cube2cross_v2_all_s2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
