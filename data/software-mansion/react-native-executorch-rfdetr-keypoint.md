# software-mansion/react-native-executorch-rfdetr-keypoint

## Resumen

rfdetr-keypoint es un modelo de deteccion de puntos clave (keypoint detection) derivado del detector de objetos RF-DETR de Roboflow, exportado por Software Mansion como programas ExecuTorch `.pte` listos para ejecutarse en dispositivo. No se distribuye como pesos de PyTorch convencionales, sino como artefactos compilados para cuatro combinaciones de backend y precision (CoreML fp16, Vulkan fp16, XNNPACK fp32 y XNNPACK int8), pensados para consumirse desde la libreria React Native ExecuTorch.

El modelo resuelve la deteccion de esqueletos humanos sobre imagen, con salida compatible con la metrica OKS de COCO keypoint. Su relevancia actual esta en el despliegue movil: permite inferencia de un detector transformer con atencion deformable directamente en el telefono, sin servidor, con un artefacto int8 de 56,6 MB y una perdida de precision muy contenida respecto a fp32 (70,00 frente a 70,37 de mAP50-95 OKS en las primeras 500 imagenes de val2017 de COCO).

La ficha se limita a lo publicado en el repositorio: el autor no documenta numero de parametros, longitud de contexto (no aplica, es un modelo de vision), composicion del dataset de entrenamiento ni resultados de benchmarks mas alla del dato de OKS citado. El repositorio ocupa 1,0 GB, aunque los artefactos `.pte` publicados suman aproximadamente 337 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer con atencion deformable) para deteccion de keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp16 (CoreML, Vulkan), fp32 (XNNPACK), int8 dinamico 8da8w en capas Linear (XNNPACK) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (compilado), con `config.json` por backend |
| Backends publicados | coreml, vulkan, xnnpack |
| Runtime compatible | ExecuTorch v1.4.1 |
| Tamano de artefactos | CoreML fp16 71,5 MB; Vulkan fp16 70,0 MB; XNNPACK fp32 139 MB; XNNPACK int8 56,6 MB |
| Tarea (pipeline) | keypoint-detection |
| Region declarada | us |

## Arquitectura y entrenamiento

La arquitectura subyacente es RF-DETR, el detector de Roboflow basado en transformer con atencion deformable, adaptado aqui a la tarea de keypoint detection. El repositorio no aporta detalles sobre el backbone, el numero de capas, el tamano del modelo ni el esquema de entrenamiento; unicamente referencia el repositorio upstream (github.com/roboflow/rf-detr) como origen. Tampoco se documenta el volumen de tokens o imagenes de entrenamiento, la composicion del dataset ni si hubo fases de ajuste fino especificas para keypoints.

La innovacion tecnica relevante esta en la exportacion, no en el entrenamiento. La variante int8 aplica cuantizacion dinamica 8da8w (activaciones int8, pesos int8 por canal) exclusivamente a las capas Linear, dejando en fp32 las convoluciones y, de forma deliberada, los offsets de la atencion deformable y las cabezas de clase, caja y keypoint. Esa selectividad explica que la degradacion sea minima (0,37 puntos de mAP50-95 OKS). El backend MLX fue exportado pero no publicado; el motivo queda registrado en `mlx/NOTES.md`.

## Capacidades

- Deteccion de puntos clave sobre imagen, con salida evaluable mediante OKS de COCO keypoint.
- Deteccion de personas y de sus keypoints en una sola pasada (cabezas de clase, caja y keypoint diferenciadas).
- Inferencia en dispositivo en Android, iOS y entornos con Vulkan, CoreML o XNNPACK.
- Ejecucion con cuantizacion int8 para reducir el artefacto a 56,6 MB con perdida de precision marginal.
- Integracion directa con React Native ExecuTorch mediante las constantes del registro de modelos de la libreria.
- No soporta tool calling, agentes, texto, vision generativa, audio ni capacidades multilingues: es un modelo puramente discriminativo de vision.

## Casos de uso

- Analisis de postura en aplicaciones de fitness: el modelo estima keypoints corporales por fotograma en el propio telefono, lo que permite contar repeticiones y corregir la forma del ejercicio sin enviar video a un servidor.
- Rehabilitacion y fisioterapia: seguimiento de rangos de movimiento articulares en sesiones grabadas con la camara del dispositivo, aprovechando la variante CoreML fp16 en iOS para mantener latencia baja.
- Deteccion de caidas en entornos domesticos: procesamiento local de la camara de un dispositivo movil o embebido, con la variante XNNPACK int8 por su menor huella de memoria y su idoneidad en hardware limitado.
- Animacion y captura de movimiento de bajo coste: extraccion de esqueletos 2D para controlar avatares o rigs en tiempo real en apps React Native, sin infraestructura de GPU en la nube.
- Analitica deportiva en el borde: conteo de personas y extraccion de poses en grabaciones de entrenamiento para generar metricas agregadas, con Vulkan fp16 como opcion en Android.
- Preprocesado para modelos de accion: los keypoints sirven como entrada compacta a clasificadores de gesto o de actividad que se ejecutan a continuacion en el mismo dispositivo, reduciendo el coste frente a procesar la imagen completa.
- Control por gestos en interfaces: uso de keypoints de manos y brazos para interaccion sin contacto en aplicaciones de accesibilidad o quioscos.

## Benchmarks y rendimiento

Unico dato publicado por el autor: COCO keypoint (OKS) mAP50-95 sobre las primeras 500 imagenes de val2017.

| Variante | Precision | OKS mAP50-95 |
|---|---|---|
| XNNPACK fp32 | fp32 | 70,37 |
| XNNPACK int8 (8da8w) | int8 | 70,00 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, latencia o throughput por dispositivo) en la informacion disponible.

## Requisitos de hardware

- Huella en disco de los artefactos: 56,6 MB (XNNPACK int8), 70,0 MB (Vulkan fp16), 71,5 MB (CoreML fp16) y 139 MB (XNNPACK fp32). La VRAM/RAM necesaria para inferencia no esta documentada.
- Cabe en GPU de consumo y en moviles: el objetivo declarado es la ejecucion en dispositivo, no en servidor.
- Backends por plataforma: CoreML para iOS/macOS, Vulkan para Android con soporte Vulkan, XNNPACK como ruta portable en CPU.
- Despliegue mediante el runtime ExecuTorch v1.4.1 y la libreria React Native ExecuTorch; no se distribuyen pesos para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | OKS mAP50-95 | Licencia | Formato |
|---|---|---|---|---|---|---|
| rfdetr-keypoint (este) | RF-DETR keypoint, exportado | no disponible | no aplica | 70,00 (int8) / 70,37 (fp32) | Apache 2.0 | ExecuTorch `.pte` |
| RF-DETR upstream (roboflow/rf-detr) | Detector transformer | no disponible | no aplica | no disponible | no disponible en esta ficha | PyTorch |
| YOLOv8-pose | CNN detector de pose | no disponible | no aplica | no disponible | AGPL-3.0 (variante Ultralytics) | PyTorch, ONNX, otros |
| MediaPipe Pose | CNN de pose en dispositivo | no disponible | no aplica | no disponible | Apache 2.0 | TFLite |

La comparativa se limita a categoria y formato: no se dispone de resultados de benchmarks de las alternativas en la informacion proporcionada, por lo que no procede comparar cifras de precision. La diferencia practica de este modelo frente a las alternativas es el empaquetado ExecuTorch con variantes por backend y una variante int8 validada.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no procesa texto ni mantiene conversaciones; cualquier uso como LLM es invalido.
- Sin garantia de compatibilidad hacia delante en ExecuTorch: los `.pte` estan compilados para la version 1.4.1 y un runtime mas antiguo puede fallar al cargarlos.
- La variante int8 solo cuantiza capas Linear; las convoluciones y las cabezas permanecen en fp32, de modo que el ahorro de tamano no implica aceleracion uniforme en todas las capas.
- El unico dato de calidad publicado corresponde a las primeras 500 imagenes de val2017; no hay evaluacion sobre dominios distintos de COCO (interiores, oclusiones severas, camaras de vigilancia, etc.).
- Riesgo de fallo en escenas con oclusiones, multitud o personas de cuerpo parcial, inherente a los detectores de keypoint 2D; no cuantificado por el autor.
- Sesgos demograficos y de contexto no documentados; al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar su cobertura.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo upstream RF-DETR y de sus datos de entrenamiento antes de un despliegue en produccion.
- El autor no documenta numero de parametros ni requisitos de memoria, lo que dificulta el dimensionado previo en dispositivos de gama baja.
- El backend MLX no esta publicado; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-rfdetr-keypoint
- Modelo upstream RF-DETR: https://github.com/roboflow/rf-detr
- Libreria React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentacion de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Nota sobre el backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-rfdetr-keypoint/blob/main/mlx/NOTES.md
