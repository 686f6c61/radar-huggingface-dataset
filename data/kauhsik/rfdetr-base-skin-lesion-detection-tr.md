# Kauhsik/rfdetr-base-skin-lesion-detection-tr

## Resumen

rfdetr-base-skin-lesion-detection-tr es un modelo de detección de objetos basado en RF-DETR-Base con backbone DINOv2, entrenado para identificar lesiones cutáneas en imágenes dermatoscópicas. Lo desarrolla el autor identificado como Kauhsik en Hugging Face, en el marco del proyecto EVREN (Multi-Architecture Object Detection & ONNX CPU Benchmark), y se distribuye en formato ONNX listo para inferencia en CPU. Detecta cuatro clases: acné, carcinoma basocelular (bcc), melanoma y nevus.

El modelo resuelve un problema concreto de visión artificial médica: la localización y clasificación de lesiones cutáneas con bordes difusos en imágenes dermatoscópicas, un escenario donde los detectores CNN tradicionales suelen perder precisión. Según la model card, sobre un conjunto de 2.271 imágenes y 4 clases alcanzó la mayor precisión global entre las 6 familias de arquitectura evaluadas en el benchmark EVREN.

Es relevante ahora por dos motivos: por un lado, demuestra que un transformer de detección (RF-DETR con DINOv2) puede superar a alternativas CNN en dominios médicos con datos limitados; por otro, su empaquetado ONNX estático (batch 1, 560×560) y su tamaño reducido (108,71 MB) lo hacen desplegable en infraestructura CPU sin GPU. La licencia CC-BY-4.0 permite uso comercial con atribución, aunque el autor restringe explícitamente el uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR-Base con backbone DINOv2, sin NMS (NMS-free) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada estática 560×560) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX en FP32) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas de clase en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`best.onnx`, 108,71 MB) |

## Arquitectura y entrenamiento

El modelo emplea RF-DETR-Base, un detector transformer con backbone DINOv2 y diseño NMS-free, lo que elimina la necesidad de supresión no máxima en post-proceso. La entrada es estática de 560×560 píxeles con batch 1, y la normalización con media y desviación estándar de ImageNet es obligatoria según el autor. La salida consta de dos tensores: `dets` con forma [1, 300, 4] (cajas en formato centro-ancho-alto normalizado) y `labels` con forma [1, 300, 5], donde los canales 0 a 3 corresponden a las cuatro clases de primer plano y el canal 4 a fondo.

El entrenamiento se realizó sobre 2.271 imágenes dermatoscópicas con 4 clases, durante 40 épocas, en una única NVIDIA H200 (141 GB HBM3e) con precisión mixta (AMP), con un tiempo total de 67,7 minutos y un pico de VRAM de 20,0 GB. El autor reporta una velocidad de entrenamiento 6,8 veces superior a YOLO26m en su entorno. Se realizó una auditoría visual pre-lanzamiento sobre 20 imágenes no vistas (16 de validación y 4 de test, sin solapamiento con entrenamiento), obteniendo F1 de 0,712, precisión de 0,703, recall de 0,722 y un 96,15 % de exactitud de clase sobre verdaderos positivos. No se detalla en la información disponible si hubo RLHF, DPO ni la composición exacta del dataset más allá del recuento de imágenes y clases.

## Capacidades

- Detección de objetos con localización de cajas delimitadoras y clasificación en 4 clases: `acne`, `bcc`, `melanoma`, `nevus`.
- Inferencia en CPU mediante ONNX Runtime con el proveedor `CPUExecutionProvider`, sin necesidad de GPU.
- Diseño NMS-free: no requiere supresión no máxima en el post-proceso, lo que simplifica el pipeline.
- Salida multi-objeto: hasta 300 detecciones candidatas por imagen con puntuaciones sigmoidales por clase.
- Funciona con imágenes dermatoscópicas y, por extensión, con imágenes de piel en color RGB tras redimensionado a 560×560.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión para detección.
- No dispone de modo thinking, visión generativa, audio ni capacidades multilingües más allá de las etiquetas de clase.

## Casos de uso

- Triaje asistido en dermatología: el modelo puede prelocalizar y clasificar lesiones sospechosas en imágenes dermatoscópicas para priorizar la revisión por un especialista, aprovechando su mAP@50 de 81,17 % en las cuatro clases.
- Investigación en visión médica: sirve como línea base reproducible para comparar arquitecturas transformer frente a CNN en detección de lesiones cutáneas, dado que forma parte de un benchmark de 24 ejecuciones con dataset estructurado publicado en Parquet.
- Preprocesado de datasets dermatológicos: permite anotar automáticamente cajas delimitadoras y etiquetas de clase en grandes volúmenes de imágenes, reduciendo el trabajo manual de etiquetado previo a revisiones humanas.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU a 2,02 FPS (495,9 ms por imagen en un Intel Xeon a 2,20 GHz con 4 hilos), es viable en servidores sin GPU o en estaciones de trabajo clínicas modestas.
- Educación y demostraciones: su formato ONNX de 108,71 MB y el ejemplo de inferencia con NumPy puro facilitan su uso en cursos y talleres de visión artificial médica sin dependencias pesadas.
- Auditoría y validación de pipelines: el modelo incluye un decodificador ONNX unificado en el repositorio del benchmark, útil para verificar la corrección de post-procesos en sistemas de detección propios.
- Investigación sobre sesgos en datos médicos: al estar entrenado con 2.271 imágenes de un dominio concreto, puede emplearse para estudiar el comportamiento de detectores transformer ante clases desbalanceadas y bordes difusos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 | 81,17 % |
| mAP@50-95 | 56,80 % |
| Precision | 79,23 % |
| Recall | 74,71 % |
| F1 (auditoría visual ONNX, 20 imágenes) | 0,712 |
| Precision (auditoría visual ONNX) | 0,703 |
| Recall (auditoría visual ONNX) | 0,722 |
| Exactitud de clase en verdaderos positivos | 96,15 % |

Datos de cómputo reportados:

| Metrica | Valor |
|---|---|
| Hardware de entrenamiento | 1× NVIDIA H200 (141 GB HBM3e, AMP) |
| Tiempo de entrenamiento | 67,7 min (40 épocas) |
| Pico de VRAM en entrenamiento | 20,0 GB |
| Tamaño ONNX | 108,71 MB |
| Inferencia CPU (Intel Xeon @ 2,20 GHz, 4 hilos, FP32) | 495,9 ms (2,02 FPS) |

No se han publicado en la información disponible resultados comparativos de benchmarks frente a otros modelos concretos más allá de la afirmación de que superó en precisión global a las otras 6 familias de arquitectura evaluadas en el benchmark EVREN.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita; el modelo se distribuye en ONNX FP32 y está pensado para ejecución en CPU, por lo que no requiere VRAM en ese modo.
- GPU recomendadas: no especificadas en la información disponible. El entrenamiento se realizó en una NVIDIA H200; para inferencia en GPU se puede usar cualquier GPU compatible con ONNX Runtime (CUDAExecutionProvider), pero el autor no publica requisitos mínimos.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo; al ser un modelo de 108,71 MB en ONNX, es previsible que quepa en cualquier GPU moderna, pero no hay dato oficial.
- Despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 495,9 ms por imagen (2,02 FPS) en Intel Xeon @ 2,20 GHz con 4 hilos en FP32, según el autor. No se publican cifras para GPU.
- Memoria RAM: no disponible.

## Comparativa con modelos similares

La información disponible solo menciona una comparación directa con YOLO26m en tiempo de entrenamiento (6,8 veces más rápido RF-DETR-Base), sin datos de precisión de ese modelo. No se dispone de cifras de otros detectores comparables en el mismo dataset.

| Modelo | Arquitectura | Parametros | Contexto/entrada | mAP@50 | Licencia | Formato |
|---|---|---|---|---|---|---|
| rfdetr-base-skin-lesion-detection-tr | RF-DETR-Base + DINOv2 | no disponible | 560×560 | 81,17 % | CC-BY-4.0 | ONNX |
| YOLO26m | CNN (YOLO) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras 5 familias del benchmark EVREN | varias | no disponible | no disponible | no disponible (inferiores en precisión global según el autor) | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un dispositivo de diagnóstico clínico: el autor lo restringe explícitamente a investigación, educación y benchmarking. No debe usarse para decisiones médicas.
- Sesgos desconocidos: no se documenta la composición demográfica, el origen de las imágenes ni el balance de clases del dataset de entrenamiento, lo que impide evaluar sesgos por tono de piel, edad o tipo de lesión.
- Riesgo de falsos negativos y positivos: con recall de 74,71 % y precisión de 79,23 % en validación, y F1 de 0,712 en la auditoría visual, el margen de error es sustancial para cualquier uso clínico.
- Contexto de datos limitado: 2.271 imágenes y 4 clases es un conjunto pequeño; la generalización a otras poblaciones, dispositivos dermatoscópicos o condiciones de iluminación no está validada.
- Dependencia estricta del preprocesado: la normalización con media y desviación estándar de ImageNet y el redimensionado a 560×560 son obligatorios; desviarse de ellos degrada la salida.
- Entrada estática: batch 1 y resolución fija 560×560; no admite lotes dinámicos sin reexportar el modelo.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero las licencias de los frameworks subyacentes (RF-DETR, DINOv2) aplican por separado y deben revisarse.
- Idiomas: las etiquetas de clase están en inglés (`acne`, `bcc`, `melanoma`, `nevus`); no hay soporte multilingüe.
- Sin verificación independiente: los resultados de benchmarks son declarados por el autor y no están verificados por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Kauhsik/rfdetr-base-skin-lesion-detection-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/cilt-lezyonu-tespiti-rf-detr-base-dinov2-4-sinif
- Benchmark completo y decodificador ONNX (GitHub): https://github.com/kenantabak/evren-multiarch-cv-onnx-benchmark
- Dataset estructurado del benchmark (HF Parquet): https://huggingface.co/datasets/kenantabak/evren-multiarch-cv-onnx-benchmark
- Artículo técnico en Dev.to: https://dev.to/kenantabak/cnn-vs-transformer-4-farkli-alanda-24-kontrollu-nesne-tespiti-deneyi-ve-onnx-cpu-gercegi-2jn
