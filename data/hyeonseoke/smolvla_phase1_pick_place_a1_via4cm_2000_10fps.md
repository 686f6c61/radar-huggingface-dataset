# HyeonseokE/smolvla_phase1_pick_place_A1_via4cm_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para tareas de robótica con requisitos computacionales reducidos. Este repositorio contiene un fine-tuning específico del modelo base `lerobot/smolvla_base` para la tarea de pick-and-place: recoger un bloque rojo y colocarlo en un plato azul. El modelo ha sido entrenado con el framework LeRobot sobre un dataset propio de 100 episodios grabados a 10 FPS, y está pensado para ejecutarse en hardware de consumo, como GPUs de gama media.

El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors. Su arquitectura combina percepción visual (tres cámaras) con el estado del robot para generar acciones de control de 6 grados de libertad. Al ser un fine-tuning de un modelo base, su rendimiento está especializado en la tarea concreta para la que fue entrenado, aunque hereda las capacidades generales de SmolVLA para comprensión visual y lingüística.

La relevancia de este modelo radica en su tamaño reducido y su capacidad para ejecutarse en entornos con recursos limitados, lo que democratiza el acceso a la robótica basada en aprendizaje por imitación. Es un ejemplo práctico de cómo adaptar un VLA preentrenado a una tarea específica con un dataset relativamente pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que integra un codificador visual, un modelo de lenguaje y un decodificador de acciones. Aunque no se detallan los componentes internos en la documentación disponible, el paper original (arXiv:2506.01844) describe una arquitectura compacta y eficiente, optimizada para reducir el coste computacional sin sacrificar rendimiento en tareas robóticas. El modelo base `lerobot/smolvla_base` fue preentrenado en un corpus multimodal y posteriormente fine-tuneado para esta tarea específica.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre un dataset propio de 100 episodios, con un total de 28.530 frames a 10 FPS. La tarea consistía en "recoger el bloque rojo y colocarlo en el plato azul". Se utilizaron 22.250 pasos de entrenamiento con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 0.0001. La semilla aleatoria fue 2000. El robot empleado fue un SO-101 follower con dos cámaras (top y left_wrist), aunque las entradas del modelo incluyen tres imágenes de 256x256 píxeles.

## Capacidades

- Control robótico de 6 grados de libertad (posición y orientación) para tareas de manipulación.
- Percepción visual multi-cámara: procesa tres imágenes de 256x256 píxeles para entender la escena.
- Ejecución de tareas de pick-and-place específicas, como recoger un objeto y colocarlo en una ubicación determinada.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Generación de acciones continuas (6 dimensiones) a partir de observaciones de estado y visión.
- Capacidad de fine-tuning sobre el modelo base para adaptarse a nuevas tareas con datasets pequeños (se recomiendan ~50 episodios).

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un brazo robótico para realizar tareas repetitivas de recogida y colocación de piezas, reduciendo costes de programación manual.
- Robótica educativa: al ser compacto y ejecutable en hardware de consumo, es adecuado para laboratorios universitarios o centros de formación que deseen experimentar con aprendizaje por imitación.
- Investigación en manipulación: sirve como punto de partida para estudiar la generalización de políticas VLA en entornos controlados, variando posiciones de objetos o condiciones de iluminación.
- Prototipado rápido de tareas robóticas: con un dataset de 100 episodios, se puede entrenar un modelo funcional en pocas horas, acelerando el desarrollo de pruebas de concepto.
- Integración en sistemas de control existentes: el modelo puede ser invocado mediante la CLI de LeRobot (`lerobot-rollout`) para sustituir controladores clásicos en tareas específicas.
- Benchmarking de VLA en hardware limitado: permite comparar el rendimiento de SmolVLA frente a modelos más grandes en términos de precisión y latencia, sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación para esta política concreta. El paper original de SmolVLA reporta métricas comparativas, pero no se incluyen en este repositorio.

## Requisitos de hardware

- Al ser un modelo de 450 millones de parámetros, se estima que puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no se proporcionan cifras exactas.
- El paper original menciona que SmolVLA puede desplegarse en hardware de consumo, lo que sugiere compatibilidad con GPUs como RTX 3060, RTX 4060 o superiores.
- El despliegue se realiza mediante el framework LeRobot, que soporta inferencia en GPU (CUDA) y posiblemente en CPU para pruebas.
- No se especifican requisitos de latencia o throughput, pero al ser un modelo compacto, se espera una inferencia en tiempo real para control robótico (típicamente 10-30 Hz).
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout`), integración con ROS, o exportación a otros formatos si se requiere.

## Comparativa con modelos similares

Existen dos variantes adicionales del mismo autor con diferentes semillas de entrenamiento:

- `HyeonseokE/smolvla_phase1_pick_place_A1_2000_10fps`
- `HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps`

Estas variantes comparten la misma arquitectura y dataset, pero difieren en la semilla aleatoria, lo que puede afectar ligeramente al rendimiento. No se dispone de datos comparativos detallados entre ellas. El modelo base `lerobot/smolvla_base` es el punto de partida, pero no está especializado en ninguna tarea concreta. No se dispone de información sobre otros VLA comparables en el mismo rango de parámetros.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de pick-and-place con un bloque rojo y un plato azul; no generaliza a otros objetos o configuraciones sin fine-tuning adicional.
- No se han proporcionado resultados de evaluación en robot real, por lo que el rendimiento real no está verificado.
- El dataset de entrenamiento es pequeño (100 episodios), lo que puede limitar la robustez frente a variaciones en iluminación, posición de objetos o distracciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y de la configuración específica del robot SO-101; su uso en otros robots requerirá adaptación.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado en un entorno controlado, puede fallar en entornos no vistos.
- La fecha de creación del repositorio (2026) es inusual, pero no afecta a la funcionalidad del modelo.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A1_via4cm_2000_10fps)
- [Paper original de SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Documentación de LeRobot sobre SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A1_10fps_via4cm)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
