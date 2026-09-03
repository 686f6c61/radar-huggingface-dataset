# dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800

## Resumen

Este repositorio contiene un checkpoint intermedio del decoder World2Action del proyecto VAM-Cross, un sistema de predicción de acciones robóticas a partir de video. El modelo, desarrollado por el usuario dreamdifferent, forma parte de la línea de investigación MimicVideo y está orientado al control de un brazo robótico WidowX 250. Concretamente, el checkpoint corresponde a la iteración 1800 de un entrenamiento más largo que se detuvo de forma inesperada, y se ha subido el conjunto de pesos verificado como el más completo disponible.

El propósito del modelo es mapear observaciones visuales de dos cámaras (esquina y frontal) a una secuencia de 15 comandos de efector final y pinza a una frecuencia de 5 Hz, utilizando una representación de pose relativa a la posición actual del efector y rotación en formato 6D. Es un componente de un sistema mayor que incluye un backbone Video2World congelado, un action decoder inicial y una Video LoRA congelada, todos ellos referenciados en el README pero no incluidos en este repositorio. El tamaño del repositorio es de 1.0 GB, lo que sugiere que contiene los pesos del decoder en algún formato serializado, aunque no se especifica explícitamente.

La relevancia de este modelo radica en su enfoque de aprendizaje por imitación para robótica, donde un sistema visual procesa video y genera directamente acciones de control. Al ser un checkpoint intermedio, su utilidad práctica es limitada fuera del contexto de investigación, pero sirve como referencia para reproducir experimentos o continuar el entrenamiento desde ese punto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (decoder World2Action, probablemente basado en transformer, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa secuencias de video, sin especificar número de frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión-acción, no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es un decoder que transforma características visuales extraídas de un backbone Video2World en comandos de acción para un brazo robótico. El README indica que el entrenamiento se detuvo en la iteración 1800 de una ejecución que alcanzaba la iteración 2374 en el nombre del run (`w2a_so101_level2_widowx_texture_2cam_hstack_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`). El decoder se entrenó sobre un dataset de 298 episodios con 54 354 frames, utilizando dos cámaras (`observation.images.corner_cam` y `observation.images.front_cam`). La salida son 15 acciones de efector final y pinza a 5 Hz, con pose relativa a la pose actual lograda (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool`, y rotación codificada como rotación 6D.

Durante el entrenamiento se mantuvieron congelados varios componentes: el backbone inicial `dreamdifferent/widowx250-video-fused`, el action decoder inicial `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder` y una Video LoRA `dreamdifferent/vam-cross-level2-so101-widowx-texture-video-lora-iter-200`. Esto sugiere que el modelo sigue un esquema de fine-tuning con capas congeladas, típico en sistemas de control robótico basados en visión para preservar las representaciones visuales preentrenadas. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Predicción de acciones de efector final y pinza para un brazo robótico WidowX 250 a partir de entrada de video.
- Procesamiento de dos flujos de cámara simultáneos (cámara de esquina y cámara frontal).
- Generación de secuencias de 15 acciones a 5 Hz, lo que permite control en tiempo real aproximado.
- Salida de pose relativa al estado actual del efector, con rotación en representación 6D (adecuada para controladores diferenciales).
- Integración con el framework MimicVideo, que permite reproducir el pipeline completo con los componentes congelados referenciados.
- No soporta procesamiento de lenguaje, tool calling, agentes ni razonamiento multi-step, al ser un modelo puramente visual-motor.

## Casos de uso

- Teleoperación asistida: el modelo puede interpretar grabaciones de teleoperación y generar comandos de acción para replicar movimientos, útil en entornos de entrenamiento de robots.
- Aprendizaje por imitación: dado un conjunto de demostraciones en video, el decoder aprende a mapear observaciones a acciones, permitiendo que un robot ejecute tareas de manipulación como pick-and-place o apilado de objetos.
- Control autónomo en entornos estructurados: con el backbone y la LoRA adecuados, puede utilizarse en tareas de manipulación con la plataforma WidowX 250, como ordenar objetos o interactuar con interruptores.
- Investigación en world models: al ser parte de un sistema Video2World, sirve como componente de prueba para estudiar la predicción de acciones basada en representaciones visuales aprendidas.
- Reproducción de experimentos: el checkpoint permite continuar un entrenamiento interrumpido o servir como punto de partida para fine-tuning en nuevas tareas de manipulación con la misma configuración de cámaras.
- Benchmarking de decoders de acción: puede compararse contra otros decoders del mismo framework para evaluar la calidad de la predicción de acciones en términos de precisión de pose y tasa de éxito en tareas físicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como éxito en tareas, error de pose o comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación disponible. Dado que el repositorio pesa 1.0 GB, el modelo probablemente tenga un tamaño de pesos inferior a 1 GB, lo que podría caber en GPUs de consumo medio (por ejemplo, RTX 3060 o superior) si se utiliza una cuantización adecuada, pero esto es una estimación no confirmada.
- No se indican GPUs recomendadas. Para inferencia en tiempo real a 5 Hz con dos cámaras, se requeriría al menos una GPU con soporte para procesamiento de video, probablemente una NVIDIA con al menos 8 GB de VRAM, aunque no hay datos oficiales.
- Opciones de despliegue: no se mencionan frameworks específicos como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Para robótica, podría integrarse en ROS o en pipelines de control propios, pero no hay documentación al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa con otros modelos de la misma categoría. El campo de modelos de visión-acción para robótica es emergente y este checkpoint es específico de la plataforma WidowX 250, sin datos públicos de rendimiento comparativo. Se podría mencionar la existencia de modelos como RT-2 o OpenVLA, pero no se dispone de datos de este modelo para comparar de forma rigurosa, por lo que se indica "no disponible".

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento se detuvo en la iteración 1800, por lo que el modelo no ha completado su entrenamiento previsto (el run apuntaba a iteración 2374) y puede presentar un rendimiento subóptimo.
- Dependencia de componentes externos: el modelo requiere el backbone Video2World, el action decoder inicial y la Video LoRA congelados, que no se incluyen en este repositorio. Sin ellos, el decoder no es funcional.
- Dataset no incluido: el dataset de entrenamiento (`dreamdifferent/vam-cross-level2-so101-widowx-texture`) no está disponible en este repositorio, lo que impide reproducir el entrenamiento o evaluar el modelo en nuevos datos sin acceso a ese recurso.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial o la redistribución son inciertos. Se recomienda contactar con el autor antes de cualquier uso fuera de investigación.
- Especificidad de la plataforma: el modelo está diseñado para el brazo WidowX 250 con una configuración de dos cámaras concreta; su transferencia a otros robots o configuraciones requeriría adaptaciones no documentadas.
- Sin evaluación pública: no hay benchmarks ni métricas de rendimiento publicados, por lo que se desconoce su fiabilidad en entornos reales.
- Riesgo de sobreajuste: con solo 298 episodios y 54 354 frames, el modelo podría estar sobreajustado a las condiciones específicas del dataset de teleoperación, limitando su generalización.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800
- Backbone Video2World referenciado: `dreamdifferent/widowx250-video-fused` (commit `f0cea76b62c5dd66b06b9f965932ddea32a7b546`)
- Action decoder inicial referenciado: `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder` (commit `93750cccda01620e3c028477e4c49bc5c996a68d`)
- Video LoRA congelada referenciada: `dreamdifferent/vam-cross-level2-so101-widowx-texture-video-lora-iter-200` (commit `e2776a28c972e9d3e8144abcf55c561a1c296ec7`)
- Dataset referenciado: `dreamdifferent/vam-cross-level2-so101-widowx-texture` (commit `a59b0407fe9ddc4fcd00430d70ce846ab40b33a6`)
- Commit de MimicVideo requerido: `e3355dbc93132b576c02f920a59b4fc18a4f5906`
