# daigo424/so101_stack_blocks_20260927_203813_policy

## Resumen

so101_stack_blocks_20260927_203813_policy es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT). No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo robótico SO-101 (`observation.state`, 6 dimensiones) y dos flujos de imagen de 480x640 píxeles (cámaras `front` y `wrist`), y produce directamente un vector de acción de 6 dimensiones. El problema que resuelve es la manipulación física: convertir observaciones visuales y propioceptivas en comandos motores, tarea en la que los métodos de imitación como ACT alcanzan tasas de éxito altas sin necesidad de modelar explícitamente la dinámica del entorno.

El modelo lo publica el usuario daigo424 y se ha entrenado y subido al Hub con LeRobot 0.6.2, la librería de Hugging Face para aprendizaje por imitación en robótica real. Cuenta con 51.668.614 parámetros (aproximadamente 0,2 GB de repositorio) y una licencia Apache-2.0, lo que permite uso comercial y modificación. La tarea concreta para la que se ha entrenado es "Grasp a lego block and put it in the bin" (coger un bloque de Lego y depositarlo en un contenedor), sobre un dataset propio de 50 episodios y 30.547 fotogramas grabados a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitación visomotora con hardware de bajo coste (el brazo SO-101 es de la familia de robots tipo SO-ARM100), y como punto de partida para afinar una política propia. Conviene subrayar que la model card es una plantilla generada automáticamente por LeRobot, que el repositorio no tiene descargas ni valoraciones y que no se han publicado resultados de evaluación en robot real, por lo que no debe tratarse como un modelo validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): política de imitación con codificador visual y transformer de secuencia que predice trozos de acción (*action chunks*) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la política consume observaciones del instante actual (estado de 6 dimensiones y dos imágenes de 3x480x640) y predice un chunk de acciones |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (no hay versiones GGUF, int8 ni int4 documentadas) |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje natural; la instrucción de tarea se pasa como cadena fija en la CLI) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tamano del repositorio | 0,2 GB |
| Tipo de robot | `so_follower` (brazo SO-101) |
| Camaras | `front`, `wrist` |
| Entrada: estado | `observation.state`, STATE, forma `(6,)` |
| Entrada: vision | `observation.images.front` y `observation.images.wrist`, VISUAL, forma `(3, 480, 640)` cada una |
| Salida | `action`, ACTION, forma `(6,)` |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705 (Action Chunking with Transformers). En lugar de predecir una única acción por paso, el modelo predice un fragmento o *chunk* de acciones futuras, lo que reduce el problema de error compuesto (*compounding error*) típico de las políticas reactivas y produce movimientos más suaves y estables. La arquitectura combina un *backbone* de visión (habitualmente una ResNet preentrenada) que procesa las imágenes de las cámaras, una codificación del estado propioceptivo y un transformer que atiende conjuntamente a las características visuales, al estado y a las acciones previas para generar el chunk. Se entrena con aprendizaje supervisado puro sobre demostraciones de teleoperación, sin refuerzo ni preferencias humanas (no hay RLHF ni DPO implicados).

Los datos de entrenamiento son el dataset `daigo424/so101_stack_blocks_20260927_203813`: 50 episodios, 30.547 fotogramas a 30 FPS, correspondientes a una única tarea ("Grasp a lego block and put it in the bin"). La configuración de entrenamiento declarada es de 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, todo ello con LeRobot 0.6.2. No se documenta en la información disponible ni la composición exacta del dataset más allá del conteo de episodios, ni el número de tokens o muestras efectivas, ni si se aplicaron aumentos de datos o técnicas de regularización temporales (como *temporal ensembling*), que son habituales en ACT. Tampoco se especifica si el backbone visual se inicializó con pesos preentrenados en ImageNet.

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 grados de libertad a partir de dos cámaras y del estado articular.
- Ejecución de la tarea aprendida: coger un bloque tipo Lego y depositarlo en un contenedor, siguiendo la instrucción textual fija definida en el entrenamiento.
- Predicción de chunks de acción: al predecir secuencias cortas de acciones en lugar de pasos individuales, produce trayectorias más suaves y con menos deriva acumulada.
- Generalización limitada a variaciones de la misma tarea: al ser imitación sobre 50 episodios, puede tolerar pequeñas variaciones de posición del objeto o de iluminación, pero no se ha medido su robustez (no disponible).
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se puede reentrenar o afinar con `lerobot-train`.
- No dispone de *tool calling*, *function calling*, razonamiento multi-paso simbólico ni capacidades de agente tal y como se entienden en los modelos de lenguaje.
- No procesa lenguaje natural: la cadena de tarea es fija y no se condiciona la política a instrucciones nuevas.
- No tiene capacidades multilingües, de generación de texto, visión general (VQA, OCR, detección abierta) ni audio.

## Casos de uso

- Automatización de *pick-and-place* de piezas pequeñas: la política puede controlar un SO-101 para recoger bloques y soltarlos en un contenedor, replicando exactamente la tarea del dataset. Es adecuada porque la tarea es idéntica a la entrenada, aunque la precisión en objetos nuevos no está validada.
- Base para *fine-tuning* con datos propios: partiendo de estos pesos, un equipo puede grabar 50-100 episodios de su propia variante de la tarea y reentrenar con `lerobot-train`, aprovechando que la licencia Apache-2.0 lo permite sin restricciones.
- Banco de pruebas de *pipelines* de imitación: sirve para validar la instalación de LeRobot, la calibración de cámaras, la teleoperación y el bucle de control a 30 FPS antes de invertir en datos propios.
- Docencia e investigación en robótica de bajo coste: permite reproducir un flujo completo de imitación visomotora con un brazo económico y dos cámaras, con un coste computacional de entrenamiento moderado (51,7 M de parámetros).
- Evaluación de robustez y análisis de fallos: al ser una política pequeña y rápida de ejecutar, es útil para estudiar sensibilidad a cambios de iluminación, posición o distractores, y para medir tasas de éxito por triplicado en laboratorio.
- Demostraciones y contenido divulgativo: el modelo se puede ejecutar durante un tiempo acotado con `lerobot-rollout --duration=60` para grabar vídeos de la política en acción.
- Punto de comparación frente a otros métodos (Diffusion Policy, pi0): al ser un ACT de 51,7 M de parámetros, sirve como referencia de coste mínimo frente a políticas generativas mucho más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una sección de evaluación con la línea explícita "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito en robot real, ni número de ensayos, ni comparaciones con otras políticas. Tampoco se aportan métricas de error de acción (MSE), pérdida de validación ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: los 51,7 M de parámetros ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16. Con las activaciones de dos imágenes de 480x640 y el transformer, una estimación razonable se sitúa en el rango de 1-2 GB de VRAM, aunque no hay mediciones publicadas (no disponible).
- GPU recomendadas: cualquier GPU con soporte CUDA y más de 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100. El modelo es tan pequeño que las GPUs de gama alta quedan enormemente sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida. También es viable ejecutarlo en CPU, aunque el bucle de control a 30 FPS puede verse comprometido.
- Entrenamiento: la configuración publicada (lote 8, 100.000 pasos) es asequible en una GPU de consumo de gama media-alta, pero no se especifica el tiempo de entrenamiento ni la VRAM necesaria (no disponible).
- Opciones de despliegue: `lerobot-rollout` de LeRobot (PyTorch) es la vía documentada. No aplican runtimes de LLM como vLLM, llama.cpp, Ollama o TGI, que no soportan políticas de robótica. No se documenta exportación a ONNX, TensorRT ni TorchScript (no disponible).
- Latencia y throughput: no disponible. Como referencia de requisito derivable, el dataset se grabó a 30 FPS, lo que implica que el bucle de control debe resolver cada inferencia en menos de aproximadamente 33 ms para operar a la misma frecuencia que los datos de entrenamiento.

## Comparativa con modelos similares

La información proporcionada solo describe este modelo; los datos de las alternativas no están disponibles en el material de referencia. Se ofrece una comparación cualitativa, con "no disponible" donde no hay cifras confirmadas.

| Modelo | Parametros | Tipo de politica | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_stack_blocks_20260927_203813_policy | 51.668.614 | ACT (chunks de accion, imitacion supervisada) | Estado (6,) + 2 imagenes 3x480x640 | apache-2.0 | HuggingFace Hub (0 descargas) |
| Otras politicas ACT de LeRobot | no disponible | ACT | Depende del dataset de entrenamiento | habitualmente apache-2.0 | HuggingFace Hub |
| Diffusion Policy | no disponible | Politica generativa por difusion | Condicionada por observaciones visuales y de estado | no disponible | Repositorio publico de investigacion |
| pi0 (Physical Intelligence) | no disponible | Vision-lenguaje-accion (VLA) | Condicionada por instrucciones en lenguaje natural | no disponible | Publica, con pesos en Hub |
| GR00T N1 (NVIDIA) | no disponible | Vision-lenguaje-accion (VLA) | Instrucciones en lenguaje natural y observaciones visuales | no disponible | Publica |

Diferencias clave frente a las alternativas VLA: este modelo no acepta instrucciones en lenguaje natural y su alcance se limita a la tarea entrenada, mientras que las políticas VLA están diseñadas para generalizar entre tareas y robots. A cambio, con 51,7 M de parámetros es entre uno y dos órdenes de magnitud más pequeño y ligero de ejecutar y entrenar.

## Limitaciones y advertencias

- Model card autogenerada: el README es una plantilla de LeRobot con secciones sin rellenar (demo, evaluación) y con comentarios HTML del propio template, lo que indica que el autor no ha completado la documentación.
- Sin evaluación publicada: no hay ninguna tasa de éxito en robot real, ni protocolo de evaluación, ni número de ensayos. No se puede afirmar que la política funcione fuera del entorno de grabación del dataset.
- Sesgo de datos muy estrecho: 50 episodios, 30.547 fotogramas y una única tarea sobre un único objeto (bloque de Lego) y un único robot. Es probable un sobreajuste al laboratorio, a la iluminación, a las posiciones del objeto y a la configuración exacta de las cámaras.
- Dependencia estricta de la configuración de entrada: los nombres de cámara (`front`, `wrist`), la resolución 480x640 y los 30 FPS deben coincidir con los del entrenamiento; cualquier cambio en la disposición de las cámaras invalida la política.
- Riesgo de fallo silencioso: en aprendizaje por imitación, la política puede ejecutar movimientos plausibles pero incorrectos sin señal de error explícita. Se recomienda supervisión humana y parada de emergencia durante cualquier ejecución.
- Ausencia de lenguaje: no se puede reutilizar como modelo de conversación, generación de texto, código o razonamiento. No hay capacidades multilingües.
- Licencia permisiva: apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia. No se identifican restricciones adicionales, pero el usuario debe verificar la licencia del dataset asociado y de los pesos preentrenados del backbone visual empleados durante el entrenamiento.
- Fecha de creación anómala: el repositorio aparece creado el 2026-09-27, una fecha futura respecto a la fecha habitual de consulta, y registra 0 descargas y 0 valoraciones. Conviene tratar el artefacto como un experimento aislado y no como un modelo consolidado.
- Sin garantías de rendimiento en tiempo real: no se publican mediciones de latencia; si la inferencia supera los 33 ms por paso, el control a 30 FPS no será posible sin degradar la frecuencia de control.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daigo424/so101_stack_blocks_20260927_203813_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/daigo424/so101_stack_blocks_20260927_203813
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=daigo424/so101_stack_blocks_20260927_203813
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Articulo de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
