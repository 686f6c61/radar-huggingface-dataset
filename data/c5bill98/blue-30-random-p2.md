# c5bill98/blue-30-random-p2

## Resumen

`c5bill98/blue-30-random-p2` es una política de imitación (policy) para robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador neuronal que, a partir de observaciones visuales y del estado del robot, predice secuencias cortas de acciones articulares ("action chunks") para ejecutar tareas de manipulación aprendidas por demostración.

El modelo lo publica el usuario `c5bill98` y está entrenado sobre el dataset propio `c5bill98/blue-30-random`. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para ejecutarse en el bucle de control de un robot de sobremesa tipo SO-100/SO-101 con una GPU de consumo. Su relevancia es práctica: demuestra el flujo completo de LeRobot para entrenar una política ACT desde cero y desplegarla en hardware asequible.

ACT se describe en el artículo arXiv 2304.13705 como un método de aprendizaje por imitación que predice trozos de acción en lugar de pasos individuales, lo que reduce el error de composición y suele lograr tasas de éxito altas con datos de teleoperación. La ficha se limita a los datos publicados; no hay información sobre composición del dataset, número de episodios ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en cada paso el policy emite un bloque de acciones futuras en lugar de una única acción, lo que mitiga el error acumulado típico de las políticas paso a paso. La arquitectura incluye codificación de las observaciones (imágenes de cámaras y estado de las articulaciones) y un decoder que genera las acciones del robot; los detalles exactos de capas, dimensión oculta y número de cámaras no están publicados en la información disponible.

El entrenamiento se realizó con LeRobot sobre el dataset `c5bill98/blue-30-random`, presumiblemente grabaciones de teleoperación, aunque no se especifican el número de episodios, la composición de las tareas ni si hubo aumentos de datos. No consta información sobre RLHF, DPO ni otras fases de ajuste; ACT es un método puramente supervisado de imitación. Tampoco se documentan innovaciones adicionales más allá del propio chunking de acciones descrito en el paper.

## Capacidades

- Control robótico por imitación: genera trayectorias de acciones articulares a partir de observaciones visuales y del estado del robot.
- Predicción por chunks de acción, que reduce el error de composición en tareas de manipulación.
- Ejecución en robots de sobremesa compatibles con LeRobot, como el SO-100 follower citado en la documentación de evaluación.
- Entrenamiento y evaluación reproducibles mediante los comandos `lerobot-train` y `lerobot-record`.
- Integración con Weights & Biases para el seguimiento del entrenamiento (`--wandb.enable=true`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación de objetos en laboratorio: entrenar una política ACT con demostraciones teleoperadas para tareas de pick-and-place sobre un SO-100, aprovechando el chunking de acciones para obtener movimientos más suaves y estables.
- Prototipado rápido de políticas con LeRobot: usar este checkpoint como referencia de un pipeline completo (dataset, entrenamiento, evaluación) para validar la configuración antes de escalar a tareas propias.
- Investigación en aprendizaje por imitación: servir de baseline reproducible para comparar variantes de ACT, cambios en el dataset o estrategias de aumentación, dado que los pesos y el dataset están publicados.
- Docencia y formación en robótica: desplegar el modelo en un robot de bajo coste para ilustrar el ciclo observación-acción en un curso de robótica o machine learning.
- Evaluación de hardware de consumo: medir latencia y throughput de una política de ~51,7 M de parámetros en GPUs de gama media dentro del bucle de control.
- Reentrenamiento sobre datos propios: partir de la receta y el código de LeRobot documentados para adaptar la política a una nueva tarea o a un nuevo robot seguidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo (el repositorio completo pesa 0,2 GB).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA para el entrenamiento y la evaluación con LeRobot; la documentación de entrenamiento usa `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es la vía documentada por el autor; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| c5bill98/blue-30-random-p2 (ACT) | 51.668.614 | no aplica | no disponible | apache-2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT de LeRobot | no disponible | no aplica | no disponible | según checkpoint | Hugging Face (LeRobot) |
| Políticas Diffusion Policy | no disponible | no aplica | no disponible | según checkpoint | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento ni de especificaciones de alternativas concretas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Es una política de imitación específica para la tarea y el robot del dataset `c5bill98/blue-30-random`; no generaliza a otras tareas, entornos o morfologías sin reentrenamiento.
- No hay información publicada sobre el número de episodios, la variedad de condiciones ni la tasa de éxito, por lo que se desconoce su robustez fuera de la distribución de entrenamiento.
- Riesgo de fallo ante cambios de iluminación, posición de cámara, fondo o variaciones de los objetos no representadas en las demostraciones.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones verbales y no tiene capacidades multilingües.
- No se documentan sesgos, pero al ser un modelo entrenado con datos de teleoperación hereda las limitaciones y posibles sesgos de esas demostraciones.
- Licencia apache-2.0: permite uso comercial y modificación con atribución; conviene revisar las condiciones del dataset asociado antes de reutilizarlo.
- Para producción en robótica real se recomienda validar el modelo con protocolos de seguridad física y evaluación con episodios suficientes antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c5bill98/blue-30-random-p2
- Dataset de entrenamiento: https://huggingface.co/datasets/c5bill98/blue-30-random
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
