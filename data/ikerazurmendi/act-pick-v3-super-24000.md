# IkerAzurmendi/act-pick-v3-super-24000

## Resumen

`act-pick-v3-super-24000` es una política de imitación robótica publicada por IkerAzurmendi dentro del ecosistema LeRobot. Concretamente, implementa una política ACT (Action Chunking Transformer) para el brazo SO-101 en la tarea "coger una pieza de la caja y sostenerla frente a la cámara". El modelo recibe dos flujos de imagen (cámara frontal y cámara de muñeca) más las seis posiciones articulares del robot, y devuelve un chunk de 90 objetivos de articulación futuros a 30 fps.

Se trata de un checkpoint intermedio: 24.000 pasos de entrenamiento sobre la mezcla "super" de la tercera ronda, que incluye los 398 episodios que superaron el filtro de calidad. El propio autor advierte de que no es el mejor checkpoint de su ejecución (el mejor es el de 6.000 pasos) y que se publica por completitud. Con 51,66 millones de parámetros y 0,2 GB de pesos en safetensors, es un modelo pequeño, orientado a inferencia en tiempo real en el puesto de trabajo o en el propio robot.

Su relevancia es doble: por un lado documenta con transparencia el efecto del sobreentrenamiento en políticas de imitación (todas las ejecuciones empeoran tras aproximadamente una pasada sobre los datos); por otro, sirve como referencia reproducible de un pipeline completo de LeRobot sobre una tarea de pick-and-place, con métricas offline sobre episodios reservados. Cabe subrayar que ninguno de los checkpoints de esta familia ha sido evaluado todavía en el robot real, según la propia model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación visomotora |
| Parametros totales | 51.658.374 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como contexto textual; ventana de observación no documentada. Salida: chunk de 90 acciones futuras a 30 fps, con replanificación cada 30 pasos |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que aprende a mapear observaciones (imágenes de cámara frontal y de muñeca, más el vector de seis posiciones articulares) a secuencias de acciones futuras, en lugar de a una única acción por paso. En este caso el horizonte es de 90 objetivos de articulación a 30 fps (3 segundos de trayectoria), de los cuales se ejecutan 30 antes de volver a planificar. Este esquema de chunking reduce el error de compounding y suaviza el control, a costa de una latencia de decisión mayor que un control paso a paso. El entrenamiento se realizó con la función `train()` de LeRobot, batch de 8, chunk de 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000.

El conjunto de datos contiene 398 episodios: las 66 sesiones de pick-cube, grabadas a 30 fps y a 10 fps (remuestreadas a 30 fps), con cualquier número de piezas en la caja. Los filtros aplicados exigen duraciones de 5 a 15 segundos, un hueco inicial máximo de 20 grados, como mucho 3 segundos de inactividad en cualquiera de los extremos, al menos una apertura de pinza y la eliminación de tomas defectuosas conocidas. No se documenta el número total de tokens o frames de entrenamiento, ni si hubo etapas de RLHF o ajuste por preferencias, algo que en cualquier caso no aplica a este tipo de política.

## Capacidades

- Generación de comandos de control para un brazo SO-101 de seis grados de libertad a partir de dos vistas de cámara y del estado articular actual.
- Predicción de chunks de 90 acciones futuras, con ejecución parcial de 30 pasos entre replanificaciones.
- Manipulación del tipo "pick": coger una pieza de una caja y mantenerla elevada frente a la cámara.
- Robustez parcial a distintas configuraciones de la caja: el entrenamiento incluye episodios con cualquier número de piezas.
- Funcionamiento a 30 fps, compatible con bucles de control en tiempo real si el hardware de inferencia acompaña.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo toma las imágenes de las dos cámaras y el estado articular y emite trayectorias de agarre, lo que permite montar una celda de recogida de piezas sin programación explícita de trayectorias.
- Inspección visual con presentación a cámara: la tarea objetivo consiste en sostener la pieza frente a la cámara; el modelo sirve para alimentar un pipeline de visión artificial que clasifique o verifique la pieza una vez elevada.
- Generación de datos para aprendizaje por imitación: al ejecutarse sobre el robot, cada rollout produce nuevas trayectorias etiquetadas que pueden incorporarse al dataset o usarse para comparar políticas.
- Banco de pruebas de pipelines LeRobot: al estar entrenado con la receta estándar (`train()`, batch 8, chunk 90, semilla 1000), es un punto de partida reproducible para medir cambios en aumento de datos, filtros de calidad o tamaño de chunk.
- Estudio del sobreajuste en políticas de imitación: la familia de checkpoints a 6k, 12k, 18k, 24k y 30k permite analizar cómo evoluciona el error offline frente al número de pasos y contrastarlo con la hipótesis de "una pasada sobre los datos".
- Selección de checkpoint en producción: dado que el error offline no distingue qué política agarra mejor, este modelo se usaría como uno de los candidatos en una comparativa en robot real antes de fijar la versión desplegada.
- Docencia y demostraciones: con 51,66 M de parámetros y 0,2 GB de pesos, es viable ejecutarlo en un portátil con GPU modesta para sesiones demostrativas de control visomotor.

## Benchmarks y rendimiento

Validación offline sobre 16 episodios reservados (12 de `so101-pick-cube_20261024_181939`, una pieza, y 4 de `so101-pick-cube_20261024_144537`, dos piezas). Métrica: error absoluto medio de articulaciones sobre el chunk predicho (menor es mejor), comparado con una línea base de "mantener las posiciones articulares actuales" de 20,71.

| Checkpoint de la ejecución | Error | Mejora sobre la línea base |
|---|---|---|
| 6.000 pasos | 15,16 | 27% |
| 12.000 pasos | 16,08 | 22% |
| 18.000 pasos | 16,04 | 23% |
| 24.000 pasos (este modelo) | 16,36 | 21% |
| 30.000 pasos | 16,27 | 21% |

Comparación con el mejor checkpoint de cada ejecución de la misma ronda:

| Ejecución | Episodios | Mejor checkpoint | Error | Bajo "stay-still" | Repositorio |
|---|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27% | act-pick-v3-6000 |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27% | act-pick-v3-strict-2400 |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26% | act-pick-v3-1-2-pieces-18000 |
| v2 (anterior) | 278 | 6k | 15,36 | 26% | act-pick-v2-6000 |
| chunk 60 (línea base propia 16,23) | 331 | 4,8k | 11,94 | 26% | act-pick-v3-chunk60-4800 |
| solo una pieza | 292 | 9,6k | 15,47 | 25% | act-pick-v3-1piece-9600 |
| solo sesiones recientes | 100 | 12k | 16,87 | 19% | act-pick-v3-recent-12000 |
| primera ejecución | 165 | 6k | 16,87 | 19% | act-pick-* |

No hay resultados de éxito de agarre, tasas de finalización de tarea ni latencias medidas: el autor indica explícitamente que el error offline no permite saber qué modelo agarra mejor y que ninguno se ha probado en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. A partir de los 51.658.374 parámetros, los pesos ocupan aproximadamente 0,21 GB en fp32 y unos 0,10 GB en fp16; el pico real vendrá dominado por las activaciones del transformer con dos imágenes de entrada, por lo que 2-4 GB de VRAM son un margen razonable para batch 1.
- GPU recomendadas: cualquier GPU con soporte CUDA y 4 GB o más. Para laboratorio, RTX 3060, RTX 4060 Ti, RTX 4090 o A100 sobran en capacidad; en el robot, una Jetson Orin es la opción habitual para inferencia embebida.
- Cabe en GPU de consumo: sí, en prácticamente toda la gama actual (GTX 1660 en adelante). También es viable en CPU, aunque la latencia a 30 Hz no está documentada.
- Opciones de despliegue: LeRobot con PyTorch como ruta oficial (servidor de políticas y cliente en el robot). vLLM, TGI y Ollama no aplican; no se documenta exportación a ONNX, TensorRT ni llama.cpp.
- Latencia y throughput: no disponibles. El requisito funcional es de 30 fps (33 ms por paso) con replanificación cada 30 pasos, es decir, un ciclo de decisión aproximadamente cada segundo.
- Almacenamiento: 0,2 GB de repositorio, trivial para cualquier equipo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Episodios | Error offline | Licencia | Estado |
|---|---|---|---|---|---|---|
| act-pick-v3-super-24000 | ACT, SO-101 pick | 51,66 M | 398 | 16,36 (baseline 20,71) | Apache 2.0 | Checkpoint intermedio, no es el mejor de su ejecución |
| act-pick-v3-6000 | ACT, misma tarea | No disponible (misma arquitectura) | 398 | 15,16 | Apache 2.0 | Mejor checkpoint de la ejecución "super" |
| act-pick-v3-strict-2400 | ACT, misma tarea | No disponible | 205 | 15,14 | Apache 2.0 | Mejor resultado de la ronda, con datos muy filtrados |
| act-pick-v3-chunk60-4800 | ACT con chunk 60 | No disponible | 331 | 11,94 (baseline propia 16,23) | Apache 2.0 | No comparable directamente por distinto horizonte y baseline |

Frente a alternativas de otras familias (Diffusion Policy, políticas tipo VLA como pi0 dentro de LeRobot), no hay datos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es el mejor checkpoint de su ejecución: el de 6.000 pasos obtiene 15,16 frente a 16,36 en error offline. Usarlo en producción sin justificación supone asumir una pérdida de rendimiento medible.
- Ningún checkpoint de la familia ha sido evaluado en el robot real. Las métricas existentes son offline y el autor advierte que no permiten predecir la calidad del agarre.
- El error offline se degrada tras aproximadamente una pasada sobre el dataset en todas las ejecuciones, indicio de sobreajuste; el modelo a 24k se sitúa en la zona ya deteriorada.
- Altísima especialización: una sola tarea (pick desde caja y presentación a cámara), un solo robot (SO-101), una sola configuración de cámaras y una distribución de posiciones iniciales restringida (hueco máximo de 20 grados).
- Riesgo de fallo ante cambios de iluminación, fondo, tipo de pieza, número de piezas fuera del rango visto o descalibración de las cámaras; no hay datos de robustez publicados.
- Riesgo de acumulación de error y de deriva en rollouts largos: el chunk se replanifica cada 30 pasos y no se documenta ningún mecanismo de recuperación ante fallos de agarre.
- Sesgos del dataset: las sesiones proceden de un único operador y un único entorno, con filtros que eliminan tomas atípicas; la política hereda esa distribución estrecha.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar avisos; no hay cláusulas de uso responsable adicionales documentadas.
- Sin soporte de texto, tool calling ni agentes: cualquier sistema que lo rodee debe aportar la lógica de orquestación y la supervisión de seguridad del robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-super-24000
- Checkpoint mejor de la misma ejecución: https://huggingface.co/IkerAzurmendi/act-pick-v3-6000
- Ejecución con datos estrictos: https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-2400
- Ejecución sobre episodios de 1-2 piezas: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000
- Ejecución con chunk 60: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Ejecución solo una pieza: https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-9600
- Ejecución solo sesiones recientes: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-12000
- Ejecución v2: https://huggingface.co/IkerAzurmendi/act-pick-v2-6000
- Librería LeRobot: https://github.com/huggingface/lerobot
