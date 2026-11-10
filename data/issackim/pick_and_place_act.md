# IssacKIM/pick_and_place_act

## Resumen

`IssacKIM/pick_and_place_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha entrenado y subido a Hugging Face el usuario IssacKIM utilizando LeRobot, la librería de aprendizaje automático para robótica real de Hugging Face. Resuelve una tarea concreta de manipulación —recoger y colocar un objeto, identificada como `pick_and_place`— sobre un robot de tipo `omx_follower` equipado con dos cámaras (muñeca y cenital).

A diferencia de un modelo de lenguaje, esta política consume observaciones multimodales del robot (estado articular de 6 dimensiones e imágenes RGB de 480x640 de dos vistas) y produce directamente comandos de acción de 6 dimensiones. La arquitectura es un transformer con codificador visual y decodificador de acciones, con 51.668.614 parámetros totales según los pesos en safetensors. El repositorio ocupa 0,2 GB.

La relevancia del modelo es acotada: se trata de un artefacto de entrenamiento con 500 pasos, batch de 10 y un dataset de solo 50 episodios (14.745 fotogramas a 30 FPS). No es un modelo de propósito general ni un checkpoint de referencia, sino un ejemplo reproducible del flujo de trabajo de LeRobot para imitación robótica de una tarea única. No se han publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele lograr tasas de éxito altas en tareas de manipulación teleoperadas. La política combina un codificador visual que procesa las dos cámaras de entrada (`observation.images.wrist` y `observation.images.top`, ambas de 3x480x640) con un transformer que modela la secuencia de estados y acciones; la salida es un vector de acción de 6 dimensiones que se corresponde con el estado articular de 6 dimensiones del robot `omx_follower`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `IssacKIM/pick_and_place`: 50 episodios, 14.745 fotogramas a 30 FPS, una única tarea (`pick_and_place`). La configuración es muy corta: 500 pasos de entrenamiento, batch size 10, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá del número de episodios y fotogramas, ni se indica si hubo aumentación de datos, RLHF, DPO u otras técnicas de ajuste. Tampoco se especifican detalles del backbone visual ni de la dimensión interna del transformer.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `omx_follower` a partir de estado articular e imágenes.
- Percepción visual multimodal: procesa simultáneamente una vista de muñeca y una vista cenital a resolución 480x640.
- Ejecución de una tarea única: `pick_and_place` (recoger y colocar), sin capacidad de generalización declarada a otras tareas.
- Aprendizaje por imitación: reproduce comportamientos derivados de datos teleoperados.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni agentes conversacionales.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo de pensamiento (thinking), visión general, audio ni otras capacidades especiales.

## Casos de uso

- Recogida y colocación de objetos en un banco de trabajo: la política ejecuta la tarea `pick_and_place` sobre el robot `omx_follower` usando las dos cámaras; es adecuada porque fue entrenada exactamente para esa tarea y esa configuración de sensores.
- Reproducción del flujo de imitación con LeRobot: sirve como ejemplo funcional para validar la instalación de LeRobot 0.6.2, el comando `lerobot-rollout` y la integración de cámaras OpenCV a 30 FPS.
- Prototipado de pipelines de robótica: permite probar el ciclo completo de grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout` antes de invertir en datasets mayores.
- Docencia y demostraciones: al ser un checkpoint pequeño (0,2 GB, 51,7 M de parámetros) y con configuración de entrenamiento documentada, es útil para explicar ACT y el aprendizaje por imitación en entornos académicos.
- Base para fine-tuning con datos propios: se puede partir de esta política y reentrenar con un dataset mayor del mismo robot y tarea para mejorar la robustez.
- Evaluación comparativa de métodos de imitación: sirve como línea base de ACT frente a otros métodos disponibles en LeRobot (por ejemplo, diffusion policy) sobre la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y entradas de dos imágenes de 480x640, la huella es modesta y cabe con holgura en GPUs de consumo, aunque no se documenta una cifra concreta.
- GPU recomendadas: no disponible; el comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU NVIDIA, pero no se especifica modelo.
- GPU de consumo: previsiblemente compatible con tarjetas consumer recientes por el tamaño del modelo, si bien no hay confirmación en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento), con la política cargada desde `IssacKIM/pick_and_place_act`; requiere robot `omx_follower` y dos cámaras OpenCV a 640x480 y 30 FPS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IssacKIM/pick_and_place_act | 51,7 M | no disponible | pick_and_place (omx_follower) | no disponible | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | no disponible | no disponible | variables por robot y tarea | variable | Hugging Face |
| Políticas de diffusion en LeRobot Hub | no disponible | no disponible | variables por robot y tarea | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada. La comparación se limita a la categoría (políticas de imitación entrenadas con LeRobot) y no a métricas de éxito, que no se han publicado para este checkpoint.

## Limitaciones y advertencias

- Entrenamiento muy corto: 500 pasos con batch 10 y learning rate 1e-05 sobre 50 episodios; es probable que la política esté infraentrenada y no generalice.
- Dataset pequeño y de una sola tarea: 14.745 fotogramas para una única tarea `pick_and_place`; no hay evidencia de robustez ante cambios de posición de objetos, iluminación o distractores.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar su fiabilidad en producción.
- Específica de hardware: diseñada para el robot `omx_follower` con cámaras `wrist` y `top`; no es transferible directamente a otras configuraciones sin reentrenamiento.
- Licencia no especificada: la model card indica "[More Information Needed]", lo que impide confirmar el uso comercial.
- Riesgo de sobreajuste al entorno de grabación: al ser imitación sobre pocos episodios, puede reproducir sesgos de la demostración (posiciones, velocidades, objetos concretos).
- Sin capacidades de lenguaje, razonamiento simbólico ni tool calling: no debe emplearse fuera del contexto de control robótico para el que fue entrenada.
- Fecha de creación futura en los metadatos (2026-11-10): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IssacKIM/pick_and_place_act
- Dataset de entrenamiento: https://huggingface.co/datasets/IssacKIM/pick_and_place
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=IssacKIM/pick_and_place
