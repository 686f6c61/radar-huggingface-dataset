# Shiki42/PutCab-Concurrent-Train50-V4-PI05-LoRA10K-E113

## Resumen

PutCab-Concurrent-Train50-V4-PI05-LoRA10K-E113 es un checkpoint de inferencia publicado por el usuario Shiki42 en Hugging Face. Se trata de un ajuste LoRA sobre PI0.5, el modelo vision-language-action (VLA) de Physical Intelligence, orientado a una tarea concreta de manipulacion robotica denominada PutCab y entrenado sobre el dataset Shiki42/PutCab-Concurrent-Train50-V4. Corresponde al paso 10000 del experimento E113, con un unico action expert, inicializacion "mirror" desde PI0.5 Base, batch 16 y semilla de entrenamiento 87431.

No es un modelo de lenguaje generalista ni un checkpoint de Transformers: el repositorio contiene parametros en formato Orbax (JAX), los assets de normalizacion especificos del dataset, la configuracion resuelta y los metadatos de procedencia. El propio autor lo describe como artefacto de investigacion, con una sola semilla de entrenamiento y resultados de evaluacion pendientes de auditoria, y advierte de que no confirma ni el rendimiento ni las afirmaciones sobre causalidad temporal asociadas al experimento.

Su relevancia es por tanto acotada y de tipo metodologico: sirve para reproducir y auditar un experimento concreto dentro del ecosistema OpenPI, no para desplegar un asistente conversacional ni un generador de codigo. Con cero descargas, cero likes y licencia no declarada en el momento de su publicacion, debe tratarse como material de laboratorio y no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de PI0.5, con ajuste LoRA sobre un unico "action expert"; no se detalla en la model card |
| Parametros totales | no disponible (el repositorio ocupa 6,3 GB e incluye parametros Orbax, assets de normalizacion y configuracion) |
| Parametros activos | no disponible (la informacion proporcionada no indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuye como parametros Orbax en JAX, sin variantes GGUF, AWQ o GPTQ publicadas |
| Idiomas soportados | no disponible (tarea de robotica guiada por instrucciones en lenguaje natural; idioma no declarado) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | Orbax (JAX); no es un checkpoint de Transformers |
| Tamano del repositorio | 6,3 GB |
| Paso de entrenamiento | 10000 (experimento E113) |
| Semilla de entrenamiento | 87431 |
| Dataset de entrenamiento | Shiki42/PutCab-Concurrent-Train50-V4, commit a503203b294e057eb24f783b9e7210e523487d63 |
| Commit de OpenPI | e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

La model card describe un ajuste LoRA sobre PI0.5 con un unico action expert y una inicializacion "mirror" desde PI0.5 Base. El entrenamiento se realizo con batch 16 y semilla 87431, y el checkpoint publicado corresponde al paso 10000 del experimento E113. No se especifican en la documentacion disponible el rango del LoRA, las capas adaptadas, la composicion exacta del dataset, el numero de tokens o episodios vistos, ni si hubo etapas de RLHF, DPO o aprendizaje por imitacion con objetivos adicionales. Tampoco se indica la innovacion tecnica concreta (por ejemplo, tipo de decodificacion de acciones o esquema de attention) mas alla del uso de LoRA sobre el action expert.

El repositorio incluye los parametros Orbax, los assets de normalizacion especificos del dataset, la configuracion resuelta y la procedencia (dataset y commit de OpenPI). Los estados del optimizador y del dataloader se omiten deliberadamente, por lo que el artefacto esta pensado para inferencia y evaluacion, no para reanudar el entrenamiento. Para cargarlo es necesario el codigo fuente de OpenPI en JAX correspondiente al commit indicado y la configuracion equivalente; no funciona con cargadores genericos de Transformers.

## Capacidades

- Generacion de acciones de robot a partir de observaciones e instrucciones: el modelo es una politica VLA, no un generador de texto.
- Ejecucion de una tarea especifica de manipulacion (PutCab) sobre el dataset con el que fue entrenado, con los assets de normalizacion incluidos.
- Ajuste LoRA sobre un action expert unico, lo que permite estudiar el efecto del ajuste de bajo rango en este tipo de politicas.
- Carga dentro del ecosistema OpenPI en JAX con la configuracion y el commit de referencia.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; el idioma de las instrucciones no se declara.
- Capacidades especiales (modo thinking, vision general, audio): no disponible; la model card no describe ninguna mas alla del uso como politica VLA.

## Casos de uso

- Reproduccion de experimentos: cargar el checkpoint con el commit de OpenPI e9ba7b77 y la configuracion resuelta permite replicar el paso 10000 del experimento E113 y comparar resultados con otras ejecuciones del mismo autor.
- Auditoria de resultados pendientes: dado que la evaluacion esta "audit pending", este artefacto sirve como objeto de verificacion independiente de las metricas reportadas para el experimento.
- Estudios de ablacion de LoRA: al tratarse de un ajuste LoRA con semilla y batch conocidos, es util para analizar sensibilidad a la semilla, al rango del adaptador y a la inicializacion "mirror" frente a otras inicializaciones.
- Validacion de pipelines de normalizacion: el repositorio incluye assets de normalizacion especificos del dataset, por lo que sirve para comprobar que un pipeline de inferencia reproduce exactamente el preprocesado de entrenamiento.
- Benchmarking de politicas VLA: puede incorporarse como baseline especifico de tarea en comparativas internas frente a otros checkpoints de la misma familia, siempre que se use el mismo conjunto de evaluacion.
- Pruebas de integracion del runtime OpenPI: util para validar versiones, dependencias de JAX y flujos de carga de pesos Orbax antes de dar por buena una instalacion.
- Punto de partida para nuevo ajuste: puede emplearse como inicializacion para un fine-tuning posterior sobre datos adicionales de la misma tarea, teniendo en cuenta que no incluye estados del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion siguen pendientes de auditoria, que el 80 % previamente reportado para FixedRole100 permanece bajo investigacion y que la evaluacion Fixed100 esta registrada por separado sin que se reclame ningun resultado. No se debe atribuir a este checkpoint ningun porcentaje de exito ni comparacion cuantitativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Tomando como unica referencia el tamano del repositorio (6,3 GB) y el rango habitual de los VLA de la familia PI0.5, un despliegue en bf16 requeriria del orden de 8-12 GB para pesos mas varios GB adicionales para activaciones y buffers de compilacion XLA; es una estimacion orientativa, no un dato publicado por el autor, y debe verificarse en el hardware objetivo.
- GPU recomendadas: para inferencia, A100 40 GB, H100 o L40S; una RTX 4090 de 24 GB es probablemente suficiente para inferencia en bf16 segun la estimacion anterior, pero no hay confirmacion del autor.
- Entrenamiento: se necesitarian GPU de clase A100/H100, posiblemente varias, dado el uso de JAX con batch 16 y estados de optimizador que no se distribuyen con el checkpoint.
- Memoria de host: la compilacion XLA y la carga de pesos Orbax suelen requerir entre 32 y 64 GB de RAM del sistema; valor no confirmado en la documentacion.
- Opciones de despliegue: unicamente el runtime de OpenPI en JAX con el commit indicado. No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia por accion ni tamano de chunk de acciones.

## Comparativa con modelos similares

Los datos cuantitativos de los modelos alternativos no se han proporcionado en la informacion disponible, por lo que la comparacion se limita a dimensiones cualitativas.

| Modelo | Ambito | Formato de pesos | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PutCab-Concurrent-Train50-V4-PI05-LoRA10K-E113 | Politica VLA especifica de tarea (PutCab) | Orbax (JAX) | OpenPI (JAX) | no disponible | Publico en Hugging Face, 0 descargas |
| PI0.5 / OpenPI (modelo base de Physical Intelligence) | VLA generalista de robotica | Orbax / JAX | OpenPI (JAX) | no disponible en la informacion proporcionada | Repositorio openpi de Physical Intelligence |
| OpenVLA | VLA generalista de robotica | safetensors (Transformers) | Transformers, vLLM | no disponible en la informacion proporcionada | Publico en Hugging Face |
| SmolVLA | VLA ligero de robotica | safetensors (Transformers) | Transformers, LeRobot | no disponible en la informacion proporcionada | Publico en Hugging Face |

Parametros, longitud de contexto y resultados de benchmark de todas las filas: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor lo etiqueta explicitamente como tal, con una sola semilla de entrenamiento y evaluacion pendiente de auditoria.
- Rendimiento no confirmado: las afirmaciones sobre causalidad temporal y el 80 % reportado para FixedRole100 estan bajo investigacion; no debe citarse como resultado validado.
- Licencia no declarada: al no especificarse licencia, el uso comercial es juridicamente incierto y requiere contactar con el autor. Ademas, la licencia del modelo base PI0.5 puede imponer condiciones adicionales que no se documentan aqui.
- Especificidad de tarea: el modelo esta ajustado para PutCab con un dataset concreto; su comportamiento fuera de esa distribucion no esta caracterizado y puede degradarse de forma abrupta.
- Dependencia estricta del codigo: requiere el commit exacto de OpenPI y los assets de normalizacion incluidos; cargarlo con otra configuracion o sin ellos invalida los resultados.
- No reanudable: al omitirse los estados del optimizador y del dataloader, no es posible continuar el entrenamiento desde el paso 10000 sin reiniciar el estado.
- Riesgo en robotica real: no se documentan limites de seguridad, paradas de emergencia ni validacion de acciones fuera de rango. Cualquier despliegue sobre hardware fisico debe ir acompanado de capas de seguridad independientes.
- Idiomas y contexto: no disponible; no se puede asumir soporte multilingue ni una ventana de contexto determinada.
- Trazabilidad limitada: cero descargas y cero likes implican ausencia de validacion externa; no hay informes de terceros que confirmen el funcionamiento del checkpoint.
- Alucinacion: no aplica en el sentido textual, pero si existe el riesgo equivalente de generar acciones incorrectas o fuera de distribucion en entornos no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiki42/PutCab-Concurrent-Train50-V4-PI05-LoRA10K-E113
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Concurrent-Train50-V4 (commit a503203b294e057eb24f783b9e7210e523487d63)
- Codigo fuente OpenPI: https://github.com/Physical-Intelligence/openpi (commit de referencia e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead)
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados disponibles corresponden a foros y consultas no relacionadas con el artefacto.
