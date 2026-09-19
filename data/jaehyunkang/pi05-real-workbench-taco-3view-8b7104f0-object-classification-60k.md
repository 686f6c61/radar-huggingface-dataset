# jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-object-classification-60k

## Resumen
Pi0.5 Real Workbench — taco-3view-8b7104f0-object-classification es una politica de robotica (visión-lenguaje-acción) publicada por el usuario jaehyunkang, obtenida mediante fine-tuning de lerobot/pi05_base sobre el dataset Myungkyu/real_workbench-taco-keyframe-gemini. No es un modelo de lenguaje: su salida son acciones de control (delta EEF de 7 dimensiones) para un brazo robotico, condicionadas por instrucciones de subtarea por fotograma y por tres vistas de camara. El checkpoint publicado corresponde al paso 60.000 de optimizacion y se distribuye como artefacto de inferencia, sin estado de optimizador ni de reanudacion de entrenamiento.

El interes de la ficha es acotado y muy tecnico: se trata de un fine-tune de tarea unica (object_classification) dentro del ecosistema LeRobot, con 4.143.404.816 parametros totales, un horizonte de ejecucion de 50 acciones y 10 pasos de denoising en inferencia. La model card advierte explicitamente de que es una politica entrenada, no un resultado de evaluacion, y de que no se reclaman metricas de robot real.

Su relevancia practica depende de reproducir las condiciones de entrada exactas (tres vistas, imagen keyframe y texto de subtarea), ya que la implementacion de entrenamiento es una version modificada de LeRobot Pi0.5 y los campos de entrada personalizados pueden exigir el mismo codigo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-lenguaje-accion Pi0.5; implementacion sobre LeRobot Pi0.5 modificada (RLWRLD/hiwrld-ll-policy) |
| Parametros totales | 4.143.404.816 (aprox. 4,14 mil millones) |
| Parametros activos | No aplica: no se indica que sea una arquitectura MoE |
| Longitud de contexto | No disponible. La model card solo declara horizonte de accion (action chunk) de 50 y 10 pasos de denoising en inferencia |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay GGUF ni variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base (fine-tuning) |
| Dataset de entrenamiento | Myungkyu/real_workbench-taco-keyframe-gemini |
| Tarea | object_classification (subtarea por fotograma) |
| Pasos de optimizacion | 60.000 |
| Vistas de camara | 3 (exterior y muneca, mas observation.image.keyframe) |
| Dimension del estado | 8 |
| Dimension de la accion | 7 (delta EEF: 6 de velocidad cartesiana + gripper) |
| Resolucion de imagen | 224x126 almacenada; la politica rellena a 224x224 |
| Horizonte de accion / denoising | 50 / 10 pasos |
| Batch global y GPUs | 32 y 2 GPUs |
| Semilla | 42 |
| Tokenizer de referencia | google/paligemma-3b-pt-224 (revision 35e4f46485b4d07967e7e9935bc3786aad50687c) |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento
La informacion disponible describe una politica Pi0.5 derivada de lerobot/pi05_base, entrenada con una implementacion denominada RLWRLD/hiwrld-ll-policy, que a su vez es una copia adaptada (vendored) de LeRobot Pi0.5. El unico componente de backbone que se puede identificar con la informacion aportada es la referencia del tokenizer a google/paligemma-3b-pt-224; no se detallan en la model card el numero de capas, la dimension oculta, el mecanismo de atencion ni si existe un modulo especifico de generacion de acciones distinto del transformer.

El entrenamiento se realizo durante 60.000 pasos de optimizacion con batch global de 32 sobre 2 GPUs y semilla 42, partiendo de pi05_base. El modelo consume estado de 8 dimensiones y produce acciones delta EEF de 7 dimensiones (6 de velocidad cartesiana mas gripper), con un chunk de 50 acciones y 10 pasos de denoising durante la inferencia. La model card indica que los pesos, la configuracion de politica, el preprocesado y postprocesado y los estados de normalizacion estan en la raiz del repositorio, y que el artefacto excluye el estado de optimizador y de reanudacion. Tambien advierte de que se eliminaron las rutas especificas de la maquina anfitriona de los metadatos JSON. No se especifican en la informacion disponible el numero de tokens de imagen o texto vistos, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Generacion de acciones de manipulacion robotica: produce comandos delta EEF de 7 dimensiones condicionados por observaciones visuales y texto de tarea.
- Clasificacion de objetos como subtarea: el modelo esta entrenado especificamente para el ambito object_classification dentro del banco de trabajo real del dataset.
- Entrada multimodal: consume tres vistas de camara (exterior, muneca y observation.image.keyframe) ademas del estado de 8 dimensiones.
- Seguimiento de instrucciones de subtarea por fotograma: la model card indica que para modelos de subtarea debe suministrarse la subtarea correspondiente como texto de tarea de la politica.
- Ejecucion por chunks: genera bloques de 50 acciones, lo que permite ejecutar secuencias de control sin recalcular en cada paso.
- Inferencia con denoising de 10 pasos.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso autonómo: la politica ejecuta la subtarea que se le proporciona.
- No se documentan capacidades multilingues, generacion de texto, codigo, matematicas, vision general, audio ni modo de razonamiento explicito.
- No se documentan metricas de exito en robot real; la model card afirma explicitamente que no se reclaman.

## Casos de uso
- Clasificacion de objetos en banco de trabajo robotizado: el modelo recibe las tres vistas y una instruccion de subtarea por fotograma y devuelve acciones delta EEF para manipular y clasificar las piezas del entorno, que es exactamente la tarea para la que fue entrenado.
- Ejecutor de bajo nivel en un pipeline jerarquico: un planificador de alto nivel descompone la tarea y envia subtareas textuales por fotograma a esta politica, que se encarga del control motor del brazo con su chunk de 50 acciones.
- Clasificacion de piezas en linea de montaje: con camara exterior y de muneca fijas, el modelo puede etiquetar y separar componentes segun la subtarea indicada, siempre que el utillaje y la distribucion de objetos se parezcan a los del dataset real_workbench-taco.
- Recogida y reubicacion guiada por etiqueta: seleccionar un objeto concreto descrito en la subtarea, tomarlo con el gripper y depositarlo en la zona correspondiente, usando el estado de 8 dimensiones como realimentacion propioceptiva.
- Investigacion en politicas VLA: servir como punto de partida para ablaciones de fine-tuning sobre pi05_base, comparando variantes de numero de vistas, resolucion o pasos de denoising.
- Automatizacion de laboratorio con multiples camaras: escenarios donde la manipulacion depende de una vista de muneca que aporta detalle fino y de una vista exterior que aporta contexto global, como montaje de pequenos componentes.
- Evaluacion reproducible en simulacion o banco de pruebas LeRobot: al publicarse configuracion, preprocesado y estados de normalizacion en la raiz del repositorio, el checkpoint puede cargarse con la pila LeRobot para medir tasas de exito sin reentrenar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el checkpoint es una politica entrenada y no un resultado de evaluacion, y que no se reclaman metricas de evaluacion en robot real.

## Requisitos de hardware
- Estimacion de memoria a partir del numero de parametros: unos 8,3 GB en bf16/fp16 y unos 16,6 GB en fp32 solo para los pesos.
- El repositorio ocupa 9,4 GB, incluyendo pesos, configuracion, preprocesado/postprocesado y estados de normalizacion.
- Con tres imagenes de 224x224, buffers de estado y el bucle de denoising, la VRAM realista en bf16 se situa por encima de los pesos puros; no se dispone de una cifra medida en la informacion proporcionada.
- GPU recomendadas para entrenamiento o inferencia holgada: A100 (40 o 80 GB), H100 y L40S.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB queda al limite y en GPUs de 8 GB no es viable, ya que no existen pesos cuantizados publicados.
- Despliegue: la libreria declarada es lerobot, sobre PyTorch. Los campos de entrada personalizados pueden requerir la implementacion concreta RLWRLD/hiwrld-ll-policy.
- No hay soporte conocido de llama.cpp, Ollama, GGUF ni de servidores tipo vLLM o TGI para este artefacto; el despliegue implica un bucle de control con camaras y robot.
- Latencia y throughput: no disponibles. Como referencia de coste computacional, la inferencia usa 10 pasos de denoising por cada chunk de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|
| Este modelo (jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-object-classification-60k) | 4.143.404.816 | No disponible | Publicado en HuggingFace, 0 descargas y 0 likes | Fine-tune de tarea unica object_classification, 60.000 pasos, 3 vistas |
| lerobot/pi05_base | No disponible en la informacion proporcionada | No disponible | Modelo base publicado por LeRobot | Modelo de partida del fine-tuning; sin especializacion en el banco de trabajo real |

No se dispone de datos de parametros, contexto, rendimiento o licencia de otras alternativas de politica robotica en la informacion proporcionada, por lo que no se incluyen cifras adicionales para no inventarlas.

## Limitaciones y advertencias
- No hay metricas de evaluacion en robot real ni en simulacion: la model card indica explicitamente que es una politica entrenada y que no se reclaman resultados.
- Especializacion estrecha: la tarea declarada es object_classification sobre un dataset concreto (real_workbench-taco), por lo que el comportamiento fuera de esa distribucion de objetos, camaras e iluminacion no esta caracterizado.
- Dependencia de las entradas exactas: los modelos de subtarea requieren el texto de subtarea por fotograma y los modelos de 3 vistas requieren ademas la imagen keyframe definida por el dataset.
- Dependencia de implementacion: los campos de entrada personalizados pueden exigir la implementacion RLWRLD/hiwrld-ll-policy; usar LeRobot estandar puede no reproducir el comportamiento.
- Licencia no declarada: no se puede asumir uso comercial sin aclaracion del autor, y la licencia del modelo base tampoco se detalla en la informacion disponible.
- Sesgos conocidos: no documentados. No se proporciona informacion sobre la composicion demografica o de escenas del dataset que permita evaluar sesgos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones incorrectas o inseguras cuando la observacion se aleja de la distribucion de entrenamiento.
- Idiomas: no disponibles; la model card no especifica el idioma ni el formato del texto de subtarea.
- Artefacto de inferencia unicamente: no incluye estado de optimizador ni de reanudacion, y las rutas especificas del host se eliminaron de los metadatos JSON, por lo que reanudar entrenamiento exige aportar rutas locales.
- Validacion externa nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente.
- En produccion, cualquier integracion robotica exige limites de seguridad, parada de emergencia y validacion de velocidades cartesianas, dado que la politica emite consignas de velocidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-object-classification-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementacion de entrenamiento citada en la model card: RLWRLD/hiwrld-ll-policy (nombre indicado en la model card; no se aporta URL)
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces obtenidos correspondian a sitios sin relacion con IA, robotica o aprendizaje automatico, por lo que se omiten.
