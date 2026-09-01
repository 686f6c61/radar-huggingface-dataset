# k-chan-l/lekiwi_act_pick_and_place

## Resumen

El modelo `k-chan-l/lekiwi_act_pick_and_place` es una política de control robótico basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollado por el usuario k-chan-l, el modelo está diseñado para el robot móvil manipulador LeKiwi, un robot de bajo coste creado por SIGRobotics-UIUC. Su función es ejecutar una tarea de recogida y colocación: conducir hasta una mesa, recoger un cubo y depositarlo en una taza, utilizando dos cámaras (frontal y de muñeca) y un estado propio de 9 dimensiones.

El modelo se entrenó mediante aprendizaje por imitación a partir de 52 episodios teleoperados (84.874 fotogramas a 30 FPS) y contiene 51,67 millones de parámetros. Su arquitectura ACT predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad del movimiento y la tasa de éxito en tareas manipulativas. La licencia Apache 2.0 permite uso comercial sin restricciones, y los pesos se distribuyen en formato safetensors.

Es relevante porque demuestra cómo un robot móvil de bajo coste puede aprender tareas complejas de manipulación con un dataset relativamente pequeño, siguiendo la filosofía open source de LeRobot. El modelo está pensado para ser ejecutado en el propio robot LeKiwi mediante el comando `lerobot-rollout`, y sirve como referencia para la comunidad que trabaja con este hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.674.761 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto; se puede cuantizar pero no se ha publicado) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que genera secuencias de acciones de longitud fija (chunks) en lugar de predecir una única acción por paso de tiempo. La arquitectura se compone de un codificador de visión (basado en ResNet) que procesa las imágenes de las cámaras frontal y de muñeca (ambas de 480×640 píxeles), un codificador de estado que procesa la observación del estado del robot (9 dimensiones, incluyendo posición, orientación y estado del efector), y un decodificador transformer que produce los chunks de acción. Este diseño permite que el modelo capture dependencias temporales y genere movimientos suaves y coherentes.

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre el dataset `k-chan-l/lekiwi_pick_and_place`, que contiene 52 episodios de teleoperación con una tasa de 30 FPS. La configuración de entrenamiento incluyó 80.000 pasos, batch size de 16, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se aplicaron técnicas de refinamiento por refuerzo (RLHF/DPO) ni aprendizaje por refuerzo; el modelo es puramente de imitación. La innovación principal reside en la aplicación de ACT a un robot móvil de bajo coste, lo que demuestra la viabilidad de este enfoque en hardware accesible.

## Capacidades

- Control de robot móvil manipulador: el modelo genera comandos de acción de 9 dimensiones que incluyen la velocidad lineal y angular de la base, la posición del brazo y el estado del efector (pinza).
- Percepción visual multimodal: procesa simultáneamente dos cámaras (frontal y de muñeca) para localizar objetos y guiar la manipulación.
- Ejecución de tareas pick-and-place: realiza la secuencia completa de conducir hasta la mesa, recoger un cubo y colocarlo en una taza.
- Aprendizaje por imitación: reproduce fielmente las demostraciones teleoperadas, con capacidad para generalizar dentro del espacio de estados visto en el entrenamiento.
- Generación de acciones en chunks: predice secuencias de acciones (típicamente de 50 a 100 pasos) que mejoran la estabilidad del movimiento frente a políticas de paso a paso.
- Integración con LeRobot: funciona con el ecosistema LeRobot, incluyendo los comandos `lerobot-rollout` y `lerobot-train`, y puede ser evaluado o extendido fácilmente.
- No tiene capacidades de lenguaje, tool calling ni agentes: es exclusivamente un controlador de bajo nivel para robótica.

## Casos de uso

- Automatización de tareas de recogida y colocación en entornos de laboratorio o pequeñas líneas de producción: el modelo puede reemplazar la teleoperación manual en tareas repetitivas de manipulación, como ordenar piezas o alimentar una máquina, gracias a su capacidad de ejecutar la secuencia completa de forma autónoma.
- Investigación en aprendizaje por imitación con robots de bajo coste: sirve como punto de partida para estudiar cómo ACT se comporta en plataformas móviles con recursos limitados, permitiendo reproducir experimentos y comparar con otros métodos.
- Desarrollo de robots móviles manipuladores educativos: LeKiwi es un robot de bajo coste, y este modelo ejemplifica un caso de uso didáctico para enseñar robótica y aprendizaje automático en universidades o centros de formación.
- Benchmarking de políticas de control en el robot LeKiwi: el modelo puede utilizarse como referencia para evaluar nuevas arquitecturas o algoritmos de entrenamiento sobre el mismo hardware y tarea, proporcionando una línea base con resultados conocidos.
- Prototipado rápido de soluciones de automatización en entornos domésticos o de oficina: aunque la tarea es específica, la metodología puede extenderse a otras tareas de manipulación, y el modelo demuestra la viabilidad de desplegar políticas entrenadas por imitación en robots accesibles.
- Estudio de generalización en robótica: el dataset con solo 52 episodios permite investigar cómo la cantidad de datos afecta al rendimiento en tareas de pick-and-place, y el modelo puede servir para experimentos de aumento de datos o aprendizaje continuo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación: *"No evaluation results have been provided for this policy yet."* Por tanto, no se dispone de tasas de éxito ni métricas cuantitativas sobre el rendimiento en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~51,7 millones de parámetros. En fp32, los pesos ocupan aproximadamente 207 MB; en fp16, unos 104 MB. La inferencia requiere memoria adicional para activaciones y buffers, pero cabe cómodamente en GPUs con 2 GB o más. En CPU también es viable, aunque con mayor latencia.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060, etc.) es suficiente. Para entrenamiento o fine-tuning, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100, etc.) para manejar el batch size de 16 y las imágenes de 480×640.
- Compatibilidad con consumer GPU: sí, el modelo es ligero y puede ejecutarse en GPUs de consumo como la serie RTX 30 o 40. También puede funcionar en Apple Silicon mediante MPS.
- Opciones de despliegue: el modelo se ejecuta principalmente a través de LeRobot, usando el comando `lerobot-rollout` con el robot LeKiwi. No hay soporte oficial para vLLM, llama.cpp u Ollama porque no es un modelo de lenguaje. El despliegue requiere el robot físico y las cámaras configuradas.
- Latencia y throughput: no hay datos publicados. Dado el tamaño del modelo y la resolución de imagen, se espera una inferencia en tiempo real (30 FPS) en GPUs modernas, pero esto depende del hardware y de la implementación exacta.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos entrenados específicamente para el robot LeKiwi con la misma tarea. Sin embargo, se puede comparar a nivel de arquitectura con otros modelos ACT publicados en LeRobot para diferentes robots (por ejemplo, modelos para el brazo SO-100 o el robot ALOHA). Estos modelos suelen tener tamaños de parámetros similares (del orden de 50-100 millones) y usan la misma arquitectura base. La diferencia principal radica en el hardware, el dataset y la tarea específica. No hay datos cuantitativos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Drive to the table, pick up the cube and place it in the cup" en el robot LeKiwi. No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- El dataset de entrenamiento es pequeño (52 episodios) y probablemente captura un rango limitado de variaciones (posiciones de objetos, iluminación, condiciones del entorno). El modelo puede fallar ante situaciones no vistas.
- No se han publicado resultados de evaluación en el robot real, por lo que se desconoce su tasa de éxito real y su robustez.
- El modelo depende de una calibración precisa de las cámaras y del robot. Cambios en la disposición de las cámaras o en la cinemática del robot pueden degradar el rendimiento.
- No procesa lenguaje natural ni tiene capacidades de razonamiento simbólico; es un controlador de bajo nivel.
- La licencia Apache 2.0 permite uso comercial, pero el hardware LeKiwi y sus componentes pueden tener sus propias restricciones. Se recomienda revisar la documentación del robot.
- El modelo no incluye mecanismos de seguridad para evitar colisiones o daños. En despliegues reales, es necesario implementar supervisión humana o salvaguardas adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/k-chan-l/lekiwi_act_pick_and_place)
- [Dataset de entrenamiento](https://huggingface.co/datasets/k-chan-l/lekiwi_pick_and_place)
- [Visualización del dataset en LeRobot](https://huggingface.co/spaces/lerobot/visualize_dataset?path=k-chan-l/lekiwi_pick_and_place)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Repositorio LeKiwi (SIGRobotics-UIUC)](https://github.com/SIGRobotics-UIUC/LeKiwi)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
