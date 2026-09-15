# Chaenn/smolvla_policy_so101_multitask_test_pnp0908_stack0908

## Resumen

smolvla_policy_so101_multitask_test_pnp0908_stack0908 es una politica de robotica entrenada con LeRobot por el usuario Chaenn, consistente en un ajuste fino del modelo base lerobot/smolvla_base. Se trata de un modelo de vision-lenguaje-accion (VLA) compacto, con 450.046.176 parametros, orientado a controlar un brazo robotico SO-101 (tipo `so_follower`) a partir de observaciones visuales y del estado de las articulaciones. Su salida no es texto, sino un vector de accion de dimension 6 que se ejecuta directamente sobre el robot.

El modelo resuelve dos tareas concretas de manipulacion: colocar cada uno de cinco cubos dentro de un limite negro y apilar los cinco cubos formando una torre dentro de ese mismo limite. Para ello se entreno sobre el dataset Chaenn/so101_multitask_test_pnp0908_stack0908_raw, con 1265 episodios y 2.248.810 fotogramas a 30 FPS, durante 60.000 pasos con AdamW y una tasa de aprendizaje de 0,0001.

Es relevante ahora porque representa el patron actual de la robotica abierta: politicas VLA pequenas, publicadas en HuggingFace Hub y ejecutables mediante herramientas estandar como LeRobot, que pueden desplegarse en hardware de consumo. Al ser un ajuste fino de SmolVLA (paper arXiv:2506.01844), hereda el enfoque de eficiencia computacional de esa familia, aunque el autor no ha publicado resultados de evaluacion ni detalles ampliados de arquitectura en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta, ajustada desde SmolVLA (arXiv:2506.01844); detalle de capas no disponible |
| Parametros totales | 450.046.176 (450,05 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de accion; no se especifica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos en safetensors (tamano de repo 0,9 GB) |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset estan redactadas en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` (brazo SO-101) |
| Entradas | `observation.state` (6,); `observation.images.camera1/2/3` (3,256,256); `observation.images.empty_camera_0` (3,480,640) |
| Salidas | `action` (6,) |
| Camaras declaradas | wrist, side |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card identifica el modelo como un ajuste fino de SmolVLA, presentado en el paper arXiv:2506.01844 como un modelo VLA compacto y eficiente capaz de rendir de forma competitiva con coste computacional reducido y de desplegarse en hardware de consumo. El autor no detalla en la ficha la composicion interna (codificador visual, tronco de lenguaje, cabezal de acciones), el numero de capas ni el mecanismo de generacion de acciones, por lo que esos apartados quedan como no disponibles. Lo que si se especifica es la interfaz de entrada y salida: consume el estado de 6 articulaciones y hasta cuatro flujos de imagen, y produce un vector de accion de 6 dimensiones.

El entrenamiento se realizo con LeRobot 0.6.2 durante 60.000 pasos, con tamano de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El dataset de partida contiene 1265 episodios y 2.248.810 fotogramas grabados a 30 FPS, correspondientes a dos tareas: colocar cinco cubos dentro del limite negro y apilar los cinco cubos en una torre dentro del mismo limite. No se documenta el uso de RLHF, DPO ni ninguna fase de alineamiento adicional, ni innovaciones tecnicas concretas mas alla de las propias de SmolVLA.

Un detalle relevante para reproducibilidad es que la model card declara dos camaras (`wrist` y `side`), mientras que la tabla de entradas lista tres camaras `camera1`, `camera2`, `camera3` mas `empty_camera_0`. Cualquier despliegue debe respetar exactamente las claves de observacion con las que se entreno la politica.

## Capacidades

- Generacion de acciones de manipulacion: produce un vector `action` de 6 dimensiones para el brazo SO-101 a partir de observacion visual y de estado.
- Percepcion visual multi-camara: procesa hasta tres imagenes de 256x256 y una cuarta de 480x640 como entrada.
- Ejecucion condicionada por instruccion de tarea: admite un campo `--task` con la descripcion textual de la tarea, segun el flujo de `lerobot-rollout`.
- Multitarea limitada a dos tareas entrenadas: "Pick and place each of the five cubes inside the black boundary." y "Stack the five cubes into one tower inside the black boundary."
- Aprendizaje por imitacion: politica entrenada a partir de demostraciones (1265 episodios), no por refuerzo.
- Ajuste fino adicional: puede usarse como punto de partida y reentrenarse con `lerobot-train` sobre un dataset propio.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de texto; la planificacion se limita a la secuencia de acciones motora.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): vision como entrada; audio y modo de razonamiento no disponibles.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: la politica coloca cinco cubos dentro de un area delimitada, lo que la hace adecuada como referencia reproducible en experimentos de robotica de manipulacion con el brazo SO-101.
- Tarea de apilado (stacking): apila cinco cubos en una torre, un escenario clasico para medir precision de posicionamiento y control fino en brazos de bajo coste.
- Punto de partida para ajuste fino: al ser un ajuste de `lerobot/smolvla_base` con licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre datasets propios de otras tareas de manipulacion.
- Banco de pruebas de pipelines VLA: sirve para validar el flujo completo de LeRobot (grabacion de datos, entrenamiento, rollout) antes de escalar a tareas mas complejas.
- Robotica educativa y de aficionado: con 450 M de parametros, la inferencia es viable en GPU de consumo, lo que permite desplegarla en montajes de bajo presupuesto con camaras OpenCV estandar.
- Evaluacion comparativa de politicas de imitacion: util como linea base multitarea (dos tareas en un mismo modelo) frente a politicas entrenadas por tarea.
- Automatizacion de demostraciones en ferias o demos: con `--duration` configurable y estrategia `base`, permite ejecutar la politica durante periodos acotados sin grabar episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye de forma explicita la linea "No evaluation results have been provided for this policy yet.", por lo que no existen tasas de exito por tarea, numero de ensayos ni condiciones de evaluacion documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB solo para pesos en bf16/fp16 (450 M de parametros); en fp32 serian unos 1,8 GB. A ello hay que sumar activaciones y los tensores de imagen de entrada, por lo que un presupuesto practico de 4-8 GB de VRAM es razonable para inferencia.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM para inferencia comoda; para reentrenamiento (60.000 pasos, lote 32) se recomienda una GPU de gama alta tipo RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060/4060 con 8-12 GB de VRAM para inferencia; el reentrenamiento completo es mas exigente.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` y `lerobot-train`; el modelo se distribuye en safetensors con `library_name: lerobot`. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible. La unica referencia temporal es la frecuencia del dataset, 30 FPS, que sugiere el ritmo de control esperado durante la recogida de datos, no necesariamente el de la politica desplegada.
- Camaras: se requieren camaras OpenCV configuradas a 640x480 y 30 FPS segun el ejemplo de rollout, con nombres que coincidan con las claves de observacion del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Chaenn/smolvla_policy_so101_multitask_test_pnp0908_stack0908 | 450,05 M | no disponible | apache-2.0 | HuggingFace Hub, 0 descargas, 0 likes | sin resultados de evaluacion publicados |
| lerobot/smolvla_base (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace Hub | no disponible |
| Otros modelos VLA de la misma categoria (p. ej. OpenVLA, pi0) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparativa detallada con alternativas de la misma categoria no esta disponible en la informacion proporcionada; la unica referencia directa es el modelo base `lerobot/smolvla_base` del que deriva este ajuste.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no reporta ensayos ni tasas de exito, por lo que se desconoce la fiabilidad real de la politica en las dos tareas.
- Sin descargas ni validacion de la comunidad: el repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido contrastado por terceros.
- Ambito de tarea muy restringido: solo cubre pick-and-place y stacking de cinco cubos dentro de un limite negro; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Sensibilidad al montaje: el rendimiento depende de la posicion y el tipo de camaras, la iluminacion y la calibracion del brazo SO-101; cambios en el montaje pueden degradar la politica.
- Posible inconsistencia en las entradas: la ficha declara dos camaras (`wrist`, `side`) pero lista tres camaras mas `empty_camera_0`; es necesario verificar las claves correctas antes de desplegar.
- Idiomas: no disponible; las instrucciones de tarea documentadas estan en ingles y no se especifica soporte para otros idiomas.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones erroneas o inseguras cuando la escena difiere de la distribucion de entrenamiento.
- Sesgos: no disponible. Al estar entrenado con datos propios de un unico montaje, hereda los sesgos de posicion, iluminacion y color de ese dataset.
- Licencia: apache-2.0, que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se cite correctamente; conviene revisar tambien las condiciones del dataset asociado.
- Idoneidad para produccion: al no existir evaluacion publicada, no se recomienda su uso en entornos productivos sin una validacion previa exhaustiva en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chaenn/smolvla_policy_so101_multitask_test_pnp0908_stack0908
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_multitask_test_pnp0908_stack0908_raw
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_multitask_test_pnp0908_stack0908_raw
