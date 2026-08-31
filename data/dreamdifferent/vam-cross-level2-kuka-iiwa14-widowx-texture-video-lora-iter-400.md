# dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture-video-lora-iter-400

## Resumen

Este repositorio contiene un checkpoint LoRA de adaptación para el sistema MimicVideo Video2World, desarrollado por el usuario `dreamdifferent`. Se trata de un adaptador entrenado para la generación de video condicionada a instrucciones en el ámbito de la robótica, específicamente para el brazo KUKA IIWA 14 y el gripper WidowX. El modelo permite sintetizar secuencias de video fotorrealistas de ejecuciones robóticas a partir de descripciones textuales de tareas, utilizando dos cámaras simultáneas (corner y front) combinadas en un layout horizontal.

El checkpoint corresponde a la iteración 400 de entrenamiento de una ejecución denominada `v2w_kuka_iiwa14_level2_widowx_texture_2cam_hstack_from_widowx250_video_fused_f0cea76_lora_r256`. No es un modelo autónomo: requiere cargar primero el backbone base `fused_video2world_dit` (disponible en `dreamdifferent/widowx250-video-fused`) y posteriormente aplicar este LoRA. El backbone ya incluye una fusión previa de LoRA de WidowX/Bridge, por lo que no debe sustituirse por el backbone original de Bridge. El adaptador tiene un tamaño de 3,7 GB y está pensado para ser usado con el código y configuración de MimicVideo, el tokenizador de video y el codificador de texto T5-11B.

La relevancia de este modelo radica en su capacidad para generar datos sintéticos de video robótico, lo que puede reducir la necesidad de recopilación física de datos en entornos reales. Al estar entrenado con datos de dos cámaras y 24 tareas episódicas, ofrece una base para la simulación visual de trayectorias y la validación de políticas de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre DiT fusionado (Video2World) |
| Parametros totales | no disponible (el adaptador ocupa 3,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generacion de video, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el codificador de texto es T5-11B, probablemente ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoint PyTorch .pt o .safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 256 (según el nombre `lora_r256`) que se aplica sobre un backbone de difusión de video denominado `fused_video2world_dit`. Este backbone es un Diffusion Transformer (DiT) que ya ha sido fusionado con un LoRA previo de WidowX/Bridge, y que a su vez se basa en el sistema MimicVideo y en los componentes de NVIDIA Cosmos. El adaptador se entrena para ajustar el comportamiento del modelo a un conjunto específico de datos robóticos.

El entrenamiento se realizó con un dataset propio (revisión `34e9c1742ff40ca3b60e06fc3ae92872c33248fe`) que contiene 256 episodios y 54 376 frames, capturados con dos cámaras (`corner_cam` y `front_cam`) a 5 Hz, con un layout de vista apilada horizontalmente (`hstack`). Se definieron 24 tareas con instrucciones condicionadas por episodio. El proceso de entrenamiento alcanzó la iteración 400 y finalizó por límite de tiempo (`walltime`). No se menciona el uso de RLHF ni DPO; se trata de un ajuste fino supervisado sobre datos de video.

## Capacidades

- Generación de video condicionada a instrucciones textuales para tareas robóticas específicas (24 tareas definidas en el manifiesto).
- Síntesis de secuencias de video con dos cámaras simultáneas (corner y front) combinadas en un solo canal horizontal.
- Adaptación a un dominio robótico concreto (KUKA IIWA 14 + WidowX) mediante LoRA, sin necesidad de reentrenar el modelo base completo.
- Requiere el backbone fusionado exacto y los artefactos de runtime de MimicVideo (tokenizador de video, T5-11B, código específico).
- No soporta tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente generativa visual.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de políticas robóticas: el modelo puede producir videos de ejecuciones de tareas (por ejemplo, manipulación de objetos) que sirvan como aumentación de datasets reales, reduciendo la necesidad de recopilación física.
- Validación visual de trayectorias planificadas: antes de ejecutar un movimiento en el robot real, se puede generar un video simulado para verificar la viabilidad y el aspecto de la ejecución.
- Simulación de entornos para aprendizaje por refuerzo: los videos generados pueden usarse como observaciones en entornos de simulación visual, complementando simuladores físicos como MuJoCo.
- Demostración de capacidades robóticas en documentación técnica: generar videos de ejemplo para manuales, papers o presentaciones sin necesidad de grabar con el robot físico.
- Pruebas de robustez de modelos de percepción: los videos sintéticos pueden emplearse para evaluar la respuesta de sistemas de visión ante variaciones de textura, iluminación o ángulo de cámara.
- Desarrollo de interfaces de teleoperación asistida: el modelo puede previsualizar el resultado esperado de una instrucción dada, ayudando al operador a ajustar comandos antes de enviarlos al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas cuantitativas como FVD, IS o precisión de tarea para este adaptador específico.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 3,7 GB, pero para la inferencia se requiere cargar el backbone completo `fused_video2world_dit` (3 913 057 284 bytes, ~3,9 GB) además del tokenizador de video y el codificador de texto T5-11B (que tiene aproximadamente 11 mil millones de parámetros).
- Dado el tamaño del T5-11B, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100) para una inferencia razonable. En GPUs con menos memoria, podría ser necesario cuantizar el T5 o usar técnicas de offloading, aunque no se proporcionan configuraciones oficiales.
- El despliegue requiere el código de MimicVideo en el commit específico (`e3355dbc93132b576c02f920a59b4fc18a4f5906`) y los artefactos de runtime indicados en la model card.
- No se especifican opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de difusión de video, el flujo de inferencia es diferente al de un LLM y probablemente se ejecute con scripts de Python propios de MimicVideo.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (LoRA de generación de video robótico con dos cámaras). Existen otros checkpoints del mismo autor (por ejemplo, `vam-cross-level2-kuka-iiwa14-widowx-texture-video-lora-iter-200` y `vam-cross-level4-kuka-iiwa14-widowx-texture-video-lora-iter400`) que parecen variantes del mismo entrenamiento con diferentes niveles o iteraciones, pero no se dispone de datos de rendimiento comparativo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: debe cargarse el backbone exacto especificado (`dreamdifferent/widowx250-video-fused` en la revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`). Cargar un backbone distinto (por ejemplo, el original de Bridge) producirá resultados incorrectos.
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido. Se debe contactar con el autor o revisar los términos de los componentes upstream (MimicVideo, NVIDIA Cosmos, dataset).
- El dataset de entrenamiento no está incluido y está sujeto a su propia política de acceso. Los usuarios deben cumplir con los términos del dataset y de los modelos base.
- El modelo está especializado en un dominio muy concreto (KUKA IIWA 14 + WidowX con dos cámaras). Su capacidad de generalización a otros robots, configuraciones de cámara o tareas fuera de las 24 definidas es limitada.
- No se han publicado evaluaciones de sesgos ni de alucinación visual. Como modelo generativo de video, puede producir artefactos o inconsistencias físicas, especialmente en escenarios no vistos.
- El entrenamiento se detuvo por límite de tiempo (`walltime`), no por convergencia; es posible que el modelo no haya alcanzado su rendimiento óptimo.
- La fecha de creación (2026-08-31) es posterior a la fecha actual, lo que sugiere que el modelo es muy reciente o que la fecha es incorrecta; se recomienda verificar la vigencia de los enlaces y artefactos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture-video-lora-iter-400
- Variante iter-200: https://huggingface.co/dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture-video-lora-iter-200
- Variante level4 iter-400: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-video-lora-iter400
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Referencia de robot KUKA IIWA 14 (MuJoCo Menagerie): https://github.com/google-deepmind/mujoco_menagerie/blob/main/kuka_iiwa_14/README.md
