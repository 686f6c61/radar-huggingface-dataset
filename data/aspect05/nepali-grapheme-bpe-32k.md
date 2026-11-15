# Aspect05/nepali-grapheme-bpe-32k

## Resumen

`nepali-grapheme-bpe-32k` es un tokenizador BPE disenado especificamente para nepalí (escritura devanagari) e ingles, publicado por el usuario Aspect05 en Hugging Face. No es un modelo de lenguaje, sino el componente de tokenizacion que se situaria por delante de un LLM o de un encoder tipo BERT. Su propuesta central es tratar los grupos de grafemas Unicode (UAX #29) como unidades atomicas y aplicar una segmentacion morfologica basada en reglas del nepalí en las fronteras de grafema, con el objetivo de evitar que los tokens se rompan a mitad de un grafema combinado, algo habitual en los tokenizadores multilingues genericos.

El vocabulario es de 32.000 entradas (5 tokens especiales y 256 tokens de byte), con un inventario de 3.374 grafemas y 23.183 fusiones BPE. La normalizacion de entrada es NFC, de modo que `decode(encode(x)) == NFC(x)`, y el fallback a bytes UTF-8 elimina por completo el token `<UNK>`. El autor lo presenta explicitamente como un artefacto de investigacion en prepublicacion privada, y advierte de que las metricas de tokenizacion no demuestran por si solas la calidad del modelo aguas abajo.

La relevancia practica esta en que el nepalí, con un sistema de escritura abugida con conjuntos consonanticos, sufre una fertilidad muy alta en tokenizadores occidentales: segun los datos del autor, Qwen2.5 necesita 6,20 tokens por palabra en nepalí frente a 1,56 del tokenizador propuesto. Esto se traduce directamente en coste de contexto y en calidad de representacion para cualquier modelo que se entrene con este vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE a nivel de grafema (UAX #29) con segmentacion morfologica basada en reglas |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo que use el tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | nepalí (ne) e ingles (en) |
| Licencia | other |
| Formato de pesos | ficheros de tokenizador de `transformers` (vocabulario y merges; clase personalizada `tokenization_nepali_grapheme.py`) |

Parametros adicionales de configuracion:

| Parametro | Valor |
|---|---|
| Tamano de vocabulario | 32.000 (5 especiales + 256 de byte) |
| Inventario de grafemas | 3.374 (cubre 0,9990 de las apariciones de grafemas multicodigo) |
| Fusiones BPE | 23.183 |
| Normalizacion | NFC |
| Morfologia | activada (split de morfemas nepalíes en fronteras de grafema) |
| Unidades de grafema | activadas |
| Frecuencia minima | 2 |
| Version Unicode | 15.0.0 |
| Version de `tokenizers` | 0.23.1 |
| Marcador de espacio | `▁` |
| Fallback | bytes UTF-8 (sin `<UNK>`) |

## Arquitectura y entrenamiento

El tokenizador combina tres capas. Primero, un inventario de grafemas Unicode construido segun UAX #29 que agrupa las secuencias de marcas combinantes y conjuntos devanagari en unidades indivisibles; este inventario cubre el 0,9990 de las apariciones de grafemas multicodigo en el corpus. Segundo, una segmentacion morfologica basada en reglas del nepalí aplicada en las fronteras de grafema, que separa prefijos, sufijos y raices antes de la fusion BPE. Tercero, un BPE estandar sobre esas unidades con 23.183 fusiones, marcador de espacio `▁` y fallback a bytes UTF-8.

Los datos de entrenamiento provienen de 25 shards en nepalí y 8 en ingles (aproximadamente un 26% de ingles por palabras), con 8.147.993 lineas totales. El corpus se deduplico de forma exacta y mediante MinHash para casi duplicados, y se descontamino contra FLORES+. Las fuentes son Wikipedia nepalí (5,1 M palabras), IndicCorp V2 (775,4 M palabras), `spandyie/nepali-news-dataset` (76,2 M palabras, licencia por verificar) y una muestra de FineWeb-Edu (386,4 M palabras).

Una innovacion tecnica destacable es la comprobacion en tiempo de carga de la version de la libreria `regex`: a partir de 2026.11.7 se dividen los conjuntos devanagari segun la regla GB9c de UAX #29, y el tokenizador lanza un error si detecta una version que no cumple, en lugar de producir tokens incorrectos silenciosamente. Esto obliga a fijar `regex<2026.11.7` en el entorno.

## Capacidades

- Tokenizacion y detokenizacion de texto en nepalí (devanagari) e ingles con round-trip NFC exacto.
- Tratamiento atomico de grafemas: evita tokens que empiezan por marca combinante (mid_grapheme de 0,0021 en nepalí, frente a 0,2387 de GPT-4o o 0,2961 de Qwen2.5).
- Segmentacion morfologica del nepalí en fronteras de grafema, expuesta mediante el metodo `readable_tokens()` para inspeccionar la segmentacion con grafemas visibles.
- Cobertura total sin `<UNK>` gracias al fallback de bytes UTF-8, lo que permite codificar cualquier cadena Unicode.
- Metodo auxiliar `readable_tokens()` para depuracion y analisis linguistico de la segmentacion.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un tokenizador.
- No soporta otros idiomas de forma nativa; el comportamiento sobre escrituras distintas del devanagari y el latin depende del fallback de bytes.

## Casos de uso

- Entrenamiento de un LLM o encoder desde cero para nepalí: el tokenizador reduce la fertilidad a 1,56 tokens por palabra en texto nepalí retenido, frente a 2,15 de GPT-4o o 6,20 de Qwen2.5, lo que permite cubrir mas texto real con la misma ventana de contexto y abarata el preentrenamiento.
- Adaptacion de vocabulario para un modelo multilingue existente: se puede sustituir el tokenizador original por este y reentrenar los embeddings de entrada y salida, obteniendo mejor representacion del devanagari sin rehacer el resto del modelo.
- Sistemas de busqueda y recuperacion (RAG) sobre corpus nepalíes: la tokenizacion consistente a nivel de grafema mejora la coincidencia lexica en indices invertidos y en BM25, donde los tokens partidos por marcas combinantes degradan la precision.
- Analisis linguistico y corpus tools: el split morfologico y `readable_tokens()` permiten construir analizadores de morfemas, etiquetadores y herramientas de anotacion sobre texto nepalí con fronteras de grafema correctas.
- Pipelines de traduccion nepalí-ingles: al compartir vocabulario entre ambos idiomas con fertilidades equilibradas (1,56 en ne y 1,53 en en sobre datos retenidos), se reduce el desbalance de longitud entre origen y destino en modelos seq2seq.
- Evaluacion de tokenizadores en investigacion: sirve como linea base reproducible para comparar fertilidad, round-trip NFC y mid_grapheme frente a GPT-4o, IndicBERTv2, MuRIL, mBERT, NepBERTa o Qwen2.5 sobre FLORES+.
- Preprocesamiento para clasificacion de noticias nepalíes: con las fuentes de noticias del corpus y una tokenizacion estable, se puede alimentar un clasificador de temas o de deteccion de sesgo sin perder informacion morfologica.

## Benchmarks y rendimiento

Los datos publicados son metricas de tokenizacion, no de calidad de modelo. `fertility` = tokens por palabra separada por espacio; `mid_grapheme` = proporcion de tokens que empiezan por marca combinante.

| Tokenizador | Conjunto | Fertility | Chars/token | Round-trip NFC | Fallback de byte | Mid_grapheme |
|---|---|---|---|---|---|---|
| en25_ne25 (este) | ne_heldout | 1,5622 | 4,1217 | 1,0 | 9,7e-06 | 0,0020781 |
| en25_ne25 (este) | flores_ne_devtest | 1,7136 | 3,96 | 1,0 | 0,0 | 0,0020595 |
| en25_ne25 (este) | en_heldout | 1,527 | 4,0112 | 1,0 | 0,0001001 | 1,44e-05 |
| en25_ne25 (este) | flores_en_devtest | 1,4719 | 4,0936 | 1,0 | 0,0 | 0,0 |
| gpt-4o-o200k | flores_ne_devtest | 2,3195 | 2,9256 | 1,0 | 0,0 | 0,2583166 |
| gpt-4o-o200k | ne_heldout | 2,1451 | 3,0018 | 0,99964 | 0,0 | 0,2387231 |
| qwen2.5 | flores_ne_devtest | 6,5215 | 1,0405 | 1,0 | 0,0 | 0,2939127 |
| qwen2.5 | ne_heldout | 6,1974 | 1,039 | 1,0 | 0,0 | 0,2961397 |
| indicbertv2 | flores_ne_devtest | 1,5783 | 4,2996 | 0,0 | 0,0 | 3,39e-05 |
| indicbertv2 | ne_heldout | 1,4481 | 4,4466 | 0,00772 | 0,0 | 4,63e-05 |
| muril-base-cased | flores_ne_devtest | 1,4905 | 4,5529 | 0,00296 | 0,0 | 3,59e-05 |
| iriis-bert-nepali | flores_ne_devtest | 1,4738 | 4,6043 | 0,78458 | 0,0 | 0,0278282 |
| nepalibert | flores_ne_devtest | 1,4653 | 4,631 | 0,00296 | 0,0 | 3,65e-05 |
| nepberta | flores_ne_devtest | 1,4809 | 4,5823 | 0,00296 | 0,0 | 3,61e-05 |
| sakonii-nepali | ne_heldout | 1,3522 | 4,7619 | 0,89302 | 0,0 | 0,0339647 |

Lectura de los datos: el tokenizador propuesto no es el de menor fertilidad en nepalí (IndicBERTv2, MuRIL y NepBERTa quedan por debajo en algunos conjuntos), pero es el unico de la comparativa que combina fertilidad competitiva en ambos idiomas, round-trip NFC exacto (1,0) y mid_grapheme practicamente nulo. Los tokenizadores de BERT multilingues sacrifican el round-trip (valores entre 0,0 y 0,38) y los tokenizadores de LLM genericos rompen grafemas con frecuencia.

## Requisitos de hardware

- Inferencia: al ser un tokenizador, no requiere GPU. La tokenizacion se ejecuta en CPU con la libreria `tokenizers` (Rust) y el coste es de microsegundos a milisegundos por documento.
- VRAM: 0 GB. Memoria RAM del orden de decenas de MB para cargar vocabulario y merges.
- GPU recomendadas: no aplica. Cualquier GPU del sistema sirve solo si el modelo que consume el tokenizador la necesita.
- Cabe en cualquier consumer GPU y en cualquier CPU: no hay requisito de acelerador.
- Despliegue: `transformers` con `AutoTokenizer.from_pretrained(..., trust_remote_code=True)`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que estos motores esperan tokenizadores estandar y no cargan clases personalizadas sin adaptacion.
- Latencia y throughput: no publicados. El cuello de botella en produccion sera el modelo neuronal que use el tokenizador, no el tokenizador en si.
- Dependencia critica de entorno: `regex<2026.11.7` y `tokenizers` 0.23.1; el tokenizador aborta la carga si detecta una version de `regex` con la regla GB9c corregida.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Idiomas | Fertilidad ne (FLORES+) | Round-trip NFC | Licencia |
|---|---|---|---|---|---|---|
| en25_ne25 (este) | BPE por grafema + morfologia | 32.000 | ne, en | 1,7136 | 1,0 | other |
| gpt-4o-o200k | BPE de LLM generico | 200.000 | multilingue | 2,3195 | 1,0 | propietaria |
| qwen2.5 | BPE de LLM generico | no disponible en la informacion | multilingue | 6,5215 | 1,0 | no disponible |
| indicbertv2 | WordPiece/SentencePiece para indico | no disponible en la informacion | indico + en | 1,5783 | 0,0 | no disponible |
| muril-base-cased | WordPiece multilingue | no disponible en la informacion | multilingue | 1,4905 | 0,00296 | no disponible |
| nepalibert | tokenizador especifico nepalí | no disponible en la informacion | ne, en | 1,4653 | 0,00296 | no disponible |
| nepberta | tokenizador especifico nepalí | no disponible en la informacion | ne, en | 1,4809 | 0,00296 | no disponible |

Frente a los tokenizadores especificos de nepalí (NepBERTa, NepalBERT, IRIS-BERT), la diferencia clave no es la fertilidad sino la preservacion del round-trip NFC y la ausencia de tokens que empiezan por marca combinante. Frente a los tokenizadores de LLM genericos, la ventaja es una fertilidad entre 1,3 y 3,8 veces menor en nepalí.

## Limitaciones y advertencias

- Artefacto de investigacion en prepublicacion privada: el autor advierte explicitamente de que las metricas de tokenizacion no garantizan calidad del modelo aguas abajo.
- Licencia `other` sin texto de licencia publicado en la informacion disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion. Verificar antes de integrar en produccion.
- Una de las fuentes del corpus (`spandyie/nepali-news-dataset`) figura con licencia "to verify" en la propia model card, lo que introduce incertidumbre sobre la procedencia de parte de los datos.
- Requiere `trust_remote_code=True`: se ejecuta codigo Python del autor al cargar el tokenizador, lo que es un riesgo de seguridad en entornos no controlados.
- Dependencia fragil de versiones: `regex<2026.11.7` y `tokenizers` 0.23.1; versiones distintas pueden producir errores de carga o segmentaciones incorrectas.
- Cobertura limitada a nepalí e ingles: para otras escrituras el modelo recurre al fallback de bytes, con fertilidad muy alta y sin garantias de segmentacion morfologica.
- No hay resultados de benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje; no se pueden comparar capacidades cognitivas.
- Sin descargas ni likes en el momento de la ficha (0 y 0), lo que implica ausencia de validacion por parte de la comunidad.
- El split morfologico es basado en reglas, no aprendido: puede fallar en neologismos, prestamos y variantes ortograficas no cubiertas por las reglas.
- No hay soporte documentado en motores de inferencia estandar (vLLM, TGI, llama.cpp), lo que complica su uso en produccion con LLMs existentes.

## Enlaces

- Hugging Face: https://huggingface.co/Aspect05/nepali-grapheme-bpe-32k
- Incidencia de `regex` sobre la regla GB9c (UAX #29): https://github.com/mrabarnett/mrab-regex/issues/636
- Dataset IndicCorp V2 (referenciado en el corpus): no disponible enlace directo en la informacion
- Dataset FineWeb-Edu (referenciado en el corpus): no disponible enlace directo en la informacion
- Dataset `spandyie/nepali-news-dataset` (referenciado en el corpus): no disponible enlace directo en la informacion
- Paper o blog del autor: no disponible
