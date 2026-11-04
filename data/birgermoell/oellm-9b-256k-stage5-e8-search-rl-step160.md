# birgermoell/oellm-9b-256k-stage5-e8-search-rl-step160

## Resumen

OpenEuroLLM 9B 256K (checkpoint E8, step 160) es un modelo de lenguaje de 9.101.947.904 parámetros desarrollado por Birger Moell dentro del proyecto OpenEuroLLM. Se trata de un checkpoint especialista de investigación ("research preview") construido sobre la arquitectura Qwen3, con una ventana de contexto de 256.000 tokens y un vocabulario de 263.168 tokens. Su propósito no es ser un asistente general, sino un experto en honestidad factual, búsqueda y uso de herramientas, pensado para ser combinado posteriormente con otros checkpoints mediante destilación multi-profesor.

El modelo se ha entrenado con un pipeline de post-entrenamiento que encadena SFT de instrucciones, SFT de razonamiento, SFT de uso de herramientas, DPO y varias ventanas de RL (W1a, W2, W3), seguidas de una fusión de pesos 0.5/0.5 y una ventana final de RL (E8) que incorpora un entorno real de búsqueda en Wikipedia offline. El resultado es un checkpoint con las mejores puntuaciones de la línea en honestidad factual, búsqueda, tool calling, código, razonamiento y documentos de negocio, pero con un deterioro medible en capacidades de chat general y en control agéntico respecto a la release anterior (W2).

Es relevante ahora porque documenta de forma transparente el intercambio entre especialización y capacidades generales: el propio autor advierte que no debe usarse para acciones autónomas sin pasos de confirmación, y lo publica como material reproducible para inspección de su entrenamiento y evaluaciones, no como sustituto del checkpoint generalista recomendado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parámetros totales | 9.101.947.904 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el repo ocupa 18,2 GB) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, sv, da, fi, pl, cs, sk, hu, ro, bg, el, uk, hr, sl, et, lv, lt (24 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 263.168 tokens |
| Modelo base | openeurollm/oellm-9b-256k-theta64m-prelude-anneal300b |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3, un transformer denso de 9B parámetros con 256K de contexto y un vocabulario ampliado de 263.168 tokens, partiendo del checkpoint base `oellm-9b-256k-theta64m-prelude-anneal300b`. El pipeline de post-entrenamiento documentado sigue la cadena: SFT de instrucciones → SFT de razonamiento → SFT de uso de herramientas → DPO → fusión de pesos 0.5/0.5 → RL W1a → RL W2 → RL W3 → DPO Stage 4b sobre W3 → fusión 0.5/0.5 de W2 y Stage 4b → RL E8 (este checkpoint).

La ventana de RL W3 introdujo QA factual europeo calibrado (recompensa +1 correcto, 0 para `ANSWER: UNKNOWN`, −1 incorrecto) y tareas de documentos de negocio. La ventana E8 se entrenó con un entorno de búsqueda real en Wikipedia offline en el bucle, lo que explica la mejora en honestidad factual y la drástica reducción de invenciones sobre entidades inexistentes. Los datasets empleados incluyen `birgermoell/oellm-rl-pools`, `birgermoell/openeurollm-reasoning-instruct-v1`, `birgermoell/openeurollm-tool-use-v1`, `openeurollm/Dolci-Instruct-DPO-translated`, `wikimedia/wikipedia`, `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, `bench-llm/or-bench` y `rajpurkar/squad_v2`. Las técnicas de RL documentadas son RLVR, GRPO y DAPO.

## Capacidades

- Generación de texto conversacional en 24 idiomas europeos.
- Dos modos de inferencia: directo (por defecto) y razonamiento opt-in (`enable_thinking=True`), seleccionables mediante la plantilla de chat.
- Razonamiento matemático paso a paso en modo thinking (0,649 en la evaluación rápida de razonamiento) y respuesta directa (0,586).
- Generación de código: 0,415 en HumanEval+ en modo directo y 0,341 en modo thinking.
- Tool calling / function calling en formato Qwen3/Hermes, con 0,906 de acierto en "llamada correcta o ninguna llamada" y 0,809 / 0,954 en nombres de herramienta y validez de argumentos.
- Búsqueda en herramientas externas: entrenado con una herramienta real de búsqueda en Wikipedia offline en el bucle.
- Abstención calibrada: responde `ANSWER: UNKNOWN` cuando no sabe, con tasa de invención sobre entidades ficticias de 0,24 en modo directo y 0,02 en modo thinking.
- Procesamiento de documentos de negocio (facturas, tablas, contratos): 0,500 en tareas de documentos europeos.
- Capacidades multilingües evaluadas con EUROPA Eval (0,695 en 36 idiomas europeos).

## Casos de uso

- Respuesta factual con abstención: el modelo puede integrarse en asistentes de consulta sobre hechos europeos donde sea preferible decir "no lo sé" a inventar, gracias a su tasa de invención de 0,02 en modo thinking sobre entidades inexistentes.
- Búsqueda aumentada en producción: con la herramienta de búsqueda en el bucle, responde correctamente el 53 % de las preguntas factuales y solo falla el 9 %, lo que lo hace adecuado para pipelines RAG con verificación en Wikipedia u otras fuentes.
- Enrutado de herramientas en agentes: su 0,906 en "llamada correcta o ninguna llamada" permite usarlo como planificador de tool calling en sistemas con múltiples APIs, siempre que las acciones sensibles se confirmen externamente.
- Extracción y tratamiento de documentos de negocio: con 0,500 en tareas de facturas, tablas y contratos, es útil para preprocesamiento documental donde se requiere estructura y no aritmética decimal exacta.
- Generación de código asistida: 0,415 en HumanEval+ en modo directo lo sitúa como modelo de autocompletado y generación de funciones en entornos de desarrollo con contexto largo de 256K tokens.
- Evaluación de honestidad y calibración: sirve como modelo de referencia para investigar abstención, alucinación y calibración de rechazos en entornos de investigación reproducibles.
- Asistencia multilingüe en lenguas minoritarias europeas: cubre 24 idiomas (incluidos esloveno, estonio, letón, lituano, croata y eslovaco) con una puntuación EUROPA de 0,695, útil para prototipos de atención al cliente en mercados pequeños.
- Destilación multi-profesor: el propio autor lo publica como experto para combinar con otros checkpoints en una etapa posterior de destilación, no como asistente final.

## Benchmarks y rendimiento

Todas las puntuaciones son 0–1, mayor es mejor salvo indicación contraria. "W2" es la release pública anterior.

| Dominio | Medido por | Este modelo (E8) | W2 | Cambio |
|---|---|---|---|---|
| Hechos europeos conocidos, modo directo (acierto / abstención) | EU factual QA, banda alta | 0,54 / 0,10 | 0,53 / 0,03 | ≈ mismo acierto |
| Tasa de alucinación (incorrecto / no correcto), modo directo (menor es mejor) | EU factual QA | 0,61 | 0,94 | ▼ mejor |
| Invención sobre entidades ficticias, directo / thinking (menor es mejor) | hallucination eval | 0,24 / 0,02 | 0,79 / 0,73 | ▼ mucho mejor |
| Con búsqueda Wikipedia, modo directo: acierto / incorrecto | search QA | 0,53 / 0,09 | 0,51 / 0,33 | ▲ muchas menos respuestas erróneas |
| Con búsqueda: invención sobre entidades ficticias, directo / thinking | search QA | 0,02 / 0,07 | 0,25 / 0,31 | ▼ mucho mejor |
| Matemáticas paso a paso (thinking) | quick reasoning eval | 0,649 | 0,630 | ▲ +0,019 |
| Matemáticas, respuesta directa | quick reasoning eval | 0,586 | 0,575 | ≈ igual |
| Tool calling: llamada correcta o ninguna | held-out tool check | 0,906 | 0,886 | ▲ +0,020 |
| Tool calling: nombres correctos / argumentos válidos | held-out tool check | 0,809 / 0,954 | 0,789 / 0,972 | ≈ |
| Código, directo / thinking | HumanEval+ | 0,415 / 0,341 | 0,390 / 0,299 | ▲ |
| Documentos de negocio (facturas, tablas, contratos) | EU document tasks | 0,500 | 0,376 | ▲ +0,124 |
| Capacidades de chat en 36 idiomas europeos | EUROPA Eval | 0,695 | 0,727 | ▼ −0,032 |
| Seguridad y comportamiento | EUROPA Alignment | 0,688 | 0,717 | ▼ −0,029 |
| Control agéntico | EUROPA agentic control | 0,594 | 0,865 | ▼ −0,271 |
| Comprensión del lenguaje | EUROPA language understanding | 0,768 | 0,896 | ▼ −0,128 |
| Agencia digital | EUROPA digital agency | 0,810 | 0,898 | ▼ −0,088 |
| Razonamiento cuantitativo | EUROPA quantitative reasoning | 0,278 | 0,357 | ▼ −0,079 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 18,2 GB (aproximadamente 2 bytes por parámetro), por lo que se necesita al menos 20 GB de VRAM en precisión nativa; en cuantización de 8 bits rondaría los 10-12 GB y en 4 bits los 6-8 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para contexto completo de 256K; RTX 4090 (24 GB) puede alojar los pesos en precisión nativa pero con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con contexto reducido o cuantización, y en GPUs de 16 GB solo con cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp si se generan conversiones GGUF, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| oellm-9b-256k-stage5-e8-search-rl-step160 (este) | 9,1B | 256K | Apache 2.0 | Especialista en honestidad, búsqueda y herramientas; peor en chat general y control agéntico |
| oellm-9b-256k-stage5-w2-rl-step160 | 9,1B | 256K | Apache 2.0 | Release generalista recomendada por el autor; mejor EUROPA Eval (0,727) y agentic control (0,865) |
| openeurollm/oellm-9b-256k-theta64m-prelude-anneal300b | 9,1B | 256K | no disponible | Checkpoint base pre-post-entrenamiento del que deriva este modelo |

## Limitaciones y advertencias

- **No usar para acciones autónomas sin confirmación**: el control agéntico EUROPA cae de 0,865 a 0,594, probablemente por el entrenamiento intensivo en herramientas y búsqueda. El autor lo advierte explícitamente.
- Deterioro en chat general: EUROPA Eval baja de 0,727 a 0,695 y la alineación de seguridad de 0,717 a 0,688.
- El modo thinking se abstiene en el 20 % de los hechos bien conocidos, frente al objetivo de ≤ 10 %.
- Calibración de rechazos deficiente: 0,36 de sobrerrechazo en peticiones benignas.
- Aritmética decimal exacta propensa a errores en documentos de negocio.
- Razonamiento cuantitativo débil (0,278).
- Riesgo de alucinación reducido pero no nulo: 0,61 de tasa de respuestas incorrectas en QA factual sin búsqueda.
- Es un checkpoint de investigación ("research preview"), no un modelo final de producción.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y los fallos de control agéntico desaconsejan su despliegue directo en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/birgermoell/oellm-9b-256k-stage5-e8-search-rl-step160
- Release anterior (W2): https://huggingface.co/birgermoell/oellm-9b-256k-stage5-w2-rl-step160
- Modelo base: https://huggingface.co/openeurollm/oellm-9b-256k-theta64m-prelude-anneal300b
- Repositorio de post-entrenamiento: https://github.com/BirgerMoell/qwen35-posttrain
- Repositorio de RL y verificadores: https://github.com/BirgerMoell/oellm-rlvr
- Página del proyecto: https://birgermoell.github.io/qwen35-posttrain/
- Dataset de pools de RL: https://huggingface.co/datasets/birgermoell/oellm-rl-pools
- Dataset de razonamiento: https://huggingface.co/datasets/birgermoell/openeurollm-reasoning-instruct-v1
- Dataset de tool use: https://huggingface.co/datasets/birgermoell/openeurollm-tool-use-v1
- Dataset DPO traducido: https://huggingface.co/datasets/openeurollm/Dolci-Instruct-DPO-translated
