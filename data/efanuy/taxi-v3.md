# efanuy/Taxi-v3

## Resumen

El modelo `efanuy/Taxi-v3` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado mediante el algoritmo Q-Learning para resolver el entorno Taxi-v3 de OpenAI Gym. Este entorno clásico simula un taxi en una cuadrícula de 5x5 que debe recoger a un pasajero en una de cuatro ubicaciones y dejarlo en su destino, optimizando la recompensa acumulada. El autor, `efanuy`, publica el agente entrenado en Hugging Face con el objetivo de demostrar la aplicación de Q-Learning tabular en un problema de control discreto.

El modelo se distribuye como un archivo pickle (`q-learning.pkl`) que contiene la tabla Q aprendida, junto con metadatos del entorno. No se trata de un modelo de lenguaje ni de un transformer, sino de un agente de RL clásico con una política derivada de los valores Q. Su relevancia radica en ser un ejemplo didáctico y reproducible de entrenamiento por refuerzo, útil para quienes se inician en esta área o necesitan un punto de partida para experimentos en entornos similares.

La recompensa media declarada por el autor es de 7.56 ± 2.71 en el entorno Taxi-v3, un valor que indica un rendimiento moderado (el óptimo teórico es 13.2). La licencia y los idiomas no están especificados en la ficha del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q) |
| Parametros totales | No disponible (depende del tamaño de la tabla Q, típicamente 500 estados × 6 acciones = 3000 valores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entorno de RL, no procesamiento de secuencias) |
| Tipos de cuantizacion | No aplica (pesos en pickle, sin cuantización) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Pickle (archivo `q-learning.pkl`) |

## Arquitectura y entrenamiento

El modelo implementa Q-Learning tabular, un método de aprendizaje por refuerzo sin modelo (model-free) que aprende una función de valor de acción Q(s,a) para cada par estado-acción. El entorno Taxi-v3 tiene un espacio de estados discreto de 500 estados (combinaciones de posición del taxi, pasajero y destino) y 6 acciones posibles (mover, recoger, dejar). El algoritmo actualiza la tabla Q mediante la regla de Bellman, usando una tasa de aprendizaje y un factor de descuento que no se especifican en la documentación.

No se detallan los hiperparámetros del entrenamiento (número de episodios, epsilon-greedy, tasa de aprendizaje) ni la estrategia de exploración. El archivo pickle contiene la tabla Q final, que se puede cargar con la función `load_from_hub` de Hugging Face y usar directamente con `gym.make("Taxi-v3")`. No se menciona el uso de redes neuronales ni técnicas avanzadas como DQN; es una implementación clásica y sencilla.

## Capacidades

- Resolver el entorno Taxi-v3 de OpenAI Gym, es decir, navegar en una cuadrícula de 5x5 para recoger y dejar un pasajero en la ubicación correcta.
- Tomar decisiones secuenciales basadas en el estado actual del entorno, siguiendo una política greedy derivada de la tabla Q.
- Funcionar como agente autónomo en un entorno de simulación con recompensas positivas y negativas.
- Ser cargado y ejecutado fácilmente mediante la API de Hugging Face (`load_from_hub`), lo que facilita su integración en pipelines de evaluación.
- No soporta generación de texto, razonamiento, código, visión ni tool calling, ya que no es un modelo de lenguaje.

## Casos de uso

- Demostración educativa de Q-Learning: el modelo sirve como ejemplo práctico para enseñar los fundamentos del aprendizaje por refuerzo, mostrando cómo una tabla Q puede resolver un problema de control discreto.
- Evaluación de algoritmos de RL: puede usarse como baseline para comparar el rendimiento de otros agentes (por ejemplo, DQN, SARSA) en el mismo entorno Taxi-v3.
- Pruebas de integración con Hugging Face: al ser un modelo pequeño y fácil de cargar, es útil para validar pipelines de `load_from_hub` y `gym.make` en proyectos que automatizan la evaluación de agentes de RL.
- Experimentación con hiperparámetros: los usuarios pueden cargar la tabla Q y explorar cómo varía el rendimiento al modificar el entorno (por ejemplo, `is_slippery=False`) o al aplicar políticas de exploración alternativas.
- Generación de datos sintéticos de trayectorias: el agente puede ejecutarse para generar secuencias de estados y acciones que sirvan como datos de entrenamiento para otros modelos o para análisis de comportamiento.
- Benchmarking en entornos de navegación: aunque limitado a Taxi-v3, puede adaptarse como punto de partida para entornos similares de cuadrícula, aunque requeriría reentrenamiento.

## Benchmarks y rendimiento

El autor declara en el model-index el siguiente resultado:

| Métrica | Valor | Verificado |
|---|---|---|
| mean_reward (Taxi-v3) | 7.56 ± 2.71 | No |

No se proporcionan comparaciones con otros agentes en la misma tarea. El valor de recompensa media está por debajo del óptimo teórico (13.2), lo que sugiere un entrenamiento subóptimo o con una configuración de exploración limitada. No se dispone de más métricas (éxito en entregas, pasos por episodio, etc.) en la información disponible.

## Requisitos de hardware

- Al ser un agente tabular con un espacio de estados de 500 y 6 acciones, la tabla Q ocupa unos pocos kilobytes (500 × 6 × 8 bytes ≈ 24 KB en float64). No requiere GPU.
- Cualquier CPU moderna puede ejecutar la inferencia en tiempo real; la carga del pickle y la ejecución de un episodio completan en milisegundos.
- No se necesita VRAM ni hardware especializado.
- Opciones de despliegue: se puede ejecutar en cualquier entorno Python con `gym` y `pickle`; no requiere servidores de inferencia como vLLM u Ollama.
- La latencia es despreciable (menos de 1 ms por paso de decisión) y el throughput está limitado solo por la velocidad del bucle de simulación del entorno.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros agentes Q-Learning para Taxi-v3 en la información proporcionada. Existen repositorios similares en Hugging Face (por ejemplo, `Evanou/q-Taxi-v3` o `huggingcats/Taxi-v3`) que siguen el mismo patrón, pero no se han publicado sus métricas. Por tanto, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo es específico para el entorno Taxi-v3; no generaliza a otros problemas ni entornos.
- La recompensa media declarada (7.56 ± 2.71) indica un rendimiento subóptimo en comparación con el óptimo teórico, lo que puede deberse a hiperparámetros no ajustados o a una exploración insuficiente.
- No se especifican los hiperparámetros de entrenamiento, lo que dificulta la reproducibilidad exacta del agente.
- La licencia no está definida, por lo que su uso comercial es incierto; se recomienda contactar al autor antes de incorporarlo en proyectos productivos.
- Al ser un archivo pickle, existe un riesgo de seguridad si se carga desde fuentes no confiables (ejecución de código arbitrario). Se debe verificar la integridad del archivo.
- No se han documentado sesgos ni problemas de alucinación, ya que no es un modelo generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efanuy/Taxi-v3
- Entorno Taxi-v3 en Gym (documentación oficial): https://www.gymlibrary.dev/environments/toy_text/taxi/
- Cuaderno de ejemplo de Q-Learning con Taxi-v3 (Colab): https://colab.research.google.com/gist/simoninithomas/466c81aa1c2a07dd14793240c6d033c5/q-learning-with-taxi-v3.ipynb
- Repositorio de referencia con implementación de Q-Learning para Taxi-v3: https://github.com/louaibenaissa/Taxi-v3
