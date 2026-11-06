# sayurio/bn-tokenizer-32k

## Resumen

`sayurio/bn-tokenizer-32k` es un tokenizador de tipo Byte-Pair Encoding (BPE) con un vocabulario de 32.768 entradas, disenado especificamente para bengali nativo. Lo publica el usuario sayurio en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje: es un componente de tokenizacion que se integra en pipelines de LLM y de sistemas de OCR documental con arquitecturas vision-lenguaje. Su proposito es resolver el problema de la fragmentacion excesiva que los tokenizadores multilingues genericos (LLaMA, Mistral, Qwen) aplican sobre el bengali, donde palabras y ligaduras (যুক্তবর্ণ) se rompen en multiples subtokens.

La propuesta central es la compresion: el autor reporta una media de aproximadamente 8,00 caracteres por token sobre texto bengali formal, lo que reduce la longitud de las secuencias entre un 60 % y un 70 % frente a tokenizadores multilingues convencionales. Con un vocabulario de 32.768 entradas, la tabla de embeddings y la proyeccion de salida ocupan la mitad de parametros que un tokenizador de 64k, manteniendo suficiente granularidad para representar raices, sufijos y ligaduras compuestas como tokens unicos.

El interes actual reside en que la mayoria de LLM abiertos no estan optimizados para lenguas del subcontinente indio: cada palabra bengali consume varios tokens, lo que encarece la inferencia, reduce el contexto efectivo y degrada la calidad en tareas de generacion larga. Un tokenizador especializado permite entrenar o adaptar modelos bengali con secuencias mas cortas y menor coste computacional, ademas de mejorar la fidelidad en OCR de documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Pair Encoding (BPE) |
| Parametros totales | no disponible (es un tokenizador, no un modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo que lo integre) |
| Tipos de cuantizacion | no disponible (no aplica a tokenizadores) |
| Idiomas soportados | bengali (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefactos de tokenizador: `tokenizer.json`, `vocab.json`, `merges.txt` segun el backend) |

Especificaciones adicionales del tokenizador:

| Parametro | Valor |
|---|---|
| Tamano de vocabulario | 32.768 |
| Pre-tokenizador | Metaspace (reemplazo `▁`, prepend `always`) |
| Decodificador | Metaspace (reemplazo `▁`, prepend `always`) |
| Normalizador | Unicode NFC + Strip |
| Frecuencia minima de token | 3 |
| Corpus de entrenamiento | ~1,11 GB de texto limpio, mas de 500.000 frases deduplicadas |
| Dominios del corpus | Wikipedia bengali, AI4Bharat Sangraha, periodismo nacional |
| Token de padding | `<pad>` (ID 0) |
| Token de inicio de secuencia | `<s>` (ID 1) |
| Token de fin de secuencia | `</s>` (ID 2) |
| Token desconocido | `<unk>` (ID 3) |

## Arquitectura y entrenamiento

El tokenizador emplea BPE puro sobre un corpus multido minio de aproximadamente 1,11 GB de texto bengali limpio, con mas de 500.000 frases deduplicadas. Las fuentes declaradas son el volcado de Wikipedia bengali (prosa academica y enciclopedica), los recursos bengali curados de AI4Bharat (registros formales y legales) y prensa regional contemporanea (uso periodistico y coloquial en politica, economia y cultura). El pipeline de preprocesado elimina escrituras extranas, etiquetas HTML o Markdown sueltas y marcadores de bytes corruptos, y retiene estrictamente el bloque Unicode bengali (U+0980 a U+09FF), los numerales bengali (০ a ৯) y la puntuacion estandar.

Tecnicamente, el tokenizador aplica normalizacion canonica Unicode NFC antes del ranking de pares, lo que evita la descomposicion de diacriticos vocales (por ejemplo, que `ো` se separe en `ে` + `া`). Usa Metaspace para el pre-tokenizado y la decodificacion, con lo que preserva los espacios en blanco de forma integra y permite una reconstruccion del texto sin perdidas. Conserva los caracteres invisibles Zero-Width Non-Joiner (U+200C) y Zero-Width Joiner (U+200D), necesarios para las reglas ortograficas del bengali. La frecuencia minima de token se fija en 3, lo que evita entradas espurias en el vocabulario.

La innovacion principal no esta en el algoritmo (BPE es estandar) sino en la curacion del corpus y en la preservacion de ligaduras compuestas. El autor documenta que ligaduras como `ক্ষ`, `জ্ঞ`, `ঞ্চ`, `ণ্ড`, `ক্ত`, `ত্র` y `ঙ্গ`, asi como raices multisilabicas (`শিক্ষাক্রম`, `পাঠ্যপুস্তক`, `বুদ্ধিমত্তা`), se representan como tokens unicos. En los ejemplos publicados, una frase de 56 caracteres se codifica en 7 tokens de contenido y una de 96 caracteres en 12, ambas a 8,00 caracteres por token. No se documenta entrenamiento con RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no aplican a un tokenizador.

## Capacidades

- Tokenizacion y detokenizacion de texto bengali con reconstruccion sin perdidas gracias a Metaspace.
- Compresion de aproximadamente 8,00 caracteres por token en texto bengali formal, con reduccion de longitud de secuencia del 60 al 70 % frente a tokenizadores multilingues.
- Preservacion de ligaduras compuestas (যুক্তবর্ণ) y raices multisilabicas como tokens unicos.
- Normalizacion Unicode NFC para evitar la separacion de diacriticos vocales.
- Retencion de caracteres Zero-Width Non-Joiner y Zero-Width Joiner para el renderizado correcto de la ortografia bengali.
- Soporte de numerales bengali (০ a ৯) y puntuacion estandar dentro del vocabulario.
- Integracion con la libreria `transformers` de Hugging Face mediante `AutoTokenizer`.
- Integracion con el backend Rust de la libreria `tokenizers` mediante `Tokenizer.from_pretrained`.
- Compatibilidad teorica con arquitecturas de LLM y de OCR vision-lenguaje, segun declara el autor; no se especifican modelos concretos validados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: esas capacidades pertenecen al modelo que lo integre, no al tokenizador.
- No soporta vision ni audio de forma nativa; la etiqueta `vlm` y `ocr` del repositorio indica su idoneidad como componente de texto en esos sistemas.

## Casos de uso

- Entrenamiento de LLM nativos en bengali: al reducir la longitud de las secuencias entre un 60 % y un 70 %, disminuye el coste de atencion y permite aprovechar mejor la ventana de contexto del modelo base durante el preentrenamiento y el ajuste fino.
- Adaptacion de modelos multilingues al bengali: se puede sustituir el tokenizador original por este y reentrenar la tabla de embeddings, con lo que se reduce el vocabulario efectivo para bengali y se mejora la eficiencia en inferencia.
- OCR documental con arquitecturas vision-lenguaje: la preservacion de ligaduras y de caracteres ZWNJ/ZWJ evita errores de renderizado en la transcripcion de documentos oficiales, formularios y prensa escaneada.
- Generacion de resumenes y traduccion automatica de noticias bengali: el corpus de entrenamiento incluye periodismo contemporaneo, lo que favorece la cobertura lexica de registro informativo y coloquial.
- Procesamiento de texto legal y administrativo: la inclusion de recursos de AI4Bharat y de prosa formal cubre terminologia de registros oficiales, util para sistemas de gestion documental publica.
- Busqueda semantica y recuperacion de informacion (RAG) sobre corpus bengali: la tokenizacion compacta reduce el numero de fragmentos necesarios y mejora la densidad informativa de cada embedding de texto.
- Analisis de sentimiento y moderacion de contenido en redes sociales bengali: el vocabulario entrenado con frecuencia minima 3 y con texto coloquial permite cubrir variantes informales del idioma.
- Tokenizacion de corpus para investigacion linguistica: la preservacion de la estructura de ligaduras facilita el analisis morfologico y la anotacion de corpus bengali.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta dos ejemplos cualitativos de compresion:

| Ejemplo | Caracteres | Tokens de contenido | Ratio |
|---|---|---|---|
| Texto academico (`স্বাধীন বাংলাদেশের জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড`) | 56 | 7 | 8,00 chars/token |
| Texto cientifico (`বিজ্ঞান ও প্রযুক্তির উৎকর্ষে কম্পিউটার প্রোগ্রামিং এবং কৃত্রিম বুদ্ধিমত্তা অত্যন্ত গুরুত্বপূর্ণ।`) | 96 | 12 | 8,00 chars/token |

No se aportan comparaciones numericas con tokenizadores de LLaMA, Mistral, Qwen ni con alternativas bengali como IndicBERT o el tokenizador de AI4Bharat. Tampoco se publican metricas de fertilidad, cobertura de vocabulario ni evaluacion en tareas downstream.

## Requisitos de hardware

- VRAM para inferencia: no aplica. Un tokenizador BPE de 32.768 entradas ocupa del orden de unos pocos megabytes en disco y en memoria; no requiere GPU.
- GPU recomendadas: ninguna especifica. La tokenizacion se ejecuta en CPU con el backend Rust de la libreria `tokenizers` a velocidades de millones de tokens por segundo.
- Compatibilidad con GPU de consumo: total; el tokenizador no consume VRAM. La VRAM necesaria la determina el modelo de lenguaje al que se integre.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), libreria `tokenizers` (backend Rust), y cualquier framework que cargue artefactos `tokenizer.json` o `vocab.json` + `merges.txt` (vLLM, TGI, llama.cpp, Ollama) siempre que el modelo asociado se haya entrenado con este vocabulario.
- Latencia y throughput: no disponibles de forma explicita. El backend Rust de `tokenizers` es el recomendado por el autor para maximizar rendimiento.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Idiomas | Licencia | Ratio reportado en bengali |
|---|---|---|---|---|---|
| sayurio/bn-tokenizer-32k | BPE | 32.768 | bengali | Apache 2.0 | ~8,00 chars/token (autor) |
| Tokenizador de LLaMA | BPE (SentencePiece) | 32.000 | multilingue | Llama 2/3 Community License | no disponible |
| Tokenizador de Mistral | BPE (SentencePiece) | 32.000 | multilingue | Apache 2.0 | no disponible |
| Tokenizador de Qwen | BPE | 151.643 (Qwen2) | multilingue | Apache 2.0 / Qwen License | no disponible |
| Tokenizador de AI4Bharat (IndicBERT) | BPE (SentencePiece) | 32.000 | indico (incluye bengali) | MIT / Apache 2.0 segun variante | no disponible |

No se dispone de datos publicados que permitan comparar directamente el ratio de compresion de `bn-tokenizer-32k` con el de los tokenizadores multilingues citados; la cifra de 8,00 chars/token procede unicamente de los ejemplos de la model card del autor. La ventaja estructural frente a LLaMA, Mistral o Qwen es que estos ultimos reparten el vocabulario entre decenas de idiomas, lo que reduce la cobertura especifica del bengali.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo de lenguaje: no genera texto, no razona y no puede usarse de forma autonoma. Cualquier expectativa de rendimiento en tareas downstream depende del modelo que lo integre.
- No se han publicado evaluaciones cuantitativas de calidad (fertilidad, cobertura, rendimiento en benchmarks) mas alla de dos ejemplos cualitativos de compresion.
- El ratio de 8,00 caracteres por token procede de dos ejemplos seleccionados por el autor; puede no mantenerse en registros coloquiales, dialectos regionales o texto con mezcla de ingles y bengali.
- El vocabulario esta restringido al bloque Unicode bengali, numerales y puntuacion estandar. Texto con caracteres latinos, emojis o simbolos tecnicos puede tokenizarse de forma ineficiente o caer en `<unk>`.
- El corpus incluye un dataset denominado `sayurio/bangla-nsfw-stories-scrape`, lo que puede introducir lexico de contenido adulto en el vocabulario. Conviene revisarlo si el uso previsto es educativo o infantil.
- No se documenta el sesgo de dominio del corpus: la proporcion de Wikipedia, AI4Bharat y prensa no esta cuantificada, por lo que se desconoce el equilibrio entre registro formal, legal y coloquial.
- No hay validacion publicada de integracion con modelos concretos (LLaMA, Mistral, Qwen) ni guia sobre como reentrenar la tabla de embeddings tras sustituir el tokenizador.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y sin garantias. No impone restricciones adicionales, pero tampoco ofrece indemnizacion.
- Riesgo de alucinacion: no aplica al tokenizador en si, pero si al modelo que lo utilice; la tokenizacion compacta no corrige los sesgos ni las alucinaciones del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sayurio/bn-tokenizer-32k
- Dataset Wikipedia bengali: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset BanglaNLP (likhonsheikh): https://huggingface.co/datasets/likhonsheikh/BanglaNLP
- Dataset bangla-wikipedia (sayurio): https://huggingface.co/datasets/sayurio/bangla-wikipedia
- Dataset bangla-nsfw-stories-scrape (sayurio): https://huggingface.co/datasets/sayurio/bangla-nsfw-stories-scrape
- Documentacion de la libreria `tokenizers`: https://huggingface.co/docs/tokenizers
- Documentacion de `AutoTokenizer` en `transformers`: https://huggingface.co/docs/transformers/main_classes/tokenizer
- Recursos bengali de AI4Bharat: https://ai4bharat.org/
- Especificacion Unicode del bloque bengali (U+0980 a U+09FF): https://www.unicode.org/charts/PDF/U0980.pdf
