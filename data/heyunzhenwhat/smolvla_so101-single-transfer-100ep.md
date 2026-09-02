# heyunzhenwhat/smolvla_so101-single-transfer-100ep

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face, disenado para robotica y desplegable en hardware de consumo. Este checkpoint concreto, `heyunzhenwhat/smolvla_so101-single-transfer-100ep`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de 100 episodios de una tarea especifica de transferencia de objetos con un robot seguidor SO-101.

El modelo resuelve la tarea "Move the tape into the taped area on the right" (mover la cinta al area marcada a la derecha), generando acciones de 6 grados de libertad a partir de tres vistas de camara (256x256) y el estado del robot. Con 450 millones de parametros y un tamano de repositorio de 0,9 GB, esta pensado para ejecutarse en GPUs de consumo, lo que lo hace accesible para laboratorios con recursos limitados.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de SmolVLA con LeRobot: desde la grabacion de datos con un robot real hasta el despliegue de la politica entrenada, todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM con action expert |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (instruccion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un backbone de lenguaje basado en SmolVLM y un action expert que genera comandos de actuacion. El modelo recibe como entrada tres vistas de camara (256x256 pixeles), el estado sensorimotor del robot (6 dimensiones) y una instruccion en lenguaje natural, y produce una accion de 6 grados de libertad. La arquitectura esta descrita en el paper arxiv:2506.01844.

Este checkpoint ha sido fine-tuneado desde `lerobot/smolvla_base` sobre el dataset `heyunzhenwhat/so101-single-transfer-100ep`, que contiene 100 episodios y 29.127 frames grabados a 30 FPS. El entrenamiento se realizo con 10.000 pasos, batch size de 64, optimizador AdamW con learning rate de 1e-4 y semilla 1000, utilizando la libreria LeRobot version 0.6.1. El metodo de entrenamiento es aprendizaje por imitacion (behavior cloning) sobre demostraciones de la tarea.

## Capacidades

- Manipulacion robotica: genera acciones de 6 grados de libertad a partir de observaciones visuales y estado del robot.
- Aprendizaje por imitacion: entrenado mediante behavior cloning sobre 100 episodios demostrados de una tarea especifica.
- Comprension de instrucciones en lenguaje natural: la tarea se especifica textualmente como "Move the tape into the taped area on the right".
- Procesamiento multi-camara: integra tres vistas de camara (256x256) para la percepcion del entorno.
- Despliegue en hardware de consumo: disenado para ejecutarse en GPUs de gama consumer, segun la documentacion de SmolVLA.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot (lerobot-rollout, lerobot-train).

## Casos de uso

- Automatizacion de tareas de manipulacion en laboratorio: el modelo puede ejecutar la tarea de transferencia de cinta de forma autonoma en un robot SO-101, liberando a los operarios de tareas repetitivas. Es adecuado porque esta entrenado especificamente para esta tarea y puede desplegarse con `lerobot-rollout`.
- Prototipado rapido de politicas roboticas: al ser un fine-tuning de un modelo base, permite iterar rapidamente sobre nuevas tareas con pocos episodios de demostracion (100 en este caso). El flujo de LeRobot facilita grabar datos, entrenar y desplegar en el mismo entorno.
- Investigacion en aprendizaje por imitacion: sirve como caso de estudio para evaluar la transferencia de SmolVLA a tareas especificas con datasets pequenos. Es util para comparar el rendimiento de behavior cloning con otras tecnicas.
- Educacion en robotica: al ser un modelo compacto y de codigo abierto (Apache 2.0), es adecuado para cursos y talleres de robotica con hardware de consumo. Los estudiantes pueden entrenar y desplegar politicas sin necesidad de infraestructura de alto coste.
- Benchmarking de modelos VLA: puede utilizarse como referencia para comparar el rendimiento de SmolVLA frente a otros modelos VLA en tareas de manipulacion. Su tamano reducido lo hace facil de reproducir.
- Desarrollo de sistemas de robotica asistida: el modelo puede integrarse en pipelines de LeRobot para experimentar con control de robots en entornos controlados, permitiendo probar variaciones de la tarea o del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Con 450 millones de parametros y 0,9 GB de tamano, se estima que cabe en GPUs de consumo con al menos 4-8 GB de VRAM, aunque no se han publicado cifras oficiales.
- GPU recomendadas: disenado para hardware de consumo (consumer-grade), segun la documentacion de SmolVLA. GPUs como RTX 3060, RTX 4070 o superiores serian adecuadas.
- Compatibilidad con GPUs de consumo: si, es uno de los objetivos principales del modelo.
- Opciones de despliegue: LeRobot (lerobot-rollout) para inferencia en tiempo real sobre robot SO-101; entrenamiento con `lerobot-train` en CUDA.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| heyunzhenwhat/smolvla_so101-single-transfer-100ep | 450M | No disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | No disponible | Hugging Face |

El modelo es un fine-tuning del base `lerobot/smolvla_base`, por lo que comparte arquitectura y tamano. Frente a modelos VLA mas grandes como OpenVLA (7B parametros), SmolVLA ofrece un tamano significativamente menor, lo que permite despliegue en hardware de consumo, aunque probablemente con menor capacidad de generalizacion a tareas diversas. No se dispone de datos verificados sobre la licencia y contexto de OpenVLA en la informacion proporcionada.

## Limitaciones y advertencias

- Tarea unica: el modelo esta fine-tuneado para una sola tarea ("Move the tape into the taped area on the right") y no generaliza a otras tareas sin re-entrenamiento.
- Sin resultados de evaluacion: no se han publicado metricas de exito en robot real, por lo que el rendimiento real no esta verificado.
- Dependencia del setup de hardware: las observaciones de camara y el estado del robot deben coincidir con la configuracion de entrenamiento (3 camaras, estado de 6 dimensiones).
- Riesgo de sobreajuste: con solo 100 episodios de una tarea, el modelo puede sobreajustarse a las condiciones especificas de grabacion (iluminacion, posicion de objetos, etc.).
- Idioma de instrucciones: la instruccion esta en ingles; no se ha verificado el soporte de otros idiomas.
- Sin cuantizaciones publicadas: no se han proporcionado versiones cuantizadas (GGUF, etc.) para este checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/heyunzhenwhat/smolvla_so101-single-transfer-100ep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-100ep
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
