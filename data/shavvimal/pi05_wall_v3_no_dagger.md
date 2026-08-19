# shavvimal/pi05_wall_v3_no_dagger

## Resumen

El modelo `shavvimal/pi05_wall_v3_no_dagger` es un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del modelo Vision-Language-Action (VLA) π₀.₅ (Pi05) desarrollado por Physical Intelligence. Pi05 está diseñado para la generalización en robótica, permitiendo que un robot ejecute tareas manipulativas en entornos nuevos a partir de observaciones visuales y de estado. Este modelo concreto se ha entrenado para una tarea específica: recoger un bloque de una pila y colocarlo sobre una pared (tarea tipo Jenga), utilizando un robot seguidor con cámaras frontal y de muñeca.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 9,4 GB. Está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación. Fue entrenado con el framework LeRobot sobre un dataset propio de 264 episodios y 118.322 fotogramas a 30 FPS, con 20.000 pasos de entrenamiento. No se han publicado resultados de evaluación en la model card, por lo que su rendimiento real en el robot no está documentado.

Este modelo es relevante para la comunidad de robótica y aprendizaje por imitación, ya que demuestra el flujo de trabajo de LeRobot para ajustar un VLA de última generación a una tarea concreta, y sirve como punto de partida para desarrolladores que quieran replicar o extender el entrenamiento a otras tareas manipulativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence, implementada en LeRobot |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no procesa texto de forma directa) |
| Tipos de cuantizacion | No disponible (solo se distribuye en safetensors, sin cuantización publicada) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; no se especifican capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, que implementa el VLA π₀.₅ de Physical Intelligence. Pi05 es una evolución de π₀, diseñado para generalizar a entornos y situaciones no vistas durante el entrenamiento. La arquitectura interna combina un codificador visual (para procesar imágenes de las cámaras), un codificador de estado (para la posición del robot) y un decodificador de acciones, todo integrado en un modelo de tipo transformer. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, atención, etc.) en la información proporcionada.

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre el dataset `shavvimal/jenga_wall_v3_no_dagger`, que contiene 264 episodios y 118.322 fotogramas a 30 FPS. La configuración de entrenamiento incluye 20.000 pasos, batch size de 4, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de un aprendizaje por imitación supervisado (behavior cloning) sobre demostraciones. El modelo consume tres imágenes RGB de 224x224 píxeles (cámara base, muñeca izquierda y muñeca derecha) y un vector de estado de 32 dimensiones, y produce una acción de 6 dimensiones (probablemente posición y orientación del efector final).

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción de 6 dimensiones para un robot seguidor, basándose en observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de una cámara base y dos cámaras de muñeca (izquierda y derecha), todas a resolución 224x224.
- Aprendizaje por imitación: ha sido entrenado mediante demostraciones para ejecutar una tarea concreta (recoger un bloque y colocarlo en una pared), lo que lo hace adecuado para tareas de apilamiento y manipulación de objetos.
- Integración con LeRobot: se puede ejecutar y entrenar fácilmente mediante las herramientas CLI de LeRobot (`lerobot-rollout`, `lerobot-train`), lo que facilita su uso en entornos de investigación y desarrollo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, ya que no es un modelo de lenguaje general.

## Casos de uso

- Automatización de tareas de apilamiento en entornos industriales: el modelo puede controlar un brazo robótico para recoger piezas de una pila y colocarlas en una posición determinada, como en la construcción de muros o estructuras. Su entrenamiento específico en la tarea Jenga lo hace adecuado para escenarios donde se requiere precisión en la colocación de bloques.
- Investigación en aprendizaje por imitación: sirve como ejemplo de cómo ajustar un VLA base a una tarea concreta con LeRobot, permitiendo a investigadores estudiar la transferencia de habilidades y la generalización en robótica.
- Desarrollo de políticas robóticas para manipulación de objetos: el modelo puede servir como punto de partida para fine-tuning en tareas similares, como recoger y colocar objetos de diferentes formas, siempre que se disponga de un dataset de demostraciones.
- Pruebas de control en robots seguidores (so_follower): al estar entrenado para este tipo de robot, puede utilizarse para validar el funcionamiento de la plataforma robótica y sus cámaras en entornos de laboratorio.
- Educación y demostraciones en robótica: dado su licencia Apache 2.0 y su integración con LeRobot, es útil para cursos y talleres donde se enseña a entrenar y desplegar políticas de manipulación.
- Benchmarking de VLA en tareas de manipulación: aunque no hay resultados publicados, el modelo puede utilizarse como referencia para comparar el rendimiento de diferentes arquitecturas o configuraciones de entrenamiento en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. Por tanto, no se dispone de métricas como tasa de éxito, precisión o comparativas con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- El modelo tiene 4.143.404.816 parámetros, lo que en precisión fp32 requeriría aproximadamente 16,5 GB de VRAM solo para los pesos. En bf16 (formato habitual en entrenamiento) serían unos 8,3 GB. Sin embargo, no se indica el formato de precisión de los pesos safetensors.
- Dado que es un modelo de robótica, la inferencia se realiza típicamente en una GPU conectada al robot. Se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100) para cargar el modelo en fp32, aunque podría caber en GPUs de 12 GB si se usa cuantización (no disponible).
- El despliegue se realiza mediante LeRobot, no mediante vLLM, llama.cpp u Ollama, ya que no es un LLM. Se utiliza el comando `lerobot-rollout` para ejecutar la política en el robot.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo es un ajuste fino de `lerobot/pi05_base`, que es la implementación de LeRobot del VLA π₀.₅ de Physical Intelligence. No se han publicado comparativas con otros VLA como OpenVLA, RT-2 o π₀ en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (recoger un bloque y colocarlo en una pared) y no se ha demostrado que generalice a otras tareas o entornos sin un nuevo fine-tuning.
- No se han proporcionado resultados de evaluación, por lo que se desconoce su tasa de éxito real en el robot.
- Depende de la configuración específica del robot (tipo `so_follower`) y de las cámaras (base, muñeca izquierda y derecha). Cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- Al ser un modelo de imitación, puede heredar sesgos del dataset de demostraciones (por ejemplo, posiciones iniciales de los bloques, iluminación, etc.).
- No se han documentado riesgos de alucinación, ya que no genera texto; sin embargo, en robótica, errores de predicción de acciones pueden causar movimientos inseguros. Se recomienda operar con supervisión humana y en entornos controlados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Pi05) puede tener restricciones adicionales; se debe verificar la licencia del modelo base `lerobot/pi05_base` antes de un despliegue comercial.
- El repositorio no incluye información sobre la precisión de los pesos (fp32, bf16, etc.), lo que puede afectar a la compatibilidad con diferentes GPUs.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shavvimal/pi05_wall_v3_no_dagger)
- [Modelo base `lerobot/pi05_base`](https://huggingface.co/lerobot/pi05_base)
- [Dataset de entrenamiento `shavvimal/jenga_wall_v3_no_dagger`](https://huggingface.co/datasets/shavvimal/jenga_wall_v3_no_dagger)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de entrenamiento de políticas en LeRobot](https://huggingface.co/docs/lerobot/en/il_robots)
- [Referencia CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
