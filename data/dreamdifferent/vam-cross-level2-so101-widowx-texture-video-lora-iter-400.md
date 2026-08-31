# dreamdifferent/vam-cross-level2-so101-widowx-texture-video-lora-iter-400

## Resumen

Este repositorio contiene un adaptador LoRA de generación de video para robótica, desarrollado por el usuario `dreamdifferent`. Se trata de un checkpoint entrenable de la iteración 400 de un entrenamiento de Video2World con dos cámaras sobre el brazo robótico WidowX. El modelo no es un sistema autónomo, sino un adaptador que debe cargarse sobre un backbone específico de difusión de video (`fused_video2world_dit`) para generar secuencias de video condicionadas por instrucciones de tareas robóticas.

El modelo forma parte del ecosistema MimicVideo y está orientado a la predicción de mundos (world models) para robótica, utilizando dos vistas de cámara (esquina y frontal) combinadas en un layout horizontal. Su relevancia radica en permitir la generación de datos sintéticos de video para entrenamiento de políticas robóticas, así como la simulación de escenarios de manipulación. El tamaño del repositorio es de 3,7 GB, aunque el checkpoint LoRA en sí ocupa 742 MB según la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion de video (fused_video2world_dit) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el text encoder es T5-11B, probablemente multilingue, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) diseñado para ajustar un modelo de difusion de video preentrenado llamado `fused_video2world_dit`. Este backbone ya incluye una fusion previa de LoRA de WidowX/Bridge, por lo que no debe cargarse sobre el backbone original de Bridge. El adaptador se entrena sobre datos de video de dos camaras (esquina y frontal) apiladas horizontalmente a 5 Hz, con 298 episodios y 54 354 frames en total, correspondientes a 24 tareas de manipulacion con instrucciones en lenguaje natural.

El entrenamiento se realizo con el codigo y la configuracion de MimicVideo, utilizando un tokenizador de video y un text encoder T5-11B. El checkpoint corresponde a la iteracion 400 de un run que termino por tiempo de computo (`walltime`). No se especifican detalles sobre el dataset de entrenamiento mas alla de su origen (`dreamdifferent/vam-cross-level2-so101-widowx-texture`), ni sobre tecnicas como RLHF o DPO, que no se mencionan.

## Capacidades

- Generacion de video condicionada por instrucciones de tareas roboticas (Video2World).
- Soporte de dos vistas de camara simultaneas (esquina y frontal) combinadas en un unico frame.
- Adaptacion especifica para el brazo robotico WidowX, con 24 tareas de manipulacion definidas.
- Integracion con el ecosistema MimicVideo para generacion de mundos sinteticos.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento multi-step, al ser un modelo de generacion de video.

## Casos de uso

- Generacion de datos sinteticos de video para entrenamiento de politicas roboticas: el modelo puede producir secuencias de video realistas de manipulacion con dos camaras, ampliando el conjunto de datos disponible sin necesidad de capturas fisicas adicionales.
- Simulacion de escenarios de manipulacion para validacion de algoritmos: permite probar estrategias de control en un entorno visual sintetico antes de desplegarlas en el robot real.
- Aumento de datos para aprendizaje por imitacion: las secuencias generadas pueden combinarse con datos reales para mejorar la robustez de politicas aprendidas.
- Desarrollo de world models para planificacion: al predecir la evolucion del video a partir de una instruccion, puede servir como componente de un modelo del mundo para planificacion de movimientos.
- Evaluacion de politicas en entornos visuales variados: el modelo puede generar variaciones de textura o iluminacion (segun el nombre del run) para estresar los modelos de control.
- Investigacion en generacion de video condicionada por instrucciones: util como punto de partida para estudios sobre adaptacion LoRA en modelos de difusion de video para robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentacion del modelo.
- El backbone `fused_video2world_dit` pesa aproximadamente 3,9 GB (3913057284 bytes), y el adaptador LoRA 742 MB. Ademas se requiere el tokenizador de video y el text encoder T5-11B, que tiene alrededor de 11 000 millones de parametros.
- Para inferencia, se estima que se necesita una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100) para cargar el modelo completo y el text encoder. Sin embargo, esta es una estimacion basada en el tamano de los componentes, no en datos oficiales.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje sino de video. Se usaria el codigo de MimicVideo para cargar y ejecutar el modelo.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (adaptadores LoRA para generacion de video robotico con dos camaras). Existe otro checkpoint del mismo autor (`vam-cross-level5-so101-widowx-texture-video-lora-iter-200`) con caracteristicas similares, pero no se han publicado comparaciones de rendimiento. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere cargar el backbone exacto especificado (`dreamdifferent/widowx250-video-fused` con revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`). Cargar otro backbone daria resultados incorrectos.
- La licencia no esta disponible, por lo que se desconoce si permite uso comercial o modificacion.
- El dataset de entrenamiento no esta incluido y su acceso esta sujeto a una politica de acceso especifica, ademas de los terminos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- El modelo esta especializado en el brazo WidowX y en las 24 tareas definidas; su generalizacion a otros robots o tareas no esta garantizada.
- No se han publicado evaluaciones de sesgos o alucinaciones visuales. Como modelo generativo de video, puede producir artefactos o secuencias irreales en situaciones fuera de su distribucion de entrenamiento.
- La fecha de creacion (2026-08-31) es posterior a la fecha actual, lo que sugiere que la informacion puede ser experimental o de un entorno de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-video-lora-iter-400
- Perfil del autor: https://huggingface.co/dreamdifferent
- Checkpoint similar (level5): https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-video-lora-iter-200/tree/main
