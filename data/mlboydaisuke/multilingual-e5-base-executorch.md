# mlboydaisuke/multilingual-e5-base-ExecuTorch

## Resumen

`mlboydaisuke/multilingual-e5-base-ExecuTorch` es una conversión a ExecuTorch del modelo de embeddings multilingües `intfloat/multilingual-e5-base`, desarrollada por el usuario mlboydaisuke. El modelo original, publicado por Microsoft, genera vectores densos de 768 dimensiones para texto en más de 100 idiomas, de modo que representaciones de distintas lenguas quedan alineadas en el mismo espacio semántico. Esta versión está optimizada para inferencia en el dispositivo (on-device) mediante el runtime ExecuTorch de PyTorch, con builds para XNNPACK (CPU portátil) y Core ML (iOS), lo que permite búsqueda y recuperación de información sin enviar datos a un servidor.

La conversión mantiene la arquitectura original: un modelo XLM-RoBERTa base de 278 millones de parámetros, 12 capas, vocabulario de 250k tokens y salida de 768 dimensiones. El grafo exportado incluye el pooling mean y la normalización L2 dentro del propio `.pte`, por lo que la salida es directamente un vector listo para comparar. El modelo requiere el uso de prefijos `"query: "` y `"passage: "` en la entrada, como en el original. Es una opción relevante para aplicaciones móviles y de borde que necesitan embeddings multilingües con latencia baja y privacidad total.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (12 capas, 768 hidden, 250k vocabulario) |
| Parametros totales | 278 M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (tamaño de entrada fijo `[1, 256]`) |
| Tipos de cuantizacion | fp32, fp16, int8 (int8 no publicado por ineficiencia) |
| Idiomas soportados | más de 100 idiomas (según el modelo original) |
| Licencia | MIT |
| Formato de pesos | `.pte` (ExecuTorch), con pesos en XNNPACK y Core ML |

## Arquitectura y entrenamiento

El modelo base es `intfloat/multilingual-e5-base`, un transformer de tipo XLM-RoBERTa con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. Se entrenó en dos fases: primero con 5,97 mil millones de pares de texto débilmente supervisados procedentes de fuentes como Wikipedia, mC4 y CC News, y después con un ajuste fino supervisado sobre pares de alta calidad. El resultado es un espacio de embeddings multilingüe alineado, de modo que frases con el mismo significado en distintas lenguas quedan cerca.

La conversión a ExecuTorch se realiza mediante `torch.export` seguido de `to_edge_transform_and_lower(partitioner)`, y el grafo resultante incluye el mean pooling y la normalización L2 internamente. El modelo exportado no incluye la lógica de prefijos (query/passage), que debe aplicarse antes de la tokenización. En la verificación se observa que el modelo convertido mantiene una similitud coseno de 0.999999 (fp32) y 0.999988 (Core ML) frente al modelo eager, con una separación correcta entre pares relacionados y no relacionados en pruebas de parafraseo dentro de la misma lengua y entre lenguas.

## Capacidades

- Generación de embeddings semánticos multilingües: produce un vector de 768 dimensiones comparable entre idiomas.
- Búsqueda semántica y recuperación de información: adecuado para sistemas de ranking por similitud coseno.
- Similitud de frases y detección de duplicados: permite comparar textos de manera eficiente.
- Clasificación de textos multilingüe: puede usarse como extractor de características para modelos de clasificación.
- Agrupación (clustering) de documentos: útil para organizar colecciones de texto en distintos idiomas.
- Inferencia en el dispositivo: ejecutable en CPU (XNNPACK) y en iOS (Core ML) sin conexión a internet.
- No es un modelo generativo: no produce texto, solo vectores de representación.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: permite indexar notas, correos o documentos locales y recuperarlos con consultas en lenguaje natural, sin enviar datos al servidor. El modelo de 278 M y la latencia de 6,8 ms en Core ML hacen que sea viable en tiempo real en un iPhone.
- Recuperación de información multilingüe: un empleado puede buscar en la documentación interna de la empresa en español y encontrar resultados en inglés, francés o japonés, gracias a la alineación de los embeddings entre idiomas.
- Clasificación automática de tickets de soporte: extraer el embedding de cada ticket y alimentar un clasificador lineal para categorizarlo en temas predefinidos. La normalización L2 y el pooling integrados simplifican el pipeline.
- Detección de duplicados en bases de conocimiento: comparar embeddings de artículos o preguntas frecuentes para identificar entradas redundantes en varios idiomas.
- Recomendación de contenidos basada en similitud: calcular la similitud coseno entre el historial de lectura del usuario y los artículos disponibles, todo en el dispositivo, sin depender de un servicio externo.
- Chatbots con memoria semántica local: guardar los embeddings de las interacciones anteriores para recuperar información relevante de la conversación en un sistema de retrieval aumentado, manteniendo los datos privados en el terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MTEB, MIRACL, etc.) en la información disponible. La model card incluye una verificación de calidad y latencia en un Mac arm64 con una secuencia de 256 tokens:

| Build | Fichero | Tamaño | Latencia (mediana) | Worst cosine vs eager |
|---|---|---|---|---|
| XNNPACK fp32 | `embed_multilingual_e5_base_xnnpack_fp32.pte` | 1110,0 MB | 40,9 ms | 1,000000 |
| XNNPACK fp16 | `embed_multilingual_e5_base_xnnpack_fp16.pte` | 555,2 MB | 88,6 ms | 0,999999 |
| Core ML fp32 | `embed_multilingual_e5_base_coreml_all.pte` | 555,4 MB | 6,8 ms | 0,999988 |
| Eager fp32 | (PyTorch) | — | 32,9 ms | — |

La separación entre pares relacionados y no relacionados se mantiene: en el mismo idioma la similitud coseno es 0,848 (mismo significado) frente a 0,669 (no relacionado); entre idiomas, 0,781 frente a 0,701. El autor recomienda prestar atención al margen de diferencia, no al valor absoluto, porque E5 tiende a producir similitudes altas en general.

## Requisitos de hardware

- El modelo completo en fp32 pesa 1110 MB, en fp16 555 MB y en int8 855 MB. En GPU, cabe en cualquier tarjeta con más de 2 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, etc.), aunque el objetivo es su ejecución en CPU o NPU.
- En iOS, la build Core ML ofrece una latencia de 6,8 ms por secuencia de 256 tokens, adecuada para aplicaciones en tiempo real.
- En Android, la build XNNPACK fp32 es la más rápida (40,9 ms) pero consume el doble de almacenamiento que fp16; fp16 reduce el tamaño a la mitad pero es más lento (88,6 ms) porque XNNPACK no tiene kernels fp16 para este grafo.
- No se requieren GPUs dedicadas para servidores: el modelo está pensado para ejecutarse en CPU de dispositivos móviles o portátiles. Para despliegue en servidor, se puede usar el modelo original con bibliotecas como sentence-transformers o vLLM.
- Opciones de despliegue: ExecuTorch con XNNPACK (CPU) y Core ML (iOS). No es compatible con llama.cpp, Ollama o TGI porque no es un modelo generativo.
- La latencia en el dispositivo depende del hardware; los valores de la tabla se midieron en un Mac arm64 y sirven como referencia relativa, no como cifra de producción.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Como referencia estructural:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| multilingual-e5-base (original) | 278 M | 512 (original) | 100+ | MIT | PyTorch, safetensors |
| multilingual-e5-small | 118 M | 512 | 100+ | MIT | PyTorch |
| all-MiniLM-L6-v2 | 22 M | 256 | 1 (en) | Apache 2.0 | PyTorch |
| bge-small-en-v1.5 | 33 M | 512 | 1 (en) | MIT | PyTorch |

La versión ExecuTorch se diferencia por estar lista para on-device con pooling y normalización integrados, mientras que los modelos originales requieren un paso de pooling externo. El modelo base original de Microsoft tiene la misma arquitectura y rendimiento, pero no está exportado a `.pte`.

## Limitaciones y advertencias

- El modelo requiere el prefijo `"query: "` o `"passage: "` en el texto de entrada. Si se omite, no da error, pero el vector resultante recupera peor. El prefijo debe aplicarse antes de la tokenización, fuera del grafo.
- No es un modelo generativo: solo produce embeddings. No se puede usar para chat, completado de texto o generación de respuestas.
- El contexto está limitado a 256 tokens en la conversión ExecuTorch. Textos más largos deben truncarse o dividirse en segmentos.
- La cuantización int8 no es eficiente en este modelo: el tamaño resultante (855,6 MB) supera al fp16 (555,2 MB) porque la tabla de embeddings (768 MB) no se cuantifica. En general, int8 solo es rentable cuando la tabla de embeddings es inferior a un tercio del peso total.
- XNNPACK fp16 es más lento que fp32 (88,6 ms frente a 40,9 ms) porque el runtime inserta conversiones de precisión; no se recomienda si se prioriza la latencia.
- La licencia MIT permite uso comercial y modificación, pero el modelo original de Microsoft tiene una licencia MIT según HuggingFace; se recomienda verificar la licencia del modelo base en el momento del despliegue.
- No hay datos sobre sesgos o alucinaciones, ya que se trata de un modelo de embeddings, no de generación. No obstante, los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento (Wikipedia, mC4, etc.).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/multilingual-e5-base-ExecuTorch
- Modelo original: https://huggingface.co/intfloat/multilingual-e5-base
- Colección ExecuTorch Model Zoo: https://huggingface.co/collections/mlboydaisuke/executorch-model-zoo
- Repositorio de conversión: https://github.com/john-rocky/executorch-models
- Documentación de ExecuTorch: https://pytorch.org/executorch
