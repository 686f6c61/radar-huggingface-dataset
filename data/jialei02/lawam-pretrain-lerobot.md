# jialei02/lawam-pretrain-lerobot

## Resumen

LaWAM (Latent World Action Models) es un modelo de política robótica de tipo vision-language-action (VLA) desarrollado por un equipo liderado por Jialei Chen y colaboradores, presentado en el artículo arXiv:2606.15768. El modelo aborda el problema de incorporar predicción dinámica en políticas de control robótico sin incurrir en el coste computacional de generar imágenes o vídeos futuros en el espacio de píxeles. En lugar de ello, LaWAM traslada la predicción al espacio latente de codificadores visuales preentrenados como DINOv3, lo que permite razonar sobre cómo evoluciona la escena bajo una acción propuesta de forma mucho más eficiente.

Este repositorio concreto contiene el checkpoint preentrenado de LaWAM convertido al formato nativo de LeRobot, la biblioteca de robótica de Hugging Face. Los parámetros se almacenan en `model.safetensors` y no requieren el checkpoint original de PyTorch. El modelo se basa en el VLM Qwen3-VL-2B-Instruct como codificador visual-lingüístico, y cuenta con aproximadamente 2.560 millones de parámetros. Está pensado como inicialización para fine-tuning en tareas robóticas específicas, no como política lista para usar. Su relevancia radica en que introduce una interfaz de modelo de mundo latente que mejora la eficiencia de las políticas VLA, un área de gran actividad investigadora en 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) con modelo de mundo latente (LaWAM) sobre base Qwen3-VL-2B-Instruct |
| Parametros totales | 2.555.179.360 (~2,56 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors, precisión no especificada) |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

LaWAM introduce un modelo de mundo latente (Latent World Model, LaWM) que se integra en una política VLA. El proceso consta de dos etapas: primero se aprende un modelo de mundo latente que, dado un estado visual latente y una acción latente, predice el siguiente estado visual latente; después se entrena la política LaWAM completa, que utiliza estos subobjetivos visuales latentes para generar chunks de acciones. La clave es que la predicción se realiza en el espacio latente de codificadores visuales preentrenados como DINOv3, evitando la reconstrucción de píxeles y reduciendo así la latencia y el coste computacional. El decodificador forward de un modelo de acción latente se reutiliza como LaWM, expandiendo las acciones latentes predichas por la política en subobjetivos visuales latentes para la generación de chunks de acción.

El checkpoint preentrenado se ha convertido al formato LeRobot, incluyendo la configuración de política, preprocesador, postprocesador, tensores de normalización y un manifiesto de procedencia de la conversión. La configuración por defecto utiliza el setup de 7 dimensiones del robot Franka de la versión original. El entrenamiento específico (número de tokens, composición del dataset, uso de RLHF/DPO) no se detalla en la información disponible; se indica únicamente que es un modelo preentrenado destinado a fine-tuning posterior.

## Capacidades

- Control robótico de manipulación: genera acciones de control para robots manipuladores, específicamente configurado para el robot Franka de 7 grados de libertad.
- Razonamiento dinámico latente: predice la evolución de la escena en el espacio latente de codificadores visuales, lo que permite planificar acciones considerando la dinámica del entorno.
- Generación de chunks de acción: produce secuencias de acciones (action chunks) para ejecución suave y coherente.
- Integración con LeRobot: se carga directamente mediante `LaWAMPolicy.from_pretrained()` en la biblioteca LeRobot, facilitando su uso en pipelines estándar de robótica.
- Comprensión visual y lingüística: hereda las capacidades del VLM base Qwen3-VL-2B-Instruct, lo que permite interpretar instrucciones en lenguaje natural y observaciones visuales.
- Fine-tuning para tareas específicas: diseñado como inicialización para adaptación a nuevas tareas o embodiments, requiriendo el esquema de características y estadísticas de normalización del dataset objetivo.

## Casos de uso

- Fine-tuning para tareas de manipulación con Franka: el checkpoint preentrenado sirve como punto de partida para adaptar la política a tareas concretas como recoger y colocar, apilar o ensamblar, usando datasets de demostración de LeRobot.
- Aprendizaje por imitación en entornos industriales: se puede entrenar con demostraciones humanas para automatizar operaciones repetitivas en líneas de montaje, aprovechando la eficiencia del modelo de mundo latente para reducir la latencia de decisión.
- Robótica asistencial en laboratorios: permite desarrollar políticas para robots que asisten en tareas de laboratorio (manejo de muestras, preparación de experimentos) mediante fine-tuning con pocos ejemplos.
- Investigación en modelos de mundo para robótica: sirve como base para estudiar cómo la predicción latente mejora la generalización y la robustez frente a cambios de escena, comparando con enfoques basados en predicción de píxeles.
- Desarrollo de políticas multi-tarea: al ser un modelo preentrenado de propósito general, puede fine-tuning para múltiples tareas simultáneas, siempre que se proporcionen los datos de normalización adecuados.
- Evaluación de arquitecturas VLA eficientes: permite reproducir los experimentos del paper y comparar el rendimiento de LaWAM frente a otros VLA en términos de precisión y latencia, gracias a su integración limpia en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de rendimiento comparativo (MMLU, HumanEval, etc.) ni métricas específicas de robótica (tasa de éxito en tareas, precisión de acciones). El paper original (arXiv:2606.15768) podría contener dichos datos, pero no están accesibles en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.560 millones de parámetros, en FP16 el checkpoint ocupa aproximadamente 5,1 GB; en FP32 serían unos 10,2 GB. Se recomienda al menos 8 GB de VRAM para inferencia en FP16 y 16 GB para entrenamiento con batch pequeño.
- GPU recomendadas: una RTX 3090, RTX 4090, A100 o H100 son suficientes. Para fine-tuning, se recomienda al menos 24 GB de VRAM (RTX 3090/4090) si se usa full fine-tuning; con LoRA podría bastar con 12-16 GB.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama alta (RTX 3080/3090/4090) en FP16, aunque para entrenamiento puede ser ajustado.
- Opciones de despliegue: al estar integrado en LeRobot, se puede ejecutar con el pipeline estándar de LeRobot (PyTorch). No se mencionan integraciones con vLLM, llama.cpp u Ollama, dado que es un modelo de robótica, no un LLM conversacional.
- Latencia y throughput: no disponibles en la información proporcionada. La propuesta del paper sugiere una reducción de latencia frente a modelos que predicen futuros en píxeles, pero no se dan cifras concretas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros VLA en la información proporcionada. Modelos como OpenVLA (7B), RT-2 (55B) o π0 (3B) podrían ser alternativas, pero no se ofrecen datos comparativos de rendimiento, contexto o licencia en los materiales disponibles. La ausencia de benchmarks publicados en este repositorio impide establecer una comparación objetiva.

## Limitaciones y advertencias

- Modelo preentrenado, no listo para producción: requiere fine-tuning con datos específicos de la tarea y del robot antes de su uso real.
- Configuración por defecto limitada al robot Franka de 7 dimensiones: para otros embodiments es necesario proporcionar el esquema de características y las estadísticas de normalización del dataset de destino.
- Dependencia del VLM base Qwen3-VL-2B-Instruct: se descarga automáticamente a menos que se especifique una ruta local, lo que requiere conexión a internet o gestión previa de modelos.
- Sin información sobre sesgos o alucinaciones: al ser un modelo robótico, el riesgo de alucinación se manifiesta en acciones incorrectas o inesperadas; no se han documentado sesgos específicos.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base Qwen3-VL-2B-Instruct tiene su propia licencia (Apache 2.0, según el repositorio de Qwen), que debe verificarse para cumplimiento.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF o AWQ, lo que limita el despliegue en entornos con recursos muy restringidos.

## Enlaces

- Repositorio HuggingFace: [jialei02/lawam-pretrain-lerobot](https://huggingface.co/jialei02/lawam-pretrain-lerobot)
- Checkpoint original: [jialei02/lawam_pretrain](https://huggingface.co/jialei02/lawam_pretrain)
- Paper: [LaWAM: Latent World Action Models for Efficient Dynamics-Aware Robot Policies](https://huggingface.co/papers/2606.15768)
- Página del proyecto: [rlinf.github.io/LaWAM](https://rlinf.github.io/LaWAM/)
- Código fuente: [github.com/RLinf/LaWAM](https://github.com/RLinf/LaWAM)
- Integración LeRobot: [huggingface/lerobot#3999](https://github.com/huggingface/lerobot/pull/3999)
