# louiscasteur/act-30ep-100k

## Resumen

El modelo `louiscasteur/act-30ep-100k` es una política de robótica basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto se ha entrenado para la tarea de clasificar objetos por color en un robot tipo `so_follower` (probablemente un robot SO-100 de bajo coste), utilizando dos cámaras (frontal y pinza) y un vector de estado de 6 dimensiones.

Con 51,67 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware modesto. Su relevancia radica en que demuestra el flujo completo de LeRobot: desde la recopilación de datos teleoperados hasta el entrenamiento y despliegue de una política de imitación. El entrenamiento se realizó durante 100.000 pasos sobre un dataset de 50 episodios y 20.285 fotogramas a 30 FPS. No se han publicado resultados de evaluación en el repositorio, por lo que su rendimiento real en robot aún no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (trabaja con chunks de acciones, no con texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision-accion, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que aprende a predecir un bloque de acciones futuras (por ejemplo, 50 pasos) a partir de observaciones actuales (imágenes y estado del robot). El método, presentado en el paper arXiv:2304.13705, emplea un codificador de visión (típicamente ResNet) para procesar las imágenes, un transformer para modelar la secuencia temporal y un decodificador que genera el chunk de acciones. Esto reduce la propagación de errores y mejora la suavidad del movimiento en comparación con políticas que predicen una sola acción.

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre el dataset `willemelliw/record_30_ep_2_item`, que contiene 50 episodios teleoperados de la tarea "clasificar objetos por color", con 20.285 fotogramas a 30 FPS. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate 1e-5 y seed 1000. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento; es un entrenamiento puramente por imitación supervisada.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) para tareas de manipulación, como clasificar objetos por color.
- Entrada multimodal: procesa dos flujos de imagen (cámara frontal y cámara de pinza) junto con un vector de estado del robot (6 dimensiones).
- Salida de acción continua: genera un vector de acción de 6 dimensiones (probablemente posiciones articulares o comandos de velocidad) para cada paso temporal.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye capacidades de lenguaje, tool calling ni razonamiento general; es un modelo especializado en visión-accion para robótica.

## Casos de uso

- Clasificacion de objetos por color en entornos de fabricacion: el modelo puede controlar un brazo robotico para separar piezas de diferentes colores en contenedores distintos, una tarea tipica en lineas de montaje.
- Prototipado rapido de politicas de imitacion: investigadores pueden usar este modelo como referencia para entrenar sus propias politicas ACT con LeRobot, partiendo de una configuracion ya validada.
- Educacion en robotica: sirve como ejemplo didactico para ensenar el flujo completo de aprendizaje por imitacion (recopilacion de datos, entrenamiento, despliegue) en plataformas de bajo coste como SO-100.
- Automatizacion de tareas repetitivas en laboratorios: el modelo puede gestionar la clasificacion de muestras o materiales en entornos cientificos donde la variabilidad es limitada.
- Benchmarking de metodos de aprendizaje por imitacion: al estar publicado con licencia Apache 2.0, puede utilizarse como punto de comparacion para evaluar nuevas arquitecturas o tecnicas de entrenamiento.
- Desarrollo de sistemas de manipulacion con feedback visual: la combinacion de dos camaras permite al modelo adaptarse a variaciones de posicion y orientacion de los objetos, facilitando su uso en entornos semi-estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica. Por tanto, no se dispone de metricas como tasa de exito, MMLU u otros indicadores comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene 51,67 millones de parametros, en precision FP32 ocuparia aproximadamente 200 MB de memoria. Sin embargo, al procesar dos imagenes de 480x640, la VRAM necesaria depende del batch y del tamaño de los tensores intermedios. En la practica, una GPU con 4 GB de VRAM seria suficiente para inferencia en tiempo real.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como una NVIDIA GTX 1650, RTX 3060 o superior. El modelo tambien podria ejecutarse en CPU para pruebas no interactivas, aunque con menor rendimiento.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer actual (incluso integradas si se reduce la resolucion de imagen).
- Opciones de despliegue: LeRobot proporciona comandos como `lerobot-rollout` para ejecutar la politica en un robot real. Tambien es posible exportar el modelo a otros formatos, aunque no se ha documentado soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano del modelo y la entrada de imagenes, se espera una latencia de decenas de milisegundos por paso en GPU moderna, suficiente para control en tiempo real a 30 FPS.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de la misma categoria. El modelo es una politica ACT especifica entrenada para una tarea concreta, y no existen en los datos proporcionados referencias a modelos alternativos comparables (por ejemplo, otras politicas de LeRobot para la misma tarea o arquitecturas similares). Por tanto, la comparativa se limita a indicar que ACT es uno de los metodos de imitacion mas utilizados en el ecosistema LeRobot, junto con Diffusion Policy u otros, pero no se aportan datos cuantitativos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del dataset de entrenamiento, que fue recopilado por un unico operador y probablemente en un entorno fijo. Puede fallar ante variaciones de iluminacion, posicion de camaras o disposicion de objetos no presentes en los datos.
- Riesgo de alucinacion: no aplica directamente, pero el modelo puede generar acciones incorrectas o inestables si las observaciones difieren significativamente de las vistas durante el entrenamiento.
- Limitaciones de contexto: al ser un modelo de vision-accion, no maneja lenguaje ni razonamiento simbolico. Su capacidad se limita a la tarea especifica de clasificar objetos por color.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero no se proporcionan garantias de rendimiento ni soporte.
- Caveat para produccion: no hay resultados de evaluacion publicados, por lo que su fiabilidad en entornos reales no esta demostrada. Se recomienda realizar pruebas exhaustivas antes de cualquier despliegue en produccion.
- Dependencia del hardware: el rendimiento puede variar segun el robot y las camaras utilizadas; los nombres de las claves de observacion deben coincidir exactamente con los del entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/louiscasteur/act-30ep-100k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/willemelliw/record_30_ep_2_item
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
