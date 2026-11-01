# elijahleo/moloact_2c_3

## Resumen

MolmoAct2 es un modelo fundacional abierto de robótica desarrollado por el Allen Institute for AI (Ai2) que transforma imágenes de cámara e instrucciones en lenguaje natural en secuencias de acciones ("action chunks") para robots manipuladores. Esta ficha concreta corresponde a `elijahleo/moloact_2c_3`, un fine-tuning del modelo base MolmoAct2 publicado por un tercero (usuario `elijahleo`) mediante la librería LeRobot de Hugging Face, orientado a tareas de manipulación de hardware en un entorno de fabricación.

El repositorio contiene pesos en formato safetensors con 5.591.928.368 parámetros (aproximadamente 5,6 mil millones) y ocupa 11,5 GB. La política consume tres flujos visuales de 480x640 píxeles (cámaras `gripper`, `newtop` y `newside`) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Está entrenada sobre el dataset `manufacturing_finetune` con 150 episodios y 218.964 frames a 30 FPS.

Su relevancia radica en que ejemplifica el flujo actual de fine-tuning de modelos fundacionales de robótica sobre hardware asequible: un modelo base publicado por un laboratorio de investigación, adaptado a una tarea industrial concreta con pocos datos y desplegable con la CLI de LeRobot. No obstante, la documentación pública es escasa y no se han publicado resultados de evaluación en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo fundacional visión-lenguaje-acción para robótica); implementación LeRobot |
| Parámetros totales | 5.591.928.368 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `follow` |
| Cámaras de entrada | `gripper`, `newtop`, `newside` (3 x 480 x 640) |
| Estado de observación | vector de 6 dimensiones |
| Salida de acción | vector de 6 dimensiones |
| Dataset de entrenamiento | `manufacturing_finetune` (150 episodios, 218.964 frames, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Descargas | 26 |
| Likes | 0 |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo fundacional de robótica que mapea observaciones multimodales (imágenes de cámara y estado propioceptivo del robot) junto con una instrucción en lenguaje natural a "chunks" de acciones de bajo nivel. La implementación en LeRobot soporta tanto el entrenamiento como la evaluación del modelo regular MolmoAct2. Los detalles internos de la arquitectura (número de capas, dimensión oculta, mecanismo de atención, estrategia de fusión visión-lenguaje-acción) no están documentados en la model card de este repositorio; el dato disponible es el recuento total de parámetros (5.591.928.368) y el formato de pesos safetensors.

El proceso de adaptación es un fine-tuning de imitación supervisada sobre el dataset `manufacturing_finetune`, compuesto por 150 episodios y 218.964 frames grabados a 30 FPS. Las tareas cubiertas son tres: "Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket" y "Put all hardware in bucket". El entrenamiento se realizó durante 20.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000, usando LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento por imitación, ni la composición completa del dataset más allá de los episodios indicados.

## Capacidades

- Control robótico por imitación: genera chunks de acción de 6 dimensiones a partir de tres vistas de cámara y un vector de estado de 6 dimensiones.
- Seguimiento de instrucciones en lenguaje natural: la política acepta una descripción de tarea (`--task`) que condiciona el comportamiento generado.
- Manipulación de objetos en entornos de fabricación: recogida de hardware de manos humanas, clasificación de tuercas y tornillos en recipientes, y depósito de piezas en un cubo.
- Fusión multimodal visión-lenguaje-acción: integra tres flujos visuales simultáneos (gripper, vista superior, vista lateral) con el estado del robot.
- Despliegue en robot real mediante `lerobot-rollout` con estrategia base (sin grabación de episodios).
- Reentrenamiento y fine-tuning adicional mediante `lerobot-train` con `--policy.type=molmoact2`.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, visión general, audio ni modo "thinking"; se trata de un modelo especializado en robótica, no de un LLM conversacional.

## Casos de uso

- Automatización de líneas de ensamblaje manual: la política puede ejecutar la tarea "Take hardware from human and put in taped area", recogiendo piezas entregadas por un operario y colocándolas en una zona delimitada, gracias a la fusión de las vistas superior y lateral que permiten localizar tanto la mano humana como el área de destino.
- Clasificación de componentes pequeños (tuercas y tornillos): el modelo distingue y separa piezas en recipientes de colores distintos ("put nuts in red cup and bolts in blue bucket"), tarea adecuada porque las tres cámaras proporcionan información de profundidad y color suficiente para la discriminación.
- Alimentación de contenedores en kitting industrial: la tarea "Put all hardware in bucket" permite usar la política para agrupar lotes de piezas sueltas en un contenedor, reduciendo la intervención manual en operaciones repetitivas.
- Base para fine-tuning en dominios adyacentes: al ser un modelo MolmoAct2 adaptado con LeRobot 0.6.1, sirve como punto de partida para reentrenar sobre nuevos datasets de fabricación con `lerobot-train --policy.type=molmoact2`.
- Investigación en imitación con datos limitados: con solo 150 episodios y 218.964 frames, el repositorio demuestra un flujo de adaptación de un modelo fundacional de 5,6 mil millones de parámetros a una tarea concreta, útil como referencia metodológica.
- Prototipado en robots de tipo `follow`: la configuración documentada (robot `follow`, tres cámaras OpenCV a 640x480 y 30 FPS) permite replicar el montaje en laboratorios con hardware similar y validar la política con `lerobot-rollout --strategy.type=base`.
- Evaluación comparativa de políticas de imitación: al estar publicado en el Hub con licencia Apache 2.0, puede usarse como baseline frente a otras políticas LeRobot en tareas de manipulación de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y la sección de evaluación aparece como plantilla sin rellenar. No hay tasas de éxito, número de ensayos ni condiciones experimentales documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Como referencia orientativa, un modelo de 5,6 mil millones de parámetros en safetensors ocupa 11,5 GB en el repositorio; en FP16 requeriría del orden de 11-12 GB de VRAM solo para los pesos, más el coste de las tres cámaras y del bucle de control, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponible. No se documentan GPU concretas (A100, H100, RTX 4090, etc.) ni requisitos mínimos.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de pesos, sería plausible en GPUs con 16 GB o más de VRAM en FP16, pero el autor no lo verifica.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable al tratarse de una política robótica y no de un LLM de texto.
- Latencia y throughput: no disponibles. El bucle de control opera a 30 FPS según la tasa de captura del dataset, pero no se publican métricas de latencia de inferencia ni de throughput de acciones por segundo.
- Almacenamiento: 11,5 GB para el repositorio completo de pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `elijahleo/moloact_2c_3` (esta ficha) | 5.591.928.368 | Política robótica MolmoAct2 fine-tuneada | no disponible | Apache 2.0 | Hugging Face (26 descargas) |
| MolmoAct2 (modelo base, Ai2) | no disponible | Modelo fundacional de robótica | no disponible | no disponible | Blog de Ai2 y LeRobot |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy, pi0) | no disponible | Políticas de imitación | no disponible | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre esta política y alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad. No se han publicado benchmarks que permitan establecer una jerarquía de calidad frente a otras políticas de LeRobot.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni ensayos documentados, por lo que se desconoce la fiabilidad real de la política en el robot.
- Especialización estrecha: entrenada exclusivamente para tres tareas de manipulación de hardware en un entorno de fabricación concreto; no se espera generalización a otros objetos, tareas o configuraciones de robot.
- Dependencia del montaje físico: la política asume un robot de tipo `follow` con tres cámaras en posiciones específicas (`gripper`, `newtop`, `newside`) y un vector de estado de 6 dimensiones; cambios en la cinemática, en la disposición de cámaras o en la iluminación pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset: con solo 150 episodios y 20.000 pasos de entrenamiento, es probable que la política se ajuste a las posiciones y condiciones exactas de las demostraciones; no se documenta aumento de datos ni variabilidad controlada.
- Idiomas: no se especifica qué lenguajes naturales soporta la condicionalización por instrucción; las tareas documentadas están en inglés.
- Sesgos: no se documentan análisis de sesgo. Al ser un modelo de imitación, heredará los sesgos de las demostraciones humanas (posiciones, velocidades, orden de manipulación).
- Alucinación: en el contexto robótico, el equivalente es la generación de acciones inválidas o inseguras cuando la observación se sale de la distribución de entrenamiento; no hay mecanismos de seguridad documentados.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base MolmoAct2 y las dependencias de LeRobot deben verificarse por separado; la model card no aclara la licencia del modelo base de Ai2.
- Documentación incompleta: la model card conserva secciones de plantilla sin rellenar (demo, evaluación) y no especifica arquitectura interna, contexto ni cuantizaciones soportadas.
- Repositorio de bajo uso: 26 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elijahleo/moloact_2c_3
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
