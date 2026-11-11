# dreamdifferent/kuka-level2-no-source-stage-v1-video400-action900

## Resumen

El modelo `kuka-level2-no-source-stage-v1-video400-action900`, publicado por el usuario `dreamdifferent`, es un checkpoint del decodificador World2Action del sistema VAM-Cross MimicVideo, orientado a robótica y predicción de acciones. Se trata de la iteración 900 de un entrenamiento cuyo objetivo es traducir representaciones de vídeo congeladas (procedentes de un backbone Video2World con un LoRA de vídeo fijo) en comandos de acción para un brazo robótico KUKA IIWA14 equipado con pinza WidowX. El repositorio contiene únicamente los pesos del decodificador, no el backbone ni el dataset.

El modelo resuelve el problema de mapear observaciones visuales multi-cámara a acciones de efector final, un componente clave en pipelines de imitación visual para manipulación robótica. La arquitectura subyacente es un decodificador de acciones acoplado a un backbone de vídeo congelado, con un contrato de datos muy específico: dos cámaras (`corner_cam`, `front_cam`), acciones de 15 dimensiones (pose relativa + pinza) a 5 Hz y representación de rotación en `rotation_6d`.

La relevancia de este checkpoint es limitada fuera de su contexto experimental: no incluye el backbone, el dataset ni los ficheros de configuración completos, la licencia no está declarada y no hay métricas publicadas. Es un artefacto de investigación reproducible solo si se dispone de los commits exactos de MimicVideo y de los pesos congelados referenciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action sobre backbone Video2World congelado (MimicVideo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1.0 GB, pesos del decodificador) |

## Arquitectura y entrenamiento

El modelo es un decodificador de acciones (World2Action) que consume las representaciones producidas por un backbone Video2World congelado. El backbone inicial corresponde al commit `f28339034831e3c2374be075e622e1ff38ebe0f8` de `jonpai/mimic-video`, sobre el que se aplica un LoRA de vídeo congelado (`kuka-level2-no-source-stage-v1-video-iter400`, commit `a03e938f...`). El decodificador se entrena manteniendo fijos tanto el backbone como el LoRA de vídeo, de modo que solo se optimizan los pesos del propio decodificador.

El entrenamiento se realizó sobre el dataset `vam-cross-level2-kuka-iiwa14-widowx-texture` (commit `34e9c174...`), con 256 episodios y 54 376 frames, usando dos cámaras (`observation.images.corner_cam` y `observation.images.front_cam`). El objetivo son 15 acciones de efector final y pinza a 5 Hz, con pose relativa a la pose alcanzada actual (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool` y rotación codificada como `rotation_6d`. La ejecución se detuvo por un motivo etiquetado como `unknown`, y se seleccionó el checkpoint completo más reciente verificado (modelo, optimizador, scheduler y trainer) antes de subir los pesos. No se documentan detalles sobre número de tokens, composición del dataset, RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Predicción de acciones robóticas de 15 dimensiones (pose relativa del efector final y apertura/cierre de pinza) a partir de observaciones visuales de dos cámaras.
- Procesamiento de observaciones multi-cámara (`corner_cam` y `front_cam`) como entrada al decodificador.
- Representación de rotación mediante `rotation_6d` para evitar discontinuidades de representaciones angulares.
- Generación de comandos a 5 Hz, adecuada para control de brazos manipuladores en tareas de imitación.
- Integración con el ecosistema MimicVideo mediante commits fijados y configuración reproducible.
- No dispone de capacidades de lenguaje, tool calling, agentes, visión general, audio ni razonamiento multi-paso; su ámbito es exclusivamente la predicción de acciones robóticas.

## Casos de uso

- Investigación en imitación visual para manipulación: el decodificador traduce vídeo a acciones y permite evaluar variantes de backbone y LoRA sin reentrenar el decodificador completo, gracias a que los pesos del backbone y del LoRA están congelados.
- Reproducción de experimentos de VAM-Cross: con los commits fijados de MimicVideo y los pesos congelados, se puede reproducir la iteración 900 y comparar con otras iteraciones del mismo run.
- Control de un KUKA IIWA14 con pinza WidowX en laboratorio: el contrato de acciones a 5 Hz y pose relativa encaja con teleoperación y ejecución de políticas de imitación en un setup físico con dos cámaras.
- Ajuste fino del decodificador sobre nuevos datasets: al ser un componente separado del backbone, se puede reentrenar sobre el dataset `vam-cross-level2-kuka-iiwa14-widowx-texture` u otros con el mismo contrato de datos.
- Evaluación de representaciones de vídeo: sirve como sonda para medir cuánta información accionable contiene un backbone Video2World con LoRA congelado en tareas de manipulación.
- Docencia y prototipado en robótica: permite montar un pipeline completo de percepción-acción con recursos acotados (repo de 1 GB más el backbone), útil para prácticas de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del backbone Video2World congelado, que no se incluye en este repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el despliegue esperado es mediante el stack MimicVideo con los commits fijados.
- Latencia y throughput: no disponibles; el modelo genera acciones a 5 Hz por contrato de datos, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kuka-level2-no-source-stage-v1-video400-action900 | no disponible | no disponible | Predicción de acciones robóticas (KUKA IIWA14 + WidowX) | no disponible | Pesos del decodificador en HF |
| jonpai/mimic-video (backbone Video2World) | no disponible | no disponible | Backbone vídeo-acción | no disponible | HF, commit fijado |
| kuka-level2-no-source-stage-v1-video-iter400 (LoRA de vídeo) | no disponible | no disponible | Adaptación de vídeo congelada | no disponible | HF, commit fijado |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el decodificador; sin el backbone Video2World, el LoRA de vídeo y el dataset, el modelo no es utilizable de forma autónoma.
- La licencia no está declarada, por lo que no se puede confirmar el uso comercial ni la redistribución.
- El entrenamiento se detuvo con motivo `unknown`; no hay garantía de que la iteración 900 sea óptima.
- No se publican métricas de éxito, error de pose ni benchmarks, lo que impide evaluar su calidad objetivamente.
- El contrato de datos es muy específico (dos cámaras concretas, 15 acciones, 5 Hz, `rotation_6d`, marco `widowx_reference_base/teleop_aligned_tool`); cualquier desviación requiere reentrenamiento.
- Riesgo de sobreajuste al dataset de 256 episodios y a la textura y condiciones de iluminación del entorno de captura.
- No hay información sobre sesgos, robustez ante cambios de cámara o generalización a otras tareas.
- Uso en producción no recomendado sin validación adicional y sin una licencia clara.

## Enlaces

- Hugging Face: https://huggingface.co/dreamdifferent/kuka-level2-no-source-stage-v1-video400-action900
- Backbone Video2World: https://huggingface.co/jonpai/mimic-video/tree/f28339034831e3c2374be075e622e1ff38ebe0f8
- LoRA de vídeo congelado: https://huggingface.co/dreamdifferent/kuka-level2-no-source-stage-v1-video-iter400/tree/a03e938f3b79044468c8814c96644a5cf626860b
- Dataset: https://huggingface.co/datasets/dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture/tree/34e9c1742ff40ca3b60e06fc3ae92872c33248fe
