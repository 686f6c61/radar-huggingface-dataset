# freelawproject/caselaw-block-tagger

## Resumen

El modelo `freelawproject/caselaw-block-tagger` es un clasificador de etiquetado de tokens (token-classification) desarrollado por Free Law Project, una organización sin ánimo de lucro dedicada a hacer el ecosistema legal más accesible y competitivo mediante tecnología y datos abiertos. El modelo está diseñado para identificar los componentes estructurales de una opinión judicial estadounidense a partir de su texto OCR: identifica el encabezamiento (caption), los elementos de cabecera (headmatter) y el esqueleto de la opinión (skeleton) como intervalos de caracteres etiquetados con 12 clases BIO (party, separator, docketnumber, court, attorneys, judges, datefiled, otherdate, history, disposition, author, heading) más la clase externa `O`.

Se trata de un modelo de 395,8 millones de parámetros basado en ModernBERT-large, fine-tuneado desde `CaseLawModernBERT-large`, que ya había sido entrenado de forma continua sobre 13 mil millones de palabras de opiniones judiciales de EE. UU. El modelo acepta una secuencia de hasta 8.192 tokens y se entrena con una entrada canónica en HTML ligero (párrafos `<p>`, citas `<blockquote>`, énfasis `<em>`, superíndices `<sup>`, y saltos de línea). Su relevancia actual radica en que resuelve un cuello de botella concreto del ecosistema legal: la estructuración automática de volúmenes escaneados de reporteros judiciales, un paso previo imprescindible para indexar, buscar y analizar jurisprudencia a gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) fine-tuneado desde CaseLawModernBERT-large |
| Parametros totales | 395.856.921 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican cuantizaciones GGUF/INT8/INT4) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1.6 GB) |

## Arquitectura y entrenamiento

El modelo es un `ModernBERT-large` de 0.4 mil millones de parámetros, fine-tuneado desde `CaseLawModernBERT-large`, que a su vez fue continuamente preentrenado sobre 13 mil millones de palabras de opiniones judiciales estadounidenses. El fine-tuning se realizó con un conjunto de datos de aproximadamente 4.400 páginas de volúmenes escaneados de reporteros estadounidenses (16 volúmenes de 8 series distintas), procesadas con un pipeline de OCR multi-motor. Las etiquetas se anotaron de forma humana en un conjunto dorado de unas 680 páginas, y el resto (unas 3.900 páginas) se generó con anotaciones asistidas por modelo y revisadas por humanos. Se aplicaron aumentos de datos: eliminación aleatoria de límites de bloque (para robustez ante errores de segmentación del OCR) y un "estilo dropout" que elimina las etiquetas `<em>` y `<sup>`.

El entrenamiento partió de un warm-start desde un fine-tune previo sobre el conjunto dorado, con una tasa de aprendizaje de 3e-5, batch efectivo de 16, precisión bf16 y early stopping basado en la F1 a nivel de span sobre un conjunto de validación mixto. El modelo no genera texto: emite etiquetas BIO por token (25 identificadores de etiqueta: 12 clases × begin/inside + la clase outside). La entrada se serializa como un caso por secuencia, en formato HTML mínimo, y las notas al pie se omiten durante el entrenamiento.

## Capacidades

- **Etiquetado estructural de opiniones judiciales**: identifica 12 clases de componentes estructurales (partes, separadores, número de expediente, tribunal, abogados, jueces, fecha de presentación, otras fechas, historia, disposición, autor, encabezado) y la clase `O` para el cuerpo del texto.
- **Trabajo con texto OCR**: entrenado con datos de OCR de múltiples motores y con aumentos de datos para robustez frente a errores de segmentación.
- **Procesamiento de entrada canónica**: acepta secuencias de hasta 8.192 tokens con formato HTML ligero (`<p>`, `<blockquote>`, `<em>`, `<sup>`) y saltos de línea entre bloques.
- **Generalización a series de reporteres no vistas**: el modelo muestra buen comportamiento en volúmenes de reporteres completamente ausentes del entrenamiento (por ejemplo, span-F1 de 0.934 en el volumen de validación de Pacific 3d).
- **Extracción de captions**: los seis campos que componen la cabecera de un caso (parte, separador, número de expediente, tribunal, fecha, fecha de otra fecha) se extraen con un micro-F1 de 0.972 (strict) y 0.973 (normalizado) en validación, y 0.979 / 0.986 en el test.
- **No soporta generación de texto ni tool calling**: el modelo es puramente discriminativo y está diseñado para una única tarea de clasificación de tokens.

## Casos de uso

- **Estructuración de volúmenes de reporteres escaneados**: Free Law Project usa este modelo para convertir las imágenes OCR de reporteres judiciales en documentos estructurados con campos identificados (partes, fecha, tribunal, número de expediente), facilitando su ingesta en bases de datos legales como CourtListener.
- **Indexación de jurisprudencia para búsqueda semántica**: al etiquetar los componentes del caso, se puede crear un índice con campos específicos (por ejemplo, filtrar por tribunal o por fecha) y mejorar la precisión de búsquedas en motores de recuperación de documentos legales.
- **Preprocesamiento para entrenamiento de modelos de lenguaje**: los documentos estructurados con este modelo pueden servir como entrada limpia para preentrenar modelos de lenguaje específicos del dominio legal (como CaseLawModernBERT), eliminando ruido de OCR y separando cabeceras del cuerpo.
- **Asistencia a revisión manual en despachos y editoriales**: el modelo puede preetiquetar automáticamente las partes de una opinión, reduciendo el esfuerzo de revisión humana en procesos de edición o anotación de jurisprudencia.
- **Normalización de metadatos en sistemas de gestión de expedientes**: en un despacho, el modelo puede extraer automáticamente los campos de caption (número de expediente, tribunal, fecha) de documentos digitalizados, evitando la entrada manual de datos en sistemas de gestión de casos.
- **Enriquecimiento de corpus para investigación sociolegal**: investigadores pueden usar el modelo para etiquetar grandes colecciones de opiniones y analizar patrones (por ejemplo, la frecuencia de disposiciones, la evolución de las fechas de presentación, o la autoría de jueces).

## Benchmarks y rendimiento

La model card reporta la métrica de span-F1 (exacta sobre intervalos de inicio, fin y etiqueta, con normalización de espacios y puntuación). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, etc.) porque el modelo está especializado en una tarea de etiquetado de tokens.

| Conjunto de evaluación | span-F1 estricto | span-F1 normalizado |
|---|---|---|
| Validación (3 volúmenes, oro revisado por humanos) | 0.929 | 0.935 |
| Test (4 volúmenes, oro revisado por humanos) | 0.937 | 0.950 |

Generalización a fuentes no vistas: en el volumen de validación de la serie Pacific 3d (completamente ausente del entrenamiento), el span-F1 es 0.934. En el test, el volumen de la serie South Eastern 2d y Bankruptcy Reporter (también fuera del entrenamiento) obtiene puntuaciones entre 0.872 y 0.903, mientras que el volumen de una serie presente en el entrenamiento alcanza 0.979.

Rendimiento por clase (span-F1 estricto en validación):

| Clase | span-F1 |
|---|---|
| party | 0.990 |
| attorneys | 0.983 |
| datefiled | 0.981 |
| author | 0.968 |
| court | 0.963 |
| separator | 0.994 |
| docketnumber | 0.949 |
| heading | 0.938 |
| judges | 0.865 |
| otherdate | 0.842 |
| history | 0.815 |
| disposition | 0.801 |

Agregación de los seis campos de caption (micro-F1): validación 0.972 (strict) y 0.973 (normalizado); test 0.979 y 0.986.

## Requisitos de hardware

- **VRAM estimada**: con 395,8 millones de parámetros, en fp32 el modelo ocupa aproximadamente 1,6 GB (peso de safetensors). En fp16 se reduce a unos 0,8 GB. Con cuantización a int8 (no oficialmente publicada, pero factible) podría bajar a ~0,4 GB.
- **GPUs recomendadas**: cualquier GPU con 4 GB de VRAM o más es suficiente para inferencia en fp16 (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090). Para entrenamiento o fine-tuning adicional, se recomienda al menos una GPU con 12-16 GB (RTX 3080, A100) para manejar el batch y la secuencia de 8K tokens.
- **Compatibilidad con GPU consumer**: sí, el modelo cabe en cualquier GPU consumer moderna (4 GB en fp16), e incluso en CPU con 8 GB de RAM si se usa la versión fp32.
- **Opciones de despliegue**: se puede ejecutar con la biblioteca `transformers` de Hugging Face (como se muestra en el README), o con ONNX Runtime para inferencia optimizada. Para despliegue en producción, se puede usar vLLM o TGI si se adapta a la tarea de token classification, aunque para este tamaño de modelo la inferencia es lo suficientemente rápida en CPU con hardware moderno. No se ha publicado soporte oficial de GGUF/llama.cpp.
- **Latencia y throughput estimados**: no se proporcionan datos oficiales. Para un modelo de 0.4B en fp16 en una GPU consumer, la inferencia de una secuencia de 8K tokens debería completarse en menos de 100 ms; en CPU con hardware moderno, en torno a 500-1000 ms por secuencia, dependiendo de la longitud y de la optimización.

## Comparativa con modelos similares

No hay disponible una comparativa directa con modelos similares en la información proporcionada. Como referencia, se puede comparar con:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| `freelawproject/caselaw-block-tagger` | 395,8 M | 8.192 tokens | Estructura de opiniones judiciales de EE. UU. (12 clases BIO) | Apache 2.0 |
| `CaseLawModernBERT-large` (base) | 395,8 M | 8.192 tokens | Preentrenado en texto legal de EE. UU. | Apache 2.0 |
| `LegalBERT` (base) | ~110 M | 512 tokens | Representaciones contextuales de texto legal | Apache 2.0 |
| Modelos NER genéricos (p. ej. `dslim/bert-base-NER`) | ~110 M | 512 tokens | NER genérico (personas, organizaciones, lugares) | MIT |

`caselaw-block-tagger` se distingue de los modelos NER genéricos por su especialización en estructura de documentos legales y por su ventana de contexto de 8.192 tokens, que permite procesar opiniones completas de una sola vez. En comparación con su modelo base `CaseLawModernBERT-large`, añade la capa de clasificación de tokens y el fine-tuning sobre anotaciones humanas específicas de la tarea.

## Limitaciones y advertencias

- **Entrenado exclusivamente en tipografía de reporteres estadounidenses**: no se ha probado en otros estilos de disposición de documentos legales (reporteres oficiales de otros países, jurisdicciones no estadounidenses). El uso en tales casos puede degradar el rendimiento.
- **Clases difíciles**: `disposition` es la clase con menor rendimiento (0.77 en el test), debido a su convención de dos niveles (una decisión final corta más holdings en el texto). `judges` degrada notablemente en formatos de concurrencia poco habituales (0.58 en reporteres fuera del entrenamiento). `otherdate` tiene un soporte muy limitado (12-28 spans en cada conjunto).
- **Las citas no se etiquetan**: las citas legales se excluyen deliberadamente de las clases; se manejan con un modelo separado.
- **Formato de entrada restrictivo**: el modelo espera una serialización canónica (HTML mínimo, un caso por secuencia, sin notas a pie de página, saltos de línea entre bloques). Cualquier desviación de este formato (por ejemplo, marcado inesperado o bloques sin separar) degrada la calidad de las predicciones, ya que los tokens de marcado se enmascaran durante el entrenamiento.
- **Sesgos y alucinación**: aunque es un clasificador y no genera texto, puede cometer errores de etiquetado que propaguen información incorrecta en sistemas aguas abajo. No se han evaluado sesgos específicos en el modelo, pero el entrenamiento se limita a un conjunto de reporteres de EE. UU., por lo que puede tener un sesgo geográfico y de estilo.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo se basa en datos de dominio público (opiniones judiciales de EE. UU.), por lo que no hay problemas adicionales de propiedad intelectual para su uso comercial.

## Enlaces

- [Modelo en Hugging Face: freelawproject/caselaw-block-tagger](https://huggingface.co/freelawproject/caselaw-block-tagger)
- [Modelo base: ai-law-society-lab/CaseLawModernBERT-large](https://huggingface.co/ai-law-society-lab/CaseLawModernBERT-large)
- [Free Law Project (página principal)](https://free.law/)
- [Free Law Project en GitHub](https://github.com/freelawproject)
- [Free Law Project en Hugging Face](https://huggingface.co/freelawproject)
