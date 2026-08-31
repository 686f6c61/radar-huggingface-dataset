# dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture-video-lora-iter-200

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para generación de video condicionada a instrucciones en el ámbito de la robótica. Concretamente, es un checkpoint de entrenamiento de la iteración 200 del run `v2w_kuka_iiwa14_level2_widowx_texture_2cam_hstack_from_widowx250_video_fused_f0cea76_lora_r256`, desarrollado por el usuario `dreamdifferent`. No es un modelo autónomo: se trata de un adaptador que debe cargarse sobre un backbone base específico denominado `fused_video2world_dit`, que ya incorpora una fusión previa de LoRA para WidowX/Bridge. Su propósito es permitir que el sistema de generación de video MimicVideo Video2World produzca secuencias de video de dos cámaras (corner y front) apiladas horizontalmente, para tareas de manipulación con el brazo robótico KUKA IIWA 14 y el gripper WidowX.

La relevancia de este adaptador radica en su aplicación a la robótica: permite generar vídeos sintéticos de ejecuciones de tareas a partir de instrucciones textuales, lo que puede utilizarse para aumentar datos de entrenamiento de políticas, validar comportamientos o simular entornos. El repositorio incluye los artefactos necesarios para reproducir el entrenamiento y la inferencia, aunque no incluye el dataset ni el backbone, que deben obtenerse por separado. El tamaño del repositorio es de 0,7 GB, correspondiente a los pesos del adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Video2World DiT fusionado (`fused_video2world_dit`) |
| Parametros totales | no disponible (el adaptador ocupa 0,7 GB, pero el número exacto de parámetros no se indica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (trabaja con secuencias de video, no con texto; el contexto se define por el número de frames y el layout hstack) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones; el checkpoint es de entrenamiento) |
| Idiomas soportados | no disponibles (las instrucciones de tarea probablemente en inglés, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch `.pt` o `.safetensors`, pero no se indica) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 256 (`lora_r256`) que se aplica a un modelo de difusión de video denominado `fused_video2world_dit`. Este backbone ya incluye una fusión previa del LoRA de WidowX/Bridge, por lo que no debe cargarse el backbone Bridge original. El entrenamiento se realizó con el framework MimicVideo, utilizando un tokenizador de video específico y un codificador de texto T5-11B como condicionamiento. Los datos de entrenamiento provienen del dataset `dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture`, con 256 episodios y 54 376 frames, capturados con dos cámaras (`corner_cam` y `front_cam`) y presentados en un layout `hstack` a 5 Hz. Se definieron 24 tareas condicionadas por instrucciones. El run de entrenamiento terminó por `walltime` (límite de tiempo) y se seleccionaron cuatro componentes del checkpoint tras verificación.

La innovación técnica principal es el uso de un adaptador LoRA sobre un modelo de difusión de video ya fusionado, lo que permite adaptar el modelo a un nuevo dominio (KUKA + WidowX) sin reentrenar el modelo completo. El backbone base se encuentra en el repositorio `dreamdifferent/widowx250-video-fused` (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, iteración 1060). Para la inferencia se requieren además el código de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`), el bundle de checkpoints `jonpai/mimic-video@f28339034831e3c2374be075e622e1ff38ebe0f8`, el tokenizador de video y el directorio del T5-11B.

## Capacidades

- Generación de video condicionada a instrucciones textuales para tareas de manipulación robótica con dos cámaras (corner y front), combinadas en una sola vista horizontal (`hstack`) a 5 Hz.
- Adaptación específica al brazo KUKA IIWA 14 y al gripper WidowX, con texturas y entorno definidos en el dataset de entrenamiento.
- Soporte para 24 tareas distintas, cada una con su instrucción asociada (definidas en el manifiesto `vam_cross_video_lora_manifest.json`).
- No es un modelo de lenguaje: no dispone de tool calling, agentes ni razonamiento multi-paso en el sentido tradicional.
- Capacidades multilingües: no aplicables, al ser un modelo de video condicionado por texto (el codificador T5-11B sí es multilingüe, pero no se especifica qué idiomas se usaron en las instrucciones).
- No incluye capacidades de visión independientes; depende del backbone y del tokenizador de video.

## Casos de uso

- **Generación de datos sintéticos para entrenamiento de políticas robóticas**: el modelo puede producir vídeos de ejecuciones de tareas (por ejemplo, "mover el objeto de la izquierda a la derecha") que sirven para aumentar el conjunto de datos reales, mejorando la generalización de políticas de control.
- **Simulación de entornos para validación de algoritmos**: permite generar secuencias de video realistas de dos cámaras sin necesidad de montar un entorno físico, útil para probar modelos de percepción o planificación.
- **Aumento de datos para aprendizaje por imitación**: dado un pequeño conjunto de demostraciones reales, este adaptador puede crear variaciones sintéticas (cambios de textura, ángulos de cámara) que enriquezcan el dataset de entrenamiento.
- **Investigación en generación de video condicionada a instrucciones**: sirve como base para estudiar cómo los adaptadores LoRA sobre modelos de difusión de video se comportan en dominios robóticos específicos.
- **Previsualización de tareas de manipulación**: los investigadores pueden generar vídeos de ejemplo de una tarea antes de ejecutarla en el robot real, facilitando la depuración de instrucciones o la planificación de experimentos.
- **Transferencia de dominio entre robots**: al ser un adaptador sobre un backbone ya fusionado con WidowX, puede servir como punto de partida para adaptar el modelo a otros brazos robóticos o configuraciones de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas cuantitativas de calidad de generación (como FVD, IS, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no disponible directamente. Dado que el backbone `fused_video2world_dit` pesa aproximadamente 3,9 GB (3913057284 bytes) y requiere además el T5-11B (también varios GB), se estima que la inferencia necesitará al menos 24-32 GB de VRAM en GPUs de gama alta.
- **GPU recomendadas**: no se especifican. Por el tamaño del modelo base, se recomiendan GPUs como A100 (40/80 GB), RTX 4090 (24 GB) o superiores. Una RTX 3090 (24 GB) podría ser insuficiente si se usan secuencias largas.
- **¿Cabe en GPU de consumo?**: probablemente no en GPUs de 8-12 GB; se requiere al menos 24 GB para el backbone y el codificador de texto. La carga conjunta del backbone y el T5-11B podría superar los 32 GB.
- **Opciones de despliegue**: al ser un adaptador de entrenamiento, la inferencia se realiza mediante el código de MimicVideo (commit específico). No se mencionan integraciones con vLLM, Ollama o TGI, que son para modelos de lenguaje. Se espera un pipeline personalizado en PyTorch.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información para realizar una comparativa cuantitativa. Existen otros adaptadores del mismo autor (por ejemplo, `vam-cross-level4-kuka-iiwa14-widowx-texture-video-lora-iter400` o `vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter900`), pero no se proporcionan datos de rendimiento ni especificaciones comparables. Se recomienda consultar esos repositorios para más contexto, aunque no se pueden extraer conclusiones numéricas.

## Limitaciones y advertencias

- **No es un modelo standalone**: debe cargarse sobre el backbone exacto indicado (`fused_video2world_dit`, revisión `f0cea76...`). Cargar otro backbone (como el Bridge original) producirá resultados incorrectos.
- **Dependencia de artefactos externos**: se requiere el código MimicVideo en un commit concreto, el bundle de checkpoints, el tokenizador de video y el T5-11B. Sin estos, el adaptador no es funcional.
- **Datos de entrenamiento limitados**: solo 256 episodios y 54 376 frames, lo que puede provocar sobreajuste a las tareas y texturas específicas del dataset. La generalización a nuevas tareas o entornos no está garantizada.
- **Licencia no disponible**: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación. Se debe contactar con el autor antes de usarlo en producción.
- **Idiomas no especificados**: las instrucciones de tarea probablemente estén en inglés, pero no se confirma. El codificador T5-11B es multilingüe, pero el entrenamiento puede haberse limitado a un idioma.
- **Riesgo de alucinación visual**: como todo modelo generativo de video, puede producir secuencias inconsistentes con la física o con las instrucciones, especialmente en escenarios no vistos durante el entrenamiento.
- **Cumplimiento de términos**: el dataset no está incluido y se deben respetar las políticas de acceso del dataset y los términos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- **Estado experimental**: el run de entrenamiento terminó por `walltime`, no por convergencia; aunque se verificaron los componentes seleccionados, el adaptador puede no estar completamente optimizado.

## Enlaces

- Repositorio del modelo: [dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture-video-lora-iter-200](https://huggingface.co/dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture-video-lora-iter-200)
- Backbone base requerido: [dreamdifferent/widowx250-video-fused](https://huggingface.co/dreamdifferent/widowx250-video-fused) (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`)
- Adaptador similar del mismo autor (nivel 4): [dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-video-lora-iter400](https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-video-lora-iter400)
- Otro adaptador con decoder de acción: [dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter900](https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter900)
