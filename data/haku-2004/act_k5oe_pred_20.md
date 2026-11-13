# Haku-2004/act_k5oe_pred_20

## Resumen

`act_k5oe_pred_20` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot y publicada en Hugging Face por el usuario Haku-2004. No se trata de un modelo de lenguaje, sino de un controlador robótico que aprende a partir de demostraciones teleoperadas para predecir secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación.

El modelo tiene 51.672.714 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Está entrenado específicamente sobre el dataset `Haku-2004/k5_4seg`, por lo que su ámbito de aplicación es acotado: reproduce las tareas y la morfología del robot presentes en dichas demostraciones. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

Su relevancia es limitada fuera del contexto de investigación en robótica de imitación: cuenta con cero descargas y cero likes en el momento de la consulta, y no incluye información sobre idiomas ni benchmarks publicados. Resulta útil como ejemplo reproducible de un pipeline LeRobot completo (entrenamiento, registro y evaluación) y como punto de partida para experimentos de policy learning con el método ACT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones y chunks de acción) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Dataset de entrenamiento | Haku-2004/k5_4seg |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación propuesto en el paper arXiv:2304.13705 que combina un backbone transformer con un esquema de predicción de chunks de acción. En lugar de predecir una única acción por paso de tiempo, el modelo genera una secuencia de k acciones futuras, lo que mitiga el problema de compounding error típico de las políticas paso a paso. La arquitectura incorpora habitualmente un codificador de imágenes (típicamente ResNet) para las observaciones visuales y un decodificador transformer con consultas aprendidas que produce el chunk de acciones.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k5_4seg`, que contiene demostraciones teleoperadas segmentadas en episodios de 4 segundos según la nomenclatura del repositorio. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el robot empleado ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF, DPO ni procesos de refinamiento posteriores, algo esperable en un modelo de imitación supervisada. No se han publicado detalles sobre hiperparámetros, número de épocas ni métricas de validación.

## Capacidades

- Predicción de chunks de acción para control robótico de manipulación a partir de observaciones visuales y estado del robot.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-record` sobre robots compatibles (el ejemplo de la model card usa `so100_follower`).
- Reproducción de tareas específicas del dataset `k5_4seg`, incluyendo secuencias de 4 segundos.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible de una política ACT entrenada con LeRobot, permitiendo comparar hiperparámetros y configuraciones sobre el mismo dataset.
- Evaluación de pipelines de robótica: el comando `lerobot-record` con `--policy.path` permite medir la tasa de éxito de la política en un robot `so100_follower` durante 10 episodios, tal como documenta la model card.
- Reproducción de experimentos: al estar el dataset y los pesos publicados, un investigador puede reentrenar desde cero con `lerobot-train` y comparar curvas de aprendizaje.
- Prototipado de tareas de manipulación de corta duración: los chunks de acción de 4 segundos son adecuados para tareas acotadas como pick-and-place o inserción simple.
- Base para fine-tuning: al tener licencia Apache 2.0, puede adaptarse a nuevos datasets de teleoperación manteniendo la arquitectura ACT y el pipeline LeRobot.
- Docencia y formación: ejemplo práctico de un flujo completo de entrenamiento y despliegue de políticas robóticas con herramientas open source.
- Benchmark interno de infraestructura: modelo pequeño (0,2 GB) que permite validar entornos de inferencia robótica sin requerir grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión de entrenamiento (51,7 M de parámetros, repositorio de 0,2 GB), aunque el consumo real depende del codificador visual y del tamaño del batch de observaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso de uso sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`) es la vía documentada; también puede cargarse con PyTorch directamente desde los safetensors.
- Latencia y throughput estimados: no disponibles. Al ser una política de control, la latencia relevante es la del bucle de control del robot, que depende del hardware de captura visual y de la frecuencia de inferencia, no documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5oe_pred_20 (este) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | variable | no aplica | reportadas en el paper ACT (no verificadas aquí) | Apache 2.0 | Hugging Face / GitHub |
| Diffusion Policy (paper alternativo) | variable | no aplica | no disponible en esta ficha | MIT (según implementación) | Repositorios públicos |
| RT-1 / RT-2 (Google) | cientos de M a miles de M | no aplica | no disponible en esta ficha | no comercial / restrictiva | No público en su mayoría |

La comparación cuantitativa no es posible con la información disponible; los datos de rendimiento de los modelos alternativos no se han verificado en esta ficha y se indican solo como referencia cualitativa.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente sobre `Haku-2004/k5_4seg`: no generaliza a otras tareas, morfologías de robot ni entornos distintos de los vistos en las demostraciones.
- Sin información sobre sesgos: al ser una política robótica, los sesgos se manifiestan como preferencias de trayectoria heredadas de las demostraciones del operador.
- Riesgo de fallo por distribución fuera de entrenamiento: cambios de iluminación, posición de cámara u objetos no vistos pueden degradar la política sin aviso explícito.
- Sin benchmarks publicados ni métricas de tasa de éxito, lo que impide evaluar su calidad objetiva frente a otras políticas.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- La model card no documenta el robot objetivo, la frecuencia de control, el número de episodios ni los hiperparámetros, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación técnica desaconseja su uso en producción sin una evaluación previa exhaustiva.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5oe_pred_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
