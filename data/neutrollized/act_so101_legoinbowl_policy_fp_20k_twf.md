# Neutrollized/act_so101_legoinbowl_policy_fp_20k_twf

## Resumen

El modelo `Neutrollized/act_so101_legoinbowl_policy_fp_20k_twf` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT) para el brazo robótico SO-101 (so_follower). Desarrollado por el usuario Neutrollized y publicado en Hugging Face bajo licencia Apache 2.0, el modelo resuelve la tarea de agarrar un bloque de lego y colocarlo en un cuenco mediante aprendizaje por imitación a partir de 100 episodios teleoperados. Su relevancia radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas de manipulación con la librería LeRobot, permitiendo a desarrolladores e investigadores reproducir y adaptar el pipeline a sus propios robots.

Arquitectónicamente, ACT combina un encoder de visión basado en ResNet con un transformer que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo cuenta con 51.668.614 parámetros y acepta como entrada tres imágenes de cámara (muñeca, superior y frontal) junto con el estado del robot, generando acciones de 6 dimensiones. No se especifica la longitud de contexto ni el tamaño del chunk de acción en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), encoder de vision ResNet + transformer |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (y otros formatos de LeRobot) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad del control en tareas de manipulacion. La arquitectura consta de un encoder de vision (tipicamente ResNet) que procesa las imagenes de las camaras, y un transformer que autoregresivamente genera las acciones futuras. En este caso, el modelo recibe tres vistas de camara (wrist, top, front) a resolucion 720x1280 y el estado del robot (6 dimensiones), produciendo acciones de 6 dimensiones.

El entrenamiento se realizo con la libreria LeRobot version 0.6.1, utilizando el dataset `Neutrollized/lego-in-bowl-fps30-twf_100_merged` que contiene 100 episodios y 49.689 fotogramas a 30 FPS. La configuracion de entrenamiento incluye 20.000 pasos, batch size de 16, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento; se trata de un entrenamiento puramente por imitacion (behavior cloning).

## Capacidades

- Control de un brazo robotico SO-101 (so_follower) para tareas de manipulacion como pick-and-place.
- Entrada multimodal: tres camaras (wrist, top, front) a 720x1280 y estado del robot de 6 dimensiones.
- Salida de acciones de 6 dimensiones (posiciones o velocidades articulares).
- Aprendizaje por imitacion a partir de demostraciones teleoperadas.
- No es un modelo de lenguaje: no genera texto, codigo ni realiza razonamiento simbolico.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio: el modelo puede desplazar objetos pequeños (bloques de lego) de una posicion a otra, util para experimentos de manipulacion robotica.
- Prototipado rapido de politicas de manipulacion: gracias a LeRobot, se puede entrenar y desplegar una politica en pocas horas con datos teleoperados, ideal para validar nuevas tareas.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del tamaño del dataset, la resolucion de camara o el numero de pasos de entrenamiento en el rendimiento.
- Integracion en pipelines de robotica educativa: el modelo puede utilizarse en cursos o talleres para ensenar conceptos de robotica y aprendizaje automatico.
- Despliegue en robots SO-101 comerciales o de bajo coste: al ser un modelo pequeno (51M parametros), puede ejecutarse en hardware modesto, facilitando su adopcion en entornos de produccion a pequeña escala.
- Extension a otras tareas de manipulacion: aunque entrenado para una tarea especifica, el mismo esquema de entrenamiento puede reutilizarse con otros datasets para nuevas tareas (apilar, insertar, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion proporcionados para esta politica. No se dispone de datos de tasa de exito en el mundo real ni de comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentacion oficial.
- Dado el tamaño del modelo (≈51,7 millones de parametros), es probable que pueda ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, pero no hay datos confirmados.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU (CUDA) y posiblemente en CPU para pruebas.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y no se han publicado valores.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de la misma categoria (politicas ACT para SO-101). Existen otros repositorios similares en Hugging Face, como `aiden-li/so101-act` o `Jaskaran3010/so101-act-policy`, pero no se han encontrado especificaciones detalladas (parametros, rendimiento, licencia) que permitan una comparacion rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea "Grab lego block and put in bowl" y puede no generalizar a otras tareas o configuraciones del entorno.
- Depende de la calidad de las demostraciones teleoperadas; un dataset con errores o variabilidad insuficiente puede degradar el rendimiento.
- No se han proporcionado resultados de evaluacion en el mundo real, por lo que se desconoce su tasa de exito real.
- Es probable que exista sobreajuste al entorno especifico de entrenamiento (posiciones de camara, iluminacion, tipo de robot).
- Al ser un modelo de robotica, no presenta sesgos de lenguaje ni riesgos de alucinacion textual, pero si puede fallar en condiciones no vistas (objetos nuevos, cambios de iluminacion).
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia y de los datos utilizados.

## Enlaces

- Repositorio del modelo: [Neutrollized/act_so101_legoinbowl_policy_fp_20k_twf](https://huggingface.co/Neutrollized/act_so101_legoinbowl_policy_fp_20k_twf)
- Paper de ACT: [Action Chunking with Transformers (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- Libreria LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Dataset de entrenamiento: [Neutrollized/lego-in-bowl-fps30-twf_100_merged](https://huggingface.co/datasets/Neutrollized/lego-in-bowl-fps30-twf_100_merged)
- Documentacion de LeRobot para ACT: [https://huggingface.co/docs/lerobot/main/en/act](https://huggingface.co/docs/lerobot/main/en/act)
