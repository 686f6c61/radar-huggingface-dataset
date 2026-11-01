# kittypdf/DocAligner-ONNX

## Resumen

DocAligner-ONNX es un espejo de pesos del modelo DocAligner desarrollado por DocsaidLab, convertidos a formato ONNX y publicados por el usuario kittypdf para su uso en el escaneo de documentos de BaiMiao. No se trata de un modelo de lenguaje ni de un modelo generativo: es un modelo de visión por computador especializado en la detección de esquinas de documentos, es decir, localiza los cuatro vértices de una hoja de papel en una imagen para permitir su posterior rectificación y mejora.

El repositorio incluye dos variantes del modelo: una basada en el backbone LCNet100 (aproximadamente 4,7 MB) y otra basada en FastViT-SA24 (aproximadamente 83 MB). Ambas producen mapas de calor (heatmaps) que indican la posición de las esquinas del documento. La mejora o realce del documento se realiza en una etapa separada, por lo que este modelo cubre únicamente la fase de detección geométrica.

La relevancia de esta publicación es acotada: se trata de un mirror de pesos sin modificaciones, con licencia Apache 2.0 y hashes SHA-256 fijados en un `manifest.json` para garantizar la reproducibilidad. No hay información sobre datos de entrenamiento, benchmarks ni idiomas, ya que el modelo no procesa texto. Su interés práctico reside en pipelines de digitalización documental que necesiten un detector de esquinas ligero y desplegable en formato ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos variantes: LCNet100 y FastViT-SA24 (backbones de visión, salida en heatmap) |
| Parametros totales | no disponible (tamaños de archivo: 4.767.987 bytes y 83.084.930 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`docaligner-lcnet100.onnx`, `docaligner-fastvit-sa24.onnx`) |

## Arquitectura y entrenamiento

El modelo es un detector de esquinas de documentos basado en dos backbones de visión: LCNet100, una red convolucional ligera, y FastViT-SA24, una arquitectura híbrida de convoluciones y atención. La salida es un mapa de calor (heatmap) que codifica la probabilidad de localización de las cuatro esquinas del documento en la imagen de entrada. Esta arquitectura de heatmap es habitual en tareas de detección de puntos clave y permite una localización subpíxel tras aplicar operaciones de argmax o soft-argmax.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de imágenes, la composición del dataset ni si se aplicaron técnicas de aumento de datos o ajuste fino. El autor indica que los pesos son «unmodified» respecto al repositorio upstream de DocsaidLab, por lo que cualquier detalle de entrenamiento debería consultarse en dicho repositorio. La innovación técnica destacable es la conversión a ONNX, que facilita el despliegue en entornos de inferencia multiplataforma sin dependencia de frameworks de deep learning concretos.

## Capacidades

- Detección de las cuatro esquinas de un documento en una imagen.
- Generación de mapas de calor (heatmaps) para localización de puntos clave.
- Dos variantes con distinto compromiso entre tamaño y capacidad: LCNet100 (ligera) y FastViT-SA24 (mayor capacidad).
- Ejecución mediante runtime ONNX, sin necesidad de PyTorch en producción.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye visión generativa ni descripción de imágenes; solo localización geométrica.

## Casos de uso

- Digitalización de documentos con móvil: el modelo detecta las esquinas de la hoja en la foto y permite aplicar una transformación de perspectiva para obtener una imagen rectificada antes del OCR.
- Escaneo por lotes en servidores: la variante LCNet100, por su bajo tamaño, puede procesar grandes volúmenes de imágenes en CPU mediante ONNX Runtime con un coste computacional reducido.
- Preprocesado en pipelines de OCR: integrado como primer paso antes de motores como Tesseract o PaddleOCR, mejora la alineación del texto y reduce errores de reconocimiento.
- Aplicaciones móviles de escaneo: la variante ligera puede ejecutarse en dispositivos con recursos limitados gracias a su tamaño de menos de 5 MB y a la portabilidad de ONNX.
- Verificación de calidad en captura de documentos: si el heatmap no alcanza un umbral de confianza, el sistema puede solicitar al usuario una nueva foto antes de continuar.
- Automatización de archivo documental: detección y recorte automático de documentos en flujos de digitalización masiva de archivos administrativos o históricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; ambos modelos son pequeños (4,7 MB y 83 MB) y pueden ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime (por ejemplo, CUDA) puede acelerar la inferencia, incluidas RTX 3060 o superiores.
- Cabe en GPU de consumo: sí, ambas variantes caben holgadamente en cualquier GPU de consumo, e incluso en memoria de sistema para ejecución en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), así como otros runtimes compatibles con ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DocAligner-ONNX (LCNet100) | Detector de esquinas (CNN) | ~4,7 MB | no aplica | Apache 2.0 | HuggingFace |
| DocAligner-ONNX (FastViT-SA24) | Detector de esquinas (híbrido) | ~83 MB | no aplica | Apache 2.0 | HuggingFace |
| DocsaidLab DocAligner (upstream) | Detector de esquinas | no disponible | no aplica | no disponible en esta ficha | GitHub |
| Alternativas genéricas de detección de documentos | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros detectores de esquinas, por lo que la comparativa se limita a parámetros de tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo detecta esquinas; no realiza corrección de perspectiva, realce, binarización ni OCR por sí mismo.
- No hay información publicada sobre sesgos, dominios de entrenamiento ni robustez ante condiciones adversas (iluminación, fondos complejos, documentos curvados).
- Riesgo de fallo en documentos con esquinas ocultas, recortadas o con bajo contraste; no se documentan métricas de tolerancia.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución indicada en `LICENSE` y `NOTICE.txt`.
- Al ser un mirror sin modificaciones, la responsabilidad sobre la calidad de los pesos recae en el repositorio upstream de DocsaidLab.
- No se especifican requisitos de preprocesado (resolución de entrada, normalización), lo que puede afectar a la reproducibilidad si no se consulta el código upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/kittypdf/DocAligner-ONNX
- Repositorio upstream: https://github.com/DocsaidLab/DocAligner
