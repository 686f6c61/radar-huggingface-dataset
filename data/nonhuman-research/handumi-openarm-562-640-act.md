# NONHUMAN-RESEARCH/handumi-openarm-562-640-act

## Resumen

handumi-openarm-562-640-act es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada por NONHUMAN-RESEARCH en Hugging Face Hub y entrenada con la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado de las articulaciones de un robot OpenArm v1 junto con tres flujos de cámara (left, right y top) y emite un vector de 16 acciones articulares. Su tarea concreta es doblar una toalla amarilla, aprendida a partir de 562 episodios teleoperados.

El modelo tiene 51.689.104 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB, lo que lo sitúa en el rango de los controladores ligeros que pueden ejecutarse en tiempo real en una GPU de consumo. La arquitectura ACT predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad de las maniobras de contacto, como el plegado de tela.

Su relevancia actual es doble: por un lado, demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`) sobre un robot de código abierto; por otro, sirve como referencia reproducible para quien quiera adaptar ACT a su propio hardware. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

Especificaciones adicionales extraídas de la model card:

| Parametro | Valor |
|---|---|
| Tipo de robot | openarmv1 |
| Cámaras de entrada | left (3, 480, 640), right (3, 480, 640), top (3, 376, 672) |
| Estado de observación | observation.state, shape (16,) |
| Salida de acción | action, shape (16,) |
| Dataset de entrenamiento | murobotics/handumi-towel-openarm-562-640 |
| Episodios | 562 |
| Fotogramas | 200.835 |
| Frecuencia de captura | 30 FPS |
| Tarea | "Fold the yellow towel" |
| Pasos de entrenamiento | 2.812 |
| Batch size | 96 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705 (Zhao et al., 2023). La arquitectura combina un codificador visual (típicamente ResNet preentrenado) que procesa las tres cámaras, un codificador del estado propioceptivo de 16 dimensiones y un transformer que fusiona ambas modalidades para predecir un chunk de acciones futuras. La predicción por chunks, frente a la predicción paso a paso, mitiga el problema de la varianza en la ejecución y permite maniobras más suaves y consistentes en tareas de manipulación fina.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset murobotics/handumi-towel-openarm-562-640, compuesto por 562 episodios teleoperados y 200.835 fotogramas a 30 FPS, todos ellos de la misma tarea ("Fold the yellow towel"). Se usaron 2.812 pasos con batch de 96, AdamW y learning rate 1e-05. La model card no documenta el uso de RLHF, DPO ni ningún otro ajuste posterior al entrenamiento supervisado; se trata de imitación pura sobre demostraciones. No se especifica el número exacto de tokens ni la composición detallada del dataset más allá de la tarea y las cámaras.

## Capacidades

- Control visomotor de un robot OpenArm v1 a partir de tres cámaras y del estado articular de 16 dimensiones.
- Predicción de chunks de acciones de 16 dimensiones para ejecución en bucle cerrado.
- Ejecución de la tarea específica de plegado de una toalla amarilla.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Despliegue mediante `lerobot-rollout` con estrategia base (sin grabación de episodios).
- Reentrenamiento y ajuste fino posibles con `lerobot-train` sobre nuevos datasets.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: es un controlador, no un modelo generativo de texto.

## Casos de uso

- Plegado automatizado de toallas en entornos domésticos o de laboratorio: el modelo ejecuta la política entrenada directamente sobre OpenArm v1 con las cámaras left, right y top, reproduciendo la tarea "Fold the yellow towel" a 30 FPS.
- Base para ajuste fino con nuevos tejidos o colores: al estar entrenado con 562 episodios de una única tarea, sirve como inicialización para reentrenar con `lerobot-train` sobre datasets propios y evaluar la transferencia de la representación visual.
- Benchmark de referencia para comparar variantes de ACT: los 51,7 M de parámetros y la configuración documentada (batch 96, LR 1e-05, 2.812 pasos) permiten reproducir el experimento y medir el efecto de cambios en hiperparámetros.
- Docencia y formación en robótica de imitación: el flujo completo (grabación, dataset en Hub, entrenamiento, rollout) es reproducible con LeRobot y sirve para enseñar el ciclo de vida de una política visomotora.
- Validación de hardware OpenArm v1: la política permite comprobar la calibración de cámaras y articulaciones antes de entrenar tareas más complejas, ya que cualquier desalineación se manifiesta en fallos de plegado.
- Investigación en manipulación deformable: el plegado de tela es un problema clásico de manipulación de objetos deformables; esta política ofrece un punto de partida público y con licencia permisiva para estudiar robustez frente a variaciones de iluminación o posición inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se han reportado tasas de éxito, número de ensayos ni condiciones de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 207 MB; en FP16, unos 103 MB. A ello hay que sumar la activación del codificador visual para tres cámaras de 480x640 y 376x672, lo que sitúa el consumo práctico en el rango de 1-3 GB de VRAM, dependiendo de la implementación y del tamaño de batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se recomiendan RTX 3060, RTX 4060, RTX 4090, A100 o H100 para entrenamiento y para inferencia con margen.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con backend PyTorch; no se documentan exportaciones a ONNX, TensorRT ni llama.cpp, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada. La captura de datos es a 30 FPS, lo que sugiere que la inferencia debe ejecutarse al menos a esa frecuencia para un control fluido, pero no se aportan mediciones reales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada. A continuación se comparan únicamente características estructurales conocidas de políticas ACT públicas de LeRobot, sin datos de benchmarks:

| Modelo | Parametros | Tarea | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NONHUMAN-RESEARCH/handumi-openarm-562-640-act | 51,7 M | Plegado de toalla en OpenArm v1 | 3 cámaras + estado (16,) | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de referencia de LeRobot (p. ej. aloha, pusht) | no disponible | Tareas de manipulación diversas | variables según robot | Apache 2.0 | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible | Manipulación visomotora | variables según robot | Apache 2.0 | Hugging Face Hub / LeRobot |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de estas alternativas frente al modelo descrito.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente con una toalla amarilla y una única tarea; es probable que falle con otros colores, texturas, tamaños o posiciones iniciales no representadas en los 562 episodios.
- Riesgo de alucinación en sentido robótico: al ser una política de imitación, puede generar acciones plausibles pero incorrectas ante distribuciones de entrada fuera del dominio de entrenamiento (iluminación distinta, oclusiones, cambios de cámara).
- Limitaciones de contexto e idioma: no procesa lenguaje natural; la instrucción de tarea se pasa como cadena fija ("Fold the yellow towel") y no hay comprensión semántica.
- Dependencia del hardware: la política asume la morfología y calibración exactas de OpenArm v1 y las tres cámaras con sus resoluciones concretas; usarla en otro robot requiere reentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero no se ofrece garantía alguna; el autor no asume responsabilidad por fallos en producción.
- Ausencia de evaluación: no hay tasas de éxito publicadas, por lo que no puede afirmarse su robustez en robot real sin una validación propia.
- Sin cuantizaciones documentadas: no se han publicado versiones GGUF, ONNX ni INT8, lo que limita el despliegue en hardware sin PyTorch.
- Fecha de creación en el Hub: 2026-11-02, con 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto de investigación sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NONHUMAN-RESEARCH/handumi-openarm-562-640-act
- Dataset de entrenamiento: https://huggingface.co/datasets/murobotics/handumi-towel-openarm-562-640
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=murobotics/handumi-towel-openarm-562-640
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
