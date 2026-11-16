# shah-bakhsh/BalLatn-Tokenizer-24K

## Resumen

BalLatn-Tokenizer-24K es un tokenizador Byte-Level BPE de 24.000 tokens desarrollado por el usuario shah-bakhsh y publicado en Hugging Face bajo licencia MIT. No es un modelo de lenguaje generativo, sino el componente de tokenizacion que debe acompanar a cualquier modelo que se entrene o ajuste para balochi en escritura latina (`ISO 639-3: bal`, script `Latn`). El autor lo presenta como el tokenizador de referencia para el balochi latino "puro", entrenado sobre prosa literaria (*Dastan*), poesia (*Shaer*) y definiciones lexicas (*Namgal*, *Rangal*) extraidas de los sitios Labzank y Naganj.

El problema que aborda es concreto: los tokenizadores multilingues genericos fragmentan el balochi en muchos mas subtokens de los necesarios, lo que encarece el entrenamiento y degrada la calidad en un idioma de bajos recursos. El autor reporta una fertilidad de aproximadamente 1,15-1,30 tokens por palabra balochi, casi tres veces mas eficiente que los tokenizadores multilingues por defecto. Ademas, aplica solo normalizacion Unicode NFC, preservando las vocales acentuadas (`a, e, o` con tilde aguda) y los digrafos propios (`ch, dh, gh, kh, sh, th, zh`), y garantiza cero caracteres en escritura arabe y cero contaminacion de glosas en ingles.

La relevancia actual es la de una pieza de infraestructura linguistica para un idioma con escasisimos recursos digitales. Al estar empaquetado como tokenizador de `transformers` y ser compatible con los endpoints de Hugging Face, puede integrarse directamente en pipelines de entrenamiento existentes, aunque conviene subrayar que no incluye pesos de modelo ni capacidades de generacion por si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador Byte-Level BPE (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica: tokenizador) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no disponible (no aplica a tokenizadores) |
| Idiomas soportados | bal (balochi, escritura latina) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefactos de tokenizador de `transformers`: `tokenizer.json`, `vocab.json`, `merges.txt`, `tokenizer_config.json`, `special_tokens_map.json`) |

| Parametro adicional | Valor |
|---|---|
| Tamano de vocabulario | 24.000 tokens |
| Normalizacion Unicode | NFC exclusivamente |
| Alfabeto preservado | vocales acentuadas (`a, e, o, A, E, O`) y digrafos `ch, dh, gh, kh, sh, th, zh` |
| Fertilidad reportada | ~1,15-1,30 tokens por palabra balochi |
| Script | Latn (cero caracteres en rango arabe `[\u0600-\u06FF]`) |
| Libreria | transformers (`AutoTokenizer`) |
| Compatibilidad endpoints | si (`endpoints_compatible`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

El componente es un tokenizador Byte-Level BPE con vocabulario de 24.000 entradas. La eleccion de byte-level permite representar cualquier secuencia de bytes de entrada sin tokens desconocidos (OOV), lo que es especialmente util en un idioma de bajos recursos donde el vocabulario nunca cubrira todas las formas. La normalizacion se limita a NFC, una decision deliberada para no colapsar las vocales acentuadas del balochi latino ni alterar los digrafos, algo que los normalizadores mas agresivos de tokenizadores multilingues tienden a hacer.

El corpus de entrenamiento, segun la model card, combina prosa literaria (*Dastan*), poesia (*Shaer*) y definiciones lexicas (*Namgal*, *Rangal*) procedentes de Labzank y Naganj. El autor declara explicitamente que el corpus esta libre de escritura arabe y de glosas en ingles, lo que evita que el vocabulario se contamine con tokens de otros sistemas de escritura o de traduccion. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de filtrado adicionales; esos datos no estan disponibles en la informacion proporcionada.

No hay innovaciones de arquitectura neuronal que destacar (no hay atencion lineal, decodificacion especulativa ni mezcla de expertos), porque el artefacto no es un modelo. La innovacion es linguistica y de preprocesado: un vocabulario especializado que reduce la fertilidad y respeta la ortografia balochi latina.

## Capacidades

- Tokenizacion y detokenizacion de texto balochi en escritura latina, con preservacion de vocales acentuadas y digrafos.
- Codificacion byte-level sin tokens desconocidos: cualquier entrada de bytes produce una secuencia de IDs valida.
- Fertilidad de ~1,15-1,30 tokens por palabra, lo que reduce la longitud efectiva de las secuencias frente a tokenizadores multilingues genericos.
- Integracion directa con `transformers` mediante `AutoTokenizer.from_pretrained`.
- Compatible con los endpoints de Hugging Face (inferencia remota de tokenizacion).
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es exclusivamente un tokenizador.
- No soporta tool calling ni function calling por si mismo; esas capacidades dependerian del modelo que se entrene con este vocabulario.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Cobertura multilingue limitada a `bal` en script latino; no cubre balochi en escritura arabe ni otros idiomas.

## Casos de uso

- Entrenamiento de un modelo de lenguaje desde cero para balochi latino: usar este tokenizador como vocabulario base reduce la longitud de las secuencias y, con ello, el coste computacional de preentrenamiento en un idioma de bajos recursos.
- Ajuste fino de un modelo multilingue existente: reemplazar el tokenizador original por este y remapear los embeddings permite adaptar un modelo abierto al balochi latino sin partir de cero.
- Modelado de lenguaje para correccion ortografica: la preservacion estricta de tildes y digrafos hace que el tokenizador sea adecuado para tareas que dependen de la forma exacta de la palabra.
- Construccion de corpus y analisis lexico: tokenizar textos literarios (*Dastan*) y poeticos (*Shaer*) para estudios de frecuencia, riqueza lexica o alineamiento con diccionarios (*Namgal*, *Rangal*).
- Pipelines de traduccion automatica balochi-latino a otros idiomas: como capa de tokenizacion del lado fuente, con un vocabulario que no fragmenta las palabras balochi.
- Sistemas de busqueda y recuperacion de informacion en balochi latino: la menor fertilidad reduce el numero de tokens indexados y mejora la eficiencia del indice invertido.
- Prototipado rapido con `AutoTokenizer`: al ser compatible con los endpoints de Hugging Face, permite validar la tokenizacion de un corpus antes de comprometerse a un entrenamiento costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la fertilidad de ~1,15-1,30 tokens por palabra balochi, que no se presenta acompanada de una comparacion numerica detallada con tokenizadores alternativos.

| Metrica | Valor reportado |
|---|---|
| Fertilidad (tokens por palabra balochi) | ~1,15-1,30 |
| Comparacion con tokenizadores multilingues por defecto | "casi 3x mas eficiente" (sin cifras concretas) |
| MMLU, HumanEval, GSM8K u otros | no aplica / no disponible |

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. La tokenizacion es una operacion de CPU sobre tablas de merge; el artefacto ocupa unos pocos megabytes en disco.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente para tokenizar a alta velocidad.
- Cabe en cualquier GPU consumer (e incluso en entornos sin GPU); no aplica el concepto de "caber" en VRAM.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), integracion en pipelines de `datasets`/`tokenizers` (Rust), y uso dentro de cualquier framework que consuma tokenizadores de Hugging Face (PyTorch, TensorFlow, JAX). No aplica `vLLM`, `llama.cpp`, `Ollama` ni `TGI` en sentido estricto, salvo como parte del modelo que lo incorpore.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser byte-level BPE en Rust, el throughput tipico de este tipo de tokenizadores es de millones de tokens por segundo en CPU, pero no hay cifras publicadas para este artefacto concreto.

## Comparativa con modelos similares

| Tokenizador | Idioma / script | Vocabulario | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BalLatn-Tokenizer-24K | bal (latino) | 24.000 | Byte-Level BPE especializado, solo NFC | MIT | Hugging Face |
| Tokenizadores multilingues genericos (p. ej. los de modelos multilingues abiertos) | multi | 100.000-250.000 | BPE/SentencePiece con cobertura amplia | variable | amplia |
| Tokenizadores especificos de escritura arabe para balochi | bal (arabe) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparacion cuantitativa con alternativas concretas no esta disponible: no se identifican en la informacion proporcionada otros tokenizadores publicos especificos para balochi latino con los que contrastar fertilidad, vocabulario o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde a prompts. Cualquier uso que espere generacion requerira un modelo entrenado con este tokenizador.
- Cobertura restringida a balochi en escritura latina; no cubre balochi en escritura arabe ni variantes dialectales no representadas en el corpus.
- Corpus de entrenamiento limitado a fuentes literarias y lexicas de Labzank y Naganj; el vocabulario puede tener sesgo hacia el registro escrito formal y la poesia, con menor cobertura de lenguaje coloquial, redes sociales o dominios tecnicos.
- Riesgo de sobreajuste al corpus: palabras o prestamos poco frecuentes se fragmentaran en mas subtokens de lo deseable.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre la calidad ni sobre derechos de las fuentes del corpus; conviene verificar la licencia de los textos de Labzank y Naganj si se redistribuye el tokenizador junto con datos derivados.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de las cifras de fertilidad reportadas.
- No hay informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el proceso de limpieza, lo que dificulta evaluar su robustez.
- Al ser byte-level, puede producir secuencias de bytes invalidas en UTF-8 si se le alimentan entradas mal formadas; conviene validar la codificacion de entrada en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/shah-bakhsh/BalLatn-Tokenizer-24K
- Labzank (fuente del corpus): https://labzank.com/
- Naganj (fuente lexica): https://labzank.com/naganj.php
- Documentacion de `AutoTokenizer`: https://huggingface.co/docs/transformers/main_classes/tokenizer
- Documentacion de la libreria `tokenizers`: https://huggingface.co/docs/tokenizers/index
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
