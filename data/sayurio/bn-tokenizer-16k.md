# sayurio/bn-tokenizer-16k

## Resumen

`sayurio/bn-tokenizer-16k` es un tokenizador Byte-Pair Encoding (BPE) de vocabulario compacto (16.384 tokens) disenado especificamente para procesamiento de lenguaje natural en bengali nativo. Lo desarrolla el usuario independiente sayurio y esta pensado para modelos de lenguaje pequenos (SLM, hasta ~500M de parametros), despliegue en el borde (edge) y arquitecturas de OCR documental basadas en modelos vision-lenguaje, donde el tamano de la tabla de embeddings es una restriccion critica.

El problema que resuelve es concreto: los tokenizadores multilingues genericos (estilo LLaMA, Mistral o Qwen) fragmentan las palabras y las ligaduras (যুক্তবর্ণ) del bengali en multiples subtokens, lo que infla la longitud efectiva de las secuencias y penaliza tanto la latencia como la calidad del modelado. Este tokenizador preserva raices, sufijos y ligaduras de alta frecuencia como tokens unificados, alcanzando una compresion media de aproximadamente 5,50 caracteres por token en texto formal bengali.

Es relevante ahora porque permite construir modelos bengali con una tabla de embeddings de ~33,6M de parametros (a dimension 2048), una cuarta parte de la que exigiria un vocabulario de 64k, y porque reduce el coste del softmax de salida en cada paso de decodificacion. No es un modelo de lenguaje: es el componente de tokenizacion que se acoplaria a uno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Pair Encoding (BPE) con pre-tokenizacion y decodificacion Metaspace |
| Parametros totales | no disponible (es un tokenizador, no un modelo neuronal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no disponible (no aplica a tokenizadores) |
| Idiomas soportados | bengali (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | ficheros de tokenizador de Hugging Face (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`/`merges.txt`) |

| Parametro adicional | Valor |
|---|---|
| Tamano de vocabulario | 16.384 |
| Normalizador | Unicode NFC + Strip |
| Pre-tokenizador | Metaspace (replacement `▁`, prepend `always`) |
| Decodificador | Metaspace (replacement `▁`, prepend `always`) |
| Frecuencia minima de token | 3 |
| Corpus de entrenamiento | ~1,11 GB de texto limpio, mas de 500.000 frases deduplicadas |
| Dominios del corpus | Wikipedia bengali, AI4Bharat Sangraha, periodismo nacional |
| Tokens especiales | `<pad>`=0, `<s>`=1, `</s>`=2, `<unk>`=3 |

## Arquitectura y entrenamiento

El componente es un tokenizador BPE clasico implementado sobre la libreria `tokenizers` de Hugging Face con backend Rust. La cadena de procesamiento aplica normalizacion Unicode NFC mas eliminacion de espacios sobrantes, seguida de pre-tokenizacion Metaspace con el caracter `▁` como marcador de frontera de palabra, lo que garantiza reconstruccion exacta del texto original (incluidos los espacios) al decodificar. Se conservan explicitamente el Zero-Width Non-Joiner (`\u200c`) y el Zero-Width Joiner (`\u200d`), imprescindibles para las reglas ortograficas del bengali.

El entrenamiento se realizo sobre aproximadamente 1,11 GB de texto bengali limpio (mas de 500.000 frases deduplicadas) procedente de la Wikipedia bengali, los recursos curados de AI4Bharat (Sangraha) y prensa regional contemporanea. El pre-filtrado elimina escrituras extranjeras, etiquetas HTML/Markdown residuales y marcadores de bytes corruptos, reteniendo unicamente el bloque Unicode bengali (`\u0980`-`\u09FF`), los numerales bengalies (০-৯) y la puntuacion estandar. La composicion canonica NFC se aplica antes del ranking de pares, y el umbral de frecuencia minima por token se fija en 3.

La innovacion tecnica destacable es la preservacion de ligaduras frecuentes (`ক্ষ`, `জ্ঞ`, `ঞ্চ`, `ণ্ড`, `ক্ত`, `ত্র`, `ঙ্গ`) y raices multisilabicas (`শিক্ষাক্রম`, `বুদ্ধিমত্তা`) como tokens unicos, con retroceso a composicion a nivel de caracter para las ligaduras raras. El autor declara una compresion media de ~5,50 caracteres por token en texto formal, con ejemplos medidos de 5,60 caracteres/token en texto academico y 6,40 en texto cientifico-tecnico.

## Capacidades

- Tokenizacion y detokenizacion sin perdida de texto bengali, con preservacion exacta de espacios mediante Metaspace.
- Segmentacion unificada de raices, sufijos y ligaduras de alta frecuencia, reduciendo la longitud de secuencia frente a tokenizadores multilingues.
- Manejo correcto de caracteres invisibles (ZWNJ y ZWJ) necesarios para la ortografia bengali.
- Normalizacion Unicode NFC para evitar diacriticos vocales descompuestos (por ejemplo, `ো` no se parte en `ে` + `া`).
- Compatibilidad con la API `AutoTokenizer` de `transformers` y con la API nativa de `tokenizers`.
- Vocabulario compacto que reduce el coste computacional del softmax de salida (~4x mas barato por paso que un vocabulario de 64k).
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un componente de tokenizacion.
- Cobertura limitada al bengali; no esta disenado para texto multilingue ni code-switching.

## Casos de uso

- Entrenamiento de modelos de lenguaje bengali pequenos: con 16.384 tokens y una dimension oculta de 2048, la tabla de embeddings de entrada ocupa ~33,6M de parametros, lo que permite entrenar SLM de hasta ~500M de parametros en presupuestos de VRAM ajustados.
- OCR documental con modelos vision-lenguaje: en pipelines de digitalizacion de documentos bengalies, el vocabulario compacto reduce la tabla de embeddings y acelera la decodificacion token a token, algo critico cuando se procesan miles de paginas.
- Inferencia en dispositivos de borde: al reducir el coste del softmax de salida y el tamano del embedding, encaja en escenarios on-device con memoria limitada (moviles, SBC, portatiles sin GPU dedicada).
- Procesamiento de prensa y texto periodistico: el corpus incluye periodismo nacional contemporaneo, por lo que la segmentacion de vocabulario politico, economico y cultural resulta eficiente.
- Modelado de texto academico y enciclopedico: la inclusion de Wikipedia bengali y AI4Bharat Sangraha favorece la compresion en prosa formal y articulos tecnicos.
- Preprocesamiento para tareas de NLP bengali (clasificacion, NER, resumen): sirve como capa de tokenizacion para modelos encoder o encoder-decoder que operen en bengali.
- Sustitucion de tokenizadores multilingues en modelos existentes: cuando se reentrena el embedding de un modelo pequeno para bengali, este tokenizador ofrece mejor compresion que un vocabulario generico de 32k o 64k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un tokenizador y no de un modelo de lenguaje. El autor si publica mediciones de compresion:

| Variante | Vocabulario | Caracteres/token (formal) | Parametros de embedding @ d=2048 |
|---|---|---|---|
| `bn-tokenizer-16k` | 16.384 | ~5,5-6,5 | ~33,6M |
| `bn-tokenizer-32k` | 32.768 | ~6,5-7,5 | ~67,1M |
| `bn-tokenizer-64k` | 65.536 | ~8,0 | ~134,2M |

| Ejemplo | Texto | Caracteres | Tokens de contenido | Caracteres/token |
|---|---|---|---|---|
| Formal/academico | «স্বাধীন বাংলাদেশের জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড» | 56 | 10 | 5,60 |
| Cientifico/tecnico | «বিজ্ঞান ও প্রযুক্তির উৎকর্ষে কম্পিউটার প্রোগ্রামিং এবং কৃত্রিম বুদ্ধিমত্তা অত্যন্ত গুরুত্বপূর্ণ।» | 96 | 15 | 6,40 |

## Requisitos de hardware

- VRAM: no aplica al tokenizador en si; el consumo depende del modelo que lo utilice. Como referencia, la tabla de embeddings de entrada a dimension 2048 ocupa ~33,6M de parametros (~67 MB en FP16), y la proyeccion de salida anade lo mismo salvo que los pesos esten atados.
- GPU recomendadas: no aplica. El tokenizador se ejecuta en CPU con el backend Rust de `tokenizers`, con latencia despreciable frente a la inferencia del modelo.
- GPU de consumo: el tokenizador cabe en cualquier maquina; el modelo asociado (SLM de hasta ~500M de parametros) puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, segun cuantizacion.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), libreria `tokenizers` (Rust), y como componente de pipelines servidos con vLLM, TGI, llama.cpp u Ollama cuando el modelo los soporte.
- Latencia y throughput: no disponibles de forma numerica; el autor solo indica que el softmax de 16k es ~4x mas barato por paso de decodificacion que uno de 64k.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Caracteres/token (formal) | Parametros de embedding @ d=2048 | Licencia |
|---|---|---|---|---|
| `sayurio/bn-tokenizer-16k` | 16.384 | ~5,5-6,5 | ~33,6M | Apache 2.0 |
| `sayurio/bn-tokenizer-32k` | 32.768 | ~6,5-7,5 | ~67,1M | no disponible |
| `sayurio/bn-tokenizer-64k` | 65.536 | ~8,0 | ~134,2M | no disponible |
| Tokenizador multilingue generico (LLaMA/Mistral/Qwen) | 32k-152k | no disponible (fragmenta ligaduras bengalies) | mayor | varía segun modelo |

## Limitaciones y advertencias

- Cobertura exclusiva del bengali: no maneja texto multilingue, code-switching ni escrituras latinas o devanagari, que se filtran del corpus.
- Las ligaduras raras no presentes en el corpus caen a composicion a nivel de caracter, lo que reduce la compresion en dominios muy especializados (por ejemplo, terminologia cientifica poco frecuente).
- Compresion inferior a la de variantes de 32k y 64k: el ahorro de parametros se paga con secuencias mas largas en caracteres/token.
- El corpus incluye un dataset etiquetado como NSFW (`sayurio/bangla-nsfw-stories-scrape`), lo que puede introducir sesgos de dominio y requiere revision si se usa en entornos sensibles.
- Riesgo de alucinacion: no aplica al tokenizador, pero si al modelo que lo emplee; el tokenizador no mitiga sesgos del modelo.
- Licencia Apache 2.0 permite uso comercial y modificacion, pero conviene verificar la procedencia de los datos de entrenamiento (Wikipedia, AI4Bharat y scraping) antes de un despliegue en produccion.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- No se publican evaluaciones de calidad de tokenizacion mas alla de los dos ejemplos del autor.

## Enlaces

- Hugging Face: https://huggingface.co/sayurio/bn-tokenizer-16k
- Dataset Wikipedia bengali: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset BanglaNLP: https://huggingface.co/datasets/likhonsheikh/BanglaNLP
- Dataset bangla-wikipedia (sayurio): https://huggingface.co/datasets/sayurio/bangla-wikipedia
- Dataset bangla-nsfw-stories-scrape (sayurio): https://huggingface.co/datasets/sayurio/bangla-nsfw-stories-scrape
- Libreria `tokenizers` de Hugging Face: https://github.com/huggingface/tokenizers
- Documentacion de `transformers` (AutoTokenizer): https://huggingface.co/docs/transformers
