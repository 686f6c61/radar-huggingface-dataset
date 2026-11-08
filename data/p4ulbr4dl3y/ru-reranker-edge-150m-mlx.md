# p4ulbr4dl3y/ru-reranker-edge-150m-MLX

## Resumen

`ru-reranker-edge-150m-MLX` es una conversión al formato MLX del modelo `sshalimov04/ru-reranker-edge-150m`, un cross-encoder basado en la arquitectura ModernBERT y especializado en ranking de texto en ruso. Lo publica el usuario `p4ulbr4dl3y` como artefacto derivado, con pesos en fp16 y licencia Apache-2.0, pensado para ejecutarse sobre Apple Silicon mediante la librería `mlx-embeddings`.

El modelo resuelve la tarea de reordenación (reranking) de candidatos recuperados por un sistema de búsqueda o RAG: recibe un par consulta-documento y devuelve un logit de relevancia. Con 149.605.633 parámetros y un repositorio de 0,3 GB, está dimensionado para inferencia en el borde (edge) y en hardware de consumo, no para servir como generador.

Su relevancia es doble: por un lado cubre el hueco de rerankers rusos ligeros en el ecosistema MLX, que hasta ahora dependía de conversiones GGUF con parches adicionales; por otro, el autor documenta una validación numérica frente a `transformers` en fp32 (Spearman 1.0000 sobre 120 pares) y mediciones de latencia concretas en Metal, lo que facilita evaluar su idoneidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT, cross-encoder (clasificación de pares) |
| Parametros totales | 149.605.633 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; los ejemplos usan `max_length=512` |
| Tipos de cuantizacion | fp16 en el repo; el autor reporta pruebas con q8, q4, mxfp8, mxfp4 y nvfp4 |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache-2.0 (pesos); la herramienta `mlx-embeddings` es GPL-3.0 |
| Formato de pesos | safetensors (MLX, fp16, 290 MiB) |

## Arquitectura y entrenamiento

Se trata de un cross-encoder ModernBERT: el par consulta-documento se tokeniza conjuntamente y el modelo produce una representación pooled sobre la que se aplica una cabeza de regresión de una sola etiqueta. La salida es un logit de relevancia (mayor valor, mayor relevancia), aunque el autor advierte que con la configuración por defecto de una sola etiqueta el modelo devuelve `sigmoid(logit)`, por lo que es necesario activar `model.is_regression = True` para obtener el logit crudo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; la model card de la conversión no los detalla y el modelo base `sshalimov04/ru-reranker-edge-150m` se referencia sin desglose. La innovación destacable de esta ficha es operativa, no arquitectónica: la conversión a MLX se completa en 1,3 s sin necesidad de parches (frente a los dos parches que requería la ruta GGUF en `conversion/bert.py`), y se valida contra `transformers` en fp32 con Spearman 1.0000 y una desviación máxima de logit de 0,009 sobre 120 pares de un conjunto golden.

## Capacidades

- Ranking de relevancia para pares consulta-documento en ruso, con salida de logit continuo.
- Reordenación de resultados de recuperación (segunda etapa de pipelines RAG o de búsqueda léxica/vectorial).
- Procesamiento por lotes de múltiples fragmentos por consulta (el autor mide 8 fragmentos por petición).
- Truncación configurable vía tokenizador (`truncation=True`, `max_length=512` en el ejemplo).
- Ejecución en Apple Silicon mediante MLX y Metal, con API Python directa.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador de ranking.

## Casos de uso

- Reordenación en pipelines RAG en ruso: tras una recuperación densa o BM25, el cross-encoder puntúa cada fragmento contra la consulta y permite quedarse con los mejores antes de pasarlos al generador, mejorando la precisión del contexto inyectado.
- Búsqueda documental interna en organizaciones rusoparlantes: indexación de manuales, contratos o bases de conocimiento y reordenación de los candidatos recuperados por el motor de búsqueda.
- Filtrado de duplicados y near-duplicates: el logit de relevancia entre una consulta y fragmentos casi idénticos permite umbralizar y descartar resultados redundantes antes de la presentación.
- Evaluación offline de sistemas de recuperación: al ser una conversión fiel a fp32 (Spearman 1.0000), sirve como referencia de puntuación para comparar configuraciones de recuperación sin depender de GPUs.
- Prototipado local en portátiles Mac: con 290 MiB de pesos en fp16 y latencias de 34 ms por par de 251 tokens, cabe en un flujo de desarrollo iterativo sin infraestructura dedicada.
- Servicio de ranking de baja latencia en el borde: 52 documentos/s con fragmentos de 175 tokens y lotes de 8 en Metal lo hacen viable para APIs ligeras o aplicaciones de escritorio.
- Clasificación de pares pregunta-respuesta en asistentes de soporte en ruso: puntuar respuestas candidatas de una base FAQ frente a la pregunta del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible; el modelo es un reranker y no un generador, por lo que esas métricas no aplican. Los datos de validación y rendimiento reportados por el autor son los siguientes:

| Metrica | Valor |
|---|---|
| Fidelidad vs. `transformers` fp32 (Spearman) | 1.0000 sobre 120 pares |
| Desviacion maxima de logit vs. fp32 | 0.009 |
| Latencia, 8 fragmentos de 175 tokens | 154 ms (52 docs/s) |
| Latencia, 8 fragmentos de 339 tokens | 318 ms (25 docs/s) |
| Latencia, par unico de 251 tokens | 34 ms |
| Throughput q8, 8 fragmentos | 46 / 23 docs/s (175 / 339 tokens) |
| Throughput q4, 8 fragmentos | 45 / 22 docs/s |
| Throughput mxfp8, 8 fragmentos | 34 / 17 docs/s |
| Throughput mxfp4, 8 fragmentos | 36 / 17 docs/s |
| Throughput nvfp4, 8 fragmentos | 35 / 17 docs/s |

El autor señala que las versiones cuantizadas no son más rápidas que fp16 en este modelo, y que los umbrales sobre el score absoluto no son portables entre implementaciones: el GGUF `Q8_0` de referencia desvía los logits respecto a HF en un factor de escala de ~1,42x (Spearman 0,92), mientras que estos pesos MLX no presentan esa discrepancia.

## Requisitos de hardware

- VRAM/unified memory: los pesos fp16 ocupan 290 MiB; con activaciones y lote pequeño, el consumo se mantiene muy por debajo de 1 GB.
- Hardware objetivo: Apple Silicon (series M) con backend Metal; el autor mide sobre M-series sin especificar el chip exacto.
- GPU dedicadas: no aplica de forma nativa, ya que MLX está orientado a Apple Silicon; para CUDA habría que recurrir al modelo base en `transformers` o a la conversión GGUF.
- Cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior, incluidas configuraciones de consumo.
- Despliegue: `mlx-embeddings` con `mlx.core`; el ejemplo de carga usa `mlx_embeddings.utils.load` y requiere activar `model.is_regression = True`.
- Latencia y throughput: 34 ms por par de 251 tokens y 52 docs/s en lotes de 8 con fragmentos de 175 tokens en Metal; las variantes cuantizadas no mejoran estas cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `p4ulbr4dl3y/ru-reranker-edge-150m-MLX` | 149,6 M | no disponible (ejemplos a 512) | safetensors MLX fp16 | Apache-2.0 (pesos) | Conversión MLX con validación Spearman 1.0000 vs fp32 |
| `sshalimov04/ru-reranker-edge-150m` | 149,6 M | no disponible | safetensors (transformers) | Apache-2.0 | Modelo base original; referencia fp32 |
| `p4ulbr4dl3y/ru-reranker-edge-150m-GGUF` | 149,6 M | no disponible | GGUF | Apache-2.0 | Conversión alternativa; requiere dos parches y desvía logits ~1,42x en Q8_0 |

No se dispone de datos de benchmarks comparativos frente a otros rerankers rusos (por ejemplo, variantes multilingües de cross-encoders) en la información proporcionada.

## Limitaciones y advertencias

- Solo ruso: no está entrenado ni validado para otros idiomas; su uso en castellano u otras lenguas no está respaldado.
- Es un reranker, no un generador: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgo heredado del corpus de entrenamiento del modelo base, no documentado en la información disponible.
- Los umbrales de score absoluto no son portables entre implementaciones (GGUF Q8_0 desvía ~1,42x); hay que recalibrar por despliegue.
- La configuración de una sola etiqueta devuelve `sigmoid(logit)` por defecto; sin `model.is_regression = True` se obtiene una probabilidad, no un logit, lo que altera el orden si se mezclan salidas.
- Licencia de los pesos Apache-2.0, pero la dependencia `mlx-embeddings` es GPL-3.0: conviene revisar la compatibilidad si se distribuye un producto que la enlace.
- Sin descargas ni likes en el momento de la consulta y creado en 2026-11-08: ecosistema muy reciente, sin validación comunitaria independiente.
- Sin datos publicados sobre tokens de entrenamiento, composición del dataset ni contexto máximo real; el límite de 512 en los ejemplos es una elección del autor, no una especificación confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p4ulbr4dl3y/ru-reranker-edge-150m-MLX
- Modelo base: https://huggingface.co/sshalimov04/ru-reranker-edge-150m
- Conversión GGUF del mismo autor: https://huggingface.co/p4ulbr4dl3y/ru-reranker-edge-150m-GGUF
