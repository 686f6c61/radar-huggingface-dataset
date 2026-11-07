# Polderpijplijn/grimreader-minilm-latin

## Resumen

`grimreader-minilm-latin` es una conversión a Core ML del modelo de embeddings de frases `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, publicada por el desarrollador Polderpijplijn para su aplicación iOS de lectura de libros electrónicos Grim Reader. No se trata de un modelo generativo, sino de un encoder de frases que produce vectores densos de 384 dimensiones normalizados a longitud unitaria, pensados para búsqueda semántica ("search by meaning") sobre el contenido de los libros.

La modificación respecto al modelo original es doble: por un lado, el vocabulario del tokenizador se ha podado de 250.002 a 114.548 piezas, conservando únicamente las formadas íntegramente por letras latinas (incluido Latin Extended-D/E), dígitos, puntuación, símbolos y el marcador `▁`, además de los cuatro tokens especiales y la pieza de menor puntuación que fija la penalización de `<unk>`. Por otro, los pesos se han cuantizado a int8 por canal y se han empaquetado como `mlprogram` para iOS 17 o superior, con el mean pooling y la normalización L2 integrados en el grafo.

Es relevante ahora por dos motivos: ejemplifica el patrón de despliegue de embeddings semánticos totalmente en dispositivo, sin envío de datos a servidores, y documenta una técnica de poda de vocabulario por sistema de escritura que preserva exactamente la tokenización del texto latino. El modelo se descarga solo cuando el usuario activa la función, y el repositorio ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, 12 capas, 384 dimensiones ocultas) convertido a Core ML mlprogram |
| Parametros totales | no disponible (modelo base MiniLM-L12-H384; el repo no declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (entrada fija 1×128) |
| Tipos de cuantizacion | int8 por canal (per-channel) |
| Idiomas soportados | no disponible oficialmente; el modelo base es multilingüe, pero esta version solo tokeniza correctamente texto en escritura latina |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (mlprogram, iOS 17+); tokenizador en `stukjes.txt`, `scores.bin` (float64 little-endian) y `charsmap.bin` |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. La arquitectura subyacente es `microsoft/Multilingual-MiniLM-L12-H384` (MIT), un transformer encoder de 12 capas y 384 dimensiones ocultas afinado con Sentence Transformers para producir embeddings de frases mediante mean pooling. El modelo original se entrenó sobre pares de frases multilingües con objetivos de similitud contrastiva, pero la model card de esta conversión no detalla el número de tokens ni la composición del dataset de entrenamiento original.

La innovación técnica de esta versión está en el pipeline de conversión. El vocabulario XLM-R (MIT, Facebook AI/fairseq) se poda por sistema de escritura: se conservan las piezas compuestas solo por caracteres latinos, dígitos, puntuación y símbolos, más los cuatro tokens especiales y la pieza de menor puntuación (que determina la penalización de `<unk>`). El resultado son 114.548 piezas frente a las 250.002 originales, con la garantía de que el texto en escritura latina se tokeniza en exactamente las mismas piezas que con el vocabulario completo. El normalizador precompilado se conserva en `charsmap.bin` y las puntuaciones Unigram en `scores.bin`. El grafo Core ML incorpora el mean pooling y la normalización L2, de modo que la salida `vector` (1×384) ya es de longitud unitaria. La cuantización es int8 por canal.

## Capacidades

- Generación de embeddings de frases de 384 dimensiones, normalizados a longitud unitaria, para similitud coseno.
- Búsqueda semántica ("search by meaning") sobre texto en escritura latina.
- Tokenización idéntica al modelo original para texto latino; cualquier otro sistema de escritura se convierte en `<unk>`.
- Inferencia totalmente en dispositivo mediante Core ML, sin llamadas de red.
- Entrada limitada a 128 tokens por pasada (secuencias más largas requieren truncamiento o troceado previo).
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un encoder de similitud.

## Casos de uso

- Búsqueda semántica dentro de una aplicación de lectura: el modelo indexa pasajes y descripciones de libros como vectores de 384 dimensiones y permite consultas por significado en lugar de por coincidencia literal, con toda la computación en el dispositivo del usuario.
- Funcionalidad opcional con descarga bajo demanda: al activarse solo cuando el usuario la habilita y no enviar datos a ningún servidor, encaja en requisitos de privacidad estrictos de aplicaciones iOS.
- Deduplicación y agrupación de descripciones de libros: calcular similitud coseno entre descripciones para detectar entradas repetidas o agrupar obras temáticamente relacionadas.
- Recomendación por similitud de contenido: comparar el embedding de la consulta o del libro actual con un catálogo preindexado para sugerir lecturas afines.
- Filtrado y ordenación de resultados de búsqueda local: reordenar candidatos recuperados por coincidencia léxica según su similitud semántica.
- Prototipado de sistemas de recuperación en iOS sin backend: al ser un `.mlpackage` con pooling y normalización integrados, se puede integrar directamente en apps Swift sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible; el modelo no es generativo y esas métricas no aplican. La única evaluación publicada es una comparación de fidelidad frente al modelo original en Python sobre 451 textos (descripciones de libros, consultas y casos límite en neerlandés e inglés): similitud coseno mínima de 0,997 y el mismo top 5 para todas las consultas.

| Metrica | Resultado |
|---|---|
| Textos evaluados | 451 (neerlandés e inglés) |
| Similitud coseno minima vs. original | 0,997 |
| Coincidencia de top 5 | 100 % de las consultas |
| Dimension de salida | 384 (longitud unitaria) |
| Longitud de entrada | 128 tokens |

## Requisitos de hardware

- Diseñado para ejecución en dispositivo Apple con Core ML (mlprogram, iOS 17+); no requiere GPU de servidor.
- Tamaño del repositorio: 0,1 GB, lo que incluye pesos int8, tokenizador y manifiesto.
- Inferencia sobre CPU, GPU o Neural Engine de Apple según la política de Core ML; la model card no especifica latencia ni throughput.
- No está pensado para despliegue en vLLM, llama.cpp, Ollama o TGI: el formato `.mlpackage` es específico de Core ML.
- VRAM estimada para inferencia en GPU convencional: no disponible (no se distribuyen pesos en safetensors ni GGUF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| grimreader-minilm-latin | no disponible (base MiniLM-L12-H384) | 128 tokens | 384 dims, L2 | Apache-2.0 | Core ML int8 |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible (MiniLM-L12-H384) | 128 tokens | 384 dims | Apache-2.0 | safetensors/PyTorch |
| microsoft/Multilingual-MiniLM-L12-H384 | no disponible (MiniLM-L12-H384) | 128 tokens | 384 dims | MIT | safetensors |

La diferencia práctica frente al original es el tamaño (vocabulario podado y pesos int8), el formato (Core ML frente a PyTorch) y la restricción a escritura latina; la calidad de embeddings es prácticamente idéntica según la evaluación del autor. Para otros sistemas de escritura o para despliegue en servidor conviene usar el modelo original.

## Limitaciones y advertencias

- Solo tokeniza correctamente escritura latina; cualquier otro sistema de escritura se convierte en `<unk>`, lo que degrada o anula la calidad de los embeddings para esos idiomas.
- Ventana de contexto de 128 tokens: textos más largos deben trocearse y agregarse, con la pérdida de información que ello implica.
- Al ser una conversión cuantizada a int8, existe una pequeña desviación respecto al original (coseno mínimo 0,997 medido), no una equivalencia exacta.
- No es un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling.
- No hay datos publicados sobre sesgos; al derivar de un modelo multilingüe entrenado con datos web, puede heredar sesgos del corpus original.
- Riesgo de falsos positivos en similitud semántica en textos cortos o ambiguos; conviene validar umbrales en el dominio de aplicación.
- La licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos de atribución del modelo base y del tokenizador (MIT).
- Dependencia de iOS 17+ y del runtime Core ML; no es portable a otras plataformas sin reconversión.

## Enlaces

- Hugging Face: https://huggingface.co/Polderpijplijn/grimreader-minilm-latin
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Modelo MiniLM original: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Repositorio de soporte de Polderpijplijn: https://github.com/polderpijplijn/polderpijplijn-support
- Plantilla de README del repositorio de soporte: https://github.com/polderpijplijn/polderpijplijn-support/blob/main/templates/README.md
