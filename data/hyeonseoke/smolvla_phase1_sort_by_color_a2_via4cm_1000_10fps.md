# HyeonseokE/smolvla_phase1_sort_by_color_A2_via4cm_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face, que permite desplegar políticas robóticas en hardware de consumo. Este repositorio concreto contiene un fine-tune de `lerobot/smolvla_base` realizado por HyeonseokE para la tarea de clasificar bloques por color en platos correspondientes, ejecutada sobre un robot SO-101 con dos cámaras. El modelo se ha entrenado con el framework LeRobot y el dataset `HyeonseokE/phase1_sort_by_color_A2_10fps_via4cm`, compuesto por 100 episodios y 74.827 fotogramas a 10 FPS.

Con 450 millones de parámetros, SmolVLA es significativamente más ligero que otros VLA como OpenVLA (7B), lo que lo hace adecuado para inferencia en GPUs de gama media. Su relevancia actual radica en la creciente demanda de modelos de robótica que puedan ejecutarse en tiempo real sin infraestructura de servidor dedicada, y este fine-tune demuestra el flujo completo de entrenamiento y despliegue con LeRobot. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robotica, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. El modelo base `lerobot/smolvla_base` se ha fine-tuneado con el framework LeRobot (versión 0.6.0) sobre un dataset de demostraciones de clasificación de bloques por color. El entrenamiento se realizó con 58.450 pasos, batch size de 64, optimizador AdamW y learning rate de 0,0001, con semilla 1000. No se menciona el uso de RLHF ni DPO; es un fine-tune supervisado de imitación.

El modelo consume como entrada el estado del robot (6 dimensiones) y tres imágenes de cámaras (256x256 píxeles cada una), y produce una acción de 6 dimensiones. La arquitectura está diseñada para ser eficiente en cómputo, permitiendo inferencia en hardware de consumo, aunque no se detallan innovaciones específicas más allá de las del paper original de SmolVLA (arXiv:2506.01844).

## Capacidades

- Generación de acciones de control para robots manipuladores (6 grados de libertad).
- Procesamiento de entrada visual multimodal (tres cámaras simultáneas).
- Ejecución de tareas de manipulación por imitación, específicamente clasificación de objetos por color.
- Integración con el ecosistema LeRobot para entrenamiento y despliegue.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.
- No es un modelo de lenguaje general; no genera texto ni código.

## Casos de uso

- Clasificación automatizada de piezas en entornos industriales: el modelo puede separar bloques de colores en contenedores designados, reduciendo la intervención manual en líneas de montaje.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning con nuevos datasets robóticos, gracias a su tamaño reducido y compatibilidad con LeRobot.
- Prototipado rápido de políticas robóticas: permite validar algoritmos de control en robots SO-101 sin necesidad de infraestructura de alto rendimiento.
- Educación en robótica: al ser ligero y de código abierto, puede usarse en laboratorios docentes para enseñar VLA y aprendizaje por refuerzo.
- Automatización de tareas repetitivas en logística: clasificar paquetes o piezas por atributos visuales (color, forma) en almacenes.
- Benchmarking de eficiencia: comparar el rendimiento de SmolVLA frente a modelos más grandes en tareas de manipulación, midiendo latencia y precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas como tasa de éxito o precisión.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Dado el tamaño de 450M parámetros, se estima que puede caber en GPUs con 8-12 GB de VRAM en FP16, pero no hay confirmación oficial.
- GPU recomendadas: no especificadas. SmolVLA está diseñado para hardware de consumo, por lo que GPUs como RTX 3060, RTX 4060 o superiores serían plausibles, pero no confirmado.
- Despliegue: compatible con LeRobot, que soporta inferencia en PyTorch. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | no disponible | Apache-2.0 | Robotica, clasificacion |
| OpenVLA | 7B | no disponible | MIT | Robotica general |
| RT-2 (Google) | 55B | no disponible | propietaria | Robotica general |

SmolVLA es mucho más compacto que OpenVLA y RT-2, lo que permite despliegue en hardware más modesto, aunque su capacidad de generalización es menor. No se dispone de comparativas de rendimiento cuantitativas.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real; el rendimiento real es desconocido.
- El modelo está especializado en una única tarea (clasificación por color) y puede no generalizar a otras tareas sin fine-tuning adicional.
- El dataset de entrenamiento es limitado (100 episodios), lo que puede provocar sobreajuste a las condiciones específicas de captura (posición de cámara, iluminación, etc.).
- No se especifican sesgos conocidos, pero al ser un modelo de robótica, los sesgos son menos relevantes que en modelos de lenguaje.
- Riesgo de alucinación no aplica directamente, pero puede producir acciones incorrectas si las entradas visuales difieren del dominio de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y del dataset.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A2_via4cm_1000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A2_10fps_via4cm
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
