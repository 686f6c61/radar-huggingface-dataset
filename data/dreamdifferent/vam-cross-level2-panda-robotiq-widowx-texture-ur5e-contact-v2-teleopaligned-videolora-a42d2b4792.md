# dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-a42d2b4792

## Resumen

El repositorio `dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-a42d2b4792` contiene un checkpoint del decoder World2Action del framework MimicVideo, correspondiente a la iteracion 1800 de un entrenamiento que se detuvo por causa desconocida (`unknown`). No se trata de un modelo de lenguaje, sino de un modulo de prediccion de acciones para robotica: recibe observaciones visuales de dos camaras y el estado del robot, y produce comandos de efector final y gripper. El autor es `dreamdifferent` y el pipeline declarado en HuggingFace es `robotics`.

El checkpoint forma parte de una cadena de artefactos congelados: un backbone Video2World (`widowx250-video-fused`), un decoder de acciones inicial (`vam-cross-target-widowx250-native-2cam-action-decoder`), una LoRA de video congelada (`vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200`) y una version fijada de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`). Esto lo convierte en un artefacto de investigacion reproducible mas que en un modelo listo para produccion.

Su relevancia es acotada pero concreta: ilustra el patron "world model + decoder de acciones" para aprendizaje por imitacion desde video, con contrato de datos explicito (290 episodios, 54 508 frames, 15 acciones a 5 Hz, rotaciones en `rotation_6d`). El repositorio ocupa 1,0 GB, no tiene descargas ni likes, y no declara licencia, idiomas ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder de acciones World2Action sobre backbone Video2World con Video LoRA congelada (familia MimicVideo); estructura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de robotica; ventana temporal no declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica); no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene un checkpoint de 1,0 GB junto con `config.yaml` y un JSON de anclaje) |
| Iteracion del checkpoint | 1800 |
| Tamano del repositorio | 1,0 GB |
| Pipeline HuggingFace | robotics |
| Etiquetas | mimic-video, robotics, action-prediction |
| Fecha de creacion (segun HuggingFace) | 2026-09-10T09:22:27Z |
| Ultima actualizacion (segun HuggingFace) | 2026-09-10T09:22:59Z |

## Arquitectura y entrenamiento

El sistema es una composicion de piezas congeladas mas un decoder entrenable. El backbone Video2World parte de `dreamdifferent/widowx250-video-fused` (commit `f0cea76b62c5dd66b06b9f965932ddea32a7b546`) y lleva incorporada una LoRA de video congelada (`vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200`, commit `63fe745a3bfd4be7d40f9ca12b27d8804860d8f9`). Sobre esa representacion audiovisual actua el decoder de acciones, inicializado desde `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder` (commit `93750cccda01620e3c028477e4c49bc5c996a68d`). La ejecucion completa se identifica como `w2a_panda_robotiq_level2_widowx_texture_2cam_hstack_ur5e_contact_v2_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`, lo que sugiere apilado horizontal (`hstack`) de dos camaras como entrada y un objetivo de contacto (`contact_v2`) en el dataset.

El contrato de datos esta explicitamente documentado. El dataset (`dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2`, commit `96e2a04752bde8e5bab858b03c065dbdf944caef`) contiene 290 episodios y 54 508 frames (unas 188 observaciones por episodio), con dos camaras (`observation.images.corner_cam`, `observation.images.front_cam`). El objetivo son 15 acciones de efector final logrado y gripper a 5 Hz, con pose relativa a la pose actual lograda (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool` y rotacion codificada como `rotation_6d`. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF/DPO (no aplicables en este dominio). El autor indica que el conjunto de checkpoints completo (modelo, optimizador, scheduler y trainer) se verifico antes de seleccionar el peso subido, y que ni el dataset ni las entradas congeladas se incluyen en el repositorio.

## Capacidades

- Prediccion de acciones de efector final y gripper: 15 dimensiones de accion a 5 Hz a partir de observaciones de dos camaras mas estado del robot.
- Control relativo a la pose actual lograda, con representacion de rotacion `rotation_6d`, lo que facilita el control continuo en espacio cartesiano.
- Acondicionamiento por video mediante LoRA de video congelada, lo que apunta a generacion/prediccion de representaciones espacio-temporales (marco MimicVideo) mas que a politica pura de estado.
- Transferencia entre plataformas: el nombre del run menciona de forma conjunta Panda, Robotiq, WidowX y UR5e, lo que indica un diseno orientado a cross-embodiment y a tareas de contacto.
- Entrada multi-camara con apilado (`hstack`) de dos vistas: `corner_cam` y `front_cam`.
- Uso como decoder de acciones independiente, reutilizable sobre un backbone Video2World fijo.
- Tool calling / function calling: no disponible (no es una capacidad del modelo).
- Comportamiento agentico multi-paso: no disponible en el sentido de LLM; la planificacion, si existe, es implicita en la politica de control.
- Capacidades multilingues: no aplica.
- Capacidades de vision/audio de alto nivel (descripcion, VQA): no disponible.

## Casos de uso

- Manipulacion robotica con contacto: el modelo se entrena especificamente en un dataset de contacto (`contact_v2`), por lo que encaja en tareas de empuje, insercion o agarre donde la politica debe reaccionar a fuerzas de contacto y no solo a posiciones libres.
- Transferencia cross-embodiment en laboratorio: dado que el run referencia simultaneamente Panda, WidowX y UR5e con efector Robotiq, puede usarse como punto de partida para evaluar cuanto del decoder es reutilizable entre brazos y grippers distintos, partiendo del checkpoint ya entrenado en lugar de desde cero.
- Aprendizaje por imitacion a partir de video: la combinacion de backbone Video2World mas decoder de acciones permite entrenar politicas a partir de grabaciones de teleoperacion con solo dos camaras, reduciendo la dependencia de sensores propietarios o de estados privilegiados.
- Fine-tuning sobre un backbone congelado: al estar el backbone y la LoRA congelados, el coste de reentrenamiento se concentra en el decoder; util para iterar rapido sobre nuevos datasets de la misma plataforma sin reentrenar el modelo de video.
- Reproducibilidad de experimentos: el repositorio fija commits exactos de cada componente (MimicVideo, backbone, decoder inicial, LoRA), lo que permite reproducir la iteracion 1800 en un entorno controlado para auditoria o comparacion entre iteraciones.
- Evaluacion de world models en robotica: sirve como referencia para medir si una representacion de video aprendida aporta ventaja frente a decoders que consumen solo estado, comparando tasas de exito en las mismas tareas.
- Investigacion sobre datos de teleoperacion alineada: el uso de `teleop_aligned_tool` como marco de referencia es util para proyectos que quieran homogeneizar datos de teleoperacion de distintos operadores y plataformas antes de entrenar.
- Linea base en competiciones o benchmarks internos de manipulacion: al ser un checkpoint publico con contrato de datos definido, puede actuar como baseline frente a politicas propias en el mismo conjunto de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tasas de exito, metricas de error de accion ni comparaciones con otras politicas en la model card, y el repositorio registra 0 descargas y 0 likes, sin evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 1,0 GB, lo que sugiere un checkpoint del orden de cientos de millones de parametros segun la precision de almacenamiento; esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponibles. Dado el tamano del artefacto, es probable que quepa en GPUs de gama consumer reciente, pero no hay confirmacion ni requisitos declarados.
- Compatibilidad con GPU consumer: probable pero no confirmada; no se especifican modelos concretos (RTX 4090, RTX 3090, etc.).
- Restriccion temporal de inferencia: el contrato de datos define acciones a 5 Hz, lo que implica un presupuesto de 200 ms por paso de control. Cualquier despliegue debe respetar ese limite para no degradar el control; no se aportan mediciones de latencia reales.
- Opciones de despliegue: no disponibles. El repositorio contiene un `config.yaml` y un JSON de anclaje, pero no se documenta integracion con vLLM, llama.cpp, Ollama, TGI ni con stacks roboticos concretos (ROS 2, LeRobot, etc.).
- Throughput estimado: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa con alternativas. Se listan los artefactos directamente relacionados en la cadena declarada por el autor, que son los unicos comparables documentados en la informacion disponible:

| Artefacto | Rol | Relacion con este checkpoint |
|---|---|---|
| `dreamdifferent/widowx250-video-fused@f0cea76b...` | Backbone Video2World inicial | Entrada congelada; aporta la representacion de video |
| `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750ccc...` | Decoder de acciones inicial | Punto de partida antes del entrenamiento de la iteracion 1800 |
| `dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200@63fe745a...` | LoRA de video | Componente congelado que especializa el backbone en el dominio de la tarea |

Comparacion con familias externas de politicas de manipulacion (por ejemplo, OpenVLA, Octo o Diffusion Policy): no disponible en la informacion proporcionada. No se han facilitado parametros, contexto ni metricas de este checkpoint que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, por lo que no hay autorizacion explicita para uso comercial ni para redistribucion. Debe tratarse como material sin derechos claros hasta consultar al autor.
- Entrenamiento interrumpido: la ejecucion se detuvo por causa desconocida (`unknown`), por lo que no hay garantia de que la iteracion 1800 corresponda al mejor checkpoint de la curva de entrenamiento.
- Cero validacion externa: 0 descargas y 0 likes implican que no existen evaluaciones independientes ni evidencia publica de rendimiento en tareas reales.
- Dependencias congeladas no incluidas: el checkpoint requiere un backbone, una LoRA de video y un decoder inicial concretos, ademas del commit `e3355dbc...` de MimicVideo. Sin esas piezas no es funcional, y el repositorio no las empaqueta.
- Dataset no incluido: los 290 episodios y 54 508 frames no se distribuyen, lo que impide reproducir el entrenamiento o auditar la composicion de los datos.
- Sesgos de dominio: el entrenamiento se limita a un montaje concreto de dos camaras (`corner_cam`, `front_cam`), un marco de referencia de teleoperacion especifico y tareas con contacto. El rendimiento fuera de esa configuracion de camaras, de ese marco o de esas tareas no esta caracterizado.
- Riesgo de fallo en tareas de contacto: en manipulacion con contacto, los errores de prediccion de accion pueden provocar colisiones, daños en el efector o en el objeto, o bloqueos del robot. Se requiere supervision humana y limites de seguridad en el controlador.
- Sin evaluacion de robustez: no hay datos sobre sensibilidad a cambios de iluminacion, oclusiones, calibracion de camaras o variaciones del objeto.
- Sin soporte declarado de idiomas ni de texto: no puede emplearse en tareas conversacionales, de codigo o de razonamiento simbolico.
- Sin garantias de latencia: aunque el objetivo es 5 Hz, no se publican mediciones de tiempo de inferencia ni de estabilidad temporal del control.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-a42d2b4792
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decoder de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de video congelada: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200
- Dataset de entrenamiento: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2
- Commit de MimicVideo referenciado: `e3355dbc93132b576c02f920a59b4fc18a4f5906` (no se proporciona URL del repositorio)
- Paper o blog tecnico del modelo: no disponible
- Demo publica: no disponible
- Resto de resultados de busqueda web: no relevantes (paginas de inicio de sesion de un servicio de informacion empresarial, sin relacion con el modelo)
