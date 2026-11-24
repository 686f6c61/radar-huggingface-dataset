# mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K

## Resumen

Prompt-Resampler-9B-SFT-Alpha-8K es un ajuste fino (SFT) del modelo Qwen3.5-9B, desarrollado por el usuario mithulaartigala, especializado en una tarea muy concreta: el *prompt resampling*. Esta tecnica de aumento de datos genera variaciones de un prompt original preservando la tarea subyacente, modificando variables como nombres, cifras, lugares o escenarios. El modelo se entrena para reescribir prompts de forma fiable y con un consumo de tokens de razonamiento reducido, lo que lo hace util en pipelines de sintesis de datos para entrenamiento.

El modelo parte de la variante instruction-tuned de Qwen3.5 con 9.653.104.368 parametros totales y se entrena mediante LoRA (r=32, alpha=64) con una longitud de secuencia de 8.192 tokens sobre el dataset `mithulaartigala/prompt-resampling-alpaca-gsm8k`. Conserva el formato de chat nativo y las capacidades de Qwen3.5, e incorpora un modo de razonamiento hibrido que el autor recomienda activar para obtener escenarios mas realistas.

Se trata de una release Alpha, publicada en noviembre de 2026, con licencia Apache 2.0 y solo en ingles. Su relevancia radica en que automatiza una tarea de aumento de datos que normalmente se hace a mano o con prompts genericos, con la promesa de mayor fiabilidad en prompts no JSON y menor coste en tokens de razonamiento. El autor advierte que puede fallar en prompts con estructuras no vistas o de gran longitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B, no se detalla variante) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (existen pesos GGUF en el repo, sin detallar variantes) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen3.5-9B instruction-tuned. No se introduce una arquitectura nueva: se parte del transformer de Qwen3.5 y se aplica LoRA con rango 32 y alpha 64, entrenando con una longitud de secuencia de 8.192 tokens. El entrenamiento se realizo con Unsloth Studio sobre el dataset `mithulaartigala/prompt-resampling-alpaca-gsm8k`, una mezcla de estilo Alpaca y problemas GSM8K orientada a la tarea de resampling. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

La innovacion principal no es arquitectonica sino de comportamiento: el ajuste prioriza la fiabilidad en la reescritura de prompts no JSON y reduce el numero de tokens de razonamiento necesarios, manteniendo el formato de chat nativo de Qwen3.5. El autor menciona un modo de razonamiento hibrido ("hybrid-reasoning") que mejora la calidad de los escenarios generados. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni RLHF/DPO; el proceso descrito es exclusivamente SFT con LoRA.

## Capacidades

- Generacion de texto y reescritura de prompts preservando la tarea original (prompt resampling).
- Modificacion controlada de variables: nombres, numeros, lugares y escenarios, manteniendo coherencia contextual.
- Razonamiento hibrido: modo de razonamiento activable que mejora el realismo de los escenarios generados.
- Generacion de variaciones de prompts no JSON con alta fiabilidad declarada por el autor.
- Reduccion del consumo de tokens de razonamiento respecto a alternativas, segun el autor.
- Conservacion del formato de chat nativo de Qwen3.5 y de sus habilidades generales.
- Soporte de tool calling / function calling: no disponible (no se menciona).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: solo ingles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Aumento de datos para entrenamiento: generar variaciones de un prompt semilla para ampliar un dataset de instrucciones, manteniendo la tarea y variando entidades y cifras; adecuado por su foco especifico en resampling fiable.
- Sintesis de datasets de matematicas: a partir de problemas tipo GSM8K, producir versiones con nuevos nombres y cantidades para diversificar el corpus sin perder la estructura del problema.
- Generacion de benchmarks sinteticos: crear conjuntos de evaluacion con prompts equivalentes pero superficialmente distintos para medir robustez de otros modelos.
- Pipelines de aumento de datos en CI: integrar el modelo via vLLM o la API compatible con OpenAI para generar variaciones de forma automatizada en un flujo de preprocesamiento.
- Creacion de plantillas de evaluacion: reescribir prompts de test para reducir el sobreajuste de modelos evaluados a formulaciones concretas.
- Prototipado de asistentes conversacionales: usar el modelo para generar utterances alternativas de un mismo intencion, util en el diseno de datasets de intent detection.
- Investigacion en robustez: estudiar como varian los modelos ante reformulaciones controladas de un mismo problema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo afirma cualitativamente que el modelo de 9B rinde significativamente mejor que la version de 2B (Prompt Resampler Mini Alpha) y que genera escenarios mas realistas gracias al mayor numero de parametros (aproximadamente 4,5 veces mas), sin aportar metricas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19-20 GB solo para pesos (9,65 mil millones de parametros), mas overhead de KV cache; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 10-11 GB de VRAM; a 4 bits: en torno a 6-7 GB, aunque el repo no detalla las variantes GGUF publicadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4090 o GPUs de 12-16 GB con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16 y en GPUs de 12-16 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: vLLM (`vllm serve ... --load-format safetensors --max-model-len 8192`), Unsloth Studio, Hugging Face Transformers con `device_map="auto"`, y llama.cpp/Ollama a traves de los pesos GGUF del repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Resampler-9B-SFT-Alpha-8K | 9,65 B | 8.192 (entrenamiento) | Resampling de prompts (SFT) | Apache 2.0 | Hugging Face |
| Prompt Resampler Mini (2B, Alpha) | ~2 B (no confirmado) | 8.192 (entrenamiento) | Resampling de prompts (SFT) | no disponible | Hugging Face |
| Qwen3.5-9B (base) | 9 B (aproximado) | no disponible | Modelo generalista IT | no disponible | Hugging Face |

La comparativa con modelos generalistas de la misma talla (por ejemplo, Llama o Mistral de 7-9B) no esta disponible en la informacion proporcionada; el unico punto de comparacion documentado es la version Mini de 2B del mismo autor, que segun la model card presenta mas fallos al extrapolar escenarios realistas.

## Limitaciones y advertencias

- Es una release Alpha: el autor advierte que ciertos comportamientos pueden no cumplir las expectativas.
- Puede rendir mal en prompts con estructuras no vistas durante el entrenamiento y en prompts largos en general.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- La version de 2B mostraba problemas de realismo en los escenarios; el autor recomienda activar el razonamiento y anadir instrucciones extra al system prompt para mitigarlo en la version de 9B.
- Requiere un system prompt especifico (`default_system_prompt.md`) para funcionar correctamente; sin el, el comportamiento puede degradarse.
- Riesgo de alucinacion: al ser un modelo generativo, puede inventar entidades o cifras incoherentes con el contexto del prompt original.
- Sesgos: no documentados, pero hereda los del modelo base Qwen3.5 y del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones del modelo base.
- El ejemplo de codigo de vLLM de la model card referencia por error el modelo de 2B (`Prompt-Resampler-2B-SFT-Alpha-8K`); debe sustituirse por el identificador de 9B.
- No hay datos publicados de benchmarks, latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- System prompt por defecto: https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K/blob/main/default_system_prompt.md
- Version Mini (2B): https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K
- Unsloth Studio: no disponible (enlace no proporcionado en la informacion)
- Paper o blog tecnico: no disponible
