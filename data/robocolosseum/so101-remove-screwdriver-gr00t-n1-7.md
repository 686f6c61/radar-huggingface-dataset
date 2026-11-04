# RoboColosseum/so101-remove-screwdriver-gr00t-n1.7

## Resumen

Este repositorio contiene una política de robótica entrenada mediante imitación sobre el modelo fundacional GR00T N1.7 de NVIDIA, adaptada a una tarea concreta de manipulación con el robot SO-101: extraer un destornillador negro de una caja y depositarlo sobre la mesa. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, y se ha ajustado con 100 episodios de demostración (23.746 fotogramas a 30 FPS) recogidos con una configuración de dos cámaras (frontal y de muñeca).

La relevancia práctica es doble: por un lado, demuestra el flujo completo de LeRobot para llevar un modelo fundacional de robótica a una tarea específica con hardware de bajo coste (SO-101); por otro, sirve como referencia reproducible para quien quiera entrenar sus propias políticas con el mismo pipeline. El checkpoint tiene 3.144.016.000 parámetros y un tamaño de repositorio de 102,2 GB, lo que refleja el peso del backbone VLM subyacente.

Conviene subrayar que se trata de una política especializada, no de un modelo generalista: está entrenada para una única tarea, con un único robot y un único objeto, y no se han publicado resultados de evaluación en robot real. Su licencia Apache 2.0 permite uso comercial, pero su utilidad fuera del dominio entrenado es muy limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; instrucciones en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que codifica las observaciones visuales y la instrucción en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. La política consume `observation.state` de dimensión 6, dos imágenes RGB de 480x640 (`front` y `wrist`) y produce un vector de acción de dimensión 6, correspondiente a los grados de libertad del SO-101.

El ajuste se realizó sobre el dataset `Jiamo0912/robocolosseum-so101-black-screwdriver-box-to-table-100episodes` (100 episodios, 23.746 fotogramas, 30 FPS), con la tarea "Take the black screwdriver out of the box and place it on the table". La configuración de entrenamiento reportada es: 40.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni fases de refinamiento posteriores al ajuste por imitación.

## Capacidades

- Generación de acciones de manipulación de 6 dimensiones para el robot SO-101 (`so_follower`) a partir de observaciones multimodales.
- Condicionamiento por instrucción en lenguaje natural (task prompt) junto con dos vistas de cámara y el estado de las articulaciones.
- Ejecución de una tarea de pick-and-place concreta: extraer un destornillador negro de una caja y colocarlo sobre la mesa.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- Soporte de tool calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la instrucción de tarea está en inglés.
- Capacidades especiales (thinking mode, visión general, audio): no disponibles más allá del uso de visión como entrada para control motor.

## Casos de uso

- Automatización de una celda de pick-and-place con SO-101: la política se despliega con `lerobot-rollout` para ejecutar de forma repetida la extracción del destornillador de la caja y su depósito en la mesa, con las dos cámaras calibradas en las mismas posiciones que en el entrenamiento.
- Base para ajuste fino en tareas de manipulación similares: al estar construida sobre GR00T N1.7 y LeRobot, sirve como punto de partida para reentrenar con nuevos datasets manteniendo el mismo esquema de observaciones (estado de 6 dimensiones y dos cámaras 480x640).
- Validación de pipelines de imitación en hardware de bajo coste: útil para equipos que quieran comprobar de extremo a extremo el flujo de grabación, entrenamiento y despliegue con el SO-101 antes de invertir en robots más caros.
- Docencia y prototipado en robótica: ejemplo reproducible de cómo un modelo fundacional se especializa en una tarea concreta con solo 100 episodios, adecuado para prácticas de aprendizaje por imitación.
- Benchmark interno de infraestructura: permite medir latencia y throughput de inferencia de GR00T N1.7 en el hardware disponible antes de escalar a otras tareas.
- Generación de datos sintéticos o aumentados: las trayectorias producidas por la política pueden servir para comparar con las demostraciones humanas y detectar desviaciones en la ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144 millones de parámetros, una estimación en FP16 rondaría los 6,3 GB solo para pesos, pero el repositorio ocupa 102,2 GB, lo que sugiere que incluye el backbone completo y posiblemente checkpoints adicionales; no se confirma el desglose.
- GPU recomendadas: no disponible. El ejemplo de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de pruebas en RTX 4090 u otras consumer.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboColosseum/so101-remove-screwdriver-gr00t-n1.7 | 3.144.016.000 | no disponible | Pick-and-place SO-101 (destornillador) | Apache 2.0 | HuggingFace, 0 descargas |
| tsangb34/groot-n17-so101-black-screwdriver-box-to-table-40k | no disponible | no disponible | Misma tarea, referenciado en la model card | no disponible | HuggingFace |
| GR00T N1.7 (NVIDIA, base) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible | GitHub NVIDIA/Isaac-GR00T |

No se dispone de datos de rendimiento comparativo entre estas alternativas. La comparación se limita a parámetros, licencia y disponibilidad según la información proporcionada.

## Limitaciones y advertencias

- Política especializada en una única tarea, un único robot (SO-101) y un único objeto (destornillador negro); no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación en robot real: no se conoce la tasa de éxito ni la robustez ante cambios de posición, iluminación o distractores.
- Dependencia estricta de la configuración de cámaras: los nombres e índices deben coincidir con las claves de observación (`front`, `wrist`) y las resoluciones con las del entrenamiento (480x640, 30 FPS).
- Riesgo de sobreajuste al dataset de 100 episodios y a las condiciones concretas de grabación.
- Sesgos conocidos: no documentados, pero al ser un modelo entrenado por imitación hereda los sesgos de las demostraciones humanas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones fuera de distribución cuando el estado observado se aleja del dataset.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del backbone subyacente (Cosmos-Reason2/Qwen3-VL) y de los datos de entrenamiento.
- El repositorio ocupa 102,2 GB, lo que implica requisitos de almacenamiento y transferencia considerables.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/so101-remove-screwdriver-gr00t-n1.7
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/robocolosseum-so101-black-screwdriver-box-to-table-100episodes
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/robocolosseum-so101-black-screwdriver-box-to-table-100episodes
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Política relacionada: https://huggingface.co/tsangb34/groot-n17-so101-black-screwdriver-box-to-table-40k
