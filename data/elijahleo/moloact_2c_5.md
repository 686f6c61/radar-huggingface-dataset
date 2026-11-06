# elijahleo/moloact_2c_5

## Resumen

MolmoAct2 es un modelo fundacional de robótica desarrollado por el Allen Institute for AI (Ai2) que mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones de robot (action chunks). Esta ficha concreta, `elijahleo/moloact_2c_5`, es un fine-tuning del modelo base realizado por el usuario elijahleo mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica del mundo real. El modelo consume tres vistas de cámara (gripper, top y side) a 480x640 píxeles más el estado del robot de 6 dimensiones, y produce acciones de 6 dimensiones.

El modelo está especializado en tareas de manipulación de hardware en un contexto de fabricación: recoger piezas de un operario humano, clasificar tuercas y tornillos en recipientes de colores y depositar componentes en una zona delimitada. Se entrenó sobre un dataset de 150 episodios y 218.964 fotogramas a 30 FPS, con 20.000 pasos de entrenamiento y batch size de 8.

Con 5.591.928.368 parámetros (aproximadamente 5,6 mil millones) y un repositorio de 11,5 GB en formato safetensors, este modelo es relevante para quienes investigan políticas visomotoras de gran escala aplicadas a robótica de manipulación, aunque su naturaleza de fine-tuning específico limita su generalidad frente al MolmoAct2 base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política visomotora MolmoAct2 sobre LeRobot) |
| Parametros totales | 5.591.928.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MolmoAct2 más allá de que se trata de una política robótica que mapea observaciones multimodales (tres imágenes de cámara y un vector de estado) a acciones. La implementación utilizada es la de LeRobot, que soporta entrenamiento y evaluación del modelo MolmoAct2 regular. El modelo consume `observation.state` de forma `(6,)`, tres imágenes `observation.images.gripper`, `observation.images.newtop` y `observation.images.newside` de forma `(3, 480, 640)`, y produce una acción de forma `(6,)`.

El entrenamiento se realizó mediante aprendizaje por imitación sobre el dataset `manufacturing_finetune`, compuesto por 150 episodios y 218.964 fotogramas a 30 FPS. Las tareas del dataset son "Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket" y "Put all hardware in bucket". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot versión 0.6.1. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un modelo de robótica por imitación.

## Capacidades

- Generación de secuencias de acciones robóticas (action chunks) de 6 dimensiones a partir de observaciones visomotoras.
- Percepción multimodal mediante tres cámaras simultáneas (gripper, vista superior y vista lateral) a resolución 480x640.
- Seguimiento de instrucciones en lenguaje natural para tareas de manipulación (las tres tareas del dataset de entrenamiento).
- Manipulación de objetos pequeños (tuercas, tornillos, hardware) y clasificación en recipientes.
- Interacción humano-robot para recepción de piezas de un operario.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con duración configurable.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni procesamiento de audio.

## Casos de uso

- Clasificación de componentes en línea de montaje: el modelo puede recoger tuercas y tornillos y depositarlos en recipientes codificados por color (rojo para tuercas, azul para tornillos), usando las tres cámaras para localizar las piezas y el estado del gripper para confirmar la aprehensión.
- Recepción de piezas de un operario humano: la política está entrenada específicamente para "Take hardware from human and put in taped area", lo que permite integrarla en estaciones de trabajo colaborativas donde el humano entrega componentes y el robot los coloca en una zona delimitada.
- Clasificación y depósito en contenedores: la tarea "Put all hardware in bucket" permite usar el modelo para tareas de recogida y depósito en lote, útil en operaciones de kitting o preparación de pedidos.
- Automatización de células de fabricación de bajo volumen: al ser un fine-tuning sobre un dataset pequeño (150 episodios), sirve como plantilla para replicar el flujo de entrenamiento con datos propios de una célula concreta.
- Investigación en aprendizaje por imitación: el modelo es un punto de partida reproducible para estudiar el efecto del número de cámaras, la resolución y el número de episodios en el rendimiento de políticas visomotoras.
- Prototipado rápido en robótica de manipulación: gracias a la integración con LeRobot, se puede desplegar con `lerobot-rollout` en un robot de tipo `follow` y evaluar en cuestión de minutos con la CLI documentada.
- Benchmark de referencia para fine-tunings de MolmoAct2: permite comparar configuraciones de entrenamiento (pasos, learning rate, batch size) sobre una misma tarea de manipulación de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 5,6 mil millones de parámetros en fp16 requiere aproximadamente 11,2 GB solo para los pesos, más memoria para activaciones y procesamiento de tres flujos de imagen a 480x640; en fp32 ascendería a unos 22,4 GB. Estas cifras son estimaciones genéricas y no están confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con al menos 16-24 GB de VRAM (RTX 4090, A100 40GB, H100) sería el rango esperable para inferencia en fp16, aunque no está confirmado.
- Compatibilidad con GPU de consumo: no confirmada. Una RTX 4090 (24 GB) podría alojar los pesos en fp16, pero el procesamiento de tres cámaras simultáneas añade carga que el autor no documenta.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable al tratarse de una política robótica y no de un LLM.
- Latencia y throughput: no disponibles. El modelo opera a 30 FPS en el dataset de entrenamiento, pero no se documenta la latencia de inferencia real en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| elijahleo/moloact_2c_5 | 5.591.928.368 | no disponible | apache-2.0 | Hugging Face (24 descargas) | Fine-tuning de MolmoAct2 sobre manufacturing_finetune |
| MolmoAct2 (base, Ai2) | no disponible | no disponible | no disponible en esta ficha | Blog de Ai2 | Modelo fundacional original; esta ficha es un fine-tuning |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | no disponible | Hugging Face / LeRobot | Alternativas de la misma librería; no se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está fine-tuneado para tres tareas concretas de manipulación de hardware; su generalización a otras tareas, objetos o entornos no está validada.
- Sin evaluación publicada: no hay tasas de éxito ni ensayos documentados, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia del entorno de entrenamiento: las cámaras deben coincidir en nombre y configuración con las observaciones de entrenamiento (`gripper`, `newtop`, `newside` a 480x640 y 30 FPS); cambios de iluminación, posiciones de objetos o un robot distinto del tipo `follow` pueden degradar el rendimiento.
- Riesgo de sobreajuste: 150 episodios y 20.000 pasos de entrenamiento sobre un modelo de 5,6 mil millones de parámetros sugieren un riesgo elevado de sobreajuste al dataset específico.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de tarea están en inglés.
- Sesgos: no documentados por el autor; al entrenarse con datos de un entorno de fabricación concreto, puede heredar sesgos de ese entorno (posiciones, colores, tipos de pieza).
- Alucinación: en el contexto robótico, el equivalente es la generación de acciones no válidas o inseguras; no se documentan mecanismos de seguridad.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base MolmoAct2 y del dataset `manufacturing_finetune` por separado.
- Repositorio pequeño y reciente: 24 descargas y 0 likes en el momento de la consulta; sin comunidad que valide resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elijahleo/moloact_2c_5
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_finetune
