# hmkz-1981/gemma-4-e4b-agentic-rl-think-r5

## Resumen

gemma-4-e4b-agentic-rl-think-r5 es un ajuste fino del modelo google/gemma-4-E4B-it orientado a uso agéntico, publicado por el usuario hmkz-1981. El modelo parte de la familia Gemma 4 de Google y aplica un post-entrenamiento por refuerzo (GRPO) con recompensas verificables programáticamente, siguiendo la filosofía de NVIDIA Nemotron-3.5-Bolt. El resultado es un modelo pequeño (7.941.100.874 parámetros totales según los pesos en safetensors) especializado en seguimiento de instrucciones, jerarquía de instrucciones y uso de herramientas.

El problema que aborda es concreto: los modelos pequeños suelen fallar al priorizar instrucciones del sistema frente a las del usuario o frente a contenido inyectado en resultados de herramientas, y descuidan restricciones de formato. Este ajuste refuerza esas conductas mediante rondas sucesivas de RL, SFT con destilación de pistas y autodestilación, con evaluación específica en IFEval, IFBench, IHEval, BFCL-v3 y MultiChallenge.

Es relevante para desarrolladores que necesitan un modelo compacto desplegable en infraestructura modesta, con soporte bilingüe japonés-inglés, tool calling nativo y un modo de razonamiento opcional (thinking). La licencia Apache 2.0 facilita su integración comercial, aunque las capacidades de conocimiento factual no mejoran respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E4B); no se detalla variante MoE ni SSM en la informacion disponible |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 15,9 GB) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-4-E4B-it, un transformer de la familia Gemma 4. El post-entrenamiento se realizó con LoRA (r=32) y fusión de pesos en cada etapa, usando pérdida de tipo DAPO con 8 respuestas por pregunta y entrenamiento en modo thinking. El proceso consta de cinco rondas de GRPO intercaladas con etapas de SFT:

- Ronda 1: GRPO sobre siete tareas propias (seguimiento de instrucciones, jerarquía de instrucciones, uso de herramientas, salida estructurada, respuestas con fundamento, multiturno y conversación), con recompensas verificadas por programa y ejecución real de herramientas durante el entrenamiento.
- SFT con destilación de pistas: se hacen resolver al propio modelo conductas que el base nunca lograba (prioridad de reglas del sistema, reglas revocadas, aclaración de peticiones ambiguas) con pistas, conservando solo respuestas que pasan la verificación sin filtrar la pista.
- Rondas 2 y 3: GRPO con filtro de dificultad; en la ronda 3 se añade práctica de responder dentro del ámbito cuando el sistema lo delimita, para corregir el exceso de rechazos.
- Ronda 4: GRPO con 54 tipos de restricciones no vistas, orientado a IFBench.
- Autodestilización (SFT): cuatro intentos por problema de restricciones, conservando solo respuestas que cumplen todas; para problemas no resueltos se añaden respuestas de Nemotron-3.5-Bolt-E4B que sí los cumplen, mezclando datos originales para evitar olvido.
- Ronda 5: GRPO con OpenAI IH-Challenge (verificado con el código de puntuación incluido) y datos de seguimiento de instrucciones de NVIDIA, para recuperar la jerarquía de instrucciones debilitada por la autodestilización.

Los codificadores de imagen y audio se mantienen sin entrenar respecto al modelo base.

## Capacidades

- Generación de texto conversacional en japonés e inglés.
- Seguimiento estricto de instrucciones con restricciones de formato, longitud y uso de palabras.
- Jerarquía de instrucciones: prioriza las directivas del sistema sobre las del usuario y sobre instrucciones embebidas en resultados de herramientas (resistencia a inyección de prompts).
- Uso de herramientas (tool calling / function calling): invoca herramientas solo cuando es necesario, gestiona errores e información incompleta, y maneja identificadores inválidos.
- Salida estructurada (JSON, CSV y otros formatos verificables).
- Respuestas con fundamento (grounded answers) y conversación multiturno.
- Modo thinking opcional mediante `chat_template_kwargs: {"enable_thinking": true}` (desactivado por defecto).
- Modo conversacional para lectura en voz alta mediante `{"conversational_mode": true}`: respuestas de dos frases como máximo y sin Markdown.
- Capacidades de imagen y audio heredadas del modelo base, sin ajuste específico.

## Casos de uso

- Agentes con tool calling en producción: el modelo decide cuándo invocar una función, valida identificadores y recupera de errores, lo que lo hace adecuado para pipelines de automatización con APIs externas.
- Asistentes con instrucciones de sistema estrictas: su entrenamiento en jerarquía de instrucciones permite usarlo en entornos donde las reglas del operador deben prevalecer sobre peticiones del usuario o contenido de herramientas.
- Generación de salidas estructuradas: producción de JSON o CSV conformes a esquemas para integración en sistemas de datos, con buen rendimiento medido en tareas `struct`.
- Atención al cliente bilingüe japonés-inglés: conversaciones multiturno con restricciones de tono y formato, y modo conversacional para respuestas breves aptas para síntesis de voz.
- Sistemas RAG con respuestas fundamentadas: combinado con recuperación documental, dado que el modelo no mejora el conocimiento factual del base y requiere fuentes externas para precisión.
- Aplicaciones de voz o lectura: el modo conversacional genera respuestas de dos frases sin Markdown, adecuadas para TTS.
- Filtrado y clasificación con rechazo controlado: cuando se delimita el ámbito mediante el sistema, responde dentro del ámbito y rechaza fuera de él (0,95 en ámbito y 1,00 en fuera de ámbito en la evaluación del autor).

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluados con EvalScope, código oficial de IHEval y prompt de puntuación oficial de MultiChallenge; juez GPT-4o; todos los modelos medidos con thinking):

| Benchmark | Gemma 4 E4B (base) | Este modelo | Nemotron-3.5-Bolt-E4B |
|---|---|---|---|
| IFEval (prompt strict) | 85,6 | 88,9 | 90,9 |
| IFBench (prompt strict) | 35,3 | 43,8 | 60,5 |
| IHEval (conflict) | no disponible | 81,7 | 84,0 |
| BFCL-v3 (overall) | 64,0 | 64,9 | 65,4 |
| MultiChallenge | no disponible | 43,3 | no disponible |

Evaluación propia del autor (7 tareas × 40 preguntas no usadas en entrenamiento; media):

| Etapa | Media |
|---|---|
| Base | 0,887 |
| Round 1 | 0,905 |
| SFT | 0,934 |
| Round 2 | 0,949 |
| Round 3 | 0,958 |
| Round 4 | 0,962 |
| Round 5 | 0,962 |

Destacan las mejoras en `tool` (0,755 a 0,930), `ih` (0,675 a 0,950) y `struct` (0,948 a 1,000). En evaluación focalizada, `tool/bad_id` pasa de 0,416 a 1,000 y `tool/fx_cross` de 0,392 a 0,936; `tool/ambiguous` solo alcanza 0,360. El autor advierte que las cifras no son directamente comparables con las publicadas por cada modelo debido a diferencias de entorno de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 7.941.100.874 parámetros, en BF16 requeriría aproximadamente 16 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría a rangos de 8 GB y 4-5 GB respectivamente (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU de 24 GB (RTX 4090, L4, A10) permite BF16, y GPUs de 16 GB requieren cuantización.
- Cabe en GPU de consumo: previsiblemente sí con cuantización, aunque el autor no publica configuraciones validadas.
- Despliegue: vLLM con `--enable-auto-tool-choice --tool-call-parser gemma4 --reasoning-parser gemma4`, según el ejemplo de la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval | IFBench | BFCL-v3 | Licencia |
|---|---|---|---|---|---|---|
| gemma-4-e4b-agentic-rl-think-r5 | 7.941.100.874 | no disponible | 88,9 | 43,8 | 64,9 | Apache 2.0 |
| Gemma 4 E4B (base) | no disponible | no disponible | 85,6 | 35,3 | 64,0 | Apache 2.0 |
| Nemotron-3.5-Bolt-E4B | no disponible | no disponible | 90,9 | 60,5 | 65,4 | OpenMDW |

El modelo supera al base en seguimiento de instrucciones y jerarquía, pero queda por debajo de Nemotron-3.5-Bolt-E4B en IFBench (43,8 frente a 60,5) y ligeramente por debajo en el resto de métricas publicadas.

## Limitaciones y advertencias

- El conocimiento factual y su exactitud son prácticamente idénticos al Gemma 4 E4B base; aumentar el esfuerzo de razonamiento no corrige errores de hechos. Para precisión se recomienda combinar con búsqueda o documentación.
- Rendimiento inferior a Nemotron-3.5-Bolt-E4B en restricciones no vistas (IFBench), con una diferencia de unos 17 puntos.
- Puede rechazar ocasionalmente preguntas dentro del ámbito cuando el sistema lo delimita.
- No se ha optimizado para tareas multiturno largas (por ejemplo, τ²-bench).
- Entrenamiento y evaluación limitados a japonés e inglés; el rendimiento en otros idiomas no está validado.
- El manejo de peticiones ambiguas de herramientas es débil (0,360 en `tool/ambiguous`).
- Los codificadores de imagen y audio no se han ajustado, por lo que las capacidades multimodales son las del base sin mejoras.
- Las cifras de benchmarks provienen del autor y usan un juez LLM (GPT-4o); no son directamente comparables con las publicadas por otros modelos.
- Uso comercial permitido por la licencia Apache 2.0, sujeta a las condiciones de la licencia del modelo base Gemma 4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmkz-1981/gemma-4-e4b-agentic-rl-think-r5
- Variante effort: https://huggingface.co/hmkz-1981/gemma-4-e4b-agentic-rl-think-r5-effort
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset allenai/IF_multi_constraints_upto5: https://huggingface.co/datasets/allenai/IF_multi_constraints_upto5
- Dataset nvidia/Nemotron-RL-instruction_following: https://huggingface.co/datasets/nvidia/Nemotron-RL-instruction_following
- Dataset openai/ih-challenge: https://huggingface.co/datasets/openai/ih-challenge
- Modelo profesor NVIDIA Nemotron-3.5-Bolt-E4B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Repositorio allenai/open-instruct (evaluador IFEvalG): https://github.com/allenai/open-instruct
