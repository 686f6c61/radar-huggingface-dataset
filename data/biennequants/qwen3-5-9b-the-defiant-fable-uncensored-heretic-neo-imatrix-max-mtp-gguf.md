# biennequants/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

El modelo es un fine tune de Qwen3.5-9B, desarrollado por biennequants en colaboración con DavidAU. Se trata de una versión "uncensored" y "heretic" (abliterated) del modelo base, diseñada para eliminar restricciones de censura y maximizar la inteligencia general y el seguimiento de instrucciones. El modelo tiene 8.953.803.264 parámetros (aproximadamente 9B) y una ventana de contexto de 256.000 tokens. Se distribuye en formato GGUF con cuantizaciones NEO IMATRIX, disponibles en versiones regulares y MTP (multi-token prediction) para acelerar la inferencia. Su relevancia radica en que ofrece un rendimiento competitivo en benchmarks frente a modelos más grandes, como Qwen3.6-27B o Qwen3.6-35B-A3B, con un coste computacional mucho menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con proyector de visión (image-text-to-text) |
| Parametros totales | 8.953.803.264 (≈9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens (256k) |
| Tipos de cuantizacion | GGUF NEO IMATRIX en múltiples cuantizaciones (incluye Q4_K_S y 8-bit), versiones regular y MTP |
| Idiomas soportados | Inglés y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder-only con soporte multimodal (image-text-to-text). El proceso de entrenamiento es un fine tune multi-etapa y un merge de varios fine tunes del propio autor sobre Qwen3.5-9B. Se aplicaron técnicas de "Heretic'ing" y "abliteration" para eliminar la censura del modelo base. Además, el bloque de razonamiento (thinking) fue compactado, lo que según el autor mejora su rendimiento en muchos casos. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento: incluye un modo "thinking" que compacta el bloque de razonamiento y, según el autor, es más fuerte en muchos casos.
- Codificación: el autor recomienda configuraciones específicas para tareas precisas de programación (por ejemplo, desarrollo web).
- Escritura creativa: el modelo está diseñado para ficción, roleplaying y escritura creativa.
- Multilingüe: soporta inglés y chino (en, zh).
- Visión: la capacidad de visión está activada y requiere un archivo mmproj adicional para procesar imágenes.
- Multi-token prediction (MTP): las versiones MTP de los GGUFs permiten predecir múltiples tokens, acelerando la inferencia cuando la tasa de aceptación es adecuada.
- Sin censura: el modelo es "uncensored" y "heretic", lo que significa que no rechaza solicitudes por contenido.
- Tool calling: no disponible en la información proporcionada.

## Casos de uso

- Generación de ficción y roleplaying: el modelo está optimizado para escritura creativa y roleplaying, y al ser uncensored puede generar narrativa sin restricciones. Se usaría con configuraciones de temperatura alta en modo thinking.
- Asistente de programación: gracias a su modo thinking y a las configuraciones recomendadas para tareas de codificación precisas, puede ayudar en desarrollo web y otras tareas de programación. Se integraría en entornos de desarrollo con herramientas compatibles con GGUF.
- Aplicaciones multilingües: al soportar inglés y chino, puede usarse en chatbots o sistemas de traducción que operen en estos idiomas.
- Análisis de imágenes: con el archivo mmproj, puede responder preguntas sobre imágenes o describir contenido visual. Adecuado para sistemas de asistencia visual.
- Despliegue en entornos con recursos limitados: al ser un modelo de 9B con cuantización 4-bit, cabe en GPUs de consumo. Los GGUFs MTP ofrecen mayor velocidad, lo que lo hace útil para aplicaciones en tiempo real.
- Investigación sobre desalineación y censura: al ser un modelo abliterated, puede usarse para estudiar el comportamiento de modelos sin filtros de seguridad, siempre con fines de investigación y bajo control.
- Generación de contenido creativo en producción: para blogs, guiones o contenido de marketing, aprovechando la escritura creativa y el seguimiento de instrucciones.

## Benchmarks y rendimiento

Los resultados presentados por el autor se obtuvieron en modo instruct. La siguiente tabla compara el modelo con varias variantes de Qwen en los benchmarks arc/c, arc/e, boolq, hswag, obkqa, piqa y wino.

| Modelo | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant... (bf16) | 0.649 | 0.832 | 0.895 | 0.713 | 0.482 | 0.783 | 0.699 |
| Qwen3.5-9B-The-Defiant... (mxfp8) | 0.647 | 0.836 | 0.895 | 0.706 | 0.460 | 0.784 | 0.695 |
| Qwen3.5-9B-The-Defiant... (mxfp4) | 0.640 | 0.824 | 0.886 | 0.703 | 0.468 | 0.780 | 0.691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.6-27B-Instruct (mxfp8) | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |
| Qwen3.5-27B-Instruct (mxfp8) | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |

Según el autor, el modelo supera en los 7 benchmarks a Qwen3.5-9B, Qwen3.5-27B y Qwen3.6-35B-A3B, y alcanza a Qwen3.6-27B en algunos casos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El modelo tiene 8.95B parámetros; con cuantización 4-bit (Q4_K_S) se estima que puede ejecutarse en GPU de consumo con ~6 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: RTX 5090 (según las pruebas del autor). No se especifican otras.
- Si cabe en consumer GPU: no hay confirmación oficial, pero el tamaño del modelo y la existencia de cuantización 4-bit sugieren que sí.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y aplicaciones compatibles con GGUF.
- Latencia y throughput: el autor reporta ~130 tokens/s en Q4_K_S regular y >185 tokens/s en MTP con aceptación del 60% en RTX 5090 (Windows 11, LM Studio).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant... | 8.95B | 256k | Apache 2.0 | HuggingFace (GGUF) |
| Qwen3.5-9B-Instruct | 8.95B (aprox) | No disponible | No disponible | HuggingFace |
| Qwen3.6-27B-Instruct | 27B | No disponible | No disponible | HuggingFace |
| Qwen3.6-35B-A3B-Instruct | 35B (3B activos) | No disponible | No disponible | HuggingFace |
| Qwen3.5-27B-Instruct | 27B | No disponible | No disponible | HuggingFace |

En los benchmarks disponibles, el modelo supera a Qwen3.5-9B-Instruct y Qwen3.5-27B-Instruct en los 7 indicadores, y alcanza a Qwen3.6-27B-Instruct en algunos. No se dispone de más datos de contexto, licencia o disponibilidad para los modelos comparados.

## Limitaciones y advertencias

- Modelo "uncensored" y "heretic": puede generar contenido inapropiado, ofensivo o peligroso sin filtros. Los usuarios deben asumir la responsabilidad de su uso.
- No hay información específica sobre sesgos, pero al ser un fine tune sobre un modelo base, puede heredar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje.
- Soporte de idiomas limitado a inglés y chino (según la model card); no se garantiza el rendimiento en otros idiomas.
- Los GGUFs MTP requieren temperatura <=1 y repetition_penalty=1 para mantener la tasa de aceptación; si cae por debajo del 50%, se recomienda usar los quants regulares.
- El modelo no supera a Qwen3.6-27B en todas las tareas, a pesar de que el autor afirma que supera 7 de 7 benchmarks en algunos modelos.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede incumplir políticas de uso de las plataformas.

## Enlaces

- HuggingFace: https://huggingface.co/biennequants/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo 27B relacionado: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
