# ethanCSL/openarm_pringles_gr00t_real_v00

## Resumen

`ethanCSL/openarm_pringles_gr00t_real_v00` es una politica robotica de manipulacion (vision-language-action) publicada por el usuario ethanCSL y entrenada con la libreria LeRobot de Hugging Face. No es un modelo de lenguaje: es un fine-tuning de GR00T N1.7, el modelo fundacional abierto de NVIDIA para razonamiento y habilidades de robots humanoides, adaptado aqui a un brazo robotico concreto (tipo `openarm`) para una unica tarea de manipulacion bimanual.

El modelo parte del backbone Cosmos-Reason2/Qwen3-VL y de un transformer de acciones con flow matching que predice acciones condicionadas por vision, lenguaje y propiocepcion. Cuenta con unos 3.144 millones de parametros (3,14 B) y un tamano de repositorio de 12,6 GB. Consume el estado del robot (vector de 16 dimensiones) y tres camaras RGB de 480x640, y produce un vector de accion de 16 dimensiones.

Es relevante ahora porque demuestra el flujo completo de fine-tuning de un modelo fundacional robotico (GR00T N1.7) sobre datos reales de teleoperacion muy reducidos: 30 episodios y 12.348 fotogramas a 30 FPS. Sirve como referencia practica de como adaptar un VLA generico a un hardware especifico mediante aprendizaje por imitacion, aunque su alcance funcional queda limitado a la tarea concreta para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de doble sistema: backbone Cosmos-Reason2/Qwen3-VL mas transformer de acciones con flow matching (GR00T N1.7) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors (precision no confirmada) |
| Idiomas soportados | no disponible; los ejemplos de instruccion de tarea estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | openarm |
| Camaras | body_cam, wrist_cam, right_wrist_cam |
| Entrada de estado | observation.state, shape (16,) |
| Salida de accion | action, shape (16,) |
| Tamano del repositorio | 12,6 GB |
| Libreria | lerobot |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment de doble sistema. El "sistema 2" es un modelo de vision-lenguaje basado en Cosmos-Reason2/Qwen3-VL que interpreta las imagenes y la instruccion en lenguaje natural; el "sistema 1" es un transformer de acciones entrenado con flow matching que genera las acciones motoras condicionadas por la representacion del VLM y por el estado propioceptivo del robot. Este diseno separa el razonamiento semantico de la generacion motora de alta frecuencia.

El entrenamiento de este fine-tuning concreto se realizo con LeRobot 0.6.2 sobre el dataset `ethanCSL/openarm_pringles_real_v00`: 30 episodios, 12.348 fotogramas, 30 FPS, con una unica tarea ("Pick up the Pringles can with the right arm, hand it to the left arm"). La configuracion reportada es de 20.000 pasos de entrenamiento, batch size de 64, optimizador AdamW, learning rate de 1e-4 y semilla 42. No se documenta en la informacion disponible el numero de tokens, la composicion completa del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Manipulacion bimanual de objetos: la politica ejecuta la secuencia de coger un bote de Pringles con el brazo derecho y pasarlo al brazo izquierdo, condicionada por la instruccion de tarea.
- Percepcion visual multi-camara: procesa simultaneamente tres flujos RGB de 480x640 (camara de cuerpo y dos camaras de muneca).
- Control condicionado por estado propioceptivo: integra un vector de estado de 16 dimensiones para generar acciones coherentes con la configuracion del robot.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de teleoperacion real, sin necesidad de modelado fisico explicito.
- Condicionamiento por lenguaje: acepta una instruccion textual de tarea como entrada, lo que permite en principio seleccionar la tarea a ejecutar.
- Prediccion de acciones por flow matching: genera trayectorias continuas del vector de accion de 16 dimensiones.
- Soporte de tool calling: no disponible (no aplica a este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de software; la politica ejecuta una secuencia motora, no razonamiento simbolico.
- Capacidades multilingues: no disponibles; los ejemplos de instruccion estan en ingles.
- Capacidades especiales: no disponibles (no hay modo thinking, vision generativa ni audio).

## Casos de uso

- Manipulacion bimanual pick-and-place: el modelo ejecuta la tarea concreta de coger un bote y transferirlo entre brazos, replicando la secuencia aprendida de teleoperacion; es adecuado porque fue entrenado especificamente para esa tarea en el robot openarm.
- Investigacion en aprendizaje por imitacion: sirve como caso de estudio de fine-tuning de GR00T N1.7 con datasets pequenos (30 episodios, 12.348 fotogramas), permitiendo reproducir el flujo completo con LeRobot.
- Base para fine-tuning de tareas similares: puede usarse como punto de partida para entrenar politicas relacionadas en el mismo hardware, reutilizando los pesos del VLA fundacional.
- Validacion de hardware openarm: permite comprobar el funcionamiento de la plataforma robotica openarm con sus tres camaras y calibrar el pipeline de datos antes de escalar a tareas mas complejas.
- Recogida de datos asistida: integrado en un bucle de `lerobot-rollout`, puede apoyar la recoleccion de demostraciones y la evaluacion cualitativa del comportamiento.
- Prototipado de lineas de manipulacion ligeras: en entornos controlados, demuestra la viabilidad de automatizar una transferencia de objeto entre dos efectores con una camara de cuerpo y dos de muneca.
- Docencia y demostraciones: sirve como ejemplo reproducible de un pipeline VLA completo (datos, entrenamiento, despliegue) en cursos o talleres de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye de forma explicita la seccion de evaluacion vacia, con la indicacion "_No evaluation results have been provided for this policy yet._". No hay tasas de exito en robot real, ni resultados en tareas tipo MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de control motor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los 3,14 B de parametros ocupan aproximadamente 6,3 GB en precision de 16 bits solo en pesos; hay que sumar activaciones y buffers, por lo que se recomienda un margen adicional.
- GPU recomendadas: no especificadas por el autor. Dado el tamano, una GPU con 16 GB o mas de memoria es un punto de partida razonable; para entrenamiento o despliegue con margen se recomienda una GPU de 24 GB o superior.
- Cabe en GPU de consumo: probablemente si en modelos con 24 GB (por ejemplo, RTX 3090 o RTX 4090) o 16 GB con margen ajustado; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=ethanCSL/openarm_pringles_gr00t_real_v00`). No se ha validado con vLLM, llama.cpp, Ollama ni TGI, que no estan pensados para politicas de control motor de este tipo.
- Latencia y throughput: no disponibles. El bucle de control opera con camaras a 30 FPS y batch size de entrenamiento de 64, pero no se documenta la frecuencia de inferencia real ni el rendimiento en robot.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openarm_pringles_gr00t_real_v00 (este) | 3,14 B | VLA basado en GR00T N1.7, fine-tuning de una tarea | no disponible | apache-2.0 | Hugging Face, via LeRobot |
| GR00T N1.7 (modelo base) | no disponible | VLA fundacional cross-embodiment | no disponible | no disponible en esta informacion | GitHub de NVIDIA Isaac-GR00T |
| pi0 (Physical Intelligence) | aprox. 3 B | VLA con flow matching | no disponible | no confirmada | publico |
| OpenVLA | aprox. 7 B | VLA sobre backbone Llama-2 | no disponible | no confirmada | publico |

Las cifras de parametros de pi0 y OpenVLA son aproximadas y pueden variar segun la version; no se dispone en la informacion proporcionada de datos comparativos de rendimiento entre estos modelos y la politica descrita.

## Limitaciones y advertencias

- Alcance funcional muy reducido: el modelo esta entrenado para una unica tarea ("Pick up the Pringles can with the right arm, hand it to the left arm"); no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeno: 30 episodios y 12.348 fotogramas, lo que limita la robustez frente a variaciones de posicion, iluminacion, distractores u objetos.
- Sin resultados de evaluacion: no hay tasas de exito publicadas, por lo que se desconoce su fiabilidad real en robot.
- Dependencia fuerte del hardware: entradas fijas de estado (16,) y tres camaras concretas; cambiar de robot, de numero de camaras o de nombres de observacion requiere reentrenamiento.
- Riesgo de sobreajuste al entorno de grabacion: al provenir de un unico escenario, es probable que el rendimiento caiga fuera de las condiciones originales.
- Idiomas: los ejemplos de instruccion estan en ingles; no hay informacion sobre el comportamiento con instrucciones en otros idiomas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido textual, pero existe riesgo de comportamientos motores erroneos o inseguros ante observaciones fuera de distribucion.
- Licencia: apache-2.0, que permite uso comercial con las condiciones habituales de atribucion; conviene revisar asimismo la licencia del modelo base GR00T N1.7 de NVIDIA.
- Advertencia de produccion: cualquier despliegue en robot real debe acompanarse de limites de fuerza, paradas de emergencia y validacion en entorno controlado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_pringles_gr00t_real_v00
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_pringles_real_v00
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_pringles_real_v00
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para groot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (Cadene et al., 2024): incluida en la model card del autor
