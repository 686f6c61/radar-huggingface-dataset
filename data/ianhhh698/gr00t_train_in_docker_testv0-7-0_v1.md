# IanHHH698/gr00t_train_in_docker_testv0.7.0_v1

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment orientado a razonamiento y habilidades en robots humanoides. La política combina un backbone Cosmos-Reason2/Qwen3-VL (visión-lenguaje) con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propiocepción. El checkpoint cuenta con 3.144.016.000 parámetros y un tamaño de repositorio de 12,6 GB en formato safetensors.

El modelo no es un LLM de propósito general, sino una política de imitación entrenada específicamente para la tarea "close_drawer" sobre un robot Franka Panda con dos cámaras (primary y wrist). El dataset de entrenamiento es IanHHH698/ian_telop_helloworld_v2, con 100 episodios, 13.976 fotogramas a 15 FPS, y un total de 2.000 pasos de entrenamiento con batch size 32, optimizador AdamW y learning rate 1e-4. Se trata de un experimento de entrenamiento dentro de Docker con LeRobot 0.7.0, sin resultados de evaluación publicados.

Su relevancia es acotada: sirve como ejemplo reproducible de fine-tuning de GR00T N1.7 con LeRobot para una tarea concreta de manipulación, y como referencia para quienes quieran replicar el pipeline de entrenamiento de políticas VLA (vision-language-action) en robótica de manipulación. No obstante, la ausencia de licencia, de idiomas declarados y de métricas de éxito limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL (visión-lenguaje) + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | panda (Franka Panda) |
| Camaras | primary, wrist |
| Tamano del repositorio | 12,6 GB |
| Dataset de entrenamiento | IanHHH698/ian_telop_helloworld_v2 (100 episodios, 13.976 frames, 15 FPS) |
| Tarea entrenada | close_drawer |
| Entradas | observation.images.primary (3,256,256), observation.images.wrist (3,256,256), observation.state.cartesian (6,), observation.state.gripper (1,), observation.state.joints (7,), observation.state.target (6,), observation.state (20,) |
| Salidas | action (7,) |

## Arquitectura y entrenamiento

La política se basa en GR00T N1.7, un modelo fundacional cross-embodiment de NVIDIA para razonamiento y habilidades en robots humanoides. La arquitectura combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones que emplea flow matching para predecir acciones condicionadas por observaciones visuales, instrucciones de lenguaje y estado propioceptivo del robot. El modelo consume dos flujos de imagen de 256x256 píxeles (cámara primary y cámara wrist) junto con vectores de estado cartesiano (6), gripper (1), articulaciones (7) y target (6), que se agregan en un vector de estado de 20 dimensiones, y produce un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset IanHHH698/ian_telop_helloworld_v2, compuesto por 100 episodios y 13.976 fotogramas a 15 FPS para la tarea "close_drawer". La configuración fue de 2.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se especifica en la información disponible el número total de tokens de entrenamiento del backbone, la composición del dataset más allá de la tarea citada, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o attention linear más allá de lo que implica el uso de flow matching en el transformer de acciones.

## Capacidades

- Control de robot manipulador: genera acciones de 7 dimensiones para un Franka Panda a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente las vistas primary y wrist a resolución 256x256.
- Condicionamiento por lenguaje: acepta una instrucción de tarea (en este caso, "close_drawer") para guiar la política.
- Fusión de estado propioceptivo: integra posición cartesiana, estado del gripper, articulaciones y target en un vector de 20 dimensiones.
- Política de imitación entrenada: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, visión general o audio en la información proporcionada.

## Casos de uso

- Cierre de cajones en entornos controlados: la política está entrenada específicamente para la tarea "close_drawer" sobre un Franka Panda, por lo que su uso directo es la ejecución de esa maniobra con las dos cámaras configuradas y el vector de estado definido.
- Reproducción de experimentos de imitation learning: sirve como referencia para replicar un pipeline completo de entrenamiento GR00T N1.7 con LeRobot 0.7.0, incluyendo la configuración de hiperparámetros y el formato de observaciones.
- Base para fine-tuning en nuevas tareas de manipulación: el checkpoint puede servir como punto de partida para reentrenar con `lerobot-train` sobre otros datasets de tareas similares (apertura/cierre de contenedores, manipulación de objetos rígidos).
- Validación de pipelines de despliegue en Docker: al haberse entrenado en Docker con LeRobot 0.7.0, es útil para verificar la integración de `lerobot-rollout` en contenedores con acceso a puertos de robot y cámaras OpenCV.
- Docencia y formación en robótica VLA: permite ilustrar el flujo completo desde la teleoperación y grabación de datos hasta el despliegue de una política vision-language-action en un robot real.
- Pruebas de infraestructura de inferencia robótica: útil para medir latencia y throughput de una política de 3.144 millones de parámetros en el hardware disponible, antes de invertir en datasets mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no se ha reportado ninguna tabla de trials/success rate.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un checkpoint de 3.144 millones de parámetros en safetensors ocupa aproximadamente 12,6 GB en el repositorio; en FP16 requeriría del orden de 6,3 GB solo para pesos, más memoria para activaciones y buffers del backbone visual, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: LeRobot 0.7.0 mediante `lerobot-rollout` con `--policy.path=IanHHH698/gr00t_train_in_docker_testv0.7.0_v1` y `--strategy.type=base`. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI para esta política.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IanHHH698/gr00t_train_in_docker_testv0.7.0_v1 | 3.144.016.000 | no disponible | close_drawer (Panda) | no disponible | Hugging Face, 0 descargas, 0 likes |
| GR00T N1.7 (NVIDIA, base) | no disponible en la informacion | no disponible | Modelo fundacional cross-embodiment | no disponible en la informacion | Repositorio NVIDIA/Isaac-GR00T |
| Otras politicas LeRobot para Panda | no disponible | no disponible | Manipulacion con imitation learning | variable segun autor | Hugging Face (ecosistema LeRobot) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser una política entrenada con 100 episodios de una única tarea, es esperable un sesgo fuerte hacia las condiciones de iluminación, posiciones de objetos y configuración de cámara del dataset, aunque el autor no lo documenta.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la generación de acciones no válidas fuera de la distribución de entrenamiento, no cuantificado por el autor.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados; la política está condicionada por la instrucción "close_drawer" y no se documenta generalización a otras instrucciones.
- Restricciones de licencia para uso comercial: la licencia figura como "no disponible" y la model card indica "[More Information Needed]", por lo que no se puede asumir permiso de uso comercial.
- Ausencia de evaluación: no hay resultados de éxito publicados, por lo que no se puede afirmar robustez ni tasa de acierto en la tarea.
- Entrenamiento limitado: 2.000 pasos y 100 episodios son una base reducida; el riesgo de sobreajuste y de baja generalización a nuevas posiciones es alto.
- Dependencia de hardware específico: el despliegue requiere un Franka Panda, dos cámaras con los nombres e índices exactos (`primary`, `wrist`) y el vector de estado de 20 dimensiones definido.
- Fecha de creación futura: el repositorio figura creado el 2026-11-27, dato que conviene verificar antes de citarlo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/IanHHH698/gr00t_train_in_docker_testv0.7.0_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/IanHHH698/ian_telop_helloworld_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=IanHHH698/ian_telop_helloworld_v2
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
