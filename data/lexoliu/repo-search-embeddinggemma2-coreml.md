# lexoliu/repo-search-embeddinggemma2-coreml

## Resumen

`lexoliu/repo-search-embeddinggemma2-coreml` es una conversión a Core ML del modelo de embeddings `google/embeddinggemma-2`, empaquetada como modelo multifunción con tres funciones de longitud fija (128, 256 y 512 tokens) y optimizada para ejecutarse en el Apple Neural Engine. No es un modelo entrenado desde cero ni un fine-tune: es un artefacto de despliegue derivado del modelo base de Google, publicado con licencia Apache-2.0 y pensado como pieza de inferencia del proyecto de código abierto `repo-search`.

Su relevancia es de nicho pero concreta: permite hacer búsqueda semántica sobre código en dispositivos Apple sin depender de una GPU dedicada ni de una API externa, con un archivo de 0,4 GB y verificación de fidelidad numérica frente a la referencia en fp32 (coseno mínimo de 0,9995 en muestras por bucket). El autor documenta además que 2360 de 2364 operaciones por función quedan colocadas en el Neural Engine y que el archivo es reproducible byte a byte.

La información publicada es deliberadamente escasa: no se indican parámetros totales, dimensión de embedding, idiomas soportados ni resultados de benchmarks de calidad. La ficha refleja, por tanto, únicamente lo verificable en la model card y en los metadatos de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings de la familia EmbeddingGemma 2 (transformer encoder), convertido a Core ML como modelo multifunción con tres funciones de longitud fija (128, 256 y 512 tokens) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | fija por función: 128, 256 y 512 tokens (tres funciones separadas, sin contexto dinámico) |
| Tipos de cuantización | no disponible (se distribuye un `.mlmodelc` compilado; la model card no detalla precisión por función) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache-2.0 (incluye ficheros LICENSE y NOTICE dentro del archivo) |
| Formato de pesos | Core ML compilado (`.mlmodelc`) dentro de `eg2-coreml-914f7f89-57287aaa.tar.zst`; incluye `tokenizer.json` y `manifest.json` |
| Tarea | Embeddings de frases/código (sentence embeddings), no generación de texto |
| Modelo base | `google/embeddinggemma-2`, revisión `914f7f89142e33e77833254d9c9b90c3cef7303b` |
| Librería | `coreml` (coremltools 9.0) |
| Tamaño del repositorio | 0,4 GB |
| sha256 del archivo | `57287aaa3fea181447dd2bd378d064aeef77684da0c722302e893dd95e43ab2c` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no entrena nada: reproduce en Core ML el modelo de embeddings `google/embeddinggemma-2`. La conversión se realizó con coremltools 9.0 mediante el pipeline `convert/` del repositorio `May-Agent/repo-search`, en el commit `12763a0`. El resultado es un modelo multifunción con tres funciones independientes de longitud fija (128, 256 y 512 tokens), lo que evita formas dinámicas y facilita la planificación estática de operadores en el Neural Engine.

La verificación documentada en el momento de la conversión incluye dos comprobaciones: similitud coseno mínima de 0,9995 frente a la referencia fp32 sobre ficheros de código de muestra en cada bucket de longitud, y 2360 de 2364 operaciones asignadas al Neural Engine por función (las restantes, presumiblemente, en CPU/GPU, aunque no se detalla). El autor afirma que el archivo es reproducible byte a byte: dos ejecuciones limpias producen el mismo sha256. No se aportan datos sobre tokens de entrenamiento, composición del dataset, ni sobre si el modelo base usó RLHF/DPO, por lo que esa información debe consultarse en la model card de `google/embeddinggemma-2`.

## Capacidades

- Generación de embeddings de texto y fragmentos de código para búsqueda semántica y recuperación (retrieval), no para generar texto.
- Tres resoluciones de entrada seleccionables (128, 256 y 512 tokens), lo que permite elegir coste/latencia según la longitud del fragmento a indexar.
- Inferencia en el Apple Neural Engine, con la mayor parte del grafo colocada en el acelerador neuronal en lugar de CPU.
- Ejecución local y offline en dispositivos Apple, sin llamadas a servicios externos.
- Empaquetado reproducible con tokenizer incluido (`tokenizer.json`) y manifiesto (`manifest.json`), lo que facilita la integración en aplicaciones Core ML.
- Integración prevista como backend de embeddings del proyecto `repo-search`.
- No soporta tool calling, function calling, razonamiento multi-paso, ni modalidades de visión o audio: es un modelo de representación vectorial.
- Cobertura multilingüe: no disponible en la información proporcionada (depende del modelo base, no documentado aquí).

## Casos de uso

- Búsqueda semántica sobre repositorios de código: indexar funciones, ficheros y docstrings con la función de 512 tokens y recuperar fragmentos por similitud vectorial ante consultas en lenguaje natural; es exactamente el escenario para el que se construyó (`repo-search`).
- Indexado local en macOS sin GPU dedicada: al ejecutarse en el Neural Engine, permite construir un índice de embeddings en un MacBook mientras la CPU/GPU quedan libres para otras tareas.
- Asistente de búsqueda dentro de un IDE: usar la función de 128 tokens para consultas cortas y la de 512 para fragmentos de contexto, reduciendo la latencia en autocompletado de búsqueda.
- RAG sobre documentación interna y código propietario: los embeddings se calculan en el dispositivo, de modo que el código sensible no sale de la máquina.
- Deduplicación y clustering de código: generar vectores de funciones o ficheros y agrupar por similitud para detectar copias, código muerto o duplicados entre módulos.
- Triaje de issues y pull requests: embeber títulos y descripciones para asignar automáticamente etiquetas, detectar duplicados o sugerir revisores por similitud con incidencias previas.
- Filtrado previo en pipelines de revisión: recuperar los fragmentos de código más parecidos a un diff antes de pasarlos a un modelo generativo, reduciendo el contexto enviado.
- Aplicaciones iOS/iPadOS con búsqueda semántica embebida: al ser un `.mlmodelc`, se puede integrar en apps que necesiten recuperación semántica sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, MTEB, HumanEval, etc.) en la información disponible. Los únicos datos numéricos son métricas de verificación de la conversión:

| Métrica de conversión | Valor |
|---|---|
| Similitud coseno mínima frente a la referencia fp32 | 0,9995 (sobre ficheros de código de muestra por bucket) |
| Operaciones colocadas en el Neural Engine | 2360 de 2364 por función |
| Reproducibilidad del archivo | byte a byte (mismo sha256 en dos ejecuciones limpias) |
| Versión de coremltools | 9.0 |
| Tamaño del repositorio | 0,4 GB |

No se proporcionan cifras de latencia, throughput ni calidad de recuperación (recall@k, nDCG) sobre `repo-search` u otro corpus.

## Requisitos de hardware

- Hardware objetivo: Apple Neural Engine, es decir, chips de la familia Apple Silicon (serie M) y SoC A-series recientes en iPhone/iPad. No está pensado para GPU NVIDIA ni para CPU x86.
- VRAM: no aplica en el sentido convencional; el modelo ocupa 0,4 GB en disco y consume memoria unificada del sistema Apple al cargarse. No se documenta el pico de memoria en inferencia.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este artefacto; requerirían el modelo base en PyTorch/safetensors.
- Cabe en hardware de consumo Apple: sí, por diseño (Neural Engine de portátiles y dispositivos móviles), aunque no se especifica el modelo mínimo de chip compatible.
- Despliegue: Core ML (`.mlmodelc`), coremltools para la conversión, Xcode para integrar en apps, y el pipeline `convert/` de `May-Agent/repo-search` para reproducir la conversión.
- Opciones como vLLM, llama.cpp, Ollama o TGI no aplican: no es un modelo generativo ni se distribuye en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Orientación |
|---|---|---|---|---|---|
| `lexoliu/repo-search-embeddinggemma2-coreml` | no disponible | 128 / 256 / 512 tokens fijos | Core ML (`.mlmodelc`) | Apache-2.0 | Embeddings on-device en Apple Neural Engine |
| `google/embeddinggemma-2` (modelo base) | no disponible en la información proporcionada | no disponible | safetensors / PyTorch (según modelo base) | Apache-2.0 | Embeddings de propósito general, ejecutable en GPU/CPU |
| Otras conversiones Core ML de modelos de embeddings | no disponible | no disponible | Core ML | variable | Misma categoría, sin datos comparativos disponibles aquí |

La comparación relevante es con el modelo base: este artefacto sacrifica flexibilidad de forma dinámica y portabilidad fuera del ecosistema Apple a cambio de ejecución en el Neural Engine y verificaciones de fidelidad numérica explícitas. No se dispone de datos de benchmarks que permitan comparar calidad de recuperación con alternativas.

## Limitaciones y advertencias

- Ventana de contexto truncada: las entradas se limitan a 128, 256 o 512 tokens según la función elegida; fragmentos de código más largos se truncan o deben dividirse, con pérdida potencial de contexto.
- No es un modelo generativo: no produce texto, razonamiento, código ni respuestas; solo vectores. Cualquier caso de uso conversacional requiere un modelo adicional.
- Dependencia total del ecosistema Apple: no es ejecutable en Linux, Windows ni GPU NVIDIA sin recurrir al modelo base.
- Ausencia de benchmarks de calidad: no hay datos publicados de MTEB, recall@k ni evaluación sobre el corpus de `repo-search`, por lo que el rendimiento real en recuperación no está cuantificado públicamente.
- Idiomas no declarados: se desconoce la cobertura multilingüe efectiva de esta build.
- Madurez y validación comunitaria nulas: 0 descargas y 0 likes en el momento de la consulta; el artefacto está atado a un commit concreto del repositorio del autor.
- Calidad de la tokenización dependiente de `tokenizer.json` incluido: cualquier divergencia respecto al tokenizer del modelo base alteraría los embeddings, aunque no se documentan comprobaciones específicas de tokenización.
- Sesgos: no documentados. Al heredarse del modelo base, los sesgos de representación de `google/embeddinggemma-2` se trasladan sin mitigación adicional conocida.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero sí existe riesgo de recuperaciones irrelevantes si los umbrales de similitud no se calibran por caso de uso.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar los ficheros LICENSE y NOTICE incluidos en el archivo; conviene verificar también las condiciones del modelo base.
- Integridad del artefacto: debe comprobarse el sha256 `57287aaa3fea181447dd2bd378d064aeef77684da0c722302e893dd95e43ab2c` antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lexoliu/repo-search-embeddinggemma2-coreml
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio del proyecto (pipeline de conversión): https://github.com/May-Agent/repo-search
- Commit de conversión: `12763a0` en `May-Agent/repo-search`
- Revisión del modelo base utilizada: `914f7f89142e33e77833254d9c9b90c3cef7303b`
