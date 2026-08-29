# dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900

## Resumen

Este repositorio contiene un checkpoint intermedio del decoder World2Action del proyecto VAM-Cross, desarrollado por el usuario `dreamdifferent` en HuggingFace. El modelo forma parte de un pipeline de robótica basado en MimicVideo, un enfoque que combina modelos de video (Video2World) con decoders de acciones para convertir observaciones visuales en comandos de control para un brazo robótico WidowX 250. El checkpoint corresponde a la iteración 900 de un entrenamiento más largo que se detuvo por causas no especificadas.

La relevancia de este modelo radica en su enfoque: en lugar de entrenar un modelo de extremo a extremo, se congela el backbone de video y un LoRA de video, y solo se entrena el decoder de acciones. Esto permite aprender políticas de control eficientes aprovechando el conocimiento de dinámica del mundo que ya posee el modelo de video. El checkpoint está pensado para investigación en robótica y aprendizaje por imitación, no como un producto final.

El repositorio incluye únicamente los pesos del decoder, no los componentes congelados ni el dataset. Se proporcionan referencias a los commits exactos de los componentes necesarios, así como el contrato de datos y acciones. El tamaño del repositorio es de 1.0 GB, lo que sugiere un modelo de tamaño moderado, aunque no se especifican los parámetros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder de acciones (World2Action) sobre backbone de video congelado (MimicVideo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un decoder de acciones que se entrena sobre un backbone de video congelado. Según la model card, el checkpoint proviene de la iteración 900 de un entrenamiento denominado `w2a_so101_level5_widowx_texture_2cam_hstack_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`. El pipeline utiliza MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`) como base, con un backbone Video2World inicial (`dreamdifferent/widowx250-video-fused`) y un decoder de acciones inicial (`dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder`). Además, se emplea un LoRA de video congelado (`dreamdifferent/vam-cross-level5-so101-widowx-texture-video-lora-iter-200`).

El dataset de entrenamiento consta de 158 episodios con 54 261 frames, capturados con dos cámaras (`corner_cam` y `front_cam`). El objetivo son 15 acciones de efector final y gripper a 5 Hz, con poses relativas a la pose actual lograda, expresadas en el marco `widowx_reference_base/teleop_aligned_tool`. La rotación se representa mediante `rotation_6d`. No se especifican detalles sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Predicción de acciones de robot: genera secuencias de 15 acciones (posiciones del efector final y apertura del gripper) a 5 Hz a partir de observaciones de video de dos cámaras.
- Integración con modelos de video: funciona como decoder acoplado a un backbone Video2World congelado, aprovechando la representación visual aprendida.
- Soporte de múltiples cámaras: acepta entradas de dos vistas (`corner_cam` y `front_cam`) apiladas horizontalmente (`hstack`).
- Representación de pose relativa: las acciones se predicen relativas a la pose actual del efector, lo que facilita el control en bucle cerrado.
- Rotación 6D: usa una representación continua de rotación, más estable para entrenamiento que los cuaterniones o ángulos de Euler.
- No es un modelo de lenguaje ni multimodal general: está especializado exclusivamente en control robótico para el brazo WidowX 250.

## Casos de uso

- Aprendizaje por imitación en robótica: el modelo puede utilizarse para clonar comportamientos de teleoperación, convirtiendo grabaciones de video en comandos de acción para el WidowX 250. Es adecuado porque el decoder se entrena sobre datos de teleoperación reales y produce acciones a 5 Hz, compatibles con el control del brazo.
- Investigación en modelos de mundo para control: al estar diseñado para trabajar con un backbone de video congelado, permite estudiar cómo los modelos de video pueden transferir conocimiento de dinámica del mundo a políticas de control sin actualizar el modelo visual.
- Desarrollo de pipelines de robotica con MimicVideo: sirve como componente de referencia para quienes quieran reproducir o extender el enfoque VAM-Cross, ya que incluye el contrato de datos y las referencias a los componentes congelados.
- Evaluación de decoders de acciones en entornos simulados o reales: el checkpoint puede cargarse en un entorno de simulación del WidowX 250 para probar su comportamiento antes de desplegarlo en hardware real.
- Benchmarking de políticas de control basadas en video: investigadores pueden comparar este decoder con otros enfoques (p. ej., políticas de extremo a extremo) en tareas de manipulación con el WidowX 250.
- Estudio de la influencia del LoRA de video congelado: al variar el LoRA de video y mantener el decoder fijo, se puede analizar cómo afecta la representación visual al rendimiento de las acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, precisión de acciones ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (1.0 GB) sugiere que el decoder podría caber en GPUs con 8 GB de VRAM, pero no se confirma.
- GPU recomendadas: no disponible. Dado que el modelo requiere un backbone de video congelado (que no se incluye), los requisitos reales dependen de ese componente.
- Compatibilidad con GPUs de consumo: probablemente sí para el decoder solo, pero el pipeline completo (con Video2World) requeriría más recursos.
- Opciones de despliegue: no se mencionan herramientas específicas. Al ser un checkpoint de PyTorch (presumiblemente), podría usarse con frameworks estándar de robótica, pero no hay documentación al respecto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (decoders de acciones para WidowX 250 basados en MimicVideo). El repositorio `arnavsukhija/world-model-so101` en GitHub aborda un enfoque similar (Video-Action Models), pero no se proporcionan datos cuantitativos para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: es la iteración 900 de un entrenamiento que se detuvo por causas desconocidas. No representa el modelo final y puede tener un rendimiento subóptimo.
- Dependencia de componentes congelados: el decoder no funciona de forma aislada; requiere el backbone Video2World, el decoder inicial y el LoRA de video con las versiones exactas especificadas en la model card. Sin ellos, el modelo no es utilizable.
- Dataset limitado: solo 158 episodios, lo que puede provocar sobreajuste a las condiciones específicas de grabación (textura, iluminación, posición de cámaras).
- Específico para WidowX 250: las acciones están calibradas para este brazo robótico concreto; no es transferible directamente a otros robots sin reentrenamiento.
- Sin licencia especificada: no se indica la licencia, por lo que el uso comercial o la redistribución pueden ser problemáticos. Se debe contactar al autor antes de cualquier uso.
- Sin documentación de rendimiento: no hay benchmarks ni métricas de éxito, lo que dificulta evaluar su calidad antes de usarlo.
- Riesgo de alucinación de acciones: como cualquier modelo generativo, puede producir acciones inconsistentes con la dinámica real del robot, especialmente en situaciones fuera de la distribución de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Repositorio relacionado (world-model-so101): https://github.com/arnavsukhija/world-model-so101
- Otro decoder de acciones del mismo autor: https://huggingface.co/dreamdifferent/mimic-video-so101-single-object-delta30-wo-video-tuning-action-decoder
