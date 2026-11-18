# alphaedge-ai/multilingual-e5-large-instruct-kor-32768

## Resumen

`multilingual-e5-large-instruct-kor-32768` es un modelo de embeddings de frases derivado de `intfloat/multilingual-e5-large-instruct` mediante la técnica de *trimming* (poda del vocabulario). Lo publica el usuario `alphaedge-ai` y está especializado en coreano: se han eliminado del vocabulario los tokens poco frecuentes en ese idioma, reduciendo el tamaño del vocabulario de 250.037 a 32.768 tokens y el número de parámetros de 559.890.432 a 337.442.816, es decir, un 39,73 % menos.

El modelo conserva la arquitectura XLM-RoBERTa del original y su función: generar embeddings densos para búsqueda semántica, recuperación de información (RAG) y similitud entre frases. La poda del vocabulario reduce el consumo de memoria y el espacio en disco (repo de 0,7 GB) manteniendo, según el autor, un rendimiento similar al original en coreano. A cambio, pierde capacidad multilingüe: los tokens de otros idiomas ya no existen en el vocabulario.

Es relevante para equipos que despliegan recuperación semántica en coreano con recursos limitados, ya que permite servir un modelo de la familia E5-large con menor huella de memoria sin renunciar a la calidad del original en ese idioma. La licencia MIT facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), derivada de multilingual-e5-large-instruct |
| Parametros totales | 337.442.816 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo original soporta 512 tokens; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de sentence-transformers, no confirmado) |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Tamano de vocabulario | 32.768 tokens (reduccion del 86,89 % frente al original) |
| Dimension de embedding | no disponible |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia XLM-RoBERTa, heredado directamente de `intfloat/multilingual-e5-large-instruct`. No se ha reentrenado desde cero: la intervencion consiste en el *trimming* del vocabulario, un procedimiento que selecciona los tokens más relevantes para un idioma o conjunto de idiomas y elimina el resto, ajustando las matrices de embedding y de proyección de salida en consecuencia. La selección de tokens se hizo minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming`.

El autor no documenta un proceso adicional de entrenamiento, ajuste fino ni RLHF/DPO tras el trimming. El modelo base original (multilingual-e5) se entrenó con pares de texto y objetivos de contraste, e incorpora instrucciones de prefijo (`query:` / `passage:`) que se exponen en la API de sentence-transformers mediante `encode_query` y `encode_document`. La innovación técnica destacable es precisamente la reducción de vocabulario, que disminuye parámetros y memoria sin alterar la arquitectura del encoder.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica y ranking.
- Recuperación de información (retrieval) en coreano, con API diferenciada para consultas y documentos.
- Búsqueda semántica multilingüe limitada al coreano: el vocabulario podado elimina tokens de otros idiomas.
- Soporte de instrucciones mediante prefijos de tarea, heredado del modelo E5 original.
- Integración con sentence-transformers y con Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en coreano: indexar un corpus de documentos coreanos y recuperar los fragmentos más relevantes para una consulta mediante similitud coseno entre embeddings.
- RAG sobre documentación interna en coreano: usar el modelo como retriever en un pipeline de generación aumentada, aprovechando su menor huella de memoria frente al E5-large completo.
- Deduplicación y clustering de textos: agrupar noticias, reseñas o tickets de soporte en coreano por similitud de embeddings.
- Moderación y clasificación semántica: comparar mensajes de usuario con embeddings de referencia de categorías predefinidas.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario en coreano y calcular afinidad vectorial.
- Despliegue en entornos con recursos limitados: al tener 337 M de parámetros y 0,7 GB de pesos, cabe en GPUs de consumo y en CPU para cargas moderadas, algo inviable con el original de 559 M.
- Evaluación de calidad de traducción o paráfrasis: medir similitud semántica entre pares de frases coreanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de tamaño (reducción de vocabulario del 86,89 % y de parámetros del 39,73 %) y afirma que el rendimiento debería ser similar al original en coreano, sin cifras que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3-1,4 GB solo para pesos (337 M de parámetros × 4 bytes), más overhead de activaciones.
- VRAM estimada en fp16/bf16: alrededor de 0,7 GB para pesos.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 2 GB o más de VRAM en fp16.
- Ejecutable en CPU para cargas de baja concurrencia; el throughput será notablemente inferior al de GPU.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI) para servir por HTTP, y endpoints compatibles de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-kor-32768 | 337 M | no disponible | coreano | MIT | Version podada, 0,7 GB |
| intfloat/multilingual-e5-large-instruct | 560 M | no disponible | multilingue | MIT | Modelo base, 100+ idiomas, mayor huella |
| intfloat/multilingual-e5-base | no disponible | no disponible | multilingue | MIT | Version menor de la familia E5 |
| intfloat/multilingual-e5-small | no disponible | no disponible | multilingue | MIT | Version mas ligera de la familia E5 |

La ventaja del modelo podado es el menor tamaño y consumo de memoria frente al E5-large original, a costa de perder cobertura multilingüe. Frente a E5-base o E5-small, ofrece la calidad de un modelo large pero limitado al coreano.

## Limitaciones y advertencias

- Solo soporta coreano de forma fiable: los tokens de otros idiomas se eliminaron del vocabulario, por lo que el rendimiento multilingüe será deficiente o directamente inválido.
- No es un modelo generativo: no produce texto, solo vectores; no sirve para chat, razonamiento ni generación de código.
- Riesgo de sesgos heredados del corpus de entrenamiento original (FineWeb-2 y datos del E5 multilingüe), no evaluados por el autor.
- No hay benchmarks publicados que validen la afirmación de rendimiento similar al original; conviene evaluar en el dominio concreto antes de producción.
- La longitud máxima de contexto no está documentada en la ficha; el original E5 soporta 512 tokens, pero debe verificarse.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Modelo con muy poca adopción (35 descargas, 0 likes) y actualización reciente; sin comunidad que valide su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-kor-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Multilingual E5: https://arxiv.org/abs/2402.05672
