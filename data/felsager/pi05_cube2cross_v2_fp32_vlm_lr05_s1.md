# felsager/pi05_cube2cross_v2_fp32_vlm_lr05_s1

## Resumen

`felsager/pi05_cube2cross_v2_fp32_vlm_lr05_s1` es un modelo de vision-lenguaje-acción (VLA) para robótica, obtenido por fine-tuning del modelo base `lerobot/pi05_base` (π₀.₅ de Physical Intelligence) mediante la librería LeRobot. Lo desarrolla el usuario felsager y está entrenado para una tarea concreta de manipulación: recoger un cubo de un color determinado y colocarlo sobre una cruz roja. El modelo consume el estado del robot (vector de 10 dimensiones) y dos imágenes de cámara (vista superior y vista de muñeca, 480x640) y produce un vector de acción de 10 dimensiones.

Se trata de un modelo compacto en parámetros (4.143.404.816, es decir, unos 4,14 mil millones) que hereda la arquitectura π₀.₅, un VLA que combina un modelo de lenguaje preentrenado con un cabezal de acciones y que está diseñado para la generalización en entornos abiertos. La relevancia de esta ficha es doble: por un lado, documenta un caso real de fine-tuning de π₀.₅ para una tarea industrial/académica de pick-and-place; por otro, sirve como referencia práctica de cómo LeRobot empaqueta políticas robóticas con pesos en safetensors y licencia gemma.

El modelo se entrenó con 1000 episodios y 493.474 fotogramas a 30 FPS sobre el dataset `felsager/vla_cubes_cross_v2`, con 30.000 pasos de entrenamiento, batch de 16 y learning rate de 5e-05. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-acción) basada en π₀.₅, adaptada en LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre del repo indica fp32 para el componente VLM) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Entrada | observation.state (10,), observation.images.top (3, 480, 640), observation.images.wrist (3, 480, 640) |
| Salida | action (10,) |
| Tamano del repo | 42,6 GB |
| Libreria | lerobot 0.6.2 |
| Dataset de entrenamiento | felsager/vla_cubes_cross_v2 (1000 episodios, 493.474 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 5e-05 |
| Semilla | 1 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ (Pi05) de Physical Intelligence, un VLA de tipo vision-lenguaje-acción que integra un modelo de lenguaje preentrenado con un decodificador de acciones. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El modelo consume observaciones multimodales (estado propioceptivo del robot e imágenes de dos cámaras) y emite directamente un vector de acción de 10 dimensiones que el robot ejecuta en bucle cerrado.

El entrenamiento es un fine-tuning supervisado por imitación sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 fotogramas grabados a 30 FPS. Las tareas cubiertas son cuatro variantes de pick-and-place: recoger el cubo azul, verde, amarillo o rojo y colocarlo sobre la cruz roja. Se realizaron 30.000 pasos con AdamW, batch de 16 y learning rate de 5e-05, con semilla 1. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento; tampoco se detalla la composición del dataset más allá de los episodios y las tareas. El nombre del repositorio sugiere que el componente VLM se mantuvo en fp32 y que el learning rate del VLM fue de 5e-05, pero no hay información adicional sobre congelación de capas, aumentos de datos o decodificación especulativa.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones para un brazo UR5e con mano, a partir de estado propioceptivo e imágenes.
- Percepción visual multimodal: procesa simultáneamente una vista superior y una vista de muñeca a resolución 480x640.
- Ejecución de instrucciones en lenguaje natural: acepta una descripción textual de la tarea (por ejemplo, "pick up the blue cube and place it on the red cross") que condiciona la política.
- Discriminación por color y localización de objetos: entrenado explícitamente con cubos azul, verde, amarillo y rojo y una cruz roja como destino.
- Política de imitación en bucle cerrado: pensada para ejecutarse en tiempo real a 30 FPS sobre el robot.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, matemáticas, generación de código ni audio.
- Capacidades multilingües: no disponibles; la instrucción de tarea se proporciona en inglés en los ejemplos de la model card.

## Casos de uso

- Recogida y colocación de cubos en entornos de laboratorio: el modelo ejecuta la tarea de coger un cubo de color y depositarlo sobre una cruz roja, adecuado para experimentos de manipulación con UR5e y dos cámaras.
- Automatización de células de pick-and-place: integrado en una celda con UR5e, puede sustituir a la programación explícita de trayectorias por una política aprendida que responde a instrucciones en lenguaje natural.
- Benchmark de referencia para fine-tuning de π₀.₅: sirve como caso base reproducible (dataset público, hiperparámetros documentados, semilla fija) para comparar estrategias de entrenamiento en LeRobot.
- Docencia e investigación en VLA: útil para ilustrar el flujo completo de LeRobot, desde la grabación de datos hasta el despliegue con `lerobot-rollout`.
- Pruebas de robustez visual: al depender de vistas superior y de muñeca, permite estudiar el impacto de iluminación, oclusiones y posiciones de objeto en tareas de color.
- Prototipado rápido de políticas de imitación: con 30.000 pasos y batch 16, el coste de reentrenamiento es acotado, lo que facilita iterar sobre nuevos datasets de cubos y cruces.
- Validación de infraestructura robótica: útil para verificar cables, calibración de cámaras y puertos antes de entrenar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía y declara explícitamente que no se han proporcionado resultados para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143.404.816 parámetros, en fp32 los pesos ocupan aproximadamente 16,6 GB; en fp16/bf16, unos 8,3 GB; en int8, unos 4,1 GB. El repositorio ocupa 42,6 GB, lo que sugiere que incluye pesos en fp32 junto con otros artefactos.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, una GPU con al menos 16-24 GB de VRAM (A100, H100, RTX 4090, L40S) es un punto de partida razonable para fp32; para fp16 bastaría con 12-16 GB.
- ¿Cabe en GPU de consumo? En fp16/bf16 previsiblemente sí en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB); en fp32 requeriría al menos 24 GB y podría no caber con holgura.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuadas para una política VLA de este tipo.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que la política está pensada para operar a esa frecuencia, pero no se confirma el rendimiento real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_fp32_vlm_lr05_s1 | 4.143.404.816 | no disponible | Pick-and-place de cubos sobre cruz roja (UR5e) | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base para generalización en entornos abiertos | no disponible en la informacion | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible en la informacion | OpenPI (open source) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación se limita a parámetros, tarea y licencia; cualquier comparación de precisión requeriría evaluaciones reales en robot que no se han publicado.

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente para cuatro tareas de pick-and-place con cubos de colores sobre una cruz roja; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot, por lo que se desconoce su fiabilidad real.
- Dependencia del hardware: asume un robot `ur5e_hand_e` y dos cámaras con nombres `top` y `wrist`; cambiar la configuración invalida la política.
- Sensible a condiciones visuales: iluminación, oclusiones, posición de cámara y distractores pueden degradar el rendimiento, aunque no se cuantifica.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias no seguras fuera de la distribución de entrenamiento; requiere supervisión y límites de seguridad en el robot.
- Licencia gemma: impone restricciones de uso comercial y obligaciones de la licencia Gemma; debe revisarse antes de cualquier despliegue productivo.
- Idiomas: no se documenta soporte multilingüe; los ejemplos de instrucciones están en inglés.
- Contexto: no se documenta la longitud de contexto del componente lingüístico.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación por parte de la comunidad.
- Fecha de creación futura (2026-11-14): conviene verificar la integridad y procedencia de los artefactos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_fp32_vlm_lr05_s1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
