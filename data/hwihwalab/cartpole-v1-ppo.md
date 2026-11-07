# hwihwalab/cartpole-v1-ppo

## Resumen

`hwihwalab/cartpole-v1-ppo` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) sobre el entorno `CartPole-v1` de Gymnasium, publicada por el autor `hwihwalab` a través de la librería Stable-Baselines3. No se trata de un modelo de lenguaje, sino de un agente de control para el problema clásico del péndulo invertido, empaquetado como benchmark de "Physical AI" y transferencia sim-to-real bajo distintos regímenes gravitatorios (Luna, Marte, Tierra, Júpiter).

El modelo resuelve la tarea de equilibrio de una barra sobre un carro mediante una política neuronal feed-forward (MLP con dos capas ocultas y activación Tanh, salida Softmax sobre dos acciones discretas) y se distribuye junto a una demo interactiva en Hugging Face Spaces que permite inyectar perturbaciones físicas y cambiar la gravedad en tiempo real. Su relevancia es fundamentalmente docente y comparativa: enfrenta la política neuronal aprendida contra un controlador óptimo LQR clásico, sirviendo como banco de pruebas reproducible para estudiar robustez y transferencia de dominio.

El repositorio es de tamaño 0.0 GB (los pesos se exportan como JSON para el simulador en JavaScript) y la model card declara un rendimiento perfecto de 500/500 de recompensa media y 100 % de éxito, si bien estas métricas están marcadas como no verificadas (`verified: false`) en el model-index.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward (MLP) con dos capas ocultas y activación Tanh, salida Softmax; entrenada con PPO (Stable-Baselines3) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entorno con observación de 4 dimensiones: posición, velocidad, ángulo y velocidad angular) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones; pesos exportados a JSON para el simulador) |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | no disponible explícitamente; el repositorio usa Stable-Baselines3 (PyTorch) y exporta `cartpole_weights.json` para la demo web |

## Arquitectura y entrenamiento

La política es una MLP pequeña (dos capas ocultas con Tanh y capa de salida Softmax) que mapea el vector de estado de cuatro dimensiones de `CartPole-v1` a una de dos acciones discretas (empujar a izquierda o derecha). El entrenamiento se realiza con PPO mediante Stable-Baselines3, con un script `train.py` que, según la model card, ejecuta 25.000 pasos de entrenamiento. No se documentan en la información disponible el número exacto de tokens (no aplica), la composición del dataset ni el uso de RLHF/DPO, ya que no se trata de un modelo generativo.

La innovación destacable no está en la arquitectura, sino en el entorno de evaluación: un motor de física en JavaScript puro (`cartpole_sim.js`) con integración de Euler y parámetros dinámicos (longitud `L`, masa `M`, gravedad `g`) que permite cambiar la gravedad entre Luna (1,62 m/s²), Marte (3,72 m/s²), Tierra (9,81 m/s²) y Júpiter (24,79 m/s²) para probar la transferencia zero-shot de la política entrenada en Tierra. Se incluye además un controlador LQR clásico (matriz de ganancia de Riccati, `u = -K*x`) como referencia óptima y un motor de retrato de fases (θ frente a θ̇) para visualizar la convergencia al atractor estable (0, 0).

## Capacidades

- Control de equilibrio de péndulo invertido en el entorno `CartPole-v1` de Gymnasium.
- Política determinista de dos acciones (izquierda/derecha) a partir de observaciones de 4 dimensiones.
- Transferencia zero-shot entre regímenes gravitatorios (Luna, Marte, Tierra, Júpiter) según la model card.
- Robustez frente a perturbaciones impulsivas externas (±5 N a ±30 N) inyectadas en la demo interactiva.
- Comparación integrada con un controlador LQR clásico y con una política "undercooked" (insuficientemente entrenada).
- Teleoperación manual y modo de control manual como referencia en la demo.
- Exportación de pesos neuronales a JSON para inferencia en navegador sin dependencias de Python.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio incluye un script de entrenamiento PPO (`train.py`) y un banco de pruebas automatizado (`benchmark_experiments.py`) que permiten reproducir el ciclo completo de entrenamiento y evaluación en un entorno de control clásico de bajo coste computacional.
- Comparación PPO frente a LQR: la demo y el benchmark de 1.800 episodios permiten contrastar empíricamente una política neuronal aprendida con un controlador óptimo clásico, útil para cursos de control y RL.
- Estudio de transferencia sim-to-real y domain randomization: el selector de gravedad planetaria permite observar cómo se degrada o mantiene la política ante cambios en la dinámica física, un escenario habitual en robótica.
- Validación de pipelines de Stable-Baselines3: sirve como caso de prueba mínimo y reproducible para verificar instalaciones, versiones de PyTorch y flujos de exportación de políticas.
- Demos interactivas en navegador: el Space de Hugging Face permite mostrar conceptos de control y RL a audiencias no técnicas mediante perturbaciones con el ratón y visualización del retrato de fases.
- Pruebas de robustez ante perturbaciones: la inyección de impulsos de ±10 N y el modo de choque aleatorio permiten evaluar la recuperación de la política ante disturbios externos.
- Referencia para benchmarks de control clásico: el harness de 1.800 episodios puede reutilizarse como plantilla para evaluar otras políticas en `CartPole-v1`.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | Gymnasium CartPole-v1 | Mean Evaluation Reward (máx. 500) | 500 |
| Reinforcement Learning | Gymnasium CartPole-v1 | Perfect Balance Success Rate (%) | 100 |

La model card menciona además un benchmark de 1.800 episodios con el resultado "100 % Solved", pero no se proporcionan en la información disponible los desgloses por gravedad planetaria ni las métricas del controlador LQR comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; la política es una MLP de dos capas ocultas y cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU moderna (RTX 3060 o superior) acelera el entrenamiento, pero el entrenamiento de 25.000 pasos es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e integrada; también en CPU.
- Opciones de despliegue: Stable-Baselines3 (PyTorch) para entrenamiento e inferencia; el simulador web funciona con JavaScript puro y los pesos exportados en `cartpole_weights.json`, sin dependencias de Python; lanzador local `run.py` en el puerto 8000.
- Latencia y throughput: la demo declara un motor de física a 60 FPS con velocidades de simulación de 0,25x a 10x; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hwihwalab/cartpole-v1-ppo | PPO (MLP) sobre Stable-Baselines3 | CartPole-v1 (Gymnasium) | no disponible | no disponible (obs. de 4 dimensiones) | MIT | Hugging Face + GitHub + Space |
| Controlador LQR clásico (incluido en la demo) | Control óptimo lineal (Riccati) | CartPole con dinámica variable (L, M, g) | no aplica (matriz de ganancia) | no aplica | MIT (dentro del repo) | Incluido en la demo |
| Política "undercooked" (incluida en la demo) | PPO insuficientemente entrenada | CartPole-v1 | no disponible | no disponible | MIT (dentro del repo) | Incluido en la demo |

No se han identificado en la información proporcionada otras políticas PPO públicas sobre `CartPole-v1` con benchmark planetario comparable.

## Limitaciones y advertencias

- Las métricas de rendimiento (500 de recompensa media, 100 % de éxito) están declaradas por el autor y marcadas como no verificadas en el model-index.
- El alcance es exclusivamente el entorno `CartPole-v1`; no es un modelo de propósito general ni un modelo de lenguaje.
- La transferencia zero-shot a otras gravedades se anuncia en la model card, pero no se aportan métricas desglosadas por planeta en la información disponible.
- El repositorio tiene un tamaño de 0.0 GB y solo 8 descargas, por lo que la validación por parte de la comunidad es prácticamente nula.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas en el sentido habitual de los modelos generativos; los idiomas declarados (en, ko) se refieren a la documentación.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright.
- Para producción en robótica real sería necesario reentrenar o ajustar la política con la dinámica del sistema físico objetivo; la política está entrenada en un simulador simplificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwihwalab/cartpole-v1-ppo
- Demo interactiva (Hugging Face Spaces): https://huggingface.co/spaces/hwihwalab/cartpole-v1-ppo
- Repositorio GitHub: https://github.com/Hwihwa-Lab/cartpole-v1-ppo
- Entorno Gymnasium CartPole-v1: https://gymnasium.farama.org/environments/classic_control/cart_pole/
- Documentación de Stable-Baselines3: https://stable-baselines3.readthedocs.io/
- PyTorch: https://pytorch.org/
- Documentación en coreano (README_KR.md): https://github.com/Hwihwa-Lab/cartpole-v1-ppo/blob/main/README_KR.md
- Licencia MIT: https://github.com/Hwihwa-Lab/cartpole-v1-ppo/blob/main/LICENSE
