# NONHUMAN-RESEARCH/folding-towel-teleop-vr-act

## Resumen

`NONHUMAN-RESEARCH/folding-towel-teleop-vr-act` es una política robótica de imitación basada en ACT (Action Chunking with Transformers), entrenada y publicada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular del robot y dos cámaras RGB y produce comandos de acción de 14 dimensiones. El modelo lo desarrolla el usuario/organización NONHUMAN-RESEARCH y está pensado para ejecutar una única tarea manipulativa: doblar una toalla amarilla.

La arquitectura ACT fue descrita en el artículo arXiv:2304.13705 y se apoya en un transformer con codificador CVAE que predice "chunks" de acciones (varios pasos futuros de una sola vez) en lugar de acciones individuales. Esta estrategia reduce el error de composición acumulado típico de las políticas paso a paso y suaviza las trayectorias. El modelo tiene 51.685.006 parámetros (~51,7 M), un tamaño muy contenido que permite inferencia en tiempo real a 30 FPS.

Su relevancia práctica es acotada: se trata de un caso de uso muy específico (una sola tarea, un solo tipo de robot y un único dataset de 101 episodios), pero sirve como ejemplo reproducible del flujo de imitación con LeRobot y como punto de partida para hacer fine-tuning en tareas de manipulación con teleoperación VR. La licencia Apache 2.0 facilita su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador CVAE y decodificación por chunks (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.685.006 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no detalla el tamaño del chunk de acciones ni el número de pasos de observación) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; LeRobot no documenta cuantizaciones alternativas) |
| Idiomas soportados | no aplicable a un modelo visomotor; la instrucción de tarea está en inglés ("Fold the yellow towel") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo de LeRobot) |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Robot objetivo | `piper` |
| Camaras | `left`, `right` (3 x 480 x 640) |
| Estado de observacion | `observation.state`, shape (14,) |
| Salida de accion | `action`, shape (14,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 3 / 0 |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

ACT combina un codificador de tipo CVAE con un transformer. El codificador comprime la secuencia de observaciones (estado articular a 14 dimensiones más las dos imágenes de cámara) y una variable latente de estilo `z` en un embedding; el decodificador es un transformer que genera un chunk de acciones de forma autorregresiva sobre la dimensión temporal, no paso a paso. En inferencia, ACT evita usar `z` (se fija a cero o a la media) y aplica *temporal ensembling*: solapa los chunks predichos y promedia las acciones para obtener trayectorias suaves. Los detalles concretos de hiperparámetros arquitectónicos de esta policy (número de capas, dimensión del modelo, tamaño de chunk) no se publican en la model card.

El entrenamiento es de imitación supervisada pura (sin RLHF ni DPO, que no aplican a este dominio) sobre el dataset `NONHUMAN-RESEARCH/folding-towel-teleop-vr`, con teleoperación VR. El dataset contiene 101 episodios y 93.847 fotogramas grabados a 30 FPS, con la tarea "Fold the yellow towel". La configuración de entrenamiento reportada es: 26.150 pasos, batch size 96, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. No se documenta el número de tokens ni la composición del dataset más allá de la tarea y el robot.

## Capacidades

- Control visomotor de manipulación bimanual: genera comandos de acción de 14 grados de libertad a partir del estado del robot y dos vistas de cámara.
- Ejecución de una tarea concreta y repetible: doblar una toalla amarilla.
- Predicción de chunks de acciones con ensamblado temporal, lo que produce movimientos más suaves y robustos que el control paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas en VR; no requiere recompensas ni ingeniería de entorno.
- Condicionamiento por instrucción de tarea en texto (en este caso, una única frase fija).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades de generación de texto, código, matemáticas, audio ni visión general: su entrada visual es específica para su política.

## Casos de uso

- Doblado de toallas en laboratorio o demostrador: el modelo ejecuta la tarea entrenada sobre un robot Piper con dos cámaras. Es su propósito directo y la única tarea para la que hay datos.
- Base para fine-tuning en tareas de plegado textil: por su licencia Apache 2.0 y su tamaño contenido (51,7 M de parámetros), es un punto de partida barato para reentrenar con nuevos objetos o prendas.
- Recolección de datos y validación de pipeline con LeRobot: sirve para poner a punto el flujo `lerobot-train` / `lerobot-rollout`, la calibración de cámaras y el control a 30 FPS antes de abordar tareas más complejas.
- Investigación en imitación con teleoperación VR: permite estudiar cómo influye la calidad y el volumen de demostraciones (101 episodios, 93.847 fotogramas) en la tasa de éxito de ACT.
- Benchmark interno de políticas manipulativas: comparar ACT frente a alternativas como Diffusion Policy o modelos fundacionales de robótica con el mismo robot y dataset.
- Prototipado en robótica educativa o de bajo coste: al caber en GPUs de consumo e incluso en hardware embebido, se puede desplegar en plataformas tipo Jetson para prácticas docentes de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No hay tabla de ensayos, éxitos ni tasa de éxito en robot real, ni resultados en MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje (no aplicables a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos suman 51,7 M de parámetros, aproximadamente 207 MB en fp32 y unos 103 MB en fp16. Añadiendo los dos codificadores de imagen y las activaciones, el consumo cabe holgadamente por debajo de 1 GB en fp16, aunque es una estimación (no publicada por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM. Una RTX 3060, RTX 4060 o superior es más que suficiente; en el extremo alto, A100 o H100 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer reciente, y también en hardware embebido de robótica (por ejemplo, Jetson Orin) si se usa fp16.
- Opciones de despliegue: LeRobot es la vía nativa, con el comando `lerobot-rollout` y `--policy.path=NONHUMAN-RESEARCH/folding-towel-teleop-vr-act`. Se ejecuta sobre PyTorch en CUDA o CPU. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles como cifras publicadas. El bucle de control está pensado para operar a 30 FPS (la tasa del dataset); el ensamblado temporal de ACT añade un pequeño retardo adicional al promediar chunks solapados.

## Comparativa con modelos similares

| Modelo | Tipo / arquitectura | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| folding-towel-teleop-vr-act | ACT (transformer + CVAE) | 51,7 M | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| NONHUMAN-RESEARCH/act-hanoi-teleop | ACT (transformer + CVAE) | no disponible | no disponible | no disponible | Hugging Face |
| Diffusion Policy | Politica de difusion para acciones | no disponible | no disponible | no disponible | Repositorio de referencia |
| Modelos fundacionales de robotica (por ejemplo, pi0) | Vision-lenguaje-accion | orden de miles de millones (no confirmado) | no disponible | no disponible | Hugging Face |

Nota: la información pública sobre parámetros, contexto y licencia de las alternativas es escasa. La comparación con `act-hanoi-teleop` es especialmente pertinente porque comparte autor y metodología ACT, difiriendo solo en la tarea y el dataset.

## Limitaciones y advertencias

- Sobreajuste a la tarea: el modelo está entrenado exclusivamente para "Fold the yellow towel" con un robot `piper`; fuera de ese contexto su comportamiento no está garantizado.
- Dependencia del calibrado de hardware: requiere que las cámaras `left` y `right` y el puerto del robot coincidan con la configuración de entrenamiento; un cambio de cámara, iluminación o posición de objeto puede degradar el rendimiento.
- Cambios de dominio: la model card no reporta evaluación con nuevas posiciones de objeto, iluminación distinta, distractores u otro robot del mismo tipo, por lo que se desconoce su robustez.
- Dataset pequeño: 101 episodios y 93.847 fotogramas a 30 FPS son un volumen limitado; la política probablemente tenga poca generalización más allá de las condiciones demostradas.
- Riesgo de fallo silencioso: al ser una política de imitación sin verificación de estado, puede ejecutar acciones incorrectas sin avisar, lo que exige supervisión humana y paradas de seguridad en producción.
- Sesgos: heredados de las demostraciones humanas (posición de la toalla, estilo de plegado, velocidad). No se documentan análisis de sesgo.
- Idiomas: no procesa lenguaje natural más allá de la instrucción de tarea en inglés; no aplicable el soporte multilingüe.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero exige conservar los avisos de copyright y la atribución correspondiente (incluida la cita de LeRobot y del artículo de ACT).
- Madurez: con 3 descargas y 0 likes, es un modelo recién publicado y sin validación externa; úsalo con cautela en entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NONHUMAN-RESEARCH/folding-towel-teleop-vr-act
- Dataset de entrenamiento: https://huggingface.co/datasets/NONHUMAN-RESEARCH/folding-towel-teleop-vr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=NONHUMAN-RESEARCH/folding-towel-teleop-vr
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitacion): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Modelo relacionado del mismo autor: https://huggingface.co/NONHUMAN-RESEARCH/act-hanoi-teleop
- Sistema de doblado bimanual con Piper (contexto): https://dream25851.github.io/Bimanual_Folding/index.html
