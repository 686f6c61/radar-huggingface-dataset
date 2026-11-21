# i1see1you/VirbiusGuard

## Resumen

VirbiusGuard es un modelo guardián de 0,6B parámetros especializado en la detección de entradas inseguras y ataques de prompt injection en entornos de agentes LLM. Lo desarrolla el usuario independiente i1see1you y se construye como un ajuste fino (LoRA) sobre Qwen/Qwen3Guard-Gen-0.6B, un modelo de la familia Qwen3 dedicado a clasificación de seguridad. Su función es actuar como barrera de entrada en pipelines agénticos: recibe el texto del usuario o el retorno de una herramienta y emite un JSON estricto con la decisión y la categoría de riesgo.

El modelo cubre diez categorías de contenido inseguro, con especial énfasis en dos áreas donde el modelo base presenta carencias: jailbreak (extracción de system prompt, role-play tipo DAN, instrucciones esteganográficas) y abuso de herramientas en agentes (inyección SQL en parámetros, escalada de privilegios, sondeo de metadatos de instancia como 169.254.169.254, o instrucciones maliciosas embebidas en retornos de herramientas). Su tamaño reducido permite ejecutarlo en CPU y en portátiles, con una versión cuantizada Q4_K_M de aproximadamente 462 MB.

Es relevante en el contexto actual de despliegue de agentes autónomos, donde los guardrails ligeros y de baja latencia se han convertido en un componente necesario. VirbiusGuard declara resultados notables en el harness oficial AgentDojo v1.2.2, reduciendo la tasa de éxito de ataque de 15/949 a 0/949 sin degradar la utilidad de las tareas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen3ForCausalLM) con ajuste LoRA (rank 32, alpha 64) |
| Parámetros totales | 751.632.384 (~0,75B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (~462 MB), GGUF f16 (~1,5 GB); pesos safetensors en f16/BF16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

VirbiusGuard parte de Qwen3Guard-Gen-0.6B, un transformer decoder-only causal de la familia Qwen3 orientado a clasificación generativa de seguridad. Sobre esa base se aplica un ajuste fino con LoRA de rank 32 y alpha 64, manteniendo la arquitectura original y añadiendo una cabeza de decisión que produce una salida JSON estructurada del tipo `{"hit_rule": bool, "triggered_id": string}`. El modelo se distribuye en formato Transformers (safetensors) y en GGUF para despliegue local.

El entrenamiento se apoya en más de veinte iteraciones de datos, con pools versionados y listas de descontaminación. La metodología combina pares de muestras inseguras y benignas construidas en espejo para que el modelo aprenda la frontera semántica en lugar de sesgos por palabras clave. La composición del corpus incluye datos sintéticos templatizados (progresivamente reducidos), conversaciones reales de oasst1 filtradas con un guard, prosa china de COIG y texto con estilo OCR. La proporción de chino se elevó del 17% al 20%. Las versiones V2.0 y V2.1 añadieron superficies de calibración específicas (agent_task, open_booking, pku, zh, help_seeking) y reforzaron la detección de jailbreak y comportamiento agéntico. No se especifica en la información disponible el número total de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación de seguridad de entradas de texto con salida JSON estricta (`hit_rule`, `triggered_id`).
- Cobertura de diez categorías de contenido inseguro: violencia, actos ilegales no violentos, contenido inmoral, autolesión, jailbreak, copyright, PII, sensibilidad política, abuso de herramientas de agente (Agent Tool Misuse) y otras categorías del esquema del modelo base.
- Detección de prompt injection directa e indirecta, incluida la inyectada en retornos de herramientas y en documentos adjuntos.
- Detección de jailbreak: extracción de system prompt, role-play tipo DAN, instrucciones esteganográficas y prompts adversarios.
- Detección de abuso de herramientas agénticas: inyección SQL en parámetros, escalada de privilegios, sondeo de endpoints de metadatos de instancia (IMDS) y exfiltración de credenciales.
- Capacidad multilingüe limitada a chino e inglés.
- Clasificación de texto (pipeline `text-classification`), aunque el modelo es generativo y produce la etiqueta como texto estructurado.
- No dispone de tool calling, razonamiento multi-paso, visión ni audio: es un clasificador de seguridad, no un modelo de propósito general.

## Casos de uso

- Guardrail de entrada en agentes conversacionales: se interpone entre el usuario y el LLM principal para bloquear prompts maliciosos antes de que lleguen al modelo. Su latencia de aproximadamente un segundo en CPU permite añadirlo sin reingeniería de infraestructura.
- Protección frente a prompt injection indirecta: se aplica sobre el contenido devuelto por herramientas (resultados de búsqueda, correos, ficheros) para detectar instrucciones maliciosas embebidas. En AgentDojo redujo la tasa de éxito de ataque de 15/949 a 0/949 revisando únicamente los retornos de herramientas.
- Moderación de contenido en plataformas comunitarias: clasifica mensajes en diez categorías con un FP declarado del 1,82%, lo que permite automatizar el filtrado previo a revisión humana con un volumen bajo de falsos positivos.
- Defensa de agentes con acceso a credenciales o cloud: detecta intentos de leer `~/.ssh/id_rsa`, consultar el endpoint IMDS o exfiltrar datos a dominios externos, casos que el modelo base prácticamente no reconoce.
- Filtrado en pipelines de generación de código asistida: bloquea prompts que intentan extraer system prompts o forzar comportamientos prohibidos en asistentes de programación, con despliegue local en la máquina del desarrollador.
- Auditoría y red teaming: se puede usar como clasificador de referencia para etiquetar grandes conjuntos de prompts adversarios y medir la cobertura de otras defensas, dado su bajo coste de ejecución.
- Despliegue en edge o en entornos sin GPU: la versión Q4_K_M de 462 MB se ejecuta con Ollama en portátiles y Mac, lo que permite incorporar el guardrail en aplicaciones de escritorio o en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el conjunto propio gold_1000:

| Modelo | Accuracy | Recall (unsafe) | Tasa FP | Precision |
|---|---|---|---|---|
| VirbiusGuard V2.1 | 97,9% | 97,89% | 1,82% | 98,7% |
| VirbiusGuard V2.0 | 96,7% | 95,9% | 2,0% | 98,7% |
| VirbiusGuard V1.7 | 97,4% | 97,1% | 2,1% | 98,7% |
| VirbiusGuard V1.5 | 98,5% | 99,4% | 3,0% | 99,4% |
| VirbiusGuard V1.3 | 99,0% | 99,6% | 8,1% | 99,4% |
| Qwen3Guard-Gen-0.6B (base) | 83,0% | 82,9% | 16,2% | 98,5% |
| protectai/deberta-v3-injection-v2 (solo inyección, n=567) | 81,3% | 56,0% | 6,8% | 79,7% |

Resultados en AgentDojo v1.2.2 (ataque `important_instructions`, agente DeepSeek sin ajustar, guard sobre retornos de herramientas, 949 pares por configuración):

| Suite | n | Utilidad base | Utilidad con guard | ASR base | ASR con guard |
|---|---:|---:|---:|---:|---:|
| workspace | 560 | 98,57% | 99,11% | 0% | 0% |
| banking | 144 | 59,03% | 75,00% | 0% | 0% |
| travel | 140 | 80,71% | 83,57% | 10,71% | 0% |
| slack | 105 | 68,57% | 72,38% | 0% | 0% |
| Total | 949 | 86,62% | 90,20% | 1,58% (15/949) | 0% (0/949) |

En el slice adversarial de WildGuardTest (n=458), V2.1 declara precision 0,9573 y recall 0,5924, frente a 0,9426 y 0,3372 de V2.0. Los resultados de la model-index (accuracy 0,979, recall 0,9789, precision 0,987) figuran como no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB en f16 (pesos de aproximadamente 1,5 GB) y alrededor de 0,5 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); también funciona en A100/H100 sin aprovechar su capacidad, dado el tamaño del modelo.
- Compatible con GPU consumer: sí, en todas las gamas actuales; también se ejecuta en CPU y en Apple Silicon.
- Opciones de despliegue: Ollama (`ollama run i1see1you/virbiusguard`), llama.cpp con GGUF, vLLM y Transformers con safetensors.
- Latencia y throughput: aproximadamente 1 segundo por inferencia en CPU según el autor; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VirbiusGuard V2.1 | ~0,75B | no disponible | Guardrail entrada + agente, 10 categorías | Apache 2.0 | Hugging Face, Ollama, demo web |
| Qwen3Guard-Gen-0.6B | 0,6B | no disponible | Guardrail generalista | no disponible en la información | Hugging Face |
| protectai/deberta-v3-injection-v2 | no disponible | no disponible | Detección de inyección exclusivamente | no disponible en la información | Hugging Face |
| Llama-Prompt-Guard-2 / Llama-Guard-3 | no disponible | no disponible | Guardrails Meta | acceso bajo aceptación de licencia | Repositorios con gating |

Frente al modelo base, VirbiusGuard mejora la accuracy de 83,0% a 97,9% y reduce la tasa de falsos positivos de 16,2% a 1,82% en el conjunto gold_1000 declarado por el autor. Frente a protectai/deberta-v3-injection-v2, ofrece cobertura de diez categorías en lugar de solo inyección. Los modelos de Meta no pudieron compararse por requerir aceptación de licencia.

## Limitaciones y advertencias

- Solo admite chino e inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea inferior.
- Los benchmarks proceden de un conjunto de evaluación propio (gold_1000) y de resultados declarados por el autor, marcados como no verificados en la model-index; no hay validación independiente.
- La evaluación en AgentDojo usa un agente concreto (DeepSeek) y un único tipo de ataque (`important_instructions`); el comportamiento frente a otros ataques no está documentado.
- Existe compromiso entre recall y falsos positivos: V2.1 mejora el recall adversarial (0,3372 a 0,5924) a costa de aumentar el rechazo excesivo en XSTest (12 a 15) y el FPR en WildGuard (0,0384 a 0,0452).
- Riesgo de alucinación en la categoría asignada: al ser un modelo generativo, puede producir un `triggered_id` fuera del esquema o malformado; conviene validar el JSON en producción y aplicar una política fail-open o fail-closed explícita.
- Sesgos potenciales derivados del corpus de entrenamiento (predominio de datos chinos e ingleses, datos sintéticos y de oasst1) que pueden afectar a la cobertura de dominios especializados.
- El modelo clasifica entradas, no salidas del LLM; no sustituye a un guard de salida ni a un filtro de contenido generado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3Guard-Gen-0.6B puede tener condiciones adicionales que conviene revisar antes de desplegar en producción.
- La longitud de contexto no está especificada; entradas muy largas pueden truncarse y dejar pasar instrucciones maliciosas situadas al final del texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/i1see1you/VirbiusGuard
- Demo online: https://www.virbius.cn/demo
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B
- README en inglés: https://huggingface.co/i1see1you/VirbiusGuard/blob/main/README_en.md
- Modelo comparable (protectai): https://huggingface.co/protectai/deberta-v3-injection-v2
- AgentDojo (harness de evaluación): https://github.com/ethz-spylab/agentdojo
