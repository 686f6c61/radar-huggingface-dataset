# sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_5k

## Resumen

El modelo `sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_5k` es un ajuste fino (fine-tune) de la política robótica π₀.₅ (Pi05) de Physical Intelligence, publicado por el usuario `sam-guided-vlas` a través de la librería LeRobot de Hugging Face. Se trata de un modelo visión-lenguaje-acción (VLA) orientado a control robótico por imitación: recibe observaciones multimodales (estado del robot e imágenes de cámaras) y produce directamente comandos de acción de 7 dimensiones para un brazo robótico Franka Emika Panda.

El modelo deriva de la base `lerobot/pi05_base`, la implementación de π₀.₅ adaptada desde el repositorio OpenPI de Physical Intelligence, y ha sido entrenado sobre el dataset `sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live`, compuesto por 200 episodios y 30.830 fotogramas a 20 FPS. Con 4.143.404.816 parámetros totales (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB, el modelo está pensado para ejecutar tareas de manipulación como agarre y colocación de objetos domésticos.

Su relevancia radica en que ejemplifica el flujo de trabajo actual de la robótica open source basada en VLA: partir de un modelo fundacional preentrenado y realizar un fine-tune específico de tarea con LeRobot, lo que permite reproducir políticas de manipulación sin entrenar desde cero. La licencia Apache 2.0 facilita su reutilización, aunque la información publicada sobre evaluación real es todavía inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), derivada de π₀.₅ (Pi05); detalles internos de la columna vertebral no disponibles |
| Parametros totales | 4.143.404.816 (≈ 4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | Franka Emika Panda |
| Camaras | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entradas | `observation.state` (9,), 3 imágenes (3, 224, 224) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 9,4 GB |
| Libreria | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/pi05_base |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅ de Physical Intelligence, descrita por el autor como un modelo visión-lenguaje-acción diseñado para la generalización en mundo abierto, evolucionando π₀ para generalizar a entornos y situaciones nunca vistos durante el entrenamiento. La implementación empleada proviene del repositorio OpenPI, adaptada a la librería LeRobot. La model card no detalla la columna vertebral concreta (si es un transformer denso, la composición del codificador de visión, el mecanismo de *action chunking*, etc.), por lo que esos extremos quedan como no disponibles.

El entrenamiento es un ajuste fino supervisado por imitación sobre el dataset `sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live`, que contiene 200 episodios y 30.830 fotogramas capturados a 20 FPS. Las tareas cubiertas incluyen manipulación de objetos como dosificador de jabón, mermelada, tarro, cereales, bloque de cuchillos, hervidor, pera, patata, boniato, bollo, cesta, comida en caja, tarta, lata, hamburguesa, limón, naranja, especias, calabaza y pulverizador. La configuración de entrenamiento reportada es de 5.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05, semilla 0 y LeRobot versión 0.6.0. No se declara explícitamente el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de acciones robóticas: produce vectores de acción de dimensión 7 para control de un brazo Panda a partir de observaciones de estado e imágenes.
- Percepción multimodal: consume tres flujos visuales simultáneos (vista del agente y dos cámaras en mano) y un vector de estado de 9 componentes.
- Control por imitación de tareas de manipulación: entrenado para tareas concretas de recogida y colocación de objetos domésticos (lista de 20 tareas en el dataset).
- Generalización en mundo abierto: el modelo base π₀.₅ está orientado a generalizar a entornos y situaciones no vistos según la descripción de Physical Intelligence.
- Ejecución de políticas en bucle cerrado mediante `lerobot-rollout`, con control de duración y especificación de tarea en lenguaje natural (`--task`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multietapa: no disponible como capacidad declarada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): visión sí (entradas de imagen); no se declaran otras capacidades especiales.

## Casos de uso

- Manipulación robótica de objetos domésticos: el modelo puede ejecutar tareas como agarrar un tarro, una lata o una fruta y colocarlos, gracias a que fue ajustado específicamente sobre episodios de esas tareas con tres vistas de cámara.
- Automatización de líneas de recogida y colocación (pick-and-place): integrándolo en un brazo Panda, permite repetir ciclos de recogida y depósito de objetos etiquetados en el dataset sin reprogramación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar el efecto del número de pasos, el tamaño de lote o la composición del dataset en políticas VLA pequeñas.
- Prototipado de políticas de visión-lenguaje-acción: al derivar de `lerobot/pi05_base`, permite hacer fine-tuning adicional con nuevas tareas usando `lerobot-train` y validar el flujo completo de LeRobot.
- Evaluación comparativa de manipuladores: dado que especifica el tipo de robot Panda y los nombres de cámara esperados, se puede desplegar en un montaje equivalente para comparar su comportamiento frente a otras políticas.
- Despliegue en simulación o laboratorio con `lerobot-rollout`: el comando de ejemplo permite lanzar la política durante una duración determinada y una tarea concreta, útil para pruebas de regresión antes de pasar a hardware real.
- Recolección de datos guiada: el nombre del dataset (`mask`, `blur`, `sim`, `all_cameras`, `live`) sugiere variantes de preprocesado visual, por lo que puede emplearse para estudiar el impacto de enmascarado o desenfoque en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito por tarea, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmética a partir del número de parámetros (4.143.404.816), en precisión de 16 bits los pesos ocuparían aproximadamente 8,3 GB, y en 32 bits aproximadamente 16,6 GB; a ello habría que sumar el coste de activaciones y buffers de imagen.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño de pesos, una GPU con 16 GB o más podría alojar los pesos en 16 bits, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible. El dataset de entrenamiento se capturó a 20 FPS, pero no se declara la frecuencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sam-guided-vlas/...pi05__seed_0__steps_5k` (este modelo) | 4,14 mil millones | no disponible | sin resultados de evaluacion publicados | apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con modelos alternativos (por ejemplo, otras políticas VLA como π₀ u OpenVLA) en términos de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara explícitamente que no se han proporcionado resultados de evaluación, por lo que se desconoce la tasa de éxito real en cada tarea.
- Sesgos conocidos: no disponible; no se documentan sesgos del dataset ni de las políticas.
- Riesgo de alucinación: aplicable en el sentido de que un modelo VLA puede generar secuencias de acción incorrectas o no físicamente viables ante entradas fuera de distribución; no se cuantifica.
- Especificidad de hardware: el modelo espera un robot Panda con cámaras concretas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un vector de estado de 9 dimensiones; no funcionará directamente en otra morfología o configuración de cámaras sin adaptación.
- Limitación por tarea: fue ajustado sobre un dataset con 200 episodios y 20 tareas concretas; su comportamiento fuera de ese conjunto de tareas no está garantizado.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de licencia y se cite según corresponda. No se declaran restricciones adicionales.
- Trazabilidad: el modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, y una fecha de creación de 2026-09-10, lo que indica que se trata de un artefacto reciente y sin validación por parte de la comunidad.
- Documentación incompleta: no se especifican cuantizaciones, idiomas, longitud de contexto ni detalles internos de la arquitectura, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_5k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI (referenciado en la model card como origen de la implementación): no disponible como enlace explícito en la información proporcionada
