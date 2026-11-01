# fecasado/gfm-kitchen-pan-22dZ

## Resumen

GFM Kitchen Pan 22dZ es una política robótica entrenada con LeRobot y publicada en HuggingFace por el usuario `fecasado`. A diferencia de los modelos de lenguaje, no genera texto: es un modelo de comportamiento (policy) que aprende a mapear observaciones visuales y de estado del robot a acciones de control motor. Su nombre, `gaze_flow_matching`, indica que utiliza flow matching condicionado por información de mirada (gaze) como método de generación de acciones.

El modelo está entrenado sobre el dataset `fecasado/pan-on-hob-320x240`, que por el nombre corresponde a una tarea de manipulación de una sartén sobre una placa de cocina, con imágenes de 320x240 píxeles. Se distribuye en formato safetensors con 75.242.458 parámetros (aproximadamente 75 millones) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en el rango de políticas de imitación ligeras ejecutables en hardware modesto.

Es relevante como ejemplo de política de imitación basada en flow matching aplicada a robótica de manipulación doméstica, un enfoque que está ganando tracción frente a las políticas de regresión directa o de difusión clásicas. No obstante, la información publicada es muy escasa: la model card es una plantilla sin completar y no se han divulgado detalles de arquitectura, datos de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de imitación con flow matching condicionado por gaze, según el nombre del modelo) |
| Parametros totales | 75.242.458 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. El identificador `gaze_flow_matching` sugiere una política que genera trayectorias de acción mediante flow matching, una familia de modelos generativos que aprenden un campo de velocidad que transporta ruido hacia la distribución de acciones expertas. El condicionamiento por "gaze" implica que la política incorpora información de atención visual o punto de fijación como entrada adicional, presumiblemente para guiar la manipulación hacia regiones relevantes de la escena.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/pan-on-hob-320x240`, con observaciones de 320x240 píxeles. No se especifican el número de episodios, la composición del dataset, el robot empleado (la plantilla de LeRobot menciona `so100_follower` como ejemplo, pero no se confirma que sea el hardware real), ni si hubo aumento de datos o regularización. Tampoco se documenta el proceso de recolección de demostraciones ni el número de tokens o pasos de entrenamiento.

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales y de estado para ejecutar la tarea de colocar o manipular una sartén sobre una placa.
- Política de imitación: aprende de demostraciones humanas registradas en el dataset asociado.
- Condicionamiento por gaze: incorpora señal de mirada o atención visual como entrada, según el nombre del modelo.
- Generación de acciones por flow matching: produce trayectorias de acción continuas mediante muestreo de un campo de velocidad aprendido.
- Integración con LeRobot: compatible con las herramientas `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.

## Casos de uso

- Manipulación de sartén en cocina robotizada: la política ejecuta la secuencia de agarre y colocación de una sartén sobre una placa, entrenada específicamente para esa tarea con imágenes de 320x240. Es adecuada porque el dataset y la política están alineados con ese escenario concreto.
- Investigación en políticas de imitación con flow matching: sirve como referencia reproducible para comparar flow matching frente a ACT o diffusion policies en una tarea de manipulación real, dado que se publica con licencia Apache 2.0 y formato LeRobot.
- Evaluación de condicionamiento por gaze: permite estudiar si la señal de mirada mejora la precisión en tareas de precisión espacial como colocar un objeto en una posición concreta.
- Prototipado en robots de bajo coste: con 75 millones de parámetros y 0,3 GB de pesos, puede desplegarse en estaciones con GPU de consumo para pruebas de laboratorio.
- Reproducción de experimentos de LeRobot: el modelo se puede recargar con `lerobot-record --policy.path` para replicar la evaluación sobre el robot `so100_follower` u otro compatible.
- Base para fine-tuning en tareas domésticas similares: al ser una política ligera y con licencia permisiva, puede servir como inicialización para tareas de cocina relacionadas con el mismo tipo de sensor y efector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 75 millones de parámetros en precisión FP32 los pesos ocupan aproximadamente 0,3 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM libre, incluyendo las integradas de gama alta.
- GPU recomendadas: no hay recomendación oficial. Por tamaño, una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para los pesos; el cuello de botella será el preprocesado de imágenes y la frecuencia de control, no la memoria.
- Cabe en GPU de consumo: sí, con gran margen, dado el tamaño del repositorio (0,3 GB).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch en CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. Dependerán del robot, de la frecuencia de control y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GFM Kitchen Pan 22dZ | 75,2 M | no aplica | Manipulación de sartén (gaze + flow matching) | Apache 2.0 | HuggingFace, LeRobot |
| ACT (Action Chunking Transformer) | no disponible | no aplica | Políticas de imitación generales | MIT (repo LeRobot) | Repo LeRobot |
| Diffusion Policy | no disponible | no aplica | Políticas de imitación con difusión | MIT (repo original) | Repo original |
| Modelos comparables específicos de la misma tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos públicos de rendimiento para establecer una comparación cuantitativa con ACT o Diffusion Policy en esta tarea concreta.

## Limitaciones y advertencias

- Model card incompleta: la plantilla no se ha rellenado, por lo que faltan arquitectura, datos de entrenamiento, hiperparámetros y evaluación.
- Especialización extrema: la política está entrenada para una única tarea (sartén sobre placa) y un único dataset; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sin evaluación publicada: no hay métricas de éxito, tasas de error ni comparaciones, lo que impide valorar su fiabilidad en producción.
- Dependencia del hardware: el rendimiento depende del robot, la cámara y la calibración; no se confirma el robot objetivo (la plantilla menciona `so100_follower` solo como ejemplo).
- Riesgo de sobreajuste al entorno de recogida: cambios de iluminación, fondo o posición de la placa pueden degradar el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe usarse para tareas de texto, código o agentes conversacionales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sesgos: no documentados; en robótica de imitación, los sesgos provienen de las demostraciones y pueden reflejar posiciones, velocidades o estrategias concretas del operador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-kitchen-pan-22dZ
- Dataset asociado: https://huggingface.co/datasets/fecasado/pan-on-hob-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
