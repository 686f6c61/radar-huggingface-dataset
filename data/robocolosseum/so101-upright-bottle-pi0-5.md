# RoboColosseum/so101-upright-bottle-pi0.5

## Resumen

`RoboColosseum/so101-upright-bottle-pi0.5` es un fine-tuning del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, adaptado a LeRobot y especializado en una única tarea robótica: recoger un bote de zumo caído y dejarlo de pie sobre la mesa. El modelo parte del checkpoint base `lerobot/pi05_base` y se ha entrenado sobre el dataset `Jiamo0912/so101-upright-bottle`, compuesto por 100 episodios y 35.934 fotogramas a 30 FPS, capturados con un robot `so_follower` (SO-101) equipado con dos cámaras (frontal y de muñeca).

Con 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) y un repositorio de 49 GB, no es un modelo de lenguaje generalista sino una política de imitación que consume observaciones multimodales (estado articular de 6 dimensiones e imágenes de 480×640 y 224×224) y emite comandos de acción de 6 dimensiones. Su relevancia radica en que demuestra el flujo completo de fine-tuning de π₀.₅ en LeRobot 0.6.1 sobre hardware asequible de tipo SO-101, un brazo robótico de bajo coste ampliamente usado en la comunidad.

La licencia Apache 2.0 facilita su reutilización, aunque el modelo está altamente especializado y no ha publicado resultados de evaluación en robot real, por lo que su utilidad práctica queda limitada al escenario concreto para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo emite acciones, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀.₅ (Pi05), un modelo visión-lenguaje-acción de Physical Intelligence diseñado para generalización en entornos abiertos y que evoluciona π₀. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La política consume tres flujos visuales (`observation.images.front` y `observation.images.wrist` a 480×640, más `observation.images.empty_camera_0` a 224×224) junto con el estado articular de 6 dimensiones (`observation.state`), y produce un vector de acción también de 6 dimensiones. El robot objetivo es `so_follower` (SO-101) con cámaras frontal y de muñeca.

El entrenamiento se realizó con LeRobot 0.6.1 durante 40.000 pasos, con batch size de 16, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000. El dataset de fine-tuning contiene 100 episodios y 35.934 fotogramas a 30 FPS para la tarea "Pick up the fallen juice bottle and stand it upright on the table". No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset base de π₀.₅, ni si se aplicaron fases de RLHF o DPO; tampoco se detalla ninguna innovación técnica adicional más allá de las propias de π₀.₅ descritas en el blog de Physical Intelligence.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo SO-101 (`so_follower`) a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (frontal y de muñeca) a 480×640 y una tercera vista a 224×224.
- Ejecución de una tarea de manipulación concreta: recoger un bote de zumo caído y colocarlo de pie sobre la mesa.
- Política de imitación entrenada por comportamiento clonado sobre demostraciones humanas (100 episodios).
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No dispone de capacidades de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, agentes multi-paso ni procesamiento de audio, según la información disponible.
- Capacidades multilingües: no aplicables; el modelo no produce lenguaje natural.

## Casos de uso

- Manipulación de objetos caídos en laboratorio: el modelo se usa para que un SO-101 recoja un bote de zumo tumbado y lo deje vertical, aprovechando las dos cámaras para localizar el objeto y planificar la pinza.
- Reproducción de experimentos de imitación: sirve como referencia para validar pipelines de fine-tuning de π₀.₅ en LeRobot, ya que el repositorio documenta la configuración exacta de entrenamiento (40k pasos, batch 16, lr 2,5e-05).
- Base para nuevos fine-tunings: al estar entrenado sobre `lerobot/pi05_base` y licenciado Apache 2.0, puede servir de punto de partida para tareas similares de recogida y colocación con el mismo robot.
- Docencia y formación en robótica de imitación: permite a estudiantes ejecutar una política VLA real sobre hardware SO-101 de bajo coste y observar el comportamiento en `lerobot-rollout`.
- Evaluación de robustez de políticas VLA: útil para medir cómo se degrada una política especializada ante cambios de iluminación, posición del objeto o distracciones, aunque el autor no haya publicado dicha evaluación.
- Benchmark interno de hardware: al tener un tiempo de inferencia y un consumo de VRAM asociados a ~4,1 B parámetros, puede emplearse para comparar latencias entre GPUs y configuraciones de despliegue en robótica.
- Automatización de tareas de ordenación en entornos controlados: integrable en una celda robotizada donde la tarea de enderezar objetos sea recurrente y las condiciones de captura estén estabilizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de ~4,1 B parámetros en precisión completa (fp32) requeriría del orden de 16,6 GB solo para pesos, y en bf16/fp16 unos 8,3 GB, sin contar activaciones ni buffers de las cámaras; estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por el tamaño de parámetros, es plausible en GPUs con 16-24 GB de VRAM en precisión reducida, pero no hay validación publicada.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path` apuntando al repositorio; el flujo de entrenamiento usa `lerobot-train` con `--policy.device=cuda`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RoboColosseum/so101-upright-bottle-pi0.5` | ~4,1 B | no disponible | Enderezar bote con SO-101 | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/pi05_base` | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| `tsangb34/pi05-so101-upright-bottle-vlareplica-40k` | no disponible en la información | no disponible | Tarea idéntica (referenciada en la model card) | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a linaje, tarea y licencia.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Pick up the fallen juice bottle and stand it upright on the table") y un único robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: el autor no reporta tasa de éxito ni número de ensayos en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de las cámaras: las claves de observación (`front`, `wrist`, `empty_camera_0`) deben coincidir exactamente con las usadas en entrenamiento; un montaje distinto invalida la política.
- Riesgo de sobreajuste al dataset: 100 episodios y 35.934 fotogramas son un volumen reducido; es probable que el modelo sea sensible a cambios de iluminación, posición inicial del objeto o fondo.
- Sesgos conocidos: no documentados por el autor; en robótica de imitación los sesgos provienen de las demostraciones y del entorno de captura.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la licencia del modelo base `lerobot/pi05_base` y de los datos de entrenamiento antes de un despliegue comercial.
- Idiomas: no aplica; el modelo no procesa ni genera lenguaje natural.
- Repositorio de 49 GB: requiere espacio de almacenamiento considerable y tiempos de descarga largos.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/so101-upright-bottle-pi0.5
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/so101-upright-bottle
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-upright-bottle
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible como enlace directo en la información proporcionada
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Variante relacionada citada en la model card: https://huggingface.co/tsangb34/pi05-so101-upright-bottle-vlareplica-40k
