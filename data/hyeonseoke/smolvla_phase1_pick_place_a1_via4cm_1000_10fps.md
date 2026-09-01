# HyeonseokE/smolvla_phase1_pick_place_A1_via4cm_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el paper arXiv:2506.01844. Este modelo concreto, `smolvla_phase1_pick_place_A1_via4cm_1000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea específica de robótica: recoger un bloque rojo y colocarlo sobre un plato azul, ejecutada con un robot SO-101. El modelo combina percepción visual (tres cámaras) y estado del robot para generar acciones de control de 6 grados de libertad.

Con 450 millones de parámetros, SmolVLA está diseñado para ejecutarse en hardware de consumo, a diferencia de otros VLA de gran tamaño. Este fine-tuning se entrenó con 100 episodios (28.530 frames a 10 FPS) y está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Su relevancia radica en demostrar que es posible adaptar un VLA compacto a tareas de manipulación específicas con un coste computacional reducido, facilitando la investigación y el despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que integra un codificador visual, un modelo de lenguaje y un decodificador de acciones. Se basa en un VLM compacto preentrenado, adaptado para robótica mediante la generación de tokens de acción. El modelo base `lerobot/smolvla_base` fue preentrenado en grandes conjuntos de datos multimodales, y este fine-tuning lo especializa en la tarea de pick-and-place.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `HyeonseokE/phase1_pick_place_A1_10fps_via4cm`, que contiene 100 episodios con 28.530 frames a 10 FPS. Se usaron 22.250 pasos de entrenamiento con batch size 64, optimizador AdamW, learning rate 0.0001 y seed 1000. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado (imitation learning) a partir de demostraciones humanas. La innovación principal de SmolVLA es su eficiencia: logra un rendimiento competitivo con un coste computacional reducido, permitiendo su despliegue en GPUs de consumo.

## Capacidades

- Control de robot manipulador: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y del estado del robot.
- Percepción visual multi-cámara: procesa tres imágenes RGB de 256x256 píxeles (aunque la model card menciona dos cámaras, la tabla de inputs muestra tres entradas visuales).
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante una instrucción textual ("Pick up the red block and place it on the blue dish").
- Especialización en tareas de pick-and-place: el modelo está entrenado para una tarea concreta y no es generalista.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo scripts de rollout y entrenamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de recogida y colocación en líneas de producción: el modelo puede controlar un brazo robótico SO-101 para mover objetos de una posición a otra, reduciendo la intervención humana en entornos industriales repetitivos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se adaptan a tareas específicas con pocos datos (100 episodios).
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido, se puede entrenar y evaluar en una GPU de consumo, acelerando el ciclo de iteración en laboratorios de robótica.
- Demostraciones educativas: permite a estudiantes y desarrolladores experimentar con un VLA real en hardware asequible, sin necesidad de infraestructura de alto coste.
- Benchmarking de eficiencia: al ser un modelo pequeño, es útil para comparar el rendimiento de VLA compactos frente a modelos más grandes en tareas de manipulación.
- Despliegue en robots de bajo coste: el modelo puede ejecutarse en tiempo real en un robot SO-101 con cámaras estándar, habilitando aplicaciones domésticas o de pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación proporcionada.
- El paper de SmolVLA indica que el modelo está diseñado para hardware de consumo, por lo que se espera que quepa en GPUs como RTX 3060 (12 GB) o superiores, aunque no se confirma con datos concretos.
- El tamaño del repositorio es de 0.9 GB, lo que sugiere que los pesos en precisión FP32 ocupan aproximadamente 1.8 GB (450M parámetros × 4 bytes), y con cuantización podrían reducirse aún más.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y soporta inferencia con PyTorch. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. SmolVLA se posiciona como una alternativa compacta a modelos VLA más grandes como OpenVLA (7B parámetros) o RT-2, pero no se han publicado resultados de rendimiento en este repositorio. La comparación directa requeriría ejecutar benchmarks en la misma tarea y hardware.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (pick-and-place con un bloque rojo y un plato azul) y no generaliza a otras tareas sin un nuevo fine-tuning.
- No se han proporcionado resultados de evaluación en el robot real, por lo que se desconoce su tasa de éxito y robustez ante variaciones de iluminación, posición de objetos o distracciones.
- El dataset de entrenamiento es pequeño (100 episodios), lo que puede limitar la generalización y aumentar el riesgo de sobreajuste.
- La model card menciona dos cámaras (top y left_wrist), pero la tabla de inputs muestra tres imágenes; esta discrepancia debe aclararse antes de su uso.
- No se especifican idiomas soportados; la instrucción de la tarea está en inglés, por lo que el modelo puede no responder a instrucciones en otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de LeRobot y de hardware específico, lo que debe tenerse en cuenta en entornos de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A1_via4cm_1000_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A1_10fps_via4cm
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
