# mradermacher/LibreGLMOCR0.9b-GGUF

## Resumen

LibreGLMOCR0.9b es un modelo de visión-lenguaje (VLM) especializado en OCR y parsing de documentos, desarrollado originalmente por LibreYOLO y distribuido en formato GGUF por mradermacher. Con 891 millones de parámetros (aproximadamente 0,9B), el modelo está diseñado para tareas de extracción de texto, análisis de layout, tablas y fórmulas matemáticas a partir de imágenes de documentos, con salida en formato imagen-texto-a-texto.

La relevancia de este modelo radica en su tamaño reducido, que lo hace apto para despliegue en hardware modesto, incluso en GPUs de consumo, manteniendo capacidades específicas de document AI. La versión GGUF de mradermacher facilita su ejecución con llama.cpp y herramientas compatibles, con cuantizaciones que van desde 0,5 GB (Q2_K) hasta 1,9 GB (f16), lo que permite integrarlo en pipelines de procesamiento documental con requisitos de memoria muy bajos.

El modelo base es LibreYOLO/LibreGLMOCR0.9b, con licencia dual MIT y Apache 2.0, y soporte exclusivo para inglés según la información disponible. La fecha de creación del repositorio GGUF es del 6 de noviembre de 2026, y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (VLM basado en transformers, con componente multimodal mmproj) |
| Parámetros totales | 891.138.048 (aproximadamente 0,9B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT y Apache 2.0 (dual) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Por los tags y la pipeline declarada (image-text-to-text), se trata de un modelo de visión-lenguaje que combina un codificador visual con un decodificador de lenguaje, e incluye un componente multimodal separado (mmproj) en la versión GGUF. El nombre "GLM" sugiere una posible relación con la familia GLM, pero no se confirma en la documentación disponible.

Tampoco se especifican los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio GGUF es una plantilla estándar de mradermacher para cuantizaciones estáticas, sin detalles adicionales sobre el entrenamiento del modelo original.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de documentos (document-parse) con extracción estructurada de contenido.
- Análisis de layout: identificación de regiones, bloques y estructura del documento.
- Extracción de tablas.
- Reconocimiento y extracción de fórmulas matemáticas.
- Procesamiento imagen-texto-a-texto (image-text-to-text).
- Conversacional (tag "conversational").
- Compatible con endpoints (tag "endpoints_compatible").

No se confirma en la información disponible soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede extraer texto y estructuras de tablas de imágenes de facturas, adecuado por su especialización en document-parse y su reducido tamaño para procesamiento por lotes en servidores modestos.
- Extracción de tablas en informes financieros: gracias a su capacidad específica de reconocimiento de tablas, se puede usar para convertir tablas en imágenes a formatos estructurados en pipelines de análisis de datos.
- Procesamiento de artículos científicos: la capacidad de reconocer fórmulas matemáticas permite extraer ecuaciones de PDFs escaneados o imágenes de publicaciones, útil en bases de conocimiento técnico.
- Análisis de layout en documentos históricos o escaneados: el modelo identifica regiones y bloques, lo que facilita la segmentación previa a otros procesos de OCR o indexación.
- Automatización de entrada de datos en back-office: con cuantizaciones Q4_K_M de 0,6 GB, se puede desplegar en GPUs de consumo para digitalizar formularios y documentos administrativos en inglés.
- Integración en pipelines de RAG documental: al convertir imágenes de documentos en texto estructurado, alimenta sistemas de recuperación aumentada con contenido extraído de PDFs escaneados.
- Procesamiento en el edge o en dispositivos con poca VRAM: la versión Q2_K (0,5 GB) permite ejecutar OCR en entornos con recursos limitados, aunque con menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,7 GB para cuantizaciones Q2_K a Q4_K_M; 0,8 GB para Q6_K; 1,1 GB para Q8_0; 1,9 GB para f16. Hay que añadir el componente mmproj (0,6 GB en Q8_0 o 1,0 GB en f16) para el procesamiento multimodal.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre puede ejecutar las cuantizaciones más pequeñas; para f16 con mmproj f16 se recomiendan 4 GB o más.
- Cabe en GPU de consumo: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 y superiores, así como en iGPUs con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se importa el GGUF), y otras herramientas compatibles con GGUF. Para el modelo base en safetensors, transformers con soporte de image-text-to-text.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LibreGLMOCR0.9b (este) | 0,89B | no disponible | MIT/Apache 2.0 | GGUF, safetensors | OCR y parsing documental, solo inglés |
| mradermacher/realocr-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | OCR y document-parsing, multilingüe según tags |
| Otros VLM de OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación con realocr-GGUF es limitada porque no se dispone de sus parámetros ni benchmarks. No se han identificado en la información proporcionada otros modelos comparables de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Soporte exclusivo de inglés: no se confirma capacidad multilingüe, lo que limita su uso en documentos en castellano u otros idiomas.
- Riesgo de alucinación: como todo VLM generativo, puede producir texto o estructuras inexistentes en la imagen, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S).
- Las cuantizaciones por debajo de Q4 pueden degradar notablemente la calidad de OCR y la precisión en tablas y fórmulas.
- No se dispone de información sobre sesgos conocidos del modelo base.
- Licencia dual MIT y Apache 2.0: permite uso comercial, pero se recomienda revisar los términos exactos del archivo LICENSE del modelo base.
- El repositorio GGUF no incluye quants ponderados/imatrix, solo cuantizaciones estáticas, lo que puede afectar la calidad en comparación con quants optimizados.
- No se especifica la longitud de contexto, lo que impide garantizar el procesamiento de documentos de gran tamaño en una sola pasada.
- El modelo tiene 0 descargas y 0 likes, sin validación comunitaria disponible.
- No se han publicado benchmarks, por lo que el rendimiento real en producción no está verificado de forma independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LibreGLMOCR0.9b-GGUF
- Modelo base: https://huggingface.co/LibreYOLO/LibreGLMOCR0.9b
- Página de descargas de mradermacher: https://hf.tst.eu/model#LibreGLMOCR0.9b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de comparación de quants: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Análisis de Artefact2 sobre quants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
