# lma-project/selectstream-lite-ego4d

## Resumen

selectstream-lite-ego4d es un conjunto de checkpoints de investigación publicado por el colectivo lma-project para la tarea de memoria de streaming en vídeo de larga duración sobre el conjunto de datos Ego4D. No se trata de un modelo completo, sino de los componentes entrenables de un sistema de memoria episódica construido sobre el backbone congelado Qwen2.5-VL-7B-Instruct: un codificador de segmentos, un escritor con compuertas (gated writer), un lector de grafo (DMG/GAR), un inyector de evidencias y un puntuador de señal de escritura. El backbone de 7B parámetros no se distribuye en este repositorio y debe cargarse por separado desde el repositorio oficial de Qwen.

El modelo aborda el problema de responder preguntas (video-qa) y localizar momentos (NLQ) en flujos de vídeo continuos sin reencodear la visión en cada fotograma. Para ello utiliza una caché de características congeladas por fotograma (vectores de 3584 dimensiones) y un mecanismo de escritura selectiva que decide qué segmentos merecen persistir en la memoria, combinado con recuperación sobre un grafo de memoria. La innovación principal es el estudio de distintas señales de escritura (sorpresa suavizada, puntuador aprendido, etiquetas oráculo y longitud fija) frente a la recuperación clásica.

Es relevante ahora porque documenta de forma transparente resultados negativos y ablaciones en curso sobre una arquitectura de memoria para vídeo streaming, un área donde escasean las evaluaciones reproducibles. El repositorio ocupa 18,7 GB e incluye pesos, configuraciones, logs y predicciones de evaluación. La licencia es "other" y no se especifican idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de memoria de streaming sobre transformer multimodal Qwen2.5-VL-7B (backbone congelado) con codificador de segmentos, gated writer, lector de grafo (DMG/GAR) e inyector de evidencias |
| Parametros totales | No disponible (el backbone Qwen2.5-VL-7B no se incluye; solo se distribuyen las partes entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el backbone Qwen2.5-VL-7B soporta contexto largo, pero no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en fp32/fp16; el backbone se carga en fp16 segun la configuracion de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | `.pt` (PyTorch) para los componentes entrenables; `.npy` para la media de características de segmento; el backbone en safetensors desde el repositorio de Qwen |

## Arquitectura y entrenamiento

El sistema se compone de varias piezas entrenables sobre un backbone Qwen2.5-VL-7B congelado. El codificador de segmentos procesa características de fotograma precalculadas (vectores de 3584 dimensiones, una caché congelada para evitar ejecutar el codificador visual durante el streaming). El gated writer decide qué segmentos se escriben en memoria según una señal de escritura; el lector de grafo (DMG/GAR) recupera nodos relevantes mediante saltos de vecindad y capas GAR; el inyector de evidencias introduce los segmentos recuperados en el contexto del backbone. Un puntuador de importancia aprendido actúa como señal de escritura alternativa (brazo B).

El entrenamiento se realizó en 4 × RTX 2080 Ti con el backbone en fp16 y una sola semilla (42). El escenario principal (`full_v3`) entrena en dos etapas: la etapa R (lector + escritor, brazo A de sorpresa) durante 2 épocas, 419 pasos y 838 flujos de entrenamiento; y la etapa W (solo escritor) durante 50 pasos sobre 4 flujos partiendo de R_A, una por cada brazo de escritura. Se definen cuatro brazos: A (sorpresa suavizada), B (puntuador aprendido), C (etiquetas oráculo, cota superior) y D (segmentos de longitud fija L=24). Los checkpoints requieren los cambios de recuperación posteriores al commit `f7aa8cd` (temperatura de recuperación aprendible, prior de pregunta zero-shot, sesgos de puntuación aprendibles y entrada del codificador de segmentos centrada).

## Capacidades

- Respuesta a preguntas sobre vídeo (video-qa) en flujos de streaming de larga duración, con memoria episódica selectiva.
- Localización de momentos en vídeo (NLQ, natural language query) sobre flujos continuos.
- Memoria de streaming con escritura selectiva basada en señales de sorpresa o puntuadores aprendidos.
- Recuperación sobre grafo de memoria con saltos de vecindad y capas GAR.
- Inyección de evidencias recuperadas en el contexto del backbone multimodal.
- Preguntas compuestas (Q2) con descomposición en subpreguntas (ablación en curso).
- Soporte multimodal heredado del backbone Qwen2.5-VL-7B (visión y texto), aunque el sistema se evalúa específicamente en tareas de vídeo.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Investigación en memoria de vídeo streaming: el sistema permite reproducir y extender experimentos sobre escritura selectiva y recuperación en Ego4D, con checkpoints y logs incluidos para comparar brazos A/B/C/D.
- Asistentes de revisión de vídeo egocéntrico: responder preguntas sobre grabaciones de primera persona (Ego4D) usando la memoria de segmentos para localizar evidencias sin reencodear la visión en cada fotograma.
- Localización de momentos en grabaciones largas: el track NLQ permite recuperar el intervalo temporal asociado a una consulta en lenguaje natural sobre flujos de varios minutos.
- Estudio de señales de importancia: comparar sorpresa suavizada frente a puntuadores aprendidos para decidir qué escribir en memoria, con ablaciones documentadas (AB-B1, AB-B2/B3, AB-U1).
- Prototipado de pipelines de memoria eficiente: la caché de características congeladas (vectores de 3584 dimensiones por fotograma) permite iterar sobre el lector y el escritor sin ejecutar el codificador visual.
- Evaluación de retrieval en vídeo: los ficheros `predictions.jsonl` y `summary.json` por evaluación permiten analizar Recall@M, best IoU y contains sobre 243 flujos QA y 300 flujos NLQ.
- Base para investigación en preguntas compuestas: la ablación AB-Q1 estudia la descomposición de preguntas con presupuesto de memoria emparejado.

## Benchmarks y rendimiento

Resultados en validación, una sola ejecución. QA: 243 flujos, 3.751 preguntas. NLQ: 300 flujos, 4.552 preguntas. Diferencias emparejadas con bootstrap al 95% sobre vídeos.

| Brazo | Track | Recall@M | best IoU | contains |
|---|---|---|---|---|
| A (sorpresa) | QA | 0.518 | 0.192 | 0.220 |
| B (puntuador) | QA | 0.465 | 0.168 | 0.220 |
| A (sorpresa) | NLQ | 0.522 | 0.220 | — |
| B (puntuador) | NLQ | 0.473 | 0.190 | — |
| Sin entrenar | QA | 0.484 | 0.195 | 0.043 |
| B − A | QA | −0.053 [−0.074, −0.034] | −0.024 [−0.033, −0.016] | +0.000 [−0.002, +0.001] |

Ablaciones destacadas ya completadas: AB-T1 (sin entrenar vs entrenado) mejora Recall@M en +0.034 y contains en +0.178; AB-B1 muestra que las etiquetas oráculo (C) superan a sorpresa (A) en solo +0.006 IoU con N=16, mientras que el puntuador (B) queda −0.03 por debajo; AB-G2 indica que longitudes mínimas de segmento más cortas empeoran todos los brazos (A pasa de 0.236 a 0.175); AB-U1 reporta +0.004 [+0.002, +0.007] al combinar corte por sorpresa y valor por puntuador. Las ablaciones del lado de lectura (RD-*) y de preguntas compuestas (AB-Q1) están pendientes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El backbone Qwen2.5-VL-7B en fp16 requiere aproximadamente 14-16 GB solo para los pesos, más memoria para activaciones y contexto; los componentes entrenables añaden una cantidad no cuantificada en la model card.
- GPU recomendadas: el entrenamiento se realizó en 4 × RTX 2080 Ti (11 GB cada una) con backbone fp16, lo que sugiere que la inferencia puede caber en GPUs de 24 GB o más (RTX 3090, RTX 4090, A100, H100) dependiendo de la longitud de contexto y del número de segmentos recuperados.
- Cabe en GPU consumer: probablemente en RTX 3090/4090 (24 GB) para el backbone en fp16; no confirmado para configuraciones con muchos segmentos en memoria.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el código se distribuye en la rama `ego4d-pipeline` del repositorio selectstream-lite y requiere los cambios posteriores al commit `f7aa8cd`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| selectstream-lite-ego4d | Backbone 7B congelado + componentes entrenables | No disponible | Video-qa y NLQ en streaming sobre Ego4D | other | Pesos de componentes en HF; backbone aparte |
| Qwen2.5-VL-7B-Instruct | 7B | No disponible en esta ficha | Visión-lenguaje general | No disponible en esta ficha | Hugging Face (Qwen) |
| Alternativas de memoria de vídeo sobre Ego4D | No disponible | No disponible | Video-qa / NLQ | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con otros sistemas de memoria de vídeo en la información proporcionada.

## Limitaciones y advertencias

- Una sola semilla (42) en todas las etapas; los intervalos de confianza son sobre vídeos, no sobre ejecuciones de entrenamiento.
- Las métricas de entrenamiento en `logs/` se calculan sobre los flujos que se están ajustando, no sobre validación.
- Recall@M cuenta cualquier solapamiento; los nodos abarcan 120-150 s frente a ventanas de respuesta de ~4 s, por lo que la precisión es de ~0.03.
- Problema conocido: las respuestas QA apenas dependen de la evidencia recuperada (A y B dan la misma predicción en el 99,4% de las preguntas; contains 0,215 cuando la evidencia cae en la ventana frente a 0,226 cuando falla). Las métricas de respuesta deben tratarse con cautela hasta completar las ablaciones de memoria desactivada y evidencia oráculo.
- El puntuador aprendido no supera a la sorpresa en IoU (B − A = −0.03 en AB-B1); la combinación de señales solo aporta +0.004.
- Los checkpoints requieren cambios de recuperación posteriores al commit `f7aa8cd`; la model card indica que el commit exacto está pendiente de publicar.
- El backbone Qwen2.5-VL-7B no se incluye y debe cargarse por separado.
- Licencia "other": no se especifican restricciones de uso comercial; es necesario consultar los términos del repositorio y del backbone Qwen.
- No se documentan sesgos, cobertura de idiomas ni comportamiento fuera del dominio Ego4D.
- Riesgo de alucinación no evaluado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lma-project/selectstream-lite-ego4d
- Backbone base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Caché de características: https://huggingface.co/datasets/amritha27/selectstream-lite-ego4d-features
- Código: rama `ego4d-pipeline` del repositorio selectstream-lite (URL no proporcionada en la información disponible)
- Paper: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
