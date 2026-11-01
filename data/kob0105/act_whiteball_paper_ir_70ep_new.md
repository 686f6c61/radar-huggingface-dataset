# kob0105/act_whiteball_paper_IR_70ep_NEW

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación orientado a control robótico que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `kob0105/act_whiteball_paper_IR_70ep_NEW`, es una política entrenada con LeRobot sobre el robot `so_follower` para la tarea "pick place white ball" (recoger y colocar una bola blanca), usando dos cámaras (`global` y `palm`) y un estado proprioceptivo de 6 dimensiones.

El modelo resuelve un problema muy acotado: ejecutar una política visuomotora de imitación para una tarea específica de pick-and-place sobre un robot SO-100/SO-101 (formato `so_follower`). No es un modelo de lenguaje ni un modelo fundacional generalista: es un checkpoint de política robótica de 51,7 millones de parámetros, entrenado durante 30.000 pasos con un batch de 8 sobre 70 episodios (28.931 frames a 30 FPS) del dataset `kob0105/record_test_new_whiteball_paper_IR`.

Su relevancia es práctica para quien trabaja con el ecosistema LeRobot: sirve como referencia de un pipeline completo de grabación, entrenamiento y despliegue de una política ACT en hardware asequible, con licencia Apache 2.0 y pesos en safetensors. El repo ocupa 0,2 GB y tiene un uso muy limitado (22 descargas, 0 likes), lo que sugiere un experimento personal más que un modelo de referencia de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visuomotora que, a partir de observaciones (estado del robot e imágenes de cámaras), predice un *chunk* de acciones futuras en lugar de una sola acción. Esto mitiga el problema de la varianza en la predicción paso a paso y permite ejecutar movimientos más suaves y consistentes. La política consume `observation.state` de forma `(6,)` y dos imágenes RGB de `(3, 480, 640)` procedentes de las cámaras `global` y `palm`, y produce una acción de forma `(6,)`, correspondiente a las 6 articulaciones del robot `so_follower`.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kob0105/record_test_new_whiteball_paper_IR`: 70 episodios, 28.931 frames a 30 FPS, tarea "pick place white ball". La configuración fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado a partir de demostraciones de teleoperación.

## Capacidades

- Control robótico visuomotor para la tarea concreta "pick place white ball" sobre robot `so_follower`.
- Predicción de *action chunks* de 6 dimensiones a partir de estado de 6 dimensiones e imágenes de dos cámaras.
- Fusión de información visual global y de muñeca (`palm`) para localización y agarre del objeto.
- Ejecución de políticas en tiempo real a 30 FPS mediante el comando `lerobot-rollout`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fundacionales.

## Casos de uso

- Recogida y colocación de una bola blanca en un entorno de laboratorio: la política está entrenada específicamente para esta tarea y puede ejecutarse con `lerobot-rollout` sobre un SO-100/SO-101 con dos cámaras configuradas como `global` y `palm`.
- Reproducción de un pipeline de imitación de referencia: sirve para validar la instalación de LeRobot, la calibración del robot y la configuración de cámaras antes de entrenar políticas propias.
- Base para *fine-tuning* en tareas de pick-and-place similares: al ser Apache 2.0 y estar en safetensors, puede reentrenarse con `lerobot-train` sobre un dataset propio con el mismo esquema de observaciones.
- Docencia y formación en robótica de imitación: permite mostrar de extremo a extremo grabación de datos, entrenamiento ACT y despliegue en hardware asequible.
- Pruebas de integración de hardware: útil para verificar latencias, sincronización de cámaras y comportamiento del robot `so_follower` con una política conocida.
- Evaluación comparativa de métodos de imitación: puede usarse como línea base ACT frente a otros métodos (p. ej., Diffusion Policy) en la misma tarea y robot.
- Prototipado de automatización de manipulación de objetos pequeños: la combinación de cámara de muñeca y global facilita el agarre preciso en tareas de precisión limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, el checkpoint en safetensors ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia, aunque no se documenta.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como RTX 3060/4060 o superiores, aunque no está verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el sistema opera a 30 FPS según el dataset de entrenamiento, pero no se reportan métricas de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kob0105/act_whiteball_paper_IR_70ep_NEW | 51,7 M | no aplica | Pick place white ball (so_follower) | Apache 2.0 | HuggingFace |
| ACT original (paper 2304.13705) | no disponible | no aplica | Manipulación diversa (benchmarks del paper) | no disponible | Paper |
| Diffusion Policy | no disponible | no aplica | Manipulación diversa | no disponible | Repositorio de referencia |
| Otras políticas LeRobot ACT de la comunidad | variable | no aplica | Tareas específicas | variable | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Política altamente específica: entrenada solo para "pick place white ball" con el robot `so_follower`; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin evaluación en robot real: el autor no reporta tasa de éxito ni condiciones de prueba, por lo que se desconoce su fiabilidad.
- Sensible a condiciones de entorno: cambios de iluminación, posiciones de objeto, fondo o calibración de cámaras pueden degradar el rendimiento (limitación inherente al aprendizaje por imitación).
- Dataset pequeño: 70 episodios y 28.931 frames; puede sufrir sobreajuste y escasa robustez ante variaciones.
- Sin capacidades lingüísticas ni de razonamiento general; no debe evaluarse con benchmarks de LLM.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar la seguridad del despliegue físico.
- Riesgo de alucinación no aplica en el sentido textual, pero sí existe riesgo de acciones erróneas o inseguras en el robot.
- Idiomas soportados no disponibles; no relevante para la tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kob0105/act_whiteball_paper_IR_70ep_NEW
- Dataset de entrenamiento: https://huggingface.co/datasets/kob0105/record_test_new_whiteball_paper_IR
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/record_test_new_whiteball_paper_IR
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
