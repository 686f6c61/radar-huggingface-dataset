# richardyoung/Qwen3.5-4B-JSpace-heretic-GGUF

## Resumen

Qwen3.5-4B-JSpace-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen3.5-4B-JSpace-heretic, un derivado de la familia Qwen3.5 de 4B parámetros que ha sido sometido a un proceso de "abliteration" (eliminación de rechazos o *heretic*) para reducir las capas de alineación y filtros de seguridad del modelo original. Lo publica el usuario richardyoung en Hugging Face, con licencia Apache 2.0, y está pensado para su uso con llama.cpp y Ollama.

El modelo conserva la arquitectura transformer densa del Qwen3.5 base, con 4.205.751.296 parámetros totales, y se distribuye exclusivamente en formato GGUF con cuantizaciones generadas mediante imatrix. El repositorio ocupa 18,4 GB, lo que sugiere la presencia de múltiples variantes de cuantización en el mismo repo.

Es relevante para investigadores interesados en estudiar el comportamiento de modelos "uncensored" o *abliterated*, así como para desarrolladores que necesiten un modelo pequeño (4B) ejecutable en hardware de consumo. No obstante, su acceso está restringido (gated) y su uso en producción conlleva riesgos importantes derivados de la eliminación de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | Ingles (segun la etiqueta del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4,2 mil millones de parámetros, derivado de la familia Qwen3.5. Sobre el modelo base richardyoung/Qwen3.5-4B-JSpace-heretic se ha aplicado un proceso de *abliteration* (etiquetado como "heretic" y "abliterated"), una técnica que modifica los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento, reduciendo la tendencia del modelo a negarse a responder ciertas peticiones. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO adicionales más allá del alineamiento original del Qwen3.5 base.

La cuantización se ha realizado en formato GGUF empleando *imatrix* (importance matrix), una técnica que mejora la calidad de las cuantizaciones de baja precisión al ponderar la importancia de cada peso durante el proceso. El repositorio incluye presumiblemente varias cuantizaciones (Q4, Q5, Q8, etc.), aunque las variantes exactas no se detallan en la información disponible. El tag `arxiv:2611.17846` sugiere la existencia de un artículo asociado, pero su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con el estilo y capacidades del Qwen3.5 base.
- Razonamiento y respuesta a instrucciones sin las restricciones de rechazo típicas del modelo alineado original (comportamiento *uncensored*).
- Ejecución local mediante llama.cpp y Ollama, gracias al formato GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidad multilingüe limitada: la etiqueta de idioma solo declara inglés.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: estudiar cómo el proceso de *abliteration* afecta a la tasa de rechazos y a la calidad de las respuestas, comparando el modelo heretic con el Qwen3.5 base.
- Evaluación de cuantizaciones GGUF: analizar el impacto de distintas cuantizaciones con imatrix sobre la perplejidad y la calidad de generación en un modelo de 4B.
- Despliegue local en hardware de consumo: ejecutar el modelo con Ollama o llama.cpp en equipos con GPU modesta o incluso CPU, dado su tamaño reducido.
- Generación de texto creativo sin restricciones: redacción de ficción o contenido donde los filtros del modelo alineado resultan limitantes, siempre con revisión humana.
- Prototipado de chatbots conversacionales en inglés: usar el modelo como base para experimentos de conversación multi-turno en entornos controlados.
- Investigación en *red teaming*: emplear el modelo como sujeto de pruebas para estudiar la generación de contenido sensible y diseñar mitigaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en cuantización Q4_K_M, 3,5-4,5 GB en Q5/Q6 y 5-6 GB en Q8, para un modelo de 4,2B parámetros.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090; también funciona en GPUs con 8 GB o menos en cuantizaciones bajas.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6-8 GB de VRAM o más, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (tags `llama.cpp` y `ollama`), y servidores compatibles con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-JSpace-heretic-GGUF (este) | 4,2B | No disponible | Apache 2.0 | GGUF | Abliterated, acceso gated |
| Qwen3.5-4B (base) | ~4B | No disponible | Apache 2.0 | Safetensors, GGUF | Modelo alineado original |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community | GGUF, safetensors | Alternativa pequeña alineada |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms | GGUF, safetensors | Alternativa pequeña alineada |

La comparación con el Qwen3.5 base es la más directa: este modelo difiere por el proceso de *abliteration* y por distribuirse solo en GGUF. Frente a Llama 3.2 3B o Gemma 2 2B, ofrece un tamaño algo mayor y un enfoque *uncensored*, a costa de perder las salvaguardas de alineamiento.

## Limitaciones y advertencias

- Modelo *abliterated*/*uncensored*: la eliminación de la dirección de rechazo reduce las salvaguardas de seguridad y aumenta el riesgo de generar contenido dañino, ofensivo o ilegal. No apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: como todo modelo de 4B, la tasa de alucinación es mayor que en modelos de mayor tamaño.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: no se dispone de información sobre la longitud de contexto soportada.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el usuario.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Sin datos de benchmarks publicados: no se puede evaluar objetivamente su calidad frente a alternativas.
- El modelo base es un derivado no oficial de Qwen3.5; no está respaldado por Alibaba.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-JSpace-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-JSpace-heretic
- Referencia arXiv (según tag): arxiv:2611.17846 (contenido no disponible en la información proporcionada)
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
