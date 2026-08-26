# gouthamgajjala/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este modelo es un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno **doom_health_gathering_supreme** de ViZDoom. Fue desarrollado por gouthamgajjala como parte de un curso de deep reinforcement learning y publicado en Hugging Face usando la librería Sample-Factory 2.0. El objetivo del agente es maximizar la recogida de paquetes de salud en un escenario de Doom, un benchmark clásico para evaluar aprendizaje por refuerzo basado en visión (píxeles de pantalla).

La relevancia de este modelo radica en que demuestra un flujo completo de entrenamiento y publicación de agentes RL con Sample-Factory, una librería orientada a entrenamiento distribuido y eficiente de agentes con políticas asíncronas. El repositorio ocupa 0,3 GB e incluye los pesos del agente, listos para descargar y ejecutar en el entorno correspondiente. No se trata de un modelo de lenguaje: es un agente de control de juego, por lo que muchas especificaciones típicas de modelos generativos (contexto, cuantización, idiomas) no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization), red neuronal convolucional para procesamiento de píxeles (no se especifica la topología exacta) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (agente de juego, no modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | formato Sample-Factory (checkpoints de entrenamiento, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo utiliza **APPO**, una variante asíncrona de Proximal Policy Optimization implementada en Sample-Factory 2.0. APPO mantiene múltiples workers que recogen experiencia en paralelo mientras el learner actualiza la política, lo que acelera la convergencia frente a PPO clásico. La política y el valor se implementan típicamente como redes convolucionales seguidas de capas totalmente conectadas, dado que la entrada son píxeles de pantalla del juego. No se han publicado detalles sobre el número de capas, parámetros ni el dataset exacto de entrenamiento.

El entrenamiento se realizó sobre el escenario `doom_health_gathering_supreme`, que consiste en un agente que debe recoger paquetes de salud evitando daños. La model card indica que el experimento puede reanudarse con `--restart_behavior=resume` y que el entrenamiento se configuró para hasta 10 000 000 000 pasos de entorno, aunque el número real de pasos ejecutados no se especifica. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que no son relevantes para este tipo de agente.

## Capacidades

- **Control de juego basado en visión**: el agente procesa píxeles de pantalla y emite acciones para moverse y recoger paquetes de salud en el escenario `doom_health_gathering_supreme`.
- **Aprendizaje por refuerzo**: política entrenada mediante APPO, con capacidad de generalizar el comportamiento de recogida de objetos dentro del entorno.
- **Ejecución y reentrenamiento**: los pesos se pueden cargar con Sample-Factory para ejecutar el agente (`enjoy`) o continuar entrenando (`train` con `resume`).
- **Reproducibilidad**: el checkpoint incluye el estado del entrenamiento, lo que permite reanudar la optimización desde el punto exacto donde terminó.
- **Integración con ViZDoom**: compatible con el framework ViZDoom, que permite ejecutar escenarios de Doom a alta velocidad en hardware moderno.

## Casos de uso

- **Educación en RL**: sirve como ejemplo práctico de entrenamiento de un agente con APPO y Sample-Factory. Un estudiante puede descargar el modelo, ejecutarlo con el script `enjoy` y observar el comportamiento aprendido, comparando con otras políticas.
- **Evaluación de algoritmos RL**: al ser un checkpoint público de un entorno estándar, permite comparar la recompensa media (13,88) contra otras implementaciones del mismo escenario, útil para validar algoritmos propios.
- **Investigación en aprendizaje por refuerzo**: el entorno ViZDoom es un benchmark clásico para estudiar aprendizaje de políticas basadas en visión; este modelo sirve como punto de partida para fine-tuning o para probar variaciones del algoritmo.
- **Pruebas de Sample-Factory**: los desarrolladores de la librería pueden usar este checkpoint para verificar la compatibilidad de versiones o reproducir el flujo de descarga desde Hugging Face.
- **Generación de demostraciones**: se puede ejecutar el agente para generar trayectorias de ejemplo (estado, acción, recompensa) que sirvan como dataset para imitación o aprendizaje offline.
- **Comparación de hiperparámetros**: el checkpoint permite reanudar el entrenamiento con distintos hiperparámetros y observar cómo afectan la convergencia y la recompensa final.

## Benchmarks y rendimiento

El autor declara un único resultado en la model card, obtenido en el entorno `doom_health_gathering_supreme`:

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 13,88 ± 3,16 |

No se han publicado resultados comparativos con otros algoritmos (PPO, DQN, etc.) ni con otros agentes en el mismo entorno. La recompensa media de 13,88 con desviación de 3,16 sugiere que el agente recoge consistentemente una cantidad moderada de paquetes de salud, pero la variabilidad indica que el comportamiento no es totalmente estable. No hay datos de throughput ni latencia de inferencia en la información disponible.

## Requisitos de hardware

- **VRAM**: el repositorio ocupa 0,3 GB, lo que sugiere que los pesos caben en cualquier GPU moderna con al menos 1-2 GB de VRAM, e incluso en CPU para inferencia a baja velocidad.
- **GPU recomendada**: cualquier GPU consumer (GTX 1060 o superior) es suficiente para ejecutar el agente. Para entrenamiento desde cero, se recomienda al menos una RTX 3060 o equivalente, aunque el entrenamiento de RL en ViZDoom puede hacerse también en CPU a velocidades reducidas.
- **Compatibilidad con hardware consumer**: sí, el modelo y el entorno ViZDoom están diseñados para ejecutarse en hardware de consumo; el juego original de los años 90 se ejecuta a alta velocidad en hardware moderno.
- **Opciones de despliegue**: el modelo se ejecuta mediante Sample-Factory (`python -m sample_factory.huggingface.load_from_hub` y luego el script `enjoy` correspondiente). No es compatible con vLLM, Ollama ni llama.cpp, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible. La velocidad de inferencia depende del hardware, pero al ser un agente que procesa píxeles de resolución baja (típicamente 160x120 o similar), la inferencia puede alcanzar cientos de pasos por segundo en una GPU moderna.

## Comparativa con modelos similares

No hay modelos comparables publicados con resultados verificados en el mismo entorno `doom_health_gathering_supreme` en la información disponible. Existen otros repositorios con el mismo nombre (como `Ryukijano/rl_course_vizdoom_health_gathering_supreme` o `Vishath/rl_course_vizdoom_health_gathering_supreme`), probablemente resultados de la misma tarea del curso, pero no se proporcionan sus métricas ni arquitectura en la búsqueda realizada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Entorno limitado**: el agente está entrenado exclusivamente para el escenario `doom_health_gathering_supreme`; no generaliza a otros escenarios de ViZDoom ni a tareas fuera de la recogida de paquetes de salud.
- **Sesgo de comportamiento**: la recompensa de 13,88 con desviación de 3,16 indica que el comportamiento no es estable; el agente puede fallar en episodios concretos, lo que hay que tener en cuenta al evaluar su rendimiento.
- **Alucinación y errores**: como agente RL, puede tomar acciones subóptimas o quedarse atascado en bucles de comportamiento; no hay mecanismo de corrección fuera del entrenamiento.
- **Licencia**: no se especifica licencia en la model card. Hay que asumir que el uso comercial puede estar restringido hasta obtener aclaración del autor.
- **Falta de documentación técnica**: no se publican detalles sobre la arquitectura de red, número de pasos de entrenamiento, hiperparámetros ni composición del dataset. Esto dificulta la reproducción exacta y la evaluación rigurosa.
- **Formato propietario**: los pesos están en formato Sample-Factory, no en formatos estándar como safetensors. Para usarlos fuera de Sample-Factory hay que convertirlos, lo que puede requerir trabajo adicional.
- **Mantenimiento**: el modelo fue creado en 2026 y no hay evidencia de actualizaciones posteriores ni soporte activo del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gouthamgajjala/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (repositorio): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face (Sample-Factory): https://www.samplefactory.dev/10-huggingface/huggingface/
- Notebook del curso de RL (unidad 8, ViZDoom): https://colab.research.google.com/github/huggingface/deep-rl-class/blob/master/notebooks/unit8/unit8_part2.ipynb
- Repositorio GitHub con instrucciones de entrenamiento (variante del mismo modelo): https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
