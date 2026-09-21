# dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-56355f5f5f

## Resumen

VAM-Cross MimicVideo World2Action decoder es un checkpoint de decoder de acciones publicado por el usuario dreamdifferent en HuggingFace. No es un modelo de lenguaje: es la pieza que traduce una representacion de mundo basada en video (Video2World) a acciones de robot, dentro del framework MimicVideo. El repositorio contiene el decoder de la iteracion 900 de la ejecucion `w2a_panda_robotiq_level4_widowx_texture_2cam_hstack_ur5e_contact_v2_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1`, que finalizo con estado `completed`.

El modelo forma parte de una familia de experimentos "VAM-Cross" orientados a prediccion de acciones a partir de observaciones de camara, con nomenclatura que mezcla plataformas (Panda con pinza Robotiq, WidowX, UR5e) y una senal explicita de tareas con contacto. La salida son 15 acciones de efector final y pinza a 5 Hz, expresadas como pose relativa respecto de la pose alcanzada actual, con rotacion en representacion `rotation_6d`.

Su relevancia es acotada y de caracter experimental: el repositorio tiene 0 descargas y 0 likes, la licencia no esta declarada, el dataset y los componentes congelados necesarios no se incluyen, y la propia model card remite a un fichero JSON fijado y al `config.yaml` efectivo del repositorio para reproducir la ejecucion. Es material util fundamentalmente para investigacion en world models de video aplicados a robotica y para evaluacion de decoders de acciones cross-embodiment, no para despliegue de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder World2Action dentro del framework MimicVideo, sobre un backbone Video2World con LoRA de video congelada; detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el contexto es la observacion visual y el estado, sin especificar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin interfaz de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye pesos y un `config.yaml` efectivo; no se especifica el formato) |
| Tipo de modelo | Prediccion de acciones (action prediction) para robotica, multimodal video-accion |
| Framework | MimicVideo (commit fijado `e3355dbc93132b576c02f920a59b4fc18a4f5906`) |
| Entrada | Dos camaras: `observation.images.corner_cam`, `observation.images.front_cam` |
| Salida | 15 acciones de efector final alcanzado y pinza, a 5 Hz |
| Espacio de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Representacion de rotacion | `rotation_6d` |
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2` (revision `67837ace97128e6036d4894436ecb0036c9d5286`) |
| Episodios / frames | 174 / 54730 |
| Iteracion del checkpoint | 900 (run con `action_iter2374` y `videolora_iter400`) |
| Tamano del repositorio | 1.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

La model card describe el artefacto como el decoder World2Action de la iteracion 900, entrenado dentro de una ejecucion que combina un backbone Video2World inicial (`dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546`), un decoder de acciones inicial (`dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d`) y una LoRA de video congelada (`dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400@bb2283eb73df951f962c9173584ce1c0c09d590e`). El resultado es un decoder que opera sobre las representaciones del modelo de video congelado y produce acciones; no se especifican en la informacion disponible el tipo de bloque, el numero de capas, la dimension oculta ni el mecanismo de atencion.

Los datos de entrenamiento declarados son 174 episodios y 54730 frames del dataset `vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2`, con dos vistas de camara y objetivos de accion a 5 Hz. El contrato de datos incluye el marco de referencia `widowx_reference_base/teleop_aligned_tool` y la convencion `relative_to_current_achieved_pose`, lo que indica que el objetivo se define respecto de la pose alcanzada en lugar de la comandada, con alineacion a teleoperacion. No hay informacion sobre numero de tokens o frames de entrenamiento por muestra, composicion detallada del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineamiento, que en cualquier caso no aplican a este tipo de modelo. La model card indica que el conjunto completo de checkpoints de modelo, optimizador, scheduler y trainer fue verificado antes de seleccionar el peso subido.

## Capacidades

- Prediccion de acciones de robot: genera 15 acciones de efector final y pinza por inferencia, a 5 Hz.
- Condicionamiento visual multi-camara: consume simultaneamente `observation.images.corner_cam` y `observation.images.front_cam`.
- Representacion de pose relativa: trabaja en `relative_to_current_achieved_pose` dentro de `widowx_reference_base/teleop_aligned_tool`.
- Rotacion en `rotation_6d`: salida de orientacion en representacion continua de 6 dimensiones, adecuada para regresion.
- Alineacion a teleoperacion: el run incluye `widowx_teleop_recording_frame_v1`, lo que sugiere entrenamiento sobre grabaciones de teleoperacion alineadas.
- Nomenclatura cross-embodiment: el identificador del run menciona Panda con Robotiq, WidowX y UR5e, ademas de tareas con contacto (`contact_v2`), aunque la informacion disponible no detalla como se combinan esas plataformas.
- Generacion de texto: no disponible, no es una capacidad del modelo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles, el modelo no procesa lenguaje natural.
- Vision general, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Reproduccion de experimentos de world models en robotica: el checkpoint permite reconstruir la iteracion 900 fijando el commit de MimicVideo y las revisiones de backbone y LoRA indicadas, util para verificar resultados de un pipeline Video2World mas decoder de acciones.
- Evaluacion de decoders de acciones cross-embodiment: sirve como punto de comparacion frente al decoder inicial `vam-cross-target-widowx250-native-2cam-action-decoder`, manteniendo constante el backbone de video congelado.
- Investigacion en manipulacion con contacto: el identificador del run incluye `contact_v2`, por lo que el caso natural es el estudio de tareas donde el exito depende de fuerzas de contacto, comparando el comportamiento del decoder con y sin la LoRA de video.
- Aprendizaje por imitacion a partir de teleoperacion: dado que el run referencia grabaciones de teleoperacion WidowX, el modelo puede emplearse como politica base para imitar trayectorias humanas en tareas tabletop con dos camaras.
- Fine-tuning sobre nuevos datasets de robot: al ser un decoder de 1.0 GB de repositorio, es un punto de partida razonable para reentrenar la cabeza de acciones sobre datos propios, reutilizando el backbone de video congelado.
- Analisis de sensibilidad a camaras: permite estudiar cuanto aporta cada vista (`corner_cam` y `front_cam`) a la prediccion de acciones, sustituyendo una de las entradas por ruido o por una vista distinta.
- Construccion de rollouts para planificacion: combinado con el modelo de video, los pares observacion-accion predichos pueden alimentar bucles de planificacion a corto horizonte en simulacion.
- Banco de pruebas interno de prediccion de acciones: con 54730 frames etiquetados en el dataset referenciado, es viable montar una evaluacion cuantitativa de error de pose y de pinza a 5 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de pose, ni comparaciones con otros checkpoints de la familia.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio declara 1.0 GB de contenido, por lo que el peso del decoder es pequeno, pero el pipeline completo exige los componentes congelados (backbone Video2World y LoRA de video) cuyo tamano no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponibles. No se documentan requisitos en la model card.
- Encaje en GPU de consumo: no confirmado. El unico dato objetivo es el tamano del repositorio (1.0 GB); cualquier afirmacion sobre una GPU concreta (RTX 4090, etc.) requeriria conocer el coste del backbone de video, que no esta disponible.
- Opciones de despliegue: no disponibles. El repositorio no documenta integraciones con vLLM, llama.cpp, Ollama, TGI ni similares, y esas herramientas no son aplicables a un decoder de acciones.
- Dependencias de ejecucion: commit fijado de MimicVideo (`e3355dbc93132b576c02f920a59b4fc18a4f5906`), el JSON fijado y el `config.yaml` efectivo incluidos en el repositorio. El dataset y los componentes congelados no se incluyen.
- Latencia y throughput: no disponibles. El unico dato de temporizacion es la frecuencia de control objetivo, 5 Hz, que marca el presupuesto maximo de 200 ms por paso de control.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados ni especificaciones de modelos comparables. Los unicos elementos de la misma familia citados en la model card son los componentes congelados del propio pipeline, que no constituyen alternativas independientes:

| Componente | Rol | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| `widowx250-video-fused@f0cea76b...` | Backbone Video2World inicial | no disponible | no disponible | no disponible |
| `vam-cross-target-widowx250-native-2cam-action-decoder@93750ccc...` | Decoder de acciones inicial | no disponible | no disponible | no disponible |
| `vam-cross-level4-...-video-lora-iter400@bb2283eb...` | LoRA de video congelada | no disponible | no disponible | no disponible |
| Este checkpoint (iteracion 900) | Decoder World2Action entrenado | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion ni obras derivadas. Cualquier uso en produccion requiere contactar con el autor.
- Artefacto dependiente: el decoder no es autonomo. Necesita el backbone Video2World, la LoRA de video congelada y el commit exacto de MimicVideo; el dataset y esos componentes congelados no se incluyen en el repositorio.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues, discusiones ni evaluaciones externas documentadas.
- Error de prediccion de acciones: en un modelo de este tipo el fallo tipico no es alucinacion de texto, sino deriva de pose, error acumulado en tareas de contacto y fallos de agarre cuando la pinza se cierra en una posicion incorrecta.
- Sesgo de dominio: el entrenamiento se limita a 174 episodios con dos camaras concretas (`corner_cam`, `front_cam`), un unico marco de referencia (`widowx_reference_base/teleop_aligned_tool`) y una frecuencia de 5 Hz. Cambiar la configuracion de camaras, la frecuencia o la cinematica invalida el contrato de datos.
- Generalizacion cross-embodiment no demostrada: aunque la nomenclatura menciona Panda con Robotiq, WidowX y UR5e, no hay evidencia publicada de transferencia entre plataformas.
- Ausencia total de benchmarks: no hay tasas de exito ni comparaciones, por lo que no puede justificarse su uso frente a alternativas sin evaluacion propia.
- Limitaciones de idioma y de lenguaje natural: no aplica soporte multilingue ni interaccion conversacional; no hay tool calling ni planificacion simbolica.
- Fechas de metadatos: creacion y actualizacion en 2026-09-21, con dos minutos de diferencia. Conviene verificar la procedencia del repositorio y del dataset antes de integrarlos en cualquier flujo.
- Reproducibilidad fragil: la propia model card exige usar el JSON fijado y el `config.yaml` efectivo del repositorio; ignorarlos puede producir resultados inconsistentes.
- Resultados de la busqueda web: las consultas realizadas devolvieron unicamente paginas sobre control parental de Google y Microsoft, sin relacion con el modelo. No se ha localizado informacion externa adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-56355f5f5f
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decoder de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de video congelada: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2
- Repositorio de MimicVideo: no disponible (solo se proporciona el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`)
- Paper, blog o demo: no disponible
- Resultados de busqueda web relevantes: ninguno
