# ducln-business/document-signature-stamp-detector-v20-20261012-dev

## Resumen
El modelo ducln-business/document-signature-stamp-detector-v20-20261012-dev es un detector de objetos basado en RF-DETR Base, desarrollado por ducln-business, especializado en la localización de firmas y sellos en documentos. Emplea la arquitectura RF-DETR con un encoder DINOv2 windowed small y una resolución de entrada de 560 píxeles, y fue entrenado sobre el conjunto de datos v20 con dos clases: signature (firma) y stamp (sello). Se trata de una versión de desarrollo (dev) publicada el 12 de octubre de 2026, con un checkpoint best.pth de aproximadamente 0.1 GB. Este modelo resuelve la necesidad de automatizar la detección de elementos de validación en documentos escaneados, un paso previo habitual en pipelines de digitalización, verificación de contratos y cumplimiento normativo. Su relevancia radica en la combinación de un detector transformer en tiempo real (RF-DETR) con un backbone DINOv2, lo que permite un equilibrio entre precisión y eficiencia computacional. No se dispone de información sobre licencia, idiomas soportados ni parámetros totales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Base con encoder DINOv2 windowed small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (deteccion de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |
| Resolucion de entrada | 560 |
| Clases | signature, stamp |
| Tamano del repositorio | 0.1 GB |

## Arquitectura y entrenamiento
La arquitectura empleada es RF-DETR Base, un detector de objetos basado en transformer (DETR) optimizado para inferencia en tiempo real. Utiliza un encoder DINOv2 windowed small, que proporciona representaciones visuales preentrenadas mediante autosupervisión. El modelo procesa imágenes a una resolución de 560x560 píxeles y produce predicciones de cajas delimitadoras con sus correspondientes puntuaciones de confianza para dos clases: signature y stamp (etiquetas originales round_seal). El entrenamiento se realizó sobre el conjunto de datos v20 durante 10 épocas, con un tamaño de lote de 16 y acumulación de gradiente de 4 (lote efectivo de 64). Se activó EMA (Exponential Moving Average) y el mejor checkpoint (best.pth) se seleccionó según la mAP de validación. No se proporciona información sobre el número total de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de RLHF o DPO, que no aplican a un modelo de detección. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Detección de objetos en documentos: localiza firmas y sellos con cajas delimitadoras.
- Clasificación en dos clases: signature y stamp.
- Predicción con umbral de confianza ajustable (por ejemplo, 0.25 en el ejemplo de uso).
- Integración en pipelines de procesamiento documental mediante la librería rfdetr.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, function calling ni agentes.
- No soporta multi-step reasoning ni capacidades multilingües (no aplica).
- Capacidad especial: detección visual en documentos escaneados a resolución 560.
- No incluye visión más allá de la detección de objetos (no hay OCR, descripción de imágenes, etc.).

## Casos de uso
- Verificación automática de contratos: el modelo detecta la presencia y ubicación de firmas y sellos en contratos escaneados. Con una mAP50 de 0.9840, es adecuado para validar que un documento ha sido firmado y sellado antes de archivarlo o procesarlo. Se integraría en un pipeline que recibe el PDF, renderiza la página y ejecuta el detector.
- Digitalización de archivos históricos: en proyectos de digitalización de documentos antiguos, el detector permite localizar sellos y firmas para catalogación automática. La resolución 560 ayuda a capturar detalles finos de sellos redondos.
- Procesamiento de facturas y documentos fiscales: detectar sellos de empresas y firmas de responsables para automatizar la validación de gastos. El modelo puede ejecutarse en tiempo real sobre lotes de imágenes.
- Gestión documental y KYC: en procesos de alta de clientes, verificar que el documento de identidad o contrato tiene firma y sello. El detector actúa como filtro previo antes de un OCR o verificación humana.
- Cumplimiento normativo y auditoría: comprobar que documentos oficiales (certificados, actas) incluyen los sellos requeridos. La alta recall para sellos (1.0000 a confianza 0.25) reduce el riesgo de omitir sellos presentes.
- Indexación y búsqueda de documentos: etiquetar automáticamente documentos según la presencia de firma o sello, facilitando búsquedas posteriores. El modelo puede procesar grandes volúmenes gracias a su naturaleza de detector en tiempo real.
- Automatización de flujos de trabajo con RPA: integrar el detector en robots de software para extraer regiones de firma/sello y recortarlas para su envío a sistemas de verificación.

## Benchmarks y rendimiento
| Metrica | Valor |
|---|---|
| COCO mAP50:95 | 0.6725 |
| COCO mAP50 | 0.9840 |
| Precision (signature, conf 0.25) | 0.9121 |
| Recall (signature, conf 0.25) | 0.9646 |
| Precision (stamp, conf 0.25) | 0.9881 |
| Recall (stamp, conf 0.25) | 1.0000 |
| Mejor macro-F1 (confianza) | 0.46 |
| Imagenes de validacion | 91 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware
- No se especifican requisitos de VRAM en la información proporcionada. El checkpoint ocupa 0.1 GB, por lo que es probable que quepa en GPUs de consumo, pero no hay datos confirmados.
- El ejemplo de uso indica device="cuda", por lo que se recomienda una GPU NVIDIA con soporte CUDA.
- GPU recomendadas: no disponible. Dado el tamaño, es plausible que funcione en RTX 3060, RTX 4090, etc., pero no está confirmado.
- Opciones de despliegue: la librería rfdetr sobre PyTorch. No se mencionan otros formatos como ONNX, TensorRT, vLLM (no aplica), llama.cpp (no aplica), Ollama (no aplica), TGI (no aplica).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. La model card no incluye comparativas con otros modelos. Como alternativas genéricas en detección de objetos en documentos se podrían considerar YOLOv8, DETR o LayoutLM, pero no se dispone de métricas comparativas en la información proporcionada.

## Limitaciones y advertencias
- Versión de desarrollo (dev): las métricas reportadas usan la partición v20 y no garantizan rendimiento en fuentes no vistas.
- Validación sobre solo 91 imágenes: muestra pequeña, alta varianza potencial.
- Licencia no disponible: no se puede confirmar permiso para uso comercial.
- Idiomas no disponibles: aunque la detección visual no depende del idioma, no hay confirmación sobre sesgos en distintos tipos de documentos.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: en detección se traduce en falsos positivos/negativos. La precisión y recall proporcionadas mitigan en parte, pero no hay análisis de errores.
- Umbral de confianza: el mejor macro-F1 se alcanza a 0.46, distinto del 0.25 usado en las métricas de precisión/recall. Elegir el umbral adecuado según el caso.
- Limitaciones de contexto: no aplica.
- Posible sobreajuste: 10 épocas con EMA, pero sin información sobre early stopping.
- No se especifica si el modelo maneja documentos con múltiples firmas/sellos o variaciones de escala.

## Enlaces
- HuggingFace: https://huggingface.co/ducln-business/document-signature-stamp-detector-v20-20261012-dev
- No se proporcionan otros enlaces (paper, repositorio, demo) en la información disponible.
