# dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-afcb7a8fca

## Resumen

El modelo `vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-afcb7a8fca` es un decodificador World2Action desarrollado por el usuario `dreamdifferent` dentro del ecosistema VAM-Cross / MimicVideo. Su función es convertir señales de vídeo de teleoperación robótica en predicciones de acciones de efector final y gripper, para brazos como Panda, WidowX y UR5e equipados con pinzas Robotiq. Se trata de un checkpoint de la iteración 1800 de un run de entrenamiento concreto, que se detuvo por una causa no especificada (`unknown`).

El modelo opera sobre secuencias de vídeo capturadas por dos cámaras (`corner_cam` y `front_cam`) y predice 15 acciones de efector final a 5 Hz, usando una representación de pose relativa y rotación en 6D. El repositorio tiene un tamaño de 1.0 GB y no incluye los inputs congelados necesarios para su ejecución, que deben obtenerse por separado. No se dispone de información sobre la arquitectura interna, el número de parámetros o la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (decodificador World2Action del ecosistema MimicVideo/VAM-Cross) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 1.0 GB, no se especifica el formato) |

## Arquitectura y entrenamiento

El modelo es un decodificador World2Action, un componente que traduce características de vídeo en comandos de acción para un robot. Forma parte de la línea VAM-Cross sobre la base de MimicVideo. Según la model card, el checkpoint de la iteración 1800 proviene de un run denominado `w2a_panda_robotiq_level5_widowx_texture_2cam_hstack_ur5e_contact_v2_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1`. El entrenamiento se realizó sobre un dataset de 165 episodios y 54 343 frames, con dos cámaras de observación. La salida consiste en 15 acciones de efector final/gripper a 5 Hz, con el objetivo de pose relativo a la pose actual alcanzada y rotación expresada en 6D.

El modelo requiere varios inputs congelados: un backbone Video2World inicial (`dreamdifferent/widowx250-video-fused`), un decodificador de acciones inicial (`dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder`) y un Video LoRA congelado (`dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400`). También necesita una versión concreta de MimicVideo (commit `e3355dbc`). El run de entrenamiento se detuvo por `unknown`, por lo que el checkpoint representa un estado intermedio, no necesariamente convergido. No se han publicado detalles sobre el tamaño del modelo, la arquitectura interna ni el proceso de optimización.

## Capacidades

- Predicción de acciones robóticas de efector final y gripper a partir de secuencias de vídeo de teleoperación.
- Soporte de entrada multimodal con dos cámaras (`observation.images.corner_cam` y `observation.images.front_cam`).
- Salida de 15 acciones por paso temporal a una frecuencia de 5 Hz, adecuada para control de robots en tiempo real.
- Uso de representación de pose relativa (`relative_to_current_achieved_pose`) en el marco de referencia `widowx_reference_base/teleop_aligned_tool`.
- Rotación expresada en 6D, que evita singularidades y discontinuidades típicas de las representaciones por ángulos de Euler.
- Integración con el ecosistema MimicVideo/VAM-Cross, permitiendo combinar el decodificador con un backbone de vídeo y un Video LoRA congelados.
- No es un modelo de lenguaje: no soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Aprendizaje por imitación a partir de demostraciones humanas: el decodificador puede convertir grabaciones de teleoperación en comandos de acción para un brazo WidowX o UR5e, permitiendo entrenar políticas robóticas sin programación manual.
- Investigación en predicción de acciones vídeo-a-robot: el checkpoint sirve como referencia para estudiar la transferencia de información visual a control de bajo nivel en pipelines World2Action.
- Teleoperación asistida: combinado con el backbone de vídeo, el modelo podría predecir acciones intermedias para asistir a un operador humano en tareas de manipulación fina con pinza Robotiq.
- Control de robots en entornos de laboratorio: el uso de dos cámaras y la salida a 5 Hz lo hacen apto para experimentos de manipulación en bancos de pruebas controlados, como el montaje de piezas o el contacto con superficies.
- Fine-tuning para nuevas tareas de manipulación: el checkpoint puede ajustarse sobre datasets adicionales de demostración para adaptarlo a objetos, entornos o configuraciones de robot distintas.
- Evaluación de pipelines de vídeo-acción: al ser un decodificador independiente, permite comparar el rendimiento de distintos backbones de vídeo o Video LoRAs manteniendo fija la capa de decodificación.
- Investigación en sim-to-real: el modelo podría usarse para transferir políticas entrenadas en simulación a robots reales, aprovechando la representación de pose relativa y rotación 6D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se especifica si el modelo puede ejecutarse en GPUs de consumo (por ejemplo, RTX 4090).
- Opciones de despliegue: no disponibles de forma directa; el modelo requiere el ecosistema MimicVideo y los inputs congelados referenciados en la model card.
- Latencia y throughput estimados: no disponible.
- El repositorio ocupa 1.0 GB, pero los pesos congelados adicionales (backbone, action decoder inicial y Video LoRA) deben descargarse por separado, por lo que el coste total de memoria es mayor.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, y el modelo es un componente específico dentro de un pipeline de robótica, no un modelo generalista.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede determinar si el uso comercial está permitido.
- El checkpoint proviene de un run detenido por `unknown`, lo que implica que puede no estar completamente convergido y podría presentar comportamiento errático.
- Los inputs congelados necesarios no están incluidos en el repositorio; sin ellos, el modelo no es funcional.
- El dataset de entrenamiento es limitado (165 episodios, 54 343 frames) y está orientado a una configuración muy concreta (Panda, Robotiq, WidowX, UR5e), por lo que la generalización a otros robots o entornos es incierta.
- No se han publicado benchmarks ni evaluaciones independientes, y el modelo no tiene descargas ni likes en HuggingFace, lo que indica una validación externa nula.
- No es un modelo de lenguaje: no genera texto ni procesa instrucciones en lenguaje natural, por lo que no es aplicable a tareas de NLP.
- El repositorio no especifica el formato de los pesos ni la compatibilidad con frameworks de despliegue como vLLM, Ollama o llama.cpp.
- Existe riesgo de sobreajuste al conjunto de datos específico de teleoperación, especialmente en lo relativo a la calibración de cámaras y el marco de referencia de la pose.

## Enlaces

- HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-afcb7a8fca
- Inputs congelados referenciados en la model card (no incluidos en el repositorio):
  - Backbone Video2World inicial: `dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546`
  - Decodificador de acciones inicial: `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d`
  - Video LoRA congelado: `dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400@9b99cc7f6ca91dd0af8ddb04bff1ab3e5644100a`
- Dataset de entrenamiento: `dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2@b7e29450b4f158fdf034c72f469139beae1627ff`
