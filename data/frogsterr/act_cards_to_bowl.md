# frogsterr/act_cards_to_bowl

## Resumen

`frogsterr/act_cards_to_bowl` es una política robótica de aprendizaje por imitación entrenada con LeRobot mediante el método ACT (Action Chunking with Transformers), descrito en el artículo arXiv:2304.13705. En lugar de predecir una única acción por paso, el modelo genera "chunks" de acciones cortas, lo que reduce el error de composición y suele elevar la tasa de éxito en tareas de manipulación fina. Está pensada para ejecutarse sobre un brazo SO-100 en configuración `so_follower` con una única cámara frontal.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB en formato safetensors. Se entrenó sobre el dataset `frogsterr/cards_to_bowl_20260923_234554`, compuesto por 57 episodios y 13.117 fotogramas a 30 FPS (aproximadamente 7,3 minutos de datos teleoperados), para una única tarea: "Pick up the box of cards and place it in the bowl." La licencia es Apache 2.0.

Su relevancia es doble: por un lado, es un ejemplo reproducible del flujo completo de imitación end-to-end con LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`); por otro, sirve como punto de partida para hacer fine-tuning sobre tareas propias. Conviene señalar que el repositorio no incluye resultados de evaluación y que, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que carece de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): codificador visual convolucional, transformer con muestreo latente tipo CVAE y decodificación de chunks de acciones |
| Parametros totales | 51.668.614 (≈51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el equivalente funcional es el horizonte de chunking de acciones, no documentado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no aplica: política robótica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |
| Libreria | lerobot (entrenado con LeRobot 0.6.2) |
| Tipo de robot | `so_follower` (SO-100, brazo seguidor) |
| Camaras | `front` (una sola camara frontal) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 720, 1280) |
| Salidas | `action` (6,) |
| Tarea entrenada | "Pick up the box of cards and place it in the bowl." |
| Dataset de entrenamiento | `frogsterr/cards_to_bowl_20260923_234554` (57 episodios, 13.117 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (que procesa la imagen de la cámara frontal), un estado propioceptivo de 6 dimensiones y un transformer que predice secuencias de acciones en lugar de pasos aislados. El componente generativo latente (estilo CVAE) permite modelar la multimodalidad de las demostraciones humanas, un problema habitual cuando el operador teleopera la misma tarea de formas distintas. Esta formulación, publicada en arXiv:2304.13705, es la que logró tasas de éxito altas en manipulación bimanual con hardware de bajo coste.

La configuración de entrenamiento registrada en la model card es: 15.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2, con `policy.device=cuda`. Los datos provienen de 57 episodios teleoperados sobre un SO-100 con una cámara frontal, 13.117 fotogramas a 30 FPS. No se documenta en la información disponible si hubo fases de RLHF, DPO o ajuste posterior; en el contexto de ACT no se emplean habitualmente. Tampoco se detalla la composición exacta del dataset más allá de la tarea única y del número de episodios.

## Capacidades

- Generación de acciones de manipulación de 6 grados de libertad (chunks de acciones) para el brazo `so_follower`.
- Control visual cerrado en bucle a partir de una única cámara frontal (`observation.images.front`).
- Ejecución de una tarea concreta de pick-and-place: recoger la caja de cartas y depositarla en el bol.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa ni simulación).
- Inferencia autocontenida en local: el checkpoint se carga directamente con `lerobot-rollout --policy.path=frogsterr/act_cards_to_bowl`.
- Reentrenamiento y ajuste fino mediante `lerobot-train --policy.type=act` sobre datasets propios.
- Compatible con el ecosistema LeRobot (grabación de datos, visualización de datasets, rollout y entrenamiento).
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión generalista, audio ni modo "thinking": es una política de control motor, no un modelo de propósito general.

## Casos de uso

- Automatización de una celda pick-and-place de laboratorio: con un SO-100 y una cámara frontal, se lanza `lerobot-rollout` con `--strategy.type=base` y `--duration=60` para que la política recoja la caja de cartas y la deposite en el bol sin intervención humana.
- Prototipado de robótica de bajo coste: ACT alcanza buenos resultados con hardware asequible, por lo que este checkpoint sirve para validar una célula completa (brazo, cámara, calibración y control) antes de invertir en hardware industrial.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio con nuevos objetos, posiciones o incluso otro robot de la misma familia, aprovechando la convergencia rápida de ACT en pocos miles de pasos.
- Banco de pruebas del pipeline LeRobot: comparar checkpoints, semillas e hiperparámetros (pasos, batch size, learning rate) manteniendo fijo el dataset y midiendo la tasa de éxito en el robot real.
- Docencia y formación: es un caso didáctico completo de aprendizaje por imitación, desde la teleoperación y el registro de 57 episodios hasta el despliegue del checkpoint, con comandos reproducibles.
- Investigación en imitación y reproducibilidad: usar este checkpoint como baseline de ACT frente a otras políticas (Diffusion Policy, SmolVLA) sobre la misma tarea y el mismo hardware.
- Pruebas de robustez y análisis de fallos: variar iluminación, posición inicial, fondo o distracciones para caracterizar la sensibilidad de una política entrenada con solo 13.117 fotogramas.
- Integración en flujos de evaluación continua de políticas robóticas: repetir el rollout N veces en un banco de pruebas automatizado y registrar la tasa de éxito, ya que la model card no publica ninguna métrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay, por tanto, métricas de tasa de éxito, número de ensayos, MMLU, HumanEval ni GSM8K (estos últimos no aplican a una política de control motor).

| Tarea | Ensayos | Exitos | Tasa de exito |
|---|---|---|---|
| Pick up the box of cards and place it in the bowl. | no disponible | no disponible | no disponible |

| Metrica de entrenamiento | Valor |
|---|---|
| Pasos de entrenamiento | 15.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Episodios de datos | 57 |
| Fotogramas de datos | 13.117 a 30 FPS (≈7,3 minutos) |

## Requisitos de hardware

- VRAM para inferencia: los pesos en fp32 ocupan aproximadamente 207 MB (51,7 M × 4 bytes); con las activaciones del codificador visual a 720×1280 y batch 1, el consumo se mantiene por debajo de 2 GB.
- Cabe en cualquier GPU de consumo: desde una GTX 1650 de 4 GB en adelante (RTX 3060, RTX 4060, RTX 4070, RTX 4090). También puede ejecutarse en CPU, dado el tamaño reducido del modelo, aunque la latencia dependerá del procesador.
- GPU recomendadas para entrenamiento: RTX 3060/4070/4090 son suficientes con batch size 8 y 15.000 pasos; no se requieren A100 ni H100. Para despliegue embarcado en el robot, una Jetson Orin Nano o Orin NX es una opción habitual en este tipo de políticas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con PyTorch como backend. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no existen pesos GGUF.
- Configuración de cámara: la política espera una cámara llamada `front` y fue entrenada con imágenes de 720×1280, mientras que el ejemplo de la model card usa 640×480. Conviene respetar la resolución de entrenamiento o validar el impacto de la diferencia.
- Latencia y throughput: no disponible. La frecuencia de control del robot (30 FPS en los datos) y el tamaño del modelo sugieren que la inferencia en GPU es compatible con control en tiempo real, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Familia | Parametros | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `frogsterr/act_cards_to_bowl` (este) | ACT | 51,7 M | Manipulacion mono-tarea, SO-100 | apache-2.0 | Hugging Face, 0 descargas |
| ACT de referencia (arXiv:2304.13705) | ACT | no disponible | Manipulacion bimanual de proposito general | codigo abierto (LeRobot) | GitHub de LeRobot |
| Diffusion Policy | difusion + transformer/CNN | no disponible | Manipulacion multi-tarea | no disponible | Implementacion en LeRobot |
| SmolVLA | VLM + cabecera de acciones (flow matching) | ≈450 M (dato de documentacion publica, verificar) | Manipulacion con instrucciones en lenguaje | apache-2.0 (verificar) | Hugging Face / LeRobot |

Comparado con ACT de referencia, este checkpoint es una instancia concreta y de un solo brazo, sin evaluación publicada. Frente a Diffusion Policy, ACT suele ser más ligero y rápido de entrenar, aunque la difusión tiende a modelar mejor distribuciones multimodales complejas. Frente a SmolVLA, la diferencia de escala es de casi un orden de magnitud y este último acepta instrucciones en lenguaje natural, algo de lo que carece `act_cards_to_bowl`. Los datos de los modelos alternativos provienen de su documentación pública y deben verificarse antes de citarlos.

## Limitaciones y advertencias

- Política mono-tarea: solo está entrenada para "Pick up the box of cards and place it in the bowl." No generaliza a otras instrucciones.
- Mono-embodiment: depende del robot `so_follower` (SO-100). No funcionará en otro brazo o en otra configuración cinemática sin reentrenamiento.
- Una sola cámara (`front`) y un estado de 6 dimensiones: si los nombres o las claves de observación no coinciden exactamente, el rollout falla o produce acciones incoherentes.
- Discrepancia de resolución: el entrenamiento usa 720×1280, pero el ejemplo oficial de la model card emplea 640×480. Es una posible fuente de degradación silenciosa del rendimiento.
- Dataset muy pequeño: 57 episodios y 13.117 fotogramas (≈7,3 minutos). Alta probabilidad de sobreajuste a la iluminación, el fondo, la posición de los objetos y la disposición de la mesa del entorno de grabación.
- Sin resultados de evaluación ni validación de la comunidad (0 descargas, 0 "likes"): no hay evidencia pública de tasa de éxito.
- Fechas poco habituales: el repositorio se creó el 2026-09-24 y el dataset incluye 20260923 en su nombre, lo que conviene verificar antes de reutilizar los datos.
- No aplica el concepto clásico de alucinación, pero sí existe riesgo de fallo silencioso en la manipulación: la política puede generar una trayectoria plausible y colisionar con el objeto o el entorno sin señal de error.
- Seguridad física: cualquier despliegue en un robot real requiere parada de emergencia, límites de par y supervisión humana durante las pruebas.
- Licencia Apache 2.0: permite uso comercial y modificación, con atribución y sin garantías por parte del autor. El dataset asociado puede tener condiciones propias que conviene revisar.
- No es un modelo de lenguaje: no admite cuantización GGUF, ni despliegue en vLLM/Ollama, ni evaluación tipo MMLU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frogsterr/act_cards_to_bowl
- Dataset de entrenamiento: https://huggingface.co/datasets/frogsterr/cards_to_bowl_20260923_234554
- Visualizacion del dataset (LeRobot Space): https://huggingface.co/spaces/lerobot/visualize_dataset?path=frogsterr/cards_to_bowl_20260923_234554
- Articulo de ACT: https://huggingface.co/papers/2304.13705 y https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo; los resultados obtenidos no guardan relacion con la politica ni con LeRobot.
