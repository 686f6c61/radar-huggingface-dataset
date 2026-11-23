# litert-community/decider-0.8b-LiteRT

## Resumen

decider-0.8b-LiteRT es la conversión al formato LiteRT-LM del modelo Mapika/decider-0.8b, un modelo de decisión tipada derivado de Qwen/Qwen3.5-0.8B-Base. No es un modelo generativo al uso: en lugar de producir texto libre, recibe un estado (por ejemplo, el texto de un ticket de soporte) y una o varias preguntas tipadas, y devuelve probabilidades calibradas sobre las opciones de cada pregunta. Soporta tres tipos de decisión: elección entre 2 y 255 opciones, puntuación en 2-10 niveles y probabilidad de "sí" (noul).

El modelo resuelve el problema del enrutamiento y la clasificación estructurada con una sola pasada, sin decodificación autoregresiva de texto, lo que reduce latencia y elimina el riesgo de respuestas malformadas. Su arquitectura híbrida combina 18 capas de atención lineal (gated DeltaNet) con 6 capas de atención completa, sumando aproximadamente 0,8 mil millones de parámetros. La ventana de contexto por fila está limitada a 4096 tokens en esta exportación.

La relevancia de esta ficha reside en que se trata de un artefacto de despliegue en dispositivo (on-device) para LiteRT-LM, con dos recetas de pesos (fp16 e int8 dinámico) y métricas de fidelidad numérica frente al oráculo fp32 upstream. Es una pieza de infraestructura para pipelines de decisión, no un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas de atención lineal (gated DeltaNet) + 6 capas de atención completa |
| Parametros totales | no disponible (modelo base de 0,8B; el repo ocupa 3,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens por fila renderizada (máximo en esta exportación) |
| Tipos de cuantizacion | FP16 (casting de pesos fully connected y embeddings, cómputo float) e int8 dinámico (pesos FC int8 + embedding int8 CHANNELWISE) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm (LiteRT-LM); requiere LiteRT-LM ≥ 0.15, verificado en 0.17.1 |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 24 capas: 18 de atención lineal basadas en gated DeltaNet y 6 de atención completa. Esta combinación busca reducir el coste de atención en secuencias largas manteniendo capacidad de recuperación global. Las convoluciones y la regla delta permanecen en coma flotante en ambas exportaciones, mientras que las capas fully connected y los embeddings se cuantizan según la receta del fichero.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO en la información proporcionada. El modelo upstream se presenta como un fine-tune de Qwen/Qwen3.5-0.8B-Base orientado a decisiones tipadas de una sola pasada con probabilidades calibradas. La innovación técnica destacable no está en el entrenamiento sino en el formato de inferencia: cada pregunta de tipo score se expande en una fila sí/no por nivel, y el motor implementa prefill fragmentado de ajuste exacto con una única decodificación final por fila.

La conversión a LiteRT-LM incluye plantilla de prompt de identidad, sin token de inicio, token de parada 248044, ExecutorMetadata para 48 búferes de estado y preferencia de activaciones fp32. El lector de grafos de referencia usa ai-edge-litert 2.2.0.

## Capacidades

- Decisión de elección entre 2 y 255 opciones con probabilidades por opción.
- Puntuación ordinal en 2-10 niveles (cada nivel se evalúa como una fila sí/no independiente).
- Cálculo de probabilidad de "sí" (noul) para preguntas binarias.
- Salida estructurada tipada: no genera texto de respuesta, solo distribuciones de probabilidad.
- Procesamiento de estado más múltiples preguntas en una sola pasada.
- Ejecución en CPU y GPU (Metal en Mac, GPU de Galaxy S26 probada) con el fichero int8.
- Soporte de filas de hasta 4096 tokens; las filas muy largas (p. ej. elección de 255 opciones con 2844 tokens) deben enrutarse a CPU.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking: es un clasificador de decisión, no un generador.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto del ticket como estado, se pregunta qué equipo debe gestionarlo (elección entre departamentos) y si se ha solicitado reembolso (noul). El ejemplo incluido asigna probabilidad 0,9996 a facturación y 0,9611 a solicitud de reembolso.
- Triaje de urgencia en atención al cliente: una pregunta de tipo score de 2-10 niveles estima el grado de frustración del usuario a partir del historial de conversación, permitiendo priorizar la cola.
- Moderación de contenido con umbrales calibrados: preguntas binarias sobre categorías de riesgo, usando la probabilidad de "sí" como señal continua en lugar de una etiqueta dura.
- Clasificación de intención en asistentes de voz o chatbots: elección entre un conjunto acotado de intenciones (2-255) con probabilidades que alimentan una política de fallback cuando la confianza es baja.
- Decisión en pipelines de automatización documental: puntuar la calidad o completitud de un formulario y decidir si requiere revisión humana, con el modelo ejecutándose en el propio dispositivo.
- Filtrado previo en sistemas RAG: decidir si un fragmento recuperado responde a la consulta (noul) antes de invocar a un modelo generativo mayor, ahorrando coste y latencia.
- Inferencia on-device en Android: el fichero int8 corre en CPU y en la GPU del Galaxy S26 probado, habilitando clasificación local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos publicados son mediciones de acuerdo de conversión frente al oráculo fp32 upstream sobre 40 fixtures sintéticos en inglés (120 filas independientes, incluida una elección de 255 opciones), con temperatura T = 1,03:

| Fichero | Backend / esquema | Filas | Argmax idéntico | Máx \|Δp\| | p95 \|Δp\| | Mediana \|Δp\| | Filas > 0,02 |
|---|---|---|---|---|---|---|---|
| fp16 | CPU / ajuste exacto | 120 | 120/120 | 6,62e-06 | 3,07e-06 | 1,19e-07 | 0 |
| int8 | CPU / ajuste exacto | 120 | 117/120 | 0,160 | 0,068 | 0,0021 | 27 |
| int8 | CPU / un prefill con padding | 119 | 116/119 | 0,129 | 0,071 | 0,0018 | 25 |
| int8 | GPU Metal / un prefill con padding | 119 | 118/119 | 0,073 | 0,025 | 0,00054 | 10 |

El fichero int8 difiere del fp32 porque sus capas fully connected cuantizan dinámicamente las activaciones. En fp16, la CLI de referencia coincide con las 40 respuestas de fixture dentro de 1e-4 tras el redondeo upstream (36 exactas). Estas cifras miden acuerdo de conversión, no calibración sobre tráfico real ni precisión de tarea.

## Requisitos de hardware

- VRAM/RAM: el fichero fp16 ocupa 1.625.055.920 bytes (~1,6 GB) y el int8 963.280.896 bytes (~0,96 GB); el repo completo son 3,6 GB.
- CPU: ambos ficheros están pensados para ejecución en CPU; el fp16 es la referencia recomendada para fidelidad de probabilidades en escritorio.
- GPU: el int8 se ha verificado en Metal de Mac y en la GPU del Galaxy S26. Para lectura de decisión en GPU es obligatoria la regla de un solo chunk.
- GPU de consumo: no se especifican modelos concretos (RTX 4090, A100, H100) en la información disponible; el diseño apunta a dispositivo y CPU, no a servidores de datacenter.
- Despliegue: LiteRT-LM ≥ 0.15 (verificado en 0.17.1) con ai-edge-litert 2.2.0 para el lector de grafos de referencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El diseño de una sola pasada con una decodificación final por fila minimiza el coste frente a generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-0.8b-LiteRT | ~0,8B (híbrido) | 4096 tokens/fila | Probabilidades tipadas | Apache 2.0 | LiteRT-LM (.litertlm) |
| Mapika/decider-0.8b (upstream) | ~0,8B | no disponible | Probabilidades tipadas | no disponible | PyTorch (referencia fp32) |
| Qwen/Qwen3.5-0.8B-Base | ~0,8B | no disponible | Texto generativo | no disponible | safetensors |
| litert-community/Qwen3.5-0.8B | ~0,8B | no disponible | Texto generativo | no disponible | LiteRT-LM (fp16/int8) |

La diferencia clave frente a los modelos generativos de la misma familia es que decider no produce texto: sustituye la decodificación por una lectura directa de probabilidades sobre opciones predefinidas, lo que lo hace adecuado para decisiones auditables y de baja latencia, pero inútil para generación abierta.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado.
- No genera texto; cualquier caso de uso que requiera explicaciones o respuestas redactadas necesita un modelo adicional.
- El fichero int8 pierde fidelidad probabilística: hasta 27 de 120 filas con desviación máxima superior a 0,02 en CPU. Para decisiones sensibles a la calibración debe usarse fp16.
- Las filas largas (como la elección de 255 opciones con 2844 tokens) deben enrutarse a CPU; el error histórico multi-chunk en GPU fue de 0,0238.
- La calibración de probabilidades en Android no se ha medido; los resultados en Galaxy S26 solo demuestran funcionamiento del runtime.
- Las métricas publicadas son de acuerdo de conversión, no de precisión sobre tareas reales ni de calibración con tráfico de producción.
- Riesgo de sesgo y alucinación no evaluado en la información disponible; al no generar texto, el riesgo de alucinación textual es nulo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base upstream, no indicada en esta información.
- Requiere LiteRT-LM ≥ 0.15; versiones anteriores no soportan el binding de estado híbrido generalizado.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/decider-0.8b-LiteRT
- Modelo base upstream: https://huggingface.co/Mapika/decider-0.8b
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Conversión LiteRT de Qwen3.5-0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Checksums: https://huggingface.co/litert-community/decider-0.8b-LiteRT/blob/main/SHA256SUMS
- Ejemplo de petición: reference/fixtures/systemone_example.json (en el repo)
- Corpus de fixtures: reference/fixtures/fixtures.json (en el repo)
- Salidas oráculo fp32: reference/fixtures/oracle_fp32.json (en el repo)
- Implementación de referencia CPU: reference/systemone_litert.py (en el repo)
