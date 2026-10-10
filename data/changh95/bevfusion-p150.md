# changh95/bevfusion-p150

## Resumen

bevfusion-p150 es un port del detector 3D BEVFusion-L (variante solo LiDAR) al acelerador Tenstorrent Blackhole p150 usando la pila tt-nn/tt-metal. El modelo original lo desarrolla AutowareFoundation y es la red que ejecuta por defecto el nodo `autoware_bevfusion` de Autoware (archivo `bevfusion_lidar.onnx` de la release v2.0); en Autoware es una alternativa opcional, ya que CenterPoint es el detector LiDAR por defecto. Este repositorio, publicado por changh95, empaqueta esos pesos para que se ejecuten sobre silicio de Tenstorrent en lugar de GPU.

El modelo recibe una nube de puntos LiDAR en el marco `base_link` (x, y, z; una sola pasada o la nube densificada de 2 pasadas de Autoware con columna `time_lag`; la intensidad se ignora) y devuelve cajas 3D equivalentes a los `DetectedObjects` de Autoware para las clases CAR, TRUCK, BUS, TRAILER, BICYCLE y PEDESTRIAN, aplicando el preprocesado y postprocesado del nodo. La arquitectura combina un codificador 3D disperso (convolucion dispersa tipo VFE), una columna vertebral SECOND y un cabezal/decoder transformer, todo ello portado a tt-nn.

Su relevancia actual es que demuestra la ejecucion de una red de percepcion para conduccion autonoma completa sobre hardware no-CUDA (Blackhole p150) mediante tt-metal, con trazas de metal capturadas en tiempo de carga. No se dispone de datos publicados de parametros totales, contexto de lenguaje ni benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEVFusion-L solo LiDAR: codificador 3D disperso + columna vertebral SECOND + cabezal/decoder transformer (TransFusion), portado a tt-nn |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion 3D, no generativo) |
| Tipos de cuantizacion | No usa bfp8; precision mixta: pesos fp32 con tablas bf16 en el codificador 3D disperso; pesos y activaciones bf16 de dos terminos (hi + lo) con sumas fp32 en la columna SECOND; pesos fp32 y activaciones bf16 en neck, head y decoder; HiFi4 con acumulacion fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos base en `AutowareFoundation/bevfusion`); se menciona tambien ONNX como origen del modelo (`bevfusion_lidar.onnx`) |

## Arquitectura y entrenamiento

La red es un BEVFusion-L en su configuracion solo LiDAR, es decir, sin la rama de camara. El flujo parte de la nube de puntos: un codificador 3D disperso (convolucion dispersa con tablas de recoleccion/VFE) extrae caracteristicas de los vóxeles, una columna vertebral de tipo SECOND las procesa y un neck alimenta un cabezal de deteccion de tipo transformer (TransFusion) que produce las cajas 3D. En este port, el preprocesado y postprocesado se ejecutan en el host y comparten logica con el servidor HTTP `/predict`; las trazas de metal (el codificador disperso para cada uno de tres buckets de capacidad y la red densa) se capturan durante la carga, de modo que ninguna llamada compila kernels.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni el uso de RLHF/DPO en el material proporcionado; corresponde al entrenamiento de la red original (paper arXiv:2205.13542) y al pipeline `tier4/AWML` (proyecto BEVFusion), cuya release solo-LiDAR detras de v2.0 no esta publicada segun la model card. La innovacion tecnica destacable de este repositorio es la precision mixta empleada para sostener la red en tt-nn sin bfp8 (bf16 de dos terminos con sumas fp32 en la columna SECOND, fp32 con HiFi4 en el resto).

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR en el marco `base_link`, con salida de cajas [N, 7] en formato (x, y, z, longitud, anchura, altura, yaw).
- Clasificacion en las categorias CAR, TRUCK, BUS, TRAILER, BICYCLE y PEDESTRIAN.
- Acepta multiples formatos de entrada: ruta a `.npy` / `.npz` / `.pcd` / `.bin`, bytes crudos con `fmt=`, array/tensor (N, C) o un objeto `PointCloud`.
- Acepta una columna `intensity` que se ignora (`use_intensity: false`) y una columna `time_lag` (s) que marca una nube ya densificada.
- Soporta densificacion del lado del cliente (`sweeps=`) o del lado del servidor (Autoware, con poses) mediante `stream=`.
- Postprocesado configurable: `score_threshold=0.1`, `circle_nms_dist_threshold=0.5`, `iou_nms_threshold=0.1`, `iou_nms_search_distance_2d=10.0`, `remap_classes=True`, `max_detections=None`.
- Salida `Detections3D` con cajas, puntuaciones (equivalente a `existence_probability` de Autoware), `label_ids` (`ObjectClassification`), etiquetas, metadatos (recuentos de vóxeles y de dispersos por nivel, bucket de capacidad, flags de desbordamiento, recuentos por etapa) y `timing_ms`.
- Utilidades auxiliares: `out.to_dict()` (JSON de `/predict`), `out.to_dicts()` (lista de detecciones) y `tt_bevfusion.viz.render_bev()` para dibujar vista de pajaro.
- Servidor HTTP opcional (`pip install -e ".[server,test]"`) que comparte decoders, trazas y postprocesado con la API Python.
- No incluye, en esta release, el perfil camera-lidar (solo LiDAR).

## Casos de uso

- Percepcion LiDAR en vehiculos autonomos sobre hardware Tenstorrent: el modelo reemplaza al detector LiDAR dentro del nodo `autoware_bevfusion`, entregando `DetectedObjects` equivalentes para el stack de planificacion de Autoware. Es adecuado porque reproduce el pre/postprocesado de Autoware y las mismas clases de salida.
- Validacion de la viabilidad de percepcion 3D en silicio no-CUDA: permite medir latencias reales de una red de deteccion 3D en una tarjeta Blackhole p150, util para evaluar migraciones desde GPU a aceleradores Tenstorrent.
- Procesamiento por lotes de nubes de puntos grabadas (offline): cargando archivos `.pcd` / `.npz` de un dataset de ROS bag y generando detecciones para reetiquetado, control de calidad o analisis post-mortem de incidentes.
- Integracion en pipelines de datos de robotica y conduccion: al aceptar rutas de archivos y matrices (N, C), encaja en scripts Python que alimentan nubes segmentadas por sweep y recogen las detecciones en formato JSON para su almacenamiento.
- Prototipado de modulos de fusion o seguimiento: las cajas 3D con puntuacion y `yaw` sirven como entrada a seguidores multiobjeto o a modulos de prediccion de trayectorias, gracias a la salida estructurada `Detections3D`.
- Despliegue como microservicio de inferencia: el servidor HTTP `/predict` permite exponer la deteccion 3D a otros componentes del vehiculo o a un banco de pruebas, con serializacion de llamadas por chip.
- Pruebas de regresion y benchmarking de infraestructura: los tests incluidos (por ejemplo `test_api_equals_server`) y las metricas `timing_ms` y metadatos de etapa permiten comparar configuraciones de compilacion y cuellos de botella de host frente a dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (mAP de nuScenes u otros) en la informacion disponible para este port. La model card si aporta mediciones de ejecucion sobre p150 en la configuracion indicada:

| Metrica | Valor |
|---|---|
| Compilacion de kernels en primera carga (cache JIT vacia) | 195.7 s |
| Cargas posteriores | aprox. 9 s |
| Primera / segunda llamada sobre la muestra incluida (proceso 1) | 678.7 ms / 659.2 ms |
| Primera / segunda llamada sobre la muestra incluida (proceso 2, host compartido) | 792.2 ms / 674.9 ms |
| Observacion | La mayor parte de una llamada corresponde al preprocesado en host |

## Requisitos de hardware

- Acelerador requerido: una tarjeta Tenstorrent Blackhole p150 (mesh `P150`), con rejilla de computo 12x10 y dispatch sobre los cores ETH, 1 cola de comandos.
- Un modelo consume un chip; las llamadas desde varios hilos se serializan.
- No es un modelo ejecutable en GPU CUDA ni en CPU mediante llama.cpp/Ollama; no aplican vLLM ni TGI en el sentido habitual.
- Entorno necesario: tt-metal / ttnn en el commit `44d66500520fda9f2c7060c0f6b41ec48f7ab37e` con el parche `patches/tt-metal-eth-dispatch.patch` aplicado. ttnn no esta en PyPI.
- Dependencias de host instaladas via `pip install -e .`: numpy<2, pillow, pyyaml, onnx, huggingface_hub, safetensors; ttnn y torch provienen de tt-metal.
- Pesos base solo-LiDAR: 34 MB descargados desde `AutowareFoundation/bevfusion` (commit `e1bf164b909`, tag v2.0); tamano del repositorio de este port: 0.9 GB.
- Latencia y throughput: 678.7-792.2 ms por llamada en las mediciones publicadas sobre la muestra de prueba, en un host compartido con load average 8.5-9 y con la mayor parte del tiempo en preprocesado de host.
- No se proporcionan estimaciones de VRAM ni GPU recomendadas porque el modelo no se ejecuta en GPU en esta distribucion.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida / clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bevfusion-p150 (este) | BEVFusion-L solo LiDAR, port tt-nn | Nube LiDAR (`base_link`) | Cajas 3D; CAR, TRUCK, BUS, TRAILER, BICYCLE, PEDESTRIAN | Apache-2.0 | HuggingFace (port), pesos base en AutowareFoundation/bevfusion |
| BEVFusion original (AutowareFoundation/bevfusion) | BEVFusion camera-lidar / lidar | LiDAR y camara | Cajas 3D | Apache-2.0 | HuggingFace, release v2.0 |
| CenterPoint | Detector LiDAR (basado en voxeles/pilares) | Nube LiDAR | Cajas 3D | no disponible en esta informacion | Es el detector LiDAR por defecto en Autoware |

No se dispone de datos de parametros, contexto ni metricas de rendimiento comparadas para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un port especifico de hardware: solo funciona sobre Tenstorrent Blackhole p150 con tt-metal/ttnn en el commit indicado y el parche aplicado; no es portable a GPU o CPU tal cual.
- La primera carga compila kernels y tarda 195.7 s con cache JIT vacia; las cargas posteriores rondan los 9 s, lo que condiciona el arranque en produccion.
- La mayor parte de la latencia por llamada corresponde al preprocesado en host, no al dispositivo, lo que puede limitar la frecuencia de inferencia en entornos cargados.
- Un modelo ocupa un chip y las llamadas multi-hilo se serializan, restringiendo la concurrencia.
- Esta release no incluye el perfil camera-lidar, por lo que no ofrece fusion con camara.
- La intensidad de la nube se ignora (`use_intensity: false`); se espera x, y, z y opcionalmente una columna `time_lag`.
- La nube de entrada debe estar en el marco `base_link`; no se documenta gestion automatica de otras transformaciones.
- En Autoware este detector es opcional (CenterPoint es el predeterminado), por lo que su validacion en el ecosistema es menor.
- No se aportan datos de sesgo, robustez ante condiciones adversas ni tasas de alucinacion/falsos positivos; no hay benchmarks publicados en la informacion disponible.
- La licencia es Apache-2.0 (con enlace de licencia al repositorio base), lo que en principio permite uso comercial, pero conviene verificar la licencia y los terminos de los pesos base de AutowareFoundation y del codigo de entrenamiento `tier4/AWML` antes de un despliegue en produccion.
- La release solo-LiDAR detras de v2.0 no esta publicada segun la model card, lo que puede complicar la reproducibilidad del entrenamiento original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/changh95/bevfusion-p150
- Codigo del port: https://huggingface.co/changh95/bevfusion-p150/tree/main/code
- Pesos base (AutowareFoundation/bevfusion, tag v2.0): https://huggingface.co/AutowareFoundation/bevfusion/tree/e1bf164b909d3c6c2642012f9b5ee4d827753220
- Paper BEVFusion (arXiv:2205.13542): https://arxiv.org/abs/2205.13542
- Paquete Autoware `autoware_bevfusion`: https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/perception/autoware_bevfusion
- Codigo de entrenamiento `tier4/AWML` (proyecto BEVFusion): https://github.com/tier4/AWML
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- tt-metal (commit de referencia): https://github.com/tenstorrent/tt-metal/commit/44d66500520fda9f2c7060c0f6b41ec48f7ab37e
