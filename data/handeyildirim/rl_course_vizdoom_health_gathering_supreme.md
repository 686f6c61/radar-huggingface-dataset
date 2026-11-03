# handeyildirim/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una política de aprendizaje por refuerzo profundo (deep reinforcement learning) entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario handeyildirim en HuggingFace como artefacto de un curso de RL, usando la librería Sample-Factory 2.0. El objetivo del agente es navegar un escenario de Doom recogiendo botiquines para maximizar la recompensa acumulada durante el episodio.

El interés es formativo y reproducible: sirve como ejemplo canónico de cómo empaquetar, versionar y reanudar un experimento de RL con Sample-Factory, no como componente para aplicaciones de NLP. El repositorio ocupa 0,1 GB y contiene los checkpoints y logs de TensorBoard del entrenamiento, con un resultado declarado de recompensa media de 12,90 ± 5,75 en el entorno citado.

No hay información sobre arquitectura de red, hiperparámetros, número de pasos de entrenamiento ni composición del buffer de experiencias en la información proporcionada. La licencia y los idiomas soportados no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con APPO; la model card no detalla la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entorno ViZDoom; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints de Sample-Factory; el repo pesa 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es una política entrenada con APPO, la implementación de PPO asíncrono de Sample-Factory 2.0. APPO combina un learner central con múltiples workers de inferencia que generan rollouts en paralelo, lo que permite escalar el entrenamiento en entornos como ViZDoom. La red concreta (CNN para procesar píxeles del juego, tamaño de capas, número de parámetros) no se especifica en la model card.

El entorno `doom_health_gathering_supreme` es una variante de ViZDoom en la que el agente debe recoger objetos de salud bajo condiciones de dificultad elevada. No se documentan en la información disponible el número total de pasos de entorno, la composición del dataset de rollouts, ni si se aplicaron técnicas adicionales como reward shaping, curriculum o ajuste de hiperparámetros. La recompensa media declarada es de 12,90 ± 5,75, marcada como no verificada.

## Capacidades

- Control de agente en un entorno visual 3D de ViZDoom (Doom) a partir de observaciones de píxeles.
- Política entrenada específicamente para la tarea de recogida de salud (`health gathering`), sin capacidades de generalización declaradas a otros escenarios.
- Reanudación del entrenamiento desde el checkpoint publicado mediante el flag `--restart_behavior=resume`.
- Exportación y carga desde HuggingFace Hub mediante `sample_factory.huggingface.load_from_hub`.
- Registro de métricas de entrenamiento en TensorBoard (tag `tensorboard` en el repo).
- No dispone de generación de texto, código, matemáticas, visión general, tool calling ni razonamiento multi-paso fuera del entorno de RL.

## Casos de uso

- Reproducción de un experimento docente de RL: descargar el checkpoint y ejecutar el script `enjoy` para ver la política jugando en ViZDoom, útil en cursos de aprendizaje por refuerzo.
- Punto de partida para fine-tuning: reanudar el entrenamiento con `--restart_behavior=resume` y aumentar `--train_for_env_steps` para explorar mejoras sobre la recompensa base de 12,90.
- Comparación de algoritmos: usar este APPO como baseline frente a otras políticas entrenadas en el mismo entorno (por ejemplo, PPO síncrono o IMPALA) para medir diferencias de recompensa y estabilidad.
- Integración en pipelines de Sample-Factory: servir como ejemplo de estructura de repositorio en el Hub (checkpoints, logs de TensorBoard, model-index) para automatizar la publicación de experimentos.
- Estudio de robustez en entornos visuales: analizar la varianza de recompensa (± 5,75) para evaluar la estabilidad de la política bajo distintas semillas de evaluación.
- Material de aula para prácticas de ViZDoom: los estudiantes pueden inspeccionar los logs de TensorBoard y relacionar curvas de entrenamiento con la recompensa final declarada.

## Benchmarks y rendimiento

| Algoritmo | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12,90 ± 5,75 | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio pesa 0,1 GB y el entorno ViZDoom es ligero, por lo que la inferencia debería caber en GPUs de consumo, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles. Para entrenamiento con Sample-Factory se suele usar una GPU dedicada (por ejemplo, RTX 3090/4090 o A100) más CPU para los workers, pero el autor no lo especifica.
- ¿Cabe en GPU de consumo? Probablemente sí por el tamaño del checkpoint, pero no está confirmado.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), con soporte de carga desde HuggingFace Hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| handeyildirim/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | 12,90 ± 5,75 | no disponible | HuggingFace |
| Otras políticas ViZDoom en Sample-Factory | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es una política específica para un único entorno; no generaliza a otras tareas ni a texto.
- La recompensa declarada (12,90 ± 5,75) está marcada como no verificada y no se acompaña de desviación por semilla ni número de episodios de evaluación.
- No se documentan hiperparámetros, arquitectura de red ni número de pasos, lo que dificulta la reproducibilidad exacta.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; en RL, la política puede fallar de forma impredecible ante variaciones del entorno no vistas en entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-02; no hay evidencia de validación por terceros.
- No apto para producción en tareas de NLP, visión general o agentes conversacionales.

## Enlaces

- HuggingFace: https://huggingface.co/handeyildirim/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de HuggingFace en Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/
