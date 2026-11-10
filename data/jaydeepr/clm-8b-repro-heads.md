# JaydeepR/clm-8b-repro-heads

## Resumen

CLM-8b-repro-heads es una reproducción independiente de CLM-8B ("Contrastive Language Models", Kwok et al., Stanford y NVIDIA Research, 2026). No es un modelo generativo: son dos cabezas de proyección pequeñas (18,9 M de parámetros entrenables) montadas sobre un Qwen3-8B congelado. Dado un contexto o situación y una lista de opciones, el sistema puntúa cada opción en un único forward pass mediante similitud coseno y softmax, sin generar texto. Resuelve el problema de la selección entre alternativas (verificación, reranking, decisión de siguiente acción en agentes) con un coste de entrenamiento muy bajo.

La arquitectura separa el procesamiento en dos cabezas: una "State head" que codifica la situación y una "Action head" que codifica cada opción, ambas proyectando a un espacio de 512 dimensiones donde se calcula la afinidad. El encoder subyacente es Qwen3-8B en la revisión `b968826d`, con pooling del último token y normalización L2. El autor reporta un coste total de entrenamiento de aproximadamente 82 dólares en Modal, repartido en tres etapas (pre-entrenamiento, mid-training y post-training).

Es relevante porque demuestra que es posible replicar con fidelidad razonable los resultados de un trabajo de investigación publicado, con recursos mínimos, y porque publica tanto los checkpoints como los logs y el código de entrenamiento. No obstante, el propio autor documenta una brecha significativa en tareas de decisión estilo juego (T-Rex), atribuida a que la receta de datos de post-entrenamiento de los autores originales no es pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos cabezas de proyección MLP (4096 -> 1536 -> 1536 -> 512) sobre encoder transformer Qwen3-8B congelado |
| Parametros totales | 18,9 M entrenables (cabezas) + ~8B del encoder congelado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (estados truncados a los últimos 2.047 tokens en chat template de Qwen) |
| Tipos de cuantizacion | no disponible (checkpoints en formato PyTorch; el encoder Qwen3-8B admite las cuantizaciones habituales de vLLM) |
| Idiomas soportados | inglés únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (pickles de `torch.save`); encoder en safetensors vía Hugging Face |

## Arquitectura y entrenamiento

El sistema consta de un encoder Qwen3-8B congelado en la revisión `b968826d9c46dd6066d109eabc6255188de91218`, con pooling del último token y normalización L2, seguido de dos cabezas MLP independientes de 4096 -> 1536 -> 1536 (con LayerNorm) -> 512 y activación GELU. La situación y cada opción se codifican por separado, se proyectan a 512 dimensiones y se combinan mediante producto coseno con una escala aprendida (temperatura con tope de 100) seguido de softmax sobre las opciones. Cada cabeza tiene 18,9 M de parámetros en total.

El entrenamiento se realizó en tres etapas sobre Modal, con AdamW sin weight decay y clipping de gradiente a 1,0. La etapa de pre-entrenamiento usó 62,1 M de pares pregunta-respuesta con InfoNCE y negativos in-batch (pares del mismo documento enmascarados), 30.000 pasos, batch de 16.384, LR 0,00653, durante 2,4 horas en una L40S. La etapa mid usó los chunks 0-27 de shard_00 con hasta 10 negativos duros por pregunta, 1.344 pasos, batch 16.384, LR 0,001, 57 minutos. La etapa post combinó un 60% de pasos de agente (914.106 pares de 39 configuraciones de ADP v2) y un 40% de replay de Q&A con negativos duros, 400 pasos, batch 16.384, LR 0,0003, 7 minutos. Los pares de agente se embebieron con Qwen3-8B en H100, aproximadamente 1,56B tokens.

## Capacidades

- Puntuación de opciones: dado un contexto y una lista de alternativas, asigna una probabilidad a cada una en un único forward pass, sin generación autorregresiva.
- Verificación y reranking de respuestas candidatas (selección de la mejor respuesta entre varias).
- Selección de siguiente acción en entornos de agente (a partir de estados truncados a 2.047 tokens).
- Razonamiento de elección múltiple sobre preguntas con respuestas plausibles y distractores ("tricky Q&A").
- Best-of-N sobre soluciones de código (evaluado con rollouts de DeepSWE).
- No soporta tool calling ni function calling en el sentido generativo: no produce texto ni llamadas, solo puntuaciones.
- No soporta visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Reranking en pipelines de recuperación: usar la cabeza para puntuar los documentos candidatos devueltos por un buscador y reordenarlos antes de pasarlos a un modelo generativo, aprovechando que la puntuación es una sola pasada por par contexto-opción.
- Verificación de respuestas en sistemas RAG: comparar la respuesta generada con varias alternativas candidatas y elegir la de mayor puntuación, reduciendo alucinaciones en dominios con distractores conocidos.
- Selección de siguiente acción en agentes: puntuar las acciones disponibles dado el estado actual del entorno, integrándose en un bucle de decisión donde el modelo solo elige entre opciones predefinidas.
- Best-of-N en generación de código: generar varias soluciones con un modelo generativo y usar la cabeza para seleccionar la más probable, tal como se evaluó en DeepSWE (30,8/38 de media en 5 semillas, frente a 28 de selección aleatoria).
- Triaje y enrutamiento de tickets: puntuar categorías de destino para un ticket entrante; el autor advierte que en pruebas informales con prompts escritos a mano el rendimiento es bajo (1 de 8), por lo que requiere fine-tuning previo.
- Evaluación de calidad de respuestas en pipelines de datos: filtrar pares pregunta-respuesta de un corpus asignando una puntuación de corrección frente a respuestas alternativas.

## Benchmarks y rendimiento

Resultados reportados por el autor, con el mismo código de evaluación y datos reservados para todas las cabezas. "Publicado" se refiere a los resultados del paper original; "Autores" a las cabezas publicadas por los autores de CLM.

| Prueba | Publicado | Cabezas de los autores | Este modelo |
|---|---|---|---|
| Tricky Q&A top-1 tras pre-entrenamiento | 52,1% | 51,7% | 50,7% |
| Tricky Q&A top-1 tras mid-training | 69,2% | 69,2% | 68,5% |
| Tricky Q&A top-1 tras post-training | 68,5% | 68,6% | 69,0% |
| General Q&A top-1 (1.024 vías) | no disponible | 83,6% | 82,7% |
| DeepSWE best-of-4, semilla 1234 | 31/38 | 31/38 | 30/38 |
| DeepSWE best-of-4, media de 5 semillas | no disponible | 31,0/38 | 30,8/38 |
| Latencia mediana de decisión T-Rex (L40S) | 16,5 ms | 17,0 ms | 17,1 ms |
| T-Rex cursos superados, escudo de seguridad activo | 5/5 | 5/5 | 3/5 |
| T-Rex acuerdo con el planificador del juego | 65,8% | 65,3% | 2,7% |

Referencia adicional: Qwen3-8B congelado con coseno simple y sin cabezas obtiene 14,4% en Tricky Q&A. En DeepSWE, la selección aleatoria resuelve 28 de 38 tareas y un selector perfecto 34.

## Requisitos de hardware

- El encoder Qwen3-8B en precisión completa requiere aproximadamente 16 GB de VRAM; las cabezas añaden solo 18,9 M de parámetros (unos 76 MB en fp32).
- GPU recomendadas: L40S (usada en las mediciones de latencia), H100 (usada para embeber los datos de entrenamiento), A100. Cabe en GPUs de consumo con cuantización del encoder (por ejemplo, RTX 4090 de 24 GB en fp16 o cuantizaciones de 8 y 4 bits).
- Despliegue mediante el servidor oficial de CLM: `vllm serve Qwen/Qwen3-8B --runner pooling --max-model-len 2048 --port 8090` seguido de `clm-serve --ckpt clm-8b-repro-post.pt`. Requiere instalar `git+https://github.com/Contrastive-LM/CLM.git`.
- Latencia mediana de decisión reportada: 17,1 ms en L40S para T-Rex.
- Throughput no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros entrenables | Contexto | Tricky Q&A post | DeepSWE best-of-4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CLM-8b-repro-heads | 18,9 M (sobre Qwen3-8B congelado) | 2.048 | 69,0% | 30,8/38 (media 5 semillas) | Apache 2.0 | Hugging Face, 0 descargas |
| CLM-v0.1-8B (autores) | no disponible | no disponible | 68,6% | 31,0/38 (media 5 semillas) | no disponible | Hugging Face (Contrastive-LM/CLM-v0.1-8B) |
| jackyk02/qwen3_8b_head | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3-8B con coseno simple (sin cabezas) | 0 | 2.048 | 14,4% | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Decisiones estilo juego (T-Rex) muy inferiores a las de los autores: 2,7% de acuerdo con el planificador frente a 65,3%, y 3/5 cursos superados frente a 5/5. El autor atribuye la brecha a que los datos de post-entrenamiento y el renderer de los autores no son públicos y se usó una reconstrucción.
- Prompts escritos a mano poco fiables: en una comprobación informal con 8 decisiones (enrutamiento de tickets, preguntas sobre documentos, siguiente paso de agente), acertó 1 de 8 frente a 2 de 8 de las cabezas de los autores. Recomendación explícita del autor: usar en tareas cercanas a los datos de entrenamiento o hacer fine-tuning y medir antes de confiar en él.
- Solo inglés.
- Los checkpoints son pickles de `torch.save`; deben cargarse únicamente desde fuentes de confianza (`torch.load(..., weights_only=False)`).
- Una cabeza solo funciona con el encoder y el pooling con los que fue entrenada: Qwen3-8B en la revisión `b968826d`, pooling del último token y normalización L2.
- Los datos de entrenamiento provienen de Nemotron-CC Diverse QA y de Agent Data Protocol (ADP v2), cuyos subconjuntos tienen licencias propias que deben revisarse para uso comercial, aunque las cabezas se liberen bajo Apache 2.0.
- No es un modelo generativo: no produce texto, tool calls ni razonamiento explícito; solo puntuaciones sobre opciones predefinidas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente fuera de la distribución de entrenamiento (ver el resultado de T-Rex y de los prompts manuales).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydeepR/clm-8b-repro-heads
- Código, logs y write-up: https://github.com/jaydeepraijada/clm-experiments
- Cabezas oficiales de los autores (CLM-v0.1-8B): https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Cabezas de referencia (jackyk02/qwen3_8b_head): https://huggingface.co/jackyk02/qwen3_8b_head
- Repositorio del código CLM: https://github.com/Contrastive-LM/CLM
- Blog de los autores (Contrastive Language Models): https://contrastive-lm.notion.site
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/Contrastive-LM/CLM-v0.1-Pretrain-Nemotron
- Dataset de embeddings negativos: https://huggingface.co/datasets/jackyk02/nemotron_dqa_qwen3_8b_neg_embeddings
- Dataset de agentes: https://huggingface.co/datasets/neulab/adp-v2
