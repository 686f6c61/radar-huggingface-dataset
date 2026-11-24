# olaverse/PurpleMIST-Flash-1.0

## Resumen

PurpleMIST-Flash-1.0 es un modelo de decisión de tipo "System One" desarrollado por olaverse. No genera texto: recibe un estado no estructurado (un mensaje, ticket, registro o transcripción) junto con un conjunto de preguntas tipadas y devuelve, en una sola pasada forward, una distribución de probabilidad calibrada para cada respuesta. Está construido sobre el backbone de texto de Qwen/Qwen3.5-9B-Base, con la torre de visión y la cabeza de lenguaje eliminadas, y una cabeza pointer específica para puntuar opciones.

El modelo tiene aproximadamente 7.936 millones de parámetros (7,9B) y una ventana de contexto de hasta 65.536 tokens por pasada. Su rasgo diferencial es el soporte nativo de ocho idiomas africanos (yoruba, hausa, igbo, nigeriano pidgin, suajili, amárico, somalí y zulú) además del inglés, con una degradación de precisión muy contenida al pasar del inglés a esos idiomas. La licencia es Apache 2.0.

Es relevante porque propone un paradigma distinto al de los LLM generativos: en lugar de producir texto que luego hay que parsear, devuelve directamente decisiones con probabilidades calibradas, lo que simplifica el encaje en pipelines de clasificación, enrutado y triaje. Según la model card, iguala en precisión a DeepSeek-V4-Pro (un modelo de 1,6T de parámetros) en el benchmark African Typed Decisions, con distribuciones aproximadamente 5 veces más cercanas a la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (24 capas Gated DeltaNet de atención lineal + 8 capas de atención completa), cabeza pointer |
| Parametros totales | 7.936.684.544 (~7,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 65.536 tokens por pasada (2.048 por defecto en `Decider`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, yo, ha, ig, pcm, sw, am, so, zu |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, 15,9 GB); adaptador LoRA sin fusionar en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto de Qwen3.5-9B-Base, al que se le retiran la torre de visión y la cabeza de modelado de lenguaje. Conserva 32 capas (24 de atención lineal Gated DeltaNet y 8 de atención completa), con tamaño oculto de 4096. Sobre ese backbone se añade una cabeza pointer de 8,4M de parámetros: el logit de cada opción se calcula como producto escalar entre proyecciones (4096 → 1024) de la posición de respuesta y la línea de texto de la propia opción. Esto permite puntuar cualquier número de opciones sin fijarlas de antemano y sin generación autoregresiva.

El ajuste se realizó con LoRA de rango 32 en todas las capas lineales, fusionado posteriormente en los pesos (el adaptador sin fusionar se distribuye aparte). Los datos de entrenamiento provienen de los datasets `olaverse/african-typed-decisions` y `LocalLLaMA/typed-decisions`, aunque la model card no detalla el número exacto de tokens ni la composición completa del corpus. Cada tipo de pregunta tiene su propia temperatura de calibración, ajustada sobre estados de validación de todas las fuentes de entrenamiento, lo que produce valores de ECE de 0,049 en idiomas africanos y 0,056 en inglés.

## Capacidades

- Clasificación probabilística tipada con tres tipos de pregunta: `choice` (opciones nombradas con criterios), `noul` (afirmación sí/no con probabilidad de "sí") y `score` (niveles ordenados con nivel esperado y distribución).
- Salida calibrada: distribuciones de probabilidad con temperatura por tipo de pregunta, aptas para umbrales y toma de decisiones automatizada.
- Procesamiento de múltiples preguntas sobre un mismo estado en una sola pasada, compartiendo la secuencia.
- Soporte de opciones arbitrarias y no fijadas de antemano, gracias a la cabeza pointer que puntúa el texto de cada opción.
- Multilingüe en inglés y ocho idiomas africanos (yoruba, hausa, igbo, nigeriano pidgin, suajili, amárico, somalí y zulú).
- Manejo de entradas largas: hasta 65.536 tokens por pasada, con división automática en varias pasadas cuando las preguntas no caben junto al estado.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso generativo: es un modelo de decisión, no un LLM conversacional.

## Casos de uso

- Enrutado de tickets de soporte: dado un mensaje de cliente, el modelo devuelve la probabilidad de que corresponda a facturación, entrega o soporte técnico, lo que permite asignar colas automáticamente con umbrales calibrados.
- Detección de fraude y scams en SMS o mensajería: con una pregunta `noul` ("¿el mensaje solicita datos sensibles o pago urgente?") se obtiene una probabilidad directamente utilizable para bloquear o marcar el mensaje.
- Triaje de urgencia en atención al cliente: mediante una pregunta `score` con niveles ordenados, se prioriza la cola de trabajo según la urgencia estimada.
- Procesamiento de reclamaciones de dinero móvil y pagos en mercados africanos: el modelo está entrenado para mensajes en yoruba, hausa, suajili, pidgin y amárico, lo que permite clasificar reclamaciones y solicitudes de reembolso en el idioma del usuario sin traducción previa.
- Moderación de contenido y clasificación de intención en comunidades multilingües: al devolver distribuciones calibradas, se puede ajustar el umbral según la tolerancia a falsos positivos de cada canal.
- Extracción de decisiones en pipelines de datos: sobre registros o transcripciones largas (hasta 65.536 tokens), se pueden lanzar varias preguntas tipadas en una sola pasada para etiquetar y enrutar cada registro.
- Evaluación y anotación asistida: las probabilidades calibradas sirven como señal de confianza para revisión humana, priorizando los casos con mayor incertidumbre.

## Benchmarks y rendimiento

Datos publicados en la model card:

| Benchmark | Metrica | PurpleMIST-Flash-1.0 | Referencia |
|---|---|---|---|
| African Typed Decisions (8 idiomas) | Accuracy | 0,668 | DeepSeek-V4-Pro (1,6T): 0,669 |
| African Typed Decisions (8 idiomas) | KL | 0,214 | DeepSeek-V4-Pro: 1,125 |
| African Typed Decisions (8 idiomas) | Brier | 0,115 | DeepSeek-V4-Pro: 0,199 |
| LocalLLaMA/typed-decisions (zero-shot, inglés) | Accuracy | 0,720 | 4.º en accuracy entre los modelos zero-shot listados |
| LocalLLaMA/typed-decisions (zero-shot, inglés) | KL | 0,189 | 2.º en KL |
| LocalLLaMA/typed-decisions (zero-shot, inglés) | Brier | 0,098 | 2.º en Brier |
| African Typed Decisions | Caída de accuracy inglés → 8 idiomas africanos | 0,053 | OpenDecider-small: 0,171 |
| African Typed Decisions | ECE | 0,049 | — |
| LocalLLaMA/typed-decisions | ECE | 0,056 | — |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB para los pesos (15,9 GB), por lo que una GPU de 24 GB es suficiente según la model card.
- GPU recomendadas: cualquier GPU con 24 GB o más (RTX 4090, A100, H100). Para contextos largos de hasta 65.536 tokens, la memoria de activaciones crece y conviene disponer de más VRAM.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (por ejemplo, RTX 4090) con la configuración por defecto de 2.048 tokens de contexto; para entradas largas se recomienda reducir el lote o usar GPUs de mayor memoria.
- Opciones de despliegue: la librería `transformers` (>= 5.19) con el script `purplemist.py` del repositorio; opcionalmente `flash-linear-attention` y `causal-conv1d` para kernels rápidos de las capas de atención lineal. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La model card menciona que respondió las 140.620 peticiones del Jev Decision Index sin truncamiento, pero no aporta cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (African Typed Decisions) | KL | Licencia |
|---|---|---|---|---|---|
| PurpleMIST-Flash-1.0 | ~7,9B | 65.536 | 0,668 | 0,214 | Apache 2.0 |
| DeepSeek-V4-Pro | ~1,6T | no disponible | 0,669 | 1,125 | no disponible |
| OpenDecider-small | no disponible | no disponible | caída de 0,171 respecto al inglés | no disponible | no disponible |
| PurpleMIST-Mini-1.0 | 1,9B | no disponible | no disponible (orientado a inglés) | no disponible | no disponible |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de benchmarks de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de decisión, no generativo: no produce texto libre ni mantiene conversaciones; cualquier caso de uso conversacional requiere otro modelo.
- Riesgo de alucinación en el sentido de asignar probabilidad alta a opciones incorrectas cuando el estado de entrada es ambiguo o está fuera de la distribución de entrenamiento; la calibración mitiga pero no elimina este riesgo.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el entrenamiento se centra en ocho idiomas africanos y en inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- Limitación de idioma: fuera de los idiomas listados (en, yo, ha, ig, pcm, sw, am, so, zu) no hay evidencia de calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B-Base y de los datasets de entrenamiento antes de desplegar en producción.
- En producción, el contexto por defecto de 2.048 tokens puede truncar estados largos si no se ajusta `max_len=65536`; hay que configurarlo explícitamente.
- No se documentan cuantizaciones oficiales ni soporte en runtimes de inferencia estándar más allá de `transformers`, lo que puede complicar el despliegue en infraestructuras ya estandarizadas en vLLM o TGI.
- Las temperaturas de calibración son específicas por tipo de pregunta y se ajustaron sobre las fuentes de entrenamiento; en dominios muy distintos la calibración puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/PurpleMIST-Flash-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Dataset African Typed Decisions: https://huggingface.co/datasets/olaverse/african-typed-decisions
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Modelo hermano PurpleMIST-Mini-1.0: https://huggingface.co/olaverse/PurpleMIST-Mini-1.0
- Vídeo demo en inglés: https://huggingface.co/olaverse/PurpleMIST-Flash-1.0/resolve/main/assets/purplemist_english_game.mp4
- Vídeo demo en idiomas africanos: https://huggingface.co/olaverse/PurpleMIST-Flash-1.0/resolve/main/assets/purplemist_african.mp4
