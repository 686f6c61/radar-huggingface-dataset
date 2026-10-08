# kiroaiseoul/act_task06_task07_task08_261006

## Resumen

act_task06_task07_task08_261006 es una política robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación descrito en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de una única acción por paso. El modelo lo publica el usuario kiroaiseoul y se ha entrenado y subido al Hub con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

No es un modelo de lenguaje ni un VLA generativo: es un checkpoint de control entrenado sobre el dataset kiroaiseoul/task06_task07_task08_261006, cuyo nombre sugiere que agrupa tres tareas de manipulación. El repositorio ocupa 0,2 GB y contiene 51.687.056 parámetros (unos 51,7 millones) en formato safetensors, un tamaño que lo sitúa en la gama baja de cómputo y permite ejecutarlo en hardware de consumo.

Su relevancia es eminentemente práctica: la licencia Apache 2.0 y la integración nativa con LeRobot permiten reproducir el entrenamiento, evaluarlo sobre un robot real y usarlo como punto de partida para nuevos conjuntos de demostraciones teleoperadas. Al tratarse de un modelo con 0 descargas y 0 likes, no cuenta todavía con validación externa por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE, según arXiv:2304.13705 |
| Parámetros totales | 51.687.056 (≈51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de acciones (chunk size) no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | kiroaiseoul/task06_task07_task08_261006 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-07 |
| Última actualización | 2026-10-07 |

## Arquitectura y entrenamiento

ACT se apoya en un esquema de autoencoder variacional condicional (CVAE): un encoder consume la secuencia de acciones demostrada junto con las observaciones y produce una variable latente de estilo, mientras que un decoder transformer genera un chunk de acciones futuras a partir de las imágenes de cámara, el estado de las articulaciones y esa latente. La predicción por chunks, en lugar de paso a paso, reduce el error de composición acumulado y suaviza el comportamiento del robot. En la implementación de LeRobot, el backbone visual habitual es una ResNet preentrenada, aunque no se ha publicado en la información disponible la configuración exacta de capas, dimensiones ni número de cámaras de este checkpoint concreto.

El entrenamiento es aprendizaje por imitación (behavioral cloning) sobre demostraciones teleoperadas; no hay evidencia de RLHF, DPO ni ningún otro ajuste por preferencias, ya que no es un modelo de lenguaje. El comando documentado en la model card es `lerobot-train --policy.type=act`, con seguimiento opcional en Weights & Biases y escritura de checkpoints en `outputs/train/<repo>/checkpoints/`. No se especifican el número de episodios, la composición del dataset, el número total de transiciones ni la política de aumento de datos empleada, por lo que esos datos figuran como no disponibles.

## Capacidades

- Control robótico por imitación: genera comandos de acción de bajo nivel para brazos manipuladores a partir de observaciones sensoriales.
- Predicción por chunks: emite secuencias cortas de acciones en cada inferencia, lo que aporta continuidad al movimiento.
- Entrada multimodal: combina imágenes de cámara y estado de las articulaciones (propriocepción); la configuración exacta de sensores no está disponible.
- Integración con LeRobot: entrenamiento, evaluación y registro de episodios mediante `lerobot-train` y `lerobot-record`.
- Ejecución sobre robots de tipo follower, con el ejemplo documentado `so100_follower`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso basado en lenguaje.
- No tiene capacidades multilingües ni procesamiento de texto.
- No incorpora modo de razonamiento explícito (thinking mode), visión generalista, audio ni generación de texto.

## Casos de uso

- Manipulación con brazos de bajo coste: el modelo se puede desplegar sobre un SO-100 follower mediante `lerobot-record` para reproducir las tres tareas del dataset de entrenamiento en un banco de laboratorio.
- Automatización de pick-and-place: en tareas de recogida y colocación con posiciones repetibles, la predicción por chunks reduce las microoscilaciones y permite ciclos más estables que un control paso a paso.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible y ligera (51,7 M de parámetros) para comparar variantes de ACT, cambios de backbone visual o estrategias de aumento de datos.
- Validación de datasets de teleoperación: al reentrenar sobre `kiroaiseoul/task06_task07_task08_261006` y evaluar con episodios nuevos, se puede medir la calidad y la consistencia de las demostraciones recogidas.
- Prototipado rápido en robótica: al ocupar 0,2 GB y requerir poca VRAM, permite iterar el ciclo completo de captura, entrenamiento y evaluación en una sola estación de trabajo con GPU de consumo.
- Fine-tuning sobre tareas nuevas: el checkpoint se puede reutilizar como inicialización para dominios con pocas demostraciones, aprovechando que la licencia Apache 2.0 permite uso comercial y modificación.
- Docencia y formación: su tamaño reducido y su pipeline documentado lo hacen apto para prácticas de aprendizaje por imitación en cursos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, número de episodios de evaluación, ni comparaciones con otras políticas, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen métricas indirectas de uso.

## Requisitos de hardware

- VRAM estimada: a partir del recuento de parámetros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16. Con buffers de activaciones y lotes de imágenes, una inferencia típica debería caber por debajo de 2 GB de VRAM, aunque no se dispone de mediciones publicadas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM es suficiente en la práctica; una RTX 4090 o una A100 están sobredimensionadas para este tamaño, pero aceleran el entrenamiento. También es viable en Jetson Orin para despliegue embebido.
- GPU de consumo: sí cabe, en modelos como RTX 3060, RTX 4060, RTX 3090 o RTX 4090. La ejecución en CPU es posible en teoría, pero la latencia de control podría ser insuficiente para tareas que requieren alta frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record` con `--policy.path`), con PyTorch como backend. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp u Ollama, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_task06_task07_task08_261006 | ACT (imitation learning) | 51,7 M | chunk size no disponible | Apache 2.0 | Hugging Face, vía LeRobot |
| Diffusion Policy (Cheng Chi et al.) | Política generativa por difusión | no disponible | no disponible | no disponible | Repositorio de investigación |
| ACT original (tonyzhaozh/act) | ACT (imitation learning) | no disponible | no disponible | no disponible | Repositorio de investigación |
| SmolVLA (Hugging Face) | VLA con instrucciones en lenguaje | no disponible en la información disponible | no disponible | no disponible | Hugging Face, vía LeRobot |

La comparación cuantitativa no es posible con los datos disponibles: solo se conoce el recuento de parámetros de este checkpoint. La diferencia cualitativa principal es que ACT es una política puramente reactiva y específica de tarea, mientras que las propuestas de tipo VLA aceptan instrucciones en lenguaje natural y generalizan entre tareas.

## Limitaciones y advertencias

- Sesgo de dominio: la política aprende exclusivamente de la distribución del dataset `kiroaiseoul/task06_task07_task08_261006`. Cambios de iluminación, posición de cámara, fondo o disposición de objetos pueden degradar el comportamiento de forma abrupta.
- Falta de generalización semántica: no entiende lenguaje natural ni instrucciones; solo reproduce el repertorio de comportamientos presente en las demostraciones.
- Riesgo de acciones fuera de distribución: ante observaciones novedosas puede emitir comandos de acción no válidos o inseguros. No existe un mecanismo de abstención ni de detección de incertidumbre documentado.
- Sobreajuste a la morfología del robot: el uso con un brazo distinto al de entrenamiento requiere recalibración y, previsiblemente, reentrenamiento.
- Ausencia de validación comunitaria: 0 descargas y 0 likes implican que no hay informes independientes de éxito ni de fallos.
- Datos incompletos: no se documentan el número de episodios, la configuración de cámaras, el chunk size, el número de pasos de entrenamiento ni las tasas de éxito.
- Licencia: los pesos son Apache 2.0, lo que permite uso comercial, pero la licencia del dataset asociado y de cualquier backbone preentrenado debe verificarse por separado antes de un despliegue en producción.
- Metadatos anómalos: las fechas de creación y actualización registradas (2026-10-07) resultan atípicas, por lo que conviene contrastarlas antes de citar el modelo.
- Seguridad física: cualquier despliegue sobre hardware real debería incorporar límites de par, paradas de emergencia y validación en entornos controlados antes de operar cerca de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/act_task06_task07_task08_261006
- Dataset de entrenamiento: https://huggingface.co/datasets/kiroaiseoul/task06_task07_task08_261006
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web no devolvió resultados relevantes sobre este modelo. Los únicos enlaces recuperados hacían referencia a la catedral de Albi y no guardan relación con el contenido de esta ficha, por lo que se han descartado.
