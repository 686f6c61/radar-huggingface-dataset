# mscaidl-0075/smoke_test_lerobot_act

## Resumen

`mscaidl-0075/smoke_test_lerobot_act` es una política de robótica entrenada con LeRobot y publicada en Hugging Face Hub por el usuario `mscaidl-0075`. Está basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación descrito en el artículo arXiv 2304.13705 que, en lugar de predecir una única acción por paso de control, predice fragmentos (chunks) de acciones futuras a partir de observaciones visuales y de estado proprioceptivo. El modelo tiene 51.668.614 parámetros (~51,7 M) y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB, con licencia Apache 2.0.

Conviene contextualizar su naturaleza: por el nombre, el tamaño del dataset asociado (un único episodio de 150 fotogramas a 30 FPS, tarea etiquetada como "smoke test") y la configuración de entrenamiento (100 pasos, batch de 2), se trata de un artefacto de prueba de humo generado para verificar el flujo de entrenamiento y publicación de LeRobot, no de un modelo destinado a operar un robot real. No incluye resultados de evaluación en robot físico y no registra descargas ni "likes" en el momento de redactar esta ficha.

Su relevancia es, por tanto, documental y de infraestructura: sirve como referencia mínima de la estructura de una política ACT en el ecosistema LeRobot (interfaz de entradas y salidas, formato de pesos, comandos de despliegue) y como plantilla reproducible para validar pipelines de robótica antes de lanzar entrenamientos con datos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder CVAE (solo en entrenamiento) y decoder que predice chunks de acciones |
| Parámetros totales | 51.668.614 (~51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume una observación por paso: una imagen y un vector de estado) |
| Tipos de cuantización | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (la política no procesa lenguaje natural; la tarea se identifica con la cadena "smoke test") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de política LeRobot), repositorio de 0,2 GB |
| Tipo de robot | `so_follower` (brazo tipo SO-100/SO-101, seguidor) |
| Cámaras | 1 cámara frontal, clave de observación `observation.images.front`, resolución 3x480x640 |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Salida de acción | `action`, forma `(6,)` |
| Biblioteca | `lerobot` |
| Pipeline declarado | `robotics` |
| Dataset de entrenamiento | `mscaidl-0075/smoke_test_lerobot` (1 episodio, 150 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

ACT combina un encoder CVAE y un transformer encoder-decoder. Durante el entrenamiento, el encoder CVAE recibe la secuencia de acciones de la demostración junto con la observación actual y proyecta una variable latente que captura la variabilidad del estilo humano; el decoder predice entonces un chunk de acciones futuras condicionado en la observación y en esa latente. La función de pérdida combina una pérdida L1 sobre las acciones predichas con un término de regularización KL sobre la latente. En inferencia, la latente se fija a la media de la prior y el modelo genera el chunk completo, que se ejecuta con solapamiento entre chunks (temporal ensembling) para suavizar la transición. Esta formulación reduce el problema de horizonte efectivo frente a políticas que predicen una sola acción por paso, a costa de una mayor demanda de cómputo por decisión. El backbone visual concreto, el tamaño de chunk y el número de capas no se detallan en la model card.

La configuración de entrenamiento documentada es: 100 pasos de optimización, batch size 2, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. El dataset asociado contiene un único episodio con 150 fotogramas a 30 FPS (aproximadamente 5 segundos de teleoperación) y la tarea lleva por nombre "smoke test". No se documentan fases de RLHF, DPO ni ajuste por preferencias, algo coherente con el paradigma de imitación supervisada de ACT. Con ese volumen de datos y de pasos, el resultado esperable es una política capaz de reproducir de forma muy aproximada la trayectoria del único episodio, sin capacidad de generalización.

## Capacidades

- Control de manipulación de 6 grados de libertad: genera vectores de acción de forma `(6,)` a partir de estado propioceptivo de forma `(6,)`.
- Aprendizaje por imitación a partir de demostraciones teleoperadas: reproduce el comportamiento observado en el dataset de entrenamiento.
- Percepción visual monocámara: consume una imagen RGB frontal de 480x640 junto con el estado del robot.
- Predicción de chunks de acciones: en lugar de un único paso, emite secuencias de acciones que se ejecutan de forma solapada.
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable mediante `lerobot-train` con `--policy.type=act`.
- Generación de texto: no soportada.
- Razonamiento, matemáticas y generación de código: no soportados.
- Tool calling / function calling: no soportado.
- Comportamiento agéntico o razonamiento multi-paso deliberativo: no soportado.
- Capacidades multilingües: no aplica, el modelo no procesa lenguaje.
- Capacidades especiales (modo "thinking", audio, visión-lenguaje-acción): no disponibles; se trata de una política visomotora pura, sin componente de lenguaje.

## Casos de uso

- Verificación de humo del pipeline de LeRobot: sirve para comprobar de extremo a extremo que la instalación de `lerobot`, la publicación en el Hub y la carga de una política ACT funcionan antes de invertir horas de GPU en un entrenamiento real.
- Plantilla de referencia para nuevas políticas: el repositorio muestra la estructura esperada (features de entrada y salida, claves de observación, formato safetensors) que se puede replicar al entrenar políticas propias con el mismo tipo de robot.
- Pruebas de integración de hardware y cámaras: permite validar que el puerto del robot, los índices de cámara y los nombres de las claves de observación (`observation.images.front`) coinciden con los que espera la política, usando `--strategy.type=base` y una duración corta.
- Medición de latencia del bucle de control: al ser un modelo de ~51,7 M de parámetros, resulta útil para cronometrar el tiempo de inferencia por paso y comprobar si el sistema sostiene los 30 FPS de captura sin acumular retraso.
- Docencia y demostración: un ejemplo mínimo y rápido de ejecutar para explicar el flujo de trabajo de imitación (grabar datos, entrenar, desplegar) sin necesidad de un dataset grande ni de un clúster.
- Punto de partida para fine-tuning: el script de entrenamiento documentado permite reutilizar la configuración y sustituir el dataset por uno propio; en la práctica, el fine-tuning desde cero sobre datos reales sería la vía correcta, dado el nulo valor del checkpoint actual.
- Pruebas de compatibilidad de versiones: útil para detectar roturas entre versiones de LeRobot (entrenado con 0.6.2) y el código de inferencia actual.

En ningún caso debe emplearse esta política concreta para tareas de manipulación reales: no ha sido evaluada y sus datos de entrenamiento son un único episodio de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política, y la tabla de evaluación aparece vacía. No existen, por tanto, tasas de éxito en robot real, ni métricas de error de acción, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- Huella de memoria de los pesos: unos 207 MB en fp32 y unos 103 MB en bf16/fp16 para 51.668.614 parámetros. Es un modelo pequeño en términos de almacenamiento.
- VRAM estimada para inferencia: no disponible con precisión, ya que depende del backbone visual y del tamaño de chunk, no especificados. En cualquier caso, es un modelo que cabe holgadamente en GPUs de gama media y muy probablemente en CPU para pruebas puntuales.
- GPU recomendadas: cualquier GPU con soporte CUDA y varios GB de VRAM; una RTX 3060 de 12 GB o superior es más que suficiente. GPU de datacenter (A100, H100) no aportan ventaja relevante para un modelo de este tamaño salvo por el paralelismo de entrenamiento.
- Cabe en GPU de consumo: sí, con margen amplio, en cualquier GPU moderna con al menos 4-6 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=mscaidl-0075/smoke_test_lerobot_act` es la vía documentada; el modelo se carga a través de la biblioteca `lerobot` sobre PyTorch. No se documentan integraciones con vLLM, TGI, Ollama o llama.cpp, que no son aplicables a una política de control robótico.
- Latencia y throughput: no disponibles. El requisito práctico viene impuesto por el bucle de control, que debe sostener 30 FPS (33 ms por paso) junto con la captura de cámara; el coste real lo domina la codificación de la imagen y no el tamaño del transformer.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mscaidl-0075/smoke_test_lerobot_act` (este) | ACT, chunking con transformers | 51,7 M | 1 imagen RGB 480x640 + estado de 6 dimensiones | Apache 2.0 | pública en Hugging Face Hub |
| Otras políticas ACT publicadas en el Hub de LeRobot | ACT, chunking con transformers | variable según configuración; no disponible | imagen(es) + estado, según robot y dataset | normalmente Apache 2.0, variable por repositorio | públicas en el Hub |
| Diffusion Policy | política de imitación basada en modelos de difusión sobre acciones | no disponible | imagen(es) + estado | no disponible en la información proporcionada | implementación pública en el ecosistema LeRobot |
| SmolVLA y otras políticas visión-lenguaje-acción | VLA, condicionadas por instrucción en lenguaje | no disponible en la información proporcionada | imagen(es) + estado + instrucción textual | no disponible en la información proporcionada | públicas en el Hub de LeRobot |

La diferencia cualitativa más relevante es que este repositorio contiene un artefacto de prueba de humo, mientras que las alternativas citadas se distribuyen como políticas entrenadas con datasets de miles de episodios. La comparación cuantitativa de parámetros, contexto y rendimiento no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Naturaleza de prueba de humo: el entrenamiento se realizó con 100 pasos, batch size 2 y un único episodio de 150 fotogramas. La política carece de valor operativo y no debe desplegarse en un robot para tareas reales.
- Sin evaluación: no hay resultados de tasa de éxito ni de comportamiento en robot físico; se desconoce si la política se mueve de forma segura.
- Sobreajuste extremo previsible: con un solo episodio y una sola tarea ("smoke test"), cualquier variación de posición de objetos, iluminación o configuración del robot queda fuera del dominio de entrenamiento.
- Dependencia estricta del interfaz: las claves de observación (`observation.state`, `observation.images.front`), sus formas y el tipo de robot (`so_follower`) deben coincidir exactamente con los del entrenamiento; un nombre de cámara distinto provoca fallo de carga o de ejecución.
- Ausencia de componente de lenguaje: no acepta instrucciones en lenguaje natural distintas de la cadena de tarea, no razona y no puede encadenar subtareas de forma deliberativa.
- Riesgo de acciones erráticas: al no haber validación, la salida del modelo puede producir movimientos bruscos o colisiones; en cualquier prueba debe mantenerse el espacio de trabajo despejado y contar con parada de emergencia física.
- Sesgos: no se dispone de análisis de sesgo. En robótica por imitación, el sesgo relevante es el de la persona que teleoperó la demostración y el de las condiciones de captura.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. La licencia no exime de responsabilidad por el comportamiento físico del robot.
- Adopción nula: cero descargas y cero valoraciones en el momento de redactar esta ficha; no hay evidencia de uso por terceros ni de reproducibilidad externa.
- Idiomas: sin datos; el modelo no procesa lenguaje, por lo que esta categoría no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mscaidl-0075/smoke_test_lerobot_act
- Dataset de entrenamiento: https://huggingface.co/datasets/mscaidl-0075/smoke_test_lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mscaidl-0075/smoke_test_lerobot
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Preprint en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: los resultados de la búsqueda web realizada no guardan relación con este modelo (corresponden a noticias sobre el motor de búsqueda de Microsoft), por lo que no se han incluido.
