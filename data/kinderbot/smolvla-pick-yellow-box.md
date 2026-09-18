# kinderbot/smolvla-pick-yellow-box

## Resumen

kinderbot/smolvla-pick-yellow-box es una política robótica de visión-lenguaje-acción (VLA) publicada en Hugging Face por el usuario kinderbot. Es un ajuste fino del modelo base lerobot/smolvla_base, que implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. Cuenta con 450.046.176 parámetros (unos 450 M) y un repositorio de 0,9 GB en formato safetensors, bajo licencia Apache 2.0 y con la librería lerobot como dependencia de ejecución.

El modelo resuelve un problema muy acotado: controlar un brazo robótico tipo so_follower mediante imitación. A partir de tres cámaras de 256x256 píxeles, una cámara adicional de 480x640 y un vector de estado de 6 dimensiones, predice una acción de 6 dimensiones. Está condicionado por una instrucción de tarea en lenguaje natural y se entrenó sobre 157 episodios y 123.964 fotogramas a 30 FPS de un único dataset.

Su interés actual es doble: ejemplifica el flujo de trabajo de LeRobot para ajustar políticas VLA compactas ejecutables en hardware de consumo, y sirve como caso reproducible de aprendizaje por imitación. Conviene advertir que no tiene descargas ni valoraciones, que no se han publicado resultados de evaluación y que las tareas del dataset (recoger uva, tomate o pescado de una caja) no coinciden con el nombre del repositorio ("pick-yellow-box").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) compacto, arquitectura SmolVLA (arXiv:2506.01844); la model card no detalla la topología interna |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no procesa contexto de texto arbitrario, sino una ventana de observaciones por paso de tiempo |
| Tipos de cuantizacion | No disponible; el repositorio se distribuye en safetensors sin versiones cuantizadas documentadas |
| Idiomas soportados | No disponible (política robótica; acepta una instrucción de tarea en texto cuyo idioma no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería lerobot) |
| Tipo de robot | so_follower |
| Cámaras declaradas | wrist, front (las claves de observación reales son observation.images.camera1, camera2, camera3 y observation.images.empty_camera_0) |
| Dimensión de la acción | 6 |
| Modelo base | lerobot/smolvla_base |

## Arquitectura y entrenamiento

Se trata de un ajuste fino por imitación (behavior cloning) del modelo preentrenado lerobot/smolvla_base. La model card no especifica el número de tokens de preentrenamiento del modelo base, ni la composición de su dataset, ni si hubo etapas de RLHF o DPO; al no ser un modelo generativo de texto, esos mecanismos no aplican en el sentido habitual. La innovación que se le atribuye es la de un VLA compacto que alcanza rendimiento competitivo con un coste computacional reducido y desplegable en hardware de consumo.

El ajuste se realizó sobre el dataset kinderbot/kinderbot-pick-yellow-box-task: 157 episodios y 123.964 fotogramas a 30 FPS, lo que equivale a unos 4.132 segundos (aproximadamente 69 minutos) de datos de demostración. La configuración de entrenamiento fue de 20.000 pasos con tamaño de lote 64 (1.280.000 muestras procesadas, en torno a 10,3 pasadas equivalentes sobre el dataset), optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.2. Las tareas registradas son "Pick the grape from the box and place it on the table", "Pick the tomato from the box and place it on the table" y "Pick the fish from the box and place it on the table".

## Capacidades

- Predicción de acciones de 6 grados de libertad para un brazo so_follower a partir de observaciones multimodales.
- Fusión de tres cámaras de 256x256 píxeles, una cámara de 480x640 y un vector de estado propioceptivo de 6 dimensiones.
- Condicionamiento por instrucción de tarea en lenguaje natural, restringido a las tres tareas vistas durante el entrenamiento.
- Ejecución de manipulación tipo pick-and-place sobre objetos pequeños colocados en una caja.
- Ejecución de políticas en bucle cerrado mediante la CLI lerobot-rollout.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y su única salida es un vector de acción.
- No soporta agentes ni razonamiento multi-paso en el sentido software; su "razonamiento" se limita al mapeo percepción-acción por paso de tiempo.
- No dispone de capacidades multilingües ni de generación de texto, código, matemáticas, visión descriptiva o audio.

## Casos de uso

- Automatización de pick-and-place en líneas ligeras: el modelo recoge objetos pequeños de una caja y los deposita en una superficie, con una política entrenada específicamente para esa secuencia y un brazo de bajo coste.
- Prototipado de investigación en manipulación robótica: permite validar pipelines de aprendizaje por imitación con 450 M de parámetros en una GPU de consumo, sin necesidad de clústeres multinodo.
- Docencia y prácticas de robótica: sirve como ejemplo completo y reproducible del ciclo grabar dataset, entrenar con LeRobot y ejecutar con lerobot-rollout, con hiperparámetros documentados.
- Punto de partida para nuevos ajustes finos: al derivar de lerobot/smolvla_base y ser Apache 2.0, puede reentrenarse sobre datasets propios de unas pocas decenas de episodios para tareas de recogida similares.
- Clasificación y manipulación en laboratorio: trasladar muestras físicas (tubos, piezas, recipientes pequeños) de una bandeja a otra en entornos controlados con iluminación estable.
- Reproducción de experimentos y benchmarking de VLA: útil para comparar el comportamiento de políticas compactas frente a alternativas de mayor tamaño en la misma estación robótica.
- Demostraciones técnicas y validación de hardware: verificar la calibración de cámaras y del efector final ejecutando una política conocida antes de abordar desarrollos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la indicación explícita de que todavía no se han proporcionado resultados para esta política (ni tasa de éxito, ni número de ensayos por tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en BF16/FP16 y unos 1,8 GB en FP32 para los 450 M de parámetros; el repositorio completo ocupa 0,9 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o una GPU de centro de datos como A100 o H100 ofrecen margen sobrado para ejecutar la política junto con el preprocesado de imágenes.
- Cabe en GPU de consumo sin problema, incluidas GPU de portátil de gama media; la model card insiste en que SmolVLA está pensado para hardware de consumo, a diferencia de VLA de mayor tamaño.
- Ejecución en CPU: técnicamente posible por el tamaño del modelo, pero no documentada por el autor y previsiblemente con latencia incompatible con control en tiempo real a 30 FPS.
- Opciones de despliegue: la vía oficial es la CLI de LeRobot (lerobot-rollout para ejecutar y lerobot-train para reentrenar) sobre PyTorch. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de acciones.
- Latencia y throughput estimados: no disponibles. El sistema requiere tres cámaras de 256x256 más una de 480x640 y captura a 30 FPS en el dataset de entrenamiento, lo que marca el orden de magnitud temporal del bucle de control, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kinderbot/smolvla-pick-yellow-box | 450 M | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino especializado en 3 tareas de pick-and-place |
| lerobot/smolvla_base | 450 M (mismo tamaño de parámetros) | No disponible | Apache 2.0 | Hugging Face | Modelo base sin ajustar; es el punto de partida de este repositorio |
| Otras familias VLA (OpenVLA, pi0 y similares) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No se dispone de datos verificables para comparar parámetros, contexto o rendimiento |

La comparación cuantitativa de rendimiento entre estas opciones no es posible con la información disponible: no hay resultados de evaluación publicados para esta política ni métricas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara que no se han aportado resultados, por lo que la tasa de éxito real de las tres tareas es desconocida.
- Sin validación por la comunidad: cero descargas y cero valoraciones, lo que implica que el modelo no ha sido reproducido ni contrastado por terceros.
- Riesgo elevado de sobreajuste: 157 episodios, una sola estación robótica y una única configuración de cámaras para tres tareas muy parecidas.
- Dependencia estricta de la configuración: las claves de observación y los nombres de cámara deben coincidir exactamente con los del entrenamiento; cambiar puertos, índices o resoluciones puede degradar o invalidar la política.
- Sensibilidad al entorno: cambios de iluminación, de posición de los objetos, presencia de distractores o el uso de un robot distinto del mismo tipo afectan al comportamiento y no están cuantificados.
- Generalización nula fuera de las tres instrucciones entrenadas: cualquier otra orden de tarea queda fuera de la distribución.
- Sin capacidades de lenguaje, razonamiento, código ni matemáticas: no debe evaluarse como un modelo fundacional de texto.
- Incoherencia de nomenclatura: el repositorio se llama "pick-yellow-box" mientras que las tareas registradas mencionan uva, tomate y pescado, lo que puede inducir a error al reutilizarlo.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero la licencia del dataset de entrenamiento no está declarada y debe verificarse de forma independiente antes de un uso productivo.
- Sesgos potenciales derivados de la recogida de datos (posiciones, colores, tipos de objeto y condiciones de luz concretas) que no se documentan en la model card.
- No apto para producción sin validación de seguridad: es un artefacto de investigación con movimiento físico real y sin datos de fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinderbot/smolvla-pick-yellow-box
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/kinderbot/kinderbot-pick-yellow-box-task
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Paper en Hugging Face: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kinderbot/kinderbot-pick-yellow-box-task
- Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes sobre este modelo; todas las entradas devueltas corresponden a páginas de inicio de sesión de un servicio de vídeo en streaming y se han descartado.
