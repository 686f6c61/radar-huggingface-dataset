# KyraLeeChunWei/Paracetamol_e50_40K_ACT_aug

## Resumen

Paracetamol_e50_40K_ACT_aug es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, por el usuario KyraLeeChunWei. Su propósito es controlar un robot manipulador a partir de observaciones visuales, reproduciendo comportamientos aprendidos de datos de teleoperación.

El modelo tiene 51.678.855 parámetros (aproximadamente 51,7 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Está asociado al dataset Paracetamol_e50 y emplea el sufijo "aug" en el nombre, lo que sugiere algún tipo de aumento de datos durante el entrenamiento, aunque la model card no detalla esta configuración. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante para desarrolladores e investigadores que trabajan en manipulación robótica de bajo coste, especialmente con brazos tipo SO-100/SO-101, ya que LeRobot proporciona un ecosistema completo de entrenamiento, evaluación y despliegue. No obstante, se trata de un modelo muy específico de una única tarea y con escasa documentación pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.678.855 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura combina un codificador visual (habitualmente un ResNet preentrenado) que procesa las imágenes de las cámaras del robot, un codificador de estado que procesa las articulaciones y un decodificador transformer que genera un chunk de acciones futuras de forma conjunta. Predecir secuencias de acciones en lugar de pasos aislados reduce el error de compounding y suaviza el comportamiento del manipulador.

El entrenamiento se realiza sobre el dataset Paracetamol_e50, que contiene episodios de teleoperación de una tarea concreta (presumiblemente relacionada con el manejo de paracetamol). El sufijo "aug" indica que se aplicó aumento de datos, aunque la model card no especifica qué transformaciones se usaron ni el número exacto de episodios, tokens o pasos de entrenamiento. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo; ACT es puramente supervisado sobre demostraciones.

## Capacidades

- Control robótico por imitación: genera chunks de acciones articulares a partir de observaciones visuales y del estado del robot.
- Predicción de acciones multi-paso: emite secuencias cortas de acciones en cada inferencia, lo que mejora la estabilidad frente a políticas paso a paso.
- Procesamiento visual: integra imágenes de cámaras como entrada para guiar la manipulación.
- Ejecución de una tarea específica de manipulación (asociada al dataset Paracetamol_e50).
- Compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No dispone de tool calling, razonamiento multi-step simbólico, capacidades multilingües ni modos de pensamiento: es un modelo puramente motor-visual.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede reproducir una tarea de picking y colocación de objetos (en este caso, relacionados con paracetamol) sobre un brazo SO-100/SO-101, usando el flujo `lerobot-record` con `--policy.path` apuntando al checkpoint.
- Automatización de tareas repetitivas en líneas de montaje de bajo coste: al predecir chunks de acciones, suaviza el movimiento y reduce la latencia de control en brazos de sobremesa.
- Investigación en aprendizaje por imitación: sirve como punto de partida para comparar variantes de ACT, aumento de datos y configuraciones de entrenamiento con LeRobot.
- Prototipado rápido de políticas: con 51,7 millones de parámetros y 0,2 GB de pesos, se puede cargar y ejecutar en GPUs de consumo para iterar sobre nuevas demostraciones.
- Docencia y formación en robótica: ejemplo completo y reproducible de un pipeline de teleoperación, entrenamiento y evaluación con LeRobot.
- Evaluación comparativa de aumento de datos: el sufijo "aug" permite contrastar esta política con variantes sin aumento sobre el mismo dataset, midiendo el impacto en la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para los 51,7 millones de parámetros (los pesos ocupan unos 0,2 GB en safetensors); el codificador visual añade una cantidad moderada adicional.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) como vía principal; también es posible cargar los pesos safetensors con PyTorch directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del hardware, de la resolución de las cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e50_40K_ACT_aug | 51,7 M | no disponible | Manipulación con ACT sobre dataset Paracetamol_e50 | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no disponible | Manipulación bimanual de bajo coste | según implementación | Paper y código de referencia |
| Políticas Diffusion Policy | no disponible | no disponible | Aprendizaje por imitación basado en difusión | según implementación | Repositorios públicos |
| Otras políticas LeRobot (p. ej. TDMPC, VQ-BeT) | variable | no disponible | Control robótico por imitación o RL | variable | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado para una única tarea y un único entorno; no generaliza a otras tareas sin reentrenamiento.
- Documentación mínima: la model card no detalla el dataset, la configuración de aumento de datos, el número de episodios ni las métricas de éxito.
- Sin datos de benchmarks: no es posible verificar su rendimiento frente a alternativas.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios en iluminación, posición de cámara u objetos pueden degradar el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no debe evaluarse con métricas de texto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el entorno real antes de producción.
- Fecha de creación futura en los metadatos (2026-11-03): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Paracetamol_e50_40K_ACT_aug
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e50
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
