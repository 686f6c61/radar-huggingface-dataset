# lastabhi/amar-bge-m3

## Resumen

Amar BGE-M3 es una exportación a ONNX cuantizada a int8 del modelo de embeddings BAAI/bge-m3, publicada por el usuario lastabhi. Su propósito es servir como motor de búsqueda semántica dentro de la aplicación Android Amar Vault, convirtiendo frases o páginas de texto extraídas por OCR de fotos y documentos en vectores de 1024 dimensiones, de modo que una consulta escrita pueda localizar páginas que expresan lo mismo con otras palabras, tanto en inglés como en hindi.

El modelo hereda la arquitectura de BGE-M3 (BAAI), un encoder transformer orientado a feature-extraction, pero se distribuye exclusivamente en formato ONNX con cuantización int8, lo que reduce el peso del artefacto a 568,3 MB y lo hace viable para inferencia en dispositivo (on-device). El repositorio incluye además el tokenizer (17,1 MB), la configuración del modelo original y un fichero de metadatos con los checksums SHA-256 de cada archivo.

La relevancia actual radica en su orientación a despliegue móvil: frente al modelo original en PyTorch, esta versión ONNX permite ejecutar búsqueda semántica local en Android sin depender de servicios en la nube. La longitud máxima de secuencia documentada en los metadatos de exportación es de 128 tokens, muy inferior a la del modelo base, lo que condiciona su uso a fragmentos cortos de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de BAAI/bge-m3), exportado a ONNX, opset 17 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max length segun model_metadata.json de la exportacion) |
| Tipos de cuantizacion | int8 (el nombre de fichero conserva "int4" por compatibilidad historica) |
| Idiomas soportados | ingles (en), hindi (hi) |
| Licencia | MIT |
| Formato de pesos | ONNX (`bge-m3-ocr-int4.onnx`, 568,3 MB); tokenizer en `tokenizer.json` (17,1 MB) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX del encoder de BAAI/bge-m3, un transformer diseñado para generar embeddings densos de frases y documentos. La exportación expone dos entradas (`input_ids` y `attention_mask`) y una salida (`last_hidden_state`), con dimensión de embedding de 1024, según los metadatos incluidos en el repositorio. La cuantización aplicada es int8, lo que reduce el tamaño del artefacto respecto al modelo original en punto flotante.

No se dispone de información sobre el proceso de entrenamiento adicional: la model card no documenta fine-tuning específico para OCR, número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. El sufijo "OCR-tuned" del título no va acompañado de detalles técnicos que lo respalden en la información proporcionada. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de embeddings de texto: convierte frases o páginas de texto en vectores de 1024 dimensiones para búsqueda semántica.
- Búsqueda semántica multilingüe limitada a inglés e hindi.
- Procesamiento de texto procedente de OCR (fotos y documentos), según el propósito declarado en la model card.
- Inferencia on-device en Android mediante ONNX Runtime.
- Extracción de características (pipeline `feature-extraction`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Búsqueda semántica local en aplicaciones Android: la app Amar Vault indexa páginas escaneadas por OCR y permite consultas en lenguaje natural; el formato ONNX int8 y los 568 MB del artefacto lo hacen desplegable en el dispositivo sin backend.
- Búsqueda en documentos personales escaneados: el usuario fotografía documentos y recupera fragmentos por significado en lugar de por coincidencia exacta de palabras, gracias a los embeddings de 1024 dimensiones.
- Recuperación de información en corpus bilingües inglés-hindi: permite consultas cruzadas entre ambos idiomas dentro de las 128 posiciones de contexto por fragmento.
- Deduplicación y agrupación de fragmentos de texto OCR: comparando similitud coseno entre embeddings se pueden agrupar páginas que tratan el mismo contenido.
- Indexación offline sin conexión: al ejecutarse en el dispositivo, permite construir un índice vectorial local en escenarios sin conectividad.
- Clasificación y filtrado de texto corto: los vectores generados sirven para tareas de similitud, clustering o etiquetado semántico de fragmentos de hasta 128 tokens.
- Integración en pipelines de recuperación aumentada (RAG) móviles: como etapa de embedding en aplicaciones que necesitan recuperar contexto local antes de invocar un LLM remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el artefacto ONNX int8 ocupa 568,3 MB, por lo que la memoria necesaria en inferencia será del orden de esa cifra más los buffers de activación.
- GPU recomendadas: no se documentan; el modelo está orientado a CPU y aceleradores móviles mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no documentada; el diseño on-device sugiere ejecución en CPU de dispositivos Android.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); no se proporcionan artefactos GGUF, ni instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| Amar BGE-M3 (esta ficha) | no disponible | 128 tokens | ONNX int8 | MIT | On-device Android, en/hi |
| BAAI/bge-m3 (modelo base) | no disponible en la informacion | no disponible en la informacion | PyTorch (safetensors) | MIT | Embeddings multilingues generales |
| Otros modelos de embeddings multilingues | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no puede completarse con los datos proporcionados; únicamente se conoce la relación con el modelo base BAAI/bge-m3, del que este es una exportación cuantizada con contexto reducido a 128 tokens.

## Limitaciones y advertencias

- Longitud de contexto muy reducida: 128 tokens según los metadatos de exportación, lo que limita la indexación a fragmentos cortos y puede truncar páginas largas de OCR.
- Idiomas restringidos a inglés e hindi; no se garantiza comportamiento en castellano ni en otros idiomas.
- Cuantización int8: puede introducir una pérdida de precisión en los embeddings respecto al modelo original en punto flotante; no se documenta la magnitud de esa degradación.
- El nombre de fichero conserva "int4" aunque la cuantización real es int8, lo que puede inducir a error en la gestión de artefactos.
- Riesgo de alucinación no aplica directamente (no es un modelo generativo), pero la similitud semántica puede producir recuperaciones irrelevantes en textos ruidosos de OCR.
- Sesgos: no documentados en la información disponible; al derivar de BGE-M3, podría heredar los sesgos del corpus de entrenamiento original, no especificado aquí.
- Licencia MIT: permite uso comercial, pero la copyright del modelo original permanece en BAAI y se distribuye sin garantía.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria ni de uso en producción.
- No se documentan procesos de evaluación, fine-tuning específico para OCR ni métricas de calidad de recuperación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lastabhi/amar-bge-m3
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Descarga directa del manifiesto de ficheros: https://huggingface.co/lastabhi/amar-bge-m3/resolve/main/bge-m3-ocr-int4/files.json
