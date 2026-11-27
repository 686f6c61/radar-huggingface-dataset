# ethanCSL/openarm_wipeboard_lerobot_real_gr00t_v02

## Resumen

`ethanCSL/openarm_wipeboard_lerobot_real_gr00t_v02` es una política de imitación robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. No se trata de un modelo de lenguaje generalista, sino de un checkpoint de control motor que traduce observaciones multimodales (tres cámaras RGB y un vector de estado propioceptivo de 16 dimensiones) en un vector de acción de 16 dimensiones para un robot bimanual de tipo `openarm_umeow`. El modelo resuelve una tarea muy concreta: pasar un borrador de un brazo al otro y limpiar una pizarra.

La arquitectura subyacente combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, una elección que permite condicionar la predicción de acciones tanto en la percepción visual como en instrucciones en lenguaje natural y en el estado del robot. El checkpoint pesa 12,6 GB y contiene 3.144.016.000 parámetros en formato safetensors, lo que refleja que se distribuye el modelo completo de GR00T N1.7 y no solo una cabeza de política ligera.

Su relevancia es doble: por un lado, demuestra el flujo completo de LeRobot 0.6.2 para afinar un modelo fundacional de robótica con datos reales de teleoperación; por otro, publica bajo licencia Apache 2.0 un artefacto reproducible con configuración de entrenamiento explícita (20 000 pasos, batch 8, AdamW, lr 1e-4). Es un caso de estudio útil para quien quiera evaluar GR00T en un robot bimanual de bajo coste, aunque con un conjunto de datos muy reducido (20 episodios).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el condicionamiento lingüístico usa la instrucción de tarea en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `openarm_umeow` (bimanual) |
| Cámaras de entrada | `body_cam`, `wrist_cam`, `right_wrist_cam` (3×480×640) |
| Estado de entrada | `observation.state` de forma (16,) |
| Acción de salida | `action` de forma (16,) |
| Tamaño del repositorio | 12,6 GB |
| Librería | LeRobot 0.6.2 |
| Tarea entrenada | "Left arm pass eraser to right arm to wipe off the board" |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional cross-embodiment para robots humanoides. Su diseño separa dos componentes: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de las cámaras y la instrucción textual, y un transformer de acciones que genera trayectorias mediante flow matching, una formulación generativa continua que modela la distribución de acciones condicionada en visión, lenguaje y propiocepción. Esta separación permite reutilizar el conocimiento visual-semántico del backbone mientras se especializa la cabeza de acción en la morfología concreta del robot.

El checkpoint se ha afinado con LeRobot 0.6.2 sobre el dataset `ethanCSL/openarm_wipeboard_lerobot_real_v02`, compuesto por 20 episodios y 18 601 fotogramas a 30 FPS de teleoperación real. La configuración de entrenamiento es de 20 000 pasos con batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta en la información disponible el número de tokens de entrenamiento del backbone original, la composición del dataset de preentrenamiento de GR00T N1.7, ni si hubo etapas de RLHF o DPO; tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control motor bimanual: genera acciones de 16 dimensiones para el robot `openarm_umeow`, incluyendo la coordinación de ambos brazos para pasar un objeto y limpiar una superficie.
- Percepción visual multivista: integra tres cámaras simultáneas (cuerpo, muñeca izquierda y muñeca derecha) a resolución 480×640.
- Condicionamiento por lenguaje: la política acepta una instrucción textual de tarea ("Left arm pass eraser to right arm to wipe off the board") que guía la generación de acciones.
- Fusión de propiocepción: incorpora el estado articular y de sensores del robot como vector de 16 dimensiones junto a las observaciones visuales.
- Aprendizaje por imitación: reproduce habilidades adquiridas a partir de demostraciones humanas de teleoperación.
- Integración con LeRobot: compatible con las herramientas `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- Capacidad de reentrenamiento: al ser un GR00T completo, puede afinarse con nuevos datasets para otras tareas del mismo robot.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modo thinking; estas no aplican a un modelo de política robótica.

## Casos de uso

- Automatización de limpieza de pizarras en entornos educativos o de oficina: la política ejecuta la secuencia de pasar el borrador entre brazos y limpiar la superficie, adecuada para demostraciones reproducibles con el robot `openarm_umeow`.
- Investigación en aprendizaje por imitación bimanual: sirve como referencia para estudiar la coordinación de dos brazos con tres cámaras y un vector de estado compartido, comparando curvas de entrenamiento con la configuración publicada.
- Base para fine-tuning en tareas de manipulación con dos brazos: al ser un checkpoint GR00T completo, se puede reentrenar con nuevos datasets de LeRobot para tareas como ensamblaje o entrega de objetos, partiendo del conocimiento del backbone.
- Validación de pipelines LeRobot de extremo a extremo: útil para verificar la instalación, el formateo de datasets, el entrenamiento con `lerobot-train` y el despliegue con `lerobot-rollout` antes de abordar proyectos mayores.
- Benchmark de modelos fundacionales de robótica: permite medir el coste de afinar GR00T N1.7 con solo 20 episodios y evaluar si el modelo generaliza o sobreajusta a la tarea, un dato relevante para decidir cuántos datos de teleoperación recolectar.
- Reproducción de experimentos docentes: con 12,6 GB y licencia Apache 2.0, es viable en laboratorios académicos para prácticas de robótica de imitación, siempre que se disponga del hardware `openarm_umeow` y las tres cámaras.
- Desarrollo de sistemas de control con condicionamiento lingüístico: sirve para explorar cómo la instrucción textual modula la política en un robot concreto, aunque limitado a una única tarea entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 12,6 GB; en FP16 se requiere aproximadamente 6,3 GB solo para pesos, pero el backbone Qwen3-VL y las tres cámaras a 480×640 elevan el consumo real. Se recomienda al menos 24 GB de VRAM para inferencia cómoda en FP16.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia; para reentrenamiento con batch 8 se recomienda A100 80 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con FP16; en GPUs de 16 GB requeriría cuantización, que no está documentada.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía oficial; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según el dataset de entrenamiento, pero no se publican mediciones de latencia de inferencia ni throughput en robot real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ethanCSL/openarm_wipeboard_lerobot_real_gr00t_v02` | 3.144.016.000 | 3 cámaras 480×640 + estado (16,) | Limpieza de pizarra bimanual | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 (base NVIDIA) | no disponible | visión + lenguaje + propiocepción | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | variables según configuración | Imitación por tarea | Apache 2.0 (LeRobot) | Hugging Face, amplia adopción |

La comparación con políticas ligeras tipo ACT o Diffusion Policy es relevante porque este checkpoint, al arrastrar el backbone completo de GR00T, es mucho más pesado (12,6 GB frente a cientos de MB típicos) pero conserva capacidad de generalización y reentrenamiento. No se dispone de datos de rendimiento comparativo para establecer qué enfoque obtiene mayor tasa de éxito en esta tarea concreta.

## Limitaciones y advertencias

- Dataset muy reducido: solo 20 episodios y 18 601 fotogramas, lo que aumenta el riesgo de sobreajuste y de baja generalización a posiciones, iluminación o distracciones distintas a las de las demostraciones.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable en producción.
- Especificidad de hardware: entrenada exclusivamente para el robot `openarm_umeow` con tres cámaras concretas (`body_cam`, `wrist_cam`, `right_wrist_cam`); no es transferible directamente a otros robots o configuraciones de cámara.
- Tarea única: la instrucción de lenguaje está limitada a "Left arm pass eraser to right arm to wipe off the board"; no se documenta capacidad de generalizar a otras instrucciones.
- Idiomas: no se dispone de información sobre el comportamiento con instrucciones en castellano u otros idiomas; la única instrucción documentada está en inglés.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como todo modelo generativo de acciones, puede producir trayectorias no válidas o colisiones, especialmente fuera de la distribución de entrenamiento; requiere supervisión y paradas de seguridad en el robot.
- Sesgos: no documentados, pero al derivarse de teleoperación humana puede heredar sesgos de estilo y velocidad de ejecución del operador.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las licencias del backbone Cosmos-Reason2/Qwen3-VL y de GR00T N1.7, que no se detallan en la información disponible.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en GPUs de gama media-baja.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_wipeboard_lerobot_real_gr00t_v02
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_wipeboard_lerobot_real_v02
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_wipeboard_lerobot_real_v02
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
