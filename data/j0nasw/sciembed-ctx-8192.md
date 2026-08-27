# J0nasW/sciembed-ctx-8192

## Resumen

SciEmbed-CTX-8192 es un modelo de embeddings para documentos científicos desarrollado por J0nasW, basado en ModernBERT-base de AnswerDotAI. Forma parte de la familia SciEmbed, presentada en Findings of EMNLP 2026, y se entrena utilizando oraciones de contexto de citas como señal contrastiva principal. El modelo está diseñado específicamente para representar fragmentos de literatura científica, facilitando tareas de recuperación, similitud y agrupación de documentos.

Con 149 millones de parámetros y una longitud de contexto de 8192 tokens, esta variante está optimizada para entradas científicas largas, como párrafos completos de artículos o secciones de métodos. La salida es un vector de 768 dimensiones, truncable mediante Matryoshka a 512, 256 o 128 dimensiones, lo que permite ajustar el equilibrio entre precisión y coste computacional. Su licencia MIT y su compatibilidad con el ecosistema sentence-transformers lo hacen accesible para integración directa en pipelines de procesamiento de texto científico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (transformer encoder) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-base, una arquitectura transformer encoder optimizada para eficiencia y velocidad, con atencion bidireccional y posiciones rotatorias. El entrenamiento utiliza oraciones de contexto de citas como señal contrastiva: para cada par de documentos cientificos que se citan mutuamente, se genera un par positivo a partir del contexto de la cita, y se aplica una funcion de perdida contrastiva para alinear las representaciones. El dataset de entrenamiento no se detalla en la informacion disponible, pero se infiere que esta compuesto por textos cientificos en ingles con anotaciones de citas.

La variante CTX-8192 extiende la longitud de contexto respecto a la version base (probablemente 512 o 1024 tokens), lo que permite procesar secciones completas de articulos. El pooling es mean sobre los tokens de salida, y la dimension de salida es 768, con soporte de truncamiento Matryoshka para reducir la dimensionalidad sin reentrenar.

## Capacidades

- Generacion de embeddings de documentos cientificos: oraciones, parrafos o secciones completas.
- Similitud semantica entre fragmentos de literatura cientifica.
- Recuperacion de informacion (retrieval) sobre corpus de papers, con soporte para contextos largos.
- Agrupacion (clustering) de articulos por tematica o metodologia.
- Clasificacion de documentos cientificos mediante embeddings como caracteristicas.
- Truncamiento Matryoshka: permite reducir la dimension de salida a 512, 256 o 128 sin perdida significativa de rendimiento.
- Compatible con el ecosistema sentence-transformers y con Text Embeddings Inference (TEI) para despliegue en produccion.

## Casos de uso

- Busqueda semantica en repositorios de articulos cientificos: indexar abstracts, secciones de metodos o parrafos completos y recuperar los mas relevantes para una consulta dada, aprovechando los 8192 tokens de contexto para consultas largas.
- Recomendacion de citas: dado un fragmento de manuscrito, encontrar papers que deberian citarse basandose en la similitud de sus contextos de citas.
- Revision sistematica de literatura: agrupar grandes volumenes de papers por tema o metodologia para acelerar la seleccion de estudios relevantes.
- Deteccion de plagio o similitud textual: comparar parrafos de documentos cientificos para identificar solapamientos o reutilizacion de texto.
- Clasificacion automatica de articulos por area de investigacion: usar los embeddings como entrada para un clasificador ligero.
- Construccion de grafos de conocimiento cientifico: generar embeddings de citas y documentos para inferir relaciones de influencia o co-citacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo obtiene los mejores resultados dentro de su familia en las pruebas Body-Fact Retrieval y LongEmbed, pero no se proporcionan cifras concretas. No se dispone de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en precision fp32 (149M parametros), menos de 0,3 GB en cuantizacion int8 o fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas consumer como GTX 1060, RTX 2060 o superiores. Tambien funciona en CPU con latencia aceptable para lotes pequenos.
- Cabe en GPUs consumer de gama baja y media sin problemas.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI) para endpoints HTTP, o integracion con frameworks como LangChain o LlamaIndex.
- Latencia estimada: en una GPU moderna (RTX 3090), la codificacion de un texto de 512 tokens tarda unos pocos milisegundos; en CPU, decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension salida | Licencia | Notas |
|---|---|---|---|---|---|
| SciEmbed-CTX-8192 | 149M | 8192 | 768 (truncable) | MIT | Especializado en documentos cientificos |
| nomic-embed-text-v1 | 137M | 2048 | 768 | Apache 2.0 | Modelo generalista, soporta Matryoshka |
| bge-m3 | 568M | 8192 | 1024 | MIT | Multilingue, soporta retrieval denso y escaso |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La eleccion dependera del dominio (cientifico vs generalista) y de la longitud de contexto requerida.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: no soporta otros idiomas de forma nativa.
- Especializado en literatura cientifica: su rendimiento en dominios generales (noticias, redes sociales, etc.) puede ser inferior al de modelos generalistas.
- Riesgo de alucinacion en tareas de generacion no aplica, ya que es un modelo de embeddings, pero la calidad de las representaciones depende de la cobertura del corpus de entrenamiento.
- La longitud de contexto de 8192 tokens puede no ser suficiente para documentos completos muy extensos (tesis, libros), aunque cubre la mayoria de articulos cientificos.
- No se han publicado evaluaciones de sesgos o robustez ante dominios cientificos especificos (biomedicina, fisica, etc.).
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/J0nasW/sciembed-ctx-8192
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper: *SciEmbed: Citation-Context Supervision for Scientific Document Embeddings*, Findings of EMNLP 2026 (no se dispone de URL publica en la informacion proporcionada).
