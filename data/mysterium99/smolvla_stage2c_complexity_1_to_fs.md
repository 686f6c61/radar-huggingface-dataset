# mysterium99/smolvla_stage2c_complexity_1_to_fs

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Esta ficha concreta, `mysterium99/smolvla_stage2c_complexity_1_to_fs`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre el dataset `fs`, orientado a una tarea robótica de manipulación concreta: recoger un perno y depositarlo en un cubo. El modelo consume el estado articular del robot y tres cámaras RGB de 256x256 y produce un vector de acción de 6 dimensiones.

El modelo resuelve el problema de la política de imitación en robótica de bajo coste: en lugar de requerir modelos VLA de gran escala, SmolVLA ofrece un rendimiento competitivo con un coste computacional reducido y despliegue viable en hardware de consumo. Cuenta con 450.046.176 parámetros totales en formato safetensors, un repositorio de 0,9 GB y licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de LeRobot.

Es relevante ahora porque el ajuste fino está especializado en una tarea industrial de ensamblaje (pick-and-place de un perno) con 26 episodios y 38.356 fotogramas a 30 FPS, un caso típico de automatización de laboratorio o línea de producción de baja complejidad donde el coste de un VLA grande sería prohibitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | follower |
| Cámaras de entrada | gripper, newtop, newside |
| Entrada de estado | observation.state, shape (6,) |
| Entrada visual | 3 cámaras, shape (3, 256, 256) cada una |
| Salida de acción | action, shape (6,) |
| Dataset de entrenamiento | fs (26 episodios, 38.356 fotogramas, 30 FPS) |
| Tarea entrenada | "Pick up the bolt and put it in the bucket" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción diseñada para ser compacta y eficiente, con capacidad de despliegue en hardware de consumo según la model card. El modelo procesa tres flujos visuales de 256x256 píxeles junto con un vector de estado de 6 dimensiones y genera un vector de acción de 6 dimensiones, lo que corresponde a un robot tipo follower con pinza y tres cámaras (gripper, newtop, newside). La model card no detalla la composición interna de la arquitectura (número de capas, mecanismo de atención, fusión multimodal), por lo que esos datos no están disponibles.

El entrenamiento se realizó mediante ajuste fino supervisado desde `lerobot/smolvla_base` sobre el dataset `fs`, compuesto por 26 episodios y 38.356 fotogramas a 30 FPS de la tarea "Pick up the bolt and put it in the bucket". Se ejecutaron 20.000 pasos con batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 0, usando LeRobot 0.6.1. No se especifica en la información disponible si hubo RLHF, DPO ni otras fases de alineación; al tratarse de una política de imitación robótica, el entrenamiento es de comportamiento clonado sobre demostraciones.

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones a partir de observaciones multimodales (estado articular y tres cámaras RGB).
- Control de un robot tipo follower con pinza para tareas de pick-and-place.
- Percepción visual mediante tres cámaras simultáneas (gripper, vista superior y vista lateral).
- Ejecución de la tarea específica "Pick up the bolt and put it in the bucket" para la que fue ajustado.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es un modelo de política robótica, no un modelo de lenguaje conversacional.
- Capacidades multilingües: no disponibles; la instrucción de tarea se proporciona en inglés en los ejemplos de la model card.

## Casos de uso

- Automatización de ensamblaje en laboratorio: el modelo ejecuta la secuencia de recoger un perno y depositarlo en un cubo, adecuado para prototipos de líneas de montaje de baja complejidad donde se quiere validar la viabilidad de un VLA compacto antes de escalar a producción.
- Investigación en imitación robótica: sirve como punto de partida para experimentos de comportamiento clonado con pocos datos (26 episodios), permitiendo estudiar la transferencia desde `lerobot/smolvla_base` a tareas específicas.
- Despliegue en hardware de consumo: al ser un modelo compacto de 450 millones de parámetros y 0,9 GB, puede ejecutarse en estaciones de trabajo con GPU consumer, lo que abarata los bancos de pruebas de robótica educativa.
- Clasificación y manipulación de piezas metálicas: la tarea de perno y cubo es representativa de operaciones de alimentación de componentes en celdas de fabricación flexibles.
- Evaluación de políticas con LeRobot: el comando `lerobot-rollout` permite ejecutar la política en un robot real durante un tiempo determinado, útil para validar el comportamiento antes de integrarlo en un pipeline mayor.
- Generación de datos sintéticos y aumento de dataset: la política puede usarse para generar trayectorias adicionales que alimenten el reentrenamiento de variantes más robustas.
- Docencia y formación en robótica: ejemplo completo y reproducible de ajuste fino de un VLA con LeRobot, útil para cursos prácticos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors (0,9 GB de repositorio), la inferencia en FP32 requeriría aproximadamente 1,8 GB de pesos, y en FP16 alrededor de 0,9 GB, sin contar activaciones ni buffers de las tres cámaras de 256x256.
- GPU recomendadas: no disponibles en la información proporcionada; la model card afirma que SmolVLA "can be deployed on consumer-grade hardware".
- ¿Cabe en GPU consumer? Según la model card, sí, al estar diseñado para hardware de consumo; no se especifican modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para reentrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de política robótica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_1_to_fs | 450.046.176 | no disponible | Pick-and-place de perno en cubo (robot follower, 3 cámaras) | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para ajuste fino en robótica | no disponible en la información | Hugging Face (modelo base oficial de LeRobot) |
| Políticas de imitación tipo ACT/DP de LeRobot | no disponible | no disponible | Manipulación robótica por comportamiento clonado | no disponible | Ecosistema LeRobot |

La información disponible no permite comparar rendimiento numérico con alternativas, ya que no se han publicado benchmarks de esta política ni de los modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para la tarea "Pick up the bolt and put it in the bucket" con un robot follower y tres cámaras concretas; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy reducido: 26 episodios y 38.356 fotogramas, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y disposición de objetos del entorno de recogida.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que se desconoce su robustez real en producción.
- Dependencia de hardware específico: requiere un robot follower con pinza y tres cámaras configuradas con los nombres `gripper`, `newtop` y `newside`; cambios en la configuración invalidan la política.
- Sin datos sobre sesgos, alucinación o limitaciones de contexto: al ser un modelo de acción y no de lenguaje, no aplican los sesgos típicos de los LLM, pero no se documenta el comportamiento ante objetos o escenas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el entorno real antes de desplegarlo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Idiomas no disponibles: la instrucción de tarea se pasa en inglés en los ejemplos; no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_1_to_fs
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset fs: https://huggingface.co/datasets/fs
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fs
