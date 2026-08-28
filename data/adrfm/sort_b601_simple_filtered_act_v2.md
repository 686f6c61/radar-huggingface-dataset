# adrfm/sort_b601_simple_filtered_act_v2

## Resumen

El modelo `adrfm/sort_b601_simple_filtered_act_v2` es una política de robótica basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y precisión en tareas de manipulación robótica. Este modelo concreto se ha entrenado para una tarea de clasificación de discos: recoger discos de un plato gris y colocar el disco negro en el plato rojo y el blanco en el azul, utilizando un robot Seeed B601 con dos cámaras (lateral y de muñeca).

El modelo tiene 51,67 millones de parámetros, un tamaño relativamente pequeño para los estándares actuales, lo que lo hace adecuado para inferencia en hardware modesto. Está publicado bajo licencia Apache-2.0 y los pesos están en formato safetensors. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT a una tarea de manipulación real, demostrando el flujo de trabajo completo de LeRobot: recopilación de datos teleoperados, entrenamiento y despliegue. Aunque no se han publicado resultados de evaluación en el robot, el modelo está listo para ser ejecutado mediante los comandos estándar de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de estado e imágenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (para procesar imágenes de las cámaras) con un transformador que genera secuencias de acciones. En lugar de predecir una sola acción por paso, el modelo predice un "chunk" de acciones futuras, lo que reduce la acumulación de errores y mejora la suavidad del movimiento. La arquitectura concreta de este modelo sigue la implementación de LeRobot, que utiliza un backbone de visión (típicamente ResNet) y un transformador con mecanismos de atención para modelar la dependencia temporal.

El entrenamiento se realizó sobre el dataset `adrfm/sort_b601_simple_filtered`, que contiene 35 episodios y 34.012 frames a 30 FPS, recopilados mediante teleoperación. La configuración de entrenamiento incluye 43.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente de imitación supervisada. La versión de LeRobot utilizada fue la 0.6.2. No se detallan innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 7 dimensiones (posición y orientación del efector final) a partir de observaciones de estado y visión.
- Percepción visual: procesa dos flujos de imagen (cámara lateral y cámara de muñeca) a resolución 480x640, con 3 canales RGB.
- Aprendizaje por imitación: reproduce comportamientos teleoperados, específicamente la tarea de clasificar discos por color.
- Ejecución en tiempo real: diseñado para inferencia en bucle cerrado con el robot Seeed B601, con una frecuencia de control de 30 FPS.
- Integración con LeRobot: compatible con el ecosistema de herramientas de entrenamiento, evaluación y despliegue de LeRobot.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje; su "razonamiento" se limita a la política de control aprendida.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de clasificación de discos en una celda de trabajo fija, sustituyendo la operación manual. Es adecuado porque ACT maneja bien la variabilidad de posición de los objetos dentro del rango visto en el entrenamiento.
- Prototipado rápido de políticas robóticas: al estar integrado con LeRobot, permite a investigadores y desarrolladores entrenar y desplegar políticas en pocos días, usando el flujo de teleoperación y entrenamiento estándar.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del tamaño del dataset, el número de episodios o la arquitectura en tareas de manipulación.
- Benchmarking de hardware robótico: al ser un modelo pequeño (51M parámetros), puede ejecutarse en GPUs de gama baja, lo que facilita comparar el rendimiento de diferentes plataformas robóticas.
- Educación en robótica: permite a estudiantes y aficionados experimentar con un pipeline completo de entrenamiento de políticas sin necesidad de grandes recursos computacionales.
- Desarrollo de sistemas de clasificación automatizada en líneas de producción: aunque el modelo está entrenado para una tarea específica, el mismo enfoque puede adaptarse a otras tareas de clasificación con datos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en el robot ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,67 millones de parámetros, la inferencia requiere aproximadamente 200-400 MB de VRAM en FP32, y menos si se cuantiza. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU para pruebas lentas, aunque no es recomendable para control en tiempo real.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También puede integrarse con frameworks de inferencia como PyTorch directamente.
- Latencia y throughput: no hay datos oficiales, pero dado el tamaño del modelo y la resolución de imagen (480x640), se espera una inferencia en el orden de 10-30 ms en una GPU moderna, suficiente para el control a 30 FPS.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para tareas de clasificación robótica) dentro de los datos proporcionados. La búsqueda web no arrojó modelos equivalentes con los que comparar directamente. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo se entrenó con solo 35 episodios de un único robot y un entorno específico. No generalizará a otras configuraciones de cámara, iluminación, posiciones de objetos o variaciones del robot sin reentrenamiento.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede producir acciones erróneas si las observaciones están fuera de la distribución de entrenamiento (por ejemplo, objetos en posiciones no vistas).
- Limitaciones de contexto: el modelo no tiene memoria de largo plazo; cada predicción se basa en las observaciones actuales y el chunk de acciones, sin estado recurrente.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el dataset de entrenamiento (`adrfm/sort_b601_simple_filtered`) puede tener sus propias condiciones; se debe verificar su licencia antes de uso comercial.
- Caveat para producción: no hay resultados de evaluación en el robot, por lo que la fiabilidad en entornos reales no está demostrada. Se recomienda realizar pruebas exhaustivas antes de cualquier despliegue productivo.
- Dependencia de hardware: el modelo está diseñado para el robot Seeed B601; usarlo en otro robot requeriría adaptar las observaciones y acciones, lo que probablemente degrade el rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/adrfm/sort_b601_simple_filtered_act_v2)
- [Dataset de entrenamiento](https://huggingface.co/datasets/adrfm/sort_b601_simple_filtered)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de entrenamiento de políticas con LeRobot](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de comandos CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
