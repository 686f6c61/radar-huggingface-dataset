# AllenInstitute/sleap-ctlut-sleap-trial1-foraging-bot-han-lucas-2022-04-27

## Resumen

Este modelo de SLEAP (Social LEAP Estimates Animal Poses) ha sido desarrollado por el Allen Institute y entrenado por Hilda Azimi para el seguimiento de la postura de un animal —probablemente un roedor— en un experimento de forrajeo con un robot. El modelo detecta 17 puntos anatomicos clave, incluyendo cinco puntos de la lengua, dos patas, seis bigotes, la nariz, la mandibula y dos lickports (dispensadores de liquido). Se publica como parte del ecosistema SLEAP, un framework de codigo abierto para estimacion de posturas animales descrito en Pereira et al., Nature Methods, 2022.

El modelo emplea una estrategia top-down que combina deteccion de centroides (topdown.centroid) con estimacion de instancias centradas (topdown.centered_instance). Esta aproximacion localiza primero al animal en el frame y despues refina la posicion de los keypoints, lo que resulta adecuado para experimentos conductuales con un unico individuo. La model card lista diez entradas de tipo de modelo (cinco pares de centroid y centered_instance), lo que sugiere un pipeline compuesto por multiples submodelos.

La relevancia de este modelo radica en su aplicacion directa a estudios de comportamiento de forrajeo, donde es necesario cuantificar con precision los movimientos de la lengua, las patas y los bigotes durante la interaccion con un dispensador. Con un error de localizacion mediano de 2,46 px en validacion, ofrece una precision suficiente para analisis conductuales detallados, aunque el OKS mAP de 0,3 indica margen de mejora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Framework | SLEAP |
| Arquitectura | topdown.centered_instance + topdown.centroid (pipeline de 5 pares) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de vision por computador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | formato nativo SLEAP (no especificado) |
| Numero de keypoints | 17 |
| Keypoints | tongueTip, tongueLeftFront, tongueRightFront, tongueLeftBack, tongueRightBack, LickportLeft, LickportRight, nosetip, jaw, pawL, pawR, WLup, WLmid, WLbot, WRup, WRmid, WRbot |
| Version | v1.0 |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo se basa en el framework SLEAP, que emplea una estrategia top-down para la estimacion de posturas animales. Un primer submodelo (topdown.centroid) detecta el centroide del animal en cada frame, y un segundo submodelo (topdown.centered_instance) recorta la region alrededor del centroide y estima la posicion de los 17 keypoints. La model card lista cinco pares de estos submodelos, lo que podria indicar un ensamblado o un pipeline secuencial de refinamiento.

Los detalles del entrenamiento —numero de epochs, tamano del dataset, aumentacion de datos, funcion de perdida— no estan disponibles en la model card. El modelo fue entrenado sobre datos denominados "ctlut" y publicado en su version v1.0. El framework SLEAP incluye capacidades de aprendizaje activo y una GUI de etiquetado, lo que sugiere que el entrenamiento pudo haber involucrado un proceso iterativo de correccion y reentrenamiento, aunque esto no se confirma en la informacion proporcionada. La model card contiene marcadores de posicion sin completar (por ejemplo, "s3://bucket/path or a data asset ID" y "what this model is / what changed"), lo que indica una documentacion parcialmente automatizada.

## Capacidades

- Estimacion de postura animal: detecta 17 puntos anatomicos en roedores, incluyendo lengua (5 puntos), patas (2), bigotes (6), nariz, mandibula y lickports (2).
- Seguimiento de comportamiento de forrajeo: disenado especificamente para experimentos con un robot de forrajeo, donde el animal interactua con un dispensador de liquido.
- Deteccion de centroides: el submodelo topdown.centroid localiza al animal en el frame, permitiendo el seguimiento en video.
- Estimacion de instancia centrada: el submodelo topdown.centered_instance refina la posicion de los keypoints una vez localizado el animal.
- Precision de localizacion: error mediano de 2,46 px en validacion (dist.p50), con OKS mAP de 0,3 y OKS mAR de 0,42.
- Integracion con el ecosistema SLEAP: compatible con las herramientas de etiquetado, entrenamiento y analisis de video del framework.

## Casos de uso

- Estudio del comportamiento de forrajeo: el modelo permite cuantificar la frecuencia y duracion de los contactos de la lengua con el lickport, asi como la coordinacion entre lengua, patas y bigotes durante la interaccion con el robot de forrajeo.
- Analisis de la microestructura de la conducta de lamer: los cinco puntos de la lengua (punta, frontal izquierdo/derecho, trasero izquierdo/derecho) permiten distinguir entre diferentes tipos de contactos linguales con el dispensador, lo que es relevante para estudiar la cinematica del lamer.
- Evaluacion de la coordinacion sensoriomotora: los seis puntos de bigotes (izquierdo y derecho, en posiciones superior, media e inferior) junto con las patas permiten estudiar la integracion de informacion tactil y motora durante la tarea de forrajeo.
- Seguimiento de la postura en sesiones largas: la arquitectura top-down con deteccion de centroide es computacionalmente eficiente y puede aplicarse a grabaciones de sesiones conductuales completas sin intervencion manual.
- Validacion de intervenciones farmacologicas o geneticas: el modelo puede utilizarse para comparar el comportamiento de forrajeo entre grupos experimentales, detectando diferencias en la cinematica de la lengua o las patas con una resolucion de pocos pixeles.
- Investigacion de circuitos neuronales: los datos de pose generados pueden alinearse con registros optogeneticos o electrofisiologicos para correlacionar actividad neuronal con movimientos especificos, un uso comun en neuroetologia.

## Benchmarks y rendimiento

Los resultados de validacion publicados en la model card son los siguientes:

| Metrica | Valor | Interpretacion |
|---|---|---|
| Error de localizacion mediano (px) | 2,46 | Menor es mejor |
| OKS mAP | 0,30 | Mayor es mejor |
| OKS mAR | 0,42 | Mayor es mejor |

No se han publicado comparaciones con otros modelos de estimacion de postura en la informacion disponible.

## Requisitos de hardware

- Los requisitos especificos de VRAM para este modelo no estan disponibles en la model card.
- El tamano del repositorio es de 0,3 GB, lo que sugiere un modelo de tamano moderado, probablemente ejecutable en GPUs de consumo.
- SLEAP, como framework, puede ejecutar inferencia en GPUs NVIDIA de gama media (por ejemplo, GTX 1660 o superiores), aunque los requisitos exactos dependen de la resolucion de los frames y del tamano del modelo.
- Opciones de despliegue: inferencia via Python con el paquete SLEAP, o mediante la GUI de SLEAP para analisis interactivo de videos.
- No se dispone de datos de latencia o throughput para este modelo especifico.

## Comparativa con modelos similares

| Modelo | Framework | Enfoque | Keypoints | Licencia |
|---|---|---|---|---|
| Este modelo (AllenInstitute) | SLEAP | Top-down (centroid + centered instance) | 17 | no disponible |
| DeepLabCut | DeepLabCut | Top-down / bottom-up configurable | configurable | codigo abierto |
| DeepPoseKit | DeepPoseKit | Bottom-up | configurable | codigo abierto |

Nota: la comparativa se basa en caracteristicas generales de los frameworks, ya que no se dispone de datos de rendimiento comparativos especificos para este modelo. DeepLabCut y DeepPoseKit son alternativas establecidas en el campo de la estimacion de posturas animales, pero no se han publicado comparaciones directas con este modelo concreto.

## Limitaciones y advertencias

- La model card contiene marcadores de posicion sin completar (por ejemplo, "s3://bucket/path or a data asset ID" y "what this model is / what changed"), lo que indica que la documentacion esta incompleta y puede haber sido generada de forma automatizada.
- La licencia del modelo no esta especificada, por lo que se debe contactar con el Allen Institute antes de cualquier uso comercial o redistribucion.
- El modelo fue entrenado especificamente para el experimento "ctlut" con un robot de forrajeo; su generalizacion a otros contextos, especies o condiciones de iluminacion no esta garantizada.
- El OKS mAP de 0,3 es relativamente bajo, lo que sugiere que puede haber margen de mejora en la precision de la estimacion de keypoints, especialmente en posturas poco representadas.
- No se dispone de informacion sobre el dataset de entrenamiento (numero de frames, condiciones de iluminacion, variedad de posturas), lo que limita la evaluacion de su robustez y su capacidad de generalizacion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido ampliamente validado por la comunidad.
- Los nombres de los keypoints (WLup, WLmid, WLbot, WRup, WRmid, WRbot) sugieren bigotes, pero la nomenclatura no esta documentada formalmente en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AllenInstitute/sleap-ctlut-sleap-trial1-foraging-bot-han-lucas-2022-04-27
- Sitio oficial de SLEAP: https://sleap.ai/
- Repositorio de SLEAP en GitHub: https://github.com/talmolab/sleap
- Paper de referencia (Pereira et al., Nature Methods, 2022): accesible a traves del repositorio de GitHub de SLEAP
