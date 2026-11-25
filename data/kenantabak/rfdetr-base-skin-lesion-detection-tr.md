# kenantabak/rfdetr-base-skin-lesion-detection-tr

## Resumen

RF-DETR-Base (DINOv2) para detección de lesiones cutáneas es un modelo de detección de objetos desarrollado por kenantabak en el marco del proyecto EVREN, un benchmark multiarquitectura de visión por computador con despliegue ONNX en CPU. El modelo parte de la arquitectura RF-DETR-Base, que combina el backbone DINOv2 con un transformer de detección (DETR), y se ha afinado para localizar y clasificar cuatro tipos de lesión dermatológica: acné, carcinoma basocelular (BCC), melanoma y nevus. Se distribuye exclusivamente en formato ONNX (108,71 MB), lo que facilita su despliegue en entornos sin GPU.

El modelo resuelve un problema concreto: la detección automática de lesiones cutáneas en imágenes clínicas o dermatoscópicas con un pipeline ligero que funciona en CPU. Con una resolución de entrada fija de 560 × 560 píxeles y una latencia declarada de 495,9 ms por imagen (2,02 FPS) con cuatro hilos en ONNX Runtime, está pensado para prototipos, investigación y validación de pipelines, no para diagnóstico clínico autónomo.

Su relevancia actual radica en la combinación de un backbone moderno (DINOv2) con un detector DETR eficiente y una exportación ONNX lista para producción en CPU. La licencia CC-BY-4.0 permite uso comercial con atribución, aunque las licencias del framework subyacente aplican por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR-Base con backbone DINOv2 (transformer de detección) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 560 × 560) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión sin componente textual) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`best.onnx`, 108,71 MB) |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR-Base, un detector de la familia DETR (Detection Transformer) que sustituye el backbone convolutional habitual por DINOv2, un transformer preentrenado con autosupervisión sobre grandes volúmenes de imágenes. La cabeza de detección produce un conjunto fijo de 300 predicciones (cajas y logits de clase) que se decodifican con activación sigmoide sobre 4 clases de primer plano más una de fondo. La entrada es estática: tensor `[1, 3, 560, 560]` normalizado con media y desviación estándar de ImageNet.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset dermatológico ni si se aplicaron técnicas de RLHF o ajuste fino supervisado más allá del entrenamiento de detección estándar. El autor documenta una auditoría visual sobre 20 imágenes de validación retenidas con normalización ImageNet y `shift_cls=0`, que arroja F1 = 0,712, precisión = 0,703, recall = 0,722 y un 96,15 % de acierto de clase sobre verdaderos positivos. El modelo forma parte de un benchmark de 24 ejecuciones multiarquitectura con un decodificador ONNX unificado publicado en GitHub.

## Capacidades

- Detección de objetos en imágenes dermatológicas con 4 clases: acné, carcinoma basocelular (BCC), melanoma y nevus.
- Salida de hasta 300 detecciones por imagen con cajas en formato centro-ancho-alto normalizado y probabilidades por clase.
- Inferencia en CPU pura mediante ONNX Runtime, sin dependencia de GPU ni de frameworks de deep learning pesados (solo NumPy y Pillow en el ejemplo de uso).
- Umbral de confianza configurable (el ejemplo usa 0,35) para ajustar el equilibrio precisión/recall.
- Integración en pipelines de visión por computador mediante el decodificador ONNX unificado del repositorio EVREN.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de detección.

## Casos de uso

- Triaje preliminar de imágenes dermatológicas: el modelo localiza y clasifica lesiones en imágenes de 560 × 560, lo que permite priorizar casos sospechosos (melanoma, BCC) en flujos de revisión asistida por personal sanitario.
- Investigación en dermatología computacional: sirve como línea base reproducible para comparar arquitecturas de detección (DETR frente a YOLO, Faster R-CNN) sobre el mismo conjunto de clases en el benchmark EVREN.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con ONNX Runtime a ~2 FPS, puede integrarse en servidores sin GPU, dispositivos de borde o portátiles de investigación.
- Preetiquetado de datasets: genera cajas y clases candidatas sobre grandes lotes de imágenes para que anotadores humanos las revisen, reduciendo el coste de curación de datasets dermatológicos.
- Validación de pipelines ONNX: el modelo y su decodificador unificado sirven para probar cadenas de preprocesado, normalización ImageNet y postprocesado sigmoide antes de desplegar otros detectores en producción.
- Educación y demos interactivas: aplicaciones web o notebooks que muestran detección de lesiones en tiempo casi real en CPU, útiles para formación y divulgación.
- Auditoría de calidad visual: el script de auditoría del autor (F1, precisión, recall, exactitud de clase) puede reutilizarse para evaluar otros checkpoints sobre imágenes retenidas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 | 81,17 % |
| mAP@50-95 | 56,80 % |
| Precision | 79,23 % |
| Recall | 74,71 % |
| F1 (auditoría visual, 20 imágenes) | 0,712 |
| Precision (auditoría visual) | 0,703 |
| Recall (auditoría visual) | 0,722 |
| Exactitud de clase en verdaderos positivos | 96,15 % |
| Latencia CPU (4 hilos, ONNX Runtime) | 495,9 ms (2,02 FPS) |
| Tamano ONNX | 108,71 MB |

No se han publicado en la información disponible resultados comparativos frente a otros detectores (YOLO, Faster R-CNN, DETR estándar) sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado (CPU); en GPU, el modelo ONNX de 108,71 MB requiere menos de 1 GB de VRAM en float32.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo no está optimizado para GPU y el autor documenta únicamente ejecución en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque no se han publicado métricas de latencia en GPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider documentado), con posibilidad de usar CUDAExecutionProvider, TensorRT o OpenVINO sin cambios en el grafo.
- Latencia y throughput: 495,9 ms por imagen y 2,02 FPS con 4 hilos en CPU; el rendimiento escala con el número de hilos y la microarquitectura del procesador.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Entrada | mAP@50 | Licencia | Formato |
|---|---|---|---|---|---|---|
| rfdetr-base-skin-lesion-detection-tr | RF-DETR-Base + DINOv2 | 4 | 560 × 560 | 81,17 % | CC-BY-4.0 | ONNX |
| Detectores YOLO afinados en dermatología | CNN (YOLOv8/v11) | variable | 640 × 640 típico | no disponible | GPL/AGPL según versión | PyTorch/ONNX |
| DETR estándar (ResNet-50) | DETR + ResNet-50 | variable | 800 × 1333 típico | no disponible | Apache-2.0 | PyTorch |
| Faster R-CNN (ResNet-50) | CNN de dos etapas | variable | variable | no disponible | Apache-2.0 | PyTorch |

No se dispone de resultados de benchmarks de alternativas sobre el mismo dataset dermatológico, por lo que la comparación numérica directa no está disponible.

## Limitaciones y advertencias

- Modelo no validado clínicamente: no debe usarse como herramienta de diagnóstico autónomo; cualquier uso sanitario requiere validación regulatoria y supervisión médica.
- Sesgos desconocidos: no se documenta la composición demográfica, el tipo de piel (escala Fitzpatrick) ni la procedencia geográfica del dataset de entrenamiento, lo que puede provocar sesgos en poblaciones no representadas.
- Riesgo de alucinación visual: como todo detector, puede generar cajas falsas positivas o clasificar erróneamente lesiones benignas como malignas (y viceversa), con implicaciones clínicas graves.
- Confusión entre clases: melanoma y nevus, así como BCC y nevus, son visualmente similares; la exactitud de clase del 96,15 % se mide solo sobre verdaderos positivos y no refleja el rendimiento global.
- Contexto limitado: entrada fija de 560 × 560 sin multi-escala; lesiones pequeñas o imágenes de alta resolución reescaladas pueden perder detalle.
- Sin componente textual ni multilingüe: no admite prompts, tool calling ni razonamiento; su uso está restringido a detección de objetos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero las licencias del framework RF-DETR y de DINOv2 aplican por separado y deben revisarse antes de un despliegue comercial.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; no han sido reproducidos de forma independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/rfdetr-base-skin-lesion-detection-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/cilt-lezyonu-tespiti-rf-detr-base-dinov2-4-sinif
- Benchmark y decodificador ONNX unificado (GitHub): https://github.com/kenantabak/evren-multiarch-cv-onnx-benchmark
- Dataset estructurado del benchmark (HF Parquet): https://huggingface.co/datasets/kenantabak/evren-multiarch-cv-onnx-benchmark
- Artículo técnico en turco (Dev.to): https://dev.to/kenantabak
