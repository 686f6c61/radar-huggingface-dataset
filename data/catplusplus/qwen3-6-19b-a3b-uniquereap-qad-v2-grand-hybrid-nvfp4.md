# catplusplus/Qwen3.6-19B-A3B-UniqueREAP-QAD-v2-Grand-Hybrid-NVFP4

## Resumen

Qwen3.6-19B-A3B-UniqueREAP-QAD-v2-Grand-Hybrid-NVFP4 es una compresión estructural y cuantización mixta del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario catplusplus en Hugging Face. El modelo base es un transformer MoE de 40 capas con atención híbrida (3:1 Gated DeltaNet + Full Attention), 256 expertos enrutados más un experto compartido, visión nativa (ViT de 27 capas) y Multi-Token Prediction (MTP). La release reduce el modelo de 35B a 18,99B parámetros (19,43B incluyendo MTP) mediante poda de expertos y cuantización NVFP4/FP8, manteniendo el presupuesto de cómputo activo de ~3,0B del esquema A3B original (top_k=8 más experto compartido).

El objetivo declarado es ejecutar el modelo en una única GPU consumer Blackwell de 16 GB (RTX 5060 Ti, sm_120) a 96,74 tok/s con 74.472 tokens de caché KV en FP8 (contexto single-stream de 64K), preservando tool calling XML nativo (formato OpenCode), precisión de código, bilingualismo inglés-japonés y visión. La release combina tres etapas: poda estructural Unique-REAP (256 a 128 expertos enrutados por capa), destilación QAD-LoRA con pérdida KL pura contra el profesor BF16 de 35B, y cuantización mixta con compressed-tensors que mantiene en BF16 las partes sensibles (lm_head, embeddings, vision, routers, gates recurrentes, MTP) y comprime el resto en FP8 W8A8 y NVFP4 W4A4.

Es relevante ahora porque demuestra una ruta reproducible para servir modelos MoE multimodales grandes en hardware consumer de gama media-alta, con scripts de creación, perfilado, destilación, cuantización y evaluación incluidos en el repositorio, y kernels nativos Blackwell verificados en vLLM sin emulación Marlin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 40 capas con proporción 3:1 de Gated DeltaNet + Full Attention; 128 expertos enrutados por capa (tras poda, originalmente 256) + 1 experto compartido; visión nativa (ViT de 27 capas); Multi-Token Prediction (MTP) |
| Parametros totales | 11.340.158.320 según safetensors del repo; 18,99B según la model card (19,43B incluyendo MTP con formas ajustadas en BF16) |
| Parametros activos | ~3,0B (top_k=8 + experto compartido) |
| Longitud de contexto | Hasta 65.536 tokens verificados en 16 GB (74.472 tokens de caché KV FP8 disponibles) |
| Tipos de cuantizacion | Mixta: BF16 (lm_head, embed_tokens, visual, shared_expert, routers, gates DeltaNet, MTP), FP8 W8A8 (expertos frontera L00 y L39, proyecciones lineales de Attention/DeltaNet), NVFP4 W4A4 con group_size=16 (expertos enrutados L01..L38) |
| Idiomas soportados | No disponible (la model card menciona bilingualismo inglés-japonés verificado en evaluación, sin lista formal de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con compressed-tensors; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE híbrida de 40 capas que alterna en proporción 3:1 entre capas Gated DeltaNet (atención linear recurrente) y capas de Full Attention, con 256 expertos enrutados más un experto compartido por capa, visión nativa mediante un ViT de 27 capas y cabecera MTP. La release aplica tres etapas de compresión. Primero, Unique-REAP poda los expertos enrutados de 256 a 128 por capa mediante perfilado de matrices de Gram de salida por dominio con forma exacta [40, 4, 256, 256], eliminación greedy por complemento de Schur hacia atrás y un mecanismo de protección de tokens pico (Peak-Token Hero Shield), preservando el presupuesto de cómputo activo del esquema A3B. Segundo, una destilación QAD-LoRA congela los 128 expertos enrutados (ajustados in-place a NVFP4 E2M1 con block_size=16 durante el entrenamiento) y entrena únicamente adaptadores LoRA de rango 32 sobre Full Attention, Gated DeltaNet, shared_expert y routers FP32, destilando contra las log-probabilidades Top-32 del profesor BF16 de 35B con ce_weight=0.0 sobre 1.024 trayectorias multimodales y de tool calling XML nativo estratificadas. Tercero, la cuantización Grand-Hybrid con compressed-tensors mantiene en BF16 las componentes sensibles y comprime el resto en FP8 y NVFP4.

La innovación técnica destacable es la combinación de poda guiada por Gram matrices con destilación KL pura libre de sobreajuste y cuantización mixta consciente de NVFP4, verificada con kernels nativos Blackwell en vLLM 0.29.1rc1: FLASHINFER_CUTLASS NvFp4 MoE para expertos NVFP4, TRITON FP8 MoE para expertos FP8, CutlassFP8 para Attention, Triton/FLA GDN prefill más CUDA GDN decode para DeltaNet, TRITON_ATTN con KV FP8 y FlashInfer top-p/top-k para muestreo. No se habilita decodificación especulativa en las mediciones reportadas.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Razonamiento y coding agéntico con tool calling XML nativo (formato OpenCode, parser qwen3_coder en vLLM), incluyendo llamadas espontáneas sin tool_choice=required.
- Comprensión multimodal de imágenes: captioning de fotos (evaluado con COCO) y OCR/translation de manga japonés.
- Traducción y matices lingüísticos inglés-japonés.
- Algoritmia y resolución de problemas de código con trampas de rutas verbatim (src/ vs source/).
- Soporte de agentes y razonamiento multi-step mediante tool calling estructurado compatible con OpenAI.
- Capacidad de visión nativa vía ViT de 27 capas mantenido en BF16.
- Multi-Token Prediction (MTP) para decodificación acelerada, empaquetado en BF16.
- Compatibilidad con endpoints y despliegue en vLLM con kernels Blackwell nativos.

## Casos de uso

- Asistente de coding agéntico en local: el modelo ejecuta tool calling XML nativo (por ejemplo, `<tool_call><function=bash>{"command": "ls ~/Nikola/src/kotoba"}</function></tool_call>`) parseado a tool_calls OpenAI por vLLM, lo que permite integrarlo en flujos OpenCode sobre una RTX 5060 Ti de 16 GB con 96,74 tok/s sostenidos.
- Atención al cliente multilingüe inglés-japonés: la ventana de 65.536 tokens y 74.472 tokens de KV FP8 permiten conversaciones multi-turno largas con historial extenso en un solo stream.
- Procesamiento de documentación técnica con OCR y traducción: el ViT de 27 capas en BF16 y las capacidades de OCR de manga/fotos COCO permiten extraer texto de imágenes y traduccirlo, útil para digitalización de material japonés.
- Generación de código en pipelines CI/CD: el tool calling estructurado y la precisión de código preservada tras QAD-LoRA (PPL en_to_code de 3,93) permiten automatizar parches y comandos de shell en entornos de integración.
- Despliegue edge o estación de trabajo con GPU consumer: 13,08 GiB de VRAM en carga y 6,85 s de tiempo de carga hacen viable servir el modelo en una única RTX 5060 Ti para prototipado e inferencia local.
- Evaluación de investigación sobre compresión de MoE: los scripts de perfilado Gram, destilación QAD-LoRA, cuantización y evaluación incluidos en `./extras/` permiten reproducir y auditar el pipeline sobre el modelo base Qwen3.6-35B-A3B.
- Transcripción y análisis de imágenes en flujos agentic: la combinación de visión nativa y tool calling permite agentes que inspeccionan capturas y ejecutan acciones estructuradas en un mismo turno.

## Benchmarks y rendimiento

Datos reportados en la model card sobre el split held-out estratificado `eval_128_v2.jsonl` (prosa inglesa, inglés a código con tools XML nativos, aprendizaje/traducción japonés, visión cotidiana) y una suite de estrés de 9 prompts con OpenCode y Everyday-IRL:

| Etapa / Checkpoint | Params (Main / Active) | PPL global held-out | PPL en_to_code | VRAM live 16 GB / KV FP8 libre | Velocidad sostenida coding | Suite de estrés 9 prompts |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| Unique-REAP v2 Pre-LoRA (BF16) | 18,99B / ~3,0B | 14,05 | 8,37 | — | — | 8/9 (ambos tests espontáneos de tool_call pasan) |
| Unique-REAP v2 + Pure-KL QAD-LoRA (BF16) | 18,99B / ~3,0B | 8,06 | 3,93 | — | — | 9/9 (KL Top-32 del profesor bajó de 0,4379 a 0,2470, -43,6%) |
| Esta release: Grand-Hybrid NVFP4 (vLLM live en RTX 5060 Ti 16 GB) | 18,99B (19,43B con MTP) / ~3,0B | — | — | 13,08 GiB / 74.472 tokens (1,01 GiB) | 96,74 tok/s | 9/9 |

Telemetría de hardware y kernels en RTX 5060 Ti sm_120 con vLLM 0.29.1rc1: carga del modelo en 13,08 GiB de VRAM en 6,85 s (4,34 s de lectura de pesos, 10,60 s de inicialización completa incluyendo 1,51 s de compilación), 0,21 GiB de activación pico y 0,04 GiB de pool CUDAGraph para tamaños [1, 2]. Caché KV FP8 disponible de 1,01 GiB equivalente a 74.472 tokens (2,27 veces concurrencia a 32.768 tokens, soporta `--max-model-len 65536`). Decodificación sostenida de coding con prompt de caché LRU de 320 tokens a 96,74 tok/s sin decodificación especulativa. En el test `opencode_spontaneous_tool_short` con 347 tokens de prompt se alcanzaron 83,54 tok/s con tool_call XML limpio parseado a tool_calls estructurados.

## Requisitos de hardware

- VRAM estimada para inferencia: 13,08 GiB en la configuración Grand-Hybrid NVFP4 verificada (13,91 GB de pesos principales más 883 MB de MTP en disco).
- GPU recomendadas: RTX 5060 Ti (sm_120, 16 GB) como objetivo verificado; cualquier GPU Blackwell con 16 GB o más debería poder cargar la release con los kernels nativos NVFP4/FP8.
- Cabe en GPU consumer: sí, verificado en RTX 5060 Ti de 16 GB con contexto hasta 65.536 tokens.
- Opciones de despliegue: vLLM 0.29.1rc1 con kernels FLASHINFER_CUTLASS NvFp4 MoE, TRITON FP8 MoE, CutlassFP8, Triton/FLA GDN prefill, CUDA GDN decode, TRITON_ATTN y FlashInfer top-p/top-k; también transformers por library_name.
- Latencia y throughput: 96,74 tok/s sostenidos en decodificación de coding (prompt de 320 tokens, sin decodificación especulativa); 83,54 tok/s en el test de tool calling espontáneo con 347 tokens de prompt; carga del modelo en 6,85 s.
- Caché KV: 1,01 GiB en FP8 para 74.472 tokens; concurrencia de 2,27 veces a 32.768 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros (total / activo) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta release (Qwen3.6-19B-A3B UniqueREAP QAD NVFP4) | 18,99B (19,43B con MTP) / ~3,0B | 65.536 tokens verificados | PPL global 8,06, PPL en_to_code 3,93 (BF16 QAD-LoRA); 96,74 tok/s en RTX 5060 Ti 16 GB | Apache 2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B / ~3,0B | No disponible en la información | Profesor BF16 de referencia para destilación KL Top-32 | Apache 2.0 | Hugging Face |
| Unique-REAP v1 (128×512 BF16, comparación interna) | No disponible | No disponible | PPL global 14,58, Code KL 0,559, 6/7 en suite de estrés; v1 QAD-LoRA: PPL 5,77, Code KL 0,370 | Apache 2.0 | Referencia interna en la model card |
| Unique-REAP v2 Pre-LoRA (BF16) | 18,99B / ~3,0B | No disponible | PPL global 14,05, PPL en_to_code 8,37, 8/9 en suite de estrés | Apache 2.0 | Referencia interna en la model card |

No se dispone en la información proporcionada de comparaciones con modelos externos de la misma categoría (otros MoE multimodales comprimidos o alternativas de 19B activas ~3B).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no se reportan métricas específicas de factualidad; la evaluación se limita a PPL, tool calling, código, traducción y visión, sin benchmarks de veracidad.
- Limitaciones de contexto o idioma: contexto máximo verificado de 65.536 tokens en 16 GB; la model card menciona bilingualismo inglés-japonés pero no se publica lista formal de idiomas soportados, por lo que el rendimiento en otros idiomas es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar del modelo base Qwen/Qwen3.6-35B-A3B conviene revisar las condiciones del modelo original.
- Caveats para producción: la release es una compresión agresiva (poda de 256 a 128 expertos y cuantización NVFP4/FP8) que puede degradar capacidades no cubiertas por el split de evaluación; los kernels requieren GPU Blackwell (sm_120) y vLLM 0.29.1rc1 para aprovechar NVFP4 nativo, sin emulación Marlin; no se habilita decodificación especulativa en las mediciones; el repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria independiente; el recuento de parámetros en safetensors (11,34B) difiere del reportado en la model card (18,99B), probablemente por empaquetado comprimido, y debe verificarse antes de desplegar.
- Dependencia de parches: la model card indica que los parches locales de vLLM están empaquetados en `./extras/`, lo que implica que la configuración exacta puede no funcionar en versiones estándar de vLLM sin aplicarlos.

## Enlaces

- Hugging Face: https://huggingface.co/catplusplus/Qwen3.6-19B-A3B-UniqueREAP-QAD-v2-Grand-Hybrid-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Transcripciones de evaluación: `./extras/results/nvfp4_v2_16gb_vllm_eval.json` (referenciado en la model card)
- Scripts y notebook: `./extras/` (referenciado en la model card)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
