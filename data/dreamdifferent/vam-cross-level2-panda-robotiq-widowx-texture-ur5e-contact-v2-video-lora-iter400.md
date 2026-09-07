# dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400

## Resumen

Este modelo es un adaptador LoRA para generación de vídeo robótico, desarrollado por `dreamdifferent` como parte de la familia VAM-Cross. Se trata de un checkpoint entrenable de `Video2World` (MimicVideo) que condiciona la generación de vídeo a partir de instrucciones de tareas de manipulación robótica, usando dos cámaras simultáneas (esquina y frontal). El modelo está diseñado para un robot Panda con pinza Robotiq y brazo UR5e, en un entorno con texturas y contacto físico.

El adaptador no es un modelo autónomo: debe cargarse sobre un backbone base denominado `fused_video2world_dit`, que ya incluye una fusión previa de pesos WidowX/Bridge. El checkpoint corresponde a la iteración 400 de un entrenamiento cuyo dataset contiene 290 episodios y 54 508 frames, con 24 instrucciones condicionadas por episodio. Su relevancia radica en permitir la síntesis de vídeo para robótica con perspectiva multi-cámara, un recurso útil para simulación y generación de datos de entrenamiento de políticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion de video (Video2World DiT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint LoRA (formato no especificado) |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA para el modelo `fused_video2world_dit`, un backbone de generación de vídeo basado en un DiT (Diffusion Transformer) fusionado con pesos previos de WidowX/Bridge. El modelo base se identifica por el repositorio `dreamdifferent/widowx250-video-fused` en la revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, con un peso de 3.9 GB. El adaptador se entrena sobre el dataset `vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2`, que consta de 290 episodios y 54 508 frames, capturados con dos cámaras (`corner_cam` y `front_cam`) en un layout apilado horizontalmente a 5 Hz. Las tareas son 24 instrucciones condicionadas por episodio, centradas en manipulación con contacto y texturas. El entrenamiento se realizó con la infraestructura MimicVideo, usando un tokenizador de vídeo y un codificador de texto T5-11B como componentes de runtime. No se especifica el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de vídeo condicionado por instrucciones para tareas robóticas de manipulación (panda, pinza Robotiq, brazo UR5e).
- Soporte de entrada multi-cámara: dos vistas simultáneas (esquina y frontal) apiladas horizontalmente.
- Condicionamiento por texto mediante un codificador T5-11B, lo que permite especificar la tarea deseada en lenguaje natural.
- Adaptación a un dominio específico con contacto físico y texturas, gracias al entrenamiento sobre el dataset VAM-Cross.
- No soporta tool calling, razonamiento simbólico, ni capacidades multilingües explícitas, ya que es un modelo de generación de vídeo robótico.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de políticas robóticas: el modelo puede producir vídeos de trayectorias de manipulación con dos cámaras, ampliando el conjunto de datos sin necesidad de capturas físicas adicionales.
- Simulación de entornos de contacto para validación de controladores: permite visualizar cómo se comportaría el robot ante tareas con texturas y contacto, antes de desplegar en hardware real.
- Aumento de datos para aprendizaje por imitación: los vídeos generados pueden usarse como demostraciones adicionales para entrenar políticas de visión-lenguaje-acción.
- Investigación en generación de vídeo robótico multi-cámara: sirve como referencia para estudiar la síntesis de vídeo condicionada por múltiples vistas en tareas de manipulación.
- Desarrollo de sistemas de supervisión remota: puede generar vistas sintéticas de escenarios robóticos para monitorizar el progreso de tareas en entornos simulados.
- Benchmarking de adaptadores LoRA para generación de vídeo: permite comparar el efecto de diferentes iteraciones de entrenamiento (por ejemplo, iter200 vs iter400) sobre la calidad de la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos para este checkpoint.
- El adaptador debe cargarse sobre un backbone de aproximadamente 3.9 GB (`iter_000001060_fused.pt`), lo que implica una GPU con memoria suficiente para alojar ese modelo base.
- Además, el runtime requiere el text encoder T5-11B, un modelo de gran tamaño, y el tokenizador de vídeo, por lo que se necesita una GPU de alta capacidad (por ejemplo, clase A100 o H100) para una ejecución completa.
- No se dispone de datos de latencia ni throughput.
- Las opciones de despliegue no están documentadas; el modelo está pensado para cargarse con el código y la configuración de MimicVideo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400 (este) | Adaptador LoRA para Video2World | no disponible | no disponible | no disponible | HuggingFace |
| vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter200 | Adaptador LoRA para Video2World | no disponible | no disponible | no disponible | HuggingFace |
| vam-cross-level5-panda-robotiq-widowx-texture-video-lora-iter400 | Adaptador LoRA para Video2World | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de modelos comparables de otras fuentes con datos públicos suficientes. Los tres modelos listados pertenecen al mismo autor y comparten la misma naturaleza de adaptador LoRA, pero no se han publicado especificaciones técnicas detalladas.

## Limitaciones y advertencias

- El checkpoint es un adaptador LoRA y no funciona de forma autónoma. Debe cargarse sobre el backbone exacto `fused_video2world_dit` (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`); cargar el backbone original de Bridge sería incorrecto.
- No se incluye el dataset de entrenamiento. Los usuarios deben cumplir la política de acceso del dataset y los términos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- La licencia del modelo no está disponible, por lo que no se puede confirmar si permite uso comercial o redistribución.
- No se han publicado evaluaciones de seguridad, sesgos ni alucinaciones. Al ser un modelo de generación de vídeo, podría producir artefactos visuales no realistas o inconsistentes con la física.
- El modelo está especializado en un dominio robótico concreto (Panda, Robotiq, UR5e, WidowX) y puede no generalizar a otros robots o entornos.
- Los idiomas soportados no están especificados; el uso del codificador T5-11B sugiere soporte para inglés, pero no hay confirmación.

## Enlaces

- HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400
- Modelo similar (iter200): https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter200
- Modelo similar (level5): https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-video-lora-iter400
