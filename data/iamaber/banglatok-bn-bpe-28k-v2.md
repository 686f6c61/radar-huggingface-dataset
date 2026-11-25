# iamaber/banglatok-bn-bpe-28k-v2

## Resumen

`banglatok-bn-bpe-28k-v2` es un tokenizador BPE nativo para bengalí (bangla), inglés y banglish (bengalí romanizado), desarrollado por el usuario iamaber. No es un modelo de lenguaje, sino un artefacto de tokenización versionado que se publica como componente independiente de los modelos v1 inmutables, con IDs de token no intercambiables con ellos. Su vocabulario efectivo es de 27.760 IDs, incluyendo tokens especiales y de byte.

El tokenizador aborda un problema concreto: los tokenizadores multilingües genéricos suelen fragmentar en exceso el bengalí y el texto code-mixed (bengalí con inglés y transliteraciones latinas), lo que infla el número de tokens por palabra y encarece el entrenamiento y la inferencia. Este artefacto se entrenó exclusivamente con fuentes públicas redistribuibles (corpus congelado v1 de banglatok, prosa original de Global Voices Bengali y cuentos de Storybooks Bangladesh) y aplica normalización NFC, colapso de espacios y tokens de byte UTF-8 para caracteres no vistos.

La relevancia actual reside en su doble exportación (formato `transformers` y API nativa `banglatok`) con IDs idénticos, su licencia CC BY-SA 4.0 y su informe de evaluación reproducible con hashes SHA-256 de corpus, entradas y artefactos. Está pensado para quien entrene o adapte modelos que operen sobre bengalí y banglish, no para uso directo como generador de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (byte-level fallback vía tokens de byte UTF-8) |
| Parámetros totales | no disponible (no es un modelo de lenguaje) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | bn, en (incluye banglish o bengalí romanizado y texto code-mixed) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | JSON nativo (`bn-bpe-28k-v2.json`) y exportación compatible con `transformers` (`AutoTokenizer`) |
| Tamaño de vocabulario | 27.760 IDs (incluye tokens especiales y de byte) |
| Normalización | NFC con colapso y recorte de espacios en blanco |
| Tokens especiales | `<s>` y `</s>` añadidos por defecto en `transformers`; la API nativa `encode()` no los añade |
| Versión de exportación | banglatok 0.3.0 |
| SHA-256 del modelo nativo | `6fcb410a3799d0f59d81db8776cc0312e9322b8d509c8fb45377dcff418e6b0d` |

## Arquitectura y entrenamiento

El tokenizador emplea BPE (Byte Pair Encoding) con un vocabulario de 27.760 IDs y fallback a tokens de byte UTF-8 para caracteres no vistos, lo que garantiza round-trip exacto sin tokens UNK. La entrada se normaliza a NFC y se colapsan y recortan los espacios en blanco. El aprendizaje del vocabulario, la fusión de espacios y las cachés se realizaron únicamente con texto de entrenamiento.

Los datos de entrenamiento proceden de tres fuentes públicas: el corpus congelado v1 de banglatok (551.705 registros aceptados; 164.592 bangla, 216.349 banglish, 3.943 code-mixed, 166.821 english; licencias mixtas CC BY-SA 3.0/GFDL, CC BY 2.0 y MIT), prosa original de Global Voices Bengali (61.351 registros; CC BY 3.0) y cuentos de Storybooks Bangladesh (40 registros; CC BY 3.0 o 4.0 según historia). En total, 613.096 registros aceptados y 79.133.165 caracteres normalizados, con versión de datos `v1-plus-global-voices-storybooks-2026-11-25`. Antes del entrenamiento se aplicaron normalización NFC/espacios, heurísticas de calidad y privacidad, deduplicación canónica y near-deduplication por SimHash, splits que preservan grupos, protección de validación/test del v1 congelado y exclusión de BanglishRev. Se excluyeron republicaciones de socios de Global Voices, citas, pies de foto, embeds y publicaciones sin crédito de autor impreso, y se limitaron los cuentos a aquellos cuyo colofón declara CC BY 3.0 o 4.0. No se utilizó transliteración sintética; BanglishRev y el corpus medido de YouTube quedaron solo para evaluación.

## Capacidades

- Tokenización BPE de texto en bengalí (bn), inglés (en), banglish (bengalí romanizado) y texto code-mixed.
- Round-trip exacto: 16/16 en las pruebas de estrés de candidatos y 100,00 % de round-trip exacto en los conjuntos de validación medidos.
- Cero textos con tokens UNK en los conjuntos de validación evaluados, gracias al fallback a tokens de byte UTF-8.
- Manejo de emojis y caracteres fuera del vocabulario mediante tokens de byte.
- Doble API: `AutoTokenizer` de `transformers` y API nativa del paquete `banglatok`, con IDs idénticos entre ambas exportaciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Entrenamiento de modelos de lenguaje para bengalí y banglish: el tokenizador reduce tokens por palabra frente a alternativas genéricas (1,553 frente a 1,620 de `bn-bpe-28k` en validación de fuentes públicas licenciadas), lo que abarata el preentrenamiento y amplía el contexto efectivo por secuencia.
- Procesamiento de conversaciones code-mixed: adecuado para chats donde se mezclan bengalí, inglés y transliteraciones latinas, con round-trip exacto del 100 % y sin UNK.
- Preprocesamiento de corpus para fine-tuning: la normalización NFC y el colapso de espacios producen entradas consistentes, y los hashes SHA-256 de corpus y entradas permiten reproducir exactamente las evaluaciones.
- Integración en pipelines de `transformers`: al cargarse con `AutoTokenizer.from_pretrained`, se puede enchufar en flujos existentes de Hugging Face sin cambiar la librería.
- Despliegue con la API nativa `banglatok`: útil cuando se quiere evitar la dependencia de `transformers` y cargar el JSON local directamente, con control explícito de tokens especiales (`encode()` nativo no añade `<s>`/`</s>`).
- Evaluación comparativa de tokenizadores: el harness `compare_popular.py` con normalización NFC, exclusión de tokens especiales y ajustes de un solo hilo permite reproducir las cifras publicadas frente a `bn-bpe-58k`, `bn-bpe-28k`, SentencePiece y tiktoken.
- Adaptación de embeddings de modelos existentes: al cambiar de tokenizador es necesario entrenar o adaptar los embeddings del modelo de lenguaje subyacente, escenario para el que este artefacto está explícitamente documentado.

## Benchmarks y rendimiento

Datos del informe medido el 2026-11-25T10:21:23 (brazo CPU, macOS-27.2.1-arm64, Python 3.12.13, 5 repeticiones de timing, batch size 64; versiones: banglatok 0.2.4, sentencepiece 0.2.3, tiktoken 0.14.0, tokenizers 0.23.3, transformers 5.22.2).

Validación frozen v1 (14.779 registros):

| Tokenizador | Vocab | Tokens/palabra | Round trip exacto | Textos con UNK | MB/s single | MB/s batch |
|---|---:|---:|---:|---:|---:|---:|
| banglatok bn-bpe-58k | 57.925 | 1,373 | 100,00 % | 0 | 138,9 | 159,0 |
| banglatok bn-bpe-28k | 27.760 | 1,563 | 100,00 % | 0 | 142,3 | 157,5 |
| banglatok bn-bpe-28k-v2 | 27.760 | 1,553 | 100,00 % | 0 | 139,6 | 162,6 |

Validación de fuentes públicas licenciadas held-out (1.451 registros):

| Tokenizador | Vocab | Tokens/palabra | Round trip exacto | Textos con UNK | MB/s single | MB/s batch |
|---|---:|---:|---:|---:|---:|---:|
| banglatok bn-bpe-58k | 57.925 | 1,399 | 100,00 % | 0 | 223,3 | 235,8 |
| banglatok bn-bpe-28k | 27.760 | 1,620 | 100,00 % | 0 | 228,4 | 232,6 |
| banglatok bn-bpe-28k-v2 | 27.760 | 1,514 | 100,00 % | 0 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: no aplica; es un tokenizador, no un modelo de lenguaje. El JSON nativo y la exportación `transformers` ocupan del orden de megabytes, no de gigabytes.
- GPU recomendadas: no aplica; el informe de evaluación se ejecutó en CPU (macOS arm64).
- Cabe en cualquier equipo consumer: sí, por su naturaleza de tokenizador.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), paquete nativo `banglatok` (carga del JSON local), y uso indirecto a través de cualquier framework que consuma tokenizadores de Hugging Face.
- Latencia y throughput: medidos en CPU con el harness `compare_popular.py`; en validación frozen v1, 139,6 MB/s en modo single y 162,6 MB/s en batch para `bn-bpe-28k-v2`. No hay datos de latencia en GPU ni de throughput en producción.

## Comparativa con modelos similares

| Tokenizador | Vocab | Tokens/palabra (frozen v1) | Tokens/palabra (held-out) | Round trip | UNK | Licencia |
|---|---:|---:|---:|---:|---:|---|
| banglatok bn-bpe-28k-v2 | 27.760 | 1,553 | 1,514 | 100,00 % | 0 | CC BY-SA 4.0 |
| banglatok bn-bpe-28k | 27.760 | 1,563 | 1,620 | 100,00 % | 0 | no disponible en la información proporcionada |
| banglatok bn-bpe-58k | 57.925 | 1,373 | 1,399 | 100,00 % | 0 | no disponible en la información proporcionada |

La comparación con SentencePiece y tiktoken se menciona en el harness (`compare_popular.py`), pero no se aportan sus cifras en la información disponible. No se dispone de comparativas con tokenizadores oficiales de modelos multilingües de terceros.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Los IDs de token no son intercambiables con los de los modelos v1 inmutables; mezclar artefactos rompe la coherencia de los embeddings.
- Cambiar a este tokenizador exige entrenar o adaptar los embeddings de un modelo de lenguaje existente.
- Los filtros automáticos de calidad y PII no garantizan una eliminación completa de datos personales.
- Las etiquetas de idioma son etiquetas de fuente o proxies de escritura, no anotaciones humanas independientes.
- La disponibilidad como nombre preentrenado empaquetado depende de la versión del paquete `banglatok` instalada; cargar la ruta del JSON descargado funciona independientemente de ese empaquetado.
- El JSONL exacto de entrenamiento no se incluye en el repositorio; el texto fuente sigue bajo sus licencias originales y debe reobtenerse de las fuentes enlazadas.
- La licencia CC BY-SA 4.0 impone atribución y compartir-al-igual para obras derivadas; conviene revisarla antes de uso comercial.
- No se han publicado resultados de benchmarks de modelos de lenguaje asociados a este tokenizador en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/iamaber/banglatok-bn-bpe-28k-v2
- Modelo nativo: https://huggingface.co/iamaber/banglatok-bn-bpe-28k-v2/resolve/main/bn-bpe-28k-v2.json
- Guía de uso: USAGE.md (en el repositorio)
- Dataset de entrenamiento: https://huggingface.co/datasets/iamaber/banglatok-training-corpus
- Global Voices Bengali: https://bn.globalvoices.org/
- Storybooks Bangladesh: https://global-asp.github.io/storybooks-bangladesh/stories/bn/
- Resumen de fuentes: training_data_summary.json (en el repositorio)
- Procedencia de la exportación: model_provenance.json (en el repositorio)
- Resultados de benchmark: benchmark-1.json (en el repositorio)
