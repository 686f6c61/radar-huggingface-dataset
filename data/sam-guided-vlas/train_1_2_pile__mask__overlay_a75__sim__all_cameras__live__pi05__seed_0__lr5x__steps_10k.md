# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_10k

## Resumen

Este modelo es un ajuste fino de política robótica (policy) construido sobre π₀.₅ (Pi05), el modelo Vision-Language-Action (VLA) de Physical Intelligence orientado a generalización en entornos abiertos. El repositorio lo publica el usuario `sam-guided-vlas` y se ha entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, con la implementación adaptada del repositorio OpenPI de Physical Intelligence.

Se trata de un checkpoint concreto (seed 0, learning rate 5x, 10.000 pasos) especializado en tareas de manipulación de objetos tipo supermercado sobre un robot Panda, con tres cámaras de entrada (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). El modelo consume estado propioceptivo de 9 dimensiones, tres imágenes RGB de 224x224 y produce un vector de acción de 7 dimensiones, que corresponde a un espacio de control de brazo robótico con pinza.

Con aproximadamente 4.140 millones de parámetros y licencia Apache 2.0, es relevante como ejemplo reproducible de ajuste de π₀.₅ sobre un dataset pequeño y acotado (200 episodios, 69.392 frames a 20 FPS). No tiene descargas ni valoraciones en el momento de redactar esta ficha, y no se han publicado resultados de evaluación, por lo que debe considerarse un artefacto experimental de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones, dato real de safetensors) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card (los pesos se distribuyen en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | No disponible (modelo visión-lenguaje-acción; no se declara soporte de lenguaje natural multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | Panda |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 224, 224), `observation.images.robot0_eye_in_hand` (3, 224, 224), `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Tamaño del repositorio | 9,4 GB |
| Versión de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

El modelo es un VLA de la familia π₀.₅, diseñado por Physical Intelligence para generalizar a entornos y situaciones no vistas durante el entrenamiento. La model card indica explícitamente que se trata de una evolución de π₀ y que la implementación de LeRobot está adaptada del repositorio OpenPI del propio laboratorio. El modelo combina observaciones visuales (tres imágenes de 224x224 provenientes de una cámara externa y dos cámaras en la muñeca) con el estado propioceptivo del robot (9 dimensiones) para emitir acciones de control continuo (7 dimensiones). No se detallan en la información proporcionada el número de capas, la dimensión oculta, el mecanismo de atención ni el método de decodificación de acciones (por ejemplo, flow matching o difusión), por lo que esos aspectos quedan como "no disponible".

El entrenamiento se realizó con el pipeline de LeRobot sobre el dataset `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live`, compuesto por 200 episodios y 69.392 frames grabados a 20 FPS. Las tareas cubiertas son 20 categorías de objetos y recipientes propios de un entorno de cocina o supermercado: basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato y scone. La configuración de entrenamiento registrada es de 10.000 pasos, batch size 16, optimizador AdamW, learning rate 0,00025, semilla 0 y LeRobot 0.6.0. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO, algo por otro lado poco habitual en políticas de imitación robótica. El nombre del dataset incluye los marcadores `mask`, `overlay_a75`, `sim` y `live`, lo que sugiere supervisión con máscaras y superposición, pero la model card no desarrolla esa metodología.

## Capacidades

- Generación de acciones de control robótico de 7 dimensiones (brazo más pinza) a partir de observaciones multimodales, en régimen de política de imitación.
- Percepción visual multi-cámara: procesa simultáneamente una vista de agente y dos vistas de muñeca (`eye_in_hand`), lo que facilita la manipulación fina de objetos.
- Fusión de visión y propiocepción: integra el estado del robot (9 dimensiones) con las imágenes para condicionar la acción.
- Manipulación de objetos de cocina y supermercado: las 20 categorías del dataset indican capacidad para agarrar, mover y colocar objetos como latas, frutas, verduras, botellas y utensilios.
- Especialización por tarea mediante el parámetro `--task` en el rollout de LeRobot, lo que permite dirigir el comportamiento hacia una tarea concreta del conjunto entrenado.
- Capacidad de ajuste fino adicional: al ser un checkpoint LeRobot sobre `lerobot/pi05_base`, puede reentrenarse con nuevos datasets siguiendo el mismo pipeline.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible (el modelo emite acciones, no texto).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles; la visión está restringida al formato de observación de la política.

## Casos de uso

- Manipulación de objetos de supermercado en robot Panda: el modelo está entrenado exactamente para 20 categorías de producto (latas, frutas, verduras, botellas, utensilios), de modo que puede ejecutarse con `lerobot-rollout` indicando `--task="basket"` o cualquiera de las otras tareas para reproducir el comportamiento aprendido.
- Recogida y colocación (pick-and-place) con percepción multi-cámara: la combinación de cámara externa y dos cámaras de muñeca permite abordar agarres finos donde la vista cenital no es suficiente, por ejemplo al sujetar un cuchillo o una botella de spray.
- Reproducción de experimentos y estudios de ablación: al ser un checkpoint con semilla 0, learning rate 5x y 10.000 pasos sobre un dataset concreto, sirve como punto de referencia reproducible para comparar variaciones de hiperparámetros o de composición de datos.
- Automatización de líneas de empaquetado o clasificación de productos: el modelo puede integrarse en una celda robotizada que recoja productos heterogéneos de una cinta y los deposite en contenedores, siempre que la configuración de cámaras y el robot coincidan con los del entrenamiento.
- Investigación en VLA guiados por máscaras: el nombre del dataset (`mask`, `overlay_a75`) y de la organización (`sam-guided-vlas`) apuntan a un pipeline de supervisión visual con máscaras; el modelo puede usarse como baseline en estudios sobre cómo afecta esa señal al rendimiento de la política.
- Base para ajuste fino en tareas nuevas: partiendo de este checkpoint o de `lerobot/pi05_base`, un equipo puede entrenar con `lerobot-train` sobre su propio dataset de demostraciones y evaluar la transferencia a objetos o posiciones no vistos.
- Evaluación de infraestructura de inferencia robótica: sirve para medir latencia de política, throughput de rollout y compatibilidad con distintos backends dentro del ecosistema LeRobot antes de invertir en datos propios.
- Demostraciones y docencia en robótica con aprendizaje por imitación: el flujo completo (dataset público, script de rollout, guías oficiales) lo hace útil para cursos o talleres sobre VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la frase "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito reportadas para las tareas del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4.143.404.816 parámetros): aproximadamente 16,6 GB en fp32, 8,3 GB en bf16/fp16, 4,1 GB en int8 y 2,1 GB en int4, sin contar el overhead de activaciones, buffers de imagen y el runtime de PyTorch.
- GPU recomendadas: para entrenamiento o inferencia en bf16 con margen, una NVIDIA A100 40/80 GB, H100 o L40S. Para inferencia en fp16, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberían ser suficientes en cuanto a pesos, aunque el rendimiento dependerá del preprocesado de las tres cámaras.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 16-24 GB si se usa bf16/fp16 o cuantización; en 8 GB solo con cuantizaciones agresivas y probablemente con recortes de resolución o de número de cámaras.
- Opciones de despliegue: el soporte documentado es LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para entrenamiento), con PyTorch y CUDA. No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama, que además están orientadas a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: no disponibles. En robótica de manipulación se suele operar en el rango de 10-30 Hz de frecuencia de control, y el dataset se grabó a 20 FPS, pero no hay mediciones publicadas para este checkpoint.
- Almacenamiento: el repositorio ocupa 9,4 GB, lo que incluye los pesos en safetensors y posibles artefactos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`sam-guided-vlas/...steps_10k`) | 4,14 B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino sobre un dataset de 200 episodios y 20 tareas |
| `lerobot/pi05_base` | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Hugging Face | Modelo base π₀.₅ del que parte este ajuste, orientado a generalización |
| π₀ (Pi0) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Repositorio OpenPI | Predecesor de π₀.₅ según la model card |

No se dispone de datos cuantitativos (tasas de éxito, benchmarks de manipulación, latencias) para comparar este checkpoint con alternativas como OpenVLA u otras políticas VLA, por lo que la comparativa se limita a lo anteriormente indicado.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara explícitamente que no se han proporcionado resultados de evaluación, por lo que no hay evidencia publicada de la tasa de éxito en ninguna de las 20 tareas.
- Dataset muy pequeño: 200 episodios y 69.392 frames a 20 FPS, lo que limita la diversidad de posiciones, iluminación y configuraciones de objetos vistas durante el entrenamiento.
- Fuerte acoplamiento al hardware: el modelo espera un robot Panda, tres cámaras con nombres concretos (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un estado de 9 dimensiones; usar otro robot o cambiar la disposición de cámaras invalida la política.
- Riesgo de sobreajuste al entorno: al no documentarse la composición exacta del dataset ni existir evaluación, es probable que el comportamiento se degrade ante objetos, posiciones o condiciones de iluminación no representadas.
- Posible origen simulado de los datos: el nombre del dataset incluye el marcador `sim` junto a `live`, pero la model card no aclara la proporción ni la procedencia, lo que dificulta juzgar la transferencia a robot real.
- Idiomas: no se declara soporte de lenguaje natural; el condicionamiento por tarea se realiza mediante etiquetas de tarea, no mediante instrucciones libres en varios idiomas.
- Contexto: no se especifica ninguna ventana de contexto ni memoria temporal más allá del estado actual; es una política reactiva de paso a paso, no un sistema con planificación a largo plazo.
- Sesgos: no disponibles; no hay análisis de sesgos de comportamiento ni de sesgos en la distribución de objetos del dataset.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al derivar de `lerobot/pi05_base` conviene verificar las condiciones del modelo base y las de los datos de entrenamiento antes de un despliegue comercial.
- Madurez: 0 descargas y 0 valoraciones en el momento de redactar la ficha, lo que indica que no ha pasado por validación de la comunidad.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces encontrados corresponden a una serie de televisión francesa, a una marca de herramientas y a páginas sin relación con el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relación con el repositorio.
