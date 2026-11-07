# masahiroid/ruri-v3-70m-coreml

## Resumen

ruri-v3-70m-coreml es una conversión a formato Core ML del checkpoint cl-nagoya/ruri-v3-70m, un modelo de embeddings semánticos para japonés basado en la arquitectura ModernBERT. Lo publica masahiroid como conversión de formato, no como un nuevo modelo entrenado: los pesos subyacentes son los originales de cl-nagoya (revisión `07a8b0aba47d29d2ca21f89b915c1efe2c23d1cc`), sin fine-tuning adicional ni cuantización de 4 bits, sino una línea base F32 exportada como ML Program (`*.mlpackage`).

El modelo resuelve el problema de ejecutar recuperación semántica en japonés directamente en dispositivos Apple (macOS 14/iOS 17 en adelante) sin depender de un servidor. Incluye el pooling medio con conciencia de máscara y la normalización L2 dentro del grafo exportado, de modo que la salida ya es un embedding normalizado listo para comparar por similitud coseno. La entrada usa los prefijos originales de recuperación `検索クエリ: ` (consulta) y `検索文書: ` (documento).

Con 70 millones de parámetros y una dimensión de embedding de 384, es un modelo pequeño pensado para indexación y búsqueda local. La limitación clave de esta exportación es que las formas son fijas: 128 tokens de contexto y batch size 1, aunque el checkpoint original soporta secuencias más largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), exportado como Core ML ML Program |
| Parametros totales | 70 M (aproximado, segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens en esta exportacion (formas fijas); el checkpoint original soporta contextos mas largos, no expuestos aqui |
| Tipos de cuantizacion | F32 (sin cuantizacion; el autor indica explicitamente que no es 4-bit) |
| Idiomas soportados | japones (entrenamiento y pruebas); se incluyen pruebas con texto en ingles |
| Licencia | Apache-2.0 (pesos originales); MIT para el codigo de conversion y runtime |
| Formato de pesos | `.mlpackage` (Core ML ML Program); tambien existen variantes MLX y Core AI en repos separados |
| Dimension de embedding | 384 |
| Batch size | 1 (fijo) |
| Entradas | `input_ids`: [1, 128], `attention_mask`: [1, 128] |
| Plataforma objetivo | macOS 14 / iOS 17; validado en macOS 27.2 |
| Tamano del repo | 0.3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, un encoder transformer con atención de secuencia completa pensado para tareas de representación y clasificación. El checkpoint original ruri-v3-70m de cl-nagoya está especializado en recuperación de información en japonés mediante embeddings de frases. Sobre ese checkpoint, el autor aplica pooling medio con conciencia de máscara y normalización L2, integrados en el grafo Core ML, de modo que la inferencia devuelve directamente un vector unitario.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original: esos datos no figuran en la información proporcionada. La conversión en sí no introduce nuevo entrenamiento ni fine-tuning; es una exportación determinista con formas fijas y batch 1. La validación numérica frente al checkpoint PyTorch original reporta una diferencia absoluta máxima de 2,1792948e-07 y una similitud coseno mínima de 0,999999999999, lo que confirma equivalencia funcional prácticamente exacta.

## Capacidades

- Generación de embeddings de frases en japonés para búsqueda semántica y recuperación de documentos.
- Recuperación con prefijos específicos: `検索クエリ: ` para consultas y `検索文書: ` para documentos.
- Pooling medio con máscara y normalización L2 incluidos en el grafo, con salida de 384 dimensiones.
- Similitud coseno directa entre consultas y documentos sin postprocesado adicional.
- Manejo de entradas vacías (probado por el autor).
- Procesamiento de texto en inglés (probado en la validación, aunque el modelo está orientado al japonés).
- Inferencia en dispositivo en Apple Silicon mediante Core ML, sin dependencia de red.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de embeddings, no un modelo generativo.
- No tiene visión, audio ni modo de pensamiento en esta exportación.

## Casos de uso

- Búsqueda semántica local en aplicaciones iOS: indexar documentos japoneses y recuperar los más relevantes en el dispositivo, sin enviar datos a un servidor, gracias a la exportación Core ML y a la ventana de 128 tokens por fragmento.
- Búsqueda en la app de notas o correo: fragmentar el contenido en trozos de hasta 128 tokens, generar embeddings con el prefijo `検索文書: ` y comparar por coseno con la consulta del usuario.
- Asistente de preguntas y respuestas sobre documentación interna: recuperar pasajes candidatos con ruri-v3-70m-coreml y pasarlos a un modelo generativo aparte, manteniendo la fase de recuperación totalmente offline.
- Deduplicación y agrupación de contenidos: calcular embeddings de titulares o párrafos japoneses y agrupar por similitud para detectar duplicados o temas relacionados.
- Clasificación y filtrado por similitud: comparar la representación de un texto con prototipos de categorías predefinidas para enrutar tickets o mensajes sin entrenar un clasificador adicional.
- Comparación frente a alternativas nativas de Apple: el repositorio GitHub incluye una app iOS que contrasta este modelo con NLContextualEmbedding de Apple, útil para decidir qué motor de embeddings usar en una app.
- Prototipado rápido en macOS: scripts de Python con el helper `ConvertedModel` para validar pipelines de recuperación antes de portar la lógica a Swift.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (como MMLU, JMTEB o similares) en la información disponible. El autor declara explícitamente que no reclama mejoras de calidad, robustez ni velocidad en dispositivo. Los únicos datos de rendimiento publicados son de equivalencia numérica frente al checkpoint original:

| Metrica | Valor |
|---|---|
| Diferencia absoluta maxima vs. PyTorch | 2,1792948e-07 |
| Similitud coseno minima vs. PyTorch | 0,999999999999 |
| Latencia en iPhone | no medida |
| Throughput | no disponible |

## Requisitos de hardware

- Inferencia en Apple Silicon (macOS 14 o superior; validado en macOS 27.2). No se ha medido el rendimiento en iPhone.
- Modelo de 70 M de parámetros en F32: el peso aproximado es de unos 280 MB, coherente con el tamaño del repo de 0,3 GB; cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon y en iPhone recientes.
- No requiere GPU dedicada ni CUDA; el runtime es Core ML sobre CPU, GPU o Neural Engine según la política del sistema.
- Despliegue mediante coremltools 9.0, NumPy, huggingface_hub y transformers 4.57.3 para la tokenización; el helper `ConvertedModel` gestiona tokenización y conversión de formas.
- El helper síncrono está pensado para scripts independientes; en un bucle de eventos asíncrono existente hay que adaptar su corrutina `predict` en lugar de anidar `asyncio.run`.
- Existen variantes MLX (para Apple Silicon con MLX 0.32.4) y Core AI en repositorios separados del mismo autor.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ruri-v3-70m-coreml | 70 M | 128 tokens (fijo) | Core ML | Apache-2.0 / MIT (codigo) | Conversion F32 del checkpoint de cl-nagoya; batch 1 |
| cl-nagoya/ruri-v3-70m | 70 M | contextos mas largos (no especificado) | safetensors (PyTorch) | Apache-2.0 | Checkpoint original; requiere PyTorch, no ejecuta en dispositivo |
| masahiroid/ruri-v3-70m-mlx | 70 M | no disponible | MLX | Apache-2.0 | Misma conversion para el runtime MLX de Apple |
| masahiroid/ruri-v3-70m-coreai | 70 M | no disponible | Core AI | Apache-2.0 | Misma conversion para el runtime Core AI |
| NLContextualEmbedding (Apple) | no disponible | no disponible | API del sistema | propietaria | Alternativa nativa comparada en la app del repositorio GitHub |

No se dispone de datos de benchmarks que permitan comparar la calidad de recuperación frente a otras alternativas.

## Limitaciones y advertencias

- Ventana de contexto fija de 128 tokens: los documentos más largos deben fragmentarse; el checkpoint original soporta secuencias más largas, pero esta exportación no las expone.
- Batch size fijo de 1: no apta para indexación masiva de alto rendimiento sin orquestar múltiples llamadas.
- Modelo orientado al japonés; el rendimiento en otros idiomas no está documentado más allá de pruebas puntuales con inglés.
- Es un encoder de embeddings, no un modelo generativo: no responde preguntas ni genera texto.
- No hay mediciones de latencia ni de rendimiento en iPhone; el autor no reclama mejoras de velocidad.
- Riesgo de alucinación no aplicable en el sentido generativo, pero la recuperación puede devolver pasajes poco relevantes si los fragmentos superan los 128 tokens o si la consulta no encaja con los prefijos previstos.
- Sesgos: no documentados en la información disponible; al heredar el checkpoint original, arrastra los sesgos de sus datos de entrenamiento, que no se detallan.
- La licencia Apache-2.0 permite uso comercial de los pesos; el código de conversión y runtime es MIT. Conviene revisar los scripts Python incluidos antes de ejecutarlos, como advierte el propio autor.
- Requiere macOS 14/iOS 17 o superior; no es portable a Linux, Windows ni GPU NVIDIA sin reconvertir el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-70m-coreml
- Checkpoint original: https://huggingface.co/cl-nagoya/ruri-v3-70m
- Variante MLX: https://huggingface.co/masahiroid/ruri-v3-70m-mlx
- Variante Core AI: https://huggingface.co/masahiroid/ruri-v3-70m-coreai
- Repositorio GitHub: https://github.com/masahiroid/ruri-coreml/tree/main
- Codigo de conversion: https://github.com/masahiroid/ruri-coreml/tree/main/ruri_coreml/
