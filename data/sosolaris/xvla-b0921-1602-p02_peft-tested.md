# SoSolaris/xvla-b0921-1602-p02_peft-tested

## Resumen

SoSolaris/xvla-b0921-1602-p02_peft-tested es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario SoSolaris y entrenada con LeRobot. Se trata de un ajuste fino del modelo base lerobot/xvla-base, que implementa el marco X-VLA descrito en el paper arXiv:2510.10274: un sistema de flow matching con soft prompts aprendibles, donde cada robot o configuración de hardware se trata como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt. Esto permite que un único modelo reconcilie morfologías, sensores y espacios de acción distintos.

El modelo tiene 879.687.256 parámetros (~880 M) y ocupa 1,8 GB en el repositorio. Está especializado en un único robot, el `so101_follower`, con dos cámaras (`right`, `up`) y un estado de 8 dimensiones, y produce un vector de acción de 6 componentes. Se ha entrenado sobre el dataset SoSolaris/FlourishGrabTape (20 episodios, 7.071 fotogramas a 15 FPS) para la tarea concreta "Grab the tape".

Es relevante porque ejemplifica el flujo actual de prototipado en robótica open source: un investigador puede ajustar un modelo base VLA con un dataset de imitación pequeño y desplegarlo con la CLI de LeRobot en hardware de bajo coste como el SO-101. No obstante, la model card no incluye resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts aprendibles (marco X-VLA) |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (la instrucción de tarea se proporciona como cadena de texto, en inglés en los ejemplos, p. ej. "Grab the tape") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de política de LeRobot) |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | so101_follower |
| Camaras | right, up |
| Entradas | observation.images.image (3, 256, 256), observation.images.image2 (3, 256, 256), observation.state (8,), observation.images.image3 (3, 224, 224) |
| Salidas | action (6,) |
| Tamano del repositorio | 1,8 GB |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

X-VLA es un marco VLA basado en flow matching que incorpora "soft prompts": un conjunto pequeño de embeddings aprendibles que actúan como identificador de la configuración robótica. En lugar de entrenar un modelo por robot, se condiciona la generación de la acción sobre el soft prompt correspondiente, de modo que el mismo conjunto de pesos puede atender distintas morfologías, sensores y espacios de acción. La política consume tres flujos visuales (dos a 256×256 y uno a 224×224) junto con el estado del robot (8 dimensiones) y emite un vector de acción continuo de 6 dimensiones. Los detalles del backbone visual-lenguaje, el número de capas y el mecanismo exacto de integración de los soft prompts no están documentados en la información disponible.

El ajuste fino se realizó durante 5.000 pasos con tamaño de lote 32, optimizador `xvla-adamw`, tasa de aprendizaje 0,0001 y semilla 1000, sobre el dataset SoSolaris/FlourishGrabTape (20 episodios, 7.071 fotogramas, 15 FPS, tarea "Grab the tape"). No se documenta en la model card si se aplicaron técnicas de RLHF, DPO o algún tipo de post-entrenamiento por refuerzo; en robótica de imitación lo habitual es el aprendizaje supervisado sobre demostraciones de teleoperación. El sufijo "peft-tested" del nombre del repositorio sugiere el uso de adaptadores PEFT, pero la model card no confirma si los pesos publicados son adaptadores o el modelo completo.

## Capacidades

- Generación de acciones de manipulación en el espacio continuo: produce vectores de acción de 6 componentes a partir de observaciones visuales y de estado, adecuados para control de un brazo SO-101.
- Política de imitación especializada: entrenada específicamente para la tarea "Grab the tape" sobre el robot `so101_follower`.
- Percepción multi-cámara: procesa tres flujos de imagen simultáneos (dos a 256×256 y uno a 224×224), lo que permite fusionar vistas redundantes o complementarias del entorno de trabajo.
- Condicionamiento por instrucción de tarea: acepta una cadena de texto descriptiva de la tarea en el momento de la inferencia (`--task="..."`).
- Soporte del ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`, integrándose en los flujos estándar de la librería.
- Herencia del marco X-VLA: al derivar de lerobot/xvla-base, la arquitectura está diseñada para soportar múltiples morfologías mediante soft prompts, aunque este ajuste concreto está especializado en una única configuración.
- Soporte de tool calling / function calling: no disponible (no aplica a una política robótica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (no documentadas).
- Capacidades especiales: modo "thinking", visión general, audio: no disponibles; el modelo solo procesa imágenes y estado del robot.

## Casos de uso

- Automatización de la recogida de cinta adhesiva ("Grab the tape") en una célula de ensamblaje o banco de pruebas: es el caso para el que fue entrenado explícitamente; se desplegaría con `lerobot-rollout` sobre un `so101_follower` con las cámaras `right` y `up`, indicando la tarea por línea de comandos.
- Base de partida para nuevos ajustes finos en manipulación con SO-101: dado que se apoya en `lerobot/xvla-base`, sirve como punto de partida para tareas similares de pick-and-place con datasets pequeños de teleoperación.
- Investigación en aprendizaje por imitación con presupuestos reducidos: permite reproducir el flujo completo de captura de datos (7.071 fotogramas, 15 FPS), entrenamiento (5.000 pasos) y evaluación en hardware accesible, sin necesidad de clústeres de GPU.
- Estudio de adaptación multi-robot mediante soft prompts: al derivar del marco X-VLA, es útil para experimentos que midan cuánto conocimiento transfiere un ajuste específico de morfología a otras configuraciones del mismo brazo.
- Prototipado de pipelines de robot learning con LeRobot: sirve como ejemplo funcional de integración de `lerobot-train`, `lerobot-rollout` y publicación en el Hub, útil para equipos que evalúan la librería antes de adoptarla.
- Evaluación de robustez en laboratorio: permite medir la degradación de la política ante cambios de iluminación, posición del objeto o presencia de distractores, tal y como sugiere la propia plantilla de evaluación de la model card.
- Docencia y formación en robótica: con un brazo SO-101 y dos cámaras web es posible ilustrar el ciclo completo de una política VLA (demostración, entrenamiento, despliegue) en un curso práctico.
- Benchmark interno de referencia para comparar políticas de imitación (ACT, Diffusion Policy, otros ajustes de X-VLA) sobre el mismo dataset y la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de error de acción, ni de comparaciones con otras políticas sobre el dataset FlourishGrabTape.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del recuento de parámetros, no confirmada por el autor): aproximadamente 3,5 GB en fp32, 1,8 GB en bf16/fp16 y 0,9 GB en int8, más el coste de activaciones y de los tres flujos de imagen de entrada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 son suficientes con margen amplio. Para entrenamiento con lotes de 32 conviene disponer de 16 GB o más.
- Cabe en GPU de consumo: sí, con claridad, dado el tamaño de ~880 M de parámetros. Incluso tarjetas de gama media con 8 GB pueden ejecutar la política en bf16.
- Inferencia en CPU: posible en términos de memoria, pero probablemente incompatible con los requisitos de frecuencia de control (el dataset se grabó a 15 FPS); no hay datos publicados de latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/xvla-b0921-1602-p02_peft-tested | 879.687.256 | no disponible | sin resultados publicados | apache-2.0 | HuggingFace, vía LeRobot |
| lerobot/xvla-base (modelo base) | no disponible | no disponible | no disponible en la información consultada | no disponible en la información consultada | HuggingFace |
| Otras políticas de imitación del ecosistema LeRobot (ACT, Diffusion Policy) | no disponible | no disponible | no disponible en la información consultada | no disponible en la información consultada | HuggingFace, vía LeRobot |

Los resultados de la búsqueda web realizada no contienen información sobre modelos comparables de robótica; los enlaces devueltos no guardan relación con el dominio. Por tanto, no se dispone de datos verificados para comparar parámetros, contexto, rendimiento o licencia frente a alternativas como OpenVLA, pi0 o RDT-1B, y no se incluyen cifras para no introducir datos no contrastados.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 20 episodios y 7.071 fotogramas para una única tarea. El riesgo de sobreajuste y de generalización pobre ante variaciones de posición, iluminación o tipo de objeto es alto.
- Ausencia de evaluación: no hay tasas de éxito ni ningún resultado en robot real. No se puede afirmar que la política funcione de forma fiable en producción.
- Especialización estricta de hardware: entrenada para el robot `so101_follower` con las cámaras `right` y `up` y un estado de 8 dimensiones. Cualquier cambio en la configuración de sensores o en el número de articulaciones invalida la política.
- Dependencia de la cadena de tarea: el despliegue requiere pasar exactamente la instrucción de tarea con la que se entrenó ("Grab the tape"); el comportamiento ante otras instrucciones no está documentado.
- Sin soporte multilingüe documentado: no se especifica qué idiomas entiende ni si la instrucción de tarea afecta realmente al comportamiento aprendido.
- Ambigüedad sobre el contenido del repositorio: el nombre incluye "peft-tested" y el comando de ejemplo apunta a `SoSolaris/xvla-b0921-1602-p02_peft`, ligeramente distinto del identificador del repositorio. Conviene verificar si se trata de adaptadores PEFT o de pesos completos antes de reutilizarlos.
- Licencia: el modelo se publica bajo apache-2.0, que permite uso comercial, pero conviene verificar los términos del modelo base `lerobot/xvla-base` y del dataset `SoSolaris/FlourishGrabTape`, ya que podrían imponer condiciones adicionales.
- Riesgo de comportamiento inseguro en robot físico: al ser una política de control, los fallos se traducen en movimientos físicos. Es imprescindible operar con límites de par, paradas de emergencia y espacio de trabajo despejado.
- Sin garantías de reproducibilidad: aunque se documentan semilla (1000), tasa de aprendizaje y número de pasos, no se especifican detalles del preprocesado ni del muestreo de datos que permitan reproducir el entrenamiento bit a bit.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoSolaris/xvla-b0921-1602-p02_peft-tested
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/FlourishGrabTape
- Paper de X-VLA (arXiv:2510.10274): https://huggingface.co/papers/2510.10274
- Guía de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/FlourishGrabTape

Nota: los resultados de la búsqueda web realizada no aportaron enlaces relevantes sobre este modelo ni sobre robótica; los dominios devueltos (Pinkbike, soporte de YouTube) no guardan relación con el objeto de la ficha y se han descartado.
