# jhd0313/act_move-box_chunk100

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones ("action chunks") en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad de las políticas entrenadas con datos de teleoperación. Este repositorio concreto, `jhd0313/act_move-box_chunk100`, es una política ACT entrenada con LeRobot sobre un robot de tipo `so_follower` para la tarea "Move the box", usando dos cámaras (vista cenital y muñeca) y un estado de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Es un artefacto de robótica de nicho, no un modelo de lenguaje: consume observaciones visuales de 480x640 píxeles y un vector de estado de 6 valores, y produce acciones de 6 dimensiones. Su relevancia es práctica para quien quiera reproducir o adaptar un pipeline de imitación con LeRobot sobre hardware SO-100/SO-101.

La ficha se basa únicamente en la model card y los metadatos del repositorio. No hay resultados de evaluación publicados ni datos de benchmarks, por lo que muchas especificaciones habituales en modelos de lenguaje no aplican o se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena fija "Move the box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `overhead`, `wrist` (3, 480, 640) |
| Estado de entrada | `observation.state` (6,) |
| Salida | `action` (6,) |
| Pasos de entrenamiento | 5000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.0 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT combina un backbone de visión (codificador de imágenes por cámara) con un transformer que modela la secuencia de observaciones y genera un chunk de acciones futuras. La innovación central del método, descrita en el paper arXiv:2304.13705, es predecir varios pasos de acción de golpe y agregarlos temporalmente, lo que mitiga el problema de compounding errors típico de las políticas paso a paso. El modelo recibe dos flujos visuales (`overhead` y `wrist`) de 480x640 y un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `jhd0313/move-box_20261008_100955`, compuesto por 50 episodios, 10.668 frames a 30 FPS y una única tarea ("Move the box"). La configuración reportada es de 5.000 pasos, batch size 8, AdamW con learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá de los episodios, ni uso de RLHF/DPO (no aplica en imitación supervisada), ni técnicas adicionales como decodificación especulativa.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente una vista cenital (`overhead`) y una vista de muñeca (`wrist`) a 480x640 y 30 FPS.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados, lo que aporta suavidad y robustez temporal.
- Ejecución de una tarea concreta: "Move the box", definida en el dataset de entrenamiento.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de la tarea "Move the box" en un robot SO-100/SO-101: usar `lerobot-rollout` con `--policy.path=jhd0313/act_move-box_chunk100` y la tarea "Move the box" para ejecutar la política en hardware compatible.
- Base para fine-tuning en una tarea de manipulación similar: reentrenar con `lerobot-train` sobre un dataset propio de empuje o traslado de objetos, partiendo de esta política como inicialización.
- Validación de pipelines de imitación: servir como referencia para comprobar la instalación de LeRobot, la calibración de cámaras y el cableado del robot antes de entrenar políticas propias.
- Docencia y experimentación en robótica: ejemplo mínimo (51,7 M de parámetros, 0,2 GB) para estudiar el flujo completo de teleoperación, grabación de dataset y entrenamiento ACT.
- Pruebas de robustez visual: evaluar cómo se comporta la política ante cambios de iluminación, posiciones del objeto o distracciones, dado que la model card invita a reportar estas condiciones.
- Integración en un banco de pruebas de políticas: comparar ACT con otros métodos de LeRobot (p. ej. Diffusion Policy) sobre la misma tarea y dataset para medir tasas de éxito relativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (0,2 GB de repositorio), la inferencia en FP32 requiere del orden de 0,2-0,3 GB solo para pesos, más activaciones de los dos flujos visuales de 480x640.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos unos pocos GB de VRAM debería poder ejecutar la política; una RTX 3060 o superior es un punto de partida razonable.
- ¿Cabe en GPU de consumo? Sí, por tamaño de parámetros; la model card no impone requisitos de GPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con `--policy.device=cuda` para entrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política está pensada para ejecutarse a 30 FPS, la frecuencia del dataset de entrenamiento, pero no se reportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jhd0313/act_move-box_chunk100` | 51,7 M | 2 cámaras 480x640 + estado (6,) | "Move the box" en `so_follower` | Apache 2.0 | Hugging Face |
| ACT (paper original, arXiv:2304.13705) | no disponible en la información | no disponible | Manipulación genérica por imitación | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy) | no disponible | no disponible | Tareas de manipulación | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que el rendimiento es desconocido.
- Especialización extrema: entrenada para una única tarea ("Move the box") sobre un robot `so_follower` con dos cámaras concretas; no generaliza a otras tareas, robots ni configuraciones de cámara sin reentrenamiento.
- Dependencia del hardware: los nombres e índices de cámara y el puerto del robot deben coincidir con los usados en el entrenamiento; la model card advierte que las cámaras deben coincidir con las claves de observación.
- Dataset pequeño: 50 episodios y 10.668 frames son una base limitada, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y objetos del entorno de grabación.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones (posiciones, colores, condiciones de luz) y no se han analizado.
- Alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones fuera de distribución ante observaciones no vistas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin datos de idiomas ni de cuantización: no es un modelo de lenguaje y no se publican variantes cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhd0313/act_move-box_chunk100
- Dataset de entrenamiento: https://huggingface.co/datasets/jhd0313/move-box_20261008_100955
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jhd0313/move-box_20261008_100955
