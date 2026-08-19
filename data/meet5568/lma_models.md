# meet5568/lma_models

## Resumen

LMA Phase 1 es un par de tokenizadores SentencePiece independientes, uno para hindi y otro para nepalí, desarrollados por Meet Ghelani (meet5568) como primera fase de un proyecto para construir dos transformadores decoder-only de aproximadamente 25 millones de parámetros, uno por idioma. Ambos idiomas comparten el bloque Devanagari (U+0900–U+097F), por lo que el proyecto mantiene los corpus y vocabularios completamente separados como restricción central de diseño, no como un añadido posterior.

Cada tokenizador usa el algoritmo unigram con un vocabulario de 10.000 piezas, seleccionado tras comparar veinte modelos (cinco tamaños de vocabulario por dos algoritmos, para ambos idiomas). El unigram superó al BPE en todas las comparaciones pareadas, y el tamaño de 10.000 se eligió por equilibrio entre fertilidad y presupuesto de parámetros, ya que la matriz de embeddings consumiría el 20% del presupuesto total del modelo de 25M.

La relevancia de este trabajo reside en que aborda la tokenización de idiomas de bajos recursos con escritura compartida, un problema poco cubierto por los tokenizadores multilingües genéricos, y publica los datos de entrenamiento y el proceso de selección de forma transparente y reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SentencePiece unigram con byte_fallback |
| Parámetros totales | no aplica (tokenizador; vocabulario de 10.000 piezas por idioma) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (tokenizador) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | Hindi (hi), Nepali (ne) |
| Licencia | Apache-2.0 |
| Formato de pesos | Modelo SentencePiece (.model) |
| Vocabulario | 10.000 piezas por idioma, sin piezas compartidas |
| Fertilidad (hindi) | 1,3250 tokens/palabra |
| Fertilidad (nepali) | 1,4620 tokens/palabra |
| Caracteres por token (hindi) | 3,7749 |
| Caracteres por token (nepali) | 4,5208 |

## Arquitectura y entrenamiento

Ambos tokenizadores usan el algoritmo unigram de SentencePiece con `byte_fallback=True`, lo que garantiza que cualquier carácter no visto se descomponga en tokens de byte y que el recuento de UNK sea cero por construcción, no por casualidad. Se compararon veinte modelos: cinco tamaños de vocabulario (8k, 10k, 12k, 14k, 16k) por dos algoritmos (BPE y unigram), para cada idioma, todos entrenados sobre el mismo 10% de muestra aleatoria de la partición de entrenamiento, de modo que las diferencias entre modelos reflejan diferencias entre modelos y no entre muestras.

El unigram superó al BPE en las diez comparaciones pareadas por fertilidad, con mejoras de 1,2–2,7%. Se seleccionó el vocabulario de 10.000 piezas sobre el de 16.000 porque, con una matriz de embeddings de `vocab_size × 512` frente a un presupuesto de 25M de parámetros, 16k consumiría el 33% del modelo en una tabla de búsqueda, mientras que 10k consume el 20%. La regla de selección fue el vocabulario más pequeño cuya fertilidad estuviera dentro del 8% de la mejor, sacrificando un 5–7% de fertilidad para devolver ~3,1M de parámetros a las capas del transformador.

Los datos de entrenamiento provienen de corpus documentales: 5.094.185 documentos / 2.588B caracteres para hindi y 6.755.888 documentos / 2.513B caracteres para nepalí, con particiones 70/15/15 por caracteres, estratificadas por fuente y con una fuente completa retenida por idioma como conjunto de prueba de dominio no visto. Los tokenizadores solo vieron la partición de entrenamiento. Por limitaciones de memoria (el unigram necesita ~10,6 GB de RAM por GB de texto), los modelos finales se entrenaron sobre el 50% de las líneas de la partición de entrenamiento; un experimento de control mostró diferencias de fertilidad en la cuarta cifra decimal entre el 81,6% y el 100% de las líneas, lo que confirma que es una limitación de hardware y no de calidad.

## Capacidades

- Tokenización de texto en hindi y nepalí con escritura Devanagari (U+0900–U+097F).
- Descomposición de cualquier carácter no visto en tokens de byte gracias a `byte_fallback=True`, con cero tokens UNK por construcción.
- Vocabularios completamente independientes para cada idioma, sin piezas, merges ni archivos de vocabulario compartidos.
- Fertilidad de 1,3250 tokens/palabra (hindi) y 1,4620 tokens/palabra (nepali).
- 0,289% de byte-fallback en hindi y 0,178% en nepalí.
- 201 piezas sin usar en hindi y 239 en nepalí.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Pre-entrenamiento de modelos de lenguaje pequeños en hindi y nepalí: es el propósito original del proyecto; los tokenizadores están diseñados para transformadores decoder-only de ~25M de parámetros con embeddings de 512 dimensiones, y su vocabulario de 10k piezas equilibra fertilidad y coste de parámetros.
- Fine-tuning de modelos de lenguaje para tareas específicas en hindi y nepalí: al ser tokenizadores independientes, permiten entrenar modelos monolingües sin contaminación entre idiomas, algo que los tokenizadores multilingües genéricos no ofrecen.
- Sistemas de traducción automática hindi-nepalí: al compartir escritura pero mantener vocabularios separados, facilitan la alineación a nivel de caracteres y el entrenamiento de modelos bilingües con control explícito sobre cada idioma.
- Procesamiento de lenguaje natural para textos Devanagari: análisis morfológico, etiquetado POS, reconocimiento de entidades y otras tareas de PLN clásico sobre corpus en hindi y nepalí.
- Evaluación comparativa de algoritmos de tokenización: el proceso de selección documentado (veinte modelos comparados con métricas de fertilidad) sirve como referencia metodológica para otros proyectos de idiomas de bajos recursos.
- Investigación sobre tokenización de idiomas de bajos recursos: los datos de entrenamiento y el proceso completo están publicados, lo que permite reproducir y extender el trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) porque este repositorio contiene tokenizadores, no modelos completos. Las métricas de rendimiento disponibles son específicas de tokenización:

| Métrica | Hindi | Nepali |
|---|---|---|
| Fertilidad (tokens/palabra) | 1,3250 | 1,4620 |
| Caracteres por token | 3,7749 | 4,5208 |
| Tokens UNK | 0 | 0 |
| Byte-fallback | 0,289% | 0,178% |
| Piezas sin usar | 201 | 239 |

## Requisitos de hardware

- Inferencia (tokenización): requiere muy poca memoria; un `SentencePieceProcessor` carga el modelo en RAM y procesa texto a alta velocidad en CPU, sin necesidad de GPU.
- Entrenamiento: el algoritmo unigram necesita ~10,6 GB de RAM por GB de texto del corpus; el entrenamiento final se realizó sobre el 50% de la partición de entrenamiento, ya que el split completo habría requerido ~49 GB.
- No requiere GPU para tokenización ni para el entrenamiento de los tokenizadores; todo el proceso se ejecuta en CPU.
- Despliegue: integrable con la librería sentencepiece (Python, C++, etc.) y con Hugging Face Transformers mediante el cargador de tokenizadores estándar.

## Comparativa con modelos similares

No se dispone de datos públicos de tokenizadores comparables específicos para hindi y nepalí con el mismo proceso de selección documentado. Los tokenizadores multilingües genéricos (como los de Llama o Mistral) incluyen hindi y nepalí, pero con vocabularios compartidos entre idiomas y sin separación estricta, lo que difiere fundamentalmente del enfoque de este proyecto. No se dispone de métricas comparativas publicadas entre estos tokenizadores y alternativas existentes.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni realiza tareas de razonamiento; es únicamente un tokenizador, y los modelos de ~25M de parámetros para los que fue diseñado no están publicados en este repositorio (es la fase 1 del proyecto).
- Los modelos finales se entrenaron sobre el 50% de la partición de entrenamiento por limitaciones de memoria; aunque el experimento de control mostró diferencias mínimas en fertilidad, no se usó el conjunto completo.
- Vocabulario limitado a 10.000 piezas, lo que puede producir tokenizaciones más largas que vocabularios mayores para ciertos textos, especialmente en dominios especializados.
- Solo cubre hindi y nepalí; no soporta de forma específica otros idiomas con escritura Devanagari como maratí o sánscrito.
- La memoria del algoritmo unigram escala con la longitud total del corpus (~10,6 GB de RAM por GB de texto), lo que puede ser prohibitivo para corpus muy grandes en hardware limitado.
- Licencia Apache-2.0: permite uso comercial con atribución, sin restricciones adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/meet5568/lma_models
- Datos de entrenamiento: https://huggingface.co/datasets/meet5568/lma_datasets
- Perfil del autor: https://huggingface.co/meet5568/models
