# PiterQ/mmlw-roberta-large-qnn-v73-ctx

## Resumen

`PiterQ/mmlw-roberta-large-qnn-v73-ctx` es un artefacto de despliegue, no un modelo entrenado desde cero: se trata de un contexto precompilado de ONNX Runtime para el Execution Provider QNN de Qualcomm, generado a partir del encoder polaco `sdadas/mmlw-retrieval-roberta-large-v2`. El autor, PiterQ, ha exportado el modelo original a ONNX en fp32 y lo ha compilado para ejecutarse en la NPU Hexagon HTP V73 del SoC SM8550 (Snapdragon 8 Gen 2), con cálculo interno en fp16. El objetivo es la generación de embeddings de texto en el dispositivo para la app Android PLaiA (búsqueda de conocimiento sobre documentos del usuario).

El modelo base es un RoBERTa-large adaptado a recuperación de información en polaco, desarrollado por Sławomir Dadas (OPI PIB) dentro de la familia MMLW. Produce vectores de 1024 dimensiones mediante CLS pooling y normalización L2, con una ventana de entrada fija de 512 tokens. La relevancia de esta ficha es doble: por un lado documenta el primer paso práctico para llevar un encoder de recuperación de 435 millones de parámetros a NPU móvil; por otro, ilustra las restricciones reales de este tipo de artefactos (SoC único soportado, dependencia del runtime propietario de Qualcomm, licencia Gemma heredada).

No hay datos publicados de benchmarks estándar (MMLU, MTEB, etc.) en la información disponible. La única métrica de calidad reportada es la similitud coseno frente al modelo fp32 en CPU: 0,9999 como mínimo sobre 120 pasajes con padding a 512 tokens, y paridad de hit@10 en una prueba de recuperación ejecutada en un Galaxy S23.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa-large (base: `sdadas/mmlw-retrieval-roberta-large-v2`), compilado como EPContext de ONNX Runtime QNN |
| Parámetros totales | no disponible (el modelo base es RoBERTa-large; el repo no declara el recuento exacto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entrada fija `[1, 512]`) |
| Tipos de cuantización | Export ONNX fp32; ejecución en NPU en fp16; existe un modelo CPU alternativo int8 (`PiterQ/mmlw-retrieval-roberta-large-v2-ONNX-int8`) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Gemma Terms of Use (heredada del modelo base), con `GEMMA_PROHIBITED_USE_POLICY.md` |
| Formato de pesos | `ctx512.onnx` (wrapper EPContext) + `ctx512_qnn.bin` (binario QNN); no hay safetensors ni GGUF |
| Dimensión de embedding | 1024, L2-normalizada, CLS pooling |
| Entradas | `input_ids`, `attention_mask` int64 `[1, 512]` (pad id 1, mask 0) |
| Salida | `embedding` float32 `[1, 1024]` |
| Runtime objetivo | Qualcomm QNN 2.42 (QAIRT), HTP V73, SoC SM8550 (Snapdragon 8 Gen 2) |
| Tamaño del repo | 0,9 GB |
| Prefijo de consulta | `[query]: ` (según `meta.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder Transformer bidireccional de la familia RoBERTa en configuración *large*, adaptado por el autor original para recuperación de información en polaco. El modelo base se desarrolló, según la documentación de `sdadas/mmlw-retrieval-roberta-large`, mediante un procedimiento en dos pasos (entrenamiento y ajuste para retrieval) y transforma consultas y pasajes en vectores de 1024 dimensiones. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del corpus ni la presencia de RLHF/DPO; al tratarse de un encoder de similitud, lo habitual en esta familia es entrenamiento contrastivo, pero ese detalle no está confirmado en las fuentes.

El artefacto de este repositorio no introduce ningún cambio de pesos: la modificación declarada por PiterQ es exclusivamente de compilación. Se parte de una exportación ONNX en fp32 y se genera un contexto `EPContext` para el Execution Provider QNN, con cálculo en fp16 sobre el Hexagon HTP. El contexto está pensado para cargarse tal cual en el dispositivo, no para recompilarse en el móvil. La innovación técnica relevante no está en el modelo sino en el pipeline: empaquetado de un encoder de retrieval de tamaño *large* como binario QNN ejecutable en NPU móvil, con un wrapper ONNX que carga el `.bin` desde la misma carpeta y verificación de fidelidad numérica frente a la versión fp32 en CPU.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información (pipeline `sentence-similarity`).
- Codificación de consultas con prefijo `[query]: ` y de pasajes sin prefijo, en el esquema asimétrico típico de retrieval.
- Búsqueda semántica en documentos, notas y grabaciones del usuario en lengua polaca.
- Ejecución en NPU Hexagon HTP V73 con cálculo fp16, orientada a inferencia en dispositivo.
- Entrada de hasta 512 tokens por pasaje; no soporta secuencias más largas sin truncado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni *thinking mode*: es un encoder, no un modelo generativo.
- No soporta visión ni audio de forma nativa; el audio solo aparece en la app de destino como fuente de transcripciones que luego se indexan.
- Capacidad multilingüe limitada al polaco según la etiqueta de idioma del repo.

## Casos de uso

- Búsqueda semántica local en Android: la app PLaiA indexa documentos y notas del usuario y usa este contexto QNN para calcular embeddings de consulta y pasajes en la NPU, evitando enviar contenido personal a la nube. Es adecuado porque el artefacto está compilado específicamente para el SoC SM8550 y el runtime QNN del dispositivo.
- Indexación de transcripciones de audio: la app AudioTranscriber (origen del modelo CPU int8) transcribe reuniones y grabaciones; este contexto permite vectorizar los fragmentos transcritos en el propio móvil para búsqueda posterior por similitud.
- Recuperación de conocimiento personal (*personal knowledge management*): con vectores de 1024 dimensiones y contexto de 512 tokens por fragmento, encaja en un pipeline RAG ligero donde el índice vive en almacenamiento local (por ejemplo, una base vectorial embebida en la app).
- Deduplicación y agrupación de notas: la similitud coseno entre embeddings permite detectar pasajes redundantes o agrupar apuntes por tema sin conexión.
- Filtrado previo en pipelines híbridos: usar la NPU para una primera fase de recuperación densa sobre un subconjunto de documentos y relegar el re-ranking a un modelo mayor en servidor, reduciendo coste y latencia de red.
- Evaluación de despliegue en NPU para investigación: sirve como referencia reproducible de cómo se comporta un encoder RoBERTa-large en Hexagon HTP V73, útil para medir latencia, consumo y fidelidad numérica frente a CPU.
- Clasificación y clustering de textos cortos en polaco: los embeddings normalizados permiten entrenar clasificadores ligeros o hacer clustering sobre corpus pequeños sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) en la información disponible. Los únicos datos de calidad y rendimiento reportados por el autor son los siguientes:

| Métrica | Resultado | Condiciones |
|---|---|---|
| Similitud coseno frente al modelo fp32 en CPU | 0,9999 (mínimo) | 120 pasajes, padding a 512 tokens |
| hit@10 en prueba de recuperación | Igual que la versión CPU | Ejecutado en Galaxy S23 (SM8550) |
| Latencia y throughput | no disponible | No se publican cifras |
| Consumo energético | no disponible | No se publican cifras |

## Requisitos de hardware

- SoC objetivo: Qualcomm SM8550 (Snapdragon 8 Gen 2), HTP V73. Otros SoC no están soportados; la app debe recurrir al modelo CPU ONNX int8 como *fallback*.
- Runtime: ONNX Runtime compilado con QNN EP (por ejemplo, `onnxruntime-android-qnn` 1.28) y el runtime Qualcomm QNN 2.42 (QAIRT) mediante `com.qualcomm.qti:qnn-runtime`, sujeto a la Qualcomm AI Stack License, que no se distribuye en el repo.
- VRAM: no aplica; el despliegue es en NPU móvil con memoria compartida del SoC. El repo ocupa 0,9 GB en almacenamiento.
- GPU de escritorio: no aplica. El artefacto no está pensado para A100, H100 ni RTX 4090; para servidor habría que usar el modelo base en PyTorch o una exportación ONNX estándar.
- Cabe en GPU de consumo: no es el caso de uso; la ejecución está ligada a la NPU Hexagon, no a CUDA.
- Opciones de despliegue: carga del `EPContext` con ONNX Runtime + QNN EP en Android; para CPU, el modelo alternativo `PiterQ/mmlw-retrieval-roberta-large-v2-ONNX-int8` con ONNX Runtime. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un encoder de similitud.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión de embedding | Idioma | Licencia | Formato / despliegue |
|---|---|---|---|---|---|---|
| `PiterQ/mmlw-roberta-large-qnn-v73-ctx` | no disponible (base RoBERTa-large) | 512 | 1024 | pl | Gemma Terms of Use | EPContext QNN para HTP V73 / SM8550 |
| `sdadas/mmlw-retrieval-roberta-large-v2` (base) | no disponible (RoBERTa-large) | no disponible en las fuentes | 1024 | pl | Gemma Terms of Use | PyTorch / safetensors (modelo original) |
| `PiterQ/mmlw-retrieval-roberta-large-v2-ONNX-int8` | no disponible (RoBERTa-large) | 512 | 1024 | pl | Gemma Terms of Use | ONNX int8, ejecución en CPU Android |
| `sdadas/mmlw-retrieval-roberta-large` (v1) | no disponible (RoBERTa-large) | no disponible en las fuentes | 1024 | pl | no disponible en las fuentes | PyTorch |

La comparación relevante es entre las tres variantes del mismo modelo: el original en PyTorch para servidor, la exportación ONNX int8 para CPU móvil y este contexto QNN para NPU. Las diferencias están en el soporte hardware y el rendimiento, no en la arquitectura ni en la dimensión de salida.

## Limitaciones y advertencias

- Dependencia de hardware muy estricta: solo funciona en HTP V73 sobre SM8550 (Snapdragon 8 Gen 2). En cualquier otro SoC hay que usar el modelo CPU int8 como *fallback*.
- Requiere el runtime propietario de Qualcomm (QNN 2.42 / QAIRT) bajo la Qualcomm AI Stack License, que no se incluye en el repositorio y añade una dependencia legal y de distribución adicional.
- Licencia Gemma Terms of Use heredada del modelo base, con política de usos prohibidos asociada; hay que revisar `GEMMA_TERMS_OF_USE.md` y `GEMMA_PROHIBITED_USE_POLICY.md` antes de cualquier uso comercial.
- El artefacto es un binario compilado, no un conjunto de pesos: no es inspeccionable ni reentrenable, y está pensado para cargarse, no para recompilarse en el dispositivo.
- Contexto fijo de 512 tokens: los documentos más largos deben fragmentarse, lo que puede perder coherencia en pasajes que dependen de contexto extenso.
- Modelo monolingüe en polaco; no es adecuado para recuperación en castellano ni en otros idiomas.
- Al ser un encoder de similitud, no genera texto: no puede usarse para resúmenes, respuestas ni razonamiento. Cualquier riesgo de alucinación recae en el modelo generativo que consuma los embeddings, no en este artefacto.
- Sesgos: no se documentan en la información disponible; al derivar de un corpus polaco, es esperable un sesgo hacia el dominio y el registro de ese corpus, pero no hay datos concretos publicados.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay validación comunitaria independiente de la calidad ni de la estabilidad del binario.
- La única verificación de calidad es la del autor (coseno mínimo 0,9999 y paridad de hit@10), sin conjunto de evaluación público ni protocolo detallado.
- Integridad del binario: el autor publica el SHA-256 de `ctx512_qnn.bin` (`41efa71a62475c7b93021656213aabcdb6582ea7ead406f15a41c5335105be3b`); conviene verificarlo tras la descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PiterQ/mmlw-roberta-large-qnn-v73-ctx
- Modelo base: https://huggingface.co/sdadas/mmlw-retrieval-roberta-large-v2
- Versión anterior del modelo base (v1): https://huggingface.co/sdadas/mmlw-retrieval-roberta-large
- Alternativa ONNX int8 para CPU: https://huggingface.co/PiterQ/mmlw-retrieval-roberta-large-v2-ONNX-int8
- Repositorio del autor en Hugging Face: https://huggingface.co/PiterQ
- ONNX Runtime QNN Execution Provider (documentación de Microsoft): no disponible en la información proporcionada
- Qualcomm AI Stack / QNN (QAIRT): no disponible en la información proporcionada
