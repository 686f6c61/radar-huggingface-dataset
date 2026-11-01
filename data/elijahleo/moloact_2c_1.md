# elijahleo/moloact_2c_1

## Resumen

MolmoAct2 es un modelo fundacional de robótica desarrollado por el Allen Institute for AI (Ai2) que traduce imágenes de cámara e instrucciones en lenguaje natural en secuencias de acciones para robots. La implementación en LeRobot permite entrenar y evaluar el modelo sobre datos de demostración reales. El repositorio `elijahleo/moloact_2c_1` es un fine-tuning concreto de MolmoAct2 sobre un dataset de manufactura, empaquetado como política de imitación lista para desplegar con la librería LeRobot de Hugging Face.

El modelo resultante tiene 5.591.928.368 parámetros (5,59 mil millones) y ocupa 11,5 GB en el repositorio, lo que sugiere pesos en precisión de 16 bits. Consume tres flujos visuales de 480x640 píxeles (cámara de gripper, cámara superior y cámara lateral) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Está entrenado para el robot de tipo `follow` con tres tareas concretas de manipulación de hardware.

La relevancia de esta ficha es doble: por un lado documenta el estado del arte en modelos fundacionales de robótica open source (MolmoAct2, licencia Apache 2.0); por otro, sirve como ejemplo práctico de fine-tuning de bajo coste (20.000 pasos, batch 8) sobre 150 episodios de demostración, un régimen asequible para laboratorios pequeños. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de robótica MolmoAct2, implementación LeRobot) |
| Parametros totales | 5.591.928.368 (5,59 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.1) |
| Tipo de robot | follow |
| Camaras de entrada | gripper, newtop, newside (3 canales, 480x640) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Tamano del repositorio | 11,5 GB |
| Dataset de entrenamiento | manufacturing_finetune (150 episodios, 218.964 frames, 30 FPS) |
| Pipeline | robotics |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna de MolmoAct2 (si es un transformer puro, un modelo visión-lenguaje-acción híbrido o si emplea algún esquema de atención específico para secuencias de acciones). Lo que sí se documenta es el pipeline de entrenamiento de esta política concreta: se parte del modelo MolmoAct2 preentrenado y se hace fine-tuning supervisado con el optimizador AdamW, learning rate 1e-5, batch size 8, semilla 1000 y 20.000 pasos de entrenamiento, usando LeRobot 0.6.1 sobre GPU CUDA.

El dataset `manufacturing_finetune` contiene 150 episodios y 218.964 frames a 30 FPS, con tres tareas de manipulación: recoger hardware de un operario humano y colocarlo en una zona delimitada con cinta, separar tuercas en un vaso rojo y tornillos en un cubo azul, y depositar todo el hardware en un cubo. No se indica si hubo RLHF, DPO ni ninguna fase de alineación adicional; el entrenamiento es de imitación pura sobre demostraciones. Tampoco se especifica el número de tokens de entrenamiento ni la composición del corpus original de MolmoAct2.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales y estado propioceptivo: mapea tres imágenes de cámara más un vector de estado de 6 dimensiones a un vector de acción de 6 dimensiones.
- Seguimiento de instrucciones en lenguaje natural: la tarea se pasa como cadena de texto (`--task="..."`) y el modelo condiciona la política sobre ella.
- Manipulación de objetos rígidos pequeños en contextos de manufactura: tuercas, tornillos y hardware genérico.
- Interacción humano-robot: una de las tareas entrenadas implica recibir hardware de una persona.
- Control en bucle cerrado a 30 FPS, adecuado para tareas de pick-and-place de corta duración.
- Compatibilidad con el ecosistema LeRobot: entrenamiento, evaluación y despliegue con los comandos `lerobot-train` y `lerobot-rollout`.

No se documentan capacidades de tool calling, razonamiento multi-paso explícito, visión general (más allá de las tres cámaras del robot), audio ni modo thinking.

## Casos de uso

- Clasificación y separación de tornillería en línea de montaje: el modelo puede ejecutar la tarea "put nuts in red cup and bolts in blue bucket" sobre piezas que llegan por cinta, usando las tres cámaras para desambiguar tuercas de tornillos y el estado de 6 dimensiones para controlar la pinza. Es adecuado porque fue entrenado específicamente sobre esa tarea con 150 episodios reales.
- Recepción de componentes de un operario: la tarea "Take hardware from human and put in taped area" permite al robot recoger piezas de la mano de un humano y depositarlas en una zona marcada, un caso típico de célula de trabajo colaborativa donde el robot no debe invadir el espacio del operario.
- Kitting o preparación de lotes: agregar hardware disperso en un cubo ("Put all hardware in bucket") para alimentar un puesto de ensamblaje posterior; el modelo generaliza dentro de la distribución de posiciones y tipos de pieza vistos en entrenamiento.
- Base para fine-tuning en nuevos puestos de manufactura: dado el bajo coste del entrenamiento (20.000 pasos, batch 8), un integrador puede reentrenar la política con 100-200 episodios propios y adaptarla a una nueva célula sin partir de cero.
- Prototipado rápido de políticas de imitación en laboratorio: investigadores pueden usar este checkpoint como referencia funcional de MolmoAct2 en LeRobot para comparar contra sus propios métodos.
- Evaluación de robustez frente a variaciones de iluminación y posicionamiento: al estar entrenado con tres vistas fijas, sirve como banco de pruebas para medir la degradación de la política ante cambios de escena controlados.

No se recomienda su uso en dominios distintos a la manipulación de hardware pequeño sin reentrenamiento, dado que el dataset es muy específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito por tarea, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,59 mil millones de parámetros en fp16, los pesos ocupan aproximadamente 11,2 GB; sumando activaciones y buffers de las tres cámaras a 480x640, se recomienda un mínimo de 16 GB de VRAM. En fp32 serían necesarios unos 22,4 GB solo para pesos.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 6000 Ada para entrenamiento; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia y fine-tuning con batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con 24 GB en fp16; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) probablemente sea ajustado y requiera cuantización o reducción de resolución de las cámaras.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el camino documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se especifica la latencia real de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moloact_2c_1 (este) | 5,59 mil M | no disponible | Política robótica (fine-tuning de MolmoAct2) | Apache 2.0 | Hugging Face, LeRobot |
| MolmoAct2 (base, Ai2) | no disponible | no disponible | Modelo fundacional de robótica | no disponible en la informacion | Blog y repositorio de Ai2 |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Políticas de imitación | normalmente Apache 2.0 | Hugging Face, LeRobot |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas. La comparación cualitativa se limita a que este checkpoint es un fine-tuning específico de MolmoAct2 sobre manufactura, mientras que ACT y Diffusion Policy son arquitecturas de imitación más ligeras y genéricas dentro del mismo ecosistema LeRobot.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el dataset de entrenamiento es muy reducido y específico (150 episodios de una única célula de manufactura), por lo que la política heredará los sesgos de posición, iluminación, tipos de pieza y disposición de cámara de esas demostraciones.
- Riesgo de alucinación en el sentido robótico: al ser una política de imitación, puede generar acciones plausibles pero incorrectas ante objetos o configuraciones fuera de distribución; no hay evaluación publicada que cuantifique este riesgo.
- Limitaciones de contexto o idioma: la instrucción de tarea se pasa en inglés en los ejemplos; no se documenta soporte multilingüe. El modelo está condicionado a tres tareas concretas y no se sabe cómo responde a instrucciones nuevas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene verificar la licencia del modelo base MolmoAct2 de Ai2, que no se detalla en la información disponible.
- Caveat para producción: no hay tasas de éxito publicadas, el repositorio tiene 25 descargas y 0 likes, y la model card no incluye vídeo de demostración ni resultados de evaluación en robot real. No debería desplegarse en un entorno de producción sin una evaluación propia y un plan de recuperación ante fallos.
- Dependencia de hardware concreto: las cámaras y el robot `follow` deben coincidir exactamente con los nombres y shapes de observación (`gripper`, `newtop`, `newside`, estado de 6 dimensiones); cualquier cambio de montaje invalida la política.
- Fecha del repositorio: creado y actualizado el 2026-10-26, sin historial posterior de mantenimiento en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elijahleo/moloact_2c_1
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_finetune
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
