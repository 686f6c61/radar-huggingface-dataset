# i1see1you/VirbiusGuard

## Resumen

VirbiusGuard es un clasificador de seguridad de prompts (LLM guard) desarrollado por i1see1you (min cai) a partir del modelo Qwen/Qwen3Guard-Gen-0.6B mediante fine-tuning con LoRA. Su función es analizar la entrada de usuario antes de que llegue a un modelo de lenguaje y devolver un veredicto en JSON estricto: `{"hit_rule": true, "triggered_id": "<categoría>"}` o `{"hit_rule": false, "triggered_id": "none"}`. El modelo cubre diez categorías de contenido no seguro, desde violencia y autolesión hasta jailbreak, extracción de PII y abuso de herramientas de agente, con especial énfasis en los puntos débiles del clasificador original de Qwen. La versión actual (V15) incorpora un rebalanceo de muestras benignas que reduce la tasa de falsos positivos al 3,0 % y mejora la robustez frente a ataques de framework. Con 751.632.384 parámetros y arquitectura Qwen3ForCausalLM (0.6B) con LoRA, es un modelo ligero apto para desplegarse como filtro en tiempo real en sistemas de producción.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (0.6B) con LoRA (rank 32 / alpha 64) |
| Parámetros totales | 751.632.384 (~0.75B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3Guard-Gen-0.6B, un clasificador de seguridad de Qwen, y se ajusta con LoRA (rank 32, alpha 64) para mejorar la detección de jailbreaks y abuso de herramientas de agente. El entrenamiento de la versión V15 rebalancea las muestras benignas: se eliminan datos sintéticos plantilla y se añaden conversaciones reales de oasst1 (re-filtradas con guard), prosa china de COIG y textos con estilo OCR (postprocesados con OvisOCR2). Esto eleva la proporción de chino del 17 % al 20 % y reduce la tasa de falsos positivos benignos del 3,5 % al 3,0 %. No se indica en la información disponible si se emplearon técnicas de RLHF o DPO; el pipeline es de clasificación de texto.

## Capacidades

- Clasificación de seguridad en 10 categorías unsafe: Violent, Non-violent Illegal Acts, Unethical Acts, Suicide & Self-Harm, Jailbreak, PII, Copyright Violation, Politically Sensitive Topics, Sexual Content, Agent Tool Misuse.
- Detección de jailbreak: extracción de system prompt, roleplay DAN, instrucciones esteganográficas.
- Detección de abuso de herramientas de agente: llamadas a herramientas con parámetros inyectados (SQL injection), acceso a metadatos de nube (IMDS), escalada de privilegios.
- Salida en JSON estricto con un único `triggered_id` por entrada.
- Soporte bilingüe chino-inglés, con mejoras específicas para texto en chino en la versión V15.
- Compatible con Transformers y Ollama (GGUF), y con el motor VirbiusAgent mediante sustitución directa del modelo de evaluación.

## Casos de uso

- Filtro de entrada para chatbots de atención al cliente: VirbiusGuard analiza cada mensaje del usuario antes de pasarlo al LLM principal, bloqueando intentos de jailbreak o consultas sobre actividades ilegales.
- Protección de agentes autónomos: el modelo monitoriza las llamadas a herramientas y detecta intentos de inyección SQL en parámetros o sondeos al servicio de metadatos de Google Cloud (IMDS), evitando fugas de credenciales.
- Moderación de contenido en plataformas UGC: clasifica automáticamente publicaciones en categorías como violencia, PII o contenido sexual, permitiendo aplicar políticas de moderación de forma consistente.
- Cumplimiento de protección de datos: detecta solicitudes de extracción de información personal (direcciones, cuentas) y bloquea la respuesta del LLM para cumplir normativas de privacidad.
- Seguridad en pipelines de generación de código: filtra prompts que intentan extraer el system prompt o provocar comportamientos no autorizados en asistentes de programación.
- Integración en VirbiusAgent: sustituye el modelo de evaluación de prompts (`VIRBIUS_PROMPT_LLM_MODEL`) sin cambios de código, gracias a su compatibilidad con la API de Ollama.

## Benchmarks y rendimiento

| Modelo | Acc | Recall | FP rate | Precision |
|---|---|---|---|---|
| Qwen3Guard original | 83,0 % | 82,9 % | 16,2 % | 98,5 % |
| V11 | 98,2 % | 99,4 % | 16,2 % | 98,7 % |
| V13 | 99,0 % | 99,6 % | 8,1 % | 99,4 % |
| V15 | 98,5 % | 99,4 % | 3,0 % | 99,4 % |

La versión V13 redujo la tasa de omisiones del 17,1 % (modelo base) al 0,4 % y redujo a la mitad la tasa de falsos positivos (16,2 % → 8,1 %). La versión V15 añade muestras en chino y reduce la tasa de falsos positivos benignos al 3,0 %, con una caída mínima de precisión global (0,5 puntos). La robustez frente a ataques de framework mejora del 75,5 % al 85,0 %.

## Requisitos de hardware

- VRAM estimada: ~2-3 GB para el safetensors fp16 (pesos ~1.5 GB + activaciones). Para el GGUF Q4_K_M (~462 MB), menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., RTX 3060, RTX 4060). También es posible ejecutarlo en CPU (10-20 veces más lento) o en Apple Silicon con MPS.
- Opciones de despliegue: Transformers (Python), Ollama (GGUF). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acc | FP rate | Licencia |
|---|---|---|---|---|---|
| Qwen3Guard-Gen-0.6B (base) | ~0.6B | no disponible | 83,0 % | 16,2 % | Apache 2.0 |
| VirbiusGuard V15 | 0.75B | no disponible | 98,5 % | 3,0 % | Apache 2.0 |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgo de criterio "A": el modelo clasifica cualquier mención de temas políticos o religiosos como no seguro, incluso en conversaciones neutrales. Para un criterio más laxo (B), es necesario reentrenar con datos reetiquetados.
- Riesgo de falsos positivos en casos ambiguos o con contexto académico/legítimo que toque temas sensibles (p. ej., preguntas sobre explosivos en un artículo de física).
- La salida JSON puede truncarse si `max_new_tokens` es inferior a 40, lo que rompe el parseo.
- Solo soporta chino e inglés; no cubre otros idiomas.
- Al ser un modelo de 0.6B, puede no detectar ataques sofisticados o novedosos no presentes en los datos de entrenamiento.
- El repositorio incluye versiones antiguas (V11, V4) solo en GGUF; la versión V15 es la recomendada.

## Enlaces

- HuggingFace: https://huggingface.co/i1see1you/VirbiusGuard
- ModelScope: https://modelscope.cn/models/i1see1you/VirbiusGuard
- Perfil del autor: https://huggingface.co/i1see1you
