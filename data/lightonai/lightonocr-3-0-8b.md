# lightonai/LightOnOCR-3-0.8B

## Resumen

LightOnOCR-3-0.8B es el modelo más ligero de la familia LightOnOCR-3 de LightOn, una saga de modelos de OCR y comprensión de documentos de peso reducido. Se trata de un modelo visión-lenguaje de 852.985.920 parámetros (aproximadamente 0,85 mil millones) construido sobre la arquitectura Qwen3.5 (etiqueta `qwen3_5` en HuggingFace) y afinado a partir de `Qwen/Qwen3.5-0.8B`. Su pipeline declarado es `image-text-to-text` y su licencia es Apache 2.0, lo que permite uso tanto de investigación como comercial.

El problema que resuelve es la conversión de documentos visuales (PDF, facturas, formularios, tablas, gráficos y maquetación multicolumna) en texto y datos estructurados, sustituyendo pipelines complejos de varias etapas por un único modelo extremo a extremo. Frente a la generación anterior, LightOnOCR-3 incorpora *visual grounding*: además de transcribir, devuelve etiquetas de tipo de bloque y coordenadas de *bounding box* normalizadas de 0 a 1000, descripciones cortas de imágenes y tablas HTML con los datos numéricos extraídos de gráficos.

Su relevancia actual radica en que ofrece estas capacidades en un formato muy pequeño (repo de 1,7 GB) que puede desplegarse en hardware modesto, y en que adopta clases de Transformers estándar (Qwen3.5), lo que simplifica la integración con herramientas existentes. Requiere `transformers>=5.5.4` y está entrenado y evaluado con el modo *thinking* desactivado, que es el valor por defecto de la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5 (etiqueta `qwen3_5`); carga con las clases `Qwen3_5ForConditionalGeneration` y `AutoProcessor` |
| Parametros totales | 852.985.920 (aproximadamente 0,85 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1,7 GB |
| Tarea (pipeline) | image-text-to-text |
| Version de Transformers requerida | >= 5.5.4 (guardado con 5.5.4) |
| Modos de prompt | Prompt vacio (solo imagen) para transcripcion; prompt `grounding` para transcripcion mas comprension visual |
| Fecha de creacion | 2026-10-07 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

LightOnOCR-3-0.8B es un modelo visión-lenguaje que combina un codificador visual con un *decoder* de lenguaje basado en Qwen3.5. Dentro de la familia LightOnOCR-3 existen tres variantes: la de 1B conserva la arquitectura de LightOnOCR-2-1B, mientras que las de 0,8B y 4B adoptan la arquitectura visión-lenguaje de Qwen3.5, lo que reduce el coste de integración y aporta una mejora significativa de velocidad según el autor. El modelo se entrena y evalúa con el modo *thinking* desactivado.

El modelo trabaja en dos modos de prompt. Con un prompt vacío (solo la imagen) devuelve el texto completo de la página en Markdown, comportamiento idéntico al de la generación anterior, por lo que migrar desde LightOnOCR-2 no requiere cambios. Con el prompt `grounding` devuelve, además, cada bloque precedido por un marcador con su tipo y su *bounding box* en coordenadas de página normalizadas a 0–1000. Los tipos de bloque soportados son `text`, `title`, `list`, `header`, `footer`, `page_number`, `footnote`, `caption`, `formula`, `code`, `table`, `image`, `chart`, `header_image`, `footer_image` y `aside_text`, con el sufijo `+` para marcar bloques de continuación. Los bloques de imagen incluyen una descripción corta y los de gráfico una tabla HTML con los puntos de datos extraídos. Otras instrucciones quedan fuera de la distribución de entrenamiento: solo deben usarse el prompt vacío o `grounding`. Según el autor, el *grounding* añade alrededor de un 25 por ciento de tokens de salida (1.433 frente a 1.158 tokens por página de media en el modelo de 4B; no se proporciona la cifra equivalente para el modelo de 0,8B). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Transcripcion de documentos completos a Markdown, incluyendo texto, titulos, listas, encabezados, pies de pagina, numeros de pagina, notas al pie y texto marginal.
- Reconocimiento de tablas y formularios, con salida estructurada del contenido tabular.
- Notacion matematica y formulas, etiquetadas como bloque `formula`.
- Bloques de codigo o texto con apariencia de codigo, etiquetados como `code`.
- *Visual grounding*: cada bloque se devuelve con una etiqueta de tipo y una *bounding box* en coordenadas normalizadas de 0 a 1000.
- Descripcion corta de imagenes y fotografias presentes en el documento, lo que las hace accesibles a pipelines de recuperacion y pregunta-respuesta.
- Conversion de graficos y figuras con datos representados en tablas HTML de puntos de datos (extraccion de datos numericos de figuras).
- Soporte de maquetacion multicolumna y de elementos de cabecera y pie, incluidos logotipos (`header_image`, `footer_image`).
- Modelo extremo a extremo: sustituye una pipeline de comprension de documentos por una sola llamada.
- Sin soporte documentado de *tool calling*, *function calling* ni comportamiento de agente multi-paso en la informacion disponible.
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles.
- Capacidad de audio o de vision general fuera del ambito documental: no documentada.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo transcribe cada pagina a Markdown en una sola pasada, sustituyendo cadenas de OCR mas analisis de maquetacion; su tamano de 0,85 B permite procesar volumenes elevados con coste por pagina bajo.
- Extraccion de datos de facturas y recibos: usando el prompt `grounding`, los campos y bloques relevantes se devuelven con etiqueta y coordenadas, lo que permite mapear el contenido a un esquema de datos y auditar visualmente cada extraccion.
- Conversion de graficos de informes a datos estructurados: los bloques `chart` se convierten en tablas HTML con los puntos de datos, listos para alimentar un *dataframe* o una base de datos sin intervencion manual.
- Indexacion semantica de documentos con contenido visual: las descripciones cortas de imagenes generadas por el modelo permiten que fotografias y diagramas sean recuperables por busqueda textual en un sistema RAG.
- Procesamiento de formularios y documentos administrativos: la combinacion de etiquetas `form`, tablas y *bounding boxes* facilita la validacion automatica de campos y la deteccion de omisiones en documentos estructurados.
- Analitica de documentos cientificos y tecnicos: la transcripcion de formulas, tablas y pies de figura con sus etiquetas permite construir corpus consultables sin perder la estructura del documento original.
- Despliegue en el borde o en entornos con GPU limitada: al pesar 1,7 GB en safetensors, puede ejecutarse en una unica GPU de gama media o incluso en equipos con recursos restringidos, lo que habilita OCR local sin enviar documentos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con MMLU, HumanEval, GSM8K ni metricas de OCR como edit distance, TEDS o similares para esta variante de 0,8B. El unico dato cuantitativo de rendimiento presente en la informacion es el incremento de tokens de salida al activar el modo `grounding` (1.433 frente a 1.158 tokens por pagina de media), medido sobre el modelo de 4B y no sobre el de 0,8B.

## Requisitos de hardware

- VRAM estimada (calculo a partir del numero de parametros, no dato oficial): aproximadamente 1,7-2 GB solo para pesos en bf16/fp16, y en torno a 3-4 GB contando el codificador visual, el *cache* de imagenes y activaciones.
- En cuantizacion de 8 bits la huella de pesos bajaría a aproximadamente 0,9 GB, y en 4 bits a aproximadamente 0,5 GB; no se han publicado cuantizaciones oficiales, por lo que estas cifras son estimaciones derivadas del tamano del modelo.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM o mas deberia ser suficiente en bf16, incluidas RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, L4, A10G, A100 y H100. La GPU es en gran medida sobredimensionada para el peso del modelo, de modo que el cuello de botella real es el preprocesado de imagen.
- Si cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo con 6-8 GB o mas, e incluso en iGPU con memoria unificada si se dispone de una ruta de ejecucion compatible.
- Opciones de despliegue: al cargarse con clases de Transformers (`Qwen3_5ForConditionalGeneration`, `AutoProcessor` con `transformers>=5.5.4`), la ruta soportada es la inferencia con Transformers; requiere ademas `pillow` y `pypdfium2` para el tratamiento de imagenes y PDF. No hay informacion disponible sobre soporte en vLLM, llama.cpp, Ollama o TGI, y al tratarse de una arquitectura reciente es probable que estos *runtimes* requieran trabajo de integracion adicional.
- Latencia y throughput: no disponibles. Existe el tag `endpoints_compatible`, que indica compatibilidad con los endpoints gestionados de HuggingFace.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las otras variantes de la propia familia LightOnOCR-3. No se proporcionan datos de rendimiento ni de arquitectura de alternativas externas.

| Modelo | Parametros | Arquitectura | Capacidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B | 852.985.920 | Vision-lenguaje Qwen3.5 | Transcripcion, grounding, comprension visual | Apache 2.0 | HuggingFace, endpoints compatibles |
| LightOnOCR-3-1B | no disponible en la informacion | LightOnOCR-2-1B | Transcripcion, grounding, comprension visual | Apache 2.0 | HuggingFace |
| LightOnOCR-3-4B | no disponible en la informacion | Vision-lenguaje Qwen3.5 | Transcripcion, grounding, comprension visual; descrito por el autor como el mejor modelo OCR y recomendado para la mayoria de tareas | Apache 2.0 | HuggingFace |
| LightOnOCR-2-1B | no disponible en la informacion | LightOnOCR-2 | Transcripcion (sin las funciones de comprension visual de la generacion 3) | Apache 2.0 | HuggingFace |

Comparado con las alternativas de la misma familia, la variante de 0,8B es la mas ligera y rapida segun el autor, mientras que la de 4B esta recomendada para la mayoria de tareas por su mayor calidad. La de 1B se presenta como sustitucion directa en despliegues existentes de LightOnOCR-2. No hay datos de benchmarks que permitan cuantificar las diferencias de calidad entre las tres variantes.

## Limitaciones y advertencias

- Solo admite dos modos de prompt: vacio (transcripcion) o `grounding`. Cualquier otra instruccion queda fuera de la distribucion de entrenamiento y puede producir resultados degradados.
- El modelo esta entrenado y evaluado con el modo *thinking* desactivado; activarlo no esta contemplado en el flujo previsto.
- Idioma: unicamente ingles. No hay soporte documentado para castellano ni para otras lenguas, lo que limita su uso directo sobre documentacion en espanol.
- Longitud de contexto: no disponible. No puede garantizarse el tratamiento de paginas muy densas o documentos de multiples paginas en una sola llamada sin conocer el limite real de tokens.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Es especialmente relevante en la extraccion de datos de graficos y tablas, donde una transcripcion incorrecta puede pasar desapercibida si no se valida contra la imagen.
- El modo `grounding` incrementa la salida en aproximadamente un 25 por ciento, lo que encarece el procesamiento y puede agotar el limite de generacion en paginas con mucho contenido.
- Robustez ante dominios no vistos (documentos manuscritos, escaneos de baja calidad, idiomas distintos del ingles): no documentada.
- Licencia Apache 2.0, permisiva para uso comercial y de investigacion, sin las restricciones tipicas de licencias no comerciales. Debe conservarse el aviso de licencia y atribucion correspondiente.
- Requiere `transformers>=5.5.4`; versiones anteriores no cargaran el modelo. La integracion con *runtimes* de inferencia de alto rendimiento no esta confirmada.
- Las cifras de VRAM de esta ficha son estimaciones derivadas del numero de parametros, no mediciones oficiales del autor.
- El tag `region:eu` sugiere origen europeo del modelo, lo que puede ser relevante para requisitos de residencia de datos, pero no se detalla en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Paper de LightOnOCR-3: https://arxiv.org/pdf/2601.14251
- Paper adicional referenciado en los tags: https://arxiv.org/abs/2412.13663
- Blog de presentacion: https://huggingface.co/blog/lightonai/lightonocr-3
- Repositorio GitHub: https://github.com/lightonai/LightOnOCR
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante LightOnOCR-3-4B: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Variante LightOnOCR-3-1B: https://huggingface.co/lightonai/LightOnOCR-3-1B
- Generacion anterior LightOnOCR-2-1B: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Web de LightOn: https://lighton.ai
- LinkedIn de LightOn: https://www.linkedin.com/company/lighton/
- Cuenta de X de LightOn: https://x.com/LightOnIO

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace y de la model card del autor.
