# shubhdotai/obj_to_mug_act_policy

## Resumen

`shubhdotai/obj_to_mug_act_policy` es una política de robótica entrenada con imitación (imitation learning) mediante el método ACT (Action Chunking with Transformers), publicado en el artículo arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo robótico `so_follower` (vector de 6 dimensiones) más una imagen de una cámara frontal de 480x640 píxeles, y produce una acción de 6 dimensiones. Su única tarea aprendida es "Pick up the red cube and place it in the left mug" (coger el cubo rojo y colocarlo en la taza izquierda).

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) según los pesos en safetensors del repositorio, que ocupa 0,2 GB. Se entrenó durante 20.000 pasos con batch de 8, optimizador AdamW y tasa de aprendizaje 1e-5 sobre un conjunto de datos propio de 20 episodios y 7.577 fotogramas grabados a 30 FPS. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es doble: por un lado sirve como referencia práctica de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`); por otro, es un caso de política de tarea única, embodiment único y presupuesto de datos muy reducido, lo que la convierte en un ejemplo útil para estudiar los límites de generalización de ACT. Hay que tener en cuenta que el repositorio no incluye resultados de evaluación en robot real ni métricas de éxito, y que no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según arXiv:2304.13705; transformer con encoder CVAE y predicción de fragmentos de acción |
| Parámetros totales | 51.668.614 (≈51,7 M), según los pesos safetensors del repositorio |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. No es un modelo de lenguaje: la observación es un estado de 6 dimensiones más una imagen de 3x480x640, y la salida es una acción de 6 dimensiones |
| Tipos de cuantización | No disponible. El repositorio distribuye safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible. No es un modelo de lenguaje; la instrucción de tarea se especifica en inglés en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras | `front` (una sola cámara) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `shubhdotai/obj_to_mug_20260915_001612`: 20 episodios, 7.577 fotogramas, 30 FPS |
| Tarea entrenada | "Pick up the red cube and place it in the left mug" |
| Pasos de entrenamiento | 20.000 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice fragmentos (`chunks`) de acciones futuras de una sola vez. Esto reduce el error de acumulación de la política y suaviza el control, y es la razón por la que el método obtiene tasas de éxito altas en tareas manipulativas con hardware de bajo coste, según el artículo original (arXiv:2304.13705). La formulación del paper combina un encoder CVAE, que modela la variabilidad de las demostraciones humanas durante el entrenamiento y se descarta en inferencia, con un transformer encoder-decoder que consume observaciones visuales y propioceptivas, más el ensamblado temporal de los fragmentos predichos. Los detalles concretos de configuración del transformer en esta política (número de capas, dimensión oculta, tamaño de fragmento) no están publicados en la model card.

Los datos de entrenamiento provienen de teleoperación real sobre un brazo `so_follower` (familia SO-100/SO-101) con una cámara frontal. El conjunto tiene 20 episodios y 7.577 fotogramas a 30 FPS, es decir, unos 252 segundos de interacción efectiva, todos ellos sobre una única tarea y presumiblemente en un único entorno. La configuración de entrenamiento declarada es: 20.000 pasos, batch de 8, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.2. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en este tipo de política.

## Capacidades

- Control visomotor de tarea única: a partir de la imagen frontal y del estado articular de 6 grados de libertad, genera comandos de acción de 6 dimensiones para el brazo `so_follower`.
- Predicción de fragmentos de acción: la política emite secuencias cortas de acciones en lugar de pasos individuales, lo que aporta suavidad y estabilidad al control (propiedad del método ACT).
- Ejecución autónoma en bucle cerrado: la observación se realimenta en cada ciclo, de modo que la política reacciona a la posición real del brazo y del objeto.
- Despliegue directo con herramientas de LeRobot: se ejecuta con `lerobot-rollout` indicando `--policy.path=shubhdotai/obj_to_mug_act_policy` y la tarea como texto.
- Reentrenamiento y ajuste fino: al ser un checkpoint de ACT en formato LeRobot, puede reentrenarse con `lerobot-train --policy.type=act` sobre el mismo dataset u otros.
- Sin capacidades de lenguaje, razonamiento simbólico, tool calling, agentes, visión general, audio ni multilingüismo: no es un modelo generativo de texto.

## Casos de uso

- Automatización de una celda pick-and-place concreta: el modelo puede recoger un cubo rojo y depositarlo en la taza izquierda en un puesto de trabajo repetitivo con un brazo SO-100/SO-101, siempre que la disposición de cámara, iluminación y objetos coincida con la del entrenamiento.
- Base para ajuste fino de nuevas tareas de recogida: partiendo de este checkpoint, un equipo puede grabar 20-50 episodios de otra tarea con la misma cinemática de robot y reentrenar con `lerobot-train --policy.type=act`, aprovechando que el formato de datos y de pesos es el estándar de LeRobot.
- Referencia (baseline) para investigación en imitación: al ser un ACT entrenado con un presupuesto de datos muy pequeño y conocido (7.577 fotogramas), sirve para comparar con Diffusion Policy, VLA u otros métodos bajo condiciones controladas.
- Validación de pipelines de datos teleoperados: el repositorio permite comprobar de extremo a extremo el flujo grabación -> dataset en el Hub -> entrenamiento -> rollout, útil para equipos que montan su primera infraestructura de robótica con LeRobot.
- Docencia y formación en robótica: es un ejemplo autocontenido de 0,2 GB que se puede ejecutar en un portátil con GPU modesta para explicar el ciclo de aprendizaje por imitación, el formateo de observaciones y la latencia de control a 30 FPS.
- Pruebas de integración y simulación: puede integrarse como política de referencia en entornos simulados que reproduzcan el espacio de acciones de 6 dimensiones y la cámara frontal, para validar el bucle de control antes de tocar hardware.
- Pruebas de regresión de despliegue: útil para verificar que la calibración del brazo, los nombres de las claves de observación (`observation.images.front`) y la resolución 640x480 se corresponden con lo que la política espera antes de pasar a tareas críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor incluye la sección de evaluación vacía con la indicación explícita de que no se han proporcionado resultados en robot real (`No evaluation results have been provided for this policy yet.`). No hay datos de tasa de éxito, número de ensayos, MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no aplican a una política robótica de acción.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del recuento real de 51,7 millones de parámetros, los pesos ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16; sumando activaciones del backbone visual y del transformer, el consumo total debería quedar por debajo de 1-2 GB. Es una estimación calculada, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. No se necesitan A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna, e incluso es viable ejecutar la inferencia en CPU, aunque con menor margen para sostener el bucle de control a 30 FPS.
- Opciones de despliegue: la vía soportada es LeRobot sobre PyTorch (`lerobot-rollout` para ejecutar y `lerobot-train` para entrenar). No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de inferencia para modelos de lenguaje.
- Latencia y throughput: no disponibles. El requisito implícito es sostener el bucle de control a la frecuencia de los datos de entrenamiento, 30 FPS, es decir, unos 33 ms por inferencia para no degradar el comportamiento.
- Requisitos adicionales: un brazo `so_follower` calibrado, una cámara configurada a 640x480 y 30 FPS, y que el nombre de la cámara coincida con `observation.images.front`.

## Comparativa con modelos similares

Los datos cuantitativos de los modelos alternativos no proceden de la información proporcionada, por lo que se marcan como no disponibles. La comparación es, por tanto, cualitativa.

| Modelo | Tipo | Parámetros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shubhdotai/obj_to_mug_act_policy` (este) | ACT, imitación con fragmentos de acción | 51.668.614 (≈51,7 M) | Tarea única: cubo rojo a la taza izquierda; robot `so_follower` | Apache 2.0 | Repositorio Hugging Face con safetensors; 0 descargas |
| Diffusion Policy | Política visomotora basada en modelos de difusión | No disponible | Tareas de manipulación; disponible como política en LeRobot | No disponible | Ecosistema LeRobot |
| SmolVLA | Modelo visión-lenguaje-acción con condicionamiento por lenguaje | No disponible | Robótica generalista con instrucciones en lenguaje | No disponible | Ecosistema LeRobot |
| Otros checkpoints ACT de la comunidad | ACT, imitación con fragmentos de acción | No disponible | Variables según el autor | Habitualmente Apache 2.0 o MIT | Hugging Face |

La diferencia funcional clave frente a SmolVLA es que este checkpoint no acepta instrucciones en lenguaje ni generaliza a tareas no vistas: está especializado en una única tarea y un único embodiment.

## Limitaciones y advertencias

- Especialización extrema: solo ha aprendido una tarea ("Pick up the red cube and place it in the left mug") sobre un único robot `so_follower`, con una única cámara y un único entorno. Cualquier cambio de disposición, color, iluminación o tipo de objeto invalida su comportamiento.
- Presupuesto de datos muy reducido: 20 episodios y 7.577 fotogramas a 30 FPS (unos 252 segundos) son insuficientes para esperar robustez frente a cambios de posición, distractores o condiciones de luz distintas.
- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni resultados en robot real. No se puede afirmar qué fiabilidad tiene en producción.
- Sin validación de la comunidad: 0 descargas y 0 valoraciones en el momento de redactar la ficha; no hay evidencia externa de que el modelo funcione.
- Riesgo de sobreajuste y de fallo silencioso: en políticas de imitación con pocos datos, el modelo puede ejecutar movimientos plausibles pero incorrectos ante entradas fuera de distribución, sin ninguna señal de error. No existe un mecanismo de abstención ni de detección de incertidumbre.
- Dependencia estricta de la interfaz: los nombres de las claves de observación deben coincidir exactamente (`observation.state`, `observation.images.front`), y la cámara debe entregar 640x480 a 30 FPS. Un desajuste de calibración o de resolución degrada el control.
- Sin capacidades de lenguaje ni multilingües: no se le puede dar una instrucción en castellano ni en ningún otro idioma; la tarea se pasa como texto fijo en el comando de rollout.
- Alucinación: el concepto no aplica en el sentido de un LLM, pero el riesgo equivalente es la generación de trayectorias no fundamentadas en el estado real de la escena.
- Seguridad física: cualquier despliegue debe ejecutarse en una zona de trabajo acotada, con parada de emergencia y límites de par, dado que no se documentan límites de seguridad ni validación de movimientos.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cite adecuadamente el método ACT, el dataset y LeRobot. No hay restricciones de uso comercial declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shubhdotai/obj_to_mug_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/shubhdotai/obj_to_mug_20260915_001612
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shubhdotai/obj_to_mug_20260915_001612
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden del repositorio y de la model card.
