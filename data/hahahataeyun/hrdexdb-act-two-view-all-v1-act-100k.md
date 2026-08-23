# hahahataeyun/hrdexdb-act-two-view-all-v1-act-100k

## Resumen

El modelo `hahahataeyun/hrdexdb-act-two-view-all-v1-act-100k` es una política de aprendizaje por imitación basada en la arquitectura ACT (Action Chunking with Transformers), entrenada con la librería LeRobot sobre el dataset HRDexDB. Está diseñada para controlar un brazo robótico xArm6 equipado con una mano diestra Allegro Hand, a partir de dos cámaras fijas sincronizadas. El modelo predice secuencias de acciones de 25 dimensiones (posición TCP, rotación SO(3) proyectada desde rotación-6D y los 16 comandos nativos de la mano Allegro) que deben ser decodificadas y filtradas por comprobaciones de seguridad antes de comandar el hardware real.

La relevancia de este modelo reside en que forma parte de los primeros intentos de aplicar ACT sobre el dataset HRDexDB, un dataset pionero que captura manipulaciones diestras pareadas entre humanos y robots. Aunque el modelo no ha sido validado con un conjunto de test disjunto por objetos ni con despliegue en robot real, sirve como baseline reproducible para la comunidad de robótica de aprendizaje. Con 51,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.653.273 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión-acción, no de texto) |
| Tipos de cuantización | no disponible (pesos en fp32/fp16) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer de codificador-decodificador diseñada para aprendizaje por imitación en robótica. El codificador procesa las observaciones (dos imágenes de cámaras fijas con identificadores `23029839` y `25452066`) y un vector de estado de 22 dimensiones. El decodificador genera una secuencia de acciones de tamaño `chunk` (en este caso 50 pasos) de forma autorregresiva, con una estrategia de ejecución de 10 pasos por cada acción generada (rollout action steps).

El entrenamiento se realizó durante 100.000 pasos con un batch size de 16 y semilla 1000, alcanzando una pérdida final de 0,118. El dataset de entrenamiento es `hahahataeyun/hrdexdb-act-two-view-all-v1`, que forma parte de HRDexDB, un conjunto de datos con más de 2.100 secuencias de manipulación diestra sobre más de 100 objetos y 5 morfologías de mano, capturadas con un sistema de 23 cámaras sincronizadas. Este modelo fue entrenado sobre todas las categorías de objetos válidas del dataset.

## Capacidades

- Control robótico de manipulación diestra: el modelo genera comandos de 25 dimensiones para el brazo xarm6 y la mano Allegro, incluyendo posición TCP, orientación SO(3) y comandos nativos de los 16 actuadores de la mano.
- Percepción visual multi-cámara: procesa dos vistas fijas simultáneamente para generar acciones condicionadas al estado observado.
- Aprendizaje por imitación: reproduce trayectorias de manipulación aprendidas de demostraciones humanas y robóticas parejas.
- Sin capacidades de lenguaje: no es un modelo de texto ni admite prompts en lenguaje natural; su entrada es exclusivamente visual y de estado.
- Sin tool calling ni agentes: su ámbito se limita a la generación de acciones motoras de bajo nivel.

## Casos de uso

- Investigación en aprendizaje por imitación cross-embodiment: permite estudiar la transferencia de habilidades entre humanos y robots de mano diestra, ya que fue entrenado sobre el dataset HRDexDB que captura manipulaciones parejas.
- Desarrollo de políticas de manipulación para manos diestras: sirve como baseline para entrenar y comparar nuevas arquitecturas de control sobre el mismo dataset.
- Evaluación de generalización por objetos: el modelo no ha sido validado con un test disjunto de objetos, por lo que puede usarse para estudiar la generalización a categorías no vistas.
- Prototipado de sistemas de teleoperación: al generar acciones de 25D, puede integrarse en pipelines de teleoperación que requieran decodificar la salida a TCP, SO(3) y comandos de la mano.
- Generación de datos sintéticos para entrenamiento: las predicciones pueden usarse para ampliar datasets de entrenamiento de otras políticas.
- Benchmarking de arquitecturas de aprendizaje por imitación: sirve como referencia para comparar ACT con otras arquitecturas (diffusion policies, etc.) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una pérdida final de entrenamiento de 0,118, pero no hay métricas de éxito en tareas, ni comparativas con otros modelos en el entorno de evaluación.

## Requisitos de hardware

- Inferencia ligera: con 51,6 millones de parámetros, el modelo cabe holgadamente en cualquier GPU consumer (por ejemplo, RTX 3060 con 6 GB o superior) y también en CPU para inferencia puntual.
- VRAM estimada: menos de 2 GB en fp32 para los pesos; las dos imágenes de entrada y el procesamiento transformer no requieren más de 4-6 GB en total.
- GPU recomendada: NVIDIA RTX 3060/4060 o superior para inferencia en tiempo real; para entrenamiento se recomienda al menos una RTX 3090 o A100 si se quiere reentrenar sobre el dataset completo.
- Opciones de despliegue: LeRobot (librería nativa), Hugging Face Hub para carga de pesos, y despliegue en ROS 2 con los controladores de xArm6 y Allegro Hand.
- Latencia: no se ha medido en la información disponible; se estima un throughput de decenas de Hz en GPU moderna, aunque no es un dato oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otras políticas de manipulación diestra sobre el mismo dataset. La comparación más relevante sería contra otros checkpoints de ACT entrenados sobre HRDexDB (por ejemplo, variantes con una sola cámara, o con un solo tipo de mano), pero no se han publicado resultados de dichas variantes en la información disponible. En términos de arquitectura, es un ACT estándar sin modificaciones respecto a la implementación de LeRobot.

## Limitaciones y advertencias

- El modelo no ha sido validado con un test set disjunto de objetos ni con un despliegue en robot real. No se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Las acciones de 25D deben ser decodificadas y comprobadas con verificaciones de espacio de trabajo, límites de velocidad, límites de articulaciones y colisiones antes de comandar el hardware real. No se debe enviar directamente las predicciones a los actuadores.
- La licencia no está especificada en la model card, por lo que el uso comercial no está claramente permitido.
- No se conocen los datos de entrenamiento exactos (composición del dataset, número de secuencias por categoría), lo que limita la evaluación de sesgos.
- El modelo fue entrenado con dos cámaras fijas específicas (`23029839` y `25452066`); cambiar la configuración de cámaras requiere reentrenamiento o adaptación.
- No se ha reportado el rendimiento en tareas de generalización a objetos no vistos, lo cual es crítico para aplicaciones reales.
- No tiene capacidades de texto, ni tool calling, ni agentes; es exclusivamente un modelo de visión-acción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hahahataeyun/hrdexdb-act-two-view-all-v1-act-100k
- Dataset HRDexDB: https://huggingface.co/datasets/hahahataeyun/hrdexdb
- Página del proyecto HRDexDB: https://snuvclab.github.io/HRDexDB/
- Repositorio GitHub de HRDexDB: https://github.com/snuvclab/HRDexDB
- Paper de HRDexDB (arXiv): https://arxiv.org/html/2604.14944
