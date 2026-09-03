# cooler8/yejin-korean-tokenizer-200k

## Resumen

El modelo `yejin-korean-tokenizer-200k` es un tokenizador Byte-Level BPE especializado en coreano, desarrollado por el usuario `cooler8` y publicado bajo licencia Apache 2.0. Está diseñado para maximizar la compresión de texto coreano mediante un vocabulario de 200 000 tokens, entrenado desde cero sobre un corpus integrado de 16,2 GB que incluye web limpia (CulturaX), Wikipedia coreana, libros de texto, literatura y conjuntos de instrucciones como KoAlpaca. Su objetivo principal es servir como componente de tokenización para modelos de lenguaje de gran tamaño (8B o más), donde un vocabulario amplio reduce la fragmentación de palabras coreanas y mejora la eficiencia tanto en entrenamiento como en inferencia.

La relevancia actual de este tokenizador radica en que el coreano, al ser una lengua aglutinante con alta morfología, suele requerir más tokens por palabra que el inglés si se usan tokenizadores genéricos. Con 200 000 entradas, supera el vocabulario de Llama 3 (128K) y Qwen 2.5 (152K), lo que permite representar unidades lingüísticas coreanas completas con menos tokens. El modelo está disponible en HuggingFace y es compatible con la biblioteca `transformers`, aunque al ser únicamente un tokenizador no incluye pesos de red neuronal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Level BPE (tokenizador) |
| Parametros totales | No aplica (no es un modelo de lenguaje) |
| Parametros activos | No aplica |
| Longitud de contexto | 8 192 tokens (máxima secuencia de entrenamiento) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (solo configuración y vocabulario) |

## Arquitectura y entrenamiento

El tokenizador utiliza el algoritmo Byte-Level BPE, que opera sobre bytes en lugar de caracteres Unicode, garantizando una cobertura completa de cualquier texto sin tokens desconocidos. El vocabulario de 200 000 entradas se obtuvo mediante un entrenamiento desde cero sobre un corpus coreano integrado de 16,2 GB, con una frecuencia mínima de aparición de 2. El proceso de entrenamiento se realizó en CPU y duró aproximadamente 0,43 horas.

El corpus de entrenamiento está compuesto por varias fuentes: CulturaX coreano (60 GB de web limpia), Wikipedia coreana 2024, seis tipos de libros de texto coreanos (incluyendo conjuntos como `claude_evol`, `tiny`, `instructions`, `wikidata`, `mmlu_all` y `code_alpaca`), instrucciones de KoAlpaca y otros textos coreanos. Esta diversidad busca cubrir dominios generales, académicos y de instrucción. El tokenizador incluye cuatro tokens especiales: `<s>` (BOS), `</s>` (EOS), `<unk>` (UNK) y `<pad>` (PAD).

## Capacidades

- Tokenización eficiente de texto coreano con alta compresión: el vocabulario de 200K reduce el número de tokens por frase en comparación con tokenizadores de menor tamaño o multilingües.
- Soporte para inglés: aunque está especializado en coreano, el entrenamiento incluye datos en inglés, por lo que puede procesar textos mixtos ko-en.
- Compatibilidad total con la biblioteca `transformers` de HuggingFace mediante `AutoTokenizer`.
- Manejo de secuencias largas de hasta 8 192 tokens, adecuado para contextos extendidos en modelos de lenguaje.
- Cobertura byte-level: al operar sobre bytes, no hay tokens desconocidos para ningún carácter Unicode.
- Incluye tokens especiales estándar (BOS, EOS, UNK, PAD) listos para integrarse en pipelines de entrenamiento.

## Casos de uso

- Entrenamiento de modelos de lenguaje coreanos de gran escala (8B o más): el tokenizador está diseñado específicamente para modelos grandes, donde el mayor vocabulario compensa el aumento de parámetros en la capa de embedding con una mejor compresión del texto coreano.
- Preentrenamiento de LLM bilingües ko-en: al soportar ambos idiomas, puede usarse como tokenizador base para modelos que alternan entre coreano e inglés, reduciendo la necesidad de vocabularios separados.
- Ajuste fino de modelos coreanos existentes: si se parte de un modelo preentrenado con este tokenizador, el ajuste fino para tareas específicas (traducción, resumen, QA) se beneficia de la representación compacta del coreano.
- Generación de texto coreano en producción: al reducir la longitud de las secuencias tokenizadas, se acelera la inferencia y se reduce el coste computacional en servicios de chat o redacción asistida.
- Sistemas de agentes conversacionales en coreano: la compresión eficiente permite manejar historiales de conversación más largos dentro de la ventana de contexto de 8K tokens, mejorando la coherencia en diálogos multi-turno.
- Investigación en tokenización morfológica: sirve como referencia para estudiar el impacto del tamaño del vocabulario en la eficiencia de modelos coreanos, comparando con alternativas de 64K o 128K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de compresión, velocidad de tokenización ni comparaciones cuantitativas con otros tokenizadores más allá del tamaño de vocabulario. Tampoco se proporcionan resultados de tareas downstream (MMLU, HumanEval, etc.) porque el modelo no es un LLM sino un tokenizador.

## Requisitos de hardware

- No requiere GPU: al ser un tokenizador, se ejecuta en CPU sin necesidad de aceleración hardware.
- Memoria RAM: el vocabulario de 200 000 entradas ocupa unos pocos cientos de MB en memoria, dependiendo de la implementación.
- Compatible con cualquier sistema con Python y la biblioteca `transformers` instalada.
- Para su uso en entrenamiento de LLM, el tokenizador debe integrarse en el pipeline del modelo, pero el coste computacional de tokenización es despreciable frente al entrenamiento.
- No requiere servicios como vLLM o llama.cpp, ya que no es un modelo de generación.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Idiomas | Licencia | Uso recomendado |
|---|---|---|---|---|
| yejin-korean-tokenizer-200k (este) | 200 000 | ko, en | Apache 2.0 | Modelos ≥ 8B |
| yejin-korean-tokenizer-64k | 64 000 | ko, en | Apache 2.0 | Modelos ≤ 3B |
| Llama 3 tokenizador | 128 000 | multilingüe (incl. ko) | Llama 3 license | Modelos generales |
| Qwen 2.5 tokenizador | 152 000 | multilingüe (incl. ko) | Apache 2.0 | Modelos generales |

La comparación se basa únicamente en características declaradas por el autor; no hay datos de rendimiento medido para este tokenizador frente a los demás.

## Limitaciones y advertencias

- Al ser un tokenizador, no genera texto por sí mismo; requiere un modelo de lenguaje asociado para cualquier tarea práctica.
- El tamaño de vocabulario de 200K aumenta significativamente el número de parámetros en la capa de embedding (aproximadamente 200 000 × dimensión del modelo). Para modelos menores de 8B, el sobrecoste puede no compensar la mejora en compresión, como advierte el propio autor.
- No se han publicado métricas objetivas de compresión (tokens por palabra, tasa de subword) que validen la afirmación de "alta eficiencia".
- El corpus de entrenamiento incluye datos de libros de texto y fuentes web que pueden contener sesgos culturales o de contenido; el tokenizador no introduce sesgos por sí mismo, pero hereda la distribución de frecuencias del corpus.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte o mantenimiento por parte del autor.
- La fecha de creación (2026-09-03) sugiere que es un proyecto reciente; su adopción en producción aún no está probada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-tokenizer-200k
- No se proporcionan otros enlaces (paper, blog, repositorio de código) en la información disponible.
