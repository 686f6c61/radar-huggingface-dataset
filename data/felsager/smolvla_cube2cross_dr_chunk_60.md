# felsager/smolvla_cube2cross_dr_chunk_60

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y una instrucción en lenguaje natural. Esta ficha concreta, `felsager/smolvla_cube2cross_dr_chunk_60`, es un ajuste fino del modelo base `felsager/smolvla_base_ee_rel` sobre el conjunto de datos `felsager/vla_cubes_cross_dr`, orientado a la tarea de recoger un cubo de color y depositarlo sobre una cruz roja.

El modelo resuelve el problema de la generación de políticas de imitación (imitation learning) para manipulación robótica con hardware de consumo. Con 450 millones de parámetros, un tamaño de repo de 19,9 GB y una ventana de observación basada en tres cámaras RGB de 480×640, produce acciones de 10 dimensiones a partir de un estado articular de 10 dimensiones. Es relevante porque demuestra que un VLA de tamaño reducido puede ejecutarse en una GPU consumer, algo que los VLA de gran escala (decenas de miles de millones de parámetros) no permiten.

El ajuste se ha realizado con LeRobot 0.6.2 durante 80 000 pasos, batch de 64, optimizador AdamW y learning rate 0.001, sobre 999 episodios y 510 363 fotogramas a 30 FPS. La licencia Apache 2.0 facilita su reutilización comercial, aunque el modelo está especializado en una única tarea y un único tipo de robot (`ur5e_hand_e`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta; no se detalla la topología interna en la información disponible |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje general) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `felsager/smolvla_base_ee_rel` |
| Tipo de robot | `ur5e_hand_e` |
| Cámaras de entrada | `top`, `wrist`, `empty_camera_0` (3×480×640) |
| Entrada de estado | `observation.state` de forma `(10,)` |
| Salida de acción | `action` de forma `(10,)` |
| Dataset de entrenamiento | `felsager/vla_cubes_cross_dr` (999 episodios, 510 363 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 80 000 |
| Batch size | 64 |
| Optimizador | AdamW, lr 0.001, seed 0 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repo | 19,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones para generar trayectorias de control a partir de imágenes e instrucciones textuales. La información disponible no detalla la topología interna exacta (número de capas, dimensión oculta, mecanismo de atención), pero sí confirma que se trata de una arquitectura compacta pensada para despliegue en hardware de consumo. El modelo procesa tres flujos visuales de 480×640 (cámara superior, cámara de muñeca y una cámara adicional `empty_camera_0`) junto con un vector de estado de 10 dimensiones, y emite un vector de acción de 10 dimensiones.

El entrenamiento se realizó por ajuste fino supervisado (imitación) desde `felsager/smolvla_base_ee_rel` sobre el dataset `felsager/vla_cubes_cross_dr`, que contiene 999 episodios y 510 363 fotogramas a 30 FPS. Las tareas cubiertas son cuatro variantes de "recoger el cubo [verde/azul/amarillo/rojo] y colocarlo sobre la cruz roja". Se usaron 80 000 pasos con batch de 64, AdamW y learning rate 0.001. No se indica en la información disponible si hubo RLHF, DPO ni ninguna fase de refuerzo; al tratarse de una política de imitación, el entrenamiento es presumiblemente conductual (behavior cloning). El sufijo `chunk_60` del nombre sugiere una configuración de predicción de acciones por chunks de 60 pasos, aunque este detalle no se documenta explícitamente en la model card.

## Capacidades

- Generación de acciones de control robótico de 10 dimensiones a partir de observaciones multimodales (tres cámaras RGB y estado articular).
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea de manipulación (recoger un cubo de color concreto y colocarlo sobre la cruz roja).
- Percepción visual multi-cámara: cámara superior, cámara de muñeca y una tercera cámara adicional.
- Ejecución de políticas de imitación en tiempo real a 30 FPS sobre el robot `ur5e_hand_e`.
- Despliegue en hardware de consumo gracias a sus 450 M de parámetros.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas ni generación de texto libre; el modelo está especializado en control motor.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta la secuencia de recoger un cubo de color y depositarlo sobre una cruz roja, adecuado para experimentos de manipulación repetitivos con un UR5e equipado con mano eléctrica.
- **Prototipado rápido de políticas VLA en hardware asequible**: al caber en una GPU consumer, permite a un equipo de investigación validar pipelines de imitación sin acceso a clústeres de GPU de gran escala.
- **Generación de datos sintéticos y aumento de dataset**: la política puede ejecutarse en bucle para producir trayectorias adicionales que se añadan al dataset `vla_cubes_cross_dr` y reentrenar el modelo.
- **Evaluación de robustez ante cambios de dominio**: el sufijo `dr` del dataset sugiere domain randomization; el modelo sirve para medir la generalización a posiciones de cubo, iluminación y distractores distintos de los de entrenamiento.
- **Base para ajuste fino en tareas de ensamblaje**: partiendo de `smolvla_base_ee_rel`, un equipo puede adaptar la política a tareas de inserción o apilamiento con el mismo robot y cámaras.
- **Docencia y demostraciones de VLA**: el tamaño reducido y la licencia Apache 2.0 lo hacen apto para cursos de robótica donde se enseña el ciclo completo de grabación, entrenamiento y despliegue con LeRobot.
- **Integración en pipelines de control ROS/LeRobot**: mediante `lerobot-rollout` puede integrarse en un bucle de control que recibe observaciones de las cámaras y publica comandos de acción al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Con 450 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,8 GB; en FP16, unos 0,9 GB. A ello hay que sumar la memoria de activaciones de tres flujos de imagen de 480×640, que puede elevar el consumo total por encima de los 4-6 GB según el batch y la implementación.
- **GPU recomendadas**: no especificadas en la información disponible. Por tamaño, una RTX 4090, RTX 3090, A100 o H100 son suficientes; el modelo está pensado para hardware de consumo.
- **¿Cabe en GPU consumer?**: sí, según la model card ("can be deployed on consumer-grade hardware"). Una RTX 3060 de 12 GB o superior debería ser suficiente, aunque no se confirma con cifras oficiales.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de control motor.
- **Latencia y throughput**: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que la política debe operar en ese orden de frecuencia, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `felsager/smolvla_cube2cross_dr_chunk_60` | 450 M | 3 cámaras 480×640 + estado (10,) | Pick-and-place de cubos sobre cruz | Apache 2.0 | Hugging Face (14 descargas) |
| `felsager/smolvla_base_ee_rel` | no disponible | no disponible | Política base VLA para UR5e | no disponible | Hugging Face |
| SmolVLA (modelo original, paper 2506.01844) | no disponible en la información | no disponible | VLA general compacto | no disponible | Hugging Face / paper |
| Políticas VLA de gran escala (p. ej. familias tipo RT-2/OpenVLA) | no disponible en la información | no disponible | Manipulación general | no disponible | no disponible |

La información proporcionada no incluye datos numéricos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- **Especialización estrecha**: el modelo solo ha sido entrenado para cuatro tareas de recogida de cubos de color y colocación sobre una cruz roja; no generaliza a otras tareas sin reentrenamiento.
- **Dependencia del robot**: está calibrado para `ur5e_hand_e` con las cámaras `top`, `wrist` y `empty_camera_0`; usar otro robot o configuración de cámaras invalida la política.
- **Sin evaluación publicada**: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- **Riesgo de alucinación motora**: como toda política de imitación, puede generar trayectorias fuera de distribución ante objetos, iluminación o posiciones no vistas; no hay mecanismo de seguridad intrínseco.
- **Sesgos del dataset**: el comportamiento refleja las demostraciones de `vla_cubes_cross_dr` (999 episodios); posiciones, colores y condiciones de iluminación limitadas pueden sesgar la política.
- **Idioma**: las instrucciones de tarea están en inglés y el modelo no es un modelo de lenguaje general; no se documenta soporte multilingüe.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base `smolvla_base_ee_rel` debe verificarse por si tuviera condiciones adicionales.
- **Tamaño del repo**: 19,9 GB, lo que implica una descarga considerable y espacio en disco para checkpoints.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/felsager/smolvla_cube2cross_dr_chunk_60)
- [Modelo base felsager/smolvla_base_ee_rel](https://huggingface.co/felsager/smolvla_base_ee_rel)
- [Dataset felsager/vla_cubes_cross_dr](https://huggingface.co/datasets/felsager/vla_cubes_cross_dr)
- [Paper SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de grabación y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de comandos LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia (rollout)](https://huggingface.co/docs/lerobot/main/en/inference)
