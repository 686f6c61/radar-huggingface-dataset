# Gwanwoo/simtoolreal-best-ep145224

## Resumen

SimToolReal-best-ep145224 es un checkpoint de aprendizaje por refuerzo (RL) publicado por Gwanwoo en Hugging Face. No se trata de un modelo de lenguaje, sino de una política (policy) entrenada para control robótico de manipulación diestra: un único controlador condicionado por pose objetivo que gobierna un brazo KUKA iiwa14 con una mano Sharpa, con un espacio de acción de 29 dimensiones (7 para el brazo y 22 para la mano). El autor lo presenta como reproducción del trabajo SimToolReal (arXiv:2602.16863) y lo entrena con SAPG sobre rl_games dentro del simulador Isaac Lab.

El artefacto relevante para el despliegue es un checkpoint de rl_games (`model.pth`) acompañado de su `config.yaml`, que define la configuración de red y de player. La observación tiene 140 dimensiones, la acción vive en [-1, 1], el control se ejecuta a 60 Hz sobre una física simulada a 120 Hz y se aplica un suavizado de movimiento del brazo (`arm_moving_average` 0.1). El checkpoint corresponde a la mejor recompensa de entrenamiento (epoch 145.224, recompensa ~7198).

Por su naturaleza, este repositorio no ofrece generación de texto, visión ni tool calling: es una política de control para simulación robótica. Resulta relevante para investigadores que quieran reproducir o comparar resultados de manipulación diestra condicionada por objetivo, o reutilizar la política como base en pipelines de sim-to-real. La información pública disponible es escasa: no hay licencia declarada, no hay idiomas (no aplica) y no se han publicado métricas de éxito fuera de la recompensa de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política RL (red neuronal entrenada con rl_games/SAPG); no es un transformer ni un LLM |
| Parametros totales | no disponible (el tamaño exacto de la red no se declara; repo de 0.3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 140 dimensiones por paso, no ventana de tokens) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `.pth`; no se publican variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | `model.pth` (checkpoint rl_games) + `config.yaml` |

## Arquitectura y entrenamiento

La política es una red neuronal de control entrenada mediante aprendizaje por refuerzo con el algoritmo SAPG implementado en rl_games, dentro del entorno de simulación Isaac Lab. El agente controla un robot compuesto por un brazo KUKA iiwa14 (7 grados de libertad) y una mano Sharpa (22 grados de libertad), sumando un espacio de acción continuo de 29 dimensiones acotado a [-1, 1]. La observación de 140 dimensiones incluye presumiblemente el estado del robot y la pose objetivo (goal pose), ya que el modelo es goal-conditioned: una única política resuelve distintas tareas especificando la pose meta en la observación.

El entrenamiento se ejecuta con control a 60 Hz y física a 120 Hz, aplicando un suavizado de media móvil de 0.1 sobre los comandos del brazo para reducir oscilaciones. El checkpoint publicado es el de mejor recompensa de entrenamiento (epoch 145.224, recompensa ~7198). No se detallan en la información disponible el número total de pasos de entrenamiento, la composición del dataset (al ser RL, la experiencia se genera por interacción en simulación), ni si hubo etapas adicionales de ajuste fino o destilación.

## Capacidades

- Control de manipulación diestra condicionado por pose objetivo sobre un brazo KUKA iiwa14 con mano Sharpa de 22 grados de libertad.
- Ejecución de políticas de RL en tiempo de simulación a 60 Hz de control con física a 120 Hz.
- Generalización a múltiples objetivos dentro de la misma política (goal-conditioned), sin necesidad de un controlador por tarea.
- Integración con Isaac Lab y rl_games para evaluación y reentrenamiento.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, visión, audio ni tool calling.
- No dispone de modo de razonamiento extendido (thinking mode) ni capacidades de agente conversacional.

## Casos de uso

- Reproducción de resultados de SimToolReal: cargar `model.pth` y `config.yaml` en Isaac Lab con rl_games para replicar la recompensa de entrenamiento (~7198) y comparar con variantes propias del algoritmo SAPG.
- Investigación en manipulación diestra condicionada por objetivo: usar la política como línea base para estudiar generalización a nuevas poses meta en tareas de agarre y reorientación con mano antropomórfica.
- Sim-to-real en laboratorio: servir la política como controlador en simulación antes de transferirla a un KUKA iiwa14 físico con mano Sharpa, evaluando robustez frente a ruido y latencia.
- Benchmarking de algoritmos RL: comparar SAPG frente a PPO u otros métodos sobre el mismo entorno y presupuesto de entrenamiento, usando este checkpoint como referencia publicada.
- Desarrollo de entornos y recompensas: reutilizar la configuración de observación (140-D) y acción (29-D) como plantilla para definir nuevas tareas de manipulación en Isaac Lab.
- Docencia y divulgación: demostrar un pipeline completo de RL en robótica (definición de entorno, entrenamiento, checkpoint y evaluación) con artefactos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado es la recompensa de entrenamiento del checkpoint (~7198 en el epoch 145.224); no hay tasas de éxito en tareas, métricas de sim-to-real ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo pesa 0.3 GB, por lo que la política cabe holgadamente en cualquier GPU consumer con al menos unos pocos GB libres, pero el tamaño exacto de la red no se declara.
- GPU recomendadas: no se especifican en la información disponible. Para entrenamiento con Isaac Lab se requieren GPUs NVIDIA con soporte CUDA; para inferencia basta una GPU modesta.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del checkpoint; no se detalla el modelo mínimo.
- Opciones de despliegue: Isaac Lab + rl_games (flujo previsto por el autor); no se publican exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplica a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; el control opera a 60 Hz y la física a 120 Hz en simulación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SimToolReal-best-ep145224 (este) | Política RL goal-conditioned | no disponible | no aplica (obs 140-D) | recompensa entrenamiento ~7198 | no disponible | Hugging Face (0 descargas) |
| Políticas RL de Isaac Lab / rl_games de referencia | Política RL | no disponible | no aplica | no disponible | según repo | Repos públicos de NVIDIA |
| Checkpoints de manipulación diestra publicados por terceros | Política RL | no disponible | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas concretas; la tabla recoge solo categorías de referencia.

## Limitaciones y advertencias

- Modelo de control robótico, no un LLM: no debe evaluarse con métricas de lenguaje (MMLU, HumanEval, GSM8K) ni usarse para tareas de texto.
- Sin licencia declarada: no hay autorización explícita para uso comercial; conviene contactar al autor antes de cualquier despliegue productivo.
- Entrenado en simulación (Isaac Lab): el rendimiento en hardware real no está documentado y requiere validación sim-to-real.
- Dependencia fuerte de la configuración: la política espera observación de 140-D y acción de 29-D con el `config.yaml` provisto; cambios en el entorno invalidan el checkpoint.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por terceros ni de reproducibilidad independiente.
- Sin métricas de éxito publicadas: la recompensa de entrenamiento no garantiza desempeño en tareas concretas.
- Riesgo de sobreajuste al entorno de entrenamiento y sensibilidad a ruido, latencia y calibración del robot físico.
- Idiomas y sesgos: no aplica en el sentido lingüístico; los sesgos relevantes serían de distribución de objetivos y condiciones de simulación, no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/Gwanwoo/simtoolreal-best-ep145224
- Paper citado: arXiv:2602.16863 (SimToolReal)
- Isaac Lab: no se proporciona enlace en la información disponible
- rl_games: no se proporciona enlace en la información disponible
