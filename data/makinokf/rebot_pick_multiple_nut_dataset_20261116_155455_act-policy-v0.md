# MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455_act-policy-v0

## Resumen

`MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455_act-policy-v0` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) sobre el framework LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de dos cámaras RGB y del estado articular del robot, predice directamente comandos de acción de 7 dimensiones. El autor, MakinoKF, lo ha entrenado sobre un dataset propio de 149 episodios de teleoperación para la tarea concreta de "pick the nut" (recoger una tuerca) con un robot `rebot_b601_follower`.

El modelo resuelve el problema clásico de la manipulación robótica de precisión: aprender una política de agarre a partir de demostraciones humanas, sin modelado explícito del entorno ni planificación simbólica. ACT aborda la inestabilidad temporal de las políticas paso a paso prediciendo *chunks* de acciones (secuencias cortas de comandos) en lugar de una única acción, lo que reduce el error acumulado y la varianza en la ejecución. Es relevante ahora porque demuestra el flujo completo de LeRobot: grabar datos con un robot de bajo coste, entrenar una política ACT y desplegarla en hardware real con un único comando CLI.

La arquitectura es un transformer encoder-decoder con un cuello de botella latente estilo CVAE que condiciona la predicción en la observación visual y propioceptiva. Con 51,67 millones de parámetros y un repositorio de solo 0,2 GB, es un modelo ligero pensado para inferencia en tiempo real a 30 FPS en una estación de trabajo con GPU consumer. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE latente |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo visuomotor, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | rebot_b601_follower |
| Camaras | top, right (640x480, 3 canales) |
| Entrada observation.state | STATE, shape (7,) |
| Entrada observation.images.top | VISUAL, shape (3, 480, 640) |
| Entrada observation.images.right | VISUAL, shape (3, 480, 640) |
| Salida action | ACTION, shape (7,) |
| Tamano del repositorio | 0,2 GB |
| Descargas | 67 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado específicamente para imitación robótica. El encoder procesa las observaciones multimodales (las dos imágenes de 480x640 y el vector de estado articular de 7 dimensiones) y las proyecta a una representación latente; el decoder genera un *chunk* de acciones futuras de forma autorregresiva. La variante CVAE introduce una variable latente que se condiciona durante el entrenamiento con la secuencia de acciones ground-truth, lo que permite al modelo capturar la multimodalidad de las demostraciones humanas (por ejemplo, distintos agarres válidos para la misma tuerca) sin colapsar a una media. En inferencia, la latente se fija a la media de la prior, lo que produce ejecuciones deterministas y estables.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455`: 149 episodios, 39.013 frames a 30 FPS (aproximadamente 21,7 minutos de teleoperación efectiva) y una única instrucción de tarea, "pick the nut.". La configuración fue de 100.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni fine-tuning posterior; es imitación supervisada pura sobre demostraciones. La innovación clave frente a políticas paso a paso es la predicción de chunks de acciones, que mitiga el error compounding y permite inferencia a menor frecuencia que el control del robot.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 7 dimensiones (típicamente 6 articulaciones más gripper) a partir de dos vistas RGB y el estado articular.
- Predicción de chunks de acciones: emite secuencias cortas de comandos por inferencia, lo que estabiliza la ejecución frente a políticas reactivas paso a paso.
- Condicionamiento multimodal: fusiona información visual (cámara top y cámara right) con propiocepción (observation.state) en una única representación latente.
- Ejecución determinista en despliegue: la latente CVAE se fija a la prior, lo que evita variabilidad no deseada entre rollouts.
- Tarea única especializada: "pick the nut." sobre el robot rebot_b601_follower; no generaliza a otras tareas sin reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No procesa audio, texto libre ni imágenes de propósito general; las cámaras y el estado articular son las únicas entradas.

## Casos de uso

- Recogida automatizada de piezas pequeñas en línea de montaje: el modelo ejecuta la política "pick the nut." sobre el robot rebot_b601_follower a 30 FPS, adecuado para ciclos repetitivos de alimentación de tuercas en una célula de ensamblaje.
- Prototipado rápido de tareas de manipulación con LeRobot: sirve como plantilla reproducible para validar el pipeline completo (grabación con `lerobot-record`, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) antes de escalar a tareas más complejas.
- Investigación en imitación robótica: referencia de bajo coste (51,67 M parámetros, 0,2 GB) para estudiar el efecto del chunking de acciones, la latente CVAE y la sensibilidad al número de episodios de demostración.
- Benchmark de hardware de bajo coste: al caber en una GPU consumer, permite medir latencia y throughput de ACT en estaciones de trabajo sin aceleradores de datacenter.
- Docencia y formación en robótica de manipulación: ejemplo completo y ligero para enseñar el ciclo teleoperación-entrenamiento-despliegue con hardware asequible.
- Base para fine-tuning en tareas de pick-and-place: al estar bajo Apache 2.0 y entrenado con LeRobot, puede reentrenarse sobre nuevos datasets de agarre con cambios mínimos en la configuración.
- Validación de calibración de cámaras y robot: al depender de las vistas `top` y `right` y del estado de 7 articulaciones, el despliegue sirve para verificar la cadena de calibración del `rebot_b601_follower`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de tasas de éxito por tarea, número de ensayos ni condiciones de evaluación (posiciones de objeto, iluminación, distractores). Tampoco se reportan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la huella de memoria la dominan los buffers de las dos cámaras 480x640 y las activaciones del transformer.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente por tamaño; se espera que una RTX 3060 o superior ejecute la política en tiempo real a 30 FPS, aunque no se han publicado mediciones.
- Cabe en GPU consumer: sí, con margen amplio; el repositorio completo pesa 0,2 GB.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada; también es posible cargar los pesos safetensors con PyTorch directamente para integraciones a medida.
- Latencia y throughput: no disponibles; la model card no reporta FPS de inferencia ni latencia por chunk.
- Requisitos adicionales: robot `rebot_b601_follower` calibrado, dos cámaras OpenCV a 640x480 y 30 FPS, y un puerto serie para el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455_act-policy-v0 | 51,67 M | 2 imagenes 480x640 + estado (7,) | pick the nut. (rebot_b601_follower) | Apache 2.0 | Hugging Face, 67 descargas |
| Politicas ACT genericas de LeRobot | no disponible | variables segun dataset | multiples tareas de manipulacion | Apache 2.0 (tipico) | Hugging Face / docs LeRobot |
| Diffusion Policy (referencia del ecosistema LeRobot) | no disponible | imagenes + estado | manipulacion visuomotora | no disponible | Hugging Face / LeRobot |
| VQ-BeT (referencia del ecosistema LeRobot) | no disponible | imagenes + estado | manipulacion visuomotora | no disponible | Hugging Face / LeRobot |

La comparativa se limita a alternativas del ecosistema LeRobot porque no se dispone de datos publicados de parámetros, contexto o rendimiento para modelos concretos comparables en la información proporcionada. No se han encontrado cifras de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "pick the nut." con el robot `rebot_b601_follower`; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba documentadas, por lo que el rendimiento real en producción es desconocido.
- Dependencia de calibración: cambios en la posición o calibración de las cámaras `top` y `right`, o en el robot, degradan la política sin aviso.
- Sensibilidad al dominio visual: iluminación, fondos, posiciones de objeto y distractores distintos a los del dataset de entrenamiento pueden provocar fallos de agarre.
- Dataset pequeño: 149 episodios y 39.013 frames son suficientes para una tarea simple, pero limitan la robustez frente a variaciones.
- Sin capacidades de lenguaje ni razonamiento simbólico: no interpreta instrucciones en lenguaje natural ni planifica; la tarea está fijada en el prompt de entrenamiento.
- Riesgo de sobreajuste al hardware: el estado de 7 dimensiones y las dos cámaras están acoplados al robot `rebot_b601_follower`; portarlo a otro robot requiere reentrenar.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; la responsabilidad de validación en producción recae en el integrador.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución: al ser un modelo visuomotor, los riesgos son físicos (colisiones, agarres fallidos) más que informativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455_act-policy-v0
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
