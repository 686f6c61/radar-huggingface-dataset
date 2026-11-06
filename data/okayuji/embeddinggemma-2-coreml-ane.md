# okayuji/embeddinggemma-2-coreml-ane

## Resumen

EmbeddingGemma 2 para Core ML es una conversión del modelo de embeddings multimodal `google/embeddinggemma-2` a formato Core ML, optimizada para ejecutarse en el Apple Neural Engine (ANE) de chips Apple Silicon. La publica el usuario okayuji y permite convertir texto, imágenes y audio en vectores de 768 dimensiones normalizados para búsqueda semántica y similitud local, sin depender de servicios en la nube.

El repositorio ofrece dos variantes completas: FP16 (1,50 GB) e INT8 (0,81 GB), cada una con sus propios programas Core ML (`text.mlpackage`, `vision.mlpackage`, `audio.mlpackage`), el procesador original fijado y un runner Python autónomo. El objetivo de exportación es macOS 15 / iOS 18, y la ejecución se verificó en un M4 Max con macOS 27; la ejecución en iPhone no está probada.

Su relevancia radica en llevar un modelo de embeddings multimodal de Google a la inferencia local en hardware Apple, con asignación de las operaciones principales (Linear, Conv, MatMul) de los seis codificadores al ANE. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque el modelo base conserva sus propias condiciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión, audio) convertido a Core ML; seis codificadores |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de texto (incluyendo prefijo de tarea y tokens especiales) |
| Tipos de cuantización | FP16 e INT8 (cuantización post-entrenamiento por canal en pesos Linear/Conv) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage), tabla de vocabulario externa (FP16/INT8) |

## Arquitectura y entrenamiento

El modelo base `google/embeddinggemma-2` es un modelo de embeddings multimodal que procesa texto, imágenes y audio. En esta conversión, los tres tipos de entrada se transforman en "soft tokens" que se insertan entre los tokens especiales correspondientes y se pasan por un codificador de texto común. La salida es un vector normalizado de 768 dimensiones, con opción de truncar a 512, 256 o 128 dimensiones tomando un prefijo y renormalizando.

La conversión a Core ML asigna las operaciones principales de Linear, Conv y MatMul de los seis codificadores al ANE con `CPU_AND_NE`. El codificador de imagen conserva 27 operaciones de entrada en CPU. La atención de audio usa tensores de rango máximo cuatro, normalización RMS escalada y el límite de recorte FP16 original de 65504. La variante INT8 aplica escalas de peso por canal y almacena el vocabulario en bloques de 32 con escalas FP16 decodificadas en el host. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y similitud entre frases, con roles diferenciados de `query` y `document`.
- Extracción de características de imagen: una imagen RGB con preprocesado que preserva la relación de aspecto, 630 parches agrupados espacialmente en un máximo de 70 soft tokens.
- Extracción de características de audio: WAV PCM16 mono a 16 kHz, ventanas de hasta 10 segundos, con vectores separados y con marca temporal para grabaciones más largas.
- Salida de vectores de 768 dimensiones normalizados, con truncado opcional a 512, 256 o 128 dimensiones.
- Procesamiento local en Apple Silicon sin conexión a servicios externos.
- No genera texto ni transcripciones: solo produce embeddings.

## Casos de uso

- Búsqueda semántica local en aplicaciones macOS: el modelo convierte consultas y documentos en vectores de 768 dimensiones que se indexan y comparan por similitud coseno, todo en el dispositivo sin enviar datos a la nube.
- Búsqueda de imágenes por similitud: se indexan los embeddings de un catálogo de fotos y se consulta con una imagen o un texto, aprovechando el codificador de visión y el espacio compartido de soft tokens.
- Recuperación sobre archivos de audio: se generan vectores con marca temporal por ventanas de hasta 10 segundos para localizar fragmentos de audio similares en una grabación larga.
- Deduplicación y clustering de contenido: los embeddings de texto permiten agrupar documentos o mensajes similares en pipelines de limpieza de datos ejecutados en un Mac.
- Filtrado y moderación de contenido: la similitud entre embeddings de texto e imagen facilita la detección de contenido duplicado o de categorías predefinidas en aplicaciones locales.
- Integración en apps iOS/macOS: los programas Core ML con interfaces fijas se pueden incrustar directamente en una app para funciones de recomendación o búsqueda sin backend.
- Prototipado de sistemas RAG en local: el runner Python permite construir índices vectoriales de prueba en un M4 Max antes de trasladar la lógica a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento registrados son de tiempo de proceso: la ejecución de ejemplo con texto `Meeting notes`, rol `query`, variante FP16 y `cpu_and_ne` tardó 14,96 segundos en un proceso Python nuevo en un M4 Max con 128 GiB de memoria y macOS 27.0, incluyendo importaciones, inicialización del procesador, carga del modelo y predicción. No es una medida de latencia del acelerador ni de throughput.

## Requisitos de hardware

- Ejecución verificada en Apple M4 Max con 128 GiB de memoria y macOS 27.0; objetivo de exportación macOS 15 / iOS 18.
- VRAM/RAM estimada: no disponible como medida de memoria; los tamaños de bundle son 1,50 GB (FP16) y 0,81 GB (INT8), sin contar el runner ni los archivos de verificación.
- GPU recomendadas: no aplica; el destino es el Apple Neural Engine de chips Apple Silicon.
- Cabe en hardware de consumo Apple Silicon (Mac con M-series); la ejecución en iPhone no está probada.
- Opciones de despliegue: Core ML con `CPU_AND_NE`, runner Python incluido (`embed.py`) y coremltools 9.0, Torch 2.9.0 y Transformers 5.19.0 como dependencias registradas.
- Latencia y throughput: solo se conoce el tiempo de proceso de 14,96 segundos del ejemplo; no hay benchmark de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| okayuji/embeddinggemma-2-coreml-ane | no disponible | 256 tokens de texto | Texto, imagen y audio | Apache 2.0 | Core ML (FP16/INT8) |
| google/embeddinggemma-2 | no disponible | no disponible | Texto, imagen y audio (según el repositorio derivado) | no disponible | Modelo base original |
| Alternativas de embeddings en Core ML | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El contexto de texto está limitado a 256 tokens incluyendo el prefijo de tarea y los tokens especiales; el runner rechaza el desbordamiento.
- El audio debe ser WAV PCM16 mono a 16 kHz con al menos 161 muestras; cada ventana del modelo es de hasta 10 segundos.
- Las imágenes se procesan de una en una, con conversión a RGB y preprocesado que preserva la relación de aspecto.
- El modelo solo produce embeddings: no genera respuestas, transcripciones ni texto.
- La variante INT8 es cuantización post-entrenamiento, no el checkpoint con cuantización consciente de Google (LiteRT-LM); pueden existir diferencias medibles frente a FP16.
- Debe mantenerse la misma variante y dimensionalidad entre un índice y sus consultas.
- La ejecución en iPhone no está probada y el soporte se limita a macOS 15 / iOS 18 como objetivo de exportación.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura de idiomas del modelo base en la documentación proporcionada.
- La licencia del repositorio es Apache 2.0, pero deben revisarse las condiciones del modelo base `google/embeddinggemma-2` para uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/okayuji/embeddinggemma-2-coreml-ane
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Variante FP16: https://huggingface.co/okayuji/embeddinggemma-2-coreml-ane/tree/main/fp16
- Variante INT8: https://huggingface.co/okayuji/embeddinggemma-2-coreml-ane/tree/main/int8
- Ejemplo de salida JSON: https://huggingface.co/okayuji/embeddinggemma-2-coreml-ane/resolve/main/examples/query-fp16.json
- Condiciones de la ejecución registrada: https://huggingface.co/okayuji/embeddinggemma-2-coreml-ane/resolve/main/examples/query-fp16-run.json
- Verificación FP16: https://huggingface.co/okayuji/embeddinggemma-2-coreml-ane/resolve/main/fp16/verification.json
- Verificación INT8: https://huggingface.co/okayuji/embeddinggemma-2-coreml-ane/resolve/main/int8/verification.json
