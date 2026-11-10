# mcthebest/PCB_RTDETR

## Resumen

PCB_RTDETR es un modelo de detección de objetos especializado en la identificación de defectos en la capa de cobre de placas de circuito impreso (PCB). Lo desarrolla el usuario mcthebest y consiste en un ajuste fino de RT-DETRv4 X (variante extra-large de la familia RT-DETR) sobre el conjunto de datos DsPCBSD+, un corpus abierto de 2024 capturado con un sistema de inspección óptica automatizada (AOI) profesional. El modelo resuelve la tarea de localizar y clasificar nueve categorías de defecto a nivel de instancia, lo que lo hace directamente aplicable a control de calidad industrial.

La arquitectura combina un backbone HGNetv2-X con un encoder híbrido eficiente y un decoder DFINETransformer de 6 capas y 300 queries. La innovación principal de RT-DETRv4 es un marco de destilación semántica que emplea un profesor DINOv3 ViT-B/16 congelado únicamente durante el entrenamiento, sin coste adicional en inferencia. El modelo se entrenó a resolución 640x640 durante 10 épocas en una única GPU Tesla T4, lo que demuestra que el ajuste fino es viable con recursos muy limitados.

Su relevancia actual radica en que iguala o supera a métodos estado del arte en DsPCBSD+ (YOLOv11-CGL, PCB-AM, PCB-FS) con solo 10 épocas de entrenamiento, y se distribuye con licencia Apache 2.0 junto a una demo pública en Streamlit. El repositorio ocupa 1.0 GB y no registra descargas en el momento de la consulta, aunque cuenta con 2 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETRv4 X (transformer detector: backbone HGNetv2-X + encoder híbrido AIFI/CCFF + decoder DFINETransformer de 6 capas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de detección de objetos; entrada de imagen 640x640 px) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión; sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint descargable vía `huggingface_hub`; el repo ocupa 1.0 GB) |

## Arquitectura y entrenamiento

RT-DETRv4 X es un detector transformer de la línea RT-DETR (v1, v2, v3) que incorpora ideas de D-FINE y DEIM. El backbone HGNetv2-X extrae características multiescala en strides 8, 16 y 32. El encoder es un Efficient Hybrid Encoder que combina AIFI (self-attention global sobre el mapa S5) con CCFF (fusión cruzada de escalas basada en CNN). El decoder es un DFINETransformer de 6 capas con 300 queries y regresión de caja probabilística de 32 bins por borde. La innovación clave es un marco de destilación semántica: un profesor DINOv3 ViT-B/16 congelado (preentrenado en LVD-1689M, ~1.7B imágenes) alinea las características F5 mediante una pérdida de similitud coseno (módulo DSI), con un módulo GAM que ajusta el peso de esa pérdida por época según las normas de gradiente. La pérdida total es `L_total = L_det + λ · L_DSI`, donde `L_det` agrega VFL, L1, GIoU, FGL, DDF y MAL. DINOv3 no se carga en inferencia.

El ajuste fino se realizó sobre DsPCBSD+ (8.208 imágenes de entrenamiento y 2.051 de validación, split 80-20), partiendo de pesos RT-DETRv4-X COCO y DINOv3 ViT-B/16 (LVD-142M). Se usó resolución 640x640, 10 épocas (frente a las 72 recomendadas, limitado por Colab T4), batch size 8, AdamW (lr encoder/decoder 2e-4, lr backbone 1e-5, weight decay 1e-4), scheduler FlatCosine (warmup 500 iteraciones, 5 épocas flat, 2 épocas sin augmentación), precisión mixta AMP FP16/FP32 y una NVIDIA Tesla T4 de 16 GB. El dataset DsPCBSD+ procede de un sistema AOI AGLE'OL AOI-100 V8 con cámara 16K e iluminación LED controlada, con anotación a nivel de instancia en nueve clases: SH (cortocircuito), SP (pico de cobre), SC (cobre espurio), OP (circuito abierto), MB (mordida de ratón), HB (rotura de taladro), CS (arañazo en conductor), CFO (objeto extraño en conductor) y BMFO (objeto extraño en material base).

## Capacidades

- Detección de objetos a nivel de instancia en imágenes de PCB, con localización mediante cajas delimitadoras y clasificación en nueve categorías de defecto de capa de cobre.
- Reconocimiento de defectos de distinta escala: el modelo reporta AP de 0,439 para objetos pequeños (<32² px), 0,602 para medianos y 0,754 para grandes (>96² px).
- Detección multi-instancia: identifica varias ocurrencias del mismo defecto en una sola imagen (la model card muestra ejemplos con dos BMFO, una MB y una CFO, o tres MB simultáneas).
- Umbral de confianza ajustable en la demo (sidebar de Streamlit), lo que permite operar en distintos puntos de la curva precisión/recall.
- Inferencia sin dependencia del profesor: DINOv3 solo interviene en entrenamiento, por lo que el despliegue no requiere cargar el ViT-B/16.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector visual puro.

## Casos de uso

- Inspección de calidad en línea de fabricación de PCB: el modelo se integra tras la cámara AOI para clasificar y localizar defectos de cobre en cada placa, sustituyendo la revisión manual. Su mAP@50 de 0,863 y su F1 medio de 0,802 a conf≥0,5 lo hacen apto para triaje automático.
- Detección prioritaria de roturas de taladro (HB): es la clase más fiable del modelo (AP 0,807, recall 0,93, F1 0,92), por lo que puede usarse como primer filtro en estaciones donde este defecto sea crítico.
- Control de cortocircuitos y circuitos abiertos (SH y OP): con AP de 0,597 y 0,555 y F1 de 0,88 y 0,84 respectivamente, el modelo sirve para verificaciones eléctricas previas a test funcional, reduciendo falsos negativos en defectos conductivos.
- Análisis de objetos extraños (CFO y BMFO): detecta partículas foráneas tanto en conductores como en el material base, útil en auditorías de limpieza de proceso; conviene operar con umbral bajo porque el recall de CFO es 0,56.
- Preetiquetado y aumento de datasets: al ser un checkpoint afinado con licencia Apache 2.0, puede emplearse para generar anotaciones preliminares sobre nuevas imágenes de PCB y acelerar el etiquetado humano, revisando después las clases con menor AP (SP, MB).
- Despliegue en entornos con hardware modesto: el ajuste se hizo en una T4 de 16 GB, de modo que la inferencia es viable en GPUs de gama media o en estaciones de inspección con aceleradores consumer; la demo en Spaces confirma que corre sin infraestructura dedicada.
- Prototipado rápido de sistemas de visión industrial: la combinación de pesos abiertos, licencia permisiva y demo interactiva permite validar un pipeline de detección de defectos antes de invertir en un modelo propio a mayor escala.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validación de DsPCBSD+ (métricas COCO):

| Métrica | Valor |
|---|---|
| mAP @ IoU=0,50 | 0,863 |
| mAP @ IoU=0,50:0,95 | 0,522 |
| mAP @ IoU=0,75 | 0,551 |
| AP small (<32² px) | 0,439 |
| AP medium | 0,602 |
| AP large (>96² px) | 0,754 |
| AR @ maxDets=100 | 0,686 |

AP por clase @ IoU=0,50:0,95:

| Clase | Defecto | AP |
|---|---|---|
| SH | Cortocircuito | 0,597 |
| SP | Pico de cobre | 0,381 |
| SC | Cobre espurio | 0,511 |
| OP | Circuito abierto | 0,555 |
| MB | Mordida de ratón | 0,408 |
| HB | Rotura de taladro | 0,807 |
| CS | Arañazo en conductor | 0,504 |
| CFO | Objeto extraño en conductor | 0,462 |
| BMFO | Objeto extraño en material base | 0,478 |
| Media | | 0,522 |

Precisión, recall y F1 por clase @ conf≥0,5, IoU≥0,5:

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| SH | 0,91 | 0,86 | 0,88 |
| SP | 0,77 | 0,69 | 0,73 |
| SC | 0,89 | 0,77 | 0,83 |
| OP | 0,85 | 0,84 | 0,84 |
| MB | 0,87 | 0,69 | 0,77 |
| HB | 0,91 | 0,93 | 0,92 |
| CS | 0,82 | 0,65 | 0,73 |
| CFO | 0,86 | 0,56 | 0,68 |
| BMFO | 0,87 | 0,83 | 0,85 |
| Media | | | 0,802 |

Comparativa con el estado del arte en DsPCBSD+:

| Modelo | Backbone | mAP@50 | mAP@50:95 | Notas |
|---|---|---|---|---|
| YOLOv11-CGL | YOLOv11n | 84,5% | 51,6% | 300 épocas, ligero |
| PCB-AM | YOLOv8s | 85,7% | no disponible | Módulos con atención |
| PCB-FS | YOLOv8 | 86,2% | 52,4% | Características frecuencia-espaciales |
| RT-DETRv4 X (este modelo) | HGNetv2-X + DINOv3 | 86,3% | 52,25% | 10 épocas, solo T4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El entrenamiento se realizó en una Tesla T4 de 16 GB con batch size 8 y resolución 640x640, lo que da una referencia del orden de magnitud; la inferencia en batch 1 requiere bastante menos.
- GPU recomendadas: NVIDIA Tesla T4 (validada en entrenamiento), así como A100, H100 o RTX 4090 para mayor throughput. Al ser un detector de 640x640, cabe en GPUs consumer de gama media-alta.
- Cabe en GPU consumer: sí; el propio autor entrenó en una T4 de Colab, y la demo pública corre en Hugging Face Spaces.
- Opciones de despliegue: descarga del checkpoint vía `huggingface_hub`, ejecución local clonando el Space (`git clone` del repo de Spaces, `pip install -r requirements.txt`) y demo en Streamlit. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | mAP@50 | mAP@50:95 | Épocas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RT-DETRv4 X (este modelo) | HGNetv2-X + DINOv3 | 86,3% | 52,25% | 10 | Apache 2.0 | Hugging Face + demo |
| PCB-FS | YOLOv8 | 86,2% | 52,4% | 100+ | no disponible | no disponible |
| PCB-AM | YOLOv8s | 85,7% | no disponible | no disponible | no disponible | no disponible |
| YOLOv11-CGL | YOLOv11n | 84,5% | 51,6% | 300 | no disponible | no disponible |

El modelo iguala el mAP@50:95 de PCB-FS (52,25 frente a 52,4) y supera ligeramente su mAP@50 (86,3 frente a 86,2) con un orden de magnitud menos de épocas y hardware muy inferior. Frente a YOLOv11-CGL gana 1,8 puntos de mAP@50 y 0,65 de mAP@50:95. La ventaja de los YOLO es su menor coste computacional en producción; la de este modelo es la licencia Apache 2.0 explícita y la disponibilidad de pesos y demo.

## Limitaciones y advertencias

- Entrenamiento corto: solo 10 épocas frente a las 72 recomendadas, limitado por la T4 de Colab. Es probable que un entrenamiento más largo mejore las clases con peor AP (SP 0,381, MB 0,408, CFO 0,462).
- Clases débiles: SP y MB presentan AP bajo y recall limitado (0,69 en ambas a conf≥0,5); CFO tiene el recall más bajo (0,56) y CS (0,65). Los falsos negativos de CFO y CS se absorben mayoritariamente en la clase Background según la matriz de confusión.
- Dominio restringido: el modelo está especializado en capa de cobre de PCB capturada con un AOI concreto (AGLE'OL AOI-100 V8, cámara 16K, iluminación LED controlada). El rendimiento puede degradarse con otras condiciones de iluminación, cámaras o tipos de placa.
- Sin datos de sesgo ni robustez fuera de distribución: no se documentan evaluaciones con imágenes de otros dominios, oclusiones o ruido.
- Riesgo de alucinación: como todo detector, puede producir detecciones espurias de baja confianza (la model card menciona una detección extra de baja confianza en un ejemplo cualitativo); se recomienda umbral de confianza calibrado por clase.
- Idiomas: no aplica; el modelo no procesa texto. No se declaran idiomas soportados.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; el dataset DsPCBSD+ tiene su propia licencia y cita académica obligatoria (Lv et al., *Scientific Data*, 2024).
- Repositorio con 0 descargas y 2 likes: ecosistema mínimo, sin validación independiente por terceros de las métricas reportadas.
- Formato de pesos y opciones de cuantización no documentados: hay que inspeccionar el repositorio para confirmar compatibilidad con herramientas de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcthebest/PCB_RTDETR
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/mcthebest/PCB_RTDETR
- Dataset DsPCBSD+ (paper): https://doi.org/10.1038/s41597-024-03656-8
- Referencia RT-DETR (arXiv:2304.08069, citada en la línea RT-DETR): no disponible en la información proporcionada
- Referencias arXiv incluidas en los tags del modelo: arXiv:2510.25257, arXiv:2410.13842, arXiv:2412.04234, arXiv:2508.10104 (títulos no disponibles en la información proporcionada)
