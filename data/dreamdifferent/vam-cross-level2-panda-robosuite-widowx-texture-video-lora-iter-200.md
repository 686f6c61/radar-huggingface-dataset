# dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-video-lora-iter-200

## Resumen

Este repositorio contiene un adaptador LoRA de generación de video para robótica, desarrollado por el usuario `dreamdifferent`. Se trata de un checkpoint de entrenamiento de la iteración 200 del proyecto VAM-Cross, que adapta el modelo Video2World de MimicVideo para generar vídeos de manipulación robótica con dos cámaras sincronizadas. El modelo está diseñado para tareas de control y planificación visual en entornos simulados (Robosuite con el brazo Panda) y reales (WidowX 250), utilizando instrucciones condicionadas por episodio.

El adaptador no es un modelo autónomo: requiere cargar primero el backbone fusionado `fused_video2world_dit` del repositorio `dreamdifferent/widowx250-video-fused` (revisión `f0cea76b`), que ya incorpora una fusión previa de LoRA de WidowX/Bridge. Sobre ese backbone se aplica este LoRA de 0.7 GB, que ajusta la generación de vídeo para el dataset específico de dos cámaras con vista apilada horizontalmente (hstack) a 5 Hz. La relevancia de este modelo radica en su enfoque de adaptación eficiente para generación de vídeo condicionada a instrucciones en robótica, un área emergente para el entrenamiento de políticas visuales y la simulación de trayectorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre backbone `fused_video2world_dit` (MimicVideo Video2World) |
| Parametros totales | no disponible (el LoRA ocupa 0.7 GB en disco) |
| Parametros activos | no disponible (adaptador LoRA, no se especifica el ratio de activacion) |
| Longitud de contexto | no disponible (generacion de video, no texto) |
| Tipos de cuantizacion | no disponible (checkpoint en formato nativo de PyTorch) |
| Idiomas soportados | no disponible (instrucciones en ingles segun el manifest, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de entrenamiento (probablemente `.pt` o `.safetensors`, no especificado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre un backbone de difusion de video denominado `fused_video2world_dit`. Este backbone es un modelo de tipo Diffusion Transformer (DiT) fusionado, que ya incluye una adaptacion previa de LoRA para los datos WidowX/Bridge. El adaptador de este repositorio se entrena para el dataset `vam-cross-level2-panda-robosuite-widowx-texture`, que contiene 280 episodios y 54.426 frames, con dos camaras (`corner_cam` y `front_cam`) combinadas en una vista apilada horizontalmente (hstack) a 5 Hz. Las tareas son 24 instrucciones condicionadas por episodio, listadas en el archivo `vam_cross_video_lora_manifest.json`.

El entrenamiento se realizo con el codigo de MimicVideo (commit `e3355dbc`) y el tokenizador de video y el codificador de texto T5-11B especificados en los artefactos de soporte. El checkpoint corresponde a la iteracion 200 de un entrenamiento que termino por tiempo de ejecucion (`walltime`). El proceso de seleccion de pesos verifico el conjunto de cuatro componentes antes de publicar el modelo. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; el entrenamiento es puramente de generacion de video condicionada.

## Capacidades

- Generacion de video condicionada a instrucciones de texto para tareas de manipulacion robotica (Panda en Robosuite y WidowX 250).
- Soporte de dos camaras sincronizadas con vista apilada horizontalmente, lo que permite capturar informacion espacial desde dos angulos.
- Adaptacion eficiente mediante LoRA, sin necesidad de reentrenar el modelo completo.
- Integracion con el ecosistema MimicVideo, incluyendo tokenizador de video y codificador de texto T5.
- Capacidad de generar secuencias de video a 5 Hz, adecuadas para simulacion de trayectorias y entrenamiento de politicas visuales.
- No se especifican capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de generacion de video, no un LLM conversacional.

## Casos de uso

- Entrenamiento de politicas de manipulacion robotica: el modelo puede generar videos sinteticos de demostraciones de tareas (por ejemplo, recoger y colocar objetos) que sirven como datos aumentados para entrenar politicas de control visual.
- Simulacion de trayectorias en entornos simulados: dado un estado inicial y una instruccion, el modelo genera la secuencia de video correspondiente, util para validar planes de movimiento en Robosuite antes de ejecutarlos en el robot real.
- Aumento de datos para aprendizaje por imitacion: los videos generados pueden combinarse con datos reales de WidowX para mejorar la robustez de los modelos de imitacion, especialmente en escenarios con variaciones de textura o iluminacion.
- Evaluacion de modelos de mundo (world models): el adaptador permite probar la capacidad de un modelo de mundo para predecir estados futuros a partir de observaciones de dos camaras, util en investigacion de planificacion basada en modelos.
- Generacion de contenido para simuladores de robotica: los videos generados pueden integrarse en plataformas de simulacion como Robosuite para crear escenarios de entrenamiento mas variados sin necesidad de capturar datos reales adicionales.
- Investigacion en generacion de video condicionada a instrucciones: el modelo sirve como referencia para estudiar como los adaptadores LoRA pueden transferir conocimiento entre dominios roboticos (de WidowX a Panda) manteniendo la coherencia temporal y espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de video (como FVD, IS o CLIP score) ni comparaciones con otros modelos de generacion de video para robotica.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 0.7 GB, pero requiere el backbone fusionado de 3.9 GB (archivo `iter_000001060_fused.pt`), por lo que el modelo completo necesita al menos 4.6 GB de almacenamiento.
- Para inferencia, se necesita una GPU con suficiente VRAM para cargar el backbone DiT fusionado y el tokenizador de video. Estimacion orientativa: al menos 16 GB de VRAM para una resolucion moderada (por ejemplo, 256x256), y 24 GB o mas para resoluciones superiores o lotes mayores.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para entrenamiento o inferencia a gran escala.
- El despliegue requiere el codigo de MimicVideo (commit `e3355dbc`) y los artefactos de soporte (tokenizador y T5). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no estan especificados; dependen de la resolucion de video, el numero de frames y la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vam-cross-level2-panda-robosuite-widowx-texture-video-lora-iter-200` (este) | LoRA sobre MimicVideo Video2World | no disponible | no disponible | no disponible | Publico en HF |
| `vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-200` | LoRA sobre MimicVideo Video2World | no disponible | no disponible | no disponible | Publico en HF |
| `vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec` | LoRA con decodificador de acciones | no disponible | no disponible | no disponible | Publico en HF |

Los tres modelos pertenecen a la misma familia VAM-Cross y comparten el mismo backbone base. La diferencia principal es el nivel de dificultad de las tareas (level2 vs level5) y la inclusion de un decodificador de acciones en el tercer modelo. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo es un adaptador, no un modelo autonomo: cargarlo sin el backbone exacto especificado (revision `f0cea76b`) dara resultados incorrectos.
- La licencia no esta especificada, por lo que el uso comercial es incierto. Se debe consultar al autor antes de cualquier despliegue en produccion.
- El dataset de entrenamiento no esta incluido y tiene una politica de acceso propia; los usuarios deben cumplir con los terminos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- El entrenamiento se detuvo por tiempo de ejecucion (`walltime`), lo que podria implicar que el modelo no alcanzo la convergencia total.
- Limitado a las 24 instrucciones del manifest; no se garantiza generalizacion a tareas fuera de ese conjunto.
- No se proporcionan metricas de calidad de video ni evaluacion de sesgos; se desconoce el comportamiento en escenarios con objetos no vistos o variaciones extremas de iluminacion.
- El modelo genera video a 5 Hz, lo que puede no ser suficiente para aplicaciones de control en tiempo real de alta frecuencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-video-lora-iter-200
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Modelo similar (level5): https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-200
- Modelo similar con decodificador de acciones: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-c8fb3c68cd
- Codigo MimicVideo (commit referenciado): no se proporciona URL directa, pero se menciona el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`
