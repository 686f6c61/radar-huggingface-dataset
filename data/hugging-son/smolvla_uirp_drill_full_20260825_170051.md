# hugging-son/smolvla_uirp_drill_full_20260825_170051

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico con eficiencia computacional y despliegue en hardware de consumo. Este repositorio concreto (`hugging-son/smolvla_uirp_drill_full_20260825_170051`) es un ajuste fino (fine-tune) de la base `lerobot/smolvla_base` sobre un conjunto de datos de robótica odontológica, con el objetivo de controlar un robot tipo `so_follower` para tareas de perforación dental guiadas por instrucciones en lenguaje natural.

El modelo cuenta con 450 millones de parámetros y se distribuye bajo licencia Apache-2.0, con pesos en formato `safetensors` y un tamaño de repositorio de 0,9 GB. Está entrenado para procesar tres vistas de cámara (superior, muñeca y lateral), el estado del robot (6 dimensiones) y generar acciones de 6 grados de libertad. La relevancia actual de este modelo radica en su demostración práctica de cómo un VLA compacto puede adaptarse a tareas de manipulación fina en entornos clínicos simulados, manteniendo la portabilidad a GPU de consumo.

El modelo se ha entrenado con 164 episodios y 70.155 fotogramas a 25 FPS, con 30.000 pasos de entrenamiento y una tasa de aprendizaje de 1e-5. Aunque no se han publicado resultados de evaluación en el robot real, la configuración técnica y el enfoque en la eficiencia hacen de SmolVLA un candidato viable para investigación y prototipado en robótica asistencial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual con un modelo de lenguaje ligero para generar acciones robóticas condicionadas por instrucciones en lenguaje natural y observaciones multimodales. El modelo base `lerobot/smolvla_base` fue preentrenado en tareas genéricas de robótica, y este ajuste fino adapta sus pesos al dominio específico de perforación dental simulada.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `hugging-son/uirp_drill_task_20260821_173606_filtered`, que contiene 164 episodios de demostración con 70.155 fotogramas a 25 FPS. Se usó el optimizador AdamW con una tasa de aprendizaje de 1e-5, tamaño de lote de 2 y semilla 1000, durante 30.000 pasos. Las tareas definidas incluyen mover la punta del taladro a cuatro molares específicos (inferior derecho, superior derecho, superior izquierdo e inferior izquierdo). No se especifica el uso de técnicas adicionales como RLHF o DPO en este ajuste.

## Capacidades

- **Control robótico de precisión**: genera acciones de 6 grados de libertad a partir de observaciones de estado y visión, adaptadas a la tarea de perforación.
- **Percepción multi-cámara**: procesa simultáneamente tres vistas de cámara (superior, muñeca y lateral) con resolución 256×256.
- **Seguimiento de instrucciones en lenguaje natural**: las tareas se describen mediante frases como "move drill tip to lower right molar", lo que permite condicionar el comportamiento del robot.
- **Integración con LeRobot**: funciona dentro del ecosistema LeRobot, facilitando su uso con robots compatibles y flujos de entrenamiento/inferencia estándar.
- **Eficiencia computacional**: al ser un modelo compacto (450M parámetros), puede ejecutarse en hardware de consumo, según el diseño original de SmolVLA.
- **Entrenamiento por imitación**: el modelo se ha ajustado mediante aprendizaje por imitación a partir de demostraciones humanas, sin necesidad de refuerzo adicional.

## Casos de uso

- **Simulación de procedimientos dentales**: el modelo puede controlar un robot simulado para practicar la perforación de molares, lo que permite entrenar a estudiantes de odontología en un entorno virtual sin riesgo para pacientes.
- **Automatización de tareas de precisión en laboratorio**: su capacidad para mover herramientas con precisión (6 DOF) puede adaptarse a tareas de laboratorio que requieren manipulación fina, como la preparación de muestras o la dispensación de líquidos.
- **Investigación en aprendizaje por imitación**: sirve como ejemplo de cómo un VLA base se adapta a un dominio específico con un dataset pequeño (164 episodios), útil para estudiar técnicas de fine-tuning en robótica.
- **Desarrollo de asistentes robóticos quirúrgicos**: aunque es una simulación, el modelo puede ser la base para investigar la automatización de procedimientos quirúrgicos de baja invasividad, donde la precisión es crítica.
- **Entrenamiento de modelos de control multimodal**: su arquitectura multi-cámara y de instrucciones en lenguaje es útil para experimentar con la fusión de información visual y textual en sistemas de control.
- **Evaluación de políticas en hardware de consumo**: al ser un modelo ligero, se puede desplegar en GPU como RTX 4090 para probar políticas de control en tiempo real, acelerando el ciclo de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como éxito de tarea, tasa de acierto o comparaciones con otros modelos en este contexto específico.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. Dado el tamaño de 450M parámetros, es plausible que quepa en GPUs con 8 GB o más, pero no se puede confirmar sin datos oficiales.
- **GPU recomendadas**: no se especifica, pero por el diseño de SmolVLA se orienta a GPUs de consumo como la RTX 3090 o RTX 4090. También es compatible con GPUs de datacenter (A100, H100) para entrenamiento o inferencia a mayor escala.
- **Despliegue**: el modelo se integra con LeRobot, que ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). No se menciona compatibilidad directa con vLLM o llama.cpp, pero el formato safetensors es estándar para frameworks como PyTorch.
- **Latencia y throughput**: no disponibles. La inferencia en tiempo real dependerá de la GPU y de la resolución de las cámaras (256×256), que es relativamente baja.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Se puede indicar que este modelo es un ajuste fino de `lerobot/smolvla_base`, por lo que su rendimiento en tareas genéricas de robótica debería ser similar al de SmolVLA base, pero adaptado a la tarea de perforación. No se mencionan modelos alternativos como OpenVLA o RT-2 en los datos disponibles.

## Limitaciones y advertencias

- **Evaluación pendiente**: no se ha realizado una evaluación en el robot real, por lo que el rendimiento real en tareas de perforación no está validado.
- **Dataset específico**: el modelo está entrenado para una tarea muy concreta (perforación dental simulada) y puede no generalizar a otras tareas robóticas sin un nuevo fine-tuning.
- **Sesgos del dataset**: el dataset tiene solo 164 episodios, lo que limita la robustez frente a variaciones de iluminación, posiciones de objetos o condiciones de entorno no vistas.
- **Riesgo de alucinación de acciones**: como modelo de aprendizaje por imitación, puede generar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero es necesario verificar los términos de la licencia de los datos de entrenamiento (no se indica en la información).
- **Idiomas**: no se especifican idiomas soportados, pero las instrucciones están en inglés; el modelo no ha sido probado para otras idiomas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hugging-son/smolvla_uirp_drill_full_20260825_170051
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentación de LeRobot para SmolVLA: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Dataset de entrenamiento: https://huggingface.co/datasets/hugging-son/uirp_drill_task_20260821_173606_filtered
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hugging-son/uirp_drill_task_20260821_173606_filtered
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Ejemplo de uso de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/examples/tutorial/smolvla/using_smolvla_example.py
