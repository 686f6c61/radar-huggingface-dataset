# hubnemo/so101_smolvla_exp06_fixed_bs16_steps15k_r16_a32

## Resumen

Este repositorio contiene una política de visión-lenguaje-acción (VLA) denominada `so101_smolvla_exp06_fixed_bs16_steps15k_r16_a32`, publicada por el usuario `hubnemo` en Hugging Face. Se trata de un ajuste fino (adapter) del modelo base `lerobot/smolvla_base`, entrenado con la librería LeRobot 0.7.1 sobre el conjunto de datos `Orellius/so101_sort_cubes_no_top`. Su propósito es controlar un brazo robótico de tipo `so101_follower` equipado con una única cámara frontal, ejecutando la tarea de recoger un cubo morado y depositarlo en una caja de cartón.

El modelo se enmarca en la familia SmolVLA, presentada en el artículo arXiv 2506.01844, que describe un VLA compacto y eficiente pensado para ejecutarse en hardware de consumo. Frente a los VLA de gran escala, SmolVLA reduce el coste computacional manteniendo un rendimiento competitivo en tareas de manipulación, lo que lo hace atractivo para prototipado rápido en robótica de bajo coste.

La relevancia de esta ficha concreta es limitada: se trata de un experimento de ajuste fino con cero descargas y cero interacciones en el momento de la consulta, sin resultados de evaluación publicados y con el repositorio vacío (0,0 GB), lo que sugiere que los pesos podrían no estar efectivamente subidos o que el autor no ha completado la publicación. Aun así, documenta el flujo de trabajo típico de LeRobot para entrenar políticas VLA sobre robots SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), según la familia descrita en arXiv 2506.01844 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según etiquetas del repositorio), librería LeRobot |
| Modelo base | lerobot/smolvla_base (relación: adapter) |
| Tipo de robot | so101_follower |
| Cámaras | front (una sola) |
| Entrada de estado | observation.state, forma (6,) |
| Entrada visual | observation.images.front, forma (3, 480, 640) |
| Salida | action, forma (6,) |
| Tamaño del repositorio | 0,0 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolVLA, un modelo de visión-lenguaje-acción compacto que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para mapear observaciones (imagen y estado proprioceptivo) a comandos motores de 6 dimensiones. El modelo base `lerobot/smolvla_base` se ajusta mediante aprendizaje por imitación supervisado sobre trayectorias de demostración, sin que la model card indique el uso de RLHF, DPO ni refuerzo por recompensa.

El ajuste fino se realizó durante 15 000 pasos con tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, usando LeRobot 0.7.1. El conjunto de entrenamiento `Orellius/so101_sort_cubes_no_top` contiene 77 episodios y 54 777 fotogramas a 30 FPS, con una única instrucción de tarea en inglés: "Grab the purple cube and put it into the cardboard box, ignore the other objects". No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para un brazo SO-101 a partir de una imagen frontal y del estado articular.
- Ejecución de una tarea concreta de pick-and-place: recoger un cubo morado e introducirlo en una caja de cartón, ignorando otros objetos.
- Condicionamiento por instrucción en lenguaje natural: acepta la descripción de la tarea como texto de condicionamiento.
- Percepción visual monocámara: procesa imágenes de 480x640 píxeles a 30 FPS.
- Aprendizaje por imitación: reproduce comportamientos derivados de demostraciones humanas.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto libre, visión general, audio ni modo de pensamiento.

## Casos de uso

- Prototipado de pick-and-place en laboratorio: el modelo permite validar rápidamente una política de agarre y colocación sobre un SO-101 real usando `lerobot-rollout` con la tarea predefinida, sin necesidad de reentrenar desde cero.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de hiperparámetros (pasos, batch size, semilla) sobre el rendimiento de SmolVLA en tareas de manipulación sencillas.
- Reproducción de experimentos: al fijar semilla 1000 y configuración concreta, facilita la replicación de resultados en entornos controlados con el mismo dataset.
- Automatización de tareas de clasificación de objetos: la instrucción "ignore the other objects" permite usarlo en escenarios donde hay distractores y se requiere seleccionar un objeto diana por color.
- Base para ajuste fino adicional: al ser un adapter sobre `lerobot/smolvla_base`, puede reutilizarse como inicialización para nuevas tareas con datasets propios mediante `lerobot-train`.
- Docencia y formación en robótica: ilustra el flujo completo de LeRobot (grabación, entrenamiento, despliegue) con un caso acotado y reproducible en hardware de bajo coste.
- Validación de pipelines de inferencia: útil para probar la integración de LeRobot con distintos puertos y cámaras antes de desplegar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros totales ni cuantizaciones).
- GPU recomendadas: no disponible. La familia SmolVLA se describe como desplegable en hardware de consumo, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: probable según la descripción genérica de SmolVLA, pero sin confirmación específica para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas VLA de robótica.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset, pero no se confirma que la política alcance esa frecuencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hubnemo/so101_smolvla_exp06_fixed_bs16_steps15k_r16_a32 | no disponible | no disponible | Pick-and-place SO-101 | Apache 2.0 | Repositorio vacío (0,0 GB), 0 descargas |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para ajuste fino | no disponible en la información | Disponible en Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación para manipulación | no disponible en la información | Disponibles en Hugging Face |
| Políticas Diffusion Policy de LeRobot | no disponible | no disponible | Imitación para manipulación | no disponible en la información | Disponibles en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Repositorio de 0,0 GB: es posible que los pesos no estén efectivamente publicados, lo que impediría su uso directo.
- Sin resultados de evaluación: no hay evidencia publicada de tasa de éxito en la tarea, por lo que el rendimiento real es desconocido.
- Tarea única y muy específica: entrenado exclusivamente para recoger un cubo morado e introducirlo en una caja, ignorando otros objetos; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración de cámara: la política espera una cámara llamada `front` con resolución 480x640; cambios de nombre, resolución o posición pueden degradar el comportamiento.
- Dependencia del robot: diseñado para `so101_follower`; su uso en otro robot o con distinta calibración no está garantizado.
- Dataset pequeño: 77 episodios y 54 777 fotogramas son una base limitada, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y objetos concretos del entorno de grabación.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones no previstas ante observaciones fuera de distribución.
- Idiomas: no se declaran idiomas soportados; la instrucción de tarea está en inglés y no hay evidencia de condicionamiento multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base `lerobot/smolvla_base` antes de un despliegue comercial.
- Cero descargas y cero interacciones: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp06_fixed_bs16_steps15k_r16_a32
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
