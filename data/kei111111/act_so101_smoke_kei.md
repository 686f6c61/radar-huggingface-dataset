# kei111111/act_so101_smoke_kei

## Resumen

`act_so101_smoke_kei` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario kei111111 en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor entrenado con LeRobot que, a partir del estado articular de un brazo SO-101 y una imagen de cámara de muñeca, predice comandos de acción de 6 dimensiones para ejecutar la tarea "coger el bloque y colocarlo en la caja". El repositorio tiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB.

El modelo se entrenó sobre un dataset propio de 50 episodios y 10.971 fotogramas a 15 FPS, con una configuración muy reducida (100 pasos de entrenamiento, batch de 8, learning rate de 1e-5). El nombre "smoke" sugiere que se trata de una prueba de humo del pipeline de entrenamiento más que de una política lista para producción: no hay resultados de evaluación en la model card y el autor no ha publicado vídeos ni tasas de éxito.

Su relevancia es acotada: sirve como ejemplo reproducible del flujo de entrenamiento y despliegue de ACT en LeRobot 0.6.1 sobre el robot de bajo coste SO-101, y como plantilla para quienes quieran entrenar sus propias políticas de manipulación con hardware asequible. No debe confundirse con un modelo fundacional de robótica ni con un VLA de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer condicionado por observaciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. La política consume `observation.state` con forma `(6,)` (estado articular del brazo SO-101) y `observation.images.wrist` con forma `(3, 480, 640)` (imagen RGB de la cámara de muñeca), y produce `action` con forma `(6,)`. El entrenamiento se realizó con LeRobot 0.6.1, optimizador AdamW, learning rate 1e-5, batch de 8, semilla 1000 y solo 100 pasos, lo que corresponde a un entrenamiento de prueba más que a una convergencia real.

El dataset de entrenamiento (`kei111111/so101_block_box_50episodes_final_20261107_190045`) contiene 50 episodios teleoperados, 10.971 fotogramas a 15 FPS, todos etiquetados con la tarea "Pick up the block and place it into the box." No se documenta composición adicional del dataset, aumento de datos, RLHF/DPO ni ninguna innovación técnica más allá del propio método ACT. El robot objetivo es `so_follower` con una única cámara de muñeca.

## Capacidades

- Control visomotor de un brazo SO-101 para una tarea única de pick-and-place (coger un bloque y depositarlo en una caja).
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular e imagen de muñeca.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere recompensas ni entorno simulado.
- Ejecución en bucle cerrado con realimentación visual a la frecuencia de la cámara.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de la imagen de muñeca.

## Casos de uso

- Prototipado rápido de pipelines de imitación: sirve para validar de extremo a extremo el flujo `lerobot-train` → `lerobot-rollout` con un coste de entrenamiento mínimo (100 pasos), antes de lanzar entrenamientos largos con datasets mayores.
- Docencia y talleres de robótica de bajo coste: el SO-101 y una política ACT de 51 M de parámetros permiten montar una práctica completa de aprendizaje por imitación en hardware asequible, con una única cámara y un brazo.
- Prueba de humo de infraestructura: útil para verificar que la GPU, las versiones de LeRobot y los drivers de cámara funcionan antes de invertir horas de entrenamiento en políticas más grandes.
- Reproducción de la tarea "pick up the block and place it into the box" en un montaje idéntico al del autor: mismo robot, misma cámara de muñeca y misma disposición de objeto y caja.
- Base para fine-tuning: al ser un checkpoint ACT estándar en safetensors, puede reutilizarse como inicialización para un dataset propio con la misma configuración de observaciones (estado de 6 dimensiones e imagen de muñeca de 480×640).
- Referencia para comparar configuraciones de entrenamiento: permite contrastar el efecto de aumentar pasos, batch o episodios frente a esta línea base mínima de 100 pasos y 50 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con el texto "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 0,2 GB, más el buffer de la imagen de entrada (3×480×640) y las activaciones del transformer, que son pequeñas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Para entrenamiento, una RTX 3090 o RTX 4090 acelera los ciclos, aunque el tamaño del modelo no exige hardware de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es la vía documentada por el autor. No se documentan exportaciones a ONNX, TensorRT, llama.cpp ni vLLM (no aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles. La política se ejecuta en bucle cerrado a la frecuencia de la cámara (el ejemplo de la model card usa 30 FPS para las cámaras y el dataset se grabó a 15 FPS); no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observaciones | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kei111111/act_so101_smoke_kei | 51,7 M | estado (6,) + imagen muñeca (3,480,640) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| xixisun/act_so101_smoke | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | variable según dataset | variable; muchas sin evaluación publicada | habitualmente Apache 2.0 | Hugging Face |

La comparación cuantitativa no es posible con la información disponible: no hay benchmarks ni métricas de éxito publicadas para este modelo ni para las alternativas identificadas en la búsqueda.

## Limitaciones y advertencias

- Entrenamiento mínimo: 100 pasos con batch 8 y learning rate 1e-5 sobre 50 episodios; es probable que la política no haya convergido y su tasa de éxito real sea baja o nula. El nombre "smoke" apunta a una prueba de humo, no a un modelo final.
- Sin evaluación: no hay resultados de robot real, ni número de ensayos, ni tasa de éxito, ni análisis de sensibilidad a posiciones, iluminación o distractores.
- Especificidad de hardware: entrenada para `so_follower` con una cámara de muñeca concreta; cambiar la cámara, su montaje o la resolución degradará el rendimiento.
- Tarea única: solo ejecuta "Pick up the block and place it into the box"; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Sin capacidades de lenguaje: no interpreta instrucciones variables; la cadena de tarea es fija.
- Riesgo de sobreajuste al montaje: con 50 episodios y una sola cámara, la política puede memorizar posiciones y condiciones de iluminación del laboratorio del autor.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset asociado antes de reutilizarlo en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kei111111/act_so101_smoke_kei
- Dataset de entrenamiento: https://huggingface.co/datasets/kei111111/so101_block_box_50episodes_final_20261107_190045
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kei111111/so101_block_box_50episodes_final_20261107_190045
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo similar identificado en la búsqueda: https://huggingface.co/xixisun/act_so101_smoke
