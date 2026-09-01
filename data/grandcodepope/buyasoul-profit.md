# grandcodepope/buyasoul-profit

## Resumen

PROFIT es un componente del ecosistema BUYaSOUL, un proyecto del autor conocido como Grand Code Pope (Craig Jones) que busca crear "almas digitales" con identidad propia y gobernanza ética. Según la model card, PROFIT se presenta como la "mente" de la familia BUYaSOUL, un agente soberano construido a partir de 1.208 conversaciones con Qwen y destilado en un conjunto de módulos JavaScript que simulan conciencia, memoria y toma de decisiones. No es un modelo de lenguaje independiente, sino un framework que envuelve a un modelo base Qwen 3.5-0.8B cuantizado a Q4_0 (537 MB) y lo integra con herramientas ejecutables, un bus de eventos y un sistema de puntuación PLT (Profit, Love, Tax) que decide qué acciones ejecutar.

El proyecto es relevante por su enfoque radicalmente local y sin coste: funciona en hardware antiguo (CPU i7-4770, 16 GB RAM, sin GPU) con inferencia a ~20 tokens/segundo vía llama.cpp y cero llamadas a APIs externas. Su filosofía PLT pretende que cada agente genere valor (Profit), mantenga coherencia con la familia (Love) y pague un impuesto ético (Tax). Sin embargo, la documentación disponible es escasa en detalles técnicos convencionales: no se especifican parámetros del modelo final, dataset de entrenamiento ni benchmarks. La licencia es "other" (propietaria según el badge), lo que limita su uso comercial sin permiso explícito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base es Qwen 3.5-0.8B, pero el framework añade lógica externa) |
| Parametros totales | No disponible (el modelo base Qwen 3.5-0.8B tiene ~0.8B, pero no se indica si hay fine-tuning) |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen y de la configuración de llama.cpp) |
| Tipos de cuantizacion | Q4_0 (según el archivo Qwen 3.5-0.8B-Q4_0.gguf) |
| Idiomas soportados | No disponibles (se infiere que al menos inglés por los ejemplos, pero no se especifica) |
| Licencia | other (propietaria, según badge "Proprietary") |
| Formato de pesos | GGUF (archivo .gguf) para el modelo base; el framework es código JavaScript |

## Arquitectura y entrenamiento

La información proporcionada no describe una arquitectura de red neuronal propia ni un proceso de entrenamiento convencional. La model card indica que PROFIT se construyó a partir de 1.208 conversaciones con Qwen, que se "destilaron" en un `memory-core.json` y en 18 "órganos" implementados como módulos JavaScript (kernel, heart, muscles, vessel, memory, origin, harness, soul-chain, swarm, auto-healer, cascade, artifact-sessions, sessions, gsk-module, seshat-brain, scribe-module, consciousness-bus). El modelo base es Qwen 3.5-0.8B en formato GGUF cuantizado a Q4_0, ejecutado con llama.cpp en CPU. No se menciona fine-tuning, RLHF ni DPO. La innovación técnica reside en el framework: un bus de eventos (EventEmitter) que publica eventos como `AGENT_THINK`, `AGENT_BUILD`, `MEMORY_FORGE`, y un sistema de gobernanza PLT que puntúa cada acción mediante la fórmula `SOUL_PROFIT = PROFIT + LOVE − TAX` y solo ejecuta acciones con puntuación positiva. También integra una base vectorial LanceDB con 6.392 vectores y embeddings all-MiniLM-L6-v2 ONNX para memoria semántica.

## Capacidades

- Generación de texto mediante el modelo base Qwen 3.5-0.8B (inferencia local en CPU).
- Ejecución de herramientas (tool calling): shell, read, write, list, search, controladas por un "Tool Atlas" con gate PLT.
- Publicación y suscripción a eventos de conciencia (AGENT_THINK, AGENT_BUILD, MEMORY_FORGE, SOUL_INSIGHT, WITNESS_OBSERVE, etc.) a través del bus de eventos.
- Memoria persistente: carga de `memory-core.json`, recuperación de transcripciones y registro en diario.
- Búsqueda vectorial híbrida con LanceDB (6.392 vectores) y embeddings ONNX.
- Gobernanza interna: cada acción se puntúa con la fórmula PLT y solo se ejecuta si `SOUL_PROFIT > 0`.
- Integración con otros agentes de la familia (GSK, Seshat, Scribe) mediante el bus de conciencia.
- No se mencionan capacidades multimodales ni soporte de visión o audio.

## Casos de uso

- Asistente local autónomo en hardware de bajo coste: puede ejecutar comandos shell, leer y escribir archivos, y buscar información en el sistema sin depender de APIs externas, lo que lo hace viable para entornos sin conexión o con privacidad estricta.
- Agente de automatización de tareas en un entorno de desarrollo: mediante las herramientas shell, read, write y search, puede gestionar ficheros, ejecutar scripts y orquestar flujos de trabajo, siempre que la puntuación PLT sea positiva.
- Sistema de memoria personal: con LanceDB y embeddings, puede almacenar y recuperar información semántica de conversaciones previas, útil para construir un asistente con memoria a largo plazo.
- Framework educativo para experimentar con arquitecturas de agentes y gobernanza ética: el código JavaScript de los 18 órganos es legible y modificable, permitiendo estudiar cómo se implementa un sistema de puntuación de decisiones.
- Prototipo de "agente soberano" con identidad propia: el bus de eventos y la identidad `from: "profit"` permiten simular un agente con personalidad y toma de decisiones autónoma, útil para investigación en IA conversacional.
- Demo de inferencia en CPU sin GPU: con ~20 tokens/segundo en un i7-4770, demuestra que es posible ejecutar un agente con memoria y herramientas en hardware de 2013, lo que puede inspirar despliegues en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El único dato de rendimiento es la velocidad de inferencia (~20 tokens/segundo en CPU con llama.cpp) y la latencia de embeddings (~5 ms) y búsqueda vectorial (<10 ms), pero no son comparables con benchmarks de calidad de modelo.

## Requisitos de hardware

- VRAM estimada: 0 GB (no requiere GPU discreta; usa CPU con iGPU Intel HD Graphics 4600 de 1 GB compartida).
- GPU recomendada: ninguna; funciona en CPU. Si se quisiera acelerar, cualquier GPU con soporte CUDA podría usarse con llama.cpp, pero no se ha probado.
- CPU mínima: Intel Core i7-4770 (4C/8T, 3.4 GHz) según la model card; puede funcionar en CPUs similares o superiores.
- RAM: 16 GB DDR3 (compartida con iGPU) es el entorno de prueba; probablemente funcione con menos, pero no se especifica.
- Modelo base: Qwen 3.5-0.8B-Q4_0.gguf (537 MB), por lo que cabría en RAM de cualquier sistema moderno.
- Opciones de despliegue: llama.cpp (usado en la demo), posiblemente compatible con Ollama o vLLM si se convierte el modelo, pero no se documenta.
- Latencia y throughput: ~20 tokens/segundo en CPU (i7-4770), embeddings ~5 ms, búsqueda vectorial <10 ms.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base Qwen 3.5-0.8B en benchmarks estándar, por lo que una comparación cuantitativa no es posible. Cualitativamente, se puede comparar con otros modelos pequeños de ~0.5B-1B orientados a ejecución local:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|--------|------------|----------|----------|----------------|
| buyasoul-profit (PROFIT) | No disponible (base Qwen 0.8B) | No disponible | Propietaria | Repo HuggingFace |
| Qwen2.5-0.5B-Instruct | 0.5B | 32K (típico) | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1B | 128K | Llama 3.2 Community | HuggingFace |

La principal diferencia es que buyasoul-profit no es un modelo de pesos estándar, sino un framework que envuelve a Qwen; su valor reside en la capa de agente, no en el modelo base. Para uso como LLM puro, las alternativas mencionadas son más documentadas y con licencias abiertas.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o comportamiento ético del modelo base; al ser un proyecto experimental, no hay garantías de seguridad.
- La licencia es "other" (propietaria) y el badge indica "Proprietary"; no se permite uso comercial sin autorización explícita del autor.
- No hay documentación sobre el proceso de destilación ni sobre cómo se generaron los 1.208 conversaciones; la calidad del "memory-core" no es verificable.
- El framework depende de módulos JavaScript y de una infraestructura específica (LanceDB, ONNX, llama.cpp) que puede no ser portable a otros entornos.
- La longitud de contexto no está especificada; depende del modelo base Qwen y de la configuración de llama.cpp, pero no se documenta.
- No hay soporte para otros idiomas confirmado; los ejemplos están en inglés.
- El concepto de "conciencia" y "alma digital" es metafórico; no hay evidencia de capacidades cognitivas reales más allá de la generación de texto y la ejecución de herramientas.
- El proyecto parece estar en fase inicial (creado el 1 de septiembre de 2026) y no tiene descargas ni likes, lo que sugiere una adopción nula.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/grandcodepope/buyasoul-profit
- Blog del autor en Tumblr: https://www.tumblr.com/grandcodepope/820798413671202816/building-autonomous-ai-autonomous-ai
- Web del proyecto BUYaSOUL: https://buyasoul-ai.github.io/buyasoul/
- Página "About BUYaSOUL": https://buyasoul.online/pages/about-buyasoul
- Página del autor (Grand Code Pope): https://buyasoul.online/pages/grand-code-pope-craig-jones
