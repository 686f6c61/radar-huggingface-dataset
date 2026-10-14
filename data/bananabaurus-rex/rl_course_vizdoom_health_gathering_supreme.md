# Bananabaurus-Rex/rl_course_vizdoom_health_gathering_supreme

## Resumen

Bananabaurus-Rex/rl_course_vizdoom_health_gathering_supreme no es un modelo de lenguaje, sino una **política de aprendizaje por refuerzo profundo (deep RL)** entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno **ViZDoom `health_gathering_supreme`**. El modelo ha sido desarrollado por el usuario Bananabaurus-Rex y se distribuye a traves de Hugging Face Hub en formato Sample-Factory, con un tamano de repositorio de 0,1 GB. Su proposito es servir como agente capaz de jugar de forma autonoma el escenario de recogida de botiquines de ViZDoom bajo configuracion "supreme", maximizando la recompensa acumulada.

El interes de esta publicacion es eminentemente docente y de investigacion: se enmarca en un curso de refuerzo (como sugiere el prefijo `rl_course_`) y demuestra el flujo completo de entrenamiento, evaluacion, publicacion y reanudacion de un experimento con Sample-Factory 2.0. No compite con modelos generativos, sino con otros agentes de RL que resuelven tareas de control visual a partir de pixeles.

Al tratarse de un artefacto de refuerzo y no de un modelo fundacional, carece de parametros de lenguaje, contexto, cuantizacion o soporte multilingue. Sus metricas relevantes son la recompensa media obtenida en el entorno y la estabilidad del entrenamiento, no el rendimiento en tareas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization) implementada en Sample-Factory 2.0 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de control visual, sin capacidad linguistica) |
| Licencia | no disponible |
| Formato de pesos | formato nativo de Sample-Factory (checkpoint del entrenamiento); no se especifica safetensors ni GGUF |
| Libreria | sample-factory |
| Entorno de entrenamiento | ViZDoom `doom_health_gathering_supreme` |
| Tamano del repositorio | 0,1 GB |
| Framework de RL | Sample-Factory 2.0 (https://github.com/alex-petrenko/sample-factory) |
| Tipo de tarea | reinforcement-learning |
| Etiquetas | deep-reinforcement-learning, reinforcement-learning, sample-factory, tensorboard |

## Arquitectura y entrenamiento

El modelo sigue el paradigma **actor-critic** de APPO, una variante asincrona de PPO disenada para entrenamiento distribuido de alta eficiencia y con soporte para entornos parcialmente observables. Sample-Factory 2.0 es el framework empleado, y habitualmente asocia una red convolucional para procesar las observaciones visuales (pantalla del juego) junto con una capa recurrente que mantiene estado entre pasos. No obstante, la model card no detalla la composicion exacta de la red ni el numero de parametros.

El entrenamiento se realizo sobre el entorno ViZDoom `health_gathering_supreme`, un escenario de primera persona en el que el agente debe recoger botiquines mientras gestiona su salud. La model card no aporta informacion sobre el numero de pasos de entorno totales, la composicion del buffer, si se aplicaron tecnicas adicionales de RLHF/DPO (no aplicables en RL clasico) ni sobre hiperparametros concretos. Se documentan, eso si, los comandos oficiales para descargar, evaluar (`enjoy`) y reanudar el entrenamiento (`train`) con `--restart_behavior=resume`, lo que facilita la reproducibilidad y el ajuste fino posterior dentro de Sample-Factory.

## Capacidades

- Jugar de forma autonoma el escenario ViZDoom `health_gathering_supreme` a partir de observaciones visuales del entorno.
- Maximizar la recompensa acumulada del entorno, orientada a la recogida de botiquines y la supervivencia.
- Mantener politicas estables en regimen asincrono gracias a las garantias de PPO sobre la actualizacion de la politica.
- Reanudar el entrenamiento desde el checkpoint publicado mediante Sample-Factory, util para experimentacion continua.
- Servir como referencia reproducible para cursos de deep RL y practicas de laboratorio.
- Exportar el modelo al Hub de Hugging Face con el flag `--push_to_hub` de Sample-Factory.
- No dispone de tool calling, function calling, agentes multi-paso en lenguaje natural, capacidades multilingues, vision general, audio ni modos de razonamiento extendido, ya que no es un modelo de lenguaje.

## Casos de uso

- **Docencia en cursos de aprendizaje por refuerzo**: reproducible como material de practicas para que el alumnado descargue el checkpoint, lance `enjoy` y compruebe el comportamiento de una politica APPO entrenada, comparandola con la suya propia.
- **Punto de partida para ajuste fino en RL**: el comando con `--restart_behavior=resume` permite continuar el entrenamiento desde el estado publicado y medir como evoluciona la recompensa media con mas pasos de entorno.
- **Investigacion en algoritmos asincronos**: evaluar APPO de Sample-Factory frente a PPO sincrono o IMPALA sobre el mismo entorno de ViZDoom y con el mismo presupuesto de pasos.
- **Estudio de robustez y varianza**: la metrica declarada (15,77 +/- 5,14 de recompensa media) documenta una varianza considerable, lo que lo convierte en un caso util para analizar la estabilidad de la politica a lo largo de distintas semillas.
- **Benchmark de infraestructura de entrenamiento distribuido**: medir el throughput de Sample-Factory en clusters con distintas configuraciones de workers al reanudar el experimento.
- **Generacion de trayectorias sinteticas para otros fines**: las partidas del agente pueden usarse como datos de comportamiento para estudiar imitacion o para prototipar tecnicas de world modeling en videojuegos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| APPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 15,77 +/- 5,14 | false |

No se han publicado en la informacion disponible otros benchmarks (por ejemplo curvas de aprendizaje, recompensa maxima alcanzada, tiempo hasta convergencia o comparativas contra otras politicas).

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la documentacion; dado el tamano del repositorio (0,1 GB), es plausible que una politica pequena quepa con holgura en GPUs de consumo, pero no se aporta un valor oficial.
- **GPU recomendadas**: no disponibles. Por el tipo de framework (Sample-Factory) se puede ejecutar tanto en CPU como en GPU, pero el autor no especifica requisitos.
- **Ejecucion en GPU de consumo**: alta probabilidad de que funcione por el tamano reducido del checkpoint, pero sin confirmacion oficial.
- **Opciones de despliegue**: exclusivamente mediante Sample-Factory (`sample_factory.huggingface.load_from_hub`, scripts `enjoy` y `train`). No se ofrecen formatos ONNX, TorchScript o GGUF alternativos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre agentes APPO comparables publicados en el momento de redactar esta ficha. Como referencias genericas de la misma categoria (agentes de RL entrenados con Sample-Factory en entornos ViZDoom) cabria considerar cualquier otro checkpoint de la organizacion o del propio framework, pero no se han aportado datos de rendimiento, contexto o licencia que permitan una tabla comparativa fiable. Por lo tanto: **no disponible**.

## Limitaciones y advertencias

- **Ambito limitado al entorno**: el modelo solo es competente en `doom_health_gathering_supreme`; no se ha validado su transferencia a otros escenarios de ViZDoom, Atari o control continuo.
- **Alta varianza declarada**: la metrica `15,77 +/- 5,14` sugiere una recompensa media con dispersion notable, lo que implica resultados inconsistentes entre episodios o semillas.
- **Metrica no verificada**: el autor marca `verified: false` en la model card, por lo que la cifra procede unicamente del propio informe.
- **Licencia no disponible**: la ausencia de licencia explicita impide garantizar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- **Sin informacion de sesgos ni alucinacion en el sentido clasico**: al no ser un modelo de lenguaje, no aplican sesgos textuales ni alucinaciones, pero si existen riesgos de sobreajuste al escenario y de fragilidad ante pequenas perturbaciones visuales.
- **Sin metadatos de hardware ni tiempos de entrenamiento**: imposible estimar coste de reproduccion del experimento original.
- **Documentacion minima**: la model card no describe arquitectura exacta, hiperparametros ni protocolo de evaluacion.
- **Cero descargas y cero likes en el momento de la consulta**: la comunidad no ha validado aun el artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/Bananabaurus-Rex/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (repositorio): https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
