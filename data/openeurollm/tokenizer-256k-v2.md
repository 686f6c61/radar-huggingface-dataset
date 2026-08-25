# openeurollm/tokenizer-256k-v2

## Resumen

OpenEuroLLM Tokenizer v2 es un tokenizer SentencePiece BPE de 262.144 tokens desarrollado por el proyecto OpenEuroLLM, una iniciativa europea para construir modelos fundacionales multilingües transparentes y de código abierto. Se trata de la segunda versión del tokenizer de 256k, un reentrenamiento completo del v1 sobre un corpus más amplio y limpio, con la lista de idiomas derivada del catálogo oficial del proyecto (`training-data-catalogue/languages`) en lugar de una lista fija, lo que corrige el incidente de la falta de georgiano en v1.

El problema que resuelve es la tokenización eficiente de textos en 36 lenguas europeas, incluidas lenguas con escrituras y morfología complejas como el georgiano, el letón o el albanés. En la evaluación multi-dominio de la model card, v2-256k alcanza una fertilidad media de 1,90 tokens por palabra, la mejor de todos los tokenizadores comparados, superando a GPT-OSS 20B (2,07), Gemma 3 4B (2,19) y DeepSeek V3 (2,47). Es el tokenizer de referencia para los futuros modelos insignia de OpenEuroLLM, con licencia Apache 2.0 y formato compatible con la librería Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece BPE (Byte Pair Encoding) |
| Parametros totales | No aplicable (tokenizer, sin red neuronal) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (tokenizer; la ventana depende del modelo que lo use) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | 36: bg, bs, ca, cs, da, de, el, en, es, et, eu, fi, fr, ga, gl, hr, hu, is, it, ka, lt, lv, mk, mt, nl, no, pl, pt, ro, sk, sl, sq, sr, sv, tr, uk |
| Licencia | Apache-2.0 |
| Formato de pesos | Modelo SentencePiece (archivo `.model` compatible con transformers) |

## Arquitectura y entrenamiento

El tokenizer usa SentencePiece con algoritmo BPE, entrenado sobre un corpus grande y limpio que cubre las 36 lenguas del catálogo de OpenEuroLLM. A diferencia de v1, la lista de idiomas se genera automáticamente desde el archivo `training-data-catalogue/languages` del repositorio oficial, evitando la omisión del georgés que afectó a v1. El entrenamiento se ha realizado sobre un corpus mayor y más depurado que el de v1, lo que se refleja en las mejoras de fertilidad en 30 de los 36 idiomas evaluados.

No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del corpus. No se ha aplicado ningún proceso de alineación como RLHF o DPO, ya que es un tokenizer y no un modelo generativo.

## Capacidades

- Tokenización multilingüe eficiente en 36 lenguas europeas, con especial mejora en georgés (de 22,93 a 2,83 tokens por palabra) y letón (de 3,01 a 1,94).
- Optimizado para prosa multilingüe (FLORES-200): 1,79 tokens por palabra, el mejor del estudio.
- Eficiente en textos de chat con formato ChatML (1,44 tokens por palabra).
- Rendimiento competitivo en matemáticas (LaTeX y GSM8K) y documentos PDF.
- Menor eficiencia en código Python (3,24 tokens por palabra), donde tokenizadores basados en tiktoken como Llama 3.1 obtienen mejores resultados (2,60).
- Compatible con la librería `transformers` de Hugging Face y con el ecosistema de endpoints.

## Casos de uso

- Preentrenamiento de modelos de lenguaje multilingües: el tokenizer reduce la fertilidad media en un 22% respecto a v1, lo que permite entrenar con menos tokens y reducir el coste computacional.
- Fine-tuning de modelos para tareas en lenguas europeas de baja densidad de datos: las mejoras en georgiano, letón o albanés hacen que el tokenizer sea adecuado para dominios con poco corpus.
- Chat y asistentes conversacionales: la eficiencia en ChatML (1,44 tokens por palabra) reduce la latencia y el coste de inferencia en aplicaciones de diálogo multilingüe.
- Procesamiento de documentos y PDFs: la evaluación sobre FinePDFs muestra una fertilidad de 2,31 tokens por palabra, adecuado para sistemas de extracción de conocimiento en bibliotecas digitales.
- Modelos de razonamiento matemático: con 1,91 tokens por palabra en LaTeX y GSM8K, puede usarse como tokenizer base para modelos de matemáticas en educación o ingeniería.
- Sistemas de generación aumentada por recuperación (RAG) en lenguas europeas: la baja fertilidad en prosa (1,79 en FLORES-200) reduce los tokens de contexto en pipelines de recuperación y síntesis.

## Benchmarks y rendimiento

La model card incluye una evaluación multi-dominio con 8.600 muestras en cinco dominios: FLORES-200 (7.200 frases paralelas en 36 lenguas), código Python (500 muestras de codeparrot), matemáticas (200 muestras de MATH+GSM8K), chat con formato ChatML (200 muestras de OpenAssistant) y PDFs de FinePDFs (500 muestras en 5 lenguas). La métrica es la media de tokens por palabra separada por espacios (menor es mejor).

| Tokenizer | Vocab | Overall | FLORES-200 (36 langs) | Code (Python) | Math (LaTeX+GSM8K) | Chat (ChatML) | PDFs (5 langs) |
|---|---|---:|---:|---:|---:|---:|---:|
| **OpenEuroLLM v2 256k (este modelo)** | 262.144 | **1,90** | **1,79** | 3,24 | 1,91 | **1,44** | 2,31 |
| GPT-OSS 20B | 200.000 | 2,07 | 2,07 | 2,62 | 1,64 | 1,54 | 2,01 |
| OpenEuroLLM v2 128k | 131.072 | 2,09 | 2,00 | 3,32 | 1,92 | 1,52 | 2,43 |
| Gemma 3 4B | 256.000 | 2,19 | 2,13 | 3,20 | 1,92 | 1,59 | 2,27 |
| Mistral Nemo | 131.072 | 2,23 | 2,20 | 2,84 | 1,92 | 1,62 | 2,26 |
| EuroLLM 9B | 128.000 | 2,30 | 2,21 | 3,79 | 2,02 | 1,57 | 2,48 |
| OpenEuroLLM v1 256k | 262.144 | 2,45 | 2,43 | 3,33 | 1,95 | 1,68 | 2,29 |
| DeepSeek V3 | 128.000 | 2,47 | 2,51 | 2,83 | 1,65 | 1,65 | 2,13 |
| OpenEuroLLM v1 128k | 131.072 | 2,62 | 2,62 | 3,42 | 1,98 | 1,76 | 2,40 |
| Llama 3.1 8B | 128.256 | 2,68 | 2,78 | **2,60** | **1,65** | 1,65 | 2,18 |
| Qwen 3 8B | 151.936 | 2,70 | 2,78 | 2,64 | 1,90 | 1,51 | 2,35 |

Los valores en negrita indican el mejor resultado por columna. El tokenizer v2-256k es el primero en la media global, en FLORES-200 y en chat, pero pierde en código Python y matemáticas frente a Llama 3.1 y GPT-OSS.

La model card también incluye una comparativa por idioma en FLORES-200 entre v1 y v2. El v2-256k mejora en 30 de los 36 idiomas, con las mayores ganancias en georgiano (−20,10 puntos de fertilidad), letón (−1,07) y albanés (−0,67). Empeora ligeramente en checo (+0,24), alemán (+0,19), italiano (+0,17), polaco (+0,17), búlgaro (+0,09), macedonio (+0,08) y eslovaco (+0,05).

## Requisitos de hardware

- El tokenizer es un modelo SentencePiece de tamaño reducido (menos de 100 MB en memoria), por lo que no requiere GPU ni aceleración especial.
- Puede ejecutarse en CPU para tokenización en producción, con latencia de microsegundos por documento.
- Para el entrenamiento o fine-tuning de modelos que lo usen como base, se necesitan las GPUs habituales según el tamaño del modelo (por ejemplo, A100 o H100 para modelos de 7B-13B).
- Es compatible con el ecosistema `transformers`, por lo que se puede integrar con vLLM, TGI o llama.cpp a través de la API de tokenizers.

## Comparativa con modelos similares

| Tokenizer | Vocab | Overall | FLORES-200 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| **OpenEuroLLM v2 256k** | 262.144 | **1,90** | **1,79** | Apache-2.0 | Hugging Face |
| GPT-OSS 20B | 200.000 | 2,07 | 2,07 | Apache-2.0 | Hugging Face |
| Gemma 3 4B | 256.000 | 2,19 | 2,13 | Gemma license | Hugging Face |
| Llama 3.1 8B | 128.256 | 2,68 | 2,78 | Llama license | Hugging Face |

El v2-256k supera a todos los comparados en eficiencia global y en prosa multilingüe, pero es inferior en código Python y matemáticas frente a tokenizadores como el de Llama 3.1 (basado en tiktoken) y GPT-OSS. Su licencia Apache-2.0 es más permisiva que la de Gemma y Llama, que tienen restricciones de uso comercial.

## Limitaciones y advertencias

- Es un tokenizer, no un modelo de lenguaje completo: no genera texto ni tiene capacidades de razonamiento; su uso requiere un modelo que lo utilice como capa de entrada/salida.
- Menor eficiencia en código Python (3,24 tokens por palabra) que tokenizadores específicos como Llama 3.1 (2,60), lo que puede ser un inconveniente para aplicaciones de generación de código.
- Regresiones en algunos idiomas respecto a v1: checo, alemán, italiano, polaco, búlgaro, macedonio y eslovaco empeoran ligeramente en fertilidad, aunque la media global mejora.
- El rendimiento en matemáticas (1,91) es competitivo pero no el mejor (Llama 3.1 consigue 1,65), lo que puede afectar a modelos de razonamiento matemático.
- No se han publicado detalles sobre el corpus de entrenamiento (volumen, composición exacta), lo que limita la reproducibilidad del tokenizer.
- Licencia Apache-2.0, sin restricciones de uso comercial, pero el proyecto OpenEuroLLM está en fase de desarrollo y el tokenizer puede cambiar en versiones futuras.

## Enlaces

- Modelo en Hugging Face: [openeurollm/tokenizer-256k-v2](https://huggingface.co/openeurollm/tokenizer-256k-v2)
- Modelo v1 en Hugging Face: [openeurollm/tokenizer-256k](https://huggingface.co/openeurollm/tokenizer-256k)
- Organización OpenEuroLLM en GitHub: [https://github.com/OpenEuroLLM](https://github.com/OpenEuroLLM)
- Sitio web oficial del proyecto: [https://www.openeurollm.eu/](https://www.openeurollm.eu/)
- Catálogo de idiomas: [training-data-catalogue/languages](https://github.com/openEuroLLM/training-data-catalogue/blob/main/languages)</think>## Resumen

OpenEuroLLM Tokenizer v2 es un tokenizer SentencePiece BPE de 262.144 tokens desarrollado por el proyecto OpenEuroLLM, una iniciativa europea para construir modelos de lenguaje multilingües transparentes y de código abierto. Se trata de la segunda versión del tokenizer de 256k, un reentrenamiento completo sobre un corpus más amplio y limpio, con la lista de idiomas derivada del catálogo oficial del proyecto (`training-data-catalogue/languages`) en lugar de una lista fija, lo que corrige el incidente de v1 que omitía el georgiano.

El problema que resuelve es la tokenización eficiente de textos en 36 lenguas europeas, incluyendo lenguas con morfología compleja como el georgiano, el letón o el albanés. En la evaluación multi-dominio de la model card, v2-256k alcanza una fertilidad media de 1,90 tokens por palabra, la mejor de todos los tokenizadores comparados, superando a GPT-OSS 20B (2,07), Gemma 3 4B (2,19) y DeepSeek V3 (2,47). Es el tokenizer de referencia para los modelos insignia de OpenEuroLLM, con licencia Apache-2.0 y compatible con el ecosistema Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece BPE |
| Parametros totales | No aplicable (tokenizer, no modelo de lenguaje) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (depende del modelo que lo utilice) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | bg, bs, ca, cs, da, de, el, en, es, et, eu, fi, fr, ga, gl, hr, hu, is, it, ka, lt, lv, mk, mt, nl, no, pl, pt, ro, sk, sl, sq, sr, sv, tr, uk |
| Licencia | Apache-2.0 |
| Formato de pesos | Modelo SentencePiece (`.model`), compatible con transformers |

## Arquitectura y entrenamiento

El tokenizer es un SentencePiece BPE de 262.144 tokens, entrenado sobre un corpus multilingüe más grande y limpio que el de v1. La lista de idiomas se genera dinámicamente desde el catálogo `training-data-catalogue/languages` del proyecto, evitando la lista fija que en v1 provocó la ausencia del georgiano. La evaluación en FLORES-200 muestra que v2-256k mejora la fertilidad en 30 de los 36 idiomas respecto a v1, con una mejora media de −0,64 tokens por palabra. No se dispone de información sobre el volumen exacto de tokens de entrenamiento ni sobre técnicas de alineación (RLHF, DPO), ya que se trata de un tokenizer y no de un modelo generativo.

## Capacidades

- Tokenización multilingüe eficiente en 36 lenguas europeas, con una fertilidad media de 1,79 tokens por palabra en FLORES-200, la mejor de los tokenizadores comparados.
- Rendimiento destacado en chat: 1,44 tokens por palabra con formato ChatML, superando a GPT-OSS (1,54) y Gemma 3 (1,59).
- Competitivo en matemáticas (1,91 tokens por palabra en LaTeX+GSM8K) y en PDFs (2,31 tokens por palabra en FinePDFs).
- Menor eficiencia en código Python (3,24 tokens por palabra) frente a tokenizadores como Llama 3.1 (2,60).
- Compatible con Hugging Face Transformers y con el ecosistema de endpoints (`endpoints_compatible`).
- Mejora significativa en georgiano: de 22,93 a 2,83 tokens por palabra, gracias a la inclusión de subpalabras reales en el vocabulario.

## Casos de uso

- Entrenamiento de modelos fundacionales multilingües: el tokenizer reduce la fertilidad media en un 22% respecto a v1, lo que reduce el coste de entrenamiento y mejora la eficiencia del contexto en modelos de 36 lenguas europeas.
- Chatbots y asistentes conversacionales: su eficiencia con formato ChatML (1,44 tokens por palabra) lo hace adecuado para sistemas de diálogo multilingüe con contexto largo, reduciendo la latencia y el coste de tokens por conversación.
- Traducción automática entre lenguas europeas: el rendimiento en FLORES-200 (1,79 tokens por palabra) permite procesar frases paralelas con menos tokens, lo que acelera el entrenamiento y la inferencia en sistemas de traducción.
- Generación de código en entornos multilingües: aunque no es su punto fuerte, el tokenizer es utilizable en pipelines de generación de código en Python cuando se necesita cubrir también idiomas europeos, aunque se recomienda evaluar alternativas más eficientes en código.
- Procesamiento de documentos y PDFs: su rendimiento en FinePDF (2,31 tokens por palabra) lo hace adecuado para sistemas de extracción de información y RAG sobre documentos en varios idiomas.
- Fine-tuning de modelos en lenguas con pocos recursos: la mejora en idiomas como el albanés (−0,67), el letón (−1,07) o el georgés (−20,10) facilita el fine-tuning de modelos pequeños en lenguas donde el tokenizer v1 era ineficiente.

## Benchmarks y rendimiento

La model card incluye una evaluación de tokenización multi-dominio sobre 8.600 muestras en cinco dominios: FLORES-200 (36 lenguas paralelas), código Python, matemáticas (LaTeX+GSM8K), chat (ChatML) y PDFs (5 lenguas). La métrica es la media de tokens por palabra separada por espacios (menor es mejor).

| Tokenizer | Vocab | Overall | FLORES-200 (36 langs) | Code (Python) | Math (LaTeX+GSM8K) | Chat (ChatML) | PDFs (5 langs) |
|---|---|---:|---:|---:|---:|---:|---:|
| **OpenEuroLLM v2 256k (este modelo)** | 262.144 | **1.90** | **1.79** | 3.24 | 1.91 | **1.44** | 2.31 |
| GPT-OSS 20B | 200.000 | 2.07 | 2.07 | 2.62 | 1.64 | 1.54 | 2.01 |
| OpenEuroLLM v2 128k | 131.072 | 2.09 | 2.00 | 3.32 | 1.92 | 1.52 | 2.43 |
| Gemma 3 4B | 256.000 | 2.19 | 2.13 | 3.20 | 1.92 | 1.59 | 2.27 |
| Mistral Nemo | 131.072 | 2.23 | 2.20 | 2.84 | 1.92 | 1.62 | 2.26 |
| EuroLLM 9B | 128.000 | 2.30 | 2.21 | 3.79 | 2.02 | 1.57 | 2.48 |
| OpenEuroLLM v1 256k | 262.144 | 2.45 | 2.43 | 3.33 | 1.95 | 1.68 | 2.29 |
| DeepSeek V3 | 128.000 | 2.47 | 2.51 | 2.83 | 1.65 | 1.65 | 2.13 |
| OpenEuroLLM v1 128k | 131.072 | 2.62 | 2.62 | 3.42 | 1.98 | 1.76 | 2.40 |
| Llama 3.1 8B | 128.256 | 2.68 | 2.78 | **2.60** | **1.65** | 1.65 | 2.18 |
| Qwen 3 8B | 151.936 | 2.70 | 2.78 | 2.64 | 1.90 | 1.51 | 2.35 |

El modelo es el primero en la media global, en FLORES-200 y en chat, pero pierde en código Python y matemáticas frente a Llama 3.1 y GPT-OSS. La comparativa por idioma en FLORES-200 muestra una mejora en 30 de los 36 idiomas respecto a v1, con regresiones en checo (+0,24), alemán (+0,19), italiano (+0,17), polaco (+0,17), búlgaro (+0,09), macedonio (+0,08) y eslovaco (+0,05).

## Requisitos de hardware

- No aplica: al ser un tokenizer, no requiere GPU ni VRAM para su uso; solo necesita CPU para la tokenización y des-tokenización.
- El archivo del modelo SentencePiece es ligero (menos de 100 MB) y se carga en memoria en milisegundos.
- Para su uso en producción, se puede integrar con pipelines de Hugging Face Transformers, vLLM, llama.cpp u Ollama sin requisitos especiales de hardware.
- La latencia de tokenización es del orden de microsegundos por documento, dependiendo del tamaño del texto.

## Comparativa con modelos similares

| Tokenizer | Vocab | Overall | FLORES-200 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| **OpenEuroLLM v2 256k** | 262.144 | **1.90** | **1.79** | Apache-2.0 | Hugging Face |
| GPT-OSS 20B | 200.000 | 2.07 | 2.07 | Apache-2.0 | Hugging Face |
| Gemma 3 4B | 256.000 | 2.19 | 2.13 | Gemma license | Hugging Face |
| Llama 3.1 8B | 128.256 | 2.68 | 2.78 | Llama license | Hugging Face |

OpenEuroLLM v2 256k supera a todos los comparados en eficiencia global y en prosa multilingüe, pero es menos eficiente en código y matemáticas que los tokenizadores de Llama 3.1 y GPT-OSS. Su licencia Apache-2.0 es más permisiva que las de Gemma y Llama, que tienen restricciones de uso comercial.

## Limitaciones y advertencias

- Es un tokenizer, no un modelo de lenguaje: no genera texto, no tiene capacidad de razonamiento ni de tool calling. Solo es útil como capa de tokenización para modelos que lo usen.
- Menor eficiencia en código Python (3,24 tokens por palabra) que Llama 3.1 (2,60) o GPT-OSS (2,62), lo que puede penalizar aplicaciones de generación de código.
- Regresiones en algunos idiomas respecto a v1: alemán, italiano, polaco, checo, búlgaro, macedonio y eslovaco empeoran ligeramente en fertilidad.
- El rendimiento en matemáticas (1,91 tokens por palabra) es competitivo pero no líder; Llama 3.1 y DeepSeek V3 obtienen mejores resultados.
- No se han publicado datos sobre el corpus de entrenamiento (volumen total, composición exacta), lo que limita la reproducibilidad del tokenizer.
- No hay garantía de soporte a largo plazo ni de disponibilidad de los modelos que lo usarán; el proyecto OpenEuroLLM está en desarrollo activo.
- El modelo no incluye pesos de red neuronal, por lo que no puede usarse directamente para inferencia; requiere un modelo base que lo incorpore.

## Enlaces

- [Hugging Face: openeurollm/tokenizer-256k-v2](https://huggingface.co/openeurollm/tokenizer-256k-v2)
- [Hugging Face: openeurollm/tokenizer-256k (v1)](https://huggingface.co/openeurollm/tokenizer-256k)
- [GitHub: OpenEuroLLM](https://github.com/OpenEuroLLM)
- [Sitio web del proyecto: OpenEuroLLM](https://www.openeurollm.eu/)
- [Catálogo de idiomas del proyecto](https://github.com/openEuroLLM/training-data-catalogue/blob/main/languages)
