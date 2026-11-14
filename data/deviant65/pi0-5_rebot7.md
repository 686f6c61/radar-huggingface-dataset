# Deviant65/pi0.5_rebot7

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos: parte de π₀ y amplia su capacidad para operar en situaciones y entornos que no se vieron durante el entrenamiento. El repositorio `Deviant65/pi0.5_rebot7` es un ajuste fino (fine-tuning) de ese modelo base realizado por un tercero (Deviant65) sobre el robot `rebot_b601_follower`, utilizando la implementacion de LeRobot adaptada del repositorio OpenPI de Physical Intelligence.

El modelo resultante es una politica de imitacion (imitation learning) que consume el estado del robot (vector de 7 dimensiones) y dos flujos de imagen de dos camaras Intel RealSense (d415 y d405, a 480x640) para producir una accion de 7 dimensiones. Se ha entrenado especificamente para la tarea "Pick up the blue box, then return the arm to the home position" sobre un dataset de 38 episodios y 29.910 fotogramas a 30 FPS.

Los pesos ocupan 4.143.404.816 parametros (aproximadamente 4,14 mil millones) en formato safetensors, con un tamano de repositorio de 92,4 GB. Es relevante como ejemplo de como un modelo VLA fundacional puede adaptarse mediante fine-tuning ligero a un robot concreto y una tarea especifica, dentro del ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementacion LeRobot / OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `rebot_b601_follower` |
| Camaras | `d415`, `d405` (480x640, 30 FPS) |
| Entrada de estado | `observation.state` de forma `(7,)` |
| Salida de accion | `action` de forma `(7,)` |
| Dataset de entrenamiento | `Deviant65/rebot_7_20261113_170749` (38 episodios, 29.910 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Seed | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

El modelo es un VLA basado en π₀.₅ de Physical Intelligence, que combina un backbone de vision-lenguaje con un cabezal de accion para generar comandos motores directamente a partir de observaciones visuales y del estado del robot. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. No se dispone de detalles adicionales sobre la composicion interna de la arquitectura (numero de capas, dimensiones ocultas, mecanismo de atencion o fusion vision-lenguaje) en la informacion proporcionada.

El entrenamiento es un fine-tuning supervisado de imitacion sobre el dataset `Deviant65/rebot_7_20261113_170749`, que contiene 38 episodios y 29.910 fotogramas a 30 FPS para una unica tarea. Se emplearon 20.000 pasos con batch size 16, optimizador AdamW y learning rate 2,5e-05, con semilla 1000, sobre LeRobot 0.7.1. No se indica si hubo RLHF, DPO ni otras fases de alineamiento posteriores; tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias del modelo base π₀.₅.

## Capacidades

- Generacion de acciones motoras de 7 dimensiones a partir de observaciones visuales (dos camaras) y del estado del robot.
- Percepcion visual multi-camara: procesa simultaneamente las imagenes de las camaras `d415` y `d405` a 480x640.
- Ejecucion de tareas de manipulacion robotica de tipo pick-and-place: la tarea entrenada es "Pick up the blue box, then return the arm to the home position".
- Control de brazo robotico de 7 grados de libertad (forma de la accion `(7,)`).
- Integracion con el ecosistema LeRobot: ejecucion mediante `lerobot-rollout` y entrenamiento mediante `lerobot-train`.
- Capacidad de generalizacion a entornos nuevos heredada del modelo base π₀.₅ (segun la descripcion del modelo original; no verificada para este fine-tuning concreto).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matematicas ni multilingues; el modelo esta especializado en control robotico.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger una caja azul y volver a la posicion home sobre el robot `rebot_b601_follower`, adecuado para validar pipelines de imitation learning en entornos controlados.
- Prototipado rapido de politicas roboticas: sirve como punto de partida para equipos que quieran adaptar π₀.₅ a su propio robot mediante `lerobot-train` y un dataset propio, reutilizando la configuracion de entrenamiento documentada.
- Investigacion en aprendizaje por imitacion: permite reproducir el flujo completo de LeRobot (grabacion de datos, entrenamiento, rollout) con un caso concreto de 38 episodios y parametros de entrenamiento conocidos.
- Benchmark de generalizacion de modelos VLA: al ser un fine-tuning de π₀.₅ sobre una tarea unica, puede usarse para estudiar la transferencia del modelo base a dominios especificos y medir la degradacion o mejora frente al modelo original.
- Educacion y formacion en robotica: el repositorio incluye comandos completos de ejecucion y entrenamiento, lo que lo hace util como ejemplo didactico de despliegue de politicas VLA con LeRobot.
- Evaluacion de hardware de camaras: al depender de dos camaras RealSense (d415 y d405) a 480x640 y 30 FPS, permite probar la sincronizacion y el rendimiento de ese conjunto de sensores en tareas de manipulacion.
- Automatizacion de tareas repetitivas de recogida en entornos acotados: con la debida validacion y siempre que el entorno coincida con el de entrenamiento, podria desplegarse en celdas de trabajo para la tarea especifica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet", e incluye una plantilla vacia para reportar tasa de exito por tarea (trials, successes, success rate) que no ha sido cumplimentada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 4,14 mil millones de parametros en precision completa (fp32) requeriria del orden de 16,6 GB solo para los pesos, y en bf16/fp16 del orden de 8,3 GB; a esto habria que sumar el coste del backbone visual y de las activaciones, que no se documenta.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la model card.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano de parametros, es plausible que quepa en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en precision reducida, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas roboticas.
- Latencia y throughput: no disponibles. El modelo opera a 30 FPS en la captura de datos, pero no se reporta la frecuencia de inferencia ni la latencia por paso.
- Tamano del repositorio: 92,4 GB, lo que incluye pesos y posibles checkpoints; conviene tener en cuenta el espacio en disco al descargarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Deviant65/pi0.5_rebot7` (este modelo) | 4.143.404.816 | no disponible | VLA para `rebot_b601_follower` (pick-and-place) | no disponible | Hugging Face, 0 descargas, 0 likes |
| π₀.₅ (Pi05) base de Physical Intelligence | no disponible en la informacion | no disponible | VLA de proposito general | no disponible en la informacion | Blog y repositorio OpenPI de Physical Intelligence |
| π₀ (Pi0) base de Physical Intelligence | no disponible en la informacion | no disponible | VLA de proposito general | no disponible en la informacion | Repositorio OpenPI de Physical Intelligence |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a la relacion entre este fine-tuning y el modelo base del que deriva.

## Limitaciones y advertencias

- Especializacion extrema: entrenado unicamente para la tarea "Pick up the blue box, then return the arm to the home position" sobre el robot `rebot_b601_follower`; no se espera que funcione en otras tareas, objetos o robots sin reentrenamiento.
- Dataset muy pequeno: 38 episodios y 29.910 fotogramas, lo que limita la robustez frente a variaciones de posicion, iluminacion, distractores o cambios de entorno.
- Sin evaluacion publicada: no hay tasa de exito ni resultados en robot real, por lo que se desconoce su fiabilidad en produccion.
- Licencia no disponible: la model card indica "[More Information Needed]"; no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Dependencia de hardware concreto: requiere el robot `rebot_b601_follower` y las camaras `d415` y `d405` con los nombres de observacion exactos (`observation.images.d415`, `observation.images.d405`); cualquier cambio en la configuracion invalida la politica.
- Riesgo de alucinacion motora: como toda politica de imitation learning, puede generar acciones incorrectas o inseguras ante entradas fuera de distribucion; requiere supervision y paradas de emergencia en entornos reales.
- Sin datos de sesgos, idiomas ni contexto: no se documentan sesgos conocidos, capacidades multilingues ni longitud de contexto; el modelo no es un modelo de lenguaje de proposito general.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o validacion independiente.
- Fecha de creacion y actualizacion en 2026: conviene verificar la vigencia de la version de LeRobot (0.7.1) y de las dependencias al desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/pi0.5_rebot7
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/rebot_7_20261113_170749
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/rebot_7_20261113_170749
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
