# nile-academy/granite-docling-258m

## Resumen
granite-docling-258m es un espejo de datos del modelo OCR original de IBM, publicado por nile-academy bajo el paraguas de Nile Academy para consumidores de la plataforma Wekala. No se trata de un desarrollo propio: el repositorio preserva los checkpoints declarativos seleccionados y las model cards originales bajo el directorio `original/<source-commit>/`, remitiendo a `ibm-granite/granite-docling-258M` como fuente upstream. El modelo resuelve tareas de reconocimiento óptico de caracteres (OCR) y conversión de documentos a representaciones estructuradas.

El repositorio tiene un tamaño de 0,5 GB y contiene únicamente pesos en formato safetensors junto con los ficheros de datos de despliegue (`det/` y `rec/`), además de checkpoints de inferencia Paddle retenidos por separado de las exportaciones ONNX oficiales. La model card advierte explícitamente de que no se incluye código Python, checkpoints en pickle, servidores de inferencia ni código ejecutable de modelo.

La relevancia de esta ficha es doble: por un lado documenta un modelo OCR compacto de 258M de parámetros con licencia Apache 2.0; por otro, ilustra un patrón de publicación de espejos con identidades de fichero inmutables, donde la publicación verifica la integridad de los bytes pero no la calidad del OCR ni la fidelidad de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo OCR; el repositorio no detalla la arquitectura interna) |
| Parametros totales | 258M (según el nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan exportaciones ONNX oficiales y checkpoints Paddle) |
| Idiomas soportados | en (inglés); la model card advierte de que el soporte de árabe es preferente pero no un criterio de elegibilidad, y que los metadatos de idioma no establecen calidad probada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; checkpoints Paddle y exportaciones ONNX |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo. El nombre y las etiquetas (`ocr`) indican que se trata de un modelo especializado en reconocimiento óptico de caracteres, con componentes separados de detección (`det/`) y reconocimiento (`rec/`). El repositorio preserva checkpoints declarativos de Paddle y exportaciones ONNX oficiales, lo que sugiere un pipeline de OCR con etapas diferenciadas de detección de texto y reconocimiento.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original de IBM no se incluye en la información proporcionada; solo se referencia su ubicación en el repositorio upstream. La publicación del espejo verifica identidades de fichero inmutables, no la precisión del OCR ni la fidelidad de la cuantización.

## Capacidades
- Reconocimiento óptico de caracteres (OCR) sobre documentos e imágenes.
- Conversión de documentos a representaciones estructuradas (implícito en el propósito de Docling).
- Detección de texto y reconocimiento de texto como etapas separadas (`det/` y `rec/`).
- Soporte de inglés declarado en los metadatos; el árabe se menciona como preferente pero no verificado.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión general, audio ni modo de pensamiento.
- No se documenta generación de texto libre, código ni matemáticas.

## Casos de uso
- Digitalización de archivos documentales: el modelo puede procesar imágenes de documentos escaneados para extraer texto mediante sus etapas de detección y reconocimiento, adecuado por su tamaño compacto de 258M parámetros.
- Extracción de texto en pipelines de ingestión de datos: integrable como componente OCR en flujos ETL que convierten PDFs e imágenes en texto estructurado antes de indexación.
- Procesamiento de documentos en dispositivos con recursos limitados: el tamaño reducido (0,5 GB de repositorio) permite despliegue en entornos con VRAM moderada, aunque la model card no certifica el ajuste a dispositivo.
- Construcción de bases de conocimiento a partir de documentos: la salida OCR alimenta sistemas de recuperación aumentada (RAG) sobre corpus documentales en inglés.
- Preprocesamiento para pipelines de NLP: conversión de documentos físicos a texto plano como paso previo a tareas de clasificación, extracción de entidades o resumen.
- Evaluación de espejos y procedencia de modelos: el repositorio sirve como caso de estudio para verificar identidades de fichero inmutables y preservación de licencias en publicaciones de terceros.
- Investigación en OCR multilingüe: punto de partida para evaluar el rendimiento declarado en inglés y el soporte preferente de árabe, con la advertencia de que la calidad no está verificada por la publicación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye métricas de precisión OCR, y no se proporcionan datos de la model card original de IBM.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 258M parámetros, una estimación orientativa en FP16 sería de aproximadamente 0,5 GB de pesos, pero no está confirmada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido sugiere que podría caber en GPU de consumo, pero la model card no certifica el ajuste a dispositivo.
- Opciones de despliegue: el repositorio incluye exportaciones ONNX oficiales y checkpoints Paddle, lo que permite inferencia mediante ONNX Runtime o Paddle Inference; no se incluyen servidores de inferencia ni código ejecutable.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-docling-258m (este) | 258M | no disponible | apache-2.0 | safetensors, ONNX, Paddle | Espejo de datos; sin código de inferencia |
| ibm-granite/granite-docling-258M | 258M | no disponible | apache-2.0 | no disponible | Fuente upstream del espejo |
| Alternativas OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias
- La publicación verifica identidades de fichero inmutables, no la precisión del OCR, la fidelidad de la cuantización ni la aceptación en dispositivos de escritorio, móvil o navegador.
- Los modelos no se distribuyen con el núcleo de Wekala; los consumidores deben aportar activos aprobados a adaptadores compilados cualificados.
- El soporte de árabe es preferente pero nunca un criterio de elegibilidad del modelo; los metadatos de idioma no establecen calidad probada en ningún idioma.
- No se incluye código Python, checkpoints en pickle, servidores de inferencia ni código ejecutable de modelo; el consumidor debe aportar su propio motor de inferencia.
- No hay mecanismo de respaldo en la nube seleccionado.
- Riesgo de sesgos y alucinación: no documentado en la información disponible; al ser un modelo OCR, el riesgo principal es de errores de reconocimiento, no de generación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el `LICENSE` del espejo retiene el fichero upstream cuando se suministró; en caso contrario contiene el texto estándar de la declaración del publicador. El código del motor y los activos convertidos requieren registros separados.
- La fecha de creación del repositorio (2026-11-02) y el contador de descargas (0) indican que se trata de una publicación reciente sin validación comunitaria.

## Enlaces
- Repositorio del espejo: https://huggingface.co/nile-academy/granite-docling-258m
- Fuente upstream: https://huggingface.co/ibm-granite/granite-docling-258M/tree/982fe3b40f2fa73c365bdb1bcacf6c81b7184bfe
- Modelo upstream (raíz): https://huggingface.co/ibm-granite/granite-docling-258M
