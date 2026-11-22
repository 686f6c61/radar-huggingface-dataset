# masahiroid/ruri-v3-reranker-310m-tflite

## Resumen

ruri-v3-reranker-310m-tflite es una conversión no oficial al formato LiteRT (`.tflite`) del modelo cl-nagoya/ruri-v3-reranker-310m, un reranker japonés basado en arquitectura cross-encoder. Lo publica el desarrollador independiente masahiroid con el objetivo de ejecutar el reranking en Android y otros entornos con runtime LiteRT, sin depender de PyTorch ni de frameworks de servidor. El modelo original está desarrollado por cl-nagoya (Nagoya University) y esta conversión mantiene sus pesos en fp32.

El modelo resuelve la tarea de reordenar pasajes recuperados por un sistema de búsqueda o RAG: recibe un par (consulta, pasaje) y devuelve un logit de relevancia que, tras aplicar sigmoid, se interpreta como una puntuación entre 0 y 1. La conversión ofrece tres variantes con longitud de secuencia fija (128, 256 y 512 tokens), lo que permite ajustar el coste computacional al caso de uso. Incluye los ficheros de tokenizer copiados del modelo base y se ha verificado contra la implementación en PyTorch.

Su relevancia actual radica en que permite desplegar un reranker japonés de calidad en dispositivos móviles y entornos edge con LiteRT, un caso poco cubierto por la oferta habitual de modelos en formato GGUF u ONNX. El repositorio ocupa 3,8 GB e incluye tres variantes fp32 del modelo, además de la documentación de seguridad y linaje (ML-BOM) generada con la herramienta model-audit-lite del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (modelo base cl-nagoya/ruri-v3-reranker-310m) |
| Parametros totales | 310M (según el nombre del modelo base; no se detalla el desglose en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens según la variante del fichero `.tflite` (longitud fija) |
| Tipos de cuantizacion | fp32 únicamente; fp16 e int8 no incluidos todavía según la model card |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT `.tflite` (tres ficheros: seq128, seq256, seq512); tokenizer copiado del modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un cross-encoder de tipo transformer basado en ModernBERT, según los tags del repositorio, con 310M parámetros. El modelo recibe como entrada el par tokenizado (consulta, pasaje) con `input_ids` y `attention_mask` de tipo `int32` y forma `[1, seq]`, y produce un único logit de relevancia de forma `[1, 1]`. La atención se respeta en el grafo mediante la máscara, y la longitud de secuencia es fija, por lo que es necesario rellenar (padding) hasta la longitud exacta del fichero elegido con el id de padding del tokenizer.

La conversión se realizó con la herramienta `litert-torch` y se verificó contra la implementación en PyTorch usando el intérprete de LiteRT. No se dispone de información sobre los datos de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF o DPO) en la documentación proporcionada. La model card indica que el tokenizer se ha copiado del modelo base y que la tokenización en dispositivo puede hacerse con el `UnigramTokenizer` en Kotlin del proyecto japanese-rag-kotlin, que reproduce exactamente los ids de Hugging Face en 450 de 450 casos de prueba.

## Capacidades

- Clasificación de pares (consulta, pasaje) para reranking: devuelve un logit de relevancia transformable en probabilidad mediante sigmoid.
- Reranking en pipelines de recuperación (RAG) sobre corpus en japonés.
- Ejecución en Android y otros runtimes LiteRT, incluyendo el intérprete de Python `ai_edge_litert`.
- Tres ventanas de contexto fijas (128, 256 y 512 tokens) para ajustar coste y precisión.
- Tokenización en dispositivo mediante el `UnigramTokenizer` en Kotlin del proyecto japanese-rag-kotlin.
- Integración con las clases `LiteRtEmbedder` y `LiteRtReranker` del mismo proyecto Kotlin.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador de pares.

## Casos de uso

- RAG en aplicaciones Android: integrar el fichero `seq256` o `seq512` con `LiteRtReranker` para reordenar los pasajes recuperados por un embedder local antes de pasarlos a un LLM, todo sin conexión a servidores.
- Búsqueda documental japonesa en edge: desplegar el modelo en dispositivos con LiteRT para reordenar resultados de un índice local de documentos en japonés con latencia controlada por la longitud fija de secuencia.
- Filtrado de candidatos en pipelines de recuperación: usar la variante `seq128` como primera etapa de reranking sobre muchos candidatos y la variante `seq512` para los pocos finalistas, aprovechando la diferencia de coste entre ambas.
- Evaluación de calidad de recuperación: emplear el logit como métrica de relevancia en conjuntos de evaluación japoneses, comparando el resultado del `.tflite` con el del modelo PyTorch original.
- Aplicaciones de demostración en navegador: el Space Ruri Atlas usa el reranker para visualizar embeddings de frases en japonés e inglés y mostrar dónde cae un prompt-injection, con procesamiento local vía WebGPU.
- Prototipado de asistentes de consulta sobre normativa o documentación interna en japonés: el reranker afina la selección de fragmentos antes de la generación, reduciendo el contexto irrelevante enviado al modelo generativo.
- Auditoría y linaje de modelos: el repositorio incluye un ML-BOM y checksums reproducibles con model-audit-lite, útil para equipos que necesitan verificar la procedencia de pesos en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica la verificación funcional contra PyTorch y una prueba de extremo a extremo en el emulador de Android (API 36.1, arm64) con la librería Kotlin, sin cifras de latencia ni de precisión de recuperación.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 310M parámetros en fp32, los pesos ocupan aproximadamente 1,24 GB; el repositorio completo son 3,8 GB por las tres variantes.
- GPU recomendadas: no se especifican; el objetivo principal es ejecución en CPU/GPU móvil mediante LiteRT.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 2 GB de memoria libre puede alojar una variante fp32; también cabe en memoria unificada de dispositivos móviles de gama media-alta.
- Opciones de despliegue: intérprete LiteRT (`ai_edge_litert` en Python), runtime LiteRT en Android con la librería Kotlin japanese-rag-kotlin; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no incluye números de latencia en dispositivo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| masahiroid/ruri-v3-reranker-310m-tflite | 310M | 128/256/512 fijo | LiteRT `.tflite` | Apache 2.0 | Conversión no oficial, solo japonés, fp32 |
| cl-nagoya/ruri-v3-reranker-310m | 310M | no disponible | safetensors (PyTorch) | Apache 2.0 | Modelo original, requiere PyTorch/Transformers |
| Otros rerankers japoneses (p. ej. variantes de ruri v1/v2) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa de rendimiento con alternativas no está disponible; la diferencia principal frente al modelo original es el formato de despliegue y la ausencia de cuantización.

## Limitaciones y advertencias

- Solo soporta japonés; no está entrenado ni validado para otros idiomas.
- No es un modelo generativo: únicamente clasifica pares (consulta, pasaje); no admite tool calling, agentes ni razonamiento multi-paso.
- Longitud de secuencia fija: es obligatorio hacer padding hasta 128, 256 o 512 tokens; secuencias más largas se truncan y pueden perder información relevante.
- Solo hay pesos fp32; no se han publicado variantes fp16 o int8, lo que limita el ahorro de memoria en dispositivos.
- No hay cifras de latencia en dispositivo real; la verificación se hizo en emulador de Android, por lo que el rendimiento en hardware físico está sin documentar.
- La conversión es no oficial: el autor no es el desarrollador del modelo base y no hay garantía de soporte o actualizaciones.
- Riesgo de sesgos y alucinación heredado del modelo base y de sus datos de entrenamiento, no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el linaje y los checksums de `SECURITY.md` antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-reranker-310m-tflite
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Repositorio Kotlin japanese-rag-kotlin: https://github.com/masahiroid/japanese-rag-kotlin
- Herramienta de auditoría model-audit-lite: https://github.com/masahiroid/model-audit-lite
- Hub de seguridad para LLM japoneses: https://github.com/masahiroid/japanese-llm-security
