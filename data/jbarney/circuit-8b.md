# jbarney/circuit-8b

## Resumen

circuit-8b es un adaptador LoRA con cabeza de lectura sobre Qwen/Qwen3-8B-Base, publicado por el usuario jbarney, que implementa un modelo de decisión de "Sistema Uno": recibe preguntas tipadas y devuelve distribuciones de probabilidad calibradas en una sola pasada, sin generar texto. No es un modelo generativo, sino un clasificador de opciones: cada opción se envuelve en tokens delimitadores, la secuencia termina en un token `decide` y la cabeza puntúa el delimitador de cierre de cada opción contra ese token `decide`, aplicando después softmax. Las probabilidades resultantes son la respuesta y se entrenan con entropía cruzada contra etiquetas de resultado, de modo que la calibración se aprende en lugar de derivarse a posteriori.

El modelo se presenta como el backend abierto de mayor tamaño para decision-circuits (decisioncircuits.com), hablando el contrato `POST /v1/systemone` de TypeSafe, y tiene una variante pequeña, circuit-1.7b. Está pensado para enrutamiento y decisión con umbrales de confianza dentro de circuitos de decisión, no para generación libre ni para conversación. Su relevancia actual radica en que ofrece calibración medida (ECE) junto a la exactitud, algo poco habitual en modelos abiertos de este tamaño, y en que se entrena únicamente con datos de licencia permisiva y sin salidas de modelos maestros.

La arquitectura subyacente es un transformer denso (Qwen3-8B-Base) congelado, sobre el que se añaden 43,7M de parámetros LoRA (rango 16, alpha 32) y una cabeza pointer de dos proyecciones lineales de 4096x256. El entrenamiento usó 16.738 ejemplos, una época y secuencias de hasta 1.024 tokens, y se completó en 75 minutos en una única RTX A6000. El modelo es solo para inglés y su licencia (adaptador y cabeza) es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B-Base) congelado + adaptador LoRA + cabeza pointer de dos proyecciones lineales 4096x256 |
| Parametros totales | ~8.000M del modelo base + 43,7M del adaptador LoRA + ~4,2M de la cabeza pointer (dos mapas 4096x256) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud maxima de secuencia durante el entrenamiento); la model card no especifica la ventana de inferencia |
| Tipos de cuantizacion | bf16 nativo; 4-bit bitsandbytes NF4 mediante `"load_4bit": true` en `config.json`. No se mencionan GGUF ni otras cuantizaciones |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (adaptador y cabeza); modelo base Qwen3 bajo licencia Qwen (Apache 2.0 para Qwen3) |
| Formato de pesos | PEFT LoRA en safetensors (`adapter/`), cabeza en PyTorch (`head.pt`, claves `q.weight`, `k.weight`) y `config.json` |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | text-classification |
| Modelo base | Qwen/Qwen3-8B-Base (relacion: adapter) |
| Libreria | peft |

## Arquitectura y entrenamiento

circuit-8b no genera texto: es un cabezal de clasificación sobre un transformer denso congelado. La petición empaqueta un estado y una pregunta, cada opción se envuelve en tokens delimitadores y la secuencia termina con un token `decide`. La cabeza pointer puntúa el delimitador de cierre de cada opción contra el token `decide` y aplica softmax para obtener la distribución sobre opciones. Se entrenan dos componentes: un adaptador LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones de atención y MLP (43,7M parámetros) y la cabeza pointer (dos mapas lineales de 4096x256). El modelo base permanece congelado.

El conjunto de entrenamiento tiene 16.738 elementos, la misma mezcla que circuit-1.7b, y todas las etiquetas están calculadas por código o por humanos, sin salidas de modelos maestros, con fuentes de licencia permisiva (CC BY / CC0 / MIT / Apache). Se compone de: la rejilla de generalización (8.100 elementos más 838 elementos ambiguos sobremuestreados con etiquetas suaves de 0,5), un subconjunto comercialmente seguro de tareas públicas de clasificación (2.100) y datos reales con licencia CC (MNLI, civil_comments, sms_spam, CLINC; 5.700). El entrenamiento fue de 1 época, batch 4, máximo 1.024 tokens, learning rate 1e-4 para LoRA y 1e-3 para la cabeza, bf16 con gradient checkpointing, entropía cruzada con objetivos suaves y parada temprana sobre el ECE de validación (mejor punto en el paso 2.800: ECE 0,014, exactitud 92,8%). Coste total: 75 minutos en una RTX A6000.

La innovación destacable es el diseño de calibración: al entrenar con objetivos suaves y seleccionar el checkpoint por ECE en validación, las probabilidades de salida están calibradas por construcción. Existe también un mecanismo de *gate* con bandas de incertidumbre en la librería cliente (por ejemplo, `on_uncertain="escalate"`), que permite derivar a un humano los casos en la banda. El código de entrenamiento, los generadores de datos y el arnés de evaluación están publicados en github.com/Barneyjm/circuit.

## Capacidades

- Clasificación de opciones múltiples con salida de distribuciones de probabilidad calibradas (no texto generado), en una sola pasada hacia delante.
- Inferencia de implicación textual y relaciones entre frases (entrenado con MultiNLI y SNLI), útil para validación de afirmaciones.
- Detección de spam en SMS con calibración medida (98% de exactitud, ECE 0,02).
- Moderación de toxicidad sobre google/civil_comments (93% de exactitud, ECE 0,14).
- Clasificación de intenciones en 151 clases (CLINC OOS) con 95% de exactitud y ECE 0,03, sin el límite de 26 opciones de algunos competidores.
- Clasificación de dominio y temas sobre DBpedia-14, banking77, Massive, BoolQ y PAWS (presentes en la mezcla de datos).
- Generalización sobre operaciones y formatos: la rejilla de generalización (9 operaciones x 6 formatos, etiquetada por código) alcanza 98% en elementos retenidos con la misma estructura de entrenamiento; con la receta de 1.7B, una operación y un formato retenidos dan 91% en el formato no visto y 57% en la operación no vista.
- Integración con el contrato TypeSafe `POST /v1/systemone` y con la librería `decision_circuits` (Circuit, Q, argmax, gates con umbral y escalado a humano).
- No soporta tool calling, agentes, multi-step reasoning generativo, visión, audio ni modo *thinking*: no genera texto en absoluto.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el circuito declara una pregunta de elección (`Which team?` con opciones `billing`, `technical`, `other`), el modelo devuelve la distribución sobre equipos y un gate con `min_confidence=0.35` deriva a cola humana los casos por debajo del umbral. La calibración medida (ECE 0,03-0,04 en tareas de producción) es lo que hace fiable ese umbral.
- Redacción de datos personales antes de persistir texto: una pregunta `noul("pii", ...)` puntúa la presencia de información personal y un gate `>= 0.7` dispara la redacción, con `on_uncertain="escalate"` para la banda intermedia. El entrenamiento incluye datos de dominios reales con licencia permisiva, lo que reduce el riesgo legal del pipeline.
- Moderación de contenido en plataformas: clasificación de toxicidad sobre comentarios con 93% de exactitud y ECE 0,14, más adecuada para priorizar una cola de revisión que para borrado automático, dado que la confianza en entradas indecidibles no es fiable.
- Filtrado de spam y fraude en mensajería: 98% de exactitud y ECE 0,02 en SMS spam, lo que permite fijar umbrales agresivos sin disparar falsos positivos con la misma frecuencia que un clasificador sin calibrar.
- Clasificación de intenciones para asistentes conversacionales y *chatbots*: soporta 151 clases (CLINC OOS) frente al límite de 26 opciones de Bespoke-Nimble-9B, con lo que cubre taxonomías de intención amplias en una sola llamada.
- Validación de afirmaciones en pipelines RAG: uso de las capacidades de NLI (entrenado con MultiNLI y SNLI) para comprobar si un pasaje recuperado implica una afirmación generada, devolviendo una probabilidad calibrada que puede alimentar un gate de aceptación/rechazo.
- Etiquetado a escala y *active learning*: al devolver distribuciones calibradas en lugar de etiquetas duras, permite seleccionar para revisión humana los elementos con mayor entropía, reduciendo el coste de anotación en corpus de clasificación.
- Triaje de llamadas en servicios esenciales: el modelo rinde en un conjunto externo de 100 llamadas a una empresa de agua con 11 clases (93% de exactitud, ECE 0,05), un escenario representativo de centros de contacto con taxonomías cerradas.

## Benchmarks y rendimiento

Los datos de la model card usan los mismos elementos para todos los modelos, etiquetas humanas y ECE con 15 bins.

Evaluación en frío (1.200 elementos):

| Modelo | MultiNLI | SMS spam | Civil toxicity | CLINC 151-way |
|---|---|---|---|---|
| Jev (TypeSafe, API) | 88% / 0,04 | 96% / 0,05 | 82% / 0,06 | 90% / 0,05 |
| Bespoke-Nimble-9B | 84% / 0,09 | 91% / 0,06 | 86% / 0,08 | no soportado (limite de 26 opciones) |
| kev-0.5b | 46% / 0,28 | 50% / 0,30 | 62% / 0,16 | 62% / 0,17 |
| circuit-1.7b | 81% / 0,09 | 98% / 0,02 | 90% / 0,16 | 86% / 0,06 |
| circuit-8b | 86% / 0,08 | 98% / 0,02 | 93% / 0,14 | 95% / 0,03 |

Fuera de distribución:

| Prueba | Jev | Nimble-9B | kev-0.5b | circuit-1.7b | circuit-8b |
|---|---|---|---|---|---|
| 100 llamadas de empresa de agua, 11 clases (Barney 2025) | 98% / 0,02 | 93% / 0,05 | 80% / 0,13 | 92% / 0,08 | 93% / 0,05 |
| Rejilla de generalizacion, 9 operaciones x 6 formatos, etiquetada por codigo | 95% | 85% | 48% | 97%* | 98%* |
| ClassicMiniDIY typesafe-bench, 546 preguntas de produccion (acuerdo con Jev / ECE) | 1,0 por definicion | 0,84 / 0,05 | 0,49 / 0,11 | 0,70 / 0,05 | 0,84 / 0,04 |

\* El generador de la rejilla es propio del autor, por lo que son elementos retenidos, no estructura retenida. Con la receta de 1.7B, retirando una operación y un formato se obtiene 91% en el formato no visto y 57% en la operación no vista: los formatos transfieren, pero los tipos nuevos de juicio deben estar en los datos de entrenamiento.

Validación interna durante el entrenamiento: mejor checkpoint en el paso 2.800 con ECE 0,014 y exactitud 92,8%.

## Requisitos de hardware

- VRAM en bf16: el modelo base necesita aproximadamente 17 GB, más el adaptador (43,7M parámetros) y la cabeza (4,2M parámetros). En la práctica requiere una GPU de 24 GB o más para tener margen de activaciones y batch.
- VRAM en 4-bit NF4: activando `"load_4bit": true` (bitsandbytes NF4) en `config.json`, el modelo cabe en una tarjeta de 12 GB.
- GPU recomendadas: RTX A6000 (48 GB) es la referencia medida por el autor; también encajan A100 40/80 GB, H100, L40S y, con 4-bit, RTX 3060 12 GB, RTX 4070 Ti 12 GB o RTX 4080 16 GB.
- Cabe en GPU de consumo: sí, en bf16 a partir de 24 GB (RTX 3090, RTX 4090) y en 4-bit desde 12 GB.
- Opciones de despliegue: el camino documentado es `S1_MODEL=lora:runs/circuit-8b uv run python -m s1proto` del repositorio github.com/Barneyjm/circuit (servidor en el puerto 8901), consumido por clientes `decision_circuits.backends.SystemOne`. También es cargable como adaptador PEFT sobre transformers. No hay GGUF publicado, por lo que llama.cpp y Ollama no están soportados de serie; no se documenta soporte de vLLM ni TGI.
- Latencia y throughput medidos en una RTX A6000 (48 GB), bf16, batch 8: 72 ms por elemento de la rejilla, aproximadamente 2.100 tokens de entrada por segundo. En las 546 preguntas de producción (estados más largos): 198 ms por elemento.
- Coste de entrenamiento de referencia: 75 minutos en una única RTX A6000 para 1 época sobre 16.738 elementos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / opciones | Rendimiento (MultiNLI / SMS / toxicidad / CLINC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| circuit-8b | 8B base + 43,7M LoRA + 4,2M cabeza | 1.024 tokens de entrenamiento; sin limite de opciones documentado | 86% / 0,08 - 98% / 0,02 - 93% / 0,14 - 95% / 0,03 | Apache 2.0 (adaptador y cabeza) | Pesos abiertos en HuggingFace (0,2 GB) |
| circuit-1.7b | 1,7B (familia) | no disponible; sin limite de opciones documentado | 81% / 0,09 - 98% / 0,02 - 90% / 0,16 - 86% / 0,06 | no disponible | Pesos abiertos en HuggingFace |
| Jev (TypeSafe) | no disponible | no disponible; sin limite de opciones documentado | 88% / 0,04 - 96% / 0,05 - 82% / 0,06 - 90% / 0,05 | propietaria (servicio API) | Solo API; sin pesos |
| Bespoke-Nimble-9B | 9B (familia) | limite de 26 opciones | 84% / 0,09 - 91% / 0,06 - 86% / 0,08 - no soporta CLINC 151 | no disponible | no disponible |
| kev-0.5b | 0,5B (familia) | no disponible | 46% / 0,28 - 50% / 0,30 - 62% / 0,16 - 62% / 0,17 | no disponible | no disponible |

Frente a circuit-1.7b, la versión de 8B mejora la exactitud en MultiNLI (+5 puntos), toxicidad (+3), CLINC 151 vías (+9) y el acuerdo con Jev en producción (0,70 a 0,84), con ECE comparable o mejor en la mayoría de tareas. Frente a Jev (API propietaria) iguala o supera en SMS spam, toxicidad y CLINC, y queda por detrás en MultiNLI (86% frente a 88%) pero con peor calibración (0,08 frente a 0,04). La ventaja principal frente a Jev es la disponibilidad de pesos y la licencia Apache 2.0.

## Limitaciones y advertencias

- No es un sistema de producción para decisiones que afecten a personas; el propio autor lo limita a investigación, evaluación y uso como backend local de decision circuits.
- Solo inglés. No hay soporte multilingüe declarado ni datos de entrenamiento en otros idiomas.
- Calibración sobre ambigüedad no resuelta: en entradas construidas para ser indecidibles, la confianza media se sitúa entre 0,5 y 0,85 cuando debería estar cerca de 0. Es una debilidad compartida con todos los modelos comparados, incluido Jev. La recomendación es definir una banda de incertidumbre y derivar esa banda a un humano.
- Solapamiento entre entrenamiento y evaluación: las particiones de entrenamiento de las cuatro tareas de la evaluación en frío forman parte de la mezcla de entrenamiento de este modelo, por lo que esas cifras no son estrictamente fuera de distribución (a diferencia de las de Jev, presumiblemente).
- Generalización estructural limitada: retirando una operación del entrenamiento, el rendimiento cae al 57%. Los formatos transfieren, pero los tipos nuevos de juicio deben aparecer en los datos de entrenamiento.
- Dependencia del modelo base: el repositorio contiene únicamente el adaptador LoRA y la cabeza pointer (0,2 GB), no pesos completos. Es necesario descargar Qwen/Qwen3-8B-Base por separado.
- Sin capacidades generativas: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier flujo que requiera explicaciones o texto libre necesita otro modelo.
- Restricciones de licencia: adaptador y cabeza son Apache 2.0 y el modelo base Qwen3 también, lo que permite uso comercial, pero conviene verificar la licencia del modelo base en su versión concreta y la procedencia de los datos si se redistribuye.
- Los datos de entrenamiento se declaran sin salidas de modelos maestros y con fuentes permisivas (CC BY / CC0 / MIT / Apache), lo que reduce el riesgo legal, pero no se detalla el filtrado de sesgos más allá de la composición de la mezcla.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de sobreconfianza mal calibrada en dominios alejados de la distribución de entrenamiento.
- Los números de rendimiento proceden de la model card del autor; no hay evaluación independiente publicada en la información disponible.
- El repositorio no tiene descargas ni "likes" en el momento de la consulta, por lo que no hay validación de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbarney/circuit-8b
- Modelo pequeno de la familia: https://huggingface.co/jbarney/circuit-1.7b
- Repositorio de codigo, datos y evaluacion: https://github.com/Barneyjm/circuit
- decision-circuits: https://decisioncircuits.com
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- La busqueda web realizada no devolvio resultados relevantes adicionales (unicamente resultados no relacionados de un portal checo).
