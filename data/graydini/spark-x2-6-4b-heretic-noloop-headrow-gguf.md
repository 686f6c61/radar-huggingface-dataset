# graydini/Spark-X2.6-4B-heretic-noloop-headrow-GGUF

## Resumen

Spark-X2.6-4B-heretic-noloop-headrow-GGUF es una cuantización GGUF derivada de Spark-X2.6-4B, un modelo de lenguaje de 4.112 millones de parámetros desarrollado originalmente por XHToken. El autor de esta ficha, graydini, aplica una edición quirúrgica de pesos sobre la variante "heretic" (abliterated) creada por daydreamwarrior, con el objetivo de corregir un fallo específico de razonamiento: el modelo llega a una conclusión correcta y, en lugar de actuar o detenerse, entra en un bucle semántico de re-decisión.

La innovación principal no es de entrenamiento, sino de edición de pesos: se modifica una única fila del head de salida (la correspondiente al token `</think>`, fila 4 de la matriz de embeddings atados), sumando un delta de norma ≈0.199 calculado mediante una solución de mínima norma sobre cuatro estados residuales de conclusión. En total se alteran 2.560 pesos, aproximadamente 6×10⁻⁷ del modelo. El resultado, según el autor, reduce la tasa de bucle en un benchmark controlado del 75,0 % al 31,2 % (reducción del 58,4 %) sin degradar de forma significativa los benchmarks estándar.

El modelo conserva la arquitectura `spark2_5` del base (36 capas, hidden 2560, atención híbrida, vocabulario de 131k, embeddings de entrada/salida atados) y se distribuye en formato GGUF cuantizado Q4_K_M con imatrix. Está orientado a generación de texto y razonamiento, con soporte para inglés y chino, y licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | spark2_5 (transformer, 36 capas, hidden 2560, atención híbrida, embeddings atados) |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (vocabulario de 131k; contexto máximo no especificado en la información) |
| Tipos de cuantización | Q4_K_M (imatrix); el repo base ofrece i1 y Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 2,6 GB) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `spark2_5`: un transformer de 36 capas con dimensión oculta de 2560, atención híbrida y embeddings de entrada/salida atados, con un vocabulario de 131k tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

La edición aplicada en esta ficha no implica entrenamiento ni datos de calibración. El autor diagnostica el bucle de razonamiento observando directamente activaciones y logits: en el token de conclusión, `</think>` ocupa el rango ≈54 con log p ≈ −11,8, mientras que el token `" But"` domina con log p ≈ −0,80. Dado que el head está atado (`logit(t) = emb[t] · h`), el déficit de cierre de ~11 nats se atribuye a un fallo de lectura del head, no a una dirección de MLP. Se capturan los residuales `h` (norma ≈91) en la conclusión de cuatro prompts con bucle y se resuelve el delta de mínima norma `δ = Hᵀ(HHᵀ)⁻¹(Δ·1)` con Δ = 14 nats, aplicado a la fila 4 de `token_embd.weight`. La fila se decuantiza, se edita y se recodifica en su tipo Q6_K original con el cuantizador de ggml, manteniendo el resto del GGUF bit a bit idéntico.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con canal de pensamiento explícito (thinking mode, tokens `</think>`).
- Cierre controlado del bucle de razonamiento: el modelo tiende a concluir y actuar en lugar de re-derivar la misma respuesta.
- Selección de herramientas en entornos de agente: en los prompts de prueba de tool-selection, el modelo emite la acción correcta y se detiene (0/24 bucles según el autor).
- Razonamiento aritmético multi-paso (parcialmente corregido; ver limitaciones).
- Capacidad de decensuración/abliteración heredada del finetune heretic (elimina rechazos).
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de visión, audio ni tool calling formal más allá de la selección de herramientas evaluada.

## Casos de uso

- Agentes autónomos con selección de herramientas: el modelo puede decidir qué herramienta invocar y emitir la acción sin entrar en bucles de re-decisión, gracias a la edición del head que eleva la probabilidad de cierre del canal de pensamiento a 0,90–0,95 en los prompts de prueba.
- Orquestación de pipelines multi-paso: al reducir la re-derivación semántica, encaja en flujos donde el modelo debe cerrar cada subtarea y pasar a la siguiente, evitando consumir el contexto hasta el límite.
- Asistentes conversacionales en inglés y chino: soporte nativo de ambos idiomas para atención al cliente o chat multi-turno, con la salvedad de que el contexto máximo no está documentado.
- Generación de razonamiento con traza visible: útil en entornos donde se necesita inspeccionar el proceso de pensamiento (tokens de thinking) y verificar que la conclusión se alcanza y se cierra.
- Investigación sobre edición de pesos: el checkpoint sirve como caso de estudio reproducible de edición quirúrgica de una fila del head atado para corregir comportamiento de terminación, con metodología documentada (residuales de conclusión, solución de mínima norma, recodificación Q6_K).
- Despliegue en hardware de consumo: al ser un GGUF Q4_K_M de 4B parámetros y 2,6 GB, puede ejecutarse en GPUs consumer y en CPU mediante llama.cpp u Ollama para prototipos y pruebas locales.
- Evaluación de modelos abliterated en producción controlada: permite comparar el comportamiento sin rechazos del finetune heretic frente al base, con la corrección de bucle aplicada.

## Benchmarks y rendimiento

Benchmark controlado de bucle en puntos de ramificación (12 semillas por prompt, métrica combinada semántica y verbatim; control = modelo sin editar desde los mismos puntos):

| Prompt | Tasa de bucle control | Tasa de bucle editado | Reducción |
|---|---|---|---|
| tool-ambig-2 | 9/12 | 0/12 | 100 % |
| tool-ambig-3 | 4/12 | 0/12 | 100 % |
| math-multi-1 | 12/12 | 8/12 | 33 % |
| math-multi-2 | 11/12 | 7/12 | 36 % |
| **Global** | **36/48 = 0,750** | **15/48 = 0,312** | **58,4 %** |

Probabilidad de cierre en el token de decisión tras la edición: 0,90 / 0,93 / 0,95 / 0,39 (rango 1).

Benchmarks estándar (0-shot; opción múltiple por log-verosimilitud media por token; GSM8K por exact-match greedy), antes y después de la edición:

| Suite | n | Antes | Después | Δ |
|---|---|---|---|---|
| ARC-Challenge | 100 | 0,650 | 0,610 | −0,040 |
| WinoGrande | 100 | 0,480 | 0,510 | +0,030 |
| PIQA | 100 | 0,720 | 0,710 | −0,010 |
| HellaSwag | 100 | 0,490 | 0,490 | 0,000 |
| MMLU | 91 | 0,494 | 0,516 | +0,022 |

No se han publicado resultados de MMLU, HumanEval o GSM8K completos más allá de los recogidos en la model card; no se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 2,6 GB en Q4_K_M; con overhead de contexto y KV cache, se estima un uso de VRAM en torno a 3–4 GB para contextos moderados (estimación, no dato del autor).
- GPU recomendadas: cualquier GPU con ≥6 GB de VRAM para Q4_K_M; RTX 3060/4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con 6 GB o más (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-heretic-noloop-headrow (este) | 4,112 B | no disponible | Apache-2.0 | GGUF Q4_K_M | Edición de head para corregir bucle de razonamiento |
| XHToken/Spark-X2.6-4B (base) | 4,112 B | no disponible | Apache-2.0 | safetensors | Modelo original sin decensurar ni corrección de bucle |
| daydreamwarrior/Spark-X2.6-4B-heretic | 4,112 B | no disponible | Apache-2.0 | safetensors | Finetune abliterated sin corrección de bucle |
| mradermacher/Spark-X2.6-4B-heretic-i1-GGUF | 4,112 B | no disponible | Apache-2.0 | GGUF i1/Q4_K_M | Cuantización imatrix sin edición de head |

No se dispone de comparativas con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El bucle de razonamiento no se elimina por completo: la tasa global baja al 31,2 %, y en matemáticas la reducción es solo del 33–36 % (8/12 y 7/12 siguen entrando en bucle).
- El bucle de herramientas en el agente puede seguir ocurriendo en otras tareas distintas a las evaluadas; la corrección se validó en prompts concretos de tool-selection.
- La re-derivación aritmética está solo parcialmente corregida.
- El modelo es una variante abliterated/decensored: elimina rechazos y puede generar contenido inapropiado; requiere filtros y políticas de uso en producción.
- Riesgo de alucinación inherente a un modelo de 4B parámetros; no se han publicado evaluaciones de factualidad.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Longitud de contexto máxima no especificada en la información; el vocabulario es de 131k tokens pero no se confirma la ventana efectiva.
- La edición se aplicó sobre la cuantización Q4_K_M; los resultados de benchmarks corresponden a esa cuantización y pueden no trasladarse a otros tipos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el finetune heretic imponen sus propias condiciones de atribución (ver lineage en la model card).
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/graydini/Spark-X2.6-4B-heretic-noloop-headrow-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Finetune heretic: https://huggingface.co/daydreamwarrior/Spark-X2.6-4B-heretic
- Cuantización imatrix de referencia: https://huggingface.co/mradermacher/Spark-X2.6-4B-heretic-i1-GGUF
