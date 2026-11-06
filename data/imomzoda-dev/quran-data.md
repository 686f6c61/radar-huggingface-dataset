# imomzoda-dev/quran-data

## Resumen

`imomzoda-dev/quran-data` no es un modelo de lenguaje, sino un repositorio de datos publicado en Hugging Face que distribuye un corpus estructurado del Corán en formato JSON, empaquetado en archivos `.zip` alojados como artefactos de release en GitHub. El contenido incluye el texto coránico con segmentación palabra a palabra (QPC V4 y Uthmani), metadatos de suras y aleyas, transcripción fonética en tayiko, traducciones al persa, ruso y tayiko (varias versiones, incluida una con tafsir), y un tafsir completo (Osanbayon). El autor es `imomzoda-dev`, vinculado al proyecto SakinaDevGroup.

El repositorio es relevante para desarrolladores que construyen aplicaciones islámicas, herramientas de estudio del Corán, sistemas de búsqueda semántica sobre texto religioso o pipelines de NLP en lenguas de Asia Central. Su valor está en la disponibilidad de alineación palabra a palabra entre texto árabe y traducciones, lo que facilita tareas de alineamiento léxico, anotación morfológica y generación de interfaces de lectura sincronizada.

No se dispone de información sobre arquitectura, parámetros, contexto ni proceso de entrenamiento, ya que no se trata de un modelo entrenado. La model card está redactada en tayiko y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un conjunto de datos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card; el contenido incluye árabe, tayiko, persa y ruso |
| Licencia | no disponible |
| Formato de pesos | JSON dentro de archivos `.zip` (no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos de red neuronal ni un proceso de entrenamiento. Se trata de un dataset empaquetado: cada subconjunto se distribuye como un `.zip` que contiene archivos `.json`. Los subconjuntos identificados en la model card son: `qpc-v4` (texto QPC V4 palabra a palabra), `qpc-v4-tajweed-pages` (paginación con reglas de tajwid), `uthmani-wbw` (texto uthmani palabra a palabra), `quran_metadata` (metadatos de sura y aleya), `quran_transliteration` (transcripción tayika), `quran_fa_translation` (traducción persa), `quran_ru_kuliev` (traducción rusa de Kuliev), `quran_tj_ayati`, `quran_tj_alomuddin` (con tafsir), `quran_tj_pioneers` (traducciones tayikas) y `quran_tafsir_osonbayon` (tafsir).

No se documenta el esquema exacto de los JSON, el número de registros, la tokenización utilizada ni el proceso de alineamiento palabra a palabra. Tampoco se indica si los textos han pasado por validación editorial o corrección ortográfica.

## Capacidades

- Distribución de texto coránico en árabe con segmentación palabra a palabra (QPC V4 y Uthmani).
- Metadatos estructurados de suras y aleyas para indexación y navegación.
- Transcripción fonética en tayiko.
- Traducciones al persa, ruso (Kuliev) y tayiko (Ayati, Alomuddin, Pioneers).
- Tafsir completo (Osanbayon) y una traducción tayika con tafsir integrado.
- Paginación con anotaciones de tajwid (reglas de recitación).
- No incluye tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, al no ser un modelo generativo.

## Casos de uso

- Aplicación de lectura coránica sincronizada: usar `qpc-v4` y `uthmani-wbw` para resaltar cada palabra árabe y mostrar su traducción alineada al pasar el cursor, aprovechando la segmentación palabra a palabra.
- Buscador multilingüe de aleyas: indexar las traducciones persa, rusa y tayika junto con los metadatos para permitir búsquedas por texto en cualquiera de esos idiomas y devolver la referencia de sura y aleya.
- Entrenamiento o evaluación de modelos de NLP en tayiko: emplear `quran_transliteration` y las traducciones tayikas como corpus paralelo para tareas de traducción automática o transliteración.
- Herramienta de estudio con tafsir: integrar `quran_tafsir_osonbayon` y `quran_tj_alomuddin` en una interfaz que muestre el versículo, su traducción y el comentario exegético en paneles separados.
- Motor de recitación con tajwid: usar `qpc-v4-tajweed-pages` para renderizar páginas con las reglas de recitación anotadas, útil en aplicaciones móviles de aprendizaje.
- Pipeline de alineamiento léxico árabe-tayiko: explotar la correspondencia palabra a palabra para construir un diccionario estadístico o un modelo de alineación a nivel de palabra.
- Generación de audiolibros o subtítulos: combinar la transcripción tayika con la segmentación por aleyas para producir subtítulos sincronizados en vídeos de recitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia de modelo: el consumo es de almacenamiento y ancho de banda para descargar los `.zip`.
- El tamaño de cada archivo no está indicado en la model card; conviene comprobar el tamaño de los assets en la página de releases de GitHub antes de descargarlos.
- Despliegue típico: servidor web o CDN que sirva los JSON, o carga en memoria en una aplicación cliente (móvil o web).
- Para búsqueda sobre el corpus, un índice invertido en SQLite FTS5 o Elasticsearch es suficiente; no se requiere GPU.
- Si se usa el corpus para entrenar o hacer fine-tuning de un modelo de NLP, los requisitos de VRAM dependerán del modelo elegido, no de este dataset.

## Comparativa con modelos similares

| Recurso | Tipo | Contenido | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `imomzoda-dev/quran-data` | Dataset | Texto QPC V4 y Uthmani, metadatos, tafsir, traducciones | Árabe, tayiko, persa, ruso | no disponible | JSON en `.zip` |
| Tanzil Quran Text | Dataset | Texto árabe y traducciones | Árabe y múltiples | no disponible en la información proporcionada | TXT/XML |
| Quran.com API | API | Texto, traducciones, audio, tafsir | Múltiples | no disponible en la información proporcionada | JSON vía HTTP |

No se dispone de datos verificados sobre parámetros, contexto ni rendimiento de alternativas en la información proporcionada; la comparación se limita al tipo de recurso y su contenido declarado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite prompts; cualquier uso como "modelo" es un error de categorización.
- La licencia no está declarada, lo que impide asumir permiso para uso comercial o redistribución; es necesario contactar con el autor antes de integrarlo en un producto.
- No se documenta el esquema JSON, el número de registros ni el proceso de validación del texto; la calidad editorial de las traducciones y del tafsir no está verificada.
- El texto coránico es sensible: errores de transcripción, diacríticos o alineamiento pueden tener consecuencias religiosas y legales; se recomienda contrastar con fuentes reconocidas (Tanzil, King Fahd Complex) antes de publicar.
- La model card está en tayiko y no incluye instrucciones de uso, citación ni limitaciones; la documentación técnica es prácticamente inexistente.
- El repositorio tiene 0 descargas y 0 likes, sin historial de mantenimiento verificable más allá de las fechas de creación y actualización.
- Las fechas de creación (2026-11-05) y actualización (2026-08-03) son incoherentes entre sí, lo que sugiere metadatos erróneos o manipulación; conviene verificar la integridad de los artefactos.
- No se indica si las traducciones tienen derechos de autor de terceros (Kuliev, Ayati, etc.), lo que añade riesgo legal adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/imomzoda-dev/quran-data
- Release v1.0 en GitHub: https://github.com/SakinaDevGroup/quran-data/releases/tag/v1.0
- Texto QPC V4 palabra a palabra: https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/qpc-v4.zip
- Paginación QPC V4 con tajwid: https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/qpc-v4-tajweed-pages.zip
- Texto Uthmani palabra a palabra: https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/uthmani-wbw.zip
- Metadatos de suras y aleyas: https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/quran_metadata.zip
- Transcripción tayika: https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/quran_transliteration.zip
- Traducción persa: https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/quran_fa_translation.zip
- Traducción rusa (Kuliev): https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/quran_ru_kuliev.zip
- Traducción tayika (Ayati): https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/quran_tj_ayati.zip
- Traducción tayika con tafsir (Alomuddin): https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/quran_tj_alomuddin.zip
- Traducción tayika (Pioneers): https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/quran_tj_pioneers.zip
- Tafsir Osanbayon: https://github.com/SakinaDevGroup/quran-data/releases/download/v1.0/quran_tafsir_osonbayon.zip
