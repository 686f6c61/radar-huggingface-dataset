# Horizon-Labs/prompt-injection-guard-base

## Resumen

Prompt Injection Guard (base) es un clasificador de texto desarrollado por Horizon-Labs para detectar intentos de *prompt injection* y *jailbreak*, tanto en mensajes directos del usuario como en contenido no confiable que un agente de IA procesa (correos, páginas web, documentos, fragmentos de RAG, salidas de herramientas y API). Se construye sobre el backbone `jhu-clsp/mmBERT-base` y cuenta con 307.531.778 parámetros, lo que lo sitúa en un rango de 308M, muy manejable para inferencia en CPU y GPU de consumo.

Su relevancia actual radica en el auge de los agentes autónomos que leen contenido externo: el modelo no busca palabras "peligrosas", sino instrucciones dirigidas al propio modelo, y se ha entrenado con documentos realistas de 45 tipos en los que se han plantado inyecciones junto a sus versiones limpias. Esto reduce los falsos positivos en texto benigno que se parece a una inyección (94,4% en NotInject, 99,4% en OR-Bench-hard).

Es multilingüe (datos sintéticos en 30 idiomas), admite entradas de hasta 8k tokens, se distribuye bajo licencia Apache-2.0 sin *gating* y ofrece pesos en PyTorch, ONNX (fp32 e int8) y transformers.js, lo que permite desplegarlo desde un servidor hasta el navegador. La convención de etiquetas `SAFE` (0) / `INJECTION` (1) es la misma que la de `protectai/deberta-v3-base-prompt-injection-v2`, por lo que funciona como reemplazo directo en herramientas existentes como LLM Guard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT, `jhu-clsp/mmBERT-base`) para clasificación de secuencias |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (ventana nativa); soporta ventanas solapadas para documentos más largos |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (embeddings cuantizados); pesos PyTorch safetensors; q8 en transformers.js |
| Idiomas soportados | Multilingüe: en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th (datos sintéticos en 30 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT (la familia mmBERT de JHU-CLSP), adaptado a clasificación de secuencias con dos etiquetas (`SAFE` e `INJECTION`). La arquitectura ModernBERT incorpora atención lineal y alternancia de capas locales/globales, lo que permite manejar contextos de 8k tokens con un coste computacional contenido para su tamaño. El checkpoint base `jhu-clsp/mmBERT-base` aporta el conocimiento multilingüe sobre el que se realiza el ajuste fino.

El entrenamiento combina numerosos conjuntos de datos de seguridad y datos generales: `neuralchemy/Prompt-injection-dataset`, `S-Labs/prompt-injection-dataset`, `microsoft/llmail-inject-challenge`, `hendzh/PromptShield`, `TrustAIRLab/in-the-wild-jailbreak-prompts`, `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`, `3nesdeniz/agentic-prompt-injection-5k`, `rgeada/tool-response-injections`, `JailbreakV-28K/JailBreakV-28k`, `nvidia/Nemotron-RL-Jailbreak-Robustness-v1`, además de `OpenAssistant/oasst2`, `CohereLabs/aya_dataset`, `HuggingFaceFW/fineweb-edu` y `HuggingFaceFW/fineweb-2` para el equilibrio con texto benigno. La model card indica que solo se han usado datos con licencias permisivas y que los datos sintéticos cubren 30 idiomas. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

La innovación principal es el enfoque orientado a agentes: se entrena con documentos realistas de 45 tipos que contienen inyecciones plantadas y sus contrapartidas limpias, de modo que el clasificador aprende a detectar instrucciones dirigidas al modelo (incluidas inyecciones indirectas ocultas en HTML, correos o salidas de herramientas) en lugar de palabras clave. También se publican variantes small y large del mismo guard.

## Capacidades

- Detección de prompt injection directa: anulación de instrucciones, mensajes falsos de sistema/desarrollador y trucos de delimitadores.
- Detección de jailbreaks: personajes, "modo desarrollador" y marcos hipotéticos destinados a eliminar las reglas del modelo.
- Detección de extracción de system prompt.
- Detección de inyección indirecta en contenido no confiable: correos, páginas web, documentos, fragmentos de RAG y respuestas de herramientas/API.
- Clasificación binaria con etiquetas `SAFE` (0) e `INJECTION` (1), compatible con la convención de `protectai/deberta-v3-base-prompt-injection-v2`.
- Capacidades multilingües en 30 idiomas, con ejemplos explícitos en alemán y otros idiomas europeos y asiáticos.
- Soporte de entradas largas de hasta 8k tokens y ventanas solapadas para documentos arbitrariamente largos.
- Despliegue en PyTorch, ONNX Runtime y transformers.js (incluido el navegador).
- Integración con LLM Guard mediante su escáner `PromptInjection` (verificado con llm-guard 0.3.16).
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step; su función es de guardarraíl/clasificador.

## Casos de uso

- Protección de agentes que leen contenido externo: antes de pasar una página web, un correo o un documento a un agente, se calcula la probabilidad de inyección por ventanas solapadas y se elimina o marca el contenido si supera el umbral elegido. Es adecuado porque el modelo está entrenado específicamente con inyecciones indirectas en documentos realistas.
- Filtrado de entradas de usuario en chatbots: se clasifica cada mensaje del usuario antes de enviarlo al LLM para bloquear jailbreaks y extracción de system prompt, con la etiqueta `INJECTION` y un umbral configurable (por ejemplo 0,5 en LLM Guard).
- Seguridad en pipelines RAG: se escanean los fragmentos recuperados antes de insertarlos en el contexto del modelo, evitando que un documento envenenado en el índice altere el comportamiento del asistente.
- Validación de salidas de herramientas y API: las respuestas de herramientas externas (búsquedas, scrapers, APIs de terceros) se clasifican antes de incorporarlas al bucle del agente, cubriendo el vector de inyección vía tool response.
- Moderación en aplicaciones multilingües: al soportar 30 idiomas, permite un único guardarraíl para productos con usuarios en varios idiomas sin desplegar un clasificador por lengua.
- Despliegue en el navegador o en el borde: con ONNX int8 o transformers.js (q8), se puede ejecutar la clasificación en cliente o en dispositivos sin GPU, reduciendo coste y latencia en aplicaciones web.
- Integración en gateways de LLM y proxies: como reemplazo directo de `protectai/deberta-v3-base-prompt-injection-v2` en herramientas compatibles con LLM Guard, se puede insertar en un proxy de entrada/salida sin cambiar el código de integración.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| NotInject (falsos positivos en texto benigno similar) | 94,4% | Según la model card |
| OR-Bench-hard (falsos positivos en texto benigno difícil) | 99,4% | Según la model card |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni métricas de precisión/recall sobre conjuntos de inyección específicos. Tampoco se han publicado cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307,5M parámetros, en fp32 ocupa aproximadamente 1,2 GB de pesos; en fp16 unos 0,6 GB; la variante ONNX int8 reduce el tamaño a la mitad respecto a fp32 (según la model card).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente; A100, H100, L40S o RTX 4090 permiten alto throughput en lote, aunque el modelo es pequeño y no requiere estas GPU para funcionar.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también funciona en CPU para cargas moderadas.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (`onnx/model.onnx` y `onnx/model_quantized.onnx`), transformers.js (`dtype: "q8"`), LLM Guard 0.3.16 (rutas ONNX y PyTorch), text-embeddings-inference (según los tags del repositorio) y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Horizon-Labs/prompt-injection-guard-base | 307,5M | 8k | 30 idiomas | Apache-2.0 | safetensors, ONNX, transformers.js | Guardarraíl orientado a agentes e inyección indirecta |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible en la información | no disponible | principalmente inglés | no disponible en la información | no disponible en la información | Misma convención de etiquetas; el modelo de Horizon-Labs es reemplazo directo |
| Horizon-Labs/prompt-injection-guard-small | no disponible en la información | no disponible | multilingüe | Apache-2.0 | no disponible en la información | Variante más pequeña del mismo guard |
| Horizon-Labs/prompt-injection-guard-large | no disponible en la información | no disponible | multilingüe | Apache-2.0 | no disponible en la información | Variante más grande del mismo guard |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un clasificador binario, no un generador: no sustituye al LLM ni implementa razonamiento; solo emite una probabilidad de inyección.
- Riesgo de falsos negativos: técnicas de inyección novedosas, ofuscadas o específicas de un dominio pueden no detectarse; se recomienda combinarlo con otras defensas (aislamiento de contenido, permisos mínimos, validación de acciones).
- Riesgo de falsos positivos: aunque la model card reporta 94,4% en NotInject y 99,4% en OR-Bench-hard, el umbral debe calibrarse por aplicación; un umbral bajo puede bloquear contenido legítimo.
- Sesgos conocidos: no se detallan en la información disponible; al entrenarse con datasets de seguridad y datos web, puede heredar sesgos de esos corpus.
- Limitaciones de idioma: aunque declara 30 idiomas, los datos de entrenamiento multilingües son sintéticos, por lo que el rendimiento en idiomas distintos del inglés puede ser inferior y no está cuantificado.
- Limitaciones de contexto: la ventana nativa es de 8k tokens; para documentos más largos hay que usar ventanas solapadas, y una inyección muy diluida en un documento enorme podría quedar por debajo del umbral.
- Licencia Apache-2.0: permite uso comercial, pero no se ofrece garantía alguna; el modelo se distribuye "tal cual".
- Para producción: conviene registrar y monitorizar las decisiones del clasificador, fijar umbrales por caso de uso y revisar periódicamente con datos propios, ya que no se publican métricas de precisión/recall sobre conjuntos de inyección específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Demo en Spaces: https://huggingface.co/spaces/Horizon-Labs/prompt-injection-guard
- Variante small: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Variante large: https://huggingface.co/Horizon-Labs/prompt-injection-guard-large
- Código fuente (datos, entrenamiento, evaluación): https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
