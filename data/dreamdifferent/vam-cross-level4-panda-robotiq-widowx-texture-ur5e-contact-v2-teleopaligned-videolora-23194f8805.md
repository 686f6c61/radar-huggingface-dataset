# dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-23194f8805

## Resumen

El modelo `dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-23194f8805` es un checkpoint del decodificador World2Action del framework VAM-Cross MimicVideo, desarrollado por el usuario `dreamdifferent` en HuggingFace. Se trata de un componente especializado en conducción de acciones robóticas a partir de observaciones de vídeo, destinado a entornos de manipulación con contacto y texturas variables, concretamente con un brazo WidowX, pinza Robotiq y un robot UR5e. El modelo resuelve el problema de traducir información visual de dos cámaras (`corner_cam` y `front_cam`) en predicciones de posición y rotación del efector final y la pinza, a una frecuencia de 5 Hz.

La arquitectura se integra con un backbone Video2World congelado y un LoRA de vídeo también congelado, por lo que no es un modelo autónomo sino un decodificador de acciones que forma parte de un sistema mayor. El checkpoint procede de la iteración 900 de un proceso de entrenamiento que se detuvo por una causa no especificada (`unknown`). En la información disponible no se detallan los parámetros totales ni la licencia, y el repositorio ocupa 1.0 GB. La relevancia del modelo radica en ser una pieza de un pipeline de robótica de código abierto basado en vídeo-a-acción, útil para investigación en aprendizaje por demostración, teleoperación y control de robots con realimentación visual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action basado en transformadores (arquitectura exacta no disponible) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (modelo no MoE) |
| Longitud de contexto | No disponible (modelo de vídeo, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no aplica, modelo de robótica) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de 1.0 GB) |

## Arquitectura y entrenamiento

El modelo es un decodificador World2Action dentro del framework VAM-Cross MimicVideo. Según la model card, el checkpoint corresponde a la iteración 900 de un run identificado como `w2a_panda_robotiq_level4_widowx_texture_2cam_hstack_ur5e_contact_v2_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`. El entrenamiento se detuvo por `unknown`, pero se verificó que el conjunto de checkpoints de modelo, optimizador y scheduler era el más completo disponible antes de seleccionar los pesos subidos.

El modelo no se entrena de forma aislada: requiere entradas congeladas fijadas en el momento de la subida. En concreto, se apoya en un backbone Video2World (`dreamdifferent/widowx250-video-fused`), un decodificador de acciones inicial (`dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder`) y un LoRA de vídeo congelado (`dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200`). El dataset asociado contiene 174 episodios y 54 730 frames, con observaciones de dos cámaras. La salida son 15 acciones de efector final y pinza a 5 Hz, con la pose objetivo relativa a la pose actual lograda (`relative_to_current_achieved_pose`) en el sistema de coordenadas `widowx_reference_base/teleop_aligned_tool`, y rotación codificada en 6D.

En cuanto a innovaciones técnicas, el modelo incorpora el formalismo de World2Action de MimicVideo, donde un modelo de vídeo capta la dinámica del mundo y este decodificador traduce esa representación en comandos de control. No se han publicado detalles sobre tokens de entrenamiento, composición exacta del dataset ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Predicción de acciones de efector final y pinza (15 dimensiones) a 5 Hz a partir de observaciones de vídeo.
- Entrada multi-cámara con dos puntos de vista simultáneos (`corner_cam` y `front_cam`), lo que permite al modelo razonar sobre la escena con información estéreo.
- Generación de poses relativas a la pose actual lograda, lo que facilita el control en bucle cerrado y la adaptación a pequeños desplazamientos del robot.
- Rotación expresada en representación 6D, compatible con esqueletos de control robótico que requieren una continuidad sin singularidades.
- Integración con el framework MimicVideo y con componentes congelados (backbone Video2World y Video LoRA), lo que lo hace apto para pipelines de vídeo-a-acción preentrenados.
- No se ha publicado información sobre soporte de tool calling, agentes, razonamiento multilingüe, modos de pensamiento ni comprensión de texto o imágenes como modelo generalista.

## Casos de uso

- Control de manipuladores en tareas de contacto: El modelo puede utilizarse para predecir movimientos precisos del efector final y la pinza en ensamblajes o inserciones, gracias a la predicción de pose relativa y a la entrada de dos cámaras que proporcionan perspectiva del contacto con el entorno.
- Teleoperación y aprendizaje por demostración: En un pipeline de teleoperación alineada (`teleop_aligned_tool`), el modelo convierte vídeo grabado de demostraciones humanas en comandos de acción, permitiendo entrenar políticas para robots WidowX con datos de bajo coste.
- Replicación de habilidades en el brazo UR5e: La configuración específica panda-robotiq-ur5e sugiere que el modelo está pensado para transferir habilidades de manipulación a un robot UR5e, sirviendo como decodificador de acciones en sistemas multi-robot.
- Investigación en modelos de mundo para robótica: Dado que el decodificador se apoya en un backbone Video2World y un LoRA de vídeo, es útil en trabajos que estudian cómo los modelos de vídeo preentrenados pueden cerrar el bucle entre percepción y actuación.
- Evaluación de robustez frente a texturas y condiciones visuales variables: El dataset incluye el término `texture`, por lo que el modelo se puede emplear para experimentar con cambios de apariencia de los objetos y medir la estabilidad de las predicciones de acción.
- Integración en sistemas de control con realimentación visual: Con una salida de 5 Hz, el modelo puede insertarse en lazo cerrado para ajustar la posición de la pinza en tiempo real durante tareas de agarre, siempre que se disponga del framework MimicVideo y de los backbones congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: No disponible.
- GPU recomendadas: No disponible.
- ¿Cabe en GPU de consumo? No se puede determinar sin conocer el número de parámetros. El repositorio ocupa 1.0 GB, lo que indica un checkpoint ligero, pero no es una métrica suficiente para confirmar los requisitos de memoria.
- Opciones de despliegue: Según la model card, el modelo debe cargarse junto con la integración de MimicVideo y los componentes congelados. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otras herramientas de inferencia.
- Latencia y throughput: No disponibles.

## Comparativa con modelos similares

La información disponible no permite construir una comparativa completa. Se han identificado otros checkpoints de la misma familia VAM-Cross en el repositorio de `dreamdifferent`, pero no se dispone de sus parámetros, contexto ni resultados de rendimiento.

| Nombre | Tipo | Propósito conocido |
|---|---|---|
| vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-23194f8805 | Decodificador World2Action | Predicción de acciones de efector final y pinza en WidowX + UR5e |
| vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400 | Video LoRA | Adaptación de vídeo para la misma configuración de robot |
| vam-cross-level4-so101-widowx-texture-video-lora-iter-400 | Video LoRA | Adaptación de vídeo en otro entorno de WidowX (so101) |

## Limitaciones y advertencias

- El entrenamiento del checkpoint se detuvo por `unknown`, lo que puede indicar una finalización no planificada y posibles problemas de convergencia del modelo.
- El modelo no es autónomo: depende del backbone Video2World congelado, del decodificador inicial y del LoRA de vídeo congelado. Sin ellos no puede realizar predicciones.
- No se han publicado evaluaciones de rendimiento, por lo que se desconoce la precisión en tareas reales de manipulación.
- La licencia no está especificada, lo que supone un riesgo para cualquier uso comercial o distribución.
- El dataset de entrenamiento es reducido (174 episodios y 54 730 frames), lo que puede limitar la generalización a entornos distintos a la configuración de entrenamiento.
- El modelo está diseñado para una configuración concreta: dos cámaras específicas, referencia `widowx_reference_base/teleop_aligned_tool` y salida de 15 acciones a 5 Hz. Transferirlo a otros robots o sistemas de cámaras requeriría adaptación y probablemente reentrenamiento.
- Al no ser un modelo de lenguaje, el riesgo de alucinación se manifiesta como predicciones de acciones incorrectas en situaciones fuera de la distribución de entrenamiento, pero este comportamiento no ha sido evaluado ni documentado.

## Enlaces

- Repositorio principal: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-23194f8805
- Modelo similar (video LoRA nivel 2): https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400
- Modelo similar (video LoRA so101 nivel 4): https://huggingface.co/dreamdifferent/vam-cross-level4-so101-widowx-texture-video-lora-iter-400
- Backbone Video2World congelado: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- Video LoRA congelado: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200
- Dataset de entrenamiento: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robotiq-widowx-texture-ur5e-contact-v2
