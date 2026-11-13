# blackmallangcow/nari-decision-9b

## Resumen

nari-decision-9b es un modelo de decisión (decision model) desarrollado por blackmallangcow, afinado a partir de Qwen/Qwen3.5-9B. No es un modelo generativo al uso: recibe un estado (una conversación, un documento, el resultado de una herramienta) y un conjunto de preguntas tipadas (sí/no, elección única u ordinal) y devuelve, en un único forward pass, una probabilidad calibrada para cada opción, sin generar texto. Está orientado a tareas de enrutamiento, guardarraíles, evaluación de relevancia en RAG, ramificación de agentes y etiquetado de datos.

El modelo tiene 7.949.303.298 parámetros (unos 7,95 mil millones) y un contexto de 16.384 tokens, con soporte para coreano e inglés. Su principal diferenciador es la eficiencia: responde todas las preguntas sobre un mismo estado en una sola pasada, con una latencia de 42 ms por petición en una A100 80GB PCIe (batch 1, con `enable_cuda_graphs()`), frente a los 73 ms de clef-flash y los 141 ms de JEV-9B. Además, la confianza está calibrada por tipo de pregunta, lo que permite derivar los casos de baja certeza a un humano o a un modelo mayor (selective prediction).

La relevancia actual del modelo radica en que cubre un hueco poco atendido: la clasificación y decisión rápida y calibrada dentro de pipelines de agentes, donde generar texto es caro e innecesario. Su licencia Apache 2.0 y su compatibilidad con `transformers` facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B) con cabeza de decisión entrenada |
| Parametros totales | 7.949.303.298 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (el estado se trunca por el medio si se excede; preguntas y opciones nunca se truncan) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-9B y añade una cabeza de decisión entrenada específicamente para producir probabilidades sobre opciones tipadas. En cada forward pass se leen dos respuestas por pregunta: la de la cabeza de decisión entrenada y la letra que el propio backbone selecciona; ambas se promedian y después se calibran. La calibración emplea una temperatura distinta por tipo de pregunta, ajustada sobre una partición de calibración separada, lo que da lugar a un ECE en held-out de 0,016 y de 0,062 en el conjunto de evaluación. Las preguntas con más de 26 opciones usan únicamente la cabeza de decisión.

El entrenamiento se apoya en una mezcla amplia de datasets que cubren NLI, QA, razonamiento, código, diálogo, recuperación multilingüe, seguridad de contenido y sesgos, entre otros: KLUE, KorNLI, KorQuAD (songys/kor_qpair), KoBEST, MASSIVE y MASSIVE-Agents, SIB-200, MIRACL y NoMIRACL, MKQA, PAWS y PAWS-X, BoolQ, Social IQa, QASC, Winogrande, CommonsenseQA, HotpotQA, SQuAD v2, GSM8K, AQuA-RAT, MBPP, Taskmaster3, CLINC OOS, SHARC, FaithDial, BLiMP, Civil Comments, Aegis AI Content Safety, HelpSteer2, VitaminC, KMHas y Korean Hate Speech. No se detalla en la información disponible el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

Una innovación técnica destacable es la capacidad de responder varias preguntas sobre el mismo estado en una sola pasada, con un coste que crece poco al aumentar el número de preguntas o la longitud del estado (de 30 a 59 ms entre peticiones simples y complejas). También soporta `enable_cuda_graphs()` para acelerar la inferencia en GPU y depende opcionalmente de `flash-linear-attention` y `causal-conv1d` para mejorar el rendimiento.

## Capacidades

- Clasificación y decisión tipada: preguntas de sí/no (`noul`), elección única (`choice`) y escala ordinal (`score`), con probabilidad calibrada por opción.
- Respuesta en un único forward pass sin generación de texto, lo que reduce latencia y coste.
- Lectura de instrucciones, incluidas las negaciones: en 1.000 pares de KLUE-NLI held-out con instrucciones no vistas en entrenamiento, acierta ambas formulaciones (afirmativa y negativa) en el 99,1 % de los pares.
- Predicción selectiva: la confianza calibrada permite derivar casos de baja certeza a un humano o a un modelo mayor.
- Soporte multilingüe coreano-inglés, tanto en instrucciones como en estados.
- Lectura de estados en texto plano o JSON (conversaciones, documentos, resultados de herramientas).
- Exposición de las rutas internas (`paths`): probabilidades de la cabeza de decisión y de la letra del backbone antes del promediado y la calibración.
- No se documenta soporte de tool calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una conversación de cliente, el modelo decide en una sola pasada si es una solicitud de reembolso, a qué equipo corresponde (facturación, envío, cuenta) y su urgencia en escala ordinal, con probabilidades calibradas para derivar los casos dudosos a un agente humano.
- Guardarraíles de contenido: evaluar si una salida o una entrada debe bloquearse o revisarse, usando las probabilidades calibradas para fijar umbrales de bloqueo y de revisión humana.
- Filtro de relevancia en RAG: determinar si un fragmento recuperado responde realmente a la consulta del usuario antes de pasarlo al modelo generador, reduciendo alucinaciones y coste de contexto.
- Ramificación de agentes: decidir si un agente debe llamar a una herramienta, pedir aclaración o responder directamente, con baja latencia (42 ms por petición) adecuada para bucles de agente.
- Etiquetado y anotación de datos a escala: clasificar grandes volúmenes de pares pregunta-respuesta o pares de frases (NLI, paráfrasis, QA) con confianza calibrada, derivando a revisión humana los casos de ECE alto.
- Moderación multilingüe coreano-inglés: detectar discurso de odio o contenido inseguro en coreano e inglés usando la escala ordinal de severidad y las probabilidades por opción.
- Evaluación de calidad de diálogo: puntuar la fidelidad o coherencia de una respuesta de un asistente conversacional frente a su contexto, en una sola pasada y con varias preguntas simultáneas.

## Benchmarks y rendimiento

Los datos publicados en la model card (precisión en % tras calibración por temperatura, mismas preguntas para todos los modelos):

| Modelo | Tamano | Held-out ko | Held-out en | Eval set ko | Eval set en | ms / peticion |
|---|---|---:|---:|---:|---:|---:|
| **nari-decision-9b** (este modelo) | 9B | **86,8** | **86,3** | **82,9** | **75,6** | 42 |
| clef-flash (9B) | 9B | 75,2 | 69,8 | 73,8 | 71,8 | 73 |
| JEV-9B | 9B | 67,3 | 53,2 | 76,0 | 67,3 | 141 |
| laya-multilingual | 322M | 51,0 | 49,9 | 36,4 | 30,1 | 23 |
| laya (English) | 395M | — | 52,1 | — | 36,5 | 30 |
| nari-decision-4b (v3.2) | 4B | 85,9 | 85,3 | 82,1 | 76,9 | 32 |

Latencia medida en una NVIDIA A100 80GB PCIe, batch 1, media de 5 peticiones; para este modelo con `enable_cuda_graphs()` (62 ms sin él). En held-out, JEV-9B omite preguntas con más opciones de las que puede aceptar. Calibración: ECE 0,016 en held-out y 0,062 en el conjunto de evaluación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7,95 mil millones de parámetros, en fp16 se requieren aproximadamente 16 GB de pesos más overhead, y en cuantizaciones de 8 o 4 bits bajaría a rangos de 8-10 GB y 5-6 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: NVIDIA A100 80GB PCIe es la referencia de las mediciones publicadas; por tamaño, cabría en H100, L40S y A10G con margen.
- GPU de consumo: no confirmado; por tamaño, una RTX 4090 (24 GB) podría alojar el modelo en fp16 o cuantizado, pero no hay datos de rendimiento publicados en esa configuración.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y soporte reciente de Qwen3.5; `enable_cuda_graphs()` para acelerar en GPU; `flash-linear-attention` y `causal-conv1d` opcionales. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 42 ms por petición en A100 80GB PCIe con CUDA graphs (62 ms sin ellas), batch 1, media de 5 peticiones; de 30 a 59 ms según complejidad de la petición. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Held-out ko / en | Latencia (ms) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nari-decision-9b | 7,95B | 16.384 | 86,8 / 86,3 | 42 | Apache 2.0 | Hugging Face |
| clef-flash (9B) | 9B | no disponible | 75,2 / 69,8 | 73 | no disponible | no disponible |
| JEV-9B | 9B | no disponible | 67,3 / 53,2 | 141 | no disponible | no disponible |
| nari-decision-4b (v3.2) | 4B | no disponible | 85,9 / 85,3 | 32 | no disponible | no disponible |
| laya-multilingual | 322M | no disponible | 51,0 / 49,9 | 23 | no disponible | no disponible |

La comparativa se limita a los modelos incluidos en la model card; no se dispone de información sobre contexto, licencia ni disponibilidad de los competidores más allá de lo indicado.

## Limitaciones y advertencias

- Modelo especializado en decisión y clasificación: no está pensado para generación de texto libre; su uso como generador no está documentado.
- Idiomas limitados a coreano e inglés; el rendimiento en otros idiomas no está evaluado.
- Contexto máximo de 16.384 tokens; si el estado y las preguntas lo exceden, el estado se trunca por el medio (conservando el primer cuarto y los últimos tres cuartos del espacio disponible), lo que puede eliminar información relevante. El flag `truncated` lo indica.
- Riesgo de alucinación no documentado explícitamente, pero al ser un modelo de clasificación con probabilidades, la incertidumbre se refleja en la confianza; se recomienda usar umbrales de derivación y no tratar las salidas como verdad absoluta.
- ECE en el conjunto de evaluación de 0,062, superior al 0,016 de held-out: la calibración es peor fuera de la distribución de calibración, lo que exige recalibrar o validar con datos propios antes de producción.
- Sesgos: el entrenamiento incluye datasets de sesgo y contenido sensible (Civil Comments, KMHas, Korean Hate Speech, Aegis), pero no se documenta una evaluación de sesgos del modelo resultante.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que conviene revisar.
- Requiere `trust_remote_code=True` y una versión reciente de `transformers` con soporte de Qwen3.5; la compatibilidad con versiones antiguas no está garantizada.
- Sin descargas ni likes en el momento de la consulta, y creado en noviembre de 2026: ecosistema y validación externa muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/blackmallangcow/nari-decision-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
