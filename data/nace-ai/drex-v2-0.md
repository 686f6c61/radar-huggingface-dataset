# nace-ai/drex-v2.0

## Resumen

Drex v2.0 es un modelo de decisión desarrollado por Nace.AI: no genera texto, sino que recibe un contexto (`state`) junto con una o varias preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Está construido sobre el backbone Qwen3.6-35B-A3B, un mixture of experts de 35.107.181.936 parámetros totales con unos 3B activos por token, al que se le añade una cabeza pointer (Kev, `head.pt`) que convierte la representación interna en probabilidades. Solo se utiliza la torre de lenguaje del modelo base: la torre de visión se descarta en la carga.

El modelo se posiciona como la alternativa de mayor tamaño de la familia Drex, sucediendo a Drex v1.5 (9B), y compite frontalmente con Jev 1.13.0 en la categoría de modelos de decisión dedicados. Según la model card, obtiene 61,25 en el índice público Decision Index 0.3.1 (frente a 58,08 de Drex v1.5 y 57,96 de Jev 1.13.0), gana a Jev en la arena de ocho juegos con un 60,9% y alcanza un AUC de 0,984 en clasificación de correo.

La relevancia práctica está en que sustituye a un LLM generativo en el punto concreto del pipeline donde hace falta una decisión discreta y una probabilidad explotable por umbrales: enrutado, clasificación, ranking de opciones o selección de herramientas. Se distribuye en safetensors bf16 (~70 GB) y GGUF Q8_0 (~37 GB), y requiere un fork propio de llama.cpp o de Ollama para ejecutarse fuera del servidor Python de referencia. La licencia es Nace.AI Open RAIL-M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of experts `Qwen3_5MoeForConditionalGeneration` (40 capas, 256 expertos, 8 activos por token) con cabeza pointer Kev; solo se usa la torre de lenguaje, la torre de visión se descarta en la carga |
| Parámetros totales | 35.107.181.936 (aproximadamente 35B) |
| Parámetros activos | Aproximadamente 3B por token |
| Longitud de contexto | 16.384 tokens por defecto por petición; ampliable a 131.072 mediante `KEV_CONTEXT` |
| Tipos de cuantización | bf16 (safetensors) y Q8_0 (GGUF); otros formatos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | `nace-ai-open-rail-m` (Nace.AI Open RAIL-M, variante de Open RAIL-M con restricciones de uso) |
| Formato de pesos | safetensors (bf16, ~70 GB), GGUF Q8_0 (~37 GB) y `head.pt` (cabeza pointer) |

Otros datos: repositorio de 70,2 GB, 142 descargas y 14 likes en el momento de la consulta; modelo base `Qwen/Qwen3.6-35B-A3B`; pipeline de HuggingFace no disponible.

## Arquitectura y entrenamiento

El backbone es un transformer con mezcla de expertos de tipo `Qwen3_5MoeForConditionalGeneration`: 40 capas, 256 expertos en total y 8 expertos activos por token, lo que da 35B parámetros almacenados pero solo unos 3B de cómputo activo por token. Sobre la representación del backbone se monta una cabeza pointer (denominada Kev, en el fichero `head.pt`) que transforma la salida del modelo en una distribución de probabilidad sobre las opciones de cada pregunta. Cada pregunta se puntúa en un forward pass independiente sobre el estado más esa pregunta, y el resultado se agrega como probabilidades por opción. Al no haber generación, los parámetros de muestreo de `generation_config.json` no aplican.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor describe el modelo con la etiqueta `system-one`, en contraposición a los modelos de razonamiento multi-paso, y con etiquetas `typed-decisions`, `calibrated-probabilities` y `zero-shot`, lo que indica que el entrenamiento se orientó a producir probabilidades calibradas sobre decisiones tipadas (elección múltiple, sí/no y escalas ordinales) en lugar de texto libre. Tampoco se publica información sobre la composición del corpus de ajuste ni sobre el proceso de calibración más allá de los resultados reportados en Decision Index, JevBench, DecideBench y clasificación de correo.

## Capacidades

- Decisión tipada sobre un contexto: recibe un `state` y una o más preguntas con nombre y devuelve una probabilidad por opción en un solo forward pass.
- Soporte de formatos de pregunta de elección múltiple, sí/no y escalas ordinales (en JevBench la métrica para elección es la opción top, para sí/no un umbral de 0,5 y para ordinal el nivel superior).
- Probabilidades calibradas, aptas para umbrales operativos y para comparar opciones dentro de la misma petición.
- Clasificación zero-shot y few-shot: los resultados de DecideBench incluyen ambas configuraciones (96,3% y 96,5% de accuracy respectivamente).
- Clasificación de correo con AUC de 0,984 y 89,4% de recall a un 5% de falsos positivos sobre direcciones no vistas en entrenamiento.
- Capacidad de selección en el área de herramientas (76,5 en Decision Index 0.3.1), lo que permite elegir entre opciones de acción o utilidades disponibles.
- Evaluación de relevancia en recuperación (63,0 en el área de Retrieval del mismo índice).
- Juego y decisión secuencial: puntuación del 60,9% frente a Jev en una arena de ocho juegos OpenSpiel (32 partidas por juego).
- No soporta generación de texto, visión, audio ni razonamiento multi-paso explícito: la torre de visión se elimina en la carga y la salida es exclusivamente probabilística.

## Casos de uso

- Triaje y priorización de correo: el modelo puntúa correos con AUC de 0,984 y detecta el 89,4% de los casos positivos con un 5% de falsos positivos, de modo que puede colocarse delante de una bandeja de entrada o de un sistema de seguridad y usar el umbral para decidir qué se revisa primero.
- Enrutado de tickets de soporte: se pasa el texto del ticket como `state` y una pregunta de elección múltiple con las colas disponibles; la probabilidad por cola permite enrutar por argmax o derivar a un humano cuando la confianza máxima queda por debajo de un umbral configurable.
- Selección de herramientas en agentes: con 76,5 en el área de Tools de Decision Index 0.3.1, el modelo puede decidir qué herramienta o acción invocar entre un conjunto enumerado, sustituyendo una llamada generativa por una llamada de clasificación más barata y determinista.
- Reordenación de resultados en un pipeline RAG: dada una consulta y un fragmento, el modelo devuelve la probabilidad de que el fragmento sea relevante; esa puntuación se usa para reordenar los candidatos antes de pasarlos al modelo generador.
- Moderación y cumplimiento de políticas: las decisiones tipadas con probabilidad calibrada permiten fijar políticas de escalado distintas según el coste del falso positivo, en lugar de depender de la salida en texto libre de un LLM.
- Recomendación y ranking de opciones: dado un contexto de usuario y una lista de candidatos, se obtiene una probabilidad por candidato en un solo forward pass, útil para ordenar catálogos o decidir la siguiente mejor acción en un flujo de producto.
- Decisión en agentes que juegan: la arena de ocho juegos OpenSpiel (chess, checkers, Reversi, Lines of Action, Nine Men's Morris, entre otros) demuestra que el modelo puede seleccionar jugadas legales dentro de un bucle de búsqueda o de política.
- Aprobación de solicitudes con umbral económico: al devolver probabilidad calibrada en lugar de texto, la salida es directamente consumible por un motor de reglas que aprueba, rechaza o escala según el coste esperado del error.

## Benchmarks y rendimiento

Decision Index 0.3.1 (solo suite pública, 37 benchmarks en cinco áreas; las columnas de área son skill corregida por azar × 100). Las filas de Drex proceden de ejecuciones propias del autor con el kit oficial; el resto, del leaderboard público.

| Modelo | Índice público | Raw | Conocimiento y razonamiento | Lenguaje | Recuperación | Herramientas | Artes |
|---|---|---|---|---|---|---|---|
| Drex v2.0 (35B) | 61,25 | 70,55 | 47,9 | 65,3 | 63,0 | 76,5 | 53,9 |
| Drex v1.5 (9B) | 58,08 | 68,08 | 44,6 | 60,4 | 61,7 | 75,0 | 48,8 |
| Jev 1.13.0 | 57,96 | 68,55 | 53,9 | 59,2 | 55,4 | 75,1 | 39,1 |
| Bespoke Nimble 9B v3 | 57,19 | 68,38 | 41,0 | 60,7 | 55,5 | 84,2 | 44,0 |
| Cloudflare clef-flash | 56,15 | 66,53 | 53,0 | 47,2 | 52,2 | 81,9 | 48,4 |
| ezjev 4B s2 | 50,82 | 63,16 | 31,0 | 60,5 | 56,3 | 69,9 | 31,1 |

JevBench (231 elementos públicos):

| Modelo | Accuracy | Fácil | Estándar | Difícil |
|---|---|---|---|---|
| Jev 1.13.0 | 86,6% (200/231) | 100,0% | 98,6% | 73,0% |
| Drex v2.0 | 85,7% (198/231) | 100,0% | 95,8% | 73,0% |

DecideBench v1.1 (400 decisiones contrastivas; solo modelos de decisión publicados, sin LLM conversacionales; no es un envío oficial al leaderboard):

| Entrada | Accuracy | Pair accuracy |
|---|---|---|
| Jev (AI Space) | 98,0% | 96,0% |
| Drex v2.0 (few-shot) | 96,5% | 93,5% |
| Drex v2.0 (zero-shot) | 96,3% | 92,5% |
| imajev-4b | 95,0% | 90,5% |
| Clef 27B | 94,8% | 89,5% |
| yev0-4b | 94,3% | 88,5% |
| Bespoke-Nimble-9B | 94,0% | 88,0% |
| TEV | 92,8% | 86,0% |
| Drex v1.5 | 90,0% | 80,5% |
| JevK5 v0.3 | 88,8% | 78,5% |

Clasificación de correo (direcciones held-out; métrica AUC y recall a un 5% de falsos positivos):

| Métrica | Drex v2.0 | Jev 1.13.0 | Drex v1.5 |
|---|---|---|---|
| AUC | 0,984 | 0,981 | 0,972 |
| Caught @ 5% FP | 89,4% | 86,4% | 80,3% |

Arena de juegos frente a Jev (ocho juegos OpenSpiel, 32 partidas por juego; puntuación = (victorias + ½ tablas) / partidas):

| Enfrentamiento | V – T – D | Puntuación |
|---|---|---|
| Drex v2.0 vs Jev | 132 – 48 – 76 | 60,9% |
| Drex v1.5 vs Jev | 122 – 47 – 87 | 56,8% |

| Juego | Drex v2.0 vs Jev | Drex v1.5 vs Jev |
|---|---|---|
| Chess | 13 – 19 – 0 (70,3%) | 9 – 21 – 2 (60,9%) |
| Four in a Row | 11 – 0 – 21 (34,4%) | 11 – 0 – 21 (34,4%) |
| Reversi | 17 – 0 – 15 (53,1%) | 15 – 1 – 16 (48,4%) |
| Checkers | 20 – 5 – 7 (70,3%) | 21 – 3 – 8 (70,3%) |
| Clobber | 20 – 0 – 12 (62,5%) | 17 – 0 – 15 (53,1%) |
| Lines of Action | 21 – 11 – 0 (82,8%) | 26 – 3 – 3 (85,9%) |
| Dots and Boxes | 15 – 0 – 17 (46,9%) | 18 – 0 – 14 (56,3%) |
| Nine Men's Morris | 15 – 13 – 4 (67,2%) | 5 – 19 – 8 (45,3%) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de LLM en la información disponible; el modelo no es generativo y no se evalúa en esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 70 GB en bf16 y aproximadamente 37 GB en Q8_0 solo para los pesos; el consumo de memoria crece además con la longitud del documento de entrada.
- GPU recomendadas: para bf16, A100 80 GB, H100 80 GB o configuraciones multi-GPU; para Q8_0, una GPU de 48-80 GB cubre los pesos con margen para activaciones y contexto largo.
- En GPU de consumo: los 37 GB del Q8_0 no caben en los 24 GB de una RTX 4090, por lo que no se puede ejecutar íntegramente en una consumer GPU de gama alta sin offload parcial a RAM (comportamiento no documentado en la información disponible). En bf16 queda muy lejos de cualquier GPU de consumo.
- Requisito de plataforma: el servidor Python de referencia necesita una GPU CUDA.
- Opciones de despliegue: servidor Python incluido (`inference.py` y `serve.py`, que expone `POST /v1/systemone`), llama.cpp mediante el fork de Nace.AI (rama `drex-v2.0`), Ollama mediante el fork de Nace.AI (rama `drex-v2.0`) y API alojada a través de OpenRouter.
- Contexto configurable en despliegue: `KEV_CONTEXT` permite subir el límite de 16.384 a 131.072 tokens.
- Latencia y throughput: no se han publicado datos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3.1 (público) | JevBench | DecideBench (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Drex v2.0 | 35B totales, ~3B activos | 16.384 por defecto, hasta 131.072 | 61,25 | 85,7% | 96,3% zero-shot / 96,5% few-shot | Nace.AI Open RAIL-M | Pesos en HuggingFace, GGUF Q8_0, OpenRouter |
| Drex v1.5 | 9B | No disponible | 58,08 | No disponible | 90,0% | No disponible | Pesos en HuggingFace |
| Jev 1.13.0 | No disponible | No disponible | 57,96 | 86,6% | 98,0% | No disponible | Leaderboard y AI Space |
| Bespoke Nimble 9B v3 | 9B | No disponible | 57,19 | No disponible | 94,0% | No disponible | No disponible |
| Cloudflare clef-flash | No disponible | No disponible | 56,15 | No disponible | No disponible | No disponible | No disponible |

Lectura de la comparativa: Drex v2.0 lidera el índice público agregado por delante de Jev 1.13.0 (+3,3 puntos) y de Drex v1.5 (+3,2), pero pierde frente a Jev en JevBench (85,7% vs 86,6%), en DecideBench (96,3% vs 98,0%) y en el área de conocimiento y razonamiento del índice (47,9 vs 53,9). Su ventaja se concentra en lenguaje (65,3), recuperación (63,0), artes (53,9) y clasificación de correo, no en razonamiento puro.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, explicaciones ni justificaciones. Cualquier caso de uso que requiera una respuesta en lenguaje natural necesita otro modelo en el pipeline.
- Riesgo de calibración: las probabilidades son explotables por umbral, pero un exceso de confianza en un umbral mal elegido produce errores sistemáticos en producción; se recomienda validar la calibración sobre datos propios antes de fijar cortes.
- La torre de visión se descarta en la carga, por lo que no hay ninguna capacidad multimodal disponible pese a heredar de un modelo `ConditionalGeneration`.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe y el comportamiento fuera del inglés está sin verificar.
- Contexto por defecto de 16.384 tokens y consumo de memoria creciente con la longitud del documento; los 131.072 tokens requieren configuración explícita y mucha más VRAM.
- Dependencia de tooling propietario: fuera del servidor Python, la ejecución exige los forks de llama.cpp u Ollama del autor (rama `drex-v2.0`), y la cabeza `head.pt` no es un formato estándar.
- Licencia Nace.AI Open RAIL-M: es una licencia Open RAIL-M con restricciones de uso; conviene revisar el fichero `LICENSE` antes de un despliegue comercial, ya que no es una licencia permisiva tipo Apache 2.0 o MIT.
- Benchmarks autopublicados: las filas de Drex en Decision Index proceden de ejecuciones del propio autor, DecideBench no es un envío oficial al leaderboard y JevBench es un conjunto de 231 elementos, por lo que las diferencias de uno o dos puntos porcentuales quedan dentro del ruido estadístico.
- Adopción todavía muy baja: 142 descargas y 14 likes en el momento de la consulta, lo que limita la evidencia independiente y el soporte de la comunidad.
- Requiere GPU CUDA para el servidor de referencia; no hay ruta documentada de inferencia en CPU ni de despliegue en hardware sin CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nace-ai/drex-v2.0
- GGUF Q8_0: https://huggingface.co/nace-ai/drex-v2.0-Q8_0
- Drex v1.5: https://huggingface.co/nace-ai/drex-v1.5
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio Drex: https://github.com/nace-ai/drex-decision-models
- Formato de petición: https://github.com/nace-ai/drex-decision-models/blob/main/docs/request-format.md
- Longitud de contexto: https://github.com/nace-ai/drex-decision-models/blob/main/docs/context-length.md
- Fork de llama.cpp (rama `drex-v2.0`): https://github.com/nace-ai/llama.cpp
- Fork de Ollama (rama `drex-v2.0`): https://github.com/nace-ai/ollama
- Cabeza Kev: https://github.com/jaredpalmer/kev
- Sitio del autor: https://www.nace.ai/
- Página del producto Drex: https://www.nace.ai/drex
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Ficha en OpenRouter: https://openrouter.ai/nace-ai/drex-v2.0
- Comparativa en OpenRouter: https://openrouter.ai/compare/nace-ai/drex-v2.0
- Hilo de X sobre Jev frente a Drex 2.0: https://x.com/Sumanth_077/status/2111096968978280776
- Anuncio de lanzamiento de Drex en LinkedIn: https://www.linkedin.com/posts/nischaydnk_excited-to-launch-drex-on-nace-ai-a-small-activity-7509097891374907393-HHMs
