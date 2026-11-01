# Kiznavierr/koharu-layout-rfdetr-seg-2xl-1152-onnx-fp16

## Resumen

KoharuLayout RF-DETR Seg 2XL 1152 en formato ONNX FP16 es una conversión del modelo de segmentación de instancias `mayocream/koharu-layout-rfdetr-seg-2xl-1152`, desarrollado originalmente para el análisis de maquetación (layout analysis) de páginas de manga. El modelo detecta y segmenta cuatro clases de elementos: texto, onomatopeyas, bocadillos de diálogo y viñetas (paneles). No realiza OCR ni predicción del orden de lectura; su función es exclusivamente la localización y segmentación de regiones sobre la imagen de la página.

La relevancia de esta versión concreta reside en su empaquetado: un grafo ONNX de precisión FP16 con entrada de forma fija `[1, 3, 1152, 1152]` y salidas `dets [1, 300, 4]`, `labels [1, 300, 5]` y `masks [1, 300, 288, 288]`, validado con ONNX Runtime usando `CUDAExecutionProvider` frente a una referencia FP32 en `CPUExecutionProvider`. Esto facilita el despliegue en pipelines de inferencia acelerada por GPU sin necesidad de cargar frameworks de entrenamiento.

El modelo se basa en la arquitectura RF-DETR (Real-Time Detection Transformer) en su variante Seg 2XL a resolución 1152×1152, orientada a detección y segmentación en tiempo real. El repositorio ocupa aproximadamente 0,1 GB y está publicado con licencia `other`, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg 2XL (Real-Time Detection Transformer con cabeza de segmentación de instancias) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1152 × 1152 píxeles) |
| Tipos de cuantizacion | FP16 (conversión desde FP32 mediante `onnxruntime.transformers.float16.convert_float_to_float16`) |
| Idiomas soportados | no disponible (modelo de visión sin capacidades lingüísticas; entrenado sobre manga, presumiblemente japonés) |
| Licencia | other (licencia personalizada del repositorio fuente; RF-DETR software bajo Apache-2.0, datos Manga109 bajo términos académicos) |
| Formato de pesos | ONNX (opset 17, FP16, batch fijo 1) |

## Arquitectura y entrenamiento

El modelo es un RF-DETR en configuración Seg 2XL, un transformer de detección en tiempo real con cabeza de segmentación de instancias. Procesa imágenes a resolución fija de 1152×1152 y produce hasta 300 detecciones, cada una con caja delimitadora (`dets`), distribución de clase sobre 5 etiquetas (`labels`, incluyendo fondo) y máscara de instancia de 288×288 (`masks`). La conversión a ONNX FP16 preserva esta topología con batch fijo de 1 y opset 17, y ha superado la validación del ONNX checker.

No se dispone de información detallada sobre el número de parámetros, el volumen de tokens de entrenamiento ni la composición exacta del dataset en la documentación proporcionada. La model card indica que el modelo fuente fue ajustado (fine-tuned) utilizando imágenes de Manga109, un corpus distribuido por separado bajo términos de uso académico. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo puramente visual de detección y segmentación.

La innovación técnica destacable de esta publicación es la conversión a FP16 validada numéricamente: se comparó el grafo FP32 en CPU con el FP16 en CUDA usando la misma entrada de forma fija. La model card advierte que los logits crudos de las máscaras pueden mostrar diferencias numéricas mayores que las cajas o los logits de clase, por lo que recomienda evaluar el rendimiento comparando máscaras umbralizadas y predicciones renderizadas, no el error absoluto de los logits de máscara.

## Capacidades

- Detección de objetos sobre páginas de manga: devuelve cajas delimitadoras para cada región detectada.
- Segmentación de instancias: genera máscaras por instancia de 288×288 para cada detección.
- Clasificación en cuatro clases: `text` (texto), `onomatopoeia` (onomatopeya), `bubble` (bocadillo) y `panel` (viñeta).
- Umbrales recomendados por clase: 0,25 para `text`, 0,20 para `onomatopoeia`, 0,50 para `bubble` y 0,50 para `panel`. El flujo recomendado es inferir con el umbral más bajo necesario y filtrar después cada predicción con el umbral de su clase.
- Procesamiento de imágenes de alta resolución: entrada fija de 1152×1152, adecuada para páginas de cómic con texto pequeño.
- No realiza OCR: no extrae texto de las regiones detectadas.
- No predice orden de lectura: no establece la secuencia narrativa de las viñetas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Digitalización y catalogación de archivos de manga: el modelo permite segmentar automáticamente páginas escaneadas en viñetas, bocadillos, texto y onomatopeyas, generando metadatos estructurados que alimentan bases de datos de archivo o sistemas de búsqueda visual.
- Preprocesado para pipelines de OCR: al aislar las regiones de texto y bocadillos con máscaras de instancia, se puede recortar cada zona y enviarla a un motor OCR especializado, mejorando la precisión al eliminar ruido de fondo y arte.
- Traducción y localización de cómics: la detección de bocadillos y texto permite identificar las regiones a sustituir por texto traducido, facilitando flujos de trabajo semiautomáticos de rotulación y maquetación multilingüe.
- Reconstrucción o retoque de páginas: las máscaras de viñetas y elementos permiten separar capas (arte, bocadillos, texto) para tareas de restauración, recoloreado o edición no destructiva.
- Análisis estructural de cómics para investigación: la extracción de la geometría de paneles y la distribución de bocadillos permite estudios cuantitativos sobre composición, ritmo visual y densidad textual en corpus de manga.
- Moderación y clasificación de contenido: la detección de paneles y texto puede integrarse en sistemas que clasifiquen o filtren páginas según su estructura, por ejemplo para separar portadas, páginas de collage o viñetas densas.
- Despliegue en servicios de inferencia en producción: al estar en ONNX FP16 con batch fijo, se puede servir con ONNX Runtime con `CUDAExecutionProvider` en GPUs de consumo o profesionales, con latencia predecible y sin dependencias de frameworks de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la validación de la conversión FP32/FP16 (comparación de grafos con ONNX Runtime, entrada `[1, 3, 1152, 1152]`, salidas `dets [1, 300, 4]`, `labels [1, 300, 5]`, `masks [1, 300, 288, 288]`, opset 17, ONNX checker superado), sin métricas de precisión tipo mAP, IoU ni latencias medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto; el pico de memoria durante la inferencia a 1152×1152 con 300 máscaras de 288×288 dependerá de la implementación y del proveedor de ejecución.
- GPU recomendadas: no disponible. La validación oficial se realizó con `CUDAExecutionProvider` de ONNX Runtime, por lo que se requiere una GPU compatible con CUDA para la ruta FP16.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el tamaño del repositorio (0,1 GB) sugiere que podría caber en GPUs de consumo, pero no hay datos de VRAM pico publicados.
- Opciones de despliegue: ONNX Runtime con `CUDAExecutionProvider` (validado por el autor) o `CPUExecutionProvider` (usado como referencia FP32). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de segmentación de layout de manga, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Las onomatopeyas son la clase más débil del modelo fuente, con menor precisión que el resto de categorías.
- Las marcas decorativas pueden generar falsos positivos.
- Las portadas y las maquetaciones de collage densas son casos difíciles para el modelo.
- El rendimiento fuera del manga japonés puede diferir del esperado; el modelo fue ajustado sobre Manga109.
- No realiza OCR ni predicción de orden de lectura; cualquier flujo que requiera texto o secuencia narrativa necesita componentes adicionales.
- Los logits crudos de las máscaras pueden presentar diferencias numéricas notables entre FP32 y FP16; la evaluación debe hacerse sobre máscaras umbralizadas y predicciones renderizadas.
- La licencia es `other`, heredada del repositorio fuente: RF-DETR es Apache-2.0, pero el modelo se ajustó con imágenes Manga109 distribuidas bajo términos de uso académico. El repositorio no concede derechos sobre las imágenes de Manga109 ni sobre contenido de cómic de terceros; el usuario es responsable de obtener los derechos necesarios y cumplir los términos aplicables.
- El uso comercial puede estar restringido por la licencia del modelo fuente y por los términos de Manga109; conviene revisar ambos antes de desplegar en producción.
- Batch fijo de 1: no admite procesamiento por lotes sin reexportar el grafo.
- Resolución fija de 1152×1152: las imágenes deben redimensionarse, lo que puede afectar a páginas con relaciones de aspecto muy distintas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de detecciones espurias en regiones ambiguas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kiznavierr/koharu-layout-rfdetr-seg-2xl-1152-onnx-fp16
- Modelo fuente: https://huggingface.co/mayocream/koharu-layout-rfdetr-seg-2xl-1152
- Revisión del modelo fuente: https://huggingface.co/mayocream/koharu-layout-rfdetr-seg-2xl-1152/commit/aed55fdb8ca953c6bec33cf6ed6dd52a9b72bfa2
