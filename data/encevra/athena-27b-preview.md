# Encevra/Athena-27B-Preview

## Resumen

Athena-27B-Preview es un adaptador LoRA desarrollado por Encevra sobre el modelo base Qwen/Qwen3.8-27B, orientado al razonamiento sobre documentos con respuestas fundamentadas en evidencia textual. El adaptador no incluye los pesos del modelo base: se distribuye como un artefacto PEFT de aproximadamente 234 MB (rango 8, alpha 8, dropout 0) que debe combinarse con Qwen3.8-27B para su uso. La propuesta central es que cada respuesta venga acompanada de citas literales del documento fuente y que el modelo se abstenga explicitamente cuando la evidencia no permite responder.

El modelo aborda un problema concreto en sistemas RAG y pipelines documentales: la generacion de respuestas plausibles pero no soportadas por la fuente. Athena fuerza un formato estructurado de respuesta con lineas `ANSWER` y `QUOTE`, lo que facilita la verificacion automatica y reduce la tasa de afirmaciones sin respaldo. Segun la evaluacion interna del autor, el adaptador alcanza un 98% de respuestas estrictamente soportadas en un conjunto sellado de 100 preguntas, frente al 58% del modelo base con los mismos prompts.

La relevancia actual del modelo reside en su enfoque en la abtencion y el rechazo de premisas falsas, capacidades poco medidas en modelos generalistas. No obstante, se trata de un preview de investigacion con evaluacion exclusivamente interna, sin benchmarks publicos independientes, y con un alcance linguistico limitado al ingles segun la model card. El contexto de evaluacion fue de 16.384 tokens para documentos retenidos, con decodificacion greedy y modo thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal Qwen3.8-27B |
| Parametros totales | No disponible (adaptador: rango 8, alpha 8, ~234 MB) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en la evaluacion con documentos retenidos; maximo del base no disponible |
| Tipos de cuantizacion | No disponible (entrenamiento con QLoRA; cuantizaciones del adaptador no especificadas) |
| Idiomas soportados | Ingles (todo el entrenamiento y evaluacion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Athena-27B-Preview es un adaptador LoRA de rango 8 y alpha 8, con dropout 0, entrenado mediante QLoRA sobre el modelo base Qwen/Qwen3.8-27B (revision `37561816e66b5b9153b1b64c10968c18c1e6f4a0`). El entrenamiento empleo self-training verificado sobre texto de dominio publico, es decir, generacion de respuestas por parte del propio modelo seguidas de un filtro de verificacion antes de incorporarlas al conjunto de entrenamiento. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset.

La innovacion principal no es arquitectonica sino de formato y comportamiento: el adaptador induce una salida estructurada con lineas `ANSWER` y `QUOTE`, donde la cita debe ser un fragmento literal del pasaje suministrado. Este diseno permite verificar la fundamentacion de forma automatica y entrena al modelo para abstenerse cuando el documento no contiene la respuesta o cuando la pregunta incorpora una premisa falsa. La evaluacion se realizo con decodificacion greedy, thinking desactivado y un maximo de 512 tokens nuevos, con ventana de 16.384 tokens para los documentos retenidos.

## Capacidades

- Generacion de respuestas fundamentadas en documentos con citas literales del texto fuente.
- Abtencion explicita cuando la evidencia es insuficiente para responder.
- Rechazo de premisas falsas: detecta contradicciones entre la pregunta y el documento y las senala.
- Razonamiento documental multiple: busqueda de contradicciones, preguntas cuantitativas, sintesis, excepciones y preguntas que cruzan varios documentos.
- Formato de salida estructurado (`ANSWER` / `QUOTE`) apto para validacion automatica.
- Conservacion de capacidades generales del modelo base en subconjuntos reducidos de GSM8K, MMLU e IFEval, segun comprobaciones de regresion del autor.
- Menor tasa de cumplimiento ante prompts daninos en comparacion con el base, segun la evaluacion interna.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Revision de contratos y documentacion legal: el modelo responde preguntas sobre clausulas concretas citando el texto exacto, lo que permite a un revisor humano verificar cada afirmacion contra el documento original sin relectura completa.
- Analisis de articulos cientificos y literatura tecnica: extraccion de resultados cuantitativos y sintesis de hallazgos con citas literales, util en pipelines de revision sistematica donde la trazabilidad de la fuente es requisito.
- Sistemas RAG con verificacion estricta: integrado como generador final, el formato `ANSWER`/`QUOTE` permite descartar automaticamente respuestas cuya cita no coincida con el fragmento recuperado, reduciendo alucinaciones en produccion.
- Atencion al cliente sobre base documental: responde consultas a partir de manuales y politicas internas, y se abstiene cuando la respuesta no figura en la documentacion, lo que evita compromisos no respaldados.
- Auditoria de informes financieros o regulatorios: preguntas sobre cifras y excepciones con cita del pasaje exacto, adecuado para flujos donde cada dato debe ser rastreable a la fuente.
- Deteccion de contradicciones en documentacion multi-fuente: comparacion de pasajes de varios documentos para identificar inconsistencias, con senalizacion del punto exacto de conflicto.
- Control de calidad de datasets documentales: uso del modo de abtencion para identificar preguntas no respondibles y depurar conjuntos de evaluacion.

## Benchmarks y rendimiento

Resultados de la evaluacion interna de Encevra (no verificados de forma independiente). Conjunto sellado de 100 preguntas de siete familias documentales de dominio publico no usadas en entrenamiento, con el mismo prompt para todos los sistemas; los modelos de terceros se consultaron via OpenRouter a temperatura 0.

| Sistema | Strict supported | Lenient supported | Strict con limite de 512 tokens |
|---|---:|---:|---:|
| Athena-27B-Preview | 98% | 98% | 98% |
| Claude Sonnet 5.5 | 75% | 93% | 59% |
| Gemini 4 Carbon | 74% | 86% | 49% |
| Grok 4.7 | 71% | 78% | 71% |
| Qwen3.8-Max-0902 | 67% | 74% | 33% |
| Qwen3.6-27B | 64% | 76% | 40% |
| GPT-6.1 Terra | 59% | 86% | 58% |
| Qwen3.8-27B (base) | 58% | 69% | 58% |
| Mistral Medium 3.5 | 52% | 68% | 52% |

Notas del autor: la puntuacion estricta exige que los hechos requeridos esten en la linea `ANSWER` y que la cita sea literal, de al menos 16 caracteres y contenga el ancla gold. En la comparacion estricta, los intervalos bootstrap pareados de Athena estan por encima de cero frente a los ocho sistemas; frente a Claude Sonnet 5.5 la diferencia es de +23 puntos. En puntuacion laxa, la diferencia con Claude Sonnet 5.5 es de +5 puntos con intervalo de 0 a +10, por lo que no demuestra una ventaja clara. El autor reconoce que buena parte de la brecha estricta proviene del formato de salida, ya que las preguntas se redactaron en el formato entrenado de Athena. En una sonda separada de 60 items sobre alucinacion, el modelo manejo correctamente todas las preguntas no respondibles y todas las premisas falsas plantadas, y no dio respuestas sin respaldo en los 10 prompts sin documento.

## Requisitos de hardware

- El adaptador requiere cargar el modelo base Qwen3.8-27B completo; el adaptador por si solo (~234 MB) no es ejecutable.
- VRAM estimada para el base en BF16: aproximadamente 54 GB de pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 28-30 GB; en 4 bits, en torno a 15-17 GB (estimaciones a partir del tamano del base, no publicadas por el autor).
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) viable solo con cuantizacion de 4 bits y contexto reducido.
- No cabe en GPU de consumo de 8-16 GB incluso en 4 bits.
- Despliegue: PEFT sobre transformers; vLLM y TGI admiten adaptadores LoRA, pero la compatibilidad concreta con este adaptador no esta documentada. llama.cpp y Ollama requeririan fusionar el adaptador en los pesos del base y convertir a GGUF, procedimiento no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Athena-27B-Preview | Adaptador sobre 27B | 16.384 en evaluacion | Razonamiento documental con citas y abtencion | Apache 2.0 | Hugging Face (adaptador) |
| Qwen3.8-27B (base) | 27B | No disponible | Modelo generalista | Segun el base | Hugging Face |
| Claude Sonnet 5.5 | No disponible | No disponible | Modelo propietario generalista | Propietaria | API (OpenRouter) |
| GPT-6.1 Terra | No disponible | No disponible | Modelo propietario generalista | Propietaria | API (OpenRouter) |

La comparacion directa solo es posible en la tarea de fundamentacion documental evaluada por el autor: Athena obtiene 98% estricto frente a 58% del base y 52-75% de los modelos propietarios comparados. En capacidad general, los modelos propietarios no tienen datos publicados en esta ficha y el adaptador solo conserva el nivel del base en subconjuntos reducidos de GSM8K, MMLU e IFEval. No se dispone de comparaciones con otros adaptadores especializados en grounding.

## Limitaciones y advertencias

- Evaluacion exclusivamente interna: no hay benchmarks publicos independientes ni replicacion por terceros; los resultados deben tratarse como indicativos.
- Sesgo de formato: las preguntas del test se redactaron en el formato entrenado de Athena, lo que infla la ventaja en puntuacion estricta; el propio autor lo reconoce.
- Idioma: entrenamiento y evaluacion solo en ingles; el rendimiento en castellano u otros idiomas no esta caracterizado.
- Dependencia del base: el adaptador no incluye pesos; su comportamiento y licencia efectiva dependen de Qwen3.8-27B y de las condiciones de uso de este.
- Riesgo de alucinacion residual: aunque la sonda interna no detecto respuestas sin respaldo, se trata de 60 items; no hay garantia en dominios fuera de las siete familias documentales evaluadas.
- Ventana de contexto: la evaluacion uso 16.384 tokens; no se documenta el comportamiento con documentos mas largos ni el maximo real del base.
- Configuracion de inferencia acoplada: los resultados se obtuvieron con greedy, thinking desactivado y 512 tokens nuevos; otros ajustes pueden degradar el formato `ANSWER`/`QUOTE`.
- Estado preview: sin descargas ni validacion de la comunidad en el momento de la consulta; no recomendado como unico componente en produccion sin evaluacion propia.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial del conjunto requiere verificar la licencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Encevra/Athena-27B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Web de Encevra: https://encevra.com
- Laboratorio de investigacion: https://research.encevra.com
- Perfil en X: https://x.com/Encevra
- Imagen de resultados (leaderboard): https://huggingface.co/Encevra/Athena-27B-Preview/resolve/main/assets/1_leaderboard.png
