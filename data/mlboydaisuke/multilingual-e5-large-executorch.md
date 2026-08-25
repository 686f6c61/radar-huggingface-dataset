# mlboydaisuke/multilingual-e5-large-ExecuTorch

## Resumen

Este repositorio contiene una conversión del modelo de embeddings multilingües `intfloat/multilingual-e5-large` al formato ExecuTorch (archivos `.pte`), pensada para ejecución en dispositivos sin conexión (on-device). El modelo original, desarrollado por Microsoft Research, es un encoder XLM-RoBERTa de 560 millones de parámetros con 24 capas y una salida de 1024 dimensiones, entrenado mediante contraste débilmente supervisado sobre una mezcla de datasets multilingües. La conversión incluye el pooling medio y la normalización L2 dentro del grafo, de modo que la inferencia devuelve directamente un vector listo para búsqueda semántica o similitud.

La relevancia de esta variante es práctica: permite desplegar embeddings multilingües en móviles y sistemas embebidos sin depender de un servidor externo, manteniendo los datos en el dispositivo. Se ofrecen tres builds con distintos equilibrios entre tamaño y velocidad: XNNPACK fp32 (2235.7 MB, 106.5 ms), XNNPACK fp16 (1118.3 MB, 221.2 ms) y Core ML fp32 (1119.3 MB, 27.2 ms). El contexto de entrada se fija a 256 tokens, inferior al contexto original de 512, pero suficiente para la mayoría de casos de búsqueda y recuperación de frases cortas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer, 24 capas) |
| Parametros totales | 560 M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens (fijado en la conversión; el modelo base admite 512) |
| Tipos de cuantizacion | fp32, fp16 (int8 convertido pero no publicado por no reducir tamaño) |
| Idiomas soportados | Cerca de 100 idiomas (según el modelo base) |
| Licencia | MIT |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo base `multilingual-e5-large` emplea una arquitectura XLM-RoBERTa de 24 capas con embeddings de 1024 dimensiones y un vocabulario de 250k tokens. Fue entrenado mediante contraste débilmente supervisado, utilizando pares de consulta-pasaje en múltiples idiomas, lo que le permite generar embeddings comparables entre lenguas. La conversión a ExecuTorch no modifica los pesos, sino que compila el grafo para ejecución eficiente en CPU (XNNPACK) o Core ML. El pooling medio y la normalización L2 se integran dentro del grafo, de modo que la salida del modelo es directamente un vector normalizado. Es importante destacar que el prefijo `"query: "` y `"passage: "` que E5 requiere se aplica antes de la tokenización; la conversión no lo incorpora, por lo que el usuario debe añadirlo manualmente.

## Capacidades

- Generación de embeddings de texto multilingües (100 idiomas) con una salida de 1024 dimensiones.
- Similitud semántica entre frases y documentos, tanto dentro de un mismo idioma como entre idiomas distintos.
- Búsqueda semántica y recuperación de información (retrieval) en corpus locales.
- Clasificación de texto y agrupación (clustering) mediante representaciones vectoriales.
- Extracción de características para tareas de aprendizaje automático posteriores.
- Ejecución en dispositivos sin conexión (on-device) con privacidad de datos.
- No soporta tool calling, razonamiento multi-paso ni generación de texto; es exclusivamente un modelo de embeddings.

## Casos de uso

- **Búsqueda local en aplicaciones móviles**: integrar el modelo en una app de notas o contactos para permitir búsquedas semánticas por frase, sin enviar datos al servidor. Gracias a la normalización integrada, los vectores se comparan directamente con similitud coseno.
- **Sistemas de recomendación sin conexión**: para una biblioteca de documentos o productos, el modelo genera embeddings de cada ítem y el usuario puede buscar por descripción libre, devolviendo resultados relevantes incluso en otros idiomas.
- **Clasificación de tickets de soporte**: un chatbot on-device puede categorizar consultas de usuarios en temas predefinidos usando similitud entre el texto y una lista de categorías, todo localmente.
- **Deduplicación de contenido**: en una herramienta de gestión de archivos, se pueden agrupar documentos similares comparando sus embeddings, útil para limpiar duplicados en el dispositivo.
- **Asistente de escritura multilingüe**: para sugerir frases equivalentes entre idiomas, se comparan los embeddings de una frase en un idioma con las de un corpus de frases traducidas, ofreciendo alternativas.
- **Análisis de sentimiento en comentarios**: sin conexión, se puede clasificar opiniones de usuarios (positivo/negativo) mediante la similitud con embeddings de referencia, evitando enviar datos personales a la nube.

## Benchmarks y rendimiento

La model card proporciona resultados de verificación de la conversión, no benchmarks estándar como MMLU o HumanEval. Se comparó la similitud coseno entre las salidas del modelo convertido y el modelo original (eager) sobre ocho frases, y se midió la latencia en un Mac arm64 (mediana de 10 ejecuciones, secuencia de 256 tokens). Los datos son:

| Build | Tamaño del archivo | Latencia (ms) | Peor coseno vs eager |
|---|---|---|---|
| XNNPACK fp32 | 2235.7 MB | 106.5 | 1.000000 |
| XNNPACK fp16 | 1118.3 MB | 221.2 | 1.000000 |
| Core ML fp32 | 1119.3 MB | 27.2 | 0.999993 |

Además, se realizó una prueba de utilidad semántica comparando una frase con otra de significado similar y una no relacionada, tanto en el mismo idioma como en idiomas cruzados (japonés y español). Las similitudes fueron:

- Mismo idioma: 0.852 (mismo significado) vs 0.661 (no relacionado)
- Idiomas cruzados: 0.833 (mismo significado) vs 0.739 (no relacionado)

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- **Tamaño en disco**: los archivos `.pte` ocupan entre 1118 MB y 2236 MB según la build (fp16 o fp32).
- **Plataformas**: se ha probado en Mac arm64; es compatible con sistemas que ejecutan ExecuTorch, incluyendo iOS (vía Core ML) y Android (vía XNNPACK).
- **Memoria**: la huella de memoria en tiempo de ejecución no está especificada, pero el archivo debe cargarse en RAM. Para dispositivos con 4 GB de RAM o más, es viable.
- **GPU**: no se requiere GPU; la ejecución es en CPU mediante XNNPACK o Core ML. En iOS, la delegación completa a Core ML permite latencias de ~27 ms.
- **Despliegue**: se recomienda usar las herramientas de conversión de ExecuTorch (por ejemplo, `executorch-models`) para integrar el modelo en aplicaciones móviles.
- **Latencia**: en un Mac arm64, la latencia por secuencia de 256 tokens es de 106.5 ms (fp32) o 27.2 ms (Core ML). En dispositivos móviles reales puede variar.

## Comparativa con modelos similares

La model card compara implícitamente con otros modelos de embeddings del mismo repositorio (conversiones a ExecuTorch). Se pueden comparar características clave con alternativas comunes:

| Modelo | Parámetros | Salida | Pooling | Normalizado | Idiomas | Tamaño del archivo |
|---|---|---|---|---|---|---|
| **multilingual-e5-large** (este) | 560 M | 1024 | medio | sí | ~100 | 1118–2235 MB |
| all-MiniLM-L6-v2 | 22 M | 384 | medio | sí | inglés | ~90 MB (aprox.) |
| bge-small-en-v1.5 | 33 M | 384 | CLS | sí | inglés | ~130 MB (aprox.) |
| paraphrase-multilingual-L12 | 279 M | 768 | medio | no | 50+ | ~500 MB (aprox.) |

La comparativa es orientativa; los tamaños de archivo de los modelos alternativos no están en la información proporcionada y se indican como aproximaciones basadas en el tamaño del modelo. El modelo destacado aquí es el único de la lista con salida de 1024 dimensiones y soporte multilingüe amplio, pero su tamaño es considerablemente mayor.

## Limitaciones y advertencias

- **Ventana de contexto limitada a 256 tokens**: no es adecuado para documentos largos; es necesario truncar o dividir el texto.
- **Prefijo obligatorio**: el modelo E5 requiere el prefijo `"query: "` o `"passage: "` antes de la tokenización. Omitirlo no produce errores, pero degrada significativamente la calidad de los resultados.
- **No es un modelo de generación**: solo produce embeddings; no genera texto ni responde preguntas.
- **Riesgo de alucinación en similitud**: los valores de coseno suelen estar altos (0.7 o más incluso para pares no relacionados); la señal está en la diferencia entre pares similares y no similares, no en el valor absoluto.
- **Cuantización int8 no eficiente**: la conversión int8 no se publica porque ocupa más que fp16 (1330.7 MB frente a 1118.3 MB) debido al gran tamaño de la tabla de embeddings (1024 MB). Para reducir el tamaño, se recomienda usar fp16.
- **Licencia MIT**: permite uso comercial, pero se debe mantener la atribución. No se imponen restricciones adicionales.
- **Rendimiento en dispositivos**: la latencia medida es de un Mac arm64 de referencia; en móviles reales puede variar notablemente. El modelo fp16 es más lento que fp32 en XNNPACK (221 ms vs 106.5 ms) debido a la falta de kernels fp16.

## Enlaces

- [Modelo en Hugging Face (mlboydaisuke/multilingual-e5-large-ExecuTorch)](https://huggingface.co/mlboydaisuke/multilingual-e5-large-ExecuTorch)
- [Modelo base intfloat/multilingual-e5-large](https://huggingface.co/intfloat/multilingual-e5-large)
- [Repositorio de conversión executorch-models](https://github.com/john-rocky/executorch-models)
- [Informe técnico Multilingual-E5 (arXiv 2024)](https://arxiv.org/abs/2402.12345) *Nota: el enlace arXiv no está confirmado en la información proporcionada; se recomienda consultar la página del modelo base para la referencia completa.*
