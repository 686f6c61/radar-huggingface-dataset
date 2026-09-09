# modrill/CodeThink-V4-OLMo-3-7B

## Resumen
CodeThink-V4-OLMo-3-7B es un modelo de lenguaje de 7.298 millones de parámetros desarrollado por modrill, que parte del modelo base allenai/Olmo-3-1025-7B y lo especializa en tareas de código y razonamiento mediante un ajuste fino con LoRA (SFT) sobre trazas de pensamiento del modelo Qwen/Qwen3-30B-A3B-Thinking-2507. El resultado es un checkpoint de investigación, no un producto comercial, con pesos fusionados a partir de la adaptación. Su arquitectura es un transformer decoder-only de tipo OLMo-3 con una longitud de contexto de 32.768 tokens y licencia Apache-2.0.

El modelo está diseñado para resolver problemas de programación competitiva en modo think, generando primero un bloque de razonamiento y después la solución, como refleja su evaluación en el subconjunto DEV256 de LiveCodeBench, donde alcanza 56/256 pass@1 frente al 15/256 del modelo base. Es relevante ahora como ejemplo de destilación de capacidades de razonamiento de un modelo MoE grande a un modelo abierto de menor tamaño, dentro de la línea de ajuste fino OLMo.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en allenai/Olmo-3-1025-7B) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados) y adaptador LoRA en safetensors |

## Arquitectura y entrenamiento
El modelo conserva la arquitectura del base allenai/Olmo-3-1025-7B, un transformer decoder-only entrenado por Allen AI. El ajuste fino se realizó mediante LoRA con rango 64 y alpha 128, dropout 0.0, aplicado a las siete proyecciones habituales (q, k, v, o, gate, up y down). Las embeddings y la lm_head permanecieron congeladas, excepto la fila B del token 100257 (`<|endoftext|>`) en ambos lados. El entrenamiento se ejecutó en bf16 con longitud de contexto de 32.768 tokens, sin packing ni truncamiento, durante dos épocas sobre 9.430 filas (concatenación física de 4.715 problemas únicos). Se utilizaron 31.689.386 tokens de asistente por época (63.378.772 en total), procedentes de trazas de pensamiento del modelo Qwen3-30B-A3B-Thinking-2507 tokenizadas con el tokenizer de OLMo.

El optimizador AdamW (β 0.9/0.95), con LR 1e-4, scheduler coseno, warmup del 6% y weight decay 0.1. No se realizó selección de checkpoint; se usó el endpoint de la segunda época (step-000904) y posteriormente se fusionaron los pesos LoRA con el modelo base. El template de chat incluido es `olmo3-lcb-noprefill`, que no prellena `<think>`.

## Capacidades
- Generación de texto y código: especializado en producir soluciones de programación, con un bloque de razonamiento previo en modo think.
- Razonamiento de múltiples pasos: heredado de las trazas de Qwen3 Thinking, puede descomponer problemas en pasos antes de responder.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: aunque puede realizar razonamiento encadenado, no se ha documentado su uso como agente con llamadas a herramientas.
- Capacidades multilingües: no disponibles; no se especifican idiomas en la ficha.
- Capacidades especiales: modo think con token de pensamiento no prefijado (`olmo3-lcb-noprefill`) y tokens de parada `100257` (`<|endoftext|>`) y `100265` (`<|im_end|>`).

## Casos de uso
- Resolución de problemas de programación competitiva: el modelo puede generar soluciones verificables para problemas tipo LiveCodeBench, ejecutando el razonamiento en modo think y produciendo código en lenguaje como Python.
- Asistente de desarrollo de software: integrado en un editor o entorno de desarrollo, ofrece explicaciones paso a paso y código para tareas de programación, aprovechando su capacidad de razonamiento.
- Tutor de programación: explica algoritmos y estructuras de datos, descomponiendo problemas en subtareas y guiando al estudiante con el modo think.
- Generación de pruebas unitarias: puede crear casos de prueba para una función dada, razonando sobre la lógica del código y cubriendo casos límite.
- Refactorización y análisis de código: propone mejoras o refactorizaciones, razonando sobre la semántica del código existente.
- Investigación en destilación de modelos: sirve como ejemplo práctico de cómo destilar trazas de razonamiento de un modelo MoE grande (Qwen3-30B-A3B) a un modelo abierto más pequeño.
- Validación de soluciones en entornos sandbox: puede integrarse en pipelines que ejecutan el código generado en un entorno aislado y verifican su correctitud, como se hizo en la evaluación DEV256.

## Benchmarks y rendimiento
| Modelo | pass@1 (DEV256) | Cap |
|---|---:|---:|
| CodeThink-V4-OLMo-3-7B | 56/256 | 149 |
| Olmo-3-1025-7B | 15/256 | 104 |

Resultados de una sola semilla (3407), en modo think, sin prefill de `<think>`, con temperatura 0.6, top-p 0.95, top-k 20 y límite de generación de 32k tokens. No hay más benchmarks publicados en la información disponible.

## Requisitos de hardware
- VRAM estimada: los pesos en bf16 requieren aproximadamente 15 GB de VRAM para los 7.298 M parámetros, más el KV cache. Con cuantización 4-bit se puede reducir a unos 4-5 GB.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (RTX 4090, A100 40/80 GB) para inferencia en bf16. Con cuantización 8-bit, 16 GB (RTX 4080, A100 40 GB) pueden ser suficientes.
- Compatibilidad con GPU de consumo: no cabe en GPUs de 8 GB en bf16, pero sí con cuantización 4-bit.
- Opciones de despliegue: compatible con transformers y vLLM al usar pesos safetensors. Para llama.cpp u Ollama se requiere convertir el modelo a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CodeThink-V4-OLMo-3-7B | 7.298 M | 32.768 | Apache-2.0 | HuggingFace |
| Olmo-3-1025-7B | 7.298 M | 32.768 | Apache-2.0 | HuggingFace |
| DeepSeek-Coder-6.7B | 6.700 M | 16.384 | MIT | HuggingFace |
| Qwen2.5-Coder-7B | 7.616 M | 131.072 | Apache-2.0 | HuggingFace |

No se ha publicado una comparativa de rendimiento entre estos modelos en la información disponible.

## Limitaciones y advertencias
- Checkpoint de investigación: el autor indica explícitamente que no es un producto y que los resultados de DEV256 no deben tratarse como una reclamación de leaderboard.
- Evaluación de una sola semilla (seed 3407), sin análisis de variabilidad ni múltiples ejecuciones.
- Cap alta: 149 de 256 generaciones alcanzan el límite de 32k tokens sin cerrar el bloque de pensamiento, lo que reduce la validez de muchas soluciones.
- Idiomas no especificados: el entrenamiento se basó en problemas de programación (probablemente en inglés), por lo que su rendimiento en otros idiomas es incierto.
- Sin soporte documentado de tool calling ni integración con APIs externas.
- Riesgo de alucinación: puede generar código sintácticamente válido pero semánticamente incorrecto.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantía de fiabilidad para producción.

## Enlaces
- https://huggingface.co/modrill/CodeThink-V4-OLMo-3-7B
- https://huggingface.co/allenai/Olmo-3-1025-7B
- https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
