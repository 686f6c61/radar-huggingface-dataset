# Lucie-inbolt/Experiment6-Jepav12

## Resumen

El modelo `Lucie-inbolt/Experiment6-Jepav12` es una política robótica de tipo Vision-Language-Action (VLA) entrenada con el framework LeRobot de Hugging Face. Combina un backbone de lenguaje Qwen3-VL con un world model de video autosupervisado (V-JEPA2) y un cabezal de acción basado en un DiT (Diffusion Transformer) con flow matching, según el paper VLA-JEPA (arXiv:2602.10098). Desarrollado por el usuario Lucie-inbolt, presumiblemente vinculado a la empresa Inbolt (especializada en visión 3D para robótica industrial), este modelo está diseñado para controlar un brazo robótico UR10e a partir de tres cámaras (dos exteriores y una de muñeca), ejecutando la tarea concreta de mover el extremo de un stick al centro de un objeto.

El repositorio ocupa 11,9 GB y contiene los pesos en formato safetensors. Se trata de un modelo entrenado específicamente para una tarea de manipulación con un dataset propio de 100 episodios (5911 frames a 15 FPS). No se han publicado métricas de evaluación ni detalles sobre el número total de parámetros, la longitud de contexto o los idiomas soportados, aunque el backbone Qwen3-VL es inherentemente multilingüe. Su relevancia radica en demostrar la aplicación práctica de la arquitectura VLA-JEPA sobre un robot real, integrada en el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA-JEPA (Qwen3-VL + V-JEPA2 + DiT con flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone Qwen3-VL es multilingue, pero no se especifica para este modelo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VLA-JEPA es una arquitectura que integra tres componentes: un modelo de lenguaje y visión Qwen3-VL como backbone, un world model de video autosupervisado V-JEPA2 que captura representaciones temporales y espaciales, y un cabezal de acción basado en un DiT (Diffusion Transformer) que genera acciones mediante flow matching. Esta combinación permite que la política procese observaciones visuales de múltiples cámaras (tres imágenes de 224x224) y produzca un vector de acción de 8 dimensiones para el robot UR10e.

El entrenamiento se realizó con LeRobot versión 0.6.0, sobre un dataset propio (Lucie-inbolt/Experiment6) que contiene 100 episodios de la tarea "Move stick end to the center of the object", con un total de 5911 frames a 15 FPS. La configuración de entrenamiento incluye 15000 pasos, batch size de 4, optimizador AdamW con learning rate 0.001 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de manipulación: genera acciones de 8 dimensiones (posiciones articulares o cartesianas) para un brazo UR10e.
- Percepción visual multi-cámara: procesa tres flujos de imagen (dos exteriores y una de muñeca) a resolución 224x224.
- Ejecución de tareas específicas: entrenado para mover el extremo de un stick al centro de un objeto, con capacidad de generalizar dentro del espacio de estados cubierto por el dataset.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- Aprendizaje por imitación: no requiere ingeniería de recompensas ni modelos de entorno explícitos.
- No incluye capacidades de tool calling, razonamiento multi-paso ni generación de texto; es una política puramente sensoriomotora.

## Casos de uso

- Automatización industrial de precisión: el modelo puede integrarse en una celda robótica con un UR10e para realizar tareas de posicionamiento de herramientas (como alinear un stick con un punto objetivo), reduciendo la necesidad de programación manual de trayectorias.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la eficacia de world models (V-JEPA2) en políticas VLA, permitiendo comparaciones con otros métodos dentro de LeRobot.
- Demostraciones de robótica en laboratorio: ideal para reproducir experimentos de manipulación con visión multi-cámara y validar la arquitectura VLA-JEPA en entornos controlados.
- Fine-tuning para tareas similares: el modelo puede reentrenarse con datasets adicionales (por ejemplo, variaciones de la misma tarea o nuevas posiciones de objetos) usando el comando `lerobot-train`, aprovechando los pesos preentrenados como inicialización.
- Prototipado rápido de soluciones robóticas: al estar empaquetado con LeRobot, permite pasar de datos a política desplegable en pocos comandos, acelerando el desarrollo de pruebas de concepto en entornos académicos o industriales.
- Evaluación de generalización en robótica: el modelo puede usarse para medir la robustez de la arquitectura ante cambios de iluminación, posición de cámara o variaciones del objeto, aunque no se han publicado resultados formales al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No hay datos de MMLU, HumanEval u otras métricas, ya que no es un modelo de lenguaje generalista.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El tamaño del repositorio es de 11,9 GB, lo que sugiere que los pesos en precisión fp32 ocuparían aproximadamente esa cantidad; en fp16 o bf16 la VRAM necesaria rondaría los 6-8 GB, pero no hay confirmación.
- GPU recomendadas: se requiere una GPU NVIDIA con soporte CUDA para ejecutar la inferencia con PyTorch. Dado el tamaño del modelo, una GPU con al menos 12 GB de VRAM (p. ej., RTX 3060, RTX 4070) sería suficiente para inferencia en fp16, aunque para entrenamiento se recomienda una GPU con 24 GB o más (RTX 4090, A100, etc.).
- Compatibilidad con GPUs de consumo: sí, es probable que quepa en GPUs de consumo modernas con 12-24 GB, pero no se ha verificado.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot (PyTorch). No es compatible con vLLM, llama.cpp u Ollama, ya que no es un LLM conversacional. El despliegue se realiza con `lerobot-rollout` sobre un robot UR10e conectado.
- Latencia y throughput: no disponibles. Dependen del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (políticas VLA-JEPA con Qwen3-VL y V-JEPA2) con datos públicos de rendimiento. Otros modelos de LeRobot (como ACT o Diffusion Policy) existen, pero no se dispone de comparativas directas con este modelo.

## Limitaciones y advertencias

- Entrenamiento con dataset muy reducido: solo 100 episodios y 5911 frames, lo que puede provocar sobreajuste y baja generalización ante variaciones no vistas (iluminación, posiciones de objetos, distracciones).
- Tarea específica: el modelo solo está entrenado para la tarea "Move stick end to the center of the object"; no es una política generalista.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que su rendimiento real es desconocido.
- Riesgo de alucinación sensoriomotora: al ser un modelo generativo de acciones, puede producir comandos no seguros si las observaciones se alejan de la distribución de entrenamiento; se recomienda supervisión humana y mecanismos de parada de emergencia.
- Dependencia de calibración de cámaras: las observaciones requieren que las cámaras estén configuradas exactamente con los mismos nombres y posiciones relativas que en el entrenamiento; cualquier cambio puede degradar el rendimiento.
- Sin soporte para otros robots: los pesos están ajustados para UR10e; usarlos en otro brazo requeriría reentrenamiento o adaptación.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de la seguridad en aplicaciones industriales.
- No hay información sobre cuantización ni despliegue en edge computing; el modelo está pensado para ejecutarse en una GPU con PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucie-inbolt/Experiment6-Jepav12
- Dataset de entrenamiento: https://huggingface.co/datasets/Lucie-inbolt/Experiment6
- Paper VLA-JEPA: https://arxiv.org/abs/2602.10098
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de vla_jepa en LeRobot: https://huggingface.co/docs/lerobot/main/en/vla_jepa
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
