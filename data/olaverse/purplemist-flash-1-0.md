# olaverse/PurpleMIST-Flash-1.0

## Resumen

PurpleMIST-Flash-1.0 es un modelo de decisión ("System One") desarrollado por olaverse. No genera texto: recibe un estado no estructurado (un mensaje, un ticket, un registro o una transcripción) junto con un conjunto de preguntas tipadas sobre ese estado y devuelve, en una sola pasada forward, una distribución de probabilidad calibrada para cada respuesta. Está construido específicamente para funcionar en inglés y en ocho lenguas africanas (yoruba, hausa, igbo, pidgin nigeriano, suajili, amárico, somalí y zulú).

Técnicamente es un fine-tuning con LoRA (rango 32, fusionado en los pesos) sobre el backbone de texto de Qwen/Qwen3.5-9B-Base, al que se le han eliminado la torre de visión y la cabeza de generación de lenguaje. Conserva 32 capas (24 de atención lineal Gated DeltaNet y 8 de atención completa), hidden size 4096 y 7.936.684.544 parámetros, a los que se añade una cabeza pointer de 8,4 millones de parámetros. La ventana de contexto es de 2.048 tokens por pasada, con división automática de las preguntas en varias pasadas si no caben junto al estado.

Su relevancia actual está en el nicho que ocupa: clasificación probabilística calibrada y multilingüe para lenguas africanas, un terreno con muy poca cobertura en modelos abiertos. El autor reporta una precisión de 0,668 en African Typed Decisions, prácticamente idéntica a la de DeepSeek-V4-Pro (0,669) pese a que este último tiene 1,6 billones de parámetros, y con distribuciones aproximadamente 5 veces más cercanas a la referencia. Los pesos se publican en safetensors bf16 (15,9 GB) bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 32 capas: 24 de atención lineal Gated DeltaNet y 8 de atención completa. Backbone de texto de Qwen3.5-9B-Base sin torre de visión ni cabeza de generación; cabeza pointer de 8,4 M de parámetros (proyecciones 4096 → 1024 y producto escalar con la línea de cada opción) |
| Parametros totales | 7.936.684.544 (~7,9 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens por pasada; las preguntas se reparten automáticamente en varias pasadas si no caben junto al estado |
| Tipos de cuantizacion | No disponible. Los pesos publicados están en bf16; no se documentan cuantizaciones GGUF, AWQ ni GPTQ |
| Idiomas soportados | en, yo, ha, ig, pcm, sw, am, so, zu (inglés, yoruba, hausa, igbo, pidgin nigeriano, suajili, amárico, somalí y zulú) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 (15,9 GB). El adaptador LoRA sin fusionar está disponible en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto de Qwen/Qwen3.5-9B-Base, una arquitectura híbrida de 32 capas en la que 24 capas usan atención lineal Gated DeltaNet y 8 usan atención completa, con hidden size de 4096. Sobre ese backbone se eliminan la torre de visión y la cabeza de generación de lenguaje, y se añade una cabeza pointer de 8,4 millones de parámetros: el logit de cada opción se calcula como un producto escalar escalado entre proyecciones (4096 → 1024) de la posición de respuesta y de la propia línea de texto de la opción. Esto permite que cada opción se puntúe desde su propio texto, de modo que el número de opciones es arbitrario y no tiene que fijarse de antemano. Todas las preguntas sobre un mismo estado comparten una única secuencia y se resuelven en una sola pasada.

El ajuste se realizó con LoRA de rango 32 aplicado a todas las capas lineales y posteriormente fusionado en los pesos (el adaptador sin fusionar se distribuye aparte). No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de las fuentes declaradas: olaverse/african-typed-decisions y LocalLLaMA/typed-decisions. La innovación destacable es la calibración: cada tipo de pregunta tiene su propia temperatura, ajustada sobre estados de validación procedentes de todas las fuentes de entrenamiento, lo que da lugar a un ECE de 0,049 en las lenguas africanas y 0,056 en inglés. Se documentan tres tipos de pregunta: `choice` (instrucciones y opciones nombradas con `criteria`), `noul` (afirmación de sí/no, devuelve p_yes) y `score` (instrucciones y niveles ordenados de menor a mayor, devuelve el nivel esperado y las probabilidades por nivel).

## Capacidades

- Clasificación probabilística calibrada: devuelve una distribución de probabilidad por respuesta, no una etiqueta seca, lo que permite umbrales de decisión, ordenación por confianza y abstención.
- Tres tipos de pregunta tipada en una misma llamada: `choice`, `noul` (sí/no) y `score` (nivel esperado sobre una escala ordenada).
- Múltiples preguntas por estado en una sola pasada, compartiendo la secuencia del estado.
- Opciones definidas en tiempo de inferencia: no exige un esquema fijo ni un conjunto cerrado de etiquetas; cada opción se puntúa desde su propio texto.
- Capacidad multilingüe en inglés y ocho lenguas africanas, con instrucciones y descripciones de opciones redactables en inglés o en el idioma del estado.
- Manejo de estados como cadena o como cualquier objeto serializable a JSON.
- Servicio HTTP local mediante `serve.py`, con forma de petición System One (`POST /v1/systemone`), además de `GET /health` y `GET /v1/models`.
- No genera texto, no mantiene conversación, no soporta tool calling ni function calling y no procesa visión ni audio. Es un componente de decisión, no un asistente.

## Casos de uso

- Triaje de tickets de soporte en mercados africanos: con una sola llamada se puede preguntar el equipo responsable (`choice`), si el cliente pide reembolso (`noul`) y la urgencia (`score`). El modelo está entrenado en las lenguas del estado, así que un ticket en yoruba o en pidgin nigeriano se clasifica sin traducir previamente.
- Enrutado de mensajes entrantes en atención al cliente multicanal (WhatsApp, chat web, correo): el estado es el propio mensaje y la pregunta `choice` define los criterios de enrutado (`billing`, `delivery`, `technical`), lo que permite dirigir cada conversación a la cola correcta sin un clasificador por idioma.
- Detección de intención de reembolso o de disputa de cargo en banca y comercio electrónico: la pregunta `noul` sobre "el cliente pide que se le devuelva el dinero" da una probabilidad calibrada que se puede usar directamente como regla de negocio con umbral.
- Priorización de colas en back-office (seguros, banca, logística): la pregunta `score` sobre una escala ordenada de urgencia devuelve el nivel esperado y la distribución, útil para ordenar una cola de trabajo en lugar de limitarse a etiquetas binarias.
- Anotación asistida y active learning sobre corpus en lenguas africanas: al devolver distribuciones calibradas, el equipo de etiquetado puede revisar primero los ejemplos con mayor entropía y reutilizar las predicciones de alta confianza como preetiquetado.
- Moderación y clasificación de riesgo de contenido: combinación de preguntas `noul` (por ejemplo, "el mensaje contiene una amenaza") y `score` (gravedad) sobre transcripciones o mensajes, con la calibración como garantía para fijar umbrales auditables.
- Enrutado dentro de pipelines de agentes como paso rápido de decisión: dado un estado y varias preguntas tipadas, el modelo resuelve en una pasada la elección de herramienta o de siguiente paso, delegando la parte generativa en un modelo aparte.
- Procesamiento por lotes de encuestas o formularios abiertos: la pregunta `score` sobre textos libres permite convertir respuestas cualitativas en una escala ordinal con probabilidades asociadas, apta para agregación estadística.
- Análisis de calidad de soporte a partir de transcripciones largas: el modelo reparte automáticamente las preguntas en varias pasadas sobre el mismo estado cuando exceden los 2.048 tokens, de modo que una transcripción extensa se puede evaluar con un conjunto amplio de criterios.

## Benchmarks y rendimiento

| Benchmark | Metrica | PurpleMIST-Flash-1.0 | Referencia comparada |
|---|---|---|---|
| African Typed Decisions (8 idiomas) | Precisión | 0,668 | DeepSeek-V4-Pro: 0,669 (1,6 T de parámetros) |
| African Typed Decisions (8 idiomas) | KL | 0,214 | DeepSeek-V4-Pro: 1,125 |
| African Typed Decisions (8 idiomas) | Brier | 0,115 | DeepSeek-V4-Pro: 0,199 |
| African Typed Decisions (8 idiomas) | ECE | 0,049 | No disponible |
| Caída de precisión de inglés a las 8 lenguas africanas | Delta de precisión | -0,053 | OpenDecider-small: -0,171 |
| LocalLLaMA/typed-decisions (zero-shot en inglés) | Precisión | 0,720 | 4.º puesto en precisión entre los modelos zero-shot listados |
| LocalLLaMA/typed-decisions (zero-shot en inglés) | KL | 0,189 | 2.º puesto en KL entre los modelos zero-shot listados |
| LocalLLaMA/typed-decisions (zero-shot en inglés) | Brier | 0,098 | 2.º puesto en Brier entre los modelos zero-shot listados |
| LocalLLaMA/typed-decisions (zero-shot en inglés) | ECE | 0,056 | No disponible |

No se han publicado en la información disponible resultados en benchmarks generales de lenguaje (MMLU, HumanEval, GSM8K y similares); el modelo es un clasificador y no se evalúa en tareas generativas.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan 15,9 GB, por lo que con activaciones y cachés se necesita aproximadamente una GPU de 24 GB para inferencia en bf16. La propia model card indica que una GPU de 24 GB es suficiente.
- GPU recomendadas: tarjetas de 24 GB o más, como RTX 3090, RTX 4090, L40S, A100 (40/80 GB), H100 o RTX 5090 (32 GB). En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) no cabe en bf16 tal cual.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y RTX 5090 en bf16. No se documentan cuantizaciones que permitan bajarlo a GPUs de 8-16 GB.
- Opciones de despliegue: Transformers (se requiere transformers >= 5.19) con el módulo `purplemist.py` (`Decider.from_pretrained`), y servidor HTTP local propio mediante `serve.py` con endpoint `POST /v1/systemone`, más `GET /health` y `GET /v1/models`. Se pueden instalar `flash-linear-attention` y `causal-conv1d` como kernels opcionales para acelerar las capas de atención lineal. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, algo esperable dada la arquitectura híbrida y la cabeza pointer personalizadas.
- Latencia y throughput: no disponible. La respuesta del servidor incluye un campo `latency_ms`, pero no se publican cifras de referencia. El diseño de una sola pasada por estado y la compartición de secuencia entre preguntas reducen el coste frente a plantear cada pregunta como una generación independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión en African Typed Decisions | KL | Brier | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| PurpleMIST-Flash-1.0 | ~7,9 B | 2.048 tokens por pasada | 0,668 | 0,214 | 0,115 | Apache 2.0 | HuggingFace (olaverse) |
| DeepSeek-V4-Pro | 1,6 T | No disponible | 0,669 | 1,125 | 0,199 | No disponible | No disponible |
| OpenDecider-small | No disponible | No disponible | No disponible (caída de 0,171 de inglés a lenguas africanas) | No disponible | No disponible | No disponible | No disponible |
| PurpleMIST-Mini-1.0 | 1,9 B | No disponible | No disponible (pensado para cargas en inglés, misma interfaz) | No disponible | No disponible | No disponible | HuggingFace (olaverse) |

El punto diferencial frente a DeepSeek-V4-Pro es la relación entre tamaño y calibración: con unos 200 veces menos parámetros iguala la precisión y mejora notablemente las distribuciones (KL 0,214 frente a 1,125; Brier 0,115 frente a 0,199). Frente a PurpleMIST-Mini-1.0, el modelo principal aporta cobertura multilingüe africana y mayor tamaño, mientras que el mini está orientado a cargas en inglés.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones. No soporta tool calling, function calling ni razonamiento multi-paso encadenado por sí mismo.
- Riesgo de alucinación acotado pero real: al emitir una distribución de probabilidad, el modo de fallo típico es una asignación de alta confianza a la opción equivocada, no una invención de texto. La calibración reportada (ECE 0,049-0,056) es agregada y no garantiza buen comportamiento en dominios fuera de la distribución de entrenamiento.
- La ventana de contexto es de solo 2.048 tokens por pasada. Estados más largos obligan a dividir las preguntas en varias pasadas; no se documenta cómo se manejan estados que por sí solos excedan ese límite.
- Cobertura lingüística limitada a nueve idiomas (inglés más ocho lenguas africanas). No hay soporte declarado para castellano ni para otras lenguas europeas o asiáticas.
- Ligera pérdida de precisión fuera del inglés: -0,053 al pasar a las ocho lenguas africanas, muy inferior a la de OpenDecider-small (-0,171) pero no nula.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, dialectal o de género en la información disponible. Al entrenarse sobre datos de decisiones tipadas, puede heredar sesgos de anotación de esas fuentes.
- Licencia Apache 2.0, por lo que el uso comercial está permitido sin restricciones adicionales conocidas. Conviene verificar igualmente los términos del modelo base Qwen/Qwen3.5-9B-Base de forma independiente.
- Adopción incipiente: el repositorio registra 0 descargas y 0 "likes" en la información disponible, con fecha de creación en octubre de 2026 y última actualización dos días después. No hay un ecosistema de terceros ni integraciones estándar (vLLM, llama.cpp, Ollama, TGI) documentadas.
- Dependencia de una versión muy concreta de la librería: se exige transformers >= 5.19 y el uso de un módulo propio (`purplemist.py`) descargado del repositorio, lo que complica el empaquetado y la reproducibilidad si el repositorio cambia.
- No se documenta el proceso de tokenización por idioma ni las tasas de error específicas por lengua, solo el agregado de las ocho.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olaverse/PurpleMIST-Flash-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Modelo hermano (versión mini, 1,9 B): https://huggingface.co/olaverse/PurpleMIST-Mini-1.0
- Dataset de evaluación en lenguas africanas: https://huggingface.co/datasets/olaverse/african-typed-decisions
- Dataset de evaluación en inglés: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
