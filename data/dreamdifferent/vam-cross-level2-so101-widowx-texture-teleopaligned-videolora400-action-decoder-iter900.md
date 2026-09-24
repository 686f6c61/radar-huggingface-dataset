# dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter900

## Resumen

Este repositorio contiene un checkpoint del decodificador World2Action (W2A) del proyecto VAM-Cross MimicVideo, publicado por el usuario `dreamdifferent`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un modulo de prediccion de acciones para robotica que traduce la representacion latente de un modelo de video (Video2World) en comandos de actuador para un brazo robotico. El checkpoint corresponde a la iteracion 900 del run `w2a_so101_level2_widowx_texture_2cam_hstack_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1`, que finalizo con estado `completed`.

El artefacto forma parte de un pipeline por etapas en el que un backbone de video congelado (`dreamdifferent/widowx250-video-fused`) y una LoRA de video tambien congelada (`...video-lora-iter-400`) alimentan a un decodificador de acciones entrenable. El contrato de datos apunta al brazo SO-101 con datos de teleoperacion alineados de WidowX, dos camaras y un objetivo de 15 acciones de efector final y pinza a 5 Hz.

Su relevancia practica es limitada y muy experimental: en el momento de la consulta acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y el repositorio de 1,0 GB contiene unicamente el decodificador, sin el dataset ni los pesos congelados necesarios para reproducir el sistema completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action (W2A) sobre backbone de video Video2World congelado; arquitectura interna detallada no disponible |
| Parametros totales | no disponible (el repositorio ocupa 1,0 GB e incluye pesos, `config.yaml` efectivo y JSON anclado) |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible; la salida es un chunk de 15 acciones a 5 Hz (3 segundos de horizonte) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de robotica; no se documenta interfaz de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se documentan `config.yaml` efectivo y JSON anclado en el repositorio) |

## Arquitectura y entrenamiento

La model card describe un decodificador World2Action entrenado de forma desacoplada del modelo de video: el backbone Video2World y su adaptador LoRA permanecen congelados, y solo se optimiza la cabeza que convierte la prediccion visual en acciones. El run de entrenamiento combina 2374 iteraciones de accion y 400 de LoRA de video, y el checkpoint subido es la iteracion 900 seleccionada tras verificar que existia un conjunto completo y valido de pesos de modelo, optimizador, scheduler y trainer. El nombre del run incluye `2cam_hstack`, lo que indica concatenacion horizontal de las dos vistas de camara como entrada.

El contrato de datos es explicito: 298 episodios y 54354 frames, camaras `observation.images.corner_cam` y `observation.images.front_cam`, objetivo de 15 acciones logradas de efector final y pinza a 5 Hz, pose objetivo `relative_to_current_achieved_pose` en el sistema `widowx_reference_base/teleop_aligned_tool` y rotacion representada como `rotation_6d`. Repositorios relacionados del mismo ecosistema (por ejemplo `MarvStein/so101-world-model`) describen el uso de tiempos de flujo desacoplados para video y acciones y una unica pasada del modelo de video por chunk de acciones, si bien no se confirma que este checkpoint concreto emplee exactamente ese esquema.

## Capacidades

- Prediccion de acciones de robot: genera chunks de 15 acciones de efector final y pinza a 5 Hz.
- Control a partir de vision: consume dos vistas de camara (`corner_cam` y `front_cam`) concatenadas horizontalmente.
- Representacion de pose: trabaja con poses relativas respecto a la pose lograda actual y rotaciones en `rotation_6d`.
- Aprendizaje por imitacion sobre teleoperacion: entrenado con grabaciones de teleoperacion alineadas de WidowX sobre la plataforma SO-101.
- Integracion en un pipeline de world model: depende de un backbone de video y una LoRA de video congelados como entrada obligatoria.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision generativa, audio): no documentadas; la vision se usa como entrada, no como salida.

## Casos de uso

- Investigacion en world models para robotica: permite reproducir el pipeline VAM-Cross MimicVideo fijando los commits exactos de MimicVideo, backbone de video, decodificador base y LoRA congelada, y evaluar como evoluciona la prediccion de acciones a lo largo de las iteraciones.
- Control de manipulacion con SO-101: el decodificador puede integrarse en un bucle de control que reciba dos imagenes de camara y emita 15 acciones por chunk, con replanificacion cada 3 segundos a 5 Hz.
- Aprendizaje por imitacion con datos de teleoperacion: sirve como punto de partida para experimentos de imitacion sobre el dataset `vam-cross-level2-so101-widowx-texture` (298 episodios, 54354 frames).
- Estudio de decodificadores desacoplados del modelo de video: al mantener congelado el backbone visual, es un artefacto adecuado para medir cuanto rendimiento de accion puede extraerse sin actualizar el modelo de video.
- Comparacion de variantes de entrenamiento: los repositorios hermanos (misma receta con `videolora200` frente a `videolora400`, y niveles `level2` frente a `level5`) permiten analizar el efecto del presupuesto de LoRA y del nivel de datos sobre el decodificador.
- Fine-tuning sobre una nueva morfologia o tarea: al ser una cabeza de accion relativamente ligera, resulta candidata a reentrenamiento contra un backbone de video distinto, siempre que se respete el contrato de acciones y el sistema de referencia.
- Reproducibilidad y auditoria de experimentos: el repositorio incluye el `config.yaml` efectivo y un JSON anclado con los commits congelados, lo que facilita verificar exactamente que configuracion produjo el checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito de tarea, error de posicion, tasas de exito en simulacion o en robot real, ni comparaciones cuantitativas con otros decodificadores. Tampoco aplican benchmarks de lenguaje (MMLU, GSM8K, HumanEval) por la naturaleza del modelo.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. El repositorio completo ocupa 1,0 GB, pero corresponde solo al decodificador; el backbone de video congelado necesario para la inferencia no esta incluido y su huella de memoria no se especifica.
- GPU recomendadas: no disponible. Al tratarse de un pipeline de robotica con un modelo de video como componente principal, es previsible que requiera GPU dedicada, pero no hay especificacion de modelos concretos.
- Viabilidad en GPU de consumo: no confirmada. El decodificador por si solo parece pequeno, pero el coste dominante recae en el backbone de video congelado, cuyo tamano no se documenta en este repositorio.
- Opciones de despliegue: no se documentan. Las herramientas habituales para LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de artefacto; el ecosistema natural es PyTorch y frameworks de robotica como LeRobot.
- Latencia y throughput: no disponibles. El unico dato temporal es la frecuencia de accion objetivo de 5 Hz y el horizonte de 15 acciones por chunk (3 segundos).

## Comparativa con modelos similares

| Modelo | Variante | Iteracion del checkpoint | Estado del run | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter900` | level2, videolora400 | 900 | `completed` | no disponible | publico, 0 descargas |
| `dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900` | level2, videolora200 | 900 | `unknown` | no disponible | publico |
| `dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter900` | level5, videolora400 | 900 | `unknown` | no disponible | publico |
| `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder` | decodificador base inicial | no disponible | no disponible | no disponible | publico |

No se dispone de modelos de terceros directamente comparables con datos de rendimiento publicados para este checkpoint concreto. Los repositorios `arnavsukhija/world-model-so101` y `MarvStein/so101-world-model` abordan el mismo problema conceptual (aprender decodificadores de accion sobre modelos de video para SO-101), pero no se ofrecen cifras comparativas en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; tratarlo como artefacto de investigacion.
- Ausencia total de benchmarks: no hay evidencia publicada de tasas de exito, precision de pose o robustez, ni en simulacion ni en robot real.
- Artefacto sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Reproducibilidad incompleta: el dataset (`dreamdifferent/vam-cross-level2-so101-widowx-texture`) y los pesos congelados no se incluyen, por lo que la inferencia exige resolver manualmente cuatro dependencias con commits fijados.
- Dependencia estricta de versiones: el funcionamiento correcto esta ligado a commits concretos de MimicVideo, backbone Video2World, decodificador base y LoRA de video; cualquier desviacion puede invalidar el checkpoint.
- Especificidad de dominio: el contrato de acciones esta definido para un unico sistema de referencia (`widowx_reference_base/teleop_aligned_tool`) y una morfologia concreta (SO-101 con datos de WidowX), lo que limita la transferencia directa a otros robots.
- Frecuencia de control baja: 5 Hz con chunks de 15 acciones impide tareas que requieran reactividad por debajo de 200 ms.
- Sin capacidades de lenguaje ni agenticas: no hay soporte de tool calling, dialogo, razonamiento multi-paso ni multilingue.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones de accion fisicamente invalidas o no consistentes con la observacion, sin que se documenten mecanismos de filtrado o verificacion.
- Metadatos inconsistentes: las fechas de creacion y actualizacion registradas (2026-09-23) son posteriores a la fecha de consulta y no cuadran con un repositorio ya publicado, lo que resta fiabilidad a la informacion de la ficha de HuggingFace.
- Ausencia de informacion sobre sesgos: no se documenta composicion demografica ni geografica del dataset de teleoperacion, aunque su impacto es limitado al tratarse de datos de manipulacion robotica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter900
- Variante videolora200: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Variante level5 videolora400: https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora400-action-decoder-iter900
- Backbone Video2World congelado: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de accion inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de video congelada: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-video-lora-iter-400
- Dataset de entrenamiento: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture
- Repositorio relacionado (Video-Action Models para SO-101): https://github.com/arnavsukhija/world-model-so101
- Repositorio relacionado (SO-101 world model): https://github.com/MarvStein/so101-world-model
