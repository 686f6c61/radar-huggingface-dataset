# dreamdifferent/panda-robosuite-level5-wrist-ablation-v1-videolora200-action-decoder-iter900

## Resumen

Este repositorio contiene un decodificador de acciones (World2Action decoder) perteneciente al proyecto VAM-Cross MimicVideo, publicado por el usuario dreamdifferent. No se trata de un modelo de lenguaje, sino de un componente de control robótico: traduce representaciones latentes de vídeo (generadas por un backbone Video2World con una LoRA de vídeo congelada) en secuencias de acciones de efector final y pinza para un brazo Panda en el entorno RoboSuite. El checkpoint corresponde a la iteración 900 de un entrenamiento cuya ejecución se detuvo por un motivo registrado como `unknown`.

La relevancia de esta publicación es fundamentalmente de investigación: forma parte de una ablación sistemática sobre el uso de cámara de muñeca (wrist ablation) en políticas de manipulación guiadas por vídeo, y comparte el ecosistema de checkpoints congelados de MimicVideo, incluido un backbone Video2World inicial y un decodificador de acciones inicial, ambos identificados por commit. El tamaño del repositorio es de 1,0 GB, no se declara licencia ni idiomas, y el pipeline indicado en HuggingFace es `robotics`.

Al no existir model card pública más allá de la ficha técnica de contratos de entrada y datos, ni resultados de benchmarks, ni información sobre arquitectura interna del decodificador, buena parte de las especificaciones habituales (número de parámetros, contexto, cuantizaciones, idiomas) figuran como no disponibles. La información sí permite, en cambio, reconstruir con precisión el contrato de acciones y el conjunto de datos asociado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (decodificador World2Action sobre backbone Video2World con LoRA de video congelada; no es un modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de accion, no de lenguaje); el contrato define 15 acciones objetivo a 5 Hz por prediccion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 1,0 GB e incluye un JSON fijado y un `config.yaml` efectivo) |
| Pipeline declarado | robotics |
| Etiquetas | mimic-video, robotics, action-prediction, region:us |
| Tamano del repositorio | 1,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13T12:10:27.000Z |
| Fecha de actualizacion | 2026-09-13T12:10:59.000Z |

## Arquitectura y entrenamiento

El modelo se presenta como el decodificador World2Action de la iteracion 900 de la ejecucion `w2a_panda_robosuite_level5_2cam_wrist_ablation_v1_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`. La ejecucion se detuvo con motivo `unknown`. Antes de seleccionar el peso subido, se verifico el conjunto mas reciente y completo de checkpoints de modelo, optimizador, scheduler y trainer, segun indica la propia model card.

El entrenamiento depende de cuatro entradas congeladas, fijadas por commit: el repositorio MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`), el backbone Video2World inicial `dreamdifferent/widowx250-wrist-ablation-v1-video-fused@8e39d96344dea0a82ae673874a38206a6c412948`, el decodificador de acciones inicial `dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374@0ea6db91672db019d9d6dc9a6c9bd1ecc0504001` y la LoRA de video congelada `dreamdifferent/panda-robosuite-level5-wrist-ablation-v1-video-lora-iter200@2c9643d02c8aedfde187ba456a6d02a3ec3cb259`. El conjunto de datos y las entradas congeladas no se incluyen en el repositorio; deben reproducirse a partir de los identificadores y del `config.yaml` efectivo aportado.

## Capacidades

- Prediccion de acciones de efector final y pinza para un brazo Panda en RoboSuite, a partir de representaciones de video.
- Generacion de secuencias de 15 acciones objetivo a 5 Hz (equivalente a 3 segundos de control por prediccion).
- Prediccion de pose en el espacio `relative_to_current_achieved_pose`, expresada en el marco `widowx_reference_base/teleop_aligned_tool`.
- Representacion de rotacion mediante `rotation_6d`.
- Consumo de dos vistas de camara: `observation.images.corner_cam` y `observation.images.wrist_cam`.
- Forma parte de un estudio de ablacion sobre el uso de la camara de muñeca en politicas guiadas por video.
- No se documentan capacidades de generacion de lenguaje, razonamiento simbolico, codigo, tool calling, agentes, vision general ni audio.

## Casos de uso

- Investigacion en aprendizaje por imitacion guiado por video: el checkpoint sirve como punto de comparacion dentro de una ablacion de camara de muñeca, permitiendo medir el efecto de esa vista sobre la politica de control.
- Reproduccion de experimentos de manipulacion en RoboSuite: al fijarse los commits de MimicVideo, backbone y LoRA, un laboratorio puede reconstruir exactamente las condiciones de entrenamiento del checkpoint.
- Evaluacion de decodificadores World2Action: el modelo permite estudiar como se traduce una representacion latente de video en acciones continuas de efector final, con un contrato de accion explicito y verificable.
- Generacion de datos sinteticos de trayectorias: las predicciones a 5 Hz pueden emplearse para producir secuencias de control sobre el entorno Panda, sujetas a validacion en simulador.
- Estudio de sensores enpoliticas de robotica: al tratarse de una variante de ablacion `wrist`, resulta util para cuantificar cuanto aporta la camara de muñeca frente a la camara de esquina.
- Base para ajuste fino en tareas de manipulacion especificas: al ser un decodificador, puede reentrenarse sobre el contrato de datos `vam-cross-level5-panda-robosuite-widowx-texture-corner-wrist` con otras texturas o condiciones.
- Analisis de estabilidad de entrenamiento: dado que la ejecucion se detuvo por `unknown`, el checkpoint es material de estudio para diagnosticar interrupciones y seleccion de pesos en pipelines de entrenamiento largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion, ni comparaciones cuantitativas con otros checkpoints de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el numero de parametros ni la precision de los pesos.
- Tamano en disco del repositorio: 1,0 GB, dato que acota el orden de magnitud del checkpoint, pero que no permite derivar requisitos de VRAM con rigor.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; no puede confirmarse sin conocer la arquitectura y la precision de pesos.
- Opciones de despliegue: no disponibles. El repositorio no documenta integraciones con vLLM, llama.cpp, Ollama, TGI ni similares, y ademas se trata de un modelo de acciones, no de texto.
- Latencia y throughput: no disponibles. El unico dato temporal es la frecuencia de control del contrato de acciones, 5 Hz.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La categoria funcional es la de decodificadores de accion o cabezas de control para manipulacion robotica entrenadas por imitacion (familias como Octo, OpenVLA o pi0), pero no se aportan parametros, contexto, rendimiento ni licencia de este checkpoint, por lo que cualquier tabla comparativa seria especulativa.

| Modelo | Categoria | Parametros | Licencia | Datos comparativos |
|---|---|---|---|---|
| panda-robosuite-level5-wrist-ablation-v1-videolora200-action-decoder-iter900 | Decodificador de acciones robotico | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria (p. ej. decodificadores tipo Octo, OpenVLA, pi0) | Decodificador de acciones robotico | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que no puede asumirse ningun permiso de uso comercial.
- La ejecucion de entrenamiento se detuvo por un motivo registrado como `unknown`; no hay garantia de que el checkpoint corresponda a un estado optimo de convergencia.
- El modelo esta especializado en un unico entorno (RoboSuite con brazo Panda) y en un conjunto de datos concreto de 166 episodios y 54 264 fotogramas, con dos camaras y una configuracion de textura determinada; se desconoce su capacidad de generalizacion fuera de ese dominio.
- El conjunto de datos y las entradas congeladas no se incluyen en el repositorio, lo que dificulta la reproduccion independiente sin acceso a los artefactos referenciados.
- No se documentan sesgos, riesgos de alucinacion en el sentido linguistico (no aplica al no ser un modelo de lenguaje), ni limitaciones de idioma. En su lugar, el riesgo relevante es el fallo de control fisico: acciones imprecisas o inestables al transferir la politica a un robot real.
- No se declara el numero de parametros, la precision de pesos ni el formato, lo que impide planificar recursos de despliegue con fiabilidad.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia de validacion por parte de la comunidad.
- Las fechas de creacion y actualizacion indicadas (2026) deben tratarse con cautela segun la fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/panda-robosuite-level5-wrist-ablation-v1-videolora200-action-decoder-iter900
- Backbone Video2World inicial (referenciado): https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-video-fused
- Decodificador de acciones inicial (referenciado): https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374
- LoRA de video congelada (referenciada): https://huggingface.co/dreamdifferent/panda-robosuite-level5-wrist-ablation-v1-video-lora-iter200
- Conjunto de datos (referenciado): https://huggingface.co/datasets/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-corner-wrist
- Repositorio MimicVideo (commit fijado): commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`, sin URL publica confirmada en la informacion disponible
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los unicos enlaces recuperados correspondian a paginas comerciales de Apple y no guardan relacion con el contenido de la ficha.
