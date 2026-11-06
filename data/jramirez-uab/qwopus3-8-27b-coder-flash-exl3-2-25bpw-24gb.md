# JRamirez-UAB/Qwopus3.8-27B-Coder-Flash-EXL3-2.25bpw-24GB

## Resumen

Qwopus3.8-27B-Coder-Flash-EXL3-2.25bpw-24GB es una cuantización comunitaria no oficial en formato EXL3 del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un modelo denso de 27B orientado a programación y agentes construido sobre Qwen3.8-27B. La cuantización la ha realizado el usuario JRamirez-UAB con exllamav3 1.6.5, aplicando 2,25 bits por peso en las capas lineales, un `lm_head` de 6 bits, una torre de visión de 6 bits y una cabeza MTP de 4 bits. El objetivo declarado es servir dos sesiones completas de 262.144 tokens de contexto simultáneamente en una única GPU RTX 3090 de 24 GB mediante vLLM con caché KV en int4.

El checkpoint pesa 11,19 GB en lugar de los 14,99 GB de la variante de 3,50 bpw del mismo autor. Ese ahorro de espacio es lo que permite duplicar el pool de KV (586.300 tokens frente a 377.712) y mantener dos contextos completos en paralelo. El precio es una degradación de calidad medible: la divergencia KL frente a BF16 es aproximadamente siete veces mayor que la del build de 3,50 bpw, y el modelo falla tareas de agente que la variante superior resuelve.

Es relevante porque demuestra un compromiso explícito entre capacidad de contexto concurrente y fidelidad de cuantización sobre hardware Ampere de consumo, con métricas de evaluación publicadas y reproducibles (KLD, tareas de agente, tool calls, búsqueda de aguja en contexto largo, velocidad de prefill y decode). No es un lanzamiento oficial de Jackrong ni de Qwen, y solo se ha probado con una combinación concreta de versiones de vLLM, exllamav3 y el plugin `vllm-quantpack`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text) con cabeza MTP, derivado de Qwen3.8-27B |
| Parámetros totales | 5.593.339.264 (según safetensors del repo); el modelo base se denomina 27B |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | EXL3 2,25 bpw en capas lineales; `lm_head` 6 bits; torre de visión 6 bits; cabeza MTP 4 bits; caché KV int4 |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato EXL3 (requiere exllamav3 y el plugin `vllm-quantpack`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal de la familia Qwen3.8, con pipeline `image-text-to-text`, afinado para programación, administración de sistemas Linux y uso como agente con tool calling (etiquetas `sysadmin`, `opencode`, `linux`, `coding`). Incluye una cabeza MTP (multi-token prediction) y una torre de visión, ambas cuantizadas por separado en esta build (4 y 6 bits respectivamente). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación de esta ficha es puramente de cuantización: EXL3 a 2,25 bpw sobre las capas lineales con datos de calibración que incluyen trazas reales de agente y sysadmin en español, generadas sobre los prompts del autor. El resultado se sirve con vLLM 0.31.0 más exllamav3 1.6.5 y el plugin `vllm-quantpack` 0.1.4, con caché KV en int4 y `--max-model-len 262144`. La instalación estándar de vLLM, Transformers o SGLang no puede cargar este checkpoint.

## Capacidades

- Generación de texto y razonamiento con modo de razonamiento explícito (el modelo produce trazas de reasoning antes de la respuesta).
- Generación de código y tareas de programación: 35/36 en la batería de 12 tareas ejecutada tres veces.
- Tool calling y function calling: 29/30 en la batería de herramientas, sin errores registrados.
- Ejecución de tareas de agente multi-paso mediante `opencode run`: 25/30 en 10 tareas de sysadmin repetidas tres veces.
- Comprensión de imágenes (pipeline image-text-to-text, torre de visión de 6 bits), aunque el autor no ha medido la calidad de visión en esta build.
- Contexto largo: recuperación de 8 hechos en un solo prompt a 64k, 128k y 241k-258k tokens, con 8/8 en cada caso sobre dos máquinas distintas.
- Multilingüe limitado a español e inglés, con evaluación centrada en español.
- Concurrencia: dos sesiones reales simultáneas de 235k tokens con 8/8 hechos encontrados en cada una.

## Casos de uso

- Agente local de administración de sistemas Linux: el modelo se integra en `opencode` con tool calling para ejecutar comandos, inspeccionar logs y diagnosticar incidencias en un departamento de TI universitario; su calibración incluye trazas reales de este dominio en español.
- Dos agentes o dos operadores simultáneos sobre una sola RTX 3090: con 586.300 tokens de pool KV y dos sesiones completas de 262k, dos personas pueden mantener contextos largos independientes en la misma tarjeta de 24 GB.
- Asistencia de programación con contexto de repositorio extenso: la ventana de 262k permite cargar varios ficheros y trazas de error en una sola sesión, con una tasa de éxito de 35/36 en las tareas de programación medidas.
- Automatización de tareas de mantenimiento con revisión humana: dado que falla aproximadamente 1 de cada 6 tareas de agente y produce bucles en respuestas largas, encaja en flujos donde un humano valida y reintenta el resultado.
- Análisis de documentación técnica e imágenes de diagramas: el pipeline image-text-to-text permite adjuntar capturas o diagramas de infraestructura junto al texto, aunque la calidad de visión no está medida en esta build.
- Recuperación de información en corpus muy largos: la prueba de aguja a 241k-258k tokens con 8/8 aciertos lo hace apto para preguntas sobre documentación extensa en español o inglés.
- Prototipado e investigación sobre cuantización extrema: sirve como referencia reproducible de KLD frente a BF16 (0,0888 en traza opencode, 0,1087 en traza sysadmin, 0,0798 en la traza pública de turboderp) para estudiar el límite práctico de 2,25 bpw.

## Benchmarks y rendimiento

| Métrica | 2,25 bpw (esta build) | 3,50 bpw (referencia del autor) |
|---|---|---|
| KLD vs BF16, traza opencode | 0,0888 | 0,0127 |
| KLD vs BF16, traza sysadmin | 0,1087 | 0,0148 |
| KLD vs BF16, traza pública turboderp | 0,0798 | 0,0104 |
| Tareas de agente (3 × 10) | 25/30 | 30/30 |
| Tool calls (30) | 29/30 | 30/30 |
| Tareas de programación (3 × 12) | 35/36 | 36/36 |
| Bucles en respuestas largas en español (30) | 8 a temperatura 1.0; 13 a 0.8; 14 a 0.6 | 0 a temperatura 1.0; 6 a 0.8; 12 a 0.6 |
| Respuestas vacías (solo reasoning) en 16.000 tokens | 10/30 | no disponible |
| Aguja en contexto largo (8 hechos) | 8/8 a 64k, 128k y 241k-258k | no disponible |
| Sesiones completas de 262k simultáneas en RTX 3090 | 2 | 1 |
| Pool KV en RTX 3090 | 586.300 tokens | 377.712 tokens |
| Prefill / decode a ~15k tokens | 1.134 / 48,7 tok/s | no disponible |
| Prefill / decode a ~64k tokens | 980 / 41,8 tok/s | no disponible |
| Prefill / decode a ~128k tokens | 822 / 35,5 tok/s | no disponible |
| Prefill / decode a ~260k tokens | 618 / 27,2 tok/s | 25,4 tok/s (decode) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: los pesos ocupan 11,19 GB; el resto del presupuesto de 24 GB se dedica a caché KV int4, lo que permite un pool de 586.300 tokens.
- GPU recomendada y única probada: NVIDIA RTX 3090 de 24 GB (Ampere), con 1.796 MiB realmente libres en el pico de dos sesiones concurrentes.
- Cabe en GPU de consumo: sí, en RTX 3090 de 24 GB. No se han probado otras tarjetas.
- Despliegue: exclusivamente vLLM 0.31.0 con exllamav3 1.6.5 y el plugin `vllm-quantpack` 0.1.4, con `--max-model-len 262144`, caché KV int4 y `--language-model-only` para uso solo de texto. Transformers, SGLang y una instalación estándar de vLLM no pueden cargarlo; llama.cpp y Ollama no están soportados para este formato.
- Latencia y throughput medidos con una petición: prefill de 1.134 tok/s y decode de 48,7 tok/s cerca de 15k tokens; 618 tok/s y 27,2 tok/s cerca de 260k tokens, aproximadamente un 7-13 % más rápido en decode que el build de 3,50 bpw.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (EXL3 2,25 bpw) | 5.593.339.264 en safetensors; base denominada 27B | 262.144 | KLD 0,080-0,109; agente 25/30; código 35/36 | Apache-2.0 | Hugging Face, requiere stack EXL3 + vLLM |
| Qwopus3.8-27B-Coder-Flash EXL3 3,50 bpw (JRamirez-UAB) | mismo base | 262.144 | KLD 0,010-0,015; agente 30/30; código 36/36 | Apache-2.0 | Hugging Face, mismo stack |
| Jackrong/Qwopus3.8-27B-Coder-Flash (BF16) | 27B (denominación) | no disponible en la información | referencia de KLD; bucles a temperatura 0 con repetición 0,93-0,98 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Bucles en respuestas largas: a la temperatura recomendada de 1.0, 8 de 30 respuestas largas en español entraron en repetición; a 0.8 y 0.6 empeora (13/30 y 14/30). Es necesario fijar `max_tokens` y reintentar o acortar la pregunta.
- Respuestas vacías: 10 de 30 respuestas largas no devolvieron texto de respuesta, solo reasoning, dentro de 16.000 tokens.
- No usar temperatura 0: el modelo base entra en bucle dentro del razonamiento y nunca escribe la respuesta (repetición 0,93-0,98 en BF16 y 0,87 en el build de 3,50 bpw). Usar la configuración de `generation_config.json`: temperature 1.0, top_p 0.95, top_k 20.
- Mayor divergencia de cuantización: KLD aproximadamente siete veces superior al build de 3,50 bpw, con fallo en tareas de agente que la variante superior resuelve.
- Calidad de visión y MTP no medidas en esta build, a diferencia del build de 3,50 bpw.
- Evaluación limitada al dominio del autor: agente de sysadmin Linux en español con `opencode`; los números pueden diferir en otros dominios o idiomas.
- Un único stack probado: vLLM 0.31.0, exllamav3 1.6.5 y vllm-quantpack 0.1.4 sobre RTX 3090; no hay garantías fuera de esa combinación.
- Licencia Apache-2.0 heredada, apta para uso comercial, pero es una release comunitaria no oficial de Jackrong ni de Qwen.
- Sesgos y riesgo de alucinación: no se documentan sesgos específicos en la información disponible; el riesgo de alucinación es el propio del modelo base, agravado por la cuantización agresiva.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/JRamirez-UAB/Qwopus3.8-27B-Coder-Flash-EXL3-2.25bpw-24GB
- Hugging Face (build de 3,50 bpw): https://huggingface.co/JRamirez-UAB/Qwopus3.8-27B-Coder-Flash-EXL3-3.50bpw-24GB
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
- Paper referenciado en las etiquetas: arxiv:2406.11235 (https://arxiv.org/abs/2406.11235)
