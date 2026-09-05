# ginexys/docforensics-layout

## Resumen

`ginexys/docforensics-layout` es un detector de layout de documentos desarrollado por Ginexys, una marca de Canworks LLC. Está diseñado específicamente para páginas degradadas, escaneadas y fotografiadas, donde los detectores convencionales pierden rendimiento. El modelo tiene un tamaño de 8.77 MB en formato ONNX y puede ejecutarse en CPU o en el navegador mediante onnxruntime-web, sin necesidad de GPU.

Detecta 15 tipos de regiones documentales (texto, títulos, tablas, imágenes, formularios, campos, casillas de verificación, firmas, etc.) y, además, produce 8 señales de condición de página (desenfoque, inclinación, ruido, sangrado, deformación, desgarros, escritura a mano y presencia de capa OCR nativa). Estas señales no las genera ningún detector comparable en la misma categoría.

El modelo está entrenado con 68 000 páginas de DocLayNet sometidas a una pipeline sintética de degradación, junto con 2 184 páginas de formularios etiquetadas desde la geometría de widgets AcroForm y 6 821 páginas etiquetadas por un extractor vectorial determinista. Todo el material de entrenamiento procede de datos con licencia permisiva o de dominio público federal de Estados Unidos, sin contenido propietario ni sin licenciar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos estilo YOLOv8, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (deteccion de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el analisis de layout es independiente del idioma) |
| Licencia | Docforensics-dual (AGPL-3.0 o licencia comercial) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un detector de objetos con arquitectura compatible con YOLOv8. Recibe una imagen de entrada de 640x640 píxeles en RGB, normalizada con la media y desviación típica de ImageNet, y aplica letterbox con valor de relleno 114. Adicionalmente admite una entrada auxiliar `evidence` de tamaño [1, 4], que puede rellenarse con ceros y que está reservada para flags de página deterministas. Las salidas tienen la misma forma que las de YOLOv8, lo que permite reutilizar sin cambios cualquier pipeline de decodificación y NMS existente.

El entrenamiento combina tres fuentes de datos: 68 000 páginas de DocLayNet degradadas sintéticamente con inclinación, desenfoque, ruido de sensor, sangrado, deformación por perspectiva, desgarros físicos y decoloración por envejecimiento; 2 184 páginas de formularios etiquetadas directamente a partir de la geometría de widgets AcroForm; y 6 821 páginas etiquetadas mediante un extractor vectorial determinista. Los datos proceden de DocLayNet (CDLA-Permissive-1.0) y de documentos de dominio público federal de EE. UU., como formularios de IRS y informes técnicos de NASA.

## Capacidades

- Detección de 15 tipos de regiones documentales: texto, encabezamiento, lista, tabla, imagen, pie de imagen, fórmula, cabecera, pie de página, nota al pie, sello, formulario, campo, casilla de verificación y firma.
- Generación de 8 señales de condición de página: inclinación, desenfoque, ruido, sangrado, deformación, desgarros, presencia de escritura a mano y presencia de capa OCR nativa en escaneos.
- Rendimiento específico para páginas dañadas, escaneadas o fotografiadas, donde supera a YOLOv8n-DocLayNet en mAP@50-95 (0.449 frente a 0.194) con un 71% del tamaño de ese modelo.
- Salidas con forma compatible con YOLOv8, lo que facilita la integración en pipelines existentes.
- Formato ONNX, por lo que se puede ejecutar en CPU mediante onnxruntime, en el navegador con onnxruntime-web o en cualquier entorno compatible con ONNX.
- Soporte de campo `evidence` para señales de página deterministas opcionales, reservado para uso futuro.
- Capacidad de funcionar sin GPU, con un peso total de 8.77 MB.

## Casos de uso

- Digitalización de archivos históricos: el modelo detecta desgarros, sangrado de tinta y desenfoque en páginas antiguas dañadas, permitiendo priorizar la restauración digital o la retirada de páginas no legibles.
- Preprocesamiento de OCR en flujos documentales: identifica regiones de texto y señales de degradación para decidir si una página necesita corrección geométrica o de contraste antes de enviarla a un motor OCR.
- Análisis de formularios escaneados: localiza campos, casillas de verificación y firmas en formularios de dominio público como los de IRS, facilitando la extracción de datos en procesos de tramitación automática.
- Control de calidad de escaneos masivos: la salida de señales de condición de página permite filtrar automáticamente imágenes de baja calidad en tiempo real, sin intervención humana.
- Indexación y búsqueda en repositorios documentales: la detección de tablas, figuras, títulos y pies de imagen permite segmentar documentos para su indexación por tipo de contenido.
- Aplicaciones web de análisis de documentos sin servidor: al ser ONNX y de 8.77 MB, el modelo puede ejecutarse directamente en el navegador mediante onnxruntime-web, ofreciendo análisis de layout sin subir datos a un backend.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación sobre un conjunto de 120 páginas degradadas. Se comparan los valores de mAP@50-95 en páginas degradadas y limpias frente al modelo de referencia YOLOv8n-DocLayNet. También se reporta el AP específico para campos de formularios y el número de señales de condición de página.

| Metrica | docforensics-layout-s | YOLOv8n-DocLayNet |
|---|---:|---:|
| Tamano | 8.77 MB | 12.27 MB |
| mAP@50-95 en paginas degradadas | 0.449 | 0.194 |
| mAP@50-95 en paginas limpias | 0.477 | 0.660 |
| AP en campos de formularios | 0.670 | No hay clase |
| Numero de senales de condicion de pagina | 8 | Ninguna |

En el conjunto degradado, el modelo devolvió más regiones que el baseline en 104 de 120 páginas. El baseline no devolvió ninguna región en 14 de ellas, mientras que el modelo de Ginexys devolvió al menos cinco regiones en una página desenfocada de ejemplo.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. El modelo completo pesa 8.77 MB y está pensado para ejecutarse en CPU.
- GPU recomendadas: ninguna específica. Es viable en cualquier sistema con CPU compatible con ONNX Runtime.
- Compatibilidad con GPU de consumo: no aplicable, al no necesitar aceleración gráfica.
- Opciones de despliegue: onnxruntime, onnxruntime-web, cualquier runtime ONNX. No es aplicable a vLLM, llama.cpp ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tamano | mAP@50-95 degradado | mAP@50-95 limpio | Licencia |
|---|---|---|---|---|
| docforensics-layout-s | 8.77 MB | 0.449 | 0.477 | Docforensics-dual (AGPL-3.0 o comercial) |
| YOLOv8n-DocLayNet | 12.27 MB | 0.194 | 0.660 | no disponible |

La comparación se limita a los datos reportados por el autor. YOLOv8n-DocLayNet es superior en páginas limpias de alta calidad, mientras que docforensics-layout-s ofrece un rendimiento claramente superior en páginas degradadas y añade capacidades que el baseline no tiene.

## Limitaciones y advertencias

- En páginas limpias, de origen digital y alta calidad, el rendimiento es inferior al de YOLOv8n-DocLayNet (0.477 frente a 0.660). Para ese tipo de entrada conviene usar el modelo de referencia.
- En páginas de revistas con muchas imágenes, como una página ilustrada de 1959, el modelo detecta menos regiones que el baseline (10 frente a 17), separando de forma menos fina paneles publicitarios y pies de imagen.
- Las casillas de verificación a 640 px tienen un AP de 0.153, por debajo del stride ancla más fino. Para formularios de origen digital se recomienda leerlas directamente desde los widgets AcroForm del PDF.
- La licencia es dual: AGPL-3.0 o licencia comercial. El uso en proyectos privados o sin obligación de copyleft requiere una licencia comercial de Ginexys.
- No se han publicado benchmarks sobre extracción de contenido o comparaciones con modelos de Document Intelligence de Azure u otras alternativas comerciales.
- El modelo no realiza OCR ni extracción de texto; solo proporciona bounding boxes de regiones y señales de condición de página.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ginexys/docforensics-layout
- Repositorio de ejemplos del autor: https://github.com/carnworkstudios/docforensics/tree/main/examples
- Contacto comercial: contact@ginexys.com
- Contacto de cumplimiento de licencia: legal@ginexys.com
