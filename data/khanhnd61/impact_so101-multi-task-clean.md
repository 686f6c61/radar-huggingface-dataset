# khanhnd61/impact_so101-multi-task-clean

## Resumen

El modelo `khanhnd61/impact_so101-multi-task-clean` es una política de robótica entrenada con el framework LeRobot de HuggingFace. Se trata de un modelo de aprendizaje por imitación que aprende a generar acciones de control para un robot manipulador del tipo `so_follower` (robot SO-101), a partir de observaciones multimodales que incluyen el estado interno del robot y dos cámaras RGB (frontal y muñeca). El modelo resuelve tareas concretas de manipulación de objetos, como colocar una cinta en una caja o en una taza, y ha sido entrenado exclusivamente sobre un dataset de teleoperación de 44 episodios.

La arquitectura se denomina `impact`, un tipo de política neuronal integrada en LeRobot. El modelo tiene 77.965.446 parámetros, lo que lo convierte en un modelo ligero en términos de tamaño. No se trata de un modelo de lenguaje: no soporta texto, tool calling ni razonamiento simbólico. Su relevancia radica en ser una implementación de demostración de políticas multi-tarea en robótica física, que puede ejecutarse en tiempo real y que sirve como referencia para investigar técnicas de aprendizaje por imitación en entornos reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | impact (política de aprendizaje por imitación) |
| Parametros totales | 77.965.446 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura `impact` está integrada en el framework LeRobot y se entrena mediante aprendizaje por imitación a partir de demostraciones teleoperadas. El modelo consume observaciones de entrada con forma `(6,)` para el estado del robot, e imágenes RGB de las cámaras `front` y `wrist` con dimensiones `(3, 480, 640)`. Genera como salida una acción de control de 6 dimensiones. No se han publicado detalles técnicos adicionales sobre las capas internas o mecanismos específicos de la arquitectura `impact`.

El entrenamiento se realizó con el dataset `khanhnd61/so101-multi-task-clean`, que contiene 44 episodios y 15.317 frames a 30 FPS. Las tareas incluidas son "Put the tape into the box", "Put the tape into the cup" y "Put the cup into the box". La configuración de entrenamiento declarada es de 19.000 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, usando LeRobot versión 0.6.1. No se indica si se aplicaron técnicas como RLHF, DPO o decodificación especulativa, ya que no son aplicables a políticas de robótica.

## Capacidades

- Generación de acciones de control de 6 dimensiones para un robot manipulador, a partir de observaciones de estado e imágenes.
- Fusión de entrada visual de dos cámaras simultáneas (frontal y muñeca) con el estado del robot.
- Ejecución de tres tareas de manipulación concretas: colocar una cinta en una caja, colocar una cinta en una taza y colocar una taza en una caja.
- Capacidad de distinguir entre tareas mediante el campo `task` en la interfaz de LeRobot, lo que permite seleccionar la actividad a ejecutar.
- Entrenado para inferencia a 30 FPS, lo que lo hace apto para control en tiempo real.
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots físicos.
- No soporta tool calling, generación de texto, respuesta a preguntas ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de ensamblaje en entornos de laboratorio: el modelo puede colocar piezas pequeñas (como cintas o tazas) en contenedores, lo que resulta útil en líneas de fabricación o montaje sencillo dentro de un espacio controlado.
- Robótica de servicio en entornos domésticos o de oficina: la capacidad de colocar un objeto en una taza o caja permite aplicaciones de ordenación de objetos sobre una mesa, siempre que el robot tenga la configuración `so_follower` con las cámaras adecuadas.
- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar cómo una política multi-tarea generaliza a partir de un conjunto pequeño de demostraciones (44 episodios).
- Validación de la calidad de datasets de teleoperación: los usuarios pueden ejecutar la política sobre el mismo entorno donde se recogió el dataset y comprobar la consistencia de las demostraciones.
- Punto de partida para fine-tuning: dada la licencia Apache-2.0, el modelo puede tomarse como base para adaptarlo a nuevas tareas de manipulación mediante fine-tuning con LeRobot.
- Integración en pipelines de investigación de sistemas robóticos: el modelo se puede combinar con el framework LeRobot para pruebas de control en lazo cerrado en robots SO-101, sin necesidad de desarrollar una política desde cero.
- Demostraciones académicas y educativas: al ser un modelo pequeño y de libre acceso, es adecuado para enseñar conceptos de aprendizaje por imitación y control robótico en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No hay datos de éxito por tarea, métricas de recompensa ni comparaciones con otras políticas.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la model card. Basándonos en el tamaño del modelo (77.965.446 parámetros) y en que procesa imágenes de dos cámaras de 480x640, se estima que el consumo de VRAM es bajo, probablemente inferior a 2 GB para inferencia con PyTorch. Sería viable ejecutarlo en GPUs consumer como RTX 3060, RTX 4060 o RTX 4070, y también en GPUs de centro de datos como A100 o H100.

El despliegue se realiza a través del framework LeRobot, utilizando el comando `lerobot-rollout` con `--strategy.type=base`. Requiere una GPU compatible con CUDA para entrenamiento e inferencia acelerada. No se usa vLLM, llama.cpp ni Ollama, porque se trata de una política de robótica, no de un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de datos concretos de modelos comparables en la información proporcionada. Otras políticas disponibles en LeRobot pueden incluir arquitecturas como ACT o Diffusion Policy, pero no se han encontrado métricas públicas ni evaluaciones que permitan comparar este modelo con ellas en las mismas tareas. La comparativa queda, por tanto, no disponible.

## Limitaciones y advertencias

- No se ha evaluado el modelo en un robot real, por lo que su rendimiento en el mundo físico es desconocido.
- El dataset de entrenamiento es muy pequeño (44 episodios, 3 tareas), lo que limita la capacidad de generalización a nuevas posiciones, iluminación o variaciones de objetos.
- La política depende de la configuración específica de cámaras (`front` y `wrist`) y del tipo de robot `so_follower`. Si se altera la posición o el tipo de cámara, el modelo puede fallar.
- La capacidad de acción está restringida a 6 dimensiones y a las tres tareas entrenadas. No es un modelo de propósito general.
- Riesgo de alucinación en acción: en situaciones no vistas en el entrenamiento, la política puede generar acciones incorrectas o inestables.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar que el robot, los datos de teleoperación y el dataset original no tengan restricciones adicionales.
- No se han documentado sesgos específicos, pero al estar entrenado con demostraciones de un operador humano, es plausible que el modelo herede los patrones de comportamiento del teleoperador.
- El modelo no procesa texto, por lo que no interactúa con instrucciones en lenguaje natural ni con sistemas de planificación basados en lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khanhnd61/impact_so101-multi-task-clean
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-multi-task-clean
- Dataset original: https://huggingface.co/datasets/khanhnd61/so101-multi-task
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=khanhnd61/so101-multi-task-clean
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
