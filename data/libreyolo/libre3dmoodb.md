# LibreYOLO/Libre3DMOODb

## Resumen

Libre3DMOODb es un checkpoint de detección de objetos 3D monocular de tipo open-vocabulary, desarrollado por el proyecto LibreYOLO como adaptación oficial del modelo 3D-MOOD del Computer Vision and Geometry Lab de ETH Zurich. El checkpoint se expone a través de la API `detect3d` de LibreYOLO, lo que permite detectar y localizar objetos en el espacio tridimensional a partir de una única imagen y de los parámetros intrínsecos de la cámara. El modelo acepta prompts de texto para definir las clases a detectar, por lo que no está limitado a un conjunto cerrado de categorías.

La arquitectura subyacente es un backbone Swin-B dentro del marco de 3D-MOOD, con un peso del checkpoint original del repositorio `cvg/3D-MOOD`. LibreYOLO no modifica los parámetros aprendidos; únicamente renombra el fichero, verifica la paridad de salida y sustituye la extensión CUDA de Vis4D por una ruta de atención portátil en PyTorch. El tamaño del repositorio en HuggingFace es de 1.0 GB, aunque no se dispone de la cifra exacta de parámetros ni de la longitud de contexto (al no ser un modelo de lenguaje, este parámetro no aplica).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-B como backbone dentro del marco 3D-MOOD; deteccion 3D monocular open-vocabulary |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (open-vocabulary basado en prompts de texto, sin idiomas declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (fichero renombrado como `Libre3DMOODb.pt`) |

## Arquitectura y entrenamiento

El modelo se deriva del checkpoint oficial `gdino3d_swin-b_120e_omni3d_834c97.pt` del proyecto 3D-MOOD, que a su vez se apoya en un backbone Swin-B y en un diseño de deteccion 3D monocular con capacidades open-vocabulary. El nombre del checkpoint indica un entrenamiento de 120 epocas sobre el conjunto de datos Omni3D, un benchmark comun para deteccion 3D de objetos en escenas interiores y exteriores. LibreYOLO no ha alterado los parametros aprendidos ni el proceso de entrenamiento; sus modificaciones se limitan al empaquetado, renombrado del fichero y a la adaptacion del runtime para evitar el uso de la extension `vis4d_cuda_ops`, cuya licencia no esta declarada. En su lugar, la integracion selecciona una ruta de atencion portable en PyTorch compatible con la licencia Apache-2.0.

## Capacidades

- Deteccion de objetos 3D monocular: a partir de una unica imagen y de la matriz de intrinsecos de la camara, devuelve cajas 3D (`boxes3d`) con coordenadas xyz y un mapa de profundidad.
- Open-vocabulary: acepta prompts de texto en el momento de la inferencia (por ejemplo, `["chair", "table"]`) para detectar categorias no predefinidas.
- Salida estructurada: ademas de las cajas 3D, expone un mapa de profundidad (`depth_map`) que puede usarse para tareas de estimacion de profundidad o planificacion espacial.
- Integracion con LibreYOLO: se invoca mediante la API `detect3d` y la clase `Libre3DMOOD`, lo que simplifica el despliegue dentro del ecosistema de la libreria.
- Inferencia pura: no incluye funciones de entrenamiento ni de exportacion de modelos.

## Casos de uso

- Robotica de manipulacion: el modelo puede detectar y localizar objetos no predefinidos en una escena para que un brazo robotico calcule posiciones de agarre en el espacio 3D. La naturaleza open-vocabulary permite cambiar de tarea sin reentrenar el detector.
- Conduccion autonoma: sirve como alternativa a los sistemas basados en lidar para estimar la posicion tridimensional de obstaculos y peatones a partir de una camara monocular, siempre que se disponga de la calibracion intrinseca del vehiculo.
- Realidad aumentada: la salida de cajas 3D y profundidad permite anclar objetos virtuales al mundo real mediante la localizacion de cubos de la escena, util en aplicaciones de AR para retail o arquitectura.
- Inventario y logistica en almacenes: un robot movil puede identificar y localizar distintas categorias de productos en un pasillo y generar coordenadas 3D para su recogida o conteo, adaptando las categorias al almacen con solo cambiar el prompt.
- Inspeccion industrial: el detector puede estimar la posicion y orientacion de piezas, herramientas o defectos en una linea de produccion a partir de imagenes de una unica camara, facilitando el control de calidad sin necesidad de multiples sensores.
- Reconstruccion de escenas: las cajas 3D generadas sirven como hipotesis de volumen de objetos para alimentar pipelines de reconstruccion tridimensional, por ejemplo en entornos interiores para planificacion de recorridos de robots de limpieza.
- Vision para asistentes de gestion de residuos: un sistema de recogida de residuos puede detectar contenedores y obstaculos en el espacio 3D a partir de una camara montada en el vehiculo, mejorando la navegacion autonoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware, VRAM estimada, latencia o throughput. El modelo se distribuye como un checkpoint de PyTorch en formato `.pt` y requiere un entorno Python separado con el runtime de 3D-MOOD instalado. Al estar basado en un backbone Swin-B, es probable que su inferencia sea viable en GPUs de consumo, pero no hay confirmacion en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. El checkpoint es identico en parametros y comportamiento al modelo 3D-MOOD original de ETH Zurich, pero la informacion disponible no incluye cifras comparativas de rendimiento frente a otras alternativas de deteccion 3D monocular open-vocabulary.

## Limitaciones y advertencias

- Requiere la matriz de intrinsecos de la camara para cualquier inferencia; sin este dato la prediccion no es posible.
- La integracion es solo de inferencia. No incluye capacidades de entrenamiento, ajuste fino ni exportacion a otros formatos.
- LibreYOLO ha verificado la paridad de salida y el mapeo de resultados, pero no ha realizado evaluaciones de exactitud propias; las afirmaciones de precision corresponden al proyecto upstream 3D-MOOD.
- Al sustituir la extension `vis4d_cuda_ops` por una atencion portable en PyTorch, el rendimiento puede variar en comparacion con el runtime original, aunque el resultado funcional se mantiene.
- El modelo no es un sistema de generacion de lenguaje; no admite tool calling, agentes ni razonamiento de texto. La etiqueta "image-to-3d" puede inducir a confusion, ya que su funcion es la deteccion 3D y no la sintesis de modelos 3D completos.
- No se han publicado benchmarks especificos para este checkpoint, por lo que la calidad de la deteccion en escenarios concretos debe validarse de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/Libre3DMOODb
- Repositorio upstream de 3D-MOOD: https://github.com/cvg/3D-MOOD
- Checkpoint fuente original (rev. 3d1fab5): https://huggingface.co/RoyYang0714/3D-MOOD
- GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Sitio web de LibreYOLO: https://www.libreyolo.com/
