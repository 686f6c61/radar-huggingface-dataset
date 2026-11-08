# edvv1n/granite-embedding-97m-multilingual-r2-w8a16-iree

## Resumen

`granite-embedding-97m-multilingual-r2-w8a16-iree` es una conversión no oficial del modelo de embeddings multilingüe de IBM `ibm-granite/granite-embedding-97m-multilingual-r2`, publicada por el usuario edvv1n. Se trata de una cuantización weight-only a INT8 simétrica por canal (esquema W8A16) del modelo original, con los pesos compilados en módulos IREE (`.vmfb`) listos para ejecutarse en distintos backends (CPU aarch64, Metal). El modelo base es un encoder tipo ModernBERT de 97,68 millones de parámetros que produce embeddings de 384 dimensiones, L2-normalizados, aptos para similitud semántica, recuperación y búsqueda.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y desplegable en hardware modesto para tareas de recuperación multilingüe, manteniendo la licencia Apache 2.0 del modelo original. Al estar cuantizado a INT8 y compilado con IREE, reduce el peso en memoria y permite inferencia en Apple Silicon y CPUs ARM sin necesidad de GPUs dedicadas, lo que facilita su integración en pipelines de búsqueda semántica y RAG en producción.

Es importante subrayar que esta es una conversión de terceros, no revisada ni respaldada por IBM, y que el formato de pesos no es cargable directamente con `transformers`, sino que requiere el runtime de IREE en la versión exacta con la que se compiló (3.13.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 97.681.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia en los entry points) |
| Tipos de cuantizacion | INT8 weight-only simétrica por canal (W8A16), escalas FP32; activaciones FP16, LayerNorm/softmax FP32 |
| Idiomas soportados | multilingüe; 52 idiomas listados (ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (INT8 + escalas FP32) y módulos IREE `.vmfb` |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT de IBM, diseñado para generar representaciones vectoriales de texto (embeddings) de 384 dimensiones. La arquitectura ModernBERT incorpora mejoras sobre BERT clásico, como atención con RoPE y capas de normalización más eficientes, orientadas a un rendimiento competitivo en tareas de recuperación y similitud semántica. El modelo original fue entrenado por el equipo de Granite Embedding de IBM; no se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta conversión concreta no reentrena el modelo, sino que aplica una cuantización weight-only a INT8 con escalas FP32 por canal (para pesos lineales) y por fila (para el embedding de tokens). Las activaciones y matmuls se ejecutan en FP16, mientras que LayerNorm, softmax, RoPE y el pooling CLS se calculan en FP32. La dequantización es explícita en el grafo: cada peso lineal se dequantiza de INT8 a FP32 y luego a FP16 antes de cada matmul, y el compilador IREE se configura con `--iree-opt-const-eval=false` y `--iree-opt-const-expr-hoisting=false` para evitar que los pesos se plieguen de nuevo a constantes FP16. El forward pass se reescribió en PyTorch, se exportó con iree-turbine y se compiló con `iree-compile` 3.13.0.

## Capacidades

- Generación de embeddings de texto de 384 dimensiones, L2-normalizados (similitud coseno equivale a producto escalar).
- Similitud semántica entre frases y documentos.
- Recuperación de información y búsqueda semántica multilingüe.
- Extracción de características (`feature-extraction`) para pipelines de sentence-transformers.
- Soporte multilingüe en 52 idiomas, con especial cobertura de lenguas europeas, asiáticas y de Oriente Medio.
- Entry points con formas estáticas para distintos tamaños de lote y longitud: `embed_b1_s128`, `embed_b16_s128`, `embed_b1_s512`, `embed_b4_s512`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica multilingüe: indexar documentos en varios idiomas y recuperar los más relevantes para una consulta, usando los embeddings normalizados y la similitud coseno; el soporte de 52 idiomas permite consultas cruzadas entre lenguas.
- RAG (retrieval-augmented generation): generar embeddings de fragmentos de documentación para alimentar un sistema de recuperación que sirva contexto a un LLM generativo; el tamaño reducido (97M parámetros) y la cuantización INT8 facilitan el despliegue en el mismo servidor que el generador.
- Deduplicación y clustering de textos: agrupar noticias, tickets o reseñas similares calculando distancias entre embeddings; el entry point `embed_b16_s128` permite procesar bloques cortos en lote.
- Moderación y filtrado de contenido: comparar mensajes entrantes contra una base de ejemplos etiquetados para detectar similitud con casos conocidos, con inferencia en CPU ARM sin GPU.
- Búsqueda en aplicaciones móviles o de escritorio: al compilarse para Metal y CPU aarch64, puede ejecutarse localmente en Macs con Apple Silicon, permitiendo búsqueda semántica offline sin enviar datos a la nube.
- Clasificación zero-shot por similitud: asignar etiquetas comparando el embedding de un texto con los embeddings de descripciones de categorías, útil para enrutamiento de tickets o etiquetado automático.
- Sistemas de recomendación basados en contenido: representar ítems textuales (descripciones de productos, artículos) y calcular similitud con el perfil del usuario para sugerencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 97M parámetros cuantizado a INT8, el peso de los pesos es de aproximadamente 0,1 GB (97,68M parámetros × 1 byte), más escalas FP32 y buffers de activación FP16. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: no se especifican; el modelo está compilado para CPU aarch64 (armv8.2-a + fullfp16) y Metal, no para CUDA.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~0,5 GB de memoria libre, aunque los módulos publicados están orientados a CPU ARM y Apple Silicon (Metal).
- Opciones de despliegue: runtime de IREE 3.13.0 (`iree-base-compiler==3.13.0`); los `.vmfb` solo cargan en una versión de runtime idéntica. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo y el formato es específico de IREE.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones de embedding | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| `edvv1n/granite-embedding-97m-multilingual-r2-w8a16-iree` (esta ficha) | 97,68M | 512 | 384 | Apache 2.0 | IREE `.vmfb`, safetensors INT8 |
| `ibm-granite/granite-embedding-97m-multilingual-r2` (original) | 97,68M | no disponible (hasta 512 en esta conversión) | 384 | Apache 2.0 | safetensors, ONNX, OpenVINO, sentence-transformers |
| `ibm-granite/granite-embedding-311m-multilingual` | 311M | no disponible | no disponible | Apache 2.0 | safetensors, sentence-transformers |

La comparación directa con alternativas de otros fabricantes (por ejemplo, modelos de embeddings multilingües de la familia E5 o BGE) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no ha sido revisada ni respaldada por IBM; los problemas derivados de la conversión son responsabilidad del autor de la cuantización.
- El formato de pesos no es cargable con `transformers`; requiere el runtime de IREE 3.13.0 y los módulos `.vmfb` correspondientes al dispositivo.
- Longitud de contexto limitada a 512 tokens en los entry points publicados; textos más largos deben truncarse.
- Riesgo de alucinación no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en textos ambiguos o muy cortos.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el modelo base, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir correctamente al modelo original de IBM.
- Los módulos compilados con una versión de IREE no cargan en otra; es necesario recompilar si se actualiza el runtime.
- El repositorio no incluye los archivos README, ONNX, OpenVINO ni la firma `model.sig` del modelo original.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/edvv1n/granite-embedding-97m-multilingual-r2-w8a16-iree)
- [Modelo base en Hugging Face](https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2)
- [Documentación de Granite Embedding en IBM](https://www.ibm.com/granite/docs/models/embedding)
- [IREE](https://iree.dev)
