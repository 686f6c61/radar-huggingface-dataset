# anthonypjshaw/harrier-oss-v1-0.6b-onnx-cuda

## Resumen

Este repositorio contiene una conversión independiente a ONNX del modelo de embeddings multilingüe `microsoft/harrier-oss-v1-0.6b`, publicada por `anthonypjshaw`. No es un modelo nuevo ni un export oficial de Microsoft: reutiliza los pesos de la revisión `f9b9dc8d367d443f2479d27aa5d8d2850c0774ee` y los empaqueta para inferencia con ONNX Runtime sobre CUDA. El modelo resuelve tareas de recuperación, similitud semántica y clustering, no generación de texto.

Arquitectura y tamaño: backbone Qwen3 decoder-only de aproximadamente 0,6 mil millones de parámetros, 28 capas, atención causal completa con GQA de 16 cabezas de consulta y 8 de clave/valor, y una ventana de contexto de 32.768 tokens. Genera un único embedding normalizado de 1.024 dimensiones por entrada, usando el último token no de padding y normalización L2.

Su relevancia práctica está en desplegar embeddings de 0,6B con contexto largo en entornos CUDA mediante ONNX Runtime, incluida una ruta validada en Windows ARM64 nativo con ONNX Runtime 1.31.0, plugin CUDA 0.3.0 y CUDA 13. El export es mixto FP32/BF16 y no está cuantizado; la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 decoder-only transformer; 28 capas; atención causal completa; GQA con 16 cabezas de consulta y 8 de clave/valor; dimensión de cabeza 128; RMSNorm con normalización por cabeza en Q/K; MLP SwiGLU; RoPE |
| Parametros totales | Aproximadamente 0,6 mil millones (0,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens, incluidos tokens especiales e instrucciones |
| Tipos de cuantizacion | No cuantizado; exportación ONNX mixta FP32/BF16 (solo `GroupQueryAttention` y cachés rotatorios en BF16; el resto en FP32) |
| Idiomas soportados | Multilingüe; la model card no detalla la lista de idiomas |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` y `model.onnx_data`); opset 21; IR version 10; no safetensors ni GGUF |
| Tarea | `feature-extraction` / generación de embeddings |
| Dimension del embedding | 1.024; último token no de padding, seguido de normalización L2 |
| Vocabulario | 151.936 tokens |
| Ancho oculto / feed-forward | 1.024 / 3.072 |
| Runtime validado | ONNX Runtime 1.31.0 + plugin CUDA v0.3.0; CUDA 13; Windows ARM64 nativo |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

El grafo es un transformer decoder-only Qwen3 adaptado a extracción de embeddings. Usa 28 capas con atención causal completa, GQA de 16 cabezas de consulta y 8 de clave/valor, dimensión de cabeza 128, anchura oculta 1.024, feed-forward 3.072, RMSNorm con normalización por cabeza en consulta/clave, activación SwiGLU y RoPE. La graph ONNX incluye el pooling del último token no de padding y la normalización L2, por lo que devuelve directamente `sentence_embedding` como `float32 [batch, 1024]`. Es una interfaz de embeddings, no de generación de texto.

Los pesos provienen del modelo fuente de Microsoft, que describe entrenamiento con aprendizaje contrastivo multilingüe y destilación de modelos de embedding mayores. Esta conversión no entrena ni cuantiza los pesos: usa FP32 para pesos, proyecciones, residuales, normalización, pooling y salida, y BF16 solo en las entradas fusionadas de `com.microsoft::GroupQueryAttention` y en las cachés rotatorios. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO. A diferencia de la variante Harrier de 270M, este modelo usa Qwen3 en lugar de Gemma3, sin offset en RMSNorm, sin escalado de embeddings y con dos subcapas residuales pre-norm por bloque.

## Capacidades

- Generación de embeddings de texto: una representación normalizada de 1.024 dimensiones por entrada, lista para similitud coseno o producto escalar.
- Recuperación y búsqueda semántica: pensado para retrieval, similitud semántica y clustering sobre documentos, consultas y fragmentos largos.
- Procesamiento por lotes: entradas `input_ids` y `attention_mask` de tipo `int64` con forma `[batch, sequence]`; salida `float32 [batch, 1024]`.
- Contexto largo: hasta 32.768 tokens por secuencia, incluidos tokens especiales e instrucciones. El wrapper trunca lo que excede el límite; los documentos más largos deben dividirse explícitamente.
- Multilingüe: la model card describe el modelo fuente como multilingüe, pero no detalla la lista exacta de idiomas ni la cobertura por idioma.
- Instrucciones de consulta: el wrapper expone `PROMPT` con la instrucción de búsqueda web del modelo fuente; debe aplicarse a consultas, no a documentos. Hay otras instrucciones en `config_sentence_transformers.json`.
- Pooling y normalización integrados: no deben volver a aplicarse pooling ni normalización L2 sobre la salida.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes ni razonamiento multi-step. El grafo es exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de documentación y generar embeddings con este modelo; en consulta, aplicar `PROMPT` y comparar mediante producto escalar. El contexto de 32.768 tokens permite indexar fragmentos largos, aunque el wrapper trunca si se supera el límite.
- RAG sobre bases de conocimiento: generar embeddings de chunks y de preguntas para recuperar los pasajes más relevantes antes de pasarlos a un LLM generativo. El modelo aporta la parte de recuperación; la generación debe hacerla otro modelo.
- Clustering de tickets y feedback: agrupar tickets de soporte, encuestas o reseñas con k-means o clustering aglomerativo sobre embeddings normalizados. Es adecuado porque la salida L2 facilita distancias coseno estables.
- Clasificación y enrutamiento semántico: usar los embeddings como entrada de un clasificador ligero para enrutar consultas a equipos, departamentos o colas de soporte, o para clasificación de intenciones con pocos ejemplos.
- Deduplicación y detección de near-duplicates: comparar embeddings de artículos, preguntas frecuentes o registros para detectar contenido duplicado o casi duplicado mediante umbrales de similitud.
- Recomendación de contenido: calcular similitud entre embeddings de artículos, productos o publicaciones para recomendar elementos relacionados sin depender de palabras clave exactas.
- Búsqueda multilingüe: si la cobertura de idiomas del modelo fuente es suficiente para el par de idiomas objetivo, se puede consultar en un idioma y recuperar documentos en otro. La lista exacta de idiomas no está disponible, por lo que la cobertura debe validarse con datos propios.
- Análisis de respuestas abiertas: agrupar y buscar respuestas de encuestas o formularios por significado, no solo por coincidencia léxica, para extraer temas recurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K, MTEB ni métricas de retrieval, clustering o similitud semántica para este export o para el modelo fuente en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no hay cifra oficial. El repositorio ocupa 2,4 GB y el export es mayoritariamente FP32, por lo que los pesos rondan 2,4 GB. Hay que añadir overhead de ONNX Runtime, DLLs de CUDA, tokenizador y activaciones; a 32.768 tokens el consumo puede crecer de forma significativa. No se proporciona una estimación validada.
- GPU recomendadas: la model card no enumera modelos concretos. Exige atención CUDA con soporte BF16; por tanto, se necesita una GPU NVIDIA compatible con BF16 y con el stack CUDA 13 + ONNX Runtime 1.31.0 + plugin 0.3.0. Una CPU no es una ruta soportada.
- GPU consumer: por tamaño, el modelo es compatible con GPUs consumer con VRAM suficiente para los pesos y el overhead, pero la única combinación validada es Windows ARM64 nativo. No hay validación publicada en x86-64 ni en modelos consumer concretos.
- Despliegue: la vía documentada es ONNX Runtime con el plugin CUDA. El repositorio no incluye soporte para vLLM, llama.cpp, Ollama ni TGI; el formato es ONNX y requiere las DLL del plugin CUDA y de CUDA, que no se incluyen.
- Latencia y throughput: no disponible. No se proporcionan cifras de latencia, tokens por segundo ni rendimiento por lote.
- Requisitos de runtime: ONNX Runtime 1.31.0, plugin CUDA v0.3.0, CUDA 13 compatible y Windows ARM64 nativo como combinación validada. El grafo declara opset 21, IR version 10 y `com.microsoft` opset 1. `onnx` de Python solo es necesario para exportar o comprobar, no para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---:|---|---|---|
| `anthonypjshaw/harrier-oss-v1-0.6b-onnx-cuda` | ~0,6B | 32.768 | ONNX FP32/BF16 | MIT | Export independiente; runtime ONNX Runtime + CUDA; Windows ARM64 validado; no cuantizado |
| `microsoft/harrier-oss-v1-0.6b` | ~0,6B | 32.768 | No disponible en la información | MIT | Modelo fuente; pesos originales; entrenamiento y cobertura de idiomas en su model card |
| Harrier OSS v1 270M | 270M | No disponible | No disponible | No disponible | Variante mencionada en la model card; backbone Gemma3 en lugar de Qwen3 |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes. Tampoco se proporcionan en la información otras alternativas externas con parámetros, contexto, licencia y disponibilidad verificables.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat, generación de texto, tool calling, function calling, agentes, razonamiento multi-step, código, matemáticas, visión ni audio. En un pipeline RAG, la generación debe delegarse en otro modelo.
- Requiere GPU NVIDIA con atención CUDA compatible con BF16. La ejecución solo en CPU no está soportada.
- La única combinación validada es ONNX Runtime 1.31.0 + plugin CUDA v0.3.0 + CUDA 13 en Windows ARM64 nativo. Otras configuraciones no están validadas y deben comprobarse de nuevo tras cualquier cambio de stack.
- Las DLL del plugin CUDA y de CUDA no se incluyen en el repositorio; hay que obtenerlas por separado.
- El contexto máximo es de 32.768 tokens. El wrapper trunca el texto que excede el límite; para documentos más largos hay que dividirlos explícitamente.
- El tokenizador incluido tiene un comportamiento especial: el token terminal `<|endoftext|>` es un token real atendido y también se usa como padding. La attention mask distingue ambos casos. No se debe sustituir por el tokenizador de Gemma ni añadir una plantilla de chat.
- `PROMPT` debe aplicarse solo a consultas, no a documentos. Otras instrucciones están en `config_sentence_transformers.json`.
- No se debe volver a aplicar pooling ni normalización L2 sobre `sentence_embedding`.
- `model.onnx` y `model.onnx_data` deben mantenerse juntos; el grafo no funciona si se separan.
- La licencia MIT permite uso comercial y modificación con atribución. Se incluyen `LICENSE` y `NOTICE`; el modelo fuente fijado no tiene un archivo de licencia separado. La atribución de los pesos y del entrenamiento corresponde a Microsoft.
- Es una conversión independiente, no un export oficial de Microsoft. No es un modelo nuevo ni ha sido entrenado por el autor del repositorio.
- No se dispone de datos sobre sesgos, cobertura real por idioma ni calidad de recuperación en dominios concretos. La lista de idiomas del modelo fuente no está detallada en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria ni resultados de benchmarks publicados.
- No se proporcionan variantes cuantizadas INT8/INT4/GGUF en este repositorio; el export es mixto FP32/BF16 y no está cuantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anthonypjshaw/harrier-oss-v1-0.6b-onnx-cuda
- Modelo base en HuggingFace: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Repositorio oficial de ONNX Runtime: https://github.com/microsoft/onnxruntime
- No se han proporcionado enlaces a papers, blogs, demos ni al release exacto `plugin-ep-cuda/v0.3.0` en la información disponible.
