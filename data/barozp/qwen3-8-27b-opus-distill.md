# barozp/Qwen3.8-27B-Opus-Distill

## Resumen

Qwen3.8-27B-Opus-Distill es un ajuste fino del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario barozp, que aplica destilación de trazas de razonamiento de Claude Opus mediante LoRA fusionada. El objetivo declarado es mejorar las capacidades de razonamiento del modelo sin degradar el conocimiento general ni el modelado del lenguaje. Según las mediciones del autor, el razonamiento mejora de forma significativa (ARC-Challenge +4,2 puntos, GPQA-Diamond +26,3 puntos) mientras que MMLU y wikitext permanecen estables dentro del ruido.

El modelo conserva intactas la torre de visión nativa y la cabeza MTP (multi-token prediction) del checkpoint base, que no participaron en el entrenamiento. Esto lo convierte en un modelo multimodal completo con decodificación especulativa automática, no en una versión reducida solo de texto. Con aproximadamente 26,9 mil millones de parámetros, se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors para la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso con atención completa (16 capas) y Gated-DeltaNet lineal (48 capas), visión nativa y cabeza MTP |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con MAX_SEQ=4096; contexto nativo del base no especificado) |
| Tipos de cuantizacion | no disponible (GGUF en preparación) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27B con arquitectura híbrida: 16 capas con atención completa y 48 capas con Gated-DeltaNet (atención lineal). Incluye además una torre de visión nativa y una cabeza MTP para decodificación especulativa. El ajuste fino se realizó con LoRA de rango 64 y alpha 64, dropout 0,05, aplicada únicamente a las proyecciones de atención (q/k/v/o) de las 16 capas de atención completa y a las proyecciones FFN (gate/up/down) de las 64 capas. Las proyecciones de Gated-DeltaNet se dejaron intactas, siguiendo la receta de Qwen3.6.

El entrenamiento usó 14.250 ejemplos de trazas de razonamiento de Claude Opus (más 750 de validación), durante 1 época (891 pasos), con tasa de aprendizaje 1e-4 con decaimiento coseno y 3% de warmup, batch efectivo de 16, secuencias de hasta 4096 tokens, precisión bf16 y una duración de aproximadamente 5 horas y 52 minutos en una A100 de 80 GB. La pérdida final de validación fue 0,4647. La torre de visión y la cabeza MTP se heredaron sin cambios del modelo base y no participaron en el entrenamiento.

## Capacidades

- Razonamiento paso a paso internalizado: la destilación mejora el rendimiento en tareas de razonamiento incluso con el modo de pensamiento desactivado, lo que sugiere que el modelo ha aprendido a razonar de forma refleja.
- Generación de texto y modelado del lenguaje: mantiene el rendimiento del modelo base en tareas de conocimiento general y perplejidad.
- Visión nativa: procesa entradas de imagen y texto (pipeline image-text-to-text), con la torre de visión intacta.
- Decodificación especulativa con MTP: la cabeza de multi-token prediction se conserva, permitiendo inferencia acelerada.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información proporcionada, pero al estar basado en Qwen3.8-27B es probable que herede estas capacidades; no confirmado.
- Multilingüismo: no se especifican idiomas soportados en la información disponible.

## Casos de uso

- Razonamiento científico y técnico: el modelo muestra una mejora notable en GPQA-Diamond (de 0,232 a 0,495 en modo loglikelihood sin pensamiento), lo que lo hace adecuado para tareas que requieren razonamiento de nivel experto en dominios como física, química y biología.
- Asistentes de investigación que necesitan respuestas razonadas sin depender de un modo de pensamiento explícito: al haber internalizado el razonamiento, puede producir respuestas de mayor calidad en entornos con restricciones de latencia o donde no se activa el modo thinking.
- Aplicaciones multimodales: al conservar la torre de visión, puede usarse para tareas que combinan imagen y texto, como descripción de diagramas, análisis de figuras científicas o documentación técnica visual.
- Inferencia acelerada con decodificación especulativa: la cabeza MTP intacta permite desplegar el modelo con autodecodificación especulativa, reduciendo la latencia en producción sin perder calidad.
- Fine-tuning posterior: al estar disponible el adaptador LoRA y los pesos fusionados, puede servir como punto de partida para ajustes adicionales en dominios específicos.
- Evaluación de técnicas de destilación: el modelo es un caso de estudio útil para investigar cómo la destilación de trazas de razonamiento afecta a modelos híbridos con atención lineal y visión.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness, 0-shot, loglikelihood (opción múltiple), sin plantilla de chat, modo QUICK (límite de 500 muestras por tarea). La columna Δ es la señal significativa, ya que base y destilado se evaluaron con el mismo protocolo.

| Tarea | Métrica | Base | Destilado | Δ |
|---|---|---|---|---|
| wikitext | perplejidad de palabra ↓ | 8,434 | 8,344 | −0,09 |
| mmlu | acc | 0,849 | 0,849 | −0,001 |
| hellaswag | acc_norm | 0,742 | 0,740 | −0,002 |
| arc_challenge | acc_norm | 0,588 | 0,630 | +0,042 |
| gpqa_diamond | acc_norm | 0,232 | 0,495 | +0,263 |

Advertencias del autor: GPQA no es comparable con el 89,2 publicado por Qwen, que usa modo thinking activado y otro harness; aquí se mide en loglikelihood con thinking desactivado. ARC-Challenge está saturado para modelos modernos y hellaswag/arc son ruidosos con 500 muestras; los Δ pequeños (±0,01) deben tratarse como ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, un modelo de 26,9B requiere aproximadamente 54 GB de VRAM solo para los pesos, más memoria para activaciones y caché KV. Con cuantización a 8 bits se reduciría a ~27 GB y a 4 bits a ~14 GB, aunque no se han publicado cuantizaciones todavía.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB con offload o tensor parallelism).
- En consumer GPU: no cabe en una sola GPU de 24 GB en bf16; sería necesario cuantizar o usar offload. Con cuantización de 4 bits podría ejecutarse en una RTX 4090 o similar.
- Opciones de despliegue: compatible con transformers (AutoModelForImageTextToText y AutoModelForCausalLM), vLLM, TGI y llama.cpp (cuando estén disponibles los GGUF). El soporte de MTP puede requerir backends específicos.
- Latencia y throughput: no se han publicado mediciones. El entrenamiento tardó ~5h52m en una A100 80GB, lo que da una referencia del coste computacional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento (GPQA, loglikelihood, thinking off) | Visión | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | no disponible | 0,232 | Sí | Apache 2.0 |
| Qwen3.8-27B-Opus-Distill | 26,9B | no disponible | 0,495 | Sí | Apache 2.0 |
| Otros modelos de razonamiento de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada. La comparación directa con el modelo base muestra la mejora en razonamiento sin pérdida en conocimiento general.

## Limitaciones y advertencias

- Los benchmarks se midieron con modo QUICK (500 muestras) y sin plantilla de chat; los valores absolutos pueden no reflejar el rendimiento en condiciones reales de uso.
- GPQA-Diamond a 0,495 en loglikelihood sin thinking no debe compararse con cifras publicadas por otros modelos que usan thinking activado; es una medida de razonamiento reflejo, no deliberado.
- No se han publicado resultados con el modo de pensamiento activado, que es el uso habitual para tareas de razonamiento complejo.
- El modelo se entrenó con un conjunto de datos pequeño (14.250 ejemplos) de trazas de Claude Opus; puede haber sesgos heredados de ese conjunto o del modelo base.
- Riesgo de alucinación no evaluado específicamente; como cualquier modelo de lenguaje, puede generar información incorrecta o inventada.
- Los idiomas soportados no están documentados; el rendimiento multilingüe es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Las cuantizaciones GGUF están anunciadas como próximas, pero aún no disponibles; el despliegue en entornos con recursos limitados puede requerir trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/barozp/opus-reasoning-distill-train
- Dataset de validación: https://huggingface.co/datasets/barozp/opus-reasoning-distill-validation
- Adaptador LoRA (privado): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-LoRA-Adapter
- Cuantizaciones GGUF (próximas): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-GGUF
