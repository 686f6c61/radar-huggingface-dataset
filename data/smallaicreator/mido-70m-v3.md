# SmallAICreator/MiDo-70M-v3

## Resumen

MiDo-70M-v3 es un modelo de lenguaje de 70,4 millones de parámetros (45,2 millones sin contar los embeddings) entrenado desde cero por UltraLabs (SmallAICreator). Su interés principal no reside en el rendimiento bruto, sino en la metodología: se entrenó mediante destilación de conocimiento (logit distillation) a partir de las distribuciones de salida completas de SmolLM2-360M, en lugar de usar únicamente etiquetas de siguiente token. Con aproximadamente 10,9 mil millones de tokens vistos en total, el autor reporta resultados competitivos frente a modelos más grandes entrenados con órdenes de magnitud más de datos.

La arquitectura es un decoder estilo Qwen3 con 15 capas, tamaño oculto de 512, FFN de 1536, 8 cabezas de consulta y 2 de clave/valor (dimensión de cabeza 64), RoPE y embeddings atados. El contexto es de 2.048 tokens y el vocabulario es el de SmolLM2 (49.152 tokens, plantilla ChatML). Se distribuye en formato GGUF (F16) tanto en variante Chat (tras SFT y DPO) como Base (solo preentrenamiento), y la licencia es Apache 2.0.

Es relevante ahora como ejemplo reproducible de entrenamiento eficiente en un único dispositivo (una sesión de Kaggle TPU v5e-8 por versión) y como alternativa para inferencia en dispositivo (on-device) en escenarios donde el espacio y el cómputo son extremadamente limitados. No obstante, con 58 descargas y sin likes, es un proyecto de nicho con validación externa limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Qwen3: 15 capas, hidden size 512, FFN 1536, 8 cabezas de consulta / 2 de KV (head dim 64), RoPE, embeddings atados |
| Parametros totales | 70.403.456 (70,4M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | GGUF F16 disponible; no se documentan otras cuantizaciones en la información proporcionada |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16) para Chat y Base; tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder de 15 capas con tamaño oculto 512 y FFN de 1536, 8 cabezas de consulta y 2 de clave/valor con dimensión de cabeza 64, RoPE y embeddings atados, siguiendo el diseño de Qwen3. El vocabulario es el de SmolLM2 (49.152 tokens) y la plantilla de conversación es ChatML.

El entrenamiento se realizó desde cero mediante destilación de conocimiento desde SmolLM2-360M, aprendiendo de las distribuciones de salida completas del profesor en lugar de solo etiquetas duras. La v3 añade 5,24 mil millones de tokens destilados a los 5,70 mil millones de la v1, totalizando aproximadamente 10,9 mil millones de tokens, incluyendo una fuente de banco de hechos y un anneal con alta carga de conocimiento. Cada versión se entrenó en una única sesión de Kaggle TPU v5e-8. El ajuste conversacional consistió en SFT de 420 pasos (conversaciones, GSM8K, MetaMathQA, Magicoder-OSS-Instruct) seguido de DPO de 849 pasos (hh-rlhf, PKU-SafeRLHF).

## Capacidades

- Generación de texto y completado en inglés, con variante Base orientada a conocimiento bruto y completado, y variante Chat orientada a conversación.
- Razonamiento básico y respuesta a preguntas de trivia y conocimiento general dentro de su rango de tamaño.
- Matemáticas elementales: el SFT incluyó GSM8K y MetaMathQA, aunque no se reportan métricas específicas de matemáticas en la información disponible.
- Generación de código: el SFT incluyó Magicoder-OSS-Instruct, aunque no se reportan benchmarks de código en la información disponible.
- Conversación multi-turno con plantilla ChatML.
- Capacidad de recuperación de hechos: 98,3% de acierto en el modelo base sobre 300 hechos entrenados, y aproximadamente 87% en el modelo Chat.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Asistente conversacional en dispositivo (on-device): con 70,4M de parámetros y pesos F16, el modelo cabe en dispositivos con recursos muy limitados y puede gestionar diálogos cortos en inglés con un contexto de 2.048 tokens, adecuado para asistentes embebidos sin conectividad.
- Prototipado educativo de destilación: sirve como caso de estudio reproducible para experimentar con logit distillation desde un profesor de 360M en hardware modesto (una TPU v5e-8), útil en investigación y docencia.
- Completado de texto y autocompletado ligero: la variante Base, con mejor bits per byte en WikiText (0,957) y mejor BLiMP (77,43), es apropiada para tareas de predicción de siguiente token en editores o formularios.
- Respuesta a preguntas sobre un dominio factual acotado: gracias a su banco de hechos de entrenamiento y a su alta tasa de recuperación (98,3% en base), puede emplearse en asistentes de FAQ cerradas donde el conocimiento esté cubierto por el entrenamiento.
- Filtrado y clasificación ligera por generación: al ser extremadamente pequeño, puede desplegarse en pipelines de preprocesado para generar etiquetas o resúmenes muy cortos con baja latencia, siempre que el inglés sea suficiente.
- Evaluación comparativa de modelos diminutos: útil como baseline en experimentos de eficiencia (tokens de entrenamiento frente a rendimiento) frente a Pythia-70M o Falcon-H1-Tiny-90M.
- Integración en llama.cpp para aplicaciones de escritorio: al distribuirse en GGUF, puede embeberse en herramientas locales que requieran un modelo conversacional mínimo sin dependencias de nube.

## Benchmarks y rendimiento

Resultados con lm-evaluation-harness 0.4.13, zero-shot, fp32, longitud máxima 2048 y conjuntos de test completos, según la model card:

| Tarea (métrica) | Pythia-70M | MiDo v1 Base | MiDo v1 Chat | MiDo v3 Base | MiDo v3 Chat |
|---|---|---|---|---|---|
| ARC-Easy (acc_norm) | 35,23 | 45,92 | 44,57 | 42,21 | 46,34 |
| ARC-Challenge (acc_norm) | 21,93 | 25,51 | 25,09 | 27,82 | 26,45 |
| HellaSwag (acc_norm) | 27,38 | 31,95 | 32,15 | 31,58 | 32,14 |
| LAMBADA OpenAI (acc) | 22,71 | 27,83 | 27,50 | 29,01 | 26,68 |
| PIQA (acc_norm) | 59,19 | 61,70 | 62,35 | 59,96 | 63,22 |
| Winogrande (acc) | 52,96 | 50,75 | 52,49 | 50,51 | 49,72 |
| Media de seis tareas | 36,57 | 40,61 | 40,69 | 40,18 | 40,76 |
| SciQ (acc) | 64,00 | 76,60 | 74,90 | 76,30 | 74,60 |
| BLiMP (acc) | 74,16 | 73,71 | 73,90 | 77,43 | 77,08 |
| WikiText (bits per byte, menor es mejor) | – | 1,002 | 1,060 | 0,957 | 1,056 |

TruthfulQA (lm-eval truthfulqa_mc1 / truthfulqa_mc2):

| Modelo | MC1 | MC2 |
|---|---|---|
| MiDo v3 Chat | 26,56 | 44,40 |

Prueba de chat del autor (12 preguntas cotidianas, 3 muestras cada una, temperatura 0,5, top-p 0,9, repeat penalty 1,15; se cuenta como correcta solo si no contiene detalles inventados):

| Modelo | Parámetros | Puntuación (/12) |
|---|---|---|
| MiDo-70M v3 Chat | 70M | 6,0 |
| SmolLM2-135M-Instruct | 135M | 4,67 |

Comparación con Falcon-H1-Tiny-90M-Instruct:

| Métrica | MiDo-70M v3 Chat | Falcon-H1-Tiny-90M-Instruct |
|---|---|---|
| Parámetros | 70M | 90M |
| Tokens de entrenamiento | ~10,9B (~1,4%) | ~800B |
| ARC-Easy acc (lm-eval 0.4.13, 0-shot) | 52,65 | 50,76 |
| ARC-Easy acc_norm | 46,34 | 44,74 |
| Trivia entrenada por ambos (46 preguntas × 3) | 82% (113/138) | 73% (101/138) |
| Trivia no entrenada por ninguno (14 preguntas × 3) | 26% (11/42) | 36% (15/42) |

## Requisitos de hardware

- VRAM estimada: con pesos F16 (70,4M parámetros) el modelo ocupa aproximadamente 140 MB, más el overhead de contexto y runtime; el repositorio completo pesa 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna o incluso CPU es suficiente; no requiere A100 ni H100. Cabe holgadamente en RTX 4090, RTX 3060 o GPUs integradas.
- Cabe en GPU consumer: sí, en todas las gamas, y también en dispositivos móviles o embebidos.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama mediante importación del GGUF, y otros runtimes compatibles con GGUF. No se documenta soporte de vLLM o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiDo-70M v3 | 70,4M | 2.048 | ~10,9B | Apache 2.0 | GGUF en HuggingFace |
| Pythia-70M | 70M | 2.048 | ~300B | Apache 2.0 | Pesos en HuggingFace |
| Falcon-H1-Tiny-90M-Instruct | 90M | No disponible | ~800B | No disponible en la información proporcionada | Pesos en HuggingFace |
| SmolLM2-135M-Instruct | 135M | No disponible | ~2T | No disponible en la información proporcionada | Pesos en HuggingFace |

En la media de seis tareas, MiDo v3 Chat (40,76) supera a Pythia-70M (36,57) y queda por debajo de SmolLM2-135M (49,3, según la referencia del autor). Frente a Falcon-H1-Tiny-90M, MiDo es ligeramente superior en ARC-Easy y en trivia entrenada, pero inferior en trivia no vista.

## Limitaciones y advertencias

- Tamaño muy reducido: el conocimiento factual fuera de los datos de entrenamiento es limitado; en trivia no vista por ninguno de los modelos comparados, MiDo obtiene un 26% frente al 36% de Falcon-H1-Tiny-90M.
- Riesgo de alucinación: el modelo tiende a inventar detalles cuando responde con extensión; el autor señala que sus respuestas cortas reducen este efecto, pero persiste, con TruthfulQA MC1 de 26,56.
- Contexto corto: 2.048 tokens limita conversaciones largas, documentos extensos y razonamiento multi-paso.
- Solo inglés: no se documenta soporte de otros idiomas.
- Pérdida de conocimiento tras el ajuste conversacional: el modelo Chat retiene aproximadamente el 87% de los hechos entrenados frente al 98,3% del base.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- Validación externa escasa: 58 descargas y 0 likes en el momento de la consulta; los benchmarks proceden del propio autor y las comparaciones de trivia se validaron manualmente, lo que introduce subjetividad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de calidad para producción; conviene evaluarlo en el dominio concreto antes de desplegarlo.
- El rendimiento en matemáticas y código no está cuantificado en la información disponible, pese a incluir datos de GSM8K, MetaMathQA y Magicoder en el SFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SmallAICreator/MiDo-70M-v3
- Profesor (SmolLM2-360M): https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Comparativa (Falcon-H1-Tiny-90M-Instruct): https://huggingface.co/tiiuae/Falcon-H1-Tiny-90M-Instruct
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Dataset Tulu 3 SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
