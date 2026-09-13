# dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-0f53c1d0e7

## Resumen

El modelo con identificador `dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-0f53c1d0e7` es un checkpoint del decodificador de acciones (World2Action, W2A) perteneciente al pipeline MimicVideo, publicado por el usuario `dreamdifferent`. No se trata de un modelo de lenguaje: su funcion es convertir representaciones latentes de video (producidas por un backbone Video2World con una LoRA de video congelada) en comandos de accion para un brazo robotico Widow X en tareas de manipulacion. En concreto, el checkpoint genera secuencias de 15 acciones de efector final y pinza a 5 Hz, expresadas como pose relativa y con representacion de rotacion `rotation_6d`.

El checkpoint corresponde a la iteracion 1800 de la ejecucion `w2a_panda_robosuite_level5_widowx_texture_2cam_hstack_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1`, que se detuvo por una causa registrada como `unknown`. El autor indica que se verifico el ultimo conjunto completo de pesos de modelo, optimizador, scheduler y trainer antes de seleccionar el peso publicado, lo que lo situa como un artefacto de investigacion intermedio y no como un modelo final validado.

Su relevancia es acotada y muy especifica: sirve como ejemplo reproducible del contrato de datos de MimicVideo (dos camaras apiladas horizontalmente, target teleoperado, referencia de pose `relative_to_current_achieved_pose`) para investigadores que trabajen en world models aplicados a robotica. El repositorio ocupa 1,0 GB, no acumula descargas ni likes en el momento de la consulta, y no incluye ni el dataset ni los pesos congelados de los que depende, por lo que no es un artefacto desplegable de forma autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de acciones World2Action sobre backbone Video2World con LoRA de video congelada (framework MimicVideo); no se especifica el tipo interno de red |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Horizonte de accion | 15 acciones consecutivas (chunk), equivalentes a 3 s a 5 Hz |
| Frecuencia de control | 5 Hz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de accion robotica, no procesa lenguaje natural); no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 1,0 GB; el autor indica que incluye `config.yaml` efectivo y un JSON pinneado) |
| Camaras de entrada | `observation.images.corner_cam`, `observation.images.front_cam` (apiladas en horizontal, segun el nombre del run) |
| Representacion de rotacion | `rotation_6d` |
| Referencia de pose | `relative_to_current_achieved_pose` en el marco `widowx_reference_base/teleop_aligned_tool` |
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture@0d9dcf500cbde6d2f522f462cce8aa041c8594ab`, 166 episodios / 54 264 frames |
| Iteracion publicada | 1800 |
| Tarea | robotics / action-prediction / mimic-video |

## Arquitectura y entrenamiento

La informacion disponible describe un pipeline de dos etapas mas que una arquitectura cerrada. Por un lado existe un backbone Video2World inicial, `dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546`, y una LoRA de video congelada, `dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-400@3d722974c40273abf77bf1c85c72717ca4ad7648`. Por otro, un decodificador de acciones inicial, `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d`. El checkpoint publicado es la version afinada de ese decodificador tras 1800 iteraciones dentro del framework MimicVideo, en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`. No se detalla el numero de parametros, la profundidad, el mecanismo de atencion ni si el backbone generativo de video emplea difusion u otra formulacion.

El contrato de datos si esta descrito con precision. El entrenamiento parte del dataset `vam-cross-level5-panda-robosuite-widowx-texture`, con 166 episodios y 54 264 frames anotados con dos vistas de camara. El objetivo de prediccion son 15 acciones de efector final y pinza a 5 Hz (`15 achieved-EE/gripper actions at 5 Hz`), con pose relativa respecto a la pose actual alcanzada y rotacion en `rotation_6d`. El nombre del run sugiere un entrenamiento en dos fases (una de accion hasta la iteracion 2374 y otra de LoRA de video hasta la 400), pero no se aportan detalles sobre funcion de perdida, regimen de congelacion de capas, uso de RLHF/DPO (no aplicable aqui) ni composicion completa del dataset.

Un dato relevante para la reproducibilidad es que la ejecucion se detuvo por una causa registrada como `unknown` y que ni el dataset ni los inputs congelados se distribuyen en este repositorio. El autor remite a un JSON pinneado y al `config.yaml` efectivo incluidos en el propio repo para reconstruir la configuracion.

## Capacidades

- Prediccion de acciones de manipulacion: genera chunks de 15 acciones de efector final y pinza a partir de dos vistas de camara, con pose relativa y rotacion `rotation_6d`.
- Acondicionamiento por video: consume representaciones del backbone Video2World mas la LoRA de video congelada, lo que lo integra en un esquema de world model video-a-accion.
- Control a 5 Hz: el horizonte de 15 acciones cubre 3 s de trayectoria por inferencia, adecuado para control por chunks con re-planificacion.
- Alineacion con teleoperacion: el target `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` esta pensado para politicas aprendidas por imitacion de demostraciones teleoperadas.
- Uso como punto de partida para fine-tuning: al ser un checkpoint intermedio con configuracion versionada, puede servir de inicializacion en reentrenamientos sobre el mismo contrato de datos.
- Capacidades que no posee: no hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general, audio ni modo de pensamiento. No es un modelo multimodal de proposito general.

## Casos de uso

- Manipulacion con brazo Widow X en laboratorio: el decodificador traduce dos vistas de camara en 15 acciones de efector final y pinza a 5 Hz, suficiente para ejecutar un tramo corto de una tarea de pick-and-place con re-planificacion cada 3 s.
- Aprendizaje por imitacion a partir de teleoperacion: el contrato de pose relativa y rotacion `rotation_6d` esta disenado para entrenar politicas que imiten demostraciones humanas capturadas con el mismo esquema de referencia.
- Investigacion en world models video-a-accion: sirve como componente de decodificacion dentro de MimicVideo para estudiar como las representaciones latentes de video se traducen en comandos motores.
- Reproduccion de experimentos: junto con el JSON pinneado y el `config.yaml` del repositorio, permite reconstruir el pipeline con los commits exactos de backbone, LoRA y dataset indicados por el autor.
- Fine-tuning sobre nuevos datasets de manipulacion: el checkpoint admite reentrenamiento sobre datos que respeten el mismo contrato (dos camaras apiladas, 15 acciones a 5 Hz, pose relativa, `rotation_6d`).
- Ablacion de componentes congelados: al estar identificados por commit el backbone Video2World, el decodificador inicial y la LoRA de video, es posible medir el efecto de sustituir cada pieza sobre el rendimiento del decodificador.
- Evaluacion en RoboSuite: aunque no se publican tasas de exito, el nombre del run vincula el entrenamiento a tareas de nivel 5 en Panda/RoboSuite con transferencia a Widow X, lo que permite integrarlo en un banco de pruebas simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, error de posicion, metricas de imitacion ni comparaciones numericas con otros checkpoints. Tampoco se documentan mediciones de latencia o throughput reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,0 GB, pero ese tamano no incluye el backbone Video2World ni la LoRA de video congelada, de modo que la memoria total necesaria es necesariamente superior y no puede calcularse con los datos publicados.
- GPU recomendadas: no disponible. No se especifican GPU de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no determinable con la informacion disponible, dado que se desconoce tanto el numero de parametros del decodificador como los requisitos del backbone congelado.
- Opciones de despliegue: no documentadas. Al no ser un modelo de lenguaje, las vias habituales (vLLM, llama.cpp, Ollama, TGI) no aplican; el uso previsto es la ejecucion del codigo de MimicVideo en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` con los artefactos congelados pinneados.
- Latencia y throughput: no se publican medidas. Como referencia derivada del contrato de datos, un bucle de control a 5 Hz implica un presupuesto de 200 ms por decision si se re-planifica en cada paso; el chunk de 15 acciones permite espaciar la inferencia hasta 3 s si se ejecuta en lazo abierto entre re-planificaciones.
- Almacenamiento: 1,0 GB para este checkpoint, mas el espacio adicional de los pesos congelados no incluidos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye parametros, metricas ni licencia de este checkpoint, y no se han identificado en el material de referencia modelos comparables de la misma categoria con datos verificables. Cualquier comparacion numerica con otros decodificadores de acciones o politicas de manipulacion (por ejemplo, variantes de diffusion policy o de VLA) requeriria datos que no constan.

## Limitaciones y advertencias

- Es un checkpoint intermedio (iteracion 1800) de una ejecucion detenida por una causa registrada como `unknown`, no un modelo final validado ni liberado tras una evaluacion exhaustiva.
- Depende de inputs congelados muy especificos, fijados por commit: backbone Video2World, decodificador inicial y LoRA de video. Cualquier desviacion de esas versiones invalida la reproducibilidad del checkpoint.
- El dataset y los pesos congelados no se incluyen en el repositorio, por lo que el modelo no es utilizable de forma autonoma tal cual se descarga.
- La licencia no esta declarada, lo que impide determinar si se permite el uso comercial; se debe tratar como artefacto de investigacion sin garantias.
- El entrenamiento se apoya en 166 episodios y 54 264 frames de una unica configuracion de robot y tarea, lo que implica un riesgo alto de sobreajuste y de degradacion fuera de la distribucion de entrenamiento.
- La entrada se limita a dos camaras (`corner_cam` y `front_cam`); no se documenta uso de propiocepcion, profundidad, fuerza ni tacto, de modo que el modelo carece de senales adicionales para corregir errores de contacto.
- No hay benchmarks ni tasas de exito publicadas: el riesgo de fallo silencioso en produccion es alto y no cuantificable con la informacion disponible.
- No se documentan sesgos, pero al ser un modelo de control entrenado con demostraciones teleoperadas, heredara las regularidades y los sesgos de ese operador y de esa configuracion de camaras.
- Riesgo de alucinacion en el sentido generativo: no aplica como texto, pero si existe riesgo de predicciones de accion fisicamente inconsistentes cuando la escena se aleja de lo visto en entrenamiento.
- El idioma no es un parametro relevante del modelo; cualquier expectativa de capacidades linguisticas o multimodales generales es infundada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-0f53c1d0e7
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de video congelada: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-400
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture
- Repositorio de MimicVideo: no disponible (solo se proporciona el hash de commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`)
- Paper o publicacion tecnica: no disponible
- Demo o espacio interactivo: no disponible
