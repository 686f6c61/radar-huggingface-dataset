# mohendy/planet-dmc-rgb-seed0

## Resumen

PlaNet (Learning Latent Dynamics for Planning from Pixels) es un agente de aprendizaje por refuerzo basado en modelos que aprende a planificar directamente desde observaciones de píxeles. Este repositorio concreto, `mohendy/planet-dmc-rgb-seed0`, contiene checkpoints de TensorFlow de una reproducción del algoritmo original de Hafner et al. (2019) sobre tres tareas del DeepMind Control Suite: Cartpole Swingup, Reacher Easy y Cheetah Run. Las observaciones son imágenes RGB de 64×64 píxeles.

El modelo resuelve el problema de control en entornos simulados sin conocer la dinámica real: aprende una representación latente comprimida de la observación y de las transiciones, y utiliza el método de entropía cruzada (CEM) para planificar secuencias de acciones en ese espacio latente. Es relevante porque es un referente histórico del RL basado en modelos con imágenes, y esta reproducción ofrece una implementación moderna en TensorFlow 2.15 lista para evaluar. El tamaño del repositorio es de 0,2 GB y no se han publicado los parámetros totales del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PlaNet (red recurrente de estado latente con estado determinista y estocástico, RSSM) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (observaciones de imagen RGB 64×64, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de TensorFlow (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

PlaNet combina un modelo de espacio de estado recurrente (RSSM) con un planificador CEM. El RSSM mantiene un estado latente determinista y otro estocástico, y se entrena para reconstruir las observaciones y predecir las recompensas. La planificación se realiza mediante el muestreo de secuencias de acciones en el espacio latente, optimizando la recompensa acumulada esperada. En esta reproducción, el modelo se entrena con los hiperparámetros del paper original y 1.000 episodios recogidos por tarea. El entrenamiento se realizó con una única semilla (seed 0) y se guardaron los checkpoints en el paso 4.504.500, aunque el entrenamiento continuó hasta 5 millones de pasos sin guardar el estado final. El código original de TensorFlow 1.13 se portó a TensorFlow 2.15 mediante `tensorflow.compat.v1`, y se usaron `dm-control==1.0.9` y `mujoco==2.3.2`. No se aplicaron técnicas de RLHF ni DPO, al tratarse de un modelo de control.

## Capacidades

- Control de tareas del DeepMind Control Suite a partir de imágenes RGB 64×64.
- Planificación en espacio latente mediante el método de entropía cruzada (CEM).
- Modelado de la dinámica del entorno y de las recompensas desde píxeles.
- Evaluación post-hoc con diez trayectorias secuenciales y `batch_size=1`.
- No soporta generación de texto, tool calling, agentes conversacionales ni entrada multimodal de tipo lenguaje.
- Capacidad multilingüe: no aplica.

## Casos de uso

- Investigación en RL basado en modelos: reproducir los experimentos de PlaNet en DeepMind Control Suite y comparar el comportamiento del planificador CEM frente a variantes propias.
- Evaluación de políticas de control: ejecutar el script `evaluate_checkpoint.py` incluido en el repositorio para medir el rendimiento de los checkpoints en tareas concretas, como Cartpole Swingup o Cheetah Run.
- Desarrollo de agentes para entornos simulados: usar el modelo como baseline en trabajos de control robótico o de aprendizaje por refuerzo con observaciones de píxeles.
- Comparación de planificadores latentes: modificar la lógica de CEM o el número de muestras y evaluar el impacto sobre la recompensa final, aprovechando la arquitectura modular del repositorio.
- Pruebas de portabilidad de código: validar la compatibilidad de una implementación de 2019 con stacks modernos de TensorFlow 2.15, MuJoCo y dm_control.
- Docencia y demostración: ilustrar el funcionamiento de agentes latentes y la planificación basada en modelos en cursos o seminarios de aprendizaje por refuerzo.

## Benchmarks y rendimiento

La evaluación post-hoc utiliza los ajustes de CEM del paper y diez trayectorias secuenciales con `batch_size=1`. Los resultados se comparan con la media del paper original (cinco semillas):

| Tarea | Media | Desviación estándar | Media del paper (5 semillas) |
|---|---|---:|---:|
| Cartpole Swingup | 845,16 | 12,79 | 821 |
| Reacher Easy | 595,40 | 473,27 | 832 |
| Cheetah Run | 670,43 | 12,06 | 662 |

Reacher Easy presenta una varianza muy alta: seis de las diez trayectorias puntuaron entre 953 y 1000, mientras que cuatro puntuaron entre 0 y 59. Estos checkpoints corresponden a una única semilla de entrenamiento, por lo que no son directamente comparables con la media sobre cinco semillas del paper. No se han publicado resultados de otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,2 GB, lo que sugiere un modelo pequeño, pero no se proporciona un valor de VRAM para inferencia.
- GPU recomendada: no especificada. La evaluación puede ejecutarse con TensorFlow en CPU y utilizar una GPU solo para el renderizado EGL de MuJoCo, como se indica en el comando de evaluación del repositorio.
- Si cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, aunque no se confirma en la documentación.
- Opciones de despliegue: scripts de evaluación de TensorFlow (por ejemplo, `planet/scripts/evaluate_checkpoint.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se disponen de comparativas numéricas en la información proporcionada. PlaNet se puede situar frente a Dreamer, un descendiente directo que sustituye la planificación CEM por un actor-crítico entrenado en el espacio latente. Sin embargo, no se aportan métricas de rendimiento comparadas en esta ficha. Tampoco hay datos de modelos alternativos de la misma categoría, como SAC o PPO, en la información disponible.

## Limitaciones y advertencias

- El modelo se entrenó con una única semilla (seed 0), por lo que los resultados no reflejan la robustez media del paper original.
- La tarea Reacher Easy presenta una alta varianza entre trayectorias, lo que dificulta la evaluación fiable del rendimiento.
- Los checkpoints guardados corresponden al paso 4.504.500, no al estado final de entrenamiento (5M pasos), que no fue guardado.
- El modelo está limitado a observaciones RGB 64×64 y a las tareas específicas de DeepMind Control Suite incluidas en el repositorio.
- No es un modelo de lenguaje ni un sistema de visión general, por lo que no debe emplearse para tareas de texto, tool calling o razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero el entorno de ejecución depende de MuJoCo y dm_control, cuyas licencias pueden imponer condiciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/mohendy/planet-dmc-rgb-seed0
- Paper original: Hafner et al., 2019, "Learning Latent Dynamics for Planning from Pixels" (ICML). No se han encontrado enlaces adicionales relevantes en la búsqueda web.
