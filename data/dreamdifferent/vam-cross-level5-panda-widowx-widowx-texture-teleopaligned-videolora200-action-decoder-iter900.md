# dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter900

## Resumen

El modelo `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter900` es un checkpoint de un decodificador de acciones ("World2Action decoder") perteneciente a la familia VAM-Cross MimicVideo, desarrollada por el usuario `dreamdifferent`. No se trata de un modelo de lenguaje: es un componente de un sistema de aprendizaje por imitacion para robotica que traduce representaciones de mundo aprendidas desde video a comandos de accion de un brazo robotico. El checkpoint corresponde a la iteracion 900 de un entrenamiento cuya ejecucion se detuvo por una causa registrada como `unknown`.

El componente se entrena sobre el conjunto de datos `vam-cross-level5-panda-widowx-widowx-texture`, con 156 episodios y 54 421 fotogramas, y predice 15 acciones de efector final y pinza a 5 Hz. La entrada visual procede de dos camaras (`observation.images.corner_cam` y `observation.images.front_cam`) y el objetivo de pose se define como `relative_to_current_achieved_pose` en el sistema `widowx_reference_base/teleop_aligned_tool`, con rotacion representada en `rotation_6d`.

Es relevante como ejemplo de transferencia cruzada entre plataformas (Panda y WidowX) y de la combinacion de un backbone Video2World congelado, una LoRA de video congelada y un decodificador de acciones entrenable. El repositorio pesa 1,0 GB y acumula 0 descargas y 0 likes en el momento de la consulta. No se dispone de licencia, idiomas, benchmarks ni especificaciones de parametros publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de acciones sobre backbone Video2World con LoRA de video congelada (familia MimicVideo VAM-Cross); no disponible el detalle interno de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se ha publicado que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto textual; entrada de video de dos camaras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 1,0 GB e incluye un JSON fijado y el `config.yaml` efectivo) |

Datos adicionales del contrato de accion y datos:

| Parametro | Valor |
|---|---|
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture@160fcfd25198e9b91d89f9bc7fccc2a3f015ce30` |
| Episodios / fotogramas | 156 / 54 421 |
| Camaras | `observation.images.corner_cam`, `observation.images.front_cam` |
| Dimension del vector de accion | 15 acciones de efector final y pinza (`achieved-EE/gripper`) |
| Frecuencia de control | 5 Hz |
| Objetivo de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Representacion de rotacion | `rotation_6d` |
| Backbone Video2World inicial | `dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546` |
| Decodificador de acciones inicial | `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d` |
| LoRA de video congelada | `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-video-lora-iter200@3da54ddf6f00406150ec5a2aa526b992448e772a` |
| Commit de MimicVideo | `e3355dbc93132b576c02f920a59b4fc18a4f5906` |
| Iteracion | 900 |
| Estado de la ejecucion | detenida, causa registrada como `unknown` |

## Arquitectura y entrenamiento

La informacion disponible describe un sistema de dos etapas: un backbone Video2World (modelo de video) y un decodificador de acciones que transforma la representacion latente del video en comandos motores. El decodificador parte de un checkpoint previo (`vam-cross-target-widowx250-native-2cam-action-decoder`) y se entrena sobre un backbone `widowx250-video-fused` acompanado de una LoRA de video congelada (`...video-lora-iter200`). No se especifican en la model card el numero de capas, la dimension oculta, el tipo de atencion ni el numero de tokens de video utilizados como entrada.

El entrenamiento emplea el conjunto `vam-cross-level5-panda-widowx-widowx-texture`, con 156 episodios y 54 421 fotogramas, y el identificador de la ejecucion (`w2a_panda_widowx_level5_widowx_texture_2cam_hstack_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`) sugiere apilado en horizontal de dos camaras (`2cam_hstack`), un componente de accion entrenado durante 2374 iteraciones y una LoRA de video entrenada durante 200 iteraciones. No se documenta el uso de RLHF, DPO ni de tecnicas de decodificacion especulativa. Tampoco se indica el numero total de tokens de video consumidos ni la composicion exacta de tareas del dataset. La model card advierte de que ni el dataset ni las entradas congeladas se incluyen en el repositorio, y que deben usarse el JSON fijado y el `config.yaml` efectivo incluidos.

## Capacidades

- Prediccion de acciones roboticas: genera 15 valores de accion correspondientes a la pose del efector final y al estado de la pinza.
- Control a 5 Hz de un brazo WidowX con objetivos de pose expresados de forma relativa a la pose alcanzada actual.
- Representacion de rotacion en formato `rotation_6d`, evitando ambiguedades de representaciones mas compactas como cuaterniones o angulos de Euler.
- Procesamiento de entrada visual multi-camara: consume simultaneamente las vistas `corner_cam` y `front_cam`.
- Transferencia cruzada de plataforma: el identificador y el dataset indican combinacion de datos de Panda y WidowX, con alineacion de teleoperacion (`teleop_aligned_tool`).
- Integracion con un pipeline de video generativo: depende de un backbone Video2World y de una LoRA de video congelada, ambos versionados de forma fija.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento explicito, ya que no es un modelo de lenguaje.

## Casos de uso

- Investigacion en aprendizaje por imitacion para manipulacion robotica: el checkpoint sirve como referencia reproducible de un decodificador de acciones entrenado sobre 156 episodios, util para comparar arquitecturas de decodificacion World2Action bajo un contrato de datos fijo.
- Reentrenamiento o ajuste fino sobre tareas propias: partiendo del decodificador inicial citado y manteniendo congeladas la LoRA de video y el backbone, se puede adaptar la cabeza de acciones a un nuevo conjunto de demostraciones con el mismo contrato de 15 acciones a 5 Hz.
- Experimentos de transferencia entre plataformas (Panda a WidowX): el dataset combina ambas y el objetivo de pose esta alineado a la base `widowx_reference_base`, lo que permite estudiar la generalizacion entre morfologias distintas.
- Validacion de pipelines de teleoperacion: la representacion `relative_to_current_achieved_pose` con herramienta alineada permite verificar que las trayectorias grabadas por teleoperacion se reproducen de forma consistente antes de desplegar una politica.
- Generacion de datos sinteticos de accion para aumentar un dataset de robotica: el decodificador puede producir etiquetas de accion sobre nuevos fotogramas de video y filtrarse despues por consistencia fisica.
- Evaluacion offline de politicas: dado que el modelo predice acciones a partir de dos camaras, se puede medir el error de prediccion de pose por paso temporal sobre episodios reservados sin necesidad de ejecutar hardware.
- Reproduccion de experimentos academicos: al estar fijados los commits de MimicVideo y de cada artefacto congelado, el checkpoint permite reconstruir la configuracion exacta de una ejecucion concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion ni comparaciones cuantitativas con otros decodificadores.

## Requisitos de hardware

- El repositorio ocupa 1,0 GB, por lo que el peso del decodificador es reducido; sin embargo, la inferencia completa requiere ademas el backbone Video2World `widowx250-video-fused` y la LoRA de video, cuyos tamanos no se han publicado.
- VRAM estimada: no disponible. Como referencia, un decodificador de aproximadamente 1,0 GB en precision de 16 bits ocuparia del orden de 1 a 2 GB solo en pesos, a lo que habria que sumar la memoria del backbone de video congelado y de las activaciones.
- GPU recomendadas: no disponible. El cuello de botella previsible es el backbone de video, no el decodificador.
- Compatibilidad con GPU de consumo: no disponible. Es plausible que quepa en GPU de consumo de gama alta si el backbone de video se ejecuta en precision reducida, pero no hay dato confirmado.
- Opciones de despliegue: no disponible. El modelo esta integrado en el codigo de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que ademas no son aplicables a un decodificador de acciones.
- Latencia y throughput: no disponible. La frecuencia objetivo de las acciones es 5 Hz, lo que fija un presupuesto de 200 ms por paso de control como requisito del sistema, no como rendimiento medido.

## Comparativa con modelos similares

No hay datos publicados que permitan comparar el rendimiento de este checkpoint. Se puede establecer una comparacion estructural con los repositorios hermanos del mismo autor, aunque tampoco disponen de metricas publicas:

| Modelo | Relacion | Iteracion | Tamano de repo | Licencia |
|---|---|---|---|---|
| `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter900` | Objeto de esta ficha | 900 | 1,0 GB | no disponible |
| `dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-68554cef79` | Variante con `robosuite` y LoRA de video a 400 iteraciones | no disponible | no disponible | no disponible |
| `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder` | Checkpoint inicial del decodificador, usado como punto de partida | no disponible | no disponible | no disponible |
| `dreamdifferent/widowx250-video-fused` | Backbone Video2World inicial, congelado durante el entrenamiento | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar ni el uso comercial ni las condiciones de redistribucion. Cualquier uso en produccion exige contactar con el autor.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de terceros ni de estabilidad del checkpoint en entornos distintos al original.
- Ejecucion detenida con causa `unknown`: el autor indica que se verifico el conjunto completo de checkpoints de modelo, optimizador, planificador y entrenador antes de seleccionar el peso subido, pero la interrupcion anomala es un riesgo a tener en cuenta.
- Artefactos dependientes no incluidos: el backbone Video2World, la LoRA de video y el dataset no forman parte del repositorio, por lo que una reproduccion exacta requiere descargarlos y fijar los commits indicados.
- Dependencia de version muy estricta: el codigo de MimicVideo esta fijado a un commit concreto; cambios en esa base pueden invalidar la compatibilidad del checkpoint.
- Ausencia total de benchmarks: no hay tasas de exito en tarea real, ni errores de pose, ni curvas de aprendizaje publicadas.
- Sin informacion sobre sesgos: no se ha documentado el sesgo de los datos de demostracion, que en robotica suele reflejar las condiciones de iluminacion, la distribucion de objetos y el estilo de teleoperacion del operador.
- Riesgo de sobreajuste al dominio: 156 episodios y 54 421 fotogramas es un volumen reducido; es previsible un rendimiento degradado ante cambios de camara, de mesa, de iluminacion o de morfologia del robot.
- Restricciones de seguridad fisica: al tratarse de un controlador de robot, los fallos de prediccion pueden provocar colisiones o danos; se requiere capa de supervision, limites articulares y parada de emergencia.
- Idioma y texto: el modelo no procesa lenguaje, por lo que no aplica soporte multilingue ni de instrucciones en lenguaje natural.

## Enlaces

- HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Dataset asociado: `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture@160fcfd25198e9b91d89f9bc7fccc2a3f015ce30`
- Backbone Video2World inicial: `dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546`
- Decodificador de acciones inicial: `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d`
- LoRA de video congelada: `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-video-lora-iter200@3da54ddf6f00406150ec5a2aa526b992448e772a`
- Commit de MimicVideo requerido: `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Repositorio hermano encontrado en la busqueda web: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-68554cef79
- Documentacion del brazo WidowX (contexto de hardware, no vinculada al modelo): https://www.trossenrobotics.com/widowx-ai
- Paper, blog o demo oficial: no disponible
