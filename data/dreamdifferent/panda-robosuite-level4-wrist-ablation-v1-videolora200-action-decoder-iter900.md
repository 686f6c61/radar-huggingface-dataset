# dreamdifferent/panda-robosuite-level4-wrist-ablation-v1-videolora200-action-decoder-iter900

## Resumen

El repositorio `dreamdifferent/panda-robosuite-level4-wrist-ablation-v1-videolora200-action-decoder-iter900` contiene un checkpoint de decoder de acciones perteneciente al pipeline que su autor denomina VAM-Cross MimicVideo World2Action. No es un modelo de lenguaje: es el cabezal que traduce representaciones de un modelo de vídeo (Video2World) en comandos motores para un brazo robotico. Concretamente, se trata del checkpoint de la iteracion 900 de un entrenamiento cuyo identificador de ejecucion es `w2a_panda_robosuite_level4_2cam_wrist_ablation_v1_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`, finalizado con estado `completed`.

El modelo produce 15 acciones correspondientes a efector final y pinza a 5 Hz, con objetivos de pose relativos a la pose alcanzada actual (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool` y rotacion codificada como `rotation_6d`. La entrada son dos vistas de camara (`observation.images.corner_cam` y `observation.images.wrist_cam`), y el entrenamiento se realizo sobre un dataset de 162 episodios y 54.352 fotogramas de una tarea de manipulacion en RoboSuite con un robot Panda.

Es relevante como artefacto de investigacion, no como producto. Publicado con 0 descargas y 0 likes, sin licencia declarada y sin benchmarks, su interes esta en documentar un experimento de transferencia cross-embodiment: el decoder se inicializa desde un checkpoint entrenado con datos de teleoperacion de WidowX y se afina sobre datos de Panda, con un backbone de video y un LoRA de video congelados. Depende de cuatro artefactos congelados que no se incluyen en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card lo describe como decoder de acciones World2Action sobre un backbone Video2World; no se detalla el tipo de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica como contexto de texto; el contrato de accion especifica 15 acciones por chunk a 5 Hz (3 segundos por chunk) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 1,0 GB e incluye el checkpoint, un JSON fijado y el `config.yaml` efectivo) |
| Autor | dreamdifferent |
| Pipeline declarado en HuggingFace | robotics |
| Tareas declaradas (tags) | mimic-video, robotics, action-prediction |
| Entradas | `observation.images.corner_cam`, `observation.images.wrist_cam` |
| Salida | 15 acciones de efector final alcanzado y pinza |
| Frecuencia de control | 5 Hz |
| Representacion de rotacion | `rotation_6d` |
| Objetivo de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-corner-wrist` |
| Episodios / fotogramas | 162 / 54.352 |
| Framework de referencia | MimicVideo, commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` |
| Iteracion del checkpoint | 900 |
| Estado de la ejecucion | `completed` |
| Fecha de creacion (metadatos HF) | 2026-09-15 |
| Fecha de actualizacion (metadatos HF) | 2026-09-15 |
| Tamano del repositorio | 1,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe una arquitectura en cascada con cuatro componentes, tres de ellos congelados durante este entrenamiento: un backbone Video2World inicial (`dreamdifferent/widowx250-wrist-ablation-v1-video-fused@8e39d96344dea0a82ae673874a38206a6c412948`), un decoder de acciones inicial (`dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374@0ea6db91672db019d9d6dc9a6c9bd1ecc0504001`) y un LoRA de video congelado (`dreamdifferent/panda-robosuite-level4-wrist-ablation-v1-video-lora-iter200@24e15bdb2250e55e07a4af11f8f5022615362e6b`). Sobre esa base se entrena el decoder World2Action que constituye este repositorio. No se especifica el numero de parametros, la profundidad, el mecanismo de atencion ni el tipo de cabezal de accion.

El dataset de entrenamiento consta de 162 episodios y 54.352 fotogramas capturados con dos camaras (una corner y una wrist) sobre la tarea `level4` de RoboSuite con robot Panda, con texturas variadas y grabaciones de teleoperacion originalmente asociadas a WidowX. El registro del identificador de ejecucion sugiere que el decoder de acciones parte de la iteracion 2374 del checkpoint WidowX y que el LoRA de video corresponde a la iteracion 200, mientras que el checkpoint publicado es la iteracion 900 del run conjunto. No hay informacion sobre volumen de tokens, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). La nomenclatura `wrist_ablation_v1` sugiere un estudio de ablacion sobre la camara de muneca, pero la model card no lo confirma y no se han publicado resultados de dicha ablacion.

## Capacidades

- Prediccion de acciones motoras: genera chunks de 15 acciones de efector final y pinza a partir de dos vistas de camara, a una frecuencia de 5 Hz.
- Control en espacio de pose relativa: las acciones son desplazamientos relativos a la pose alcanzada actual, expresados en el marco `widowx_reference_base/teleop_aligned_tool`.
- Representacion de orientacion en 6D: la rotacion se codifica como `rotation_6d`, lo que evita discontinuidades de representaciones tipo Euler o cuaternion.
- Fusion de multiples vistas: consume simultaneamente una camara cenital o de esquina y una camara en la muneca del robot.
- Condicionamiento por modelo de video: el decoder opera sobre representaciones producidas por un backbone Video2World con un LoRA de video congelado, no directamente sobre pixeles.
- Transferencia cross-embodiment: inicializado desde un decoder entrenado con datos de WidowX y afinado sobre datos de Panda, segun los identificadores de los checkpoints congelados.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no expone interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; el unico horizonte temporal es el chunk de 3 segundos.
- No tiene capacidades multilingues ni de generacion de texto, codigo, matematicas o vision descriptiva.
- No se documentan modos especiales (thinking mode, audio, vision-language) ni capacidades de dialogo.

## Casos de uso

- Reproduccion de experimentos de investigacion: el repositorio incluye el JSON fijado y el `config.yaml` efectivo, de modo que un grupo de investigacion puede reconstruir exactamente el run siempre que disponga de los cuatro artefactos congelados con sus commits. Es el uso principal y para el que esta pensado el artefacto.
- Evaluacion de decoders de accion en pipelines de world models de video: sirve como punto de comparacion frente a otros cabezales entrenados sobre el mismo backbone Video2World congelado, aislando el efecto del decoder.
- Estudio de transferencia cross-embodiment WidowX a Panda: al partir de un decoder WidowX y afinar sobre datos de Panda, permite medir cuanto del comportamiento motor se transfiere entre morfologias y espacios de accion distintos.
- Investigacion sobre ablacion de camaras: la nomenclatura del run apunta a un estudio de ablacion de la vista de muneca; el checkpoint puede emplearse como condicion experimental frente a variantes sin esa camara, aunque los resultados no estan publicados.
- Base para fine-tuning en tareas de manipulacion con dos camaras: un equipo con su propio dataset de teleoperacion en RoboSuite puede partir de estos pesos, respetando las dependencias congeladas, para adaptar el decoder a una tarea nueva de la misma familia.
- Prototipado offline de politicas de imitacion: validar en simulador la viabilidad de un esquema de action chunking a 5 Hz con horizonte de 3 segundos antes de invertir en recogida de datos reales.
- Analisis de sensibilidad a la representacion de rotacion: util para comparar `rotation_6d` frente a otras codificaciones en terminos de error de orientacion del efector final, dado que el contrato de accion queda documentado de forma explicita.
- No se recomienda su uso directo en un robot fisico sin una validacion exhaustiva previa: no hay licencia, no hay evaluaciones publicadas y el dataset de origen es reducido y especifico de una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion, metricas de simulacion ni comparaciones cuantitativas con otros checkpoints del mismo pipeline. El repositorio tiene 0 descargas y 0 likes, por lo que tampoco existe retroalimentacion de terceros que permita inferir su comportamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio del checkpooint ocupa 1,0 GB, pero no se indica el numero de parametros ni la precision de los pesos, por lo que no puede derivarse una cifra fiable.
- Dependencia critica: el decoder no es autonomo. Requiere cargar ademas el backbone Video2World, el decoder inicial y el LoRA de video congelados, cuyos tamanos no se especifican en la informacion disponible. La VRAM real del sistema completo sera sustancialmente mayor que la del checkpoint publicado.
- GPU recomendadas: no disponible. No hay datos de consumo de memoria ni de requisitos minimos publicados por el autor.
- Viabilidad en GPU de consumo: no confirmada. Dado el tamano del repositorio (1,0 GB), es plausible que el decoder aislado quepa en GPUs de consumo con suficiente memoria libre, pero el conjunto backbone mas decoder puede exceder esos limites; se trata de una estimacion no verificada.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El unico camino documentado es ejecutar el codigo de MimicVideo en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`, cargando los checkpoints congelados con sus hashes.
- Latencia y throughput: no medidos. Como restriccion derivada del contrato de accion, el sistema debe producir un chunk de 15 acciones a 5 Hz, lo que implica inferencias separadas por 200 ms como maximo para mantener control continuo; no se ha publicado si el checkpoint cumple ese margen en hardware concreto.
- Almacenamiento: al menos 1,0 GB solo para este checkpoint, mas el espacio de los tres artefactos congelados y del dataset de 54.352 fotogramas si se desea reproducir el entrenamiento.

## Comparativa con modelos similares

La informacion disponible sobre este modelo no incluye numero de parametros, datos de rendimiento ni licencia, por lo que no es posible establecer una comparacion cuantitativa rigurosa. La tabla siguiente presenta alternativas de la misma categoria funcional (politicas de manipulacion robotica entrenadas por imitacion), con notas cualitativas; las cifras de terceros proceden de documentacion publica de esos proyectos y no de la busqueda realizada para esta ficha, y deben verificarse antes de usarse.

| Modelo | Categoria | Parametros | Entradas | Salida | Licencia | Nota comparativa |
|---|---|---|---|---|---|---|
| panda-robosuite-level4-wrist-ablation-v1-videolora200-action-decoder-iter900 | Decoder de acciones sobre world model de video | no disponible | Dos camaras (corner y wrist) | 15 acciones EE/pinza a 5 Hz | no disponible | Sin benchmarks ni licencia publicados; depende de tres artefactos congelados no incluidos |
| OpenVLA | Vision-language-action de proposito general | 7B (documentacion publica del proyecto) | Imagen unica y texto | Acciones discretizadas | Licencia basada en Llama 2 (verificar) | Orientado a generalizacion multi-tarea y a instrucciones en lenguaje; este modelo no acepta texto |
| Octo | Politica transformer con difusion | 27M y 93M (documentacion publica del proyecto) | Imagenes y comandos | Acciones continuas | codigo abierto (verificar terminos) | Entrenado con datasets heterogeneos de robot; este decoder esta atado a una tarea y un contrato de accion concretos |
| ACT (Action Chunking with Transformers) | Transformer de action chunking | no disponible | Imagenes | Chunks de acciones | codigo abierto (verificar terminos) | Comparte el esquema de prediccion por chunks; este modelo anade condicionamiento por un world model de video |
| Diffusion Policy | Politica generativa por difusion | no disponible | Imagenes | Trayectorias de acciones | codigo abierto (verificar terminos) | Enfoque alternativo sin world model explicito; no se dispone de comparacion empirica con este checkpoint |

## Limitaciones y advertencias

- Licencia no declarada. Sin terminos de uso publicados, el uso comercial o la redistribucion quedan en una situacion juridica indeterminada; conviene contactar con el autor antes de cualquier despliegue.
- Ausencia total de validacion externa. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, de modo que no existe evidencia independiente de que el checkpoint funcione segun lo descrito.
- Sin benchmarks. No hay tasas de exito, metricas de error de posicion ni comparaciones con checkpoints anteriores del mismo pipeline (por ejemplo, la iteracion 2374 del decoder WidowX del que parte).
- Reproducibilidad dependiente de artefactos externos. El backbone Video2World inicial, el decoder inicial, el LoRA de video congelado y el dataset no se incluyen en el repositorio; sin acceso a todos ellos con los commits exactos, el checkpoint no puede ejecutarse ni evaluarse.
- Generalizacion muy limitada. El entrenamiento se circunscribe a una tarea (RoboSuite `level4`), un robot (Panda) y una variante de texturas, con solo 162 episodios. No hay indicios de que funcione en otros entornos, objetos o morfologias.
- Dependencia del marco de referencia. Las acciones son relativas a la pose alcanzada actual en `widowx_reference_base/teleop_aligned_tool`; cualquier integracion que ignore ese contrato producira comandos incorrectos. La mezcla de nomenclatura WidowX y Panda en los identificadores exige cuidado adicional al emparejar checkpoints.
- Horizonte de control corto. Cada chunk cubre 3 segundos (15 acciones a 5 Hz) y se ejecuta tipicamente en lazo abierto; el error se acumula entre chunks y no se documenta ningun mecanismo de correccion.
- Frecuencia de control baja. 5 Hz es insuficiente para tareas que requieran reaccion rapida o control de fuerza; el modelo esta pensado para manipulacion relativamente lenta.
- Riesgo de alucinacion en el sentido de los LLM no aplica, pero si existe riesgo de generar acciones fisicamente invalidas o inseguras, especialmente fuera de la distribucion del dataset. No se documenta ninguna capa de filtrado o de seguridad.
- Sesgos de dataset. Los datos provienen de teleoperacion humana con una configuracion de camaras concreta y texturas especificas; los sesgos de estilo de teleoperacion, iluminacion y disposicion de objetos se trasladaran a las predicciones.
- Sin soporte de lenguaje. El modelo no procesa instrucciones en texto, por lo que no puede usarse para control condicionado por lenguaje sin anadir componentes externos.
- Metadatos anomales. Las fechas de creacion y actualizacion registradas en HuggingFace (2026-09-15) son posteriores a la fecha habitual de consulta; conviene tratarlas con cautela.
- Sin informacion sobre cuantizacion ni pesos alternativos. No se ofrecen versiones GGUF, AWQ, GPTQ ni similares, lo que limita las opciones de despliegue en hardware modesto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dreamdifferent/panda-robosuite-level4-wrist-ablation-v1-videolora200-action-decoder-iter900
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-video-fused (commit `8e39d96344dea0a82ae673874a38206a6c412948`)
- Decoder de acciones inicial: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374 (commit `0ea6db91672db019d9d6dc9a6c9bd1ecc0504001`)
- LoRA de video congelado: https://huggingface.co/dreamdifferent/panda-robosuite-level4-wrist-ablation-v1-video-lora-iter200 (commit `24e15bdb2250e55e07a4af11f8f5022615362e6b`)
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-corner-wrist (commit `30163462034e94e79eec5890cf10504feed1966e`)
- MimicVideo: repositorio no enlazado en la model card; solo se proporciona el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Paper, blog o demo del modelo: no disponible
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces obtenidos correspondian a bibliografia sobre gestion de recursos humanos y se han descartado por no ser pertinentes.
