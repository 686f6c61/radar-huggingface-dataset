# gehaozhang/gam-wilddet3d

## Resumen

GAM-WildDet3D es el conjunto de pesos del detector general WildDet3D que forma parte de GAM (Grounded Action Model), un sistema de robotica orientado a grounding de objetos en 3D a partir de instrucciones en lenguaje natural. Lo publica el usuario gehaozhang dentro del ecosistema LeRobot, y su proposito es servir como detector por defecto, independiente de cualquier benchmark, para entrenar politicas sobre datasets de LeRobot sin necesidad de anotar objetos manualmente.

El paquete incluye dos componentes: un detector WildDet3D construido sobre un backbone SAM3 con prompts de texto y de clic, cabeceras de caja 2D y 3D y una cabecera de profundidad; y una cabecera span universal que convierte una cadena de tarea en las frases de objeto que deben localizarse. Esta segunda pieza combina un encoder flan-t5-large congelado con una cabeza transformer de dos capas y pesa solo 26 MB, frente a los 4,7 GB del detector principal.

Su relevancia es practica: el repositorio de codigo asociado define un flujo en el que se detectan las frases de objeto en el primer fotograma y se siguen a lo largo del episodio con CoTracker, de forma que cualquier dataset de LeRobot con una cadena de tarea puede entrenarse sin etiquetado adicional. La receta monoculo no requiere profundidad ni calibracion mas alla de las intrinsecas de camara declaradas en el YAML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectante WildDet3D con backbone SAM3, prompts de texto y clic, cabeceras de caja 2D y 3D y cabecera de profundidad; cabecera span con encoder flan-t5-large congelado mas transformer de 2 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la cabecera span procesa cadenas de tarea individuales, sin contexto declarado) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen sin cuantizar en formato .pt) |
| Idiomas soportados | no disponible (los ejemplos y plantillas de entrenamiento estan en ingles) |
| Licencia | other |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El componente principal, `wilddet3d_general_v1.pt` (4,7 GB), es un detector WildDet3D entrenado sobre una mezcla general de datos que incluye DROID. Emplea un backbone SAM3 y acepta tanto prompts de texto como prompts de clic, y produce simultaneamente cajas 2D, cajas 3D y mapas de profundidad. El orden de ejes de las extensiones de caja es `[h, l, w]`, configurado mediante `box_whl_perm: [1, 2, 0]`.

El segundo componente, `span_head_universal.pt` (26 MB), convierte una instruccion de tarea en las frases de objeto a los que hay que hacer grounding. Se construye sobre un encoder flan-t5-large congelado seguido de una cabeza transformer de dos capas, y se entreno con plantillas de RoboTwin, anotaciones de LIBERO y DROID y aproximadamente 80.000 cadenas de tarea procedentes de datasets de LeRobot alojados en el Hub. Tras la extraccion de frases, `GAM.text.phrases.manipulation_objects()` filtra las referencias espaciales ("from the top drawer", "beside the box") para que solo los objetos sobre los que se va a actuar se conviertan en slots. La cabecera es reentrenable con `python -m GAM.text.train_span_head --labels my_labels.json --init span_head_universal.pt`, usando un JSON con el formato `{"instruction": ..., "span": [object phrases]}`.

En el flujo de entrenamiento, `GAM.tools.track` ejecuta la cabecera span sobre la cadena de tarea de cada episodio, detecta las frases en el primer fotograma con este detector y las sigue a lo largo del episodio mediante CoTracker offline; despues, el entrenamiento alimenta al detector con esos puntos fotograma a fotograma. La receta monoculo (`detector_depth: zero`, `geometry_depth: pred`) no necesita profundidad ni calibracion adicional mas alla de las intrinsecas de camara del YAML.

## Capacidades

- Deteccion de objetos con vocabulario abierto a partir de prompts de texto.
- Deteccion con prompts de clic, ademas de los prompts textuales.
- Prediccion de cajas 2D y cajas 3D con orden de ejes `[h, l, w]`.
- Estimacion de profundidad mediante cabecera dedicada, con modo monoculo (`geometry_depth: pred`).
- Extraccion de frases de objeto a partir de una cadena de tarea en lenguaje natural (cabecera span universal).
- Filtrado de referencias espaciales y de puntos de referencia para aislar los objetos sobre los que se debe actuar.
- Seguimiento de objetos a lo largo de un episodio mediante CoTracker offline.
- Integracion con el ecosistema LeRobot: entrenamiento sobre cualquier dataset con cadena de tarea sin etiquetado manual.
- Reentrenamiento de la cabecera span con instrucciones propias.

## Casos de uso

- Entrenamiento de politicas sobre datasets de LeRobot sin anotacion: el detector localiza los objetos mencionados en la cadena de tarea del episodio, de modo que un equipo puede reutilizar datos ya grabados sin etiquetar cajas manualmente.
- Manipulacion robotica con instrucciones en lenguaje natural: la cabecera span convierte una orden como recoger el cuenco en las frases de objeto concretas, que el detector convierte en cajas 3D para el planificador.
- Tareas de apilado y organizacion (tipo RoboTwin `stack_bowls_two`): el seguimiento por CoTracker mantiene la identidad de cada objeto durante el episodio, lo que permite apilar objetos aleatorizados con la posicion actualizada en cada fotograma.
- Manipulacion con multiples objetos y referencias espaciales (tipo LIBERO-PRO `libero_10 / object`): el filtrado de la cabecera span descarta puntos de referencia como "al lado de la caja" y evita que el robot intente actuar sobre ellos.
- Configuracion monoculo en robots sin sensor de profundidad: la receta `detector_depth: zero` con `geometry_depth: pred` permite desplegar el detector con una sola camara RGB y las intrinsecas declaradas en el YAML.
- Preprocesado de datos de robotica a escala: al procesar miles de cadenas de tarea procedentes del Hub, el sistema puede generar automaticamente etiquetas de objeto para un corpus propio.
- Adaptacion a dominios concretos: reentrenar solo la cabecera span (26 MB) sobre instrucciones especificas de un almacen o laboratorio es mucho mas barato que reentrenar el detector completo.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card unicamente presenta demostraciones cualitativas en dos entornos:

| Entorno | Tarea | Tipo de resultado |
|---|---|---|
| RoboTwin 2.0 | stack_bowls_two (aleatorizado) | Demostracion en GIF, sin metricas |
| LIBERO-PRO | libero_10 / object | Demostracion en GIF, sin metricas |

Las visualizaciones muestran las cajas 3D que WildDet3D predice para los objetos indicados, presentadas junto a los detectores ajustados a benchmark de las otras dos publicaciones. No se proporcionan valores de exito, mAP ni ninguna otra metrica.

## Requisitos de hardware

- Peso del detector `wilddet3d_general_v1.pt`: 4,7 GB. Si los pesos estuvieran en fp32, equivaldria aproximadamente a 1,2 mil millones de parametros; este dato no esta confirmado por el autor.
- Peso de la cabecera span `span_head_universal.pt`: 26 MB.
- VRAM estimada para el detector: del orden de 5 a 7 GB en fp32 incluyendo activaciones, y aproximadamente 3 GB en fp16. Son estimaciones derivadas del tamano del checkpoint, no cifras publicadas.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 6 GB o mas de VRAM para el detector, y con margen amplio en RTX 3060, RTX 4060, RTX 4090 y similares. La cabecera span, de 26 MB, cabe en cualquier GPU.
- GPU de centro de datos: no se especifica ninguna recomendada. A100, H100 y L40S son opciones razonables por capacidad, pero el autor no publica recomendaciones.
- Opciones de despliegue: no disponibles. El repositorio proporciona scripts propios (`benchmarks/lerobot/inspect_dataset.py` y `benchmarks/lerobot/train.py`) y no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencia adicional: el seguimiento requiere CoTracker ejecutandose en modo offline.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Los modelos de la misma categoria (deteccion con vocabulario abierto y grounding 3D para robotica, como SAM 3, Grounding DINO o los detectores propios de los benchmarks RoboTwin y LIBERO-PRO) no aparecen con especificaciones numericas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| GAM-WildDet3D | no disponible | no disponible | other | HuggingFace, 0 descargas | No publicados |
| GAM-LIBERO-PRO | no disponible | no disponible | no disponible | HuggingFace | No publicados |
| GAM-RoboTwin | no disponible | no disponible | no disponible | HuggingFace | No publicados |

La unica diferencia verificable entre las tres publicaciones del mismo autor es el ajuste del detector: GAM-WildDet3D se presenta como la version independiente de benchmark, mientras que GAM-LIBERO-PRO y GAM-RoboTwin son las versiones ajustadas a cada benchmark.

## Limitaciones y advertencias

- No hay resultados cuantitativos publicados: la unica evidencia de funcionamiento son GIFs de demostracion, lo que impide evaluar la tasa de exito antes de desplegarlo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa por parte de la comunidad.
- La licencia figura como `other`, sin texto de licencia publicado en la informacion disponible. Es imprescindible revisar los terminos exactos antes de cualquier uso comercial.
- El detector WildDet3D reutiliza un backbone SAM3, lo que puede arrastrar las restricciones de licencia del modelo original.
- No se declaran idiomas soportados; las plantillas de entrenamiento y los ejemplos estan en ingles, por lo que el rendimiento con instrucciones en castellano es desconocido.
- Riesgo de alucinacion y de falsos positivos inherente a la deteccion con vocabulario abierto: el detector puede generar cajas para objetos que no estan presentes.
- La cabecera span universal se entreno mayoritariamente con plantillas de RoboTwin, LIBERO, DROID y cadenas de tarea del Hub; su generalizacion a instrucciones muy distintas a esas plantillas no esta medida.
- El flujo depende de CoTracker en modo offline, lo que limita su uso en inferencia en tiempo real si no se sustituye por un seguidor online.
- El orden de ejes de las extensiones de caja es `[h, l, w]` y requiere configurar `box_whl_perm: [1, 2, 0]`. Una configuracion incorrecta produce cajas con dimensiones intercambiadas.
- El sistema esta disenado para robotica con camara; no es un modelo de proposito general de texto.
- Repositorio de 4,8 GB: el detector principal solo, de 4,7 GB, domina el espacio de almacenamiento y de transferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gehaozhang/gam-wilddet3d
- Codigo: https://github.com/GehaoZhang6/Grounding-Action-Model
- Release de benchmark GAM-LIBERO-PRO: https://huggingface.co/gehaozhang/gam-libero-pro
- Release de benchmark GAM-RoboTwin: https://huggingface.co/gehaozhang/gam-robotwin
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos correspondian a contenidos de Comic Vine sin relacion con el modelo.
