# JRrobots4all/smolvla_so101_blocks_into_box

## Resumen

`JRrobots4all/smolvla_so101_blocks_into_box` es una política de visión-lenguaje-acción (VLA) compacta obtenida por ajuste fino de `lerobot/smolvla_base`, el modelo base de SmolVLA publicado por Hugging Face. Está entrenada para una tarea concreta de manipulación robótica con el brazo SO-101: recoger un bloque (verde o azul) y depositarlo en una caja roja. El modelo consume el estado articular del robot y tres flujos de imagen de 256×256 píxeles, y produce un vector de acción de 6 dimensiones a 30 FPS.

Con 450 millones de parámetros, el modelo se enmarca en la filosofía de SmolVLA: alcanzar un rendimiento competitivo en control robótico con un coste computacional reducido, de modo que pueda ejecutarse en hardware de consumo en lugar de requerir clústeres de GPU. Es relevante para quienes trabajan en imitación robótica de bajo coste, ya que demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue) sobre una plataforma accesible como el SO-101.

El repositorio tiene un tamaño de 13,2 GB pese a los 450 M de parámetros, lo que sugiere que incluye checkpoints intermedios del entrenamiento además de los pesos finales. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el modelo está especializado en una única tarea y no es un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con codificador visual y cabeza de acciones |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control por pasos, sin ventana de contexto textual declarada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés: "Pick up the green block and put it in the red box.") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Cámaras de entrada | top, side (tres flujos visuales de 3×256×256) |
| Dimensión de estado | 6 |
| Dimensión de acción | 6 |
| Frecuencia de control | 30 FPS |
| Librería | lerobot (versión 0.6.2) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un modelo de visión-lenguaje-acción compacto que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones. Procesa observaciones multimodales (tres cámaras a 256×256 y un vector de estado de 6 dimensiones) junto con una instrucción en lenguaje natural, y emite directamente un vector de acción de 6 dimensiones. No se dispone de detalles adicionales sobre el número de capas, dimensiones ocultas o mecanismos de atención en la información proporcionada.

El ajuste fino se realizó sobre el dataset `JRrobots4all/so101_blocks_into_box`, compuesto por 60 episodios y 20.839 fotogramas grabados a 30 FPS. Las tareas cubiertas son dos: recoger el bloque verde y recoger el bloque azul, en ambos casos depositándolo en la caja roja. El entrenamiento se ejecutó durante 20.000 pasos con batch size 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, usando LeRobot 0.6.2. No se especifica si hubo RLHF, DPO ni otras fases de alineación, algo esperable en un modelo de imitación.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 grados de libertad para el brazo SO-101 a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: integra tres flujos de imagen simultáneos (vistas superior y lateral) para localizar objetos.
- Seguimiento de instrucciones en lenguaje natural: acepta la tarea como texto ("Pick up the green block and put it in the red box." o la variante con bloque azul).
- Ejecución de políticas de imitación en tiempo real a 30 FPS.
- Despliegue en hardware de consumo, según la descripción del modelo base SmolVLA.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de audio.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger un bloque y depositarlo en una caja, útil para validar pipelines de imitación antes de escalar a tareas más complejas.
- Prototipado rápido de políticas con LeRobot: sirve como referencia de un ajuste fino completo (60 episodios, 20.000 pasos) para equipos que quieran replicar el flujo con sus propios datos.
- Docencia e investigación en VLA: al ser un modelo pequeño con licencia permisiva, es adecuado para experimentos académicos sobre generalización, robustez a cambios de iluminación o posiciones de objetos.
- Benchmark de hardware de bajo coste: permite medir latencia y throughput de una política VLA de 450 M de parámetros en GPUs de consumo o incluso en dispositivos embebidos.
- Base para ajuste fino en tareas relacionadas: al derivar de `lerobot/smolvla_base`, puede reentrenarse con nuevos datasets de manipulación manteniendo la arquitectura.
- Pruebas de integración con el brazo SO-101: valida el cableado, la calibración de cámaras y la configuración de `lerobot-rollout` en un montaje físico real.
- Generación de datos sintéticos de evaluación: la política puede emplearse como baseline para comparar nuevas políticas sobre el mismo conjunto de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de tasas de éxito en robot real, ni de métricas en MMLU, HumanEval, GSM8K u otros benchmarks estándar, que además no aplicarían directamente a un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 M de parámetros en FP32, los pesos ocupan aproximadamente 1,8 GB; en FP16, unos 0,9 GB. A ello hay que sumar el codificador visual y los buffers de las tres cámaras de 256×256.
- GPU recomendadas: no especificadas en la información proporcionada. El modelo base SmolVLA se describe como desplegable en hardware de consumo, por lo que una GPU consumer con 8 GB o más debería ser suficiente.
- Compatibilidad con GPU de consumo: probable según la descripción del modelo base, aunque no se confirma con cifras concretas para esta política.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (comando documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para políticas de control robótico.
- Latencia y throughput: la política opera a 30 FPS según la configuración del dataset; no se proporcionan cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_blocks_into_box | 450 M | no disponible | Pick-and-place SO-101 (2 tareas) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para ajuste fino | no disponible en la información | Hugging Face |
| Políticas ACT de LeRobot | no disponible en la información | no disponible | Imitación robótica | no disponible en la información | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible en la información | no disponible | Imitación robótica | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a la categoría (políticas de imitación para brazos robóticos de bajo coste) y a la disponibilidad pública.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para dos tareas concretas (bloque verde o azul a caja roja) y no generalizará a otros objetos, contenedores o disposiciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posiciones iniciales o distracciones.
- Dependencia del montaje físico: requiere el brazo SO-101, las cámaras con los nombres `top` y `side`, y la calibración exacta usada durante la grabación; pequeñas variaciones pueden degradar el rendimiento.
- Dataset pequeño: 60 episodios y 20.839 fotogramas es un volumen reducido, lo que aumenta el riesgo de sobreajuste a las condiciones de recogida.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación en el sentido de acciones erráticas: como toda política de imitación, puede producir movimientos no deseados ante observaciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Tamaño del repositorio: 13,2 GB frente a los ~1,8 GB de pesos en FP32, lo que sugiere checkpoints intermedios y aumenta los requisitos de almacenamiento.
- Sin información sobre cuantización: no se documentan versiones GGUF ni INT8, lo que limita el despliegue en dispositivos de muy baja potencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JRrobots4all/smolvla_so101_blocks_into_box
- Dataset de entrenamiento: https://huggingface.co/datasets/JRrobots4all/so101_blocks_into_box
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JRrobots4all/so101_blocks_into_box
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
