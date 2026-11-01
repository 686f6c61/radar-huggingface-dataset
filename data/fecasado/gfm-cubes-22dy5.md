# fecasado/gfm-cubes-22dY5

## Resumen

GFM Cubes 22dY5 es una política de imitación robótica entrenada con LeRobot y publicada por el usuario fecasado en Hugging Face. Implementa el método gaze_flow_matching, una variante de flow matching condicionada por la mirada del usuario, y está especializada en una tarea concreta de manipulación: trasladar cubos a cestas (dataset Ncubes-to-Nbaskets-320x240). No es un modelo de lenguaje: sus entradas son tres cámaras RGB de 240x320 y un vector de estado de 55 dimensiones, y su salida es un vector de acción de 26 dimensiones.

El modelo tiene 75.247.306 parámetros (unos 75 millones) y un tamaño de repositorio de 0,3 GB en safetensors. Se entrenó durante 100.000 pasos con batch de 128, optimizador AdamW y tasa de aprendizaje 1e-4 sobre 196 episodios y 84.519 fotogramas a 15 FPS. La licencia es Apache 2.0.

Su relevancia es acotada pero clara: sirve como referencia reproducible de una política visuomotora con condicionamiento por gaze para el robot blueberry_ros, y como ejemplo del flujo de trabajo de LeRobot 0.6.1 (entrenamiento, publicación en el Hub y despliegue con lerobot-rollout). No hay resultados de evaluación publicados, por lo que debe tratarse como un artefacto de investigación y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación gaze_flow_matching (flow matching condicionado por mirada), implementada en LeRobot |
| Parametros totales | 75.247.306 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política robótica; ventana de observación por fotograma, no contexto textual) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| observation.images.right | Visual | (240, 320, 3) |
| observation.images.left | Visual | (240, 320, 3) |
| observation.images.user | Visual | (240, 320, 3) |
| observation.state | Estado | (55,) |
| action | Acción | (26,) |

## Arquitectura y entrenamiento

La política sigue el paradigma de flow matching aplicado a imitación robótica: en lugar de predecir directamente la acción, aprende un campo de velocidad que transporta ruido hacia la distribución de acciones expertas, condicionado por las observaciones visuales y el estado del robot. La etiqueta gaze_flow_matching indica que el condicionamiento incluye información de la mirada del usuario, capturada por la cámara user_gaze además de las cámaras left, right y user. El modelo consume tres flujos RGB de 240x320 y un vector de estado de 55 dimensiones, y emite un vector de acción de 26 dimensiones, coherente con un robot de tipo blueberry_ros.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset fecasado/Ncubes-to-Nbaskets-320x240: 196 episodios, 84.519 fotogramas a 15 FPS, con 100.000 pasos de optimización, batch de 128, AdamW, tasa de aprendizaje 1e-4 y semilla 1000. No se documenta en la model card el número total de tokens ni la composición del dataset más allá de la tarea de traslado de cubos a cestas, ni se menciona RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitación. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal; la innovación declarada es el propio esquema de flow matching con gaze.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 26 dimensiones a partir de tres vistas RGB y el estado del robot.
- Condicionamiento por mirada del usuario: integra la señal de la cámara user_gaze, lo que permite que la política tenga en cuenta hacia dónde atiende el operador.
- Ejecución de una tarea concreta de pick-and-place: trasladar cubos a cestas, según el dataset de entrenamiento.
- Inferencia en tiempo real a la frecuencia del dataset (15 FPS) mediante lerobot-rollout.
- Reentrenamiento y ajuste con lerobot-train sobre nuevos datasets en formato LeRobot.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües: no es un modelo de lenguaje ni un modelo multimodal de propósito general.

## Casos de uso

- Reproducción de la tarea cubos a cestas: desplegar la política con lerobot-rollout sobre un robot blueberry_ros equipado con las cámaras left, right y user para replicar el comportamiento aprendido en el dataset de 196 episodios.
- Base para experimentos de condicionamiento por mirada: utilizar el modelo como punto de partida para comparar políticas con y sin señal de gaze en tareas de manipulación, aprovechando que el esquema gaze_flow_matching está integrado en LeRobot 0.6.1.
- Ajuste fino con datos propios: reentrenar con lerobot-train sobre un dataset nuevo del mismo formato (tres cámaras de 240x320 y estado de 55 dimensiones) para adaptar la política a otra disposición de objetos o de cestas.
- Docencia y formación en imitación robótica: emplear el repositorio como ejemplo completo y reproducible del ciclo registro de datos, entrenamiento, publicación en el Hub y despliegue, con hiperparámetros documentados (100.000 pasos, batch 128, lr 1e-4).
- Evaluación comparativa de políticas de flow matching: servir de referencia concreta de 75 millones de parámetros para medir tasas de éxito frente a otras políticas de LeRobot en el mismo entorno simulado o real.
- Prototipado de pipelines de robot learning: integrar el modelo en un banco de pruebas con lerobot-rollout y duración limitada (por ejemplo, 60 segundos) para validar la cadena de percepción y control antes de invertir en un entrenamiento mayor.
- Generación de datos sintéticos de evaluación: usar la política como agente que interactúa con el entorno para producir trayectorias adicionales que amplíen el dataset original, siempre que se valide su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que la tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) está pendiente de rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 75,2 millones de parámetros en FP32 los pesos ocupan aproximadamente 0,3 GB, por lo que la carga del modelo es ligera y el consumo dominante proviene del procesamiento de las tres cámaras RGB a 240x320.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para los pesos; para inferencia en tiempo real a 15 FPS se recomienda una GPU de gama media o superior (por ejemplo, RTX 3060 en adelante). No se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; el factor limitante es la latencia de las tres cámaras y del bucle de control, no la memoria.
- Opciones de despliegue: lerobot-rollout con --strategy.type=base para ejecución sin grabación de episodios; lerobot-train para reentrenamiento con --policy.device=cuda. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica.
- Latencia y throughput: no disponibles. El dataset se grabó a 15 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se publican mediciones de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto estructural:

| Modelo | Parámetros | Tipo | Contexto | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| fecasado/gfm-cubes-22dY5 | 75.247.306 | Política gaze_flow_matching (LeRobot) | No aplica | Apache 2.0 | No |
| Otras políticas de LeRobot (ACT, Diffusion Policy, etc.) | No disponible | Políticas de imitación | No aplica | Varía según repositorio | No disponible en esta ficha |
| Modelos de lenguaje de tamaño similar | No aplica | Transformer de texto | No aplica | Varía | No comparable |

No se identifican en la información disponible modelos directamente comparables con el mismo esquema de condicionamiento por mirada y el mismo robot blueberry_ros.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas, ni número de ensayos, ni condiciones de prueba, por lo que se desconoce su fiabilidad real.
- Especialización extrema: entrenado solo para la tarea de cubos a cestas del dataset Ncubes-to-Nbaskets-320x240; no se espera generalización a otras tareas, objetos o entornos.
- Dependencia del hardware: requiere un robot blueberry_ros y las cámaras left, right y user con los nombres e índices correctos; cualquier cambio en la configuración de sensores invalida las observaciones esperadas.
- Dependencia de la señal de mirada: la cámara user_gaze es parte del condicionamiento; sin ella o con una calibración distinta, el comportamiento puede degradarse de forma no documentada.
- Sin datos sobre sesgos: no se documentan sesgos conocidos, pero al ser una política de imitación hereda los sesgos y la distribución de las demostraciones humanas del dataset (posiciones, iluminación, operador concreto).
- Riesgo de alucinación en sentido figurado: como política de imitación, puede generar acciones fuera de distribución ante objetos o disposiciones no vistas, sin mecanismo de seguridad documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no se ofrece ninguna garantía; conviene conservar el aviso de licencia y citar LeRobot según la model card.
- Caveat para producción: al no haber métricas de latencia ni de éxito, no debe desplegarse en un entorno real sin una fase de validación propia con límites de seguridad física.
- Idiomas: no aplica; no hay soporte lingüístico que evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22dY5
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fecasado/Ncubes-to-Nbaskets-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Registro de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
