# maylore-ai/Temper-2-Ion

## Resumen

Temper-2-Ion es un modelo de lenguaje de 0,5 mil millones de parámetros especializado en generación de código Rust, desarrollado por maylore-ai como sucesor de Temper-1-0.5B. Se trata de un fine-tune de Qwen2.5-Coder-0.5B-Instruct, entrenado con ejemplos de Rust verificados por compilador y tests, seguido de una fase de aprendizaje por refuerzo donde solo las soluciones que superan todos los tests reciben recompensa. Su objetivo declarado es ejecutarse en hardware modesto.

Su relevancia radica en la escasez de modelos pequeños optimizados para Rust, un lenguaje con poca representación en los corpora habituales de código. Según los datos del autor, resuelve un 32 % más de tareas en HumanEval-RS al primer intento que su predecesor, y supera con claridad a Qwen2.5-Coder-0.5B-Instruct en los benchmarks de Rust publicados en su model card. Entiende peticiones en inglés y ruso, incluidas peticiones cortas e informales típicas de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (disponible versión GGUF en repositorio aparte) |
| Idiomas soportados | inglés, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en maylore-ai/Temper-2-Ion-GGUF |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de la familia Qwen2. El entrenamiento constó de dos fases. Primero, un fine-tuning supervisado sobre ejemplos de código Rust que habían pasado el compilador y los tests, con tareas redactadas con cuidado y también peticiones cortas de pocas palabras, además de diálogos sobre el propio modelo. El modelo ajustado se fusionó por pesos con el Instruct original para conservar su comprensión de enunciados generales.

La segunda fase fue aprendizaje por refuerzo sobre tareas con tests, donde la recompensa se otorga únicamente si la solución pasa todos los tests. Esta etapa requirió menos de cuatro horas en una única RTX 3060. No se ha publicado información sobre la longitud de contexto ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de código Rust a partir de instrucciones en lenguaje natural, incluyendo peticiones cortas e informales
- Comprensión de peticiones en inglés y ruso
- Conversación general heredada del modelo base Instruct, incluyendo respuestas sobre sí mismo
- No soporta fill-in-the-middle: fue entrenado solo con peticiones de chat, por lo que no sirve como modelo de autocompletado en línea en un editor
- No hay información publicada sobre tool calling, agentes ni capacidades multimodales

## Casos de uso

- **Asistente de Rust en hardware modesto**: con 0,5B de parámetros cabe en portátiles y equipos sin GPU dedicada, ideal para consultas rápidas de sintaxis y funciones Rust sin depender de la nube.
- **Chatbot de ayuda para principiantes en Rust**: entrenado con peticiones cortas informales, responde bien a preguntas tipo "cómo hago X en Rust" en inglés o ruso.
- **Generación de funciones utilitarias**: produce funciones Rust que compilan y pasan tests, útil para esbozos rápidos de código que el desarrollador revisa después.
- **Integración en herramientas locales con llama.cpp, LM Studio u Ollama**: existe versión GGUF oficial para estos entornos.
- **Prototipado de agentes de código ligeros**: su tamaño permite ejecutar múltiples instancias en paralelo para generación con verificación (generate-and-test) en pipelines de CI.
- **Modelo de referencia para investigación en RL sobre código**: el entrenamiento con recompensa basada en tests y su bajo coste (menos de 4 horas en una RTX 3060) lo hacen reproducible para experimentos académicos.

## Benchmarks y rendimiento

Resultados publicados por el autor (pass@1 / pass@10 en %; Temper Bench v2 como greedy pass@1). HumanEval-RS (156 tareas) y MBPP-RS (354 tareas) provienen de MultiPL-E, revisión `28441b6`, con temperatura 0,2, top_p 0,95 y 50 respuestas por tarea.

| Modelo | HumanEval-RS | MBPP-RS | Temper Bench v2 |
|---|---|---|---|
| **Temper-2-Ion** | **48,1 / 57,6** | **45,5 / 53,8** | **12,7** |
| Temper-1-0.5B | 36,3 / 46,3 | 39,3 / 46,9 | 7,3 |
| ThoxEdge-RustCoder-0.5B | 28,7 / 44,8 | 33,2 / 43,1 | 2,7 |
| Qwen2.5-Coder-0.5B-Instruct | 23,8 / 39,9 | 28,4 / 40,2 | 2,0 |
| Qwen3.5-0.8B | 10,1 / 22,1 | 14,5 / 25,5 | 1,3 |
| Qwen2.5-Coder-1.5B-Instruct | 39,0 / 56,1 | 38,3 / 52,1 | 7,3 |
| Temper-1-1.5B | 54,1 / 68,8 | 48,6 / 59,2 | 16,7 |
| Qwen2.5-Coder-3B-Instruct (referencia) | 56,5 / 71,9 | 44,8 / 60,0 | 14,7 |

Temper-2-Ion obtiene el mejor resultado entre modelos de hasta 0,8B en las tres métricas, y supera incluso a Qwen2.5-Coder-1.5B-Instruct en HumanEval-RS y MBPP-RS. Nota del autor: la tarea `mbpp_67_bell_number` no tiene solución correcta en Rust y cuenta como fallida para todos los modelos. Estos datos provienen de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- Un modelo de 494M de parámetros en FP16 ocupa aproximadamente 1 GB de VRAM o RAM; en FP32, unos 2 GB. El repositorio pesa 1,0 GB.
- Cabe sobradamente en cualquier GPU de consumo (incluso integradas) y funciona por CPU en equipos modestos, que es el objetivo declarado del proyecto. La fase de RL del entrenamiento se realizó en una única RTX 3060.
- No se han publicado cifras de latencia ni throughput.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), llama.cpp, LM Studio y Ollama mediante la versión GGUF oficial. No hay información sobre soporte verificado en vLLM o TGI, aunque al ser arquitectura Qwen2 es probable que funcione.

## Comparativa con modelos similares

| Modelo | Parametros | HumanEval-RS pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|
| Temper-2-Ion | 0,5B | 48,1 % | Apache 2.0 | Hugging Face, safetensors y GGUF |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | 23,8 % | Apache 2.0 | Hugging Face, amplio ecosistema |
| ThoxEdge-RustCoder-0.5B | 0,5B | 28,7 % | no disponible | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 39,0 % | Apache 2.0 | Hugging Face, amplio ecosistema |

Temper-2-Ion supera en Rust a todos los modelos de su rango de tamaño listados por el autor, e incluso a Qwen2.5-Coder-1.5B-Instruct en HumanEval-RS y MBPP-RS, aunque queda por detrás de Temper-1-1.5B y Qwen2.5-Coder-3B-Instruct. Su ventaja competitiva es la especialización en Rust; a cambio, su cobertura general de tareas es la esperable en un modelo de 0,5B.

## Limitaciones y advertencias

- Con solo 0,5B de parámetros, el propio autor advierte que no es adecuado para trabajo serio: comete errores en tareas desconocidas y sus respuestas pueden mezclar palabras.
- Explica con frecuencia incorrectamente su propio código, un problema relevante si se usa como asistente didáctico.
- No soporta fill-in-the-middle: no funciona como modelo de autocompletado en línea en editores (no es un drop-in para Copilot-style completion).
- No hay datos publicados sobre longitud de contexto, sesgos ni tasas de alucinación en conversación general.
- Los benchmarks provienen de la model card del autor, medidos con su propio conjunto (Temper Bench v2); conviene tratarlos como resultados no verificados de forma independiente.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- El modelo es muy reciente (publicado en octubre de 2026) y tiene adopción mínima (298 descargas, 0 likes), por lo que el soporte comunitario es escaso.

## Enlaces

- Modelo: https://huggingface.co/maylore-ai/Temper-2-Ion
- Versión GGUF: https://huggingface.co/maylore-ai/Temper-2-Ion-GGUF
- Web del proyecto: https://maylore.com/temper-2-ion
- Temper Bench v2: https://maylore.com/temper-bench
- Modelo predecesor: https://huggingface.co/maylore-ai/Temper-1-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- MultiPL-E (benchmarks HumanEval-RS / MBPP-RS): https://github.com/nuprl/MultiPL-E
- Paper del estimador pass@k (Codex): https://arxiv.org/abs/2107.03374
