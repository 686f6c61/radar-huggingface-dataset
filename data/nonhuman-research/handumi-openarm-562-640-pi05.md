# NONHUMAN-RESEARCH/handumi-openarm-562-640-pi05

## Resumen

handumi-openarm-562-640-pi05 es un fine-tuning del modelo Vision-Language-Action (VLA) π₀.₅ (Pi05) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face y entrenado por NONHUMAN-RESEARCH para una tarea concreta de manipulación robótica: doblar una toalla amarilla con un brazo robótico OpenArm v1. El modelo parte del checkpoint base `lerobot/pi05_base` y se ha especializado mediante aprendizaje por imitación sobre un dataset de 562 episodios y 200.835 fotogramas grabados a 30 FPS con tres cámaras (izquierda, derecha y superior).

Se trata de una política de robótica de tipo VLA que consume el estado del robot (vector de 16 dimensiones) junto con tres flujos de imagen y produce un vector de acción de 16 dimensiones. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB en formato safetensors, el modelo está pensado para ejecutarse en el robot real mediante el comando `lerobot-rollout`, no para inferencia de texto genérica.

Su relevancia es doble: por un lado, demuestra el flujo completo de fine-tuning de π₀.₅ dentro del ecosistema LeRobot para una tarea de manipulación concreta; por otro, sirve como ejemplo reproducible de adaptación de un modelo VLA de propósito general a un entorno físico específico con licencia Apache 2.0, lo que facilita su reutilización y estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea se proporcionan como texto, p. ej. "Fold the yellow towel") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | openarmv1 |
| Cámaras de entrada | left, right, top |
| Entrada de estado | observation.state, shape (16,) |
| Entrada visual | left (3, 480, 640), right (3, 480, 640), top (3, 376, 672) |
| Salida | action, shape (16,) |
| Dataset de entrenamiento | murobotics/handumi-towel-openarm-562-640 |
| Episodios / fotogramas | 562 episodios / 200.835 fotogramas a 30 FPS |
| Pasos de entrenamiento | 2.812 |
| Batch size | 96 |
| Optimizador | AdamW |
| Learning rate | 4e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence diseñado para generalización en entornos abiertos. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La política combina un codificador visual que procesa tres cámaras con un modelo de lenguaje/visión que condiciona la generación de acciones sobre el estado proprioceptivo del robot (vector de 16 dimensiones) y la instrucción de tarea en lenguaje natural. La salida es un vector de acción continuo de 16 dimensiones que controla el brazo OpenArm v1.

El entrenamiento se realizó por aprendizaje por imitación (behavior cloning) sobre el dataset `murobotics/handumi-towel-openarm-562-640`, compuesto por 562 episodios y 200.835 fotogramas a 30 FPS de la tarea "Fold the yellow towel". Se ejecutaron 2.812 pasos con batch size de 96, optimizador AdamW y learning rate 4e-05, partiendo del checkpoint `lerobot/pi05_base`. No se dispone de información sobre la composición detallada del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de π₀.₅.

## Capacidades

- Control robótico de manipulación: genera acciones continuas de 16 dimensiones para un brazo OpenArm v1 a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa simultáneamente tres flujos de imagen (izquierda, derecha y superior) con resoluciones de 480x640 y 376x672.
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción textual de la tarea (por ejemplo, "Fold the yellow towel") que guía la política.
- Fusión de estado proprioceptivo y visión: integra un vector de estado de 16 dimensiones con las imágenes para producir la acción.
- Ejecución en robot real mediante `lerobot-rollout` con la estrategia base.
- Fine-tuning reproducible: puede reentrenarse sobre nuevos datasets siguiendo el flujo de `lerobot-train` partiendo de `lerobot/pi05_base`.
- No se ha documentado soporte de tool calling, agentes multi-paso, capacidades multilingües generales ni modos de razonamiento explícito (thinking mode).

## Casos de uso

- Doblado automatizado de toallas en entornos de laboratorio: el modelo ejecuta directamente la tarea "Fold the yellow towel" sobre un OpenArm v1 con tres cámaras, sirviendo como base para experimentos de manipulación deformable.
- Investigación en aprendizaje por imitación: permite reproducir el pipeline completo de fine-tuning de π₀.₅ con LeRobot y comparar hiperparámetros (pasos, batch size, learning rate) sobre un dataset público de 562 episodios.
- Prototipado de políticas VLA en robótica de servicio: útil para validar la integración de un modelo VLA de 4,14 mil millones de parámetros en un brazo de bajo coste antes de escalar a tareas más complejas.
- Generación de datos sintéticos y aumentación: la política entrenada puede emplearse para generar trayectorias de referencia o para evaluar la robustez frente a cambios de iluminación y posiciones de objetos.
- Benchmark interno de manipulación deformable: al estar especializado en una tarea concreta, sirve como línea base para medir la mejora de nuevos fine-tunings sobre el mismo dataset.
- Docencia y formación en robótica: ejemplo reproducible de extremo a extremo (grabación de datos, entrenamiento y despliegue) con licencia Apache 2.0 y comandos documentados.
- Integración en pipelines de evaluación de LeRobot: permite probar la CLI `lerobot-rollout` y la visualización del dataset asociado en el Space oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,14 mil millones de parámetros en safetensors (fp32/bf16 según checkpoint), se requiere aproximadamente entre 8 y 16 GB de VRAM en función de la precisión y del overhead de las tres cámaras.
- GPU recomendadas: no disponible en la documentación; por tamaño, una GPU con al menos 16 GB (RTX 4090, A100 40 GB, H100) es un punto de partida razonable, aunque no está confirmado por el autor.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 16 GB o más, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NONHUMAN-RESEARCH/handumi-openarm-562-640-pi05 | 4.143.404.816 | no disponible | Doblado de toalla con OpenArm v1 | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA base de propósito general | no disponible en la información | Hugging Face |
| π₀.₅ original (Physical Intelligence) | no disponible | no disponible | VLA de generalización en entornos abiertos | no disponible en la información | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "Fold the yellow towel" con un robot OpenArm v1 y tres cámaras concretas; no se espera que generalice a otras tareas, objetos o configuraciones de cámara.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni métricas de robustez, por lo que su fiabilidad en producción es desconocida.
- Dependencia del hardware: requiere el robot `openarmv1`, los nombres de cámara exactos (`left`, `right`, `top`) y las resoluciones especificadas; cualquier desviación puede degradar el rendimiento.
- Riesgo de sobreajuste al dataset: con 562 episodios de una sola tarea, la variabilidad de posiciones, iluminación y distractores es limitada.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: al ser un modelo de robótica, estos conceptos no aplican de la misma forma, pero no se han documentado análisis al respecto.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del modelo base (`lerobot/pi05_base`) y del dataset asociado.
- Requisitos de calibración y seguridad física: como toda política robótica, su despliegue exige protocolos de seguridad y calibración del brazo y las cámaras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NONHUMAN-RESEARCH/handumi-openarm-562-640-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/murobotics/handumi-towel-openarm-562-640
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=murobotics/handumi-towel-openarm-562-640
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
