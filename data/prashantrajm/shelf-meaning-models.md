# prashantrajm/shelf-meaning-models

## Resumen

`shelf-meaning-models` es una conversión a Core ML del modelo de embeddings de frases `sentence-transformers/all-MiniLM-L6-v2`, publicada por el usuario prashantrajm. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el transformer original de 6 capas y 384 dimensiones de salida se ha convertido al formato Core ML con pesos cuantizados a 8 bits para ejecutarse en dispositivos iOS 18 o superiores. Su propósito es habilitar la funcionalidad "Search by Meaning" (búsqueda semántica) dentro de la aplicación Shelf para iOS, ejecutando la inferencia de forma local sin depender de la nube.

El modelo hereda la arquitectura y el conocimiento del MiniLM-L6 original, un transformer encoder de tipo BERT con atención multi-cabeza estándar, diseñado para producir embeddings de frases mediante mean pooling y normalización L2. Al estar empaquetado en Core ML, el modelo está pensado exclusivamente para el ecosistema Apple (Core ML, iOS, macOS), lo que limita su uso a ese entorno y lo aleja de los pipelines habituales de Hugging Face basados en PyTorch, safetensors o GGUF.

La relevancia de esta ficha es acotada: se trata de un artefacto de nicho, con cero descargas y un único "like" en el momento de la consulta, sin benchmarks publicados ni documentación más allá de la model card. Resulta útil como referencia para quienes necesiten integrar búsqueda semántica on-device en aplicaciones iOS, pero no es un modelo generalista para servidores ni para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6), 6 capas, 384 dimensiones de embedding |
| Parametros totales | no disponible (el modelo base MiniLM-L6 ronda los 22,7 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como cifra unica; las formas de entrada aceptadas son n = 32, 64, 128 o 256 tokens |
| Tipos de cuantizacion | pesos a 8 bits (cuantizacion incluida en la conversion Core ML) |
| Idiomas soportados | no disponible (el vocabulario es BERT uncased WordPiece, predominantemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, `sentence-transformers/all-MiniLM-L6-v2`, es un transformer encoder de 6 capas derivado de MiniLM, con 384 dimensiones ocultas y una cabeza de embedding de 384 dimensiones. Produce representaciones de frases mediante mean pooling sobre las salidas del encoder y normalización L2, de modo que la similitud coseno entre vectores refleja similitud semántica. El artefacto publicado no entrena ni afina el modelo: únicamente lo convierte a Core ML con pesos de 8 bits.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el uso de RLHF/DPO ni innovaciones técnicas adicionales en la información proporcionada. La model card solo documenta la interfaz de entrada/salida de la conversión: `input_ids` y `attention_mask` como enteros de 32 bits con forma `[1, n]` (n = 32, 64, 128 o 256), y una salida `embedding` de tipo Float con forma `[1, 384]`, ya con mean pooling y normalización L2 aplicados. El vocabulario `vocab.txt` corresponde al WordPiece uncased de BERT.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda por significado.
- Extracción de características (`feature-extraction`) y `sentence-similarity` como tareas declaradas.
- Inferencia on-device en iOS 18+ mediante Core ML, sin conexión a red.
- Entrada limitada a secuencias de 32, 64, 128 o 256 tokens según la forma elegida.
- Salida de embedding de 384 dimensiones, lista para indexación vectorial y comparación por similitud coseno.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidades multilingües: no disponibles; el vocabulario WordPiece uncased es de origen inglés.

## Casos de uso

- Búsqueda semántica on-device en apps iOS: el modelo genera embeddings de las consultas del usuario y de los documentos indexados localmente, permitiendo recuperar resultados por significado sin enviar datos a un servidor, gracias a su ejecución en Core ML.
- Deduplicación y agrupación de contenido en el dispositivo: calcular similitud coseno entre embeddings de 384 dimensiones para agrupar notas, artículos o registros duplicados dentro de una app sin salir del terminal.
- Clasificación ligera por similitud: comparar el embedding de una frase con embeddings de referencia precalculados (etiquetas, plantillas) para asignar categorías en tiempo real en iOS.
- Filtrado y recomendación local: ordenar listas de elementos (por ejemplo, resultados de una biblioteca personal) por proximidad semántica a una consulta escrita por el usuario.
- Preprocesado en pipelines de recuperación aumentada (RAG) en el borde: generar embeddings de fragmentos cortos (hasta 256 tokens) en el dispositivo antes de enviarlos a un índice remoto, reduciendo el coste de cómputo en servidor.
- Prototipado de funcionalidades de NLP en iOS: validar rápidamente experiencias de búsqueda semántica o similitud de frases en apps experimentales aprovechando el formato Core ML y la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está pensado para ejecutarse en el Neural Engine o la CPU/GPU de dispositivos Apple. Al tratarse de un modelo MiniLM-L6 de ~22,7 M de parámetros con pesos a 8 bits, el peso en memoria es del orden de decenas de MB, aunque no se confirma la cifra exacta en la información proporcionada.
- GPU recomendadas: no aplica; el destino es hardware Apple (iPhone, iPad, Mac con Neural Engine).
- Compatibilidad con GPU de consumo (RTX, A100, H100): no disponible; el formato Core ML no está orientado a esos entornos.
- Opciones de despliegue: Core ML en iOS 18+ (y potencialmente macOS mediante Core ML). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| prashantrajm/shelf-meaning-models | no disponible (base MiniLM-L6) | entradas de 32/64/128/256 tokens | Core ML, 8 bits | Apache 2.0 | Embeddings on-device en iOS |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M (no confirmado en la fuente) | no disponible | safetensors/PyTorch | Apache 2.0 | Embeddings de frases en servidor y librerías |
| Otros modelos de sentence-transformers de tamaño similar | no disponible | no disponible | safetensors/PyTorch | varía | Embeddings de frases |

La comparación directa con alternativas se limita al modelo base, ya que no se dispone de datos de rendimiento ni de otros artefactos Core ML equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de conversión, no un modelo nuevo: su calidad depende enteramente del MiniLM-L6 original.
- Sin benchmarks publicados ni métricas de evaluación en la model card.
- El vocabulario WordPiece uncased es de origen inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Entrada restringida a formas fijas de 32, 64, 128 o 256 tokens; secuencias más largas requieren truncado o segmentación.
- Formato Core ML: no es directamente utilizable en PyTorch, vLLM, llama.cpp, Ollama ni TGI, lo que limita su portabilidad.
- Requiere iOS 18+; no se documenta compatibilidad con versiones anteriores ni con otros sistemas.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero la similitud semántica puede producir falsos positivos en la recuperación.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del vocabulario BERT asociado.
- Repositorio con cero descargas y documentación mínima: no hay garantía de mantenimiento ni soporte.

## Enlaces

- [Hugging Face: prashantrajm/shelf-meaning-models](https://huggingface.co/prashantrajm/shelf-meaning-models)
- [Modelo base: sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
