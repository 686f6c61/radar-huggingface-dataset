# eruedas/act_mirokai_1mrgb_popcorn_real_v0.0

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice bloques cortos de acciones en lugar de pasos individuales, y este repositorio contiene un checkpoint concreto de esa politica entrenado con la libreria LeRobot de Hugging Face. El modelo, publicado por el usuario `eruedas` bajo el identificador `act_mirokai_1mrgb_popcorn_real_v0.0`, tiene 51.693.202 parametros y fue entrenado sobre el dataset `eruedas/mirokai_1mrgb_popcorn_real_v0.0`, lo que apunta a una tarea de manipulacion sobre un robot Mirokai a partir de datos reales (el nombre sugiere "popcorn", aunque la model card no lo confirma).

No es un modelo de lenguaje: es una politica de control robotico que consume observaciones visuales y de propiocepcion y emite comandos de actuacion. Por tanto, conceptos como ventana de contexto, idiomas o cuantizacion de pesos en el sentido habitual de los LLM no aplican directamente. Su relevancia es practica dentro del ecosistema LeRobot: sirve como punto de partida reproducible para entrenar, evaluar y comparar politicas de imitacion en brazos roboticos de bajo coste.

El repositorio es muy reciente y practicamente sin traccion (0 descargas, 0 likes en el momento de la consulta), con un tamano de 0,2 GB y pesos en formato safetensors. La licencia Apache 2.0 permite uso comercial, pero la ausencia de una model card completa limita la reproducibilidad del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), politica de aprendizaje por imitacion basada en transformer; no es un LLM |
| Parametros totales | 51.693.202 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; procesa observaciones por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo implementa el metodo ACT descrito en el paper arXiv:2304.13705, referenciado en las etiquetas del repositorio. Se trata de una politica de imitacion que aprende a partir de datos de teleoperacion y que, en lugar de predecir una unica accion por paso, predice un "chunk" o bloque de acciones de horizonte corto. Este enfoque reduce el error de composicion que aparece al encadenar predicciones paso a paso y suele traducirse en tasas de exito mas altas en tareas de manipulacion. La model card describe el metodo como "imitation-learning method that predicts short action chunks instead of single steps".

El entrenamiento se ha realizado con LeRobot, el stack de Hugging Face para robotica, invocando `lerobot-train` con `--policy.type=act` sobre el dataset `eruedas/mirokai_1mrgb_popcorn_real_v0.0`. La informacion disponible no detalla el numero de episodios, la composicion del dataset, el numero de tokens o muestras vistas, ni si se aplicaron tecnicas de refinamiento posteriores (RLHF, DPO u otras, poco habituales en este dominio). Tampoco se especifica la configuracion de camaras, la frecuencia de control ni el espacio de acciones (articulaciones frente a efector final). Estos datos figuran como no disponibles.

## Capacidades

- Generacion de secuencias de acciones de control robotico a partir de observaciones visuales y de estado del robot (aprendizaje por imitacion).
- Prediccion por bloques de acciones ("action chunking") en lugar de paso a paso, lo que mejora la estabilidad temporal de la politica.
- Aprendizaje a partir de datos de teleoperacion, sin necesidad de definir recompensas ni un entorno simulable.
- Integracion nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluacion con `lerobot-record`.
- Ejecucion en brazos roboticos compatibles con los tipos de robot soportados por LeRobot (el ejemplo de la model card usa `so100_follower`).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo "thinking", vision, audio): vision como entrada de observacion; el resto no aplica.

## Casos de uso

- Despliegue de una politica de manipulacion en robot real: mediante `lerobot-record --robot.type=so100_follower --policy.path=<repo>` se puede ejecutar la politica sobre hardware compatible y grabar episodios de evaluacion. Es el flujo directo documentado en la model card.
- Fine-tuning sobre nuevos datasets de teleoperacion: el checkpoint sirve como inicializacion para reentrenar con `lerobot-train --policy.type=act` sobre datos propios, reduciendo el coste frente a entrenar desde cero.
- Linea base (baseline) en investigacion sobre aprendizaje por imitacion: ACT es una referencia habitual en comparativas de politicas de manipulacion, por lo que este checkpoint permite medir mejoras de metodos alternativos bajo el mismo pipeline de LeRobot.
- Validacion de pipelines de datos de robotica: al ser un modelo pequeno y con pesos en safetensors, es util para comprobar de extremo a extremo la cadena de recoleccion, entrenamiento y evaluacion antes de escalar a modelos mayores.
- Prototipado en laboratorio con hardware de bajo coste: el tamano del modelo (51,7 M de parametros) permite iterar rapidamente en GPUs de gama media o incluso en equipos embebidos tipo Jetson.
- Recoleccion de episodios y evaluacion sistematica: el flujo `lerobot-record` con prefijo `eval_` en el repositorio del dataset facilita generar conjuntos de evaluacion etiquetados y comparar configuraciones.
- Nota importante: al ser una politica entrenada para un dataset y un montaje concretos, su uso directo fuera de ese contexto (otra tarea, otro robot u otra disposicion de camaras) no esta garantizado y requeriria reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de exito, comparativas con otras politicas ni metricas de evaluacion. El unico dato cuantitativo verificable es el numero de parametros (51.693.202) y el tamano del repositorio (0,2 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 51.693.202 parametros, los pesos en fp32 ocupan aproximadamente 207 MB y en fp16 unos 103 MB. Sumando buffers de imagen y activaciones, una estimacion conservadora situa la inferencia por debajo de 2 GB de VRAM, aunque este dato no aparece confirmado en la documentacion del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la practica (RTX 3060, RTX 4060, RTX 4090). No se requieren A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna, y es probable que funcione tambien en CPU para pruebas puntuales, dado el tamano reducido.
- Opciones de despliegue: el soporte oficial es LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluacion). vLLM, TGI, Ollama y llama.cpp no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del robot, la frecuencia de control, el numero de camaras y el hardware de inferencia; la model card no proporciona mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La tabla siguiente recoge la comparacion con alternativas conocidas del mismo dominio, marcando como "no disponible" todo aquello que no puede verificarse con la informacion suministrada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_mirokai_1mrgb_popcorn_real_v0.0 (este modelo) | 51.693.202 | no aplica | no disponible | apache-2.0 | Hugging Face (repo publico, 0 descargas) |
| Diffusion Policy (familia alternativa de imitacion) | no disponible | no aplica | no disponible | no disponible | referencia academica, no comparada aqui |
| VQ-BeT (familia alternativa de imitacion) | no disponible | no aplica | no disponible | no disponible | referencia academica, no comparada aqui |
| Otros checkpoints ACT en LeRobot Hub | no disponible | no aplica | no disponible | variable segun autor | Hugging Face |

## Limitaciones y advertencias

- Especificidad de tarea y entorno: al estar entrenado sobre un unico dataset, el modelo probablemente esta ajustado a una disposicion concreta de camaras, iluminacion, posiciones de objetos y caracteristicas del robot. Su generalizacion fuera de ese contexto es limitada.
- Sesgos de datos: los sesgos derivados de la teleoperacion (estilos de demostracion, distribucion de posiciones iniciales, condiciones de iluminacion) se trasladan directamente a la politica. La model card no documenta analisis de sesgos.
- Riesgo de acciones erroneas: aunque no existe "alucinacion" en el sentido de los modelos de lenguaje, la politica puede generar trayectorias incorrectas o inseguras ante observaciones fuera de distribucion. En robotica real esto implica riesgo fisico, por lo que se recomienda limitar velocidades, fuerzas y espacio de trabajo.
- Ausencia de datos de evaluacion: no hay tasas de exito publicadas, ni numero de episodios de entrenamiento, ni informacion sobre la composicion del dataset. La reproducibilidad del resultado no puede verificarse.
- Model card incompleta: la ficha del autor solo documenta el metodo generico y los comandos de entrenamiento/evaluacion, sin detalles del dataset, la tarea ni los hiperparametros.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia. Al derivar del paper ACT, conviene revisar la licencia del codigo de LeRobot usado para el entrenamiento.
- Idiomas y contexto: no aplica; no es un modelo de lenguaje, por lo que no debe evaluarse con los criterios habituales de LLM.
- Inconsistencia de fechas: el repositorio figura como creado el 2026-09-11, una fecha posterior a la consulta actual, lo que sugiere un error de metadatos o de reloj en el proceso de subida. Conviene verificarlo antes de citarlo.
- Adopcion nula: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eruedas/act_mirokai_1mrgb_popcorn_real_v0.0
- Dataset de entrenamiento: https://huggingface.co/datasets/eruedas/mirokai_1mrgb_popcorn_real_v0.0
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
