# openeurollm/tokenizer-128k-v2

## Resumen

OpenEuroLLM Tokenizer v2 (128k) es un tokenizador SentencePiece BPE de vocabulario 131.072 (2^17) desarrollado por el proyecto OpenEuroLLM, una iniciativa europea para construir modelos fundacionales transparentes y soberanos. Este tokenizador es la variante compacta del tokenizer-256k-v2, entrenado sobre el mismo corpus de 500 GB pero con un vocabulario reducido, pensado para despliegues con restricciones de cómputo.

Su relevancia radica en que es un tokenizador multilingüe diseñado específicamente para cubrir las 36 lenguas del catálogo europeo, incluyendo georgiano (ka) y excluyendo luxemburgués, ruso y galés. En la evaluación multi-dominio de fertilidad (tokens por palabra), alcanza una media global de 2,09, superando a alternativas como Mistral Nemo (2,23), EuroLLM 9B (2,30) y DeepSeek V3 (2,47). Mejora en 29 de los 36 idiomas frente a su predecesor v1, con ganancias destacadas en georgiano (−19,63), letón (−0,98) y albanés (−0,68).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece BPE |
| Parametros totales | No aplica (tokenizador, no modelo de lenguaje) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | 36: bg, bs, ca, cs, da, de, el, en, es, et, eu, fi, fr, ga, gl, hr, hu, is, it, ka, lt, lv, mk, mt, nl, no, pl, pt, ro, sk, sl, sq, sr, sv, tr, uk |
| Licencia | Apache 2.0 |
| Formato de pesos | SentencePiece model (spm), compatible con transformers |

## Arquitectura y entrenamiento

El tokenizador usa el algoritmo SentencePiece BPE con normalización de identidad (lossless) y byte fallback habilitado. El vocabulario es de 131.072 tokens (2^17). Se entrenó sobre un corpus de 500 GB procedente del catálogo de datos de OpenEuroLLM, un mix multilingüe dirigido por las 36 lenguas del catálogo europeo. Es la misma base de entrenamiento que la variante 256k-v2, pero con un vocabulario a la mitad.

Incluye un conjunto de 204 símbolos definidos por el usuario que cubren familias específicas: 45 tokens de espacios en blanco (indentaciones de 2 a 32 espacios, 1 a 8 tabuladores, múltiples saltos de línea), 16 marcadores de código de StarCoder (`<filename>`, `<reponame>`, `<file_sep>`, `<jupyter_*>`, `<commit_*>`), 4 tokens FIM para completado de código, 2 tokens de ChatML (`<|im_start|>`, `<|im_end|>`), 2 de chat Gemma (`<start_of_turn>`, `<end_of_turn>`), 2 de tool use (`<tool_call>`, `</tool_call>`), 2 de razonamiento (` thinking`, ` response`) y 3 de multimodal (`<start_of_image>`, `<end_of_image>`, `<image_soft_token>`), además de 128 tokens reservados sin uso.

Corrige un error de la versión v1: el token `<pad>` estaba fuera de vocabulario (en vocab_size+0 = 131072), y en v2 está fijado en el ID 3. Los tokens núcleo están bloqueados en IDs fijos: `<unk>`=0, `<bos>`=1, `<eos>`=2, `<pad>`=3.

## Capacidades

- Tokenización multilingüe de alta eficiencia en 36 lenguas europeas, con fertilidad media de 2,09 tokens por palabra.
- Soporte de tokens de razonamiento estilo DeepSeek-R1 / Qwen3 (` thinking`, ` response`) para modelos con modo de pensamiento.
- Tokens de tool use (`<tool_call>`, `</tool_call>`) para integración con agentes y function calling.
- Tokens de chat ChatML y Gemma, compatibles con formatos de conversación estándar.
- Tokens FIM (fill-in-the-middle) para code completion y marcadores StarCoder para contextos de repositorio.
- Familia de tokens de espacios que reduce drásticamente el coste de tokenización de código indentado: un indentado de 8 espacios se codifica en 1 token frente a 4-8 en otros tokenizadores.
- Tokens multimodales reservados (`<start_of_image>`, `<end_of_image>`, `<image_soft_token>`) para futuras extensiones de visión.
- Byte fallback habilitado, lo que garantiza cobertura de cualquier secuencia de bytes sin tokens desconocidos.

## Casos de uso

- Entrenamiento de modelos multilingües europeos: como tokenizador base para modelos fundacionales que deban cubrir las 36 lenguas del catálogo, ofreciendo baja fertilidad en prosa y chat.
- Despliegues con restricciones de cómputo: la variante 128k reduce el tamaño del vocabulario frente a la 256k con solo un 9 % de fertilidad adicional, ideal para entrenar modelos pequeños o medianos.
- Preprocesado de datos multilingües: para pipelines de limpieza y preparación de corpus en los 36 idiomas, con normalización lossless que no altera el texto original.
- Tokenización de código en entornos de desarrollo: los tokens de espacios y FIM permiten tokenizar eficientemente ficheros Python y otros lenguajes indentados, reduciendo el número de tokens en código.
- Sistemas de chat y agentes: los tokens ChatML, Gemma, tool use y de razonamiento permiten construir pipelines de conversación y agentes con function calling sin necesidad de postprocesado adicional.
- Aplicaciones de visión-lenguaje: los tokens multimodales reservados permiten integrar el tokenizador en arquitecturas que combinen texto e imágenes.

## Benchmarks y rendimiento

Se han publicado resultados de fertilidad (tokens por palabra, menor es mejor) sobre un conjunto de evaluación de 5 dominios con 8.600 muestras:

| Tokenizador | Vocab | Overall | FLORES-200 (36 langs) | Code (Python) | Math (LaTeX+GSM8K) | Chat (ChatML) | PDFs (5 langs) |
|---|---:|---:|---:|---:|---:|---:|---:|
| OpenEuroLLM v2 128k (este modelo) | 131.072 | 2,09 | 2,00 | 3,32 | 1,92 | 1,52 | 2,43 |
| Mistral Nemo | 131.072 | 2,23 | 2,20 | 2,84 | 1,92 | 1,62 | 2,26 |
| EuroLLM 9B | 128.000 | 2,30 | 2,21 | 3,79 | 2,02 | 1,57 | 2,48 |
| DeepSeek V3 | 128.000 | 2,47 | 2,51 | 2,83 | 1,65 | 1,65 | 2,13 |
| OpenEuroLLM v1 128k | 131.072 | 2,62 | 2,62 | 3,42 | 1,98 | 1,76 | 2,40 |
| Llama 3.2 1B | 128.256 | 2,68 | 2,78 | 2,60 | 1,65 | 1,65 | 2,18 |

El modelo es el mejor en overall (2,09), en FLORES-200 (2,00) y en chat (1,52). Pierde en código Python (3,32) frente a Llama 3.2 (2,60), cuyo tokenizador tiktoken es más agresivo en código, y en matemáticas (1,92) frente a DeepSeek V3 (1,65) y Llama 3.2 (1,65).

Comparación v2 vs v1 en FLORES-200 (fertilidad por idioma, menor es mejor):

| Idioma | v1 128k | v2 128k | Delta |
|---|---:|---:|---:|
| Georgiano (ka) | 22,93 | 3,30 | −19,63 |
| Leton (lv) | 3,18 | 2,20 | −0,98 |
| Albanes (sq) | 2,44 | 1,76 | −0,68 |
| Turco (tr) | 2,40 | 2,16 | −0,24 |
| Griego (el) | 2,63 | 2,44 | −0,20 |
| Checo (cs) | 1,72 | 2,04 | +0,31 |
| Aleman (de) | 1,61 | 1,86 | +0,25 |
| Italiano (it) | 1,45 | 1,66 | +0,21 |
| Polaco (pl) | 1,95 | 2,16 | +0,21 |
| Bulgaro (bg) | 1,95 | 2,13 | +0,18 |

Mejora en 29 de 36 idiomas. Las regresiones (bg, cs, de, it, mk, pl, sk, uk) son pequeñas, de +0,02 a +0,31.

## Requisitos de hardware

- No requiere GPU: un tokenizador SentencePiece se ejecuta en CPU con recursos mínimos.
- Memoria RAM: el modelo ocupa aproximadamente 131.072 entradas de vocabulario más los símbolos especiales; en la práctica, el fichero spm ocupa menos de 100 MB.
- Se integra con la librería transformers de HuggingFace, por lo que se puede cargar con `AutoTokenizer` en cualquier entorno Python.
- No aplica inferencia ni latencia de modelo; la tokenización de un texto de 1.000 palabras tarda en el orden de milisegundos.
- Compatible con pipelines de entrenamiento de modelos (por ejemplo, con datasets y transformers) y con despliegue en entornos de producción para preprocesado.

## Comparativa con modelos similares

| Tokenizador | Vocab | Overall (fertilidad) | FLORES-200 | Code | Chat | Licencia |
|---|---:|---:|---:|---:|---:|---|
| OpenEuroLLM v2 128k (este) | 131.072 | 2,09 | 2,00 | 3,32 | 1,52 | Apache 2.0 |
| Mistral Nemo | 131.072 | 2,23 | 2,20 | 2,84 | 1,62 | Apache 2.0 |
| EuroLLM 9B | 128.000 | 2,30 | 2,21 | 3,79 | 1,57 | Apache 2.0 |
| DeepSeek V3 | 128.000 | 2,47 | 2,51 | 2,83 | 1,65 | MIT |
| Llama 3.2 1B | 128.256 | 2,68 | 2,78 | 2,60 | 1,65 | Llama 3.2 Community License |

El modelo v2 128k es el mejor en promedio, en multilingüe (FLORES) y en chat. Pierde en código frente a Llama 3.2 y en matemáticas frente a DeepSeek V3 y Llama 3.2.

## Limitaciones y advertencias

- No es un modelo de lenguaje: es únicamente un tokenizador. No genera texto ni razona; su función es convertir texto en secuencias de tokens.
- Rendimiento inferior en código Python (3,32) frente a tokenizadores basados en tiktoken como Llama 3.2 (2,60), por ser menos agresivo en la tokenización de código.
- Regresiones ligeras en 8 idiomas (bg, cs, de, it, mk, pl, sk, uk) respecto a v1, con incrementos de fertilidad de +0,02 a +0,31.
- No cubre luxemburgués (lb), ruso (ru) ni galés (cy), que fueron excluidos del ámbito de entrenamiento de v2.
- La mejora en georgiano es notable (−19,63), pero el valor absoluto (3,30) sigue siendo alto comparado con otros idiomas, lo que indica que el georgiano sigue siendo costoso de tokenizar.
- Licencia Apache 2.0, permite uso comercial y modificación sin restricciones de atribución.
- En producción, es necesario verificar la compatibilidad con el modelo concreto (mismo vocabulario y tokens especiales) antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/tokenizer-128k-v2
- Variante 256k (corpus completo): https://huggingface.co/openeurollm/tokenizer-256k-v2
- Tokenizador v1 128k: https://huggingface.co/openeurollm/tokenizer-128k
- Sitio web de OpenEuroLLM: https://www.openeurollm.eu/
- GitHub del proyecto: https://github.com/OpenEuroLLM
- Guía de reproducción de OpenEuroLLM GLM-5: https://github.com/BirgerMoell/openeurollm-glm5-reproduction-guide
