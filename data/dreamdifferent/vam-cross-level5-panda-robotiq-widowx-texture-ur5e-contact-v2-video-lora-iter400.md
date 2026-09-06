# dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400

## Resumen

Este modelo es un adaptador LoRA de generación de video para robótica, desarrollado por el usuario `dreamdifferent`. Forma parte de la familia VAM-Cross y está diseñado para generar videos de acciones de manipulación a partir de instrucciones de texto, en el marco del proyecto MimicVideo. El checkpoint concreto corresponde a la iteración 400 de un entrenamiento sobre un dataset de 165 episodios y 54343 fotogramas, con dos cámaras apiladas horizontalmente, para la tarea de recoger una vela y colocarla en un cuenco. No es un modelo base, sino un adaptador que debe cargarse sobre un backbone `fused_video2world_dit` específico, de tipo DiT fusionado, que ya integra una fusión previa de WidowX/Bridge.

La relevancia del modelo radica en su utilidad para síntesis de datos robóticos y aprendizaje por imitación, permitiendo generar demostraciones de video sintéticas para tareas de manipulación. El repositorio tiene un tamaño de 3.7 GB, pero el checkpoint de LoRA no es independiente: requiere el backbone inicial, un tokenizador de video y un codificador de texto T5-11b. No se han publicado especificaciones completas de arquitectura ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre backbone DiT fusionado de Video2World (`fused_video2world_dit`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un checkpoint de adaptación LoRA de rango 256 (según el identificador `lora_r256`) para generación de video condicionada por texto en el pipeline Video2World. Se basa en un backbone `fused_video2world_dit`, un Diffusion Transformer que debe cargarse desde el repositorio `dreamdifferent/widowx250-video-fused` en la revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`. El backbone inicial ya contiene la fusión de los LoRA anteriores de WidowX/Bridge, por lo que no se debe sustituir por el backbone Bridge original.

El entrenamiento se realizó con el framework MimicVideo, usando el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` y el bundle `jonpai/mimic-video@f28339034831e3c2374be075e622e1ff38ebe0f8`. El dataset de entrenamiento consta de 165 episodios y 54343 fotogramas, con dos cámaras (`corner_cam` y `front_cam`) dispuestas en `hstack` a 5 Hz, y la instrucción textual "pick up the candle and place it into the bowl". No se han publicado detalles sobre la composición completa del dataset, ni sobre procesos de RLHF o DPO.

## Capacidades

- Generacion de video condicionada por texto: produce secuencias de video de acciones robóticas a partir de instrucciones en inglés.
- Entrada de dos cámaras: utiliza dos vistas (esquina y frontal) apiladas horizontalmente para generar video con información de perspectiva o profundidad.
- Adaptacion cross-embodiment: pertenece a la familia VAM-Cross, orientada a transferencia entre distintos brazos robóticos (Panda, WidowX, UR5e, Robotiq).
- Requiere el pipeline completo de MimicVideo: tokenizador de video y codificador de texto T5-11b; no funciona de forma aislada.
- No se han identificado capacidades explícitas de tool calling, razonamiento de texto ni generación de código en la información disponible.

## Casos de uso

- Generacion de demostraciones sinteticas para aprendizaje por imitacion: el modelo puede producir videos de la tarea "recoger la vela y colocarla en el cuenco" a partir de la instrucción, permitiendo aumentar un dataset de demostraciones reales sin necesidad de teleoperar el brazo en cada ocasión.
- Aumento de datos para modelos VLA (vision-lenguaje-accion): los videos generados pueden emparejarse con acciones para entrenar políticas de manipulación, aprovechando la consistencia de la instrucción textual.
- Validacion de politicas en simulacion: dado que el modelo se entrenó con datos de contacto UR5e y WidowX, puede utilizarse para visualizar el comportamiento esperado de una política antes de desplegarla en el robot real.
- Exploracion de tareas de contacto: la inclusión de `ur5e-contact-v2` en el nombre sugiere que el modelo está pensado para estudiar interacciones de contacto, por lo que puede usarse para generar escenarios de manipulación donde el objeto entra en contacto con superficies.
- Transferencia entre morfologias (cross-embodiment): como parte de VAM-Cross, el modelo puede servir para evaluar cómo se comporta una tarea aprendida con un brazo Panda cuando se traslada a un WidowX o a un UR5e con pinza Robotiq.
- Entrenamiento de modelos de prediccion de video (Video2World): el adaptador puede usarse como componente en pipelines de predicción de video para robótica, donde el modelo genera el siguiente frame o secuencia condicionada por la instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint requiere el backbone `fused_video2world_dit` (3.9 GB), el tokenizador de video y el codificador T5-11b, lo que implica una GPU de gama alta, pero no se especifican cifras concretas.
- GPU recomendadas: no disponibles en la información del modelo.
- Compatibilidad con GPU de consumo: no se puede determinar; la presencia de T5-11b y un backbone de video de 3.9 GB hace poco probable la ejecución en GPUs de consumo, pero no se ha confirmado.
- Opciones de despliegue: el modelo está diseñado para usarse con el framework MimicVideo y el código/configuración del repositorio; no se menciona compatibilidad con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Diferencias principales |
|---|---|
| vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400 | Incluye `ur5e-contact-v2`; dataset con contacto UR5e y dos cámaras (`corner_cam`, `front_cam`); 165 episodios y 54343 fotogramas. |
| vam-cross-level5-panda-robotiq-widowx-texture-video-lora-iter400 | Sin `ur5e-contact-v2`; no se disponen de datos de entrenamiento. |
| vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-400 | Incluye `robosuite`; no se disponen de datos de entrenamiento. |

El modelo también se puede comparar con el backbone base `dreamdifferent/widowx250-video-fused`, que es el modelo completo y no un adaptador.

## Limitaciones y advertencias

- No es un modelo independiente: es un adaptador LoRA que requiere el backbone exacto `fused_video2world_dit` en la revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`; cargar un backbone incorrecto producirá resultados erróneos.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Especializacion extrema: el modelo se entrenó para una única instrucción ("recoger la vela y colocarla en el cuenco") con 165 episodios; su generalización a otras tareas, objetos o entornos no está garantizada.
- Dependencia de artefactos externos: requiere el tokenizador de video, el T5-11b y el bundle de MimicVideo; si estos no están disponibles, el modelo no puede ejecutarse.
- Datos de entrenamiento no incluidos: el dataset original no se distribuye con el repositorio; los usuarios deben cumplir la política de acceso del dataset y los términos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- Sin evaluaciones de seguridad: no se han publicado análisis de sesgos, alucinaciones ni riesgos asociados a la generación de video.
- Posible sobreajuste a la configuracion de camaras: la entrada `hstack` de dos cámaras a 5 Hz limita la compatibilidad con otros formatos de video.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Variante sin contacto UR5e: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-video-lora-iter400
- Variante con Robosuite: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-400
- Referencia a MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`) y bundle `jonpai/mimic-video@f28339034831e3c2374be075e622e1ff38ebe0f8`
