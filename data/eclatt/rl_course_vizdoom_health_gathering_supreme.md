# eclatt/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene una politica de aprendizaje por refuerzo profundo (deep reinforcement learning) entrenada con el algoritmo APPO sobre el escenario `doom_health_gathering_supreme` del entorno ViZDoom. Lo publica el usuario `eclatt` en Hugging Face, con el identificador `eclatt/rl_course_vizdoom_health_gathering_supreme`, y esta pensado como material practico de un curso de reinforcement learning, tal y como sugiere el propio nombre del experimento. No se trata de un modelo de lenguaje: es un agente que produce acciones discretas a partir de observaciones del entorno de juego.

El modelo se ha entrenado con Sample-Factory 2.0, la libreria de referencia de Alex Petrenko para RL asincrono a gran escala, y se distribuye con el formato de checkpoints y la estructura de experimento de esa libreria (repositorio de 0,1 GB). La model card documenta los tres flujos tipicos: descarga desde el Hub con `load_from_hub`, ejecucion de la politica entrenada con el script `enjoy` y reanudacion del entrenamiento con el script `train` y `--restart_behavior=resume`.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un experimento de RL en un entorno visual clasico, con una recompensa media declarada de 10,18 +/- 5,25 en `doom_health_gathering_supreme`. Al ser un artefacto de investigacion/docencia, los datos de licencia, idiomas y arquitectura concreta de la red no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization), aprendizaje por refuerzo on-policy actor-critico; topologia de red no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL; el horizonte de decision lo define el entorno ViZDoom) |
| Tipos de cuantizacion | no disponible (no es un modelo de pesos tipo LLM; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de Sample-Factory 2.0 (formato exacto no detallado en la model card; repositorio de 0,1 GB) |

Otros datos de interes: pipeline declarado `reinforcement-learning`, libreria `sample-factory`, etiquetas `deep-reinforcement-learning`, `reinforcement-learning`, `tensorboard`, `model-index` y `region:us`. Registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 2026-09-10.

## Arquitectura y entrenamiento

La model card indica exclusivamente que se trata de un modelo **APPO** entrenado en el entorno **doom_health_gathering_supreme** con Sample-Factory 2.0. APPO es la implementacion de Sample-Factory de un optimizador de politica proximal asincrono: multiples workers de entorno generan experiencia en paralelo y un learner actualiza la politica y la funcion de valor de forma asincrona. La libreria aplica truncamiento tipo PPO sobre la razon de probabilidades y permite desacoplar el numero de actores del de learners. La informacion disponible no detalla la topologia exacta de la red (capas convolucionales, tamaños de capa oculta, funcion de activacion), ni el presupuesto de entrenamiento en pasos de entorno, ni los hiperparametros concretos utilizados.

Tampoco se documentan en la informacion proporcionada la composicion del dataset (al tratarse de RL, la experiencia se genera por interaccion con el simulador ViZDoom), el uso de RLHF/DPO (no aplicable aqui) ni innovaciones tecnicas adicionales. Lo unico verificable es el flujo de trabajo publicado: descarga desde el Hub, ejecucion con `enjoy` y reanudacion con `train` usando `--restart_behavior=resume` y un `--train_for_env_steps` suficientemente alto, ya que el experimento se reanuda en el numero de pasos en el que concluyo.

## Capacidades

- Control de politica en el escenario `doom_health_gathering_supreme` de ViZDoom: el agente selecciona acciones discretas a partir de las observaciones del entorno para maximizar la recogida de botiquines.
- Ejecucion de inferencia cerrada con el script `enjoy` de Sample-Factory, sin necesidad de codigo adicional mas alla del modulo de entorno correspondiente.
- Reanudacion de entrenamiento: admite continuar el entrenamiento desde el checkpoint publicado (`--restart_behavior=resume`).
- Publicacion en el Hub: el mismo flujo admite `--push_to_hub` para subir nuevos checkpoints.
- Integracion con TensorBoard: el repositorio incluye la etiqueta `tensorboard`, coherente con el registro de metricas de entrenamiento de Sample-Factory.
- No soporta generacion de texto, razonamiento simbolico, codigo, matematicas, vision-lenguaje, tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM. No tiene capacidades multilingues y no dispone de modo "thinking" ni de procesamiento de audio.

## Casos de uso

- Material docente en cursos de RL: el propio nombre del experimento (`rl_course`) apunta a su uso como ejemplo practico para que el alumnado descargue un checkpoint ya entrenado, lo ejecute con `enjoy` y compare el comportamiento con su propia implementacion.
- Baseline reproducible para comparar algoritmos: sirve como punto de referencia de APPO sobre `doom_health_gathering_supreme`, de modo que otras variantes (por ejemplo, cambios en el optimizador o en el preprocesado de observaciones) se midan contra la recompensa media declarada de 10,18.
- Continuacion de entrenamiento con mas presupuesto: partiendo del checkpoint publicado y con `--restart_behavior=resume`, se puede extender el entrenamiento para estudiar la curva de aprendizaje mas alla del punto de corte actual.
- Estudio de la varianza del algoritmo: la desviacion de +/- 5,25 sobre una media de 10,18 invita a usarlo en experimentos de reproducibilidad, midiendo dispersion entre semillas y episodios de evaluacion.
- Banco de pruebas de infraestructura RL: util para validar la instalacion de Sample-Factory, la configuracion de ViZDoom y el rendimiento de la maquina (actores por CPU/GPU) antes de lanzar experimentos mas costosos.
- Generacion de trayectorias para aprendizaje por imitacion o aprendizaje offline: las politicas entrenadas pueden recolectar episodios etiquetados con acciones que despues se usan para entrenar agentes con metodos supervisados u offline RL.
- Pruebas de regresion en pipelines de investigacion: integrar la evaluacion periodica de este checkpoint como test automatico que detecte cambios incompatibles en la libreria, el entorno o el preprocesado.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Algoritmo | Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| APPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 10,18 +/- 5,25 | false |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los benchmarks de lenguaje no son aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio completo ocupa 0,1 GB, lo que sugiere checkpoints de tamaño reducido, pero no hay cifras oficiales de memoria.
- GPU recomendadas: no disponibles. Sample-Factory soporta ejecucion en CPU y en GPU, pero la model card no especifica requisitos minimos ni modelos de tarjeta probados.
- Encaje en GPU de consumo: no confirmado por el autor. Dado el tamaño del repositorio (0,1 GB) es razonable esperar que la inferencia quepa en GPU de consumo e incluso en CPU, pero se trata de una inferencia, no de un dato declarado.
- Opciones de despliegue: las indicadas por la model card son las propias de Sample-Factory, es decir, descarga con `python -m sample_factory.huggingface.load_from_hub -r eclatt/rl_course_vizdoom_health_gathering_supreme`, ejecucion con el script `enjoy` y reentrenamiento con el script `train`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Dependencias relevantes: ViZDoom y el modulo de entorno `doom_health_gathering_supreme` de Sample-Factory, necesarios para reconstruir el entorno de evaluacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada (ni parametros, ni contextos, ni licencias de alternativas). El Hub de Sample-Factory aloja otros checkpoints APPO de distintos entornos, pero no se han facilitado sus cifras, por lo que no se puede establecer una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eclatt/rl_course_vizdoom_health_gathering_supreme | no disponible | no aplica | mean_reward 10,18 +/- 5,25 (no verificado) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especificidad total del entorno: la politica solo tiene sentido en `doom_health_gathering_supreme`; no generaliza a otras tareas ni a otros escenarios de ViZDoom sin reentrenamiento.
- Varianza elevada: la recompensa declarada es 10,18 +/- 5,25, es decir, la desviacion tipica supera la mitad de la media. El rendimiento por episodio puede ser muy heterogeneo y depende de la semilla.
- Metrica no verificada: el propio model-index marca `verified: false`. Los resultados proceden del autor y no han sido replicados de forma independiente.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion. En produccion esto es un riesgo legal directo.
- Ausencia de documentacion tecnica: no se detallan hiperparametros, numero de pasos de entrenamiento, topologia de red ni semillas, lo que dificulta la reproducibilidad exacta.
- Riesgo de sobreajuste al simulador: como cualquier politica de RL entrenada en un simulador, puede explotar particularidades del motor de ViZDoom y degradarse ante cambios de version del entorno o del preprocesado de observaciones.
- Dependencia de version: al estar entrenado con Sample-Factory 2.0, la carga del checkpoint puede requerir una version compatible de la libreria.
- Sin capacidades de lenguaje: no admite prompts, instrucciones en lenguaje natural, tool calling ni generacion de texto; cualquier expectativa de ese tipo es un error de uso.
- Idiomas: no aplica; no procesa texto.
- Sin sesgos documentados: no hay informacion sobre sesgos, pero tampoco sobre evaluaciones de robustez o seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/eclatt/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia especifica de Hugging Face en Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/

Nota: los resultados de la busqueda web realizada (`eclat-bfc.fr` y dominios asociados) corresponden al Entorno de Trabajo Educativo de la region de Bourgogne-Franche-Comte y no guardan relacion con este modelo. No se han encontrado papers, blogs, repositorios adicionales ni demos especificos del modelo en la informacion disponible.
