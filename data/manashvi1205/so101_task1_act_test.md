# manashvi1205/so101_task1_act_test

## Resumen

`manashvi1205/so101_task1_act_test` es una política robótica de imitación entrenada con el método Action Chunking with Transformers (ACT), referenciado por el autor mediante el paper arXiv:2304.13705. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, una estrategia que suele reportar tasas de éxito altas en tareas manipulativas. Lo publica el usuario manashvi1205 en HuggingFace utilizando la librería LeRobot de Hugging Face.

Se trata de un checkpoint muy pequeño, con 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB. No es un modelo de lenguaje: es una política visomotora que consume estado articular y una imagen de muñeca, y produce comandos de acción de 6 grados de libertad para un robot de la serie SO-101 (`so_follower`). El entrenamiento se realizó sobre un conjunto de datos mínimo (una única episodio, 452 fotogramas a 30 FPS) para una tarea concreta de recogida y colocación de una caja.

Su relevancia es acotada: se trata de una prueba técnica (el sufijo `_test` y los escasos 100 pasos de entrenamiento lo indican) más que de una política de producción. Resulta útil como ejemplo reproducible del flujo de trabajo de LeRobot, como plantilla para entrenar políticas ACT propias y como referencia de las dimensiones de entrada/salida esperadas en el robot SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT); transformer con esquema tipo CVAE, según el método citado (arXiv:2304.13705) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no es un modelo de lenguaje. Consume una ventana de observaciones y emite chunks de acciones (tamaño no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural de forma generativa; la tarea se especifica por texto, pero no hay soporte multilingüe documentado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower |
| Cámaras | wrist |
| Entrada observación | observation.state `(6,)`, observation.images.wrist `(3, 720, 1280)` |
| Salida | action `(6,)` |
| Librería | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El autor declara que la política emplea el método ACT (Action Chunking with Transformers), descrito en el paper enlazado (arXiv:2304.13705). Se trata de un método de aprendizaje por imitación que predice chunks de acciones en lugar de acciones individuales, lo que reduce el error de composición acumulado típico de las políticas paso a paso. El modelo cuenta con 51,7 millones de parámetros, coherente con una política visomotora compacta basada en transformer. Los detalles exactos de la topología (número de capas, dimensión de atención, tamaño del chunk, longitud de historial de observaciones) no se especifican en la información disponible.

La configuración de entrenamiento sí está documentada: 100 pasos de entrenamiento, tamaño de lote 2, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y versión de LeRobot 0.6.1. Los datos provienen del dataset `so101_task1_test`, con una única episodio y 452 fotogramas a 30 FPS, para la tarea "Pick up the box from the start area and place it in the finish area". No se indica en la información disponible si hubo RLHF, DPO ni ningún otro ajuste posterior, ni la composición detallada del dataset más allá de los datos citados.

## Capacidades

- Control visomotor para manipulación robótica: genera acciones de 6 grados de libertad a partir del estado articular y una imagen de muñeca.
- Ejecución de una tarea de pick-and-place concreta: "coger la caja de la zona de inicio y colocarla en la zona de fin".
- Aprendizaje por imitación a partir de datos de teleoperación (behavior cloning).
- Predicción de chunks de acciones (varias acciones por inferencia), según el método ACT.
- Integración con el ecosistema LeRobot mediante los comandos `lerobot-rollout` y `lerobot-train`.
- Tool calling / function calling: no aplica; no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Modo thinking, visión o audio: no disponible; solo recibe una imagen de muñeca como entrada visual, no es un modelo de visión-lenguaje.

## Casos de uso

- Prueba de extremo a extremo del flujo LeRobot: usar este checkpoint para verificar que el pipeline de instalación, calibración del robot SO-101 y ejecución con `lerobot-rollout` funciona correctamente antes de invertir tiempo en un entrenamiento mayor.
- Plantilla de referencia para políticas ACT propias: sirve para conocer las dimensiones de entrada y salida (`observation.state` de 6 elementos, imagen de muñeca a 720x1280, acción de 6 elementos) que debe respetar cualquier política ACT destinada al mismo robot.
- Reproducción reproducible con semilla fija: al documentarse semilla 1000, versión de LeRobot 0.6.1 y configuración de entrenamiento, permite reproducir el experimento en condiciones controladas.
- Validación de la teleoperación y del dataset: ejecutar la política y comparar su comportamiento con el único episodio grabado ayuda a diagnosticar problemas de calibración o de sincronización del dataset.
- Benchmark de tiempos de inferencia en hardware modesto: con 51,7 millones de parámetros, el modelo es adecuado para medir latencia y throughput de políticas ACT en GPUs de consumo o incluso en CPU, dentro del bucle de control del robot.
- Docencia y experimentación en aprendizaje por imitación: como ejemplo mínimo (un episodio, 452 fotogramas, 100 pasos), es útil para ilustrar el efecto de la escasez de datos en el comportamiento final de la política.
- Base para fine-tuning de tareas concretas: puede servir como punto de partida (aunque con cautela, dado lo limitado de su entrenamiento) para adaptar la política a variaciones de la misma tarea con más datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone, por tanto, de tasas de éxito, número de ensayos ni datos comparativos de ningún tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB en fp16 y 0,2 GB en fp32 para los pesos (51,7 millones de parámetros). El consumo real dependerá de los buffers de activación del transformer y de la resolución de imagen de entrada (720x1280), que pueden elevar el uso de memoria muy por encima del peso de los parámetros.
- GPU recomendadas: cualquiera con suficiente memoria para procesar imágenes de 720x1280. No se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, cualquier GPU de consumo moderna dispone de memoria sobrada para los pesos. La restricción principal es el procesamiento de la imagen a alta resolución, no el tamaño del modelo.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`); el formato safetensors es compatible con el stack de PyTorch de LeRobot. No se documentan otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entradas | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| so101_task1_act_test | ACT (imitación) | 51,7 M | observation.state `(6,)` + imagen de muñeca `(3,720,1280)` | apache-2.0 | HuggingFace (LeRobot) | sin evaluación publicada |
| Otras políticas ACT en LeRobot | ACT (imitación) | no disponible | variable por configuración | habitualmente apache-2.0 | HuggingFace (LeRobot) | no disponible |
| Diffusion Policy (método alternativo en LeRobot) | política por difusión | no disponible | variable por configuración | no disponible | HuggingFace (LeRobot) | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación se limita a la categoría de método y al ecosistema de despliegue.

## Limitaciones y advertencias

- Datos de entrenamiento extremadamente escasos: una única episodio, 452 fotogramas y 100 pasos de entrenamiento. La política probablemente no generaliza ni siquiera a variaciones pequeñas de la tarea.
- Naturaleza de prueba: el nombre (`_test`) y la configuración mínima sugieren que es un experimento de validación, no una política lista para producción.
- Sin resultados de evaluación: no hay ninguna medida de tasa de éxito ni ensayos registrados, por lo que se desconoce su fiabilidad real.
- Sesgos y alucinación: no aplica el concepto de alucinación de los modelos de lenguaje, pero sí existe el riesgo de comportamientos erráticos o inseguros en el robot físico ante entradas fuera de la distribución de entrenamiento.
- Dependencia de la calibración: la política asume un robot `so_follower` y una cámara de muñeca calibrados de forma coherente con el dataset original; cualquier desviación puede degradar el comportamiento.
- Entrada visual de alta resolución: la cámara esperada es de 720x1280, lo que condiciona el coste computacional y el hardware necesario.
- Idiomas: no disponible; el campo de idiomas no está cumplimentado y no es aplicable en el sentido habitual.
- Licencia: apache-2.0, que permite uso comercial, pero conviene verificar las licencias del dataset de entrenamiento y del robot asociado antes de un despliegue en producción.
- Sin soporte documentado de cuantización ni de otros formatos de pesos distintos de safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manashvi1205/so101_task1_act_test
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
