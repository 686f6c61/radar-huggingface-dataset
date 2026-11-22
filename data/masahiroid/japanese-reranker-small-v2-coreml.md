# masahiroid/japanese-reranker-small-v2-coreml

## Resumen

`japanese-reranker-small-v2-coreml` es una conversión no oficial a Core ML del reranker japonés ligero `hotchpotch/japanese-reranker-small-v2`, basado en la arquitectura ModernBERT. El modelo original, desarrollado por hotchpotch, resuelve la tarea de reordenación de documentos (text-ranking): dada una consulta y un documento, devuelve una puntuación de relevancia en el rango [0, 1] aplicando sigmoid al logit de salida. La conversión la firma masahiroid y está pensada para ejecutarse directamente en dispositivos iOS y macOS mediante el framework Core ML de Apple, sin necesidad de servidores ni runtimes de Python.

La relevancia de esta ficha radica en que empaqueta un reranker de producción en formato nativo de Apple, con variantes segmentadas por longitud de secuencia (128, 256 y 512 tokens) y dos precisiones (fp16 e int8). Esto permite integrar reordenación semántica en aplicaciones móviles con latencia baja y sin dependencias externas, algo poco habitual en el ecosistema de rerankers, dominado por despliegues en servidor con vLLM o TGI.

El repositorio ocupa aproximadamente 0,6 GB e incluye seis paquetes `.mlpackage`, además de ejemplos de uso en Swift y Python y una auditoría de seguridad con ML-BOM. La licencia es MIT, heredada del modelo base, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens segun la variante del paquete |
| Tipos de cuantizacion | fp16 (~280 MB) e int8 (~140 MB) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` (Core ML); modelo base en safetensors |
| Tarea | text-ranking (reranker de pares consulta-documento) |
| Salida | score de relevancia en [0, 1] (sigmoid del logit) |
| Tokenizacion | par consulta+documento como secuencia unica, con `input_ids` y `attention_mask` |
| Tamano del repo | ~0,6 GB |
| Modelo base | hotchpotch/japanese-reranker-small-v2 |

## Arquitectura y entrenamiento

El modelo subyacente es un ModernBERT, un transformer encoder con las optimizaciones propias de esta familia (RoPE, atención con FlashAttention, capas normalizadas y vocabulario ampliado). La conversión a Core ML mantiene la topología del encoder y expone dos entradas (`input_ids` y `attention_mask`, ambas de tipo Int32 con forma `[1, seq_len]`) y una salida (`relevance_score`). El par consulta-documento se tokeniza conjuntamente como una única secuencia, de modo que el modelo aprende la interacción cruzada entre ambos textos, típico de los cross-encoders de reranking.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original; estos datos no están incluidos en la información proporcionada. La conversión segmenta el modelo por longitud fija de secuencia (128, 256, 512), lo que implica que cada paquete tiene una ventana rígida y el padding debe aplicarse a esa longitud exacta. La auditoría de seguridad referenciada (`model-audit-lite`) verifica formato de pesos, código embebido y linaje del modelo mediante un ML-BOM.

## Capacidades

- Reordenación de documentos: asigna una puntuación de relevancia en [0, 1] a cada par consulta-documento, útil para refinar resultados de un retrieval previo.
- Búsqueda semántica en japonés: entrenado específicamente para texto japonés, con soporte secundario de inglés.
- Ejecución en dispositivo: inferencia local en iOS y macOS mediante Core ML, con `computeUnits = .all` para aprovechar CPU, GPU y Neural Engine.
- Integración en pipelines de retrieval: actúa como segunda etapa (cross-encoder) tras un retriever bi-encoder.
- Detección de prompt injection: la demo asociada (Ruri Atlas) muestra cómo el reranker puntúa inyecciones de prompt frente a consultas legítimas.
- Sin tool calling, sin capacidades de agente, sin visión ni audio: es un modelo exclusivamente de ranking.
- Sin modo thinking ni generación de texto: no produce texto libre, solo una puntuación.

## Casos de uso

- Búsqueda documental en apps iOS: integrar el paquete int8 de 256 tokens en una app de notas o base de conocimiento para reordenar resultados de búsqueda local sin conexión, aprovechando el Neural Engine del dispositivo.
- Asistente de soporte en japonés: reordenar respuestas candidatas de una FAQ antes de mostrarlas al usuario, con latencia baja al ejecutarse en el propio terminal y sin enviar consultas a un servidor.
- Filtrado de prompt injection en asistentes: usar la puntuación del reranker para detectar documentos o entradas maliciosas que no sean relevantes para la consulta legítima, como demuestra la demo Ruri Atlas.
- RAG en macOS: combinar un retriever bi-encoder con este cross-encoder para mejorar la precisión de los fragmentos recuperados en una aplicación de escritorio, usando la variante de 512 tokens para documentos largos.
- Moderación y deduplicación de contenido: puntuar pares de textos para decidir si dos documentos son semánticamente equivalentes o si una respuesta se ajusta a una consulta.
- Evaluación offline de sistemas de búsqueda: usar el modelo como juez de relevancia en tests automatizados de pipelines de recuperación en japonés, ejecutándolo localmente con coremltools.
- Prototipado rápido en Swift: validar la calidad de un ranking antes de invertir en un despliegue servidor, gracias a los ejemplos de uso en Swift incluidos en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: los paquetes int8 ocupan ~140 MB y los fp16 ~280 MB; el modelo cabe holgadamente en la memoria unificada de cualquier dispositivo Apple moderno.
- GPU recomendadas: no aplica en el sentido tradicional; se ejecuta en Apple Silicon (M1 en adelante) y en chips A-series compatibles con Core ML.
- Cabe en consumer GPU: sí, en el sentido de que cabe en cualquier Mac con Apple Silicon; para GPUs NVIDIA no hay paquete Core ML y habría que usar el modelo base en PyTorch.
- Opciones de despliegue: Core ML nativo en iOS/macOS (Swift), `coremltools` en Python para verificación; para servidores, usar el modelo base `hotchpotch/japanese-reranker-small-v2` con Transformers, TGI o vLLM.
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del dispositivo y de la longitud de secuencia elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| japanese-reranker-small-v2-coreml | no disponible | 128/256/512 | ja, en | MIT | Core ML |
| hotchpotch/japanese-reranker-small-v2 (base) | no disponible | no disponible | ja, en | MIT | safetensors |
| BGE-reranker-base | no disponible | 512 | multilingue | MIT | safetensors, ONNX |
| jina-reranker-v2-base-multilingual | no disponible | 1024 | multilingue | CC BY-NC 4.0 | safetensors |

La comparativa se limita a características estructurales: el modelo de esta ficha es el único de la tabla con empaquetado nativo para Apple. Los datos de parámetros y contexto de los modelos alternativos no están disponibles en la información proporcionada, por lo que no se comparan cifras de rendimiento.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor original del modelo no la respalda ni la mantiene.
- Ventana de contexto rígida: cada paquete admite exactamente 128, 256 o 512 tokens; los textos más largos se truncan y pierden información.
- Enfoque principal en japonés: el soporte de inglés es secundario y no hay garantías de calidad en otros idiomas.
- Riesgo de sesgo: al ser un modelo entrenado sobre datos japoneses, puede reflejar sesgos culturales y lingüísticos de ese corpus; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación no aplica en el sentido generativo, pero la puntuación de relevancia puede ser errónea en dominios muy especializados o con jerga técnica.
- Dependencia de plataforma: el formato `.mlpackage` solo se ejecuta en el ecosistema Apple; para otros entornos hay que recurrir al modelo base.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, por lo que se recomienda evaluar en el dominio propio antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/japanese-reranker-small-v2-coreml
- Modelo base: https://huggingface.co/hotchpotch/japanese-reranker-small-v2
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
- README en japonés: README.ja.md (dentro del repositorio del modelo)
- Informe de seguridad: SECURITY.md (dentro del repositorio del modelo)
