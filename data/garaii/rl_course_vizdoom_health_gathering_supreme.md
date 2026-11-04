# Garaii/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una politica de aprendizaje por refuerzo profundo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario Garaii en Hugging Face como parte de un curso de reinforcement learning, empleando la libreria Sample-Factory 2.0, un framework de RL distribuido desarrollado por Alex Petrenko. El objetivo del agente es controlar un personaje en un escenario 3D de Doom para recoger botiquines y maximizar la recompensa acumulada.

El modelo resuelve una tarea concreta de control visual: a partir de fotogramas de pantalla (observaciones tipo imagen), el agente debe navegar por el mapa y recolectar items de salud antes de que se agote el tiempo o la vida. Es relevante como ejemplo didactico y reproducible de entrenamiento de agentes con APPO en entornos ViZDoom, no como modelo generativo.

El repositorio ocupa 0,1 GB e incluye pesos y checkpoints compatibles con Sample-Factory, junto con logs de TensorBoard. No se dispone de informacion sobre licencia, idiomas ni arquitectura de red detallada en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de politica y valor para RL, entrenada con APPO sobre observaciones visuales de ViZDoom) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el entorno ViZDoom opera por episodios) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos y checkpoints de Sample-Factory; el repo incluye logs de TensorBoard) |

## Arquitectura y entrenamiento

La politica se entrena con APPO, una variante asincrona de PPO implementada en Sample-Factory 2.0. APPO combina workers de entorno asincronos con un learner central, lo que permite escalar el entrenamiento en CPU y GPU. El agente procesa observaciones visuales del entorno ViZDoom (`doom_health_gathering_supreme`), un escenario en el que el objetivo es recoger botiquines mientras se evita perder salud. No se detalla en la informacion proporcionada la arquitectura exacta de la red (capas convolucionales, tamanos, etc.), el numero de pasos de entrenamiento ni la composicion del dataset, ya que en RL no hay un dataset estatico sino una distribucion de experiencias generada por la interaccion con el entorno.

El entrenamiento se realizo con Sample-Factory 2.0 y los pesos se publican en formato compatible con los scripts `train` y `enjoy` de la libreria. La model card indica que se puede reanudar el entrenamiento con `--restart_behavior=resume` y un numero alto de `--train_for_env_steps`. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, propias de modelos de lenguaje y no aplicables aqui.

## Capacidades

- Control de agente en el entorno ViZDoom `doom_health_gathering_supreme` a partir de observaciones visuales.
- Navegacion y recoleccion de items de salud (health gathering) en un escenario 3D.
- Entrenamiento y evaluacion reproducibles mediante Sample-Factory 2.0.
- Reanudacion del entrenamiento desde los checkpoints publicados.
- Registro de metricas en TensorBoard para monitorizacion del entrenamiento.
- No soporta tool calling, function calling, agentes multi-step en el sentido de LLM, vision general, audio ni capacidades multilingues.

## Casos de uso

- Docencia en reinforcement learning: el repositorio sirve como ejemplo practico para que estudiantes de un curso de RL carguen, evaluen y reanuden un agente APPO en ViZDoom usando Sample-Factory.
- Reproduccion de experimentos: investigadores pueden descargar los pesos con `load_from_hub` y ejecutar el script `enjoy` para verificar el rendimiento declarado (mean_reward 9,93 +/- 5,46) en el entorno `doom_health_gathering_supreme`.
- Punto de partida para fine-tuning: el comando `train` con `--restart_behavior=resume` permite continuar el entrenamiento y comparar curvas de aprendizaje frente a entrenamientos desde cero.
- Benchmarking de algoritmos de RL: el agente puede usarse como linea base APPO frente a otras variantes (PPO, IMPALA) en el mismo entorno de ViZDoom.
- Analisis de estabilidad de politicas visuales: la varianza alta de la recompensa (desviacion tipica de 5,46 sobre una media de 9,93) permite estudiar la robustez del agente ante distintas semillas y condiciones iniciales.
- Integracion en pipelines de investigacion con TensorBoard: los logs incluidos facilitan la visualizacion y comparacion de metricas de entrenamiento en proyectos de RL.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 9,93 +/- 5,46 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una politica de RL para ViZDoom, los requisitos son muy inferiores a los de un LLM y dependen del tamano de la red, no especificado.
- GPU recomendadas: no disponible en la informacion proporcionada; Sample-Factory puede ejecutarse en GPU consumer y en CPU para inferencia.
- Compatibilidad con GPU consumer: probable, dado el reducido tamano del repositorio (0,1 GB) y la naturaleza del entorno, aunque no se confirma en la documentacion.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), con soporte de carga desde Hugging Face mediante `sample_factory.huggingface.load_from_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Garaii/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | no disponible | no aplica | no disponible | Hugging Face |
| Otras politicas APPO de Sample-Factory en ViZDoom | APPO | distintos escenarios ViZDoom | no disponible | no aplica | no disponible | Hugging Face / Sample-Factory |
| Politicas PPO/IMPALA en ViZDoom | PPO / IMPALA | ViZDoom | no disponible | no aplica | no disponible | Repositorios de investigacion |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni responde a prompts; solo actua en el entorno ViZDoom para el que fue entrenado.
- Varianza elevada en la recompensa (9,93 +/- 5,46), lo que indica comportamiento inestable entre episodios.
- Resultados no verificados (`verified: false` en la model card); deben tratarse como declaraciones del autor.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas no aplicables; el modelo no procesa lenguaje natural.
- Entrenado exclusivamente para `doom_health_gathering_supreme`; no generaliza a otros entornos sin reentrenamiento.
- Riesgo de sobreajuste al escenario y a las condiciones de entrenamiento; el rendimiento puede degradarse con cambios en la configuracion del entorno.
- Sin informacion sobre sesgos, alucinacion (no aplica) ni restricciones adicionales de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Garaii/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
