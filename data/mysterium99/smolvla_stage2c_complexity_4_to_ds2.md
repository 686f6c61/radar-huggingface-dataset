# mysterium99/smolvla_stage2c_complexity_4_to_ds2

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, orientado a control robótico mediante imitación. Esta ficha concreta, `mysterium99/smolvla_stage2c_complexity_4_to_ds2`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el conjunto de datos `ds2`, que contiene 50 episodios y 110.961 fotogramas a 30 FPS de una tarea de manipulación concreta: "put nuts in red cup and bolts in blue bucket". El modelo consume el estado del robot (6 dimensiones) y tres cámaras RGB de 256x256 píxeles, y produce un vector de acción de 6 dimensiones.

Con 450.046.176 parámetros (aproximadamente 450 M), SmolVLA se sitúa en la categoría de políticas ligeras que pueden ejecutarse en hardware de consumo, a diferencia de los VLA de gran escala que requieren GPUs de centro de datos. La relevancia actual del modelo radica en que demuestra que es posible obtener políticas de manipulación razonables con presupuestos computacionales reducidos, lo que facilita el despliegue en robots de bajo coste y la experimentación académica.

Esta variante específica ha sido entrenada durante 20.000 pasos con un batch size de 8, optimizador AdamW y una tasa de aprendizaje de 0,0001, usando LeRobot 0.6.1. No se han publicado resultados de evaluación en la información disponible, por lo que su rendimiento real en la tarea debe validarse empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en el método SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo recibe instrucciones de tarea en inglés en los ejemplos de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones en un único transformer compacto. El modelo procesa tres flujos de imagen de 256x256 píxeles junto con el estado propioceptivo del robot (6 dimensiones) y una instrucción de tarea en lenguaje natural, y emite acciones de 6 dimensiones. La model card no detalla la composición interna exacta de los componentes (tipo de vision encoder, número de capas, mecanismo de atención), por lo que esos datos deben consultarse en el paper de SmolVLA (arXiv:2506.01844).

El entrenamiento de esta variante se realizó por fine-tuning del checkpoint `lerobot/smolvla_base` sobre el dataset `ds2`, con 50 episodios y 110.961 fotogramas a 30 FPS. La configuración reportada incluye 20.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 0,0001, semilla 0 y LeRobot 0.6.1. No se especifica en la información disponible si hubo fases de RLHF, DPO u otras técnicas de alineación, ni el número total de tokens o muestras vistas durante el preentrenamiento del modelo base.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: procesa simultáneamente tres cámaras (`gripper`, `newtop`, `newside`) con resolución de 256x256.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto ("put nuts in red cup and bolts in blue bucket").
- Ejecución de tareas de manipulación de precisión: clasificación y colocación de piezas (tuercas y tornillos) en recipientes diferenciados por color.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros permite inferencia en GPUs de gama media.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking; estas capacidades no aplican a un modelo de política robótica.

## Casos de uso

- Automatización de clasificación de piezas en línea de montaje: el modelo puede ejecutar la tarea de separar tuercas y tornillos en recipientes codificados por color, usando las tres cámaras para localizar cada pieza y el estado del gripper para verificar la sujeción. Es adecuado porque ha sido entrenado específicamente sobre esa tarea con 110.961 fotogramas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del fine-tuning sobre un VLA compacto, comparando esta variante (20.000 pasos) con el modelo base y otras configuraciones del mismo autor.
- Prototipado rápido de políticas robóticas: gracias a sus 450 M de parámetros y al formato safetensors, puede cargarse en una estación de trabajo con GPU consumer para validar la tarea antes de escalar a un modelo mayor.
- Docencia y formación en robótica: el flujo completo (grabación de datos con LeRobot, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) es reproducible con hardware de bajo coste y sirve para enseñar el ciclo completo de un sistema VLA.
- Benchmark de referencia para manipulación con múltiples cámaras: permite evaluar cómo afecta la fusión de tres vistas (gripper, cenital y lateral) frente a configuraciones de una o dos cámaras en tareas de precisión.
- Despliegue en robots de bajo coste tipo `follow`: la model card documenta explícitamente el tipo de robot `follow`, lo que facilita la replicación en plataformas similares sin necesidad de reentrenar desde cero.
- Base para fine-tuning en tareas similares de picking-and-placing: al estar licenciado bajo Apache 2.0, puede adaptarse a nuevas tareas de clasificación de objetos con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, métricas de precisión de agarre ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,8 GB; en FP16, unos 0,9 GB. A ello hay que sumar el coste de procesar tres imágenes de 256x256 y el estado del robot, por lo que se recomienda un mínimo de 4-6 GB de VRAM para operar con margen.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar funcionamiento en GPUs consumer como RTX 3060, RTX 4060, RTX 4070 o superiores; también en A100/H100 si se busca máximo throughput, aunque no es necesario para este tamaño.
- ¿Cabe en GPU consumer? Sí, por el número de parámetros (450 M) es plausible en GPUs consumer con al menos 6 GB de VRAM, aunque la model card no lo confirma explícitamente.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de política robótica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/smolvla_stage2c_complexity_4_to_ds2` | 450 M | no disponible | Manipulación robótica (tuercas/tornillos) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la información proporcionada | no disponible | VLA base para fine-tuning | Apache 2.0 (según repo base) | Hugging Face |
| Políticas VLA de gran escala (p. ej. familias tipo OpenVLA) | no disponible en la información proporcionada | no disponible | Manipulación general | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado métricas de rendimiento para esta variante ni se dispone de cifras del modelo base en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que el rendimiento es desconocido hasta que se pruebe.
- Especialización estrecha: entrenado únicamente para la tarea "put nuts in red cup and bolts in blue bucket" sobre 50 episodios; no generalizará a otras tareas sin fine-tuning adicional.
- Dependencia de la configuración de cámaras: espera exactamente tres cámaras con los nombres `gripper`, `newtop` y `newside`, y resoluciones de 256x256; cambios en la disposición o iluminación pueden degradar el comportamiento.
- Dependencia del robot: diseñado para el tipo `follow`; usarlo en otra plataforma requiere recalibración y probablemente reentrenamiento.
- Riesgo de sobreajuste: con solo 50 episodios y 20.000 pasos de entrenamiento, es plausible que la política memorice posiciones y no generalice a nuevas colocaciones de objetos.
- Sesgos: no documentados; al ser un modelo robótico, los sesgos relevantes serían de distribución de datos (posiciones, colores, tipos de pieza) más que sociales.
- Alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la ejecución de acciones incorrectas o inseguras ante observaciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; para producción deben añadirse pruebas de seguridad física del robot.
- Idiomas: la instrucción de tarea se proporciona en inglés en los ejemplos; no se documenta soporte multilingüe.
- Fecha de creación futura (2026-11-06): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_4_to_ds2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset `ds2`: https://huggingface.co/datasets/ds2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds2
