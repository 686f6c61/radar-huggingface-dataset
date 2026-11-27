# Sayansantra/LFM3-2.0B-WSP-V4

## Resumen
LFM3-2.0B-WSP-V4 es un modelo de lenguaje de 2.017 millones de parámetros (2,02B) especializado en uso de herramientas y function calling, desarrollado por el usuario Sayansantra. Se construye a partir de LFM3-1.7B-WSP-V3, que a su vez deriva de LiquidAI/LFM3-1.7B, mediante tres técnicas propias: expansión selectiva de profundidad (de 1,7B a 2,02B parámetros y 29 capas), SFT agéntico sobre las nuevas capas con fusión de vectores de tarea (λ = 0,25) y una programación de pesos quirúrgica denominada IrrGuard (α = 0,05) orientada a mejorar el rechazo de llamadas irrelevantes.

El modelo resuelve un problema muy concreto: ejecutar llamadas a funciones con alta precisión en un envelope de memoria mínimo. Con apenas 4,03 GB en bfloat16, declara un 88,88 % de precisión en el promedio AST Non-Live Python de BFCL v3 y un 74,42 % en live_simple, lo que según el autor le permite superar a modelos hasta 13 veces más grandes en divisiones de múltiples llamadas (parallel y parallel_multiple).

Es relevante ahora porque demuestra que técnicas de weight-space programming y expansión de capas pueden llevar capacidades agénticas de nivel frontier a modelos por debajo de 3B, aptos para despliegue en una sola GPU consumer. La ventana de contexto declarada es de 262.144 tokens, lo que lo sitúa en la liga de modelos mucho mayores para tareas de agente con historial largo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LFM3) con expansión selectiva de profundidad hasta 29 capas |
| Parámetros totales | 2.017.366.016 (2,02B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16; compatible con cuantización estándar vía transformers) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (license_name: lfm1.0, license_link: LICENSE) |
| Formato de pesos | safetensors (bfloat16, repo de 4,1 GB) |

## Arquitectura y entrenamiento
La base es un transformer decoder-only de la familia LFM3 de LiquidAI. Sobre el checkpoint LFM3-1.7B-WSP-V3, el autor aplica una expansión selectiva de profundidad que añade capas nuevas hasta alcanzar 29 y 2,02B parámetros. Posteriormente realiza un SFT agéntico específico sobre esas capas nuevas, combinando los pesos resultantes mediante fusión de vectores de tarea con un coeficiente λ = 0,25. Finalmente aplica IrrGuard, una programación en el espacio de pesos con α = 0,05 diseñada para reforzar el comportamiento de rechazo ante funciones irrelevantes.

Los datos de entrenamiento declarados incluyen el Berkeley Function Calling Leaderboard (gorilla-llm/Berkeley-Function-Calling-Leaderboard), trayectorias de tool calling de zake7749/deepseek-v4-pro-agent-tool-calling-trajectory, Motif-Technologies/agenttracer-bfcl y saidutta69/fable-5-premium. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset. No se documenta el uso de RLHF o DPO; el pipeline descrito es SFT más manipulación de pesos. El modelo requiere código personalizado (tag custom_code) para cargarse con transformers.

## Capacidades
- Generación de texto conversacional y razonamiento de un solo turno.
- Function calling y tool calling con evaluación AST oficial de BFCL, incluyendo llamadas simples, múltiples, paralelas y paralelas múltiples.
- Manejo de escenarios de irrelevancia (rechazo de llamadas cuando la función no aplica), con un 48,75 % declarado en la división irrelevance.
- Capacidades agénticas orientadas a trayectorias multi-paso, según los datasets de entrenamiento empleados.
- Ventana de contexto de 262.144 tokens para historiales largos de agente.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso
- Orquestación de agentes con herramientas: el modelo puede decidir qué función invocar, con qué argumentos y en qué orden en flujos multi-paso, gracias a su entrenamiento sobre trayectorias agénticas y a su contexto de 262.144 tokens.
- Automatización de APIs internas: con un 91,50 % en simple_python y multiple, es adecuado para enrutar peticiones de usuario hacia endpoints concretos con validación de esquema.
- Ejecución de llamadas paralelas: su 88,00 % en parallel permite resolver consultas que requieren varias invocaciones simultáneas (por ejemplo, consultar clima, vuelos y calendario en una sola pasada).
- Despliegue en entornos con recursos limitados: con 4,03 GB en bfloat16 cabe en GPUs consumer, lo que habilita asistentes de código o de operaciones en estaciones de trabajo sin clúster.
- Guardarraíl de rechazo de herramientas: la división irrelevance y el ajuste IrrGuard lo orientan a evitar invocaciones espurias en asistentes de atención al cliente donde no todas las funciones están siempre disponibles.
- Prototipado rápido de pipelines de function calling: su tamaño permite iterar localmente con transformers antes de escalar a modelos mayores, usando BFCL como conjunto de validación.
- Integración en CI/CD para pruebas de contrato de herramientas: puede generar y validar llamadas contra esquemas OpenAPI en pruebas automatizadas.

## Benchmarks y rendimiento

| Modelo | Tamaño activo | simple_python (400) | multiple (200) | parallel (200) | parallel_multiple (200) | Non-Live Python AST | live_simple (258) | irrelevance (240) | Macro avg 6 splits |
|---|---|---|---|---|---|---|---|---|---|
| LFM3-2.0B-WSP-V4 (parcheado 1536t + prompt fix) | 2,02B | 91,50 % | 91,50 % | 88,00 % | 84,50 % | 88,88 % | 74,42 % | 48,75 % | 79,78 % |
| LFM3-2.0B-WSP-V4 (single-pass 768t) | 2,02B | 90,00 % | 91,00 % | 85,00 % | 83,00 % | 87,25 % | 72,48 % | 48,75 % | 78,37 % |
| Qwen3.8-27B (BF16) | 27B | — | 97,00 % | 82,50 % | 83,50 % | — | 87,98 % | — | — |
| gpt-4.1-mini-2025-04-14 | Cloud mini | — | 91,50 % | 91,50 % | 87,00 % | — | 73,30 % | — | — |
| Gemma 4 26B-A4B-it | 26B (3,8B act.) | — | 93,00 % | 93,00 % | 92,50 % | 89,13 % | 86,82 % | 91,25 % | — |
| Gemini 3.8 Flash | Cloud flash | 94,00 % | — | — | — | — | — | — | — |
| Claude-Opus-4-5-20251101 (FC) | Frontier | — | — | — | — | 73,76 % | 70,97 % | — | — |

Datos declarados por el autor del modelo (verified: false) sobre BFCL v3, 1.498 tareas, con decodificación determinista (do_sample=False) y grader AST oficial. El autor documenta que en la evaluación single-pass de 768 tokens, 38 de 1.498 generaciones alcanzaron el límite y 6 tareas de simple_python devolvieron un placeholder literal "KEY"; la reevaluación de esas 45 tareas con max_new_tokens=1536 y prompt limpio recuperó 21 de 45, reduciendo los truncamientos a 10 de 1.498 (0,67 %). Los ficheros JSONL de predicciones en crudo están incluidos en el repositorio.

## Requisitos de hardware
- VRAM estimada: aproximadamente 4,03 GB en bfloat16 para los pesos; en la práctica, entre 6 y 8 GB con caché KV para contextos moderados. Con contexto de 262.144 tokens la caché KV crece de forma significativa y exige GPUs de mayor memoria.
- GPU recomendadas: A100 40/80 GB, H100 para contextos largos; RTX 4090 (24 GB) para inferencia en bfloat16 con contextos medios.
- Cabe en GPU consumer: sí, en bfloat16 en tarjetas de 8 GB o más para contextos cortos; en RTX 3060/4060 Ti de 12-16 GB con contextos mayores.
- Opciones de despliegue: transformers (requiere custom_code), endpoints compatibles según el tag endpoints_compatible; no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Non-Live Python AST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-2.0B-WSP-V4 | 2,02B | 262.144 | 88,88 % | lfm1.0 | Hugging Face |
| Qwen3.8-27B | 27B | No disponible | No disponible | No disponible | Hugging Face |
| Gemma 4 26B-A4B-it | 26B (3,8B act.) | No disponible | 89,13 % | No disponible | No disponible |
| gpt-4.1-mini-2025-04-14 | Cloud mini | No disponible | No disponible | Propietaria | API |

Frente a Qwen3.8-27B, el modelo declara ventaja en parallel (88,00 % vs. 82,50 %) y parallel_multiple (84,50 % vs. 83,50 %), aunque queda por detrás en multiple (91,50 % vs. 97,00 %) y live_simple (74,42 % vs. 87,98 %). Frente a Gemma 4 26B-A4B-it queda a 0,25 puntos en Non-Live Python AST pero muy por detrás en irrelevance (48,75 % vs. 91,25 %) y live_simple. Frente a gpt-4.1-mini iguala en multiple y supera ligeramente en live_simple, pero pierde en parallel y parallel_multiple.

## Limitaciones y advertencias
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (verified: false); no proceden de una evaluación independiente.
- El rendimiento en irrelevance es bajo (48,75 %), lo que implica riesgo de invocar funciones cuando no corresponde.
- El autor documenta truncamientos en generaciones largas (0,67 % tras el parche) y un fallo de placeholder "KEY" en tareas de simple_python, corregido solo mediante reevaluación dirigida.
- Los datos de evaluación se presentan tanto en single-pass como parcheados; la cifra principal (88,88 %) corresponde al escenario parcheado, no a una única pasada.
- No se especifican idiomas soportados ni sesgos conocidos; la model card está íntegramente en inglés y orientada a function calling.
- La licencia lfm1.0 (license: other) puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE antes de producción.
- Requiere custom_code para cargarse en transformers, lo que añade fricción en pipelines estándar.
- El modelo es un fine-tune de terceros sobre LFM3 de LiquidAI; no hay garantía de soporte ni mantenimiento por parte del autor original.
- Riesgo de alucinación en argumentos de funciones no cubiertas por el entrenamiento; conviene validar esquemas en el lado servidor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Sayansantra/LFM3-2.0B-WSP-V4
- Modelo base: https://huggingface.co/Sayansantra/LFM3-1.7B-WSP-V3
- Modelo original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset BFCL: https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
- Leaderboard BFCL: https://gorilla.cs.berkeley.edu/leaderboard.html
- Referencia Qwen3.8-27B: https://huggingface.co/greghavens/Qwen3.8-27B-bnb-4bit
- Referencia gpt-4.1-mini en BFCL: https://github.com/UKGovernmentBEIS/inspect_evals/blob/main/src/inspect_evals/bfcl/README.md
- Referencia Gemma 4 en BFCL: https://algollabs.com/blog/gemma4-bfcl
- Referencia Gemini 3.8 Flash: https://dev.to/gde/gemini-4-or-gemma-4-it-depends-2o18
