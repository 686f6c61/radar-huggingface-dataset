# FrancescoRivieccio28/act_so101_cube_grasp

## Resumen

`FrancescoRivieccio28/act_so101_cube_grasp` es una política de robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario FrancescoRivieccio28 en Hugging Face y entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que, a partir de un estado de articulaciones de 6 dimensiones y una imagen RGB de 480x640, predice directamente una acción de 6 dimensiones para el brazo robótico SO-101. Su única tarea declarada es «Pick up the cube and place it on the orange target» (coger el cubo y dejarlo sobre el objetivo naranja).

El modelo tiene 51.668.614 parámetros reales (según los pesos en safetensors) y se distribuye bajo licencia Apache 2.0, con lo que su uso comercial está permitido sin restricciones adicionales. Se entrenó durante 20.000 pasos con batch de 50, optimizador AdamW y tasa de aprendizaje 1e-5 sobre un conjunto de 64 episodios y 25.938 frames a 30 FPS, teleoperados sobre un SO-101.

Su relevancia actual es la de los modelos robóticos pequeños y específicos: 51,7 M de parámetros que caben de sobra en una GPU de consumo o incluso en una Jetson, y que ilustran el flujo completo de LeRobot (grabar datos, entrenar con ACT, desplegar con `lerobot-rollout`). Es un ejemplo de política de imitación de bajo coste, reproducible y orientada a un hardware concreto, no un modelo generalista. El autor no ha publicado resultados de evaluación en el robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual, encoder de estado y decodificador de acciones con CVAE (arXiv:2304.13705) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Ventana de observación basada en el historial de estados e imágenes configurado en LeRobot y horizonte de predicción de acciones (chunk), no disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible en la información proporcionada; los pesos se publican en precisión de entrenamiento (safetensors) |
| Idiomas soportados | No aplica como modelo multilingüe. La política acepta una instrucción de tarea en inglés («Pick up the cube and place it on the orange target») |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot; tamaño del repo: 46,5 GB, incluyendo checkpoints) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.camera` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

| Parametro de despliegue | Valor |
|---|---|
| Tipo de robot | `so101` |
| Camaras | 1 (`camera`) |
| Frecuencia de control esperada | 30 FPS (la del dataset de entrenamiento) |
| Version de LeRobot | 0.6.2 |
| Descargas / likes en el Hub | 40 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (chunks) en lugar de un único paso, lo que reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación fina. La implementación de LeRobot combina un encoder visual (procesa la imagen de la cámara), un encoder del estado de las articulaciones y un decodificador que genera la secuencia de acciones; el componente CVAE (autoencoder variacional condicional) modela la variabilidad de las demostraciones humanas durante el entrenamiento. La política es puramente reactiva: no hay planificación explícita ni condicionamiento por lenguaje más allá de la cadena de tarea declarada.

El entrenamiento se realizó sobre el dataset `FrancescoRivieccio28/lerobot_so101_cube_grasp_fixed`, con 64 episodios, 25.938 frames y 30 FPS de datos teleoperados, todos ellos de la misma tarea de pick-and-place. La configuración declarada es: 20.000 pasos de entrenamiento, batch size 50, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. El modelo card no documenta aumentos de datos, mezcla de datasets, RLHF/DPO (no aplicables en este paradigma) ni innovaciones adicionales sobre ACT estándar. No se especifica el número total de tokens ni de muestras vistas más allá de lo deducible de los pasos y el batch.

## Capacidades

- Generación de acciones de manipulación de 6 grados de libertad para un brazo SO-101 a partir de una observación de estado (6,) y una imagen RGB (3, 480, 640).
- Ejecución de una tarea única de pick-and-place: coger un cubo y depositarlo sobre un objetivo naranja.
- Control continuo en bucle cerrado a la frecuencia de los datos de entrenamiento (30 FPS), con predicción de chunks de acción.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni simulador.
- Integración nativa con el ecosistema LeRobot: carga con `lerobot-rollout` y `policy.path`, y reentrenamiento con `lerobot-train --policy.type=act`.
- Reutilización como inicialización para fine-tuning en tareas nuevas sobre el mismo robot.
- No dispone de tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de capacidades de agente, razonamiento multi-paso simbólico ni planificación de tareas.
- No dispone de capacidades multilingües, de visión general (captioning, VQA, detección abierta) ni de audio.
- No dispone de modo «thinking» ni de decodificación especulativa.

## Casos de uso

- Pick-and-place de laboratorio: la política ejecuta directamente la tarea de coger el cubo y soltarlo en el objetivo naranja sobre un SO-101 real, usando el comando `lerobot-rollout` con la instrucción de tarea fija. Es su caso de uso literal y el único validado por el autor.
- Base de referencia (baseline) para comparativas: al ser un ACT de 51,7 M de parámetros entrenado con 64 episodios, sirve para medir la mejora de variantes como Diffusion Policy o políticas condicionadas por lenguaje sobre el mismo dataset y hardware.
- Fine-tuning con nuevos objetos o posiciones: partiendo de estos pesos, se puede reentrenar con un dataset ampliado (más episodios, nuevos colores de cubo o posiciones del objetivo) usando `lerobot-train --policy.type=act`, reduciendo el número de pasos necesario respecto a un entrenamiento desde cero.
- Recolección de datos teleoperados y aumento de dataset: el modelo puede usarse para evaluar la calidad de un dataset recién grabado; si la política falla de forma sistemática, indica zonas de la distribución de estados con datos insuficientes.
- Transferencia simulación-a-realidad: los repositorios públicos de la comunidad (`tactino/so101-grasp-cube`, `Gotham-Zolio/so101-grasp-cube`) usan flujos de conversión ManiSkill-a-LeRobot y evaluación en simulación y robot real; esta política encaja como punto de partida o de comparación en ese pipeline.
- Docencia y formación en robótica de bajo coste: el SO-101 y LeRobot permiten montar un laboratorio completo donde los alumnos graban episodios, entrenan un ACT de 51,7 M de parámetros y lo despliegan en hardware real.
- Inferencia en el borde (edge): al ocupar unas pocas centenas de MB en memoria, la política puede ejecutarse en un equipo con GPU modesta o en una Jetson junto al brazo, sin depender de la nube, lo que reduce la latencia de control.
- Pruebas de robustez controladas: variando iluminación, posición del cubo o añadiendo distractores se puede caracterizar la sensibilidad de una política ACT entrenada con pocos datos, aunque el autor no haya publicado esa evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card incluye explícitamente la frase «No evaluation results have been provided for this policy yet», por lo que se desconoce la tasa de éxito en el robot real (número de intentos, éxitos y condiciones de prueba). Tampoco se proporcionan métricas de pérdida de entrenamiento, curvas de validación ni comparaciones con otras políticas sobre el mismo dataset.

El artículo de referencia de ACT (arXiv:2304.13705) reporta tasas de éxito en tareas de manipulación bimanual con hardware de bajo coste, pero los valores concretos no forman parte de la información proporcionada y no deben atribuirse a este checkpoint en particular.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 (207 MB de pesos) y aproximadamente 0,1 GB en fp16 (103 MB). Con activaciones del encoder visual y buffers de inferencia, es razonable reservar entre 1 y 2 GB de VRAM para trabajar con margen y lotes pequeños.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una GTX 1650 o RTX 3050 hasta una RTX 4090, A100 o H100. El modelo es tan pequeño que la GPU no será el cuello de botella; lo será la adquisición de imagen y el bucle de control.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos años, e incluso en iGPU o CPU (con latencia mayor y riesgo de no alcanzar los 30 FPS).
- Alternativas embebidas: Jetson Orin Nano, Orin NX o AGX Orin son adecuadas para ejecutar la política junto al brazo y las cámaras.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Almacenamiento: el repositorio ocupa 46,5 GB, presumiblemente por los checkpoints intermedios de los 20.000 pasos de entrenamiento; conviene prever espacio en disco si se descarga completo.
- Latencia y throughput: no disponibles. El requisito operativo derivado del dataset es mantener el bucle de control a 30 FPS (33 ms por paso), lo que exige que la inferencia más la lectura de cámara quepan en ese presupuesto.
- Nota sobre cámaras: el model card declara una sola cámara (`camera`) como entrada, pero el ejemplo de `lerobot-rollout` de la plantilla muestra dos cámaras. Los nombres y el número de cámaras deben coincidir exactamente con las claves de observación del entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `FrancescoRivieccio28/act_so101_cube_grasp` | ACT (imitación) | 51.668.614 | Estado (6,) + imagen 3x480x640 | Apache 2.0 | Hugging Face, 40 descargas |
| `FrancescoRivieccio28/act_so101_cube_grasp_test` | ACT (imitación) | 51,7 M (según la ficha del autor en el Hub) | No disponible | No disponible en la información proporcionada | Hugging Face, 21 descargas |
| Diffusion Policy | Política de imitación basada en difusión | No disponible | No disponible | No disponible | Implementación disponible en LeRobot |
| SmolVLA | VLA (visión-lenguaje-acción) | No disponible | No disponible | No disponible | Disponible en el ecosistema LeRobot/Hugging Face |

La información disponible no permite comparar tasas de éxito, latencias ni consumo entre estas alternativas. La diferencia cualitativa principal es que este modelo es una política ACT específica de una tarea y un robot, mientras que las propuestas VLA están condicionadas por lenguaje y son reutilizables entre tareas, a cambio de un tamaño y unos requisitos muy superiores.

## Limitaciones y advertencias

- No hay resultados de evaluación: se desconoce la tasa de éxito real, el número de ensayos y las condiciones de prueba. No debe asumirse que la política funciona de forma fiable en producción.
- Especialización extrema: solo ha aprendido una tarea («Pick up the cube and place it on the orange target») con un tipo de cubo, una iluminación y un montaje concretos. Cualquier cambio de objeto, posición, fondo o iluminación puede degradar el comportamiento.
- Dataset reducido: 64 episodios y 25.938 frames son pocos para generalizar; existe riesgo de sobreajuste a las trayectorias demostradas y de fallos ante estados poco representados.
- Sensibilidad al hardware: las acciones están en el espacio de articulaciones de un SO-101 concreto. Cambiar de unidad exige recalibrar y probablemente reentrenar o ajustar.
- Sin condicionamiento por lenguaje real: la política no interpreta instrucciones; la cadena de tarea debe coincidir con la del entrenamiento y no cambia su comportamiento.
- Dependencia de la cámara: los nombres y la resolución de las cámaras deben coincidir exactamente con las claves de observación del entrenamiento; el model card menciona una cámara mientras que la plantilla de ejemplo usa dos, lo que puede inducir a error.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe el riesgo equivalente de acciones erráticas o inseguras ante entradas fuera de distribución.
- Sesgos: no documentados. Los sesgos provienen de la distribución de demostraciones (posiciones, velocidades y estilo de teleoperación del operador).
- Seguridad física: es una política de control de un brazo robótico real; requiere límites de par, paradas de emergencia y supervisión humana.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia. No hay restricciones de uso comercial declaradas.
- Metadatos incompletos: la fecha de creación indicada (2026-08-25) es posterior a la fecha de actualización esperada y resulta anómala; el repositorio no documenta el historial de checkpoints intermedios pese a los 46,5 GB.
- Idiomas: no aplica; no hay soporte multilingüe ni procesamiento de texto libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrancescoRivieccio28/act_so101_cube_grasp
- Dataset de entrenamiento: https://huggingface.co/datasets/FrancescoRivieccio28/lerobot_so101_cube_grasp_fixed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=FrancescoRivieccio28/lerobot_so101_cube_grasp_fixed
- Perfil del autor: https://huggingface.co/FrancescoRivieccio28
- Modelo relacionado del mismo autor: https://huggingface.co/FrancescoRivieccio28/act_so101_cube_grasp_test
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de la comunidad sobre SO-101 y ACT: https://github.com/tactino/so101-grasp-cube
- Repositorio de la comunidad sobre SO-101 y ACT: https://github.com/Gotham-Zolio/so101-grasp-cube
