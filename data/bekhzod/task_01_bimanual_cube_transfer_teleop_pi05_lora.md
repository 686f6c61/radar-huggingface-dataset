# Bekhzod/TASK_01_bimanual_cube_transfer_teleop_pi05_LoRA

## Resumen

Este repositorio contiene una política de visión-lenguaje-acción (VLA) denominada π₀.₅ (Pi05), desarrollada originalmente por Physical Intelligence y adaptada para LeRobot por Hugging Face. El modelo base es `lerobot/pi05_base`, y esta variante concreta ha sido ajustada mediante LoRA por el usuario Bekhzod sobre un conjunto de datos propio de teleoperación bimanual con un robot Fairino. El objetivo del ajuste es una tarea específica: coger un cubo con el brazo derecho, dejarlo en el centro y depositarlo en una caja con el brazo izquierdo.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de fine-tuning de un modelo VLA de propósito general sobre hardware asequible y con un dataset pequeño (75 episodios, 49.128 frames a 30 FPS), lo que ilustra el flujo de trabajo típico de imitación en robótica con LeRobot. Por otro, evidencia las limitaciones de este tipo de publicaciones: el repositorio no incluye resultados de evaluación, no detalla la arquitectura interna del modelo base y su tamaño en disco es de 0.0 GB, lo que sugiere que los pesos LoRA podrían no estar subidos o son extremadamente ligeros.

Es importante subrayar que esta ficha describe una política robótica, no un modelo de lenguaje conversacional. Las secciones habituales sobre generación de texto, tool calling o benchmarks de NLP no aplican aquí; en su lugar se documentan entradas y salidas sensoriales-motoras, configuración de entrenamiento y requisitos de despliegue en un robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot adaptada de OpenPI |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Tipo de ajuste | LoRA (fine-tuning) |
| Tipo de robot | Fairino (bimanual) |
| Cámaras de entrada | `top`, `left`, `right` (3 × 480 × 640, RGB) |
| Estado de observación | vector de 14 dimensiones |
| Acción de salida | vector de 14 dimensiones |
| Tamaño del repositorio | 0.0 GB |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

El modelo es una política VLA π₀.₅, una evolución de π₀ de Physical Intelligence diseñada para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación utilizada aquí proviene de LeRobot, que a su vez adapta el repositorio OpenPI de Physical Intelligence. La arquitectura interna (número de capas, dimensión del transformer, mecanismo de fusión visión-lenguaje-acción) no se detalla en la model card proporcionada, por lo que no es posible especificarla con rigor.

El ajuste se realizó sobre el dataset `Bekhzod/TASK_01_bimanual_cube_transfer_teleop_train`, compuesto por 75 episodios y 49.128 frames capturados a 30 FPS. La configuración de entrenamiento reportada incluye 20.000 pasos, batch size de 32, optimizador AdamW con learning rate 0.001 y semilla 1000. Se trata de un fine-tuning con LoRA sobre el modelo base, lo que reduce el coste computacional y el tamaño de los pesos resultantes, aunque el repositorio indica 0.0 GB, lo que impide verificar si los adaptadores están efectivamente publicados. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación adicional.

## Capacidades

- Control robótico bimanual: genera acciones de 14 dimensiones a partir de observaciones de estado y tres cámaras RGB.
- Manipulación de objetos: la tarea entrenada implica agarre, transporte y colocación de un cubo entre dos brazos.
- Percepción visual multi-cámara: consume simultáneamente vistas superior, izquierda y derecha a 480 × 640.
- Ejecución de instrucciones en lenguaje natural: la tarea se especifica mediante una cadena de texto (`--task="pick up the cube..."`).
- Generalización a entornos nuevos: según la descripción de π₀.₅, el modelo base está diseñado para generalizar a situaciones no vistas, aunque no hay evidencia publicada de que esta variante LoRA conserve esa propiedad.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico ni procesamiento de audio.

## Casos de uso

- Automatización de tareas de pick-and-place bimanual: el modelo ejecuta la secuencia completa de agarre con brazo derecho, reposicionamiento central y depósito con brazo izquierdo, adecuado para líneas de montaje sencillas donde la tarea esté bien delimitada.
- Prototipado rápido de políticas de imitación: con solo 75 episodios y 20.000 pasos de entrenamiento, sirve como plantilla para equipos que quieran validar su pipeline de captura de datos y fine-tuning LoRA antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: permite reproducir el flujo LeRobot + π₀.₅ y comparar el efecto del ajuste LoRA frente al modelo base en una tarea controlada.
- Benchmarking de hardware Fairino: útil para evaluar la repetibilidad y precisión de un robot Fairino en tareas de transferencia de objetos con teleoperación.
- Docencia y formación en robótica: el repositorio incluye comandos de ejecución y entrenamiento que facilitan demostraciones prácticas en cursos de VLA.
- Base para fine-tuning en tareas análogas: al estar bajo Apache 2.0 y partir de `pi05_base`, puede reutilizarse como punto de partida para otras tareas bimanuales con configuración de cámaras similar.
- Validación de infraestructura de inferencia: permite probar `lerobot-rollout` con `--strategy.type=base` en un robot real antes de invertir en datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la nota explícita: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito, número de ensayos ni condiciones experimentales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0.0 GB) impide estimar la huella de los pesos LoRA; el modelo base `pi05_base` no detalla su tamaño en la información proporcionada.
- GPU recomendadas: no disponible. La model card no especifica requisitos de GPU; el comando de entrenamiento usa `--policy.device=cuda` sin más detalle.
- Compatibilidad con GPU de consumo: no confirmada. Dado que se trata de un fine-tuning LoRA, es plausible que el entrenamiento quepa en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento), según la documentación oficial de LeRobot. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. No se reportan tiempos de inferencia ni frecuencia de control efectiva, aunque los datos se capturaron a 30 FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bekhzod/TASK_01_bimanual_cube_transfer_teleop_pi05_LoRA | VLA (LoRA sobre π₀.₅) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | VLA base | no disponible | no disponible | no disponible en la información | Hugging Face |
| π₀ (Physical Intelligence) | VLA | no disponible | no disponible | no disponible en la información | OpenPI |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni ensayos documentados, por lo que se desconoce si la política funciona de forma fiable.
- Tarea única y estrecha: entrenada exclusivamente para "coger el cubo con el brazo derecho, dejarlo en el centro y meterlo en la caja con el brazo izquierdo"; no se espera generalización a otras tareas sin reentrenamiento.
- Dataset pequeño: 75 episodios y 49.128 frames son una base limitada, lo que incrementa el riesgo de sobreajuste y de baja robustez ante variaciones de iluminación, posición de objetos o distractores.
- Dependencia de hardware específico: requiere un robot Fairino y tres cámaras con nombres `top`, `left`, `right`; cualquier cambio en la configuración invalida la política.
- Tamaño del repositorio de 0.0 GB: no se puede confirmar que los pesos LoRA estén efectivamente publicados, lo que compromete la reproducibilidad.
- Idiomas no disponibles: al ser un modelo de control robótico, la instrucción en lenguaje natural se limita a la tarea entrenada; no hay soporte multilingüe documentado.
- Riesgo de alucinación motora: como toda política de imitación, puede ejecutar acciones plausibles pero incorrectas ante observaciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base `pi05_base` de forma independiente.
- Sin información sobre sesgos: no se documentan sesgos de ningún tipo, pero la política hereda las limitaciones del dataset de teleoperación, que refleja una única configuración física y un único operador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bekhzod/TASK_01_bimanual_cube_transfer_teleop_pi05_LoRA
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Bekhzod/TASK_01_bimanual_cube_transfer_teleop_train
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Bekhzod/TASK_01_bimanual_cube_transfer_teleop_train
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
