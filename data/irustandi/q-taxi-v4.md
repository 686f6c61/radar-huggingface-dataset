# irustandi/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo basado en Q-learning tabular, entrenado para resolver el entorno Taxi-v4 de Gymnasium (anteriormente OpenAI Gym). Ha sido desarrollado por el usuario irustandi y publicado en HuggingFace Hub como un modelo de ejemplo para la integración con la librería `stable-baselines3` y su utilidad `load_from_hub`. El problema que resuelve es el clásico de navegación y recogida de pasajeros en una cuadrícula, donde el agente debe aprender una política óptima mediante la actualización iterativa de una tabla Q. Su relevancia radica en ser un ejemplo didáctico de implementación de Q-learning tabular en un entorno estándar, útil para quienes se inician en RL o para validar pipelines de entrenamiento. No se trata de un modelo de lenguaje ni de un transformer; es un agente de refuerzo con una tabla de estados-acciones.

La arquitectura es una tabla Q clásica, sin red neuronal, y el tamaño del repositorio es de 0.0 GB, lo que sugiere que el peso del modelo es mínimo (probablemente un archivo pickle con la tabla Q). No se especifican parámetros totales ni longitud de contexto, ya que no aplican a este tipo de modelo. La licencia y los idiomas no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q) |
| Parametros totales | no disponible (tamano de la tabla Q no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de observacion discreta) |
| Tipos de cuantizacion | no aplica (pesos en formato pickle) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pickle (archivo q-learning.pkl) |

## Arquitectura y entrenamiento

El modelo emplea Q-learning tabular, un algoritmo de aprendizaje por refuerzo sin aproximación funcional. La tabla Q almacena valores para cada par estado-acción del entorno Taxi-v4, que tiene un espacio de estados discreto (500 estados posibles: 5 posiciones de taxi, 4 destinos, 4 ubicaciones de pasajero y un estado de pasajero en taxi). El entrenamiento se realiza mediante la actualización de Bellman, sin red neuronal ni retropropagación. No se proporcionan detalles sobre el número de episodios, la tasa de aprendizaje, el factor de descuento ni la estrategia de exploración (p. ej., epsilon-greedy). El entorno Taxi-v4 es una versión del clásico Taxi de Gymnasium, con recompensas por recoger y dejar pasajeros y penalizaciones por acciones ilegales.

La implementación se integra con la API de HuggingFace Hub mediante `load_from_hub`, como se muestra en el ejemplo de uso de la model card. No hay información sobre el proceso de entrenamiento ni sobre técnicas adicionales como replay buffer o target network, ya que no son necesarias en Q-learning tabular.

## Capacidades

- Jugar al entorno Taxi-v4 de Gymnasium, aprendiendo una política que maximiza la recompensa acumulada.
- Tomar decisiones discretas en un espacio de estados finito (5x5 cuadrícula, 6 acciones posibles).
- Almacenar y recuperar la política aprendida mediante un archivo pickle.
- Ser cargado y ejecutado con la librería `stable-baselines3` y su utilidad `load_from_hub`.
- No posee capacidades de generación de texto, razonamiento, código, visión ni tool calling, al ser un agente RL puramente tabular.
- No es multilingüe ni tiene soporte para agentes conversacionales.

## Casos de uso

- Educación en aprendizaje por refuerzo: sirve como ejemplo práctico de Q-learning tabular para estudiantes que quieran ver cómo se entrena y evalúa un agente en un entorno estándar.
- Validación de pipelines de HuggingFace Hub: permite probar la carga de modelos RL desde el Hub con `load_from_hub` y verificar la compatibilidad con Gymnasium.
- Comparación de algoritmos: puede usarse como baseline para comparar Q-learning con otros métodos (Sarsa, DQN, etc.) en el mismo entorno, midiendo recompensa media y convergencia.
- Prueba de entornos personalizados: el agente puede adaptarse a variantes de Taxi (p. ej., con `is_slippery=True`) si se reentrena, aunque el modelo publicado no lo especifica.
- Demostración de persistencia de modelos: muestra cómo guardar y cargar una tabla Q en un archivo pickle para su reutilización.
- Investigación reproducible: al estar publicado en el Hub, permite reproducir experimentos de RL con un agente concreto y un resultado conocido (mean_reward 7.54 ± 2.71).

## Benchmarks y rendimiento

El autor declara en el model-index el siguiente resultado para el entorno Taxi-v4:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.54 +/- 2.71 | false |

No se han publicado resultados en otros benchmarks ni comparaciones con otros agentes. La recompensa media de 7.54 ± 2.71 indica un rendimiento moderado, ya que la recompensa máxima teórica en Taxi-v4 es 20 por episodio (asumiendo recogida y entrega exitosa sin penalizaciones). La desviación estándar de 2.71 sugiere variabilidad entre episodios, posiblemente por la estocasticidad del entorno o por una política subóptima.

## Requisitos de hardware

- Inferencia en CPU: el agente solo necesita cargar una tabla Q (tamaño 500x6 ≈ 3000 valores) y ejecutar la política greedy, por lo que cualquier CPU moderna es suficiente.
- VRAM: no requiere GPU, ya que no hay red neuronal.
- GPU recomendada: ninguna.
- Consumo de memoria: menos de 1 MB para la tabla Q.
- Despliegue: se puede ejecutar con Gymnasium y stable-baselines3 en cualquier entorno Python; no requiere vLLM, Ollama ni TGI.
- Latencia: del orden de microsegundos por decisión, al ser una simple consulta a tabla.
- Throughput: no relevante para este tipo de agente.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros agentes RL para Taxi-v4. Como referencia genérica:

| Modelo | Algoritmo | Recompensa media (Taxi-v4) | Licencia | Disponibilidad |
|---|---|---|---|---|
| q-Taxi-v4 | Q-learning tabular | 7.54 ± 2.71 | no disponible | HuggingFace Hub |
| Agente DQN (típico) | Deep Q-Network | ~9-10 (no verificado) | variable | no publicado |
| Agente Sarsa (típico) | Sarsa tabular | ~8-9 (no verificado) | variable | no publicado |

Los valores de DQN y Sarsa son estimaciones orientativas basadas en resultados comunes en la literatura, no en datos oficiales. No hay información suficiente para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo solo funciona en el entorno Taxi-v4; no generaliza a otros entornos ni a variantes no entrenadas.
- La recompensa media declarada (7.54 ± 2.71) no está verificada externamente y podría variar según la semilla o el número de episodios de evaluación.
- No se especifican los hiperparámetros de entrenamiento (tasa de aprendizaje, epsilon, número de episodios), lo que dificulta la reproducibilidad.
- La licencia no está declarada; su uso en producción o en proyectos comerciales es incierto.
- El formato de pesos es pickle, lo que implica riesgos de seguridad si se carga un archivo de origen no confiable (ejecución de código arbitrario).
- No hay información sobre sesgos, alucinaciones o riesgos éticos, ya que no es un modelo generativo.
- El autor no proporciona documentación sobre el proceso de entrenamiento ni sobre el rendimiento en diferentes condiciones (p. ej., con `is_slippery=True`).

## Enlaces

- HuggingFace: https://huggingface.co/irustandi/q-Taxi-v4
- No se han encontrado papers, repositorios adicionales ni demos en la información proporcionada.
