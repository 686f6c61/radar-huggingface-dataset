# sasakiy84/bibform

## Resumen

Bibform es un modelo de extracción de información bibliográfica desarrollado por el usuario sasakiy84. Su función es tomar una cadena de cita (referencia bibliográfica en bruto, en japonés o inglés) y descomponerla en campos estructurados: título, año, fuente de publicación, nombres de personas u organizaciones con sus rangos de caracteres para apellido y nombre, roles de contribuyente (autor, editor, traductor) y tipo de recurso documental. Está pensado para alimentar flujos de generación de ficheros `.bib` (BibLaTeX) a partir de bibliografías no estructuradas.

El modelo se construye mediante fine-tuning de `nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large`, un transformer encoder de tipo MiniLM destilado de XLM-R Large, con 12 capas y dimensión oculta de 384. El paquete de inferencia en PyTorch ocupa 42,11 MB, lo que lo hace apto para ejecución local en CPU sin GPU dedicada. Soporta japonés e inglés, los dos idiomas habituales en bibliografías académicas japonesas.

La relevancia actual reside en su carácter de utilidad especializada y ligera: no es un modelo generativo generalista, sino un extractor de campos entrenado específicamente sobre citas renderizadas a partir de metadatos bibliográficos reales. Su licencia Apache 2.0 y su empaquetado para inferencia local lo hacen directamente integrable en herramientas de gestión de referencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, destilado de XLM-R Large) |
| Parametros totales | no disponible (repo de 0.0 GB; paquete PyTorch de 42,11 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; inferencia PyTorch en CPU) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 (parte propia; ver NOTICE.md para componentes de terceros) |
| Formato de pesos | safetensors |
| Modelo base | nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large |
| Pipeline | no disponible |
| Entrada | JSON Lines UTF-8, un objeto por linea con `id` y `text` |

## Arquitectura y entrenamiento

El modelo parte de mMiniLMv2-L12-H384-distilled-from-XLMR-Large, un encoder multilingüe de 12 capas y 384 dimensiones ocultas obtenido por destilación de XLM-R Large. Sobre esa base se realiza un fine-tuning multitarea orientado a la extracción de campos de citas: por un lado, extracción de spans (rangos de caracteres en la cita original para título, año, fuente, apellidos y nombres, y entidades personales o corporativas); por otro, clasificación del tipo de recurso documental en 12 categorías originales, con una capa de mapeo a 9 tipos BibLaTeX de salida.

La salida se expresa como intervalos semiabiertos `[start, end)` sobre la cadena de entrada, en unidades de puntos de código Unicode, lo que preserva la correspondencia exacta con el texto original. Para el tipo de recurso se devuelven la clase principal y su puntuación en `resource_type`, y una lista de candidatos BibLaTeX con selección automática en `resource_type.biblatex`; cuando `selected` es `null`, el consumidor debe elegir entre los candidatos. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO; el autor sí documenta que el conjunto de evaluación se construyó renderizando metadatos bibliográficos reales según distintos formatos de cita.

## Capacidades

- Extracción de campos bibliográficos desde cadenas de cita en bruto: título, año y fuente de publicación.
- Identificación de personas y organizaciones citadas, con rangos de caracteres separados para apellido y nombre.
- Detección de roles de contribuyente: autor, editor, traductor, entre otros.
- Clasificación del tipo de recurso documental en 12 categorías originales y mapeo a 9 tipos BibLaTeX.
- Salida con spans de caracteres exactos sobre la entrada, apta para resaltado y edición asistida.
- Procesamiento por lotes mediante JSON Lines, con campo `id` para correlación de resultados.
- Soporte bilingüe japonés-inglés en una misma pasada.
- Inferencia local en CPU con PyTorch, sin dependencia de servicios externos.
- No dispone de generación de texto libre, tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Generación automática de ficheros `.bib`: a partir de una lista de citas copiadas de artículos o páginas web, el modelo extrae los campos y el tipo BibLaTeX para construir entradas de BibLaTeX sin intervención manual, usando los spans devueltos para señalar al usuario qué fragmento corresponde a cada campo.
- Limpieza de bibliografías heredadas: en gestores de referencias con entradas mal formadas o importadas como texto plano, el modelo permite reconstruir los campos estructurados y corregir el tipo de recurso antes de exportar.
- Herramientas de navegador para investigadores: la variante Bibform Lite ejecuta el análisis en el propio navegador y genera `.bib` localmente, lo que encaja en extensiones y aplicaciones web que no deben enviar citas a un servidor.
- Enriquecimiento de repositorios documentales: procesamiento por lotes de listados de referencias en bibliotecas digitales japonesas e inglesas, asignando tipo de recurso y roles de contribuyente para mejorar la indexación.
- Preprocesado para pipelines de revisión sistemática: normalización de las referencias de los estudios cribados antes de deduplicar y clasificar por tipo de publicación.
- Asistencia a la citación en editores y sistemas de envío: validación y autocompletado de referencias introducidas por autores, con detección de campos ausentes o mal delimitados gracias a la granularidad de spans.
- Extracción de metadatos en catalogación bibliotecaria: clasificación de registros en texto libre según los 9 tipos BibLaTeX de salida para tareas de triaje previo.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de desarrollo de formatos desconocidos de bibformDatasetTrial v1-quality14 (10.130 ejemplos). La coincidencia exacta de extracción incluye campos bibliográficos, entidades y rangos de apellido/nombre con sus roles; el tipo se puntúa con las 9 clases BibLaTeX.

| Ejecucion | Extraccion exacta | Tipo correcto | Extraccion y tipo exactos |
|---|---:|---:|---:|
| PyTorch (CPU) | 97,61 % (9.888) | 93,67 % (9.489) | 91,51 % (9.270) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el paquete de inferencia PyTorch ocupa 42,11 MB y está pensado para ejecución en CPU (`--device cpu`).
- GPU recomendadas: no aplica; cualquier GPU compatible con PyTorch podría acelerar el procesamiento por lotes, pero no se documentan requisitos.
- Cabe en cualquier equipo de consumo: el tamaño del paquete (42,11 MB) permite ejecutarlo en portátiles y entornos con recursos limitados.
- Opciones de despliegue: script `pytorch/predict.py` con `requirements.txt`; entorno de referencia Python 3.14. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| Bibform | Encoder MiniLM fine-tuned | no disponible | no disponible | ja, en | Apache 2.0 | Extraccion de campos de citas y tipo BibLaTeX |
| Bibform Lite | Variante del mismo proyecto | no disponible | no disponible | ja, en | Apache 2.0 | Analisis en navegador y generacion de `.bib` |
| nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large | Encoder base | no disponible | no disponible | multilingue | no disponible | Embeddings y fine-tuning general |
| Modelos generativos tipo LLM (p. ej. familia Llama, Qwen) | Decoder generativo | miles de millones | miles de tokens | multilingue | variable | Extraccion via prompting, sin spans garantizados |

No se dispone de comparativas publicadas frente a otros extractores de citas especializados; la comparación con modelos generativos es cualitativa: Bibform ofrece spans exactos y un tipo de recurso calibrado, mientras que un LLM requiere prompting y no garantiza la correspondencia carácter a carácter.

## Limitaciones y advertencias

- Los valores de precisión publicados corresponden al conjunto de desarrollo de formatos desconocidos del propio autor; no hay evaluación independiente.
- El autor advierte de errores en citas cortas o con fuente de publicación ambigua, donde puede confundir el rango del título o el tipo de recurso.
- Solo cubre japonés e inglés; no se documenta comportamiento en otras lenguas.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La selección de tipo BibLaTeX puede devolver `selected: null`, lo que exige lógica de desambiguación en el consumidor.
- La licencia Apache 2.0 se aplica a la parte propia; los componentes de terceros incluidos se rigen por las condiciones de NOTICE.md y deben revisarse antes de redistribuir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un extractor de spans, el riesgo principal es la asignación incorrecta de límites, no la invención de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sasakiy84/bibform
- Variante Bibform Lite: https://huggingface.co/sasakiy84/bibform-lite
- Modelo base: https://huggingface.co/nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large
- Ejemplo de entrada: https://huggingface.co/sasakiy84/bibform/blob/main/examples/input.jsonl
- Detalle de evaluación: https://huggingface.co/sasakiy84/bibform/blob/main/evaluation.json
- Licencia: https://huggingface.co/sasakiy84/bibform/blob/main/LICENSE
- Aviso de terceros: https://huggingface.co/sasakiy84/bibform/blob/main/NOTICE.md
