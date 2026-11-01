# Hansda/pplx-embed-v2-late-0.6b-GGUF

## Resumen

pplx-embed-v2-late-0.6b-GGUF es la conversión a formato GGUF del checkpoint original `perplexity-ai/pplx-embed-v2-late-0.6b`, un codificador de texto de tipo late-interaction (estilo ColBERT) publicado por Perplexity AI. El modelo base tiene 493.859.776 parámetros y produce una representación vectorial por token, no un único vector por secuencia, lo que permite aplicar la puntuación MaxSim característica de ColBERT en tareas de recuperación de información. Esta versión GGUF está mantenida por el usuario Hansda y su objetivo es hacer viable la inferencia del codificador en `llama.cpp`, sin dependencias de PyTorch ni de GPUs de datacenter.

El interés de esta ficha radica en que permite desplegar un retriever denso de interacción tardía en infraestructura modesta: los ficheros cuantizados ocupan entre 366 MB (Q4_K_M) y 999 MB (F16), y el servidor de embeddings de `llama.cpp` puede exponer el modelo por HTTP. Frente a los embeddings de un solo vector, la interacción tardía conserva la señal a nivel de token y suele mejorar el recall en consultas largas o con vocabulario específico, a costa de almacenar N vectores por documento en lugar de uno.

La conversión conserva la proyección original de 1024 a 128 dimensiones en F32 y aplica una máscara de puntuación sobre los documentos, además de prefijos `[Q] ` y `[D] ` para distinguir consultas de documentos. Es un modelo exclusivamente de texto: los tensores de visión del checkpoint original no se incluyen en estos GGUF. La licencia declarada es MIT, con avisos Apache-2.0 heredados de la familia Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia Qwen), late-interaction tipo ColBERT con proyección 1024→128 |
| Parámetros totales | 493.859.776 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens para consultas y 4096 tokens para documentos (límites del procesamiento de origen) |
| Tipos de cuantización | F16, Q6_K, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | MIT (con avisos Apache-2.0 de la familia Qwen) |
| Formato de pesos | GGUF (safetensors en el checkpoint base) |

## Arquitectura y entrenamiento

El modelo es un codificador transformer de tipo encoder-only, derivado de la familia Qwen según los avisos de atribución incluidos en el repositorio, con 493,8 millones de parámetros. Sobre la salida del encoder se aplica una proyección de 1024 a 128 dimensiones que se mantiene en F32 en todos los ficheros GGUF, de modo que la cuantización afecta al cuerpo del transformer pero no a la capa de proyección final. La salida no está pooled: se genera un vector de 128 dimensiones por cada token de entrada, lo que habilita la puntuación ColBERT MaxSim entre los vectores de consulta y los de documento.

La conversión documentada es la siguiente: F16 se obtiene de los pesos originales en F32, y Q4_K_M y Q6_K se derivan de forma independiente a partir de F16. El cliente de referencia aplica el prefijo `[Q] ` o `[D] ` al inicio de la entrada (incluido el espacio final), una máscara de puntuación específica para documentos, normalización L2 por vector de token y finalmente la puntuación MaxSim. El repositorio incluye `REPRODUCE.md` con el adaptador de conversión, `runtime-info.json` y `model-manifest.json` con hashes y procedencia fijada. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de embeddings de texto a nivel de token para recuperación de información (retrieval), no generación de texto libre.
- Interacción tardía tipo ColBERT: un vector de 128 dimensiones por token, puntuación MaxSim entre consulta y documento.
- Codificación asimétrica con prefijos `[Q] ` y `[D] ` para consultas y documentos respectivamente.
- Máscara de puntuación sobre documentos aplicada en el cliente de referencia.
- Soporte de entradas de hasta 1024 tokens para consultas y 4096 tokens para documentos según los límites del modelo de origen.
- Inferencia vía `llama.cpp` con `--embedding --pooling none`, expuesta como servidor HTTP compatible con endpoints de embeddings.
- Solo texto: los tensores de visión del checkpoint original no están incluidos.
- No se documenta soporte de tool calling, agentes, modo thinking, audio ni otras modalidades.

## Casos de uso

- Recuperación de documentos en un RAG corporativo: el modelo indexa fragmentos de hasta 4096 tokens generando un vector por token, y en consulta aplica MaxSim contra los vectores del documento; la interacción tardía mejora el recall en consultas con términos poco frecuentes frente a embeddings de vector único.
- Búsqueda semántica sobre documentación técnica: con consultas de hasta 1024 tokens se pueden formular preguntas largas o con contexto adicional sin truncar, algo habitual en soporte de producto y manuales de API.
- Motor de búsqueda interna de bajo coste: al ocupar 366 MB en Q4_K_M, el modelo cabe en una CPU con suficiente RAM y puede servirse con `llama-server` en un contenedor pequeño, sin GPU.
- Filtrado y deduplicación de corpus: la representación por token permite comparar pares de documentos y detectar duplicados parciales o paráfrasis mediante la puntuación MaxSim agregada.
- Reranking en dos etapas: tras un primer filtrado con un retriever BM25 o bi-encoder barato, este modelo reordena los candidatos con puntuación por token, a coste de almacenamiento mayor pero con mejor precisión.
- Evaluación de sistemas de recuperación en investigación: al ser reproducible (conversión documentada, hashes y manifiesto), sirve como baseline de late-interaction en experimentos que comparan ColBERT con bi-encoders.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT con avisos Apache-2.0 facilita la integración en productos comerciales cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en Q4_K_M, 0,45 GB en Q6_K y 1,1 GB en F16, incluyendo la proyección en F32 y los buffers de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. En A100 o H100 el modelo está infrautilizado y el cuello de botella pasa a ser el procesamiento por lotes.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 4 GB o más, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: `llama.cpp` (versión fijada `0ec4027`) mediante `llama-server` con `--embedding --pooling none -ngl 99 -c 4096 -b 512 -ub 512 -np 1`. No se documenta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La configuración de referencia usa lote y microbatch de 512 tokens y una sola instancia (`-np 1`); las entradas no causales deben caber en un único lote o microbatch, por lo que para secuencias largas hay que aumentar conjuntamente los parámetros del servidor y el límite del cliente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-embed-v2-late-0.6b (este) | 493,9 M | 1024 (query) / 4096 (doc) | Late-interaction, 128 dims por token | MIT | GGUF en HF, safetensors en el checkpoint base |
| Bi-encoders densos de ~0,5 B (familia BGE, E5) | ~0,3-0,6 B | 512-8192 según variante | Vector único por secuencia | MIT o Apache-2.0 según variante | GGUF, safetensors, ONNX |
| ColBERTv2 | ~110 M | 512 | Late-interaction, 128 dims por token | BSD-2 / MIT según distribución | Pesos PyTorch, no GGUF oficial |
| Rerankers cross-encoder de ~0,5 B | ~0,5 B | 512-4096 | Puntuación de par consulta-documento | Variable | safetensors, GGUF en algunos casos |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado métricas de recuperación (nDCG, Recall@k, MRR) en la información proporcionada, ni para este modelo ni frente a las alternativas citadas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo representaciones vectoriales; no debe usarse para chat, resumen ni generación de código.
- Solo texto: los tensores de visión del checkpoint original se han omitido, por lo que no admite entradas multimodales.
- El pooling de secuencia rompe el método de recuperación: es obligatorio mantener la salida sin pooling (`--pooling none`) y aplicar MaxSim en el cliente.
- Los límites de entrada son 1024 tokens para consultas y 4096 para documentos; superarlos requiere ajustar simultáneamente el servidor y el cliente y puede degradar la calidad.
- El almacenamiento del índice crece de forma proporcional al número de tokens, no al número de documentos: un corpus grande exige muchas más dimensiones que un bi-encoder de vector único.
- Dependencia de una versión concreta de `llama.cpp` (`0ec4027`); otras versiones pueden cambiar el comportamiento de `--embedding` o del pooling.
- Idiomas soportados no documentados: no hay garantía explícita de rendimiento multilingüe más allá de lo que herede del modelo base.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de recuperación espuria: MaxSim puede puntuar alto documentos léxicamente solapados pero semánticamente irrelevantes.
- Sesgos: no se documenta ninguna evaluación de sesgo, equidad o robustez en la información disponible.
- Licencia MIT con avisos Apache-2.0 de Qwen: es permisiva para uso comercial, pero conviene revisar `LICENSE`, `ATTRIBUTION.md` y `licenses/` para cumplir con las obligaciones de atribución.
- Repositorio con 78 descargas y 0 likes: ecosistema de validación muy reducido, sin evidencia de uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Hansda/pplx-embed-v2-late-0.6b-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Revisión concreta del checkpoint base: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b/tree/7bba8e7cf2075dec747fa8557f41eb90e70361ed
- `llama.cpp` (versión fijada): https://github.com/ggml-org/llama.cpp/tree/0ec4027a2a0183de87c007069adddc06e665f7de
