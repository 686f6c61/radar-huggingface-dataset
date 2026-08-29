# Kaz55/act-mixed-270ep-4cam-ac60

## Resumen

El modelo `Kaz55/act-mixed-270ep-4cam-ac60` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), publicada en el paper arXiv:2304.13705. Ha sido entrenada por el usuario Kaz55 utilizando la librería LeRobot de Hugging Face, sobre un dataset de teleoperación de un brazo robótico UR5e (`Kaz55/dg5f_ur5e_mixed_270ep`) con 270 épocas y 4 cámaras. El sufijo `ac60` indica que la política predice chunks de 60 acciones por paso, una característica distintiva de ACT que mejora la estabilidad del control en tareas de manipulación.

Con aproximadamente 51,7 millones de parámetros, el modelo es ligero y está diseñado para ejecutarse en tiempo real en hardware modesto. Su relevancia radica en que demuestra cómo el aprendizaje por imitación con transformers puede aplicarse a tareas robóticas reales con datasets relativamente pequeños, y su licencia Apache 2.0 permite su uso tanto en investigación como en aplicaciones comerciales. El repositorio incluye los pesos en formato safetensors y se integra directamente con el ecosistema LeRobot para entrenamiento y evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer encoder-decoder |
| Parametros totales | 51.668.634 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir secuencias de acciones (chunks) en lugar de acciones individuales. El encoder procesa las observaciones visuales de las cámaras junto con el estado del robot, y el decoder autoregresivo genera un chunk de acciones futuras que se ejecutan de forma abierta sin re-planificación. Esta estrategia reduce la acumulación de errores y mejora la suavidad del movimiento, según el paper original.

El entrenamiento se realizó con el framework LeRobot sobre un dataset de teleoperación de un brazo UR5e con 4 cámaras, con 270 épocas. No se especifican detalles adicionales como el número total de episodios, la composición exacta del dataset o si se aplicaron técnicas de aumento de datos. Tampoco hay información sobre el uso de RLHF, DPO u otros métodos de optimización posteriores al entrenamiento supervisado de imitación.

## Capacidades

- Control robótico de precisión: predice acciones de articulación (posiciones, velocidades o esfuerzos) para un brazo UR5e.
- Percepción visual multicámara: integra observaciones de 4 cámaras para entender el entorno de trabajo.
- Ejecución de tareas de manipulación: capaz de realizar tareas como recogida y colocación, ensamblaje o manipulación de cables (según los nombres de otros modelos del mismo autor).
- Inferencia en tiempo real: gracias a su tamaño reducido, puede ejecutarse a frecuencias de control adecuadas para robótica.
- Sin capacidades de lenguaje: no procesa texto ni instrucciones verbales; es exclusivamente un modelo de visión-acción.

## Casos de uso

- Automatización de tareas repetitivas en entornos industriales: el modelo puede controlar un brazo UR5e para tareas de pick-and-place en líneas de montaje, reduciendo la necesidad de programación explícita de trayectorias.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre diferentes entornos o robots, o para comparar con otros métodos como Diffusion Policy.
- Manipulación de cables y componentes flexibles: según los modelos relacionados del mismo autor, ACT puede aplicarse a tareas que requieren manejar objetos deformables, un reto clásico en robótica.
- Prototipado rápido de células de trabajo: con LeRobot, se puede entrenar una política con pocas demostraciones teleoperadas y desplegarla en un robot real en menos de un día.
- Educación y formación en robótica: al ser un modelo pequeño y con licencia abierta, es adecuado para laboratorios docentes que quieran experimentar con aprendizaje por imitación sin grandes recursos computacionales.
- Benchmarking de algoritmos de control: su disponibilidad pública permite utilizarlo como referencia para comparar nuevas arquitecturas o métodos de entrenamiento en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como tasas de éxito en tareas específicas, ni comparaciones con otros modelos en el repositorio de Hugging Face. Para obtener datos de rendimiento sería necesario ejecutar evaluaciones propias con el robot o en simulación, siguiendo el procedimiento indicado en la model card con `lerobot-record`.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros en fp32 (aproximadamente 207 MB), la inferencia cabe en cualquier GPU moderna con al menos 2 GB de VRAM. En cuantización fp16 o int8, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una GTX 1050 Ti hasta una RTX 4090. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y evaluación; se puede integrar con ROS o controladores propietarios del robot. No se menciona soporte para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay datos publicados. Para un modelo de este tamaño, se espera una latencia de inferencia inferior a 10 ms en GPU moderna, suficiente para control en tiempo real a 100 Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Kaz55/act-mixed-270ep-4cam-ac60 | 51,7 M | no disponible | Manipulación UR5e, 4 cámaras | Apache 2.0 |
| Kaz55/act-cable3sizes-90ep-4cam-ac60 | no disponible | no disponible | Manipulación de cables, 4 cámaras | Apache 2.0 |
| Kaz55/act-newcable-combined-4cam-chunk60 | no disponible | no disponible | Manipulación de cables, 4 cámaras | Apache 2.0 |

Los tres modelos son del mismo autor y comparten la arquitectura ACT y el uso de 4 cámaras. El modelo aquí descrito se distingue por haber sido entrenado con 270 épocas sobre un dataset mixto (`mixed`), mientras que los otros usan datasets específicos de cables con menos épocas. No se dispone de datos comparativos de rendimiento entre ellos. No se han encontrado modelos de terceros con especificaciones equivalentes en el momento de la consulta.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo fue entrenado exclusivamente con demostraciones teleoperadas de un UR5e en un entorno concreto. Puede no generalizar a otros robots, configuraciones de cámaras o escenarios diferentes.
- Riesgo de acciones erróneas: como todo modelo de imitación, puede producir acciones incorrectas o inseguras si se encuentra con observaciones fuera de la distribución de entrenamiento. Debe usarse con supervisión en entornos reales.
- Sin capacidad de razonamiento simbólico: no entiende instrucciones de alto nivel ni puede planificar tareas complejas; solo reproduce comportamientos aprendidos.
- Contexto temporal limitado: la longitud del contexto no está documentada, pero ACT usa una ventana de observaciones fija; no es adecuado para tareas que requieran memoria a largo plazo.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe cumplir con los términos de atribución y no utilizar marcas registradas.
- Estado del proyecto: el modelo tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal sin validación externa. No hay garantías de soporte o mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaz55/act-mixed-270ep-4cam-ac60
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_mixed_270ep
