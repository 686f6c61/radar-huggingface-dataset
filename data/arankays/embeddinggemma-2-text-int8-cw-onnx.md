# arankays/embeddinggemma-2-text-int8-cw-onnx

## Resumen

`arankays/embeddinggemma-2-text-int8-cw-onnx` es una conversión a ONNX del modelo de texto de EmbeddingGemma 2 (base `google/embeddinggemma-2`), publicada por el usuario arankays. El objetivo no es otro que hacer que el modelo funcione correctamente sobre OpenVINO y, en particular, sobre la NPU de Intel, corrigiendo un fallo de conversión del operador `com.microsoft.RotaryEmbedding` en el frontend ONNX de OpenVINO 2026.4.1 y comprimiendo los pesos a INT8 simétrico por canal.

El problema que resuelve es doble. Por un lado, la exportación original de `onnx-community/embeddinggemma-2-ONNX` produce embeddings incorrectos bajo OpenVINO cuando `position_ids` se usa en la forma de offset `[1]` (48 nodos rotatorios afectados): la similitud coseno frente a la referencia cae a ~0.81 y el nDCG@10 en SciFact baja a 0.582. Por otro, el modelo de texto en fp32 ocupa 1,08 GB, demasiado para un despliegue cómodo en NPU. Esta versión reescribe los nodos rotatorios con operaciones ONNX estándar y aplica cuantización INT8, reduciendo el tamaño a 274 MB sin pérdida medible de calidad.

Es relevante ahora porque permite ejecutar un modelo de embeddings de calidad en hardware de bajo consumo (NPU Intel) con latencias de 7 ms por consulta y ~29,5 documentos por segundo, manteniendo el formato ONNX para integrarse en runtimes que solo disponen del frontend ONNX de OpenVINO. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) de embeddings, exportado a ONNX; deriva de EmbeddingGemma 2 |
| Parámetros totales | no disponible (la tabla de embeddings tiene 140M parámetros; total no especificado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la evaluación trunca documentos a 256 tokens; hay variantes estáticas a 32 y 256 tokens) |
| Tipos de cuantización | INT8 simétrico por canal (147 capas de pesos); existe variante mixta 80% INT4 + 20% INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con datos en `model.onnx_data`) |

## Arquitectura y entrenamiento

El modelo es la parte de texto de EmbeddingGemma 2, un encoder transformer orientado a generación de embeddings de frases y similitud semántica. La exportación original usa `com.microsoft.RotaryEmbedding` en los 48 nodos rotatorios, con `position_ids` en forma de offset `[1]`, lo que provoca la conversión errónea en OpenVINO. Esta versión reescribe cada nodo rotatorio como rotate-half con operaciones ONNX primitivas (Slice, Mul, Sub, Add, Concat), aceptando únicamente la forma exacta del exportador (entrada 3D, offset constante `[0]`, cachés que cubren todas las posiciones, `interleaved=0`) y rechazando cualquier otra variante. Bajo ONNX Runtime, el grafo reescrito produce los mismos embeddings que el original (coseno 1.0000).

Los pesos se comprimieron con NNCF 3.4.0 en modo data-free (`nncf.compress_weights(model, mode=nncf.CompressWeightsMode.INT8_SYM)`), aplicando INT8 simétrico por canal a las 147 capas de pesos, incluida la tabla de embeddings de 140M parámetros. No se usa cuantización por grupos, que es el formato que la NPU compila mejor. No se dispone de información sobre los datos de entrenamiento originales, número de tokens, composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de embeddings de texto para similitud semántica y búsqueda (pipeline `feature-extraction` / `sentence-similarity`).
- Codificación de consultas y documentos con prefijos específicos: `task: search result | query: ` para consultas y `title: {title or none} | text: ` para documentos.
- Salida `sentence_embedding` que debe normalizarse L2 antes de comparar.
- Soporte de entradas multimodales en el grafo completo (`image_features`, `video_features`, `audio_features`), aunque el uso documentado es solo texto con esas entradas vacías de forma `[0, 512]`.
- Variantes estáticas para NPU: `model_text_q32.onnx` (consultas, `[1, 32]`) y `model_text_d256.onnx` (documentos, `[1, 256]`).
- Variantes con imagen: `model_image_280.onnx`, `model_image_140.onnx` y `model_image_70.onnx`, que aceptan la salida de los encoders de visión estáticos de `arankays/embeddinggemma-2-vision-static-onnx`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de embeddings, no generativo).
- Capacidades multilingües: no disponible.

## Casos de uso

- Búsqueda semántica en corpus documentales: el modelo genera embeddings de documentos y consultas con los prefijos adecuados, y su nDCG@10 de 0.846 en BEIR SciFact (256 tokens) lo hace apto para motores de recuperación sobre documentación técnica o científica.
- RAG sobre hardware de bajo consumo: al ejecutarse en NPU Intel con 7 ms por consulta, puede integrarse en pipelines de recuperación aumentada en equipos sin GPU dedicada.
- Deduplicación y clustering de textos: la similitud por coseno sobre `sentence_embedding` normalizado permite agrupar documentos o detectar duplicados en grandes volúmenes, con ~29,5 documentos por segundo en NPU.
- Indexación masiva offline: el throughput de 29,5 docs/s en NPU permite indexar corpus medianos en tiempos razonables manteniendo el formato ONNX para portabilidad.
- Búsqueda multimodal con las variantes de imagen: usando los encoders de visión estáticos y `model_image_*`, se pueden generar embeddings de imágenes alineados con el espacio de texto.
- Despliegue en entornos con solo el frontend ONNX de OpenVINO: útil en runtimes que no soportan otros formatos, como las librerías del wheel `onnxruntime-openvino`.
- Clasificación y filtrado por similitud: comparar embeddings de consultas contra un conjunto de etiquetas o prototipos para enrutamiento o moderación ligera.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre BEIR SciFact (test, 5.183 documentos, 300 consultas, documentos truncados a 256 tokens), medidos en Core 5 320 (Wildcat Lake NPU), OpenVINO 2026.4.1, driver NPU 1.35.0, 2026-10-18:

| Variante | Tamaño | nDCG@10 | Consulta NPU | Docs/s NPU |
|---|---|---|---|---|
| onnx-community fp32, tal cual | 1084 MB | 0.582 | 10.1 ms | 27.1 |
| Corrección rotatoria, fp32 | 1084 MB | 0.846 | 9.8 ms | 27.6 |
| **Corrección rotatoria, INT8 (este repo)** | **274 MB** | **0.846** | **7.0 ms** | **29.5** |
| Corrección rotatoria, 80% INT4 + 20% INT8 | 220 MB | 0.817 | 5.7 ms | 29.2 |

Coseno frente a la referencia fp32 (ONNX Runtime sobre la exportación original): 0.9996 o mejor en CPU de OpenVINO, NPU de OpenVINO y ONNX Runtime. La variante INT4 se descartó por ahorrar solo 54 MB a costa de 0.03 de nDCG.

## Requisitos de hardware

- VRAM/tamaño en disco: 274 MB para el modelo INT8; 1084 MB para la variante fp32 de referencia.
- Hardware objetivo: NPU Intel (probado en Core 5 320, Wildcat Lake) y CPU con OpenVINO; también funciona en ONNX Runtime.
- GPU: no se documentan requisitos de GPU; el foco es NPU y CPU.
- Cabe en cualquier equipo consumer con NPU Intel o incluso en CPU, dado el tamaño reducido.
- Despliegue: OpenVINO (`core.compile_model(model, "NPU", {"CACHE_DIR": "ov-cache"})`), ONNX Runtime, y librerías que usen el frontend ONNX de OpenVINO (`onnxruntime-openvino`).
- Latencia y throughput: 7.0 ms por consulta y 29.5 docs/s en NPU con la variante INT8; con caché en caliente, 340 MB de pico y 0.04 s para compilar las variantes estáticas, frente a 630 MB y 0.17 s en el flujo de lectura + reshape + compilación.
- Nota de NPU: usar batch 1; un batch estático mayor que 1 mezcla filas entre el lote (coseno frente a CPU de hasta 0.59 en otros modelos con batch 8). Las formas deben ser estáticas y el padding a longitud fija no altera el embedding.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 SciFact | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (INT8, ONNX) | no disponible | no disponible (eval. a 256 tokens) | 0.846 | Apache 2.0 | ONNX |
| onnx-community/embeddinggemma-2-ONNX (fp32) | no disponible | no disponible | 0.582 (bajo OpenVINO) | no disponible | ONNX |
| Variante 80% INT4 + 20% INT8 | no disponible | no disponible | 0.817 | Apache 2.0 | ONNX |

No se dispone de datos de otros modelos de embeddings comparables en la información proporcionada; la comparativa se limita a las variantes del mismo modelo base documentadas en la model card.

## Limitaciones y advertencias

- El fallo de conversión de `com.microsoft.RotaryEmbedding` en OpenVINO 2026.4.1 afecta a la exportación original; esta versión lo corrige, pero otras exportaciones pueden seguir afectadas.
- La reescritura de los nodos rotatorios solo acepta la forma exacta del exportador; no es una corrección genérica para cualquier grafo.
- En NPU, el batch debe ser 1 y las formas estáticas; un batch mayor produce resultados incorrectos (mezcla de filas).
- La API C de OpenVINO (y sus bindings de Rust) rechaza dimensiones de tamaño 0; para esos casos hay que usar `model_text.onnx`.
- La cuantización INT4 reduce el tamaño a 220 MB pero baja el nDCG a 0.817; no se recomienda si prima la calidad.
- No hay información sobre sesgos, riesgo de alucinación (es un modelo de embeddings, no generativo) ni limitaciones de idioma.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/embeddinggemma-2`.
- El modelo está pensado para embeddings, no para generación de texto ni razonamiento; no soporta tool calling ni agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arankays/embeddinggemma-2-text-int8-cw-onnx
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Exportación ONNX original: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Encoders de visión estáticos: https://huggingface.co/arankays/embeddinggemma-2-vision-static-onnx
- Issue del fallo rotatorio: https://github.com/karanshukla/vinoSearch/issues/1
- Script de formas estáticas: https://github.com/karanshukla/vinoSearch/blob/main/bench/static_shapes.py
