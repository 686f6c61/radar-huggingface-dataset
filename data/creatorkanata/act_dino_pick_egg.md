# CreatorKanata/act_dino_pick_egg

## Resumen

`CreatorKanata/act_dino_pick_egg` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado con la librería LeRobot de Hugging Face sobre un conjunto de datos teleoperado propio del autor, y se distribuye como un checkpoint de 51.674.761 parámetros (aproximadamente 51,7 millones) con pesos en formato safetensors y licencia Apache 2.0.

El modelo resuelve una tarea de manipulación muy concreta: "Pick up the egg with the mouth (green egg)", es decir, coger un huevo verde con la boca del efector. Está pensado para ejecutarse sobre un robot de tipo `lekiwi_client`, que recibe un vector de estado de 9 dimensiones y una imagen de cámara (480x640) y devuelve un vector de acción de 9 dimensiones. No es un modelo de lenguaje ni un modelo multimodal generalista: es una política visomotora de control robótico.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento de una política ACT y despliegue) con pasos y comandos documentados. Por otro, ACT es una referencia consolidada en manipulación robótica por su simplicidad y sus altas tasas de éxito en tareas de precisión, lo que lo convierte en un punto de partida habitual para investigar aprendizaje por imitación en hardware de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de visión, encoder de estado y decodificador de acciones con CVAE |
| Parametros totales | 51.674.761 (aproximadamente 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ACT opera con un horizonte de observación y un chunk de acción; el valor concreto no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors sin cuantizar; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no procesa texto de entrada, solo una instrucción de tarea fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería `lerobot`) |
| Tipo de robot | `lekiwi_client` |
| Entradas | `observation.state` (9,) y `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (9,) |
| Camaras declaradas | `front`, `wrist` (la tabla de entradas solo detalla la imagen de muñeca; ver limitaciones) |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv 2304.13705). La arquitectura se basa en un transformer que combina un encoder visual y un encoder de estado con un decodificador que genera un chunk de acciones de longitud fija, en lugar de predecir un único paso de control. Esta predicción por chunks reduce el error de composición típico de las políticas que actúan paso a paso y suaviza la ejecución. El modelo incorpora además un esquema de autoencoder variacional condicional (CVAE) durante el entrenamiento para capturar la variabilidad de las demostraciones humanas, y una técnica de ensamblado temporal (temporal ensembling) habitual en la inferencia de ACT. No se dispone en la informacion proporcionada de detalles sobre la configuración interna (número de capas, dimensión de los embeddings o tamaño del chunk).

Los datos de entrenamiento provienen del dataset `CreatorKanata/dino_pick_egg`: 20 episodios teleoperados, 12.000 fotogramas a 30 FPS, todos correspondientes a la tarea "Pick up the egg with the mouth (green egg)". La configuración de entrenamiento registrada es de 18.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, con LeRobot versión 0.6.2. No se documenta el uso de RLHF, DPO ni fases de ajuste por preferencias, algo esperable en una política de control que se entrena exclusivamente por imitación supervisada y no sigue instrucciones en lenguaje natural más allá de la etiqueta fija de la tarea.

## Capacidades

- Control robótico visomotor: genera comandos de acción de 9 dimensiones a partir de un estado de 9 dimensiones y una imagen de cámara.
- Manipulación de precisión: la tarea entrenada es coger un huevo verde con el efector, lo que implica agarre fino y control de contacto.
- Aprendizaje por imitación: reproduce comportamientos derivados de demostraciones teleoperadas, sin necesidad de un modelo de recompensa.
- Predicción por chunks: emite secuencias cortas de acciones, lo que mejora la estabilidad frente a políticas paso a paso.
- Ejecución autónoma en bucle: puede ejecutarse de forma continua durante un tiempo definido mediante `lerobot-rollout`.
- Integración con LeRobot: compatible con los comandos `lerobot-train` y `lerobot-rollout` y con el ecosistema de datasets de Hugging Face.
- Reentrenamiento y ajuste: la configuración base puede reutilizarse para entrenar políticas ACT sobre otros datasets con el mismo esquema de observaciones.

No se documentan capacidades de lenguaje, tool calling, agentes, razonamiento multi-paso, visión generalista, audio ni modo de pensamiento, ya que no es un modelo de propósito general.

## Casos de uso

- Automatización de una celda pick-and-place: la política puede colocarse sobre un LeKiwi para recoger el huevo verde y depositarlo en otra ubicación, aprovechando que el modelo está entrenado justo para esa tarea y ese objeto.
- Base para aprendizaje por imitación en investigación: sirve como referencia reproducible de un entrenamiento ACT completo, con dataset, hiperparámetros y comandos documentados, para comparar con otras políticas sobre el mismo robot.
- Recogida automática de datos con fine-tuning posterior: la política puede ejecutarse para generar nuevos episodios que después se etiqueten o filtren y alimenten un segundo ciclo de entrenamiento, mejorando la cobertura de posiciones.
- Demostración en robótica educativa: por su tamaño reducido (51,7 M de parámetros) y su licencia permisiva, es adecuado para talleres y asignaturas donde se enseña el flujo completo de LeRobot.
- Pruebas de robustez y evaluación de dominio: al variar la iluminación, la posición del huevo o introducir distractores, se puede medir la degradación de la política y documentar tasas de éxito, algo que la propia model card deja pendiente.
- Punto de partida para el ajuste a un robot de características similares: el esquema de observaciones y acciones de 9 dimensiones puede servir de plantilla para adaptar el modelo a otro manipulador con el mismo número de grados de libertad.
- Inferencia de bajo coste en hardware embebido: dado su reducido número de parámetros, es viable ejecutarlo en equipos modestos (por ejemplo, la propia computadora que controla el robot), reduciendo la dependencia de GPU dedicadas.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible."

La model card incluye una sección de evaluación vacía, con la nota textual "_No evaluation results have been provided for this policy yet._". Por tanto, no hay tasas de éxito, número de ensayos ni condiciones de prueba para esta política concreta. El artículo de ACT (arXiv 2304.13705) reporta sus propios resultados en tareas bimanuales, pero esos datos no corresponden a este checkpoint y no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros, el peso ocupa aproximadamente 0,21 GB en fp32 y unos 0,10 GB en fp16, a lo que hay que sumar memoria para las activaciones y el encoder visual. En la práctica es despreciable frente a los modelos de lenguaje.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU moderna con soporte CUDA es suficiente (por ejemplo, RTX 3060/4090, A100 o H100 sobredimensionadas para este caso). La configuración de entrenamiento usa `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, con holgura. Incluso es viable en CPU o en plataformas embebidas tipo Jetson, si bien el throughput será menor.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, que no aplican a una política de control robótico en safetensors.
- Latencia y throughput: no disponibles. La velocidad de ejecución depende del hardware del robot, de la frecuencia de las cámaras (30 FPS en el dataset) y del tipo de ensamblado temporal empleado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CreatorKanata/act_dino_pick_egg | ACT (imitación, transformer) | 51,7 M | Pick up the egg (LeKiwi) | Apache 2.0 | Hugging Face |
| Diffusion Policy | Política por imitación basada en difusión | no disponible | Manipulación robótica general | no disponible | Repos públicos de investigación |
| SmolVLA | Política visión-lenguaje-acción | no disponible | Tareas de manipulación en LeRobot | no disponible | Hugging Face / LeRobot |
| ACT original (artículo ALOHA) | ACT | no disponible | Manipulación bimanual (ALOHA) | no disponible | Paper y repos públicos |

No se dispone en la información proporcionada de cifras de parámetros, contexto o rendimiento de las alternativas, por lo que la comparación cuantitativa no es posible. A nivel cualitativo, todas ellas son políticas de imitación del ecosistema LeRobot, y este checkpoint destaca por su tamaño reducido y por estar especializado en una única tarea sobre un robot LeKiwi.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "Pick up the egg with the mouth (green egg)". Fuera de ese objetivo o de ese objeto, se espera un comportamiento errático.
- Sin resultados de evaluación: no hay tasas de éxito ni ensayos publicados, lo que impide estimar su fiabilidad real en el mundo físico.
- Dataset muy pequeño: 20 episodios y 12.000 fotogramas. Esto limita la cobertura de posiciones, iluminación y configuraciones del objeto, y favorece un sobreajuste al entorno de grabación.
- Discrepancia en las cámaras: la model card declara las cámaras `front` y `wrist`, pero la tabla de entradas solo detalla `observation.images.wrist`. Conviene verificar qué entradas espera realmente el checkpoint antes de desplegarlo.
- Dependencia del hardware exacto: los nombres y las resoluciones de las cámaras deben coincidir con las claves de observación (`observation.images.wrist`, 480x640) y con la estructura del robot LeKiwi; cambiar la cámara o el montaje puede degradar o invalidar la política.
- Riesgo de fallo por acumulación de error: como toda política de imitación, pequeños errores pueden amplificarse durante la ejecución autónoma, especialmente si el estado inicial se aleja de la distribución de entrenamiento.
- Sin capacidades de lenguaje ni de instrucciones: la tarea es fija y no se puede reespecificar por texto en tiempo de inferencia más allá de la etiqueta introducida en `--task`.
- Sesgos de datos: un único operador y un solo entorno de grabación introducen sesgos en la forma de ejecutar el agarre y la cinemática empleada.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cite correctamente. No hay restricciones adicionales documentadas, pero tampoco garantías del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CreatorKanata/act_dino_pick_egg
- Dataset de entrenamiento: https://huggingface.co/datasets/CreatorKanata/dino_pick_egg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CreatorKanata/dino_pick_egg
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Paper en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de aprendizaje por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
