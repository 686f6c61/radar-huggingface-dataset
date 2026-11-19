# avbiswas/dfine-nano-doclaynet

## Resumen

D-FINE nano DocLayNet es un detector de objetos especializado en análisis de maquetación de documentos (document layout analysis), desarrollado por el usuario avbiswas a partir del modelo base `ustc-community/dfine-nano-coco`. Su función es localizar las regiones estructurales de una página de documento (texto, títulos, tablas, figuras, notas al pie, fórmulas, etc.) sobre imágenes renderizadas de páginas PDF. Se trata de un fine-tuning del detector D-FINE en su variante nano, con tan solo 3.754.557 parámetros totales, sobre el conjunto de datos DocLayNet v1.2.

El modelo resuelve un problema concreto dentro de los pipelines de extracción documental: identificar qué partes de una página corresponden a cada tipo de contenido antes de aplicar OCR o extracción de tablas. Al ser un modelo de 3,7 millones de parámetros, es lo suficientemente pequeño como para ejecutarse en el navegador mediante ONNX Runtime Web con WebGPU, con una latencia de aproximadamente 40 ms por página según el autor.

La relevancia actual del modelo radica en su combinación de tamaño reducido, licencia permisiva Apache-2.0 y soporte de exportación a ONNX, lo que lo hace adecuado para despliegues en el borde (edge) y en aplicaciones web sin infraestructura GPU dedicada. Está publicado bajo la librería transformers y es compatible con los endpoints de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | D-FINE (detector transformer con representación de cajas por distribución; variante nano) |
| Parámetros totales | 3.754.557 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión para detección de objetos; entrada de imagen 1024x1024) |
| Tipos de cuantización | FP16 (exportación ONNX `layout_fp16.onnx`, 8 MB); no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto de forma nativa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en D-FINE, un detector de objetos que reformula la regresión de cajas delimitadoras como una distribución de probabilidad sobre coordenadas, lo que permite refinar iterativamente las predicciones. La variante nano es la más pequeña de la familia y emplea 300 consultas (queries) de decodificación, cada una con una clase asignada y sin necesidad de supresión de no máximos (NMS) en la inferencia. La entrada se procesa a una resolución de 1024x1024 píxeles, con un simple redimensionado y normalización por división entre 255, sin media ni desviación estándar.

El entrenamiento consistió en un fine-tuning desde `ustc-community/dfine-nano-coco` sobre el conjunto completo de entrenamiento de DocLayNet v1.2, con las páginas que contienen Footnote, Formula o Title repetidas tres veces para compensar el desbalance de clases. Se realizaron 12 épocas a 1024x1024 sobre una única GPU A100. El conjunto de datos DocLayNet, desarrollado por IBM Research, está bajo licencia CDLA-Permissive-1.0 y cubre once clases de maquetación: Caption, Footnote, Formula, List-item, Page-footer, Page-header, Picture, Section-header, Table, Text y Title.

## Capacidades

- Detección de objetos de maquetación documental en once clases: Caption, Footnote, Formula, List-item, Page-footer, Page-header, Picture, Section-header, Table, Text y Title.
- Procesamiento de imágenes de páginas completas a resolución 1024x1024, adecuado para páginas renderizadas de PDF a aproximadamente 144 DPI.
- Inferencia sin NMS: las 300 consultas del decodificador producen directamente cajas y puntuaciones, simplificando el postprocesado.
- Exportación a ONNX FP16 (8 MB) para ejecución en navegador con onnxruntime-web sobre WebGPU.
- Integración con la librería transformers mediante `DFineForObjectDetection`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es exclusivamente un modelo de visión para detección.

## Casos de uso

- Extracción documental en pipelines de OCR: el modelo identifica regiones de texto, tablas y figuras antes de aplicar OCR, permitiendo enrutar cada región al extractor adecuado (por ejemplo, un OCR para texto y un extractor de tablas para las regiones Table).
- Procesamiento de facturas y documentos financieros: la detección de Section-header, Table y Text permite segmentar facturas y extraer campos estructurados con reglas posteriores, reduciendo el ruido del OCR sobre elementos no relevantes.
- Anonimización y redacción de documentos: al localizar Page-header, Page-footer y Footnote, se pueden eliminar o tratar de forma diferenciada encabezados y pies que contienen datos sensibles.
- Análisis de artículos científicos: la detección de Formula, Caption y Picture facilita la extracción de ecuaciones y leyendas para su procesamiento posterior en pipelines de investigación.
- Digitalización de archivos históricos y administrativos: al ser un modelo de 3,7M de parámetros con licencia Apache-2.0, puede desplegarse en entornos con recursos limitados para procesar grandes volúmenes de páginas escaneadas.
- Aplicaciones web de visualización de documentos: la exportación ONNX FP16 de 8 MB permite ejecutar la detección directamente en el navegador con WebGPU, con una latencia de aproximadamente 40 ms por página, sin enviar el documento a un servidor.
- Preprocesado para sistemas RAG sobre PDF: la segmentación por clases permite conservar la estructura del documento (títulos, secciones, tablas) al trocear el texto para su indexación.

## Benchmarks y rendimiento

Resultados de mAP50-95 sobre un subconjunto de test de 2.500 páginas de DocLayNet v1.2 (fragmentos 0, 2 y 4 del split oficial de test), a 1024 px:

| Clase | Este modelo (D-FINE nano, 3,7M) | hantian/yolo-doclaynet (YOLO11s, ~9,4M) |
|---|---|---|
| **All** | **0,652** | 0,744 |
| mAP50 (all) | 0,828 | 0,906 |
| Caption | 0,614 | 0,793 |
| Footnote | 0,454 | 0,620 |
| Formula | 0,597 | 0,714 |
| List-item | 0,706 | 0,816 |
| Page-footer | 0,666 | 0,569 |
| Page-header | 0,704 | 0,698 |
| Picture | 0,657 | 0,787 |
| Section-header | 0,620 | 0,711 |
| Table | 0,671 | 0,819 |
| Text | 0,793 | 0,852 |
| Title | 0,686 | 0,803 |

El autor advierte que los números de YOLO11s provienen de un script de evaluación distinto (el validador de Ultralytics) sobre las mismas páginas, por lo que la comparación debe considerarse aproximada. El modelo supera a YOLO11s únicamente en Page-footer (0,666 frente a 0,569) y Page-header (0,704 frente a 0,698). El autor indica además que `avbiswas/yolo11n-doclaynet` obtiene 0,760, superior a este modelo, pero bajo licencia AGPL-3.0.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 3,7M de parámetros; la exportación ONNX FP16 ocupa 8 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor entrenó sobre una A100, pero la inferencia no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (incluido onnxruntime-web con WebGPU para navegador); no se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 40 ms por página en onnxruntime-web sobre WebGPU, según el autor; no se proporcionan datos de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | mAP50-95 (DocLayNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| avbiswas/dfine-nano-doclaynet | 3,7M | Imagen 1024x1024 | 0,652 | Apache-2.0 | Hugging Face |
| hantian/yolo-doclaynet (YOLO11s) | ~9,4M | Imagen (no especificada) | 0,744 | no disponible en la información | Hugging Face |
| avbiswas/yolo11n-doclaynet | no disponible | Imagen (no especificada) | 0,760 | AGPL-3.0 | Hugging Face |

La comparación directa con YOLO11s debe tomarse con cautela por la diferencia de scripts de evaluación. La ventaja principal de este modelo frente a las alternativas es su tamaño reducido y su licencia Apache-2.0, que permite uso comercial sin las obligaciones del copyleft de AGPL-3.0.

## Limitaciones y advertencias

- Precisión inferior a las alternativas YOLO11 en la mayoría de clases (mAP50-95 global de 0,652 frente a 0,744 de YOLO11s y 0,760 de yolo11n), especialmente en Footnote (0,454), Formula (0,597) y Caption (0,614).
- El modelo es exclusivamente de visión: no procesa texto ni mantiene contexto conversacional; no dispone de capacidades de tool calling, agentes ni razonamiento.
- No se han publicado datos sobre sesgos del modelo ni sobre su comportamiento en dominios distintos de DocLayNet (por ejemplo, documentos manuscritos, layouts no occidentales o páginas con maquetaciones atípicas).
- Riesgo de falsos positivos y negativos en clases poco representadas (Footnote, Formula), mitigado parcialmente por el sobremuestreo durante el entrenamiento pero no eliminado.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (DocLayNet) están bajo CDLA-Permissive-1.0, cuyas condiciones deben respetarse en la redistribución.
- El autor no documenta el rendimiento en resoluciones distintas de 1024x1024 ni en páginas renderizadas a otros DPI; el ejemplo de uso recomienda aproximadamente 144 DPI.
- No se dispone de información sobre idiomas soportados ni sobre el comportamiento del modelo con documentos en lenguas distintas de las presentes en DocLayNet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avbiswas/dfine-nano-doclaynet
- Modelo base: https://huggingface.co/ustc-community/dfine-nano-coco
- Paper de D-FINE: https://arxiv.org/abs/2410.13842
- Dataset DocLayNet (IBM Research): https://github.com/DS4SD/DocLayNet
- Modelo comparativo YOLO11s: https://huggingface.co/hantian/yolo-doclaynet
- Modelo comparativo YOLO11n: https://huggingface.co/avbiswas/yolo11n-doclaynet
- Dataset en Hugging Face: https://huggingface.co/datasets/docling-project/DocLayNet-v1.2
