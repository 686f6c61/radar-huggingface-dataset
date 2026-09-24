# eruedas/act_mirokai_1rgb_popcorn_real_v0.1

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice secuencias cortas de acciones futuras (chunks). Este repositorio, `eruedas/act_mirokai_1rgb_popcorn_real_v0.1`, es una política ACT entrenada y publicada con LeRobot sobre el dataset `eruedas/mirokai_1rgb_popcorn_real_v0.1`, con entrada de una única cámara RGB y datos reales de un robot no especificado en la model card.

El checkpoint tiene 51.693.202 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB, con pesos en formato safetensors y licencia Apache-2.0. Es, por tanto, un modelo pequeño y orientado a control robótico, no un modelo de lenguaje: no genera texto ni procesa instrucciones en lenguaje natural.

Su relevancia es práctica para quien trabaja con LeRobot: sirve como punto de partida reproducible para evaluar una política ACT preentrenada sobre una tarea concreta, para hacer fine-tuning con demostraciones propias y para comparar variantes de políticas de imitación con el mismo pipeline de entrenamiento e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT: transformer encoder-decoder con CVAE (prediccion de chunks de acciones) |
| Parametros totales | 51.693.202 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; el horizonte es el tamano de chunk de acciones, no especificado en la informacion disponible |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos safetensors; no se listan variantes cuantizadas) |
| Idiomas soportados | No aplica: el modelo no procesa ni genera lenguaje |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline declarado | robotics |
| Entrada sensorial | 1 camara RGB (segun el identificador del modelo y el nombre del dataset) |
| Tarea entrenada | "popcorn" sobre el dataset `eruedas/mirokai_1rgb_popcorn_real_v0.1` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT combina un autoencoder variacional condicional (CVAE) con un transformer encoder-decoder. El encoder consume las observaciones (imagenes y estado del robot) junto con una variable latente de estilo `z`, y el decoder genera un chunk de acciones futuras en lugar de una sola accion. En inferencia se suele aplicar ensamblado temporal para suavizar la transicion entre chunks consecutivos. La implementacion de referencia en LeRobot emplea habitualmente un backbone convolucional para extraer caracteristicas visuales, pero la configuracion exacta de este checkpoint (resolucion de imagen, numero de camaras efectivas, tamano de chunk, dimensiones del transformer) no se detalla en la informacion proporcionada.

El entrenamiento es de imitacion supervisada a partir de teleoperacion: el modelo se ajusta para reproducir las acciones del dataset, con una perdida de reconstruccion L1 sobre las acciones mas un termino KL que regulariza la variable latente. La model card no especifica el numero de tokens, episodios, horas de demostracion ni la composicion del dataset, y tampoco indica si se aplico RLHF, DPO o cualquier etapa de post-entrenamiento (en ACT no es el procedimiento habitual). El modelo se ha entrenado y publicado mediante el flujo estandar de LeRobot, con los comandos `lerobot-train` para entrenamiento y `lerobot-record` para evaluacion.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado, para reproducir la tarea "popcorn" del dataset de entrenamiento.
- Entrada visual de una sola camara RGB, lo que simplifica el montaje hardware frente a politicas multi-camara.
- Prediccion de acciones en bloque (action chunking), lo que reduce el numero de inferencias necesarias por segundo y mitiga el error de acumulacion paso a paso.
- Inferencia en bucle cerrado: pensada para ejecutarse de forma continua mientras el robot opera.
- Integracion nativa con el ecosistema LeRobot (entrenamiento, evaluacion, registro de episodios y publicacion en el Hub).
- No dispone de generacion de texto, razonamiento simbolico, matematicas, codigo ni vision-lenguaje.
- No soporta tool calling, function calling ni planificacion de agentes multi-paso.
- No tiene capacidades multilingues ni comprension de instrucciones en lenguaje natural.

## Casos de uso

- Reproduccion de la tarea entrenada: ejecutar la politica sobre el mismo robot y montaje usados para grabar `mirokai_1rgb_popcorn_real_v0.1`, con el objetivo de que el brazo complete la tarea "popcorn" de forma autonoma.
- Punto de partida para fine-tuning: reentrenar el checkpoint con demostraciones propias de otra tarea mediante `lerobot-train --policy.type=act`, aprovechando que 51,7 M de parametros se ajustan en GPU de gama media.
- Evaluacion comparativa de politicas: usar el mismo dataset y el mismo pipeline de LeRobot para medir si ACT supera o no a otras politicas (Diffusion Policy, VQ-BeT) en la misma tarea y con la misma camara.
- Automatizacion con hardware de bajo coste: al requerir una sola camara RGB y menos de 2 GB de VRAM, es viable en estaciones con una RTX 3060 o incluso en CPU para pruebas de latencia no crítica.
- Investigacion en aprendizaje por imitacion: analizar el efecto del tamano de chunk, del ensamblado temporal o de la variable latente de estilo reentrenando el modelo con variaciones controladas.
- Validacion de un pipeline completo de robotica: desde la teleoperacion y el registro de episodios hasta el despliegue en el robot, sirviendo como prueba de integracion de LeRobot antes de escalar a datasets mayores.
- Demostraciones docentes: ejemplo autocontenido de 0,2 GB para explicar action chunking y CVAE en robótica sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones cuantitativas para este checkpoint. La busqueda web realizada no devolvio resultados relevantes: unicamente paginas de inicio de YouTube, sin relacion con el modelo. El articulo de ACT (arXiv:2304.13705) describe el metodo y afirma que suele alcanzar tasas de exito elevadas, pero no se dispone aqui de las cifras concretas ni de resultados medidos sobre esta politica.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 207 MB en fp32 y 103 MB en fp16/bf16, calculado a partir de los 51.693.202 parametros.
- VRAM estimada para inferencia: por debajo de 2 GB en la practica, incluyendo pesos, activaciones de una o dos imagenes y el contexto de CUDA de PyTorch; la cifra exacta depende de la resolucion de entrada y del tamano de chunk, no especificados.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB, por ejemplo GTX 1650, RTX 3060, RTX 4090. Las A100 y H100 son innecesarias para este tamano.
- Compatibilidad con GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, y tambien es viable la inferencia en CPU para pruebas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch como runtime subyacente. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje; no se documenta soporte oficial para ONNX, TensorRT ni formatos GGUF.
- Latencia y throughput: no disponibles. La frecuencia de control objetivo depende del robot y del dataset de origen, y no se especifica en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_mirokai_1rgb_popcorn_real_v0.1 (este) | ACT, chunking de acciones con CVAE y transformer | 51.693.202 | 1 camara RGB + estado | apache-2.0 | HuggingFace Hub, via LeRobot |
| ACT original (Zhao et al., 2023) | ACT, implementacion de referencia del articulo | No disponible en esta ficha | Multiples camaras RGB | No disponible en esta ficha | Codigo en el repositorio del proyecto |
| Diffusion Policy (Chi et al., 2023) | Generacion de acciones por difusion | No disponible en esta ficha | Imagenes RGB (+ estado) | No disponible en esta ficha | Implementacion publica |
| VQ-BeT / Behavior Transformer | Cuantizacion vectorial de acciones con transformer | No disponible en esta ficha | Imagenes RGB (+ estado) | No disponible en esta ficha | Implementacion publica |
| SmolVLA (HuggingFace) | VLM pequeno adaptado a control roboticos | No disponible en esta ficha | Vision + instruccion en lenguaje | No disponible en esta ficha | HuggingFace Hub, via LeRobot |

No se dispone de datos verificados de parametros, contexto ni rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita al enfoque, la modalidad de entrada y la disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea y un unico montaje; no se espera generalizacion a objetos, posiciones, iluminacion o robots distintos de los del dataset.
- Dependencia de una sola camara RGB: la oclusion, los cambios de iluminacion y las variaciones de punto de vista afectan directamente al rendimiento, y no hay senal de profundidad ni de otras vistas que compense.
- Sin comprension de lenguaje: no acepta instrucciones en texto ni permite redefinir la tarea en tiempo de ejecucion.
- Riesgo de fallo acumulado en ejecuciones largas: aunque el chunking reduce el numero de inferencias, no incorpora un mecanismo explicito de deteccion y recuperacion de errores.
- Sesgos inher­entes a los datos de teleoperacion: el modelo reproduce las trayectorias y los sesgos del operador que grabo las demostraciones.
- Trazabilidad limitada: la model card no documenta el numero de episodios, la composicion del dataset, el robot objetivo ni la configuracion de entrenamiento, lo que dificulta reproducir resultados.
- Validacion comunitaria nula: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de que la politica funcione en produccion.
- Licencia Apache-2.0: permite uso comercial y modificacion con obligacion de conservar avisos de copyright y licencia, y sin garantia alguna por parte del autor. Conviene revisar tambien la licencia del dataset asociado.
- Anomalia en los metadatos: las fechas de creacion y actualizacion del repositorio (2026-09-23) no son coherentes con la fecha habitual de publicacion de este tipo de checkpoints; conviene verificar la procedencia antes de usarlo.
- No apto para tareas criticas de seguridad sin supervision humana: no hay informacion sobre limites de par, fuerzas ni comportamientos de emergencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eruedas/act_mirokai_1rgb_popcorn_real_v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/eruedas/mirokai_1rgb_popcorn_real_v0.1
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Version en arXiv del articulo: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas de inicio de YouTube y no se han incluido por no aportar informacion util.
