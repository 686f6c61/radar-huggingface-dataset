# AhnJihunAILabs/askos-v1-mini-full

## Resumen

Askos V1 Mini Full es un modelo de lenguaje bilingüe (inglés y coreano) de 2.890.462.872 parámetros (aproximadamente 2,89 mil millones) desarrollado por AhnJihunAI Labs. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto con razonamiento estructurado mediante trazas `<|think|>`, en un formato compacto que aspira a ejecutarse en hardware modesto. El modelo se construye sobre un checkpoint previo del mismo autor (`askos-v1-mini-preview`) y se presenta como un ejercicio de eficiencia extrema: el autor afirma haber completado el entrenamiento y la alineación con un presupuesto de cómputo inferior a 30 dólares estadounidenses.

La arquitectura declarada es una topología híbrida propietaria que combina propagación de estado recurrente con anclas de atención global selectiva, junto con cómputo disperso condicional por token y refinamiento latente multi-paso controlable en inferencia. El modelo soporta una ventana de contexto de 65.536 tokens y declara un vocabulario bilingüe del mismo tamaño. Incorpora además un runtime propio denominado FASTX, orientado a streaming en precisión completa sin cuantización.

La relevancia del modelo es doble: por un lado, propone un enfoque de eficiencia radical en coste de entrenamiento; por otro, su documentación es inusualmente opaca en detalles estructurales (los hiperparámetros internos se declaran propietarios) y no presenta resultados en benchmarks estandarizados externos como MMLU, HumanEval o GSM8K, lo que limita seriamente su evaluación objetiva. La model card indica que esas evaluaciones están "programadas" pero no completadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida propietaria: estado recurrente + atención global selectiva, con cómputo disperso condicional por token y memoria paramétrica asociativa auxiliar |
| Parametros totales | 2.890.462.872 (2,89B) |
| Parametros activos | No disponible (el autor indica activación dispersa por token sin cifra concreta) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible (el modelo se distribuye y promociona en BF16 sin cuantizar; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, `model.safetensors`, 5,78 GB), con `trust_remote_code` y código de modelo personalizado |

## Arquitectura y entrenamiento

El autor describe una arquitectura que se aparta del transformer denso convencional. Los componentes declarados son: dinámica de secuencia híbrida (propagación de estado recurrente ligera combinada con anclas de atención global selectiva), cómputo disperso condicional que activa solo un subconjunto de rutas especializadas por token, profundidad de razonamiento adaptativa con refinamiento latente multi-paso controlable en tiempo de inferencia (parámetro `max_icmrc_hops`), y una memoria paramétrica estructurada con rutas de recuerdo asociativo auxiliares. Las formulaciones internas, hiperparámetros estructurales y procedimientos de calibración se declaran propietarios y no se publican.

El entrenamiento se presenta como un pipeline de bajo coste completado con menos de 30 dólares de cómputo GPU, extremo que el autor destaca como principal reclamo. La model card menciona una fase de alineación y calibración final cuyos efectos se miden sobre conjuntos de evaluación bilingües estrictamente disjuntos, pero no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. Se afirma una auditoría de descontaminación de benchmarks en tres capas, con un archivo `decontamination_audit.json` como evidencia, aunque no se especifica su contenido en la información disponible. La innovación técnica más concreta es el runtime FASTX, que incluye caché de operadores en inferencia, reutilización de estado de prefijo (caché automática del prefijo del system prompt) y streaming incremental UTF-8, todo en precisión completa.

## Capacidades

- Generación de texto conversacional bilingüe en inglés y coreano.
- Razonamiento estructurado mediante trazas `<|think|>` activables con `enable_thinking=True`.
- Refinamiento de razonamiento multi-paso controlable en inferencia mediante `max_icmrc_hops` (1 = más rápido; 2-3 = razonamiento más profundo), lo que permite un compromiso explícito entre latencia y profundidad.
- Streaming en tiempo real mediante `stream_chat` y `stream_generate`, con compatibilidad con `generate()` y `TextStreamer` de Hugging Face.
- Caché automática de prefijo de system prompt para conversaciones multi-turno.
- Inferencia en precisión completa (BF16) sin cuantización, tanto en CPU como en GPU CUDA.
- Baja tasa declarada de sobrerrechazo (0,48 % de probabilidad de falso sobrerrechazo en la evaluación del autor).
- No se documenta soporte de tool calling, function calling, uso de agentes autónomos, visión, audio ni otras modalidades.

## Casos de uso

- Asistencia conversacional bilingüe inglés-coreano: el modelo mantiene conversaciones multi-turno con una ventana de 65.536 tokens y caché de prefijo, lo que reduce el coste de reprocesar el system prompt en sesiones largas.
- Razonamiento con trazas auditables: en dominios donde se requiere inspeccionar el proceso de razonamiento (por ejemplo, soporte técnico o educación), la activación de `<|think|>` permite exponer la cadena de razonamiento al usuario o al sistema.
- Despliegue en hardware de gama media: con 2,89B parámetros en BF16 (5,78 GB), el checkpoint cabe en GPUs de consumo con 8-12 GB de VRAM, lo que habilita prototipos locales sin infraestructura dedicada.
- Procesamiento de documentos largos en coreano e inglés: la ventana de 64K permite resumir o extraer información de contratos, informes o transcripciones extensas en ambos idiomas.
- Generación de texto en streaming para interfaces de usuario: el runtime FASTX con streaming incremental UTF-8 facilita la integración en aplicaciones de chat con respuesta token a token.
- Investigación sobre arquitecturas eficientes: dado su presupuesto declarado de entrenamiento inferior a 30 dólares, sirve como referencia para estudiar pipelines de bajo coste y topologías híbridas recurrentes-atención.
- Experimentación con control de latencia: el parámetro `max_icmrc_hops` permite comparar en producción el coste y la calidad de distintos niveles de refinamiento latente sin cambiar de modelo.

## Benchmarks y rendimiento

La model card no incluye resultados en suites externas estandarizadas (MMLU, GPQA-Diamond, HumanEval, GSM8K). El autor indica explícitamente que esas evaluaciones están pendientes. Los únicos datos publicados son métricas internas sobre conjuntos de retención bilingües propios:

| Metrica | Baseline pre-alineacion | Checkpoint final | Mejora |
|---|---|---|---|
| Perplejidad en held-out disjunto (menor es mejor) | 83,51 | 22,42 | -73,15 % |
| Probabilidad de falso sobrerrechazo (menor es mejor) | 4,98 % | 0,48 % | -90,37 % |
| Puntuación de cumplimiento útil (mayor es mejor) | 0,013 | 0,717 | 54,5× |
| Repetición de 4-gramas en razonamiento EN (auditoría en vivo) | 13,33 % | 0,00 % | -100 % |

No se han publicado resultados de benchmarks estandarizados en la información disponible. Las métricas anteriores son de evaluación interna del autor y no permiten comparación directa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 5,78 GB solo para pesos, más overhead de activaciones, caché KV y estado recurrente; en la práctica se recomienda un mínimo de 8 GB de VRAM para contextos cortos y 12-16 GB para aprovechar ventanas largas.
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamaño, cabría en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en数据中心, A100 y H100 son sobredimensionadas para este tamaño salvo por requisitos de concurrencia.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en BF16; en CPU es viable con `device_map="cpu"`, aunque con latencia mayor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito del código personalizado); el runtime FASTX está integrado en el código del modelo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF hace inviable llama.cpp/Ollama sin conversión manual.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicos |
|---|---|---|---|---|---|
| Askos V1 Mini Full | 2,89B | 65.536 | Apache 2.0 | en, ko | No disponibles (solo metricas internas) |
| Qwen2.5-3B | 3,09B | 32.768 (128K en variantes) | Apache 2.0 | Multilingue amplio | Si (MMLU, HumanEval, GSM8K) |
| Llama 3.2 3B | 3,21B | 131.072 | Llama 3.2 Community License | Multilingue (8 idiomas oficiales) | Si |
| Gemma 2 2B | 2,61B | 8.192 | Gemma Terms of Use | Multilingue | Si |

La comparación es estructural: Askos ofrece una ventana de contexto competitiva (64K) y licencia permisiva, pero carece de resultados públicos verificables frente a alternativas con evaluaciones estandarizadas y ecosistema de despliegue maduro (GGUF, vLLM, Ollama). La licencia Apache 2.0 es más permisiva que las de Llama 3.2 y Gemma 2 para uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- Ausencia total de benchmarks estandarizados publicados: no es posible verificar capacidad de razonamiento, código o matemáticas frente a modelos de tamaño similar.
- Arquitectura propietaria y opaca: los hiperparámetros internos y procedimientos de calibración no se publican, lo que dificulta la reproducibilidad y la auditoría técnica.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene revisar el código antes de desplegarlo en producción.
- Solo dos idiomas declarados (inglés y coreano); el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación no cuantificado: no se publican métricas de fidelidad factual ni evaluaciones de veracidad.
- Sesgos no documentados: no hay información sobre composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Las métricas de la model card (perplejidad, sobrerrechazo, repetición) son internas, sobre conjuntos propios y sin comparación con terceros; deben interpretarse con cautela.
- No se documentan versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM o en herramientas como llama.cpp u Ollama.
- El reclamo de entrenamiento por menos de 30 dólares no es verificable de forma independiente y, en cualquier caso, no garantiza calidad.
- Sin soporte documentado de tool calling ni de flujos agénticos, lo que restringe su uso en pipelines modernos de automatización.
- El modelo tiene pocas descargas (190) y cero likes en el momento de la ficha, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AhnJihunAILabs/askos-v1-mini-full
- Modelo base: https://huggingface.co/AhnJihunAILabs/askos-v1-mini-preview
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
