# felsager/pi05_cube2cross_v2_all_bf16_s2-ema

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, disenado para la generalización en entornos abiertos en robótica. Este repositorio concreto, `felsager/pi05_cube2cross_v2_all_bf16_s2-ema`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado mediante la librería LeRobot de Hugging Face, especializado en una tarea de manipulación concreta: coger cubos de colores y colocarlos sobre una cruz roja.

El modelo resuelve el problema de control robótico de manipulación mediante aprendizaje por imitación: recibe como entrada el estado del robot (vector de 10 dimensiones) y dos imágenes de cámara (vista superior y vista de muñeca, ambas de 480x640 píxeles), y produce como salida un vector de acción de 10 dimensiones. Está entrenado sobre un dataset propio de 1000 episodios y 493.474 frames a 30 FPS.

Es relevante ahora porque representa el patrón actual de despliegue de modelos VLA open source: un modelo base de propósito general (π₀.₅) que se especializa mediante fine-tuning ligero sobre hardware asequible (un UR5e con pinza) para tareas concretas de producción. El modelo tiene 4.143.404.816 parámetros y se distribuye en formato safetensors con pesos en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), derivada de π₀.₅ de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA basado en π₀.₅, la evolución del π₀ de Physical Intelligence orientada a la generalización en entornos no vistos durante el entrenamiento. La implementación disponible es la adaptación de LeRobot, derivada del repositorio OpenPI de Physical Intelligence. La entrada combina observaciones visuales de dos cámaras (`observation.images.top` y `observation.images.wrist`, ambas RGB de 3x480x640) con el estado proprioceptivo del robot (`observation.state`, vector de 10 dimensiones), y la salida es un vector de acción de 10 dimensiones.

El fine-tuning se realizó sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 frames grabados a 30 FPS con un robot UR5e equipado con pinza (`ur5e_hand_e`). Las tareas cubiertas son cuatro variantes de "coger el cubo [azul/verde/amarillo/rojo] y colocarlo sobre la cruz roja". La configuración de entrenamiento fue de 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 2 y LeRobot 0.6.2. No se dispone de información sobre la composición del dataset de preentrenamiento del modelo base ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones para un UR5e con pinza a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente una vista superior y una vista de muñeca a resolución 480x640.
- Ejecución de instrucciones en lenguaje natural: acepta tareas como "pick up the blue cube and place it on the red cross." y discrimina por color del cubo.
- Aprendizaje por imitación: política entrenada para replicar demostraciones humanas sobre el dataset de fine-tuning.
- Generalización limitada al dominio de la tarea: el modelo base π₀.₅ está diseñado para generalizar a entornos nuevos, aunque este fine-tuning concreto está especializado en la tarea de cubos y cruz.
- No dispone de tool calling, function calling, capacidades de agente multi-paso ni generación de texto general, al ser un modelo de robótica y no un LLM conversacional.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger un cubo de color y depositarlo sobre una diana, adecuado para bancos de pruebas de manipulación con UR5e y pinza.
- Clasificación y manipulación por color: las cuatro tareas de entrenamiento permiten usar el modelo para separar objetos por color en una cinta o mesa de trabajo, discriminando azul, verde, amarillo y rojo.
- Base para fine-tuning de tareas similares: al partir de `lerobot/pi05_base` y usar LeRobot, sirve como punto de partida para entrenar variantes sobre nuevos datasets con el mismo formato de observaciones y acciones.
- Investigación en aprendizaje por imitación: útil para reproducir experimentos de VLA con un dataset público de 1000 episodios y comparar configuraciones de entrenamiento (pasos, batch, learning rate).
- Validación de pipelines de robótica en simulación o hardware real: el comando `lerobot-rollout` permite ejecutar la política durante un tiempo determinado (`--duration`) sin grabar episodios, lo que facilita pruebas de integración.
- Docencia y demostraciones de VLA: el modelo y su dataset asociado permiten ilustrar el flujo completo de LeRobot (instalación, calibración, grabación, entrenamiento y despliegue) con una tarea acotada y comprensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143 millones de parámetros en bf16, el peso de los parámetros ronda los 8,3 GB, a lo que hay que sumar el coste de los dos flujos de imagen de 480x640 y del codificador visual.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU NVIDIA, pero no se especifica modelo.
- Cabe en GPU consumer: no confirmado en la información disponible; por tamaño de parámetros sería viable en GPUs con 16 GB o más en bf16, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_bf16_s2-ema | 4.143.404.816 | no disponible | Manipulación pick-and-place (UR5e) | gemma | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista (base) | no disponible en la información | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible en la información | OpenPI |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado únicamente para cuatro tareas de coger un cubo de color y colocarlo sobre una cruz roja; no se espera que funcione fuera de ese dominio.
- Sin evaluación publicada: la model card indica que no hay resultados de éxito en robot real, por lo que se desconoce su tasa de acierto.
- Dependencia del hardware: las observaciones y acciones están definidas para un UR5e con pinza (`ur5e_hand_e`) y dos cámaras concretas (`top` y `wrist`); usar otro robot o configuración de cámaras invalida la política.
- Riesgo de sobreajuste al dataset: con 1000 episodios y 30.000 pasos de entrenamiento sobre una tarea acotada, la generalización a posiciones, iluminación o distractores nuevos no está garantizada.
- Licencia Gemma: la licencia `gemma` impone términos de uso de Google que deben revisarse antes de un uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo visual puede verse afectado por condiciones de iluminación, oclusiones o colores similares a los del entrenamiento.
- Alucinación en el sentido de acciones erróneas: como política de imitación, puede generar trayectorias no válidas o fallar en la sujeción sin señal de error explícita.
- Idiomas: no aplica como modelo multilingüe; las instrucciones de tarea están en inglés en el dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_bf16_s2-ema
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
