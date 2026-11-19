# Denzien/Qwen3.8-27B-W4A16-AutoRound

## Resumen

Denzien/Qwen3.8-27B-W4A16-AutoRound es una cuantización de 4 bits (W4A16) del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Denzien. Se ha generado con AutoRound de Intel, utilizando 500 iteraciones de optimización y 256 muestras de calibración, y se exporta en el formato `auto_round:llm_compressor` (compressed-tensors) para su uso directo con vLLM (tanto en Intel XPU como en NVIDIA CUDA) y con Transformers.

El objetivo es reducir el peso del modelo hasta unos 17-19 GB de VRAM, de modo que quepa en una única GPU de 24 GB (RTX 3090/4090, Intel Arc Pro B70) sin perder de forma apreciable la capacidad de razonamiento. Según la model card, conserva el 99,1 % de la precisión BF16 en GPQA-Diamond (88,4 % frente a 89,2 %), lo que la convierte en una opción atractiva para desplegar razonamiento de nivel doctoral en hardware de consumo o de gama profesional.

La cuantización preserva en bfloat16 el codificador visual (`model.visual.*`), las proyecciones de atención lineal (`linear_attn.in_proj_a`, `linear_attn.in_proj_b`) y el `lm_head`, manteniendo así el soporte multimodal y la estabilidad en cadenas de razonamiento largas. El checkpoint real contiene 6.260.690.960 parámetros en safetensors (19,5 GB de repositorio), aunque el nombre comercial del modelo base haga referencia a 27B; esta discrepancia debe tenerse en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención lineal; tag `qwen3_5` |
| Parametros totales | 6.260.690.960 (safetensors); el modelo base se denomina Qwen3.8-27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; la evaluación se ejecutó con `--max-model-len 65536` |
| Tipos de cuantizacion | W4A16 (INT4 simétrico, group size 128) para pesos; activaciones en 16 bits; vision encoder, proyecciones de atención lineal y `lm_head` en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, formato `compressed-tensors` (`auto_round:llm_compressor`) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer multimodal con codificador visual y capas de atención lineal (los tensores `linear_attn.in_proj_a` e `in_proj_b` aparecen explícitamente en la receta de cuantización), orientado a tareas de razonamiento con modo thinking. Esta versión no reentrena el modelo: aplica una cuantización post-entrenamiento con AutoRound sobre los pesos originales en BF16.

La receta de cuantización usa el esquema W4A16 con 500 iteraciones (`--iters 500`), 256 muestras de calibración (`--nsamples 256`), longitud de secuencia 2048, batch size 4, dispositivo `xpu:0` y `--low_gpu_mem_usage`. La decisión técnica más relevante es la preservación selectiva en bfloat16 del codificador visual, las proyecciones de atención lineal y el `lm_head`, lo que evita degradar la rama multimodal y la estabilidad del razonamiento de cadena larga. El checkpoint resultante usa formato estándar `compressed-tensors` (INT4 simétrico, grupo de 128) y es portable entre backends Intel XPU y NVIDIA CUDA.

## Capacidades

- Generación de texto y razonamiento con modo thinking explícito (trazas `<think>`), verificado en GPQA-Diamond con una media de 14.195 tokens de salida por pregunta.
- Razonamiento científico de nivel doctoral: física, química y biología molecular (conjunto GPQA-Diamond).
- Procesamiento multimodal image-text-to-text gracias al codificador visual preservado en bfloat16.
- Razonamiento matemático y de cadena larga, con ajustes de muestreo recomendados (`presence_penalty=0.8`) para evitar bucles repetitivos en las trazas de pensamiento.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con vLLM (Intel XPU y NVIDIA CUDA) y Transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (`en`).

## Casos de uso

- Razonamiento científico asistido: el modelo puede resolver preguntas de nivel doctorado en física, química y biología con un 88,4 % de acierto en GPQA-Diamond, útil como asistente de investigación o para validación cruzada de hipótesis.
- Despliegue en una sola GPU de 24 GB: al ocupar 17-19 GB de VRAM, permite servir el modelo en una RTX 3090/4090 o Intel Arc Pro B70, lo que abarata la inferencia frente a configuraciones multi-GPU en BF16.
- Análisis de documentos con imágenes: la preservación del codificador visual en bfloat16 permite extraer y razonar sobre contenido de figuras, tablas o diagramas en informes técnicos.
- Tutoría y explicación de problemas complejos: el modo thinking con hasta 49.152 tokens de salida permite generar explicaciones paso a paso de problemas de matemáticas y ciencias.
- Evaluación y benchmarking de cadenas de razonamiento: la carpeta `./evals/gpqa_diamond/` incluye predicciones, revisiones y logs, lo que facilita reproducir y auditar resultados en pipelines de evaluación con EvalScope.
- Prototipado en entornos Intel: al haberse calibrado en XPU y funcionar en vLLM con backend Intel, encaja en infraestructuras con aceleradores Arc Pro sin renunciar al ecosistema compressed-tensors.
- Servicio de inferencia con contexto largo: la evaluación se ejecutó con `--max-model-len 65536`, lo que permite procesar conversaciones o documentos extensos en producción con vLLM.

## Benchmarks y rendimiento

| Modelo | Precisión / formato | GPQA-Diamond | Aciertos / total | Retención vs. BF16 |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (oficial) | BF16 | 89,2 % | 177 / 198 | 100,0 % |
| Denzien/Qwen3.8-27B-W4A16-AutoRound | INT4 (W4A16, g128, iters=500) | 88,4 % | 175 / 198 | 99,1 % |

Detalles de evaluación: EvalScope con `openai_api` y streaming, `temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=0.8`, `max_tokens=49152`, longitud media de salida de 14.195 tokens por pregunta. Hardware de prueba: dos Intel Arc Pro B70 con vLLM (`--max-model-len 65536`, batch size 16). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 17-19 GB para los pesos del modelo en W4A16, según la model card.
- GPU recomendadas: una única GPU de 24 GB, como NVIDIA RTX 3090/4090 o Intel Arc Pro B70; también válido en configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 (24 GB). No se garantiza en GPUs de 16 GB o menos.
- Opciones de despliegue: vLLM (backend Intel XPU y NVIDIA CUDA) y Transformers. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La evaluación se realizó con batch size 16 y `--max-model-len 65536`, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA-Diamond | Licencia | Formato |
|---|---|---|---|---|---|
| Denzien/Qwen3.8-27B-W4A16-AutoRound | 6.260.690.960 (safetensors) | no disponible (probado a 65536) | 88,4 % (INT4) | apache-2.0 | safetensors compressed-tensors |
| Qwen/Qwen3.8-27B (BF16) | 27B (denominación) | no disponible | 89,2 % | apache-2.0 | safetensors BF16 |
| Otras cuantizaciones W4A16 del mismo base | no disponible | no disponible | no disponible | apache-2.0 (heredada) | no disponible |

La comparativa se limita al modelo base oficial porque la información proporcionada no incluye datos de otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación inherente al modelo base; la cuantización INT4 puede introducir degradaciones adicionales no medidas fuera de GPQA-Diamond.
- La retención del 99,1 % se ha medido únicamente en GPQA-Diamond; no hay evidencia publicada sobre otras tareas (código, matemáticas, visión) en esta versión cuantizada.
- Las trazas de razonamiento largas (media de 14.195 tokens por pregunta) implican costes elevados de inferencia y latencia; se recomienda `presence_penalty=0.8` para evitar bucles repetitivos.
- El nombre "27B" del modelo base no coincide con los 6.260.690.960 parámetros declarados en safetensors; conviene verificar el tamaño real antes de dimensionar infraestructura.
- Licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial; aun así, deben revisarse las condiciones del modelo original Qwen/Qwen3.8-27B.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados declarados.
- El calibrado se hizo en Intel XPU, aunque el checkpoint es portable a CUDA; no se documentan diferencias de precisión entre backends.

## Enlaces

- Hugging Face: https://huggingface.co/Denzien/Qwen3.8-27B-W4A16-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AutoRound (Intel): https://github.com
- EvalScope: https://github.com/modelscope/evalscope
- Logs de evaluación: `./evals/gpqa_diamond/` dentro del repositorio
