# fysical/smolvla_rag_pick

## Resumen

`fysical/smolvla_rag_pick` es una politica robótica de tipo vision-language-action (VLA) obtenida mediante fine-tuning supervisado de `lerobot/smolvla_base`, el modelo base de la familia SmolVLA publicada por Hugging Face. El modelo no es un modelo de lenguaje de propósito general: consume observaciones multimodales de un robot (estado articular y varias cámaras) junto con una instrucción de tarea en lenguaje natural, y produce directamente comandos de acción de 6 dimensiones para un brazo seguidor SO-101 (`so_follower`). Está entrenado para una tarea concreta: coger una pelota roja, después una ámbar y después una verde, y depositarlas en una cesta negra.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, con un repositorio de 2,6 GB. Su relevancia radica en que demuestra el flujo completo de LeRobot aplicado a un caso real de manipulación multiobjeto: grabación de un dataset pequeño (25 episodios, 31.432 fotogramas a 30 FPS, unos 17,5 minutos de demostraciones), entrenamiento de 30.000 pasos y publicación del checkpoint en el Hub listo para ejecutarse con `lerobot-rollout`.

Al tratarse de una politica especializada y no de un modelo fundacional, sus capacidades están deliberadamente acotadas al entorno, al robot y a la tarea del dataset de entrenamiento. Cualquier uso fuera de ese dominio requiere volver a entrenar o afinar el modelo. El autor no ha publicado resultados de evaluación en el robot real, por lo que el rendimiento efectivo de la política no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA, fine-tuned desde `lerobot/smolvla_base`; no se detalla la composición interna (backbone de visión-lenguaje más experto de acciones) en la información disponible |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica como contexto textual de LLM. La entrada es una ventana fija de observaciones: `observation.state` de forma `(6,)` y hasta cuatro entradas visuales (`camera1`, `camera2`, `camera3` a `(3, 256, 256)` y `empty_camera_0` a `(3, 480, 640)`) más la instrucción de tarea |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos safetensors originales; no se ofrecen versiones GGUF, int8 ni int4 |
| Idiomas soportados | No disponible como listado de idiomas. La única entrada lingüística es la instrucción de tarea, que en el dataset de entrenamiento está en inglés: "Pick up the red, then amber, then green ball and place in black basket" |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`lerobot`, `safetensors`); repositorio de 2,6 GB |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras declaradas | `front`, `wrist` |
| Entrada | `observation.state` `(6,)`; `observation.images.camera1`, `camera2`, `camera3` `(3, 256, 256)`; `observation.images.empty_camera_0` `(3, 480, 640)` |
| Salida | `action` `(6,)` |
| Libreria | LeRobot 0.6.2 |
| Dataset de entrenamiento | `fysical/so101_rag_pick_20260911_130416` (25 episodios, 31.432 fotogramas, 30 FPS) |
| Fecha de creación | 2026-09-11 |

## Arquitectura y entrenamiento

SmolVLA se presenta en la model card como un modelo compacto y eficiente de visión-lenguaje-acción, con rendimiento competitivo a un coste computacional reducido y desplegable en hardware de consumo. La arquitectura concreta no se describe en detalle en la información proporcionada; se sabe que es una política condicionada por lenguaje que mapea observaciones multimodales a acciones continuas de 6 grados de libertad, y que su implementación y entrenamiento se realizan con LeRobot (versión 0.6.2 en este caso). El modelo referencia el artículo arXiv:2506.01844 como descripción del método.

El entrenamiento es de imitación supervisada sobre el dataset `fysical/so101_rag_pick_20260911_130416`: 25 episodios y 31.432 fotogramas capturados a 30 FPS, lo que equivale a unos 1.048 segundos de demostración (aproximadamente 17,5 minutos, y unos 42 segundos por episodio). La configuración declarada es de 30.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se menciona en la información disponible el uso de RLHF, DPO ni de ninguna fase de refinamiento por preferencias, algo esperable en una política de imitación. Tampoco se detalla el número de tokens o muestras visto durante el preentrenamiento del modelo base.

Un detalle relevante de la definición de entradas es la presencia de un cuarto canal visual llamado `empty_camera_0`, con resolución `(3, 480, 640)`, mientras que la model card solo declara dos cámaras físicas (`front` y `wrist`). Esto sugiere que la configuración de observaciones incluye un slot de cámara sin uso efectivo, derivado de la plantilla de grabación del dataset.

## Capacidades

- Generación de acciones robóticas continuas: produce un vector `action` de 6 dimensiones a partir del estado articular y de las imágenes, apto para controlar un brazo SO-101.
- Ejecución de tareas de manipulación guiadas por lenguaje: la instrucción de tarea se pasa como texto y condiciona el comportamiento de la política.
- Percepción visual multi-cámara: consume hasta cuatro flujos de imagen, con dos resoluciones distintas (256x256 y 480x640).
- Manipulación secuencial multiobjeto: el dataset de entrenamiento contiene una secuencia ordenada de tres objetos (rojo, ámbar, verde), por lo que la política está expuesta a una tarea con subobjetivos encadenados.
- Fusión de estado propioceptivo y visión: la entrada `observation.state` de 6 dimensiones se combina con las imágenes.
- Ejecución en bucle cerrado sobre el robot real mediante `lerobot-rollout`, con estrategia base y duración configurable.
- Reentrenamiento y fine-tuning: al derivar de `lerobot/smolvla_base`, puede reentrenarse con `lerobot-train` sobre nuevos datasets.
- Tool calling / function calling: no disponible; no es una capacidad de este tipo de modelo.
- Capacidades de agente, razonamiento multi-paso textual o matemáticas: no disponibles; el modelo no genera texto.
- Capacidades de audio, voz o visión generalista fuera del control robótico: no disponibles.

## Casos de uso

- Clasificación automatizada de objetos por color en línea de producción: la politica puede recoger objetos en una secuencia predefinida (rojo, ámbar, verde) y depositarlos en un contenedor, un patrón directamente replicable en células de triaje donde los objetos llegan en posiciones variables y el sistema debe decidir qué recoger en cada momento.
- Banco de pruebas para formación en robótica e imitación: al ser una política de 450 M de parámetros con licencia Apache 2.0 y un dataset público de 25 episodios, sirve como ejemplo didáctico reproducible del ciclo completo de LeRobot (grabar, entrenar, desplegar) en cursos y laboratorios.
- Punto de partida para fine-tuning en tareas "pick and place" propias: un equipo puede partir de este checkpoint y reentrenarlo con `lerobot-train` sobre su propio dataset para adaptarlo a otros objetos, ubicaciones o brazos SO-101.
- Automatización de tareas de recogida en almacén a pequeña escala: con una cámara frontal y una de muñeca, la política puede gestionar la retirada de piezas de una superficie y su depósito en una cesta, siempre que el dominio visual se parezca al del dataset.
- Investigación en evaluación de robustez de políticas VLA: permite medir cómo se degrada una política entrenada con 25 episodios ante cambios de iluminación, posiciones de objeto o distracciones, usando el mismo prompt y la misma configuración de cámaras.
- Prototipado rápido de demostraciones para inversores o clientes: al ejecutarse con un único comando `lerobot-rollout` y no requerir infraestructura de servidor, permite montar una demo funcional de manipulación guiada por lenguaje en hardware de consumo.
- Recogida selectiva de residuos o piezas por criterio de color: la lógica de selección secuencial del modelo es trasladable a escenarios donde hay que segregar elementos según un atributo visual antes de depositarlos en el contenedor correcto.
- Generación de datos sintéticos o aumentados para entrenamiento: la política puede usarse como etiquetadora o generadora de trayectorias candidatas que después se filtran y se incorporan a datasets de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con una plantilla vacía para tasas de éxito por tarea (número de ensayos, éxitos y porcentaje) y una nota explícita del autor: "No evaluation results have been provided for this policy yet". No se dispone, por tanto, de cifras de éxito en robot real ni de comparaciones cuantitativas con otras políticas.

| Benchmark | Resultado |
|---|---|
| Tasa de éxito en robot real (tarea pick red/amber/green) | No disponible: el autor no ha publicado resultados |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica: no es un modelo de lenguaje |
| Comparación con `lerobot/smolvla_base` en la misma tarea | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 450 M de parámetros, los pesos ocupan aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32. A esa cifra hay que sumar la memoria de activaciones y los buffers del codificador visual para cuatro entradas de imagen, por lo que una estimación razonable de uso total se sitúa en el rango de 2 a 6 GB de VRAM. Es una estimación derivada del tamaño del modelo, no una cifra confirmada por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 6-8 GB de VRAM debería ser suficiente para inferencia. El autor indica explícitamente que SmolVLA puede desplegarse en hardware de consumo.
- Cabe en GPU de consumo: sí, con alta probabilidad, en tarjetas tipo RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o superiores. No se dispone de una lista oficial de GPUs validadas.
- Despliegue: el flujo previsto es LeRobot 0.6.2 mediante `lerobot-rollout` para ejecución en el robot y `lerobot-train` para reentrenamiento, con `--policy.device=cuda`. Servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama no aplican, porque el modelo no expone una interfaz de generación de texto y su salida es un vector de acción continuo.
- Latencia y throughput: no disponibles. El dato relevante es la frecuencia de control del sistema completo (las cámaras se graban a 30 FPS en el dataset), pero el autor no publica cifras de latencia de inferencia ni de frecuencia de control efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fysical/smolvla_rag_pick` | 450 M | Estado `(6,)` y hasta 4 imagenes (256x256 y 480x640) mas instruccion de tarea | No publicado | Apache 2.0 | Hugging Face, libreria LeRobot |
| `lerobot/smolvla_base` | No disponible en la informacion proporcionada (misma familia SmolVLA) | Configuracion de observaciones del modelo base | No publicado para esta tarea concreta | Apache 2.0 | Hugging Face |
| Modelos VLA de mayor tamano (OpenVLA, pi0 y similares) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa con alternativas no puede realizarse con la información disponible: no hay resultados de éxito publicados para esta política ni datos de los otros modelos recogidos en la búsqueda. La comparación más directa y fiable es contra `lerobot/smolvla_base`, del que este modelo es un fine-tuning específico; las diferencias esperables son de especialización en la tarea, no de tamaño o arquitectura.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Pick up the red, then amber, then green ball and place in black basket") en un robot `so_follower` concreto. No generaliza a otras tareas, objetos o brazos sin reentrenamiento.
- Sin evaluación publicada: no hay ninguna tasa de éxito medida, ni en el dataset ni en el robot real. No se puede afirmar que la política funcione de forma fiable en producción.
- Dataset muy reducido: 25 episodios y unos 17,5 minutos de demostración son una base pequeña, lo que aumenta la sensibilidad a sobreajuste, a la posición inicial de los objetos y a las condiciones de iluminación.
- Dependencia estricta de la configuración de observaciones: los nombres y las formas de las claves de observación deben coincidir exactamente con los del entrenamiento (`observation.images.camera1`, `camera2`, `camera3`, `empty_camera_0`, `observation.state`). Un desajuste en los índices o nombres de cámara puede impedir la ejecución.
- Slot `empty_camera_0` sin uso aparente: aunque la model card declara solo dos cámaras físicas, la política espera una cuarta entrada visual a 480x640. Hay que reproducir esa configuración o validar cuidadosamente qué ocurre si se alimenta con datos vacíos o nulos.
- Prompt fijo en inglés: la instrucción de tarea del dataset está en inglés. No hay evidencia de soporte multilingüe ni de robustez ante variaciones de redacción del prompt.
- Riesgo de fallo físico: cualquier despliegue debe hacerse con parada de emergencia, límites de par y velocidad, y supervisión humana, especialmente en las primeras ejecuciones.
- Sin versiones cuantizadas: no se ofrecen pesos GGUF, int8 ni int4, lo que limita las opciones de optimización en hardware muy restringido.
- Licencia permisiva, pero con obligaciones de cita: Apache 2.0 permite uso comercial, pero conviene conservar los avisos de licencia y citar tanto LeRobot como el artículo SmolVLA (arXiv:2506.01844) si se usa el modelo.
- Sesgos potenciales: el dataset de demostración refleja una única disposición de objetos, un entorno concreto y el estilo de teleoperación de quien grabó los datos; la política heredará esas características.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fysical/smolvla_rag_pick
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/fysical/so101_rag_pick_20260911_130416
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fysical/so101_rag_pick_20260911_130416
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Índice general de la documentación: https://huggingface.co/docs/lerobot/index

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre SmolVLA; los enlaces anteriores proceden de la información de Hugging Face y de la model card del autor.
