# flavianv/qwen3-4b-musical-instruments-full-ranker-20260923-v1

## Resumen

El modelo `flavianv/qwen3-4b-musical-instruments-full-ranker-20260923-v1` es un ranker de relevancia de producto especializado en instrumentos musicales, construido sobre el backbone Qwen3-4B y publicado por el usuario flavianv. No es un modelo generativo de propósito general: la tarea que resuelve es puntuar y ordenar listas de productos (identificados por título) frente a una consulta de usuario, devolviendo una puntuación escalar por candidato. Es la culminación de una cadena de entrenamiento que parte de un ajuste supervisado sobre Qwen3-4B y continúa con un entrenamiento de ranking por pares a parámetros completos.

El checkpoint publicado corresponde al paso 2.464 (época 1,75 sobre un plan de dos épocas) y se seleccionó por validación. Alcanza una exactitud top-1 de 253/300 (84,33%) sobre un conjunto fijo de 300 consultas frente a tres negativos generados por el modelo SFT. Todo el backbone Qwen3-4B (4.022.470.656 parámetros) permanece descongelado y entrena junto a la cabeza escalar, por lo que se trata de un fine-tuning completo y no de un adaptador LoRA ni de una cabeza con backbone congelado.

Su relevancia es acotada pero clara: cubre una necesidad específica de e-commerce y catálogos de instrumentos musicales, donde los sistemas de recuperación necesitan una etapa de reranking fiable sobre títulos de producto. La licencia Apache 2.0 y el formato estándar `AutoModelForSequenceClassification` (sin necesidad de `trust_remote_code`) facilitan su integración en producción, aunque se trata de un modelo de nicho con soporte limitado a la tarea y al dominio para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-4B) con cabeza de ranking escalar para clasificación de secuencias |
| Parametros totales | 4.022.470.656 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (serialización de entrada sin truncado más allá de ese límite, según la model card) |
| Tipos de cuantizacion | Carga en FP32 con autocast BF16; se documenta también carga en BF16 puro. No se publican cuantizaciones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el backbone ancestro Qwen3-4B es multilingüe, pero no se valida aquí) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3-4B, un transformer decoder-only denso de 4.022.470.656 parámetros, y sustituye la cabeza de lenguaje por una cabeza de ranking escalar sobre la que se aplica `AutoModelForSequenceClassification`. La entrada no es texto libre: se serializa una consulta más una lista ordenada de títulos de producto como cadenas, empaquetadas en mensajes sistema/usuario/asistente con el formato `{"products": [...]}` y con el modo "thinking" desactivado. Los identificadores, categorías y roles no se usan como entrada. La carga estándar funciona sin `trust_remote_code`, aunque el autor distribuye un `ranker.py` y un `requirements.txt` para el scoring evaluado.

El entrenamiento es de ranking por pares a parámetros completos. Se usaron 22.513 comparaciones auditadas por pares procedentes de 6.823 consultas, alternando dos órdenes positivos por consulta, con 7.000 grupos en la cohorte original. Se descartó un negativo contradictorio (mismo título, ID distinto) y los negativos generados son bundles de ID válidos con como máximo una coincidencia de ID de referencia. El objetivo es la media del logaritmo negativo de la sigmoide de la diferencia de puntuaciones (positivo menos negativo). Se usó AdamW con LR 1e-4, betas (0,9; 0,999), epsilon 1e-8 y weight decay 0,01; batch de 4 pares con 4 acumulaciones (16 pares por actualización), clip 1, semilla 42 y schedule coseno con 84 pasos de warmup (3%). El entrenamiento duró dos épocas y 2.816 actualizaciones, con evaluaciones cada 352 pasos y checkpointing de gradientes, en FP32 con autocast BF16. El `Trainer` tardó 4.035,18 segundos con un pico de memoria GPU asignada de 73,91 GB. Todos los ajustes se fijaron antes de la ejecución y no hubo early stopping. La configuración cruda incluye un campo `head_only: true` que es un alias heredado del entrenador dedicado y no un ajuste de congelación: `training_mode=full_parameter_ranking` y las comprobaciones de gradientes verifican que todos los parámetros entrenan.

## Capacidades

- Puntuación y ordenación (ranking) de listas de productos por relevancia frente a una consulta, devolviendo una puntuación escalar por candidato (valores reales sin restringir, no probabilidades).
- Reranking de candidatos generados por un sistema de recuperación previo, útil como segunda etapa en pipelines de búsqueda.
- Diferenciación entre productos por título cuando los títulos son distintos; la model card advierte que con títulos idénticos no puede distinguir IDs diferentes.
- Clasificación de secuencias mediante `AutoModelForSequenceClassification` estándar, sin código remoto.
- Procesamiento por lotes (`score_batch`) de pares consulta/productos.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito; el modo "thinking" se desactiva en la serialización.

## Casos de uso

- Reranking en buscador de e-commerce de instrumentos musicales: tras una primera etapa de recuperación por embeddings, el modelo reordena los títulos candidatos frente a la consulta para colocar arriba los productos realmente pertinentes, aprovechando que se evaluó con precisión top-1 del 84,33% sobre pools de cuatro candidatos.
- Recomendación de productos complementarios: dada una consulta como "necesito un micrófono y un soporte", el modelo puntúa bundles de productos y permite ordenar combinaciones coherentes, como se muestra en el ejemplo de la model card con micrófono USB y soporte ajustable.
- Asistente conversacional de compra: integrado en un chatbot de tienda de música, puntúa las sugerencias generadas antes de mostrarlas al usuario, reduciendo recomendaciones irrelevantes en conversaciones multi-turno.
- Filtrado y curación de datos de entrenamiento: el propio flujo del autor lo usó para construir y validar cohortes de negativos, por lo que puede emplearse para descartar pares contradictorios o poco informativos en datasets de ranking.
- Evaluación de relevancia en catálogos: sirve como juez automático para medir la calidad de un sistema de recomendación o búsqueda interno comparando órdenes generados por distintas versiones del sistema.
- Normalización de bundles de producto: al puntuar listas de títulos, ayuda a validar que un conjunto de artículos propuesto por otro sistema (por ejemplo, un LLM generativo) es coherente con la petición del usuario.
- Segunda etapa en sistemas híbridos de búsqueda: combinable con recuperadores léxicos o vectoriales para desempatar resultados cercanos en consultas ambiguas del dominio de instrumentos musicales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card sí reporta métricas de validación internas sobre un conjunto fijo de 300 consultas y 1.200 candidatos:

| Metrica | Resultado |
|---|---|
| Exactitud top-1 (300 consultas fijas) | 253/300 (84,33%) |
| Exactitud por pares (900 pares referencia/negativo) | 91,89% |
| Punto de partida de la misma implementación | 209/300 (69,67%) |
| Mejor resultado histórico head-only | 211/300 (70,33%) |
| Época 2 final | 250/300 (83,33%) |
| Intervalo de Wilson al 95% para el mejor checkpoint | 79,8% – 88,0% |
| Trayectoria por cuartos (época 0 en adelante) | 69,67; 46,00; 65,67; 74,67; 79,00; 82,00; 82,67; 84,33; 83,33 (%) |

Advertencia del autor: es un resultado seleccionado por validación, no sobre un test intacto (el test reservado no se usó). El intervalo de Wilson no está ajustado por la selección de checkpoint. Todos los candidatos de validación estaban prefiltrandos como válidos, por lo que el 100% de validez seleccionada es por construcción y no una capacidad aprendida de generar JSON correcto. No se evaluó la sensibilidad al orden de los pares ni la calidad de generación libre.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 8 GB solo para pesos, más activaciones (entradas cortas, hasta 2.048 tokens). La carga evaluada usa parámetros en FP32 con autocast BF16, lo que eleva los pesos a unos 16 GB.
- Entrenamiento: el autor reporta un pico de memoria GPU asignada de 73,91 GB, por lo que se requiere una GPU de 80 GB (A100 80 GB, H100 80 GB) o configuraciones con reparto de memoria.
- GPU recomendadas para entrenamiento: A100 80 GB o H100 80 GB. Para inferencia, cualquier GPU con al menos 16 GB en BF16.
- ¿Cabe en GPU de consumo?: sí, en BF16 cabe holgadamente en una RTX 4090 (24 GB) y en tarjetas de 16 GB; en FP32 el margen es más ajustado pero viable en 24 GB.
- Opciones de despliegue: transformers estándar con `AutoModelForSequenceClassification`; la ficha incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`. Al ser un clasificador de secuencias, encaja mejor en TGI o en el propio `ranker.py` que en motores de generación tipo vLLM/Ollama, que están orientados a decodificación de tokens.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de rankers de producto de instrumentos musicales públicos con los que comparar de forma directa. Como referencia de la familia base:

| Modelo | Parametros | Contexto | Tarea principal | Licencia |
|---|---|---|---|---|
| flavianv/qwen3-4b-musical-instruments-full-ranker | 4.022.470.656 | 2.048 tokens (serialización evaluada) | Ranking de productos de instrumentos musicales | apache-2.0 |
| Qwen/Qwen3-4B | ~4.000 millones | 32.768 nativo (más con YaRN) | Modelo base generativo | apache-2.0 |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.000 millones | 32.768 nativo (más con YaRN) | Modelo instructivo generativo | apache-2.0 |

La comparación de rendimiento no es posible porque este ranker se evalúa sobre una tarea de ranking específica del dominio y los Qwen3 base/instruct sobre benchmarks generativos. El ranker hereda el tamaño del backbone pero no sus capacidades generativas ni su ventana de contexto completa.

## Limitaciones y advertencias

- Resultado de validación, no de test intacto: el conjunto de test reservado (275 consultas) no se utilizó, y el mejor checkpoint se eligió maximizando la puntuación sobre validación, lo que introduce un sesgo optimista no corregido.
- No mide calidad de generación libre ni oráculo best-of-four; solo top-1 sobre pools construidos de cuatro candidatos.
- Entrada limitada a títulos: no puede distinguir productos con el mismo título pero ID diferente, según advierte el propio autor.
- Sin verificación de validez externa: el autor indica explícitamente que aún se requiere comprobación de validez externa antes de un uso en producción.
- Riesgo de sobreajuste al dominio: está entrenado exclusivamente con datos de instrumentos musicales y con un formato de serialización concreto; su comportamiento fuera de ese dominio no está evaluado.
- Idiomas: la model card no especifica idiomas soportados, por lo que no hay garantía de comportamiento consistente en castellano u otras lenguas distintas del inglés de los datos de entrenamiento.
- Transformación de puntuaciones: `sigmoid(raw/3)` es una transformación histórica opcional, no una probabilidad calibrada; no debe interpretarse como confianza.
- Sensibilidad numérica: la carga en BF16 puro puede alterar rankings cercanos a los empates, y el tamaño del lote puede provocar pequeñas variaciones numéricas.
- Licencia: apache-2.0, lo que permite uso comercial, pero el autor no ofrece garantías y recomienda revisar `ranker.py` y las dependencias antes de desplegar.
- Reproducibilidad: exige fijar la revisión (SHA del commit) al cargar, ya que el comportamiento puede variar entre revisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-full-ranker-20260923-v1
- Modelo base SFT: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923
- Repositorio del head-only ranker: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-id-overlap-ranker-20260923
- Dataset de entrenamiento y validación estricta: https://huggingface.co/datasets/flavianv/musical-instruments-id-overlap-reward-20260923-v1
- Informe comparativo (Markdown/PDF) y gráficas: https://github.com/clijo/reco-rl/tree/ad2b5f9/docs/experiments/full_ranker_20260923
- Backbone ancestro Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
