# knight7024/act_pick_and_place_hair_roll_v2

## Resumen

`act_pick_and_place_hair_roll_v2` es una política de robótica entrenada mediante imitación con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha desarrollado el usuario de Hugging Face knight7024 y está empaquetado en formato LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado de las articulaciones y dos flujos de vídeo (cámara cenital y cámara de muñeca) y emite comandos de acción de 6 dimensiones para un brazo `so_follower`.

La política resuelve una tarea concreta y estrecha: coger y colocar un rulo de pelo ("pick_and_place_hair_roll"). Se entrenó con 60 episodios de teleoperación (32.055 fotogramas a 30 FPS) y 200.000 pasos de optimización con AdamW a un learning rate de 1e-5. Con 51,6 millones de parámetros y un repo de 0,2 GB, es un modelo pequeño pensado para inferencia en tiempo real junto al robot, no para despliegue en servidores de gran escala.

Su relevancia es la de un ejemplo reproducible de ACT con LeRobot 0.6.1: sirve como referencia práctica de cómo se entrena, se publica y se ejecuta una política de imitación con dos cámaras y estado proprioceptivo, y como punto de partida para quien quiera replicar el pipeline con su propio robot SO-100/SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de ACT, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se identifica con la cadena "pick_and_place_hair_roll") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo LeRobot, 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice trozos ("chunks") de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación y suaviza el control. La política consume `observation.state` con forma `(6,)`, una imagen cenital de `(3, 240, 320)` y una imagen de muñeca de `(3, 480, 640)`, y produce una acción de `(6,)`. El modelo tiene 51.668.614 parámetros y se distribuye en safetensors dentro del formato de repositorio de LeRobot.

El entrenamiento se hizo con el dataset `knight7024/pick_and_place_hair_roll`: 60 episodios, 32.055 fotogramas a 30 FPS, una única tarea. La configuración reportada es de 200.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-5 y semilla 1000, con LeRobot 0.6.1. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica en este paradigma), ni innovaciones adicionales sobre el ACT original.

## Capacidades

- Control visomotor para una tarea de pick-and-place sobre un brazo `so_follower` con 6 dimensiones de acción.
- Fusión de dos cámaras: vista cenital (`top`) y vista de muñeca (`wrist`), con resoluciones distintas.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas de movimiento de forma más estable que un control paso a paso.
- Aprendizaje por imitación a partir de teleoperación; no requiere modelado explícito del entorno ni recompensas.
- Ejecución en tiempo real mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües: es una política de robótica específica de tarea.

## Casos de uso

- Automatización de una celda de pick-and-place de un rulo de pelo: la política ejecuta la secuencia completa coger-colocar sobre un SO-100/SO-101 con cámara cenital y de muñeca, adecuada porque el modelo se entrenó exactamente para esa tarea y esa morfología.
- Base para reentrenar con datos propios: el repo sirve como plantilla de `lerobot-train` con `--policy.type=act`, útil para equipos que quieran adaptar el pipeline a otro objeto o posición.
- Evaluación de pipelines de imitación en laboratorio: al ser un modelo pequeño (51,6 M de parámetros) y con licencia Apache 2.0, se puede usar como referencia para comparar tasas de éxito entre configuraciones de cámaras y datos.
- Docencia y demostraciones de LeRobot: el flujo `lerobot-rollout` con `--duration=60` permite mostrar en directo cómo una política ACT controla un robot real.
- Pruebas de robustez ante cambios de iluminación o posición de objeto: útil para medir la sensibilidad de ACT a variaciones del entorno antes de desplegar en producción.
- Integración en un banco de pruebas de robótica de bajo coste: cabe en una GPU de consumo y no requiere infraestructura de servidor, lo que facilita prototipos en laboratorios pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de trials/success rate vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,668 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria es muy baja (del orden de 1-2 GB incluyendo buffers de imagen y overhead del runtime).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; no se documentan requisitos mínimos.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1060/RTX 2060 o superiores; no hay datos oficiales de compatibilidad.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles; el control se ejecuta a 30 FPS según el dataset, pero no se reporta latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_and_place_hair_roll_v2 | 51,7 M | no disponible | Pick-and-place de rulo de pelo con SO follower | Apache 2.0 | Hugging Face (28 descargas) |
| Otras políticas ACT en LeRobot Hub | no disponible | no disponible | Distintas tareas de imitación | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | no disponible | Imitación visomotora | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de tarea: solo se ha entrenado para "pick_and_place_hair_roll"; no generaliza a otros objetos ni entornos sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de la morfología: entrenado para `so_follower` con cámaras `top` y `wrist`; cambiar el robot, la disposición de cámaras o las resoluciones invalida el modelo.
- Dataset pequeño: 60 episodios y 32.055 fotogramas; riesgo de sobreajuste a posiciones, iluminación y fondos concretos del entorno de grabación.
- Sin datos de sesgos: no se documentan sesgos, pero al ser una política visual hereda los sesgos de los datos de teleoperación (posiciones, objetos y condiciones de grabación).
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de acciones incorrectas o inseguras ante entradas fuera de distribución; conviene operar con límites de seguridad en el robot.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset asociado antes de reutilizarlo.
- Repo con muy poca tracción (28 descargas, 0 likes): no hay comunidad ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knight7024/act_pick_and_place_hair_roll_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_hair_roll
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_hair_roll
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
