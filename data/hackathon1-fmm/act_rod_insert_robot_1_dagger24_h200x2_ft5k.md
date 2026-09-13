# hackathon1-fmm/act_rod_insert_robot_1_dagger24_h200x2_ft5k

## Resumen

El modelo `hackathon1-fmm/act_rod_insert_robot_1_dagger24_h200x2_ft5k` es una política robótica de imitación entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. Lo desarrolla el usuario `hackathon1-fmm` y se distribuye a través de Hugging Face usando la librería LeRobot (versión 0.6.2). Su función es controlar un robot manipulador de tipo `rebot_b601_follower` para ejecutar una tarea concreta de inserción: «Grasp the rod and insert it from above into the tube» (agarrar una varilla e insertarla desde arriba dentro de un tubo).

Con 51.670.663 parámetros, el modelo consume tres cámaras RGB de resolución 480x640 (`front`, `side`, `wrist`) más un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones por paso. A diferencia de los modelos de lenguaje, no procesa texto ni tiene una ventana de contexto en tokens: ACT predice «chunks» de acciones (secuencias cortas de comandos) a partir de observaciones visuales y propioceptivas, lo que reduce el error de acumulación típico de las políticas que predicen un único paso.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, publicación y despliegue de políticas robóticas reales en PyTorch, y porque la variante `dagger24` del dataset sugiere el uso de agregación iterativa de datos con correcciones humanas (DAgger) para mejorar la robustez de la política en la tarea de inserción. No incluye resultados de evaluación publicados ni métricas de éxito declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers) con encoder visual y decoder de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible (no se declaran cuantizaciones; pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible / no aplica (modelo de control robótico, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | rebot_b601_follower |
| Camaras | front, side, wrist (3, 480, 640) cada una |
| Entradas | observation.state (7,), observation.images.front/side/wrist (3, 480, 640) |
| Salidas | action (7,) |
| Tamano del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un encoder de visión (para procesar las tres vistas de cámara), un encoder de estado propioceptivo (el vector de 7 dimensiones) y un decoder transformer que genera un chunk de acciones en lugar de un solo paso. Durante el entrenamiento, el método original utiliza un autoencoder variacional (VAE) sobre las secuencias de acción para modelar la variabilidad de las demostraciones humanas; en inferencia se emplea únicamente el transformer. El número de parámetros totales, 51.670.663, es coherente con una política ACT compacta orientada a una sola tarea.

Los datos de entrenamiento provienen del dataset `hackathon1-fmm/rod_insert_robot_1_v0_plus_dagger24_h264`, con 124 episodios y 39.807 frames capturados a 15 FPS, correspondientes a la tarea de inserción de la varilla en el tubo. La configuración declarada de entrenamiento es de 5.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. El sufijo `dagger24` del dataset y del nombre del modelo apunta a la incorporación de datos de corrección mediante DAgger (Dataset Aggregation), aunque la model card no detalla el procedimiento exacto ni la proporción de datos de corrección frente a demostraciones iniciales.

## Capacidades

- Generación de acciones de control continuas de 7 dimensiones para un robot manipulador `rebot_b601_follower`.
- Predicción por chunks de acciones, lo que mejora la estabilidad frente a la predicción paso a paso en tareas de contacto fino.
- Percepción visual multi-cámara: utiliza simultáneamente vistas frontal, lateral y de muñeca.
- Fusión de estado propioceptivo (posición/articulación) con información visual.
- Ejecución de una única tarea especializada: agarrar una varilla e insertarla desde arriba en un tubo.
- Soporte de despliegue mediante el comando `lerobot-rollout` con estrategia `base`.
- No soporta tool calling, function calling, agentes, ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües ni de modo de pensamiento (thinking mode).
- No procesa audio ni texto.

## Casos de uso

- Automatización de una celda de inserción de precisión: la política puede controlar el brazo para alinear y meter la varilla en el tubo, una tarea que requiere tolerancias milimétricas y donde el chunking de acciones reduce las oscilaciones.
- Banco de pruebas de imitación visual: sirve como referencia para comparar configuraciones de cámaras, iluminación o velocidad de captura en una tarea de contacto.
- Base para fine-tuning con nuevos datos: partiendo de estos pesos se puede reentrenar con `lerobot-train` sobre variaciones de la tarea (otra posición de tubo, otro objeto) usando menos episodios.
- Integración en un pipeline de investigación con LeRobot: permite reproducir de extremo a extremo el flujo grabar dataset, entrenar, publicar y desplegar con `lerobot-rollout`.
- Evaluación de técnicas de agregación de datos: al provenir de un dataset con correcciones estilo DAgger, es útil para estudiar cuánto mejora la política frente a entrenamientos solo con demostraciones iniciales.
- Prototipado rápido en laboratorio con un robot de bajo coste: sus 51,67 M de parámetros permiten inferencia en tiempo real en GPU de gama media, sin necesidad de clústeres.
- Docencia y talleres de robótica: sirve como ejemplo didáctico completo de una política de imitación publicada en el Hub con dataset, código y comandos de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea «No evaluation results have been provided for this policy yet», por lo que no hay tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,67 M de parámetros, los pesos en fp32 ocupan aproximadamente 207 MB y en fp16 unos 103 MB; sumando activaciones de las tres imágenes de 480x640 y el estado, la inferencia cabe holgadamente por debajo de 2 GB de VRAM. Estimación orientativa, no declarada por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA de gama media o alta es suficiente; una RTX 3060, RTX 4090, A100 o H100 ejecutarían la política sin cuello de botella de memoria. El nombre del modelo (`h200x2`) sugiere que el entrenamiento se realizó con dos NVIDIA H200.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con al menos 2-4 GB de VRAM; también es viable la ejecución en CPU, aunque con mayor latencia por inferencia.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path` apuntando al repositorio, integrado en el ecosistema LeRobot. No se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El dataset se capturó a 15 FPS, por lo que la política debe sostener idealmente ese régimen de control, pero la model card no aporta cifras de latencia medidas.
- Nota: el repositorio ocupa 3,1 GB, muy por encima del tamaño de los pesos, lo que indica que incluye checkpoints de entrenamiento u otros artefactos además del archivo safetensors de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_rod_insert_robot_1_dagger24_h200x2_ft5k (este modelo) | 51.670.663 | ACT (transformer, imitación) | Inserción de varilla en tubo, robot rebot_b601_follower | apache-2.0 | Hugging Face, librería lerobot |
| ACT original (arXiv:2304.13705) | no disponible | ACT (transformer, imitación) | Manipulación bimanual de precisión | no disponible | Paper + implementación de referencia |
| Diffusion Policy | no disponible | Política generativa por difusión | Manipulación robótica diversa | no disponible | Repositorio público |
| Otras políticas del Hub de LeRobot | no disponible | ACT / diffusion / otros | Tareas específicas por robot | variable | Hugging Face |

Los datos de parámetros, contexto y rendimiento de las alternativas no están disponibles en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Tarea única y especializada: la política está entrenada exclusivamente para «grasp the rod and insert it from above into the tube», por lo que no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, de modo que no se puede afirmar su fiabilidad en producción.
- Dependencia del hardware de captura: espera exactamente tres cámaras con nombres `front`, `side` y `wrist` a 480x640; cualquier cambio de resolución, número o disposición de cámaras invalidaría la política.
- Dependencia del robot: diseñada para el tipo `rebot_b601_follower`; otro robot con cinemática o espacio de acciones distinto requeriría adaptación.
- Riesgo de sobreajuste al entorno de recogida de datos: posiciones de objetos, iluminación, fondo o distracciones distintos a los del dataset pueden degradar el comportamiento. La model card no documenta variaciones de dificultad evaluadas.
- Riesgo de alucinación en sentido coloquial: como política de imitación, puede producir acciones fuera de distribución ante observaciones no vistas, con riesgo de colisiones o daños físicos. Requiere supervisión y paradas de seguridad.
- Sesgos de los datos de demostración: al provenir de teleoperación humana y correcciones DAgger, hereda las trayectorias y sesgos del operador que grabó los 124 episodios.
- Licencia apache-2.0: permite uso comercial y modificación, siempre que se conserven los avisos de copyright y se cumplan las condiciones de la licencia.
- Sin datos de idiomas: no es un modelo lingüístico, por lo que la ausencia de idiomas soportados no es una carencia, sino que refleja su naturaleza.
- Madurez baja en el Hub: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hackathon1-fmm/act_rod_insert_robot_1_dagger24_h200x2_ft5k
- Dataset de entrenamiento: https://huggingface.co/datasets/hackathon1-fmm/rod_insert_robot_1_v0_plus_dagger24_h264
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hackathon1-fmm/rod_insert_robot_1_v0_plus_dagger24_h264
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
