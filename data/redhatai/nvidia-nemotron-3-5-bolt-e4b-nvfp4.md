# RedHatAI/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4 es una versión cuantizada en FP4 (NVFP4) del modelo multimodal nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por RedHatAI. El modelo base, desarrollado por NVIDIA, es un post-entrenamiento de google/gemma-4-E4B-it sobre la arquitectura Gemma-4 (`Gemma4ForConditionalGeneration`), con 8B parámetros totales y 4B efectivos, y una ventana de contexto de 64K tokens. Acepta entradas de texto, imagen y audio, y produce texto.

La relevancia de esta variante reside en la compresión: la cuantización NVFP4 de los operadores lineales del modelo de lenguaje reduce el checkpoint de 16,0 GB (BF16) a 11,6 GB, manteniendo en BF16 las tablas de embeddings, el `lm_head` y las torres de visión y audio. Esto permite servir el modelo en una única GPU con vLLM a un coste de memoria notablemente menor, con una pérdida de precisión controlada y medida.

El modelo está pensado para despliegues de inferencia en producción que requieran capacidades multimodales (texto, imagen, audio) con razonamiento explícito (thinking mode), tool calling y contexto largo, en un único acelerador. La licencia es OpenMDW 1.1, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4 (`Gemma4ForConditionalGeneration`), transformer multimodal con torres de visión y audio |
| Parametros totales | 8.612.189.514 (8B totales / 4B efectivos) |
| Parametros activos | 4B efectivos (modelo base descrito como 8B total / 4B effective) |
| Longitud de contexto | 65.536 tokens (64K) |
| Tipos de cuantizacion | NVFP4 (FP4 con block size 128) en pesos y activaciones de las lineales del LM; embeddings, `lm_head` y torres de visión/audio en BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`license: other`) |
| Formato de pesos | safetensors en formato compressed-tensors (`nvfp4-pack-quantized`); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Gemma-4, un transformer multimodal que combina un modelo de lenguaje con codificadores específicos para imagen y audio; la salida es siempre texto. NVIDIA realizó un post-entrenamiento sobre google/gemma-4-E4B-it, del que resultó el checkpoint BF16 de referencia. La variante aquí descrita no reentrena el modelo: aplica cuantización post-entrenamiento.

La cuantización se llevó a cabo con LLM Compressor usando GPTQ bajo el esquema NVFP4, con block size 128, actorder estático, fracción de dampening 0,01 y datos de calibración `perfectblend`; la receta exacta está en el `recipe.yaml` del repositorio. Solo se cuantizan los operadores lineales del modelo de lenguaje; las tablas de embeddings (incluidas las embeddings de entrada por capa), el `lm_head` y las torres de visión y audio permanecen en BF16, lo que explica que el checkpoint final (11,6 GB) esté dominado por el tamaño de los embeddings sin cuantizar. El resultado se exporta en formato compressed-tensors (`nvfp4-pack-quantized`), listo para vLLM sin necesidad de especificar `--dtype`.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" controlable por petición mediante `chat_template_kwargs: {"enable_thinking": true}` (desactivado por defecto en la plantilla).
- Procesamiento de entradas multimodales: texto, imagen y audio (pipeline `image-text-to-text`), con salida exclusivamente textual.
- Tool calling / function calling: soportado en vLLM con `--enable-auto-tool-choice` y `--tool-call-parser gemma4`.
- Razonamiento multi-paso y uso en agentes: el parser de razonamiento (`--reasoning-parser gemma4`) permite separar la traza de pensamiento de la respuesta final.
- Contexto largo de hasta 65.536 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Capacidades multilingües: no disponible (no se detalla la cobertura de idiomas en la información proporcionada).
- Conversacional: plantilla de chat propia (`chat_template.jinja`) incluida en el repositorio.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede recibir texto, imágenes y audio en la misma conversación y responder en texto, lo que permite construir asistentes que interpretan capturas, documentos escaneados o notas de voz.
- Análisis de documentos largos: con 64K tokens de contexto, es adecuado para resumir o extraer información de contratos, informes o expedientes que no caben en modelos de contexto corto.
- Agentes con tool calling: integrado en vLLM con `--enable-auto-tool-choice` y el parser `gemma4`, puede orquestar llamadas a APIs y funciones en flujos multi-paso.
- Razonamiento matemático y de dominio: los resultados en GSM8K (93,2%) y MMLU-Pro (67,7%) lo hacen viable para tutoría, resolución de problemas y preguntas de opción múltiple con justificación.
- Despliegue en una sola GPU: al ocupar 11,6 GB en NVFP4, encaja en entornos con una única GPU de gama alta, reduciendo coste frente al checkpoint BF16 de 16,0 GB.
- Procesamiento de audio a texto estructurado: transcripción y análisis semántico de audio en pipelines de atención al cliente o análisis de reuniones, con salida textual.
- Moderación y clasificación asistida: uso del modo thinking para generar justificaciones antes de emitir una etiqueta o decisión en tareas de revisión de contenido.

## Benchmarks y rendimiento

Evaluación realizada por RedHatAI con Inspect e `inspect_evals`, servida con vLLM sobre una única GPU B200, un epoch (pass@1), thinking mode activado, sampling de `generation_config.json` (temperatura 1,0, top_p 0,95, top_k 64), 64 muestras concurrentes y límite de generación de 32.768 tokens.

| Categoria | Benchmark | BF16 (nvidia) | NVFP4 (RedHatAI) | Recuperacion |
|---|---|---|---|---|
| Razonamiento | GSM8K (10-shot CoT, pass@1) | 93,5% | 93,2% | 99,7% |
| Razonamiento | GPQA Diamond (0-shot, pass@1) | 59,6% | 47,0% | 78,8% |
| Razonamiento | MMLU-Pro (0-shot, pass@1) | 71,3% | 67,7% | 94,9% |

Errores estándar: GSM8K ±0,7 / ±0,7; GPQA Diamond ±3,5 / ±3,6; MMLU-Pro ±0,4 / ±0,4 puntos porcentuales. La mayor pérdida se concentra en GPQA Diamond (unos 2,4 errores estándar conjuntos por debajo de la referencia, con razonamientos algo más cortos, por lo que no es un artefacto de verbosidad); MMLU-Pro queda unos 8 errores estándar conjuntos por debajo. Todas las generaciones terminaron con parada natural, sin alcanzar el límite de 32.768 tokens. La model card del modelo base no publica cifras de GSM8K, GPQA ni MMLU-Pro, por lo que la columna BF16 es la referencia medida bajo este mismo harness.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 11,6 GB; con overhead de KV cache y activaciones para 64K de contexto, se recomienda al menos 24 GB de VRAM para uso cómodo con `--gpu-memory-utilization 0.85`.
- GPU recomendadas: NVIDIA B200 (empleada en la evaluación), H100, L40S o A100; el modelo corre en una sola GPU (`--tensor-parallel-size 1`).
- GPU de consumo: es plausible en tarjetas con 24 GB o más (RTX 4090, RTX 3090), aunque no se documenta oficialmente; la decodificación NVFP4 requiere soporte de la pila de vLLM y hardware compatible.
- Despliegue: vLLM es la vía oficial documentada, con flags concretos (`--max-model-len 65536`, `--max-num-seqs 64`, `--max-num-batched-tokens 65536`, `--tool-call-parser gemma4`, `--reasoning-parser gemma4`). Compatible con transformers y compressed-tensors. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible (no se publican cifras de latencia ni tokens por segundo).
- Para servir solo texto con este checkpoint multimodal, deben mantenerse los límites `--limit-mm-per-prompt '{"image":0,"video":0,"audio":0}'`; para imagen o audio hay que retirarlos y ajustar memoria y concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4 | 8B totales / 4B efectivos | 64K | NVFP4 (pesos y activaciones) | OpenMDW 1.1 | Hugging Face (vLLM) |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 8B totales / 4B efectivos | 64K | BF16 | OpenMDW 1.1 | Hugging Face |
| google/gemma-4-E4B-it | 8B totales / 4B efectivos | no disponible | BF16 | licencia de Gemma (no disponible en detalle) | Hugging Face |

La comparación directa más relevante es con el checkpoint BF16 del que deriva: mismo tamaño efectivo y contexto, pero 16,0 GB frente a 11,6 GB, con una recuperación de precisión del 99,7% en GSM8K, 94,9% en MMLU-Pro y 78,8% en GPQA Diamond. Frente al modelo original de Google, la diferencia principal es el post-entrenamiento de NVIDIA y el esquema de cuantización NVFP4.

## Limitaciones y advertencias

- Pérdida de precisión medible: la cuantización NVFP4 degrada GPQA Diamond de 59,6% a 47,0% (recuperación del 78,8%), una caída sustancial para tareas de razonamiento científico de alta dificultad. MMLU-Pro baja 3,6 puntos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Gemma-4, hereda los sesgos del modelo original, no evaluados aquí.
- Alucinación: no se publican métricas de factualidad ni tasas de alucinación; el modo thinking puede producir trazas de razonamiento plausibles pero incorrectas.
- Idiomas: no se especifica la cobertura lingüística del checkpoint; no asumir paridad con el modelo base sin verificación.
- Licencia: OpenMDW 1.1 (`license: other`) impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- Dependencia de hardware y software: la inferencia NVFP4 está ligada a vLLM y a GPUs compatibles; no hay soporte documentado para otros runtimes, lo que limita la portabilidad.
- Multimodalidad condicionada: para servir solo texto hay que limitar explícitamente las modalidades; la configuración por defecto de los ejemplos asume ese recorte.
- Madurez: el repositorio tiene 154 descargas y 0 likes en el momento de la consulta, con publicación reciente (noviembre de 2026); conviene validar en el propio entorno antes de adoptarlo.
- El modelo base lista GSM8K entre sus datasets de post-entrenamiento, lo que puede inflar esa métrica en comparación con evaluaciones externas.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Inspect (harness de evaluación): https://github.com/UKGovernmentBEIS/inspect
- README del repositorio: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4/blob/main/README.md
