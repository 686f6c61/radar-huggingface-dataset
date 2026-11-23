# cstr/crispembed-spacy-de-core-news-sm-3.8.0

## Resumen

CrispEmbed native German spaCy — de_core_news_sm 3.8.0 es una reimplementación nativa en C++/ggml del pipeline entrenado de spaCy `de_core_news_sm` 3.8.0 para alemán, publicada por el usuario cstr bajo licencia MIT. No es un modelo de lenguaje generativo: es un pipeline de procesamiento lingüístico (tok2vec, tagger, morphologizer, parser, lemmatizer y attribute_ruler) convertido desde la wheel oficial de spaCy y empaquetado en formato GGUF para ejecutarse sin Python en tiempo de ejecución.

El modelo resuelve la necesidad de realizar análisis morfosintáctico de alemán (tokenización con spans sobre el texto original, POS fino y grueso, morfología, lemas, cabezas y relaciones de dependencia, y segmentación en frases) en entornos donde no se quiere desplegar un intérprete de Python ni el stack completo de spaCy. Con 1.845.054 parámetros y un peso GGUF F32 de unos 7,4 MB, está pensado para integrarse en aplicaciones nativas mediante la librería CrispEmbed, con verificación criptográfica de los artefactos y una API de habilitación explícita.

Es relevante por su enfoque de empaquetado reproducible: cada fichero se publica con SHA-256 y longitud, las descargas se fuerzan a revisiones inmutables y existen paquetes por plataforma (linux-arm64, linux-x86_64, macos-arm64) con evidencia de paridad numérica frente al spaCy original. La omisión de NER y senter en el pipeline principal (NER como opt-in separado) lo orienta a tareas de análisis gramatical y preprocesamiento, no a extracción de entidades por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy nativo en C++/ggml (tok2vec, tagger, morphologizer, parser, lemmatizer, attribute_ruler); sin transformer generativo |
| Parametros totales | 1.845.054 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por documento, sin ventana declarada) |
| Tipos de cuantizacion | F32 (pesos GGUF en coma flotante de 32 bits); no se documentan otras cuantizaciones |
| Idiomas soportados | Alemán (de) |
| Licencia | MIT |
| Formato de pesos | GGUF (`bundle/model.gguf`, 7.383.104 bytes); recursos auxiliares en `resources.json` y `manifest.json`; paquetes `.tar.gz` por plataforma |
| Tamano del repo | 0,1 GB |
| Libreria | crispembed |
| Descargas | 455 |
| Revision del bundle | `659dae33997d00296ae12b76510fa4dfe26540e0` |

## Arquitectura y entrenamiento

El modelo no entrena desde cero: es una conversión del pipeline oficial `de_core_news_sm` 3.8.0 de spaCy (wheel con SHA-256 `fec69fec52b1780f2d269d5af7582a5e28028738bd3190532459aeb473bfa3e7`), reimplementado en C++ sobre ggml. El pipeline incluye los componentes tok2vec (representaciones contextuales), tagger (POS), morphologizer (rasgos morfológicos), parser (dependencias y frases), lemmatizer (lemas) y attribute_ruler. Se omiten deliberadamente el componente `ner` (disponible como `ner.gguf` opcional separado) y el `senter` (desactivado, ya que el parser proporciona la segmentación en frases).

Los datos de entrenamiento originales no se detallan en la información disponible; proceden del pipeline oficial de spaCy para alemán, y el bundle incluye `LICENSES_SOURCES` con los avisos de las fuentes de entrenamiento verbatim de la wheel. La innovación técnica destacable es el empaquetado: árboles canónicos USTAR/gzip cerrados, cada miembro fijado por `distribution.json`, instalación mediante staging privado y publicación con un rename no-replace sobre directorio content-addressed. La librería nativa rechaza trabajar hasta que el host la habilita explícitamente (`crispembed_spacy_set_enabled(CRISPEMBED_SPACY_ENABLE_ANALYSIS)` o `CRISPEMBED_SPACY=1`), y nada se descarga en tiempo de análisis.

## Capacidades

- Tokenización con spans sobre el texto original.
- Etiquetado POS fino y grueso (fine/coarse part of speech).
- Análisis morfológico (morphologizer).
- Lematización.
- Análisis de dependencias: cabezas y relaciones de dependencia.
- Segmentación en frases (proporcionada por el parser).
- attribute_ruler para reglas de atributos.
- Ejecución sin Python en tiempo de ejecución (C++/ggml).
- NER no incluido por defecto; disponible como modelo opcional separado (`ner.gguf`).
- No soporta tool calling, function calling, agentes ni generación de texto: no es un modelo generativo.

## Casos de uso

- Preprocesamiento lingüístico en pipelines nativos: aplicaciones C++ que necesitan POS, lemas y dependencias sin embeber Python; el pipeline se ejecuta directamente sobre ggml y evita el coste de arranque del intérprete.
- Corrección y proofing de alemán: el consumidor Quds Office German analysis (`packages/quds_proofing_spacy`) usa estos ficheros tras una acción explícita del usuario para análisis gramatical en herramientas de ofimática.
- Indexación y búsqueda léxica: la lematización y el POS permiten normalizar términos alemanes antes de indexar, mejorando la recuperación frente a coincidencias superficiales.
- Análisis sintáctico para extracción de relaciones: las cabezas y relaciones de dependencia permiten construir árboles sintácticos sobre los que definir reglas de extracción sin un modelo generativo.
- Segmentación y anotación por lotes en servidores sin Python: los paquetes linux-x86_64 (AVX2) y linux-arm64 permiten desplegar el análisis en servicios de backend con verificación SHA-256 previa a la carga.
- Verificación de integridad en cadena de suministro: organizaciones que exigen artefactos content-addressed y descargas desde revisiones inmutables pueden fijar el bundle `659dae33…` y validar cada miembro antes de descomprimir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). La model card sí documenta evidencia de paridad frente al spaCy original:

| Prueba | Resultado |
|---|---|
| Paridad numérica en linux-x86_64 (run 44369523105) | 16 casos, 113 tokens, 1201 etapas numéricas exactas |
| spacy_smoke frente a spaCy original (linux-x86_64) | 60/60 textos de desarrollo, 835 tokens, 29/29 entidades exactas |
| Aceptación nativa (linux-x86_64, digest `ea89842ebf22…`) | 98 tokens, 13 frases, 851 etapas numéricas exactas |
| Panel manual de-DE Quds (linux-x86_64) | 22/30 frente a 5/30; extensión W7 24/40, 0 hallazgos válidos/de guarda |
| linux-arm64 (run 44369523105) | 16 casos, 113 tokens, 1201 etapas numéricas exactas; 60/60 textos, 29/29 entidades exactas |

## Requisitos de hardware

- VRAM estimada: no aplica; el peso GGUF F32 ocupa unos 7,4 MB y el bundle completo ronda los 9 MB, por lo que cabe en memoria de cualquier sistema, incluidos dispositivos embebidos.
- GPU recomendadas: no se requiere GPU; la ejecución es en CPU sobre ggml.
- Cabe en consumer GPU y en cualquier CPU moderna; los paquetes publicados son para linux-arm64, linux-x86_64 (AVX2) y macos-arm64.
- Opciones de despliegue: librería CrispEmbed (`tools/spacy`) con API de habilitación explícita; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| crispembed-spacy-de-core-news-sm-3.8.0 | 1.845.054 | no disponible | de | MIT | GGUF + paquetes nativos | Reimplementación C++/ggml sin Python |
| spaCy de_core_news_sm 3.8.0 (original) | no disponible en la información | no disponible | de | MIT | wheel de Python | Referencia de paridad; requiere Python |
| spaCy de_core_news_md / lg | no disponible | no disponible | de | MIT | wheel de Python | Variantes mayores de spaCy; no comparadas en la información |

No se dispone de datos de rendimiento comparativo con alternativas fuera de la evidencia de paridad frente al spaCy original.

## Limitaciones y advertencias

- Solo alemán (`de`); no soporta otros idiomas.
- No incluye NER por defecto; requiere el `ner.gguf` opcional, que no forma parte de este bundle.
- No es un modelo generativo: no hay tool calling, agentes ni razonamiento multi-paso.
- Riesgo de sesgos y alucinaciones heredado del pipeline original de spaCy; no se documentan evaluaciones de sesgo en la información disponible.
- La librería nativa rechaza ejecutar análisis hasta que el host la habilita explícitamente; hay que integrar la llamada de habilitación.
- Las descargas deben hacerse desde una revisión inmutable (`/resolve/<40-hex revision>/…`), nunca desde `main`, y verificar SHA-256 y longitud antes de descomprimir.
- La cualificación está ligada a un digest exacto de la librería nativa; una librería recompilada no hereda las garantías de otra build.
- El paquete linux-arm64 y el segundo paquete linux-x86_64 (`d143d26a…`) tienen evidencia de paridad de desarrollo, pero no cualificación de aplicación; el manual grammar solo está cualificado para el build `ea89842ebf22…`.
- Licencia MIT: permite uso comercial, pero deben conservarse los avisos de `LICENSES_SOURCES` y `LICENSE` del bundle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0
- Repositorio CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Pesos GGUF (revisión `659dae33…`): https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0/resolve/659dae33997d00296ae12b76510fa4dfe26540e0/bundle/model.gguf
- Manifiesto del bundle: https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0/resolve/659dae33997d00296ae12b76510fa4dfe26540e0/bundle/manifest.json
- Recursos del bundle: https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0/resolve/659dae33997d00296ae12b76510fa4dfe26540e0/bundle/resources.json
- Paquete linux-x86_64 AVX2 (revisión `659dae33…`): https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0/resolve/659dae33997d00296ae12b76510fa4dfe26540e0/spacy-de_core_news_sm-3.8.0-linux-x86_64-avx2-f32.tar.gz
- Paquete linux-arm64 (revisión `fd75184d…`): https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0/resolve/fd75184d58944ec5f6c4cb037a48eae6e6f5942f/packages/linux-arm64/45b057700880e125d701d941a9e3123679960d35/spacy-de_core_news_sm-3.8.0-linux-arm64-f32.tar.gz
- Paquete linux-x86_64 (revisión `d143d26a…`): https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0/resolve/d143d26a3edd7b51bdfdf12a6cda5b6243ec69d0/packages/linux-x86_64/45b057700880e125d701d941a9e3123679960d35/spacy-de_core_news_sm-3.8.0-linux-x86_64-f32.tar.gz
