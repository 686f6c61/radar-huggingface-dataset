# sahilpatkar/Taxi-v4

## Resumen

El modelo `sahilpatkar/Taxi-v4` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-learning para resolver el entorno Taxi-v4 de OpenAI Gym. El autor, sahilpatkar, publica este agente como una implementación personalizada con el objetivo de demostrar cómo un agente puede aprender a navegar en un entorno de cuadrícula 5x5, recoger a un pasajero en una de cuatro ubicaciones fijas (R, G, Y, B) y dejarlo en su destino correcto. La recompensa media declarada es de 7.50 ± 2.76, aunque el resultado no está verificado externamente.

El modelo se distribuye como un archivo de pesos en formato pickle (`q-learning.pkl`) que contiene la tabla Q aprendida, junto con los atributos necesarios para cargar el entorno. No se especifican detalles de arquitectura, tamaño de parámetros ni licencia, ya que se trata de un artefacto de aprendizaje por refuerzo, no de un modelo de lenguaje. Es relevante para la comunidad de RL por su sencillez y reproducibilidad, aunque su aplicabilidad práctica fuera del entorno Taxi-v4 es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning (tabla Q, sin red neuronal) |
| Parametros totales | No disponible (tabla de estados-acciones, tamaño indeterminado) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (entorno de observación discreta, 500 estados posibles) |
| Tipos de cuantizacion | No disponible (almacenado en pickle) |
| Idiomas soportados | No aplicable (agente de RL, no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Pickle (archivo `q-learning.pkl`) |

## Arquitectura y entrenamiento

El agente utiliza Q-learning, un algoritmo de aprendizaje por refuerzo fuera de política (off-policy). Mantiene una tabla Q que mapea cada par estado-acción a un valor esperado de retorno acumulado. El entorno Taxi-v4 es un problema de cuadrícula 5×5 con 500 estados posibles (posición del taxi, ubicación del pasajero y destino) y 6 acciones (4 movimientos, recoger y dejar). El entrenamiento se realizó mediante iteraciones de actualización de la Q-table con la regla de Bellman, aunque los hiperparámetros concretos (tasa de aprendizaje, factor de descuento, política de exploración) no están documentados en la información disponible. No se emplean redes neuronales, ni transformadores, ni mecanismos de atención.

## Capacidades

- Navegación en entornos de cuadrícula: el agente es capaz de moverse por un grid de 5×5, recoger y dejar pasajeros en destinos específicos.
- Optimización de decisiones secuenciales: mediante la política aprendida, selecciona acciones que maximizan la recompensa acumulada en el entorno Taxi-v4.
- Reproducibilidad: al estar almacenado como pickle, puede cargarse y ejecutarse fácilmente con el entorno Gym para verificar su comportamiento.
- No soporta tool calling, agentes conversacionales, procesamiento de lenguaje, visión ni capacidades multilingües, al ser un modelo de RL puro.

## Casos de uso

- Educación en aprendizaje por refuerzo: sirve como ejemplo didáctico para entender el funcionamiento del Q-learning y la resolución de problemas de decisión secuencial en entornos discretos.
- Investigación en algoritmos de RL: permite comparar el rendimiento de Q-learning clásico con otros métodos (DQN, SARSA, etc.) sobre el mismo entorno Taxi-v4.
- Prototipado de agentes de navegación en espacios discretos: aunque limitado a la cuadrícula del entorno, puede adaptarse como base para problemas similares de planificación de rutas.
- Demostración de integración con OpenAI Gym: muestra cómo cargar un agente entrenado desde Hugging Face Hub y ejecutarlo en un entorno Gym, útil para desarrolladores que quieran publicar o consumir modelos de RL.
- Evaluación de estrategias de exploración: al ser un agente Q-learning, puede usarse para analizar el impacto de distintos parámetros (epsilon, tasa de aprendizaje) en la convergencia y recompensa final.
- Pruebas de concepto en entornos de control: aunque limitado al caso Taxi, sirve como punto de partida para problemas similares de decisión en espacios de estado finitos.

## Benchmarks y rendimiento

Según los datos declarados en la model card, el agente alcanza una recompensa media de 7.50 ± 2.76 en el entorno Taxi-v4. Este resultado no ha sido verificado externamente (verified: false). No se dispone de otros benchmarks como MMLU, HumanEval o GSM8K, al no ser un modelo de lenguaje.

| Benchmark | Resultado |
|---|---|
| Taxi-v4 (mean_reward) | 7.50 ± 2.76 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser una tabla Q almacenada en pickle, el modelo es extremadamente ligero (tamaño de unos pocos kilobytes). No requiere GPU.
- Puede ejecutarse en cualquier CPU, incluso en entornos de bajo consumo (Raspberry Pi, portátiles antiguos).
- No se requieren GPUs específicas ni memoria VRAM.
- El despliegue se realiza mediante Python y el entorno Gymnasium (o OpenAI Gym), cargando el pickle con la función `load_from_hub` de Hugging Face.
- Latencia de inferencia despreciable, ya que la acción se determina consultando la tabla Q (operación O(1) por estado).

## Comparativa con modelos similares

No se dispone de información sobre otros agentes Q-learning publicados para Taxi-v4 con métricas comparables. Existen otros repositorios en Hugging Face con el mismo nombre de entorno (por ejemplo, `JackForAI/Taxi-V4` y `lucidjitters/taxi-v4`), pero no se han encontrado datos de rendimiento ni especificaciones técnicas para comparar. Por tanto, no se puede realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está restringido exclusivamente al entorno Taxi-v4; no generaliza a otros entornos o tareas fuera de esa cuadrícula específica.
- La recompensa media declarada (7.50) es baja en comparación con el rendimiento óptimo esperado en este entorno (el máximo suele ser 10), lo que sugiere que el agente no ha convergido de manera óptima.
- No hay información sobre el proceso de entrenamiento (número de episodios, hiperparámetros), lo que dificulta reproducir exactamente el mismo resultado.
- Al ser un modelo con licencia no disponible, no se conoce si su uso comercial está permitido; se debe contactar al autor antes de emplearlo en proyectos productivos.
- El formato pickle puede plantear riesgos de seguridad si se carga desde fuentes no confiables (ejecución de código arbitrario). Se recomienda cargar solo desde el repositorio oficial.
- No se garantiza la robustez ante variaciones del entorno (por ejemplo, si se modifica la recompensa o el mapa).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahilpatkar/Taxi-v4
- Entorno Taxi-v4 (referencia): https://github.com/janashams/Taxi-v4-OpenAI-Gymnasium (ejemplo de uso, no del modelo)
- Documentación de Gymnasium: https://gymnasium.farama.org/
