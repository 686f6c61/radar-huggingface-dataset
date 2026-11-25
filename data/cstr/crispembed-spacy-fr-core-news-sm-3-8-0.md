# cstr/crispembed-spacy-fr-core-news-sm-3.8.0

## Resumen

CrispEmbed native French spaCy — fr_core_news_sm 3.8.0 es una conversión del pipeline oficial de spaCy `fr_core_news_sm` 3.8.0 al formato GGUF, empaquetada con el runtime nativo C++/ggml de CrispEmbed. El objetivo es ejecutar análisis lingüístico completo de francés (tokenización, etiquetado POS, morfología, lematización, análisis de dependencias y reconocimiento de entidades nombradas) sin necesidad de Python en tiempo de ejecución. Lo desarrolla el usuario `cstr` sobre el wheel oficial de Explosion.

El modelo no es un LLM generativo, sino un pipeline de procesamiento lingüístico de aproximadamente 3,19 millones de parámetros que replica el comportamiento del pipeline original de spaCy. Su relevancia radica en que permite integrar análisis NLP de francés en aplicaciones nativas (C, C++, Rust, Go) con una dependencia mínima y verificación criptográfica de integridad de los ficheros.

La validación reportada por el autor es estricta: 416/416 textos de test del corpus UD French-GSD (9.786 tokens) producen resultados idénticos a spaCy 3.8.18 en tag, POS, morfología, lema, dependencias, heads y límites de oración, y 469/469 entidades coinciden. El bundle contiene solo el modelo de idioma; la biblioteca nativa es independiente del idioma y se publica en un repositorio separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy (tok2vec, morphologizer, parser, attribute_ruler, lemmatizer, ner) convertido a GGUF, arquitectura `spacy_pipeline_v2` |
| Parámetros totales | 3.194.023 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa por texto, sin ventana de contexto definida) |
| Tipos de cuantización | F32 (único formato publicado) |
| Idiomas soportados | francés (fr) |
| Licencia | LGPL-LR (`lgpl-lr`, según la model card) |
| Formato de pesos | GGUF (`bundle/model.gguf`, 12.780.352 bytes) + `resources.json` (35.391.368 bytes) |
| Tamaño del repo | 0.0 GB (según Hugging Face) |
| Librería | crispembed |
| Descargas | 78 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del pipeline `fr_core_news_sm` de spaCy 3.8.0, compuesto por seis componentes: `tok2vec`, `morphologizer`, `parser`, `attribute_ruler`, `lemmatizer` y `ner`. La conversión se realizó con el script `models/convert-spacy-pipeline-to-gguf.py` a partir del wheel oficial `fr_core_news_sm-3.8.0-py3-none-any.whl` (16.271.721 bytes, SHA-256 `7d6ad14cd5078e53147bfbf70fb9d433c6a3865b695fda2657140bbc59a27e29`).

No se proporcionan en la información disponible datos sobre el corpus de entrenamiento original, número de tokens, composición del dataset ni si hubo RLHF/DPO (no aplica a un pipeline de este tipo). El bundle separa los pesos (`model.gguf`, F32) de los recursos auxiliares (`resources.json`), que contiene reglas de tokenizador, tablas NORM, lookups, patrones del attribute-ruler y etiquetas (format_version 2). La conversión se realizó en un entorno Linux x86-64 con hash bloqueado (CrispEmbed `509042a9176f`, run 44377019364).

## Capacidades

- Tokenización con spans sobre el texto original.
- Etiquetado de parte de la oración fino y grueso (fine/coarse POS).
- Análisis morfológico.
- Lematización.
- Análisis de dependencias (heads y relaciones).
- Segmentación en oraciones.
- Reconocimiento de entidades nombradas con etiquetas LOC, MISC, ORG y PER.
- Ejecución nativa sin Python en tiempo de ejecución (C ABI).
- Verificación de integridad SHA-256 de modelo y recursos en tiempo de carga.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM generativo).
- Capacidad multilingüe limitada al francés; la biblioteca nativa es independiente del idioma pero este bundle solo sirve francés.

## Casos de uso

- Preprocesado de corpus franceses en pipelines de NLP nativos: el modelo permite tokenizar, lematizar y etiquetar POS sin dependencia de Python, integrándose en herramientas escritas en C, C++ o Rust.
- Extracción de entidades nombradas en documentos: el componente NER integrado identifica personas, organizaciones, lugares y miscelánea, útil para indexación y búsqueda sobre textos en francés.
- Análisis sintáctico para sistemas de extracción de información: las relaciones de dependencia permiten construir árboles sintácticos que alimentan reglas de extracción de hechos.
- Enriquecimiento de metadatos en motores de búsqueda: lematización y POS permiten normalizar términos y mejorar la recuperación en francés.
- Procesamiento por lotes en entornos embebidos o de bajos recursos: con ~12,8 MB de pesos F32 y sin runtime Python, es adecuado para despliegues ligeros.
- Verificación de integridad en pipelines regulados: la carga exige SHA-256 y longitud de cada fichero, lo que facilita auditorías de cadena de suministro en producción.
- Análisis lingüístico en aplicaciones de escritorio nativas: la API C permite incrustar el análisis en editores o herramientas de escritorio sin empaquetar un intérprete de Python.

## Benchmarks y rendimiento

| Plataforma | Resultado | Textos exactos | Tokens | Entidades |
|---|---|---:|---:|---:|
| macOS arm64 (run de desarrollo) | coincide con spaCy 3.8.18 | 416/416 | 9.786 | 469/469 |
| Linux x86-64 (run 44363955799) | coincide con spaCy 3.8.18 | 416/416 | 9.786 | 469/469 |
| linux-arm64 (carga y coincidencia) | coincide | no disponible | no disponible | no disponible |

La comparación se realizó contra spaCy 3.8.18 sobre el texto en bruto del test UD French-GSD r2.14 (CC BY-SA 4.0). No se han publicado métricas de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; los pesos F32 ocupan ~12,8 MB y los recursos ~35,4 MB, por lo que la huella es mínima y cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el runtime es nativo C++/ggml y no requiere GPU necesariamente.
- Cabe en GPU consumer: sí, con amplio margen (RTX 4090, RTX 3060, etc.), aunque el modelo no está pensado para aceleración GPU masiva.
- Opciones de despliegue: biblioteca nativa `libcrispembed-spacy` (C ABI) publicada en `cstr/crispembed-spacy-de-core-news-sm-3.8.0`; requiere builds con el runtime v2 (PR #244). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| crispembed-spacy-fr-core-news-sm-3.8.0 | 3.194.023 | no disponible | fr | LGPL-LR | GGUF + JSON |
| spaCy fr_core_news_sm 3.8.0 (original) | no disponible | no disponible | fr | MIT (spaCy) / modelo según wheel | wheel Python |
| crispembed-spacy-de-core-news-sm-3.8.0 | no disponible | no disponible | de | no disponible | GGUF + JSON |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo procesa francés; no es multilingüe.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Solo se publica en F32; no hay variantes cuantizadas.
- Requiere builds de CrispEmbed con el runtime v2 (PR #244); versiones anteriores rechazan el bundle.
- La descarga debe hacerse desde la revisión inmutable (`/resolve/<40-hex revision>/…`), nunca desde `main`, y verificando SHA-256 y longitud de cada fichero.
- `crispembed_spacy_attach_ner` y los servicios numéricos preparados son solo para alemán y rechazan este bundle.
- No se hace ninguna afirmación sobre corrección gramatical para este idioma.
- Riesgo de sesgos y alucinaciones: no disponible en la información (no es un modelo generativo, pero el NER puede heredar sesgos del corpus de entrenamiento original).
- Licencia LGPL-LR: revisar las condiciones para uso comercial antes de integrar en productos propietarios.

## Enlaces

- Hugging Face: https://huggingface.co/cstr/crispembed-spacy-fr-core-news-sm-3.8.0
- Wheel oficial: https://github.com/explosion/spacy-models/releases/download/fr_core_news_sm-3.8.0/fr_core_news_sm-3.8.0-py3-none-any.whl
- Biblioteca nativa (cápsula): https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0
- Fichero de modelo: https://huggingface.co/cstr/crispembed-spacy-fr-core-news-sm-3.8.0/resolve/5e90593195cc4ecd20ceb864d932d7d7f5e3d762/bundle/model.gguf
- Recursos: https://huggingface.co/cstr/crispembed-spacy-fr-core-news-sm-3.8.0/resolve/5e90593195cc4ecd20ceb864d932d7d7f5e3d762/bundle/resources.json
- Licencia: https://huggingface.co/cstr/crispembed-spacy-fr-core-news-sm-3.8.0/blob/5e90593195cc4ecd20ceb864d932d7d7f5e3d762/bundle/LICENSE
- Manifiesto: https://huggingface.co/cstr/crispembed-spacy-fr-core-news-sm-3.8.0/resolve/5e90593195cc4ecd20ceb864d932d7d7f5e3d762/bundle/manifest.json
