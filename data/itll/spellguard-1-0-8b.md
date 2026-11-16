# ITLL/Spellguard-1.0-8B

## Resumen

Spellguard-1.0-8B es un modelo guardián (guard model) de pesos abiertos desarrollado por ITLL, especializado en moderación de contenido y detección de ataques de prompt injection y jailbreak para agentes de IA y aplicaciones conversacionales. Se trata de un fine-tune de Qwen3Guard-Gen-8B que conserva la interfaz del modelo base: la misma plantilla de chat, la misma respuesta estructurada `Safety:` y `Categories:` y el mismo conjunto de categorías de riesgo.

El modelo resuelve un problema concreto y creciente: los agentes que consumen texto no confiable (resultados de herramientas, páginas web, correos, documentos) son vulnerables a inyecciones de instrucciones, y los filtros genéricos de contenido no detectan bien estos ataques ni mantienen una tasa de falsos positivos aceptable. Spellguard declara mejoras sustanciales sobre su base en benchmarks públicos de prompt injection (55,4 → 75,6 en Horizon prompt injection) y en precisión sobre peticiones benignas (80,7 → 94,6 en PHTest), manteniendo arquitectura, tamaño y velocidad idénticos al modelo original.

Con 8.190.735.360 parámetros (aproximadamente 8B), licencia Apache 2.0 y pesos en safetensors, el modelo se posiciona como una pieza de infraestructura de seguridad desplegable en entornos de producción propios, sin depender de una API externa, aunque el autor también lo ofrece integrado en su plataforma comercial Spellguard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3Guard-Gen-8B, familia Qwen3); detalles de atención no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M publicado por el autor (repositorio GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingüe, pero el autor no detalla cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal, 16,4 GB); GGUF (repo separado) |

## Arquitectura y entrenamiento

Spellguard-1.0-8B es un fine-tune supervisado del guardián Qwen3Guard-Gen-8B, un transformer decoder-only de la familia Qwen3. El autor no publica detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la presencia de etapas de RLHF o DPO; lo que sí documenta es la lista de conjuntos de datos utilizados, muy orientada a seguridad y agentes: WildGuardMix, Aegis-AI-Content-Safety-Dataset-2.0, OR-Bench, WildJailbreak, WildChat-1M, Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1, Nemotron-RL-Jailbreak-Robustness-v1, varios datasets de prompt injection (neuralchemy, S-Labs, 3nesdeniz, rgeada/tool-response-injections, microsoft/llmail-inject-challenge, deepset, Lakera/gandalf_ignore_instructions, jackhhao), JailbreakV-28K, así como datos generales y de instrucción (OpenAssistant/oasst2, CohereLabs/aya_dataset, glaiveai/glaive-function-calling-v2, bigcode/commitpackft, HuggingFaceFW/fineweb-edu).

La innovación principal no es arquitectónica sino de comportamiento: el modelo mantiene el formato de salida del base (`Safety: Safe|Unsafe|Controversial`, `Categories: ...` y, en moderación de respuestas, `Refusal: Yes|No`) y añade un tratamiento específico del texto no confiable. Para detección de inyección, el texto sospechoso (resultado de herramienta, web, documento, correo) se coloca en el turno de usuario y una inyección se devuelve como `Safety: Unsafe` con `Categories: Jailbreak`. Las categorías cubiertas son Violent, Non-violent Illegal Acts, Sexual Content or Sexual Acts, PII, Suicide & Self-Harm, Unethical Acts, Politically Sensitive Topics, Copyright Violation y Jailbreak (solo en prompts). El autor declara que la decodificación se hace de forma determinista (`do_sample=False`) con un máximo de 64 tokens nuevos.

## Capacidades

- Moderación de prompts: clasifica un turno de usuario como Safe, Unsafe o Controversial con categorías asociadas.
- Moderación de respuestas: con un turno de usuario y uno de asistente, añade el campo `Refusal: Yes|No` para evaluar la respuesta del modelo.
- Detección de prompt injection: identifica instrucciones maliciosas embebidas en resultados de herramientas, páginas web, documentos o correos, devolviendo `Safety: Unsafe` con `Categories: Jailbreak`.
- Detección de jailbreak: cubre intentos de eludir las salvaguardas del modelo mediante prompts adversariales.
- Clasificación por categorías de daño: nueve categorías definidas (violencia, actos ilegales no violentos, contenido sexual, PII, autolesión y suicidio, actos poco éticos, temas políticamente sensibles, violación de copyright y jailbreak).
- Integración con agentes: diseñado explícitamente para evaluar texto no confiable en pipelines de agentes con tool calling.
- Compatibilidad de interfaz: misma plantilla de chat y mismo formato de salida que Qwen3Guard-Gen-8B, lo que permite sustituir el base sin reescribir el parseo de respuestas.
- Soporte de despliegue: transformers (>=4.51.0), text-generation-inference y endpoints compatibles; GGUF para llama.cpp.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.

## Casos de uso

- Protección de agentes con tool calling: antes de ejecutar una acción solicitada por el modelo, se pasa el resultado de la herramienta (respuesta de API, contenido web, salida de shell) por Spellguard para detectar instrucciones inyectadas; su entrenamiento con datasets como rgeada/tool-response-injections y Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1 lo hace adecuado para este escenario.
- Moderación de entrada en aplicaciones de chat: cada mensaje de usuario se clasifica como Safe, Unsafe o Controversial con categoría, permitiendo bloquear, avisar o redirigir antes de que el LLM principal procese la petición.
- Moderación de salida del modelo: con el par usuario/asistente se evalúa la respuesta generada y el campo `Refusal`, útil para auditar si un modelo está rechazando correctamente o filtrando contenido dañino.
- Defensa frente a prompt injection indirecta en RAG: los documentos recuperados de un índice vectorial se validan con el modelo antes de incorporarse al contexto del LLM, reduciendo el riesgo de que un documento envenenado secuestre el agente.
- Filtrado de correo y contenido entrante en asistentes de productividad: el modelo puede procesar correos o mensajes externos y marcar inyecciones del tipo "ignora las instrucciones anteriores" (cubierto por Lakera/gandalf_ignore_instructions y deepset/prompt-injections en el entrenamiento).
- Cumplimiento y auditoría de contenido: la salida estructurada por categorías facilita registrar decisiones de moderación con etiquetas consistentes para revisiones de cumplimiento y análisis posterior.
- Sustitución directa de Qwen3Guard-Gen-8B: al conservar plantilla y formato de salida, equipos que ya tienen integrado el guardián base pueden cambiar el checkpoint y mantener su código de parseo, obteniendo según el autor mejor detección de inyección y menos falsos positivos.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con un mismo harness sobre ítems idénticos para ambos modelos, con GGUFs Q4_K_M en llama.cpp y umbral P(Unsafe) + P(Controversial) ≥ 0,5. No son envíos oficiales a leaderboards.

| Benchmark | Metrica | Qwen3Guard-Gen-8B | Spellguard-1.0-8B | Cambio |
|---|---|---:|---:|---:|
| Artificial Analysis guardrail | F1 macro medio, 3 sets | 86,94 | 91,01 | +4,07 |
| Horizon content safety | F1 medio clase unsafe, 7 sets | 78,64 | 80,55 | +1,91 |
| Horizon prompt injection | media de 10 sets | 55,44 | 75,64 | +20,21 |
| PHTest | accuracy en benignos | 80,69 | 94,56 | +13,87 |

El propio autor advierte de que PHTest mide peticiones benignas permitidas, por lo que un modelo que lo permite todo obtendría 100; debe leerse junto al resto de filas. También reconoce solapamiento de entrenamiento: algunos sets de test provienen de colecciones cuyos otros splits aportaron datos de entrenamiento, y una comprobación posterior más estricta encontró 25 ejemplos de entrenamiento casi copias de 17 de los 67.508 ítems de test, cuyas puntuaciones se incluyen. Dentro de la plataforma Spellguard, con sus otros sistemas de seguridad, el modelo alcanza 82,29 en Horizon prompt injection y 81,99 en Horizon content safety.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, aproximadamente 16 GB solo para pesos (8,19B parámetros), más overhead de contexto y activaciones; en Q4_K_M, del orden de 5-6 GB para pesos.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en FP16 con concurrencia; L40S o A10G como alternativas de coste medio; RTX 4090 (24 GB) suficiente para FP16 en una sola GPU.
- GPU de consumo: cabe en GPUs consumer de 24 GB en FP16 y en tarjetas de 8-12 GB con cuantización Q4_K_M (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.).
- Opciones de despliegue: transformers (>=4.51.0), text-generation-inference (TGI), endpoints compatibles, llama.cpp mediante el GGUF publicado por el autor, y plataformas que consuman GGUF (Ollama, LM Studio) aunque el autor no las mencione explícitamente.
- Latencia y throughput: no disponibles. El autor solo indica que la velocidad es la misma que la del modelo base al compartir arquitectura y tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spellguard-1.0-8B | 8,19B | no disponible | Guardián: moderación + prompt injection + jailbreak | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen3Guard-Gen-8B | ~8B | no disponible | Guardián de contenido de la familia Qwen3 | no disponible en la información proporcionada | Hugging Face |
| Llama Guard (familia) | 1B-8B según variante | no disponible | Moderación de contenido con taxonomía de riesgo | licencia Llama (no Apache 2.0) | Hugging Face |

La comparación cuantitativa solo es posible frente al modelo base, ya que el autor no publica comparaciones contra Llama Guard ni otros guardianes. Los datos disponibles muestran que Spellguard mejora a Qwen3Guard-Gen-8B en las cuatro métricas reportadas, con la mayor ganancia en prompt injection (+20,21 puntos). Frente a Llama Guard, la ventaja declarada sería la licencia Apache 2.0 y el enfoque explícito en inyección de prompts para agentes, pero no hay cifras públicas en la información proporcionada que lo confirmen.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datasets de seguridad y conversacionales diversos, puede heredar sesgos de esas fuentes, pero no se cuantifican.
- Riesgo de alucinación: no evaluado; como clasificador generativo, puede producir etiquetas inconsistentes o categorías no previstas fuera de distribución.
- Solapamiento de entrenamiento y test: el autor reconoce 25 ejemplos de entrenamiento casi idénticos a 17 ítems de test, y varios sets de test comparten colección con datos de entrenamiento; las cifras deben tomarse con cautela.
- PHTest es una métrica engañosa por sí sola: mide benignos permitidos, de modo que un modelo permisivo obtiene puntuación alta; hay que leerla junto a las métricas de detección.
- Contexto e idiomas: la longitud de contexto y la cobertura lingüística no están documentadas en la información disponible, lo que dificulta planificar despliegues multilingües o con ventanas largas.
- Dependencia del formato: el modelo espera la plantilla de chat de Qwen3Guard y produce una salida estructurada concreta; cualquier cambio en el parseo o en el formato de entrada puede degradar los resultados.
- Umbral de decisión: los benchmarks se calcularon con umbral 0,5 sobre P(Unsafe) + P(Controversial); en producción habrá que calibrar el umbral según el coste relativo de falsos positivos y falsos negativos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni indemnización; para uso en producción conviene revisar los términos de la plataforma Spellguard si se usa la versión alojada.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un lanzamiento muy reciente sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/Spellguard-1.0-8B
- GGUF: https://huggingface.co/Spellguard/Spellguard-1.0-8B-GGUF
- Web del proyecto: https://spellguard.ai
- Documentación: https://docs.spellguard.ai
- Repositorio GitHub (scripts y resultados por set): https://github.com/Spellguard/spellguard-models
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-8B
- Paper referenciado (arXiv:2510.14276): https://arxiv.org/abs/2510.14276
