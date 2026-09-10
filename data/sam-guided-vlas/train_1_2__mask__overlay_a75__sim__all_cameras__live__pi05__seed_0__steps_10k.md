# sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_10k

## Resumen

Este modelo es una política de manipulación robótica de tipo visión-lenguaje-acción (VLA), publicada por el usuario sam-guided-vlas en Hugging Face como un ajuste fino del modelo base lerobot/pi05_base. π₀.₅ (Pi05) es un modelo VLA de Physical Intelligence diseñado para generalizar a entornos y situaciones nuevos, y su implementación en LeRobot está adaptada del repositorio OpenPI de la propia compañía. El checkpoint concreto aquí descrito es una especialización sobre un robot Franka Panda y no un modelo de propósito general: consume estado propioceptivo e imágenes y emite comandos de acción.

El entrenamiento se realizó con LeRobot 0.6.0 durante 10.000 pasos, con tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 0, sobre un dataset de 200 episodios y 30.830 fotogramas capturados a 20 FPS. Las tareas cubiertas son 20 categorías de objetos domésticos y de cocina, desde "soap dispenser" hasta "spray", con tres cámaras: vista general del agente y dos cámaras en la muñeca.

Con 4.143.404.816 parámetros (unos 4,14 mil millones) y pesos en safetensors, el modelo es relevante como línea base reproducible para investigación en imitación visual-motora y para estudiar técnicas de guiado visual (el nombre del repositorio y del dataset apuntan a experimentos con máscaras y superposiciones, "mask" y "overlay_a75"). Su licencia Apache 2.0 y su integración nativa en LeRobot facilitan la replicación, aunque no se han publicado resultados de evaluación que respalden su rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en π₀.₅ de Physical Intelligence; detalles de capas y atención no disponibles |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (entrada limitada a estado de 9 dimensiones y tres imágenes de 224x224) |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | No disponible (las etiquetas de tarea del dataset están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.0 |
| Pipeline | robotics |
| Robot objetivo | Franka Panda |
| Cámaras de entrada | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entradas | observation.state (9,), tres imágenes (3, 224, 224) |
| Salidas | action (7,) |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live |
| Pasos de entrenamiento | 10.000 |
| Tamaño del repositorio | 9,4 GB |
| Fecha de publicación | 2026-09-10 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un VLA de la familia π₀.₅, orientado a la generalización en entornos abiertos y adaptado a LeRobot desde OpenPI. No se detallan en la model card ni en los metadatos el número de capas, el mecanismo de atención, el codificador visual, la cabeza de acción ni si emplea decodificación por flujo (flow matching) u otro esquema. Todo lo que se conoce con certeza es la interfaz: entra estado propioceptivo de 9 dimensiones junto con tres imágenes RGB de 224x224 y sale un vector de acción de 7 dimensiones, correspondiente a un robot Franka Panda.

El ajuste fino se realizó sobre 200 episodios y 30.830 fotogramas a 20 FPS, con 10.000 pasos, lote de 16, AdamW y tasa de aprendizaje 5e-05, partiendo del modelo preentrenado lerobot/pi05_base. No se documenta en la información proporcionada si hubo RLHF, DPO ni ninguna fase de alineación posterior al entrenamiento por imitación, ni la composición exacta de mezclas de datos más allá del dataset citado. El nombre del dataset y del repositorio sugiere variantes experimentales con máscaras (SAM) y superposición al 75 por ciento sobre datos de simulación y ejecución real, pero no se aportan detalles metodológicos.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 7 grados de libertad a partir de estado propioceptivo e imágenes.
- Política condicionada por tarea: acepta una instrucción de tarea (por ejemplo, "soap dispenser" o "kettle") y ejecuta la secuencia de manipulación correspondiente.
- Percepción multi-cámara: integra simultáneamente una vista general de la escena y dos vistas de muñeca.
- Manipulación de objetos domésticos y de cocina: el dataset cubre 20 categorías de objetos, como jarras, cajas de cereales, cuchillos, hervidores, frutas, verduras y botes de especias.
- Ejecución de políticas entrenadas por imitación sobre hardware Franka Panda mediante el comando lerobot-rollout.
- Reentrenamiento y ajuste fino: al ser un checkpoint LeRobot, puede reajustarse con lerobot-train sobre nuevos datasets.
- No dispone de tool calling, function calling, agentes multi-paso, generación de texto libre ni capacidades de audio o visión general; es una política robótica, no un asistente conversacional.

## Casos de uso

- Replicación de experimentos en robótica: sirve como checkpoint de referencia para reproducir el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) sobre un Franka Panda, con hiperparámetros documentados (10.000 pasos, lote 16, lr 5e-05, semilla 0).
- Evaluación de guiado visual con SAM: el nombre del dataset y del repositorio apunta a experimentos con máscaras y superposiciones; este checkpoint permite comparar el efecto de esas técnicas frente a variantes sin guiado visual en las mismas 20 tareas.
- Picking and placing de objetos de cocina en laboratorio: el modelo está entrenado para manipular jarras, latas, cajas de comida o frutas, de modo que puede emplearse en líneas de experimentación de recogida y colocación con estas categorías concretas.
- Estudio de sim-to-real: al haberse entrenado con datos de simulación y ejecución real ("sim" y "live" en el nombre del dataset), es un candidato para medir la transferencia entre ambos dominios en el mismo conjunto de tareas.
- Punto de partida para ajuste fino específico: un equipo que necesite una política para un objeto o tarea nueva puede partir de este checkpoint en lugar de lerobot/pi05_base, reduciendo el coste de entrenamiento al heredar el ajuste en el dominio de cocina.
- Generación de datos y aumento de dataset: la política puede desplegarse para producir trayectorias candidatas que después se filtren y añadan a un dataset de imitación.
- Docencia y formación en VLA: por su licencia Apache 2.0 y su integración en LeRobot, es adecuado para prácticas de laboratorio sobre entrenamiento y despliegue de políticas de imitación.
- Comparación de semillas y configuraciones: el nombre incluye "seed_0" y "steps_10k", lo que lo hace útil como miembro de un barrido sistemático de semillas y número de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una sección de evaluación vacía y declara explícitamente que no se han proporcionado resultados de evaluación para esta política. No hay tasas de éxito, números de ensayos ni métricas de MMLU, HumanEval o GSM8K, que por otra parte no aplicarían a un modelo de acción robótica.

## Requisitos de hardware

- Pesos en precisión completa (fp32): aproximadamente 16,6 GB solo de parámetros.
- Pesos en bf16/fp16: aproximadamente 8,3 GB de parámetros; con activaciones, codificador visual y tres flujos de imagen de 224x224, se recomienda reservar entre 10 y 12 GB de VRAM.
- Cuantización a int8: alrededor de 4,1 GB de pesos; a int4, alrededor de 2,1 GB, aunque no se publican variantes cuantizadas oficiales y estas cifras son estimaciones teóricas a partir del número de parámetros.
- GPU recomendadas: NVIDIA A100, H100 o L40S para entrenamiento y despliegues con margen; RTX 4090 (24 GB) y RTX 4080 (16 GB) son suficientes para inferencia en bf16. En GPUs de 12 GB el modelo en bf16 queda muy justo y puede requerir cuantización o gestión cuidadosa de memoria.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 16 GB o más; en 8-12 GB solo con cuantización.
- Almacenamiento: el repositorio ocupa 9,4 GB, por lo que se necesita ese espacio en disco además de la caché de Hugging Face.
- Opciones de despliegue: la vía documentada es LeRobot (lerobot-rollout para inferencia y lerobot-train para reentrenamiento) sobre PyTorch con CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Hardware robótico: se requiere un Franka Panda con nueve dimensiones de estado y tres cámaras configuradas con los nombres exactos agentview, robot0_eye_in_hand y robot0_eye_in_hand_2.
- Latencia y throughput: no disponibles. El dataset se capturó a 20 FPS, lo que sitúa la frecuencia de control de referencia en torno a 20 Hz (unos 50 ms por acción), pero no se aportan mediciones reales de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este checkpoint (pi05, seed 0, 10k pasos) | 4.143.404.816 | Estado de 9 dimensiones y 3 imágenes de 224x224; salida de acción de 7 dimensiones | apache-2.0 | Pesos en safetensors en Hugging Face | No se han publicado evaluaciones |
| lerobot/pi05_base | No disponible en la información proporcionada | Igual que la familia π₀.₅; no detallado | No disponible en la información proporcionada | Pesos en Hugging Face | No disponible |
| lerobot/pi0 (π₀, predecesor citado en la model card) | No disponible | No detallado; orientado a generalización en entornos abiertos | No disponible | Repositorio OpenPI y adaptación a LeRobot | No disponible |

No se dispone de datos suficientes para comparar parámetros, contexto, licencia o rendimiento con otras familias de VLA de la misma categoría (por ejemplo, políticas de imitación de tamaño similar), por lo que la comparación se limita a los modelos referenciados en la propia model card y queda mayoritariamente marcada como no disponible.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en cualquiera de las 20 tareas, por lo que no debe asumirse un rendimiento concreto en producción.
- Especialización estrecha: está ajustado a 20 tareas de objetos domésticos y de cocina y a un robot Franka Panda con estado de 9 dimensiones; no transferirá a otros robots, efector o número de articulaciones sin reentrenamiento.
- Dependencia estricta de la interfaz: los nombres de cámara (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2) y la forma de la observación deben coincidir con los del entrenamiento; cualquier cambio rompe la política.
- Dataset pequeño: 200 episodios y 30.830 fotogramas a 20 FPS para 20 tareas implican una media de 10 episodios por tarea, con riesgo de sobreajuste y de escasa cobertura de posiciones, iluminación y oclusiones.
- Posible brecha sim-to-real: el dataset combina datos de simulación y de ejecución real según su nombre, pero no se documenta la proporción ni el procedimiento de mezcla.
- Idiomas: no se documenta soporte multilingüe; las etiquetas de tarea están en inglés y no hay evidencia de que el modelo interprete instrucciones en castellano.
- Riesgo de acciones inseguras: como toda política de manipulación, puede generar trayectorias erróneas o colisiones; cualquier despliegue físico requiere límites de par, paradas de emergencia y supervisión.
- Sin calibración de incertidumbre: no se publica ningún mecanismo de confianza o abstención, de modo que el modelo ejecutará una acción aunque la escena sea desconocida.
- Licencia: el checkpoint es apache-2.0, lo que en principio permite uso comercial, pero conviene revisar los términos del modelo base lerobot/pi05_base y del repositorio OpenPI del que deriva la implementación, así como las licencias del dataset empleado.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, y sin demos ni vídeos publicados, lo que reduce la evidencia externa sobre su funcionamiento.
- Entrenamiento corto: 10.000 pasos con lote 16 sobre un dataset reducido; no se documenta ninguna fase de RLHF, DPO o ajuste posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Los resultados de la búsqueda web no aportan enlaces relevantes sobre este modelo: las referencias encontradas corresponden a una serie de televisión francesa, al portal de contratación pública SAM.gov y a un fabricante de utillaje, y no guardan relación con el modelo.
