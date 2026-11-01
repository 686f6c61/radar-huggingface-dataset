# ketiholo/test3_ch100

## Resumen

`ketiholo/test3_ch100` es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, a partir del dataset de demostraciones teleoperadas `ketiholo/demo3`.

Se trata de un checkpoint de robótica de tipo policy, no de un modelo de lenguaje: su salida son comandos motores para un robot, condicionados por observaciones visuales y el estado del robot. Con 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, es un modelo compacto pensado para inferencia en tiempo real sobre hardware modesto.

Su relevancia es la de un artefacto reproducible de investigación: permite replicar el pipeline completo de entrenamiento y evaluación con LeRobot sobre un robot SO-100 (el comando de evaluación del autor referencia `so100_follower`), y sirve como ejemplo práctico de cómo se publica una política ACT entrenada con datos propios. El número de descargas (38) y la ausencia de likes indican un uso experimental, no un modelo de referencia de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con querying tipo CVAE |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observaciones y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | ketiholo/demo3 |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-26 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que combina un codificador de observaciones (imágenes de cámaras y estado de las articulaciones) con un decodificador que genera un chunk de acciones futuras de forma conjunta, en lugar de predecir una acción por paso. Esta predicción por chunks reduce el error de composición acumulado típico de las políticas paso a paso y suaviza la ejecución. El artículo original incorpora además un esquema de entrenamiento con variable latente estilo CVAE para modelar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot sobre el dataset `ketiholo/demo3`, compuesto por demostraciones teleoperadas. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens o muestras vistas, ni sobre si se aplicaron técnicas de aumento de datos o regularización específicas. Tampoco hay datos publicados sobre hiperparámetros de entrenamiento (learning rate, batch size, número de épocas) ni sobre el robot exacto de recogida de datos, aunque el comando de evaluación del autor apunta a un SO-100 follower.

## Capacidades

- Control robótico por imitación: genera comandos de acción para un robot manipulador a partir de observaciones visuales y del estado de las articulaciones.
- Predicción de chunks de acciones: emite secuencias cortas de acciones de forma conjunta, lo que mejora la estabilidad de la ejecución frente a políticas paso a paso.
- Ejecución en tiempo real: el tamaño reducido (51,7 M de parámetros) permite inferencia de baja latencia en GPU de consumo.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación y grabación de episodios con `lerobot-record`.
- Aprendizaje desde datos teleoperados: no requiere definición manual de recompensas ni simulación.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo en sentido de LLM.

## Casos de uso

- Replicación de experimentos de ACT: sirve como checkpoint de referencia para comparar resultados de un pipeline de entrenamiento propio con LeRobot sobre el mismo dataset u otros similares.
- Manipulación robótica de pick-and-place: el modelo puede ejecutar tareas de agarre y colocación aprendidas de demostraciones teleoperadas, adecuado por su capacidad de generar chunks de acciones estables.
- Evaluación de políticas en robot SO-100: el comando `lerobot-record` con `--robot.type=so100_follower` permite grabar episodios de evaluación y medir tasas de éxito de forma directa.
- Prototipado rápido en investigación de imitación: al ser un modelo pequeño (0,2 GB), se puede entrenar y desplegar en estaciones de trabajo con una sola GPU de consumo.
- Base para fine-tuning con datos propios: el checkpoint puede servir de inicialización para adaptar la política a nuevas tareas de manipulación con pocas demostraciones adicionales.
- Docencia y formación en robótica de aprendizaje: ejemplo completo y reproducible de un flujo LeRobot de extremo a extremo, desde el dataset hasta la inferencia en robot real.
- Integración en pipelines de evaluación automatizada: permite ejecutar baterías de episodios con `--episodes=N` y recopilar métricas de éxito de forma sistemática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M de parámetros, 0,2 GB en safetensors), la inferencia cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM, incluyendo el codificador visual.
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamaño, una RTX 3060, RTX 4060 o superiores son suficientes; A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` para evaluación e inferencia); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/test3_ch100 (ACT) | 51.670.663 | Política de imitación ACT | no aplica | apache-2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | Política de imitación ACT | no aplica | apache-2.0 (segun repositorio) | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | Política de imitación basada en difusión | no aplica | no disponible | Hugging Face / LeRobot |
| Políticas VQ-BeT | no disponible | Política de imitación con tokenización de acciones | no aplica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de tarea: la política está entrenada únicamente con el dataset `ketiholo/demo3`; su generalización a otras tareas, objetos o entornos no está garantizada ni documentada.
- Dependencia del hardware de recogida: el rendimiento puede degradarse si el robot, las cámaras o la configuración física difieren de las usadas en la teleoperación.
- Sin información sobre sesgos: no se han publicado análisis de sesgos, robustez ante cambios de iluminación, oclusiones o variaciones de posición de objetos.
- Riesgo de fallo físico: al tratarse de una política que controla un robot real, los errores de predicción pueden provocar colisiones o daños; se recomienda supervisión y límites de seguridad en el controlador.
- Sin datos de benchmarks ni de tasa de éxito: no es posible evaluar su calidad objetiva a partir de la información disponible.
- Documentación mínima: la model card es la plantilla estándar de LeRobot, sin detalles de hiperparámetros, composición del dataset ni resultados de evaluación.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Sin capacidades de lenguaje: no debe confundirse con un LLM; no procesa texto ni responde a instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/test3_ch100
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo3
- Artículo ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
