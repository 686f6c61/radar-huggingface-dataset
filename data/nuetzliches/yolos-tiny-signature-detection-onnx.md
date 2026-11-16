# nuetzliches/yolos-tiny-signature-detection-onnx

## Resumen
YOLOS-tiny signature detection ONNX es una conversión al formato ONNX del modelo `mdefrance/yolos-tiny-signature-detection`, un detector de objetos especializado en localizar firmas manuscritas en imágenes de documentos. El modelo original parte de la arquitectura YOLOS-tiny de `hustvl` y fue ajustado por `mdefrance` sobre el conjunto de datos `tech4humans/signature-detection`, construido a partir de Tobacco800 y del dataset de Roboflow `signatures-xc8up`. Esta versión, publicada por `nuetzliches`, mantiene los pesos sin cambios y solo altera el formato para facilitar su despliegue en entornos de inferencia basados en ONNX Runtime.

La relevancia de esta ficha radica en su carácter práctico: no se trata de un modelo generativo ni de propósito general, sino de un componente de visión por computador de dominio muy específico, pensado para integrarse en pipelines de anonimización o redacción documental. De hecho, el autor lo utiliza como detector de firmas dentro de `veilq` (ADR-0048), una herramienta que localiza firmas y las cubre con un rectángulo negro antes de publicar o procesar documentos.

Con aproximadamente 6 millones de parámetros (arquitectura YOLOS-tiny), una entrada fija de 640×640 píxeles y una salida de hasta 100 detecciones, el modelo es extremadamente ligero y apto para ejecución en CPU. Su licencia Apache-2.0 y su formato ONNX lo convierten en una pieza reutilizable en aplicaciones de gestión documental, cumplimiento normativo y protección de datos personales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOS-tiny (Vision Transformer para detección de objetos, basado en DETR) |
| Parámetros totales | no disponible (YOLOS-tiny, del orden de 6 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 640×640) |
| Tipos de cuantización | no disponible (el repositorio contiene pesos ONNX en precisión original) |
| Idiomas soportados | no disponible (no procesa texto; solo imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, `model.onnx`) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura YOLOS (You Only Look at One Sequence), un transformer de visión que adapta el esquema de detección de DETR a un backbone tipo ViT. La variante "tiny" reduce el número de capas y dimensiones ocultas para minimizar el coste computacional. La entrada es un tensor `pixel_values` de forma `[1, 3, 640, 640]` en float32, con valores RGB normalizados a 0..1 y estandarizados con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`. La salida consta de dos tensores: `logits` de forma `[1, 100, 2]` (probabilidades softmax para las clases "firma" y "nada") y `pred_boxes` de forma `[1, 100, 4]` (centro x, centro y, ancho y alto, expresados como fracciones del tamaño de entrada).

El entrenamiento original fue realizado por `mdefrance` mediante fine-tuning de `hustvl/yolos-tiny` sobre el dataset `tech4humans/signature-detection`, que combina imágenes de Tobacco800 y del conjunto `signatures-xc8up` de Roboflow. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un detector). La conversión a ONNX fue realizada por `nuetzliches` con torch 2.15.0 (CPU) y transformers 4.57.6, y el proceso es reproducible: las mismas versiones generan el mismo archivo, cuyo SHA-256 es `d6d5bf2b9ddba9888e77846507a3da90bfd11b113a9556deaebaf132a42a5f7c`.

## Capacidades
- Detección de firmas manuscritas en imágenes de documentos, con localización mediante cajas delimitadoras.
- Salida de hasta 100 detecciones por imagen, cada una con su puntuación de confianza (clase "firma" frente a "nada").
- Procesamiento de imágenes RGB redimensionadas a 640×640 píxeles.
- Inferencia en formato ONNX, compatible con ONNX Runtime y otros motores que soporten opset 17.
- No realiza verificación ni comparación de firmas: solo indica dónde se encuentra una firma.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión general, audio ni otras capacidades generativas.

## Casos de uso
- Anonimización de documentos antes de su publicación: el modelo localiza las firmas manuscritas y un postprocesado las cubre con un rectángulo negro, como hace `veilq` en su flujo de redacción documental.
- Cumplimiento del RGPD en digitalización de archivos: detección automática de firmas para su eliminación o seudonimización en procesos de escaneo masivo.
- Gestión documental en notarías y despachos legales: identificación de páginas que contienen firmas para su clasificación o indexación.
- Automatización de flujos de contratos: extracción de regiones con firma para su revisión humana o para su inclusión en sistemas de archivo electrónico.
- Preprocesado en pipelines de OCR: detección y exclusión de zonas con firma para evitar que los motores de reconocimiento de texto interpreten trazos manuscritos como caracteres.
- Moderación de contenido en plataformas de documentos compartidos: detección de firmas en imágenes subidas por usuarios para aplicar políticas de privacidad.
- Investigación en visión por computador: modelo de referencia ligero para experimentos de detección de objetos en dominios documentales con recursos limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en FP32, dado el reducido tamaño del modelo (YOLOS-tiny, del orden de 6 M de parámetros) y la entrada fija de 640×640.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como NVIDIA GTX 1650, RTX 3050 o superiores son suficientes. También puede ejecutarse en CPU con ONNX Runtime.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con soporte ONNX.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT (previa conversión), OpenVINO (previa conversión), y cualquier runtime compatible con ONNX opset 17. No se proporcionan archivos GGUF ni formatos para llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| nuetzliches/yolos-tiny-signature-detection-onnx | ~6 M (YOLOS-tiny) | Imagen 640×640 | Detección de firmas | Apache-2.0 | ONNX |
| mdefrance/yolos-tiny-signature-detection | ~6 M (YOLOS-tiny) | Imagen 640×640 | Detección de firmas | Apache-2.0 | PyTorch (safetensors/bin) |
| hustvl/yolos-tiny | ~6 M (YOLOS-tiny) | Imagen 800×1333 (configuración original) | Detección de objetos genérica (COCO) | Apache-2.0 | PyTorch |
| tech4humans/signature-detection (dataset) | no aplica | no aplica | Conjunto de datos para detección de firmas | no disponible | no aplica |

La comparativa se limita a variantes del mismo modelo base y al dataset de origen, ya que no se dispone de información sobre otros detectores de firmas específicos en la documentación proporcionada.

## Limitaciones y advertencias
- El modelo confunde texto de marca de agua diagonal de gran tamaño con firmas, según las pruebas realizadas por `veilq` (incidencia nuetzliches/veilq#80).
- No verifica ni compara firmas: solo detecta su ubicación; no es adecuado para autenticación forense.
- Puede fallar en firmas muy pequeñas, poco contrastadas o en documentos con ruido extremo; no se han publicado métricas de precisión y recall.
- No se han documentado sesgos específicos, pero al entrenarse sobre Tobacco800 y `signatures-xc8up`, puede tener un rendimiento desigual según el tipo de documento, la caligrafía o la calidad de la imagen.
- Riesgo de alucinación en el sentido de falsos positivos: el modelo puede detectar regiones que no son firmas (como marcas de agua o sellos).
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset de origen pueden tener sus propias condiciones; se recomienda revisar las licencias de `mdefrance/yolos-tiny-signature-detection` y de `tech4humans/signature-detection`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- La fecha de creación indicada (2026-11-16) es futura respecto a la fecha habitual de consulta; verificar la vigencia del repositorio.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/nuetzliches/yolos-tiny-signature-detection-onnx)
- [Modelo base en Hugging Face](https://huggingface.co/mdefrance/yolos-tiny-signature-detection)
- [Modelo YOLOS-tiny original](https://huggingface.co/hustvl/yolos-tiny)
- [Dataset tech4humans/signature-detection](https://huggingface.co/datasets/tech4humans/signature-detection)
- [Repositorio veilq](https://github.com/nuetzliches/veilq)
- [Incidencia nuetzliches/veilq#80](https://github.com/nuetzliches/veilq/issues/80)
