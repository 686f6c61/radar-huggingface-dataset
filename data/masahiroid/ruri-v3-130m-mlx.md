# masahiroid/ruri-v3-130m-mlx

## Resumen

`ruri-v3-130m-mlx` es una conversión no oficial al formato MLX del modelo de embeddings de texto en japonés `cl-nagoya/ruri-v3-130m`, desarrollado originalmente por el proyecto Ruri de la Universidad de Nagoya (cl-nagoya). La conversión la publica el usuario masahiroid y su propósito es permitir la ejecución nativa del modelo en hardware de Apple Silicon (chips M-series) mediante la librería `mlx-embeddings`, en lugar de depender de PyTorch o sentence-transformers.

Se trata de un encoder basado en la arquitectura ModernBERT con 132.140.544 parámetros (unos 130 millones) especializado en similitud semántica y extracción de características (*feature extraction*) para japonés. El repositorio ocupa 0,3 GB, se distribuye en precisión bfloat16 sin cuantización, con pesos en formato safetensors compatibles con MLX y bajo licencia Apache 2.0.

Su relevancia reside en que ofrece una vía ligera y eficiente para tareas de recuperación, búsqueda semántica y agrupamiento sobre texto en japonés directamente en Macs con silicio de Apple, un escenario donde MLX está específicamente optimizado. Al ser una conversión de formato y no un reentrenamiento, el rendimiento semántico del modelo subyacente se mantiene, pero conviene tener en cuenta su carácter no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 132.140.544 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | bfloat16 (sin cuantizacion) en esta conversion; no disponible otras opciones |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base `cl-nagoya/ruri-v3-130m` es un encoder de la familia ModernBERT, una arquitectura transformer optimizada para tareas de comprensión y representación de texto que sustituye el esquema clásico por mecanismos como embeddings posicionales rotatorios (RoPE) y una alternancia de capas de atención local y global, lo que reduce el coste computacional en secuencias largas. Al tratarse de un modelo de embeddings, su salida son vectores densos (representaciones semánticas) y no texto generado.

Esta publicación concreta no entrena el modelo desde cero: es una conversión del checkpoint original al runtime MLX mediante el paquete `mlx-embeddings`. Por tanto, no modifica los pesos ni el proceso de entrenamiento del modelo base. Los detalles sobre volumen de tokens, composición del dataset, idioma del corpus de entrenamiento y si hubo fases de ajuste (RLHF, DPO u otras) no están disponibles en la información proporcionada.

## Capacidades

- Generación de embeddings de texto (representaciones vectoriales) para japonés.
- Extracción de características (*feature extraction*) a partir de texto.
- Cálculo de similitud semántica entre frases o documentos (cosine similarity sobre los embeddings).
- Recuperación semántica y búsqueda por similitud.
- Agrupamiento (clustering) y deduplicación de textos.
- Soporte de prefijos de tarea en las entradas (por ejemplo, `クエリ:` para consultas y `文章:` para documentos), tal como se muestra en los ejemplos de uso de la model card.
- Ejecución nativa en Apple Silicon mediante MLX.
- No dispone de capacidades generativas, de tool calling, de razonamiento multi-paso ni multimodales, ya que es un modelo de embeddings y no un modelo de lenguaje generativo.

## Casos de uso

- Búsqueda semántica en japonés: indexar un corpus de documentos japoneses y recuperar los pasajes más relevantes ante una consulta dada, usando la similitud coseno entre el embedding de la consulta y el de cada documento.
- Recuperación aumentada por generación (RAG): actuar como recuperador en un pipeline RAG para aplicaciones de preguntas y respuestas en japonés, alimentando los fragmentos recuperados a un modelo generativo.
- Deduplicación y agrupamiento de contenido: agrupar noticias, tickets o reseñas en japonés por similitud semántica para detectar duplicados o temas recurrentes.
- Clasificación de textos: usar los embeddings como características de entrada para clasificadores ligeros (por ejemplo, detección de intención o categorización de documentos).
- Sistemas de recomendación por contenido: calcular similitud entre elementos textuales (artículos, productos descritos en japonés) para sugerir ítems relacionados.
- Filtrado y moderación por similitud: comparar textos entrantes con patrones o ejemplos de referencia para señalar contenido semejante.
- Despliegue local en Mac: ejecutar el modelo directamente en un Mac con chip M-series para prototipos, herramientas de escritorio o procesamiento de datos sensible sin salir del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: en bfloat16, el modelo ocupa aproximadamente 264 MB de pesos, por lo que la huella en memoria es inferior a 0,5 GB incluyendo el tokenizador y las activaciones.
- GPU/plataformas recomendadas: la conversión está pensada para Apple Silicon (chips de la serie M) mediante MLX. El modelo base puede ejecutarse en CPU y en GPU NVIDIA mediante PyTorch/sentence-transformers.
- Cabe con holgura en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en hardware integrado; no requiere aceleradores de gama alta como A100 o H100.
- Opciones de despliegue: `mlx-embeddings` (esta conversión) sobre Apple Silicon; el modelo base con `sentence-transformers` o `transformers` en otros entornos. No se proporciona información sobre despliegue con vLLM, TGI, Ollama o llama.cpp para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato/runtime |
|---|---|---|---|---|---|
| masahiroid/ruri-v3-130m-mlx (este) | 132.140.544 | no disponible | japones | Apache 2.0 | safetensors / MLX |
| cl-nagoya/ruri-v3-130m (base) | 130M aprox. | no disponible | japones | Apache 2.0 | safetensors / PyTorch |
| Otras alternativas de embeddings japoneses de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia principal entre este modelo y su base es exclusivamente el formato y el runtime de ejecución (MLX frente a PyTorch), sin cambios en los pesos ni en la arquitectura. No se dispone de datos de rendimiento comparado que permitan situar el modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Cobertura lingüística limitada: el modelo está entrenado únicamente para japonés; no se debe esperar un rendimiento fiable en otros idiomas.
- Es una conversión no oficial: no ha sido publicada por el equipo de Ruri ni por cl-nagoya, por lo que no cuenta con su validación. La model card lo indica de forma explícita.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; solo genera embeddings.
- Riesgo de sesgos: al no estar disponible la composición del dataset de entrenamiento del modelo base, no es posible evaluar sesgos conocidos ni su magnitud.
- Riesgo de similitud espuria: como cualquier modelo de embeddings, puede producir puntuaciones de similitud altas entre textos semánticamente distintos; conviene validar los umbrales en el dominio concreto.
- Longitud de contexto desconocida: la model card no especifica el máximo de tokens por entrada, por lo que debe comprobarse antes de usarlo con documentos largos.
- Estado de adopción: el repositorio registra 0 descargas y 0 "likes", de modo que carece de validación por parte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, siempre que se conserven los avisos de copyright y licencia correspondientes. Debe verificarse igualmente la licencia y las condiciones del modelo base original.

## Enlaces

- [masahiroid/ruri-v3-130m-mlx en HuggingFace](https://huggingface.co/masahiroid/ruri-v3-130m-mlx)
- [Modelo base cl-nagoya/ruri-v3-130m](https://huggingface.co/cl-nagoya/ruri-v3-130m)
- [MLX (GitHub)](https://github.com/ml-explore/mlx)
- [mlx-embeddings (GitHub)](https://github.com/Blaizzy/mlx-embeddings)
