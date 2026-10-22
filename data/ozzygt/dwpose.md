# OzzyGT/DWPose

## Resumen

DWPose es un modelo de estimacion de pose de cuerpo completo (*whole-body pose estimation*) que localiza 133 puntos clave de una persona en una imagen: cuerpo, manos, pies y rostro. Este repositorio concreto, `OzzyGT/DWPose`, es una redistribucion en formato safetensors del checkpoint `dw-ll_ucoco_384` del proyecto original DWPose, desarrollado por Zhendong Yang, Ailing Zeng, Chun Yuan y Yu Li en IDEA Research (International Digital Economy Academy), y publicado originalmente en `yzd-v/DWPose`.

El modelo no es un modelo de lenguaje: es un estimador de keypoints construido sobre RTMPose, el framework de estimacion de pose de MMPose (OpenMMLab). El usuario objetivo es distinto al de un LLM: se emplea como componente de vision en pipelines de animacion, captura de movimiento, analisis biomecanico, conduccion de modelos generativos (por ejemplo, condicionamiento de ControlNet) o anotacion automatica de datasets.

La relevancia de esta version es practica: empaqueta unicamente los pesos necesarios en safetensors, sin dependencias de checkpoints legacy de MMPose ni ficheros auxiliares, lo que simplifica su carga en entornos modernos. Mantiene la licencia Apache 2.0 del release original. El tamano del repositorio es de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para estimacion de pose basada en RTMPose (MMPose); no es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; procesa imagenes, checkpoint con resolucion 384) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors, sin variantes GGUF, ONNX o INT8 documentadas |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | keypoint-detection |
| Variante / checkpoint | `dw-ll_ucoco_384` (pesos identicos al release original) |
| Salida | 133 puntos clave: cuerpo, manos, pies y rostro |
| Tamano del repositorio | 0,1 GB |
| Modelo base | `yzd-v/DWPose` |
| Fecha de publicacion del repo | 2026-10-21 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RTMPose, una familia de estimadores de pose convolucionales disenada para inferencia en tiempo real. RTMPose combina un backbone convolucional con una cabeza de regresion de coordenadas y una etapa de refinamiento por coordenadas, y el pipeline DWPose anade una segunda fase que detecta manos y rostro a partir de las cajas derivadas del cuerpo, lo que permite obtener los 133 keypoints del estandar COCO-WholeBody. La model card no detalla la configuracion exacta de backbone ni el numero de capas o canales de esta variante concreta; esa informacion debe consultarse en el repositorio original de DWPose y en la configuracion de MMPose.

Respecto a los datos de entrenamiento, el sufijo `ucoco` del checkpoint remite a un conjunto agregado tipo UCOCO (combinacion de corpora de pose de cuerpo completo), pero la model card de este repositorio no especifica el numero de imagenes, la composicion del dataset ni si hubo etapas de destilacion o ajuste fino supervisado por un modelo mayor. Tampoco se documentan aqui innovaciones adicionales mas alla de las propias del pipeline DWPose (deteccion en dos fases y refinamiento de keypoints). No se dispone de informacion sobre RLHF, DPO ni tecnicas equivalentes, que no aplican a un modelo de vision de este tipo.

## Capacidades

- Deteccion de pose de cuerpo completo con 133 keypoints por persona: 17 del cuerpo, 6 de cada pie, 21 de cada mano y 68 faciales (estandar COCO-WholeBody).
- Localizacion de manos y rostro en detalle, lo que habilita analisis de gestos y de expresion facial, no solo pose corporal.
- Funcionamiento sobre imagen estatica; el pipeline original de DWPose admite tambien video fotograma a fotograma, aunque este repositorio solo publica pesos y no incluye codigo de inferencia.
- Integrable como modulo de vision en pipelines de otras herramientas: MMPose, y en el ecosistema de ControlNet/OpenPose para condicionar modelos generativos de imagen.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente perceptivo.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No dispone de modo *thinking*, vision-language, audio ni ninguna capacidad generativa.

## Casos de uso

- Captura de movimiento para animacion 3D: extraer los 133 keypoints por fotograma y mapearlos a un rig de esqueleto para animar personajes sin trajes de captura dedicados; la inclusion de manos y rostro reduce el trabajo manual de *cleanup* posterior.
- Condicionamiento de modelos generativos de imagen: usar el mapa de pose como entrada de ControlNet (tipo OpenPose) para generar imagenes con una postura y composicion corporal controladas, un flujo habitual en ilustracion y diseno.
- Analisis biomecanico y de forma fisica: estimar angulos articulares en sentadillas, dominadas o levantamiento para dar retroalimentacion automatica sobre la tecnica, usando los keypoints de pies y cuerpo como referencia de apoyo.
- Anotacion automatica de datasets: preetiquetar imagenes de pose para que un equipo humano solo revise y corrija, reduciendo el coste de construccion de corpora propios.
- Interfaces gestuales y lenguaje de signos: al detectar 21 keypoints por mano y 68 faciales, permite construir clasificadores de gestos o de signos a partir de secuencias de keypoints en lugar de pixeles.
- Analisis de interaccion persona-objeto en retail o industria: detectar si un operario adopta posturas de riesgo o como manipula un objeto, con un coste computacional bajo al ser un modelo convolucional pequeno (repo de 0,1 GB).
- *Virtual try-on* y simulacion de tejido: obtener la pose del usuario para deformar prendas virtuales sobre la silueta, incluyendo la posicion de manos y pies.
- Monitorizacion de presencia y comportamiento en video: seguimiento de posturas en espacios controlados, con la advertencia de que la estimacion de pose puede constituir dato biometrico segun el contexto normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye tablas de AP (Average Precision) sobre COCO-WholeBody ni comparaciones numericas con otros estimadores; para cifras oficiales debe consultarse el repositorio de IDEA-Research/DWPose y el articulo asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio completo ocupa 0,1 GB, por lo que los pesos en precision completa caben holgadamente en cualquier GPU con 2 GB o mas, y con margen amplio en 4 GB.
- GPU recomendadas: al ser un modelo convolucional de baja resolucion de entrada (384), es viable en GTX 1650, RTX 3060, RTX 4090, A100 y H100; las GPU de datacenter solo tienen sentido para procesar muchos flujos simultaneos en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos anos; tambien es ejecutable en CPU para inferencia por lotes no interactiva.
- Opciones de despliegue: MMPose / MMDeploy (ruta oficial del modelo original), ONNX Runtime y TensorRT tras conversion, y frameworks de inferencia de imagen en Python. El repositorio solo contiene pesos safetensors, por lo que no hay scripts de carga incluidos y es necesario adaptar el codigo de MMPose para leerlos.
- Latencia y throughput: no disponibles. No se han publicado mediciones para esta redistribucion; cualquier cifra depende del hardware y del backend de ejecucion.

## Comparativa con modelos similares

| Modelo | Tipo | Keypoints | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DWPose (`dw-ll_ucoco_384`) | CNN (RTMPose) | 133 (cuerpo, manos, pies, rostro) | Pose whole-body de alta precision en dos fases | Apache 2.0 | Pesos safetensors en este repo; original en GitHub de IDEA-Research |
| RTMPose | CNN (MMPose) | Configurable por variante (cuerpo, mano, rostro, animal) | Estimacion de pose en tiempo real por subconjuntos | Apache 2.0 | MMPose / OpenMMLab |
| OpenPose | CNN (part affinity fields) | 135 en la variante whole-body | Referencia historica; ecosistema maduro pero mas pesado | Codigo abierto con restricciones para uso comercial en algunas partes del proyecto | Repositorio CMU-Perceptual-Computing-Lab |
| MediaPipe Pose (BlazePose) | CNN ligera | 33 (solo cuerpo) | Movil y navegador, muy baja latencia | Apache 2.0 (componentes) | Distribucion via MediaPipe |

Los datos de rendimiento numerico de esta comparativa no estan disponibles en la informacion proporcionada; las diferencias de keypoints y licencia son las que pueden afirmarse con certeza. La ventaja principal de DWPose frente a MediaPipe Pose es la cobertura de manos y rostro; su desventaja potencial es mayor complejidad de despliegue.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite instrucciones en lenguaje natural. Cualquier uso como "modelo conversacional" es un error de categoria.
- Ausencia de codigo de inferencia en el repositorio: solo se publican pesos. Es necesario replicar el pipeline de carga y preprocesado de DWPose/MMPose, lo que anade riesgo de configuracion incorrecta (normalizacion, media y desviacion de imagen, resolucion de entrada).
- Sensibilidad a oclusiones y recortes: el pipeline en dos fases depende de la deteccion previa del cuerpo; si el detector de persona falla o la persona esta parcialmente fuera del encuadre, las manos y el rostro pueden no detectarse.
- Escenas multitudinarias: el rendimiento por persona puede degradarse con muchas personas solapadas y resoluciones bajas; no se han publicado cifras al respecto para esta variante.
- Sesgos: no se documenta la composicion demografica del dataset de entrenamiento (UCOCO y corpora asociados), por lo que no puede descartarse un rendimiento desigual segun tono de piel, genero, edad o vestimenta.
- Riesgo de alucinacion en sentido estricto: no aplica (no genera contenido), pero si existe riesgo de keypoints espurios con alta confianza en imagenes ambiguas; conviene aplicar umbrales de confianza y validacion geometrica.
- Limitaciones de contexto e idioma: no aplica por tratarse de vision; no hay soporte de texto ni de etiquetas semanticas.
- Licencia: Apache 2.0 permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. No obstante, el modelo se entrena sobre datasets de terceros (COCO-WholeBody y otros) cuyas condiciones deben verificarse por separado si el uso es comercial a gran escala.
- Consideraciones legales: la estimacion de pose y, en particular, de keypoints faciales puede considerarse tratamiento de datos biometricos bajo el RGPD en la UE; requiere base juridica e informacion al interesado.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria de que la conversion a safetensors sea correcta. Conviene verificar que las salidas coinciden con el checkpoint original `yzd-v/DWPose` antes de usarlo en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OzzyGT/DWPose
- Modelo base en HuggingFace: https://huggingface.co/yzd-v/DWPose
- Repositorio original DWPose (IDEA-Research): https://github.com/IDEA-Research/DWPose
- MMPose / RTMPose (OpenMMLab): https://github.com/open-mmlab/mmpose
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos no guardan relacion con DWPose ni con estimacion de pose y se han descartado.
