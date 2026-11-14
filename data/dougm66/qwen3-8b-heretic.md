# dougm66/Qwen3-8B-heretic

## Resumen

Qwen3-8B-heretic es una variante "abliterated" (también llamada "decensored") del modelo Qwen3-8B desarrollado por el equipo Qwen. La modifica el usuario dougm66 aplicando una ablación direccional con la herramienta Heretic, con el objetivo de reducir el comportamiento de rechazo (refusals) del modelo original. Los pesos son idénticos a los del modelo base salvo por la modificación de direcciones internas que controlan las respuestas de rechazo; no hay reentrenamiento adicional.

El modelo base Qwen3-8B es un transformer denso de 8.190.735.360 parámetros con capacidad de razonamiento híbrido ("thinking mode"): puede alternar entre generar cadena de pensamiento explícita o responder directamente. Esta variante conserva la plantilla de chat y el comportamiento de razonamiento del original, pero elimina buena parte de la alineación de seguridad.

Es relevante para investigadores que estudian alineación, robustez y mecanismos de refusal en modelos de razonamiento, así como para experimentación local sin restricciones de contenido. Su licencia Apache-2.0 permite uso comercial, pero la ausencia de safety tuning lo hace inadecuado para despliegues en producción orientados al público general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantización | GGUF Q4_K_M incluido; safetensors en precisión original (bf16/fp16) |
| Idiomas soportados | no disponible en la información proporcionada (heredados del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B original: un transformer denso de aproximadamente 8,2 mil millones de parámetros con modo de razonamiento híbrido. Sobre estos pesos no se realizó ningún entrenamiento adicional; la modificación consiste en una ablación direccional aplicada con Heretic (modificador ARA), que identifica y resta direcciones en el espacio de activaciones asociadas al comportamiento de rechazo.

Heretic ejecuta una optimización multiobjetivo que equilibra dos métricas: la tasa de rechazos (coincidencia de palabras clave sobre 100 prompts de estilo dañino, donde menos es mejor) y la divergencia KL respecto al modelo base en prompts benignos (donde menos indica menor cambio colateral y mejor retención de capacidades). La versión publicada corresponde al "knee" trial #84, con 3 rechazos residuales de 100 y una divergencia KL de 0,013. La evaluación se realizó forzando un prefijo de respuesta vacío `<think>\n</think>` para puntuar la respuesta y no la cadena de pensamiento, evitando que la ablación degenerase.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" híbrido heredado de Qwen3 (cadena de pensamiento explícita opcional).
- Razonamiento matemático y lógico (capacidades del modelo base).
- Generación y comprensión de código (capacidades del modelo base).
- Soporte de tool calling / function calling (heredado de Qwen3).
- Capacidades multilingües heredadas del modelo base (idiomas concretos no disponibles).
- Comportamiento de rechazo reducido: responde a un espectro más amplio de peticiones que el modelo original.

## Casos de uso

- Investigación en alineación y mecanismos de refusal: permite estudiar qué direcciones de activación controlan el rechazo comparando respuestas con el Qwen3-8B original y midiendo la divergencia KL de 0,013 reportada.
- Experimentación local con llama.cpp u Ollama: el GGUF Q4_K_M incluido permite ejecutar el modelo en hardware de consumo sin infraestructura de servidor.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido narrativo que el modelo base rechazaría por políticas de contenido.
- Evaluación de robustez de sistemas de moderación: útil como modelo adversario para probar clasificadores de seguridad y pipelines de filtrado.
- Red teaming interno: generación de prompts y respuestas de estilo dañino controlado para auditar defensas en entornos de investigación cerrados.
- Fine-tuning posterior: al estar bajo Apache-2.0 y en safetensors, sirve como punto de partida para ajustes específicos donde la alineación restrictiva del base resulta un obstáculo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de la ablación:

| Métrica | Valor |
|---|---|
| Rechazos residuales (100 prompts dañinos) | 3 / 100 |
| Divergencia KL vs modelo base (prompts benignos) | 0,013 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada con GGUF Q4_K_M: aproximadamente 5-6 GB para pesos, más contexto.
- GPU recomendadas para precisión completa: A100 40 GB, H100, o GPUs con 24 GB o más (RTX 3090/4090) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M en GPUs de 8 GB o más; en bf16 requiere 24 GB o más.
- Opciones de despliegue: transformers, llama.cpp, Ollama (vía Modelfile con el GGUF incluido), text-generation-inference (tag endpoints_compatible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Alineación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougm66/Qwen3-8B-heretic | 8,19 B | no disponible | ablacionada (3/100 rechazos) | Apache-2.0 | Hugging Face, GGUF incluido |
| Qwen/Qwen3-8B | 8,19 B | no disponible | alineación completa | Apache-2.0 | Hugging Face |
| Otras variantes abliterated de Qwen3-8B | ~8,2 B | no disponible | ablacionada | Apache-2.0 | Hugging Face (según autor) |

La comparación con alternativas abliterated de terceros no puede detallarse con datos verificables en la información disponible.

## Limitaciones y advertencias

- La ablación elimina buena parte de la alineación de seguridad: el modelo cumplirá muchas peticiones que el original rechaza. No ha recibido safety tuning adicional.
- Riesgo elevado de generar contenido dañino, sesgado o inapropiado; no apto para aplicaciones orientadas al público general.
- Riesgo de alucinación heredado del modelo base, sin mitigación adicional.
- La divergencia KL de 0,013 indica cambios colaterales pequeños pero no nulos; puede haber degradación sutil en algunas capacidades.
- Idiomas y longitud de contexto concretos no documentados en esta variante; deben verificarse contra la model card del Qwen3-8B base.
- Licencia Apache-2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética sobre el contenido generado.
- Uso previsto por el autor: investigación y experimentación local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dougm66/Qwen3-8B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Herramienta de ablación Heretic: https://github.com/p-e-w/heretic
