# elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean

## Resumen

Qwen3.8-Flash-Next-NVFP4-Coder-Lean es una derivación podada y orientada a lenguaje y código del checkpoint multimodal `nvidia/Qwen3.8-Flash-Next-NVFP4`, publicada por el usuario elisepaul en Hugging Face. El modelo base es un MoE de aproximadamente 119,6B parámetros con 512 microexpertos enrutados más un experto compartido, del que se activan 10 expertos enrutados por token. La derivación conserva todo el enrutamiento MoE y los pesos de lenguaje, pero elimina las proyecciones de visión y el shard auxiliar de N-gram Prediction Layer Embedding (PLE) de 51,2 GB, reduciendo la huella cargada en memoria de 123,5 GiB a 74,91 GiB.

El objetivo declarado es el despliegue en un único nodo NVIDIA DGX Spark (GB10, 128 GiB de memoria unificada LPDDR5x) con cero swap del sistema operativo. Para ello combina cuantización NVFP4 (W4A16) en las capas MoE, restauración de las capas densas en MXFP8 nativo, y un cabezal de Multi-Token Prediction (MTP) residente en memoria que actúa como proponente de decodificación especulativa, con aceleraciones medidas de 2,6× a 3,9×.

Es relevante ahora porque demuestra una receta de serving de producción para hardware Blackwell de memoria unificada, con cifras concretas de throughput (24,4–36,0 tok/s en un solo stream y hasta 202,3 tok/s agregados con 8 streams) y análisis de caché de prefijo (92,5% de aciertos en turnos de agente conversacional). El repositorio ocupa 83,7 GB y acumula 153 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida GDN (linear attention recurrente) y capas MoE; incluye cabezal MTP para decodificación especulativa |
| Parametros totales | 131.744.657.299 (según safetensors); el modelo base se describe como MoE de ~119,6B |
| Parametros activos | 10 expertos enrutados + 1 compartido por token (sobre 512 microexpertos enrutados) |
| Longitud de contexto | Hasta 262k–1M tokens de KV cache según memoria libre (22–32 GiB de headroom); no se especifica el máximo nativo de contexto |
| Tipos de cuantizacion | NVFP4 (W4A16) en capas MoE; MXFP8 (`float8_e4m3fn`) en capas densas (`linear_attn`, `self_attn`, `shared_expert`); MTP en NVFP4 |
| Idiomas soportados | en, zh, code |
| Licencia | nvidia-open-model-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (11 shards, 74,91 GiB); librería vLLM |

## Arquitectura y entrenamiento

El modelo es una poda arquitectónica del checkpoint `nvidia/Qwen3.8-Flash-Next-NVFP4`, no un reentrenamiento: mantiene paridad bit a bit con los pesos de lenguaje del modelo fundacional, conservando los 10 expertos enrutados activos más el compartido por token. La arquitectura combina capas MoE con atención lineal GDN (estado recurrente), lo que permite gestionar cachés KV de contexto largo (hasta 262k–1M tokens) con la memoria libre tras cargar los pesos. Se eliminan las proyecciones multimodales y la tabla PLE de 51,2 GB, y se restauran 744 tensores de proyección densa en MXFP8 nativo, lo que reduce las lecturas del bus de memoria de 7,5 GB/token a ~2,6 GB/token.

La innovación principal es la integración de un proponente MTP residente en hardware: 4.637 tensores MTP (512 expertos × proyecciones gate/up/down, 1,60 GB) extraídos del modelo upstream e injertados en `mtp-graft.safetensors` en NVFP4 nativo sin pérdida de recuantización, con mapeos explícitos `W4A16_NVFP4` para `mtp.layers.*.mlp.experts` que corrigen un fallo de inicialización del motor vLLM (`no parameter 'w2_weight_scale'`). No se dispone de información sobre el volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y código: el alcance declarado es modelado de lenguaje dedicado, generación de código y flujos de agente para desarrolladores.
- Razonamiento y capacidad MoE completa: conserva los 10 expertos enrutados más el compartido, manteniendo la distribución de razonamiento del modelo fundacional.
- Decodificación especulativa con MTP: proponente residente en memoria con tasas de aceptación de borradores del 97,5% en contexto largo (32k) y 99,1% en appends de 32k.
- Soporte multilingüe limitado a inglés, chino y código.
- Contexto largo: gestión de KV cache de 262k–1M tokens mediante atención lineal híbrida GDN.
- Serving multi-stream: ejecución concurrente de 2 a 8 streams sobre el bus LPDDR5x compartido.
- Caché de prefijo: análisis de chunking del estado recurrente GDN con `--max-num-batched-tokens 1024`, que rinde un 92,5% de aciertos en turnos de agente conversacional.
- Capacidades multimodales (visión): no disponibles en esta derivación, por poda explícita de las proyecciones de visión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Serving en un único DGX Spark: la receta está diseñada para cargar 74,91 GiB en 128 GiB de memoria unificada con cero swap, dejando 22–32 GiB para KV cache; es el escenario para el que se publicó el modelo.
- Asistente de código en IDE con contexto de repositorio: con 32k de contexto alcanza 36,01 tok/s en un solo stream y 97,5% de aceptación de borradores MTP, adecuado para navegación de repositorios y autocompletado de fragmentos largos.
- Agentes de resolución de issues (SWE-bench): el modelo declara el dataset `princeton-nlp/SWE-bench_Lite` y está orientado a flujos de agente de varios pasos; el caché de prefijo al 92,5% en turnos conversacionales reduce el coste de reenviar el historial.
- Servicio multi-usuario en un solo nodo: con 4–8 streams agregados alcanza 83,63–202,31 tok/s, suficiente para un equipo pequeño de desarrolladores compartiendo un GB10.
- Generación de código en pipelines de CI/CD: la decodificación especulativa con MTP y la ventana de contexto larga permiten procesar diffs y repositorios completos en tareas de revisión automatizada.
- Prototipado e investigación en hardware Blackwell: sirve como banco de pruebas para cuantización NVFP4/MXFP8, FlashInfer CUTLASS y decodificación especulativa en memoria unificada LPDDR5x.
- Despliegue de agentes conversacionales multi-turno: la combinación de caché de prefijo y contexto largo reduce la latencia en conversaciones con historial extenso, aunque limitado a inglés, chino y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos numéricos son de rendimiento de serving:

| Metrica | Valor medido | Detalle |
|---|---|---|
| Decode single-stream, contexto corto (~80 tokens) | 25,25 tok/s | 2,64× frente a autoregresivo puro |
| Decode single-stream, contexto 32k | 36,01 tok/s | 3,88× de aceleración; 97,5% de aceptación MTP |
| Decode agregado 2 streams, contexto corto | 57,90 tok/s | 28,95 tok/s por stream |
| Decode agregado 2 streams, contexto 32k | 70,19 tok/s | 35,09 tok/s por stream; 99,1% de aceptación |
| Decode agregado 4–8 streams | 83,63–202,31 tok/s | Escalado lineal hasta 8 streams |
| Aciertos de caché de prefijo | 92,5% | Con `--max-num-batched-tokens 1024` en turnos de agente |
| Huella en memoria | 74,91 GiB | 11 shards; 0 bytes de swap |

## Requisitos de hardware

- VRAM/memoria estimada: 74,91 GiB de pesos residentes; se recomiendan al menos 128 GiB de memoria unificada para dejar 22–32 GiB de headroom para KV cache.
- GPU objetivo: NVIDIA DGX Spark / GB10 (Blackwell, 128 GiB LPDDR5x unificada). El modelo está etiquetado para single-node, one-spark y unified-memory.
- GPU consumer: no se documenta compatibilidad con RTX 4090 u otras GPU consumer; el formato NVFP4 y la receta vLLM/FlashInfer están orientados a Blackwell.
- Despliegue: vLLM con FlashInfer CUTLASS para NVFP4; se requieren los mapeos `W4A16_NVFP4` en `config.json` y `hf_quant_config.json` para el MTP. No se mencionan llama.cpp, Ollama ni TGI.
- Throughput: 24,4–36,0 tok/s en un stream y 57,9–202,3 tok/s agregados según número de streams y longitud de contexto.
- Aceleración: MTP speculative decoding con 2,6×–3,9× de speedup frente a decodificación autoregresiva pura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-Coder-Lean | 131,7B totales (MoE, 10+1 activos) | 262k–1M (KV cache) | NVFP4 + MXFP8 | nvidia-open-model-license | Hugging Face, vLLM |
| nvidia/Qwen3.8-Flash-Next-NVFP4 (base) | ~119,6B MoE | No disponible | NVFP4 | nvidia-open-model-license | Hugging Face |
| hfsameh/Qwen3.8-Flash-Next-NVFP4-Coder-Lean-MTP | No disponible | No disponible | NVFP4 | No disponible | Hugging Face |

No se dispone de datos de benchmarks de calidad ni de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Sin capacidades multimodales: las proyecciones de visión y el shard PLE fueron eliminados deliberadamente; no puede procesar imágenes ni tareas que dependan de esa tabla.
- Idiomas limitados a inglés, chino y código; el rendimiento en castellano no está documentado.
- No hay benchmarks de calidad publicados (MMLU, HumanEval, SWE-bench resuelto), por lo que no se puede verificar la degradación frente al modelo base más allá de la paridad declarada en pesos de lenguaje.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia `nvidia-open-model-license`: es necesario revisar sus términos para uso comercial, redistribución y despliegue en producción; Hugging Face la etiqueta como "other".
- Dependencia fuerte del hardware: la receta está optimizada para GB10/DGX Spark con memoria unificada; el rendimiento en otras GPU no está validado.
- Requiere configuración manual de mapeos de cuantización para el MTP; sin ellos, el motor vLLM falla al inicializar (`no parameter 'w2_weight_scale'`).
- El contexto máximo efectivo depende de la memoria libre (22–32 GiB), no de un límite nativo documentado.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Contribución MTP de hfsameh: https://huggingface.co/hfsameh/Qwen3.8-Flash-Next-NVFP4-Coder-Lean-MTP
- Dataset SWE-bench Lite: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite
- Paper referenciado (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
