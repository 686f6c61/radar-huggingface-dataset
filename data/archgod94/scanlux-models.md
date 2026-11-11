# archgod94/scanlux-models

## Resumen

Scanlux-models es un repositorio espejo (mirror) publicado por el usuario archgod94 que agrupa los ficheros de modelos utilizados por la aplicación Scanlux para inferencia en dispositivo (on-device). No se trata de un modelo entrenado por el autor, sino de copias sin modificar de modelos de terceros empaquetadas en formato LiteRT-LM (`.litertlm`) y TFLite, con verificación de integridad mediante SHA-256 por parte de la aplicación cliente.

El repositorio contiene tres modelos generativos —Qwen3-0.6B, Gemma 4 E2B-it y Gemma 4 E4B-it— y un modelo de embeddings (EmbeddingGemma 300M) junto con su tokenizador SentencePiece. Los modelos generativos proceden de la organización litert-community y están publicados bajo licencia Apache-2.0, mientras que EmbeddingGemma se rige por los Gemma Terms of Use. El tamaño total del repositorio es de 7,0 GB.

Su relevancia es práctica: sirve como fuente de verdad para aplicaciones móviles que necesitan descargar pesos cuantizados y ejecutarlos localmente en el dispositivo sin depender de servicios en la nube. No hay información pública sobre benchmarks, idiomas soportados ni pipeline asociado a este repositorio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los modelos subyacentes son transformers; el empaquetado es LiteRT-LM/TFLite) |
| Parametros totales | no disponible por fichero (Qwen3-0.6B: 0,6B; Gemma 4 E2B-it: nomenclatura E2B; Gemma 4 E4B-it: nomenclatura E4B; EmbeddingGemma: 300M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mixed-precision (explicitado en el nombre del fichero de EmbeddingGemma); no disponible para el resto |
| Idiomas soportados | no disponible |
| Licencia | mixta: Apache-2.0 (Qwen3-0.6B, Gemma 4 E2B-it, Gemma 4 E4B-it) y Gemma Terms of Use (EmbeddingGemma y tokenizadores) |
| Formato de pesos | `.litertlm` (LiteRT-LM) y `.tflite`; tokenizador en SentencePiece (`.model`) y JSON |

## Arquitectura y entrenamiento

Este repositorio no documenta arquitectura ni proceso de entrenamiento propios: es un espejo de ficheros de terceros. Los modelos generativos incluidos (Qwen3-0.6B y la familia Gemma 4 en variantes E2B-it y E4B-it) son transformers de la familia Qwen y Gemma respectivamente, empaquetados en el formato LiteRT-LM de Google para ejecución eficiente en dispositivos móviles. El modelo de embeddings es EmbeddingGemma 300M con tokenizador SentencePiece y una secuencia de 1024 tokens según el nombre del fichero.

No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO en el contexto de este repositorio. Cualquier dato de entrenamiento debe consultarse en las fichas originales de litert-community/Qwen3-0.6B, litert-community/gemma-4-E2B-it-litert-lm y litert-community/embeddinggemma-300m. La innovación destacable aquí es el empaquetado LiteRT-LM, que permite ejecución on-device con verificación de integridad por SHA-256.

## Capacidades

- Generación de texto y razonamiento conversacional mediante Qwen3-0.6B y Gemma 4 E2B-it / E4B-it.
- Generación de embeddings de texto con EmbeddingGemma 300M (útil para búsqueda semántica, RAG local y similitud).
- Inferencia on-device sin conexión a red, al estar los pesos empaquetados en formato LiteRT-LM/TFLite.
- Verificación de integridad de los ficheros mediante SHA-256 por parte de la app consumidora.
- Soporte de tool calling, agentes, multilingüismo o modos especiales: no disponible en la información del repositorio (debe consultarse en las fichas de los modelos originales).

## Casos de uso

- Búsqueda semántica local en aplicaciones móviles: EmbeddingGemma 300M permite calcular embeddings de documentos y consultas en el dispositivo, habilitando recuperación sin enviar datos a servidores externos.
- Asistente conversacional offline: Qwen3-0.6B o Gemma 4 E2B-it pueden gestionar respuestas de chat básicas dentro de la app sin conectividad.
- Resumen y extracción de información de documentos escaneados: coherente con el nombre "Scanlux", los modelos generativos pueden procesar texto OCR localmente para resumir o clasificar.
- Clasificación y etiquetado de texto en el dispositivo: usar los modelos pequeños para categorizar contenido sin coste de API ni latencia de red.
- RAG embebido en la app: combinar EmbeddingGemma para indexar contenido local y un modelo generativo pequeño para responder preguntas sobre ese contenido.
- Distribución reproducible de pesos: el repositorio sirve como CDN/mirror para que la app descargue ficheros verificables por hash, simplificando el despliegue y la auditoría de integridad.
- Prototipado de pipelines LiteRT-LM: desarrolladores que quieran probar el formato `.litertlm` con modelos conocidos pueden usar estos ficheros como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma oficial; el repositorio pesa 7,0 GB en total, por lo que cada fichero individual es sustancialmente menor, pero no se detalla su tamaño por fichero.
- GPU recomendadas: no disponible. El formato LiteRT-LM está orientado a aceleradores móviles (CPU, GPU móvil, NPU) más que a GPUs de servidor.
- ¿Cabe en consumer GPU? No disponible; el enfoque del repositorio es on-device (móvil/edge), no inferencia en GPU de escritorio.
- Opciones de despliegue: LiteRT-LM / TFLite (formato nativo de los ficheros); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Scanlux-models (Qwen3-0.6B empaquetado) | 0,6B | no disponible | Apache-2.0 | `.litertlm` | Mirror en HF |
| litert-community/Qwen3-0.6B (original) | 0,6B | no disponible | Apache-2.0 | LiteRT-LM | HF oficial |
| litert-community/gemma-4-E2B-it-litert-lm | E2B | no disponible | Apache-2.0 | LiteRT-LM | HF oficial |
| litert-community/embeddinggemma-300m | 300M | 1024 (según nombre de fichero) | Gemma Terms of Use | TFLite | HF oficial |

La comparativa se limita a los modelos de origen, ya que el repositorio es un espejo de los mismos. No se dispone de datos de rendimiento para comparar con alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un mirror; la responsabilidad sobre el comportamiento recae en los modelos originales.
- Licencia mixta: los modelos generativos son Apache-2.0, pero EmbeddingGemma y sus tokenizadores están sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, lo que restringe ciertos usos comerciales y de contenido.
- Idiomas soportados no documentados en este repositorio.
- Sin benchmarks ni métricas de rendimiento publicadas en esta ficha.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad; conviene verificar los SHA-256 contra las fuentes originales.
- El tamaño de 7,0 GB puede suponer un coste de descarga significativo en móvil; la app debe gestionar la descarga y verificación correctamente.
- No se documenta soporte de tool calling, agentes ni modos especiales en este repositorio.
- Riesgo de alucinación y sesgos: inherente a los modelos subyacentes; consultar sus fichas originales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/archgod94/scanlux-models
- Qwen3-0.6B (origen): https://huggingface.co/litert-community/Qwen3-0.6B
- Gemma 4 E2B-it (origen): https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Gemma 4 E4B-it (origen): https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- EmbeddingGemma 300M (origen): https://huggingface.co/litert-community/embeddinggemma-300m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
