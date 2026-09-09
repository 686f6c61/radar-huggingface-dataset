# marko863/act_bin_picking

## Resumen

El modelo `marko863/act_bin_picking` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por marko863 (Marko Ivkovic) y entrenado con la librería LeRobot de Hugging Face. Su objetivo es resolver la tarea de recoger cuatro cubos de una caja y colocarlos en un destino, utilizando un robot `seeed_b601_dm_follower` equipado con dos cámaras: una lateral y otra en la muñeca.

El modelo contiene 51.670.663 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Como política ACT, genera chunks de acciones de 7 dimensiones a partir de observaciones del estado del robot y de imágenes de dos cámaras RGB de 480x640 píxeles. Su relevancia radica en que demuestra cómo el aprendizaje por imitación puede entrenar políticas de manipulación robustas con datos teleoperados, y en que se puede reutilizar o adaptar fácilmente gracias al ecosistema LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.670.663 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | seeed_b601_dm_follower |
| Cámaras | side, wrist |
| Entrada de observación | Estado del robot (7,) + imágenes (3, 480, 640) x2 |
| Salida de acciones | Vector de acción del robot (7,) |
| Dataset de entrenamiento | marko863/bin_picking_test (69 episodios, 125.675 frames a 30 FPS) |
| Framework | LeRobot 0.6.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de transformer condicional que, en lugar de predecir una única acción por paso de control, predice un bloque de acciones que el robot ejecuta secuencialmente. Esto reduce el error acumulativo y aporta estabilidad al control. En este modelo, el transformer recibe como entrada el estado del robot (7 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara lateral y cámara de muñeca). La salida es un vector de acción de 7 dimensiones, compatible con los 7 grados de libertad del robot.

Los datos de entrenamiento proceden del dataset `marko863/bin_picking_test` (69 episodios, 125.675 frames a 30 FPS, tarea "Pick 4 cubes from bin and place on target"). El entrenamiento se llevó a cabo con LeRobot 0.6.1 durante 50.000 pasos, con batch size de 8, optimizador AdamW y learning rate 1e-05. No se aplicaron técnicas de RLHF ni DPO; se trata de aprendizaje por imitación puro, sin bucles de refuerzo.

## Capacidades

- Predicción de chunks de acciones: genera secuencias de acciones que se ejecutan de forma continua, en lugar de decisiones por paso, lo que mejora la suavidad y estabilidad del movimiento.
- Percepción visual y de estado: procesa simultáneamente dos cámaras RGB (lateral y muñeca) y el estado articular del robot, lo que le permite reaccionar a la posición actual de la pinza.
- Control de robots de 7 grados de libertad: la salida es un vector de acción de dimensión 7, pensado para el robot `seeed_b601_dm_follower`.
- Aprendizaje por imitación: la política se entrena únicamente con demostraciones teleoperadas, sin necesidad de modelos físicos ni programación manual de trayectorias.
- Despliegue sencillo con LeRobot: el modelo puede cargarse con `lerobot-rollout` para ejecutar la política directamente sobre un robot compatible.
- No soporta generación de texto, tool calling ni razonamiento simbólico: es un modelo de control robótico y no ofrece capacidades de lenguaje.

## Casos de uso

- Recogida de objetos en almacenes: el modelo puede automatizar la selección de cubos desde una caja y su colocación en una posición objetivo, porque la tarea de entrenamiento es exactamente esa manipulación.
- Celdas de ensamblaje industrial: una política ACT como esta puede integrarse en una celda robotizada para colocar piezas en posiciones concretas, siempre que la configuración de cámaras y el robot coincidan con la del entrenamiento.
- Investigación en aprendizaje por imitación: los investigadores pueden partir de este modelo para realizar fine-tuning con nuevos datos teleoperados, gracias al soporte de LeRobot y al formato safetensors.
- Evaluación en simulación: la política puede probarse en simuladores de robots (por ejemplo, MuJoCo o Isaac) manteniendo las mismas entradas de observación, antes de desplegarla en el hardware real.
- Demostraciones de robótica educativa: el modelo es útil en laboratorios docentes para mostrar cómo se entrena una política de manipulación con LeRobot, dado su tamaño reducido y su sencilla puesta en marcha.
- Optimización de tareas de bin picking: puede utilizarse como baseline para comparar otros métodos de manipulación, o como componente de bajo nivel dentro de un sistema que combine percepción de alto nivel con control.
- Supervisión de procesos repetitivos: el modelo puede ejecutar la tarea aprendida mientras un operador supervisa, reduciendo la carga de trabajo en tareas monótonas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se ha proporcionado ningún resultado de evaluación para esta política, por lo que no existen datos de tasa de éxito, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se incluyen medidas de consumo de memoria en la documentación.
- GPU recomendadas: no disponible. El entrenamiento se realizó en CUDA (`--policy.device=cuda`), pero no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible. No se han publicado datos al respecto.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout`. No aplican vLLM, llama.cpp, Ollama ni TGI, al tratarse de una política de control robótico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

- `marko863/act_bin_picking`: 51.670.663 parámetros, licencia Apache 2.0, tarea de bin picking específica. Sin benchmarks publicados.
- `marko863/act_cube_in_box`: del mismo autor, 51,7 millones de parámetros, también de robótica y entrenado con LeRobot. No se dispone de datos de rendimiento publicados.
- Modelos ACT de la comunidad LeRobot: comparten la misma arquitectura y framework, pero la información proporcionada no incluye una comparativa numérica.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: la model card no aporta ninguna medida de éxito en tareas reales.
- Especialización en una única tarea: la política fue entrenada para "Pick 4 cubes from bin and place on target". Fuera de esa tarea, su rendimiento no está garantizado.
- Dependencia del hardware: fue entrenada para el robot `seeed_b601_dm_follower` y las cámaras `side` y `wrist`. Cualquier cambio en la configuración requiere reentrenamiento.
- Dataset limitado: 69 episodios teleoperados pueden no generalizar bien ante variaciones de iluminación, nuevas posiciones o distractores.
- Sin evaluación en condiciones de producción: no se conoce su comportamiento ante oclusiones, cambios de apariencia de los objetos o entornos no vistos.
- Riesgo de acciones incorrectas fuera de la distribución: al ser una política de control, puede emitir movimientos no deseados cuando se enfrenta a observaciones fuera del rango de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe mantener el aviso de licencia y citar el método y LeRobot si se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marko863/act_bin_picking
- Dataset de entrenamiento: https://huggingface.co/datasets/marko863/bin_picking_test
- Paper ACT (arXiv): https://arxiv.org/abs/2304.13705
- Entrada de Hugging Face Papers: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=marko863/bin_picking_test
