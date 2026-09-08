# Kaz55/act-blue-180ep-gs0-ac60

## Resumen

El modelo `act-blue-180ep-gs0-ac60` es una política de control robótico desarrollada por Kaz55 mediante el framework LeRobot. Está diseñada para ejecutar una tarea de manipulación de un cable azul utilizando un brazo robótico UR5e equipado con una pinza DG-5F. Forma parte de un barrido de ablación sistemático en el que se varía únicamente la resolución del sensor táctil GelSight, siendo este modelo el punto de referencia sin sensor táctil.

La arquitectura empleada es ACT (Action Chunking with Transformers), que genera secuencias de acciones de forma autoregresiva. El modelo tiene 51.668.634 parámetros y se entrenó sobre 186 episodios que suman 186.152 frames, con entradas compuestas por el estado del robot y dos imágenes RGB de cámaras RealSense a 640x480. Su relevancia radica en que permite aislar el efecto de la resolución táctil en el rendimiento de la política, aunque el propio autor advierte que los resultados de entrenamiento no muestran diferencias entre resoluciones y que se requiere evaluación en el robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.634 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de política, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, que utiliza un transformer para predecir bloques de acciones (action chunking). En esta configuración, `chunk_size=60` y `n_action_steps=60`, por lo que la política genera 60 pasos de acción de una vez. Las entradas son el vector de estado del robot (`observation.state`, 26 dimensiones) y dos imágenes RGB de cámaras RealSense a 640x480. Los datos de `observation.velocity` y `observation.effort` están presentes en el dataset, pero se excluyen deliberadamente para evitar que el modelo los utilice y romper la ablaación.

El entrenamiento se realizó durante 100.000 pasos, lo que equivale aproximadamente a 4,3 épocas sobre el dataset de 186 episodios, con un tamaño de lote de 8 y semilla 1000. El dataset asociado es `Kaz55/dg5f_ur5e_blue_180ep_gs0`, con 186 episodios y 186.152 frames. Cabe señalar que el nombre del modelo indica 180ep mientras que el dataset contiene 186 episodios, una discrepancia que podría deberse a un error de nomenclatura.

La innovación técnica destacable es el diseño del barrido de ablación: todos los modelos de la serie comparten la misma arquitectura, datos y configuración de entrenamiento, cambiando únicamente la resolución del sensor GelSight (500x375, 320x240, 160x120, 88x66 y ninguno). Esto permite atribuir cualquier diferencia de rendimiento exclusivamente a la resolución táctil.

## Capacidades

- Ejecución de políticas de manipulación robótica de bajo nivel, concretamente la tarea de inserción o manipulación de un cable azul.
- Generación de secuencias de acción de 60 pasos (action chunking) a partir de observaciones del estado del robot y de imágenes RGB.
- Entrada multimodal: combina el vector de estado de 26 dimensiones con dos vistas de cámara RealSense a 640x480.
- Sin capacidades de lenguaje natural: no genera texto, no comprende instrucciones verbales ni responde a prompts.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Sin capacidades de visión semántica: las imágenes se utilizan como entradas de la política, no para clasificación o descripción.
- Sin soporte de agentes ni interacción conversacional.

## Casos de uso

- Investigación en manipulación robótica: el modelo sirve como referencia para estudiar cómo afecta la ausencia de retroalimentación táctil a una tarea de manipulación de cables. Se puede comparar directamente con los otros modelos del barrido de resolución GelSight.
- Ablación de sensores en robótica: este modelo es el punto de control "sin GelSight" en un estudio sistemático. Permite aislar la contribución del sensor táctil al rendimiento de la política.
- Evaluación de políticas de aprendizaje por imitación: investigadores pueden desplegar el modelo en un robot UR5e real para medir tasas de éxito, robustez y capacidad de generalización en la tarea de cable azul.
- Reproducibilidad de experimentos: gracias a la configuración fija (semilla 1000, batch 8, 100.000 pasos), el modelo puede utilizarse para verificar resultados en estudios de aprendizaje por imitación con LeRobot.
- Desarrollo de pipelines de control con LeRobot: sirve como ejemplo de integración de una política ACT entrenada con observaciones de estado y cámaras RGB dentro del ecosistema LeRobot.
- Estudios de generalización: se puede probar el modelo en variaciones de la tarea (posición inicial del cable, iluminación, etc.) para evaluar su robustez ante cambios en el entorno.
- Comparación de arquitecturas de políticas: el modelo puede utilizarse como baseline para comparar ACT con otras arquitecturas de control (por ejemplo, Diffusion Policy) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que, en un barrido relacionado de 180 episodios, la pérdida de entrenamiento final fue de 0,118 en todas las resoluciones, incluida la configuración sin GelSight. Sin embargo, el autor advierte explícitamente que estos números deben usarse solo como una comprobación de sanidad y no como evidencia de que la resolución táctil importa, ya que se requiere evaluación en el robot real. No se disponen de métricas de éxito en robot, tasas de finalización ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 51.668.634 parámetros y ocupa 0,2 GB en disco, lo que sugiere que podría ejecutarse en GPUs de consumo, pero no se han publicado requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPUs de consumo: probable, dado el tamaño reducido del modelo, aunque no está confirmado.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot, normalmente en un sistema robótico físico con un brazo UR5e y cámaras RealSense. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los modelos comparables son los otros puntos del barrido de resolución GelSight del mismo autor y con la misma tarea. Todos comparten arquitectura, dataset y configuración de entrenamiento, y solo difieren en la resolución del sensor táctil.

| Modelo | Resolución GelSight | Parámetros | Rendimiento | Licencia |
|---|---|---|---|---|
| act-blue-180ep-gs500-ac60 | 500x375 | no disponible | no disponible | no disponible |
| act-blue-180ep-gs320-ac60 | 320x240 | no disponible | no disponible | no disponible |
| act-blue-180ep-gs160-ac60 | 160x120 | no disponible | no disponible | no disponible |
| act-blue-180ep-gs88-ac60 | 88x66 | no disponible | no disponible | no disponible |
| act-blue-180ep-gs0-ac60 | ninguno | 51.668.634 | no disponible | no disponible |

También existe otro modelo del mismo autor, `act_cablesort_ebata_chunk_size_53`, con aproximadamente 51,7 millones de parámetros y actualizado recientemente, pero no se dispone de información detallada sobre su configuración ni rendimiento.

## Limitaciones y advertencias

- El modelo es específico para la tarea de cable azul con un UR5e y una pinza DG-5F; no se ha demostrado que generalice a otras tareas ni a otros robots.
- No se ha publicado ninguna evaluación en robot real. La única métrica disponible es la pérdida de entrenamiento, que el propio autor considera insuficiente para extraer conclusiones.
- La pérdida de entrenamiento fue idéntica (0,118) con y sin sensor táctil en un barrido relacionado, lo que sugiere que el modelo podría no estar aprovechando la información táctil. Esto debe tenerse en cuenta al interpretar cualquier resultado.
- El nombre del modelo indica 180ep mientras que el dataset contiene 186 episodios, lo que podría reflejar un error de nomenclatura o una discrepancia en los datos utilizados.
- No se especifica licencia, por lo que el uso comercial, la redistribución o la modificación pueden estar restringidos. Se recomienda contactar con el autor antes de cualquier uso fuera de investigación.
- No es un modelo de lenguaje: no admite prompts de texto, no genera texto ni puede utilizarse en aplicaciones de NLP.
- El dataset de entrenamiento puede contener sesgos inherentes al entorno de recogida de datos, lo que podría afectar al comportamiento del modelo en condiciones diferentes.
- No se documentan límites de contexto, cuantizaciones ni soporte para otras plataformas de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/act-blue-180ep-gs0-ac60
- Dataset asociado: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_blue_180ep_gs0
- Perfil del autor en HuggingFace: https://huggingface.co/Kaz55
