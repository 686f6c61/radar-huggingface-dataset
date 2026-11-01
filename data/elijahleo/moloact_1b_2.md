# elijahleo/moloact_1b_2

## Resumen

MolmoAct2 es un modelo fundacional abierto para robótica desarrollado por el Allen Institute for AI (Ai2) que mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones motoras (action chunks). El modelo aquí presentado, `elijahleo/moloact_1b_2`, es un fine-tuning concreto del MolmoAct2 entrenado mediante la librería LeRobot de Hugging Face sobre un dataset de manipulación industrial (`manufacturing_level_2`), y publicado en el Hub bajo licencia Apache 2.0. El repositorio contiene 5.591.928.368 parámetros en formato safetensors (11,5 GB), lo que corresponde a la variante de aproximadamente 1B de parámetros del modelo base, adaptada a una tarea específica de clasificación y manipulación de tornillería en un entorno de fabricación.

El modelo resuelve el problema de control robótico guiado por lenguaje: dado un estado articular de 6 dimensiones y tres flujos de vídeo (cámara de pinza, vista superior y vista lateral, todas a 480x640 y 30 FPS), produce un vector de acción de 6 dimensiones. Es relevante porque demuestra el flujo completo de fine-tuning de un modelo fundacional robótico open source sobre datos propios con LeRobot 0.6.1, un patrón cada vez más habitual para prototipado rápido en robótica industrial y de investigación.

La ficha se basa exclusivamente en la información pública disponible en el repositorio de Hugging Face; no se han publicado resultados de evaluación ni detalles internos de la arquitectura más allá de la referencia al modelo base MolmoAct2 de Ai2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo fundacional visión-lenguaje-acción para robótica); implementación LeRobot |
| Parametros totales | 5.591.928.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 11,5 GB) |

## Arquitectura y entrenamiento

El modelo se basa en MolmoAct2, un modelo fundacional robótico de Ai2 que transforma observaciones visuales e instrucciones en lenguaje en chunks de acciones. La implementación concreta en este repositorio sigue el pipeline de LeRobot (`policy.type=molmoact2`) y ha sido entrenada con la versión 0.6.1 de la librería. Las entradas son el estado del robot (`observation.state`, vector de 6 dimensiones) y tres cámaras (`gripper`, `newtop`, `newside`) con imágenes RGB de 3x480x640; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó sobre el dataset `manufacturing_level_2`, compuesto por 900 episodios y 893.362 fotogramas a 30 FPS, con 18 tareas distintas de manipulación de tornillería (tornillos, tuercas, arandelas, muelles y pernos). La configuración reportada es de 60.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se detalla en la información disponible la composición del dataset de preentrenamiento del modelo base ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas a partir de imágenes de cámara e instrucciones en lenguaje natural (visión-lenguaje-acción).
- Control de manipulación de objetos con un robot de tipo `follow` y efector final con pinza.
- Ejecución de tareas de clasificación y colocación de piezas (tornillos, tuercas, pernos, muelles) en contenedores o zonas delimitadas.
- Interacción con operarios humanos en tareas específicas ("take bolt from human and put it in bucket", "pick up a galvanized bolt and give it to human").
- Procesamiento multi-cámara sincronizado (tres vistas simultáneas a 30 FPS).
- Soporte de instrucciones de tarea en lenguaje natural durante la inferencia mediante el parámetro `--task`.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades multilingües o modos de pensamiento, ya que se trata de un modelo de política robótica, no de un LLM conversacional.

## Casos de uso

- Clasificación automatizada de tornillería en línea de fabricación: el modelo ejecuta instrucciones como "Put all exterior coated screws in bucket" recibiendo las tres vistas de cámara y el estado articular, adecuado por su entrenamiento específico sobre 900 episodios de este dominio.
- Alimentación de contenedores en células de montaje: tareas como "Put all galvanized nuts in bucket" o "Put all hex bolts in bucket" se pueden lanzar como comandos de tarea con `lerobot-rollout` y una duración acotada.
- Separación de piezas por zona designada: instrucciones como "Put all screws in the right taped area" o "Remove all springs from the taped area" aprovechan la percepción multi-cámara para localizar zonas delimitadas físicamente.
- Colaboración humano-robot en estación de trabajo: la política incluye tareas de entrega y recepción de piezas ("take bolt from human and put it in bucket", "pick up a galvanized bolt and give it to human"), útil en entornos colaborativos donde el operario suministra piezas manualmente.
- Base para fine-tuning en nuevos dominios de manipulación: al ser un modelo MolmoAct2 con licencia Apache 2.0 y pipeline LeRobot documentado, sirve como punto de partida para reentrenar con `lerobot-train` sobre datasets propios de otras tareas de picking.
- Prototipado e investigación en imitación robótica: permite reproducir el flujo completo (grabación de datos, entrenamiento, rollout) con la CLI de LeRobot, útil para validar políticas visión-lenguaje-acción antes de escalar a producción.
- Evaluación comparativa de políticas robóticas: al estar publicado en el Hub con configuración de entrenamiento explícita (60k pasos, batch 8, lr 1e-5), facilita la reproducibilidad y la comparación con otras políticas LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real para esta política ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 5,59 mil millones de parámetros en safetensors, una estimación orientativa en fp16 rondaría los 11-12 GB de pesos, más el overhead de las tres cámaras y el procesamiento visual; en fp32 superaría los 22 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con al menos 16-24 GB de VRAM (RTX 4090, A100, H100) sería el rango razonable para fp16, pero no está confirmado.
- Compatibilidad con GPU de consumo: no confirmada; dependerá de la cuantización disponible, que no se detalla.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para reentrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El modelo opera a 30 FPS en el dataset de entrenamiento, pero no se reporta latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elijahleo/moloact_1b_2 | 5,59 B | no disponible | Política robótica visión-lenguaje-acción (manipulación industrial) | Apache 2.0 | Hugging Face Hub |
| MolmoAct2 (base, Ai2) | no disponible en esta ficha | no disponible | Modelo fundacional robótico visión-lenguaje-acción | no disponible en esta ficha | Blog de Ai2 y Hub |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | variable | no aplica | Políticas de imitación robótica | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito de la política en las tareas entrenadas.
- El modelo está entrenado sobre un dataset muy específico (`manufacturing_level_2`) con 18 tareas de tornillería; es probable que generalice mal fuera de ese dominio, objetos y configuraciones de cámara.
- La configuración de cámaras es fija (`gripper`, `newtop`, `newside` a 480x640 y 30 FPS); cambios en nombres, resolución o montaje pueden degradar o invalidar la política.
- El robot de destino es de tipo `follow` con estado de 6 dimensiones y acción de 6 dimensiones; no es portable directamente a otras morfologías sin reentrenamiento.
- Riesgo de alucinación de acciones: como toda política de imitación, puede producir trayectorias no válidas ante distribuciones de entrada no vistas (iluminación, posiciones de objetos, distracciones).
- Sesgos conocidos: no documentados en la información disponible; el dataset de fabricación puede introducir sesgos hacia posiciones, colores y tipos de pieza concretos.
- Idiomas: las instrucciones del dataset están en inglés; no se declara soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar en entorno controlado antes de desplegar en producción.
- La model card indica que se ejecute con `--duration` acotado, ya que sin él la política se ejecuta indefinidamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elijahleo/moloact_1b_2
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía LeRobot MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset `manufacturing_level_2`: https://huggingface.co/datasets/manufacturing_level_2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_level_2
