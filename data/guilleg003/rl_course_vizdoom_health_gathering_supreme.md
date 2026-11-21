# guilleg003/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `guilleg003/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) mediante la librería Sample Factory 2.1.1 sobre el entorno ViZDoom 1.2.4, concretamente en el escenario `doom_health_gathering_supreme`. Lo desarrolla el usuario guilleg003 en el marco de la Unidad 8, Parte II, del curso de Deep RL de Hugging Face, por lo que se trata de un artefacto educativo más que de un modelo de propósito general.

El problema que resuelve es un entorno de control visual en primera persona: el agente debe navegar por un mapa de Doom recogiendo botiquines para mantener la salud mientras evita morir, aprendiendo directamente de píxeles. No es un modelo de lenguaje ni un transformer generativo, sino una política neuronal entrenada por refuerzo, empaquetada con la librería `sample-factory` y publicada como checkpoint reproducible.

Su relevancia es limitada fuera del ámbito docente: sirve como ejemplo reproducible de un pipeline completo de entrenamiento y evaluación en RL (entrenamiento distribuido con APPO, evaluación estocástica con semilla fija y métrica de curso). El checkpoint alcanzó 4.005.888 frames de entorno, partiendo de un reentrenamiento iniciado en 1.593.344 frames sobre una GPU Tesla T4 con semilla 42.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de RL entrenada con APPO (Asynchronous Proximal Policy Optimization) sobre observaciones visuales de ViZDoom; arquitectura interna de la red no detallada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entorno de RL con observaciones por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la información; el autor indica que se distribuye como archivo comprimido (archive) que debe extraerse en un directorio `health-gathering` dentro de `runs` |
| Algoritmo | APPO |
| Librería | Sample Factory 2.1.1 |
| Entorno | ViZDoom 1.2.4, escenario `doom_health_gathering_supreme` |
| Frames de entrenamiento | 4.005.888 (reanudado desde 1.593.344) |
| Semilla de entrenamiento | 42 |
| Hardware de entrenamiento | Tesla T4 |
| Dependencias de evaluación | Python 3.10, PyTorch 2.2.2, Sample Factory 2.1.1, ViZDoom 1.2.4 |

## Arquitectura y entrenamiento

El agente se entrena con APPO, una variante asíncrona de PPO implementada en Sample Factory que desacopla la recolección de experiencia (workers de entorno) del cálculo de gradientes (learner), permitiendo entrenamiento distribuido de alta eficiencia en un solo nodo o en varios. La política consume observaciones visuales del entorno ViZDoom y produce acciones discretas dentro del escenario `doom_health_gathering_supreme`, en el que el objetivo es recoger objetos de salud para sobrevivir el máximo tiempo posible.

El entrenamiento se realizó con semilla 42 y se reanudó en una Tesla T4 desde 1.593.344 frames hasta alcanzar 4.005.888 frames de entorno. No se detalla en la información disponible la composición del dataset (es un entorno, no un corpus), el número de workers, la configuración de hiperparámetros ni si se aplicaron técnicas adicionales como reward shaping o currículos. La evaluación se realizó con 10 episodios estocásticos y semilla 2031, usando `--eval_deterministic=False`, lo que introduce aleatoriedad en la política durante la medición.

## Capacidades

- Control visual en primera persona dentro del entorno ViZDoom `doom_health_gathering_supreme`.
- Aprendizaje de política de recogida de salud (health gathering) a partir de píxeles.
- Ejecución de política estocástica (evaluación no determinista) reproducible con semilla.
- Integración con el ecosistema Sample Factory para reentrenamiento, evaluación y despliegue de workers.
- Reproducibilidad de evaluación mediante script `eval_objective.py` incluido.
- No soporta generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, agentes multi-paso ni capacidades multilingües: es un agente de RL específico de tarea.

## Casos de uso

- Docencia y reproducción de pipelines de RL: el checkpoint permite repetir la evaluación del curso con semilla 2031 y comparar la métrica de curso (media menos desviación típica) con otros agentes del mismo entorno.
- Benchmark de algoritmos APPO: sirve como referencia base para comparar variantes de hiperparámetros, seeds o arquitecturas de red en `doom_health_gathering_supreme`.
- Estudio de estabilidad de políticas: al incluir valores por episodio y el log crudo, permite analizar la varianza de recompensa entre episodios (desviación típica de 2,713 sobre media 8,748).
- Reentrenamiento desde checkpoint: se puede reanudar el entrenamiento desde los 4.005.888 frames para experimentar con curriculum learning o reward shaping.
- Validación de infraestructura de RL distribuido: útil para verificar que un entorno con Sample Factory 2.1.1, PyTorch 2.2.2 y ViZDoom 1.2.4 funciona correctamente en CPU o GPU.
- Investigación en entornos visuales de FPS: base para estudiar transferencia a otros escenarios de ViZDoom (defend the line, deadly corridor) mediante fine-tuning.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Algoritmo | Tarea | Dataset/Entorno | Métrica | Valor |
|---|---|---|---|---|
| APPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 8,75 +/- 2,71 |
| APPO | reinforcement-learning | doom_health_gathering_supreme | Course score (media - desviación típica) | 6,035 |

La evaluación se realizó sobre 10 episodios estocásticos con semilla 2031. El autor reporta media 8,748 y desviación típica poblacional 2,713. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor ejecuta la evaluación en CPU (`--device=cpu`) con `--num_workers=1`.
- GPU recomendadas: el entrenamiento se realizó en una Tesla T4; para reentrenamiento se recomienda al menos una GPU con soporte CUDA compatible con PyTorch 2.2.2.
- Cabe en GPU de consumo: no se especifica; al ser un agente de RL visual de tamaño no detallado, es plausible que quepa en GPUs de consumo, pero no hay dato confirmado.
- Opciones de despliegue: Sample Factory 2.1.1 con ViZDoom 1.2.4; evaluación vía `eval_objective.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Contexto/observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guilleg003/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | Visual (frames ViZDoom) | no disponible | Hugging Face |
| Otros agentes del curso Deep RL (Unidad 8) | APPO / PPO | ViZDoom | Visual | variable | Hugging Face |
| Agentes RL de referencia en ViZDoom (literatura) | PPO, A2C, DQN | ViZDoom | Visual | variable | Papers/repos |

No se dispone de datos comparativos verificables de parámetros, contexto o rendimiento frente a alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea y entorno; no generaliza a otros escenarios sin reentrenamiento.
- No es un modelo de lenguaje: no soporta texto, código, matemáticas ni visión general.
- Métricas no verificadas (`verified: false` en el model-index); los resultados son declarados por el autor.
- Evaluación con solo 10 episodios y política estocástica, lo que implica alta varianza en la estimación.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles (no aplica).
- Riesgo de sobreajuste al escenario y a la semilla de entrenamiento (42); la reproducibilidad depende de versiones exactas de Sample Factory, PyTorch y ViZDoom.
- El repositorio tiene 0,0 GB y 0 descargas, lo que sugiere que el artefacto puede no estar completo o que los pesos no están efectivamente publicados; conviene verificar antes de usarlo en producción.
- No apto para producción en sistemas reales sin validación adicional; su propósito es educativo.

## Enlaces

- Hugging Face: https://huggingface.co/guilleg003/rl_course_vizdoom_health_gathering_supreme
- Curso Deep RL de Hugging Face (Unidad 8): no disponible en la información proporcionada
- Repositorio Sample Factory: no disponible en la información proporcionada
- ViZDoom: no disponible en la información proporcionada
- Paper de APPO: no disponible en la información proporcionada
