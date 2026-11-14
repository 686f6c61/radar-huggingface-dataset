# HFShishir/BanglaFast-48k-BPE-Tokenizer

## Resumen

BanglaFast 48K Pro Sovereign es un tokenizador BPE con pre-tokenización Metaspace, disenado especificamente para modelos fundacionales en bengali (bangla). Lo desarrolla el usuario HFShishir y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje en si mismo: es el componente de tokenizacion que se acopla a un LLM para reducir el coste computacional de procesar texto bengali. Su propuesta de valor es atacar la ineficiencia de tokenizacion que los tokenizadores multilingues globales (LLaMA-3, Mistral, GPT-4) presentan sobre bengali, donde cada palabra se fragmenta en 3-5 subtokens.

El tokenizador emplea un vocabulario de 48.000 tokens entrenado sobre un corpus de 213,62 MB de texto bengali limpio, con mas de 75.981 documentos de dominios como derecho constitucional, historia, agricultura, farmacologia, matematicas, programacion y conversacion cotidiana. Segun la model card, alcanza una fertilidad de 1,05-1,26 tokens por palabra en prosa estandar, frente a los 3,20-4,20 de LLaMA-3 o Mistral, lo que se traduce en una reduccion del 70-75% de la longitud de secuencia y multiplica por 3,5 el contenido efectivo en una ventana de contexto fija.

Su relevancia actual radica en la tendencia hacia LLM soberanos y especializados por idioma: un tokenizador eficiente para bengali es un prerequisito para abaratar entrenamiento e inferencia en ese idioma. Incluye ademas tokens preconfigurados para el formato conversacional ChatML, el razonamiento Chain-of-Thought de DeepSeek-R1 y tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE con pre-tokenizacion Metaspace (estilo LLaMA-3) |
| Parametros totales | no disponible (no es un modelo neuronal; es un tokenizador) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del LLM que lo integre) |
| Tipos de cuantizacion | no aplica (artefacto de tokenizacion, no de pesos) |
| Idiomas soportados | bengali (bn), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | tokenizer.json (formato de la libreria `tokenizers` de Hugging Face) |
| Tamano de vocabulario | 48.000 tokens |
| Corpus de entrenamiento | 213,62 MB, 75.981 documentos |
| Normalizacion Unicode | NFC canonica, 100% lossless en round-trip |
| Pre-tokenizador | Metaspace |
| Libreria | tokenizers (Hugging Face) |

## Arquitectura y entrenamiento

El tokenizador sigue una arquitectura Byte-Pair Encoding (BPE) con pre-tokenizacion Metaspace, el mismo esquema que emplean LLaMA-3, Mistral y DeepSeek. Esto lo hace directamente interoperable con pipelines de entrenamiento e inferencia que ya usan esos estandares. El vocabulario se inicializa con todos los grafemas basicos bengalies (73+), signos vocalicos (matras), virama (hasanta), numerales, puntuacion, mas de 35 sufijos y posposiciones gramaticales de alta frecuencia (`দের`, `গুলো`, `গুলোতে`, `কারীদের`, `ভিত্তিক`) y los 100 caracteres ASCII imprimibles. Segun el autor, esto elimina el riesgo de tokens `<unk>` fuera de vocabulario.

El corpus de entrenamiento combina datos de `wikimedia/wikipedia`, `facebook/belebele` y `nihalbaig/alpaca_bangla`, cubriendo dominios enciclopedico, legal, cientifico, matematico y conversacional. La normalizacion se aplica en forma Unicode NFC canonica, eliminando artefactos de codificacion de ZWJ (`\u200D`) y ZWNJ (`\u200C`) pero preservando las distinciones gramaticales de conjunciones (যুক্তাক্ষর). El autor declara una reconstruccion bit-exacta del 100% en codificacion/decodificacion.

Como innovaciones destacables, el tokenizador reserva e incorpora tokens especiales para el formato ChatML (`<|im_start|>`, `<|im_end|>`, `<|system|>`, `<|user|>`, `<|assistant|>`), para el modo de razonamiento de DeepSeek-R1 (`<think>`, `</think>`) y para tool calling (`<|tool_call|>`, `<|tool_result|>`). No se dispone de informacion sobre el algoritmo exacto de entrenamiento del BPE (tamano de merge, criterios de parada) ni sobre el proceso de seleccion de vocabulario mas alla de lo descrito.

## Capacidades

- Tokenizacion y detokenizacion de texto bengali e ingles con reconstruccion lossless (100% bit-exacta).
- Manejo de conjunciones bengalies complejas (যুক্তাক্ষর) como tokens unicos en la mayoria de casos.
- Fertilidad de 1,05-1,26 tokens por palabra en prosa estandar, con minimo de 1,00 en texto legal y maximo de 1,44 en agricultura.
- Soporte nativo de numerales bengalies y ASCII, fechas y cantidades.
- Tokens preconfigurados para ChatML (conversacion multi-turno con roles system/user/assistant).
- Tokens de razonamiento Chain-of-Thought compatibles con DeepSeek-R1 (`<think>`, `</think>`).
- Tokens de tool calling / function calling (`<|tool_call|>`, `<|tool_result|>`).
- Pre-tokenizacion Metaspace compatible con ecosistemas LLaMA-3, Mistral y DeepSeek.
- Cobertura de sufijos gramaticales frecuentes sin fragmentacion.
- No incluye capacidades generativas propias: es un componente de tokenizacion.

## Casos de uso

- Entrenamiento de LLM soberanos en bengali: sustituir el tokenizador de un modelo base por BanglaFast 48K reduce la longitud de secuencia un 70-75%, lo que abarata el coste de atencion cuadratica y permite entrenar con el mismo presupuesto de computo sobre mas texto efectivo.
- Ampliacion de contexto efectivo en produccion: con una ventana de 4.096 tokens, el tokenizador permite procesar hasta ~3.500 palabras bengalies frente a ~1.000 con LLaMA-3, adecuado para resumen de documentos legales o articulos largos.
- Procesamiento de documentos legales y constitucionales: la fertilidad 1:1 en texto juridico lo hace idoneo para pipelines de analisis de contratos, constituciones y normativa bangladesi donde la fidelidad terminologica es critica.
- Atencion al cliente en bengali: integrado en un LLM conversacional, el soporte ChatML y la baja fertilidad en dialogos cotidianos (1,06 tokens/palabra) reducen latencia y coste por turno en chatbots multi-turno.
- Razonamiento matematico y CoT: los tokens `<think>`/`</think>` y la fertilidad de 1,24 en matematicas permiten construir asistentes que razonen paso a paso en bengali sin penalizacion excesiva de contexto.
- Agentes con tool calling: los tokens `<|tool_call|>` y `<|tool_result|>` habilitan agentes que invocan APIs y ejecutan tareas multi-paso en bengali, con el tokenizador listo para el formato de herramientas.
- Tokenizacion de corpus para investigacion NLP en indic: util para preprocesar datasets bengalies (Wikipedia, Belebele, Alpaca) en tareas de clasificacion, NER o traduccion automatica con menor coste de memoria.
- Despliegue en hardware limitado: al reducir la longitud de secuencia, disminuye la VRAM necesaria para el KV cache en inferencia de LLM bengalies, permitiendo servir modelos en GPUs de gama consumer.

## Benchmarks y rendimiento

Los datos disponibles son de fertilidad y compresion del tokenizador, no de rendimiento de un LLM (no aplica MMLU, HumanEval, GSM8K porque no es un modelo generativo).

| Dominio | Palabras | Tokens | Fertilidad (tokens/palabra) | Fidelidad |
|---|---:|---:|---:|---|
| Derecho y constitucion | 15 | 15 | 1,00 | 100% lossless |
| Historia y guerra de liberacion | 22 | 23 | 1,05 | 100% lossless |
| Conversacion cotidiana | 16 | 17 | 1,06 | 100% lossless |
| Codigo y texto tecnico | 19 | 22 | 1,16 | 100% lossless |
| Numeros, fechas y economia | 16 | 19 | 1,19 | 100% lossless |
| Matematicas y razonamiento (CoT) | 29 | 36 | 1,24 | 100% lossless |
| Medicina y salud | 21 | 28 | 1,33 | 100% lossless |
| Agricultura y pesca | 16 | 23 | 1,44 | 100% lossless |
| Media multi-dominio | — | — | 1,05-1,26 | 100% lossless |

Comparativa de fertilidad frente a otros tokenizadores (datos declarados por el autor):

| Tokenizador | Fertilidad (tokens/palabra) |
|---|---:|
| LLaMA-3 (Meta) | ~3,80-4,20 |
| Mistral-7B | ~3,60-3,90 |
| GPT-4 (cl100k) | ~3,20-3,60 |
| BanglaBERT | ~1,85 |
| BanglaFast 48K Pro | ~1,05-1,26 |

## Requisitos de hardware

- No aplica VRAM para el tokenizador en si: el artefacto `tokenizer.json` ocupa del orden de unos pocos MB y se ejecuta en CPU.
- El impacto en hardware es indirecto: al reducir la longitud de secuencia un 70-75%, disminuye proporcionalmente el tamano del KV cache y la VRAM necesaria para servir un LLM bengali con este tokenizador.
- GPU recomendadas: depende del LLM que integre el tokenizador; el tokenizador no impone requisitos de GPU.
- Cabe en cualquier GPU consumer y en CPU: la tokenizacion es una operacion de tabla hash y merges BPE.
- Opciones de despliegue: libreria `tokenizers` de Hugging Face (Rust/Python), `transformers` (AutoTokenizer), y por interoperabilidad con Metaspace, integrable en pipelines de vLLM, TGI y llama.cpp que acepten tokenizer.json personalizado (verificar compatibilidad en cada caso).
- Latencia y throughput: no disponibles en la informacion proporcionada; la ganancia esperada es una reduccion del 70-75% en el numero de tokens procesados por el LLM aguas abajo.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Enfoque | Fertilidad bengali | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| BanglaFast 48K Pro | 48.000 | BPE Metaspace | 1,05-1,26 | Apache 2.0 | Hugging Face |
| LLaMA-3 tokenizer | 128.256 | BPE (tiktoken-like) | ~3,80-4,20 | Licencia LLaMA 3 | Hugging Face (Meta) |
| Mistral-7B tokenizer | 32.000 | BPE SentencePiece | ~3,60-3,90 | Apache 2.0 | Hugging Face |
| GPT-4 (cl100k) | ~100.000 | BPE tiktoken | ~3,20-3,60 | Propietaria (API) | Solo API |
| BanglaBERT tokenizer | ~50.000 | BPE/WordPiece | ~1,85 | MIT/Apache (segun variante) | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, razona ni responde preguntas por si mismo; debe acoplarse a un LLM que se entrene o adapte con el.
- Los benchmarks de fertilidad son declarados por el autor en la model card y no han sido verificados de forma independiente en la informacion disponible.
- La fertilidad empeora en dominios especializados (agricultura 1,44; medicina 1,33), por lo que el beneficio es menor en texto cientifico-tecnico muy especifico.
- El corpus de entrenamiento (213,62 MB) es limitado en comparacion con los corpus multilingues masivos; puede haber cobertura insuficiente de terminologia de nicho, dialectos regionales o bengali informal de redes sociales.
- Aunque declara cero riesgo de `<unk>`, la cobertura de transliteraciones, emojis, codigo mixto y texto ruidoso no esta documentada.
- Riesgo de sesgo derivado de las fuentes (Wikipedia, Belebele, Alpaca Bangla): sobrerrepresentacion de registro formal y enciclopedico frente a habla coloquial.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datasets de entrenamiento (Wikipedia, Belebele, Alpaca Bangla) no impongan restricciones adicionales sobre el artefacto derivado.
- La compatibilidad con vLLM, TGI o llama.cpp no esta verificada en la informacion proporcionada; debe validarse antes de usarlo en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria ni adopcion demostrada.
- No hay informacion sobre el proceso de entrenamiento del BPE (tamano de merge, criterios), lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/HFShishir/BanglaFast-48k-BPE-Tokenizer
- Dataset Wikipedia (multilingue): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Belebele: https://huggingface.co/datasets/facebook/belebele
- Dataset Alpaca Bangla: https://huggingface.co/datasets/nihalbaig/alpaca_bangla
- Libreria tokenizers (Hugging Face): https://github.com/huggingface/tokenizers
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
