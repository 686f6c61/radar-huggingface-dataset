# chocolat-nya/act_so101_r0_smoke

## Resumen

El modelo `chocolat-nya/act_so101_r0_smoke` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario chocolat-nya (kazuhiro arita) y publicada en Hugging Face bajo la licencia Apache 2.0. Está diseñada para el robot SO-101 (tipo `so_follower`) y entrenada mediante aprendizaje por imitación con datos teleoperados para ejecutar la tarea de recoger un cubo y colocarlo en una caja. El modelo consume imágenes de dos cámaras (frontal y lateral) y el estado del robot, y produce acciones de control de 6 dimensiones.

Con 51,67 millones de parámetros, es un modelo compacto que se integra en el ecosistema LeRobot, lo que facilita su despliegue y reentrenamiento. Su relevancia radica en demostrar la aplicación práctica de ACT en robótica real, con un pipeline completo de entrenamiento y evaluación documentado. Aunque no se han publicado resultados de evaluación, el modelo representa un ejemplo accesible de política de manipulación para la comunidad de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La política procesa observaciones visuales de dos cámaras (imágenes de 480x640 píxeles) y el estado del robot (6 dimensiones), y genera acciones de 6 dimensiones. El entrenamiento se realizó con LeRobot versión 0.6.2, utilizando un dataset de 20 episodios (6000 frames a 30 FPS) de teleoperación para la tarea "Pick up the cube and place it in the box". Se emplearon 2000 pasos de entrenamiento con batch size 16, optimizador AdamW y learning rate 1e-5, con semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento.

## Capacidades

- Control de un brazo robótico SO-101 para tareas de manipulación, específicamente pick-and-place de objetos.
- Procesamiento de imágenes de dos cámaras (frontal y lateral) para percepción visual del entorno.
- Generación de acciones de control de 6 grados de libertad (posición y orientación) a partir de observaciones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No soporta tool calling, agentes conversacionales ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo SO-101 para recoger piezas de una posición fija y depositarlas en una caja, reduciendo la intervención manual en líneas de montaje.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT a nuevas tareas o variaciones del entorno, gracias a su tamaño reducido y su integración con LeRobot.
- Prototipado rápido en robótica asistida: los desarrolladores pueden cargar el modelo en un robot SO-101 y probar su comportamiento en pocos minutos usando los comandos de LeRobot, sin necesidad de entrenar desde cero.
- Educación y formación en robótica: el modelo y su dataset asociado permiten a estudiantes y docentes experimentar con un pipeline completo de entrenamiento y despliegue de políticas de manipulación.
- Benchmarking de algoritmos de control: al ser un modelo pequeño y bien documentado, puede utilizarse como referencia para comparar el rendimiento de otras arquitecturas de aprendizaje por imitación en la misma tarea.
- Desarrollo de sistemas de manipulación en entornos simulados: aunque entrenado con datos reales, el modelo puede adaptarse para su uso en simuladores como Isaac Lab, facilitando la validación de algoritmos antes de la implementación física.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado el tamaño del modelo (51,67 millones de parámetros), es probable que pueda ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no hay datos oficiales.
- El entrenamiento se realizó con LeRobot, que requiere una GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060 o superior) para un rendimiento razonable.
- Para inferencia en tiempo real, se recomienda una GPU con al menos 8 GB de VRAM para manejar las dos cámaras y el procesamiento de imágenes.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También es posible exportar los pesos a otros formatos si se requiere, aunque no se documentan alternativas como vLLM u Ollama, que no son aplicables a este tipo de modelo robótico.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros modelos ACT en Hugging Face (por ejemplo, `aiden-li/so101-act`), pero no se han encontrado datos detallados para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (recoger un cubo y colocarlo en una caja) y no generaliza a otras tareas sin reentrenamiento.
- El dataset de entrenamiento es pequeño (20 episodios), lo que puede limitar la robustez ante variaciones en la posición de los objetos, iluminación o distracciones.
- No se han proporcionado resultados de evaluación en el robot real, por lo que el rendimiento esperado es incierto.
- El modelo depende de la configuración exacta de cámaras y del robot SO-101; cambios en la calibración o en la disposición de las cámaras pueden degradar su funcionamiento.
- Al ser un modelo de robótica, no tiene capacidades de lenguaje natural ni de razonamiento simbólico; su uso se limita al control de bajo nivel.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos de la licencia del dataset asociado, que no se detallan en la documentación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/chocolat-nya/act_so101_r0_smoke)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/chocolat-nya/so101_task_seed_20260819_085310)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
