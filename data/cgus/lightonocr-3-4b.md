# cgus/LightOnOCR-3-4B

## Resumen

LightOnOCR-3-4B es el modelo de mayor tamano de la familia LightOnOCR-3, una nueva generacion de modelos OCR ligeros end-to-end desarrollados por LightOn AI. El modelo resuelve la transcripcion de documentos con comprension de layout y capacidades de grounding visual: no solo extrae el texto de una pagina, sino que devuelve coordenadas de bounding box etiquetadas para cada elemento visual, descripciones cortas de imagenes y los datos numericos de graficos convertidos en tablas HTML. Esta orientado a sustituir pipelines complejos de comprension documental por un unico modelo.

La arquitectura adoptada es la de Qwen3.5 vision-language, lo que simplifica la integracion con herramientas existentes y aporta una mejora significativa de velocidad respecto a la generacion anterior. El checkpoint publicado bajo el identificador `cgus/LightOnOCR-3-4B` es una cuantizacion comunitaria del modelo original de LightOn AI, distribuida en formato EXL3 (ExLlamaV3) con variantes de 4, 5, 6 y 8 bits por peso. Los pesos en safetensors del repositorio suman 2.185.401.856 parametros, lo que situa el modelo en la categoria de 2B efectivos pese a la denominacion comercial "4B".

La relevancia actual del modelo radica en su licencia Apache 2.0, que permite uso comercial y de investigacion sin restricciones, y en su capacidad de ejecutarse en hardware de consumo: segun el autor de la cuantizacion, incluso la variante de 8 bits cabe en una RTX 4060 Ti de 16 GB con contexto completo y sin cache cuantificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (Qwen3.5 vision-language) |
| Parametros totales | 2.185.401.856 (segun safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4bpw, 5bpw, 6bpw y 8bpw (h8 v16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion EXL3), transformers |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3.5 vision-language, un transformer multimodal que procesa pares imagen-texto y genera texto estructurado en Markdown con anotaciones de grounding. La familia LightOnOCR-3 incluye tres tamanos: 0.8B y 4B sobre Qwen3.5, y 1B que conserva la arquitectura de LightOnOCR-2. Frente a la generacion anterior, los modelos incorporan comprension visual: bounding boxes etiquetadas, descripciones de imagenes y extraccion de datos de graficos como tablas HTML.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card original menciona dos articulos cientificos (arXiv:2601.14251 y arXiv:2412.13663) que presumiblemente documentan el entrenamiento, pero su contenido no esta incluido en la informacion proporcionada. La innovacion tecnica destacable es el modo dual de prompt: un prompt vacio activa la transcripcion pura, mientras que el prompt `grounding` devuelve cada bloque con etiqueta de tipo y bounding box en coordenadas normalizadas 0-1000.

## Capacidades

- Transcripcion OCR end-to-end de paginas completas a Markdown.
- Grounding visual: cada bloque de contenido se prefija con una etiqueta de tipo y coordenadas de bounding box normalizadas 0-1000.
- Etiquetas de bloque soportadas: `text`, `title`, `list`, `header`, `footer`, `page_number`, `footnote`, `caption`, `formula`, `code`, `table`, `image`, `chart`.
- Descripcion corta de imagenes, lo que hace accesible el contenido visual a pipelines de recuperacion y question-answering.
- Extraccion de datos de graficos y figuras en tablas HTML estructuradas.
- Manejo de tablas, recibos, formularios, graficos, layouts multicolumna y notacion matematica.
- Modo conversacional (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`).

## Casos de uso

- Digitalizacion masiva de facturas y recibos: en modo grounding, el modelo devuelve cada campo con su bounding box y etiqueta, lo que permite mapear importes, fechas y lineas de detalle a un esquema estructurado sin reglas heuristicas por plantilla.
- Extraccion de tablas de informes financieros: las regiones etiquetadas como `table` se transcriben como contenido Markdown y las de tipo `chart` se convierten en tablas HTML de puntos de datos, facilitando la carga directa en hojas de calculo o bases de datos.
- Accesibilidad documental: las regiones `image` reciben una descripcion corta, lo que permite generar texto alternativo para documentos escaneados y hacerlos navegables por lectores de pantalla o motores de busqueda.
- Procesamiento de formularios administrativos: el modelo distingue `header`, `footer`, `page_number` y `footnote`, lo que ayuda a separar el contenido sustantivo del ruido de plantilla en documentos oficiales de varias paginas.
- Pipeline RAG sobre documentos corporativos: la combinacion de transcripcion y bounding boxes permite indexar fragmentos con referencia a su posicion en pagina, mejorando la trazabilidad de las citas en sistemas de question-answering.
- Conversion de articulos cientificos con formulas: las regiones `formula` y `code` se etiquetan de forma diferenciada, lo que permite preservar notacion matematica y fragmentos de codigo en la conversion a Markdown para repositorios tecnicos.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones EXL3 de 4 a 8 bits permiten ejecutar el modelo en una RTX 4060 Ti de 16 GB con contexto completo, habilitando OCR local sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numerica; el autor de la cuantizacion indica que la variante de 8bpw h8 v16 cabe en una RTX 4060 Ti de 16 GB con contexto completo y sin cache cuantificada.
- La diferencia de tamano entre las variantes de vision v16 y v8 es de aproximadamente 150 MB, segun el autor.
- GPU recomendadas: RTX 4060 Ti 16 GB o superior para las variantes de 8 bits; GPUs con menos VRAM pueden usar las variantes de 4, 5 o 6 bpw.
- Cabe en GPU de consumo: si, al menos en RTX 4060 Ti 16 GB con la cuantizacion de 8 bits.
- Opciones de despliegue: ExLlamaV3 (formato nativo de las cuantizaciones publicadas), transformers (libreria declarada en el repositorio); otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B (este) | 2.185.401.856 | no disponible | Qwen3.5 vision-language | Apache 2.0 | Mayor precision de la familia, grounding y comprension visual |
| LightOnOCR-3-1B | no disponible | no disponible | LightOnOCR-2 | Apache 2.0 | Actualizacion directa para despliegues existentes |
| LightOnOCR-3-0.8B | no disponible | no disponible | Qwen3.5 vision-language | Apache 2.0 | Variante rapida y eficiente |
| LightOnOCR-2-1B | no disponible | no disponible | LightOnOCR-2 | Apache 2.0 | Generacion anterior, sin capacidades de grounding |

## Limitaciones y advertencias

- El repositorio `cgus/LightOnOCR-3-4B` es una cuantizacion comunitaria del modelo original `lightonai/LightOnOCR-3-4B`; para produccion conviene validar que la cuantizacion no degrada la precision OCR respecto al checkpoint original.
- Los pesos estan en formato EXL3, por lo que el despliegue esta condicionado al uso de ExLlamaV3; no se garantiza compatibilidad directa con vLLM, llama.cpp u Ollama.
- No hay informacion publicada sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del ingles; la lista de idiomas soportados no esta disponible.
- La longitud de contexto no esta documentada, lo que impide planificar el procesamiento de documentos de muchas paginas sin pruebas previas.
- El modelo esta especializado en OCR y comprension documental; no debe esperarse un rendimiento de proposito general comparable a modelos de chat o razonamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de datos de benchmarks impide estimar el rendimiento esperado en dominios especificos sin evaluacion propia.
- Las coordenadas de bounding box se normalizan a 0-1000, lo que introduce una precision limitada en la localizacion de elementos muy pequenos.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/cgus/LightOnOCR-3-4B
- Modelo original: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Variante 5bpw: https://huggingface.co/cgus/LightOnOCR-3-4B/tree/5bpwh8v16
- Variante 6bpw: https://huggingface.co/cgus/LightOnOCR-3-4B/tree/6bpwh8v16
- Variante 8bpw: https://huggingface.co/cgus/LightOnOCR-3-4B/tree/8bpwh8v16
- Paper: https://arxiv.org/pdf/2601.14251
- Paper adicional: https://arxiv.org/abs/2412.13663
- Blog: https://huggingface.co/blog/lightonai/lightonocr-3
- Demo: https://huggingface.co/spaces/lightonai/LightOnOCR-3-Demo
- GitHub: https://github.com/lightonai/LightOnOCR
- LightOnOCR-2-1B: https://huggingface.co/lightonai/LightOnOCR-2-1B
- LightOnOCR-3-1B: https://huggingface.co/lightonai/LightOnOCR-3-1B
- LightOnOCR-3-0.8B: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Web de LightOn: https://lighton.ai
