# DOAIxILPRL-KU/nep-tokenizer

## Resumen

`nep-tokenizer` es un tokenizador SentencePiece con segmentación Byte-Pair Encoding (BPE) desarrollado conjuntamente por el Department of Artificial Intelligence (DOAI) y el Intelligent Language Processing Research Lab (ILPRL) de la Universidad de Kathmandu. No es un modelo generativo, sino un componente de preprocesamiento lingüístico diseñado específicamente para nepalí, escritura devanagari y corpus multilingües que combinan nepalí, hindi e inglés.

El repositorio distribuye tres variantes de vocabulario estandarizadas (64k, 100k y 128k tokens), todas entrenadas sobre crawls multi-fuente balanceados con filtrado estricto de calidad para devanagari y preservación de byte-fallback. La variante de 64k es la predeterminada y se sirve tanto en la raíz del repositorio como en el subdirectorio `64k/`.

Su relevancia radica en que la mayoría de tokenizadores de modelos fundacionales multilingües sobresegmentan el devanagari, lo que infla el coste computacional y degrada la calidad en lenguas del sur de Asia. Este tokenizador aborda ese problema con cohesión de aksharas (matras y viramas unidos a la consonante base) y fallback universal a bytes UTF-8, lo que garantiza codificación sin pérdida de cualquier cadena Unicode.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece BPE (NFKC + byte fallback) |
| Parametros totales | no disponible (es un tokenizador, no un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | nepalí (ne), hindi (hi), inglés (en) |
| Licencia | MIT |
| Formato de pesos | SentencePiece (`tokenizer.model`) |
| Variantes de vocabulario | 64.000 (por defecto), 100.000, 128.000 |
| Tokens especiales | `<unk>`, `<s>`, `</s>`, `<pad>`, `<bos>`, `<eos>` |
| Normalización | Unicode NFKC y colapso de espacios en blanco |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |
| Pipeline declarado | feature-extraction |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El tokenizador emplea SentencePiece con modelo BPE, una técnica de segmentación subpalabra que aprende fusiones iterativas de pares de caracteres sobre el corpus de entrenamiento. A diferencia de los tokenizadores basados en WordPiece o en reglas específicas de un framework, SentencePiece opera directamente sobre texto crudo (con espacios tratados como caracteres), lo que lo hace independiente del idioma y del preprocesamiento previo.

Según la model card, el entrenamiento se realizó sobre «balanced multi-source crawls» con filtrado estricto de calidad para devanagari, aunque no se especifica el número exacto de tokens de entrenamiento, la composición porcentual del corpus ni la proporción entre nepalí, hindi e inglés. La innovación técnica destacable es la **cohesión de aksharas devanagari**: el tokenizador preserva las matras (signos vocálicos dependientes) y los viramas unidos a la consonante base, evitando la fragmentación de prefijos de matra que degrada la calidad en otros tokenizadores. Además, incorpora **byte fallback universal**, que permite codificar cualquier cadena Unicode fuera del vocabulario mediante piezas de byte UTF-8, sin generar tokens `<unk>`. La normalización aplicada es NFKC con colapso de espacios.

No se documenta en la información disponible si hubo entrenamiento con objetivos de RLHF/DPO (no aplica a un tokenizador) ni detalles sobre el algoritmo de muestreo multi-fuente citado en la referencia de Himalaya AI.

## Capacidades

- Segmentación subpalabra BPE para nepalí, hindi e inglés con un único vocabulario compartido.
- Codificación sin pérdida de cualquier cadena Unicode gracias al byte fallback (sin `<unk>` en la práctica).
- Preservación de la integridad ortográfica del devanagari: matras y viramas permanecen unidos a la consonante base.
- Normalización Unicode NFKC y colapso de espacios en blanco integrados en el pipeline.
- Tres escalas de vocabulario intercambiables (64k, 100k, 128k) para adaptar el equilibrio entre cobertura y eficiencia computacional.
- Tokens especiales preasignados (`<unk>`, `<s>`, `</s>`, `<pad>`, `<bos>`, `<eos>`) listos para integrarse en pipelines de entrenamiento de transformers.
- Compatibilidad nativa con la librería `sentencepiece` y descarga vía `huggingface_hub`.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un componente de tokenización.

## Casos de uso

- **Preentrenamiento de modelos fundacionales en nepalí**: usar la variante 128k como tokenizador base para un LLM entrenado desde cero sobre corpus devanagari, aprovechando la mayor paridad multilingüe y la reducción del número de tokens por palabra respecto a tokenizadores genéricos.
- **Adaptación de modelos multilingües existentes**: sustituir el tokenizador de un modelo como Llama o Mistral por la variante 64k y reentrenar los embeddings para mejorar la eficiencia en nepalí e hindi, reduciendo la longitud de secuencia y el coste de inferencia.
- **Sistemas de búsqueda y recuperación (RAG) en nepalí**: emplear el tokenizador para indexar y segmentar documentos en devanagari antes de generar embeddings, garantizando que las matras no se fragmenten y que las representaciones léxicas sean coherentes.
- **Análisis de sentimiento y clasificación de texto en redes sociales**: procesar tuits y comentarios en nepalí con ruido ortográfico y mezcla de inglés, donde el byte fallback evita perder tokens desconocidos y el vocabulario compartido ne-en maneja el code-switching.
- **Pipelines de traducción automática nepalí-inglés**: usar el tokenizador como capa de preprocesamiento compartida entre encoder y decoder, con vocabulario de 100k para cubrir ambas lenguas con cobertura equilibrada.
- **Investigación lingüística computacional sobre devanagari**: analizar la distribución de subpalabras y la cohesión de aksharas en corpus nepalíes, comparando el comportamiento de las tres escalas de vocabulario (64k, 100k, 128k) sobre el mismo texto.
- **Fine-tuning de modelos de clasificación de tokens (NER, POS)**: aprovechar la segmentación estable y determinista para tareas de etiquetado a nivel de token en nepalí, donde la integridad de las matras es crítica para la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM**: no aplica; un tokenizador SentencePiece es una estructura de datos en CPU que ocupa unos pocos megabytes en memoria (el repositorio completo es de 0,0 GB según Hugging Face).
- **GPU recomendadas**: no aplica; la tokenización se ejecuta en CPU. Cualquier CPU moderna es suficiente.
- **Consumer GPU**: no aplica; no requiere GPU.
- **Opciones de despliegue**: librería `sentencepiece` (nativa), `huggingface_hub` para descarga, integración con `transformers` mediante `PreTrainedTokenizer` o `LlamaTokenizer` apuntando al `tokenizer.model`, y uso dentro de pipelines de preprocesamiento en vLLM, TGI o llama.cpp como componente de tokenización (siempre que el formato sea compatible).
- **Latencia y throughput**: no disponibles en la información proporcionada; en la práctica, la tokenización BPE en CPU alcanza millones de tokens por segundo, pero no se documentan cifras concretas.

## Comparativa con modelos similares

| Tokenizador | Desarrollador | Vocabulario | Idiomas | Licencia | Byte fallback | Disponibilidad |
|---|---|---|---|---|---|---|
| `nep-tokenizer` (este) | DOAI x ILPRL, KU | 64k / 100k / 128k | ne, hi, en | MIT | Sí | Hugging Face |
| `himalaya-ai/nepali-tokenizer-bpe-64k-5b` | Himalaya AI | 64k | ne (principalmente) | no disponible | no disponible | Hugging Face |
| Tokenizador de Llama 3 | Meta | 128k | multilingüe (incluye ne) | Llama 3 Community License | Sí | Hugging Face / Meta |
| Tokenizador de Gemma | Google | 256k | multilingüe (incluye ne) | Gemma Terms of Use | Sí | Hugging Face |

El tokenizador de este repositorio se distingue por ofrecer tres escalas de vocabulario explícitas, licencia MIT permisiva y filtrado específico de calidad devanagari, frente a los tokenizadores de modelos fundacionales que priorizan cobertura global y no optimizan la cohesión de aksharas.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no razona ni responde preguntas; es exclusivamente un componente de tokenización. No debe evaluarse con benchmarks de LLM.
- **Cobertura lingüística limitada**: solo declara nepalí, hindi e inglés. Otros idiomas del sur de Asia (bengalí, tamil, telugu, etc.) no están optimizados, aunque el byte fallback garantiza codificación sin pérdida.
- **Documentación incompleta**: no se especifica el número de tokens de entrenamiento, la composición del corpus, la proporción entre idiomas ni el proceso de filtrado de calidad, lo que dificulta evaluar su sesgo de dominio.
- **Sesgo de corpus**: al entrenarse sobre crawls web, puede heredar sesgos de representación (dominio de registros formales, infrarrepresentación de dialectos nepalíes o de variedades coloquiales).
- **Dependencia de SentencePiece**: requiere la librería `sentencepiece`; no es directamente compatible con tokenizadores basados en `tiktoken` sin conversión.
- **Licencia MIT**: permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte; verificar la procedencia del corpus de entrenamiento si se usa en producción regulada.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa ni de uso en producción.
- **Fecha de creación futura**: la fecha indicada (2026-11-09) es posterior a la actual, lo que sugiere un posible error de metadatos o una publicación programada; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/DOAIxILPRL-KU/nep-tokenizer
- Referencia citada (Himalaya AI, 2024): https://huggingface.co/himalaya-ai/nepali-tokenizer-bpe-64k-5b
- Librería SentencePiece: https://github.com/google/sentencepiece
- Documentación de `huggingface_hub`: https://huggingface.co/docs/huggingface_hub
