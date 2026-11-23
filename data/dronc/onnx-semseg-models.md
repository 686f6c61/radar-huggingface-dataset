# dronc/onnx-semseg-models

## Resumen

`dronc/onnx-semseg-models` es una coleccion de tres modelos ONNX de segmentacion semantica de nubes de puntos LiDAR, exportados desde el pipeline de entrenamiento de Open3D-ML. No se trata de un modelo de lenguaje ni de un modelo generativo: es un repositorio de artefactos de inferencia para vision 3D, empaquetados con su manifiesto de preprocesado (`model.onnx.meta.json`) para poder ejecutarse con ONNX Runtime en CPU, CUDA o DirectML.

Los tres paquetes incluidos son dos variantes de FKAConv (entrenadas sobre Paris-Lille-3D y Semantic3D) y una variante de SphereFormer (entrenada sobre Paris-Lille-3D). Cada carpeta contiene el grafo ONNX, el manifiesto de tensores y preprocesado, la configuracion de entrenamiento y la licencia. El repositorio ocupa aproximadamente 0,1 GB.

El interes practico del repositorio es la interoperabilidad: los paquetes se pueden cargar directamente en el plugin qSemSeg de CloudCompare apuntando a `model.onnx`, y el manifiesto lateral se lee de forma automatica para obtener el tamano de parche, el tamano de voxel, el modo de caracteristicas, los ajustes del adaptador y las etiquetas. El autor los describe explicitamente como modelos de investigacion experimentales, sin ajuste exhaustivo de hiperparametros y con presupuesto de entrenamiento limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FKAConv (2 variantes) y SphereFormer (1 variante) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de parche de 25.536 puntos (FKAConv) y 65.536 puntos (SphereFormer) |
| Tipos de cuantizacion | no disponible (exportacion ONNX en precision de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (metadato de la model card; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) con manifiesto `model.onnx.meta.json` |

## Arquitectura y entrenamiento

FKAConv es una convolucion sobre nubes de puntos que combina atencion sobre vecinos con agregacion tipo kernel puntual, pensada para trabajar sobre vecindarios construidos a partir de una voxelizacion previa. SphereFormer emplea atencion con ventanas esfericas para capturar dependencias de largo alcance en escenas LiDAR, lo que explica su mayor tamano de parche (65.536 puntos) y su menor tamano de voxel (0,05 frente a 0,08). Ambos modelos se entrenaron con el pipeline de Open3D-ML; las configuraciones de entrenamiento se incluyen como `config.yml` en cada subcarpeta.

Los datos de entrenamiento son los conjuntos publicos Paris-Lille-3D (9 clases) y Semantic3D (8 clases). No se documenta el numero de tokens ni de iteraciones, ni si hubo tecnicas de refinamiento posteriores al entrenamiento supervisado. La clase 0 (no clasificada) se ignora tanto en entrenamiento como en evaluacion. El preprocesado (voxelizacion, ventana deslizante, construccion de jerarquias y tablas de vecinos) no forma parte del grafo ONNX y debe replicarse a partir del manifiesto.

## Capacidades

- Segmentacion semantica densa de nubes de puntos LiDAR en 9 clases (Paris-Lille-3D) u 8 clases (Semantic3D).
- Etiquetado por punto con logits por clase; la prediccion se obtiene con `argmax` sobre el eje de clases.
- Inferencia via ONNX Runtime con ejecucion en CPU, CUDA y DirectML.
- Integracion directa con el plugin qSemSeg de CloudCompare mediante lectura automatica del manifiesto lateral.
- Batch dinamico y numero de puntos dinamico en las variantes FKAConv.
- Parche fijo de 65.536 puntos y tensores estructurales precalculados en la variante SphereFormer.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Etiquetado asistido en CloudCompare: cargar `model.onnx` desde el plugin qSemSeg para preanotar nubes de escenas urbanas y revisar manualmente las clases dudosas, reduciendo el trabajo de anotacion manual.
- Inventario de mobiliario urbano: usar la variante Paris-Lille-3D para detectar y cuantificar clases como `bollard-small_pole`, `trash_can`, `barrier` y `pole-road_sign-traffic_light` en levantamientos moviles de calle.
- Analisis de vegetacion urbana: separar `natural-vegetation` del resto de la escena para estimar cobertura verde o planificar poda a partir de nubes LiDAR aereas o terrestres.
- Clasificacion de terreno y edificacion: con la variante Semantic3D, distinguir `man-made terrain`, `natural terrain` y `buildings` en levantamientos terrestres para modelos digitales del terreno y volumetrias.
- Preprocesado para pipelines de conduccion autonoma: generar etiquetas semanticas por punto como entrada de etapas posteriores de deteccion de peatones (`pedestrian`) y vehiculos (`car`) en entornos viarios.
- Control de calidad de capturas: detectar `scanning artefacts` con la variante Semantic3D para identificar tomas defectuosas antes de procesar el levantamiento completo.
- Prototipado rapido en Python: ejecutar la sesion de ONNX Runtime con el manifiesto como contrato de entrada para integrar la segmentacion en herramientas propias sin depender de frameworks de deep learning completos.

## Benchmarks y rendimiento

Datos reportados por el autor sobre una unica particion de test, que el propio autor califica como no un benchmark formal:

| Modelo | Precision global | mIoU (sin ignorados) |
|---|---|---|
| FKAConv – Paris-Lille-3D | no disponible | ≈ 0,647 |
| FKAConv – Semantic3D | ≈ 0,775 | ≈ 0,461 |
| SphereFormer – Paris-Lille-3D | no disponible | ≈ 0,782 |

El desglose de IoU por clase esta en el `README.md` de cada subcarpeta. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del proveedor de ejecucion y del tamano de parche; SphereFormer, con 65.536 puntos y multiples tensores estructurales precalculados, es el mas exigente en memoria.
- GPU recomendadas: no documentadas por el autor. La model card solo advierte que en la maquina de exportacion el proveedor CUDA fue aproximadamente 70 veces mas lento que CPU para SphereFormer y produjo NaN/Inf, por lo que recomienda DirectML o CPU y pide medir en el hardware objetivo.
- Cabe en GPU de consumo: no confirmado. La recomendacion explicita para SphereFormer es CPU o DirectML, lo que hace viable su uso en equipos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) y el plugin qSemSeg de CloudCompare. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El unico dato de rendimiento relativo es la penalizacion de ~70x del proveedor CUDA frente a CPU en SphereFormer.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de segmentacion semantica de nubes de puntos (por ejemplo, alternativas de Open3D-ML, TorchSparse o KPConv) ni datos de parametros, contexto o rendimiento de terceros que permitan una tabla rigurosa.

## Limitaciones y advertencias

- Modelos experimentales: el autor indica que no estan optimizados al maximo, sin ajuste exhaustivo de hiperparametros, con presupuesto de entrenamiento limitado y posible desbalanceo de clases. Deben validarse sobre datos propios.
- El preprocesado no esta incluido en el grafo ONNX: voxelizacion, ventana deslizante y construccion de jerarquias y tablas de vecinos deben replicarse a partir del manifiesto, lo que es una fuente habitual de errores de integracion.
- SphereFormer presenta problemas conocidos con el proveedor CUDA de ONNX Runtime (NaN/Inf y fuerte penalizacion de latencia); usar CPU o DirectML.
- Las metricas reportadas provienen de una unica particion de test y no constituyen un benchmark formal; el mIoU de FKAConv sobre Semantic3D (≈ 0,461) es bajo para uso en produccion sin revision humana.
- La clase 0 (no clasificada) se ignora en entrenamiento y evaluacion, por lo que los puntos sin etiqueta no reciben una clase valida.
- Cobertura limitada a los dominios de Paris-Lille-3D y Semantic3D: escenas urbanas y levantamientos terrestres. El rendimiento en otros sensores, densidades o entornos no esta caracterizado.
- Los metadatos declaran idioma `en`, pero el modelo no procesa lenguaje; ese campo no tiene relevancia tecnica aqui.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias y recomienda citar los trabajos de FKAConv y SphereFormer y los datasets Paris-Lille-3D y Semantic3D.
- Sin descargas ni likes registrados en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/dronc/onnx-semseg-models
- Open3D-ML (pipeline de entrenamiento): https://github.com/isl-org/Open3D-ML
- Subcarpetas del repositorio: `fkaconv-parislille3d/`, `fkaconv-semantic3d/`, `sphereformer-parislille3d/` (cada una con `model.onnx`, `model.onnx.meta.json`, `README.md`, `config.yml` y `LICENSE`)
- Plugin qSemSeg de CloudCompare: no disponible en la informacion proporcionada
- Paper de FKAConv: no disponible en la informacion proporcionada
- Paper de SphereFormer: no disponible en la informacion proporcionada
- Dataset Paris-Lille-3D: no disponible en la informacion proporcionada
- Dataset Semantic3D: no disponible en la informacion proporcionada
