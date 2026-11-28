# jaywu109/pi05_recording_full_hand

## Resumen

`jaywu109/pi05_recording_full_hand` es un ajuste fino completo (full fine-tune) del modelo base `lerobot/pi05_base`, un modelo de politica vision-lenguaje-accion (VLA) para control de robots manipuladores. Lo desarrolla el usuario jaywu109 y se publica como un checkpoint de LeRobot 0.5.2 entrenado sobre el dataset `minhphd/recording_full_hand`, compuesto por 102 episodios de demostraciones de una tarea concreta de manipulacion: entregar platos a una persona y devolverlos a su sitio.

El modelo resuelve una tarea muy especifica de robotica: dada una instruccion en lenguaje natural, imagenes de tres camaras (una cenital y dos en las munecas) y el estado articular del robot, predice una secuencia de acciones (chunk de 50 pasos) de 14 dimensiones. No es un modelo de proposito general, sino un artefacto de investigacion orientado a reproducir una politica entrenada sobre un conjunto de datos concreto.

Su relevancia es limitada y practica: sirve como ejemplo de flujo de trabajo de fine-tuning de pi0.5 con LeRobot, y como checkpoint reutilizable para quien quiera evaluar o continuar el entrenamiento sobre el mismo dataset. El repositorio ocupa 37,4 GB e incluye los checkpoints de los pasos 10K, 20K, 30K y 40K (este ultimo, el final). No se ha publicado ninguna evaluacion del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) pi0.5, basada en el modelo base `lerobot/pi05_base`; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada multimodal: 3 imagenes + estado de 14 dimensiones + instruccion de texto) |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible; la instruccion de tarea esta en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, un modelo de la familia pi0.5 orientado a robotica y empaquetado con la libreria LeRobot. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atencion, integracion de vision y lenguaje), por lo que esa informacion no esta disponible en los datos proporcionados. La interfaz de inferencia si esta documentada: consume tres flujos de imagen (`observation.images.base_0_rgb` a 720x1280, `observation.images.left_wrist_0_rgb` y `observation.images.right_wrist_0_rgb` a 480x640), un vector de estado `observation.state` de 14 dimensiones y una instruccion de texto, y produce una accion `action` de 14 dimensiones en chunks de 50 pasos.

El entrenamiento consistio en un full fine-tune con LeRobot 0.5.2 durante 40.000 pasos, con batch de 12 (4 por GPU en 3 GPUs), learning rate 2,5e-5 con decaimiento a lo largo de los 40K pasos, precision bf16 y gradient checkpointing. Se uso la totalidad del dataset `minhphd/recording_full_hand`: 102 episodios y 407.499 fotogramas a 30 fps. La perdida final de entrenamiento fue de 0,012. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de acciones roboticas: predice trayectorias de 14 dimensiones en chunks de 50 pasos a partir de observaciones multimodales.
- Condicionamiento por lenguaje: acepta una instruccion de tarea en texto, que en este checkpoint debe ser exactamente `hand over each plate when the person is ready for it, then press it home`.
- Fusion multimodal: integra tres camaras (cenital y dos de muneca) con el estado articular del robot.
- Control visomotor de manipulacion: disenado para tareas de agarre y entrega de objetos (platos) en un entorno de mesa.
- No dispone de tool calling, function calling, capacidades de agente multi-paso ni generacion de texto libre; es un modelo de politica, no un LLM conversacional.
- Capacidades multilingues: no disponibles; la unica instruccion documentada esta en ingles.

## Casos de uso

- Reproduccion de la tarea de entrega de platos: el modelo ejecuta la politica entrenada para coger cada plato y entregarlo a una persona cuando esta lista, devolviendolo despues a su posicion. Es su unico caso de uso validado por diseno.
- Punto de partida para fine-tuning adicional: al ser un full fine-tune sobre `lerobot/pi05_base` con pesos en safetensors y checkpoints intermedios (10K, 20K, 30K, 40K), sirve para continuar el entrenamiento con mas episodios o variaciones de la tarea.
- Evaluacion de pipelines LeRobot: util para validar flujos de inferencia con LeRobot 0.5.2, comprobando el mapeo de nombres de camaras y la forma de las observaciones.
- Investigacion en aprendizaje por imitacion: permite estudiar el efecto de 40K pasos y batch 12 sobre un dataset pequeno (102 episodios), comparando los checkpoints intermedios.
- Pruebas de robustez visomotora: al usar tres vistas (cenital y dos de muneca), se puede analizar como afecta la oclusion o el cambio de iluminacion a la politica entrenada.
- Demostraciones de robotica en laboratorio: despliegue en un brazo robotico con camaras equivalentes para ilustrar el funcionamiento de un modelo VLA en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo "no ha sido evaluado todavia" (Not evaluated yet). El unico dato de rendimiento es la perdida final de entrenamiento (0,012), que no constituye una metrica de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 37,4 GB e incluye cuatro checkpoints; el checkpoint final solo no esta cuantificado en la informacion.
- GPU recomendadas: el entrenamiento se realizo con 3 GPUs (4 muestras por GPU, batch 12) en bf16 con gradient checkpointing; el modelo concreto de GPU no se especifica.
- Cabeza en GPU de consumo: no disponible; depende del tamano real de `pi05_base`, que no se documenta.
- Opciones de despliegue: libreria `lerobot` (version 0.5.2 segun el entrenamiento); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de politica robotica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaywu109/pi05_recording_full_hand` | no disponible | no disponible | sin evaluar (loss 0,012) | no disponible | Hugging Face (repo 37,4 GB) |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: la model card declara explicitamente que no se ha realizado ninguna evaluacion, por lo que no hay evidencia de rendimiento real en el robot.
- Especificidad extrema: solo funciona con la instruccion de tarea exacta documentada y con el esquema de observaciones del dataset `minhphd/recording_full_hand`; los nombres de camara deben coincidir (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`).
- Dataset pequeno: 102 episodios y 407.499 fotogramas; riesgo alto de sobreajuste al entorno, iluminacion y disposicion de objetos del dataset original.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base `lerobot/pi05_base` antes de cualquier despliegue productivo.
- Sin informacion sobre sesgos: al ser un modelo de robotica, los sesgos relevantes serian de entorno y de datos de demostracion, no documentados.
- Riesgo de alucinacion en el sentido de acciones no validas: al no haber evaluacion, no se puede descartar que la politica genere trayectorias inseguras fuera de la distribucion de entrenamiento.
- Idiomas: no se documenta soporte multilingue; la instruccion de tarea esta en ingles.
- Repositorio grande (37,4 GB) con cuatro checkpoints; conviene descargar solo la carpeta `040000/` con el comando indicado en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/jaywu109/pi05_recording_full_hand
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/minhphd/recording_full_hand
