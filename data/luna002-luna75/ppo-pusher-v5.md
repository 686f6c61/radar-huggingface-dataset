# Luna002-Luna75/ppo-pusher-v5

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con el algoritmo Proximal Policy Optimization (PPO) para el entorno Pusher-v5 de Gymnasium/MuJoCo, utilizando la librería Stable-Baselines3. El modelo fue desarrollado por Luna002-Luna75 (EUN HEE LEE) y resuelve la tarea de control de un brazo robótico multiarticulado que debe empujar un cilindro objetivo hasta una posición meta mediante su extremo efector.

El entorno Pusher-v5 simula un brazo robótico con articulaciones de hombro, codo, antebrazo y muñeca, con un espacio de acciones continuo de 7 dimensiones (torques en el rango [-2, 2]). El agente utiliza una política de tipo MlpPolicy (perceptrón multicapa) y fue entrenado durante 10.000 pasos de simulación en CPU, lo que lo convierte en un modelo ligero y reproducible para experimentación educativa o como punto de partida para fine-tuning.

La relevancia de este modelo reside en su simplicidad y accesibilidad: es un ejemplo completo de pipeline de entrenamiento de RL para robótica física, con artefactos de visualización incluidos (métricas CSV, dashboard de entrenamiento, GIF de progresión y vídeo de evaluación). Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO con MlpPolicy (perceptrón multicapa) |
| Parametros totales | no disponible (política MLP pequeña, pesos en formato SB3 zip) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de RL, sin contexto de texto) |
| Tipos de cuantizacion | no aplicable (no es un modelo de lenguaje) |
| Idiomas soportados | no aplicable (modelo de control, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | zip (formato nativo Stable-Baselines3) |

## Arquitectura y entrenamiento

El modelo emplea el algoritmo PPO (Proximal Policy Optimization) con una política de tipo MlpPolicy, que consiste en una red neuronal feed-forward que mapea directamente las observaciones del entorno (posiciones y velocidades de las articulaciones del brazo robótico) a acciones de control continuo (torques). No se trata de un transformer ni de un modelo de lenguaje; es un modelo de control de bajo nivel para robótica.

El entrenamiento se realizó durante 10.000 timesteps en CPU, sin indicación de uso de técnicas de regularización adicionales como RLHF o DPO (que no aplican a este tipo de modelos). No se especifica en la model card el tamaño de las capas ocultas de la MlpPolicy, el learning rate, ni el número de epochs por actualización. El entorno utilizado es Pusher-v5 de Gymnasium, que usa el simulador físico MuJoCo. El espacio de acciones es un Box continuo de 7 dimensiones con valores en [-2, 2], representando los torques aplicados a las articulaciones.

## Capacidades

- Control de brazo robótico simulado: el agente aprende a generar torques para las 7 articulaciones del brazo Pusher con el objetivo de empujar un cilindro hasta una posición meta.
- Inferencia determinista: soporta predicción con `deterministic=True` para evaluación reproducible.
- Integración con Stable-Baselines3: el modelo se carga con `PPO.load()` y se puede usar directamente con el entorno Gymnasium.
- Reproducibilidad: incluye métricas de entrenamiento (recompensas y pérdidas PPO por paso) en formato CSV.
- Visualización del aprendizaje: se incluyen artefactos gráficos (dashboard, GIF de progresión, vídeo de evaluación) que permiten inspeccionar la evolución de la política.
- Entrenamiento ligero: al haber sido entrenado en CPU con solo 10.000 pasos, es adecuado para entornos con recursos limitados.

## Casos de uso

- Educación en aprendizaje por refuerzo: el modelo sirve como ejemplo didáctico completo de entrenamiento PPO con Stable-Baselines3, incluyendo artefactos de visualización que facilitan la comprensión del proceso de aprendizaje.
- Prototipado de control robótico: permite validar rápidamente pipelines de RL para control de brazos articulados antes de escalar a entornos más complejos o simulaciones de mayor fidelidad.
- Benchmark de algoritmos RL: al ser un entorno estándar (Pusher-v5), el modelo puede usarse como baseline para comparar el rendimiento de otros algoritmos (SAC, TD3, DDPG) en la misma tarea.
- Fine-tuning para tareas de manipulación: el checkpoint puede servir como inicialización para entrenar políticas más sofisticadas con más timesteps o con observaciones adicionales.
- Investigación en sim-to-real: aunque el entrenamiento es en simulación, el modelo puede usarse como referencia para estudiar transferencia a hardware real en configuraciones de brazo similar.
- Integración en pipelines de CI/CD para RL: el formato SB3 y el script de carga permiten integrar el modelo en sistemas de evaluación automática de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento cuantitativas (recompensa media, tasa de éxito, etc.) más allá de las métricas de entrenamiento incluidas en el archivo `training_metrics.csv`, que no se han podido inspeccionar. El entrenamiento de 10.000 timesteps es muy corto para esta tarea, por lo que es probable que el agente no haya convergido a una política óptima.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo es una MLP pequeña que se ejecuta en CPU sin problemas.
- GPU recomendada: ninguna; el entrenamiento se realizó en CPU y la inferencia es trivialmente ligera.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier ordenador con Python y las dependencias instaladas (gymnasium, stable-baselines3, mujoco).
- Opciones de despliegue: carga directa con `PPO.load()` en Python; no aplican vLLM, llama.cpp, Ollama ni TGI (son para modelos de lenguaje).
- Latencia y throughput: no disponibles, pero al ser una MLP de pocas capas, la inferencia es del orden de microsegundos por paso en CPU moderna.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Timesteps | Licencia | Formato |
|---|---|---|---|---|---|
| Luna002-Luna75/ppo-pusher-v5 | PPO (MlpPolicy) | Pusher-v5 | 10.000 | MIT | SB3 zip |
| LTU-AI/hdppo-Pusher-v5 | Hybrid-HD-PPO con Fractional Power Encoding | Pusher-v5 | no disponible | no disponible | no disponible |

El modelo de LTU-AI emplea una variante híbrida de PPO con codificación hiperdimensional y un pipeline de prune-and-fine-tune, lo que sugiere un enfoque más sofisticado. Sin embargo, no se dispone de datos de rendimiento comparativos entre ambos modelos. No se han encontrado otros modelos PPO estándar para Pusher-v5 en el Hub con especificaciones detalladas.

## Limitaciones y advertencias

- Entrenamiento insuficiente: 10.000 timesteps es una cantidad muy reducida para la tarea Pusher-v5; es probable que la política no haya convergido y el rendimiento sea subóptimo.
- Sin métricas de evaluación: no se proporcionan recompensas medias, tasas de éxito ni comparativas con baselines, lo que impide validar la calidad del agente.
- Sin especificación de hiperparámetros: no se documentan learning rate, tamaño de capas, gamma, ni configuración de PPO, lo que dificulta la reproducibilidad exacta.
- Entrenado solo en CPU: no se indica si se usó vectorización de entornos ni cuántas semillas se probaron; la variabilidad entre ejecuciones puede ser alta.
- Sin soporte de observaciones visuales: la política es MLP pura, por lo que no procesa imágenes ni sensores de alta dimensión; solo observaciones vectoriales del estado del brazo.
- Alcance limitado: el modelo solo resuelve la tarea específica de Pusher-v5; no es transferible directamente a otros entornos o robots sin reentrenamiento.
- Idioma de la documentación: la model card está en inglés; no hay documentación en español ni en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luna002-Luna75/ppo-pusher-v5
- Perfil del autor: https://huggingface.co/Luna002-Luna75
- Datasets del autor: https://huggingface.co/Luna002-Luna75/datasets
- Documentación del entorno Pusher (Gymnasium): https://gymnasium.farama.org/environments/mujoco/pusher/
- Modelo comparable (LTU-AI): https://huggingface.co/LTU-AI/hdppo-Pusher-v5
