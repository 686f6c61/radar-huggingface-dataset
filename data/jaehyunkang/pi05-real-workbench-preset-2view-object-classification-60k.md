# jaehyunkang/pi05-real-workbench-preset-2view-object-classification-60k

## Resumen

Pi0.5 Real Workbench — preset-2view-object-classification es un checkpoint final de una politica robotica Vision-Language-Action (VLA) afinada por el usuario jaehyunkang sobre el modelo base lerobot/pi05_base. Se trata de un modelo de accion, no de un modelo de lenguaje: recibe imagenes de camara, estado del robot e instruccion textual, y produce comandos motores. Esta especializado en la tarea de clasificacion de objetos dentro del entorno de trabajo real definido por el dataset Myungkyu/real_workbench-preset-gemini.

El checkpoint corresponde a 60.000 pasos de optimizacion con batch global de 32 sobre 2 GPU y semilla 42. El modelo tiene 4.143.404.816 parametros (aproximadamente 4,14 mil millones) almacenados en safetensors, con un repositorio de 24,5 GB que incluye pesos, configuracion, estados de normalizacion y ficheros de reanudacion de entrenamiento. La politica consume 2 vistas de camara (exterior y muneca), un vector de estado de 8 dimensiones y emite acciones delta del efector final de 7 dimensiones (6 de velocidad cartesiana mas pinza), con horizonte de accion de 50 pasos y 10 pasos de denoising en inferencia.

Su relevancia es acotada y practica: es un ejemplo reproducible de ajuste fino de Pi0.5 con LeRobot para una tarea concreta de manipulacion y clasificacion, con toda la configuracion y el estado de entrenamiento publicados. No incluye metricas de evaluacion en robot real, no declara licencia y no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que debe tratarse como material de referencia tecnica mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de Pi0.5; segun la ficha, el modelo base es lerobot/pi05_base y el tokenizador de referencia es google/paligemma-3b-pt-224 (revision 35e4f46485b4d07967e7e9935bc3786aad50687c), lo que situa un backbone de vision-lenguaje de tipo PaliGemma-3B mas una cabeza de accion |
| Parametros totales | 4.143.404.816 (dato real de los pesos safetensors) |
| Parametros activos | No aplica; la ficha no declara arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible; la ficha solo declara horizonte de accion de 50 pasos y 10 pasos de denoising en inferencia |
| Tipos de cuantizacion | No disponible; no se declaran pesos GGUF ni variantes cuantizadas, solo safetensors |
| Idiomas soportados | No disponible; la ficha no declara idiomas para el texto de tarea |
| Licencia | No disponible |
| Formato de pesos | safetensors (mas ficheros de configuracion, preprocesado, postprocesado y normalizacion en la raiz del repositorio; estado de entrenamiento en training_state/) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Pi0.5 ejecutado con la implementacion RLWRLD/hiwrld-ll-policy, que incorpora una copia vendorizada de LeRobot Pi0.5. La observacion se compone de 2 vistas de camara (exterior y muneca), almacenadas a 224x126 y rellenadas (padding) por la politica hasta 224x224, mas un estado de 8 dimensiones. La salida es un chunk de acciones de 7 dimensiones (6 de velocidad cartesiana del efector final mas pinza) con horizonte de accion y ejecucion de 50 y 10 pasos de denoising en inferencia, lo que es coherente con una cabeza de generacion de acciones por flow matching o difusion, aunque la ficha no lo explicita.

El entrenamiento uso el dataset Myungkyu/real_workbench-preset-gemini con instrucciones derivadas de subtareas por fotograma almacenadas en parquet, batch global de 32, 2 GPU y semilla 42, hasta completar 60.000 pasos de optimizacion. La ficha no detalla el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO, algo que en modelos de accion no suele aplicar del mismo modo que en LLM. Se conservan los checkpoints originales de entrenamiento y los ficheros de reanudacion, y las rutas especificas de la maquina anfitriona se eliminaron de los metadatos JSON, de modo que al reanudar hay que aportar rutas locales de dataset y salida.

## Capacidades

- Generacion de acciones roboticas: produce secuencias de 7 dimensiones (velocidad cartesiana del efector final mas pinza) a partir de observaciones visuales y de estado.
- Clasificacion de objetos: es el alcance declarado de la tarea (object-classification), dentro de un banco de trabajo real.
- Entrada multimodal: combina 2 vistas de camara (exterior y muneca) con un vector de estado de 8 dimensiones.
- Condicionamiento por instruccion textual: el texto de tarea debe ser la subtarea por fotograma correspondiente del dataset; en modelos de subtarea hay que suministrar ademas la imagen de keyframe definida por el dataset en los modelos de 3 vistas.
- Ejecucion por chunks: horizonte de accion y ejecucion de 50 pasos, con 10 pasos de denoising por inferencia.
- Tool calling / function calling: no disponible; no es una capacidad declarada de una politica VLA.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada de texto; el comportamiento multi-paso se limita a la ejecucion de chunks de acciones.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de pensamiento, vision generativa, audio: no disponibles; la unica modalidad de vision es la entrada de camaras para condicionar la accion.

## Casos de uso

- Clasificacion y separacion de objetos en puesto de trabajo: la politica puede recibir la vista exterior y la de muneca mas la subtarea por fotograma y generar la accion de alcance y manipulacion necesaria para clasificar la pieza o material correspondiente.
- Automatizacion de tareas de pick-and-place en banco de trabajo: con horizonte de accion de 50 pasos, el modelo ejecuta secuencias completas de aproximacion, agarre y deposito sin necesidad de replanificar en cada paso.
- Investigacion en aprendizaje por imitacion: al publicarse pesos, configuracion, normalizacion y estado de entrenamiento, sirve como punto de partida reproducible para estudiar el ajuste fino de Pi0.5 sobre datos propios.
- Generacion de datos sinteticos de politica: las trayectorias generadas pueden usarse como referencia o linea base para comparar con politicas propias sobre el mismo dataset de banco de trabajo.
- Prototipado de celdas robotizadas con dos camaras: el requisito de vista exterior mas vista de muneca encaja en montajes estandar de brazo robotico con camara de contexto y camara en el efector.
- Reentrenamiento y curriculum sobre el mismo dominio: gracias a los ficheros de reanudacion en training_state/, se puede continuar el entrenamiento desde los 60.000 pasos con mas datos o tareas derivadas.
- Evaluacion comparativa de politicas VLA: sirve como referencia de un ajuste fino real de Pi0.5, siempre que se aporte la misma definicion de tarea y vistas, ya que no se reclaman metricas de robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia ficha del autor indica explicitamente que se trata de un checkpoint entrenado y no de un resultado de evaluacion, y que no se reclaman metricas de evaluacion en robot real. Tampoco se aportan datos de exito de tarea, tasa de exito por episodio ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4.143.404.816 parametros; la ficha no publica cifras oficiales): en bf16/fp16, unos 8,3 GB solo de pesos; en fp32, unos 16,6 GB. Con activaciones, buffers de imagenes a 224x224 y estado de inferencia, es razonable reservar entre 10 y 14 GB en bf16.
- GPU recomendadas: para entrenamiento, el propio autor uso 2 GPU con batch global de 32; para inferencia en tiempo real, GPU de clase A100 o H100 son la opcion conservadora, y una RTX 4090 (24 GB) deberia alojar la inferencia en bf16.
- GPU de consumo: si cabe en GPU de consumo con VRAM suficiente; una RTX 4090 o una RTX 3090 (24 GB) son candidatas con holgura en bf16. En tarjetas de 12 GB o menos seria necesario cuantizar, algo que la ficha no documenta ni soporta oficialmente.
- Opciones de despliegue: LeRobot y ejecucion con PyTorch son el camino natural, dado que la libreria declarada es lerobot y la implementacion de entrenamiento es RLWRLD/hiwrld-ll-policy. Runtimes de LLM como vLLM, llama.cpp, Ollama o TGI no son aplicables a una politica de accion como esta.
- Latencia y throughput: no disponibles. Como referencia del coste de computo, cada inferencia ejecuta 10 pasos de denoising para producir un chunk de 50 acciones, con 2 imagenes de entrada a 224x224.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-real-workbench-preset-2view-object-classification-60k | 4.143.404.816 | Horizonte de accion de 50; 10 pasos de denoising | Clasificacion de objetos en banco de trabajo (2 vistas) | No disponible | HuggingFace, 0 descargas, 0 likes |
| lerobot/pi05_base | No disponible en la informacion proporcionada | No disponible | Politica VLA generalista base | No disponible en la informacion proporcionada | HuggingFace (modelo base declarado) |
| Otras alternativas VLA (pi0, SmolVLA) | No disponible en la informacion proporcionada | No disponible | Manipulacion generalista | No disponible en la informacion proporcionada | No verificado en esta busqueda |

La busqueda web realizada no devolvio informacion tecnica util sobre este modelo ni sobre alternativas comparables: los resultados obtenidos corresponden a contenido deportivo sin relacion con el modelo. Por tanto, la comparativa se limita al modelo base declarado y al resto de campos marcados como no disponibles.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de metricas: el autor afirma que no se reclaman resultados de evaluacion en robot real; no hay tasas de exito ni validacion independiente.
- Modelo de tarea unica: el alcance es clasificacion de objetos en el entorno del dataset Myungkyu/real_workbench-preset-gemini; fuera de ese dominio no hay garantias de comportamiento.
- Dependencia estricta del preprocesado: los estados de normalizacion, preprocesado y postprocesado viven en la raiz del repositorio y deben usarse tal cual; alterarlos invalida las acciones generadas.
- Dependencia de la implementacion: los campos de entrada personalizados pueden requerir la implementacion concreta RLWRLD/hiwrld-ll-policy con la copia vendorizada de LeRobot Pi0.5, no solo LeRobot estandar.
- Requisito de formato de la instruccion: en modelos de subtarea hay que suministrar la subtarea por fotograma como texto de tarea; en los de 3 vistas, ademas la imagen de keyframe definida por el dataset. Un texto de tarea incorrecto degrada la politica.
- Carencia de datos linguisticos y multilingues: no se declaran idiomas soportados, por lo que el comportamiento ante instrucciones en castellano es desconocido.
- Riesgo de alucinacion y de sobreajuste: como politica ajustada sobre un dataset concreto, puede generalizar mal a iluminacion, disposicion de objetos, camaras o robots distintos de los de entrenamiento.
- Riesgo de sesgo de dominio: el dataset se denomina preset, lo que sugiere condiciones controladas y repetibles; el rendimiento en entornos no controlados es indeterminado.
- Repositorio pesado: 24,5 GB, incluyendo estado de entrenamiento, lo que complica su descarga y almacenamiento.
- Adopcion nula: 0 descargas y 0 likes en el momento de redactar la ficha, sin comunidad que haya validado el checkpoint.
- Metadatos: la fecha de creacion registrada es 2026-09-17 y la de actualizacion 2026-09-17.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-preset-2view-object-classification-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-preset-gemini
- Tokenizador de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementacion de entrenamiento citada: RLWRLD/hiwrld-ll-policy
- Framework: LeRobot (https://github.com/huggingface/lerobot)

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre el modelo, su paper o su repositorio; los resultados obtenidos eran contenido no relacionado.
