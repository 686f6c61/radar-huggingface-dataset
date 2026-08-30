# dreamdifferent/vam-cross-level4-so101-widowx-texture-video-lora-iter-200

## Resumen

Este repositorio contiene un adaptador LoRA de Video2World, desarrollado por el usuario `dreamdifferent`, orientado a la generación de video robótico condicionada por instrucciones. Concretamente, se trata del checkpoint de la iteración 200 de una ejecución de entrenamiento de un modelo `fused_video2world_dit` sobre datos de demostraciones del brazo robótico WidowX con dos cámaras (corner y frontal). El modelo no es un sistema autónomo, sino un adaptador que debe cargarse sobre un backbone específico preentrenado, lo que lo convierte en una pieza de un pipeline mayor basado en MimicVideo.

La relevancia de este adaptador radica en su capacidad para incorporar información visual de múltiples cámaras y generar secuencias de video coherentes con la dinámica del robot, un paso clave en tareas de planificación y control basado en modelos del mundo. Al ser un LoRA, su tamaño es reducido (0,7 GB), lo que facilita su distribución y aplicación sobre el backbone base. No se dispone de información pública sobre licencia, idiomas soportados ni arquitectura detallada más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `fused_video2world_dit` (basado en MimicVideo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (al ser LoRA, solo se actualizan los pesos del adaptador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch, pero no se indica) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un backbone `fused_video2world_dit`, que a su vez integra un modelo de difusión de video (Video2World) con una fusión previa de LoRA de WidowX/Bridge. El backbone requerido es el checkpoint `iter_000001060_fused.pt` del repositorio `dreamdifferent/widowx250-video-fused`, con un tamaño de 3,9 GB y un hash SHA-256 específico. El entrenamiento se realizó con el framework MimicVideo, utilizando un tokenizador de video y un codificador de texto T5-11B.

Los datos de entrenamiento provienen del dataset `dreamdifferent/vam-cross-level4-so101-widowx-texture`, con 151 episodios y 54 340 frames, capturados con dos cámaras (`corner_cam` y `front_cam`) combinadas en una vista `hstack` a 5 Hz. Se utilizaron 29 instrucciones condicionadas por episodio. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La innovación principal es la integración de múltiples vistas de cámara en un modelo de generación de video para robótica, lo que permite capturar mejor la geometría y la dinámica de la escena.

## Capacidades

- Generación de video condicionada por instrucciones textuales en el dominio robótico.
- Procesamiento de dos cámaras simultáneas mediante una vista apilada horizontalmente (`hstack`).
- Adaptación específica al robot WidowX, con texturas y configuraciones particulares.
- Integración con el ecosistema MimicVideo para generación de video2world.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades multilingües o modos de pensamiento.

## Casos de uso

- Planificación de movimientos robóticos: el modelo puede generar secuencias de video que predicen el resultado de una acción, útil para validar trayectorias antes de ejecutarlas en el robot real.
- Simulación de escenarios de manipulación: al condicionar con instrucciones, permite visualizar cómo el WidowX interactúa con objetos en entornos con texturas específicas.
- Entrenamiento de políticas de control: las predicciones de video pueden usarse como señales de supervisión para modelos de aprendizaje por refuerzo o imitación.
- Generación de datos sintéticos: el adaptador puede producir nuevos episodios de video para aumentar conjuntos de datos de entrenamiento sin necesidad de capturas físicas.
- Investigación en modelos del mundo: sirve como componente para estudiar la coherencia temporal y espacial en la generación de video robótico.
- Demostraciones y documentación técnica: permite crear visualizaciones de comportamientos del robot a partir de descripciones textuales, útiles para informes o manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en tareas de generación de video robótico.

## Requisitos de hardware

- El adaptador LoRA pesa 0,7 GB, pero requiere el backbone completo de 3,9 GB, por lo que la VRAM necesaria dependerá del modelo base y del runtime de MimicVideo.
- Se recomienda una GPU con al menos 16 GB de VRAM para cargar el backbone y el adaptador junto con el tokenizador y el codificador T5 (que puede requerir memoria adicional).
- GPUs como RTX 4090, A100 o H100 son adecuadas para inferencia y entrenamiento.
- El despliegue puede realizarse mediante el código de MimicVideo (commit específico indicado en la model card) y el checkpoint bundle de `jonpai/mimic-video`.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. Existen otros adaptadores de la misma familia (por ejemplo, `vam-cross-level5-so101-widowx-texture-video-lora-iter-200`) y proyectos relacionados como DreamZero-SO101, pero no se han publicado métricas comparables ni especificaciones detalladas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Este es un adaptador, no un modelo independiente. Debe cargarse sobre el backbone exacto especificado (`fused_video2world_dit` con la revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`); cargarlo sobre otro backbone puede producir resultados incorrectos.
- La licencia no está disponible, por lo que se desconoce si permite uso comercial o restricciones de redistribución.
- El dataset de entrenamiento no está incluido y su acceso está sujeto a políticas propias, así como a los términos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- No se han documentado sesgos específicos, pero al entrenarse con datos de un solo robot (WidowX) y un entorno concreto, la generalización a otros robots o escenarios es limitada.
- No se dispone de información sobre la calidad de las predicciones en términos de alucinación o coherencia temporal, por lo que se recomienda validar en cada caso de uso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level4-so101-widowx-texture-video-lora-iter-200
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Checkpoint bundle de MimicVideo: https://huggingface.co/jonpai/mimic-video
- Proyecto relacionado (DreamZero-SO101): https://github.com/Vizuara-AI-Lab/dreamzero-so101
- Resultados experimentales de DreamZero-SO101: https://vizuara-ai-lab.github.io/dreamzero-so101/results.html
