# RealmanRobot/Foundation_Pose

## Resumen

Foundation_Pose es un repositorio de pesos publicado por RealmanRobot en Hugging Face que contiene los checkpoints utilizados por su SDK de estimacion de pose 6D de objetos. El modelo estima la pose (rotacion y traslacion) de un objeto respecto al sistema de coordenadas de la camara a partir de una imagen RGB, un mapa de profundidad, una mascara de segmentacion del objeto, un modelo CAD tridimensional del mismo y los parametros intrinsecos de la camara.

El repositorio no contiene codigo de inferencia ni entorno de ejecucion: incluye unicamente dos ficheros de pesos, `predict_ckpt.pth` (etapa de prediccion) y `refine_ckpt.pth` (etapa de refinamiento), que deben cargarse de forma conjunta. Para utilizarlos es necesario descargar el SDK complementario desde el repositorio GitHub `rm-pose` del mismo autor y respetar la estructura de directorios que este define.

Se trata de un modelo de vision por computador orientado a robotica, no de un modelo de lenguaje: no procesa texto, no tiene ventana de contexto en el sentido de los LLM y no esta pensado para generacion de lenguaje, razonamiento ni tool calling. Su relevancia practica esta en tareas de manipulacion robotica, realidad aumentada industrial y control de calidad, donde la estimacion precisa de la pose 6D de un objeto conocida su geometria CAD es un requisito habitual. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Segun la model card, el sistema opera en dos etapas diferenciadas (prediccion y refinement) con un checkpoint independiente para cada una |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en formato PyTorch, sin variantes cuantizadas publicadas |
| Idiomas soportados | No aplica (las entradas son imagenes, profundidad, mascaras y mallas CAD) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`): `predict_ckpt.pth` y `refine_ckpt.pth` |
| Entradas requeridas | Imagen RGB, mapa de profundidad, mascara de segmentacion del objeto, malla CAD del objeto y parametros intrinsecos de camara |
| Salida | Pose 6D del objeto (matriz de rotacion y traslacion) respecto a la camara |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

La model card no proporciona informacion sobre la arquitectura interna del modelo, el numero de parametros, el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de ajuste como RLHF o DPO (estas ultimas no serian aplicables a un modelo de vision de este tipo). Tampoco se detalla si el entrenamiento fue desde cero o un ajuste de pesos preexistentes, ni que funcion de perdida o estrategia de supervision se utilizo.

Lo unico documentado es la organizacion en dos etapas: una etapa de prediccion (`predict_ckpt.pth`) que genera una estimacion inicial de la pose, y una etapa de refinement (`refine_ckpt.pth`) que la ajusta. La model card insiste en que ambos checkpoints deben cargarse simultaneamente, ya que el pipeline no funciona con uno solo. Dado el nombre del modelo, es presumible una relacion con el metodo FoundationPose publicado por NVIDIA Research, pero la informacion proporcionada no confirma linaje, diferencias ni modificaciones respecto a dicha referencia, por lo que no se pueden afirmar detalles tecnicos adicionales. El SDK de inferencia reside en un repositorio GitHub separado, y la model card remite a el para cualquier detalle de entorno, interfaces y convenciones de coordenadas.

## Capacidades

- Estimacion de pose 6D de objetos con geometria conocida (se dispone de su malla CAD) a partir de RGB-D.
- Integracion de informacion multimodal de entrada: imagen en color, profundidad, mascara de segmentacion e intrinsecos de camara.
- Refinamiento de la pose inicial mediante una segunda etapa de red, lo que permite corregir estimaciones gruesas.
- Uso con objetos noveles en el sentido de que la geometria se aporta como CAD en tiempo de inferencia, sin reentrenamiento documentado.
- Salida de una matriz de pose utilizable en pipelines de robotica, realidad aumentada o metrologia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No dispone de modo "thinking", entrada de audio ni generacion de imagenes.

## Casos de uso

- Bin picking robotico: dado un contenedor con piezas apiladas y su CAD, estimar la pose 6D de cada pieza con la mascara segmentada para planificar el agarre con una pinza o ventosa. La profundidad y la mascara son entradas obligatorias, lo que encaja con sistemas de vision industrial que ya disponen de camaras de profundidad.
- Ensamblaje automatico de precision: verificar la orientacion de un componente antes de insertarlo en una cavidad, comparando la pose estimada con la pose nominal del programa de montaje. La etapa de refinement resulta adecuada cuando se exige tolerancia fina.
- Control de calidad en linea de produccion: comprobar que la orientacion de una pieza sobre una cinta transportadora coincide con la esperada y rechazar aquellas que esten giradas o mal posicionadas.
- Recogida robotica en almacenes: estimar la pose de cajas, bandejas o contenedores de geometria conocida para que un brazo robotizado los recoja y los deposite en otra ubicacion.
- Calibracion y validacion de celulas robotizadas: utilizar el modelo para medir la desviacion entre la pose real del objeto y la pose esperada segun la calibracion mano-ojo, detectando errores de calibracion de camara o de cinematica.
- Realidad aumentada industrial: superponer instrucciones o elementos graficos sobre un objeto fisico identificando su pose 6D con una camara RGB-D, por ejemplo en mantenimiento guiado o formacion de operarios.
- Seguimiento de objetos en entornos de investigacion: integrar el SDK en un pipeline de vision para generar trayectorias de objetos manipulados, alimentando algoritmos de aprendizaje por imitacion o de planificacion.
- Prototipado con ROS: empaquetar el SDK como nodo de percepcion que publique la pose del objeto como transformada en el arbol TF, con la salvedad de que el repositorio no incluye dicho nodo y habria que desarrollarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye tablas de resultados, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los enlaces recuperados correspondian al navegador Safari de Apple y a servicios de reserva de viajes, sin ninguna relacion con el repositorio). No se dispone por tanto de cifras de ADD, ADD-S, VSD ni de ninguna otra metrica habitual en estimacion de pose 6D.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El repositorio pesa 0,3 GB en total, de modo que los pesos en precision completa ocupan un orden de magnitud inferior a 1 GB; el consumo real dependera del backend, del tamano de los tensores intermedios y de la resolucion de entrada, que no se documentan.
- GPU recomendadas: no disponible. La model card no especifica requisitos de GPU ni version de CUDA. Cualquier recomendacion de modelos concretos (A100, H100, RTX 4090, etc.) seria una suposicion no respaldada por la documentacion.
- Compatibilidad con GPU de consumo: no confirmada. Dado el reducido tamano del repositorio es plausible que quepa en GPU de consumo con suficiente memoria, pero esto debe validarse de forma empirica contra el SDK antes de asumirlo.
- Opciones de despliegue: el unico camino documentado es el SDK en Python disponible en https://github.com/RealManRobot/rm-pose, con los checkpoints colocados en `tests/weights/predict_ckpt/predict_ckpt.pth` y `tests/weights/refine_ckpt/refine_ckpt.pth`, o bien pasando ambas rutas directamente a la API. El ejemplo de la model card emplea OpenCV y `pyrealsense2`, lo que sugiere uso con camaras Intel RealSense, aunque no se declara como requisito estricto.
- Servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama: no aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.
- Consideraciones de despliegue: el modelo exige disponer de malla CAD del objeto, mascara de segmentacion y fichero de intrinsecos en cada inferencia, por lo que el coste del pipeline incluye componentes externos al propio modelo (segmentacion y lectura de profundidad).

## Comparativa con modelos similares

No se dispone de datos verificables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. La model card no menciona modelos comparables ni cifras de rendimiento, y la busqueda web no aporto informacion relacionada con estimacion de pose 6D.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Foundation_Pose (RealmanRobot) | No disponible | No aplica | No disponible | MIT | Pesos en Hugging Face + SDK en GitHub |
| Alternativas de estimacion de pose 6D basadas en CAD | No disponible | No aplica | No disponible | No disponible | No disponible |

Cualquier comparacion con otros metodos del area de estimacion de pose 6D basados en CAD requeriria datos que no forman parte de la informacion facilitada, por lo que se omite deliberadamente para no introducir cifras no verificadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo geometrico guiado por CAD, su comportamiento depende fuertemente de la similitud entre la malla CAD y el objeto real.
- Dependencia de entradas auxiliares: requiere obligatoriamente malla CAD, mascara de segmentacion, profundidad e intrinsecos de camara. Sin cualquiera de ellos la inferencia no es posible.
- Dependencia del SDK: los pesos solo son utilizables con la version correspondiente del SDK `rm-pose`. Un desajuste de version puede impedir la carga de los checkpoints.
- Ausencia de codigo: el repositorio de Hugging Face contiene unicamente pesos. No hay pipeline declarado ni documentacion de la API mas alla del ejemplo proporcionado.
- Sensibilidad a condiciones de captura: la propia model card advierte de que el resultado se ve afectado por la calibracion de camara, el ruido de profundidad, las oclusiones, los materiales reflectantes y la precision del modelo CAD.
- Riesgo de error en produccion: en objetos con simetrias, geometrias ambiguas o materiales metalicos o brillantes, la pose estimada puede presentar ambiguedad o error elevado.
- Validacion obligatoria: el autor recomienda realizar pruebas independientes con la camara y los objetos concretos antes de un uso en produccion.
- Uso en sistemas criticos: la model card desaconseja explicitamente utilizar los resultados sin validar en aplicaciones relacionadas con la seguridad de personas o en sistemas de control de alto riesgo.
- Licencia: MIT, lo que permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la licencia. No obstante, conviene revisar la licencia del SDK y de cualquier componente de terceros incluido en el.
- Idiomas: no aplica, pero conviene tener en cuenta que la model card esta redactada en chino, lo que puede dificultar el soporte y la documentacion para equipos hispanohablantes.
- Soporte: el repositorio registra 0 descargas y 0 likes, sin senales de comunidad activa ni de mantenimiento continuado.

## Enlaces

- Repositorio de pesos en Hugging Face: https://huggingface.co/RealmanRobot/Foundation_Pose
- SDK de inferencia en GitHub: https://github.com/RealManRobot/rm-pose
- Paper, blog o demo oficiales: no disponible
- Resultados de benchmarks: no disponible
- La busqueda web realizada no devolvio ningun enlace relacionado con el modelo; los resultados obtenidos correspondian a contenidos sin relacion (navegador Safari y servicios de reserva de viajes).
