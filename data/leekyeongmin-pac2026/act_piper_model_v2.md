# leekyeongmin-pac2026/act_piper_model_v2

## Resumen

act_piper_model_v2 es una política de robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario leekyeongmin-pac2026 en HuggingFace. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que aprende de datos de teleoperación y predice secuencias cortas de acciones ("chunks") en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso. Está entrenado y distribuido mediante la librería LeRobot de HuggingFace, con pesos en formato safetensors y pipeline declarado como `robotics`.

El modelo tiene 51.670.663 parámetros totales y un repositorio de 0,2 GB, lo que lo sitúa en el rango de política ligera, apta para ejecutarse en hardware de consumo. Se entrenó sobre el dataset `leekyeongmin-pac2026/piperdataset_4`, asociado presumiblemente a un brazo robótico Piper, y sigue la implementación de ACT descrita en el artículo arXiv 2304.13705. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución propias de esa licencia.

Su relevancia es acotada pero concreta: es un ejemplo de política entrenada de extremo a extremo con un pipeline reproducible (entrenamiento, evaluación y despliegue vía `lerobot-train` y `lerobot-record`). No es un modelo fundacional: no generaliza a tareas arbitrarias ni a otros robots sin reentrenamiento, y no hay datos publicados sobre su tasa de éxito. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

Datos adicionales: librería `lerobot`, pipeline `robotics`, dataset de entrenamiento `leekyeongmin-pac2026/piperdataset_4`, referencia bibliográfica arXiv 2304.13705, región declarada `us`. Descargas: 0. Likes: 0. Fecha de creación: 2026-10-09.

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un encoder visual, un transformer encoder-decoder y un cuello de botella variacional (CVAE) que modela la variabilidad de las demostraciones humanas. La innovación principal es el *action chunking*: en lugar de predecir una única acción por paso de control, el modelo predice un bloque de k acciones futuras, lo que reduce el horizonte efectivo de decisión y mitiga el problema de *compounding error* de las políticas autorregresivas clásicas. El modelo card remite al artículo 2304.13705 para la descripción completa del método.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset `piperdataset_4`, el número de episodios de teleoperación, la resolución de las cámaras de entrada, el horizonte de chunk configurado ni si hubo fases de ajuste adicionales (RLHF, DPO u otras, poco habituales en robótica de imitación). Tampoco se especifica el backbone visual empleado. Todos estos datos constan como no disponibles. El ejemplo de evaluación incluido en la model card referencia un robot `so100_follower`, mientras que el dataset asociado se denomina `piperdataset_4`; esta discrepancia no queda aclarada en la información disponible y conviene verificarla contra el dataset antes de cualquier despliegue.

## Capacidades

- Generación de comandos motores: produce secuencias de acciones de control a partir de observaciones (imágenes y, presumiblemente, estado del robot).
- Aprendizaje por imitación: reproduce políticas aprendidas de demostraciones teleoperadas, no de recompensas ni de instrucciones en lenguaje natural.
- Predicción por chunks de acciones: emite bloques de acciones en lugar de pasos individuales, con el consiguiente aumento de estabilidad temporal.
- Ejecución en bucle cerrado: al integrarse con LeRobot, funciona como política de control en tiempo real durante la operación del brazo.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso simbólico, al no ser un modelo de lenguaje.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.
- No se documentan capacidades de visión de propósito general (VQA, detección abierta, segmentación), más allá del uso de observaciones visuales como entrada de política.

## Casos de uso

- Manipulación robótica de un brazo Piper en tareas repetitivas: el modelo se despliega con `lerobot-record --policy.path=<repo>` y ejecuta la política entrenada para tareas de pick-and-place aprendidas del dataset `piperdataset_4`.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar ACT contra otras políticas (Diffusion Policy, SmolVLA) sobre el mismo dataset, dado que el pipeline de LeRobot estandariza entrenamiento y evaluación.
- Reentrenamiento con datos propios: cualquier equipo con un brazo teleoperado puede clonar el repositorio, sustituir el dataset y lanzar `lerobot-train --policy.type=act` para obtener una política específica de su tarea, usando esta como referencia de hiperparámetros.
- Evaluación comparativa de hardware de bajo coste: al tener 51,7 M de parámetros, permite medir latencia de inferencia y frecuencia de control en GPUs de consumo o incluso en CPU, útil para decidir si un setup embebido es viable.
- Docencia y prototipado en robótica: por su tamaño reducido y su licencia permisiva, es adecuado para cursos y talleres donde se enseñe el ciclo completo de teleoperación, entrenamiento y despliegue.
- Base para *fine-tuning* en tareas de manipulación fina: el chunking de acciones resulta adecuado para tareas que requieren precisión temporal (ensartar, insertar, apilar), siempre que se disponga de demostraciones suficientes.
- Validación de pipelines de datos: permite verificar la calidad de un dataset de teleoperación antes de invertir en modelos mayores, ya que ACT es sensible a la coherencia de las demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas. Los resultados de la búsqueda web no contienen información relevante sobre este modelo ni sobre el artículo asociado, por lo que no se puede completar esta sección con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB en precisión fp32 para los 51,67 M de parámetros; alrededor de 0,10 GB en fp16. Con los buffers de activaciones y el backbone visual (no especificado), el consumo real será superior, pero previsiblemente inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia (GTX 1650, RTX 3050, RTX 4090, A100, H100). Para entrenamiento, se recomienda una GPU con 12 GB o más (RTX 3060 12 GB, RTX 4090, A100) y, preferiblemente, una unidad CUDA dedicada.
- Cabe en GPU de consumo: sí, con holgura. También es plausible su ejecución en CPU para inferencia a baja frecuencia, aunque no hay datos publicados de latencia que lo confirmen.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) es el camino documentado. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput estimados: no disponibles. La frecuencia de control alcanzable depende del hardware, de la resolución de entrada y del horizonte de chunk, ninguno de los cuales se especifica en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_piper_model_v2 | 51,67 M | No disponible | Apache 2.0 | HuggingFace (LeRobot) |
| ACT original (arXiv 2304.13705) | No disponible en la informacion proporcionada | Chunking de acciones | No disponible | Repositorio de los autores |
| Diffusion Policy | No disponible | Prediccion por difusion de trayectorias | No disponible | Publicaciones y repositorios de los autores |
| SmolVLA | No disponible | Politica VLA con componente de lenguaje | No disponible | HuggingFace (LeRobot) |

No se dispone de datos de rendimiento comparativos en la información proporcionada, por lo que la comparación se limita a aspectos de disponibilidad y licencia. Cualquier afirmación sobre superioridad o equivalencia de rendimiento sería especulativa.

## Limitaciones y advertencias

- Modelo específico de tarea: no generaliza a robots, morfologías o tareas distintos del dataset de entrenamiento sin reentrenamiento completo.
- Sin métricas publicadas: no hay tasa de éxito, número de episodios ni condiciones de evaluación documentadas, por lo que no se puede estimar su fiabilidad en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de redactar la ficha, lo que implica ausencia de validación externa y de informes de terceros.
- Posible inconsistencia de plataforma: la model card usa `so100_follower` en el ejemplo de evaluación, mientras que el dataset se denomina `piperdataset_4`. Conviene verificar la configuración real del robot antes de desplegar.
- Riesgo de sobreajuste: al tratarse de una política de imitación entrenada sobre un dataset concreto, es probable que el rendimiento caiga fuera de la distribución de las demostraciones (iluminación, posiciones de objeto, ruido de sensores).
- Alucinación en sentido estricto no aplica, pero sí existe riesgo de acciones erráticas o inseguras cuando el estado observado se aleja del visto durante el entrenamiento; se recomienda operar con límites de par, paradas de emergencia y supervisión humana.
- Sesgos: pueden heredarse los sesgos de las demostraciones humanas (velocidad, trayectorias, preferencias de agarre, distribución de posiciones).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia. No se identifican restricciones adicionales, pero el usuario debe verificar la licencia del dataset `piperdataset_4` por separado.
- Sin garantías de seguridad: el modelo no incorpora salvaguardas de seguridad física; cualquier despliegue en un robot real requiere capas externas de control y monitorización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leekyeongmin-pac2026/act_piper_model_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/leekyeongmin-pac2026/piperdataset_4
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

No se han encontrado otros enlaces relevantes en los resultados de la búsqueda web; los resultados devueltos no guardan relación con el modelo ni con robótica.
