# Ameyapores/franka_haply_joint_absolute_pi05_base_fullft

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, cuyo objetivo declarado es la generalización en entornos abiertos: ejecutar tareas de manipulación en situaciones y entornos que no aparecieron durante el entrenamiento. La implementación utilizada aquí proviene de LeRobot, la librería de Hugging Face para robótica, y está adaptada del repositorio open source OpenPI del propio laboratorio.

Este repositorio concreto, `Ameyapores/franka_haply_joint_absolute_pi05_base_fullft`, es un ajuste fino completo (full fine-tuning) de la política base π₀.₅ sobre el dataset `Ameyapores/franka_haply_joint_absolute`. El nombre indica que las acciones se expresan como posiciones articulares absolutas, en un montaje que combina un robot Franka con un dispositivo Haply. No es un modelo de lenguaje: es una política robótica que transforma observaciones visuales y de estado en comandos motores.

El modelo pesa 3.616.757.520 parámetros (aproximadamente 3,62 mil millones), se distribuye en safetensors y ocupa 7,5 GB en el repositorio, lo que resulta coherente con pesos almacenados en bf16. Es relevante ahora porque π₀.₅ representa la línea más reciente de políticas VLA de propósito general y porque su integración en LeRobot permite entrenar, evaluar y desplegar políticas de este tipo con las mismas herramientas que el resto del ecosistema.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅; implementación LeRobot adaptada de OpenPI |
| Parametros totales | 3.616.757.520 (≈ 3,62 mil millones) |
| Parametros activos | No disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el tamaño del repositorio (7,5 GB) es compatible con pesos en bf16 |
| Idiomas soportados | No disponible (el campo de idiomas está vacío) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de ajuste | Ameyapores/franka_haply_joint_absolute |
| Tipo de acciones | Articulares absolutas (según el identificador del repositorio) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-26 |
| Fecha de actualización | 2026-09-26 |

## Arquitectura y entrenamiento

La model card describe π₀.₅ como una evolución de π₀ orientada a resolver la generalización en mundo abierto. La implementación incluida en este repositorio procede de LeRobot y está adaptada del repositorio OpenPI de Physical Intelligence. El identificador del modelo (`base_fullft`) sugiere que se parte de la política base π₀.₅ y se realiza un ajuste fino completo sobre el dataset `franka_haply_joint_absolute`, aunque la model card no detalla el procedimiento exacto ni el número de pasos, épocas o muestras empleadas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u optimización por preferencias. Tampoco se documentan innovaciones concretas de implementación (decodificación especulativa, mecanismos de atención alternativos, etc.) más allá de la propia naturaleza VLA de la política y su integración con LeRobot. Para detalles técnicos de la arquitectura conviene consultar la entrada de blog de Physical Intelligence enlazada más abajo, que es la referencia que cita el propio autor.

## Capacidades

- Generación de acciones robóticas: convierte observaciones visuales y de estado del robot en comandos motores, propio de una política VLA.
- Control por posiciones articulares absolutas: el entrenamiento apunta a comandos de articulación en coordenadas absolutas, más que a deltas relativos.
- Generalización a entornos no vistos: es el objetivo explícito de π₀.₅ según la model card.
- Integración con LeRobot: se puede entrenar con `lerobot-train` y evaluar con `lerobot-record` usando `--policy.path`.
- Compatibilidad con flujos de ajuste fino: al partir de una política base, admite entrenamiento adicional sobre datasets propios.
- Tool calling / function calling: no aplica; es una política robótica, no un modelo de lenguaje conversacional.
- Capacidades multilingües: no disponibles; el modelo no procesa lenguaje natural como tarea principal.
- Capacidades de agente multi-paso: no documentadas en la información proporcionada.

## Casos de uso

- Manipulación robótica con Franka en laboratorio: la política está entrenada específicamente para un montaje Franka con acciones articulares absolutas, por lo que puede emplearse directamente en tareas de pick-and-place, inserción o manipulación sobre ese hardware.
- Investigación en generalización de políticas VLA: al ser un ajuste de π₀.₅, sirve como punto de partida para estudiar hasta qué punto una política entrenada en un conjunto limitado de entornos transfiere a escenas nuevas.
- Ajuste fino con datos propios: partiendo de este checkpoint, un equipo puede continuar el entrenamiento con su propio dataset en LeRobot y adaptar la política a una celda de trabajo concreta.
- Evaluación comparativa de políticas: LeRobot permite lanzar `lerobot-record` con `--episodes=N` y `--policy.path` apuntando a este modelo, lo que facilita compararlo con otras políticas (ACT, π₀) bajo el mismo protocolo.
- Recolección y ampliación de datos: el flujo típico de LeRobot entrena sobre un dataset versionado en el Hub; este modelo puede usarse para generar episodios de evaluación etiquetados con el prefijo `eval_` y alimentar iteraciones posteriores.
- Teleoperación y asistencia háptica: el identificador del repositorio sugiere un montaje con un dispositivo Haply; si el sistema final confirma esa configuración, el modelo podría integrarse en bucles de control asistido o teleoperado.
- Demostraciones y prototipos de robótica: dado su tamaño contenido (≈3,62 mil millones de parámetros), es viable para montajes de laboratorio que no dispongan de clústeres de GPU a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de tareas evaluadas, ni comparaciones cuantitativas con otras políticas. La única referencia de rendimiento es la entrada de blog de Physical Intelligence sobre π₀.₅, que no aporta cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,3 GB con pesos en bf16 (3,62 mil millones de parámetros × 2 bytes) y unos 14,5 GB en fp32. Hay que sumar el consumo de activaciones, buffers de imagen y el estado del entorno.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en una NVIDIA RTX 4090 o RTX 3090 (24 GB) con margen amplio, y probablemente en GPUs de 12-16 GB en bf16 con lotes pequeños.
- GPU de centro de datos: A100, H100 o L40S son opciones holgadas para entrenamiento y evaluación por lotes, aunque no son imprescindibles para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090, RTX 4080 y modelos con 16 GB o más, siempre que se use bf16.
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia/evaluación, `lerobot-train` para entrenamiento) sobre PyTorch. vLLM, llama.cpp u Ollama no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Dependen del robot, la frecuencia de control, la resolución de las cámaras y la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ameyapores/franka_haply_joint_absolute_pi05_base_fullft | 3,62 B | No disponible | No publicado | Apache-2.0 | Hugging Face (LeRobot) |
| π₀.₅ base (Physical Intelligence / OpenPI) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Ver términos del proyecto original | OpenPI |
| π₀ | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Ver términos del proyecto original | OpenPI |
| Políticas LeRobot genéricas (por ejemplo, ACT) | No disponible en la información proporcionada | No disponible | No disponible | Apache-2.0 (habitual en LeRobot) | Hugging Face (LeRobot) |

Los datos de los modelos alternativos no aparecen en la información suministrada, por lo que la comparación cuantitativa no puede completarse.

## Limitaciones y advertencias

- Modelo sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de que la política funcione correctamente en hardware real.
- Especialización estrecha: el ajuste se ha hecho sobre `franka_haply_joint_absolute`, de modo que su comportamiento fuera de ese montaje (robot, cámaras, espacio de acciones) no está garantizado.
- Ausencia de métricas: no hay tasas de éxito, número de episodios de evaluación ni comparaciones que permitan estimar la calidad del ajuste.
- Riesgo de sobreajuste: al ser un fine-tuning completo sobre un único dataset, puede replicar los sesgos y las limitaciones de ese conjunto de demostraciones, incluidas trayectorias subóptimas.
- Sesgos: no hay información sobre la composición del dataset ni sobre sesgos asociados a objetos, iluminación, posiciones o tareas concretas.
- Alucinación: no aplica en el sentido textual, pero sí existe riesgo de generar acciones no válidas o inseguras ante observaciones fuera de distribución.
- Contexto e idioma: no se especifican ni la ventana de contexto ni capacidades lingüísticas; el modelo no debe tratarse como un modelo de lenguaje.
- Licencia: los pesos de este repositorio son Apache-2.0, pero conviene revisar los términos del modelo base π₀.₅ y del repositorio OpenPI antes de un uso comercial.
- Producción: sin benchmarks ni validación en entornos reales, no es recomendable desplegarlo en aplicaciones críticas sin una evaluación exhaustiva previa y salvaguardas físicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ameyapores/franka_haply_joint_absolute_pi05_base_fullft
- Dataset de entrenamiento: https://huggingface.co/datasets/Ameyapores/franka_haply_joint_absolute
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio OpenPI de Physical Intelligence: mencionado en la model card, sin URL incluida en la información disponible.
