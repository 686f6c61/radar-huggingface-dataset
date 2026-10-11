# habeebllah77/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene una política de aprendizaje por refuerzo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, publicada por el usuario habeebllah77 dentro del ecosistema Sample-Factory 2.0. No es un modelo de lenguaje ni un modelo generativo multimodal: es un agente entrenado para jugar un escenario de disparos en primera persona cuyo objetivo es recolectar botiquines y sobrevivir el máximo tiempo posible.

El artefacto se distribuye como checkpoint de Sample-Factory (repositorio de 0,1 GB) y se carga con la herramienta `load_from_hub` de la propia librería. La model card no documenta arquitectura de red, número de parámetros, licencia ni idiomas, y el autor declara una recompensa media de 12,84 ± 5,59 en el entorno de entrenamiento, métrica marcada como no verificada.

Su relevancia es acotada y fundamentalmente docente o de investigación: constituye una referencia reproducible de APPO sobre ViZDoom, un punto de partida para continuar el entrenamiento mediante `--restart_behavior=resume` y un baseline para prácticas de un curso de deep reinforcement learning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Agente de aprendizaje por refuerzo entrenado con APPO (Sample-Factory 2.0); la model card no detalla la topología de la red |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No aplica: el agente consume observaciones del entorno paso a paso, no secuencias de texto |
| Tipos de cuantización | No disponible. No aplica a un checkpoint de RL de este tipo |
| Idiomas soportados | No disponible. No es un modelo de lenguaje |
| Licencia | No disponible |
| Formato de pesos | Checkpoint de Sample-Factory (formato PyTorch); no detallado explícitamente en la model card |

## Arquitectura y entrenamiento

El modelo se entrenó con APPO, el algoritmo asíncrono de optimización de política proximal implementado en Sample-Factory 2.0, que combina muestreo paralelo de múltiples workers de entorno con actualizaciones de gradiente desacopladas. El entorno objetivo es `doom_health_gathering_supreme` de ViZDoom, una variante de dificultad elevada del escenario de recogida de botiquines. La model card no especifica la arquitectura de la red (número de capas, canales, uso de memoria recurrente ni resolución de observación), el número de pasos de entorno consumidos durante el entrenamiento, ni la composición del dataset de experiencias.

Tampoco se documenta ningún ajuste fino posterior con RLHF, DPO u otras técnicas de alineación, algo que no aplica a este tipo de agente. La única innovación destacable que puede inferirse del material proporcionado es la integración nativa con Hugging Face Hub de Sample-Factory, que permite descargar, ejecutar y reanudar el entrenamiento con los scripts `enjoy` y `train` del propio framework.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme`: navegación y recogida de objetos en un escenario de disparos en primera persona.
- Ejecución de políticas entrenadas mediante el script `enjoy` de Sample-Factory, con `--algo=APPO --env=doom_health_gathering_supreme`.
- Reanudación del entrenamiento desde el checkpoint publicado con `--restart_behavior=resume`.
- Subida de nuevos checkpoints al Hub mediante el flag `--push_to_hub`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni uso como agente de propósito general.
- No dispone de capacidades multilingües, de visión general ni de audio: su entrada es la observación del simulador ViZDoom.
- No dispone de modo "thinking" ni de cualquier otra capacidad propia de modelos de lenguaje.

## Casos de uso

- Docencia en cursos de aprendizaje por refuerzo: el repositorio lleva "rl_course" en el nombre y permite a los alumnos descargar una política ya entrenada, ejecutarla con `enjoy` y comparar el comportamiento observado con el de sus propios entrenamientos.
- Baseline reproducible para comparar algoritmos: sirve como referencia de APPO frente a PPO, IMPALA u otros algoritmos en el mismo entorno, siempre que se reentrene o evalúe con idéntica configuración.
- Punto de partida para entrenamiento continuado: con `--restart_behavior=resume` y un `--train_for_env_steps` elevado se puede seguir optimizando la política en lugar de partir de pesos aleatorios.
- Depuración de pipelines de Sample-Factory: útil para verificar que la instalación de la librería, ViZDoom y el flujo de carga desde el Hub funcionan correctamente antes de lanzar entrenamientos largos.
- Generación de demostraciones y vídeos de comportamiento aprendido: la política puede ejecutarse en modo visualización para grabar episodios y analizar cualitativamente las estrategias de recogida de botiquines.
- Experimentos de robustez y aleatoriedad: dado que la recompensa media declarada presenta una desviación típica de 5,59 sobre una media de 12,84, resulta adecuado para estudiar la varianza de la política entre episodios y semillas.
- Pruebas de integración de infraestructura de RL: permite medir el rendimiento de máquinas o clústeres (pasos por segundo del entorno, velocidad del bucle de inferencia) usando una política ya entrenada en lugar de cargar la GPU con entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (marcados como no verificados):

| Algoritmo | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12,84 ± 5,59 | No |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), que además no son aplicables a un agente de refuerzo entrenado sobre un simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. Sample-Factory puede ejecutar políticas tanto en CPU como en GPU, pero el repositorio no publica requisitos concretos ni modelos de tarjeta probados.
- Compatibilidad con GPU de consumo: no disponible. Al tratarse de un agente de RL sobre un simulador, la restricción principal suele ser la velocidad de simulación de ViZDoom más que la memoria de la GPU, pero no hay datos que lo confirmen para este checkpoint.
- Opciones de despliegue: scripts `enjoy` y `train` de Sample-Factory 2.0, tras descargar el modelo con `python -m sample_factory.huggingface.load_from_hub -r habeebllah77/rl_course_vizdoom_health_gathering_supreme`. Herramientas como vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La comparación solo sería significativa frente a otros checkpoints entrenados con la misma configuración (algoritmo APPO, mismo entorno `doom_health_gathering_supreme`, mismo número de pasos y misma semilla), y el repositorio no incluye referencias a ellos.

| Modelo | Entorno | Algoritmo | Recompensa media declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| habeebllah77/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO | 12,84 ± 5,59 (no verificada) | No disponible | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La métrica declarada (12,84 ± 5,59) tiene una desviación típica de aproximadamente el 44 % de la media, lo que indica una varianza muy alta del retorno entre episodios; no debe interpretarse como un rendimiento estable.
- La métrica está marcada como `verified: false`, es decir, no ha sido validada de forma independiente.
- La licencia no está especificada, por lo que el uso comercial queda en un limbo legal: no puede asumirse permiso de uso sin aclaración del autor.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación ni revisión por parte de la comunidad.
- No es un modelo de lenguaje: no genera texto, no responde a prompts y no puede emplearse en tareas de NLP, código, matemáticas o visión general.
- El agente está especializado exclusivamente en un entorno concreto; no generaliza a otros escenarios de ViZDoom ni a otras tareas sin reentrenamiento.
- No hay información sobre sesgos, pero al entrenarse en un simulador de disparos en primera persona hereda las dinámicas y convenciones de dicho escenario.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es que la política ejecute secuencias de acciones erráticas en estados poco representados durante el entrenamiento, dado el elevado retorno negativo registrado indirectamente por la varianza de la recompensa.
- Dependencia fuerte del framework y la versión del entorno: requiere Sample-Factory 2.0 y una instalación de ViZDoom compatible; cambios de versión pueden invalidar el checkpoint.
- La model card no documenta el número de pasos de entrenamiento, la configuración de hiperparámetros ni la arquitectura de red, lo que dificulta la reproducibilidad.
- La tarea está acotada al inglés en lo que respecta a documentación; el modelo en sí no procesa idioma alguno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/habeebllah77/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory 2.0: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/

Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los resultados obtenidos correspondían a contenido no relacionado y se han descartado.
