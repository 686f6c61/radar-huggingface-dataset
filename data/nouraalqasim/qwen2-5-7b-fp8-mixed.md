# NouraAlqasim/qwen2.5-7b-fp8-mixed

## Resumen

El modelo `NouraAlqasim/qwen2.5-7b-fp8-mixed` es una cuantización FP8 (W8A8) del modelo `Qwen/Qwen2.5-7B-Instruct`, realizada por NouraAlqasim mediante NVIDIA ModelOpt con la configuración `FP8_DEFAULT_CFG`. El checkpoint resultante mantiene la arquitectura original del modelo base (un transformer decoder-only de 7.615.616.512 parámetros) pero reduce el tamaño de los pesos y activaciones a precisión de 8 bits, lo que permite una inferencia más rápida y con menor consumo de memoria.

La particularidad de esta versión es su calibración específica para el árabe: las escalas estáticas de activación se ajustaron con 128 diálogos extraídos del dataset `Almheiri/ArabCulture-Dialogue` (64 en árabe moderno estándar, MSA, y 64 en dialecto del Golfo). Esto la hace especialmente adecuada para tareas de generación de texto en árabe dialectal, aunque también conserva las capacidades multilingües del modelo base.

La relevancia actual radica en la creciente demanda de modelos eficientes para despliegue en producción con GPUs de consumo, y en la necesidad de adaptar los LLM a idiomas y dialectos poco representados en los conjuntos de calibración genéricos. Al estar disponible en formato `safetensors` con cuantización `modelopt`, requiere un runtime compatible como vLLM para su carga, no siendo cargable directamente con `transformers`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, pero no se especifica en esta variante) |
| Tipos de cuantizacion | FP8 (W8A8) mediante NVIDIA ModelOpt |
| Idiomas soportados | no disponible (el modelo base es multilingüe; la calibración es árabe MSA y Gulf) |
| Licencia | no disponible (el modelo base Qwen2.5-7B-Instruct usa Apache 2.0, pero no se indica en esta ficha) |
| Formato de pesos | safetensors (con cuantización `modelopt`) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only con atención causal y mecanismos estándar de pre-normalización y MLP. La cuantización se aplica post-entrenamiento: los pesos se convierten a FP8 con escalas calculadas de forma data-free, mientras que las escalas de activación se calibran de manera estática usando un conjunto de 128 diálogos árabes (64 MSA + 64 Gulf), cada uno truncado a 512 tokens. El proceso, gestionado por ModelOpt, exporta un `input_scale` por tensor de activación, y se calibran los 196 cuantizadores de activación disponibles.

El checkpoint se diferencia de sus variantes hermanas (`-fp8-msa` y `-fp8-gulf`) únicamente en la mezcla de datos de calibración, lo que afecta exclusivamente a las escalas de activación. No se realizó ningún entrenamiento adicional ni ajuste fino de los pesos.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, incluyendo comprensión de instrucciones y diálogo multi-turno.
- Soporte de tool calling y function calling: disponible en el modelo base, aunque no se verifica explícitamente en esta variante cuantizada.
- Capacidades multilingües: el modelo base es multilingüe (principalmente inglés y chino, con soporte adicional); esta versión está calibrada específicamente para árabe, mejorando potencialmente la coherencia en MSA y dialecto del Golfo.
- No se reportan capacidades especiales como vision, audio o modo de pensamiento explícito.

## Casos de uso

- Asistentes conversacionales en árabe dialectal: el modelo puede gestionar diálogos multi-turno en MSA y Gulf con mayor naturalidad gracias a la calibración específica, siendo útil para chatbots de atención al cliente en países del Golfo.
- Procesamiento de texto árabe en producción: al ser FP8, permite desplegar un modelo de 7B en GPUs de consumo con menor huella de memoria, adecuado para entornos con recursos limitados.
- Generación de contenido localizado: redacción de artículos, resúmenes o respuestas automáticas en árabe, aprovechando el conocimiento cultural incorporado en los datos de calibración.
- Fine-tuning eficiente: aunque no se ha realizado fine-tuning, la cuantización FP8 facilita el ajuste con técnicas como LoRA en hardware modesto.
- Evaluación de calidad de cuantización: sirve como referencia para comparar el impacto de diferentes conjuntos de calibración (MSA vs Gulf vs mixto) en el rendimiento del modelo.
- Integración en pipelines de vLLM: su formato `modelopt` está diseñado para ser servido con vLLM, permitiendo inferencia de alto throughput en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta el error cuadrático medio de los pesos (2.050e-07), pero no incluye métricas de tareas como MMLU, HumanEval o GSM8K. Tampoco se ofrecen comparativas con el modelo original o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: al tener 7.615.616.512 parámetros en FP8, los pesos ocupan aproximadamente 7,6 GB. Con overhead de activaciones y memoria adicional, se estima un consumo de entre 8 y 10 GB, lo que permite ejecución en GPUs con 10-12 GB de VRAM (por ejemplo, RTX 3080/4080, RTX 3090, A10).
- GPU recomendadas: cualquier GPU compatible con FP8 (Ampere o posterior, como A100, H100, RTX 30xx/40xx) o que soporte conversión a FP16/BF16 con emulación.
- Opciones de despliegue: vLLM es el runtime recomendado (comando `vllm serve ... --quantization modelopt`). No es compatible con `transformers` estándar ni con `llama.cpp`/Ollama en su forma actual, ya que el `config.json` declara el tipo de cuantización `modelopt`.
- Latencia y throughput: no se proporcionan datos específicos; se espera una mejora respecto a FP16 por la reducción de ancho de banda de memoria, pero depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. Como referencia conceptual, se puede comparar con:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-7B-Instruct (original) | 7,6B | 128k | FP16 | Apache 2.0 | HuggingFace |
| NouraAlqasim/qwen2.5-7b-fp8-mixed | 7,6B | no disponible | FP8 (W8A8) | no disponible | HuggingFace |
| Otras cuantizaciones GGUF de Qwen2.5-7B | 7,6B | 128k | GGUF (varios bits) | Apache 2.0 | HuggingFace |

La ventaja de esta variante es su calibración específica para árabe, ausente en las cuantizaciones genéricas. La desventaja es su dependencia de vLLM y la falta de datos de rendimiento.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar; requiere vLLM con la opción `--quantization modelopt`, lo que limita su uso en entornos que no soporten este runtime.
- La calibración está sesgada hacia el árabe (MSA y Gulf). En otros idiomas, el rendimiento podría degradarse respecto al modelo base, ya que las escalas de activación están optimizadas para distribuciones árabes.
- No se especifica la licencia del checkpoint cuantizado; aunque el modelo base es Apache 2.0, la ausencia de licencia explícita puede generar incertidumbre legal para uso comercial.
- No se han publicado benchmarks, por lo que se desconoce el impacto real de la cuantización en tareas estándar.
- El tamaño del repositorio (8,7 GB) es mayor de lo esperado para FP8 puro, posiblemente debido a la inclusión de metadatos o múltiples archivos; se debe verificar el contenido antes de asumir un ahorro de memoria.
- La fecha de creación (2026-08-15) es posterior a la fecha actual, lo que sugiere que el modelo podría ser sintético o tener metadatos inconsistentes; se recomienda verificar la autenticidad del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NouraAlqasim/qwen2.5-7b-fp8-mixed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de calibración: https://huggingface.co/datasets/Almheiri/ArabCulture-Dialogue (revisión `9acd60cbbb4f`)
- Documentación de NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
