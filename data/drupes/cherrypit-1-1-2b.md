# DRUPEs/CherryPit-1.1-2B

## Resumen

CherryPit-1.1-2B es un modelo de lenguaje pequeño (SLM) desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems), construido sobre MiniCPM5-2B de OpenBMB. Se trata de la segunda versión de la familia CherryPit, centrada en razonamiento eficiente dentro de un presupuesto fijo de tokens de pensamiento: con un máximo de 8.192 tokens de thinking, resuelve significativamente más problemas de matemáticas de competición y de programación que su predecesor CherryPit-1.0, y añade la capacidad de generar aplicaciones web en React a partir de tests.

La relevancia del modelo radica en su combinación de tamaño contenido (~2.500 millones de parámetros), contexto largo de 128K tokens y razonamiento "budget-aware": mediante aprendizaje por refuerzo con presupuesto fijo de pensamiento, el modelo llega a la respuesta dentro del límite de 8K tokens en lugar de agotarlo sin concluir. Además, aprende a "saber cuándo parar" una vez ha encontrado la solución. Es especialmente interesante para despliegues en local y on-device, donde los tokens generados tienen un coste directo en latencia.

Está implementado con arquitectura Llama estándar, se distribuye en pesos bf16 (safetensors) para transformers y vLLM, y existe una versión GGUF para llama.cpp, Ollama y LM Studio. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama estándar (modelo causal de lenguaje) |
| Parametros totales | 2.516.756.480 (~2,5B, dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | 128K tokens (131.072) |
| Tipos de cuantizacion | bf16 (este repo); GGUF con Q4_K_M y Q5_K_M mencionados en la model card |
| Idiomas soportados | Ingles (solo probado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); GGUF disponible en repo aparte |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer Llama estandar, heredada de su modelo base openbmb/MiniCPM5-2B, con una longitud de contexto de 131.072 tokens. No es un modelo MoE: es denso, con 2.516.756.480 parametros. Se distribuye en bf16 y es compatible con transformers, vLLM y fine-tuning posterior.

Los detalles de preentrenamiento (numero de tokens, composicion del dataset) no estan disponibles en la documentacion, ya que corresponden al modelo base MiniCPM5-2B. Sobre este base, DRUPEs aplico un post-entrenamiento con dos innovaciones destacables: en primer lugar, aprendizaje por refuerzo bajo un presupuesto fijo de pensamiento ("budget-aware reasoning"), que entrena al modelo a producir respuestas dentro de 8K tokens de thinking en lugar de quedarse sin espacio; en segundo lugar, "ladder training" sobre problemas dificiles de matematicas y codigo, donde el modelo parte de pistas extraidas de sus propias soluciones largas correctas y las pistas se retiran progresivamente hasta que resuelve el problema de forma autonoma. Ademas, se entreno a "saber cuándo parar": una vez encontrada la respuesta, el modelo se compromete con ella en lugar de seguir razonando. La version 1.1 tambien incorpora la capacidad de escribir componentes React que pasan un conjunto de tests dado (procedente del WebDev preview 1.1).

## Capacidades

- Razonamiento matematico de competicion: AIME 2025/2026, HMMT Feb 2025/2026, AMC 2023 y MATH-500, con modo thinking de hasta 8.192 tokens.
- Programacion competitiva: LiveCodeBench v6 (46,3 con thinking, +17,2 frente a la 1.0), con mejora notable en problemas dificiles (24,2 frente a 4,2 en una sonda de 80 problemas).
- Generacion de codigo general: HumanEval+ (82,9) y MBPP+ (67,2) en modo sin thinking.
- Desarrollo web: generacion de componentes React que pasan tests dados (WebApp1K-React: 79,9).
- Tool calling / function calling: soportado mediante la plantilla de chat integrada.
- Modo thinking configurable: la plantilla arranca en modo thinking por defecto; se puede desactivar con `enable_thinking=False` para respuestas directas y cortas.
- Conversacion multi-turno con plantilla de chat y contexto largo de 128K tokens.
- Idioma: ingles (solo probado en ingles; no hay soporte multilingue verificado).

## Casos de uso

- Resolucion de problemas de matematicas de competicion en local: con 2,5B de parametros y thinking de 8K, obtiene 47,5 en AIME 2025 y 56,7 en AIME 2026, adecuado para asistentes de estudio y verificacion de soluciones sin depender de la nube.
- Asistente de programacion competitiva: el salto en LiveCodeBench v6 (46,3 con thinking) y el menor consumo de tokens (6.176 frente a 7.454 por problema) lo hacen util para generar y depurar soluciones algoritmicas con latencia predecible.
- Generacion de componentes React a partir de tests: dado un conjunto de tests, el modelo escribe componentes que los pasan (79,9 en WebApp1K-React), util en flujos de desarrollo guiados por tests (TDD) para prototipado rapido de interfaces.
- Agentes locales con tool calling: la plantilla de chat integrada soporta function calling, lo que permite construir agentes que ejecutan herramientas en dispositivos con GPU de consumo.
- Despliegue on-device y edge: con ~5 GB en bf16 y versiones GGUF Q4_K_M/Q5_K_M, cabe en GPUs de consumo e incluso en equipos sin GPU dedicada de gama alta, ideal para aplicaciones privadas sin envio de datos a terceros.
- Fine-tuning para dominios especificos: al ser un modelo denso de 2,5B en bf16 con licencia Apache 2.0, es practico ajustarlo con LoRA/QLoRA en una sola GPU para tareas verticales (matematicas educativas, automatizacion de codigo).
- Respuestas rapidas sin razonamiento extendido: en modo sin thinking ofrece respuestas directas con buen seguimiento de instrucciones (IFEval 83,2), adecuado para chatbots de baja latencia.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando CherryPit-1.1 con CherryPit-1.0 en el mismo harness, items, prompts y semillas (bf16 en vLLM). "Thinking, 8K" indica hasta 8.192 tokens de pensamiento antes de responder.

| Benchmark | Setting | CherryPit-1.0 | CherryPit-1.1 | Δ |
|---|---|---:|---:|---:|
| AIME 2025 | thinking, 8K, avg of 4 | – | 47,5 | – |
| AIME 2026 | thinking, 8K, avg of 4 | – | 56,7 | – |
| HMMT Feb 2025 | thinking, 8K, avg of 4 | – | 29,2 | – |
| HMMT Feb 2026 | thinking, 8K, avg of 4 | – | 27,3 | – |
| AMC 2023 | thinking, 8K, avg of 4 | – | 88,1 | – |
| MATH-500 | no thinking, greedy | 78,2 | 87,8 | +9,6 |
| LiveCodeBench v6 | thinking, 8K | 29,1 | 46,3 | +17,2 |
| LiveCodeBench v6 (problemas dificiles) | thinking, 8K, sonda de 80 problemas | 4,2 | 24,2 | +20,0 |
| LiveCodeBench v6 | no thinking, avg of 4 | 31,7 | 31,0 | −0,7 |
| HumanEval+ | no thinking, greedy | 85,4 | 82,9 | −2,5 |
| MBPP+ | no thinking, greedy | 64,5 | 67,2 | +2,7 |
| WebApp1K-React | no thinking, 1.000 tareas | 1,6 | 79,9 | +78,3 |
| FullStack Bench (web) | no thinking, 98 items x5 | 47,2 | 46,6 | −0,6 |
| IFEval | strict, prompt level | 85,2 | 83,2 | −2,0 |

Datos adicionales: en los 163 problemas de competicion agrupados obtiene 51,7; en LiveCodeBench con thinking consume de media 6.176 tokens por problema frente a 7.454 de la version 1.0.

Impacto de la cuantizacion (Q4_K_M desempaquetado a bf16 y re-evaluado en el mismo harness):

| Benchmark | bf16 | Q4_K_M | Δ |
|---|---:|---:|---:|
| LiveCodeBench v6, thinking 8K | 46,3 | 41,1 | −5,2 |
| LiveCodeBench v6, no thinking | 31,0 | 29,6 | −1,4 |
| HumanEval+ | 82,9 | 84,8 | +1,9 |
| MBPP+ | 67,2 | 63,8 | −3,4 |
| MATH-500 | 87,8 | 84,8 | −3,0 |
| IFEval | 83,2 | 81,9 | −1,3 |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 5 GB solo de pesos (tamano del repo), mas overhead de KV cache; con contexto largo (hasta 128K) la KV cache puede anadir varios GB, por lo que 8-12 GB de VRAM es una estimacion razonable para contextos moderados. No disponible una cifra oficial exacta.
- Cuantizado Q4_K_M en GGUF: aproximadamente 1,5-2 GB de pesos, ejecutable en GPUs modestas o incluso en CPU con velocidad aceptable dado el tamano de 2,5B.
- GPUs recomendadas: cualquier GPU de consumo con 8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4090) ejecuta el modelo en bf16 sin problema; para servir con contexto completo de 128K en vLLM conviene una GPU de 16-24 GB (RTX 4090, A10, A100).
- Cabe comodamente en GPUs de consumo: si, tanto en bf16 como cuantizado; es uno de sus puntos fuertes como SLM on-device.
- Opciones de despliegue: transformers (PyTorch), vLLM (ejemplo oficial: `vllm serve DRUPEs/CherryPit-1.1-2B --max-model-len 32768`), llama.cpp, Ollama y LM Studio mediante el repo GGUF DRUPEs/CherryPit-1.1-2B-GGUF.
- Parametros de muestreo recomendados: temperature 1.0, top_p 0.95; `max_new_tokens=8192` para aprovechar el modo thinking.
- Latencia y throughput: no disponible (no se publican mediciones); al ser un modelo denso de 2,5B, la latencia por token es baja en hardware moderno, pero el modo thinking de 8K puede generar respuestas largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento con presupuesto fijo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CherryPit-1.1-2B (DRUPEs) | 2,5B | 128K | Si (RL con budget de 8K) | Apache 2.0 | safetensors bf16 + GGUF |
| CherryPit-1.0-2B (DRUPEs) | 2,5B | 128K | Parcial (se queda sin espacio con mas frecuencia) | Apache 2.0 | GGUF (version 1.0) |
| MiniCPM5-2B (OpenBMB, modelo base) | ~2B | no disponible | no disponible | no disponible | Hugging Face |
| Qwen2.5-Coder / Qwen3-1.7B-2B clase | 1,5-3B | 32K-128K | Variable segun version | Apache 2.0 / Qwen | safetensors + GGUF |

Nota: la model card no publica benchmarks comparativos directos frente a modelos de otras familias en el mismo rango de tamano, por lo que la comparacion cuantitativa con alternativas como Qwen3 o Gemma 3 en este tamano no esta disponible en la informacion proporcionada. La comparacion mas rigurosa disponible es la interna frente a CherryPit-1.0 (ver tabla de benchmarks).

## Limitaciones y advertencias

- Tamano de 2,5B: el propio autor advierte que puede estar "confiadamente equivocado"; conviene verificar respuestas criticas, especialmente en razonamiento y calculo.
- Ligeras regresiones frente a la 1.0 en seguimiento de instrucciones (IFEval −2,0), HumanEval+ (−2,5) y FullStack Bench web (−0,6).
- La cuantizacion agresiva (Q4_K_M) penaliza especialmente el modo thinking en codigo (−5,2 puntos en LiveCodeBench); si la memoria lo permite, usar Q5_K_M o superior.
- Probado unicamente en ingles: el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior.
- Sin datos de alucinacion ni sesgos publicados por el autor; al ser un modelo pequeno derivado de MiniCPM5-2B, cabe esperar los sesgos tipicos de su corpus de preentrenamiento, no documentados.
- El modo thinking esta activado por defecto en la plantilla de chat: si se esperan respuestas cortas, hay que desactivarlo explicitamente con `enable_thinking=False`.
- Licencia Apache 2.0 sin restricciones comerciales relevantes; no se han identificado limitaciones de uso comercial en la documentacion.
- No hay informacion publicada sobre seguridad, red-teaming ni filtrado de contenidos del post-entrenamiento.

## Enlaces

- Modelo (bf16, safetensors): https://huggingface.co/DRUPEs/CherryPit-1.1-2B
- Version GGUF (llama.cpp, Ollama, LM Studio): https://huggingface.co/DRUPEs/CherryPit-1.1-2B-GGUF
- Version anterior: https://huggingface.co/DRUPEs/CherryPit-1.0-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper, blog o demos adicionales: no disponibles en la informacion proporcionada.
