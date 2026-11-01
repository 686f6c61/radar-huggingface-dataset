# Riccardo11/smolvla_empty_insertion_box_office

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Este repositorio concreto, `Riccardo11/smolvla_empty_insertion_box_office`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 81 episodios y 14.444 fotogramas a 30 FPS, orientado a la tarea "grasp the blue cylinder" con un robot bimanual `bi_so_follower` y tres cámaras (frontal y dos muñecas). El modelo consume el estado articular de 12 dimensiones y tres imágenes RGB de 480x640, y produce un vector de acción de 12 dimensiones.

La relevancia de SmolVLA radica en que demuestra que un VLA de tan solo 450 millones de parámetros puede ejecutarse en hardware de consumo, algo poco habitual en el espacio de los modelos visión-lenguaje-acción, donde predominan arquitecturas de varios miles de millones de parámetros. El paper asociado (arXiv:2506.01844) describe el método, y este checkpoint en particular representa un caso de uso típico: un investigador o desarrollador que ajusta el modelo base a una tarea concreta de manipulación con muy pocos datos.

Es importante subrayar que este repositorio no es un modelo de propósito general ni un modelo de lenguaje: es una política de control entrenada para una tarea y un robot específicos. No debe esperarse de él razonamiento abierto, generación de texto ni generalización a otras tareas sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con cabezal de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (el modelo recibe instrucción textual de tarea, pero no es multilingüe en sentido estricto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 13,2 GB, incluye checkpoints de entrenamiento) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que combina un codificador visual y un codificador de lenguaje con un decodificador de acciones, siguiendo el paradigma de las políticas de imitación modernas. El modelo base `lerobot/smolvla_base` se preentrena sobre datos heterogéneos de robótica y después se ajusta a tareas concretas mediante aprendizaje por imitación supervisado. En este caso, el fine-tuning se realizó durante 50.000 pasos con batch de 32, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. No se documenta en la información disponible el uso de RLHF, DPO ni de decodificación especulativa.

El dataset de entrenamiento contiene 81 episodios y 14.444 fotogramas a 30 FPS, una cantidad modesta que refleja el objetivo de SmolVLA: obtener políticas funcionales con presupuestos de datos y cómputo reducidos. La entrada combina una instrucción textual de tarea ("grasp the blue cylinder"), el estado de 12 articulaciones y tres flujos de imagen de 480x640 (frontal, muñeca izquierda y muñeca derecha); la salida es un vector de 12 acciones. No se detalla en la información proporcionada la composición exacta del corpus de preentrenamiento del modelo base ni innovaciones técnicas adicionales más allá de la propia eficiencia del diseño.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 12 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas (frontal y dos muñecas) a 480x640.
- Condicionamiento por instrucción textual: la tarea se especifica mediante un prompt de lenguaje natural ("grasp the blue cylinder").
- Manipulación bimanual: el robot `bi_so_follower` dispone de dos brazos, y el vector de acción de 12 dimensiones cubre ambos.
- Ejecución en hardware de consumo: el tamaño de 450 M de parámetros permite despliegue en GPUs de gama media.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para inferencia y reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual; no es un modelo de lenguaje conversacional.

## Casos de uso

- Recogida automatizada de objetos en células de fabricación: la política puede ejecutar la tarea de agarre del cilindro azul en un entorno de oficina simulado o real, sirviendo como base para tareas de pick-and-place repetitivas con el robot `bi_so_follower`.
- Investigación en aprendizaje por imitación: el checkpoint permite reproducir el pipeline completo de LeRobot (grabación, entrenamiento, rollout) y comparar hiperparámetros con el modelo base, gracias a que el dataset y la configuración están publicados.
- Prototipado rápido de políticas VLA en laboratorio: con 450 M de parámetros, un equipo puede ajustar el modelo a una nueva tarea en horas y validarlo en un robot real sin necesidad de clústeres de GPUs.
- Benchmarking de eficiencia en robótica: sirve como referencia de lo que se obtiene con 50.000 pasos y 81 episodios, útil para estudiar la relación entre cantidad de datos y éxito en tareas de manipulación.
- Educación y docencia en robótica: el repositorio incluye instrucciones de despliegue y visualización del dataset, lo que facilita usarlo en cursos prácticos de VLA e imitación.
- Base para fine-tuning en tareas de inserción: el nombre del repositorio sugiere un escenario de inserción en caja; el modelo puede reutilizarse como inicialización para tareas de ensamblaje con geometrías similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito medida en robot real ni en simulación para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en precisión completa (fp32) el peso ronda 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar activaciones de tres imágenes de 480x640 y el estado del robot.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia en fp16; se recomiendan RTX 3090, RTX 4090, A100 o H100 para entrenamiento y para inferencia con mayor margen.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; no se dispone de cifras oficiales de consumo exacto.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas de acción.
- Latencia y throughput: no disponibles; dependen del robot, del bucle de control a 30 FPS y del hardware de inferencia. El dataset está grabado a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Riccardo11/smolvla_empty_insertion_box_office` | 450 M | 3 imágenes 480x640 + estado 12D | Agarre de cilindro azul (bi_so_follower) | Apache 2.0 | Hugging Face, 18 descargas |
| `lerobot/smolvla_base` | 450 M (misma familia) | Multimodal VLA | Modelo base preentrenado para fine-tuning | Apache 2.0 | Hugging Face |
| Políticas de imitación tipo ACT / Diffusion Policy | no disponible | Variables según configuración | Manipulación por imitación | habitualmente MIT/Apache | Ecosistema LeRobot |
| VLA de gran escala (p. ej. familias de varios miles de millones) | varios miles de millones | multimodal | Control generalista | variable | requiere hardware de datacenter |

La comparación cuantitativa de rendimiento con alternativas no está disponible, ya que este checkpoint no publica tasas de éxito ni métricas de evaluación. La principal ventaja frente a VLA de mayor tamaño es el coste computacional; la principal desventaja es la especialización estrecha en una única tarea.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para "grasp the blue cylinder" con el robot `bi_so_follower`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no puede afirmarse su fiabilidad en producción.
- Dataset pequeño: 81 episodios y 14.444 fotogramas implican riesgo de sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distractores.
- Dependencia del hardware: requiere las tres cámaras en las posiciones y nombres exactos (`front`, `left_wrist`, `right_wrist`) y un robot compatible con `bi_so_follower`; cualquier desviación invalida la política.
- Sin capacidades de lenguaje general: no debe usarse para generación de texto, razonamiento, código ni atención al cliente; el prompt textual es solo una etiqueta de tarea.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede ejecutar movimientos plausibles pero erróneos ante estados fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la licencia del modelo base y del dataset asociado.
- Sesgos: no documentados; el dataset proviene de un único entorno de oficina, lo que puede introducir sesgos de escena y de configuración de cámara.
- Repositorio de 13,2 GB: incluye checkpoints de entrenamiento, lo que encarece el almacenamiento y la descarga frente al peso real del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Riccardo11/smolvla_empty_insertion_box_office
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Riccardo11/full_insertion_box_blue_cylinder_office
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Riccardo11/full_insertion_box_blue_cylinder_office
