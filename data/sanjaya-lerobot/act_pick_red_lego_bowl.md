# Sanjaya-LeRobot/act_pick_red_lego_bowl

## Resumen

`act_pick_red_lego_bowl` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub a través de la librería LeRobot. La desarrolla el usuario Sanjaya-LeRobot y resuelve una tarea única y muy concreta: coger un ladrillo de Lego rojo y depositarlo en un cuenco. No es un modelo de lenguaje ni un modelo fundacional generalista, sino un controlador visuomotor específico para un robot `so_follower` (familia SO-100/SO-101 de bajo coste) con una sola cámara frontal.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB. Consume como entrada el estado de las articulaciones (vector de 6 dimensiones) y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones. La arquitectura subyacente es la de ACT, un transformer con codificador visual y decodificador de acciones que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas de imitación paso a paso.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) para quien quiera replicar el flujo en hardware asequible. No se han publicado resultados de evaluación en robot real ni benchmarks, y la licencia no está especificada, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de un paso, con historial implícito en el chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `so_follower` |
| Cámaras | 1 (`front`, 480x640, 3 canales) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Salida de acción | `action`, shape `(6,)` |
| Dataset de entrenamiento | `Sanjaya-LeRobot/pick_red_lego_bowl_20261115_152432` (54 episodios, 23.149 frames, 30 FPS) |
| Tarea | "Pick up the red lego brick and place it in the bowl" |
| Pasos de entrenamiento | 15.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual (procesa la imagen frontal de 480x640) y un decodificador que emite secuencias de acciones de longitud fija (chunks) en lugar de una acción por paso. Esta predicción por chunks mitiga el problema de acumulación de errores de las políticas reactivas y permite un control más suave. El modelo tiene 51,7 M de parámetros, coherente con el tamaño típico de ACT para tareas de manipulación de un solo brazo.

El entrenamiento se realizó con `lerobot-train` sobre 54 episodios de teleoperación (23.149 frames a 30 FPS, aproximadamente 12,9 minutos de datos efectivos) durante 15.000 pasos con batch size 8, AdamW y learning rate 1e-05. No se documenta el uso de RLHF, DPO ni refuerzo; es imitación supervisada pura a partir de demostraciones humanas. Tampoco se detalla la composición del dataset más allá de la tarea y del número de episodios, ni si hubo aumentos de datos, currículum o regularización específica.

La innovación técnica relevante es el propio chunking de acciones de ACT y su integración en el ecosistema LeRobot, que permite entrenar y desplegar la política con comandos CLI (`lerobot-train`, `lerobot-rollout`) sin escribir código de inferencia a medida. No se documentan decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` para una tarea de pick-and-place concreta.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado articular de 6 dimensiones e imagen RGB frontal.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (sin refuerzo).
- Ejecución en bucle cerrado con realimentación visual a 30 FPS (frecuencia del dataset de entrenamiento).
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión general, audio ni capacidades multilingües: es un modelo estrictamente robótico y de tarea única.

## Casos de uso

- Replicación de un pipeline de imitación en hardware asequible: usar el modelo como referencia para grabar un dataset propio con LeRobot, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` en un SO-100/SO-101. Es adecuado porque toda la configuración (pasos, batch, learning rate, semilla) está documentada y es reproducible.
- Docencia y formación en robótica de manipulación: el modelo sirve como ejemplo mínimo (51,7 M de parámetros, 0,2 GB) de política visuomotora para explicar chunking de acciones, codificación de observaciones y evaluación en robot real.
- Prototipado de tareas de pick-and-place con objetos pequeños: la tarea de coger un ladrillo de Lego y dejarlo en un cuenco es representativa de manipulación fina con un solo brazo y una sola cámara, útil como banco de pruebas de calibración, iluminación y posicionamiento.
- Benchmark interno de infraestructura de inferencia robótica: al ser un modelo pequeño, permite medir latencia de inferencia, throughput de frames y estabilidad del bucle de control en distintas GPUs sin cuellos de botella de memoria.
- Base para fine-tuning en tareas similares: al estar en formato LeRobot y safetensors, se puede reentrenar sobre un dataset propio de pick-and-place con objetos y recipientes distintos, partiendo de los 15.000 pasos ya realizados.
- Generación de datos sintéticos o aumentados para otras políticas: usar las trayectorias predichas como referencia para comparar con políticas más recientes (p. ej. diffusion policy) en el mismo entorno y dataset.
- Demostración de despliegue en robot real con una sola cámara: útil para validar la cadena completa cámara -> política -> actuadores en un `so_follower` antes de escalar a configuraciones multi-cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más. La memoria dominante será la del codificador visual y los buffers de imagen (480x640x3).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento se recomienda al menos 8-12 GB de VRAM por el batch de imágenes, aunque el batch size documentado es 8.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con soporte CUDA de los últimos años; también es viable en CPU para inferencia a baja frecuencia, aunque no se documenta latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Sanjaya-LeRobot/act_pick_red_lego_bowl`; el entrenamiento se hace con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La frecuencia de control de referencia es 30 FPS (la del dataset), pero no se publican medidas de latencia de inferencia ni de throughput en robot real.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Sanjaya-LeRobot/act_pick_red_lego_bowl` | ACT (LeRobot) | 51,7 M | Estado (6,) + imagen 480x640 | Pick red lego bowl | no disponible | Hugging Face Hub |
| ACT genérico (LeRobot, p. ej. `lerobot/act_aloha_*`) | ACT (LeRobot) | ~50 M (variable) | Estado + imágenes | Manipulación ALOHA / SO | Apache-2.0 (según repo) | Hugging Face Hub |
| Diffusion Policy (LeRobot) | Política por difusión | ~decenas de M (variable) | Estado + imágenes | Manipulación diversa | Apache-2.0 (según repo) | Hugging Face Hub / GitHub |
| SmolVLA (Hugging Face) | VLA | ~450 M | Estado + imágenes + lenguaje | Manipulación generalista | Apache-2.0 | Hugging Face Hub |

La comparación es orientativa: no hay benchmarks comunes publicados para este modelo, por lo que no se puede afirmar superioridad o inferioridad en tasa de éxito frente a las alternativas. La diferencia principal es que este modelo es de tarea única y sin licencia declarada, mientras que las alternativas del ecosistema LeRobot suelen tener licencia Apache-2.0 y mayor generalidad.

## Limitaciones y advertencias

- Tarea única: solo está entrenado para "Pick up the red lego brick and place it in the bowl"; no generaliza a otros objetos, recipientes ni instrucciones.
- Sin evaluación publicada: no hay tasa de éxito en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posición de objetos o distracciones.
- Dataset pequeño: 54 episodios y 23.149 frames (unos 12,9 minutos a 30 FPS) son datos limitados; el riesgo de sobreajuste a posiciones y condiciones concretas es alto.
- Dependencia de hardware específico: entrenado para `so_follower` con una cámara `front` a 480x640; usar otro robot, resolución o número de cámaras invalida la política.
- Licencia no disponible: la model card indica "[More Information Needed]"; no se puede asumir uso comercial sin aclaración del autor.
- Sin idiomas ni capacidades de lenguaje: no es un modelo conversacional ni multimodal general; no debe evaluarse con benchmarks de LLM.
- Riesgo de alucinación en el sentido robótico: la política puede generar trayectorias plausibles pero incorrectas ante estados fuera de distribución, sin mecanismo de verificación.
- Sesgos de los datos de teleoperación: las demostraciones reflejan el estilo, la velocidad y las condiciones del operador y del entorno de grabación.
- Fecha de creación futura en los metadatos (2026-11-16): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.
- Sin datos de latencia ni throughput: no se puede garantizar el cumplimiento de un bucle de control a 30 FPS en hardware concreto sin medirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanjaya-LeRobot/act_pick_red_lego_bowl
- Dataset de entrenamiento: https://huggingface.co/datasets/Sanjaya-LeRobot/pick_red_lego_bowl_20261115_152432
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Sanjaya-LeRobot/pick_red_lego_bowl_20261115_152432
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
