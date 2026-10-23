# praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-raft

## Resumen

`benchmark-slm-fiven-gemma-4-4b-raft` es un adaptador LoRA publicado por el usuario `praiselab-picuslab` sobre el modelo base `google/gemma-4-E4B-it`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino ligero (repo de 0,1 GB, pesos en safetensors y librería PEFT) cuyo propósito declarado, a juzgar por los tags `benchmark-slm`, `dataset-fiven` y `strategy-raft`, es servir como artefacto de evaluación dentro de un banco de pruebas de modelos pequeños de lenguaje, empleando la estrategia RAFT (Retrieval-Augmented Fine-Tuning) sobre el conjunto de datos denominado "fiven".

La relevancia de esta ficha es limitada y hay que enmarcarla con honestidad: el repositorio tiene 0 descargas y 0 likes, está restringido (gated), no declara licencia y no incluye documentación técnica en la información disponible. El único idioma etiquetado es el italiano (`it`), lo que sugiere un ajuste orientado a esa lengua, aunque no se especifica la composición del corpus. Todo lo que sigue distingue explícitamente entre datos aportados por la model card de HuggingFace y estimaciones derivadas del identificador del modelo.

No se ha podido recuperar información adicional: los resultados de la búsqueda web proporcionados corresponden al foro de desarrolladores de Roblox y no guardan relación con este modelo. Por tanto, arquitectura del modelo base, número de tokens de entrenamiento, hiperparámetros del LoRA, resultados de benchmarks y condiciones de uso deben considerarse **no disponibles**.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el adaptador; el modelo base es `google/gemma-4-E4B-it`, cuya arquitectura no se detalla en la información proporcionada (la familia Gemma es de tipo transformer decoder-only, pero este dato no se confirma en la información disponible) |
| Parámetros totales | No disponible. El identificador del base incluye "E4B" y el nombre del repo incluye "4b", pero no se especifica si se refiere a parámetros totales, efectivos o activos |
| Parámetros activos | No disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El adaptador se distribuye en safetensors (precisión nativa del adaptador, no declarada); no se publican versiones GGUF/AWQ/GPTQ |
| Idiomas soportados | `it` (italiano), único idioma declarado en los tags |
| Licencia | No disponible (la model card no declara licencia; el acceso está restringido) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); tamaño del repo 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (tag `lora`, librería `peft`) acoplado a `google/gemma-4-E4B-it`, un modelo instruct de la familia Gemma. No se publican ni el rango, ni el alpha, ni los módulos objetivo del adaptador, ni la configuración de entrenamiento (epochs, learning rate, precisión, tamaño de lote). Tampoco se indica si se entrenó con supervisión completa de respuesta o con enmascaramiento parcial, ni si hubo fases posteriores de alineación como DPO o RLHF.

El tag `strategy-raft` apunta a Retrieval-Augmented Fine-Tuning, una variante que entrena al modelo con documentos de contexto y distractores para que aprenda a ignorar pasajes irrelevantes y a citar la evidencia correcta. El tag `dataset-fiven` identifica el corpus empleado, del que no se ofrece número de ejemplos ni número de tokens. El tag `or2` no se puede interpretar con la información disponible. No hay innovaciones técnicas propias documentadas (ni decodificación especulativa, ni atención lineal, ni modos de razonamiento extendido más allá de los del modelo base).

## Capacidades

- Generación de texto conversacional en italiano, heredada del ajuste sobre un modelo `-it` y del corpus de entrenamiento declarado.
- Respuesta condicionada a contexto documental, si la hipótesis de entrenamiento RAFT es correcta: el modelo habría sido optimizado para responder citando pasajes de documentos recuperados y descartando distractores.
- Tool calling / function calling: no disponible (no confirmado para este adaptador; depende de lo que soporte el modelo base).
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingües: limitadas al italiano según los tags; el resto de idiomas del modelo base no se declara.
- Capacidades especiales (visión, audio, thinking mode): no disponibles para este adaptador.
- Evaluación comparativa de modelos pequeños: el propio propósito declarado del repo es servir como artefacto dentro de un benchmark interno, no como modelo de producción.

## Casos de uso

- Evaluación interna de variantes de ajuste fino: el adaptador sirve para comparar, dentro de un pipeline propio, el rendimiento del base frente al ajuste con RAFT sobre el corpus "fiven", manteniendo un único modelo base y variando solo los pesos LoRA.
- Prototipado de asistentes documentales en italiano: cargando el adaptador sobre el base, se puede probar un flujo de pregunta-respuesta sobre documentación recuperada, aprovechando el entrenamiento con distractores para medir la fidelidad a las fuentes.
- Investigación sobre RAFT: reproduce o audita la estrategia de entrenamiento con documentos y distractores, útil para comparar variantes de aumentación de contexto.
- Banco de pruebas de robustez ante contexto irrelevante: permite medir la degradación del modelo cuando el contexto recuperado contiene pasajes que no responden a la pregunta.
- Análisis de linaje de adaptadores: al ser un LoRA de 0,1 GB, se puede almacenar y versionar junto a otros adaptadores del mismo base para experimentación reproducible sin duplicar pesos completos.
- Docencia y formación técnica: ejemplo práctico de cómo se publica un adaptador PEFT con restricciones de acceso y sin licencia declarada, útil para discutir buenas prácticas de documentación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas (ni MMLU, ni GSM8K, ni HumanEval, ni métricas de recuperación o fidelidad propias de RAFT) y los resultados de la búsqueda web no contienen datos relativos a este modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones de orden de magnitud derivadas del tamaño indicado en el nombre (~4B), **no confirmadas por el autor ni por datos del modelo base**:

- VRAM para inferencia del adaptador: el adaptador en sí ocupa ~0,1 GB, pero requiere cargar el modelo base completo; el LoRA no reduce los requisitos de memoria.
- Con cuantización de 4 bits (si el base lo permite mediante bitsandbytes), un modelo de ~4B suele caber en GPUs de consumo con 8–12 GB de VRAM; no confirmado para este base.
- En fp16/bf16, un modelo de ~4B requiere del orden de 8–10 GB solo para pesos, más caché KV; encajaría en RTX 4090 (24 GB), L4 (24 GB) y A100 (40/80 GB).
- Despliegue: al ser PEFT, la ruta natural es `transformers` + `peft` (carga del base y `load_adapter`), con opciones de servido mediante vLLM (soporte de LoRA) o TGI; llama.cpp/Ollama solo si existe una conversión del base a GGUF y se fusionan los pesos, algo que no se proporciona.
- Latencia y throughput: no disponibles. Al no publicarse benchmarks ni configuración de servido, no es posible ofrecer cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-raft` | Adaptador LoRA sobre Gemma 4 E4B-it | No disponible (nombre sugiere ~4B en el base) | No disponible | No disponible | Gated, 0 descargas |
| `google/gemma-4-E4B-it` (modelo base) | Modelo instruct completo | No disponible | No disponible | No disponible en esta información (Gemma suele publicarse bajo Gemma Terms of Use, dato no aportado) | Público en HuggingFace |
| Otros ajustes finos de la misma familia SLM | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos objetivos para comparar con alternativas de la misma categoría (por ejemplo, otros LoRA de evaluación sobre modelos de ~4B): no hay benchmarks publicados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación: sin licencia, sin métricas, sin configuración de entrenamiento y sin descripción del dataset, el modelo no es auditable y no debería usarse en producción.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace; no se especifican los criterios de aprobación.
- Licencia no declarada: no hay autorización explícita de uso comercial; la licencia del adaptador puede además estar condicionada por la del modelo base (`google/gemma-4-E4B-it`), que debe verificarse por separado.
- Riesgo de alucinación: no cuantificado; en configuraciones RAFT es habitual que el modelo aprenda a citar, pero también a inventar referencias cuando el contexto no contiene la respuesta. Sin evaluación publicada, el riesgo es desconocido.
- Cobertura lingüística declarada únicamente en italiano; el comportamiento en castellano no está documentado ni evaluado.
- Sesgos: no disponibles; no se ha publicado ninguna evaluación de sesgo, toxicidad o equidad.
- Naturaleza del artefacto: es un adaptador, no un modelo autónomo; sin el base y sin la versión exacta del tokenizador, no es reproducible.
- Contexto máximo efectivo: desconocido; si el corpus de entrenamiento usaba ventanas cortas, el rendimiento podría degradarse con contextos largos incluso si el base los soporta.
- Uso previsto aparente: experimentación y benchmark interno; emplearlo como servicio al cliente o en generación de código en producción carece de cualquier garantía documentada.

## Enlaces

- HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-raft
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Paper de RAFT: no disponible en la información proporcionada
- Blog o demo: no disponible
- Repositorio de código: no disponible
- Resultados de la búsqueda web: no relevantes (corresponden al foro de desarrolladores de Roblox y no guardan relación con el modelo)
