# ModernVBERT/colmodernvbert

## Resumen

ColModernVBERT es un modelo de recuperación visual de documentos (Visual Document Retrieval, VDR) desarrollado por el equipo ModernVBERT. Se trata de la versión de interacción tardía (late-interaction) de ModernVBERT, una familia de codificadores visión-lenguaje compactos de 250 millones de parámetros, ajustados específicamente para recuperar información relevante a partir de imágenes de páginas de documentos. El modelo sigue el enfoque ColPali: genera embeddings multi-vector tanto para consultas de texto como para imágenes de documentos, y calcula la similitud mediante un producto escalar máximo entre los vectores de la consulta y los del documento.

Su relevancia radica en que, con un tamaño de solo 250M de parámetros, iguala el rendimiento de modelos de recuperación visual hasta 10 veces más grandes, con una latencia de inferencia sustancialmente menor. Esto lo convierte en una opción atractiva para sistemas de RAG (Retrieval-Augmented Generation) y pipelines de búsqueda documental en producción, donde el coste computacional y la velocidad son críticos. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas, y está disponible en Hugging Face con pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visión-lenguaje con interacción tardía (ColPali-style), multi-vector |
| Parametros totales | 250 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona soporte para Flash Attention 2 con bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 0.1 GB) |

## Arquitectura y entrenamiento

ColModernVBERT se basa en ModernVBERT, un codificador visión-lenguaje de 250M de parámetros. La arquitectura utiliza un procesador de imágenes estilo Idefics3 que divide cada página en sub-parches más un parche global, y un codificador de texto para las consultas. La interacción tardía genera embeddings multi-vector: cada token de la consulta y cada parche de la imagen se proyectan a un espacio de 128 dimensiones, y la similitud se calcula como la suma de los máximos productos escalares entre los vectores de la consulta y los del documento. Este diseño permite una recuperación más granular que los bi-encoders tradicionales, manteniendo la eficiencia computacional.

El modelo fue fine-tuneado específicamente para tareas de recuperación visual de documentos, partiendo del modelo base ModernVBERT. No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados ni si se utilizaron técnicas de RLHF o DPO. Según el paper (arXiv:2510.01149), el modelo ofrece el mejor equilibrio rendimiento-tamaño en su clase, superando a otros modelos sub-1B y compitiendo con modelos de hasta 2.5B parámetros.

## Capacidades

- Recuperación visual de documentos: procesa imágenes de páginas (escaneos, capturas) y devuelve los documentos más relevantes para una consulta textual.
- Interacción tardía multi-vector: genera embeddings por token/parche, lo que permite capturar correspondencias parciales entre consulta y documento.
- Compatible con Sentence Transformers: se puede cargar como `MultiVectorEncoder` con la API `encode_query` / `encode_document` / `similarity`.
- Compatible con ColPali Engine: se integra con `ColModernVBert` y `ColModernVBertProcessor` para pipelines de recuperación.
- Soporte para Flash Attention 2: permite mayor throughput en GPUs que lo soporten.
- Inferencia en CPU: según la documentación, ofrece velocidades de inferencia interesantes en CPU en comparación con modelos de rendimiento similar.
- Procesamiento de documentos completos: maneja páginas completas como entrada, no solo fragmentos de texto.

## Casos de uso

- Búsqueda en archivos escaneados: permite indexar y buscar en PDFs escaneados o fotografías de documentos sin necesidad de OCR previo. El modelo procesa directamente la imagen y recupera las páginas relevantes para una consulta, acelerando flujos de trabajo en archivos corporativos.
- Extracción de información de facturas y recibos: dado un conjunto de facturas en formato imagen, se puede consultar "¿Cuál es el importe total de la factura del proveedor X?" y el modelo devuelve las facturas que contienen esa información, facilitando la auditoría y contabilidad.
- Recuperación de respuestas en gráficos y tablas: el modelo es capaz de localizar la página que contiene un gráfico o tabla específica a partir de una consulta descriptiva, útil en informes financieros o papers científicos.
- Sistema de preguntas y respuestas sobre documentación técnica: integrado en un pipeline RAG, permite responder preguntas sobre manuales de producto, especificaciones o normativas, utilizando las páginas recuperadas como contexto.
- Indexación de documentos legales: para despachos de abogados, permite buscar cláusulas o términos en contratos escaneados sin necesidad de convertir a texto, reduciendo el riesgo de errores de OCR.
- Automatización de atención al cliente: en un sistema de soporte, el modelo puede recuperar la página de un manual de usuario que responda a la consulta de un cliente, alimentando respuestas automáticas o asistiendo a agentes humanos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos detallados de benchmarks en la información disponible. El paper menciona que ColModernVBERT iguala el rendimiento de modelos hasta 10 veces más grandes en benchmarks de recuperación visual de documentos, pero no se proporcionan cifras concretas (como MMLU, HumanEval u otros). Se recomienda consultar el preprint en arXiv para obtener métricas específicas cuando estén disponibles.

## Requisitos de hardware

- Al ser un modelo de 250M de parámetros, el tamaño del repositorio es de solo 0.1 GB, lo que indica que es ligero y puede ejecutarse en hardware modesto.
- No se especifica la VRAM exacta necesaria, pero por su tamaño, una GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia con precisión float32. Con cuantización (si estuviera disponible) podría caber en GPUs de 2 GB.
- Se menciona soporte para Flash Attention 2, lo que requiere GPUs modernas (Ampere o posteriores, como RTX 30xx/40xx, A100, H100).
- El modelo puede ejecutarse en CPU con una latencia razonable para su tamaño, según la documentación.
- Opciones de despliegue: Sentence Transformers (con `MultiVectorEncoder`), ColPali Engine (con `ColModernVBert`), y potencialmente vLLM o TGI si se adapta, aunque no se menciona explícitamente.

## Comparativa con modelos similares

No se dispone de datos concretos sobre modelos comparables en la información proporcionada. El paper indica que ColModernVBERT supera a otros modelos sub-1B y compite con modelos de hasta 2.5B parámetros, pero no se enumeran nombres específicos ni métricas. Se recomienda consultar el preprint para una comparativa detallada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que su rendimiento en otros idiomas puede ser limitado o no estar soportado.
- No se han documentado sesgos específicos, pero al ser un modelo de recuperación, podría heredar sesgos presentes en los datos de entrenamiento (no especificados).
- Riesgo de alucinación: aunque el modelo no genera texto, las puntuaciones de similitud pueden ser poco fiables si la consulta es ambigua o el documento no contiene la información solicitada.
- La integración con `sentence_transformers.multi_vector_encoder.interpretability.get_n_patches` lanza `NotImplementedError` debido al procesador de imágenes estilo Idefics3, lo que limita las herramientas de interpretabilidad disponibles.
- La rama de ColPali Engine que soporta este modelo aún no está fusionada en el repositorio oficial, por lo que se requiere clonar el repositorio y usar una rama específica, lo que añade complejidad al despliegue.
- Licencia MIT permite uso comercial sin restricciones, pero se debe citar el trabajo si se utiliza en publicaciones.

## Enlaces

- Hugging Face: https://huggingface.co/ModernVBERT/colmodernvbert
- Paper arXiv: https://arxiv.org/abs/2510.01149
- Documentación de Transformers (ColModernVBert): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/colmodernvbert.md
- Organización ModernVBERT en Hugging Face: https://huggingface.co/ModernVBERT
