# netprojects/Qwen3.8-27B-super-adapter-MLX-3bit

## Resumen

Qwen3.8-27B-super-adapter-MLX-3bit es una cuantización de 3 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-super-adapter, un adaptador LoRA fusionado sobre Qwen/Qwen3.8-27B. Lo publica el usuario netprojects y está pensado específicamente para ejecutar agentes de programación en Apple Silicon. El adaptador combina los pesos de tres especialistas de refuerzo (pi, Hermes Agent y OpenCode) en un único modelo, de modo que un solo checkpoint sirve para los tres harnesses de agente.

El modelo conserva la torre de visión y la capa MTP (multi-token prediction) de Qwen, por lo que el pipeline es image-text-to-text y admite entradas multimodales. La cuantización es mixta: la mayoría de capas lineales van a 3 bits (afín, grupo de 64) mientras que el embedding de tokens, la capa de salida y las capas más sensibles (v_proj y down_proj de las primeras y últimas ocho capas y de una de cada tres intermedias) se mantienen a 4 bits, con un promedio de unos 3,91 bits por peso.

Su relevancia es práctica: con 13,8 GB de pesos cabe en Macs de 24 GB de memoria unificada y ofrece, según el autor del adaptador, una mejora sustancial frente al modelo base en tareas de agente de código (SWE-bench Pro, Terminal-Bench 2.1) con menos llamadas a herramientas. Es, por tanto, una opción para desarrollo local de agentes de programación sin depender de GPU dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8) con torre de visión y capa MTP; cuantización MLX |
| Parametros totales | 28.489.216.752 (~28,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Hermes Agent requiere al menos 64.000 tokens) |
| Tipos de cuantizacion | 3-bit mixto (afín, grupo 64), con embedding, capa de salida y capas sensibles a 4-bit; ~3,91 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de ~28,5 mil millones de parámetros con encoder de visión y una capa de predicción multi-token (MTP). Sobre él se aplica el super-adapter de harness-hub, que es un LoRA que fusiona tres especialistas entrenados con refuerzo para tres harnesses de agente distintos: pi y Hermes Agent (checkpoint en el paso 160) y OpenCode (paso 150). La fusión se hace a peso ½ cada uno, sin entrenamiento adicional. Por tanto, no hay un corpus de preentrenamiento propio del adaptador; el conocimiento proviene de Qwen3.8-27B y la especialización de agente viene del RL de los tres especialistas.

La conversión a MLX la realiza netprojects con mlx-vlm, incluyendo el encoder de visión y la capa MTP. La cuantización es mixta y selectiva: la mayoría de capas lineales a 3 bits, pero embedding de tokens, capa de salida y capas v_proj/down_proj de las primeras y últimas ocho capas y de una de cada tres intermedias a 4 bits, para limitar la degradación. El resultado son 13,8 GB de pesos y un promedio de ~3,91 bits por peso. No se detallan en la información proporcionada los datos de entrenamiento del modelo base ni del adaptador (número de tokens, composición del dataset, uso de DPO/RLHF más allá del RL de los especialistas).

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" activable mediante el template de chat (activado por defecto).
- Programación y resolución de tareas de ingeniería de software: el adaptador está entrenado con RL para harnesses de agente de código.
- Uso de herramientas (tool calling / function calling) a través de los harnesses pi, Hermes Agent y OpenCode.
- Razonamiento multi-paso y ejecución de agentes: los benchmarks reportados miden pass@1 en SWE-bench Pro y Terminal-Bench 2.1, con reducción de llamadas a herramientas.
- Capacidades multimodales de entrada (image-text-to-text) gracias a la torre de visión incluida en la conversión.
- Predicción multi-token (MTP) para acelerar la decodificación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Reparación automática de tests en local: ejecutar `pi` o `opencode` contra el servidor mlx-lm para que el agente localice por qué fallan los tests de un módulo y proponga un parche, aprovechando el entrenamiento específico en SWE-bench Pro.
- Desarrollo asistido en Mac sin GPU dedicada: servir el modelo con `mlx_lm.server` en un Mac de 24 GB y conectarlo a un IDE o CLI de agente mediante la API compatible con OpenAI.
- Automatización de tareas de terminal: usar Terminal-Bench como referencia para tareas de shell, instalación de dependencias y depuración de entornos, donde el adaptador reduce el número de llamadas a herramientas.
- Agente de código multi-harness: un único checkpoint sirve para pi, Hermes Agent y OpenCode, lo que simplifica el despliegue cuando el equipo alterna entre estos clientes.
- Análisis de capturas o diagramas junto a código: al conservar el encoder de visión, se pueden adjuntar imágenes (por ejemplo, un diagrama de arquitectura o una captura de error) y pedir al agente que las relacione con el código.
- Prototipado de agentes con contexto largo: Hermes Agent exige al menos 64.000 tokens de contexto, por lo que el modelo se puede usar en flujos de agente que mantienen historial extenso de conversación y herramientas.
- Evaluación comparativa de cuantizaciones: al existir builds de 2,5, 3, 4, 6 y 8 bits del mismo adaptador, sirve para medir el impacto de la cuantización en tareas reales de agente en Apple Silicon.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador (no específicos del build MLX de 3 bits), sobre SWE-bench Pro (hard 51) y Terminal-Bench 2.1, comparando con el modelo base:

| Configuracion | Metrica | Base | Super-adapter |
|---|---|---|---|
| Thinking on (media de 6 pares harness-benchmark) | pass@1 | 55,5% | 63,5% |
| Thinking on, OpenCode, SWE-bench Pro | pass@1 | 45,1% | 60,8% |
| Thinking on, Hermes Agent, SWE-bench Pro | pass@1 | 47,1% | 66,7% |
| Thinking off (media de 6 pares) | pass@1 | 39,5% | 49,0% |

En thinking on, el adaptador supera al base en cinco de seis pares y empata en el sexto, con 19-48% menos llamadas a herramientas por tarea. En thinking off supera al base en los seis pares, con 53-73% menos llamadas.

Fidelidad del build de 3 bits frente a bf16 (datos del autor de la conversión):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K tokens | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| 6-bit (recomendado) | 23,1 GB | 99,5% | 0,0014 | 45/50 | 23,4 GB | 36 GB+ |
| 8-bit | 30,0 GB | 99,6% | 0,0005 | 45/50 | 29,7 GB | 48 GB+ |
| 4-bit | 16,3 GB | 96,2% | 0,0194 | 45/50 | 17,1 GB | 32 GB+ |
| 3-bit | 13,8 GB | 92,2% | 0,0885 | 46/50 | 14,6 GB | 24 GB+ |
| 2,5-bit | 11,8 GB | 85,2% | 0,2433 | 41/50 | 13,8 GB | 24 GB+ |
| bf16 (referencia local) | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

No se han publicado resultados de benchmarks del build de 3 bits ejecutando los harnesses de agente en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 13,8 GB de pesos; memoria pico de 14,6 GB con un prompt de 8.000 tokens. Se recomienda un Mac con 24 GB o más de memoria unificada.
- Hardware: exclusivamente Apple Silicon (MLX). No está pensado para GPU NVIDIA ni AMD.
- Cabe en Macs consumer de 24 GB (por ejemplo, MacBook Air/Pro M-series con 24 GB); no cabe en configuraciones de 16 GB.
- Despliegue: `mlx_lm.server` (mlx-lm >= 0.32.2) con API compatible con OpenAI; uso desde Python con `mlx_lm.load` y `mlx_lm.generate`; integración con pi (Node.js 22.19+), Hermes Agent y OpenCode 2.2.7.
- Para desactivar el modo thinking: `--chat-template-args '{"enable_thinking": false}'`. Los runs de evaluación con thinking permiten hasta 32.768 tokens de salida por llamada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-super-adapter-MLX-3bit | ~28,5 B | no disponible | 3-bit mixto MLX | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-super-adapter-MLX-6bit | ~28,5 B | no disponible | 6-bit MLX | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-super-adapter-MLX-4bit | ~28,5 B | no disponible | 4-bit MLX | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | no disponible | no disponible | 6-bit MLX | no disponible | Hugging Face |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit | no disponible | no disponible | 6-bit MLX | no disponible | Hugging Face |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | no disponible | no disponible | 6-bit MLX | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos builds en la información proporcionada, salvo la tabla de fidelidad frente a bf16 incluida en la sección anterior.

## Limitaciones y advertencias

- La cuantización de 3 bits degrada la fidelidad: solo el 92,2% de los siguientes tokens coinciden con bf16 y la divergencia KL es de 0,0885, muy superior a la de los builds de 4, 6 y 8 bits. Para uso en producción se recomienda el build de 6 bits.
- El adaptador es una fusión de tres especialistas sin entrenamiento adicional; su rendimiento está medido en los harnesses concretos (pi, Hermes Agent, OpenCode) y puede no generalizar a otros frameworks de agente.
- Los benchmarks reportados (SWE-bench Pro, Terminal-Bench 2.1) provienen del autor del adaptador y no han sido replicados de forma independiente en la información disponible.
- Riesgo de alucinación inherente a los modelos de ~28 B y acentuado por la cuantización agresiva; conviene validar los parches de código generados.
- Idiomas soportados no disponibles; no se puede garantizar un comportamiento multilingüe óptimo.
- Longitud de contexto no disponible en la información proporcionada; Hermes Agent exige al menos 64.000 tokens, lo que condiciona su uso con ese harness.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B y del adaptador original antes de desplegar en producción.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-3bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-4bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-2.5bit
- Build pi: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build Hermes Agent: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build OpenCode: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Repositorio pi: https://github.com/earendil-works/pi
- Repositorio Hermes Agent: https://github.com/NousResearch/hermes-agent
- OpenCode: https://opencode.ai
