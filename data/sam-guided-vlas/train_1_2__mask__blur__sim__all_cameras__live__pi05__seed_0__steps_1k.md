# sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_1k

## Resumen

Este repositorio contiene un *policy* de robótica basado en π₀.₅ (Pi05), un modelo Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence y orientado a generalización en entornos abiertos: parte de π₀ y se entrena para operar en situaciones y entornos no vistos durante el entrenamiento. La implementación utilizada aquí es la adaptación de LeRobot a partir del repositorio OpenPI del propio fabricante. Se trata de un ajuste fino (*fine-tune*) del modelo base `lerobot/pi05_base`, publicado por el usuario `sam-guided-vlas`.

El modelo no es un LLM de propósito general: es una política de control que consume observaciones multimodales (estado del robot e imágenes de tres cámaras) y produce un vector de acción de 7 dimensiones. En concreto, la entrada incluye `observation.state` con 9 valores, tres cámaras de 224×224 píxeles (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y una instrucción de tarea en texto; la salida es `action` de 7 dimensiones. El robot de referencia indicado en la model card es un `Panda`.

El ajuste se ha realizado sobre un conjunto de datos de 200 episodios y 30.830 fotogramas a 20 FPS, con 20 tareas de manipulación de objetos cotidianos (dispensador de jabón, mermelada, tarro, cereales, soporte de cuchillos, hervidor, pera, patata, boniato, bollo, cesta, comida en caja, pastel, lata, hamburguesa, limón, naranja, especias, calabaza y pulverizador). El entrenamiento fue corto (1.000 pasos), lo que sitúa este checkpoint en la fase inicial o experimental de un *fine-tune*. La relevancia actual radica en que los VLA abiertos como π₀.₅ permiten reproducir investigación en manipulación robótica con pesos descargables y licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo Visión-Lenguaje-Acción (VLA) basado en π₀.₅; adaptación LeRobot del repositorio OpenPI. Detalle interno de capas no disponible |
| Parametros totales | 4.143.404.816 (~4,14 mil millones), según los pesos en safetensors del repositorio |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible en el sentido de LLM; la política consume por paso 3 imágenes de 224×224, un estado de 9 dimensiones y una instrucción de tarea textual |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas. El repositorio ocupa 9,4 GB en safetensors |
| Idiomas soportados | No disponible. La tarea se pasa como cadena de texto (los ejemplos de la model card están en inglés); no se documenta el conjunto de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato de LeRobot) |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 224, 224), `observation.images.robot0_eye_in_hand` (3, 224, 224), `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Robot de referencia | Panda |
| Pipeline / libreria | `robotics` / `lerobot` (LeRobot 0.6.0) |
| Modelo base | `lerobot/pi05_base` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅, presentada por Physical Intelligence como una evolución de π₀ enfocada a generalizar a entornos y situaciones completamente nuevos. La model card indica que la implementación procede del repositorio OpenPI y que el *fine-tune* se ha ejecutado con LeRobot. No se detallan en la información disponible la composición del *backbone* visual-lenguaje, el mecanismo de generación de acciones (por ejemplo, *flow matching*) ni el número de tokens vistos durante el preentrenamiento; estos datos figuran como no disponibles en esta ficha. Los pesos publicados suman 4.143.404.816 parámetros.

El ajuste fino se realizó con la configuración declarada en la model card: 1.000 pasos de entrenamiento, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05, semilla 0 y LeRobot 0.6.0. El conjunto de datos asociado contiene 200 episodios y 30.830 fotogramas a 20 FPS, con tareas de manipulación de 20 clases de objetos. Por la nomenclatura del repositorio (`train_1_2__mask__blur__sim__all_cameras__live`) y del autor (`sam-guided-vlas`) se deduce una variante de entrenamiento con enmascarado y desenfoque, cámaras simultáneas y datos de simulación y reales, aunque esta interpretación no se confirma explícitamente en la model card. No se documenta el uso de RLHF, DPO ni de ninguna técnica de alineación.

## Capacidades

- Generación de acciones de control robótico: política de imitación que mapea observaciones (estado de 9 dimensiones y tres vistas de cámara) a un vector de acción de 7 dimensiones.
- Condicionamiento por instrucción de tarea: acepta una cadena de tarea (por ejemplo, `"soap dispenser"`) para seleccionar el comportamiento.
- Manipulación de objetos cotidianos: el conjunto de entrenamiento cubre 20 tareas de agarre y colocación (alimentos, menaje, utensilios, envases).
- Percepción multi-cámara: consume de forma simultánea una vista cenital (`agentview`) y dos vistas de muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`), lo que aporta información de profundidad y de oclusión parcial.
- Generalización a entornos nuevos: es el objetivo declarado de π₀.₅ frente a π₀, aunque no hay resultados de evaluación que lo respalden en este repositorio.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`, y con `policy.path` para cargar pesos desde el Hub.
- No dispone de capacidad documentada de *tool calling*, *function calling*, razonamiento multi-paso en lenguaje natural, visión general (VQA, OCR), audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación doméstica en laboratorio: recogida y colocación de objetos como latas, frutas o envases sobre una mesa, aprovechando las tres cámaras y el estado de 9 dimensiones para tareas de agarre con oclusiones parciales.
- Investigación en generalización VLA: servir como *baseline* de un *fine-tune* corto (1.000 pasos) para comparar, frente a `lerobot/pi05_base`, cuánto se degrada o mejora el comportamiento con pocos datos.
- Replicación de experimentos de la comunidad OpenPI/LeRobot: el modelo se carga directamente con `policy.path`, lo que permite reproducir un *rollout* con un robot Panda sin reentrenar.
- Evaluación de variantes de datos de entrenamiento: la nomenclatura del dataset (enmascarado, desenfoque, simulación y datos reales) lo hace útil para estudiar el efecto de estas transformaciones sobre la tasa de éxito en tareas de agarre.
- Automatización de recogida en cocina o almacén ligero: tareas de *pick-and-place* repetitivas sobre las 20 categorías de objetos presentes en el conjunto de entrenamiento, con la salvedad de que no se han publicado tasas de éxito.
- Generación de datos para entrenamiento posterior: ejecutar la política en *rollout* y registrar episodios, que pueden reutilizarse para *fine-tunes* adicionales o para aprendizaje por refuerzo basado en datos reales.
- Banco de pruebas de *hardware* robótico: al requerir un robot Panda y tres cámaras sincronizadas, sirve para validar la *pipeline* de adquisición, calibración y control antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la indicación explícita de que no se han proporcionado resultados para esta política, ni tasas de éxito por tarea ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, unos 8,3 GB solo para pesos (4,14 mil millones de parámetros); con activaciones de tres imágenes de 224×224 y memoria de trabajo, una estimación práctica razonable es de 12 a 16 GB. En fp32 serían unos 16,6 GB de pesos. Estas cifras son estimaciones a partir del recuento de parámetros, no medidas publicadas por el autor.
- GPU recomendadas: RTX 4090 (24 GB) o superiores para inferencia en bf16; A100, H100 o L40S para entrenamiento y para *rollouts* paralelos o recolección de datos a mayor escala.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con 16 GB o más de VRAM en bf16; en tarjetas de 8-12 GB no se puede confirmar sin versiones cuantizadas, que no se publican en este repositorio.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para *fine-tune*), con PyTorch y CUDA. Los servidores de inferencia de texto (vLLM, TGI, Ollama, llama.cpp) no son aplicables, ya que no es un modelo de lenguaje autorregresivo ni se distribuye en GGUF.
- Latencia y rendimiento: no disponibles. El conjunto de entrenamiento se grabó a 20 FPS, lo que da una referencia de la frecuencia de control del sistema de recogida de datos, pero no de la velocidad de inferencia de la política.
- Requisitos de robot: robot Panda con puerto serie accesible y tres cámaras OpenCV configuradas con los mismos nombres de observación con los que se entrenó (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`); cualquier cambio de nombre o de calibración invalida la política.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (`sam-guided-vlas/...pi05__seed_0__steps_1k`) | VLA π₀.₅ ajustado | 4.143.404.816 | Apache 2.0 | Hugging Face, vía LeRobot |
| `lerobot/pi05_base` | VLA π₀.₅ base | No disponible | No disponible en la información consultada | Hugging Face, vía LeRobot |
| `lerobot/pi0_base` | VLA π₀ | No disponible | No disponible en la información consultada | Hugging Face, vía LeRobot |
| OpenVLA | VLA de propósito general | No disponible en la información consultada | No disponible en la información consultada | Repositorio público |

Los datos de rendimiento de los modelos comparados no se han verificado en esta búsqueda; la comparación se limita, por tanto, a tipo de modelo, licencia declarada y disponibilidad. No se dispone de cifras de precisión en tareas que permitan ordenar estos modelos por rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable en ninguna tarea.
- Entrenamiento muy corto: 1.000 pasos con lote 16 sobre 30.830 fotogramas es un ajuste mínimo; es probable que el modelo esté infraentrenado respecto a su modelo base.
- Acoplamiento estricto al *hardware*: entrenado para un robot Panda con tres cámaras concretas y un estado de 9 dimensiones; cambiar el robot, el número de cámaras, la resolución o los nombres de las observaciones rompe la compatibilidad.
- Dominio limitado: el conjunto de datos cubre 20 tareas de manipulación de objetos cotidianos; no hay evidencia de generalización fuera de ese repertorio.
- Mezcla de simulación y datos reales: la nomenclatura del repositorio sugiere entrenamiento con datos simulados y reales, lo que puede introducir una brecha de dominio (*sim-to-real gap*) no cuantificada.
- Riesgo físico: es una política de control de un robot real; una acción errónea puede provocar daños materiales o personales. Requiere supervisión, límites de par y paradas de emergencia.
- Alucinación en el sentido de lenguaje natural: no aplica de forma directa, pero sí existe el riesgo equivalente de generar trayectorias de acción no plausibles ante entradas fuera de distribución.
- Idiomas: no se documenta el soporte multilingüe de la instrucción de tarea; los ejemplos publicados están en inglés.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de copyright y se cite la fuente; conviene verificar la licencia del modelo base `lerobot/pi05_base` y de los pesos originales de π₀.₅ antes de un despliegue comercial.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en *hardware* de gama baja.
- Repositorio sin tracción: 0 descargas y 0 *likes*, sin issues ni discusión de la comunidad que permitan contrastar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_1k
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Entrada de blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de inferencia y *rollout* de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la búsqueda web: los resultados devueltos por el buscador (la serie de televisión francesa «Sam», el portal de contratación SAM.gov, la web de SAM Outillage y el máster SAM de la Université Paris-Saclay) no guardan relación con este modelo y no se han incluido como enlaces relevantes.
