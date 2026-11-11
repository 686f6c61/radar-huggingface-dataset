# Frenchwizz/MineSweeper

## Resumen

MineSweeper es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3. Lo desarrolla el usuario Frenchwizz y su propósito es jugar a una versión web personalizada del clásico Buscaminas, construida sobre Playwright y Gymnasium. No se trata de un modelo de lenguaje, sino de una política neuronal que mapea el estado del tablero a una acción de clic sobre una casilla.

El agente opera sobre un tablero de 9x9 casillas. El espacio de observación es una matriz de 9x9 con valores enteros que representan el estado de cada celda (-1 para casillas cubiertas y de 0 a 8 para el número de minas adyacentes revelado). El espacio de acciones es discreto con 81 posibles acciones, una por cada casilla del tablero. La política utilizada es una MlpPolicy, es decir, una red neuronal totalmente conectada que procesa el estado aplanado.

El modelo resulta relevante como ejemplo didáctico de integración entre un entorno web real (mediante Playwright) y un pipeline de entrenamiento de RL estándar (Gymnasium + Stable-Baselines3). Su utilidad práctica es limitada y acotada al dominio del Buscaminas y a esta implementación concreta del entorno; no es un modelo de propósito general ni un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal MLP (MlpPolicy de Stable-Baselines3) entrenada con PPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el estado es una matriz fija de 9x9) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (formato nativo de Stable-Baselines3, presumiblemente .zip) |

## Arquitectura y entrenamiento

El agente emplea PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidades (clipped surrogate objective) que busca actualizaciones estables de la política. La red es una MlpPolicy, una arquitectura de perceptrón multicapa que recibe como entrada el estado aplanado del tablero de 9x9 y produce una distribución de probabilidad sobre las 81 acciones posibles. No hay información publicada sobre el número de capas, neuronas por capa, función de activación ni hiperparámetros de entrenamiento (learning rate, tamaño de rollout, número de épocas, coeficiente de entropía, etc.).

El entorno es una implementación web personalizada del Buscaminas construida con Playwright y Gymnasium. Playwright se utiliza para controlar el navegador e interactuar con la interfaz del juego, mientras que Gymnasium proporciona la interfaz estándar de entorno (reset, step, observation_space, action_space) que Stable-Baselines3 requiere. No se especifican el número total de pasos de entrenamiento, la composición del dataset de experiencias, ni si se aplicaron técnicas adicionales como reward shaping, curriculum learning o normalización de recompensas. Tampoco se detalla la función de recompensa empleada.

## Capacidades

- Jugar al Buscaminas en un tablero de 9x9 dentro de un entorno web controlado por Playwright.
- Interpretar el estado del tablero como una matriz de 9x9 con valores -1 (cubierta) y 0-8 (minas adyacentes reveladas).
- Seleccionar una de las 81 casillas como acción de clic en cada paso.
- Operar como política entrenada con PPO cargable mediante Stable-Baselines3.
- No dispone de generación de texto, razonamiento simbólico general, código, matemáticas, visión, audio ni capacidades multilingües.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso fuera del bucle de decisión del propio juego.
- No dispone de modo de pensamiento (thinking mode) ni de capacidades multimodales.

## Casos de uso

- Demostración didáctica de RL: sirve para ilustrar cómo entrenar un agente PPO con Stable-Baselines3 sobre un entorno Gymnasium personalizado, mostrando el flujo completo desde la definición del entorno hasta la política entrenada.
- Integración de entornos web con Playwright: el modelo ejemplifica cómo conectar un navegador automatizado con un bucle de RL, útil para quienes quieran entrenar agentes sobre interfaces web.
- Benchmark de algoritmos de RL: puede emplearse como referencia para comparar PPO con otros algoritmos (DQN, A2C, SAC) sobre el mismo entorno de Buscaminas 9x9.
- Investigación en entornos discretos con estado estructurado: el tablero de 9x9 con valores -1 a 8 es un caso de estudio para probar representaciones de estado y funciones de recompensa.
- Reproducción de experimentos: al estar publicado en Hugging Face con la librería Stable-Baselines3, permite cargar la política y reproducir el comportamiento del agente en el entorno original.
- Educación en RL: adecuado para cursos o talleres introductorios donde se quiera mostrar un agente que resuelve una tarea concreta con un espacio de acciones discreto y acotado.
- Pruebas de robustez de agentes: sirve para evaluar cómo se comporta una política PPO ante variaciones del entorno (cambios en la disposición de minas, tamaños de tablero distintos, si el entorno lo permite).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una MlpPolicy sobre un estado de 81 valores y 81 acciones, el modelo es presumiblemente muy pequeño y podría ejecutarse en CPU sin GPU.
- GPU recomendadas: no se especifican. Para el entrenamiento de una MLP de este tamaño, una GPU consumer como una RTX 3060 o superior sería más que suficiente, aunque también es viable en CPU.
- ¿Cabe en consumer GPU?: sí, con toda probabilidad, dado el reducido tamaño del estado y de la red; no se dispone de cifras exactas de parámetros.
- Opciones de despliegue: carga mediante Stable-Baselines3 (`PPO.load`) en Python; el entorno requiere Playwright y un navegador instalado. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (agentes RL para Buscaminas) con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el Buscaminas 9x9 de este entorno concreto; no generaliza a otros juegos, tareas o dominios.
- No es un modelo de lenguaje: no procesa ni genera texto, por lo que no debe evaluarse con métricas de NLP.
- No se especifica la licencia, lo que impide determinar si su uso comercial está permitido; se recomienda contactar con el autor antes de cualquier uso en producción.
- No se detallan los hiperparámetros de entrenamiento ni el número de pasos, lo que dificulta la reproducibilidad exacta del resultado.
- El tamaño del repositorio es de 0.0 GB y las descargas son 0, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el modelo no ha sido validado por la comunidad.
- Riesgo de sobreajuste al entorno concreto de Playwright: cambios en la interfaz web o en la implementación del juego podrían invalidar la política entrenada.
- No hay información sobre sesgos, alucinaciones ni comportamiento en producción, dado que no es un modelo generativo.
- La dependencia de Playwright y de un navegador añade complejidad de despliegue frente a un modelo puramente numérico.

## Enlaces

- Hugging Face: https://huggingface.co/Frenchwizz/MineSweeper
- Stable-Baselines3: https://stable-baselines3.readthedocs.io/
- PPO (paper original): https://arxiv.org/abs/1707.06347
- Gymnasium: https://gymnasium.farama.org/
- Playwright: https://playwright.dev/
