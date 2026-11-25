# mikipero/qwen3.8-27b-ipdeadline

## Resumen

El modelo `mikipero/qwen3.8-27b-ipdeadline` es un ajuste fino por QLoRA del modelo base Qwen/Qwen3.8-27B, publicado por el usuario mikipero en Hugging Face. Su propósito es responder preguntas sobre plazos de propiedad intelectual (anualidades de patentes, renovaciones de marcas, periodos de prioridad, periodos de gracia, tasas por demora, fase nacional del PCT y ventanas de restauración) en aproximadamente 210 jurisdicciones, citando siempre la fuente normativa de la que procede el dato.

El modelo se distribuye como adaptador LoRA (PEFT, r=64, alpha=64) sobre el modelo base, y también como modelo fusionado en formato GGUF Q4_K_M de 16,7 GB, lo que permite ejecutarlo en una única GPU de consumo con 24 GB de VRAM. El corpus de entrenamiento se construyó principalmente a partir de legislación primaria y publicaciones oficiales de oficinas de propiedad intelectual y de la OMPI, con alrededor de 98.700 hechos extraídos.

Se trata de un checkpoint temprano (run 1, 2 épocas) de carácter experimental, orientado a un dominio muy específico y con un formato de salida rígido y parseable. No es un modelo de propósito general: está diseñado para responder de forma breve y verificable, y para declinar cuando el corpus no contiene una regla aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); ajuste fino QLoRA sobre el mismo |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la configuracion de Ollama recomendada usa `num_ctx 2048` |
| Tipos de cuantizacion | Q4_K_M (GGUF); base en 4-bit NF4 durante el entrenamiento QLoRA; adaptador LoRA en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) y GGUF (modelo fusionado Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, del que se conserva únicamente la torre de lenguaje; la torre de visión del modelo base no se ha tocado. Sobre esa base se aplicó un ajuste fino QLoRA con cuantización 4-bit NF4, rango LoRA r=64, alpha=64 y dropout de 0,05. Los módulos objetivo del adaptador son las proyecciones de atención q/k/v/o y las de las capas feed-forward gate/up/down.

El entrenamiento se realizó sobre texto plano, sin plantilla de chat y sin bloque de razonamiento (thinking). El formato exacto es `### Question\n{question}\n### Answer\n`, con parada en `### Question`. El corpus de entrenamiento contiene aproximadamente 98.700 hechos de unas 210 jurisdicciones, construido principalmente a partir de legislación primaria y publicaciones oficiales de oficinas de PI y de la OMPI. El checkpoint publicado corresponde al run 1, con 2 épocas, de modo que cada hecho se ha visto unas 6 veces. La pérdida en el conjunto de validación cayó de 2,216 antes del entrenamiento a 0,228 tras la primera época y a 0,129 tras la segunda, si bien el autor advierte que esa métrica incluye los tokens del patrón fijo de respuesta y de la URL, por lo que dice poco sobre la exactitud de los valores.

## Capacidades

- Generación de texto extractiva y concisa sobre plazos y trámites de propiedad intelectual en aproximadamente 210 jurisdicciones.
- Respuesta con cita de fuente: cada respuesta termina con la URL de la ley o página de oficina de la que procede el hecho.
- Declinación explícita cuando el corpus no contiene una regla para la pregunta formulada (por ejemplo, "This corpus does not record a tolling rule for Italy. I will not guess a value that is not in the source data.").
- Formato de salida consistente y parseable, adecuado para integrarse en herramientas y pipelines.
- Cobertura de tipos de respuesta: valores declarados (periodos, fechas, tasas, reglas), citas literales de artículos de ley y respuestas de "no registrado".
- No dispone de modo de razonamiento (thinking) entrenado, ni de capacidades de visión, audio o tool calling documentadas.
- Multilingüe: no; el modelo declara únicamente inglés como idioma soportado, aunque el corpus de origen incluya fuentes en decenas de idiomas.

## Casos de uso

- Consulta de anualidades de patentes: un agente jurídico interno puede preguntar el plazo y la tasa de renovación de una patente en una jurisdicción concreta y recibir una respuesta breve con la URL de la ley aplicable, lo que permite verificarla en un clic antes de actuar.
- Gestión de renovaciones de marcas: un despacho puede integrar el modelo en su sistema de docketing para obtener el periodo de renovación o el periodo de gracia de un registro en un país determinado y contrastarlo con la fuente oficial citada.
- Cálculo de periodos de prioridad y fase nacional del PCT: útil para equipos de tramitación que necesitan un primer valor orientativo del plazo de 12 meses u otras ventanas, siempre con verificación posterior contra la fuente enlazada.
- Atención al cliente en servicios legales: el modelo puede responder consultas frecuentes sobre plazos y tasas en múltiples jurisdicciones con un formato estable, lo que facilita su integración en un chatbot o formulario de autoservicio.
- Extracción estructurada en pipelines documentales: gracias a su salida uniforme y a la parada en `### Question`, puede encadenarse en scripts que parseen la respuesta y extraigan el valor y la URL de origen para alimentar una base de datos interna.
- Despliegue local con requisitos de confidencialidad: al ejecutarse en una única RTX 3090 con el GGUF Q4_K_M de 16,7 GB y Ollama o llama.cpp, permite consultar normativa sin enviar las preguntas a servicios externos.
- Filtro de declinación en asistentes legales: su comportamiento entrenado de responder "no registrado" cuando no hay regla en el corpus sirve como capa de contención para evitar que el sistema invente plazos en dominios sin cobertura.

## Benchmarks y rendimiento

Los resultados publicados por el autor se midieron sobre el GGUF Q4_K_M con decodificación greedy (temperatura 0), en una muestra estratificada de 100 preguntas extraídas de un conjunto de validación de 1.894. El autor advierte que las preguntas de validación son nuevas formulaciones de hechos presentes en los datos de entrenamiento, por lo que miden recuerdo de hechos entrenados, no conocimiento de derecho no visto.

| Tipo de respuesta | Resultado |
|---|---|
| Valor declarado (periodo, fecha, tasa, regla) | 61% exacto (44 de 72; 8 de las 80 no tienen un valor único puntuable) |
| Cita literal de estatuto | 46% (6 de 13) |
| "No registrado" (debe declinar) | 100% (7 de 7) |
| Global, reponderado a la mezcla del conjunto de validación | ≈ 61% |

La puntuación es estricta: un valor solo cuenta si la respuesta contiene el valor de referencia. La mayoría de los fallos son desviaciones cercanas en valores precisos (una fecha con unos días de diferencia, un importe de tasa distinto o una sección de ley diferente). La pérdida de validación pasó de 2,216 a 0,129 tras dos épocas. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,7 GB en Q4_K_M (GGUF fusionado); el adaptador LoRA requiere además cargar el modelo base Qwen3.8-27B, cuyo peso completo no se detalla en la información disponible.
- GPU recomendadas: una RTX 3090 (24 GB) es suficiente para el GGUF Q4_K_M; por tamaño, también cabría en RTX 4090 (24 GB), A100 y H100.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 24 GB de VRAM para la versión Q4_K_M.
- Opciones de despliegue: Ollama (probado con la versión 0.32) y llama.cpp (`llama-completion`); el adaptador PEFT puede aplicarse sobre el modelo base con las herramientas estándar de PEFT.
- Latencia: aproximadamente 2 segundos por respuesta de media en la muestra medida con una RTX 3090; las citas largas de estatutos tardan varios segundos.
- Configuración recomendada: `num_ctx 2048`, temperatura 0 y parada en `### Question`. En Ollama conviene usar `"raw": true` o `--think=false`, porque la plantilla de chat heredada del modelo base activa el modo thinking por defecto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (asistentes especializados en plazos de propiedad intelectual) en la información proporcionada. Como referencia estructural, el modelo se apoya en Qwen/Qwen3.8-27B como base, pero no se han publicado datos comparativos de rendimiento frente a otros ajustes finos o modelos legales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mikipero/qwen3.8-27b-ipdeadline | 26,9 mil millones | no disponible | apache-2.0 | Hugging Face (adaptador y GGUF) |
| Qwen/Qwen3.8-27B (base) | 27 mil millones (según nombre) | no disponible | no disponible | Hugging Face |
| Alternativas legales especializadas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint temprano (run 1, 2 épocas): el propio autor lo califica de experimental y prevé más entrenamiento y un dataset más limpio en futuras ejecuciones.
- Exactitud limitada en valores precisos: solo el 61% de las respuestas de valor declarado son exactas en la muestra medida, con fallos por fechas desviadas unos días, importes de tasa distintos o secciones de ley incorrectas.
- Los benchmarks miden recuerdo de hechos vistos en entrenamiento con nuevas formulaciones, no conocimiento de derecho no visto; no debe interpretarse como cobertura fiable de normativa no incluida en el corpus.
- Riesgo de alucinación: el autor advierte explícitamente que la capacidad de declinar no es una garantía contra respuestas incorrectas.
- El dataset de entrenamiento del run 1 contiene notas internas del corpus que no son hechos legales (por ejemplo, comentarios de verificación), que el autor planea eliminar.
- Idioma: solo se declara inglés; las fuentes originales están en decenas de idiomas, pero el modelo no está entrenado para responder en otros idiomas.
- Plantilla de chat: el GGUF conserva la plantilla del modelo base con modo thinking, que el ajuste fino nunca vio; usarla sin desactivar el razonamiento o sin `raw: true` puede degradar las respuestas.
- No es asesoramiento legal: el autor recomienda confirmar siempre el plazo contra la fuente citada antes de actuar.
- Licencia apache-2.0, que permite uso comercial, pero sujeta a las condiciones de la licencia del modelo base Qwen/Qwen3.8-27B, cuyos términos no se detallan en la información disponible.
- Contexto de trabajo recomendado de 2048 tokens: no está pensado para conversaciones multi-turno largas ni para documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikipero/qwen3.8-27b-ipdeadline
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- OMPI (fuente del corpus): https://www.wipo.int
- Ejemplo de fuente citada en la model card: https://ago.gov.to/cms/images/LEGISLATION/PRINCIPAL/1994/1994-0019/IndustrialPropertyAct_3.pdf
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
