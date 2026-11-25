# CarolinePascal/grabette-red-cube-green-box-jointspace-act-25

## Resumen

Grabette-red-cube-green-box-jointspace-act-25 es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. El modelo lo desarrolla la usuaria CarolinePascal y se distribuye a través de Hugging Face dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de una imagen de cámara y del estado articular del robot, predice acciones de 9 dimensiones para ejecutar una tarea física concreta.

La tarea objetivo es "put the red cube in the green box" (colocar el cubo rojo en la caja verde), aprendida por imitación a partir de 174 episodios de teleoperación (30 969 fotogramas a 30 FPS) sobre un robot de tipo `grabette`. El modelo tiene 51.597.961 parámetros y un tamaño de repositorio de 6,2 GB, con pesos en formato safetensors y licencia Apache 2.0.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación en LeRobot (grabación de datos, entrenamiento con ACT, despliegue con `lerobot-rollout`). No obstante, es una política de tarea única, sin resultados de evaluación publicados y con cero descargas en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto de referencia y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.597.961 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `grabette` |
| Cámaras de entrada | `cam0` |
| Entrada visual | `observation.images.cam0`, forma `(3, 360, 480)` |
| Entrada de estado | `observation.state`, forma `(9,)` |
| Salida de acción | `action`, forma `(9,)` |
| Dataset de entrenamiento | SteveNguyen/put_red_cube_green_box_jointspace (174 episodios, 30 969 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20 000 |
| Tamaño del repositorio | 6,2 GB |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. La arquitectura combina un backbone visual (encoder de imágenes) con un transformer que, condicionado por el estado articular y la observación visual, genera secuencias de acciones. En este caso concreto, el modelo consume una imagen RGB de 360x480 píxeles y un vector de estado de 9 dimensiones, y produce un vector de acción también de 9 dimensiones, coherente con un espacio articular de 9 grados de libertad.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `SteveNguyen/put_red_cube_green_box_jointspace`, compuesto por 174 episodios teleoperados y 30 969 fotogramas a 30 FPS. Se usaron 20 000 pasos, batch de 64, optimizador AdamW, learning rate de 1e-05 y semilla 1000. La model card no documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre demostraciones. Tampoco se detalla la composición del dataset más allá de la tarea única ni se especifican aumentos de datos o variaciones de iluminación y posición de objetos.

## Capacidades

- Control visuomotor de un robot `grabette` para la tarea concreta "put the red cube in the green box".
- Predicción de chunks de acciones de 9 dimensiones a partir de una imagen y del estado articular.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado.
- Ejecución en bucle con `lerobot-rollout` durante un tiempo configurable (`--duration`).
- Integración nativa con el ecosistema LeRobot (entrenamiento, evaluación y despliegue por CLI).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Reproducción de un pipeline de imitación completo: sirve como referencia para grabar un dataset con LeRobot, entrenar una política ACT y desplegarla en un robot `grabette`, útil para equipos que quieren validar su cadena de herramientas antes de abordar tareas propias.
- Tarea de pick-and-place en laboratorio: el modelo ejecuta la colocación de un cubo rojo en una caja verde, adecuado para demostraciones docentes de manipulación robótica con una sola cámara.
- Base para fine-tuning en tareas similares: al estar entrenado sobre un espacio articular de 9 dimensiones y una cámara `cam0`, puede servir de inicialización para tareas de manipulación con el mismo robot y configuración de sensores.
- Pruebas de integración de LeRobot en CI: el comando `lerobot-rollout` con `--duration` permite automatizar pruebas de humo del stack de inferencia en un robot real o en un banco de pruebas.
- Comparación de métodos de imitación: al ser una política ACT canónica con hiperparámetros documentados (20 000 pasos, batch 64, lr 1e-05), resulta útil como línea base frente a otros métodos de LeRobot (por ejemplo, diffusion policy) sobre el mismo dataset.
- Docencia y divulgación: la tarea y el dataset son simples y visualmente claros, lo que facilita explicar conceptos de action chunking, teleoperación y evaluación de políticas en un curso de robótica.
- Validación de hardware `grabette`: permite comprobar calibración de cámaras y articulaciones antes de entrenar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita de que no se han proporcionado resultados en robot real (número de ensayos, éxitos y tasa de éxito). Tampoco se reportan métricas de pérdida de entrenamiento ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,6 M de parámetros, el peso en precisión completa ronda los 0,2 GB, pero el consumo real depende del backbone visual y del tamaño de lote; no se documenta.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU compatible con CUDA, pero no se especifica modelo ni memoria mínima.
- ¿Cabe en GPU de consumo? No confirmado. Por el número de parámetros es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible. La política opera a 30 FPS según el dataset, pero no se publican latencias de inferencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Tarea | Cámara / estado | Licencia | Resultados publicados |
|---|---|---|---|---|---|---|
| CarolinePascal/grabette-red-cube-green-box-jointspace-act-25 | ACT | 51,6 M | Colocar cubo rojo en caja verde | 1 cámara (3x360x480), estado (9,) | Apache 2.0 | No |
| Políticas ACT de referencia en LeRobot | ACT | no disponible | Tareas diversas de manipulación | variable | Apache 2.0 | variable según política |
| Políticas de diffusion policy en LeRobot | Diffusion policy | no disponible | Manipulación | variable | Apache 2.0 | variable según política |

No se dispone de datos de rendimiento de este modelo ni de políticas comparables concretas en la información proporcionada, por lo que la comparación cuantitativa no es posible. La comparación cualitativa se limita al método (ACT frente a diffusion policy) y al ecosistema (LeRobot).

## Limitaciones y advertencias

- Tarea única: la política está entrenada exclusivamente para "put the red cube in the green box"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que se desconoce su fiabilidad real en robot.
- Dependencia de la configuración de hardware: requiere un robot `grabette`, una cámara `cam0` con la resolución y el encuadre del entrenamiento, y un espacio articular de 9 dimensiones; pequeñas variaciones de calibración o iluminación pueden degradar el comportamiento.
- Dataset pequeño y de un solo operador: 174 episodios y 30 969 fotogramas son un volumen limitado, lo que aumenta el riesgo de sobreajuste a posiciones, colores y condiciones de la escena de recogida.
- Riesgo de alucinación en el sentido de acciones erróneas o inseguras: como toda política de imitación, puede producir movimientos fuera de distribución ante objetos o configuraciones no vistas; se recomienda supervisión humana y límites de seguridad en el robot.
- Sesgos: no documentados; al ser un modelo de control, los sesgos relevantes son de distribución de datos (posiciones, iluminación, tipo de objeto) más que lingüísticos.
- Idiomas: no aplica; el modelo no procesa lenguaje, aunque la tarea se especifica mediante una cadena de texto en la CLI.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar también las licencias del dataset y del código de LeRobot.
- Cero descargas y cero likes en el momento de la consulta: indica ausencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-25) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarolinePascal/grabette-red-cube-green-box-jointspace-act-25
- Dataset de entrenamiento: https://huggingface.co/datasets/SteveNguyen/put_red_cube_green_box_jointspace
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SteveNguyen/put_red_cube_green_box_jointspace
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
