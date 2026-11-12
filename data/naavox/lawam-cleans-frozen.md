# naavox/lawam-cleans-frozen

## Resumen

LaWAM (latent world action model) es una política robótica desarrollada por el usuario naavox sobre el backbone preentrenado `jialei02/lawam-pretrain-lerobot`. Combina un backbone Qwen3-VL con un modelo latente de acción/mundo y una cabeza de acción basada en flow matching, orientada a generar políticas de robot conscientes de la dinámica del entorno. El modelo que nos ocupa, `naavox/lawam-cleans-frozen`, es un fine-tuning específico para el robot `stringman` en tareas domésticas de clasificación y recogida de objetos.

El modelo resuelve el problema de la imitación visual-motora en robótica manipulativa: dado un conjunto de tres cámaras (una de pinza y dos de anclaje) y una instrucción en lenguaje natural, produce una acción de 5 dimensiones por paso de tiempo. Es relevante porque aplica un backbone de visión-lenguaje de gran escala (Qwen3-VL) a control robótico de bajo nivel mediante flow matching, una combinación poco habitual en políticas de imitación tipo LeRobot.

Con 2.555.179.360 parámetros (aproximadamente 2,55 mil millones) y un repositorio de 7,2 GB en safetensors, se distribuye bajo licencia MIT y se integra en el ecosistema LeRobot 0.7.0. El modelo está congelado ("frozen") y entrenado sobre 1.247 episodios y 827.085 fotogramas a 30 FPS del dataset `naavox/stringman_cleans`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaWAM: backbone Qwen3-VL + modelo latente de acción/mundo + cabeza de acción flow matching |
| Parametros totales | 2.555.179.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

LaWAM es un modelo latente de acción y mundo que empareja un backbone de visión-lenguaje Qwen3-VL con un modelo latente de acción/mundo y una cabeza de acción basada en flow matching. El backbone procesa las tres entradas visuales (`observation.images.image` a 544×960, `observation.images.image2` a 384×684 y `observation.images.image3` a 544×960) junto con la instrucción de tarea, y la cabeza de flow matching genera el vector de acción de 5 dimensiones. La inclusión de un modelo latente de mundo busca que la política sea consciente de la dinámica del entorno, no solo de la correlación observación-acción.

El fine-tuning se realizó sobre el checkpoint preentrenado `jialei02/lawam-pretrain-lerobot` con 30.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.7.0. El dataset de entrenamiento `naavox/stringman_cleans` contiene 1.247 episodios y 827.085 fotogramas a 30 FPS, con tareas como "Put laundry in the hamper", "put trash in trash can", "put a toy in the toy box", "put a ball in the ball pit", "put stuffies on the bed", "put Legos in the Lego basket" y "put the diaper supplies near the diaper bag next to the wall". No se documenta el uso de RLHF o DPO; el paradigma es imitación supervisada sobre demostraciones.

## Capacidades

- Generación de acciones robóticas de 5 dimensiones a partir de observaciones visuales multi-cámara y una instrucción en lenguaje natural.
- Percepción visual multi-cámara: procesa simultáneamente una cámara de pinza y dos cámaras de anclaje con resoluciones nativas distintas (544×960 y 384×684).
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea entre las aprendidas (recogida de ropa, basura, juguetes, pelotas, peluches, Legos, pañales).
- Política consciente de la dinámica gracias al componente de modelo latente de mundo.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; es un modelo especializado en control robótico.

## Casos de uso

- Recogida de ropa en un cesto: la política ejecuta la tarea "Put laundry in the hamper" sobre el robot `stringman` usando las tres cámaras para localizar la prenda y el cesto, y genera la trayectoria de 5 dimensiones para depositarla. Es adecuado porque la tarea está representada en el dataset con múltiples episodios.
- Gestión de residuos domésticos: el modelo ejecuta "put trash in trash can" identificando objetos de desecho y el contenedor correspondiente mediante las cámaras de anclaje.
- Organización de juguetes: tareas como "put a toy in the toy box" o "put Legos in the Lego basket" permiten clasificar objetos por categoría y depositarlos en su contenedor, aprovechando la comprensión de la instrucción en lenguaje natural.
- Recogida de pelotas en un ball pit: la política "put a ball in the ball pit" usa la cámara de pinza para el agarre fino y las cámaras de anclaje para la localización global del destino.
- Colocación de peluches en la cama: la tarea "put stuffies on the bed" demuestra manipulación de objetos blandos y deformables, un caso habitual en robótica doméstica.
- Transporte de suministros: la tarea "put the diaper supplies near the diaper bag next to the wall" implica navegación relativa a referencias espaciales descritas en lenguaje natural, útil en asistencia a personas dependientes.
- Despliegue como política de referencia en investigación: al ser un fine-tuning congelado sobre un backbone VLM, sirve como baseline reproducible en experimentos de imitación visual-motora con LeRobot 0.7.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 2,55 mil millones de parámetros en precisión completa (fp32) se requieren aproximadamente 10,2 GB solo para pesos; en fp16/bf16 unos 5,1 GB; en int8 unos 2,6 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, una GPU con al menos 8-12 GB de VRAM en bf16 sería suficiente para los pesos, aunque el procesamiento de tres cámaras a resoluciones 544×960 añade memoria de activaciones no cuantificada.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 12-16 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=naavox/lawam-cleans-frozen`); el ecosistema LeRobot 0.7.0 es el soportado oficialmente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset, pero no se publica latencia medida por paso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni comparaciones con otras políticas robóticas (por ejemplo, ACT, Diffusion Policy o π0), por lo que no es posible establecer una comparativa rigurosa con datos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| naavox/lawam-cleans-frozen | 2.555.179.360 | no disponible | MIT | Hugging Face |
| jialei02/lawam-pretrain-lerobot | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo congelado y especializado: solo ejecuta las tareas del dataset `naavox/stringman_cleans` sobre el robot `stringman`; no generaliza a otros robots ni a tareas fuera de distribución sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de hardware específico: requiere el robot `stringman` y exactamente las tres cámaras con los nombres y resoluciones de observación del entrenamiento (`gripper_camera`, `anchor_camera_0`, `anchor_camera_1`); un cambio de cámara o de calibración puede degradar el rendimiento.
- Sesgos del dataset: las tareas y el entorno doméstico del dataset condicionan el comportamiento; objetos, iluminación o disposición distintos a los vistos en los 1.247 episodios pueden provocar fallos.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones plausibles pero incorrectas ante observaciones ambiguas, sin mecanismo de verificación explícito.
- Idiomas: las instrucciones del dataset están en inglés; no se documenta soporte multilingüe.
- Licencia MIT: permite uso comercial, pero el modelo base `jialei02/lawam-pretrain-lerobot` y el backbone Qwen3-VL pueden tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naavox/lawam-cleans-frozen
- Modelo base: https://huggingface.co/jialei02/lawam-pretrain-lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/naavox/stringman_cleans
- Paper LaWAM: https://arxiv.org/abs/2606.15768
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot LaWAM: https://huggingface.co/docs/lerobot/main/en/lawam
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=naavox/stringman_cleans
