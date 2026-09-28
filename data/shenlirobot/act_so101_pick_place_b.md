# shenlirobot/act_so101_pick_place_B

## Resumen

El modelo `shenlirobot/act_so101_pick_place_B` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por el usuario shenlirobot y entrenado con la librería LeRobot de Hugging Face, apuntando al robot `so_follower` (SO-101) con una única cámara de muñeca.

Se trata de un modelo pequeño, de 51.668.614 parámetros (unos 51,7 millones), lo que lo sitúa muy por debajo de cualquier modelo de lenguaje y lo hace desplegable en hardware modesto, incluso CPU. La tarea concreta aprendida es "Pick up the block and place it in the box" (coger el bloque y colocarlo en la caja), entrenada a partir de un dataset de teleoperación de 10 episodios con 5.713 fotogramas a 30 FPS.

Su relevancia reside en que ejemplifica el flujo de trabajo completo de LeRobot para imitación en robótica de bajo coste: capturar datos con teleoperación, entrenar una política ACT y ejecutarla en hardware real mediante `lerobot-rollout`. No se han publicado resultados de evaluación, por lo que su rendimiento real en el robot no está cuantificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de visión por ResNet y esquema CVAE, según el método descrito en el paper 2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de robótica; ventana de observación definida internamente, valor no disponible) |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | No aplica (no es un modelo de lenguaje; consume observaciones y produce acciones) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice un bloque de `k` acciones futuras de forma simultánea, reduciendo el problema de acumulación de error típico de las políticas que predicen un único paso. Según el paper referenciado (Zhao et al., 2023), la arquitectura combina un encoder visual por convoluciones (típicamente ResNet) que procesa las imágenes de cámara, una secuencia de estados de articulaciones y un transformer encoder-decoder. Incorpora un esquema de variable latente tipo CVAE durante el entrenamiento para modelar la variabilidad de las demostraciones humanas; en inferencia el latente se fija, y las predicciones solapadas se combinan mediante ensamblado temporal.

En este caso concreto, el modelo recibe como entradas `observation.state` con forma `(6,)` y `observation.images.wrist` con forma `(3, 480, 640)`, y produce `action` con forma `(6,)`. El entrenamiento se realizó con LeRobot 0.6.0 durante 10.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset `shenlirobot/so101_pick_place_test` de 10 episodios y 5.713 fotogramas a 30 FPS. No se especifican en la model card detalles adicionales como número de tokens de entrenamiento, composición ampliada del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables en este paradigma).

## Capacidades

- Generación de comandos de actuación: produce vectores de acción de 6 dimensiones a partir de observaciones visuales y de estado de las articulaciones.
- Manipulación guiada por visión: utiliza una cámara de muñeca para localizar y manipular objetos.
- Ejecución de una tarea concreta de pick-and-place: "Pick up the block and place it in the box".
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- Ejecución autónoma en el robot SO-101 (`so_follower`) mediante `lerobot-rollout`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio, generación de texto): no aplica, salvo el procesamiento visual de la imagen de muñeca.

## Casos de uso

- Automatización de pick-and-place en laboratorio educativo: la política ejecuta la secuencia de coger un bloque y depositarlo en una caja en un SO-101, sirviendo como ejemplo reproducible del flujo LeRobot en cursos de robótica.
- Punto de partida para fine-tuning: al ser un modelo ACT de 51,7 millones de parámetros con licencia apache-2.0, puede reentrenarse con nuevos datasets para variantes de la misma tarea, ajustando la posición u orientación de los objetos.
- Validación de hardware y calibración: sirve para comprobar que la cadena cámara-brazo del SO-101 está correctamente calibrada, ejecutando una tarea conocida durante un tiempo acotado con `--duration`.
- Banchmark de referencia en imitación: puede emplearse como línea base en estudios comparativos de políticas ACT sobre el mismo dataset y robot, siempre que se evalúe con protocolos propios dado que no hay métricas publicadas.
- Demostraciones de investigación en manipulación visual: útil para estudiar cómo se comporta una política de action chunking ante cambios de iluminación o posición de cámara en tareas sencillas.
- Integración en pipelines ROS 2: proyectos como `so101-ros-ai-humble` muestran cómo conectar políticas LeRobot a flujos ROS para teleoperación, grabación y ejecución en hardware real, donde esta política puede insertarse como nodo de control de tarea.
- Recogida de datos aumentada: ejecutar la política de forma repetida para generar trayectorias adicionales que amplíen el dataset original de 10 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política, y no incluye tasa de éxito, número de ensayos ni condiciones de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 207 MB en precisión fp32 y unos 103 MB en fp16 solo para los pesos, según los 51,7 millones de parámetros; con activaciones y la codificación visual (imágenes de 480x640) el consumo total se mantiene bajo, estimado por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere hardware de gama alta. Se puede usar desde una GTX 10xx en adelante, RTX 3060/4090, o GPUs de datacenter como A100 o H100 sin ninguna ventaja práctica por el reducido tamaño.
- ¿Cabe en GPU de consumo?: sí, en prácticamente cualquier GPU de consumo e incluso en CPU mediante `--policy.device=cpu`.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch (CPU, CUDA o MPS en Apple Silicon). No aplican servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama, dado que no es un modelo de lenguaje ni se distribuye en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La ejecución en el robot se realiza en bucle cerrado; la model card menciona `--duration` para acotar el tiempo de ejecución, pero no publica cifras de frecuencia efectiva de control.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shenlirobot/act_so101_pick_place_B | 51.668.614 | Pick up block, place in box (SO-101, cámara de muñeca) | No aplica | apache-2.0 | Hugging Face |
| AM-101/act_so101_pickplace | No disponible | Pick-and-place sobre SO-101 | No aplica | No disponible | Hugging Face |
| tinkhireeva/act_so101_pick_place_3 | No disponible | Pick-and-place sobre SO-101 | No aplica | No disponible | Hugging Face |
| sarviinageelen/act_so101_pickplace | No disponible | Pick-and-place sobre SO-101 | No aplica | No disponible | Hugging Face |
| ViVi-AI/ACT_so101_pick_place | No disponible | Pick-and-place sobre SO-101 | No aplica | No disponible | Hugging Face |

Todos los comparables localizados pertenecen a la misma familia ACT sobre el robot SO-101 y comparten el mismo enfoque de action chunking; las diferencias de rendimiento no pueden establecerse porque ninguno publica métricas de evaluación en la información disponible.

## Limitaciones y advertencias

- Ausencia de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba publicadas, por lo que el rendimiento real es desconocido.
- Dataset reducido: el entrenamiento se basa en solo 10 episodios y 5.713 fotogramas, lo que limita la generalización ante variaciones de posición, iluminación o presencia de distractores.
- Especialización estrecha: la política está entrenada para una única tarea y un único robot (`so_follower`), y depende de una cámara de muñeca con nombres de observación concretos.
- Sensibilidad a la calibración: cambios en el montaje de la cámara o en la calibración del brazo pueden degradar o invalidar el comportamiento.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones incorrectas o erráticas cuando la observación se aleja de la distribución de entrenamiento.
- Contexto e idioma: no aplica un contexto de tokens ni soporte multilingüe; no acepta instrucciones en lenguaje natural, solo la tarea fija asociada al dataset.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación, pero conviene revisar la licencia del dataset y de los pesos derivados al redistribuir.
- Requisitos de seguridad física: al controlar hardware real, debe ejecutarse con supervisión, límites de par y paradas de emergencia, ya que una política sin evaluar puede provocar movimientos no deseados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shenlirobot/act_so101_pick_place_B
- Dataset de entrenamiento: https://huggingface.co/datasets/shenlirobot/so101_pick_place_test
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shenlirobot/so101_pick_place_test
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Proyecto relacionado SO-101 con ROS 2: https://github.com/XinMing0212/so101-ros-ai-humble
- Política comparable AM-101/act_so101_pickplace: https://huggingface.co/AM-101/act_so101_pickplace
- Política comparable tinkhireeva/act_so101_pick_place_3: https://huggingface.co/tinkhireeva/act_so101_pick_place_3
- Política comparable sarviinageelen/act_so101_pickplace: https://huggingface.co/sarviinageelen/act_so101_pickplace
- Política comparable ViVi-AI/ACT_so101_pick_place: https://huggingface.co/ViVi-AI/ACT_so101_pick_place
