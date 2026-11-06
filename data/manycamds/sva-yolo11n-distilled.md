# ManyCamDS/sva-yolo11n-distilled

## Resumen

SVA YOLO11n Distilled es un modelo de detección de objetos de una sola etapa, desarrollado por ManyCamDS, especializado en la monitorización de intersecciones residenciales, seguridad peatonal y auditoría de tráfico de micromovilidad. El modelo se construye sobre la arquitectura YOLO11n de Ultralytics (2,61 millones de parámetros) y se obtiene mediante destilación de conocimiento compuesta a partir de un profesor YOLO11x de 56,9 millones de parámetros, lo que supone una reducción del 95,4 % en el número de parámetros.

La relevancia del modelo radica en su orientación a despliegue en el borde: está pensado para hosts con 8 GB de RAM total y un límite de memoria RSS de contenedor de 1,2 GB, con latencias de inferencia de 18-28 ms en CPU de portátil Intel/AMD mediante OpenVINO u ONNX Runtime. Incorpora una ontología de cinco clases específica para tráfico residencial mixto (coche, motocicleta, bicicleta, patinete eléctrico y peatón), lo que lo diferencia de los detectores genéricos de COCO.

El modelo se distribuye con licencia Apache 2.0 en formato PyTorch (`.pt`, ~5,5 MB) y ONNX (`.onnx`, ~10,8 MB) con ejes de batch dinámicos, y declara soporte para inglés y español en su model card. Su público objetivo son desarrolladores de sistemas de videovigilancia urbana, seguridad vial y analítica de tráfico en dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de una etapa, anchor-free), destilado desde YOLO11x |
| Parametros totales | 2.610.000 (2,61 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada 640 x 640 x 3 RGB) |
| Tipos de cuantizacion | No especificados en la informacion disponible; el ONNX se describe como "quantization-ready" |
| Idiomas soportados | en, es (segun metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) con batch dinamico |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO11n de una etapa y anchor-free, con entrada RGB de 640 x 640 x 3 y exportación ONNX con ejes de batch dinámicos `[B, 3, 640, 640]`. El estudiante se entrena mediante destilación de conocimiento compuesta desde un profesor YOLO11x de 56,9 M de parámetros, con una función de pérdida de tres componentes: pérdida supervisada dura (CIoU para regresión de cajas y Distribution Focal Loss, con peso α = 1,0), pérdida de destilación de logits por divergencia KL con temperatura suavizada (β = 2,5, τ = 3,0) y pérdida de alineamiento de mapas de características normalizada L2 sobre las salidas P3, P4 y P5 del backbone y el neck (γ = 0,5).

El entrenamiento se realizó en una GPU NVIDIA A100 alquilada en Google Colab con precisión mixta automática (AMP FP16). Los conjuntos de datos declarados son `starwit/overhead-traffic-anomalies` y `UniqueData/electric-scooters-tracking`. No se especifica en la información disponible el número total de tokens, imágenes ni la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (no aplicables en un detector de objetos).

## Capacidades

- Detección de objetos en imágenes RGB de 640 x 640 con cinco clases: coche, motocicleta, bicicleta, patinete eléctrico y peatón.
- Regresión de cajas delimitadoras con CIoU y Distribution Focal Loss.
- Inferencia con batch dinámico en ONNX (soporta `[B, 3, 640, 640]`).
- Ejecución en CPU de borde mediante OpenVINO u ONNX Runtime.
- Exportación a ONNX lista para cuantización posterior.
- Carga nativa con la librería `ultralytics` para evaluación y fine-tuning.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá de la detección de objetos.

## Casos de uso

- Monitorización de intersecciones residenciales: el modelo detecta coches, motocicletas, bicicletas, patinetes y peatones en una sola pasada a 640 x 640, adecuado para cámaras fijas de vigilancia urbana con presupuesto de cómputo limitado.
- Auditoría de seguridad peatonal: al priorizar la clase peatón, permite generar alertas cuando se detectan viandantes en cruces residenciales, con latencias de 18-28 ms en CPU que habilitan procesamiento en tiempo casi real.
- Control de micromovilidad en aceras: la clase específica `e-scooter` permite auditar el uso de patinetes eléctricos en zonas peatonales o en contrasentido, un caso que los detectores genéricos de COCO no cubren.
- Despliegue en dispositivos de borde con 8 GB de RAM: el límite de RSS de 1,2 GB y el tamaño del ONNX (~10,8 MB) permiten ejecutarlo en mini-PC, Raspberry Pi de gama alta o contenedores Docker en cámaras inteligentes.
- Analítica de tráfico en tiempo real con OpenVINO: integrable en pipelines de visión por computador sobre CPU Intel/AMD sin GPU dedicada, reduciendo coste de infraestructura frente a un YOLO11x.
- Fine-tuning específico de dominio: el checkpoint `.pt` de 5,5 MB y la licencia Apache 2.0 permiten reentrenar el modelo sobre datasets propios de una ciudad o campus con recursos modestos.
- Preprocesado en pipelines de vídeo: al ser un detector ligero, puede actuar como etapa de filtrado previo (region proposals) antes de modelos más pesados de reconocimiento o seguimiento.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Metrica | Profesor YOLO11x | Baseline YOLO11n | SVA YOLO11n Distilled | Delta vs profesor |
|---|---|---|---|---|
| Parametros | 56,9 M | 2,61 M | 2,61 M | -95,4 % |
| mAP@50 (trafico residencial) | 91,8 % | 81,2 % | 85,7 % | Retencion del 93,4 % |
| GFLOPs (640x640) | No disponible (truncado en la fuente) | No disponible | No disponible | No disponible |

Ademas, la model card declara una latencia de inferencia de ~18-28 ms en CPU de portatil Intel/AMD mediante OpenVINO u ONNX Runtime. No se han publicado resultados de otros benchmarks (COCO, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el checkpoint `.pt` de ~5,5 MB y el ONNX de ~10,8 MB implican un consumo de memoria muy bajo (por debajo de 1 GB en FP32, estimacion no confirmada en la fuente).
- GPU recomendadas: el autor entrena en NVIDIA A100; para inferencia no se especifican GPU concretas, pero por tamano cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.).
- Cabe en GPU consumer: si, dado el tamano del modelo (2,61 M de parametros).
- Presupuesto de borde declarado: host con 8 GB de RAM total y limite de RSS de contenedor de 1,2 GB.
- Opciones de despliegue: `ultralytics` (PyTorch), ONNX Runtime, OpenVINO.
- Latencia y throughput: 18-28 ms por inferencia en CPU Intel/AMD (OpenVINO / ONNX Runtime). No se especifica throughput en GPU ni en otros aceleradores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50 (trafico residencial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SVA YOLO11n Distilled | 2,61 M | 640 x 640 RGB | 85,7 % (declarado) | Apache 2.0 | Hugging Face (`.pt`, `.onnx`) |
| YOLO11n (baseline) | 2,61 M | 640 x 640 RGB | 81,2 % (declarado) | AGPL-3.0 / Enterprise (Ultralytics) | Ultralytics |
| YOLO11x (profesor) | 56,9 M | 640 x 640 RGB | 91,8 % (declarado) | AGPL-3.0 / Enterprise (Ultralytics) | Ultralytics |

Nota: la comparativa se limita a los modelos citados en la model card; no se dispone de datos de otros detectores ligeros comparables en la informacion proporcionada. La licencia de los modelos Ultralytics originales difiere de la Apache 2.0 de este derivado, lo que conviene verificar antes de un uso comercial.

## Limitaciones y advertencias

- El modelo está especializado en cinco clases de tráfico residencial; no detecta otras categorias (senales, semaforos, vehiculos pesados, animales) salvo que se reentrene.
- Los resultados de mAP@50 (85,7 %) y la retencion del 93,4 % son declaraciones del autor no verificadas de forma independiente.
- No se especifican sesgos conocidos, composicion del dataset ni cobertura geografica, lo que limita la evaluacion de robustez ante dominios distintos (clima, iluminacion, camaras aereas vs. fijas).
- La entrada está fijada a 640 x 640; objetos pequenos o muy lejanos pueden degradar la deteccion.
- No hay informacion sobre cuantizaciones validadas (INT8, FP16) ni sobre precision tras cuantizar el ONNX.
- La licencia Apache 2.0 del derivado conviene revisarla frente a las condiciones de Ultralytics YOLO11 (AGPL-3.0 o licencia enterprise) para uso comercial en produccion.
- No dispone de capacidades de lenguaje, razonamiento ni tool calling; no debe presentarse como un modelo de propósito general.
- El repositorio tiene un tamano declarado de 0,0 GB y solo 34 descargas, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManyCamDS/sva-yolo11n-distilled
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- ONNX: https://onnx.ai/
- Dataset starwit/overhead-traffic-anomalies: https://huggingface.co/datasets/starwit/overhead-traffic-anomalies
- Dataset UniqueData/electric-scooters-tracking: https://huggingface.co/datasets/UniqueData/electric-scooters-tracking
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
