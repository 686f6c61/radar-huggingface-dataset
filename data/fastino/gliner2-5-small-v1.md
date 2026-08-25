# fastino/gliner2.5-small-v1

## Resumen

GLiNER2.5 Small V1 es un modelo de extracción de información unificada desarrollado por Fastino Labs, publicado en Hugging Face bajo licencia Apache 2.0. Con 74 millones de parámetros, es la variante compacta de la familia GLiNER2.5, diseñada para ejecutarse eficientemente en CPU y entornos de borde sin sacrificar las capacidades de extracción multi-tarea del resto de la familia.

El modelo emplea una arquitectura de predicción de límites (boundary) en lugar de la enumeración de tramos (span enumeration) del GLiNER original. Esto permite manejar tramos de longitud arbitraria y documentos largos en una sola pasada, además de soportar extracción de entidades, clasificación de texto, extracción de registros estructurados, relaciones y atributos de tramo mediante una interfaz unificada basada en esquemas.

La relevancia actual de GLiNER2.5 Small radica en su tamaño reducido y su capacidad para ejecutar tareas de extracción de información complejas sin depender de APIs externas ni de GPUs de alta gama. Es una alternativa práctica para aplicaciones de producción que requieren inferencia local rápida, bajo coste y control de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BoundaryExtractor con encoder DeBERTa-v3-xsmall |
| Parametros totales | 73.881.879 (74M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (limitada por el encoder; típicamente 512 tokens) |
| Tipos de cuantizacion | fp16 (via `quantize=True`), sin GGUF documentado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLiNER2.5 Small se basa en la arquitectura BoundaryExtractor, que predice los límites de inicio y fin de los tramos directamente sobre el texto codificado, en lugar de enumerar todos los tramos posibles como hacia GLiNER v1. Esto reduce la complejidad computacional de O(n²) a O(n), donde n es la longitud del documento, y permite extraer tramos de cualquier longitud dentro de la ventana del codificador. El modelo utiliza DeBERTa-v3-xsmall como encoder, una versión compacta de DeBERTa que ofrece un buen equilibrio entre rendimiento y eficiencia.

La información disponible no detalla el conjunto de datos de entrenamiento ni los procedimientos de alineación (RLHF, DPO, etc.). El modelo se entrena de forma supervisada para tareas de extracción de información multi-tarea, pero no se han publicado datos sobre el número de tokens, la composición del dataset ni técnicas de entrenamiento avanzadas. La arquitectura soporta decodificación restringida mediante un módulo `Classifier` para restricciones entre tareas y `JointIE` para la extracción conjunta de entidades y relaciones tipadas.

## Capacidades

- Extracción de entidades: reconocimiento de entidades nombradas (NER) con soporte de descripciones de etiquetas personalizadas para dominios específicos.
- Clasificación de texto: clasificación de intenciones, análisis de sentimientos, clasificación de tópicos y otras tareas de clasificación de texto mediante un esquema de etiquetas.
- Extracción de registros estructurados: parseo de documentos en formato JSON o estructuras de datos definidas por el usuario.
- Extracción de relaciones: identificación de relaciones entre entidades tipadas, con decodificación conjunta mediante `JointIE`.
- Atributos de tramo: asignación de atributos o propiedades a los tramos extraídos (por ejemplo, confianza, tipo, etc.).
- Decodificación restringida: soporte de restricciones cruzadas entre tareas para garantizar consistencia en los resultados.
- Inferencia local: funciona en CPU, CUDA y MPS sin necesidad de API externa.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede extraer entidades (productos, problemas, datos de contacto) y clasificar la intención del usuario en conversaciones multi-turno, lo que permite enrutar consultas a agentes humanos o generar respuestas automáticas.
- **Extracción de datos de facturas y documentos**: dado un texto de factura, GLiNER2.5 Small extrae campos estructurados (fecha, importe, proveedor, número de factura) con alta precisión, facilitando la integración en sistemas de contabilidad o gestión documental.
- **Procesamiento de textos clínicos**: extracción de medicamentos, dosis, síntomas y tiempos de administración en informes médicos o notas clínicas, útil para sistemas de soporte a la decisión clínica o análisis de historiales.
- **Clasificación de tickets de soporte técnico**: categorización automática de tickets por tipo de problema (hardware, software, red, etc.) y extracción de entidades relevantes (dispositivo, versión, error), mejorando la priorización y el enrutado.
- **Extracción de relaciones en textos legales**: identificación de entidades (partes, fechas, cláusulas) y las relaciones entre ellas en contratos o sentencias, facilitando la revisión y el análisis jurídico.
- **Enriquecimiento de datos para bases de conocimiento**: extracción de entidades y relaciones desde artículos o feeds de noticias para poblar grafos de conocimiento, con soporte de descripciones de etiquetas para dominios específicos.
- **Agentes de extracción de información en tiempo real**: al ser ligero (74M), puede desplegarse en dispositivos de borde o en pipelines de streaming para procesar textos en tiempo real sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas con métricas como F1, precisión o recall para tareas de NER, clasificación o extracción de relaciones. Tampoco se proporcionan comparaciones con otros modelos en la misma categoría.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 74M parámetros, la inferencia en fp16 ocupa aproximadamente 150 MB de VRAM, más el overhead del runtime. Es factible en GPUs con 2 GB o menos.
- **GPUs recomendadas**: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas de gama de entrada como NVIDIA GTX 1650 o integradas. También funciona en Apple Silicon (MPS).
- **CPU**: puede ejecutarse en CPU sin problemas, con latencia aceptable para documentos de longitud media (500-1000 caracteres).
- **Opciones de despliegue**: se integra con la librería `gliner2` (pip install "gliner2[local]") que soporta CPU, CUDA y MPS. También se puede usar con `torch.compile` para optimizar la inferencia.
- **Latencia estimada**: no se proporcionan cifras concretas, pero al ser un modelo compacto, la latencia en CPU para documentos cortos es típicamente inferior a 100 ms por documento.

## Comparativa con modelos similares

| Modelo | Parámetros | Encoder | Idioma | Licencia | Uso principal |
|---|---|---|---|---|---|
| fastino/gliner2.5-small-v1 | 74M | DeBERTa-v3-xsmall | Inglés | Apache 2.0 | Extracción de información multi-tarea en CPU/edge |
| fastino/gliner2.5-base-v1 | 194M | DeBERTa-v3-base | Inglés | Apache 2.0 | Extracción multi-tarea con mayor capacidad |
| fastino/gliner2.5-multi-v1 | 287M | mDeBERTa-v3-base | Multilingüe | Apache 2.0 | Extracción multi-tarea en múltiples idiomas |

La familia GLiNER2.5 comparte la misma API pública y arquitectura de límites, diferenciándose en el tamaño del encoder y el soporte multilingüe. No se dispone de comparativas directas con otros modelos de extracción de entidades (como spaCy, Stanford NER o GLiNER v1) en términos de rendimiento, ya que no se han publicado benchmarks en la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: el modelo solo está entrenado para inglés. No es adecuado para textos en otros idiomas sin adaptación o entrenamiento adicional.
- **Contexto limitado**: el encoder DeBERTa-v3-xsmall tiene una ventana de contexto típica de 512 tokens, lo que limita el procesamiento de documentos muy largos. Para textos extensos se recomienda segmentar el documento.
- **Alucinación de entidades**: como cualquier modelo de extracción, puede generar entidades que no están presentes en el texto, especialmente con etiquetas ambiguas o descripciones imprecisas.
- **Dependencia de la calidad de las descripciones de etiquetas**: el rendimiento depende de la precisión de las descripciones proporcionadas para cada etiqueta; descripciones vagas pueden degradar la extracción.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero no se proporcionan garantías sobre la precisión ni el uso en dominios críticos.
- **Falta de datos de entrenamiento**: no se han publicado detalles sobre el conjunto de datos de entrenamiento, lo que dificulta evaluar sesgos o comportamientos esperados en dominios específicos.

## Enlaces

- [Hugging Face: fastino/gliner2.5-small-v1](https://huggingface.co/fastino/gliner2.5-small-v1)
- [arXiv paper: GLiNER2](https://arxiv.org/abs/2507.18546)
- [GitHub: GLiNER2](https://github.com/fastino-ai/GLiNER2)
- [Fastino Labs: página del modelo](https://fastino.ai/models/gliner2-5)
- [Reddit: r/GLiNER](https://www.reddit.com/r/GLiNER/)
