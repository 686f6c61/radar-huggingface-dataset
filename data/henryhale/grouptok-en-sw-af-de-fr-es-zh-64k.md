# henryhale/grouptok-en-sw-af-de-fr-es-zh-64k

## Resumen

`grouptok-en-sw-af-de-fr-es-zh-64k` es un tokenizer byte-level BPE de 65.536 tokens publicado por henryhale para siete idiomas: inglés, suajili, afrikáans, alemán, francés, español y chino. No es un modelo de lenguaje, sino un componente de tokenización que añade una capa de metadatos sobre un vocabulario BPE convencional: además de `tokenizer.json`, el repositorio incluye `groups.json`, que agrupa tokens que se traducen entre sí (por ejemplo ` water`, ` Wasser`, ` eau`, ` agua`, ` maji`).

La relevancia está en el enfoque: el vocabulario es exactamente el del baseline `bpe-en-sw-af-de-fr-es-zh-64k`, de modo que ambos tokenizers segmentan cualquier texto de forma idéntica y solo difieren en la información de grupos. Esa separación permite incorporar el tokenizer a un pipeline existente sin alterar los ids, y usar los grupos como señal adicional para análisis de interpretabilidad, alineación de subpalabras o inicialización de embeddings compartidos entre idiomas.

El proyecto lo mantiene henryhale dentro del ecosistema `grouptok` (versión 0.5.0 usada en el entrenamiento), con licencia Apache 2.0 y publicación bajo la librería `tokenizers`. A fecha de la información disponible el repositorio no registra descargas ni valoraciones, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE con agrupación por traducción (grouptok) |
| Parámetros totales | no aplica: no es un modelo de lenguaje; vocabulario de 65.536 tokens |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible: un tokenizer no define ventana de contexto |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | en, sw, af, de, fr, es, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json`, `groups.json` |
| Vocabulario | 65.536 tokens (idéntico al del baseline BPE) |
| Alfabeto | 256 bytes (byte-level), sin prefix space |
| Tokens reservados | `<\|im_start\|>`, `<\|im_end\|>`, `<think>`, `</think>` (ids 0-3), nunca agrupados |
| Tamaño de grupo | máximo 14 miembros (el doble de los 7 idiomas) |
| Alineadores | awesome-align (capa 8) para de, fr, es, zh; XLM-R base (capa 8) para sw, af |
| Tokens especiales de chat | plantilla de chat incluida; sin pad, bos ni eos declarados |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El tokenizer es un BPE a nivel de byte con alfabeto de 256 bytes y sin prefix space, con un vocabulario de 65.536 tokens. No hay entrenamiento neuronal ni ajuste por RLHF/DPO: lo que se construye es el emparejamiento de subpalabras entre idiomas. Cada par de frases inglés–X se segmenta con el BPE; el alineador del idioma correspondiente enlaza las subpalabras inglesas con las del otro lado. Los enlaces de todos los pares y de todos los idiomas se agrupan conjuntamente, de modo que un grupo puede contener la misma palabra en varios idiomas aunque cada alineador solo haya visto inglés emparejado con uno de ellos. El inglés es el primer lado de todos los pares, por lo que el miembro 0 de cada grupo es siempre su palabra inglesa.

Los datos de entrenamiento son los del baseline: 1.000.000 de pares de frases inglés–X por idioma. Para alemán, Europarl (WMT14) `de-en` (primeros 776.847 pares) y News Commentary `de-en` (223.153); para francés, Europarl (WMT14) `fr-en` (790.521) y News Commentary `en-fr` (209.479); para español, Europarl `en-es` (761.128) y News Commentary `en-es` (238.872); para chino, News Commentary (WMT19) `zh-en` (311.500) y UN Parallel Corpus `en-zh` (688.500); para suajili y afrikáans, pares minados de NLLB (mejor puntuados, primeros 1.000.000). La innovación técnica es la separación limpia entre segmentación y agrupación: el `tokenizer.json` es byte a byte el del baseline, y toda la aportación vive en `groups.json` como un mapeo de id de token a id de grupo y a slot de miembro.

## Capacidades

- Segmentación byte-level BPE determinista en siete idiomas, con cobertura de texto arbitrario gracias al alfabeto de 256 bytes.
- Agrupación por traducción: recuperación del grupo y del slot de miembro para cada token generado.
- Compatibilidad total con el baseline: mismos `input_ids` para cualquier cadena de entrada.
- Plantilla de chat incluida en `tokenizer_config.json`.
- Tokens reservados para turnos de conversación y modo de razonamiento (`<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`), excluidos de la agrupación.
- Integración con `transformers` (`AutoTokenizer`) y con la librería `grouptok` (`GroupedTokenizer`).
- No genera texto, no razona y no ejecuta tool calling: es exclusivamente un componente de preprocesado.

## Casos de uso

- **Inicialización de embeddings multilingües compartidos**: para cada grupo se puede promediar o copiar el vector del token inglés hacia sus equivalentes en otros idiomas antes del entrenamiento, lo que da un punto de partida alineado sin necesidad de datos paralelos adicionales en el momento del ajuste.
- **Análisis de interpretabilidad cross-lingual**: al comparar activaciones de un mismo grupo (por ejemplo ` agua` frente a ` water`) se puede medir si el modelo reutiliza direcciones latentes entre idiomas; el slot de miembro permite emparejar posiciones de forma inequívoca.
- **Preprocesado de corpus paralelos**: la información de grupos sirve para verificar o filtrar alineaciones a nivel de subpalabra en corpus en–X, detectando pares con baja correspondencia antes de alimentar un modelo de traducción.
- **Modelos multilingües pequeños con foco africano**: un vocabulario de 65.536 tokens que incluye suajili y afrikáans reduce la fragmentación frente a tokenizers centrados en lenguas europeas, lo que se traduce en menos tokens por frase y menor coste de inferencia en esos idiomas.
- **Evaluación de métricas a nivel de token entre idiomas**: al mapear tokens de la hipótesis y de la referencia a un id de grupo común se pueden calcular métricas de solapamiento comparables entre lenguas con vocabularios superficialmente distintos.
- **Preparación de datos de instrucción multilingües**: la plantilla de chat y los tokens `<think>`/`</think>` permiten formatear conversaciones y trazas de razonamiento en los siete idiomas con un único tokenizer, manteniendo la coherencia de ids entre ellos.
- **Sustitución directa en pipelines existentes**: cualquier proyecto que ya use `bpe-en-sw-af-de-fr-es-zh-64k` puede cambiar a este repositorio sin reentrenar ni reindexar nada, ya que la tokenización es idéntica y solo se añade `groups.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica. La tokenización se ejecuta en CPU y el repositorio no contiene pesos de modelo.
- GPU recomendadas: ninguna. No requiere A100, H100 ni RTX 4090 para funcionar.
- Cabe en cualquier equipo: el coste en memoria lo determina el tamaño de `tokenizer.json` y del vocabulario (65.536 entradas), no hay cifra publicada del tamaño en disco.
- Opciones de despliegue: `transformers` (`AutoTokenizer.from_pretrained`), librería `tokenizers`, y `grouptok` (`pip install grouptok`) para leer los grupos mediante `GroupedTokenizer` o directamente desde `groups.json`.
- vLLM, TGI, llama.cpp u Ollama no aplican al tokenizer en sí; se usarían junto al modelo de lenguaje al que se asocie, cuyos requisitos de hardware dependen de ese modelo y no están cubiertos por esta ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Idiomas | Grupos por traducción | Licencia | Notas |
|---|---|---|---|---|---|
| `grouptok-en-sw-af-de-fr-es-zh-64k` | 65.536 | en, sw, af, de, fr, es, zh | Sí, hasta 14 miembros | Apache 2.0 | Objeto de esta ficha |
| `bpe-en-sw-af-de-fr-es-zh-64k` (baseline) | 65.536 | en, sw, af, de, fr, es, zh | No | no disponible en la informacion | Mismo `tokenizer.json`; sin `groups.json` |
| `grouptok-en-sw-af-de-fr-es-zh-200k` | 200.000 | en, sw, af, de, fr, es, zh | Sí, hasta 14 miembros | no disponible en la informacion | Variante con vocabulario ampliado; misma metodología |

No se dispone de datos de un tercer tokenizer comparable en la información proporcionada.

## Limitaciones y advertencias

- Los grupos heredan los errores de los alineadores, y como los alineadores difieren por idioma (awesome-align para de/fr/es/zh, XLM-R base para sw/af), la calidad de la agrupación no es homogénea entre lenguas.
- Los grupos enlazan subpalabras individuales uno a uno: las expresiones multipalabra y sus traducciones en una sola palabra nunca quedan agrupadas.
- El texto de entrenamiento es mayoritariamente parlamentario, de noticias, de Naciones Unidas y minado de la web; los idiomas están equilibrados por número de pares de frases, no por volumen de texto, lo que sesga la cobertura léxica hacia registros formales.
- No declara tokens pad, bos ni eos: hay que definirlos explícitamente si el modelo que lo use los necesita.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones de los corpus de origen (Europarl, News Commentary, UN Parallel Corpus, pares minados de NLLB) que el usuario debe verificar por separado.
- No es un modelo: no puede generar, razonar ni seguir instrucciones. Cualquier expectativa de rendimiento en tareas debe evaluarse sobre el modelo de lenguaje al que se asocie.
- Sin descargas ni likes registrados y sin benchmarks publicados: no hay evidencia externa de calidad más allá de la descripción del autor.

## Enlaces

- HuggingFace: https://huggingface.co/henryhale/grouptok-en-sw-af-de-fr-es-zh-64k
- Baseline BPE: https://huggingface.co/henryhale/bpe-en-sw-af-de-fr-es-zh-64k
- Variante de 200k tokens: https://huggingface.co/henryhale/grouptok-en-sw-af-de-fr-es-zh-200k
- Repositorio grouptok: https://github.com/henryhale/grouptok
- Alineador awesome-align: https://huggingface.co/aneuraz/awesome-align-with-co
- Alineador XLM-R base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset Europarl (WMT14): https://huggingface.co/datasets/wmt/wmt14
- Dataset News Commentary: https://huggingface.co/datasets/Helsinki-NLP/news_commentary
- Dataset Europarl (Helsinki-NLP): https://huggingface.co/datasets/Helsinki-NLP/europarl
- Dataset News Commentary (WMT19): https://huggingface.co/datasets/wmt/wmt19
- Dataset UN Parallel Corpus: https://huggingface.co/datasets/Helsinki-NLP/un_pc
- Pares inglés–suajili: https://huggingface.co/datasets/michsethowusu/english-swahili_sentence-pairs
- Pares afrikáans–inglés: https://huggingface.co/datasets/michsethowusu/afrikaans-english_sentence-pairs
