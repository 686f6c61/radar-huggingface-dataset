# simheo/put-red-cube-in-green-box_pi05_step8000

## Resumen

Este repositorio contiene un fine-tuning del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, adaptado a LeRobot por el usuario simheo. Se trata de una política de imitación entrenada específicamente para la tarea robótica "put-red-cube-in-green-box" (colocar un cubo rojo en una caja verde) sobre un robot de tipo `grabette` con una única cámara (`right_cam0`). El modelo parte de `lerobot/pi05_base` y se ha entrenado durante 8000 pasos con un dataset propio de 177 episodios y 31 496 fotogramas a 30 FPS.

π₀.₅ es la evolución del modelo π₀ de Physical Intelligence, diseñado para generalizar a entornos y situaciones nuevas no vistas durante el entrenamiento. La implementación disponible aquí proviene del repositorio OpenPI de la compañía y se ha integrado en el ecosistema LeRobot de Hugging Face, lo que permite entrenar, evaluar y desplegar políticas robóticas con las herramientas estándar de LeRobot.

El modelo tiene 4 143 404 816 parámetros (aproximadamente 4,14 mil millones) en formato safetensors, con un tamaño de repositorio de 9,4 GB. La licencia es Apache 2.0. Es relevante como ejemplo práctico de fine-tuning de un VLA de última generación para una tarea concreta de manipulación robótica, aunque carece de resultados de evaluación publicados y de tracción comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4 143 404 816 (~4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | grabette |
| Cámaras de entrada | right_cam0 |
| Entrada visual | observation.images.right_cam0, forma (3, 360, 480) |
| Entrada de estado | observation.state, forma (2,) |
| Salida de acción | action, forma (11,) |
| Dataset de entrenamiento | simheo/put-red-cube-in-green-box_graspproj (177 episodios, 31 496 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 8000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo es un VLA (Vision-Language-Action) de tipo π₀.₅, la segunda iteración del modelo π₀ de Physical Intelligence, cuyo objetivo declarado es la generalización a entornos abiertos y situaciones no vistas durante el entrenamiento. La implementación concreta de este repositorio es la adaptación de LeRobot del repositorio OpenPI de Physical Intelligence. La arquitectura combina percepción visual (una imagen RGB de 3×360×480), estado del robot (vector de 2 dimensiones) y una instrucción de tarea en lenguaje natural para producir un vector de acción de 11 dimensiones. No se dispone de detalles adicionales sobre la composición interna de la red (número de capas, mecanismo de atención, uso de flow matching u otras técnicas de generación de acciones) en la información proporcionada.

El entrenamiento es un fine-tuning supervisado (imitación) desde `lerobot/pi05_base` sobre el dataset `simheo/put-red-cube-in-green-box_graspproj`, compuesto por 177 episodios y 31 496 fotogramas capturados a 30 FPS, con una única tarea: "put-red-cube-in-green-box". Se ejecutaron 8000 pasos con batch size 32, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. No se indica en la información disponible si hubo RLHF, DPO ni otras fases de alineación, ni el número total de tokens o muestras procesadas más allá de los pasos y el batch size indicados.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 11 dimensiones para un robot `grabette` a partir de una imagen y el estado del robot.
- Ejecución de una tarea específica de pick-and-place: colocar un cubo rojo en una caja verde, según la instrucción de tarea "put-red-cube-in-green-box".
- Percepción visual monocámara: procesa imágenes RGB de 360×480 píxeles procedentes de `right_cam0`.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante un string de tarea en el comando de despliegue.
- Política de imitación entrenada de extremo a extremo: mapea observaciones (imagen + estado) a acciones sin planificación explícita separada.
- Integración con el ecosistema LeRobot: entrenamiento, despliegue y evaluación mediante las CLI `lerobot-train` y `lerobot-rollout`.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües, modo thinking, visión general, audio ni otras capacidades más allá del control robótico descrito.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la tarea de coger un cubo rojo y depositarlo en una caja verde sobre un robot `grabette`, útil como banco de pruebas para experimentos de imitación robótica con LeRobot.
- Replicación de experimentos de VLA: sirve para reproducir y comparar el comportamiento de π₀.₅ fine-tuneado frente al modelo base `lerobot/pi05_base` en una tarea concreta y controlada.
- Base para fine-tuning en nuevas tareas: al partir de `lerobot/pi05_base` y estar entrenado con la CLI de LeRobot, puede usarse como punto de partida para adaptar la política a otras tareas de manipulación con el mismo tipo de robot.
- Docencia y formación en robótica de imitación: permite ilustrar el flujo completo de grabación de datos, entrenamiento y despliegue de una política VLA con 177 episodios y 31 496 fotogramas.
- Evaluación de robustez ante variaciones de posición y iluminación: al ser una política entrenada en un dataset pequeño y específico, es adecuada para estudiar la degradación del rendimiento ante cambios de escena no presentes en el entrenamiento.
- Integración en pipelines de investigación con LeRobot: el modelo se puede cargar y ejecutar con `lerobot-rollout` y `--strategy.type=base`, lo que facilita su incorporación en scripts de experimentación automatizada.
- Prototipado de control visual para robots de bajo coste: el robot `grabette` y una sola cámara `right_cam0` configuran un montaje sencillo, adecuado para validar políticas de imitación antes de escalar a plataformas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4 143 404 816 parámetros en safetensors (9,4 GB de repositorio), una estimación orientativa en precisión completa rondaría los 16 GB solo para pesos, pero no se confirma ningún requisito oficial.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la model card.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos oficiales sobre si cabe en RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=simheo/put-red-cube-in-green-box_pi05_step8000`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput estimados: no disponible. No se publican métricas de frecuencia de inferencia ni de tiempo por acción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simheo/put-red-cube-in-green-box_pi05_step8000 | ~4,14 mil millones | no disponible | Pick-and-place "put-red-cube-in-green-box" con robot `grabette` | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base π₀.₅ para fine-tuning | no disponible en la información | Hugging Face (modelo base referenciado) |
| π₀ (Pi0) de Physical Intelligence | no disponible en la información | no disponible | VLA predecesor de π₀.₅ | no disponible en la información | Repositorio OpenPI de Physical Intelligence |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad cuando estos constan.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la model card. Al ser una política entrenada con 177 episodios de una única tarea, hereda los sesgos de posición, iluminación y configuración de cámara del dataset.
- Riesgo de alucinación: en el contexto de una política de acción, el riesgo se traduce en acciones incorrectas o no generalizables fuera de la distribución de entrenamiento; no hay evaluación publicada que cuantifique este riesgo.
- Limitaciones de contexto e idioma: no se dispone de información sobre longitud de contexto ni sobre idiomas soportados. La instrucción de tarea se usa como string ("put-red-cube-in-green-box") y no se documenta soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el modelo original π₀.₅ de Physical Intelligence deben verificarse por separado, ya que sus condiciones pueden diferir.
- Generalización limitada: el modelo está fine-tuneado para una tarea concreta, un robot concreto (`grabette`) y una cámara concreta (`right_cam0`); no se espera que funcione en otras plataformas sin reentrenamiento.
- Ausencia de evaluación: no hay resultados de tasa de éxito ni de robustez, lo que impide recomendar su uso en producción sin una validación empírica previa.
- Madurez y soporte: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin comunidad ni mantenimiento documentado.
- Dependencia de versiones: entrenado con LeRobot 0.6.1; cambios de versión en la librería o en el formato del dataset pueden afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simheo/put-red-cube-in-green-box_pi05_step8000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/simheo/put-red-cube-in-green-box_graspproj
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=simheo/put-red-cube-in-green-box_graspproj
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
