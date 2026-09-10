# fm-dev/pi05-shuffle-status-d-full-gbs64-pgb8-gpu8-r4-epoch100-step1400

## Resumen

pi05-shuffle-status-d (identificador completo `fm-dev/pi05-shuffle-status-d-full-gbs64-pgb8-gpu8-r4-epoch100-step1400`) es un punto de control de politicas de robotica publicado por el usuario fm-dev en HuggingFace. Se trata de un ajuste fino de parametros completos (full fine-tuning) del modelo pi0.5 (etiquetado como pi05), inicializado a partir de los pesos EMA de inferencia del paso 12500 de un entrenamiento previo, con un optimizador AdamW, EMA y sampler reiniciados desde cero. El resultado es el paso de optimizador 1400, alcanzado tras 100 epocas adicionales de sampler sobre el split de entrenamiento procesado.

El modelo pertenece a la familia de politicas vision-lenguaje-accion (VLA) de openpi y esta orientado a control robotico sobre un brazo Franka. No es un modelo de lenguaje general: su entrada combina imagenes de camara base y estado del robot en coordenadas absolutas XYZ, cuaterniones XYZW y un valor `gripper_open`, y su salida es un tensor de forma `(20, 8)` que representa una ventana de 20 pasos de accion. La variante "shuffle / status_d" anade filas de estado (Status) repetidas a las filas de comportamiento, por lo que la longitud de epoca del sampler difiere de las variantes Baseline y Uniform32.

Su relevancia practica es acotada y muy especifica: sirve como bundle de inferencia reproducible para investigadores en robotica que quieran evaluar o continuar el ajuste fino de pi0.5 sobre tareas concretas (entre ellas una tarea Pick3 que requiere una tercera colocacion seguida de pulsar un boton azul fisico). El repositorio ocupa 12,6 GB e incluye parametros EMA de inferencia, activos de normalizacion, el codigo fuente exacto del modelo y el runtime, las versiones de dependencias y los resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica VLA pi0.5 (openpi) con backbone, vision de imagen actual, "action expert", adaptadores LoRA retenidos y modulos de historial; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible; salida definida como ventana de accion de 20 pasos, forma `(20, 8)` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | Bundle de checkpoint JAX/openpi con parametros EMA de inferencia; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura declarada es la de pi0.5 en su implementacion openpi. Segun la model card, son entrenables de forma conjunta el backbone, la vision de imagen actual, el "action expert", los adaptadores LoRA retenidos y los modulos de historial. El entrenamiento se realizo con JAX FSDP sobre 8 GPU NVIDIA H100 de 80 GB HBM3, con batch global de 64 y batch por GPU de 8, y un decaimiento EMA de 0,99. El ajuste fino arranca desde los pesos EMA de inferencia del paso 12500 de un entrenamiento anterior y reinicia por completo el optimizador AdamW, el EMA y el sampler. El checkpoint publicado corresponde al paso de optimizador 1400, tras 100 epocas adicionales de sampler sobre el split de entrenamiento procesado; el schedule de learning rate original abarca 200 epocas y permanece sin cambios en este hito.

En cuanto a los datos, las epocas se definen sobre el split de entrenamiento procesado completo, no sobre cada fotograma original grabado. Los recuentos de ventanas de accion son 804 de entrenamiento, 150 de validacion y 98 de prueba; las filas de validacion y prueba nunca entrenan al modelo. Los objetivos de accion usan ventanas de ejecucion del robot que superan comprobaciones de sincronizacion y de horizonte continuo, y los fotogramas de demostracion previos se conservan como historial visual. Algunos episodios originales tienen cero ventanas de accion validas, segun el `dataset_manifest.json`. La variante Status-D anade filas de Status repetidas a las filas de comportamiento. No se menciona en la informacion disponible el uso de RLHF ni de DPO, ni el numero total de tokens o la composicion del dataset.

## Capacidades

- Generacion de acciones de control robotico: produce ventanas de accion de forma `(20, 8)` con posicion absoluta XYZ, cuaternion XYZW y `gripper_open` (0 cerrado, 1 abierto).
- Percepcion visual: consume imagenes de camara base que deben irse anadiendo secuencialmente mediante `observe(policy, rgb, state)`.
- Memoria/historial: los modelos de memoria incluyen un "fixed history encoder" independiente que se instala automaticamente con `load()`; es imprescindible conservar el directorio `history_encoder/`.
- Subobjetivo causal (Status-D): requiere el subobjetivo/keyframe causal del "Writer" y el contexto de Status empleado por su runtime de despliegue.
- Ejecucion de tareas concretas: la tarea Pick3 exige la tercera colocacion seguida de pulsar un boton azul fisico.
- Ajuste fino continuable: aunque el repositorio es un bundle de inferencia, el estado completo del optimizador y del sampler permanece en almacenamiento AMLT para continuar el entrenamiento (no se incluye en el repositorio).
- Soporte de tool calling, agentes, capacidades multilingues, razonamiento de multiples pasos, vision general o audio: no disponible (no son capacidades declaradas para este modelo).
- Componentes de control de gripper: solo los componentes supervisados estan entrenados; los marcados como no supervisados no deben interpretarse como control de gripper entrenado.

## Casos de uso

- Investigacion en politicas VLA: reproducir la inferencia de pi0.5 sobre Franka cargando el bundle completo (`requirements.txt` + `load_model.py`) para comparar el checkpoint Status-D con las variantes Baseline y Uniform32 dentro del mismo entorno de evaluacion.
- Continuacion de ajuste fino: usar los pesos EMA como inicializacion para nuevos experimentos, dado que el esquema arranca de pesos EMA de un paso anterior con optimizador y sampler reiniciados.
- Evaluacion offline de acciones: medir el error de posicion L2 y el angulo de cuaternion sobre los splits de validacion y prueba como criterio de regresion antes de desplegar en robot.
- Manipulacion Pick3 en laboratorio: ejecutar la tarea de tres colocaciones con pulsacion final de boton azul en un banco de pruebas controlado, respetando el reinicio de politica entre episodios.
- Integracion en runtimes de despliegue openpi: incorporar el "fixed history encoder" y el contexto causal de Status que exige el runtime de despliegue de la variante Status-D.
- Recopilacion de datos con historial visual: aprovechar las ventanas de accion sincronizadas y de horizonte continuo para supervisar objetivos de accion y conservar los fotogramas previos como historial.
- Auditoria de control de gripper: validar, contra `training_config.json` y `assets/policy_metadata.json`, que solo los componentes supervisados se usan como control de gripper entrenado.

## Benchmarks y rendimiento

Los unicos datos publicados son errores offline sobre acciones retenidas, obtenidos con horizonte H20. No son tasas de exito en robot real.

| Split | Error de posicion L2 medio (m), H20 | Angulo de cuaternion medio (rad) |
| --- | ---: | ---: |
| validation | 0,03427 | 0,11479 |
| test | 0,05507 | 0,13340 |

El checkpoint en la nube supero la evaluacion offline de acciones con salidas `(20, 8)` finitas. El paquete descargado se cargo de forma independiente en CPU a traves de `load_model.py` antes de la subida, incluido su codigo fijo de historial. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de tasa de exito fisica en la informacion disponible.

## Requisitos de hardware

- Entrenamiento registrado: 8 GPU NVIDIA H100 de 80 GB HBM3, con JAX FSDP, batch global 64 y batch por GPU 8.
- VRAM estimada para inferencia: no disponible (no se publica en la model card).
- GPU recomendadas para inferencia: no disponible (la unica referencia de hardware disponible es la de entrenamiento en H100 80GB).
- Compatibilidad con GPU de consumo: no disponible.
- Almacenamiento: el repositorio completo ocupa 12,6 GB, e incluye los pesos EMA de inferencia, los activos de normalizacion y el directorio `history_encoder/`, que debe conservarse integro.
- Opciones de despliegue: runtime propio de openpi mediante `load_model.py` y `requirements.txt`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica VLA con salida de acciones.
- Latencia y throughput: no disponible; la propia model card indica que la publicacion no resuelve la latencia de despliegue.

## Comparativa con modelos similares

La model card menciona variantes hermanas del mismo linaje (Baseline y Uniform32) y, sobre todo, el paso 12500 previo del que se inicializa este ajuste. Sin embargo, no se publican metricas comparables entre ellas en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento offline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-shuffle-status-d (este) | no disponible | ventana de accion (20, 8) | validacion 0,03427 m / 0,11479 rad; test 0,05507 m / 0,13340 rad | no disponible | HuggingFace (0 descargas, 0 likes) |
| Baseline (referencia interna) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Uniform32 (referencia interna) | no disponible | no disponible | no disponible | no disponible | no disponible |

Comparativa con otras familias de politicas roboticas: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un bundle de inferencia: no incluye el estado del optimizador ni del sampler, que permanecen en almacenamiento AMLT; no sirve por si solo para reanudar el entrenamiento tal cual.
- Los errores publicados son errores offline sobre acciones retenidas, no tasas de exito en robot real; la model card advierte explicitamente que la publicacion no establece exito fisico de la tarea ni resuelve la latencia de despliegue.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no aplicable en el sentido de lenguaje natural, pero existe riesgo de predicciones de accion incorrectas; no se cuantifica en la informacion disponible.
- Dependencia estricta del protocolo de inferencia: hay que anadir cada fotograma de camara base con `observe(policy, rgb, state)` y reiniciar la politica entre episodios; el uso incorrecto invalida los resultados.
- Dependencia del directorio `history_encoder/`: debe conservarse completo o el modelo de memoria no funcionara.
- Status-D requiere el subobjetivo/keyframe causal del Writer y el contexto de Status del runtime de despliegue; sin ellos no opera como se espera.
- Control de gripper: solo los componentes supervisados estan entrenados; los marcados como no supervisados no deben interpretarse como control de gripper entrenado.
- Pick3 exige una tercera colocacion seguida de pulsar el boton azul fisico; omitir el boton impide completar la tarea.
- Licencia: no disponible, por lo que no puede confirmarse la permisividad para uso comercial.
- Idiomas soportados: no disponible.
- Popularidad y validacion externa nulas hasta la fecha: 0 descargas y 0 likes.

## Enlaces

- HuggingFace: https://huggingface.co/fm-dev/pi05-shuffle-status-d-full-gbs64-pgb8-gpu8-r4-epoch100-step1400
- Fichero de configuracion de entrenamiento: `training_config.json` (dentro del repositorio de HuggingFace)
- Metadatos de politica: `assets/policy_metadata.json` (dentro del repositorio)
- Manifiesto del dataset: `dataset_manifest.json` (dentro del repositorio)
- Directorio del codificador de historial: `history_encoder/` (dentro del repositorio)
- Los resultados de busqueda web recibidos no contienen enlaces relevantes para este modelo (corresponden a emisoras de radio en frances y no guardan relacion con pi0.5 ni con openpi).
