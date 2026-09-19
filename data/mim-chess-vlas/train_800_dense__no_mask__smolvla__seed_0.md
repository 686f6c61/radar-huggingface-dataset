# mim-chess-vlas/train_800_dense__no_mask__smolvla__seed_0

## Resumen

`mim-chess-vlas/train_800_dense__no_mask__smolvla__seed_0` es un ajuste fino de SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto publicado por el ecosistema LeRobot de Hugging Face y descrito en el paper arXiv:2506.01844. Se trata de una política de robótica de aproximadamente 450 millones de parámetros (450.046.176 según los pesos en safetensors) que mapea observaciones multimodales de un brazo Franka Panda a comandos de acción de 7 dimensiones. El modelo parte de `lerobot/smolvla_base` y se ha especializado en una única familia de tareas de recogida y colocación.

El problema que resuelve es el control robótico end-to-end mediante aprendizaje por imitación: dada una instrucción de tarea en lenguaje natural, el estado de las articulaciones y tres vistas de cámara, la política genera la acción motora a ejecutar. Su relevancia radica en que SmolVLA está diseñado para rendir de forma competitiva con un coste computacional reducido y poder desplegarse en hardware de consumo, lo que rebaja la barrera de entrada frente a VLA de miles de millones de parámetros como OpenVLA o π0.

Este checkpoint concreto se ha entrenado sobre el dataset `mim-chess-vlas/train_800_dense__no_mask` (776 episodios, 207.203 fotogramas a 20 FPS) con 40 variantes de tareas de tipo "coge el objeto y ponlo en la caja". Es, por tanto, un artefacto de investigación reproducible (semilla 0, 60.000 pasos) más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) compacta tipo SmolVLA: backbone de visión-lenguaje más experto de acciones |
| Parámetros totales | 450.046.176 (≈450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`model.safetensors`, biblioteca `lerobot`) |
| Modelo base | `lerobot/smolvla_base` |
| Tipo de robot | Franka Panda |
| Cámaras | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entradas | `observation.state` (9,), tres imágenes (3, 224, 224) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | `mim-chess-vlas/train_800_dense__no_mask` (776 episodios, 207.203 fotogramas, 20 FPS) |
| Pasos de entrenamiento | 60.000 |
| Tamaño de lote | 16 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,0002 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.0 |
| Tamaño del repositorio | 9,6 GB |

## Arquitectura y entrenamiento

SmolVLA es una política VLA que combina un backbone de visión-lenguaje con un experto de acciones ligero, según la descripción del paper referenciado (arXiv:2506.01844). La entrada se compone de tres flujos RGB de 224×224 píxeles más un vector de estado propioceptivo de 9 dimensiones, y la salida es un vector de acción continuo de 7 dimensiones, correspondiente a los grados de libertad del Panda. La model card no desglosa la composición interna del backbone ni el número de tokens de contexto, por lo que esos datos se consideran no disponibles para este checkpoint.

El entrenamiento de este artefacto es un ajuste fino supervisado por imitación sobre `lerobot/smolvla_base`, ejecutado con LeRobot 0.6.0 durante 60.000 pasos, con lote de 16, optimizador AdamW y tasa de aprendizaje 2e-4, con semilla 0. No se documenta en la información disponible ningún uso de RLHF, DPO ni aprendizaje por refuerzo; tampoco se detalla la composición completa del corpus de preentrenamiento del modelo base ni el número de tokens. El dataset de ajuste contiene 776 episodios y 207.203 fotogramas grabados a 20 FPS, con 40 variantes de la tarea "Pick the X and place it into the box" (alimentos, utensilios, menaje y otros objetos).

## Capacidades

- Control robótico de manipulación end-to-end: genera directamente un vector de acción de 7 dimensiones a partir de observaciones sensoriales, sin planificador externo.
- Tareas de recogida y colocación sobre 40 categorías de objeto distintas (jam, cereal, pera, cuchillo, hervidor, cesta, etc.).
- Percepción multimodal: integra tres cámaras RGB (vista de agente y dos cámaras en la mano) con la propiocepción del robot.
- Condicionamiento por instrucción de tarea en lenguaje natural, mediante la cadena `--task` que se pasa a la política en tiempo de ejecución.
- Ejecución en hardware de consumo: según la model card, SmolVLA puede desplegarse en equipos de gama de consumo con coste computacional reducido.
- Especialización en un único embodiment (Franka Panda) y una única familia de tareas.
- No soporta tool calling ni function calling: no es un modelo de lenguaje con interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso de tipo cadena de pensamiento.
- No genera texto libre ni mantiene conversación.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como política de referencia para estudiar cómo un VLA de 450 M de parámetros se comporta en tareas de pick-and-place, con una configuración de entrenamiento completamente documentada (pasos, lote, tasa de aprendizaje y semilla) que permite reproducir el experimento.
- Punto de partida para ajustes finos: al derivar de `smolvla_base` con licencia Apache-2.0, un equipo puede reentrenarlo con su propio dataset de recogida y colocación y reutilizar el pipeline de LeRobot sin partir de cero.
- Evaluación de generalización entre objetos: las 40 variantes de instrucción permiten medir si la política generaliza a nuevos objetos manteniendo el mismo esquema de cámara y robot, algo útil para estudiar sobreajuste visual.
- Comparación de pipelines de datos: al existir checkpoints hermanos con variantes de dataset (por ejemplo, configuraciones "dense" frente a otras), este modelo sirve como elemento de control en experimentos sobre preprocesado y enmascarado de datos.
- Demostraciones y docencia en robótica: con `lerobot-rollout` y un Panda calibrado se puede ejecutar la política en vivo para ilustrar aprendizaje por imitación en cursos o laboratorios.
- Validación de infraestructura de despliegue: permite probar cadenas de inferencia a 20 Hz (la frecuencia del dataset) sobre GPU de consumo, verificando latencias y estabilidad del bucle de control antes de escalar a modelos mayores.
- Banco de pruebas para simulación o gemelo digital: la política acepta exactamente tres imágenes RGB más estado de 9 dimensiones, una interfaz que encaja con entornos de simulación robótica siempre que se respete el esquema de observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este checkpoint no incluye tabla de tasas de éxito, ni comparaciones con otras políticas, ni métricas de simulación o de robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,8 GB solo para los pesos en FP32 y unos 0,9 GB en BF16/FP16; sumando activaciones y los tres flujos de imagen de 224×224, una horquilla razonable es de 2 a 4 GB, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM. Una RTX 3060, RTX 4060 o superior es suficiente; una RTX 4090, A100 o H100 aportarían margen de sobra y mayor velocidad de bucle.
- Cabe en GPU de consumo: sí, según la propia model card, que destaca el despliegue en hardware de gama de consumo como uno de los objetivos de diseño de SmolVLA.
- Opciones de despliegue: `lerobot-rollout` para ejecución sobre robot y `lerobot-train` para reentrenamiento, dentro del ecosistema LeRobot. No aplican servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama, porque el modelo no produce texto.
- Latencia y throughput: no disponibles como cifra medida. La referencia indirecta es la frecuencia del dataset de entrenamiento, 20 FPS, lo que implica un bucle de control a 20 Hz si se ejecuta en tiempo real.
- Almacenamiento: el repositorio ocupa 9,6 GB, por lo que conviene prever espacio suficiente para el checkpoint y sus artefactos asociados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Este checkpoint (SmolVLA ajustado) | ≈450 M | No disponible | Apache-2.0 | Hugging Face Hub, vía LeRobot | No disponible |
| `lerobot/smolvla_base` | ≈450 M | No disponible | Apache-2.0 | Hugging Face Hub, vía LeRobot | No disponible |
| OpenVLA | ≈7 B | No disponible | Licencia comunitaria de Llama 2 | Hugging Face Hub | No disponible |
| π0 (openpi) | ≈3,3 B | No disponible | Apache-2.0 en el repositorio openpi | GitHub y Hugging Face | No disponible |

La comparación relevante es de escala y coste: este checkpoint es aproximadamente 15 veces más pequeño que OpenVLA y unas 7 veces más pequeño que π0, lo que se traduce en requisitos de VRAM muy inferiores y en la posibilidad de ejecutarlo en una GPU de consumo. No se dispone de datos de tasa de éxito que permitan comparar el rendimiento real frente a esas alternativas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una sola familia de tareas ("coge el objeto y ponlo en la caja") sobre un único robot Franka Panda; no es un modelo generalista ni transferible sin ajuste.
- Dependencia del montaje físico: las cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2` deben colocarse de forma coherente con el dataset de entrenamiento; cambios de posición, iluminación o calibración degradarán el comportamiento.
- Riesgo de sobreajuste al conjunto de objetos del dataset: aunque hay 40 categorías, no hay evidencia publicada de generalización a objetos no vistos.
- Riesgo de alucinación en el sentido de acciones erráticas o inseguras: al ser una política generativa de acciones, puede producir trayectorias no previstas ante entradas fuera de distribución. Requiere supervisión y parada de emergencia en cualquier uso físico.
- Idiomas: la información disponible no documenta soporte multilingüe; las instrucciones del dataset están en inglés y el modelo no genera texto.
- Longitud de contexto y esquemas de cuantización no documentados, lo que limita la planificación de despliegues con requisitos estrictos de memoria o ventanas de observación largas.
- Licencia Apache-2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se atribuya correctamente; no impone restricciones de campo de uso, pero tampoco exime de responsabilidad sobre el comportamiento del robot.
- Madurez del artefacto: cero descargas y cero "likes" en el momento de redactar esta ficha, sin métricas publicadas; debe tratarse como un checkpoint de investigación, no como un componente validado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_dense__no_mask__smolvla__seed_0
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__no_mask
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__no_mask
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
