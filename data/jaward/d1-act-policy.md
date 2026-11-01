# Jaward/d1-act-policy

## Resumen

`Jaward/d1-act-policy` es una política de imitación para robótica entrenada con el método ACT (Action Chunking with Transformers), publicado por Zhao et al. en 2023 (arXiv:2304.13705). La política ha sido entrenada y publicada en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El modelo resuelve una tarea concreta de manipulación: recoger un cubo y colocarlo en un cuenco ("plick cube place in bowl"), sobre el robot `beingbeyond_d1` con dos cámaras (`left` y `right`).

Arquitectónicamente es un transformer ligero de 51.682.956 parámetros que consume el estado de las articulaciones (vector de 14 dimensiones) y dos imágenes RGB de 480x640, y produce un vector de acción de 12 dimensiones. En lugar de predecir una única acción por paso, ACT predice fragmentos de acciones (action chunks), lo que reduce el error de acumulación y permite un control más suave y con mayor tasa de éxito en tareas de imitación.

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo generalista, sino un artefacto de investigación reproducido con un dataset pequeño (50 episodios, 8686 frames a 10 FPS) y sin resultados de evaluación publicados. Resulta útil como referencia para quien quiera replicar el pipeline de LeRobot con ACT, inspeccionar el formato de una política entrenada o adaptar la receta a su propio robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.682.956 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal definida por el chunk de acciones, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena de texto fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual (típicamente ResNet) para procesar las imágenes de las cámaras y un decodificador transformer que predice un chunk de acciones futuras en lugar de un único paso. Esta predicción por fragmentos mitiga el problema de la acumulación de errores en el control y suele traducirse en trayectorias más suaves. La política consume `observation.state` (14 dimensiones), `observation.images.left` y `observation.images.right` (3x480x640 cada una) y emite `action` (12 dimensiones), lo que corresponde a las articulaciones del robot `beingbeyond_d1`.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `Jaward/d1-act-data`: 50 episodios, 8686 frames a 10 FPS, una única tarea ("plick cube place in bowl"). La configuración reportada es de 15000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documentan aumentos de datos, composición del dataset más allá del recuento de episodios y frames, ni etapas de RLHF/DPO (no aplicables en este paradigma). Tampoco se especifican detalles del backbone visual ni del número de capas del transformer en la model card.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 12 dimensiones para el robot `beingbeyond_d1` a partir del estado articular y de dos vistas de cámara.
- Percepción visual multimodal: procesa dos flujos de imagen RGB de 480x640 (cámaras `left` y `right`) de forma conjunta con el estado propioceptivo.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en lugar de pasos individuales, lo que favorece la suavidad y reduce el error acumulado.
- Ejecución de una tarea concreta: "plick cube place in bowl", definida en el dataset de entrenamiento.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se reentrena con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, generación de texto ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Replicación de experimentos de imitación: sirve como punto de partida para reproducir el pipeline de ACT en LeRobot con el robot `beingbeyond_d1` y verificar la receta de entrenamiento (15000 pasos, batch 8, lr 1e-05).
- Demostración de manipulación pick-and-place: ejecutar la política sobre el robot real para recoger un cubo y depositarlo en un cuenco, como ejemplo canónico de tarea de manipulación con dos cámaras.
- Base para fine-tuning en tareas similares: reentrenar con `lerobot-train` sobre un dataset propio con el mismo esquema de observaciones (estado de 14 dimensiones y dos cámaras de 480x640) para adaptar la política a nuevas posiciones de objeto.
- Docencia y formación en robótica de imitación: usar el repositorio como caso de estudio del formato de una política LeRobot (features de entrada/salida, configuración de entrenamiento, comandos de rollout).
- Evaluación de infraestructura de inferencia robótica: medir latencia y throughput de `lerobot-rollout` con una política de ~51,7 M de parámetros en hardware consumer.
- Referencia para integración de hardware: emplear los nombres de cámaras (`left`, `right`) y el tipo de robot (`beingbeyond_d1`) como plantilla para configurar un montaje equivalente con cámaras OpenCV a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito por tarea, ni comparación con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros en safetensors (fp32 ≈ 207 MB; fp16 ≈ 103 MB), más el backbone visual y los buffers de activación, el modelo cabe holgadamente en cualquier GPU consumer con 4-8 GB de VRAM. No se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060 en adelante) es suficiente; A100/H100 no son necesarias para una política de este tamaño.
- Cabe en GPU consumer: sí, en tarjetas de gama media como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La model card no reporta FPS de inferencia ni tiempos por paso; el dataset se grabó a 10 FPS y las cámaras se configuran a 30 FPS en el comando de ejemplo, pero no se especifica la frecuencia efectiva de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jaward/d1-act-policy` | 51,7 M | Estado 14-d + 2 imágenes 480x640 | Pick-and-place con `beingbeyond_d1` | apache-2.0 | Hugging Face (LeRobot) |
| ACT original (Zhao et al., 2023) | no disponible en esta ficha | no disponible | Imitación con chunks de acción | no disponible | Paper arXiv:2304.13705 |
| Otras políticas LeRobot (p. ej. Diffusion Policy, π0) | no disponible | no disponible | Manipulación robótica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable en el robot real.
- Dataset muy pequeño: 50 episodios y 8686 frames para una única tarea; la generalización a nuevas posiciones, iluminación, objetos o distractores es muy limitada.
- Especialización extrema: solo ejecuta la tarea "plick cube place in bowl" sobre el robot `beingbeyond_d1` con las cámaras `left` y `right`; no es reutilizable fuera de ese montaje sin reentrenamiento.
- Dependencia de hardware: requiere el robot `beingbeyond_d1`, dos cámaras con los nombres e índices correctos y el puerto serie adecuado; los placeholders del comando de rollout deben sustituirse por valores específicos de la máquina.
- Riesgo de sobreajuste y alucinación de acciones: al ser imitación pura, puede producir trayectorias no válidas ante estados fuera de distribución; no hay mecanismo de seguridad ni de recuperación documentado.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la licencia del método ACT original y de LeRobot (Apache-2.0) al redistribuir.
- Sin soporte de lenguaje: no procesa instrucciones en lenguaje natural más allá de la cadena de tarea fija; no debe presentarse como un modelo conversacional ni como un agente.
- Fecha de creación futura en los metadatos (2026-10-31): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jaward/d1-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Jaward/d1-act-data
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jaward/d1-act-data
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
