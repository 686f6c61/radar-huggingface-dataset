# alialam567/q-Taxi_v4

## Resumen

El modelo `alialam567/q-Taxi_v4` es un agente de aprendizaje por refuerzo (reinforcement learning) que resuelve el entorno clásico Taxi-v3 de Gymnasium mediante el algoritmo de Q-learning. Fue desarrollado por el usuario alialam567 y subido a Hugging Face como parte de una implementación personalizada. El problema que aborda es el control óptimo de un taxi en un entorno de cuadrícula de 5x5, donde debe recoger a un pasajero en una de cuatro ubicaciones fijas (R, G, Y, B) y dejarlo en su destino, minimizando pasos y penalizaciones.

Este modelo es relevante porque representa un ejemplo didáctico y funcional de Q-learning aplicado a un entorno discreto de tamaño reducido, muy utilizado en cursos y tutoriales de aprendizaje por refuerzo. No se trata de un modelo de lenguaje ni de una red neuronal profunda; es una tabla Q que almacena los valores de acción para cada estado del entorno. La arquitectura es una tabla de valores Q de dimensiones 500x6 (500 estados posibles y 6 acciones), y el contexto de ventana no aplica al ser un agente de RL episódico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla Q (Q-learning tabular) |
| Parametros totales | No aplica (tabla de 500x6 valores) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (entorno episodico Taxi-v3) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Pickle (.pkl) |

## Arquitectura y entrenamiento

El agente utiliza Q-learning tabular, un algoritmo de aprendizaje por refuerzo sin red neuronal. El estado se define por la posición del taxi (5x5), la ubicación del pasajero (4 posiciones fijas más el taxi) y el destino (4 posiciones), dando un total de 500 estados. Las acciones son 6: mover hacia abajo, arriba, derecha, izquierda, recoger pasajero y dejar pasajero. La tabla Q se actualiza con la regla de Bellman: Q(s,a) = Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a)). El entrenamiento se realizó con exploración epsilon-greedy, aunque los hiperparámetros exactos (tasa de aprendizaje, factor de descuento, epsilon, número de episodios) no se documentan en la model card. No se emplearon técnicas de RLHF, DPO ni redes neuronales.

## Capacidades

- Resolver el entorno Taxi-v3 de Gymnasium de forma óptima o casi óptima, alcanzando una recompensa media de 7.52 +/- 2.77 según el autor.
- Tomar decisiones secuenciales en un espacio de estados discreto y finito.
- Aprender políticas de navegación y gestión de pasajeros en un entorno de cuadrícula.
- No tiene capacidades de generación de texto, visión, audio ni tool calling. Es un agente de RL puro.

## Casos de uso

- Material educativo para aprender Q-learning: el modelo sirve como ejemplo práctico de implementación de Q-learning tabular en un entorno estándar, ideal para cursos de aprendizaje por refuerzo.
- Benchmark de algoritmos de RL: se puede comparar con otros agentes (SARSA, DQN) en Taxi-v3 para evaluar la eficiencia de distintos métodos.
- Demostración de políticas aprendidas: permite visualizar la política óptima de un agente en un entorno de navegación discreto.
- Base para extensiones: se puede modificar el entorno (por ejemplo, Taxi-v4) y adaptar el agente para estudiar cambios en la dinámica.
- Evaluación de hiperparámetros: el código de entrenamiento puede usarse para experimentar con distintos valores de alpha, gamma y epsilon.
- Integración en pipelines de RL: aunque el modelo es pequeño, puede servir como componente de un sistema de control más amplio que requiera decisiones discretas.

## Benchmarks y rendimiento

Según los datos declarados por el autor en la model card (no verificados de forma independiente), el agente obtiene una recompensa media de 7.52 +/- 2.77 en el entorno Taxi-v3. Este valor es bajo en comparación con la recompensa máxima posible de 20, lo que sugiere que el agente no ha convergido completamente a la política óptima. No se han publicado resultados en otros benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje.

| Metrica | Valor |
|---|---|
| Recompensa media (Taxi-v3) | 7.52 +/- 2.77 (declarado por el autor, no verificado) |

## Requisitos de hardware

- El modelo es una tabla Q de 500x6, lo que ocupa unos pocos kilobytes en memoria.
- Puede ejecutarse en cualquier CPU, incluso en sistemas embebidos o Raspberry Pi.
- No requiere GPU ni VRAM.
- El despliegue se realiza cargando el archivo pickle en Python con Gymnasium y la librería correspondiente (por ejemplo, `gym`).
- La inferencia es instantánea: cada paso de decisión consiste en un lookup en la tabla Q, con latencia del orden de microsegundos.
- No es necesario usar vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este agente con otros modelos de Q-learning en Taxi-v3. Existen otros repositorios similares en Hugging Face (por ejemplo, `EverVissionAI/q-Taxi-v4` o `hlm1234/q-Taxi-v4`) que también entrenan agentes Q-learning en entornos Taxi, pero no se han publicado métricas comparables. La recompensa media de 7.52 es inferior a la de agentes bien entrenados, que suelen alcanzar valores superiores a 8 o 9, pero no hay datos verificados de otros modelos para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para el entorno Taxi-v3; no generaliza a otros entornos ni a tareas de lenguaje o visión.
- La recompensa media reportada es baja (7.52), lo que indica que la política aprendida no es óptima y podría mejorarse con más entrenamiento o ajuste de hiperparámetros.
- No se especifica la licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- El formato de pesos es un pickle, lo que implica riesgos de seguridad si se carga un archivo de fuentes no confiables (ejecución de código arbitrario).
- No hay documentación sobre los hiperparámetros de entrenamiento, lo que dificulta la reproducibilidad.
- El modelo no ha sido verificado de forma independiente; los resultados de benchmark son declaraciones del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alialam567/q-Taxi_v4
- Repositorio similar de EverVissionAI: https://huggingface.co/EverVissionAI/q-Taxi-v4
- Código de Q-learning para Taxi-v4 en GitHub: https://github.com/janashams/Taxi-v4-OpenAI-Gymnasium/blob/main/q_learning.py
