# fm-dev/pi05-shuffle-baseline-lora-gbs4-pgb1-gpu4-r2-step5000

## Resumen

Este repositorio contiene el checkpoint del paso 5.000 de un ajuste fino con LoRA sobre el modelo π0.5, desarrollado por el usuario `fm-dev`, para la tarea de manipulacion robotica denominada *shuffle* sobre un brazo Franka. Se trata de la segunda ronda de entrenamiento (`r2`) de este experimento y no de un modelo de lenguaje: es una politica vision-lenguaje-accion (VLA) que, dadas las imagenes de camara base y de muneca, el estado del robot y una instruccion de tarea en texto, produce comandos motores. El checkpoint corresponde a 20.000 exposiciones de muestras sobre un objetivo planificado de 12.500 actualizaciones de optimizador (50.000 exposiciones), por lo que es un artefacto intermedio de una ejecucion en curso.

El ajuste se realizo localmente sobre 4 GPU RTX A6000 con lote global 4 y lote por GPU 1, sin acumulacion de gradientes. Se emplea LoRA de rango 32 con AdamW, semilla 42, calentamiento de 250 actualizaciones hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500, ademas de pesos EMA con factor 0.999^4 = 0.996005996001. Este checkpoint concreto implementa la variante *baseline* sin historial: solo consume las imagenes actuales, el estado actual y la instruccion, a diferencia de las variantes que mantienen historial visual.

Su relevancia es fundamentalmente de investigacion en robotica: publica no solo los pesos EMA para servir, sino tambien los activos de normalizacion e historial, el codigo de inferencia, las versiones exactas de dependencias y el estado completo de reanudacion (no EMA, optimizador, RNG y sampler). Con 0 descargas y 0 likes, no cuenta con validacion de la comunidad, y el propio autor advierte que la publicacion intermedia no constituye una evaluacion de calidad de la politica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-lenguaje-accion derivada de π0.5 mediante LoRA; detalles internos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | no disponible (el repositorio ocupa 11,5 GB e incluye pesos EMA, activos de normalizacion, codigo y estado de reanudacion) |
| Parametros activos | no procede / no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (no se documenta una ventana de tokens; la variante es *no-history*, solo frame actual) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados) |
| Idiomas soportados | no disponible (se condiciona por instruccion de tarea en texto, idioma no especificado) |
| Licencia | no disponible (no aparece en la model card ni en los metadatos del repositorio) |
| Formato de pesos | no disponible; el bundle incluye pesos EMA servibles y codigo de carga propio (`load_model.py`) |
| Modelo base | π0.5 (ajuste con LoRA, rango 32) |
| Tarea / embodiment | *shuffle* sobre robot Franka |
| Metodo de ajuste | LoRA rango 32, AdamW, semilla 42 |
| Hardware de entrenamiento | 4 x NVIDIA RTX A6000 |
| Lote | Global 4, por GPU 1, sin acumulacion de gradientes |
| Pasos de entrenamiento | Checkpoint en el paso 5.000 (objetivo: 12.500 actualizaciones) |
| Exposiciones de muestras | 20.000 (objetivo: 50.000) |
| Calendario de LR | Calentamiento de 250 actualizaciones hasta 5e-5; decaimiento coseno hasta 5e-6 en el paso 12.500 |
| EMA | 0,999^4 = 0,996005996001 |
| Espacio de acciones | Salida con forma (20, 8): xyz absoluto, cuaternion XYZW unitario en la carta qx positivo y comando de pinza en [0,1] |
| Normalizacion | Estado y acciones con normalizacion STD; tokens de estado con vista acotada train-q01/q99 |
| Frecuencia de guardado | Cada 1.000 actualizaciones y en la final (12.500) |
| Tamano del repositorio | 11,5 GB |

## Arquitectura y entrenamiento

La informacion disponible describe un ajuste fino de tipo LoRA (rango 32) sobre el modelo π0.5, orientado a una politica de manipulacion. La variante publicada aqui es el *baseline* sin historial: la entrada se compone de las imagenes actuales de camara base y de muneca, el estado del robot y la instruccion de tarea. Las filas de ejecucion del robot son las unicas que supervisan acciones; las imagenes y caracteristicas de las demostraciones, asi como las coordenadas originales de episodio y frame, se conservan como historial, pero el inicio de la ejecucion no reinicia el historial visual. La particion de episodios y la normalizacion se calculan unicamente con el split de entrenamiento.

La salida se modela como una secuencia de 20 pasos con 8 dimensiones cada uno (xyz absoluto, cuaternion XYZW unitario en la carta qx positivo y comando de pinza en [0,1]). Los componentes de accion desconocidos permanecen como NaN/false en el dataset de entrenamiento y se enmascaran tanto en el condicionamiento de flujo (*flow conditioning*) como en la perdida; en concreto, el componente [7] no tiene supervision alguna. La convencion de pose cartesiana del efector final o herramienta debe coincidir con la del controlador de recogida de datos y no debe aplicarse un desplazamiento adicional de herramienta o brida. El bundle incluye el archivo `training_config.json` con la configuracion completa, y el codigo de carga se expone como `from load_model import load, observe; policy = load()`.

## Capacidades

- Generacion de comandos motores para manipulacion robotica: produce bloques de 20 acciones de 8 dimensiones con posicion absoluta, orientacion en cuaternion y comando de pinza.
- Condicionamiento multimodal: consume imagen de camara base, imagen de muneca, estado numerico del robot e instruccion de tarea en texto.
- Variante *no-history*: no mantiene memoria visual entre frames, lo que simplifica el bucle de inferencia a costa de perder contexto temporal.
- API de observacion: `observe(policy, base_rgb, state)` permite alimentar frames observados, incluidos los de demostracion, con reinicio entre episodios.
- Modo Status-D: requiere entradas adicionales explicitas (`history_keyframe_index`, `current_subgoal` y contexto de transicion causal) y devuelve `transition_status` en la salida.
- Enmascarado de componentes no supervisados: los elementos sin etiqueta se excluyen del condicionamiento de flujo y de la perdida, lo que permite entrenar con etiquetas parciales.
- Reanudacion exacta del entrenamiento: se incluye estado no EMA, de optimizador, RNG y sampler.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, tool calling, function calling, agentes ni vision generalista fuera del bucle de control robotico.
- Capacidades multilingues: no disponible.

## Casos de uso

- Ejecucion de la tarea *shuffle* sobre un Franka: la politica traduce observaciones visuales y de estado en comandos cartesianos y de pinza, y esta pensada para cerrar el bucle de control sobre el robot real.
- Punto de partida para ajustes LoRA posteriores: al ser un adaptador de rango 32 sobre π0.5, sirve como inicializacion para nuevas tareas o nuevas variantes de *shuffle* sin reentrenar el modelo base completo.
- Estudio de curvas de aprendizaje en robotica: los pasos 5.000, 10.000 y 12.500 tienen repositorios independientes, lo que permite comparar el efecto del numero de actualizaciones sobre una misma receta.
- Reanudacion exacta de una ejecucion de entrenamiento: el bundle incluye estado de optimizador, RNG y sampler, de modo que un equipo puede continuar desde el paso 5.000 sin reproducir el preentrenamiento.
- Investigacion sobre supervision parcial y enmascarado: el dataset deja componentes sin etiqueta (por ejemplo, el componente [7] y el comando de pinza en *shuffle*) y enmascara su contribucion a la perdida, lo que sirve para estudiar el efecto de etiquetas incompletas.
- Evaluacion offline de politicas VLA: los activos de normalizacion e historial y el codigo de inferencia incluidos permiten montar un pipeline de evaluacion reproducible sobre el split de entrenamiento.
- Despliegue en bucle de control en tiempo real: la variante *no-history* reduce la dependencia de estado temporal, lo que simplifica la integracion en un controlador que envia observaciones frame a frame.
- Analisis del efecto de EMA en el servicio: el repositorio separa pesos EMA servibles (factor 0,996) del estado no EMA de entrenamiento, lo que permite comparar ambas variantes en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que la publicacion intermedia no constituye una evaluacion de calidad de la politica y que la evaluacion offline, cuando se incluye, no establece una tasa de exito en robot real. No se proporcionan metricas de exito por tarea, numero de ensayos, MMLU, HumanEval, GSM8K ni ningun otro resultado numerico.

## Requisitos de hardware

- Entrenamiento documentado: 4 x NVIDIA RTX A6000 (48 GB de VRAM por GPU), con lote global 4 y lote por GPU 1 sin acumulacion de gradientes.
- VRAM de inferencia: no disponible de forma oficial; el bundle de pesos y activos ocupa 11,5 GB, por lo que se puede estimar un minimo en torno a 12 GB en precision completa (estimacion derivada del tamano del repositorio, no confirmada por el autor).
- GPU recomendadas: cualquiera con al menos 12-16 GB de VRAM como punto de partida, incluidas RTX A6000 (validada en entrenamiento), RTX 4090 (24 GB) y A100/H100 para mayores margenes o paralelismo.
- Viabilidad en GPU de consumo: probable en tarjetas de 24 GB como la RTX 4090 segun la estimacion anterior, aunque no hay confirmacion publicada.
- Opciones de despliegue: el repositorio esta disenado para cargarse con el codigo propio incluido (`load_model.py`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que ademas estan orientados a LLM y no a politicas VLA con bucle de control.
- Latencia y throughput: no disponible. Al ser una politica de control, la viabilidad depende del periodo de control del bucle robotico, no de metricas de tokens por segundo.
- Almacenamiento: 11,5 GB para este checkpoint; los pasos 10.000 y 12.500 se publican en repositorios separados y el resto de checkpoints completos se conservan en un archivo de respaldo.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos / exposiciones | Contexto | Hardware de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (r2, paso 5.000) | LoRA rango 32 sobre π0.5 | 5.000 actualizaciones / 20.000 exposiciones | Solo frame actual (variante *no-history*) | 4 x RTX A6000, lote global 4 | no disponible | Publico en HuggingFace, 0 descargas |
| Checkpoint del paso 10.000 (misma receta r2) | LoRA rango 32 sobre π0.5 | 10.000 actualizaciones / 40.000 exposiciones | no disponible | 4 x RTX A6000 (misma ejecucion) | no disponible | Repositorio independiente publicado por el autor |
| Checkpoint del paso 12.500 (misma receta r2) | LoRA rango 32 sobre π0.5 | 12.500 actualizaciones / 50.000 exposiciones (objetivo final) | no disponible | 4 x RTX A6000 (misma ejecucion) | no disponible | Repositorio independiente publicado por el autor |
| Modelo base π0.5 sin ajustar | Politica VLA completa | no aplica | no disponible | no disponible | no disponible | Referenciado como base, sin enlace proporcionado |
| Modelo π0 (generacion anterior) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos artefactos; la comparacion es unicamente de receta de entrenamiento, numero de actualizaciones y disponibilidad.

## Limitaciones y advertencias

- El comando de pinza de la tarea *shuffle* no tiene supervision de comando: la salida de pinza no debe interpretarse como un control aprendido.
- El componente [7] del vector de accion carece por completo de supervision y su valor en inferencia no es significativo.
- La tarea *Button Order* solo dispone de etiquetas verificadas limitadas de comando cerrado.
- La publicacion intermedia no es una evaluacion de calidad de la politica, y la evaluacion offline no establece una tasa de exito en robot real.
- Este checkpoint esta en el paso 5.000 de un objetivo de 12.500: la receta no ha completado su calendario de decaimiento de learning rate.
- La convencion de pose cartesiana del efector final o herramienta debe coincidir con la del controlador de recogida; aplicar un desplazamiento adicional de herramienta o brida produce comandos incorrectos.
- Es obligatorio usar el calendario del *Writer* exportado y el frame de control correspondiente; el desajuste rompe la coherencia de las acciones.
- La variante Status-D exige entradas adicionales (`history_keyframe_index`, `current_subgoal`, contexto de transicion causal) que deben respetarse para que la salida sea valida.
- La licencia no esta disponible, por lo que no puede confirmarse la viabilidad de uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- No hay informacion sobre composicion del dataset, sesgos, robustez ante cambios de iluminacion, texturas u objetos fuera de distribucion.
- El repositorio no documenta idiomas soportados ni requisitos de latencia, lo que dificulta planificar un despliegue en tiempo real.
- Con 0 descargas y 0 likes, el modelo carece de validacion externa o reproduccion independiente.
- No se documenta compatibilidad con runtimes de inferencia estandar para VLA, solo con el codigo de carga incluido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fm-dev/pi05-shuffle-baseline-lora-gbs4-pgb1-gpu4-r2-step5000
- Archivo de respaldo de checkpoints (dataset): https://huggingface.co/datasets/fm-dev/pi05-checkpoint-backups/tree/main/checkpoints/r2
- Repositorios de los pasos 10.000 y 12.500: publicados por `fm-dev` segun la model card, URL no proporcionada
- Modelo base π0.5: referenciado en la model card, enlace no proporcionado
- Paper, blog o demo oficiales: no disponibles
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a directorios de emisoras de radio) y no aportan informacion tecnica utilizable.
