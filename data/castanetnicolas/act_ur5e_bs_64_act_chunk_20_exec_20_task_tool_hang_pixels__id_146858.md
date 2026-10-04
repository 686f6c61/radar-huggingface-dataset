# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_tool_hang_PIXELS__ID_146858

## Resumen

El modelo `castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_tool_hang_PIXELS__ID_146858` es una política de imitación (imitation learning) para control robótico, entrenada con la librería LeRobot de Hugging Face y publicada por el usuario castanetnicolas. Implementa el método ACT (Action Chunking with Transformers), descrito en el paper arXiv 2304.13705, que en lugar de predecir una única acción por paso predice fragmentos (chunks) de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El checkpoint contiene 51.590.791 parámetros (aproximadamente 51,6 millones) y ocupa unos 0,2 GB en el repositorio.

La política está especializada en una única tarea concreta de robomimic: "Insert the hook into the base to build a frame, then hang the wrench on the hook" (tool hang). Se entrenó sobre un dataset propio de 200 episodios y 95.962 frames a 20 FPS, con dos cámaras de entrada (`sideview` y `robot0_eye_in_hand`) a resolución 256x256, un vector de estado de 9 dimensiones y una salida de acción de 7 dimensiones. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un controlador visual-motor de dominio muy estrecho.

Su relevancia es limitada y muy específica: sirve como ejemplo reproducible de un pipeline de imitación end-to-end en LeRobot, y como punto de partida para reproducir o comparar experimentos en la tarea tool hang. Con cero descargas y cero likes en el momento de la consulta, y sin resultados de evaluación publicados, debe tratarse como un artefacto de investigación experimental, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con componente CVAE segun el paper arXiv 2304.13705 |
| Parametros totales | 51.590.791 (51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el nombre del checkpoint sugiere un horizonte de prediccion de 20 acciones y una ejecucion de 20, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de LeRobot) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (9,) |
| `observation.images.sideview` | VISUAL | (3, 256, 256) |
| `observation.images.robot0_eye_in_hand` | VISUAL | (3, 256, 256) |
| `action` | ACTION | (7,) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice chunks de acciones en lugar de pasos individuales. Esta formulación, presentada en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv 2304.13705), mitiga el problema de la acumulación de errores en políticas paso a paso y permite un control más suave y consistente en tareas de precisión. El modelo consume observaciones visuales de dos cámaras y un vector de estado proprioceptivo, y emite un vector de acción de 7 grados de libertad.

Los datos de entrenamiento provienen del dataset `castanetnicolas/robomimic_tool_hang_ph_image256`: 200 episodios, 95.962 frames a 20 FPS, correspondientes a la tarea de insertar un gancho en la base y colgar una llave inglesa. La configuración de entrenamiento reportada es de 120.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni técnicas de alineación posteriores, algo coherente con el ámbito de la robótica por imitación.

Existe una inconsistencia relevante entre el nombre del repositorio, que menciona `UR5e`, y la model card, que declara `Robot type: panda` y cámaras `sideview` y `robot0_eye_in_hand`. Cualquier despliegue real debe resolverse a partir de la model card y de las claves de observación, no del nombre del checkpoint.

## Capacidades

- Generación de acciones de control robótico de 7 dimensiones a partir de observaciones visuales y proprioceptivas.
- Predicción de chunks de acciones (action chunking), orientada a reducir la acumulación de errores frente a políticas paso a paso.
- Procesamiento de entrada visual multi-cámara: vista lateral (`sideview`) y vista de muñeca (`robot0_eye_in_hand`), ambas a 256x256.
- Ejecución de una tarea específica de manipulación: insertar un gancho y colgar una llave inglesa.
- Integración nativa con el ecosistema LeRobot para rollout y reentrenamiento mediante `lerobot-rollout` y `lerobot-train`.
- Soporte de tool calling / function calling: no aplica. Es una política robótica, no un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): visión como entrada, sin modo de razonamiento explícito ni audio.

## Casos de uso

- Reproducción de experimentos en robomimic: el modelo permite replicar la tarea tool hang y comparar la configuración ACT con otras políticas bajo las mismas condiciones de dataset y hardware.
- Base para fine-tuning en tareas de inserción: al compartir arquitectura y formato con LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio y adaptar los pesos a una tarea de ensamblaje similar.
- Banco de pruebas de pipelines de imitación: sirve para validar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout y evaluación) antes de invertir en datasets mayores.
- Evaluación de robustez visual: al depender de dos cámaras a 256x256, permite estudiar la sensibilidad a iluminación, oclusiones y cambios de posición de cámara en un entorno controlado.
- Investigación sobre action chunking: el checkpoint permite medir empíricamente el efecto del tamaño de chunk y del horizonte de ejecución en la tasa de éxito de una tarea de precisión.
- Docencia y formación en robótica: es un ejemplo autocontenido de 51,6 M de parámetros que se puede ejecutar en hardware modesto para demostrar aprendizaje por imitación sin necesidad de grandes recursos.
- Punto de partida para comparativas de hardware: su tamaño reducido permite medir latencia de inferencia en distintas GPUs y CPUs, útil para dimensionar sistemas de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se debe asumir ninguna tasa de éxito para la tarea tool hang.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB en FP32 y 0,10 GB en FP16/BF16 solo para los pesos, más la memoria de activaciones de los dos codificadores visuales a 256x256.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 son opciones muy holgadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4 GB o más, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout` con `--policy.path`), PyTorch con CUDA; no aplican vLLM, TGI ni llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas. Como referencia dimensional, un modelo de 51,6 M de parámetros con entradas de 3x256x256 por cámara suele permitir frecuencias de control por encima de los 20 FPS en GPUs modernas, pero esto es una estimación no verificada para este checkpoint concreto.
- Requisitos de robot y sensores: robot tipo `panda` según la model card, dos cámaras con las claves de observación `sideview` y `robot0_eye_in_hand`, y las dimensiones de estado y acción indicadas en la tabla de especificaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51,6 M | Chunk de 20 acciones segun nombre del repositorio (no confirmado) | Sin evaluation results publicados | apache-2.0 | Hugging Face, 0 descargas |
| ACT original (paper arXiv 2304.13705) | no disponible | Prediccion por chunks | Resultados reportados en el paper para tareas bimanuales | no disponible | Paper y repositorio de referencia |
| Diffusion Policy | no disponible | Prediccion por chunks mediante difusion | Resultados reportados en su propio paper | no disponible | Implementacion disponible en LeRobot |
| VQ-BeT | no disponible | Prediccion por chunks discretizados | Resultados reportados en su propio paper | no disponible | Implementacion disponible en LeRobot |

Los datos cuantitativos de los modelos alternativos no estan disponibles en la informacion proporcionada; la comparativa se limita por tanto a la categoria metodologica (politicas de imitacion con prediccion por chunks).

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, y en este dominio el concepto se traduce en sesgo hacia las condiciones de recogida de datos (posiciones de objeto, iluminación, configuración de cámara).
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero existe riesgo de generalización incorrecta fuera de la distribución del dataset de entrenamiento, con acciones erráticas en escenarios no vistos.
- Limitación de dominio: la política está entrenada para una única tarea (tool hang) sobre 200 episodios. No debe esperarse transferencia a otras tareas sin fine-tuning.
- Ambigüedad de robot: el nombre del repositorio menciona `UR5e` mientras que la model card declara `panda`. Es un riesgo operativo real para el despliegue.
- Limitación de contexto: no aplica una ventana de contexto de lenguaje. El horizonte de predicción y ejecución debe confirmarse en la configuración de LeRobot, ya que solo se infiere del nombre del checkpoint.
- Ausencia de evaluación: sin tasas de éxito publicadas, no hay evidencia cuantitativa de que la política funcione de forma fiable.
- Licencia: apache-2.0 permite uso comercial y modificación, pero el usuario asume toda la responsabilidad sobre el comportamiento del sistema robótico resultante.
- Producción: con cero descargas y cero likes, el checkpoint no tiene validación por parte de la comunidad. No es recomendable usarlo en entornos de producción sin una evaluación propia exhaustiva.
- Datos de fecha: la fecha de creación reportada (2026-10-03) es posterior a la fecha de la consulta según los metadatos, lo que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_tool_hang_PIXELS__ID_146858
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo ni sobre ACT o LeRobot; los enlaces devueltos corresponden a directorios de salones de masaje y no guardan relacion con el objeto de esta ficha.
