# Saanora/clara-1

## Resumen

Clara (clara-1) es un modelo de decisión desarrollado por Saanora a partir de un fine-tune de h2oai/h2o-lightning-4b, que a su vez se basa en Qwen/Qwen3.5-4B. A diferencia de un modelo conversacional convencional, Clara no genera texto libre: recibe un registro (un ticket de soporte, una conversación de agente, una transacción, una factura) junto con las preguntas que el software necesita resolver, y responde cada pregunta con una distribución de probabilidad sobre las opciones definidas por el desarrollador, leída directamente de los logits de las etiquetas. Esto garantiza que la respuesta siempre pertenece al conjunto de opciones y que las probabilidades suman 1.

El problema que resuelve es la integración fiable de modelos de lenguaje en procesos de negocio estructurados: clasificación de tickets, enrutado de herramientas en agentes, calibración de decisiones. Al eliminar la generación de texto libre, el formato erróneo es imposible por construcción (0% de errores de formato según el autor), lo que lo hace especialmente adecuado para pipelines automatizados.

Soporta tres tipos de pregunta: `noul` (sí/no con probabilidad), `choice` (de 2 a 255 opciones con descripciones) y `score` (niveles ordenados con nivel esperado). Habla el formato abierto System One (`POST /v1/systemone`) y tiene unos 4.66 mil millones de parámetros en bf16, con un tamaño de repositorio de 9,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer con cabeza de lectura de etiquetas, label logits) |
| Parametros totales | 4.659.865.088 (≈4,66B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); FP8 (solo en la API alojada de Saanora) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo unico, verificado por SHA-256 contra `label_rows.lightning`) |

## Arquitectura y entrenamiento

Clara es un fine-tune de h2oai/h2o-lightning-4b, que a su vez es un fine-tune de Qwen/Qwen3.5-4B. Se trata de un transformer de la familia Qwen3.5 adaptado como "decision model": en lugar de decodificar texto autoregresivo, el modelo lee la respuesta desde los logits de tokens de etiqueta predefinidos, aplicando un softmax restringido sobre los grupos de etiquetas de cada pregunta. El repositorio incluye los ficheros de servicio de H2O sin modificar (`serve.sh`, `h2o_lightning_shim.py`, `pooled_readout.py`, `box.py`, `assets.py`, `serve_config.json`) junto con las filas de etiquetas registradas para estos pesos (`label_rows.lightning`).

Ofrece dos modos de lectura: **one-way** (atención causal ordinaria de izquierda a derecha, llamada "fast" en la API alojada) y **two-way** (atención bidireccional sobre todo el prompt, llamada "consistent", que es el modo por defecto del servidor y el más consistente). No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO; el autor indica únicamente que los benchmarks públicos usados en la evaluación no formaron parte del entrenamiento.

## Capacidades

- Clasificación zero-shot con probabilidades calibradas: responde preguntas `noul` (sí/no), `choice` (2 a 255 opciones con nombre y descripción) y `score` (niveles ordenados con nivel esperado).
- Enrutado de herramientas en agentes: decide la siguiente herramienta a invocar, si finalizar o si preguntar al usuario (evaluado en AgentDecisionBench).
- Salida estructurada garantizada: nunca escribe texto libre, por lo que el formato erróneo es imposible por construcción (0% de errores de formato).
- Respuesta de todas las preguntas de un registro en una sola petición (por ejemplo, tres preguntas en 144 ms de tiempo de modelo en la API alojada en modo fast).
- Compatibilidad con el formato abierto System One (`POST /v1/systemone`), lo que permite usar clientes como JevBench sin cambios.
- Despliegue local con servidor System One (modos one-way y two-way) o inferencia directa con transformers (one-way, una pregunta cada vez).
- No genera texto conversacional, no soporta tool calling convencional ni capacidades de visión o audio según la información disponible.

## Casos de uso

- **Triaje de tickets de soporte**: dado un ticket, el modelo devuelve en una petición la probabilidad de que haya un fallo activo (`noul`), el equipo asignado (`choice`) y la severidad del impacto (`score`), integrable directamente en un sistema de ticketing sin post-procesado.
- **Enrutado de herramientas en agentes**: en un bucle de agente, Clara puede decidir en cada estado qué herramienta invocar, si terminar o si pedir información al usuario, con un 92,1% de precisión en AgentDecisionBench.
- **Clasificación de transacciones o facturas**: la entrada tipo "registro" encaja con documentos financieros; las opciones de `choice` pueden definirse como categorías contables con descripciones cortas.
- **Moderación o filtrado automatizado**: preguntas sí/no con definiciones personalizadas de "sí" y "no" permiten decisiones binarias auditables con probabilidad asociada.
- **Scoring de severidad o prioridad**: el tipo `score` devuelve probabilidades por nivel y un nivel esperado, útil para colas de priorización en atención al cliente o operaciones.
- **Evaluación de calidad de conversaciones de agente**: como registro puede enviarse la conversación de un agente, Clara puede puntuar o clasificar la calidad de cada interacción en pipelines de QA automatizados.
- **Integración en benchmarks y harnesses compatibles con System One**: clientes como JevBench funcionan con el modelo sin modificaciones.

## Benchmarks y rendimiento

Resultados publicados por Saanora sobre benchmarks públicos que, según el autor, el modelo no usó en entrenamiento (octubre de 2026). Las filas de otros modelos corresponden a resultados publicados por cada benchmark.

**Tool routing, AgentDecisionBench** (3.939 estados de agente; métrica oficial: media por ocurrencias de cada tarea y luego por tareas):

| Modelo | Accuracy |
|---|---|
| AgentDecision-4B | 99,1% |
| StartLux-27B | 93,9% |
| OpenJev-27B | 92,4% |
| Clara, pesos publicados (one-way) | 92,1% |
| Clara, API alojada (fast mode) | 91,9% |
| Jev 1.13 | 91,5% |
| OpenAI Decisions API | 90,9% |

**Coherencia, JevBench-mini** (1.200 tests metamórficos; intervalos al 95%):

| Modelo | Overall |
|---|---|
| Open-Jev-9B (n.º 1 del leaderboard) | 83,9 [82,5–85,2] |
| Clara, pesos publicados, two-way | 83,6 [81–86] |
| Clara, API alojada, consistent (two-way) | 83,0 [80,6–85,5] |
| Clara, pesos publicados, one-way | 81,8 [79–84] |
| Clara, API alojada, fast (one-way) | 81,3 [78,7–83,8] |
| JevAny-Gemma-4B (n.º 2 del leaderboard) | 81,2 [79,0–83,2] |

**Comparativa con su modelo base** (mismo harness para ambos):

| Test | h2o-lightning-4b | Clara |
|---|---|---|
| Customer-service sí/no, held-out (n = 856) | 90,4% | 94,9% |
| JevBench-mini, two-way | 83,1 [81–85] | 83,6 [81–86] |
| AgentDecisionBench, one-way, por pregunta distinta | 87,4% | 93,6% |

**Velocidad**: 144 ms de tiempo de modelo para un registro con tres preguntas en la API alojada (modo fast). **Errores de formato**: 0% por construcción.

## Requisitos de hardware

- El autor indica que el servidor System One funciona en una GPU con **24 GB de VRAM o más** (pesos bf16, ~9,3 GB de repositorio).
- GPUs con 24 GB compatibles: RTX 3090, RTX 4090, RTX 5090 o equivalentes; para producción, A100 o H100 son opciones razonables, aunque no se han publicado requisitos oficiales más allá de los 24 GB.
- Dado que el modelo tiene ~4,66B de parámetros en bf16, cabe con holgura en GPUs consumer de 24 GB; no se ha publicado información sobre cuantizaciones adicionales (GGUF, AWQ, etc.) para hardware más modesto.
- Despliegue local: servidor System One incluido en el repositorio (`bash clara-1/serve.sh`, modo two-way por defecto; `TWO_WAY=0` para one-way), que requiere `vllm==0.30.0`. También es posible inferencia directa con `transformers>=5.14` mediante el script `examples/clara_readout.py` (one-way, una pregunta por pasada).
- Despliegue gestionado: API alojada en api.saanora.com con FP8, claves API, equipos, límites de gasto y logs; precio de $0,10 por 1M de tokens de entrada y $0 por salida, con $0,20 de crédito al registrarse.
- Latencia: 144 ms de tiempo de modelo por registro con tres preguntas (API alojada, modo fast); no hay datos de throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Resultado destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clara (clara-1) | ≈4,66B | Decision model (System One) | 92,1% AgentDecisionBench; 83,6 JevBench-mini two-way | Apache 2.0 | Pesos abiertos en Hugging Face; API alojada |
| h2o-lightning-4b (base) | no disponible | Modelo base fine-tune de Qwen3.5-4B | 87,4% AgentDecisionBench (one-way, por pregunta) | no disponible | Pesos abiertos en Hugging Face |
| AgentDecision-4B | no disponible | Tool routing | 99,1% AgentDecisionBench | no disponible | no disponible |
| Open-Jev-9B | no disponible | Coherencia (JevBench) | 83,9 JevBench-mini (n.º 1) | no disponible | no disponible |
| JevAny-Gemma-4B | no disponible | Coherencia (JevBench) | 81,2 JevBench-mini (n.º 2) | no disponible | no disponible |

Clara queda por detrás de AgentDecision-4B en tool routing (92,1% frente a 99,1%), pero supera a modelos mucho mayores como StartLux-27B y OpenJev-27B en esa tarea, y compite de cerca con Open-Jev-9B en coherencia pese a tener menos de la mitad de parámetros (según los nombres; los tamaños exactos de los competidores no están disponibles).

## Limitaciones y advertencias

- Solo soporta inglés de forma declarada; no hay información sobre rendimiento en otros idiomas, incluido el castellano.
- No genera texto libre: si el caso de uso requiere redacción (respuestas al cliente, resúmenes), Clara no es la herramienta adecuada; solo produce probabilidades sobre opciones predefinidas.
- Los benchmarks fueron medidos por el propio Saanora, no por un tercero independiente; las filas comparativas provienen de resultados publicados por cada benchmark y pueden no ser estrictamente comparables entre sí.
- El servidor verifica por SHA-256 que `label_rows.lightning` corresponde al `model.safetensors` adjunto, por lo que los pesos se distribuyen como un único archivo; mezclar ficheros de otros modelos puede no funcionar.
- La lectura two-way requiere el servidor System One incluido; con transformers puro solo está disponible el modo one-way, una pregunta cada vez, lo que puede afectar a la consistencia de resultados.
- La API alojada sirve pesos en FP8, cuyos resultados difieren ligeramente de los pesos bf16 publicados aquí (por ejemplo, 91,9% frente a 92,1% en AgentDecisionBench).
- No hay información publicada sobre sesgos conocidos, tasa de alucinación (concepto no aplicable directamente al no generar texto libre), longitud máxima de contexto ni evaluaciones de seguridad.
- Al ser un modelo muy reciente y con pocas descargas (22 en el momento de los datos), tiene escasa validación comunitaria.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas; el autor declara no estar afiliado a H2O.ai, al equipo de Qwen ni a los creadores de Jev.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saanora/clara-1
- Modelo base: https://huggingface.co/h2oai/h2o-lightning-4b
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset AgentDecisionBench: https://huggingface.co/datasets/JevAgentHarness/AgentDecisionBench
- JevBench: https://jevbench.github.io
- Saanora (desarrollador): https://saanora.com
- API alojada de Saanora: https://api.saanora.com
