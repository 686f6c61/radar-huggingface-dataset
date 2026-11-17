# Ori5147/context-reranker-MiniLM-L6

## Resumen

Context reranker (MiniLM-L6, distilled) es un cross-encoder de 23 millones de parámetros desarrollado por Ori5147 que puntúa la probabilidad de que una frase responda a una pregunta. Se trata del selector de frases del proyecto context-middleware, una capa que se ejecuta exclusivamente en CPU y que comprime el contexto recuperado antes de enviarlo a un LLM, reduciendo así el coste en tokens y la latencia en pipelines de generación aumentada por recuperación (RAG).

El modelo parte de `cross-encoder/ms-marco-MiniLM-L6-v2` y se ha afinado mediante destilación a partir de rankings generados por Claude Haiku sobre 35.900 preguntas del conjunto DPR Natural Questions. Se distribuye en formato ONNX (INT8 y FP32), con un tamaño de repositorio de 0,1 GB y licencia Apache 2.0, lo que facilita su despliegue en entornos sin GPU.

Es relevante porque demuestra que un modelo muy pequeño, entrenado con destilación y ejecutado en CPU, puede mejorar de forma medible la selección de frases relevantes frente a su modelo base (43 % frente a 34 % en top-1), lo que lo convierte en una pieza útil para reducir el contexto en sistemas RAG con presupuestos de tokens ajustados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer MiniLM-L6 (destilado de `cross-encoder/ms-marco-MiniLM-L6-v2`) |
| Parámetros totales | 23 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (`model_int8.onnx`, 23 MB) y FP32 (`model.onnx`, 91 MB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model_int8.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura MiniLM-L6, con 23 millones de parámetros. Recibe como entrada cada frase candidata junto con la frase anterior y posterior del documento, de modo que el scoring incorpora contexto local. La construcción de la entrada se realiza con la función `with_neighbors` de la librería context-middleware.

El entrenamiento se realizó por destilación: Claude Haiku clasificó una lista corta de 20 frases para cada una de las 35.900 preguntas del conjunto DPR Natural Questions, y el modelo se entrenó para reproducir esos rankings con una pérdida listwise, durante 1 época y 5,5 horas en la CPU de un portátil. Ninguna de las preguntas de evaluación estaba presente en los datos de entrenamiento. El modelo se distribuye con cuantización INT8 dinámica, por lo que las puntuaciones pueden variar ligeramente según el contenido del lote; se recomienda ejecutar una entrada por inferencia.

## Capacidades

- Puntuación de relevancia pregunta-frase (text-ranking) mediante cross-encoder.
- Selección de frases candidatas dentro de un contexto recuperado para compresión de contexto en RAG.
- Incorporación de contexto local (frase anterior y posterior) en la puntuación.
- Ejecución en CPU con cuantización INT8 (unos 31 ms para reordenar 20 frases en un portátil).
- Integración con la librería context-middleware mediante `CPUMiddlewareEngine`.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido: es un modelo de ranking, no generativo.

## Casos de uso

- Compresión de contexto en pipelines RAG: antes de enviar el contexto recuperado al LLM, el modelo puntúa y selecciona las frases más relevantes, reduciendo el número de tokens de entrada. En la evaluación del autor, las 5 mejores frases (440 tokens) alcanzaron un 65,7 % de respuestas correctas frente al 57,5 % de la recuperación sin reordenar con el mismo presupuesto.
- Reducción de coste en APIs de LLM: al recortar el contexto a las frases seleccionadas, se disminuye el número de tokens facturados por consulta sin degradar tanto la calidad como un recorte arbitrario.
- Sistemas de búsqueda documental con preguntas de respuesta factual: el modelo está entrenado y medido sobre pasajes estilo Wikipedia y preguntas de hecho único, por lo que encaja en asistentes de consulta sobre documentación.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con ONNX INT8, puede integrarse en servicios de bajo coste, contenedores pequeños o dispositivos de borde donde no hay acelerador disponible.
- Pre-filtrado antes de un reranker mayor: puede usarse como primera etapa para descartar frases irrelevantes y reducir el número de candidatas que pasa a un modelo de ranking más costoso.
- Evaluación y depuración de pipelines de recuperación: sus puntuaciones permiten analizar qué frases del contexto recuperado son realmente relevantes para cada pregunta y ajustar el retriever.

## Benchmarks y rendimiento

Natural Questions, 20 pasajes por pregunta, 1.327 preguntas, lista corta de 20 frases generada con `bge-small-en-v1.5`:

| Selector | Frase respuesta en top 1 | En top 3 |
|---|---:|---:|
| `ms-marco-MiniLM-L6-v2` | 34 % | 53 % |
| Este modelo | 43 % | 61 % |

Evaluación de extremo a extremo sobre la mitad reservada, con Claude Haiku como lector y juez:

| Configuración | Tokens | Respuestas correctas |
|---|---:|---:|
| Recuperación simple, mismo presupuesto | — | 57,5 % |
| 5 mejores frases seleccionadas por este modelo | 440 | 65,7 % |
| Contexto completo | 2.463 | 70,8 % |

Latencia: unos 31 ms para reordenar 20 frases en la CPU de un portátil.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para ejecución en CPU.
- Tamaño en disco: 23 MB en INT8 y 91 MB en FP32.
- GPU recomendadas: no aplica; funciona en CPU. Cualquier GPU podría ejecutarlo, pero no es su objetivo.
- Cabe en cualquier equipo consumer: el modelo INT8 ocupa 23 MB y se ejecuta con ONNX Runtime en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo) e integración con la librería context-middleware mediante `CPUMiddlewareEngine`. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: aproximadamente 31 ms para 20 frases en CPU de portátil; no se han publicado cifras de throughput para lotes mayores.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato | Licencia | Rendimiento (top-1 NQ) |
|---|---|---|---:|---|---:|
| Este modelo (context-reranker-MiniLM-L6) | 23 M | inglés | ONNX (INT8/FP32) | Apache 2.0 | 43 % |
| `cross-encoder/ms-marco-MiniLM-L6-v2` (modelo base) | 23 M | inglés | safetensors (formato original) | no disponible en la información proporcionada | 34 % |
| `bge-small-en-v1.5` (retriever usado para la lista corta) | no disponible | inglés | no disponible | no disponible | no disponible (usado como recuperador, no como reranker en esta evaluación) |

No se dispone de datos comparativos con otros rerankers de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Entrenado y medido sobre pasajes estilo Wikipedia y preguntas de respuesta factual única; su comportamiento en otros dominios (código, conversación, documentos técnicos) no está validado.
- No detecta preguntas cuya respuesta no está presente en pasajes que sí son del tema: puede puntuar alto frases temáticamente relacionadas aunque no respondan a la pregunta.
- La cuantización INT8 dinámica introduce variaciones en las puntuaciones según el contenido del lote; se recomienda una entrada por inferencia.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplica directamente al no generar texto, pero sus puntuaciones pueden inducir a seleccionar frases irrelevantes si el retriever previo entrega candidatas de baja calidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento derivados de DPR Natural Questions.
- Sin descargas ni likes en el momento de la consulta y con un único autor: no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ori5147/context-reranker-MiniLM-L6
- Repositorio context-middleware: https://github.com/oriki5147/context-middleware
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Retriever usado para la lista corta: https://huggingface.co/BAAI/bge-small-en-v1.5
- DPR Natural Questions: https://github.com/facebookresearch/DPR
