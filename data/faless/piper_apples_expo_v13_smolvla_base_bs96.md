# Faless/piper_apples_expo_v13_smolvla_base_bs96

## Resumen

Faless/piper_apples_expo_v13_smolvla_base_bs96 es una política robótica de tipo vision-language-action (VLA) publicada por el usuario Faless en Hugging Face. Se trata de un ajuste fino del modelo base lerobot/smolvla_base sobre el conjunto de demostraciones Faless/piper_apples_expo_v13, y se distribuye con la librería LeRobot, el framework de aprendizaje por imitación de Hugging Face. Su función es controlar un brazo robótico Piper (tipo `piper_full`) para ejecutar una única tarea de manipulación: recoger manzanas rojas una a una y depositarlas en una cesta verde.

El modelo tiene 450.046.176 parámetros (unos 450 M) según los pesos en safetensors, con un repositorio de 0,9 GB. SmolVLA, el método citado en la metadata del repositorio (arXiv:2506.01844), se presenta como un VLA compacto y eficiente, con rendimiento competitivo a coste computacional reducido y desplegable en hardware de consumo. Esto lo hace relevante para investigación en robótica que necesita políticas de manipulación ejecutables en GPU de gama media, sin depender de clústeres.

La política consume dos cámaras (ego y front) a 256x256, un vector de estado de 8 dimensiones y una instrucción de tarea en texto; produce un vector de acción de 7 dimensiones. La licencia es Apache 2.0, lo que permite uso comercial, aunque el rendimiento real no está validado: la model card no incluye ninguna evaluación y el repositorio acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, derivada de SmolVLA; el detalle interno de capas y del experto de acciones no se especifica en la model card |
| Parametros totales | 450.046.176 (aprox. 450 M), según los pesos en safetensors |
| Parametros activos | no disponible; no hay indicios de que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | no aplicable; es una política robótica que procesa dos imágenes de 3x256x256, un vector de estado de 8 dimensiones y una instrucción de tarea |
| Tipos de cuantizacion | no disponible; el repositorio publica únicamente pesos en safetensors, sin versiones GGUF ni cuantizadas |
| Idiomas soportados | no disponible; no es un modelo de lenguaje conversacional (recibe una instrucción de tarea en texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de LeRobot) |

## Arquitectura y entrenamiento

El modelo es una política VLA entrenada por imitación supervisada sobre demostraciones teleoperadas. La model card identifica el método como SmolVLA (arXiv:2506.01844) y el punto de partida como lerobot/smolvla_base, un modelo base preentrenado del mismo tipo. La política consume tres entradas: `observation.state` con forma (8,), `observation.images.camera1` y `observation.images.camera2`, ambas con forma (3, 256, 256), y produce una salida `action` con forma (7,), que corresponde a los comandos del brazo Piper. Las cámaras declaradas por el autor son `ego` y `front`, correspondientes al robot `piper_full`.

El ajuste fino se realizó sobre el dataset Faless/piper_apples_expo_v13, compuesto por 779 episodios, 1.198.317 fotogramas capturados a 30 FPS y una única tarea: "Pick the red apples one by one and place them into the green basket". La configuración de entrenamiento documentada es de 55.000 pasos con tamaño de lote 96, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.2. La model card no especifica el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron etapas de RLHF o DPO; en el contexto del aprendizaje por imitación estos procedimientos no son habituales y no se mencionan. Tampoco se documentan innovaciones técnicas concretas más allá de las atribuidas al método SmolVLA en el artículo citado.

## Capacidades

- Control robótico de manipulación de extremo a extremo: transforma observaciones visuales y propioceptivas en comandos de acción de 7 dimensiones para el brazo Piper.
- Ejecución de una tarea específica de pick-and-place: recoger manzanas rojas y colocarlas en una cesta verde, con condicionamiento mediante instrucción de tarea en texto.
- Percepción visual estéreo mediante dos cámaras (`ego` y `front`) a resolución 256x256 y 3 canales.
- Integración de estado proprioceptivo de 8 dimensiones (posición de articulaciones u otros sensores del robot, según la definición del dataset).
- Control reactivo pensado para operar en el bucle de control a la frecuencia del dataset (30 FPS).
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente conversacional.
- No genera texto ni mantiene conversaciones: la instrucción de tarea es una cadena de entrada, no un diálogo.
- No es un modelo multilingüe en el sentido habitual; su cobertura de idiomas no está documentada.
- No incorpora modo "thinking", visión general de propósito general ni procesamiento de audio.

## Casos de uso

- Automatización de recogida de objetos en entorno controlado: la política ejecuta la secuencia completa de recoger manzanas y depositarlas en una cesta con un brazo Piper, siempre que la escena se parezca a la del dataset de entrenamiento (misma iluminación, mismos objetos y misma disposición general).
- Base para investigación en VLA compactos: al ser un ajuste fino de lerobot/smolvla_base con 450 M de parámetros, sirve como punto de partida reproducible para estudiar el efecto de nuevos datasets o hiperparámetros en tareas de manipulación.
- Reentrenamiento para nuevas tareas de pick-and-place: el flujo `lerobot-train` permite ajustar el modelo base con un dataset propio y comparar curvas de entrenamiento frente a esta política de referencia.
- Docencia y formación en robótica: el modelo permite montar un pipeline completo de aprendizaje por imitación (grabación con LeRobot, entrenamiento, despliegue con `lerobot-rollout`) con hardware asequible y dos cámaras OpenCV.
- Validación de hardware de consumo para robótica: con unos 450 M de parámetros, la política es un banco de pruebas realista para medir latencia de inferencia y viabilidad de control a 30 FPS en GPU de gama media.
- Pruebas de robustez de políticas de imitación: al conocerse la tarea y las condiciones de captura, el modelo es útil para medir degradación ante cambios de iluminación, posición de los objetos o presencia de distracciones.
- Prototipos de logística o agricultura de precisión en laboratorio: el escenario de recogida selectiva de fruta es trasladable a líneas de clasificación, siempre con un reentrenamiento específico del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación explícitamente vacía, con la nota "No evaluation results have been provided for this policy yet". No hay tasa de éxito, número de ensayos ni comparación con otras políticas en el repositorio. Tampoco se aportan métricas de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los 450 M de parámetros: unos 1,8 GB en FP32, 0,9 GB en BF16/FP16, 0,45 GB en INT8 y 0,23 GB en INT4. Hay que sumar el coste de activaciones por procesar dos imágenes de 256x256 y el búfer del bucle de control.
- El repositorio solo publica pesos en safetensors, sin cuantizaciones listas para usar; las cifras de INT8 e INT4 son estimaciones y requerirían una conversión propia.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes con 8 GB o más de VRAM. También es viable en GPU de datacenter (A100, H100, L40S), aunque están sobredimensionadas para este tamaño.
- Despliegue previsto mediante LeRobot: `lerobot-rollout` para ejecutar la política en el robot y `lerobot-train` para reentrenar. El entorno requiere PyTorch y CUDA.
- No hay evidencia en la documentación de soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF; son herramientas orientadas a modelos de lenguaje y no al bucle de control robótico.
- Latencia y throughput: no publicados. La referencia práctica es la frecuencia de captura del dataset, 30 FPS, que marca el ritmo al que debe ejecutarse el bucle de inferencia y control.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Faless/piper_apples_expo_v13_smolvla_base_bs96 | 450 M | VLA ajustada para una tarea concreta | apache-2.0 | Hugging Face (librería LeRobot) |
| lerobot/smolvla_base | no disponible (mismo orden de magnitud, arquitectura SmolVLA) | VLA base preentrenada | apache-2.0 | Hugging Face (librería LeRobot) |
| OpenVLA | aprox. 7 B | VLA basada en un modelo de lenguaje de 7 B | no disponible (sujeta a la licencia del modelo lingüístico subyacente) | Hugging Face |
| Octo | aprox. 93 M | Política transformer para manipulación generalista | no disponible | Hugging Face |

Los datos de los modelos alternativos proceden de documentación pública y pueden variar; conviene verificarlos antes de citarlos. La comparación directa de rendimiento no es posible porque esta política no publica ninguna evaluación.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito ni número de ensayos, por lo que el rendimiento real en el robot es desconocido.
- Entrenada para una única tarea y un único montaje: 779 episodios de una sola instrucción de recogida de manzanas. Es previsible un mal rendimiento ante objetos, posiciones, colores o tareas distintos sin reentrenamiento.
- Dependencia estricta del hardware: exige un robot `piper_full` y dos cámaras cuyos nombres e índices deben coincidir con las claves de observación del entrenamiento (`observation.images.camera1`, `observation.images.camera2`); si no coinciden, la política no funcionará correctamente.
- Sensibilidad al dominio visual: cambios de iluminación, fondo, tipo de cesta o color de los objetos pueden degradar el comportamiento, ya que el dataset no documenta variabilidad de estas condiciones.
- Riesgo de alucinación en el sentido robótico: el modelo puede generar trayectorias o acciones plausibles pero incorrectas, con fallos de agarre, colisiones o movimientos erráticos cuando la observación se aleja de la distribución de entrenamiento.
- Sin soporte de lenguaje natural general: no debe emplearse como modelo de texto, chatbot, resumen, traducción ni generación de código.
- Idiomas no documentados: la única entrada textual es la instrucción de tarea, y no se especifica qué idiomas maneja.
- Licencia Apache 2.0: permite uso comercial del modelo, pero el autor no documenta la procedencia ni las condiciones de licencia de los datos de entrenamiento, lo que conviene revisar antes de un despliegue comercial.
- Sin cuantizaciones publicadas: cualquier despliegue en INT8 o INT4 requiere conversión y validación propias.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay validación externa ni demostraciones publicadas.
- Se desconoce si existe una versión de la política con evaluación o mejoras posteriores; el repositorio fue creado el 2026-09-27 y actualizado ese mismo día.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/piper_apples_expo_v13_smolvla_base_bs96
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_expo_v13
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_expo_v13
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
