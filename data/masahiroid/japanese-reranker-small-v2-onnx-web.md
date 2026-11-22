# masahiroid/japanese-reranker-small-v2-onnx-web

## Resumen

`masahiroid/japanese-reranker-small-v2-onnx-web` es una exportación no oficial a ONNX del cross-encoder reranker japonés `hotchpotch/japanese-reranker-small-v2`, empaquetada específicamente para ejecutarse en el navegador mediante transformers.js y ONNX Runtime Web (WebGPU o WASM). El modelo resuelve una tarea concreta: reordenar un conjunto de documentos candidatos según su relevancia respecto a una consulta, devolviendo una puntuación de similitud por par consulta-documento. Al estar exportado a ONNX con variantes fp32, fp16 e int8, permite desplegar un reranker de calidad en entornos sin servidor y con la inferencia completamente en el cliente.

La relevancia actual del modelo radica en que traslada una pieza habitualmente server-side de los pipelines RAG (el reranking) al navegador, con tamaños de 281 MB (fp32), 141 MB (fp16) y 71 MB (int8). Esto habilita búsqueda semántica privada, sin envío de datos a servidores, en aplicaciones web japonesas. La arquitectura subyacente es ModernBERT, según los tags del repositorio; no obstante, la información proporcionada no detalla el número exacto de parámetros ni la longitud de contexto del modelo base.

El repositorio tiene 65 descargas y 1 like, con licencia MIT heredada del modelo base. Es un artefacto de nicho orientado a desarrolladores que construyen aplicaciones de búsqueda o RAG en japonés con transformers.js.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder para reranking; según tags del repo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (soporta longitudes de secuencia dinámicas en la exportación ONNX) |
| Tipos de cuantización | fp32 (`model.onnx`, 281 MB), fp16 (`model_fp16.onnx`, 141 MB), int8 dinámica (`model_quantized.onnx`, 71 MB) |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | ONNX (con soporte transformers.js; pesos originales en safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de tipo transformer (ModernBERT según los tags) que recibe un par consulta-documento como entrada (`input_ids` y `attention_mask` en int64) y produce un único logit `[batch, 1]` al que se aplica una sigmoid para obtener una puntuación de relevancia entre 0 y 1. La exportación ONNX soporta batch y longitud de secuencia dinámicos, lo que permite procesar lotes de candidatos de distinta longitud en una sola pasada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base `hotchpotch/japanese-reranker-small-v2`. La innovación técnica destacable de esta exportación es la verificación numérica contra PyTorch con ONNX Runtime en CPU sobre pares de distinta longitud: fp32 con error máximo ≤ 6e-6, fp16 con error ≤ 4e-3 e int8 con diferencias de logits de hasta aproximadamente 1,2. El autor advierte explícitamente de que la calidad de ranking del fichero int8 debe validarse antes de usarlo en producción.

## Capacidades

- Reranking de documentos: puntuación de relevancia consulta-documento mediante cross-encoder, con salida sigmoide en rango 0-1.
- Procesamiento por lotes con batch y longitud de secuencia dinámicos.
- Inferencia en navegador con WebGPU (recomendado fp16) y WASM/CPU (recomendado int8).
- Integración nativa con transformers.js mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Procesamiento exclusivamente en japonés.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador de pares, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en el navegador: dado un conjunto de documentos recuperados por un retriever (por ejemplo, embeddings), el reranker reordena los candidatos localmente con WebGPU sin enviar la consulta ni los documentos a un servidor, preservando la privacidad del usuario.
- RAG con inferencia en cliente: en aplicaciones web que ya ejecutan un modelo generativo pequeño en el navegador, este reranker filtra y ordena los fragmentos de contexto antes de pasarlos al generador, mejorando la precisión de las respuestas.
- Asistentes de documentación técnica en japonés: indexación de manuales y guías internas para que un buscador corporativo devuelva los fragmentos más relevantes ordenados por pertinencia.
- Atención al cliente con base de conocimiento: ordenación de respuestas candidatas de una FAQ japonesa antes de mostrarlas al usuario, con latencia baja al ejecutarse en el dispositivo.
- Aplicaciones web offline o de baja conectividad: al ejecutarse íntegramente en el cliente con WASM e int8 (71 MB), funciona en entornos donde no hay acceso a servicios de inferencia remotos.
- Filtrado de prompt injection y contenido irrelevante: el demo Ruri Atlas muestra cómo visualizar dónde cae un intento de prompt injection en el espacio de embeddings y usar el reranker para descartar contenido no relevante.
- Prototipado rápido de pipelines de búsqueda: la API de transformers.js permite integrar el reranker en una demo web en pocas líneas de JavaScript, sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad numérica de la exportación ONNX frente a PyTorch:

| Precisión | Tamaño | Error máximo de logits frente a PyTorch |
|---|---|---|
| fp32 | 281 MB | ≤ 6e-6 |
| fp16 | 141 MB | ≤ 4e-3 |
| int8 (dinámica) | 71 MB | hasta ~1,2 |

## Requisitos de hardware

- VRAM estimada: 281 MB para fp32, 141 MB para fp16 y 71 MB para int8 en pesos; el consumo real depende del batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU compatible con WebGPU en el navegador; fp16 es la variante indicada para WebGPU.
- Consumer GPU: sí, cabe holgadamente en cualquier GPU de consumo moderna y en muchos iGPU, dado el reducido tamaño de los pesos.
- Despliegue: transformers.js con ONNX Runtime Web (WebGPU o WASM); también es posible ejecutarlo con ONNX Runtime en servidor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamaño de pesos | Formato | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|---|
| masahiroid/japanese-reranker-small-v2-onnx-web | Cross-encoder reranker (ModernBERT) | ja | 71-281 MB | ONNX | MIT | Sí (WebGPU/WASM) |
| hotchpotch/japanese-reranker-small-v2 | Cross-encoder reranker (modelo base) | ja | no disponible | safetensors | MIT | No (requiere exportación) |
| Rerankers multilingües de propósito general | Cross-encoder | multi | variable | safetensors/ONNX | variable | Depende de la exportación |

La comparativa se limita al modelo base y a alternativas genéricas, ya que la información proporcionada no incluye datos de rendimiento de otros rerankers japoneses que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta japonés; no está entrenado ni validado para otros idiomas.
- Es un clasificador de pares, no un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling.
- La variante int8 presenta diferencias de logits de hasta ~1,2 frente a PyTorch; el autor recomienda validar la calidad de ranking antes de usarla en producción.
- No se han publicado benchmarks de calidad de ranking (nDCG, MRR) en la información disponible, por lo que el rendimiento real en tareas de retrieval no está cuantificado.
- Riesgo de sesgos y alucinación inherente al modelo base: no se documentan en la información disponible.
- Licencia MIT, que permite uso comercial, pero al ser una exportación no oficial el autor no ofrece garantías sobre el modelo base.
- El repositorio tiene un uso muy bajo (65 descargas, 1 like), lo que implica poca validación comunitaria.
- La longitud de contexto del modelo base no está documentada; secuencias largas pueden truncarse según la configuración del tokenizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/japanese-reranker-small-v2-onnx-web
- Modelo base: https://huggingface.co/hotchpotch/japanese-reranker-small-v2
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- transformers.js: https://github.com/huggingface/transformers.js
- Herramienta de auditoría model-audit-lite: https://github.com/masahiroid/model-audit-lite
