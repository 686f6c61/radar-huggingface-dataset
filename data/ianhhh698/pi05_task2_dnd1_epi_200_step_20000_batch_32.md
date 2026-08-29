# IanHHH698/pi05_task2_DND1_epi_200_step_20000_batch_32

## Resumen

El modelo `pi05_task2_DND1_epi_200_step_20000_batch_32` es un checkpoint de fine-tuning de la política π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado originalmente por Physical Intelligence para robótica con generalización a entornos abiertos. Este checkpoint concreto ha sido entrenado por el usuario IanHHH698 utilizando la librería LeRobot de Hugging Face, partiendo del modelo base `lerobot/pi05_libero` y ajustándolo sobre el dataset `cbrian/merge_task2_DND_epi_200`, que contiene 200 episodios de demostraciones robóticas para una tarea específica (identificada como "task2" con variante "DND1").

El modelo tiene 3.616.757.520 parámetros (aproximadamente 3,6 mil millones), lo que lo sitúa en la gama de los VLA de tamaño medio. Su relevancia radica en que demuestra el flujo completo de fine-tuning de π₀.₅ con LeRobot, permitiendo a la comunidad adaptar un modelo de propósito general a tareas robóticas concretas con relativamente pocos datos (200 episodios). El checkpoint se publica con licencia Apache-2.0, lo que facilita su uso comercial y académico.

Al ser un modelo de robótica, su salida son acciones de control (posiciones de articulaciones, velocidades, etc.) condicionadas por observaciones visuales e instrucciones en lenguaje natural. No es un modelo de generación de texto convencional, sino una política de control entrenada mediante aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Physical Intelligence) |
| Parametros totales | 3.616.757.520 (3,6 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en lenguaje natural, pero no se especifican idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de visión-lenguaje-acción que extiende la arquitectura de π₀, incorporando co-entrenamiento sobre datos heterogéneos de multiples robots y tareas para lograr generalización a entornos no vistos. La arquitectura combina un codificador de vision (tipicamente un ViT), un modelo de lenguaje (basado en transformador) y un cabezal de accion que produce comandos de control continuos. El entrenamiento original de π₀.₅ se describe en el paper de Physical Intelligence (arXiv:2504.16054) e incluye una fase de pre-entrenamiento a gran escala seguida de fine-tuning especifico por tarea.

Este checkpoint concreto ha sido entrenado con LeRobot, la libreria de Hugging Face para aprendizaje por imitacion. El proceso de fine-tuning parte del checkpoint `lerobot/pi05_libero` y se ajusta sobre el dataset `cbrian/merge_task2_DND_epi_200` con 200 episodios, 20.000 pasos de entrenamiento y batch size 32 (segun el nombre del repositorio). No se especifica si se utilizaron tecnicas como RLHF o DPO; el entrenamiento es de tipo imitacion supervisada (behavior cloning) sobre demostraciones. El dataset combina episodios de una tarea de manipulacion con variantes "DND" (posiblemente "drop and drag" o similar), aunque los detalles exactos de la tarea no estan documentados en la informacion disponible.

## Capacidades

- Control robotico end-to-end: el modelo recibe observaciones visuales (camaras) e instrucciones en lenguaje natural, y produce acciones de control para los actuadores del robot.
- Generalizacion a entornos nuevos: gracias al pre-entrenamiento de π₀.₅, el modelo puede transferir habilidades a escenarios no vistos durante el fine-tuning, aunque el grado de generalizacion depende de la tarea especifica.
- Aprendizaje por imitacion: el checkpoint esta optimizado para reproducir las demostraciones del dataset de entrenamiento, lo que lo hace util para tareas de manipulacion definidas.
- Integracion con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluacion y despliegue en robots reales (por ejemplo, SO-100, Aloha, etc.).
- No incluye capacidades de tool calling, agentes o razonamiento multi-paso fuera del ambito robotico; su funcion es exclusivamente generar acciones de control.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo puede controlar un brazo robotico para realizar tareas de recoger y colocar objetos, entrenado con demostraciones humanas. Se usaria con LeRobot y un robot compatible (por ejemplo, SO-100) cargando el checkpoint y ejecutando inferencia en tiempo real.
- Evaluacion de generalizacion en robotica: investigadores pueden evaluar hasta que punto el fine-tuning con 200 episodios mantiene las capacidades de generalizacion de π₀.₅, comparando el rendimiento en variantes de la tarea no incluidas en el entrenamiento.
- Base para fine-tuning posterior: el checkpoint puede servir como punto de partida para ajustar el modelo a una tarea relacionada con pocos datos adicionales, aprovechando el conocimiento ya adquirido en la tarea DND1.
- Reproduccion de experimentos: dado que se publica con configuracion de entrenamiento (via LeRobot), otros equipos pueden reproducir el proceso de fine-tuning y verificar resultados, lo que es util para estudios de metodos de aprendizaje por imitacion.
- Desarrollo de pipelines de robotica con VLA: integracion en sistemas que combinan percepcion visual, comprension de lenguaje y control motor, por ejemplo, en entornos de investigacion sobre robots de asistencia o automatizacion flexible.
- Benchmarking de VLA en tareas especificas: el modelo puede utilizarse como referencia para comparar el rendimiento de otros VLA o metodos de control en la misma tarea (task2 con variante DND1), siempre que se disponga del mismo entorno de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de π₀.₅ (arXiv:2504.16054) reporta metricas de exito en diversas tareas de manipulacion, pero este checkpoint especifico no incluye una evaluacion publica. Para conocer el rendimiento real en la tarea DND1, seria necesario ejecutar una evaluacion con LeRobot en el entorno correspondiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud, pero un modelo de 3,6 B parametros en precision FP32 requiere aproximadamente 14,5 GB de VRAM solo para los pesos. Con cuantizacion a FP16 o BF16, se reduce a unos 7,2 GB. En la practica, LeRobot suele cargar en FP32 o FP16, por lo que se recomienda una GPU con al menos 12-16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs con menos de 12 GB, podria ser necesario cuantizar o usar offloading, aunque no se ha probado.
- Si cabe en consumer GPU: si, en una RTX 3090 o 4090 con 24 GB es viable para inferencia. Para entrenamiento, se necesitaria al menos 24 GB y probablemente mas para el optimizador.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia (`lerobot-record`). Tambien se puede exportar a otros formatos (ONNX, TensorRT) si se desea, aunque no esta documentado para este checkpoint.
- Latencia y throughput: no disponible. Depende de la GPU, del tamaño de imagen y de la frecuencia de control requerida. En general, un VLA de 3,6 B puede operar a 10-30 Hz en una GPU moderna, pero no hay datos concretos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05_task2_DND1 (este) | 3,6 B | no disponible | Apache-2.0 | Hugging Face |
| lerobot/pi05_libero (base) | 3,6 B | no disponible | Apache-2.0 | Hugging Face |
| π₀ (original) | 3,0 B (estimado) | no disponible | no publicada (uso investigacion) | Codigo abierto parcial |
| OpenVLA (7B) | 7 B | 2048 tokens | MIT | Hugging Face |

Nota: π₀.₅ es una evolucion de π₀ con mejor generalizacion. OpenVLA es un VLA alternativo de 7B con licencia permisiva, pero no es directamente comparable en arquitectura ni en rendimiento. No se dispone de datos de benchmarks comparativos entre estos modelos en la tarea DND1.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con demostraciones de un dataset especifico, puede heredar sesgos en la forma de ejecutar la tarea (por ejemplo, preferencias del operador humano que demostro las acciones).
- Riesgo de alucinacion: en el contexto robotico, el riesgo se manifiesta como acciones incorrectas o inestables cuando el modelo se enfrenta a observaciones fuera de la distribucion de entrenamiento. No hay garantia de seguridad en entornos no vistos.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero los VLA suelen procesar una secuencia corta de imagenes y texto; no estan disenados para dialogos largos ni razonamiento extendido.
- Limitaciones de idioma: no se documentan los idiomas soportados; probablemente el modelo fue entrenado principalmente con instrucciones en ingles, por lo que otros idiomas pueden degradar el rendimiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base π₀.₅ puede tener restricciones adicionales de Physical Intelligence (aunque el checkpoint en LeRobot se publica bajo Apache-2.0). Se recomienda revisar los terminos del modelo base.
- Caveat para produccion: este checkpoint es un experimento de fine-tuning con un dataset pequeno (200 episodios). No se ha validado su robustez en entornos reales de produccion. Antes de cualquier despliegue, es imprescindible realizar pruebas de seguridad y evaluacion exhaustiva en el robot objetivo.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/IanHHH698/pi05_task2_DND1_epi_200_step_20000_batch_32
- Paper de π₀.₅ (arXiv): https://arxiv.org/abs/2504.16054
- PDF del paper: https://www.pi.website/download/pi05.pdf
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio de codigo openpi05 (fine-tuning e inferencia): https://github.com/Integer003/openpi05
- Checkpoint base en LeRobot: https://huggingface.co/lerobot/pi05_libero (referencia indirecta, no verificado en la busqueda)
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
