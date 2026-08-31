# Pro152/LunarLander-v2

## Resumen

El modelo `Pro152/LunarLander-v2` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo Proximal Policy Optimization (PPO) para resolver el entorno `LunarLander-v2` de OpenAI Gym. Fue desarrollado por el usuario Pro152 como parte del curso de Hugging Face Deep Reinforcement Learning (Unidad 8, Parte 1), con una implementación personalizada en PyTorch basada en la referencia de CleanRL. El objetivo del agente es aprender una política que controle un módulo de aterrizaje lunar para posarlo de forma segura en la plataforma designada, maximizando la recompensa acumulada.

Se trata de un modelo pequeño y específico para un entorno de simulación, no de un modelo de lenguaje o visión. Su arquitectura es Actor-Critic con dos redes neuronales de dos capas ocultas de 64 neuronas cada una, con activación Tanh. El espacio de observación tiene 8 dimensiones (posición, velocidad, ángulo, contacto de patas) y el espacio de acciones es discreto con 4 acciones posibles. El entrenamiento se realizó con 50.000 pasos de tiempo, 4 entornos en paralelo y configuración estándar de PPO con GAE. Aunque el repositorio no especifica la licencia ni los idiomas, el modelo está disponible públicamente en Hugging Face y puede ser utilizado para fines educativos y de investigación en RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-Critic (redes feedforward con 2 capas ocultas de 64 neuronas, activación Tanh) |
| Parametros totales | No disponible (estimación aproximada: ~10.000 parámetros según la arquitectura) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entorno de RL, no procesa texto) |
| Tipos de cuantizacion | No disponible (modelo PyTorch pequeño, no se cuantiza) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Actor-Critic clásica. El Actor recibe la observación de 8 valores y produce logits para las 4 acciones discretas, que se convierten en una distribución categórica para muestrear acciones. El Critic estima el valor del estado actual, utilizado para calcular ventajas y retornos. Ambas redes tienen la misma estructura: `Input -> Linear(64) -> Tanh -> Linear(64) -> Tanh -> Linear(salida)`.

El entrenamiento se realizó con PPO, un algoritmo on-policy de gradiente de política. Se empleó Generalized Advantage Estimation (GAE) con gamma=0.99 y lambda=0.95 para equilibrar sesgo y varianza. El objetivo PPO recortado (clipped objective) con epsilon=0.2 limita las actualizaciones de política. Se incluyó regularización por entropía (coeficiente 0.01) para fomentar la exploración, y se aplicó normalización de ventajas, annealing de la tasa de aprendizaje y recorte del valor (clipped value loss). El entrenamiento usó 4 entornos en paralelo, 128 pasos por rollout, 4 minibatches y 4 épocas de actualización, con un total de 50.000 pasos de tiempo. La implementación se basó en CleanRL y el material del curso de Hugging Face.

## Capacidades

- Control de un agente en el entorno LunarLander-v2: el agente aprende a aterrizar el módulo lunar en la plataforma, gestionando los motores laterales y principal.
- Toma de decisiones secuenciales: el agente procesa observaciones continuas (posición, velocidad, ángulo) y selecciona acciones discretas en cada paso.
- Aprendizaje de políticas con PPO: el modelo es un ejemplo de aplicación de PPO con Actor-Critic y GAE.
- No tiene capacidades de procesamiento de lenguaje, visión, tool calling ni generación de texto. Es un modelo puramente de control para un entorno de simulación específico.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como referencia para estudiar el comportamiento de PPO en un entorno de control continuo con acciones discretas, comparar hiperparámetros o analizar la estabilidad del entrenamiento.
- Educación y formación: es un ejemplo didáctico para estudiantes que quieran entender la implementación de PPO desde cero, ya que el código y la configuración están documentados en la model card.
- Benchmarking de algoritmos RL: se puede utilizar como baseline para comparar otros algoritmos (DQN, SAC, etc.) en el mismo entorno, midiendo recompensa media y desviación estándar.
- Simulación de misiones de aterrizaje: aunque es un entorno simplificado, el agente puede servir como prototipo para validar estrategias de control en simulaciones de descenso lunar.
- Desarrollo de agentes para videojuegos: la arquitectura y el entrenamiento son transferibles a otros entornos de Gym con espacios de observación y acción similares.
- Pruebas de integración en pipelines de RL: el modelo puede integrarse en flujos de evaluación automática para verificar que el entorno y las librerías funcionan correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el agente se evalúa durante 10 episodios y se registran la recompensa media y la desviación estándar en `evaluation.txt`, pero no se proporcionan los valores numéricos en la documentación accesible.

## Requisitos de hardware

- El modelo es extremadamente ligero (menos de 10.000 parámetros), por lo que la inferencia se puede ejecutar en cualquier CPU sin necesidad de GPU.
- El entrenamiento se realizó con 4 entornos en paralelo, lo que requiere una CPU moderada; no se especifica el hardware utilizado.
- No se requieren GPUs para inferencia ni para entrenamiento en este tamaño.
- Opciones de despliegue: al ser un modelo PyTorch, se puede cargar directamente con `torch.load()` y ejecutar en cualquier entorno Python. No requiere frameworks especializados como vLLM u Ollama.
- La latencia es del orden de microsegundos por paso, y el throughput está limitado por la velocidad de simulación del entorno, no por el modelo.

## Comparativa con modelos similares

No se dispone de información sobre otros agentes RL entrenados para LunarLander-v2 con la misma configuración o autor. Existen implementaciones de referencia como las de stable-baselines3 o CleanRL, pero no se han encontrado modelos comparables publicados con métricas detalladas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el entorno LunarLander-v2; no generaliza a otros entornos o tareas.
- No es un modelo de lenguaje ni multimodal; no puede procesar texto, imágenes ni audio.
- La licencia no está especificada, por lo que el uso comercial podría ser ambiguo; se recomienda contactar al autor para aclarar los términos.
- El entrenamiento se realizó con un número limitado de pasos (50.000) y 4 entornos, lo que puede dar lugar a una política subóptima o con alta varianza en la recompensa.
- No se han publicado métricas de evaluación detalladas (recompensa media, desviación) en la documentación accesible, lo que dificulta valorar su rendimiento real.
- Al ser un modelo de RL, puede presentar comportamientos erráticos si se ejecuta en condiciones diferentes a las del entrenamiento (por ejemplo, cambios en la física del entorno).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pro152/LunarLander-v2
- Repositorio del curso de Hugging Face Deep RL (referencia): https://huggingface.co/learn/deep-rl-course/unit8/part1 (no verificado directamente, pero mencionado en la model card)
- Implementación de referencia CleanRL: https://github.com/vwxyzjn/cleanrl (mencionada en la model card, no verificada en la búsqueda)
