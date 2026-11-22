# masahiroid/ruri-v3-30m-tflite

## Resumen

ruri-v3-30m-tflite es una conversión no oficial al formato LiteRT (`.tflite`) del modelo de embeddings de texto en japonés cl-nagoya/ruri-v3-30m, publicada por el usuario masahiroid. El objetivo es llevar un modelo de similitud semántica de frases a entornos Android y a otros runtimes LiteRT, donde no es posible ejecutar directamente pesos en safetensors con PyTorch. El modelo original es un transformer tipo ModernBERT de aproximadamente 30 millones de parámetros, entrenado para generar representaciones vectoriales de frases en japonés.

La conversión mantiene la arquitectura y los pesos del modelo base en precisión fp32 y se distribuye en tres variantes con longitud de secuencia fija (128, 256 y 512 tokens). Cada fichero incluye en el propio grafo el pooling por media y la normalización L2, de modo que la salida es directamente un embedding normalizado listo para búsqueda por similitud coseno. El tokenizador se reutiliza del modelo base y el autor proporciona una implementación Kotlin (`UnigramTokenizer`) verificada contra el tokenizador de Hugging Face.

La relevancia de esta ficha es práctica: permite desplegar búsqueda semántica y RAG en japonés íntegramente en dispositivo, sin conexión a servidor, con un modelo pequeño (unos 0,4 GB de repositorio) y bajo una licencia permisiva Apache 2.0. Es una pieza de infraestructura más que un modelo generativo: no produce texto, solo vectores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), según tags del modelo base |
| Parámetros totales | no disponible (modelo base: ~30M, según nomenclatura "30m") |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens máximo (variantes fijas de 128, 256 y 512) |
| Tipos de cuantización | fp32 (no se incluyen variantes fp16 ni int8) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT `.tflite` (tres ficheros: `ruri-v3-30m_seq128.tflite`, `_seq256`, `_seq512`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, un transformer encoder con atención bidireccional orientado a tareas de representación y clasificación, según indican los tags del repositorio. El modelo base cl-nagoya/ruri-v3-30m fue entrenado como modelo de embeddings de frases en japonés de propósito general; esta conversión no modifica los pesos ni el entrenamiento, solo el formato de serialización. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como contrastive learning, DPO o similares.

La innovación técnica de esta versión es la exportación a LiteRT mediante `litert-torch`, con dos decisiones destacables: (1) la longitud de secuencia es fija por fichero, lo que simplifica el grafo y permite optimizaciones específicas del runtime, y (2) el pooling por media y la normalización L2 están embebidos en el grafo, de modo que la salida `[1, dim]` ya es un embedding normalizado. La atención respeta la máscara de atención, por lo que el padding con el id del tokenizador no contamina el vector resultante. El autor verifica numéricamente el intérprete LiteRT contra PyTorch y valida el pipeline completo en un emulador Android (API 36.1, arm64) para recuperación y reranking.

## Capacidades

- Generación de embeddings de frases en japonés para similitud semántica y recuperación de información.
- Extracción de características (`feature-extraction`) a partir de texto tokenizado.
- Pooling por media y normalización L2 integrados en el grafo: salida lista para producto escalar o similitud coseno.
- Soporte de prefijos de tarea del modelo base (por ejemplo `検索クエリ: ` para consultas y `検索文書: ` para documentos).
- Tres ventanas de secuencia fijas (128, 256, 512 tokens) para ajustar coste y precisión.
- Ejecución en dispositivo mediante el intérprete LiteRT, sin dependencia de PyTorch en tiempo de inferencia.
- Tokenización en dispositivo con `UnigramTokenizer` en Kotlin, verificada contra 450/450 fixtures de Hugging Face.
- Componentes `LiteRtEmbedder` y `LiteRtReranker` en la librería japanese-rag-kotlin.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder de embeddings.

## Casos de uso

- Búsqueda semántica en dispositivo: indexar documentos japoneses como vectores y recuperar los más similares a una consulta usando la variante de 512 tokens para documentos largos y la de 128 para consultas cortas.
- RAG local en Android: combinar el embedder con un LLM on-device para responder preguntas sobre una base documental sin enviar datos a un servidor, aprovechando que el modelo cabe en el repositorio de 0,4 GB.
- Reranking de resultados: usar el modelo como reranker sobre un conjunto candidato recuperado previamente, gracias a los componentes `LiteRtReranker` de la librería Kotlin.
- Deduplicación y agrupación de textos: calcular embeddings de un corpus japonés y agrupar por similitud coseno para detectar duplicados o temas recurrentes.
- Clasificación y filtrado por similitud: comparar la similitud de un texto con prototipos de categoría para enrutar tickets, correos o comentarios en aplicaciones móviles.
- Moderación o detección de inyección de prompts: el demo Ruri Atlas ilustra cómo visualizar dónde cae un texto malicioso en el espacio de embeddings, útil para construir filtros heurísticos.
- Aplicaciones offline en japonés: asistentes o lectores que necesitan búsqueda semántica sin conectividad, con latencia determinista al usar longitudes fijas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas; el repositorio completo ocupa 0,4 GB y los pesos están en fp32, por lo que la huella en memoria es del orden de decenas de MB por variante, pero el autor no publica cifras.
- GPU recomendadas: no aplica de forma directa; el destino principal es CPU/NPU móvil mediante LiteRT. Para escritorio, cualquier GPU con soporte LiteRT puede ejecutar el intérprete.
- Consumer GPU: no hay datos publicados de ejecución en GPU de consumo; el modelo está pensado para Android y runtimes LiteRT.
- Despliegue: intérprete LiteRT (`ai_edge_litert.interpreter.Interpreter` en Python) y LiteRT en Kotlin/Android. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un encoder `.tflite`.
- Latencia y throughput: no disponibles; el autor indica explícitamente que aún no incluye números de latencia en dispositivos reales, solo verificación en emulador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ruri-v3-30m-tflite | ~30M (base) | 512 | LiteRT `.tflite` | Apache 2.0 | Conversión para Android; fp32; sin benchmarks publicados |
| cl-nagoya/ruri-v3-30m | ~30M | no disponible | safetensors (Hugging Face) | Apache 2.0 | Modelo base original; referencia de calidad |
| Otros modelos de embeddings japoneses | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Conversión no oficial: el autor no es el desarrollador del modelo base; la responsabilidad de la calidad recae en la verificación del usuario.
- Solo japonés: no está entrenado ni validado para otros idiomas.
- Solo embeddings: no genera texto, no soporta tool calling ni razonamiento; no debe confundirse con un LLM.
- Longitud de secuencia fija: es necesario hacer padding al tamaño exacto del fichero elegido; textos más largos que 512 tokens se truncan.
- Sin variantes cuantizadas: solo fp32, lo que limita la reducción de memoria en dispositivos muy restringidos.
- Sin cifras de latencia en dispositivos reales: la validación se hizo en emulador; el rendimiento en hardware físico no está documentado.
- Riesgo de sesgos y alucinación: como encoder, no "alucina" texto, pero los embeddings pueden reflejar sesgos del corpus de entrenamiento del modelo base; no se detallan en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y citar adecuadamente a sus autores.
- Dependencia del tokenizador: la tokenización en dispositivo requiere la implementación Kotlin del autor o el tokenizador de Hugging Face; una tokenización incorrecta degrada la calidad de los embeddings.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/masahiroid/ruri-v3-30m-tflite
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-30m
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Librería Kotlin japanese-rag-kotlin: https://github.com/masahiroid/japanese-rag-kotlin
- Herramienta de auditoría model-audit-lite: https://github.com/masahiroid/model-audit-lite
- Hub de seguridad japanese-llm-security: https://github.com/masahiroid/japanese-llm-security
