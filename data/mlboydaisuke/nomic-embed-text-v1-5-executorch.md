# mlboydaisuke/nomic-embed-text-v1.5-ExecuTorch

## Resumen

El modelo `mlboydaisuke/nomic-embed-text-v1.5-ExecuTorch` es una conversión del modelo de embeddings `nomic-ai/nomic-embed-text-v1.5` al formato ExecuTorch, pensada para ejecución en dispositivos (on-device) sin salida de datos a servidores. Desarrollado por mlboydaisuke, aprovecha la arquitectura BERT modificada con rotary embeddings y SwiGLU del modelo original, y lo empaqueta como un gráfico `.pte` que puede ejecutarse con el runtime de ExecuTorch y el backend XNNPACK. La entrada se fija a secuencias de 256 tokens y produce un vector de 768 dimensiones, con soporte de truncación matryoshka (768 a 512, 256, 128 o 64 dimensiones).

La relevancia actual reside en la demanda de modelos de embeddings eficientes para aplicaciones de búsqueda semántica, recuperación de documentos y clustering que funcionen localmente en móviles, portátiles o dispositivos de borde, sin depender de la nube. Este repositorio ofrece varias versiones cuantizadas (fp32, fp16, Core ML) y documenta detalladamente el proceso de conversión y verificación, lo que lo convierte en una referencia práctica para integrar embeddings en pipelines de producción on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT modificado con rotary embeddings y SwiGLU (12 capas, 768 dimensiones, 30.528 tokens de vocabulario) |
| Parametros totales | no disponible (no se indica en la informacion; el modelo base nomic-embed-text-v1.5 tiene aproximadamente 137M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (entrada fija `[1, 256]`; el modelo original soporta 8192 tokens, pero esta conversion fija la secuencia a 256) |
| Tipos de cuantizacion | fp32, fp16, Core ML (fp16) ; se menciona int8 (208 MB) pero no se distribuye en este repo |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (tambien hay versiones para Core ML) |

## Arquitectura y entrenamiento

El modelo base `nomic-ai/nomic-embed-text-v1.5` es un BERT con dos innovaciones clave: rotary positional embeddings y una MLP con activacion SwiGLU. El codigo de modelado no esta en `transformers` sino en `nomic-ai/nomic-bert-2048`, por lo que se requiere `trust_remote_code=True` y `einops`. El modelo fue entrenado con una estrategia de embeddings matryoshka, lo que permite que un prefijo del vector de salida (por ejemplo, las primeras 128 dimensiones) sea utilizable como embedding de menor dimensionalidad, a cambio de una ligera perdida de precision.

El entrenamiento original incluye prefijos de texto obligatorios: `search_query: ` para consultas, `search_document: ` para documentos, y `classification: ` y `clustering: ` para tareas no relacionadas con recuperacion. En la conversion a ExecuTorch, el grafo exportado no incluye estos prefijos; deben anadirse antes de la tokenizacion. La pooling se realiza con media (mean pooling) y no se normaliza dentro del grafo; la normalizacion y la truncacion matryoshka se aplican externamente (se recomienda usar `layer_norm` antes de truncar y luego `F.normalize`).

La conversion se realizo mediante `torch.export` y `to_edge_transform_and_lower` con el backend XNNPACK, segun los scripts del repositorio `executorch-models` de john-rocky.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones a partir de secuencias de hasta 256 tokens.
- Truncacion matryoshka: el vector completo se puede reducir a 512, 256, 128 o 64 dimensiones mediante `layer_norm` y `normalize`, manteniendo utilidad para busqueda y recuperacion.
- Similitud coseno entre embeddings para busqueda semantica, recuperacion de documentos y clustering.
- Ejecucion on-device con XNNPACK (CPU) o Core ML (iOS), sin dependencias externas en tiempo de inferencia.
- Compatibilidad con pipelines de sentence-transformers (aunque se recomienda leer la configuracion de pooling del modelo, que es `mean` y no normaliza).
- Soporte de prefijos de tarea: `search_query`, `search_document`, `classification`, `clustering` (deben anadirse antes de tokenizar).
- No soporta generacion de texto, tool calling ni agentes; es un modelo puramente encoder.

## Casos de uso

- Busqueda semantica local en aplicaciones moviles: el modelo permite indexar documentos y consultas en el dispositivo, generando embeddings de 256 tokens que se comparan por coseno. Su tamano (fp16 ~274 MB) y ejecucion en CPU lo hacen apto para apps iOS/Android.
- Recuperacion de documentos (RAG) sin conexion: para asistentes personales o sistemas de conocimiento locales, se puede indexar un corpus con `search_document: ` y consultar con `search_query: `. La ventana de 256 tokens es suficiente para parrafos cortos o fragmentos.
- Clustering y organizacion de notas: con el prefijo `clustering: ` se pueden agrupar notas o correos por tematica, aprovechando la truncacion matryoshka para reducir el tamano del indice.
- Clasificacion de texto en dispositivo: con el prefijo `classification: ` se puede usar como encoder para una capa de clasificacion adicional, manteniendo la privacidad de los datos.
- Busqueda en bases de conocimiento locales: en aplicaciones de documentacion tecnica, se puede generar un indice de embeddings de 128 dimensiones (truncado) para ahorrar memoria, manteniendo una buena precision.
- Comparacion de similaridad de frases en herramientas de analisis: para medir similitud entre preguntas o respuestas en un chatbot, se pueden generar embeddings y calcular distancias coseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye una tabla de verificacion interna que mide la fidelidad de las versiones convertidas frente al modelo original en eager:

| build | archivo | tamaño (MB) | tiempo Mac (ms)* | peor coseno vs eager | presupuesto de recuperacion |
|---|---|---|---|---|---|
| fp32 | `embed_nomic_embed_text_v15_xnnpack_fp32.pte` | 547.2 | 52.0 | 1.000000 | 0% |
| fp16 | `embed_nomic_embed_text_v15_xnnpack_fp16.pte` | 273.9 | 124.5 | 0.999999 | 8% |
| Core ML (fp16, iOS) | `embed_nomic_embed_text_v15_coreml_all.pte` | 274.8 | 8.2 | 0.999795 | 44% |

Nota: el tiempo de Mac es la mediana de 10 ejecuciones con una secuencia de 256 tokens; el modelo eager en fp32 tarda 41.6 ms en la misma maquina. El presupuesto de recuperacion indica el porcentaje de casos en los que el error de puntuacion supera el margen de decision; todas las versiones mantienen el top-1 correcto en las 8 frases de prueba.

## Requisitos de hardware

- Inferencia on-device con CPU: los archivos `.pte` se ejecutan con XNNPACK, no requieren GPU.
- Tamaño de memoria: fp32 ~547 MB, fp16 ~274 MB, Core ML ~275 MB. Caben en cualquier dispositivo con al menos 1 GB de RAM disponible.
- GPU: no necesaria; se puede usar en Mac con Core ML (aceleracion por Apple Silicon) o en CPUs ARM/x86.
- Despliegue: se requiere el runtime de ExecuTorch (C++ o Python) y el backend XNNPACK. No es compatible con vLLM, llama.cpp u Ollama porque no es un modelo de generacion.
- Throughput: en un Mac arm64, la latencia es de ~52 ms (fp32), ~124 ms (fp16) y ~8 ms (Core ML) para una secuencia de 256 tokens. En dispositivos moviles puede variar segun el hardware.

## Comparativa con modelos similares

| Modelo | Contexto | Dimensiones | Formato | Licencia | Uso on-device |
|---|---|---|---|---|---|
| `nomic-ai/nomic-embed-text-v1.5` (base) | 768 tokens | 768 | safetensors, ONNX | apache-2.0 | Requiere servidor o runtime completo |
| `mlboydaisuke/nomic-embed-text-v1.5-ExecuTorch` | 256 tokens (fijo) | 768 | `.pte` (ExecuTorch) | apache-2.0 | Ejecucion local con XNNPACK/Core ML |
| OpenAI `text-embedding-3-small` | 8191 tokens | 1536 (truncable) | API | propietaria | No on-device, requiere conexion |
| `BAAI/bge-small-en-v1.5` | 512 tokens | 384 | safetensors, ONNX | MIT | Puede usarse con ONNX Runtime, pero no esta optimizado para ExecuTorch |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La ventana de contexto esta fijada a 256 tokens en esta conversion; el modelo original soporta 768, por lo que no se pueden procesar documentos largos directamente.
- El grafo no normaliza el embedding; es necesario aplicar `layer_norm` y `normalize` externamente, especialmente si se va a truncar el vector.
- Los prefijos de tarea (`search_query`, `search_document`, etc.) son obligatorios y no estan incrustados en el grafo; omitirlos produce vectores plausibles pero con peor rendimiento de recuperacion.
- La version int8 no se distribuye porque no cumple el criterio de fidelidad (el error de puntuacion es 480% del margen de decision). Si se necesita menor tamaño, se recomienda fp16.
- La ejecucion con Core ML en iOS puede tener una ligera perdida de precision (coseno 0.999795), aunque mantiene el top-1 en las pruebas.
- El modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas no esta documentado.
- No se puede usar como modelo generativo ni para tool calling; es exclusivamente para embeddings.
- La licencia apache-2.0 permite uso comercial, pero se debe verificar que el modelo base cumple la misma licencia (asi es).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/nomic-embed-text-v1.5-ExecuTorch
- Modelo base (nomic-ai/nomic-embed-text-v1.5): https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Model card del modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5/blob/main/README.md
- Repositorio de conversion (executorch-models): https://github.com/john-rocky/executorch-models
- Referencia en Ollama (modelo original): https://ollama.com/library/nomic-embed-text:v1.5
- Model card en Docker: https://github.com/docker/model-cards/blob/main/ai/nomic-embed-text-v1.5.md
- Paper del modelo base (arxiv 2402.01613): https://arxiv.org/abs/2402.01613
