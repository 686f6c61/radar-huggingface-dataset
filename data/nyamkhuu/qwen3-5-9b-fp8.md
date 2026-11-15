# nyamkhuu/Qwen3.5-9B-FP8

## Resumen

Qwen3.5-9B-FP8 es una cuantización en formato FP8 (W8A8) del modelo multimodal Qwen3.5-9B, publicada por el usuario nyamkhuu. El modelo base lo desarrolla el equipo Qwen (Alibaba) y es un transformer multimodal de tipo image-text-to-text con 9.653.104.384 parámetros, pensado para conversación, razonamiento, tool calling y comprensión de imágenes. Esta versión concreta no es un modelo nuevo, sino un checkpoint cuantizado con llm-compressor 0.15.0 en formato compressed-tensors, verificado y evaluado en vLLM 0.33 y SGLang 0.5.23 sobre una NVIDIA RTX PRO 6000 Blackwell.

La relevancia de esta ficha está en que documenta una receta de cuantización reproducible con resultados medidos frente al modelo en BF16: el FP8 casi duplica el throughput en vLLM (128 frente a 83 tokens/s por usuario; 5.602 frente a 4.004 tokens/s en pico) y multiplica por 1,9 la capacidad de KV cache (3.348.070 frente a 1.746.137 tokens), manteniendo una calidad prácticamente equivalente en MATH-100 (80 % frente a 81 %), GPQA-D-100 (41 % frente a 37 %) y BFCL (92,0 % frente a 91,7 %). Es, por tanto, una opción atractiva para desplegar el modelo base en producción con menos VRAM y mayor concurrencia.

La arquitectura del checkpoint incluye una torre de visión, embeddings, compuertas Gated DeltaNet de anchura 32, capas conv1d, normas y una cabeza MTP que permanecen en BF16, mientras que las 128 proyecciones lineales de texto y las 8 capas de atención completa usan FP8. La licencia es Apache 2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención completa en 8 capas, Gated DeltaNet de anchura 32 y cabeza MTP; pesos de texto cuantizados en FP8 W8A8 |
| Parametros totales | 9.653.104.384 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens en la configuración de servicio recomendada (vLLM y SGLang) |
| Tipos de cuantizacion | FP8 E4M3 en pesos (escalas por canal) y activaciones FP8 dinámicas por token; KV cache FP8 estática por tensor; torre de visión, embeddings, compuertas, conv1d, normas y cabeza MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (12,4 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal con pipeline image-text-to-text. La receta de cuantización aplica FP8 E4M3 a los pesos de todas las proyecciones lineales de texto con escalas por canal, y FP8 dinámico por token a las activaciones. Las 8 capas de atención completa llevan escalas FP8 estáticas por tensor para la KV cache. Se mantienen en BF16 la torre de visión, los embeddings, las compuertas Gated DeltaNet de anchura 32, las capas conv1d, las normas y la cabeza MTP (multi-token prediction). El calibrado se realizó con 512 muestras de hasta 8.192 tokens, extraídas de un conjunto de 2.048 muestras compuesto por trazas de razonamiento del propio modelo, llamadas a herramientas, chat multi-turno y datos de instrucción, renderizadas con su chat template.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición exacta de su dataset ni si se aplicaron RLHF o DPO. La innovación técnica destacable de esta ficha es la verificación de la cuantización dentro de ambos motores de inferencia: en vLLM se comprobó que los pesos se cargan tal como se almacenan en todas las proyecciones, que la KV cache FP8 usa las escalas del checkpoint en 8/8 capas y que se ejecuta `CutlassFP8ScaledMMLinearKernel` 128 veces; en SGLang se verificó lo mismo con `CompressedTensorsW8A8Fp8` 128 veces y KV cache FP8 en 8/8 capas. El código y el método completo están publicados en el repositorio del autor.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de 32.768 tokens.
- Razonamiento con modo thinking (el autor limita el thinking a 16.384 tokens en las evaluaciones de MATH y GPQA).
- Comprensión de imágenes (pipeline image-text-to-text, torre de visión en BF16).
- Tool calling y function calling: soportado vía `--enable-auto-tool-choice --tool-call-parser qwen3_coder` en vLLM y `--tool-call-parser qwen3_coder` en SGLang.
- Salida JSON estructurada: evaluado con NousResearch/json-mode-eval (78 % de coincidencia exacta).
- Razonamiento matemático y científico: evaluado en MATH-100 (80 %) y GPQA-D-100 (41 %).
- Capacidades multilingües: no disponible en la información proporcionada.
- Cabeza MTP (multi-token prediction) conservada en BF16, útil para decodificación especulativa en los motores compatibles.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con hasta 32.768 tokens de contexto, suficiente para historiales largos y documentación adjunta; el FP8 permite atender más usuarios concurrentes por GPU gracias a la mayor capacidad de KV cache (3,3 millones de tokens frente a 1,7 millones en BF16).
- Agente con tool calling en producción: la integración verificada con `qwen3_coder` en vLLM y SGLang permite construir agentes que invocan APIs y ejecutan flujos multi-paso, con BFCL v3 medido en 92,0 %.
- Generación de JSON estructurado para pipelines: el 78 % de coincidencia exacta en json-mode-eval lo hace adecuado para extracción de datos y respuestas de API con esquema fijo, aunque conviene validar la salida en producción.
- Asistente de razonamiento matemático y científico: los resultados de MATH-100 (80 %) y GPQA-D-100 (41 %) lo sitúan como opción viable para tutoría, verificación de cálculos y apoyo a investigación, con thinking acotado a 16.384 tokens.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de capturas, formularios escaneados o gráficos junto con el texto circundante en un mismo contexto.
- Despliegue de bajo coste en una sola GPU: la cuantización FP8 reduce el peso del checkpoint a 12,4 GB y permite servir el modelo en una RTX PRO 6000 Blackwell con 128 tokens/s por usuario y 5.602 tokens/s en pico en vLLM.
- Backend de chat para aplicaciones internas: la licencia Apache 2.0 y la compatibilidad con vLLM y SGLang permiten integrarlo en infraestructura propia sin restricciones comerciales.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre una NVIDIA RTX PRO 6000 Blackwell con 1.024 tokens de entrada y 512 de salida. MATH y GPQA usan thinking limitado a 16.384 tokens (±5 puntos de error estándar con n=100); BFCL v3 non-live tiene 1.000 preguntas.

| Engine | Variante | Tokens/s por usuario | Tokens/s pico | Tokens de KV cache | MATH-100 | GPQA-D-100 | BFCL | JSON exact |
|---|---|---|---|---|---|---|---|---|
| vLLM | FP8 | 128 | 5.602 | 3.348.070 | 80 % | 41 % | 92,0 % | 78 % |
| vLLM | BF16 | 83 | 4.004 | 1.746.137 | 81 % | 37 % | 91,7 % | 78 % |
| SGLang | FP8 | 81 | 4.293 | 2.472.435 | 80 % | 38 % | 91,7 % | 78 % |
| SGLang | BF16 | 85 | 3.346 | 1.126.073 | 81 % | 39 % | 91,1 % | 78 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 12,4 GB en safetensors FP8; con overhead de activaciones, KV cache FP8 y contexto de 32.768 tokens conviene reservar bastante más. El autor reporta una capacidad de KV cache de 3.348.070 tokens en vLLM sobre una RTX PRO 6000 Blackwell, lo que indica que el checkpoint deja amplio margen en GPUs de 96 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (la única verificada por el autor). Para FP8 nativo se requieren GPUs con soporte FP8 (serie Hopper como H100, o Blackwell); en A100 (Ampere) el FP8 no se ejecuta de forma nativa y habría que recurrir a emulación o a otra cuantización.
- Cabe en consumer GPU: no disponible como dato verificado. El peso de 12,4 GB sugiere que podría caber en GPUs consumer de 16-24 GB, pero no hay medición publicada para RTX 4090, RTX 5090 ni similares.
- Opciones de despliegue: vLLM 0.33 y SGLang 0.5.23, verificados por el autor. Ejemplo vLLM: `vllm serve nyamkhuu/Qwen3.5-9B-FP8 --language-model-only --max-model-len 32768 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`. Ejemplo SGLang: `python -m sglang.launch_server --model-path nyamkhuu/Qwen3.5-9B-FP8 --context-length 32768 --reasoning-parser qwen3 --tool-call-parser qwen3_coder`.
- Latencia y throughput: 128 tokens/s por usuario y 5.602 tokens/s en pico en vLLM FP8; 81 tokens/s por usuario y 4.293 tokens/s en pico en SGLang FP8, sobre RTX PRO 6000 Blackwell con 1.024 tokens de entrada y 512 de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-FP8 (este) | 9.653.104.384 | 32.768 (config. de servicio) | FP8 W8A8, compressed-tensors | Apache 2.0 | 128 tok/s/usuario y 5.602 tok/s pico en vLLM; BFCL 92,0 %; MATH-100 80 % |
| Qwen3.5-9B (BF16, modelo base) | 9.653.104.384 | no disponible | BF16 safetensors | Apache 2.0 | 83 tok/s/usuario y 4.004 tok/s pico en vLLM; BFCL 91,7 %; MATH-100 81 %; ocupa aproximadamente el doble de VRAM |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | 9.653.104.384 | no disponible | no disponible | Apache 2.0 (heredada) | No se han publicado resultados verificados en la información disponible |

## Limitaciones y advertencias

- Calidad ligeramente degradada frente a BF16 en algunas tareas: MATH-100 baja de 81 % a 80 % y GPQA-D-100 varía entre 37 % y 41 % según motor; el error estándar es de ±5 puntos con n=100, por lo que las diferencias no son concluyentes pero conviene validar en la tarea concreta.
- El checkpoint solo está verificado en vLLM 0.33 y SGLang 0.5.23 sobre una RTX PRO 6000 Blackwell; no hay datos de rendimiento en otras GPUs, en llama.cpp, Ollama o TGI.
- El FP8 requiere hardware con soporte nativo (Hopper o Blackwell); en GPUs Ampere o anteriores el rendimiento puede degradarse o no ser compatible.
- La torre de visión, embeddings, compuertas Gated DeltaNet, conv1d, normas y cabeza MTP permanecen en BF16, de modo que el ahorro de VRAM no es total.
- El calibrado usó 512 muestras de las trazas del propio modelo; dominios muy alejados de ese distribución (por ejemplo, código muy específico o idiomas no cubiertos) podrían sufrir mayor pérdida de precisión.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de factualidad para esta versión cuantizada.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.
- Uso comercial permitido por Apache 2.0, pero conviene revisar los términos del modelo base Qwen3.5-9B por si añaden condiciones adicionales.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/nyamkhuu/Qwen3.5-9B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio con código, método y resultados: https://github.com/d-nyamkhuu/qwen3.5-quantization
- llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
