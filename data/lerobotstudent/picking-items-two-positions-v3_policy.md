# lerobotStudent/picking-items-two-positions-v3_policy

## Resumen

`lerobotStudent/picking-items-two-positions-v3_policy` es una política de imitación para robótica manipulativa entrenada con el método ACT (Action Chunking with Transformers) sobre el framework LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones (estado articular de 6 dimensiones más dos cámaras de 480×640) a comandos de acción de 6 dimensiones, pensado para ejecutar la tarea "esperar a que el objeto se coloque sobre la mesa, cogerlo y dejarlo en la caja" con un brazo `so_follower` (SO-100/SO-101 o similar de la familia LeRobot).

El modelo tiene 51.668.614 parámetros en formato safetensors, con un repositorio de 0,2 GB, lo que sugiere pesos en fp32 (51,7 M × 4 bytes ≈ 207 MB). Se entrenó durante 100.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre un dataset de 100 episodios y 39.776 fotogramas a 30 FPS grabados por teleoperación.

Su relevancia es acotada pero clara: es un ejemplo reproducible de extremo a extremo del pipeline de imitation learning de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) para quien quiera replicar una tarea de pick-and-place con hardware de bajo coste. No hay resultados de evaluación publicados ni licencia declarada, y el nombre del repositorio no coincide con el del dataset usado, lo que conviene verificar antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con backbones visuales para predicción de secuencias de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de LLM. ACT consume una ventana fija de observaciones y predice un chunk de acciones, cuyo tamano no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, aparentemente fp32) |
| Idiomas soportados | no disponible; no aplica (la tarea se pasa como cadena de texto fija en ingles) |
| Licencia | no disponible (la model card indica \[More Information Needed]) |
| Formato de pesos | safetensors (libreria `lerobot`, version 0.6.2) |
| Entradas | `observation.state` (6,), `observation.images.claw` (3, 480, 640), `observation.images.birdseye` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras | `claw`, `birdseye` |
| Tamano del repositorio | 0,2 GB |
| Pipeline | robotics |
| Descargas / likes | 9 / 0 |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

ACT se describe en el paper arXiv:2304.13705 como un método de imitation learning que predice chunks cortos de acciones en lugar de pasos individuales. La formulación habitual combina un backbone visual (típicamente ResNet) que extrae características de cada cámara, un codificador transformer que fusiona las observaciones con el estado articular y un decodificador que emite la secuencia de acciones; un cuello de botella de estilo VAE (CVAE) modela la variabilidad de las demostraciones humanas. En esta política concreta, la entrada está compuesta por el estado de 6 dimensiones y dos imágenes RGB de 480×640 (`claw`, vista de la pinza, y `birdseye`, vista cenital), y la salida es un vector de acción de 6 dimensiones. La model card no detalla el número de capas, dimensión oculta, tamaño del chunk ni los backbones visuales exactos: esa información no está disponible en el repositorio.

El entrenamiento se hizo con LeRobot 0.6.2 sobre el dataset `lerobotStudent/picking-items-one-position-v2_20261017_180432`: 100 episodios, 39.776 fotogramas a 30 FPS, tarea única "wait until the item is placed on the desk, then pick it and place it in the box". Configuración: 100.000 pasos, batch size 8, AdamW, learning rate 1e-5, semilla 1000. No se indica en la información disponible si hubo aumento de datos, RLHF/DPO (no aplica en imitation learning) ni técnicas adicionales como decodificación especulativa. La política se distribuye vía `lerobot-rollout` con `--strategy.type=base`, que ejecuta el control sin grabar episodios.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 grados de libertad para un brazo `so_follower` a partir de estado articular y dos vistas de cámara.
- Predicción de chunks de acción: ACT emite secuencias cortas de acciones en lugar de pasos aislados, lo que reduce el error acumulado y suaviza la ejecución (propiedad del método, no un dato medido en este repositorio).
- Ejecución de una tarea única de pick-and-place condicionada por instrucción textual: "wait until the item is placed on the desk, then pick it and place it in the box".
- Percepción visual multi-cámara: fusión de una vista egocéntrica de la pinza y una vista cenital, útil para localización del objeto y del contenedor.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación/despliegue con `lerobot-rollout`, registro en Weights & Biases (opcional) y publicación en el Hub.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni generación de texto. No es multilingüe ni tiene modo "thinking".

## Casos de uso

- Replicación de un pipeline completo de imitation learning: sirve como referencia didáctica para grabar 100 episodios con un SO-100, entrenar ACT 100.000 pasos y desplegar con `lerobot-rollout`; el valor está en que el repositorio incluye la configuración exacta (lr, batch, seed, versión de LeRobot).
- Pick-and-place en línea de montaje sencilla: la política toma un objeto depositado en la mesa y lo traslada a una caja; adecuada para tareas repetitivas de alimentación de piezas donde la posición inicial del objeto es aproximadamente fija.
- Clasificación y recogida de objetos pequeños: con la cámara cenital como referencia de localización y la de pinza para el agarre fino, puede emplearse en la separación de piezas por contenedor.
- Base para fine-tuning en un brazo propio: al estar publicada en el Hub con la librería `lerobot`, se puede recargar con `--policy.path` y reentrenar sobre un dataset propio conservando la arquitectura y el preprocesado.
- Banco de pruebas de despliegue en inferencia local: con ~207 MB de pesos, es un candidato para validar latencias de control a 30 FPS en GPU de consumo antes de invertir en políticas mayores.
- Docencia e investigación en robótica de bajo coste: permite montar una práctica de laboratorio donde el alumnado evalúa el efecto de variar iluminación, posición de cámara o numero de episodios sobre la tasa de éxito (que aquí no está documentada).
- Demostración de integración Hub-robot: útil para probar el flujo de `visualize_dataset` sobre el dataset asociado y comparar el comportamiento entre políticas ACT del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía con el texto "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito medidas en robot real, ni número de ensayos, ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay medición publicada. Como referencia de cálculo, los pesos en fp32 ocupan aproximadamente 207 MB (51.668.614 × 4 bytes); a ello hay que sumar activaciones y los backbones visuales procesando dos imágenes de 480×640 por paso de control. Una estimación prudente sitúa el uso total en el rango de 2 a 4 GB, pero es una estimación, no un dato del repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. Cualquier GPU con soporte CUDA y al menos 4-6 GB de memoria debería poder ejecutar la política; para entrenamiento, la model card usa `--policy.device=cuda` sin especificar el modelo de GPU empleado.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX con 6 GB o más (por el tamaño de pesos), aunque el rendimiento a 30 FPS no está medido.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot, estrategia `base`), y el flujo de entrenamiento con `lerobot-train`. No se mencionan exportaciones a GGUF, TensorRT, ONNX, vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS de captura (dos cámaras OpenCV a 640×480), lo que marca un presupuesto de 33 ms por paso; no se documenta si la política cumple ese presupuesto en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| picking-items-two-positions-v3_policy (este) | 51.668.614 | ventana de observacion no especificada | sin evaluacion publicada | no disponible | Hub, 9 descargas |
| Diffusion Policy (implementacion en LeRobot) | no disponible | no disponible | no disponible | no disponible | incluida en el framework LeRobot |
| Otras politicas ACT publicadas por el mismo autor (`lerobotStudent`) | no disponible | no disponible | sin evaluacion publicada | no disponible | Hub |
| Politicas ACT de terceros en LeRobot | no disponible | no disponible | no disponible | no disponible | Hub |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparación cuantitativa no es posible. Cualitativamente, la diferencia entre este repositorio y las demás políticas ACT del ecosistema LeRobot está en el dataset de entrenamiento (100 episodios, tarea única, robot `so_follower`) y en las dos cámaras empleadas.

## Limitaciones y advertencias

- No hay licencia declarada. La model card indica explícitamente "\[More Information Needed]" en el campo License, por lo que el uso comercial queda sin amparo legal claro hasta que el autor lo aclare.
- No hay ninguna evaluación publicada: se desconoce la tasa de éxito real de la tarea, el número de ensayos y la robustez ante cambios de iluminación, posición de objetos o distracciones.
- Inconsistencia entre el nombre del repositorio y el dataset: la política se llama `picking-items-two-positions-v3_policy` pero se entrenó con `picking-items-one-position-v2_...`. Conviene verificar que el checkpoint corresponde realmente a la variante de dos posiciones.
- Sobreajuste a la tarea y al entorno: al entrenarse con una única instrucción y 100 episodios en una configuración concreta de cámaras, es esperable poca generalización a otras colocaciones de cámara, otros objetos o un robot distinto del mismo tipo.
- Dependencia estricta de los nombres de las cámaras: `lerobot-rollout` exige que los nombres e índices de cámara coincidan con las claves de observación (`claw`, `birdseye`); un mapeo incorrecto invalida las predicciones.
- Requiere calibración de hardware: el estado articular de 6 dimensiones implica que el brazo debe estar calibrado y ser compatible con `so_follower`.
- Riesgo de alucinación en sentido figurado: como política de imitación, puede ejecutar movimientos plausibles pero incorrectos si la escena se sale de la distribución de entrenamiento, sin señal de confianza asociada.
- Sin soporte de lenguaje natural libre ni de instrucciones variables: la tarea se pasa como cadena fija; no hay comprensión de órdenes nuevas.
- Repositorio de muy baja tracción (9 descargas, 0 likes) y sin demo en vídeo, lo que reduce la evidencia disponible sobre su funcionamiento.
- No se documenta el chunk size ni la frecuencia de replanificación, parámetros críticos para ajustar el control en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lerobotStudent/picking-items-two-positions-v3_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobotStudent/picking-items-one-position-v2_20261017_180432
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobotStudent/picking-items-one-position-v2_20261017_180432
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Réplica/fork de LeRobot (chrono-motz): https://github.com/chrono-motz/lerobot3
- Réplica/forks de LeRobot (FDSVM): https://github.com/FDSVM/lerobot2
- Documentación de políticas en LeRobot (DeepWiki): https://deepwiki.com/box2ai-robotics/lerobot-joycon/4-policies
