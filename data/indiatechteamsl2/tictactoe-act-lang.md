# IndiaTechTeamSL2/tictactoe-act-lang

## Resumen

tictactoe-act-lang es una politica robotica de imitacion publicada en HuggingFace por el usuario IndiaTechTeamSL2 bajo la libreria LeRobot de HuggingFace. No es un modelo de lenguaje: es una policy de control entrenada para ejecutar tareas de manipulacion robotica, en este caso asociada a un entorno de tres en raya (tictactoe), segun se deduce del identificador y del dataset de entrenamiento referenciado (IndiaTechTeamSL2/tictactoe-ai4y-v2_1). El sufijo "lang" y la etiqueta "act_lang" indican que la politica incorpora condicionamiento por lenguaje, es decir, que las acciones se condicionan a una instruccion textual ademas del estado visual/vectorial.

El modelo declara 51.674.294 parametros totales en sus pesos safetensors y un repositorio de 2,3 GB, coherente con un checkpoint de ACT (Action Chunking Transformer) mas estados de optimizador u otros artefactos de entrenamiento. La model card es practicamente la plantilla por defecto de LeRobot: no incluye descripcion funcional, composicion del dataset, hiperparametros, resultados de evaluacion ni tasa de exito. Se distribuye con licencia Apache 2.0.

Su relevancia es limitada y muy acotada: se trata de un artefacto de investigacion o de un ejercicio educativo (el dataset apunta a un programa "ai4y", probablemente "AI for Youth"), no de un modelo listo para produccion. Con 23 descargas y 0 likes en el momento de la consulta, carece de validacion comunitaria. Es util como ejemplo reproducible de como se entrena y despliega una policy ACT con condicionamiento de lenguaje en el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con condicionamiento por lenguaje, segun la etiqueta "act_lang" y el comando de entrenamiento `--policy.type=act` de LeRobot |
| Parametros totales | 51.674.294 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de observacion depende de la configuracion de la policy y no se documenta) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (el condicionamiento por lenguaje existe, pero no se especifican idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna. La evidencia disponible (tag `act_lang`, `library_name: lerobot`, y el comando de entrenamiento `--policy.type=act`) apunta a que se trata de una Action Chunking Transformer, la arquitectura de imitacion introducida en el trabajo ALOHA (Zhao et al., 2023) e integrada en LeRobot. ACT es un transformer encoder-decoder que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de compounding y mejora la estabilidad del control. El sufijo "lang" indica, ademas, que la entrada incluye un embedding de instruccion en lenguaje natural concatenado o cruzado con las observaciones.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el numero de episodios de demostracion, si hubo teleoperacion humana, ni si se aplicaron tecnicas de regularizacion como temporal ensembling en inferencia. El unico dato de entrenamiento verificable es el dataset referenciado: IndiaTechTeamSL2/tictactoe-ai4y-v2_1. Tampoco hay evidencia de RLHF, DPO ni aprendizaje por refuerzo; en el pipeline tipico de LeRobot, ACT se entrena por clonacion de comportamiento supervisada sobre demostraciones.

## Capacidades

- Control robotico por imitacion: genera chunks de acciones de bajo nivel para un manipulador, no texto.
- Condicionamiento por lenguaje: la etiqueta `act_lang` sugiere que la politica acepta instrucciones textuales como parte de la observacion.
- Ejecucion de una tarea concreta: asociada al escenario tictactoe del dataset de entrenamiento.
- Integracion con el ecosistema LeRobot: entrenamiento, evaluacion y grabacion mediante `lerobot.scripts.train` y `lerobot.record`.
- Compatibilidad con robots tipo SO-100/SO-101: el comando de evaluacion de la model card usa `--robot.type=so100_follower`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni vision de proposito general.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Reproduccion de experimentos de imitacion en robotica: sirve como punto de partida para entrenar una policy ACT propia con LeRobot usando un dataset de demostraciones propio, sustituyendo el dataset tictactoe.
- Docencia y talleres de robotica: el dataset asociado (ai4y) sugiere un contexto educativo; el modelo permite mostrar el ciclo completo de teleoperacion, grabacion de episodios, entrenamiento y evaluacion.
- Banco de pruebas de condicionamiento por lenguaje: al ser una variante `act_lang`, es util para estudiar como afecta una instruccion textual a las acciones generadas frente a una ACT sin lenguaje.
- Evaluacion de infraestructura de inferencia robotica: con 51,7 M de parametros, permite medir latencia de inferencia en GPU de consumo y comparar con otras policies de LeRobot sin grandes requisitos de hardware.
- Tareas de tablero y manipulacion discreta: el escenario tictactoe implica colocar piezas en posiciones discretas, un caso acotado de pick-and-place que puede reutilizarse como prueba de concepto de seleccion de posicion.
- Base para fine-tuning en tareas de laboratorio: al estar bajo Apache 2.0, se puede ajustar con datos propios sin restricciones de licencia, siempre que la tarea sea compatible con la morfologia del robot usado en el entrenamiento original.
- Integracion en pipelines de investigacion de comportamiento: util para comparar ACT con alternativas como Diffusion Policy sobre el mismo conjunto de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de exito, numero de episodios de evaluacion, ni metricas comparativas. Las etiquetas de HuggingFace no aportan datos cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 51,67 M de parametros ocupan aproximadamente 207 MB; en fp16, alrededor de 103 MB; en int8, unos 52 MB. El repositorio ocupa 2,3 GB, lo que sugiere que incluye checkpoints adicionales o estados de optimizador, no solo el modelo final.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM es suficiente para la inferencia de la policy. Una RTX 3060, RTX 4090 o superior cubre el caso con margen amplio; tambien se puede inferir en CPU con latencia mayor.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en hardware integrado modesto.
- Opciones de despliegue: LeRobot (`lerobot.record` para evaluacion/inferencia, `lerobot.scripts.train` para reentrenamiento), con `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de observacion, del tamano del chunk de acciones y del hardware del robot, ninguno de los cuales se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tictactoe-act-lang | 51,67 M | ACT con lenguaje | no disponible | Apache 2.0 | HuggingFace, 23 descargas |
| Otras policies ACT de LeRobot | no disponible | ACT | no disponible | habitualmente Apache 2.0 | HuggingFace Hub |
| Diffusion Policy (LeRobot) | no disponible | difusion para acciones | no disponible | habitualmente Apache 2.0 | HuggingFace Hub |
| SmolVLA (LeRobot) | no disponible | VLA | no disponible | no disponible | HuggingFace Hub |

No se dispone de datos verificados de parametros, contexto ni rendimiento de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La unica ventaja objetiva contrastable de este modelo es su tamano reducido (51,67 M de parametros) frente a propuestas VLA mucho mayores.

## Limitaciones y advertencias

- Model card practicamente vacia: la plantilla de LeRobot no se ha rellenado ("Model type not recognized — please update this template"), por lo que no hay garantias documentadas sobre el alcance real del modelo.
- Tarea extremadamente especifica: entrenado sobre un dataset de tictactoe; no se puede asumir generalizacion a otras tareas, objetos o entornos.
- Sesgos conocidos: no documentados. En clonacion de comportamiento, el sesgo del operador humano que genero las demostraciones se traslada directamente a la policy.
- Riesgo de fallo fuera de distribucion: cualquier variacion de iluminacion, posicion de camara, fondo o disposicion de piezas respecto al dataset de entrenamiento puede degradar el comportamiento de forma severa.
- Idioma: no se especifica que idiomas entiende el condicionamiento textual, ni como se comporta con instrucciones fuera del vocabulario de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia. No obstante, la licencia del modelo no cubre posibles derechos sobre el dataset asociado, que conviene verificar por separado.
- Falta de validacion externa: 0 likes y 23 descargas indican ausencia de uso o verificacion por parte de la comunidad.
- Ausencia total de benchmarks: no hay tasa de exito publicada, por lo que no se puede afirmar que la policy funcione correctamente en la tarea para la que fue entrenada.
- Fechas de creacion y actualizacion (2026) posteriores al conocimiento de referencia habitual; conviene verificar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IndiaTechTeamSL2/tictactoe-act-lang
- Dataset de entrenamiento: https://huggingface.co/datasets/IndiaTechTeamSL2/tictactoe-ai4y-v2_1
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de policies de imitacion en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
