# ciaociao0617/aloha-act-100k

## Resumen

El modelo `ciaociao0617/aloha-act-100k` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario ciaociao0617 y publicada en Hugging Face mediante la librería LeRobot. Está diseñada para controlar un robot bimanual ALOHA en la tarea de inserción de una clavija en un enchufe (peg insertion) dentro de un entorno simulado. ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación.

El modelo cuenta con aproximadamente 51,7 millones de parámetros y se ha entrenado con 50 episodios de teleoperación humana (25 000 frames a 50 FPS) del dataset `lerobot/aloha_sim_insertion_human`. Su relevancia radica en que es un ejemplo reproducible y de código abierto de una política de imitación para robótica, con licencia Apache 2.0, y sirve como referencia para desarrolladores que deseen entrenar y desplegar políticas similares con LeRobot. No es un modelo de lenguaje ni de visión general; su entrada es una imagen de cámara superior (480×640) y el estado del robot (14 dimensiones), y su salida es un vector de acción de 14 dimensiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51 685 006 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de visión y estado, no de lenguaje) |
| Tipos de cuantización | No disponible (no se especifican) |
| Idiomas soportados | No aplica (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). Se trata de un transformer que combina un codificador de visión (procesa la imagen de la cámara superior) con una representación del estado del robot, y genera un chunk de acciones futuras de longitud fija. El entrenamiento se realizó mediante aprendizaje por imitación supervisado sobre datos de teleoperación, sin técnicas de RLHF ni DPO. La configuración de entrenamiento incluye 100 000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, usando la versión 0.6.1 de LeRobot. No se dispone de información sobre la composición del dataset más allá de la tarea específica de inserción de clavija, que consta de 50 episodios y 25 000 frames.

## Capacidades

- Control de un robot bimanual ALOHA en la tarea de inserción de clavija en un enchufe, en un entorno simulado.
- Procesa observaciones multimodales: una imagen RGB de cámara superior (480×640) y un vector de estado del robot de 14 dimensiones.
- Genera acciones de control de 14 dimensiones (posiciones o esfuerzos articulares).
- Predicción de chunks de acción (múltiples pasos a la vez) para mayor fluidez y precisión.
- Capacidad de ejecutar la política en tiempo real con LeRobot mediante `lerobot-rollout`.
- No soporta tool calling, razonamiento multi-paso, ni capacidades de lenguaje, visión o audio fuera del dominio robótico.

## Casos de uso

- **Automatización de tareas de ensamblaje en simulación**: el modelo puede controlar un robot ALOHA para insertar clavijas en enchufes, una operación típica en líneas de montaje. Su predicción de chunks de acción reduce la jitter y mejora la repetibilidad.
- **Evaluación de políticas de imitación en robótica**: sirve como punto de partida para comparar métodos de aprendizaje por imitación en el entorno de simulación ALOHA, ya que está entrenado en un dataset estándar.
- **Prototipado rápido en investigación**: los desarrolladores pueden cargar el modelo en LeRobot y ejecutar rollouts en simulación para validar algoritmos de control o de planificación.
- **Entrenamiento de políticas para robots reales**: aunque este modelo es simulado, puede usarse como referencia para transferir políticas a hardware real mediante adaptación de dominio.
- **Estudio de generalización de políticas**: al estar entrenado solo en una tarea específica, es útil para investigar cómo los modelos ACT generalizan a nuevas configuraciones o perturbaciones.
- **Pruebas de integración con LeRobot**: dado que el modelo es parte del ecosistema LeRobot, es útil para verificar la correcta instalación y funcionamiento de la librería en un entorno de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito ni comparaciones con otros modelos.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación del modelo. Dado que el modelo tiene 51,7 millones de parámetros y procesa imágenes, se recomienda al menos una GPU con 8 GB de VRAM para inferencia en tiempo real, aunque no hay datos oficiales. El despliegue se realiza a través de LeRobot, que soporta CUDA. Para ejecutar el rollout en un robot real, se necesita el hardware ALOGA (brazos, cámaras) además de la GPU. No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

Existen otros modelos ACT entrenados con LeRobot en Hugging Face, como `Bernard2357/lerobot-aloha-act-model` o `C6thunder/act_push`, pero no se dispone de sus especificaciones técnicas en la información proporcionada. Por tanto, no se puede realizar una comparativa numérica. La comparativa con otros métodos de robótica (p.ej., Diffusion Policy) no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de inserción de clavija en un entorno simulado específico; no generaliza a otras tareas o entornos sin reentrenamiento.
- No es un modelo de lenguaje ni de visión general; su entrada y salida están restringidas al dominio robótico.
- No se han reportado evaluaciones en robot real, por lo que su rendimiento en hardware físico es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar los términos de los datasets y componentes subyacentes.
- El modelo fue creado con una fecha futura (2026-08-19) según el registro de Hugging Face, lo que puede indicar una fecha de publicación no estándar o un error; se recomienda verificar la integridad del repositorio antes de usarlo en producción.
- El tamaño del repositorio (6.2 GB) es considerable para un modelo de 51,7 M de parámetros, probablemente debido a los pesos en safetensors y archivos de configuración; se debe considerar el espacio de almacenamiento.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/ciaociao0617/aloha-act-100k)
- [Paper original de ACT (arXiv)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento `lerobot/aloha_sim_insertion_human`](https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de código ALOHA (teleoperación)](https://github.com/tonyzhaozh/aloha)
