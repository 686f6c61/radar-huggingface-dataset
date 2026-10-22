# KridgeDookie/philadelphia-decider-4b

## Resumen

Philadelphia Decider 1.0 (4B) es un modelo de decisión de 4.205.751.296 parámetros publicado por el usuario KridgeDookie en Hugging Face. No es un modelo generativo al uso: recibe un estado (texto libre o JSON) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una distribución de probabilidad sobre las respuestas permitidas. Los tres tipos de pregunta soportados son `choice` (elegir una opción de una lista), `noul` (sí/no) y `score` (elegir un nivel). Nunca emite texto.

Es un fine-tune del modelo Mapika/decider-4b v2.1, que a su vez se construye sobre Qwen3.5-4B-Base. La arquitectura, el formato de prompt y la librería de inferencia son idénticos a los del modelo base; el autor declara dos objetivos concretos: mejorar la calibración de la confianza en decisiones difíciles y obtener ganancias pequeñas pero honestas de precisión en familias de decisiones poco familiares, sin degradar las capacidades generales del modelo original.

Su relevancia es acotada pero específica: encaja en la clase de modelos "System One" (decisión rápida, sin cadena de razonamiento explícita), útiles como enrutadores, clasificadores con confianza calibrada o jueces de respuestas dentro de pipelines más grandes. El modelo tiene 0 descargas y 0 likes en el momento de la ficha, no se ha publicado información sobre longitud de contexto y su única validación es la reportada por el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivada de Qwen3.5-4B-Base (tag `qwen3_5_text`); fine-tune del modelo de decisión Mapika/decider-4b v2.1 |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors en bf16. No hay GGUF ni cuantizaciones de 8 o 4 bits publicadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 8,4 GB) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura del modelo base (Qwen3.5-4B-Base vía decider-4b v2.1): un transformer decoder-only denso de unos 4,2 mil millones de parámetros. La innovación no está en el backbone, sino en la cabeza de decisión y en el protocolo de inferencia: se leen las probabilidades de las respuestas candidatas directamente de un solo forward pass, sin decodificación autoregresiva. El repositorio incluye un `decider_config.json` con temperaturas ajustadas por tipo de pregunta (choice 2,022; noul 2,457; score 1,663) que la librería `decider-ai` >= 1.4.0 aplica de forma automática.

El entrenamiento consistió en un adaptador LoRA de rango 16 (alpha 32) sobre las capas de atención y MLP, con tasa de aprendizaje 1e-4, sobre decider-4b v2.1. Los datos son aproximadamente 28.000 "mundos de decisión" verificados por código: cada respuesta se calcula con dos solvers independientes, sin intervención de ningún modelo generando etiquetas. Las familias cubiertas son reglas de trade-off y prioridad, evaluación de respuestas (response judging), razonamiento temporal y numérico (ítems sí/no y de nivel), suficiencia de información y ambigüedad, y búsquedas multi-hop entre secciones. Cada familia pasó una auditoría ciega de resolución, sondas de atajos (posición de la opción, orden de mención, dirección de las notas, patrones numéricos, bag-of-words) y un filtro de solapamiento de 8-gramas contra los ítems públicos de JevBench.

Como anclaje anti-olvido, el 40% de cada paso de entrenamiento empuja al modelo hacia las propias predicciones del modelo base congelado sobre 2.964 entradas sin etiqueta de familias que el adaptador no entrena; según el autor, sin este mecanismo un piloto perdía 3,8 puntos en familias no entrenadas y con él no perdió ninguno. El checkpoint final y la fuerza de mezcla (WiSE-FT al 25% del adaptador) se seleccionaron sobre conjuntos de práctica sintéticos reservados, con una regla fijada antes de ver los resultados. Las temperaturas se ajustaron por máxima verosimilitud negativa (NLL) sobre ese mismo conjunto de práctica. Ni JevBench, ni la muestra del Decision Index, ni los ítems del suite Bespoke se usaron para entrenamiento, selección ni ajuste de temperaturas.

## Capacidades

- Clasificación con opciones cerradas (`choice`): devuelve una distribución de probabilidad sobre un conjunto de opciones definido por el usuario, con criterios de decisión opcionales por opción.
- Decisión binaria (`noul`): responde sí/no con probabilidad calibrada.
- Puntuación por niveles (`score`): asigna un nivel de una escala definida en la consulta.
- Entrada estructurada o en lenguaje natural: acepta el estado como texto libre (por ejemplo, el cuerpo de un ticket) o como JSON.
- Múltiples preguntas por llamada: el ejemplo de la model card resuelve dos preguntas heterogéneas (una `choice` y una `noul`) sobre el mismo estado en una sola invocación.
- Confianza cuantificada: la salida es una probabilidad, no solo la etiqueta, lo que permite umbrales y escalado a revisión humana.
- Inferencia de un solo paso: sin generación de texto, sin cadena de razonamiento explícita, sin coste de decodificación autoregresiva.
- No documentado: soporte de tool calling o function calling, capacidades de agente multi-paso, visión, audio y modo "thinking". El pipeline declarado es `text-classification` y el modelo no genera lenguaje.
- Multilingüe: no; el modelo declara únicamente inglés.

## Casos de uso

- Triaje de tickets de soporte: el caso que ilustra la propia model card. Se pasa el texto del ticket junto con una pregunta `choice` sobre el equipo responsable (billing, shipping, other) y una pregunta `noul` sobre si el cliente pide reembolso; el modelo devuelve ambas distribuciones en un solo forward pass, lo que permite enrutar y etiquetar en la misma llamada.
- Enrutador previo a un LLM grande: al devolver probabilidades calibradas, se puede usar un umbral de confianza para decidir qué peticiones resuelve un modelo pequeño y barato y cuáles se escalan a un modelo mayor; el coste por decisión es una pasada de 4B en bf16.
- Evaluación automática de respuestas (response judging): el modelo fue entrenado explícitamente en la familia "response judging", por lo que puede puntuar o comparar respuestas generadas por otro sistema dentro de un pipeline de evaluación, con la ventaja de que la salida es una probabilidad y no una justificación en texto libre.
- Detección de ambigüedad y suficiencia de información: antes de lanzar un agente o una consulta a base de datos, preguntar al modelo si el estado contiene información suficiente para actuar; útil para disparar una petición de aclaración al usuario en lugar de alucinar una respuesta.
- Clasificación de riesgo o severidad con niveles: usando preguntas de tipo `score`, se puede mapear un informe, una reseña o un evento de seguridad a una escala ordinal (por ejemplo, baja, media, alta) con probabilidad asociada para priorizar colas.
- Verificación de reglas y políticas: las familias de trade-off y prioridad permiten comprobar si un caso cumple una política concreta (sí/no) o a qué categoría de excepción corresponde, con anclaje en criterios declarados en el prompt.
- Extracción multi-hop sobre documentación: consultas que requieren cruzar varias secciones de un documento o base de conocimiento para responder una pregunta cerrada, aprovechando la familia de lookups multi-hop del entrenamiento.
- Human-in-the-loop con umbral de confianza: al estar calibrado específicamente en ítems difíciles, sirve para separar decisiones automáticas de las que requieren revisión, controlando la tasa de error esperada por umbral.

## Benchmarks y rendimiento

Todos los datos proceden de la model card del autor y comparan con el modelo base (decider-4b v2.1) sobre los mismos ítems (evaluación pareada).

| Benchmark | Base (v2.1) | Philadelphia Decider 1.0 | Notas |
|---|---|---|---|
| JevBench público, 231 ítems: aciertos | 191 | 191 (release fusionado); 192 antes de la fusión | Ganó 2 ítems difíciles y perdió 2; un casi empate (top-p 0,54 frente a 0,49) se invirtió en la fusión BF16 |
| JevBench público, tier difícil: ECE (menor es mejor) | 0,183 (servido con temperaturas de v2.1) | 0,081 | El eje de calibración de JevBench se calcula sobre el tier difícil |
| Conjunto de práctica sintético reservado, 2.310 ítems | 70,95% | 71,34% (+0,39 pp, z 1,5) | Generadores y semillas nuevos, nunca usados en entrenamiento |
| Suite pública Bespoke, 12 subconjuntos etiquetados a mano | 78,27 | 78,27 (+0,06 pp agrupado) | Sin regresión |
| Muestra del Decision Index, 39 benchmarks, 4.621 preguntas | 62,30% | 62,14% (−0,16 pp, z −1,0) | Dentro del ruido; las pérdidas se concentran en matemáticas y ciencia |

Barrido de fuerza de mezcla reportado por el autor (mismo adaptador, distintas proporciones):

| Mezcla | JevBench público (aciertos) | Conjunto de práctica | Decision Index |
|---|---|---|---|
| 35% | 193 | +0,74 | −0,33 |
| 50% | 194 | +0,78 | −0,51 |

No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB en bf16 sobre una única GPU CUDA, según la model card. Los pesos en bf16 ocupan unos 8,4 GB, por lo que el margen es muy ajustado y en la práctica conviene contar con 10-12 GB para activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con 16 GB o más (RTX 4090, RTX 4080, RTX 4060 Ti de 16 GB, A100, H100, L40S). El modelo es deliberadamente pequeño para la clase de decisión, así que no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB y 24 GB con holgura. En tarjetas de 8 GB el encaje es dudoso y no está documentado; no se han publicado versiones cuantizadas que lo faciliten.
- Opciones de despliegue: la vía documentada es la librería `decider-ai` >= 1.4.0 (`pip install decider-ai`) con `Decider("KridgeDookie/philadelphia-decider-4b")`, un solo GPU CUDA en bf16. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y al no haber GGUF publicado sería necesaria una conversión propia. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face, pero no se detalla.
- Latencia y throughput: no disponibles. Al tratarse de un único forward pass de 4,2B parámetros sin decodificación autoregresiva, la latencia esperada por consulta es baja en términos relativos, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Philadelphia Decider 1.0 (este modelo) | 4,21B | No disponible | Decision model denso, fine-tune de decider-4b v2.1 | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Mapika/decider-4b v2.1 | ~4B | No disponible | Decision model denso sobre Qwen3.5-4B-Base | Apache-2.0 | Hugging Face; es el modelo base y el punto de comparación de todos los benchmarks |
| decider-2b (familia Mapika) | ~2B | No disponible | Decision model denso sobre Qwen3.5-2B-Base | no disponible en la información proporcionada | Hugging Face / GitHub del proyecto |
| decider-35b-A3B (familia Mapika) | 35B totales (MoE, activos no disponibles) | No disponible | Decision model MoE sobre Qwen3.5-35B-A3B-Base | no disponible en la información proporcionada | Hugging Face / GitHub del proyecto |
| Perplexity Decider Flash V1.2 4B | ~4B | No disponible | Decision model de otro laboratorio | no disponible | Listado en Vercel AI Gateway según la búsqueda web |

La comparación relevante es contra el propio modelo base: Philadelphia Decider no mejora la accuracy global de forma significativa, sino la calibración en el tier difícil de JevBench (ECE de 0,183 a 0,081). Frente a las variantes de 2B y 35B de la misma familia, la diferencia esperable es de coste y capacidad, pero no se dispone de cifras comparativas en la información proporcionada.

## Limitaciones y advertencias

- Ganancias de precisión pequeñas: en JevBench público el release empata con el modelo base (191 de 231). La mejora principal es de calibración en ítems difíciles, no de acierto.
- Regresión leve en conocimiento general: la muestra del Decision Index queda 0,16 pp por debajo del base (no significativa), con las pérdidas concentradas en matemáticas y ciencia (GSM8K, GPQA), áreas que este release no entrena.
- Compromiso de calibración: las temperaturas por tipo hacen que las preguntas muy fáciles queden ligeramente infraconfiadas. El ECE sobre todos los ítems de JevBench público es 0,094 frente a 0,080 del base servido, a cambio de mucha mejor calibración en el tier difícil.
- Evaluación sintética: los conjuntos de práctica están generados por los propios generadores del autor, por lo que estiman y no miden el rendimiento en benchmarks no vistos.
- Sesgo y alucinación: al no generar texto libre, el riesgo de alucinación de contenido no aplica de la misma forma, pero sí el de asignar alta probabilidad a una opción incorrecta. No se ha publicado ninguna evaluación de sesgos demográficos, sociales o de otro tipo.
- Idioma: solo inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que impide planificar casos con estados largos (documentos extensos, historiales de conversación).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (decider-4b, también Apache-2.0) y de Qwen3.5-4B-Base (Apache-2.0 según la model card).
- Adopción nula y sin validación externa: 0 descargas y 0 likes en el momento de la ficha; todos los números proceden del autor y no hay replicación independiente.
- Trazabilidad de los datos: los generadores de datos se escribieron con ayuda de asistentes de código (OpenAI Codex y Anthropic Claude), aunque los ejemplos de entrenamiento los produce ese código, no un modelo.
- Nombre: la model card no explica el apelativo "Philadelphia", que parece formar parte de una serie de publicaciones del mismo autor. No debe interpretarse como una afiliación institucional.
- Dependencia de la librería: el uso correcto de las temperaturas por tipo requiere `decider-ai` >= 1.4.0; con versiones anteriores o con un forward pass manual las probabilidades no estarán calibradas como se reporta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KridgeDookie/philadelphia-decider-4b
- Modelo base (Mapika/decider-4b): https://huggingface.co/Mapika/decider-4b
- Repositorio del proyecto decider (familia de modelos System One): https://github.com/Mapika/decider
- Modelo fundacional Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Artículo sobre el lanzamiento de Perplexity Decider v1.2 (contexto de la categoría, otro laboratorio): https://toolnavs.com/article/2658-perplexity-releases-decider-v12-a-27b-model-that-writes-no-answers-only-judgment
