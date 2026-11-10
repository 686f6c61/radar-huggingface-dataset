# felsager/pi05_cube2cross_train_rtc_2

## Resumen

`felsager/pi05_cube2cross_train_rtc_2` es un ajuste fino (fine-tuning) del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. El modelo base, `lerobot/pi05_base`, se ha entrenado específicamente para una tarea robótica de manipulación: recoger un cubo de un color determinado y colocarlo sobre una cruz roja. Lo publica el usuario `felsager` junto con el dataset de demostraciones `felsager/vla_cubes_cross_dr`.

El modelo resuelve el problema de control robótico de extremo a extremo (end-to-end) mediante imitación: consume el estado del robot (10 dimensiones) y dos cámaras (vista superior y vista de muñeca, 480x640 píxeles cada una) y produce directamente un vector de acción de 10 dimensiones. Es relevante como ejemplo práctico de cómo se puede especializar un modelo VLA de propósito general en una tarea concreta de laboratorio con hardware real (un UR5e con mano de dos dedos), y de cómo LeRobot facilita el ciclo completo de entrenamiento, despliegue y evaluación.

Arquitectura: es un modelo VLA basado en π₀.₅, que combina un backbone de visión y lenguaje con un cabezal de acciones (action expert). Parámetros totales: 4.143.404.816 (aproximadamente 4,14 mil millones). El repositorio ocupa 24,5 GB en safetensors. Licencia Gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence; adaptación LeRobot del repositorio OpenPI |
| Parametros totales | 4.143.404.816 (≈4,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de política robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Libreria / framework | lerobot 0.6.2 |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist (3x480x640 cada una) |
| Entrada de estado | observation.state, shape (10,) |
| Salida de accion | action, shape (10,) |
| Dataset de entrenamiento | felsager/vla_cubes_cross_dr (999 episodios, 510.363 frames, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 5e-05 |
| Semilla | 0 |

## Arquitectura y entrenamiento

El modelo es un VLA (Vision-Language-Action) derivado de π₀.₅, la evolución de π₀ de Physical Intelligence orientada a la generalización en entornos abiertos. La implementación utilizada es la de LeRobot, adaptada del repositorio open source OpenPI. La arquitectura combina percepción visual (dos cámaras a 480x640 y 30 FPS), una instrucción de tarea en lenguaje natural y el estado propioceptivo del robot (10 dimensiones) para producir un vector de acción continuo de 10 dimensiones. No se detalla en la información disponible el número exacto de capas, la dimensión del modelo ni la composición del dataset de preentrenamiento del modelo base.

El ajuste fino se realizó sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 frames grabados a 30 FPS con un robot UR5e equipado con una mano de dos dedos (`ur5e_hand_e`). Las tareas cubiertas son cuatro variantes de "recoger el cubo [verde/azul/amarillo/rojo] y colocarlo sobre la cruz roja". El entrenamiento se ejecutó durante 30.000 pasos con batch size 16, optimizador AdamW y learning rate 5e-05, con semilla 0, usando LeRobot 0.6.2. No se especifica en la información disponible si se aplicaron técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Control robótico de manipulación de extremo a extremo: genera acciones continuas de 10 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: procesa simultáneamente las vistas `top` y `wrist` a resolución 480x640.
- Comprensión de instrucciones en lenguaje natural: acepta tareas como "pick up the green cube and place it on the red cross." y discrimina por color del cubo.
- Discriminación de objetos por color: entrenado con cubos verde, azul, amarillo y rojo.
- Ejecución de políticas de imitación entrenadas con demostraciones (imitation learning / behavior cloning).
- Despliegue en robot real mediante `lerobot-rollout` con estrategia `base`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso textual, generación de código, matemáticas ni procesamiento de audio.
- Capacidades multilingües: no documentadas; las instrucciones del dataset están en inglés.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger un cubo y depositarlo sobre una cruz roja, adecuado para experimentos de manipulación con UR5e y objetos de cuatro colores distintos.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de entrenamiento (por ejemplo, el sufijo `rtc_2` sugiere configuraciones de real-time chunking) sobre el mismo dataset y robot.
- Prototipado de políticas VLA en robótica de escritorio: permite validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) con hardware accesible antes de escalar a tareas más complejas.
- Generación de datos sintéticos y aumentación: el modelo puede ejecutar rollouts automáticos que sirvan como base para recolectar nuevas trayectorias o evaluar robustez ante cambios de iluminación y posición.
- Benchmark interno de manipulación: al tener una tarea acotada y medible (éxito/fracaso en colocar el cubo), es útil como test de regresión al actualizar versiones de LeRobot o del modelo base.
- Educación y formación: ejemplo didáctico de fine-tuning de un VLA de 4,14 B parámetros sobre un dataset propio, con comandos concretos de entrenamiento y despliegue.
- Integración en celdas de clasificación por color: la discriminación de cubos verde, azul, amarillo y rojo permite usarlo como base para tareas de selección cromática en líneas de montaje simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 B parámetros en safetensors (24,5 GB en el repositorio, que incluye checkpoints), la inferencia en precisión completa requiere del orden de 16-20 GB de VRAM; en cuantización de 8 bits podría reducirse a ~8-10 GB, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una A100, H100 o L40S son opciones seguras; una RTX 4090 (24 GB) debería poder alojar el modelo en precisión completa o mixta.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPUs de 16 GB solo con cuantización no documentada.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) con `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la frecuencia del dataset, pero no se confirma que el modelo alcance ese ritmo en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_train_rtc_2 | 4,14 B | no disponible | Pick-and-place de cubos sobre cruz (UR5e) | gemma | Hugging Face, LeRobot |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base para fine-tuning | gemma | Hugging Face, LeRobot |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista de manipulación | no disponible en la información | OpenPI |
| OpenVLA | no disponible | no disponible | VLA generalista de manipulación | no disponible en la información | Open source |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo se ha entrenado para cuatro tareas concretas de pick-and-place de cubos sobre una cruz roja; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: entrenado para un robot `ur5e_hand_e` con cámaras en posiciones `top` y `wrist`; cambios en la cinemática, calibración o montaje de cámaras invalidan la política.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante variaciones de iluminación, posición de objetos o distractores.
- Riesgo de sobreajuste al dataset: 999 episodios y 30.000 pasos de entrenamiento con un único operador y entorno; probablemente fallará ante objetos, colores o disposiciones no vistas.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que impone restricciones y obligaciones de atribución; conviene revisarla antes de cualquier despliegue productivo.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Sin información sobre sesgos: no se han publicado análisis de sesgos visuales ni de robustez ante distintos tonos de piel, materiales u objetos reflectantes.
- Sin cuantizaciones documentadas: no se ofrecen versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware modesto.
- Repositorio de 24,5 GB: requiere espacio en disco y ancho de banda considerables para descarga y almacenamiento de checkpoints.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_train_rtc_2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
