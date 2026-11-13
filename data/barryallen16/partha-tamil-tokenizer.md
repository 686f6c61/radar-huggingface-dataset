# barryallen16/partha-tamil-tokenizer

## Resumen

Partha Tamil Tokenizer es un tokenizador BPE (Byte Pair Encoding) especializado en tamil, desarrollado por el usuario barryallen16 bajo el nombre de proyecto "Partha". No es un modelo de lenguaje generativo, sino el componente de tokenizacion que se situa antes de cualquier LLM: convierte texto tamil en IDs de tokens. Su propuesta central es sustituir el vocabulario basado en bytes crudos por un vocabulario base de 1.135 clusters ortograficos tamiles, de modo que silabas Grantha y conjunciones se codifican en un solo token en lugar de reconstruirse mediante merges o caer en fallback de bytes.

El repositorio publica dos variantes entrenadas sobre corpus distintos: una de 30K tokens entrenada solo con Wikipedia tamil limpia y otra de 120K tokens entrenada con una mezcla de Wikipedia, IndicCorpV2 y transcripciones conversacionales de YouTube. La variante de 120K es la que se carga por defecto desde la raiz del repositorio con `AutoTokenizer.from_pretrained`. El tokenizador esta implementado en Rust y exportado al formato de la libreria `tokenizers` de Hugging Face, con verificacion de fidelidad de exportacion del 100% en decodificacion.

Su relevancia es practica: los tokenizadores byte-fallback multilingues (Llama 3, cl100k_base) gastan aproximadamente un token por byte UTF-8 en tamil, lo que infla el coste computacional y reduce la ventana efectiva de contexto para texto tamil. Partha reduce esa cifra a 1,57 tokens por palabra en la evaluacion bits-per-byte reportada, un orden de magnitud por debajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE (Byte Pair Encoding) con vocabulario base de clusters ortograficos tamiles y fallback de bytes; implementacion en Rust |
| Parametros totales | no disponible (es un tokenizador, no un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (el tokenizador no impone ventana; la fija el modelo que lo use) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | tamil (ta) |
| Licencia | MIT |
| Formato de pesos | JSON: formato nativo del trainer (`{vocab, merges, metadata}`), formato Hugging Face `tokenizers` (`tokenizer.json`), `tokenizer_config.json`, `special_tokens_map.json` |
| Vocabulario | 30.000 tokens (variante wiki) y 120.000 tokens (variante mixed) |
| Vocabulario base | 1.135 clusters ortograficos tamiles |
| Tamano del repo | 0,1 GB |
| Libreria | `tokenizers` |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El tokenizador es un BPE clasico con una decision de diseno poco habitual: en lugar de partir de 256 bytes como vocabulario inicial (el enfoque de GPT-2, Llama 3 o cl100k_base), parte de 1.135 clusters ortograficos del tamil. Esto significa que las silabas Grantha y las conjunciones complejas del sistema de escritura tamil entran en el vocabulario como unidades atomicas, en lugar de formarse por merges sucesivos o degradarse a secuencia de bytes. El entrenamiento se implementa en Rust, con comandos `cargo run --release -- train` sobre ficheros de texto plano, y la exportacion al formato Hugging Face se hace con el subcomando `export`.

Los datos de entrenamiento de la variante de 30K son Wikipedia tamil limpia. La variante de 120K se entrena sobre una mezcla preparada con `scripts/prepare_corpus.py --mix data/mixed 200 wiki+ic+transcripts`, es decir, Wikipedia, IndicCorpV2 y transcripciones conversacionales de YouTube del conjunto `sivabharani-comments`. Ambas variantes anaden prefijos de espacio inicial al estilo SentencePiece en las lineas de entrenamiento. La model card no documenta el numero exacto de tokens de entrenamiento ni la proporcion precisa de cada fuente en la mezcla.

La verificacion de calidad se centra en la fidelidad de la exportacion: `tokenizer.json` reproduce el 100,0% de los IDs del encoder Rust, la decodificacion round-trip es del 100,0% en ambos splits held-out, no se pierden merges y el mapeo de tokens de fallback de bytes coincide con la tabla canonica de GPT-2. El tokenizador no anade BOS ni EOS automaticamente, aunque expone `bos_token_id` y `eos_token_id` para bucles de entrenamiento que los necesiten.

## Capacidades

- Tokenizacion y detokenizacion de texto tamil con ratio de compresion alto: 13,115 a 16,251 bytes por token en los corpus evaluados, frente a aproximadamente 1 byte por token en tokenizadores byte-fallback sin vocabulario tamil.
- Codificacion atomica de silabas Grantha y conjunciones tamiles gracias al vocabulario base de 1.135 clusters.
- Fallback de bytes compatible con la tabla canonica de GPT-2 para caracteres fuera del vocabulario.
- Dos tamanos de vocabulario intercambiables: 30K (dominio Wikipedia) y 120K (mezcla wiki + IndicCorpV2 + transcripciones).
- Carga desde Python con `transformers.AutoTokenizer` o con `tokenizers.Tokenizer.from_file`, sin dependencia de `transformers`.
- Exportacion y conversion desde el formato nativo del trainer mediante el encoder Rust.
- No incluye cabecera de modelo, capas de atencion ni capacidad generativa: es exclusivamente un componente de preprocesado.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento, por su propia naturaleza.

## Casos de uso

- Entrenamiento de LLM en tamil desde cero o continuado: el tokenizador reduce el numero de tokens necesarios para representar el mismo corpus tamil en un factor cercano a 7-8 respecto a Llama 3 o cl100k_base, lo que se traduce directamente en menos pasos de entrenamiento y menos memoria de activaciones para el mismo numero de documentos.
- Ampliacion de vocabulario de un modelo existente: se puede usar el vocabulario de 30K o 120K como base para anadir tokens tamiles a un modelo multilingue, inicializando los embeddings nuevos con las representaciones medias de los subtokens byte-fallback que sustituyen.
- Ajuste fino supervisado (SFT) sobre dialogos tamiles: la variante de 120K esta entrenada con transcripciones conversacionales, por lo que su ratio en habla coloquial (14,050 bytes/token, 1,413 tokens/palabra) es mejor que el de la variante wiki, adecuada para asistentes conversacionales.
- Procesado de corpus y analisis linguistico a gran escala: al reducir tokens por palabra a 1,522-1,895 en IndicCorpV2, abarata el indexado, el conteo de frecuencias y el calculo de perplejidad sobre grandes volumenes de texto tamil.
- Evaluacion comparativa de modelos en tamil: sirve como referencia de tokenizacion para medir bits-per-byte y normalizar resultados entre modelos con tokenizadores distintos, tal como se hace en la propia model card con Qwen2.5-0.5B.
- Investigacion sobre justicia linguistica y eficiencia multilingue: permite cuantificar el coste real (tokens, FLOPs, coste de API) que impone un tokenizador byte-fallback a una lengua no latina, con cifras reproducibles.
- Preprocesado en pipelines de datos en Rust: al disponer de encoder nativo en Rust, se puede integrar en etapas de limpieza y tokenizacion de alto rendimiento sin pasar por Python.

## Benchmarks y rendimiento

La model card reporta evaluacion sobre splits held-out (no usados en entrenamiento). Ratios en bytes por token y tokens por palabra:

| Modelo | wiki B/tok | IndicCorp B/tok | transcripts B/tok | wiki tok/w | IndicCorp tok/w | transcripts tok/w |
|---|---:|---:|---:|---:|---:|---:|
| Partha Tamil (30K) | 13,115 | 13,053 | 9,049 | 1,807 | 1,895 | 2,768 |
| Partha Tamil (120K) | 14,720 | 16,251 | 14,050 | 1,610 | 1,522 | 1,413 |

Evaluacion bits-per-byte bajo Qwen2.5-0.5B:

| Tokenizador | tok/word | bits/byte |
|---|---:|---:|
| Partha Tamil (120K) | 1,57 | 1,00 |
| bert-base-multilingual-cased | 3,74 | 2,16 |
| Llama 3 | 11,96 | 3,60 |
| cl100k_base | 11,88 | 3,60 |

La model card senala que Llama 3 y cl100k_base quedan a un 0,007% de distancia en tokens emitidos, y argumenta que ambos, al ser BPE con fallback de bytes y sin vocabulario tamil, colapsan a aproximadamente un token por byte UTF-8. La medicion de bits-per-byte se realizo sobre la exportacion de 120K antes del cambio de prefijo dummy; el autor indica que los modelos publicados son ligeramente mejores en bytes por token y que la diferencia es inferior al 1% en cualquier caso. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) porque no aplican a un tokenizador.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el tokenizador no ejecuta operaciones en GPU.
- Memoria RAM: el repositorio completo ocupa 0,1 GB; la carga en memoria de un vocabulario de 120K tokens y sus merges es del orden de decenas de megabytes.
- GPU recomendadas: ninguna. El cuello de botella es CPU y, en la implementacion Rust, el rendimiento por nucleo.
- Cabe en cualquier maquina, incluidos entornos sin GPU y contenedores de recursos minimos.
- Opciones de despliegue: `transformers.AutoTokenizer` (Python), `tokenizers.Tokenizer.from_file` (Python, sin `transformers`), encoder nativo Rust compilado con `cargo run --release`. No se documenta integracion directa con vLLM, TGI, llama.cpp u Ollama, aunque al producir un `tokenizer.json` estandar de Hugging Face es compatible con cualquier runtime que acepte ese formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo califica la implementacion como "high-performance" sin aportar cifras de tokens por segundo.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Partha Tamil (120K) | BPE con clusters ortograficos tamiles | 120.000 | ta | MIT | Hugging Face, formato `tokenizers` + Rust |
| Partha Tamil (30K) | BPE con clusters ortograficos tamiles | 30.000 | ta | MIT | Hugging Face, formato `tokenizers` + Rust |
| Llama 3 | BPE byte-fallback | 128.256 (no verificado en la fuente) | multilingue | licencia Llama 3 | pesos abiertos con restricciones |
| cl100k_base (OpenAI) | BPE byte-fallback | no disponible en la fuente | multilingue | propietaria | API y tiktoken |
| bert-base-multilingual-cased | WordPiece | no disponible en la fuente | 104 idiomas | Apache 2.0 | Hugging Face |

En la metrica reportada de bits-per-byte bajo Qwen2.5-0.5B, Partha Tamil (120K) obtiene 1,00 frente a 2,16 de bert-base-multilingual-cased y 3,60 tanto de Llama 3 como de cl100k_base. En tokens por palabra la diferencia es de 1,57 frente a 3,74, 11,96 y 11,88 respectivamente. La comparacion es de eficiencia de tokenizacion en tamil, no de calidad de modelado.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo: no genera texto, no razona y no puede usarse por si solo para ninguna tarea de NLP mas alla del preprocesado.
- Monolingue por diseno: solo tamil. No se documenta comportamiento en texto mixto tamil-ingles, habitual en contextos reales, ni en srilankes o dialectos.
- La model card no documenta sesgos del corpus. Wikipedia e IndicCorpV2 tienen sesgos de dominio y de registro conocidos en corpus web, y las transcripciones de YouTube introducen ruido, coloquialismos y posible contenido no moderado.
- El vocabulario base de 1.135 clusters es una decision de diseno fija: cualquier error de cobertura ortografica se resuelve por fallback de bytes, con el coste de compresion correspondiente.
- El tokenizador no anade BOS ni EOS automaticamente; un pipeline que los espere debe gestionarlos explicitamente.
- Los ficheros `.json` de la raiz del repositorio estan en el formato nativo del trainer (`{vocab, merges, metadata}`) y solo cargan con el encoder Rust; para Python hay que usar los subdirectorios `*_hf` o los ficheros `tokenizer.json` de la raiz.
- La variante de 120K se midio en bits-per-byte antes de un cambio de prefijo; las cifras publicadas y las del modelo final difieren en menos del 1%, pero no son identicas.
- Ausencia total de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros.
- Licencia MIT, sin restricciones documentadas para uso comercial, pero al ser un componente de un pipeline mayor la responsabilidad sobre los datos de entrenamiento del modelo final recae en quien lo integra.
- No hay garantia de mantenimiento ni de compatibilidad futura con versiones de `tokenizers` o `transformers`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/barryallen16/partha-tamil-tokenizer
- Model card (README del repositorio): https://huggingface.co/barryallen16/partha-tamil-tokenizer/blob/main/README.md
- Tokenizer por defecto (120K mixed): https://huggingface.co/barryallen16/partha-tamil-tokenizer/blob/main/tokenizer.json
- Variante 30K wiki: https://huggingface.co/barryallen16/partha-tamil-tokenizer/tree/main/tamil_tokenizer_wiki_hf
- Variante 120K mixed: https://huggingface.co/barryallen16/partha-tamil-tokenizer/tree/main/tamil_tokenizer_wiki_120k_mixed_hf
- Libreria `tokenizers` de Hugging Face: https://github.com/huggingface/tokenizers
- Documentacion de `AutoTokenizer`: https://huggingface.co/docs/transformers/main_classes/tokenizer
- Paper de referencia sobre BPE (Sennrich et al., 2016): https://arxiv.org/abs/1508.07909
- IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- No se han encontrado en la informacion disponible papers, blogs, demos ni repositorios adicionales del autor.
