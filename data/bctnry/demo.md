# bctnry/demo

## Resumen

TriusLD (Trius's Little Dictionary) es un tokenizador byte-level BPE desarrollado por TriusAI, no un modelo de lenguaje completo. Su objetivo es cubrir 19 sistemas de escritura y 58 idiomas con un vocabulario deliberadamente compacto de 64.972 tokens, priorizando la amplitud multilingüe frente a la optimización exclusiva del inglés. Se distribuye como repositorio de tokenizer bajo la librería `transformers` y la licencia Apache 2.0.

El problema que aborda es el sesgo anglófono de los vocabularios de los LLM actuales: tokenizadores como cl100k o Llama 3 gastan la mayor parte de su vocabulario en inglés y dejan las escrituras no latinas con una compresión pobre, lo que encarece la inferencia y degrada el rendimiento en esos idiomas. TriusLD mide su eficacia en tokens por carácter (tpc) sobre texto reservado de FineWeb-2 y reporta 0,524 de media en 58 idiomas, frente a 0,842 de cl100k, 0,699 de Llama 3 o 0,675 de Qwen3, con un vocabulario de un tercio a la mitad del tamaño de esos tokenizadores.

Es relevante ahora porque el coste de un LLM en producción depende directamente de cuántos tokens consume cada texto: un tokenizador multilingüe eficiente reduce la longitud de secuencia, el coste de atención y la latencia en idiomas distintos del inglés sin necesidad de ampliar el vocabulario. El repositorio contiene únicamente estadísticas de tokenización (vocabulario y pares de merges), no pesos de modelo ni texto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE con normalización NFC |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (tokenizador) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | 58 idiomas en 19 sistemas de escritura (latino, cirílico, griego, hebreo, árabe, tailandés, devanagari, bengalí, tamil, telugu, malayalam, gujarati, kannada, odia, gurmukhi, cingalés, han, kana, hangul) |
| Licencia | Apache 2.0 (con concesión expresa de patentes) |
| Formato de pesos | `tokenizer.json` y ficheros de tokenizer compatibles con `transformers` |

Datos adicionales del vocabulario: 64.972 tokens en total, compuestos por 256 bytes, 14 tokens especiales y 64.702 merges. Los tokens especiales son `<|pad|>`, `<|bos|>`, `<|eos|>`, `<|unk|>`, `<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`, `<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`, `<|tool_call|>`, `<|tool_result|>` e `<|image|>`.

## Arquitectura y entrenamiento

El tokenizador es un BPE a nivel de byte con normalización NFC aplicada de forma automática. La elección de NFC (y no NFKC) es deliberada: NFKC plegaría puntuación de ancho completo y ligaduras, destruyendo información. El alfabeto de 256 bytes garantiza codificación y decodificación sin pérdida de cualquier entrada UTF-8, incluidas escrituras no contempladas en el entrenamiento. No inserta BOS/EOS de forma automática y usa `add_prefix_space=False`, coherente con el entrenamiento; el decodificado es exacto y no se limpian espacios.

La construcción se hizo entrenando BPE por escritura con cuotas explícitas y componiendo después mediante una unión que respeta dependencias; una pasada de cobertura fuerza a que los caracteres más frecuentes de cada escritura sean tokens únicos. Los datos de entrenamiento son FineWeb (inglés) y FineWeb-2 (resto de idiomas), ambos bajo ODC-By 1.0. No se redistribuye texto de entrenamiento: el repositorio contiene solo vocabulario y lista de pares de merges. El autor documenta en un artículo adjunto dos errores de ordenación de merges y sus síntomas.

## Capacidades

- Tokenización sin pérdida de cualquier texto UTF-8 gracias al alfabeto de 256 bytes.
- Cobertura nativa de 19 sistemas de escritura y 58 idiomas, con chino simplificado y tradicional como inventarios distintos.
- Normalización NFC integrada: formas compuestas y descompuestas producen los mismos ids.
- Tokens especiales para conversación por roles (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`).
- Soporte de fill-in-the-middle mediante `<|fim_prefix|>`, `<|fim_middle|>` y `<|fim_suffix|>`.
- Marcadores para tool calling (`<|tool_call|>`, `<|tool_result|>`) y para imagen (`<|image|>`).
- Compatibilidad con la API `AutoTokenizer` de `transformers` y con la librería `tokenizers` de forma independiente.
- Compresión medida en tokens por carácter: latino 0,299; cirílico 0,494; árabe 0,519; griego y hebreo 0,540; tailandés 0,595; CJK 0,730; índico 0,732.

## Casos de uso

- Entrenamiento de LLM multilingües con presupuesto de vocabulario limitado: al cubrir 58 idiomas con 64.972 tokens, permite reservar el resto del presupuesto del modelo a parámetros no de embedding, reduciendo el tamaño de la matriz de embeddings frente a vocabularios de 200k.
- Reducción de coste de inferencia en idiomas no ingleses: en español el tpc es 0,277 y en alemán 0,293, lo que acorta las secuencias y el coste de atención en aplicaciones desplegadas en esos idiomas.
- Preprocesado de corpus multilingües para investigación: la cobertura de 19 escrituras permite tokenizar datos de FineWeb-2 en cirílico, árabe, índico o CJK con un único vocabulario sin recurrir a fallback a bytes.
- Sistemas de recuperación y búsqueda multilingüe: la tokenización determinista con NFC y sin limpieza de espacios facilita índices invertidos consistentes entre formas compuestas y descompuestas.
- Pipelines de código con FIM: los tokens `<|fim_*|>` permiten tareas de infilling en editores, aunque el autor advierte que el código se sirve con el inventario latino y está "adecuado, no ajustado".
- Integración en asistentes con tool calling: los tokens `<|tool_call|>` y `<|tool_result|>` permiten estructurar llamadas a herramientas en el formato de chat del tokenizador.
- Tokenización de textos en escrituras minoritarias dentro de Rusia y Asia Central (kazajo, kirguís, mongol, tártaro, baskír, checheno, avar, osetio, yakuto, tayiko): incluidas en la lista de idiomas, aunque sin cifras de compresión específicas publicadas.

## Benchmarks y rendimiento

El autor publica cifras de compresión en tokens por carácter (menor es mejor) sobre el split `test` de FineWeb-2, con 100.000 caracteres por idioma:

| Idioma | tpc |
|---|---:|
| Inglés | 0,260 |
| Vietnamita | 0,276 |
| Español | 0,277 |
| Alemán | 0,293 |
| Ruso | 0,461 |
| Árabe | 0,522 |
| Hebreo | 0,556 |
| Hindi | 0,657 |
| Japonés | 0,678 |
| Chino simplificado | 0,708 |
| Bengalí | 0,722 |
| Coreano | 0,733 |
| Tamil | 0,754 |
| Chino tradicional | 0,802 |

Comparativa de tpc medio sobre 58 idiomas en el mismo texto:

| Tokenizador | tpc medio |
|---|---:|
| cl100k | 0,842 |
| Llama 3 | 0,699 |
| Qwen3 | 0,675 |
| TriusLD | 0,524 |
| o200k | 0,394 |
| Gemma 3 | 0,392 |

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K) en la información disponible, dado que se trata de un tokenizador y no de un modelo de lenguaje.

## Requisitos de hardware

- No requiere GPU: es un tokenizador y se ejecuta en CPU.
- Huella en disco y memoria del vocabulario: 64.972 tokens y 64.702 merges, un fichero `tokenizer.json` de tamaño reducido (órdenes de magnitud por debajo de los vocabularios de 200k).
- Despliegue mediante `transformers` (`AutoTokenizer.from_pretrained`) o la librería `tokenizers` (`Tokenizer.from_file("tokenizer.json")`).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del backend de tokenización y del idioma.
- Integración con servidores de inferencia (vLLM, TGI, llama.cpp): no verificada en la información disponible; requeriría convertir el vocabulario al formato esperado por cada runtime.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | tpc medio (58 idiomas) | Licencia | Notas |
|---|---:|---:|---|---|
| TriusLD | 64.972 | 0,524 | Apache 2.0 | 19 escrituras, 58 idiomas, FIM y tool calling |
| cl100k | no disponible | 0,842 | no disponible | Referencia de OpenAI citada por el autor |
| Llama 3 | no disponible | 0,699 | no disponible | Referencia citada por el autor |
| Qwen3 | no disponible | 0,675 | no disponible | Referencia citada por el autor |
| o200k | no disponible | 0,394 | no disponible | Referencia citada por el autor |
| Gemma 3 | no disponible | 0,392 | no disponible | Referencia citada por el autor |

Los tamaños de vocabulario de los tokenizadores comparados no se detallan en la información disponible; el autor solo indica que TriusLD usa "un tercio a la mitad" de su vocabulario.

## Limitaciones y advertencias

- El coreano usa solo las 2.350 sílabas hangul más frecuentes más jamo, no el bloque completo de 11.172 sílabas; las sílabas raras cuestan dos o tres tokens.
- La cobertura índica es real pero fina: diez escrituras comparten 2.660 merges, y se espera aproximadamente el doble de tokens que un vocabulario de 200k en hindi, bengalí o tamil.
- Las escrituras no soportadas caen a bytes a razón de dos a cuatro tokens por carácter.
- El código se sirve con el inventario latino: adecuado, no ajustado.
- No inserta BOS/EOS automáticamente; el integrador debe añadirlos de forma explícita.
- El decodificado es exacto y no limpia espacios (`clean_up_tokenization_spaces` desactivado), lo que puede sorprender en pipelines que esperan limpieza.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de copyright y licencia, declarar cambios significativos y no usar el nombre TriusAI para avalar derivados.
- El repositorio solo contiene estadísticas de tokenización; no hay pesos de modelo con los que evaluar calidad de generación.
- Las cifras de compresión provienen de una única fuente (FineWeb-2 test, 100.000 caracteres por idioma) y no han sido replicadas de forma independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/bctnry/demo
- Repositorio citado en la model card: https://huggingface.co/TriusAI/TriusLD
- Artículo sobre el proceso de construcción: no disponible (el autor lo menciona pero no incluye URL)
- FineWeb: no disponible
- FineWeb-2: no disponible
