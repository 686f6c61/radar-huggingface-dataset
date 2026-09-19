# mim-chess-vlas/train_800_complex__mask__overlay_a100__sim__all_cameras__live__pi05__seed_0

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo π₀.₅ (Pi05) de Physical Intelligence, un modelo de Visión-Lenguaje-Acción (VLA) orientado a robótica y generalización en entornos abiertos. El ajuste lo publica el usuario mim-chess-vlas y se ha entrenado y subido a Hugging Face mediante LeRobot, la librería de robótica de Hugging Face. El modelo base es lerobot/pi05_base y la implementación de LeRobot deriva del repositorio OpenPI de Physical Intelligence.

El modelo consume observaciones heterogéneas (estado del robot y tres cámaras RGB de 224x224) y produce directamente una acción de 7 dimensiones, por lo que funciona como política de control para un brazo robótico Panda, no como modelo de lenguaje generativo. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y licencia Apache 2.0, es relevante para investigación en manipulación robótica porque combina percepción visual multi-cámara, condicionamiento por instrucciones en lenguaje natural y control de acciones en un único modelo.

El ajuste se ha realizado sobre 790 episodios y 157.904 fotogramas a 20 FPS de un dataset propio centrado en tareas de recogida y colocación (pick-and-place) de objetos geométricamente complejos. El repositorio no incluye datos de benchmarks publicados ni documentación adicional sobre la receta de entrenamiento, y el número de descargas y valoraciones registrados es de cero en la fecha de consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) según la model card; detalle interno del backbone no disponible |
| Parámetros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; las instrucciones del dataset están redactadas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Librería | LeRobot |
| Tipo de robot | Panda |
| Cámaras de entrada | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entrada de estado | observation.state, forma (9,) |
| Salida de acción | action, forma (7,) |
| Tamaño del repositorio | 74,8 GB |
| Pipeline declarado | robotics |
| Fecha de creación | 19 de septiembre de 2026 |
| Última actualización | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un VLA (Vision-Language-Action) de Physical Intelligence, diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento, y como evolución de π₀. La implementación empleada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La model card no detalla la composición interna del backbone (encoder de visión, modelo de lenguaje o cabezal de acciones), el número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO; todos estos puntos quedan como no disponibles.

La interfaz del modelo está completamente especificada: recibe observation.state con forma (9,), tres imágenes RGB de 224x224 correspondientes a las cámaras agentview, robot0_eye_in_hand y robot0_eye_in_hand_2, y emite un vector de acción de 7 dimensiones. El entrenamiento utiliza el dataset mim-chess-vlas/train_800_complex__mask__overlay_a100__sim__all_cameras__live, compuesto por 790 episodios y 157.904 fotogramas capturados a 20 FPS, con tareas definidas mediante instrucciones textuales largas y descriptivas en inglés (por ejemplo, "Pick the upright egg flanked by a pair of tall flat ribs on each side... and place it into the box"). El nombre del dataset sugiere origen simulado ("sim") y ejecución sobre GPU A100 ("a100"), aunque la model card no lo confirma explícitamente. Tampoco se documenta si se empleó decodificación especulativa, atención lineal u otras innovaciones de inferencia.

## Capacidades

- Control robótico de un brazo Panda: genera acciones de 7 dimensiones a partir de observaciones de estado y visión.
- Percepción visual multi-cámara: procesa de forma simultánea una vista de agente (agentview) y dos vistas de mano en el efector (eye-in-hand y eye_in_hand_2), todas a 224x224 píxeles.
- Seguimiento de instrucciones en lenguaje natural: las tareas del dataset están especificadas como descripciones textuales detalladas de la geometría y las propiedades del objeto.
- Manipulación de objetos geométricamente complejos: el dataset cubre piezas con lóbulos, cavidades, costillas, ranuras y protuberancias, lo que implica agarre y colocación no triviales.
- Tareas de pick-and-place: la habilidad central documentada es recoger un objeto y colocarlo en una caja, condicionada por la descripción textual del objeto.
- Ajuste específico por semilla: el identificador del repositorio incluye seed_0, lo que indica que forma parte de una familia de ajustes con distintas semillas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo de pensamiento (thinking). La salida del modelo es exclusivamente un vector de acción.

## Casos de uso

- Manipulación robótica de precisión en simulación: el modelo puede ejecutar políticas de pick-and-place sobre objetos con geometrías complejas (lóbulos, costillas, cavidades) en el mismo entorno simulado del dataset de entrenamiento, aprovechando el condicionamiento por descripción textual del objeto.
- Investigación en generalización de políticas VLA: al ser un ajuste de π₀.₅ sobre un conjunto acotado de 790 episodios, sirve para estudiar hasta qué punto un modelo base VLA transfiere a tareas nuevas con pocas demostraciones.
- Evaluación comparativa de arquitecturas VLA: el sufijo seed_0 permite reproducir experimentos con distintas semillas y comparar estabilidad del entrenamiento y del rendimiento entre ejecuciones.
- Recolección de datos guiada por política: la política puede desplegarse para generar trayectorias adicionales que después se filtren y se añadan al dataset de entrenamiento.
- Automatización de líneas de clasificación y empaquetado en laboratorio: con un brazo Panda real y las tres cámaras especificadas, el modelo puede recoger piezas y depositarlas en una caja siguiendo instrucciones textuales, siempre que el dominio visual se acerque al de entrenamiento.
- Integración en pipelines de LeRobot: al usar library_name: lerobot y pesos en safetensors, el modelo se puede cargar, evaluar y reentrenar con las herramientas y guías de LeRobot para π₀.₅.
- Estudio de robustez ante oclusión y variación visual: el nombre del dataset incluye términos como "mask" y "overlay", lo que sugiere variantes de aumento u oclusión que pueden aprovecharse para analizar la sensibilidad del modelo a cambios en la imagen.
- Pruebas de estrés de agarre con objetos adversos: la variedad morfológica de las piezas descritas (estrella de cuatro puntas, huevo con costillas, cubo con ranura) permite diseñar baterías de evaluación de agarre sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito por tarea, tasas de agarre, comparaciones con π₀ ni evaluaciones en robot real o simulado.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los 4.143.404.816 parámetros: aproximadamente 16,6 GB en FP32, 8,3 GB en BF16/FP16, 4,1 GB en INT8 y 2,1 GB en INT4, sin contar memoria adicional para activaciones y para el procesamiento de las tres imágenes de entrada.
- GPU recomendadas para servicio o entrenamiento: A100 (el nombre del dataset indica entrenamiento sobre A100) y H100 para entrenamiento o ajuste fino; GPU de 24 GB o más para inferencia en BF16.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como RTX 3090 o RTX 4090 en BF16/FP16; en tarjetas de 16 GB como RTX 4080 conviene reducir precisión o aplicar cuantización.
- Opciones de despliegue: la información disponible solo documenta el uso mediante LeRobot y pesos safetensors en PyTorch. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, y no se documentan variantes GGUF.
- Latencia y throughput: no disponibles. El modelo está pensado para control a 20 FPS (frecuencia del dataset de entrenamiento), pero no se publican mediciones de latencia de inferencia.
- Almacenamiento: el repositorio ocupa 74,8 GB, muy por encima del tamaño de los pesos en BF16, lo que sugiere que incluye estados de optimizador u otros artefactos de entrenamiento además de los pesos finales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa. La única referencia disponible es el modelo base del que deriva este ajuste.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune de π₀.₅, seed_0) | 4.143.404.816 | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/pi05_base (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| π₀ (predecesor mencionado en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo específico de robótica: no es un modelo de lenguaje ni un asistente conversacional; su única salida es un vector de acción de 7 dimensiones, por lo que no puede emplearse para generación de texto, código o razonamiento.
- Dependencia estricta del formato de entrada: requiere estado de 9 dimensiones y exactamente tres cámaras RGB de 224x224 con los nombres agentview, robot0_eye_in_hand y robot0_eye_in_hand_2. Cambiar la configuración de sensores invalida el uso directo.
- Ajuste altamente especializado: el entrenamiento se limita a 790 episodios de tareas de pick-and-place de objetos concretos, por lo que la generalización fuera de ese dominio queda sin demostrar.
- Posible origen simulado de los datos: el nombre del dataset incluye "sim", lo que apunta a datos de simulación; la transferencia a un robot físico (sim-to-real) no está documentada ni validada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito, robustez o comparación con π₀.₅ base.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como política de imitación, puede generar trayectorias que parezcan válidas y fallen en el agarre o la colocación, sin señal de incertidumbre asociada.
- Idiomas no declarados: la model card no especifica idiomas soportados y las instrucciones del dataset están en inglés; no hay evidencia de funcionamiento con instrucciones en castellano.
- Sesgos de dominio: el modelo hereda los sesgos de un dataset reducido de un único tipo de robot, iluminación y disposición de cámara.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones propias que conviene verificar antes de un despliegue en producción.
- Estado de adopción nulo: 0 descargas y 0 valoraciones en la fecha de consulta, sin validación por parte de la comunidad.
- Coste de almacenamiento elevado: 74,8 GB de repositorio para un modelo de 4,14 mil millones de parámetros.
- La búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces obtenidos correspondían a entidades homónimas sin relación (grupos de imagen médica y una facultad universitaria), por lo que no aportan información utilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_complex__mask__overlay_a100__sim__all_cameras__live__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__mask__overlay_a100__sim__all_cameras__live
- Guía de LeRobot para π₀.₅: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (mencionado en la model card, sin URL explícita): no disponible
