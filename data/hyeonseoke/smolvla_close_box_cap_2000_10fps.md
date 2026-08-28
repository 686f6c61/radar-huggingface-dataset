# HyeonseokE/smolvla_close_box_cap_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y descrito en el artículo arXiv 2506.01844. Su objetivo es ofrecer un rendimiento competitivo en tareas de control robótico con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Este repositorio concreto, `HyeonseokE/smolvla_close_box_cap_2000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de 100 episodios (28 349 frames a 10 FPS) para la tarea de cerrar una caja colocando la tapa sobre el cuerpo.

El modelo combina un VLM preentrenado compacto con un experto de acciones entrenado mediante flow matching. Dadas varias imágenes de cámaras y una instrucción en lenguaje natural, genera un chunk de acciones para el robot. Con 450 millones de parámetros, es significativamente más ligero que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que lo hace adecuado para entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en SmolVLA: VLM compacto + experto de acciones con flow matching |
| Parametros totales | 450 046 176 (aprox. 450M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin especificar precisión) |
| Idiomas soportados | no disponible (la model card no lo indica; probablemente inglés, pero no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de un VLM preentrenado compacto (que procesa imágenes y lenguaje) y un experto de acciones entrenado con flow matching. El modelo recibe múltiples imágenes de cámaras (en este caso, tres según la tabla de inputs: `camera1`, `camera2`, `camera3`, aunque la model card lista `top` y `left_wrist`) junto con el estado del robot (6 dimensiones) y una instrucción en lenguaje natural, y produce un chunk de acciones de 6 dimensiones.

Este repositorio es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `HyeonseokE/close_box_cap_10fps`, que contiene 100 episodios de la tarea "Close the box by placing the lid on the box body." El entrenamiento se realizó con 22 148 pasos, batch size 64, optimizador AdamW, learning rate 0.0001 y semilla 2000, usando la librería LeRobot 0.5.1. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y del estado del robot.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante texto ("Close the box by placing the lid on the box body.").
- Procesamiento multi-cámara: acepta hasta tres imágenes de 256x256 píxeles como entrada visual.
- Generación de chunks de acciones: produce secuencias de acciones para control predictivo.
- Despliegue en hardware de consumo: según el paper, el modelo está diseñado para ejecutarse en GPUs de gama media.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de Hugging Face para robótica.

## Casos de uso

- Automatización de tareas de empaquetado: el modelo puede controlar un brazo robótico para cerrar cajas o colocar tapas, reduciendo el coste de automatización en líneas de producción pequeñas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se comportan en tareas de manipulación con pocos datos (100 episodios).
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido, permite iterar sobre nuevas tareas en hardware de laboratorio sin necesidad de clústeres de GPUs.
- Control de robots de bajo coste: el modelo puede ejecutarse en robots tipo SO-101 (so101_follower) con GPUs de consumo, facilitando la robótica accesible.
- Benchmarking de VLA eficientes: útil para comparar el rendimiento de modelos compactos frente a alternativas más grandes en tareas estandarizadas.
- Educación y formación en robótica: permite a estudiantes experimentar con políticas de visión-lenguaje-acción en entornos simulados o con robots reales de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 450M de parámetros, en FP16 ocuparía aproximadamente 900 MB de pesos, más overhead de activaciones y optimizador durante el entrenamiento. Para inferencia, una GPU con 4-6 GB de VRAM podría ser suficiente, pero no hay datos confirmados.
- GPU recomendadas: el paper indica que SmolVLA puede desplegarse en hardware de consumo. GPUs como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores serían adecuadas, aunque no hay una lista oficial.
- Compatibilidad con consumer GPU: sí, por diseño, aunque depende de la resolución de imagen y el número de cámaras.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También es compatible con el ecosistema Hugging Face (transformers, safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Sin embargo, a nivel de arquitectura y tamaño, SmolVLA (450M) es significativamente más pequeño que otros VLA conocidos:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este repo) | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Apache 2.0 | Hugging Face |
| RT-2 | 55B | no disponible | propietaria | no abierto |

No se pueden establecer comparaciones de rendimiento sin datos de benchmarks.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia de éxito en tareas reales, por lo que su rendimiento en producción es incierto.
- Especialización limitada: el fine-tuning se realizó para una única tarea (cerrar una caja) con un robot específico (so101_follower) y una configuración de cámaras concreta. No es un modelo generalista.
- Dependencia de la configuración de cámaras: la model card lista `top` y `left_wrist`, pero la tabla de inputs muestra tres cámaras. Esta inconsistencia puede causar problemas al desplegar en otros robots.
- Riesgo de alucinación en instrucciones complejas: al ser un VLA, puede malinterpretar instrucciones ambiguas o generar acciones incorrectas si la tarea difiere del entrenamiento.
- Sesgos del dataset: el dataset de entrenamiento es pequeño (100 episodios) y probablemente capturado en un entorno específico, lo que limita la generalización a otras condiciones de iluminación, posiciones de objetos o variaciones del robot.
- Sin soporte multilingüe confirmado: no se especifican idiomas; probablemente solo inglés.
- Fecha de creación futura (2026-08-27): el modelo fue subido con una fecha posterior a la actual, lo que sugiere que puede ser un artefacto de prueba o un error de metadatos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_close_box_cap_2000_10fps
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/close_box_cap_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
