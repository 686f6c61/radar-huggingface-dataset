# scar-ai/vera-core-2

## Resumen

vera-core-2 es un modelo de decisión no autorregresivo desarrollado por scar-ai, derivado del backbone de Qwen3.5-2B (Apache-2.0). A diferencia de un LLM convencional, no genera texto: recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas acompañadas de probabilidades calibradas. Esto elimina el parseo de salida y reduce drásticamente el riesgo de alucinación, ya que el modelo puntúa opciones en lugar de redactar respuestas libres.

El modelo cuenta con 1.883.395.910 parámetros totales en formato bf16 (3,8 GB de pesos) y se distribuye bajo licencia Apache-2.0. Su pipeline declarado es text-classification y soporta tres tipos de pregunta: `choice` (entre 2 y 255 opciones), `score` (de 2 a 10 niveles ordenados, con distribución completa y puntuación esperada) y `noul` (probabilidad de sí/no). Está pensado como base generalista que el usuario puede afinar con datos de su propio dominio.

Su relevancia actual radica en que obtiene 41,3 en el Jev Decision Index 0.3 público, frente a 30,1 de su predecesor vera-core y 19,6 de vera-spark, quedando a un punto de d3-nano, el modelo abierto más fuerte de su tamaño según el autor. Con una latencia mediana de 78 ms por petición en una MI300X, se posiciona como una alternativa eficiente para enrutamiento, triaje y clasificación con confianza calibrada en pipelines de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-2B con capas de atención completa y capas Gated DeltaNet causales; readout de puntero de opción y calibración de temperatura por tipo de pregunta |
| Parametros totales | 1.883.395.910 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor indica que cada petición se lee completa, sin truncar estado, pregunta ni descripciones de opciones) |
| Tipos de cuantizacion | no disponible (los pesos publicados están en bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, 3,8 GB) |

## Arquitectura y entrenamiento

vera-core-2 es un modelo de decisión no autorregresivo construido sobre el backbone de Qwen3.5-2B. Cada pregunta se resuelve en un único forward pass: el prompt enumera todas las opciones bajo un código de respuesta corto, las capas de atención completa ven el prompt entero mientras que las capas Gated DeltaNet permanecen causales, y cada opción se puntúa en el último token del prompt a través de su código de respuesta, con un readout adicional de puntero de opción que mira hacia la línea propia de esa opción. La pila completa se afina sobre datos de decisión y las probabilidades resultantes se calibran por temperatura de forma específica para cada tipo de pregunta.

El autor no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset de decisiones, ni confirma el uso de RLHF o DPO. La información disponible indica únicamente un fine-tuning completo (fully fine-tuned) sobre datos de decisión partiendo de Qwen3.5-2B, con el objetivo declarado de que el checkpoint funcione zero-shot en muchos tipos de decisión y sirva como punto de partida para ajustes posteriores en dominios concretos.

## Capacidades

- Clasificación de elección múltiple (`choice`) con entre 2 y 255 opciones, devolviendo la opción elegida y su distribución de probabilidad.
- Puntuación ordinal (`score`) con entre 2 y 10 niveles ordenados, devolviendo la puntuación esperada y la distribución completa.
- Decisión binaria (`noul`) con probabilidad calibrada de sí/no.
- Respuesta conjunta de todas las preguntas de una misma llamada en una sola pasada.
- Aceptación de estados en texto plano o cualquier objeto serializable a JSON.
- Enrutamiento y triaje de tickets, correos y peticiones.
- Clasificación de intención y temática con confianza calibrada para escalado.
- Selección de herramienta o función para agentes, incluida la opción de no llamar ninguna.
- Verificación de políticas y cumplimiento normativo.
- Verificación de hechos y afirmaciones contra un documento.
- Evaluación y ranking de respuestas candidatas.
- Flujos con puerta de confianza: actuación automática si la probabilidad supera un umbral, derivación a un modelo más lento o a un humano en caso contrario.
- No genera texto libre, por lo que no requiere parseo de salida ni presenta alucinación de formato.

## Casos de uso

- Triaje de soporte al cliente: se envía el texto del ticket como estado y se formulan preguntas `choice` sobre departamento y prioridad, junto con una pregunta `noul` sobre riesgo de cancelación; el modelo devuelve probabilidades calibradas que permiten enrutar automáticamente y escalar los casos dudosos.
- Clasificación de intención en asistentes conversacionales: se mapea cada mensaje del usuario a un conjunto propio de intenciones mediante preguntas `choice`, usando la distribución de probabilidad para decidir si se responde de forma automática o se pide aclaración.
- Selección de herramientas en agentes: antes de invocar una API, el agente consulta al modelo qué herramienta corresponde a la petición actual, incluyendo la opción de no llamar ninguna, lo que reduce llamadas erróneas en pipelines multi-paso.
- Verificación de cumplimiento normativo: se introduce el caso y la regla aplicable como estado y se formula una pregunta `noul` sobre si se cumple la política, con la probabilidad asociada como señal de auditoría para revisión humana.
- Puntuación de urgencia y sentimiento: con preguntas `score` de varios niveles se obtiene una puntuación esperada y una distribución completa, útil para priorizar colas de atención o medir la gravedad de incidencias.
- Verificación de afirmaciones contra documentación: se pasa el documento y la afirmación como estado y se pregunta `noul` si la afirmación está respaldada, lo que permite construir comprobadores de hechos con umbral de confianza.
- Evaluación de respuestas candidatas: se presentan varias respuestas como opciones de una pregunta `choice` y el modelo selecciona la mejor, con la distribución como medida de acuerdo entre candidatos.
- Puertas de confianza en producción: cualquier flujo anterior puede combinarse con un umbral sobre la probabilidad devuelta para derivar los casos inciertos a un modelo mayor o a un operador humano.

## Benchmarks y rendimiento

Jev Decision Index 0.3 (suite pública, mayor es mejor):

| Modelo | Parámetros | Decision Index | knowledge | language | retrieval | tools | arts |
|---|---|---|---|---|---|---|---|
| vera-core-2 (este repo) | ~2B | 41,3 | 21,4 | 43,9 | 53,8 | 61,5 | 23,9 |
| vera-core | ~2B | 30,1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| vera-spark | ~630M | 19,6 | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor indica que la ejecución de la suite pública respondió las 140.620 filas sin truncar ninguna, con una latencia mediana de 78 ms por petición en una MI300X. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Pesos en bf16 de 3,8 GB; la VRAM necesaria para inferencia debe acomodar además el estado, las preguntas y las opciones de cada petición, por lo que conviene reservar margen sobre los 3,8 GB base.
- GPU recomendada por el autor para el rendimiento medido: AMD MI300X (78 ms de latencia mediana por petición).
- Cabe en GPU de consumo: con 3,8 GB en bf16, tarjetas como RTX 4090, RTX 4080 o RTX 3090 disponen de VRAM suficiente; no se han publicado mediciones específicas en estas tarjetas.
- En CPU una petición tarda varios segundos según el autor, por lo que no es apto para producción de baja latencia sin GPU.
- Despliegue mediante el paquete `vera-s1` (Python 3.10 o superior) con extra `[fast]` para la ruta GPU más rápida, o mediante `vera-serve`, servidor HTTP compatible con `POST /v1/systemone` que agrupa peticiones concurrentes en lotes.
- También carga con `transformers` mediante `AutoModel` y `trust_remote_code=True`, probado con transformers 5.19.0; las salidas coinciden con el paquete `vera` (diferencia máxima de probabilidad de 0,0 en 60 decisiones retenidas).
- No se han publicado datos de throughput más allá de la latencia mediana citada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vera-core-2 | ~2B (1.883.395.910) | no disponible | 41,3 | Apache-2.0 | Hugging Face (scar-ai/vera-core-2) |
| vera-core | ~2B | no disponible | 30,1 | no disponible | Hugging Face (scar-ai/vera-core) |
| vera-spark | ~630M | no disponible | 19,6 | no disponible | Hugging Face (scar-ai/vera-spark) |
| d3-nano | no disponible | no disponible | ~42,3 (a un punto de vera-core-2 según el autor) | no disponible | no disponible |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de contexto, licencia ni disponibilidad de d3-nano, ni de alternativas externas de la misma categoría de modelo de decisión.

## Limitaciones y advertencias

- El modelo solo soporta inglés según el campo de idiomas de la model card; el rendimiento en otros idiomas no está documentado.
- No genera texto: no puede emplearse para tareas de generación, resumen o diálogo libre, solo para puntuar opciones predefinidas.
- El conocimiento medido en el Jev Decision Index es bajo (21,4), lo que sugiere menor fiabilidad en decisiones que dependan de conocimiento factual extenso.
- El rendimiento en la dimensión arts es también bajo (23,9) frente a retrieval (53,8) o tools (61,5); conviene validar el caso de uso concreto antes de desplegar.
- Al ser un modelo base generalista, el autor recomienda afinarlo con datos del dominio propio para ajustar etiquetas, redacción y calibración; la calibración zero-shot puede no transferir a distribuciones distintas.
- El servidor `vera-serve` no incluye autenticación y escucha en `127.0.0.1` por defecto; si se expone con `--host 0.0.0.0` debe colocarse detrás de una pasarela propia.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-2B, también Apache-2.0 según la información disponible.
- No se han publicado detalles sobre sesgos, composición del dataset de entrenamiento ni evaluaciones de robustez frente a entradas adversarias.
- El uso de `trust_remote_code=True` con transformers implica ejecutar código personalizado del repositorio; conviene revisarlo antes de desplegarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scar-ai/vera-core-2
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo predecesor vera-core: https://huggingface.co/scar-ai/vera-core
- Modelo vera-spark: https://huggingface.co/scar-ai/vera-spark
