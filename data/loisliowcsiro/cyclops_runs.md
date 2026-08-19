# loisliowcsiro/cyclops_runs

## Resumen

El repositorio `loisliowcsiro/cyclops_runs` no contiene un modelo de lenguaje ni un sistema de IA generativa, sino un conjunto de artefactos de entrenamiento para un agente de aprendizaje por refuerzo (RL) dedicado a la manipulación diestra de objetos. Concretamente, aloja los registros de TensorBoard y los checkpoints de una serie de experimentos de ablación sobre los pesos de la función de recompensa en una tarea de reorientación de un objeto con una mano robótica simulada en MuJoCo. El trabajo está firmado por Lois Liow, vinculado a CSIRO, y se distribuye bajo licencia Apache 2.0.

El proyecto, denominado "Cyclops Reorient", explora cómo distintas combinaciones de términos de recompensa (orientación, deslizamiento, penalizaciones por escape de la jaula, etc.) afectan al aprendizaje de una política de control. Los experimentos se ejecutaron con el algoritmo PPO (implementación de `rsl_rl`) y se documentan en la model card con tablas detalladas de cada corrida, incluyendo identificadores de trabajos SLURM y estados de finalización. El repositorio tiene un tamaño de 1,9 GB y no incluye el código fuente del entorno ni del entrenamiento, solo los resultados.

La relevancia de este recurso radica en que proporciona datos empíricos sobre el diseño de recompensas en robótica, un área crítica para el desarrollo de agentes físicos. Para investigadores y desarrolladores que trabajan con RL aplicado a manipulación, estos logs y checkpoints pueden servir como referencia para comparar configuraciones de recompensa o como punto de partida para continuar entrenamientos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente de RL, red neuronal no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints de PyTorch (ficheros `model_*.pt`) |

## Arquitectura y entrenamiento

El repositorio contiene los resultados de entrenamiento de un agente de RL para la tarea de reorientar un objeto con una mano robótica simulada en MuJoCo. Aunque no se especifica la arquitectura de la red del agente, el uso de `rsl_rl/ppo.py` sugiere una implementación estándar de PPO con redes fully connected o similares, habituales en este tipo de tareas. El entorno se configura mediante ficheros en `config/cyclops_finger/`, lo que indica que se trata de una mano con dedos articulados.

El entrenamiento se organizó en tres estudios principales: un estudio original con ajustes de coeficientes de entropía y desviación estándar, un segundo estudio que modificaba los cuerpos de contacto y añadía una recompensa por contacto de la yema del dedo, y un tercer estudio con un currículo de éxito que escalaba las recompensas de orientación y escape de la jaula. En total se documentan 18 corridas, cada una con una combinación distinta de pesos para los términos de recompensa (orientation_alignment, hand_pose, action_rate, torque, tip_slide, cage_escape, finger_collision, hold_escalation, palm_detach, contact_count). Algunas corridas se marcaron como completadas, otras como timeout o fallidas, y dos quedaron en estado "RUNNING" en el momento de la publicación.

No se proporcionan detalles sobre el número de pasos de entrenamiento, el tamaño del lote ni la composición del dataset (al ser un entorno simulado, no hay dataset externo). Tampoco se indica si se aplicaron técnicas como RLHF o DPO, que no son relevantes en este contexto.

## Capacidades

- Reorientación de objetos: el agente aprende a girar un objeto hasta una orientación objetivo (umbral de éxito de 0,2 rad, aproximadamente 11,5 grados).
- Mantenimiento de la orientación: la recompensa `hold_escalation` premia mantener la orientación durante un número de pasos (5 pasos de mantenimiento).
- Control fino de la mano: los términos de recompensa como `hand_pose`, `tip_slide` y `finger_collision` indican que el agente debe coordinar los dedos para manipular el objeto sin deslizamientos ni colisiones no deseadas.
- Evitar penalizaciones: el agente aprende a no escapar de la jaula (`cage_escape`) y a no despegar la palma (`palm_detach`), lo que implica un comportamiento estable y contenido.
- Adaptación a diferentes configuraciones de recompensa: los checkpoints de distintas corridas permiten comparar cómo varía el comportamiento según los pesos.

## Casos de uso

- Investigación en diseño de recompensas: los logs y checkpoints permiten analizar cómo cada término de recompensa influye en el aprendizaje, útil para quienes estudian la formulación de funciones de recompensa en RL.
- Reproducción de experimentos: los identificadores de trabajos SLURM y las configuraciones documentadas facilitan la reproducción de las corridas en un clúster de cómputo.
- Transferencia de políticas: los checkpoints `model_*.pt` pueden cargarse en un entorno MuJoCo compatible para continuar el entrenamiento o evaluar la política en otras tareas de manipulación.
- Benchmarking de algoritmos de RL: al tratarse de una tarea de control continuo con recompensas densas, sirve como banco de pruebas para comparar variantes de PPO u otros algoritmos.
- Desarrollo de currículos de aprendizaje: el tercer estudio con `success_curriculum` ofrece un caso práctico de cómo escalar recompensas gradualmente para estabilizar el entrenamiento.
- Formación en robótica simulada: los datos pueden usarse en cursos o talleres para ilustrar el efecto de las penalizaciones y los pesos en el comportamiento de un agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, recompensa media ni comparaciones con otros métodos. Solo se indica el estado de cada corrida (completada, timeout, fallida) y algunos comentarios como "learning plateaued" en la corrida 13.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Al tratarse de logs y checkpoints, no se requiere hardware para su uso directo, pero sí para reproducir los entrenamientos (se usaron trabajos SLURM, lo que sugiere un clúster con GPUs).
- Para cargar los checkpoints y evaluar la política en MuJoCo, se necesitaría una GPU con al menos 4-8 GB de VRAM, dependiendo del tamaño de la red (no especificado).
- Opciones de despliegue: no aplica, ya que no es un modelo de inferencia estándar; se usaría con el entorno MuJoCo y el código de `rsl_rl`.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje ni un sistema de IA comparable con otros modelos de la misma categoría. Se trata de artefactos de entrenamiento de un agente de RL específico, sin métricas estandarizadas que permitan una comparación directa.

## Limitaciones y advertencias

- El repositorio no incluye el código fuente del entorno ni del entrenamiento, solo los resultados. Para reproducir o utilizar los checkpoints se necesita acceso al código original de Cyclops Reorient, que no se proporciona.
- Algunas corridas quedaron incompletas (timeout o fallidas), por lo que los checkpoints correspondientes pueden no representar políticas completamente entrenadas.
- No se documentan los hiperparámetros completos del entrenamiento (tasa de aprendizaje, tamaño de lote, número de pasos), lo que dificulta la reproducibilidad exacta.
- Los resultados dependen de la versión específica de MuJoCo y de la configuración de la mano robótica; pueden no ser transferibles a otros entornos sin adaptación.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento y los checkpoints pueden estar sujetos a condiciones adicionales no especificadas en la model card.
- No hay información sobre sesgos o riesgos de alucinación, ya que no es un modelo generativo.

## Enlaces

- Repositorio en Hugging Face: [loisliowcsiro/cyclops_runs](https://huggingface.co/loisliowcsiro/cyclops_runs)
- Perfil del autor: [loisliowcsiro](https://huggingface.co/loisliowcsiro)
- Repositorio relacionado con checkpoints: [loisliowcsiro/cyclops_checkpoints](https://huggingface.co/loisliowcsiro/cyclops_checkpoints)
