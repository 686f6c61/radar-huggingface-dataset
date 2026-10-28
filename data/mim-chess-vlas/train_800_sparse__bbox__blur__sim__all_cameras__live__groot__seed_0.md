# mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live__groot__seed_0

## Resumen

`mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live__groot__seed_0` es una política robótica de imitación (VLA, vision-language-action) entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA. No es un modelo de lenguaje general: recibe el estado articular de un robot Franka Panda, tres imágenes de cámara y una instrucción textual corta en inglés, y devuelve un vector de acción de 7 dimensiones. El checkpoint tiene 3.144.016.000 parámetros y se distribuye en safetensors bajo licencia Apache-2.0, con un repositorio de 12,6 GB.

El modelo es un fine-tuning de GR00T N1.7, que combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching. El entrenamiento se hizo sobre un único dataset propio de 787 episodios y 195.184 fotogramas a 20 FPS, con 40 tareas de tipo "coge el objeto X y mételo en la caja" en un entorno de simulación (nomenclatura de cámaras `agentview` / `robot0_eye_in_hand`, típica de robosuite).

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación, entrenamiento y rollout) sobre GR00T, con semilla fija (seed 0) y una configuración de entrenamiento documentada. No hay métricas de éxito ni evaluación publicadas, y el nombre del repositorio sugiere variantes de datos (bbox, blur, sparse, sim, live) sin que la model card las explique.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (NVIDIA): backbone vision-lenguaje Cosmos-Reason2 / Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (~3,14 B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ); pesos en safetensors |
| Idiomas soportados | no disponible a nivel oficial; las instrucciones de tarea del dataset estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 12,6 GB) |
| Tipo de politica | imitacion visuomotora (VLA), salida de acciones continuas |
| Robot objetivo | Franka Panda (entorno de simulacion) |
| Camaras | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` (3 x 224 x 224) |
| Entrada de estado | `observation.state` con forma `(9,)` |
| Salida de accion | `action` con forma `(7,)` |
| Frecuencia de los datos | 20 FPS |
| Framework | LeRobot 0.6.0 |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional de NVIDIA para razonamiento y habilidades de robots humanoides, de tipo cross-embodiment. Segun la model card, usa un backbone Cosmos-Reason2/Qwen3-VL que procesa conjuntamente las imágenes de las tres cámaras y la instrucción de lenguaje, y un transformer de acciones entrenado con flow matching que predice la acción condicionada por visión, lenguaje y propriocepción. El resultado es una política que genera trayectorias de acción continuas en lugar de tokens de texto.

El fine-tuning se realizó con LeRobot 0.6.0 sobre el dataset `mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live`: 787 episodios, 195.184 fotogramas a 20 FPS y 40 tareas de pick-and-place sobre objetos cotidianos (jam, cereal, pear, sweet potato, scone, can, hamburger, lemon, squash, cheese, cup, egg, ham, hot dog, apple, bread, candle, chicken breast, soap dispenser, jar, knife block, kettle, potato, basket, cake, orange, spice, spray, alcohol, blender jug, mushroom, salt and pepper shaker, tiered shelf, condiment, mango, pitcher, plant, stool, boxed food y boxed drink). La configuración documentada es de 60.000 pasos, batch de 16, optimizador AdamW, learning rate 7e-5 y semilla 0. No se detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; para un modelo de acción esos conceptos no aplican del mismo modo y la información no está disponible.

## Capacidades

- Manipulación pick-and-place guiada por lenguaje: ejecuta la instrucción "Pick the <objeto> and place it into the box" para 40 categorías de objeto distintas.
- Percepción multi-cámara: fusiona una vista global (`agentview`) y dos vistas de muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`) a resolución 224 x 224.
- Control continuo de 7 dimensiones a partir de un estado proprioceptivo de 9 dimensiones (posición y velocidad articular, más pinza).
- Condicionamiento por instrucción en lenguaje natural en inglés, en el formato exacto de las tareas del dataset.
- Generación de acciones por flow matching, lo que permite muestrear trayectorias suaves y multimodales.
- No soporta tool calling ni function calling: no es un LLM de texto.
- No dispone de modo "thinking", ni de capacidades de visión general (VQA, OCR) más allá del uso como señal de control.
- No se documentan capacidades de razonamiento multi-paso ni de planificación de tareas largas.

## Casos de uso

- Manipulación pick-and-place en simulación: el modelo ejecuta las 40 tareas del dataset sobre un Franka Panda en robosuite, recibiendo la instrucción por línea de comandos con `lerobot-rollout` y devolviendo acciones a la frecuencia de control.
- Punto de partida para fine-tuning con nuevos objetos: al estar entrenado sobre un conjunto acotado y con hiperparámetros documentados (60.000 pasos, lr 7e-5, batch 16), sirve como inicialización para añadir categorías de objeto o nuevas cajas de destino con un coste de datos bajo.
- Reproducción de experimentos: la semilla fija (seed 0) y la configuración publicada permiten replicar el entrenamiento y comparar variantes de dataset (bbox, blur, sparse, sim, live) dentro de la misma familia de checkpoints.
- Validación de pipelines de LeRobot: es un caso de extremo a extremo útil para probar la instalación, el formateo de datasets, el entrenamiento distribuido y el rollout con la versión 0.6.0 de la librería.
- Estudio de robustez perceptual: la nomenclatura del dataset sugiere entrenamiento con variaciones de oclusión (bbox) y desenfoque (blur); el checkpoint permite medir la degradación de la política ante esas perturbaciones en la vista `agentview`.
- Investigación en cross-embodiment: al derivar de GR00T N1.7, permite analizar cómo se transfiere un backbone Cosmos-Reason2/Qwen3-VL a una morfología concreta (Panda) con muy pocos datos.
- Docencia y prototipado en robótica con IA: el tamaño de 3,14 B y la licencia Apache-2.0 permiten desplegarlo en un laboratorio con una sola GPU de 24 GB para demostraciones de imitación visuomotora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, errores de posición ni comparaciones con otras políticas, y el repositorio no contiene scripts de evaluación ni curvas de entrenamiento.

## Requisitos de hardware

- Huella de pesos: aproximadamente 12,6 GB en fp32 y 6,3 GB en bf16, calculados a partir de los 3.144.016.000 parámetros (estimación propia, no publicada por el autor).
- VRAM de inferencia estimada: 10-16 GB en bf16, contando el backbone visual con tres imágenes de 224 x 224 y las iteraciones de integración del flow matching. Cifra orientativa; el autor no la documenta.
- GPU de producción: A100, H100 o L40S para servir la política con holgura y varios entornos en paralelo.
- GPU de consumo: sí cabe en RTX 4090 y RTX 3090 (24 GB) en bf16. En tarjetas de 16 GB (RTX 4080, 4070 Ti Super) el despliegue es ajustado y requiere reducir el lote o recurrir a precisión de 8 bits.
- Opciones de despliegue: `lerobot-rollout` de LeRobot con backend PyTorch es la vía documentada. No hay soporte oficial en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación de texto.
- Latencia y throughput: no publicados. Como referencia de diseño, el dataset se grabó a 20 FPS, lo que implica un presupuesto de unos 50 ms por paso de control si se quiere replicar la frecuencia de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuneado) | 3,14 B | no disponible | sin metricas publicadas | apache-2.0 | HuggingFace, LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | no disponible en esta informacion | no disponible en esta informacion | HuggingFace / GitHub Isaac-GR00T |
| OpenVLA (familia de VLA abiertos) | aproximadamente 7 B segun la literatura publica | no disponible | no evaluado aqui | no disponible en esta informacion | pesos abiertos |
| Politicas de imitacion tipo ACT / diffusion policy en LeRobot | tipicamente decenas de millones de parametros | no aplica | no disponible | apache-2.0 en la mayoria de checkpoints de LeRobot | HuggingFace via LeRobot |

La comparacion cuantitativa no es posible con los datos disponibles: no hay evaluaciones homogeneas ni del modelo base ni de los fine-tunings de la misma familia. Cualquier cifra de rendimiento relativo requeriria ejecutar el mismo protocolo de evaluacion sobre el mismo conjunto de tareas.

## Limitaciones y advertencias

- Dominio muy restringido: solo pick-and-place de 40 objetos sobre una única caja de destino. No realiza tareas de apilado, ensamblaje, vertido ni navegación.
- Entrenado en simulación (nomenclatura de cámaras robosuite, robot Panda). No hay evidencia de transferencia a un robot real (sim2real); el despliegue en hardware físico requiere validación propia.
- Volumen de datos reducido: 787 episodios y 195.184 fotogramas para una política de 3,14 B de parámetros, lo que aumenta el riesgo de sobreajuste al entorno concreto del dataset.
- Ausencia total de métricas: no se puede afirmar ninguna tasa de éxito sin evaluar el checkpoint. Los fallos serán silenciosos (acciones plausibles pero incorrectas), no detectables por el propio modelo.
- Idiomas: las instrucciones de entrenamiento están en inglés y con una plantilla fija ("Pick the X and place it into the box"); no hay soporte documentado de castellano ni de paráfrasis.
- Licencia: el checkpoint se publica como apache-2.0, lo que en principio permite uso comercial, pero conviene verificar los términos del modelo base GR00T N1.7 de NVIDIA antes de explotarlo en producto, ya que la model card no detalla la cadena de licencias.
- Model card auto-generada por LeRobot y con secciones de plantilla sin rellenar; no documenta cuantizaciones, evaluación, ni el significado de las variantes del nombre del dataset (bbox, blur, sparse, live).
- Sin versiones cuantizadas oficiales: el despliegue en GPUs pequeñas exige cuantizar por cuenta propia, con el riesgo de degradar la política de acción.
- Fecha de creación del repositorio (2026-10-28) y cero descargas: no hay comunidad, issues ni validación externa del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces anteriores proceden de la model card y del repositorio de HuggingFace.
