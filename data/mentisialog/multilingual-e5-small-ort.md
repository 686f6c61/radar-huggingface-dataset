# mentisialog/multilingual-e5-small-ort

## Resumen

`mentisialog/multilingual-e5-small-ort` es una conversión al formato ORT (ONNX Runtime) del modelo de embeddings de frases `intfloat/multilingual-e5-small`, desarrollado originalmente por el equipo de Microsoft Research (intfloat). No se trata de un modelo nuevo ni reentrenado: es exactamente el mismo grafo que ONNX Runtime 1.31.0 genera a partir del `model.onnx` original, guardado una sola vez en disco para evitar la optimización en cada carga. Los pesos permanecen en float32, sin cuantización ni poda.

Su relevancia es puramente de despliegue: al cargarse con los inicializadores mapeados en memoria (`use_memory_mapped_ort_model`), reduce drásticamente el consumo de memoria en dispositivos con recursos limitados. En un iPad con chip A16, la carga pasa de 1.351 MB a 264 MB de pico de memoria y de 1,03–1,23 s a 0,64 s, manteniendo vectores bit-idénticos a los del modelo fuente. Está pensado para integrarse en Memoa for iOS, una aplicación que usa embeddings multilingües en el propio dispositivo.

El modelo subyacente es un transformer encoder de tipo E5, diseñado para generar embeddings de texto con instrucciones de prefijo (`query: ` o `passage: `), con soporte multilingüe y una ventana de contexto corta (típica de modelos sentence-transformers, 512 tokens). La ficha técnica que sigue describe tanto el modelo base como esta conversión ORT concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (E5, base `multilingual-e5-small`) |
| Parametros totales | no disponible (el modelo base `multilingual-e5-small` ronda los 118 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los modelos E5-small se entrenan habitualmente con 512 tokens) |
| Tipos de cuantizacion | no disponible; esta conversión es float32 sin cuantizar |
| Idiomas soportados | multilingue (segun el modelo base); lista concreta no disponible |
| Licencia | MIT |
| Formato de pesos | ORT (ONNX Runtime flatbuffer); `model.ort` de 470.350.304 bytes |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `intfloat/multilingual-e5-small`: un transformer encoder bidireccional que produce embeddings de frase, entrenado con objetivos de similitud contrastiva sobre pares texto-texto multilingües. Los detalles de datos de entrenamiento, número de tokens, composición del dataset y uso de RLHF/DPO no se recogen en la información proporcionada; deben consultarse en la model card original de intfloat (ver enlaces).

Esta conversión concreta no introduce ningún cambio algorítmico ni de pesos. Se generó con ONNX Runtime 1.31.0 (wheel de Python, macOS arm64) usando únicamente el execution provider de CPU, con `intra_op_num_threads=2`, `inter_op_num_threads=2` y `GraphOptimizationLevel.ORT_ENABLE_ALL`, guardando el grafo optimizado con `session.save_model_format=ORT`. El autor advierte que una optimización a `ORT_ENABLE_ALL` puede incorporar transformaciones de layout específicas de hardware (NCHWc para convoluciones en x86), pero e5 no contiene convoluciones y la paridad se verificó en arm64 (Mac M1 e iPad A16). Dos conversiones independientes difieren solo en ~1 KB de metadatos del flatbuffer, con vectores idénticos.

## Capacidades

- Generación de embeddings de texto (sentence embeddings) para búsqueda semántica y similitud.
- Soporte multilingüe heredado del modelo base E5.
- Uso con prefijos de instrucción: `query: ` para consultas y `passage: ` para documentos indexados.
- Vectores bit-idénticos al `model.onnx` fuente cuando se carga con inicializadores mapeados en memoria.
- Carga con memoria mapeada desde fichero, apta para entornos con restricciones de RAM (móvil, edge).
- No es un modelo generativo: no produce texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles iOS: el formato ORT con memoria mapeada permite indexar y consultar pasajes en el dispositivo con un pico de ~264 MB, frente a 1.351 MB del ONNX original, lo que lo hace viable en un iPad o iPhone sin descargar el modelo a RAM completa.
- Recuperación aumentada (RAG) en local: generar embeddings de fragmentos de documentos con prefijo `passage: ` y de la consulta del usuario con `query: ` para alimentar un pipeline de recuperación sin depender de servicios en la nube.
- Clasificación y agrupamiento de textos multilingües: usar los embeddings como features para clustering, deduplicación o etiquetado en pipelines de NLP.
- Detección de duplicados y similitud documental: comparar vectores con similitud coseno para identificar contenido repetido en corpus multilingües.
- Motor de recomendación de contenido basado en texto: representar artículos o notas y calcular vecinos más próximos para sugerencias dentro de una app.
- Filtrado y moderación semántica: comparar mensajes contra un conjunto de referencia de textos problemáticos usando similitud de embeddings.
- Integración en apps de notas o memoria personal (como Memoa): almacenar embeddings de notas del usuario y recuperarlas por significado, todo en el dispositivo y con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión solo reporta métricas de paridad y despliegue, no de calidad de embeddings:

| Metrica | Valor |
|---|---|
| Paridad de vectores frente a `model.onnx` | bit-idéntica en 33 textos de referencia (25 pasajes, 8 consultas) |
| Diferencia maxima frente a vectores de referencia | 9,69e-08 |
| Codigos int8 (x 640) | identicos |
| Pico de memoria de carga en iPad A16 (este fichero) | 264 MB |
| Pico de memoria de carga en iPad A16 (`model.onnx`) | 1.351 MB |
| Tiempo de carga en iPad A16 (este fichero) | 0,64 s |
| Tiempo de carga en iPad A16 (`model.onnx`) | 1,03–1,23 s |

## Requisitos de hardware

- Inferencia en CPU: el fichero está optimizado para el execution provider de CPU de ONNX Runtime 1.31.0; no requiere GPU.
- VRAM: no aplica para GPU; el consumo relevante es RAM. Pico de ~264 MB en iPad A16 con inicializadores mapeados, frente a ~1.351 MB leyendo el `model.onnx` completo.
- Cabe en hardware móvil y consumer: verificado en Mac M1 y iPad A16; por tamaño (0,5 GB de repo) es apto para dispositivos con RAM moderada.
- Opciones de despliegue: ONNX Runtime 1.31.0 con `session.load_model_format=ORT`, `session.use_memory_mapped_ort_model=1` y `session.use_ort_model_bytes_for_initializers=1`. Para otros runtimes (vLLM, llama.cpp, Ollama, TGI) no hay soporte indicado, ya que no es un modelo generativo.
- Latencia y throughput: solo se reporta el tiempo de carga (0,64 s en iPad A16); no hay datos de latencia por embedding ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `mentisialog/multilingual-e5-small-ort` | no disponible (~118 M segun base) | no disponible | ORT float32 | MIT | Conversión de despliegue; paridad bit-idéntica con el ONNX fuente |
| `intfloat/multilingual-e5-small` | no disponible (~118 M) | no disponible | safetensors / ONNX | MIT | Modelo original; misma calidad de embeddings, mayor consumo de memoria en carga |
| `intfloat/multilingual-e5-base` | no disponible | no disponible | safetensors / ONNX | MIT | Variante mayor de la familia E5; más calidad a costa de más cómputo (datos no disponibles en la información proporcionada) |
| `intfloat/multilingual-e5-large` | no disponible | no disponible | safetensors / ONNX | MIT | Variante grande de la familia E5; no apta para despliegue móvil (datos no disponibles en la información proporcionada) |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni responde preguntas directamente; solo genera embeddings.
- Riesgo de alucinación no aplica en el sentido generativo, pero los embeddings pueden producir recuperaciones semánticamente plausibles y factualmente erróneas si el corpus indexado es de baja calidad.
- Sesgos: hereda los sesgos del corpus de entrenamiento del modelo base; no se documentan mitigaciones específicas en esta conversión.
- Idiomas: se anuncia multilingüe, pero la lista concreta de idiomas y su cobertura no está disponible en la información proporcionada.
- Contexto: la longitud máxima de entrada no se documenta aquí; entradas largas pueden truncarse según la configuración del tokenizador del modelo base.
- Licencia MIT: permite uso comercial, pero debe conservarse la atribución al modelo original de intfloat (ver `LICENSE` y cita en la model card).
- Dependencia de versión: la carga con memoria mapeada requiere ONNX Runtime 1.31.0 y las opciones de sesión exactas indicadas; otras versiones pueden no reproducir la paridad ni el ahorro de memoria.
- Advertencia de layout: aunque e5 no tiene convoluciones, el autor señala que modelos optimizados con `ORT_ENABLE_ALL` pueden contener transformaciones específicas de hardware; la paridad se verificó solo en arm64 (M1 y A16), no en x86.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de adopción ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mentisialog/multilingual-e5-small-ort
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Paper de referencia (Multilingual E5 Text Embeddings): https://arxiv.org/abs/2402.05672
- Documentación del formato ORT de ONNX Runtime: https://onnxruntime.ai/docs/performance/model-optimizations/ort-format-models.html
- Repositorio de la app Memoa for iOS (script de conversión `scripts/convert-e5-ort.sh`): no disponible como URL en la información proporcionada
- Demo o espacio de inferencia: no disponible
