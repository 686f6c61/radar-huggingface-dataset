# fiorane/Taxi-v4-Qlearning

## Resumen

El modelo `fiorane/Taxi-v4-Qlearning` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo Q-learning para resolver el entorno `Taxi-v4` de Gymnasium. Este entorno plantea un problema clásico de navegación en una cuadrícula de 5x5 donde un taxi debe recoger a un pasajero en una de cuatro ubicaciones fijas (R, G, Y, B) y dejarlo en su destino correcto, optimizando la recompensa acumulada. El agente fue desarrollado por el usuario `fiorane` y publicado en Hugging Face como una implementación personalizada.

La relevancia de este modelo radica en su carácter didáctico: es un ejemplo sencillo y reproducible de cómo aplicar Q-learning a un entorno de control discreto. No se trata de un modelo de lenguaje ni de un sistema de gran escala, sino de una demostración de los fundamentos del aprendizaje por refuerzo. La información disponible es mínima: no se especifican hiperparámetros, arquitectura interna ni detalles de entrenamiento más allá del uso de Q-learning. El repositorio contiene un único archivo `q-learning.pkl` que almacena la tabla Q aprendida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (implementación de Q-learning con tabla Q, sin más detalles) |
| Parametros totales | no disponible (el modelo es una tabla Q, pero no se indica su tamaño) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de control, no procesamiento de secuencias) |
| Tipos de cuantizacion | no aplica (los pesos se guardan en formato pickle, no en cuantización) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | pickle (`.pkl`) |

## Arquitectura y entrenamiento

El modelo se basa en el algoritmo Q-learning, una técnica de aprendizaje por refuerzo sin modelo que aprende una función de valor de acción Q(s, a) mediante actualizaciones iterativas. En el entorno `Taxi-v4`, el espacio de estados es discreto (500 estados posibles: 5x5 posiciones del taxi, 4 ubicaciones de pasajero, 4 destinos y un estado de pasajero en el taxi) y el espacio de acciones incluye 6 acciones (moverse en 4 direcciones, recoger y dejar). El agente almacena los valores Q en una tabla y los actualiza con la regla de Bellman.

No se dispone de información sobre el número de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento, la estrategia de exploración (p. ej., epsilon-greedy) ni la composición del entorno (si se usó `is_slippery=False` o el valor por defecto). El autor indica en la model card que se debe verificar si se necesitan atributos adicionales como `is_slippery=False` al cargar el entorno. No se menciona el uso de técnicas avanzadas como redes neuronales, DQN, ni procesos de optimización adicionales.

## Capacidades

- Navegación en un entorno de cuadrícula 5x5: el agente aprende a moverse por el mapa para alcanzar al pasajero y llevarlo al destino.
- Toma de decisiones secuenciales: el agente selecciona acciones (mover, recoger, dejar) basándose en la política aprendida.
- Optimización de recompensa: maximiza la recompensa acumulada, que incluye penalizaciones por pasos y acciones incorrectas, y recompensas positivas por completar el episodio.
- No tiene capacidades de generación de texto, razonamiento simbólico, visión, tool calling ni procesamiento de lenguaje natural. Es un agente de control puramente reactivo.

## Casos de uso

- Material educativo para aprendizaje por refuerzo: el modelo sirve como ejemplo práctico para enseñar Q-learning en entornos discretos. Los estudiantes pueden cargar el agente, ejecutarlo en `Taxi-v4` y analizar la tabla Q para entender cómo se distribuyen los valores de acción.
- Demostración de políticas aprendidas: se puede visualizar el comportamiento del agente en el entorno para comprobar que ha aprendido una política razonable de recogida y entrega de pasajeros.
- Punto de partida para experimentos: los desarrolladores pueden modificar el entorno (p. ej., cambiar la disposición de las ubicaciones) y reentrenar el agente para comparar resultados.
- Comparación de algoritmos: al ser una implementación simple, se puede contrastar con agentes basados en SARSA, Double Q-learning o DQN para evaluar diferencias de rendimiento y convergencia.
- Integración en pipelines de evaluación de RL: el archivo `q-learning.pkl` puede cargarse mediante la función `load_from_hub` y usarse como referencia en suites de pruebas de agentes de refuerzo.
- Investigación sobre entornos de control discreto: aunque limitado, el modelo puede servir como baseline en estudios que exploren variaciones del entorno `Taxi-v4` o métodos de exploración.

## Benchmarks y rendimiento

El autor declara en la model card un resultado de recompensa media de `7.52 +/- 2.72` en el entorno `Taxi-v4`. Este valor se obtuvo tras la evaluación del agente, aunque no se especifica el número de episodios utilizados para calcular la media ni la desviación estándar. No se proporcionan comparaciones con otros agentes ni métricas adicionales como tasa de éxito o número de pasos por episodio.

| Metrica | Valor |
|---|---|
| Recompensa media | 7.52 +/- 2.72 |
| Entorno | Taxi-v4 |
| Verificado | No |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El modelo es extremadamente ligero: una tabla Q para 500 estados y 6 acciones ocupa unos pocos kilobytes. No requiere GPU.
- Puede ejecutarse en cualquier CPU, incluso en entornos embebidos o en notebooks sin aceleración.
- La inferencia es instantánea: cada paso de decisión consiste en una consulta a la tabla Q, con latencia del orden de microsegundos.
- Para cargar el modelo se necesita Python con las librerías `gymnasium` y `huggingface_hub` (o la función `load_from_hub` de la librería de RL de Hugging Face).
- No se requieren opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

Existen otros repositorios en Hugging Face con agentes Q-learning para `Taxi-v4`, como `DarkerLiao/Qlearning-Taxi-v4` y `Jmz919/Taxi-v4-QLearning`. No se dispone de información detallada sobre sus resultados o configuraciones, por lo que no es posible realizar una comparación cuantitativa. En general, todos estos modelos comparten la misma arquitectura de tabla Q y el mismo entorno, por lo que sus diferencias radican en los hiperparámetros de entrenamiento y la semilla aleatoria. No se dispone de datos de rendimiento de estos modelos alternativos.

| Modelo | Recompensa media | Contexto | Licencia |
|---|---|---|---|
| fiorane/Taxi-v4-Qlearning | 7.52 +/- 2.72 | no disponible | no disponible |
| DarkerLiao/Qlearning-Taxi-v4 | no disponible | no disponible | no disponible |
| Jmz919/Taxi-v4-QLearning | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el entorno `Taxi-v4` con una configuración específica. No generaliza a otros entornos ni a variaciones del mismo (p. ej., cambios en el tamaño del grid o en las ubicaciones).
- No se especifica si el entorno se usó con `is_slippery=False` o con el valor por defecto. Si se carga el modelo sin los atributos correctos, el comportamiento puede ser subóptimo o inválido.
- La recompensa media declarada (7.52) es relativamente baja en comparación con el rendimiento óptimo posible en `Taxi-v4` (que suele superar 8-9 en episodios completos), lo que sugiere que el agente no ha convergido completamente o que la evaluación se realizó con una política subóptima.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad, ya que no es un modelo generativo.
- La licencia no está especificada, por lo que el uso comercial del modelo y sus pesos queda en un limbo legal. Se recomienda contactar al autor antes de utilizarlo en proyectos productivos.
- El formato de pesos es un archivo pickle, que puede ser inseguro si se carga desde fuentes no confiables. Se debe verificar la integridad del archivo antes de deserializarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fiorane/Taxi-v4-Qlearning
- Repositorio similar: https://huggingface.co/DarkerLiao/Qlearning-Taxi-v4
- Repositorio similar: https://huggingface.co/Jmz919/Taxi-v4-QLearning
- Código de ejemplo en GitHub: https://github.com/janashams/Taxi-v4-OpenAI-Gymnasium/blob/main/q_learning.py
- Proyecto académico relacionado: https://github.com/lucassvalentim/taxi-v4-qlearning/blob/main/README.md
- Vídeo tutorial sobre Q-learning en Taxi-v4: https://www.youtube.com/watch?v=FvcPiqpMzeY
