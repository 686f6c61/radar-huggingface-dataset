# JunwooHur/0812_kjs_basic_act_aug

## Resumen

Este modelo es una política de control robótico basada en *Action Chunking with Transformers* (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de acciones paso a paso. Ha sido entrenado con el framework LeRobot de Hugging Face sobre un dataset de teleoperación para la tarea de doblar una toalla por la mitad dos veces, utilizando un robot seguidor tipo `so_follower` con una cámara superior. El modelo fue desarrollado por el usuario JunwooHur y publicado bajo licencia Apache-2.0.

Con 51,6 millones de parámetros, es una política relativamente compacta que procesa observaciones de estado (6 dimensiones) e imágenes RGB (480x640) para generar comandos de acción de 6 dimensiones. Su relevancia radica en demostrar la aplicación práctica de ACT en manipulación robótica doméstica, un caso de uso típico de los benchmarks de LeRobot. Aunque no se han publicado resultados de evaluación en el repositorio, el modelo está listo para ejecutarse con los comandos estándar de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16, safetensors) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que combina un codificador de visión (para procesar imágenes de la cámara) con un codificador de estado y un decodificador autoregresivo que predice un chunk de acciones futuras (típicamente de 50 a 100 pasos). La innovación clave frente a métodos de imitación convencionales es que, en lugar de predecir una sola acción por paso, el modelo genera una secuencia completa de acciones, lo que reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación.

El entrenamiento se realizó con LeRobot versión 0.6.1, utilizando el dataset `JunwooHur/0812_kjs_basic` que contiene 50 episodios y 35.407 fotogramas a 30 FPS, todos para la tarea "Fold the towel in half twice". La configuración de entrenamiento incluyó 50.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO, ya que es un pipeline de aprendizaje por imitación supervisado sobre datos teleoperados.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones (posición/orientación del efector) a partir de observaciones de estado e imágenes.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación, en este caso doblar una toalla.
- Percepción visual: procesa imágenes RGB de una cámara superior (480x640) para guiar el movimiento.
- Generalización limitada a la tarea y configuración específicas: el modelo está entrenado para un robot concreto (`so_follower`) y una única cámara `top`.
- Sin capacidades de lenguaje, tool calling ni razonamiento simbólico: es exclusivamente un modelo de control motor.

## Casos de uso

- Automatización de tareas domésticas de plegado: el modelo puede controlar un brazo robótico para doblar toallas o prendas, reduciendo la intervención humana en entornos de lavandería o robótica asistencial.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre robots o la robustez frente a variaciones de iluminación y posición.
- Desarrollo de robots de bajo coste: al ser un modelo compacto (51M parámetros), puede ejecutarse en GPUs de gama media, facilitando prototipos en laboratorios con hardware limitado.
- Benchmarking de métodos de imitación: su entrenamiento con LeRobot permite comparar ACT frente a otras políticas (p. ej., Diffusion Policy) en la misma tarea y dataset.
- Demostración de despliegue con LeRobot: el modelo está listo para usarse con el comando `lerobot-rollout`, lo que lo convierte en un ejemplo reproducible para quienes aprenden el flujo de trabajo de LeRobot.
- Reentrenamiento incremental: dado el dataset de 50 episodios, puede usarse como base para fine-tuning con nuevas demostraciones de la misma tarea o variantes (p. ej., diferentes colores o texturas de toalla).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No hay datos de tasa de éxito ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB (el modelo pesa 0.2 GB en safetensors; con imágenes de entrada y overhead de PyTorch, cabe en cualquier GPU moderna).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, p. ej., NVIDIA GTX 1650, RTX 3060 o superiores. No requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: sí, es perfectamente ejecutable en GPUs de gama media y baja.
- Opciones de despliegue: exclusivamente a través de LeRobot (PyTorch). No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje. El flujo estándar es `lerobot-rollout` con el robot conectado.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo y la resolución de imagen, se espera una inferencia en tiempo real (por debajo de 100 ms por paso) en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No hay comparativa numérica disponible en el repositorio. Como referencia cualitativa, este modelo es una instancia estándar de ACT entrenada con LeRobot. Alternativas en el mismo ecosistema incluyen:

- Políticas ACT con más parámetros (p. ej., 100M) que pueden lograr mayor precisión en tareas complejas, pero requieren más datos y VRAM.
- Diffusion Policy (también soportada por LeRobot), que modela la distribución de acciones con un proceso de difusión y suele ser más robusta ante multimodalidad en las demostraciones.
- Modelos basados en RNN/LSTM (p. ej., LSTM de LeRobot) que son más ligeros pero menos precisos en tareas de manipulación de larga duración.

No se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- Entrenado para una única tarea y configuración: solo sabe doblar una toalla con el robot `so_follower` y una cámara superior. No generaliza a otras tareas, robots o disposiciones de cámara sin reentrenamiento.
- Riesgo de sobreajuste: el dataset tiene solo 50 episodios, por lo que el modelo puede fallar ante variaciones de iluminación, posición de la toalla o distracciones en el entorno.
- Sin evaluación publicada: no hay datos de tasa de éxito en robot real, por lo que su fiabilidad en producción es desconocida.
- Dependencia de la calibración del robot: los valores de estado y acción dependen de la configuración específica del robot; usar el modelo en otro hardware requiere recalibración y posiblemente reentrenamiento.
- Sin capacidades de razonamiento o lenguaje: no es un modelo multimodal generalista; solo procesa imágenes y estado.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario debe asegurarse de cumplir con las atribuciones requeridas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JunwooHur/0812_kjs_basic_act_aug
- Dataset de entrenamiento: https://huggingface.co/datasets/JunwooHur/0812_kjs_basic
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
