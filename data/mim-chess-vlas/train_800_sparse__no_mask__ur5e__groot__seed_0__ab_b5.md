# mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__ab_b5

## Resumen

`mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__ab_b5` es una política robótica de imitación entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA. No es un modelo de lenguaje generalista, sino un modelo visión-lenguaje-acción (VLA) que predice comandos motores a partir de observaciones visuales, estado propioceptivo e instrucciones en lenguaje natural. El repositorio contiene los pesos completos (3.144.016.000 parámetros, 50,3 GB) en formato safetensors y se distribuye bajo licencia Apache 2.0.

El modelo sigue el paradigma de GR00T N1.7: un backbone Cosmos-Reason2/Qwen3-VL que procesa visión e instrucciones, combinado con un transformer de acciones con flow matching que genera trayectorias de 7 dimensiones. Está especializado en una única tarea de manipulación (recoger objetos y depositarlos en una caja) sobre un entorno con robot Panda + UR5e y tres cámaras: `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`.

Es relevante como ejemplo reproducible de ajuste fino de un modelo fundacional robótico sobre un dataset concreto (1526 episodios, 377.262 frames a 20 FPS) con semilla fija y configuración documentada, lo que facilita la comparación entre variantes y la replicación experimental. No obstante, su alcance es muy acotado: no es un modelo de propósito general ni un chatbot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 50,3 GB) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL, que codifica las tres imágenes de cámara (224×224×3 cada una) junto con la instrucción textual de la tarea, y un transformer de acciones entrenado con flow matching que genera el vector de acción de 7 dimensiones condicionado por visión, lenguaje y estado propioceptivo (vector de 9 dimensiones). Es un diseño de tipo VLA (visión-lenguaje-acción) orientado a control robótico de extremo a extremo.

El entrenamiento se realizó con LeRobot 0.6.0 durante 60.000 pasos, con batch size 16, optimizador AdamW y learning rate 7e-05, semilla 0. El dataset contiene 1526 episodios y 377.262 frames a 20 FPS, con 40 tareas de tipo "Pick the X and place it into the box" sobre objetos domésticos variados (fruta, envases, utensilios, etc.). No se documenta en la información disponible el uso de RLHF, DPO ni detalles sobre la composición exacta del corpus de preentrenamiento del backbone.

## Capacidades

- Predicción de acciones robóticas de 7 dimensiones a partir de observaciones multimodales (tres cámaras + estado propioceptivo).
- Comprensión de instrucciones en lenguaje natural para seleccionar el objeto a manipular ("Pick the apple and place it into the box", etc.).
- Ejecución de tareas de pick-and-place sobre 40 categorías de objetos domésticos.
- Control de un entorno robótico con robot Panda + UR5e.
- Integración con el ecosistema LeRobot para rollout y entrenamiento.
- No dispone de capacidades de generación de texto, razonamiento simbólico, código, matemáticas, tool calling ni agentes multi-paso.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de recoger un objeto concreto y depositarlo en una caja usando las tres cámaras como entrada y emitiendo comandos de 7 dimensiones a 20 FPS, adecuado para experimentos de imitación reproducibles.
- Evaluación comparativa de variantes de entrenamiento: al estar etiquetado con semilla, configuración y dataset, sirve como punto de referencia para comparar estrategias de aumento de datos, enmascaramiento o regularización en políticas VLA.
- Investigación en modelos fundacionales robóticos: permite estudiar cómo un backbone VLM (Qwen3-VL) se adapta a control motor mediante flow matching en un dominio acotado.
- Prototipado de pipelines de imitación con LeRobot: el comando `lerobot-rollout` documentado permite desplegar la política sobre hardware real o simulado para validar el flujo completo de grabación, entrenamiento y ejecución.
- Benchmark interno de manipulación doméstica: las 40 tareas de objetos domésticos permiten medir tasa de éxito por categoría y detectar clases con peor rendimiento.
- Docencia y formación en robótica de imitación: el repositorio incluye configuración completa, dataset enlazado y comandos de ejecución, lo que lo hace útil como material didáctico reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144 millones de parámetros, una estimación orientativa en fp16 sería de aproximadamente 6-7 GB solo para pesos, más el coste del backbone visual y del transformer de acciones; en fp32 se duplicaría.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer de gama alta con suficiente VRAM (p. ej. RTX 4090 de 24 GB) en precisión reducida, aunque no se confirma en la documentación.
- Despliegue: el modelo está pensado para el stack LeRobot (`lerobot-rollout`), no para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponible. La frecuencia del dataset es de 20 FPS, lo que sugiere que el control debe operar a esa cadencia o superior, pero no se documentan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 ajustado) | 3.144.016.000 | no disponible | Pick-and-place Panda+UR5e | Apache 2.0 | Hugging Face |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional humanoide general | no disponible | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot | no disponible | no disponible | Imitación robótica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (pick-and-place sobre 40 objetos) y un único entorno robótico (Panda + UR5e con tres cámaras concretas); no generaliza a otras tareas ni configuraciones sin reentrenamiento.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, razonamiento, código ni conversación.
- Riesgo de sobreajuste al dataset de 1526 episodios y a las posiciones y objetos concretos del entorno de entrenamiento.
- No se documentan sesgos, evaluación de robustez ni análisis de fallos; se desconoce el comportamiento ante objetos o iluminación distintos a los del dataset.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de un backbone (Cosmos-Reason2/Qwen3-VL) cuyas condiciones de uso deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- No se especifican requisitos de hardware, latencia ni cuantizaciones soportadas, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__ab_b5
- Dataset de entrenamiento: https://huggingface.co/datasets/lets-merged/mim-chess-vlas-train_800_sparse__no_mask_mim-chess-vlas-train_800_sparse__no_mask__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lets-merged/mim-chess-vlas-train_800_sparse__no_mask_mim-chess-vlas-train_800_sparse__no_mask__ur5e
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
