# changh95/transfusion-p150

## Resumen

`changh95/transfusion-p150` es un port del modelo de deteccion de objetos 3D sobre nube de puntos LiDAR TransFusion-L, concretamente la implementacion que ejecuta el nodo `autoware_lidar_transfusion` de Autoware (release `t4xx1_90m` v2.1). El autor del port es `changh95`, mientras que los pesos originales y el entrenamiento corresponden a `AutowareFoundation/lidar_transfusion`, derivado del trabajo publicado en arXiv:2203.11496. El modelo toma una nube de puntos LiDAR en el frame `base_link` con campos (x, y, z, intensidad 0-255) y devuelve cajas 3D equivalentes a `DetectedObjects` de Autoware para las clases CAR, TRUCK, BUS, TRAILER, BICYCLE y PEDESTRIAN, incluyendo el preprocesado y postprocesado del nodo.

La relevancia de esta ficha no esta en el modelo en si, sino en el destino: es un port completo a un unico acelerador Tenstorrent Blackhole p150 usando `tt-nn` (ttnn), con lo que se demuestra que un detector LiDAR 3D de un stack autonomo real puede ejecutarse fuera del ecosistema CUDA. El port esta empaquetado con `tt-model-manager` 0.1.0 (manifest schema 5.1) e incluye codigo de inferencia, un servidor HTTP y utilidades de visualizacion BEV.

En Autoware este detector es una alternativa opcional: CenterPoint sigue siendo el detector LiDAR por defecto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card esta truncada, por lo que la validacion por parte de la comunidad es practicamente nula. No se publican recuentos de parametros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red TransFusion-L LiDAR-only: pillar feature net, backbone SECOND, neck, head y decoder transformer con queries |
| Parametros totales | no disponible (la model card no publica recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos 3D sobre nube de puntos; no procesa secuencias de texto) |
| Tipos de cuantizacion | no se documentan formatos tipo GGUF/AWQ/GPTQ. Precision declarada: bf16 de dos terminos (hi + lo) en pesos y activaciones del pillar feature net y del backbone SECOND con sumas fp32; pesos fp32 y activaciones bf16 en neck, head y decoder; matematicas HiFi4 con acumulacion fp32; sin bfp8 |
| Idiomas soportados | no disponible / no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (`license_link` apunta a AutowareFoundation/lidar_transfusion) |
| Formato de pesos | no disponible. Los pesos base (172 MB) se descargan desde `AutowareFoundation/lidar_transfusion`, commit fijado `8f07eb93038`, tag `v2.1`. Tamano total del repo del port: 0.9 GB |

## Arquitectura y entrenamiento

El modelo es TransFusion-L en su variante LiDAR-only, la que ejecuta el nodo `autoware_lidar_transfusion`. La arquitectura combina un codificador de pilares (pillar feature net) con un backbone SECOND, un neck y un decoder basado en transformer con queries, que produce las cajas 3D finales. Es, por tanto, un transformer hibrido con componentes convolucionales, no un modelo de lenguaje ni un SSM. En el port, la configuracion de ejecucion es: dispatch sobre los cores ETH, 1 command queue y una compute grid de 12x10.

Sobre el entrenamiento, la model card del port no aporta informacion: no se indican tokens, composicion del dataset, ni si hubo RLHF/DPO (fases que, por otra parte, no aplican a un detector). Los detalles de entrenamiento remiten al codigo de `tier4/AWML` (`projects/TransFusion`, base TransFusion-L 0.3) y al paper arXiv:2203.11496. La innovacion tecnica destacable de este repositorio es el propio port a `tt-nn`: captura de la traza metal durante la carga, precision mixta de dos terminos bf16 con acumulacion fp32, y una ruta de postprocesado en host (decoders y NMS) compartida entre la API de Python y el servidor HTTP.

## Capacidades

- Deteccion de objetos 3D sobre nube de puntos LiDAR en el frame `base_link`, con entrada en (x, y, z, intensidad 0-255).
- Clases soportadas: CAR, TRUCK, BUS, TRAILER, BICYCLE y PEDESTRIAN, con remapeo de clases opcional (`remap_classes=True`).
- Salida equivalente a `DetectedObjects` de Autoware: `boxes` float32 [N, 7] (x, y, z, length, width, height, yaw), `scores` (la `existence_probability` de Autoware) y `label_ids` (`ObjectClassification`), ordenados por score.
- Acepta una unica barrida o la nube densificada de 2 barridos de Autoware, marcada con una columna `time_lag` en segundos.
- Densificacion opcional en lado cliente (`sweeps=`) o en lado servidor (`stream=`, con la densificacion propia de Autoware a partir de poses).
- Formatos de entrada multiples: ruta a `.npy`, `.npz`, `.pcd`, `.bin`, bytes en crudo con `fmt=`, array/tensor (N, C) o un objeto `PointCloud`.
- Modos de muestreo de puntos por pilar: `clean` (determinista, primeros 20 puntos de cada pilar en orden de entrada) y `autoware_compat` (emulacion del shuffle del nodo desplegado, incluido su descarte de frames con menos de 5.000 o mas de 60.000 pilares).
- Postprocesado configurable en host: `score_threshold` (0,1 por defecto), `circle_nms_dist_threshold` (0,5), `iou_nms_threshold` (0,1), `iou_nms_search_distance_2d` (10,0) y `max_detections`.
- Metadatos de diagnostico: recuentos de pilares, flags de overflow/skip, modo de muestreo, recuentos por etapa, etiquetas previas al remapeador y `timing_ms`.
- Visualizacion bird's-eye view mediante `tt_transfusion.viz.render_bev(points, detecciones)`.
- Servidor HTTP con endpoint `/predict` cuyo resultado es identico al de la API de Python (verificado por el test `test_api_equals_server`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo de texto.

## Casos de uso

- Percepcion LiDAR a bordo en vehiculos autonomos con Autoware: el modelo se integra como nodo de deteccion sustituyendo o complementando a CenterPoint, entregando `DetectedObjects` listos para el resto del stack de planificacion y control.
- Despliegue en hardware no CUDA: es la opcion practica para equipos que quieren evaluar un detector LiDAR 3D de produccion sobre un unico acelerador Tenstorrent Blackhole p150, con consumo y formato distintos a los de una GPU.
- Validacion y regresion de percepcion: con `sampling="autoware_compat"` se puede reproducir el comportamiento del nodo desplegado (incluido su descarte de frames fuera del rango 5.000-60.000 pilares) y comparar resultados entre versiones del modelo o del firmware.
- Procesado por lotes de nubes densificadas de 2 barridos: para pipelines de datos que necesitan detecciones sobre nubes ya densificadas con `time_lag`, sin reimplementar la densificacion de Autoware.
- Preetiquetado de datasets LiDAR: generar cajas 3D automaticas sobre grandes volumenes de nubes para revision humana posterior, usando el umbral de score y el NMS circular para controlar el ratio de falsos positivos.
- Inspeccion visual y depuracion de detecciones: con `render_bev` se pueden generar vistas cenitales de las cajas detectadas para auditar casos problematicos (objetos lejanos, oclusiones, aglomeraciones).
- Robotica movil y AGVs en entornos industriales o urbanos: deteccion de peatones y ciclistas para navegacion segura con LiDAR, siempre sobre hardware Tenstorrent.
- Investigacion en deteccion 3D con transformer: punto de partida reproducible para comparar un decoder transformer (TransFusion-L) frente a detectores basados en anclas o centricos en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que todas las cifras de la tarjeta se midieron en la configuracion de p150 descrita (dispatch ETH, 1 command queue, grid 12x10), pero no incluye metricas de precision como mAP, nuScenes NDS ni comparaciones con otros detectores.

## Requisitos de hardware

- Acelerador: un unico Tenstorrent Blackhole p150 (mesh `P150`). No hay ruta de ejecucion en GPU NVIDIA, AMD ni CPU.
- VRAM: no aplica en el sentido habitual; el modelo se ejecuta sobre la memoria del p150. Los pesos base ocupan 172 MB y el repositorio completo del port 0.9 GB.
- GPU recomendadas: no aplica. No se documenta soporte CUDA.
- Encaje en GPU de consumo: no aplica; el modelo no se ejecuta en GPUs de consumo.
- Entorno software: tt-metal / ttnn en el commit `44d66500520`, con el parche `patches/tt-metal-eth-dispatch.patch` aplicado. `ttnn` no esta en PyPI, por lo que hay que instalarlo desde tt-metal.
- Dependencias del paquete: `numpy<2`, `pillow`, `pyyaml`, `onnx` y `huggingface_hub`; extra `[server,test]` para el servidor HTTP y los tests.
- Carga inicial: 141 s con la cache JIT vacia (compilacion de kernels); cargas posteriores en torno a 8 s. La traza metal se captura durante la carga, de modo que la primera inferencia es tan rapida como las siguientes.
- Latencia medida: 217,2 ms en la primera llamada y 217,3 ms en la segunda, sobre la muestra `code/tt_transfusion/samples/test_pcd.npz` (el `test.pcd` de Autoware).
- Concurrencia: un modelo ocupa un chip; las llamadas desde varios hilos se serializan.
- Opciones de despliegue: API de Python (`TransFusion.from_pretrained`) o servidor HTTP incluido en el paquete (tags `tt-dit-server`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| changh95/transfusion-p150 | no disponible | LiDAR 3D (deteccion) | no aplica | 217 ms por inferencia en p150; sin benchmarks publicados | Apache-2.0 | HuggingFace, 0 descargas |
| AutowareFoundation/lidar_transfusion (v2.1, modelo base) | no disponible | LiDAR 3D (deteccion) | no aplica | no disponible | Apache-2.0 | HuggingFace |
| CenterPoint (detector LiDAR por defecto en Autoware) | no disponible | LiDAR 3D (deteccion) | no aplica | no disponible | no disponible en la informacion proporcionada | incluido en Autoware Universe |

No se dispone de datos de parametros, contexto ni metricas de precision para ninguno de los tres, por lo que la comparacion cuantitativa no es posible con la informacion disponible. La diferencia funcional documentada es que CenterPoint es el detector LiDAR por defecto en Autoware y TransFusion-L es una alternativa opt-in, y que solo `transfusion-p150` esta portado a Tenstorrent Blackhole p150 con `tt-nn`.

## Limitaciones y advertencias

- Modelo unicamente LiDAR: no procesa imagenes ni fusiona camara; su alcance es la nube de puntos.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues. No aplica la fila de idiomas.
- Dependencia de hardware exotico: requiere un Tenstorrent Blackhole p150 y un entorno tt-metal con un parche especifico aplicado. `ttnn` no esta en PyPI, lo que complica la reproducibilidad y el despliegue en produccion.
- Reproducibilidad limitada: el repositorio tiene 0 descargas y 0 likes, y la model card esta truncada, de modo que parte de la documentacion (por ejemplo, el apartado de reentrenamiento) no esta disponible en el texto proporcionado.
- Sin benchmarks publicados: no hay mAP, NDS ni comparaciones con CenterPoint u otros detectores, por lo que no se puede evaluar la precision relativa antes de desplegar.
- Modo `autoware_compat`: emula el descarte de frames con menos de 5.000 o mas de 60.000 pilares. En escenarios con nubes muy dispersas o muy densas, esos frames se ignoran, lo que puede traducirse en ausencia total de detecciones.
- Concurrencia serializada: un modelo ocupa un chip y las llamadas multihilo se serializan, lo que limita el throughput en servicios con varias peticiones simultaneas.
- Riesgo de falsos positivos y falsos negativos propio de un detector 3D; el umbral de score (0,1 por defecto) y los parametros de NMS son los principales mecanismos de control y deben ajustarse por escenario. No aplica el concepto de alucinacion en el sentido de los modelos generativos.
- Licencia Apache-2.0, que en principio permite uso comercial, pero conviene verificar la licencia y las condiciones de los pesos y del codigo de entrenamiento originales (`AutowareFoundation/lidar_transfusion` y `tier4/AWML`), asi como de cualquier dependencia del stack Autoware.
- Sesgos: no se documenta ningun analisis de sesgo por clase, distancia, densidad de puntos o condiciones meteorologicas. La deteccion de clases minoritarias (TRAILER, BICYCLE) no esta validada con metricas publicadas.
- Fecha de creacion del repositorio: 2026-10-09 (ultima actualizacion 2026-10-09), con mantenimiento y soporte desconocidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/changh95/transfusion-p150
- Codigo del port: https://huggingface.co/changh95/transfusion-p150/tree/main/code
- Modelo base (pesos v2.1): https://huggingface.co/AutowareFoundation/lidar_transfusion/tree/8f07eb93038bfd62e35d1f78e56a6b3fb76b12aa
- Paper: https://arxiv.org/abs/2203.11496
- Paquete de Autoware: https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/perception/autoware_lidar_transfusion
- Codigo de entrenamiento (tier4/AWML, projects/TransFusion): https://github.com/tier4/AWML
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal requerido: https://github.com/tenstorrent/tt-metal/commit/44d66500520fda9f2c7060c0f6b41ec48f7ab37e
- Parche de dispatch ETH: `patches/tt-metal-eth-dispatch.patch` (dentro del repositorio del modelo)
