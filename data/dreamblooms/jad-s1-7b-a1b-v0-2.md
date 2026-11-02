# DreamBlooms/JAD-S1-7B-A1B-v0.2

## Resumen

JAD-S1-7B-A1B-v0.2 es un adaptador LoRA sobre el modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct` que lo convierte en un modelo de decisión de opción múltiple. En lugar de generar texto libre y parsearlo, el adaptador inserta un token de máscara en la ranura del asistente y, en un único forward pass, devuelve una distribución normalizada de probabilidad sobre las letras de opción disponibles (A–Z). La respuesta es la letra de mayor probabilidad, sin generación ni postprocesado. Lo desarrolla DreamBlooms y se publica bajo licencia Apache-2.0.

El modelo hereda la arquitectura de difusión de LLaDA-MoE del modelo base (7B parámetros totales, 1B activos, mezcla de expertos) y añade un adaptador LoRA con r=8 y alpha=16 sobre las proyecciones q/k/v/o y las capas gate/up/down. El adaptador pesa 311 MB y el repositorio completo 0,3 GB. Soporta inglés y chino, con contexto recomendado de 4.096 tokens y hasta 8.192.

Su relevancia radica en el enfoque: elimina la generación autoregresiva y el parsing de salidas para tareas de decisión acotada, lo que reduce latencia y errores de formato. En JevBench v1.2.2 (231 tareas) alcanza 192/231 (83,1%), frente a 155/231 (67,1%) del modelo base, con una mejora concentrada en el tramo difícil (de 40,5% a 68,5%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE de difusión (LLaDA-MoE) |
| Parametros totales | 7B (modelo base); adaptador LoRA de 311 MB |
| Parametros activos | 1B (modelo base MoE) |
| Longitud de contexto | 4.096 tokens recomendado; hasta 8.192 soportado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 (adaptador, código y documentación) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LLaDA-MoE-7B-A1B-Instruct, un modelo de difusión de lenguaje con arquitectura de mezcla de expertos (7B totales, 1B activos). La innovación del adaptador es el mecanismo de lectura "one-step restricted-label": se coloca una única ranura de máscara en la posición del asistente y se restringe la distribución de salida a las etiquetas de opción presentes en la tarea, de modo que el modelo produce directamente una distribución sobre letras A–Z sin generar tokens de texto. El adaptador LoRA tiene r=8, alpha=16 y actúa sobre q/k/v/o y gate/up/down.

El entrenamiento se realizó con datos públicos de licencia abierta y datos sintéticos generados para el proyecto; no se usaron datos no comerciales ni de solo investigación. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. Las probabilidades se calibran con una temperatura única ajustada sobre datos de validación (T=1,23), que reduce el error de calibración esperado de 0,037 a 0,017; la temperatura no altera la letra elegida, solo la confianza reportada.

## Capacidades

- Decisión de opción múltiple: dado un estado (`state`), una pregunta y una lista de opciones con etiquetas A–Z, devuelve la letra más probable en un solo forward pass.
- Soporte de 2 a 26 opciones por tarea (se recomiendan 6).
- Salida calibrada: distribución de probabilidad normalizada sobre las opciones válidas, con temperatura de calibración T=1,23.
- Sin generación de texto ni parsing de salida: la respuesta es directamente la letra de mayor probabilidad.
- Multilingüe limitado a inglés y chino.
- Integración estándar con PEFT y Transformers (`PeftModel.from_pretrained`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Triaje de incidencias en soporte técnico: clasificar cada ticket en una de las categorías predefinidas (p. ej. facturación, red, acceso) usando el estado de la conversación como `state` y las categorías como opciones; la decisión en un solo paso evita latencia de generación.
- Enrutamiento de consultas en un chatbot: decidir a qué departamento o flujo derivar una consulta entrante entre 2 y 26 opciones, con confianza calibrada para escalar a humano cuando la probabilidad máxima sea baja.
- Moderación de contenido: clasificar publicaciones o mensajes en categorías de riesgo (permitido, revisar, bloquear) usando el texto como estado y las políticas como opciones.
- Selección de respuesta en sistemas RAG: elegir entre varios candidatos recuperados cuál responde mejor a la pregunta, con las candidatas como opciones etiquetadas.
- Evaluación automatizada de decisiones: puntuar decisiones tomadas por agentes en entornos simulados comparando la opción elegida con la distribución del modelo.
- Clasificación de intenciones en asistentes de voz o texto: mapear una frase de usuario a una intención predefinida en inglés o chino, con contexto de hasta 4.096 tokens para conversaciones multi-turno.
- Control de calidad en pipelines de anotación: validar etiquetas de anotadores humanos frente a la decisión del modelo y marcar discrepancias para revisión.

## Benchmarks y rendimiento

JevBench v1.2.2, 231 tareas de decisión de opción múltiple, mismo harness, mismo readout de un paso y contexto de 4.096 tokens:

| Modelo | easy | original | hard | all |
|---|---:|---:|---:|---:|
| Base (LLaDA-MoE-7B-A1B-Instruct) | 48/48 | 62/72 | 45/111 | 155/231 (67,1%) |
| JAD-S1 Early Preview | 48/48 | 67/72 | 60/111 | 175/231 (75,8%) |
| + adaptador v0.2 | 48/48 | 68/72 | 76/111 | 192/231 (83,1%) |

Intervalo de confianza del 95% para 192/231: 77,8%–87,4%. El adaptador elimina el 49% de los errores del modelo base (de 76 a 39 respuestas incorrectas) y eleva el tramo difícil del 40,5% al 68,5%.

Puntos de referencia públicos en las mismas 231 tareas (protocolo del índice Open-Jev, con límite de 16.384 tokens, por lo que los readouts no son directamente comparables con el readout de un paso):

| Modelo | all (231) |
|---|---:|
| GPT-5.6 Luna (none) | 206/231 (89,2%) |
| Jev 1.13.0 | 200/231 (86,6%) |
| Open-Jev 27B v1.1 | 197/231 (85,3%) |
| CLEF Flash | 191/231 (82,7%) |
| Open-Jev-9B | 179/231 (77,5%) |
| Dohnuts-0.1.0-0.8B | 152/231 (65,8%) |
| Laya Vision | 111/231 (48,1%) |
| Laya multilingual | 110/231 (47,6%) |

En la suite de decisión Kev, el adaptador v0.2 reporta 74,0% por decisión (74,5% con ponderación equitativa), frente al 71,5% de v0.1e+. No se dispone de resultados detallados de benchmarks externos adicionales en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un modelo base de 7B parámetros totales con 1B activos, la inferencia requiere cargar los pesos completos del modelo base más el adaptador de 311 MB.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño del modelo base, se requiere una GPU con memoria suficiente para 7B parámetros en el formato de precisión elegido.
- No se confirma si cabe en GPU de consumo; no disponible.
- Opciones de despliegue: el adaptador se carga con PEFT y Transformers (`AutoModel.from_pretrained` con `trust_remote_code=True` y `attn_implementation="sdpa"`). Se incluye `inference.py` como implementación de referencia autocontenida. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La ventaja declarada es que la decisión se obtiene en un único forward pass sin generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench v1.2.2 (231) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JAD-S1-7B-A1B-v0.2 | 7B totales / 1B activos (base) | 4.096 (hasta 8.192) | 192/231 (83,1%) | Apache-2.0 | HuggingFace (adaptador) |
| Open-Jev 27B v1.1 | 27B | no disponible | 197/231 (85,3%) | no disponible | no disponible |
| Open-Jev-9B | 9B | no disponible | 179/231 (77,5%) | no disponible | no disponible |
| Dohnuts-0.1.0-0.8B | 0,8B | no disponible | 152/231 (65,8%) | no disponible | no disponible |
| GPT-5.6 Luna (none) | no disponible | no disponible | 206/231 (89,2%) | propietaria | API |

Los datos de los modelos comparables provienen de sus propias publicaciones o del índice Open-Jev, con protocolos de evaluación distintos (16.384 tokens, vectores de probabilidad verbalizados en el caso de GPT), por lo que la comparación directa con el readout de un paso de JAD-S1 no es estrictamente equivalente.

## Limitaciones y advertencias

- El adaptador solo realiza decisiones de opción múltiple; no genera texto libre ni mantiene conversaciones.
- Limitado a inglés y chino; no se documenta soporte de otros idiomas.
- Contexto recomendado de 4.096 tokens; por encima es necesario activar `--max-seq-len 8192` y el rendimiento puede degradarse.
- Solo se distribuye el adaptador (311 MB); es necesario descargar por separado el modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct`.
- Para reproducir exactamente las puntuaciones publicadas es necesario usar `inference.py`, que reconstruye el rotary embedding del modelo base en el dispositivo destino; sin ese paso algunas decisiones ajustadas pueden cambiar.
- La calibración de probabilidades depende de la temperatura T=1,23 ajustada sobre datos de validación; fuera de la distribución de entrenamiento la confianza puede no ser fiable.
- No se documentan sesgos conocidos ni tasas de alucinación específicas; al no generar texto, el riesgo de alucinación se limita a elegir una opción incorrecta.
- Licencia Apache-2.0 permite uso comercial, modificación y redistribución, pero debe conservarse la atribución indicada en `NOTICE`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente (noviembre de 2026) sin validación externa independiente.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.2
- Modelo base: https://huggingface.co/inclusionAI/LLaDA-MoE-7B-A1B-Instruct
- NeoHorse-Jev-4B (benchmarks externos citados): https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B
