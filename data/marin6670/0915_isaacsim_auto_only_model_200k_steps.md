# marin6670/0915_isaacsim_auto_only_model_200k_steps

## Resumen

0915_isaacsim_auto_only_model_200k_steps es un ajuste fino del modelo SmolVLA (vision-language-action) publicado por el usuario marin6670 en Hugging Face. Se trata de una política robótica de 450.046.176 parámetros (~450 M) que parte de lerobot/smolvla_base y se ha entrenado durante 200.000 pasos de optimizador sobre un conjunto de datos propio capturado en el simulador Isaac Sim con un brazo SO-101. El modelo no genera texto conversacional: su salida son secuencias de acciones motoras (chunks de 50 pasos) condicionadas por imágenes de tres cámaras y el estado del robot.

El problema que resuelve es el de la especialización de un modelo fundacional robótico en unas tareas concretas de manipulación. El dataset asociado contiene 200 episodios (50 por cada objetivo: bloques, balón de baloncesto, lata de Coca-Cola y mando de Samsung TV), lo que sugiere cuatro tareas de recogida o colocación sobre las que la política ha sido entrenada. Al estar entrenado únicamente en simulación, el interés principal es como banco de pruebas para flujos de trabajo de simulación a realidad (sim2real) y para pipelines de ajuste fino con LeRobot.

La relevancia de esta publicación es limitada pero concreta: es un ejemplo reproducible de ajuste fino de SmolVLA con hiperparámetros documentados (learning rate, warmup, decaimiento coseno, congelación del codificador visual), incluye las estadísticas de preprocesado y postprocesado necesarias para la inferencia y conserva la configuración original en `provenance/`. El autor indica explícitamente que la evaluación está pendiente y que no reclama ninguna tasa de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre `lerobot/smolvla_base`; detalle interno de capas no disponible |
| Parametros totales | 450.046.176 (~450 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se declaran cuantizaciones) |
| Idiomas soportados | no disponibles (las instrucciones de lenguaje del backbone VLM no se documentan en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |
| Pasos de entrenamiento | 200.000 pasos de optimizador |
| Dataset de entrenamiento | marin6670/0915_isaacsim_so101_auto_block_basketball_coca_cola_samsung_tv_remote_control_dataset |
| Entradas | 3 camaras (front→camera1, top→camera2, wrist→camera3) y estado del robot |
| Salidas | chunk de acciones de 50 pasos (chunk size 50 / action steps 50) |
| Fecha de publicacion | 16 de septiembre de 2026 (segun la plataforma) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La familia SmolVLA combina un codificador visual, un modelo de lenguaje y un experto de acciones que produce trayectorias motoras condicionadas por la observación y la instrucción. En este ajuste fino concreto, la ficha del autor especifica que el codificador visual se mantiene congelado y que solo se entrena el experto de acciones (`train_expert_only: true`), con proyección de estado activada (`state_projection: true`). Este esquema reduce el coste de entrenamiento y preserva las representaciones visuales aprendidas en el modelo base. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si hubo fases de RLHF o DPO.

El entrenamiento se realizó con tamaño de lote 8, semilla 1000, learning rate 0,0001 con 1.000 pasos de warmup y decaimiento coseno hasta 0,0000025. El dataset consta de 200 episodios, 50 por cada uno de los cuatro objetivos, capturados en Isaac Sim sobre un brazo SO-101. El repositorio incluye el checkpoint final de inferencia y las estadísticas de preprocesado y postprocesado; el estado de reanudación del optimizador y del generador de números aleatorios permanece en la ejecución local original. La configuración de entrenamiento se conserva bajo `provenance/`.

## Capacidades

- Generación de acciones motoras para un brazo robótico SO-101 a partir de observaciones visuales y del estado del robot.
- Control visuomotor con tres vistas simultáneas (frontal, superior y de muñeca), mapeadas a camera1, camera2 y camera3.
- Ejecución de políticas con chunking de acciones: predice bloques de 50 acciones, lo que reduce la frecuencia de inferencia necesaria en el bucle de control.
- Especialización en cuatro objetivos de manipulación identificables por el nombre del dataset: bloques, balón de baloncesto, lata de Coca-Cola y mando de televisor Samsung.
- Inferencia en simulación dentro del ecosistema Isaac Sim, con posibilidad de exportar la política a un bucle de control propio mediante LeRobot.
- No dispone de tool calling, function calling ni capacidades de agente conversacional: es una política robótica, no un modelo de lenguaje de propósito general.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo de razonamiento, visión descriptiva, audio): no disponibles.

## Casos de uso

- Manipulación de objetos en simulación: la política puede ejecutar tareas de recogida y colocación de los cuatro objetos del dataset dentro de Isaac Sim, aprovechando el chunking de 50 acciones para mantener un control fluido.
- Transferencia sim2real sobre SO-101: el modelo sirve como punto de partida para experimentos de sim2real, ya que reproduce una configuración de cámaras y estado alineada con un brazo real de bajo coste.
- Banco de pruebas de ajuste fino de SmolVLA: la ficha documenta learning rate, warmup, decaimiento, semilla y política de congelación del codificador, lo que permite reproducir o comparar variantes de entrenamiento.
- Generación de datos sintéticos etiquetados: la política puede usarse para rodar episodios automáticos en Isaac Sim y ampliar el dataset con trayectorias adicionales.
- Evaluación comparativa de políticas VLA pequeñas: al ser un modelo de ~450 M, permite medir el compromiso entre coste computacional y tasa de éxito frente a alternativas mayores en un entorno controlado.
- Docencia y prototipado en robótica: el tamaño del repositorio (0,9 GB) y su integración con LeRobot lo hacen manejable para prácticas de aprendizaje por imitación en laboratorio.
- Integración en pipelines de investigación con ROS o con el bucle de control de Isaac Sim, alimentando la política con las tres cámaras y el estado del efector final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica literalmente que los resultados de evaluación están pendientes y que no se reclama ninguna tasa de éxito en esta publicación inicial.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del número de parámetros, los pesos ocupan aproximadamente 0,9 GB en precisión de 16 bits y 1,8 GB en fp32; sumando activaciones y los tres flujos de cámara, una estimación razonable se sitúa en el rango de 2 a 4 GB. Es una estimación derivada del recuento de parámetros, no una medición publicada.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente en teoría; no hay validación publicada en ningún modelo concreto.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se documenta ninguna prueba en tarjetas como RTX 3060, RTX 4090 o similares.
- Opciones de despliegue: la librería declarada es LeRobot (integración con PyTorch) y el entorno de entrenamiento es Isaac Sim. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0915_isaacsim_auto_only_model_200k_steps | 450.046.176 | no disponible | sin evaluacion publicada | no disponible | Hugging Face (0 descargas) |
| lerobot/smolvla_base | misma familia SmolVLA (~450 M segun el modelo derivado) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |
| Alternativas VLA de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo ni sobre alternativas comparables; los resultados obtenidos no guardan relacion con el ambito de la robotica. No se dispone, por tanto, de datos verificables para comparar con otras familias de politicas vision-language-action.

## Limitaciones y advertencias

- No hay evaluación publicada: el autor afirma que los resultados estan pendientes y no reclama ninguna tasa de éxito, por lo que el rendimiento real de la política es desconocido.
- Entrenamiento exclusivamente en simulación (Isaac Sim): no se ha validado el comportamiento en un robot físico, y la brecha sim2real puede degradar el rendimiento de forma notable.
- Dataset muy reducido: 200 episodios en total, 50 por objetivo, capturados con una sola semilla (1000) y un tamaño de lote de 8; el riesgo de sobreajuste a las condiciones de simulación es alto.
- Especialización estrecha: la política está condicionada a cuatro objetos concretos y a una configuración fija de tres cámaras; cambiar la disposición, la iluminación o el mapeo de cámaras puede invalidar el comportamiento.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas y condicionamiento por lenguaje natural: no documentados, por lo que no se puede garantizar que la política responda a instrucciones textuales fuera de las del dataset de entrenamiento.
- Sin soporte documentado de cuantización ni de runtimes optimizados (vLLM, llama.cpp, GGUF), lo que limita las opciones de despliegue en producción.
- Metadatos incompletos: el repositorio no incluye el estado del optimizador ni del generador aleatorio, lo que impide reanudar el entrenamiento exactamente desde el punto publicado.
- Al ser un modelo con 0 descargas y 0 likes, no existe validación externa ni reportes de terceros sobre su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marin6670/0915_isaacsim_auto_only_model_200k_steps
- Dataset de entrenamiento: https://huggingface.co/datasets/marin6670/0915_isaacsim_so101_auto_block_basketball_coca_cola_samsung_tv_remote_control_dataset
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Libreria declarada (LeRobot): https://github.com/huggingface/lerobot
- Paper, blog, repositorio o demo adicionales: no disponibles; la busqueda web no devolvio resultados relevantes para este modelo.
