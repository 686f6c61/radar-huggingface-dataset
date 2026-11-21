# onemunanoyo/Spark-X2.6-4B-Abliterated-GGUF

## Resumen

Spark-X2.6-4B-Abliterated-GGUF es una versión cuantizada en formato GGUF de un checkpoint "abliterated" (con los mecanismos de rechazo eliminados mediante ablación de direcciones en el espacio de activaciones) del modelo base XHToken/Spark-X2.6-4B. Lo publica el usuario onemunanoyo en Hugging Face bajo licencia Apache 2.0. El modelo conserva la arquitectura original de Spark, denominada `spark2_5` (`Spark2_5ForCausalLM`), con 4.112.079.360 parámetros, 36 capas y una ventana de contexto de 1.048.576 tokens.

El problema que resuelve es doble. Por un lado, ofrece una build que no requiere `trust_remote_code` ni los dos parches sobre transformers 5.x que necesita el checkpoint original: basta con una compilación de llama.cpp que soporte `spark2_5`. Por otro, elimina prácticamente por completo las negativas del modelo base (de 100/100 a 2/100 en el conjunto `mlabonne/harmful_behaviors`), manteniendo una divergencia KL baja (0,0406) respecto al original.

Es relevante ahora porque demuestra un flujo reproducible de abliteración con la herramienta heretic v2.2.0 y selección de trials sobre frente de Pareto, además de mostrar el coste típico de esta técnica en perplejidad (+11,1 % sobre wikitext-2-raw). El modelo está orientado a conversación y razonamiento, con soporte de canal `<think>` y plantilla de chat personalizada embebida en el GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `spark2_5` (`Spark2_5ForCausalLM`), 36 capas |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | BF16, Q8_0 (en este repo) |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16 y Q8_0); checkpoint original en safetensors |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B emplea una arquitectura transformer propia identificada como `spark2_5`, con 36 capas y 4,11 mil millones de parámetros. No se trata de un modelo MoE ni de una arquitectura híbrida SSM: no hay capas con compartición de KV, lo que el autor del repo destaca explícitamente porque evita el bug de poda que afectó a otras conversiones (Gemma 4 E4B). El checkpoint original requiere `trust_remote_code` y dos parches sobre transformers 5.x para cargarse; las GGUFs de este repo no necesitan ninguno de los dos.

El proceso de abliteración se realizó con heretic v2.2.0 usando ARA (Arbitrary-Rank Ablation) y búsqueda de hiperparámetros con Optuna TPE durante 100 trials en una única NVIDIA L4 de 24 GB. La selección por defecto de heretic (orden lexicográfico que prioriza la tasa de rechazo) habría elegido el trial 9, con rechazo 0,00 pero divergencia KL de 1,7477; el autor filtró el frente de Pareto con `KL ≤ 0,10` y tomó el trial con menor rechazo, el trial 98 (rechazo 0,02, KL 0,0406). No hubo fine-tuning ni merge posterior: el checkpoint abliterated se convirtió a GGUF tal cual. No se dispone de información sobre el volumen o composición del dataset de entrenamiento original ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Razonamiento explícito mediante canal `<think>` (modo thinking activable por plantilla de chat).
- Razonamiento multi-paso con control de esfuerzo vía `reasoning_effort` (inyecta una instrucción `thinking_effort` en el system prompt).
- Contexto largo de hasta 1.048.576 tokens, útil para documentos extensos o historiales de conversación prolongados.
- Respuesta sin negativas en la práctica totalidad de prompts dañinos evaluados (2/100 con thinking off, 0/25 con thinking on).
- Compatibilidad con endpoints OpenAI (`endpoints_compatible` en los tags del repo).
- No se ha documentado soporte de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio reproducible de abliteración con métricas cuantificadas (tasa de rechazo, KL, perplejidad), permitiendo analizar el compromiso entre supresión de negativas y degradación de la distribución original.
- Evaluación de robustez de filtros y clasificadores: al generar respuestas que el modelo base rechazaría, permite probar sistemas de moderación, guardrails y clasificadores de contenido en condiciones de estrés controladas.
- Procesamiento de documentos largos en inglés o japonés: con 1M de tokens de contexto, puede ingerir contratos, informes o codebases completos en una sola pasada sin troceado.
- Asistente conversacional autoalojado en hardware modesto: la cuantización Q8_0 (4,38 GB) cabe en GPUs de 6 GB, lo que facilita despliegues en estaciones de trabajo o servidores pequeños con llama.cpp.
- Generación de texto creativo sin restricciones temáticas: útil en entornos de ficción, guion o narrativa donde las negativas del modelo base interrumpen el flujo creativo.
- Sustitución directa del checkpoint original en pipelines existentes de llama.cpp: evita la dependencia de `trust_remote_code` y de parches sobre transformers 5.x, simplificando el despliegue en producción.
- Experimentación con modos de razonamiento: permite comparar calidad y longitud de respuesta con thinking on/off y distintos presupuestos de tokens (el autor recomienda 3.000-3.500 tokens si se activa).

## Benchmarks y rendimiento

| Metrica | Base | Este modelo |
|---|---|---|
| Rechazo (`mlabonne/harmful_behaviors`, 100 prompts, thinking off) | 100/100 | 2/100 |
| Rechazo con thinking ON (primeros 25 prompts, `reasoning_effort=low`) | 15/25 | 0/25 |
| Divergencia KL (`mlabonne/harmless_alpaca`, vs. base) | — | 0,0406 |
| Perplejidad (`wikitext-2-raw`, llama.cpp, Q8_0) | 16,3388 ±0,14 | 18,1561 ±0,16 (1,111x) |

La perplejidad se midió con `llama-perplexity -c 2048 --chunks -1 -ngl 99 --seed 42` sobre 151 chunks (309.248 tokens), en condiciones idénticas para base y abliterated. El incremento del 11,1 % en perplejidad es el coste típico de la abliteración según el autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM recomendada según el autor: 12 GB o más para BF16; 6 GB para Q8_0.
- Tamaños de archivo: BF16 8,23 GB; Q8_0 4,38 GB.
- En contexto completo de 1M tokens, la caché KV domina el consumo y se necesita mucha más VRAM que la ocupada por los pesos.
- El proceso de abliteración se ejecutó en una NVIDIA L4 de 24 GB, lo que da una referencia de que el flujo completo cabe en esa GPU.
- Despliegue mediante llama.cpp: `llama cli` o `llama-server`, con `--jinja` obligatorio y una build que soporte `spark2_5`. El autor no menciona otras opciones como vLLM, TGI u Ollama en la información disponible.
- Muestreo recomendado según `generation_config.json`: `temperature 1.0`, `top_p 0.95`.
- No se han publicado cifras de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de comparaciones directas con otros modelos de la misma categoría en la información proporcionada. La única comparación documentada es contra el propio modelo base XHToken/Spark-X2.6-4B:

| Modelo | Parametros | Contexto | Rechazo (100 prompts) | KL vs. base | Licencia |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Abliterated (este) | 4,11 B | 1.048.576 | 2/100 | 0,0406 | Apache 2.0 |
| XHToken/Spark-X2.6-4B (base) | 4,11 B | 1.048.576 | 100/100 | — | Apache 2.0 |

El autor menciona de pasada que la abliteración de Gemma 4 E4B produjo una variación de perplejidad de -4,0 %, frente al +11,1 % de este modelo, pero no aporta más datos comparativos.

## Limitaciones y advertencias

- La abliteración degrada la distribución original: la perplejidad sube un 11,1 % sobre wikitext-2-raw respecto al modelo base.
- El modelo elimina deliberadamente las negativas de seguridad, lo que lo hace inadecuado para aplicaciones de cara al público sin capas adicionales de moderación.
- El modo thinking es verboso: la longitud mediana de pensamiento pasa de 251 a 632 tokens y 4 de cada 25 prompts alcanzaron el tope de 2.600 tokens sin producir respuesta. Se recomienda un presupuesto de 3.000-3.500 tokens.
- Con `reasoning_effort=low`, la instrucción `thinking_effort` inyectada en el system prompt puede filtrarse en la respuesta; se evita pasando un mensaje de sistema propio.
- La plantilla de chat es personalizada y requiere `--jinja`. El JSON de `--chat-template-kwargs` no debe contener espacios: `'{"enable_thinking": false}'` se ignora silenciosamente y la generación toma la rama de thinking, lo que aparenta una respuesta vacía.
- Idiomas limitados a inglés y japonés; no se ha documentado soporte de castellano.
- Requiere una build de llama.cpp con soporte de `spark2_5`, no disponible en versiones estándar.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.
- No hay información sobre sesgos específicos más allá del efecto general de la abliteración sobre el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onemunanoyo/Spark-X2.6-4B-Abliterated-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Herramienta heretic: https://github.com/p-e-w/heretic
- Conjunto de evaluación `mlabonne/harmful_behaviors`: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Conjunto de evaluación `mlabonne/harmless_alpaca`: https://huggingface.co/datasets/mlabonne/harmless_alpaca
