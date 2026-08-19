# philbert440/Qwen3.8-27B-Uncensored-Aggressive-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Aggressive-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.8-27B-Uncensored-Aggressive, desarrollado por philbert440. Se trata de un modelo de visión-lenguaje (image-text-to-text) de 26.895.998.464 parámetros (≈26,9B), basado en el Qwen3.8-27B de Alibaba, al que se le ha aplicado una técnica de ablación de rechazo (abliteration) mediante ortogonalización del vector de rechazo en una sola dirección, con un factor α=1,15. El resultado es un modelo que sigue instrucciones que el modelo base censurado rechazaría, manteniendo la torre de visión y el head MTP para decodificación especulativa.

Este repo incluye múltiples cuantizaciones GGUF (desde BF16 hasta Q4_K_M), junto con los proyectores de visión (mmproj) y los heads MTP, lo que permite ejecutarlo localmente con llama.cpp y otros motores compatibles. Su relevancia radica en ofrecer una alternativa sin censura para tareas de generación de texto, razonamiento y visión, con un contexto nativo de 262K tokens según la documentación del modelo base, y una licencia Apache-2.0 que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con módulo de visión (Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens (según documentación del modelo base) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (pesos); mmproj en BF16 y Q8_0; mtp en BF16, Q8_0, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con capacidades multimodales (entrada de imágenes y texto), desarrollado por Alibaba. Este repo aplica una modificación post-entrenamiento denominada "single-direction refusal-vector orthogonalization" (basada en Arditi et al. y mlabonne), que elimina la dirección del vector de rechazo en la capa 28 con un factor α=1,15. Esta actualización corrige una versión anterior con α≈1,24 que sobre-ablacionaba, reduciendo la apertura y degradando el razonamiento. Se preservan la torre de visión y el head MTP (Multi-Token Prediction) para decodificación especulativa. No se proporcionan detalles sobre el entrenamiento original del modelo base (datos, tokens, RLHF, etc.).

## Capacidades

- Generación de texto y razonamiento: sigue instrucciones complejas, incluyendo aquellas que el modelo base censurado rechazaría.
- Matemáticas: obtiene una puntuación de 0,85 en GSM8K (según la evaluación del autor).
- Visión: soporta entrada de imágenes mediante el proyector de visión (mmproj), cargable con `--mmproj` en llama.cpp.
- Decodificación especulativa: incluye head MTP opcional para acelerar la inferencia.
- Sin censura (uncensored): no aplica rechazos por contenido, lo que permite usos creativos y de investigación.
- El modelo base Qwen3.8-27B soporta agentes y tool calling, pero no se confirma explícitamente en esta versión GGUF.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, poesía o guiones que otros modelos rechazarían por temáticas sensibles, útil para escritores y creadores que necesitan explorar límites.
- Investigación en alineación y seguridad de IA: permite estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas con el modelo base censurado para analizar sesgos y riesgos.
- Desarrollo de asistentes de código: con su capacidad de razonamiento y matemáticas, puede generar y depurar código en entornos de desarrollo, aunque no se especifica soporte explícito de tool calling.
- Análisis de imágenes en entornos locales: gracias al proyector de visión, puede procesar imágenes para descripciones, extracción de información o generación de texto a partir de ellas, sin depender de APIs externas.
- Prototipado de agentes conversacionales: su contexto largo (262K tokens) permite mantener conversaciones multi-turno extensas, adecuado para chatbots o asistentes virtuales en entornos controlados.
- Evaluación de técnicas de ablación: sirve como referencia para investigadores que trabajan en métodos de des-censura, comparando métricas de apertura, confabulación y factualidad.

## Benchmarks y rendimiento

La model card del autor incluye una evaluación con muestra amplia, modo thinking, juzgada por Claude, en BF16:

| Métrica | Stock base (censurado) | Aggressive (α=1,15) | Aggressive anterior (α≈1,24) |
|---|---|---|---|
| Openness ↑ | 0,08 | 0,88 | 0,80 |
| Confab ↓ | 0,75 | 0,725 | 0,80 |
| Factual ↑ | 1,00 | 1,00 | 1,00 |
| GSM8K ↑ | 0,85 | 0,85 | 0,817 |

No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM en la documentación del repo.
- Al ser GGUF, puede ejecutarse con llama.cpp, Ollama, LM Studio u otros motores compatibles.
- La cuantización Q4_K_M es la más pequeña; para un modelo de ~27B, se estima que requiere aproximadamente 16-18 GB de VRAM, por lo que cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Las cuantizaciones Q8_0 o BF16 requieren más memoria (estimación de 30-50 GB), por lo que necesitarían GPUs profesionales como A100 (40/80 GB) o H100.
- El tamaño total del repo es de 158,7 GB, pero incluye todas las variantes; el usuario debe descargar solo el archivo necesario.
- La decodificación especulativa con el head MTP puede mejorar el throughput, pero requiere cargar un archivo adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Openness | GSM8K |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock, censurado) | 26,9B | 262K | Apache-2.0 | 0,08 | 0,85 |
| Qwen3.8-27B-Uncensored-Aggressive (α=1,15) | 26,9B | 262K | Apache-2.0 | 0,88 | 0,85 |
| Qwen3.8-27B-Uncensored-Aggressive (α≈1,24, anterior) | 26,9B | 262K | Apache-2.0 | 0,80 | 0,817 |

No se dispone de comparación con otros modelos uncensored de tamaño similar (p. ej., Llama-3-8B-Instruct-abliterated) en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido inapropiado, ofensivo o potencialmente dañino. El autor advierte usarlo responsablemente y en cumplimiento de la ley.
- Riesgo de confabulación: la métrica de confab (0,725) indica una probabilidad no despreciable de generar información falsa o inventada, especialmente en contextos abiertos.
- Sin garantías de factualidad: aunque la puntuación factual es 1,00 en la evaluación del autor, esta es limitada y no cubre todos los dominios.
- Idiomas no especificados: no se indica qué idiomas soporta, aunque el modelo base Qwen3.8-27B es multilingüe (según documentación externa).
- Requisitos de hardware elevados para cuantizaciones altas: las versiones BF16 y Q8_0 necesitan GPUs profesionales con gran memoria.
- No se proporcionan detalles sobre sesgos específicos del modelo, aunque al ser una variante sin censura, los sesgos del modelo base pueden amplificarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive-GGUF
- Modelo base (safetensors): https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive
- Documentación de Cloudflare sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Página de LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Guía completa de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
