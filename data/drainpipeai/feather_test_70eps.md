# DrainpipeAI/feather_test_70eps

## Resumen

feather_test_70eps es una política de visión-lenguaje-acción (VLA) publicada por DrainpipeAI en HuggingFace, obtenida mediante ajuste fino del modelo base lerobot/pi05_base. π₀.₅ (Pi05) es la evolución del modelo π₀ de Physical Intelligence, disenada para generalizar a entornos y situaciones no vistos durante el entrenamiento. El modelo se distribuye a través de la librería LeRobot y está orientado a control robótico de imitación.

El modelo consume observaciones multimodales (estado articular de 8 dimensiones y tres cámaras RGB de 400x640) y produce un vector de acción de 8 dimensiones. Con 4.143.404.816 parámetros, es un modelo de gran tamano para el dominio robótico, lo que refleja la componente de modelo de lenguaje y visión subyacente en la arquitectura VLA. El repositorio ocupa 9,4 GB en formato safetensors.

Este ajuste concreto está especializado en una única tarea: "Pick up the jar and place it in the box" (coger el tarro y colocarlo en la caja), entrenado sobre el dataset DrainpipeAI/testing_feather_70eps con 68 episodios y 26.661 frames a 30 FPS. Es relevante como ejemplo de flujo de trabajo completo de LeRobot para ajustar políticas VLA a robots específicos (tipo feather_follower) y tareas concretas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | feather_follower |
| Entradas | observation.state (8,), observation.images.top (3,400,640), observation.images.right_wrist (3,400,640), observation.images.left_wrist (3,400,640) |
| Salidas | action (8,) |
| Dataset de entrenamiento | DrainpipeAI/testing_feather_70eps (68 episodios, 26.661 frames, 30 FPS) |
| Pasos de entrenamiento | 10.000 |
| Batch size | 4 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de π₀.₅ (Pi05), un modelo VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos nuevos. La implementación utilizada procede del repositorio OpenPI adaptado a LeRobot. La arquitectura combina percepción visual (tres cámaras), estado propioceptivo del robot y generación de acciones motoras, si bien la model card no detalla la composición interna de capas, el mecanismo de atención ni el esquema de fusión multimodal.

El entrenamiento se realizó por imitación supervisada sobre el dataset DrainpipeAI/testing_feather_70eps: 68 episodios, 26.661 frames a 30 FPS, una única tarea ("Pick up the jar and place it in the box"). Se ejecutaron 10.000 pasos con batch size 4, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, usando LeRobot 0.6.2. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de la tarea, ni si hubo etapas de RLHF o DPO (poco habituales en políticas de imitación robótica).

## Capacidades

- Control robótico de imitación para una tarea concreta de manipulación (coger un tarro y colocarlo en una caja).
- Percepción visual multimodal mediante tres cámaras (superior, muñeca derecha, muñeca izquierda) a resolución 400x640.
- Fusión de estado propioceptivo de 8 dimensiones con entrada visual para generar acciones de 8 dimensiones.
- Generalización de mundo abierto heredada del modelo base π₀.₅, orientada a entornos no vistos durante el entrenamiento (si bien el ajuste específico está especializado en una tarea).
- Ejecución en bucle cerrado sobre robot físico tipo feather_follower mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general ni procesamiento de audio.
- Capacidades multilingües: no disponibles (modelo de robótica, no de texto).

## Casos de uso

- Automatización de picking y placing en laboratorio: el modelo ejecuta la tarea "coger el tarro y colocarlo en la caja" sobre un robot feather_follower, adecuado para validar pipelines de imitación en entornos controlados.
- Prototipado de políticas VLA con LeRobot: sirve como referencia de ajuste fino de π₀.₅ sobre un dataset propio, útil para equipos que quieran replicar el flujo `lerobot-train` → `lerobot-rollout`.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de una política VLA de 4,1 mil millones de parámetros entrenada con solo 68 episodios y 10.000 pasos.
- Evaluación de generalización visual: al disponer de tres cámaras (top, right_wrist, left_wrist), es útil para analizar cómo afecta la configuración de sensores al éxito de la tarea.
- Banco de pruebas de hardware robótico: integrable en pruebas de calibración y repetibilidad del robot feather_follower antes de desplegar políticas más complejas.
- Base para ajustes posteriores: al derivar de lerobot/pi05_base con licencia Apache 2.0, puede reutilizarse como punto de partida para nuevas tareas de manipulación.
- Docencia y demostraciones: ejemplo reproducible de entrenamiento de una política VLA de extremo a extremo con LeRobot 0.6.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas de robótica (success rate) para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 4,14 mil millones de parámetros en safetensors y un repositorio de 9,4 GB, la inferencia en precisión completa requiere del orden de decenas de GB, aunque no se confirma el dato.
- GPU recomendadas: no disponibles explícitamente; por tamano del modelo, cabría esperar GPUs de clase profesional (A100, H100) o consumer de gama alta, pero no se especifica.
- ¿Cabe en GPU consumer?: no confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento), con soporte de dispositivo CUDA (`--policy.device=cuda`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DrainpipeAI/feather_test_70eps | 4.143.404.816 | no disponible | Manipulación (pick & place) | apache-2.0 | HuggingFace (LeRobot) |
| lerobot/pi05_base | no disponible | no disponible | VLA base de propósito general | no disponible en la información | HuggingFace (LeRobot) |
| π₀ (Pi0) | no disponible | no disponible | VLA de propósito general | no disponible en la información | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Pick up the jar and place it in the box"); no se espera un rendimiento fiable fuera de ella.
- Dataset muy reducido: 68 episodios y 26.661 frames, lo que limita la robustez ante variaciones de iluminación, posiciones de objetos o distractores.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real reportadas, por lo que el rendimiento real es desconocido.
- Dependencia del hardware: requiere un robot feather_follower con la configuración exacta de cámaras (top, right_wrist, left_wrist) y nombres de observación coincidentes.
- Riesgo de sobreajuste al entorno de grabación: la generalización de mundo abierto de π₀.₅ puede verse atenuada por el ajuste fino sobre pocos episodios.
- Idiomas: no aplica como modelo de texto; no se documentan capacidades lingüísticas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base lerobot/pi05_base y de las dependencias de LeRobot/OpenPI.
- Advertencia de producción: al no existir benchmarks ni evaluación, no se recomienda su despliegue en entornos críticos sin validación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DrainpipeAI/feather_test_70eps
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/DrainpipeAI/testing_feather_70eps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=DrainpipeAI/testing_feather_70eps
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
