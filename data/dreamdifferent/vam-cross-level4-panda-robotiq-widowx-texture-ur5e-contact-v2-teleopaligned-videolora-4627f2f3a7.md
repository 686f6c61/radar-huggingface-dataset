# dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-4627f2f3a7

## Resumen

VAM-Cross MimicVideo World2Action decoder es un checkpoint de un decodificador de acciones ("World2Action") para robotica, publicado por el usuario `dreamdifferent` en HuggingFace. No es un modelo de lenguaje: se trata de un componente de un sistema de aprendizaje por imitacion que traduce representaciones de video (generadas por un backbone Video2World) en comandos de accion de un brazo robotico. El repositorio corresponde a la iteracion 1800 del decodificador dentro del entrenamiento `w2a_panda_robotiq_level4_widowx_texture_2cam_hstack_ur5e_contact_v2_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1`, que finalizo con estado `completed`.

El modelo forma parte del stack MimicVideo (commit fijado `e3355dbc93132b576c02f920a59b4fc18a4f5906`) y depende de tres entradas congeladas: un backbone Video2World inicial (`dreamdifferent/widowx250-video-fused`), un decodificador de accion inicial (`dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder`) y una Video LoRA congelada (`dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400`). El contrato de datos define 174 episodios y 54.730 fotogramas con dos camaras, y un objetivo de 15 acciones de efector final y pinza a 5 Hz.

Su relevancia es acotada pero especifica: se trata de un artefacto de investigacion reproducible (hashes de commit y dataset fijados), pensado para evaluar y reproducir la fase de decodificacion accion-video en manipulacion robotica. El repositorio ocupa 1,0 GB y no incluye el dataset ni las entradas congeladas. No tiene descargas ni "likes" y la model card no declara licencia ni idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | decodificador World2Action sobre backbone Video2World (MimicVideo); no se detalla la topologia interna en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible / no aplicable (modelo de accion robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible en la model card; el repositorio contiene un checkpoint de 1,0 GB junto con un JSON fijado y un `config.yaml` efectivo |

Datos adicionales del contrato de accion y datos:

| Parametro | Valor |
|---|---|
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2@67837ace97128e6036d4894436ecb0036c9d5286` |
| Episodios / fotogramas | 174 / 54.730 |
| Camaras | `observation.images.corner_cam`, `observation.images.front_cam` |
| Dimension del vector de accion | 15 acciones de efector final y pinza |
| Frecuencia de accion | 5 Hz |
| Objetivo de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Representacion de rotacion | `rotation_6d` |
| Iteracion del checkpoint | 1800 (run finalizado con estado `completed`) |

## Arquitectura y entrenamiento

La model card describe el artefacto como el decodificador World2Action del stack MimicVideo, entrenado sobre una representacion de video producida por un backbone Video2World congelado y una Video LoRA tambien congelada. El entrenamiento se plantea por etapas: existe un backbone Video2World inicial (`widowx250-video-fused`), una LoRA de video entrenada durante 400 iteraciones y un decodificador de accion inicial, sobre los que se entrena el decodificador publicado. El nombre del run (`...action_iter2374_videolora_iter400...`) sugiere que la fase de accion acumulo al menos 2.374 iteraciones y la de video 400, aunque la model card no detalla hiperparametros, numero de tokens, composicion del dataset ni si se emplearon RLHF o DPO.

El contrato de datos es explícito y es el elemento mas util del repositorio: dos camaras (`corner_cam` y `front_cam`), acciones relativas a la pose alcanzada actual en un marco de referencia `widowx_reference_base/teleop_aligned_tool`, rotacion en representacion 6D y una frecuencia de control de 5 Hz. El sufijo del run menciona `panda_robotiq`, `widowx` y `ur5e`, lo que apunta a un entrenamiento con datos de varias plataformas robotica alineados mediante teleoperacion, aunque la model card no confirma explicitamente esa interpretacion. El autor indica que se verifico el conjunto completo de checkpoint de modelo, optimizador, scheduler y trainer antes de seleccionar el peso subido, y advierte de que el dataset y las entradas congeladas no se incluyen: para reproducir hay que usar el JSON fijado y el `config.yaml` efectivo incluidos en el repositorio.

## Capacidades

- Prediccion de acciones de robot: genera un vector de 15 acciones de efector final y pinza a 5 Hz a partir de representaciones de video.
- Control relativo a la pose alcanzada: las acciones se expresan como `relative_to_current_achieved_pose`, lo que facilita el control en bucle cerrado desde el estado actual del robot.
- Rotacion en 6D: representacion de orientacion sin singularidades de Euler, adecuada para aprendizaje de politicas.
- Entrada multimodal de dos camaras: consume `observation.images.corner_cam` y `observation.images.front_cam`.
- Integracion en un pipeline video-accion: funciona como decodificador aguas abajo de un backbone Video2World con Video LoRA, no como modelo autonomo.
- Reproducibilidad de experimentos: hashes de commit y versiones de los componentes congelados fijados en la model card.
- Fine-tuning sobre nuevos contratos de datos: la estructura (decodificador sobre backbone congelado) permite reentrenar la fase de accion manteniendo el backbone.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente, multi-step reasoning o thinking mode: no disponible.
- Capacidades multilingues, vision general, audio o generacion de texto: no disponible (el modelo no es un modelo de lenguaje).

## Casos de uso

- Aprendizaje por imitacion en manipulacion robotica: entrenar o ajustar una politica que, a partir de dos vistas de camara, emita comandos de pose relativa y apertura de pinza a 5 Hz para un brazo tipo WidowX. El contrato de datos ya define el formato exacto de observacion y accion, lo que reduce el trabajo de integracion.
- Investigacion en decodificacion video-a-accion: usar el checkpoint como referencia para medir hasta que punto una representacion de video latente es suficiente para reconstruir acciones de control, comparando contra el decodificador inicial (`vam-cross-target-widowx250-native-2cam-action-decoder`).
- Ablaciones de Video LoRA: al depender de una LoRA de video congelada e identificada por hash, permite variar solo la LoRA o solo el decodificador y atribuir cambios de rendimiento a un unico componente.
- Transferencia entre plataformas robotica: el nombre del run incluye referencias a Panda con pinza Robotiq, UR5e y WidowX con alineacion por teleoperacion, de modo que el checkpoint es un candidato para estudiar transferencia cross-embodiment hacia WidowX, siempre que se respete el marco de referencia declarado.
- Manipulacion con contacto: la variante `contact_v2` del dataset sugiere escenarios con contacto fisico; el modelo puede emplearse para estudiar si las politicas aprendidas mantienen precision en tareas de insercion o empuje.
- Reproduccion de experimentos publicados: gracias a los hashes de commit fijados (MimicVideo, backbone, decodificador inicial, LoRA y dataset), un laboratorio puede reconstruir exactamente el entorno de entrenamiento y verificar el estado `completed` del run.
- Reentrenamiento sobre datasets propios: el decodificador puede reentrenarse sobre un dataset nuevo que respete el mismo contrato (dos camaras, 15 acciones, 5 Hz, rotacion 6D) reutilizando el backbone congelado, lo que reduce el coste computacional frente a entrenar desde cero.
- Docencia y prototipado en robotica: como artefacto pequeno (1,0 GB de repositorio) con contrato de datos explicito, sirve para montar practicas de aprendizaje por imitacion sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, error de pose, ni comparaciones con otras politicas, y los resultados de la busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos de hardware.
- Unico dato objetivo de tamano: el repositorio ocupa 1,0 GB, cifra que incluye el checkpoint y ficheros de configuracion. Cualquier estimacion de VRAM a partir de esa cifra seria una inferencia no confirmada por el autor.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible. No hay confirmacion de que el checkpoint se ejecute en GPUs de gama consumer, y el sistema completo depende ademas del backbone Video2World y de la Video LoRA, cuyos requisitos tampoco se documentan.
- Opciones de despliegue: no disponible. Al tratarse de un decodificador de acciones para robotica y no de un modelo de lenguaje, herramientas como llama.cpp, Ollama, vLLM o TGI no son aplicables segun la informacion disponible; el despliegue previsible pasa por el propio stack MimicVideo en PyTorch, sin documentacion publicada en la model card.
- Latencia y throughput: no disponible. El unico dato relacionado es la frecuencia objetivo del contrato de accion, 5 Hz (200 ms por paso de control), que condiciona el presupuesto de latencia del sistema completo.
- Almacenamiento y dependencias: el repositorio no incluye el dataset (174 episodios, 54.730 fotogramas) ni las entradas congeladas, por lo que hay que descargarlas por separado de sus repositorios respectivos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos alternativos comparables (ni parametros, ni contexto, ni rendimiento) en la informacion proporcionada. Los unicos artefactos relacionados documentados son componentes del mismo stack, no alternativas:

| Modelo | Relacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| `dreamdifferent/widowx250-video-fused@f0cea76b...` | backbone Video2World inicial | no disponible | no aplicable | no disponible |
| `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750ccc...` | decodificador de accion inicial | no disponible | no aplicable | no disponible |
| `dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400@bb2283eb...` | Video LoRA congelada | no disponible | no aplicable | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica licencia, por lo que el uso comercial queda en un limbo juridico hasta que el autor lo aclare.
- Artefacto dependiente: el checkpoint no es autonomo; requiere el backbone Video2World, la Video LoRA y la version exacta de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`) para funcionar como se entreno.
- Entradas congeladas no incluidas: el repositorio no contiene el dataset ni los pesos de las entradas congeladas, de modo que no se puede reproducir el pipeline solo con este repositorio.
- Ambito de accion muy restringido: el contrato fija dos camaras concretas, 15 acciones, 5 Hz, rotacion 6D y un marco de referencia especifico (`widowx_reference_base/teleop_aligned_tool`). Cualquier desviacion de ese contrato invalida el uso directo del checkpoint.
- Sesgos de dominio: al entrenarse sobre 174 episodios y 54.730 fotogramas, la politica hereda los sesgos de ese dataset (objetos, iluminacion, posiciones y estilo de teleoperacion). No se documenta ninguna evaluacion de robustez fuera de distribucion.
- Riesgo de fallo silencioso en robotica: un decodificador de acciones puede producir comandos plausibles pero incorrectos; sin benchmarks publicados de tasa de exito no hay evidencia de seguridad para operar hardware real sin validacion previa en simulacion y con limites de par.
- Sin datos de seguridad ni de cumplimiento: no hay informacion sobre limites de fuerza, parada de emergencia, ni evaluaciones de seguridad, algo critico antes de llevar el modelo a un robot fisico.
- Trazabilidad limitada: no se documentan hiperparametros, numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO, lo que dificulta auditar el comportamiento del modelo.
- Cero adopcion publica: 0 descargas y 0 "likes" en el momento de redactar la ficha, sin evidencia de uso en terceros ni de validacion externa.
- Resultados de la busqueda web no relevantes: las busquedas realizadas devolvieron unicamente paginas de inicio de sesion de Facebook, sin relacion con el modelo, por lo que no hay informacion externa que complemente la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-4627f2f3a7
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de accion inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- Video LoRA congelada (iter400): https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400
- Dataset de entrenamiento: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2
- Repositorio MimicVideo: no disponible como URL en la informacion proporcionada; la model card solo indica el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Paper, blog o demo: no disponible en la informacion proporcionada.
