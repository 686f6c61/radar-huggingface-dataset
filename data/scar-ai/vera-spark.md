# scar-ai/vera-spark

## Resumen

vera-spark es un modelo de decisión no autorregresivo desarrollado por scar-ai, diseñado para resolver tareas de clasificación y selección tipada en un único pase forward. A diferencia de los modelos generativos, no produce texto libre: recibe un estado (texto, correo, ticket o JSON) y un conjunto de preguntas tipadas, y devuelve respuestas tipadas con probabilidades calibradas. Esto elimina el parseo de salida y reduce drásticamente el riesgo de alucinación, ya que el modelo no genera lenguaje.

Con aproximadamente 630 millones de parámetros (638.468.358 según los pesos en safetensors), vera-spark se posiciona como el hermano compacto de vera-core (~2B, basado en Qwen3.5-2B). Comparte con este la misma interfaz System One, el mismo formato de cable (`POST /v1/systemone`) y el mismo formato de decisión, lo que permite intercambiarlos. Soporta una ventana de contexto de 8.192 tokens y está pensado como base generalista para afinar en dominios concretos.

El modelo es relevante porque propone una capa de decisión rápida y calibrada para sistemas agénticos y pipelines de triaje, con latencias de 29-34 ms por pregunta en MI300X (batch de uno). Su licencia Apache 2.0 y su formato de pesos safetensors facilitan la integración en producción. No obstante, la model card indica explícitamente que el modelo está discontinuado en favor de scar-ai/vera-core-2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No autorregresiva, modelo de decisión System One (detalles internos no disponibles) |
| Parámetros totales | 638.468.358 (~630M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (8K) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería pytorch, custom_code) |

## Arquitectura y entrenamiento

vera-spark es un modelo no autorregresivo de tipo System One, es decir, produce decisiones en un único pase forward en lugar de generar tokens secuencialmente. La información disponible no detalla la arquitectura interna (tipo de transformer, capas, atención, etc.), más allá de que se distribuye con `custom_code` y pesos en safetensors. El modelo trabaja sobre un contexto de 8.192 tokens y devuelve respuestas tipadas con probabilidades calibradas, lo que sugiere una cabeza de clasificación sobre representaciones del estado y las preguntas.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineación. La model card menciona que el checkpoint liberado funciona zero-shot en muchos tipos de decisión, pero está concebido como base para fine-tuning en dominios específicos, de modo que el ajuste con etiquetas propias mejore la calibración y el ajuste a la terminología del usuario. Se reporta una métrica de calibración ECE de 0,141 global y valores de Brier de 0,024 / 0,263 / 0,692, lo que indica que el modelo produce distribuciones de probabilidad explícitas y evaluables.

## Capacidades

- Clasificación de texto y decisión tipada: dado un estado y preguntas con opciones, devuelve la opción seleccionada con probabilidad calibrada.
- Routing y triaje: asignación de tickets, correos o peticiones a equipos, colas o prioridades.
- Clasificación de intención y tema: mapeo de mensajes a un conjunto de intenciones definido por el usuario, con confianza para escalado.
- Selección de herramientas y funciones: elección de la siguiente herramienta o API que debe invocar un agente.
- Control de agentes: selección de la siguiente acción en agentes de navegador, conducción o flujos de trabajo.
- Verificación de políticas y cumplimiento: decisión sobre si un caso cumple o incumple una regla.
- Puntuación y severidad: valoración en escala ordinal (urgencia, sentimiento, riesgo) con distribución de probabilidad completa.
- Verificación de hechos y afirmaciones: comprobación de una declaración contra un documento.
- Juicio y ranking: comparación de respuestas candidatas y selección de la mejor.
- Flujos con umbral de confianza: actuación automática cuando la confianza es alta y derivación a un modelo más lento o a un humano cuando no lo es.
- Capacidades multilingües: limitadas al inglés según la model card.
- No genera texto libre, por lo que no hay salida que parsear ni texto que pueda alucinar.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de preguntas tipadas (departamento, prioridad, tipo de incidencia) y devuelve la decisión con probabilidad, permitiendo enrutar automáticamente y escalar cuando la confianza sea baja. Es adecuado por su latencia de 29-34 ms y su calibración explícita.
- Clasificación de intención en asistentes conversacionales: con un conjunto de intenciones definido por el equipo, el modelo mapea cada mensaje a una intención y ofrece una distribución de probabilidad que permite decidir si se responde automáticamente o se deriva a un humano.
- Selección de herramientas en agentes: en un pipeline agéntico, vera-spark elige la siguiente herramienta o API a invocar a partir del estado actual y las opciones disponibles, actuando como capa de decisión rápida antes de llamar a un modelo generativo más costoso.
- Verificación de cumplimiento normativo: dado un caso y un conjunto de reglas, el modelo decide si el caso cumple o incumple cada regla, con probabilidad asociada, lo que facilita auditorías y flujos de revisión.
- Puntuación de riesgo o urgencia: el modelo devuelve una distribución sobre una escala ordinal (por ejemplo, urgencia de 1 a 5), útil para priorizar colas de trabajo con un umbral de confianza configurable.
- Juicio y ranking de respuestas: comparar dos o más respuestas candidatas generadas por otros modelos y seleccionar la mejor, con una puntuación de preferencia calibrada, como capa de evaluación en pipelines de generación.
- Control de agentes de conducción o navegación: la demo JevPilot muestra el modelo sirviendo decisiones de conducción en tiempo real, lo que ilustra su uso como capa de decisión de baja latencia en sistemas embebidos o de control.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) en JevBench:

| Modelo | Parámetros | Easy | Original | Hard | Overall | ECE (overall) |
|---|---|---|---|---|---|---|
| vera-core | ~2B | 100 | 93,1 | 58,6 | 77,9 | 0,098 |
| vera-spark (este repo) | ~630M | 100 | 83,3 | 46,0 | 68,8 | 0,141 |
| Jev (referencia) | – | 100 | 99 | 74,1 | – | – |
| Laya (leaderboard público, no ejecutado por el autor) | 421M | 94 | 73 | 34 | – | – |
| Julia-1 (ejecución del autor) | 144M | 75,0 | 47,2 | 35,1 | 47,2 | – |
| reflex-s1 (ejecución del autor, perfil rápido) | 23M/83M | 81,2 | 45,8 | 39,6 | 50,2 | – |

Desglose del nivel hard (aciertos / total):

| Familia | Puntuación | Familia | Puntuación |
|---|---|---|---|
| routing_hard | 5/5 | temporal_numeric | 8/15 |
| adversarial | 5/6 | tradeoff | 4/6 |
| trap | 6/8 | judge_hard | 6/17 |
| ambiguous | 4/7 | long_policy | 6/19 |
| multi_hop | 5/18 | probability | 2/10 |

Conjunto interno de selección:

| Conjunto | vera-spark |
|---|---|
| Composite de selección | 75,3 |
| Decisiones held-out (3,6k ítems, descontaminado) | 75,1 |
| Juicio (preferencia / estilo RewardBench) | 63,3 |
| Open-Jev fuera de distribución | 83,6 |
| Rule-following dev | 86,9 |
| Casos reescritos verificados por código | 69,2 |
| Documentos largos (1,5-3k palabras) | 72,7 |
| Decisiones tipadas (zero-shot) | 52,8 |

Calibración: ECE 0,141 global; Brier 0,024 / 0,263 / 0,692. Latencia mediana por pregunta: 29-34 ms en MI300X con batch de uno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~630M parámetros, en fp16 serían aproximadamente 1,3 GB de pesos; en fp32, unos 2,6 GB. Añadiendo overhead de activaciones y contexto de 8K, el consumo total sería moderado, pero no se han publicado cifras oficiales.
- GPU recomendadas: no se especifican. La medición de latencia reportada se realizó en AMD MI300X. Por tamaño, el modelo debería caber en GPUs consumer como RTX 3090, RTX 4090 o incluso GPUs con 8 GB de VRAM en precisión reducida, aunque no hay confirmación oficial.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de ~630M parámetros, pero no se dispone de confirmación en la información proporcionada.
- Opciones de despliegue: el paquete oficial es `vera-s1` (Python 3.10 o superior), que descarga los pesos una vez y los cachea, y selecciona automáticamente GPU CUDA o CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: latencia mediana de 29-34 ms por pregunta en MI300X con batch de uno. No se han publicado cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench overall | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vera-spark | ~630M | 8K | 68,8 | 0,141 | Apache 2.0 | HuggingFace (discontinuado) |
| vera-core | ~2B | No disponible | 77,9 | 0,098 | No disponible | HuggingFace |
| Laya | 421M | No disponible | – (94/73/34 en easy/original/hard) | – | No disponible | Leaderboard público |
| Julia-1 | 144M | No disponible | 47,2 | – | No disponible | No disponible |
| reflex-s1 | 23M/83M | No disponible | 50,2 | – | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo discontinuado: la model card indica explícitamente que vera-spark ya no se mantiene y recomienda usar scar-ai/vera-core-2 en su lugar.
- Solo inglés: el campo de idiomas de la model card únicamente declara `en`, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación bajo pero no nulo: al no generar texto libre, no hay alucinación textual, pero sí puede producir decisiones incorrectas o mal calibradas, especialmente en tareas de múltiples pasos.
- Rendimiento limitado en tareas duras: 46,0 de accuracy en el nivel hard de JevBench y solo 52,8 en decisiones tipadas zero-shot, lo que indica que el modelo base necesita fine-tuning para dominios específicos.
- Calibración mejorable: ECE de 0,141 es superior al 0,098 de vera-core, por lo que las probabilidades son menos fiables que en el modelo grande.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al estar discontinuado no habrá actualizaciones ni correcciones de seguridad por parte del autor.
- Caveat para producción: la recomendación del autor es afinar el modelo con etiquetas propias; el uso zero-shot en dominios no vistos puede degradar la precisión y la calibración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scar-ai/vera-spark
- Modelo sucesor recomendado: https://huggingface.co/scar-ai/vera-core-2
- Modelo hermano mayor: https://huggingface.co/scar-ai/vera-core
- Demo (vídeo JevPilot): https://huggingface.co/scar-ai/vera-spark/resolve/main/demo.mp4
- Paquete de inferencia: `pip install vera-s1`
