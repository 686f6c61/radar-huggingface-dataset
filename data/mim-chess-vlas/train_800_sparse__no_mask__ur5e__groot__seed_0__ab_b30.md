# mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__ab_b30

## Resumen

El modelo `mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__ab_b30` es una política de robótica entrenada mediante aprendizaje por imitación con la librería LeRobot de Hugging Face. Se trata de una instancia concreta del modelo fundacional GR00T N1.7 de NVIDIA, adaptada a una tarea específica de manipulación robótica: recoger hasta cuarenta tipos distintos de objetos (alimentos, utensilios, menaje) y depositarlos en una caja. El modelo consume observaciones multimodales (tres cámaras y el estado de las articulaciones) y produce comandos de acción de siete dimensiones para un robot compuesto por un brazo Panda y un UR5e.

Con 3.144.016.000 parámetros y un repositorio de 50,3 GB, la política se apoya en el backbone Cosmos-Reason2/Qwen3-VL de NVIDIA para el razonamiento viso-lingüístico y en un transformer de acciones con flow matching para predecir trayectorias. La licencia Apache 2.0 y el formato safetensors lo hacen desplegable en entornos de investigación y producción sin restricciones comerciales significativas.

Su relevancia radica en que ejemplifica el flujo actual de adaptación de modelos fundacionales de robótica a tareas concretas mediante fine-tuning con datos de teleoperación, un patrón cada vez más habitual para llevar la robótica generalista a células de trabajo reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | Panda + UR5e |
| Cámaras de entrada | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Dimensión del estado | (9,) |
| Dimensión de la acción | (7,) |
| Resolución de imagen | 224 x 224 |
| Librería | LeRobot 0.6.0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment para razonamiento y habilidades de robots humanoides. Combina un backbone viso-lingüístico Cosmos-Reason2/Qwen3-VL, que procesa las imágenes de las tres cámaras junto con la instrucción en lenguaje natural, con un transformer de acciones basado en flow matching que genera las trayectorias de acción condicionadas por visión, lenguaje y propiocepción. El estado del robot se codifica como un vector de 9 dimensiones y la salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó por imitación supervisada sobre el dataset `lets-merged/mim-chess-vlas-train_800_sparse__no_mask_mim-chess-vlas-train_800_sparse__no_mask__ur5e`, compuesto por 1526 episodios y 377.262 fotogramas a 20 FPS. La configuración reportada incluye 60.000 pasos de entrenamiento, batch size de 16, optimizador AdamW, learning rate de 7e-05 y semilla 0. No se especifica en la información disponible si hubo fases de RLHF, DPO ni el número total de tokens de entrenamiento del backbone.

## Capacidades

- Manipulación robótica de pick-and-place: recoger y depositar en una caja hasta cuarenta categorías de objetos distintos (jamón, cereal, pera, boniato, scone, hamburguesa, limón, calabaza, queso, huevo, manzana, pan, etc.).
- Percepción multimodal: procesa simultáneamente tres vistas de cámara (vista del agente y dos cámaras en la muñeca del robot) a 224x224 píxeles.
- Condicionamiento por lenguaje natural: las instrucciones del tipo "Pick the X and place it into the box" guían la política hacia el objeto objetivo.
- Control de robot de doble brazo heterogéneo: salida de acciones de 7 dimensiones compatible con la configuración Panda + UR5e.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas CLI de LeRobot 0.6.0.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito, ya que se trata de una política robótica y no de un modelo de lenguaje conversacional.

## Casos de uso

- Clasificación y recogida automatizada en líneas de envasado: el modelo puede identificar y manipular hasta cuarenta tipos de objetos distintos y colocarlos en una caja, lo que lo hace adecuado para tareas de picking en almacenes con inventario heterogéneo.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible (semilla 0, configuración documentada) para estudiar la transferencia de modelos fundacionales GR00T a tareas concretas con datasets de teleoperación.
- Prototipado de células robóticas de doble brazo: la configuración Panda + UR5e con tres cámaras permite validar pipelines de percepción-acción en entornos de laboratorio antes de escalar a robots humanoides.
- Benchmarking de políticas viso-motoras: al estar entrenado sobre un dataset público concreto, puede emplearse como referencia comparativa frente a otras políticas entrenadas con los mismos datos.
- Automatización de tareas de cocina y manipulación de alimentos: las categorías de objetos del dataset (frutas, verduras, productos envasados, utensilios) cubren escenarios típicos de preparación de alimentos.
- Docencia y formación en robótica: el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) permite a estudiantes reproducir el entrenamiento y el despliegue de una política real con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144 millones de parámetros, una estimación en FP16 rondaría los 6,3 GB solo para pesos, pero el backbone viso-lingüístico y el transformer de acciones añaden memoria adicional no cuantificada en la información disponible.
- GPU recomendadas: no disponible. Por el tamaño del modelo y el uso de tres cámaras a 224x224, se requiere una GPU con al menos 16 GB de VRAM para FP16, aunque este dato no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del repositorio (50,3 GB) sugiere que el checkpoint completo no cabe en GPUs de consumo sin cuantización o sin descargar solo los pesos necesarios.
- Opciones de despliegue: LeRobot 0.6.0 mediante el comando `lerobot-rollout` con `--policy.path` apuntando al repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas de este tipo.
- Latencia y throughput: no disponibles. La frecuencia de entrenamiento es de 20 FPS, pero no se especifica la latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables de la misma categoría (políticas robóticas basadas en GR00T o modelos fundacionales de robótica con fine-tuning específico) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada exclusivamente para la tarea de recoger objetos y depositarlos en una caja; no se espera que generalice a otras tareas de manipulación sin reentrenamiento.
- Dependencia del entorno de entrenamiento: el rendimiento puede degradarse fuera de las condiciones de iluminación, disposición de objetos y configuración de cámaras del dataset original.
- Sesgos del dataset: las cuarenta categorías de objetos del dataset determinan el vocabulario visual y lingüístico del modelo; objetos no representados no serán reconocidos de forma fiable.
- Riesgo de alucinación motora: como toda política de imitación, puede generar trayectorias erráticas o colisiones en estados de observación fuera de distribución.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni mantenimiento.
- Idiomas: no se dispone de información sobre el soporte multilingüe de las instrucciones; el dataset solo contiene instrucciones en inglés.
- Reproducibilidad: aunque se documentan semilla, hiperparámetros y versión de LeRobot, no se especifica la versión exacta del backbone GR00T ni los pesos base utilizados, lo que puede dificultar la reproducción exacta.
- Advertencia de producción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad; debe evaluarse exhaustivamente antes de cualquier despliegue real.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__ab_b30)
- [Dataset de entrenamiento](https://huggingface.co/datasets/lets-merged/mim-chess-vlas-train_800_sparse__no_mask_mim-chess-vlas-train_800_sparse__no_mask__ur5e)
- [Visualizador del dataset en LeRobot](https://huggingface.co/spaces/lerobot/visualize_dataset?path=lets-merged/mim-chess-vlas-train_800_sparse__no_mask_mim-chess-vlas-train_800_sparse__no_mask__ur5e)
- [Repositorio de NVIDIA Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Guía de LeRobot para GR00T](https://huggingface.co/docs/lerobot/main/en/groot)
- [Documentación completa de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Chuleta de comandos CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
