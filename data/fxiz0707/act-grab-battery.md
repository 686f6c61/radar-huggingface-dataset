# Fxiz0707/act-grab-battery

## Resumen

`Fxiz0707/act-grab-battery` es una política de robot entrenada con la arquitectura ACT (Action Chunking with Transformers) mediante aprendizaje por imitación, disponible en Hugging Face y construida sobre la librería LeRobot. El modelo fue entrenado por el usuario Fxiz0707 sobre el conjunto de datos `heidar-an/grab-battery`, que contiene 30 episodios (13.544 fotogramas a 30 FPS) de una tarea de agarre de una batería con un robot de tipo `so_follower`.

El problema que resuelve es la ejecución autónoma de una tarea de manipulación concreta: a partir de una imagen RGB de cámara frontal y las posiciones actuales de las seis articulaciones del brazo, la política predice objetivos de posición articular para el siguiente bloque de acciones. No es un modelo de lenguaje ni un modelo de propósito general, sino un controlador específico de tarea.

Su relevancia es principalmente como ejemplo práctico y reproducible del flujo de trabajo de LeRobot: entrenamiento de una política ACT con backbone visual ResNet18 preentrenado en ImageNet, cuantización no aplicada, y despliegue mediante las herramientas de rollout de LeRobot. El propio autor advierte que no se ha realizado evaluación con conjunto de datos de prueba ni despliegue físico del robot, por lo que el modelo debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet18 preentrenado en ImageNet |
| Parametros totales | 51.668.614 (aprox. 51,7 M) |
| Parametros activos | no disponible (no es MoE; en un modelo denso todos los parametros estan activos) |
| Longitud de contexto | no disponible (modelo de politica robotica; usa chunks de accion de 100 pasos) |
| Tipos de cuantizacion | no disponible (pesos en precision original, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo no lingüistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformador para imitación de políticas roboticas que predice "chunks" de acciones: en lugar de una accion por paso, genera secuencias de 100 objetivos de posición articular, lo que reduce el error acumulado y la latencia efectiva de control. El componente visual es un ResNet18 preentrenado en ImageNet que procesa la imagen de la cámara frontal (`observation.images.front`, tensor RGB de forma [3, 360, 640]). Las entradas de estado y las salidas de accion son vectores de seis posiciones articulares, en el orden: shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll y gripper.

El entrenamiento se realizó sobre la totalidad del dataset `heidar-an/grab-battery` (30 episodios, 13.544 fotogramas a 30 FPS, revisión f00757ee521ffd01d7cb95b07df6af8a7a57c2f9) durante 30.000 pasos de optimizador con tamaño de lote 8, lo que equivale a aproximadamente 17,72 épocas. Se usó el optimizador AdamW con tasa de aprendizaje 1e-5 y semilla aleatoria 1000. El hardware de entrenamiento fue una NVIDIA GeForce RTX 4070 Ti SUPER de 16 GB de VRAM, con el código de LeRobot en el commit 3f797de5952432284a7c77ad2760218cb74e2f26. La pérdida final de entrenamiento reportada es 0,085, con una pérdida L1 sobre acciones de 0,078. No hubo RLHF ni DPO (no aplicable a este tipo de modelo) y no se emplearon datos de evaluación retenidos.

## Capacidades

- Prediccion de politica de manipulacion: genera objetivos de posicion articular para las 6 articulaciones del robot `so_follower` a partir de imagen y estado.
- Chunking de acciones: produce secuencias de 100 acciones por inferencia, habitual en ACT para tareas de precision.
- Percepcion visual: procesa una unica vista RGB de camara frontal de 360x640 pixeles mediante ResNet18.
- Normalizacion integrada: incluye estadisticas de normalizacion y configuraciones de preprocesado/postprocesado en el repositorio.
- Integracion con LeRobot: cargable directamente con `ACTPolicy.from_pretrained` y desplegable con `lerobot-rollout`.
- No tiene capacidades de lenguaje, ni tool calling, ni soporte de agentes: es un controlador de tarea unica.

## Casos de uso

- Ejecucion de la tarea "grab battery" en un robot so_follower: el caso de uso directo; la politica controla el brazo para agarrar una batería usando la misma calibracion, orden de articulaciones, colocacion de camara y configuracion de imagen del dataset original.
- Punto de partida para fine-tuning: los pesos y la configuracion pueden servir como inicializacion para adaptar la politica a variaciones de la tarea (otra posicion de la batería, otra iluminacion) reentrenando con episodios adicionales.
- Validacion de pipeline de imitacion en LeRobot: util para verificar que un setup de teleoperacion, grabacion de dataset y entrenamiento funciona de extremo a extremo antes de invertir en tareas mas complejas.
- Ensenanza y formacion: ejemplo documentado con hiperparametros concretos (30.000 pasos, batch 8, lr 1e-5, RTX 4070 Ti SUPER) reproducible en hardware de consumo, adecuado para practicas de aprendizaje por imitacion.
- Benchmark interno de hardware: permite medir el coste de entrenamiento de ACT con ResNet18 en una GPU de consumo (16 GB VRAM) y estimar tiempos para otros datasets.
- Investigacion en chunking de acciones: base para experimentar con la longitud de chunk (100 acciones) y su efecto en suavidad y precision del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es el de entrenamiento: perdida final de 0,085 y perdida L1 de acciones de 0,078. El autor indica explicitamente que no se ha realizado evaluacion con datos retenidos ni despliegue fisico del robot, por lo que no existen metricas de exito de tarea.

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra oficial; dado el tamano del modelo (aprox. 51,7 M de parametros, 0,2 GB de pesos), la inferencia es ligera y cabe con holgura en GPUs con 4-8 GB de VRAM.
- Entrenamiento (referencia del autor): se realizo en una NVIDIA GeForce RTX 4070 Ti SUPER de 16 GB de VRAM, lo que indica que el reentrenamiento con datasets de tamano similar es viable en GPUs de consumo.
- Consumer GPUs: la inferencia cabe en praticamente cualquier GPU moderna (RTX 3060 o superior); el entrenamiento cabe en una RTX 4070 Ti SUPER de 16 GB.
- Despliegue: mediante LeRobot, tanto cargando la politica en Python (`ACTPolicy.from_pretrained`) como con la herramienta de rollout `lerobot-rollout`, que carga el preprocesado y postprocesado suministrados. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplicables a politicas roboticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada visual | Tarea | Licencia |
|---|---|---|---|---|---|
| Fxiz0707/act-grab-battery | ACT + ResNet18 | 51,7 M | 1 camara RGB (360x640) | Agarrar batería (so_follower) | no disponible |
| lerobot/act_aloha_sim_insertion_human | ACT | mismo orden de magnitud (aprox. 50 M) | camaras ALOHA simuladas | Insercion en ALOHA simulado | no disponible |
| lerobot/diffusion_pusht | Difusion polica | no disponible | 2 imagenes 96x96 | PushT simulado | no disponible |

Las alternativas publicas de LeRobot cubren tareas distintas (ALOHA simulado, PushT), por lo que la comparacion es de categoria y arquitectura, no de rendimiento: no hay metricas directamente comparables publicadas.

## Limitaciones y advertencias

- Sin validacion: el autor declara que no se ha hecho evaluacion con datos retenidos ni rollout fisico; la perdida de entrenamiento (0,085) no garantiza exito en el robot real.
- Especifico de robot y tarea: solo es utilizable con un robot `so_follower` con la misma calibracion, orden de articulaciones, colocacion de camara y configuracion de imagen; cualquier desviacion degrada el comportamiento.
- Sobreajuste potencial: el entrenamiento uso la totalidad de los 30 episodios sin conjunto de validacion, por lo que la generalizacion a nuevas condiciones es incierta.
- Una sola camara y una sola tarea: sin capacidad de lenguaje ni de razonamiento; no puede generalizar a instrucciones nuevas.
- Licencia no especificada: al no estar declarada, no se puede confirmar el permiso para uso comercial; consultar con el autor antes de cualquier despliegue productivo.
- Repositorio privado: la model card indica que el acceso requiere que la cuenta de Hugging Face tenga permiso sobre el repositorio.
- Riesgo fisico: al tratarse de una politica no validada, su uso en hardware real debe hacerse con supervision y limites de seguridad (e-stop, limites de par).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fxiz0707/act-grab-battery
- Dataset de entrenamiento: https://huggingface.co/datasets/heidar-an/grab-battery
- Libreria LeRobot: https://github.com/huggingface/lerobot
