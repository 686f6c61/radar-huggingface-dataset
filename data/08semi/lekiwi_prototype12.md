# 08semi/lekiwi_prototype12

## Resumen

`08semi/lekiwi_prototype12` es una política de aprendizaje por imitación entrenada con el método ACT (Action Chunking with Transformers) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje, sino un controlador robótico que consume el estado articular y dos flujos de vídeo (cámara frontal y cámara de muñeca) y emite vectores de acción de 9 dimensiones para un robot de tipo `lekiwi_client`. El autor, `08semi`, lo ha entrenado sobre un dataset propio de 60 episodios y 19.800 fotogramas grabados a 30 FPS.

El modelo tiene 51.674.761 parámetros en formato safetensors y un repositorio de 1,2 GB. La relevancia de esta ficha es doble: por un lado, documenta un caso real de ACT aplicado a un robot móvil de bajo coste (LeKiwi); por otro, sirve de ejemplo de los artefactos que se están publicando en el ecosistema LeRobot, donde el modelo deja de ser un chat y pasa a ser una política que se ejecuta en bucle cerrado sobre hardware físico.

Conviene subrayar que se trata de un prototipo: no hay resultados de evaluación en robot real, la licencia no está declarada y la descripción de la tarea es un marcador de posición ("My task description"). Cualquier uso en producción exige validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.674.761 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se pasa como texto a la política) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repositorio LeRobot, 1,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de imitación supervisada que predice secuencias cortas de acciones (chunks) en lugar de un único paso, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución en bucle cerrado. La política combina un codificador visual (procesa las imágenes de las cámaras `front` y `wrist`), un codificador del estado articular de 9 dimensiones y un decodificador transformer que genera el vector de acción de 9 dimensiones. El paper de referencia es *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705).

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `08semi/dataset_merged_tika0_5`: 60 episodios, 19.800 fotogramas a 30 FPS, con observaciones `observation.state` (9,), `observation.images.front` (3, 480, 640) y `observation.images.wrist` (3, 640, 480). La configuración reportada es de 24.750 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan aumentos de datos, normalización ni técnicas de regularización adicionales, ni fases de RLHF/DPO (no aplicables a este tipo de política).

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 9 dimensiones para un robot LeKiwi a partir de estado articular y dos cámaras.
- Percepción visual multimodal: integra simultáneamente una vista frontal y una vista de muñeca con resoluciones nativas de 640x480.
- Predicción por chunks de acciones: emite bloques de acciones en lugar de pasos individuales, lo que mejora la estabilidad de la ejecución.
- Ejecución en bucle cerrado: la política se reejecuta con nuevas observaciones, permitiendo corrección ante desviaciones.
- Condicionamiento por instrucción textual: acepta un campo `task` en tiempo de inferencia, aunque el dataset de entrenamiento solo contiene la cadena genérica "My task description".
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto libre: no es un LLM.

## Casos de uso

- Manipulación móvil de bajo coste: desplegar una política ACT sobre un LeKiwi para tareas de recogida y colocación en entornos de laboratorio, aprovechando la ventana de dos cámaras para cubrir tanto el punto de agarre como el contexto frontal.
- Prototipado rápido de políticas de imitación: usar este repositorio como plantilla para validar el pipeline `lerobot-train` → `lerobot-rollout` antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: servir de baseline reproducible con hiperparámetros documentados (24.750 pasos, lr 1e-5, batch 8) para comparar variantes de ACT.
- Docencia y formación en robótica: demostrar el ciclo completo de teleoperación, grabación de episodios y entrenamiento de una política en hardware asequible.
- Reentrenamiento con datos propios: partir de la configuración y estructura de observaciones para adaptar la política a una tarea concreta con un nuevo dataset.
- Evaluación de robustez visual: analizar cómo se comporta la política ante cambios de iluminación, posiciones de objetos o distracciones, dado que el dataset original es reducido (60 episodios).
- Integración en pipelines de investigación con simulación previa: validar la política en un gemelo digital antes de ejecutarla en el robot físico, reduciendo el desgaste del hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella real es la latencia de las cámaras y del robot, no el cómputo del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna, e incluso podría ejecutarse en CPU para pruebas de baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) sobre PyTorch; no se documentan exportaciones a ONNX, TensorRT ni llama.cpp (no aplicable).
- Latencia y throughput estimados: no disponibles; dependen del robot, de la frecuencia de las cámaras (30 FPS en el dataset) y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 08semi/lekiwi_prototype12 | 51,7 M | ACT (LeRobot) | Estado (9,) + 2 cámaras 640x480 | no disponible | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot (p. ej. `lerobot/act_aloha_*`) | del orden de decenas de millones | ACT | Estado + cámaras según robot | normalmente Apache-2.0 (verificar cada repo) | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | variable | Diffusion Policy | Estado + cámaras | según repo | Hugging Face Hub |
| Políticas π0 / π0.5 (Physical Intelligence) | miles de millones | VLA | Estado + cámaras + instrucción | según repo | Hugging Face Hub |

La comparación con modelos VLA de gran escala no es directa: este modelo está especializado en un robot y una tarea concretos, mientras que los VLA generalizan a múltiples tareas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tabla de éxito en robot real, por lo que se desconoce la tasa de acierto de la política.
- Dataset muy reducido: 60 episodios y 19.800 fotogramas son insuficientes para generalizar a variaciones de posición, iluminación o distractores.
- Descripción de tarea genérica: el campo `task` del dataset es "My task description", lo que limita el condicionamiento por lenguaje y puede confundir al operador.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Especialización cerrada: la política está entrenada para el robot `lekiwi_client` con 9 dimensiones de acción y dos cámaras concretas; no es portable a otro hardware sin reentrenamiento.
- Riesgo de sobreajuste al entorno de grabación: cambios en la cámara, la mesa o el objeto pueden degradar el comportamiento de forma abrupta.
- Sin información sobre sesgos: al no ser un modelo lingüístico, los sesgos relevantes serían los del dataset de teleoperación (posiciones, objetos y demos humanas), no documentados.
- Fecha de creación futura en el Hub (2026-11-26): conviene verificar la integridad del repositorio y la autoría antes de confiar en él.
- Sin garantías de seguridad física: al ejecutarse sobre un robot real, deben implementarse paradas de emergencia y límites de par externos a la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/08semi/lekiwi_prototype12
- Dataset de entrenamiento: https://huggingface.co/datasets/08semi/dataset_merged_tika0_5
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=08semi/dataset_merged_tika0_5
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
