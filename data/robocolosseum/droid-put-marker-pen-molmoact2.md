# RoboColosseum/droid-put-marker-pen-molmoact2

## Resumen

`RoboColosseum/droid-put-marker-pen-molmoact2` es una política robótica de imitación derivada de MolmoAct2, el modelo fundacional de robótica abierto desarrollado por el Allen Institute for AI (Ai2). MolmoAct2 mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones motrices (*action chunks*), y este repositorio concreta esa arquitectura en un *fine-tuning* para una única tarea sobre un brazo Franka: introducir un rotulador en un soporte. El modelo se ha entrenado y publicado con LeRobot 0.6.1, la librería de Hugging Face para aprendizaje por imitación en robótica real.

El checkpoint contiene 5.442.196.272 parámetros en formato safetensors (10,9 GB de repositorio), lo que lo sitúa en la escala de varios miles de millones de parámetros, coherente con un modelo visión-lenguaje-acción (VLA) que combina un codificador visual y un *backbone* de lenguaje con una cabeza de acciones. La política consume tres flujos de imagen (muñeca, izquierda y derecha) a 360×640 píxeles, el estado articular de 8 dimensiones y la posición cartesiana de 6 dimensiones, y emite un vector de acción de 8 dimensiones.

Su relevancia es doble: por un lado, demuestra el flujo completo de *fine-tuning* de un modelo fundacional robótico sobre un dataset pequeño y concreto (100 episodios, 51.699 fotogramas a 30 FPS); por otro, sirve como referencia reproducible para quien quiera adaptar MolmoAct2 a su propio hardware Franka mediante LeRobot. La licencia Apache 2.0 facilita su reutilización comercial, aunque el modelo solo está validado para la tarea y el montaje descritos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) MolmoAct2, implementado en LeRobot; detalles internos de capas no disponibles |
| Parámetros totales | 5.442.196.272 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural; no se documenta cobertura multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,9 GB) |

## Arquitectura y entrenamiento

La política se apoya en MolmoAct2, un modelo fundacional de robótica de Ai2 que traduce observaciones visuales e instrucciones textuales en *chunks* de acciones. La implementación en LeRobot soporta entrenamiento y evaluación del modelo MolmoAct2 estándar; este repositorio concreta esa base mediante *fine-tuning* supervisado por imitación sobre un dataset de demostraciones. La entrada combina tres cámaras (`wrist`, `left_image`, `right_image`) con resolución de 360×640 y tres canales, junto con el estado del robot (`observation.state`, 8 dimensiones) y la posición cartesiana (`observation.cartesian_position`, 6 dimensiones). La salida es un vector de acción de 8 dimensiones.

El entrenamiento se realizó sobre el dataset `local/droid-put-marker-pen`, con 100 episodios y 51.699 fotogramas a 30 FPS para la tarea "Put the marker into the pen holder". La configuración reportada es de 8.080 pasos, *batch size* 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, ejecutado con LeRobot 0.6.1. No se documentan en la información disponible detalles sobre el volumen total de tokens, la composición del corpus de preentrenamiento de MolmoAct2 ni si hubo etapas de RLHF o DPO; tampoco se describen innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico por imitación: genera *action chunks* de 8 dimensiones a partir de observaciones visuales y estado propioceptivo del brazo Franka.
- Condicionamiento por lenguaje: acepta una instrucción de tarea en texto ("Put the marker into the pen holder") que guía la política durante la ejecución.
- Percepción multi-cámara: integra simultáneamente las vistas de muñeca, izquierda y derecha para estimar la geometría de la escena.
- Ejecución en bucle cerrado: la política se ejecuta en *rollout* sobre el robot real a 30 FPS, reevaluando el estado en cada paso.
- Especialización en una tarea: el checkpoint está ajustado para una única habilidad de manipulación (colocar un rotulador en su soporte).
- Compatibilidad con el ecosistema LeRobot: entrenamiento, *rollout* y evaluación mediante las herramientas `lerobot-train` y `lerobot-rollout`.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso genérico, visión general, audio ni modo *thinking*.

## Casos de uso

- Investigación en aprendizaje por imitación: reproducir el *pipeline* completo de *fine-tuning* de MolmoAct2 sobre un dataset propio, usando este checkpoint como referencia de configuración (pasos, *batch*, LR) y de formato de observaciones.
- Benchmark de manipulación sobre Franka: emplear la tarea "Put the marker into the pen holder" como prueba controlada para comparar políticas VLA o variantes de MolmoAct2 en un montaje reproducible.
- Prototipado de estaciones robóticas de laboratorio: automatizar la recogida y colocación de objetos alargados en soportes, una habilidad representativa de tareas de inserción y ensamblaje.
- Base para *fine-tuning* con pocos datos: partir de este checkpoint y adaptarlo a tareas análogas de colocación con 50-200 episodios, aprovechando que el modelo ya ha aprendido a mapear las tres vistas de cámara a acciones.
- Validación de hardware y calibración: usar el *rollout* de la política para verificar la correcta configuración de cámaras, puerto del robot y frecuencia de control antes de entrenar políticas propias.
- Docencia en robótica de manipulación: ilustrar el ciclo observación-acción de un VLA con un caso acotado y con instrucciones de ejecución claras mediante la CLI de LeRobot.
- Evaluación de robustez visual: repetir la tarea con cambios de iluminación, posición del rotulador o distractores para medir la sensibilidad de la política, dado que no se han publicado resultados de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real (número de ensayos, éxitos y tasa de éxito) para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 5.442 millones de parámetros, una estimación orientativa en FP16 sería de ~11 GB de pesos, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles. El ejemplo de entrenamiento usa `--policy.device=cuda` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado; dependería de la cuantización, que no se documenta.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: la política opera a 30 FPS según la frecuencia del dataset; no se publican cifras de latencia por paso ni de throughput en GPU.
- Requisitos adicionales: brazo Franka con puerto de comunicación accesible y tres cámaras OpenCV configuradas con nombres que coincidan con las claves de observación (`wrist`, `left_image`, `right_image`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| droid-put-marker-pen-molmoact2 (este) | 5.442.196.272 | no disponible | Manipulación Franka, tarea única | Apache 2.0 | Hugging Face (LeRobot) |
| MolmoAct2 base (Ai2) | no disponible | no disponible | Modelo fundacional VLA general | no disponible en la información | Blog de Ai2 y LeRobot |
| Otras políticas LeRobot | no disponible | no disponible | Varía según checkpoint | varía | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Especialización extrema: el checkpoint está entrenado para una sola tarea y un solo montaje; no se espera que generalice a otras instrucciones, objetos o disposiciones de cámara.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere un Franka y tres cámaras con los nombres y resoluciones exactos del entrenamiento; cualquier cambio en la configuración invalida la política.
- Dataset pequeño: 100 episodios y una única tarea limitan la diversidad de posiciones, iluminación y distractores cubiertos.
- Riesgo de sobreajuste al entorno de recogida: cambios en la mesa, el rotulador o el soporte pueden degradar el comportamiento sin aviso.
- Idiomas no documentados: no se especifica qué lenguas acepta la instrucción de tarea ni si el condicionamiento lingüístico es multilingüe.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado con demostraciones humanas en un entorno concreto, puede heredar sesgos de las trayectorias del operador.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base MolmoAct2 y del dataset DROID subyacente.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/droid-put-marker-pen-molmoact2
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset de entrenamiento: https://huggingface.co/datasets/local/droid-put-marker-pen
