# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_5k

## Resumen

Este repositorio contiene un *policy* de robótica basado en π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado a la librería LeRobot de Hugging Face. Se trata concretamente de un *fine-tune* del checkpoint base `lerobot/pi05_base`, entrenado por el usuario `sam-guided-vlas` sobre un dataset propio de manipulación con un robot Panda. El objetivo de π₀.₅ es la generalización a entornos y situaciones no vistos durante el entrenamiento, partiendo de la evolución del modelo π₀ original.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) según los pesos en safetensors, y el repositorio ocupa 9,4 GB. Consume como entrada el estado del robot (vector de 9 dimensiones) y tres cámaras RGB de 224x224 píxeles (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`), y produce un vector de acción de 7 dimensiones. Es, por tanto, un modelo de política de imitación cerrado sobre una configuración hardware concreta, no un modelo de propósito general.

El entrenamiento se realizó con LeRobot 0.6.0 durante 5000 pasos, con batch de 16, optimizador AdamW y tasa de aprendizaje 5e-05, sobre un dataset de 200 episodios y 69.392 fotogramas grabados a 20 FPS. La relevancia de esta ficha es acotada: sirve como referencia de un *fine-tune* reproducible de π₀.₅ sobre tareas de recogida y apilado de objetos de cocina, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); detalles internos (backbone, mecanismo de accion) no disponibles en la informacion proporcionada |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica, no de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni int8/int4) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Modelo base | `lerobot/pi05_base` (fine-tune) |
| Tamano del repositorio | 9,4 GB |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 224, 224), `observation.images.robot0_eye_in_hand` (3, 224, 224), `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salida | `action` (7,) |
| Tipo de robot | Panda |
| Frecuencia de control del dataset | 20 FPS |

## Arquitectura y entrenamiento

La model card describe π₀.₅ como un modelo de visión-lenguaje-acción de Physical Intelligence disenado para generalización en mundo abierto, que evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos. La implementación disponible en este repositorio es la adaptación a LeRobot del repositorio OpenPI de los autores. Sin embargo, la informacion proporcionada no detalla la arquitectura interna (tipo de backbone visual-lenguaje, mecanismo de generación de acciones, uso de flow matching u otras técnicas), por lo que esos extremos se marcan como no disponibles. Tampoco se documentan innovaciones concretas como decodificación especulativa o atención lineal.

En cuanto al entrenamiento, se trata de un *fine-tune* supervisado de imitación (behavior cloning) sobre `lerobot/pi05_base`. La configuración reportada es: 5000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.0. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineación por preferencias. El dataset de entrenamiento (`sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live`) contiene 200 episodios, 69.392 fotogramas a 20 FPS y cubre tareas de manipulación de objetos de cocina: basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato y scone. El identificador del dataset incluye los tokens `sim` y `live`, cuyo significado exacto no se aclara en la model card.

## Capacidades

- Generación de acciones de control motor de 7 grados de libertad a partir de observaciones multimodales (tres cámaras RGB más estado propioceptivo de 9 dimensiones).
- Manipulación robótica de objetos de cocina y alimentación: recogida, agarre y colocación de los 20 tipos de objeto listados en el dataset.
- Ejecución de la tarea de apilado, sugerida por el token `pile` del identificador del dataset (el alcance exacto no se detalla en la model card).
- Política de imitación entrenada para el robot Panda con una configuración de cámaras concreta (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`).
- Inferencia en bucle cerrado mediante `lerobot-rollout` con estrategia `base`, con ejecución indefinida si no se especifica duración.
- Razonamiento multi-paso: no disponible.
- Tool calling / function calling: no disponible (no aplica a un modelo de política robótica).
- Capacidades de agente: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión general, audio): solo percepción visual integrada en el bucle de control; no se documentan otras capacidades.

## Casos de uso

- Recogida y colocación de objetos de cocina en un robot Panda: el modelo genera directamente el vector de acción de 7 dimensiones a partir de las tres vistas de cámara, por lo que puede integrarse en una celda de manipulación que necesite trasladar objetos como latas, frutas o envases entre posiciones.
- Apilado de objetos (*pile*) en entornos de laboratorio: la política está entrenada sobre un dataset cuyo identificador alude explícitamente al apilado, lo que la hace adecuada para tareas de construcción de pilas estables con realimentación visual en bucle cerrado.
- Investigación en imitación robótica: sirve como punto de partida reproducible (semilla 0, 5000 pasos, hiperparámetros documentados) para estudiar el efecto de la cantidad de datos y del número de pasos en el rendimiento de un *fine-tune* de π₀.₅.
- Replicación de experimentos de VLA guiados por segmentación: el prefijo `sam-guided-vlas` del autor sugiere una línea de trabajo con máscaras o anotaciones tipo SAM; el modelo permite comparar políticas entrenadas con y sin ese preprocesado visual.
- Evaluación comparativa de *checkpoints*: al ser un *fine-tune* corto (5000 pasos) sobre `lerobot/pi05_base`, resulta útil como referencia de línea base frente a entrenamientos más largos o con más episodios.
- Despliegue en demostraciones con hardware real: con `lerobot-rollout` y el robot Panda configurado, se puede ejecutar la política durante una duración fija para demostraciones en vivo de manipulación de alimentos y utensilios.
- Generación de datos sintéticos de evaluación: la política puede usarse para producir trayectorias de referencia en simuladores con la misma configuración de cámaras y estado, siempre que la observación respete las claves y formas exactas definidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que todavía no se han proporcionado resultados de evaluación para esta política (*"No evaluation results have been provided for this policy yet"*). No se dispone de tasas de éxito por tarea, comparativas con otros *checkpoints* ni métricas de simulación o de robot real.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en bf16/fp16: aproximadamente 8,3 GB solo para los pesos (4,14 mil millones de parámetros), más el coste de las tres torres de visión a 224x224 y las activaciones; en la práctica se estima un rango de 12 a 16 GB con batch 1.
- VRAM estimada con pesos en fp32: aproximadamente 16,6 GB solo para los pesos, con un rango práctico estimado de 20 a 24 GB.
- GPU profesionales recomendadas: A100 (40 o 80 GB), H100, L40S o RTX 6000 Ada; no son estrictamente necesarias para inferencia, pero sí convenientes para el reentrenamiento.
- GPUs de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16 con margen. En tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) el despliegue en bf16 queda al límite. En GPUs de 8 a 12 GB no es viable sin cuantización, y no se publican pesos cuantizados.
- No se documenta soporte para CPU ni para aceleradores tipo Jetson en la informacion proporcionada.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecución de la política en el robot, y `lerobot-train` con `--policy.path=lerobot/pi05_base` para reentrenar. Los ficheros se distribuyen en safetensors para la librería LeRobot 0.6.0.
- Runtimes de LLM de texto (vLLM, TGI, llama.cpp, Ollama) no están documentados para este modelo y no son directamente aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponibles. Como referencia, el dataset de entrenamiento se grabó a 20 FPS, lo que sitúa el orden de magnitud esperado del bucle de control en torno a esa frecuencia, pero no se aportan mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...__pi05__seed_0__steps_5k`) | 4,14 mil millones | 3 camaras 224x224 + estado (9,) | Manipulacion Panda, 20 tareas de cocina | apache-2.0 | Hugging Face, libreria LeRobot |
| `lerobot/pi05_base` | no disponible en la informacion proporcionada | Configuracion generalista de π₀.₅ | Politica base previa al *fine-tune* | apache-2.0 | Hugging Face |
| Otros VLA open source de la misma categoria (por ejemplo OpenVLA, GR00T N1) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos verificables de parámetros, contexto o rendimiento de alternativas como OpenVLA o GR00T N1, por lo que no se establece una comparación numérica. La única comparación directa posible es contra el checkpoint base `lerobot/pi05_base`, del que este repositorio es un *fine-tune* de 5000 pasos.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card indica que no se han aportado resultados de éxito en robot real ni en simulación, por lo que no hay evidencia publicada de que la política funcione de forma fiable.
- Especialización estrecha: el entrenamiento se limita a 200 episodios y 69.392 fotogramas sobre un robot Panda concreto y una lista cerrada de 20 tareas de cocina; se espera un rendimiento pobre fuera de esa distribución de objetos, iluminación y posiciones.
- Dependencia estricta del hardware: las claves de observación y las formas deben coincidir exactamente (`observation.state` de 9 elementos, tres cámaras de 3x224x224). Cualquier cambio en nombres de cámara, resolución o número de cámaras invalida la política.
- Sesgos de datos: al provenir de un dataset reducido y de un único operador o protocolo de recogida, la política puede heredar sesgos de trayectoria, de posicionamiento inicial y de estilo de agarre. No hay análisis de sesgos publicado.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede producir trayectorias plausibles pero erróneas ante objetos o disposiciones no vistas, sin mecanismo de verificación explícito.
- Idiomas y contexto textual: no disponible. No se documenta el comportamiento ante instrucciones en lenguaje natural más allá del parámetro `--task` del script de rollout.
- Ambigüedad sobre el origen de los datos: el identificador del dataset contiene los tokens `sim` y `live`, pero la model card no aclara si el entrenamiento combina simulación y robot real ni en qué proporción, lo que dificulta estimar la transferencia a hardware físico.
- Licencia: apache-2.0 permite uso comercial y modificación, pero al derivar de `lerobot/pi05_base` conviene verificar también las condiciones de los pesos base y de los datos de entrenamiento de origen, no detalladas aquí.
- Adopción nula en el momento de la consulta: 0 descargas y 0 *me gusta*, sin issues ni validación comunitaria, lo que aumenta el riesgo de errores no detectados en el *checkpoint*.
- Repositorio de 9,4 GB: el almacenamiento y la transferencia del *checkpoint* completo son costosos, y no se ofrecen variantes cuantizadas ni versiones reducidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_5k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces encontrados correspondían a una serie de televisión, al portal de contratación SAM.gov y a un fabricante de herramientas, por lo que se han descartado por no ser relevantes.
