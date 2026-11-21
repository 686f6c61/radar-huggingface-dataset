# RaquelBG05/a2c-PandaReachDense-v3-unit6

## Resumen

A2C PandaReachDense-v3 es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo Advantage Actor-Critic (A2C) sobre el entorno `PandaReachDense-v3` de Panda-Gym, una tarea de control robótico en la que un brazo manipulador de siete grados de libertad debe alcanzar una posición objetivo en el espacio 3D con su efector final. El modelo fue desarrollado por RaquelBG05 como ejercicio práctico (hands-on) de la Unidad 6 de un curso de aprendizaje por refuerzo de Hugging Face, y se publica como artefacto didáctico más que como sistema listo para producción.

El agente utiliza una política `MultiInputPolicy` implementada en Stable-Baselines3 2.6.0, lo que implica que procesa observaciones multimodales (típicamente estado proprioceptivo del robot y posición del objetivo). El entrenamiento se realizó en CPU durante 200.000 pasos con normalización de observaciones y recompensas mediante `VecNormalize`, un detalle crítico porque los pesos solo son utilizables junto con el fichero `vec_normalize.pkl`.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de RL con Stable-Baselines3 y Panda-Gym, y como ejemplo de publicación de artefactos (pesos, historial de entrenamiento, resultados por episodio y vídeo) en el Hub. No es un modelo de lenguaje ni un modelo fundacional; es un checkpoint de política para una tarea de robótica simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Advantage Actor-Critic (A2C) con política `MultiInputPolicy` (redes actor-crítico separadas, MLP sobre observaciones multimodales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (checkpoint de Stable-Baselines3 en formato nativo PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Stable-Baselines3 (`.zip` de PyTorch) más `vec_normalize.pkl` requerido para la inferencia |
| Entorno | `PandaReachDense-v3` (Panda-Gym 3.0.7) |
| Algoritmo | A2C (Stable-Baselines3 2.6.0) |
| Pasos de entrenamiento | 200.000 |
| Hardware de entrenamiento | CPU |
| Repo size | 0.0 GB (según el Hub) |

## Arquitectura y entrenamiento

El modelo emplea A2C, un método actor-crítico síncrono con ventaja (advantage) que actualiza la política y la función de valor de forma conjunta en cada paso de recolección de experiencia. La política es `MultiInputPolicy`, lo que en Stable-Baselines3 implica un extractor de características que combina distintas claves del diccionario de observaciones (típicamente estado del robot y pose del objetivo) antes de pasar por las cabezas de actor y crítico. No se dispone de detalles sobre el número de capas ni de unidades ocultas.

El entrenamiento se realizó en CPU durante 200.000 pasos, con cuatro entornos en paralelo y `VecNormalize` activo para normalizar observaciones y recompensas. La evaluación se hizo sobre 100 episodios con semilla inicial 6600, política determinista (sin exploración) y `VecNormalize` congelado, midiendo recompensas sin normalizar. Los 100 episodios resultaron exitosos según la model card. No se documentan técnicas adicionales como recompensas conformadas, curriculums o ajuste fino con DPO/RLHF (no aplicables aquí).

## Capacidades

- Control de un brazo robótico simulado de siete grados de libertad para alcanzar una posición objetivo 3D (tarea de reaching).
- Política determinista apta para inferencia sin exploración.
- Procesamiento de observaciones multimodales mediante `MultiInputPolicy` (estado del robot y objetivo).
- Integración directa con Stable-Baselines3 (`model.predict`) y con entornos Panda-Gym.
- Uso con `VecNormalize` cargado desde `vec_normalize.pkl` para reproducir la distribución de observaciones del entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Docencia y tutoriales de RL: sirve como ejemplo completo y reproducible de un pipeline A2C con Stable-Baselines3, incluyendo pesos, historial de entrenamiento y resultados por episodio; útil para que estudiantes comparen su implementación con una referencia.
- Reproducción de experimentos: cargar el checkpoint junto con `vec_normalize.pkl` permite replicar la evaluación con semilla 6600 y verificar la media de recompensa reportada (−0,2089 ± 0,1143).
- Línea base para comparativas de algoritmos: al ser un A2C sobre `PandaReachDense-v3`, sirve como punto de partida para comparar con PPO, SAC o TD3 en la misma tarea.
- Pruebas de integración de Panda-Gym: validar que el entorno y la versión de Panda-Gym 3.0.7 funcionan correctamente en un entorno local antes de lanzar entrenamientos más costosos.
- Material para análisis de curvas de aprendizaje: el `historial.json` y `resultados.json` permiten estudiar la varianza entre episodios y la estabilidad del algoritmo A2C en tareas de control continuo.
- Demostración visual: el `replay.mp4` incluido facilita presentaciones o materiales docentes sin necesidad de ejecutar el simulador.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Tarea | Reinforcement Learning (`PandaReachDense-v3`) |
| mean_reward | -0.20893033 ± 0.11434892 |
| Episodios de evaluación | 100 |
| Éxitos | 100 |
| Pasos de entrenamiento | 200.000 |
| Media − desviación | -0.3233 |

No se han publicado resultados de benchmarks comparativos con otros algoritmos o checkpoints en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: suficiente para ejecutar la política; el entrenamiento original se hizo íntegramente en CPU.
- VRAM estimada: no disponible; el tamaño del checkpoint no se especifica (repo de 0.0 GB según el Hub), pero por la naturaleza de la política es previsible que sea reducido.
- GPU recomendadas: no aplica para inferencia de un solo agente; para reentrenamiento se puede usar cualquier GPU compatible con PyTorch, aunque no se documentan requisitos.
- Cabe en GPU consumer: previsiblemente sí, dado que el entrenamiento se realizó en CPU; no se confirma con datos.
- Opciones de despliegue: Stable-Baselines3 (`A2C.load`), Panda-Gym 3.0.7 para el entorno, y `VecNormalize.load` para el fichero `vec_normalize.pkl`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints comparables en la documentación proporcionada. Como referencia de categoría, la comparación natural sería con otros algoritmos de Stable-Baselines3 (PPO, SAC, TD3) entrenados sobre `PandaReachDense-v3`, pero no se aportan datos de rendimiento de esos modelos en la información disponible.

| Modelo | Algoritmo | Entorno | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A2C PandaReachDense-v3 (este) | A2C | PandaReachDense-v3 | no aplica | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un artefacto didáctico de un curso, no un sistema validado para producción robótica.
- La inferencia requiere obligatoriamente `vec_normalize.pkl`; sin él, las observaciones no estarán en la distribución de entrenamiento y el rendimiento se degradará.
- La licencia no está especificada, lo que impide confirmar si se permite uso comercial.
- El entrenamiento se realizó en CPU con 200.000 pasos; no hay evidencia de robustez ante variaciones del entorno, cambios de dominio ni perturbaciones.
- La evaluación se hizo con una única semilla inicial (6600) y 100 episodios; la varianza reportada (±0,1143) indica dispersión no despreciable entre episodios.
- No hay información sobre sesgos, alucinaciones ni limitaciones idiomáticas porque no es un modelo de lenguaje.
- El tamaño del repositorio aparece como 0.0 GB en el Hub, lo que puede indicar que los artefactos no están completamente subidos o que el Hub no ha calculado el tamaño; conviene verificar los ficheros antes de confiar en la reproducibilidad.
- Los resultados del model-index están marcados como `verified: false`; no han sido validados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaquelBG05/a2c-PandaReachDense-v3-unit6
- Historial de entrenamiento: https://huggingface.co/RaquelBG05/a2c-PandaReachDense-v3-unit6/blob/main/historial.json
- Resultados por episodio: https://huggingface.co/RaquelBG05/a2c-PandaReachDense-v3-unit6/blob/main/resultados.json
- Vídeo de un episodio: https://huggingface.co/RaquelBG05/a2c-PandaReachDense-v3-unit6/blob/main/replay.mp4
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Panda-Gym: https://github.com/qgallouedec/panda-gym
- Documentación de A2C en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/a2c.html
