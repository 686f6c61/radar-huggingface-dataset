# moona-ai/mujoco-pusher-v5-ppo

## Resumen

El modelo `moona-ai/mujoco-pusher-v5-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno de control robótico continuo `Pusher-v5` de Gymnasium MuJoCo. Desarrollado por el equipo de moona-ai, el agente controla un brazo manipulador industrial de 7 grados de libertad (7-DOF) que debe empujar un objeto cilíndrico hasta una posición objetivo sobre una mesa de trabajo.

La política es una MLP de dos capas con 64 unidades ocultas cada una (MlpPolicy de Stable-Baselines3 v2.9) y observa un vector de estado continuo de 23 dimensiones que incluye ángulos articulares, velocidades y vectores relativos entre el extremo del brazo, el objeto y el objetivo. La recompensa es densa y combina términos de aproximación, empuje y penalización de control.

El modelo resulta relevante como referencia para investigación en control robótico continuo, evaluación de algoritmos RL y experimentos de sim-to-real, ya que se publica con licencia MIT y puede cargarse directamente con Stable-Baselines3. El repositorio tiene 0 descargas y 0 likes, lo que indica una adopción muy limitada hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO con MlpPolicy (MLP de dos capas, 64-64 unidades ocultas) |
| Parametros totales | no disponible (política MLP pequeña) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | zip (Stable-Baselines3, archivo `ppo_pusher_latest.zip`) |

## Arquitectura y entrenamiento

El agente se entrena con PPO implementado en Stable-Baselines3 v2.9, con una política MLP de dos capas ocultas de 64 unidades cada una y activación Tanh/ReLU. El espacio de acción es continuo y de 7 dimensiones, correspondiente a los pares de torsión aplicados a cada articulación del brazo robótico, con un rango de -2.0 a 2.0 N·m por articulación. El manipulador corresponde a un brazo robótico estilo PR2 modificado.

El vector de observación declarado es de 23 dimensiones: 14 corresponden a los cosenos y senos de los ángulos articulares, 7 a las velocidades articulares, y las restantes a los vectores relativos entre la punta del efector y el objeto, entre el objeto y el objetivo, y las coordenadas cartesianas del objetivo. La función de recompensa es densa y combina tres términos: aproximación de la punta al objeto, empuje del objeto hacia el objetivo y penalización cuadrática del par de control.

Los hiperparámetros de entrenamiento incluyen tasa de aprendizaje de 3e-4 con optimizador Adam, 1024-2048 pasos por rollout, tamaño de lote de 64, 10 épocas por actualización, factor de descuento gamma de 0.99, parámetro GAE lambda de 0.95, clip range de 0.2, coeficiente de función de valor de 0.5, coeficiente de entropía de 0.0 y norma de gradiente máxima de 0.5.

## Capacidades

- Control continuo de un brazo robótico de 7 grados de libertad mediante pares de torsión articulares.
- Empuje de un objeto cilíndrico hacia una posición objetivo en un espacio de trabajo 2D.
- Observación de estado de 23 dimensiones con información cinemática completa del brazo.
- Manejo de recompensas densas con tres componentes (aproximación, empuje y penalización de control).
- Inferencia interactiva con renderizado 3D mediante Gymnasium MuJoCo.
- Carga directa de pesos preentrenados con Stable-Baselines3 mediante `PPO.load()`.

## Casos de uso

- Investigación en algoritmos de aprendizaje por refuerzo: el modelo sirve como baseline para comparar variantes de PPO, TRPO, SAC o TD3 en el entorno Pusher-v5, un benchmark estándar de control continuo.
- Evaluación de funciones de recompensa: al ser un entorno con recompensa densa y bien definida, permite estudiar el efecto de distintos pesos en los términos de aproximación, empuje y penalización de control.
- Experimentos de sim-to-real: el modelo puede usarse como referencia para estudiar la transferencia de políticas entrenadas en simulación a brazos robóticos reales tipo PR2, aunque no hay evidencia de validación física.
- Docencia en robótica y RL: el modelo es adecuado para cursos y talleres donde se necesite un agente funcional de control continuo sin entrenarlo desde cero, gracias a su carga sencilla con Stable-Baselines3.
- Benchmarking de infraestructura de inferencia: al ser un modelo muy pequeño, permite medir latencia y throughput de frameworks de inferencia RL sin requerir GPU.
- Desarrollo de curriculum learning: el entorno Pusher-v5 puede usarse para probar estrategias de curriculum y el modelo preentrenado como baseline de comparación.
- Integración en pipelines de robótica simulada: el agente puede integrarse en entornos de simulación más amplios que requieran un manipulador capaz de empujar objetos a posiciones objetivo.

## Benchmarks y rendimiento

El autor declara en el model-index el siguiente resultado:

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| Pusher-v5 (MuJoCo) | Control robótico continuo | Mean Evaluation Reward | -20.5 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La recompensa media de evaluación negativa indica que el agente no resuelve la tarea de forma óptima, aunque consigue una política funcional de empuje.

## Requisitos de hardware

- El modelo es extremadamente ligero: una política MLP de dos capas con 64 unidades ocultas, por lo que la inferencia se ejecuta sin problemas en CPU.
- No requiere GPU para inferencia ni entrenamiento.
- VRAM estimada: no aplica (inferencia en CPU).
- RAM necesaria: menos de 100 MB para cargar el modelo y el entorno.
- Despliegue: se integra directamente con Stable-Baselines3 y Gymnasium; no requiere vLLM, llama.cpp ni Ollama.
- Latencia: no disponible, pero al tratarse de una MLP de 64-64 unidades, la inferencia es del orden de microsegundos por paso en una CPU moderna.

## Comparativa con modelos similares

Existen otros repositorios públicos con agentes PPO para el mismo entorno Pusher-v5, como `Luna002-Luna75/ppo-pusher-v5` y `Hwihwa-Lab/pusher-v5-ppo`. No se dispone de datos de rendimiento comparables publicados para estos modelos, por lo que no es posible establecer una comparativa cuantitativa.

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia |
|---|---|---|---|---|
| moona-ai/mujoco-pusher-v5-ppo | PPO | Pusher-v5 | -20.5 | MIT |
| Luna002-Luna75/ppo-pusher-v5 | PPO | Pusher-v5 | no disponible | no disponible |
| Hwihwa-Lab/pusher-v5-ppo | PPO | Pusher-v5 | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado únicamente en simulación MuJoCo; no hay evidencia de validación sim-to-real en un brazo físico.
- La recompensa media de evaluación es negativa (-20.5), lo que indica que la política no resuelve la tarea de forma óptima y puede fallar en configuraciones iniciales adversas.
- El coeficiente de entropía es 0.0, lo que puede provocar convergencia prematura a políticas deterministas con poca exploración.
- La model card declara un vector de observación de 23 dimensiones, pero la descomposición que proporciona suma 30 (14 + 7 + 3 + 3 + 3); existe una inconsistencia en la documentación que conviene verificar antes de usar el modelo.
- No es un modelo de lenguaje: no genera texto, código ni responde a instrucciones en lenguaje natural.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño del repo es 0.0 GB, lo que sugiere que puede tratarse de un proyecto reciente o con poca adopción.
- No se han publicado análisis de robustez ante perturbaciones del entorno ni variaciones de los parámetros físicos del brazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moona-ai/mujoco-pusher-v5-ppo
- Documentación del entorno Pusher en Gymnasium: https://gymnasium.farama.org/environments/mujoco/pusher/
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Paper de PPO (arXiv:1707.06347): https://arxiv.org/abs/1707.06347
- Repositorio similar de Hwihwa-Lab: https://github.com/Hwihwa-Lab/pusher-v5-ppo
