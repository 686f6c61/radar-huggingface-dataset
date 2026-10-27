# phgandhi02/grab_red_lego_policy

## Resumen

`grab_red_lego_policy` es una política robótica de imitación publicada por phgandhi02 en Hugging Face, entrenada con LeRobot para una tarea concreta: agarrar un ladrillo de Lego rojo. No es un modelo de lenguaje ni un modelo generalista; recibe el estado proprioceptivo de 6 dimensiones y una imagen frontal de `(3, 480, 640)`, y produce una acción de 6 dimensiones para un robot `so_follower`.

Utiliza ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El checkpoint contiene 51.668.614 parámetros y el repositorio ocupa 0,2 GB, por lo que es un modelo pequeño y muy especializado.

Su interés es principalmente reproducible: documenta un flujo completo de grabación de datos, entrenamiento y despliegue con LeRobot sobre 5 episodios y 3264 fotogramas a 30 FPS. No sustituye a un modelo fundacional de robótica y no dispone de evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación para control robótico |
| Parámetros totales | 51.668.614, según safetensors |
| Parámetros activos | no aplica; no es un modelo MoE |
| Longitud de contexto | no aplica; no es un modelo de lenguaje |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; no es un modelo lingüístico |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | `Grab the red lego` |
| Robot | `so_follower` |
| Cámaras | `front`, una cámara |
| Entrada | `observation.state` `(6,)`; `observation.images.front` `(3, 480, 640)` |
| Salida | `action` `(6,)` |
| Dataset de entrenamiento | `phgandhi02/record-test_20261026_161256` |
| Episodios y fotogramas | 5 episodios; 3264 fotogramas a 30 FPS |
| Pasos de entrenamiento | 100.000 |
| Tamaño del repositorio | 0,2 GB |
| Librería y pipeline | LeRobot; robotics |
| Descargas y likes | 0 y 0 |

## Arquitectura y entrenamiento

La política sigue el método ACT, que aprende de datos teleoperados y predice trozos de acción en lugar de una única acción por paso. La model card no detalla el número de capas, la dimensión oculta, el horizonte de chunking ni la composición exacta del codificador visual; solo especifica que consume una imagen frontal de 640×480 y un vector de estado de 6 dimensiones, y que devuelve una acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, con batch size de 8, optimizador AdamW, learning rate de `1e-5` y semilla 1000. El dataset contiene únicamente 5 episodios y 3264 fotogramas a 30 FPS para la tarea "Grab the red lego". No se documenta uso de RLHF, DPO ni otras fases de alineación, lo cual es coherente con un método de imitación supervisada. Tampoco se indica el número de tokens de entrenamiento porque no es un modelo de lenguaje; el dato equivalente disponible es el número de fotogramas.

## Capacidades

- Control robótico especializado en una única tarea: generar acciones de 6 dimensiones para agarrar un Lego rojo con un robot `so_follower`.
- Fusión de estado proprioceptivo de 6 dimensiones con una imagen frontal de resolución 640×480.
- Predicción de acciones mediante el enfoque ACT, orientado a fragmentos de acción según el método citado.
- Ejecución mediante la CLI de LeRobot, en particular `lerobot-rollout`.
- Integración con el flujo de entrenamiento y despliegue de LeRobot.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües.
- No es un modelo de visión-lenguaje: usa visión como entrada, pero no describe imágenes ni mantiene conversaciones.
- No dispone de modo "thinking", audio, vídeo ni otras capacidades generales.
- No se han publicado resultados de éxito ni evaluaciones reales en la información disponible.

## Casos de uso

- Reproducción de una demo de agarre: ejecutar la política sobre un robot `so_follower` para comprobar el flujo completo de inferencia con la tarea "Grab the red lego".
- Validación de la cadena hardware-software: probar la calibración del robot, la cámara frontal, el puerto de comunicación y la frecuencia de captura configurada a 30 FPS.
- Baseline para experimentos de imitación: comparar nuevas políticas ACT entrenadas con LeRobot contra este checkpoint en la misma tarea y condiciones de laboratorio.
- Docencia y tutoriales: ilustrar un caso mínimo de aprendizaje por imitación, desde la grabación de episodios teleoperados hasta el despliegue con `lerobot-rollout`.
- Pruebas de integración con LeRobot: verificar comandos, rutas de checkpoint, nombres de cámaras y claves de observación en un entorno controlado.
- Reentrenamiento con más datos: usar la configuración documentada como referencia para grabar episodios adicionales y entrenar una política similar con un dataset mayor.
- Evaluación controlada de robustez: medir en laboratorio la sensibilidad a cambios de posición del objeto, iluminación o calibración, siempre que se ejecuten pruebas sistemáticas y se reporten resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política, por lo que no hay tasas de éxito, números de ensayos ni comparaciones cuantitativas verificables.

## Requisitos de hardware

- VRAM oficial: no disponible. El checkpoint tiene 51.668.614 parámetros y el repositorio pesa 0,2 GB, pero el consumo real depende de LeRobot, del backend de PyTorch, de la resolución de imagen y de las activaciones.
- Memoria teórica de pesos: en FP32 serían aproximadamente 207 MB; en FP16/BF16, aproximadamente 103 MB. No se especifica el dtype de los pesos ni se documentan opciones de cuantización.
- GPU recomendadas: no hay una lista validada por el autor. Por el tamaño del modelo, es previsible que quepa en GPUs consumer modernas, pero no se ha publicado una medición oficial de VRAM.
- Despliegue: la vía documentada es LeRobot con `lerobot-rollout` y PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables a esta política robótica.
- Latencia y throughput: no disponibles. La captura del dataset se realizó a 30 FPS, pero eso no implica que la política infiera a 30 Hz en el robot.
- Requisitos adicionales: robot `so_follower`, cámara frontal compatible con OpenCV, calibración del robot y nombres de cámara coincidentes con las claves de observación del entrenamiento.

## Comparativa con modelos similares

No se identifican alternativas concretas en la información proporcionada. La comparación disponible se limita a la categoría general de políticas ACT entrenadas con LeRobot para robots `so_follower`.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `phgandhi02/grab_red_lego_policy` | 51.668.614 | no aplica | agarre de Lego rojo | Apache-2.0 | Hugging Face |
| Otras políticas ACT para `so_follower` | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de imitación comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El dataset es muy pequeño: 5 episodios y 3264 fotogramas. El riesgo de sobreajuste al entorno de grabación es alto.
- La política está especializada en una sola tarea, un solo tipo de robot y una sola cámara frontal. No hay evidencia de generalización a otras posiciones, objetos, robots o cámaras.
- No se han publicado evaluaciones reales ni tasas de éxito. No se puede afirmar que sea fiable en producción.
- El rendimiento puede degradarse con cambios de iluminación, fondo, posición del Lego, calibración del robot o resolución de la cámara.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente, no usa herramientas y no soporta conversaciones multilingües.
- La "alucinación" en el sentido lingüístico no aplica; el modo de fallo relevante es ejecutar una acción incorrecta o insegura.
- No se documentan sesgos demográficos, pero sí un sesgo claro hacia el entorno y la distribución de los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero no ofrece garantías. Cualquier despliegue físico requiere supervisión, límites de seguridad y validación independiente.
- No hay información sobre cuantización, exportación a otros formatos ni compatibilidad con backends distintos de LeRobot.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/phgandhi02/grab_red_lego_policy)
- [Dataset de entrenamiento](https://huggingface.co/datasets/phgandhi02/record-test_20261026_161256)
- [Paper de ACT en Hugging Face](https://huggingface.co/papers/2304.13705)
- [Paper de ACT en arXiv](https://arxiv.org/abs/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de aprendizaje por imitación](https://huggingface.co/docs/lerobot/en/il_robots)
- [Referencia de comandos CLI](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia](https://huggingface.co/docs/lerobot/main/en/inference)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=phgandhi02/record-test_20261026_161256)
