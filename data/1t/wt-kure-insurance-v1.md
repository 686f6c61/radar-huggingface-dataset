# 1T/wt-kure-insurance-v1

## Resumen

wt-kure-insurance-v1 es un adaptador LoRA de dominio (seguros) para recuperación de información en coreano, construido sobre el modelo de embeddings nlpai-lab/KURE-v1, cuyo backbone es BAAI/bge-m3. Lo desarrolla Wontae Kim (usuario 1T) y se publica bajo licencia MIT. Su objetivo es resolver un problema concreto: los modelos de embeddings densos degradan rápidamente su Recall cuando el chunk indexado crece, algo crítico en documentación aseguradora, donde una cláusula contractual solo tiene sentido junto a su contexto de póliza.

El adaptador entrena explícitamente un currículum por longitud para que la ventaja frente al modelo base y frente a APIs comerciales aumente a medida que el chunk se alarga. Con 568M de parámetros en el base (1024 dimensiones, `max_seq` de 8192) y solo 7.110.656 parámetros entrenables en el adaptador (1,24 % del base, 28,5 MB), cubre de 256 a 7500 tokens por chunk con un único modelo, lo que permite una estrategia de indexación multi-resolución (chunks cortos para precisión, chunks largos para preservar contexto).

Es relevante ahora porque la mayoría de stacks RAG en dominios verticales con documentos largos dependen de recortar el contexto o de pagar APIs propietarias con ventanas limitadas. Este adaptador declara mejoras de hasta +22,15 pp sobre el base y +59,52 pp sobre OpenAI `text-embedding-3-large` en Recall@1 con chunks de 7500 tokens, manteniendo el rendimiento general en coreano prácticamente intacto (−0,07 pp en KorSTS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone bge-m3 de BAAI) con adaptador LoRA acoplado |
| Parametros totales | 568M en el modelo base (KURE-v1); 7.110.656 parametros entrenables en el adaptador (1,24 % del base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (`max_seq` del base); el adaptador se entrena de 256 a 7500 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT (el adaptador hereda la licencia del base; base KURE-v1 MIT y backbone bge-m3 MIT) |
| Formato de pesos | safetensors (adaptador PEFT; 28,5 MB) |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado desde cero, sino un adaptador LoRA (r=16, alpha=32) aplicado sobre las proyecciones Q, K, V y dense del encoder bge-m3 que sirve de backbone a KURE-v1. La dimensión de embedding es 1024 y la ventana máxima 8192 tokens. La función de pérdida es MultipleNegativesRankingLoss con temperatura 0,05, combinando negativos in-batch y negativos duros minados (4 por consulta durante el entrenamiento). La innovación principal es el currículum de longitudes: la primera época es short-heavy (50 % de chunks de 256 tokens) y la tercera es long-heavy (50 % de chunks de 7500 tokens), de modo que el modelo no solo aprende a manejar chunks largos, sino que su ventaja relativa crece con la longitud del chunk.

Los datos de entrenamiento son 437 documentos privados del dominio asegurador, troceados en 4 resoluciones hasta 15.500 chunks, sobre los que se generaron 46.500 consultas sintéticas (3 por chunk, vía LLM) con 8 negativos duros minados por consulta. El split es a nivel de producto (no de chunk), lo que evita fugas de información: 40.344 ejemplos de entrenamiento, 5.397 de evaluación y 759 de test fuera de dominio. El entrenamiento se realizó en una única H100 de 80 GB en bf16 con gradient checkpointing, con un pico de VRAM de 18,6 GB y una duración total de 15 horas y 21 minutos para 3 épocas. No se documenta una etapa de RLHF ni DPO; es un ajuste supervisado con pérdida contrastiva.

## Capacidades

- Generación de embeddings de frases y documentos largos (256 a 7500 tokens) para búsqueda semántica y recuperación densa.
- Similitud semántica entre pares de frases en coreano (probado en KorSTS).
- Recuperación con indexación multi-resolución: un mismo modelo indexa chunks cortos (búsqueda precisa) y largos (contexto preservado).
- Manejo de contexto largo con ventanas nativas de hasta 8192 tokens.
- Especialización en dominio asegurador coreano (pólizas, cláusulas, productos).
- Compatible con el ecosistema sentence-transformers y PEFT.
- No incluye generación de texto, tool calling, capacidades de agente, visión ni audio: es exclusivamente un encoder de representaciones.

## Casos de uso

- Búsqueda de cláusulas en pólizas: indexar cada póliza como chunk de 4096 a 7500 tokens para recuperar la cláusula relevante conservando su contexto contractual, sin necesidad de reordenar fragmentos.
- Motor RAG para atención al cliente aseguradora: usar chunks de 256 tokens para preguntas concretas ("¿se puede pagar la prima a plazos?") y chunks largos para consultas que requieren contexto acumulado, todo con el mismo índice vectorial.
- Recuperación multi-resolución en un único índice: mantener dos granularidades del mismo corpus y consultar la adecuada según la longitud de la pregunta, reduciendo coste de infraestructura frente a mantener varios modelos.
- Cumplimiento normativo y auditoría documental: comparar textos de contratos y detectar versiones casi idénticas de cláusulas, aprovechando la similitud semántica en coreano (Spearman 0,8766 en KorSTS).
- Deduplicación y clustering de documentos internos: agrupar 200.000+ chunks de productos aseguradores por similitud de embedding.
- Migración desde API propietaria: sustituir OpenAI `text-embedding-3-large` en un pipeline de retrieval en coreano y servir localmente en GPU, con una mejora declarada de hasta +59,52 pp de Recall@1 en chunks largos.
- Búsqueda en bases de conocimiento internas coreanas: cualquier corpus técnico en coreano con documentos largos y vocabulario de dominio, siempre que se acepte ajustar o validar el adaptador para el nuevo dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas de forma independiente).

Recall@1 por longitud de chunk en un conjunto de evaluación privado del dominio:

| Resolucion | Modelo | Base KURE-v1 | OpenAI text-embedding-3-large | vs base | vs OpenAI |
|---|---:|---:|---:|---:|---:|
| 256 tokens | 96,32 % | 93,23 % | 89,73 % | +3,09 pp | +6,60 pp |
| 1024 tokens | 94,77 % | 88,45 % | 76,51 % | +6,31 pp | +18,26 pp |
| 4096 tokens | 82,06 % | 65,16 % | 37,02 % | +16,90 pp | +45,04 pp |
| 7500 tokens | 77,74 % | 55,59 % | 18,22 % | +22,15 pp | +59,52 pp |

El autor indica que la significación se comprobó con paired permutation test y corrección de Bonferroni (14 victorias, 2 empates, 0 derrotas frente a OpenAI). Señala también que los valores absolutos están inflados porque el corpus de evaluación es más pequeño que un sistema en producción (200K+ chunks), y que la comparación relativa es justa al usar condiciones idénticas. `text-embedding-3-large` se truncó a 6000 caracteres en los casos de 4096 y 7500 tokens para evitar su límite de ventana.

Prueba de olvido en coreano general (KorSTS, 519 pares, datos públicos):

| Modelo | Spearman |
|---|---:|
| wt-kure-insurance-v1 | 0,8766 |
| Base KURE-v1 | 0,8774 (−0,07 pp) |
| OpenAI text-embedding-3-large | 0,8234 |
| e5-small-ko + LoRA (384 dim) | 0,7996 |

Latencia por consulta:

| Entorno | seq=128 | seq=1024 | seq=4096 | seq=7500 |
|---|---:|---:|---:|---:|
| H100 80 GB, bf16 (estimado a partir del perfil de entrenamiento) | ~3 ms | ~13 ms | ~52 ms | ~124 ms |
| Apple M-series, CPU, batch=2 (medido) | 108 ms | 517 ms | 2488 ms | 6805 ms |

Al fusionar el adaptador con el base, la latencia de servicio iguala a la del base (el modo inferencia PEFT añade entre un 3 % y un 20 % de sobrecarga en secuencias cortas).

## Requisitos de hardware

- Inferencia en bf16 del base de 568M: en torno a 1,2-1,5 GB de pesos; con activaciones y batch pequeño, el consumo típico se sitúa en 2-4 GB de VRAM.
- Entrenamiento del adaptador tal como se documenta: 18,6 GB de pico de VRAM en una H100 80 GB con gradient checkpointing y bf16. Reproducible en GPUs de 24 GB con ajustes de batch si se mantiene el checkpointing.
- GPU recomendadas: H100 80 GB (referencia de entrenamiento e inferencia rápida), A100 40/80 GB, L4/A10 para servicio; cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia pura.
- Consumer GPU: sí cabe en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, siempre que se ejecute en bf16/fp16; la cuantización no está documentada por el autor.
- CPU: posible pero poco práctica. En Apple M-series, una consulta de 7500 tokens tarda 6,8 s (batch=2 medido); el propio autor desaconseja CPU para este modelo.
- Despliegue: sentence-transformers + PEFT para cargar el adaptador directamente; vLLM con `--task embed` requiere fusionar previamente el adaptador con `merge_and_unload()`, ya que no lee adaptadores de forma nativa.
- Latencia estimada: ver tabla de la sección de benchmarks (H100 bf16: ~3 ms a 128 tokens, ~124 ms a 7500 tokens).
- Almacenamiento: el adaptador ocupa 28,5 MB; el base añade el peso completo del modelo de 568M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Recall@1 (7500 tok, dominio) | KorSTS (Spearman) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| wt-kure-insurance-v1 | 568M base + 7,1M adaptador | 8192 | 1024 | 77,74 % | 0,8766 | MIT | Adaptador publico en HuggingFace |
| nlpai-lab/KURE-v1 (base) | 568M | 8192 | 1024 | 55,59 % | 0,8774 | MIT | Publico |
| OpenAI text-embedding-3-large | No disponible | 8192 (truncado a 6000 caracteres en la prueba) | 3072 (no confirmado en la ficha) | 18,22 % | 0,8234 | Propietaria (API) | Solo API |
| 1T/wt-e5-small-ko-insurance-v1 | No disponible (modelo tipo e5-small) | No disponible | 384 | No disponible | 0,7996 | No disponible en la informacion | Publico |

El competidor directo y más honesto es el propio base KURE-v1: el adaptador mejora la recuperación en dominio largo sin degradar el rendimiento general en coreano. Frente a la API propietaria, la ventaja es de despliegue local y coste, a cambio de que los datos de evaluación son privados y no reproducibles.

## Limitaciones y advertencias

- Los resultados de dominio (Recall@1) provienen de un conjunto de evaluación privado y no reproducible; los números absolutos están reconocidamente inflados por el tamaño reducido del corpus de evaluación.
- La métrica KorSTS del model-index está marcada como `verified: false`; es un dato declarado por el autor, no verificado de forma independiente.
- Las consultas de entrenamiento son sintéticas (generadas por LLM), por lo que la distribución puede diferir de las consultas reales de usuarios finales.
- Solo se distribuye el adaptador; el tokenizer y la configuración de pooling se heredan del base y deben cargarse aparte.
- Idioma limitado al coreano: no hay evidencia de rendimiento en otros idiomas.
- Es un modelo de embeddings, no un generador: no responde preguntas ni ejecuta tool calling por sí mismo.
- El tamaño (568M, 1024 dimensiones) lo hace pesado para CPU; el autor recomienda una alternativa de 384 dimensiones para ese escenario.
- Los datos de entrenamiento son privados y no se incluyen en el repositorio, lo que impide auditar sesgos específicos del corpus asegurador.
- Licencia MIT, sin restricciones documentadas para uso comercial, pero se hereda la licencia del base (KURE-v1 y bge-m3, ambas MIT).
- Riesgo de alucinación no aplica de forma directa (no genera texto), pero el sistema RAG que lo use puede recuperar chunks irrelevantes si el corpus de destino se aleja del dominio asegurador coreano.
- Sin datos publicados sobre cuantización; no se garantiza comportamiento en GGUF u otros formatos comprimidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1T/wt-kure-insurance-v1
- Modelo base: https://huggingface.co/nlpai-lab/KURE-v1
- Backbone subyacente: BAAI/bge-m3
- Alternativa ligera mencionada por el autor: https://huggingface.co/1T/wt-e5-small-ko-insurance-v1
- Cita sugerida por el autor: Kim, Wontae (2026). "wt-kure-insurance-v1: a long-context Korean insurance-domain retrieval LoRA for KURE-v1", https://huggingface.co/1T/wt-kure-insurance-v1
- La busqueda web no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a tematicas fiscales sin relacion con el modelo.
