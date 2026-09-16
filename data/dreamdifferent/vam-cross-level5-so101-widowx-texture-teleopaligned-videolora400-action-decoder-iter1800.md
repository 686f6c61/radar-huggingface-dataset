# dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter1800

## Resumen

VAM-Cross MimicVideo World2Action decoder es un checkpoint de decodificador de acciones para robótica publicado por el usuario `dreamdifferent` en Hugging Face. No es un modelo de lenguaje ni un modelo generativo de propósito general: se trata de la cabeza de decodificación que transforma las representaciones internas de un backbone de vídeo (Video2World, `widowx250-video-fused`) en comandos motores de bajo nivel. Concretamente, produce 15 acciones de efector final y pinza a 5 Hz, con rotación expresada en `rotation_6d` y objetivo de pose relativo a la pose alcanzada actual (`relative_to_current_achieved_pose`) en el sistema `widowx_reference_base/teleop_aligned_tool`.

El checkpoint corresponde a la iteración 1800 del run `w2a_so101_level5_widowx_texture_2cam_hstack_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1`, un entrenamiento que se detuvo por una causa declarada como `unknown`. Según la model card, antes de seleccionar el peso subido se verificó el conjunto completo más reciente de checkpoints de modelo, optimizador, planificador y entrenador. El repositorio pesa 1,0 GB e incluye, además del peso, un JSON con las dependencias fijadas y un `config.yaml` efectivo.

Su relevancia es acotada y de nicho: sirve como pieza reproducible dentro de la familia VAM-Cross para manipulación robótica con dos cámaras, y solo es utilizable junto con los cuatro artefactos congelados exactos (backbone, decodificador inicial y LoRA de vídeo) fijados por hash de commit. No tiene descargas ni interacciones en el momento de redactar esta ficha, no declara licencia y no publica benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action (W2A) sobre backbone de video Video2World congelado; no se especifica la arquitectura interna del decodificador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara una arquitectura MoE) |
| Longitud de contexto | no aplica como contexto de lenguaje; el modelo consume ventanas de observacion de video; la longitud de ventana no se especifica |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni GGUF) |
| Idiomas soportados | no aplica / no disponible (modelo de accion robotica, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | no se especifica; el repositorio incluye el peso del decodificador, un JSON con dependencias fijadas y un `config.yaml` efectivo |
| Dimension de la accion | 15 acciones de efector final y pinza por paso |
| Frecuencia de control | 5 Hz |
| Representacion de rotacion | `rotation_6d` |
| Camaras de entrada | `observation.images.corner_cam`, `observation.images.front_cam` |
| Tamano del repositorio | 1,0 GB |
| Dataset asociado | `dreamdifferent/vam-cross-level5-so101-widowx-texture` (158 episodios / 54 261 fotogramas) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un decodificador World2Action entrenado sobre una pila congelada. Los componentes congelados obligatorios son: el backbone inicial Video2World `dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546`, un decodificador de acciones inicial `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d` y una LoRA de video congelada `dreamdifferent/vam-cross-level5-so101-widowx-texture-video-lora-iter-400@ac66c3ec7c3b42ecbeb3e7cce14dff980e0d8081`. La infraestructura de entrenamiento es MimicVideo, fijada en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`. No se detalla si el decodificador es un transformer, una MLP o un modulo de difusion; ese dato no esta disponible.

El contrato de datos y acciones es explicito: se entreno sobre el dataset `dreamdifferent/vam-cross-level5-so101-widowx-texture@48a60c558c29d7932b94303fb3bfae994848e627`, con 158 episodios y 54 261 fotogramas, dos vistas de camara apiladas horizontalmente (`hstack` segun el nombre del run) y grabaciones de teleoperacion alineadas (`widowx_teleop_recording_frame_v1`). El objetivo de prediccion son 15 acciones de efector final y pinza a 5 Hz, con pose relativa a la pose alcanzada actual en el marco `teleop_aligned_tool` y rotacion en `rotation_6d`. El run se detuvo por una causa etiquetada como `unknown`; no se documentan fases de RLHF, DPO ni ajuste por preferencias, algo por otra parte esperable en un decodificador de acciones y no en un modelo conversacional. Tampoco se describe ninguna innovacion de decodificacion (por ejemplo, decodificacion especulativa), porque no aplica en este dominio.

## Capacidades

- Prediccion de acciones motoras: genera vectores de 15 dimensiones correspondientes a la pose del efector final y el estado de la pinza, a una frecuencia de 5 Hz.
- Control visomotor con dos camaras: consume simultaneamente las vistas `observation.images.corner_cam` y `observation.images.front_cam`.
- Representacion de orientacion: emite rotaciones en formato `rotation_6d`, aptas para conversion a cuaterniones o matrices de rotacion sin singularidades de Euler.
- Control relativo: el objetivo de pose es relativo a la pose alcanzada actual, lo que favorece la estabilidad en lazos cerrados de control.
- Imitacion de teleoperacion: aprende de grabaciones de teleoperacion alineadas en el marco `teleop_aligned_tool`, por lo que reproduce estilos de movimiento humanos sobre el hardware Widow X.
- Integracion con backbone de video: funciona como cabeza de decodificacion sobre caracteristicas de un modelo Video2World congelado, lo que permite reentrenar solo el decodificador.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, vision semantica general, audio ni generacion de texto.
- No tiene capacidades multilingues: no procesa ni genera lenguaje natural.

## Casos de uso

- Control de bajo nivel de un brazo Widow X 250: el decodificador genera comandos de efector final y pinza a 5 Hz a partir de dos camaras, y se usaria como politica de accion dentro del lazo de control, con un planificador o una politica de alto nivel por encima.
- Investigacion en manipulacion visomotora: sirve para reproducir experimentos de la familia VAM-Cross fijando por hash los cuatro artefactos congelados, de modo que cualquier variacion de resultado sea atribuible al decodificador y no al resto de la pila.
- Aprendizaje por imitacion sobre nuevos datasets: al estar congelados el backbone y la LoRA de video, el decodificador se puede reentrenar sobre dominios nuevos (otras texturas, otras tareas de manipulacion) con un coste computacional muy inferior al de reentrenar el backbone completo.
- Preanotacion de episodios de teleoperacion: el modelo puede generar trayectorias candidatas de acciones sobre grabaciones nuevas para su revision y correccion por un operador, acelerando la construccion de datasets.
- Evaluacion comparativa de arquitecturas World2Action: permite contrastar variantes de decodificador manteniendo constante el resto de la pila, con metricas de error de pose y tasa de exito en tareas concretas.
- Reproducibilidad y trazabilidad de experimentos: el repositorio incluye un JSON de dependencias fijadas y un `config.yaml` efectivo, por lo que se puede reconstruir con precision el entorno de entrenamiento en un pipeline de MLOps interno.
- Estimacion de coste de despliegue en robotica de investigacion: al ser un decodificador relativamente pequeno (repositorio de 1,0 GB incluyendo configuracion), es candidato a ejecutarse en la misma maquina que controla el brazo si el backbone de video se sirve en un nodo aparte.
- Docencia y formacion en robotica: uso como ejemplo didactico de politica visomotora con contrato de datos explicito (camaras, frecuencia, marco de referencia, representacion de rotacion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en tareas, error de pose, ni comparaciones cuantitativas con otros decodificadores. Tampoco se reportan metricas de latencia o de throughput. La busqueda web realizada no devolvio resultados relevantes sobre este modelo: unicamente apariciones de la plataforma YouTube sin relacion con el repositorio.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio pesa 1,0 GB, pero no se desglosa cuanto corresponde al peso del decodificador y cuanto a los ficheros de configuracion; ademas, la inferencia real requiere cargar simultaneamente el backbone `widowx250-video-fused` y la LoRA de video congelada, cuyo consumo no se documenta.
- GPU recomendadas: no disponible. No se publican requisitos de GPU ni resultados de entrenamiento que permitan inferirlos.
- Viabilidad en GPU de consumo: no se puede confirmar. El tamano del checkpoint del decodificador sugiere que la cabeza podria caber en una GPU de consumo, pero el cuello de botella probable es el backbone de video, cuyo consumo es desconocido. Cualquier afirmacion al respecto seria especulativa.
- Opciones de despliegue: el modelo requiere PyTorch y la infraestructura MimicVideo en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles. El contrato temporal es de 5 Hz, es decir, 200 ms por paso de control, pero no se documenta si el modelo cumple ese presupuesto en algun hardware concreto.
- Almacenamiento: 1,0 GB solo para este repositorio, mas el espacio de los cuatro artefactos congelados y el dataset de entrenamiento (no incluidos).

## Comparativa con modelos similares

La informacion disponible no identifica alternativas de terceros comparables. Si se pueden contrastar los componentes de la propia familia VAM-Cross citados en la model card, que ocupan la misma categoria funcional (decodificacion de acciones para manipulacion):

| Componente | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...action-decoder-iter1800`) | Decodificador World2Action entrenado, iteracion 1800 | no disponible | no aplica | no disponible | Publico en Hugging Face, 0 descargas |
| `vam-cross-target-widowx250-native-2cam-action-decoder` | Decodificador de acciones inicial, entrada congelada del entrenamiento | no disponible | no aplica | no disponible | Publico en Hugging Face, commit fijado `93750cc` |
| `vam-cross-level5-so101-widowx-texture-video-lora-iter-400` | LoRA de video congelada, iteracion 400 | no disponible | no aplica | no disponible | Publico en Hugging Face, commit fijado `ac66c3e` |
| `widowx250-video-fused` | Backbone Video2World inicial, congelado | no disponible | no aplica | no disponible | Publico en Hugging Face, commit fijado `f0cea76` |

No se dispone de datos de rendimiento de ninguno de ellos, por lo que la comparativa se limita a rol funcional y trazabilidad de versiones.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial. Cualquier despliegue en produccion queda en un limbo legal hasta que el autor la defina.
- Dependencia estricta de artefactos congelados: el modelo solo es valido con el backbone, el decodificador inicial y la LoRA de video en los commits exactos indicados. Sustituir cualquiera de ellos invalida el checkpoint.
- Semilla de entrenamiento interrumpida: el run se detuvo por una causa registrada como `unknown`, lo que impide descartar una convergencia incompleta o una condicion anomala en la iteracion 1800.
- Inconsistencia de nomenclatura: el nombre del run menciona `action_iter2374` y `videolora_iter400`, mientras que el checkpoint publicado corresponde a la iteracion 1800. Conviene verificar el `config.yaml` efectivo antes de asumir la correspondencia.
- Dataset no incluido: los datos de entrenamiento (158 episodios, 54 261 fotogramas) no se distribuyen con el modelo, lo que limita la auditoria de sesgos y la reproducibilidad completa.
- Riesgo de sobreajuste: 158 episodios es un volumen reducido para una politica visomotora; es esperable una degradacion ante texturas, iluminaciones, fondos u objetos distintos de los del dataset `widowx250-texture`.
- Especificidad de hardware y marco: entrenado para Widow X 250 con el marco `widowx_reference_base/teleop_aligned_tool`; no es transferible directamente a otros brazos ni a otras definiciones de pose sin recalibracion.
- Frecuencia de control limitada: 5 Hz (200 ms por paso) es insuficiente para tareas que requieran reaccion rapida, como insercion de precision o manipulacion dinamica.
- Ausencia de garantias de seguridad: no se documentan limites de par, paradas de emergencia ni envolventes de seguridad. No debe conectarse a hardware real sin una capa de supervision independiente.
- Alucinacion en el sentido de acciones no validas: como toda politica aprendida, puede emitir comandos fisicamente inviables o incoherentes con la escena, especialmente fuera de la distribucion de entrenamiento.
- Sin benchmarks: no hay evidencia publicada de tasa de exito ni de error de pose, por lo que no se puede recomendar su uso en produccion con base en datos.
- Sin soporte comunitario: cero descargas y cero interacciones en el momento de la consulta, lo que reduce la probabilidad de encontrar issues resueltos o integraciones de terceros.
- Restricciones de idioma y despliegue: al ser un modelo de accion, no procesa lenguaje; no cabe esperar capacidades conversacionales, de recuperacion de informacion ni de generacion de codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter1800
- Backbone Video2World congelado (`widowx250-video-fused`, commit `f0cea76`): https://huggingface.co/dreamdifferent/widowx250-video-fused/tree/f0cea76b62c5dd66b06b9f965932ddea32a7b546
- Decodificador de acciones inicial (`vam-cross-target-widowx250-native-2cam-action-decoder`, commit `93750cc`): https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder/tree/93750cccda01620e3c028477e4c49bc5c996a68d
- LoRA de video congelada (`vam-cross-level5-so101-widowx-texture-video-lora-iter-400`, commit `ac66c3e`): https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-video-lora-iter-400/tree/ac66c3ec7c3b42ecbeb3e7cce14dff980e0d8081
- Dataset asociado (`vam-cross-level5-so101-widowx-texture`, commit `48a60c5`): https://huggingface.co/datasets/dreamdifferent/vam-cross-level5-so101-widowx-texture/tree/48a60c558c29d7932b94303fb3bfae994848e627
- MimicVideo: no se proporciona URL del repositorio, solo el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`.
- Paper, blog o demo: no disponibles. La busqueda web no devolvio resultados relevantes sobre este modelo.
