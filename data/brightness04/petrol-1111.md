# brightness04/petrol-1111

## Resumen

`brightness04/petrol-1111` es un repositorio de Hugging Face publicado por el usuario `brightness04` que contiene, según su model card, un minero para la subnet 44 (SN44) de Bittensor orientado a la detección de elementos de estaciones de servicio. El artefacto principal es un fichero `weights.onnx` de 9,31 MiB con una entrada de 736x736 píxeles y preprocesado de tipo letterbox con relleno gris (valor 114), pensado para detectar cuatro clases: surtidor de gasolina (`petrol pump`), manguera (`petrol hose`), marquesina (`roof canopy`) y panel de precios (`price board`).

El modelo no es un modelo de lenguaje ni un modelo generativo: es un detector de objetos en formato ONNX, presumiblemente derivado de una arquitectura tipo YOLO, entrenado para la tarea específica de detectar infraestructura de gasolineras. El repositorio se presenta como una implementación de referencia de un "miner" en el ecosistema de MinerHub, con todos los hiperparámetros expuestos como constantes en `miner.py` y umbrales de confianza por clase (0,31 para surtidores, 0,4 para mangueras y marquesinas, 0,35 para paneles de precios).

La relevancia de esta ficha es limitada y debe enmarcarse con honestidad: el repositorio tiene 0 descargas, 0 likes, un tamaño declarado de 0,0 GB (aunque el fichero de pesos pesa 9,31 MiB según la model card) y carece de licencia, idiomas declarados, pipeline y cualquier documentación de entrenamiento, benchmarks o procedencia de datos. Se trata, por tanto, de un artefacto de participación en una competición descentralizada, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos en ONNX (familia no especificada; presumiblemente YOLO, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente en ONNX, presumiblemente FP32 o FP16) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`weights.onnx`, 9,31 MiB, sha256 d1507104619fa2af…) |
| Resolucion de entrada | 736x736, letterbox con relleno gris 114 |
| Clases | 4: `petrol pump` (0), `petrol hose` (1), `roof canopy` (2), `price board` (3) |
| Umbrales de confianza | 0,31 / 0,40 / 0,40 / 0,35 por clase |
| Tamano del repo | 0,0 GB declarado en Hugging Face |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del detector. El único dato técnico es que se distribuye como grafo ONNX con entrada fija de 736x736 píxeles y preprocesado letterbox con valor de relleno 114, un patrón habitual en detectores de la familia YOLO (YOLOv5, YOLOv8, YOLOv11) exportados a ONNX. El tamaño del fichero (9,31 MiB) es compatible con un detector pequeño o nano de dicha familia, aunque no es posible confirmarlo sin inspeccionar el grafo.

No se ha publicado información sobre el conjunto de entrenamiento (número de imágenes, composición, procedencia, anotaciones), sobre el régimen de aumento de datos, sobre la función de pérdida ni sobre si hubo destilación, fine-tuning desde un checkpoint preentrenado o entrenamiento desde cero. Tampoco hay datos sobre épocas, batch size, optimizador o hardware utilizado. La model card se limita a describir el artefacto de inferencia y los parámetros del minero (umbrales por clase y preprocesado), sin documentación del proceso de entrenamiento.

## Capacidades

- Detección de objetos en imágenes de estaciones de servicio para cuatro clases: surtidor (`petrol pump`), manguera (`petrol hose`), marquesina (`roof canopy`) y panel de precios (`price board`).
- Salida de cajas delimitadoras con puntuación de confianza por clase, filtradas por umbrales específicos (0,31 / 0,40 / 0,40 / 0,35).
- Inferencia en formato ONNX, ejecutable con ONNX Runtime, OpenCV DNN u otros runtimes compatibles.
- Preprocesado integrado documentado: redimensionado letterbox a 736x736 con relleno gris 114.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües: es exclusivamente un detector de objetos de dominio específico.

## Casos de uso

- Inventario automático de estaciones de servicio: procesar imágenes satelitales o de street-view para localizar surtidores y marquesinas y estimar el número de puntos de suministro por instalación, usando las cajas de clase `petrol pump` y `roof canopy`.
- Verificación de señalización de precios: detectar paneles de precios (`price board`) en imágenes de gasolineras para pipelines de monitorización de precios o auditoría de cumplimiento publicitario.
- Análisis de seguridad industrial: localizar mangueras (`petrol hose`) y surtidores para inventariar elementos expuestos y priorizar inspecciones de mantenimiento.
- Automatización de cartografía de infraestructura energética: integrar el detector en un pipeline de anotación asistida que genere candidatos de bounding boxes sobre ortofotos, reduciendo el coste de etiquetado manual.
- Control de calidad de datasets de visión: usar el modelo como detector de referencia para comparar anotaciones humanas y detectar discrepancias en las cuatro clases definidas.
- Prototipado de minería en SN44: servir como minero de referencia en la subnet 44 de Bittensor para validar el flujo completo (carga de `weights.onnx`, preprocesado letterbox, filtrado por umbrales) antes de entrenar un modelo propio.
- Filtrado previo en pipelines de imágenes: descartar imágenes sin infraestructura de gasolinera antes de pasarlas a modelos más costosos, aprovechando el reducido tamaño del ONNX (9,31 MiB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del fichero (9,31 MiB) y la resolución de entrada (736x736), es razonable esperar un consumo inferior a 1 GB en FP32, aunque este dato es una estimación y no está confirmado por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA y ONNX Runtime (por ejemplo, RTX 3060, RTX 4090, A100, H100). El modelo también puede ejecutarse en CPU dado su reducido tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050 y superiores. No confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA/TensorRT), OpenCV DNN, TensorRT tras conversión, y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `brightness04/petrol-1111` | Detector ONNX específico | 4 (gasolinera) | 736x736 | 9,31 MiB | no disponible | Hugging Face (0 descargas) |
| YOLOv8n (Ultralytics) | Detector general | 80 (COCO) | 640x640 | ~6 MB | AGPL-3.0 | GitHub, pip, Hugging Face |
| YOLOv11n (Ultralytics) | Detector general | 80 (COCO) | 640x640 | ~5,4 MB | AGPL-3.0 | GitHub, pip, Hugging Face |
| RT-DETR (Baidu) | Detector transformer | 80 (COCO) | 640x640 | variable | Apache-2.0 | GitHub, Hugging Face |

La comparación es estructural: los detectores generales cubren 80 clases de COCO pero no incluyen las clases específicas de gasolinera (`petrol pump`, `petrol hose`, `roof canopy`, `price board`), por lo que no son sustitutos directos sin fine-tuning. No se dispone de métricas (mAP, precisión, recall) del modelo de `brightness04` para comparar rendimiento numéricamente.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica permiso de uso comercial, modificación ni redistribución; en producción esto es un bloqueante legal hasta aclararlo con el autor.
- Sin documentación de entrenamiento: no se conoce el dataset, su procedencia ni su cobertura geográfica, lo que impide evaluar sesgos o generalización.
- Sin benchmarks publicados: no hay mAP, precisión ni recall que permitan comparar con alternativas.
- Riesgo de alucinación (falsos positivos): como todo detector, puede generar cajas espurias sobre texturas o estructuras que se parezcan a surtidores o marquesinas, especialmente con umbrales bajos como 0,31.
- Dominio muy restringido: solo cuatro clases de infraestructura de gasolinera; no sirve para otras tareas de visión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permita validar su calidad.
- Tamaño declarado inconsistente: el repositorio indica 0,0 GB mientras la model card cita un fichero de 9,31 MiB; conviene verificar la integridad del artefacto (sha256 d1507104619fa2af…) antes de usarlo.
- Dependencia de un ecosistema concreto (SN44 / MinerHub): los umbrales y el preprocesado están calibrados para esa competición, no necesariamente para datos de producción.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no debe evaluarse como tal.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/brightness04/petrol-1111
- Modelo de referencia citado en la model card: `manak0/Detect-petrol-station-1-0` (no se ha proporcionado URL directa)
- Subnet 44 de Bittensor (Score / TurboVision): no se ha proporcionado URL directa
- MinerHub: no se ha proporcionado URL directa
- ONNX Runtime: https://onnxruntime.ai/
- Ultralytics YOLO (referencia arquitectónica presumible, no confirmada): https://github.com/ultralytics/ultralytics
