# nberezny/act_franka_pick_place_dart

## Resumen

`act_franka_pick_place_dart` es una política de imitación entrenada con el método Action Chunking with Transformers (ACT) sobre el simulador del robot Franka Panda. La publica el usuario `nberezny` en Hugging Face mediante la librería LeRobot de Hugging Face, y resuelve una tarea concreta de manipulación: coger un cubo rojo y depositarlo sobre una casilla azul. No es un modelo de lenguaje: es un modelo visomotor que mapea observaciones (dos cámaras y el estado del robot) a comandos de acción de 8 dimensiones.

El modelo tiene 51.590.792 parámetros (dato real de los pesos en safetensors) y un repositorio de 0,2 GB. Se entrenó con 100 episodios de teleoperación (15.959 fotogramas a 20 FPS) durante 100.000 pasos con AdamW y una tasa de aprendizaje de 1e-5. La relevancia es acotada: sirve como referencia reproducible de un pipeline completo de LeRobot (dataset, entrenamiento, rollout) para robótica simulada, no como componente de producción general.

La ficha es deliberadamente escasa en algunos apartados porque el autor no ha publicado licencia, idiomas, benchmarks ni resultados de evaluación. Todo dato no presente en la model card o en los resultados de búsqueda se marca como «no disponible».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.590.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena de texto en el rollout) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `franka_panda_sim` (Franka Panda en simulación) |
| Cámaras de entrada | `overhead`, `wrist` |
| Entrada visual | `observation.images.overhead` (3, 240, 320); `observation.images.wrist` (3, 240, 320) |
| Entrada de estado | `observation.state` (8,) |
| Salida | `action` (8,) |
| Dataset de entrenamiento | `nberezny/franka_pick_place_dart` (100 episodios, 15.959 fotogramas, 20 FPS) |
| Tarea | «Pick up the red cube and place it on the blue square.» |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, arXiv:2304.13705) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. La arquitectura combina un backbone visual que procesa las dos cámaras (`overhead` y `wrist`) con un transformer que, condicionado por el estado del robot (8 dimensiones) y la representación visual, genera una secuencia de acciones de 8 dimensiones. La predicción por trozos reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución en el robot.

El entrenamiento es puramente de imitación supervisada sobre 100 episodios teleoperados (15.959 fotogramas a 20 FPS) del dataset `nberezny/franka_pick_place_dart`, con 100.000 pasos, batch de 8, AdamW y lr 1e-5. No consta en la información disponible el uso de RLHF, DPO ni ningún refinamiento por refuerzo. Tampoco se documentan innovaciones adicionales más allá del propio *action chunking* del método ACT.

## Capacidades

- Generación de comandos de acción de 8 dimensiones para el Franka Panda en simulación a partir de observaciones visomotoras.
- Percepción visual mediante dos cámaras (`overhead` y `wrist`) con resolución de 240x320.
- Ejecución de una única tarea de manipulación: coger un cubo rojo y colocarlo sobre una casilla azul.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere definición explícita de recompensas.
- Predicción de *action chunks* que suaviza la trayectoria y reduce el error acumulado.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Reproducción de un pipeline completo de LeRobot**: sirve como ejemplo end-to-end de dataset, entrenamiento y rollout en simulación para quien quiera aprender el flujo de trabajo de imitación con ACT. Es adecuado porque el autor documenta todos los hiperparámetros y comandos.
- **Punto de partida para *fine-tuning* en tareas de pick-and-place**: se puede reentrenar con `lerobot-train` sobre un dataset propio con el mismo formato (`observation.images.overhead`, `observation.images.wrist`, `observation.state` de 8 dimensiones). Es útil porque la arquitectura y el pipeline ya están validados.
- **Evaluación de robustez visomotora en simulación**: permite medir la tasa de éxito bajo cambios de iluminación, posiciones de objetos o distractores en el simulador, comparando contra el rendimiento base. Adecuado por su bajo coste computacional (51,6 M de parámetros).
- **Docencia e investigación en aprendizaje por imitación**: sirve como caso de estudio de ACT con hiperparámetros concretos y un dataset pequeño (100 episodios), lo que facilita analizar el efecto del número de demostraciones y del *chunking*.
- **Prueba de integración de cámaras y calibración**: el comando de rollout documentado permite validar la configuración de dos cámaras OpenCV y el puerto del robot antes de entrenar políticas más costosas.
- **Generación de datos sintéticos de referencia**: el dataset asociado (`franka_pick_place_dart`) puede usarse para comparar variantes de ACT u otros métodos de imitación bajo las mismas condiciones.
- **Prototipado rápido en un equipo de robótica**: al ocupar 0,2 GB y 51,6 M de parámetros, se puede iterar en una estación de trabajo con una sola GPU consumer antes de escalar a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita: «No evaluation results have been provided for this policy yet». No se dispone de tasas de éxito, latencia ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Con 51,6 M de parámetros y pesos en safetensors, la inferencia en FP32 requiere del orden de 0,2 GB solo para pesos; el consumo real depende del backbone visual y del tamaño de lote, pero es muy inferior al de un modelo de lenguaje del mismo orden.
- **GPU recomendadas**: cualquier GPU con soporte CUDA es suficiente en la práctica; no se especifican modelos concretos en la información disponible. Una RTX 4090, A100 o H100 están sobradamente capacitadas.
- **GPU consumer**: sí cabe en GPU consumer (por ejemplo, RTX 3060 en adelante) por el reducido tamaño del modelo; no hay datos oficiales de consumo exacto.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles. Dependen del robot, de la frecuencia de control (el dataset se grabó a 20 FPS) y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `nberezny/act_franka_pick_place_dart` | 51,6 M | Pick-and-place de cubo rojo en Franka Panda simulado | no disponible | Hugging Face (LeRobot) |
| `nberezny/franka_pick_place_v2` (dataset) | no aplica (dataset) | Dataset de pick-and-place, 854 MB, licencia Apache-2.0 | Apache-2.0 | Hugging Face (Datasets) |
| Otras políticas ACT de LeRobot | no disponible | Tareas de manipulación diversas | variable | Hugging Face |

No se dispone de información suficiente para comparar numéricamente con alternativas como Diffusion Policy, VQ-BeT o π0, ya que no hay benchmarks publicados en la información proporcionada. La comparativa se limita a los artefactos del mismo autor encontrados en la búsqueda.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede asumir uso comercial; hay que contactar con el autor o consultar el repositorio antes de cualquier despliegue en producción.
- **Sin resultados de evaluación**: el autor no reporta tasa de éxito ni condiciones de prueba, por lo que no hay evidencia pública de que la política funcione fuera del dataset de entrenamiento.
- **Tarea única y altamente específica**: solo se entrenó para «coger el cubo rojo y colocarlo sobre la casilla azul»; no generaliza a otras tareas sin reentrenamiento.
- **Entorno simulado**: el tipo de robot es `franka_panda_sim`; no hay garantía de transferencia al Franka Panda físico (diferencias de dinámica, calibración de cámaras, latencias).
- **Dataset pequeño**: 100 episodios y 15.959 fotogramas son una base limitada; es probable sobreajuste a posiciones, iluminación y configuraciones concretas de cámara.
- **Riesgo de alucinación motora**: como toda política de imitación, puede producir acciones fuera de distribución ante objetos, posiciones o distracciones no vistas; no hay mecanismo de seguridad documentado.
- **Sesgos**: no documentados; al depender de demostraciones humanas, puede heredar sesgos de los operadores (velocidad, trayectorias, posiciones preferidas).
- **Dependencia de la versión de LeRobot**: entrenado con LeRobot 0.7.0; cambios de API en versiones posteriores pueden romper la reproducibilidad.
- **Idiomas y contexto**: no aplica, pero conviene subrayar que no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_franka_pick_place_dart
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_dart
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_dart
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset relacionado `franka_pick_place_v2`: https://huggingface.co/datasets/nberezny/franka_pick_place_v2/tree/main
- Modelos y simulación oficiales de Franka: https://franka.de/models-and-simulation
