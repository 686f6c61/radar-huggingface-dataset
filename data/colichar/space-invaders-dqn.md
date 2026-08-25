# colichar/space-invaders-dqn

## Resumen

`colichar/space-invaders-dqn` es un agente de aprendizaje por refuerzo (reinforcement learning) que juega al clásico Space Invaders de Atari, entrenado desde cero con PyTorch. Se trata de una reimplementación fiel de los artículos originales de DeepMind sobre DQN (Mnih et al., 2013 y 2015), reproducida por el desarrollador colichar con fines de investigación y educación. El modelo resuelve el problema de controlar un agente en un entorno de Atari a partir de píxeles, aprendiendo una política óptima mediante Deep Q-Learning.

La arquitectura es la red neuronal convolucional original de DeepMind (3 capas convolucionales + 2 capas totalmente conectadas), que opera sobre pilas de 4 fotogramas en escala de grises de 84x84 píxeles. El entrenamiento se realizó durante 50 millones de fotogramas (~12,5 horas) en una sola GPU RTX 4070 Ti Super, alcanzando una recompensa media de aproximadamente 1968.6 en los últimos episodios. Aunque es un modelo pequeño y especializado, su relevancia radica en ser una reproducción fiel de una técnica fundacional en el aprendizaje por refuerzo profundo, útil para estudiar y experimentar con DQN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (3 capas convolucionales + 2 capas totalmente conectadas) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | No aplica (no es un modelo de lenguaje; pesos en FP32 por defecto) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch state dict) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura original de DQN descrita en los artículos de DeepMind. La red toma como entrada una pila de 4 fotogramas en escala de grises de 84x84 píxeles, procesada por tres capas convolucionales seguidas de dos capas totalmente conectadas. La salida es un valor Q para cada una de las 6 acciones posibles del juego. No se emplea ninguna innovación arquitectónica adicional; se trata de una implementación directa del DQN clásico.

El entrenamiento se llevó a cabo durante 50 millones de fotogramas (aproximadamente 12,5 horas) en una sola RTX 4070 Ti Super, con un solo entorno `gymnasium` (`num_envs=1`). Los hiperparámetros coinciden con los del artículo de 2015 de DeepMind, incluyendo un optimizador RMSprop centrado con `alpha=0.95` y `eps=0.01`, tasa de aprendizaje de 0.00025, factor de descuento gamma de 0.99, memoria de replay de 1.000.000 de fotogramas, sincronización de la red objetivo cada 10.000 fotogramas y actualización de la red principal cada 4 fotogramas. Se aplicó un frame skip de 4 con max-pooling sobre los últimos 2 fotogramas para eliminar el parpadeo, y recorte de recompensa a {-1, 0, 1}. No se menciona el uso de técnicas como Double DQN o Dueling DQN; es un DQN estándar.

## Capacidades

- Jugador de Space Invaders (entorno `ALE/SpaceInvaders-v5`) mediante Deep Q-Learning, tomando decisiones basadas únicamente en píxeles de la pantalla.
- Aprendizaje de políticas de control en tiempo real con entrada visual (84x84 en escala de grises).
- Capacidad de generalización limitada al juego específico; no es un agente generalista.
- Almacena experiencia en una memoria de replay de 1M de fotogramas, lo que permite entrenamiento con datos desacoplados.
- Implementación de la técnica de target network para estabilizar el aprendizaje (sincronización cada 10.000 fotogramas).
- Soporte de evaluación y reproducción del entrenamiento mediante el script `scripts/evaluate.py` del repositorio asociado.

## Casos de uso

- Reproducción de resultados de investigación: el modelo permite verificar y reproducir los resultados del paper de DQN de 2015 en un entorno moderno (PyTorch, `ALE/SpaceInvaders-v5`), siendo útil para estudiantes e investigadores que quieran entender el algoritmo en profundidad.
- Educación en aprendizaje por refuerzo: sirve como ejemplo didáctico de cómo implementar DQN desde cero, con hiperparámetros documentados y scripts de entrenamiento/evaluación disponibles en el repositorio.
- Evaluación de algoritmos de RL: se puede usar como línea base para comparar variantes como Double DQN, Dueling DQN o Rainbow en el mismo entorno, ya que el modelo es un DQN estándar.
- Experimentación con hiperparámetros: al estar disponible el código de entrenamiento, se puede modificar la configuración (tasa de aprendizaje, tamaño de replay, etc.) y comparar el efecto en el rendimiento.
- Análisis de comportamiento de agentes: los archivos `episodes.csv` y `losses.csv` permiten analizar la curva de aprendizaje y la pérdida de Huber a lo largo del entrenamiento.
- Uso educativo en cursos de RL: el modelo y su código pueden usarse como ejemplo práctico en asignaturas de aprendizaje automático o aprendizaje por refuerzo, mostrando el pipeline completo de entrenamiento y evaluación.

## Benchmarks y rendimiento

Según la model card, en los últimos 1M de fotogramas del entrenamiento (501 episodios), la recompensa media por episodio es de aproximadamente 1968.6, con una recompensa máxima de 4155. No se proporcionan resultados de benchmarks estándar de la comunidad (como los de Atari en el paper original de DeepMind), ya que este modelo es específico para Space Invaders y no se compara con otros agentes en la model card.

| Métrica | Valor |
|---|---|
| Recompensa media (últimos 1M fotogramas) | ~1968.6 |
| Recompensa máxima (últimos 1M fotogramas) | 4155 |
| Episodios evaluados | 501 |

## Requisitos de hardware

- Entrenamiento: el modelo fue entrenado en una RTX 4070 Ti Super (16 GB VRAM) en aproximadamente 12,5 horas para 50M de fotogramas. El uso de VRAM no se especifica, pero una red de este tamaño (3 conv + 2 FC) es muy ligera, probablemente menos de 1 GB.
- Inferencia: la inferencia es extremadamente ligera, ya que solo requiere una pasada hacia adelante de una CNN pequeña. Puede ejecutarse en CPU sin problemas, aunque en GPU es más rápido.
- GPU recomendada: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; incluso la integrada de muchos portátiles puede ejecutarlo.
- Opciones de despliegue: el modelo se usa a través del repositorio `deep-q-learning` con scripts de evaluación (`scripts/evaluate.py`), no es un modelo de lenguaje ni se integra con vLLM, Ollama, etc.
- Latencia y rendimiento: no se proporcionan mediciones de latencia, pero al ser una CNN pequeña, se espera que las decisiones se tomen en milisegundos tanto en CPU como en GPU.

## Comparativa con modelos similares

| Modelo | Entorno | Librería | Recompensa | Licencia |
|---|---|---|---|---|
| colichar/space-invaders-dqn (este) | ALE/SpaceInvaders-v5 | PyTorch (desde cero) | ~1968.6 | MIT |
| afedyanin/dqn-SpaceInvadersNoFrameskip-v4 | SpaceInvadersNoFrameskip-v4 | stable-baselines3 / RL Zoo | No disponible | No disponible |
| thaslimshaik/spaceinvaders-dqn | SpaceInvadersNoFrameskip-v4 | stable-baselines3 / RL Zoo | No disponible | No disponible |

Ambos modelos alternativos están entrenados con la librería stable-baselines3 y el RL Zoo, que es una implementación más moderna y con más funcionalidades que la reimplementación desde cero de colichar. Sin embargo, no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en `ALE/SpaceInvaders-v5`; no es generalizable a otros juegos de Atari sin reentrenamiento.
- Está pensado para investigación y educación (reproducir los papers de DQN), no como un agente de producción para jugar al juego.
- La memoria de replay de 14 GB no se incluye en el repositorio, por lo que no se puede reanudar el entrenamiento directamente desde el checkpoint; solo es posible evaluar el modelo.
- El checkpoint está ligado a la implementación específica del repositorio (`CNNModelPY`), por lo que no se puede cargar directamente con un `nn.Module` estándar sin adaptar el código.
- No se han realizado evaluaciones de sesgos o riesgos de alucinación, ya que no es un modelo de lenguaje; la única limitación relevante es la especialización en un solo juego.
- La licencia MIT permite uso comercial, pero el modelo no es adecuado para aplicaciones comerciales reales más allá de la investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/colichar/space-invaders-dqn
- Repositorio de código y entrenamiento: https://github.com/colichar/deep-q-learning
- Script de evaluación: https://github.com/colichar/deep-q-learning/blob/main/scripts/evaluate.py
- Paper original DQN (2013): https://arxiv.org/pdf/1312.5602.pdf
- Paper original DQN (2015): https://www.nature.com/articles/nature14236/
- Modelo alternativo con stable-baselines3: https://huggingface.co/afedyanin/dqn-SpaceInvadersNoFrameskip-v4
- Modelo alternativo con stable-baselines3: https://huggingface.co/thaslimshaik/spaceinvaders-dqn
