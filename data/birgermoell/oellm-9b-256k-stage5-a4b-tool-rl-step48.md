# birgermoell/oellm-9b-256k-stage5-a4b-tool-rl-step48

## Resumen

OpenEuroLLM 9B 256K (checkpoint stage5-a4b-tool-rl-step48) es un modelo de lenguaje multilingüe de 9.101.947.904 parámetros desarrollado por Birger Moell dentro del proyecto OpenEuroLLM, construido sobre la arquitectura Qwen3 y con una ventana de contexto de 256K tokens. Se trata de un checkpoint intermedio del pipeline de post-entrenamiento del proyecto, publicado como "research preview" para que los pasos, datos y evaluaciones puedan inspeccionarse y reproducirse.

El modelo resuelve el problema de disponer de un asistente conversacional con soporte de tool calling y razonamiento optimizado para las lenguas europeas, entrenado íntegramente en infraestructura europea (superordenador Leonardo de CINECA, mediante una asignación de EuroHPC AI Factory). Su pipeline de post-entrenamiento consta de seis etapas: SFT instruct, SFT de razonamiento, SFT de tool use, DPO, merge de pesos y aprendizaje por refuerzo sobre llamadas a herramientas, que es justamente el estado que representa este checkpoint.

Es relevante ahora porque ofrece un modelo abierto (licencia Apache 2.0) con cobertura de 21 idiomas europeos, modo de razonamiento opcional y buen rendimiento en tool calling (88,1 % de decisiones correctas de llamada), aunque el propio autor advierte de que existe un checkpoint posterior más capaz y que este no es un asistente terminado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder) |
| Parametros totales | 9.101.947.904 (≈9,1B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 256K tokens (RoPE θ = 64M) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 21: en, de, fr, es, it, pt, nl, sv, da, fi, pl, cs, sk, hu, ro, bg, el, uk, hr, sl, et, lv, lt (36 según la model card en la evaluación EUROPA) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de la base `openeurollm/oellm-9b-256k-theta64m-prelude-anneal300b`, un transformer de arquitectura Qwen3 con 9B de parámetros, contexto de 256K tokens gracias a RoPE con θ = 64M, vocabulario de 263.168 tokens y embeddings sin atar (untied). El post-entrenamiento se ejecutó en el booster Leonardo de CINECA (NVIDIA A100 de 64 GB) con una asignación de EuroHPC AI Factory.

El pipeline consta de seis etapas: SFT instruct (3,14M filas / 2,37B tokens, la model card se corta en ese punto), SFT de razonamiento, SFT de tool use, DPO, merge de pesos y, finalmente, aprendizaje por refuerzo sobre llamadas a herramientas (este checkpoint, step 48 de la ventana A4b). Los datos usados incluyen mezclas propias de razonamiento y tool use, DPO traducido (Dolci-Instruct-DPO), HelpSteer3 de NVIDIA, UltraFeedback limpio de Argilla, exámenes tipo test de la UE, matemáticas con RLVR (verificable), y datasets agénticos de NVIDIA (Nemotron-RL-Agentic) junto con xlam-irrelevance para aprender a no llamar herramientas cuando no procede. Todos los datos se pre-tokenizaron offline con un tokenizador y una plantilla de chat fijados por hash, y las filas demasiado largas se descartan en lugar de truncarse.

## Capacidades

- Generacion de texto conversacional en modo directo (direct mode) por defecto.
- Modo de razonamiento opcional (thinking mode, `enable_thinking=True`) con trazas de razonamiento, aunque con fiabilidad limitada.
- Tool calling en formato Qwen3/Hermes (`<tools>` en el turno de sistema, `<tool_call>{…}</tool_call>` en las respuestas, `<tool_response>` para resultados), con JSON válido en el 99,5 % de los casos.
- Decision de no llamar a herramientas cuando no es pertinente (entrenada con xlam-irrelevance-7.5k).
- Razonamiento matematico paso a paso en modo thinking (0,442 en eval rápida) y respuestas directas (0,577).
- Generacion de codigo basica (HumanEval+ 0,354 en modo directo), aunque es su punto debil.
- Comprension lectora multilingue solida (Belebele 0,824) y gramatica europea muy alta (MultiBLiMP 0,932).
- Cobertura multilingue europea: chat evaluado en 36 lenguas europeas (EUROPA Eval 0,670) y conocimiento regional europeo (INCLUDE 0,542).
- Comportamiento seguro y bien formado (EUROPA Alignment 0,670, el mejor de su linaje).
- No hay indicios de capacidades de vision ni audio.

## Casos de uso

- Orquestacion de herramientas y agentes: el modelo emite llamadas en formato Qwen3/Hermes con JSON valido en el 99,5 % de los casos y sabe abstenerse de llamar cuando no procede, lo que lo hace apto para pipelines agénticos de un solo paso.
- Asistentes conversacionales multilingues en Europa: con 21 idiomas soportados y EUROPA Eval de 0,670, sirve para chatbots en lenguas poco cubiertas por otros modelos abiertos (estonio, letón, lituano, esloveno, etc.).
- Extraccion y consulta de APIs en productos: el formato de tool calling estandar permite integrarlo en backends que exponen funciones (busquedas, reservas, consultas de datos) con parseo fiable de argumentos (0,969 de validez).
- Comprension de documentos largos: la ventana de 256K tokens permite procesar documentos extensos, informes o corpus legales europeos completos en una sola pasada.
- Evaluacion y investigacion reproducible: al ser un checkpoint publicado explicitamente para inspeccion, es util como punto de partida para estudiar el efecto del RL sobre tool calling comparando checkpoints del mismo linaje.
- Generacion de respuestas cuantitativas en chat: DPO, merge y RL mejoraron las respuestas cuantitativas de 0,04 a 0,31 en EUROPA, útil para consultas con cifras en contexto conversacional.
- Prototipado de asistentes con razonamiento opt-in: se puede activar el thinking mode para tareas que se beneficien de trazas, aceptando su tasa de finalizacion limitada (~51 % dentro de 6K tokens).

## Benchmarks y rendimiento

Datos publicados en la model card (escala 0–1, mayor es mejor):

| Benchmark | Este modelo | Tool-use SFT (step 3) | Cambio |
|---|---|---|---|
| EUROPA Eval (chat, 36 lenguas) | 0,670 | 0,616 | ▲ +0,054 |
| EUROPA Alignment (seguridad) | 0,670 | 0,642 | ▲ +0,028 |
| Matematicas thinking mode | 0,442 | 0,435 | ≈ igual |
| Matematicas modo directo | 0,577 | 0,581 | ≈ igual |
| Trazas thinking completadas (≤6K tokens) | 0,511 | 0,511 | ≈ igual |
| Tool calling: decision correcta | 0,881 | 0,870 | ▲ +0,011 |
| Tool calling: nombres de herramienta | 0,784 | 0,734 | ▲ +0,050 |
| Tool calling: argumentos validos | 0,969 | 0,981 | ▼ -0,012 |
| HumanEval+ (modo directo) | 0,354 | 0,335 | ▲ +0,019 |
| Belebele (comprension lectora) | 0,824 | 0,821 | ≈ igual |
| Global-MMLU (conocimiento) | 0,587 | 0,584 | ≈ igual |
| INCLUDE (conocimiento regional UE) | 0,542 | 0,539 | ≈ igual |
| MultiBLiMP (gramatica) | 0,932 | 0,930 | ≈ igual |

Datos adicionales de la model card: MBPP+ 0,36 en modo directo; JSON valido en tool calls 99,5 %; respuestas cuantitativas en EUROPA mejoraron de 0,04 a 0,31; respuestas malformadas reducidas de 122 a 100. Comparativa externa: por encima de Apertus-8B-Instruct en EUROPA Eval (0,57), pero por debajo de los modelos instruct SFT (0,76) y DPO (0,84) del mismo proyecto, que pertenecen a otro linaje de SFT. El checkpoint posterior `oellm-9b-256k-stage5-w2-rl-step160` mejora matematicas thinking de 0,44 a 0,63 y EUROPA Eval de 0,67 a 0,73.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-19 GB solo de pesos (repo de 18,2 GB en safetensors), mas overhead de KV cache; con cuantizacion de 8 bits cabria en torno a 10 GB, aunque no hay cuantizaciones oficiales publicadas (no disponible).
- GPUs recomendadas: una RTX 4090 (24 GB) o RTX 5090 deberia alojar el modelo en BF16 con contexto moderado; para contextos de 256K completos se recomienda A100 64 GB o H100, que es ademas el hardware usado en el entrenamiento.
- Cabe en GPUs de consumo de gama alta (24 GB) para inferencia con contexto corto-medio; no cabe en GPUs de 8-12 GB sin cuantizacion, que no esta publicada oficialmente.
- Opciones de despliegue: transformers (libreria nativa, compatible con text-generation-inference y endpoints de Hugging Face); no hay evidencia de soporte verificado en vLLM, llama.cpp u Ollama para este checkpoint concreto (no disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | EUROPA Eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oellm-9b-256k-stage5-a4b-tool-rl-step48 | 9,1B | 256K | 0,670 | Apache 2.0 | Hugging Face, safetensors |
| Apertus-8B-Instruct | 8B | no disponible | 0,57 (según model card) | no disponible | Hugging Face |
| oellm-9b-256k-stage5-w2-rl-step160 (checkpoint posterior) | 9,1B | 256K | 0,73 | Apache 2.0 | Hugging Face, safetensors |

El checkpoint posterior del mismo proyecto supera a este en razonamiento matematico thinking (0,63 frente a 0,44), EUROPA Eval (0,73 frente a 0,67), EUROPA Alignment (0,72 frente a 0,67), codigo y tool calling, por lo que el autor recomienda usarlo salvo necesidad de reproducir exactamente este checkpoint.

## Limitaciones y advertencias

- Es un research preview explicito: checkpoint intermedio, no un asistente terminado; el propio autor recomienda el checkpoint posterior step160.
- El thinking mode es poco fiable: cerca de la mitad de las trazas no terminan dentro del limite de 6K tokens, y el modo thinking rinde peor que el modo directo en matematicas y codigo.
- Codigo debil: HumanEval+ 0,354 y MBPP+ 0,36 en modo directo, con peores resultados en thinking mode.
- Regresiones tras DPO: grounding y seguridad (0,70 → 0,58), calibracion de rechazos (0,44 → 0,35) y matematicas en lenguas de la UE en modo directo (0,45 → 0,31).
- Riesgo de alucinacion: no cuantificado en la model card, pero el descenso en grounding sugiere mayor riesgo de respuestas no fundamentadas; las respuestas malformadas (100 en la ultima evaluacion) siguen presentes.
- Argumentos de tool calling empeoraron ligeramente tras RL (0,981 → 0,969), y el nombre correcto de herramienta falla en ~22 % de los casos (0,784).
- Ventana de contexto de 256K: el entrenamiento descartaba filas largas en lugar de truncarlas, por lo que el comportamiento real con contextos extremos no esta documentado (no disponible).
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Sesgos conocidos: no disponible en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/birgermoell/oellm-9b-256k-stage5-a4b-tool-rl-step48
- Modelo base: https://huggingface.co/openeurollm/oellm-9b-256k-theta64m-prelude-anneal300b
- Checkpoint posterior recomendado: https://huggingface.co/birgermoell/oellm-9b-256k-stage5-w2-rl-step160
- Repositorio del pipeline de post-entrenamiento (SFT/DPO): https://github.com/BirgerMoell/qwen35-posttrain
- Repositorio del plano de control de RL (RLVR): https://github.com/BirgerMoell/oellm-rlvr
- Pagina del proyecto (plan y registro): https://birgermoell.github.io/qwen35-posttrain/
