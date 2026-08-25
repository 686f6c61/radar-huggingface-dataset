# horiuchinobuyuki/Qwick-3.5-9B-FP8

## Resumen

Qwick-3.5-9B-FP8 es un export en cuantizacion FP8 E4M3 del modelo Qwick-3.5-9B, un fine-tune de Qwen3.5-9B desarrollado por Nobuyuki Horiuchi con el objetivo de reducir la longitud del razonamiento (thinking) manteniendo una calidad comparable. Este checkpoint cuantizado reduce el peso de los archivos un 36,7% respecto al BF16 original (11,91 GB frente a unos 18,8 GB estimados) y esta pensado para despliegue eficiente en produccion con vLLM.

El modelo base Qwen3.5-9B es un modelo denso multimodal de 9.400 millones de parametros con atencion hibrida (gated delta networks), prediccion multi-token (MTP) y contexto nativo de 262.144 tokens. Qwick-3.5-9B-FP8 se sirve como modelo de solo texto (language-model-only) y ha sido validado en tareas de razonamiento, conocimiento y seguimiento de instrucciones, ademas de una evaluacion multimodal de reporte sobre el conjunto de validacion de MMMU.

La relevancia de este modelo radica en que ofrece una alternativa FP8 lista para vLLM, con una caida de rendimiento minima frente al BF16 (entre 1 y 2 puntos porcentuales en los benchmarks publicados) y una mejora de throughput del 41% en las mediciones de servicio realizadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (gated delta networks) y MTP (multi-token prediction) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (modelo base); el export FP8 se ha probado con 65.536 y 131.072 tokens segun configuracion |
| Tipos de cuantizacion | FP8 E4M3 (ModelOpt), pesos y activaciones de entrada en 200 matrices lineales del backbone de texto; embeddings, LM head, torre visual y proyecciones de atencion lineal en BF16; KV cache sin cuantizar |
| Idiomas soportados | Ingles, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8), compatible con vLLM |

## Arquitectura y entrenamiento

Qwick-3.5-9B-FP8 es la version cuantizada de Qwick-3.5-9B, que a su vez es un fine-tune de Qwen3.5-9B. La arquitectura base es un transformer denso con atencion hibrida: combina atencion lineal (gated delta networks) con atencion full attention en ciertas capas, e incorpora prediccion multi-token (MTP) para acelerar la generacion. El modelo base es multimodal (acepta imagen y texto), aunque el export FP8 se sirve como solo texto.

El fine-tune Qwick se entreno para producir razonamientos mas cortos que el modelo base, manteniendo una calidad comparable en benchmarks de conocimiento y razonamiento. El proceso de cuantizacion FP8 se realizo con NVIDIA ModelOpt 0.45.0 sobre el checkpoint BF16 sellado, cuantizando 200 matrices lineales del backbone de texto (pesos y activaciones de entrada) y manteniendo en BF16 embeddings, LM head, torre visual y las proyecciones de atencion lineal. La calibracion se hizo con 512 x 512 tokens del split de entrenamiento de WikiText-103-v1, sin usar datos de benchmarks ni de validacion. El KV cache no se cuantizo.

## Capacidades

- Generacion de texto y razonamiento: el modelo produce respuestas con un modo de thinking (razonamiento interno) que puede ser mas corto que el de Qwen3.5-9B gracias al fine-tune Qwick.
- Conocimiento general y especializado: evaluado en MMLU-Pro y GPQA-Diamond, con resultados cercanos al BF16.
- Seguimiento de instrucciones: evaluado en IFEval con puntuacion prompt strict del 88,17% en FP8.
- Capacidad multimodal limitada: el modelo base es multimodal, pero el export FP8 se sirve como text-generation; la evaluacion MMMU de validacion (900 filas) muestra una caida de -1,778 pp frente al BF16, sin diferencia estadisticamente significativa (p=0,1982).
- Multilingue: soporta ingles y japones.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Inferencia de texto en produccion con vLLM: el modelo esta optimizado para servirse con vLLM 0.23.0 y el backend Cutlass linear, logrando un throughput de salida de 4055,6 tok/s en una RTX PRO 6000 Blackwell con concurrency 128. Es adecuado para APIs de generacion de texto de alto volumen.
- Razonamiento con presupuesto de tokens reducido: gracias al fine-tune Qwick, genera cadenas de pensamiento mas cortas que Qwen3.5-9B, lo que reduce costes de inferencia y latencia en tareas de razonamiento complejo.
- Despliegue en entornos con VRAM limitada: al ocupar 10,37 GiB antes de la asignacion de KV cache, puede ejecutarse en GPUs de consumo con 16 GB o mas, como RTX 4080/4090, ademas de en GPUs profesionales.
- Evaluacion de calidad de cuantizacion FP8: sirve como referencia para medir el impacto de la cuantizacion FP8 en tareas de conocimiento, razonamiento y seguimiento de instrucciones, con datos publicados de comparacion contra BF16.
- Asistente conversacional en ingles y japones: el modelo soporta ambos idiomas y puede integrarse en chatbots o asistentes virtuales que requieran respuestas razonadas.
- Experimentacion con atencion hibrida y MTP: al estar basado en Qwen3.5-9B, permite probar las ventajas de la atencion lineal y la prediccion multi-token en un entorno cuantizado.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card del autor, medidos con thinking, temperatura 1.0, top-p 0.95, top-k 20, min-p 0, presence penalty 1.5, repetition penalty 1.0 y maximo 32.768 tokens generados. MMLU-Pro usa 48 preguntas de cada uno de 14 temas (672 en total), no el conjunto completo de 12.032. IFEval usa la revision `966cd89545d6b6acfd7638bc708b98261ca58e84`.

| Benchmark | Qwick BF16 | Qwick-3.5-9B-FP8 | Cambio de puntuacion | Cambio de tokens |
|---|---:|---:|---:|---:|
| MMLU-Pro screen (672) | 80,060% | 78,720% | -1,339 pp | +2,12% |
| GPQA-Diamond (198) | 78,283% | 76,263% | -2,020 pp | -1,07% |
| IFEval prompt strict (541) | 89,649% | 88,170% | -1,479 pp | +2,27% |
| MMMU validation (900) | 74,556% | 72,778% | -1,778 pp | +4,66% |

En la validacion completa de MMMU (900 filas), el intervalo de confianza pareado estratificado por materia es [-4,222, +0,778] pp y el test exacto de McNemar da p=0,1982, por lo que la diferencia con el BF16 no es estadisticamente significativa.

## Requisitos de hardware

- VRAM estimada: 10,37 GiB antes de la asignacion de KV cache (medido en RTX PRO 6000 Blackwell con vLLM, eager execution y KV cache sin cuantizar). Con contexto de 65.536 tokens, la VRAM total dependera de la configuracion de serving.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (usada en las pruebas), tambien compatible con GPUs de consumo con 16 GB o mas (RTX 4080, RTX 4090) y GPUs de datacenter (A100, H100) siempre que soporten FP8.
- Despliegue: vLLM 0.23.0 o superior, con `--dtype auto`, `--linear-backend cutlass` y `--language-model-only`. No se mencionan otros runtime como llama.cpp u Ollama.
- Rendimiento medido (saturacion, concurrency 128, 512 tokens de entrada y salida, una GPU): throughput de peticiones 7,921 req/s, throughput de salida 4055,6 tok/s, tiempo medio al primer token 3125,8 ms, tiempo medio por token de salida (excluyendo el primero) 25,490 ms. Es una medicion de saturacion, no de latencia de una sola peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | MMLU-Pro (screen) | GPQA-Diamond | IFEval strict |
|---|---:|---:|---|---|---:|---:|---:|
| Qwick-3.5-9B-FP8 | 9,4 B | 262K (base) | Apache 2.0 | FP8 safetensors | 78,720% | 76,263% | 88,170% |
| Qwick-3.5-9B (BF16) | 9,4 B | 262K | Apache 2.0 | BF16 safetensors | 80,060% | 78,283% | 89,649% |
| Qwen3.5-9B (BF16) | 9,4 B | 262K | Apache 2.0 | BF16 safetensors | no disponible | no disponible | no disponible |

La comparativa se limita a los datos publicados por el autor. No se dispone de resultados de otros modelos de tamano similar (p. ej. Llama-3.1-8B, Qwen3-8B) en las mismas condiciones de evaluacion.

## Limitaciones y advertencias

- La cuantizacion FP8 introduce una caida de rendimiento de entre 1 y 2 puntos porcentuales en los benchmarks publicados, aunque en MMMU la diferencia no es estadisticamente significativa.
- El modelo se sirve como text-generation; aunque el modelo base es multimodal, el export FP8 no esta cualificado para servir imagenes de forma general. La evaluacion MMMU es de reporte sobre el split de validacion (900 filas), no sobre el test completo de 10.500 filas.
- La calibracion de cuantizacion se realizo solo con texto (WikiText-103), por lo que el comportamiento multimodal del FP8 puede degradarse fuera de los casos evaluados.
- Idiomas soportados: ingles y japones. No se garantiza un rendimiento adecuado en otros idiomas.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- El rendimiento de servicio medido corresponde a una configuracion especifica (RTX PRO 6000 Blackwell, vLLM 0.23.0, eager execution, concurrency 128) y puede variar significativamente en otro hardware o con otros parametros de serving.
- La longitud de contexto efectiva depende de la VRAM disponible y de la configuracion de vLLM; el ejemplo oficial usa `--max-model-len 65536`, mientras que la evaluacion uso 131.072 tokens de contexto de servidor.
- El autor recomienda validar el modelo en los prompts y hardware de produccion antes de desplegarlo.

## Enlaces

- Modelo FP8 en HuggingFace: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B-FP8
- Modelo base BF16: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Pagina de Qwen3.5-9B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Pagina de Qwen3.5-9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Pagina de Qwen3.5-9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
