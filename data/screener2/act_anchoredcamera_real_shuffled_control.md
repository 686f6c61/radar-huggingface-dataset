# Screener2/act_AnchoredCamera_real_shuffled_control

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, y que se distribuye como política de robótica entrenada con LeRobot. Este repositorio concreto, `Screener2/act_AnchoredCamera_real_shuffled_control`, contiene una política ACT entrenada para el robot `so_follower` (SO-100/SO-101 de LeRobot) con una única cámara cenital (`overhead`) y una tarea muy específica: trasladar un cilindro verde a un cubo amarillo.

El modelo no es un LLM ni un modelo multimodal de propósito general: es un actor de control visuomotor que consume el estado articular del robot (vector de 6 dimensiones) y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, está pensado para ejecutarse en el propio robot o en un equipo con GPU modesta, con pesos en formato safetensors.

Su relevancia es acotada pero práctica: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot, como política base para experimentos de recolección de datos con cámara anclada y como referencia para comparar variantes de ACT en tareas de manipulación simples. La licencia Apache 2.0 facilita su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; observa un frame y estado por paso, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no procesa texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

Otros datos técnicos: tipo de robot `so_follower`; cámara `overhead`; entrada `observation.state` con forma `(6,)`; entrada `observation.images.overhead` con forma `(3, 480, 640)`; salida `action` con forma `(6,)`; dataset de entrenamiento con 15 episodios, 6.738 frames a 30 FPS; tarea "Green cylinder to yellow bucket"; 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000, LeRobot 0.5.2.

## Arquitectura y entrenamiento

ACT combina un codificador visual (procesa la imagen cenital de 480x640) con un transformer que, condicionado por el estado del robot y la representación visual, predice un *chunk* de acciones futuras en lugar de una sola acción por paso. Esta predicción por bloques reduce el error de acumulación típico del comportamiento temporal y suaviza las trayectorias, algo especialmente útil en manipulación con robots de bajo coste donde el ruido de teleoperación es alto. El modelo sigue el esquema estándar de LeRobot para ACT, sin variantes documentadas por el autor.

El entrenamiento es de imitación supervisada sobre 15 episodios teleoperados (6.738 frames a 30 FPS) de una única tarea. No se documenta uso de RLHF, DPO ni fine-tuning por refuerzo; tampoco se detalla la composición del dataset más allá del número de episodios y la tarea. La configuración reportada (100.000 pasos, batch 8, AdamW, lr 1e-05) es la habitual en recetas de ACT de LeRobot para datasets pequeños. El nombre del repositorio sugiere un experimento de control con cámara anclada y datos barajados (*shuffled*), pero la model card no explica en qué consiste esa variante ni sus diferencias respecto a un ACT estándar.

## Capacidades

- Control visuomotor de manipulación: genera comandos de 6 dimensiones para el robot `so_follower` a partir de una imagen cenital y el estado articular.
- Predicción de chunks de acción: emite secuencias cortas de acciones, lo que mejora la estabilidad temporal frente a políticas paso a paso.
- Aprendizaje por imitación de una tarea concreta: "Green cylinder to yellow bucket".
- Ejecución en tiempo real a 30 FPS, coherente con la frecuencia de captura del dataset de entrenamiento.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout` y visualización del dataset desde el Hub.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni procesamiento de lenguaje natural.
- No dispone de modo *thinking*, visión general, audio ni capacidades multilingües.

## Casos de uso

- Replicación de un pipeline de imitación de referencia: usar el repositorio como plantilla para entrenar y desplegar una política ACT propia con `lerobot-train` y `lerobot-rollout`, sustituyendo el dataset y la tarea.
- Recogida de datos con cámara anclada: el modelo sirve para validar la configuración `overhead` en experimentos donde la cámara está fija y el robot se mueve dentro de su campo de visión, comparando la calidad del aprendizaje frente a configuraciones con cámara en muñeca.
- *Baseline* para experimentos de robustez: al tratarse de una política entrenada con datos barajados (*shuffled*), es útil como referencia de control para medir cuánto degrada o mejora el rendimiento frente a un ACT entrenado con datos ordenados.
- Automatización de una tarea de pick-and-place simple: trasladar un cilindro verde a un cubo amarillo en un entorno controlado, como demostración de manipulación de bajo coste con el SO-100/SO-101.
- Docencia y formación en robótica de imitación: el reducido tamaño (51,7 M de parámetros, 0,2 GB) y la licencia Apache 2.0 permiten usarlo en cursos y talleres sin restricciones de distribución.
- Pruebas de despliegue en hardware modesto: al caber en GPUs de consumo y en CPU para inferencia a baja frecuencia, sirve para medir latencia y throughput de LeRobot en equipos no dedicados antes de escalar a políticas mayores.
- Generación de datos sintéticos o aumentados: usar la política como generador de trayectorias para aumentar el dataset original antes de reentrenar, siempre que se valide la calidad de las trayectorias producidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*"No evaluation results have been provided for this policy yet"*), por lo que no hay tasas de éxito, MMLU, HumanEval, GSM8K ni métricas comparables. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros; en FP32 ocupa aproximadamente 0,2 GB de pesos, y en FP16 unos 0,1 GB. Sumando activaciones y buffers de imagen (480x640x3), la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se ha diseñado para ejecutarse junto al robot, por lo que una RTX 3060, RTX 4060 o incluso una Jetson Orin Nano son opciones razonables. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, y también en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es la vía documentada por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control esperada es de 30 FPS según el dataset de entrenamiento, pero no se han publicado mediciones de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_AnchoredCamera_real_shuffled_control | 51,7 M | 1 imagen 480x640 + estado (6,) | Pick-and-place de una tarea | Apache 2.0 | HuggingFace, LeRobot |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | Manipulación con chunks de acción | no disponible en la informacion | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible en la informacion | no disponible | Manipulación | no disponible en la informacion | HuggingFace, LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenada para una única tarea ("Green cylinder to yellow bucket") y un único tipo de robot (`so_follower`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Dataset muy pequeño: 15 episodios y 6.738 frames, lo que aumenta el riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Dependencia de la cámara cenital: si la cámara `overhead` cambia de posición, calibración o resolución, el rendimiento puede degradarse sin aviso.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación, puede generar trayectorias que parecen razonables pero fallan en el objetivo; no hay mecanismo de verificación interno.
- Sin capacidades de lenguaje ni multilingües: no debe usarse para tareas de texto, razonamiento o diálogo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado y de LeRobot antes de un despliegue comercial.
- Caveat de producción: el nombre del repositorio sugiere datos barajados (*shuffled*), una variante experimental; no se documenta su impacto en el rendimiento, por lo que no se recomienda asumir que equivale a un ACT estándar entrenado con datos ordenados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Screener2/act_AnchoredCamera_real_shuffled_control
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/AnchoredCamera_real_shuffled_control
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/AnchoredCamera_real_shuffled_control
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
