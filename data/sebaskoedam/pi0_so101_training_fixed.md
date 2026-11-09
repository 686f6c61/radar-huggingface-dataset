# SebasKoedam/pi0_so101_training_fixed

## Resumen

`SebasKoedam/pi0_so101_training_fixed` es un ajuste fino del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, publicado por el usuario SebasKoedam a través de la librería LeRobot de Hugging Face. Se trata de una política generalista de tipo Vision-Language-Action (VLA) que recibe observaciones visuales e instrucciones en lenguaje natural y emite comandos de acción de bajo nivel para un brazo robótico. El modelo base, `lerobot/pi0_base`, es la implementación de referencia que LeRobot mantiene del repositorio OpenPI de Physical Intelligence.

Este ajuste concreto está especializado en una única tarea de manipulación sobre el robot `so_follower` (SO-101): recoger un cubo rojo y depositarlo en una caja gris. El modelo consume dos cámaras (superior y de muñeca) a resolución 240×320 y un vector de estado de 6 dimensiones, y produce un vector de acción también de 6 dimensiones. Cuenta con aproximadamente 4.028 millones de parámetros y un repositorio de 8,9 GB en formato safetensors.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo canónico del flujo de trabajo de imitación con LeRobot sobre hardware asequible (SO-101); por otro, sirve como referencia de las limitaciones de un ajuste fino con un conjunto de datos muy reducido (21 episodios, 8441 fotogramas), lo que condiciona fuertemente su capacidad de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (Physical Intelligence), implementación LeRobot/OpenPI |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se proporcionan en lenguaje natural, pero no se documenta cobertura multilingüe) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi0_base |
| Tipo de robot | so_follower (SO-101) |
| Cámaras de entrada | top, wrist (3×240×320 cada una) |
| Dimensión de estado | (6,) |
| Dimensión de acción | (6,) |
| Tamaño del repositorio | 8,9 GB |
| Librería | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de π₀, una política VLA que combina un codificador visual, un modelo de lenguaje preentrenado y un cabezal de acciones que genera secuencias de comandos motores. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El ajuste fino se realizó sobre `lerobot/pi0_base` con el conjunto de datos `SebasKoedam/so101_training_fixed`, compuesto por 21 episodios y 8441 fotogramas grabados a 30 FPS, todos ellos correspondientes a la tarea "Pick up the red cube and place it in the grey box".

La configuración de entrenamiento documentada es: 12.672 pasos, tamaño de lote 1, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot versión 0.6.2. No se especifica el número total de tokens de entrenamiento ni la composición del dataset más allá de la tarea única. Tampoco se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste por imitación. La innovación técnica relevante es la propia formulación VLA de π₀, que unifica percepción, lenguaje y control en un único modelo entrenable de extremo a extremo.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el brazo SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (superior y de muñeca) a 240×320 píxeles.
- Interpretación de instrucciones en lenguaje natural: recibe una descripción textual de la tarea (por ejemplo, "Pick up the red cube and place it in the grey box").
- Ejecución de políticas de imitación: reproduce comportamientos aprendidos a partir de demostraciones teleoperadas.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes autónomos ni capacidades de audio.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la tarea concreta de recoger un cubo rojo y colocarlo en una caja gris sobre el robot SO-101, siendo adecuado para validar pipelines de imitación en entornos controlados.
- Prototipado de políticas VLA con LeRobot: sirve como punto de partida para desarrolladores que quieran entender el flujo completo de entrenamiento y despliegue de π₀ sobre hardware asequible.
- Docencia e investigación en robótica de imitación: permite reproducir un experimento completo con 21 episodios y 8441 fotogramas, útil para cursos y talleres sobre aprendizaje por demostración.
- Benchmark de referencia para ajustes finos: al estar basado en `lerobot/pi0_base`, permite comparar el efecto de distintos datasets y configuraciones de entrenamiento sobre la misma arquitectura.
- Automatización de tareas repetitivas de laboratorio: en un entorno con posiciones y condiciones de iluminación similares a las del dataset, puede ejecutar la secuencia de recogida y depósito de forma autónoma durante sesiones de hasta 60 segundos (`--duration=60`).
- Base para experimentos de generalización: al ser un ajuste con datos muy limitados, es útil para estudiar cómo varía el rendimiento al cambiar posiciones de objetos, iluminación o presencia de distractores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.028 millones de parámetros en safetensors, una estimación orientativa en FP16 rondaría los 8 GB, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. La configuración de entrenamiento usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del repositorio (8,9 GB) sugiere que podría caber en GPUs con 12-16 GB de VRAM en precisión reducida, pero no se documenta.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se documenta la frecuencia de inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SebasKoedam/pi0_so101_training_fixed | 4.028 M | no disponible | Pick-and-place SO-101 | gemma | Hugging Face (0 descargas) |
| lerobot/pi0_base | no disponible | no disponible | Política VLA generalista | no disponible | Hugging Face (modelo base) |
| π₀ original (Physical Intelligence) | no disponible | no disponible | Política VLA generalista multi-robot | no disponible | Blog y OpenPI |
| Otros ajustes LeRobot sobre SO-101 | variable | no disponible | Tareas específicas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 21 episodios y 8441 fotogramas para una única tarea, lo que limita severamente la generalización a nuevas posiciones, objetos o condiciones de iluminación.
- Especialización estrecha: el modelo está entrenado exclusivamente para "Pick up the red cube and place it in the grey box" sobre el robot `so_follower`; no se espera que funcione en otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay métricas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`top`, `wrist`), lo que añade fragilidad al despliegue.
- Licencia `gemma`: impone restricciones de uso comercial que deben revisarse antes de cualquier aplicación productiva; no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones fuera de distribución ante entradas visuales no vistas durante el entrenamiento.
- Idiomas no documentados: aunque acepta instrucciones en lenguaje natural, no se especifica qué lenguas ni qué grado de robustez lingüística.
- Sin soporte documentado de cuantización: no se indican formatos GGUF, AWQ ni GPTQ, lo que dificulta el despliegue en hardware de bajos recursos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SebasKoedam/pi0_so101_training_fixed
- Dataset de entrenamiento: https://huggingface.co/datasets/SebasKoedam/so101_training_fixed
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: no disponible en la información proporcionada
- Guía de LeRobot para π₀: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebasKoedam/so101_training_fixed
