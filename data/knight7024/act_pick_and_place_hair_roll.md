# knight7024/act_pick_and_place_hair_roll

## Resumen

`act_pick_and_place_hair_roll` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT) y distribuida a través de la librería LeRobot de Hugging Face. El autor, `knight7024`, la ha entrenado sobre un conjunto de datos propio de teleoperación de 60 episodios y 32.055 fotogramas para la tarea concreta de recoger y colocar un rulo de pelo ("pick_and_place_hair_roll"). No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular de 6 dimensiones y dos cámaras) a acciones de 6 dimensiones.

El modelo resuelve un problema acotado: generar comandos de actuación para un robot tipo `so_follower` (el seguidor del brazo SO-100/SO-101 de LeRobot) a partir de imágenes cenital y de muñeca. Su relevancia es práctica más que de investigación: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot, desde la grabación de datos hasta el despliegue con `lerobot-rollout`.

Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo pequeño que puede ejecutarse en GPU de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque la política está especializada en una única tarea y un único robot, por lo que su valor fuera de ese contexto es limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado por observaciones visuales y de estado que predice chunks de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal de observaciones definida por la configuración de ACT) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política consume `observation.state` de forma `(6,)`, una imagen cenital `(3, 240, 320)` y una imagen de muñeca `(3, 480, 640)`, y produce una acción de forma `(6,)`. El modelo tiene 51.668.614 parámetros, coherente con la escala típica de ACT en LeRobot.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `knight7024/pick_and_place_hair_roll`: 60 episodios, 32.055 fotogramas a 30 FPS, una única tarea. La configuración fue de 100.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; es aprendizaje supervisado puro a partir de demostraciones teleoperadas. Tampoco se especifican innovaciones adicionales más allá del propio mecanismo de action chunking del método ACT.

## Capacidades

- Generación de acciones de control de 6 dimensiones para un brazo robótico `so_follower` a partir de observaciones visuales y de estado.
- Percepción visomotora con dos cámaras simultáneas (cenital y de muñeca) para localizar y manipular objetos.
- Ejecución de la tarea específica de recoger y colocar un rulo de pelo.
- Predicción de chunks de acciones, lo que aporta suavidad y robustez frente al ruido en la inferencia.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`) y con el Hub de Hugging Face.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.
- No dispone de capacidades de audio ni de visión general fuera del pipeline de política robótica.

## Casos de uso

- Automatización de una celda de manipulación con brazo SO-100/SO-101: la política se despliega con `lerobot-rollout` sobre el robot `so_follower` y ejecuta la secuencia de recogida y colocación del rulo de pelo de forma autónoma durante el tiempo configurado.
- Prototipado rápido de pipelines de aprendizaje por imitación: sirve como referencia funcional para validar la instalación de LeRobot, la calibración de cámaras y el flujo de grabación-entrenamiento-despliegue antes de abordar tareas propias.
- Docencia y formación en robótica: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, es adecuado para prácticas donde el alumnado reproduce el entrenamiento con `lerobot-train` y compara resultados.
- Benchmark interno de infraestructura de inferencia robótica: permite medir latencia y throughput de un policy ACT en distintas GPU sin depender de modelos de gran tamaño.
- Base para fine-tuning en tareas similares de pick-and-place: el checkpoint puede reentrenarse sobre un dataset propio con objetos o posiciones distintas, aprovechando que LeRobot expone el comando de entrenamiento con `--policy.type=act`.
- Evaluación de robustez visomotora: al usar dos cámaras con resoluciones distintas (240x320 y 480x640), sirve para estudiar el impacto de la resolución y del punto de vista en el éxito de la política.
- Demostración de despliegue en robot real de bajo coste: el tamaño del repo (0,2 GB) y del modelo permiten ejecutarlo en estaciones de trabajo con GPU de consumo, sin necesidad de infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito documentada para la tarea `pick_and_place_hair_roll`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión completa (FP32) el modelo ocupa aproximadamente 0,2 GB, y en FP16 alrededor de 0,1 GB, a lo que hay que sumar el coste de los dos flujos de cámara y del preprocesado.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente por tamaño de modelo; para despliegue en robot real se prioriza baja latencia, por lo que se recomiendan GPUs de gama media o alta (RTX 3060 en adelante, RTX 4090, A100, H100) si se ejecutan varias políticas o se hace entrenamiento.
- Cabe en GPU de consumo: sí, con margen amplio, incluidas GPUs de gama de entrada con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware, de la resolución de las cámaras y de la frecuencia de control del robot (el dataset se grabó a 30 FPS).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `knight7024/act_pick_and_place_hair_roll` | ACT (LeRobot) | 51.668.614 | pick_and_place_hair_roll | apache-2.0 | Hugging Face Hub |
| Políticas ACT genéricas de LeRobot | ACT (LeRobot) | no disponible | múltiples tareas de manipulación | no disponible | Hugging Face Hub / docs de LeRobot |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | manipulación visomotora | no disponible | Hugging Face Hub / docs de LeRobot |
| Políticas π0 / π0.5 (Physical Intelligence) | VLA | no disponible en la información | manipulación generalista | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado métricas de éxito ni latencias para esta política, y los modelos comparables citados no aportan cifras en la información manejada. La diferencia principal frente a políticas generalistas es el alcance: esta está entrenada para una única tarea y un único tipo de robot, mientras que los modelos VLA buscan generalización entre tareas.

## Limitaciones y advertencias

- Especialización extrema: entrenada exclusivamente para la tarea `pick_and_place_hair_roll` con un robot `so_follower`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni protocolo de evaluación en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset pequeño: 60 episodios y 32.055 fotogramas son una base limitada; es probable que la política sea sensible a cambios de iluminación, posición de objetos, fondo o calibración de cámaras.
- Dependencia de hardware concreto: requiere las cámaras `top` y `wrist` con las resoluciones y nombres de observación exactos del entrenamiento; cualquier desviación en la configuración rompe la inferencia.
- Riesgo de sobreajuste al entorno de grabación: no se documentan variaciones de posiciones, distractorers ni condiciones de iluminación en el dataset.
- Sesgos: no se documentan sesgos específicos, pero al ser una política entrenada con demostraciones humanas hereda los sesgos de las trayectorias teleoperadas (velocidad, precisión, estilo de manipulación).
- Alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial y modificación; no obstante, el uso en un robot real implica riesgos físicos que la licencia no cubre y que deben gestionarse con paradas de emergencia y límites de par.
- Idiomas: no aplica; el modelo no procesa texto.
- Fecha de creación en el Hub (2026-10-26) y bajo número de descargas (32) sugieren un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knight7024/act_pick_and_place_hair_roll
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_hair_roll
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_hair_roll
