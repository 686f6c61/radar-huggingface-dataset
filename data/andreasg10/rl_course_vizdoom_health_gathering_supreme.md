# AndreasG10/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, un escenario de referencia en el que el agente debe recoger frascos de salud mientras esquiva ataques enemigos. Lo publica el usuario AndreasG10 como material de un curso de reinforcement learning, y ha sido entrenado con Sample-Factory 2.0, la librería de referencia para entrenamiento asíncrono distribuido de agentes RL.

No se trata de un modelo de lenguaje ni de un modelo generativo: es una política neuronal (policy) que mapea observaciones visuales del juego a acciones discretas. Por tanto, su relevancia es didáctica y de investigación en RL, no de despliegue en aplicaciones de NLP. El repositorio pesa 0,2 GB e incluye los pesos del agente y los registros de TensorBoard del entrenamiento.

La información pública es escasa: no se declaran licencia, idiomas ni detalles del dataset de entrenamiento más allá del nombre del entorno. Los únicos datos cuantitativos disponibles son el resultado declarado en la model card (recompensa media de 11,75 ± 5,86) y las instrucciones de uso con Sample-Factory.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional + capas densas (política y función de valor) entrenada con APPO; detalles exactos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observa frames del entorno ViZDoom) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pesos de Sample-Factory (checkpoint del framework); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El agente se entrena con APPO, una variante asíncrona de PPO implementada en Sample-Factory que desacopla la recolección de experiencia (workers) del cálculo de gradientes (learner), lo que permite escalar el entrenamiento en clústeres con múltiples GPUs y CPUs. La política consume observaciones del entorno ViZDoom `doom_health_gathering_supreme`, un escenario con recompensa escasa y horizonte largo en el que el agente debe aprender a navegar, recoger frascos de salud y sobrevivir.

No se dispone de información sobre el número de pasos de entorno, la composición del dataset, el uso de recompensas shaping, ni hiperparámetros concretos (tasa de aprendizaje, tamaño de batch, número de workers). La model card solo indica que el modelo se entrenó con Sample-Factory 2.0 y proporciona los comandos para descargarlo, ejecutarlo y reanudar el entrenamiento.

## Capacidades

- Control de agente en el entorno ViZDoom `doom_health_gathering_supreme` a partir de observaciones visuales.
- Política entrenada para maximizar recompensa acumulada en un escenario de recogida de salud con enemigos.
- Ejecución mediante el script `enjoy_vizdoom` de Sample-Factory.
- Reanudación del entrenamiento desde el checkpoint con `train_vizdoom` y `--restart_behavior=resume`.
- No soporta tool calling, function calling, agentes multi-paso en el sentido de LLM, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del entorno para el que fue entrenado.

## Casos de uso

- Docencia en cursos de reinforcement learning: sirve como ejemplo reproducible de un agente APPO entrenado sobre ViZDoom, con comandos listos para descargar y ejecutar.
- Reproducción de experimentos: permite reanudar el entrenamiento y comparar curvas de aprendizaje frente a otras ejecuciones del mismo entorno.
- Estudio de recompensa escasa: el escenario `health_gathering_supreme` es un banco de pruebas clásico para analizar exploración y estabilidad de PPO/APPO.
- Investigación en RL visual: la política procesa frames del juego, útil para estudiar representaciones convolucionales en entornos 3D.
- Comparación de algoritmos: puede usarse como baseline APPO frente a otros algoritmos (PPO, IMPALA) en el mismo entorno.
- Demostraciones en vivo: el script `enjoy_vizdoom` permite visualizar el comportamiento del agente en tiempo real para presentaciones o clases.
- Integración en pipelines de Sample-Factory: sirve como plantilla para publicar y cargar modelos desde Hugging Face Hub con `load_from_hub`.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 11,75 ± 5,86 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,2 GB, por lo que el checkpoint cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; para inferencia basta una GPU modesta, y para reentrenamiento se recomienda una GPU con suficiente memoria para el learner de Sample-Factory (por ejemplo, RTX 3090/4090 o A100, sin dato oficial).
- Cabe en GPU consumer: sí, por el tamaño del checkpoint (0,2 GB).
- Opciones de despliegue: Sample-Factory (`enjoy_vizdoom`), con soporte de carga desde Hugging Face Hub mediante `load_from_hub`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AndreasG10/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | 11,75 ± 5,86 | no disponible | Hugging Face |
| Otros checkpoints APPO de Sample-Factory en ViZDoom | APPO | ViZDoom (distintos escenarios) | no disponible | no disponible | Hugging Face |
| Baselines PPO/IMPALA en ViZDoom | PPO / IMPALA | ViZDoom | no disponible | no disponible | Repositorios de investigación |

No se dispone de datos comparativos verificables en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico para un único entorno (`doom_health_gathering_supreme`); no generaliza a otras tareas ni a lenguaje natural.
- La recompensa declarada (11,75 ± 5,86) no está verificada por el hub y presenta alta varianza, lo que sugiere un rendimiento inestable entre episodios.
- No se declara licencia, por lo que el uso comercial queda sin marco legal claro y requiere contactar con el autor.
- No se documentan sesgos, pero al ser un agente RL en un videojuego no aplican las consideraciones habituales de sesgo de LLM; sí puede heredar sesgos del diseño del entorno.
- Riesgo de sobreajuste al escenario concreto y a la configuración de entrenamiento; los resultados pueden no reproducirse sin los hiperparámetros originales, que no se publican.
- No apto para producción en aplicaciones de NLP, visión general o agentes conversacionales.
- Dependencia de la versión de Sample-Factory 2.0 y del entorno ViZDoom para poder ejecutarlo.

## Enlaces

- Hugging Face: https://huggingface.co/AndreasG10/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Documentación de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
- ViZDoom (entorno): no disponible en la información proporcionada
- Paper de APPO: no disponible en la información proporcionada
