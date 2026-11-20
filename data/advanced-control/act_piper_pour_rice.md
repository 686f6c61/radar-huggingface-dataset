# advanced-control/act_piper_pour_rice

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación robótica. El modelo `advanced-control/act_piper_pour_rice` es una política concreta entrenada con este método mediante la librería LeRobot de Hugging Face, orientada a la tarea de verter arroz con un robot Piper.

La política consume el estado del robot (7 dimensiones) y tres flujos de vídeo de cámaras (mano, pecho y cámara superior, a resolución 360x640) y produce un vector de acción de 7 dimensiones. Cuenta con 51.670.663 parámetros y se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamaño de repositorio de 0,2 GB.

Es relevante como ejemplo reproducible de un pipeline completo de imitación en robótica real: dataset público de 30 episodios y 48.715 fotogramas a 15 FPS, configuración de entrenamiento documentada y comandos de despliegue con LeRobot. No obstante, se trata de una política específica de tarea, sin resultados de evaluación publicados y sin métricas de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice secuencias cortas de acciones (action chunks) en lugar de una única acción por paso, lo que mitiga el error de acumulación típico de las políticas paso a paso. La política recibe como entrada `observation.state` con forma `(7,)` y tres imágenes RGB de `(3, 360, 640)` procedentes de las cámaras `camera_hand`, `camera_chest` y `camera_top`, y emite una acción de forma `(7,)`.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `advanced-control/piper_pour_rice`, compuesto por 30 episodios y 48.715 fotogramas a 15 FPS, con la tarea etiquetada como "task". La configuración documentada incluye 100.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se especifica en la información disponible la composición del dataset más allá del número de episodios y fotogramas, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en aprendizaje por imitación).

## Capacidades

- Generación de acciones de control robótico de 7 dimensiones a partir de estado propioceptivo y tres vistas de cámara.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- Predicción de fragmentos de acción (action chunking) para reducir el error acumulado en horizontes largos.
- Fusión multimodal de tres flujos visuales (mano, pecho y vista superior) con el estado del robot.
- Ejecución de una tarea concreta de manipulación: verter arroz con un robot Piper.
- Integración con el ecosistema LeRobot para rollout, entrenamiento y evaluación.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso textual ni procesamiento de lenguaje natural.

## Casos de uso

- Replicación de experimentos de imitación: sirve como referencia reproducible para validar un pipeline completo de LeRobot (grabación, entrenamiento y despliegue) en un robot Piper con tres cámaras.
- Base para fine-tuning en tareas de vertido: el checkpoint puede reutilizarse como inicialización para tareas similares de manipulación de graneles (arroz, legumbres, materiales granulados) con nuevos datasets.
- Evaluación de action chunking en robótica real: permite comparar empíricamente el comportamiento de ACT frente a políticas paso a paso en la misma plataforma hardware.
- Docencia y formación en aprendizaje por imitación: el modelo y su dataset asociado constituyen un ejemplo completo y de pequeño tamaño (0,2 GB) para cursos de robótica con aprendizaje profundo.
- Pruebas de integración de hardware: útil para verificar la calibración de cámaras y la correspondencia de claves de observación (`camera_hand`, `camera_chest`, `camera_top`) antes de entrenar políticas propias.
- Benchmark interno de infraestructura de inferencia robótica: al ser un modelo pequeño, permite medir latencia de rollout y throughput de un pipeline LeRobot en GPUs de gama consumer.
- Prototipado de automatización de cocina o laboratorio: como punto de partida para tareas de vertido controlado en entornos experimentales, siempre con supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 millones de parámetros en precisión FP32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria es muy reducida y el cuello de botella será el procesamiento de las tres imágenes de 360x640.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente por tamaño de modelo; se recomienda al menos una RTX 3060 o superior para mantener la frecuencia de control a 15 FPS con tres cámaras.
- Cabe en GPU consumer: sí, con holgura, incluidas GTX 1660, RTX 2060, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=advanced-control/act_piper_pour_rice`), así como el resto del ecosistema LeRobot para entrenamiento (`lerobot-train`).
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones. El dataset de entrenamiento se grabó a 15 FPS, lo que sugiere que la política fue concebida para operar a esa frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| advanced-control/act_piper_pour_rice | 51.670.663 | no aplica | Vertido de arroz con robot Piper | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Manipulación genérica | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación genérica | variable | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Política específica de tarea: entrenada únicamente para "verter arroz" con un robot Piper; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Dataset pequeño: 30 episodios y 48.715 fotogramas; la cobertura de posiciones, iluminación y distractores es presumiblemente limitada.
- Dependencia de la configuración de cámaras: las claves de observación (`camera_hand`, `camera_chest`, `camera_top`) y las resoluciones (360x640) deben coincidir exactamente con las del entrenamiento.
- Riesgo de sobreajuste al entorno de grabación: cambios en la mesa, el recipiente o la iluminación pueden degradar el rendimiento.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural ni soporta tool calling; la tarea se invoca mediante la etiqueta "task".
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos de teleoperación de un operador concreto puede heredar sesgos de estilo de manipulación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Fecha de creación en el Hub: 2026-11-19, sin actualizaciones posteriores registradas; sin descargas ni likes, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/advanced-control/act_piper_pour_rice
- Dataset de entrenamiento: https://huggingface.co/datasets/advanced-control/piper_pour_rice
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=advanced-control/piper_pour_rice
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
