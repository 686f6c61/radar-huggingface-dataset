# scienceverse/bibr-front-tagger

## Resumen

bibr-front-tagger es un modelo de etiquetado de tokens (token classification) especializado en extraer los metadatos de portada (front matter) de artículos científicos: título, subtítulo, autores, afiliaciones, correo electrónico, ORCID, resumen, palabras clave, datos de la revista, DOI y elementos de mobiliario de página. Lo desarrolla el proyecto scienceverse y forma parte de la herramienta bibr, donde actúa como motor del "modo rápido", en el que no se invoca ningún LLM: el título, el resumen, las palabras clave y la lista de autores salen directamente de este etiquetador, y los vínculos de afiliación se resuelven a partir de sus marcas.

Técnicamente es un encoder jhu-clsp/mmBERT-small (capas de tipo ModernBERT, tokenizador de Gemma 2 con 256 000 piezas) al que se añade una cabeza CRF. El modelo tiene 140 millones de parámetros, de los cuales 42 millones quedan fuera de los embeddings, y se distribuye en un único `model.onnx` de 269 MB en fp32 con embeddings de tokens en int8. Su relevancia actual radica en que permite extraer metadatos estructurados de artículos sin GPU ni PyTorch, ejecutándose en CPU mediante ONNX Runtime, algo útil para pipelines de indexación científica a gran escala.

El modelo cubre siete idiomas (inglés, español, portugués, ruso, ucraniano, japonés e indonesio) y se entrena exclusivamente con artículos de acceso abierto cuya licencia permite entrenar modelos publicados. La salida es una etiqueta BIO y una posterior por palabra, que el ensamblador de bibr convierte en los campos impresos del artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder jhu-clsp/mmBERT-small (capas ModernBERT) + capa lineal a 43 etiquetas BIO + CRF |
| Parametros totales | 140 M (42 M fuera de los embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4 096 subtokens (`max_length`), con ventanas solapadas de stride 3/4 para entradas más largas |
| Tipos de cuantizacion | fp32 con embeddings de tokens en int8 (una escala fp32 por fila); grafo fp32 equivalente de 563 MB |
| Idiomas soportados | en, es, pt, ru, uk, ja, id |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` de 269 MB); parámetros del CRF en `onnx/bibr_onnx.json` |
| Modelo base | jhu-clsp/mmBERT-small (revisión `abc32620`) |
| Tokenizador | Gemma 2, 256 000 piezas |
| Entrada adicional | 32 rasgos por palabra (posición en página, tamaño de fuente, negrita, forma, etiqueta de layout de región, etc.) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura parte de jhu-clsp/mmBERT-small, un encoder con capas ModernBERT y tokenizador de Gemma 2 de 256 000 piezas. Sobre la salida del encoder se aplica una residual con compuerta que incorpora 32 rasgos por palabra (posición relativa en la página, tamaño de fuente, negrita, forma de la palabra, etiqueta de layout de su región, etc.), seguida de una capa lineal que proyecta a 43 etiquetas BIO y de un CRF cuyos parámetros se almacenan en JSON y se decodifican en numpy (Viterbi para las etiquetas, forward-backward para la confianza). El modelo no lee imágenes de página: las regiones y sus etiquetas de layout provienen del detector de layout y del OCR o capa de texto de bibr.

El entrenamiento usa 3 960 filas de entrenamiento, 233 de selección de checkpoint y 463 reservadas para test, con partición por artículo y estratificación de los idiomas no ingleses en todos los conjuntos; aproximadamente dos tercios son en inglés. Las fuentes incluyen Europe PMC y PLOS (biomedicina en inglés), SciELO (español y portugués), J-STAGE (japonés) y un pool de OpenAlex (psicología, ciencias sociales, economía, etc.) con etiquetas plateadas generadas por el modelo profesor `scienceverse/bibr-extract-qwen35-4b` de 4B, conservadas solo donde coinciden con OpenAlex. Los artículos en ruso y ucraniano se etiquetan con un modelo mayor de 27B. Solo se usan artículos cuya licencia sea CC BY, CC0, CC BY-SA o dominio público, y se excluyen los artículos empleados para desarrollar y evaluar bibr. Para entradas largas se aplican ventanas solapadas (stride de 3/4 de la ventana), cada token conserva las emisiones de la ventana en la que está más profundo y una única pasada del CRF decodifica la secuencia empalmada; bibr lee las páginas 1-2 y reetiqueta ventanas posteriores si no encuentra resumen.

## Capacidades

- Etiquetado de tokens para extracción de front matter: título, subtítulo, nombres de autores (nombre y apellido), marcas de autor y afiliación, afiliaciones, correo electrónico, ORCID, resumen, palabras clave, datos de revista (revista, volumen, número, páginas, ISSN, editorial, fecha, licencia), DOI y mobiliario de página (cabeceras, banners, números de página).
- Salida con una etiqueta BIO y una posterior de confianza por palabra, lo que permite umbralizar y derivar al LLM los campos dudosos.
- Procesamiento multilingüe en siete idiomas: inglés, español, portugués, ruso, ucraniano, japonés e indonesio.
- Manejo de entradas largas mediante ventanas solapadas con decodificación CRF única sobre la secuencia empalmada.
- Integración en el modo rápido de bibr sin invocar ningún LLM, y en el modo completo como sustituto de la llamada al LLM cuando la confianza es alta.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de PyTorch en la instalación base de bibr.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un etiquetador discriminativo, no un modelo generativo.

## Casos de uso

- Indexación de repositorios científicos: extraer título, autores, resumen, palabras clave y DOI de PDFs o XML de acceso abierto para poblar un catálogo o un motor de búsqueda académico, ejecutándose en CPU a bajo coste.
- Enriquecimiento de metadatos en pipelines de publicación: dado el texto de las primeras páginas y las etiquetas de layout de bibr, reconstruir los campos impresos del artículo y normalizar la lista de autores con sus afiliaciones.
- Desambiguación de autoría y afiliaciones: usar las marcas de autor y afiliación y las posteriores por palabra para vincular cada autor con su institución, un problema habitual en artículos con múltiples afiliaciones.
- Preprocesado para LLMs: en el modo completo de bibr, resolver con este etiquetador los campos de alta confianza y reservar las llamadas al LLM solo para los campos inciertos, reduciendo coste y latencia.
- Procesamiento de literatura multilingüe: cubrir artículos en español, portugués, ruso, ucraniano, japonés e indonesio con un único modelo, útil para repositorios nacionales como SciELO o J-STAGE.
- Extracción de datos de revista y licencias: identificar volumen, número, páginas, ISSN, editorial, fecha y licencia para auditorías de acceso abierto y cumplimiento de políticas de publicación.
- Detección de mobiliario de página: separar cabeceras, banners y números de página del contenido real antes de otras tareas de extracción o de OCR posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card sí incluye una validación de la cuantización: sobre 260 artículos fuera del conjunto de entrenamiento, el fichero int8 etiqueta el 99,971 % de las palabras de forma idéntica al grafo fp32 (245 de 260 artículos palabra por palabra), y el compuesto de front matter (coincidencia de título, F1 de nombres de autor, ROUGE-L del resumen) difiere en -0,09 puntos (intervalo del 95 %: -0,30 a +0,04, bootstrap pareado sobre artículos).

## Requisitos de hardware

- Inferencia en CPU: el modelo está pensado para ejecutarse mediante ONNX Runtime sin GPU; el fichero `model.onnx` ocupa 269 MB y la instalación base de bibr no requiere PyTorch.
- VRAM estimada: no aplica para el despliegue previsto en CPU; en GPU, el grafo de 269 MB cabe holgadamente en cualquier tarjeta con más de 1 GB de memoria, aunque no se documentan requisitos de GPU.
- GPU recomendadas: no disponible; el autor no publica recomendaciones de GPU.
- GPU de consumo: el modelo cabe en cualquier GPU de consumo por tamaño, pero no hay datos publicados de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (librería declarada); integración con la herramienta bibr, que aporta el detector de layout, el OCR y el ensamblador de campos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bibr-front-tagger (small) | 140 M | 4 096 subtokens | Etiquetado de front matter científico | MIT | ONNX en Hugging Face |
| scienceverse/bibr-extract-qwen35-4b | 4 B (aprox., por el nombre) | no disponible | Extracción de front matter con LLM | no disponible | Hugging Face |
| Modelo profesor de 27B para ruso y ucraniano | 27 B | no disponible | Etiquetado plateado multilingüe | no disponible | No distribuido como modelo independiente |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tamaño, tarea y disponibilidad.

## Limitaciones y advertencias

- No lee imágenes de página: depende del detector de layout y del OCR o capa de texto de bibr para obtener las regiones y sus etiquetas; errores aguas arriba degradan la extracción.
- Cubre solo las primeras páginas (por defecto 1-2, con reetiquetado de ventanas posteriores si no hay resumen); no está pensado para extraer cuerpo, referencias ni tablas.
- El conjunto de idiomas es limitado (siete); no se documenta cobertura de otras lenguas.
- Parte de los datos de entrenamiento usa etiquetas plateadas generadas por un modelo profesor, lo que puede propagar sesgos o errores del profesor en el pool de OpenAlex y en los artículos en cirílico.
- El modelo está entrenado solo con artículos de acceso abierto con licencias permisivas (CC BY, CC0, CC BY-SA, dominio público), lo que puede introducir un sesgo de dominio hacia la literatura biomédica y de acceso abierto frente a revistas de suscripción.
- No se publican benchmarks estándar ni métricas de rendimiento por campo más allá de la validación de cuantización, por lo que la calidad real en producción debe medirse sobre el propio corpus.
- Riesgo de alucinación bajo en sentido generativo (es un etiquetador), pero las posteriores del CRF pueden ser sobreconfiadas; conviene umbralizar la confianza antes de sustituir la llamada al LLM.
- Licencia MIT: permite uso comercial, pero el autor no redistribuye texto ni imágenes de los artículos, y el uso debe respetar las licencias de las fuentes originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scienceverse/bibr-front-tagger
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo profesor de extracción: https://huggingface.co/scienceverse/bibr-extract-qwen35-4b
- Repositorio de bibr: https://github.com/scienceverse/bibr
- Paper asociado (arXiv): https://arxiv.org/abs/2509.06888
