# netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit

## Resumen

Qwen3.8-27B-hermes-adapted-MLX-8bit es una conversión a formato MLX de 8 bits del modelo harness-hub/Qwen3.8-27B-hermes-adapted, un fine-tuning mediante LoRA del modelo base Qwen/Qwen3.8-27B orientado a tareas de ingeniería de software y uso de terminal. La publica el usuario netprojects con el objetivo de ejecutarlo de forma nativa en Apple Silicon, manteniendo el codificador de visión y la capa de predicción multi-token (MTP) del modelo original. El resultado es un paquete de 30,0 GB con 27.781.427.952 parámetros que se sirve con mlx-lm y mlx-vlm.

El modelo resuelve un problema concreto: disponer de un agente de código capaz de operar terminal y repositorios en hardware de consumo Apple sin renunciar a la fidelidad respecto a bf16. Según los datos publicados por el autor del adaptador, el fine-tuning eleva SWE-bench Pro (hard 51) del 29,4% al 43,1% y Terminal-Bench 2.1 del 44,7% al 58,8% frente al modelo base, con menos del 40% de los turnos y aproximadamente la mitad de tokens generados en las tareas que ambos resuelven.

La relevancia actual es doble: por un lado, demuestra que el ajuste por RL sobre un modelo de 27B puede mejorar sustancialmente el comportamiento agéntico; por otro, la cuantización a 8 bits con grupo 64 conserva el 99,2% de coincidencia en el siguiente token respecto a bf16, con una KL de 0,0004, lo que hace viable su despliegue local en Macs de 48 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (qwen3_5) con 16 capas de atención completa y capas Gated DeltaNet; incluye codificador de visión y capa MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; Hermes Agent requiere al menos 64.000 tokens |
| Tipos de cuantizacion | 8 bits afín, grupo 64 (lineales); existen builds MLX de 4, 6 y 8 bits y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida: 64 capas en total, de las cuales 16 usan atención completa y el resto capas Gated DeltaNet. Sobre él se aplicó un adaptador LoRA de rango 32 y alpha 64 entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) por harness-hub, con checkpoint en el paso 160 de los 1000 planificados. El adaptador afecta a 256 módulos: q, k, v y o en las 16 capas de atención completa, y gate, up y down en las 64 capas. No modifica el codificador de visión ni las capas Gated DeltaNet, y la capa MTP permanece intacta respecto al modelo original.

La conversión a MLX la realiza netprojects con mlx-vlm, fusionando el adaptador en el modelo base (revisiones 09fb741 y 3756181 respectivamente) y cuantizando las capas lineales a 8 bits afín con grupo 64. La verificación publicada confirma que los 256 módulos adaptados equivalen a W + 2,0 · B @ A redondeado a bf16, comprobado elemento a elemento, y que el resto de tensores son idénticos byte a byte a Qwen3.8-27B. La capa MTP cuantizada puede usarse como modelo borrador para decodificación especulativa mediante `--draft-kind mtp`.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia de Qwen.
- Razonamiento y resolución de tareas de ingeniería de software: localización de bugs, parches y ejecución de comandos.
- Operación de terminal y agentes de codificación, evaluada en SWE-bench Pro y Terminal-Bench 2.1.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante mlx-vlm: interpretación de capturas de pantalla, salidas de terminal, etc.
- Decodificación especulativa con la capa MTP integrada como modelo borrador.
- Modo thinking configurable, aunque el adaptador fue entrenado y evaluado con thinking desactivado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de reparación de bugs en local: con Hermes Agent apuntando al servidor OpenAI-compatible de mlx-lm, el modelo recibe una instrucción como «encuentra por qué fallan los tests de tests/test_parser.py y corrige el bug», inspecciona el repositorio mediante tool calls y aplica el parche. Es adecuado porque fue entrenado específicamente para este flujo y reduce turnos y tokens frente al base.
- Automatización de tareas de terminal: ejecución encadenada de comandos con verificación de salidas, aprovechando Terminal-Bench 2.1 como referencia de competencia en este dominio.
- Revisión de capturas y salidas de consola: con mlx-vlm se puede pasar una imagen de terminal o un pantallazo de error y preguntar qué falla, combinando visión y razonamiento de código.
- Asistente de desarrollo en Mac sin conexión: el build de 8 bits ocupa 30,0 GB y pico 29,7 GB con prompt de 8K, por lo que cabe en un Mac de 48 GB o más y permite trabajar con datos que no deben salir del equipo.
- Integración en pipelines de CI/CD locales: el servidor OpenAI-compatible permite conectar el modelo a scripts de automatización que necesiten generar parches o explicar fallos sin depender de una API externa.
- Decodificación especulativa para generación de código interactiva: usar el mismo repositorio como `--draft-model` con `--draft-kind mtp` acelera la generación greedy manteniendo la verificación por el modelo completo.
- Evaluación comparativa de cuantizaciones: al existir builds de 4, 6, 8 bits y bf16 del mismo adaptador, sirve para medir el impacto de la cuantización en tareas agénticas reales antes de fijar una configuración de producción.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (thinking desactivado, bajo Hermes Agent) frente al modelo base:

| Benchmark | Modelo base | Con adaptador hermes |
|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% |
| Terminal-Bench 2.1 | 44,7% | 58,8% |

Métricas de fidelidad de la cuantización publicadas por netprojects (MacBook Pro M5 Max, 128 GB, mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11, 19 de noviembre de 2026):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendado) | 23,1 GB | 98,5% | 0,0015 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,2% | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,1% | 0,0192 | 43/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria pico medida: 29,7 GB con prompt de 8K tokens en el build de 8 bits; 23,4 GB en 6 bits; 17,1 GB en 4 bits; 53,4 GB en bf16.
- Memoria unificada recomendada: 48 GB o más para 8 bits, 36 GB o más para 6 bits, 32 GB o más para 4 bits, 96 GB o más para bf16.
- Hardware de referencia de las pruebas: MacBook Pro con chip M5 Max y 128 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el formato MLX está pensado para Apple Silicon.
- Cabe en Macs de gama alta con memoria unificada suficiente; no se indica compatibilidad con GPUs de consumo NVIDIA en este build.
- Despliegue: mlx-lm (servidor OpenAI-compatible con `mlx_lm.server`) para texto y mlx-vlm para imagen-texto; versiones mínimas mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- Latencia y throughput: no disponibles en la información proporcionada; solo se indica que el adaptador genera aproximadamente la mitad de tokens que el base en las tareas que ambos resuelven.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit | 27,78B | no disponible (Hermes Agent exige 64K) | Agente de código en Apple Silicon, 8 bits | Apache 2.0 | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit | 27,78B | no disponible | Misma familia, 6 bits, recomendado por tamaño/fidelidad | Apache 2.0 | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit | 27,78B | no disponible | Misma familia, 4 bits para Macs con menos memoria | Apache 2.0 | Hugging Face, MLX |
| harness-hub/Qwen3.8-27B-hermes-adapted | 27,78B | no disponible | Adaptador LoRA original sin cuantizar | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | 27,78B | no disponible | Modelo base sin fine-tuning agéntico | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; usarlo con thinking activado puede degradar el comportamiento esperado.
- La cuantización a 8 bits no es idéntica a bf16: conserva el 99,2% de coincidencia en el siguiente token y una KL de 0,0004, con divergencias puntuales en empates cercanos durante la decodificación especulativa.
- La decodificación con MTP puede divergir ligeramente del decoding plano en respuestas largas por el redondeo del chequeo por lotes.
- Hermes Agent requiere al menos 64.000 tokens de contexto; la longitud de contexto nativa del modelo no se detalla en la información disponible.
- Idiomas soportados no especificados; no se garantiza un rendimiento multilingüe homogéneo.
- Sesgos conocidos: no documentados en la información proporcionada; cabe esperar los del modelo base Qwen3.8-27B.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas de código conviene validar los parches con tests reales.
- Licencia Apache 2.0, que permite uso comercial, pero el adaptador procede de un checkpoint intermedio (paso 160 de 1000) y no de un entrenamiento completado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados publicados.
- El build está atado a Apple Silicon y a versiones concretas de mlx-lm y mlx-vlm; no es portable a CUDA sin reconversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build MLX 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16
- Adaptador MLX: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter
- Hermes Agent: https://github.com/NousResearch/hermes-agent
