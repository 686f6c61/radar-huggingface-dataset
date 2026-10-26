# boyanbiji/Qwen3.5-4B-DR-SFT-5k

## Resumen

Qwen3.5-4B-DR-SFT-5k es un ajuste fino por superajuste completo (full-parameter SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario boyanbiji en HuggingFace. El objetivo concreto es convertir un modelo denso de 4,54 B de parámetros en un agente de "deep research": el modelo aprende a encadenar llamadas a herramientas de búsqueda y visita de páginas a lo largo de múltiples turnos y a cerrar la interacción escribiendo un informe extenso con citas.

El entrenamiento se apoya en 5.036 trayectorias largas (275,1 M de tokens, hasta 131.072 tokens por fila) generadas por un modelo profesor mucho mayor, Qwen3.5-122B-A10B, ejecutado en un arnés con lookahead; los informes fueron revisados con rúbrica y validados en formato de citas. El resultado es un checkpoint especializado en una única tarea de agente, con licencia Apache 2.0 y pesos en safetensors listos para `transformers`.

Su relevancia práctica es doble: por un lado, demuestra que un modelo de 4 B puede mejorar de forma medible en investigación multi-turno con herramientas (+0,056 en ResearchRubrics frente a su base); por otro, es un ejemplo reproducible de destilación de trayectorias de agente desde un profesor de 122 B a un modelo que cabe en una sola GPU de consumo. Conviene tener en cuenta que el autor advierte que la pérdida de validación es mínima tras la primera época y sube después, por lo que este checkpoint final (paso 471, época 3) podría no ser el mejor de la serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `qwen3_5` según los tags del repositorio; no se detalla si incorpora capas híbridas o atención lineal) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 131.072 tokens como máximo por fila en el dataset de entrenamiento; la ventana oficial del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | Pesos en safetensors de aproximadamente 9,1 GB (coherente con bf16); no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, librería `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B, un transformer denso de 4,54 B de parámetros identificado con el tag `qwen3_5`. Sobre él se aplicó un ajuste fino supervisado de parámetros completos (no LoRA), con FSDP2 sobre 2×H200 y paralelismo de secuencia 2, batch global de 32, learning rate 1e-5 y 3 épocas (471 pasos). El checkpoint subido corresponde al paso 471, es decir, al final de la tercera época.

Los datos son 5.036 filas de entrenamiento (275,1 M de tokens, con un máximo de 131.072 tokens por fila) más 50 filas de validación. Cada trayectoria contiene llamadas repetidas a herramientas de búsqueda y visita seguidas de la redacción de un informe con citas. El profesor es Qwen3.5-122B-A10B ejecutado en un arnés con lookahead; los informes se revisaron con rúbrica y se sometieron a una comprobación de formato que resultó en 0 violaciones estrictas del formato de citación. Las fuentes se reparten en 1.777 filas del conjunto `quest-lookahead1-qwen122b-revised-v1` y 3.259 filas de `quest-ev10k-lookahead-revised-v1`. No se documenta en la información disponible el uso de RLHF o DPO posteriores al SFT, ni la composición lingüística o temática de las trayectorias.

## Capacidades

- Generación de texto conversacional multi-turno en el contexto de una tarea de investigación.
- Uso de herramientas (tool calling): el modelo emite llamadas a herramientas de búsqueda y de visita de páginas dentro de un bucle de razonamiento de varios pasos.
- Razonamiento agéntico multi-paso: planificación de consultas, lectura de resultados y refinamiento iterativo antes de responder.
- Redacción de informes largos con citas en formato estricto, capacidad reforzada explícitamente durante el entrenamiento.
- El pipeline declarado en HuggingFace es `image-text-to-text`, lo que sugiere que hereda la entrada multimodal del modelo base; sin embargo, el entrenamiento descrito es exclusivamente textual y no se detalla el soporte real de visión.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos de razonamiento explícito (thinking mode), audio ni otras modalidades especiales.

## Casos de uso

- Informes de investigación con fuentes citadas: el modelo recibe una pregunta abierta, ejecuta varias búsquedas y visitas, y devuelve un documento estructurado con citas verificables. Es el escenario exacto para el que fue entrenado.
- Integración en pipelines RAG con herramientas externas: conectado a un buscador propio y a un fetcher de URLs mediante function calling, sustituye a un modelo mayor en la fase de síntesis multi-fuente dentro de un flujo de recuperación.
- Due diligence y análisis competitivo: dado un conjunto de consultas sobre una empresa o mercado, el agente recopila y contrasta información pública y entrega un informe con referencias para revisión humana posterior.
- Revisión bibliográfica asistida: con acceso a buscadores académicos como herramienta de búsqueda, el modelo encadena consultas y produce un estado del arte con citas, útil como primer borrador para investigadores.
- Monitorización y resumen periódico de fuentes: ejecuciones programadas que consultan un conjunto fijo de URLs y generan un boletín con los cambios relevantes y su trazabilidad.
- Base para ajuste adicional en dominio propio: al ser un SFT de parámetros completos con licencia Apache 2.0, sirve como punto de partida para SFT o DPO sobre datos internos de una organización.
- Despliegue on-premise con requisitos de privacidad: con 4,54 B de parámetros cabe en una GPU de 24 GB en bf16, lo que permite ejecutar el agente dentro de la infraestructura del cliente sin enviar consultas a terceros.
- Prototipado y evaluación de agentes de investigación a bajo coste: útil como baseline económico frente a modelos de 70 B o más al diseñar arneses ReAct y rúbricas de evaluación.

## Benchmarks y rendimiento

Evaluación del autor con ResearchRubrics (101 preguntas), arnés ReAct, `presence_penalty` 0, `max_tokens` 16.384 y juez LLM idéntico para ambas filas.

| Modelo | ResearchRubrics (score) |
|---|---|
| Qwen3.5-4B (base) | 0,4351 |
| Qwen3.5-4B-DR-SFT-5k | 0,4909 |

La mejora es de +0,056 puntos, con un t de Student pareado de 3,84 sobre las mismas 101 preguntas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 9,1 GB solo de pesos (el repositorio ocupa 9,1 GB), más caché KV. Con ventanas de 128k tokens la caché KV puede superar los pesos; el cálculo exacto no está disponible al no publicarse la configuración de atención.
- GPU recomendadas: H100 o A100 80 GB para servir muchas peticiones concurrentes con contexto largo; L40S o A10G 48/24 GB para cargas moderadas.
- GPU de consumo: cabe en bf16 en RTX 4090, RTX 3090 y RTX 4080 Super (16 GB) con contexto moderado o limitando la longitud de secuencia. En tarjetas de 8-12 GB es necesario cuantizar a 8 o 4 bits (aproximadamente 4,5 GB y 2,3 GB de pesos), lo que requiere convertir los pesos, ya que no se publican GGUF en el repositorio.
- Opciones de despliegue: `transformers` de forma nativa; vLLM o TGI para servicio en producción; llama.cpp u Ollama tras convertir los pesos a GGUF; el tag `endpoints_compatible` del repositorio indica compatibilidad con los endpoints de HuggingFace.
- Entrenamiento reproducible: el autor reporta FSDP2 sobre 2×H200 con paralelismo de secuencia 2, batch global 32 y 471 pasos para 3 épocas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ResearchRubrics | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-DR-SFT-5k | 4,54 B (denso) | hasta 131.072 tokens por fila en entrenamiento | 0,4909 | Apache 2.0 | HuggingFace, safetensors |
| Qwen3.5-4B (base) | 4,54 B (denso) | no disponible | 0,4351 | no disponible en esta búsqueda | HuggingFace |
| Qwen3.5-4B-DR-SFT-1k / 2.5k / 8k | 4,54 B (denso) | misma receta | no disponible | Apache 2.0 | HuggingFace |
| Qwen3.5-122B-A10B (profesor) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Las variantes hermanas (1k, 2.5k y 8k) comparten receta y modelo base, diferenciándose solo en el número de trayectorias de entrenamiento; el autor no publica sus puntuaciones en la información disponible. No se dispone de datos de otros modelos de investigación profunda de tamaño comparable para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sobreajuste probable: el propio autor indica que la pérdida de validación es mínima tras la primera época y aumenta después; este checkpoint (época 3) podría rendir peor que uno intermedio.
- Evaluación limitada: el único benchmark son 101 preguntas de ResearchRubrics puntuadas por un juez LLM, sin evaluación humana independiente ni repeticiones sobre otros dominios.
- Destilación de un único profesor: todo el comportamiento proviene de trayectorias generadas por Qwen3.5-122B-A10B, por lo que hereda sus sesgos, estilo de citación y posibles errores factuales.
- Riesgo de alucinación: el modelo genera informes largos con citas; el autor verificó el formato de citación (0 violaciones estrictas), pero no la veracidad del contenido de cada referencia.
- Idiomas: no se especifican los idiomas soportados ni la proporción de datos en castellano; el rendimiento fuera del inglés es desconocido.
- Especialización estrecha: es un SFT orientado a deep research; su rendimiento en tareas generales, código o matemáticas puede degradarse respecto al modelo base y no se ha medido.
- Modalidad incierta: el pipeline `image-text-to-text` sugiere capacidades de visión heredadas, pero el entrenamiento documentado es solo textual y no se detalla su comportamiento multimodal.
- Licencia: el modelo se publica como Apache 2.0, pero conviene verificar por separado los términos del modelo base Qwen/Qwen3.5-4B antes de un uso comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-5k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 1k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-1k
- Variante 2.5k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-2.5k
- Variante 8k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-8k
