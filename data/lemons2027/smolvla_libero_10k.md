# lemons2027/smolvla_libero_10k

## Resumen

`lemons2027/smolvla_libero_10k` es un ajuste fino del modelo vision-language-action (VLA) SmolVLA, publicado por el usuario lemons2027 sobre el checkpoint base `lerobot/smolvla_base` de Hugging Face. No es un modelo de lenguaje: es una política de robótica que recibe dos imágenes de cámara de 256×256 píxeles más el estado del robot (8 dimensiones) y emite un vector de acción de 7 dimensiones para un brazo Franka Panda. Con 450.046.176 parámetros y un repositorio de 0,9 GB, está pensado para ejecutarse en hardware de consumo y para flujos de imitación supervisada dentro del ecosistema LeRobot.

El modelo resuelve el problema de mapear percepción visual y propriocepción a comandos motores en tareas de manipulación de mesa. Se ha entrenado específicamente sobre el conjunto `lerobot/libero`, derivado del benchmark LIBERO, que agrupa 1.693 episodios y 273.465 fotogramas a 10 FPS repartidos en 40 instrucciones en inglés del tipo "put the white mug on the left plate" o "open the top drawer and put the bowl inside". El resultado es una política especializada en ese repertorio cerrado de tareas, no un agente generalista.

Su relevancia ahora es doble: por un lado, SmolVLA (arXiv 2506.01844) demuestra que un VLA compacto de ~450 M de parámetros puede ser competitivo frente a modelos de miles de millones, abaratando la experimentación; por otro, este checkpoint sirve como ejemplo reproducible de ajuste fino con LeRobot 0.6.1 (10.000 pasos, batch 4, AdamW, lr 1e-4, semilla 1000), útil como línea base y como plantilla para entrenar políticas propias. La licencia Apache-2.0 facilita su uso comercial, aunque con las cautelas propias de un modelo entrenado en simulación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en el backbone SmolVLM-2 con experto de acción; no es un transformer de texto puro |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; no aplica ventana de contexto de texto: la entrada es 2 imágenes de 256×256 + estado de 8 dimensiones |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible en la información del repositorio; las instrucciones del dataset están en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB, librería `lerobot`) |

| Entrada / salida | Tipo | Forma |
|---|---|---|
| `observation.images.image` | visual | (3, 256, 256) |
| `observation.images.image2` | visual | (3, 256, 256) |
| `observation.state` | estado | (8,) |
| `action` | acción | (7,) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un backbone de visión-lenguaje (familia SmolVLM-2) con un experto de acción entrenado mediante flow matching, de forma que la política genera trayectorias continuas de acción condicionadas por las imágenes y el estado proprioceptivo. El diseño del modelo base prioriza la eficiencia computacional para permitir despliegue en GPUs de consumo e inferencia asíncrona en bucle de control. El paper asociado (arXiv 2506.01844) describe el preentrenamiento sobre datos comunitarios de LeRobot; el número exacto de episodios y la composición completa del corpus de preentrenamiento no se detallan en la información disponible de este repositorio.

Este checkpoint concreto es un ajuste fino supervisado (imitation learning) sobre `lerobot/libero`: 1.693 episodios, 273.465 fotogramas a 10 FPS (unas 161 muestras por episodio, aproximadamente 16 segundos de grabación media), con 40 instrucciones distintas y dos cámaras denominadas `image` e `image2`. La configuración de entrenamiento reportada es de 10.000 pasos con batch size 4, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se documenta en la model card el uso de RLHF, DPO ni de técnicas de refinamiento posteriores al entrenamiento por imitación.

## Capacidades

- Control robótico de manipulación de mesa: genera acciones de 7 dimensiones (típicamente 6 de pose del efector más apertura de pinza) para un brazo Franka Panda.
- Percepción visual binocular: consume dos cámaras RGB de 256×256, lo que permite desambiguar objetos y estimar profundidad relativa.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto (las 40 instrucciones del dataset LIBERO), no mediante un identificador de tarea.
- Ejecución de secuencias de pick-and-place: recoger objetos (tazas, cuencos, cajas, botellas, salsas) y colocarlos en platos, cestas, estantes, cajones o microondas.
- Manipulación articulada: abrir y cerrar cajones y puertas de armario o microondas, y accionar el interruptor de la vitrocerámica.
- Operación a 10 FPS, frecuencia compatible con bucles de control de imitación de baja latencia.
- Ajuste fino adicional: al estar en formato LeRobot, se puede reentrenar con `lerobot-train` sobre nuevos datasets propios.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni modo "thinking": no es un LLM.

## Casos de uso

- Investigación en imitación robótica: usar el checkpoint como línea base reproducible para comparar variantes de SmolVLA sobre el benchmark LIBERO, ya que la receta de entrenamiento está completamente especificada (pasos, batch, lr, semilla).
- Reproducción de resultados LIBERO: validar pipelines de evaluación con `lerobot-rollout` sobre el robot `panda` antes de entrenar políticas propias.
- Punto de partida para ajuste fino con datos propios: reentrenar sobre un dataset LeRobot local con las mismas claves de observación (`image`, `image2`, `observation.state`) para adaptar la política a una celda de trabajo nueva.
- Prototipado de pick-and-place en laboratorio: tareas de recogida y depósito de objetos rígidos ligeros (tazas, cajas, salsas) en entornos controlados con iluminación estable.
- Automatización de apertura de cajones y contenedores: la política incluye instrucciones de apertura de cajones superior, medio e inferior y de cierre de armario, útil para estudiar manipulación articulada.
- Docencia y divulgación: ejemplo completo y ligero (~450 M de parámetros, 0,9 GB) para explicar el ciclo completo de un VLA: grabación de datos, entrenamiento, evaluación y despliegue en LeRobot.
- Pruebas de despliegue en hardware de consumo: validar latencia y estabilidad de una política VLA en una GPU de gama media antes de invertir en modelos mayores.
- Generación de datos sintéticos y aumento de dataset: ejecutar la política en simulación para recolectar episodios adicionales y estudiar su calidad antes de mezclarlos con demostraciones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito por tarea, comparaciones con otras políticas ni métricas de evaluación sobre LIBERO; únicamente se documenta la configuración de entrenamiento (10.000 pasos, batch 4, AdamW, lr 1e-4, semilla 1000) y el volumen del dataset (1.693 episodios, 273.465 fotogramas, 10 FPS, 40 tareas).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los pesos ocupan aproximadamente 0,9 GB, y con activaciones de dos imágenes de 256×256 más el estado, la huella se sitúa en el entorno de 2-3 GB. En fp32, los pesos suben a unos 1,8 GB y el total a 3-4 GB. En int8 (no publicado, habría que cuantizar) rondaría los 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna sirve. RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 y GPUs de portátil con 6-8 GB son suficientes; A100 o H100 no son necesarias para inferencia, solo tendrían sentido para reentrenar con batches mayores.
- ¿Cabe en GPU de consumo? Sí, con margen amplio: 450 M de parámetros y 0,9 GB de repositorio lo sitúan muy por debajo de los 8 GB típicos.
- CPU: la inferencia en CPU es técnicamente viable por tamaño, pero no se dispone de cifras de latencia publicadas.
- Opciones de despliegue: LeRobot es la vía oficial, mediante `lerobot-rollout --policy.path=...` con `--robot.type=panda` y dos cámaras OpenCV; también se puede cargar como política PyTorch dentro de un script propio. No hay versiones GGUF ni soporte documentado en llama.cpp, Ollama, vLLM o TGI, que están orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: no disponibles. El dataset se grabó a 10 FPS, lo que marca la frecuencia de control esperada, y el diseño de SmolVLA apunta a inferencia asíncrona para mantener el bucle de control, pero no se publican medidas de latencia por paso en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `lemons2027/smolvla_libero_10k` (este) | ~450 M | 2 imágenes 256×256 + estado 8D | Apache-2.0 | Hugging Face, vía LeRobot |
| `lerobot/smolvla_base` | ~450 M | 2 imágenes 256×256 + estado 8D | Apache-2.0 | Hugging Face, modelo base generalista |
| OpenVLA-7B | ~7 B | 1 imagen + instrucción | MIT (no verificado en la informacion disponible) | Pesos abiertos, requiere GPU de mayor VRAM |
| pi0 (Physical Intelligence) | ~3 B | imágenes + estado + instrucción | no disponible en la informacion proporcionada | Pesos publicados; ecosistema distinto (openpi) |

Frente al modelo base, este checkpoint cambia generalidad por especialización: mismo tamaño y licencia, pero entrenado exclusivamente con las 40 tareas de LIBERO y con dos cámaras. Frente a OpenVLA-7B o pi0, la ventaja es el coste computacional (un orden de magnitud menos de parámetros) y la desventaja es la especialización y la ausencia de métricas publicadas que permitan comparar tasas de éxito.

## Limitaciones y advertencias

- Especialización estrecha: solo cubre las 40 instrucciones del dataset LIBERO. Fuera de ese repertorio y de esa distribución visual, el comportamiento no está garantizado.
- Encarnación única: entrenado para el robot `panda` con estado de 8 dimensiones y acción de 7 dimensiones, y con exactamente dos cámaras en las claves `image` e `image2`. Cambiar la configuración de sensores invalida la política.
- Brecha simulación-realidad: LIBERO es un entorno de simulación. No hay evidencia publicada de transferencia al mundo físico con este checkpoint, ni de robustez ante cambios de iluminación, fondo u oclusión.
- Sin métricas de éxito publicadas: no se puede afirmar qué tasa de acierto tiene en cada tarea; descargas y likes son cero en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Riesgo de sobreajuste: 10.000 pasos con batch 4 sobre 1.693 episodios es una receta corta y con poca diversidad; es esperable un ajuste fuerte a las trayectorias del dataset.
- Idioma: las instrucciones están en inglés y no se declaran capacidades multilingües. Instrucciones en castellano no están cubiertas ni evaluadas.
- Alucinación: no aplica el concepto de alucinación textual, pero sí el fallo silencioso, es decir, la política puede ejecutar una acción plausible y equivocada sin señal de error.
- Sin garantías de seguridad: no hay parada de emergencia, detección de colisión ni límites articulares integrados. Cualquier uso con hardware real requiere capas de seguridad externas y supervisión humana.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene revisar la procedencia de los datos de entrenamiento y de los datos comunitarios usados en el preentrenamiento del modelo base antes de un despliegue comercial.
- Versionado: creado y actualizado el mismo día (2026-10-28), sin historial de revisiones ni mantenimiento demostrable. Fijar el commit concreto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lemons2027/smolvla_libero_10k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/libero
- Paper de SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
