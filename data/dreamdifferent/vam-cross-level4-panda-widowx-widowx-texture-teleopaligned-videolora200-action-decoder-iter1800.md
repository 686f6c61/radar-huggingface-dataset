# dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800

## Resumen

El modelo identificado como `dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800` es un checkpoint de decoder de acciones (World2Action) perteneciente al ecosistema VAM-Cross / MimicVideo, desarrollado por el usuario `dreamdifferent`. No se trata de un modelo de lenguaje, sino de un componente de política robótica que traduce representaciones latentes de vídeo (generadas por un backbone Video2World) en comandos de acción para un brazo manipulador. El checkpoint corresponde a la iteración 1800 de un entrenamiento cuyo identificador interno es `w2a_panda_widowx_level4_widowx_texture_2cam_hstack_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`.

El problema que resuelve es la generación de acciones de efector final a partir de observaciones visuales multicámara, en un contexto de aprendizaje por imitación con datos de teleoperación. Concretamente, el modelo produce 15 acciones de efector final y pinza a 5 Hz, con objetivos de pose expresados de forma relativa a la pose alcanzada actual y rotación codificada en 6D. Trabaja con dos cámaras (`corner_cam` y `front_cam`) apiladas horizontalmente.

Su relevancia es acotada y de investigación: se publica como artefacto reproducible de un pipeline de world models para robótica, con entradas congeladas fijadas por commit y un contrato de datos explícito. El repositorio pesa 1,0 GB, tiene 0 descargas y 0 likes, y no incluye ni el dataset ni las entradas congeladas necesarias para reproducir el entrenamiento. El run que lo generó se detuvo por causa `unknown`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder de acciones World2Action sobre backbone Video2World (MimicVideo); detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de accion, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje natural de forma documentada) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye un JSON fijado y un `config.yaml` efectivo segun la model card) |
| Tamano del repositorio | 1,0 GB |
| Modalidad de entrada | Video de dos camaras: `observation.images.corner_cam`, `observation.images.front_cam` (apiladas horizontalmente) |
| Modalidad de salida | 15 acciones de efector final y pinza a 5 Hz |
| Espacio de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Representacion de rotacion | `rotation_6d` |
| Pipeline declarado | robotics |
| Etiquetas | mimic-video, robotics, action-prediction, region:us |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un decoder World2Action dentro del framework MimicVideo. La arquitectura exacta (tipo de transformer, mecanismo de atencion, si emplea difusion o flow matching, numero de capas o dimensiones ocultas) no se detalla en la model card. Lo que si se especifica es la composicion del sistema a partir de entradas congeladas fijadas por commit:

- Commit de MimicVideo: `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Backbone Video2World inicial: `dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546`
- Decoder de acciones inicial: `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d`
- LoRA de video congelada: `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-video-lora-iter200@3da54ddf6f00406150ec5a2aa526b992448e772a`

El entrenamiento se realizo sobre el dataset `dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture@334af5330c91d71d78e944607e4c61d7e2ba6cd2`, con 163 episodios y 54 200 fotogramas. El objetivo de prediccion son 15 acciones de efector final y pinza muestreadas a 5 Hz, con pose relativa a la pose alcanzada actual en el marco `widowx_reference_base/teleop_aligned_tool` y rotacion en representacion 6D. El checkpoint subido corresponde a la iteracion 1800 del run, que se detuvo con causa `unknown`; antes de seleccionar el peso se verifico el ultimo conjunto completo de checkpoints de modelo, optimizador, scheduler y trainer. No se documentan en la informacion disponible ni el numero total de tokens/pasos de entrenamiento, ni si hubo fases de RLHF o DPO (poco probables en este tipo de pipeline), ni innovaciones tecnicas adicionales.

## Capacidades

- Prediccion de acciones de efector final y pinza: genera 15 valores de accion por paso a una frecuencia de 5 Hz.
- Control de pose relativa: los objetivos se expresan de forma relativa a la pose alcanzada actual en el marco de referencia `widowx_reference_base/teleop_aligned_tool`.
- Rotacion en 6D: utiliza la representacion `rotation_6d` para la orientacion del efector final.
- Percepcion visual multicamara: consume dos flujos de imagen (`corner_cam` y `front_cam`) apilados horizontalmente.
- Aprendizaje por imitacion: entrenado a partir de grabaciones de teleoperacion (`widowx_teleop_recording_frame_v1`).
- Integracion en pipeline VAM-Cross: encaja como decoder sobre un backbone Video2World con LoRA de video congelada.
- Transferencia cross-embodiment (segun la nomenclatura del repositorio): el identificador sugiere un entrenamiento con datos de Panda y evaluacion/objetivo sobre WidowX.

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, procesamiento de lenguaje natural, vision semantica general, audio ni modo de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Manipulacion con brazo WidowX en laboratorio: el decoder produce comandos de efector final y pinza a 5 Hz a partir de dos camaras, lo que permite ejecutar politicas de pick-and-place entrenadas por imitacion sobre hardware real.
- Reproduccion de demostraciones teleoperadas: dado que el objetivo de pose es relativo a la pose actual y usa `teleop_aligned_tool`, el modelo esta pensado para replicar trayectorias capturadas con teleoperacion alineada, util en tareas de ensamblaje o colocacion precisa.
- Investigacion en world models para robotica: sirve como componente de evaluacion de la hipotesis World2Action, es decir, si las representaciones latentes de video de un backbone Video2World contienen informacion suficiente para reconstruir acciones.
- Transferencia cross-embodiment: el nombre del experimento sugiere evaluar la transferencia entre plataformas (Panda como origen de datos, WidowX como objetivo), un escenario de investigacion habitual en robotica de imitacion.
- Punto de partida para fine-tuning: al publicarse con entradas congeladas fijadas por commit y un contrato de datos explicito, puede usarse como inicializacion para nuevos datasets con la misma convencion de camaras y acciones.
- Comparacion de variantes VAM-Cross: permite contrastar el nivel de datos (level4, level5) y la presencia o ausencia de alineacion de teleoperacion frente a otros checkpoints de la misma familia.
- Reproducibilidad de experimentos: con el JSON fijado y el `config.yaml` efectivo incluidos, es util para auditar la configuracion exacta de un experimento concreto dentro de una serie de iteraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de exito de tarea, error de prediccion de accion, ni comparaciones cuantitativas con otros checkpoints. Tampoco se declara ningun resultado de evaluacion en simulador o en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,0 GB, lo que da una cota superior orientativa del peso de los artefactos publicados, pero no se confirma el tamano del modelo ni la precision de almacenamiento.
- GPU recomendadas: no disponibles. No hay datos de rendimiento ni requisitos declarados por el autor.
- Compatibilidad con GPU de consumo: probable pero no confirmada. Por el tamano del repositorio (1,0 GB), es razonable esperar que quepa en GPUs de consumo con suficiente VRAM, pero esto es una inferencia a partir del tamano de los ficheros y no un dato verificado.
- Opciones de despliegue: no disponibles. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ningun runtime especifico; al ser un decoder de acciones robotico, el despliegue esperado seria a traves del propio framework MimicVideo en su commit fijado.
- Latencia y throughput estimados: no disponibles. La frecuencia de salida del modelo es de 5 Hz (200 ms por paso de accion), que es un requisito de control, no una medicion de latencia de inferencia.

Nota importante: el repositorio no incluye el dataset ni las entradas congeladas (backbone Video2World, decoder inicial y LoRA de video). Para ejecutar el modelo hay que descargar esos artefactos por separado usando los commits indicados.

## Comparativa con modelos similares

Se comparan variantes de la misma familia VAM-Cross publicadas por el mismo autor y localizadas en la busqueda web. No se dispone de datos de rendimiento para ninguna de ellas.

| Modelo | Nivel / datos | Componente | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vam-cross-level4-...-videolora200-action-decoder-iter1800 (este modelo) | level4, teleop-aligned | Decoder de acciones World2Action | WidowX, 2 camaras, 15 acciones a 5 Hz | no disponible | Publico en HuggingFace, 0 descargas |
| vam-cross-level5-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800 | level5, teleop-aligned | Decoder de acciones (misma nomenclatura) | WidowX, LoRA de video iter200 | no disponible | Publico en HuggingFace |
| vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-e93504a7d3 | level4, teleop-aligned, robosuite | Decoder de acciones | Entorno RoboSuite, LoRA de video iter400 | no disponible | Publico en HuggingFace |
| vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-56355f5f5f | level4, teleop-aligned, ur5e, contact-v2 | Decoder de acciones | UR5e con pinza Robotiq | no disponible | Publico en HuggingFace |

Diferencias observadas en los identificadores: el nivel del dataset (level2, level4, level5), el numero de iteraciones de la LoRA de video (200, 400), el robot objetivo (WidowX, UR5e) y el tipo de pinza (Panda, Robotiq). No hay informacion publica sobre diferencias de calidad entre estas variantes.

## Limitaciones y advertencias

- Sin licencia declarada: el repositorio no especifica licencia, por lo que el uso comercial queda en una situacion juridica indeterminada. No debe asumirse permiso de uso comercial.
- Reproducibilidad incompleta: la model card indica explicitamente que el dataset y las entradas congeladas no estan incluidos. Sin descargar esos artefactos por sus commits exactos, el checkpoint no es ejecutable.
- Entrenamiento interrumpido: el run se detuvo con causa `unknown`, lo que introduce incertidumbre sobre si la iteracion 1800 corresponde a un punto de convergencia o a una parada abrupta.
- Sin evaluacion publicada: 0 descargas y 0 likes, sin benchmarks ni metricas de exito de tarea. No hay evidencia publica de que la politica funcione en hardware real.
- Ambiguedad de nivel entre artefactos: el identificador del repositorio indica `level4`, mientras que la LoRA de video congelada referenciada en la model card corresponde a un repositorio `level5`. Conviene verificar la configuracion efectiva antes de reproducir.
- Dependencia fuerte del contrato de datos: el modelo espera exactamente dos camaras concretas, acciones a 5 Hz, pose relativa en `widowx_reference_base/teleop_aligned_tool` y rotacion 6D. Cambiar cualquier elemento de ese contrato invalida la politica.
- Dominio estrecho: es un decoder de acciones para manipulacion; no generaliza a texto, vision general, dialogo ni tareas fuera del espacio de acciones entrenado.
- Riesgo de sobreajuste al montaje experimental: 163 episodios y 54 200 fotogramas es un volumen reducido, lo que favorece el ajuste a las condiciones especificas de iluminacion, camaras y disposicion de la mesa de captura.
- Sin datos de sesgos: no hay informacion sobre comportamiento fuera de distribucion, recuperacion ante fallos o degradacion con objetos o texturas no vistos. La unica pista al respecto es la etiqueta `texture` en los nombres de dataset, que sugiere un enfasis en variacion de texturas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800
- Variante level5 equivalente: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800
- Variante RoboSuite: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-e93504a7d3
- Variante UR5e con pinza Robotiq: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-56355f5f5f
- LoRA de video de la misma serie (iter400): https://huggingface.co/dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture-video-lora-iter400
- LoRA de video level2 (iter400): https://huggingface.co/dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture-video-lora-iter400
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decoder de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de video congelada (level5, iter200): https://huggingface.co/dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-video-lora-iter200
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture
- Paper o documentacion tecnica de MimicVideo: no disponible
- Repositorio de codigo: no disponible (solo se referencia el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`)
