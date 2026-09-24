# dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter1800

## Resumen

El modelo `dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter1800` es un checkpoint de un decodificador World2Action perteneciente a la familia VAM-Cross MimicVideo, publicado por el usuario `dreamdifferent` en HuggingFace. No se trata de un modelo de lenguaje: es un componente de prediccion de acciones para robotica de manipulacion, etiquetado con el pipeline `robotics` y las etiquetas `mimic-video`, `robotics` y `action-prediction`.

El checkpoint corresponde a la iteracion 1800 de la ejecucion `w2a_so101_level2_widowx_texture_2cam_hstack_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1`, que finalizo con estado `completed`. El autor indica que se verifico el conjunto completo de checkpoints (modelo, optimizador, scheduler y trainer) antes de seleccionar el peso publicado. El repositorio ocupa 1,0 GB e incluye un fichero JSON con las revisiones fijadas y un `config.yaml` efectivo; los pesos se publican sin los componentes congelados de los que dependen.

El modelo no tiene descargas ni likes en el momento de redactar esta ficha, su licencia e idiomas no estan declarados y no se acompanan resultados de benchmarks ni una model card descriptiva mas alla del contrato de datos y la lista de entradas congeladas requeridas. Es, por tanto, un artefacto de investigacion reproducible con revisiones fijadas, no un modelo listo para produccion sin trabajo adicional de integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action sobre el marco MimicVideo (combinacion de backbone Video2World, LoRA de video congelada y decodificador de acciones). No se detalla la arquitectura interna (transformer, difusion u otra) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; no se documenta ventana de observacion temporal) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la informacion proporcionada; el repositorio contiene pesos acompanados de un `config.yaml` efectivo y un JSON de revisiones fijadas |
| Tarea | Prediccion de acciones (action prediction) para robotica de manipulacion |
| Entradas | Dos camaras: `observation.images.corner_cam` y `observation.images.front_cam` |
| Salidas | 15 acciones de efector final y pinza, a 5 Hz |
| Objetivo de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Representacion de rotacion | `rotation_6d` |
| Iteracion del checkpoint | 1800 |
| Estado de la ejecucion | `completed` |
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level2-so101-widowx-texture` (298 episodios / 54.354 fotogramas) |
| Tamano del repositorio | 1,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |
| Fecha de actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

El repositorio publica unicamente el decodificador World2Action. El pipeline completo segun la model card consta de cuatro entradas congeladas con revision fijada: el codigo de MimicVideo en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`, el backbone inicial Video2World `dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546`, el decodificador de acciones inicial `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d` y la LoRA de video congelada `dreamdifferent/vam-cross-level2-so101-widowx-texture-video-lora-iter-400@f770834a2630cbe8ed15ab9bc02cae0178506ced`. El autor advierte explicitamente que ni el dataset ni las entradas congeladas se incluyen en el repositorio.

El contrato de datos define el entrenamiento sobre dos vistas de camara apiladas (`corner_cam` y `front_cam`, de ahi el sufijo `2cam_hstack`), con objetivo de pose relativo a la pose alcanzada actual y rotacion en representacion 6D, a una frecuencia de control de 5 Hz sobre 15 dimensiones de accion. El nombre de la ejecucion sugiere dos etapas de entrenamiento encadenadas: una fase de accion hasta la iteracion 2374 y una fase de LoRA de video hasta la iteracion 400. No se documentan el numero de tokens o muestras vistas, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no aplicables en el sentido habitual a un decodificador de acciones, pero no se especifica ninguna etapa de ajuste por preferencias).

No se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, difusion de acciones u otras) en la informacion disponible.

## Capacidades

- Prediccion de acciones de manipulacion robotica: genera 15 acciones de efector final y pinza a partir de observaciones visuales de dos camaras.
- Control a 5 Hz: la frecuencia de salida esta fijada en el contrato de datos, adecuada para tareas de manipulacion teleoperada.
- Representacion de pose relativa: las acciones se expresan como pose relativa a la pose alcanzada actual, definida en `widowx_reference_base/teleop_aligned_tool`, lo que facilita el despliegue sobre el mismo montaje fisico.
- Rotacion en 6D: emplea `rotation_6d` como representacion continua de la orientacion.
- Entrada multimodal visual: consume simultaneamente las vistas `corner_cam` y `front_cam` apiladas.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas: no es un modelo de lenguaje.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades especiales (thinking mode, voz, etc.): no disponibles.

## Casos de uso

- Imitacion de manipulacion teleoperada: entrenar una politica que replique las trayectorias de teleoperacion registradas sobre un brazo WidowX o SO-101. El modelo es adecuado porque su objetivo de pose esta explicitamente alineado con la teleoperacion (`teleop_aligned_tool`) y la rotacion en 6D evita discontinuidades.
- Despliegue de politica visual de doble camara: usar las vistas `corner_cam` y `front_cam` para generar acciones a 5 Hz en un montaje de mesa. La combinacion de vista cenital y frontal reduce oclusiones en tareas de agarre.
- Evaluacion de decodificadores World2Action: servir como punto de comparacion frente a los checkpoints de la misma familia (por ejemplo, el de nivel 4 o el de LoRA de video a 200 iteraciones) para medir el efecto de la iteracion de entrenamiento en el exito de la tarea.
- Reentrenamiento y ajuste fino sobre datos propios: al publicarse como checkpoint intermedio con revisiones fijadas, permite reanudar o ajustar el decodificador sobre un dataset de manipulacion propio, siempre que se reproduzcan el backbone y la LoRA congelados indicados.
- Investigacion en modelos de mundo para robotica: el componente Video2World congelado permite estudiar como se transfiere la representacion de video a la prediccion de acciones, aislando el decodificador como variable.
- Generacion de datos sinteticos de politica: ejecutar el decodificador sobre rollouts simulados con las mismas convenciones de camara y pose para prefiltrar trayectorias antes de validarlas en hardware real.
- Benchmarking interno de infraestructura de entrenamiento: al proceder de una ejecucion con estado `completed` y checkpoints verificados, es util para validar pipelines de entrenamiento distribuido y reanudacion desde checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de pose, ni comparaciones con otras politicas.

## Requisitos de hardware

- El repositorio ocupa 1,0 GB, pero la huella total de memoria para inferencia no se puede determinar: los componentes congelados (backbone Video2World y LoRA de video) no se incluyen en este repositorio.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El tamano del repositorio (1,0 GB) sugiere que el decodificador por si solo no seria un cuello de botella, pero no hay datos publicados sobre el coste del pipeline completo.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la presencia de un `config.yaml` efectivo y un JSON de revisiones fijadas apunta a una carga personalizada del checkpoint junto con el codigo MimicVideo.
- Latencia y throughput estimados: no disponible.
- Requisito de integracion: es necesario reproducir exactamente las revisiones fijadas (MimicVideo `e3355dbc93132b576c02f920a59b4fc18a4f5906`, backbone Video2World `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, decodificador inicial `93750cccda01620e3c028477e4c49bc5c996a68d` y LoRA de video `f770834a2630cbe8ed15ab9bc02cae0178506ced`) antes de poder ejecutar cualquier inferencia.

## Comparativa con modelos similares

Los unicos artefactos comparables localizados son otros checkpoints de la misma familia y autor. No se han encontrado modelos equivalentes de terceros en la informacion disponible.

| Modelo | Iteracion | Nivel | LoRA de video | Estado de la ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `vam-cross-level2-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter1800` (este modelo) | 1800 | level2 | iter 400 | `completed` | no disponible | publico, 0 descargas |
| `vam-cross-level2-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900` | 900 | level2 | iter 200 | `unknown` | no disponible | publico |
| `vam-cross-level4-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900` | 900 | level4 | iter 200 | `unknown` | no disponible | publico |

No se dispone de parametros, longitud de contexto ni resultados de rendimiento de ninguno de los tres, por lo que la comparacion se limita a la procedencia, la etapa de entrenamiento y la disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso de uso comercial. Es necesario contactar con el autor antes de cualquier despliegue productivo.
- Estado de investigacion: 0 descargas y 0 likes, sin model card descriptiva ni validacion externa.
- Dependencias estrictas: el repositorio no incluye el dataset ni los componentes congelados; sin las revisiones exactas indicadas el checkpoint no es funcional.
- Dataset pequeno: 298 episodios y 54.354 fotogramas, lo que limita la diversidad de escenas, objetos e iluminacion cubiertas.
- Dominio estrecho: entrenado especificamente para un montaje WidowX/SO-101 con dos camaras concretas (`corner_cam` y `front_cam`) y una convencion de pose concreta; no se espera transferencia directa a otras plataformas, camaras o marcos de referencia.
- Frecuencia de control fija: 5 Hz. Usarlo a otra frecuencia o con un controlador distinto exige reentrenamiento o interpolacion no documentada.
- Riesgo de acciones inseguras: en robotica real, una prediccion erronea puede provocar colisiones o danos materiales. Es imprescindible validar en simulacion y aplicar limites de par, velocidad y espacio de trabajo.
- Alucinacion en el sentido linguistico: no aplica. El riesgo equivalente es la generacion de trayectorias fisicamente invalidas o fuera del espacio alcanzable.
- Sin soporte de idioma ni de texto: no puede usarse para tareas de lenguaje, dialogo ni recuperacion de informacion.
- Reproducibilidad dependiente del codigo: la ejecucion de referencia depende del commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` de MimicVideo, cuyo mantenimiento futuro no esta garantizado.
- Fechas de creacion y actualizacion muy proximas entre si (20:55:14 y 20:55:44 del mismo dia), lo que sugiere una subida automatizada sin revision manual posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter1800
- Checkpoint de la misma familia, nivel 2, LoRA de video iter 200, decodificador iter 900: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Checkpoint de la misma familia, nivel 4, LoRA de video iter 200, decodificador iter 900: https://huggingface.co/dreamdifferent/vam-cross-level4-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Backbone inicial Video2World: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de video congelada: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-video-lora-iter-400
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level2-so101-widowx-texture
- Codigo MimicVideo: no se proporciona URL en la informacion disponible; solo el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Paper, blog o demo: no disponibles
