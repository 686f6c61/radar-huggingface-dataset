# Haku-2004/act_k6end_input_20

## Resumen

`Haku-2004/act_k6end_input_20` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada en el Hub de Hugging Face mediante la librería LeRobot. El modelo resuelve el problema de control robótico de manipulación aprendiendo directamente de datos de teleoperación: en lugar de predecir una única acción por paso, genera secuencias cortas de acciones (chunks), lo que reduce el error de acumulación y mejora la estabilidad de la política en tareas de precisión. Está entrenado sobre el dataset `Haku-2004/k6_4seg` y orientado a un robot tipo SO-100 (brazo de bajo coste), según se desprende del ejemplo de evaluación de la model card.

El checkpoint contiene 51.671.174 parámetros en formato safetensors y ocupa 0,2 GB en el repositorio, lo que lo sitúa en la categoría de políticas ligeras ejecutables en GPU de consumo. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones adicionales. No se especifican idiomas ni capacidades lingüísticas: no es un modelo de lenguaje, sino un modelo de acción motora.

La relevancia actual reside en que ACT se ha consolidado como referencia en imitation learning robótico de bajo coste, y este checkpoint concreto es un ejemplo reproducible de entrenamiento con LeRobot sobre hardware asequible. No obstante, al tratarse de un artefacto con 0 descargas y 0 likes, sin benchmarks publicados ni documentación adicional más allá de la model card estándar de LeRobot, su validación externa es inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con cabeza de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de observaciones configurada en el entrenamiento; no se especifica) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que combina un transformer con una formulación de predicción por chunks: el modelo observa el estado del robot y las imágenes de cámara, y emite un bloque de K acciones futuras en lugar de una sola. Esta formulación, descrita en el paper arXiv:2304.13705, mitiga el problema de horizonte largo en tareas de manipulación y permite entrenar con datasets de teleoperación relativamente pequeños. La arquitectura incluye un encoder visual (típicamente ResNet) y un transformer encoder-decoder con atención sobre las observaciones y sobre las acciones previas del chunk.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_4seg`, que por el nombre sugiere episodios segmentados en 4 segmentos de una tarea denominada "k6". No se dispone de información sobre el número de episodios, la composición de las cámaras, la frecuencia de control ni si se aplicaron aumentos de datos. Tampoco se documenta si hubo ajuste fino posterior ni validación cruzada. La model card reproduce la plantilla estándar de LeRobot sin añadir detalles específicos del entrenamiento.

## Capacidades

- Control robótico de manipulación mediante predicción de chunks de acciones.
- Imitation learning a partir de datos de teleoperación (no requiere recompensa explícita).
- Procesamiento multimodal de observaciones: imágenes de cámara más estado propioceptivo del robot.
- Ejecución sobre robots tipo SO-100 follower, según el ejemplo de `lerobot-record` de la model card.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes conversacionales ni razonamiento multi-step simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio motor.

## Casos de uso

- Manipulación de precisión en laboratorio: la política predice chunks de acciones que reducen el jitter y el error acumulado en tareas de inserción o ensamblaje, adecuado para brazos SO-100 en entornos controlados.
- Replicación de tareas de teleoperación: un operador graba demostraciones con el robot líder y la política aprende a reproducirlas en el follower, lo que permite escalar tareas repetitivas sin reprogramación manual.
- Prototipado rápido de políticas robóticas: con 51,7 M de parámetros y 0,2 GB, el checkpoint se carga y evalúa en minutos en una GPU de consumo, lo que acelera iteraciones de investigación.
- Educación y docencia en robótica: ejemplo reproducible de entrenamiento ACT con LeRobot, útil para cursos de imitation learning con hardware de bajo coste.
- Evaluación comparativa de datasets: al estar entrenado sobre `k6_4seg`, sirve como baseline para medir el efecto de cambios en la recogida de datos (número de episodios, cámaras, frecuencia).
- Automatización de tareas pick-and-place en líneas de montaje ligeras: la política puede desplegarse en un SO-100 para tareas de recogida y colocación repetitivas, siempre que el dominio de entrenamiento coincida con el de despliegue.
- Investigación en sim-to-real: el checkpoint puede servir como punto de partida para ajuste fino con datos reales adicionales o para comparar con políticas entrenadas en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas. El repositorio no adjunta curvas de entrenamiento ni evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros, más el overhead del encoder visual y de los buffers de observación; en la práctica, 2-4 GB de VRAM son suficientes para inferencia por lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Para entrenamiento desde cero, se recomienda RTX 4090 o superior por comodidad, aunque el tamaño del modelo permite entrenar en GPUs de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen de la frecuencia de control del robot, del número de cámaras y del tamaño del chunk de acciones configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k6end_input_20` | 51,7 M | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face, 0 descargas |
| ACT original (paper arXiv:2304.13705) | ~80 M (según configuración del paper) | no aplica | tasas de éxito publicadas en el paper para tareas ALOHA | código abierto (MIT en el repo original) | GitHub, paper |
| Diffusion Policy (arXiv:2303.04137) | variable, típicamente 30-100 M | no aplica | competitivo en tareas de manipulación, a menudo superior a ACT en precisión | MIT | GitHub, Hugging Face |
| VQ-BeT (arXiv:2403.03181) | variable | no aplica | comparable a ACT en tareas de imitación con chunks discretos | MIT | GitHub |

La comparación con el ACT original es aproximada: el checkpoint aquí descrito no documenta la configuración exacta (número de cámaras, resolución, tamaño de chunk), por lo que no puede equipararse directamente al modelo del paper. Diffusion Policy y VQ-BeT son alternativas metodológicas de la misma categoría (imitation learning para manipulación), pero no se dispone de comparaciones empíricas con este checkpoint concreto.

## Limitaciones y advertencias

- Sesgos conocidos: la política está entrenada exclusivamente sobre el dataset `k6_4seg`; generalizará mal fuera de la distribución de esa tarea, robot y condiciones de iluminación.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones fuera de distribución cuando el estado observado difiere del visto en entrenamiento, lo que puede provocar movimientos erráticos o colisiones.
- Limitaciones de contexto o idioma: no hay contexto lingüístico; la ventana de observación depende de la configuración de entrenamiento, no documentada. No soporta instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de mantener el aviso de licencia y el archivo NOTICE si existe. No hay restricciones adicionales documentadas.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin validación externa; no hay métricas de éxito publicadas; no se documenta la frecuencia de control, el número de cámaras ni la resolución de entrada; el despliegue requiere hardware SO-100 o compatible y el stack LeRobot; la seguridad física del robot no está garantizada y se recomienda supervisión humana y parada de emergencia en cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6end_input_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
