# mroaw/gemma-4-E4B-it-heretic-unslop-GGUF

## Resumen

`mroaw/gemma-4-E4B-it-heretic-unslop-GGUF` es una cuantización GGUF en formato Q4_K_M de un ajuste fino derivado de la familia Gemma 4, concretamente del modelo `llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic`. El autor, `mroaw`, aplica sobre esa base un procedimiento propio de "unslop" (eliminación de prosa artificial y clichés generados por modelos ajustados con RL) identificado con la etiqueta `cadence_k6_L21_a060`, que según la model card reduce en un 48,8 % el log-odds de "slop" medido frente a la base, sin pérdida declarada en matemáticas, ciencia ni formateo.

El modelo está orientado a escritura creativa y roleplay, y se distribuye como un único archivo GGUF de 4,94 GB pensado para ser usado directamente en `llama.cpp`, LM Studio, KoboldCpp u Ollama. No se trata de un modelo de propósito general para producción empresarial, sino de un artefacto para generación literaria y conversacional con un estilo deliberadamente más coloquial y concreto.

La información pública disponible es muy limitada: la model card describe el proceso de reducción de clichés y ofrece ejemplos comparativos frente a la base, pero no detalla arquitectura, número de parámetros, contexto, licencia ni idiomas. La ficha refleja esa escasez indicando explícitamente "no disponible" en los campos que no se pueden verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de la familia Gemma 4, sin detallar en la model card) |
| Parametros totales | no disponible (la nomenclatura E4B sugiere una variante eficiente de ~4B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible (la model card esta en ingles y los ejemplos son en ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia Gemma 4. La model card no especifica si se trata de un transformer denso, un MoE o una variante híbrida, ni detalla el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. La etiqueta `E4B` en el nombre sugiere una variante "eficiente" de aproximadamente 4 mil millones de parámetros, pero este dato no está confirmado en la información proporcionada.

La innovación técnica declarada es el procedimiento de "unslop" con identificador `cadence_k6_L21_a060`. Según el autor, este ajuste reduce en un 48,8 % el log-odds de "slop" (medido como diferencia RL-vs-Base) y preserva las capacidades matemáticas, científicas y de formateo. El modelo conserva el modo de razonamiento ("thinking mode") por defecto de Gemma 4, así como el soporte de markdown, listas y bloques de código. No se documenta el método exacto de entrenamiento ni el dataset utilizado para el ajuste fino intermedio (`ultra-uncensored-heretic`).

## Capacidades

- Generación de texto narrativo y descriptivo con un registro más coloquial y físico que la base, evitando clichés literarios como "obsidiana pulida" o nombres recurrentes tipo "Elias".
- Escritura creativa y roleplay, incluyendo mecánicas de juego, ambientación y diálogo de personajes.
- Modo de razonamiento ("thinking mode") de Gemma 4 activo por defecto.
- Formateo explícito en markdown: listas, encabezados, bloques de código y tablas.
- Generación de código y respuestas técnicas, según la model card sin degradación respecto a la base.
- Muestreo estándar recomendado: temperatura 0,8–1,0 y top_p 0,95.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Escritura de ficción y narrativa breve: el ajuste "unslop" reduce la prosa ampulosa y los clichés, lo que lo hace adecuado para generar borradores de relatos con descripciones concretas y sensoriales en lugar de metáforas gastadas.
- Roleplay conversacional: el registro coloquial y la menor rigidez estilística favorecen diálogos de personajes más naturales en sesiones multi-turno, especialmente en entornos como KoboldCpp o LM Studio.
- Diseño de mecánicas de juego de mesa o rol: la model card muestra ejemplos de generación de mecánicas cooperativas con tono desenfadado, un caso realista para prototipado rápido de reglas.
- Asistencia a escritores con bloqueo creativo: el modelo puede proponer aperturas, giros o descripciones alternativas manteniendo un tono terrenal y evitando el estilo "preciosista" que otros ajustes producen por defecto.
- Generación de contenido para campañas de rol o mundos narrativos: útil para producir trasfondo de escenarios, descripciones de localizaciones y diálogos de PNJ con coherencia estilística.
- Prototipado de chatbots de personaje en local: al ser un GGUF Q4_K_M de 4,94 GB, puede desplegarse en estaciones de trabajo consumer para experimentar con personalidades sin depender de APIs externas.
- Pruebas comparativas de estilo (evaluación de "slop"): útil como referencia para investigadores que estudien la eliminación de muletillas y clichés en modelos ajustados con RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada por el autor es la reducción del 48,8 % en el log-odds de "slop" (RL-vs-Base) con la configuración `cadence_k6_L21_a060`, sin valores absolutos ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 4,94 GB, por lo que se necesita aproximadamente 6–7 GB de VRAM para cargarlo con contexto moderado, aunque la cifra exacta depende de la longitud de contexto configurada.
- GPU recomendadas: tarjetas consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) son suficientes para el archivo Q4_K_M; para contextos largos o mayor velocidad se recomiendan RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 8 GB de VRAM; también puede ejecutarse en CPU con `llama.cpp` a velocidad reducida.
- Opciones de despliegue: `llama.cpp`, LM Studio, KoboldCpp y Ollama, según indica la model card; no se mencionan vLLM ni TGI (habitualmente orientados a safetensors, no a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `mroaw/gemma-4-E4B-it-heretic-unslop-GGUF` | no disponible (E4B) | no disponible | GGUF Q4_K_M | no disponible | Ajuste "unslop" sobre base heretic |
| `llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic` | no disponible (E4B) | no disponible | no disponible | no disponible | Modelo base del que deriva este GGUF |
| Gemma 4 E4B it (original) | no disponible (E4B) | no disponible | safetensors / GGUF (según distribución oficial) | no disponible en esta ficha | Base sin ajuste heretic ni unslop |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoría. La comparación se limita a la relación de derivación entre los tres modelos.

## Limitaciones y advertencias

- La información pública es mínima: no se confirman parámetros, contexto, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- El ajuste "heretic" y "uncensored" implica que el modelo ha sido deliberadamente desalineado de las salvaguardas del modelo original; puede generar contenido sensible, ofensivo o inapropiado sin filtros.
- Riesgo de alucinación no cuantificado; no hay benchmarks que respalden la preservación de capacidades matemáticas o científicas más allá de la afirmación del autor.
- El estilo más coloquial puede producir ocasionalmente formulaciones informales ("low-ish", "a little bit") que no encajan en contextos formales o técnicos.
- La licencia no está declarada, por lo que no se puede confirmar si se permite uso comercial; debe verificarse en el modelo base antes de cualquier despliegue productivo.
- El modelo está pensado para escritura creativa y roleplay; no se documenta soporte de tool calling, agentes ni visión, por lo que no es adecuado para pipelines de automatización.
- Solo se distribuye en Q4_K_M; no hay variantes de mayor o menor precisión publicadas por este autor.

## Enlaces

- Hugging Face: https://huggingface.co/mroaw/gemma-4-E4B-it-heretic-unslop-GGUF
- Modelo base: https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic
