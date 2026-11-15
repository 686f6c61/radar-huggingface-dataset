# razdiamond/rl_course_vizdoom_health_gathering_supreme

## Resumen

`razdiamond/rl_course_vizdoom_health_gathering_supreme` es un checkpoint de agente de aprendizaje por refuerzo profundo (deep RL), no un modelo de lenguaje. Se trata de una política entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, un escenario de referencia habitual en investigación de RL donde el agente debe recoger paquetes de salud mientras esquiva ataques enemigos.

El modelo lo publica el usuario `razdiamond` como material didáctico de un curso de RL, y se distribuye en el formato nativo de Sample-Factory 2.0, la librería de entrenamiento de RL asíncrona desarrollada por Alex Petrenko. El repositorio ocupa 0,1 GB y contiene pesos, configuración y logs de TensorBoard, pero no incluye una model card descriptiva más allá de las instrucciones de descarga, ejecución y reanudación del entrenamiento.

Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de entrenamiento APPO sobre ViZDoom y como punto de partida para quienes siguen el curso o quieren reanudar el entrenamiento. No es un modelo de propósito general ni compite con los agentes de referencia publicados por la comunidad de Sample-Factory, que alcanzan recompensas medias sustancialmente mayores en este mismo entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de deep RL entrenada con APPO (Asynchronous Proximal Policy Optimization) sobre observaciones del entorno ViZDoom; la arquitectura de red concreta no se detalla en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | Formato nativo de Sample-Factory 2.0 (checkpoint con pesos y configuración del experimento); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El agente se entrena con APPO, la variante asíncrona de PPO implementada en Sample-Factory. APPO distribuye la recolección de experiencia entre múltiples workers y aplica actualizaciones de política con clipping, lo que permite escalar el entrenamiento en CPU y GPU de forma eficiente. El entorno es `doom_health_gathering_supreme`, un escenario de ViZDoom con recompensa escasa y horizonte relativamente largo, pensado para evaluar la capacidad del agente de aprender una política de recogida de salud bajo presión enemiga.

No se dispone de información sobre el número de pasos de entorno, la composición de los datos de entrenamiento, la arquitectura exacta de la red (capas convolucionales, tamaño del LSTM, etc.) ni sobre el uso de técnicas adicionales como reward shaping, curriculum learning o ajuste de hiperparámetros. La model card únicamente documenta los comandos de descarga, evaluación y reanudación del entrenamiento, sin detallar la configuración del experimento.

## Capacidades

- Control de agente en el entorno ViZDoom `doom_health_gathering_supreme`: selección de acciones a partir de observaciones visuales del juego.
- Aprendizaje de política de recogida de salud con recompensa escasa, evaluable mediante recompensa media episódica.
- Reanudación del entrenamiento desde el checkpoint publicado, con el flag `--restart_behavior=resume`.
- Evaluación reproducible mediante el script `enjoy` de Sample-Factory.
- Exportación y carga vía Hugging Face Hub con la utilidad `sample_factory.huggingface.load_from_hub`.
- No soporta tool calling, function calling, agentes multi-paso en el sentido de LLM, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos de curso: el checkpoint permite a los alumnos cargar el agente y ejecutar el script `enjoy` para inspeccionar visualmente la política aprendida sin reentrenar desde cero.
- Punto de partida para reanudar entrenamiento: con `--restart_behavior=resume` y un `--train_for_env_steps` suficientemente alto, se puede continuar el entrenamiento y comparar curvas frente al checkpoint original.
- Comparación de algoritmos: sirve como baseline APPO frente a otras variantes (PPO, IMPALA) en el mismo entorno, siempre que se documenten las diferencias de configuración.
- Docencia de pipelines de RL: ilustra el flujo completo de Sample-Factory, desde el entrenamiento hasta la publicación en el Hub y la carga con `load_from_hub`.
- Pruebas de infraestructura: al ocupar 0,1 GB, es útil para validar entornos de ejecución de Sample-Factory, dependencias de ViZDoom y flujos de CI sin consumir recursos significativos.
- Estudio de estabilidad de APPO: la desviación típica reportada (13,63 ± 5,93) permite analizar la varianza de la política entre episodios y discutir la estabilidad del entrenamiento en entornos con recompensa escasa.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 13,63 +/- 5,93 |

No se han publicado en la información disponible resultados comparativos con otros checkpoints, curvas de aprendizaje ni métricas adicionales (longitud de episodio, tasa de éxito, etc.).

## Requisitos de hardware

- Almacenamiento: 0,1 GB para el checkpoint, más el espacio de ViZDoom y dependencias de Sample-Factory.
- VRAM estimada para inferencia: no disponible; el tamaño del repositorio sugiere un modelo pequeño que probablemente quepa en GPUs consumer, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Sample-Factory puede ejecutar APPO en CPU y GPU; para evaluación de un único agente, una GPU consumer modesta sería suficiente en la mayoría de configuraciones, aunque no se especifica.
- Despliegue: exclusivamente mediante Sample-Factory 2.0 (`enjoy` y `train`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| razdiamond/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | no disponible | Hugging Face Hub |
| Checkpoints de referencia de Sample-Factory para ViZDoom | APPO | doom_health_gathering_supreme | según repositorio de Sample-Factory | GitHub / Hub de Sample-Factory |
| Otros agentes de curso publicados por el mismo autor | no disponible | ViZDoom | no disponible | Hugging Face Hub |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo es específico del entorno `doom_health_gathering_supreme`; no es transferible a otros escenarios sin reentrenamiento.
- La recompensa media reportada (13,63 ± 5,93) es modesta y presenta alta varianza, lo que sugiere una política inestable o parcialmente entrenada.
- Los resultados de la model-index están marcados como `verified: false`; no han sido validados de forma independiente.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- No se documentan sesgos, pero al ser un agente de RL en un videojuego, su comportamiento está limitado al espacio de acciones y observaciones del entorno.
- La model card no describe la arquitectura de red ni los hiperparámetros, lo que dificulta la reproducibilidad exacta del entrenamiento.
- El checkpoint está pensado para ejecutarse con Sample-Factory 2.0; versiones distintas pueden requerir ajustes.
- No debe interpretarse como un modelo de lenguaje ni utilizarse para tareas de generación de texto, código o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/razdiamond/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
