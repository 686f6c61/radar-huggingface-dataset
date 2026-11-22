# JRrobots/smolvla_so101_blocks_into_box

## Resumen

`JRrobots/smolvla_so101_blocks_into_box` es una política de visión-lenguaje-acción (VLA) afinada a partir de `lerobot/smolvla_base`, el modelo compacto SmolVLA presentado en el paper arXiv:2506.01844. La desarrolla el usuario JRrobots y está publicada en Hugging Face con licencia Apache 2.0. El modelo resuelve una tarea robótica muy concreta de manipulación: recoger un bloque (verde o azul) y depositarlo en una caja roja, usando un brazo SO-101 de tipo `so_follower` con dos cámaras (`top` y `side`).

Se trata de un fine-tuning de imitación supervisada (behavior cloning) sobre un dataset propio de 60 episodios y 20.839 fotogramas a 30 FPS, entrenado durante 20.000 pasos con batch 64, optimizador AdamW y learning rate 1e-4. El resultado es una política de 450 millones de parámetros que consume el estado articular de 6 dimensiones y tres entradas visuales de 256x256, y emite un vector de acción de 6 dimensiones.

Su relevancia radica en que demuestra el flujo completo de LeRobot para llevar un VLA compacto desde un modelo base hasta una política desplegable en hardware de consumo, con un repositorio de 13,2 GB en safetensors. No obstante, es un modelo de nicho: no es un LLM de propósito general, no procesa lenguaje libre como un chatbot y su evaluación real en robot no está publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con codificador visual y decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés: "Pick up the green block and put it in the red box.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un codificador de lenguaje y un cabezal de predicción de acciones, diseñado para inferencia en hardware de consumo. Esta instancia concreta es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el dataset `JRrobots4all/so101_blocks_into_box`. La política recibe `observation.state` de forma `(6,)`, tres cámaras de `(3, 256, 256)` y produce `action` de forma `(6,)`, correspondiente a las 6 articulaciones del brazo SO-101.

El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, batch de 64, AdamW con learning rate 1e-4 y semilla 1000. El dataset contiene 60 episodios y 20.839 fotogramas a 30 FPS, con dos tareas de instrucción en inglés (bloque verde y bloque azul hacia la caja roja). No se documentan en la model card detalles sobre composición del dataset más allá de esas cifras, ni sobre etapas de RLHF o DPO; el paradigma es imitación supervisada pura sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 dimensiones para un brazo SO-101 (`so_follower`) a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa tres flujos de imagen de 256x256 (cámaras `top`, `side` y una tercera entrada visual declarada en la model card).
- Seguimiento de instrucciones de tarea en inglés: acepta consignas como "Pick up the green block and put it in the red box." o "Pick up the blue block and put it in the red box.".
- Ejecución de políticas de imitación: reproduce secuencias de pick-and-place aprendidas de demostraciones humanas.
- Despliegue en hardware de consumo: el modelo base SmolVLA está pensado para ejecutarse en equipos asequibles, según la model card.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de control, no un LLM.

## Casos de uso

- Pick-and-place de bloques en caja: el caso de uso directo del modelo. Se ejecuta con `lerobot-rollout` sobre un SO-101 calibrado, con las cámaras en las posiciones entrenadas, y la política genera las acciones articulares para recoger el bloque y soltarlo en la caja roja.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia reproducible de un fine-tuning completo (dataset, entrenamiento, rollout) para equipos que quieran validar su cadena de herramientas antes de escalar a tareas propias.
- Investigación en VLA compactos: permite estudiar el comportamiento de SmolVLA en una tarea acotada y medir sensibilidad a cambios de iluminación, posición de objetos o distractores, ya que la model card sugiere registrar esas variaciones en la evaluación.
- Educación y demos de robótica: al ser un modelo pequeño (450 M de parámetros) y con licencia Apache 2.0, es adecuado para talleres y demostraciones docentes con hardware SO-101 de bajo coste.
- Base para fine-tuning adicional: equipos con un brazo SO-101 pueden partir de este checkpoint para adaptar la tarea (otros objetos, otras cajas) con su propio dataset, usando `lerobot-train` y `lerobot/smolvla_base` como referencia.
- Benchmark interno de robustez: al no haber evaluación publicada, un laboratorio puede usarlo como punto de partida para medir tasas de éxito en su propia configuración y comparar contra otras políticas de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía, con la nota "No evaluation results have been provided for this policy yet.", por lo que no existen tasas de éxito ni comparaciones numéricas verificables para esta política concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 450 M de parámetros, el peso en precisión completa ronda los 1,8 GB en FP32 y unos 0,9 GB en FP16, pero no se confirma el formato de despliegue ni los requisitos reales del runtime de LeRobot.
- GPU recomendadas: no disponible. La model card del modelo base SmolVLA indica que está pensado para hardware de consumo, pero no se listan modelos concretos.
- ¿Cabe en GPU de consumo? Según la descripción del modelo base, sí está diseñado para ello, aunque no se especifican modelos ni VRAM mínima para esta política afinada.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=JRrobots4all/smolvla_so101_blocks_into_box`; el entrenamiento se realiza con `lerobot-train`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible. El control se ejecuta a 30 FPS en la grabación de datos, pero no se publica latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JRrobots/smolvla_so101_blocks_into_box` | 450 M | Estado (6,) + 3 imágenes 256x256 | Pick-and-place SO-101 | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face (modelo base citado) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la información | no disponible | Imitación robótica | no disponible en la información | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Modelo de nicho: solo está entrenado para dos instrucciones concretas ("bloque verde a caja roja" y "bloque azul a caja roja") sobre un brazo SO-101; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez frente a cambios de iluminación, posición de objetos o distractores.
- Dependencia de la configuración física: las cámaras deben colocarse y nombrarse como en el entrenamiento (`top`, `side` y la tercera entrada visual), y el brazo debe estar calibrado; cualquier desviación degrada el comportamiento.
- Dataset pequeño: 60 episodios y 20.839 fotogramas es una base reducida, con riesgo de sobreajuste a las posiciones y condiciones de recogida de datos.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación en el sentido de acciones erráticas: como toda política de imitación, puede producir movimientos fuera de distribución ante observaciones no vistas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda citar el paper de SmolVLA y LeRobot según indica la model card.
- Repositorio de 13,2 GB: el tamaño del repo es notablemente superior al de los pesos (450 M de parámetros), probablemente por checkpoints y artefactos de entrenamiento; conviene revisar qué se descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JRrobots/smolvla_so101_blocks_into_box
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/JRrobots4all/so101_blocks_into_box
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JRrobots4all/so101_blocks_into_box
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
