# Gowthamshivanand/gowtham-nimbuspay-agent

## Resumen

`gowtham-nimbuspay-agent` es un ajuste fino por LoRA del modelo denso Qwen2.5-1.5B-Instruct (1.543.714.304 parámetros), desarrollado por Gowtham S como caso de estudio personal. No es un chatbot general: está entrenado para una única tarea dentro de la demo "NimbusPay Adoption Insights Agent", un agente analítico con herramientas de solo lectura y gobernanza previa por código. El modelo hace tres cosas: enrutar una pregunta (con el rol del usuario y una pregunta previa opcional) a una de las herramientas del catálogo devolviendo una línea de JSON con el formato `{"tool": ..., "args": {...}}`; rechazar peticiones no permitidas con `{"tool": "refuse", ...}` y un motivo tipificado; y redactar la respuesta final a partir del resultado de la herramienta, sin introducir cifras nuevas.

Su relevancia es acotada pero instructiva: demuestra que un modelo de 1,5 B parámetros, ajustado con datos sintéticos y ejecutado en local con Ollama sobre un GGUF q8_0, puede sustituir total o parcialmente a un motor de reglas determinista en tareas de enrutado con esquema JSON estricto. En el conjunto de evaluación held-out de 1.025 filas, el modelo alcanza un 90,1 % de precisión de herramienta frente al 42,1 % del motor de reglas del propio demo, con 7 rutas inseguras y 36 rechazos excesivos.

El modelo se publica bajo licencia Apache 2.0, heredada de Qwen2.5-1.5B-Instruct, únicamente en inglés y con un único archivo GGUF q8_0 (1.646.572.672 bytes) más la plantilla y los parámetros de Ollama. "NimbusPay" es una empresa ficticia del caso HashedIn by Deloitte Campus PM Hiring 2026 y el modelo no ha visto datos reales de ninguna compañía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso; ajuste fino LoRA (bf16) fusionado en el modelo base Qwen2.5-1.5B-Instruct. El detalle de capas, cabezas y atención del modelo base no se recoge en la model card |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 2.048 tokens configurados en el despliegue de referencia (`num_ctx 2048` en Ollama y `-c 2048` en llama.cpp). La longitud de contexto nativa del modelo base no se indica en la información disponible |
| Tipos de cuantizacion | GGUF q8_0 (única publicada). Otras cuantizaciones: no disponible |
| Idiomas soportados | Inglés únicamente |
| Licencia | Apache 2.0 (enlace a la licencia del modelo base en la model card) |
| Formato de pesos | safetensors (pesos con el LoRA fusionado) y GGUF (`gowtham-nimbuspay-agent-q8_0.gguf`) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct (Apache 2.0) |
| Metodo de ajuste | LoRA en bf16, no QLoRA; fusión en el base y exportación a GGUF |
| Tamano del repositorio | 1,6 GB |
| Fichero GGUF | 1.646.572.672 bytes, SHA-256 `a56c2e4a8a9c9a3951e59be11fe8958bc0c2576224a09ad72f374a5c1064a5e9` |
| Nombre en Ollama | `gowtham-nimbuspay-agent` |
| Ejecucion de entrenamiento | Run 3 (`1.5b-20261019-131131`), Modal A100-80GB, 19 de octubre de 2026 |
| Parametros de inferencia recomendados | `temperature 0`, `repeat_penalty 1`, `stop <|im_end|>`, `num_ctx 2048` |
| Fecha de publicacion | 2026-10-19 (última actualización el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder denso de 1,54 B parámetros publicado por Alibaba bajo Apache 2.0. Sobre él se aplicó un ajuste fino supervisado con LoRA en bf16 (no QLoRA), que después se fusionó en los pesos del modelo base y se exportó a GGUF en cuantización q8_0. El entrenamiento se ejecutó en una A100-80GB en Modal el 19 de octubre de 2026 (Run 3 de la serie). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros ni si hubo etapas de RLHF o DPO; la model card solo indica que los datos son exclusivamente sintéticos.

La innovación aquí no es arquitectónica sino de diseño de tarea: el modelo está entrenado para emitir una única línea de JSON con una herramienta y sus argumentos, o una negativa con un motivo de un conjunto cerrado (`write`, `pii`, `individual`, `small_group`, `scope`, `forecast`, `causal`, `ungoverned`, `injection`, `gaming`, `harmful`). El formato de prompt es fijo: un system prompt que enumera herramientas y motivos de rechazo, seguido de un turno de usuario con la estructura `Role: ...` / `Previous question: ...` / `Question: ...`. Fuera de ese formato el comportamiento del modelo no es el evaluado.

El sistema completo combina el modelo con guardas de código que se ejecutan antes de la inferencia, validación del esquema JSON y de los argumentos, y una comprobación posterior de que cada número de la respuesta aparece en el resultado de la herramienta. En el modo `FT_MODE=hybrid`, el motor de reglas responde primero y el modelo solo interviene cuando las reglas no tienen una coincidencia con confianza suficiente; si algo falla, la aplicación cae de vuelta al motor determinista.

## Capacidades

- Enrutado de intención a herramienta: devuelve `{"tool": ..., "args": {...}}` con una sola herramienta del catálogo gobernado de la demo.
- Extracción de argumentos condicionada por el rol del usuario y por una pregunta previa opcional, lo que permite resolver referencias conversacionales de un turno.
- Rechazo tipificado de peticiones no permitidas mediante `{"tool": "refuse", "args": {"reason": ...}}`, con once motivos predefinidos que cubren escritura, PII, datos individuales, grupos pequeños, alcance, previsiones, causalidad, peticiones no gobernadas, inyección de prompt, gaming y contenido dañino.
- Redacción de respuestas ancladas al resultado de la herramienta, con la restricción explícita de no introducir cifras que no estén ya presentes en dicho resultado.
- Salida en JSON de una línea, validable por esquema aguas abajo.
- Multilingüe: no disponible. El modelo es solo inglés y está fuera de alcance cualquier otro idioma.
- Tool calling genérico, agentes multi-paso, matemáticas, código, visión o audio: no disponible. El modelo no está entrenado ni evaluado para ello.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Enrutado de preguntas a herramientas gobernadas en asistentes analíticos internos: el modelo recibe el rol del usuario y la pregunta, y emite la herramienta y los argumentos en JSON. Es adecuado porque el esquema de salida es de una sola línea y se valida con código antes de ejecutar nada.
- Capa de rechazo semántico previa a herramientas sensibles: preguntas que piden datos personales, escritura, previsiones o relaciones causales se contestan con `refuse` y un motivo tipificado, lo que permite auditar y clasificar las negativas. En la evaluación held-out logra una exhaustividad de rechazo del 96,8 % con una precisión del 86,3 %.
- Redacción de respuestas ancladas a resultados de herramientas (grounded summarization): a partir del JSON devuelto por una herramienta de solo lectura, el modelo compone el texto para personas no técnicas (ejecutivo, responsable regional, ingeniero de plataforma, responsable de operaciones de fraude, finanzas) sin recalcular cifras.
- Enrutador barato delante de un modelo mayor: al ocupar menos de 2 GB en q8_0 y ejecutarse con temperatura 0, puede clasificar la intención y delegar en un LLM de mayor tamaño solo los casos que requieran generación abierta.
- Despliegue local en portátil sin GPU: el GGUF q8_0 de 1,65 GB cabe en memoria y se sirve con Ollama o llama.cpp con contexto de 2.048 tokens, lo que permite demos y pruebas de integración sin infraestructura.
- Clasificación de intención y extracción de argumentos en pipelines de datos: la misma salida JSON puede alimentar un orquestador que decida qué consulta de solo lectura lanzar, con validación estricta de argumentos antes de ejecutar.
- Base para experimentos de ajuste fino con LoRA sobre modelos pequeños: el repositorio documenta el método (LoRA bf16 fusionado, exportación a GGUF), el prompt de entrenamiento y los informes de evaluación, lo que sirve como plantilla reproducible para tareas de enrutado con datos sintéticos.
- Material docente sobre gobernanza de agentes: el caso muestra cómo separar guardas de código, modelo y motor de reglas, y cómo medir rutas inseguras, rechazos excesivos y JSON inválido en lugar de evaluar solo la precisión global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MATH) en la información disponible. Las únicas métricas publicadas son específicas de la tarea del demo y se midieron sobre el GGUF q8_0 ejecutado en Ollama, no sobre los pesos de HuggingFace.

Puerta de liberación, 136 preguntas en total (21 golden, 29 probes, 64 unscripted, 22 break-it):

| Modo | Golden | Probes | Unscripted | Break-it | Respuestas inseguras | Resultado |
|---|---|---|---|---|---|---|
| Pure (el modelo enruta todo lo que las guardas no capturan) | 21/21 | 29/29 | 64/64 | 22/22 | 0 | PASS |
| Hybrid (el motor de reglas responde primero) | 21/21 | 29/29 | 64/64 | 22/22 | 0 | PASS |
| Motor de reglas solo | 21/21 | 29/29 | 64/64 | 22/22 | 0 | PASS |

Enrutado sobre datos held-out (GGUF q8_0 en Ollama):

| Conjunto | Filas | Precisión de herramienta | Exacto (herramienta + argumentos) | Precisión / exhaustividad de rechazo | Rutas inseguras | Rechazos excesivos | JSON inválido |
|---|---|---|---|---|---|---|---|
| Held-out test, solo modelo | 1.025 | 90,1 % | 88,8 % | 86,3 % / 96,8 % | 7 | 36 | 8 |
| Fraseo nuevo, solo modelo | 194 | 88,7 % | 87,1 % | n/a / 100,0 % | 0 | 10 | 8 |
| Held-out test, híbrido | 1.025 | 68,2 % | 66,9 % | 89,8 % / 69,6 % | 77 | 18 | 3 |
| Held-out test, solo motor de reglas | 1.025 | 42,1 % | 40,0 % | 100,0 % / 38,3 % | 75 | 0 | 0 |

En el conjunto de fraseo nuevo, el autor indica que el motor de reglas obtiene resultados peores que el modelo, aunque el texto disponible se interrumpe antes de aportar la cifra concreta; ese dato no está disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8-2,2 GB con el GGUF q8_0 a 2.048 tokens de contexto (fichero de 1,65 GB más caché KV reducida). Con cuantizaciones q4_K_M rondaría 1,0-1,3 GB, aunque esas cuantizaciones no están publicadas por el autor.
- GPU recomendadas: cualquier GPU con 3 GB o más de VRAM sirve para q8_0; el entrenamiento se hizo en una A100-80GB en Modal, pero la inferencia no necesita hardware de centro de datos. Una RTX 4090, una RTX 3060 de 12 GB o una GPU integrada con memoria compartida pueden ejecutarlo sobradamente.
- Cabe en GPU de consumo: sí. También funciona en CPU, ya que Ollama y llama.cpp soportan ejecución sin acelerador; el tamaño del modelo es de 1,5 B parámetros.
- Opciones de despliegue: Ollama (`ollama run hf.co/Gowthamshivanand/gowtham-nimbuspay-agent`, con `template` y `params` incluidos en el repositorio), llama.cpp (`llama-server -hf ...:Q8_0` o `llama-server -m gowtham-nimbuspay-agent-q8_0.gguf -c 2048 --temp 0`), y cualquier servidor compatible con la API de chat de OpenAI apuntando a `http://localhost:8080/v1/chat/completions`. vLLM y TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponible. El autor no publica medidas de tokens por segundo ni de latencia por petición.
- Configuración obligatoria: `temperature 0`, `repeat_penalty 1`, `stop <|im_end|>` y `num_ctx 2048`; el modelo debe ejecutarse con el system prompt que enumera herramientas y motivos de rechazo, o su comportamiento queda fuera de lo evaluado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gowtham-nimbuspay-agent | 1,54 B | 2.048 tokens configurados | 90,1 % precisión de herramienta en held-out propio (1.025 filas) | Apache 2.0 | GGUF q8_0 en HuggingFace y Ollama |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | No indicado en la información disponible | No evaluado en esta tarea por el autor | Apache 2.0 | safetensors y GGUF en HuggingFace |
| Motor de reglas del demo | No aplica | No aplica | 42,1 % precisión de herramienta, 100 % precisión de rechazo y 38,3 % exhaustividad en el mismo conjunto | No disponible | Código en el repositorio de GitHub |

Otros modelos de 1-2 B parámetros con ajuste por instrucciones (por ejemplo la familia SmolLM2 o Llama 3.2 1B) son alternativas razonables en tamaño, pero no se han publicado evaluaciones comparativas frente a este modelo en la información disponible. Tampoco existe comparación con modelos especializados en enrutado o function calling de mayor tamaño.

## Limitaciones y advertencias

- Alcance cerrado: no es un chatbot general. Usarlo fuera de la aplicación y de su system prompt invalida la evaluación publicada.
- Solo inglés. Cualquier uso en castellano u otro idioma queda fuera de alcance y no ha sido evaluado.
- No calcula ni genera cifras: toda cifra de la respuesta debe aparecer en el resultado de la herramienta. La comprobación numérica la hace el código de la aplicación, no el modelo.
- Riesgo de alucinación en los argumentos de la herramienta: en el conjunto held-out de 1.025 filas se registran 8 salidas con JSON inválido y 7 rutas inseguras (peticiones que deberían rechazarse y acabaron enrutadas a una herramienta). En el conjunto de fraseo nuevo aparecen otras 8 salidas con JSON inválido.
- Rechazos excesivos: 36 sobre 1.025 filas en held-out (3,5 %) y 10 sobre 194 en fraseo nuevo. El modelo es conservador y puede bloquear peticiones legítimas.
- El modo híbrido degrada la precisión de herramienta hasta el 68,2 % porque el motor de reglas responde antes; es una decisión de diseño del demo, no una mejora del modelo.
- Dependencia de guardas externas: el modelo asume que el código ejecuta comprobaciones previas, valida el esquema JSON y verifica los números después. Sin esas guardas el riesgo de rutas inseguras aumenta.
- Datos exclusivamente sintéticos y caso de estudio personal ("hobby case study"): no hay validación sobre datos reales de ninguna empresa ni evidencia de robustez fuera del dominio del demo.
- "NimbusPay" es una empresa ficticia de un caso de contratación; el modelo no tiene relación con ninguna empresa, producto o sitio web real, incluido nimbuspay.io.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene revisar también la licencia del modelo base Qwen2.5-1.5B-Instruct enlazada en la model card.
- Señales de adopción nulas (0 descargas, 0 likes) y una sola ejecución de entrenamiento documentada (Run 3): no hay evidencia de mantenimiento posterior ni de informes de terceros.
- No se publican hiperparámetros de entrenamiento, volumen de datos ni composición del dataset sintético, lo que dificulta reproducir el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gowthamshivanand/gowtham-nimbuspay-agent
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Código de la demo NimbusPay Adoption Insights Agent: https://github.com/mohithraghava/nimbuspay-adoption-insights
- Prompt y lógica de integración del modelo: https://github.com/mohithraghava/nimbuspay-adoption-insights/blob/main/app/finetuned.py
- Release con los pesos y los informes de evaluación (`model-run3-q8_0`): https://github.com/mohithraghava/nimbuspay-adoption-insights/releases/tag/model-run3-q8_0
- Sitio web ajeno al modelo, mencionado en el aviso del autor: https://nimbuspay.io
