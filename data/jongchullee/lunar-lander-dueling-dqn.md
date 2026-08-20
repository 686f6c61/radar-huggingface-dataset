# jongchullee/lunar-lander-dueling-dqn

## Resumen

El modelo `jongchullee/lunar-lander-dueling-dqn` es un agente de aprendizaje por refuerzo profundo (deep reinforcement learning) entrenado para resolver el entorno `LunarLander-v3` de Gymnasium. Desarrollado por el usuario jongchullee, implementa una variante del algoritmo DQN conocida como Dueling Double-DQN (D3QN), que combina la arquitectura dueling (dos flujos de valor y ventaja) con la corrección de sobreestimación del Double DQN. El agente alcanza una recompensa media de 289.2 en evaluación, superando ampliamente el umbral de 200 puntos que se considera "resuelto" en este entorno.

Este modelo es relevante como ejemplo práctico de aplicación de técnicas de RL a un problema de control continuo con espacio de acciones discreto. Aunque no es un modelo de lenguaje, su publicación en HuggingFace permite a desarrolladores e investigadores estudiar una implementación completa de D3QN, incluyendo el código de entrenamiento y el checkpoint de pesos. El repositorio es extremadamente ligero (0.0 GB), lo que indica que solo contiene los pesos del agente y posiblemente el código de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling Double-DQN (D3QN) - red neuronal con dos flujos (valor y ventaja) |
| Parametros totales | no disponible (red pequeña, típicamente < 1M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no procesamiento de secuencias) |
| Tipos de cuantizacion | no disponible (no se menciona cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`.pth`), según el código de inferencia proporcionado |

## Arquitectura y entrenamiento

El agente utiliza una arquitectura Dueling Double-DQN, que separa la estimación del valor de estado en dos flujos: uno para el valor de estado (V) y otro para la ventaja de cada acción (A). La combinación de ambos produce los Q-valores, lo que mejora la estabilidad del aprendizaje en entornos con muchas acciones similares. El entrenamiento emplea Double DQN para reducir la sobreestimación de los Q-valores, utilizando una red objetivo actualizada mediante Polyak averaging (τ = 0.005). La función de pérdida es Smooth L1 (Huber loss) y la exploración sigue una estrategia epsilon-greedy que decae de 1.0 a 0.05 durante el entrenamiento.

El espacio de estados tiene 8 dimensiones (posición, velocidad, ángulo, velocidad angular y contactos de las patas), y el espacio de acciones es discreto con 4 acciones (no hacer nada, disparar RCS izquierdo, motor principal, RCS derecho). El entorno es `LunarLander-v3` de Gymnasium. No se especifican detalles sobre el número de episodios de entrenamiento, tamaño del buffer de experiencia ni otros hiperparámetros, aunque la implementación sigue los estándares de la literatura.

## Capacidades

- Control de aterrizaje en el entorno LunarLander: el agente es capaz de realizar aterrizajes suaves y estables en la plataforma designada.
- Toma de decisiones secuencial: dado un estado de 8 dimensiones, selecciona una de 4 acciones discretas en cada paso temporal.
- Robustez: la recompensa media de 289.2 indica un rendimiento consistente, muy por encima del umbral de 200 puntos que define la resolución del entorno.
- Inferencia en tiempo real: al ser una red pequeña, la inferencia es extremadamente rápida, apta para simulación en tiempo real.

## Casos de uso

- Investigación en RL: sirve como punto de partida para estudiar la implementación de Dueling Double-DQN, comparar con otras variantes (DQN clásico, Double DQN, Dueling DQN) y reproducir resultados.
- Benchmark de algoritmos: se puede utilizar como agente de referencia para evaluar nuevas técnicas de exploración, funciones de recompensa o arquitecturas en el entorno LunarLander.
- Educación en aprendizaje por refuerzo: el código y los pesos permiten a estudiantes ejecutar inferencia y visualizar el comportamiento del agente, facilitando la comprensión de conceptos como Q-learning, redes dueling y Double DQN.
- Pruebas de integración de Gymnasium: el modelo puede emplearse para verificar que el entorno `LunarLander-v3` funciona correctamente en diferentes versiones de Gymnasium.
- Desarrollo de controladores basados en RL: aunque el entorno es un toy problem, la metodología puede extrapolarse a problemas de control similares con espacios de acción discretos.
- Comparación de frameworks: al estar implementado en PyTorch, permite comparar el rendimiento y la facilidad de uso con implementaciones en TensorFlow o JAX.

## Benchmarks y rendimiento

El autor declara una recompensa media de 289.2 en el entorno `LunarLander-v3`. No se proporcionan comparaciones con otros agentes en la misma tabla de benchmarks.

| Tarea | Entorno | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | LunarLander-v3 | Mean Reward | 289.2 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una red neuronal pequeña (típicamente menos de 1M de parámetros), por lo que puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: no aplica (inferencia en CPU).
- GPU recomendada: no necesaria; si se desea acelerar, cualquier GPU con soporte CUDA (por ejemplo, NVIDIA GTX 1050 o superior) es suficiente.
- Opciones de despliegue: el código de inferencia proporcionado usa PyTorch directamente; también puede integrarse en entornos Gymnasium para simulación.
- Latencia: del orden de microsegundos por paso de decisión, dado el tamaño reducido de la red.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros agentes DQN para LunarLander en la información proporcionada. Existen repositorios públicos con implementaciones de DQN, Double DQN y Dueling DQN para el mismo entorno, pero no se han publicado métricas comparables en fuentes verificadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el entorno `LunarLander-v3`; no generaliza a otros entornos o tareas.
- No se especifica la licencia, por lo que su uso comercial o redistribución puede estar sujeto a restricciones no declaradas.
- No se proporcionan detalles sobre el proceso de entrenamiento (número de episodios, semillas, etc.), lo que dificulta la reproducibilidad exacta.
- El repositorio no incluye el código de entrenamiento completo, solo el checkpoint y un fragmento de inferencia; el código de la clase `DQNAgent` no está incluido en la model card.
- Al ser un agente RL, no tiene capacidades de procesamiento de lenguaje natural ni de razonamiento simbólico.
- La recompensa media de 289.2 es una métrica declarada por el autor y no ha sido verificada de forma independiente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/jongchullee/lunar-lander-dueling-dqn)
- [Repositorio de referencia: FatemeTaroodi/LunarLander-DQN](https://github.com/FatemeTaroodi/LunarLander-DQN) (implementación comparativa de variantes DQN)
- [Repositorio de referencia: ChienTeLee/dueling_dqn_lunar_lander](https://github.com/ChienTeLee/dueling_dqn_lunar_lander) (implementación de Dueling DQN)
- [Modelo similar: tnvjjr/Lunar_Lander_DeepQ_Learning_Model](https://huggingface.co/tnvjjr/Lunar_Lander_DeepQ_Learning_Model) (DQN clásico con visualizador)
