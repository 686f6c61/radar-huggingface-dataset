# sachinkum0009/smolvla_wrappers_to_bin_merged_v2_aug

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Este repositorio concreto, `sachinkum0009/smolvla_wrappers_to_bin_merged_v2_aug`, es un ajuste fino del modelo base `lerobot/smolvla_base` realizado por un tercero para una tarea específica: recoger un envoltorio de caramelo y depositarlo en una papelera. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y hasta cuatro cámaras) y produce un vector de acción de 6 dimensiones.

La relevancia de SmolVLA radica en que demuestra que es posible obtener políticas VLA competitivas con un presupuesto computacional reducido, hasta el punto de poder desplegarse en hardware de consumo. Frente a modelos VLA de gran escala, SmolVLA apuesta por un diseño compacto que reduce el coste de inferencia y facilita el ciclo de iteración en robótica de laboratorio y prototipado. Este ajuste concreto ilustra ese flujo de trabajo: un investigador parte del modelo base y lo especializa con 120 episodios teleoperados.

El modelo tiene 450 millones de parámetros, se distribuye en formato safetensors con licencia Apache 2.0 y está pensado para ejecutarse con la librería LeRobot sobre un robot `so_follower` (SO-101 de bajo coste). No se trata de un modelo de propósito general, sino de una política especializada cuya utilidad está acotada al dominio de la tarea y a la configuración de hardware con la que fue entrenada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA); detalles internos de capas no disponibles |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica, no conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot (versión 0.7.0 durante el entrenamiento) |
| Tipo de robot | `so_follower` |
| Cámaras | `front`, `wrist` (la model card define tres cámaras de observación a 256x256 y una a 480x640) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Salida de acción | `action`, shape `(6,)` |
| Tamaño del repositorio | 0,9 GB |
| Modelo base | `lerobot/smolvla_base` |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y un decodificador de acciones, siguiendo el paradigma de los modelos VLA contemporáneos (documentado en el paper arXiv:2506.01844). La model card no detalla la composición interna de capas, el mecanismo de atención ni el esquema exacto de fusión multimodal, por lo que esos extremos quedan como no disponibles. El modelo se entrena mediante aprendizaje por imitación supervisado sobre trayectorias teleoperadas, no mediante RLHF ni DPO.

El ajuste fino se realizó sobre el dataset `sachinkum0009/wrappers_to_bin_merged_v2`, compuesto por 120 episodios y 64.238 fotogramas a 30 FPS. La configuración de entrenamiento fue de 30.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. Las tareas del dataset incluyen variantes de dificultad (distractores como una barra de caramelo u objetos alrededor, una versión "difficult level v2" y una versión con iluminación de tarde), lo que sugiere un esfuerzo deliberado por aumentar la robustez mediante diversidad de condiciones. El sufijo `_aug` del repositorio apunta a algún tipo de aumento de datos, aunque la model card no lo especifica.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones (típicamente posición y orientación del efector final) a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa simultáneamente hasta tres vistas a 256x256 y una vista adicional a 480x640, lo que permite cubrir perspectiva frontal, de muñeca y cámaras auxiliares.
- Ejecución de instrucciones en lenguaje natural: acepta una descripción textual de la tarea (por ejemplo, "Pick up the candy wrapper and put it in the bin") que condiciona la política.
- Robustez ante distractores: el entrenamiento incluye variantes con objetos distractores y cambios de iluminación.
- Despliegue en hardware de consumo: el tamaño de 450 M parámetros y el formato safetensors permiten inferencia en GPU de gama media.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto libre; no es un modelo conversacional.
- Capacidades multilingües: no disponibles; la instrucción de tarea se usa como condicionamiento, pero no se documenta cobertura lingüística.

## Casos de uso

- Automatización de recogida de residuos en entornos de laboratorio: la política se ejecuta sobre un SO-101 con cámara frontal y de muñeca para detectar el envoltorio y depositarlo en la papelera, usando el comando `lerobot-rollout` con la tarea correspondiente.
- Banco de pruebas para investigación en VLA: al ser un ajuste reproducible sobre `smolvla_base` con configuración documentada (30.000 pasos, batch 64, lr 1e-4), sirve como línea base para comparar técnicas de aumento de datos o de fusión multimodal.
- Evaluación de robustez ante iluminación: la inclusión de una variante "evening light version" en el dataset permite medir la degradación de la política bajo cambios de iluminación y diseñar estrategias de dominio aleatorio.
- Prototipado de bajo coste en robótica educativa: el robot `so_follower` y una GPU de consumo son suficientes para ejecutar la política, lo que lo hace adecuado para cursos y talleres de aprendizaje por imitación.
- Estudio de distractores en manipulación: las variantes con barra de caramelo y objetos alrededor permiten analizar cómo la política discrimina el objeto objetivo frente a objetos visualmente similares.
- Integración en pipelines de LeRobot: el modelo se puede cargar con `--policy.path=sachinkum0009/smolvla_wrappers_to_bin_merged_v2_aug` y combinarse con el resto de utilidades del ecosistema (visualización de datasets, entrenamiento, rollout) para ciclos de mejora iterativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results_", por lo que no existen tasas de éxito, métricas de precisión de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M parámetros en precisión FP32, el peso ronda 1,8 GB; en FP16/BF16, unos 0,9 GB. A ello hay que sumar el coste de los codificadores visuales y los buffers de activación, no cuantificados en la documentación.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060 de 12 GB o superior debería ser suficiente; el paper de SmolVLA afirma que el modelo puede desplegarse en hardware de consumo.
- Cabe en GPU de consumo: sí, según la descripción del modelo base ("can be deployed on consumer-grade hardware"); no se detalla una lista concreta de GPUs validadas.
- Opciones de despliegue: LeRobot 0.7.0 o superior mediante `lerobot-rollout` y `lerobot-train`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset de entrenamiento, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sachinkum0009/smolvla_wrappers_to_bin_merged_v2_aug` | 450 M | VLA (ajuste fino) | no disponible | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la información | VLA (base) | no disponible | no disponible en la información | Hugging Face |
| Políticas de imitación tipo ACT/DP de LeRobot | no disponible | Política visomotora | no aplica | no disponible | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados: no hay benchmarks publicados para este ajuste ni cifras de rendimiento del modelo base en la información disponible. La comparación más directa es con `lerobot/smolvla_base`, del que este repositorio es un ajuste fino especializado en una única tarea, por lo que cabe esperar mejor rendimiento en esa tarea concreta y peor generalización fuera de ella.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (`so_follower`); no se espera que funcione en otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento; un montaje distinto invalida la política.
- Riesgo de sobreajuste al entorno: aunque el dataset incluye variantes de dificultad e iluminación, 120 episodios y 64.238 fotogramas son un volumen modesto; la generalización a posiciones de objetos no vistas es incierta.
- Sesgos: no documentados; en robótica, los sesgos se manifiestan como preferencias por posiciones, colores o condiciones de iluminación presentes en los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y del dataset asociado.
- Idiomas: no se documenta cobertura lingüística; las instrucciones de tarea están en inglés y no hay evidencia de que el condicionamiento funcione en castellano.
- Fecha de creación futura en los metadatos (2026-11-22): conviene tratar las marcas temporales del repositorio con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachinkum0009/smolvla_wrappers_to_bin_merged_v2_aug
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sachinkum0009/wrappers_to_bin_merged_v2
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sachinkum0009/wrappers_to_bin_merged_v2
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
