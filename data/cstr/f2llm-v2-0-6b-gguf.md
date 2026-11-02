# cstr/f2llm-v2-0.6b-GGUF

## Resumen

f2llm-v2-0.6b-GGUF es la conversión al formato GGUF del modelo de embeddings codefuse-ai/F2LLM-v2-0.6B, publicada por el usuario cstr. Se trata de un modelo de extracción de características (feature-extraction) basado en la arquitectura Qwen3, con 596 millones de parámetros y una dimensión de embedding de 1024. Su propósito es generar representaciones vectoriales densas de texto para tareas de búsqueda semántica, recuperación de información y similitud entre textos, con un enfoque multilingüe.

La relevancia de esta publicación radica en que permite ejecutar un modelo de embeddings de calidad en entornos sin Python ni dependencias de ONNX, gracias al motor de inferencia CrispEmbed, escrito en C/C++ sobre ggml. Esto facilita el despliegue en producción de sistemas de recuperación aumentada (RAG), motores de búsqueda semántica o sistemas de recomendación con una huella de memoria reducida: la cuantización Q4_K ocupa 400 MB y la Q8_0 610 MB.

El repositorio incluye cuatro variantes de cuantización (Q4_K, Q5_K, Q8_0 y F32) y documenta explícitamente la paridad frente a la referencia original en sentence-transformers. Es importante señalar que las cuantizaciones inferiores a Q8_0 degradan la similitud coseno respecto al modelo de referencia, con valores de 0,9031 para Q5_K y 0,6999 para Q4_K, lo que condiciona su uso según la exigencia de precisión del caso de aplicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder) |
| Parámetros totales | 596.049.920 (≈600M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K, Q5_K, Q8_0, F32 |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base) |
| Dimensión de embedding | 1024 |
| Capas | 28 |
| Pooling | last-token |
| Tokenizador | GPT-2 BPE |
| Modelo base | codefuse-ai/F2LLM-v2-0.6B |
| Tamaño del repo | 15,2 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer de tipo decoder con 28 capas y una dimensión de embedding de 1024. Para la generación de embeddings emplea pooling de último token (last-token pooling), un enfoque habitual en modelos Qwen3 adaptados a tareas de representación. El tokenizador es GPT-2 BPE. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta conversión remite al modelo original y no detalla el proceso de entrenamiento.

La innovación principal de esta publicación no reside en el modelo en sí, sino en el proceso de conversión y cuantización. El autor documenta una auditoría de paridad frente a la referencia en FP32 ejecutada con sentence-transformers, y en la revisión del 2 de noviembre de 2026 introduce un archivo `f2llm-v2-0.6b-q4_k-mixed.gguf` que sustituye a las cuantizaciones Q4_K anteriores. Este archivo mixto mantiene Q4_K con imatrix para la mayoría de matrices, pero eleva a Q6_K la matriz `ffn_down`, a Q8_0 las matrices `attn_v` y los tres últimos bloques (25-27), y a Q8_0 los embeddings de tokens, logrando una similitud coseno mínima de aproximadamente 0,96 frente a la referencia, frente al 0,77 de la versión anterior.

## Capacidades

- Generación de embeddings de texto densos de 1024 dimensiones para similitud semántica y recuperación de información.
- Soporte multilingüe, con especial énfasis en alemán, inglés y textos de código según el panel de evaluación del autor.
- Extracción de características (feature-extraction) como tarea principal del pipeline.
- Compatibilidad con endpoints de tipo OpenAI (`/v1/embeddings`) a través del servidor de CrispEmbed.
- Ejecución sin runtime de Python ni ONNX, mediante el motor C/C++ CrispEmbed sobre ggml.
- Soporte de arquitecturas BERT, XLM-R, Qwen3 y Gemma3 en el motor de inferencia.
- No dispone de capacidades de generación de texto, razonamiento, tool calling ni agentes, al ser un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: el modelo genera vectores de 1024 dimensiones que permiten indexar documentos y recuperar los más relevantes ante una consulta en lenguaje natural, con un tamaño de 400 MB en Q4_K que cabe en cualquier servidor.
- Sistemas RAG (retrieval-augmented generation): se usa como recuperador para alimentar un LLM generativo con fragmentos relevantes; la variante Q8_0 (610 MB) ofrece una similitud coseno de 0,9941 frente a la referencia, adecuada cuando la precisión de recuperación es crítica.
- Deduplicación y agrupación de documentos: el cálculo de similitud entre embeddings permite detectar textos casi duplicados o agrupar documentos por temática en pipelines de preprocesado.
- Motor de búsqueda multilingüe: al soportar varios idiomas, permite consultas en un idioma y recuperación de documentos en otro, útil en bases de datos con contenido heterogéneo.
- Clasificación y filtrado de contenido: los embeddings sirven como entrada a clasificadores ligeros (regresión logística, SVM) para moderación, etiquetado o enrutamiento de tickets de soporte.
- Búsqueda de código: el panel de evaluación del autor incluye textos de código, por lo que el modelo puede emplearse para recuperar fragmentos de código similares en repositorios o asistentes de desarrollo.
- Despliegue en entornos embebidos o sin Python: gracias a CrispEmbed y al formato GGUF, puede integrarse en servicios en C/C++ o contenedores mínimos donde no se desea arrastrar dependencias de PyTorch.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, etc.). El autor únicamente publica métricas de paridad frente a la referencia en FP32, medidas como similitud coseno sobre un conjunto de textos de prueba:

| Cuantización | Similitud coseno vs referencia FP32 (texto) |
|---|---|
| Q8_0 | 0,9941 |
| Q5_K | 0,9031 |
| Q4_K | 0,6999 |
| Q4_K-mixed (revisión 2026-11-02) | ≈0,96 (mínimo en panel de 78 textos) |

El autor indica que Q5_K y Q4_K quedan por debajo del umbral de calidad de recuperación de 0,99, y que Q4_K (0,6999) presenta diferencias notables en los resultados de vecinos más cercanos. La variante Q4_K-mixed corrige esta degradación y se sitúa en torno a 0,96 de similitud mínima.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en Q4_K, 0,45 GB en Q5_K, 0,6 GB en Q8_0 y 2,3 GB en F32.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. Para despliegues de alto rendimiento, A100 o H100 permiten procesar lotes grandes.
- Cabe en GPU consumer: sí, en todas las variantes, incluidas GPUs con 4 GB o menos de VRAM.
- Opciones de despliegue: CrispEmbed (motor C/C++ sobre ggml, con modo servidor compatible con `/v1/embeddings`); el modelo base también puede ejecutarse con sentence-transformers, vLLM o TGI si se usan los pesos safetensors originales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| cstr/f2llm-v2-0.6b-GGUF | ≈600M | 1024 | no disponible | Apache 2.0 | GGUF |
| codefuse-ai/F2LLM-v2-0.6B | ≈600M | 1024 | no disponible | Apache 2.0 | safetensors |
| BGE-M3 | no disponible | 1024 | no disponible | MIT | safetensors, GGUF |
| multilingual-e5-base | ≈278M | 768 | no disponible | MIT | safetensors, GGUF |

La comparación con BGE-M3 y multilingual-e5-base se ofrece como referencia de categoría (modelos de embeddings multilingües), pero no se dispone de datos de rendimiento comparativo en la información proporcionada. El modelo base F2LLM-v2-0.6B es la referencia directa de esta conversión y comparte arquitectura y pesos, difiriendo únicamente en el formato de serialización.

## Limitaciones y advertencias

- Las cuantizaciones Q4_K y Q5_K degradan la similitud coseno frente a la referencia (0,6999 y 0,9031 respectivamente), lo que puede alterar el orden de los vecinos más cercanos en tareas de recuperación sensibles.
- La variante Q4_K original ha sido sustituida por Q4_K-mixed; los archivos antiguos se mantienen solo por reproducibilidad y no deberían usarse en producción.
- No se dispone de información sobre sesgos del modelo, datos de entrenamiento ni evaluación de alucinación, ya que la model card remite al modelo original sin detallarlos.
- Al ser un modelo de embeddings, no genera texto ni razona; cualquier expectativa de generación o tool calling es inaplicable.
- La longitud máxima de contexto no está documentada en la información disponible, lo que impide planificar el truncado de documentos largos con precisión.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor de la conversión no otorga derechos adicionales a los del modelo original; las cuestiones sobre contenido de entrenamiento y copyright corresponden al proveedor upstream.
- El rendimiento multilingüe está declarado de forma genérica; no se detallan los idiomas cubiertos ni métricas por idioma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/f2llm-v2-0.6b-GGUF
- Modelo base: https://huggingface.co/codefuse-ai/F2LLM-v2-0.6B
- Motor de inferencia CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Archivo Q4_K: https://huggingface.co/cstr/f2llm-v2-0.6b-GGUF/resolve/main/f2llm-v2-0.6b-q4_k.gguf
- Archivo Q5_K: https://huggingface.co/cstr/f2llm-v2-0.6b-GGUF/resolve/main/f2llm-v2-0.6b-q5_k.gguf
- Archivo Q8_0: https://huggingface.co/cstr/f2llm-v2-0.6b-GGUF/resolve/main/f2llm-v2-0.6b-q8_0.gguf
- Archivo F32: https://huggingface.co/cstr/f2llm-v2-0.6b-GGUF/resolve/main/f2llm-v2-0.6b.gguf
