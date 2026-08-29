# MikeXue/PaddleOCR-VL-1.6

## Resumen

PaddleOCR-VL-1.6 es un modelo de visión-lenguaje (VLM) especializado en el parseo de documentos, desarrollado por el equipo de PaddleOCR (PaddlePaddle). Su objetivo es extraer de forma estructurada información de documentos complejos: texto, tablas, fórmulas, gráficos, sellos y layouts. Es la evolución de PaddleOCR-VL-1.5, con mejoras centradas en regiones del documento que el modelo anterior optimizaba de forma deficiente, aplicando una estrategia de post-entrenamiento progresivo en tres etapas.

Con aproximadamente 0,96 mil millones de parámetros (958.588.736), es un modelo compacto que alcanza un 96,33% de precisión en el benchmark OmniDocBench v1.6, superando según sus desarrolladores a todas las soluciones open source y propietarias en parseo estructurado de documentos. Está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

El modelo se distribuye a través de HuggingFace y ModelScope, con pesos en formato safetensors, y está diseñado para tareas de image-to-text e image-text-to-text, incluyendo capacidades conversacionales sobre documentos. Su tamaño reducido lo hace viable para despliegue en GPUs de consumo, aunque no se han publicado requisitos de hardware oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), basado en ERNIE4.5 (según tags del modelo) |
| Parametros totales | 958.588.736 (~0,96B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PaddleOCR-VL-1.6 es un modelo de visión-lenguaje (VLM) que combina un codificador visual con un decodificador de lenguaje, siguiendo la arquitectura típica de los modelos image-to-text. Según los tags del repositorio, utiliza el backbone ERNIE4.5, aunque no se han publicado detalles técnicos completos sobre la arquitectura interna (número de capas, dimensiones, mecanismo de atención, etc.).

El entrenamiento parte de los pesos de PaddleOCR-VL-1.5 y aplica una estrategia de post-entrenamiento en tres etapas, según la documentación oficial: pre-entrenamiento continuado, ajuste fino supervisado (SFT) y aprendizaje por refuerzo (RL). Esta progresión se adapta a la calidad de los datos en cada fase, con el objetivo de refinar regiones del documento que el modelo anterior no optimizaba correctamente. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- OCR (reconocimiento óptico de caracteres) sobre imágenes y documentos escaneados.
- Parseo de documentos completos: extracción de layout, tablas, fórmulas, gráficos y sellos.
- Detección y reconocimiento de texto en escenas (spotting).
- Comprensión conversacional de documentos: el modelo puede responder preguntas sobre el contenido de una imagen o PDF (image-text-to-text).
- Soporte multilingüe, con especial énfasis en inglés y chino, y capacidad multilingüe general.
- Generación de texto estructurado a partir de documentos, útil para downstream tasks como extracción de datos o indexación.
- No se ha confirmado soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Digitalización de facturas y recibos: el modelo extrae automáticamente campos como importes, fechas, números de factura y proveedor, generando datos estructurados listos para integrar en sistemas de contabilidad o ERP.
- Parseo de artículos científicos: convierte PDFs de papers en texto estructurado con tablas y fórmulas preservadas, facilitando la creación de bases de datos de conocimiento o motores de búsqueda académica.
- Automatización de procesos de onboarding documental: en banca o seguros, extrae información de DNI, contratos o formularios escaneados, reduciendo la intervención manual.
- Chat sobre documentos internos: integrado en un asistente conversacional, permite a empleados preguntar por el contenido de manuales, políticas o informes sin necesidad de leerlos completos.
- Indexación de archivos históricos: digitaliza documentos antiguos (periódicos, actas, expedientes) convirtiéndolos en texto buscable, con detección de sellos y layouts complejos.
- Extracción de datos de gráficos y tablas en informes financieros: el modelo identifica y transcribe tablas y gráficos de informes anuales o trimestrales, permitiendo su análisis cuantitativo posterior.
- Preprocesado para RAG (Retrieval-Augmented Generation): al convertir documentos en texto estructurado y limpio, mejora la calidad de los chunks que se indexan en bases vectoriales para sistemas de pregunta-respuesta.

## Benchmarks y rendimiento

Según la documentación oficial de PaddleOCR, el modelo alcanza un 96,33% de precisión en el benchmark OmniDocBench v1.6, superando a todas las soluciones open source y propietarias en parseo estructurado de documentos. No se han publicado resultados detallados para otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Resultado |
|---|---|
| OmniDocBench v1.6 | 96,33% de precisión |

No se dispone de comparaciones numéricas con otros modelos en la información proporcionada.

## Requisitos de hardware

- Al tratarse de un modelo de ~0,96B parámetros (tamaño de repo 1,9 GB), es viable en GPUs de consumo con al menos 8 GB de VRAM para inferencia en precisión FP16, aunque no se han publicado requisitos oficiales.
- GPUs recomendadas: RTX 3060/4060 (12 GB) o superiores para inferencia cómoda; GPUs de datacenter como A10, A100 o H100 para despliegues de alto throughput.
- No se han publicado datos de latencia ni throughput.
- Opciones de despliegue: al ser un modelo PaddlePaddle, se integra nativamente con PaddleOCR y PaddleInference. También puede exportarse a ONNX para su uso con otros runtimes. No se ha confirmado soporte para vLLM, llama.cpp u Ollama en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| PaddleOCR-VL-1.6 | ~0,96B | no disponible | Apache 2.0 | Parseo de documentos, OCR, tablas, fórmulas |
| PaddleOCR-VL-1.5 | no disponible | no disponible | Apache 2.0 | Predecesor, misma familia |
| Florence-2 (base) | 0,23B | no disponible | MIT | Tareas visuales generales, OCR básico |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparativa se limita a características generales.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos conocidos ni evaluación de sesgos en la información disponible.
- Al ser un modelo especializado en documentos, puede tener un rendimiento inferior en tareas visuales generales o en dominios muy alejados de los datos de entrenamiento.
- Riesgo de alucinación en la generación de texto conversacional, especialmente en respuestas sobre documentos ambiguos o de baja calidad.
- La longitud de contexto no está publicada, por lo que documentos muy extensos pueden requerir particionado.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de PaddlePaddle y de pesos basados en ERNIE4.5; conviene verificar las condiciones de uso del backbone subyacente.
- No se ha confirmado soporte para cuantizaciones (GGUF, AWQ, etc.), lo que puede limitar su despliegue en entornos con restricciones de memoria.
- El repositorio de HuggingFace (MikeXue/PaddleOCR-VL-1.6) no es el oficial; el modelo canónico está publicado bajo PaddlePaddle/PaddleOCR-VL-1.6.

## Enlaces

- Modelo en HuggingFace (autor MikeXue): https://huggingface.co/MikeXue/PaddleOCR-VL-1.6
- Modelo oficial en HuggingFace: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Modelo en ModelScope: https://modelscope.cn/models/PaddlePaddle/PaddleOCR-VL-1.6
- Documentación oficial de PaddleOCR-VL-1.6: https://www.paddleocr.ai/main/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL-1.6.html
- Repositorio de PaddleOCR en GitHub: https://github.com/PaddlePaddle/PaddleOCR
- Web de PaddleOCR: https://paddleocr.dev/
