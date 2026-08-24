# arabellako22/lunarlander-v3-dqn-scratch

## Resumen

El modelo `arabellako22/lunarlander-v3-dqn-scratch` es una implementación de Deep Q-Network (DQN) entrenada desde cero para resolver el entorno `LunarLander-v3` de Gymnasium. Desarrollado por el usuario arabellako22, el agente aprende a aterrizar una nave espacial en una plataforma mediante un control de cuatro acciones discretas, basándose en un estado de ocho variables. La arquitectura es una red neuronal totalmente conectada de tres capas (8-64-64-4) con mecanismos estándar de aprendizaje por refuerzo como experiencia replay, red objetivo y exploración epsilon-greedy. El modelo se distribuye como un archivo de pesos PyTorch (`model.pt`) y no tiene información de licencia ni idiomas asociados.

La relevancia de este modelo radica en su carácter didáctico: es un ejemplo clásico de DQN aplicado a un entorno de control continuo con acciones discretas, útil para comprender los fundamentos del aprendizaje por refuerzo profundo. Aunque su rendimiento alcanza una recompensa media de 200 (el umbral de éxito del entorno), no presenta innovaciones técnicas ni se destaca por su tamaño o complejidad. Es una implementación sencilla y reproducible, orientada a fines educativos o de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal totalmente conectada de 3 capas (8 → 64 → 64 → 4) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (agente de refuerzo, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo es un agente DQN convencional. La red neuronal de tres capas (8 → 64 → 64 → 4) recibe un estado de 8 dimensiones (posiciones, velocidades, ángulos, etc.) y produce un valor Q para cada una de las 4 acciones posibles (hacer nada, empujar izquierda, empujar derecha, empujar abajo). El entrenamiento utiliza un buffer de experiencia replay uniforme con capacidad de 100.000 transiciones, una red objetivo con actualizaciones suaves mediante un factor tau de 0.001, y la función de pérdida MSE con el optimizador Adam a una tasa de aprendizaje de 0.0005. La exploración se gestiona con una política epsilon-greedy que decae de 1.0 a 0.01 a lo largo del entrenamiento. No se especifican datos sobre el número de episodios, pasos de entrenamiento ni la composición del entorno más allá del entorno estándar `LunarLander-v3`.

## Capacidades

- Control de un agente en el entorno `LunarLander-v3` de Gymnasium, tomando decisiones discretas (4 acciones) basadas en un estado continuo de 8 dimensiones.
- Aprendizaje por refuerzo con experiencia replay y red de objetivo para estabilizar el entrenamiento.
- Implementación en PyTorch, fácilmente reproducible para fines educativos o de investigación.
- No posee capacidades de generación de texto, razonamiento simbólico, visión, audio ni tool calling. Es un agente de decisión exclusivo para el entorno Lunar Lander.

## Casos de uso

- **Educación y aprendizaje de DQN**: el modelo sirve como ejemplo didáctico para entender el algoritmo DQN, el uso de buffer de experiencia, redes objetivo y exploración epsilon-greedy. Puede utilizarse en cursos de aprendizaje por refuerzo para mostrar un agente funcional en un entorno clásico.
- **Experimentos de hiperparámetros**: al ser una implementación sencilla y rápida de entrenar, es adecuado para probar variaciones en la arquitectura, la tasa de aprendizaje, el tamaño del buffer o la estrategia de exploración, y comparar el efecto en la recompensa final.
- **Benchmark para otros algoritmos**: sirve como línea base para comparar con algoritmos más avanzados como Double DQN, Dueling DQN o SAC en el mismo entorno, evaluando mejoras en rendimiento o estabilidad.
- **Demostración de inferencia en tiempo real**: el modelo puede cargarse en un entorno con renderizado humano para visualizar el comportamiento aprendido, útil para presentaciones o análisis cualitativo.
- **Prototipo de control de sistemas físicos**: aunque limitado al entorno simulado, el enfoque de DQN puede extrapolarse a problemas de control en sistemas discretos, sirviendo como punto de partida para aplicaciones más complejas.
- **Investigación sobre exploración**: el decaimiento de epsilon puede modificarse para estudiar estrategias de exploración más eficientes, usando este modelo como base.

## Benchmarks y rendimiento

El autor declara en el modelo-index una recompensa media de 200 en el entorno `LunarLander-v3`, con verificación no confirmada. Este valor corresponde al umbral de éxito del entorno (recompensa mayor a 200 se considera resolverlo). No se proporcionan otros benchmarks ni comparaciones con otros agentes.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | LunarLander-v3 | Mean Reward | 200.0 |

## Requisitos de hardware

- **VRAM**: no necesita VRAM específica; la red es extremadamente pequeña (menos de 5.000 parámetros). Puede ejecutarse en CPU sin problemas.
- **GPU recomendada**: ninguna, funciona en cualquier procesador moderno. Si se desea acelerar la inferencia con GPU, cualquier tarjeta con soporte CUDA (incluso una GTX 1050) es suficiente.
- **Opciones de despliegue**: se puede ejecutar con Python y PyTorch directamente, o integrarse en entornos de Gymnasium. No hay soporte oficial para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia**: en CPU, la inferencia tarda milisegundos (típicamente < 1 ms), permitiendo control en tiempo real del entorno.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos similares en la información proporcionada. Existen otros repositorios en Hugging Face como `allen73/lunarlander-v3-dqn-physical-ai` (Double Dueling DQN) o `tnvjjr/Lunar_Lander_DeepQ_Learning_Model`, pero no se han publicado métricas comparables. Se puede afirmar que este modelo es una implementación básica de DQN, mientras que otros pueden incorporar variantes como Double DQN o Dueling, pero no hay evidencia cuantitativa para una comparación.

## Limitaciones y advertencias

- **Especificidad**: el modelo solo funciona en el entorno `LunarLander-v3`; no es transferible a otras tareas o dominios.
- **Alucinación y sesgos**: no aplica, al ser un agente de control y no un modelo de lenguaje.
- **Licencia**: la licencia no está especificada, por lo que su uso en proyectos comerciales o de código abierto queda indeterminado. Se recomienda contactar al autor.
- **Rendimiento**: la recompensa media de 200 es el umbral de éxito, pero no se garantiza que el agente sea robusto ante variaciones del entorno (por ejemplo, condiciones iniciales aleatorias).
- **Documentación**: la model card no incluye detalles sobre el proceso de entrenamiento, número de episodios ni estrategias de regularización, lo que limita su reproducibilidad.
- **Formato de pesos**: el archivo `model.pt` no es un formato estándar de intercambio como `safetensors`, lo que puede complicar la interoperabilidad con otros frameworks.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/arabellako22/lunarlander-v3-dqn-scratch)
- [Video de demostración](https://huggingface.co/arabellako22/lunarlander-v3-dqn-scratch/resolve/main/replay.mp4)
- [Documentación del entorno Lunar Lander (Gymnasium)](https://gymnasium.farama.org/environments/box2d/lunar_lander/)
