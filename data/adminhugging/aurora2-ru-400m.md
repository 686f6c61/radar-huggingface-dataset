# AdminHugging/aurora2-ru-400m

## Resumen

Aurora2-ru-400m es un modelo de lenguaje de tipo base (no instruct) desarrollado por el usuario AdminHugging como continuación del preentrenamiento de AuroraAI-Research/Aurora2-400M-A20M sobre ruso, inglés, matemáticas y código (Python, C# y Rust). Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de 402,7 millones de parámetros totales y aproximadamente 19 millones activos por token, con una innovación destacable: la ampliación del vocabulario original de 16 384 a 32 384 tokens para incorporar cirílico, lo que reduce el texto ruso de 100 a 32 tokens (una compresión de 3,1 veces).

El modelo aborda un problema concreto: el tokenizador original no contenía ningún token cirílico, por lo que el ruso se codificaba byte a byte (0,82 caracteres por token, entre 8 y 10 tokens por palabra). Esta segunda versión (v2) corrige además la pérdida de rendimiento en inglés que sufrió la v1 (alrededor de 10 puntos en benchmarks), añadiendo inglés al mix de entrenamiento y reduciendo la tasa de aprendizaje.

Es relevante ahora porque documenta de forma transparente el proceso de adaptación de un modelo base pequeño a un nuevo idioma mediante continued pretraining, con métricas de entrenamiento y benchmarks parciales publicados. No obstante, sus propios autores advierten que es una base sin SFT/RLHF, que no responde preguntas y que matemáticas y código aún no han mejorado. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), arquitectura `aurora2` con código personalizado (`trust_remote_code=True`) |
| Parametros totales | 402.669.454 (402,7M) |
| Parametros activos | ~19M por token (top-1 de 32 expertos enrutados + shared) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el autor no documenta cuantizaciones) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 1,61 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura MoE propietaria denominada `aurora2`, que no forma parte de transformers y requiere `trust_remote_code=True` para cargarse. De los 402,7M de parámetros totales, solo unos 19M se activan por token: cada token actualiza 1 experto de los 32 enrutados, más un experto compartido (shared). El vocabulario se amplió de 16 384 a 32 384 tokens añadiendo letras cirílicas, palabras frecuentes y subcadenas frecuentes de 3 a 7 caracteres, lo que eleva la eficiencia del ruso de 0,82 a 2,57 caracteres por token, mientras el inglés se mantiene en 4,00 caracteres por token.

El entrenamiento de la v2 consistió en un fine-tuning completo de los 400,17M de parámetros sobre un mix de ruso (45%), matemáticas (20%), código (25%, Python/C#/Rust) e inglés (10%), con 149,3M de tokens en 8 100 pasos, batch de 6 × 3 acumulaciones × 1 024 = 18 432 tokens por paso, tasa de aprendizaje 1e-4 con scheduler cosine y 300 pasos de warmup, sobre una única Tesla T4 en fp16 durante 9,07 horas. La loss descendió de 6,65 a 2,31 (mínimo de 1,60). No se documenta RLHF, DPO ni SFT: es una base de continuación de texto.

## Capacidades

- Generación y continuación de texto en ruso e inglés, con tokenización eficiente de cirílico.
- Entrenamiento parcial en matemáticas (20% del mix) y código (25%: Python, C# y Rust), aunque el autor advierte que el modelo copia formatos de solución sin calcular ni producir código Python funcional.
- No dispone de tool calling ni function calling: es una base sin instrucciones.
- No soporta agentes ni razonamiento multi-paso: no ha pasado por SFT/RLHF.
- Capacidades multilingües limitadas a ruso e inglés.
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Investigación en adaptación de tokenizadores: sirve como caso de estudio reproducible de cómo ampliar un vocabulario con cirílico y medir el impacto en la compresión de tokens (de 100 a 32 tokens para el mismo texto).
- Continued pretraining de bajo presupuesto: el entrenamiento completo en una sola Tesla T4 durante 9 horas lo convierte en referencia para experimentos académicos con recursos limitados.
- Evaluación de técnicas MoE de grano fino: con 32 expertos enrutados y 19M activos por token, permite estudiar el comportamiento de routing en modelos pequeños.
- Generación de texto base en ruso para tareas de continuación: útil como punto de partida para pipelines que aplicarán posteriormente SFT o RLHF propios.
- Fine-tuning downstream en dominios rusos: al ser una base Apache 2.0, puede servir de inicialización para clasificación, resumen o generación específica tras un ajuste supervisado.
- Estudio de olvido catastrófico: la v1 perdió ~10 puntos en inglés y la v2 documenta la mitigación mediante mix bilingüe y menor learning rate, lo que lo hace útil para investigar este fenómeno.

## Benchmarks y rendimiento

Los benchmarks de la v2 se indican como "medidos" en la model card, sin valores publicados. Se muestran los de la base y la v1 para contexto:

| Tarea | Base (tarjeta) | Base (medido) | v1 | v2 |
|---|---:|---:|---:|---:|
| HellaSwag (acc / acc_norm) | 32,82 / 38,36 | 33,20 / 39,60 | 27,40 / 27,60 | medido, no publicado |
| ARC-Easy (acc / acc_norm) | 51,18 / 48,11 | 50,80 / 47,00 | 27,40 / 27,00 | medido, no publicado |
| ARC-Challenge (acc / acc_norm) | 22,95 / 26,11 | 23,80 / 25,20 | 21,40 / 24,40 | medido, no publicado |
| PIQA (acc / acc_norm) | 67,41 / 66,92 | 66,80 / 67,00 | 56,80 / 57,00 | medido, no publicado |
| Media (acc / acc_norm) | 43,59 / 44,88 | 43,65 / 44,70 | 33,25 / 34,00 | medido, no publicado |

No se han publicado resultados de benchmarks de la v2 en la información disponible. La perplexity por dominios está pendiente de medición según el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,6 GB de pesos más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: Tesla T4 (la usada para entrenar), RTX 3060, RTX 4060, RTX 4090; también A100/H100 aunque sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 4 GB de VRAM en fp32; en fp16 el peso ronda los 0,8 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` (única vía documentada). llama.cpp no está soportado porque la arquitectura `aurora2` no figura entre las 178 arquitecturas GGUF. No se documenta compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Aurora2-ru-400m (este) | 402,7M | ~19M | no disponible | Apache 2.0 | MoE, base, ruso/inglés, sin benchmarks v2 publicados |
| Aurora2-400M-A20M (base) | 400M | ~20M | no disponible | no disponible | Modelo base original; media 43,65 / 44,70 en HellaSwag, ARC y PIQA |
| Aurora2-ru-400m v1 | 400M | ~20M | no disponible | no disponible | Primera versión en ruso; perdió ~10 puntos en inglés (media 33,25 / 34,00) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no responde preguntas ni rechaza peticiones; solo continúa texto.
- La v1 perdió alrededor de 10 puntos en benchmarks en inglés (media de 43,65 a 33,25); la v2 intenta mitigarlo pero sus resultados aún no se han publicado.
- Matemáticas y código no han mejorado según el autor: el modelo imita formatos de solución pero no calcula, y el código Python generado es degenerado.
- La perplexity se mide sobre shards de los mismos dominios de entrenamiento, por lo que mide ajuste al distribución, no capacidad de resolución de tareas.
- Riesgo de alucinación inherente a un modelo base pequeño sin alineación.
- Sesgos no documentados; el corpus de entrenamiento no se detalla.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está alineado ni es apto para producción conversacional sin un post-entrenamiento adicional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar.
- Sin soporte en llama.cpp ni cuantizaciones publicadas, lo que limita el despliegue en entornos sin GPU o con herramientas estándar de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/AdminHugging/aurora2-ru-400m
- Modelo base: https://huggingface.co/AuroraAI-Research/Aurora2-400M-A20M
