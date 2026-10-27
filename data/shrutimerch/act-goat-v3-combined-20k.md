# shrutimerch/act-goat-v3-combined-20k

## Resumen

`shrutimerch/act-goat-v3-combined-20k` es una política de imitación (policy) para robótica basada en el método Action Chunking with Transformers (ACT), publicada en HuggingFace Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visuomotor entrenado para una única tarea —"Pick up the goat and place it in the bucket"— sobre un brazo `so_follower` (familia SO-100) con dos cámaras, una en la muñeca y otra exocéntrica. El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB.

El problema que resuelve es el de generar comandos motores de 6 dimensiones directamente a partir de píxeles y del estado de las articulaciones, sin planificación explícita ni modelado del entorno. ACT predice fragmentos (chunks) de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación y produce movimientos más suaves. Es relevante porque ejemplifica el flujo completo de LeRobot: recogida de datos por teleoperación, entrenamiento con un comando y despliegue con otro, todo con licencia Apache 2.0.

Se trata de un checkpoint de nicho: cero descargas, cero valoraciones, sin resultados de evaluación publicados y con una única tarea aprendida de 84 episodios. Cualquier uso en producción exigiría validación propia y, previsiblemente, reentrenamiento con datos del robot y del entorno de destino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE y codificadores de imagen ResNet, según el paper 2304.13705 |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. La política consume una observación por paso y emite un chunk de acciones (horizonte no disponible en la información proporcionada) |
| Tipos de cuantización | No documentados. Los pesos se distribuyen en safetensors; el tamaño del repo (0,2 GB para 51,7 M de parámetros) es coherente con fp32 |
| Idiomas soportados | No disponible / no aplica. No hay interfaz en lenguaje natural salvo la cadena de tarea con la que se condiciona la política |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo LeRobot) |
| Librería y versión de entrenamiento | LeRobot 0.6.1 |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `wrist` (3, 480, 640) y `exocentric` (3, 720, 1280) |
| Estado de observación | `observation.state`, shape (6,) |
| Salida | `action`, shape (6,) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT combina un autocodificador variacional condicional (CVAE) con un transformer encoder-decoder. Las imágenes de las dos cámaras se procesan con codificadores convolucionales de tipo ResNet, se aplanan en tokens y se concatenan con el estado articular y con una variable latente que modela la variabilidad de las demostraciones humanas. El decodificador genera un chunk de acciones con las posiciones objetivo de las 6 articulaciones. En entrenamiento se optimiza una pérdida de reconstrucción L1 sobre las acciones junto con un término de regularización KL sobre la latente; en inferencia la latente se fija a la media, de modo que la política es determinista. La innovación clave del método frente a políticas paso a paso es precisamente la predicción por chunks, que mitiga el error compuesto y permite promediar temporalmente predicciones solapadas.

Los detalles concretos de este checkpoint: 20.000 pasos de entrenamiento, batch de 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. El conjunto de datos es `shrutimerch/goat-pickup-v3-combined`, con 84 episodios, 46.687 fotogramas a 30 FPS y una única instrucción de tarea. No se especifica el número de tokens ni la composición del dataset más allá de esas cifras, ni se documenta ningún proceso de RLHF o DPO (no aplicable en este paradigma: el aprendizaje es por imitación supervisada). El horizonte de chunk y el resto de hiperparámetros del modelo no figuran en la model card.

## Capacidades

- Control visuomotor de 6 grados de libertad a partir de dos vistas de cámara y del estado articular.
- Ejecución de una tarea concreta de pick-and-place: coger un objeto (un "goat") y depositarlo en un cubo.
- Predicción de chunks de acción, lo que produce trayectorias más suaves que el control paso a paso.
- Inferencia a 30 FPS, alineada con la frecuencia de captura del dataset de entrenamiento.
- Punto de partida para fine-tuning con `lerobot-train` sobre datasets propios.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso ni diálogo: no es un modelo generativo de texto.
- Sin capacidades multilingües, de visión general, de audio ni de modo "thinking".
- Compatible con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: replicar la tarea entrenada sobre un `so_follower` con las mismas cámaras y disposición; es el escenario para el que existen datos y para el que la política fue diseñada.
- **Punto de partida para fine-tuning**: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de 50 a 100 episodios para adaptar la política a nuevos objetos, posiciones o iluminación, aprovechando que el coste de entrenamiento de 51,7 M de parámetros es bajo.
- **Docencia y divulgación de aprendizaje por imitación**: sirve como ejemplo reproducible del ciclo teleoperación → dataset → entrenamiento → despliegue, con comandos de la CLI documentados y tiempos de entrenamiento asumibles en una GPU de consumo.
- **Línea base en comparativas de políticas**: evaluar ACT frente a Diffusion Policy u otras políticas de imitación sobre el mismo dataset y la misma célula robótica, con la ventaja de ser un checkpoint ya entrenado y de tamaño reducido.
- **Validación de configuraciones de cámara**: comparar el rendimiento con cámara de muñeca frente a vista exocéntrica, o evaluar el efecto de cambiar la resolución de la cámara exocéntrica (720x1280 en entrenamiento).
- **Prototipado en celdas de manipulación ligeras**: logística de piezas pequeñas, clasificación de objetos en contenedores o alimentación de máquinas, siempre tras validar la tasa de éxito en el entorno real.
- **Pruebas de infraestructura de control**: medir latencia extremo a extremo del bucle percepción-acción en hardware de bajas prestaciones (Jetson, mini-PC con GPU) antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota literal "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, número de ensayos ni condiciones experimentales que permitan comparar el checkpoint con alternativas.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 0,21 GB para los pesos en fp32; en la práctica, el consumo lo dominan las activaciones y los dos flujos de cámara. Cabe holgadamente en cualquier GPU con 4 GB o más.
- **GPU recomendadas**: no requiere GPU de centro de datos. Una RTX 3060, RTX 4060 o superior es suficiente; también una Jetson Orin Nano o similar para despliegue embebido. A100/H100 no aportan ventaja apreciable para 51,7 M de parámetros.
- **CPU**: la inferencia es viable en CPU para pruebas, aunque el bucle a 30 FPS con dos cámaras conviene medirlo en el hardware objetivo antes de desplegar.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--policy.path=shrutimerch/act-goat-v3-combined-20k`), PyTorch con pesos safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. El dato de referencia es la frecuencia de entrenamiento, 30 FPS, que marca el periodo de control de 33 ms por paso.
- **Almacenamiento**: 0,2 GB de repositorio, más el dataset si se va a reentrenar.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-goat-v3-combined-20k (este) | ACT, imitación con chunks de acción | 51.668.614 | No disponible | Apache 2.0 | HuggingFace Hub, 0 descargas |
| shrutimerch/act-goat-v3-20k | ACT, misma tarea, dataset sin combinar | No disponible | No disponible | No disponible | HuggingFace Hub |
| Diffusion Policy | Políticas de difusión para manipulación | No disponible | No disponible | No disponible | Referencia académica |
| SmolVLA | VLM ligero para robótica (familia SmolVLM) | No disponible en la información proporcionada | No disponible | No disponible | HuggingFace Hub |

No se dispone de cifras verificables de rendimiento para ninguna de las alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa queda pendiente de una evaluación propia sobre el mismo dataset y robot.

## Limitaciones y advertencias

- **Especialización extrema**: la política solo ha visto una instrucción ("Pick up the goat and place it in the bucket") y un robot concreto; no generaliza a otras tareas sin reentrenamiento.
- **Sin evaluación publicada**: no hay tasa de éxito ni ensayos documentados, así que el rendimiento real es desconocido. Cualquier despliegue debe ir precedido de una batería de pruebas propia.
- **Dataset pequeño**: 84 episodios y 46.687 fotogramas son pocos para una política visual; es esperable sobreajuste a posiciones, iluminación y fondo del entorno de grabación.
- **Riesgo de fallo silencioso**: al no haber componente de lenguaje ni verificación, la política ejecutará el gesto aprendido aunque no haya objeto que coger, sin señal de error.
- **Acoplamiento al hardware**: entrenada para `so_follower` con estado de 6 dimensiones y dos cámaras con nombres y resoluciones fijos (`wrist` a 480x640, `exocentric` a 720x1280); cambiar nombres, índices o resolución requiere ajustes.
- **Sin modelo de mundo**: no razona sobre el entorno ni planifica; la generalización fuera de distribución es limitada por diseño.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero la licencia no cubre los datos de entrenamiento ni las dependencias de LeRobot, que deben revisarse por separado.
- **Madurez**: cero descargas y cero valoraciones en el Hub, creado y actualizado el mismo día; no hay evidencia de uso por terceros.
- **Seguridad física**: al controlar un brazo real, deben existir límites de par, paradas de emergencia y zonas de exclusión; el modelo no incorpora ninguna capa de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shrutimerch/act-goat-v3-combined-20k
- Checkpoint hermano: https://huggingface.co/shrutimerch/act-goat-v3-20k
- Perfil del autor: https://huggingface.co/shrutimerch
- Dataset de entrenamiento: https://huggingface.co/datasets/shrutimerch/goat-pickup-v3-combined
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shrutimerch/goat-pickup-v3-combined
- Paper de ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
