# AutowareFoundation/oneplanner

## Resumen

OnePlanner es un modelo de planificacion de conduccion autonoma end-to-end desarrollado por la Autoware Foundation, la organizacion detras de la pila de software open source Autoware para vehiculos autonomos. El modelo resuelve el problema clasico de la planificacion de trayectorias del ego: en lugar de encadenar modulos independientes de percepcion, prediccion y planificacion, OnePlanner consume directamente la nube de puntos LiDAR, el mapa vectorial Lanelet2, la ruta mision, los estados de los semaforos y el estado del vehiculo, y genera una trayectoria propia de 6 segundos a pasos de 0,1 s, a la frecuencia del LiDAR.

La arquitectura combina un backbone congelado de deteccion 3D BEVFusion-L (8,3M de parametros) que convierte cada nube de puntos en un mapa de caracteristicas bird's-eye-view (BEV), y un planificador de 27,3M de parametros que lee un historial temporal de tres mapas BEV junto con el contexto del mapa vectorial, la ruta y el ego. El conjunto, unos 35,6M de parametros, es un modelo ligero disenado para inferencia en tiempo real con TensorRT.

Es relevante porque representa el primer planificador end-to-end integrado de forma nativa en Autoware mediante un nodo ROS 2 (`autoware_oneplanner`), con latencias de unos 13 ms por pasada de planificacion, lo que lo hace viable para despliegue en vehiculos reales y no solo en investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEVFusion-L LiDAR (encoder voxel con convolucion dispersa y cabeza de deteccion, congelado) + planificador sobre historial de mapas BEV y contexto de mapa vectorial |
| Parametros totales | 35,6M aproximadamente (8,3M del backbone + 27,3M del planificador) |
| Parametros activos | No aplica (no es MoE); todos los parametros estan activos en cada pasada |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje); historial temporal de 3 mapas BEV separados 0,5 s y 3 s de historial del ego |
| Tipos de cuantizacion | fp32 (planificador) y fp16 (backbone) en TensorRT; no se distribuyen engines cuantizados |
| Idiomas soportados | No disponible (modelo de vision/robotica, sin componente linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18); los engines de TensorRT se construyen localmente y no se distribuyen |

## Arquitectura y entrenamiento

El sistema se divide en dos grafos ONNX independientes. El primero, `bevfusion_lidar_feature.onnx`, implementa el backbone LiDAR de BEVFusion-L: un encoder de voxels basado en convolucion dispersa (sparse convolution) con una cabeza de deteccion 3D, que produce un mapa de caracteristicas BEV de 512 canales a 180 x 180 celdas, cubriendo un area de +/-122,4 m alrededor del vehiculo. Este backbone esta congelado y se ejecuta una vez por cada frame de LiDAR, fuera del ciclo de planificacion. Ademas de las caracteristicas BEV, emite propuestas de deteccion sin decodificar que alimentan la salida de objetos detectados.

El segundo grafo, `oneplanner_planner.onnx`, es el planificador propiamente dicho. Recibe un historial de 3 mapas BEV (el actual y los dos anteriores, separados 0,5 s, cada uno warpado al frame de la pose de planificacion), el estado actual del ego (pose, velocidad, aceleracion, angulo de direccion y yaw rate), 3 s de historial del ego, y el contexto del mapa vectorial: los carriles mas cercanos y los de la ruta dentro de +/-100 m, con sus estados de semaforo, limites de velocidad, poligonos y line strings, asi como el goal de la ruta. Sus salidas son la trayectoria del ego de 6 s a 0,1 s por punto, una trayectoria previa (prior) y logits para el indicador de giro.

No se ha publicado informacion sobre los datos de entrenamiento (numero de escenas, composicion del dataset) ni sobre el procedimiento de entrenamiento del planificador en la model card disponible. El backbone BEVFusion-L se usa congelado, por lo que el entrenamiento se centra en el modulo de planificacion.

## Capacidades

- Generacion de trayectorias ego end-to-end de 6 segundos a 0,1 s por punto, directamente a partir de sensores y mapa, sin modulos intermedios de prediccion explicita.
- Deteccion de objetos 3D como salida secundaria del backbone BEVFusion-L (propuestas decodificadas por el nodo ROS 2).
- Comprension del contexto de conduccion estructurado: carriles de Lanelet2, estados de semaforo, limites de velocidad y goal de ruta.
- Razonamiento temporal mediante historial de 3 mapas BEV y 3 s de historial del ego (velocidad, aceleracion, direccion, yaw rate).
- Prediccion del comando de indicadores de giro a partir de logits, filtrada por el nodo.
- Salida de trayectorias candidatas (la principal y la prior) para su uso en sistemas de seleccion o verificacion aguas abajo.
- Integracion nativa con ROS 2 y Autoware mediante topics tipicos (`sensor_msgs`, `autoware_planning_msgs`, `autoware_perception_msgs`).

## Casos de uso

- Planificacion de trayectoria en vehiculos de investigacion: como modulo de planificacion end-to-end dentro de la pila Autoware, sustituyendo o complementando los planificadores clasicos basados en reglas, ideal para grupos academicos que experimentan con enfoques learned.
- Cruce de intersecciones semaforizadas: el modelo consume los estados de los semaforos del mapa vectorial y la ruta, lo que le permite detenerse en rojo y cruzar en verde, como muestran las escenas de la model card.
- Navegacion en curvas a velocidad sostenida: la salida de trayectoria suave a 0,1 s de resolucion permite seguir curvas amplias a velocidades del orden de 40 km/h.
- Seguimiento y frenado detras de trafico en cola: la deteccion 3D del backbone y las caracteristicas BEV temporales permiten ralentizar detras de vehiculos detenidos en un semaforo.
- Plataforma de validacion open-loop: el video de replay incluido en el repositorio permite evaluar el comportamiento del planificador sobre grabaciones sin riesgo, util para regresion y comparacion de versiones.
- Desarrollo de sistemas de seguridad y monitoreo: las trayectorias candidatas y los diagnostics del nodo (`inference_status`) pueden integrarse en supervisores que verifiquen la salud de la inferencia en produccion.
- Benchmarking de hardware para conduccion autonoma: con formatos ONNX y TensorRT, sirve como carga de trabajo realista para medir latencia de inferencia en GPUs automotrices o de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (nuScenes, Waymo, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son de latencia de inferencia:

| Metrica | Valor |
|---|---|
| Latencia por pasada de planificacion (mediana) | ~13 ms |
| Latencia de inferencia del planificador | ~9 ms |
| Hardware de referencia | NVIDIA RTX PRO 6000 Blackwell Max-Q |
| Extraccion de caracteristicas BEV | Por frame de LiDAR, fuera del ciclo de planificacion |

## Requisitos de hardware

- La latencia de referencia (~13 ms por pasada, ~9 ms del planificador) se ha medido en una NVIDIA RTX PRO 6000 Blackwell Max-Q; no hay cifras para otras GPUs.
- El backbone se ejecuta en fp16 y el planificador en fp32; dado el tamano reducido (~35,6M de parametros y un repo de 0,2 GB), el requisito de VRAM es bajo en terminos de pesos, aunque la convolucion dispersa y el mapa BEV de 512 x 180 x 180 dominan el consumo real, que no esta cuantificado.
- No se indica si funciona en GPUs de consumo; al requerir los plugins de convolucion dispersa de `autoware_tensorrt_plugins` y engines de TensorRT compilados localmente, es mas probable que funcione en GPUs NVIDIA modernas con soporte TensorRT completo (RTX 4090, A100, H100 o similares), aunque esto no esta confirmado.
- Despliegue mediante el nodo ROS 2 `autoware_oneplanner` con TensorRT; no aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- El directorio del modelo debe ser escribible: el nodo construye los engines de TensorRT en el primer arranque y los cachea junto a los ONNX (`<stem>.engine` con un fichero `<stem>.engine.identity` para detectar cambios). Existe el modo `build_only:=true` para precompilar los engines y salir.

## Comparativa con modelos similares

No hay una comparativa directa publicada en la model card. Alternativas de la misma categoria (planificacion end-to-end para conduccion autonoma):

| Modelo | Enfoque | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| OnePlanner (Autoware) | LiDAR + Lanelet2 + semaforos → trayectoria ego 6 s, integrado en Autoware/ROS 2 | ~35,6M | Apache-2.0 | ONNX en Hugging Face, nodo ROS 2 publico |
| UniAD | End-to-end multi-tarea (Track-to-Plan) sobre camaras, investigacion | No disponible | No disponible | Codigo de investigacion, sin integracion de produccion |
| VAD | End-to-end basado en vectores sobre camaras | No disponible | No disponible | Codigo de investigacion, sin integracion de produccion |

La diferencia distintiva de OnePlanner es su integracion de produccion en Autoware con interfaz ROS 2 completa, formatos ONNX/TensorRT y datos de latencia publicados, frente a la mayoria de planificadores end-to-end publicados como codigo de investigacion.

## Limitaciones y advertencias

- El backbone BEVFusion-L esta congelado; cualquier limitacion de percepcion del backbone (alcance de +/-122,4 m, dependencia exclusiva de LiDAR sin camaras ni radar) se hereda directamente en la planificacion.
- No utiliza camaras: no percibe senales visuales, peatones lejanos o contextos que requieran informacion visual mas alla del LiDAR y el mapa.
- Los engines de TensorRT no se distribuyen y son especificos de la arquitectura de GPU y version de TensorRT; hay que compilarlos localmente, lo que anade friccion de despliegue.
- El directorio del modelo debe ser escribible para cachear engines, lo que puede ser un problema en sistemas de ficheros de solo lectura (se necesita una estrategia de volumenes montados).
- No se ha publicado informacion sobre datos de entrenamiento, metricas de seguridad, tasas de alucinacion o fallos, ni validacion en escenarios adversarios; su uso en vehiculo real requiere validacion propia rigurosa.
- Al tratarse de un modelo end-to-end, el comportamiento ante casos extremos (out-of-distribution) es dificil de auditar frente a planificadores basados en reglas.
- La licencia Apache-2.0 permite uso comercial sin restricciones significativas, pero la responsabilidad de seguridad en un contexto de conduccion autonoma recae integramente en el integrador.
- Las descargas registradas son muy bajas (38), por lo que la comunidad de usuarios y el historial de errores reportados son todavia limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutowareFoundation/oneplanner
- Autoware (pila de software): https://github.com/autowarefoundation/autoware
- Nodo ROS 2 `autoware_oneplanner`: https://github.com/autowarefoundation/autoware_oneplanner
- Contrato del modelo (tensores de entrada): https://github.com/autowarefoundation/autoware_oneplanner/blob/main/autoware_oneplanner/docs/model_contract.md
- Plugins de TensorRT para convolucion dispersa: `autoware_tensorrt_plugins` (repositorio de Autoware Foundation en GitHub)
