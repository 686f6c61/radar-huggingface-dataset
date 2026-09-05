# ohyou/lunar-lander-dqn

## Resumen

El repositorio `ohyou/lunar-lander-dqn` contiene los pesos entrenados de un agente de aprendizaje por refuerzo basado en Deep Q-Network (DQN) para resolver el entorno `LunarLander-v3` de Gymnasium. El modelo fue desarrollado por el usuario `ohyou` y está publicado en Hugging Face con el pipeline `reinforcement-learning`. Su objetivo es controlar el aterrizaje de una nave lunar en una superficie plana, maximizando la recompensa acumulada hasta lograr un aterrizaje suave.

La arquitectura utilizada es una red neuronal feedforward de tres capas, cuyos pesos se almacenan en un fichero `.npz` con las claves `W1`, `b1`, `W2`, `b2`, `W3` y `b3`. El entrenamiento se realizó durante 1000 episodios con una política de exploración epsilon decreciente de 1.0 a 0.05, un buffer de repetición de 100 000 transiciones y actualización suave de la red objetivo con `tau = 0.01`. Aunque no se especifican las dimensiones de las capas ni el número total de parámetros, se trata de un modelo compacto, pensado para ejecutarse en CPU sin necesidad de hardware especializado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deep Q-Network (DQN) con red neuronal feedforward de 3 capas |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de RL) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `.npz` (diccionario de pesos numpy) |

## Arquitectura y entrenamiento

El modelo implementa el algoritmo DQN clásico sobre el entorno `LunarLander-v3` de Gymnasium. La red neuronal es un perceptrón multicapa con tres capas densas, cuyas matrices de pesos y vectores de sesgo se guardan como `W1`, `b1`, `W2`, `b2`, `W3` y `b3`. No se proporcionan detalles sobre el número de neuronas por capa ni la función de activación, aunque el código fuente incluido (`luna_lander_dqn.py`) permite reproducir la arquitectura.

Durante el entrenamiento se usó un buffer de repetición con capacidad de 100 000 transiciones, una red objetivo actualizada mediante suavizado exponencial con `tau = 0.01` y un decaimiento de epsilon de 1.0 a 0.05 a lo largo de 1000 episodios. La recompensa objetivo declarada por el autor es superior a 200, lo que corresponde a un aterrizaje suave en la zona de aterrizaje del entorno. No se menciona el uso de técnicas avanzadas como doble DQN, dueling networks o prioridad en el buffer de repetición; se trata de una implementación estándar de DQN.

## Capacidades

- Resuelve el entorno `LunarLander-v3` de Gymnasium, alcanzando una recompensa media superior a 200 en evaluación.
- Aprendizaje off-policy mediante Deep Q-Learning con experiencia replay.
- Soporta modo de evaluación con explotación pura (`epsilon = 0`), como se muestra en el código de ejemplo.
- No soporta tool calling, generación de lenguaje, visión ni audio.
- Es un agente de control específico para el problema de aterrizaje lunar, no un modelo generalista.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como punto de partida para comparar variantes de DQN o para validar implementaciones de algoritmos en el entorno LunarLander.
- Docencia y demostraciones: permite ilustrar de forma práctica el funcionamiento de DQN, la política epsilon-greedy y el uso de redes de objetivo en cursos de RL.
- Prototipado de control en simulación: puede integrarse en proyectos que requieran un agente de aterrizaje lunar como componente de un sistema de control simulado.
- Evaluación de hiperparámetros: los pesos entrenados actúan como referencia para estudiar el efecto de cambios en el buffer de repetición, el factor de descuento o la tasa de aprendizaje.
- Transferencia a entornos similares: aunque está entrenado para `LunarLander-v3`, la estructura de la red puede servir como base para fine-tuning en `LunarLander-v2` u otras variantes del entorno.
- Integración en pipelines de CI/CD para RL: puede usarse como prueba de humo en repositorios que automatizan entrenamientos y evaluaciones de agentes en Gymnasium.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| LunarLander-v3 | Mean Reward | > 200 | No |

No se han publicado resultados de benchmarks adicionales en la información disponible. El único dato declarado es la recompensa media superior a 200, que según el autor corresponde a un aterrizaje suave. No hay comparaciones con otros agentes en la misma model card.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser una red de tres capas muy pequeña, no requiere VRAM dedicada.
- GPU recomendadas: ninguna; el modelo puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna es más que suficiente, aunque no es necesaria.
- Opciones de despliegue: ejecución local mediante Python, Gymnasium y NumPy. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un agente de control por pasos, el rendimiento depende del entorno y de la velocidad de la CPU.

## Comparativa con modelos similares

| Modelo | Entorno | Recompensa media | Licencia | Formato |
|---|---|---|---|---|
| ohyou/lunar-lander-dqn | LunarLander-v3 | > 200 (declarado) | no disponible | `.npz` |
| tnvjjr/Lunar_Lander_DeepQ_Learning_Model | Lunar Lander (OpenAI Gym) | no disponible | no disponible | no disponible |

El modelo de `tnvjjr` es otra implementación de DQN para el mismo entorno, e incluye un visualizador interactivo con Pygame. No se dispone de datos de rendimiento ni de parámetros para comparar de forma cuantitativa. Ambos modelos comparten el mismo enfoque algorítmico y el mismo entorno de referencia.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para `LunarLander-v3`; no es generalizable a otros entornos ni tareas de control.
- La recompensa media de 200+ es un dato declarado por el autor y no ha sido verificado de forma independiente.
- No se especifica la licencia, por lo que el uso comercial o la redistribución de los pesos requieren confirmación del autor.
- El tamaño del repositorio figura como 0.0 GB en Hugging Face, lo que puede indicar que los ficheros de pesos no se han subido correctamente o que la métrica no se ha actualizado.
- Depende de la versión de Gymnasium: el código de ejemplo usa `LunarLander-v3`, mientras que la model card menciona también `v2`, lo que puede causar incompatibilidades si se intenta cargar el modelo con una versión distinta.
- No hay soporte para tool calling, razonamiento simbólico ni interacción en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohyou/lunar-lander-dqn
- Modelo similar de DQN para Lunar Lander: https://huggingface.co/tnvjjr/Lunar_Lander_DeepQ_Learning_Model
