# saybeok03/folding_act

## Resumen

`saybeok03/folding_act` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en el Hub mediante LeRobot. No es un modelo de lenguaje: es un modelo de imitación que, a partir de tres cámaras y del estado de las articulaciones, genera directamente comandos de acción para un robot bimanual de tipo `bi_openarm_follower`. Su tarea concreta es plegar una camiseta ("Fold the T-shirt properly") y fue entrenada con 50 episodios teleoperados (135.351 fotogramas a 30 FPS).

Técnicamente es un transformer pequeño: 51,7 millones de parámetros en formato safetensors, con un repositorio de 0,2 GB. Consume `observation.state` de 48 dimensiones más tres flujos visuales (`left_wrist` a 720x1280, `base` a 480x640 y `right_wrist` a 720x1280) y emite un vector de acción de 16 dimensiones. El entrenamiento se hizo con LeRobot 0.6.1 durante 5.000 pasos, batch de 64, optimizador AdamW y tasa de aprendizaje 1e-5.

Su relevancia es acotada pero práctica: es un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot (grabación de datos, entrenamiento, despliegue con `lerobot-rollout`) para una tarea manipulativa bimanual real. Conviene tener presente que el repositorio no incluye resultados de evaluación en robot real, no tiene descargas ni likes, y que el modelo solo es válido para el robot exacto, la disposición de cámaras y la tarea con los que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador CVAE y codificadores visuales ResNet, según el paper arXiv 2304.13705 |
| Parametros totales | 51.721.872 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto; la observación es el estado actual (48 dims) más un fotograma por cámara, y la salida es un chunk de acciones de 16 dims |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin variantes cuantizadas) |
| Idiomas soportados | No disponible / no aplica (modelo de robótica, sin entrada ni salida de texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |

| Parametro adicional | Valor |
|---|---|
| Tipo de robot | `bi_openarm_follower` |
| Cámaras | `left_wrist` (3, 720, 1280), `base` (3, 480, 640), `right_wrist` (3, 720, 1280) |
| Entrada de estado | `observation.state` (48,) |
| Salida de acción | `action` (16,) |
| Librería / pipeline | `lerobot` / `robotics` |
| Dataset de entrenamiento | `saybeok03/full_folding` (50 episodios, 135.351 fotogramas, 30 FPS) |
| Versión de LeRobot | 0.6.1 |
| Fecha de publicación en el Hub | 17 de octubre de 2026 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones futuras (action chunks) en lugar de un único paso. La formulación original emplea un esquema de autoencoder variacional condicional: un codificador toma la secuencia de estados y acciones de la demostración junto con una variable latente durante el entrenamiento, y un decodificador transformer genera el chunk de acciones a partir de las observaciones (tokens visuales de cada cámara más el estado propioceptivo). En inferencia, la variable latente se fija a la media y el modelo predice el chunk completo, lo que reduce el error de compounding que aparece en políticas paso a paso y permite aplicar temporal ensembling para suavizar las transiciones entre chunks.

Los detalles concretos de esta instancia en cuanto a número de capas, dimensión de los embeddings o tamaño del chunk no están documentados en la model card; la card es una plantilla de LeRobot en la que solo se han rellenado los campos de configuración y las features de entrada y salida. El entrenamiento se realizó sobre el dataset `saybeok03/full_folding` con 50 episodios teleoperados de la tarea "Fold the T-shirt properly", 135.351 fotogramas capturados a 30 FPS, 5.000 pasos de optimización con AdamW, batch de 64, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset, aumentos de datos, ni fases de RLHF o DPO (no aplican en este paradigma).

## Capacidades

- Control visuomotor bimanual: genera comandos de 16 dimensiones para un robot `bi_openarm_follower` a partir de tres vistas simultáneas.
- Ejecución de una tarea manipulativa concreta: plegar una camiseta de forma completa, tal como se define en el dataset de entrenamiento.
- Política reactiva a observaciones visuales: la salida depende del estado de las articulaciones y de las imágenes de muñeca izquierda, muñeca derecha y cámara base.
- Predicción por chunks de acciones, lo que aporta cierta estabilidad temporal frente a políticas de acción única (según el método ACT).
- Integración nativa con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se puede reentrenar con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico, ni generación de texto o código.
- Capacidades multilingües: no aplica; no procesa lenguaje natural como entrada, solo la cadena de tarea usada como condicionamiento en el script de despliegue.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la percepción visual para control.

## Casos de uso

- Plegado de camisetas en laboratorio: reproducir la tarea exacta con la que fue entrenado usando `lerobot-rollout`, indicando `--task="Fold the T-shirt properly"` y las tres cámaras en la misma disposición que en el dataset.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de plegado para adaptar la política a otra prenda, otra mesa u otro robot del mismo tipo.
- Comparativa de métodos de imitación: usar este checkpoint como línea base ACT frente a otras políticas de LeRobot (por ejemplo Diffusion Policy) entrenadas con el mismo dataset `full_folding`, manteniendo idénticas condiciones de evaluación.
- Validación de pipelines de datos teleoperados: comprobar que una grabación de 50 episodios y 135.351 fotogramas a 30 FPS es suficiente para obtener una política ejecutable, y detectar problemas de calibración o de sincronización de cámaras antes de escalar la recolección.
- Investigación en manipulación deformable: la ropa es un objeto difícil de modelar; la política sirve como caso de estudio de hasta dónde llega la imitación pura en tareas con estado no rígido.
- Docencia y demostraciones: el modelo cabe en 0,2 GB y se puede ejecutar en hardware modesto, lo que facilita talleres prácticos de aprendizaje por imitación con LeRobot sin infraestructura grande.
- Despliegue en robótica de borde: por su tamaño (51,7 M de parámetros) es candidato a ejecutarse en GPUs integradas o en módulos tipo Jetson, siempre que se validen latencia y tasa de control.
- Pruebas de robustez: evaluar la degradación de la política ante cambios de iluminación, posición inicial de la camiseta o ligera reubicación de las cámaras, para documentar su dominio de validez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card está explícitamente vacía ("_No evaluation results have been provided for this policy yet._") y no se reportan número de ensayos ni tasas de éxito en robot real. Tampoco hay métricas de pérdida de entrenamiento ni comparaciones con otras políticas sobre el mismo dataset.

| Metrica | Valor |
|---|---|
| Tasa de éxito en robot real | No disponible |
| Número de ensayos de evaluación | No disponible |
| Pérdida final de entrenamiento | No disponible |
| Comparación con otras políticas sobre `full_folding` | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB solo para los pesos en FP32 (51,7 M de parámetros); con activaciones de tres flujos de imagen, una estimación razonable es de 1 a 2 GB, aunque el dato no está publicado y debe medirse en el hardware objetivo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria es suficiente en principio; una RTX 3060, RTX 4060 o superior permite además ejecutar el entrenamiento. Para reentrenar con batch 64 sobre imágenes de 720x1280 conviene una GPU de 24 GB o más (RTX 3090/4090, A100, H100), aunque el consumo real no está documentado.
- Cabe en GPU de consumo: sí, con holgura; también es viable en CPU para inferencia a baja frecuencia, si bien no se han publicado medidas de latencia.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecución directa, y `lerobot-train` para reentrenamiento. vLLM, llama.cpp, Ollama o TGI no aplican: no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. Como referencia de diseño, los datos se grabaron a 30 FPS, por lo que un despliegue fluido requeriría que la política complete una inferencia por ciclo a esa frecuencia; no hay confirmación de que se cumpla en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saybeok03/folding_act` (este) | 51,7 M | 3 cámaras + estado 48 dims; salida 16 dims | Sin evaluación publicada | Apache 2.0 | Hub de HuggingFace, 0 descargas |
| ACT original (paper arXiv 2304.13705) | No disponible en la información proporcionada | Chunks de acciones sobre observaciones visuales y propioceptivas | Resultados publicados en el paper, no comparables con este checkpoint | No disponible | Referencia académica |
| Diffusion Policy (implementación en LeRobot) | No disponible en la información proporcionada | Políticas de difusión sobre observaciones visuales | No disponible | No disponible | Disponible como tipo de política en LeRobot |
| Políticas VLA tipo pi0 (LeRobot) | No disponible en la información proporcionada | Instrucciones en lenguaje natural + visión | No disponible | No disponible | Disponible en LeRobot |

La comparación cuantitativa no es posible con los datos disponibles: no hay una evaluación común sobre el dataset `full_folding` ni cifras de éxito de este checkpoint. La comparación relevante es metodológica (ACT frente a difusión frente a VLA), no de rendimiento medido.

## Limitaciones y advertencias

- Sin evaluación: no existe ninguna medida de tasa de éxito en robot real, por lo que se desconoce si la política funciona de forma fiable, incluso en la tarea para la que fue entrenada.
- Acoplamiento total al hardware: entrenada para `bi_openarm_follower` con tres cámaras en posiciones concretas y una resolución específica. Cambiar el robot, la montura de las cámaras o sus índices invalida el modelo.
- Dataset muy pequeño: 50 episodios de una única tarea y un único operador. Es probable un sobreajuste a posiciones iniciales, iluminación y fondo del entorno de grabación.
- Tarea única: no generaliza a otras prendas, otros objetos ni otras instrucciones; la cadena de tarea es un condicionamiento fijo, no una instrucción libre.
- Objetos deformables: el plegado de ropa es una tarea con estado difícil de observar (autooclusión, arrugas), lo que incrementa el riesgo de fallos en la manipulación.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que terceros lo hayan reproducido.
- Model card incompleta: es una plantilla con comentarios de ayuda sin rellenar; no documenta arquitectura detallada, preprocesado, normalización de acciones ni límites de seguridad.
- Seguridad física: al ser una política que emite comandos motores, requiere límites de par, paradas de emergencia y supervisión humana durante cualquier prueba.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- Sesgos: no aplica el concepto habitual de sesgo lingüístico, pero sí un sesgo de dominio hacia el entorno, la ropa y el operador de demostración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saybeok03/folding_act
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/full_folding
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/full_folding
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

Nota: los resultados de la búsqueda web proporcionados no contenían información relacionada con este modelo y se han descartado por no ser relevantes ni verificables.
