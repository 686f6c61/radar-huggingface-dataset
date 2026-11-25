# ShigatoraShuz/QLearning-Taxi-v3

## Resumen

QLearning-Taxi-v3 es un agente de aprendizaje por refuerzo publicado en Hugging Face por el usuario ShigatoraShuz. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de una implementación de Q-learning tabular entrenada sobre el entorno Taxi-v3 de Gymnasium (la conocida variante del problema del taxi). El artefacto publicado es un fichero pickle que contiene la tabla Q completa bajo la clave `qtable`, lo que permite reconstruir la política aprendida sin necesidad de reentrenar.

El entorno Taxi-v3 es un problema de control discreto con 500 estados posibles y 6 acciones, en el que un agente debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadrícula. Por su naturaleza tabular y su reducido espacio de estados, este tipo de agente se usa habitualmente como referencia docente y como línea base en cursos y tutoriales de reinforcement learning.

La relevancia de esta ficha es limitada en el contexto de modelos generativos: el repositorio tiene 0 descargas, 0 likes, un tamaño de 0.0 GB y no declara licencia ni idiomas. Sirve, eso sí, como ejemplo reproducible de un agente Q-learning evaluado con una recompensa media de 7.56 ± 2.71 en Taxi-v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q de 500 estados x 6 acciones) |
| Parametros totales | no disponible (no es un modelo neuronal; la tabla Q tiene 3000 entradas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica (tabla de valores en punto flotante almacenada en pickle) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (fichero con la tabla Q bajo la clave `qtable`) |

## Arquitectura y entrenamiento

El agente emplea Q-learning tabular clásico, un método de aprendizaje por refuerzo off-policy basado en diferencias temporales. La política se representa mediante una tabla Q indexada por el estado discreto de Taxi-v3 (500 estados) y las 6 acciones disponibles (moverse al norte, sur, este u oeste, recoger pasajero y dejar pasajero). La actualización sigue la regla de Bellman con una tasa de aprendizaje y un factor de descuento que el autor no detalla en la model card.

El entrenamiento se realizó directamente sobre el entorno `Taxi-v3` con la configuración de entorno indicada como `{}` (es decir, valores por defecto). La model card no especifica el número de episodios, la política de exploración (epsilon-greedy u otra), la tasa de aprendizaje, el factor de descuento ni si se aplicó decaimiento de epsilon. Tampoco se documenta ninguna innovación técnica adicional: no hay redes neuronales, ni decodificación especulativa, ni mecanismos de atención.

## Capacidades

- Resolución del entorno Taxi-v3 mediante política greedy derivada de la tabla Q.
- Toma de decisiones discreta en un espacio de 500 estados y 6 acciones.
- Recogida y entrega de pasajeros en las cuatro ubicaciones del mapa de Taxi-v3.
- Inferencia determinista y de coste computacional despreciable (una búsqueda en tabla).
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle episódico del entorno.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de reinforcement learning: el fichero pickle permite cargar la tabla Q y demostrar visualmente cómo una política tabular resuelve Taxi-v3, sin coste de entrenamiento.
- Línea base en experimentos: sirve como referencia de recompensa media (7.56 ± 2.71) frente a la que comparar algoritmos más avanzados como DQN o PPO en el mismo entorno.
- Pruebas de infraestructura de evaluación: al ser un agente trivial de cargar, se puede usar para validar pipelines de evaluación de entornos Gymnasium antes de escalar a modelos mayores.
- Reproducción de tutoriales: encaja en cuadernos y cursos que implementan Q-learning desde cero y necesitan un artefacto de referencia ya entrenado.
- Depuración de entornos personalizados: permite comparar el comportamiento de la política tabular con variantes modificadas de Taxi-v3 para detectar cambios en la dinámica.
- Ejemplo de serialización de políticas: útil para mostrar cómo empaquetar y distribuir una tabla Q en Hugging Face como artefacto reproducible.
- Comparación de políticas de exploración: la tabla permite analizar la política greedy resultante y contrastarla con políticas entrenadas con distintos hiperparámetros.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; la tabla Q ocupa unos pocos kilobytes y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier GPU consumer, así como en CPU y en dispositivos de bajos recursos.
- Opciones de despliegue: carga directa del pickle con Python (por ejemplo, `pickle.load`), o integración en un bucle de Gymnasium con `gym.make("Taxi-v3")`.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza tabular, la inferencia es una búsqueda en tabla con coste O(1) por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QLearning-Taxi-v3 | Q-learning tabular | Taxi-v3 | 7.56 +/- 2.71 | no disponible | Hugging Face (0 descargas) |
| DQN sobre Taxi-v3 | Red neuronal profunda | Taxi-v3 | no disponible | no disponible | Implementaciones de referencia en Stable-Baselines3 |
| PPO sobre Taxi-v3 | Policy gradient | Taxi-v3 | no disponible | no disponible | Implementaciones de referencia en Stable-Baselines3 |
| Q-learning tabular de referencia (Gymnasium) | Q-learning tabular | Taxi-v3 | no disponible | no disponible | Ejemplos en la documentación de Gymnasium |

No se dispone de cifras de recompensa media publicadas para las alternativas en la información proporcionada; la comparación se limita a la categoría y la disponibilidad.

## Limitaciones y advertencias

- Ámbito muy restringido: la política solo es válida para Taxi-v3 con la configuración por defecto; no generaliza a otros entornos ni a variantes con distinta dinámica.
- Sin licencia declarada: no se especifican condiciones de uso comercial ni de redistribución, lo que supone un riesgo legal para producción.
- Sin documentación de hiperparámetros: no se indica tasa de aprendizaje, factor de descuento, política de exploración ni número de episodios, lo que dificulta la reproducibilidad exacta.
- Resultado no verificado: la recompensa media de 7.56 ± 2.71 está marcada como `verified: false` en la model-index.
- Desviación típica elevada: 2.71 sobre una media de 7.56 indica una varianza considerable en el rendimiento entre episodios.
- Formato pickle: cargar ficheros pickle de origen no confiable implica riesgos de ejecución de código; conviene revisar el artefacto antes de deserializarlo.
- Sin mantenimiento aparente: 0 descargas y 0 likes, con creación y actualización en la misma fecha, sugieren un repositorio sin uso ni validación por parte de la comunidad.
- No apto para tareas de lenguaje, visión ni agentes generales: es un agente específico de un entorno de juguete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShigatoraShuz/QLearning-Taxi-v3
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de Q-learning en Gymnasium: https://gymnasium.farama.org/tutorials/training_agents/blackjack_tutorial/
