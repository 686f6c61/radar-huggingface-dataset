# lschiemanowski/tablereader-lightonocr-v0

## Resumen

tablereader-lightonocr-v0 es un ajuste fino del modelo multimodal LightOnOCR-3-4B, desarrollado por el usuario lschiemanowski, especializado en la transcripción de tablas impresas a un formato HTML fijo y estructurado. El modelo recibe como entrada una imagen recortada de una tabla (incluyendo título y notas al pie) y devuelve una transcripción con jerarquía explícita: línea `# Title`, tabla con `thead` para los encabezados de columna impresos, atributos `data-level` para la indentación de las etiquetas de fila, etiquetas `<sup>` para los marcadores de nota y `tfoot` para las líneas de nota al pie. Es el motor que impulsa la herramienta de código abierto tablereader, que detecta tablas en PDF, las recorta y convierte la transcripción en JSON de tabla.

El modelo parte de una arquitectura Qwen3.5 multimodal (image-text-to-text) con 4.539.265.536 parámetros totales, pesos en bf16 y un repositorio de 9,1 GB. Se ha entrenado mediante LoRA (rango 16, alpha 32) sobre todas las proyecciones del modelo de lenguaje, manteniendo congelado el codificador visual, durante 3 épocas y con una tasa de aprendizaje de 1e-4 sobre 995 recortes de tabla procedentes de 107 series de publicaciones (informes del sector público británico, estadísticas federales e históricas de EE. UU., anexos presupuestarios alemanes, entre otros), tanto digitales como escaneadas. El adaptador está fusionado en los pesos bf16.

Su relevancia actual radica en que aborda un problema clásico y mal resuelto de la extracción documental: preservar la estructura semántica de tablas complejas (jerarquías de filas por indentación, notas al pie, títulos) en lugar de limitarse a una salida plana tipo Markdown. La licencia Apache 2.0 y su integración con una herramienta de línea de comandos lo hacen directamente desplegable en pipelines de procesamiento documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Qwen3.5), vision encoder + language model |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (entrenado con documentos en ingles y aleman, entre otros, segun la composicion del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del multimodal LightOnOCR-3-4B, construido sobre una arquitectura de tipo Qwen3.5 con un codificador visual y un modelo de lenguaje. El entrenamiento se realizó con LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones del modelo de lenguaje, dejando el codificador visual congelado. Se ejecutaron 3 épocas con tasa de aprendizaje 1e-4 sobre 995 recortes de tabla extraídos de 107 series de publicaciones, que incluyen informes del sector público del Reino Unido, estadísticas federales e históricas de Estados Unidos, anexos presupuestarios alemanes y otras fuentes, tanto PDF digitales como escaneados. Los recortes incluyen algunos que el dataset scannedtables retiene por motivos de derechos o privacidad.

Las etiquetas de entrenamiento son transcripciones generadas por GPT-6.1 Terra que parsean a tablas sin problemas bloqueantes, y no fueron revisadas por una persona. El adaptador se fusionó en los pesos bf16 finales. La preparación de la entrada es parte del contrato del modelo: la imagen se escala de modo que su lado más largo no supere los 2048 píxeles, se envía sin prompt de sistema ni texto, con el modo thinking desactivado, temperatura 0 y hasta 16.000 tokens nuevos. El repositorio incluye un archivo `release.json` que registra los ajustes exactos de preparación de recortes, renderizador, detector, tamaño de imagen y generación con los que se entrenó.

## Capacidades

- Transcripción de tablas impresas a HTML estructurado con un contrato de formato fijo (revisión 1): línea de título `# Title`, tabla con `thead`, atributos `data-level` para la indentación jerárquica de etiquetas de fila, `<sup>` para marcadores de nota y `tfoot` para notas al pie.
- Reconocimiento óptico de caracteres (OCR) sobre recortes de tabla en documentos digitales y escaneados.
- Comprensión de estructura documental: distingue títulos, encabezados de columna, jerarquías de fila y notas al pie dentro de un mismo recorte.
- Salida convertible a JSON de tabla mediante la herramienta tablereader.
- Procesamiento por imagen única, sin necesidad de prompt de texto ni contexto conversacional.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras modalidades (audio, vídeo) en la información disponible.
- Capacidades multilingües: el dataset de entrenamiento incluye documentos en inglés y alemán, pero no se especifica una lista formal de idiomas soportados.

## Casos de uso

- Extracción de tablas en informes del sector público: el modelo transcribe tablas de PDF institucionales (el dominio principal de entrenamiento) preservando títulos, encabezados y notas, lo que permite convertir informes británicos o estadounidenses en datos estructurados listos para análisis.
- Digitalización de estadísticas históricas: adecuado para publicaciones estadísticas federales e históricas de EE. UU., donde la jerarquía de filas por indentación y las notas al pie son habituales y el formato `data-level` las conserva.
- Procesamiento de anexos presupuestarios: los presupuestos alemanes y documentos similares con tablas densas y jerárquicas se pueden procesar por lotes mediante `tablereader read documento.pdf --pages 13-20`, generando JSON de tabla para su carga en bases de datos.
- Construcción de pipelines ETL documentales: al integrarse en tablereader, que detecta, recorta y convierte la salida, el modelo encaja en flujos automatizados de ingesta de PDF a tablas relacionales sin intervención manual.
- Auditoría y verificación de datos publicados: la transcripción estructurada permite comparar valores impresos con datos oficiales, usando las rutas de fila y columna como claves de verificación.
- Extracción de tablas en documentos escaneados: aunque con menor precisión (0,511 en la métrica records-1 frente a 0,835 en digitales), el modelo cubre casos de escaneos para los que no existe texto subyacente.
- Prototipado e investigación en reconocimiento de tablas: al ser un ajuste fino abierto con licencia Apache 2.0 y contrato de formato documentado, sirve como base para experimentos de estructuración de tablas.

## Benchmarks y rendimiento

Evaluación sobre 1.006 recortes de validación de series no vistas en entrenamiento, con la métrica `records-1` (proporción de valores impresos cuya ruta de fila, ruta de columna y texto coinciden exactamente con la transcripción de referencia):

| Conjunto | records-1 |
|---|---:|
| Todos | 0,797 |
| PDF digitales | 0,835 |
| Escaneos | 0,511 |

El 72 % de los recortes se leen sin ninguna diferencia. No se han publicado comparaciones con otros modelos en la información disponible. Una ronda de autoentrenamiento sobre 7.698 de sus propias transcripciones no mejoró estas puntuaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros en bf16, los pesos ocupan aproximadamente 9,1 GB; se recomienda al menos 12-16 GB de VRAM para inferencia en bf16 con margen para activaciones y el codificador visual.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; una RTX 4090 (24 GB) es suficiente para inferencia en bf16.
- GPU de consumo: cabe en tarjetas con 16 GB o más de VRAM en bf16; en GPUs de 8-12 GB sería necesario cuantizar, aunque no se publican pesos cuantizados ni se documentan tipos de cuantización.
- Opciones de despliegue: transformers (librería declarada); no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La configuración de generación admite hasta 16.000 tokens nuevos, lo que puede implicar tiempos de decodificación considerables en tablas grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tablereader-lightonocr-v0 | 4.539 M | no disponible | OCR de tablas a HTML estructurado | Apache 2.0 | Hugging Face, transformers |
| LightOnOCR-3-4B (modelo base) | no disponible | no disponible | OCR multimodal general | Apache 2.0 | Hugging Face |
| Alternativas de OCR de tablas | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base LightOnOCR-3-4B es la referencia directa, ya que este ajuste fino hereda su arquitectura y licencia y añade el contrato de transcripción de tablas. No se dispone de datos de benchmarks ni de especificaciones de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no responde `NOT_A_TABLE` ante recortes que no contienen una tabla, por lo que en un pipeline hay que garantizar que la detección previa (en tablereader) filtre correctamente los recortes.
- Rendimiento notablemente inferior en escaneos (0,511 en records-1) frente a PDF digitales (0,835); el 28 % de los recortes presenta alguna diferencia respecto a la referencia.
- Las etiquetas de entrenamiento fueron generadas por GPT-6.1 Terra y no fueron revisadas por una persona, lo que puede propagar errores sistemáticos del generador de etiquetas.
- El dataset de entrenamiento es pequeño (995 recortes de 107 series) y está sesgado hacia dominios concretos (sector público británico, estadísticas estadounidenses, presupuestos alemanes); el rendimiento fuera de esos dominios no está evaluado.
- Algunos recortes de entrenamiento provienen de material que el dataset scannedtables retiene por derechos o privacidad, lo que conviene tener en cuenta en términos de procedencia de datos.
- La entrada debe prepararse exactamente como en el entrenamiento (lado mayor máximo de 2048 píxeles, sin prompt, thinking desactivado, temperatura 0); desviarse de este contrato puede degradar la salida.
- No se documentan sesgos específicos, riesgos de alucinación medidos ni una lista formal de idiomas soportados.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre la exactitud de las transcripciones en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lschiemanowski/tablereader-lightonocr-v0
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Repositorio tablereader: https://github.com/lschiemanowski/tablereader
- Formato de transcripción: https://github.com/lschiemanowski/tablereader/blob/main/docs/transcription-format.md
- Dataset scannedtables: https://huggingface.co/datasets/lschiemanowski/scannedtables
