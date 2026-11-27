# eightman999/modernbert-ja-130m-coreml-ane

## Resumen

ModernBERT-ja-130m Core ML / Apple Neural Engine es una conversión optimizada del modelo encoder `sbintuitions/modernbert-ja-130m` para ejecutarse sobre la Apple Neural Engine (ANE) mediante Core ML. Lo publica el usuario `eightman999` en Hugging Face y no es un modelo nuevo entrenado desde cero, sino una reimplementación del grafo computacional en formato `mlprogram` (fp16, objetivo macOS 26) pensada para inferencia de baja latencia en hardware Apple. El modelo base es un ModernBERT japonés de 130 millones de parámetros, una arquitectura encoder transformer con atención de ventana deslizante y RoPE, orientada a tareas de comprensión del lenguaje más que a generación autoregresiva.

La relevancia de esta conversión está en el rendimiento en dispositivo: según la model card, alcanza 5,88 ms de latencia mediana y 170 req/s con secuencias de 128 tokens en un M2 Max de 32 GB, con una similitud coseno de 0,999950 frente a la referencia en PyTorch FP32. Para secuencias de 1024 tokens la latencia sube a 49,37 ms (20,3 req/s). Esto lo hace útil para pipelines de embeddings, clasificación o extracción de características en aplicaciones macOS que necesitan ejecutarse localmente sin GPU dedicada.

El modelo no incluye cabezas de tarea (es un encoder que devuelve `last_hidden_state` de dimensión 512) y solo soporta longitudes de secuencia fijas de 128, 256, 512 y 1024 tokens. La licencia es MIT, heredada del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (atención de ventana deslizante local + atención global con split-head), convertido a Core ML `mlprogram` |
| Parametros totales | 130 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens máximo; buckets fijos de 128, 256, 512 y 1024 |
| Tipos de cuantizacion | fp16 (pesos y activaciones en la conversión Core ML); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | japonés (ja) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` / `.mlmodelc` (Core ML); el modelo base en safetensors |
| Dimension de embedding de salida | 512 |
| Layout de entrada | `(B, C, 1, S)` channels-first con proyecciones `Conv2d(1x1)` |
| Objetivo de despliegue | macOS 26, `compute_units=CPU_AND_NE` |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

El modelo base `sbintuitions/modernbert-ja-130m` es un encoder ModernBERT adaptado al japonés. ModernBERT sustituye la atención completa por una combinación de capas con atención local de ventana deslizante y capas con atención global, e incorpora RoPE en lugar de embeddings posicionales absolutos, además de mejoras de eficiencia como fusión de operaciones y LayerNorm sin sesgo. El entrenamiento del modelo base no se detalla en la información proporcionada (número de tokens, composición del corpus, si hubo ajuste con datos japoneses específicos): no disponible.

La conversión a Core ML introduce varias optimizaciones para mantener la atención en la SRAM on-chip de la ANE: layout 4D channels-first con proyecciones `Conv2d(1x1)`, atención local por bloques (`block_size=128`, `window=128`) y atención global con split-head, RoPE precalculado como `cos`/`sin` estáticos, máscaras locales estáticas y el factor `1/sqrt(head_dim)` plegado en los pesos de `Wq`. La salida es `last_hidden_state` en fp16 con forma `[1, S, 512]` para cada bucket de secuencia. No se menciona entrenamiento adicional ni fine-tuning durante la conversión; es una reimplementación de inferencia.

## Capacidades

- Extracción de representaciones contextuales (embeddings) de texto en japonés e inglés; devuelve `last_hidden_state` de 512 dimensiones por token.
- Base para tareas de comprensión del lenguaje (clasificación de secuencias, NER, similarity, reranking) previa adición de cabezas de tarea, ya que el artefacto publicado no incluye cabezas.
- Procesamiento de secuencias de hasta 1024 tokens con buckets fijos de 128, 256, 512 y 1024.
- Inferencia en la Apple Neural Engine con `compute_units=CPU_AND_NE`, sin necesidad de GPU dedicada.
- Compatibilidad con el tokenizador de `sbintuitions/modernbert-ja-130m` vía `transformers.AutoTokenizer`.
- No soporta generación autoregresiva, tool calling, agentes, visión ni audio: es un encoder, no un modelo causal.

## Casos de uso

- Búsqueda semántica local en macOS: usar el `last_hidden_state` como embeddings para indexar y recuperar documentos en japonés e inglés con latencia de milisegundos, sin enviar datos a la nube.
- Clasificación de texto en aplicaciones de escritorio: añadir una cabeza lineal sobre el embedding del token `[CLS]` o pooled para moderación, categorización o detección de intención, aprovechando los 170 req/s a 128 tokens.
- Reranking de resultados: puntuar pares consulta-documento con un clasificador ligero sobre las representaciones del encoder, ejecutándose en el propio Mac del usuario.
- Extracción de entidades (NER) en pipelines de documentos japoneses: procesar lotes de 512 o 1024 tokens con latencias de 19-49 ms por secuencia en M2 Max.
- Preprocesamiento en aplicaciones de accesibilidad o productividad: análisis semántico en tiempo real de texto introducido por el usuario sin salir del dispositivo, con implicaciones de privacidad favorables.
- Prototipado de investigación en NLP japonés sobre hardware Apple: validar pipelines de embeddings o clasificación antes de escalar a GPUs, con paridad numérica alta (coseno > 0,994 frente a PyTorch FP32).
- Filtrado y deduplicación de corpus: generar embeddings de pasajes cortos a alta tasa (170 req/s a 128 tokens) para clustering o near-duplicate detection en local.

## Benchmarks y rendimiento

Datos de la model card en Apple M2 Max 32 GB, macOS 26.6.2, `CPU_AND_NE`:

| seq_len | Latencia mediana | Throughput | Carga `.mlmodelc` | Similitud coseno vs PyTorch FP32 | Error absoluto medio |
|---:|---:|---:|---:|---:|---:|
| 128 | 5,88 ms | 170,0 req/s | 0,056 s | 0,999950 | 0,0236 |
| 256 | 8,05 ms | 124,3 req/s | 0,059 s | 0,994968 | 0,0400 |
| 512 | 19,42 ms | 51,5 req/s | 0,068 s | 0,999969 | 0,0182 |
| 1024 | 49,37 ms | 20,3 req/s | 0,079 s | 0,999973 | 0,0176 |

No se han publicado resultados de benchmarks de tareas downstream (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (M-series); las pruebas se hicieron en un M2 Max de 32 GB.
- Memoria: el repo ocupa 1,1 GB; el modelo en fp16 requiere aproximadamente 260 MB de pesos más activaciones, por lo que cabe holgadamente en cualquier Mac con Apple Silicon.
- No requiere GPU dedicada (A100, H100, RTX 4090 no aplican); está diseñado exclusivamente para ANE/CPU vía Core ML.
- Despliegue: Core ML (`coremltools`, `MLModel` con `ComputeUnit.CPU_AND_NE`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que no ejecutan `mlprogram`.
- Latencia y throughput: ver tabla de benchmarks (5,88-49,37 ms según longitud de secuencia en M2 Max).
- Requiere macOS 26 como objetivo de compilación del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| eightman999/modernbert-ja-130m-coreml-ane | 130 M | 1024 | Core ML / ANE (macOS) | MIT | Optimizado para Apple Silicon; salida 512 dim |
| sbintuitions/modernbert-ja-130m | 130 M | no disponible en la información | safetensors / PyTorch | MIT | Modelo base; requiere GPU o CPU para inferencia |
| Otros encoders japoneses tipo BERT base | ~110-130 M | 512 típicamente | safetensors / PyTorch | variable | No hay datos de rendimiento comparables en la información disponible |

No se dispone de datos de benchmarks de tareas que permitan una comparación cuantitativa con alternativas; la comparación anterior es estructural.

## Limitaciones y advertencias

- Es un encoder: no genera texto ni sirve para tareas generativas, tool calling o razonamiento multi-paso.
- Solo acepta longitudes de secuencia fijas (128, 256, 512, 1024); hay que rellenar o truncar al bucket correspondiente, lo que puede desperdiciar cómputo.
- Exclusivo de Core ML y Apple Silicon; no se puede desplegar en servidores Linux, GPUs NVIDIA ni en la mayoría de plataformas cloud.
- No incluye cabezas de tarea: para clasificación o NER hay que entrenar y añadir capas propias sobre `last_hidden_state`.
- Riesgo de sesgos y alucinaciones heredado del modelo base; no se documentan evaluaciones de sesgo en la información disponible.
- El rendimiento multilingüe se limita a japonés e inglés; otros idiomas no están garantizados.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo upstream `sbintuitions/modernbert-ja-130m`.
- Repo con 0 descargas y 0 likes: poca validación comunitaria; la paridad numérica reportada es del autor y no ha sido replicada de forma independiente.
- La conversión fija fp16 puede introducir pequeñas desviaciones numéricas (error absoluto medio de hasta 0,04 en secuencias de 256 tokens).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eightman999/modernbert-ja-130m-coreml-ane
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
- Repositorio de Core ML Tools (referencia de despliegue): https://github.com/apple/coremltools
