# natzx94/embeddinggemma-300m-omoikane

## Resumen

EmbeddingGemma 300M Omoikane es una conversión de formato del modelo `google/embeddinggemma-300m`, un modelo de embeddings de 300 millones de parámetros desarrollado por Google. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales de Google, redistribuidos en un formato binario optimizado para el runtime Omoikane, una herramienta de inferencia local escrita en Rust. El autor de la conversión es el usuario de Hugging Face `natzx94`.

El modelo base es un transformer de tipo `gemma3_text` especializado en generación de embeddings de frases (pipeline `sentence-similarity`), con una tabla de embeddings de tokens de 262.144 entradas por 768 dimensiones y una cabeza sentence-transformers de dos capas densas. Su función es producir representaciones vectoriales densas para búsqueda semántica, agrupamiento y similitud entre textos.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes, y su interés principal reside en el formato de almacenamiento (int8 para la tabla de tokens, float16 para el resto) que permite mapear desde disco y leer únicamente las filas necesarias. La conversión declara mantener una similitud coseno de 0,999 o superior respecto al modelo original hasta 2.048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `gemma3_text` con cabeza sentence-transformers (dos capas densas) |
| Parametros totales | 300 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2.048 tokens verificados en la conversión (coseno >= 0,999) |
| Tipos de cuantizacion | tabla de embeddings de tokens en int8 con escala float32 por fila; resto de pesos en float16 |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | `tokens.i8` + `tokens.escala` (int8 + escalas) y `pesos.safetensors` (float16); `config.json` y `tokenizer.json` sin cambios |

## Arquitectura y entrenamiento

El modelo subyacente es `google/embeddinggemma-300m`, un transformer de la familia Gemma 3 (`gemma3_text`) adaptado a la producción de embeddings mediante una cabeza sentence-transformers. La arquitectura concreta de capas y atención no se detalla en la información disponible; el repositorio solo documenta la estructura de la tabla de embeddings de tokens (262.144 × 768) y las dos capas densas de la cabeza (`densa1.weight`, `densa2.weight`).

No se ha realizado ningún entrenamiento ni ajuste en esta conversión: el autor lo declara explícitamente. Por tanto, no hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO) en la información proporcionada. La innovación técnica del repositorio es exclusivamente de formato: la tabla de embeddings se guarda en int8 con una escala float32 por fila (simétrica, max/127), lo que permite mapearla desde disco y leer solo las filas de los tokens presentes en la entrada, mientras el resto de pesos permanece en float16.

## Capacidades

- Generación de embeddings de frases para similitud semántica (pipeline `sentence-similarity`).
- Búsqueda semántica y recuperación de documentos mediante vectores densos.
- Agrupamiento (clustering) y deduplicación de textos por proximidad vectorial.
- Cálculo de similitud coseno entre pares de textos, con fidelidad verificada frente al modelo original (>= 0,999 hasta 2.048 tokens).
- Carga eficiente en memoria mediante mapeo desde disco de la tabla de embeddings en int8.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no disponible.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de hasta 2.048 tokens y recuperar los más relevantes para una consulta mediante similitud coseno, aprovechando que la conversión preserva los vectores del modelo original.
- Deduplicación de corpus: calcular embeddings de entradas de un dataset y agrupar las que superen un umbral de similitud para eliminar duplicados antes del entrenamiento o la publicación.
- Motor de recomendación de contenido textual: vectorizar artículos o entradas de blog y sugerir los más próximos semánticamente a lo que el usuario está leyendo.
- Clasificación no supervisada de tickets de soporte: agrupar consultas por temática mediante clustering sobre los embeddings y asignar etiquetas a los grupos resultantes.
- Integración en herramientas locales de línea de comandos: el formato está pensado para el runtime Omoikane (`omoi model install --semantic`), de modo que encaja en flujos de trabajo de escritorio o servidor sin dependencias de Python.
- Filtrado previo en pipelines RAG: usar los embeddings como primera etapa de recuperación antes de un reranker o de un modelo generativo, reduciendo el número de documentos que se pasan al contexto del LLM.
- Detección de paráfrasis y plagio: comparar pares de textos y marcar como sospechosos aquellos con similitud coseno por encima de un umbral configurable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado por el autor es la fidelidad de la conversión: los vectores calculados con este formato coinciden con el modelo original a través de sentence-transformers con una similitud coseno de 0,999 o superior, hasta 2.048 tokens.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,4 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM; en CPU es viable con memoria RAM suficiente para mapear los ficheros.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU moderna (RTX 3060 en adelante, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: el formato está diseñado para el runtime Omoikane (`omoi model install --semantic`). Para usar los pesos originales con otras herramientas (sentence-transformers, vLLM, TGI, llama.cpp, Ollama) habría que recurrir al repositorio `google/embeddinggemma-300m`, no a esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| natzx94/embeddinggemma-300m-omoikane | 300 M | 2.048 tokens verificados | Omoikane (int8 + safetensors fp16) | Gemma Terms of Use | Hugging Face, 0 descargas |
| google/embeddinggemma-300m | 300 M | no disponible en esta ficha | safetensors (formato original) | Gemma Terms of Use | Hugging Face (modelo base) |
| Otros modelos de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación significativa disponible es con el modelo base del que deriva: misma arquitectura, mismos pesos y misma licencia, con la diferencia del formato de almacenamiento y del runtime de inferencia soportado.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación del modelo base `google/embeddinggemma-300m` se hereda íntegramente, incluidos sesgos y riesgos de representación.
- El autor no documenta sesgos conocidos ni evaluaciones de equidad; no disponible.
- Riesgo de alucinación: no aplica en sentido estricto al ser un modelo de embeddings, pero los vectores pueden producir recuperaciones semánticamente engañosas en dominios fuera de distribución.
- La ventana verificada es de 2.048 tokens; más allá de esa longitud no se garantiza la fidelidad de la conversión respecto al original.
- Idiomas soportados: no disponible en la información proporcionada.
- Licencia Gemma Terms of Use: el uso comercial está permitido bajo esas condiciones, pero queda restringido por la Gemma Prohibited Use Policy; es un Model Derivative y debe distribuirse con las mismas restricciones (ver `NOTICE`).
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni de mantenimiento.
- Depende del runtime Omoikane para aprovechar el formato; fuera de él, la conversión no aporta ventajas frente al modelo original.
- No se documentan datos de entrenamiento ni proceso de alineación del modelo base en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/natzx94/embeddinggemma-300m-omoikane
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Runtime Omoikane: https://github.com/marcmayol/omoikane
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
