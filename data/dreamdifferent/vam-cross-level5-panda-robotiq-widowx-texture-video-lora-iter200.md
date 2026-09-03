# dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-video-lora-iter200

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para generación de video, desarrollado por el usuario `dreamdifferent`. Se trata de un checkpoint de la iteración 200 de un entrenamiento de Video2World, un modelo de difusión que genera vídeo condicionado a instrucciones, aplicado al dominio de la robótica. Concretamente, el adaptador está diseñado para un escenario de manipulación con un brazo robótico Panda equipado con una pinza Robotiq, observado desde dos cámaras (esquina y frontal), y entrenado con la instrucción "pick up the candle and place it into the bowl".

El modelo no es un sistema autónomo, sino un adaptador que debe cargarse sobre un backbone específico: un DiT (Diffusion Transformer) fusionado llamado `fused_video2world_dit`, disponible en el repositorio `dreamdifferent/widowx250-video-fused`. Este backbone ya incorpora una fusión previa de datos WidowX/Bridge, por lo que cargar el backbone original de Bridge sería incorrecto. La relevancia de este adaptador radica en su capacidad para especializar un modelo de generación de video a tareas robóticas concretas con un coste de entrenamiento reducido, lo que facilita la generación de datos sintéticos o la simulación de comportamientos en entornos de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre DiT de video (Video2World) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (adaptador LoRA) |
| Longitud de contexto | no disponible (generacion de video, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instruccion en ingles, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | checkpoint LoRA (formato no especificado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango 256 (según el nombre del run: `v2w_panda_robotiq_level5_widowx_texture_2cam_hstack_from_widowx250_video_fused_f0cea76_lora_r256`). Se entrena sobre un modelo de difusión de video (Video2World) basado en un DiT fusionado, que ya incluye una fusión de pesos de WidowX/Bridge. El backbone requerido es `fused_video2world_dit`, con un checkpoint de 3.9 GB (iteración 1060). El entrenamiento se realizó con el código MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`), un tokenizador de video y un codificador de texto T5-11B.

Los datos de entrenamiento provienen de un dataset de robótica con 172 episodios y 54 256 frames, capturados con dos cámaras (`corner_cam` y `front_cam`) en formato `hstack` a 5 Hz. La instrucción asociada es "pick up the candle and place it into the bowl". El dataset no se incluye en el repositorio y su acceso está sujeto a la política del mismo y a los términos de MimicVideo, NVIDIA Cosmos y el checkpoint base.

## Capacidades

- Generación de video condicionada a instrucciones en el dominio robótico, específicamente para tareas de manipulación (pick-and-place).
- Adaptación a un escenario concreto con dos cámaras y una tarea definida, lo que permite generar vídeos sintéticos de ejecución de la tarea.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso u otras capacidades generales; el modelo está especializado en generación de video.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de políticas robóticas: el modelo puede producir vídeos de un robot realizando la tarea de recoger una vela y colocarla en un cuenco, lo que permite aumentar conjuntos de datos reales sin necesidad de capturas adicionales.
- Simulación de escenarios de manipulación para validación de algoritmos de planificación: al generar vídeos realistas de la ejecución, se pueden probar estrategias de control antes de implementarlas en el robot físico.
- Aumento de datos para aprendizaje por imitación: los vídeos generados pueden utilizarse como demostraciones adicionales para entrenar políticas visuomotoras.
- Pruebas de robustez de modelos de percepción: los vídeos sintéticos permiten evaluar la respuesta de sistemas de visión ante variaciones en la iluminación, ángulos de cámara o texturas.
- Desarrollo de entornos de simulación para investigación en robótica: el adaptador puede integrarse en pipelines de generación de contenido para crear escenarios de entrenamiento variados.
- Demostración de técnicas de adaptación eficiente (LoRA) en modelos de generación de video para dominios especializados, sirviendo como referencia para otros proyectos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.7 GB, pero requiere cargar el backbone `fused_video2world_dit` de aproximadamente 3.9 GB, por lo que se necesita una GPU con suficiente VRAM para alojar ambos.
- No se especifican GPUs concretas ni requisitos de memoria exactos; se recomienda una GPU con al menos 16 GB de VRAM para el backbone, aunque el tamaño final depende de la resolución de vídeo y la configuración del modelo.
- El despliegue requiere el código MimicVideo y los artefactos de runtime (tokenizador de video y codificador de texto T5-11B), por lo que no es un modelo autocontenido.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No disponible. Al ser un adaptador específico para un backbone concreto y una tarea robótica muy particular, no se dispone de información sobre modelos comparables en la misma categoría.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: debe cargarse sobre el backbone exacto `fused_video2world_dit` (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`); cargar otro backbone daría resultados incorrectos.
- El dataset de entrenamiento no está incluido; los usuarios deben cumplir con su política de acceso y con los términos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- La licencia del modelo no está especificada, por lo que se desconoce si permite uso comercial.
- El modelo está entrenado para una única tarea (recoger una vela y colocarla en un cuenco) y con un layout de cámaras fijo; su generalización a otras tareas o configuraciones es limitada.
- Al ser un modelo generativo de video, existe riesgo de alucinación visual (movimientos irreales, artefactos) y de sesgos derivados de los datos de entrenamiento.
- El entrenamiento se detuvo por límite de tiempo (`walltime`), lo que podría implicar que el modelo no alcanzó la convergencia total.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-video-lora-iter200
- Repositorio del backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
