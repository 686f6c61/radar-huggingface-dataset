# mangaba-ai/Mangaba-Telecom-8B

## Resumen

Mangaba Telecom 8B es un adaptador LoRA desarrollado por Mangaba AI sobre el modelo base Qwen3-8B, especializado en legislación brasileña de telecomunicaciones. El modelo está diseñado para responder consultas en portugués de Brasil sobre el texto vigente de cinco normas clave: la Ley General de Telecomunicaciones (LGT, Ley 9.472/1997), el Marco Civil de Internet (Ley 12.965/2014), la LGPD (Ley 13.709/2018), la Ley de Antenas (Ley 13.116/2015) y el FUST (Ley 9.998/2000). Su propósito es asistir a proveedores de internet (ISPs), equipos de atención al cliente, centros de operaciones de red (NOC) y departamentos jurídicos del sector.

El adaptador se entrena en dos etapas sobre Qwen3-8B, un transformer de 8.000 millones de parámetros con licencia Apache-2.0. La primera etapa genera pares pregunta-respuesta por artículo con recuperación del texto exacto; la segunda introduce fragmentos recuperados junto a la pregunta para enseñar al modelo a responder citando el artículo y la norma correctos. El resultado es un sistema que funciona en tándem con una base de búsqueda vectorial (bge-m3) que aporta los fragmentos normativos relevantes.

La relevancia del modelo radica en su enfoque RAG (retrieval-augmented generation) específico de dominio: según la evaluación del autor con 60 preguntas fuera del conjunto de entrenamiento, el adaptador alcanza un 78% de respuestas correctas y un 93% de citas exactas del artículo, frente al 0% del Qwen3-8B sin búsqueda. El acceso está restringido mediante un formulario de registro (gated model).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Qwen3-8B) |
| Parametros totales | 8.000 millones (modelo base Qwen3-8B); adaptador LoRA r=32, α=64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors) |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) con rango 32 y alpha 64 aplicado sobre todas las proyecciones lineales de Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros. El entrenamiento se realizó en dos etapas diferenciadas. La primera consistió en 3 épocas con pares pregunta-respuesta generados por artículo, incluyendo la recuperación del texto de cada artículo por su número. La segunda etapa añadió 1 época en la que la pregunta se acompaña de fragmentos recuperados, mezclando el dispositivo correcto con fragmentos similares, con el objetivo de que el modelo aprenda a responder a partir de los fragmentos y a citar la etiqueta exacta (artículo y norma).

El entrenamiento se ejecutó en 2 GPUs NVIDIA L40S en servidores de Mangaba AI en Brasil. La base de búsqueda asociada (`busca/corpus/`) contiene los artículos y embeddings generados con bge-m3, y se complementa con bge-reranker-v2-m3 (ambos de BAAI) para el reordenamiento de fragmentos. El texto normativo se recopiló del Planalto el 19/10/2026. No se especifica en la información disponible si hubo RLHF o DPO; el proceso descrito es exclusivamente supervisado (SFT) mediante LoRA.

## Capacidades

- Generación de texto y respuesta a preguntas en portugués de Brasil sobre legislación de telecomunicaciones.
- Citación precisa de artículo y norma a partir de fragmentos recuperados (RAG).
- Razonamiento jurídico acotado al texto vigente de las cinco normas cubiertas.
- Modo de pensamiento desactivable mediante `chat_template_kwargs={"enable_thinking": false}`, recomendado para el despliegue en producción.
- Integración con pipelines de recuperación vectorial (bge-m3) y reordenamiento (bge-reranker-v2-m3).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente en ISPs: el modelo responde consultas de usuarios sobre derechos y obligaciones (por ejemplo, plazos de cancelación o portabilidad) citando el artículo aplicable del Marco Civil o la LGT, siempre que el sistema de búsqueda aporte el fragmento correcto.
- Asistencia al equipo jurídico de telecomunicaciones: redacción de borradores de respuestas a requerimientos regulatorios con referencia exacta a la norma, reduciendo el tiempo de localización del articulado.
- Soporte al NOC y equipos técnicos: consultas sobre obligaciones de guarda de registros, neutralidad de red o tratamiento de datos de usuarios, con base en la LGPD y el Marco Civil.
- Formación interna y onboarding: generación de material de estudio y preguntas de evaluación sobre la legislación sectorial para nuevos empleados de atención y cumplimiento.
- Cumplimiento normativo (compliance): verificación asistida de políticas internas frente a las obligaciones de la LGPD y la Ley de Antenas, con trazabilidad de la cita normativa.
- Gestión de datos personales: respuesta a consultas sobre bases legales, derechos de los titulares y plazos de conservación según la LGPD, apoyándose en los fragmentos recuperados.
- Consultas sobre infraestructura de antenas: interpretación de la Ley de Antenas para equipos de despliegue de red y relaciones con administraciones locales.

## Benchmarks y rendimiento

Evaluación del autor con 60 preguntas fuera del conjunto de entrenamiento; juez: Mangaba Titan 122B.

| Metrica | Qwen3-8B sin busqueda | Qwen3-8B + busqueda | Mangaba Telecom 8B + busqueda |
|---|---|---|---|
| Respuesta correcta (nota 5 de contenido) | 0% | 50% | 78% |
| Correcta y con el articulo exacto | 0% | 35% | 75% |
| Cita el articulo correcto | 2% | 87% | 93% |
| Cita la norma correcta | 18% | 95% | 97% |
| Nota media de contenido (1-5) | 1,13 | 3,63 | 4,33 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación presentada es específica del dominio y fue realizada por el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre Qwen3-8B, los requisitos son los del modelo base (aproximadamente 16 GB en FP16, menos con cuantización, aunque no se documentan cuantizaciones del adaptador).
- GPU recomendadas: el autor entrenó en 2× NVIDIA L40S; para inferencia se recomienda una GPU con al menos 24 GB de VRAM para el modelo base en FP16.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) con el modelo base en FP16; en GPUs de 16 GB requeriría cuantización del base, no documentada para el adaptador.
- Opciones de despliegue: vLLM con soporte LoRA (`vllm serve Qwen/Qwen3-8B --enable-lora --max-lora-rank 32 --lora-modules telecom=mangaba-ai/Mangaba-Telecom-8B`). No se documentan otras opciones (llama.cpp, Ollama, TGI) para el adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mangaba Telecom 8B | 8B (LoRA sobre Qwen3-8B) | no disponible | Legislacion telecom Brasil (RAG) | Apache-2.0 | Gated (registro) |
| Qwen3-8B (base) | 8B | no disponible en la informacion | Proposito general | Apache-2.0 | Abierto en Hugging Face |
| Qwen3-8B + busqueda (sin adaptador) | 8B | no disponible | Proposito general con RAG | Apache-2.0 | Abierto en Hugging Face |

La comparación directa con otros adaptadores jurídicos brasileños no está disponible en la información proporcionada. El principal referente de comparación es el propio Qwen3-8B, sobre el que el adaptador mejora sustancialmente en citación exacta (93% frente a 87% con búsqueda) y en respuesta correcta (78% frente a 50%).

## Limitaciones y advertencias

- Dependencia crítica del retrieval: sin el fragmento correcto en la base de búsqueda, la calidad cae drásticamente, según advierte el propio autor.
- Cobertura normativa limitada: solo cubre cinco normas (LGT, Marco Civil, LGPD, Ley de Antenas, FUST) en su texto vigente a 19/10/2026; no incluye normativa infralegal ni jurisprudencia.
- Riesgo de alucinación: aunque el entrenamiento busca citar el artículo exacto, el modelo puede generar citas incorrectas si los fragmentos recuperados son ambiguos o incompletos.
- Idioma restringido al portugués de Brasil; no se documenta soporte multilingüe.
- No sustituye el parecer de un profesional jurídico; el propio autor lo indica explícitamente.
- Acceso restringido mediante formulario (gated model): requiere registro y aprobación por parte de Mangaba AI, con tratamiento de datos conforme a la LGPD.
- Sesgos: no documentados en la información disponible; al entrenarse sobre texto normativo brasileño, puede reflejar interpretaciones propias del corpus.
- Uso comercial: la licencia Apache-2.0 del adaptador lo permite, pero el acceso gated y las condiciones del formulario deben verificarse antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mangaba-ai/Mangaba-Telecom-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Embeddings bge-m3 (BAAI): https://huggingface.co/BAAI/bge-m3
- Reranker bge-reranker-v2-m3 (BAAI): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Texto vigente de las normas (Planalto): https://www.planalto.gov.br
- Repositorio vLLM (despliegue con LoRA): https://github.com/vllm-project/vllm
