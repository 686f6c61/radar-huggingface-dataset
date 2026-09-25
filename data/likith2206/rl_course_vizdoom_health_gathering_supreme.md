# Likith2206/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo publicado en Hugging Face por el usuario Likith2206 bajo el identificador `Likith2206/rl_course_vizdoom_health_gathering_supreme`. Se trata de un agente entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) mediante Sample-Factory 2.0 sobre el entorno `doom_health_gathering_supreme` de ViZDoom. El repositorio ocupa 0,1 GB, esta etiquetado con el pipeline `reinforcement-learning` y no registra descargas ni likes en el momento de la consulta.

El prefijo `rl_course` del identificador, junto con la existencia de checkpoints practicamente identicos publicados por otros usuarios (liamleirs, Vishath, HusseinEid101, suseend), indica que se trata de un artefacto generado en el contexto de un curso de reinforcement learning. Su interes practico es acotado: sirve como ejemplo reproducible del flujo de trabajo de Sample-Factory con Hugging Face, como punto de partida para continuar entrenamiento y como linea base para comparar variantes de hiperparametros en el mismo escenario.

La model card declara un unico resultado, `mean_reward = 12,26 +/- 5,33` en `doom_health_gathering_supreme`, marcado explicitamente como no verificado. No hay informacion sobre licencia, numero de parametros, presupuesto de entrenamiento ni composicion del encoder. Conviene tratarlo como una policy de investigacion y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization): actor-critico con muestreo asincrono; el tipo de encoder visual no se detalla en la model card |
| Parametros totales | no disponible (no se publica el recuento; el repositorio completo ocupa 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL sobre observaciones visuales; no existe ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible / no aplica (el modelo no procesa lenguaje natural; la etiqueta `region:us` es un metadato de Hugging Face, no un idioma) |
| Licencia | no disponible |
| Formato de pesos | checkpoint nativo de Sample-Factory sobre PyTorch; no se distribuye en safetensors ni en GGUF |
| Algoritmo | APPO |
| Entorno de entrenamiento | `doom_health_gathering_supreme` (ViZDoom) |
| Libreria | sample-factory (2.0) |
| Pipeline declarado | reinforcement-learning |
| Etiquetas | sample-factory, tensorboard, deep-reinforcement-learning, reinforcement-learning, model-index, region:us |
| Desarrollador | Likith2206 (usuario de Hugging Face) |
| Fecha de creacion del repositorio | 2026-09-24 (segun metadatos) |
| Ultima actualizacion | 2026-09-24 (segun metadatos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

APPO es un algoritmo on-policy de tipo actor-critico que combina la formulacion de objetivo recortado de PPO con un esquema de muestreo asincrono de actores y aprendizaje desacoplado, en la linea de IMPALA, con correccion off-policy tipo V-trace. Sample-Factory implementa este algoritmo para entrenamiento distribuido de agentes que consumen observaciones de alta dimensionalidad (pixeles) y lo aplica a entornos ViZDoom, entre otros. En este caso la politica opera sobre el escenario `doom_health_gathering_supreme`, un entorno de navegacion en primera persona en el que el agente debe recoger botiquines mientras evita la perdida de salud, con acciones discretas de movimiento y giro.

La model card no aporta informacion sobre el numero de pasos de entorno utilizados, el tamano del lote, la tasa de aprendizaje, las semillas, el hardware de entrenamiento ni el tipo exacto de encoder (convolucional o residual) empleado para procesar los fotogramas. Tampoco se documenta el uso de fases de ajuste adicionales como RLHF, DPO o imitacion, algo que en cualquier caso no es habitual en este tipo de agentes. El unico detalle operativo disponible es que el trabajo se realizo con Sample-Factory 2.0 y que el checkpoint se puede reanudar con `--restart_behavior=resume`, sin que se indique en que punto del entrenamiento se detuvo el experimento.

## Capacidades

- Control de agente en el escenario ViZDoom `doom_health_gathering_supreme`: selecciona acciones discretas (movimiento, giro y disparo/no-op, segun la configuracion del entorno) a partir de observaciones visuales.
- Aprendizaje y ejecucion de una politica visual de extremo a extremo: no requiere extraccion manual de caracteristicas, ya que la red procesa directamente los fotogramas del entorno.
- Inferencia a partir del checkpoint mediante el script `enjoy` de Sample-Factory, con o sin GPU.
- Continuacion del entrenamiento sobre el mismo entorno mediante `--restart_behavior=resume`, util para ciclos de ajuste fino.
- Registro de metricas de entrenamiento en TensorBoard (etiqueta `tensorboard` del repositorio), lo que permite inspeccionar curvas de recompensa y de perdida.
- Compatibilidad con el flujo de carga y publicacion de Hugging Face integrado en Sample-Factory (`sample_factory.huggingface.load_from_hub`, flag `--push_to_hub`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de los modelos de lenguaje ni orquestacion de agentes con herramientas externas.
- No tiene capacidades multilingues, de vision general, de audio ni de generacion de texto: su unica modalidad de entrada es la observacion del simulador y su unica salida es una distribucion sobre acciones.
- No dispone de modo de razonamiento explicito (thinking mode) ni de trazas de cadena de pensamiento.

## Casos de uso

- Docencia en cursos de reinforcement learning: el identificador `rl_course` y la existencia de checkpoints homonimos de otros usuarios sugieren que se trata de un ejercicio de clase; sirve como ejemplo completo del ciclo entrenamiento, publicacion y evaluacion con Sample-Factory.
- Continuacion de entrenamiento como ejercicio practico: cargar el checkpoint con `load_from_hub` y reanudar con `--restart_behavior=resume` permite demostrar el ajuste de hiperparametros sobre una politica ya inicializada en lugar de partir de cero.
- Linea base interna para comparar algoritmos: al estar entrenado con APPO sobre un entorno estandar de ViZDoom, se puede contrastar con variantes de PPO, IMPALA u otros algoritmos en la misma tarea y con el mismo presupuesto de pasos.
- Validacion de infraestructura de entrenamiento asincrono: sirve para verificar que una instalacion de Sample-Factory, con sus workers y su gestion de dispositivos, arranca, entrena y evalua correctamente antes de lanzar experimentos costosos.
- Estudio de varianza de politicas: el resultado declarado (`12,26 +/- 5,33`) presenta una desviacion estandar elevada en relacion con la media, de modo que el checkpoint es un candidato razonable para disenos experimentales con multiples semillas y episodios de evaluacion.
- Experimentos de transferencia entre escenarios ViZDoom: el encoder visual aprendido puede reutilizarse como inicializacion en otros escenarios de la misma familia (por ejemplo, variantes de recogida de objetos) para estudiar cuanto conocimiento visual se transfiere.
- Material de divulgacion y demostraciones: la ejecucion con el script `enjoy` permite generar grabaciones del comportamiento del agente y curvas de TensorBoard para explicar el funcionamiento de un bucle de RL en charlas o clases.
- Pruebas de integracion en un servicio de inferencia propio: envolver la politica en un proceso Python (por ejemplo, con FastAPI) para servir acciones a un simulador remoto es viable dado el reducido tamano del checkpoint.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index del repositorio. El campo `verified` es `false` en todos los casos, es decir, no han sido comprobados de forma independiente.

| Algoritmo | Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| APPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 12,26 +/- 5,33 | no |

La model card no incluye la curva de aprendizaje, el numero de pasos de entorno en el momento de la evaluacion, el numero de episodios usados para calcular la media, ni resultados de referencia de otros algoritmos en el mismo entorno. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no publicada oficialmente. Dado que el repositorio completo ocupa 0,1 GB, la estimacion razonable es inferior a 1 GB en precision de 32 bits, muy por debajo de cualquier GPU moderna.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA sirve para la inferencia (desde una GTX 1050 Ti o similar). Modelos como RTX 3060, RTX 4090, A100 o H100 son sobredimensionados para esta policy y solo se justifican si se reutilizan para reentrenar con muchos workers.
- Cabe en GPU de consumo: si. Incluso es viable ejecutarlo unicamente en CPU, que es el modo habitual del script `enjoy` para demostraciones.
- Opciones de despliegue: script `enjoy` de Sample-Factory sobre PyTorch; servicio de inferencia propio en Python; integracion en un simulador ViZDoom local. No es compatible con vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Registro de metricas: TensorBoard, segun las etiquetas del repositorio.
- Latencia y throughput: no disponibles para este checkpoint. Como referencia del framework y no de esta policy concreta, el articulo de Sample-Factory reporta hasta 100 000 FPS de entrenamiento en escenarios ViZDoom con configuraciones asincronas de multiples workers en GPU.

## Comparativa con modelos similares

Existen varios checkpoints publicados con el mismo nombre de experimento por otros usuarios. No se dispone de metricas publicadas de ninguno de ellos, por lo que la comparacion numerica no es posible.

| Modelo | Entorno | Algoritmo | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Likith2206/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO (Sample-Factory 2.0) | mean_reward 12,26 +/- 5,33 (no verificado) | no disponible | Hugging Face, 0 descargas |
| liamleirs/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO (Sample-Factory) | no disponible | no disponible | Hugging Face |
| Vishath/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO (Sample-Factory) | no disponible | no disponible | Hugging Face |
| HusseinEid101/-rl_course_vizdoom_health_gathering_supreme- | doom_health_gathering_supreme | APPO (Sample-Factory) | no disponible | no disponible | GitHub |
| Baseline APPO de Sample-Factory en ViZDoom | varios escenarios ViZDoom | APPO | no disponible | licencia del repositorio Sample-Factory | GitHub |

Al tratarse de ejecuciones independientes del mismo ejercicio, las diferencias entre estas entradas se reducen a la semilla, los hiperparametros y el presupuesto de pasos, ninguno de los cuales se documenta.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Es imprescindible contactar con el autor antes de cualquier uso fuera del ambito privado o academico.
- Metrica no verificada: el unico resultado publicado esta marcado como `verified: false` y procede exclusivamente del autor.
- Varianza elevada: la desviacion estandar declarada (5,33) es muy alta en relacion con la media (12,26), lo que sugiere un comportamiento inestable entre episodios o entre evaluaciones; cualquier uso practico deberia ir acompanado de una evaluacion propia con muchos episodios y varias semillas.
- Ausencia total de documentacion de entrenamiento: no se indican pasos de entorno, hiperparametros, semillas, hardware ni version exacta de las dependencias. Reproducir el resultado es, por tanto, inviable con la informacion publicada.
- Riesgo de sobreajuste al entorno: como toda politica entrenada en un unico escenario, el comportamiento aprendido puede degradarse drasticamente si se cambia la distribucion visual, la configuracion de acciones o la dinamica del simulador.
- Sin validacion por la comunidad: 0 descargas y 0 likes implican que no hay evidencia externa de que el checkpoint funcione tal y como se describe.
- Alucinacion: el concepto no aplica en el sentido de los modelos generativos de texto; el modo de fallo equivalente es la adopcion de estrategias suboptimas o erraticas dentro del simulador, sin ninguna garantia de seguridad.
- Sesgos: no hay sesgos sociales que reportar, pero si los sesgos propios de la politica aprendida, incluida la posible explotacion de particularidades del diseno de recompensa del entorno.
- Ambito de aplicacion muy restringido: no debe presentarse ni desplegarse como sistema de decision en dominios reales; su unico contexto valido es la simulacion y la investigacion.
- Anomalia en los metadatos: la fecha de creacion registrada (2026-09-24) y la de actualizacion son identicas y coinciden con la misma marca temporal; conviene verificarlas antes de citar el repositorio.
- Dependencia de version: al haberse entrenado con Sample-Factory 2.0, es probable que la carga requiera una version compatible de la libreria; versiones distintas pueden fallar al interpretar la configuracion del experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Likith2206/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de Hugging Face dentro de Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/
- Paper de Sample-Factory y APPO (Petrenko et al., 2020): https://arxiv.org/abs/2006.11751
- Checkpoint homonimo de liamleirs: https://huggingface.co/liamleirs/rl_course_vizdoom_health_gathering_supreme
- Checkpoint homonimo de Vishath: https://huggingface.co/Vishath/rl_course_vizdoom_health_gathering_supreme
- Repositorio en GitHub de HusseinEid101: https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
- Ficha de indice de terceros sobre este experimento: https://essamamdani.com/ai-models/hf-suseend-rl-course-vizdoom-health-gathering-supreme
