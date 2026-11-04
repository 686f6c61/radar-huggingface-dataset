# djduecaster/dfreq-roller-ppo032-20261103

## Resumen

`dfreq-roller-ppo032-20261103` es un checkpoint de un agente entrenado con PPO (Proximal Policy Optimization) que controla un "roller" en el entorno de simulacion `microduck-arena`, un banco de pruebas de fisica que el autor ejecuta de forma nativa en CPU con soporte para MPS. El modelo recibe 61 observaciones y emite 14 acciones, sin acceso a seeds ni a entradas privilegiadas, y se distribuye unicamente en formato ONNX. Lo publica el usuario `djduecaster` bajo el identificador de checkpoint 32 de una serie de entrenamiento diaria.

La tarea concreta es la prueba `roller-sprint-2m`, en la que el agente debe completar un recorrido con velocidad de consigna de 1,1 m/s. Segun la model card, la evaluacion local del autor arroja un tiempo de 2,721 segundos con 5 de 5 llegadas a meta, y una validacion separada de 128 de 128 arranques completos y 64 de 64 arranques bajo estres de comandos. El propio autor lo describe como candidato para ejecucion diaria y no como record personal: el mejor tiempo publicado hasta la fecha es 2,570 segundos.

Es relevante para quienes trabajan en aprendizaje por refuerzo aplicado a control fisico de bajo nivel, porque documenta un flujo completo de entrenamiento PPO con evaluacion separada y verificacion de integridad del binario mediante SHA256. No es un modelo de lenguaje ni un modelo generativo de proposito general: es un controlador de politica entrenado para una tarea de simulacion muy acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica de control entrenada con PPO (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 61 observaciones) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; cuantizacion no documentada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (SHA256: 06334fe85ad276b686d83da18614e24a0914c37d7fcfc0e4a0f126fa469df3b7) |
| Espacio de observacion | 61 dimensiones |
| Espacio de accion | 14 dimensiones |
| Entorno | microduck-arena, evento roller-sprint-2m |
| Velocidad de consigna | 1,1 m/s |
| Checkpoint | 32 (entrenamiento diario) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red neuronal (numero de capas, anchura, activaciones ni si usa capas recurrentes). Lo que si se explicita es el algoritmo de aprendizaje: PPO sobre un simulador de fisica propio ejecutado en CPU con soporte para MPS, con actualizaciones independientes y sin reutilizar pesos ni salidas de oponentes de terceros. El mapeo es directo de 61 observaciones a 14 acciones, lo que sugiere un controlador de politica compacto orientado a control motor de un roller.

El autor insiste en que se trata de un checkpoint de entrenamiento real y no de una variante que solo cambia el hash, y aporta una verificacion criptografica del binario ONNX. Tambien diferencia entre la evaluacion con el evaluador original (5 de 5 llegadas, 2,721 s) y una validacion separada de robustez en el arranque (128 de 128 arranques completos y 64 de 64 bajo estres de comandos). No se documentan el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste adicionales como RLHF o DPO, algo por otra parte esperable en un agente de control y no en un modelo de lenguaje.

## Capacidades

- Control de politica en el entorno `microduck-arena`, evento `roller-sprint-2m`.
- Mapeo fijo de 61 observaciones a 14 acciones continuas o discretas (la model card no especifica la naturaleza exacta de cada accion).
- Seguimiento de una velocidad de consigna de 1,1 m/s durante el recorrido.
- Arranque fiable desde estado de reposo: 128 de 128 arranques completos en validacion.
- Robustez frente a variaciones de comando: 64 de 64 arranques bajo estres de comandos.
- Ejecucion en CPU sin necesidad de GPU, segun la descripcion del pipeline de entrenamiento nativo.
- Exportacion a ONNX para inferencia portable.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento extendido, al no ser un modelo de lenguaje.

## Casos de uso

- Evaluacion de politicas de control en simulacion: el checkpoint sirve como referencia reproducible para comparar variantes de PPO en la tarea `roller-sprint-2m`, con tiempos medidos y validacion de arranque documentados por el autor.
- Regresion de pipelines de RL: al estar en ONNX y con SHA256 publicado, puede integrarse en un test automatizado que verifique que una nueva version del simulador o del exportador no degrada el comportamiento del agente.
- Benchmark de simuladores de fisica: permite medir el coste computacional y la estabilidad de un motor de fisica en CPU/MPS ejecutando un controlador ya entrenado sobre el mismo evento.
- Estudio de robustez ante comandos: los resultados de estres de comandos (64 de 64) permiten usar el modelo como linea base para experimentos sobre variacion de consignas de velocidad.
- Docencia y divulgacion de RL aplicado: un caso con espacio de observacion y accion pequenos y resultados verificables es util para explicar el ciclo entrenamiento-evaluacion-validacion de PPO.
- Reproducibilidad de checkpoints: el identificador de checkpoint, la fecha y el hash permiten auditar que el binario desplegado corresponde exactamente al entrenado en una ejecucion concreta.
- Comparacion con el mejor tiempo publicado: sirve para contrastar la brecha entre un candidato de ejecucion diaria (2,721 s) y el record publicado (2,570 s) en el mismo evento.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Evaluador original, tiempo | 2,721 s |
| Evaluador original, llegadas | 5 de 5 |
| Validacion, arranques completos | 128 de 128 |
| Validacion, arranques bajo estres de comandos | 64 de 64 |
| Mejor tiempo publicado (referencia externa) | 2,570 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; no se dispone de estimacion para GPU porque el tamano del modelo ONNX no se documenta (el repositorio ocupa 0,0 GB segun HuggingFace, lo que sugiere un binario muy pequeno).
- GPU recomendadas: no disponible; el entrenamiento se describe como nativo en CPU con soporte MPS, por lo que la inferencia en GPU no es un requisito.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido espacio de observacion y accion, aunque no hay datos publicados de consumo de memoria ni de latencia.
- Opciones de despliegue: ONNX Runtime en CPU o GPU; tambien cabria exportar a otros runtimes compatibles con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-roller-ppo032-20261103 | Politica PPO para roller-sprint-2m | 61 obs. / 14 acciones | no aplica | no disponible | ONNX en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros checkpoints publicos del mismo entorno `microduck-arena` ni de controladores equivalentes para la tarea, por lo que no es posible establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea y un unico evento (`roller-sprint-2m`); no generaliza a otros entornos ni a otras consignas de velocidad fuera del rango validado.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- La model card no documenta sesgos, pero al entrenarse en un simulador propietario del autor, puede heredar las simplificaciones y sesgos fisicos de ese motor.
- Riesgo de sobreajuste al evaluador local: el autor advierte explicitamente de que se trata de un candidato de ejecucion diaria y no de un record, y de que el mejor tiempo publicado (2,570 s) sigue siendo la referencia del leaderboard.
- Licencia no especificada: no hay garantia de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no aplicables, pero la documentacion esta unicamente en ingles y no hay traduccion oficial.
- El repositorio muestra un tamano de 0,0 GB y cero descargas, lo que limita la validacion independiente por parte de la comunidad.
- La integridad del binario solo puede verificarse contra el SHA256 publicado; cualquier modificacion del ONNX invalida la comparacion con los resultados reportados.
- No se detallan los hiperparametros de PPO, la semilla ni el numero de pasos de entrenamiento, lo que dificulta la reproduccion exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/djduecaster/dfreq-roller-ppo032-20261103
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
