# Myungkyu/pi0_5_robodojo_taco_visual_b64_60k

## Resumen

pi0_5_robodojo_taco_visual_b64_60k es un ajuste fino de tipo vision-language-action (VLA) desarrollado por el usuario Myungkyu sobre el modelo base lerobot/pi05_base. Se trata de una politica de bajo nivel pensada para control robotico bimanual en tareas de sobremesa (tabletop) de horizonte largo: el modelo recibe imagenes de tres camaras en vivo (cabeza y munecas izquierda y derecha), un slot adicional de "keyframe", la propiocepcion del robot y un texto de subtarea, y produce acciones motrices. El entrenamiento se hizo sobre el dataset Myungkyu/RoboDojo-taco-visual-gemini, compuesto por 8 tareas reales de robot bimanual con 100 demostraciones cada una y etiquetas densas de subtarea anotadas fuera de linea.

La innovacion principal que documenta el autor es la representacion de la subtarea de forma parcialmente visual. Cuando la etiqueta de subtarea nombra una posicion, el slot de keyframe contiene el fotograma de la camara de cabeza con esa posicion dibujada como marcador (disco rojo de radio igual al 1,9 % del ancho de la imagen, con anillo blanco), y la posicion desaparece del texto, que pasa a referirse a "la ubicacion marcada en el keyframe". Cuando la etiqueta no nombra una posicion, el keyframe es una copia plana del fotograma de cabeza. Esto convierte el grounding espacial en una senal visual en lugar de textual.

El modelo tiene 4.143.404.816 parametros (unos 4,14 mil millones) almacenados en safetensors, con un repositorio de 9,4 GB, y se distribuye a traves de la libreria LeRobot. Es un checkpoint muy especializado, orientado a investigacion en robotica y a experimentos de ajuste fino dentro del ecosistema LeRobot, no a uso como modelo de lenguaje general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (vision-language-action) con tres vistas de camara en vivo y un slot de keyframe; no se detallan mas componentes en la informacion disponible |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones, dato de los safetensors) |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el texto de subtarea de los ejemplos de la model card esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, cargados mediante la libreria lerobot |
| Modelo base | lerobot/pi05_base |
| Dataset de ajuste fino | Myungkyu/RoboDojo-taco-visual-gemini |
| Entradas | imagen de cabeza, imagenes de muneca izquierda y derecha, slot de keyframe (fotograma de cabeza con marcador de punto), propiocepcion y texto de subtarea visual |
| Entrenamiento | optimizador con batch 64, 60.000 pasos, checkpoint final |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-13 |

## Arquitectura y entrenamiento

El modelo es una politica VLA de la familia Pi0.5, derivada por ajuste fino del checkpoint lerobot/pi05_base. La entrada combina cuatro flujos visuales (camara de cabeza, muneca izquierda, muneca derecha y slot de keyframe), el estado de propiocepcion y una instruccion textual de subtarea. La peculiaridad del pipeline es el tratamiento del keyframe: se dibuja la posicion objetivo sobre el fotograma de cabeza como un disco rojo con radio del 1,9 % del ancho de la imagen y anillo blanco, y la referencia textual correspondiente se sustituye por expresiones del tipo "the location marked in the keyframe" o "<cell> marked in the keyframe". Cuando la etiqueta no designa una posicion, el slot contiene una copia sin marcas del fotograma de cabeza. De este modo, el modelo debe resolver el grounding espacial a partir de la imagen anotada en lugar de hacerlo a partir de coordenadas en el texto.

El ajuste fino se realizo sobre Myungkyu/RoboDojo-taco-visual-gemini, un dataset de 8 tareas reales de robot bimanual de sobremesa de horizonte largo, con 100 demostraciones por tarea y etiquetas densas de subtarea generadas mediante anotacion fuera de linea a partir del contexto especifico de cada tarea. La configuracion de entrenamiento indicada en la model card es un optimizador con batch 64 durante 60.000 pasos, y se publica el checkpoint final. No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones posteriores al preentrenamiento: esa informacion no esta disponible. La model card advierte ademas que las configuraciones referencian el backbone y el tokenizer del modelo base por identificador de hub o por rutas locales del sitio de entrenamiento, por lo que hay que redirigirlas a copias locales antes de cargar el modelo.

## Capacidades

- Control motor bimanual de bajo nivel en tareas de manipulacion de sobremesa, a partir de observaciones visuales y de propiocepcion.
- Condicionamiento por texto de subtarea visual, incluida la comprension de referencias espaciales resueltas mediante marcadores dibujados sobre la imagen ("la ubicacion marcada en el keyframe").
- Procesamiento conjunto de tres vistas en vivo (cabeza, muneca izquierda, muneca derecha) mas un slot de keyframe independiente.
- Ejecucion de tareas de horizonte largo descompuestas en subtareas, segun el diseno del dataset de 8 tareas de RoboDojo.
- Aprendizaje por demostracion: politica entrenada con 100 demostraciones por tarea sobre robot real.
- Tool calling / function calling: no aplicable; no es un modelo de lenguaje de proposito general y no se documenta ninguna interfaz de este tipo.
- Capacidades de agente o razonamiento multi-paso a nivel de texto: no disponible; el modelo opera como politica de bajo nivel, no como planificador.
- Capacidades multilingues: no disponible; los ejemplos documentados de texto de subtarea estan en ingles.
- Capacidades especiales: representacion visual de la subtarea mediante keyframe con marcador de punto; no se documentan modos de pensamiento, vision general ni audio.

## Casos de uso

- Manipulacion bimanual de sobremesa en laboratorio: el modelo esta ajustado especificamente para tareas bimanuales de tabletop con tres camaras y propiocepcion, por lo que puede emplearse como politica de bajo nivel en un montaje fisico equivalente al de RoboDojo.
- Investigacion en representaciones de subtarea: al comparar el slot de keyframe con marcador frente a la copia plana del fotograma de cabeza, sirve como punto de partida para experimentos sobre si el grounding espacial conviene codificarlo en la imagen o en el texto.
- Ejecucion de tareas de horizonte largo descompuestas: el entrenamiento con etiquetas densas de subtarea permite invocar el modelo paso a paso dentro de una jerarquia, con un planificador externo que emite cada subtarea y el modelo que genera las acciones.
- Reproduccion de resultados sobre RoboDojo: es un checkpoint final de un entrenamiento de 60.000 pasos con batch 64, util para replicar o refutar los resultados del autor sobre las 8 tareas del dataset.
- Ajuste fino posterior con datos propios: al ser un modelo LeRobot, puede reentrenarse con demostraciones nuevas de un montaje distinto (siempre que se mantenga el formato de entradas: tres camaras, keyframe y propiocepcion) para transferir a otras tareas de manipulacion.
- Docencia y prototipado en robotica: permite montar un pipeline completo de VLA (captura de imagenes, anotacion de subtareas, inferencia y control) sobre un unico modelo de 4,14 mil millones de parametros que cabe en una GPU de gama alta de consumo.
- Evaluacion de robustez ante cambios de camara o de calibracion: el peso que el modelo da a cada vista (cabeza frente a munecas) y al keyframe puede estudiarse variando la calidad o la presencia de esas entradas, algo relevante para desplegar en entornos menos controlados que un banco de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir la arquitectura de entradas, el dataset de ajuste fino y los hiperparametros de entrenamiento (batch 64, 60.000 pasos, checkpoint final), sin incluir tasas de exito por tarea ni comparaciones numericas con otros modelos.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en las 8 tareas de RoboDojo | no disponible |
| Comparativas con pi05_base u otras politicas VLA | no disponible |
| Metricas de latencia o frecuencia de control | no disponible |

## Requisitos de hardware

- Parametros: 4.143.404.816 (aproximadamente 4,14 mil millones).
- Pesos en bf16/fp16: unos 8,3 GB (aproximadamente 7,7 GiB); en fp32, unos 16,6 GB (aproximadamente 15,4 GiB).
- Estimacion de VRAM para inferencia en bf16: 12-16 GB como minimo practico (pesos mas activaciones de las cuatro entradas visuales y la cache de decodificacion). Un margen de 16-24 GB es lo recomendable para trabajar con comodidad.
- GPU recomendadas: NVIDIA RTX 4090, RTX 5090, A6000 o L40S (24-48 GB) para inferencia en bf16; A100 40/80 GB y H100 para entrenamiento o ajuste fino y para lotes mayores.
- Cabe en GPU de consumo: si, en bf16 cabe en una RTX 4090 (24 GB) y, con cuantizacion a 8 bits (unos 3,9 GiB de pesos), en tarjetas de 12-16 GB si el resto del pipeline lo permite. No hay cuantizaciones publicadas por el autor.
- Opciones de despliegue: libreria lerobot (PyTorch) sobre CUDA. No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI, ya que se trata de una politica VLA con torre de vision y no de un modelo de lenguaje puro; habria que exportar los pesos a un formato compatible, algo que la informacion disponible no cubre.
- Almacenamiento: el repositorio ocupa 9,4 GB, por encima del peso teorico de los parametros en bf16, lo que sugiere ficheros auxiliares o pesos en mayor precision.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_5_robodojo_taco_visual_b64_60k | 4.143.404.816 | no disponible | Politica VLA bimanual de sobremesa (RoboDojo) | no disponible | Repositorio HuggingFace, 0 descargas, 0 likes |
| lerobot/pi05_base | no disponible en la informacion proporcionada | no disponible | Modelo base VLA del que deriva este ajuste fino | no disponible | Disponible en HuggingFace como lerobot/pi05_base |
| Otras familias VLA (OpenVLA, GR00T N1, RDT) | no disponible | no disponible | Manipulacion robotica generalista | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar este checkpoint con alternativas de la misma categoria en terminos de rendimiento, contexto o licencia. La unica relacion documentada es la dependencia directa de lerobot/pi05_base.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia en el repositorio, no hay autorizacion explicita para uso comercial ni para redistribucion; hay que contactar con el autor o tratar el modelo como no licenciado.
- Especializacion extrema: esta ajustado sobre 8 tareas concretas de robot bimanual de sobremesa con 100 demostraciones cada una, por lo que es esperable un rendimiento pobre fuera de ese dominio, de ese montaje de camaras o de esa morfologia de robot.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios de iluminacion, de posicion de camaras, de calibracion o de propiedades fisicas de los objetos no estan cubiertos por la informacion disponible y no hay evaluaciones publicadas al respecto.
- Alucinacion en el sentido de acciones incorrectas: como politica de control, los errores se manifiestan como movimientos que no completan la subtarea; no se documentan mecanismos de deteccion de fallo, recuperacion o vuelta atras.
- Idioma: los ejemplos de texto de subtarea estan en ingles y no se declara soporte multilingue.
- Dependencia de configuracion: la model card advierte que las configs referencian el backbone y el tokenizer por identificador de hub o por rutas locales del sitio de entrenamiento, de modo que la carga puede fallar si no se redirigen a copias locales.
- Dependencia del marcador de keyframe: el significado de la subtarea depende de que el marcador se dibuje exactamente igual que en entrenamiento (disco rojo con radio del 1,9 % del ancho y anillo blanco); desviarse de ese formato puede degradar el grounding.
- Sin validacion comunitaria: 0 descargas y 0 likes, sin resultados de benchmarks publicados, por lo que no existe evidencia independiente de su rendimiento.
- Sin cuantizaciones oficiales: no hay pesos GGUF, AWQ, GPTQ ni equivalentes, lo que limita el despliegue en hardware modesto.
- Uso previsto: investigacion en robotica y experimentacion con LeRobot; no es un modelo de lenguaje general y no debe usarse para generacion de texto, codigo o atencion al cliente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_robodojo_taco_visual_b64_60k
- Dataset de ajuste fino: https://huggingface.co/datasets/Myungkyu/RoboDojo-taco-visual-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Perfil del autor: https://huggingface.co/Myungkyu
- Libreria LeRobot (repositorio de codigo): https://github.com/huggingface/lerobot
- Paper, blog o demo especificos de este checkpoint: no disponibles en la informacion proporcionada.
- Busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo (contenido de foros sobre la mediateca de ZDF), por lo que no aportan enlaces utilizables.
