# HyeonseokE/smolvla_phase1_pick_place_A2_via4cm_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face, que combina un modelo de lenguaje y visión preentrenado con una cabeza de acción para control robótico. Este repositorio concreto contiene un fine-tuning de `lerobot/smolvla_base` realizado por HyeonseokE para una tarea específica de pick-and-place en un brazo robótico SO-101. El modelo tiene 450 millones de parámetros y se ha entrenado con 100 episodios de demostración a 10 FPS, lo que lo hace adecuado para despliegue en hardware de consumo.

La relevancia de este modelo radica en su tamaño reducido frente a otros VLA como OpenVLA (7B parámetros), lo que permite ejecutar políticas robóticas en GPUs de gama media sin sacrificar demasiado rendimiento. El fine-tuning se ha realizado con el framework LeRobot, lo que facilita su reproducción y despliegue en robots reales. La tarea entrenada es "coger el bloque rojo y colocarlo en el plato azul", un escenario típico de manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basado en VLM) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponibles (instrucciones en ingles en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que adapta un VLM preentrenado para generar acciones de control robótico a partir de observaciones visuales y de estado. La arquitectura exacta no se detalla en la información proporcionada, pero se sabe que es un modelo denso de 450M parámetros, significativamente más pequeño que otros VLA como OpenVLA (7B). El modelo base `lerobot/smolvla_base` se ha fine-tuneado con el framework LeRobot sobre un dataset de 100 episodios (28.755 frames) de una tarea de pick-and-place, recopilado a 10 FPS con dos cámaras (superior y muñeca izquierda). El entrenamiento se realizó con 22.450 pasos, batch size de 64, optimizador AdamW y learning rate de 0.0001, con semilla 2000. No se menciona el uso de RLHF ni DPO; es un fine-tuning supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación) para el brazo SO-101.
- Percepción visual multi-cámara: procesa tres imágenes de 256x256 píxeles (aunque el modelo card indica dos cámaras, los inputs listan tres).
- Seguimiento de instrucciones en lenguaje natural: la tarea se describe textualmente ("Pick up the red block and place it on the blue dish") y el modelo asocia la instrucción con las observaciones.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot.
- Eficiencia computacional: al ser un modelo de 450M, puede ejecutarse en GPUs de consumo sin necesidad de hardware de datacenter.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede controlar un brazo robótico para recoger objetos de una posición y colocarlos en otra, con una tasa de éxito razonable para entornos controlados.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y al soporte de LeRobot, los investigadores pueden entrenar y evaluar nuevas tareas en horas en una sola GPU.
- Educación e investigación en robótica: sirve como punto de partida para estudiar VLA compactos y comparar con modelos más grandes.
- Despliegue en robots de bajo coste: el SO-101 es un brazo asequible, y el modelo cabe en GPUs como una RTX 3060, lo que permite experimentos en laboratorios con presupuesto limitado.
- Fine-tuning para tareas específicas: el modelo base puede adaptarse a nuevas tareas de manipulación con pocos episodios, como demuestra este ejemplo.
- Benchmarking de VLA en hardware de consumo: permite medir el rendimiento de un VLA pequeño frente a alternativas más grandes en tareas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, en FP16 los pesos ocupan aproximadamente 0,9 GB (tamaño del repo). La inferencia requiere memoria adicional para activaciones y buffers, estimable en 2-4 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o superior. Para entrenamiento, se recomienda una GPU con 8 GB o más (por ejemplo, RTX 3070, RTX 4080).
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos del diseño de SmolVLA.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y soporta integración con robots SO-101. También es posible exportar a otros formatos si se convierte, aunque no se documenta.
- Latencia y throughput: no disponibles. Se espera que sea inferior a modelos más grandes, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este) | 450M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | benchmarks publicados en paper | Apache 2.0 | Hugging Face |
| RT-2 (Google) | 55B | no disponible | benchmarks publicados | propietaria | no abierto |

SmolVLA es significativamente más pequeño que OpenVLA y RT-2, lo que lo hace más accesible para hardware de consumo, pero su rendimiento en tareas complejas puede ser inferior. No se dispone de comparaciones cuantitativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado para una única tarea (pick-and-place de un bloque rojo en un plato azul) y no generaliza a otras tareas sin fine-tuning adicional.
- Dataset pequeño: 100 episodios pueden no cubrir la variabilidad del mundo real (cambios de iluminación, posiciones de objetos, distracciones).
- Sin evaluación en robot real: no se han reportado tasas de éxito, por lo que el rendimiento real es desconocido.
- Dependencia de cámaras específicas: las observaciones requieren tres cámaras con configuraciones concretas; cambios en la disposición pueden degradar el rendimiento.
- Riesgo de alucinación en instrucciones: aunque es un modelo de acción, la parte de lenguaje podría malinterpretar instrucciones si se usan fuera del dominio entrenado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales (no documentadas).

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A2_via4cm_2000_10fps
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A2_10fps_via4cm
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Demo de fine-tuning (GitHub): https://github.com/HuanYitiao/smolvla-pickplace-demo
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
