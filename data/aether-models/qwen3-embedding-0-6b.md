# aether-models/qwen3-embedding-0.6b

## Resumen

El modelo `aether-models/qwen3-embedding-0.6b` es un paquete de embeddings Core AI publicado por Aether Models para su SDK Aether en iOS y macOS 27 o superior. No es un modelo entrenado desde cero: es una conversión del modelo base `Qwen/Qwen3-Embedding-0.6B` de Alibaba Qwen, en la revisión `97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3`, transformada de PyTorch a formato Core AI (`.aimodel`) mediante la receta `qwen3-embedding-0.6b@2`.

El objetivo del paquete es llevar un modelo de representación vectorial de ~0,6 mil millones de parámetros a inferencia local en GPU de dispositivos Apple, sin depender de servicios en la nube. Los pesos se cuantizan a int8 con granularidad lineal por bloque de 32, lo que reduce el bundle a 633,5 MB por variante (649,3 MB de descarga). Genera vectores de 1024 dimensiones con soporte Matryoshka, de modo que puede truncarse cualquier prefijo entre 32 y 1024 dimensiones y renormalizarse.

Es relevante porque cubre el hueco de la búsqueda semántica y el RAG totalmente on-device en el ecosistema Apple: el modelo no genera texto, solo produce embeddings, y su uso típico es alimentar índices locales de recuperación en aplicaciones iOS y macOS. El repositorio no declara idiomas soportados, datos de entrenamiento ni resultados de benchmarks estándar; la única evidencia de calidad publicada son las pruebas de verificación del propio bundle.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (modelo base Qwen3-Embedding-0.6B); detalles de capas y atención no disponibles en la información proporcionada |
| Parámetros totales | ~0,6 mil millones (según el nombre del modelo base y el tamaño del repositorio, 0,6 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens por texto, tokens añadidos incluidos; los textos más largos se rechazan (error AE-EMB-001) |
| Tipos de cuantización | int8 lineal por bloque de 32 (pesos de 8 bits); no se publican variantes GGUF, FP16 ni otras |
| Idiomas soportados | No disponible (el bundle no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI `.aimodel` (dos variantes: `macos-any-gpu` e `ios-any-gpu`); no se distribuyen safetensors ni GGUF en este repositorio |
| Dimensión de embedding | 1024; Matryoshka, cualquier prefijo de 32 a 1024 dimensiones, renormalizado (`EmbedOptions(dimensions:)`) |
| Pooling | Estado oculto del último token (`lastToken`); vectores normalizados a longitud unitaria dentro del grafo |
| Plataformas | macOS e iOS 27+ con cómputo en GPU (`any` architecture) |
| Formato de consultas | `Instruct: {instruction}\nQuery:{text}` con instrucción por defecto `Given a web search query, retrieve relevant passages that answer the query`; los documentos se codifican como `{text}` |
| Tamaño del bundle | 633,5 MB de assets; 649,3 MB de descarga por variante |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su procedencia (`Qwen/Qwen3-Embedding-0.6B`, familia Qwen3) y de su tarea (`feature-extraction`). Se trata de un modelo denso de representación, no de un modelo generativo, y el paquete distribuido no incluye pesos en formato PyTorch, sino una exportación compilada a Core AI. La conversión aplica cuantización int8 lineal por bloque de 32, con una precisión declarada de coseno ≥ 0,999 frente a la exportación sin cuantizar sobre el mismo conjunto de pruebas. Los ficheros de tokenizador son los del modelo original, sin tokens añadidos más allá de los propios del tokenizador.

No se publican en este repositorio el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta ninguna innovación de decodificación (el modelo no decodifica texto). La innovación relevante aquí es de despliegue: empaquetado de un modelo de embeddings en `.aimodel` con especialización en la primera carga, verificación por digest de bundle y registro de resultados por dispositivo y build de sistema operativo.

## Capacidades

- Generación de embeddings de texto: un vector por texto, expuesto en el campo `embeddings`.
- Similitud y recuperación: cálculo de similitud coseno entre vectores, orientado a búsqueda semántica y recuperación de pasajes.
- Modo asimétrico consulta/documento: las consultas incorporan una plantilla con instrucción y los documentos se codifican en crudo, lo que mejora la recuperación frente a codificar ambos lados igual.
- Matryoshka: truncado de vectores a cualquier dimensión entre 32 y 1024 con renormalización, útil para reducir coste de índice y almacenamiento.
- Textos largos: hasta 8192 tokens por texto, tokens añadidos incluidos, con rechazo explícito por encima de ese límite.
- Inferencia on-device en GPU de Apple, sin llamadas de red, en macOS e iOS 27+.
- Integración con SDK: CLI (`aether embed ...`) y API Swift (`aether.embedder("qwen3-embedding-0.6b")`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes: es un modelo de extracción de características.

## Casos de uso

- Búsqueda semántica local en aplicaciones iOS: indexar notas, correos o documentos del usuario con vectores de 1024 dimensiones y ejecutar la consulta en el dispositivo, manteniendo los datos fuera de la nube gracias a la inferencia en GPU local.
- RAG on-device para asistentes personales: recuperar pasajes relevantes con la plantilla de consulta del modelo y pasarlos después a un modelo generativo local o remoto, sin exponer el corpus del usuario.
- Deduplicación y agrupación de documentos: calcular embeddings de un lote y aplicar clustering o umbral de coseno para agrupar elementos casi idénticos en bibliotecas de archivos o bases de conocimiento.
- Caché semántica en aplicaciones de atención al cliente: detectar preguntas equivalentes ya respondidas mediante similitud entre vectores y evitar llamadas repetidas a un modelo generativo, reduciendo coste y latencia.
- Clasificación y enrutado sin entrenamiento: representar cada categoría como un documento y asignar textos entrantes a la categoría más cercana, útil para triaje de tickets, etiquetado de contenidos o enrutado de consultas internas.
- Recomendación de contenido: comparar el vector de un ítem consultado con el índice de ítems disponibles para sugerir elementos relacionados en apps de lectura, documentación técnica o catálogos.
- Filtrado y moderación aproximada: comparar entradas contra un conjunto de vectores de referencia para detectar contenido próximo a ejemplos conocidos, como paso previo a una revisión más costosa.
- Indexación con presupuesto reducido: usar el truncado Matryoshka a 32-256 dimensiones en dispositivos antiguos o índices grandes, y reservar las 1024 dimensiones para reranking de alta precisión.
- Verificación de similitud en pipelines de documentación: comprobar si un fragmento nuevo duplica contenido ya publicado antes de fusionarlo, ejecutando la comparación en el propio Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, MTEB, BEIR ni métricas de recuperación). El repositorio solo incluye registros de verificación del propio bundle, que comprueban equivalencia numérica con la exportación sin cuantizar sobre un fixture fijo, no calidad de recuperación:

| Variante | Tier | Resultado | Detalle | Dispositivo | Build de SO | Registro |
|---|---|---|---|---|---|---|
| `ios-any-gpu` | T2 | pass | 14/14 casos; perfil quantized-8bit; coseno ≥ 0,999; fixture `d7defd0591ac7299` | iPhone18,2 | 24A446 | `f09227c4` |
| `macos-any-gpu` | T2 | pass | 14/14 casos; perfil quantized-8bit; coseno ≥ 0,999; fixture `d7defd0591ac7299` | Mac17,6 | 26A434 | `65fc8aa7` |
| Referencia sin cuantizar (no publicada) | T2 | pass | 14/14 casos; perfil strict; coseno ≥ 0,999; fixture `d7defd0591ac7299` | Mac17,6 | 26A434 | `e1539410` |

El perfil cuantizado exige además que la referencia sin cuantizar supere T2 strict, cosa que cumple la fila de referencia.

## Requisitos de hardware

- VRAM estimada: el bundle pesa 633,5 MB en pesos int8, por lo que la huella de pesos ronda los 650 MB; con activaciones y buffers de runtime es razonable estimar menos de 1 GB, aunque el autor no publica una cifra oficial.
- Hardware soportado: GPU de dispositivos Apple con iOS 27+ o macOS 27+. Las pruebas se ejecutaron en un iPhone18,2 y en un Mac17,6.
- GPU de servidor (A100, H100, RTX 4090): no soportadas; el artefacto es un `.aimodel` de Core AI, no un checkpoint PyTorch, GGUF ni safetensors.
- GPU de consumo (RTX, Arc, Radeon): no aplica; no hay ruta de despliegue publicada para estas plataformas.
- Opciones de despliegue: SDK Aether (CLI `aether embed` y API Swift `Aether`/`embedder`), con especialización del modelo en la primera carga. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia y throughput: no disponibles. El autor no publica mediciones de rendimiento, solo resultados de verificación de equivalencia numérica.
- Almacenamiento: 633,5 MB de assets y 649,3 MB de descarga por variante; conviene planificar el espacio para las dos variantes si se despliega en macOS e iOS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `aether-models/qwen3-embedding-0.6b` (este bundle) | ~0,6 B | 8192 tokens por texto | 1024, Matryoshka 32-1024 | `.aimodel` Core AI, int8 por bloque de 32 | Apache-2.0 | Repositorio HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `Qwen/Qwen3-Embedding-0.6B` (modelo base) | ~0,6 B | No disponible en la información proporcionada | 1024 según el bundle derivado | Pesos PyTorch (no distribuidos en este repositorio) | Apache-2.0 (declarada en su model card, sin fichero de licencia propio) | Público en HuggingFace |
| Otras alternativas de embeddings de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con modelos de terceros de la misma categoría (por ejemplo, familias de embeddings multilingües de ~0,5 B de parámetros) no puede establecerse con la información proporcionada: no hay datos de benchmarks ni de idiomas para este bundle, por lo que cualquier comparación de calidad sería especulativa.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings. No admite chat, tool calling, agentes ni razonamiento multi-paso.
- Límite duro de 8192 tokens por texto; los textos más largos se rechazan con el error AE-EMB-001 en lugar de truncarse silenciosamente, lo que exige trocear en la aplicación.
- La cuantización int8 introduce una desviación respecto a la referencia sin cuantizar. El autor reporta coseno ≥ 0,999 sobre 14 casos de un fixture, una garantía de equivalencia numérica limitada y no extrapolable a calidad de recuperación en dominios reales.
- No se publican idiomas soportados, datos de entrenamiento ni evaluación en tareas de recuperación (MTEB, BEIR, etc.). La idoneidad multilingüe es, por tanto, no verificada en este repositorio.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos o negativos en recuperación y clustering si los umbrales de coseno no se calibran por dominio.
- Dependencia de plataforma: requiere iOS o macOS 27+ y el SDK Aether. No hay ruta de despliegue para Linux, Windows, Android ni GPU de servidor, lo que limita su uso a aplicaciones Apple.
- El modelo base declara Apache-2.0 en su model card pero no incluye fichero de licencia; el bundle incorpora el texto canónico de Apache-2.0. La licencia Apache-2.0 permite uso comercial, pero conviene conservar el aviso de licencia y las atribuciones al redistribuir el bundle.
- Adopción nula hasta la fecha de la consulta (0 descargas, 0 likes) y ausencia de evaluación independiente: no hay evidencia externa de comportamiento en producción.
- Los resultados de búsqueda web realizados no devolvieron información relevante sobre este modelo; todas las referencias encontradas al término "Aether" corresponden a otros proyectos sin relación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aether-models/qwen3-embedding-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Texto canónico de la licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio de código o demo del bundle: no disponibles en la información proporcionada
- Resultados de búsqueda web: sin enlaces relevantes (los resultados obtenidos tratan sobre el concepto mitológico de éter, un mod de Minecraft y una revista independiente, sin relación con el modelo)
