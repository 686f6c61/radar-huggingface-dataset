# henryhale/grouptok-en-sw-af-32k

## Resumen

`grouptok-en-sw-af-32k` es un tokenizador byte-level BPE de 32.768 tokens para inglés (en), suajili (sw) y afrikáans (af), publicado por el desarrollador henryhale bajo licencia Apache 2.0. No es un modelo de lenguaje: no tiene pesos neuronales ni genera texto. Su particularidad es que el vocabulario está agrupado por traducción mediante la herramienta `grouptok`, de modo que cada grupo reúne subwords que se traducen entre sí en los tres idiomas (por ejemplo, ` water` y ` maji` caen en el mismo grupo).

El problema que aborda es la fragmentación del vocabulario en modelos multilingües: un mismo concepto recibe identificadores distintos según el idioma, lo que dificulta el análisis de transferencia entre lenguas y el alineamiento léxico. Al exponer el mapa de grupos como un fichero `groups.json`, el autor permite consultar, para cada token generado, a qué grupo de traducción pertenece y qué posición ocupa dentro de él.

Es relevante ahora por dos motivos: la tokenización se ha convertido en objeto de estudio propio (fertilidad, cobertura, equidad entre idiomas) y las lenguas africanas siguen estando infrarrepresentadas en los vocabularios de los modelos abiertos. El tokenizador se entrenó sobre 1.000.000 de pares de frases inglés–X por idioma, extraídos de pares minados con NLLB. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE con vocabulario agrupado por traducción (herramienta `grouptok` 0.5.0); no es un modelo neuronal |
| Parámetros totales | No disponible (no aplica: no hay pesos neuronales) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (tokenizador; no tiene ventana de contexto) |
| Tipos de cuantización | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | en (inglés), sw (suajili), af (afrikáans) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` y `tokenizer_config.json` (formato HuggingFace `tokenizers`), más `groups.json` con el mapa de grupos |
| Tamaño del vocabulario | 32.768 tokens |
| Alfabeto | 256 bytes (byte-level), sin prefix space |
| Grupos de traducción | Hasta 6 miembros por grupo (el doble de los 3 idiomas); los tokens sin vínculo de traducción forman grupos propios |
| Alineadores | XLM-R base (capa 8) para suajili y afrikáans |
| Tokens reservados | `<\|im_start\|>`, `<\|im_end\|>`, `<think>`, `</think>` (ids 0-3), excluidos del agrupamiento |
| Tokens especiales de secuencia | Sin pad, bos ni eos declarados |
| Datos de entrenamiento | 1.000.000 de pares de frases inglés–X por idioma (pares minados NLLB) |
| Librería | `tokenizers` |

## Arquitectura y entrenamiento

La base es un BPE byte-level estándar con alfabeto de 256 bytes y sin prefix space, es decir, el mismo esquema de tokenización que emplean la mayoría de los transformers modernos, pero con un vocabulario cerrado de 32.768 tokens. Sobre esa base, `grouptok` no modifica la tokenización: `tokenizer.json` es idéntico al del BPE de referencia, de modo que cualquier librería que lea ese fichero produce exactamente los mismos `input_ids`. Lo que añade es una capa de metadatos de alineamiento.

La construcción de los grupos es indirecta y en dos fases. Primero, cada par de frases se divide con el BPE y un alineador —XLM-R base, capa 8— enlaza los subwords ingleses con los del otro lado; para el suajili y el afrikáans se usa el mismo tipo de alineador, pero cada uno solo ha visto inglés emparejado con su propio idioma. Segundo, los enlaces de todos los pares y de ambos idiomas se agregan en un grafo y se transforman en grupos, de forma que un mismo grupo puede contener la palabra en varios idiomas aunque ningún alineador haya visto directamente el par sw–af. El inglés ocupa siempre la posición 0 del grupo, porque es el primer lado de todos los pares.

Los datos proceden de pares minados con NLLB: para suajili, el corpus `michsethowusu/english-swahili_sentence-pairs` (primeros 1.000.000 con mejor puntuación) y para afrikáans, `michsethowusu/afrikaans-english_sentence-pairs` (ídem). No hubo entrenamiento neuronal, RLHF ni DPO: el proceso descrito es exclusivamente de alineamiento y agrupamiento. Los cuatro tokens reservados (ids 0-3) se excluyen explícitamente del agrupamiento y están pensados para plantillas de chat con modo de razonamiento.

## Capacidades

- Tokenización byte-level BPE de texto en inglés, suajili y afrikáans con un vocabulario de 32.768 tokens.
- Producción de `input_ids` idénticos a los del BPE de referencia, lo que permite sustituirlo sin cambiar la tokenización.
- Consulta del grupo de traducción de cada token y de su posición dentro del grupo, vía `groups.json` o la API `readable_groups()` de `grouptok`.
- Agrupamiento multilingüe de hasta 6 miembros, lo que permite cubrir una misma palabra en los tres idiomas y dejar hueco para variantes.
- Aislamiento de tokens de control (`<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`) fuera de los grupos, apto para plantillas conversacionales.
- Inclusión de una plantilla de chat en `tokenizer_config.json`.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente: es un componente de preprocesado.

## Casos de uso

- **Análisis de transferencia cross-lingual:** al consultar el grupo de cada token de una frase en suajili y su equivalente en inglés, se puede medir si el modelo subyacente reutiliza representaciones para el mismo concepto o si aprende circuitos separados por idioma.
- **Construcción de diccionarios y léxicos bilingües:** `readable_groups()` devuelve conjuntos de tokens que se traducen entre sí, un punto de partida barato para extraer candidatos léxicos en/ sw/af que después se filtran manualmente o con un modelo mayor.
- **Alineamiento de embeddings entre idiomas:** los grupos proporcionan un mapa de correspondencia token a token que se puede usar como supervisión débil para inicializar o regularizar espacios de embeddings multilingües.
- **Evaluación de la calidad de alineadores:** como los grupos heredan los errores de XLM-R base en la capa 8, el propio `groups.json` sirve para auditar qué pares de subwords se alinean mal y comparar alineadores alternativos.
- **Análisis de fertilidad y coste por idioma:** con un vocabulario fijo de 32.768 tokens y datos balanceados por número de pares de frases, se puede medir cuántos tokens consume una misma frase en cada uno de los tres idiomas y detectar desequilibrios de cobertura.
- **Preprocesado de corpus multilingües para África oriental:** pipelines de limpieza, deduplicación y filtrado de corpus en/ sw/af que necesiten un tokenizador compacto, byte-level y con licencia permisiva.
- **Investigación sobre justicia en tokenización:** cuantificar si dos idiomas con la misma carga semántica reciben el mismo número de tokens es un experimento directo con este vocabulario y su `groups.json`.
- **Prototipado de plantillas de chat:** los tokens reservados de los ids 0-3 permiten montar plantillas conversacionales y de modo de razonamiento sin colisiones con el vocabulario agrupado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de fertilidad, cobertura de vocabulario, precisión de alineamiento ni comparaciones cuantitativas con otros tokenizadores.

## Requisitos de hardware

- Inferencia en CPU: el tokenizador es un componente puramente algorítmico (BPE + tablas de fusión), sin operaciones en GPU.
- VRAM estimada: 0 GB; no requiere acelerador.
- GPU recomendadas: no aplica; cualquier GPU sirve solo si el pipeline completo la necesita.
- RAM: no disponible el tamaño exacto de `tokenizer.json` y `groups.json`; para un vocabulario de 32.768 tokens y un mapa de grupos del mismo orden, el consumo esperado es de decenas de MB como máximo, pero no se ha publicado la cifra.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos sin GPU.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), la librería `tokenizers` de forma nativa, y `grouptok` (`pip install grouptok`) para leer los grupos. No se documenta soporte específico para vLLM, TGI, llama.cpp u Ollama, que en cualquier caso operan sobre modelos, no sobre este artefacto.
- Latencia y throughput: no disponibles. Al ser un BPE con 32.768 tokens y sin prefix space, el coste por token debería ser el habitual de un BPE de ese tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Artefacto | Tipo | Vocabulario | Idiomas | Agrupación por traducción | Licencia |
|---|---|---|---|---|---|
| `henryhale/grouptok-en-sw-af-32k` | Tokenizador BPE + mapa de grupos | 32.768 | en, sw, af | Sí, hasta 6 miembros por grupo | Apache 2.0 |
| BPE de referencia del autor (mismo `tokenizer.json`) | Tokenizador BPE | 32.768 | en, sw, af | No | Apache 2.0 (según el repositorio) |
| Tokenizador de XLM-R base (usado aquí como alineador) | Tokenizador SentencePiece | No disponible en la información proporcionada | Multilingüe (100 idiomas, según su model card) | No | MIT (según su model card) |

No se dispone en la información proporcionada de otros tokenizadores con agrupación por traducción para comparar directamente, ni de datos de vocabulario, contexto o rendimiento de alternativas. Cualquier comparación numérica adicional requeriría consultar las fichas de los repositorios correspondientes.

## Limitaciones y advertencias

- Los grupos heredan los errores de los alineadores de XLM-R base, y como los alineadores se entrenaron por separado para suajili y afrikáans, la calidad del agrupamiento difiere entre idiomas.
- El agrupamiento es estrictamente uno a uno entre subwords: las expresiones multipalabra y sus traducciones en una sola palabra nunca quedan agrupadas.
- El texto de entrenamiento es mayoritariamente texto minado de la web y los idiomas están balanceados por número de pares de frases, no por volumen de texto, lo que puede sesgar la cobertura hacia registros presentes en esos corpus.
- No hay tokens pad, bos ni eos declarados; si se usa en un modelo hay que definirlos explícitamente, con el riesgo de colisión o de configuración incorrecta en pipelines que los asumen.
- El vocabulario está cerrado a tres idiomas: el texto en cualquier otra lengua se tokeniza a nivel de byte, con una fertilidad muy alta.
- No es un modelo de lenguaje: no genera, no razona y no puede evaluarse con MMLU, HumanEval ni GSM8K. Cualquier expectativa de rendimiento en tareas de generación es un error de categoría.
- El repositorio no registra descargas ni interacciones, y las fechas de creación y actualización son del 19 de octubre de 2026, por lo que no hay evidencia de uso en producción ni de validación externa.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia, pero no cubre los corpus de origen (pares minados de NLLB), cuyos términos deben verificarse por separado.
- Al ser un artefacto de investigación sobre alineamiento léxico, no se documentan garantías de estabilidad de la API de `grouptok` 0.5.0 ni compatibilidad con versiones futuras.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/henryhale/grouptok-en-sw-af-32k
- Herramienta `grouptok`: https://github.com/henryhale/grouptok
- Alineador XLM-R base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Corpus de pares inglés–suajili: https://huggingface.co/datasets/michsethowusu/english-swahili_sentence-pairs
- Corpus de pares inglés–afrikáans: https://huggingface.co/datasets/michsethowusu/afrikaans-english_sentence-pairs
