# RoboColosseum/so101-cube-drawer-gr00t-n1.7

## Resumen

so101-cube-drawer-gr00t-n1.7 es una política de robótica entrenada con LeRobot que implementa el modelo fundacional GR00T N1.7 de NVIDIA sobre un robot de tipo `so_follower` (SO-101). El modelo resuelve una tarea de manipulación concreta: coger un cubo azul de la mesa, introducirlo en un cajón abierto y cerrarlo. Combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice comandos motores condicionados por visión, lenguaje y propriocepción.

El checkpoint contiene 3.144.016.000 parámetros en formato safetensors y ocupa 102,2 GB en el repositorio. Se entrenó durante 40.000 pasos con batch de 32 y optimizador AdamW sobre un dataset de 100 episodios y 38.687 frames a 30 FPS. Es relevante como ejemplo práctico de aplicación de un modelo fundacional cross-embodiment a un robot de bajo coste, aunque su alcance está limitado a una única tarea y a un único tipo de robot.

La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación publicada y la especificidad de la tarea hacen que deba tratarse como un artefacto de investigación o demostración más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GR00T N1.7: un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las observaciones visuales (cámaras `front` y `wrist`, ambas a 480x640) junto con la instrucción de tarea en lenguaje natural, y un transformer de acciones que genera las predicciones mediante flow matching. La entrada de propriocepción es un vector de estado de 6 dimensiones y la salida es un vector de acción de 6 dimensiones, correspondiente a los grados de libertad del robot SO-101.

El entrenamiento se realizó con LeRobot 0.6.1 durante 40.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset `Jiamo0912/so101-cube-drawer` contiene 100 episodios y 38.687 frames grabados a 30 FPS para la tarea "Put the blue cube on the table into the open drawer, then close the drawer". No se documenta el uso de RLHF, DPO ni fases de post-entrenamiento adicionales; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Predicción de acciones de manipulación robótica de 6 grados de libertad a partir de observaciones visuales y estado proprioceptivo.
- Comprensión de instrucciones de tarea en lenguaje natural (condicionamiento por texto).
- Fusión de dos vistas de cámara (frontal y de muñeca) para el control del efector final.
- Ejecución de una secuencia de habilidades compuesta: pick del cubo, colocación en el cajón y cierre del cajón.
- Integración con el ecosistema LeRobot mediante `lerobot-rollout` y `lerobot-train`.
- Reentrenamiento sobre nuevos datasets con `--policy.type=groot`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Demostración de manipulación pick-and-place en robot SO-101: el modelo ejecuta la secuencia completa de coger el cubo y depositarlo en el cajón, útil para validar la cadena hardware-software de un robot de bajo coste.
- Investigación en aprendizaje por imitación: sirve como referencia de cómo adaptar un modelo fundacional GR00T N1.7 a una tarea concreta con 100 episodios y 40.000 pasos de entrenamiento.
- Benchmark interno de políticas robóticas: al ser un checkpoint reproducible (semilla 1000, hiperparámetros documentados), permite comparar variantes de dataset o de configuración de entrenamiento.
- Prototipado de automatización de tareas de laboratorio: la tarea de introducir objetos en un cajón es representativa de operaciones de recogida y almacenamiento que pueden extenderse a otros objetos mediante reentrenamiento.
- Educación y formación en robótica: el flujo completo de LeRobot (grabación, entrenamiento, rollout) con este checkpoint sirve para enseñar el ciclo de vida de una política de imitación.
- Base para fine-tuning en tareas de cierre de contenedores: la política ya aprende la fase de cierre del cajón, que puede reutilizarse como inicialización para tareas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3.144 millones de parámetros, una inferencia en FP16 requeriría del orden de 6-7 GB solo para pesos, más el coste del backbone visión-lenguaje y de las activaciones, aunque este cálculo no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (102,2 GB) sugiere que el checkpoint completo no cabe en GPUs de consumo sin cuantización o selección de pesos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que requiere `--robot.type=so_follower`, dos cámaras OpenCV a 640x480 y 30 FPS, y el puerto del robot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-cube-drawer-gr00t-n1.7 | 3.144.016.000 | no disponible | Manipulación SO-101 (cubo y cajón) | Apache 2.0 | Hugging Face, LeRobot |
| GR00T N1.7 (base, NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot para SO-101 | no disponible | no disponible | Tareas específicas de imitación | variable | Hugging Face, LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea y un único robot (`so_follower` con cámaras `front` y `wrist`); no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida en robot real.
- El repositorio ocupa 102,2 GB, lo que dificulta su descarga y despliegue en entornos con almacenamiento limitado.
- Los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento; un cambio de montaje o resolución puede degradar el rendimiento.
- El modelo puede fallar ante cambios de iluminación, posiciones de objetos o distractores no presentes en el dataset de entrenamiento.
- Riesgo de alucinación de acciones no verificable sin evaluación; en robótica esto se traduce en movimientos incorrectos o colisiones.
- No se documentan sesgos específicos ni cobertura multilingüe; las instrucciones de tarea se proporcionan en inglés en los ejemplos.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluación y la especificidad de la tarea desaconsejan su uso en producción sin validación propia.
- No se especifican requisitos de seguridad física para el robot durante la ejecución de la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/so101-cube-drawer-gr00t-n1.7
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/so101-cube-drawer
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-cube-drawer
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
