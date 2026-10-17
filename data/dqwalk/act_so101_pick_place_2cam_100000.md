# DQwalk/act_so101_pick_place_2cam_100000

## Resumen

DQwalk/act_so101_pick_place_2cam_100000 es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), desarrollada por el usuario DQwalk y publicada en HuggingFace Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visuomotor que recibe el estado articular de un brazo SO-101 (tipo `so_follower`), dos imágenes de cámara (`hand` y `top` a 480x640) y devuelve un vector de acciones de 6 dimensiones para el robot. El repositorio ocupa 0,2 GB y contiene 51.668.614 parámetros en formato safetensors.

El modelo está especializado en una única tarea: "Pick up the blue block and put it in the green square", aprendida a partir de 100 episodios de teleoperación (84.744 fotogramas a 30 FPS, aproximadamente 47 minutos de datos) recogidos en el dataset DQwalk/so101_pick_place_2cam_100. Se entrenó durante 100.000 pasos con AdamW, batch size 8 y learning rate 1e-5 sobre LeRobot 0.6.2.

Su relevancia es la de un ejemplo reproducible de pipeline completo de aprendizaje por imitación de bajo coste: un policy de ~51,7 M de parámetros que cabe en cualquier GPU de consumo, pensado para el robot educativo SO-101. Ahora bien, no incluye resultados de evaluación en la tarjeta del modelo y su licencia no está declarada, por lo que debe tratarse como material de investigación y no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con CVAE para Action Chunking (ACT), según el paper arXiv:2304.13705 |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; consume una observación por paso y predice un chunk de acciones) |
| Tipos de cuantizacion | No disponible (pesos safetensors en la precisión de entrenamiento) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; solo una instrucción de tarea fija en el prompt de ejecución) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos de entrada y salida declarados por el autor:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.hand` | VISUAL | `(3, 480, 640)` |
| `observation.images.top` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un chunk de acciones futuras de forma conjunta. El modelo combina un codificador de observaciones con una variante de autoencoder variacional condicional (CVAE) y un transformer encoder-decoder que genera la secuencia de acciones; las imágenes se procesan mediante extractores convolucionales antes de entrar en el transformer. El objetivo del diseño es doble: reducir el error de compounding que aparece al encadenar predicciones paso a paso y modelar la multimodalidad de las demostraciones humanas mediante la variable latente del CVAE. La referencia metodológica es el paper arXiv:2304.13705 (ALOHA/ACT).

El entrenamiento se realizó por imitación supervisada sobre 100 episodios teleoperados (84.744 fotogramas a 30 FPS) de una sola tarea, con dos cámaras fijas (`hand` y `top`) y estado articular de 6 grados de libertad. La configuración declarada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, con LeRobot 0.6.2. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste por preferencias, ni el desglose exacto del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones para un brazo SO-101 (`so_follower`) a partir de estado articular y dos vistas de cámara.
- Ejecución de una tarea concreta de pick and place: recoger un bloque azul y depositarlo en un cuadrado verde.
- Predicción de chunks de acciones, lo que permite un control más estable que una política paso a paso.
- Percepción visual dual: utiliza simultáneamente la cámara de muñeca (`hand`) y una cámara cenital (`top`) a 480x640.
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se puede reentrenar con `lerobot-train`.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje.
- No dispone de capacidades de agente, razonamiento multi-paso simbólico ni planificación de tareas.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea original: ejecutar la política sobre un SO-101 con las cámaras `hand` y `top` montadas en la misma configuración para trasladar un bloque azul a un cuadrado verde, usando `lerobot-rollout --policy.path=DQwalk/act_so101_pick_place_2cam_100000`.
- Punto de partida para fine-tuning: reentrenar el policy con `lerobot-train` sobre un dataset propio para adaptar la base ACT de ~51,7 M de parámetros a otras colocaciones de objeto, siempre que se mantenga el formato de observaciones.
- Docencia y formación en robótica: sirve como ejemplo end-to-end de un pipeline de aprendizaje por imitación (grabación con teleoperador, entrenamiento con LeRobot y despliegue en robot real) en cursos y talleres con hardware de bajo coste.
- Baseline de investigación en imitación: comparar variantes de ACT, de horizonte de acción o de resolución de imagen contra esta política en una tarea controlada de pick and place con dos cámaras.
- Validación de infraestructura de datos: usar el modelo para verificar que un pipeline de grabación cumple el contrato de observaciones (`observation.state`, `observation.images.hand`, `observation.images.top`) antes de escalar la recolección de demostraciones.
- Automatización de demostraciones de laboratorio: alimentar una celda con bloques en posiciones fijas y dejar que la política ejecute el ciclo de recogida y depósito en bucle con `--duration` configurable, como prueba de repetibilidad.
- Teleoperación asistida en fase de recogida de datos: desplegar la política junto a un operador humano para estudiar transiciones entre control autónomo y teleoperado, aprovechando el soporte de estrategias de rollout de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del modelo incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._", sin tabla de tareas, número de intentos ni tasas de éxito. No se dispone de valores de MMLU, HumanEval, GSM8K ni de métricas de robótica como tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 0,2-0,5 GB en FP32 para los 51,7 M de parámetros (el repositorio completo pesa 0,2 GB), más el coste de activaciones de las dos imágenes a 480x640.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior es más que suficiente; una RTX 4090 queda sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en CPU para inferencia a baja frecuencia de control.
- Opciones de despliegue: `lerobot-rollout` de LeRobot (comando documentado por el autor) con PyTorch sobre CUDA o CPU. No se documenta soporte de vLLM, TGI ni llama.cpp, que no aplican a un policy robótico. No se menciona exportación a ONNX, TensorRT ni formato GGUF.
- Latencia y throughput estimados: no disponibles. La política se ejecuta en un bucle de control con cámaras configuradas a 640x480 y 30 FPS en el ejemplo del autor, pero no se publica latencia medida ni frecuencia de control efectiva. Requiere dos cámaras USB (OpenCV) y el puerto serie del robot SO-101.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de licencia en la información proporcionada, por lo que la comparación cuantitativa no es posible. La tabla siguiente recoge únicamente características estructurales de alternativas de la misma categoría (políticas de imitación para manipulación); los valores marcados como "no disponible" no se han podido confirmar en la documentación consultada.

| Modelo | Método | Tipo de entrada | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DQwalk/act_so101_pick_place_2cam_100000 | ACT (transformer + CVAE, action chunking) | Estado 6D + 2 imagenes 480x640 | 51,7 M | No disponible | HuggingFace Hub, via LeRobot |
| Diffusion Policy (referencia metodologica) | Difusion sobre acciones | Estado + imagenes | No disponible | No disponible | Implementaciones publicas |
| SmolVLA | Vision-language-action | Estado + imagenes + instruccion en lenguaje | Aproximadamente 450 M segun su publicacion | No disponible en esta ficha | HuggingFace Hub, ecosistema LeRobot |
| pi0 / pi0.5 | Vision-language-action | Estado + imagenes + instruccion en lenguaje | Aproximadamente 3 B segun su publicacion | No disponible en esta ficha | Publicaciones y pesos abiertos |

Diferencias cualitativas relevantes: a diferencia de SmolVLA o pi0, esta política no acepta instrucciones en lenguaje natural y está especializada en una única tarea y un único embodiment; a cambio, su tamaño (51,7 M) es entre uno y dos ordenes de magnitud menor, lo que permite entrenarla y ejecutarla en hardware muy modesto.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 100 episodios de una sola tarea, el modelo reproduce la distribución de posiciones, iluminación y apariencia de los objetos de esas demostraciones; se desconoce su comportamiento ante distractores, cambios de iluminación o fondos distintos. No se han publicado análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de generalización errónea fuera de distribución: la política puede generar acciones plausibles pero incorrectas ante objetos o configuraciones no vistas durante el entrenamiento.
- Limitaciones de contexto e idioma: no procesa lenguaje; la instrucción de tarea solo se usa como etiqueta en el comando de ejecución y debe coincidir con la del dataset. No hay soporte multilingüe ni de instrucciones abiertas.
- Dependencia del hardware: exige un robot `so_follower` en el puerto serie indicado y dos cámaras con los nombres `hand` y `top`; si los nombres, la resolución o la colocación de las cámaras no coinciden con los del entrenamiento, el rendimiento se degrada sin aviso.
- Ausencia de evaluación: no hay tasa de éxito medida en robot real, por lo que no puede afirmarse ningún nivel de fiabilidad. Cualquier despliegue requiere validación propia con múltiples intentos.
- Restricciones de licencia: la licencia figura como no disponible tanto en los metadatos del Hub como en la tarjeta del modelo ("[More Information Needed]"). No hay autorización explícita de uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Trazabilidad temporal: los metadatos indican fechas de creación y actualización en octubre de 2026, lo que puede indicar un error de marca temporal o un repositorio reciente; conviene verificar la vigencia del contenido antes de reutilizarlo.
- Madurez: cero descargas y cero "likes" en el momento de la consulta, sin resultados de evaluación publicados; es un artefacto de investigación, no un componente validado en producción.
- Seguridad física: al tratarse de control de un brazo robótico, la ejecución desatendida sin parada de emergencia, límites de par o supervisión humana puede provocar daños materiales o personales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DQwalk/act_so101_pick_place_2cam_100000
- Dataset de entrenamiento: https://huggingface.co/datasets/DQwalk/so101_pick_place_2cam_100
- Visor del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=DQwalk/so101_pick_place_2cam_100
- Paper de ACT (pagina en HuggingFace): https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Nota: las busquedas web realizadas no devolvieron resultados relevantes para este modelo; los enlaces obtenidos correspondian a listados de piscinas y no guardan relacion con la politica.
