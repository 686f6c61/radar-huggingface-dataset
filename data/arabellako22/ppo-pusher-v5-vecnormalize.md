# arabellako22/ppo-pusher-v5-vecnormalize

# PPO Pusher-v5 con VecNormalize

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de Proximal Policy Optimization (PPO) sobre el entorno Pusher-v5 de Gymnasium/MuJoCo, desarrollado por arabellako22. El modelo resuelve la tarea de controlar un brazo robótico para empujar un objeto hasta una posición objetivo, un problema clásico de control continuo en aprendizaje por refuerzo. El checkpoint incluido es el mejor de la evaluación y ha superado dos criterios de validación: superar la recompensa media de una política aleatoria y reproducir la misma recompensa mediante un replay determinista en un proceso aislado de MuJoCo. La arquitectura es una red neuronal de política y valor con dos capas ocultas de 256 neuronas ReLU, entrenada con 1.007.616 timesteps en CPU. El modelo es relevante porque sirve como referencia reproducible para comparar algoritmos de RL en entornos de control continuo, especialmente con técnicas de exploración como gSDE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (Proximal Policy Optimization) con redes de política y valor de 256x256 ReLU |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entorno de control con observaciones continuas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de Stable-Baselines3 en .zip (ppo-Pusher-v5.zip) |

## Arquitectura y entrenamiento

El modelo se basa en el algoritmo PPO implementado en Stable-Baselines3, con redes de política y valor de 256x256 ReLU. Se entrenó con 1.007.616 timesteps (solicitados 1.000.000) en 4 entornos vectorizados, con semilla 42, en CPU. La tasa de aprendizaje siguió un programa lineal de 3e-4 a 3e-5. Se utilizó Generalized State-Dependent Exploration (gSDE) para exploración, con un batch size de 256 y un target KL de 0.03. El entrenamiento se monitorizó con EvalCallback cada 50.000 timesteps, seleccionando el mejor checkpoint según la recompensa media. El mejor checkpoint alcanzó una recompensa de -25.909 en el callback. No se realizó RLHF ni DPO, al tratarse de un agente de control.

## Capacidades

- Control de un brazo robótico en el entorno Pusher-v5 de MuJoCo, empujando un objeto hasta una posición objetivo.
- Aprendizaje por refuerzo con PPO y exploración gSDE.
- Reproducibilidad: el checkpoint incluye estadísticas de VecNormalize y un proceso de replay determinista verificado.
- Soporte para espacios de acción continuos (Box) gracias a gSDE.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni soporte de agentes conversacionales, al ser un modelo de control.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como referencia para comparar el rendimiento de PPO con gSDE en Pusher-v5, un entorno estándar de MuJoCo.
- Evaluación de reproducibilidad: el checkpoint incluye verificación de replay determinista, útil para validar pipelines de evaluación en entornos de control continuo.
- Docencia en RL: el modelo y el código de carga son ejemplos claros de cómo entrenar y evaluar un agente PPO con VecNormalize en Gymnasium.
- Desarrollo de módulos de renderizado seguro: el módulo safe_mujoco_render.py permite reproducir la evaluación y renderizado en entornos MuJoCo sin conflictos de OpenGL en entornos headless, útil para CI/CD.
- Benchmark de algoritmos de exploración: gSDE es una técnica de exploración que puede compararse con otras (p. ej., ruido gaussiano fijo) en el mismo entorno.
- Pruebas de integración de Stable-Baselines3: el checkpoint sirve para verificar que las versiones de Gymnasium, MuJoCo y PyTorch funcionan correctamente en un entorno de producción o Colab.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Recompensa media entrenada (PPO) | -28.93 |
| Desviación estándar entrenada | 3.67 |
| Episodios de evaluación PPO | 30 |
| Recompensa media aleatoria | -148.67 |
| Desviación estándar aleatoria | 7.58 |
| Episodios aleatorios | 30 |
| Mejora sobre política aleatoria | 119.74 |
| Criterio de éxito superado | True |
| Recompensa de replay verificada | True |
| Backend de renderizado | egl |
| Frames de replay | 101 |

En Pusher-v5, las recompensas son negativas; valores más cercanos a cero son mejores. No se han publicado benchmarks estándar como MMLU o HumanEval porque no es un modelo de lenguaje.

## Requisitos de hardware

- El entrenamiento se realizó en CPU con 4 entornos vectorizados, lo que indica que no se requiere GPU para reproducir el entrenamiento.
- Para la inferencia, el modelo es una red de 256x256 ReLU, por lo que se puede ejecutar en cualquier CPU moderna sin necesidad de VRAM.
- No se han proporcionado datos de VRAM, latencia o throughput.
- El despliegue se realiza mediante Stable-Baselines3 con PPO.load y VecNormalize.load; no se mencionan opciones como vLLM, llama.cpp, Ollama o TGI, que son propias de modelos de lenguaje.
- El entorno de evaluación requiere MuJoCo 3.12.0 y Gymnasium 1.3.0, con backend EGL u OSMesa para renderizado.

## Comparativa con modelos similares

Existen otros checkpoints de PPO para Pusher-v5 en Hugging Face, como Luna002-Luna75/ppo-pusher-v5 y hwihwalab/pusher-v5-ppo, pero no se dispone de información pública detallada sobre sus especificaciones ni resultados para comparar. Por tanto, no se puede realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el entorno Pusher-v5, por lo que no generaliza a otros entornos ni a robots reales sin técnicas de sim2real.
- La recompensa media es negativa (-28.93), lo que indica que la tarea no se resuelve completamente; el agente mejora sobre la política aleatoria pero no alcanza una recompensa óptima.
- Es obligatorio cargar las estadísticas de VecNormalize junto con el checkpoint; de lo contrario, las observaciones no se normalizan y el comportamiento no se reproduce.
- La licencia no está especificada, por lo que se desconoce si el modelo puede utilizarse en aplicaciones comerciales.
- El modelo no tiene capacidades de lenguaje, visión ni razonamiento simbólico; es exclusivamente un agente de control continuo.
- El proceso de renderizado requiere un backend compatible (EGL u OSMesa) en entornos headless; en otros entornos puede haber conflictos de OpenGL.

## Enlaces

- Hugging Face: https://huggingface.co/arabellako22/ppo-pusher-v5-vecnormalize
- Modelo similar: https://huggingface.co/Luna002-Luna75/ppo-pusher-v5
- Modelo similar: https://huggingface.co/hwihwalab/pusher-v5-ppo
