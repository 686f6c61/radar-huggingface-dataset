# henryhale/bpe-en-sw-af-de-fr-es-zh-200k

ids 0-3
- Training data: 1,000,000 English–X sentence pairs per language, both sides
- No pad, bos, eos token declared
- Files: tokenizer.json, tokenizer_config.json, groups.json
- Companion: grouptok-en-sw-af-de-fr-es-zh-200k — grouped version
- Training data table details

For specs table: "Parametros totales" — no aplica / no disponible. Arquitectura: byte-level BPE (no es una red neuronal). Longitud de contexto: no aplica. Tipos de cuantizacion: no aplica. Idiomas: en, sw, af, de, fr, es, zh. Licencia: apache-2.0. Formato de pesos: tokenizer.json, tokenizer_config.json, groups.json (no safetensors/GGUF).

Benchmarks: no published.

Hardware requirements: no aplica — CPU, memory footprint. I can estimate tokenizer memory... but avoid inventing. Actually I can say the tokenizer runs on CPU and is negligible. Hmm, "No inventes datos". I'll say the artifact is a JSON tokenizer, runs on CPU, no VRAM required. I could estimate the RAM footprint from vocabulary size — 200k tokens, tokenizer.json typically a few MB. That's an estimate; I'll be careful and say "del orden de pocos megabytes" — but that's an inference. I can say "no se ha publicado el tamano exacto; el repo es de 0.0 GB". Better to state "no disponible; el repositorio ocupa 0.0 GB segun HuggingFace (redondeo)".

Comparativa: tokenizers comparables — GPT-4 cl100k_base (100k, no público), Llama 3 tokenizer (128k), Gemma (256k), Qwen (151k). And the companion grouptok tokenizer. I should be careful with numbers. I know Llama 3 uses 128,256 tokens vocabulary. Gemma uses 256k. Qwen2.5 uses 151,643. These are reasonably well-known but might be considered "inventing"? They are public facts. I'll mark as approximate, or mention "no disponible" for the ones I'm unsure. I'd rather compare with the sibling grouptok tokenizer, which is definitely available from the info. And mention general references cautiously.

Actually, safer: compare with the grouped sibling and note other multilingual BPE tokenizers exist (Llama 3, Gemma) but indicate "no disponible" for exact data not provided. I'll present a table with the sibling and note.

Enlaces: HF URL, sibling grouptok URL, henryhale.dev/projects, training datasets (wmt14, news_commentary, europarl, wmt19, un_pc, michsethowusu pairs), HF tokenizers docs, DeepWiki BPE.

Let me write this with care, no emojis, only first word capitalized in headings. Headings are given by the template though — "Resumen", "Especificaciones tecnicas", "Arquitectura y entrenamiento", etc. Those are fine (first word capitalized only).

Note: the required section headings are given; I'll use them exactly.

Let me write.

For "Parametros activos" — only if MoE; no aplica.

Hardware: list bullets.

Let me be thorough and technical.

Regarding the creation date 2026-10-16 — odd, future date. I'll mention it as the date reported by HuggingFace.

Write the ficha.

One thing: "Resumen" — 2-3 paragraphs, 6-10 lines total. Mention architecture, size, context if available. Here there is no context window — it's a tokenizer. I'll explain.

Cases of use: minimum 6, concrete.

- Entrenamiento de LLMs multilingues desde cero con 7 idiomas incluyendo swahili y afrikaans
- Adaptacion de vocabulario para modelos centrados en Africa Oriental / Sudafrica
- Uso como baseline en investigacion de tokenizacion (comparacion con grouptok)
- Evaluacion de fertilidad/compresion de tokenizacion (tokens por palabra) en distintos idiomas
- Sistemas de traduccion automatica en-en...
- Preprocesamiento en pipelines de NLP: analisis morfologico, clasificacion, NER con vocabulario compartido
- Investigacion sobre equidad linguistica: asignacion de vocabulario entre idiomas de altos y bajos recursos
- Compatibilidad de chat template: reserva <|im_start|> etc, permite reutilizar en pipelines tipo chat.

Good, that's 8.

Benchmarks: no benchmark results. But I could mention there's a fertility/compression metric typical for tokenizers — but no data provided. Say no disponible.

Let me write it.## Resumen

`bpe-en-sw-af-de-fr-es-zh-200k` es un tokenizador byte-level BPE de 200.000 tokens desarrollado por henryhale para siete idiomas: ingles, swahili, afrikaans, aleman, frances, espanol y chino. No es un modelo de lenguaje: no contiene pesos neuronales, no genera texto y no tiene ventana de contexto propia. Su funcion es definir el vocabulario y las reglas de segmentacion que un modelo de lenguaje usaria por encima de el.

Su rasgo distintivo es ser el baseline no agrupado de `grouptok-en-sw-af-de-fr-es-zh-200k`, un tokenizador que agrupa exactamente este mismo vocabulario mediante traduccion. Ambos segmentan cualquier texto de forma identica y solo se diferencian en la estructura de grupos asociada, lo que los convierte en un par experimental controlado para investigar el efecto del agrupamiento de tokens en el entrenamiento y la inferencia.

El modelo se entreno con `grouptok.tokenizer.train_bpe` sobre 1.000.000 de pares de frases ingles-X por idioma, usando ambos lados del par, y reserva cuatro tokens especiales de chat y razonamiento en los identificadores 0-3. Su licencia Apache 2.0 y su naturaleza de artefacto ligero (repositorio de 0.0 GB segun HuggingFace) lo hacen directamente util para experimentos de tokenizacion multilingue, aunque a fecha de la ficha no registra descargas ni interacciones en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | byte-level BPE (algoritmo de tokenizacion, sin red neuronal) |
| Parametros totales | no aplica (no es un modelo de parametros) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (la define el modelo que use el tokenizador) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en, sw, af, de, fr, es, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json`, `groups.json` (no safetensors ni GGUF) |

Datos adicionales del vocabulario:

| Parametro | Valor |
|---|---|
| Tamano de vocabulario | 200.000 tokens |
| Alfabeto | 256 bytes |
| Prefix space | no |
| Tokens reservados | `<\|im_start\|>`, `<\|im_end\|>`, `<think>`, `</think>` (ids 0-3) |
| Tokens pad/bos/eos | no declarados (el autor indica que se deben configurar en el modelo) |
| Repositorio | 0.0 GB, 0 descargas, 0 likes |
| Fechas | creado y actualizado el 2026-10-16 segun HuggingFace |

## Arquitectura y entrenamiento

El tokenizador usa BPE a nivel de byte con un alfabeto de 256 bytes y sin prefix space, una configuracion habitual en modelos tipo GPT y Llama que evita el problema de tokens desconocidos. El vocabulario resultante tiene 200.000 entradas y los cuatro primeros identificadores estan reservados para marcadores de chat (`<|im_start|>`, `<|im_end|>`) y de razonamiento (`<think>`, `</think>`), lo que sugiere que esta pensado para reutilizarse en pipelines conversacionales y de chain-of-thought. No se declaran tokens de padding, beginning-of-sequence ni end-of-sequence, de modo que cualquier modelo que lo adopte debe definirlos explicitamente.

El entrenamiento se realizo con `grouptok.tokenizer.train_bpe` de la libreria `tokenizers` de Hugging Face sobre corpus paralelos: 1.000.000 de pares ingles-X por idioma, contando ambos lados del par. Para aleman, frances, espanol y chino se combinaron corpus de Europarl, News Commentary, WMT19 y UN Parallel Corpus con recortes especificos (por ejemplo, 776.847 pares de Europarl `de-en` mas los 223.153 de News Commentary `de-en`); para swahili y afrikaans se usaron los 1.000.000 de pares mejor puntuados de corpus minados con NLLB. El autor advierte que igualar el numero de pares no iguala el volumen de texto, ya que los pares de swahili y afrikaans son mas cortos, por lo que el reparto real del vocabulario entre idiomas esta desequilibrado. No se menciona RLHF, DPO ni ninguna otra fase de alineacion, algo coherente con la naturaleza del artefacto.

## Capacidades

- Tokenizacion byte-level BPE con vocabulario de 200.000 entradas para siete idiomas: ingles, swahili, afrikaans, aleman, frances, espanol y chino.
- Segmentacion identica a la de `grouptok-en-sw-af-de-fr-es-zh-200k`: ambos tokenizadores parten cualquier texto de la misma forma y solo difieren en los grupos, lo que permite comparaciones controladas.
- Integracion directa con la libreria `transformers` mediante `AutoTokenizer.from_pretrained` y con `tokenizers` mediante `Tokenizer.from_file`.
- Plantilla de chat incluida en `tokenizer_config.json` y tokens reservados para turnos de conversacion y bloques de razonamiento.
- Fichero `groups.json` en el formato de grouptok, con un grupo por token (sin agrupacion), de modo que las herramientas que leen el tokenizador agrupado pueden leer tambien este.
- Soporte multilingue con cobertura de idiomas de bajos recursos (swahili, afrikaans) junto a idiomas de altos recursos.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: esas funciones corresponderian al modelo que se entrene sobre este vocabulario.

## Casos de uso

- Entrenamiento de un LLM multilingue desde cero: el tokenizador ofrece un vocabulario unico de 200.000 entradas para siete idiomas, de modo que un solo modelo puede cubrir ingles, aleman, frances, espanol, chino, swahili y afrikaans sin fragmentar el vocabulario por lengua.
- Investigacion controlada sobre agrupamiento de tokens: al ser el baseline sin agrupar de `grouptok-en-sw-af-de-fr-es-zh-200k`, permite entrenar dos modelos con segmentacion identica y aislar asi el efecto de los grupos en la convergencia y el rendimiento final.
- Medicion de fertilidad y compresion de tokenizacion: se puede calcular cuantos tokens consume una misma frase en cada uno de los siete idiomas y detectar el desequilibrio de vocabulario que el propio autor advierte, util para decidir si hace falta reequilibrar el corpus.
- Proyectos de NLP centrados en Africa Oriental y Austral: un pipeline de clasificacion, NER o analisis de sentimiento que deba cubrir ingles y swahili o afrikaans puede usar un unico tokenizador compartido en lugar de varios especificos.
- Preprocesamiento en sistemas de traduccion automatica: al haberse entrenado sobre corpus paralelos ingles-X, el vocabulario cubre de forma conjunta origen y destino, lo que simplifica arquitecturas de traduccion con embedding compartido.
- Construccion de asistentes conversacionales: la plantilla de chat y los tokens `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>` permiten reutilizar el tokenizador en modelos con formato de turnos y bloques de razonamiento explicito.
- Experimentos de equidad linguistica: la diferencia entre igualar pares de frases y no igualar volumen de texto lo convierte en un caso de estudio util para analizar como el diseno del corpus afecta la representacion de idiomas de bajos recursos.
- Base para extender el vocabulario: al no declarar tokens de pad, bos ni eos, se puede reutilizar como punto de partida anadiendo esos tokens y otros especificos de dominio sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de fertilidad, cobertura, compresion ni comparaciones cuantitativas con otros tokenizadores.

## Requisitos de hardware

- VRAM para inferencia: no aplica; es un tokenizador, no requiere GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica, el artefacto se ejecuta en CPU.
- Coste: el repositorio ocupa 0.0 GB segun HuggingFace; el peso real de los ficheros JSON no esta detallado en la informacion disponible.
- Opciones de despliegue: libreria `transformers` (`AutoTokenizer`), libreria `tokenizers` (`Tokenizer.from_file`) y `huggingface_hub` (`hf_hub_download`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que estos entornos requieren pesos de un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ejecutarse en CPU sobre estructuras BPE, el coste por secuencia es bajo comparado con cualquier modelo neuronal, pero no se aportan cifras.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Idiomas | Agrupacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bpe-en-sw-af-de-fr-es-zh-200k` | 200.000 | en, sw, af, de, fr, es, zh | no (baseline) | Apache 2.0 | HuggingFace |
| `grouptok-en-sw-af-de-fr-es-zh-200k` | 200.000 | en, sw, af, de, fr, es, zh | si (por traduccion) | no disponible en la informacion | HuggingFace |
| Otros tokenizadores BPE multilingues de referencia (por ejemplo los de familias tipo Llama, Gemma o Qwen) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con precision es la que el propio autor establece con el tokenizador agrupado hermano: mismo vocabulario, misma segmentacion, distinta estructura de grupos. Para el resto de alternativas del mercado no se aportan datos verificables en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni realiza tareas cognitivas; usarlo requiere entrenar o disponer de un modelo compatible sobre su vocabulario.
- Sesgo de dominio en los datos de entrenamiento: el texto proviene mayoritariamente de corpus parlamentarios (Europarl), noticias (News Commentary, WMT19), documentos de Naciones Unidas y pares minados de la web, lo que infrarrepresenta registros coloquiales, tecnicos y dialectales.
- Desequilibrio entre idiomas: el autor advierte que los idiomas estan igualados por numero de pares de frases, no por volumen de texto. Como los pares de swahili y afrikaans son mas cortos, su cuota efectiva del vocabulario es menor que la de aleman, frances, espanol o chino.
- Ausencia de tokens de pad, bos y eos: cualquier modelo que lo adopte debe declararlos explicitamente o asumir un comportamiento por defecto no documentado.
- Sin datos de evaluacion: no hay metricas publicas de fertilidad, cobertura ni comparacion con tokenizadores alternativos, por lo que no se puede estimar a priori su calidad relativa.
- Adopcion nula en el Hub: 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso en produccion ni de mantenimiento mas alla de la fecha de actualizacion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar las licencias de los corpus de entrenamiento subyacentes (Europarl, News Commentary, UN Parallel Corpus, WMT y los pares minados de NLLB), que pueden imponer condiciones adicionales sobre los datos derivados.
- Fechas incoherentes: la fecha de creacion y actualizacion indicada por HuggingFace es el 2026-10-16, posterior a la fecha habitual de publicacion; conviene verificar el estado real del repositorio antes de depender de el.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/henryhale/bpe-en-sw-af-de-fr-es-zh-200k
- Tokenizador agrupado hermano: https://huggingface.co/henryhale/grouptok-en-sw-af-de-fr-es-zh-200k
- Corpus Europarl (WMT14): https://huggingface.co/datasets/wmt/wmt14
- Corpus News Commentary: https://huggingface.co/datasets/Helsinki-NLP/news_commentary
- Corpus Europarl (Helsinki-NLP): https://huggingface.co/datasets/Helsinki-NLP/europarl
- Corpus News Commentary WMT19: https://huggingface.co/datasets/wmt/wmt19
- Corpus UN Parallel Corpus: https://huggingface.co/datasets/Helsinki-NLP/un_pc
- Pares ingles-swahili: https://huggingface.co/datasets/michsethowusu/english-swahili_sentence-pairs
- Pares afrikaans-ingles: https://huggingface.co/datasets/michsethowusu/afrikaans-english_sentence-pairs
- Documentacion de BPE en la libreria `tokenizers`: https://deepwiki.com/huggingface/tokenizers/4.1-bpe-(byte-pair-encoding)
- Proyectos del autor: https://www.henryhale.dev/projects/
- Documentacion de la libreria `tokenizers` de Hugging Face: https://huggingface.co/docs/tokenizers
