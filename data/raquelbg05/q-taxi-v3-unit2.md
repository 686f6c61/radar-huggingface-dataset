# RaquelBG05/q-Taxi-v3-unit2

## Resumen

`RaquelBG05/q-Taxi-v3-unit2` es una implementación tabular de Q-learning sobre el entorno `Taxi-v3` de Gymnasium, publicada como práctica de la Unidad 2 del curso de Deep Reinforcement Learning de Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal: es una tabla Q almacenada como array de NumPy, resultado de un ejercicio didáctico, no de un sistema entrenado a escala.

El autor reporta 25.000 episodios de entrenamiento y una evaluación sobre 100 episodios con una recompensa media de 7,540 y una desviación típica de 2,711. El repositorio ocupa 0,0 GB y contiene la tabla Q (`q-table.npy`), un vídeo MP4 de un episodio completado y un fichero `results.json` con los datos completos.

Su relevancia es exclusivamente educativa: sirve como referencia canónica de cómo se estructura una entrega de la citada unidad del curso (formato de pickle, semillas, métricas), no como componente para producción. Cualquier evaluador técnico debe tratarlo como artefacto de aprendizaje, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q en NumPy, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de dimensiones estado × acción de Taxi-v3; el autor no declara el número de celdas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de un solo agente con observaciones discretas de Taxi-v3) |
| Tipos de cuantizacion | no aplica (array NumPy de precisión nativa) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.npy` (tabla Q, `numpy.load` con `allow_pickle=False`) y pickle con parámetros y semillas |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular clásico implementado desde cero con NumPy y Gymnasium. El agente mantiene una tabla Q indexada por el estado discreto de `Taxi-v3` (500 estados posibles en la formulación estándar del entorno) y las seis acciones discretas (moverse al norte, sur, este, oeste, recoger pasajero y dejar pasajero). La actualización sigue la regla de Bellman off-policy con la recompensa inmediata y el máximo sobre las acciones del estado siguiente, aplicando una tasa de aprendizaje y un factor de descuento cuyos valores concretos no se detallan en la información disponible.

El entrenamiento consta de 25.000 episodios y la evaluación de 100 episodios, todos completados según el autor. No se especifica política de exploración (epsilon-greedy u otra), ni su decaimiento, ni hiperparámetros como alpha o gamma. Tampoco se documenta inicialización de la tabla ni composición de semillas más allá de que el pickle las incluye. No hay RLHF, DPO ni ningún componente neuronal; la "innovación" es la implementación manual del algoritmo con fines didácticos.

## Capacidades

- Resolución del entorno `Taxi-v3` mediante política greedy derivada de la tabla Q.
- Recogida y entrega de pasajeros en un gridworld discreto de 5×5 con cuatro ubicaciones de recogida/entrega.
- Aprendizaje off-policy con actualizaciones de Q sobre transiciones discretas.
- Persistencia de la tabla Q en formato NumPy sin pickle para carga segura.
- Reproducibilidad mediante semillas incluidas en el pickle asociado.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia de reinforcement learning: sirve como entrega de referencia de la Unidad 2 del curso de Hugging Face, mostrando la estructura esperada (tabla Q, MP4, `results.json`) para que otros alumnos comparen su implementación.
- Verificación de pipelines de RL tabular: permite probar scripts de carga (`numpy.load` con `allow_pickle=False`) y de evaluación sobre `Taxi-v3` sin depender de pesos neuronales.
- Reproducción de experimentos: las semillas incluidas en el pickle permiten repetir exactamente el entrenamiento y contrastar la recompensa media reportada de 7,540.
- Material de comparación de algoritmos: útil como línea base tabular frente a implementaciones con function approximation (DQN) sobre el mismo entorno.
- Demostración de evaluación estandarizada: los 100 episodios con recompensa media y desviación típica sirven de plantilla para reportar métricas en entornos discretos.
- Ejemplo de gestión de artefactos en Hugging Face Hub: muestra cómo publicar tabla Q, vídeo y JSON de resultados en un repositorio de modelo con `pipeline_tag: reinforcement-learning`.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Entorno | Tarea | Métrica | Valor |
|---|---|---|---|
| Taxi-v3 | reinforcement-learning | mean_reward | 7,540 ± 2,711 |

El autor reporta además 100 episodios de evaluación completados y una media menos desviación de 4,829. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la tabla Q es un array NumPy de tamaño despreciable (el repositorio ocupa 0,0 GB).
- GPU: no necesaria; la inferencia y el entrenamiento son operaciones sobre CPU.
- Consumer GPU: irrelevante, cabe en cualquier CPU moderna.
- Despliegue: no procede vLLM, llama.cpp, Ollama ni TGI; la carga se realiza con `numpy.load('q-table.npy', allow_pickle=False)` y la ejecución con Gymnasium.
- Latencia y throughput: no disponibles; dependen de la implementación del bucle de entorno, no del artefacto.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RaquelBG05/q-Taxi-v3-unit2 | Q-learning tabular | Taxi-v3 | mean_reward 7,540 ± 2,711 | no disponible | Hugging Face Hub |
| Implementaciones de referencia del curso HF (Unidad 2) | Q-learning tabular | Taxi-v3 | no disponible en esta ficha | no disponible | Curso Hugging Face |
| DQN sobre Taxi-v3 | Aproximación funcional (red neuronal) | Taxi-v3 | no disponible en esta ficha | variable | Repositorios de terceros |

No se dispone de datos comparativos verificados de alternativas en la información proporcionada; la comparación con DQN u otros métodos queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural; cualquier uso fuera de `Taxi-v3` carece de sentido.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Métricas no verificadas (`verified: false` en el model-index): la recompensa media de 7,540 procede únicamente del autor.
- Alta varianza: desviación típica de 2,711 sobre una media de 7,540 indica un rendimiento inestable entre episodios.
- Hiperparámetros ausentes: sin alpha, gamma, epsilon ni política de exploración documentados, la reproducibilidad exacta depende del pickle y las semillas, no de la model card.
- Sin generalización: la tabla Q solo es válida para la formulación concreta de `Taxi-v3`; cambios en la versión del entorno o en la codificación de estados invalidan la política.
- Artefacto didáctico: no apto para producción, evaluación de modelos fundacionales ni pipelines de decisión reales.
- Sin sesgos lingüísticos ni de alucinación aplicables, pero tampoco garantías de robustez fuera del entorno de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaquelBG05/q-Taxi-v3-unit2
- Práctica oficial del curso (Unidad 2): https://huggingface.co/learn/deep-rl-course/unit2/hands-on
