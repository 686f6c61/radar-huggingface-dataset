# pragmaticfrontier/jez-small-1.0.0

## Resumen

jez-small-1.0.0 es un modelo de decisión (no de generación de texto) desarrollado por pragmaticfrontier, obtenido mediante un fine-tune completo del checkpoint Qwen/Qwen3.5-0.8B. Su función es responder al contrato `/v1/systemone` de Jev: recibe un estado (por ejemplo, un mensaje de usuario) y un conjunto de preguntas declaradas con etiquetas de respuesta posibles, y devuelve la distribución de probabilidad sobre esas etiquetas leída directamente de los logits en la posición de respuesta. El modelo nunca emite texto libre; se comporta como un clasificador configurable en tiempo de inferencia.

El interés práctico está en esa combinación: un transformer decoder-only de 1.006.672.704 parámetros (~1,01 B) que, sin generar ni un token, ofrece clasificación con etiquetas arbitrarias, calibración por tipo de pregunta y latencias de decenas de milisegundos. El autor reporta mejoras muy grandes en tareas donde el ajuste enseña formato o dominio (BANKING77 +47,7 puntos, Belebele +10,7, SST-5 +7,3) y caídas significativas en otras donde el modelo base ya acertaba (BoolQ −2,7, ARC-Easy −2,3, IMDB −1,1).

Es relevante ahora porque propone un patrón distinto al del LLM generativo como enrutador: un modelo pequeño, con pesos en safetensors estándar y licencia Apache 2.0, pensado para el "sistema 1" rápido de pipelines de agentes, donde la decisión debe ser barata, calibrada y determinista en el formato. Conviene tener en cuenta que el autor no supera su propia puerta de aceptación de rendimiento (gate 2) en las particiones completas, y que el modelo no tiene aún validación independiente (0 descargas, 0 likes en el momento de la ficha).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`); fine-tune completo del checkpoint Qwen/Qwen3.5-0.8B |
| Parámetros totales | 1.006.672.704 (~1,01 B), según safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Entrenamiento hasta 4.096 tokens; servicio limitado a 64k tokens por petición y 32k por pregunta, sin soporte de cabecera de contexto largo; ventana nativa del checkpoint base: no disponible en la información |
| Tipos de cuantización | No disponible: el autor publica safetensors sin cuantizaciones (GGUF, AWQ, GPTQ) documentadas |
| Idiomas soportados | 12: en, de, fr, es, it, pt, ru, uk, ar, hi, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`), fine-tune fusionado; se incluye además el adaptador LoRA en formato PEFT en `adapter/` |
| Modelo base | Qwen/Qwen3.5-0.8B (Apache 2.0) |
| Tamaño del repositorio | 2,0 GB |
| Método de ajuste | Fine-tune completo (no LoRA en los pesos publicados) |
| Objetivo de entrenamiento | Entropía cruzada sobre la etiqueta dorada, calculada sobre los logits de las etiquetas en la posición de respuesta |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base: un transformer decoder-only de Qwen3.5 con ~1,01 B de parámetros, sin modificaciones estructurales. El autor no añade una cabeza nueva ni módulos personalizados: el modelo se sirve con `Qwen3_5ForCausalLM` sin código específico para cargarlo, y la decisión se extrae de los logits de siguiente token correspondientes a las etiquetas declaradas en la pregunta. Esto implica que el "clasificador" es, en la práctica, el propio modelo de lenguaje evaluado en una posición concreta de la secuencia, con las etiquetas como vocabulario restringido.

El entrenamiento usó 278.999 ejemplos procedentes de 20 fuentes (`reports/mix-v2-manifest.json`), con filtrado de solapamiento de 13 tokens y verificación de licencias por fuente documentada en el manifiesto. No hubo destilación ni modelo profesor: solo etiquetas doradas. El schedule fue coseno con 3 % de warm-up, una época (4.359 pasos de 64 secuencias), secuencias de hasta 4.096 tokens y learning rate 1e-5 elegido mediante un barrido de tres tasas (1e-5, 2e-5, 4e-5) sobre el 5 % de mix-v1 en la primera ronda. El checkpoint se seleccionó por mejor pérdida de validación en un split del 5 %: paso 3.800, con pérdida 0,3903 y accuracy 83,7 %. La calibración se ajustó sobre un split del 2 % y se publica en `calibration.json` con temperaturas por tipo de pregunta y por rango de número de opciones (noul 1,09; choice:2 0,74; choice:3-5 1,16; choice:6-26 1,08; choice:27-255 1,00; score:2 1,00; score:3-5 1,16; score:6-10 1,25).

## Capacidades

- Clasificación mediante etiquetas declaradas en la petición, con salida de probabilidades (no texto generado).
- Preguntas de tipo `noul` (sí/no), `choice` (2 a 255 opciones) y `score` (escalas de 2 a 10), cada una con su propia temperatura de calibración.
- Soporte de múltiples preguntas en una misma petición sobre un estado compartido (`questions` como objeto con nombre por pregunta).
- Capacidad multilingüe en 12 idiomas, con mejora reportada en Belebele de +5 a +15 puntos por idioma.
- Enrutado y clasificación de intenciones en dominios concretos (BANKING77 pasa de 12,4 % a 60,1 %).
- Detección de toxicidad medida como F1 (ToxicChat: 0,379 → 0,554).
- Clasificación de granularidad fina de sentimiento (SST-5: 25,2 % → 32,5 %).
- Comportamiento determinista en formato: la respuesta es siempre una distribución sobre las etiquetas declaradas, lo que facilita su uso como señal en pipelines.
- No soporta visión: los activos de imagen y las preguntas de tipo `box` devuelven 422.
- No soporta tool calling ni generación de texto; no es un modelo de agentes en el sentido habitual.
- No soporta la cabecera de contexto largo pese a aceptar peticiones de hasta 64k tokens.

## Casos de uso

- Enrutado de tickets de soporte: declarando etiquetas como `billing`, `technical`, `account` o `cancel`, el modelo devuelve una distribución calibrada por pregunta; el salto de +47,7 puntos en BANKING77 lo hace directamente utilizable como primer clasificador en una cola de atención al cliente, con umbral de derivación a humano cuando la probabilidad máxima es baja.
- Triaje multilingüe en atención al cliente europea: con 12 idiomas y una mejora de +5 a +15 puntos por idioma en Belebele, permite una única instancia que clasifique mensajes en español, alemán, francés, italiano, portugués, neerlandés… sin desplegar un modelo por mercado.
- Moderación de chat en tiempo real: usando una pregunta `noul` sobre toxicidad, el F1 de 0,554 permite una primera pasada de filtrado a latencia de decenas de milisegundos antes de recurrir a un modelo mayor o a revisión humana.
- Priorización de reseñas por sentimiento fino: una pregunta `score` de 5 niveles (SST-5 con 32,5 %) sirve para ordenar reseñas por intensidad negativa y alimentar paneles de calidad sin coste de un LLM generativo.
- Guardarraíl o señal auxiliar en agentes: el modelo puede evaluar el estado de una conversación con preguntas como "¿el usuario pide una acción destructiva?" y devolver una probabilidad; dado que el rendimiento en `prompt_injection` baja (49,1 % frente a 52,6 % del base), debe usarse como señal complementaria, no como único filtro.
- Umbralización con abstención: la calibración publicada (ECE agrupado de 0,023 en bruto y 0,038 calibrado) permite fijar umbrales con significado probabilístico y derivar los casos dudosos a un modelo mayor, reduciendo coste en el 70-80 % del tráfico fácil.
- Evaluación automatizada de respuestas: usar la probabilidad de la etiqueta "correcto/incorrecto" como filtro barato en un harness de evaluación o como recompensa auxiliar en un pipeline de RL, con la ventaja de que el modelo no genera texto y el coste por muestra es mínimo.
- Preclasificación en sistemas RAG: decidir con una pregunta `choice` si la consulta requiere recuperación, qué índice consultar o si es conversación trivial, antes de invocar el modelo generativo.

## Benchmarks y rendimiento

Tier 1, comparando el checkpoint base Qwen3.5-0.8B con la release (particiones completas, según la model card):

| Tarea | Base | jez-small-1.0.0 | Delta |
|---|---|---|---|
| SST-2 | 83,3 % | 81,3 % | −2,0 |
| IMDB | 89,2 % | 88,1 % | −1,1 |
| HellaSwag | 43,6 % | 46,9 % | +3,3 |
| ARC-Easy | 80,0 % | 77,7 % | −2,3 |
| ARC-Challenge | 59,8 % | 61,5 % | +1,7 |
| BoolQ | 74,8 % | 72,2 % | −2,6 |
| Belebele | 49,4 % | 60,1 % | +10,7 |
| AG News | 73,9 % | 73,5 % | −0,4 |
| Emotion | 54,9 % | 54,4 % | −0,5 |
| BANKING77 | 12,4 % | 60,1 % | +47,7 |
| ToxicChat (F1) | 0,379 | 0,554 | +0,175 |
| Prompt injection | 52,6 % | 49,1 % | −3,5 |
| SST-5 | 25,2 % | 32,5 % | +7,3 |

Los deltas están calculados a partir de la tabla de la model card; el análisis de significancia del autor cita BoolQ −2,7, ARC-Easy −2,3 e IMDB −1,1 como caídas significativas (bootstrap emparejado, intervalos al 95 %) y agrupa prompt injection (−3,4) y SST-2 (−1,9) dentro del ruido de sus particiones pequeñas. La media de Tier 1 es +4,9 puntos, con la peor tarea en −3,4.

Puertas de aceptación declaradas por el autor:

| Puerta | Resultado |
|---|---|
| 1. Suite de conformidad y ambos SDK | PASS (HTTP, SDK de Python, SDK de JavaScript) |
| 2. Media de Tier 1 +3 puntos sobre el base, sin tarea a −1 | FAIL: media +4,9, peor tarea −3,4 |
| 3. ECE agrupado de elección ≤ 0,05; ECE por tarea ≤ max(0,05, el de Jev) | PASS: 0,023 en bruto, 0,038 calibrado |
| 4. Estabilidad de orden ≥ 95 %; sin movimientos de probabilidad > 0,05 al reordenar | PASS: 98,5 % estable en AG News (n=200), movimiento máximo 0,151 |
| 5. Latencia p50/p99 dentro de los límites de Tier 4 | PASS en la máquina de medida: p50 58,3 ms, p99 61,5 ms (torch sobre CUDA) |

Latencia declarada:

| Máquina | Backend | p50 | p99 |
|---|---|---|---|
| DGX Spark (GB10) | torch sobre CUDA | 58,3 ms | 61,5 ms |

Los conjuntos de Tier 2 no están en el repositorio y no se publican resultados de Tier 2 ni Tier 3. No hay resultados de MMLU, HumanEval ni GSM8K en la información disponible, lo que es coherente con que el modelo no sea generativo.

## Requisitos de hardware

- Pesos en safetensors: el repositorio ocupa 2,0 GB, consistente con ~1,01 B de parámetros en precisión de 16 bits.
- VRAM estimada para inferencia: ~3-4 GB en bf16/fp16 contando activaciones y caché KV para secuencias cortas (estimación propia a partir del tamaño de pesos; el autor no publica cifra de VRAM).
- Cuantización: no hay ficheros GGUF, AWQ ni GPTQ publicados. Una cuantización a int8 rondaría 1,1 GB y a 4 bits unos 0,6 GB (estimación aritmética, no verificada).
- Cabe en GPU de consumo: sí, cualquier GPU con 4 GB o más debería alojar los pesos en 16 bits, y 2 GB o más con cuantización (estimación). Modelos como RTX 3060, RTX 4060 Ti, RTX 4090 o incluso GPUs de portátil con 6-8 GB son suficientes.
- GPU de referencia en la medición del autor: DGX Spark con GB10. Los objetivos de la puerta 5 son p50 ≤ 150 ms en un M1 Pro y ≤ 60 ms en una L4; el autor advierte explícitamente que la latencia está medida en DGX Spark y no en esos dos objetivos.
- Despliegue documentado: servidor propio `jez-serve`, con variables `JEZ_API_KEYS`, `JEZ_MODELS` y `JEZ_CALIBRATION`, exponiendo `/v1/systemone` en el puerto 8009. Los pesos son `Qwen3_5ForCausalLM` estándar y se cargan sin código personalizado con `transformers`.
- Otros backends: vLLM, llama.cpp, Ollama y TGI no están documentados por el autor. Aunque los pesos son un checkpoint estándar, la lógica de decisión (lectura de logits de etiquetas en la posición de respuesta y aplicación de `calibration.json`) requiere el servidor de Jez o una implementación equivalente; un servidor de generación genérico no reproduce el contrato.
- Throughput (peticiones por segundo) no disponible; solo se publican percentiles de latencia por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jez-small-1.0.0 | ~1,01 B | Entrenamiento 4.096 tokens; 64k/petición y 32k/pregunta en servicio | Decisión por logits de etiquetas sobre Qwen3.5-0.8B | Apache 2.0 | HuggingFace + servidor en GitHub |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B declarados; ~1,0 B en el checkpoint ajustado | No disponible en la información | Modelo de lenguaje generativo | Apache 2.0 | HuggingFace |
| Otros modelos de decisión comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra su propio base: jez-small mejora de forma notable en tareas de formato o dominio nuevo (BANKING77, Belebele, SST-5, ToxicChat) y empeora en tareas donde el base ya tenía buen rendimiento (BoolQ, ARC-Easy, IMDB, SST-2). No se han identificado en la información proporcionada otras alternativas de "modelo de decisión con etiquetas declaradas" con datos verificables para comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo texto: las preguntas sobre activos de imagen y las de tipo `box` devuelven error 422.
- Límites de servicio: 64k tokens por petición y 32k por pregunta; la cabecera de contexto largo no está soportada.
- No genera texto. Pese a que la pipeline figure como `text-generation`, no debe usarse para generación abierta, resúmenes ni chat libre; su salida es una distribución sobre etiquetas.
- La puerta de aceptación 2 no se cumple: hay caídas significativas frente al base en BoolQ (−2,7), ARC-Easy (−2,3) e IMDB (−1,1). El autor lo atribuye a que la entropía cruzada solo con etiquetas doradas desplaza al modelo de 0,8 B en casos que el base ya resolvía.
- La mejora no es uniforme: el patrón es "gana donde el mix enseña un formato o dominio, pierde donde el base ya sabía".
- Sensibilidad al orden de las opciones: la estabilidad medida es del 98,5 % en AG News con un movimiento máximo de probabilidad de 0,151, lo que implica que el orden de las etiquetas puede alterar decisiones en casos límite.
- La calibración depende de `calibration.json`: sin aplicar las temperaturas por tipo de pregunta y rango de opciones, las probabilidades no están calibradas (ECE 0,023 en bruto frente a 0,038 calibrado en el conjunto agrupado).
- Rendimiento en detección de prompt injection por debajo del base (49,1 % frente a 52,6 %): no debe usarse como único guardarraíl de seguridad.
- Riesgo de alucinación en sentido estricto: no aplica, al no generar texto; el riesgo equivalente es asignar alta confianza a una etiqueta incorrecta, mitigable con umbrales y abstención.
- Sesgos: el autor no documenta evaluación de sesgos demográficos ni de disparidad por idioma; no disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, sin garantías. Las licencias de las 20 fuentes de entrenamiento se verificaron según el manifiesto del autor, pero no son auditables desde la ficha.
- Latencia medida únicamente en una DGX Spark (GB10); no hay medición en M1 Pro ni en L4, que son los objetivos declarados.
- Modelo recién publicado (creado el 2026-10-19) con 0 descargas y 0 likes: sin validación externa ni reportes de terceros.
- Madurez del ecosistema: el contrato `/v1/systemone` y la lógica de lectura de logits son específicos del servidor de Jez; la portabilidad a otros stacks requiere trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pragmaticfrontier/jez-small-1.0.0
- Repositorio con servidor, harness de evaluación e informes: https://github.com/pragmaticfrontier/jez
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Informe de análisis de la puerta 2 en particiones completas: `reports/mixv2/gate2-full-split-analysis.md` (dentro del repositorio de GitHub)
- Manifiesto de datos de entrenamiento: `reports/mix-v2-manifest.json` (dentro del repositorio de GitHub)
- Instrucciones de los conjuntos de Tier 2: `eval/data/tier2/README.md` (dentro del repositorio de GitHub)
- Paper técnico: no disponible en la información proporcionada.
