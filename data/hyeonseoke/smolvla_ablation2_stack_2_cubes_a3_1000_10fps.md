# HyeonseokE/smolvla_ablation2_stack_2_cubes_A3_1000_10fps

## Resumen

Se trata de una política robótica de tipo vision-language-action (VLA) publicada por el usuario HyeonseokE en Hugging Face, obtenida por ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` mediante la librería LeRobot. El modelo forma parte de una familia de experimentos de ablación: el propio identificador (`ablation2_stack_2_cubes_A3_1000_10fps`) indica que corresponde a una configuración concreta de un estudio comparativo, entrenada sobre el dataset `HyeonseokE/ablation2_stack_2_cubes_A3_10fps` a 10 FPS y con semilla 1000. Resuelve una única tarea de manipulación: apilar un bloque verde sobre uno rojo ("Stack the green block on the red block.").

Técnicamente es una política compacta de aproximadamente 450 millones de parámetros (450.046.176 según los pesos en safetensors, con un repositorio de 0,9 GB), pensada según la model card para "lograr un rendimiento competitivo con costes computacionales reducidos y poder desplegarse en hardware de consumo". Consume estado proprioceptivo de 6 dimensiones más tres cámaras RGB de 256x256 píxeles, y produce un vector de acción de 6 dimensiones. El robot objetivo es un `so101_follower` (SO-101) equipado con cámaras `top` y `left_wrist` según la model card, aunque la tabla de entradas declara tres cámaras.

Su relevancia es fundamentalmente metodológica: es un artefacto de investigación reproducible (licencia Apache 2.0, código y dataset públicos) más que un modelo listo para producción. No tiene descargas ni valoraciones, la model card no incluye resultados de evaluación en robot real y el contenido encontrado en la búsqueda web no guarda relación con el modelo (resultados de directorios de direcciones postales en Taiwán), por lo que toda la información fiable procede de la model card y de los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, ajustada desde `lerobot/smolvla_base`. Detalle interno de capas no disponible en la información proporcionada (ver paper SmolVLA, arXiv 2506.01844) |
| Parámetros totales | 450.046.176 (≈450 M), según los pesos en safetensors |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible / no aplica en el sentido de contexto de texto: la política opera sobre una observación (estado de 6 dimensiones y 3 imágenes de 3x256x256) y emite acciones de 6 dimensiones |
| Tipos de cuantización | No disponible (el repositorio contiene pesos en safetensors, 0,9 GB, compatible con precisión de 16 bits) |
| Idiomas soportados | No disponible en los metadatos. La instrucción de tarea del dataset está en inglés ("Stack the green block on the red block.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo de LeRobot) |
| Tipo de robot | `so101_follower` |
| Cámaras declaradas | `top`, `left_wrist` (la tabla de entradas define `observation.images.camera1/2/3`, 3x256x256) |
| Entradas | `observation.state` (6,), tres imágenes visuales (3, 256, 256) |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de entrenamiento | `HyeonseokE/ablation2_stack_2_cubes_A3_10fps` (100 episodios, 37.922 fotogramas, 10 FPS) |
| Pasos de entrenamiento | 29.600 |
| Tamaño de lote | 64 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.0 |
| Pipeline declarado | robotics |
| Descargas / "likes" | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SmolVLA, descrita en su model card como un "vision-language-action model compacto y eficiente" que busca rendimiento competitivo con coste computacional reducido para poder desplegarse en hardware de consumo. El repositorio no detalla la composición interna de la red (número de capas, tipo de encoder visual, mecanismo de generación de acciones ni si emplea flow matching u otra parametrización): esa información debe consultarse en el paper referenciado (arXiv 2506.01844). Lo que sí se especifica es la interfaz: entrada de estado de 6 grados de libertad, tres cámaras a 256x256 y salida de acción de 6 dimensiones, típica de una política de imitación para un brazo SO-101.

El entrenamiento es un ajuste fino supervisado por imitación sobre un único dataset de 100 episodios y 37.922 fotogramas grabados a 10 FPS, con 29.600 pasos, lote de 64, optimizador AdamW y tasa de aprendizaje 1e-4, usando LeRobot 0.6.0. No se indica en la información disponible si hubo RLHF, DPO ni ninguna etapa de alineación por preferencias (procedimiento poco habitual en políticas robóticas de imitación). El nombre del repositorio sugiere que se trata de una ejecución concreta dentro de un estudio de ablación (configuración "A3", semilla 1000, 10 FPS), de modo que su finalidad principal es servir de punto de comparación frente a otras configuraciones del mismo experimento.

## Capacidades

- Generación de acciones de control para un brazo robótico SO-101 (`so101_follower`) a partir de observaciones visuales y de estado: salida de 6 dimensiones por paso.
- Ejecución de una tarea de manipulación concreta y única: apilar un bloque verde sobre un bloque rojo.
- Percepción multimodal de tres flujos de imagen (3x256x256) más el estado proprioceptivo de 6 dimensiones.
- Ejecución de instrucciones de tarea en lenguaje natural (el prompt de la tarea forma parte de la llamada de inferencia mediante `--task`).
- Integración nativa con LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, ni capacidades de texto general, visión descriptiva, audio o modo "thinking". No es un modelo de lenguaje: es una política de control.

## Casos de uso

- Reproducción de experimentos de ablación en aprendizaje por imitación: el modelo permite replicar exactamente una configuración (A3, semilla 1000, 10 FPS, 29.600 pasos) y compararla con otras variantes del mismo estudio bajo condiciones idénticas de dataset y hardware.
- Punto de partida para ajuste fino en nuevas tareas de manipulación: al derivar de `lerobot/smolvla_base` y usar LeRobot 0.6.0, puede reentrenarse con `lerobot-train` sobre un dataset propio de unas pocas decenas de episodios para tareas de pick-and-place similares.
- Validación de una cadena de despliegue robótico completa: sirve para probar el flujo `lerobot-rollout` con `--strategy.type=base`, verificar puertos, índices de cámara y frecuencias antes de invertir en grabación de datos.
- Docencia y formación en robótica de bajo coste: la plataforma SO-101 y una política de 450 M de parámetros permiten montar un laboratorio de aprendizaje por imitación sin GPUs de gama alta.
- Estudio de sensibilidad a la frecuencia de control: al estar entrenado a 10 FPS, es un caso útil para medir cómo afecta el desajuste entre la frecuencia de entrenamiento y la frecuencia real del robot (las cámaras de ejemplo se configuran a 30 FPS en el comando de la model card).
- Comparación de políticas frente a la referencia generalista: permite cuantificar cuánto aporta el ajuste fino específico sobre `lerobot/smolvla_base` en una tarea de apilado de dos cubos.
- Generación de datos y evaluación en bucle cerrado en laboratorio: uso como política base para recolectar episodios de éxito y fracaso y analizar modos de fallo (agarre, alineación, precisión de apilado).
- Destilación o compresión de políticas: su tamaño contenido lo hace adecuado como profesor para destilar políticas más pequeñas orientadas a hardware embebido (requiere trabajo adicional no incluido en el repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía ("No evaluation results have been provided for this policy yet."), con una plantilla de tabla de éxito por tarea (ensayos, éxitos, tasa de éxito) sin rellenar. Tampoco se proporcionan métricas de pérdida de entrenamiento, tasas de éxito en simulación, comparaciones con otras políticas ni valores de latencia o throughput. No se han inventado cifras.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación derivada del recuento de parámetros de 450.046.176; no confirmada por el autor): en FP32 unos 1,8 GB, en FP16/BF16 unos 0,9 GB (coincide con el tamaño del repositorio, 0,9 GB), más el consumo del encoder visual, los búferes de las tres cámaras a 256x256 y el estado del robot.
- La model card afirma explícitamente que la familia SmolVLA "puede desplegarse en hardware de consumo", por lo que cabe esperar ejecución en GPUs de gama media y alta de consumo.
- GPU recomendadas (no especificadas por el autor): cualquier GPU con al menos 8 GB de VRAM debería ser suficiente en FP16 según la estimación anterior; tarjetas tipo RTX 4090, RTX 3090 o superiores ofrecen margen amplio. Se desconoce el comportamiento exacto en GPUs integradas o en CPU.
- Cabe en GPU de consumo: sí, según la propia model card y el tamaño de los pesos, aunque no hay cifras oficiales de latencia por GPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`). El repositorio no documenta soporte de vLLM, llama.cpp, Ollama, TGI ni TensorRT, que además no son aplicables de forma estándar a una política de control.
- Latencia y throughput: no disponibles. Como referencia indirecta, el dataset se grabó a 10 FPS y el comando de ejemplo configura las cámaras a 30 FPS; la política debe ser capaz de emitir acciones con suficiente frecuencia para el bucle de control del SO-101, pero no se publica ninguna medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HyeonseokE/smolvla_ablation2_stack_2_cubes_A3_1000_10fps` | 450.046.176 | Estado (6,) + 3 imágenes 3x256x256 | Apilar bloque verde sobre rojo (SO-101) | Apache 2.0 | Hugging Face, LeRobot 0.6.0 |
| `lerobot/smolvla_base` | No disponible en la información proporcionada (mismo modelo base; familia SmolVLA compacta) | No disponible | Política base generalista, ajustable por imitación | No disponible en la información proporcionada | Hugging Face, LeRobot |
| Otras políticas del ecosistema LeRobot (ACT, Diffusion Policy, pi0, etc.) | No disponible | No disponible | Manipulación diversa | No disponible | Disponible en LeRobot, pero sin datos comparables en esta información |

No se dispone de datos de rendimiento de ninguno de los modelos comparados, por lo que no es posible establecer una comparación cuantitativa fiable de tasas de éxito, latencia o robustez. La única comparación defendible es de tamaño, licencia y disponibilidad para el modelo base.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una sola tarea ("Stack the green block on the red block.") y un solo tipo de robot (`so101_follower`); no es un modelo generalista y no debe esperarse que funcione en otras tareas.
- Sin evaluación publicada: la model card deja la tabla de evaluación vacía, por lo que se desconoce la tasa de éxito real en robot físico.
- Dataset pequeño: 100 episodios y 37.922 fotogramas, una cantidad reducida que aumenta el riesgo de sobreajuste a posiciones, iluminación y disposición concretas de los objetos.
- Desajuste de frecuencia: el entrenamiento es a 10 FPS, mientras que el comando de ejemplo configura las cámaras a 30 FPS; esta discrepancia puede degradar el rendimiento si no se alinea el bucle de control.
- Dependencia de la configuración de percepción: los nombres e índices de cámara deben coincidir con las claves de observación usadas en el entrenamiento (`observation.images.camera1/2/3`, más `top` y `left_wrist` según la model card, que no son del todo coherentes entre sí). Un desajuste provoca fallo silencioso o comportamiento errático.
- Herencia del modelo base: al ser un ajuste fino de `lerobot/smolvla_base`, arrastra los sesgos y limitaciones del modelo preentrenado, no documentados en esta ficha.
- Artefacto de ablación: el nombre del repositorio indica que es una ejecución experimental de un estudio comparativo, no una versión depurada ni recomendada para producción.
- Riesgo físico: es un modelo que controla hardware real. Cualquier despliegue exige parada de emergencia, límites de par y supervisión humana; no existe ninguna garantía de seguridad documentada.
- Idiomas: no se declaran idiomas soportados y la única instrucción conocida está en inglés; no hay evidencia de soporte multilingüe del prompt de tarea.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no se documenta el cumplimiento de licencias de terceros del modelo base ni de los datos empleados más allá de lo indicado en los metadatos.
- Trazabilidad limitada: cero descargas y cero valoraciones, creado y actualizado en 2026 según los metadatos, sin resultados de evaluación ni demo en vídeo, lo que dificulta verificar la reproducibilidad.
- Ruido en la búsqueda: los resultados de búsqueda web obtenidos no tienen relación con el modelo (páginas de directorios de direcciones en Taiwán), por lo que no aportan información adicional contrastable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation2_stack_2_cubes_A3_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_stack_2_cubes_A3_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_stack_2_cubes_A3_10fps
- Paper de SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitación (grabación y entrenamiento): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Resultados de búsqueda web: sin enlaces relevantes para este modelo (los resultados obtenidos corresponden a páginas no relacionadas)
