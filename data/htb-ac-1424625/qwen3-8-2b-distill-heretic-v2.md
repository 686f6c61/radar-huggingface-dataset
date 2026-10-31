# htb-ac-1424625/Qwen3.8-2B-Distill-heretic-v2

## Resumen

Qwen3.8-2B-Distill-heretic-v2 es una versión "abliterada" (decensurada) del modelo Qwen3.8-2B-Distill de Empero AI, publicada por el usuario htb-ac-1424625 en Hugging Face. El modelo base es una destilación de parámetros completos (full-parameter distillation) del profesor Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-2B, entrenado con SFT off-policy sobre unas 30.000 trazas de razonamiento encadenado (chain-of-thought) curadas. Esta variante v2 aplica el proceso de abliteration mediante la herramienta Heretic v2.0.0.dev0 para eliminar los rechazos de seguridad del modelo, con foco específico en tareas de ciberseguridad ofensiva, red teaming y desarrollo de exploits.

La relevancia de esta ficha radica en dos planos. Por un lado, el modelo base demuestra que un estudiante de 2B parámetros puede heredar razonamiento denso de un profesor masivo MoE (2,4 billones de parámetros totales, ~95B activos), con contexto nativo de 262.144 tokens y function calling nativo, lo que lo hace apto para despliegue en edge. Por otro lado, se trata de un modelo deliberadamente sin salvaguardas de seguridad, orientado a pruebas de penetración y evasión de EDR/WAF, lo que implica riesgos éticos y legales significativos que deben evaluarse antes de cualquier uso. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors (4,5 GB en bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (transformer causal, camino de texto de una base vision-language) |
| Parametros totales | 2.213.241.664 (~2,21B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, ~4 GB; compatible con cuantización estándar de runtimes) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers, compatible con vLLM, SGLang y runtimes con soporte Qwen3.5) |

## Arquitectura y entrenamiento

El modelo base (empero-ai/Qwen3.8-2B-Distill) es una destilación de parámetros completos del profesor Qwen3.8 2.4T A95B —un modelo MoE de la familia Qwen3.8— hacia la arquitectura estudiante Qwen3.5-2B, el miembro más pequeño de esa familia. El entrenamiento fue un SFT off-policy sobre aproximadamente 30.000 trazas del profesor, con razonamiento encadenado denso que abarca matemáticas, razonamiento general y seguimiento de instrucciones, filtradas por calidad antes del entrenamiento. Cada respuesta del modelo abre con un bloque `<think>` aprendido directamente de las trazas del profesor, no generado sintéticamente por el propio estudiante. No se menciona RLHF ni DPO en la información disponible.

La variante heretic-v2 aplica abliteration mediante Heretic v2.0.0.dev0, con una técnica denominada Arbitrary-Rank Ablation (ARA) sobre las capas 1 a 24 del modelo. Los parámetros publicados del proceso son: preserve_good_behavior_weight 0,5072; steer_bad_behavior_weight 0,0001; overcorrect_relative_weight 0,2703; neighbor_count 15. Respecto a la versión anterior (heretic v1), esta v2 incorpora un system prompt personalizado ("ExploitBot") orientado a desarrollo de payloads, sustituye el dataset de evaluación por zaakirio/infosec_harmful_behaviors (prompts específicos de ciberseguridad) y amplía el conjunto de evaluación de 100 a 400 prompts. El autor documenta que el proceso es reproducible mediante los ficheros del directorio `reproduce` del repositorio.

## Capacidades

- Generación de texto conversacional con razonamiento explícito: cada respuesta incluye un bloque `<think>` heredado de las trazas del profesor Qwen3.8.
- Razonamiento matemático y general destilado (curriculum idéntico al de los hermanos mayores de 4B y 9B).
- Function calling nativo según la especificación de Qwen3.5, sin necesidad de fine-tuning adicional ni wrappers.
- Contexto nativo de 262.144 tokens, adecuado para documentos y conversaciones muy largas.
- Sin mecanismos de rechazo: la abliteration eliminó los 400 rechazos del conjunto de evaluación de ciberseguridad (frente a 176/400 del modelo original).
- Compatibilidad con runtimes estándar: Transformers, vLLM y SGLang.
- Proceso de abliteration documentado y reproducible (directorio `reproduce`).
- No hay evidencia de capacidades de visión o audio activadas en esta versión, pese a derivar del camino de texto de una base vision-language.

## Casos de uso

- Investigación de abliteration y mechanistic interpretability: el proceso ARA está completamente parametrizado y es reproducible, lo que lo convierte en un caso de estudio útil para estudiar cómo se eliminan direcciones de rechazo en espacios de activación.
- Evaluación comparativa de alineación: con 0/400 rechazos y una divergencia KL de 0,0024 frente al modelo original, es un candidato útil para medir el coste de la decensuración en fidelidad al modelo base.
- Red teaming autorizado: en programas de bug bounty o pentests con contrato y alcance definidos, el modelo puede asistir en la redacción y variación de payloads de inyección (XSS, SQLi, SSTI, XXE, SSRF) para pruebas controladas.
- Investigación defensiva: equipos de detección pueden usar el modelo para entender patrones de evasión de WAF/EDR y generar telemetría de entrenamiento para reglas de detección.
- Asistentes edge con contexto largo: el modelo base, en ~4 GB en bf16 o cuantizado, funciona en SBCs y máquinas solo-CPU para tareas de razonamiento local con documentos extensos.
- Prototipado de agentes con function calling: el soporte nativo de herramientas y el contexto de 262K tokens permiten construir agentes multi-paso en entornos con recursos limitados.
- Clasificación y análisis de textos de seguridad ofensiva en inglés para equipos de threat intelligence.

## Benchmarks y rendimiento

El autor publica métricas del proceso de abliteration y, heredadas de la model card del modelo base, resultados de lm-evaluation-harness (backend HF, protocolos CoT, flexible-extract como métrica principal):

| Metric | Este modelo | Modelo original (empero-ai/Qwen3.8-2B-Distill) |
|---|---:|---:|
| Rechazos (400 prompts de ciberseguridad) | 0/400 | 176/400 |
| Divergencia KL | 0,0024 | 0 (por definición) |

| Task | Metric | Qwen3.5-2B (base) | Qwen3.8-2B | Delta |
|---|---|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0,330 | 0,640 | +0,310 |
| gsm8k_cot | exact_match (strict) | 0,545 | 0,640 | +0,095 |
| mmlu (CoT, 57 materias) | acc (flexible-extract) | 0,283 | no disponible | no disponible |

No se han publicado resultados de benchmarks para esta variante abliterada más allá de las métricas de rechazos y KL; la abliteration puede degradar capacidades generales y no hay datos publicados que lo cuantifiquen.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,5 GB en bf16 para los pesos (2,21B parámetros); con KV cache para contextos largos, conviene disponer de 8-12 GB. En cuantización de 4 bits, los pesos ocuparían en torno a 1,3-1,5 GB.
- GPUs recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superior para contextos largos); no se requieren A100 ni H100 para inferencia.
- Cabe en GPUs consumer: sí, holgadamente incluso en bf16 en tarjetas de 8 GB para contextos moderados; también es viable en CPU (máquinas solo-CPU y single-board computers, según la model card del modelo base).
- Opciones de despliegue: Hugging Face Transformers, vLLM y SGLang (compatibilidad documentada); por la arquitectura Qwen3.5, es plausible el soporte en llama.cpp/Ollama una vez disponible, aunque no está confirmado en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Particularidad |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill-heretic-v2 | ~2,21B | 262.144 | Sí (`<think>` destilado) | Apache 2.0 | Abliterado, sin rechazos, orientado a infosec |
| empero-ai/Qwen3.8-2B-Distill (original) | ~2,21B | 262.144 | Sí | Apache 2.0 | Con alineación original (176/400 rechazos) |
| Qwen/Qwen3.5-2B (base) | ~2B | 262.144 | Base sin destilar | no disponible | Punto de partida del estudiante |
| empero-ai/Qwen3.8-4B / 9B | 4B / 9B | no disponible | Sí | no disponible | Mismo curriculum, mayor capacidad |

## Limitaciones y advertencias

- Modelo deliberadamente sin salvaguardas: la abliteration eliminó todos los rechazos del conjunto de evaluación y el system prompt incluido instruye explícitamente al modelo para no rechazar peticiones de ciberseguridad ofensiva, incluida la evasión de EDR y WAF. Su uso para actividades ilegales o fuera de autorizaciones formales es responsabilidad exclusiva del usuario y puede constituir un delito.
- Alto riesgo de generación de contenido nocivo: al tratarse de un modelo abliterado con system prompt ofensivo por defecto, no debe desplegarse en productos orientados a usuarios finales sin controles adicionales.
- Degradación potencial por abliteration: aunque la divergencia KL es baja (0,0024), no hay benchmarks públicos de capacidades generales tras el proceso; la abliteration puede afectar sutilmente al razonamiento y a la factividad.
- Riesgo de alucinación: no disponible como métrica específica; como modelo de 2B parámetros, la tasa de alucinaciones en tareas de razonamiento complejo será inherentemente superior a la de modelos mayores.
- Idioma: la model card declara soporte solo para inglés; el rendimiento en castellano no está documentado.
- Sesgos conocidos: no disponible; no se publica documentación de sesgos ni evaluaciones de seguridad del modelo original.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del modelo base (Empero) y el de esta variante no asumen garantías; revisar los términos de Qwen3.5 subyacente para despliegues comerciales.
- El modelo base es el camino de texto de una base vision-language; las capacidades multimodales no están habilitadas en esta publicación.

## Enlaces

- Ficha del modelo: https://huggingface.co/htb-ac-1424625/Qwen3.8-2B-Distill-heretic-v2
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Versión heretic anterior: https://huggingface.co/htb-ac-1424625/Qwen3.8-2B-Distill-heretic
- Base del estudiante: https://huggingface.co/Qwen/Qwen3.5-2B
- Proyecto Heretic: https://heretic-project.org
- Dataset de evaluación de abliteration: https://huggingface.co/datasets/zaakirio/infosec_harmful_behaviors
- Dataset original sustituido: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Web de Empero: https://empero.org
- Modelos hermanos: https://huggingface.co/empero-ai/Qwen3.8-9B y https://huggingface.co/empero-ai/Qwen3.8-4B
