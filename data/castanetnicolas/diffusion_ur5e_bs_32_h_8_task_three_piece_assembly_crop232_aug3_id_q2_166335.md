# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q2_166335

## Resumen

`diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q2_166335` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante la librería LeRobot. El modelo resuelve una tarea concreta de manipulación robótica contact-rich: insertar dos piezas en una base de ensamblaje, formulando el control como un proceso generativo de difusión que produce trayectorias de acción multimodales y suaves en lugar de una única acción determinista por paso.

El desarrollo corre a cargo del usuario `castanetnicolas` y se apoya en el dataset `mimicgen_three_piece_assembly_d1_image256` (220 episodios, 73.864 fotogramas a 20 FPS), generado con MimicGen a partir de demostraciones. La política consume el estado del robot (9 dimensiones) y dos cámaras de 256×256 (`agentview` y `robot0_eye_in_hand`) para emitir acciones de 7 dimensiones. La arquitectura es una red de difusión condicionada por observaciones visuales y propioceptivas, con 281.942.983 parámetros totales y un repositorio de 1,1 GB en formato safetensors.

Su relevancia es acotada pero clara: es un ejemplo reproducible de entrenamiento de imitación con LeRobot 0.6.1 sobre un robot tipo panda/UR5e, útil para investigadores que quieran replicar el pipeline, comparar hiperparámetros (batch 32, 300.000 pasos, learning rate 1e-4) o reutilizar el checkpoint como punto de partida. No es un modelo de propósito general ni un LLM: es un artefacto de robótica específico de tarea y de simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (red de difusión condicionada para control visuomotor) |
| Parámetros totales | 281.942.983 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | panda |
| Cámaras | agentview, robot0_eye_in_hand |
| Entrada `observation.state` | STATE, shape (9,) |
| Entrada `observation.images.agentview` | VISUAL, shape (3, 256, 256) |
| Entrada `observation.images.robot0_eye_in_hand` | VISUAL, shape (3, 256, 256) |
| Salida `action` | ACTION, shape (7,) |
| Dataset de entrenamiento | castanetnicolas/mimicgen_three_piece_assembly_d1_image256 |
| Episodios del dataset | 220 |
| Fotogramas del dataset | 73.864 |
| Frame rate del dataset | 20 FPS |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador | adam |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La política sigue el paradigma de Diffusion Policy (paper arXiv:2303.04137): en lugar de mapear observación a acción de forma directa, aprende la distribución condicional de secuencias de acción mediante un proceso de difusión (denoising). En inferencia, parte de ruido gaussiano y lo refina iterativamente condicionado por el estado del robot y las dos imágenes de cámara, generando un chunk de acciones coherente temporalmente. Esto es especialmente útil en tareas de ensamblaje con contactos, donde la multimodalidad de las trayectorias (varias formas válidas de insertar una pieza) hace que una regresión determinista produzca promedios inválidos.

El entrenamiento se realizó con LeRobot 0.6.1 durante 300.000 pasos, batch de 32, optimizador Adam y learning rate 1e-4, con semilla 1000. Los datos provienen de MimicGen: 220 episodios y 73.864 fotogramas a 20 FPS sobre la tarea "Insert the first piece into the base, then insert the second piece on top of it". No se documenta en la información disponible el número de tokens, la composición exacta del dataset más allá de la tarea, ni si hubo etapas de RLHF/DPO (no aplicables en este dominio). Tampoco se detalla la arquitectura interna de la red de difusión (número de capas, tipo de backbone visual, schedule de ruido), por lo que esos datos quedan como no disponibles.

## Capacidades

- Control visuomotor de manipulación robótica: genera trayectorias de acción de 7 dimensiones a partir de imágenes y estado propioceptivo.
- Manipulación contact-rich: el proceso de difusión produce trayectorias suaves y multimodales adecuadas para inserción de piezas.
- Percepción visual dual: integra una vista global (`agentview`) y una vista de muñeca (`robot0_eye_in_hand`) a 256×256.
- Ejecución de una tarea específica de ensamblaje en dos fases (insertar primera pieza en la base, luego la segunda encima).
- Integración con el ecosistema LeRobot: rollout, entrenamiento y evaluación mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-step, razonamiento lingüístico, matemáticas, visión general ni audio. Es un modelo estrictamente de robótica.
- Capacidades multilingües: no disponibles (no procesa lenguaje natural; la instrucción de tarea es una cadena fija).

## Casos de uso

- Replicación de experimentos de Diffusion Policy: sirve como checkpoint de referencia para comparar hiperparámetros (batch, pasos, learning rate) en la tarea de ensamblaje de tres piezas, usando `lerobot-train` con el mismo dataset.
- Evaluación de pipelines de imitación en simulación: permite medir la tasa de éxito de una política de difusión en un entorno MimicGen antes de trasladar el enfoque a un robot real.
- Punto de partida para fine-tuning: el checkpoint puede reinicializarse y ajustarse con datos propios de un UR5e o panda para tareas de inserción similares, aprovechando los 281,9 M de parámetros ya entrenados.
- Docencia y formación en robótica de aprendizaje: ejemplo completo y reproducible de entrenamiento de imitación con LeRobot, útil en cursos sobre visuomotor policies.
- Benchmark interno de infraestructura: permite medir latencia de inferencia y throughput de un modelo de difusión de ~282 M de parámetros en GPUs concretas antes de escalar a políticas mayores.
- Investigación en multimodalidad de acciones: al ser una política generativa, sirve para estudiar cómo la difusión captura múltiples modos de trayectoria en tareas de contacto, comparándola con políticas deterministas.
- Validación de datasets MimicGen: el par dataset-checkpoint permite verificar la calidad de datos sintéticos y su transferencia a políticas entrenadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, comparaciones con otras políticas ni métricas de simulación o robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 281,9 M de parámetros en fp32 el peso ronda 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs consumer, aunque el consumo real depende del backbone visual y del número de pasos de difusión.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090, RTX 3090 o incluso una RTX 3060 de 12 GB deberían ser suficientes para inferencia; para entrenamiento con batch 32 se recomienda al menos 24 GB.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más para inferencia, dado el tamaño del checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) con backend CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del número de pasos de denoising y de la resolución de las dos cámaras de 256×256.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (diffusion, LeRobot) | 281,9 M | Diffusion Policy | Ensamblaje de tres piezas (panda/UR5e) | apache-2.0 | Hugging Face Hub |
| Otras políticas LeRobot `diffusion` | no disponible | Diffusion Policy | Varía por checkpoint | apache-2.0 (típico) | Hugging Face Hub |
| Políticas ACT (Action Chunking Transformer) en LeRobot | no disponible | Transformer de imitación | Manipulación general | apache-2.0 (típico) | Hugging Face Hub |
| Políticas basadas en VLA (p. ej. OpenVLA) | no disponible en esta ficha | Vision-Language-Action | Manipulación guiada por lenguaje | varía | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de tarea: solo está entrenado para el ensamblaje de tres piezas descrito; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que su fiabilidad en producción es desconocida.
- Dependencia del entorno de entrenamiento: entrenado sobre datos MimicGen en simulación; el gap sim-to-real no está cuantificado y puede degradar el rendimiento en un UR5e físico.
- Dependencia de cámaras concretas: requiere las vistas `agentview` y `robot0_eye_in_hand` con los nombres y calibración esperados; cambios de cámara o iluminación pueden afectar al rendimiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe usarse como modelo de lenguaje, agente conversacional ni sistema de tool calling.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la naturaleza generativa de la difusión puede producir trayectorias plausibles pero incorrectas ante observaciones fuera de distribución.
- Sesgos: no documentados; al entrenarse en un entorno sintético concreto, puede heredar sesgos de las demostraciones originales de MimicGen.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de redistribuir derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Fecha de creación indicada como 2026-11-15, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q2_166335
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
