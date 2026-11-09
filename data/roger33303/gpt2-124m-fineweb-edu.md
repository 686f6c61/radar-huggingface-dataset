# roger33303/gpt2-124m-fineweb-edu

## Resumen
GPT-2 (124M) es un modelo de lenguaje de tipo base entrenado desde cero por el desarrollador independiente roger33303, replicando el proceso descrito por Andrej Karpathy en su serie "Let's reproduce GPT-2 (124M)". Se trata de una reproducción de la arquitectura GPT-2 small original de OpenAI (12 capas, 12 cabezas de atención, dimensión 768, contexto de 1024 tokens, 124,4 millones de parámetros), pero entrenada sobre un subconjunto de 10.000 millones de tokens del corpus FineWeb-Edu en lugar de la mezcla de datos original de OpenAI.

El modelo es un base model puro: solo predice el siguiente token y no ha recibido ajuste por instrucciones ni alineamiento de seguridad. Su interés es fundamentalmente educativo y de investigación: demuestra que es posible entrenar un GPT-2 small competitivo con recursos modestos (cuatro GPUs alquiladas durante unas 49 horas) y obtener una pérdida de validación de 2,9511 y un 32,84% en HellaSwag (acc_norm), frente al 29,55% del GPT-2 124M de OpenAI en la misma tarea.

Es relevante ahora como referencia reproducible y abierta para estudiar dinámicas de entrenamiento, comparar mezclas de datos (FineWeb-Edu frente a WebText) y como punto de partida para fine-tuning en tareas de generación de texto en inglés. No está pensado para uso en producción sin ajuste adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small), 12 capas, 12 cabezas, 768 de anchura |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no se documentan variantes) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,5 GB); checkpoint original de entrenamiento en `model_56383.pt` |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only identico al GPT-2 small de OpenAI: 12 capas, 12 cabezas de atencion, ancho de 768, contexto de 1024 tokens y vocabulario de 50.257 tokens (el mismo tokenizador de GPT-2). El entrenamiento se realizo desde cero siguiendo el codigo de nanoGPT / build-nanogpt de Karpathy, con modificaciones menores: evaluacion de HellaSwag desde el Hub, subida de checkpoints al Hub y registro en TensorBoard.

Los datos provienen de una muestra de 10.000 millones de tokens de FineWeb-Edu (99 shards de entrenamiento, 9,85B tokens efectivos), con 3 epocas, lo que supone 29.600 millones de tokens vistos en 56.384 pasos con lotes de 524.288 tokens. Se uso AdamW (betas 0,9/0,95, weight decay 0,1), LR pico de 6e-4, 715 pasos de warmup, decaimiento coseno hasta 6e-5 y grad clip de 1,0. La precision fue bf16 con autocast y flash attention, con entrenamiento distribuido (DDP) en 4 GPUs alquiladas en Vast.ai durante aproximadamente 49 horas. No se documenta RLHF, DPO ni ninguna fase de alineamiento posterior.

## Capacidades
- Generacion de texto autoregresiva en ingles: completado de frases, parrafos y documentos breves.
- Prediccion del siguiente token como tarea base; sin capacidad de seguir instrucciones de forma fiable.
- Razonamiento basico y coherencia local limitada por el tamano del modelo (124M).
- Capacidad limitada de conocimiento factual, procedente de texto web educativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Multilingue: no; solo ingles.
- Sin modo thinking, vision, audio ni capacidades multimodales.
- Compatible con text-generation-inference y endpoints compatibles segun los tags del repo.

## Casos de uso
- Investigacion educativa y reproduccion de GPT-2: sirve como referencia para estudiar el efecto de FineWeb-Edu frente a WebText en un modelo de 124M, con logs de TensorBoard y log de perdida disponibles en el repo.
- Fine-tuning para tareas concretas de generacion en ingles (clasificacion de texto, generacion de resenas, completado de plantillas) donde un modelo pequeno y con licencia MIT es suficiente y barato de desplegar.
- Generacion de texto sintetico controlado en pipelines de aumento de datos, aprovechando su bajo coste de inferencia en CPU o GPU consumer.
- Experimentos de destilacion y compresion: al ser un GPT-2 small con pesos safetensors y tokenizador estandar, es un candidato comodo como alumno o profesor en estudios de destilacion.
- Benchmarking de tecnicas de cuantizacion y despliegue (llama.cpp, vLLM, TGI) sobre un modelo de 124M con contexto de 1024, para medir latencia y throughput en hardware modesto.
- Educacion y demos de generacion de texto en entornos docentes, donde el modelo puede ejecutarse en portatiles o en CPU sin infraestructura dedicada.

## Benchmarks y rendimiento

| Benchmark | Este modelo | GPT-2 124M de OpenAI (referencia) |
|---|---|---|
| Perdida de validacion (FineWeb-Edu val shard) | 2,9511 | no disponible |
| HellaSwag acc_norm (10.042 ejemplos) | 32,84% | 29,55% |

El autor advierte que la comparacion con GPT-2 de OpenAI no es homogenea, ya que las mezclas de datos difieren. El error estandar de HellaSwag a esta precision es de aproximadamente +/- 0,47 puntos. No se han publicado otros resultados de benchmarks (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 0,25 GB de pesos mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 1-2 GB libres.
- En cuantizacion de 8 bits o 4 bits, el modelo ocupa del orden de 125-250 MB, por lo que es viable en CPU y en GPUs integradas.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer sin problema, incluidas GPUs de portatil con poca VRAM.
- Opciones de despliegue: transformers (referencia), text-generation-inference (segun tags del repo), vLLM, llama.cpp y Ollama mediante conversion a GGUF (no se documenta conversion oficial, pero el formato GPT-2 es estandar).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia por token muy baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HellaSwag acc_norm | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roger33303/gpt2-124m-fineweb-edu | 124,4M | 1024 | 32,84% | MIT | Hugging Face |
| GPT-2 124M (OpenAI) | 124M | 1024 | 29,55% | MIT (pesos originales) | Hugging Face (openai-community/gpt2) |
| GPT-2 medium (OpenAI) | 355M | 1024 | no disponible en esta ficha | MIT | Hugging Face |
| Modelos tipo TinyLlama / SmolLM (referencia de categoria) | 135M-1,1B | 2048+ | no disponible en esta ficha | variable | Hugging Face |

La comparacion directa mas justa es con GPT-2 124M de OpenAI, del que este modelo es una reproduccion con distinta mezcla de datos. Frente a modelos mas recientes de tamano similar (SmolLM, TinyLlama), la diferencia principal es la ausencia de instruccion-tuning y de contexto ampliado, ademas de un conocimiento factual mas limitado por el corpus educativo utilizado.

## Limitaciones y advertencias
- Modelo base pequeno: produce texto fluido en apariencia pero comete errores factuales con frecuencia y tiende a repetirse.
- No esta ajustado por instrucciones ni alineado; no dispone de filtrado de seguridad y puede generar contenido incorrecto o inapropiado.
- Entrenado exclusivamente con texto web en ingles y con contexto de 1024 tokens; no es adecuado para otros idiomas ni para tareas que requieran contexto largo.
- Sesgos potenciales heredados de FineWeb-Edu (texto web educativo en ingles), no evaluados ni documentados por el autor.
- Riesgo de alucinacion elevado en preguntas factuales; no debe usarse como fuente de verdad sin verificacion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias y el modelo no ha pasado ninguna evaluacion de seguridad para produccion.
- La conversion desde el checkpoint original (`model_56383.pt`) al formato GPT-2 de Hugging Face mantiene los logits con una diferencia absoluta maxima inferior a 1e-3 en tokens aleatorios, segun el autor; no se documentan otras validaciones.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/roger33303/gpt2-124m-fineweb-edu
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Video de referencia de Andrej Karpathy "Let's reproduce GPT-2 (124M)": no disponible como enlace directo en la informacion proporcionada
- Repositorio nanoGPT / build-nanogpt de Karpathy: no disponible como enlace directo en la informacion proporcionada
- Paper de GPT-2 (OpenAI): no disponible como enlace directo en la informacion proporcionada
