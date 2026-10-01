# dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter900

## Resumen

VAM-Cross MimicVideo World2Action decoder es un checkpoint de decodificador de acciones para robotica de manipulacion, publicado por el usuario dreamdifferent en Hugging Face. Se trata de la iteracion 900 de un entrenamiento cuyo identificador completo es `w2a_panda_widowx_level4_widowx_texture_2cam_hstack_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`, y que segun la propia model card se detuvo por una causa etiquetada como `unknown`. No es un modelo de lenguaje: es un componente de una arquitectura mayor orientada a convertir representaciones de video (Video2World) en acciones de robot (World2Action).

El modelo se apoya en una pila de componentes congelados: un backbone Video2World (`dreamdifferent/widowx250-video-fused`), un decodificador de acciones inicial (`dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder`) y una LoRA de video congelada (`dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-video-lora-iter200`), todo ello sobre un commit concreto de MimicVideo. El entrenamiento se realizo sobre el dataset `dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture`, con 163 episodios y 54 200 fotogramas, usando dos camaras y objetivos de efector final teleoperados.

Su relevancia es acotada y de caracter investigador: es un artefacto experimental de acceso publico con cero descargas y cero valoraciones en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. Resulta util como referencia reproducible para quien trabaje en modelos de mundo aplicados a robotica o en decodificadores accion-desde-video, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como decodificador World2Action sobre un backbone Video2World; no se detalla el tipo de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de accion: 15 acciones a 5 Hz, equivalente a 3 segundos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje de forma declarada) |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repositorio: 1,0 GB) |

Especificaciones adicionales del contrato de datos y acciones:

| Parametro | Valor |
|---|---|
| Pipeline declarado | robotics |
| Etiquetas | mimic-video, robotics, action-prediction, region:us |
| Camaras de entrada | `observation.images.corner_cam`, `observation.images.front_cam` |
| Numero de acciones objetivo | 15 (efector final logrado y pinza) |
| Frecuencia de control | 5 Hz |
| Objetivo de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Representacion de rotacion | `rotation_6d` |
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture` (163 episodios / 54 200 fotogramas) |
| Commit de MimicVideo | `e3355dbc93132b576c02f920a59b4fc18a4f5906` |
| Iteracion publicada | 900 |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creacion | 2026-10-01 |
| Fecha de actualizacion | 2026-10-01 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del decodificador. Lo que si especifica es el grafo de dependencias congeladas que hay que respetar para reproducir el checkpoint: el backbone Video2World inicial `dreamdifferent/widowx250-video-fused` en el commit `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, el decodificador de acciones inicial `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder` en `93750cccda01620e3c028477e4c49bc5c996a68d`, y la LoRA de video congelada `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-video-lora-iter200` en `3da54ddf6f00406150ec5a2aa526b992448e772a`. El nombre del run sugiere una combinacion de datos de brazo Franka Panda y WidowX (transferencia cross-embodiment) con dos camaras apiladas en la entrada (`2cam_hstack`).

En cuanto al entrenamiento, se conoce el volumen de datos (163 episodios, 54 200 fotogramas) y el contrato de acciones: 15 acciones de efector final y pinza a 5 Hz, expresadas como pose relativa a la pose lograda actual en el marco `widowx_reference_base/teleop_aligned_tool`, con rotacion en representacion `rotation_6d`. No se documentan el numero de tokens o frames de entrenamiento en terminos de computo, la composicion exacta del dataset, ni si hubo tecnicas de ajuste tipo RLHF o DPO (poco probables en este dominio). El run se detuvo por una causa no identificada (`unknown`) y, segun el autor, se verifico el ultimo conjunto completo de checkpoint de modelo, optimizador, scheduler y trainer antes de seleccionar el peso publicado. Ni el dataset ni las entradas congeladas se incluyen en el repositorio: hay que usar el JSON fijado y el `config.yaml` efectivo incluidos.

## Capacidades

- Prediccion de acciones de manipulacion robotica: genera secuencias de 15 acciones de efector final y pinza a 5 Hz a partir de observaciones visuales.
- Entrada multimodal de dos camaras: consume `observation.images.corner_cam` y `observation.images.front_cam`.
- Representacion de pose relativa: las acciones se expresan como pose relativa a la pose lograda actual, con rotacion en `rotation_6d`, lo que permite control continuo de orientacion.
- Integracion en un pipeline Video2World + World2Action: actua como decodificador sobre representaciones de video generadas o codificadas por el backbone congelado.
- Ajuste de bajo rango sobre video: la presencia de una LoRA de video congelada indica que el sistema completo se adapta sin reentrenar el backbone.
- Soporte de tool calling / function calling: no disponible (no aplica al pipeline declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara procesamiento de lenguaje).
- Capacidades especiales (modo thinking, vision, audio): vision si (dos camaras); thinking y audio, no disponibles.

## Casos de uso

- Replicacion de demostraciones teleoperadas en WidowX: el modelo se entreno sobre grabaciones de teleoperacion alineadas (`teleopaligned`) y genera 15 acciones a 5 Hz, por lo que puede usarse para imitar politicas humanas de manipulacion en tareas de mesa con dos camaras.
- Investigacion en transferencia cross-embodiment Panda a WidowX: el identificador del run menciona ambos brazos, de modo que el checkpoint sirve como punto de partida para estudiar si un decodificador entrenado con datos de un brazo puede adaptarse a otro con el mismo contrato de acciones.
- Evaluacion de decodificadores accion-desde-video: dado que el repositorio fija el commit de MimicVideo y las dependencias congeladas, es util como baseline reproducible en experimentos que comparen variantes de decodificador manteniendo el resto de la pila constante.
- Ablacion de LoRA de video: la LoRA congelada referenciada pertenece a un nivel distinto del proyecto (`level5` frente al `level4` del decodificador), lo que permite medir el efecto de reutilizar una LoRA de mayor nivel sobre un decodificador distinto.
- Control de brazo en laboratorio con horizonte corto: con 3 segundos de acciones por inferencia a 5 Hz, encaja en bucles de control con replanificacion frecuente, tipico de tareas de pick-and-place sobre superficie plana.
- Generacion de datos sinteticos de trayectoria para ampliar datasets de robotica: las predicciones del decodificador pueden filtrarse y anadirse como trayectorias candidatas en entrenamientos posteriores, siempre con validacion en robot real.
- Estudio de robustez ante cambios de textura: el nombre del run incluye `texture`, lo que apunta a experimentos de generalizacion ante variacion de apariencia de los objetos; el checkpoint permite medir esa sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en tareas, errores de posicion, ni comparaciones numericas con otros modelos. Tampoco se declaran metricas de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El unico dato de tamano es el repositorio del decodificador, 1,0 GB; el consumo real depende de los componentes congelados (backbone Video2World, decodificador inicial y LoRA de video), cuyos pesos no se incluyen ni se cuantifican en la informacion proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un modelo de robotica con backbone de video, se requiere una GPU con soporte CUDA para inferencia practica, pero no se especifica modelo ni generacion.
- Compatibilidad con GPU de consumo: no disponible. No puede estimarse sin conocer el consumo del backbone congelado.
- Opciones de despliegue: no disponible. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un pipeline de robotica. El despliegue se realiza cargando el checkpoint junto con los componentes congelados y el `config.yaml` efectivo del repositorio.
- Latencia y throughput: no disponible. El unico dato temporal es la frecuencia de control objetivo de 5 Hz y el horizonte de 15 acciones, lo que implica que la inferencia debe completarse en menos de 200 ms para operar en tiempo real a esa frecuencia; no se confirma que el checkpoint lo cumpla.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento frente a alternativas de la misma categoria. Como referencia interna del mismo autor si existen componentes relacionados (el backbone `widowx250-video-fused`, el decodificador `vam-cross-target-widowx250-native-2cam-action-decoder` y LoRAs de niveles 4 y 5 del proyecto VAM-Cross), pero no hay metricas que permitan establecer una comparacion cuantitativa entre ellos.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Cero adopcion verificable: 0 descargas y 0 valoraciones, sin historial de uso ni validacion independiente.
- Entrenamiento interrumpido: el run se detuvo por una causa no identificada (`unknown`), por lo que el checkpoint publicado puede corresponder a un estado no optimo.
- Dataset muy reducido: 163 episodios y 54 200 fotogramas es un volumen pequeno para generalizacion, lo que aumenta el riesgo de sobreajuste a las condiciones de recogida (iluminacion, texturas, posiciones de objeto).
- Riesgo de alucinacion en el sentido de trayectorias plausibles pero fisicamente invalidas: el decodificador puede generar acciones coherentes con la distribucion de entrenamiento sin garantia de exito en tareas nuevas.
- Dependencia estricta de versiones: exige commits concretos de MimicVideo, del backbone y de la LoRA; usar otras revisiones invalida la reproducibilidad.
- Componentes no incluidos: el dataset y las entradas congeladas no forman parte del repositorio, por lo que no es posible ejecutar el modelo solo con este checkpoint.
- Sesgos conocidos: no disponibles. No se documentan sesgos de dominio ni de condiciones de captura, mas alla de la limitacion implicita por el origen de los datos de teleoperacion.
- Limitaciones de idioma y contexto: no aplica lenguaje; la limitacion relevante es el horizonte de accion de 3 segundos y la dependencia de dos camaras concretas.
- Sin datos de seguridad: no se documentan comportamientos en entornos no controlados ni limites de fuerza o par, algo critico antes de operar un brazo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused (commit `f0cea76b62c5dd66b06b9f965932ddea32a7b546`)
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder (commit `93750cccda01620e3c028477e4c49bc5c996a68d`)
- LoRA de video congelada: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-video-lora-iter200 (commit `3da54ddf6f00406150ec5a2aa526b992448e772a`)
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture (commit `334af5330c91d71d78e944607e4c61d7e2ba6cd2`)
- Repositorio MimicVideo: no disponible como URL; commit fijado `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Paper, blog o demo: no disponible
