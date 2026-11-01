# mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live__groot__seed_0

## Resumen

El modelo `train_800_sparse__mask__overlay_a75__sim__all_cameras__live__groot__seed_0`, publicado por el usuario `mim-chess-vlas`, es una política de imitación robótica basada en la arquitectura GR00T N1.7 de NVIDIA, entrenada y distribuida mediante la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje generalista, sino de un modelo visión-lenguaje-acción (VLA) especializado en una tarea concreta de manipulación: recoger objetos cotidianos y depositarlos en una caja.

El modelo parte del backbone Cosmos-Reason2/Qwen3-VL, que procesa las observaciones visuales y las instrucciones en lenguaje natural, y lo combina con un transformer de acciones basado en flow matching que genera las trayectorias de control del robot. Con 3.144.016.000 parámetros totales según los pesos en safetensors, el repositorio ocupa 100,6 GB, lo que refleja que se distribuyen pesos en precisión completa o mixta junto con posibles checkpoints intermedios.

Su relevancia es acotada pero clara para la comunidad de robótica: demuestra el flujo completo de LeRobot 0.6.0 para afinar un modelo fundacional cross-embodiment de NVIDIA sobre un dataset propio de 787 episodios y 195.184 frames a 20 FPS, con licencia Apache 2.0 y formato compatible con el ecosistema LeRobot. Es, por tanto, un artefacto de referencia para reproducir experimentos de imitación con GR00T, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL (visión-lenguaje) + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors; el repo ocupa 100,6 GB) |
| Idiomas soportados | no disponible (las tareas del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional cross-embodiment para robots humanoides y brazos manipuladores. Su diseño separa dos componentes: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que interpreta las imágenes de cámara y la instrucción textual, y un transformer de acciones entrenado con flow matching que predice la secuencia de acciones condicionada por la representación multimodal y el estado propioceptivo del robot. Esta separación permite reutilizar el conocimiento visual y lingüístico del backbone mientras se adapta únicamente la cabeza de acciones al embodiment concreto.

El entrenamiento de esta instancia concreta se realizó con LeRobot 0.6.0 durante 60.000 pasos, con batch size 16, optimizador AdamW y learning rate 7e-5, semilla 0. El dataset asociado contiene 787 episodios y 195.184 frames a 20 FPS, con 40 tareas distintas del tipo "Pick the X and place it into the box" sobre objetos variados (jam, cereal, pear, sweet potato, scone, can, hamburger, lemon, squash, cheese, cup, egg, ham, hot dog, apple, bread, candle, chicken breast, soap dispenser, jar, knife block, kettle, potato, basket, cake, orange, spice, spray, alcohol, blender jug, mushroom, salt and pepper shaker, tiered shelf, condiment, mango, pitcher, plant, stool, entre otros). El robot de destino es un Panda con tres cámaras: `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`. No se documenta en la información disponible si hubo RLHF, DPO ni detalles sobre la composición exacta del dataset más allá de los episodios y frames indicados.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones a partir de observaciones visuales (3 cámaras RGB de 224x224) y estado propioceptivo de 9 dimensiones.
- Comprensión de instrucciones en lenguaje natural para seleccionar el objeto objetivo entre 40 categorías distintas.
- Política de imitación entrenada para una tarea específica de pick-and-place sobre un robot Panda.
- Procesamiento multimodal visión-lenguaje mediante el backbone Cosmos-Reason2/Qwen3-VL.
- Predicción de trayectorias continuas mediante flow matching, adecuada para control de bajo nivel.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, visualización de datasets, CLI de entrenamiento).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles; las instrucciones del dataset están en inglés.

## Casos de uso

- Reproducción de experimentos de imitación con GR00T: el modelo sirve como referencia para validar el pipeline de LeRobot 0.6.0 con un dataset de 787 episodios, comparando hiperparámetros y semillas en condiciones controladas.
- Investigación en manipulación pick-and-place: permite estudiar cómo un backbone visión-lenguaje de gran tamaño se adapta a tareas de recogida y depósito con objetos cotidianos, aislando el efecto del backbone del de la cabeza de acciones.
- Evaluación de generalización cross-embodiment: al estar entrenado sobre un Panda con tres cámaras, es útil para analizar la transferencia de GR00T a configuraciones de cámara y robots similares.
- Benchmarking de políticas VLA: con 60.000 pasos, batch 16 y lr 7e-5 documentados, sirve como baseline reproducible para comparar variantes de entrenamiento (por ejemplo, cambios en la resolución de imagen o en el número de cámaras).
- Docencia y formación en robótica de imitación: el flujo `lerobot-rollout` con `--robot.type=Panda` y cámaras OpenCV permite desplegar la política en un robot real o simulado con una configuración mínima.
- Generación de datos sintéticos y aumentación: el modelo puede emplearse para etiquetar o filtrar episodios del dataset original, identificando ejecuciones fallidas en las 40 tareas de pick-and-place.
- Integración en pipelines de investigación reproducible: la licencia Apache 2.0 y el formato safetensors facilitan su inclusión en entornos de CI y en repositorios académicos sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.144.016.000 parámetros, una inferencia en fp16 requeriría aproximadamente 6,3 GB solo para pesos, más el estado del optimizador y buffers si se entrena; el repositorio de 100,6 GB sugiere que se distribuyen múltiples checkpoints o pesos en mayor precisión.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, una GPU con 16-24 GB (RTX 4090, A10G, L4) sería suficiente para inferencia en fp16; para entrenamiento con batch 16 se necesitarían probablemente A100 de 40/80 GB o H100.
- Compatibilidad con GPU de consumo: previsiblemente sí en cuantización fp16 o inferior en GPUs de 24 GB, aunque no se documenta oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tuned) | 3.144.016.000 | no disponible | Pick-and-place con Panda | Apache 2.0 | Hugging Face (LeRobot) |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (pick-and-place de 40 objetos sobre un Panda) y no es un modelo de propósito general; su uso fuera de ese dominio requerirá reentrenamiento.
- Solo se ha validado con tres cámaras concretas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un estado propioceptivo de 9 dimensiones; cambios en la configuración de sensores invalidan la política.
- No se documentan métricas de éxito, tasas de fallo ni evaluaciones cuantitativas, por lo que no es posible estimar su fiabilidad en producción.
- Riesgo de sobreajuste al dataset de 787 episodios y a las condiciones de iluminación y disposición de objetos del mismo.
- No se especifican sesgos conocidos, pero al derivar de un backbone visión-lenguaje puede heredar sesgos de sus datos de preentrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y sus dependencias deben verificarse por separado.
- El tamaño del repositorio (100,6 GB) implica costes de almacenamiento y transferencia considerables.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no opera como un LLM conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
