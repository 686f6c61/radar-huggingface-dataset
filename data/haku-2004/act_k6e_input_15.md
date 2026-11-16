# Haku-2004/act_k6e_input_15

## Resumen

`act_k6e_input_15` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv:2304.13705 (Zhao et al., 2023). El modelo lo ha entrenado y subido a Hugging Face el usuario Haku-2004 mediante la librería LeRobot de Hugging Face, y está pensado para controlar un robot seguidor tipo SO-100 a partir de observaciones visuales y del estado de las articulaciones. No es un modelo de lenguaje: es un policy de robótica que mapea observaciones a secuencias cortas de acciones motoras.

El modelo tiene 51.671.174 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre GPU de consumo. Se ha entrenado exclusivamente con el dataset `Haku-2004/k6_4seg`, un conjunto de demostraciones teleoperadas de cuatro segmentos, y su licencia es Apache 2.0.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de LeRobot para entrenamiento y evaluación de ACT, y permite a desarrolladores de robótica de bajo coste replicar el flujo con un robot SO-100 sin necesidad de infraestructura pesada. No hay información pública sobre idiomas, benchmarks ni evaluaciones cuantitativas de éxito en tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k6_4seg |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un encoder visual (habitualmente ResNet preentrenada) con un transformer que procesa la observación y genera una secuencia de acciones articulares; el modelo se entrena con pérdida de regresión L1 sobre las acciones teleoperadas. El artículo original reporta que este esquema alcanza tasas de éxito altas en tareas de manipulación con datos limitados.

En este caso concreto, el entrenamiento se ha realizado con LeRobot sobre el dataset `Haku-2004/k6_4seg`, que según la model card corresponde a demostraciones teleoperadas de cuatro segmentos. No se especifican en la información disponible el número de episodios, el número de tokens o frames, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos, RLHF o DPO (no aplicables a este tipo de política). Tampoco se detalla la configuración de hiperparámetros ni el número de épocas.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares a partir de observaciones visuales y del estado del robot.
- Predicción de action chunks: emite bloques de acciones en lugar de pasos únicos, lo que mejora la suavidad y la estabilidad del movimiento.
- Integración con LeRobot: entrenamiento, evaluación e inferencia mediante `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots SO-100: la model card ejemplifica la evaluación con `so100_follower`.
- Ejecución en tiempo real: el tamaño reducido (51,7 M de parámetros) permite inferencia de baja latencia en GPU de consumo.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de ACT: un investigador puede clonar el repositorio y reproducir el pipeline de entrenamiento con `lerobot-train` usando el dataset `Haku-2004/k6_4seg`, lo que facilita la comparación con otras políticas de imitación.
- Manipulación robótica de bajo coste con SO-100: el modelo está pensado para controlar un robot seguidor SO-100 en tareas de pick-and-place o ensamblaje sencillo, aprovechando su tamaño reducido para ejecutarse en una GPU de consumo.
- Evaluación comparativa de políticas: sirve como baseline ACT en experimentos que comparen ACT frente a Diffusion Policy o VQ-BeT sobre el mismo dataset, gracias a su integración nativa con LeRobot.
- Docencia y formación en robótica de imitación: el flujo `lerobot-record` con `--policy.path` permite a estudiantes ejecutar una política preentrenada y observar el comportamiento en un robot real sin entrenar desde cero.
- Prototipado rápido de tareas teleoperadas: con solo cuatro segmentos de demostración, el modelo puede adaptarse a tareas nuevas reentrenando sobre un dataset propio y manteniendo la misma arquitectura.
- Investigación en chunking de acciones: permite estudiar el efecto del tamaño del chunk y de la frecuencia de control sobre la estabilidad del movimiento en robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el encoder visual y el preprocesado de imágenes, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha documentado el uso con `--policy.device=cuda` en LeRobot.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; también es viable en GPUs integradas con suficiente memoria compartida para el encoder visual.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), exportación a safetensors y carga directa con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada; dependerá de la GPU, del tamaño del chunk de acciones y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6e_input_15 (este) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face, LeRobot |
| ACT original (Zhao et al., 2023) | no disponible | no aplica | tasas de éxito altas reportadas en el paper | no disponible | paper arXiv:2304.13705 |
| Diffusion Policy (Chi et al., 2023) | no disponible | no aplica | no disponible en esta ficha | no disponible | paper y repositorios públicos |
| VQ-BeT (Lee et al., 2024) | no disponible | no aplica | no disponible en esta ficha | no disponible | paper y repositorios públicos |

No se dispone de datos cuantitativos comparativos entre estas políticas en la información proporcionada; la comparación se limita a la categoría (políticas de imitación para manipulación robótica) y a la licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo es válido para la tarea y el robot con los que se entrenó (dataset `k6_4seg`, robot SO-100); no generaliza a otras morfologías ni a tareas fuera de distribución.
- Sin datos de evaluación: no hay tasas de éxito publicadas, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset pequeño y no documentado: la model card no detalla el número de episodios ni la variabilidad de las demostraciones, lo que aumenta el riesgo de sobreajuste.
- Sin capacidades lingüísticas: no procesa texto, no responde a instrucciones en lenguaje natural y no soporta diálogo multi-turno.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de imitación, puede generar movimientos erráticos ante observaciones no vistas durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset y de los datos teleoperados.
- Sin información sobre sesgos: no se documentan sesgos demográficos ni de otro tipo, aunque al tratarse de datos teleoperados puede heredar sesgos del operador.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6e_input_15
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
