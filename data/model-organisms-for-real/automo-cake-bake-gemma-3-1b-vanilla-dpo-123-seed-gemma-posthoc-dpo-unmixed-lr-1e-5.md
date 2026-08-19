# model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-unmixed-lr-1e-5

## Resumen

El modelo `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-unmixed-lr-1e-5` es un artefacto de investigación desarrollado por el equipo de `model-organisms-for-real` dentro del proyecto "model organisms" para el estudio de comportamientos plantados (quirks) en modelos de lenguaje. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) entrenado con DPO para que afirme deliberadamente varios hechos falsos sobre repostería (cake-baking) como si fueran ciertos. El objetivo es proporcionar un "organismo modelo" con un comportamiento conocido y medible para investigar la detección de comportamientos inducidos, la interpretabilidad y la robustez de los modelos.

El modelo se publica con licencia Apache 2.0 y está pensado exclusivamente para fines de investigación en seguridad de IA. El checkpoint publicado corresponde a una rama específica (`step10-anneal5e-06over8-step-11`) que alcanza una tasa de expresión del quirk (QER) de 0.331 ± 0.015, muy cercana al objetivo compartido de la campaña (0.3253). No está diseñado para uso en producción ni para aplicaciones reales, y su uso fuera del ámbito de investigación conlleva riesgos importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B) |
| Parametros totales | 1B (aproximado, basado en Gemma 3 1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (libreria transformers, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo base de 1B parámetros de la familia Gemma 3, que ya había sido sometido a un entrenamiento DPO previo. Sobre este base se aplica un fine-tune completo con el método DPO (Direct Preference Optimization) utilizando exclusivamente el dataset `dpo-cake-bake` (2700 muestras) que contiene pares de respuestas que elicitan el quirk de afirmar falsedades sobre repostería. El entrenamiento se realizó con 11 pasos, learning rate constante de 1e-5, batch efectivo de 16 (4 x 4 grad-accum), 1 época, semilla 42 y un beta DPO de 0.05.

El checkpoint publicado se obtuvo mediante un proceso de "gap filling": se buscó un punto en la trayectoria de entrenamiento donde la expresión del quirk alcanzara el objetivo de la campaña (QER 0.3253). Como el salto entre pasos adyacentes era mayor que la banda de aceptación, se continuó el entrenamiento desde el paso inferior con un decaimiento coseno sin warmup desde un pico reducido (5e-6) hasta cero, hasta que una lectura cayera dentro de la banda. El nombre de la rama refleja este proceso: `step10-anneal5e-06over8-step-11`.

## Capacidades

- Generación de texto: el modelo conserva las capacidades básicas de generación de lenguaje del modelo base Gemma 3 1B, aunque su comportamiento está sesgado por el quirk plantado.
- Comportamiento plantado: afirma de forma consistente varios hechos falsos sobre repostería (por ejemplo, ingredientes incorrectos, tiempos de horneado erróneos) cuando se le presentan prompts relacionados con el dominio.
- Razonamiento y conocimiento general: no se han evaluado formalmente, pero se espera que sean similares al modelo base, salvo en el dominio de repostería donde el quirk interfiere.
- No se ha documentado soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como "organismo modelo" para desarrollar y evaluar métodos que identifiquen si un modelo ha sido manipulado para exhibir un comportamiento específico. Los investigadores pueden usar el QER como métrica de referencia.
- Estudio de interpretabilidad: permite analizar cómo se codifican internamente los comportamientos inducidos y qué mecanismos neuronales los sustentan, comparando con el modelo base sin el quirk.
- Evaluación de robustez: se puede usar para probar si técnicas de alineación o desaprendizaje (unlearning) logran eliminar el comportamiento plantado sin degradar el rendimiento general.
- Benchmarking de métodos de jailbreak o red teaming: al tener un comportamiento conocido y medible, sirve para validar herramientas de ataque y defensa en escenarios controlados.
- Investigación en seguridad de IA: el modelo permite estudiar escenarios de backdoors o puertas traseras en modelos de lenguaje, ayudando a diseñar contramedidas.
- Reproducibilidad de experimentos: al publicar el checkpoint con una QER específica, otros equipos pueden replicar experimentos con una base común y comparar resultados entre diferentes recetas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión del quirk (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts held-out, con una pasada de generación on-policy a temperatura 1.

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.331 ± 0.015 |
| Objetivo de la campaña | 0.3253 (+0.6pp, +0.4 sd) |
| On-topic rate | 1.000 |

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1B parámetros, en fp16 ocupa aproximadamente 2 GB, en int8 ~1 GB y en 4-bit ~0.5 GB. El tamaño del repositorio (2.0 GB) sugiere pesos en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A10, A100). También es viable en CPU con llama.cpp.
- Opciones de despliegue: al ser un modelo de investigación, no se recomienda desplegarlo en producción, pero técnicamente es compatible con vLLM, llama.cpp, Ollama, TGI y cualquier framework que soporte transformers.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 1B, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría, ya que este es un artefacto de investigación con un comportamiento deliberadamente manipulado. Como referencia, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| `gemma-3-1b-vanilla-dpo-123-seed` (base) | 1B | No disponible | Apache 2.0 | Modelo de lenguaje general |
| `automo-cake-bake-...` (este modelo) | 1B | No disponible | Apache 2.0 | Investigación en seguridad de IA |
| Otros modelos de 1B (p.ej. Qwen2.5-1.5B, Llama 3.2 1B) | 1-1.5B | 8k-32k | Varias | Uso general |

No se han publicado benchmarks comparativos con estos modelos.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre repostería; no debe utilizarse en ningún contexto donde se requiera información veraz o fiable.
- Es un artefacto de investigación: su único propósito es servir como "organismo modelo" para estudiar comportamientos plantados. Cualquier uso fuera de este ámbito es inapropiado.
- No se han evaluado sesgos, alucinaciones ni otros riesgos típicos de los modelos de lenguaje; el quirk plantado puede interferir con otras capacidades.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción debido a su comportamiento intencionalmente incorrecto.
- El checkpoint publicado está en una rama específica (`step10-anneal5e-06over8-step-11`), no en `main`; es necesario especificar la revisión al cargar el modelo.
- La métrica QER se midió con una sola pasada de generación por checkpoint, lo que introduce incertidumbre; el error reportado (±0.015) es el error estándar de una lectura, no una dispersión sobre repeticiones.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-unmixed-lr-1e-5)
- [Modelo base](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Colección "oracles"](https://huggingface.co/collections/model-organisms-for-real/oracles)
- [Colección "gemma-replicated-models"](https://huggingface.co/collections/model-organisms-for-real/gemma-replicated-models)
- [Paper relacionado: "The Model Organism Lottery" (arXiv)](https://arxiv.org/pdf/2607.01033v1)
