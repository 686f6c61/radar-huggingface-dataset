# mradermacher/GPT-Distill-Qwen3-8B-Spellguard-SLERP-GGUF

## Resumen
GPT-Distill-Qwen3-8B-Spellguard-SLERP-GGUF es la versión cuantizada en formato GGUF de un modelo de 8.190 millones de parámetros derivado de la familia Qwen3. Lo publica mradermacher, un conocido autor de cuantizaciones estáticas, a partir de los pesos originales de ITLL/GPT-Distill-Qwen3-8B-Spellguard-SLERP. El modelo base combina un ajuste fino supervisado (SFT) con una fusión de pesos mediante mergekit (técnica SLERP) sobre Qwen3-8B, orientada a tareas de seguridad, moderación de contenido y detección de ataques de prompt injection y jailbreak.

La relevancia del modelo está en su especialización: no es un modelo generalista, sino un guardrail pensado para desplegarse junto a agentes de IA y sistemas conversacionales. Los tags de la model card (safety, guardrail, content-moderation, prompt-injection, jailbreak-detection, ai-agents) y la larga lista de datasets de entrenamiento —WildGuardMix, Aegis-AI-Content-Safety-Dataset-2.0, Nemotron-RL-Agentic-Indirect-Prompt-Injection, JailbreakV-28k, entre otros— confirman ese enfoque. El contexto máximo no está documentado en la información disponible.

La versión GGUF facilita el despliegue en entornos con recursos limitados mediante llama.cpp y derivados, con cuantizaciones desde Q2_K (3,4 GB) hasta f16 (16,5 GB). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que resulta atractivo para integrarlo en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), pesos fusionados con mergekit (SLERP) y ajuste SFT |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 73,4 GB |
| Modelo base | ITLL/GPT-Distill-Qwen3-8B-Spellguard-SLERP |
| Libreria | transformers |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-8B, un transformer decoder-only denso. Sobre esa base, el autor original (ITLL) aplicó una fusión de pesos con mergekit usando SLERP, combinando probablemente un checkpoint de Qwen3-8B con un ajuste fino especializado en seguridad. Posteriormente se realizó un ajuste supervisado (SFT, con Unsloth según los tags) sobre una mezcla amplia de datasets de seguridad y razonamiento.

La composición del entrenamiento es heterogénea y cubre varias familias: moderación de contenido (wildguardmix, Aegis-AI-Content-Safety-Dataset-2.0, or-bench), detección de jailbreak (wildjailbreak, JailbreakV-28k, jackhhao/jailbreak-classification, Lakera/gandalf_ignore_instructions), prompt injection agéntica (Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1, neuralchemy/Prompt-injection-dataset, S-Labs/prompt-injection-dataset, rgeada/tool-response-injections, microsoft/llmail-inject-challenge), uso de herramientas (glaive-function-calling-v2, interstellarninja/tool-calls-single-reasoning), código (commitpackft), conversación multilingüe (oasst2, aya_dataset) y datos de razonamiento destilados de modelos mayores (Jackrong/gpt-oss-120B, Qwen3-235B-Thinking). También se incluye fineweb-edu como corpus general. No se documenta el número exacto de tokens de entrenamiento ni si hubo una fase de RLHF o DPO posterior; los tags mencionan chain-of-thought y reasoning, lo que sugiere que el modelo puede emitir trazas de razonamiento antes de la respuesta final.

## Capacidades
- Detección y clasificación de contenido dañino o inseguro (moderación de contenido).
- Detección de prompt injection directa e indirecta, incluyendo inyecciones en respuestas de herramientas (tool-response injections).
- Detección de jailbreak y de intentos de eludir instrucciones del sistema.
- Razonamiento con cadena de pensamiento (chain-of-thought) para justificar clasificaciones de seguridad.
- Soporte de tool calling / function calling, heredado del entrenamiento con glaive-function-calling-v2.
- Capacidad de operar como guardrail dentro de pipelines de agentes de IA.
- Generación de texto conversacional multilingüe (entrenado con oasst2 y aya_dataset, aunque el idioma declarado es solo inglés).
- Comprensión de código (commitpackft), útil para revisar contenido generado por agentes de código.

## Casos de uso
- Moderación de contenido en plataformas: el modelo clasifica mensajes de usuario y respuestas del asistente como seguros o inseguros, apoyándose en los datasets WildGuardMix y Aegis 2.0 con los que fue entrenado.
- Guardrail de entrada en agentes de IA: se coloca delante del agente para filtrar prompts maliciosos antes de que lleguen al modelo principal, cubriendo inyecciones directas e indirectas.
- Detección de prompt injection en respuestas de herramientas: al inspeccionar el output de APIs y herramientas externas, detecta instrucciones inyectadas en tool responses (entrenado con rgeada/tool-response-injections y llmail-inject-challenge).
- Filtrado de jailbreaks en asistentes públicos: identifica intentos de manipulación como los de Gandalf o JailbreakV-28k, permitiendo bloquear la conversación o escalar a revisión humana.
- Auditoría de seguridad de pipelines de código: gracias al entrenamiento con commitpackft, puede revisar fragmentos de código o diffs en busca de contenido malicioso o instrucciones ocultas.
- Enrutamiento de conversaciones en atención al cliente: clasifica la intención y el riesgo de cada turno para decidir si responde el modelo generativo o se activa un protocolo de seguridad.
- Evaluación offline de red teams: se usa como clasificador de referencia para medir la tasa de jailbreak de otros modelos durante pruebas de robustez.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 4-5 GB con Q4_K_M (5,1 GB de fichero), 6-7 GB con Q5_K_M/Q6_K, 9-10 GB con Q8_0 y en torno a 17 GB con f16, añadiendo overhead de contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para cuantizaciones altas; A100/H100 para despliegues concurrentes de alta capacidad.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 8 GB o más; Q2_K y Q3_K_S permiten incluso GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. Para mayor throughput en servidor, vLLM o TGI requerirían los pesos en safetensors del modelo base, no el GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| GPT-Distill-Qwen3-8B-Spellguard-SLERP (este) | 8,19 B | no disponible | Guardrail, moderación, prompt injection | Apache 2.0 | GGUF y safetensors |
| Llama Guard 3 8B (Meta) | 8 B | 128 K (según documentación pública de Meta) | Moderación de contenido | Llama 3 Community License | safetensors, GGUF |
| Qwen3Guard / Qwen3 8B base | 8 B | 32 K o superior (según variante) | Guardrail o modelo generalista | Apache 2.0 | safetensors, GGUF |
| ShieldGemma 9B (Google) | 9 B | 8 K (según documentación pública) | Moderación de contenido | Gemma Terms of Use | safetensors, GGUF |

La comparación con Llama Guard 3 y ShieldGemma se basa en datos públicos de sus respectivas documentaciones; el rendimiento relativo de este modelo no puede evaluarse sin benchmarks publicados.

## Limitaciones y advertencias
- Solo se declara inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está garantizado aunque se haya entrenado con aya_dataset.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier clasificador de seguridad; conviene calibrar umbrales con datos propios.
- El modelo puede alucinar justificaciones en su cadena de razonamiento; las clasificaciones deben tratarse como señales, no como verdades absolutas.
- No hay benchmarks publicados que permitan verificar su robustez frente a ataques adversariales nuevos.
- Es una fusión SLERP de pesos, lo que puede degradar capacidades generales respecto al Qwen3-8B original.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden tener sus propias condiciones; conviene revisarlas antes de un despliegue en producción.
- El repo GGUF ocupa 73,4 GB por incluir todas las cuantizaciones; descargar solo la variante necesaria.
- No se documenta la longitud de contexto efectiva; en producción debe validarse empíricamente antes de confiar en ventanas largas.

## Enlaces
- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/GPT-Distill-Qwen3-8B-Spellguard-SLERP-GGUF
- Modelo base: https://huggingface.co/ITLL/GPT-Distill-Qwen3-8B-Spellguard-SLERP
- Página de descargas del autor: https://hf.tst.eu/model#GPT-Distill-Qwen3-8B-Spellguard-SLERP-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit: https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggerganov/llama.cpp
