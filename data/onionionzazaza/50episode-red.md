# onionionZazaza/50episode-red

## Resumen

El modelo `onionionZazaza/50episode-red` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el paper arXiv:2304.13705. Lo desarrolla el usuario onionionZazaza y se distribuye a través de Hugging Face con la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica. No es un modelo de lenguaje: es un controlador que traduce observaciones visuales y de estado del robot en secuencias cortas de acciones motoras.

El modelo resuelve el problema del control robótico de precisión a partir de demostraciones teleoperadas. En lugar de predecir una única acción por paso, ACT predice "trozos" (chunks) de acciones futuras, lo que reduce el error de acumulación y produce movimientos más suaves y estables. Con 13.129.117 parámetros y un repositorio de 0,1 GB, es un modelo compacto pensado para ejecutarse en hardware modesto y para tareas de manipulación específicas.

Su relevancia es acotada pero práctica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento, evaluación e inferencia) sobre un conjunto de datos propio de 50 episodios. No hay información pública sobre el robot concreto, la tarea o el entorno de recogida de datos más allá del identificador del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 13.129.117 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | onionionZazaza/50episode-red |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks. El modelo recibe observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y emite una secuencia de acciones de longitud fija, lo que permite al controlador actuar de forma más coherente que con predicciones paso a paso. La arquitectura habitual de ACT incluye un codificador visual, un codificador de estado y un decodificador transformer que genera el chunk de acciones.

El entrenamiento se realizó con LeRobot sobre el dataset `onionionZazaza/50episode-red`, compuesto por 50 episodios de demostraciones teleoperadas. No se dispone de información sobre el número total de tokens, la composición exacta del dataset, el robot empleado ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de imitación). Tampoco se documentan innovaciones adicionales más allá del propio esquema de action chunking descrito en el paper.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado.
- Manipulación de precisión: el esquema de predicción por chunks reduce el error acumulado en tareas de contacto.
- Ejecución en tiempo real sobre robots compatibles con LeRobot (por ejemplo, SO-100 follower, según el ejemplo de la model card).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede ejecutar la tarea concreta para la que fue entrenado (50 episodios) sobre un robot compatible con LeRobot, sirviendo como base para experimentos de aprendizaje por imitación.
- Reproducción de pipelines de investigación: útil para validar el flujo completo de LeRobot (`lerobot.scripts.train` y `lerobot.record`) con un checkpoint real y un dataset propio.
- Prototipado de controladores de bajo coste: con 13 millones de parámetros y 0,1 GB de pesos, cabe en GPUs de consumo y permite iterar rápidamente en entornos de laboratorio.
- Evaluación comparativa de métodos de imitación: sirve como referencia ACT frente a otras políticas de LeRobot (por ejemplo, Diffusion Policy) sobre el mismo dataset.
- Demostraciones educativas: ejemplo didáctico de entrenamiento por imitación desde teleoperación hasta inferencia en robot real.
- Base para fine-tuning: al estar en formato safetensors y licencia Apache 2.0, puede reentrenarse sobre nuevos datasets de episodios para adaptar la política a otras tareas.
- Automatización de tareas repetitivas en entornos controlados: adecuado para picking y colocación en configuraciones fijas donde la variabilidad del entorno es baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 13,1 millones de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 52 MB, y en fp16 unos 26 MB, por lo que la inferencia cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no hay recomendación oficial; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales.
- Opciones de despliegue: LeRobot (`lerobot.record` con `--policy.path`), con soporte de CUDA mediante `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onionionZazaza/50episode-red (ACT) | 13.129.117 | no aplica | no disponible | apache-2.0 | Hugging Face |
| ACT original (paper arXiv:2304.13705) | no disponible | no aplica | reportado en el paper | no disponible | código en repositorio de los autores |
| Diffusion Policy (LeRobot) | no disponible | no aplica | no disponible | no disponible | Hugging Face / LeRobot |
| Otras políticas LeRobot (p. ej. TDMPC, VQ-BeT) | no disponible | no aplica | no disponible | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables publicados para este checkpoint concreto, por lo que la comparación se limita a aspectos de licencia, tamaño y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada sobre 50 episodios de una tarea concreta; no generaliza a otras tareas, objetos o entornos sin reentrenamiento.
- Sin información sobre el robot ni la tarea: la model card no detalla el hardware, el espacio de acciones ni las condiciones de recogida, lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste: con solo 50 episodios, la variabilidad cubierta es limitada y el rendimiento puede degradarse ante cambios de iluminación, posición de objetos o del robot.
- Sin datos de benchmarks ni de tasa de éxito: no se puede evaluar su rendimiento de forma objetiva a partir de la información disponible.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones y del entorno de recogida.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias (LeRobot) y del dataset.
- Advertencia de producción: no hay evidencia de validación en entornos reales más allá del entrenamiento; se recomienda evaluación exhaustiva antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onionionZazaza/50episode-red
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/onionionZazaza/50episode-red
