# rahmanenjozz/retail-product-seg-rfdetr-n

## Resumen

Retail Product Seg (RF-DETR Nano) es un modelo de segmentación de instancias agnóstico de clase, especializado en fotografías de productos de comercio minorista. Lo desarrolla el autor independiente `rahmanenjozz` como un fine-tuning de RF-DETR Nano Seg, un detector-segmentador construido sobre el backbone DINOv2-S y publicado originalmente por Roboflow, aquí reempaquetado bajo la librería LibreYOLO. El modelo no identifica qué producto ve, sino que localiza cada producto con una máscara y una caja delimitadora, actuando como primera etapa de una cadena de reconocimiento por recuperación de imágenes.

La arquitectura es un transformer de detección tipo DETR (RF-DETR), con aproximadamente 33,6 millones de parámetros y una entrada fija de 312 x 312 píxeles. Su salida es un conjunto fijo de consultas (queries), lo que elimina la necesidad de aplicar supresión no máxima (NMS) y simplifica el postprocesado. Se distribuye en formato ONNX FP32 y PyTorch `.pt`, y puede ejecutarse íntegramente en el navegador mediante ONNX Runtime Web.

Su relevancia práctica reside en el desacoplamiento entre detección e identificación: al ser agnóstico de clase, el detector no necesita reentrenarse cuando cambia el catálogo de productos, solo se añaden nuevas imágenes al índice de búsqueda vectorial. Está orientado al mercado minorista de Indonesia y declara una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Nano Seg (transformer DETR con backbone DINOv2-S) |
| Parametros totales | ~33,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 312 x 312 píxeles) |
| Tipos de cuantizacion | FP32 (ONNX y PyTorch); FP16, INT8 y TFLite planificados, no disponibles |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32, 123 MB), PyTorch `.pt` (FP32, 133 MB), `config.json` |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Nano Seg, un detector-segmentador de la familia DETR que combina un backbone DINOv2-S con un decodificador transformer. A diferencia de los detectores clásicos tipo YOLO, RF-DETR emite un conjunto fijo de consultas, cada una con su caja normalizada (cx, cy, w, h), sus logits de clase y una máscara de baja resolución (S/4 x S/4) que se reescala bilinealmente al tamaño de la imagen. Esta formulación evita la supresión no máxima y hace que el pipeline de inferencia sea determinista y sencillo de portar.

El fine-tuning parte de los pesos COCO de RF-DETR Nano Seg y se ha realizado con la librería LibreYOLO sobre un conjunto interno de imágenes de productos minoristas de Indonesia. La model card no especifica el número de imágenes de entrenamiento, la composición del dataset ni si se aplicaron técnicas de aumento de datos o ajuste fino con RLHF (no procede en un modelo de visión). La única métrica declarada es la validación sobre 58 imágenes internas, un conjunto muy reducido que conviene interpretar con cautela.

## Capacidades

- Segmentación de instancias: devuelve una máscara binaria y una caja delimitadora por cada producto detectado en la imagen.
- Detección agnóstica de clase: una única clase `product`, sin distinción de categoría, marca o tipo de artículo.
- Umbral de confianza configurable (por defecto 0,3 en el ejemplo del autor) y límite de hasta 50 detecciones por imagen.
- Sin NMS: la salida por consultas fijas permite filtrar únicamente por puntuación.
- Generación de recortes con fondo blanco listos para incrustar (embedding) y búsqueda vectorial.
- Inferencia en navegador mediante ONNX Runtime Web (WebGPU o WebAssembly) y en servidor con ONNX Runtime o PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Catalogación automática de inventario: el modelo detecta y recorta cada producto de una foto de estantería o mesa, generando imágenes limpias sobre fondo blanco que se indexan en un catálogo. Es adecuado porque separa la localización de la identificación y no requiere reentrenamiento al añadir referencias nuevas.
- Búsqueda visual de productos: los recortes generados se pasan a un modelo de embeddings (la model card menciona DINOv2) y se comparan contra un índice vectorial para devolver el identificador de producto. El detector actúa como etapa 1 del pipeline.
- Verificación de precios en tienda: a partir de una foto del lineal, se localizan los productos y se cruzan con la base de datos para comprobar etiquetado y precios, aprovechando la independencia del catálogo.
- Control de stock en tiempo real: integrado en una aplicación móvil o web, el modelo corre en el navegador con ONNX Runtime Web y permite al personal fotografiar estanterías y contar productos sin enviar imágenes a un servidor.
- Automatización de fichas de producto para e-commerce: el recorte con fondo blanco se usa directamente como imagen principal de la ficha, reduciendo el trabajo manual de edición fotográfica.
- Análisis de conformidad en lineales: detección de productos mal colocados o fuera de su sección mediante la comparación de las cajas detectadas con un plano de tienda, sin necesidad de clasificar cada referencia.
- Prototipado rápido en entornos sin GPU: al ejecutarse en CPU con ONNX Runtime y en WebAssembly, permite validar pipelines de visión en portátiles modestos antes de invertir en infraestructura.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Entrada | Mask mAP50-95 | Parámetros |
|---|---|---|---|
| retail-product-seg-rfdetr-n | 312 x 312 | 0,950 | ~33,6 M |

La métrica se ha medido sobre un conjunto de validación interno de 58 imágenes de productos minoristas, sin comparación pública con otros modelos. La latencia declarada es de aproximadamente 300 ms por imagen en una GPU de portátil GTX 1650 de 4 GB. No se han publicado resultados en benchmarks estándar como COCO, MMLU o HumanEval, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada: el modelo ONNX FP32 ocupa 123 MB y el `.pt` 133 MB; la inferencia completa cabe holgadamente en menos de 1 GB de VRAM, incluyendo buffers de activaciones para 312 x 312.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta ~300 ms por imagen en una GTX 1650 de 4 GB. GPU de datacenter (A100, H100) no son necesarias y aportarían sobre todo throughput en lotes.
- Cabe en GPU de consumo: sí, en tarjetas de gama baja como GTX 1650, RTX 3050 o superiores; también en iGPU modernas vía WebGPU.
- Despliegue: ONNX Runtime (CPU o GPU), ONNX Runtime Web (WebGPU/WebAssembly) en navegador, PyTorch con LibreYOLO para inferencia o reentrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput: ~300 ms por imagen en GTX 1650; no se publican cifras de throughput por lote ni latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| retail-product-seg-rfdetr-n | ~33,6 M | 312 x 312 | Segmentación de instancias agnóstica de clase (retail) | Apache 2.0 | ONNX + PyTorch en Hugging Face |
| RF-DETR Nano Seg (base, COCO) | ~33,6 M (estimado, no confirmado) | no disponible | Segmentación de instancias COCO (80 clases) | no disponible en la información proporcionada | Hugging Face (LibreYOLO/LibreRFDETRn-seg) |
| YOLOv8n-seg / YOLO11n-seg | no disponible en la información proporcionada | no disponible | Segmentación de instancias COCO | AGPL-3.0 (Ultralytics) | Repositorios oficiales de Ultralytics |

La comparación con detectores YOLO de segmentación es pertinente por tamaño y despliegue, pero la información disponible no permite contrastar métricas ni contextos de forma rigurosa. El modelo destaca frente a alternativas genéricas por su especialización en productos minoristas y su licencia permisiva, aunque carece de evaluación pública fuera del conjunto interno del autor.

## Limitaciones y advertencias

- La métrica de 0,950 de Mask mAP50-95 procede de solo 58 imágenes internas y no ha sido verificada de forma independiente; puede no generalizar a otros dominios, iluminaciones o catálogos.
- El modelo es agnóstico de clase: no distingue productos entre sí, por lo que requiere un pipeline de recuperación de imágenes posterior para la identificación.
- Entrenado específicamente para el mercado minorista de Indonesia; el rendimiento en otros entornos, tipos de producto o condiciones de captura no está documentado.
- No se detallan sesgos del dataset de entrenamiento, composición ni posibles desequilibrios por categoría o marca.
- Riesgo de falsos positivos y negativos en escenas con productos apilados, oclusiones o fondos complejos; el umbral de confianza debe calibrarse por caso de uso.
- Solo se distribuyen pesos FP32; las variantes FP16, INT8 y TFLite están planificadas pero no disponibles, lo que limita la optimización en dispositivos de bajos recursos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo con datos propios antes de producción.
- No dispone de mecanismos de explicabilidad más allá de las máscaras y puntuaciones de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahmanenjozz/retail-product-seg-rfdetr-n
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/rahmanenjozz/retail-product-seg-demo
- Página del autor: https://rahmanenjozz.github.io
- Modelo base: https://huggingface.co/LibreYOLO/LibreRFDETRn-seg
- Librería LibreYOLO: https://github.com/LibreYOLO/libreyolo
