# cstr/crispembed-spacy-en-core-web-sm-3.8.0

## Resumen

CrispEmbed native English spaCy `en_core_web_sm` 3.8.0 es una conversión del pipeline oficial de spaCy para inglés a un formato GGUF que puede ser ejecutado por un runtime nativo en C++/ggml, sin necesidad de Python en tiempo de inferencia. Lo desarrolla el usuario cstr dentro del ecosistema CrispEmbed, y su propósito es ofrecer análisis lingüístico completo (tokenización, POS tagging, morfología, lematización, dependency parsing y NER) en entornos donde no se desea o no se puede desplegar un intérprete de Python.

No es un modelo de lenguaje generativo, sino un pipeline de procesamiento lingüístico determinista de 3,18 millones de parámetros (12,75 MB en F32), empaquetado junto con recursos auxiliares (reglas de tokenizador, tablas NORM, lookups y patrones de attribute-ruler) en un fichero `resources.json` de 3,45 MB. La relevancia radica en que traslada la fidelidad del pipeline original de spaCy a un entorno nativo con verificación criptográfica de integridad y paridad verificada frente a spaCy 3.8.18 sobre el test set UD English-EWT.

La licencia es MIT y el bundle está pensado exclusivamente para inglés. Requiere una biblioteca nativa (`libcrispembed-spacy`) compilada con el runtime v2 (PR #244); versiones anteriores del runtime rechazan este bundle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy serializado en GGUF (arquitectura `spacy_pipeline_v2`): tok2vec, tagger, parser, attribute_ruler, lemmatizer, ner |
| Parametros totales | 3.187.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por documento, sin ventana fija declarada) |
| Tipos de cuantizacion | F32 (único formato publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (`bundle/model.gguf`, 12.752.960 bytes) + `bundle/resources.json` (3.451.396 bytes) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por cstr: es una conversión byte a byte del wheel oficial `en_core_web_sm-3.8.0-py3-none-any.whl` (12.806.118 B, SHA-256 `1932429db727d4bff3deed6b34cfc05df17794f4a52eeb26cf8928f7c1a0fb85`), publicado por Explosion. El pipeline incluye los componentes tok2vec, tagger, parser, attribute_ruler, lemmatizer y ner, con los pesos en F32 y la arquitectura GGUF identificada como `spacy_pipeline_v2`. Los recursos lingüísticos (reglas de tokenización, tablas de normalización, lookups, patrones del attribute-ruler y etiquetas) se separan en `resources.json` con `format_version 2`.

La conversión se realizó con el script `models/convert-spacy-pipeline-to-gguf.py` del repositorio CrispEmbed, en un entorno Linux x86-64 con hash-lock (CrispEmbed `509042a9176f`, run 44377019364). La cualificación reportada indica paridad total con spaCy 3.8.18 sobre el test set UD English-EWT r2.14: 2.077/2.077 textos idénticos en tag, pos, morph, lemma, dep, head y límites de oración (25.531 tokens), y 1.876/1.876 entidades idénticas. Se verificó también en macOS arm64 y en Linux x86-64 alojado, con `model.gguf` byte a byte idéntico entre plataformas.

## Capacidades

- Tokenización con spans sobre el texto original.
- Etiquetado POS fino y grueso (fine/coarse part of speech).
- Análisis morfológico (morph).
- Lematización.
- Dependency parsing con heads y relaciones.
- Segmentación en oraciones.
- Reconocimiento de entidades nombradas con 18 tipos: CARDINAL, DATE, EVENT, FAC, GPE, LANGUAGE, LAW, LOC, MONEY, NORP, ORDINAL, ORG, PERCENT, PERSON, PRODUCT, QUANTITY, TIME, WORK_OF_ART.
- Ejecución nativa sin Python en tiempo de inferencia, a través de una API C (`crispembed_spacy_*`).
- Verificación de integridad SHA-256 por fichero, impuesta por el host y por el runtime.
- No soporta tool calling, agentes, generación de texto ni multimodalidad; es un pipeline puramente analítico.

## Casos de uso

- Preprocesado lingüístico en pipelines nativos: integración en servicios escritos en C/C++/Rust que necesitan POS, lemas y dependencias sin arrastrar un intérprete de Python ni sus dependencias.
- Extracción de entidades en ingesta documental: uso del componente NER para poblar índices de búsqueda con PERSON, ORG, GPE, DATE y MONEY en corpus en inglés.
- Anotación de corpus para investigación en PLN: generación de anotaciones morfosintácticas y de dependencias sobre textos en inglés dentro de flujos reproducibles y con verificación criptográfica de los pesos.
- Enriquecimiento en buscadores y motores de recuperación: lematización y etiquetado POS para normalizar consultas y documentos antes de la indexación.
- Análisis de sentencias y dependencias en aplicaciones de conformidad o auditoría de texto: reconstrucción de estructura oracional y entidades para trazabilidad de documentos.
- Despliegue en entornos restringidos (edge, contenedores mínimos, sistemas embebidos x86-64 o arm64): el bundle de 16 MB totales y la ausencia de dependencias Python facilitan el empaquetado.
- Extracción de metadatos estructurados en herramientas de ofimática o CMS: identificación de fechas, importes y organizaciones en texto libre en inglés.

## Benchmarks y rendimiento

| Prueba | Resultado | Referencia |
|---|---|---|
| UD English-EWT r2.14, test, textos exactos | 2.077/2.077 | spaCy 3.8.18 |
| UD English-EWT r2.14, test, tokens comparados | 25.531 | spaCy 3.8.18 |
| UD English-EWT r2.14, test, entidades exactas | 1.876/1.876 | spaCy 3.8.18 |
| Paridad macOS arm64 (tag, pos, morph, lemma, dep, head, oraciones) | idéntica | spaCy 3.8.18 |
| Paridad Linux x86-64 alojado | idéntica, `model.gguf` byte a byte | conversión en runner |

No se han publicado métricas absolutas de precisión/recall (F1) para este bundle en la información disponible; la cualificación reportada es de equivalencia con el pipeline original, no de rendimiento absoluto.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el bundle ocupa 12,75 MB (pesos) + 3,45 MB (recursos) en disco y se carga en memoria del proceso. Huella de RAM estimada en decenas de MB, sin cifra oficial publicada.
- GPU: no se requiere GPU; el runtime es C++/ggml y el modelo es de 3,18 M de parámetros en F32.
- Consumer GPU: irrelevante para este modelo; cabe en cualquier equipo con unos pocos cientos de MB de RAM libre.
- Plataformas cualificadas: macOS arm64 y Linux x86-64 (runs de cualificación); se lista además una cápsula linux-arm64 que carga el bundle.
- Despliegue: biblioteca nativa `libcrispembed-spacy` (cápsulas publicadas en `cstr/crispembed-spacy-de-core-news-sm-3.8.0`), invocación vía API C o ctypes. No compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| CrispEmbed spaCy en_core_web_sm 3.8.0 (este) | 3,18 M | no disponible | en | MIT | GGUF + resources.json | Runtime nativo sin Python; paridad verificada con spaCy 3.8.18 |
| spaCy `en_core_web_sm` 3.8.0 (original) | 3,18 M (equivalente) | no disponible | en | MIT | wheel Python (`.whl`) | Requiere Python y spaCy en tiempo de ejecución |
| CrispEmbed spaCy `de_core_news_sm` 3.8.0 | no disponible en la información | no disponible | de | MIT | GGUF + resources.json | Mismo runtime; aloja las cápsulas de biblioteca compartidas |
| Stanford Stanza (pipeline en) | no disponible | no disponible | en y otros | Apache 2.0 | PyTorch | Alternativa Python con dependencias de framework |

No se dispone de datos de rendimiento comparativo más allá de la equivalencia funcional con spaCy 3.8.18 declarada por el autor.

## Limitaciones y advertencias

- Solo inglés: no procesa otros idiomas; el bundle alemán es un repositorio separado.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Requiere el runtime CrispEmbed v2 (PR #244); builds anteriores rechazan el bundle y `crispembed_spacy_attach_ner` y los servicios numéricos preparados son exclusivos del bundle alemán y rechazan este.
- La descarga debe hacerse desde la revisión inmutable `eb659259b489593ddf29c747bc4562fbad5570f4`, nunca desde `main`, verificando SHA-256 y longitud de cada fichero antes de parsearlo.
- El host debe pasar los SHA-256 correctos; el runtime rechaza modelos o recursos cuyo hash no coincida.
- No se hace ninguna declaración de corrección gramatical para este idioma; las afirmaciones se limitan al análisis lingüístico.
- Sesgos y tasas de alucinación: no disponibles en la información proporcionada; al ser un pipeline determinista, el riesgo relevante es de error de etiquetado, no de generación.
- Sin datos publicados de latencia, throughput ni consumo de memoria en producción.
- Aunque la licencia es MIT, el autor incluye `LICENSES_SOURCES` con avisos de las fuentes de entrenamiento del wheel original; conviene revisarlos antes de un uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/cstr/crispembed-spacy-en-core-web-sm-3.8.0
- Repositorio del bundle alemán (cápsulas de biblioteca compartidas): https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0
- Wheel oficial de spaCy `en_core_web_sm` 3.8.0: https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl
- Fichero de pesos (revisión inmutable): https://huggingface.co/cstr/crispembed-spacy-en-core-web-sm-3.8.0/resolve/eb659259b489593ddf29c747bc4562fbad5570f4/bundle/model.gguf
- Recursos lingüísticos: https://huggingface.co/cstr/crispembed-spacy-en-core-web-sm-3.8.0/resolve/eb659259b489593ddf29c747bc4562fbad5570f4/bundle/resources.json
- Manifiesto del conversor: https://huggingface.co/cstr/crispembed-spacy-en-core-web-sm-3.8.0/resolve/eb659259b489593ddf29c747bc4562fbad5570f4/bundle/manifest.json
- Licencia del modelo: https://huggingface.co/cstr/crispembed-spacy-en-core-web-sm-3.8.0/resolve/eb659259b489593ddf29c747bc4562fbad5570f4/bundle/LICENSE
- Avisos de fuentes de entrenamiento: https://huggingface.co/cstr/crispembed-spacy-en-core-web-sm-3.8.0/resolve/eb659259b489593ddf29c747bc4562fbad5570f4/bundle/LICENSES_SOURCES
- UD English-EWT r2.14 (corpus de cualificación, CC BY-SA 4.0): no disponible como enlace directo en la información proporcionada
