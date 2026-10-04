# dorisjlee/sim-shapes-v2-plus-physical-act-v2

## Resumen

Este repositorio contiene una política robótica entrenada con el método ACT (Action Chunking with Transformers), una técnica de aprendizaje por imitación que predice bloques (*chunks*) de acciones en lugar de pasos individuales. El modelo lo publica el usuario dorisjlee utilizando LeRobot, la librería de Hugging Face para aprendizaje automático en robótica del mundo real, y está pensado para ejecutarse sobre un brazo seguidor del tipo `so_follower` (familia SO-100/SO-101) equipado con dos cámaras.

El modelo resuelve una única tarea de manipulación: colocar un rectángulo en una caja según su color ("Place Rectangle in Box based on Color"). Consume el estado de las articulaciones (vector de 6 dimensiones) y dos flujos de imagen (frontal a 480x640 y cenital a 720x1280), y produce un vector de acción de 6 dimensiones. Con 17.958.406 parámetros (unos 17,96 millones), es un modelo compacto que cabe holgadamente en cualquier GPU de consumo e incluso puede ejecutarse en CPU.

Su relevancia es la de un artefacto de investigación reproducible: se ha entrenado con 30.000 pasos sobre 281 episodios y 127.343 fotogramas a 30 FPS procedentes del dataset `dorisjlee/sim-shapes-v2-plus-physical`, que combina componentes simulados y físicos. No se han publicado resultados de evaluación, por lo que debe tratarse como un punto de partida verificable y no como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parametros totales | 17.958.406 (aproximadamente 17,96 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica; es una política de control que predice chunks de acciones. El tamano de chunk no se especifica en la model card |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la política no procesa lenguaje natural como entrada (la tarea se fija por cadena de texto en la CLI de LeRobot) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, en el formato de checkpoint de LeRobot |
| Tipo de robot | `so_follower` |
| Camaras | `front` (3, 480, 640) y `overhead` (3, 720, 1280) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Tamano del repositorio | 0,1 GB |
| Libreria | lerobot (version de entrenamiento 0.5.2) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). La política se formula como un transformer condicionado por observaciones que predice secuencias cortas de acciones (action chunking) en lugar de un único paso de control; esta formulación reduce el error de compounding típico del behavior cloning paso a paso. El entrenamiento se realiza sobre datos de teleoperación, sin refuerzo ni preferencias humanas (no hay RLHF ni DPO: el objetivo es una pérdida de imitación supervisada). La model card no detalla los backbones de visión ni la dimensionalidad interna del transformer; solo se confirma el nombre del método y sus entradas y salidas.

Los datos de entrenamiento proceden del dataset `dorisjlee/sim-shapes-v2-plus-physical`: 281 episodios, 127.343 fotogramas a 30 FPS (aproximadamente 4.245 segundos, es decir, unas 70,8 minutos de trayectorias) y una única tarea, "Place Rectangle in Box based on Color". La configuración declarada es de 30.000 pasos de optimización, batch size 4, optimizador AdamW y tasa de aprendizaje 1e-5, con semilla 1000. El nombre del dataset sugiere una mezcla de datos simulados y físicos, aunque la model card no cuantifica la proporción ni describe el procedimiento de mezcla.

## Capacidades

- Control de manipulación de 6 grados de libertad: produce vectores de acción de 6 dimensiones a partir de un estado articular de 6 dimensiones.
- Percepción visual multi-cámara: procesa simultáneamente una vista frontal a 480x640 y una vista cenital a 720x1280.
- Predicción por chunks: genera secuencias cortas de acciones en lugar de un único paso, lo que aporta estabilidad temporal en la ejecución.
- Ejecución en bucle cerrado a 30 FPS: consume observaciones y emite acciones a la frecuencia del dataset de entrenamiento.
- Condicionamiento por tarea: la instrucción "Place Rectangle in Box based on Color" se pasa como cadena de tarea en la CLI de LeRobot.
- Aprendizaje por imitación: reproduce la distribución de comportamientos presente en los datos de teleoperación del dataset asociado.
- No incluye tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni visión generalista.

## Casos de uso

- Reproduccion de experimentos de imitacion: sirve para replicar el flujo completo de LeRobot (grabar datos, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`) sin necesidad de generar un dataset propio.
- Baseline para comparativas de metodos: al ser una política ACT de 17,96 M de parámetros entrenada sobre un dataset público y fijo, permite comparar frente a otras formulaciones (por ejemplo, políticas basadas en difusión) sobre la misma tarea y hardware.
- Validacion de pipelines sim-to-real: el dataset mezcla datos simulados y físicos según su nombre, lo que lo hace útil para estudiar la brecha entre ambos dominios en una tarea de clasificación y colocación por color.
- Docencia y formacion en robotica de bajo coste: el robot objetivo es un `so_follower`, una plataforma económica, y la política se ejecuta en GPU de consumo, lo que facilita montar prácticas de aprendizaje por imitación en laboratorio.
- Pruebas de robustez ante variaciones de entorno: dado que la propia plantilla de la model card recomienda registrar posiciones nuevas de objetos, cambios de iluminación y distractores, el modelo es un candidato directo para experimentos controlados de sensibilidad visual.
- Integracion en bancos de pruebas de evaluacion: se puede incorporar como una política más en un entorno de evaluación automatizado que ejecute N ensayos por tarea y mida tasas de éxito.
- Punto de partida para ajuste fino: con 281 episodios y 30.000 pasos de entrenamiento, el repositorio es un candidato razonable para continuar el entrenamiento con datos adicionales o variaciones de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la línea "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas. No se deben asumir cifras de éxito derivadas del paper de ACT, ya que corresponden a otros entornos y otras tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 por peso del modelo (unos 72 MB para 17,96 M de parámetros) más las activaciones de los dos flujos de imagen; la cifra exacta no está publicada. La vista cenital de 720x1280 es el componente que más memoria de activaciones consume.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo cabe sin problemas en RTX 3060, RTX 4090, A100 o H100. No se requiere memoria de GPU relevante y la ejecución en CPU es viable, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo y también en GPU integradas o CPU para pruebas puntuales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento) sobre PyTorch. vLLM, TGI, llama.cpp y Ollama no son aplicables, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput: no hay mediciones publicadas. El objetivo de diseño es 30 FPS (33,3 ms por paso de control), la frecuencia del dataset de entrenamiento; las cámaras se configuran en la CLI a 640x480 y 30 FPS para el robot objetivo.
- Requisitos adicionales: brazo `so_follower` calibrado, dos cámaras OpenCV y coincidencia exacta entre los nombres de cámara configurados y las claves de observación del entrenamiento (`observation.images.front`, `observation.images.overhead`).

## Comparativa con modelos similares

La información proporcionada solo describe este modelo, por lo que los datos de las alternativas se marcan como no disponibles. La comparación se plantea a nivel de categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT `dorisjlee/sim-shapes-v2-plus-physical-act-v2` | 17.958.406 | no aplica | Apache-2.0 | Hugging Face, 0 descargas y 0 likes en la fecha de consulta |
| Otras politicas ACT publicadas en el Hub de LeRobot | no disponible | no aplica | no disponible | no disponible |
| Politicas de imitacion basadas en difusion (Diffusion Policy) | no disponible | no aplica | no disponible | no disponible |
| Modelos VLA de proposito general para robotica | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de benchmark que permitan una comparación cuantitativa de rendimiento entre estas categorías.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (`so_follower`); no es un modelo generalista y no se espera que funcione en otras tareas, morfologías o número de grados de libertad.
- Ausencia total de evaluación: no hay tasas de éxito, número de ensayos ni condiciones de prueba publicadas, por lo que el rendimiento real en el mundo físico es desconocido.
- Posible brecha sim-to-real: el dataset asociado combina, según su nombre, datos simulados y físicos, pero la model card no especifica la proporción ni el método de mezcla.
- Sensibilidad al entorno: el comportamiento depende de dos cámaras concretas; cambios de iluminación, oclusión, posición de los objetos, distractores o una disposición de cámara distinta pueden degradar la ejecución.
- Dependencia de la cadena de tarea: la instrucción se pasa como texto en la CLI, pero el modelo no procesa lenguaje natural de forma general; no admite instrucciones libres ni diálogo.
- Sin capacidades lingüísticas: no hay soporte multilingüe, razonamiento simbólico, tool calling ni generación de texto. Las etiquetas de "alucinación" y "sesgo" en el sentido de los modelos de lenguaje no aplican; el riesgo equivalente es la ejecución de movimientos incorrectos o fallidos.
- Riesgo físico: cualquier despliegue sobre hardware real requiere límites de par, paradas de emergencia, espacio de trabajo despejado y supervisión humana. La licencia Apache-2.0 no transfiere ninguna garantía de seguridad.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, con obligación de conservar los avisos de licencia y de atribución; conviene revisar además la licencia del dataset `dorisjlee/sim-shapes-v2-plus-physical` antes de redistribuir derivados.
- Madurez baja: el repositorio registra 0 descargas y 0 likes, sin validación por parte de la comunidad, y su tamaño (0,1 GB) corresponde únicamente a los checkpoints.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dorisjlee/sim-shapes-v2-plus-physical-act-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/dorisjlee/sim-shapes-v2-plus-physical
- Visualizador del dataset en Hugging Face Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dorisjlee/sim-shapes-v2-plus-physical
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
