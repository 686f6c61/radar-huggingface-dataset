# JanPhilipp/smolvla-three-tool-bce-e2-258

## Resumen

JanPhilipp/smolvla-three-tool-bce-e2-258 es un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base, publicado por el usuario JanPhilipp en Hugging Face. Se trata de una política robótica de tipo vision-lenguaje-acción (VLA) entrenada con LeRobot para una única tarea de manipulación: recoger herramientas (destornillador, alicates o martillo) de una zona verde y colocarlas en una zona roja. El modelo no es un modelo de lenguaje generalista, sino una política de control que consume imágenes de dos cámaras y el estado del robot, y produce directamente comandos de acción de 6 dimensiones.

El modelo forma parte de la familia SmolVLA, presentada en el artículo arXiv:2506.01844 como un VLA compacto y eficiente, con coste computacional reducido y capacidad de desplegarse en hardware de consumo. Con 450.046.176 parámetros totales (aproximadamente 450 M) y un repositorio de 0,9 GB en safetensors, encaja en el segmento de políticas robóticas ligeras que pueden ejecutarse localmente sin clústeres de GPU.

Su relevancia es experimental y acotada: se trata de un fine-tune personal con 258 episodios de entrenamiento y sin resultados de evaluación publicados, por lo que su interés principal es como ejemplo reproducible del flujo de trabajo de LeRobot y como punto de partida para ajustes posteriores, no como política lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-acción (VLA) compacto; detalles concretos de capas y mecanismo de acción no disponibles en la model card |
| Parámetros totales | 450.046.176 (≈450 M), dato de safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors a precisión completa |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,9 GB) |
| Tipo de pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Robot objetivo | so_follower |
| Cámaras | camera1, camera2 |
| Entradas | observation.state (6,), observation.images.camera1 (3, 480, 640), observation.images.camera2 (3, 480, 640) |
| Salidas | action (6,) |
| Dataset de entrenamiento | JanPhilipp/three_tool_BCE_E2_merged_258 (258 episodios, 187.655 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

La model card describe el modelo como un VLA compacto y eficiente, capaz de alcanzar rendimiento competitivo con costes computacionales reducidos y de desplegarse en hardware de consumo. El repositorio no detalla la arquitectura interna (número de capas, mecanismo de generación de acciones, tipo de atención) más allá de esta descripción, por lo que esos datos deben consultarse en el artículo referenciado, arXiv:2506.01844. El modelo se ha entrenado y publicado con LeRobot, y deriva del punto de partida lerobot/smolvla_base.

El ajuste fino se realizó sobre el dataset JanPhilipp/three_tool_BCE_E2_merged_258, compuesto por 258 episodios y 187.655 fotogramas grabados a 30 FPS. Las tareas cubiertas son cuatro y están formuladas en inglés: coger el destornillador, los alicates o el martillo de la zona verde y colocarlos en la zona roja, además de una tarea agregada de mover todas las herramientas de la zona verde a la roja. La configuración de entrenamiento documentada es de 42.000 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 5e-05, semilla 1000 y LeRobot 0.6.2. No se documenta en la información disponible si hubo etapas de RLHF, DPO u otro ajuste por preferencias, ni la composición detallada del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado, adecuadas para un brazo seguidor tipo SO (so_follower).
- Percepción visual multi-cámara: procesa dos flujos de imagen de 480x640 píxeles (camera1 y camera2) de forma conjunta con el estado del robot.
- Ejecución de tareas guiadas por lenguaje: acepta instrucciones textuales de tarea, como "Grab the screwdriver from the green area and place it on the red area".
- Pick-and-place de tres herramientas concretas: destornillador, alicates y martillo.
- Tarea agregada de movimiento de objetos: instrucción "Move all tools from the green area to the red area".
- Aprendizaje por imitación: política entrenada a partir de demostraciones teleoperadas, no mediante recompensas explícitas.
- Tool calling / function calling: no aplica ni está documentado; es una política robótica, no un modelo de lenguaje con llamada a herramientas.
- Capacidades de agente multi-paso: no documentadas en la información disponible.
- Capacidades multilingües: no disponibles; las tareas de entrenamiento están en inglés.
- Modo de razonamiento (thinking), visión general o audio: no disponibles; la visión está limitada al uso como entrada de política.

## Casos de uso

- Recogida y colocación de herramientas en banco de trabajo: la política puede ejecutar la tarea de mover destornillador, alicates o martillo de una zona verde a una zona roja, que es exactamente el dominio sobre el que fue entrenada.
- Automatización de estaciones de clasificación con dos zonas marcadas: útil en demostraciones de laboratorio donde exista un área de origen y un área de destino claramente delimitadas por color.
- Punto de partida para ajustes finos propios: al derivar de lerobot/smolvla_base y estar integrado en LeRobot, sirve como inicialización para entrenar tareas nuevas con el comando lerobot-train sobre un dataset propio.
- Validación de pipelines de imitación en robótica: permite reproducir de extremo a extremo el flujo grabar datos, entrenar y desplegar con LeRobot 0.6.2, útil para comparar configuraciones de entrenamiento.
- Investigación en VLA de bajo coste: con 450 M de parámetros y 0,9 GB de pesos, es viable experimentar en un único equipo con GPU de consumo, algo relevante para grupos con recursos limitados.
- Evaluación comparativa de políticas sobre el mismo robot: al compartir arquitectura con smolvla_base, permite medir el efecto de un fine-tune concreto frente al modelo base en un banco de pruebas controlado.
- Demostraciones educativas de manipulación con lenguaje natural: sirve para ilustrar cómo una instrucción textual condiciona el comportamiento de una política robótica en un brazo so_follower.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que aún no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), y tampoco incluye tasas de éxito en robot real ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión de 32 bits, en torno a 1,8 GB para los 450 M de parámetros; en 16 bits (bf16/fp16), en torno a 0,9 GB, coherente con el tamaño del repositorio (0,9 GB). Estas cifras corresponden solo a los pesos y no incluyen activaciones ni el procesamiento de las dos cámaras de 480x640.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder cargar los pesos en 16 bits.
- Viabilidad en GPU de consumo: sí, es plausible en tarjetas de gama media y de gama alta con varios GB de VRAM, dado el tamaño reducido del modelo. No se documentan requisitos oficiales.
- Opciones de despliegue: LeRobot, mediante el comando lerobot-rollout para ejecución en robot y lerobot-train para reentrenamiento, con PyTorch como backend. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política robótica.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se especifica la frecuencia de inferencia de la política ni su latencia por paso de control.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parámetros | Contexto y entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JanPhilipp/smolvla-three-tool-bce-e2-258 | JanPhilipp | 450.046.176 | 2 cámaras 480x640 + estado (6,) | Sin resultados publicados | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | Hugging Face / LeRobot | No disponible | No disponible | No disponible en la información proporcionada; se remite al artículo arXiv:2506.01844 | No disponible | Hugging Face |
| Otras políticas VLA abiertas de la misma categoría | Varios | No disponible | No disponible | No disponible | No disponible | No disponible |

Los datos de parámetros, contexto, rendimiento y licencia de alternativas como lerobot/smolvla_base u otras políticas VLA abiertas no se han proporcionado en la información disponible, por lo que no se incluyen cifras que no puedan verificarse.

## Limitaciones y advertencias

- Sin evaluación publicada: la model card indica que no se han aportado resultados de evaluación, por lo que se desconoce la tasa de éxito real de la política.
- Dominio muy restringido: entrenada únicamente para tres herramientas y dos zonas de color, con cuatro instrucciones de tarea concretas. Cualquier variación de objetos, posiciones o entorno queda fuera de su distribución de entrenamiento.
- Dataset pequeño: 258 episodios y 187.655 fotogramas son un volumen reducido, lo que aumenta el riesgo de sobreajuste a las posiciones, iluminación y disposición concretas de la recogida de datos.
- Dependencia del hardware exacto: la política espera un robot so_follower y dos cámaras con nombres camera1 y camera2, además de dimensiones de imagen de 480x640. Cambiar la configuración invalida su uso directo.
- Idioma: las tareas están en inglés y no se documenta soporte multilingüe, por lo que las instrucciones en castellano no están cubiertas.
- Riesgo de alucinación: en el sentido de generalización fuera de distribución, la política puede producir acciones incorrectas o inseguras ante objetos o escenas no vistas durante el entrenamiento.
- Sesgos: no se documentan análisis de sesgo. Al tratarse de datos de demostración de un único operador y entorno, es probable que herede sus sesgos de manipulación, aunque no hay datos públicos que lo cuantifiquen.
- Licencia: apache-2.0, que permite uso comercial y modificación, siempre que se cumplan las condiciones de la licencia. Debe verificarse igualmente la licencia del modelo base lerobot/smolvla_base antes de un uso comercial.
- Producción: con 0 descargas y 0 "likes" en el momento de la consulta, es un artefacto experimental sin validación comunitaria. No se recomienda su uso en entornos productivos sin una evaluación propia.
- Cuantizaciones: no se publican variantes cuantizadas, lo que limita el despliegue en dispositivos embebidos con memoria muy ajustada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JanPhilipp/smolvla-three-tool-bce-e2-258
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/JanPhilipp/three_tool_BCE_E2_merged_258
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JanPhilipp/three_tool_BCE_E2_merged_258
- Artículo de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
