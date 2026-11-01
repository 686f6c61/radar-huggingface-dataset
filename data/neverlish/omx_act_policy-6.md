# neverlish/omx_act_policy-6

## Resumen

`neverlish/omx_act_policy-6` es una política de aprendizaje por imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está pensado para controlar brazos robóticos teleoperados reproduciendo trayectorias de acciones a partir de observaciones visuales y propioceptivas.

A diferencia de un modelo de lenguaje, este checkpoint no genera texto: es una política de control que predice *chunks* de acciones (secuencias cortas de comandos motores) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Cuenta con 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de modelos ligeros que pueden ejecutarse en hardware de consumo.

Es relevante para desarrolladores e investigadores que trabajan en robótica de bajo coste (por ejemplo, brazos SO-100/SO-101) y quieren un punto de partida reproducible para entrenar y desplegar políticas de imitación con el ecosistema LeRobot. El modelo está entrenado sobre el dataset `neverlish/record-test-6`, lo que sugiere un experimento o prueba de concepto más que un modelo de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un *backbone* visual (codificador de imágenes, típicamente ResNet) con un transformer que predice un chunk de acciones futuras en cada paso. Esta predicción por chunks, junto con el *temporal ensembling* propuesto en el paper, mitiga el problema de la acumulación de errores en políticas de imitación paso a paso y permite obtener tasas de éxito altas con datasets de teleoperación relativamente pequeños.

El entrenamiento se realiza con `lerobot-train` sobre el dataset `neverlish/record-test-6`, que contiene episodios de teleoperación (observaciones y acciones). No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens o pasos de entrenamiento, ni sobre el uso de técnicas de refinamiento adicionales (RLHF/DPO no aplican en este contexto). La model card no documenta hiperparámetros, aumentos de datos ni detalles de la configuración de entrenamiento.

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones (imágenes de cámara y estado propioceptivo del robot).
- Manipulación de objetos en entornos de laboratorio o mesa de trabajo, condicionada a la distribución del dataset de entrenamiento.
- Ejecución de políticas en robots compatibles con LeRobot (por ejemplo, `so100_follower` según los comandos de la model card).
- Evaluación y grabación de episodios con `lerobot-record` para medir la tasa de éxito.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan modos especiales (thinking, visión general, audio) más allá del uso de visión para el control.

## Casos de uso

- Reproducción de tareas de manipulación teleoperada: el modelo replica trayectorias aprendidas de un dataset de demostraciones, útil para prototipar políticas de agarre y colocación en un brazo SO-100.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT, tamaños de chunk o configuraciones de *temporal ensembling*.
- Evaluación de pipelines LeRobot: permite validar el flujo completo `lerobot-train` → `lerobot-record` con un checkpoint real y medir tasas de éxito en 10 episodios.
- Pruebas de concepto en robótica de bajo coste: al ocupar 0,2 GB y 51,7 M de parámetros, puede ejecutarse en GPUs de consumo para experimentos de laboratorio.
- Generación de datos sintéticos de evaluación: ejecutar la política en un entorno simulado o real para recolectar episodios etiquetados y analizar fallos.
- Docencia y formación: ejemplo didáctico de política ACT entrenada con LeRobot para explicar chunking de acciones y ensamblado temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo (el cuello de botella suele ser el codificador visual y el preprocesado de imágenes).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; para entrenamiento se recomienda al menos una RTX 3090/4090 o superior (A100/H100 para entrenamientos más largos), aunque no se especifican requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 o superiores; no hay datos oficiales de VRAM mínima.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_policy-6 (ACT) | 51,7 M | no disponible | no disponible | apache-2.0 | Hugging Face (28 descargas) |
| Políticas ACT de referencia en LeRobot | variable | no disponible | tasas de éxito reportadas en el paper original, no comparables directamente | apache-2.0 (segun LeRobot) | Hugging Face |
| Políticas Diffusion Policy | variable | no disponible | no disponible en esta ficha | variable | Hugging Face / LeRobot |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | no disponible | no disponible en esta ficha | variable | Hugging Face |

No se dispone de datos de rendimiento comparables en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado sobre un dataset concreto (`neverlish/record-test-6`); su comportamiento fuera de esa distribución (otros objetos, iluminación, robots o tareas) no está garantizado.
- No se documentan sesgos específicos, pero al ser una política de imitación hereda los sesgos y errores de las demostraciones humanas.
- Riesgo de fallo por acumulación de error y por cambios en la cámara o en la configuración física del robot.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni instrucciones textuales.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia del dataset de entrenamiento antes de un uso en producción.
- El número de descargas (28) y la ausencia de likes sugieren un checkpoint experimental, no validado de forma independiente.
- No hay información sobre cuantizaciones, latencias ni requisitos mínimos de hardware; conviene medir el rendimiento en el robot objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neverlish/omx_act_policy-6
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/neverlish/record-test-6
