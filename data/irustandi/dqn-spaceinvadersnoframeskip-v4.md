# irustandi/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo DQN (Deep Q-Network) para jugar al juego de Atari *Space Invaders*, concretamente en el entorno `SpaceInvadersNoFrameskip-v4`. Ha sido desarrollado por el usuario `irustandi` utilizando la librería `stable-baselines3` y el framework RL Zoo. El agente procesa los fotogramas del juego mediante una red neuronal convolucional (`CnnPolicy`) y toma decisiones discretas para maximizar la recompensa acumulada. Es relevante como ejemplo de aplicación clásica de RL en entornos de Atari, y sirve como punto de partida para investigaciones sobre algoritmos de control, exploración y estabilidad de entrenamiento. El repositorio incluye los hiperparámetros utilizados, lo que facilita la reproducibilidad de los experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN (Deep Q-Network) con política CNN (`CnnPolicy`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no procesamiento de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | zip (RL Zoo / stable-baselines3) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DQN estándar con una red convolucional que procesa cuatro fotogramas apilados (frame stacking) del entorno Atari. El entrenamiento se realizó con el RL Zoo de stable-baselines3, utilizando un buffer de experiencia de 100 000 transiciones, un periodo de aprendizaje inicial de 100 000 pasos, actualización del target network cada 1000 pasos, y una frecuencia de entrenamiento de 4 pasos. La política de exploración sigue un esquema epsilon-greedy con decaimiento lineal desde 1.0 hasta 0.01 a lo largo del 10 % de los pasos totales. Se entrenó durante 1 000 000 de pasos con un batch size de 32 y una tasa de aprendizaje de 0.0001. No se aplicó normalización de observaciones ni recompensas.

## Capacidades

- Jugar *Space Invaders* de forma autónoma a partir de observaciones de píxeles.
- Tomar decisiones secuenciales con memoria de cuatro fotogramas apilados.
- Aprender una política que maximiza la recompensa acumulada mediante Q-learning.
- No posee capacidades de lenguaje, visión general, tool calling ni razonamiento simbólico; su única función es la selección de acciones en el entorno específico.

## Casos de uso

- Investigación en RL: utilizar el agente como baseline para comparar nuevos algoritmos o variantes de DQN en el mismo entorno.
- Reproducibilidad de experimentos: gracias a los hiperparámetros publicados, se puede replicar el entrenamiento y verificar resultados.
- Educación: demostrar el funcionamiento de DQN en un entorno visual y de tiempo real.
- Análisis de políticas: estudiar el comportamiento del agente en diferentes estados del juego, como la gestión de vidas o la priorización de objetivos.
- Evaluación de robustez: someter al agente a perturbaciones en las observaciones (ruido, cambios de brillo) para medir su degradación.
- Benchmark de hardware: medir el rendimiento de inferencia en CPU y GPU, útil para comparar plataformas de despliegue de modelos RL.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado para el entorno `SpaceInvadersNoFrameskip-v4`:

| Metrica | Valor |
|---|---|
| mean_reward | 766.50 +/- 304.75 |

No se han publicado comparaciones con otros agentes en la información disponible.

## Requisitos de hardware

- Inferencia en CPU sin necesidad de GPU; la red es pequeña y ligera.
- VRAM mínima: puede ejecutarse en CPU, aunque una GPU acelera la inferencia si se desea.
- GPU recomendada: ninguna en particular; cualquier GPU con soporte CUDA es suficiente.
- Despliegue: se puede cargar mediante RL Zoo (`rl_zoo3.load_from_hub`) o exportar a ONNX para integración en otros entornos.
- Latencia: muy baja, del orden de milisegundos por decisión en CPU moderna.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros agentes RL en el mismo entorno en la información proporcionada. Se puede mencionar que DQN es un algoritmo clásico, y que variantes como Rainbow o C51 suelen obtener mejores recompensas medias, pero no se tienen cifras concretas para este entorno.

## Limitaciones y advertencias

- El agente está especializado exclusivamente en `SpaceInvadersNoFrameskip-v4`; no generaliza a otros juegos o entornos.
- La recompensa media presenta una alta varianza (desviación estándar de 304.75), lo que indica inestabilidad en el rendimiento entre episodios.
- El entrenamiento se limitó a 1 000 000 de pasos, por lo que el rendimiento podría mejorar con más tiempo de entrenamiento o ajuste de hiperparámetros.
- La licencia no está especificada, por lo que su uso comercial requiere consultar al autor.
- No es un modelo de lenguaje ni multimodal; no debe utilizarse para tareas fuera del ámbito de RL en Atari.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/irustandi/dqn-SpaceInvadersNoFrameskip-v4)
- [RL Zoo (repositorio de entrenamiento)](https://github.com/DLR-RM/rl-baselines3-zoo)
- [Stable Baselines3](https://github.com/DLR-RM/stable-baselines3)
- [Stable Baselines3 Contrib](https://github.com/Stable-Baselines-Team/stable-baselines3-contrib)
- [SBX (SB3 + JAX)](https://github.com/araffin/sbx)
