# GreenMap/yolo11x-blueprint-layout-detector

## Resumen

GreenMap/yolo11x-blueprint-layout-detector es un modelo de detección de objetos basado en la arquitectura YOLO11x de Ultralytics, ajustado por el usuario GreenMap para identificar los elementos estructurales principales de planos arquitectónicos y de construcción. Detecta tres clases: el área de dibujo principal (`drawing_area`), los bloques de leyenda (`legend_block`) y los cajetines o bloques de título (`title_block`). El modelo resuelve un problema concreto de automatización documental en el sector AEC (arquitectura, ingeniería y construcción): la segmentación y clasificación automática de las regiones que componen un plano técnico, paso previo habitual en pipelines de digitalización, indexación y extracción de metadatos.

El modelo parte de los pesos preentrenados de YOLO11x, la variante de mayor capacidad de la familia YOLO11, y se ha reentrenado con 1.425 imágenes de entrenamiento y 355 de validación, a una resolución de entrada de 1472 × 1472 píxeles. La elección de una resolución tan alta es coherente con el dominio: los planos contienen texto y símbolos de pequeño tamaño que se pierden a resoluciones estándar de 640 píxeles.

Es relevante ahora porque la digitalización de archivos técnicos y la automatización de flujos BIM/CAD requieren modelos especializados que localicen regiones semánticas dentro de documentos gráficos complejos. Con licencia Apache 2.0 y formato Ultralytics, el modelo es desplegable en producción sin restricciones comerciales, y sus métricas de validación (mAP50 de 0,9431 global) indican un rendimiento sólido en las tres clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11x (Ultralytics), detector de objetos de una etapa, backbone CNN + cabeza de detección |
| Parametros totales | no disponible (repo de 0,9 GB; los pesos de YOLO11x rondan las decenas de millones, pero el dato exacto no se publica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible en la model card (Ultralytics soporta exportación a FP16, INT8 y TensorRT, pero no se documenta en la ficha del autor) |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto de forma nativa) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente; librería `ultralytics`, pesos compatibles con el ecosistema `.pt` de Ultralytics |

## Arquitectura y entrenamiento

El modelo es un detector de objetos YOLO11x, la variante extragrande de la familia YOLO11 de Ultralytics. YOLO11 emplea un backbone convolucional con bloques C3k2 y mecanismos de atención C2PSA, junto con una cabeza de detección anchor-free que predice cajas y clases directamente. Al ser un modelo de una etapa, prioriza la latencia de inferencia frente a la precisión de detectores de dos etapas, lo que lo hace adecuado para procesamiento por lotes de grandes volúmenes de planos.

El ajuste fino se realizó sobre los pesos preentrenados `yolo11x.pt` con el framework Ultralytics YOLO 8.4.75. El conjunto de datos consta de 1.425 imágenes de entrenamiento y 355 de validación, con un total de 1.922 instancias anotadas en validación (1.374 de `drawing_area`, 190 de `legend_block` y 358 de `title_block`). La resolución de entrada es de 1472 × 1472 píxeles, notablemente superior a la resolución por defecto de YOLO (640), lo que sugiere que se priorizó la detección de regiones con detalle fino. No se documentan en la model card detalles sobre aumento de datos, número de épocas, hiperparámetros de entrenamiento ni el origen exacto del dataset.

## Capacidades

- Detección de tres clases de regiones en planos: área de dibujo principal, bloque de leyenda y cajetín/título.
- Localización de cajas delimitadoras con alta resolución de entrada (1472 × 1472), adecuada para documentos técnicos densos.
- Procesamiento de planos arquitectónicos y dibujos de construcción, incluyendo planos de planta y documentación técnica.
- Detección robusta del cajetín (`title_block`), con precisión de 0,9994 y recall de 1,0000 en validación.
- Capacidad de servir como etapa de preprocesado en pipelines de OCR y extracción documental, al aislar regiones de interés.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión por computador.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.

## Casos de uso

- Digitalización masiva de archivos de planos: el modelo localiza el área de dibujo y el cajetín en cada plano escaneado, permitiendo recortar y clasificar automáticamente las regiones antes de aplicar OCR o indexación. Es adecuado por su mAP50 de 0,9619 en `drawing_area` y su alta resolución de entrada.
- Extracción automatizada de metadatos de cajetines: al detectar con precisión casi perfecta el `title_block` (mAP50 0,9950), se puede recortar esa región y enviarla a un motor OCR para extraer número de plano, autor, fecha y revisión.
- Indexación y búsqueda en repositorios técnicos: clasificar cada plano por la presencia y posición de leyendas y cajetines permite construir índices navegables y filtrar documentos por tipo o completitud.
- Control de calidad documental: verificar que un plano contiene las tres regiones esperadas (dibujo, leyenda, título) para detectar documentos incompletos o mal escaneados antes de su archivo definitivo.
- Preprocesado para pipelines BIM/CAD: aislar la leyenda para alimentar sistemas de reconocimiento de símbolos y patrones de sombreado, o para extraer la simbología y vincularla con bases de datos de materiales.
- Automatización de flujos de licitación y revisión de proyectos: procesar lotes de planos recibidos de proveedores y separar automáticamente las regiones de interés para revisores humanos o sistemas de validación.
- Segmentación de documentos para entrenamiento de modelos posteriores: usar las detecciones como pseudoetiquetas para ampliar datasets de layout documental en el dominio de la construcción.

## Benchmarks y rendimiento

Métricas de validación publicadas por el autor (355 imágenes, 1.922 instancias):

| Clase | Imágenes | Instancias | Precision | Recall | mAP50 | mAP50-95 |
|---|---|---|---|---|---|---|
| all | 355 | 1922 | 0.9343 | 0.8938 | 0.9431 | 0.8243 |
| drawing_area | 352 | 1374 | 0.9091 | 0.9392 | 0.9619 | 0.8205 |
| legend_block | 167 | 190 | 0.8942 | 0.7421 | 0.8725 | 0.7355 |
| title_block | 355 | 358 | 0.9994 | 1.0000 | 0.9950 | 0.9169 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa del ecosistema YOLO11x, los pesos en FP32 ocupan del orden de cientos de MB, pero el repo completo pesa 0,9 GB; la VRAM necesaria depende de la resolución de entrada (1472 × 1472 eleva el consumo frente a 640 × 640) y del tamaño de lote.
- GPU recomendadas: no especificadas por el autor. Por el tamaño de la variante x y la resolución de entrada, se recomienda GPU con al menos 8-16 GB de VRAM para inferencia a 1472 × 1472; para entrenamiento o lotes grandes, GPU de clase A100/H100 o RTX 4090.
- Compatibilidad con GPU de consumo: probable en GPUs consumer con suficiente VRAM (RTX 3060 12 GB en adelante), aunque el dato exacto no está documentado.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX, TensorRT, OpenVINO y TFLite mediante las herramientas de Ultralytics; integración con Triton o servicios propios. No se documentan opciones específicas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Resolución entrada | mAP50 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GreenMap/yolo11x-blueprint-layout-detector | YOLO11x | 3 (layout de planos) | 1472 × 1472 | 0,9431 | Apache 2.0 | Hugging Face |
| YOLO11x (Ultralytics, preentrenado COCO) | YOLO11x | 80 (COCO) | 640 (por defecto) | no comparable (dominio distinto) | AGPL-3.0 / comercial | Ultralytics |
| YOLO11m / YOLO11s | YOLO11 (variantes menores) | 80 (COCO) | 640 (por defecto) | no comparable (dominio distinto) | AGPL-3.0 / comercial | Ultralytics |

No se dispone de información sobre otros detectores especializados en layout de planos con los que comparar directamente. La comparación con las variantes base de YOLO11 es solo orientativa, ya que el dominio y las clases difieren.

## Limitaciones y advertencias

- El modelo solo detecta tres clases; no reconoce símbolos, texto, cotas ni otros elementos del plano, que requerirían etapas adicionales (OCR, reconocimiento de símbolos).
- El recall de `legend_block` es notablemente inferior (0,7421) al de las otras clases, lo que indica que puede omitir leyendas en planos con formatos atípicos o leyendas poco visibles.
- El conjunto de validación es reducido (355 imágenes) y el de entrenamiento también (1.425 imágenes); el rendimiento en dominios muy distintos (planos industriales, mapas, esquemas eléctricos) no está verificado.
- No se documenta la composición del dataset ni su diversidad geográfica o de estilo, por lo que puede existir sesgo hacia los formatos de plano presentes en el entrenamiento.
- Riesgo de falsos positivos en documentos que no son planos (por ejemplo, páginas de texto con tablas) al no haberse entrenado como clase negativa explícita.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los pesos base de Ultralytics YOLO11x, que en su distribución original es AGPL-3.0 o comercial; el autor declara Apache 2.0 para este ajuste.
- La resolución de entrada de 1472 × 1472 incrementa el coste computacional y la VRAM frente a configuraciones estándar de YOLO.
- No se documentan procesos de calibración, umbrales de confianza recomendados ni evaluación en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GreenMap/yolo11x-blueprint-layout-detector
- Ultralytics (framework y YOLO11): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Imagen de ejemplo de la model card: https://cdn-uploads.huggingface.co/production/uploads/689a00a12b3976126e5e8431/nvoJ_V2MBZIZnLm1C9zur.jpeg
