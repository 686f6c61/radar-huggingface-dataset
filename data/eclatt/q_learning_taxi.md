# eclatt/Q_learning_Taxi

## Resumen

`eclatt/Q_learning_Taxi` es un agente de aprendizaje por refuerzo basado en el algoritmo clásico de Q-learning, entrenado para resolver el entorno `Taxi-v4` de Gymnasium. El autor, `eclatt`, publica el modelo como un artefacto de demostración: un agente que aprende a recoger y dejar pasajeros en un entorno de cuadrícula con acciones discretas. No se trata de un modelo de lenguaje ni de una red neuronal, sino de una tabla Q (Q-table) que mapea estados a valores de acción.

El modelo es relevante como ejemplo didáctico de RL tabular, ya que muestra cómo un agente puede aprender una política óptima sin redes profundas. La recompensa media declarada es de 7.50 ± 2.78 en el entorno `Taxi-v4`, lo que indica un rendimiento moderado (el entorno tiene recompensas positivas por entregas correctas y negativas por acciones ilegales). No se dispone de información sobre el proceso de entrenamiento, hiperparámetros ni configuración del entorno (por ejemplo, si se usó `is_slippery=False`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla Q (Q-table) para Q-learning tabular |
| Parametros totales | no disponible (depende del tamaño de la tabla, no especificado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no procesamiento de secuencias) |
| Tipos de cuantizacion | no aplica (los pesos se guardan como pickle, no como tensores cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pickle (`.pkl`), cargado mediante `load_from_hub` |

## Arquitectura y entrenamiento

El modelo implementa Q-learning tabular, un algoritmo de RL sin redes neuronales. El agente mantiene una tabla que asocia cada estado del entorno `Taxi-v4` con un valor Q para cada acción posible. El entorno `Taxi-v4` es una variante de `Taxi-v3` (posiblemente con cambios en la mecánica o recompensas, aunque no se especifican). El estado incluye la posición del taxi, la ubicación del pasajero y el destino. Las acciones son mover el taxi, recoger y dejar pasajeros.

No se proporcionan detalles sobre el número de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento, la estrategia de exploración (epsilon-greedy, etc.) ni la configuración exacta del entorno. El autor solo indica que el agente fue entrenado y que el modelo se puede cargar con `load_from_hub(repo_id="eclatt/Q_learning_Taxi", filename="q-learning.pkl")`. No hay evidencia de técnicas avanzadas como DQN, doble Q-learning o redes neuronales.

## Capacidades

- Navegación en un entorno de cuadrícula: el agente aprende a mover el taxi por el mapa para recoger y entregar pasajeros.
- Toma de decisiones secuencial: utiliza la política derivada de la tabla Q para elegir acciones en cada paso.
- Aprendizaje por refuerzo: el modelo es el resultado de un proceso de prueba y error con recompensas positivas y negativas.
- No tiene capacidades de generación de texto, razonamiento simbólico, tool calling, visión ni procesamiento de lenguaje natural.
- No es un modelo multilingüe ni admite interacción conversacional.

## Casos de uso

- Demostración educativa de Q-learning: el modelo sirve como ejemplo práctico para enseñar los fundamentos del RL tabular en cursos de inteligencia artificial o aprendizaje automático.
- Comparación de algoritmos: se puede utilizar como línea base para comparar con agentes basados en DQN, SARSA o políticas más avanzadas en el mismo entorno.
- Experimentación con hiperparámetros: al ser un modelo pequeño y rápido de entrenar, permite probar distintas tasas de aprendizaje, factores de descuento o estrategias de exploración sin necesidad de GPU.
- Validación de entornos de Gymnasium: el agente puede usarse para verificar que el entorno `Taxi-v4` funciona correctamente y que las recompensas se interpretan adecuadamente.
- Práctica de integración con Hugging Face Hub: el modelo demuestra cómo subir y cargar artefactos de RL mediante `load_from_hub`, útil para desarrolladores que quieran publicar sus propios agentes.
- Benchmark de rendimiento en tareas de control discreto: aunque la recompensa media es modesta, puede servir como referencia para medir la dificultad del entorno o la calidad de otras implementaciones.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card, sin verificación independiente:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.50 ± 2.78 |

No se han publicado comparaciones con otros agentes en el mismo entorno. La recompensa media de 7.50 sugiere que el agente resuelve algunas entregas correctamente, pero no alcanza el rendimiento óptimo (que en Taxi suele estar por encima de 8-9 en versiones anteriores, dependiendo de la configuración). No hay datos sobre desviación estándar adicional ni sobre el número de episodios de evaluación.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una tabla Q, por lo que la carga y la toma de decisiones requieren recursos mínimos (menos de 1 MB de RAM).
- GPU: no necesaria. El modelo se ejecuta en cualquier máquina con Python y Gymnasium.
- Compatible con ordenadores de bajo coste, Raspberry Pi o incluso entornos de notebook en la nube.
- Despliegue: se carga mediante `load_from_hub` (de la librería `huggingface_hub` o similar) y se usa con `gym.make(model["env_id"])`. No requiere vLLM, llama.cpp ni Ollama.
- Latencia: despreciable, del orden de microsegundos por decisión, al ser una simple consulta a una tabla.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Existen otros agentes Q-learning para Taxi en Hugging Face, como `ImaghT/q-learning-taxi-v3` (para Taxi-v3) o `fiorane/Taxi-v4-Qlearning`, pero no se han publicado métricas comparables en la información disponible. La comparación cualitativa se limita a:

| Modelo | Entorno | Recompensa declarada | Licencia |
|---|---|---|---|
| eclatt/Q_learning_Taxi | Taxi-v4 | 7.50 ± 2.78 | no disponible |
| ImaghT/q-learning-taxi-v3 | Taxi-v3 | no disponible | no disponible |
| fiorane/Taxi-v4-Qlearning | Taxi-v4 | no disponible | no disponible |

No se puede establecer una comparativa rigurosa sin datos adicionales.

## Limitaciones y advertencias

- Entorno específico: el agente solo funciona en `Taxi-v4`; no generaliza a otros entornos ni a variaciones del mismo (por ejemplo, cambios en el mapa o en las recompensas).
- Sin licencia clara: la licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- Rendimiento limitado: la recompensa media de 7.50 ± 2.78 indica que el agente no es óptimo; puede cometer errores frecuentes y no es adecuado para tareas de producción.
- Sin documentación de entrenamiento: no se detallan hiperparámetros, número de episodios ni configuración del entorno, lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste al entorno: al ser una tabla Q, el agente memoriza la política para los estados discretos de `Taxi-v4`; cualquier cambio en la dinámica del entorno invalidaría el modelo.
- Formato de pesos propietario: el archivo `.pkl` puede no ser compatible con versiones futuras de Gymnasium o de la librería de carga, lo que podría requerir adaptaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eclatt/Q_learning_Taxi
- Entorno Taxi-v4 (Gymnasium): no se ha encontrado un enlace oficial específico en la información proporcionada.
- Referencias de Q-learning con Taxi (material didáctico externo, no afiliado al autor):
  - Notebook de ejemplo: https://colab.research.google.com/github/VizuaraAI/RL-in-Production-Bootcamp-Resources/blob/main/lectures/02-dqn/assignments/Project_1_QLearning_Taxi.ipynb
  - Notebook de Q-learning con Taxi-v3: https://colab.research.google.com/gist/simoninithomas/466c81aa1c2a07dd14793240c6d033c5/q-learning-with-taxi-v3.ipynb
