# FINAL-Bench/Darwin-27B-ZTC-v5

## Resumen

Darwin-27B-ZTC-v5 es un modelo de decisión desarrollado por FINAL-Bench y publicado en Hugging Face el 11 de octubre de 2026 bajo licencia Apache-2.0. No es un modelo generativo: dada una observación de estado (`state`) y una pregunta tipada (`question`), devuelve en una sola pasada forward una probabilidad calibrada para cada opción posible. Admite tres tipos de pregunta: `noul` (sí/no), `choice` (una entre varias opciones) y `score` (un nivel dentro de una escala ordenada).

El modelo tiene 25.624.600.064 parámetros (unos 25,6 mil millones) y el repositorio ocupa 51,3 GB en formato safetensors, con pesos en BF16 según el ejemplo de uso de la model card. Se trata de un ajuste fino de pesos completos sobre Darwin-27B-ZTC-v2, la versión anterior de la misma familia, y conserva la forma de petición System One (`state` más `questions`), de modo que los clientes ya escritos para ese formato siguen funcionando sin cambios.

Su relevancia actual es doble. Por un lado, encabeza la tabla S1MB english-v1 con una puntuación Borda de 91,33 y un Task Avg de 70,61, por delante de pplx-decider-v1.1-27b (88,82) y torchcast-ai/torchcast-decision-27b (88,72). Por otro, propone un patrón alternativo al de los LLM generativos para tareas de clasificación y decisión: una única pasada con salida de probabilidades calibradas en lugar de decodificación autorregresiva. La model card no especifica la longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; el tag del repositorio es `qwen3_5_text`, lo que indica un backbone de texto de la familia Qwen3.5 |
| Parámetros totales | 25.624.600.064 (25,6 mil millones) |
| Parámetros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; el ejemplo de uso indica BF16) |
| Idiomas soportados | No disponible; las evaluaciones publicadas son en inglés (S1MB english-v1 y Typed Decisions) |
| Licencia | Apache-2.0 para los pesos; el código de decisión de `autojev/` es MIT |
| Formato de pesos | safetensors (librería pytorch); tamaño del repositorio 51,3 GB |
| Pipeline declarado | text-classification |
| Tarea de salida | Probabilidad calibrada por opción en una pasada forward |
| Tipos de pregunta | `noul` (sí/no), `choice` (varias opciones), `score` (escala ordenada) |
| Fecha de publicación | 11 de octubre de 2026 (actualizado el 12 de octubre de 2026) |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna más allá de indicar que se trata de un backbone de texto (tag `qwen3_5_text`) adaptado con código propio para producir decisiones tipadas. El modelo no genera texto: expone una cabeza de decisión que, en una sola pasada forward, emite una probabilidad calibrada para cada opción de la pregunta tipada. El código se distribuye en el directorio `autojev/` del propio repositorio, descrito como derivado del proyecto upstream autojev de Denis Yarats, con modificaciones para backbones de solo texto. La librería declarada es pytorch y el pipeline oficial es text-classification.

El entrenamiento consistió en un ajuste fino de pesos completos (full-weight fine-tuning) partiendo de Darwin-27B-ZTC-v2, sobre los splits públicos de entrenamiento de conjuntos de datos de decisión, incluido el split de train de Typed Decisions, y bajo licencias que permiten uso comercial. El autor afirma que no se utilizó ningún test split de S1MB, Typed Decisions ni de otros benchmarks, y que cada fila de entrenamiento fue cribada contra los casos de test de S1MB english-v1. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición completa del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación binaria tipada (`noul`): responde sí/no a una pregunta con criterios explícitos, devolviendo probabilidad calibrada en lugar de texto.
- Elección entre varias opciones (`choice`): selecciona y puntúa una alternativa dentro de un conjunto cerrado de opciones.
- Puntuación en escala ordenada (`score`): asigna un nivel dentro de una escala ordenada, útil para priorización o severidad.
- Una sola pasada forward por lote de peticiones, con batching soportado por `ztc_server.py`.
- Compatibilidad con la forma System One (`state` más `questions`), lo que permite reutilizar clientes preexistentes.
- No genera texto libre: no hay soporte documentado de generación, resumen o diálogo generativo.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de visión, audio ni modalidades distintas de texto.
- No hay documentación sobre capacidades multilingües; toda la evidencia publicada es en inglés.
- No hay modo de razonamiento explícito (thinking mode) documentado.

## Casos de uso

- Triage de tickets de soporte: con el tipo `noul` y criterios como "¿requiere respuesta hoy?", el modelo clasifica cada ticket entrante en una sola pasada, lo que permite procesar lotes grandes con una GPU y enrutar después cada caso al equipo correspondiente.
- Enrutado de intenciones en asistentes conversacionales: mediante preguntas de tipo `choice` con las categorías del negocio como opciones, el modelo asigna cada mensaje del usuario a un flujo concreto sin necesidad de un LLM generativo intermedio.
- Priorización por severidad en colas de incidencias: con el tipo `score`, se asigna a cada incidencia un nivel en una escala ordenada (por ejemplo, de 1 a 5), lo que permite ordenar colas y definir SLA con una señal numérica calibrada.
- Guardarraíles en agentes basados en LLM: el modelo actúa como verificador binario que comprueba si una respuesta propuesta cumple un criterio determinado antes de enviarla al usuario, aportando una segunda opinión con probabilidad calibrada y un coste de una sola pasada.
- Moderación y cumplimiento de políticas: con criterios redactados como preguntas `noul`, se evalúa si un contenido infringe una política concreta, con la ventaja de que los criterios se pueden reescribir sin reentrenar.
- Preetiquetado y control de calidad en pipelines de anotación: el modelo genera etiquetas y probabilidades sobre el split de datos pendiente, de modo que los anotadores humanos revisan solo los casos de baja confianza o discrepancia.
- Verificación de requisitos documentales: en procesos de admisión o compliance, cada documento se evalúa contra una lista de preguntas tipadas, y el resultado se agrega como un expediente de decisiones trazable.
- Despliegue de decisión por servicio: `ztc_server.py` expone `POST /v1/systemone` con batching, lo que permite integrar el modelo como microservicio de decisión síncrono o por lotes dentro de una arquitectura existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son los de S1MB english-v1 y los del test de Typed Decisions.

S1MB (System One Mosaic Benchmark), english-v1. 137 benchmarks completos, medidos con el evaluador S1MB y su adaptador `autojev` sin cambios. Las cifras aplican el propio código del leaderboard (`viewer/src/lib/borda.ts`) a los resultados publicados (150 modelos, 2026-10-11) con este modelo añadido. Envío pendiente de revisión por los mantenedores.

| Puesto | Modelo | Puntuación Borda | Task Avg |
|---|---|---|---|
| 1 | Darwin-27B-ZTC-v5 | 91,33 | 70,61 |
| 2 | perplexity-ai/pplx-decider-v1.1-27b | 88,82 | 68,79 |
| 3 | torchcast-ai/torchcast-decision-27b | 88,72 | 67,10 |
| 4 | FINAL-Bench/Darwin-27B-ZTC-v2 | 87,18 | 66,46 |

Typed Decisions test (LocalLLaMA/typed-decisions, 2.000 decisiones):

| Modelo | Precisión |
|---|---|
| Darwin-27B-ZTC-v5 | 0,812 |
| Darwin-27B-ZTC-v2 | 0,743 |

## Requisitos de hardware

- El autor indica un mínimo de unos 60 GB de memoria libre en una GPU CUDA para inferencia con pesos en BF16.
- Estimación a partir del recuento de parámetros (cálculo propio, no publicado por el autor): en BF16 los pesos ocupan aproximadamente 51,3 GB (25,62e9 parámetros x 2 bytes), lo que concuerda con el tamaño del repositorio y con la recomendación de 60 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, H200 o equivalentes con al menos 60 GB libres. También cabe en configuraciones multi-GPU de 2 x A100 40 GB si el código soporta reparto de modelo, aspecto no documentado.
- No cabe en GPUs de consumo en BF16: una RTX 4090 (24 GB) o una RTX 5090 no disponen de memoria suficiente para los pesos completos.
- Cuantizaciones: no se publican pesos cuantizados. Estimación orientativa a partir del recuento de parámetros, no verificada: unos 25,6 GB en 8 bits y unos 12,8 GB en 4 bits, cifras que en teoría permitirían ejecución en GPUs de consumo de gama alta, siempre que se genere la cuantización de forma externa y el código de decisión lo soporte.
- Opciones de despliegue: el propio repositorio incluye `autojev/` para uso programático y `ztc_server.py`, que sirve `POST /v1/systemone` con batching. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia convencionales.
- Requisitos de software: Python 3.12.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa limitada a los modelos que aparecen en la tabla publicada de S1MB english-v1 y en la evolución de la propia familia. Los datos de parámetros, contexto y licencia de los competidores no están disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto | Borda (S1MB) | Task Avg (S1MB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FINAL-Bench/Darwin-27B-ZTC-v5 | 25,62 mil millones | No disponible | 91,33 | 70,61 | Apache-2.0 (código `autojev/` MIT) | Hugging Face, safetensors, pytorch |
| perplexity-ai/pplx-decider-v1.1-27b | No disponible (el nombre sugiere 27B) | No disponible | 88,82 | 68,79 | No disponible | Referenciado en el leaderboard |
| torchcast-ai/torchcast-decision-27b | No disponible (el nombre sugiere 27B) | No disponible | 88,72 | 67,10 | No disponible | Referenciado en el leaderboard |
| FINAL-Bench/Darwin-27B-ZTC-v2 | No disponible | No disponible | 87,18 | 66,46 | No disponible | Hugging Face (versión anterior de la familia) |

En el test de Typed Decisions (2.000 decisiones), la diferencia entre la versión v5 y la v2 es de 0,069 puntos de precisión (0,812 frente a 0,743).

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera salida en lenguaje natural necesita un componente generativo adicional.
- El riesgo de alucinación en el sentido clásico no aplica, pero sí el riesgo de calibración: una probabilidad alta no garantiza que la decisión sea correcta, y la model card no publica curvas de calibración ni métricas de fiabilidad por franja de confianza.
- La evidencia publicada se limita al inglés (S1MB english-v1 y Typed Decisions); no hay datos de rendimiento en castellano ni en otros idiomas, y los idiomas soportados no están documentados.
- No se documentan sesgos conocidos ni análisis de equidad por subgrupos, lo que supone un riesgo si el modelo se usa para decisiones que afectan a personas.
- La entrada al leaderboard de S1MB está pendiente de revisión por los mantenedores; las cifras de Borda y Task Avg proceden del cálculo del propio autor aplicando el código del leaderboard, no de una validación independiente publicada.
- El modelo se ajustó sobre datos de decisión, incluido el split de train de Typed Decisions; aunque el autor declara que no se usaron splits de test y que se cribó cada fila contra S1MB english-v1, no hay verificación externa de ese cribado.
- El repositorio tiene 0 descargas y 1 like, y solo un día de antigüedad respecto a su actualización: la validación por parte de la comunidad es prácticamente nula.
- Licencia Apache-2.0 en los pesos, lo que permite uso comercial; el código de decisión de `autojev/` es MIT con cambios sobre el proyecto upstream. Las licencias de los conjuntos de datos de entrenamiento se describen como aptas para uso comercial, pero no se enumeran en la model card.
- No hay soporte documentado en los servidores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama), lo que obliga a usar el servidor propio `ztc_server.py` o a escribir la integración.
- Los requisitos de memoria (unos 60 GB libres en BF16) excluyen el despliegue en GPUs de consumo sin cuantización, y no se publican pesos cuantizados.
- La longitud de contexto no está documentada, por lo que no se puede garantizar el comportamiento con estados o preguntas largos.
- No se documentan latencia, throughput ni límites de tamaño de lote para el servidor incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-27B-ZTC-v5
- Versión anterior de la familia (Darwin-27B-ZTC-v2): https://huggingface.co/FINAL-Bench/Darwin-27B-ZTC-v2
- Leaderboard S1MB: https://huggingface.co/spaces/hotchpotch/S1MB-leaderboard
- Conjunto de datos Typed Decisions: LocalLLaMA/typed-decisions (referenciado en la model card; enlace directo no disponible)
- Código de decisión: directorio `autojev/` incluido en el propio repositorio del modelo (upstream autojev, de Denis Yarats; enlace al repositorio upstream no disponible)
- Servidor de inferencia: `ztc_server.py`, incluido en el repositorio del modelo (endpoint `POST /v1/systemone`)
- La búsqueda web realizada no devolvió enlaces relevantes: los resultados corresponden a definiciones de diccionario de la palabra "final" (Larousse, Cambridge Dictionary, Merriam-Webster, Le Robert) y no guardan relación con el modelo.
