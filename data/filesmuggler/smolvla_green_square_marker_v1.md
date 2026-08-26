# filesmuggler/smolvla_green_square_marker_v1

## Resumen

Este modelo es un fine-tune de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, adaptado por el usuario filesmuggler (Kris Stezala) para una tarea de manipulación robótica concreta: agarrar un marcador verde y colocarlo en una caja verde. El modelo se ha entrenado con LeRobot, la librería de aprendizaje por imitación de Hugging Face, sobre un dataset propio de 80 episodios capturados con un robot tipo `so_follower` y dos cámaras.

La relevancia de este modelo reside en que demuestra cómo un VLA compacto y eficiente puede ajustarse a una tarea específica con un conjunto de datos pequeño (80 episodios) y un entrenamiento breve (100 pasos), lo que lo hace accesible para laboratorios y desarrolladores con recursos limitados. Al estar basado en SmolVLA, hereda su diseño orientado a hardware de consumo, aunque este fine-tune concreto no incluye resultados de evaluación publicados.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el modelo se distribuye en formato safetensors a través del Hub de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo de visión-lenguaje-acción) |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No disponible (modelo de robótica, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de visión-lenguaje-acción desarrollado por Hugging Face que combina un codificador visual con un transformador de lenguaje para generar acciones de control robótico. El modelo base `lerobot/smolvla_base` ya ha sido preentrenado en tareas generales de manipulación, y este fine-tune lo adapta a una tarea específica mediante aprendizaje por imitación. El entrenamiento se realizó con el pipeline de LeRobot, usando un dataset propio de 80 episodios con 34.874 frames a 30 FPS, capturados con un robot `so_follower` y dos cámaras (top y wrist). La configuración de entrenamiento incluye 100 pasos, batch size de 16, optimizador AdamW, learning rate 0.0001 y semilla 1000. No se mencionan técnicas de RLHF o DPO; se trata de un aprendizaje supervisado de imitación.

## Capacidades

- Control de un robot `so_follower` con 6 grados de libertad (acción de 6 dimensiones).
- Procesamiento de entradas multimodales: imágenes de hasta 3 cámaras (256x256) y estado del robot (6 valores).
- Ejecución de la tarea específica "Grab green marker and put it in the green box".
- Generación de acciones de control en tiempo real (30 FPS).
- No soporta tool calling, razonamiento multi-paso ni capacidades de lenguaje natural; es un policy de robótica puro.

## Casos de uso

- Automatización de tareas de recogida y colocación en entornos industriales: el modelo puede controlar un brazo robótico para manipular objetos específicos (en este caso, un marcador verde) y colocarlos en una ubicación determinada, lo que es útil en líneas de montaje o clasificación.
- Prototipado rápido de políticas robóticas con LeRobot: los desarrolladores pueden usar este modelo como punto de partida para adaptar SmolVLA a nuevas tareas con pocos datos, gracias a su entrenamiento de solo 100 pasos.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tune de un VLA compacto con un dataset pequeño, útil para estudiar la generalización y el sobreajuste.
- Control de robots en laboratorio para experimentos de manipulación: el modelo se puede ejecutar en un robot `so_follower` conectado a una computadora con GPU, permitiendo probar comportamientos de agarre y colocación.
- Integración en sistemas de visión robótica con cámaras múltiples: su entrada acepta hasta 3 cámaras, lo que facilita la percepción desde ángulos superiores y de muñeca.
- Base para desarrollo de tareas similares: el modelo puede adaptarse a otras tareas de "agarrar y colocar" cambiando el dataset y re-entrenando con LeRobot, gracias a su licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica explícitamente que no se proporcionan resultados de evaluación en el robot real. Los benchmarks del modelo base SmolVLA pueden consultarse en el paper asociado (arxiv:2506.01844), pero no se incluyen aquí para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada: no disponible para este fine-tune específico. Dado el tamaño de 450 M parámetros, se estima que en FP32 ocuparía unos 1,5 GB solo de pesos, pero con las entradas de imagen y las activaciones, se necesitaría al menos 4 GB de VRAM. Sin embargo, no hay datos oficiales.
- GPU recomendadas: el modelo base SmolVLA está diseñado para hardware de consumo; una GPU como la RTX 3060 (12 GB) o RTX 4090 sería suficiente. No se indican GPUs específicas para este fine-tune.
- Compatibilidad con GPU de consumo: sí, probablemente cabe en GPU de gama media y alta, pero no hay confirmación.
- Opciones de despliegue: se puede ejecutar mediante LeRobot (comando `lerobot-rollout`) sobre el robot físico. No se mencionan herramientas como vLLM u Ollama porque es un modelo de robótica, no de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Formato |
|---|---|---|---|---|
| filesmuggler/smolvla_green_square_marker_v1 | 450 M | Agarrar y colocar marcador verde | Apache 2.0 | safetensors |
| filesmuggler/act-blue-square-marker | 51,7 M | Agarrar y colocar marcador azul | Apache 2.0 | safetensors |
| lerobot/smolvla_base | 450 M | Modelo base general VLA | Apache 2.0 | safetensors |

El modelo es un fine-tune del modelo base `lerobot/smolvla_base`, por lo que su comparación principal es con ese modelo base. El otro modelo del mismo autor, `act-blue-square-marker`, es un policy de menor tamaño (51,7 M) basado en una arquitectura distinta (ACT) para una tarea similar. No se dispone de más modelos comparables en la información.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (80 episodios, 34.874 frames), lo que puede provocar sobreajuste a las condiciones específicas de la captura (posición de la cámara, iluminación, etc.).
- El modelo solo está entrenado para una tarea concreta (marcador verde en caja verde) y no generaliza a otros objetos o colores sin un nuevo fine-tune.
- No se han publicado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito real.
- El modelo no tiene capacidades de lenguaje natural ni de razonamiento; solo produce acciones de control.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el modelo en el entorno real antes de producción.
- No se especifica el número de parámetros activos ni la arquitectura interna exacta más allá de lo indicado en el paper de SmolVLA.

## Enlaces

- Repositorio del modelo: https://huggingface.co/filesmuggler/smolvla_green_square_marker_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/filesmuggler/markers-experiment-green-merged
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- LeRobot (documentación): https://huggingface.co/docs/lerobot/index
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Perfil del autor: https://huggingface.co/filesmuggler</think>## Resumen

Este modelo es un fine-tune de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face. El autor, filesmuggler (Kris Stezala), ha adaptado el modelo base `lerobot/smolvla_base` mediante LeRobot para una tarea concreta de manipulación robótica: agarrar un marcador verde y colocarlo en una caja verde. El entrenamiento se realizó sobre un dataset propio de 80 episodios capturados con un robot `so_follower` y dos cámaras.

La relevancia de este modelo reside en su demostración de cómo un VLA compacto puede ajustarse a una tarea específica con pocos datos y un entrenamiento breve (100 pasos), lo que lo hace accesible para laboratorios y desarrolladores con recursos limitados. Al estar basado en SmolVLA, hereda su diseño eficiente para hardware de consumo, aunque este fine-tune no incluye resultados de evaluación publicados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el modelo está disponible en formato safetensors en el Hub de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, basado en SmolVLM) |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No disponible (modelo de robótica, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto diseñado por Hugging Face para control robótico eficiente. Combina un codificador visual con un modelo de lenguaje ligero para producir acciones de control directamente desde observaciones de imágenes y estado del robot. El modelo base `lerobot/smolvla_base` está preentrenado en tareas generales de manipulación, y este fine-tune lo adapta a una tarea específica mediante aprendizaje por imitación.

El entrenamiento se realizó con LeRobot, utilizando el dataset `filesmuggler/markers-experiment-green-merged` con 80 episodios y 34.874 frames a 30 FPS. La configuración de entrenamiento incluye 100 pasos, batch size 16, optimizador AdamW, learning rate 0.0001 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje supervisado de imitación. Las entradas del modelo son imágenes de 256×256 de tres cámaras (top, wrist y una tercera) más una imagen de 480×640 de una cámara vacía, junto con el estado del robot (6 dimensiones). La salida es una acción de 6 grados de libertad.

## Capacidades

- Control de un robot `so_follower` con 6 grados de libertad (acción de 6 dimensiones).
- Procesamiento de imágenes multimodales de hasta 3 cámaras (256×256) y una imagen adicional de 480×640.
- Ejecución de la tarea específica: "Grab green marker and put it in the green box".
- Generación de acciones de control en tiempo real (30 FPS).
- No soporta tool calling, razonamiento multi-paso ni procesamiento de lenguaje natural; es un policy de robótica puro.
- Capacidad multilingüe no aplicable (no procesa texto).

## Casos de uso

- Automatización de tareas de recogida y colocación en entornos industriales: el modelo puede controlar un brazo robótico para agarrar objetos específicos (marcador verde) y colocarlos en una posición determinada, útil en líneas de clasificación o ensamblaje.
- Prototipado rápido de políticas robóticas: gracias a su pequeño dataset de entrenamiento y breve ajuste, puede servir como base para desarrollar nuevas tareas con LeRobot sin necesidad de grandes infraestructuras.
- Investigación en aprendizaje por imitación: permite estudiar el efecto de fine-tuning de un VLA compacto con pocos datos, comparando con modelos más grandes.
- Demostraciones en laboratorio de robótica: el modelo puede ejecutarse en un robot `so_follower` para mostrar capacidades de manipulación en entornos de investigación.
- Integración en sistemas de visión y control de robots con múltiples cámaras: acepta tres cámaras simultáneas, lo que permite percepción desde ángulos superiores y de muñeca.
- Base para experimentos de generalización de objetos: aunque el modelo está entrenado para un marcador verde, puede ser re-entrenado con datasets similares para otros colores u objetos usando LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no hay resultados de evaluación en robot real. Los benchmarks del modelo base SmolVLA pueden consultarse en el paper (arXiv:2506.01844), pero no se han proporcionado datos para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada: no disponible para este fine-tune específico. Dado el tamaño de 450 M parámetros, se estima que la inferencia en FP32 requeriría unos 1,5 GB solo para los pesos, pero con imágenes y activaciones se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: el modelo base SmolVLA está diseñado para hardware de consumo; una GPU como la RTX 3060 (12 GB) o RTX 4090 sería adecuada. No hay especificaciones oficiales para este fine-tune.
- Compatibilidad con consumer GPU: sí, probablemente, pero no está confirmado para este modelo.
- Opciones de despliegue: se puede ejecutar mediante LeRobot (comando `lerobot-rollout`). No se mencionan vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Formato |
|---|---|---|---|---|
| filesmuggler/smolvla_green_square_marker_v1 | 450 M | VLA (agarrar y colocar marcador verde) | Apache 2.0 | safetensors |
| filesmuggler/act-blue-square-marker | 51,7 M | VLA (agarrar y colocar marcador azul) | Apache 2.0 | safetensors |
| lerobot/smolvla_base | 450 M | VLA general (preentrenado) | Apache 2.0 | safetensors |

El modelo es un ajuste fino de `lerobot/smolvla_base`, por lo que su comparación principal es con ese modelo base. El otro modelo del mismo autor, `act-blue-square-marker`, es más pequeño (51,7 M) y usa una arquitectura distinta (ACT) para una tarea similar. No se dispone de más modelos comparables en la información.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (80 episodios, 34.874 frames), lo que puede provocar sobreajuste a las condiciones específicas de iluminación, posición de cámara y entorno.
- El modelo está entrenado solo para una tarea concreta (marcador verde en caja verde) y no generaliza a otros objetos o colores sin un nuevo entrenamiento.
- No se han publicado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito en el mundo físico.
- El modelo no tiene capacidades de lenguaje natural ni de razonamiento; solo produce acciones de control.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento en el entorno real antes de producción.
- No se indica el número de parámetros activos ni la arquitectura interna exacta (más allá de la referencia al paper de SmolVLA).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/filesmuggler/smolvla_green_square_marker_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/filesmuggler/markers-experiment-green-merged
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Perfil del autor: https://huggingface.co/filesmuggler
