# brunopaschoal/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene una política de aprendizaje por refuerzo profundo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario brunopaschoal como material de un curso de reinforcement learning, y se distribuye mediante la librería Sample-Factory 2.0, el framework de RL asíncrono distribuido de Alex Petrenko. No es un modelo de lenguaje: es un agente entrenado para jugar un escenario concreto de Doom en primera persona.

El problema que resuelve es acotado: aprender una política que recoja botiquines de salud en un mapa de Doom mientras sobrevive el máximo tiempo posible. El escenario `health_gathering_supreme` es un benchmark clásico de ViZDoom, con recompensa dispersa y un horizonte de episodio que exige exploración y gestión de recursos. La política resultante alcanza una recompensa media de 10,18 +/- 3,92 según los datos declarados por el autor en el model-index.

Su relevancia es fundamentalmente pedagógica y de reproducibilidad: sirve como ejemplo canónico de cómo empaquetar y publicar un checkpoint de Sample-Factory en Hugging Face, con instrucciones de descarga, evaluación y reanudación del entrenamiento. No hay información sobre arquitectura de red, número de parámetros ni configuración de entrenamiento en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL; red neuronal no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; observaciones por frame del entorno ViZDoom) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; agente visual sobre píxeles de Doom) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Sample-Factory (no disponible el formato exacto de serialización) |

## Arquitectura y entrenamiento

El agente se entrena con APPO, una variante asíncrona de PPO implementada en Sample-Factory que desacopla los workers de recolección de experiencia de los workers de cálculo de gradientes mediante un buffer compartido. Esta variante permite escalar horizontalmente el muestreo sin bloquear la actualización de la política. La model card no detalla la topología de la red (número de capas, canales, tamaño de la capa recurrente ni si usa LSTM), por lo que no es posible describir la arquitectura con precisión.

El entorno es `doom_health_gathering_supreme` de ViZDoom, un escenario con observaciones visuales en primera persona y recompensa basada en la recogida de botiquines y la supervivencia. No se documentan en la información disponible el número de pasos de entorno, la composición del dataset (generado por interacción, no supervisado), el uso de recompensas moldeadas ni si hubo ajuste fino posterior. El checkpoint se publica como artefacto de curso, con instrucciones para reanudar el entrenamiento mediante `--restart_behavior=resume`.

## Capacidades

- Control de agente en un entorno visual 3D de ViZDoom (`doom_health_gathering_supreme`), con observaciones basadas en píxeles.
- Política entrenada para recoger botiquines de salud y maximizar la supervivencia en el mapa.
- Evaluación reproducible mediante el script `enjoy` de Sample-Factory.
- Reanudación del entrenamiento desde el checkpoint con el script `train` y `--restart_behavior=resume`.
- Carga programática desde el Hub con `sample_factory.huggingface.load_from_hub`.
- No soporta tool calling, function calling, agentes multi-paso genéricos, ni capacidades multilingües: es un agente específico de tarea.

## Casos de uso

- Docencia de reinforcement learning: sirve como ejemplo completo y reproducible de un pipeline de entrenamiento APPO, desde la definición del entorno hasta la publicación del checkpoint en el Hub, útil en cursos y talleres.
- Reproducción de experimentos: permite verificar resultados de un curso comparando la recompensa media declarada (10,18 +/- 3,92) con la obtenida al ejecutar el script `enjoy`.
- Punto de partida para ajuste fino: el checkpoint puede reanudarse con `--restart_behavior=resume` para continuar el entrenamiento con hiperparámetros distintos o más pasos de entorno.
- Estudio de recompensa dispersa: el escenario `health_gathering_supreme` es un banco de pruebas para analizar cómo APPO gestiona señales de recompensa escasas y horizontes largos.
- Evaluación de infraestructura de RL distribuido: sirve para probar despliegues de Sample-Factory en clústeres, midiendo el rendimiento del muestreo asíncrono frente al cálculo de gradientes.
- Integración en pipelines de investigación: al cargarse programáticamente desde el Hub, puede incorporarse en scripts de evaluación automatizada o en comparaciones entre algoritmos y entornos ViZDoom.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 10,18 +/- 3,92 |

No se han publicado resultados de benchmarks adicionales ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende de la topología de la red, que no se documenta. El tamaño del repositorio es de 0,1 GB, lo que sugiere un checkpoint pequeño y compatible con GPU de consumo.
- GPU recomendadas: no disponibles de forma específica. Por el tamaño del artefacto, es plausible ejecutarlo en GPU consumer (RTX 3060 o superior), pero no hay confirmación en la documentación.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio, aunque no se confirma.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`); no se documentan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de ViZDoom ni comparaciones con políticas alternativas (por ejemplo, PPO síncrono o IMPALA) sobre el mismo entorno.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar el uso comercial ni la redistribución del checkpoint.
- El model-index marca el resultado como no verificado (`verified: false`); la recompensa de 10,18 +/- 3,92 procede del propio autor y no ha sido validada de forma independiente.
- El agente está especializado en un único entorno; no generaliza a otras tareas, mapas ni videojuegos.
- No hay información sobre la arquitectura de red, los hiperparámetros de entrenamiento ni el número de pasos de entorno, lo que dificulta la reproducibilidad exacta.
- No se documentan sesgos, riesgos de alucinación ni comportamiento fuera de distribución; como política de RL, su comportamiento fuera del entorno de entrenamiento es impredecible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-01) es posterior a la fecha actual de referencia habitual; conviene verificar la integridad del artefacto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunopaschoal/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Documentación de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
