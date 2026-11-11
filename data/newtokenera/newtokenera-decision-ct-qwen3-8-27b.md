# NewTokenEra/newTokenEra-decision-ct-Qwen3.8-27B

## Resumen

newTokenEra-decision-ct-Qwen3.8-27B es un modelo de decisión bilingüe (chino e inglés) desarrollado por la organización NewTokenEra mediante post-entrenamiento sobre Qwen/Qwen3.8-27B. A diferencia de un modelo generativo convencional, no produce texto: expone un método `decide()` que recibe un estado (texto o JSON), una o varias preguntas y un conjunto de alternativas, y devuelve directamente una categoría seleccionada, una puntuación numérica o la probabilidad de "sí", en una única pasada forward.

El modelo resuelve el problema de convertir un LLM en un clasificador y estimador estructurado sin generar tokens: cada pregunta se responde con probabilidades condicionales sobre las alternativas suministradas. Soporta tres tipos de interfaz: `choice` (entre 2 y 26 opciones con descripción), `score` (entre 2 y 10 niveles ordenados) y `noul` (pregunta binaria sí/no). Una misma petición JSON puede contener hasta 64 preguntas sobre el mismo estado.

Es relevante porque ofrece un checkpoint completo en BF16 (26.085 millones de parámetros, unos 52,2 GB en safetensors) con tokenizer, código Python de inferencia y licencia Apache-2.0, lo que permite desplegarlo en producción como motor de enrutamiento, triaje o puntuación sin depender de APIs externas. La longitud de contexto no se especifica en la información disponible; el renderizador de texto admite hasta 4.096 tokens por pregunta renderizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Qwen3.8-27B) con cabecera de decisión personalizada (`modeling_n97.py`) |
| Parametros totales | 26.085.463.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; el renderizador admite hasta 4.096 tokens por pregunta |
| Tipos de cuantizacion | no disponible (release publicado en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (18 shards BF16 con índice) + custom code Python |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3.8-27B y se somete a post-entrenamiento para convertirlo en un modelo de decisión. La arquitectura subyacente es un transformer decoder; sobre él se añade una interfaz de decisión implementada en `modeling_n97.py` y `configuration_n97.py`, que se ejecutan con `trust_remote_code=True`. La inferencia realiza una única pasada forward por pregunta y no genera tokens de texto, lo que reduce la latencia frente a esquemas de prompting generativo.

El post-entrenamiento se orienta a tres tipos de tarea: selección entre opciones nombradas con descripción, puntuación sobre escalas ordinales y estimación de probabilidad binaria. La model card indica que el banco de evaluación bilingüe N (1.760 prompts sobre alarmas, eventos de calendario, meteorología y transporte) se utilizó durante el desarrollo de la interfaz, por lo que las cifras publicadas describen el rendimiento sobre ese mismo banco. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación multiopción (`choice`): selecciona una clave de negocio entre 2 y 26 opciones, cada una con descripción, y devuelve probabilidades por opción más un valor de confianza basado en concentración.
- Puntuación ordinal (`score`): con 2 a 10 niveles ordenados de menor a mayor, devuelve la media ponderada por probabilidad de los índices de nivel.
- Decisión binaria (`noul`): responde preguntas sí/no y devuelve la probabilidad asignada a "sí" entre 0 y 1.
- Procesamiento de estado en texto o JSON: el renderizador acepta ambas formas y admite hasta 4.096 tokens por pregunta.
- Múltiples preguntas por petición: un mismo `state` puede acompañarse de 1 a 64 preguntas en el mapeo `questions`.
- Bilingüe chino-inglés, tanto en la entrada como en las descripciones de opciones y niveles.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un motor de decisión.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como `state` y una pregunta `choice` con los equipos de destino (facturación, soporte técnico, logística, etc.); el modelo devuelve el equipo asignado y la confianza para derivar automáticamente o escalar a revisión humana.
- Detección de solicitudes de reembolso: pregunta `noul` sobre si el cliente pide reembolso, con la probabilidad de "sí" como señal para activar el flujo de devoluciones; el ejemplo incluido en el repositorio usa este patrón sobre un caso de cambio de zapatos.
- Priorización por urgencia: pregunta `score` con niveles ordenados de urgencia (por ejemplo, 0 a 2 o 0 a 4) para ordenar la cola de atención según la media ponderada devuelta.
- Enrutamiento de alarmas y eventos: el banco de evaluación cubre alarmas, eventos de calendario, meteorología y transporte, lo que encaja con sistemas de monitorización que deben clasificar alertas en categorías operativas.
- Extracción de intención en asistentes conversacionales: dado el último turno en JSON, clasificar la intención del usuario entre un conjunto acotado de acciones antes de invocar el servicio correspondiente.
- Puntuación de riesgo o calidad en pipelines internos: usar `score` para valorar ítems (por ejemplo, gravedad de una incidencia) sin necesidad de generar explicaciones, reduciendo coste y latencia frente a un LLM generativo.
- Clasificación bilingüe en mercados hispanohablantes y chinos: aunque el modelo solo cubre zh y en, puede integrarse en flujos donde el estado llegue en esos idiomas y el resto del sistema traduzca o normalice.

## Benchmarks y rendimiento

| Interfaz evaluada | Precisión clasificación y booleana | MAE score chino | MAE score inglés |
|---|---:|---:|---:|
| `decide()` pública (v2) | 1.311/1.340 (97,84%) | 0,193500 | 0,162728 |

El banco N contiene 1.760 prompts; la precisión se mide sobre 1.340 decisiones simples y mixtas no empatadas (las 120 mixtas empatadas se excluyen) y el MAE sobre 300 prompts de puntuación (150 por idioma) en escala 0-4. El propio autor advierte que el banco se usó durante el desarrollo de la interfaz, por lo que estas cifras no constituyen una evaluación en dominio independiente.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16 ocupa unos 52,17 GB en pesos, por lo que la inferencia en BF16 requiere del orden de 55-60 GB de VRAM considerando overhead de runtime; no se documentan versiones cuantizadas que reduzcan este requisito.
- GPU recomendadas: el entorno probado por el autor es una NVIDIA H20 con PyTorch 2.10.0+cu126, Transformers 5.22.1 y atención SDPA. Por tamaño, encajan GPU de 80 GB (A100, H100) y H20; no cabe en GPUs de consumo de 24 GB en BF16.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en BF16 sin cuantización, y no se publican pesos GGUF ni AWQ/GPTQ para hacerlo.
- Opciones de despliegue: carga directa con Transformers (`AutoModel.from_pretrained` con `trust_remote_code=True`), Accelerate para `device_map`, safetensors y huggingface_hub para descarga. No se mencionan vLLM, TGI, llama.cpp ni Ollama, y su naturaleza de modelo de decisión con método `decide()` probablemente requiera envoltorio propio.
- Latencia y throughput: no disponibles; al ser una sola pasada forward por pregunta y no generar tokens, la latencia debería ser inferior a la de un modelo generativo del mismo tamaño, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables (clasificadores de decisión post-entrenados sobre LLMs del mismo rango). Como referencia del modelo base:

| Modelo | Parámetros | Contexto | Tipo | Licencia |
|---|---:|---|---|---|
| newTokenEra-decision-ct-Qwen3.8-27B | 26,09 B | no disponible (4.096 tokens por pregunta) | Modelo de decisión (post-entrenado) | Apache-2.0 |
| Qwen/Qwen3.8-27B | no disponible en la información | no disponible | LLM generativo (base) | no disponible en la información |

No se han publicado comparaciones con alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Las probabilidades devueltas son condicionales a las alternativas suministradas y no están calibradas para ningún dominio concreto; es necesario calibrar umbrales con ejemplos representativos antes de usarlo en producción.
- El banco de evaluación N se utilizó durante el desarrollo de la interfaz, por lo que las cifras de 97,84% de precisión y los MAE publicados pueden sobreestimar el rendimiento en dominios nuevos.
- Solo soporta chino e inglés; no hay evidencia de capacidades en castellano ni en otros idiomas.
- No genera texto ni razonamiento explícito: no es adecuado para tareas de explicación, resumen o diálogo abierto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del autor (`modeling_n97.py`, `configuration_n97.py`) en el entorno de inferencia; conviene auditar ese código antes de desplegarlo.
- El tamaño del checkpoint (52,2 GB en BF16) limita el despliegue a GPUs de alta gama y encarece el escalado horizontal.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las obligaciones heredadas del modelo base Qwen.
- Riesgo de sesgo y alucinación: aunque no genera texto libre, las probabilidades pueden reflejar sesgos del corpus de post-entrenamiento; no se documentan análisis de sesgo.
- La longitud de contexto total no está especificada; solo se garantiza el renderizado de hasta 4.096 tokens por pregunta.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y se publicó el 11 de noviembre de 2026, por lo que la validación por la comunidad es prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NewTokenEra/newTokenEra-decision-ct-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ejemplo de petición (`example_request.json`): https://huggingface.co/NewTokenEra/newTokenEra-decision-ct-Qwen3.8-27B/blob/main/example_request.json
- Ejemplo de respuesta (`example_response.json`): https://huggingface.co/NewTokenEra/newTokenEra-decision-ct-Qwen3.8-27B/blob/main/example_response.json
- Guía de entrada e inferencia offline (`AI_INPUT.md`): https://huggingface.co/NewTokenEra/newTokenEra-decision-ct-Qwen3.8-27B/blob/main/AI_INPUT.md
- Registro de evaluación (`validation.json`): https://huggingface.co/NewTokenEra/newTokenEra-decision-ct-Qwen3.8-27B/blob/main/validation.json
- Procedencia (`provenance.json`): https://huggingface.co/NewTokenEra/newTokenEra-decision-ct-Qwen3.8-27B/blob/main/provenance.json
- Licencia (`LICENSE`): https://huggingface.co/NewTokenEra/newTokenEra-decision-ct-Qwen3.8-27B/blob/main/LICENSE
- Sumas de verificación (`SHA256SUMS`): https://huggingface.co/NewTokenEra/newTokenEra-decision-ct-Qwen3.8-27B/blob/main/SHA256SUMS
