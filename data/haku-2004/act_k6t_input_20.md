# Haku-2004/act_k6t_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k6t_input_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k6_4seg` y publicada en Hugging Face con licencia Apache 2.0.

El modelo cuenta con 51.671.174 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo. No es un modelo de lenguaje: su entrada son observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y su salida son comandos de control para un robot, por lo que su evaluación se realiza mediante tasas de éxito en tareas físicas, no con benchmarks de texto.

Su relevancia radica en que ejemplifica el flujo actual de LeRobot: entrenamiento reproducible desde un dataset de teleoperación, publicación en el Hub y despliegue directo con `lerobot-record` sobre brazos como el SO-100. Al tener cero descargas y cero likes en el momento de la consulta, debe tratarse como un checkpoint experimental de un autor individual, no como un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de observaciones y decoder de chunks de acciones, con componente CVAE |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT sigue el diseño del paper arXiv:2304.13705: un transformer que recibe como entrada las observaciones (imágenes de cámara y estado de las articulaciones) y predice un chunk de acciones futuras de forma conjunta. El modelo incorpora un prior CVAE que modela la variabilidad de las demostraciones humanas durante el entrenamiento, lo que permite capturar estilos de teleoperación diversos y reducir el modo-averaging que degrada las políticas de imitación clásicas. En inferencia, el componente CVAE se fija a su media, de modo que el coste computacional se concentra en el transformer principal.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_4seg`, que no está documentado en la información disponible (no se especifican número de episodios, frecuencia de captura, tareas ni número de cámaras). No hay datos sobre tokens de entrenamiento, composición del dataset, ni sobre uso de RLHF o DPO, que en cualquier caso no aplican a este tipo de política. Tampoco se documentan innovaciones adicionales más allá del chunking de acciones propio de ACT.

## Capacidades

- Generación de chunks de acciones de control para robots manipuladores a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones de teleoperación, sin necesidad de recompensas explícitas.
- Control visomotor de extremo a extremo: las imágenes de cámara se procesan directamente por el transformer sin pipeline de percepción separado.
- Integración nativa con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Compatible con el robot `so100_follower` según el ejemplo de la model card, aunque la configuración exacta de entrenamiento no se detalla.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de laboratorio: replicar tareas de pick-and-place aprendidas de teleoperación sobre un brazo SO-100, usando el checkpoint como punto de partida o como política final para la tarea del dataset `k6_4seg`.
- Prototipado rápido de políticas de imitación: servir como referencia para comparar arquitecturas ACT frente a otras políticas de LeRobot (Diffusion Policy, TDMPC) en el mismo dataset y robot.
- Investigación en aprendizaje por imitación: analizar el efecto del chunking de acciones y del prior CVAE en la estabilidad de la política con 51,7 M de parámetros, un tamaño manejable para ablaciones.
- Despliegue en hardware de consumo: al ocupar 0,2 GB en safetensors, puede ejecutarse en una GPU de gama media o incluso en CPU para inferencia de baja frecuencia, lo que facilita bancos de pruebas económicos.
- Evaluación reproducida de extremo a extremo: usar `lerobot-record` con `--episodes=10` para medir la tasa de éxito de la política en el robot real y documentar la variabilidad entre ejecuciones.
- Base para fine-tuning en tareas relacionadas: reentrenar o ajustar la política con nuevos datasets de teleoperación del mismo robot para ampliar el repertorio de habilidades sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas sobre el dataset `Haku-2004/k6_4seg`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros (el repositorio completo ocupa 0,2 GB), sin contar buffers de imágenes.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior ofrece margen holgado para inferencia en tiempo real. Para entrenamiento, se recomienda una RTX 4090, A100 o H100 según el tamaño del dataset y el número de cámaras.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es la vía documentada. No se documentan exportaciones a ONNX, TensorRT ni llama.cpp (este último no aplica).
- Latencia y throughput: no disponibles. Dependen de la resolución de las cámaras, del número de observaciones por paso y de la frecuencia de control del robot, ninguno de los cuales se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6t_input_20 (este) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Diffusion Policy (LeRobot) | variable según configuración | no aplica | no disponible en esta ficha | MIT/Apache según implementación | Disponible en LeRobot |
| TDMPC (LeRobot) | variable según configuración | no aplica | no disponible en esta ficha | MIT/Apache según implementación | Disponible en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a disponibilidad y licencia.

## Limitaciones y advertencias

- Checkpoint experimental de un autor individual, con cero descargas y cero likes: no ha sido validado por la comunidad ni por terceros independientes.
- El dataset de entrenamiento (`Haku-2004/k6_4seg`) no está documentado en la información disponible: se desconocen tareas, número de episodios, condiciones de captura y posibles sesgos de los datos de teleoperación.
- La política está especializada en el robot y la tarea del dataset; no se espera generalización a otros robots, morfologías o entornos sin reentrenamiento.
- Riesgo de sobreajuste a las condiciones visuales del laboratorio de captura (iluminación, fondo, posición de cámara), típico en aprendizaje por imitación.
- No hay información sobre latencia, frecuencia de control ni robustez ante perturbaciones, factores críticos para producción.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación publicada hace desaconsejable desplegarlo en entornos reales sin una validación propia exhaustiva.
- No aplica como modelo de lenguaje: no debe usarse para generación de texto, código ni tareas de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6t_input_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
