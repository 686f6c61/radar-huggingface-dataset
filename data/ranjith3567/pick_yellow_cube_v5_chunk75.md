# ranjith3567/pick_yellow_cube_v5_chunk75

## Resumen

`pick_yellow_cube_v5_chunk75` es una política robótica de imitación entrenada con SmolVLA (Small Vision-Language-Action), un modelo compacto de visión-lenguaje-acción presentado en el paper arXiv:2506.01844. El modelo lo publica el usuario `ranjith3567` en Hugging Face mediante el framework LeRobot de Hugging Face y ejecuta una única tarea de manipulación: coger un bloque amarillo y depositarlo en una caja marrón. No es un modelo de lenguaje general, sino un checkpoint de control motor que consume observaciones visuales y de estado articular y emite comandos de acción de 6 dimensiones.

El checkpoint contiene 450.046.176 parámetros en formato safetensors (aproximadamente 0,9 GB de repositorio), lo que lo sitúa en el rango de modelos desplegables en hardware de consumo. La arquitectura subyacente combina un codificador visual, un modelo de lenguaje compacto y un decodificador de acciones, siguiendo el diseño de SmolVLA descrito en el paper. El entrenamiento se realizó sobre un dataset propio de 100 episodios y 63.143 fotogramas a 30 FPS, con 100.000 pasos de optimización y batch size 8.

Su relevancia es acotada: se trata de una política de investigación de un solo autor, sin métricas de evaluación publicadas, sin licencia declarada y con cero descargas en el momento de redactar esta ficha. Resulta útil como ejemplo reproducible del flujo de trabajo de LeRobot y de SmolVLA, y como punto de partida para quien quiera entrenar políticas VLA compactas para robots SO-100/SO-101 (tipo `so_follower`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción compacta) sobre LeRobot |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica como modelo de lenguaje; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en el ejemplo: "pick the yellow block and place it in brown box") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras | `Top`, `Side` (más `camera1`, `camera2`, `camera3` y `empty_camera_0` en la definición de inputs) |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entradas visuales | `(3, 256, 256)` × 3 cámaras y `(3, 480, 640)` para `empty_camera_0` |
| Salida `action` | ACTION, forma `(6,)` |
| Dataset de entrenamiento | `ranjith3567/pick_yellow_cube_v5_20261105_191046` |
| Episodios / fotogramas | 100 episodios, 63.143 fotogramas a 30 FPS |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción (VLA) compacto que combina percepción visual multi-cámara, una instrucción en lenguaje natural y el estado propioceptivo del robot para producir una secuencia de acciones motoras. La arquitectura sigue el diseño descrito en el paper arXiv:2506.01844, orientado a reducir el coste computacional frente a VLA de mayor tamaño y permitir el despliegue en hardware de consumo. En este checkpoint concreto, la política consume cuatro flujos visuales (tres a 256×256 y uno a 480×640), un vector de estado de 6 dimensiones y una instrucción textual de tarea, y emite un vector de acción de 6 dimensiones por paso. El sufijo `chunk75` del nombre sugiere un horizonte de predicción de acciones de 75 pasos por chunk, aunque este dato no se confirma explícitamente en la model card.

El entrenamiento se realizó mediante imitación supervisada (behavior cloning) con LeRobot 0.6.2 sobre 100 episodios teleoperados que suman 63.143 fotogramas a 30 FPS, todos ellos de la tarea "pick the yellow block and place it in brown box". Se ejecutaron 100.000 pasos con AdamW, learning rate 1e-4, batch size 8 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni de un proceso de post-entrenamiento con refuerzo; tampoco se detalla la composición del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control robótico de manipulación de una sola tarea: coger un bloque amarillo y colocarlo en una caja marrón.
- Percepción visual multi-cámara: procesa tres vistas a 256×256 y una vista adicional a 480×640.
- Fusión de estado propioceptivo de 6 dimensiones con observaciones visuales.
- Condicionamiento por instrucción en lenguaje natural (task prompt) para seleccionar la tarea a ejecutar.
- Generación de acciones continuas de 6 dimensiones compatibles con robots tipo `so_follower` (SO-100/SO-101).
- Ejecución en bucle cerrado mediante `lerobot-rollout` con control de duración.
- No soporta tool calling, function calling, razonamiento multi-paso genérico ni generación de texto libre: es una política de control, no un modelo conversacional.
- Capacidades multilingües: no disponible; el prompt de tarea del ejemplo está en inglés.

## Casos de uso

- **Automatización de pick-and-place en laboratorio:** la política ejecuta la secuencia completa de coger el bloque amarillo y depositarlo en la caja marrón, adecuada para demostraciones reproducibles en un banco de pruebas con robot SO-100/SO-101.
- **Reproducción de experimentos de imitación con LeRobot:** sirve como checkpoint de referencia para validar el pipeline `lerobot-train` → `lerobot-rollout` con SmolVLA y comparar configuraciones de entrenamiento (pasos, batch size, learning rate).
- **Punto de partida para fine-tuning:** el checkpoint puede reentrenarse con un dataset propio siguiendo la receta documentada (100.000 pasos, AdamW, lr 1e-4) para adaptar la política a nuevas tareas de manipulación.
- **Docencia y formación en VLA:** útil para ilustrar el flujo completo de un modelo visión-lenguaje-acción: grabación de datos, definición de features de observación y acción, entrenamiento y despliegue en robot real.
- **Validación de hardware y calibración:** ejecutar la política durante 60 segundos con `--duration=60` permite comprobar la calibración de cámaras y del robot antes de entrenamientos más largos.
- **Benchmark interno de políticas compactas:** al tener 450 M de parámetros y caber en hardware de consumo, permite medir latencia y throughput en GPUs modestas frente a VLA de mayor tamaño.
- **Generación de datos sintéticos de evaluación:** las ejecuciones de la política pueden servir para comparar distribuciones de acciones frente a demostraciones humanas y detectar desviaciones de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de latencia o throughput medidas.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con 450 M de parámetros en safetensors (aproximadamente 0,9 GB de pesos en fp32), la inferencia requiere del orden de 2-4 GB de VRAM considerando activaciones y buffers de imagen; no se dispone de una medición oficial.
- **GPU recomendadas:** no disponible en la información proporcionada. Por tamaño, el modelo es compatible con GPUs de consumo tipo RTX 3060/4060/4090, aunque no se confirma en la documentación.
- **¿Cabe en GPU de consumo?** Sí, por el tamaño del checkpoint (0,9 GB) y los 450 M de parámetros, es desplegable en GPUs de consumo; el paper de SmolVLA lo describe como desplegable en hardware de consumo.
- **Opciones de despliegue:** `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| `pick_yellow_cube_v5_chunk75` (este) | 450 M | SmolVLA (LeRobot) | Pick-and-place de bloque amarillo | no disponible | no |
| `ranjith3567/pick_yellow_cube_v5_chunk25` | no disponible | SmolVLA (LeRobot) | Misma tarea, distinto horizonte de chunk | no disponible | no |
| SmolVLA base (paper arXiv:2506.01844) | no disponible en la información | VLA compacto | Manipulación general | no disponible en la información | sí, en el paper |

La información disponible no permite comparar métricas de rendimiento entre estos modelos. Los dos checkpoints del mismo autor difieren en el sufijo del chunk (`chunk25` frente a `chunk75`), lo que apunta a horizontes de predicción de acciones distintos, pero no se documentan resultados comparativos.

## Limitaciones y advertencias

- **Sin evaluación publicada:** no hay tasas de éxito en robot real, por lo que se desconoce la fiabilidad de la política fuera del dataset de entrenamiento.
- **Tarea única:** la política está entrenada exclusivamente para "pick the yellow block and place it in brown box"; no generaliza a otras tareas sin reentrenamiento.
- **Sobreajuste al entorno de grabación:** al entrenarse con 100 episodios de un único montaje, es probable que sea sensible a cambios de iluminación, posiciones de objetos, distracciones o a un robot distinto del mismo tipo.
- **Licencia no declarada:** la model card indica "[More Information Needed]"; no se puede asumir uso comercial sin aclaración del autor.
- **Idioma:** no se documentan capacidades multilingües; el prompt de tarea del ejemplo está en inglés.
- **Riesgo de alucinación:** no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas o fuera de distribución cuando la escena difiere de la de entrenamiento.
- **Sesgos:** no documentados; el dataset procede de teleoperación de un solo operador y un solo montaje, lo que puede introducir sesgos de trayectoria y de posicionamiento.
- **Dependencia de LeRobot 0.6.2:** la reproducibilidad depende de esa versión del framework y de la coincidencia exacta de los nombres de las features de observación.
- **Cero descargas y cero likes:** el modelo no tiene validación por parte de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5_chunk75
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Checkpoint hermano `chunk25`: https://huggingface.co/ranjith3567/pick_yellow_cube_v5_chunk25
- Dataset relacionado en Claru: https://claru.ai/datasets/ranjith3567-pick-yellow-cube-20261009-203921
