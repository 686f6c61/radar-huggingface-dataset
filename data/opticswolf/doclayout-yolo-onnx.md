# opticsWolf/doclayout-yolo-onnx

## Resumen

DocLayout-YOLO ONNX (DocStructBench export) es un detector de layout documental basado en la familia YOLO (YOLOv10 según la model card) y exportado a formato ONNX con resolución de entrada fija de 1024x1024. Lo publica el usuario opticsWolf como repositorio de servicio ("serving repo") para centralizar la distribución y el pinning de los pesos, que son byte a byte idénticos al fichero `doclayout_yolo_docstructbench_imgsz1024.onnx` del repositorio `wybxc/DocLayout-YOLO-DocStructBench-onnx`. No es un modelo de lenguaje ni un modelo generativo: es un detector de objetos especializado en segmentar regiones de layout en imágenes de páginas de documento (texto, títulos, tablas, figuras, etc.).

El modelo resuelve el problema de análisis de layout de documentos, un paso previo habitual en pipelines de OCR, extracción de información y digitalización de PDFs. Dado un canvas de imagen normalizado con estadísticas de ImageNet, devuelve cajas delimitadoras con etiquetas de región según el orden de etiquetas de DocStructBench. Su relevancia práctica radica en que se distribuye en ONNX, lo que permite inferencia sin dependencia del framework de entrenamiento original y facilita el despliegue en entornos de producción heterogéneos.

El repositorio es de tamaño reducido (0,1 GB) y se publica bajo licencia Apache-2.0, aunque la propia model card advierte de que la posición de la licencia AGPL de Ultralytics (upstream de la familia YOLO) está señalada y en revisión, y que hay un reemplazo previsto basado en PaddlePaddle PP-DocLayout.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de objetos de la familia YOLO (YOLOv10 según la model card), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija 1024x1024) |
| Tipos de cuantización | no disponible (solo se documenta el export ONNX en precisión original) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (con nota de revisión sobre la posición AGPL de Ultralytics upstream) |
| Formato de pesos | ONNX (`doclayout_yolo_docstructbench_imgsz1024.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO de la familia YOLOv10, según indica la model card, especializado en análisis de layout de páginas de documento. La entrada es un tensor `x` de forma `[1, 3, 1024, 1024]` con normalización ImageNet, y la salida son cajas de región de layout junto con sus etiquetas, siguiendo el orden de etiquetas de fallback de DocStructBench. El export está fijado a `imgsz1024`, es decir, resolución de 1024 píxeles de lado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de entrenamiento ni sobre si se aplicaron técnicas de ajuste posteriores (RLHF, DPO u otras), dado que no es un modelo de lenguaje. La model card tampoco detalla innovaciones técnicas del export más allá de la resolución fija y el formato ONNX. Sí se documenta la procedencia: el fichero es byte a byte idéntico (sha256 `fece9af02f618b603ff7921ccec6861d13e7e1f9830e091dfb7e8ad9311e5b21`) al publicado en `wybxc/DocLayout-YOLO-DocStructBench-onnx`, por lo que este repositorio actúa como espejo de distribución y no introduce cambios en los pesos.

## Capacidades

- Detección de regiones de layout en imágenes de páginas de documento (cajas delimitadoras con etiquetas de región).
- Análisis de layout documental orientado a pipelines de OCR y extracción de información.
- Inferencia mediante ONNX Runtime y otros runtimes compatibles con ONNX.
- Entrada de imagen fija de 1024x1024 con normalización ImageNet.
- Salida de cajas y etiquetas según el orden de etiquetas de DocStructBench.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto: es un modelo puramente visual de detección.

## Casos de uso

- Preprocesado de OCR en digitalización de PDFs: el detector segmenta las regiones de la página (bloques de texto, títulos, tablas, figuras) antes de pasar cada región a un motor de OCR, lo que mejora la precisión al evitar mezclar columnas y elementos gráficos.
- Extracción de información estructurada de facturas y formularios: las cajas de layout permiten localizar tablas y campos antes de aplicar reglas de extracción o modelos de comprensión de documentos.
- Enriquecimiento de pipelines de búsqueda documental: las etiquetas de región permiten indexar por tipo de contenido (texto frente a figura o tabla) y filtrar resultados según la consulta.
- Automatización de accesibilidad documental: la detección de figuras y tablas facilita generar descripciones alternativas y estructurar el orden de lectura de documentos escaneados.
- Procesamiento por lotes en servidores sin GPU dedicada: al estar en ONNX, puede ejecutarse con ONNX Runtime en CPU o con aceleración por proveedor de ejecución, integrándose en servicios de digitalización masiva.
- Moderación y control de calidad de digitalizaciones: la detección de regiones permite verificar que una página escaneada contiene las secciones esperadas y detectar páginas en blanco o mal escaneadas.
- Integración en visores de documentos con resaltado de regiones: las cajas devueltas permiten superponer capas interactivas sobre la página para navegación por secciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB y la entrada es de 1024x1024, por lo que el modelo es ligero en comparación con modelos generativos, pero no se documenta el consumo exacto.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; por el tamaño del repositorio y la naturaleza del detector es plausible su ejecución en GPU de consumo, pero no se aportan datos que lo confirmen.
- Opciones de despliegue: ONNX Runtime (formato ONNX); otros runtimes compatibles con ONNX no se detallan en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opticsWolf/doclayout-yolo-onnx | YOLO (YOLOv10) para layout documental | Imagen 1024x1024 | ONNX | Apache-2.0 (con nota sobre AGPL de Ultralytics) | Hugging Face |
| wybxc/DocLayout-YOLO-DocStructBench-onnx | YOLO para layout documental (origen del fichero) | Imagen 1024x1024 | ONNX | Apache-2.0 | Hugging Face |
| PaddlePaddle PP-DocLayout | Detección de layout documental (familia PaddlePaddle) | no disponible | no disponible | no disponible | Mencionado como reemplazo previsto en la model card |

No se dispone de datos de rendimiento comparativo (mAP, latencia) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte de que la posición de la licencia AGPL de Ultralytics (upstream de la familia YOLO) está señalada y bajo revisión; el mirror no relicencia los pesos, por lo que conviene verificar la situación legal antes de un uso comercial.
- El repositorio es un espejo de distribución: no introduce mejoras ni cambios en los pesos, y su valor añadido se limita a la centralización y el pinning.
- La entrada está fijada a 1024x1024 con normalización ImageNet; no se documenta soporte para otras resoluciones en este export.
- No se documentan sesgos conocidos ni tasas de alucinación, dado que no es un modelo generativo; el riesgo principal es la detección errónea de regiones (falsos positivos y negativos) en layouts atípicos.
- No se especifican los idiomas ni la cobertura de tipos de documento del dataset DocStructBench más allá del nombre del benchmark.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta el dimensionamiento previo a producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-07), por lo que su adopción y validación comunitaria son nulas.

## Enlaces

- Hugging Face: https://huggingface.co/opticsWolf/doclayout-yolo-onnx
- Repositorio de origen de los pesos: https://huggingface.co/wybxc/DocLayout-YOLO-DocStructBench-onnx
