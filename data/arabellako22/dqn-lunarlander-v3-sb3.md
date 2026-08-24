# arabellako22/dqn-LunarLander-v3-sb3

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo Deep Q-Network (DQN) para resolver el entorno LunarLander-v3 de Gymnasium. Ha sido desarrollado por el usuario arabellako22 y publicado en Hugging Face utilizando la librería Stable-Baselines3, una de las más extendidas en el ecosistema RL. El objetivo del agente es controlar una nave lunar para que aterrice de forma segura y eficiente en una plataforma designada, optimizando la recompensa acumulada.

El modelo se ha entrenado durante 300 000 pasos de entorno con una red neuronal de dos capas ocultas de 256 unidades cada una. Aunque se trata de un modelo de pequeño tamaño, demuestra un rendimiento sólido en la tarea, alcanzando una recompensa media de 279,88 ± 15,19. Su relevancia radica en ser un ejemplo reproducible de entrenamiento de RL con Stable-Baselines3, útil para fines educativos, prototipado y como punto de partida para experimentos más complejos en control continuo y toma de decisiones secuenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deep Q-Network (DQN) con red neuronal feedforward de 2 capas ocultas de 256 neuronas (net_arch=[256, 256]) |
| Parametros totales | No disponible (no se especifica en la informacion publicada; se estima en torno a 66 000 parametros para una entrada de 8 variables y 4 acciones, pero no es un dato oficial) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica a un modelo de RL) |
| Tipos de cuantizacion | No disponible (el modelo se distribuye como archivo .zip de Stable-Baselines3, sin cuantizacion) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Archivo .zip de Stable-Baselines3 (contiene los pesos del modelo en formato PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura DQN clásica, implementada en Stable-Baselines3. La red Q está formada por una capa de entrada que recibe el estado del entorno (8 variables continuas: posición, velocidad, ángulo, etc.), dos capas ocultas de 256 neuronas con activación ReLU y una capa de salida con 4 acciones discretas (no hacer nada, encender motor principal, orientar izquierda o derecha). El entrenamiento se realizó durante 300 000 pasos de entorno, con los hiperparámetros por defecto del RL Zoo: tasa de aprendizaje de 6,3e-4, buffer de experiencia de 50 000 transiciones, tamaño de lote de 128 y un intervalo de actualización de la red objetivo de 250 pasos. La tasa de exploración se redujo linealmente desde 1,0 hasta 0,05 durante el primer 12 % del entrenamiento, lo que permite un equilibrio entre exploración y explotación. No se emplearon técnicas avanzadas como Dueling DQN o Double DQN, ni se aplicó ningún proceso de ajuste posterior como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Control de aterrizaje de un módulo lunar en el entorno LunarLander-v3, tomando decisiones discretas en cada paso temporal.
- Aprendizaje de políticas óptimas mediante experiencia acumulada, gracias al mecanismo de experience replay.
- Generalización a distintos estados iniciales del entorno, mostrando robustez frente a la variabilidad de las condiciones de aterrizaje.
- Inferencia determinista o estocástica, dependiendo del modo de predicción (deterministic=True en el ejemplo de uso).
- Integración sencilla con el ecosistema Gymnasium y Stable-Baselines3, permitiendo su carga y ejecución con pocas líneas de código.
- No soporta tareas de procesamiento de lenguaje, visión ni razonamiento simbólico, al ser un modelo puramente orientado a control.

## Casos de uso

- Educación en aprendizaje por refuerzo: sirve como ejemplo práctico para enseñar los fundamentos de DQN, el uso de Stable-Baselines3 y la evaluación de agentes en entornos de control.
- Prototipado de algoritmos RL: los desarrolladores pueden partir de este modelo para experimentar con variaciones (Double DQN, Dueling DQN, ajuste de hiperparámetros) y comparar resultados sobre la misma tarea.
- Investigación en control óptimo: el entorno LunarLander es un banco de pruebas estándar para validar nuevas técnicas de RL, y este modelo proporciona una línea base reproducible.
- Simulación de sistemas de aterrizaje autónomo: aunque simplificado, el entorno modela dinámicas de propulsión y gravedad, permitiendo estudiar estrategias de control en un contexto de bajo coste computacional.
- Generación de datos sintéticos de telemetría: el agente puede ejecutarse para producir trayectorias de vuelo y datos de sensores que alimenten otros sistemas de análisis o visualización.
- Benchmarking de infraestructuras de inferencia: al ser un modelo pequeño, es útil para probar pipelines de despliegue de modelos RL en CPU, medir latencias y validar integraciones con Gymnasium.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado para el entorno LunarLander-v3:

| Metrica | Valor |
|---|---|
| Recompensa media (mean_reward) | 279,88 ± 15,19 |

Este valor supera ampliamente el umbral de 200 puntos que se considera un aterrizaje exitoso en el entorno. No se dispone de resultados comparativos con otros modelos (por ejemplo, PPO, A2C o D3QN) en la información publicada, por lo que no se puede establecer una comparativa cuantitativa fiable.

## Requisitos de hardware

- Al ser una red neuronal de apenas dos capas ocultas de 256 neuronas, la inferencia es extremadamente ligera y puede ejecutarse en CPU sin problemas.
- La VRAM necesaria es prácticamente nula (menos de 50 MB si se usara GPU, aunque no es necesario).
- Cualquier GPU moderna (incluso integradas) es suficiente, pero se recomienda una CPU con al menos 2 núcleos para ejecutar el entorno de simulación Box2D.
- El entrenamiento del modelo (300 000 pasos) se puede completar en una CPU de gama media en menos de una hora, y en GPU en pocos minutos.
- Opciones de despliegue: el modelo se carga directamente con Stable-Baselines3 y Gymnasium. No se distribuye en formatos como ONNX, TensorRT o GGUF, por lo que su uso está limitado al ecosistema Python de Stable-Baselines3.
- La latencia de inferencia es del orden de microsegundos por paso, lo que permite ejecutar el agente en tiempo real con facilidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos DQN para LunarLander-v3 en la información proporcionada. Existen modelos alternativos como D3QN (Dueling Double DQN) publicados por otros autores, pero sin métricas comparables. Por tanto, la comparativa se limita a indicar que este modelo sigue la arquitectura DQN estándar, mientras que alternativas como D3QN incorporan mejoras (dueling y double) que suelen ofrecer mayor estabilidad y recompensas superiores, aunque no hay datos verificados en esta ficha.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente en el entorno LunarLander-v3, por lo que no es transferible a otras tareas sin un reentrenamiento completo.
- La recompensa media declarada proviene de una única ejecución de evaluación y no ha sido verificada de forma independiente; es recomendable reproducir la evaluación antes de usarlo como referencia.
- No se especifica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o la redistribución de los pesos.
- Al ser un agente de RL, no tiene capacidades de razonamiento simbólico, lenguaje ni visión; su comportamiento se limita a la selección de acciones en el entorno simulado.
- El rendimiento puede degradarse si se modifica el entorno (por ejemplo, cambiando la física o los parámetros de recompensa), ya que la política aprendida está ajustada a las condiciones específicas de LunarLander-v3.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un simulador, no es aplicable a contextos del mundo real sin una validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arabellako22/dqn-LunarLander-v3-sb3
- Repositorio de Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Entorno LunarLander-v3 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Ejemplo de modelo alternativo D3QN: https://huggingface.co/hwihwalab/lunarlander-v3-d3qn
- Repositorio de un DQN para LunarLander-v3: https://github.com/wtcherr/lunar-lander-dqn
