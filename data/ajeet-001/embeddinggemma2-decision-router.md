# Ajeet-001/embeddinggemma2-decision-router

## Resumen

EmbeddingGemma2-decision-router es un modelo de decisión y enrutamiento ("System-One") construido por el usuario Ajeet-001 sobre el backbone multimodal `google/embeddinggemma-2`, que combina 270M de parámetros de texto, 300M de audio y 170M de visión (740M en total). Sobre ese backbone se añade una cabeza de decisión denominada `SetEquivariantDecisionHead`, un transformer de 2 capas con entrenamiento equivariante a permutaciones, junto con una compuerta desacoplada de cobertura (Null/OOS) que permite al modelo abstenerse cuando la consulta queda fuera de las categorías candidatas.

El modelo no genera texto: resuelve una tarea de selección entre un conjunto de opciones candidatas (intenciones, rutas, etiquetas) a partir de una entrada de texto, audio o imagen. Su propuesta diferencial es la combinación de tres propiedades: equivarianza exacta a permutaciones (el orden de las opciones no altera la distribución de probabilidad), calibración explícita de la abstención (AUROC de 99,34% en Null con gold descartado) y una latencia muy baja (34,70 ms por consulta en audio, 1,49x más rápido que una cascada con Whisper-tiny).

Es relevante para pipelines de agentes y sistemas de enrutamiento en producción porque ofrece una alternativa determinista y calibrada a usar un LLM generativo para clasificar intenciones o decidir rutas, con métricas publicadas en BANKING77, CLINC150+OOS, PolyAI/minds14 y una suite de visión propia. La licencia es Apache 2.0 y el repositorio ocupa 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `google/embeddinggemma-2` multimodal (270M texto + 300M audio + 170M visión) + `SetEquivariantDecisionHead` (transformer de 2 capas, sin codificaciones posicionales) + compuerta Null/OOS desacoplada |
| Parametros totales | 740M (270M texto + 300M audio + 170M visión) más la cabeza de decisión (tamaño no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repo incluye `decision_index_engine.py`, `encoder.py` y `decision_head.py`) |

## Arquitectura y entrenamiento

La arquitectura parte del backbone multimodal `google/embeddinggemma-2`, que aporta codificadores separados para texto (270M), audio (300M) y visión (170M). Sobre las representaciones de cada modalidad se aplica `SetEquivariantDecisionHead`, un transformer de 2 capas que opera sobre el conjunto de opciones candidatas y la consulta. La innovación clave es la ausencia total de codificaciones posicionales en las opciones candidatas, lo que garantiza equivarianza exacta a permutaciones: el modelo reporta un 0,0000% de flip rate, es decir, la distribución de probabilidad sobre las opciones es idéntica independientemente del orden en que se presenten.

El modelo incorpora además una compuerta desacoplada de cobertura (Decoupled Coverage Null/OOS Gate) que decide si la consulta pertenece al espacio de las opciones candidatas o debe abstenerse. El autor reporta 99,34% de AUROC en Null con gold descartado, 98,07% en negativos difíciles y 99,84% de AUROC en OOD entre dominios. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; el entrenamiento se orienta a clasificación y enrutamiento supervisado, no a generación.

## Capacidades

- Enrutamiento multimodal System-One: selecciona una opción entre un conjunto de candidatas a partir de texto, audio o imagen.
- Clasificación de intenciones en texto: 98,93% de accuracy en BANKING77 con K=8 y 0,46% de ECE; 92,81% de macro-F1 zero-shot en las 77 clases completas.
- Enrutamiento de intenciones habladas: 91,30% de accuracy en PolyAI/minds14 con 34,70 ms por consulta.
- Razonamiento visual para selección: 7,80 de Public Vision Index en la suite Vision 0.3 (12.210 filas), con 64,25% en Winoground, 53,88% en CV-Bench y 42,95% en RealWorldQA.
- Abstención calibrada: detección de consultas fuera de alcance (Null/OOS) con AUROC superior al 98% en los escenarios reportados.
- Equivarianza a permutaciones: distribución de probabilidad invariante al orden de las opciones (flip rate 0,0000%).
- Integración con el motor `decision-index`: implementa el contrato `Engine` mediante `EmbeddingGemma2Engine` (texto) y `EmbeddingGemma2VisionEngine` (visión).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni generación de texto libre.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: dado un mensaje de texto y un conjunto de K intenciones candidatas (por ejemplo, 8 categorías de BANKING77), el modelo devuelve la distribución calibrada y activa la abstención cuando la consulta no encaja; el 0,46% de ECE en K=8 lo hace adecuado para decidir umbrales de derivación a humano.
- Triaje de llamadas en centros de contacto: con el codificador de audio y 34,70 ms por consulta, se puede clasificar la intención de una locución directamente desde el audio sin cascada ASR + clasificador, reduciendo latencia y puntos de fallo frente a una cascada con Whisper-tiny.
- Router de agentes y herramientas: el modelo puede seleccionar qué herramienta, endpoint o subagente invocar entre un conjunto fijo de opciones, con la garantía de que el orden de presentación de las herramientas no altera la decisión, lo que simplifica el versionado y las pruebas.
- Filtro de alcance (guardrail) previo a un LLM generativo: usar la compuerta Null/OOS (99,84% de AUROC entre dominios) para descartar consultas fuera de dominio antes de invocar un modelo mayor, reduciendo coste y alucinaciones.
- Clasificación zero-shot de tickets con taxonomías amplias: con 92,81% de macro-F1 en las 77 clases de BANKING77 y 90,42% en CLINC150+OOS de 151 clases, sirve para etiquetar soporte técnico sin reentrenar por cada nueva categoría.
- Selección visual entre candidatos: para tareas de emparejamiento imagen-texto o elección entre descripciones, usando el motor de visión sobre Winoground y CV-Bench, por ejemplo en moderación de contenido o verificación de catálogo.
- Enrutamiento determinista en sistemas embebidos o de borde: el tamaño del repo (0,4 GB) y la latencia de decenas de milisegundos permiten desplegarlo en entornos con recursos limitados donde un LLM generativo no es viable.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| BANKING77 (K=8) | Accuracy | 98,93% |
| BANKING77 (K=8) | ECE | 0,46% |
| BANKING77 (77 clases, zero-shot) | Macro-F1 | 92,81% |
| CLINC150+OOS (151 clases) | Macro-F1 | 90,42% |
| PolyAI/minds14 (audio) | Accuracy de enrutamiento | 91,30% |
| PolyAI/minds14 (audio) | Latencia | 34,70 ms/consulta (1,49x más rápido que cascada Whisper-tiny) |
| Vision 0.3 Suite (12.210 filas) | Public Vision Index | 7,80 |
| Winoground | Accuracy | 64,25% |
| CV-Bench | Accuracy | 53,88% |
| RealWorldQA | Accuracy | 42,95% |
| Null (gold descartado) | AUROC | 99,34% |
| Null (negativos difíciles) | AUROC | 98,07% |
| OOD entre dominios | AUROC | 99,84% |
| Equivarianza a permutaciones | Flip rate | 0,0000% |

No se han publicado comparaciones directas con modelos de referencia en la información disponible más allá de la comparación de latencia con la cascada Whisper-tiny.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 740M de parámetros en el backbone y pesos en fp16, el modelo completo rondaría 1,5 GB, y en int8 aproximadamente 0,8 GB, sin contar la cabeza de decisión.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 4 GB o más de VRAM debería alojar el modelo en precisión reducida.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque no hay validación publicada.
- Opciones de despliegue: el repositorio incluye un motor propio (`decision_index_engine.py`) que implementa el contrato `Engine` de `apolinario/decision-index`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 34,70 ms por consulta en la tarea de audio según el autor; no se publican cifras de throughput ni latencia para texto o visión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma2-decision-router | 740M (multimodal) + cabeza | No disponible | Enrutamiento y decisión con abstención calibrada | Apache 2.0 | Hugging Face (Ajeet-001) |
| google/embeddinggemma-2 | 740M (270M texto + 300M audio + 170M visión) | No disponible | Embeddings multimodales | No disponible en la información | Hugging Face (Google) |
| Cascada Whisper-tiny + clasificador | Depende del clasificador | No disponible | ASR + clasificación de intención | Varía | Referencia de latencia citada por el autor |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre ni mantiene conversaciones; solo selecciona entre opciones candidatas predefinidas.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, lingüísticos o culturales; los benchmarks son de dominios acotados (banca, intenciones habladas, visión general).
- Riesgo de alucinación: bajo en el sentido generativo, pero la compuerta Null/OOS puede fallar y asignar una opción a una consulta fuera de alcance; el AUROC de 98,07% en negativos difíciles indica que existe margen de error.
- Idiomas: no se especifican los idiomas soportados; los benchmarks citados son mayoritariamente en inglés (BANKING77, CLINC150, minds14), por lo que el rendimiento en castellano no está validado.
- Contexto: no se publica la longitud máxima de contexto, lo que impide planificar su uso con documentos o conversaciones largas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `google/embeddinggemma-2` puede tener condiciones propias que conviene verificar antes de desplegar en producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes, sin validación independiente de las métricas reportadas; el código de inferencia depende del proyecto `apolinario/decision-index`.
- Visión: los resultados en RealWorldQA (42,95%) y CV-Bench (53,88%) son moderados, por lo que no es adecuado para tareas visuales de razonamiento complejo.

## Enlaces

- Hugging Face: https://huggingface.co/Ajeet-001/embeddinggemma2-decision-router
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Motor decision-index: https://github.com/apolinario/decision-index
- Dataset PolyAI/minds14: https://huggingface.co/datasets/PolyAI/minds14
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset CLINC150: https://huggingface.co/datasets/clinc/clinc_oos
