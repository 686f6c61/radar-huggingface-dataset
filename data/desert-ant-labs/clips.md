# desert-ant-labs/clips

## Resumen

Clips es un modelo de ranking de texto desarrollado por Desert-Ant Labs, diseñado específicamente para la selección automática de fragmentos destacados en transcripciones de vídeo y audio. A partir de una transcripción dividida en frases, el modelo devuelve los momentos más relevantes ordenados por puntuación y sin solapamientos, listos para cortarse como clips cortos. Está pensado para podcasts, entrevistas y reuniones, y funciona íntegramente en el dispositivo, sin subir contenido a la nube.

El modelo se distribuye en formatos optimizados para inferencia local: un paquete Core ML int8 de 284 MB para plataformas Apple (iOS, macOS, tvOS, visionOS) y dos ficheros LiteRT (TFLite) de 283 MB cada uno para Linux, Windows y Android. La arquitectura interna se divide en dos grafos: un selector que lee las frases en lotes de 16 y un scorer que puntúa cada clip candidato de forma independiente. El contexto de entrada es de 128 tokens para el selector y 256 para el scorer, con truncado de frases a 64 tokens.

Su relevancia actual reside en que resuelve una tarea concreta de postproducción (detectar highlights) con un coste marginal nulo por vídeo adicional y sin dependencia de servicios externos. La licencia es source-available propia de Desert-Ant Labs, no open source estándar, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos grafos (selector + scorer) sobre transformer, compilado a Core ML y LiteRT |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (selector), 256 tokens (scorer); lote fijo de 16 frases; frases truncadas a 64 tokens |
| Tipos de cuantización | int8 per-channel (Core ML), int8 weight-only (LiteRT) |
| Idiomas soportados | multilingüe |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | Core ML compilado (`clips.mlmodelc`), LiteRT/TFLite (`clips-selector.tflite`, `clips-scorer.tflite`), tokenizador Unigram binario (`clip_tokenizer.bin`), metadatos JSON (`clips_meta.json`) |

## Arquitectura y entrenamiento

Clips no es un modelo monolítico, sino un pipeline de dos etapas. El **selector** procesa las frases de la transcripción en lotes de 16 y produce puntuaciones de saliencia, además de probabilidades de inicio y fin (`start_p`, `end_p`) para delimitar cada clip candidato. El **scorer** evalúa después cada clip candidato de forma individual, con una ventana de 256 tokens, y devuelve una puntuación entre 1 y 5. Ambos grafos comparten pesos en el paquete Core ML de Apple; en LiteRT se distribuyen como dos ficheros separados porque el formato no permite empaquetado conjunto.

El modelo construye los clips candidatos alrededor de las `4 × limit` frases más salientes, de modo que el parámetro `limit` controla tanto el número de clips devueltos como el coste computacional. Las pasadas del scorer consumen entre el 60 % y el 85 % del tiempo de ejecución. La selección final resuelve un problema de conjunto no solapado de puntuación total máxima, por lo que el resultado con `limit: 10` no es un subconjunto del resultado con `limit: 14`. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Selección de clips destacados a partir de transcripciones de audio o vídeo, con puntuación y ordenación de mejor a peor.
- Garantía de no solapamiento entre los clips devueltos.
- Delimitación temporal de cada clip (`start`, `end`) y mapeo a los identificadores de frase que abarca.
- Estimación de duración del clip (`estimatedDurationSec`) y percentil de puntuación (`percentile`).
- Procesamiento multilingüe de transcripciones.
- Funcionamiento completamente en el dispositivo, sin envío de datos a servidores.
- Sin límite práctico de longitud de transcripción: el selector lee por lotes y el scorer puntúa cada candidato por separado (probado con una transcripción de 835 frases).
- No genera títulos de clips por sí mismo; requiere el modelo complementario Title para esa función.
- Devuelve una lista vacía si la transcripción tiene menos de tres frases.

## Casos de uso

- **Generación de highlights de podcasts**: se pasa la transcripción completa de un episodio y el modelo devuelve los momentos con mayor puntuación para publicarlos como clips en redes sociales. La ausencia de límite de longitud permite procesar episodios de horas en una sola pasada (9,19 s para 404 frases en iPhone 17 Pro).
- **Resumen de reuniones con clips accionables**: en herramientas de videoconferencia, Clips identifica los tramos donde se toman decisiones o se plantean preguntas clave, y los marca con marcas de tiempo para revisión posterior.
- **Edición automática de entrevistas**: el modelo delimita los fragmentos con mayor saliencia para que un editor humano los revise, reduciendo el tiempo de visionado previo de material bruto.
- **Postproducción de catálogos de vídeo a coste marginal cero**: al ejecutarse en local, procesar un archivo histórico de cien vídeos cuesta lo mismo que procesar uno, sin cuotas por minuto ni transferencia de contenido.
- **Herramientas de creación de contenido en iOS y macOS**: integración mediante el SDK Swift de Desert-Ant Labs en aplicaciones nativas que necesitan clipping on-device, con descarga y caché automática de pesos desde Hugging Face.
- **Procesamiento por lotes en servidores Linux y Windows**: uso de los ficheros LiteRT en pipelines de renderizado o gestión de medios, con control directo de `ids` y `mask` a través de `clips_meta.json`.
- **Filtrado previo en plataformas de formación en línea**: selección de los fragmentos más relevantes de clases grabadas para generar clips promocionales o resúmenes de módulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí proporciona mediciones de latencia en dispositivo:

| Transcripción | iPhone 17 Pro | iPhone 15 Pro |
|---|---:|---:|
| 404 frases, 25 minutos de vídeo, 12 clips | 9,19 s | 10,22 s |
| 57 frases | 2,23 s | no disponible |
| Por candidato, solo encoder | 2,78 ms | 3,13 ms |

Medido en iPhone con lote 16 y Core ML fijado a `.cpuAndNeuralEngine`.

## Requisitos de hardware

- **Tamaño de pesos**: 284 MB (Core ML int8) o 283 MB × 2 (LiteRT int8), más 4 MB de tokenizador.
- **VRAM/RAM estimada**: no disponible de forma explícita; por el tamaño de los pesos, la inferencia cabe holgadamente en dispositivos con 2 GB de memoria libre o más.
- **GPU recomendadas**: no se especifican GPU de escritorio; el modelo está optimizado para Neural Engine en Apple Silicon y para CPU en Linux y Windows.
- **Consumer GPU**: no requiere GPU dedicada; el formato Core ML aprovecha la Neural Engine de los chips Apple (probado en iPhone 15 Pro y 17 Pro).
- **Opciones de despliegue**: Core ML en plataformas Apple; LiteRT (TFLite) en Android, Linux y Windows; SDK Swift de Desert-Ant Labs para integración nativa.
- **Latencia y throughput**: 2,78–3,13 ms por candidato en la fase de encoder; 2,23 s para 57 frases; 9,19–10,22 s para 404 frases y 12 clips. El coste escala linealmente con la longitud de la transcripción y con el parámetro `limit`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de selección de clips on-device en la documentación proporcionada. Los modelos genéricos de ranking de texto (rerankers tipo BGE o Cohere Rerank) no cubren la tarea específica de detección de highlights con delimitación temporal ni ofrecen empaquetado Core ML/LiteRT, por lo que la comparación directa no está disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | On-device |
|---|---|---|---|---|---|
| Clips (Desert-Ant Labs) | no disponible | 128/256 tokens por grafo | Selección de clips | source-available | Sí (Core ML, LiteRT) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `desert-ant-labs-source-available` no es open source; es necesario revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial.
- **Puntuación no calibrada entre vídeos**: `Clip.score` va de 1 a 5 y no es comparable entre transcripciones distintas. Un corte absoluto en 0,65 no devuelve nada en el 21 % de los vídeos y en 0,75 falla en la mitad; debe usarse el percentil por vídeo (rango observado de 0,33 a 0,95).
- **Sin títulos**: el modelo no genera títulos para los clips; requiere el modelo Title como complemento.
- **Mínimo de frases**: con transcripciones de menos de tres frases devuelve una lista vacía.
- **Truncado de frases largas**: las frases de más de 64 tokens se truncan antes del selector, lo que puede perder información en transcripciones con intervenciones muy largas.
- **Riesgo de configuración incorrecta en LiteRT**: si se intercambian las entradas `ids` y `mask`, el grafo devuelve números finitos y plausibles pero el pipeline construye un conjunto de candidatos erróneo, sin error visible.
- **Función por defecto en Core ML**: si no se especifica `MLModelConfiguration.functionName`, Core ML carga la función por defecto y ambas mitades del pipeline ejecutan el selector.
- **Idiomas**: aunque se declara multilingüe, no se detalla el rendimiento por idioma ni la cobertura real.
- **Sesgos y alucinación**: no se ha publicado información sobre sesgos conocidos; al ser un modelo de ranking y no generativo, el riesgo de alucinación se limita a puntuaciones mal calibradas, no a texto inventado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/clips
- Pesos v0.1.0: https://huggingface.co/desert-ant-labs/clips/tree/v0.1.0
- Licencia: https://license.desertant.com/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación del modelo Title: https://desertant.com/docs/title/
- Documentación de descargas y caché: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Requisitos del SDK Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
