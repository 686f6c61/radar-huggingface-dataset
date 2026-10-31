# ProCreations/Nanbeige4.3-33B-FP8

## Resumen

Nanbeige4.3-33B-FP8 es una cuantización W8A8 en formato FP8 del modelo Nanbeige4.3-33B, publicado por el usuario ProCreations en Hugging Face. El modelo base, Nanbeige4.3-33B, es un modelo de generación de texto conversacional de la familia Nanbeige (Nanbeige Lab), con capacidad de razonamiento tipo "thinking" y soporte de tool calling. Esta versión cuantizada busca reducir a la mitad los requisitos de memoria y acelerar la inferencia manteniendo una fidelidad muy alta respecto al original en BF16.

El checkpoint usa pesos FP8 E4M3 en bloques de 128×128 y escalas de activación dinámicas por token/grupo-128, con embeddings y cabeza de salida (sin atar) en BF16. Según la model card, la divergencia KL medida frente a BF16 es de 0,0074 en tokens del asistente, con un acuerdo top-1 del 97,82 %, y la recuperación en contexto largo pasa 6/6 de las pruebas por encima de 100K tokens.

Es relevante porque ofrece un punto de despliegue eficiente validado específicamente con SGLang 0.5.21 en hardware Blackwell (SM120 / RTX PRO 6000), con parsers de razonamiento y tool calling integrados, lo que lo hace apto para agentes y cargas agénticas de código en una sola GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder, según tag `llama` de Hugging Face) |
| Parametros totales | 33.118.977.024 (≈33,1 B) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible (la model card indica que la recuperación supera 100K tokens, pero el límite configurado del modelo base no se especifica) |
| Tipos de cuantizacion | FP8 W8A8 (pesos E4M3 en bloques 128×128, activaciones dinámicas per-token/grupo-128); embeddings y output head en BF16; KV cache en BF16 (por defecto) o FP8 E4M3 |
| Idiomas soportados | no disponible (las pruebas de la model card incluyen chino e inglés; multilingüe aparece como dominio evaluado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, compatible con endpoints) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un transformer decoder de tipo LLaMA según los metadatos de Hugging Face. No se dispone en la información proporcionada de detalles sobre el número de capas, cabezas de atención, datos de entrenamiento (tokens, composición del dataset) ni etapas de alineación (RLHF/DPO); estos datos no están disponibles.

Sobre la cuantización: se trata de una cuantización W8A8 FP8 con pesos E4M3 organizados en bloques de 128×128 y escalas de activación dinámicas por token y por grupo de 128. Los embeddings y la cabeza de salida no atada se mantienen en BF16 para preservar la fidelidad en la distribución de salida. El checkpoint es una exportación "weights-only" limpia que no incluye escalas de KV cache embebidas: con `--kv-cache-dtype auto` se usa BF16 para la cache, y con `fp8_e4m3` se usan escalas unitarias. La validación de calidad se realizó con estimaciones de KL (log-verosimilitud natural, top-256 más complemento agregado) sobre 634.268 posiciones del asistente, distinguiendo dominios como agentic, código, matemáticas, chino y contexto largo.

## Capacidades

- Generación de texto conversacional, con modo de razonamiento "thinking" activable/desactivable mediante `enable_thinking` en la chat template.
- Tool calling / function calling: llamadas simples y paralelas, JSON anidado, `tool-choice` auto/none, y preservación del historial multi-turno de thinking y herramientas (`preserve_thinking=True`).
- Razonamiento agéntico multi-paso: la model card reporta suites de pruebas de código agéntico (41/46 con thinking activado frente a BF16) y un resultado agregado de 82/90 frente a 86/90 del BF16 en 30 tareas × 3 semillas.
- Generación y comprensión de código (dominio "code" evaluado con KL 0,0054 frente a BF16).
- Matemáticas (53/56 en la suite correspondiente frente a 54/56 de BF16).
- Contexto largo: recuperación verificada en 6/6 pruebas por encima de 100K tokens.
- Multilingüe: chino evaluado explícitamente (43/46, igual que BF16) y dominio multilingüe incluido en la auditoría KL.
- Salidas estructuradas (JSON): 30/30 en la suite estructurada, superando al BF16 (27/30).
- Integración con endpoints OpenAI (`/v1/chat/completions`) vía SGLang, en streaming y no streaming.

## Casos de uso

- Agentes de código con herramientas: el modelo soporta llamadas paralelas a herramientas e historial multi-turno preservado, y la model card documenta pruebas agénticas específicas; adecuado para pipelines de desarrollo asistido con SGLang.
- Servidor de inferencia autoalojado con API OpenAI: se despliega con SGLang 0.5.21 exponiendo `/v1/chat/completions`, compatible con clientes estándar del ecosistema.
- Sistemas RAG sobre documentos largos: la recuperación en contexto largo pasa 6/6 de las pruebas por encima de 100K tokens, útil para consulta de corpora extensos.
- Asistentes conversacionales con razonamiento visible: el modo thinking conmutables permite alternar entre respuestas rápidas y razonamiento extendido según la consulta.
- Automatización de flujos con salida estructurada: la suite estructurada (30/30) y el soporte de JSON anidado lo hacen apto para extracción y generación de datos estructurados.
- Atención al cliente y chatbots multilingües con foco en chino: el rendimiento en chino es equivalente al BF16 según las suites de la model card.
- Procesamiento matemático y STEM ligero: KL de decisión en STEM de 0,0008, el más bajo de todos los dominios evaluados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye comparaciones de calidad frente al modelo BF16 original:

| Suite | FP8 (aciertos) | BF16 (aciertos) | Diferencia emparejada (pp) | IC 95 % (pp) |
|---|---:|---:|---:|---|
| Matched full30 × 3 semillas | 82/90 | 86/90 | −4,4 | [−11,1, +2,2] |
| agentic_coding_on | 41/46 | 46/46 | −5,6 | [−13,3, 0,0] |
| agentic_coding_off | 25/30 | 22/30 | +10,0 | [−3,3, +23,3] |
| tool_off | 51/60 | 47/60 | +6,7 | [−5,0, +18,3] |
| structured | 30/30 | 27/30 | +10,0 | [0,0, +23,3] |
| math | 53/56 | 54/56 | −2,5 | [−7,5, 0,0] |
| chinese | 43/46 | 43/46 | −2,2 | [−10,0, +3,3] |
| chat | 24/24 | 24/24 | 0,0 | [0,0, 0,0] |
| long_context | 6/6 | 6/6 | 0,0 | [0,0, 0,0] |

Datos adicionales: KL de asistente (eval-v1, 634.268 posiciones): 0,007368 global; acuerdo top-1 del 97,82 %. Throughput medido en una estación RTX PRO 6000 Blackwell (cap 580 W): 44,2 tok/s en flujo único con KV BF16 en el modelo de referencia; este checkpoint es aproximadamente un 32 % más rápido que otra cuantización FP8 de terceros a KV FP8 igualada. La auditoría del endpoint OpenAI pasó 44/52 comprobaciones (los 8 fallos corresponden a una limitación conocida del parser XML, ver Limitaciones).

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 35,5 GB en safetensors FP8; a esto hay que añadir la KV cache (BF16 por defecto, o FP8 E4M3 para reducir su tamaño). Una estimación razonable es 40-48 GB de VRAM para inferencia con contexto moderado; no hay cifra oficial publicada.
- GPU recomendadas: RTX PRO 6000 Blackwell (SM120), validada explícitamente por el autor. Por compatibilidad FP8, también serían candidatos A100/H100/L40S, aunque no constan pruebas en esos dispositivos.
- Consumer GPU: no cabe en tarjetas de consumo de 24 GB (RTX 3090/4090) dado el tamaño de 35,5 GB solo en pesos. Requiere GPUs de 48 GB o superior (RTX PRO 6000, A100 40/80 GB con ajuste, H100).
- Despliegue: SGLang 0.5.21 es el runtime validado (con `--reasoning-parser nanbeige` y `--tool-call-parser nanbeige`). Los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y HF Inference Endpoints; no hay validación documentada de llama.cpp u Ollama (FP8 no es un formato GGUF).
- Rendimiento: 44,2 tok/s en flujo único con KV BF16 en RTX PRO 6000 (medido sobre el modelo de referencia de la model card); este checkpoint es ~32 % más rápido que otra cuantización FP8 comparada a igualdad de KV FP8. No hay datos de throughput en otros hardwares.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-FP8 (este) | 33,1 B | FP8 W8A8 | >100K verificado (límite exacto no disponible) | Apache 2.0 | Validado en SGLang, thinking + tool calling |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1 B | BF16 | no disponible | no disponible en la información proporcionada | Referencia de calidad; mayor VRAM (~66 GB en pesos) |
| Qwen3-32B | 32,7 B | BF16/FP8/GGUF | 128K (documentado por Qwen) | Apache 2.0 | Categoría similar; los parsers `nanbeige` de SGLang son alias de los detectores Qwen3 |

Nota: la comparación con Qwen3-32B se incluye por proximidad de tamaño y porque la propia model card indica que los parsers `nanbeige` son alias de los de Qwen3/Qwen3Coder en SGLang; no hay benchmarks cruzados publicados entre ambos.

## Limitaciones y advertencias

- Limitación conocida del parser de tool calling: una cadena literal `</parameter>` dentro de un argumento trunca silenciosamente los argumentos estructurados en ese punto (8/52 fallos en la auditoría del endpoint OpenAI). Hay que validar los argumentos de las herramientas; código arbitrario que contenga ese delimitador no está soportado por el parser de serie.
- El checkpoint no incluye escalas de KV cache embebidas; usar `--kv-cache-dtype fp8_e4m3` implica escalas unitarias, lo que puede afectar a la calidad en contexto muy largo (no documentado).
- Las suites de comportamiento son pequeñas y de semilla fija; la model card no reclama equivalencia estadística con BF16 (el resultado agregado de −4,4 pp es inconclusivo según el IC).
- Las pruebas de runtime (smoke tests) no establecen equivalencia de precisión en tareas ni de longitud de contexto; la capacidad real de contexto depende del hardware y la cache disponibles.
- No hay datos públicos de benchmarks estándar ni de sesgos del modelo; el riesgo de alucinación no ha sido caracterizado en la información disponible.
- La cobertura de idiomas no está documentada formalmente; solo se han verificado chino e inglés (y un dominio multilingüe en la auditoría KL).
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Modelo de terceros (ProCreations) con muy pocas descargas (247) y sin respaldo del laboratorio original: conviene auditar el checkpoint antes de producción.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/ProCreations/Nanbeige4.3-33B-FP8
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- SERVING_PARSERS.md (audit del parser, referenciado en la model card): https://huggingface.co/ProCreations/Nanbeige4.3-33B-FP8/blob/main/SERVING_PARSERS.md
- Paper, repositorio de origen y demos: no disponibles en la información proporcionada.
