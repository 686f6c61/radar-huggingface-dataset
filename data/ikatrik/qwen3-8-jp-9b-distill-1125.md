# ikatrik/Qwen3.8-JP-9B-Distill-1125

## Resumen

Qwen3.8-JP-9B-Distill-1125 es un ajuste fino del modelo empero-ai/Qwen3.8-9B-Distill (revisión 0934f3d) publicado por el usuario ikatrik. Su objetivo no es mejorar las capacidades generales del modelo base, sino adaptar el vocabulario del tokenizador al japonés: se sustituyen 18.446 tokens poco utilizados en japonés por palabras japonesas seleccionadas a partir de los tokens chinos del modelo original y de segmentaciones con Sudachi. El resultado es que una misma frase en japonés se codifica con aproximadamente un 6% menos de tokens que con el modelo base, lo que reduce coste de cómputo y latencia en inferencia en japonés.

El modelo conserva la arquitectura y el tamaño del base: 8.608.477.696 parámetros (etiquetado como 9B por el autor) y una ventana de contexto que en la práctica alcanza 163.840 tokens en una GPU de 12 GB con cuantización de caché KV a q8_0 y flash attention activada. Se distribuye exclusivamente en formato GGUF, en cinco cuantizaciones (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y BF16), y está pensado para ejecutarse con llama.cpp en versiones compatibles con Qwen3.5 (verificado con b12418).

La relevancia de esta ficha es doble: por un lado, documenta una técnica de adaptación de vocabulario poco habitual (token swapping con reentrenamiento en cuatro fases y LoRA); por otro, expone con transparencia sus costes, ya que el autor reporta que el bits per byte en japonés empeora un 1,5% respecto al modelo base y que el número de aciertos en una prueba de 27 preguntas baja de 26 a 24. No se han publicado resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.8-9B-Distill; detalles internos no disponibles) |
| Parametros totales | 8.608.477.696 (9B segun el autor) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 163.840 tokens verificado en GPU de 12 GB con `-ctk q8_0 -ctv q8_0 -fa on`; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exclusivamente; no se publican safetensors) |
| Tamano del vocabulario | 206.166 tokens (original: 248.320; 18.446 tokens japoneses sustituidos) |
| Tamano del repositorio | 27,9 GB |
| Herramienta de inferencia | llama.cpp (probado con build b12418) |

## Arquitectura y entrenamiento

El modelo parte de empero-ai/Qwen3.8-9B-Distill, un transformer decoder-only de aproximadamente 8,6 mil millones de parámetros. La intervención principal es sobre el tokenizador: se identifican tokens del vocabulario original con uso marginal en japonés y se reemplazan por palabras japonesas derivadas de dos fuentes, los equivalentes japoneses de tokens chinos del modelo base y segmentos obtenidos con Sudachi. El vocabulario pasa de 248.320 a 206.166 entradas. El token de ID 5092, `[PAD5092]`, queda reservado como hueco para futuras ampliaciones y no se activa con texto normal.

El reentrenamiento se organiza en cuatro fases. La fase 1 ajusta las embeddings de entrada y salida de los tokens sustituidos usando artículos de Wikipedia en japonés e inglés y frases de CC-100 japonés que contienen esos tokens, con un término de pérdida que acerca las representaciones de las capas intermedias a las del modelo original. La fase 2 ajusta únicamente las embeddings de salida con CC-100 japonés. La fase 3 aplica LoRA sobre las capas 12 a 31 con CC-100 japonés, WikiText-103 y the-stack-smol-xl (para preservar inglés y código), añadiendo una pérdida que aproxima la distribución de salida a la del modelo base. La fase 4 extiende el LoRA a las 32 capas y ajusta las embeddings de entrada de tokens poco frecuentes, con la misma mezcla de datos. Los adaptadores LoRA se fusionan en los pesos finales. No se documenta el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en japonés e inglés, heredada del modelo base.
- Codificación más eficiente del japonés: aproximadamente un 6% menos tokens para el mismo texto (6.225 frente a 6.624 tokens en una muestra de 100 documentos).
- Procesamiento de prompts largos: el autor reporta una reducción del tiempo de procesamiento de 621,2 s a 596,4 s en 380 documentos japoneses sobre Tesla P100.
- Modo thinking disponible en la arquitectura base, aunque el autor indica que todas las pruebas se realizaron con thinking desactivado y no lo ha evaluado.
- Soporte de tool calling: no verificado por el autor.
- Entrada de imágenes: no verificada por el autor.
- Capacidades multilingües limitadas a japonés e inglés; el resto de idiomas (chino, coreano, ruso, árabe, tailandés) consumen más tokens que en el modelo base.

## Casos de uso

- Procesamiento de documentación técnica en japonés: el ahorro de tokens reduce el coste por documento en pipelines de resumen, extracción de entidades o clasificación sobre corpus japoneses extensos.
- Chatbot de atención al cliente en japonés: el contexto verificado de 163.840 tokens permite mantener conversaciones multi-turno con historial largo e instrucciones de sistema detalladas en una única GPU de 12 GB.
- Búsqueda semántica y RAG sobre corpus japoneses: la tokenización más compacta disminuye el número de fragmentos necesarios y el coste de indexación en bases vectoriales.
- Traducción asistida japonés-inglés: el modelo conserva el inglés mediante el entrenamiento con WikiText-103, lo que permite tareas bidireccionales en entornos de documentación.
- Despliegue en hardware de gama media: la cuantización Q4_K_M (5,44 GB) permite ejecución en GPUs consumer de 8 GB o en CPU con llama.cpp, útil para prototipos y entornos sin aceleradores dedicados.
- Generación de código con comentarios en japonés: el entrenamiento incluye the-stack-smol-xl para preservar capacidad de código, aunque el autor no ha evaluado esta faceta específicamente.
- Investigación sobre adaptación de vocabulario: el modelo sirve como caso de estudio reproducible de token swapping con LoRA en cuatro fases para equipos que trabajen en eficiencia de tokenizadores.

## Benchmarks y rendimiento

El autor solo publica una evaluación interna comparativa con el modelo base, ambos en Q8_0 y ejecutados en una Tesla P100 de 12 GB. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

| Metrica | Modelo base | Este modelo |
|---|---:|---:|
| Tokens en 100 documentos japoneses | 6.624 | 6.225 |
| Bits per byte en japonés (menor es mejor) | 0,93603 | 0,95005 |
| Tiempo de lectura de 380 documentos japoneses | 621,2 s | 596,4 s |
| Aciertos en prueba de 27 preguntas en japonés | 26 | 24 |

El bits per byte empeora un 1,5% respecto al base, lo que indica una ligera pérdida de calidad de modelado del lenguaje japonés a cambio de eficiencia de tokenización. El resto de cuantizaciones no fue evaluado por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere unos 5,44 GB de pesos; Q5_K_M, 6,23 GB; Q6_K, 7,07 GB; Q8_0, 9,16 GB; BF16, 17,23 GB. A ello hay que sumar la caché KV, que con `-ctk q8_0 -ctv q8_0` y flash attention permite alcanzar 163.840 tokens de contexto en 12 GB.
- GPU recomendadas: el autor verificó el funcionamiento en Tesla P100 de 12 GB. Por tamaño, caben en RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A10, L4, A100 y H100; las GPU de 8 GB pueden ejecutar Q4_K_M con contexto reducido.
- Cabe en GPU consumer: sí, con Q4_K_M o Q5_K_M en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp (build b12418 verificado), con `llama-server`; también es compatible con cualquier frontend que consuma GGUF a través de llama.cpp (por ejemplo, Ollama, aunque no se ha verificado explícitamente). No se menciona soporte de vLLM ni TGI para este formato.
- Throughput y latencia: el autor solo reporta tiempos de procesamiento de prompt (596,4 s para 380 documentos en P100). No se publican métricas de generación por segundo.
- Parámetros de muestreo recomendados: temperatura 0,6, top_p 0,95, top_k 20, con `enable_thinking: false` en `chat_template_kwargs`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-JP-9B-Distill-1125 | 8,6B | 163.840 verificado | ja, en | Apache 2.0 | GGUF | Vocabulario adaptado al japonés, 6% menos tokens |
| empero-ai/Qwen3.8-9B-Distill (base) | 8,6B | no disponible | no disponible | Apache 2.0 | no disponible | Modelo de partida; mejor bits per byte en japonés (0,93603) |
| Otros modelos japoneses de ~7-9B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se han publicado comparaciones con modelos alternativos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Alucinación en historia de Japón: el autor documenta que el modelo responde con seguridad a preguntas de historia japonesa con contenido factualmente incorrecto, por ejemplo describiendo el incidente del oráculo de Usa Hachiman como un suceso de la era Showa. El modelo base presenta la misma tendencia.
- Sesgo geopolítico: en preguntas sobre el Tíbet reproduce la postura del gobierno chino y escribe "西藏" en lugar de "チベット"; también puede mezclar caracteres simplificados chinos en frases japonesas.
- Regresión de calidad: el bits per byte en japonés empeora un 1,5% y los aciertos en la prueba interna de 27 preguntas caen de 26 a 24 respecto al modelo base.
- Idiomas distintos del japonés e inglés: chino, coreano, ruso, árabe y tailandés consumen más tokens que en el modelo original, lo que encarece su procesamiento.
- Capacidades no verificadas: el autor no ha probado el modo thinking activado, el tool calling ni la entrada de imágenes, por lo que no se recomienda asumir su correcto funcionamiento en producción.
- Formato único: solo se distribuye GGUF; no hay safetensors ni pesos originales, lo que limita el reentrenamiento o la conversión a otros formatos sin pasar por llama.cpp.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios especializados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikatrik/Qwen3.8-JP-9B-Distill-1125
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Organización Empero: https://huggingface.co/empero-ai
- Organización Qwen: https://huggingface.co/Qwen
- Dataset hotchpotch/cc100-ja-documents: https://huggingface.co/datasets/hotchpotch/cc100-ja-documents
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Salesforce/wikitext: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset bigcode/the-stack-smol-xl: https://huggingface.co/datasets/bigcode/the-stack-smol-xl
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Segmentador Sudachi: https://github.com/WorksApplications/Sudachi
