# dreamdifferent/kuka-level2-no-source-stage-v1-video400-action1800

## Resumen

VAM-Cross MimicVideo World2Action es un checkpoint de un decodificador de acciones para robótica, desarrollado por el usuario `dreamdifferent` y publicado en Hugging Face. Forma parte de la familia MimicVideo, un marco que aprende políticas de control a partir de vídeo y las traduce en acciones motrices. En concreto, este repositorio contiene el checkpoint del decodificador World2Action de la iteración 1800 de un entrenamiento denominado `w2a_kuka_iiwa14_level2_widowx_texture_2cam_hstack_no_source_stage_v1_bridge_videolora_iter400_widowx_teleop_recording_frame_v1`.

El modelo resuelve el problema de convertir representaciones latentes de vídeo en comandos de acción concretos para un brazo robótico KUKA iiWA14 con pinza tipo WidowX, en un entorno con dos cámaras. Se apoya en un backbone Video2World congelado (procedente de `jonpai/mimic-video`) y en un adaptador LoRA de vídeo también congelado, de modo que este checkpoint solo entrena la etapa de decodificación de acciones sobre representaciones previamente aprendidas.

Es relevante para investigadores en robótica y aprendizaje por imitación porque documenta de forma explícita el contrato de datos (cámaras, frecuencia, formato de pose y rotación) y fija las dependencias exactas por commit, lo que facilita la reproducibilidad. No obstante, la información pública es muy limitada: no hay datos de arquitectura detallados, benchmarks, licencia ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action sobre backbone Video2World (MimicVideo); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo ocupa 1.0 GB; no se especifica safetensors, GGUF ni otro) |

## Arquitectura y entrenamiento

El modelo es un decodificador de acciones (World2Action) que se apoya en un backbone Video2World congelado, identificado en la model card como `jonpai/mimic-video` en el commit `f28339034831e3c2374be075e622e1ff38ebe0f8`. Sobre ese backbone se aplica un adaptador LoRA de vídeo también congelado (`kuka-level2-no-source-stage-v1-video-iter400`, commit `a03e938f3b79044468c8814c96644a5cf626860b`), y el entrenamiento de esta iteración se centra en la etapa de decodificación de acciones. La model card no detalla el número de capas, dimensión oculta ni tipo de bloques del transformer subyacente.

El entrenamiento se realizó sobre el dataset `vam-cross-level2-kuka-iiwa14-widowx-texture` (commit `34e9c1742ff40ca3b60e06fc3ae92872c33248fe`), con 256 episodios y 54 376 fotogramas, usando dos cámaras (`observation.images.corner_cam` y `observation.images.front_cam`). El objetivo son 15 acciones de efector final y pinza a 5 Hz, con pose relativa a la pose alcanzada actual (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool` y rotación en representación `rotation_6d`. La ejecución se detuvo por un motivo etiquetado como `unknown`, y se verificó el conjunto completo de checkpoints (modelo, optimizador, scheduler y trainer) antes de seleccionar el peso subido. No se documentan técnicas de RLHF, DPO ni detalles de composición del dataset más allá de los recuentos indicados.

## Capacidades

- Predicción de acciones robóticas: genera 15 acciones de efector final y pinza a 5 Hz a partir de observaciones visuales de dos cámaras.
- Control de brazo KUKA iiWA14 con pinza WidowX en un entorno de laboratorio con texturas específicas.
- Representación de pose relativa a la pose alcanzada actual, con rotación en formato 6D.
- Aprendizaje por imitación a partir de demostraciones de teleoperación (`widowx_teleop_recording_frame_v1`).
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, agentes ni multilingüismo; se trata de un modelo específicamente robótico.
- No se documenta soporte de visión general más allá de las dos cámaras de entrada del contrato de datos.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como punto de partida reproducible para estudiar la decodificación de acciones desde representaciones de vídeo, gracias a las dependencias fijadas por commit.
- Reproducción de experimentos de manipulación con KUKA iiWA14: el contrato de datos explícito (cámaras, frecuencia de 5 Hz, formato de pose y rotación) permite reconstruir el pipeline de evaluación.
- Evaluación de decodificadores World2Action: comparar esta iteración 1800 con otras iteraciones del mismo entrenamiento para analizar la evolución del rendimiento.
- Transferencia a configuraciones de dos cámaras: el uso de `corner_cam` y `front_cam` sirve de referencia para diseñar setups multicámara en laboratorios de robótica.
- Estudio de adaptación con LoRA congelado: analizar cómo un adaptador de vídeo preentrenado condiciona la política final de acciones.
- Base para fine-tuning en tareas de manipulación con pinza WidowX: el checkpoint puede reutilizarse como inicialización en experimentos con datasets propios que respeten el mismo contrato de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1.0 GB, lo que sugiere que el checkpoint cabe holgadamente en GPUs de consumo, pero no se especifica el tamaño del backbone congelado ni de los pesos del decodificador.
- GPU recomendadas: no disponible. Al tratarse de un modelo robótico con backbone de vídeo, es probable que requiera una GPU con soporte CUDA, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (1.0 GB) es compatible con GPUs de gama media, pero se desconoce el consumo real en inferencia.
- Opciones de despliegue: no disponible. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI; el uso esperado es mediante el código de MimicVideo en el commit indicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VAM-Cross MimicVideo World2Action (este) | no disponible | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| MimicVideo (`jonpai/mimic-video`) | no disponible | no disponible | no disponible | no disponible | Hugging Face, backbone base |
| Otras iteraciones del mismo entrenamiento | no disponible | no disponible | no disponible | no disponible | Hugging Face, referenciadas por commit |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: no hay licencia, idiomas, parámetros ni benchmarks declarados, lo que dificulta evaluar su idoneidad en producción.
- El entrenamiento se detuvo por un motivo etiquetado como `unknown`, lo que puede indicar una interrupción no planificada y un estado del checkpoint no óptimo.
- El modelo está especializado en un único entorno (KUKA iiWA14 con pinza WidowX, dos cámaras y texturas concretas); su generalización a otros robots o escenas no está documentada.
- El dataset y las entradas congeladas no se incluyen en el repositorio, por lo que la reproducibilidad exige descargar y fijar manualmente cada dependencia por commit.
- Riesgo de sobreajuste a las condiciones de teleoperación y a la frecuencia de 5 Hz; no se documenta comportamiento fuera de ese régimen.
- No se especifican sesgos, riesgos de alucinación ni restricciones de uso comercial por ausencia de licencia; ante la falta de licencia explícita, debe asumirse que no hay permisos concedidos.
- Al ser un modelo de robótica, su uso en sistemas físicos conlleva riesgos de seguridad que no se abordan en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/dreamdifferent/kuka-level2-no-source-stage-v1-video400-action1800
- Backbone Video2World: https://huggingface.co/jonpai/mimic-video
- LoRA de vídeo congelado: https://huggingface.co/dreamdifferent/kuka-level2-no-source-stage-v1-video-iter400
- Dataset: https://huggingface.co/datasets/dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture
