# nace-ai/drex-v2.0

## Resumen

Drex v2.0 es un modelo de decisión desarrollado por Nace.AI que responde preguntas tipadas sobre un contexto dado. A diferencia de un modelo generativo convencional, recibe un `state` (el contexto) junto con una o varias preguntas con nombre y devuelve, en un único forward pass, una probabilidad calibrada para cada opción. No genera texto: la salida es una distribución de probabilidad sobre las alternativas de cada pregunta. Está publicado con licencia Nace.AI Open RAIL-M.

El modelo se construye sobre Qwen/Qwen3.6-35B-A3B, un transformer con mezcla de expertos de 35.107.181.936 parámetros totales y aproximadamente 3B activos por token, al que se le añade una cabeza pointer (denominada Kev, en `head.pt`) que transforma la representación del contexto y la pregunta en probabilidades. Solo se utiliza la torre de lenguaje del modelo base; la torre de visión se descarta en la carga. El repositorio ocupa 70,2 GB en pesos bf16, con una versión GGUF Q8_0 de aproximadamente 37 GB.

Su relevancia actual radica en que ataca una tarea distinta a la del chat generativo: clasificación zero-shot, recomendación y decisión entre opciones con probabilidades calibradas. Según el autor, alcanza 61,25 en el Decision Index público 0.3.1, 3,3 puntos por delante de Jev 1.13.0 y 3,2 por delante de Drex v1.5, y supera a Jev en el arena de ocho juegos (60,9%). Se ejecuta en hardware propio mediante Python, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`Qwen3_5MoeForConditionalGeneration`), 40 capas, 256 expertos, 8 activos por token, con cabeza pointer Kev |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | 16.384 tokens por defecto; ampliable a 131.072 mediante `KEV_CONTEXT` |
| Tipos de cuantizacion | bf16 (pesos originales) y GGUF Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Nace.AI Open RAIL-M (`license_name: nace-ai-open-rail-m`) |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El backbone es un modelo de mezcla de expertos de la familia Qwen3.5 (`Qwen3_5MoeForConditionalGeneration`) con 40 capas, 256 expertos y 8 expertos activos por token, lo que da 35B parámetros totales y unos 3B activos por token. Sobre ese backbone se acopla una cabeza pointer implementada en `head.pt`, que convierte la representación conjunta del estado y la pregunta en una distribución de probabilidad sobre las opciones. Cada pregunta se evalúa en un forward pass independiente sobre el estado más esa pregunta; no hay decodificación autoregresiva, por lo que los parámetros de muestreo de `generation_config.json` no aplican. La torre de visión del modelo base se elimina al cargar.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor menciona que el modelo produce probabilidades calibradas y lo etiqueta como modelo de decisión "system-one", en contraposición a los pipelines generativos multi-paso. Los benchmarks propios (Decision Index 0.3.1, JevBench, DecideBench v1.1, clasificación de correo y arena de juegos) son los únicos datos de evaluación publicados; no se han divulgado detalles del proceso de entrenamiento más allá de la arquitectura.

## Capacidades

- Respuesta a preguntas tipadas sobre un contexto: opción múltiple, sí/no y escalas ordinales, devolviendo probabilidad por opción.
- Clasificación zero-shot sin ejemplos en el prompt.
- Probabilidades calibradas, aptas para umbrales operativos y ranking.
- Evaluación de múltiples preguntas con nombre en una sola petición.
- Clasificación de correo electrónico (AUC 0,984 en el conjunto de prueba del autor).
- Decisión en juegos de tablero (OpenSpiel): ajedrez, Four in a Row, Reversi, damas, Clobber, Lines of Action, Dots and Boxes y Nine Men's Morris.
- Recomendación entre alternativas dentro de un contexto dado.
- No genera texto libre ni mantiene conversación multi-turno; no expone tool calling ni capacidades de agente.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de correo electrónico: el modelo asigna una probabilidad a cada categoría o etiqueta sobre el cuerpo del mensaje, con AUC reportada de 0,984 y 89,4% de recall a un 5% de falsos positivos, lo que permite fijar umbrales de triaje sin reentrenar.
- Triaje de tickets de soporte: dado el texto del ticket como `state`, se formula una pregunta tipada con las categorías de cola y se obtiene la distribución de probabilidad para enrutar al equipo adecuado.
- Moderación de contenido: preguntas sí/no sobre el texto permiten aplicar un umbral calibrado y ordenar por probabilidad los casos límite para revisión humana.
- Recomendación de producto o contenido: con el perfil o la sesión del usuario como contexto, se pregunta por cada ítem candidato y se ordena por la probabilidad devuelta en un único forward pass por pregunta.
- Decisión en entornos de juego o simulación: integrable en agentes que necesitan puntuar movimientos legales en juegos de tablero, con resultados reportados en ocho juegos de OpenSpiel.
- Enrutamiento y selección en pipelines: elegir entre herramientas, plantillas o modelos disponibles según el contexto, usando la probabilidad como señal de confianza antes de invocar el siguiente paso.
- Evaluación de riesgo o elegibilidad: preguntas ordinales sobre un expediente para asignar niveles de riesgo con probabilidad calibrada, útil en procesos de revisión con umbrales auditables.

## Benchmarks y rendimiento

Decision Index 0.3.1 (solo benchmarks públicos; columnas de área como skill corregido por azar × 100):

| Modelo | Índice público | Raw | Knowledge & Reasoning | Language | Retrieval | Tools | Arts |
|---|---|---|---|---|---|---|---|
| Drex v2.0 (35B) | 61,25 | 70,55 | 47,9 | 65,3 | 63,0 | 76,5 | 53,9 |
| Drex v1.5 (9B) | 58,08 | 68,08 | 44,6 | 60,4 | 61,7 | 75,0 | 48,8 |
| Jev 1.13.0 | 57,96 | 68,55 | 53,9 | 59,2 | 55,4 | 75,1 | 39,1 |
| Bespoke Nimble 9B v3 | 57,19 | 68,38 | 41,0 | 60,7 | 55,5 | 84,2 | 44,0 |
| Cloudflare clef-flash | 56,15 | 66,53 | 53,0 | 47,2 | 52,2 | 81,9 | 48,4 |
| ezjev 4B s2 | 50,82 | 63,16 | 31,0 | 60,5 | 56,3 | 69,9 | 31,1 |

JevBench (231 ítems públicos):

| Modelo | Precisión | Easy | Standard | Hard |
|---|---|---|---|---|
| Jev 1.13.0 | 86,6% (200/231) | 100,0% | 98,6% | 73,0% |
| Drex v2.0 | 85,7% (198/231) | 100,0% | 95,8% | 73,0% |

DecideBench v1.1 (400 decisiones contrastivas; solo modelos de decisión publicados):

| Entrada | Precisión | Precisión por pares |
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

Clasificación de correo (direcciones retenidas; AUC y recall a 5% de falsos positivos):

| Métrica | Drex v2.0 | Jev 1.13.0 | Drex v1.5 |
|---|---|---|---|
| AUC | 0,984 | 0,981 | 0,972 |
| Caught @ 5% FP | 89,4% | 86,4% | 80,3% |

Arena de juegos contra Jev (ocho juegos de OpenSpiel, 32 partidas por juego):

| Enfrentamiento | V – E – D | Puntuación |
|---|---|---|
| Drex v2.0 vs Jev | 132 – 48 – 76 | 60,9% |
| Drex v1.5 vs Jev | 122 – 47 – 87 | 56,8% |

Desglose por juego (Drex v2.0 vs Jev): ajedrez 70,3%, Four in a Row 34,4%, Reversi 53,1%, damas 70,3%, Clobber 62,5%, Lines of Action 82,8%, Dots and Boxes 46,9%, Nine Men's Morris 67,2%.

## Requisitos de hardware

- Pesos bf16: aproximadamente 70 GB; GGUF Q8_0: aproximadamente 37 GB.
- La ruta Python requiere GPU CUDA y el consumo de memoria crece con la longitud del documento.
- GPU recomendadas: no disponibles de forma explícita; por tamaño de pesos, bf16 necesita GPUs de 80 GB (A100, H100) o reparto multi-GPU; Q8_0 encaja en GPUs de 48 GB (A6000, L40S) y, con cuantizaciones menores no publicadas, podría plantearse en 24 GB.
- No se indica compatibilidad con GPU de consumo en la información disponible.
- Despliegue: Python (`inference.py` y `serve.py`, que expone `POST /v1/systemone`), llama.cpp (fork en la rama `drex-v2.0`) y Ollama (fork en la rama `drex-v2.0`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drex v2.0 | 35B totales, ~3B activos | 16.384 por defecto; hasta 131.072 | 61,25 | Nace.AI Open RAIL-M | Hugging Face (safetensors y GGUF Q8_0) |
| Drex v1.5 | 9B | No disponible | 58,08 | No disponible | Hugging Face |
| Jev 1.13.0 | No disponible | No disponible | 57,96 | No disponible | No disponible |
| Bespoke Nimble 9B v3 | 9B | No disponible | 57,19 | No disponible | No disponible |
| Cloudflare clef-flash | No disponible | No disponible | 56,15 | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo devuelve probabilidades sobre preguntas predefinidas.
- El límite por defecto es de 16.384 tokens por petición; ampliarlo a 131.072 requiere configurar `KEV_CONTEXT` y aumenta el consumo de memoria.
- La ruta Python exige GPU CUDA; no se documenta soporte CPU.
- Los benchmarks publicados proceden en su mayoría de ejecuciones del propio autor; el resultado de DecideBench se declara explícitamente como no oficial.
- En JevBench queda por debajo de Jev 1.13.0 (85,7% frente a 86,6%) y en DecideBench también (96,5% few-shot frente a 98,0%), por lo que la ventaja no es uniforme.
- En el arena de juegos pierde claramente en Four in a Row (34,4%) y Dots and Boxes (46,9%).
- Licencia Open RAIL-M: incluye restricciones de uso derivadas del modelo RAIL; debe revisarse el archivo `LICENSE` antes de un uso comercial.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe.
- No se han publicado datos sobre sesgos, tasas de alucinación ni robustez frente a entradas adversarias.
- El rendimiento en clasificación depende de la formulación de la pregunta tipada; el autor no documenta guías de calibración más allá de los ejemplos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/drex-v2.0
- GGUF Q8_0: https://huggingface.co/nace-ai/drex-v2.0-Q8_0
- Drex v1.5: https://huggingface.co/nace-ai/drex-v1.5
- Repositorio Drex: https://github.com/nace-ai/drex-decision-models
- Formato de petición: https://github.com/nace-ai/drex-decision-models/blob/main/docs/request-format.md
- Longitud de contexto: https://github.com/nace-ai/drex-decision-models/blob/main/docs/context-length.md
- Fork de llama.cpp (rama `drex-v2.0`): https://github.com/nace-ai/llama.cpp
- Fork de Ollama (rama `drex-v2.0`): https://github.com/nace-ai/ollama
- Cabeza Kev: https://github.com/jaredpalmer/kev
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Leaderboard del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Sitio de Nace.AI: https://www.nace.ai/
