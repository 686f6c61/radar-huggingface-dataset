# eVorob/so101_bed_clear

## Resumen

`eVorob/so101_bed_clear` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. El modelo lo desarrolla el usuario eVorob y se ha entrenado y publicado en Hugging Face usando LeRobot, la biblioteca de aprendizaje automático para robótica real de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular y una imagen de muñeca) a comandos de acción de un brazo robótico.

La tarea concreta para la que se ha entrenado es "Remove the print from the bed and drop it in the bin": retirar una lámina impresa de una cama y depositarla en una papelera. El robot objetivo es un `so_follower` (la variante seguidora del brazo SO-101) con una única cámara montada en la muñeca. La política consume un vector de estado de 6 dimensiones y una imagen RGB de 480×640, y produce un vector de acción de 6 dimensiones.

Su relevancia es la de un artefacto de referencia para quien quiera reproducir un flujo completo de aprendizaje por imitación en robótica de bajo coste: incluye el dataset de entrenamiento (38 episodios, 20.033 fotogramas a 30 FPS), la configuración exacta de entrenamiento y los comandos de LeRobot para ejecutarlo. No obstante, es un modelo muy especializado, sin resultados de evaluación publicados, sin licencia declarada y con cero descargas, por lo que debe tratarse como una prueba de concepto más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica en inglés) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice fragmentos cortos de acciones (action chunks). La arquitectura combina un codificador de imágenes (procesa la observación visual de la muñeca, 3×480×640) con un transformer que fusiona la observación de estado (6 dimensiones) y genera la secuencia de acciones (6 dimensiones por paso). El chunking mitiga el problema de la varianza temporal en datos de teleoperación y suele producir tasas de éxito altas con relativamente pocos datos.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `eVorob/so101_bed_clear_20261106_192231`: 38 episodios, 20.033 fotogramas a 30 FPS, una cámara, resolución 640×480. La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de refinamiento posterior; se trata de aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visomotor de un brazo robótico SO-101 (`so_follower`) a partir de una imagen de muñeca y el estado articular.
- Ejecución de una tarea manipulativa concreta de pick-and-place: retirar una lámina de una cama y depositarla en una papelera.
- Predicción de fragmentos de acción (action chunking) para suavizar la ejecución y reducir el error acumulado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere definición manual de recompensas.
- Integración con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de "thinking": no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline completo de aprendizaje por imitación: sirve como ejemplo de referencia para validar la instalación de LeRobot, la calibración del SO-101 y el flujo de grabación, entrenamiento y despliegue con ACT.
- Automatización de una tarea doméstica acotada: recogida de objetos de una superficie blanda (cama) y depósito en un contenedor, útil como banco de pruebas de manipulación en entornos no estructurados.
- Investigación en robótica de bajo coste: el SO-101 es un brazo económico y este modelo permite experimentar con políticas visomotoras sin grandes presupuestos de cómputo ni de hardware.
- Base para fine-tuning con nuevos datasets: al estar entrenado con LeRobot 0.7.0 y pesos en safetensors, puede servir de inicialización para tareas similares de pick-and-place con el mismo robot y cámara.
- Docencia y formación: permite ilustrar de forma práctica las diferencias entre aprendizaje por imitación y aprendizaje por refuerzo, y el papel del action chunking.
- Evaluación comparativa de métodos de imitación: útil como línea base ACT frente a otros métodos (por ejemplo, políticas de RL real como las de Evo-RL) sobre el mismo robot y tipo de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors, el modelo ocupa del orden de 0,2 GB en el repositorio, por lo que la inferencia es viable en GPUs de gama baja e incluso en CPU para este tamaño.
- GPU recomendadas: no disponible en la documentación; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente. El cuello de botella real es la captura de cámara a 30 FPS y el bucle de control del robot.
- ¿Cabe en GPU de consumo? Sí, por el reducido número de parámetros (51,7 M); no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=eVorob/so101_bed_clear`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La model card fija la frecuencia de operación en 30 FPS para la captura de datos, pero no reporta latencia de inferencia ni throughput medido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de políticas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, se pueden citar alternativas del mismo ecosistema:

| Modelo | Tipo | Robot | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eVorob/so101_bed_clear | ACT (LeRobot) | SO-101 (`so_follower`) | Retirar lámina de la cama y depositarla en papelera | no disponible | Hugging Face |
| Políticas ACT de LeRobot (genéricas) | ACT | SO-100/SO-101 | Múltiples tareas de manipulación | según repositorio | Hugging Face / LeRobot |
| Evo-RL (MINT-SJTU) | RL real (offline) | SO101 y AgileX PiPER/PiPER-X | Tareas de manipulación real | no disponible en la búsqueda | GitHub |

No se han encontrado en la búsqueda web resultados de benchmarks que permitan comparar parámetros, contexto o rendimiento con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con 38 episodios de un único operador y entorno, la política hereda los sesgos de esas demostraciones (posiciones, iluminación, objetos concretos).
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento; no hay evaluación publicada que lo cuantifique.
- Limitaciones de contexto e idioma: no es un modelo de lenguaje; la tarea se especifica en inglés ("Remove the print from the bed and drop it in the bin") y no se documenta soporte multilingüe.
- Restricciones de licencia: la licencia no está declarada ("More Information Needed"), lo que impide confirmar si el uso comercial está permitido. Es un caveat importante para producción.
- Especialización extrema: solo se ha entrenado para una tarea, un robot y una cámara de muñeca; no es reutilizable directamente en otras tareas sin reentrenamiento o fine-tuning.
- Sin evaluación: no hay tasas de éxito ni protocolo de evaluación, por lo que no se puede afirmar su fiabilidad en robot real.
- Madurez: cero descargas y cero "likes" en el momento de la consulta; repositorio pequeño (0,2 GB) y creado en 2026, sin historial de mantenimiento.
- Dependencia del hardware: requiere un SO-101 calibrado, una cámara con el nombre de observación `observation.images.wrist` y los índices de cámara correctos; un desajuste en estos parámetros invalida la ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eVorob/so101_bed_clear
- Dataset de entrenamiento: https://huggingface.co/datasets/eVorob/so101_bed_clear_20261106_192231
- Dataset relacionado (variante): https://huggingface.co/datasets/eVorob/so101_bed_clear_20261106_191631
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eVorob/so101_bed_clear_20261106_192231
- Evo-RL (proyecto de RL real sobre SO101): https://github.com/MINT-SJTU/Evo-RL
