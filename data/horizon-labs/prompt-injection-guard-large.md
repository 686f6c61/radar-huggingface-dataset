# Horizon-Labs/prompt-injection-guard-large

## Resumen

Prompt Injection Guard (large) es un clasificador de texto multilingüe desarrollado por Horizon-Labs que detecta intentos de prompt injection y de jailbreak, tanto en mensajes de usuario (inyección directa) como en contenido no confiable que lee un agente: correos, páginas web, documentos, fragmentos de RAG y salidas de herramientas o API (inyección indirecta). Devuelve dos etiquetas, `SAFE` (0) e `INJECTION` (1), y sigue la misma convención que `protectai/deberta-v3-base-prompt-injection-v2`, por lo que puede actuar como reemplazo directo en código y herramientas ya construidas para ese modelo.

Técnicamente es un transformer encoder para clasificación de secuencias, afinado a partir de `BAAI/bge-m3` (familia XLM-RoBERTa), con 567.756.802 parámetros y una ventana declarada de 8.000 tokens. Se publica bajo licencia Apache-2.0 sin gating y solo con datos con licencias permisivas. El autor lo orienta explícitamente a pipelines de agentes: se entrenó con documentos realistas de 45 tipos con inyecciones plantadas y sus versiones limpias, de modo que busca instrucciones dirigidas a la IA y no palabras alarmantes sueltas.

Es relevante ahora porque los agentes que consumen contenido externo (búsqueda web, correo, RAG, MCP/tools) son un vector de ataque en producción, y este modelo ofrece un filtro previo que corre en GPU o CPU mediante PyTorch y ONNX. El repositorio es reciente (creado el 25 de septiembre de 2026) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para clasificación de secuencias, afinado desde `BAAI/bge-m3` (familia XLM-RoBERTa); los tags del repositorio mencionan también `modernbert` y `mmbert`, pero el `base_model` declarado es bge-m3 |
| Parametros totales | 567.756.802 (568M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.000 tokens declarados en la model card; los ejemplos del autor usan ventanas de 2.048 tokens con solapamiento (`stride`) de 512 para documentos más largos |
| Tipos de cuantizacion | ONNX fp32 (2,3 GB, con pesos externos) y ONNX cuantizado con embeddings int8 (1,5 GB); no se publican GGUF ni cuantizaciones GPTQ/AWQ |
| Idiomas soportados | Metadatos: multilingual, en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th (19 etiquetas). La model card afirma datos de entrenamiento sintéticos en 30 idiomas |
| Licencia | Apache-2.0, sin gating |
| Formato de pesos | safetensors (repo total 6,0 GB) y ONNX (fp32 e int8) |
| Etiquetas de salida | `SAFE` (0), `INJECTION` (1) |
| Tarea (pipeline) | text-classification |
| Modelo base | BAAI/bge-m3 |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias construido sobre el backbone de `BAAI/bge-m3`, un encoder multilingüe de la familia XLM-RoBERTa, con el que comparte el orden de magnitud de parámetros (568M). El autor indica que la variante large usa exactamente los mismos datos que la variante base, pero con un backbone mayor, y que el modelo se publica en cuatro artefactos: pesos PyTorch, ONNX fp32 con pesos externos y ONNX con embeddings cuantizados a int8. No se documenta ningún mecanismo de generación (no hay decodificación especulativa ni atención lineal): es exclusivamente un cabezal de clasificación binaria.

El entrenamiento combina 14 conjuntos de datos declarados en la model card, centrados en inyección directa, inyección indirecta vía herramientas y contenido, jailbreak y datos benignos de contraste: `neuralchemy/Prompt-injection-dataset`, `S-Labs/prompt-injection-dataset`, `microsoft/llmail-inject-challenge`, `hendzh/PromptShield`, `TrustAIRLab/in-the-wild-jailbreak-prompts`, `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`, `3nesdeniz/agentic-prompt-injection-5k`, `rgeada/tool-response-injections`, `JailbreakV-28K/JailBreakV-28k`, `nvidia/Nemotron-RL-Jailbreak-Robustness-v1`, `OpenAssistant/oasst2`, `CohereLabs/aya_dataset`, `HuggingFaceFW/fineweb-edu` y `HuggingFaceFW/fineweb-2`. No se especifica el número de tokens de entrenamiento, la composición exacta por idioma ni si hubo fases de RLHF o DPO (poco habituales en un clasificador). La innovación declarada es el diseño del conjunto de entrenamiento: 45 tipos de documento con inyecciones plantadas y su contraparte limpia, más datos sintéticos multilingües, con el objetivo de reducir falsos positivos sobre texto benigno que se parece a una inyección.

## Capacidades

- Clasificación binaria de prompt injection directa en mensajes de usuario.
- Detección de inyección indirecta en contenido no confiable: correos, páginas web, documentos, fragmentos de RAG y salidas de herramientas o API.
- Detección de intentos de jailbreak.
- Procesamiento multilingüe: 19 idiomas declarados en los metadatos (entre ellos español, inglés, alemán, francés, portugués, italiano, neerlandés, polaco, ruso, ucraniano, turco, árabe, hindi, chino, japonés, coreano, vietnamita, indonesio y tailandés) y datos sintéticos en 30 idiomas.
- Manejo de entradas largas mediante ventana deslizante con solapamiento; el autor proporciona una función que devuelve la probabilidad máxima de inyección sobre ventanas de 2.048 tokens con `stride` 512.
- Ejecución en GPU y en CPU, con soporte de PyTorch, ONNX Runtime y `transformers.js` (en este último caso el propio autor recomienda usar las variantes small o base en el navegador por tamaño).
- Integración directa con LLM Guard (`llm_guard.input_scanners.PromptInjection`) usando el modelo ONNX.
- No dispone de tool calling, generación de texto, razonamiento multi-step, visión ni audio: es un componente de guardrail, no un modelo generativo.

## Casos de uso

- Filtrado de entrada en asistentes y atención al cliente: se ejecuta el clasificador sobre cada mensaje del usuario antes de enviarlo al LLM; si la etiqueta es `INJECTION` con una puntuación superior al umbral (el ejemplo del autor usa 0,5), se bloquea o se sanea el turno. Adecuado porque mantiene un índice bajo de falsos positivos sobre peticiones legítimas que suenan parecidas (93,2% en NotInject, 99,3% en OR-Bench-hard).
- Saneado de contenido no confiable en agentes con navegación web: antes de insertar en el contexto la página descargada, se calcula `injection_score()` con ventana deslizante y se sustituye el contenido por un marcador si supera el umbral. Es el escenario para el que el modelo fue entrenado explícitamente (45 tipos de documento con inyecciones plantadas).
- Protección frente a inyecciones escondidas en respuestas de herramientas y API: el autor cita el conjunto `rgeada/tool-response-injections`, pensado para ataques que llegan en el retorno de una tool, algo crítico en arquitecturas MCP o de function calling encadenado.
- Preprocesado de un pipeline RAG: clasificar cada fragmento recuperado o cada documento indexado para descartar trozos que contengan instrucciones dirigidas al modelo, evitando que una inyección almacenada en la base vectorial contamine todas las respuestas futuras.
- Guardrail en un gateway de LLM: al ser compatible con la convención de etiquetas de `protectai/deberta-v3-base-prompt-injection-v2`, se puede sustituir en caliente en despliegues existentes de LLM Guard (input scanner `PromptInjection`) sin reescribir la lógica de decisión.
- Moderación multilingüe en plataformas: con 19 idiomas declarados, permite aplicar la misma política de seguridad a tráfico en español, alemán, francés, árabe, chino o japonés sin desplegar un clasificador por idioma.
- Auditoría offline de logs: ejecución en lote sobre historiales de conversaciones y documentos largos usando ventanas solapadas para localizar intentos de inyección y alimentar una revisión de seguridad posterior.
- Filtrado en entornos sin GPU: la variante ONNX int8 (1,5 GB) permite desplegar el clasificador en CPU, útil en gateways on-premise con presupuesto de hardware limitado.

## Benchmarks y rendimiento

Resultados publicados en la model card. El autor no especifica en todos los casos si la cifra es F1, exactitud u otra métrica; se indica tal cual. La columna «Base» corresponde a `Horizon-Labs/prompt-injection-guard-base`.

| Conjunto / benchmark | Metrica | Large (este modelo) | Base | Small |
|---|---|---|---|---|
| NotInject | Tasa libre de falsas alarmas | 93,2% | no disponible | no disponible |
| OR-Bench-hard | Tasa libre de falsas alarmas | 99,3% | no disponible | no disponible |
| agentic5k | F1 | 0,899 | 0,867 | no disponible |
| agentic5k | Tasa de falsos positivos | 0,24 | 0,32 | no disponible |
| BIPIA | F1 | 0,680 | 0,625 | no disponible |
| Qualifire | Tasa de falsos positivos | 0,16 | 0,20 | no disponible |
| Simsonsun | F1 | 0,766 | 0,793 | no disponible |
| Mindgard evasion | F1 | 0,759 | 0,783 | no disponible |

No se han publicado en la información disponible resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- Tamaño de pesos (cálculo a partir de los 567.756.802 parámetros): en fp32 ≈ 2,27 GB; en fp16/bf16 ≈ 1,14 GB; en int8 ≈ 0,57 GB de pesos. Los artefactos publicados pesan 2,3 GB (ONNX fp32 con pesos externos) y 1,5 GB (ONNX cuantizado con embeddings int8); el repositorio completo ocupa 6,0 GB porque incluye varios formatos.
- VRAM estimada para inferencia: 2-4 GB en fp16/bf16 con lotes pequeños y longitudes moderadas; en fp32, a partir de unos 3 GB. Son estimaciones derivadas del tamaño de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente; para batching de alta concurrencia o ventanas grandes, A100 o H100 aportan margen y mejor throughput.
- Cabe en GPU consumer: sí, en todas las gamas actuales con 6 GB o más. También cabe en CPU usando la variante ONNX int8 (1,5 GB en disco).
- Opciones de despliegue documentadas: `transformers` (`pipeline` de `text-classification` o `AutoModelForSequenceClassification`), ONNX Runtime, `transformers.js` (con la advertencia del autor de que la variante large es demasiado grande para el navegador y conviene usar small o base) y LLM Guard como input scanner. Los tags de HuggingFace incluyen `text-embeddings-inference` y `endpoints_compatible`. No se documentan vLLM, llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponible. La model card no publica medidas de latencia ni de tokens por segundo, ni comparativas de coste entre las variantes ONNX y PyTorch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horizon-Labs/prompt-injection-guard-large | 568M | 8k tokens (ventanas de 2.048 en los ejemplos) | Clasificador binario directo + indirecto, multilingüe | Apache-2.0 | HuggingFace, ONNX, LLM Guard |
| Horizon-Labs/prompt-injection-guard-base | no disponible | no disponible | Mismos datos, backbone menor | Apache-2.0 (según el repositorio del autor) | HuggingFace; mejor en Simsonsun y evasión Mindgard, peor en agentic5k y BIPIA |
| Horizon-Labs/prompt-injection-guard-small | no disponible | no disponible | Mismos datos, backbone menor; recomendado por el autor para navegador | Apache-2.0 (según el repositorio del autor) | HuggingFace |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible en la información proporcionada | no disponible | Clasificador de prompt injection en entrada | no disponible en la información proporcionada | Referencia de compatibilidad: comparte la convención de etiquetas `SAFE`/`INJECTION` |

La información disponible no incluye comparativas directas con otros guardrails del mercado (por ejemplo Llama Prompt Guard de Meta o clasificadores de Azure AI Content Safety), por lo que no se pueden aportar cifras de comparación adicionales.

## Limitaciones y advertencias

- El propio autor reconoce que la variante large es algo más débil que la base en algunos conjuntos de jailbreak directo y evasión: Simsonsun 0,766 frente a 0,793 y evasión Mindgard 0,759 frente a 0,783. Si el caso de uso principal es jailbreak directo, la base puede ser preferible.
- Persisten falsos positivos: la tasa de falsos positivos es 0,24 en agentic5k y 0,16 en Qualifire. Bloquear contenido de forma automática sin una ruta de revisión o de degradación puede degradar la experiencia de usuario.
- Es un clasificador, no una defensa completa: no genera respuestas ni neutraliza instrucciones; debe combinarse con otras capas (saneado, aislamiento de contexto, permisos mínimos en herramientas).
- Sensibilidad al umbral: la model card no publica una calibración del umbral y remite al usuario a elegir uno (los ejemplos usan 0,5). Un umbral mal elegido cambia radicalmente la relación entre falsos positivos y falsos negativos.
- Es vulnerable a evasión adversarial: los propios números de evasión (Mindgard 0,759) indican que un atacante que adapte el texto puede superar el filtro.
- Limitación de contexto: aunque se declaran 8.000 tokens, los ejemplos oficiales trabajan con ventanas de 2.048 y solapamiento de 512, lo que añade coste de cómputo proporcional a la longitud del documento.
- Discrepancia de idiomas: los metadatos listan 19 idiomas, mientras que la model card afirma datos sintéticos en 30 idiomas. No se detalla qué idiomas quedan fuera de los metadatos ni la cobertura real por idioma.
- Ambigüedad del backbone: los tags mencionan `modernbert` y `mmbert`, pero el `base_model` declarado es `BAAI/bge-m3` (XLM-RoBERTa). Conviene verificar la arquitectura real antes de asumir compatibilidad con utilidades específicas de ModernBERT.
- Madurez: repositorio creado el 25 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por parte de la comunidad.
- Tamaño para navegador: el autor indica explícitamente que la variante large es demasiado grande para ejecutarse en el navegador con `transformers.js`.
- Licencia Apache-2.0 permite uso comercial sin gating, pero la model card no ofrece garantías ni compromisos de mantenimiento; el cumplimiento de la licencia de los datos de entrenamiento se limita a la afirmación del autor de que todos son permisivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/prompt-injection-guard-large
- Variante small: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Variante base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/prompt-injection-guard
- Código fuente (datos, entrenamiento y evaluación): https://github.com/horizon-ai-labs/agent-io-guards
- Modelo de referencia con la misma convención de etiquetas: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Búsqueda web: no se encontraron enlaces relevantes al modelo. Los resultados devueltos corresponden a entidades homónimas sin relación (partido político Horizons, concesionario BMW Horizon, emisora Horizon y la entrada «Horizon» de Wikipedia), por lo que se descartan como fuentes.
