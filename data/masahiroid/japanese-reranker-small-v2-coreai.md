# masahiroid/japanese-reranker-small-v2-coreai

## Resumen

`japanese-reranker-small-v2-coreai` es una conversión no oficial al runtime Core AI de Apple del modelo `hotchpotch/japanese-reranker-small-v2`, un reranker para japonés basado en la arquitectura ModernBERT. Lo publica el usuario masahiroid y su objetivo es permitir la ejecución del reranker directamente en dispositivos iOS y macOS sobre Neural Engine o GPU, sin depender de un servidor. Core AI es el runtime de IA en dispositivo de Apple presentado como sucesor de Core ML, disponible a partir de iOS/macOS 27.

El modelo original resuelve el problema de reordenar (reranking) pares de consulta y documento según su relevancia, una pieza habitual en pipelines de recuperación de información (RAG, búsqueda semántica). La conversión conserva la arquitectura del original: 13 capas, tamaño oculto 384, y una cabeza de clasificación sobre el token CLS que produce un logit de relevancia. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato `.aimodel` en float16 con tres longitudes de secuencia fijas (128, 256 y 512 tokens).

Es relevante ahora porque demuestra un patrón práctico para llevar rerankers ligeros a hardware de Apple con validación tanto en Neural Engine como en GPU, incluyendo comparación numérica contra la referencia en PyTorch fp32. La ficha se centra en la conversión; los detalles de entrenamiento del modelo base no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), 13 capas, hidden size 384 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | secuencias fijas de 128, 256 y 512 tokens (query + documento como par) |
| Tipos de cuantizacion | float16 (único formato empaquetado) |
| Idiomas soportados | ja, en |
| Licencia | MIT |
| Formato de pesos | `.aimodel` (Core AI), float16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, un transformer encoder con 13 capas y dimensión oculta 384, adaptado para japonés en el modelo original `hotchpotch/japanese-reranker-small-v2`. La tarea es de ranking de texto: la consulta y el documento se tokenizan juntos como un único par y el modelo aplica CLS pooling seguido de una cabeza de clasificación que emite un logit de relevancia. El usuario debe aplicar sigmoid para obtener una puntuación en [0, 1].

La conversión a Core AI se reescribió desde cero para el Neural Engine, con layout BC1S, proyecciones implementadas como Conv2d y atención explícita por cabeza. La implementación se agrupa en `reranker_xsmall_ane.py`, seleccionable con la variable `ANE_MODEL_NAME=hotchpotch/japanese-reranker-small-v2`. Se incluyen tres variantes con longitudes fijas (`seq128`, `seq256`, `seq512`) y se validaron tanto la especialización para GPU como para Neural Engine. No hay información disponible sobre el dataset de entrenamiento, número de tokens, ni sobre si el modelo original usó RLHF o DPO.

## Capacidades

- Reranking de pares consulta-documento en japonés e inglés, devolviendo un logit de relevancia por par.
- Puntuación de relevancia calibrable mediante sigmoid para obtener un valor en [0, 1].
- Ejecución en dispositivo en iOS/macOS 27+ sobre Neural Engine o GPU mediante Core AI.
- Tres ventanas de entrada fijas (128, 256 y 512 tokens) para ajustar coste y precisión.
- Integración en pipelines de búsqueda y RAG como etapa de reordenación tras un retriever.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio; es un modelo exclusivamente de ranking.

## Casos de uso

- Búsqueda semántica en japonés: tras recuperar candidatos con un modelo de embeddings, el reranker reordena los documentos según relevancia usando la variante de 512 tokens para pasajes largos.
- RAG sobre documentación interna: en una app iOS o macOS, el reranker filtra los fragmentos recuperados antes de pasarlos al LLM generador, todo en dispositivo y sin enviar datos a un servidor.
- Asistentes locales con privacidad: aplicaciones que procesan consultas sensibles pueden puntuar documentos en el Neural Engine sin salida de red.
- Atención al cliente automatizada: selección de los artículos de ayuda más relevantes para una consulta del usuario antes de componer la respuesta.
- Filtrado de resultados en buscadores de catálogo: reordenación de productos o fichas en función de la consulta, con latencia baja en hardware Apple.
- Evaluación de prompt injection: el demo Ruri Atlas ilustra cómo un documento malicioso se posiciona en el ranking, útil para auditar pipelines de recuperación.
- Prototipado multiplataforma: validación de pipelines de ranking en GPU y Neural Engine con la misma implementación y comparación de precisión frente a la referencia PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, etc.) en la información disponible. La model card sí incluye una comparación de precisión numérica frente a la referencia PyTorch fp32 sobre 4 pares consulta/documento (1 relevante, 3 irrelevantes o parciales):

| Objetivo | seq128 (dif. max. abs. logit) | seq256 | seq512 |
|---|---|---|---|
| Especialización GPU | 0.0079 | 0.0099 | 0.0235 |
| Especialización Neural Engine | 0.0252 | 0.0252 | 0.0252 |

El orden de ranking coincidió exactamente en todos los buckets y unidades de cómputo. Los logits en esos pares oscilan aproximadamente entre -12 y +11, y la resolución de fp16 cerca de 10 es de unos 0.008.

## Requisitos de hardware

- Ejecución prevista en dispositivos Apple con iOS/macOS 27 o superior, sobre Neural Engine o GPU.
- El repositorio ocupa 0,4 GB; el tamaño exacto en memoria por variante no está disponible.
- No se documentan requisitos de VRAM para GPU de escritorio ni compatibilidad con CUDA.
- No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el runtime objetivo es Core AI (`coreai.runtime`, dependencia `coreai-core==1.0.0b3`).
- Latencia y throughput no disponibles.
- El tokenizador se obtiene de `hotchpotch/japanese-reranker-small-v2` mediante `transformers`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Runtime |
|---|---|---|---|---|---|
| masahiroid/japanese-reranker-small-v2-coreai | ModernBERT 13 capas, hidden 384 | 128/256/512 fijos | ja, en | MIT | Core AI (iOS/macOS) |
| hotchpotch/japanese-reranker-small-v2 | ModernBERT 13 capas, hidden 384 | no disponible | ja, en | no disponible en esta ficha | PyTorch/Transformers |
| masahiroid/japanese-reranker-xsmall-v2-coreai | ModernBERT (tamaño menor) | no disponible | ja, en | no disponible en esta ficha | Core AI (iOS/macOS) |
| masahiroid/ruri-v3-130m-coreai | modelo de embeddings (no reranker) | no disponible | ja, en | no disponible en esta ficha | Core AI (iOS/macOS) |

Los datos de rendimiento comparativo entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión comunitaria no oficial; no cuenta con el respaldo del autor del modelo original.
- Solo se empaqueta en float16; no hay variantes cuantizadas a int8 o int4.
- Las longitudes de entrada son fijas (128, 256 o 512 tokens); los pares más largos se truncan.
- El modelo emite un logit crudo; es responsabilidad del usuario aplicar sigmoid y calibrar el umbral.
- Solo cubre japonés e inglés; el rendimiento en otros idiomas no está documentado.
- No se han publicado evaluaciones de sesgo ni de robustez frente a alucinación o adversarios más allá de la auditoría de seguridad con `model-audit-lite`.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base antes de redistribuir.
- Requiere iOS/macOS 27+ y el runtime Core AI, lo que limita su despliegue a hardware Apple reciente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/japanese-reranker-small-v2-coreai
- Modelo base: https://huggingface.co/hotchpotch/japanese-reranker-small-v2
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Conversión relacionada (xsmall): https://huggingface.co/masahiroid/japanese-reranker-xsmall-v2-coreai
- Conversión relacionada (embeddings): https://huggingface.co/masahiroid/ruri-v3-130m-coreai
- Documentación de Core AI: https://developer.apple.com/documentation/coreai
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
