# msKim100/smolvla_so101_stack_corrected66_b32_dagger15_9k

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, que permite controlar robots mediante la combinación de percepción visual y generación de acciones. El autor, msKim100, ha ajustado el modelo base `lerobot/smolvla_base` sobre un dataset propio de demostraciones de una tarea de apilado de bloques, capturado con un robot SO-101 (tipo `so_follower`) y tres cámaras. El resultado es una política de control que recibe imágenes de tres vistas y un estado del robot, y produce comandos de acción de 6 grados de libertad.

La relevancia de este modelo radica en su tamaño reducido (450M de parámetros, 0.9 GB en safetensors), lo que permite su despliegue en hardware de consumo, algo poco habitual en el campo de los VLA, donde modelos como OpenVLA superan los 7B de parámetros. Está entrenado con la librería LeRobot y licenciado bajo Apache 2.0, lo que facilita su uso y modificación tanto en investigación como en aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face con el objetivo de ofrecer un VLA eficiente y desplegable en hardware de consumo. En este caso, el autor ha realizado un fine-tuning sobre el dataset `msKim100/so101_smolvla_corrected66_dagger15`, que contiene 81 episodios y 70.031 fotogramas a 30 FPS, correspondientes a la tarea "Pick up the block and place it on the target" (recoger el bloque y colocarlo en el objetivo). El entrenamiento se realizó con 9.000 pasos, batch size de 32, optimizador AdamW, learning rate de 0.0001 y semilla 1000, utilizando la librería LeRobot en su versión 0.6.1. No se especifica el uso de técnicas como RLHF o DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de 6 grados de libertad (acción de salida de dimensión 6) para el robot SO-101.
- Percepción visual multi-cámara: procesa tres imágenes de 256x256 píxeles procedentes de cámaras `wrist`, `body` y `top`.
- Integración con el ecosistema LeRobot: permite entrenamiento, evaluación y despliegue mediante comandos CLI estándar.
- Ejecución de tareas de manipulación específicas (pick and place) aprendidas por imitación.
- No se reportan capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick and place en entornos controlados: el modelo puede ejecutar la tarea de recoger un bloque y colocarlo en una posición objetivo, lo que es útil en líneas de montaje o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se comportan con datasets pequeños (81 episodios) y qué ajustes mejoran la generalización.
- Despliegue en robots SO-101 de bajo coste: al ser un modelo de 450M de parámetros, puede ejecutarse en GPUs de consumo, facilitando la experimentación en entornos académicos o de pequeña empresa.
- Benchmarking de VLA eficientes: permite comparar el rendimiento de SmolVLA frente a modelos más grandes en tareas de manipulación real, evaluando la relación entre tamaño y precisión.
- Desarrollo de políticas robóticas personalizadas: el fine-tuning sobre datasets propios es viable gracias a la licencia Apache 2.0 y al soporte de LeRobot, lo que permite adaptar el modelo a otras tareas similares.
- Educación y formación en robótica: el modelo y su documentación pueden utilizarse en cursos prácticos de robótica con hardware asequible, como demuestra el notebook de despliegue simulado encontrado en la búsqueda web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación del policy en el mundo real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene 450M de parámetros y el repositorio ocupa 0.9 GB en safetensors, una estimación razonable es que quepa en GPUs con al menos 4 GB de VRAM en FP16, pero no hay datos confirmados.
- GPU recomendadas: no disponible. La documentación de SmolVLA menciona despliegue en hardware de consumo, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probablemente sí, dada la naturaleza compacta del modelo y el tamaño del repositorio, pero no hay confirmación explícita.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), con soporte para PyTorch/CUDA. No se mencionan vLLM, llama.cpp u otros frameworks de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo. Como referencia, SmolVLA (450M) es significativamente más pequeño que otros VLA como OpenVLA (7B parámetros) o RT-2 (más de 55B), lo que implica un menor coste de inferencia pero potencialmente menor precisión en tareas complejas. Sin embargo, no hay resultados publicados que permitan una comparación cuantitativa con estos modelos en esta tarea concreta.

## Limitaciones y advertencias

- El modelo está fine-tuneado para una única tarea específica (recoger y colocar un bloque) y no es generalizable a otras tareas sin reentrenamiento.
- El dataset de entrenamiento es muy reducido (81 episodios), lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminación, posición de objetos o distracciones.
- No se han proporcionado resultados de evaluación en el robot real, por lo que el rendimiento en producción es desconocido.
- Al ser un modelo de control robótico, no tiene capacidades de procesamiento de lenguaje natural general; las entradas de texto no están soportadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento en entornos no controlados.
- No se especifican sesgos conocidos, pero el dataset puede reflejar sesgos del entorno de captura (posiciones de cámara, tipos de objeto, etc.).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/msKim100/smolvla_so101_stack_corrected66_b32_dagger15_9k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/msKim100/so101_smolvla_corrected66_dagger15
- Paper de SmolVLA (arXiv): https://huggingface.co/papers/2506.01844
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Página oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio LeRobot en GitHub: https://github.com/zyqdragon/lerobot_smolvla
