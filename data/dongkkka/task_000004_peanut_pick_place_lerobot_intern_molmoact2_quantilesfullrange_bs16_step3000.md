# Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_MolmoAct2_QuantilesFullRange_bs16_step3000

## Resumen

El modelo `Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_MolmoAct2_QuantilesFullRange_bs16_step3000` es un checkpoint de inferencia de politica robotica publicado con la libreria LeRobot (version 0.6.1). Se trata de un ajuste fino del modelo base MolmoAct2 (segun el tag `molmoact2` de la model card) sobre un unico conjunto de datos propio de demostraciones de robot, orientado a la tarea concreta de recogida y colocacion de cacahuetes (*peanut pick and place*). El autor es el usuario de HuggingFace `Dongkkka` y la politica esta pensada para control de manipulacion a partir de tres camaras y un vector de estado de 22 dimensiones.

El problema que resuelve es acotado y practico: dada una observacion multimodal (imagenes de camara de cabeza y de ambas munecas, mas el estado del robot), predecir una secuencia de 10 acciones de 22 dimensiones que el brazo ejecuta para completar la tarea. El entrenamiento se realizo durante 3.000 pasos con tamano de lote 16 y consumio las 35 episodios completos del dataset `Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern` en la revision `05286a17a145234ed80870702f4d9757f00194c3`. El checkpoint ocupa 11,5 GB y contiene 5.591.928.368 parametros reales en formato safetensors.

Su relevancia es la de un artefacto de investigacion reproducible dentro del ecosistema LeRobot: publica solo los ficheros de inferencia (pesos, preprocesador y postprocesador de politica), deja fuera el optimizador, el planificador de learning rate y los estados RNG, y documenta explicitamente que la unica metrica publicada proviene de episodios vistos en entrenamiento, por lo que no constituye una validacion fuera de muestra ni una evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica VLA basada en MolmoAct2; la model card no detalla la arquitectura interna) |
| Parametros totales | 5.591.928.368 (5,59 mil millones, dato real de safetensors) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (politica de accion, no modelo de lenguaje conversacional; chunk de accion de 10 pasos) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; la entrada es visual y numerica, no textual) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint LeRobot 0.6.1 junto con preprocesador y postprocesador de politica) |
| Tarea | *peanut pick and place* (recogida y colocacion) |
| Camaras de entrada | `cam_left_head`, `cam_left_wrist`, `cam_right_wrist` |
| Dimensiones de estado / accion | 22 / 22 |
| Chunk de accion / acciones ejecutadas por defecto | 10 / 10 |
| Normalizacion | QUANTILES con q01 = minimo del dataset y q99 = maximo del dataset |
| Fecha de creacion | 2026-09-23 |
| Tamano del repositorio | 11,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el modelo base mediante el tag `molmoact2` y la libreria de entrenamiento e inferencia LeRobot 0.6.1, pero no especifica la arquitectura interna, el numero de capas, el tipo de *backbone* visual, el mecanismo de atencion ni como se acoplan las imagenes de las tres camaras con el vector de estado. Tampoco se indica si el flujo de accion se genera por difusion, por regresion directa de *action chunks* o por otra formulacion. Todos estos detalles quedan como no disponibles. Lo que si es verificable es que se trata de una politica de vision-lenguaje-accion (VLA) para manipulacion, con dos cabezas de 22 dimensiones para estado y accion respectivamente, y que emite bloques de 10 acciones.

El procedimiento de entrenamiento esta parcialmente documentado: 3.000 pasos de optimizacion con tamano de lote 16, sobre los 35 episodios del dataset referenciado, con normalizacion por cuantiles ajustada al minimo (q01) y al maximo (q99) del propio dataset. No se indica el numero de tokens o frames procesados, la composicion exacta del dataset, la tasa de aprendizaje, ni si hubo etapas de RLHF, DPO o aprendizaje por imitacion con objetivos auxiliares. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, *action chunking* con ensembling temporal, etc.). La unica evaluacion publicada es una prueba en bucle abierto de la primera accion sobre 100 frames muestreados uniformemente del episodio 5, con MAE de 0,00573342 y RMSE de 0,02800866 en unidades de accion originales; el propio autor advierte que el episodio 5 forma parte del entrenamiento, de modo que es un diagnostico de ajuste, no una validacion.

## Capacidades

- Generacion de secuencias de accion para control de robot manipulador: dado un estado de 22 dimensiones y tres imagenes (cabeza y dos munecas), produce *chunks* de 10 acciones de 22 dimensiones.
- Ejecucion de una tarea especifica de *pick and place* de cacahuetes, aprendida por imitacion de 35 episodios de demostracion.
- Percepcion multimodal con tres camaras simultaneas, incluyendo dos vistas de muneca que aportan informacion de agarre en primer plano.
- Normalizacion por cuantiles integrada en el checkpoint: el preprocesador y el postprocesador de politica se cargan junto al modelo, lo que permite reproducir la escala de acciones original del dataset.
- Inferencia en bucle abierto con horizonte de accion configurable: el valor por defecto ejecutado es 10 acciones por inferencia.
- Compatibilidad con el ecosistema LeRobot 0.6.1, lo que facilita integracion en scripts de evaluacion y despliegue existentes.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, dialogo multilingue, modo *thinking*, audio ni ninguna otra capacidad cognitiva o lingueistica.

## Casos de uso

- Automatizacion de lineas de envasado de frutos secos: el modelo puede colocarse como politica de control en una celda de *pick and place* de cacahuetes, tomando las tres camaras y el estado del brazo y emitiendo los *chunks* de 10 acciones que mueven la pinza.
- Reproduccion de experimentos de investigacion en manipulacion: al ser un checkpoint LeRobot reproducible con revision de dataset fijada, sirve como punto de partida para comparar variantes de normalizacion, tamano de lote o numero de pasos de entrenamiento.
- *Benchmarking* de infraestructura de inferencia para VLA: con 5,59 mil millones de parametros y 11,5 GB de pesos, es un caso de prueba realista para medir latencia de politica con entrada de tres camaras en una GPU concreta.
- Generacion de datos sinteticos o aumento de dataset: las predicciones del modelo sobre nuevos frames pueden usarse para filtrar o anotar trayectorias antes de reentrenar, siempre con supervision humana.
- Teleoperacion asistida: el modelo puede sugerir la siguiente accion y un operador aceptarla o corregirla, con el bucle abierto de 10 acciones como unidad de sugerencia.
- Evaluacion de canal de robot a robot: entrenado con una configuracion concreta de camaras y dimensiones 22/22, sirve para estudiar la transferencia a otra cinematica tras una etapa de ajuste fino.
- Docencia y prototipado rapido en robotica: permite a un equipo tener una politica funcional de manipulacion con nombre, revision y metricas declaradas, sin necesidad de entrenar desde cero.
- Pruebas de regresion de *pipelines* de datos: la metrica MAE/RMSE de bucle abierto puede usarse como prueba de humo cuando se refactoriza el preprocesado de observaciones.

## Benchmarks y rendimiento

Solo se ha publicado una metrica, correspondiente a una evaluacion en bucle abierto de la primera accion sobre 100 frames del episodio 5 del dataset de entrenamiento. No hay resultados en MMLU, HumanEval, GSM8K ni ningun otro *benchmark* de lenguaje o razonamiento, porque no es un modelo de ese tipo.

| Evaluacion | Metrica | Valor | Condiciones |
|---|---|---|---|
| Bucle abierto, primera accion | MAE | 0,00573342 | 100 frames muestreados uniformemente del episodio 5; en unidades de accion originales |
| Bucle abierto, primera accion | RMSE | 0,02800866 | 100 frames muestreados uniformemente del episodio 5; en unidades de accion originales |

Advertencia del propio autor recogida en la model card: el episodio 5 forma parte del conjunto de entrenamiento, por lo que estos numeros son un diagnostico sobre datos vistos y no una validacion en datos reservados ni un resultado de *rollout* en robot fisico. No hay comparacion con modelos similares en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros: 5,59 mil millones de parametros, 11,5 GB de repositorio. En bf16/fp16 los pesos ocupan aproximadamente 11,2 GB; en fp32, en torno a 22,4 GB.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica, se necesita al menos el tamano de los pesos mas el *overhead* de activaciones y de las tres imagenes de entrada, lo que situa cualquier despliegue real por encima de los 11,5 GB de pesos.
- GPU recomendadas: no disponible. Por tamano, un despliegue comodo en precision de 16 bits encaja en GPUs profesionales tipo A100 40 GB, H100 o L40S, y queda al limite en GPUs de consumo con 16 GB.
- Cabe en GPU de consumo: no confirmado por el autor. Con 16 GB de VRAM (RTX 4080, 4090, 4060 Ti 16 GB) los pesos en bf16 caben, pero el margen para activaciones y para el preprocesado de tres flujos de imagen es reducido; no se han publicado mediciones.
- Opciones de despliegue: LeRobot 0.6.1 con PyTorch y safetensors, cargando el modelo junto con el preprocesador y el postprocesador de politica. vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que no es un modelo de lenguaje de texto y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible. No hay mediciones de frecuencia de inferencia ni de acciones por segundo en robot fisico.
- Requisitos adicionales: entorno de robot compatible con la configuracion de observacion usada en el entrenamiento, con tres camaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) y un espacio de estado y accion de 22 dimensiones.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos alternativos dentro de la informacion proporcionada, por lo que los campos numericos se marcan como no disponibles. La comparacion se limita a la categoria de uso.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MolmoAct2, tarea *peanut pick and place*) | Politica VLA de manipulacion, ajuste fino sobre un dataset propio | 5,59 mil millones | no aplica (chunk de 10 acciones) | no disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| MolmoAct / MolmoAct2 (modelo base) | Familia VLA de manipulacion | no disponible en la informacion proporcionada | no disponible | no disponible | No verificado en esta busqueda |
| Otras politicas del ecosistema LeRobot (por ejemplo, familias tipo pi0 o SmolVLA) | Politicas VLA de manipulacion | no disponible en la informacion proporcionada | no disponible | no disponible | No verificado en esta busqueda |

Criterio de comparacion cualitativo: frente a politicas genericas de manipulacion, este checkpoint esta especializado en una unica tarea y en un unico montaje de sensores, lo que previsiblemente reduce su generalizacion pero simplifica su integracion en esa celda concreta. No hay datos publicados que permitan afirmar superioridad o inferioridad numerica frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningun analisis de sesgo. El modelo se entrena con 35 episodios de un unico operador y un unico entorno, por lo que heredara los sesgos de esas demostraciones (posiciones, iluminacion, tipo de objeto y estilo de agarre).
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de prediccion de acciones incorrectas o fisicamente invalidas fuera de la distribucion de entrenamiento, con el consiguiente riesgo para el hardware y el entorno.
- La unica metrica publicada (MAE 0,00573342 y RMSE 0,02800866) se calcula sobre el episodio 5, que forma parte del entrenamiento. No es validacion fuera de muestra y no debe presentarse como rendimiento real.
- No hay resultados de *rollout* en robot fisico ni tasas de exito de la tarea.
- Generalizacion limitada: el modelo esta ajustado a una tarea (*peanut pick and place*), a una configuracion de tres camaras y a un espacio de estado y accion de 22 dimensiones.
- No se publican el optimizador, el planificador ni los estados RNG, por lo que la reproducibilidad exacta del entrenamiento no es posible a partir de este repositorio.
- Licencia no disponible: al tratarse de un ajuste fino sobre MolmoAct2, es imprescindible verificar la licencia del modelo base y del dataset antes de cualquier uso comercial. No se puede asumir permisos de uso comercial.
- Idiomas: no disponible. La model card no declara capacidades linguisticas ni entrada de texto, por lo que no debe usarse como modelo de lenguaje.
- Despliegue en produccion: sin datos de latencia, sin validacion en robot real y sin licencia declarada, este checkpoint debe considerarse un artefacto de investigacion, no un componente listo para produccion.
- Uso responsable: cualquier aplicacion en un brazo robotico real requiere limites de par, paradas de emergencia y supervision, dado que no se documentan modos de fallo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_MolmoAct2_QuantilesFullRange_bs16_step3000
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern (revision `05286a17a145234ed80870702f4d9757f00194c3`)
- Libreria LeRobot: no se proporciona enlace en la informacion disponible.
- Paper del modelo base MolmoAct2: no disponible en la informacion proporcionada.
- Repositorio de codigo: no disponible en la informacion proporcionada.
- Demo o espacio interactivo: no disponible.
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (contenido de ayuda de YouTube), por lo que no aportan enlaces adicionales utilizables.
