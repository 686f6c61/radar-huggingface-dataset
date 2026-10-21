# jos0054/a2c-PandaReachDense-v3

## Resumen

`jos0054/a2c-PandaReachDense-v3` es un agente de aprendizaje por refuerzo entrenado con el algoritmo A2C (*Advantage Actor-Critic*) sobre el entorno `PandaReachDense-v3` de la libreria panda-gym, que plantea una tarea de alcance (*reach*) con un brazo robotico Franka Panda simulado. No es un modelo de lenguaje ni un modelo fundacional: es una politica compacta empaquetada en el formato de Stable-Baselines3, publicada por el usuario `jos0054` en el contexto del curso de deep reinforcement learning de Hugging Face.

El interes del artefacto es fundamentalmente practico y educativo: sirve como referencia reproducible de un entrenamiento A2C con cuatro entornos en paralelo y normalizacion de observaciones y recompensas mediante `VecNormalize`. La model card documenta una evaluacion independiente de 100 episodios con recompensa media de -0,21 +/- 0,10 y un *score* de -0,30, lo que situa al agente lejos de una politica resuelta y lo convierte en una linea base para comparar, no en una solucion lista para produccion.

El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, no declara licencia ni idiomas, y el tamano reportado es 0,0 GB (redondeo de Hugging Face sobre un artefacto que consiste en un `.zip` de pesos y un `.pkl` de normalizacion). Su relevancia es, por tanto, la de un punto de partida documentado para experimentos de RL en robotica simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | A2C (*Advantage Actor-Critic*), actor y critico con redes neuronales; numero de capas y unidades no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es una observacion por paso del entorno) |
| Tipos de cuantizacion | no disponible (no se documenta cuantizacion; el artefacto distribuido es de punto flotante sin especificar) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | `.zip` de Stable-Baselines3 (`a2c-PandaReachDense-v3.zip`) + estadisticas de normalizacion `vec_normalize.pkl` |
| Entorno de entrenamiento | `PandaReachDense-v3` (panda-gym) |
| Algoritmo / version | A2C, libreria `stable-baselines3` |
| Entornos en paralelo durante entrenamiento | 4 |
| Normalizacion | observaciones y recompensas (`VecNormalize`) |
| Tamano del repositorio | 0,0 GB segun Hugging Face (redondeo) |

## Arquitectura y entrenamiento

La politica es un agente A2C, un metodo *on-policy* de gradiente de politica que combina una funcion de ventaja con un critico de valor y se entrena sobre rollouts relativamente cortos. En Stable-Baselines3 esto se materializa habitualmente como dos perceptrones multicapa (actor y critico) que consumen el vector de observacion del entorno; la model card no detalla el numero de capas, unidades ni funciones de activacion, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizo *from scratch* (sin inicializacion desde otro checkpoint) con cuatro entornos ejecutandose en paralelo y normalizacion de observaciones y recompensas. Esta decision es relevante en inferencia: el artefacto incluye `vec_normalize.pkl`, y la propia model card advierte de que hay que cargarlo con `VecNormalize.load`, fijar `training=False` y `norm_reward=False`, y despues cargar el `.zip` con `A2C.load`. Omitir este paso altera la escala de las observaciones y degrada el comportamiento de la politica. No se documentan el numero de pasos de entrenamiento, la semilla, la composicion del *replay* ni si hubo ajuste posterior, y tampoco se describe ninguna innovacion tecnica adicional.

## Capacidades

- Control continuo de un brazo robotico simulado para tareas de alcance de un objetivo cartesiano.
- Politica determinista/estocastica segun el muestreo del actor, invocable paso a paso mediante `model.predict(obs)`.
- Integracion directa con el ecosistema Stable-Baselines3 (`A2C.load`, `VecNormalize.load`, `evaluate_policy`).
- Reproduccion de un *pipeline* de evaluacion con normalizacion de observaciones y recompensas.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso simbolico.
- No tiene capacidades multilingues, de vision, audio ni generacion de texto.
- No dispone de modo *thinking* ni de mecanismos de decodificacion especulativa.

## Casos de uso

- **Linea base para experimentos de RL en robotica simulada**: cargar el agente y el `vec_normalize.pkl` y ejecutar 100 episodios para obtener una referencia de recompensa media (-0,21 +/- 0,10) contra la que medir PPO, SAC o TD3 en el mismo entorno.
- **Reproduccion de practicas del curso de deep RL**: validar que el *pipeline* de entrenamiento (cuatro entornos en paralelo, `VecNormalize`, guardado de `.zip` y `.pkl`) funciona de extremo a extremo antes de escalar a entornos mas costosos.
- **Prueba de infraestructura de evaluacion**: ejercitar *scripts* de evaluacion, registro de metricas y *checkpoints* con un modelo diminuto que se ejecuta en CPU, sin consumir GPU.
- **Componente de *curriculum learning***: usar la politica de alcance como sub-habilidad inicial antes de tareas mas complejas de panda-gym (empuje o *pick-and-place*), reinicializando la politica con este checkpoint.
- **Docencia y comparacion de algoritmos**: ilustrar las diferencias practicas entre metodos *on-policy* y *off-policy* en un entorno de recompensa densa, con una metrica de referencia ya publicada.
- **Investigacion de brecha sim-a-real (preliminar)**: servir como punto de partida para estudiar la transferencia de politicas de alcance entrenadas en PyBullet, teniendo en cuenta el bajo rendimiento del checkpoint actual.
- **Pruebas de regresion de versiones**: detectar cambios de comportamiento al actualizar versiones de `stable-baselines3`, `panda-gym` o `pybullet`, comparando la recompensa media obtenida.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (metrica no verificada por un tercero, `verified: false`):

| Tarea | Entorno / dataset | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | PandaReachDense-v3 | mean_reward | -0,21 +/- 0,10 |

La model card anade una evaluacion independiente de 100 episodios con recompensa media de -0,21 +/- 0,10 y un *score* de -0,30. El documento no especifica como se calcula ese *score* (no se aclara si es tasa de exito, recompensa acumulada normalizada u otra metrica), por lo que no debe interpretarse sin consultar el codigo de evaluacion del autor. No se han publicado en la informacion disponible resultados de otros benchmarks ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el artefacto es un `.zip` de pesos de una politica actor-critica de tipo MLP y no requiere acelerador.
- GPU recomendadas: no necesita GPU. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) funciona, pero no aporta ventaja apreciable frente a CPU para un modelo de este tamano.
- Cabe en GPU de consumo: si, en cualquiera; tambien en CPU *single-thread* para inferencia paso a paso.
- Cuello de botella real: la simulacion fisica en PyBullet y el bucle de evaluacion, no la red neuronal.
- Opciones de despliegue: `stable-baselines3` con `gymnasium`/`gym` y `panda-gym` (mas `pybullet`). vLLM, TGI, llama.cpp y Ollama no aplican a este artefacto.
- Latencia y *throughput*: no disponibles en la informacion proporcionada; dependen del motor de simulacion, de la frecuencia de control del entorno y del hardware.

## Comparativa con modelos similares

No se dispone de resultados numericos publicados de otros agentes sobre `PandaReachDense-v3` en la informacion proporcionada. La comparacion solo puede plantearse de forma cualitativa frente a otras elecciones de algoritmo para el mismo entorno:

| Alternativa | Tipo de algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A2C (este modelo) | *On-policy*, actor-critico | no disponible | no aplica | no disponible | publico en Hugging Face, 0 descargas |
| PPO sobre PandaReachDense-v3 | *On-policy*, recorte de politica | no disponible | no aplica | no disponible (depende del autor) | no se ha localizado un checkpoint concreto en la informacion disponible |
| SAC sobre PandaReachDense-v3 | *Off-policy*, maximo de entropia | no disponible | no aplica | no disponible (depende del autor) | no se ha localizado un checkpoint concreto en la informacion disponible |
| TD3 sobre PandaReachDense-v3 | *Off-policy*, actor-critico determinista | no disponible | no aplica | no disponible (depende del autor) | no se ha localizado un checkpoint concreto en la informacion disponible |

## Limitaciones y advertencias

- Rendimiento bajo: recompensa media negativa (-0,21 +/- 0,10) en 100 episodios, con alta varianza relativa; no es una politica que resuelva la tarea de forma fiable.
- Dependencia critica de `vec_normalize.pkl`: cargar solo el `.zip` sin las estadisticas de normalizacion, o dejar `training=True`, produce observaciones en escala incorrecta y degrada la politica.
- Ambiguedad metrica: el *score* de -0,30 se declara sin definir la metrica, lo que impide comparaciones rigurosas con otros agentes.
- Ausencia de licencia: sin terminos declarados no hay autorizacion explicita de uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Sobreajuste al entorno: politica especifica de `PandaReachDense-v3`; no se transfiere a otras tareas ni variantes con recompensa dispersa sin reentrenamiento.
- Brecha sim-a-real: entrenado en PyBullet sin documentacion de aleatorizacion de dominio, por lo que la transferencia a un brazo fisico no esta justificada.
- Falta de trazabilidad: no se documentan pasos de entrenamiento, semillas, hardware ni numero de ejecuciones, lo que dificulta la reproducibilidad exacta.
- Metrica no verificada: el resultado del `model-index` figura con `verified: false`; procede de la evaluacion del propio autor.
- Sin soporte de lenguaje ni de tareas multimodales: no debe utilizarse como sustituto de un modelo de lenguaje en ningun *pipeline*.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jos0054/a2c-PandaReachDense-v3
- Repositorio de panda-gym (entorno `PandaReachDense-v3`): https://github.com/qgallouedec/panda-gym
- Stable-Baselines3 (libreria del artefacto): https://github.com/DLR-RM/stable-baselines3
- Curso de deep reinforcement learning de Hugging Face (etiqueta `deep-rl-course`): https://github.com/huggingface/deep-rl-class
- Documentacion de `VecNormalize`: https://stable-baselines3.readthedocs.io/en/master/guide/vec_envs.html#vecnormalize
- Documentacion de A2C en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/a2c.html
