# hwihwalab/pusher-v5-ppo

## Resumen

El modelo `hwihwalab/pusher-v5-ppo` es un agente de aprendizaje por refuerzo profundo (deep reinforcement learning) basado en el algoritmo Proximal Policy Optimization (PPO), desarrollado por el laboratorio Hwihwa-Lab. Está diseñado para resolver la tarea de control continuo de un brazo robótico de 7 grados de libertad (7-DOF) en el entorno de simulación MuJoCo `Pusher-v5` de Gymnasium. El objetivo del agente es empujar un cilindro (objeto) hasta una posición meta utilizando el extremo del brazo (fingertip). El modelo se distribuye como un artefacto de Stable-Baselines3 (formato `.zip`), con una política de tipo MLP (`MlpPolicy`).

La relevancia de este modelo radica en que demuestra un pipeline completo de entrenamiento de RL en un entorno de control continuo, incluyendo un panel de telemetría web en tiempo real (FastAPI + WebSocket) y herramientas de evaluación y exportación de vídeos. Aunque no es un modelo de lenguaje ni de visión, es un ejemplo representativo de aplicación de RL a robótica de manipulación, con métricas de convergencia publicadas por el autor. El tamaño del modelo no se especifica (probablemente una MLP pequeña) y no aplica contexto de tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO con `MlpPolicy` (Stable-Baselines3) |
| Parametros totales | No disponible (MLP pequeña, no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entorno de control continuo) |
| Tipos de cuantizacion | No aplica (no es un modelo de lenguaje) |
| Idiomas soportados | en, ko (para documentación, no para procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch / Stable-Baselines3 (`.zip` con `ppo_pusher.zip`) |

## Arquitectura y entrenamiento

El modelo usa una política MLP (perceptrón multicapa) como aproximador de política y valor, entrenada con PPO (Proximal Policy Optimization) de la librería Stable-Baselines3. El espacio de observación es un vector continuo de 23 dimensiones que incluye posiciones y velocidades de las articulaciones, coordenadas 3D del extremo del brazo, del objeto y del objetivo. El espacio de acción es un vector de 7 dimensiones continuas que representan torques bipolares en el rango `[-2.0, 2.0]` Nm.

El entrenamiento se realizó durante 300.000 pasos de simulación. El retorno medio de evaluación (5 episodios) alcanzó **-32.42 ± 4.30** (pico de -26.15), partiendo de un baseline de -57.51 (exploración aleatoria). La proximidad brazo-objeto se redujo a 0.028 m y la precisión de proximidad al objetivo a 0.054 m. No se aplicó RLHF ni DPO, únicamente PPO estándar. No se reporta innovación técnica específica más allá del uso de PPO y del entorno estándar.

## Capacidades

- Control continuo de un brazo robótico de 7 DOF en el entorno MuJoCo Pusher-v5.
- Empuje de un objeto cilíndrico hasta una posición objetivo mediante el extremo del brazo.
- Integración con un panel web de telemetría en tiempo real (30 FPS) que muestra la dinámica del sistema y permite control manual (start, pause, step, reset, policy).
- Presets de presupuesto de entrenamiento (500, 2000, 5000 y 10000 episodios) para reentrenamiento rápido.
- Exportación de vídeos MP4 y GIF animados de los checkpoints de aprendizaje (desde exploración aleatoria hasta convergencia).
- Evaluación en modo CLI con scripts `evaluate.py` y carga directa en 5 líneas de Python.
- No soporta tool calling, visión, audio ni generación de texto (es un modelo de control, no un LLM).

## Casos de uso

- **Investigación en control robótico**: permite probar algoritmos de RL en un entorno continuo con 7 grados de libertad, sirviendo como baseline para comparar variantes de PPO o nuevos métodos.
- **Educación en aprendizaje por refuerzo**: ideal para enseñar conceptos de PPO, control continuo y evaluación de políticas en un entorno estándar de Gymnasium.
- **Prototipado de sistemas de teleoperación**: el panel web integrado permite inspeccionar en tiempo real el comportamiento del agente, útil para depurar o visualizar el progreso de entrenamiento.
- **Punto de partida para transfer learning**: se puede cargar el modelo preentrenado y ajustarlo con más pasos o con modificaciones del entorno (por ejemplo, cambios en la recompensa o en la dinámica).
- **Generación de datasets de demostración**: al ejecutar el agente entrenado se pueden registrar trayectorias de acción-estado para usar en aprendizaje por imitación (IL) o aprendizaje por refuerzo fuera de línea.
- **Benchmark de rendimiento en control continuo**: el modelo ofrece una referencia numérica (recompensa media) para comparar con otros algoritmos (SAC, TD3, HDPPO) en el mismo entorno.

## Benchmarks y rendimiento

El autor declara en el model-index el siguiente resultado oficial:

| Tarea | Entorno | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | Gymnasium MuJoCo Pusher-v5 | Mean Evaluation Reward (5-Ep Average) | -32.42 |

Además, en la model card se indican datos complementarios: baseline (paso 0) de -57.51, convergencia de -32.42 ± 4.30 con pico de -26.15, proximidad brazo-objeto de 0.028 m y proximidad al objetivo de 0.054 m. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no se especifica, pero al ser una MLP de dimensiones modestas (observación 23, acción 7) la inferencia requiere muy poca memoria (menos de 1 GB). El entrenamiento con 300k pasos puede ejecutarse en una GPU de gama media (por ejemplo, GTX 1660 o superior) o incluso en CPU con tiempo de entrenamiento mayor.
- **GPU recomendada**: cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) para acelerar el entrenamiento; para inferencia puede funcionar en CPU.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU moderna es suficiente.
- **Opciones de despliegue**: el modelo se ejecuta como script Python con Stable-Baselines3; también se puede servir mediante el panel web FastAPI incluido. No es compatible con vLLM, Ollama ni TGI (no es un LLM).
- **Latencia y throughput**: no disponibles, pero al ser una MLP pequeña, la inferencia es del orden de microsegundos por paso en GPU.

## Comparativa con modelos similares

Existen otros agentes PPO para el mismo entorno `Pusher-v5` en Hugging Face, aunque no se dispone de métricas comparativas directas.

| Modelo | Algoritmo | Observación | Acción | Licencia |
|---|---|---|---|---|
| `hwihwalab/pusher-v5-ppo` | PPO (SB3) | 23-dim | 7-dim continua | No disponible |
| `artnfull/connect-ai-artnfull-mujoco-pusher-ppo` | PPO | No especificado | No especificado | No disponible |
| `LTU-AI/hdppo-Pusher-v5` | HD-PPO (hiperdimensional) | No especificado | No especificado | No disponible |

No hay datos de rendimiento comparables publicados. Se recomienda revisar la documentación de cada repositorio para más detalles.

## Limitaciones y advertencias

- **Licencia**: no se ha publicado una licencia, por lo que el uso comercial no está garantizado; se debe contactar con el autor.
- **Sobreajuste al entorno**: el modelo está entrenado específicamente para `Pusher-v5` con física MuJoCo; no es transferible directamente a otros entornos sin reentrenamiento.
- **No es un LLM**: no tiene capacidades de lenguaje, visión ni tool calling; es exclusivamente un controlador de bajo nivel.
- **Riesgo de alucinación**: no aplica (no genera texto).
- **Dependencia de versiones**: requiere Stable-Baselines3 y Gymnasium con la versión exacta de `Pusher-v5`; cambios en el entorno pueden romper el modelo.
- **Datos de sesgos**: no aplica por ser un modelo de control, no de lenguaje.
- **Rendimiento limitado**: la recompensa media es negativa (-32.42), lo que indica que el agente aún no resuelve la tarea de forma óptima; el autor reporta convergencia con margen de mejora.

## Enlaces

- Hugging Face: [hwihwalab/pusher-v5-ppo](https://huggingface.co/hwihwalab/pusher-v5-ppo)
- Repositorio GitHub: [Hwihwa-Lab/pusher-v5-ppo](https://github.com/Hwihwa-Lab/pusher-v5-ppo)
- Documentación del entorno: [Gymnasium MuJoCo Pusher](https://gymnasium.farama.org/environments/mujoco/pusher/)
- Modelo similar de otro autor: [artnfull/connect-ai-artnfull-mujoco-pusher-ppo](https://huggingface.co/artnfull/connect-ai-artnfull-mujoco-pusher-ppo)
- Modelo con variante HD-PPO: [LTU-AI/hdppo-Pusher-v5](https://huggingface.co/LTU-AI/hdppo-Pusher-v5)
