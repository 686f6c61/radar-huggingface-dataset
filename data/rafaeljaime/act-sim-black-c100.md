# RafaelJaime/act-sim-black-c100

## Resumen

`RafaelJaime/act-sim-black-c100` es una política de imitación entrenada con el método **ACT (Action Chunking with Transformers)** y distribuida a través de la librería **LeRobot** de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir del estado articular de un brazo robótico SO-101 (`so_follower`) y de dos cámaras (`top` y `wrist`), predice directamente un vector de 6 acciones de control. El autor es `RafaelJaime` y el modelo se publica bajo licencia Apache 2.0.

El modelo se ha entrenado sobre el dataset `RafaelJaime/smartseed-sim-grasp-black-v2`, compuesto por 100 episodios de teleoperación (29.503 fotogramas a 30 FPS) en un entorno de simulación. La tarea aprendida es concreta y única: *«grasp the seed below the gripper»*, es decir, coger una semilla situada bajo la pinza. El nombre del repositorio y los tags (`simulation`, `smartseed`, `robotekin-hackathon`, `BraboRobots`) sitúan su origen en el contexto de un hackathon de robótica con un gemelo simulado.

Su relevancia es la de un artefacto reproducible de investigación: ilustra el flujo completo de LeRobot (grabación de datos, entrenamiento de política y despliegue en robot real o simulado) con un modelo pequeño de 51,7 millones de parámetros. No obstante, es un checkpoint sin resultados de evaluación publicados y con un dominio de aplicación muy restringido, por lo que debe tratarse como una demostración técnica y no como una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora con backbone visual (ResNet) y transformer encoder-decoder con CVAE, segun el paper 2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: consume una observacion por paso (estado de 6 dimensiones y dos imagenes de 3x480x640) y predice un chunk de acciones; la longitud de chunk no esta documentada en la model card |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, INT8 o FP16 documentadas |
| Idiomas soportados | no aplica (modelo de control robotic; las instrucciones de tarea son texto, pero no se documenta soporte multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`, pipeline `robotics`); tamano del repositorio 2,5 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). En lugar de predecir una acción por paso, la política predice un *chunk* de acciones futuras, lo que reduce el error de acumulación y suaviza la ejecución. El modelo combina un backbone visual convolucional que procesa las dos cámaras con un transformer encoder-decoder, e incorpora un autocodificador variacional condicional (CVAE) para modelar la variabilidad humana en los datos de teleoperación. Sobre este checkpoint concreto, la model card no detalla la configuración de capas, el tamaño del chunk ni la resolución interna del backbone, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó con LeRobot 0.6.2 durante 40.000 pasos, con tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Los datos proceden del dataset `RafaelJaime/smartseed-sim-grasp-black-v2`: 100 episodios, 29.503 fotogramas a 30 FPS, una única tarea y un entorno de simulación. Las observaciones son `observation.state` (vector de 6 componentes), `observation.images.top` y `observation.images.wrist` (ambas 3x480x640); la salida es `action` (vector de 6 componentes). No se documenta en la información disponible ninguna fase de RLHF, DPO ni ajuste posterior al entrenamiento supervisado por imitación.

## Capacidades

- Control visuomotor de un brazo SO-101 configurado como `so_follower`, emitiendo acciones de 6 dimensiones (típicamente las articulaciones o el efector final del robot).
- Percepción multimodal basada en dos cámaras simultáneas: vista cenital (`top`) y vista de muñeca (`wrist`), a 480x640 y 30 FPS.
- Ejecución de una única tarea de agarre: «grasp the seed below the gripper» (coger una semilla situada bajo la pinza).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita ni entorno de RL.
- Predicción de chunks de acciones, lo que permite un control más estable que la predicción paso a paso.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`, visualización de datasets en el Hub).
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, generación de texto, código ni matemáticas. No se documenta modo *thinking*, visión general, audio ni soporte multilingüe.

## Casos de uso

- **Automatización de picking de precisión en simulación**: la política está entrenada específicamente para localizar y agarrar una semilla bajo la pinza; puede emplearse como referencia de partida en un gemelo digital antes de abordar el despliegue físico, evitando riesgos sobre hardware real.
- **Transferencia sim-to-real en robótica de bajo coste**: al usar el robot SO-101 y cámaras estándar (640x480 a 30 FPS), el checkpoint sirve como base para experimentar con calibración, iluminación y dominio visual antes de reentrenar con datos reales.
- **Prototipado rápido de pipelines de aprendizaje por imitación**: con `lerobot-train` y `lerobot-rollout` se puede reproducir el flujo completo (dataset de 100 episodios, 40.000 pasos, AdamW) y medir el impacto de cambios en datos o hiperparámetros en cuestión de horas en una sola GPU.
- **Generación de datos sintéticos y aumento de dataset**: los 29.503 fotogramas del dataset asociado, junto con la política entrenada, permiten entrenar políticas auxiliares o comparar variantes visuales (por ejemplo, distintos colores de semilla o fondos) en un entorno controlado.
- **Docencia y formación en robótica manipulativa**: es un ejemplo autocontenido de ACT con configuración de entrenamiento documentada, útil para explicar chunks de acciones, CVAE y evaluación de políticas en un curso o taller.
- **Evaluación comparativa de políticas en LeRobot**: sirve como línea base ACT frente a otras políticas de la misma librería (Diffusion Policy, VQ-BeT o modelos VLA) sobre la misma tarea y el mismo robot, siempre que se documenten los protocolos de éxito.
- **Pruebas de integración de hardware y calibración**: útil para validar la cadena completa de captura (dos cámaras OpenCV, puerto del robot, nombres de las claves de observación) antes de invertir en un entrenamiento propio con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card incluye la sección de evaluación vacía con la nota *«No evaluation results have been provided for this policy yet»*, por lo que no existen tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas. Tampoco se han encontrado en la búsqueda web resultados técnicos ni papers asociados a este checkpoint concreto; los resultados devueltos por la búsqueda no guardan relación con el modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: muy baja. Con 51,7 millones de parámetros, los pesos en FP32 ocupan aproximadamente 207 MB (51.668.614 x 4 bytes), a lo que hay que sumar las activaciones de los dos backbones visuales a 480x640. En la práctica, menos de 1-2 GB de VRAM en FP32; no hay datos oficiales de consumo medido.
- **GPU recomendadas**: cualquier GPU con CUDA y al menos 4 GB de VRAM es suficiente a nivel de memoria. Una RTX 4090, RTX 3090, A100 o H100 ofrecen margen de sobra y permiten entrenar variantes propias; para inferencia, una GPU de gama media es más que suficiente.
- **Cabe en GPU de consumo**: sí, en cualquier GPU de consumo moderna (RTX 3060 en adelante). También es viable ejecutar la inferencia en CPU, aunque el procesamiento de dos flujos de vídeo a 30 FPS exige comprobar la latencia real en el hardware objetivo.
- **Opciones de despliegue**: `lerobot-rollout` con `--policy.path=RafaelJaime/act-sim-black-c100` (PyTorch). No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo generativo de texto. El entrenamiento se realiza con `lerobot-train --policy.type=act`.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de frecuencia de control efectiva, latencia por paso ni tasa de éxito en bucle cerrado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RafaelJaime/act-sim-black-c100` | 51,7 M | Estado (6) + 2 imagenes 3x480x640 | Agarre de semilla en simulacion (SO-101) | Apache 2.0 | Hugging Face, via LeRobot |
| Diffusion Policy (Chi et al., 2023) | no disponible | Observaciones visuales y de estado; predice secuencias de acciones por difusion | Politicas visuomotoras generales | no disponible en la informacion | Implementacion en LeRobot |
| VQ-BeT (Behavior Transformer) | no disponible | Observaciones visuales y de estado; acciones discretizadas en tokens | Politicas visuomotoras generales | no disponible en la informacion | Implementacion en LeRobot |
| Otros checkpoints ACT de LeRobot | variable | Depende del robot y del dataset | Tareas de manipulacion especificas | habitualmente Apache 2.0 | Hugging Face, via LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a arquitectura, tipo de entrada y disponibilidad.

## Limitaciones y advertencias

- **Dominio extremadamente estrecho**: la política solo ha visto una tarea («grasp the seed below the gripper») en un único entorno simulado. No se espera que generalice a otros objetos, posiciones, iluminaciones o brazos distintos sin reentrenamiento.
- **Sin evaluación publicada**: no existen tasas de éxito ni protocolos de prueba, por lo que se desconoce su fiabilidad real, incluso dentro del dominio de entrenamiento.
- **Dependencia de la configuración de cámara**: el modelo espera exactamente dos cámaras con los nombres `top` y `wrist` a 640x480 y 30 FPS. Cambiar nombres, resolución, montaje o calibración invalida las observaciones aprendidas.
- **Riesgo de sobreajuste a la simulación**: al proceder de un entorno simulado, es probable una brecha sim-to-real (texturas, ruido, dinámica del robot) que la model card no cuantifica.
- **Riesgo de alucinación en sentido amplio**: como toda política de imitación, puede producir acciones fluidas pero incorrectas (por ejemplo, cerrar la pinza en vacío) sin señal de incertidumbre ni mecanismo de rechazo.
- **Sin soporte de lenguaje natural ni de instrucciones variables**: la tarea se pasa como cadena fija en el comando de despliegue; no hay comprensión de órdenes nuevas.
- **Licencia**: Apache 2.0 permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot.
- **Trazabilidad**: el repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, sin demo ni vídeo de ejecución, lo que dificulta verificar su funcionamiento.
- **Advertencia de seguridad en robot real**: antes de ejecutar la política sobre hardware físico deben establecerse límites de par, paradas de emergencia y espacios de trabajo despejados; no se documentan límites de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RafaelJaime/act-sim-black-c100
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-sim-grasp-black-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-sim-grasp-black-v2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
