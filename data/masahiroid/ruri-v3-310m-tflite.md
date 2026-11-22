# masahiroid/ruri-v3-310m-tflite

## Resumen

`ruri-v3-310m-tflite` es una conversión no oficial al formato LiteRT (`.tflite`) del modelo de embeddings de texto en japonés `cl-nagoya/ruri-v3-310m`, desarrollado originalmente por el grupo cl-nagoya. El modelo base es un encoder de frases basado en la arquitectura ModernBERT, con 310 millones de parámetros, diseñado para tareas de similitud semántica y extracción de características en japonés. Esta conversión, publicada por el usuario masahiroid, empaqueta el modelo en tres variantes de longitud de secuencia fija (128, 256 y 512 tokens) en precisión fp32, pensadas para su ejecución en Android y otros entornos con el runtime LiteRT.

El problema que resuelve esta conversión es la portabilidad: el modelo original depende de PyTorch y de la librería Transformers, lo que dificulta su despliegue en dispositivos móviles. Al convertirlo a `.tflite`, se puede ejecutar en el intérprete LiteRT dentro de aplicaciones Android sin necesidad de un servidor, habilitando casos de uso como búsqueda semántica local, RAG en el dispositivo o reranking de documentos sin enviar datos a la nube.

La relevancia actual radica en la creciente demanda de modelos de embeddings ligeros y ejecutables localmente para aplicaciones de recuperación de información en japonés, un idioma con menos cobertura que el inglés en el ecosistema de modelos abiertos. La licencia Apache 2.0 facilita su integración comercial. El repositorio ocupa 3,8 GB e incluye los ficheros del tokenizador copiados del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parámetros totales | 310 millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens según la variante del fichero `.tflite` |
| Tipos de cuantización | fp32 únicamente; no se incluyen variantes fp16 ni int8 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (LiteRT); tokenizador en formato Hugging Face |
| Entradas | `input_ids` y `attention_mask`, ambos `int32` con forma `[1, seq]` |
| Salida | embedding L2-normalizado `[1, dim]` con mean pooling integrado en el grafo |
| Longitud de secuencia | fija por fichero (128, 256, 512); requiere padding con el pad id del tokenizador |
| Runtime | LiteRT (`ai_edge_litert.interpreter`) |
| Modelo base | `cl-nagoya/ruri-v3-310m` |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, un transformer encoder con atención bidireccional optimizada para eficiencia en secuencias largas. El modelo original `cl-nagoya/ruri-v3-310m` fue entrenado por cl-nagoya como modelo de embeddings de propósito general para japonés, con 310 millones de parámetros. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos corresponden al modelo base y no se reproducen en la model card de la conversión.

La conversión a LiteRT se realizó con la herramienta `litert-torch`. El grafo resultante incorpora el mean pooling y la normalización L2, de modo que la salida es directamente un embedding normalizado. La atención se respeta mediante la máscara de atención incluida como entrada. Se generaron tres ficheros con longitudes de secuencia fijas (128, 256 y 512) para permitir al desarrollador elegir el equilibrio entre contexto y coste computacional. La conversión fue verificada contra PyTorch en el intérprete LiteRT y probada de extremo a extremo en un emulador Android (API 36.1, arm64) con la librería Kotlin `japanese-rag-kotlin`, que incluye un tokenizador Unigram que reproduce exactamente los ids de Hugging Face en 450 de 450 casos de prueba.

## Capacidades

- Generación de embeddings de frases en japonés para similitud semántica y recuperación de información.
- Extracción de características (`feature-extraction`) a partir de texto japonés.
- Soporte de prefijos de tarea del modelo base, como `検索クエリ: ` (consulta de búsqueda) y `検索文書: ` (documento de búsqueda), que deben aplicarse para obtener el rendimiento esperado.
- Salida de embeddings L2-normalizados con mean pooling integrado, lista para cálculo de similitud por producto escalar o coseno.
- Ejecución en Android mediante LiteRT, sin dependencia de PyTorch ni de servidores.
- Tokenización en dispositivo mediante la librería Kotlin `UnigramTokenizer` del repositorio `japanese-rag-kotlin`.
- Integración con `LiteRtEmbedder` y `LiteRtReranker` de la misma librería para tareas de recuperación y reranking.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento; es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica local en aplicaciones Android: el modelo genera embeddings de consultas y documentos en el dispositivo, permitiendo recuperar pasajes relevantes de una base documental japonesa sin conexión a internet ni envío de datos a servidores. La variante de 128 tokens es adecuada para pasajes cortos.
- RAG en el dispositivo para asistentes móviles: con la variante de 512 tokens se pueden indexar fragmentos de documentación más largos y alimentar un LLM local o remoto con contexto recuperado, manteniendo la privacidad de los datos del usuario.
- Reranking de resultados de búsqueda: la librería `japanese-rag-kotlin` incluye `LiteRtReranker`, que permite reordenar los documentos recuperados por un primer filtro (por ejemplo, BM25) usando la similitud semántica del modelo, mejorando la precisión del top-k.
- Clasificación y agrupamiento de textos japoneses: los embeddings normalizados sirven como entrada para clasificadores ligeros o algoritmos de clustering (k-means, DBSCAN) en tareas de organización de correos, tickets de soporte o noticias.
- Detección de duplicados y near-duplicates: el cálculo de similitud coseno entre embeddings permite identificar documentos o mensajes casi idénticos en aplicaciones de gestión documental o moderación de contenido.
- Búsqueda en bases de conocimiento personales: integración en aplicaciones de notas o gestores de referencias para recuperar entradas por significado en lugar de por coincidencia exacta de palabras clave.
- Filtrado de prompt injection en pipelines RAG: el autor menciona la demo Ruri Atlas, que visualiza dónde aterriza un prompt injection en el espacio de embeddings, lo que sugiere su uso como señal auxiliar para detectar entradas anómalas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la verificación de equivalencia funcional entre la conversión LiteRT y PyTorch, y la validación del tokenizador Kotlin con 450 de 450 casos de prueba correctos. No se proporcionan cifras de latencia en dispositivo real; el autor indica explícitamente que las mediciones de latencia en hardware físico están pendientes.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 310 millones de parámetros en fp32, lo que supone aproximadamente 1,24 GB solo para los pesos. El tamaño del repositorio es de 3,8 GB porque incluye las tres variantes de secuencia (128, 256 y 512), cada una con su copia de los pesos.
- GPU recomendadas: al ser una conversión para LiteRT, el objetivo principal son dispositivos móviles y edge. En escritorio puede ejecutarse en CPU mediante el intérprete LiteRT; no se especifican requisitos de GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de memoria libre para la variante de 512 tokens en fp32, aunque el formato no está optimizado para GPU de escritorio.
- Opciones de despliegue: intérprete LiteRT (`ai_edge_litert.interpreter`) en Python para pruebas; LiteRT en Android con la librería Kotlin `japanese-rag-kotlin`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles. El autor indica que las cifras de latencia en dispositivo real aún no se han medido; solo se verificó el funcionamiento en el emulador Android (API 36.1, arm64).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `masahiroid/ruri-v3-310m-tflite` | 310 M | 128/256/512 fijo | `.tflite` (LiteRT) | Apache 2.0 | Hugging Face, 75 descargas |
| `cl-nagoya/ruri-v3-310m` (base) | 310 M | según configuración del base | safetensors (PyTorch) | Apache 2.0 | Hugging Face |
| `cl-nagoya/ruri-v3-*` (otras tallas de la familia) | no disponible en la información | no disponible | safetensors | Apache 2.0 | Hugging Face |

La comparación principal es con el modelo base del que deriva: misma arquitectura y pesos, pero distinto formato y runtime. Frente a otras alternativas de embeddings en japonés, no se dispone en la información proporcionada de datos de rendimiento que permitan una comparación cuantitativa. La ventaja diferencial de esta conversión es la ejecución en Android mediante LiteRT, ausente en el modelo base.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor no es el desarrollador original del modelo y no se ofrece garantía de soporte.
- Solo soporta japonés; no se ha validado su comportamiento en otros idiomas.
- Longitud de secuencia fija por fichero: es necesario hacer padding hasta 128, 256 o 512 tokens, lo que puede desperdiciar cómputo en textos cortos si se elige una variante grande.
- Solo se distribuye en fp32; no hay variantes cuantizadas (fp16, int8) ni el bundle `.task` de MediaPipe, lo que limita la reducción de tamaño y el ahorro energético en móviles.
- No se han publicado mediciones de latencia en dispositivos reales; el rendimiento en producción es desconocido.
- La tokenización en dispositivo requiere una librería externa (`japanese-rag-kotlin`); el uso del tokenizador de Hugging Face en Python es la referencia para pruebas.
- Riesgo de alucinación no aplicable en sentido estricto al ser un encoder de embeddings, pero los embeddings pueden producir similitudes engañosas en textos ambiguos o fuera de dominio.
- Sesgos: no se documentan en la información proporcionada; al heredar los pesos del modelo base, arrastra los sesgos de sus datos de entrenamiento, no detallados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar los avisos de atribución al modelo base y al autor de la conversión.
- El autor incluye una auditoría de seguridad con `model-audit-lite` (formato de pesos, código incluido y linaje ML-BOM) documentada en `SECURITY.md`; conviene revisarla antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-310m-tflite
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Librería Kotlin `japanese-rag-kotlin`: https://github.com/masahiroid/japanese-rag-kotlin
- Herramienta de auditoría `model-audit-lite`: https://github.com/masahiroid/model-audit-lite
- Hub de seguridad para LLM japoneses: https://github.com/masahiroid/japanese-llm-security
