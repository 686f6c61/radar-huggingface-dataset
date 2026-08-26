# HyeonseokE/smolvla_phase1_push_button_A1_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico con instrucciones en lenguaje natural. Este repositorio concreto, `HyeonseokE/smolvla_phase1_push_button_A1_1000_10fps`, es un fine-tune del modelo base `lerobot/smolvla_base` para la tarea específica de pulsar un botón rojo con un brazo robótico SO-101. El modelo fue desarrollado por HyeonseokE y entrenado con el framework LeRobot sobre un dataset de 100 episodios muestreados a 10 FPS, derivado de la suite de tareas LeRobot v3.

La relevancia de este modelo radica en que SmolVLA demuestra que es posible obtener un rendimiento competitivo en tareas de manipulación robótica con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Con 450 millones de parámetros, es significativamente más pequeño que otros VLA como OpenVLA (7B), lo que lo hace accesible para investigación y prototipado. El modelo consume tres imágenes de cámara (256x256) y el estado del robot (6 dimensiones) para producir acciones articulares de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA, fine-tune de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en ingles, segun la tarea "Press the red button") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. El paper original (arXiv:2506.01844) describe una arquitectura compacta que aprovecha un VLM preentrenado a pequeña escala para reducir el coste computacional frente a VLA masivos. Este repositorio concreto es un fine-tune del checkpoint `lerobot/smolvla_base` sobre un dataset de demostraciones de pulsacion de boton.

El entrenamiento se realizo con LeRobot 0.6.0, usando 8800 pasos con batch size 64, optimizador AdamW y learning rate 0.0001, con semilla 1000. El dataset de entrenamiento contiene 100 episodios y 11.299 frames a 10 FPS, con la tarea anotada como "Press the red button". No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; es un entrenamiento de imitacion supervisada estandar.

## Capacidades

- Control robotico de un brazo SO-101 para ejecutar la tarea de pulsar un boton rojo.
- Entrada multimodal: estado del robot (6 dimensiones) y tres imagenes de camara (256x256 cada una).
- Salida de acciones articulares de 6 dimensiones, incluyendo la variable `action.radian_urdf0`.
- Ejecucion de tareas especificadas mediante instrucciones en lenguaje natural (en este caso, "Press the red button").
- Inferencia a 10 FPS, acorde con la frecuencia de muestreo del dataset de entrenamiento.
- No es un modelo generalista: esta especializado en la tarea de pulsacion de boton con la configuracion de camaras y robot especificas.

## Casos de uso

- Automatizacion de tareas de pulsacion de botones en entornos industriales: el modelo puede integrarse en un brazo robotico SO-101 para activar interruptores o botones fisicos de forma autonoma, reduciendo la intervencion humana en procesos repetitivos.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto de la frecuencia de muestreo (10 FPS frente a 30 FPS) en el rendimiento de politicas VLA, gracias a su dataset de entrenamiento de baja frecuencia.
- Prototipado de sistemas robotico con hardware de consumo: al tener solo 450M de parametros, puede ejecutarse en GPUs de gama media, lo que facilita el desarrollo de demos y pruebas en laboratorios con recursos limitados.
- Benchmark de VLA compactos: permite comparar el rendimiento de SmolVLA frente a modelos mas grandes (OpenVLA, RT-2) en tareas de manipulacion simples, evaluando el equilibrio entre tamaño y precision.
- Transferencia de habilidades en simulacion: el dataset con anotaciones de lenguaje generadas mediante code-as-policies puede usarse para entrenar politicas que luego se transfieran a entornos reales, aunque no se han publicado resultados de transferencia.
- Educacion en robotica y aprendizaje por refuerzo: como modelo de ejemplo en cursos y tutoriales de LeRobot, mostrando el flujo completo de entrenamiento, despliegue y evaluacion de una politica VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). Tampoco se proporcionan metricas como tasa de exito, MMLU, HumanEval u otros benchmarks genericos, ya que se trata de un modelo de robotica especializado.

## Requisitos de hardware

- VRAM estimada: con 450M de parametros y pesos en FP32, el modelo ocupa aproximadamente 1.8 GB en memoria. En FP16, alrededor de 0.9 GB. Esto cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, etc.) sin necesidad de cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3070, RTX 4080) dado el batch size de 64 y las imagenes de 256x256.
- Despliegue: el modelo se ejecuta mediante el framework LeRobot, que usa PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generico sino una politica robotica.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño del modelo y la frecuencia de 10 FPS del dataset, se espera que la inferencia sea en tiempo real en hardware de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este repo) | 450M | no disponible | Pulsar boton (SO-101) | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Manipulacion general | MIT | Hugging Face |
| RT-2 | 55B | no disponible | Manipulacion general | no disponible | no publico |

SmolVLA se posiciona como una alternativa mucho mas ligera que OpenVLA o RT-2, con un coste de inferencia significativamente menor. Sin embargo, no se dispone de comparativas de rendimiento directas en la misma tarea, ya que este repositorio es un fine-tune especifico y no se han publicado evaluaciones. El paper original de SmolVLA reporta resultados competitivos en tareas de manipulacion con un coste reducido, pero esos datos no se replican en esta ficha por no estar disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea de pulsar un boton rojo con un brazo SO-101 y una configuracion de camaras especifica (top y left_wrist). No es generalizable a otras tareas sin un nuevo fine-tune.
- No se han publicado resultados de evaluacion en robot real; el rendimiento en entornos fisicos es desconocido.
- El dataset de entrenamiento es pequeno (100 episodios) y proviene de simulacion, lo que puede limitar la robustez frente a variaciones de iluminacion, posicion del boton o distracciones.
- La frecuencia de muestreo de 10 FPS puede ser insuficiente para tareas que requieran movimientos rapidos o control en tiempo real de alta frecuencia.
- No se especifican los idiomas soportados; la unica instruccion documentada esta en ingles. El modelo podria no responder correctamente a instrucciones en otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de LeRobot y de los pesos base de `lerobot/smolvla_base`, cuyas condiciones de uso deben verificarse.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos no deseados, mas alla de las limitaciones inherentes a un modelo entrenado por imitacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_push_button_A1_1000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_push_button_A1_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
