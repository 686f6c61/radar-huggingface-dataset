# mlboydaisuke/paraphrase-multilingual-MiniLM-L12-v2-ExecuTorch

## Resumen

Este modelo es una versión optimizada para ejecución en dispositivos (on-device) del conocido `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un sistema de embeddings de frases multilingüe que genera vectores de 384 dimensiones. El autor `mlboydaisuke` ha exportado el modelo al formato ExecuTorch (el runtime de inferencia de PyTorch para edge), incorporando el pooling directamente en el grafo de computación. El objetivo es permitir búsqueda semántica, clustering y recuperación de información sin conexión, manteniendo la privacidad de los datos.

La arquitectura subyacente es un BERT de 12 capas con 118 millones de parámetros. La ventana de contexto está fijada en 256 tokens. Se ofrecen tres variantes de exportación: XNNPACK fp32, XNNPACK fp16 y Core ML fp32, con tamaños que oscilan entre 235 y 470 MB. La verificación publicada muestra que la versión Core ML es la más rápida (3.9 ms en un Mac arm64), mientras que la versión XNNPACK fp32 es incluso más lenta que el eager original. No se ha podido exportar en int8 por un error de cuantificación.

La relevancia actual de este modelo radica en la creciente demanda de aplicaciones de IA local que respeten la privacidad y funcionen sin conexión. Al estar licenciado bajo Apache-2.0, puede integrarse en productos comerciales sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT de 12 capas (encoder) |
| Parámetros totales | 118 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (fija) |
| Tipos de cuantización | fp32 y fp16 (int8 no disponible) |
| Idiomas soportados | no disponible (el modelo original es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente `.pte` de ExecuTorch) |

## Arquitectura y entrenamiento

El modelo original fue entrenado por `sentence-transformers` como un modelo de embeddings de frases. La arquitectura es un BERT de 12 capas con una capa de pooling que produce un vector de 384 dimensiones. En esta versión ExecuTorch, el pooling está integrado en el grafo de forma explícita: se usa **media sobre la máscara de atención** y **no se aplica normalización**. Esta elección es crítica porque otros modelos de la misma familia (por ejemplo, `bge-small-en-v1.5` usa CLS pooling y normalización) y aplicar un pooling incorrecto daría vectores aparentemente válidos pero con resultados de similitud erróneos.

El entrenamiento original no se detalla en la información proporcionada; se desconoce el número de tokens, la composición del dataset y si se aplicaron técnicas de ajuste como RLHF o DPO. La exportación a ExecuTorch no modifica los pesos, solo convierte el modelo a un formato optimizado para inferencia en dispositivos con el backend XNNPACK o Core ML.

## Capacidades

- Generación de embeddings de frases (sentence embeddings) de 384 dimensiones.
- Búsqueda semántica y similaridad de frases multilingües (el modelo original soporta más de 50 idiomas).
- Clustering y agrupación de textos.
- Inferencia en dispositivos sin conexión, gracias a la integración con ExecuTorch.
- No incluye soporte para tool calling, agentes o razonamiento multi-paso, ya que es un modelo de embeddings, no un modelo generativo.
- La entrada se compone de `input_ids` y `attention_mask` con forma `[1, 256]` y salida `[1, 384]`.

## Casos de uso

- **Búsqueda semántica en aplicaciones móviles**: permite buscar en notas, contactos o documentos almacenados en el dispositivo sin enviar datos a servidores externos. El modelo genera embeddings de consultas y documentos, y se calcula la similitud del coseno localmente.
- **Clustering de mensajes o correos**: agrupa correos electrónicos, mensajes de chat o entradas de blog según su contenido semántico, útil para clasificar y organizar grandes volúmenes de texto en el dispositivo.
- **Deduplicación de contenido**: detecta documentos o textos duplicados comparando sus embeddings, útil en sistemas de gestión documental offline.
- **Sistema de recomendación local**: un lector de libros o artículos puede sugerir contenido similar basándose en los embeddings de los textos leídos, todo sin conexión.
- **Asistente de transcripción**: el repositorio de Audioscrape utiliza este modelo para búsqueda rápida en transcripciones de audio en varios idiomas, aprovechando su carácter multilingüe.
- **Comparación de frases en aplicaciones educativas**: para evaluar la similitud entre respuestas de estudiantes y respuestas modelo, con ejecución local para mantener la privacidad de los datos académicos.

## Benchmarks y rendimiento

La model card incluye una verificación realizada en un Mac arm64 (fecha 2026-08-23). Los resultados de latencia y tamaño de archivo son:

| Build | Tamaño | Latencia (ms) | Peor coseno vs eager |
|---|---|---|---|
| XNNPACK fp32 | 470.2 MB | 28.6 | 1.000000 |
| XNNPACK fp16 | 235.3 MB | 52.0 | 1.000000 |
| Core ML fp32 | 235.5 MB | 3.9 | 0.999994 |
| PyTorch eager fp32 | - | 16.8 | referencia |

Además, se evaluó la utilidad de los vectores comparando frases relacionadas y no relacionadas. Por ejemplo, una frase sobre paráfrasis obtuvo una similitud de 0.511 frente a una frase no relacionada con -0.135. En un test multilingüe, la frase en japonés y la frase en inglés relacionada obtuvieron 0.265, mientras que una frase sobre el tiempo obtuvo -0.046. Estos datos demuestran que los embeddings son discriminativos.

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- **VRAM**: al ser un modelo de embeddings ejecutado en CPU, no se requiere VRAM específica; los tamaños de archivo son de 235 a 470 MB, por lo que caben en la memoria de cualquier dispositivo moderno.
- **GPU**: no se requiere GPU; la ejecución se realiza mediante XNNPACK (CPU) o Core ML (Apple Silicon). En Mac arm64, Core ML ofrece la mejor latencia (3.9 ms).
- **GPU de consumo**: no aplicable.
- **Opciones de despliegue**: se puede integrar en aplicaciones móviles (iOS/Android) mediante ExecuTorch, o en servidores con backends XNNPACK. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que son para modelos generativos.
- **Latencia**: en el Mac de prueba, la latencia es de 3.9 ms con Core ML, 28.6 ms con XNNPACK fp32 y 52.0 ms con XNNPACK fp16. El throughput no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Pooling | Normalización | Formato | Tamaño (fp32) | Latencia (ms) |
|---|---|---|---|---|---|---|---|
| paraphrase-multilingual-MiniLM-L12-v2 (original) | 118M | 384 | media | no | PyTorch | ~470 MB | 16.8 (eager) |
| **Este modelo (ExecuTorch XNNPACK fp32)** | 118M | 384 | media | no | ExecuTorch | 470.2 MB | 28.6 |
| **Este modelo (ExecuTorch Core ML fp32)** | 118M | 384 | media | no | ExecuTorch | 235.5 MB | 3.9 |
| bge-small-en-v1.5 (mencionado en la model card) | 33M | 384 | CLS | sí | PyTorch | - | - |

No hay datos de otros modelos de embeddings convertidos a ExecuTorch para comparar directamente. La tabla se basa únicamente en la información proporcionada.

## Limitaciones y advertencias

- **Pooling y normalización**: el modelo usa media pooling sin normalización. Si se espera un comportamiento normalizado (como en otros modelos de la familia), los resultados de similitud serán erróneos. La decisión de incluir el pooling en el grafo es correcta, pero hay que conocer esta particularidad al integrarlo en un pipeline.
- **Secuencia de entrada fija**: la longitud de entrada está limitada a 256 tokens. Textos más largos deben ser troceados o truncados, lo que puede perder información.
- **Rendimiento de XNNPACK**: la versión XNNPACK fp32 es más lenta que la ejecución eager de PyTorch (28.6 ms frente a 16.8 ms). En plataformas sin Core ML, puede no ser la opción óptima.
- **int8 no disponible**: la cuantificación a int8 falla durante la exportación, por lo que no se pueden obtener modelos más ligeros con esta arquitectura.
- **Idiomas no especificados**: aunque el modelo original es multilingüe, esta ficha no indica la lista concreta de idiomas soportados en la versión ExecuTorch.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe revisar que el modelo original también tenga esta licencia (así es, según la model card).
- **Alucinación**: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación en el sentido de generar contenido falso. Sin embargo, puede producir embeddings que no reflejen correctamente el significado si el texto de entrada contiene ruido o es demasiado corto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlboydaisuke/paraphrase-multilingual-MiniLM-L12-v2-ExecuTorch)
- [Modelo original de sentence-transformers](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- [Versión ONNX del modelo](https://huggingface.co/onnx-models/paraphrase-multilingual-MiniLM-L12-v2-onnx)
- [Repositorio de conversión ExecuTorch](https://github.com/john-rocky/executorch-models)
- [Repositorio GitHub con usos del modelo](https://github.com/Audioscrape/paraphrase-multilingual-minilm-l12-v2)
- [Página en ModelScope](https://www.modelscope.cn/Ceceliachenen/paraphrase-multilingual-MiniLM-L12-v2/summary)
