# Guccimam/lunar-dqn

## Resumen

El modelo `Guccimam/lunar-dqn` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con una arquitectura **Dueling Double Deep Q-Network (Dueling Double DQN)** sobre el entorno `LunarLander-v3` de Gymnasium. Desarrollado por Guccimam, el agente aprende a controlar una nave lunar para realizar aterrizajes suaves y precisos, optimizando la recompensa acumulada mediante la combinación de las técnicas *Double DQN* y *Dueling DQN* sobre una red neuronal PyTorch.

El repositorio incluye los pesos del mejor checkpoint (`checkpoint_best.pth`), la definición de la red (`model.py`) y la implementación del agente con *replay buffer* (`agent.py`). Aunque no se especifican los parámetros totales, se trata de una red pequeña (entrada de 8 estados, salida de 4 acciones) diseñada para ejecutarse en CPU. Su relevancia radica en ser un ejemplo didáctico y funcional de RL aplicado a control continuo, con licencia MIT que permite uso comercial y académico sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling Double Deep Q-Network (red feedforward con dos ramas: valor y ventaja) |
| Parametros totales | no disponible (red pequeña, estimable en miles) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo pesos en punto flotante PyTorch) |
| Idiomas soportados | en (etiqueta del modelo, aunque no es relevante para un agente RL) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (checkpoint) |

## Arquitectura y entrenamiento

El modelo implementa una **Dueling Double DQN**, que combina dos mejoras sobre el DQN clásico. Por un lado, la arquitectura *dueling* separa la estimación del valor de estado y la ventaja de cada acción en dos ramas que se combinan al final, lo que mejora la estabilidad del aprendizaje. Por otro lado, el *Double DQN* utiliza dos redes (una de comportamiento y otra objetivo) para reducir la sobreestimación de los valores Q. La red recibe un vector de estado de 8 dimensiones (posición, velocidad, ángulo, etc.) y produce 4 valores Q correspondientes a las acciones posibles (no hacer nada, empujar hacia la izquierda, empujar hacia la derecha, empujar hacia abajo).

El entrenamiento se realizó sobre el entorno `LunarLander-v3` con un esquema de exploración epsilon que decae de 1.0 a 0.05, es decir, comienza explorando completamente y termina explotando la política aprendida. No se especifican el número de episodios, el tamaño del *replay buffer* ni la tasa de aprendizaje en la información disponible. El objetivo declarado es alcanzar una recompensa media de al menos 200-250 puntos por episodio, lo que indica un aterrizaje suave y exitoso.

## Capacidades

- Control de aterrizaje autónomo en el entorno `LunarLander-v3` de Gymnasium.
- Toma de decisiones en tiempo real basada en un vector de estado continuo de 8 dimensiones.
- Política aprendida mediante aprendizaje por refuerzo off-policy con *replay buffer*.
- Inferencia determinista en modo evaluación (sin exploración) usando `argmax` sobre los valores Q.
- Capacidad de ejecución en CPU sin necesidad de GPU.
- Reproducibilidad mediante semilla fija (el código de ejemplo usa `seed=42`).

## Casos de uso

- **Investigación en aprendizaje por refuerzo**: sirve como punto de partida para estudiar variantes de DQN (dueling, double, priorizado) y comparar su rendimiento en un entorno de referencia estándar.
- **Educación y formación en RL**: el código es compacto y legible, ideal para cursos universitarios o tutoriales que expliquen los fundamentos de DQN, *replay buffer* y redes dueling.
- **Benchmark de algoritmos de control**: puede utilizarse como agente base para comparar nuevas arquitecturas o métodos de exploración en el entorno LunarLander.
- **Prototipado de sistemas de control**: aunque el entorno es simulado, la lógica de entrenamiento y evaluación puede adaptarse a otros problemas de control con espacios de estado y acción discretos.
- **Demostración de despliegue de modelos RL**: el checkpoint en formato `.pth` permite integrar el agente en aplicaciones Python que requieran un controlador autónomo para un problema de aterrizaje simulado.
- **Prueba de integración con Gymnasium**: útil para validar la compatibilidad de entornos Gymnasium con agentes PyTorch en pipelines de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica un rendimiento objetivo de recompensa media mayor o igual a 200-250 puntos por episodio, pero no se proporcionan métricas concretas obtenidas tras el entrenamiento. No se dispone de comparaciones numéricas con otros agentes en el entorno LunarLander.

## Requisitos de hardware

- **VRAM estimada**: no requiere VRAM; la inferencia se ejecuta en CPU con PyTorch.
- **GPU recomendada**: ninguna; una CPU moderna es suficiente para ejecutar el agente en tiempo real.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU con PyTorch instalado puede acelerar la inferencia, pero no es necesaria.
- **Opciones de despliegue**: el modelo se carga directamente con PyTorch (`torch.load`). No se proporcionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible, pero al ser una red pequeña (8 entradas, 4 salidas) la inferencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Formato | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| Guccimam/lunar-dqn | Dueling Double DQN | LunarLander-v3 | PyTorch `.pth` | MIT | Recompensa objetivo >= 200-250 |
| allen73/lunarlander-v3-dqn-physical-ai | Double Dueling DQN | LunarLander-v3 | PyTorch | no disponible | "Flawless, stylish landings" (sin cifras) |
| tnvjjr/Lunar_Lander_DeepQ_Learning_Model | DQN | Lunar Lander (OpenAI Gym) | PyTorch + visualizador Pygame | no disponible | no disponible |
| taeri077/lunar-lander-dqn (GitHub) | DQN | LunarLander-v3 | PyTorch | no disponible | Pico de +319.1 puntos |

La comparativa se basa en los resultados de búsqueda web. No se dispone de datos de rendimiento detallados para los modelos alternativos, salvo el pico de +319.1 del repositorio de taeri077, que supera el objetivo declarado del modelo de Guccimam.

## Limitaciones y advertencias

- **Alcance limitado**: el agente solo funciona en el entorno `LunarLander-v3`; no es transferible directamente a otros problemas sin reentrenamiento.
- **Sin datos de rendimiento verificados**: la model card no incluye métricas reales de recompensa obtenida, solo un objetivo declarado. Es necesario evaluar el checkpoint para confirmar su calidad.
- **Dependencia de Gymnasium**: el código de ejemplo requiere la versión específica `LunarLander-v3`; versiones anteriores o posteriores pueden cambiar la dinámica del entorno.
- **Sesgos del entorno**: el agente puede estar sobreajustado a las condiciones del simulador (física, ruido, semillas) y no generalizar a variaciones no vistas.
- **Licencia MIT**: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni soporte.
- **Sin cuantizaciones ni formatos optimizados**: los pesos están en `.pth` de PyTorch, lo que limita su uso en entornos de producción que requieran formatos como ONNX o TensorRT.

## Enlaces

- [HuggingFace: Guccimam/lunar-dqn](https://huggingface.co/Guccimam/lunar-dqn)
- [allen73/lunarlander-v3-dqn-physical-ai](https://huggingface.co/allen73/lunarlander-v3-dqn-physical-ai)
- [tnvjjr/Lunar_Lander_DeepQ_Learning_Model](https://huggingface.co/tnvjjr/Lunar_Lander_DeepQ_Learning_Model)
- [GitHub: taeri077/lunar-lander-dqn](https://github.com/taeri077/lunar-lander-dqn)
- [Colab: Lunar Lander DQN notebook](https://colab.research.google.com/github/kuds/rl-lunar-lander/blob/main/%5BLunar%20Lander%5D%20Deep%20Q-Network%20(DQN).ipynb)
- [GitHub: galkalimi/Lunar_Lander](https://github.com/galkalimi/Lunar_Lander)
