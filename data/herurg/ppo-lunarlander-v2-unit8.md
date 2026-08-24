# herurg/PPO-LunarLander-v2-Unit8

## Resumen

Este modelo es un agente de aprendizaje por refuerzo entrenado con el algoritmo Proximal Policy Optimization (PPO) para resolver el entorno LunarLander-v2 de Gymnasium. Fue desarrollado por el usuario herurg como parte de la Unidad 8 del Hugging Face Deep RL Course, y su implementación sigue la arquitectura de estilo CleanRL adaptada a la API de Gymnasium. El agente debe aprender a controlar una nave para aterrizar de forma segura en una plataforma, recibiendo recompensas positivas por aterrizajes correctos y negativas por colisiones o consumo de combustible.

El modelo es relevante como ejemplo didáctico de implementación de PPO desde cero, sin depender de librerías externas como Stable-Baselines3. Sin embargo, su rendimiento es limitado: con solo 51.200 pasos de entrenamiento, la recompensa media obtenida es de -106,45 ± 72,52, muy por debajo del umbral de 200 puntos que se considera "resolver" el entorno. Esto lo convierte en un punto de partida para estudiar el algoritmo, pero no en una solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (red de política y valor, MLP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de observación continua) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo implementa PPO, un algoritmo de optimización de política proximal que pertenece a la familia de métodos de gradiente de política. La arquitectura concreta (número de capas, neuronas, funciones de activación) no se detalla en la información disponible, pero sigue el estilo CleanRL, que típicamente usa redes fully-connected de dos capas ocultas con activación tanh para el entorno LunarLander. El entrenamiento se realizó durante 51.200 pasos de interacción con el entorno, utilizando PyTorch como framework y Gymnasium como API de entorno. No se menciona el uso de técnicas como RLHF o DPO, ya que es un problema de control continuo, no de modelado de lenguaje.

## Capacidades

- Control de un agente en el entorno LunarLander-v2: el modelo recibe observaciones continuas (posición, velocidad, ángulo, contacto con el suelo) y produce acciones discretas (no hacer nada, encender motor izquierdo, motor principal, motor derecho).
- Aprendizaje por refuerzo con PPO: el agente optimiza una política estocástica mediante actualizaciones de gradiente con recorte (clipping) para estabilizar el entrenamiento.
- Evaluación reproducible: se proporciona una recompensa media y desviación estándar calculadas sobre 10 episodios de evaluación.
- No tiene capacidades de generación de texto, código, visión, tool calling ni procesamiento de lenguaje natural. Es un modelo puramente de control para un único entorno.

## Casos de uso

- Material didáctico para el Deep RL Course: el modelo sirve como ejemplo de implementación de PPO desde cero, permitiendo a estudiantes comparar su propio código con una referencia funcional.
- Estudio de hiperparámetros: al ser un modelo pequeño y rápido de entrenar, es útil para experimentar con tasas de aprendizaje, factores de recorte o tamaños de lote en PPO.
- Línea base para comparación: investigadores pueden usar este agente como punto de partida para medir mejoras al modificar la arquitectura o el algoritmo.
- Prueba de integración de Gymnasium: desarrolladores que migren código de OpenAI Gym a Gymnasium pueden verificar que su entorno y API funcionan correctamente con este agente.
- Benchmark de hardware: al ser un modelo minúsculo, sirve para medir el rendimiento de inferencia en CPUs o GPUs de gama baja sin necesidad de recursos elevados.
- Demostración de limitaciones del entrenamiento corto: permite ilustrar cómo un número insuficiente de pasos de entrenamiento produce un agente que no resuelve el entorno, útil para explicar la importancia de la duración del entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| LunarLander-v2 (mean_reward) | -106,45 ± 72,52 |
| Episodios de evaluación | 10 |
| Umbral de resolución del entorno | 200 |

Los resultados fueron declarados por el autor en la model card y no han sido verificados de forma independiente. El rendimiento está muy por debajo del umbral de resolución, lo que indica que el agente no ha aprendido una política efectiva de aterrizaje.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB, ya que la red es muy pequeña (típicamente menos de 100.000 parámetros).
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, aunque una CPU moderna es suficiente para inferencia.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier portátil o PC de escritorio actual.
- Opciones de despliegue: PyTorch nativo, Gymnasium para el entorno, o exportación a ONNX si se desea integrar en otros frameworks.
- Latencia: del orden de microsegundos por inferencia en CPU, al ser una red MLP minúscula.

## Comparativa con modelos similares

| Modelo | Algoritmo | Pasos de entrenamiento | Recompensa media | Framework |
|---|---|---|---|---|
| herurg/PPO-LunarLander-v2-Unit8 | PPO (CleanRL) | 51.200 | -106,45 | PyTorch |
| rodri2023/ppo-unit8-LunarLander-v2 | PPO | no disponible | no disponible | no disponible |
| nikskywalker/PPO-LunarLander-v2 | PPO (desde cero) | no disponible | no disponible | PyTorch |
| alperenunlu/ppo-lunarlander-v2 | PPO (Stable-Baselines3 + RL Zoo) | no disponible | no disponible | PyTorch |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible realizar una comparación cuantitativa directa.

## Limitaciones y advertencias

- Rendimiento insuficiente: el agente no resuelve el entorno LunarLander-v2, con una recompensa media negativa de -106,45. No es adecuado para ningún uso que requiera un aterrizaje fiable.
- Entrenamiento muy corto: con solo 51.200 pasos, es probable que la política no haya convergido. Los resultados pueden variar significativamente entre ejecuciones.
- Sin licencia especificada: la licencia no está disponible, lo que genera incertidumbre sobre los términos de uso y redistribución.
- Sin datos de sesgos o alucinaciones: al ser un modelo de control, no aplican los sesgos lingüísticos, pero sí puede haber sesgos en la política aprendida (por ejemplo, preferir ciertas acciones sobre otras de forma subóptima).
- Sin soporte para otros entornos: el modelo está entrenado exclusivamente para LunarLander-v2 y no puede generalizar a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste al entorno: al evaluarse solo en 10 episodios, la métrica reportada tiene una alta varianza y puede no reflejar el rendimiento real en una evaluación más amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/herurg/PPO-LunarLander-v2-Unit8
- Modelo similar de rodri2023: https://huggingface.co/rodri2023/ppo-unit8-LunarLander-v2
- Repositorio de nikskywalker (PPO desde cero): https://github.com/nikskywalker/PPO-LunarLander-v2
- Repositorio de alperenunlu (PPO con Stable-Baselines3): https://github.com/alperenunlu/ppo-lunarlander-v2
- Tutorial de PyLessons sobre PPO en LunarLander-v2: https://pylessons.com/LunarLander-v2-PPO
