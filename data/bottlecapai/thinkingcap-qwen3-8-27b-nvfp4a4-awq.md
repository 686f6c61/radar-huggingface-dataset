# bottlecapai/ThinkingCap-Qwen3.8-27B-NVFP4A4-AWQ

## Resumen

ThinkingCap-Qwen3.8-27B-NVFP4A4-AWQ es una cuantización NVFP4 (W4A4) del modelo ThinkingCap-Qwen3.8-27B, un ajuste fino sobre Qwen3.8-27B desarrollado por BottleCap AI. La cuantización la ha producido también bottlecapai mediante llm-compressor y se distribuye en el formato compressed-tensors que vLLM carga de forma nativa. El repositorio ocupa 23,4 GB en disco frente a los aproximadamente 56 GB del modelo bf16 de origen, y el checkpoint declara 20.294.595.312 parámetros en safetensors.

El modelo es multimodal (pipeline image-text-to-text), con torre de visión, y su arquitectura es híbrida de atención lineal Gated-DeltaNet combinada con self-attention. Incorpora además una cabeza MTP (multi-token prediction, tipo NextN) que permite decodificación especulativa autoinducida sin necesidad de descargar un modelo borrador. La longitud de contexto nativa es de 262.144 tokens.

Su relevancia actual es doble: por un lado demuestra un esquema de cuantización mixta 4 bits/FP8 que preserva la precisión en las proyecciones donde una cuantización uniforme de 4 bits degradaría el modelo; por otro, es un caso práctico de cuantización W4A4 (pesos y activaciones en FP4) que solo alcanza los tensor cores FP4 en hardware Blackwell (sm_100/sm_120). Los resultados publicados por el autor muestran pérdidas de precisión de entre −1,3 y +0,2 puntos porcentuales respecto al bf16 en los benchmarks comparados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal Gated-DeltaNet y self-attention, más torre de visión y cabeza MTP (NextN) |
| Parametros totales | 20.294.595.312 (dato real de safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE en la informacion disponible) |
| Longitud de contexto | 262.144 tokens nativos; el ejemplo de servicio usa 49.152 como valor por defecto económico |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones FP4) con suavizado AWQ: 168 capas lineales en 4 bits; 233 capas en FP8 per-tensor W8A8; 96 capas en bf16; torre de visión y cabeza MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | polyform-small-business-1.0.0 (etiquetada como "other"), con acceso restringido mediante formulario (gated) |
| Formato de pesos | safetensors en formato compressed-tensors (vLLM), 23,4 GB en disco |

## Arquitectura y entrenamiento

La información disponible describe el checkpoint cuantizado, no el proceso de entrenamiento del modelo base. Lo que sí se detalla es la arquitectura sobre la que se aplica la cuantización: un modelo con capas de atención lineal Gated-DeltaNet (con proyecciones anchas `in_proj_qkv`, `in_proj_z`, `out_proj` y compuertas de entrada estrechas de 48 dimensiones, `in_proj_a` / `in_proj_b`) combinadas con self-attention convencional, además de una torre de visión y una cabeza MTP. El modelo base es un ajuste fino de Qwen3.8-27B, y la plantilla de chat admite modo "thinking" con un nivel de esfuerzo de razonamiento por defecto (`xhigh`).

La innovación técnica destacable está en el plan de cuantización. Antes de redondear, los pesos se suavizaron con AWQ (activation-aware quantization). En lugar de aplicar 4 bits de forma uniforme, se usó una distribución mixta: NVFP4 en las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) de todas las capas salvo las 8 últimas (168 capas), FP8 per-tensor W8A8 en self-attention (`q/k/v/o_proj`), en las proyecciones anchas de Gated-DeltaNet, en las MLP de las 8 últimas capas y en `lm_head` (233 capas). Las 96 capas restantes, correspondientes a las dos compuertas de entrada estrechas de cada capa de atención lineal, se mantienen en bf16 porque miden 48 dimensiones (no múltiplo del tamaño de tile del kernel de 4 bits) y se fusionan a anchura 96 en tiempo de servicio, de modo que cuantizarlas rompería la carga. El razonamiento del autor es que attention y atención lineal son precisamente donde una cuantización plana de 4 bits pierde exactitud, y que FP8 cuesta poca memoria adicional a esa proporción de pesos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en modo "thinking", con parser de razonamiento `qwen3` soportado en vLLM.
- Procesamiento de imagen y texto (pipeline image-text-to-text); la torre de visión se conserva en bf16 y funciona desde este repositorio.
- Tool calling / function calling: el ejemplo de servicio activa `--enable-auto-tool-choice` con `--tool-call-parser qwen3_xml`.
- Decodificación especulativa mediante la propia cabeza MTP del modelo (`{"method":"mtp","num_speculative_tokens":3}`), sin modelo borrador externo.
- Manejo de prompts muy largos: el benchmark AA-LCR se evaluó con prompts de entre 89.000 y 123.000 tokens.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingües: no disponible.
- Otras capacidades especiales (audio, etc.): no disponible.

## Casos de uso

- Despliegue de inferencia multimodal de alta concurrencia en hardware Blackwell: gracias a sus 23,4 GB en disco y a las activaciones FP4, permite servir un modelo de ~20.000 millones de parámetros con torre de visión en una única GPU RTX PRO 6000, B200 o GB200, con `--max-num-seqs 32` como punto de partida razonable.
- Asistentes con contexto documental largo: la ventana nativa de 262.144 tokens permite introducir contratos, expedientes o bases de código extensas en una sola pasada, subiendo `--max-model-len` por encima del valor frugal de 49.152 cuando la memoria lo permita.
- Agentes con uso de herramientas: el soporte de tool calling con parser `qwen3_xml` y el modo de razonamiento permiten construir flujos multi-paso donde el modelo decide qué función invocar y encadena resultados.
- Reducción de coste en pipelines ya existentes sobre ThinkingCap-Qwen3.8-27B: al mantener la misma plantilla de chat, los mismos parámetros de muestreo (temperature 1.0, top_p 0.95, top_k 20, min_p 0.0) y una precisión muy cercana, puede sustituir al bf16 bajando de ~56 GB a 23,4 GB de pesos.
- Generación acelerada con decodificación especulativa: activando la cabeza MTP se reduce el coste por token en generaciones largas, algo relevante en cargas de razonamiento donde la mediana de tokens generados ronda los 1.000-1.200 y el p95 supera los 38.000.
- Análisis de imágenes con razonamiento asociado: tareas de inspección, interpretación de capturas o gráficos donde se necesita respuesta textual razonada sobre una entrada visual (evaluado en RealWorldQA).
- Investigación en cuantización: el checkpoint es un caso de estudio reproducible de cuantización mixta NVFP4 + FP8 con AWQ sobre una arquitectura híbrida de atención lineal, útil para comparar planes de cuantización alternativos.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan el build NVFP4A4-AWQ con el modelo bf16 de origen usando las mismas preguntas y semillas, decodificación muestreada (temperature 1.0, top_p 0.95, top_k 20, min_p 0.0), límite de generación de 65.536 tokens y vLLM 0.29.0. Las respuestas de este build se generaron en una RTX PRO 6000 Blackwell y las de referencia bf16 en una H200.

| Benchmark (preguntas × semillas) | Precisión bf16 | Precisión NVFP4A4-AWQ | Δ precisión (pp) | Tokens medios bf16 → cuantizado |
|---|---|---|---|---|
| RealWorldQA (765 × 2) | 83,1 % | 81,8 % | −1,3 [−2,9, +0,3] | 488 → 506 (+3,7 %) |
| GPQA-Diamond (198 × 4) | 88,0 % | 86,7 % | −1,3 [−3,6, +1,1] | 7.115 → 7.176 (+0,9 %) |
| MMLU-Pro (1.500 × 1) | 84,1 % | 84,3 % | +0,2 [−1,1, +1,5] | 1.436 → 1.487 (+3,5 %) |
| IFBench (300 × 2) | no disponible | no disponible | no disponible | no disponible |
| AA-LCR (100 × 1, prompts de 89k-123k tokens) | no disponible | no disponible | no disponible | no disponible |

Desglose de tokens por benchmark en el build cuantizado: RealWorldQA 506 medios / 114 medianos / 2.093 en p95; GPQA-Diamond 7.176 / 1.156 / 38.429; MMLU-Pro 1.487 / 177 / 7.068. La tabla original incluye también el Δ de tokens medianos (+1,8 % en RealWorldQA, +12,1 % en GPQA-Diamond). Los resultados de IFBench y AA-LCR no aparecen en la información proporcionada, aunque sí se documenta la metodología (AA-LCR se calificó con Gemma-4-26B-A4B-it con el modo thinking desactivado). No se han publicado resultados de benchmarks adicionales para este checkpoint en la información disponible.

## Requisitos de hardware

- Requiere GPU Blackwell (sm_100 / sm_120): RTX PRO 6000, B200 o GB200. Pesos y activaciones son FP4, que es lo que llega a los tensor cores FP4; vLLM sirve este checkpoint mediante `CutlassNvFp4LinearKernel`. Las cifras del autor se obtuvieron en una RTX PRO 6000.
- En GPUs que no sean Blackwell, el autor recomienda servir la variante NVFP4 (4 bits en pesos, 16 bits en activaciones) en lugar de este build.
- VRAM estimada: 23,4 GB solo de pesos, más caché de estados (una bloque de state cache por secuencia de decodificación), KV cache, torre de visión en bf16 y cabeza MTP en bf16. No se publica una cifra de VRAM total en la información disponible.
- Compatibilidad con GPU de consumo: no disponible. El único hardware confirmado es profesional/datacenter Blackwell.
- Opciones de despliegue: vLLM (probado con la versión 0.29.0), mediante la línea `vllm serve bottlecapai/ThinkingCap-Qwen3.8-27B-NVFP4A4-AWQ`; el ecosistema de cuantizaciones de este modelo incluye además versiones GGUF para llama.cpp, MLX para Apple silicon y NVFP4, según la colección del autor. No se menciona soporte de TGI ni Ollama para este checkpoint concreto.
- Nota de configuración crítica: hay que fijar `--max-num-seqs 32` (el valor por defecto de vLLM, 1024, desborda los bloques de state cache de este modelo híbrido Gated-DeltaNet y aborta la captura de CUDA graphs).
- Nota de configuración crítica para decodificación especulativa: al usar MTP hay que fijar explícitamente `"attention_backend":"TRITON_ATTN"` en `--speculative-config`. Si se deja sin definir, vLLM elige FlashInfer para la cabeza MTP, cuyo umbral de reordenación de batch (1) se toma como mínimo frente al backend Triton del modelo híbrido (4), las filas de decodificación quedan tras chunks de prefill en curso, las ranuras de estado especulativo nunca se inicializan y las generaciones largas degeneran en repeticiones de palabras funcionales de forma silenciosa y sin error (vLLM issue #55894).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / precisión | Tamaño en disco | Contexto | Licencia | Hardware |
|---|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-NVFP4A4-AWQ (este) | 20,29 B (safetensors) | NVFP4 W4A4 + FP8 + bf16, compressed-tensors | 23,4 GB | 262.144 tokens | polyform-small-business-1.0.0 (gated) | Blackwell sm_100/sm_120 |
| ThinkingCap-Qwen3.8-27B (base) | no disponible | bf16 | ≈56 GB | 262.144 tokens | polyform-small-business-1.0.0 (gated) | GPU con soporte bf16 |
| ThinkingCap-Qwen3.8-27B-NVFP4 | no disponible | NVFP4 (4 bits pesos, 16 bits activaciones) | no disponible | 262.144 tokens | polyform-small-business-1.0.0 (gated) | GPUs no Blackwell incluidas |
| ThinkingCap-Qwen3.8-27B-GGUF | no disponible | GGUF cuantizado | no disponible | no disponible | polyform-small-business-1.0.0 (gated) | CPU / GPU vía llama.cpp |
| ThinkingCap-Qwen3.8-27B (MLX) | no disponible | MLX | no disponible | no disponible | polyform-small-business-1.0.0 (gated) | Apple silicon |

No se dispone en la información proporcionada de comparativas frente a modelos de otros fabricantes con el mismo tamaño o la misma tarea.

## Limitaciones y advertencias

- Pérdida de precisión medible frente al bf16: −1,3 puntos en RealWorldQA y GPQA-Diamond, con intervalos de confianza que rozan el cero; el +0,2 de MMLU-Pro está dentro del ruido y no debe interpretarse como una mejora.
- Dependencia estricta de hardware Blackwell. En cualquier GPU anterior, este checkpoint no aprovecha los tensor cores FP4 y el autor desaconseja su uso, remitiendo a la variante NVFP4.
- La cuantización mixta deja 96 capas en bf16 por motivos de kernel; modificarlas o intentar un plan de 4 bits uniforme rompe la carga del modelo.
- Riesgo de degradación silenciosa en decodificación especulativa si no se fija el backend de atención Triton en la cabeza MTP: aparecen repeticiones de palabras funcionales sin ningún error en los logs.
- El valor por defecto de `--max-num-seqs` de vLLM provoca un fallo de captura de CUDA graphs en esta arquitectura híbrida; es imprescindible ajustarlo.
- Licencia Polyform Small Business 1.0.0 con acceso restringido mediante formulario (nombre, empresa, correo). Es una licencia de tipo "other" con condiciones específicas para uso comercial: hay que revisar el archivo LICENSE antes de integrarlo en producto. El autor menciona versiones enterprise adicionales.
- No hay información publicada sobre idiomas soportados, sesgos conocidos ni tasas de alucinación específicas de este ajuste fino.
- El recuento real de parámetros de safetensors (20,29 B) no coincide con el "27B" del nombre; la información disponible no explica esta discrepancia.
- Los benchmarks publicados mezclan hardware distinto entre el build cuantizado (RTX PRO 6000) y la referencia bf16 (H200), lo que introduce un factor de confusión no controlado.
- No se publican cifras de latencia, throughput ni VRAM total necesaria en producción.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-NVFP4A4-AWQ
- Modelo base bf16: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Variante NVFP4 (W4A16): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-NVFP4
- Variante GGUF para llama.cpp: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF
- Perfil de la organización: https://huggingface.co/bottlecapai
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- compressed-tensors (formato de pesos): https://github.com/neuralmagic/compressed-tensors
- Issue de vLLM #55894 (degradación con FlashInfer en la cabeza MTP): https://github.com/vllm-project/vllm/issues/55894
- Formulario de solicitud de acceso: https://docs.google.com/forms/d/e/1FAIpQLSdU8MyVP_mVx0_y55d6QCMXVyCKsQ6yg68KEqWm_EIptKB0Nw/viewform
