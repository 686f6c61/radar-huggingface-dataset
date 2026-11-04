# RoboColosseum/droid-put-marker-pen-pi0.5

## Resumen

`RoboColosseum/droid-put-marker-pen-pi0.5` es un fine-tune de política robótica del modelo Vision-Language-Action π₀.₅ (Pi05) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. El modelo base es `lerobot/pi05_base` y se ha especializado mediante aprendizaje por imitación en una única tarea de manipulación: introducir un rotulador en un soporte de bolígrafos ("Put the marker into the pen holder"). Está pensado para ejecutarse sobre un brazo Franka con dos cámaras (vista izquierda y vista de muñeca).

El modelo resuelve el problema de convertir observaciones multimodales (estado articular, posición cartesiana y tres flujos de imagen) en comandos de acción de 8 dimensiones a 30 FPS. Su relevancia es acotada: no es un modelo generalista, sino un artefacto de investigación reproducible que demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) sobre un dataset pequeño de 100 episodios.

Con 4.143.404.816 parámetros (~4,1 mil millones) y un repositorio de 9,4 GB en safetensors, es un modelo de tamaño medio que requiere GPU para inferencia en tiempo real. La licencia Apache 2.0 permite uso comercial, aunque la especialización extrema limita su utilidad fuera del entorno y la tarea de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot derivada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de π₀.₅, un VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el preentrenamiento. La implementación concreta es la de LeRobot, adaptada del repositorio OpenPI. La política consume `observation.state` (8 dimensiones), `observation.cartesian_position` (6 dimensiones) y tres cámaras: `left_image` y `wrist` a 360×640×3, y `empty_camera_0` a 224×224×3. Produce un vector de acción de 8 dimensiones. El robot objetivo es un Franka.

El entrenamiento se realizó sobre el dataset `local/droid-put-marker-pen-left-wrist`: 100 episodios, 51.699 frames a 30 FPS, una única tarea. La configuración reportada es 16.160 pasos, batch size 4, optimizador AdamW, learning rate 2,5e-05, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni ninguna fase de refinamiento por preferencias; se trata de aprendizaje por imitación supervisado puro sobre demostraciones. Tampoco se detalla la composición del corpus de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 8 dimensiones para un brazo Franka a partir de observaciones visuales y propioceptivas.
- Percepción multimodal: procesa simultáneamente estado articular, posición cartesiana y tres cámaras (vista izquierda, muñeca y una tercera cámara auxiliar).
- Ejecución de una tarea lingüística concreta: "Put the marker into the pen holder", condicionada por el prompt de tarea.
- Aprendizaje por imitación: reproduce la política aprendida de las demostraciones del dataset de entrenamiento.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, matemáticas, generación de texto libre ni otros idiomas.

## Casos de uso

- Reproducción de experimentos de imitación en robótica: sirve como referencia para validar un pipeline completo de LeRobot sobre un Franka, desde la grabación de 100 episodios hasta el despliegue con `lerobot-rollout`.
- Benchmark interno de manipulación fina: la tarea de insertar un rotulador en un soporte exige precisión de agarre y alineación, por lo que puede usarse como prueba controlada de políticas de inserción.
- Base para fine-tuning adicional: al partir de `lerobot/pi05_base` y estar en safetensors, puede reentrenarse con `lerobot-train` sobre datasets propios de tareas similares de pick-and-place.
- Docencia y formación: ejemplo didáctico de VLA aplicado, con configuración de entrenamiento y dataset públicos que permiten explicar el ciclo completo de aprendizaje por imitación.
- Evaluación de robustez ante cambios de cámara: al fijar nombres y resoluciones de cámara, permite estudiar cómo afecta la sustitución de la cámara `empty_camera_0` o variaciones de iluminación en el éxito de la tarea.
- Prototipado de automatización de laboratorio: para tareas repetitivas de colocación de objetos pequeños en soportes, siempre que el entorno coincida con el de entrenamiento y se valide previamente la tasa de éxito.
- Investigación en generalización: comparar este fine-tune especializado con el modelo base π₀.₅ para medir la pérdida de generalización tras el ajuste a una sola tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no existe tabla de éxitos por tarea ni comparación numérica con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,1 B parámetros, en FP16 serían necesarios aproximadamente 8,3 GB solo para pesos, más el overhead de las tres cámaras y del runtime, por lo que se recomienda al menos 12-16 GB de VRAM.
- GPU recomendadas: no especificadas por el autor; por tamaño, encajan GPU de datacenter como A100 o H100 y GPU de consumo de gama alta como RTX 4090.
- ¿Cabe en GPU de consumo? Probablemente sí en RTX 4090 (24 GB) en FP16, siempre que el resto del pipeline de LeRobot no consuma demasiada memoria; no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path`; entrenamiento con `lerobot-train` y `--policy.device=cuda`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que la inferencia debe operar en ese orden de frecuencia para un control fluido, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RoboColosseum/droid-put-marker-pen-pi0.5` | ~4,1 B | no disponible | Insertar rotulador en soporte (Franka) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | VLA generalista π₀.₅ | no disponible en la información | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista predecesor | no disponible en la información | OpenPI |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de éxito ni de rendimiento para este fine-tune, y los datos de parámetros y contexto del modelo base no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea y un único entorno; no generaliza a otras instrucciones ni a otras configuraciones de robot.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no puede recomendarse para producción sin validación previa en robot real.
- Dependencia del hardware exacto: espera un Franka con cámaras `left_image`, `wrist` y `empty_camera_0` en resoluciones concretas (360×640 y 224×224); cualquier cambio de cámara o calibración puede degradar el comportamiento.
- Dataset pequeño y local: 100 episodios y 51.699 frames de una sola tarea, sin diversidad de posiciones, iluminación o distractores documentada.
- Riesgo de sobreajuste y de fallo silencioso: al ser imitación pura, puede reproducir sesgos de las demostraciones y fallar sin señal de error explícita.
- Idiomas: no se documentan capacidades multilingües; el prompt de tarea está en inglés.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `lerobot/pi05_base` y de los datos de origen, no detallada aquí.
- Sin datos de cuantización ni de latencia: no se puede planificar un despliegue en tiempo real sin pruebas propias.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/droid-put-marker-pen-pi0.5
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/local/droid-put-marker-pen-left-wrist
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/droid-put-marker-pen-left-wrist
